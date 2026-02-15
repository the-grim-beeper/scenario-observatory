import { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, Points, PointMaterial } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';

// ---------------------------------------------------------------------------
// Scenario data
// TODO: import { scenarios } from '../data/scenarios';
// For now, defined inline with the same shape the import will provide.
// ---------------------------------------------------------------------------

interface ScenarioNode {
  id: string;
  name: string;
  tagline: string;
  color: string;
  position: [number, number, number];
}

const SCENARIO_NODES: ScenarioNode[] = [
  {
    id: 'co-pilot-commons',
    name: 'Co-Pilot Commons',
    tagline: 'Managed disruption meets strong institutions and collective agency',
    color: '#14B8A6',
    position: [-1, 1, 1],
  },
  {
    id: 'the-panic-paradox',
    name: 'The Panic Paradox',
    tagline: 'Strong structures, but fear dominates the managed transition',
    color: '#8B5CF6',
    position: [-1, 1, -1],
  },
  {
    id: 'diy-advantage',
    name: 'DIY Advantage',
    tagline: 'Individuals thrive despite weak systems in a managed landscape',
    color: '#F59E0B',
    position: [-1, -1, 1],
  },
  {
    id: 'drift-economy',
    name: 'Drift Economy',
    tagline: 'Weak transitions and doom narratives under managed disruption',
    color: '#6366F1',
    position: [-1, -1, -1],
  },
  {
    id: 'apprenticeship-reboot',
    name: 'Apprenticeship Reboot',
    tagline: 'High disruption catalyses strong institutions and renewed purpose',
    color: '#10B981',
    position: [1, 1, 1],
  },
  {
    id: 'sheltered-stagnation',
    name: 'Sheltered Stagnation',
    tagline: 'Strong walls, dark skies — protection without progress',
    color: '#F43F5E',
    position: [1, 1, -1],
  },
  {
    id: 'centaur-underground',
    name: 'Centaur Underground',
    tagline: 'Rogue talent pairs with AI in the cracks of weak systems',
    color: '#06B6D4',
    position: [1, -1, 1],
  },
  {
    id: 'the-great-refusal',
    name: 'The Great Refusal',
    tagline: 'Maximum disruption, minimal support, pervasive despair',
    color: '#EF4444',
    position: [1, -1, -1],
  },
];

// ---------------------------------------------------------------------------
// Cube edge definitions — pairs of corner indices to draw contour-line edges
// ---------------------------------------------------------------------------

const CUBE_CORNERS: [number, number, number][] = [
  [-1, -1, -1],
  [-1, -1, 1],
  [-1, 1, -1],
  [-1, 1, 1],
  [1, -1, -1],
  [1, -1, 1],
  [1, 1, -1],
  [1, 1, 1],
];

const CUBE_EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 4],
  [1, 3], [1, 5],
  [2, 3], [2, 6],
  [3, 7],
  [4, 5], [4, 6],
  [5, 7],
  [6, 7],
];

// Scale factor — the cube corners are at +/-1, we scale them up for visual space
const SCALE = 2.2;

function scaledPos(p: [number, number, number]): [number, number, number] {
  return [p[0] * SCALE, p[1] * SCALE, p[2] * SCALE];
}

// ---------------------------------------------------------------------------
// Theme constants (matching the atlas/cartographic CSS @theme)
// ---------------------------------------------------------------------------

const THEME = {
  parchment: '#F5F2EB',
  surface: '#FEFDFB',
  surfaceWarm: '#FAF8F3',
  ink900: '#1C1A17',
  ink800: '#2D2A26',
  ink700: '#3D3A35',
  ink600: '#55514A',
  ink500: '#6E6A62',
  ink400: '#8C8578',
  ink300: '#AEA898',
  ink200: '#D1CCC0',
  ink150: '#E0DCD3',
  ink100: '#EAE7E0',
  topoSage: '#5E8C61',
  topoTeal: '#2A7F7F',
  topoBlue: '#6B8BA4',
  topoSienna: '#B87A56',
  topoAmber: '#C4922A',
  topoBrown: '#8B6F4E',
  fontDisplay: "'Spectral', Georgia, serif",
  fontSans: "'Source Sans 3', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

// ---------------------------------------------------------------------------
// Background particle field — soft dust motes floating in the scene
// ---------------------------------------------------------------------------

function ParticleField({ count = 800 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={THEME.ink300}
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        opacity={0.35}
      />
    </Points>
  );
}

// ---------------------------------------------------------------------------
// Terrain survey pin marker (replaces glowing ScenarioSphere)
// ---------------------------------------------------------------------------

interface NodeProps {
  scenario: ScenarioNode;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
}

function SurveyPin({ scenario, onHover, hoveredId }: NodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pinHeadRef = useRef<THREE.Mesh>(null);
  const navigate = useNavigate();
  const isHovered = hoveredId === scenario.id;
  const color = new THREE.Color(scenario.color);
  const pos = scaledPos(scenario.position);

  // Pin geometry constants
  const pinStalkHeight = 0.28;
  const pinHeadRadius = 0.09;
  const stalkRadius = 0.012;

  // Subtle hover animation on the pin head
  useFrame((_state, delta) => {
    if (!pinHeadRef.current) return;
    const targetScale = isHovered ? 1.45 : 1.0;
    const s = pinHeadRef.current.scale.x;
    const next = THREE.MathUtils.lerp(s, targetScale, 1 - Math.pow(0.001, delta));
    pinHeadRef.current.scale.setScalar(next);
  });

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onHover(scenario.id);
      document.body.style.cursor = 'pointer';
    },
    [onHover, scenario.id],
  );

  const handlePointerOut = useCallback(() => {
    onHover(null);
    document.body.style.cursor = 'default';
  }, [onHover]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      navigate(`/scenario/${scenario.id}`);
    },
    [navigate, scenario.id],
  );

  return (
    <group ref={groupRef} position={pos}>
      {/* Base disc — small circle where the pin meets the "ground" */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -pinStalkHeight / 2, 0]}>
        <ringGeometry args={[0.02, 0.045, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isHovered ? 0.5 : 0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Stalk — vertical thin cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[stalkRadius, stalkRadius, pinStalkHeight, 8]} />
        <meshStandardMaterial
          color={THEME.ink400}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Pin head — colored sphere at the top */}
      <mesh
        ref={pinHeadRef}
        position={[0, pinStalkHeight / 2 + pinHeadRadius * 0.7, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[pinHeadRadius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.6 : 0.15}
          roughness={0.35}
          metalness={0.15}
          toneMapped={false}
        />
      </mesh>

      {/* Soft glow ring beneath pin head on hover */}
      {isHovered && (
        <mesh position={[0, pinStalkHeight / 2 + pinHeadRadius * 0.7, 0]}>
          <sphereGeometry args={[pinHeadRadius * 2.2, 24, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Hover tooltip — atlas annotation style */}
      {isHovered && (
        <Html
          center
          distanceFactor={6}
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              background: THEME.surface,
              border: `1.5px solid ${THEME.topoBrown}`,
              borderRadius: '6px',
              padding: '10px 16px',
              transform: 'translateY(-58px)',
              textAlign: 'center',
              minWidth: '190px',
              boxShadow: `0 2px 8px rgba(28, 26, 23, 0.1), 0 1px 3px rgba(28, 26, 23, 0.06)`,
            }}
          >
            <div
              style={{
                fontFamily: THEME.fontDisplay,
                fontSize: '15px',
                fontWeight: 500,
                color: THEME.ink800,
                marginBottom: '4px',
                lineHeight: 1.3,
              }}
            >
              {scenario.name}
            </div>
            <div
              style={{
                fontFamily: THEME.fontSans,
                fontSize: '11px',
                color: THEME.ink400,
                maxWidth: '230px',
                lineHeight: 1.45,
              }}
            >
              {scenario.tagline}
            </div>
            {/* Small colored indicator dot */}
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: scenario.color,
                margin: '6px auto 0',
              }}
            />
          </div>
        </Html>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Contour-line wireframe cube edges
// ---------------------------------------------------------------------------

function CubeWireframe() {
  return (
    <group>
      {CUBE_EDGES.map(([a, b], i) => (
        <Line
          key={i}
          points={[scaledPos(CUBE_CORNERS[a]), scaledPos(CUBE_CORNERS[b])]}
          color={THEME.topoSage}
          lineWidth={1}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Axis lines extending beyond the cube with cartographic labels
// ---------------------------------------------------------------------------

function AxisLines() {
  const ext = SCALE + 1.1;
  const labelOffset = SCALE + 1.5;

  const labelStyle: React.CSSProperties = {
    fontFamily: THEME.fontSans,
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    userSelect: 'none',
  };

  return (
    <group>
      {/* X axis — Disruption */}
      <Line
        points={[[-ext, 0, 0], [ext, 0, 0]]}
        color={THEME.topoSage}
        lineWidth={0.8}
        transparent
        opacity={0.2}
        dashed
        dashSize={0.15}
        gapSize={0.1}
      />
      <Html position={[-labelOffset, 0, 0]} center distanceFactor={8}>
        <div style={{ ...labelStyle, color: THEME.ink400 }}>
          Managed
          <br />
          <span style={{ fontSize: '8px', color: THEME.ink300, fontWeight: 400 }}>
            Disruption
          </span>
        </div>
      </Html>
      <Html position={[labelOffset, 0, 0]} center distanceFactor={8}>
        <div style={{ ...labelStyle, color: THEME.ink400 }}>
          High
          <br />
          <span style={{ fontSize: '8px', color: THEME.ink300, fontWeight: 400 }}>
            Disruption
          </span>
        </div>
      </Html>

      {/* Y axis — Transition */}
      <Line
        points={[[0, -ext, 0], [0, ext, 0]]}
        color={THEME.topoTeal}
        lineWidth={0.8}
        transparent
        opacity={0.2}
        dashed
        dashSize={0.15}
        gapSize={0.1}
      />
      <Html position={[0, -labelOffset, 0]} center distanceFactor={8}>
        <div style={{ ...labelStyle, color: THEME.ink400 }}>
          Weak
          <br />
          <span style={{ fontSize: '8px', color: THEME.ink300, fontWeight: 400 }}>
            Transition
          </span>
        </div>
      </Html>
      <Html position={[0, labelOffset, 0]} center distanceFactor={8}>
        <div style={{ ...labelStyle, color: THEME.ink400 }}>
          Strong
          <br />
          <span style={{ fontSize: '8px', color: THEME.ink300, fontWeight: 400 }}>
            Transition
          </span>
        </div>
      </Html>

      {/* Z axis — Perception */}
      <Line
        points={[[0, 0, -ext], [0, 0, ext]]}
        color={THEME.topoSage}
        lineWidth={0.8}
        transparent
        opacity={0.2}
        dashed
        dashSize={0.15}
        gapSize={0.1}
      />
      <Html position={[0, 0, -labelOffset]} center distanceFactor={8}>
        <div style={{ ...labelStyle, color: THEME.ink400 }}>
          Doom
          <br />
          <span style={{ fontSize: '8px', color: THEME.ink300, fontWeight: 400 }}>
            Narrative
          </span>
        </div>
      </Html>
      <Html position={[0, 0, labelOffset]} center distanceFactor={8}>
        <div style={{ ...labelStyle, color: THEME.ink400 }}>
          Agency
          <br />
          <span style={{ fontSize: '8px', color: THEME.ink300, fontWeight: 400 }}>
            Narrative
          </span>
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Auto-rotating group (pauses when user is interacting via OrbitControls)
// ---------------------------------------------------------------------------

function AutoRotate({
  children,
  isInteracting,
}: {
  children: React.ReactNode;
  isInteracting: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (!groupRef.current || isInteracting) return;
    groupRef.current.rotation.y += delta * 0.05;
  });

  return <group ref={groupRef}>{children}</group>;
}

// ---------------------------------------------------------------------------
// Main scene
// ---------------------------------------------------------------------------

function Scene() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  return (
    <>
      {/* Warm cartographic lighting */}
      <ambientLight intensity={0.7} color="#FFF8F0" />
      <directionalLight
        position={[6, 8, 5]}
        intensity={0.5}
        color="#FFF5E6"
        castShadow={false}
      />
      <directionalLight
        position={[-4, -2, -3]}
        intensity={0.15}
        color="#E8DDD0"
      />

      {/* Subtle floating dust motes */}
      <ParticleField />

      {/* The interactive cube assembly */}
      <AutoRotate isInteracting={isInteracting}>
        <CubeWireframe />
        <AxisLines />
        {SCENARIO_NODES.map((scenario) => (
          <SurveyPin
            key={scenario.id}
            scenario={scenario}
            onHover={handleHover}
            hoveredId={hoveredId}
          />
        ))}
      </AutoRotate>

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        onStart={() => setIsInteracting(true)}
        onEnd={() => setIsInteracting(false)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Overlay components (HTML on top of the Canvas)
// ---------------------------------------------------------------------------

const overlayFade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.0, ease: 'easeOut' as const },
};

const overlayFadeDelayed = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.0, delay: 0.3, ease: 'easeOut' as const },
};

const overlayFadeRight = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 1.0, delay: 0.5, ease: 'easeOut' as const },
};

function BottomLeftOverlay() {
  return (
    <motion.div
      {...overlayFade}
      style={{
        position: 'absolute',
        bottom: '36px',
        left: '36px',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <h1
        style={{
          fontFamily: THEME.fontDisplay,
          fontSize: '28px',
          fontWeight: 500,
          color: THEME.ink800,
          letterSpacing: '0.02em',
          lineHeight: 1.2,
          marginBottom: '6px',
        }}
      >
        The Scenario Atlas
      </h1>
      <p
        style={{
          fontFamily: THEME.fontSans,
          fontSize: '13px',
          color: THEME.ink400,
          lineHeight: 1.5,
          maxWidth: '320px',
        }}
      >
        Youth, AI &amp; the Future of Work
      </p>
      <p
        style={{
          fontFamily: THEME.fontSans,
          fontSize: '11px',
          color: THEME.ink300,
          marginTop: '4px',
          letterSpacing: '0.05em',
        }}
      >
        Pharos Futures Research Group | 2026
      </p>
    </motion.div>
  );
}

function BottomRightOverlay() {
  return (
    <motion.div
      {...overlayFadeDelayed}
      style={{
        position: 'absolute',
        bottom: '36px',
        right: '36px',
        pointerEvents: 'none',
        zIndex: 10,
        textAlign: 'right',
      }}
    >
      <p
        style={{
          fontFamily: THEME.fontSans,
          fontSize: '12px',
          color: THEME.ink400,
          letterSpacing: '0.04em',
        }}
      >
        Click a marker to explore
      </p>
    </motion.div>
  );
}

function LegendOverlay() {
  const axes = [
    {
      label: 'X  Entry-Level Disruption',
      low: 'Managed',
      high: 'High',
      color: THEME.topoSienna,
    },
    {
      label: 'Y  Transition Architecture',
      low: 'Weak',
      high: 'Strong',
      color: THEME.topoTeal,
    },
    {
      label: 'Z  Perception Climate',
      low: 'Doom',
      high: 'Agency',
      color: THEME.topoAmber,
    },
  ];

  return (
    <motion.div
      {...overlayFadeRight}
      style={{
        position: 'absolute',
        top: '28px',
        right: '28px',
        pointerEvents: 'none',
        zIndex: 10,
        background: THEME.surface,
        border: `1px solid ${THEME.ink150}`,
        borderRadius: '10px',
        padding: '14px 18px',
      }}
    >
      <div
        style={{
          fontFamily: THEME.fontSans,
          fontSize: '10px',
          fontWeight: 600,
          color: THEME.ink500,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '10px',
        }}
      >
        Axes
      </div>
      {axes.map((axis) => (
        <div
          key={axis.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '7px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: axis.color,
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: THEME.fontSans,
                fontSize: '11px',
                color: THEME.ink500,
                fontVariant: 'small-caps',
                letterSpacing: '0.06em',
                lineHeight: 1.3,
              }}
            >
              {axis.label}
            </div>
            <div
              style={{
                fontFamily: THEME.fontSans,
                fontSize: '9px',
                color: THEME.ink400,
              }}
            >
              {axis.low} &larr; &rarr; {axis.high}
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Exported page component
// ---------------------------------------------------------------------------

export default function CubeView() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: THEME.parchment,
      }}
    >
      <Canvas
        camera={{ position: [5.5, 3.5, 5.5], fov: 45 }}
        style={{ position: 'absolute', inset: 0 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.NoToneMapping,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(THEME.parchment, 1);
        }}
      >
        <Scene />
      </Canvas>

      {/* HTML overlays */}
      <BottomLeftOverlay />
      <BottomRightOverlay />
      <LegendOverlay />
    </div>
  );
}

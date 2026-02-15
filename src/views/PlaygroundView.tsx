import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { scenarios, axes as axisDefinitions } from '../data/scenarios';
import type { Scenario } from '../data/scenarios';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SliderConfig {
  id: 'disruption' | 'transition' | 'perception';
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
  description: string;
}

interface ProximityEntry {
  scenario: Scenario;
  proximity: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const sliderConfigs: SliderConfig[] = [
  {
    id: 'disruption',
    label: 'Disruption Level',
    leftLabel: 'Managed',
    rightLabel: 'High',
    leftColor: '#14B8A6',
    rightColor: '#EF4444',
    description: axisDefinitions[0].description,
  },
  {
    id: 'transition',
    label: 'Transition Architecture',
    leftLabel: 'Weak',
    rightLabel: 'Strong',
    leftColor: '#6366F1',
    rightColor: '#10B981',
    description: axisDefinitions[1].description,
  },
  {
    id: 'perception',
    label: 'Perception Climate',
    leftLabel: 'Doom',
    rightLabel: 'Agency',
    leftColor: '#F43F5E',
    rightColor: '#F59E0B',
    description: axisDefinitions[2].description,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function axisValueFromSlider(
  axisId: 'disruption' | 'transition' | 'perception',
  value: number,
): string {
  if (axisId === 'disruption') return value < 50 ? 'managed' : 'high';
  if (axisId === 'transition') return value < 50 ? 'weak' : 'strong';
  return value < 50 ? 'doom' : 'agency';
}

function scenarioCornerPosition(scenario: Scenario): [number, number, number] {
  return [
    scenario.axes.disruption === 'managed' ? 0 : 100,
    scenario.axes.transition === 'weak' ? 0 : 100,
    scenario.axes.perception === 'doom' ? 0 : 100,
  ];
}

function computeProximity(
  sliderValues: [number, number, number],
  scenario: Scenario,
): number {
  const corner = scenarioCornerPosition(scenario);
  const dx = (sliderValues[0] - corner[0]) / 100;
  const dy = (sliderValues[1] - corner[1]) / 100;
  const dz = (sliderValues[2] - corner[2]) / 100;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  // Max possible distance is sqrt(3) ~ 1.732
  const maxDistance = Math.sqrt(3);
  return 1 - distance / maxDistance;
}

function isInTransitionZone(values: [number, number, number]): boolean {
  return values.some((v) => v >= 40 && v <= 60);
}

// ---------------------------------------------------------------------------
// Custom Slider Component
// ---------------------------------------------------------------------------

function AxisSlider({
  config,
  value,
  onChange,
}: {
  config: SliderConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  const sliderId = `slider-${config.id}`;
  const thumbPercent = value;

  // Interpolate color for thumb based on position
  const thumbColor =
    value < 50
      ? config.leftColor
      : config.rightColor;

  return (
    <div className="mb-8">
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: config.leftColor }}
        >
          {config.leftLabel}
        </span>
        <span className="text-sm font-display text-ink-800">
          {config.label}
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: config.rightColor }}
        >
          {config.rightLabel}
        </span>
      </div>

      {/* Slider track container */}
      <div className="relative w-full h-10 flex items-center">
        {/* Track background */}
        <div
          className="absolute inset-x-0 h-2 rounded-full"
          style={{
            background: `linear-gradient(to right, ${config.leftColor}22, ${config.rightColor}22)`,
          }}
        />
        {/* Track fill */}
        <div
          className="absolute left-0 h-2 rounded-full transition-all duration-75"
          style={{
            width: `${thumbPercent}%`,
            background: `linear-gradient(to right, ${config.leftColor}, ${
              value < 50
                ? config.leftColor
                : config.rightColor
            })`,
          }}
        />
        {/* Center marker */}
        <div className="absolute left-1/2 -translate-x-1/2 w-px h-4 bg-ink-300" />

        {/* Range input */}
        <input
          id={sliderId}
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="playground-slider absolute inset-0 w-full appearance-none bg-transparent cursor-pointer z-10"
          style={
            {
              '--thumb-color': thumbColor,
              '--thumb-glow': `${thumbColor}66`,
            } as React.CSSProperties
          }
        />
      </div>

      {/* Description */}
      <p className="text-xs text-ink-400 mt-2 leading-relaxed max-w-2xl">
        {config.description}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Proximity Card
// ---------------------------------------------------------------------------

function ProximityCard({
  entry,
  isClosest,
  rank,
}: {
  entry: ProximityEntry;
  isClosest: boolean;
  rank: number;
}) {
  const percentLabel = Math.round(entry.proximity * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isClosest ? 1 : 0.5 + entry.proximity * 0.4,
        scale: isClosest ? 1 : 0.92 + entry.proximity * 0.06,
      }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
      className="relative flex-shrink-0 w-36 rounded-xl bg-surface p-3 shadow-sm"
      style={{
        borderLeft: isClosest ? `3px solid ${entry.scenario.color}` : '3px solid transparent',
        borderTop: '1px solid #E0DCD3',
        borderRight: '1px solid #E0DCD3',
        borderBottom: '1px solid #E0DCD3',
      }}
    >
      {/* Rank badge */}
      <div
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{
          backgroundColor: isClosest ? entry.scenario.color : undefined,
          color: isClosest ? '#FFFFFF' : undefined,
        }}
      >
        {!isClosest ? (
          <span className="bg-ink-100 text-ink-600 w-full h-full rounded-full flex items-center justify-center">
            {rank}
          </span>
        ) : (
          rank
        )}
      </div>

      {/* Scenario name */}
      <p
        className="text-xs font-semibold mb-1 truncate"
        style={{ color: entry.scenario.color }}
      >
        {entry.scenario.name}
      </p>

      {/* Proximity bar */}
      <div className="w-full h-1.5 rounded-full bg-ink-100 mb-1">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentLabel}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' as const }}
          style={{ backgroundColor: entry.scenario.color }}
        />
      </div>

      {/* Proximity percentage */}
      <p className="text-[10px] text-ink-400 text-right">
        {percentLabel}% match
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main View
// ---------------------------------------------------------------------------

export default function PlaygroundView() {
  const [disruption, setDisruption] = useState(50);
  const [transition, setTransition] = useState(50);
  const [perception, setPerception] = useState(50);

  const sliderValues: [number, number, number] = [disruption, transition, perception];

  // Compute closest scenario and proximity scores
  const { closestScenario, sortedProximities } = useMemo(() => {
    const proximities: ProximityEntry[] = scenarios.map((s) => ({
      scenario: s,
      proximity: computeProximity(sliderValues, s),
    }));

    proximities.sort((a, b) => b.proximity - a.proximity);

    return {
      closestScenario: proximities[0].scenario,
      sortedProximities: proximities,
    };
  }, [sliderValues[0], sliderValues[1], sliderValues[2]]);

  // Determine axis values for label display
  const currentAxes = {
    disruption: axisValueFromSlider('disruption', disruption),
    transition: axisValueFromSlider('transition', transition),
    perception: axisValueFromSlider('perception', perception),
  };

  const showTransitionZone = isInTransitionZone(sliderValues);

  // Radar chart data — normalize to percentage (values are 1-10 scale)
  const radarData = closestScenario.radarScores.map((rs) => ({
    label: rs.label,
    value: rs.value * 10,
    fullMark: 100,
  }));

  return (
    <div className="min-h-full w-full overflow-y-auto bg-parchment">
      <div className="max-w-5xl mx-auto px-10 lg:px-16 py-12">
        {/* ---------------------------------------------------------------- */}
        {/* Title Section */}
        {/* ---------------------------------------------------------------- */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-display text-ink-800 mb-3">
            Field Survey
          </h1>
          <p className="map-label">
            Drag the axes to survey the scenario terrain
          </p>
          <div className="mt-6 w-32 h-px mx-auto bg-ink-200" />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Three Sliders */}
        {/* ---------------------------------------------------------------- */}
        <div className="atlas-card p-8 mb-12">
          {sliderConfigs.map((config) => {
            const value =
              config.id === 'disruption'
                ? disruption
                : config.id === 'transition'
                  ? transition
                  : perception;
            const setter =
              config.id === 'disruption'
                ? setDisruption
                : config.id === 'transition'
                  ? setTransition
                  : setPerception;

            return (
              <AxisSlider
                key={config.id}
                config={config}
                value={value}
                onChange={setter}
              />
            );
          })}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Transition Zone Indicator */}
        {/* ---------------------------------------------------------------- */}
        <AnimatePresence>
          {showTransitionZone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-surface-warm rounded-xl border border-ink-150 shadow-sm px-5 py-4 text-center">
                <p className="text-sm text-ink-600 italic">
                  You're between worlds — this is where policy choices matter
                  most
                </p>
                <div className="mt-2 flex items-center justify-center gap-3 text-xs text-ink-400">
                  {sliderValues.map((v, i) => {
                    const inZone = v >= 40 && v <= 60;
                    const labels = ['Disruption', 'Transition', 'Perception'];
                    return inZone ? (
                      <span
                        key={labels[i]}
                        className="px-2 py-0.5 rounded-full border border-ink-150 bg-surface-warm text-ink-600"
                      >
                        {labels[i]}: {v}%
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------------------------------------------- */}
        {/* Current Axis Position Tags */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="px-3 py-1 rounded-full text-xs font-mono border border-ink-150 bg-surface text-ink-600 shadow-sm">
            {currentAxes.disruption}
          </span>
          <span className="text-ink-300">+</span>
          <span className="px-3 py-1 rounded-full text-xs font-mono border border-ink-150 bg-surface text-ink-600 shadow-sm">
            {currentAxes.transition}
          </span>
          <span className="text-ink-300">+</span>
          <span className="px-3 py-1 rounded-full text-xs font-mono border border-ink-150 bg-surface text-ink-600 shadow-sm">
            {currentAxes.perception}
          </span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Scenario Result Panel */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-surface rounded-xl border border-ink-150 shadow-sm p-6 md:p-8 mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={closestScenario.id}
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            >
              {/* Scenario name */}
              <h2
                className="text-3xl md:text-4xl font-display text-ink-800 mb-2"
                style={{ color: closestScenario.color }}
              >
                {closestScenario.name}
              </h2>

              {/* Tagline */}
              <p className="text-xs text-ink-400 uppercase tracking-widest mb-6">
                {closestScenario.tagline}
              </p>

              {/* Description */}
              <p className="text-sm text-ink-600 leading-relaxed mb-8 max-w-2xl">
                {closestScenario.description}
              </p>

              {/* Radar Chart */}
              <div className="w-full max-w-md mx-auto mb-8">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid
                      stroke="#E0DCD3"
                      strokeDasharray="2 4"
                    />
                    <PolarAngleAxis
                      dataKey="label"
                      tick={{
                        fill: '#8C8578',
                        fontSize: 11,
                        fontFamily: "'Source Sans 3', system-ui, sans-serif",
                      }}
                    />
                    <Radar
                      name={closestScenario.name}
                      dataKey="value"
                      stroke={closestScenario.color}
                      fill={closestScenario.color}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Link to full scenario */}
              <div className="text-center">
                <Link
                  to={`/scenario/${closestScenario.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:underline"
                  style={{ color: closestScenario.color }}
                >
                  View Full Scenario
                  <span className="text-base">&rarr;</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Proximity Indicators */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-14">
          <h3 className="text-sm font-semibold text-ink-800 uppercase tracking-widest mb-4 text-center">
            Proximity to All Scenarios
          </h3>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
            {sortedProximities.map((entry, i) => (
              <ProximityCard
                key={entry.scenario.id}
                entry={entry}
                isClosest={i === 0}
                rank={i + 1}
              />
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Footer spacer */}
        {/* ---------------------------------------------------------------- */}
        <div className="h-8" />
      </div>
    </div>
  );
}

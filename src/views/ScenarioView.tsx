import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Heart,
  Vote,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { scenarios } from '../data/scenarios';
import type { Scenario } from '../data/scenarios';

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number], staggerChildren: 0.1 },
  },
};

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatAxisLabel(_axis: keyof Scenario['axes'], value: string): string {
  const labels: Record<string, string> = {
    'managed': 'Managed Disruption',
    'high': 'High Disruption',
    'strong': 'Strong Transition',
    'weak': 'Weak Transition',
    'agency': 'Agency',
    'doom': 'Doom',
  };
  return labels[value] || value;
}

function getAxisPillColor(axis: keyof Scenario['axes'], value: string): string {
  if (axis === 'perception') {
    return value === 'agency'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
  if (axis === 'disruption') {
    return value === 'managed'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';
  }
  // transition
  return value === 'strong'
    ? 'bg-teal-50 text-teal-700 border-teal-200'
    : 'bg-violet-50 text-violet-700 border-violet-200';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AnimatedSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      variants={sectionVariants}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ReactionCard({
  icon: Icon,
  title,
  text,
  color,
  index,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  text: string;
  color: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      transition={{ delay: index * 0.1 }}
      className="bg-surface rounded-xl border border-ink-150 shadow-sm p-6 hover:-translate-y-0.5 transition-transform"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: hexToRgba(color, 0.08) }}
        >
          <span style={{ color }}><Icon size={20} /></span>
        </div>
        <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-ink-600">{text}</p>
    </motion.div>
  );
}

function ScenarioNavCard({
  scenario,
  direction,
}: {
  scenario: Scenario;
  direction: 'prev' | 'next';
}) {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(`/scenario/${scenario.id}`)}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex items-center gap-4 rounded-xl bg-surface border border-ink-150 shadow-sm p-4 overflow-hidden transition-colors hover:border-ink-200 w-full ${
        direction === 'next' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      {/* Color accent */}
      <div
        className="absolute top-0 bottom-0 w-1 rounded-full"
        style={{
          background: scenario.color,
          [direction === 'prev' ? 'left' : 'right']: 0,
        }}
      />

      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: hexToRgba(scenario.color, 0.08) }}
      >
        {direction === 'prev' ? (
          <ChevronLeft size={18} style={{ color: scenario.color }} />
        ) : (
          <ChevronRight size={18} style={{ color: scenario.color }} />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-ink-400 mb-0.5 uppercase tracking-wider font-medium">
          {direction === 'prev' ? 'Previous' : 'Next'}
        </p>
        <p className="text-sm font-semibold truncate" style={{ color: scenario.color }}>
          {scenario.name}
        </p>
      </div>
    </motion.button>
  );
}

function ScenarioRadarChart({ scenario }: { scenario: Scenario }) {
  const data = scenario.radarScores.map((s) => ({
    dimension: s.label,
    value: s.value,
    fullMark: 10,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-xl bg-surface border border-ink-150 shadow-sm flex items-center justify-center"
    >
      <RadarChart width={320} height={320} cx="50%" cy="50%" outerRadius="62%" data={data}>
        <PolarGrid
          stroke="#E0DCD3"
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{
            fill: '#8C8578',
            fontSize: 10,
            fontWeight: 500,
          }}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name={scenario.name}
          dataKey="value"
          stroke={scenario.color}
          fill={scenario.color}
          fillOpacity={0.15}
          strokeWidth={2}
          animationBegin={300}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </RadarChart>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Not Found State
// ---------------------------------------------------------------------------

function ScenarioNotFound() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-parchment">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md px-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface border border-ink-150 shadow-sm flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-rose-500" />
        </div>
        <h1 className="text-2xl font-display text-ink-800 mb-3">Scenario Not Found</h1>
        <p className="text-sm text-ink-500 mb-8 leading-relaxed">
          The scenario you are looking for does not exist or may have been removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-ink-150 shadow-sm text-sm font-medium text-ink-800 hover:border-ink-200 hover:shadow transition-all duration-200"
        >
          <ArrowLeft size={16} />
          Back to Atlas
        </Link>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ScenarioView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const scenario = useMemo(() => scenarios.find((s) => s.id === id), [id]);

  const { prevScenario, nextScenario } = useMemo(() => {
    if (!scenario) return { prevScenario: undefined, nextScenario: undefined };
    const idx = scenarios.findIndex((s) => s.id === scenario.id);
    return {
      prevScenario: idx > 0 ? scenarios[idx - 1] : scenarios[scenarios.length - 1],
      nextScenario: idx < scenarios.length - 1 ? scenarios[idx + 1] : scenarios[0],
    };
  }, [scenario]);

  const indicators = useMemo(() => {
    if (!scenario) return [];
    return scenario.earlyIndicators
      .split('. ')
      .map((s) => s.replace(/\.$/, '').trim())
      .filter(Boolean);
  }, [scenario]);

  if (!scenario) {
    return <ScenarioNotFound />;
  }

  const reactionCards = [
    { icon: GraduationCap, title: 'Career & Education', text: scenario.youthReactions.career },
    { icon: Briefcase, title: 'Work Behaviour', text: scenario.youthReactions.work },
    { icon: Heart, title: 'Mental Health', text: scenario.youthReactions.mentalHealth },
    { icon: Vote, title: 'Politics', text: scenario.youthReactions.politics },
  ];

  return (
    <motion.div
      key={scenario.id}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="h-full w-full overflow-y-auto bg-parchment"
    >
      <div className="max-w-5xl mx-auto px-10 lg:px-16 py-12 pb-24">
        {/* ---------------------------------------------------------------- */}
        {/* Back Button                                                       */}
        {/* ---------------------------------------------------------------- */}
        <motion.button
          variants={sectionVariants}
          onClick={() => navigate('/')}
          className="group inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 transition-colors duration-200 mb-8"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          <span>Back to Atlas</span>
        </motion.button>

        {/* ---------------------------------------------------------------- */}
        {/* Header Section                                                    */}
        {/* ---------------------------------------------------------------- */}
        <motion.div variants={sectionVariants} className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
          {/* Left: Title + tagline + pills */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-4xl sm:text-5xl font-display leading-tight mb-4"
              style={{ color: scenario.color }}
            >
              {scenario.name}
            </h1>

            <p className="text-base text-ink-600 mb-6 leading-relaxed">
              {scenario.tagline}
            </p>

            <div className="flex flex-wrap gap-2">
              {(Object.entries(scenario.axes) as [keyof Scenario['axes'], string][]).map(
                ([axis, value]) => (
                  <span
                    key={axis}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${getAxisPillColor(axis, value)}`}
                  >
                    {formatAxisLabel(axis, value)}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Right: Radar Chart */}
          <div className="flex-shrink-0 flex justify-center lg:justify-end">
            <ScenarioRadarChart scenario={scenario} />
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* "What's Going On Here?" Description                               */}
        {/* ---------------------------------------------------------------- */}
        <AnimatedSection className="mb-16">
          <h2 className="text-lg font-semibold text-ink-800 mb-4 tracking-wide">
            What's Going On Here?
          </h2>
          <div className="bg-surface rounded-xl border border-ink-150 shadow-sm p-8">
            <div
              className="pl-5 border-l-2"
              style={{ borderColor: scenario.color }}
            >
              <p className="text-base text-ink-600 leading-[1.8]">
                {scenario.description}
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* ---------------------------------------------------------------- */}
        {/* Youth Reactions Grid                                              */}
        {/* ---------------------------------------------------------------- */}
        <AnimatedSection className="mb-16">
          <h2 className="text-lg font-semibold text-ink-800 mb-6 tracking-wide">
            Youth Reactions
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {reactionCards.map((card, i) => (
              <ReactionCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                text={card.text}
                color={scenario.color}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatedSection>

        {/* ---------------------------------------------------------------- */}
        {/* Population Profile Callout                                        */}
        {/* ---------------------------------------------------------------- */}
        <AnimatedSection className="mb-16">
          <h2 className="text-lg font-semibold text-ink-800 mb-4 tracking-wide">
            Survey-Grounded Population Profile
          </h2>
          <div className="relative bg-surface rounded-xl border border-ink-150 shadow-sm p-8 pl-9 overflow-hidden">
            {/* Left accent border */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              style={{ background: scenario.color }}
            />
            <p className="text-base italic text-ink-600 leading-[1.8]">
              {scenario.populationProfile}
            </p>
          </div>
        </AnimatedSection>

        {/* ---------------------------------------------------------------- */}
        {/* Early Indicators                                                  */}
        {/* ---------------------------------------------------------------- */}
        <AnimatedSection className="mb-16">
          <h2 className="text-lg font-semibold text-ink-800 mb-6 tracking-wide">
            Early Indicators
          </h2>
          <ul className="space-y-3">
            {indicators.map((indicator, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="flex items-start gap-3 text-sm text-ink-600 leading-relaxed"
              >
                <span className="mt-1.5 shrink-0">
                  <span
                    className="block w-2 h-2 rounded-full"
                    style={{ background: scenario.color }}
                  />
                </span>
                <span>{indicator}</span>
              </motion.li>
            ))}
          </ul>
        </AnimatedSection>

        {/* ---------------------------------------------------------------- */}
        {/* Scenario Navigation                                               */}
        {/* ---------------------------------------------------------------- */}
        <AnimatedSection>
          <div className="pt-8 border-t border-ink-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevScenario && (
                <ScenarioNavCard scenario={prevScenario} direction="prev" />
              )}
              {nextScenario && (
                <div className={!prevScenario ? 'sm:col-start-2' : ''}>
                  <ScenarioNavCard scenario={nextScenario} direction="next" />
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Shield,
  TrendingDown,
  Building2,
  Unplug,
  Heart,
} from 'lucide-react';
import { populations, scenarios } from '../data/scenarios';
import type { Population } from '../data/scenarios';

// ---------------------------------------------------------------------------
// Size labels — derived from the research context since the data doesn't
// include a `size` field. These are descriptive population descriptors.
// ---------------------------------------------------------------------------

const POPULATION_SIZE: Record<string, string> = {
  'secure-adopters': '~25% of cohort',
  'moderately-insecure': 'Swing population — largest segment',
  'institutional-sceptics': '~20% of cohort',
  disconnected: '~15% of cohort',
  'resilient-outsiders': '~10% of cohort',
};

// ---------------------------------------------------------------------------
// Icon mapping for each population
// ---------------------------------------------------------------------------

const POPULATION_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  'secure-adopters': Shield,
  'moderately-insecure': TrendingDown,
  'institutional-sceptics': Building2,
  disconnected: Unplug,
  'resilient-outsiders': Heart,
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardSlideIn = {
  hidden: { opacity: 0, x: -24, scale: 0.98 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

const pillFade = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

// ---------------------------------------------------------------------------
// Scenario pill (clickable link)
// ---------------------------------------------------------------------------

function ScenarioPill({ scenarioId }: { scenarioId: string }) {
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!scenario) return null;

  return (
    <motion.div variants={pillFade} transition={{ duration: 0.25 }}>
      <Link
        to={`/scenario/${scenario.id}`}
        className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all duration-200 hover:scale-105"
        style={{
          color: scenario.color,
          background: `${scenario.color}0C`,
          borderColor: `${scenario.color}28`,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.background = `${scenario.color}18`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = `${scenario.color}0C`;
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: scenario.color }}
        />
        {scenario.name}
        <ArrowRight
          size={10}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Population card
// ---------------------------------------------------------------------------

function PopulationCard({ population }: { population: Population }) {
  const Icon = POPULATION_ICONS[population.id] ?? Shield;
  const size = POPULATION_SIZE[population.id] ?? '';

  return (
    <motion.div
      variants={cardSlideIn}
      className="group bg-surface rounded-xl border border-ink-150 shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: population.color,
      }}
    >
      <div className="p-8">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `${population.color}10`,
              }}
            >
              <span style={{ color: population.color }}><Icon size={18} /></span>
            </div>
            <div>
              <h3 className="font-display text-xl leading-tight text-ink-800">
                {population.name}
              </h3>
              {size && (
                <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider font-medium px-2.5 py-0.5 rounded-full bg-ink-100 text-ink-600">
                  {size}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile description */}
        <p className="text-sm text-ink-600 leading-relaxed mb-5">
          {population.description}
        </p>

        {/* Key risk callout */}
        <div className="bg-surface rounded-xl p-4 mb-5 flex items-start gap-2.5 border border-ink-150 border-l-4 border-l-amber-400">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-amber-600 font-semibold mb-0.5">
              Key Risk
            </div>
            <p className="text-xs text-ink-600 leading-relaxed">
              {population.risk}
            </p>
          </div>
        </div>

        {/* Scenario affinities */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-2.5">
            Scenario Affinity
          </div>
          <motion.div
            className="flex flex-wrap gap-1.5"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
            }}
            initial="hidden"
            animate="show"
          >
            {population.affinityScenarios.map((sid) => (
              <ScenarioPill key={sid} scenarioId={sid} />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Connection visualization — affinity map grid
// ---------------------------------------------------------------------------

function AffinityMap() {
  const [hoveredCell, setHoveredCell] = useState<{
    popId: string;
    scenId: string;
  } | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-1 h-6 rounded-full bg-ink-300"
        />
        <h3 className="font-display text-lg text-ink-800">
          Affinity Map
        </h3>
        <span className="text-xs text-ink-400">
          Population-scenario connections
        </span>
      </div>

      <div className="bg-surface rounded-xl border border-ink-150 shadow-sm p-8 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row — scenario names */}
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: '160px repeat(8, 1fr)' }}
          >
            <div /> {/* Empty corner */}
            {scenarios.map((s) => (
              <div
                key={s.id}
                className="text-[9px] text-center text-ink-400 leading-tight px-0.5"
                title={s.name}
              >
                <span
                  className="block w-2 h-2 rounded-full mx-auto mb-1"
                  style={{ background: s.color }}
                />
                <span className="block truncate">{s.name}</span>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {populations.map((pop) => {
            const connected = new Set(pop.affinityScenarios);

            return (
              <div
                key={pop.id}
                className="grid gap-2 mt-2"
                style={{ gridTemplateColumns: '160px repeat(8, 1fr)' }}
              >
                {/* Row label */}
                <div className="flex items-center gap-2 pr-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: pop.color }}
                  />
                  <span className="text-xs text-ink-700 truncate font-medium">
                    {pop.name}
                  </span>
                </div>

                {/* Cells */}
                {scenarios.map((s) => {
                  const isConnected = connected.has(s.id);
                  const isHovered =
                    hoveredCell?.popId === pop.id &&
                    hoveredCell?.scenId === s.id;

                  return (
                    <div
                      key={`${pop.id}-${s.id}`}
                      className="relative flex items-center justify-center"
                      onMouseEnter={() =>
                        setHoveredCell({ popId: pop.id, scenId: s.id })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <motion.div
                        className="w-full aspect-square rounded-lg flex items-center justify-center border transition-all duration-200"
                        style={{
                          background: isConnected
                            ? `${pop.color}08`
                            : '#FAF8F3',
                          borderColor: isConnected
                            ? `${pop.color}20`
                            : '#E0DCD3',
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {isConnected ? (
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: pop.color,
                            }}
                          />
                        ) : (
                          <div className="w-2 h-0.5 rounded-full bg-ink-200" />
                        )}
                      </motion.div>

                      {/* Tooltip */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none"
                          >
                            <div className="px-3 py-2 rounded-xl bg-surface border border-ink-150 shadow-md whitespace-nowrap text-center">
                              <div
                                className="text-[10px] font-medium mb-0.5"
                                style={{ color: pop.color }}
                              >
                                {pop.name}
                              </div>
                              <div className="text-xs text-ink-600">
                                {s.name}
                              </div>
                              <div
                                className="text-[10px] mt-0.5 font-medium"
                                style={{
                                  color: isConnected
                                    ? pop.color
                                    : '#A8A49A',
                                }}
                              >
                                {isConnected ? 'Connected' : 'No affinity'}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-[10px] text-ink-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-0.5 rounded-full bg-ink-200" />
          No affinity
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: '#5E8C61' }}
          />
          Connected
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main PopulationView component
// ---------------------------------------------------------------------------

export default function PopulationView() {
  return (
    <div className="h-full w-full bg-parchment overflow-y-auto">
      <div className="max-w-5xl mx-auto px-10 lg:px-16 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="font-display text-3xl lg:text-4xl text-ink-800 tracking-wide mb-2">
            Field Notes — Populations
          </h1>
          <p className="text-sm text-ink-400 tracking-wide">
            Five populations whose trajectories determine the future
          </p>
          <div className="mt-5 w-24 border-t border-ink-200" />
        </motion.div>

        {/* Population cards */}
        <motion.div
          className="grid gap-5 mb-10"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          {populations.map((pop) => (
            <PopulationCard key={pop.id} population={pop} />
          ))}
        </motion.div>

        {/* Divider */}
        <div className="my-10 border-t border-ink-200" />

        {/* Connection visualization */}
        <AffinityMap />
      </div>
    </div>
  );
}

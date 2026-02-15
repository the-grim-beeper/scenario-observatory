import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark,
  DollarSign,
  Users,
  Cpu,
  Scale,
  Leaf,
  ChevronRight,
  X,
} from 'lucide-react';
import { pestleCategories, scenarios } from '../data/scenarios';
import type { PESTLECategory } from '../data/scenarios';

// ---------------------------------------------------------------------------
// Icon mapping for each PESTLE letter
// ---------------------------------------------------------------------------

const PESTLE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  P: Landmark,
  E: DollarSign,
  S: Users,
  T: Cpu,
  L: Scale,
};

function getPestleIcon(category: PESTLECategory) {
  // Environmental also has letter 'E', distinguish by id
  if (category.id === 'environmental') return Leaf;
  return PESTLE_ICONS[category.letter] ?? Landmark;
}

// ---------------------------------------------------------------------------
// Color overrides matching the spec (some differ from data file)
// ---------------------------------------------------------------------------

const PESTLE_COLORS: Record<string, string> = {
  political: '#F59E0B',
  economic: '#14B8A6',
  social: '#F43F5E',
  technological: '#06B6D4',
  legal: '#8B5CF6',
  environmental: '#10B981',
};

function getColor(category: PESTLECategory): string {
  return PESTLE_COLORS[category.id] ?? category.color;
}

// ---------------------------------------------------------------------------
// Build a simple affinity map: which PESTLE categories affect which scenarios
// We derive this from the content — keywords in findings mapped to scenarios.
// Since the data doesn't have affectedScenarios, we create a deterministic
// mapping based on thematic alignment.
// ---------------------------------------------------------------------------

const PESTLE_SCENARIO_AFFINITY: Record<string, string[]> = {
  political: [
    'the-panic-paradox',
    'drift-economy',
    'sheltered-stagnation',
    'the-great-refusal',
    'co-pilot-commons',
    'apprenticeship-reboot',
  ],
  economic: [
    'co-pilot-commons',
    'diy-advantage',
    'drift-economy',
    'centaur-underground',
    'the-great-refusal',
    'apprenticeship-reboot',
  ],
  social: [
    'drift-economy',
    'the-great-refusal',
    'the-panic-paradox',
    'sheltered-stagnation',
    'diy-advantage',
  ],
  technological: [
    'co-pilot-commons',
    'centaur-underground',
    'diy-advantage',
    'the-panic-paradox',
    'apprenticeship-reboot',
  ],
  legal: [
    'the-panic-paradox',
    'sheltered-stagnation',
    'the-great-refusal',
    'co-pilot-commons',
  ],
  environmental: [
    'the-great-refusal',
    'centaur-underground',
    'co-pilot-commons',
    'apprenticeship-reboot',
  ],
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardFadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const findingStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const findingItem = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const expandPanel = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.25, ease: 'easeIn' as const } },
};

// ---------------------------------------------------------------------------
// Category selector card
// ---------------------------------------------------------------------------

function CategoryCard({
  category,
  isSelected,
  onClick,
}: {
  category: PESTLECategory;
  isSelected: boolean;
  onClick: () => void;
}) {
  const color = getColor(category);
  const Icon = getPestleIcon(category);

  return (
    <motion.button
      variants={cardFadeUp}
      onClick={onClick}
      className={`relative group rounded-xl p-5 text-left transition-all duration-300 border cursor-pointer ${
        isSelected ? 'bg-surface shadow-sm' : 'bg-surface hover:shadow-sm'
      }`}
      style={{
        borderColor: isSelected ? color : undefined,
        borderTopWidth: isSelected ? '3px' : undefined,
        backgroundColor: isSelected ? `${color}08` : undefined,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300"
        style={{
          backgroundColor: isSelected ? `${color}15` : undefined,
        }}
      >
        {isSelected ? (
          <span style={{ color }}><Icon size={20} /></span>
        ) : (
          <span style={{ color: '#8C8578' }}><Icon size={20} /></span>
        )}
      </div>
      <div
        className="font-display text-base transition-colors duration-300"
        style={{ color: isSelected ? color : undefined }}
      >
        {category.label}
      </div>
      <div className="text-xs text-ink-400 mt-1">
        {category.findings.length} finding{category.findings.length !== 1 ? 's' : ''}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-4 right-3"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <ChevronRight size={16} style={{ color }} />
        </motion.div>
      )}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Expanded findings panel
// ---------------------------------------------------------------------------

function FindingsPanel({ category }: { category: PESTLECategory }) {
  const color = getColor(category);

  return (
    <motion.div
      key={category.id}
      variants={expandPanel}
      initial="initial"
      animate="animate"
      exit="exit"
      className="overflow-hidden"
    >
      <div className="pt-2 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-1 h-8 rounded-full"
            style={{ background: color }}
          />
          <h3
            className="font-display text-xl text-ink-800"
          >
            {category.label} Findings
          </h3>
        </div>

        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={findingStagger}
          initial="hidden"
          animate="show"
        >
          {category.findings.map((finding, idx) => (
            <motion.div
              key={idx}
              variants={findingItem}
              className="bg-surface rounded-xl border border-ink-150 shadow-sm p-5"
              style={{
                borderLeftWidth: '3px',
                borderLeftColor: color,
              }}
            >
              <h4 className="font-semibold text-ink-800 text-sm leading-snug mb-2">
                {finding.headline}
              </h4>
              <p className="text-xs text-ink-500 leading-relaxed mb-3">
                {finding.detail}
              </p>
              {finding.stat && (
                <span
                  className="inline-block rounded-full px-3 py-1 text-sm font-mono font-bold tracking-wide"
                  style={{
                    color,
                    background: `${color}12`,
                    border: `1px solid ${color}25`,
                  }}
                >
                  {finding.stat}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Heatmap cell
// ---------------------------------------------------------------------------

function HeatmapCell({
  pestleId,
  scenarioId,
  pestleColor,
  isAffected,
}: {
  pestleId: string;
  scenarioId: string;
  pestleColor: string;
  isAffected: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const scenario = scenarios.find((s) => s.id === scenarioId);
  const pestleLabel = pestleCategories.find((p) => p.id === pestleId)?.label ?? pestleId;

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="cursor-default"
        whileHover={{ scale: 1.3 }}
      >
        {isAffected ? (
          <div
            className="w-5 h-5 rounded-full"
            style={{
              backgroundColor: `${pestleColor}4D`,
              border: `1.5px solid ${pestleColor}40`,
            }}
          />
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-ink-200" />
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none"
          >
            <div className="px-3 py-2 rounded-lg bg-surface border border-ink-150 shadow-sm whitespace-nowrap text-center">
              <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-0.5">
                {pestleLabel}
              </div>
              <div
                className="text-xs font-medium text-ink-600"
                style={{ color: isAffected ? pestleColor : undefined }}
              >
                {scenario?.name ?? scenarioId}
              </div>
              <div
                className="text-[10px] mt-0.5 text-ink-400"
                style={{ color: isAffected ? pestleColor : undefined }}
              >
                {isAffected ? 'Strong influence' : 'Low influence'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Heatmap section
// ---------------------------------------------------------------------------

function PestleHeatmap({ selectedId }: { selectedId: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-surface rounded-xl border border-ink-150 shadow-sm p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <h3 className="font-display text-lg text-ink-800">
          Impact Heatmap
        </h3>
        <span className="text-xs text-ink-400">
          PESTLE categories vs scenarios
        </span>
      </div>

      {/* Column headers — scenario names */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row */}
          <div className="grid gap-1.5" style={{ gridTemplateColumns: '120px repeat(8, 1fr)' }}>
            <div /> {/* Empty top-left cell */}
            {scenarios.map((s) => (
              <div
                key={s.id}
                className="text-[9px] text-center text-ink-500 leading-tight px-0.5 truncate"
                title={s.name}
              >
                <span
                  className="block w-2 h-2 rounded-full mx-auto mb-1"
                  style={{ background: s.color }}
                />
                {s.name}
              </div>
            ))}
          </div>

          {/* Data rows */}
          {pestleCategories.map((cat) => {
            const color = getColor(cat);
            const isHighlighted = selectedId === cat.id;
            const affectedIds = PESTLE_SCENARIO_AFFINITY[cat.id] ?? [];

            return (
              <motion.div
                key={cat.id}
                className="grid gap-1.5 mt-3"
                style={{ gridTemplateColumns: '120px repeat(8, 1fr)' }}
                animate={{
                  opacity: selectedId && !isHighlighted ? 0.35 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Row label */}
                <div className="flex items-center gap-2 pr-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  <span
                    className="text-xs font-medium truncate text-ink-600"
                    style={{ color: isHighlighted ? color : undefined }}
                  >
                    {cat.label}
                  </span>
                </div>

                {/* Cells */}
                {scenarios.map((s) => (
                  <HeatmapCell
                    key={`${cat.id}-${s.id}`}
                    pestleId={cat.id}
                    scenarioId={s.id}
                    pestleColor={color}
                    isAffected={affectedIds.includes(s.id)}
                  />
                ))}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-[11px] text-ink-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-ink-200" />
          Low influence
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full" style={{ background: '#8B5CF64D', border: '1.5px solid #8B5CF640' }} />
          Strong influence
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main PestleView component
// ---------------------------------------------------------------------------

export default function PestleView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => pestleCategories.find((c) => c.id === selectedId) ?? null,
    [selectedId],
  );

  const handleCardClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="h-full w-full bg-parchment overflow-y-auto">
      <div className="max-w-6xl mx-auto px-10 lg:px-16 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl lg:text-4xl text-ink-800 tracking-wide mb-2">
            PESTLE Terrain
          </h1>
          <p className="text-sm text-ink-400 tracking-wide">
            Six force layers shaping the scenario landscape
          </p>
          <div className="mt-4 border-t border-ink-200 w-24" />
        </motion.div>

        {/* Category cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          {pestleCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedId === cat.id}
              onClick={() => handleCardClick(cat.id)}
            />
          ))}
        </motion.div>

        {/* Expanded findings */}
        <AnimatePresence mode="wait">
          {selectedCategory && (
            <div className="mb-8 relative">
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-3 right-0 z-10 w-8 h-8 rounded-lg bg-ink-100 border border-ink-150 flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-200 transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
              <FindingsPanel category={selectedCategory} />
            </div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="my-8 border-t border-ink-200" />

        {/* Heatmap */}
        <PestleHeatmap selectedId={selectedId} />
      </div>
    </div>
  );
}

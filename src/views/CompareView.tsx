import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
} from 'recharts';
import { scenarios, radarDimensions } from '../data/scenarios';
import type { Scenario } from '../data/scenarios';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const AXIS_NUMERIC: Record<string, Record<string, number>> = {
  disruption: { managed: 0, high: 1 },
  transition: { weak: 0, strong: 1 },
  perception: { doom: 0, agency: 1 },
};

function axisNumeric(scenario: Scenario, axis: keyof Scenario['axes']): number {
  return AXIS_NUMERIC[axis][scenario.axes[axis]];
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const barRowVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const },
  }),
};

// ---------------------------------------------------------------------------
// Shared chart styles — Cartographic Atlas theme
// ---------------------------------------------------------------------------

const tooltipStyle = {
  backgroundColor: '#FEFDFB',
  border: '1px solid #E0DCD3',
  borderRadius: '10px',
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
  fontSize: '12px',
  color: '#3D3A35',
};

const tooltipItemStyle = { color: '#6E6A62' };

const gridColor = '#E0DCD3';
const tickColor = '#8C8578';

const tickStyle = {
  fill: '#8C8578',
  fontSize: 10,
  fontFamily: "'Source Sans 3', system-ui, sans-serif",
};

const monoTickStyle = {
  fill: '#8C8578',
  fontSize: 10,
  fontFamily: "'JetBrains Mono', monospace",
};

// ---------------------------------------------------------------------------
// Scenario Toggle Button
// ---------------------------------------------------------------------------

function ScenarioToggle({
  scenario,
  isSelected,
  isDisabled,
  onToggle,
}: {
  scenario: Scenario;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <motion.button
      onClick={() => onToggle(scenario.id)}
      disabled={isDisabled && !isSelected}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 cursor-pointer select-none
        ${
          isSelected
            ? 'bg-surface border-2 shadow-sm'
            : isDisabled
              ? 'bg-ink-100 border border-ink-200 opacity-40 cursor-not-allowed'
              : 'bg-surface border border-ink-150 hover:border-ink-200 shadow-sm'
        }
      `}
      style={
        isSelected
          ? {
              borderColor: scenario.color,
              backgroundColor: hexToRgba(scenario.color, 0.06),
            }
          : undefined
      }
    >
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: scenario.color }}
      />
      <span
        className={`text-xs tracking-wide ${isSelected ? 'text-ink-800 font-semibold' : 'text-ink-600'}`}
      >
        {scenario.name}
      </span>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Overlapping Radar Chart
// ---------------------------------------------------------------------------

function OverlappingRadar({ selected }: { selected: Scenario[] }) {
  const radarData = useMemo(() => {
    return radarDimensions.map((dim) => {
      const entry: Record<string, string | number> = { dimension: dim };
      selected.forEach((s) => {
        const score = s.radarScores.find((r) => r.label === dim);
        entry[s.id] = score?.value ?? 0;
      });
      return entry;
    });
  }, [selected]);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface rounded-xl border border-ink-150 shadow-sm p-8"
    >
      <h3 className="font-display text-ink-800 text-lg mb-1 text-center">Radar Overlay</h3>
      <p className="text-ink-400 text-xs text-center mb-4 tracking-wide">
        Six dimensions, side by side
      </p>
      <div className="w-full" style={{ height: 480 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="78%" data={radarData}>
            <PolarGrid stroke={gridColor} />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{
                fill: tickColor,
                fontSize: 11,
                fontFamily: "'Source Sans 3', system-ui, sans-serif",
              }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{
                fill: tickColor,
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              tickCount={6}
              axisLine={false}
            />
            {selected.map((s) => (
              <Radar
                key={s.id}
                name={s.name}
                dataKey={s.id}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.12}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: s.color,
                  stroke: '#FEFDFB',
                  strokeWidth: 2,
                }}
              />
            ))}
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-3">
        {selected.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-xs text-ink-600">{s.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Dimension Comparison Bars
// ---------------------------------------------------------------------------

function DimensionBars({ selected }: { selected: Scenario[] }) {
  const { barData, winners } = useMemo(() => {
    const data = radarDimensions.map((dim) => {
      const entry: Record<string, string | number> = { dimension: dim };
      let maxVal = -1;
      let winnerId = '';
      selected.forEach((s) => {
        const score = s.radarScores.find((r) => r.label === dim);
        const val = score?.value ?? 0;
        entry[s.id] = val;
        if (val > maxVal) {
          maxVal = val;
          winnerId = s.id;
        }
      });
      entry._winner = winnerId;
      return entry;
    });
    const winnerMap: Record<string, string> = {};
    data.forEach((d) => {
      winnerMap[d.dimension as string] = d._winner as string;
    });
    return { barData: data, winners: winnerMap };
  }, [selected]);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface rounded-xl border border-ink-150 shadow-sm p-8"
    >
      <h3 className="font-display text-ink-800 text-lg mb-1">Dimension Breakdown</h3>
      <p className="text-ink-400 text-xs mb-5 tracking-wide">
        Horizontal bars per dimension -- highest scorer highlighted
      </p>
      <div className="space-y-4">
        {barData.map((row, i) => {
          const dim = row.dimension as string;
          return (
            <motion.div
              key={dim}
              custom={i}
              variants={barRowVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3"
            >
              <div className="w-36 flex-shrink-0 text-right">
                <span className="text-xs text-ink-600 tracking-wide">{dim}</span>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                {selected.map((s) => {
                  const val = row[s.id] as number;
                  const isWinner = winners[dim] === s.id;
                  const pct = (val / 10) * 100;
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className="flex-1 h-5 bg-ink-100 rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.07, ease: 'easeOut' as const }}
                          style={{
                            backgroundColor: s.color,
                            opacity: isWinner ? 1 : 0.45,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono w-5 text-right"
                        style={{
                          color: isWinner ? s.color : '#8C8578',
                          fontWeight: isWinner ? 700 : 400,
                        }}
                      >
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Youth Reactions Comparison Table
// ---------------------------------------------------------------------------

const REACTION_LABELS: { key: keyof Scenario['youthReactions']; label: string }[] = [
  { key: 'career', label: 'Career & Education' },
  { key: 'work', label: 'Work Behaviour' },
  { key: 'mentalHealth', label: 'Mental Health' },
  { key: 'politics', label: 'Politics' },
];

function YouthReactionsTable({ selected }: { selected: Scenario[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const TRUNCATE_LEN = 120;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface rounded-xl border border-ink-150 shadow-sm p-8"
    >
      <h3 className="font-display text-ink-800 text-lg mb-1">Youth Reactions</h3>
      <p className="text-ink-400 text-xs mb-5 tracking-wide">
        How young people respond across four domains
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs text-ink-400 uppercase tracking-wider pb-3 pr-4 w-36">
                Domain
              </th>
              {selected.map((s) => (
                <th key={s.id} className="text-left pb-3 px-3" style={{ minWidth: 200 }}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span
                      className="text-xs font-semibold tracking-wide"
                      style={{ color: s.color }}
                    >
                      {s.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REACTION_LABELS.map(({ key, label }) => (
              <tr key={key} className="border-t border-ink-150">
                <td className="text-xs text-ink-800 font-medium py-3 pr-4 align-top">
                  {label}
                </td>
                {selected.map((s) => {
                  const text = s.youthReactions[key];
                  const cellKey = `${s.id}-${key}`;
                  const isExpanded = expanded[cellKey];
                  const needsTruncation = text.length > TRUNCATE_LEN;
                  const displayText =
                    needsTruncation && !isExpanded
                      ? text.slice(0, TRUNCATE_LEN) + '...'
                      : text;

                  return (
                    <td key={s.id} className="py-3 px-3 align-top">
                      <p className="text-xs text-ink-600 leading-relaxed">
                        {displayText}
                      </p>
                      {needsTruncation && (
                        <button
                          onClick={() => toggleExpand(cellKey)}
                          className="text-[10px] mt-1 cursor-pointer transition-colors duration-150"
                          style={{ color: s.color }}
                        >
                          {isExpanded ? 'show less' : 'read more'}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Key Differentiators
// ---------------------------------------------------------------------------

function KeyDifferentiators({ selected }: { selected: Scenario[] }) {
  const differentiators = useMemo(() => {
    if (selected.length < 2) return [];

    return radarDimensions
      .map((dim) => {
        const values = selected.map((s) => {
          const score = s.radarScores.find((r) => r.label === dim);
          return { scenario: s, value: score?.value ?? 0 };
        });
        const max = Math.max(...values.map((v) => v.value));
        const min = Math.min(...values.map((v) => v.value));
        const gap = max - min;
        const highest = values.find((v) => v.value === max)!;
        const lowest = values.find((v) => v.value === min)!;
        return { dimension: dim, gap, highest, lowest };
      })
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3)
      .filter((d) => d.gap > 0);
  }, [selected]);

  if (differentiators.length === 0) return null;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface rounded-xl border border-ink-150 shadow-sm p-8"
    >
      <h3 className="font-display text-ink-800 text-lg mb-1">Key Differentiators</h3>
      <p className="text-ink-400 text-xs mb-5 tracking-wide">
        Where the selected scenarios diverge most
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {differentiators.map((d, i) => (
          <motion.div
            key={d.dimension}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            className="bg-surface-warm rounded-xl p-5 border border-ink-150"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-ink-200 text-ink-800">
                GAP {d.gap}
              </span>
              <span className="text-xs font-medium text-ink-800">{d.dimension}</span>
            </div>
            <p className="text-[11px] text-ink-600 leading-relaxed">
              <span style={{ color: d.highest.scenario.color, fontWeight: 600 }}>
                {d.highest.scenario.name}
              </span>{' '}
              scores{' '}
              <span className="font-mono font-bold text-ink-900">{d.highest.value}</span>{' '}
              vs{' '}
              <span style={{ color: d.lowest.scenario.color, fontWeight: 600 }}>
                {d.lowest.scenario.name}
              </span>{' '}
              at{' '}
              <span className="font-mono font-bold text-ink-900">{d.lowest.value}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Axis Position Scatter Plots
// ---------------------------------------------------------------------------

function AxisPositionMap({ selected }: { selected: Scenario[] }) {
  const scatterDataDisruptionTransition = useMemo(
    () =>
      selected.map((s) => ({
        x: axisNumeric(s, 'disruption'),
        y: axisNumeric(s, 'transition'),
        name: s.name,
        color: s.color,
      })),
    [selected],
  );

  const scatterDataDisruptionPerception = useMemo(
    () =>
      selected.map((s) => ({
        x: axisNumeric(s, 'disruption'),
        y: axisNumeric(s, 'perception'),
        name: s.name,
        color: s.color,
      })),
    [selected],
  );

  const renderDot = (props: {
    cx?: number;
    cy?: number;
    payload?: { color: string; name: string };
  }) => {
    const { cx = 0, cy = 0, payload } = props;
    if (!payload) return null;
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill={payload.color}
          fillOpacity={0.2}
          stroke={payload.color}
          strokeWidth={2}
        />
        <circle cx={cx} cy={cy} r={4} fill={payload.color} />
        <text
          x={cx}
          y={cy - 16}
          textAnchor="middle"
          fill={payload.color}
          fontSize={10}
          fontFamily="'Source Sans 3', system-ui, sans-serif"
          fontWeight={600}
        >
          {payload.name}
        </text>
      </g>
    );
  };

  const axisTickStyle = {
    fill: tickColor,
    fontSize: 10,
    fontFamily: "'Source Sans 3', system-ui, sans-serif",
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface rounded-xl border border-ink-150 shadow-sm p-8"
    >
      <h3 className="font-display text-ink-800 text-lg mb-1">Axis Position Map</h3>
      <p className="text-ink-400 text-xs mb-5 tracking-wide">
        Where each scenario sits on the three structural axes
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Disruption vs Transition */}
        <div>
          <p className="text-xs text-ink-600 text-center mb-2 tracking-wide">
            Disruption vs Transition
          </p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 24, right: 24, bottom: 24, left: 24 }}>
                <CartesianGrid stroke={gridColor} />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[-0.2, 1.2]}
                  ticks={[0, 1]}
                  tickFormatter={(v: number) => (v === 0 ? 'Managed' : 'High')}
                  tick={axisTickStyle}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                  label={{
                    value: 'Disruption',
                    position: 'insideBottom',
                    offset: -12,
                    style: { ...axisTickStyle, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[-0.2, 1.2]}
                  ticks={[0, 1]}
                  tickFormatter={(v: number) => (v === 0 ? 'Weak' : 'Strong')}
                  tick={axisTickStyle}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                  label={{
                    value: 'Transition',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    style: { ...axisTickStyle, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' },
                  }}
                />
                <Scatter
                  data={scatterDataDisruptionTransition}
                  shape={renderDot}
                  isAnimationActive={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disruption vs Perception */}
        <div>
          <p className="text-xs text-ink-600 text-center mb-2 tracking-wide">
            Disruption vs Perception
          </p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 24, right: 24, bottom: 24, left: 24 }}>
                <CartesianGrid stroke={gridColor} />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[-0.2, 1.2]}
                  ticks={[0, 1]}
                  tickFormatter={(v: number) => (v === 0 ? 'Managed' : 'High')}
                  tick={axisTickStyle}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                  label={{
                    value: 'Disruption',
                    position: 'insideBottom',
                    offset: -12,
                    style: { ...axisTickStyle, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[-0.2, 1.2]}
                  ticks={[0, 1]}
                  tickFormatter={(v: number) => (v === 0 ? 'Doom' : 'Agency')}
                  tick={axisTickStyle}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                  label={{
                    value: 'Perception',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    style: { ...axisTickStyle, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' },
                  }}
                />
                <Scatter
                  data={scatterDataDisruptionPerception}
                  shape={renderDot}
                  isAnimationActive={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Recharts Bar Chart variant for a summary overview
// ---------------------------------------------------------------------------

function SummaryBarChart({ selected }: { selected: Scenario[] }) {
  const data = useMemo(() => {
    return radarDimensions.map((dim) => {
      const entry: Record<string, string | number> = { dimension: dim };
      selected.forEach((s) => {
        const score = s.radarScores.find((r) => r.label === dim);
        entry[s.id] = score?.value ?? 0;
      });
      return entry;
    });
  }, [selected]);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface rounded-xl border border-ink-150 shadow-sm p-8"
    >
      <h3 className="font-display text-ink-800 text-lg mb-1">Grouped Bar View</h3>
      <p className="text-ink-400 text-xs mb-4 tracking-wide">
        An alternative angle on the same six dimensions
      </p>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={gridColor} strokeOpacity={0.6} vertical={false} />
            <XAxis
              dataKey="dimension"
              tick={tickStyle}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              domain={[0, 10]}
              tick={monoTickStyle}
              tickLine={false}
              axisLine={false}
              tickCount={6}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              cursor={{ fill: 'rgba(140, 133, 120, 0.06)' }}
            />
            {selected.map((s) => (
              <Bar
                key={s.id}
                dataKey={s.id}
                name={s.name}
                fill={s.color}
                fillOpacity={0.75}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main CompareView
// ---------------------------------------------------------------------------

export default function CompareView() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const selected = useMemo(
    () => scenarios.filter((s) => selectedIds.includes(s.id)),
    [selectedIds],
  );

  const isMaxed = selectedIds.length >= 3;

  return (
    <div className="h-full w-full overflow-auto bg-parchment">
      <div className="max-w-6xl mx-auto px-10 lg:px-16 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl text-ink-800 mb-2 tracking-wide">
            Comparison Overlay
          </h1>
          <p className="text-sm text-ink-400 tracking-wide">
            Select 2-3 scenarios to compare their futures
          </p>
          <div className="mt-4 border-t border-ink-200 w-24 mx-auto" />
        </motion.div>

        {/* Scenario Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {scenarios.map((s) => (
            <ScenarioToggle
              key={s.id}
              scenario={s}
              isSelected={selectedIds.includes(s.id)}
              isDisabled={isMaxed}
              onToggle={handleToggle}
            />
          ))}
        </motion.div>

        {/* Hint when fewer than 2 selected */}
        <AnimatePresence mode="wait">
          {selected.length < 2 && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-center py-24"
            >
              <p className="text-sm text-ink-400">
                {selected.length === 0
                  ? 'Select 2-3 scenarios above to begin comparing'
                  : 'Select one more scenario to unlock the comparison'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Comparison Content */}
        <AnimatePresence mode="wait">
          {selected.length >= 2 && (
            <motion.div
              key="comparison"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6 pb-12"
            >
              {/* Radar Chart -- the visual centrepiece */}
              <OverlappingRadar selected={selected} />

              {/* Grouped Bar Chart */}
              <SummaryBarChart selected={selected} />

              {/* Dimension Comparison Bars */}
              <DimensionBars selected={selected} />

              {/* Key Differentiators */}
              <KeyDifferentiators selected={selected} />

              {/* Youth Reactions */}
              <YouthReactionsTable selected={selected} />

              {/* Axis Position Scatter Plots */}
              <AxisPositionMap selected={selected} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

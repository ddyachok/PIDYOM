import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { EXERCISES, getProgressionRoots } from '../data/exercises';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { RadarDataPoint } from '../lib/types';
import { IconChevronRight } from '../components/icons/Icons';
import ProgressionTree from '../components/workout/ProgressionTree';

type TimePeriod = '7d' | '30d' | 'all';

// ── Radar Chart ──────────────────────────────────────────────────────────────
function RadarChart({ data, size = 280, isLight = false }: { data: RadarDataPoint[]; size?: number; isLight?: boolean }) {
  const gridColor        = isLight ? 'rgba(0,0,0,0.08)'   : 'rgba(255,255,255,0.06)';
  const activeLineColor  = isLight ? 'rgba(0,0,0,0.35)'   : 'rgba(198,255,0,0.4)';
  const labelColor       = isLight ? 'rgba(0,0,0,0.45)'   : 'rgba(255,255,255,0.45)';
  const activeLabelColor = isLight ? 'rgba(0,0,0,0.85)'   : 'rgba(198,255,0,0.9)';
  const tooltipBg        = isLight ? '#E8E8E1'             : '#0A0A0A';
  const tooltipBorder    = isLight ? 'rgba(0,0,0,0.12)'   : 'rgba(255,255,255,0.12)';
  const tooltipLabel     = isLight ? 'rgba(0,0,0,0.55)'   : 'rgba(255,255,255,0.55)';

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [touchedIndex, setTouchedIndex] = useState<number | null>(null);
  const activeIndex = touchedIndex ?? hoveredIndex;
  const center = size / 2;
  const radius = size / 2 - 36;
  const levels = 4;
  const angleSlice = (Math.PI * 2) / Math.max(data.length, 1);

  const getPoint = (value: number, fullMark: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = fullMark > 0 ? (value / fullMark) * radius : 0;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const gridLevels = Array.from({ length: levels }, (_, i) => ((i + 1) / levels) * radius);

  const dataPath = data.map((d, i) => {
    const pt = getPoint(d.value, d.fullMark, i);
    return `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }).join(' ') + ' Z';

  const getSegmentPath = (i: number) => {
    const angle = angleSlice * i - Math.PI / 2;
    const nextAngle = angleSlice * (i + 1) - Math.PI / 2;
    const r = radius + 2;
    return `M ${center} ${center} L ${center + r * Math.cos(angle)} ${center + r * Math.sin(angle)} L ${center + r * Math.cos(nextAngle)} ${center + r * Math.sin(nextAngle)} Z`;
  };

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block w-full h-auto" style={{ maxWidth: '100%' }}>
        {data.map((_, i) => (
          <path key={`hover-${i}`} d={getSegmentPath(i)} fill="transparent" className="cursor-pointer"
            onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
            onTouchStart={() => setTouchedIndex(i)} onTouchEnd={() => setTimeout(() => setTouchedIndex(null), 1500)}
          />
        ))}
        {gridLevels.map((r, i) => (
          <polygon key={i}
            points={data.map((_, j) => {
              const angle = angleSlice * j - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="none" stroke={gridColor} strokeWidth="0.5"
          />
        ))}
        {data.map((_, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const isActive = activeIndex === i;
          return (
            <line key={i} x1={center} y1={center}
              x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)}
              stroke={isActive ? activeLineColor : gridColor} strokeWidth={isActive ? 1.5 : 0.5}
            />
          );
        })}
        <motion.path d={dataPath}
          fill={activeIndex !== null ? 'rgba(198,255,0,0.12)' : 'rgba(198,255,0,0.06)'}
          stroke="rgba(198,255,0,0.6)" strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
        {data.map((d, i) => {
          const pt = getPoint(d.value, d.fullMark, i);
          const isActive = activeIndex === i;
          return (
            <motion.circle key={i} cx={pt.x} cy={pt.y} r={isActive ? 5 : 3}
              fill="#C6FF00" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            />
          );
        })}
        {data.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const labelR = radius + 22;
          const x = center + labelR * Math.cos(angle);
          const y = center + labelR * Math.sin(angle);
          const isActive = activeIndex === i;
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fill={isActive ? activeLabelColor : labelColor}
              fontSize="8" fontFamily="'Space Mono', monospace" letterSpacing="0.08em"
              fontWeight={isActive ? 'bold' : 'normal'}
            >
              {d.label}
            </text>
          );
        })}
      </svg>
      {activeIndex !== null && data[activeIndex] !== undefined && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%) translateY(8px)',
            padding: '6px 12px',
            background: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            fontSize: 9, letterSpacing: '0.1em', whiteSpace: 'nowrap',
            fontFamily: 'Space Mono, monospace',
          }}
        >
          <span style={{ color: tooltipLabel, textTransform: 'uppercase' }}>{data[activeIndex].label}</span>
          <span style={{ color: '#C6FF00', fontWeight: 700, marginLeft: 8 }}>{data[activeIndex].value} sets</span>
        </motion.div>
      )}
    </div>
  );
}

// ── Volume Bar Chart ─────────────────────────────────────────────────────────
function VolumeChart({ data, onBarHover, hoveredIndex, isLight }: {
  data: { label: string; value: number; date?: string }[];
  onBarHover: (index: number | null) => void;
  hoveredIndex: number | null;
  isLight: boolean;
}) {
  const barColor   = isLight ? 'rgba(10,10,10,0.15)'   : 'rgba(255,255,255,0.18)';
  const labelColor = isLight ? 'rgba(10,10,10,0.35)'   : 'rgba(255,255,255,0.28)';
  const hoverLabel = isLight ? 'rgba(10,10,10,0.65)'   : 'rgba(255,255,255,0.65)';
  const tooltipBg  = isLight ? '#E8E8E1'               : '#0A0A0A';
  const tooltipBrd = isLight ? 'rgba(0,0,0,0.12)'      : 'rgba(255,255,255,0.12)';
  const tooltipTxt = isLight ? 'rgba(0,0,0,0.7)'       : 'rgba(255,255,255,0.75)';

  const max = data.length ? Math.max(...data.map(d => d.value), 1) : 1;
  if (!data.length) {
    return <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: labelColor, fontFamily: 'Space Mono, monospace' }}>No data</div>;
  }
  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible', paddingBottom: 8, marginLeft: -4, marginRight: -4 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 88, minWidth: data.length * 18 }}>
        {data.map((d, i) => {
          const heightPct = max > 0 ? (d.value / max) * 100 : 0;
          const isHovered = hoveredIndex === i;
          return (
            <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, minWidth: 14, flex: 1, cursor: 'pointer' }}
              onMouseEnter={() => onBarHover(i)} onMouseLeave={() => onBarHover(null)}
              onTouchStart={() => onBarHover(i)} onTouchEnd={() => setTimeout(() => onBarHover(null), 1500)}
            >
              <div style={{ width: '100%', height: 64, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <motion.div
                  style={{ width: '100%', maxWidth: 12, margin: '0 auto', minHeight: 1, background: isHovered ? '#C6FF00' : barColor, transition: 'background 0.15s' }}
                  initial={{ height: 0 }} animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                />
              </div>
              <span style={{ fontSize: 7, color: isHovered ? hoverLabel : labelColor, fontFamily: 'Space Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', maxWidth: 18, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {d.label}
              </span>
              {isHovered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', background: tooltipBg, border: `1px solid ${tooltipBrd}`, padding: '3px 8px', fontSize: 8, color: tooltipTxt, whiteSpace: 'nowrap', zIndex: 10, fontFamily: 'Space Mono, monospace' }}
                >
                  {d.value}kg
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const { workouts, setCurrentTab, setActiveWorkout, unlockedExercises, userEquipment, theme } = useStore();
  const isLight = theme === 'light';
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);

  // Semantic tokens — same pattern as ProfilePage
  const ink      = isLight ? '#0A0A0A'             : '#E8E8E1';
  const rule     = isLight ? '#C0C0B8'             : 'rgba(255,255,255,0.12)';
  const steel    = isLight ? '#6A6A62'             : 'rgba(255,255,255,0.38)';
  const muted    = isLight ? 'rgba(10,10,10,0.35)' : 'rgba(255,255,255,0.28)';
  const heavyRule = isLight
    ? { height: 2, background: '#0A0A0A', marginBottom: 32 }
    : { height: 1, background: 'rgba(255,255,255,0.18)', marginBottom: 32 };

  const filteredWorkouts = useMemo(() => {
    const completed = workouts.filter(w => w.completed);
    if (timePeriod === 'all') return completed;
    const cutoff = timePeriod === '7d' ? subDays(new Date(), 7) : subDays(new Date(), 30);
    return completed.filter(w => {
      const d = parseISO(w.date);
      return isAfter(d, cutoff) || d.toDateString() === cutoff.toDateString();
    });
  }, [workouts, timePeriod]);

  const stats = useMemo(() => {
    const totalWorkouts = filteredWorkouts.length;
    const totalSets     = filteredWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).length, 0), 0);
    const totalVolume   = filteredWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.reps * s.weight, 0), 0), 0);
    const maxWeight     = filteredWorkouts.reduce((a, w) => Math.max(a, ...w.exercises.flatMap(e => e.sets.filter(s => s.completed).map(s => s.weight))), 0);

    const exerciseCounts: Record<string, number> = {};
    filteredWorkouts.forEach(w => w.exercises.forEach(e => {
      exerciseCounts[e.exercise.movementPattern] = (exerciseCounts[e.exercise.movementPattern] || 0) + e.sets.filter(s => s.completed).length;
    }));

    const daysToShow = timePeriod === '7d' ? 7 : 30;
    const periodData = Array.from({ length: daysToShow }, (_, i) => {
      const dayDate = subDays(new Date(), daysToShow - 1 - i);
      const date    = format(dayDate, 'yyyy-MM-dd');
      const vol     = filteredWorkouts.filter(w => w.date === date).reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.reps * s.weight, 0), 0), 0);
      return { label: format(dayDate, 'EEE').slice(0, 2), value: vol, date };
    });

    return { totalWorkouts, totalSets, totalVolume, exerciseCounts, maxWeight, periodData };
  }, [filteredWorkouts, timePeriod]);

  const personalRecords = useMemo(() => {
    const prMap: Record<string, { exerciseName: string; maxWeight: number; maxReps: number; bestVolume: number }> = {};
    workouts.filter(w => w.completed).forEach(w => w.exercises.forEach(e => {
      const completed = e.sets.filter(s => s.completed);
      if (!completed.length) return;
      const best = prMap[e.exerciseId] || { exerciseName: e.exercise.name, maxWeight: 0, maxReps: 0, bestVolume: 0 };
      completed.forEach(s => {
        if (s.weight > best.maxWeight) best.maxWeight = s.weight;
        if (s.reps   > best.maxReps)   best.maxReps   = s.reps;
        if (s.weight * s.reps > best.bestVolume) best.bestVolume = s.weight * s.reps;
      });
      prMap[e.exerciseId] = best;
    }));
    return Object.entries(prMap).sort((a, b) => b[1].maxWeight - a[1].maxWeight).slice(0, 8);
  }, [workouts]);

  const treeProgress = useMemo(() => {
    return getProgressionRoots()
      .filter(e => e.equipment.some(eq => userEquipment.includes(eq)))
      .map(root => {
        const treeIds: string[] = [root.id];
        const addChildren = (parentId: string) => {
          EXERCISES.find(e => e.id === parentId)?.progressionChildren?.forEach(childId => {
            treeIds.push(childId);
            addChildren(childId);
          });
        };
        addChildren(root.id);
        const total    = treeIds.length;
        const unlocked = treeIds.filter(id => unlockedExercises.includes(id)).length;
        return { root, total, unlocked, pct: Math.round((unlocked / total) * 100) };
      })
      .filter(t => t.total > 1);
  }, [unlockedExercises, userEquipment]);

  const radarData: RadarDataPoint[] = useMemo(() => {
    const patterns = ['hinge', 'squat', 'push', 'pull', 'core', 'carry'];
    const max = Math.max(...patterns.map(p => stats.exerciseCounts[p] || 0), 10);
    return patterns.map(p => ({ label: p.toUpperCase(), value: stats.exerciseCounts[p] || 0, fullMark: max }));
  }, [stats]);

  if (selectedTreeId) {
    return <ProgressionTree exerciseId={selectedTreeId} onBack={() => setSelectedTreeId(null)} />;
  }

  const PATTERNS = ['hinge', 'squat', 'push', 'pull', 'core', 'carry', 'flow'];

  return (
    <div className={isLight ? 'page-light' : ''}>
      <PageTransition className="page" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 md:mb-10">
          <div>
            <div className="coord-stamp mb-3">SEC-4 // STATISTICS</div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 48, letterSpacing: '-0.02em',
              lineHeight: 1, color: ink, textTransform: 'uppercase',
            }}>
              INTEL
            </div>
          </div>

          {/* Period filter */}
          <div style={{ display: 'flex', gap: 1, marginTop: 4 }}>
            {(['7d', '30d', 'all'] as TimePeriod[]).map(period => {
              const active = timePeriod === period;
              return (
                <button key={period} onClick={() => setTimePeriod(period)}
                  style={{
                    padding: '8px 12px',
                    fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
                    fontFamily: 'Space Mono, monospace',
                    border: active ? `1px solid ${ink}` : `1px solid ${rule}`,
                    background: active ? ink : 'transparent',
                    color: active ? (isLight ? '#E8E8E1' : '#0A0A0A') : steel,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {period === 'all' ? 'ALL' : period.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Heavy rule */}
        <div style={heavyRule} />

        {/* ── 01 // SIGNAL — Hero Stats ───────────────────────── */}
        <Sec num="01" label="SIGNAL" rule={rule} steel={steel} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-end gap-6 md:gap-12 mb-8 md:mb-10"
        >
          <BigStat label="Workouts" value={String(stats.totalWorkouts)} ink={ink} steel={steel} />
          <BigStat label="Sets"     value={String(stats.totalSets)}     ink={ink} steel={steel} />
          <BigStat
            label="Volume"
            value={stats.totalVolume > 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}K` : String(stats.totalVolume)}
            ink={ink} steel={steel}
          />
          <BigStat label="Max KG"   value={stats.maxWeight ? String(stats.maxWeight) : '—'} ink={ink} steel={steel} />
        </motion.div>

        {/* Thin rule */}
        <div style={{ height: 1, background: rule, marginBottom: 32 }} />

        {/* ── 02 // RECORDS ──────────────────────────────────── */}
        {personalRecords.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8 md:mb-10">
            <Sec num="02" label="RECORDS" rule={rule} steel={steel} />
            <div>
              {personalRecords.map(([exId, pr], i) => (
                <div key={exId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 0',
                    borderBottom: `1px solid ${rule}`,
                  }}
                >
                  <span style={{ fontSize: 9, color: muted, width: 20, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 11, letterSpacing: '0.04em', color: ink, flex: 1, fontFamily: 'Space Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pr.exerciseName}
                  </span>
                  <div style={{ flex: 1, borderBottom: `1px dotted ${rule}`, alignSelf: 'flex-end', marginBottom: 3, minWidth: 16, display: 'none' }} className="md:block" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#C6FF00', fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace' }}>{pr.maxWeight}kg</span>
                      <span style={{ fontSize: 8, color: muted, marginLeft: 4, fontFamily: 'Space Mono, monospace' }}>max</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 10, color: steel, fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace' }}>{pr.maxReps}</span>
                      <span style={{ fontSize: 8, color: muted, marginLeft: 3, fontFamily: 'Space Mono, monospace' }}>reps</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Thin rule */}
        {personalRecords.length > 0 && <div style={{ height: 1, background: rule, marginBottom: 32 }} />}

        {/* ── 03 // TREES ────────────────────────────────────── */}
        {treeProgress.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 md:mb-10">
            <Sec num="03" label="TREES" rule={rule} steel={steel} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {treeProgress.map((tree, i) => (
                <motion.button
                  key={tree.root.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  onClick={() => setSelectedTreeId(tree.root.id)}
                  style={{
                    padding: '14px 16px',
                    border: `1px solid ${rule}`,
                    background: 'transparent',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, letterSpacing: '0.06em', fontWeight: 700, color: ink, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }}>
                      {tree.root.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 9, color: steel, fontFamily: 'Space Mono, monospace' }}>{tree.root.movementPattern}</span>
                      <span style={{ fontSize: 10, color: '#C6FF00', fontWeight: 700, fontFamily: 'Space Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>{tree.pct}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 2, background: rule, position: 'relative', overflow: 'hidden' }}>
                      <motion.div
                        style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: '#C6FF00' }}
                        initial={{ width: 0 }} animate={{ width: `${tree.pct}%` }}
                        transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                      />
                    </div>
                    <span style={{ fontSize: 9, color: muted, fontFamily: 'Space Mono, monospace', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {tree.unlocked}/{tree.total}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Heavy rule */}
        <div style={heavyRule} />

        {/* ── 04 // RADAR — Movement Balance ─────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-8 md:mb-10">
          <Sec num="04" label="RADAR" rule={rule} steel={steel} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontSize: 9, color: muted, marginBottom: 20, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em' }}>
              TAP SEGMENTS FOR DETAIL
            </p>
            <RadarChart data={radarData} size={260} isLight={isLight} />
          </div>
        </motion.div>

        {/* Thin rule */}
        <div style={{ height: 1, background: rule, marginBottom: 32 }} />

        {/* ── 05 // PATTERN — Breakdown ──────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8 md:mb-10">
          <Sec num="05" label="PATTERN" rule={rule} steel={steel} />
          <div>
            {PATTERNS.map((p, i) => {
              const count    = stats.exerciseCounts[p] || 0;
              const maxCount = Math.max(...Object.values(stats.exerciseCounts), 1);
              return (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${rule}` }}>
                  <span style={{ fontSize: 9, color: steel, width: 52, textTransform: 'uppercase', fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', flexShrink: 0 }}>{p}</span>
                  <div style={{ flex: 1, height: 2, background: rule, position: 'relative', overflow: 'hidden' }}>
                    <motion.div
                      style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: count > 0 ? '#C6FF00' : 'transparent', opacity: 0.5 }}
                      initial={{ width: 0 }} animate={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                    />
                  </div>
                  <span style={{ fontSize: 10, color: count > 0 ? ink : muted, width: 28, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Thin rule */}
        {timePeriod !== 'all' && <div style={{ height: 1, background: rule, marginBottom: 32 }} />}

        {/* ── 06 // VOLUME ───────────────────────────────────── */}
        {timePeriod !== 'all' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-8 md:mb-10">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Sec num="06" label={timePeriod === '7d' ? 'WEEKLY VOL' : 'MONTHLY VOL'} rule={rule} steel={steel} noMargin />
              {stats.periodData.length > 0 && (
                <span style={{ fontSize: 8, color: muted, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', flexShrink: 0, marginLeft: 12 }}>
                  AVG {Math.round(stats.periodData.reduce((a, d) => a + d.value, 0) / stats.periodData.length)}KG
                </span>
              )}
            </div>
            <VolumeChart data={stats.periodData} onBarHover={setHoveredBarIndex} hoveredIndex={hoveredBarIndex} isLight={isLight} />
          </motion.div>
        )}

        {/* Heavy rule */}
        <div style={heavyRule} />

        {/* ── 07 // LOG — Workout History ─────────────────────── */}
        {filteredWorkouts.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Sec num="07" label="LOG" rule={rule} steel={steel} noMargin />
              <button onClick={() => setCurrentTab('workouts')}
                style={{ fontSize: 8, letterSpacing: '0.12em', color: muted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', flexShrink: 0, marginLeft: 12 }}
              >
                VIEW ALL
              </button>
            </div>
            <div>
              {filteredWorkouts.slice(0, 8).map((w, i) => {
                const vol = w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).reduce((b, s) => b + s.reps * s.weight, 0), 0);
                return (
                  <motion.button key={w.id}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.03 }}
                    onClick={() => { setActiveWorkout(w.id); setCurrentTab('workouts'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 0', width: '100%',
                      background: 'none', border: 'none',
                      borderBottom: `1px solid ${rule}`,
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 9, color: muted, width: 20, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 5px rgba(34,197,94,0.4)' }} />
                    <span style={{ fontSize: 11, letterSpacing: '0.04em', color: ink, flex: 1, fontFamily: 'Space Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.name}
                    </span>
                    <div style={{ flex: 1, borderBottom: `1px dotted ${rule}`, alignSelf: 'flex-end', marginBottom: 3, minWidth: 16, display: 'none' }} className="md:block" />
                    {vol > 0 && <span style={{ fontSize: 9, color: steel, fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{vol}kg</span>}
                    <span style={{ fontSize: 9, color: muted, fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{format(new Date(w.date), 'MMM d')}</span>
                    <span style={{ color: muted, display: 'flex', flexShrink: 0 }}><IconChevronRight size={11} /></span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ border: `1px solid ${rule}`, padding: '40px 24px', textAlign: 'center' }}
          >
            <p style={{ fontSize: 10, color: muted, fontFamily: 'Space Mono, monospace', marginBottom: 20 }}>
              {timePeriod === 'all'
                ? 'Complete workouts to see stats.'
                : `No workouts in the last ${timePeriod === '7d' ? '7 days' : '30 days'}.`}
            </p>
            <button onClick={() => setCurrentTab('workouts')} className="btn btn-outink">
              Start Workout
            </button>
          </motion.div>
        )}

      </PageTransition>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Sec({ num, label, rule, steel, noMargin }: { num: string; label: string; rule: string; steel: string; noMargin?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: noMargin ? 0 : 20 }}>
      <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: steel, fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{num}</span>
      <div style={{ height: 1, background: rule, flex: 1 }} />
      <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: steel, fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{label}</span>
    </div>
  );
}

function BigStat({ label, value, ink, steel }: { label: string; value: string; ink: string; steel: string }) {
  return (
    <div>
      <div style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: steel, marginBottom: 6, fontFamily: 'Space Mono, monospace' }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900, fontSize: 52, lineHeight: 1,
        letterSpacing: '-0.02em', color: ink,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
    </div>
  );
}

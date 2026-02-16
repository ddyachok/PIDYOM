import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { EXERCISES, getProgressionRoots } from '../data/exercises';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { RadarDataPoint } from '../lib/types';
import { IconChevronRight, IconTree } from '../components/icons/Icons';

type TimePeriod = '7d' | '30d' | 'all';

function RadarChart({ data, size = 280 }: { data: RadarDataPoint[]; size?: number }) {
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
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
          />
        ))}
        {data.map((_, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const isActive = activeIndex === i;
          return (
            <line key={i} x1={center} y1={center}
              x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)}
              stroke={isActive ? 'rgba(255,149,0,0.4)' : 'rgba(255,255,255,0.06)'} strokeWidth={isActive ? 1.5 : 0.5}
            />
          );
        })}
        <motion.path d={dataPath}
          fill={activeIndex !== null ? 'rgba(255,149,0,0.12)' : 'rgba(255,149,0,0.06)'}
          stroke="rgba(255,149,0,0.6)" strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
        {data.map((d, i) => {
          const pt = getPoint(d.value, d.fullMark, i);
          const isActive = activeIndex === i;
          return (
            <motion.circle key={i} cx={pt.x} cy={pt.y} r={isActive ? 5 : 3}
              fill="#ff9500" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
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
              fill={isActive ? 'rgba(255,149,0,0.9)' : 'rgba(255,255,255,0.45)'}
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
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 px-3 py-1.5 bg-black border border-white/15 text-[9px] tracking-wider whitespace-nowrap"
        >
          <span className="text-white/60 uppercase">{data[activeIndex].label}</span>
          <span className="text-[#ff9500] font-bold ml-2">{data[activeIndex].value} sets</span>
        </motion.div>
      )}
    </div>
  );
}

function VolumeChart({ data, onBarHover, hoveredIndex }: { data: { label: string; value: number; date?: string }[]; onBarHover: (index: number | null) => void; hoveredIndex: number | null }) {
  const max = data.length ? Math.max(...data.map(d => d.value), 1) : 1;
  if (!data.length) {
    return <div className="h-20 flex items-center justify-center text-[10px] text-white/30">No data</div>;
  }
  return (
    <div className="overflow-x-auto overflow-y-visible pb-2 -mx-1">
      <div className="flex items-end gap-1 h-24" style={{ minWidth: data.length * 18 }}>
        {data.map((d, i) => {
          const heightPct = max > 0 ? (d.value / max) * 100 : 0;
          const isHovered = hoveredIndex === i;
          return (
            <div key={i} className="relative flex flex-col items-center gap-1 flex-shrink-0 w-4 md:flex-1 md:min-w-0 cursor-pointer"
              style={{ minWidth: 14 }}
              onMouseEnter={() => onBarHover(i)} onMouseLeave={() => onBarHover(null)}
              onTouchStart={() => onBarHover(i)} onTouchEnd={() => setTimeout(() => onBarHover(null), 1500)}
            >
              <div className="w-full h-16 md:h-20 flex flex-col justify-end flex-shrink-0">
                <motion.div
                  className={`w-full max-w-[12px] md:max-w-none mx-auto transition-colors ${isHovered ? 'bg-[#ff9500]/50' : 'bg-white/20'}`}
                  style={{ minHeight: 1 }}
                  initial={{ height: 0 }} animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                />
              </div>
              <span className={`text-[6px] md:text-[8px] truncate max-w-[18px] text-center ${isHovered ? 'text-white/70' : 'text-white/30'}`}>{d.label}</span>
              {isHovered && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/15 px-2 py-1 text-[8px] text-white/80 whitespace-nowrap z-10"
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

export default function ProgressPage() {
  const { workouts, setCurrentTab, setActiveWorkout, unlockedExercises, userEquipment } = useStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const filteredWorkouts = useMemo(() => {
    const completed = workouts.filter(w => w.completed);
    if (timePeriod === 'all') return completed;
    const cutoffDate = timePeriod === '7d' ? subDays(new Date(), 7) : subDays(new Date(), 30);
    return completed.filter(w => {
      const workoutDate = parseISO(w.date);
      return isAfter(workoutDate, cutoffDate) || workoutDate.toDateString() === cutoffDate.toDateString();
    });
  }, [workouts, timePeriod]);

  const stats = useMemo(() => {
    const totalWorkouts = filteredWorkouts.length;
    const totalSets = filteredWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).length, 0), 0);
    const totalVolume = filteredWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.reps * s.weight, 0), 0), 0);
    const maxWeight = filteredWorkouts.reduce((a, w) => Math.max(a, ...w.exercises.flatMap(e => e.sets.filter(s => s.completed).map(s => s.weight))), 0);

    const exerciseCounts: Record<string, number> = {};
    filteredWorkouts.forEach(w => w.exercises.forEach(e => {
      exerciseCounts[e.exercise.movementPattern] = (exerciseCounts[e.exercise.movementPattern] || 0) + e.sets.filter(s => s.completed).length;
    }));

    const daysToShow = timePeriod === '7d' ? 7 : 30;
    const periodData = Array.from({ length: daysToShow }, (_, i) => {
      const dayDate = subDays(new Date(), daysToShow - 1 - i);
      const date = format(dayDate, 'yyyy-MM-dd');
      const dayWorkouts = filteredWorkouts.filter(w => w.date === date);
      const vol = dayWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.reps * s.weight, 0), 0), 0);
      return { label: format(dayDate, 'EEE').slice(0, 2), value: vol, date };
    });

    return { totalWorkouts, totalSets, totalVolume, exerciseCounts, maxWeight, periodData };
  }, [filteredWorkouts, timePeriod]);

  // Personal Records — best weight per exercise across ALL completed workouts
  const personalRecords = useMemo(() => {
    const prMap: Record<string, { exerciseName: string; maxWeight: number; maxReps: number; bestVolume: number }> = {};
    const allCompleted = workouts.filter(w => w.completed);
    allCompleted.forEach(w => w.exercises.forEach(e => {
      const completedSets = e.sets.filter(s => s.completed);
      if (completedSets.length === 0) return;
      const best = prMap[e.exerciseId] || { exerciseName: e.exercise.name, maxWeight: 0, maxReps: 0, bestVolume: 0 };
      completedSets.forEach(s => {
        if (s.weight > best.maxWeight) best.maxWeight = s.weight;
        if (s.reps > best.maxReps) best.maxReps = s.reps;
        const vol = s.weight * s.reps;
        if (vol > best.bestVolume) best.bestVolume = vol;
      });
      prMap[e.exerciseId] = best;
    }));
    return Object.entries(prMap).sort((a, b) => b[1].maxWeight - a[1].maxWeight).slice(0, 8);
  }, [workouts]);

  // Progression tree progress
  const treeProgress = useMemo(() => {
    const roots = getProgressionRoots().filter(e =>
      e.equipment.some(eq => userEquipment.includes(eq))
    );
    return roots.map(root => {
      // Count total exercises in this tree
      const treeExercises: string[] = [root.id];
      const addChildren = (parentId: string) => {
        const parent = EXERCISES.find(e => e.id === parentId);
        if (parent?.progressionChildren) {
          parent.progressionChildren.forEach(childId => {
            treeExercises.push(childId);
            addChildren(childId);
          });
        }
      };
      addChildren(root.id);
      const total = treeExercises.length;
      const unlocked = treeExercises.filter(id => unlockedExercises.includes(id)).length;
      return { root, total, unlocked, pct: Math.round((unlocked / total) * 100) };
    }).filter(t => t.total > 1); // Only show trees with progressions
  }, [unlockedExercises, userEquipment]);

  const radarData: RadarDataPoint[] = useMemo(() => {
    const patterns = ['hinge', 'squat', 'push', 'pull', 'core', 'carry'];
    const max = Math.max(...patterns.map(p => stats.exerciseCounts[p] || 0), 10);
    return patterns.map(p => ({ label: p.toUpperCase(), value: stats.exerciseCounts[p] || 0, fullMark: max }));
  }, [stats]);

  return (
    <PageTransition className="page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <div>
          <div className="coord-stamp mb-2">SEC-4 // STATISTICS</div>
          <h1 className="page-title mb-0">Stats</h1>
        </div>
        <div className="flex items-center gap-1">
          {(['7d', '30d', 'all'] as TimePeriod[]).map(period => (
            <button key={period} onClick={() => setTimePeriod(period)}
              className={`px-3 py-2 text-[9px] tracking-[0.12em] uppercase transition-all border ${
                timePeriod === period
                  ? 'border-[#ff9500]/40 bg-[#ff9500]/[0.06] text-[#ff9500]'
                  : 'border-white/[0.06] text-white/35 hover:text-white/60'
              }`}
            >
              {period === 'all' ? 'All' : period}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-end gap-6 md:gap-10 mb-10 md:mb-12"
      >
        <div className="data-readout">
          <span className="data-label">Workouts</span>
          <span className="hero-stat">{stats.totalWorkouts}</span>
        </div>
        <div className="data-readout">
          <span className="data-label">Sets</span>
          <span className="hero-stat">{stats.totalSets}</span>
        </div>
        <div className="data-readout">
          <span className="data-label">Volume</span>
          <span className="hero-stat">{stats.totalVolume > 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}K` : stats.totalVolume}</span>
        </div>
        <div className="data-readout">
          <span className="data-label">Max KG</span>
          <span className="hero-stat">{stats.maxWeight || '—'}</span>
        </div>
      </motion.div>

      <div className="divider-full" />

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8 md:mb-10">
          <span className="section-label">Personal Records</span>
          <div className="flex flex-col gap-0">
            {personalRecords.map(([exId, pr], i) => (
              <div key={exId} className="flex items-center gap-3 py-3 px-1 group">
                <span className="text-[10px] text-white/25 w-5 text-right tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[11px] md:text-[12px] tracking-[0.04em] text-white/70 flex-1 truncate">
                  {pr.exerciseName}
                </span>
                <span className="dot-leader hidden md:block" />
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[#ff9500] tabular-nums">{pr.maxWeight}kg</span>
                    <span className="text-[8px] text-white/25 ml-1">max</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/50 tabular-nums">{pr.maxReps}</span>
                    <span className="text-[8px] text-white/25 ml-1">reps</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {personalRecords.length > 0 && <div className="divider-full" />}

      {/* Progression Trees Progress */}
      {treeProgress.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 md:mb-10">
          <div className="flex items-center gap-2 mb-4">
            <IconTree size={14} className="text-white/30" />
            <span className="section-label mb-0">Progression Trees</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {treeProgress.map((tree, i) => (
              <motion.button
                key={tree.root.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                onClick={() => { setCurrentTab('profile'); }}
                className="bracket-card bracket-card-interactive text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] md:text-[12px] tracking-[0.06em] font-bold text-white/80">{tree.root.name}</span>
                  <span className="text-[9px] text-white/30">{tree.root.movementPattern}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[3px] bg-white/[0.06] relative overflow-hidden">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-[#ff9500]/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${tree.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                    />
                  </div>
                  <span className="text-[10px] text-white/50 tabular-nums shrink-0">
                    {tree.unlocked}/{tree.total}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {treeProgress.length > 0 && <div className="divider-full" />}

      {/* Radar Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-8 md:mb-10">
        <div className="flex flex-col items-center">
          <span className="section-label mb-0 text-center">Movement Balance</span>
          <p className="text-[9px] text-white/30 mb-5 text-center">Tap segments for detail</p>
          <RadarChart data={radarData} size={260} />
        </div>
      </motion.div>

      <div className="divider-full" />

      {/* Pattern Distribution */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8 md:mb-10">
        <span className="section-label">Pattern Breakdown</span>
        <div className="flex flex-col gap-0">
          {['hinge', 'squat', 'push', 'pull', 'core', 'carry', 'flow'].map((p, i) => {
            const count = stats.exerciseCounts[p] || 0;
            const maxCount = Math.max(...Object.values(stats.exerciseCounts), 1);
            return (
              <div key={p} className="flex items-center gap-3 py-2.5 group">
                <span className="text-[10px] text-white/40 w-12 uppercase">{p}</span>
                <div className="flex-1 h-[2px] bg-white/[0.04] relative overflow-hidden">
                  <motion.div className="absolute left-0 top-0 h-full bg-[#ff9500]/30 group-hover:bg-[#ff9500]/50 transition-colors"
                    initial={{ width: 0 }} animate={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                  />
                </div>
                <span className="text-[10px] text-white/35 w-8 text-right tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="divider-full" />

      {/* Volume Chart */}
      {timePeriod !== 'all' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-8 md:mb-10">
          <div className="flex items-center justify-between mb-4">
            <span className="section-label mb-0">
              {timePeriod === '7d' ? 'Weekly' : 'Monthly'} Volume
            </span>
            {stats.periodData.length > 0 && (
              <span className="text-[8px] text-white/30">
                Avg: {Math.round(stats.periodData.reduce((a, d) => a + d.value, 0) / stats.periodData.length)}kg
              </span>
            )}
          </div>
          <VolumeChart data={stats.periodData} onBarHover={setHoveredBarIndex} hoveredIndex={hoveredBarIndex} />
        </motion.div>
      )}

      {/* Workout History */}
      {filteredWorkouts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <div className="flex items-center justify-between mb-4">
            <span className="section-label mb-0">Workout History</span>
            <button onClick={() => setCurrentTab('workouts')}
              className="text-[8px] tracking-[0.12em] text-white/25 hover:text-white/50 transition-colors uppercase"
            >
              View All
            </button>
          </div>
          <div className="flex flex-col gap-0">
            {filteredWorkouts.slice(0, 8).map((w, i) => {
              const vol = w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).reduce((b, s) => b + s.reps * s.weight, 0), 0);
              return (
                <motion.button key={w.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.03 }}
                  onClick={() => { setActiveWorkout(w.id); setCurrentTab('workouts'); }}
                  className="flex items-center gap-3 py-3 px-2 text-left hover:bg-white/[0.02] transition-colors group"
                >
                  <span className="text-[9px] text-white/25 w-5 text-right tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="status-dot status-dot--done" />
                  <span className="text-[11px] tracking-[0.04em] text-white/60 group-hover:text-white transition-colors truncate flex-1">
                    {w.name}
                  </span>
                  <span className="dot-leader hidden md:block" />
                  {vol > 0 && <span className="text-[9px] text-white/40 tabular-nums">{vol}kg</span>}
                  <span className="text-[9px] text-white/25 tabular-nums shrink-0">{format(new Date(w.date), 'MMM d')}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {filteredWorkouts.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bracket-card text-center py-12">
          <p className="text-[10px] text-white/30 mb-5">
            {timePeriod === 'all'
              ? 'Complete workouts to see stats.'
              : `No workouts in the last ${timePeriod === '7d' ? '7 days' : '30 days'}.`}
          </p>
          <button onClick={() => setCurrentTab('workouts')} className="btn btn-ghost">
            Start Workout
          </button>
        </motion.div>
      )}
    </PageTransition>
  );
}

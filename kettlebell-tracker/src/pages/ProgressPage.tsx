import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { RadarDataPoint } from '../lib/types';

type TimePeriod = '7d' | '30d' | 'all';

function RadarChart({ data, size = 320 }: { data: RadarDataPoint[]; size?: number }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const center = size / 2;
  const radius = size / 2 - 40;
  const levels = 4;
  const angleSlice = (Math.PI * 2) / Math.max(data.length, 1);

  const getPoint = (value: number, fullMark: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = fullMark > 0 ? (value / fullMark) * radius : 0;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = Array.from({ length: levels }, (_, i) => ((i + 1) / levels) * radius);

  const dataPath = data.map((d, i) => {
    const pt = getPoint(d.value, d.fullMark, i);
    return `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }).join(' ') + ' Z';

  // Segment path for hover (wedge from center to two adjacent points)
  const getSegmentPath = (i: number) => {
    const angle = angleSlice * i - Math.PI / 2;
    const nextAngle = angleSlice * (i + 1) - Math.PI / 2;
    const r = radius + 2;
    const x1 = center + r * Math.cos(angle);
    const y1 = center + r * Math.sin(angle);
    const x2 = center + r * Math.cos(nextAngle);
    const y2 = center + r * Math.sin(nextAngle);
    return `M ${center} ${center} L ${x1} ${y1} L ${x2} ${y2} Z`;
  };

  return (
    <div className="relative inline-block">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block w-full h-auto"
        style={{ maxWidth: '100%' }}
      >
        {/* Invisible hover segments */}
        {data.map((d, i) => (
          <path
            key={`hover-${i}`}
            d={getSegmentPath(i)}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
        {/* Grid */}
        {gridLevels.map((r, i) => (
          <polygon
            key={i}
            points={data.map((_, j) => {
              const angle = angleSlice * j - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
          />
        ))}
        {/* Axes */}
        {data.map((_, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const isHovered = hoveredIndex === i;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke={isHovered ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.06)'}
              strokeWidth={isHovered ? 1.5 : 0.5}
            />
          );
        })}

        {/* Data area */}
        <motion.path
          d={dataPath}
          fill={hoveredIndex !== null ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)'}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const pt = getPoint(d.value, d.fullMark, i);
          const isHovered = hoveredIndex === i;
          return (
            <motion.circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={isHovered ? 5 : 3}
              fill="white"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const labelR = radius + 24;
          const x = center + labelR * Math.cos(angle);
          const y = center + labelR * Math.sin(angle);
          const isHovered = hoveredIndex === i;
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)'}
              fontSize="9"
              fontFamily="'Space Mono', monospace"
              letterSpacing="0.05em"
              fontWeight={isHovered ? 'bold' : 'normal'}
            >
              {d.label}
            </text>
          );
        })}
      </svg>
      {/* Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 px-3 py-2 bg-black/90 border border-white/20 text-[10px] md:text-[11px] tracking-wider whitespace-nowrap"
        >
          <span className="text-white/60 uppercase">{data[hoveredIndex].label}</span>
          <span className="text-white font-bold ml-2">{data[hoveredIndex].value} sets</span>
        </motion.div>
      )}
    </div>
  );
}

function MiniBar({ value, max, label, unit }: { value: number; max: number; label: string; unit: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-4 md:mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] md:text-[12px] tracking-[0.15em] md:tracking-[0.18em] text-white/30 uppercase">{label}</span>
        <span className="text-[11px] md:text-[14px] text-white/60 font-medium">{value}{unit}</span>
      </div>
      <div className="h-1.5 md:h-2 bg-white/[0.04] relative overflow-hidden rounded-full">
        <motion.div
          className="absolute left-0 top-0 h-full bg-white/30 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function VolumeChart({ data, onBarHover, hoveredIndex }: { data: { label: string; value: number; date?: string }[]; onBarHover: (index: number | null) => void; hoveredIndex: number | null }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="overflow-x-auto overflow-y-visible pb-2 -mx-1 md:mx-0">
      <div className="flex items-end gap-1 md:gap-2 h-24 md:h-32 min-w-0" style={{ minWidth: data.length * 24 }}>
        {data.map((d, i) => {
          const height = max > 0 ? (d.value / max) * 100 : 0;
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={i}
              className="relative flex flex-col items-center gap-1 md:gap-2 group cursor-pointer flex-shrink-0 w-6 md:w-auto md:flex-1 min-w-[20px] md:min-w-0"
              onMouseEnter={() => onBarHover(i)}
              onMouseLeave={() => onBarHover(null)}
            >
              <motion.div
                className={`w-full max-w-[20px] md:max-w-none bg-white/20 min-h-[2px] rounded-t transition-all ${
                  isHovered ? 'bg-white/40' : ''
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
              />
              <span className={`text-[7px] md:text-[10px] text-white/20 transition-colors truncate max-w-[28px] md:max-w-none ${isHovered ? 'text-white/70' : ''}`}>{d.label}</span>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/95 border border-white/20 px-2 py-1.5 text-[9px] md:text-[10px] text-white/90 whitespace-nowrap z-10"
                >
                  {d.value} kg{d.date ? ` · ${format(parseISO(d.date), 'MMM d')}` : ''}
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
  const { workouts, setCurrentTab, setActiveWorkout } = useStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const filteredWorkouts = useMemo(() => {
    const completed = workouts.filter(w => w.completed);
    if (timePeriod === 'all') return completed;
    
    const cutoffDate = timePeriod === '7d' 
      ? subDays(new Date(), 7)
      : subDays(new Date(), 30);
    
    return completed.filter(w => {
      const workoutDate = parseISO(w.date);
      return isAfter(workoutDate, cutoffDate) || workoutDate.toDateString() === cutoffDate.toDateString();
    });
  }, [workouts, timePeriod]);

  const stats = useMemo(() => {
    const totalWorkouts = filteredWorkouts.length;
    const totalSets = filteredWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).length, 0), 0);
    const totalReps = filteredWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.reps, 0), 0), 0);
    const totalVolume = filteredWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.reps * s.weight, 0), 0), 0);
    const typeACount = filteredWorkouts.filter(w => w.type === 'A').length;
    const typeBCount = filteredWorkouts.filter(w => w.type === 'B').length;

    const exerciseCounts: Record<string, number> = {};
    filteredWorkouts.forEach(w => w.exercises.forEach(e => {
      exerciseCounts[e.exercise.movementPattern] = (exerciseCounts[e.exercise.movementPattern] || 0) + e.sets.filter(s => s.completed).length;
    }));

    const maxWeight = filteredWorkouts.reduce((a, w) => Math.max(a, ...w.exercises.flatMap(e => e.sets.filter(s => s.completed).map(s => s.weight))), 0);
    const avgRepsPerSet = totalSets > 0 ? Math.round(totalReps / totalSets) : 0;
    const avgSetsPerWorkout = totalWorkouts > 0 ? Math.round(totalSets / totalWorkouts) : 0;
    const avgVolumePerWorkout = totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0;

    // Daily volume for chart: always last N days from today
    const daysToShow = timePeriod === '7d' ? 7 : 30;
    const periodData = Array.from({ length: daysToShow }, (_, i) => {
      const dayDate = subDays(new Date(), daysToShow - 1 - i);
      const date = format(dayDate, 'yyyy-MM-dd');
      const dayWorkouts = filteredWorkouts.filter(w => w.date === date);
      const vol = dayWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.reps * s.weight, 0), 0), 0);
      return {
        label: format(dayDate, 'EEE').slice(0, 2),
        value: vol,
        date,
      };
    });

    return { 
      totalWorkouts, 
      totalSets, 
      totalReps, 
      totalVolume, 
      typeACount, 
      typeBCount, 
      exerciseCounts, 
      maxWeight, 
      avgRepsPerSet, 
      avgSetsPerWorkout,
      avgVolumePerWorkout,
      periodData 
    };
  }, [filteredWorkouts, timePeriod]);

  const radarData: RadarDataPoint[] = useMemo(() => {
    const patterns = ['hinge', 'squat', 'push', 'pull', 'core', 'carry'];
    const max = Math.max(...patterns.map(p => stats.exerciseCounts[p] || 0), 10);
    return patterns.map(p => ({
      label: p.toUpperCase(),
      value: stats.exerciseCounts[p] || 0,
      fullMark: max,
    }));
  }, [stats]);

  const handleWorkoutClick = (workoutId: string) => {
    setActiveWorkout(workoutId);
    setCurrentTab('workouts');
  };

  return (
    <PageTransition className="page">
      {/* Header with time period filter */}
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <h1 className="page-title mb-0">Progress</h1>
        <div className="flex items-center gap-2">
          {(['7d', '30d', 'all'] as TimePeriod[]).map(period => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-[11px] tracking-[0.15em] md:tracking-[0.18em] uppercase transition-all border ${
                timePeriod === period
                  ? 'border-white/30 bg-white/[0.05] text-white'
                  : 'border-white/[0.08] bg-transparent text-white/40 hover:text-white/60 hover:border-white/15'
              }`}
            >
              {period === 'all' ? 'All' : period}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats - Interactive Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-9">
        {[
          { 
            label: 'TOTAL WORKOUTS', 
            value: stats.totalWorkouts, 
            delay: 0.1,
            subtitle: `${timePeriod === '7d' ? 'This week' : timePeriod === '30d' ? 'This month' : 'All time'}`
          },
          { 
            label: 'TOTAL VOLUME', 
            value: stats.totalVolume > 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}K` : stats.totalVolume, 
            unit: ' kg',
            delay: 0.15,
            subtitle: `${stats.avgVolumePerWorkout}kg avg`
          },
          { 
            label: 'TYPE A', 
            value: stats.typeACount, 
            delay: 0.2,
            subtitle: `${stats.totalWorkouts > 0 ? Math.round((stats.typeACount / stats.totalWorkouts) * 100) : 0}%`
          },
          { 
            label: 'TYPE B', 
            value: stats.typeBCount, 
            delay: 0.25,
            subtitle: `${stats.totalWorkouts > 0 ? Math.round((stats.typeBCount / stats.totalWorkouts) * 100) : 0}%`
          },
        ].map(s => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: s.delay }}
            className="card card-interactive text-center group"
          >
            <div className="text-xl md:text-2xl font-bold tracking-wider mb-1 md:mb-2 group-hover:text-white transition-colors">
              {s.value}{s.unit || ''}
            </div>
            <div className="text-[9px] md:text-[11px] tracking-[0.15em] md:tracking-[0.18em] text-white/25 mb-1">{s.label}</div>
            {s.subtitle && (
              <div className="text-[8px] md:text-[9px] text-white/15">{s.subtitle}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="card mb-6 md:mb-9"
      >
        <div className="flex flex-col items-center">
          <span className="section-label mb-0 text-center">Movement Balance</span>
          <p className="text-[10px] md:text-[11px] text-white/20 mb-4 md:mb-6 text-center">
            Distribution across movement patterns
          </p>
          <RadarChart data={radarData} size={300} />
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card mb-6 md:mb-9"
      >
        <span className="section-label mb-0">Performance</span>
        <div className="mt-4 md:mt-6">
          <MiniBar label="Total Sets" value={stats.totalSets} max={Math.max(stats.totalSets * 1.2, 50)} unit="" />
          <MiniBar label="Total Reps" value={stats.totalReps} max={Math.max(stats.totalReps * 1.2, 200)} unit="" />
          <MiniBar label="Max Weight" value={stats.maxWeight} max={48} unit=" kg" />
          <MiniBar label="Avg Reps/Set" value={stats.avgRepsPerSet} max={20} unit="" />
          <MiniBar label="Avg Sets/Workout" value={stats.avgSetsPerWorkout} max={30} unit="" />
        </div>
      </motion.div>

      {/* Volume Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card mb-6 md:mb-9"
      >
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <span className="section-label mb-0">
            {timePeriod === '7d' ? 'Weekly' : timePeriod === '30d' ? 'Monthly' : 'Volume'} Volume (kg)
          </span>
          {stats.periodData.length > 0 && (
            <span className="text-[9px] md:text-[11px] text-white/20">
              Avg: {Math.round(stats.periodData.reduce((a, d) => a + d.value, 0) / stats.periodData.length)}kg
            </span>
          )}
        </div>
        <VolumeChart data={stats.periodData} onBarHover={setHoveredBarIndex} hoveredIndex={hoveredBarIndex} />
      </motion.div>

      {/* Movement pattern breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card mb-6 md:mb-9"
      >
        <span className="section-label mb-0">Pattern Distribution</span>
        <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
          {['hinge', 'squat', 'push', 'pull', 'core', 'carry', 'flow'].map(p => {
            const count = stats.exerciseCounts[p] || 0;
            const maxCount = Math.max(...Object.values(stats.exerciseCounts), 1);
            const percentage = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
            return (
              <div key={p} className="flex items-center gap-3 md:gap-4 group">
                <span className="text-[10px] md:text-[12px] text-white/30 w-16 md:w-20 uppercase">{p}</span>
                <div className="flex-1 h-2 md:h-2.5 bg-white/[0.03] relative rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-white/20 rounded-full group-hover:bg-white/30 transition-colors"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  />
                </div>
                <div className="flex items-center gap-2 md:gap-3 min-w-[60px] md:min-w-[80px]">
                  <span className="text-[10px] md:text-[12px] text-white/20 w-8 md:w-10 text-right">{count}</span>
                  <span className="text-[8px] md:text-[9px] text-white/10 w-8 text-right">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Workout History */}
      {filteredWorkouts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <span className="section-label mb-0">Recent History</span>
            <button
              onClick={() => setCurrentTab('workouts')}
              className="text-[9px] md:text-[11px] tracking-[0.15em] md:tracking-[0.18em] text-white/20 hover:text-white/50 transition-colors uppercase"
            >
              View All
            </button>
          </div>
          <div className="space-y-2 md:space-y-3">
            {filteredWorkouts.slice(0, 10).map((w, i) => {
              const vol = w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).reduce((b, s) => b + s.reps * s.weight, 0), 0);
              const exerciseCount = w.exercises.length;
              const setCount = w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0);
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.03 }}
                  onClick={() => handleWorkoutClick(w.id)}
                  className="card card-interactive flex items-center justify-between py-4 px-4 md:py-5 md:px-6 group"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <span className="tag shrink-0">{w.type}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] md:text-[14px] tracking-[0.06em] md:tracking-[0.08em] font-medium truncate mb-1">
                        {w.name}
                      </div>
                      <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[11px] text-white/20">
                        <span>{exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}</span>
                        <span>·</span>
                        <span>{setCount} sets</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 shrink-0">
                    {vol > 0 && (
                      <span className="text-[11px] md:text-[13px] text-white/40 font-medium">{vol}kg</span>
                    )}
                    <span className="text-[10px] md:text-[11px] text-white/15">{format(new Date(w.date), 'MMM d')}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {filteredWorkouts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12 md:py-16"
        >
          <p className="text-[11px] md:text-[15px] text-white/15 mb-4 md:mb-6">
            {timePeriod === 'all' 
              ? 'Complete workouts to see your progress.'
              : `No workouts completed in the last ${timePeriod === '7d' ? '7 days' : '30 days'}.`
            }
          </p>
          <button
            onClick={() => setCurrentTab('workouts')}
            className="btn btn-ghost"
          >
            Start Workout
          </button>
        </motion.div>
      )}
    </PageTransition>
  );
}

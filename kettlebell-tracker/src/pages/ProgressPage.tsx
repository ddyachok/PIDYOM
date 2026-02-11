import { useMemo } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { RadarDataPoint } from '../lib/types';

function RadarChart({ data, size = 200 }: { data: RadarDataPoint[]; size?: number }) {
  const center = size / 2;
  const radius = size / 2 - 30;
  const levels = 4;
  const angleSlice = (Math.PI * 2) / data.length;

  const getPoint = (value: number, fullMark: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / fullMark) * radius;
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

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Data area */}
      <motion.path
        d={dataPath}
        fill="rgba(255,255,255,0.06)"
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
        return (
          <motion.circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={3}
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
        const labelR = radius + 18;
        const x = center + labelR * Math.cos(angle);
        const y = center + labelR * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="7"
            fontFamily="'Space Mono', monospace"
            letterSpacing="0.05em"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function MiniBar({ value, max, label, unit }: { value: number; max: number; label: string; unit: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] tracking-[0.15em] text-white/30 uppercase">{label}</span>
        <span className="text-[10px] text-white/60">{value}{unit}</span>
      </div>
      <div className="h-1 bg-white/[0.04] relative overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-white/30"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function VolumeChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            className="w-full bg-white/20 min-h-[2px]"
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 80}px` }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          />
          <span className="text-[7px] text-white/20">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const { workouts } = useStore();

  const stats = useMemo(() => {
    const completed = workouts.filter(w => w.completed);
    const totalWorkouts = completed.length;
    const totalSets = completed.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).length, 0), 0);
    const totalReps = completed.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.reps, 0), 0), 0);
    const totalVolume = completed.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.reps * s.weight, 0), 0), 0);
    const typeACount = completed.filter(w => w.type === 'A').length;
    const typeBCount = completed.filter(w => w.type === 'B').length;

    const exerciseCounts: Record<string, number> = {};
    completed.forEach(w => w.exercises.forEach(e => {
      exerciseCounts[e.exercise.movementPattern] = (exerciseCounts[e.exercise.movementPattern] || 0) + e.sets.filter(s => s.completed).length;
    }));

    const maxWeight = completed.reduce((a, w) => Math.max(a, ...w.exercises.flatMap(e => e.sets.filter(s => s.completed).map(s => s.weight))), 0);
    const avgRepsPerSet = totalSets > 0 ? Math.round(totalReps / totalSets) : 0;
    const avgSetsPerWorkout = totalWorkouts > 0 ? Math.round(totalSets / totalWorkouts) : 0;

    // Weekly volume
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
      const dayWorkouts = completed.filter(w => w.date === date);
      const vol = dayWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.filter(s => s.completed).reduce((c, s) => c + s.reps * s.weight, 0), 0), 0);
      return { label: format(subDays(new Date(), 6 - i), 'EEE').slice(0, 2), value: vol };
    });

    return { totalWorkouts, totalSets, totalReps, totalVolume, typeACount, typeBCount, exerciseCounts, maxWeight, avgRepsPerSet, avgSetsPerWorkout, last7 };
  }, [workouts]);

  const radarData: RadarDataPoint[] = useMemo(() => {
    const patterns = ['hinge', 'squat', 'push', 'pull', 'core', 'carry'];
    const max = Math.max(...patterns.map(p => stats.exerciseCounts[p] || 0), 10);
    return patterns.map(p => ({
      label: p.toUpperCase(),
      value: stats.exerciseCounts[p] || 0,
      fullMark: max,
    }));
  }, [stats]);

  return (
    <PageTransition className="page">
      <h1 className="page-title">Progress</h1>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border border-white/[0.06] p-4 mb-4 flex justify-center"
      >
        <div>
          <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase block text-center mb-2">Movement Balance</span>
          <RadarChart data={radarData} size={220} />
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'TOTAL WORKOUTS', value: stats.totalWorkouts, delay: 0.1 },
          { label: 'TOTAL VOLUME', value: stats.totalVolume > 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}K kg` : `${stats.totalVolume} kg`, delay: 0.15 },
          { label: 'TYPE A', value: stats.typeACount, delay: 0.2 },
          { label: 'TYPE B', value: stats.typeBCount, delay: 0.25 },
        ].map(s => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: s.delay }}
            className="border border-white/[0.04] p-3"
          >
            <div className="text-lg font-bold tracking-wider">{s.value}</div>
            <div className="text-[8px] tracking-[0.15em] text-white/25 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Bar Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border border-white/[0.06] p-4 mb-4"
      >
        <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase block mb-3">Performance</span>
        <MiniBar label="Total Sets" value={stats.totalSets} max={Math.max(stats.totalSets * 1.2, 50)} unit="" />
        <MiniBar label="Total Reps" value={stats.totalReps} max={Math.max(stats.totalReps * 1.2, 200)} unit="" />
        <MiniBar label="Max Weight" value={stats.maxWeight} max={48} unit=" kg" />
        <MiniBar label="Avg Reps/Set" value={stats.avgRepsPerSet} max={20} unit="" />
        <MiniBar label="Avg Sets/Workout" value={stats.avgSetsPerWorkout} max={30} unit="" />
      </motion.div>

      {/* Weekly Volume */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="border border-white/[0.06] p-4 mb-4"
      >
        <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase block mb-3">Weekly Volume (kg)</span>
        <VolumeChart data={stats.last7} />
      </motion.div>

      {/* Movement pattern breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border border-white/[0.06] p-4 mb-4"
      >
        <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase block mb-3">Pattern Distribution</span>
        {['hinge', 'squat', 'push', 'pull', 'core', 'carry', 'flow'].map(p => {
          const count = stats.exerciseCounts[p] || 0;
          const maxCount = Math.max(...Object.values(stats.exerciseCounts), 1);
          return (
            <div key={p} className="flex items-center gap-3 mb-2">
              <span className="text-[9px] text-white/30 w-12 uppercase">{p}</span>
              <div className="flex-1 h-1 bg-white/[0.03] relative">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-white/20"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                />
              </div>
              <span className="text-[9px] text-white/20 w-6 text-right">{count}</span>
            </div>
          );
        })}
      </motion.div>

      {/* Workout History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase block mb-3">History</span>
        <div className="space-y-1">
          {workouts.filter(w => w.completed).slice(0, 10).map((w, i) => {
            const vol = w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).reduce((b, s) => b + s.reps * s.weight, 0), 0);
            return (
              <div key={w.id} className="flex items-center justify-between p-2 border border-white/[0.03]">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1 border border-white/10 text-white/30">{w.type}</span>
                  <span className="text-[10px] text-white/50">{w.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-white/20">{vol > 0 ? `${vol}kg` : ''}</span>
                  <span className="text-[9px] text-white/15">{format(new Date(w.date), 'MMM d')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {workouts.filter(w => w.completed).length === 0 && (
        <div className="text-center py-8">
          <p className="text-[11px] text-white/15">Complete workouts to see your progress.</p>
        </div>
      )}
    </PageTransition>
  );
}

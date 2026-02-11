import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/ui/Logo';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { WORKOUT_TYPE_INFO } from '../data/workouts';
import { format } from 'date-fns';

export default function HomePage() {
  const { workouts, schedule, setCurrentTab, userName } = useStore();
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setIntroPhase(1), 800),
      setTimeout(() => setIntroPhase(2), 1800),
      setTimeout(() => setIntroPhase(3), 2800),
      setTimeout(() => setShowIntro(false), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySchedule = schedule.find(s => s.date === today);
  const completedWorkouts = workouts.filter(w => w.completed).length;
  const totalSets = workouts.reduce((acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0), 0);
  const totalVolume = workouts.reduce((acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).reduce((v, s) => v + s.weight * s.reps, 0), 0), 0);
  const recentWorkouts = workouts.slice(0, 3);

  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <motion.div
          key="intro"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size={140} animate />
          <motion.div className="mt-10 flex flex-col items-center gap-3">
            <AnimatePresence>
              {introPhase >= 1 && (
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl tracking-[0.35em] font-bold"
                >
                  PIDYOM
                </motion.h1>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {introPhase >= 2 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  className="text-[9px] tracking-[0.4em] uppercase"
                >
                  Movement Framework
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {introPhase >= 3 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="w-20 h-px bg-white/15 mt-2"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : (
        <PageTransition key="home" className="page">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg tracking-[0.25em] font-bold"
              >
                PIDYOM
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.3 }}
                className="text-[9px] tracking-[0.25em] uppercase mt-2"
              >
                {format(new Date(), 'EEEE, MMM d')}
                {userName ? ` \u00B7 ${userName}` : ''}
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Logo size={36} animate={false} />
            </motion.div>
          </div>

          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="section-label mb-0">Today</span>
              {todaySchedule && (
                <span className="tag">
                  {WORKOUT_TYPE_INFO[todaySchedule.workoutType].label}
                </span>
              )}
            </div>
            {todaySchedule ? (
              <div>
                <p className="text-[12px] tracking-[0.1em] mb-2">
                  {WORKOUT_TYPE_INFO[todaySchedule.workoutType].subtitle}
                </p>
                <p className="text-[10px] text-white/25 leading-relaxed mb-5">
                  {WORKOUT_TYPE_INFO[todaySchedule.workoutType].description}
                </p>
                <button
                  onClick={() => setCurrentTab('workouts')}
                  className="btn btn-full"
                >
                  Start Workout
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[11px] text-white/25 mb-5">Rest day. Recover and prepare.</p>
                <button
                  onClick={() => setCurrentTab('schedule')}
                  className="btn btn-ghost btn-full"
                >
                  View Schedule
                </button>
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {[
              { label: 'WORKOUTS', value: completedWorkouts },
              { label: 'SETS', value: totalSets },
              { label: 'VOLUME', value: totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}K` : totalVolume },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="card text-center"
              >
                <div className="text-2xl font-bold tracking-wider mb-2">{stat.value}</div>
                <div className="text-[8px] tracking-[0.2em] text-white/20">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* A/B Type Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            {(['A', 'B'] as const).map((type) => (
              <div
                key={type}
                className="card card-interactive"
                onClick={() => setCurrentTab('workouts')}
              >
                <div className="mb-3">
                  <span className="tag">
                    {WORKOUT_TYPE_INFO[type].label}
                  </span>
                </div>
                <p className="text-[10px] tracking-[0.08em] text-white/50 mb-2">
                  {WORKOUT_TYPE_INFO[type].subtitle}
                </p>
                <p className="text-[9px] text-white/15 leading-relaxed">
                  {WORKOUT_TYPE_INFO[type].description.slice(0, 70)}...
                </p>
              </div>
            ))}
          </motion.div>

          {/* Recent Workouts */}
          {recentWorkouts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="section-label mb-0">Recent</span>
                <button
                  onClick={() => setCurrentTab('workouts')}
                  className="text-[9px] tracking-[0.15em] text-white/20 hover:text-white/50 transition-colors uppercase"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {recentWorkouts.map((w) => (
                  <div
                    key={w.id}
                    className="card card-interactive flex items-center justify-between"
                    style={{ padding: '16px 24px' }}
                    onClick={() => {
                      useStore.getState().setActiveWorkout(w.id);
                      setCurrentTab('workouts');
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="tag">{w.type}</span>
                        <span className="text-[11px] tracking-[0.08em]">{w.name}</span>
                      </div>
                      <span className="text-[9px] text-white/15">
                        {format(new Date(w.date), 'MMM d')} · {w.exercises.length} exercises
                      </span>
                    </div>
                    {w.completed && (
                      <span className="text-[9px] text-green-400/50 tracking-[0.1em]">DONE</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {workouts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center py-12"
            >
              <p className="text-[11px] text-white/15 mb-6">No workouts yet. Start building your framework.</p>
              <button
                onClick={() => setCurrentTab('workouts')}
                className="btn"
              >
                Create First Workout
              </button>
            </motion.div>
          )}
        </PageTransition>
      )}
    </AnimatePresence>
  );
}

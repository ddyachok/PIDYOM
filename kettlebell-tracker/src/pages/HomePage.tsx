import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/ui/Logo';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { WORKOUT_TYPE_INFO } from '../data/workouts';
import { format } from 'date-fns';

const INTRO_SHOWN_KEY = 'pidyom-intro-shown';

export default function HomePage() {
  const { workouts, schedule, setCurrentTab, userName } = useStore();
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem(INTRO_SHOWN_KEY));
  const [introPhase, setIntroPhase] = useState(0);

  useEffect(() => {
    if (!showIntro) return;
    const timers = [
      setTimeout(() => setIntroPhase(1), 800),
      setTimeout(() => setIntroPhase(2), 1800),
      setTimeout(() => setIntroPhase(3), 2800),
      setTimeout(() => {
        sessionStorage.setItem(INTRO_SHOWN_KEY, '1');
        setShowIntro(false);
      }, 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showIntro]);

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
          <Logo size={210} animate className="w-[140px] h-[140px] md:w-[210px] md:h-[210px]" />
          <motion.div className="mt-6 md:mt-15 flex flex-col items-center gap-3 md:gap-5">
            <AnimatePresence>
              {introPhase >= 1 && (
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-4xl tracking-[0.35em] md:tracking-[0.53em] font-bold"
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
                  className="text-[11px] md:text-[17px] tracking-[0.4em] md:tracking-[0.6em] uppercase"
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
                  className="w-20 md:w-30 h-px bg-white/15 mt-2 md:mt-3"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : (
        <PageTransition key="home" className="page">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 md:mb-15">
            <div className="min-w-0 flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-3xl tracking-[0.3em] md:tracking-[0.45em] font-bold truncate"
              >
                PIDYOM
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.3 }}
                className="text-[11px] md:text-[17px] tracking-[0.3em] md:tracking-[0.45em] uppercase mt-2 md:mt-5 truncate"
              >
                {format(new Date(), 'EEEE, MMM d')}
                {userName ? ` \u00B7 ${userName}` : ''}
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="shrink-0 ml-3"
            >
              <Logo size={54} animate={false} className="w-[36px] h-[36px] md:w-[54px] md:h-[54px]" />
            </motion.div>
          </div>

          {/* Today's Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mb-6 md:mb-9"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <span className="section-label mb-0">Today</span>
              {todaySchedule && (
                <span className="tag">
                  {WORKOUT_TYPE_INFO[todaySchedule.workoutType].label}
                </span>
              )}
            </div>
            {todaySchedule ? (
              <div>
                <p className="text-[13px] md:text-[18px] tracking-[0.1em] md:tracking-[0.15em] mb-2 md:mb-3">
                  {WORKOUT_TYPE_INFO[todaySchedule.workoutType].subtitle}
                </p>
                <p className="text-[11px] md:text-[15px] text-white/25 leading-relaxed mb-4 md:mb-8">
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
                <p className="text-[11px] md:text-[17px] text-white/25 mb-2 md:mb-3">
                  {workouts.length === 0 ? 'No workout planned today. Get started by scheduling your week or starting a workout.' : 'Rest day. Recover and prepare.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mt-4 md:mt-6">
<button
                  onClick={() => setCurrentTab('workouts')}
                  className="btn btn-primary flex-1"
                >
                  Start Workout
                </button>
                  <button
                    onClick={() => setCurrentTab('schedule')}
                    className="btn btn-ghost flex-1"
                  >
                    View Schedule
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-2 md:gap-5 mb-6 md:mb-9"
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
                <div className="text-xl md:text-3xl font-bold tracking-wider mb-2 md:mb-3">{stat.value}</div>
                <div className="text-[10px] md:text-[12px] tracking-[0.2em] md:tracking-[0.3em] text-white/20">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* A/B Type Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-2 md:gap-5 mb-6 md:mb-9"
          >
            {(['A', 'B'] as const).map((type) => (
              <div
                key={type}
                className="card card-interactive"
                onClick={() => setCurrentTab('workouts')}
              >
                <div className="mb-3 md:mb-5">
                  <span className="tag">
                    {WORKOUT_TYPE_INFO[type].label}
                  </span>
                </div>
                <p className="text-[11px] md:text-[15px] tracking-[0.08em] md:tracking-[0.12em] text-white/50 mb-2 md:mb-3">
                  {WORKOUT_TYPE_INFO[type].subtitle}
                </p>
                <p className="text-[10px] md:text-[14px] text-white/15 leading-relaxed">
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
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <span className="section-label mb-0">Recent</span>
                <button
                  onClick={() => setCurrentTab('workouts')}
                  className="text-[10px] md:text-[14px] tracking-[0.15em] md:tracking-[0.23em] text-white/20 hover:text-white/50 transition-colors uppercase"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2 md:space-y-3">
                {recentWorkouts.map((w) => (
                  <div
                    key={w.id}
                    className="card card-interactive flex items-center justify-between py-4 px-4 md:py-6 md:px-9"
                    onClick={() => {
                      useStore.getState().setActiveWorkout(w.id);
                      setCurrentTab('workouts');
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 md:gap-5 mb-1 md:mb-2">
                        <span className="tag">{w.type}</span>
                        <span className="text-[12px] md:text-[17px] tracking-[0.08em] md:tracking-[0.12em] truncate">{w.name}</span>
                      </div>
                      <span className="text-[10px] md:text-[14px] text-white/15">
                        {format(new Date(w.date), 'MMM d')} · {w.exercises.length} exercises
                      </span>
                    </div>
                    {w.completed && (
                      <span className="text-[10px] md:text-[14px] text-green-400/50 tracking-[0.1em] md:tracking-[0.15em] shrink-0">DONE</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty state - no workouts yet */}
          {workouts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card text-center py-8 md:py-12 mb-6 md:mb-9"
            >
              <p className="text-[11px] md:text-[17px] text-white/25 mb-2 md:mb-3">No workouts yet.</p>
              <p className="text-[10px] md:text-[12px] text-white/15 mb-6 md:mb-8">Start building your framework.</p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center">
<button
                onClick={() => setCurrentTab('workouts')}
                className="btn btn-primary"
              >
                Create First Workout
              </button>
                <button
                  onClick={() => setCurrentTab('schedule')}
                  className="btn btn-ghost"
                >
                  Schedule your week
                </button>
              </div>
            </motion.div>
          )}
        </PageTransition>
      )}
    </AnimatePresence>
  );
}

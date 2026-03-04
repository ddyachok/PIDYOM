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
      setTimeout(() => setIntroPhase(1), 600),
      setTimeout(() => setIntroPhase(2), 1400),
      setTimeout(() => setIntroPhase(3), 2000),
      setTimeout(() => {
        sessionStorage.setItem(INTRO_SHOWN_KEY, '1');
        setShowIntro(false);
      }, 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showIntro]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySchedule = schedule.find(s => s.date === today);
  const completedWorkouts = workouts.filter(w => w.completed).length;
  const totalSets = workouts.reduce((acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0), 0);
  const totalVolume = workouts.reduce((acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).reduce((v, s) => v + s.weight * s.reps, 0), 0), 0);
  const recentWorkouts = workouts.slice(0, 5);

  const formatVolume = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v);

  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <motion.div
          key="intro"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Logo size={210} animate className="w-[120px] h-[120px] md:w-[180px] md:h-[180px]" />
          <motion.div className="mt-6 md:mt-10 flex flex-col items-center gap-3">
            <AnimatePresence>
              {introPhase >= 1 && (
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-4xl tracking-[0.35em] font-bold"
                >
                  PIDYOM
                </motion.h1>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {introPhase >= 2 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  className="text-[10px] md:text-[13px] tracking-[0.4em] uppercase"
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
                  className="w-16 h-px mt-2"
                  style={{ background: 'rgba(255,149,0,0.4)' }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : (
        <PageTransition key="home" className="page">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="min-w-0 flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-2xl tracking-[0.3em] font-bold"
              >
                PIDYOM
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-3 mt-2"
              >
                <span className="text-[10px] md:text-[12px] tracking-[0.15em] text-white/35">
                  {format(new Date(), 'dd.MM.yyyy')}
                </span>
                {userName && (
                  <>
                    <span className="text-white/15">·</span>
                    <span className="text-[10px] md:text-[12px] tracking-[0.15em] text-white/35 uppercase truncate">
                      {userName}
                    </span>
                  </>
                )}
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="shrink-0 ml-4"
            >
              <Logo size={40} animate={false} className="w-[28px] h-[28px] md:w-[40px] md:h-[40px]" />
            </motion.div>
          </div>

          {/* Coord stamp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="coord-stamp mb-8 md:mb-10"
          >
            SEC-1 // MOVEMENT FRAMEWORK
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-0 mb-10 md:mb-14"
          >
            {[
              { label: 'Workouts', value: completedWorkouts },
              { label: 'Sets', value: totalSets },
              { label: 'KG', value: formatVolume(totalVolume) },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`data-readout py-5 px-4 ${i < 2 ? 'border-r border-white/[0.07]' : ''}`}
              >
                <span className="data-label">{stat.label}</span>
                <span className="hero-stat">{stat.value}</span>
              </div>
            ))}
          </motion.div>

          <div className="divider-full" />

          {/* Today's Workout */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bracket-card bracket-card-amber mb-10 md:mb-14"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="section-label mb-0">Today's Workout</span>
              {todaySchedule && (
                <span className="tag tag-amber">
                  {WORKOUT_TYPE_INFO[todaySchedule.workoutType].label}
                </span>
              )}
            </div>
            {todaySchedule ? (
              <div>
                <p className="text-[12px] md:text-[14px] tracking-[0.06em] text-white/75 mb-3">
                  {WORKOUT_TYPE_INFO[todaySchedule.workoutType].subtitle}
                </p>
                <p className="text-[10px] md:text-[12px] text-white/30 leading-relaxed mb-6">
                  {WORKOUT_TYPE_INFO[todaySchedule.workoutType].description}
                </p>
                <button
                  onClick={() => setCurrentTab('workouts')}
                  className="btn btn-primary btn-full"
                >
                  Start Workout
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[10px] md:text-[12px] text-white/30 mb-5">
                  {workouts.length === 0
                    ? 'No workout planned. Start your first workout or schedule your week.'
                    : 'Rest day. Recover and prepare.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setCurrentTab('workouts')} className="btn btn-primary flex-1">
                    New Workout
                  </button>
                  <button onClick={() => setCurrentTab('schedule')} className="btn btn-ghost flex-1">
                    View Schedule
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent Workouts */}
          {recentWorkouts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="section-label mb-0">Recent Workouts</span>
                <button
                  onClick={() => setCurrentTab('workouts')}
                  className="text-[9px] md:text-[10px] tracking-[0.15em] text-white/25 hover:text-white/55 transition-colors uppercase"
                >
                  View All
                </button>
              </div>
              <div className="flex flex-col gap-0">
                {recentWorkouts.map((w, i) => (
                  <motion.button
                    key={w.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.04 }}
                    onClick={() => {
                      useStore.getState().setActiveWorkout(w.id);
                      setCurrentTab('workouts');
                    }}
                    className="flex items-center gap-3 py-3.5 px-2 text-left hover:bg-white/[0.025] transition-colors group border-b border-white/[0.04] last:border-0"
                  >
                    <span className="text-[10px] text-white/20 w-5 text-right tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={`status-dot ${w.completed ? 'status-dot--done' : 'status-dot--idle'}`} />
                    <span className="text-[12px] md:text-[13px] tracking-[0.04em] text-white/65 group-hover:text-white/90 transition-colors truncate flex-1">
                      {w.name}
                    </span>
                    <span className="dot-leader hidden md:block" />
                    <span className="text-[10px] text-white/30 tabular-nums shrink-0">
                      {format(new Date(w.date), 'MMM d')}
                    </span>
                    <span className="text-[9px] text-white/20 shrink-0">
                      {w.exercises.length}ex
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {workouts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bracket-card text-center py-12 md:py-16"
            >
              <p className="text-[11px] md:text-[13px] text-white/30 mb-3">No workouts logged yet.</p>
              <p className="text-[9px] md:text-[10px] text-white/18 mb-8">Start building your framework.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
                <button onClick={() => setCurrentTab('workouts')} className="btn btn-primary flex-1">
                  First Workout
                </button>
                <button onClick={() => setCurrentTab('schedule')} className="btn btn-ghost flex-1">
                  Plan Schedule
                </button>
              </div>
            </motion.div>
          )}
        </PageTransition>
      )}
    </AnimatePresence>
  );
}

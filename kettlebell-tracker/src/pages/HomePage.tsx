import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { WORKOUT_TYPE_INFO } from '../data/workouts';
import { format } from 'date-fns';

const INTRO_SHOWN_KEY = 'pidyom-intro-shown';

export default function HomePage() {
  const { workouts, schedule, setCurrentTab, userName, theme } = useStore();
  const isLight = theme === 'light';
  const ink = isLight ? '#0A0A0A' : '#E8E8E1';
  const faint = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
  const muted = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
  const textMid = isLight ? 'rgba(0,0,0,0.7)' : 'rgba(232,232,225,0.7)';
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem(INTRO_SHOWN_KEY));
  const [introPhase, setIntroPhase] = useState(0);

  useEffect(() => {
    if (!showIntro) return;
    const timers = [
      setTimeout(() => setIntroPhase(1), 400),
      setTimeout(() => setIntroPhase(2), 900),
      setTimeout(() => setIntroPhase(3), 1300),
      setTimeout(() => {
        sessionStorage.setItem(INTRO_SHOWN_KEY, '1');
        setShowIntro(false);
      }, 1900),
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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: '#0D0D0D' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div className="flex flex-col items-center gap-3">
            <AnimatePresence>
              {introPhase >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900,
                    fontSize: 72,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    color: '#E8E8E1',
                    textTransform: 'uppercase',
                  }}
                >
                  PIDYOM
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {introPhase >= 2 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#6A6A62' }}
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
                  style={{ height: 2, background: '#C6FF00', width: 40, marginTop: 8, transformOrigin: 'left' }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : (
        <PageTransition key="home" className="page">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 md:mb-10">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 36,
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                  color: ink,
                  textTransform: 'uppercase',
                }}
              >
                PIDYOM
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span style={{ fontSize: 9, letterSpacing: '0.12em', color: '#6A6A62' }}>
                  {format(new Date(), 'dd.MM.yyyy')}
                </span>
                {userName && (
                  <>
                    <span style={{ color: faint }}>·</span>
                    <span style={{ fontSize: 9, letterSpacing: '0.12em', color: '#6A6A62', textTransform: 'uppercase' }}>
                      {userName}
                    </span>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="pill pill--acid">ACTIVE</span>
            </motion.div>
          </div>

          {/* Coord stamp */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="coord-stamp mb-8"
          >
            CORE // MOVEMENT FRAMEWORK
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-3 mb-10 md:mb-12"
            style={{ borderTop: `1px solid ${faint}`, borderBottom: `1px solid ${faint}` }}
          >
            {[
              { label: 'Workouts', value: completedWorkouts },
              { label: 'Sets', value: totalSets },
              { label: 'KG Total', value: formatVolume(totalVolume) },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="data-readout py-5 px-3"
                style={{ borderRight: i < 2 ? `1px solid ${faint}` : 'none' }}
              >
                <span className="data-label mb-1">{stat.label}</span>
                <span className="hero-stat">{stat.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Today's Workout */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-10 md:mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="section-tag">Today's Mission</span>
              {todaySchedule && (
                <span className="pill pill--ghost">{WORKOUT_TYPE_INFO[todaySchedule.workoutType].label}</span>
              )}
            </div>

            {todaySchedule ? (
              <div className="wk-card">
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: 20,
                    letterSpacing: '0.02em',
                    color: ink,
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  {WORKOUT_TYPE_INFO[todaySchedule.workoutType].subtitle}
                </div>
                <p style={{ fontSize: 11, color: '#6A6A62', lineHeight: 1.6, marginBottom: 16 }}>
                  {WORKOUT_TYPE_INFO[todaySchedule.workoutType].description}
                </p>
                <button
                  onClick={() => setCurrentTab('workouts')}
                  className="btn btn-acid btn-full"
                  style={{ fontSize: 11, letterSpacing: '0.12em' }}
                >
                  EXECUTE WORKOUT →
                </button>
              </div>
            ) : (
              <div className="wk-card">
                <p style={{ fontSize: 11, color: '#6A6A62', marginBottom: 16, lineHeight: 1.6 }}>
                  {workouts.length === 0
                    ? 'No workout planned. Start your first session.'
                    : 'Rest day. Recover and prepare.'}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setCurrentTab('workouts')} className="btn btn-acid flex-1" style={{ fontSize: 10 }}>
                    New Workout
                  </button>
                  <button onClick={() => setCurrentTab('schedule')} className="btn btn-outline flex-1" style={{ fontSize: 10 }}>
                    Schedule
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent Workouts */}
          {recentWorkouts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="section-tag">Recent Log</span>
                <button
                  onClick={() => setCurrentTab('workouts')}
                  style={{ fontSize: 8, letterSpacing: '0.15em', color: '#6A6A62', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  All →
                </button>
              </div>
              <div>
                {recentWorkouts.map((w, i) => (
                  <motion.button
                    key={w.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.04 }}
                    onClick={() => {
                      useStore.getState().setActiveWorkout(w.id);
                      setCurrentTab('workouts');
                    }}
                    className="ex-row w-full text-left"
                    style={{ cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: 9, color: '#6A6A62', width: 20, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={`status-dot ${w.completed ? 'status-dot--done' : 'status-dot--idle'}`} />
                    <span style={{ fontSize: 12, letterSpacing: '0.04em', color: textMid, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.name}
                    </span>
                    <span className="dot-leader hidden md:block" />
                    <span style={{ fontSize: 9, color: '#6A6A62', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {format(new Date(w.date), 'MMM d')}
                    </span>
                    <span style={{ fontSize: 8, color: '#6A6A62', flexShrink: 0 }}>
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bracket-card text-center py-12"
              style={{ borderTop: `1px solid ${faint}` }}
            >
              <p style={{ fontSize: 11, color: '#6A6A62', marginBottom: 4 }}>No workouts logged yet.</p>
              <p style={{ fontSize: 9, color: muted, marginBottom: 20 }}>Start building your framework.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
                <button onClick={() => setCurrentTab('workouts')} className="btn btn-acid flex-1" style={{ fontSize: 10 }}>
                  First Workout
                </button>
                <button onClick={() => setCurrentTab('schedule')} className="btn btn-outline flex-1" style={{ fontSize: 10 }}>
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

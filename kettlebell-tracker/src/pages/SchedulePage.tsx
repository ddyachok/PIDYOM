import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { useToastStore } from '../store/toastStore';
import { WORKOUT_TYPE_INFO, WORKOUT_TEMPLATES, generateSchedule } from '../data/workouts';
import { WorkoutType, ScheduleEntry, typeToGoal, TRAINING_GOAL_INFO } from '../lib/types';
import { IconClose, IconGoogle } from '../components/icons/Icons';
import { EXERCISES } from '../data/exercises';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function SchedulePage() {
  const { schedule, addScheduleEntry, removeScheduleEntry, workouts, setCurrentTab, setActiveWorkout, addWorkout, theme } = useStore();
  const addToast = useToastStore((s) => s.addToast);
  const isLight = theme === 'light';
  // Semantic color tokens that adapt to theme
  const ink = isLight ? '#0A0A0A' : '#E8E8E1';
  const rule = isLight ? '#C0C0B8' : 'rgba(255,255,255,0.12)';
  const surface = isLight ? '#E0E0D8' : 'rgba(255,255,255,0.04)';
  const paper = isLight ? '#E8E8E1' : '#0D0D0D';
  const border = isLight ? '1px solid #C0C0B8' : '1px solid rgba(255,255,255,0.1)';
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleType, setScheduleType] = useState<WorkoutType>('A');
  const upcomingRef = useRef<HTMLDivElement>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const scheduleMap = useMemo(() => {
    const map: Record<string, ScheduleEntry> = {};
    schedule.forEach(s => { map[s.date] = s; });
    return map;
  }, [schedule]);

  const workoutMap = useMemo(() => {
    const map: Record<string, typeof workouts[0]> = {};
    workouts.forEach(w => { map[w.date] = w; });
    return map;
  }, [workouts]);

  const handleScheduleDay = () => {
    if (!selectedDate) return;
    const existing = scheduleMap[selectedDate];
    if (existing) removeScheduleEntry(existing.id);
    addScheduleEntry({ id: generateId(), date: selectedDate, workoutType: scheduleType, completed: false });
    addToast('Workout scheduled');
    setShowScheduleModal(false);
  };

  const handleAutoSchedule = () => {
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));
    const newSchedule = generateSchedule(nextMonday, 4);
    let added = 0;
    newSchedule.forEach(s => {
      if (!scheduleMap[s.date]) {
        addScheduleEntry({ id: generateId(), date: s.date, workoutType: s.type, completed: false });
        added++;
      }
    });
    if (added > 0) {
      addToast(`${added} workouts scheduled`);
      setTimeout(() => upcomingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
  };

  const handleStartWorkout = (entry: ScheduleEntry) => {
    const existing = workoutMap[entry.date];
    if (existing) { setActiveWorkout(existing.id); setCurrentTab('workouts'); return; }
    const typeInfo = WORKOUT_TYPE_INFO[entry.workoutType];
    const workout = {
      id: generateId(), name: typeInfo.subtitle, type: entry.workoutType,
      date: entry.date, exercises: [], focusAreas: [...typeInfo.focusAreas] as any,
      equipment: [...typeInfo.equipment] as any, completed: false,
    };
    addWorkout(workout);
    setActiveWorkout(workout.id);
    setCurrentTab('workouts');
  };

  const buildCalendarDescription = (entry: ScheduleEntry): string => {
    const info = WORKOUT_TYPE_INFO[entry.workoutType];
    const goal = typeToGoal(entry.workoutType);
    const goalInfo = TRAINING_GOAL_INFO[goal];
    const matchingTemplates = Object.values(WORKOUT_TEMPLATES).filter(t => t.trainingGoal === goal);
    const template = matchingTemplates[0];
    let desc = `🏋️ PIDYOM Workout\n\nType: ${info.label} - ${info.subtitle}\nGoal: ${goalInfo.description}\n\n`;
    if (template) {
      desc += `📋 Plan: ${template.name}\n`;
      if (template.warmup) desc += `\n🔥 Warmup:\n${template.warmup}\n`;
      desc += `\n💪 Exercises:\n`;
      template.exerciseIds.forEach((exId, i) => {
        const exercise = EXERCISES.find(e => e.id === exId);
        if (exercise) desc += `${i + 1}. ${exercise.name} — ${template.defaultSets}x${template.defaultReps} @ ${template.defaultWeight}kg\n   ${exercise.description}\n`;
      });
      desc += `\n⏱️ Duration: ~${template.durationMinutes} min\n`;
      if (template.notes) desc += `\n📝 Notes: ${template.notes}\n`;
    } else { desc += info.description; }
    return desc;
  };

  const handleGoogleCalendarExport = () => {
    if (!selectedDate) { addToast('Select a day first'); return; }
    const entry = scheduleMap[selectedDate];
    if (!entry) { addToast('No workout on selected day'); return; }
    const info = WORKOUT_TYPE_INFO[entry.workoutType];
    const title = `PIDYOM: ${info.label} — ${info.subtitle}`;
    const date = entry.date.replace(/-/g, '');
    const description = buildCalendarDescription(entry);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date}/${date}&details=${encodeURIComponent(description)}`;
    window.open(url, '_blank');
    addToast('Opening Google Calendar');
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const hasSelectedSchedule = selectedDate ? !!scheduleMap[selectedDate] : false;

  return (
    <div className={isLight ? 'page-light' : ''}>
      <PageTransition className="page" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-8 md:mb-10">
          <div>
            <div className="coord-stamp mb-3">MATRIX // SCHEDULE</div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 48,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: ink,
                textTransform: 'uppercase',
              }}
            >
              MATRIX
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleGoogleCalendarExport}
              disabled={!hasSelectedSchedule}
              className="btn btn-outink btn-sm"
              style={{ opacity: hasSelectedSchedule ? 1 : 0.35, pointerEvents: hasSelectedSchedule ? 'auto' : 'none' }}
              aria-label="Add to Google Calendar"
            >
              <IconGoogle size={13} />
            </button>
            <button
              onClick={handleAutoSchedule}
              className="btn btn-outink btn-sm"
              style={{ fontSize: 9, letterSpacing: '0.12em' }}
            >
              AUTO
            </button>
          </div>
        </div>

        {/* Heavy rule */}
        <div className="r--heavy mb-6" />

        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="pill pill--outline"
            style={{ cursor: 'pointer', background: 'transparent', border: `1px solid ${rule}`, color: '#6A6A62', fontSize: 9, padding: '5px 12px' }}
            aria-label="Previous month"
          >
            ← PRV
          </button>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: '0.08em',
              color: ink,
              textTransform: 'uppercase',
            }}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="pill pill--outline"
            style={{ cursor: 'pointer', background: 'transparent', border: `1px solid ${rule}`, color: '#6A6A62', fontSize: 9, padding: '5px 12px' }}
            aria-label="Next month"
          >
            NXT →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
            <div
              key={d}
              style={{ textAlign: 'center', fontSize: 7, letterSpacing: '0.1em', color: '#6A6A62', padding: '4px 0', fontFamily: 'Space Mono, monospace' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="cal-grid">
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = dateStr === today;
            const entry = scheduleMap[dateStr];
            const workout = workoutMap[dateStr];
            const isSelected = selectedDate === dateStr;

            return (
              <motion.button
                key={dateStr}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.003 }}
                onClick={() => {
                  setSelectedDate(dateStr);
                  if (!entry) setShowScheduleModal(true);
                }}
                className={`cal-cell${isToday ? ' cal-cell--today' : ''}${!isCurrentMonth ? ' cal-cell--other-month' : ''}`}
                style={{
                  outline: isSelected ? `2px solid ${ink}` : 'none',
                  outlineOffset: -2,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontVariantNumeric: 'tabular-nums',
                    color: isToday ? '#C6FF00' : isCurrentMonth ? ink : '#6A6A62',
                    fontWeight: isToday ? 700 : 400,
                    display: 'block',
                    lineHeight: 1.2,
                  }}
                >
                  {format(day, 'd')}
                </span>
                {entry && (
                  <span
                    className={`cal-tag ${entry.workoutType === 'A' ? 'cal-tag--ink' : 'cal-tag--acid'}`}
                    style={{ display: 'block', fontSize: 7 }}
                  >
                    {WORKOUT_TYPE_INFO[entry.workoutType].label}
                  </span>
                )}
                {workout?.completed && (
                  <span
                    style={{
                      position: 'absolute', top: 3, right: 3,
                      width: 4, height: 4, background: '#22c55e', borderRadius: '50%',
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          <span style={{ fontSize: 8, color: '#6A6A62', letterSpacing: '0.1em', fontFamily: 'Space Mono, monospace' }}>TAP DAY TO PLAN</span>
          <div className="flex items-center gap-2 ml-auto">
            <span className="cal-tag cal-tag--ink" style={{ fontSize: 7 }}>A</span>
            <span style={{ fontSize: 7, color: '#6A6A62' }}>Workout A</span>
            <span className="cal-tag cal-tag--acid" style={{ fontSize: 7 }}>B</span>
            <span style={{ fontSize: 7, color: '#6A6A62' }}>Workout B</span>
          </div>
        </div>

        {/* Selected day panel */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
            style={{ border, padding: 20, background: surface }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: ink,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                {format(new Date(selectedDate + 'T12:00:00'), 'EEE, MMM d')}
              </span>
              {scheduleMap[selectedDate] && (
                <button
                  onClick={() => { removeScheduleEntry(scheduleMap[selectedDate].id); setSelectedDate(null); addToast('Workout removed'); }}
                  style={{ fontSize: 8, letterSpacing: '0.15em', color: '#6A6A62', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  Remove
                </button>
              )}
            </div>

            {scheduleMap[selectedDate] ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`cal-tag ${scheduleMap[selectedDate].workoutType === 'A' ? 'cal-tag--ink' : 'cal-tag--acid'}`}>
                    {WORKOUT_TYPE_INFO[scheduleMap[selectedDate].workoutType].label}
                  </span>
                  <span style={{ fontSize: 10, color: '#6A6A62' }}>
                    {WORKOUT_TYPE_INFO[scheduleMap[selectedDate].workoutType].subtitle}
                  </span>
                </div>
                <button
                  onClick={() => handleStartWorkout(scheduleMap[selectedDate])}
                  className="btn btn-solid btn-full"
                  style={{ fontSize: 10 }}
                >
                  {workoutMap[selectedDate] ? 'VIEW WORKOUT →' : 'START WORKOUT →'}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 10, color: '#6A6A62', marginBottom: 12 }}>No workout scheduled.</p>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="btn btn-outink btn-full"
                  style={{ fontSize: 10 }}
                >
                  + SCHEDULE WORKOUT
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Upcoming */}
        <div ref={upcomingRef} className="mt-10 md:mt-12">
          <div className="flex items-center gap-3 mb-5">
            <div style={{ height: 1, background: ink, width: 16 }} />
            <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6A6A62', fontFamily: 'Space Mono, monospace' }}>Upcoming</span>
          </div>
          <div>
            {schedule
              .filter(s => s.date >= today)
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 6)
              .map((s, i) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedDate(s.date)}
                  className="w-full text-left flex items-center gap-3 py-3"
                  style={{ borderBottom: `1px solid ${rule}`, cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  <span style={{ fontSize: 9, color: '#6A6A62', width: 80, flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace' }}>
                    {format(new Date(s.date + 'T12:00:00'), 'EEE, MMM d')}
                  </span>
                  <div style={{ flex: 1, height: 1, borderBottom: `1px dotted ${rule}` }} />
                  <span className={`cal-tag ${s.workoutType === 'A' ? 'cal-tag--ink' : 'cal-tag--acid'}`} style={{ fontSize: 7 }}>
                    {WORKOUT_TYPE_INFO[s.workoutType].label}
                  </span>
                </motion.button>
              ))}
            {schedule.filter(s => s.date >= today).length === 0 && (
              <p style={{ fontSize: 9, color: '#6A6A62', textAlign: 'center', padding: '24px 0', fontFamily: 'Space Mono, monospace' }}>
                No upcoming workouts. Tap AUTO to generate.
              </p>
            )}
          </div>
        </div>
      </PageTransition>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            style={{ alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowScheduleModal(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              style={{
                background: paper,
                color: ink,
                padding: 28,
                maxWidth: 360,
                width: '100%',
                border,
                boxShadow: isLight ? `4px 4px 0 #0A0A0A` : `4px 4px 0 rgba(198,255,0,0.2)`,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900,
                    fontSize: 22,
                    color: ink,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                  }}
                >
                  Schedule
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A6A62', padding: 4 }}
                  aria-label="Close"
                >
                  <IconClose size={16} />
                </button>
              </div>
              <p style={{ fontSize: 9, color: '#6A6A62', marginBottom: 20, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}>
                {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
              </p>

              <div style={{ height: 2, background: ink, marginBottom: 20 }} />

              <div className="grid grid-cols-2 gap-3 mb-6">
                {(['A', 'B'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setScheduleType(type)}
                    style={{
                      padding: '14px 12px',
                      border: scheduleType === type ? `2px solid ${ink}` : `1px solid ${rule}`,
                      background: scheduleType === type ? ink : 'transparent',
                      color: scheduleType === type ? paper : ink,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 4,
                      }}
                    >
                      {WORKOUT_TYPE_INFO[type].label}
                    </div>
                    <div style={{ fontSize: 8, color: scheduleType === type ? (isLight ? 'rgba(232,232,225,0.6)' : 'rgba(10,10,10,0.5)') : '#6A6A62', fontFamily: 'Space Mono, monospace' }}>
                      {WORKOUT_TYPE_INFO[type].subtitle}
                    </div>
                  </button>
                ))}
              </div>

              <button onClick={handleScheduleDay} className="btn btn-solid btn-full" style={{ fontSize: 10 }}>
                CONFIRM →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

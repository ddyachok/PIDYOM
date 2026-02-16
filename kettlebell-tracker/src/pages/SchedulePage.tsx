import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { useToastStore } from '../store/toastStore';
import { WORKOUT_TYPE_INFO, WORKOUT_TEMPLATES, generateSchedule } from '../data/workouts';
import { WorkoutType, ScheduleEntry, typeToGoal, TRAINING_GOAL_INFO } from '../lib/types';
import { IconChevronLeft, IconChevronRight, IconPlus, IconGoogle, IconClose } from '../components/icons/Icons';
import { EXERCISES } from '../data/exercises';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function SchedulePage() {
  const { schedule, addScheduleEntry, removeScheduleEntry, workouts, setCurrentTab, setActiveWorkout, addWorkout } = useStore();
  const addToast = useToastStore((s) => s.addToast);
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
    if (existing) {
      removeScheduleEntry(existing.id);
    }
    addScheduleEntry({
      id: generateId(),
      date: selectedDate,
      workoutType: scheduleType,
      completed: false,
    });
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
        addScheduleEntry({
          id: generateId(),
          date: s.date,
          workoutType: s.type,
          completed: false,
        });
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
    if (existing) {
      setActiveWorkout(existing.id);
      setCurrentTab('workouts');
      return;
    }
    const typeInfo = WORKOUT_TYPE_INFO[entry.workoutType];
    const workout = {
      id: generateId(),
      name: typeInfo.subtitle,
      type: entry.workoutType,
      date: entry.date,
      exercises: [],
      focusAreas: [...typeInfo.focusAreas] as any,
      equipment: [...typeInfo.equipment] as any,
      completed: false,
    };
    addWorkout(workout);
    setActiveWorkout(workout.id);
    setCurrentTab('workouts');
  };

  /** Build a detailed workout description for Google Calendar */
  const buildCalendarDescription = (entry: ScheduleEntry): string => {
    const info = WORKOUT_TYPE_INFO[entry.workoutType];
    const goal = typeToGoal(entry.workoutType);
    const goalInfo = TRAINING_GOAL_INFO[goal];

    // Find a matching template for the goal
    const matchingTemplates = Object.values(WORKOUT_TEMPLATES).filter(t => t.trainingGoal === goal);
    const template = matchingTemplates[0];

    let desc = `🏋️ PIDYOM Workout\n\n`;
    desc += `Type: ${info.label} - ${info.subtitle}\n`;
    desc += `Goal: ${goalInfo.description}\n\n`;

    if (template) {
      desc += `📋 Plan: ${template.name}\n`;
      if (template.warmup) {
        desc += `\n🔥 Warmup:\n${template.warmup}\n`;
      }
      desc += `\n💪 Exercises:\n`;
      template.exerciseIds.forEach((exId, i) => {
        const exercise = EXERCISES.find(e => e.id === exId);
        if (exercise) {
          desc += `${i + 1}. ${exercise.name} — ${template.defaultSets}x${template.defaultReps} @ ${template.defaultWeight}kg\n`;
          desc += `   ${exercise.description}\n`;
        }
      });
      desc += `\n⏱️ Duration: ~${template.durationMinutes} min\n`;
      if (template.notes) {
        desc += `\n📝 Notes: ${template.notes}\n`;
      }
    } else {
      desc += info.description;
    }

    return desc;
  };

  const handleGoogleCalendarExport = () => {
    if (!selectedDate) {
      addToast('Select a day first');
      return;
    }
    const entry = scheduleMap[selectedDate];
    if (!entry) {
      addToast('No workout on selected day');
      return;
    }
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
    <PageTransition className="page">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <div>
          <div className="coord-stamp mb-2">SEC-3 // SCHEDULE</div>
          <h1 className="page-title mb-0">Schedule</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoogleCalendarExport}
            className={`btn btn-ghost btn-sm ${!hasSelectedSchedule ? 'opacity-30 pointer-events-none' : ''}`}
            title={hasSelectedSchedule ? 'Add to Google Calendar' : 'Select a day with a workout first'}
            aria-label="Add to Google Calendar"
            disabled={!hasSelectedSchedule}
          >
            <IconGoogle size={14} />
          </button>
          <button onClick={handleAutoSchedule} className="btn btn-sm" aria-label="Auto-generate schedule">
            Auto
          </button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white/5 transition-colors" aria-label="Previous month">
          <IconChevronLeft size={16} className="text-white/40" />
        </button>
        <span className="text-[11px] md:text-[13px] tracking-[0.25em] uppercase">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white/5 transition-colors" aria-label="Next month">
          <IconChevronRight size={16} className="text-white/40" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[8px] tracking-[0.15em] text-white/25 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-white/[0.02]">
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
              transition={{ delay: i * 0.004 }}
              onClick={() => {
                setSelectedDate(dateStr);
                if (!entry) setShowScheduleModal(true);
              }}
              className={`relative aspect-square min-h-[40px] flex flex-col items-center justify-center bg-black transition-colors ${
                isSelected ? 'ring-1 ring-[#ff9500]/40' :
                isToday ? 'bg-white/[0.03]' :
                'hover:bg-white/[0.02]'
              } ${!isCurrentMonth ? 'opacity-20' : ''}`}
            >
              <span className={`text-[10px] md:text-[11px] tabular-nums ${isToday ? 'text-[#ff9500] font-bold' : 'text-white/50'}`}>
                {format(day, 'd')}
              </span>
              {entry && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`mt-0.5 w-[5px] h-[5px] ${
                    entry.workoutType === 'A' ? 'bg-[#ff9500]/60' : 'bg-[#00d9ff]/60'
                  }`}
                  style={{ borderRadius: '50%' }}
                />
              )}
              {workout?.completed && (
                <span className="absolute top-0.5 right-0.5 w-[4px] h-[4px] bg-green-400/50" style={{ borderRadius: '50%' }} />
              )}
            </motion.button>
          );
        })}
      </div>
      <p className="text-[8px] text-white/25 mt-3 text-center tracking-[0.1em] uppercase">Tap day to schedule</p>

      {/* Selected Day Detail */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bracket-card mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] tracking-[0.08em] font-bold">
              {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
            </span>
            {scheduleMap[selectedDate] && (
              <button
                onClick={() => {
                  removeScheduleEntry(scheduleMap[selectedDate].id);
                  setSelectedDate(null);
                  addToast('Workout removed');
                }}
                className="text-[8px] tracking-[0.1em] text-white/30 hover:text-white/60 transition-colors uppercase"
                aria-label="Remove"
              >
                Remove
              </button>
            )}
          </div>

          {scheduleMap[selectedDate] ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="tag">
                  {WORKOUT_TYPE_INFO[scheduleMap[selectedDate].workoutType].label}
                </span>
                <span className="text-[10px] text-white/40">
                  {WORKOUT_TYPE_INFO[scheduleMap[selectedDate].workoutType].subtitle}
                </span>
              </div>
              <button
                onClick={() => handleStartWorkout(scheduleMap[selectedDate])}
                className="btn btn-primary btn-full mt-4"
              >
                {workoutMap[selectedDate] ? 'View Workout' : 'Start Workout'}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[9px] text-white/30 mb-4">No workout scheduled.</p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="btn btn-ghost btn-full"
              >
                <IconPlus size={12} /> Schedule Workout
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Upcoming list */}
      <div ref={upcomingRef} className="mt-10 md:mt-12">
        <div className="section-label">Upcoming</div>
        <div className="flex flex-col gap-0">
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
                className="flex items-center gap-3 py-3.5 px-2 text-left hover:bg-white/[0.02] transition-colors group"
                onClick={() => setSelectedDate(s.date)}
              >
                <span className={`status-dot ${
                  s.workoutType === 'A' ? 'status-dot--active' : 'status-dot--info'
                }`} />
                <span className="text-[10px] text-white/50 group-hover:text-white/80 transition-colors tabular-nums">
                  {format(new Date(s.date + 'T12:00:00'), 'EEE, MMM d')}
                </span>
                <span className="dot-leader" />
                <span className="text-[9px] text-white/30">
                  {WORKOUT_TYPE_INFO[s.workoutType].label}
                </span>
              </motion.button>
            ))}
          {schedule.filter(s => s.date >= today).length === 0 && (
            <p className="text-[9px] text-white/20 text-center py-8">
              No upcoming workouts. Tap "Auto" to generate.
            </p>
          )}
        </div>
      </div>

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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-panel"
              style={{ maxWidth: '380px', borderTop: 'none', border: '1px solid rgba(255,255,255,0.06)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[12px] tracking-[0.2em] uppercase font-bold">Schedule Workout</h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white/5 transition-colors" aria-label="Close">
                  <IconClose size={16} className="text-white/40" />
                </button>
              </div>
              <p className="text-[9px] text-white/35 mb-6">
                {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {(['A', 'B'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setScheduleType(type)}
                    className={`bracket-card bracket-card-interactive text-left py-4 px-4 ${
                      scheduleType === type ? 'bg-white/[0.03]' : ''
                    }`}
                  >
                    <div className="text-[10px] tracking-[0.12em] font-bold mb-2">{WORKOUT_TYPE_INFO[type].label}</div>
                    <div className="text-[8px] text-white/35">{WORKOUT_TYPE_INFO[type].subtitle}</div>
                  </button>
                ))}
              </div>

              <button onClick={handleScheduleDay} className="btn btn-primary btn-full">
                Confirm
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

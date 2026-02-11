import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { useToastStore } from '../store/toastStore';
import { WORKOUT_TYPE_INFO, generateSchedule } from '../data/workouts';
import { WorkoutType, ScheduleEntry } from '../lib/types';
import { IconChevronLeft, IconChevronRight, IconPlus, IconGoogle, IconClose } from '../components/icons/Icons';

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
    addToast('Added to schedule');
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
      addToast('Schedule generated');
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

  const handleGoogleCalendarExport = () => {
    if (schedule.length === 0) {
      addToast('No events to add to calendar');
      return;
    }
    const events = schedule.slice(0, 10).map(s => {
      const info = WORKOUT_TYPE_INFO[s.workoutType];
      const title = `PIDYOM ${info.label}: ${info.subtitle}`;
      const date = s.date.replace(/-/g, '');
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date}/${date}&details=${encodeURIComponent(info.description)}`;
    });
    if (events[0]) {
      window.open(events[0], '_blank');
      addToast('Opening Google Calendar');
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <PageTransition className="page">
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <h1 className="page-title mb-0">Schedule</h1>
        <div className="flex items-center gap-3 md:gap-5">
          <button
            onClick={handleGoogleCalendarExport}
            className="p-2.5 md:p-3 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 border border-white/[0.08] hover:bg-white/5 transition-colors flex items-center justify-center"
            title="Add first upcoming workout to Google Calendar"
            aria-label="Add to Google Calendar"
          >
            <IconGoogle size={16} className="text-white/30 md:w-5 md:h-5" />
          </button>
          <button onClick={handleAutoSchedule} className="btn btn-sm" aria-label="Generate 4-week A/B schedule">
            Auto A/B
          </button>
        </div>
      </div>

      {/* A/B Legend */}
      <div className="flex items-center gap-6 md:gap-8 mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white/60" />
          <span className="text-[8px] md:text-[11px] tracking-[0.15em] md:tracking-[0.18em] text-white/30 uppercase">Type A · Strength</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-white/20" />
          <span className="text-[8px] md:text-[11px] tracking-[0.15em] md:tracking-[0.18em] text-white/30 uppercase">Type B · Conditioning</span>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2.5 md:p-3 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center hover:bg-white/5 transition-colors" aria-label="Previous month">
          <IconChevronLeft size={18} className="text-white/30 md:w-5 md:h-5" />
        </button>
        <span className="text-[11px] md:text-[15px] tracking-[0.25em] md:tracking-[0.3em] uppercase">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2.5 md:p-3 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center hover:bg-white/5 transition-colors" aria-label="Next month">
          <IconChevronRight size={18} className="text-white/30 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0 mb-2 md:mb-3">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
          <div key={d} className="text-center text-[7px] md:text-[9px] tracking-[0.15em] text-white/15 py-1 md:py-2">{d}</div>
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
              transition={{ delay: i * 0.006 }}
              onClick={() => {
                setSelectedDate(dateStr);
                if (!entry) setShowScheduleModal(true);
              }}
              className={`relative aspect-square min-h-[44px] flex flex-col items-center justify-center bg-black transition-colors ${
                isSelected ? 'ring-1 ring-white/25' :
                isToday ? 'bg-white/[0.03]' :
                'hover:bg-white/[0.02]'
              } ${!isCurrentMonth ? 'opacity-15' : ''}`}
            >
              <span className={`text-[10px] md:text-[12px] ${isToday ? 'text-white font-bold' : 'text-white/40'}`}>
                {format(day, 'd')}
              </span>
              {entry && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`mt-1 w-1.5 h-1.5 ${entry.workoutType === 'A' ? 'bg-white/60' : 'bg-white/20'}`}
                />
              )}
              {workout?.completed && (
                <span className="absolute top-1 right-1 text-[5px] text-green-400/40">&#x25CF;</span>
              )}
            </motion.button>
          );
        })}
      </div>
      <p className="text-[9px] md:text-[11px] text-white/15 mt-2 md:mt-3 text-center tracking-[0.1em] uppercase">Tap a day to schedule</p>

      {/* Selected Day Detail */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mt-6 md:mt-9"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <span className="text-[11px] md:text-[15px] tracking-[0.08em] md:tracking-[0.1em] font-bold">
              {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
            </span>
            {scheduleMap[selectedDate] && (
              <button
                onClick={() => {
                  removeScheduleEntry(scheduleMap[selectedDate].id);
                  setSelectedDate(null);
                  addToast('Removed from schedule');
                }}
                className="btn btn-ghost btn-sm min-h-[44px] md:min-h-0 py-2 px-4 text-[9px] md:text-[11px] text-white/25 hover:text-white/60 uppercase tracking-[0.1em] md:tracking-[0.15em]"
                aria-label="Remove workout from this day"
              >
                Remove workout
              </button>
            )}
          </div>

          {scheduleMap[selectedDate] ? (
            <div>
              <div className="flex items-center gap-3 md:gap-5 mb-3 md:mb-4">
                <span className="tag">
                  {WORKOUT_TYPE_INFO[scheduleMap[selectedDate].workoutType].label}
                </span>
                <span className="text-[10px] md:text-[13px] text-white/35">
                  {WORKOUT_TYPE_INFO[scheduleMap[selectedDate].workoutType].subtitle}
                </span>
              </div>
              <p className="text-[9px] md:text-[12px] text-white/20 leading-relaxed mb-5 md:mb-6">
                {WORKOUT_TYPE_INFO[scheduleMap[selectedDate].workoutType].description}
              </p>
              <button
                onClick={() => handleStartWorkout(scheduleMap[selectedDate])}
                className="btn btn-primary btn-full"
              >
                {workoutMap[selectedDate] ? 'View Workout' : 'Start Workout'}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[10px] md:text-[12px] text-white/20 mb-5 md:mb-6">No workout scheduled.</p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="btn btn-ghost btn-full"
              >
                <IconPlus size={14} className="md:w-5 md:h-5" /> Schedule Workout
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Upcoming list */}
      <div ref={upcomingRef} className="mt-8 md:mt-12">
        <div className="section-label">Upcoming</div>
        <div className="space-y-2 md:space-y-3">
          {schedule
            .filter(s => s.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 6)
            .map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card card-interactive flex items-center justify-between py-4 px-4 md:py-5 md:px-6"
                onClick={() => setSelectedDate(s.date)}
              >
                <div className="flex items-center gap-3 md:gap-5">
                  <span className="tag">{s.workoutType}</span>
                  <span className="text-[10px] md:text-[13px] text-white/40">
                    {format(new Date(s.date + 'T12:00:00'), 'EEE, MMM d')}
                  </span>
                </div>
                <span className="text-[9px] md:text-[11px] text-white/15">
                  {WORKOUT_TYPE_INFO[s.workoutType].subtitle}
                </span>
              </motion.div>
            ))}
          {schedule.filter(s => s.date >= today).length === 0 && (
            <p className="text-[10px] md:text-[12px] text-white/10 text-center py-8 md:py-12">
              No upcoming workouts. Tap "Auto A/B" to generate a schedule.
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
              aria-labelledby="schedule-modal-title"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-panel"
              style={{ maxWidth: '380px', borderTop: 'none', border: '1px solid rgba(255,255,255,0.06)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <h3 id="schedule-modal-title" className="text-[12px] md:text-[15px] tracking-[0.2em] md:tracking-[0.25em] uppercase font-bold">Schedule</h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-2.5 md:p-3 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center hover:bg-white/5 transition-colors" aria-label="Close">
                  <IconClose size={18} className="text-white/30 md:w-5 md:h-5" />
                </button>
              </div>
              <p className="text-[9px] md:text-[12px] text-white/25 mb-6 md:mb-8">
                {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')}
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-5 mb-6 md:mb-8">
                {(['A', 'B'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setScheduleType(type)}
                    className={`card text-left transition-colors py-4 px-4 md:py-5 md:px-6 ${
                      scheduleType === type ? 'border-white/20 bg-white/[0.04]' : ''
                    }`}
                  >
                    <div className="text-[10px] md:text-[12px] tracking-[0.15em] md:tracking-[0.18em] font-bold mb-1 md:mb-2">{WORKOUT_TYPE_INFO[type].label}</div>
                    <div className="text-[8px] md:text-[10px] text-white/25">{WORKOUT_TYPE_INFO[type].subtitle}</div>
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

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { useToastStore } from '../store/toastStore';
import { EXERCISES } from '../data/exercises';
import { WORKOUT_TEMPLATES, WORKOUT_TYPE_INFO } from '../data/workouts';
import { Workout, WorkoutExercise, Exercise, TrainingGoal, goalToType, typeToGoal, TRAINING_GOAL_INFO, FocusArea, ScheduleEntry } from '../lib/types';
import { format, startOfWeek, addDays, isToday, isBefore, parseISO } from 'date-fns';
import { IconPlus, IconCheck, IconTrash, IconChevronLeft, IconTree, IconClose, IconLock } from '../components/icons/Icons';
import ProgressionTree from '../components/workout/ProgressionTree';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ===== EXERCISE PREVIEW MODAL ===== */
function ExercisePreview({ exercise, onClose, onViewTree }: { exercise: Exercise; onClose: () => void; onViewTree: () => void }) {
  const unlockedExercises = useStore(s => s.unlockedExercises);
  const unlockExercise = useStore(s => s.unlockExercise);
  const addToast = useToastStore((s) => s.addToast);
  const isUnlocked = unlockedExercises.includes(exercise.id);
  const parentUnlocked = !exercise.progressionParentId || unlockedExercises.includes(exercise.progressionParentId);
  const parentExercise = exercise.progressionParentId ? EXERCISES.find(e => e.id === exercise.progressionParentId) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-preview-title"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="modal-panel"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="min-w-0 flex-1">
            <h3 id="exercise-preview-title" className="text-[14px] md:text-[18px] tracking-[0.1em] font-bold">{exercise.name}</h3>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="tag">{exercise.difficulty}</span>
              <span className="tag">{exercise.movementPattern}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 transition-colors shrink-0" aria-label="Close">
            <IconClose size={20} className="text-white/40" />
          </button>
        </div>

        <p className="text-[11px] md:text-[13px] text-white/50 leading-relaxed mb-6">{exercise.description}</p>

        {exercise.cues.length > 0 && (
          <div className="mb-6">
            <div className="section-label">Cues</div>
            <div className="space-y-2.5">
              {exercise.cues.map((cue, i) => (
                <p key={i} className="text-[10px] md:text-[12px] text-white/45 leading-relaxed pl-4 border-l border-white/[0.08]">
                  {cue}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bracket-card py-4 px-4">
            <div className="data-label mb-2">Equipment</div>
            <div className="flex flex-wrap gap-1.5">
              {exercise.equipment.map(eq => (
                <span key={eq} className="text-[10px] text-white/50">{eq}</span>
              ))}
            </div>
          </div>
          <div className="bracket-card py-4 px-4">
            <div className="data-label mb-2">Focus</div>
            <div className="flex flex-wrap gap-1.5">
              {exercise.focusAreas.map(fa => (
                <span key={fa} className="text-[10px] text-white/50">{fa}</span>
              ))}
            </div>
          </div>
        </div>

        {!isUnlocked && (
          <div className="bracket-card mb-6">
            <div className="flex items-center gap-2 mb-3">
              <IconLock size={14} className="text-white/40" />
              <span className="text-[10px] tracking-[0.1em] text-white/50 font-bold uppercase">Locked</span>
            </div>
            {parentExercise ? (
              <p className="text-[10px] text-white/35 leading-relaxed">
                Complete <span className="text-white/60">{parentExercise.name}</span> to unlock.
              </p>
            ) : (
              <p className="text-[10px] text-white/35">Progress through earlier movements.</p>
            )}
            {parentUnlocked && (
              <button
                onClick={() => { unlockExercise(exercise.id); addToast('Exercise unlocked'); }}
                className="btn btn-primary btn-sm btn-full mt-4"
              >
                Unlock Exercise
              </button>
            )}
          </div>
        )}

        <button onClick={onViewTree} className="btn btn-ghost btn-full">
          <IconTree size={14} /> View Progression Tree
        </button>
      </motion.div>
    </motion.div>
  );
}

function getRelevantFocusAreas(goal: TrainingGoal): FocusArea[] {
  switch (goal) {
    case 'strength': return ['strength'];
    case 'conditioning': return ['conditioning', 'power', 'coordination'];
    case 'mobility': return ['mobility'];
    case 'power': return ['power', 'conditioning'];
    case 'skill': return ['coordination', 'mobility'];
    default: return [];
  }
}

/* ===== WORKOUT DETAIL VIEW ===== */
function WorkoutDetail({ workout, onBack }: { workout: Workout; onBack: () => void }) {
  const { toggleSetComplete, updateSetData, addSetToExercise, addExerciseToWorkout, removeExerciseFromWorkout, completeWorkout, deleteWorkout } = useStore();
  const addToast = useToastStore((s) => s.addToast);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedExerciseForTree, setSelectedExerciseForTree] = useState<string | null>(null);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const userEquipment = useStore(s => s.userEquipment);
  const unlockedExercises = useStore(s => s.unlockedExercises);

  const allCompleted = workout.exercises.length > 0 && workout.exercises.every(ex => ex.sets.every(s => s.completed));
  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = workout.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0);
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const workoutGoal = typeToGoal(workout.type);
  const relevantFocusAreas = getRelevantFocusAreas(workoutGoal);

  const availableExercises = EXERCISES.filter(e =>
    unlockedExercises.includes(e.id) &&
    e.equipment.some(eq => userEquipment.includes(eq)) &&
    !workout.exercises.find(we => we.exerciseId === e.id)
  );

  const recommendedExercises = availableExercises.filter(e =>
    e.focusAreas.some(fa => relevantFocusAreas.includes(fa))
  );
  const otherExercises = availableExercises.filter(e =>
    !e.focusAreas.some(fa => relevantFocusAreas.includes(fa))
  );

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: generateId(),
      exerciseId: exercise.id,
      exercise,
      sets: [
        { id: generateId(), reps: 10, weight: 16, completed: false },
        { id: generateId(), reps: 10, weight: 16, completed: false },
        { id: generateId(), reps: 10, weight: 16, completed: false },
      ],
      restSeconds: 60,
      order: workout.exercises.length,
    };
    addExerciseToWorkout(workout.id, newExercise);
    setShowAddExercise(false);
  };

  const handleDeleteWorkout = () => {
    deleteWorkout(workout.id);
    addToast('Workout deleted');
    onBack();
  };

  if (selectedExerciseForTree) {
    return <ProgressionTree exerciseId={selectedExerciseForTree} onBack={() => setSelectedExerciseForTree(null)} />;
  }

  return (
    <PageTransition className="page">
      <div className="flex items-center gap-4 mb-8 md:mb-10">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 transition-colors shrink-0">
          <IconChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] md:text-[18px] tracking-[0.12em] font-bold truncate">{workout.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            {workout.focusAreas.map(f => (
              <span key={f} className="tag">{f}</span>
            ))}
            <span className="text-[9px] text-white/35 ml-1">
              {format(new Date(workout.date), 'dd.MM.yyyy')} · {completedSets}/{totalSets} sets
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!workout.completed && allCompleted && totalSets > 0 && (
            <button
              onClick={() => { completeWorkout(workout.id); addToast('Workout complete'); }}
              className="btn btn-primary btn-sm"
            >
              Complete
            </button>
          )}
          {workout.completed && <span className="text-[9px] text-green-400/60 tracking-[0.15em] uppercase">Complete</span>}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 hover:bg-white/5 transition-colors text-white/25 hover:text-red-400/70"
            aria-label="Delete workout"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5 mb-8 md:mb-10">
        <div className="progress-ring" style={{ '--progress': progressPct } as React.CSSProperties}>
          <div className="progress-ring-inner">
            <span className="text-[13px] font-bold tabular-nums">{progressPct}%</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="h-[2px] bg-white/[0.06] relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#C6FF00]/50"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-[9px] text-white/35">{completedSets} done</span>
            <span className="text-[9px] text-white/35">{totalSets - completedSets} remaining</span>
          </div>
        </div>
      </div>

      {workout.warmup && (
        <div className="bracket-card mb-8 md:mb-10 relative">
          <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-[#C6FF00]/40" />
          <div className="pl-4">
            <span className="data-label">Warmup</span>
            <p className="text-[10px] md:text-[12px] text-white/50 leading-relaxed mt-2">{workout.warmup}</p>
          </div>
        </div>
      )}

      <div className="space-y-0">
        {workout.exercises.map((ex, idx) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            {idx > 0 && <div className="divider-full" />}
            <div className="py-3">
              <div className="flex items-center justify-between mb-4">
                <button
                  className="flex-1 text-left flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
                  onClick={() => setPreviewExercise(ex.exercise)}
                >
                  <span className="text-[10px] text-white/25 w-5 text-right tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="text-[12px] md:text-[14px] tracking-[0.06em] font-bold truncate">{ex.exercise.name}</span>
                  <IconTree size={12} className="text-white/25 shrink-0" />
                </button>
                <div className="flex items-center gap-3 ml-2">
                  {!workout.completed && (
                    <button
                      onClick={() => removeExerciseFromWorkout(workout.id, ex.id)}
                      className="p-1.5 hover:bg-white/5 transition-colors text-white/25 hover:text-white/60"
                    >
                      <IconTrash size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="ml-8">
                <div className="grid grid-cols-[24px_1fr_1fr_1fr] gap-3 mb-3">
                  <span className="text-[8px] text-white/25 tracking-wider">#</span>
                  <span className="text-[8px] text-white/25 tracking-wider">REPS</span>
                  <span className="text-[8px] text-white/25 tracking-wider">KG</span>
                  <span className="text-[8px] text-white/25 tracking-wider text-right">DONE</span>
                </div>
                {ex.sets.map((set, setIdx) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-[24px_1fr_1fr_1fr] gap-3 items-center py-2.5 transition-colors ${
                      set.completed ? 'bg-[#C6FF00]/[0.03]' : ''
                    } ${setIdx > 0 ? 'border-t border-white/[0.04]' : ''}`}
                  >
                    <span className="text-[10px] text-white/30 tabular-nums">{setIdx + 1}</span>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSetData(workout.id, ex.id, set.id, { reps: parseInt(e.target.value) || 0 })}
                      className="w-full"
                      disabled={workout.completed}
                    />
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSetData(workout.id, ex.id, set.id, { weight: parseFloat(e.target.value) || 0 })}
                      className="w-full"
                      disabled={workout.completed}
                    />
                    <div className="flex justify-end">
                      <input
                        type="checkbox"
                        checked={set.completed}
                        onChange={() => toggleSetComplete(workout.id, ex.id, set.id)}
                        disabled={workout.completed}
                      />
                    </div>
                  </div>
                ))}
                {!workout.completed && (
                  <button
                    onClick={() => addSetToExercise(workout.id, ex.id)}
                    className="w-full mt-3 py-2.5 text-[9px] text-white/25 hover:text-white/50 hover:bg-white/[0.02] transition-colors flex items-center justify-center gap-1 border-t border-white/[0.04]"
                  >
                    <IconPlus size={10} /> Add Set
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!workout.completed && (
        <button
          onClick={() => setShowAddExercise(true)}
          className="btn btn-ghost btn-full mt-8"
        >
          <IconPlus size={14} /> Add Exercise
        </button>
      )}

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-panel"
              style={{ maxWidth: '380px', borderTop: 'none', border: '1px solid rgba(255,255,255,0.06)' }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-[13px] tracking-[0.2em] uppercase font-bold mb-4">Delete Workout</h3>
              <p className="text-[11px] text-white/50 mb-6 leading-relaxed">
                Are you sure you want to delete "{workout.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-ghost flex-1">Cancel</button>
                <button onClick={handleDeleteWorkout} className="btn flex-1" style={{ borderColor: 'rgba(239,68,68,0.5)', color: '#ef4444' }}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddExercise && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowAddExercise(false)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="modal-panel" onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[13px] tracking-[0.2em] uppercase font-bold">Add Exercise</h3>
                <button onClick={() => setShowAddExercise(false)} className="p-2 hover:bg-white/5 transition-colors">
                  <IconClose size={18} className="text-white/40" />
                </button>
              </div>

              {recommendedExercises.length > 0 && (
                <div className="mb-6">
                  <div className="section-label">Recommended for {TRAINING_GOAL_INFO[workoutGoal].label}</div>
                  <div className="flex flex-col gap-1">
                    {recommendedExercises.map(ex => (
                      <button
                        key={ex.id}
                        onClick={() => handleAddExercise(ex)}
                        className="flex items-center justify-between py-3.5 px-3 text-left hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] tracking-[0.04em] text-white/80 group-hover:text-white transition-colors truncate">{ex.name}</div>
                          <div className="text-[9px] text-white/30 mt-1.5 flex gap-2 flex-wrap">
                            <span>{ex.movementPattern}</span>
                            <span>{ex.difficulty}</span>
                            <span className="text-[#C6FF00]/60">{ex.focusAreas.join(', ')}</span>
                          </div>
                        </div>
                        <IconPlus size={14} className="text-white/25 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {otherExercises.length > 0 && (
                <div>
                  {recommendedExercises.length > 0 && <div className="section-label">Other Exercises</div>}
                  <div className="flex flex-col gap-1">
                    {otherExercises.map(ex => (
                      <button
                        key={ex.id}
                        onClick={() => handleAddExercise(ex)}
                        className="flex items-center justify-between py-3.5 px-3 text-left hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] tracking-[0.04em] text-white/60 group-hover:text-white transition-colors truncate">{ex.name}</div>
                          <div className="text-[9px] text-white/25 mt-1.5 flex gap-2 flex-wrap">
                            <span>{ex.movementPattern}</span>
                            <span>{ex.difficulty}</span>
                          </div>
                        </div>
                        <IconPlus size={14} className="text-white/20 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableExercises.length === 0 && (
                <p className="text-[10px] text-white/30 text-center py-8">
                  No more exercises available. Unlock more in the YOU tab.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewExercise && (
          <ExercisePreview
            exercise={previewExercise}
            onClose={() => setPreviewExercise(null)}
            onViewTree={() => {
              const id = previewExercise.id;
              setPreviewExercise(null);
              setSelectedExerciseForTree(id);
            }}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

/* ===== WEEK STRIP ===== */
function WeekStrip({ schedule, workouts }: { schedule: ScheduleEntry[]; workouts: Workout[] }) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className="flex gap-[3px] mb-8">
      {days.map((day) => {
        const dateStr = day.toISOString().split('T')[0];
        const isT = isToday(day);
        const isPast = isBefore(day, today) && !isT;
        const hasSchedule = schedule.some(s => s.date === dateStr);
        const hasWorkout = workouts.find(w => w.date === dateStr);
        const isCompleted = hasWorkout?.completed;

        return (
          <div
            key={dateStr}
            className="flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 relative"
            style={{
              background: isT ? 'var(--c-acid-bg)' : 'transparent',
              border: isT ? '1px solid var(--c-acid-border)' : '1px solid var(--c-fg-05)',
            }}
          >
            <span
              className="text-[8px] tracking-[0.15em] uppercase"
              style={{ color: isT ? 'var(--c-acid-text)' : isPast ? 'var(--c-fg-20)' : 'var(--c-fg-35)' }}
            >
              {format(day, 'EEE').slice(0, 1)}
            </span>
            <span
              className="text-[11px] font-bold tabular-nums"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                color: isT ? 'var(--c-acid-text)' : isPast ? 'var(--c-fg-25)' : 'var(--c-fg-60)',
              }}
            >
              {format(day, 'd')}
            </span>
            {/* Indicator dot */}
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: isCompleted
                  ? 'var(--c-acid-text)'
                  : hasSchedule && !isPast
                  ? 'var(--c-fg-30)'
                  : hasSchedule && isPast
                  ? 'var(--c-fg-12)'
                  : 'transparent',
              }}
            />
            {isT && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'var(--c-acid-text)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ===== TODAY CARD ===== */
function TodayCard({
  onStart,
  onOpen,
  onCreate,
}: {
  onStart: () => void;
  onOpen: () => void;
  onCreate: () => void;
}) {
  const { schedule, workouts } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const todaySchedule = schedule.find(s => s.date === today);
  const todayWorkout = workouts.find(w => w.date === today);

  // Status: rest | scheduled | in-progress | complete
  let status: 'rest' | 'scheduled' | 'in-progress' | 'complete' = 'rest';
  if (todayWorkout?.completed) status = 'complete';
  else if (todayWorkout) status = 'in-progress';
  else if (todaySchedule) status = 'scheduled';

  const typeInfo = todaySchedule ? WORKOUT_TYPE_INFO[todaySchedule.workoutType] : null;
  const totalSets = todayWorkout ? todayWorkout.exercises.reduce((a, e) => a + e.sets.length, 0) : 0;
  const doneSets = todayWorkout ? todayWorkout.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0) : 0;
  const progressPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  const dayLabel = format(new Date(), 'EEEE').toUpperCase();
  const dateLabel = format(new Date(), 'd MMM yyyy').toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        border: status === 'rest' ? '1px solid var(--c-fg-08)' : '1px solid var(--c-acid-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="mb-10"
    >
      {/* Acid bar top */}
      {status !== 'rest' && (
        <div style={{ height: 2, background: 'var(--c-acid-text)', flexShrink: 0 }} />
      )}

      <div className="p-5 md:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: status === 'rest' ? 'var(--c-fg-25)' : 'var(--c-acid-text)',
                }}
              >
                TODAY
              </span>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--c-fg-25)',
                }}
              >
                {dayLabel}
              </span>
            </div>
            <span
              style={{
                fontSize: 9,
                letterSpacing: '0.1em',
                color: 'var(--c-fg-20)',
              }}
            >
              {dateLabel}
            </span>
          </div>

          {/* Status badge */}
          {status === 'complete' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
              }}
            >
              <IconCheck size={10} className="text-green-400" />
              <span style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(34,197,94,0.8)' }}>Done</span>
            </div>
          )}
          {status === 'in-progress' && (
            <div
              style={{
                padding: '4px 10px',
                background: 'var(--c-acid-bg)',
                border: '1px solid var(--c-acid-border)',
              }}
            >
              <span style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--c-acid-text)' }}>Active</span>
            </div>
          )}
        </div>

        {/* Workout name */}
        <div className="mb-5">
          {status === 'rest' ? (
            <>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 'clamp(28px, 6vw, 44px)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  color: 'var(--c-fg-12)',
                }}
              >
                REST
              </div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 'clamp(28px, 6vw, 44px)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  color: 'var(--c-fg-12)',
                }}
              >
                DAY
              </div>
              <p style={{ fontSize: 10, color: 'var(--c-fg-20)', marginTop: 8, letterSpacing: '0.04em' }}>
                No training scheduled.
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 'clamp(24px, 5vw, 40px)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  color: 'var(--c-fg)',
                }}
              >
                {todayWorkout?.name || typeInfo?.subtitle || 'WORKOUT'}
              </div>
              {(typeInfo?.focusAreas || todayWorkout?.focusAreas) && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {(todayWorkout?.focusAreas || typeInfo?.focusAreas || []).slice(0, 3).map((fa: string) => (
                    <span
                      key={fa}
                      style={{
                        fontSize: 8,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--c-acid-text-dim)',
                        border: '1px solid var(--c-acid-border)',
                        padding: '2px 7px',
                      }}
                    >
                      {fa}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Progress bar for in-progress */}
        {status === 'in-progress' && totalSets > 0 && (
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <span style={{ fontSize: 9, color: 'var(--c-fg-30)', letterSpacing: '0.1em' }}>PROGRESS</span>
              <span style={{ fontSize: 9, color: 'var(--c-acid-text)', letterSpacing: '0.1em' }}>{progressPct}%</span>
            </div>
            <div style={{ height: 2, background: 'var(--c-fg-06)', position: 'relative' }}>
              <motion.div
                style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: '#C6FF00' }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span style={{ fontSize: 8, color: 'var(--c-fg-20)' }}>{doneSets} sets done</span>
              <span style={{ fontSize: 8, color: 'var(--c-fg-20)' }}>{totalSets - doneSets} remaining</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {status === 'scheduled' && (
            <button
              onClick={onStart}
              style={{
                flex: 1,
                background: '#C6FF00',
                color: '#0D0D0D',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '13px 20px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Start Workout
            </button>
          )}
          {(status === 'in-progress') && (
            <button
              onClick={onOpen}
              style={{
                flex: 1,
                background: 'var(--c-acid-bg)',
                color: 'var(--c-acid-text)',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '13px 20px',
                border: '1px solid var(--c-acid-border)',
                cursor: 'pointer',
              }}
            >
              Continue →
            </button>
          )}
          {status === 'complete' && (
            <button
              onClick={onOpen}
              style={{
                flex: 1,
                background: 'transparent',
                color: 'var(--c-fg-45)',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '13px 20px',
                border: '1px solid var(--c-fg-08)',
                cursor: 'pointer',
              }}
            >
              View Details
            </button>
          )}
          {status === 'rest' && (
            <button
              onClick={onCreate}
              style={{
                background: 'transparent',
                color: 'var(--c-fg-35)',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                padding: '11px 16px',
                border: '1px solid var(--c-fg-08)',
                cursor: 'pointer',
              }}
            >
              + Train Anyway
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ===== HISTORY VIEW ===== */
function HistoryView({ workouts, onBack, onSelect }: {
  workouts: Workout[];
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const past = workouts
    .filter(w => w.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <PageTransition className="page">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-white/5 transition-colors shrink-0"
        >
          <IconChevronLeft size={20} />
        </button>
        <div>
          <div className="coord-stamp mb-1">SEC-2 // TRAINING</div>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(28px, 6vw, 44px)',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              lineHeight: 1,
              color: 'var(--c-fg)',
            }}
          >
            History
          </h1>
        </div>
      </div>

      {past.length === 0 ? (
        <div className="text-center py-16">
          <p style={{ fontSize: 10, color: 'var(--c-fg-20)', letterSpacing: '0.1em' }}>No past workouts yet.</p>
        </div>
      ) : (
        <div>
          {/* Section rule */}
          <div className="flex items-center gap-3 mb-5">
            <span style={{ fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--c-fg-20)', whiteSpace: 'nowrap' }}>
              {past.length} session{past.length !== 1 ? 's' : ''}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--c-fg-06)' }} />
          </div>

          <div className="flex flex-col">
            {past.map((w, i) => (
              <motion.button
                key={w.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                onClick={() => onSelect(w.id)}
                className="flex items-center gap-4 py-4 text-left hover:bg-white/[0.02] transition-colors group"
                style={{ borderBottom: '1px solid var(--c-fg-05)' }}
              >
                {/* Date column */}
                <div style={{ width: 48, flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--c-fg-20)', lineHeight: 1 }}>
                    {format(parseISO(w.date), 'd')}
                  </div>
                  <div style={{ fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-fg-15)', marginTop: 2 }}>
                    {format(parseISO(w.date), 'MMM')}
                  </div>
                </div>

                <div style={{ width: 1, height: 36, background: 'var(--c-fg-06)', flexShrink: 0 }} />

                {/* Name + tags */}
                <div className="flex-1 min-w-0">
                  <div
                    style={{ fontSize: 11, letterSpacing: '0.08em', fontWeight: 700, color: 'var(--c-fg-60)', textTransform: 'uppercase' }}
                    className="group-hover:text-white transition-colors truncate"
                  >
                    {w.name}
                  </div>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {w.focusAreas.slice(0, 2).map((f: string) => (
                      <span key={f} style={{ fontSize: 7, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--c-fg-20)' }}>{f}</span>
                    ))}
                  </div>
                </div>

                {/* Right: ex count + status */}
                <div className="flex items-center gap-3 shrink-0">
                  <span style={{ fontSize: 9, color: 'var(--c-fg-20)' }}>{w.exercises.length} ex</span>
                  {w.completed
                    ? <IconCheck size={12} className="text-green-400/40" />
                    : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-fg-12)' }} />
                  }
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  );
}

/* ===== WORKOUTS LIST VIEW ===== */
export default function WorkoutsPage() {
  const { workouts, addWorkout, setActiveWorkout, activeWorkoutId, schedule } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal>('strength');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [view, setView] = useState<'main' | 'history'>('main');

  const activeWorkout = workouts.find(w => w.id === activeWorkoutId);

  const handleCreateWorkout = () => {
    const template = selectedTemplate ? WORKOUT_TEMPLATES[selectedTemplate] : null;

    const exercises: WorkoutExercise[] = [];
    if (template) {
      template.exerciseIds.forEach((exId, idx) => {
        const exercise = EXERCISES.find(e => e.id === exId);
        if (exercise) {
          const sets = Array.from({ length: template.defaultSets }, () => ({
            id: generateId(),
            reps: template.defaultReps,
            weight: template.defaultWeight,
            completed: false,
          }));
          exercises.push({
            id: generateId(),
            exerciseId: exercise.id,
            exercise,
            sets,
            restSeconds: 60,
            order: idx,
          });
        }
      });
    }

    const workout: Workout = {
      id: generateId(),
      name: newName || template?.name || 'New Workout',
      type: goalToType(selectedGoal),
      date: new Date().toISOString().split('T')[0],
      exercises,
      warmup: template?.warmup,
      notes: template?.notes,
      focusAreas: (template?.focusAreas || [selectedGoal]) as any,
      equipment: (template?.equipment || []) as any,
      completed: false,
    };
    addWorkout(workout);
    setActiveWorkout(workout.id);
    setShowCreate(false);
    setNewName('');
    setSelectedTemplate('');
  };

  const handleStartFromSchedule = (entry: typeof schedule[0]) => {
    const existing = workouts.find(w => w.date === entry.date);
    if (existing) {
      setActiveWorkout(existing.id);
      return;
    }
    const typeInfo = WORKOUT_TYPE_INFO[entry.workoutType];
    const workout: Workout = {
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
  };

  const handleStartToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = schedule.find(s => s.date === today);
    if (todaySchedule) handleStartFromSchedule(todaySchedule);
  };

  const handleOpenToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayWorkout = workouts.find(w => w.date === today);
    if (todayWorkout) setActiveWorkout(todayWorkout.id);
  };

  if (activeWorkout) {
    return <WorkoutDetail workout={activeWorkout} onBack={() => setActiveWorkout(null)} />;
  }

  if (view === 'history') {
    return (
      <HistoryView
        workouts={workouts}
        onBack={() => setView('main')}
        onSelect={(id) => setActiveWorkout(id)}
      />
    );
  }

  const today = new Date().toISOString().split('T')[0];

  // Upcoming: scheduled dates strictly after today, not yet started, sorted asc
  const upcomingSchedule = schedule
    .filter(s => s.date > today && !workouts.find(w => w.date === s.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const templatesByGoal = (goal: TrainingGoal) =>
    Object.entries(WORKOUT_TEMPLATES).filter(([, t]) => t.trainingGoal === goal);

  const historyCount = workouts.filter(w => w.date < today).length;

  return (
    <PageTransition className="page">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="coord-stamp mb-2">SEC-2 // TRAINING</div>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(36px, 7vw, 56px)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              lineHeight: 0.9,
              color: 'var(--c-fg)',
            }}
          >
            Workouts
          </h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm">
          <IconPlus size={14} /> New
        </button>
      </div>

      {/* ── Week strip ──────────────────────────────────── */}
      <WeekStrip schedule={schedule} workouts={workouts} />

      {/* ── TODAY ───────────────────────────────────────── */}
      {/* Section rule */}
      <div className="flex items-center gap-3 mb-4">
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--c-acid-text)',
            whiteSpace: 'nowrap',
          }}
        >
          Today
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--c-acid-line)' }} />
      </div>

      <TodayCard
        onStart={handleStartToday}
        onOpen={handleOpenToday}
        onCreate={() => setShowCreate(true)}
      />

      {/* ── UPCOMING ────────────────────────────────────── */}
      {upcomingSchedule.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--c-fg-30)',
                whiteSpace: 'nowrap',
              }}
            >
              Upcoming
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--c-fg-06)' }} />
          </div>

          <div className="flex flex-col">
            {upcomingSchedule.map((entry, i) => {
              const typeInfo = WORKOUT_TYPE_INFO[entry.workoutType];
              const entryDate = parseISO(entry.date + 'T12:00:00');
              const daysFromNow = Math.round((entryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <motion.button
                  key={entry.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleStartFromSchedule(entry)}
                  className="flex items-center gap-4 py-4 text-left hover:bg-white/[0.02] transition-colors group"
                  style={{ borderBottom: '1px solid var(--c-fg-05)' }}
                >
                  {/* Day indicator */}
                  <div style={{ width: 48, flexShrink: 0, textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 900,
                        fontSize: 22,
                        color: 'var(--c-fg-35)',
                        lineHeight: 1,
                      }}
                    >
                      {format(entryDate, 'd')}
                    </div>
                    <div style={{ fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-fg-20)', marginTop: 2 }}>
                      {format(entryDate, 'EEE')}
                    </div>
                  </div>

                  <div style={{ width: 1, height: 36, background: 'var(--c-fg-06)', flexShrink: 0 }} />

                  {/* Name + tags */}
                  <div className="flex-1 min-w-0">
                    <div
                      style={{ fontSize: 11, letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}
                      className="text-white/50 group-hover:text-white/80 transition-colors truncate"
                    >
                      {typeInfo.subtitle}
                    </div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {typeInfo.focusAreas.slice(0, 3).map((fa: string) => (
                        <span key={fa} style={{ fontSize: 7, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--c-fg-20)' }}>{fa}</span>
                      ))}
                    </div>
                  </div>

                  {/* Days from now + arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span style={{ fontSize: 8, letterSpacing: '0.1em', color: 'var(--c-fg-20)' }}>
                      {daysFromNow === 1 ? 'tmrw' : `+${daysFromNow}d`}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--c-fg-15)' }} className="group-hover:text-white/40 transition-colors">→</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── HISTORY LINK ────────────────────────────────── */}
      <button
        onClick={() => setView('history')}
        className="flex items-center gap-3 w-full py-4 hover:bg-white/[0.02] transition-colors group"
        style={{ borderTop: '1px solid var(--c-fg-05)' }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--c-fg-20)',
          }}
          className="group-hover:text-white/40 transition-colors"
        >
          History
        </span>
        {historyCount > 0 && (
          <span
            style={{
              fontSize: 9,
              color: 'var(--c-fg-15)',
              letterSpacing: '0.1em',
            }}
          >
            {historyCount} session{historyCount !== 1 ? 's' : ''}
          </span>
        )}
        <div style={{ flex: 1, height: 1, background: 'var(--c-fg-04)' }} />
        <span style={{ fontSize: 12, color: 'var(--c-fg-15)' }} className="group-hover:text-white/35 transition-colors">→</span>
      </button>

      {/* ── Create workout modal ─────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="modal-panel"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[13px] tracking-[0.2em] uppercase font-bold">New Workout</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-white/5 transition-colors">
                  <IconClose size={18} className="text-white/40" />
                </button>
              </div>

              <div className="mb-6">
                <label className="data-label mb-3 block">Workout Name</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name your workout..." />
              </div>

              <div className="mb-6">
                <label className="data-label mb-3 block">Training Goal</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(TRAINING_GOAL_INFO) as TrainingGoal[]).map(goal => (
                    <button
                      key={goal}
                      onClick={() => { setSelectedGoal(goal); setSelectedTemplate(''); }}
                      className={`tag transition-colors cursor-pointer ${
                        selectedGoal === goal
                          ? 'border-[#C6FF00]/50 text-[#C6FF00] bg-[#C6FF00]/[0.08]'
                          : 'hover:border-white/25'
                      }`}
                    >
                      {TRAINING_GOAL_INFO[goal].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="data-label mb-3 block">Template</label>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setSelectedTemplate('')}
                    className={`text-left py-3.5 px-4 transition-colors ${
                      !selectedTemplate ? 'bg-white/[0.03] text-white' : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    <span className="text-[11px] tracking-[0.06em]">Blank workout</span>
                  </button>
                  {templatesByGoal(selectedGoal).map(([key, tmpl]) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedTemplate(key); if (!newName) setNewName(tmpl.name); }}
                      className={`text-left py-3.5 px-4 transition-colors ${
                        selectedTemplate === key ? 'bg-white/[0.03] text-white' : 'text-white/50 hover:text-white/70'
                      }`}
                    >
                      <div className="text-[11px] tracking-[0.06em]">{tmpl.name}</div>
                      <div className="text-[9px] text-white/30 mt-1.5">
                        {tmpl.exerciseIds.length} exercises · {tmpl.durationMinutes}min · {tmpl.difficulty}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleCreateWorkout} className="btn btn-primary btn-full">
                Create Workout
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

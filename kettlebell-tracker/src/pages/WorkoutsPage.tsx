import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { useToastStore } from '../store/toastStore';
import { EXERCISES } from '../data/exercises';
import { WORKOUT_TEMPLATES, WORKOUT_TYPE_INFO } from '../data/workouts';
import { Workout, WorkoutExercise, Exercise, TrainingGoal, goalToType, typeToGoal, TRAINING_GOAL_INFO, FocusArea } from '../lib/types';
import { format } from 'date-fns';
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

/** Returns focus areas relevant to a training goal for exercise filtering */
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

  // Filter exercises based on workout type/focus
  const workoutGoal = typeToGoal(workout.type);
  const relevantFocusAreas = getRelevantFocusAreas(workoutGoal);

  const availableExercises = EXERCISES.filter(e =>
    unlockedExercises.includes(e.id) &&
    e.equipment.some(eq => userEquipment.includes(eq)) &&
    !workout.exercises.find(we => we.exerciseId === e.id)
  );

  // Split into recommended (matching focus) and other
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
      {/* Back + Header */}
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

      {/* Progress ring + bar */}
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

      {/* Warmup */}
      {workout.warmup && (
        <div className="bracket-card mb-8 md:mb-10 relative">
          <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-[#C6FF00]/40" />
          <div className="pl-4">
            <span className="data-label">Warmup</span>
            <p className="text-[10px] md:text-[12px] text-white/50 leading-relaxed mt-2">{workout.warmup}</p>
          </div>
        </div>
      )}

      {/* Exercises */}
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
              {/* Exercise header */}
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

              {/* Sets table */}
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

      {/* Add exercise */}
      {!workout.completed && (
        <button
          onClick={() => setShowAddExercise(true)}
          className="btn btn-ghost btn-full mt-8"
        >
          <IconPlus size={14} /> Add Exercise
        </button>
      )}

      {/* Delete workout confirmation modal */}
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

      {/* Add exercise modal */}
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

              {/* Recommended exercises (matching workout type) */}
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

              {/* Other exercises */}
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

      {/* Exercise preview modal */}
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

/* ===== WORKOUTS LIST VIEW ===== */
export default function WorkoutsPage() {
  const { workouts, addWorkout, setActiveWorkout, activeWorkoutId, schedule } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<TrainingGoal>('strength');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const activeWorkout = workouts.find(w => w.id === activeWorkoutId);

  const handleCreateWorkout = () => {
    const template = selectedTemplate ? WORKOUT_TEMPLATES[selectedTemplate] : null;

    // Build exercises from template
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

  if (activeWorkout) {
    return <WorkoutDetail workout={activeWorkout} onBack={() => setActiveWorkout(null)} />;
  }

  const today = new Date().toISOString().split('T')[0];
  const upcomingSchedule = schedule.filter(s => s.date >= today && !workouts.find(w => w.date === s.date)).slice(0, 3);
  const templatesByGoal = (goal: TrainingGoal) => Object.entries(WORKOUT_TEMPLATES).filter(([, t]) => t.trainingGoal === goal);

  return (
    <PageTransition className="page">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <div>
          <div className="coord-stamp mb-2">SEC-2 // TRAINING</div>
          <h1 className="page-title mb-0">Workouts</h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm">
          <IconPlus size={14} /> New Workout
        </button>
      </div>

      {/* Scheduled not yet started */}
      {upcomingSchedule.length > 0 && (
        <div className="mb-8 md:mb-10">
          <div className="section-label">Scheduled</div>
          <div className="flex flex-col gap-0">
            {upcomingSchedule.map((entry, i) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleStartFromSchedule(entry)}
                className="flex items-center gap-3 py-3.5 px-2 text-left hover:bg-white/[0.02] transition-colors group"
              >
                <span className="status-dot status-dot--active" />
                <span className="text-[11px] tracking-[0.04em] text-white/60 group-hover:text-white transition-colors flex-1 truncate">
                  {WORKOUT_TYPE_INFO[entry.workoutType].subtitle}
                </span>
                <span className="dot-leader hidden md:block" />
                <span className="text-[9px] text-white/35 tabular-nums">
                  {format(new Date(entry.date + 'T12:00:00'), 'EEE, MMM d')}
                </span>
                <span className="text-[9px] text-[#C6FF00]/70 tracking-[0.1em] uppercase shrink-0">Start</span>
              </motion.button>
            ))}
          </div>
          <div className="divider" />
        </div>
      )}

      {/* Workout list */}
      <div className="flex flex-col gap-0">
        {workouts.length === 0 && upcomingSchedule.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[10px] text-white/30 mb-6">No workouts created yet.</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">New Workout</button>
          </div>
        )}
        {workouts.map((w, i) => (
          <motion.button
            key={w.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setActiveWorkout(w.id)}
            className="flex items-center gap-3 py-3.5 px-2 text-left hover:bg-white/[0.02] transition-colors group"
          >
            <span className="text-[10px] text-white/25 w-5 text-right tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={`status-dot ${w.completed ? 'status-dot--done' : 'status-dot--idle'}`} />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {w.focusAreas.slice(0, 2).map(f => (
                <span key={f} className="text-[8px] text-white/25 uppercase">{f}</span>
              ))}
              <span className="text-[12px] tracking-[0.04em] font-bold text-white/70 group-hover:text-white transition-colors truncate">
                {w.name}
              </span>
            </div>
            <span className="dot-leader hidden md:block" />
            <span className="text-[9px] text-white/35 tabular-nums shrink-0">
              {format(new Date(w.date), 'MMM d')}
            </span>
            <span className="text-[9px] text-white/25 shrink-0">{w.exercises.length} ex</span>
            {w.completed && <IconCheck size={12} className="text-green-400/50 shrink-0" />}
          </motion.button>
        ))}
      </div>

      {/* Create workout modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setShowCreate(false)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="modal-panel" onClick={e => e.stopPropagation()}
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

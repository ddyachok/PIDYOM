import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { EXERCISES } from '../data/exercises';
import { WORKOUT_TEMPLATES, WORKOUT_TYPE_INFO } from '../data/workouts';
import { Workout, WorkoutExercise, WorkoutType, Exercise } from '../lib/types';
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
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="modal-panel"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[13px] tracking-[0.1em] font-bold">{exercise.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="tag">{exercise.difficulty}</span>
              <span className="tag">{exercise.movementPattern}</span>
              <span className="tag">{exercise.category}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 transition-colors">
            <IconClose size={16} className="text-white/30" />
          </button>
        </div>

        <p className="text-[11px] text-white/40 leading-relaxed mb-6">{exercise.description}</p>

        {exercise.cues.length > 0 && (
          <div className="mb-6">
            <div className="section-label">Cues</div>
            <div className="space-y-2">
              {exercise.cues.map((cue, i) => (
                <p key={i} className="text-[10px] text-white/30 leading-relaxed pl-4 border-l border-white/[0.06]">
                  {cue}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card" style={{ padding: '14px 18px' }}>
            <div className="text-[8px] tracking-[0.2em] text-white/20 uppercase mb-1">Equipment</div>
            <div className="flex flex-wrap gap-1">
              {exercise.equipment.map(eq => (
                <span key={eq} className="text-[9px] text-white/40">{eq}</span>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: '14px 18px' }}>
            <div className="text-[8px] tracking-[0.2em] text-white/20 uppercase mb-1">Focus</div>
            <div className="flex flex-wrap gap-1">
              {exercise.focusAreas.map(fa => (
                <span key={fa} className="text-[9px] text-white/40">{fa}</span>
              ))}
            </div>
          </div>
        </div>

        {!isUnlocked && (
          <div className="card mb-6" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-3">
              <IconLock size={14} className="text-white/30" />
              <span className="text-[10px] tracking-[0.1em] text-white/40 font-bold uppercase">Locked</span>
            </div>
            {parentExercise ? (
              <p className="text-[10px] text-white/25 leading-relaxed">
                Complete <span className="text-white/50">{parentExercise.name}</span> to unlock this exercise.
              </p>
            ) : (
              <p className="text-[10px] text-white/25 leading-relaxed">
                Progress through earlier movements to unlock.
              </p>
            )}
            {parentUnlocked && (
              <button
                onClick={() => unlockExercise(exercise.id)}
                className="btn btn-sm btn-full mt-4"
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

/* ===== WORKOUT DETAIL VIEW ===== */
function WorkoutDetail({ workout, onBack }: { workout: Workout; onBack: () => void }) {
  const { toggleSetComplete, updateSetData, addSetToExercise, addExerciseToWorkout, removeExerciseFromWorkout, completeWorkout } = useStore();
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedExerciseForTree, setSelectedExerciseForTree] = useState<string | null>(null);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const userEquipment = useStore(s => s.userEquipment);
  const unlockedExercises = useStore(s => s.unlockedExercises);

  const allCompleted = workout.exercises.length > 0 && workout.exercises.every(ex => ex.sets.every(s => s.completed));
  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = workout.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0);

  const availableExercises = EXERCISES.filter(e =>
    unlockedExercises.includes(e.id) &&
    e.equipment.some(eq => userEquipment.includes(eq)) &&
    !workout.exercises.find(we => we.exerciseId === e.id)
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

  if (selectedExerciseForTree) {
    return (
      <ProgressionTree
        exerciseId={selectedExerciseForTree}
        onBack={() => setSelectedExerciseForTree(null)}
      />
    );
  }

  return (
    <PageTransition className="page">
      {/* Back + Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/5 transition-colors">
          <IconChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="tag">{workout.type}</span>
            <h2 className="text-[13px] tracking-[0.12em] font-bold truncate">{workout.name}</h2>
          </div>
          <p className="text-[9px] text-white/25 tracking-[0.1em]">
            {format(new Date(workout.date), 'EEEE, MMM d')} · {completedSets}/{totalSets} sets
          </p>
        </div>
        {!workout.completed && allCompleted && totalSets > 0 && (
          <button
            onClick={() => completeWorkout(workout.id)}
            className="btn btn-sm"
            style={{ borderColor: 'rgba(74, 222, 128, 0.3)', color: 'rgba(74, 222, 128, 0.8)' }}
          >
            Complete
          </button>
        )}
        {workout.completed && <span className="text-[9px] text-green-400/50 tracking-[0.15em] uppercase">Done</span>}
      </div>

      {/* Progress bar */}
      <div className="h-px bg-white/[0.06] mb-8 relative">
        <motion.div
          className="absolute top-0 left-0 h-full bg-white/25"
          initial={{ width: 0 }}
          animate={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Warmup */}
      {workout.warmup && (
        <div className="card mb-6" style={{ padding: '18px 24px' }}>
          <span className="section-label">Warmup</span>
          <p className="text-[10px] text-white/35 leading-relaxed">{workout.warmup}</p>
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-4">
        {workout.exercises.map((ex, idx) => (
          <motion.div
            key={ex.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card"
            style={{ padding: 0 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
              <button
                className="flex-1 text-left flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0"
                onClick={() => setPreviewExercise(ex.exercise)}
              >
                <span className="text-[11px] tracking-[0.06em] font-bold truncate">{ex.exercise.name}</span>
                <IconTree size={12} className="text-white/15 flex-shrink-0" />
              </button>
              <div className="flex items-center gap-3 ml-2">
                <span className="text-[8px] tracking-[0.12em] text-white/15 uppercase">{ex.exercise.category}</span>
                {!workout.completed && (
                  <button
                    onClick={() => removeExerciseFromWorkout(workout.id, ex.id)}
                    className="p-1.5 hover:bg-white/5 transition-colors text-white/15 hover:text-white/50"
                  >
                    <IconTrash size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="px-5 py-3">
              <div className="grid grid-cols-[28px_1fr_1fr_1fr] gap-2 mb-2">
                <span className="text-[8px] text-white/15 tracking-wider">#</span>
                <span className="text-[8px] text-white/15 tracking-wider">REPS</span>
                <span className="text-[8px] text-white/15 tracking-wider">KG</span>
                <span className="text-[8px] text-white/15 tracking-wider text-right">DONE</span>
              </div>
              {ex.sets.map((set, setIdx) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-[28px_1fr_1fr_1fr] gap-2 items-center py-2.5 transition-colors ${
                    set.completed ? 'bg-white/[0.015]' : ''
                  } ${setIdx > 0 ? 'border-t border-white/[0.03]' : ''}`}
                >
                  <span className="text-[9px] text-white/20">{setIdx + 1}</span>
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
                  className="w-full mt-3 py-2 text-[9px] text-white/15 hover:text-white/35 hover:bg-white/[0.02] transition-colors flex items-center justify-center gap-1.5 border-t border-white/[0.03]"
                >
                  <IconPlus size={10} /> Add Set
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add exercise button */}
      {!workout.completed && (
        <button
          onClick={() => setShowAddExercise(true)}
          className="btn btn-ghost btn-full mt-6"
        >
          <IconPlus size={14} /> Add Exercise
        </button>
      )}

      {/* Add exercise modal */}
      <AnimatePresence>
        {showAddExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setShowAddExercise(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="modal-panel"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[12px] tracking-[0.2em] uppercase font-bold">Add Exercise</h3>
                <button onClick={() => setShowAddExercise(false)} className="p-2 hover:bg-white/5 transition-colors">
                  <IconClose size={16} className="text-white/30" />
                </button>
              </div>
              <div className="space-y-2">
                {availableExercises.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExercise(ex)}
                    className="w-full text-left card card-interactive flex items-center justify-between"
                    style={{ padding: '14px 18px' }}
                  >
                    <div>
                      <div className="text-[11px] tracking-[0.06em]">{ex.name}</div>
                      <div className="text-[9px] text-white/20 mt-1 flex gap-3">
                        <span>{ex.movementPattern}</span>
                        <span>{ex.difficulty}</span>
                        <span>{ex.category}</span>
                      </div>
                    </div>
                    <IconPlus size={14} className="text-white/15" />
                  </button>
                ))}
                {availableExercises.length === 0 && (
                  <p className="text-[10px] text-white/15 text-center py-8">
                    No more exercises available. Unlock more in the Gear tab.
                  </p>
                )}
              </div>
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
  const [newType, setNewType] = useState<WorkoutType>('A');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const activeWorkout = workouts.find(w => w.id === activeWorkoutId);

  const handleCreateWorkout = () => {
    const template = selectedTemplate ? WORKOUT_TEMPLATES[selectedTemplate] : {};
    const workout: Workout = {
      id: generateId(),
      name: newName || template?.name || 'New Workout',
      type: newType,
      date: new Date().toISOString().split('T')[0],
      exercises: [],
      warmup: template?.warmup,
      notes: template?.notes,
      focusAreas: (template?.focusAreas || [...WORKOUT_TYPE_INFO[newType].focusAreas]) as any,
      equipment: template?.equipment || [],
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

  const templatesByType = (type: WorkoutType) => Object.entries(WORKOUT_TEMPLATES).filter(([, t]) => t.type === type);
  const today = new Date().toISOString().split('T')[0];
  const upcomingSchedule = schedule.filter(s => s.date >= today && !workouts.find(w => w.date === s.date)).slice(0, 3);

  return (
    <PageTransition className="page">
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title mb-0">Workouts</h1>
        <button onClick={() => setShowCreate(true)} className="btn btn-sm">
          <IconPlus size={12} /> New
        </button>
      </div>

      {/* Scheduled workouts not yet started */}
      {upcomingSchedule.length > 0 && (
        <div className="mb-8">
          <div className="section-label">Scheduled</div>
          <div className="space-y-2">
            {upcomingSchedule.map((entry) => (
              <div
                key={entry.id}
                className="card card-interactive flex items-center justify-between"
                style={{ padding: '16px 24px' }}
                onClick={() => handleStartFromSchedule(entry)}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="tag">{entry.workoutType}</span>
                    <span className="text-[11px] tracking-[0.06em]">
                      {WORKOUT_TYPE_INFO[entry.workoutType].subtitle}
                    </span>
                  </div>
                  <span className="text-[9px] text-white/15">
                    {format(new Date(entry.date + 'T12:00:00'), 'EEE, MMM d')}
                  </span>
                </div>
                <span className="text-[9px] text-white/20 tracking-[0.1em] uppercase">Start</span>
              </div>
            ))}
          </div>
          <div className="divider" />
        </div>
      )}

      {/* Workout list */}
      <div className="space-y-2">
        {workouts.length === 0 && upcomingSchedule.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[11px] text-white/15 mb-6">No workouts created yet.</p>
            <button onClick={() => setShowCreate(true)} className="btn">Create Workout</button>
          </div>
        )}
        {workouts.map((w, i) => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setActiveWorkout(w.id)}
            className="card card-interactive"
            style={{ padding: '16px 24px' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="tag">{w.type}</span>
                <span className="text-[11px] tracking-[0.06em] font-bold">{w.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {w.completed && <IconCheck size={14} className="text-green-400/40" />}
                <span className="text-[9px] text-white/15">{format(new Date(w.date), 'MMM d')}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[9px] text-white/15">{w.exercises.length} exercises</span>
              <div className="flex items-center gap-2">
                {w.focusAreas.map(f => (
                  <span key={f} className="text-[8px] text-white/10 uppercase">{f}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create workout modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="modal-panel"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[12px] tracking-[0.2em] uppercase font-bold">New Workout</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-white/5 transition-colors">
                  <IconClose size={16} className="text-white/30" />
                </button>
              </div>

              <div className="mb-6">
                <label className="section-label">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Workout name..."
                />
              </div>

              <div className="mb-6">
                <label className="section-label">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['A', 'B'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewType(type)}
                      className={`card text-left transition-colors ${
                        newType === type ? 'border-white/20 bg-white/[0.03]' : ''
                      }`}
                      style={{ padding: '14px 18px' }}
                    >
                      <div className="text-[10px] tracking-[0.15em] font-bold mb-1">{WORKOUT_TYPE_INFO[type].label}</div>
                      <div className="text-[9px] text-white/25">{WORKOUT_TYPE_INFO[type].subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="section-label">Template</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedTemplate('')}
                    className={`w-full text-left card transition-colors ${
                      !selectedTemplate ? 'border-white/15 bg-white/[0.03]' : ''
                    }`}
                    style={{ padding: '12px 18px' }}
                  >
                    <span className="text-[10px] tracking-[0.06em]">Blank workout</span>
                  </button>
                  {templatesByType(newType).map(([key, tmpl]) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedTemplate(key); if (!newName) setNewName(tmpl.name || ''); }}
                      className={`w-full text-left card transition-colors ${
                        selectedTemplate === key ? 'border-white/15 bg-white/[0.03]' : ''
                      }`}
                      style={{ padding: '12px 18px' }}
                    >
                      <span className="text-[10px] tracking-[0.06em]">{tmpl.name}</span>
                      <span className="text-[9px] text-white/15 block mt-1">{tmpl.focusAreas?.join(', ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleCreateWorkout} className="btn btn-full">
                Create Workout
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

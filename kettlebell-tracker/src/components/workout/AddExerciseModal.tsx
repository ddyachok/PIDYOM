// src/components/workout/AddExerciseModal.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { Exercise, WarmupDefaults, ExerciseType } from '../../lib/types';
import { IconClose, IconChevronDown } from '../icons/Icons';

interface AddExerciseModalProps {
  workoutId: string;
  sectionId: string;
  sectionName: string;
  onClose: () => void;
}

export function AddExerciseModal({ workoutId, sectionId, sectionName, onClose }: AddExerciseModalProps) {
  const exercises = useStore(s => s.exercises);
  const unlockedExercises = useStore(s => s.unlockedExercises);
  const userEquipment = useStore(s => s.userEquipment);
  const { addExerciseToSection, setExerciseType, updateWarmupDefaults } = useStore();

  const isWarmupSection = sectionName.toLowerCase().includes('warm');

  const [showAll, setShowAll] = useState(!isWarmupSection);
  const [promotingExercise, setPromotingExercise] = useState<Exercise | null>(null);
  const [warmupForm, setWarmupForm] = useState<WarmupDefaults>({ sets: 2, reps: '10', hint: '' });

  const warmupExercises = exercises.filter(e => e.exerciseType === 'warmup' && unlockedExercises.includes(e.id));
  const mainExercises = exercises.filter(e =>
    e.exerciseType === 'main' &&
    unlockedExercises.includes(e.id) &&
    e.equipment.some(eq => userEquipment.includes(eq))
  );

  const handleAddWarmup = (exercise: Exercise) => {
    addExerciseToSection(workoutId, sectionId, exercise);
    onClose();
  };

  const handleAddMain = (exercise: Exercise) => {
    if (isWarmupSection) {
      setPromotingExercise(exercise);
      setWarmupForm({ sets: 2, reps: '10', hint: exercise.cues[0] || '' });
    } else {
      addExerciseToSection(workoutId, sectionId, exercise);
      onClose();
    }
  };

  const handleConfirmPromote = () => {
    if (!promotingExercise) return;
    setExerciseType(promotingExercise.id, 'warmup');
    updateWarmupDefaults(promotingExercise.id, warmupForm);
    addExerciseToSection(workoutId, sectionId, {
      ...promotingExercise,
      exerciseType: 'warmup' as ExerciseType,
      warmupDefaults: warmupForm,
    });
    onClose();
  };

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
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[13px] tracking-[0.1em] font-bold uppercase">
            {isWarmupSection ? 'Add Warmup' : `Add to ${sectionName}`}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 transition-colors">
            <IconClose size={18} className="text-white/40" />
          </button>
        </div>

        {promotingExercise ? (
          <div>
            <p className="text-[10px] text-white/50 mb-4 leading-relaxed">
              Mark <span className="text-white/80">{promotingExercise.name}</span> as a warmup exercise (applies globally to all workouts).
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[9px] text-white/40 tracking-[0.1em] uppercase block mb-1.5">Sets</label>
                <input
                  type="number"
                  value={warmupForm.sets}
                  onChange={e => setWarmupForm(f => ({ ...f, sets: Number(e.target.value) }))}
                  className="bg-white/[0.04] border border-white/10 text-[11px] text-white py-2 px-3 w-full focus:outline-none focus:border-white/25"
                  min={1}
                />
              </div>
              <div>
                <label className="text-[9px] text-white/40 tracking-[0.1em] uppercase block mb-1.5">Reps</label>
                <input
                  type="text"
                  value={warmupForm.reps}
                  onChange={e => setWarmupForm(f => ({ ...f, reps: e.target.value }))}
                  placeholder="e.g. 10-15 or 20 sec"
                  className="bg-white/[0.04] border border-white/10 text-[11px] text-white py-2 px-3 w-full focus:outline-none focus:border-white/25"
                />
              </div>
              <div>
                <label className="text-[9px] text-white/40 tracking-[0.1em] uppercase block mb-1.5">Hint (cue)</label>
                <input
                  type="text"
                  value={warmupForm.hint}
                  onChange={e => setWarmupForm(f => ({ ...f, hint: e.target.value }))}
                  placeholder="e.g. Light pace, full range"
                  className="bg-white/[0.04] border border-white/10 text-[11px] text-white py-2 px-3 w-full focus:outline-none focus:border-white/25"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPromotingExercise(null)} className="btn btn-ghost flex-1">Back</button>
              <button onClick={handleConfirmPromote} className="btn flex-1 bg-white text-black hover:bg-white/90 transition-colors">Mark as Warmup & Add</button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            {isWarmupSection && (
              <>
                <div className="section-label mb-3">Warmup Exercises</div>
                {warmupExercises.length === 0 ? (
                  <p className="text-[10px] text-white/30 mb-4">No warmup exercises yet.</p>
                ) : (
                  <div className="space-y-0 mb-5">
                    {warmupExercises.map(ex => (
                      <div key={ex.id}>
                        <button
                          onClick={() => handleAddWarmup(ex)}
                          className="w-full text-left py-2.5 hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[11px] md:text-[13px] tracking-[0.06em] font-bold">{ex.name}</span>
                              {ex.warmupDefaults && (
                                <span className="text-[9px] text-white/30 ml-2 tabular-nums">
                                  {ex.warmupDefaults.sets} × {ex.warmupDefaults.reps}
                                </span>
                              )}
                              {ex.warmupDefaults?.hint && (
                                <p className="text-[9px] text-white/30 mt-0.5">{ex.warmupDefaults.hint}</p>
                              )}
                            </div>
                            <span className="text-[9px] text-white/25 ml-3">+</span>
                          </div>
                        </button>
                        <div className="divider" />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowAll(s => !s)}
                  className="flex items-center gap-2 text-[9px] text-white/40 hover:text-white/70 transition-colors tracking-[0.1em] uppercase mb-3"
                >
                  <IconChevronDown size={12} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
                  Browse all exercises
                </button>
              </>
            )}

            {(!isWarmupSection || showAll) && (
              <>
                {isWarmupSection && <div className="section-label mb-3">All Exercises</div>}
                {mainExercises.map(ex => (
                  <div key={ex.id}>
                    <button
                      onClick={() => handleAddMain(ex)}
                      className="w-full text-left py-2.5 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] md:text-[13px] tracking-[0.06em] font-bold">{ex.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] text-white/25 tracking-wider">{ex.difficulty}</span>
                            <span className="text-[8px] text-white/25">{ex.movementPattern}</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-white/25 ml-3">
                          {isWarmupSection ? 'use as warmup' : '+'}
                        </span>
                      </div>
                    </button>
                    <div className="divider" />
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

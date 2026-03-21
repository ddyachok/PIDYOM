// src/components/workout/ExerciseCard.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { WorkoutExercise } from '../../lib/types';
import { IconTrash, IconCheck, IconPencil } from '../icons/Icons';

interface ExerciseCardProps {
  workoutId: string;
  sectionId: string;
  workoutExercise: WorkoutExercise;
  index: number;
  isCompleted: boolean;
}

export function ExerciseCard({ workoutId, sectionId, workoutExercise: we, index, isCompleted }: ExerciseCardProps) {
  const [editing, setEditing] = useState(false);
  const { toggleSetComplete, updateSetData, addSetToExercise, removeExerciseFromSection } = useStore();

  const allSetsComplete = we.sets.length > 0 && we.sets.every(s => s.completed);
  const completedCount = we.sets.filter(s => s.completed).length;
  const totalSets = we.sets.length;

  const repsValues = [...new Set(we.sets.map(s => s.reps))];
  const repsDisplay = repsValues.length === 1
    ? String(repsValues[0])
    : `${Math.min(...repsValues)}-${Math.max(...repsValues)}`;

  const handleMarkAllComplete = () => {
    if (isCompleted) return;
    we.sets.forEach(s => {
      if (!s.completed) toggleSetComplete(workoutId, sectionId, we.id, s.id);
    });
  };

  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-white/25 w-5 text-right tabular-nums shrink-0">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-[12px] md:text-[14px] tracking-[0.06em] font-bold truncate">
              {we.exercise.name}
            </span>
          </div>
          {we.exercise.cues.length > 0 && (
            <ul className="ml-7 space-y-1">
              {we.exercise.cues.map((cue, i) => (
                <li key={i} className="text-[10px] text-white/40 leading-relaxed flex gap-1.5">
                  <span className="text-white/20 shrink-0">•</span>
                  {cue}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          {!isCompleted && (
            <>
              <button
                onClick={() => setEditing(e => !e)}
                className="p-1.5 hover:bg-white/5 transition-colors text-white/25 hover:text-white/60"
                aria-label="Edit sets"
              >
                <IconPencil size={12} />
              </button>
              <button
                onClick={() => removeExerciseFromSection(workoutId, sectionId, we.id)}
                className="p-1.5 hover:bg-white/5 transition-colors text-white/25 hover:text-red-400/70"
                aria-label="Remove exercise"
              >
                <IconTrash size={12} />
              </button>
            </>
          )}
          <button
            onClick={handleMarkAllComplete}
            disabled={isCompleted}
            className={`w-7 h-7 border transition-all flex items-center justify-center ${
              allSetsComplete
                ? 'border-[#C6FF00]/60 bg-[#C6FF00]/10 text-[#C6FF00]'
                : 'border-white/15 text-transparent hover:border-white/30'
            }`}
            aria-label="Mark all complete"
          >
            <IconCheck size={12} />
          </button>
        </div>
      </div>

      <div className="ml-7 mt-2 flex items-center justify-between">
        <span className="text-[9px] text-white/25">
          {completedCount}/{totalSets} sets done
        </span>
        <span className="text-[10px] text-white/40 tabular-nums">
          {totalSets} × {repsDisplay}
        </span>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden ml-7 mt-3"
          >
            <div className="grid grid-cols-[20px_1fr_1fr_28px] gap-2 mb-2">
              <span className="text-[8px] text-white/25 tracking-wider">#</span>
              <span className="text-[8px] text-white/25 tracking-wider">REPS</span>
              <span className="text-[8px] text-white/25 tracking-wider">KG</span>
              <span className="text-[8px] text-white/25 tracking-wider text-right">✓</span>
            </div>
            {we.sets.map((s, i) => (
              <div key={s.id} className="grid grid-cols-[20px_1fr_1fr_28px] gap-2 mb-2 items-center">
                <span className="text-[9px] text-white/30 text-right">{i + 1}</span>
                <input
                  type="number"
                  value={s.reps}
                  onChange={e => updateSetData(workoutId, sectionId, we.id, s.id, { reps: Number(e.target.value) })}
                  className="bg-white/[0.04] border border-white/10 text-[11px] text-white text-center py-1 px-2 w-full focus:outline-none focus:border-white/25"
                  min={1}
                />
                <input
                  type="number"
                  value={s.weight}
                  onChange={e => updateSetData(workoutId, sectionId, we.id, s.id, { weight: Number(e.target.value) })}
                  className="bg-white/[0.04] border border-white/10 text-[11px] text-white text-center py-1 px-2 w-full focus:outline-none focus:border-white/25"
                  min={0}
                  step={0.5}
                />
                <button
                  onClick={() => toggleSetComplete(workoutId, sectionId, we.id, s.id)}
                  className={`w-7 h-7 border flex items-center justify-center ${
                    s.completed ? 'border-[#C6FF00]/50 bg-[#C6FF00]/10 text-[#C6FF00]' : 'border-white/15 text-transparent'
                  }`}
                >
                  <IconCheck size={10} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => addSetToExercise(workoutId, sectionId, we.id)}
                className="text-[9px] text-white/40 hover:text-white/70 transition-colors tracking-[0.1em] uppercase"
              >
                + Set
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-[9px] text-white/40 hover:text-white/70 transition-colors tracking-[0.1em] uppercase ml-auto"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

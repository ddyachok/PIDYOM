// src/components/workout/WarmupCard.tsx
import { useStore } from '../../store/useStore';
import type { WorkoutExercise } from '../../lib/types';
import { IconCheck, IconTrash } from '../icons/Icons';

interface WarmupCardProps {
  workoutId: string;
  sectionId: string;
  workoutExercise: WorkoutExercise;
  isCompleted: boolean;
}

export function WarmupCard({ workoutId, sectionId, workoutExercise: we, isCompleted }: WarmupCardProps) {
  const { removeExerciseFromSection, toggleSetComplete } = useStore();
  const defaults = we.exercise.warmupDefaults;
  const hint = defaults?.hint || we.exercise.cues[0] || '';
  const setsReps = defaults
    ? `${defaults.sets} × ${defaults.reps}`
    : `${we.sets.length} × ${we.sets[0]?.reps ?? 10}`;

  const done = we.sets.length > 0 && we.sets[0].completed;

  const handleToggleDone = () => {
    if (isCompleted || !we.sets[0]) return;
    toggleSetComplete(workoutId, sectionId, we.id, we.sets[0].id);
  };

  return (
    <div className="py-2.5 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[8px] tracking-[0.12em] font-bold text-[#C6FF00]/60 border border-[#C6FF00]/20 px-1.5 py-0.5 shrink-0">
            WARMUP
          </span>
          <span className="text-[11px] md:text-[13px] tracking-[0.06em] font-bold truncate">
            {we.exercise.name}
          </span>
        </div>
        {hint && (
          <p className="text-[10px] text-white/40 leading-relaxed mb-1">
            {hint}
          </p>
        )}
        {we.exercise.cues.slice(1).map((cue, i) => (
          <p key={i} className="text-[10px] text-white/30 leading-relaxed flex gap-1.5">
            <span className="text-white/20 shrink-0">•</span>
            {cue}
          </p>
        ))}
        <span className="text-[10px] text-white/30 tabular-nums mt-1 block">{setsReps}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        {!isCompleted && (
          <button
            onClick={() => removeExerciseFromSection(workoutId, sectionId, we.id)}
            className="p-1.5 hover:bg-white/5 transition-colors text-white/20 hover:text-red-400/60"
            aria-label="Remove warmup"
          >
            <IconTrash size={11} />
          </button>
        )}
        <button
          onClick={handleToggleDone}
          disabled={isCompleted}
          className={`w-6 h-6 border flex items-center justify-center transition-all ${
            done
              ? 'border-[#C6FF00]/60 bg-[#C6FF00]/10 text-[#C6FF00]'
              : 'border-white/15 text-transparent hover:border-white/25'
          }`}
          aria-label="Mark warmup done"
        >
          <IconCheck size={10} />
        </button>
      </div>
    </div>
  );
}

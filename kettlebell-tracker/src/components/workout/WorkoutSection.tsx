// src/components/workout/WorkoutSection.tsx
import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { WorkoutSection as WorkoutSectionType, Workout } from '../../lib/types';
import { ExerciseCard } from './ExerciseCard';
import { WarmupCard } from './WarmupCard';
import { AddExerciseModal } from './AddExerciseModal';
import { IconChevronDown, IconPlus, IconTrash, IconGripVertical } from '../icons/Icons';

interface WorkoutSectionProps {
  workout: Workout;
  section: WorkoutSectionType;
  dragHandleProps?: Record<string, unknown>;
}

export function WorkoutSectionComponent({ workout, section, dragHandleProps }: WorkoutSectionProps) {
  const { renameSection, removeSection, sectionCollapseState, toggleSectionCollapsed } = useStore();
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(section.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCollapsed = sectionCollapseState[section.id] ?? false;

  const isWarmupSection = section.name.toLowerCase().includes('warm');

  const handleRenameSubmit = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== section.name) {
      renameSection(workout.id, section.id, trimmed);
    } else {
      setNameValue(section.name);
    }
    setEditing(false);
  };

  const handleRemove = () => {
    if (section.exercises.length > 0) {
      setShowDeleteConfirm(true);
    } else {
      removeSection(workout.id, section.id);
    }
  };

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3 group">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 transition-colors p-1 -ml-1 touch-none"
          aria-label="Drag section"
        >
          <IconGripVertical size={14} />
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => toggleSectionCollapsed(section.id)}
          className="text-white/25 hover:text-white/60 transition-colors"
          aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
        >
          <IconChevronDown
            size={14}
            className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
          />
        </button>

        {/* Section name (editable) */}
        {editing ? (
          <input
            ref={inputRef}
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') { setNameValue(section.name); setEditing(false); }
            }}
            className="text-[10px] tracking-[0.15em] font-bold uppercase bg-transparent border-b border-white/30 text-white focus:outline-none flex-1 min-w-0"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.select(), 50); }}
            className="text-[10px] tracking-[0.15em] font-bold uppercase text-white/50 hover:text-white/80 transition-colors flex-1 text-left"
          >
            {section.name}
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowAddExercise(true)}
            className="p-1.5 hover:bg-white/5 transition-colors text-white/30 hover:text-white/70"
            aria-label="Add exercise"
          >
            <IconPlus size={12} />
          </button>
          <button
            onClick={handleRemove}
            className="p-1.5 hover:bg-white/5 transition-colors text-white/20 hover:text-red-400/60"
            aria-label="Remove section"
          >
            <IconTrash size={12} />
          </button>
        </div>
      </div>

      {/* Exercise list */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {section.exercises.length === 0 ? (
              <p className="text-[9px] text-white/20 pl-8 py-2">Empty section</p>
            ) : (
              <div className="space-y-0">
                {section.exercises.map((ex, idx) => (
                  <div key={ex.id}>
                    {idx > 0 && <div className="divider" />}
                    {isWarmupSection || ex.exercise.exerciseType === 'warmup' ? (
                      <WarmupCard
                        workoutId={workout.id}
                        sectionId={section.id}
                        workoutExercise={ex}
                        isCompleted={workout.completed}
                      />
                    ) : (
                      <ExerciseCard
                        workoutId={workout.id}
                        sectionId={section.id}
                        workoutExercise={ex}
                        index={idx}
                        isCompleted={workout.completed}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add exercise button */}
            {!workout.completed && (
              <button
                onClick={() => setShowAddExercise(true)}
                className="flex items-center gap-2 text-[9px] text-white/30 hover:text-white/60 transition-colors tracking-[0.1em] uppercase mt-3 pl-1"
              >
                <IconPlus size={11} />
                {isWarmupSection ? 'Add warmup exercise' : 'Add exercise'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="modal-panel"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-[12px] text-white/70 mb-5 leading-relaxed">
                Section "{section.name}" has {section.exercises.length} exercise{section.exercises.length !== 1 ? 's' : ''}. Remove anyway?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-ghost flex-1">Cancel</button>
                <button
                  onClick={() => { removeSection(workout.id, section.id); setShowDeleteConfirm(false); }}
                  className="btn flex-1 border border-red-400/40 text-red-400/70 hover:bg-red-400/10 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add exercise modal */}
      <AnimatePresence>
        {showAddExercise && (
          <AddExerciseModal
            workoutId={workout.id}
            sectionId={section.id}
            sectionName={section.name}
            onClose={() => setShowAddExercise(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

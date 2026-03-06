import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { useToastStore } from '../store/toastStore';
import { authClient } from '../lib/auth';
import { Equipment } from '../lib/types';
import { EXERCISES, getProgressionRoots } from '../data/exercises';
import {
  IconKettlebell, IconRings, IconRope, IconBodyweight,
  IconPullupBar, IconParallettes, IconResistanceBand,
  IconTree, IconChevronRight, IconSignOut,
} from '../components/icons/Icons';
import ProgressionTree from '../components/workout/ProgressionTree';

const EQUIPMENT_INFO: Record<Equipment, { label: string; icon: typeof IconKettlebell; description: string }> = {
  kettlebell: { label: 'Kettlebell', icon: IconKettlebell, description: 'Cast iron. The foundation.' },
  rings: { label: 'Gymnastic Rings', icon: IconRings, description: 'Upper body mastery.' },
  rope: { label: 'Flow Rope', icon: IconRope, description: 'Rhythm and coordination.' },
  bodyweight: { label: 'Bodyweight', icon: IconBodyweight, description: 'Always available.' },
  pullup_bar: { label: 'Pull-Up Bar', icon: IconPullupBar, description: 'Vertical pulling.' },
  parallettes: { label: 'Parallettes', icon: IconParallettes, description: 'Push and hold.' },
  resistance_band: { label: 'Resistance Band', icon: IconResistanceBand, description: 'Assistance and mobility.' },
};

export default function ProfilePage() {
  const { userEquipment, toggleEquipment, unlockedExercises, userName, userEmail, setUserName, theme, setTheme } = useStore();
  const addToast = useToastStore((s) => s.addToast);
  const [showProgressions, setShowProgressions] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const availableExerciseCount = EXERCISES.filter(e =>
    e.equipment.some(eq => userEquipment.includes(eq))
  ).length;

  const unlockedCount = unlockedExercises.length;
  const totalCount = EXERCISES.length;

  const progressionRoots = getProgressionRoots().filter(e =>
    e.equipment.some(eq => userEquipment.includes(eq))
  );

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const handleNameSave = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      addToast('Name updated');
    }
    setEditingName(false);
  };

  // Sub-view: Progression tree detail
  if (selectedExercise) {
    return (
      <ProgressionTree
        exerciseId={selectedExercise}
        onBack={() => setSelectedExercise(null)}
      />
    );
  }

  return (
    <PageTransition className="page">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <div className="coord-stamp mb-3">SEC-5 // USER DATA</div>
        <h1 className="page-title mb-0">Operator Profile</h1>
      </div>

      {/* Identity */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-start gap-6 md:gap-8">
          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="data-label mb-2">Operator</div>
            {editingName ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  autoFocus
                  className="!w-auto !text-lg md:!text-xl tracking-wide"
                />
              </div>
            ) : (
              <button
                onClick={() => { setNameInput(userName); setEditingName(true); }}
                className="text-lg md:text-xl tracking-wide text-white hover:text-white/70 transition-colors text-left"
              >
                {userName || 'Set name'}
                <span className="text-[9px] text-white/15 ml-3 tracking-[0.15em] uppercase">Edit</span>
              </button>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="shrink-0">
            <div className="data-label mb-2">Email</div>
            <div className="text-[13px] md:text-[14px] text-white/40 tracking-wide">
              {userEmail || '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="divider-full" />

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-end gap-8 md:gap-12 mb-8 md:mb-12"
      >
        <div className="data-readout">
          <span className="data-label">Gear</span>
          <span className="text-2xl md:text-3xl font-bold">{userEquipment.length}</span>
        </div>
        <div className="data-readout">
          <span className="data-label">Available</span>
          <span className="text-2xl md:text-3xl font-bold">{availableExerciseCount}</span>
        </div>
        <div className="data-readout">
          <span className="data-label">Unlocked</span>
          <span className="text-2xl md:text-3xl font-bold">
            {unlockedCount}<span className="text-white/20 text-sm">/{totalCount}</span>
          </span>
        </div>
      </motion.div>

      <div className="divider-full" />

      {/* Equipment Grid */}
      <div className="mb-8 md:mb-12">
        <div className="section-label">Your Equipment</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {(Object.entries(EQUIPMENT_INFO) as [Equipment, typeof EQUIPMENT_INFO[Equipment]][]).map(([key, info], i) => {
            const isSelected = userEquipment.includes(key);
            const Icon = info.icon;
            const exerciseCount = EXERCISES.filter(e => e.equipment.includes(key)).length;

            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  toggleEquipment(key);
                  addToast(isSelected ? `${info.label} removed` : `${info.label} added`);
                }}
                className={`bracket-card bracket-card-interactive text-left relative ${
                  isSelected ? 'bg-white/[0.03]' : ''
                }`}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <motion.div
                    className="absolute left-0 top-4 bottom-4 w-[2px] bg-[#C6FF00]/60"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.25 }}
                  />
                )}

                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    <Icon
                      size={22}
                      className={`transition-colors ${isSelected ? 'text-white/80' : 'text-white/20'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-[13px] md:text-[14px] tracking-[0.08em] font-bold transition-colors ${
                        isSelected ? 'text-white' : 'text-white/40'
                      }`}>
                        {info.label}
                      </h3>
                      {isSelected && (
                        <span className="status-dot status-dot--active" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] md:text-[10px] text-white/20 tracking-wide">
                        {exerciseCount} exercises
                      </span>
                      <span className="text-[9px] text-white/10">·</span>
                      <span className="text-[9px] md:text-[10px] text-white/15 italic">
                        {info.description}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="divider-full" />

      {/* Progression Trees */}
      <div className="mb-8 md:mb-12">
        <button
          onClick={() => setShowProgressions(!showProgressions)}
          className="flex items-center justify-between w-full mb-4 md:mb-6 group"
        >
          <div className="flex items-center gap-3">
            <IconTree size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
            <span className="section-label mb-0">Progression Trees</span>
          </div>
          <motion.span
            animate={{ rotate: showProgressions ? 90 : 0 }}
            className="text-white/20 group-hover:text-white/40 transition-colors"
          >
            <IconChevronRight size={14} />
          </motion.span>
        </button>

        <AnimatePresence>
          {showProgressions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {progressionRoots.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {progressionRoots.map((ex, i) => {
                    const childCount = EXERCISES.filter(e => {
                      let current = e;
                      while (current.progressionParentId) {
                        if (current.progressionParentId === ex.id) return true;
                        const parent = EXERCISES.find(p => p.id === current.progressionParentId);
                        if (!parent) break;
                        current = parent;
                      }
                      return false;
                    }).length;
                    const isUnlocked = unlockedExercises.includes(ex.id);

                    return (
                      <motion.button
                        key={ex.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedExercise(ex.id)}
                        className="flex items-center gap-3 py-3 px-2 text-left hover:bg-white/[0.02] transition-colors group"
                      >
                        <span className="text-[10px] text-white/15 w-5 text-right tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={`status-dot ${isUnlocked ? 'status-dot--done' : 'status-dot--idle'}`} />
                        <span className="text-[12px] md:text-[13px] tracking-[0.06em] text-white/70 group-hover:text-white transition-colors flex-1">
                          {ex.name}
                        </span>
                        <span className="dot-leader" />
                        <span className="text-[9px] text-white/20">{ex.movementPattern}</span>
                        <span className="text-[9px] text-white/15">{childCount + 1} lvl</span>
                        <IconChevronRight size={12} className="text-white/10 group-hover:text-white/30 transition-colors" />
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-[11px] text-white/20 mb-2">No progression trees available</p>
                  <p className="text-[9px] text-white/15">Select equipment to view progressions</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="divider-full" />

      {/* Display Mode */}
      <div className="mb-8 md:mb-12">
        <div className="section-label">Display Mode</div>
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-toggle__btn${theme === 'dark' ? ' mode-toggle__btn--active' : ''}`}
            onClick={() => { setTheme('dark'); addToast('Dark mode'); }}
          >
            Dark
          </button>
          <button
            type="button"
            className={`mode-toggle__btn${theme === 'light' ? ' mode-toggle__btn--active' : ''}`}
            onClick={() => { setTheme('light'); addToast('Light mode'); }}
          >
            Light
          </button>
        </div>
      </div>

      <div className="divider-full" />

      {/* Sign Out */}
      <div className="py-6 md:py-8">
        <button
          onClick={handleSignOut}
          className="btn btn-full"
          style={{ borderColor: 'rgba(198,255,0,0.4)', color: '#C6FF00' }}
        >
          <IconSignOut size={16} />
          Sign Out
        </button>
        <div className="coord-stamp text-center mt-6">PIDYOM v1.0 // MOVEMENT FRAMEWORK</div>
      </div>
    </PageTransition>
  );
}

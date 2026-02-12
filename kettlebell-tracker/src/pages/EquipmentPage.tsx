import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { useToastStore } from '../store/toastStore';
import { Equipment } from '../lib/types';
import { EXERCISES, getProgressionRoots } from '../data/exercises';
import { IconKettlebell, IconRings, IconRope, IconBodyweight, IconPullupBar, IconParallettes, IconResistanceBand, IconTree, IconChevronRight } from '../components/icons/Icons';
import ProgressionTree from '../components/workout/ProgressionTree';

const EQUIPMENT_INFO: Record<Equipment, { label: string; icon: typeof IconKettlebell; description: string; category: string }> = {
  kettlebell: { label: 'Kettlebell', icon: IconKettlebell, description: 'Cast iron. The foundation.', category: 'WEIGHTS' },
  rings: { label: 'Gymnastic Rings', icon: IconRings, description: 'Upper body mastery.', category: 'BARS' },
  rope: { label: 'Flow Rope', icon: IconRope, description: 'Rhythm and coordination.', category: 'TOOLS' },
  bodyweight: { label: 'Bodyweight', icon: IconBodyweight, description: 'Always available.', category: 'BODY' },
  pullup_bar: { label: 'Pull-Up Bar', icon: IconPullupBar, description: 'Vertical pulling.', category: 'BARS' },
  parallettes: { label: 'Parallettes', icon: IconParallettes, description: 'Push and hold.', category: 'BARS' },
  resistance_band: { label: 'Resistance Band', icon: IconResistanceBand, description: 'Assistance and mobility.', category: 'TOOLS' },
};

export default function EquipmentPage() {
  const { userEquipment, toggleEquipment, unlockedExercises } = useStore();
  const addToast = useToastStore((s) => s.addToast);
  const [showProgressions, setShowProgressions] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const availableExerciseCount = EXERCISES.filter(e =>
    e.equipment.some(eq => userEquipment.includes(eq))
  ).length;

  const unlockedCount = unlockedExercises.length;
  const totalCount = EXERCISES.length;

  const progressionRoots = getProgressionRoots().filter(e =>
    e.equipment.some(eq => userEquipment.includes(eq))
  );

  const selectedEquipmentInfo = selectedEquipment ? EQUIPMENT_INFO[selectedEquipment] : null;
  const selectedEquipmentExercises = selectedEquipment 
    ? EXERCISES.filter(e => e.equipment.includes(selectedEquipment))
    : [];

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
        <h1 className="page-title mb-0">Equipment</h1>
        <p className="text-[11px] md:text-[15px] text-white/20 mt-2 md:mt-3">
          Select your available gear to unlock exercises
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-5 mb-8 md:mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <div className="text-xl md:text-2xl font-bold tracking-wider mb-1 md:mb-2">{userEquipment.length}</div>
          <div className="text-[9px] md:text-[11px] tracking-[0.18em] md:tracking-[0.22em] text-white/20 uppercase">GEAR</div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card text-center"
        >
          <div className="text-xl md:text-2xl font-bold tracking-wider mb-1 md:mb-2">{availableExerciseCount}</div>
          <div className="text-[9px] md:text-[11px] tracking-[0.18em] md:tracking-[0.22em] text-white/20 uppercase">AVAILABLE</div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="text-xl md:text-2xl font-bold tracking-wider mb-1 md:mb-2">
            {unlockedCount}<span className="text-white/20 text-sm md:text-base">/{totalCount}</span>
          </div>
          <div className="text-[9px] md:text-[11px] tracking-[0.18em] md:tracking-[0.22em] text-white/20 uppercase">UNLOCKED</div>
        </motion.div>
      </div>

      {/* Equipment Grid */}
      <div className="mb-8 md:mb-12">
        <div className="section-label">Your Equipment</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-6">
          {(Object.entries(EQUIPMENT_INFO) as [Equipment, typeof EQUIPMENT_INFO[Equipment]][]).map(([key, info], i) => {
            const isSelected = userEquipment.includes(key);
            const Icon = info.icon;
            const exerciseCount = EXERCISES.filter(e => e.equipment.includes(key)).length;
            const isActive = selectedEquipment === key;

            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  toggleEquipment(key);
                  setSelectedEquipment(isActive ? null : key);
                  addToast('Gear updated');
                }}
                className={`card card-interactive relative overflow-hidden group ${
                  isSelected 
                    ? 'border-white/30 bg-white/[0.05]' 
                    : 'border-white/[0.06]'
                } ${isActive ? 'ring-1 ring-white/20' : ''}`}
              >
                {/* Selected state bar */}
                {isSelected && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-white/40"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 md:gap-5 flex-1 min-w-0">
                    <div className={`shrink-0 transition-transform ${isSelected ? 'scale-110' : ''}`}>
                      <Icon 
                        size={isSelected ? 28 : 24} 
                        className={`transition-colors ${isSelected ? 'text-white/90' : 'text-white/30'}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                        <h3 className={`text-[13px] md:text-[16px] tracking-[0.08em] md:tracking-[0.1em] font-bold transition-colors ${
                          isSelected ? 'text-white' : 'text-white/50'
                        }`}>
                          {info.label}
                        </h3>
                        <span className="text-[8px] md:text-[9px] tracking-[0.15em] md:tracking-[0.18em] text-white/15 uppercase px-1.5 py-0.5 border border-white/10">
                          {info.category}
                        </span>
                      </div>
                      <p className="text-[10px] md:text-[12px] text-white/30 leading-relaxed mb-2 md:mb-3">
                        {info.description}
                      </p>
                      <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-[9px] md:text-[11px] text-white/20">
                          {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
                        </span>
                        {isSelected && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[8px] md:text-[9px] tracking-[0.12em] md:tracking-[0.15em] text-white/40 uppercase"
                          >
                            Active
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Equipment Detail Panel */}
      <AnimatePresence>
        {selectedEquipment && selectedEquipmentInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card mb-8 md:mb-12 bg-white/[0.02] border-white/15"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3 md:gap-4">
                <selectedEquipmentInfo.icon size={24} className="text-white/60" />
                <div>
                  <h3 className="text-[15px] md:text-[18px] tracking-[0.1em] md:tracking-[0.12em] font-bold mb-1">
                    {selectedEquipmentInfo.label}
                  </h3>
                  <p className="text-[10px] md:text-[12px] text-white/30">
                    {selectedEquipmentExercises.length} exercises available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="text-[9px] md:text-[11px] tracking-[0.15em] md:tracking-[0.18em] text-white/20 hover:text-white/50 transition-colors uppercase"
              >
                Close
              </button>
            </div>

            {/* Exercise list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {selectedEquipmentExercises.slice(0, 6).map((ex) => {
                const isUnlocked = unlockedExercises.includes(ex.id);
                return (
                  <div
                    key={ex.id}
                    className={`p-3 md:p-4 border transition-all ${
                      isUnlocked 
                        ? 'border-white/15 bg-white/[0.02]' 
                        : 'border-white/[0.05] bg-white/[0.01] opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <span className="text-[11px] md:text-[13px] tracking-[0.06em] md:tracking-[0.08em] font-medium">
                        {ex.name}
                      </span>
                      {isUnlocked && (
                        <span className="text-[8px] md:text-[9px] tracking-[0.1em] md:tracking-[0.12em] text-white/30 uppercase">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-[8px] md:text-[9px] text-white/15 uppercase">{ex.movementPattern}</span>
                      <span className="text-[8px] md:text-[9px] text-white/10">·</span>
                      <span className="text-[8px] md:text-[9px] text-white/15">{ex.difficulty}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedEquipmentExercises.length > 6 && (
              <div className="mt-4 md:mt-6 text-center">
                <span className="text-[9px] md:text-[11px] text-white/20">
                  +{selectedEquipmentExercises.length - 6} more exercises
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progression Trees Section */}
      <div className="mb-6 md:mb-9">
        <button
          onClick={() => setShowProgressions(!showProgressions)}
          className="flex items-center justify-between w-full mb-4 md:mb-6 group"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <IconTree size={18} className="text-white/30 group-hover:text-white/50 transition-colors md:w-[22px] md:h-[22px]" />
            <span className="section-label mb-0">Progression Trees</span>
          </div>
          <motion.span 
            animate={{ rotate: showProgressions ? 90 : 0 }}
            className="text-white/20 group-hover:text-white/40 transition-colors"
          >
            <IconChevronRight size={16} className="md:w-[20px] md:h-[20px]" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedExercise(ex.id)}
                        className="card card-interactive text-left group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                              <IconTree size={16} className="text-white/20 group-hover:text-white/40 transition-colors md:w-[18px] md:h-[18px]" />
                              <h4 className="text-[12px] md:text-[14px] tracking-[0.06em] md:tracking-[0.08em] font-bold truncate">
                                {ex.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-3 md:gap-4 mb-2">
                              <span className="text-[9px] md:text-[11px] text-white/20 uppercase">{ex.movementPattern}</span>
                              <span className="text-[9px] md:text-[11px] text-white/10">·</span>
                              <span className="text-[9px] md:text-[11px] text-white/20">{ex.difficulty}</span>
                            </div>
                            <p className="text-[9px] md:text-[11px] text-white/15">
                              {childCount + 1} exercises in progression
                            </p>
                          </div>
                          <div className="shrink-0">
                            <IconChevronRight size={14} className="text-white/15 group-hover:text-white/40 transition-colors md:w-[16px] md:h-[16px]" />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="card text-center py-8 md:py-12">
                  <p className="text-[11px] md:text-[13px] text-white/20 mb-2 md:mb-3">
                    No progression trees available
                  </p>
                  <p className="text-[9px] md:text-[11px] text-white/15">
                    Select equipment to view progressions
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {userEquipment.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12 md:py-16"
        >
          <p className="text-[11px] md:text-[15px] text-white/15 mb-4 md:mb-6">
            Select your equipment to unlock exercises
          </p>
          <p className="text-[9px] md:text-[11px] text-white/10">
            Tap any gear card above to get started
          </p>
        </motion.div>
      )}
    </PageTransition>
  );
}

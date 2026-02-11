import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { Equipment } from '../lib/types';
import { EXERCISES, getProgressionRoots } from '../data/exercises';
import { IconKettlebell, IconRings, IconRope, IconBodyweight, IconPullupBar, IconParallettes, IconResistanceBand, IconTree, IconChevronRight } from '../components/icons/Icons';
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

export default function EquipmentPage() {
  const { userEquipment, toggleEquipment, unlockedExercises, exercises } = useStore();
  const [showProgressions, setShowProgressions] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const availableExerciseCount = EXERCISES.filter(e =>
    e.equipment.some(eq => userEquipment.includes(eq))
  ).length;

  const unlockedCount = unlockedExercises.length;
  const totalCount = EXERCISES.length;

  const progressionRoots = getProgressionRoots().filter(e =>
    e.equipment.some(eq => userEquipment.includes(eq))
  );

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
      <h1 className="page-title">Equipment</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card text-center">
          <div className="text-2xl font-bold tracking-wider mb-2">{userEquipment.length}</div>
          <div className="text-[8px] tracking-[0.2em] text-white/20">GEAR</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card text-center">
          <div className="text-2xl font-bold tracking-wider mb-2">{availableExerciseCount}</div>
          <div className="text-[8px] tracking-[0.2em] text-white/20">AVAILABLE</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card text-center">
          <div className="text-2xl font-bold tracking-wider mb-2">{unlockedCount}<span className="text-white/20 text-sm">/{totalCount}</span></div>
          <div className="text-[8px] tracking-[0.2em] text-white/20">UNLOCKED</div>
        </motion.div>
      </div>

      {/* Equipment Selection */}
      <div className="mb-8">
        <div className="section-label">Your Equipment</div>
        <div className="space-y-2">
          {(Object.entries(EQUIPMENT_INFO) as [Equipment, typeof EQUIPMENT_INFO[Equipment]][]).map(([key, info], i) => {
            const isSelected = userEquipment.includes(key);
            const Icon = info.icon;
            const exerciseCount = EXERCISES.filter(e => e.equipment.includes(key)).length;

            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggleEquipment(key)}
                className={`w-full flex items-center gap-3 p-3 border transition-all ${
                  isSelected
                    ? 'border-white/20 bg-white/[0.03]'
                    : 'border-white/[0.04] hover:bg-white/[0.02]'
                }`}
              >
                <Icon size={20} className={isSelected ? 'text-white/70' : 'text-white/15'} />
                <div className="flex-1 text-left">
                  <div className={`text-[11px] tracking-wide ${isSelected ? 'text-white/80' : 'text-white/30'}`}>
                    {info.label}
                  </div>
                  <div className="text-[9px] text-white/20">{info.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-white/15">{exerciseCount} ex</span>
                  <div className={`w-3 h-3 border transition-colors ${isSelected ? 'border-white/40 bg-white/20' : 'border-white/10'}`} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Progression Trees */}
      <div>
        <button
          onClick={() => setShowProgressions(!showProgressions)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase">Progression Trees</span>
          <motion.span animate={{ rotate: showProgressions ? 90 : 0 }}>
            <IconChevronRight size={12} className="text-white/20" />
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
              <div className="space-y-1">
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

                  return (
                    <motion.button
                      key={ex.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedExercise(ex.id)}
                      className="w-full flex items-center justify-between p-2.5 border border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <IconTree size={14} className="text-white/20" />
                        <div className="text-left">
                          <span className="text-[10px] tracking-wide">{ex.name}</span>
                          <span className="text-[8px] text-white/20 block">{ex.movementPattern} · {childCount + 1} exercises</span>
                        </div>
                      </div>
                      <IconChevronRight size={12} className="text-white/15" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

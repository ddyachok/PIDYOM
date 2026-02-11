import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { IconHome, IconDumbbell, IconCalendar, IconChart, IconSettings } from '../icons/Icons';

const tabs = [
  { id: 'home', label: 'HOME', icon: IconHome },
  { id: 'workouts', label: 'TRAIN', icon: IconDumbbell },
  { id: 'schedule', label: 'PLAN', icon: IconCalendar },
  { id: 'progress', label: 'STATS', icon: IconChart },
  { id: 'equipment', label: 'GEAR', icon: IconSettings },
];

export default function BottomNav() {
  const currentTab = useStore(s => s.currentTab);
  const setCurrentTab = useStore(s => s.setCurrentTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-white/[0.06] safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1 px-3 transition-colors"
            >
              <Icon
                size={20}
                className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/30'}`}
              />
              <span
                className={`text-[9px] tracking-[0.15em] uppercase transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-white/30'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-2 right-2 h-px bg-white"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

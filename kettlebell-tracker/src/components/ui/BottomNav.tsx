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
      <div className="max-w-lg mx-auto flex items-center justify-around h-14 md:h-24">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className="relative flex flex-col items-center justify-center gap-0.5 md:gap-1 py-1 md:py-2 px-2 md:px-5 transition-colors min-w-0 flex-1"
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
            >
              <span className="inline-flex shrink-0 w-[22px] h-[22px] md:w-[33px] md:h-[33px] items-center justify-center">
                <Icon
                  size={22}
                  className={`transition-colors duration-200 md:scale-150 origin-center ${isActive ? 'text-white' : 'text-white/30'}`}
                />
              </span>
              <span
                className={`text-[9px] md:text-[17px] tracking-[0.15em] md:tracking-[0.27em] uppercase transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-white/30'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-2 right-2 md:left-3 md:right-3 h-px bg-white"
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

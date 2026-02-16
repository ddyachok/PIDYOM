import { useStore } from '../../store/useStore';
import { IconHome, IconDumbbell, IconCalendar, IconChart, IconUser } from '../icons/Icons';

const tabs = [
  { id: 'home', label: 'HOME', icon: IconHome },
  { id: 'workouts', label: 'TRAIN', icon: IconDumbbell },
  { id: 'schedule', label: 'PLAN', icon: IconCalendar },
  { id: 'progress', label: 'INTEL', icon: IconChart },
  { id: 'profile', label: 'YOU', icon: IconUser },
];

export default function BottomNav() {
  const currentTab = useStore(s => s.currentTab);
  const setCurrentTab = useStore(s => s.setCurrentTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/[0.06] safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className="relative flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors min-w-[48px] min-h-[48px] flex-1"
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
            >
              <span className="inline-flex shrink-0 w-[22px] h-[22px] items-center justify-center">
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/35'}`}
                />
              </span>
              <span
                className={`text-[10px] tracking-[0.15em] uppercase transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-white/35'
                }`}
              >
                {tab.label}
              </span>
              {/* White underline indicator (no orange dot) */}
              {isActive && (
                <div className="absolute bottom-1 w-5 h-[2px] bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { IconHome, IconDumbbell, IconUser } from '../icons/Icons';

// Inline arc-mark used as the "Club" tab icon — keeps the brand
// primitive present in the navigation itself.
function IconArcMark({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <circle cx={12} cy={12} r={5} fill="currentColor" />
      <path d="M 3 12 A 9 9 0 0 0 21 12" stroke="currentColor" strokeWidth={2.4} fill="none" strokeLinecap="butt" />
    </svg>
  );
}

const tabs = [
  { id: 'home', label: 'HOME', icon: IconHome },
  { id: 'club', label: 'CLUB', icon: IconArcMark },
  { id: 'workouts', label: 'TRAIN', icon: IconDumbbell },
  { id: 'profile', label: 'YOU', icon: IconUser },
];

export default function BottomNav() {
  const currentTab = useStore(s => s.currentTab);
  const setCurrentTab = useStore(s => s.setCurrentTab);
  const theme = useStore(s => s.theme);
  const isLight = theme === 'light';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        background: isLight ? '#CCCCC4' : '#0A0A0A',
        borderTop: isLight ? '1px solid rgba(10,10,10,0.1)' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-stretch justify-around h-14">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 transition-colors"
              style={{ color: isActive ? (isLight ? '#0A0A0A' : '#C6FF00') : (isLight ? 'rgba(10,10,10,0.4)' : '#6A6A62') }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 left-2 right-2 h-[2px]"
                  style={{ background: '#C6FF00' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <span className="inline-flex shrink-0 w-5 h-5 items-center justify-center">
                <Icon size={18} />
              </span>
              <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

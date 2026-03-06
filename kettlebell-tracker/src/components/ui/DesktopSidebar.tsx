import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { IconHome, IconDumbbell, IconCalendar, IconChart, IconUser } from '../icons/Icons';

const tabs = [
  { id: 'home', label: 'HOME', num: '01', icon: IconHome },
  { id: 'workouts', label: 'TRAIN', num: '02', icon: IconDumbbell },
  { id: 'schedule', label: 'PLAN', num: '03', icon: IconCalendar },
  { id: 'progress', label: 'INTEL', num: '04', icon: IconChart },
  { id: 'profile', label: 'YOU', num: '05', icon: IconUser },
];

export default function DesktopSidebar() {
  const currentTab = useStore(s => s.currentTab);
  const setCurrentTab = useStore(s => s.setCurrentTab);
  const theme = useStore(s => s.theme);
  const isLight = theme === 'light';

  return (
    <nav className="desktop-sidebar desktop-only">
      {/* Logo */}
      <div className="px-6 mb-10">
        <div
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: '0.05em', color: isLight ? '#0A0A0A' : '#E8E8E1', textTransform: 'uppercase' }}
        >
          PIDYOM
        </div>
        <div style={{ fontSize: 8, letterSpacing: '0.2em', color: '#6A6A62', textTransform: 'uppercase', marginTop: 3 }}>
          Movement Framework
        </div>
        {/* Acid rule */}
        <div style={{ height: 1, background: '#C6FF00', width: 24, marginTop: 10 }} />
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          const activeColor = isLight ? '#0A0A0A' : '#E8E8E1';
          const inactiveColor = '#6A6A62';
          const hoverColor = isLight ? 'rgba(10,10,10,0.6)' : 'rgba(232,232,225,0.6)';
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className="relative flex items-center gap-3 px-6 py-3.5 text-left transition-all duration-200"
              style={{
                color: isActive ? activeColor : inactiveColor,
                background: isActive ? 'rgba(198,255,0,0.04)' : 'transparent',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = hoverColor; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = inactiveColor; }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
            >
              {/* Acid left bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ background: '#C6FF00' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Number */}
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  color: isActive ? '#C6FF00' : (isLight ? 'rgba(10,10,10,0.2)' : '#2a2a2a'),
                  letterSpacing: '0.05em',
                  width: 20,
                  flexShrink: 0,
                  transition: 'color 0.2s',
                }}
              >
                {tab.num}
              </span>

              <span className="shrink-0 opacity-70">
                <Icon size={15} />
              </span>

              <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 pt-6 border-t" style={{ borderColor: isLight ? 'rgba(10,10,10,0.08)' : 'rgba(255,255,255,0.05)' }}>
        <div className="coord-stamp">SYS // NAV-0</div>
      </div>
    </nav>
  );
}

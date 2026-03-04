import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import Logo from './Logo';
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

  return (
    <nav className="desktop-sidebar desktop-only">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-12">
        <Logo size={32} animate={false} />
        <div>
          <div className="text-[14px] tracking-[0.3em] font-bold">PIDYOM</div>
          <div className="text-[9px] tracking-[0.15em] text-white/25 uppercase">Framework</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-0.5 flex-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex items-center gap-3.5 px-4 py-3 text-left transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-white/30 hover:text-white/55 hover:bg-white/[0.02]'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
            >
              {/* Amber left bar indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-2 bottom-2 w-[2px]"
                  style={{ background: '#ff9500' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-bg"
                  className="absolute inset-0"
                  style={{ background: 'rgba(255,149,0,0.05)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span
                className={`relative text-[10px] tracking-[0.1em] w-5 tabular-nums transition-colors ${
                  isActive ? 'text-amber-400' : 'text-white/20'
                }`}
                style={isActive ? { color: 'rgba(255,149,0,0.7)' } : {}}
              >
                {tab.num}
              </span>
              <span className="relative">
                <Icon size={17} className="transition-colors shrink-0" />
              </span>
              <span className="relative text-[12px] tracking-[0.2em] uppercase font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer coord stamp */}
      <div className="coord-stamp mt-auto pt-8">
        SEC-0 // NAV SYSTEM
      </div>
    </nav>
  );
}

import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { authClient } from '../../lib/auth';
import Logo from './Logo';
import { IconHome, IconDumbbell, IconCalendar, IconChart, IconSettings } from '../icons/Icons';

const tabs = [
  { id: 'home', label: 'HOME', icon: IconHome },
  { id: 'workouts', label: 'TRAIN', icon: IconDumbbell },
  { id: 'schedule', label: 'PLAN', icon: IconCalendar },
  { id: 'progress', label: 'STATS', icon: IconChart },
  { id: 'equipment', label: 'GEAR', icon: IconSettings },
];

export default function DesktopSidebar() {
  const currentTab = useStore(s => s.currentTab);
  const setCurrentTab = useStore(s => s.setCurrentTab);
  const userName = useStore(s => s.userName);

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <nav className="desktop-sidebar desktop-only">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <Logo size={32} animate={false} />
        <div>
          <div className="text-[11px] tracking-[0.25em] font-bold">PIDYOM</div>
          <div className="text-[8px] tracking-[0.2em] text-white/20 uppercase">Framework</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1 flex-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 ${
                isActive
                  ? 'text-white bg-white/[0.04]'
                  : 'text-white/25 hover:text-white/50 hover:bg-white/[0.02]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-0 bottom-0 w-px bg-white"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={16} className="transition-colors" />
              <span className="text-[10px] tracking-[0.2em] uppercase">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* User */}
      <div className="pt-6 border-t border-white/[0.06]">
        {userName && (
          <div className="text-[9px] tracking-[0.15em] text-white/30 mb-2 truncate uppercase">
            {userName}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="text-[9px] tracking-[0.15em] text-white/15 hover:text-white/40 transition-colors uppercase"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}

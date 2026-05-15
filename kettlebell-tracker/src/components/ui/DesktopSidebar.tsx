import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { IconHome, IconDumbbell, IconUser } from '../icons/Icons';
import Logo from './Logo';
import Wordmark from '../brand/Wordmark';

function IconArcMark({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <circle cx={12} cy={12} r={5} fill="currentColor" />
      <path d="M 3 12 A 9 9 0 0 0 21 12" stroke="currentColor" strokeWidth={2.4} fill="none" strokeLinecap="butt" />
    </svg>
  );
}

const tabs = [
  { path: '/', label: 'HOME', num: '01', icon: IconHome },
  { path: '/club', label: 'CLUB', num: '02', icon: IconArcMark },
  { path: '/train', label: 'TRAIN', num: '03', icon: IconDumbbell },
  { path: '/you', label: 'YOU', num: '04', icon: IconUser },
];

function isActive(tabPath: string, currentPath: string): boolean {
  if (tabPath === '/') return currentPath === '/';
  return currentPath === tabPath || currentPath.startsWith(tabPath + '/');
}

export default function DesktopSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useStore(s => s.theme);
  const setTheme = useStore(s => s.setTheme);
  const isLight = theme === 'light';
  const ink = isLight ? '#0A0A0A' : '#E8E8E1';

  return (
    <nav className="desktop-sidebar desktop-only">
      {/* Lockup: arc-mark + wordmark */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-2.5">
          <span style={{ color: ink, display: 'inline-flex' }}>
            <Logo size={26} animate={false} />
          </span>
          <Wordmark size="md" color={ink} />
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 'var(--tracking-widest)', color: 'var(--text-mono-cap)', textTransform: 'uppercase', marginTop: 8 }}>
          Pick up · Rise · ПІДЙОМ
        </div>
        <div style={{ height: 1, background: 'var(--ink)', width: 24, marginTop: 10 }} />
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1">
        {tabs.map((tab) => {
          const active = isActive(tab.path, pathname);
          const Icon = tab.icon;
          const activeColor = ink;
          const inactiveColor = '#9A9A90';
          const hoverColor = isLight ? 'rgba(10,10,10,0.6)' : 'rgba(232,232,225,0.6)';
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex items-center gap-3 px-6 py-3.5 text-left transition-all duration-200"
              style={{
                color: active ? activeColor : inactiveColor,
                background: active ? (isLight ? 'rgba(10,10,10,0.04)' : 'rgba(255,255,255,0.04)') : 'transparent',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = hoverColor; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = inactiveColor; }}
              aria-current={active ? 'page' : undefined}
              aria-label={tab.label}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ background: 'var(--ink)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: 10,
                  color: active ? ink : (isLight ? 'rgba(10,10,10,0.25)' : 'rgba(255,255,255,0.2)'),
                  letterSpacing: '0.18em',
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

      {/* Footer — theme toggle + coord */}
      <div className="px-6 pt-6 border-t flex flex-col gap-3" style={{ borderColor: isLight ? 'rgba(10,10,10,0.08)' : 'rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => setTheme(isLight ? 'dark' : 'light')}
          className="flex items-center justify-between"
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: isLight ? 'rgba(10,10,10,0.5)' : 'rgba(232,232,225,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
        >
          <span>{isLight ? 'Paper' : 'Void'}</span>
          <span style={{ color: 'var(--ink)' }}>↔</span>
        </button>
        <div className="coord-stamp">SYS // NAV-0</div>
      </div>
    </nav>
  );
}

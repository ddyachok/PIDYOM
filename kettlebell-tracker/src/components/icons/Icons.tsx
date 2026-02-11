interface IconProps {
  size?: number;
  className?: string;
}

export function IconHome({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 12L12 3l9 9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconDumbbell({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M6.5 6.5a2 2 0 013 0l8 8a2 2 0 01-3 3l-8-8a2 2 0 010-3z" strokeLinecap="round"/>
      <path d="M4.5 8.5L2 11l2.5 2.5M19.5 15.5L22 13l-2.5-2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 4.5L11 2l2.5 2.5M15.5 19.5L13 22l-2.5-2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconCalendar({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="1" strokeLinecap="round"/>
      <path d="M3 10h18M8 2v4M16 2v4" strokeLinecap="round"/>
      <circle cx="8" cy="15" r="1" fill="currentColor"/>
      <circle cx="12" cy="15" r="1" fill="currentColor"/>
      <circle cx="16" cy="15" r="1" fill="currentColor"/>
    </svg>
  );
}

export function IconChart({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 16l4-6 4 4 5-8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="7" cy="16" r="1.5" fill="currentColor"/>
      <circle cx="11" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="14" r="1.5" fill="currentColor"/>
      <circle cx="20" cy="6" r="1.5" fill="currentColor"/>
    </svg>
  );
}

export function IconSettings({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round"/>
    </svg>
  );
}

export function IconKettlebell({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 2.5c-1.8 0-3 1-3 2.5s1.2 2.5 3 2.5 3-1 3-2.5-1.2-2.5-3-2.5z"/>
      <path d="M9.5 6.5L9 9.5M14.5 6.5L15 9.5" strokeLinecap="round"/>
      <ellipse cx="12" cy="16" rx="6.5" ry="7"/>
      <circle cx="12" cy="16" r="2.5" opacity="0.25"/>
    </svg>
  );
}

export function IconRings({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M8 2v6M16 2v6" strokeLinecap="round"/>
      <circle cx="8" cy="14" r="5"/>
      <circle cx="16" cy="14" r="5"/>
    </svg>
  );
}

export function IconRope({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 4c4 0 4 8 8 8s4-8 8-8" strokeLinecap="round"/>
      <path d="M4 12c4 0 4 8 8 8s4-8 8-8" strokeLinecap="round"/>
    </svg>
  );
}

export function IconBodyweight({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="4" r="2.5"/>
      <path d="M12 8v5M8 20l4-7 4 7M8 13h8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconPullupBar({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M2 8h20" strokeLinecap="round" strokeWidth="2"/>
      <path d="M5 8v-3M19 8v-3M5 8v4M19 8v4" strokeLinecap="round"/>
    </svg>
  );
}

export function IconParallettes({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 18h6M15 18h6" strokeLinecap="round" strokeWidth="2"/>
      <path d="M5 18v-4M7 18v-4M17 18v-4M19 18v-4" strokeLinecap="round"/>
    </svg>
  );
}

export function IconResistanceBand({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 6c0 0 2 6 8 6s8-6 8-6" strokeLinecap="round"/>
      <path d="M4 6c0 0 2-2 8-2s8 2 8 2" strokeLinecap="round" opacity="0.4"/>
      <path d="M6 12v6M18 12v6" strokeLinecap="round"/>
      <path d="M6 18c0 0 2 2 6 2s6-2 6-2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconPlus({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCheck({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronRight({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronLeft({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconClose({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/>
    </svg>
  );
}

export function IconTree({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="4" r="2"/>
      <path d="M12 6v4"/>
      <circle cx="6" cy="14" r="2"/>
      <circle cx="18" cy="14" r="2"/>
      <path d="M12 10l-6 4M12 10l6 4"/>
      <circle cx="4" cy="21" r="1.5"/>
      <circle cx="8" cy="21" r="1.5"/>
      <circle cx="16" cy="21" r="1.5"/>
      <circle cx="20" cy="21" r="1.5"/>
      <path d="M6 16l-2 5M6 16l2 5M18 16l-2 5M18 16l2 5" strokeWidth="1"/>
    </svg>
  );
}

export function IconStrength({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconConditioning({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 12h4l3-9 4 18 3-9h4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconMobility({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="5" r="2"/>
      <path d="M8 22l2-7-2-3 4-4 4 4-2 3 2 7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconPower({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 2v6M6.34 6.34L4.93 4.93M17.66 6.34l1.41-1.41" strokeLinecap="round"/>
      <path d="M4 14h16M8 18h8M10 22h4" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCoordination({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="6" cy="6" r="2"/>
      <circle cx="18" cy="18" r="2"/>
      <path d="M8 6h8a4 4 0 010 8H8a4 4 0 000 8h8" strokeLinecap="round"/>
    </svg>
  );
}

export function IconHinge({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="4" r="2"/>
      <path d="M12 6v2l-5 6M12 8l5 6M7 14l-2 7M17 14l2 7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconSquat({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="3" r="2"/>
      <path d="M12 5v4M8 9h8M8 9l-2 6 2 2v5M16 9l2 6-2 2v5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconPush({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconPull({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconCarry({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="3" r="2"/>
      <path d="M12 5v7M8 12l-3 1v5l3 2M16 12l3 1v5l-3 2M10 12v8l2 2 2-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconCore({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  );
}

export function IconFlow({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M2 12c4-4 6 4 10 0s6 4 10 0" strokeLinecap="round"/>
      <path d="M2 18c4-4 6 4 10 0s6 4 10 0" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

export function IconLock({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="5" y="11" width="14" height="10" rx="1"/>
      <path d="M8 11V7a4 4 0 018 0v4"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
    </svg>
  );
}

export function IconUnlock({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="5" y="11" width="14" height="10" rx="1"/>
      <path d="M8 11V7a4 4 0 018 0"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
    </svg>
  );
}

export function IconTrash({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconClock({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconPlay({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

export function IconGoogle({ size = 24, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M3 10h18M8 4v18M14 14h4M14 18h4" strokeLinecap="round"/>
    </svg>
  );
}

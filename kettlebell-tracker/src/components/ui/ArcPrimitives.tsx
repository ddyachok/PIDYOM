import { motion, useReducedMotion } from 'framer-motion';

interface ArcDividerProps {
  width?: number | string;
  color?: string;
  className?: string;
}

// Hairline rule with the mark (circle + arc) suspended in the middle.
// Replaces plain <hr/> between dossier sections.
export function ArcDivider({
  width = '100%',
  color = 'var(--ink-22)',
  className,
}: ArcDividerProps) {
  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: 0, width, height: 16 }}
      aria-hidden
    >
      <span style={{ flex: 1, height: 1, background: color }} />
      <svg viewBox="0 0 36 14" width={36} height={14} style={{ flexShrink: 0 }}>
        <circle cx={18} cy={7} r={2.8} fill="var(--ink)" />
        <path d="M 8 7 A 10 10 0 0 0 28 7" fill="none" stroke="var(--ink)" strokeWidth={1.4} />
      </svg>
      <span style={{ flex: 1, height: 1, background: color }} />
    </div>
  );
}

interface CapacityDialProps {
  going: number;
  capacity: number;
  size?: number;
  color?: string;
  trackColor?: string;
  /** Render a tick mark at the current fill end (locked state). */
  locked?: boolean;
  className?: string;
}

// Bottom-open arc, filled going/capacity of its length.
// Arc spans (10,50) → (90,50) over the top. Length = π * 40.
export function CapacityDial({
  going,
  capacity,
  size = 88,
  color = 'var(--ink)',
  trackColor = 'var(--ink-15)',
  locked = false,
  className,
}: CapacityDialProps) {
  const reduce = useReducedMotion();
  const pct = capacity > 0 ? Math.max(0, Math.min(1, going / capacity)) : 0;
  const arcLen = Math.PI * 40;
  const dash = pct * arcLen;

  // Tick at fill-end: parametrise the top arc (cx=50, cy=50, r=40).
  // Arc starts at angle π (x=10) and sweeps to 0 (x=90), going through -π/2 (top).
  const tickAngle = Math.PI - pct * Math.PI;
  const tickCx = 50 + 40 * Math.cos(tickAngle);
  const tickCy = 50 - 40 * Math.sin(tickAngle);

  return (
    <svg
      viewBox="0 0 100 60"
      width={size}
      height={size * 0.6}
      className={className}
      aria-label={`${going} of ${capacity}`}
    >
      <path
        d="M 10 50 A 40 40 0 0 1 90 50"
        fill="none"
        stroke={trackColor}
        strokeWidth={4}
      />
      <motion.path
        d="M 10 50 A 40 40 0 0 1 90 50"
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="butt"
        initial={reduce ? false : { strokeDasharray: `0 ${arcLen}` }}
        animate={{ strokeDasharray: `${dash} ${arcLen}` }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 0.32, ease: [0.65, 0.05, 0.36, 1] }
        }
      />
      {locked && (
        <circle cx={tickCx} cy={tickCy} r={3} fill={color} />
      )}
    </svg>
  );
}

interface TimeToLiftProps {
  /** 0 = far from session, 1 = at session start. */
  pct: number;
  width?: number;
  color?: string;
  trackColor?: string;
  className?: string;
}

// Wide arc rising L→R. Track is hairline; fill traces from left toward right.
// A dot sits parametrically along the arc.
export function TimeToLift({
  pct,
  width = 120,
  color = 'var(--ink)',
  trackColor = 'var(--ink-15)',
  className,
}: TimeToLiftProps) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, pct));
  const arcLen = Math.PI * 54;
  const dash = clamped * arcLen;

  // Dot position along the arc: parametric (cos θ, sin θ) with θ = π * (1 - pct)
  const theta = Math.PI * (1 - clamped);
  const cx = 60 + 54 * Math.cos(theta);
  const cy = 54 - 54 * Math.sin(theta);

  return (
    <svg
      viewBox="0 0 120 60"
      width={width}
      height={width * 0.5}
      className={className}
      aria-hidden
    >
      <path
        d="M 6 54 A 54 54 0 0 1 114 54"
        fill="none"
        stroke={trackColor}
        strokeWidth={1.4}
      />
      <motion.path
        d="M 6 54 A 54 54 0 0 1 114 54"
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        initial={reduce ? false : { strokeDasharray: `0 ${arcLen}` }}
        animate={{ strokeDasharray: `${dash} ${arcLen}` }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 0.6, ease: [0.65, 0.05, 0.36, 1] }
        }
      />
      <circle cx={cx} cy={cy} r={3} fill={color} />
      <text
        x={6}
        y={59}
        fontFamily="var(--font-mono)"
        fontSize={6}
        fill="var(--stone-500)"
        letterSpacing="1"
      >
        NOW
      </text>
      <text
        x={114}
        y={59}
        textAnchor="end"
        fontFamily="var(--font-mono)"
        fontSize={6}
        fill="var(--stone-500)"
        letterSpacing="1"
      >
        LIFT
      </text>
    </svg>
  );
}

interface AsemicStrokeProps {
  size?: number;
  color?: string;
  className?: string;
  duration?: number;
}

// Asemic ПІДЙОМ — a single brushstroke that resembles handwriting
// without being literal. Used in loaders and completion moments only.
export function AsemicStroke({
  size = 200,
  color = 'currentColor',
  className,
  duration = 1.4,
}: AsemicStrokeProps) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 200 80" width={size} height={size * 0.4} className={className}>
      <motion.path
        d="M 12 56 C 28 18, 44 30, 56 48 S 78 70, 92 44 S 116 14, 130 42 S 156 60, 172 30 S 188 14, 192 26"
        fill="none"
        stroke={color}
        strokeWidth={4.5}
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={
          reduce
            ? { duration: 0 }
            : { pathLength: { duration, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.2 } }
        }
      />
    </svg>
  );
}

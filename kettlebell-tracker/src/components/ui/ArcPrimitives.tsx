import { motion } from 'framer-motion';

interface ArcProgressProps {
  /** 0–100 */
  value: number;
  size?: number;
  /** Stroke width in viewBox units (100 base). */
  thickness?: number;
  /** Optional center label. */
  label?: string;
  className?: string;
  /** Foreground (track) color. */
  trackColor?: string;
  /** Acid/active stroke color. */
  fillColor?: string;
}

/**
 * Arc-based progress (open-bottom). Replaces the old conic-gradient ring
 * with the brand's "arc + circle" geometry — a single sweeping stroke
 * across the top half.
 */
export function ArcProgress({
  value,
  size = 96,
  thickness = 5,
  label,
  className,
  trackColor = 'var(--c-fg-12)',
  fillColor = 'var(--c-accent)',
}: ArcProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  // Top-arc path from (10,50) → (90,50) sweeping over top.
  // Arc length ≈ π * 40 ≈ 125.66
  const arcLen = Math.PI * 40;
  const dash = (pct / 100) * arcLen;

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative' }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
          strokeLinecap="butt"
        />
        {/* Fill */}
        <motion.path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={fillColor}
          strokeWidth={thickness}
          strokeLinecap="butt"
          strokeDasharray={`${dash} ${arcLen}`}
          initial={{ strokeDasharray: `0 ${arcLen}` }}
          animate={{ strokeDasharray: `${dash} ${arcLen}` }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
      {label && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '14%',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 900,
            fontSize: size * 0.22,
            letterSpacing: '-0.02em',
            color: 'var(--c-fg)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

interface ArcRiseProps {
  /** 0–100 — peak position. */
  peak?: number;
  width?: number;
  height?: number;
  trackColor?: string;
  arcColor?: string;
  capColor?: string;
  className?: string;
  animate?: boolean;
}

/**
 * Wide "rise" arc — used as a hero stat decoration.
 * A single curve from baseline-left → peak (centered) → baseline-right.
 */
export function ArcRise({
  width = 120,
  height = 60,
  trackColor = 'var(--c-fg-08)',
  arcColor = 'var(--c-accent)',
  capColor = 'var(--c-fg)',
  className,
  animate = true,
}: ArcRiseProps) {
  return (
    <svg viewBox="0 0 120 60" width={width} height={height} className={className}>
      <line x1={6} y1={50} x2={6} y2={14} stroke={trackColor} strokeWidth={0.5} />
      <line x1={114} y1={50} x2={114} y2={14} stroke={trackColor} strokeWidth={0.5} />
      <motion.path
        d="M 6 50 Q 60 6 114 50"
        fill="none"
        stroke={arcColor}
        strokeWidth={2}
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animate ? { duration: 0.9, ease: [0.65, 0, 0.35, 1] } : undefined}
      />
      <circle cx={6} cy={50} r={2.5} fill={capColor} />
      <circle cx={114} cy={50} r={2.5} fill={capColor} />
      <motion.circle
        cx={60}
        cy={14}
        r={3.5}
        fill={arcColor}
        initial={animate ? { scale: 0 } : undefined}
        animate={animate ? { scale: 1 } : undefined}
        transition={animate ? { delay: 0.7, duration: 0.3 } : undefined}
        style={{ transformOrigin: '60px 14px' }}
      />
    </svg>
  );
}

interface AsemicStrokeProps {
  size?: number;
  color?: string;
  className?: string;
  /** Animation duration in seconds. */
  duration?: number;
}

/**
 * Asemic ПІДЙОМ — a single brushstroke that resembles handwriting
 * without being literal. Used in loaders and completion moments only.
 */
export function AsemicStroke({
  size = 200,
  color = 'currentColor',
  className,
  duration = 1.4,
}: AsemicStrokeProps) {
  return (
    <svg viewBox="0 0 200 80" width={size} height={size * 0.4} className={className}>
      <motion.path
        d="M 12 56 C 28 18, 44 30, 56 48 S 78 70, 92 44 S 116 14, 130 42 S 156 60, 172 30 S 188 14, 192 26"
        fill="none"
        stroke={color}
        strokeWidth={4.5}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration, ease: [0.65, 0, 0.35, 1] },
          opacity: { duration: 0.2 },
        }}
      />
    </svg>
  );
}

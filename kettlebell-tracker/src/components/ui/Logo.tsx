import { motion } from 'framer-motion';

interface Props {
  size?: number;
  animate?: boolean;
  className?: string;
  /** Override the foreground color. Defaults to currentColor. */
  color?: string;
  /**
   * `solid` (default): filled circle + thick stroked arc.
   * `hairline`: 1.4px outlined circle + arc, fill `none`.
   */
  variant?: 'solid' | 'hairline';
  /** Render the arc with a dashed stroke (standby state on the calling card). */
  dashed?: boolean;
}

/**
 * PIDYOM mark — arc cradling a circle.
 * Two primitives: the load (circle) and the lift (open arc below).
 * Solid variant: arc draws first, then the circle scales in.
 * Hairline variant: only the arc draw-on (circle is stroked, not scaled).
 */
export default function Logo({
  size = 120,
  animate = true,
  className,
  color = 'currentColor',
  variant = 'solid',
  dashed = false,
}: Props) {
  const hairline = variant === 'hairline';
  const arcStrokeWidth = hairline ? 1.4 : 14;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PIDYOM"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <motion.path
        d="M 28 100 A 72 72 0 0 0 172 100"
        stroke={color}
        strokeWidth={arcStrokeWidth}
        strokeLinecap="butt"
        strokeDasharray={dashed ? '2 3' : undefined}
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animate ? { pathLength: { duration: 0.18, ease: 'linear' }, opacity: { duration: 0.06 } } : undefined}
      />
      {hairline ? (
        <circle
          cx={100}
          cy={100}
          r={46}
          fill="none"
          stroke={color}
          strokeWidth={1.4}
        />
      ) : (
        <motion.circle
          cx={100}
          cy={100}
          r={46}
          fill={color}
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 1 } : undefined}
          transition={animate ? { delay: 0.14, duration: 0.06, ease: 'linear' } : undefined}
        />
      )}
    </svg>
  );
}

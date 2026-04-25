import { motion } from 'framer-motion';

interface Props {
  size?: number;
  animate?: boolean;
  className?: string;
  /** Override the foreground color. Defaults to currentColor. */
  color?: string;
}

/**
 * PIDYOM mark — arc cradling a circle.
 * Two primitives: the load (filled circle) and the lift (open arc below).
 * The arc draws first, then the circle scales in: a single rising stroke.
 */
export default function Logo({ size = 120, animate = true, className, color = 'currentColor' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PIDYOM"
    >
      {/* Arc cradle — drawn first */}
      <motion.path
        d="M 28 100 A 72 72 0 0 0 172 100"
        stroke={color}
        strokeWidth={14}
        strokeLinecap="butt"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animate ? { pathLength: { duration: 0.9, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.2 } } : undefined}
      />
      {/* Circle — the load. Scales in after the arc. */}
      <motion.circle
        cx={100}
        cy={100}
        r={46}
        fill={color}
        initial={animate ? { scale: 0, opacity: 0 } : undefined}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={animate ? { delay: 0.65, duration: 0.4, ease: [0.34, 1.4, 0.64, 1] } : undefined}
        style={{ transformOrigin: '100px 100px' }}
      />
    </svg>
  );
}

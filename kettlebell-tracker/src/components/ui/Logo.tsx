import { motion } from 'framer-motion';

interface Props {
  size?: number;
  animate?: boolean;
}

export default function Logo({ size = 120, animate = true }: Props) {
  const variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.15, duration: 1.2, ease: 'easeInOut' as const },
        opacity: { delay: i * 0.15, duration: 0.3 },
      },
    }),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer diamond */}
      <motion.path
        d="M100 8 L192 100 L100 192 L8 100 Z"
        stroke="white" strokeWidth="1.2" fill="none"
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={0}
      />
      {/* Inner diamond */}
      <motion.path
        d="M100 38 L162 100 L100 162 L38 100 Z"
        stroke="white" strokeWidth="0.8" fill="none" opacity={0.4}
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={1}
      />
      {/* Kettlebell handle (small) */}
      <motion.path
        d="M100 52 C88 52 82 58 82 66 C82 72 86 76 92 78 L91 84 M100 52 C112 52 118 58 118 66 C118 72 114 76 108 78 L109 84"
        stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={2}
      />
      {/* Kettlebell body (big, wide) */}
      <motion.ellipse
        cx="100" cy="124" rx="34" ry="38"
        stroke="white" strokeWidth="1.5" fill="none"
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={3}
      />
      {/* Body top connection */}
      <motion.path
        d="M91 84 C80 88 66 100 66 124 M109 84 C120 88 134 100 134 124"
        stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={3}
      />
      {/* Center circle detail */}
      <motion.circle
        cx="100" cy="124" r="14"
        stroke="white" strokeWidth="0.8" fill="none" opacity={0.3}
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={4}
      />
      {/* Corner brackets */}
      <motion.path
        d="M24 24 L44 24 M24 24 L24 44 M176 24 L156 24 M176 24 L176 44 M24 176 L44 176 M24 176 L24 156 M176 176 L156 176 M176 176 L176 156"
        stroke="white" strokeWidth="0.4" opacity={0.15}
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={5}
      />
    </svg>
  );
}

import { motion } from 'framer-motion';

interface Props {
  size?: number;
  animate?: boolean;
  className?: string;
}

export default function Logo({ size = 120, animate = true, className }: Props) {
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer diamond */}
      <motion.path
        d="M100 8 L192 100 L100 192 L8 100 Z"
        stroke="white"
        strokeWidth="1.2"
        fill="none"
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={0}
      />

      {/* Inner diamond */}
      <motion.path
        d="M100 38 L162 100 L100 162 L38 100 Z"
        stroke="white"
        strokeWidth="0.8"
        fill="none"
        opacity={0.4}
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={1}
      />

      {/* --- UPSIDE DOWN KETTLEBELL --- */}

      {/* Bell */}
      <motion.path
        d="M70 98 
           C70 55 130 55 130 98 
           C130 130 70 130 70 98 Z"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={2}
      />

      {/* Handle outer */}
      <motion.path
        d="M80 120 C80 158 120 158 120 120"
        stroke="white"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={3}
      />

      {/* Handle inner */}
      <motion.path
        d="M90 120 C90 148 110 148 110 120"
        stroke="white"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        opacity={0.9}
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={4}
      />

      {/* Corner brackets */}
      <motion.path
        d="M24 24 L44 24 M24 24 L24 44 
           M176 24 L156 24 M176 24 L176 44 
           M24 176 L44 176 M24 176 L24 156 
           M176 176 L156 176 M176 176 L176 156"
        stroke="white"
        strokeWidth="0.4"
        opacity={0.15}
        variants={animate ? variants : undefined}
        initial={animate ? 'hidden' : undefined}
        animate={animate ? 'visible' : undefined}
        custom={5}
      />
    </svg>
  );
}

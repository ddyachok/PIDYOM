import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';

interface GlitchLine {
  id: number;
  top: number;
  width: number;
  left: number;
  height: number;
  delay: number;
}

export default function GlitchEffect() {
  const glitchActive = useStore(s => s.glitchActive);
  const [lines, setLines] = useState<GlitchLine[]>([]);

  useEffect(() => {
    if (glitchActive) {
      const newLines: GlitchLine[] = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        top: Math.random() * 100,
        width: 20 + Math.random() * 80,
        left: Math.random() * 40,
        height: 1 + Math.random() * 3,
        delay: Math.random() * 0.15,
      }));
      setLines(newLines);
      const timeout = setTimeout(() => setLines([]), 300);
      return () => clearTimeout(timeout);
    }
  }, [glitchActive]);

  return (
    <AnimatePresence>
      {lines.length > 0 && (
        <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
          {lines.map((line) => (
            <motion.div
              key={line.id}
              className="absolute bg-white/[0.06]"
              style={{
                top: `${line.top}%`,
                left: `${line.left}%`,
                width: `${line.width}%`,
                height: `${line.height}px`,
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: [0, 1, 0], scaleX: [0.3, 1, 0.5] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.15,
                delay: line.delay,
                ease: 'easeOut',
              }}
            />
          ))}
          {/* Screen flash (Watch Dogs cyan tint) */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.03, 0] }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

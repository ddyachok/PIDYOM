import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

interface Props {
  /** The target string. Revealed in discrete steps from the top edge. */
  text: string;
  /**
   * Reverse mode — when true, the visible text wipes off (top edge moves
   * down until nothing remains). Used for the dossier → home back-transition.
   */
  reverse?: boolean;
  /** Total reveal duration in ms. */
  duration?: number;
  /** Retained for API compatibility; ignored by the shutter wipe. */
  stagger?: number;
  /** Called once the reveal (or reverse) finishes. */
  onComplete?: () => void;
  className?: string;
  style?: CSSProperties;
}

// Discrete band count for the shutter wipe. 4 frames = noticeably mechanical
// without feeling laggy. Each frame holds for `duration / STEPS`.
const STEPS = 4;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Stepped clip-path reveal — text appears top-down in 4 hard bands.
// Replaces the earlier scramble effect; same API, more industrial.
export default function LetterScrambleReveal({
  text,
  reverse = false,
  duration = 160,
  onComplete,
  className,
  style,
}: Props) {
  const reduced = prefersReducedMotion();
  const [step, setStep] = useState<number>(reverse ? STEPS : 0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (reduced) {
      setStep(reverse ? 0 : STEPS);
      const id = window.setTimeout(() => onCompleteRef.current?.(), 120);
      return () => window.clearTimeout(id);
    }

    setStep(reverse ? STEPS : 0);
    const frameMs = Math.max(20, Math.round(duration / STEPS));
    let s = reverse ? STEPS : 0;
    const id = window.setInterval(() => {
      s += reverse ? -1 : 1;
      setStep(s);
      if (s <= 0 || s >= STEPS) {
        window.clearInterval(id);
        onCompleteRef.current?.();
      }
    }, frameMs);
    return () => window.clearInterval(id);
  }, [text, reverse, duration, reduced]);

  // Visibility fraction: 0 = fully clipped, 1 = fully visible.
  const visible = step / STEPS;
  // Clip from the bottom inward — top stays anchored, band grows downward.
  const clipBottom = (1 - visible) * 100;

  return (
    <span
      aria-label={text}
      className={className}
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
        fontVariantNumeric: 'tabular-nums',
        clipPath: `inset(0 0 ${clipBottom}% 0)`,
        WebkitClipPath: `inset(0 0 ${clipBottom}% 0)`,
        ...style,
      }}
    >
      {text}
    </span>
  );
}

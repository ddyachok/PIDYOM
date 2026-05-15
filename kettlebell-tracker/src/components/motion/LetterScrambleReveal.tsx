import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

interface Props {
  /** The target string. Each character is scrambled until it resolves. */
  text: string;
  /**
   * Reverse mode — when true, the visible target text scrambles back into
   * random characters and ends invisible. Used for the dossier → home
   * back-transition. Default false.
   */
  reverse?: boolean;
  /** Total reveal duration in ms. Defaults to `--duration-page`. */
  duration?: number;
  /** Stagger between characters in ms. Smaller = closer to a wave. */
  stagger?: number;
  /** Called once the reveal (or reverse) finishes. */
  onComplete?: () => void;
  /** className for layout positioning. */
  className?: string;
  /** style override. */
  style?: CSSProperties;
}

// Pull the alphabet from the target string itself so we never inject
// foreign glyphs (no Latin in a Cyrillic reveal, no surveillance hex).
// Whitespace and punctuation are preserved verbatim — they don't scramble.
const SCRAMBLE_PUNCTUATION = /[ \t\n\r·.\-/:,]/;

function classifyAlphabet(s: string): string {
  const set = new Set<string>();
  for (const ch of s) {
    if (SCRAMBLE_PUNCTUATION.test(ch)) continue;
    if (/\d/.test(ch)) {
      // numerals scramble within 0-9
      set.add('0123456789');
      continue;
    }
    if (/[A-Za-z]/.test(ch)) {
      set.add('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      continue;
    }
    if (/[А-Яа-яЇїІіЄєҐґ]/.test(ch)) {
      set.add('АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ');
      continue;
    }
    // unknown unicode: include the character itself
    set.add(ch.toUpperCase());
  }
  // Concatenate unique alphabets so reveals respect every script in the string.
  return [...set].join('');
}

function pickFromAlphabet(alphabet: string, original: string): string {
  if (SCRAMBLE_PUNCTUATION.test(original)) return original;
  if (!alphabet.length) return original;
  const i = Math.floor(Math.random() * alphabet.length);
  return alphabet[i];
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function LetterScrambleReveal({
  text,
  reverse = false,
  duration = 900,
  stagger = 25,
  onComplete,
  className,
  style,
}: Props) {
  const alphabet = classifyAlphabet(text);
  const reduced = prefersReducedMotion();

  // The string we render at this tick. Same length as `text`.
  const [frame, setFrame] = useState<string>(reverse ? text : '');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (reduced) {
      // Reduced-motion: skip scramble entirely, snap to the resolved state.
      setFrame(reverse ? '' : text);
      const id = window.setTimeout(() => onCompleteRef.current?.(), 120);
      return () => window.clearTimeout(id);
    }

    const start = performance.now();
    const total = duration;
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / total, 1);

      // Per-character resolution threshold. Char i resolves once we've
      // crossed the i*stagger mark relative to total.
      const out = Array.from(text).map((target, i) => {
        if (SCRAMBLE_PUNCTUATION.test(target)) return target;
        const charStart = (i * stagger) / total;
        const charEnd = charStart + 0.35; // each char animates over 35% of total

        if (reverse) {
          // Reverse: start showing target, fade into random, end invisible.
          if (t >= charEnd) return ' ';            // resolved → blank
          if (t >= charStart) return pickFromAlphabet(alphabet, target);
          return target;
        }
        // Forward: random first, settle to target.
        if (t >= charEnd) return target;            // resolved
        if (t >= charStart) return pickFromAlphabet(alphabet, target);
        return ' ';                                 // not started yet
      });
      setFrame(out.join(''));

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
      else {
        setFrame(reverse ? '' : text);
        onCompleteRef.current?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // We re-run when `text` or `reverse` changes — but not when `duration`
    // / `stagger` change mid-flight (would make the math jagged).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reverse, reduced]);

  return (
    <span
      aria-label={text}
      className={className}
      style={{
        whiteSpace: 'pre',
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {frame}
    </span>
  );
}

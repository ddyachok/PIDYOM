import type { CSSProperties } from 'react';

type WordmarkSize = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  /** Visual size — `xl` is the calling-card hero. */
  size?: WordmarkSize;
  /** Optional className for layout positioning. */
  className?: string;
  /** Optional inline style override. */
  style?: CSSProperties;
  /** Force a specific colour (otherwise resolves to `--ink`). */
  color?: string;
  /** Override the rendered text (defaults to brand wordmark from i18n). */
  text?: string;
}

const sizes: Record<WordmarkSize, { font: string; tracking: string }> = {
  sm: { font: '12px',                                         tracking: 'var(--tracking-widest)' },
  md: { font: '18px',                                         tracking: 'var(--tracking-widest)' },
  lg: { font: '32px',                                         tracking: 'var(--tracking-wider)'  },
  xl: { font: 'clamp(48px, 9vw, 96px)',                       tracking: 'var(--tracking-wider)'  },
};

export default function Wordmark({ size = 'md', className, style, color, text }: Props) {
  // The brand wordmark is always Latin `PIDYOM` across every locale.
  const label = text ?? 'PIDYOM';
  const dim = sizes[size];

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: dim.font,
        letterSpacing: dim.tracking,
        textTransform: 'uppercase',
        color: color ?? 'var(--ink)',
        lineHeight: 1,
        display: 'inline-block',
        ...style,
      }}
    >
      {label}
    </span>
  );
}

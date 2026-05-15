import type { CSSProperties } from 'react';
import { format } from 'date-fns';
import LetterScrambleReveal from '../motion/LetterScrambleReveal';

interface Props {
  /** Source date — typically `session.startsAt` parsed to Date. */
  date: Date;
  /** Optional CSS for the wrapper. */
  style?: CSSProperties;
  /** Optional className for layout positioning. */
  className?: string;
  /** Override the colour (defaults to `--ink`). */
  color?: string;
  /**
   * Format strategy.
   *  - `dd.MM` — numeric (default). 29.04
   *  - `dd.MMM` — alpha month. 29.APR
   * Both render the dot separator in `--ink`, never as a coloured accent.
   */
  monthDisplay?: 'numeric' | 'alpha';
  /**
   * When true, the day + month parts animate in via LetterScrambleReveal.
   * Used by the dossier on first mount after the home-card tap.
   */
  animateIn?: boolean;
}

// The dossier hero — Source Serif 4 Black at the upper end of the optical
// size axis. Set as tight as the fonthinting allows so the editorial
// gravity reads at every viewport. Replaces the legacy Barlow Condensed
// 900 dossier date.
export default function MassiveDate({
  date,
  style,
  className,
  color,
  monthDisplay = 'alpha',
  animateIn = false,
}: Props) {
  const dayPart = format(date, 'dd');
  const monthPart =
    monthDisplay === 'numeric'
      ? format(date, 'MM')
      : format(date, 'MMM').toUpperCase();

  const dayNode = animateIn
    ? <LetterScrambleReveal text={dayPart} duration={700} stagger={40} />
    : <span>{dayPart}</span>;

  const monthNode = animateIn
    ? <LetterScrambleReveal text={monthPart} duration={900} stagger={50} />
    : <span>{monthPart}</span>;

  return (
    <div
      className={className}
      role="text"
      aria-label={format(date, 'dd LLLL yyyy')}
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--weight-black)',
        fontSize: 'var(--text-massive-date)',
        lineHeight: 'var(--leading-display)',
        letterSpacing: 'var(--tracking-display)',
        fontVariationSettings: '"opsz" 60',
        color: color ?? 'var(--ink)',
        textTransform: 'uppercase',
        fontVariantNumeric: 'tabular-nums',
        marginBlock: 0,
        ...style,
      }}
    >
      {dayNode}
      <span aria-hidden style={{ display: 'inline-block', margin: '0 0.05em' }}>.</span>
      {monthNode}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import Wordmark from '../brand/Wordmark';
import CoordStamp from '../brand/CoordStamp';
import LetterScrambleReveal from '../motion/LetterScrambleReveal';
import type { PidyomSession } from '../../data/pidyomSessions';

interface Props {
  /** The next session — null/undefined puts the card into standby. */
  session: PidyomSession | null;
  /** Tap handler. Ignored when in standby. */
  onTap?: () => void;
  /** Optional style override for the outermost container. */
  style?: CSSProperties;
}

// Pulls the lat/lng pair out of strings like "50.4439°N · 30.5108°E".
function parseCoords(coords: string): { lat: number; lng: number } | null {
  const match = coords.match(/(-?\d+(?:\.\d+)?)[°\s]*([NS])\s*[·,]?\s*(-?\d+(?:\.\d+)?)[°\s]*([EW])/i);
  if (!match) return null;
  const lat = parseFloat(match[1]) * (match[2].toUpperCase() === 'S' ? -1 : 1);
  const lng = parseFloat(match[3]) * (match[4].toUpperCase() === 'W' ? -1 : 1);
  return { lat, lng };
}

export default function CallingCard({ session, onTap, style }: Props) {
  const { t } = useTranslation();
  const standby = !session;
  const parsed = session ? parseCoords(session.coords) : null;
  const time = session ? format(new Date(session.startsAt), 'HH:mm') : null;

  // Outbound transition state. Tap → exiting=true → effect schedules nav after dissolve.
  const [exiting, setExiting] = useState(false);
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  useEffect(() => {
    if (!exiting) return;
    const id = window.setTimeout(() => onTapRef.current?.(), 720);
    return () => window.clearTimeout(id);
  }, [exiting]);

  const ariaLabel = standby
    ? t('brand.wordmark')
    : t('home.tap_hint', {
        date: session ? format(new Date(session.startsAt), 'EEEE · dd LLL') : '',
        location: session?.locationName ?? '',
        time: time ?? '',
      });

  const handleClick = () => {
    if (standby || exiting) return;
    setExiting(true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-disabled={standby || undefined}
      tabIndex={standby ? -1 : 0}
      style={{
        // Full-viewport centred surface; resets default <button> styling.
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        background: 'var(--bg-primary)',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-6)',
        padding: 'var(--space-8) var(--rail-mobile)',
        border: 'none',
        cursor: standby ? 'default' : 'pointer',
        // No hover/press feedback in standby — strict silence.
        textAlign: 'center',
        font: 'inherit',
        ...style,
      }}
      data-pidyom-callingcard
      data-standby={standby || undefined}
    >
      {exiting ? (
        // Outbound: wordmark dissolves into random Cyrillic, then disappears.
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 'clamp(48px, 9vw, 96px)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            lineHeight: 1,
          }}
        >
          <LetterScrambleReveal text={t('brand.wordmark')} reverse duration={700} stagger={28} />
        </span>
      ) : (
        <Wordmark size="xl" />
      )}

      {standby || !parsed || !time ? (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--text-mono-cap)',
          }}
        >
          {t('home.standby')}
        </span>
      ) : exiting ? (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--text-mono-cap)',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          <LetterScrambleReveal
            text={`${parsed.lat.toFixed(4)}°N · ${parsed.lng.toFixed(4)}°E · ${time}`}
            reverse
            duration={700}
            stagger={16}
          />
        </span>
      ) : (
        <CoordStamp lat={parsed.lat} lng={parsed.lng} time={time} />
      )}
    </button>
  );
}

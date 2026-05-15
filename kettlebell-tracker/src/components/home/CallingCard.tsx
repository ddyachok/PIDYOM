import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '../ui/Logo';
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

function useIsDesktop(breakpoint = 768): boolean {
  const [isDesktop, set] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth >= breakpoint,
  );
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => set(e.matches);
    set(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);
  return isDesktop;
}

// Short "002" style session id for the corner stamp. Falls back to the
// last 3 chars of the session id if it doesn't already encode a number.
function shortId(id: string | null): string {
  if (!id) return '—';
  const m = id.match(/(\d{1,4})/);
  return m ? m[1].padStart(3, '0') : id.slice(-3).toUpperCase();
}

export default function CallingCard({ session, onTap, style }: Props) {
  const { t } = useTranslation();
  const standby = !session;
  const isDesktop = useIsDesktop();
  const parsed = session ? parseCoords(session.coords) : null;
  const date = session ? new Date(session.startsAt) : null;
  const dateLabel = date ? format(date, 'EEE · dd LLL').toUpperCase() : null;
  const time = date ? format(date, 'HH:mm') : null;

  const [exiting, setExiting] = useState(false);
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  useEffect(() => {
    if (!exiting) return;
    const id = window.setTimeout(() => onTapRef.current?.(), 720);
    return () => window.clearTimeout(id);
  }, [exiting]);

  const ariaLabel = standby
    ? 'PIDYOM'
    : t('home.tap_hint', {
        date: date ? format(date, 'EEEE · dd LLL') : '',
        location: session?.locationName ?? '',
        time: time ?? '',
      });

  const handleClick = () => {
    if (standby || exiting) return;
    setExiting(true);
  };

  const cornerInset = isDesktop ? 48 : 24;
  const tagSize = isDesktop ? 12 : 10;
  const markSize = isDesktop ? 320 : 144;
  const dateSize = isDesktop ? 14 : 11;
  const taglineSize = isDesktop ? 11 : 9;
  const dateMinWidth = isDesktop ? 360 : 220;
  const centerGap = isDesktop ? 40 : 28;
  const monoCorner: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    fontSize: tagSize,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--stone-500)',
    lineHeight: 1.1,
  };

  const latShort = parsed ? `${parsed.lat.toFixed(4)}°N` : '—';
  const lngShort = parsed ? `${parsed.lng.toFixed(4)}°E` : '—';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-disabled={standby || undefined}
      tabIndex={standby ? -1 : 0}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        background: 'var(--bg-primary)',
        color: 'var(--ink)',
        border: 'none',
        cursor: standby ? 'default' : 'pointer',
        font: 'inherit',
        textAlign: 'center',
        padding: 0,
        ...style,
      }}
      data-pidyom-callingcard
      data-standby={standby || undefined}
    >
      {/* Four corner stamps */}
      <span style={{ ...monoCorner, position: 'absolute', top: cornerInset, left: cornerInset }}>
        PIDYOM · {shortId(session?.id ?? null)}
      </span>
      <span style={{ ...monoCorner, position: 'absolute', top: cornerInset, right: cornerInset }}>
        {latShort}
      </span>
      <span style={{ ...monoCorner, position: 'absolute', bottom: cornerInset, left: cornerInset }}>
        {standby ? t('home.standby') : '↑ TAP TO OPEN'}
      </span>
      <span style={{ ...monoCorner, position: 'absolute', bottom: cornerInset, right: cornerInset }}>
        {lngShort}
      </span>

      {/* Rotated side annotations — desktop only */}
      {isDesktop && (
        <>
          <span
            style={{
              ...monoCorner,
              letterSpacing: '0.32em',
              position: 'absolute',
              top: '50%',
              left: cornerInset,
              transform: 'translateY(-50%) rotate(-90deg)',
              transformOrigin: 'left center',
              whiteSpace: 'nowrap',
            }}
          >
            DOC-002 · REV 03 · FIELD MANUAL
          </span>
          <span
            style={{
              ...monoCorner,
              letterSpacing: '0.32em',
              position: 'absolute',
              top: '50%',
              right: cornerInset,
              transform: 'translateY(-50%) rotate(90deg)',
              transformOrigin: 'right center',
              whiteSpace: 'nowrap',
            }}
          >
            EST. 2025 · KYIV · PIDYOM.COM
          </span>
        </>
      )}

      {/* Vertical centre stack */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: centerGap,
          padding: isDesktop ? '96px' : '48px',
        }}
      >
        <Logo size={markSize} dashed={standby} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isDesktop ? 12 : 8,
          }}
        >
          {exiting ? (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: isDesktop ? 88 : 40,
                letterSpacing: isDesktop ? '0.22em' : '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                lineHeight: 1,
              }}
            >
              <LetterScrambleReveal text="PIDYOM" reverse duration={700} stagger={28} />
            </span>
          ) : (
            <Wordmark
              size={isDesktop ? 'xl' : 'lg'}
              style={{
                fontSize: isDesktop ? 88 : 40,
                letterSpacing: isDesktop ? '0.22em' : '0.18em',
              }}
            />
          )}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: taglineSize,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'var(--stone-500)',
              lineHeight: 1.1,
            }}
          >
            — Pick up · Rise —
          </span>
        </div>

        {/* Date + coords block — hidden in standby */}
        {!standby && parsed && dateLabel && time && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              paddingTop: isDesktop ? 18 : 14,
              borderTop: '1px solid var(--ink-22)',
              minWidth: dateMinWidth,
            }}
          >
            {exiting ? (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: dateSize,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}
              >
                <LetterScrambleReveal
                  text={`${dateLabel} · ${time}`}
                  reverse
                  duration={700}
                  stagger={16}
                />
              </span>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: dateSize,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}
              >
                {dateLabel} · {time}
              </span>
            )}
            <CoordStamp
              lat={parsed.lat}
              lng={parsed.lng}
              size={dateSize - 1}
              color="var(--stone-500)"
            />
          </div>
        )}
      </div>
    </button>
  );
}

import { useEffect, useRef, useState } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../ui/Logo';
import CoordStamp from '../brand/CoordStamp';
import MassiveDate from './MassiveDate';
import LetterScrambleReveal from '../motion/LetterScrambleReveal';
import LocationMap from './LocationMap';
import { ArcDivider, TimeToLift } from '../ui/ArcPrimitives';
import type { PidyomSession } from '../../data/pidyomSessions';

interface Props {
  session: PidyomSession;
}

function parseCoords(coords: string): { lat: number; lng: number } | null {
  const m = coords.match(/(-?\d+(?:\.\d+)?)[°\s]*([NS])\s*[·,]?\s*(-?\d+(?:\.\d+)?)[°\s]*([EW])/i);
  if (!m) return null;
  return {
    lat: parseFloat(m[1]) * (m[2].toUpperCase() === 'S' ? -1 : 1),
    lng: parseFloat(m[3]) * (m[4].toUpperCase() === 'W' ? -1 : 1),
  };
}

function shortId(id: string): string {
  const m = id.match(/(\d{1,4})/);
  return m ? m[1].padStart(3, '0') : id.slice(-3).toUpperCase();
}

// `pct`: 1 = at session start, 0 = ≥5 days out.
function timeToLiftPct(startsAt: Date): { pct: number; label: string } {
  const minutes = differenceInMinutes(startsAt, new Date());
  const windowMin = 5 * 24 * 60; // 7200
  const pct = Math.max(0, Math.min(1, 1 - minutes / windowMin));
  // Compact "IN 2D 4H" / "IN 45M" label.
  const absMin = Math.max(0, minutes);
  const days = Math.floor(absMin / (24 * 60));
  const hours = Math.floor((absMin % (24 * 60)) / 60);
  const mins = absMin % 60;
  let label: string;
  if (minutes <= 0) label = 'NOW';
  else if (days > 0) label = `${days}D ${hours}H`;
  else if (hours > 0) label = `${hours}H ${mins}M`;
  else label = `${mins}M`;
  return { pct, label };
}

const monoCap = (size = 9): React.CSSProperties => ({
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
  fontSize: size,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: 'var(--stone-500)',
  lineHeight: 1.1,
});

export default function DossierHero({ session }: Props) {
  const { t } = useTranslation();
  const date = new Date(session.startsAt);
  const parsed = parseCoords(session.coords);
  const { pct, label: liftLabel } = timeToLiftPct(date);

  const playedFor = useRef<string | null>(null);
  const [animateIn, setAnimateIn] = useState(true);
  useEffect(() => {
    if (playedFor.current === session.id) return;
    playedFor.current = session.id;
    setAnimateIn(true);
    const id = window.setTimeout(() => setAnimateIn(false), 260);
    return () => window.clearTimeout(id);
  }, [session.id]);

  return (
    <header style={{ marginBottom: 'var(--space-12)' }}>
      {/* Top stripe — hairline mark + DOSSIER · NNN left, ↑ HOME right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={18} variant="hairline" animate={false} />
          <span style={monoCap(10)}>
            {t('dossier.title')} · {shortId(session.id)}
          </span>
        </div>
        <Link
          to="/"
          style={{
            ...monoCap(10),
            textDecoration: 'none',
          }}
        >
          {t('dossier.back_home')}
        </Link>
      </div>

      {/* Time-to-lift row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '12px 0',
          borderTop: '1px solid var(--ink-15)',
          borderBottom: '1px solid var(--ink-15)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <span style={monoCap(9)}>IN</span>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontVariationSettings: '"opsz" 32',
              fontWeight: 700,
              fontSize: 30,
              lineHeight: 1,
              letterSpacing: '-0.01em',
              marginTop: 4,
              color: 'var(--ink)',
            }}
          >
            {liftLabel}
          </div>
        </div>
        <TimeToLift pct={pct} width={132} />
      </div>

      {/* MassiveDate */}
      <MassiveDate date={date} monthDisplay="alpha" animateIn={animateIn} />

      {/* Time + duration / location-kind */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-bold)',
            fontSize: 'clamp(36px, 7vw, 72px)',
            lineHeight: 1,
            letterSpacing: 'var(--tracking-tight)',
            fontVariantNumeric: 'tabular-nums',
            fontVariationSettings: '"opsz" 32',
            color: 'var(--ink)',
          }}
        >
          {format(date, 'HH:mm')}
        </span>
        <span style={monoCap(9)}>
          {t('dossier.duration_min', { n: session.durationMin })} · {session.locationKind}
        </span>
      </div>

      <ArcDivider />

      {/* Location block */}
      <section style={{ paddingBlock: 'var(--space-5)' }}>
        <div style={{ ...monoCap(9), marginBottom: 'var(--space-2)' }}>
          {t('dossier.location')}
        </div>
        {session.mapUrl ? (
          <a
            href={session.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontVariationSettings: '"opsz" 32',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-md)',
                lineHeight: 'var(--leading-snug)',
                color: 'var(--ink)',
              }}
            >
              {animateIn
                ? <LetterScrambleReveal text={session.locationName} duration={200} />
                : session.locationName}
            </span>
            <span
              aria-hidden
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-mono-cap)',
                flexShrink: 0,
              }}
            >
              ↗
            </span>
          </a>
        ) : (
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontVariationSettings: '"opsz" 32',
              fontWeight: 'var(--weight-semibold)',
              fontSize: 'var(--text-md)',
              lineHeight: 'var(--leading-snug)',
              color: 'var(--ink)',
            }}
          >
            {animateIn
              ? <LetterScrambleReveal text={session.locationName} duration={200} />
              : session.locationName}
          </div>
        )}
        {parsed && (
          <div style={{ marginTop: 'var(--space-2)' }}>
            <CoordStamp lat={parsed.lat} lng={parsed.lng} />
          </div>
        )}

        {parsed && (
          <div style={{ marginTop: 'var(--space-5)' }}>
            <LocationMap lat={parsed.lat} lng={parsed.lng} mapUrl={session.mapUrl} />
          </div>
        )}
      </section>
    </header>
  );
}

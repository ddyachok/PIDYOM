import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import CoordStamp from '../brand/CoordStamp';
import MassiveDate from './MassiveDate';
import LetterScrambleReveal from '../motion/LetterScrambleReveal';
import LocationMap from './LocationMap';
import type { PidyomSession } from '../../data/pidyomSessions';

interface Props {
  session: PidyomSession;
}

// Pull "50.4439°N · 30.5108°E" → numeric pair for CoordStamp.
function parseCoords(coords: string): { lat: number; lng: number } | null {
  const m = coords.match(/(-?\d+(?:\.\d+)?)[°\s]*([NS])\s*[·,]?\s*(-?\d+(?:\.\d+)?)[°\s]*([EW])/i);
  if (!m) return null;
  return {
    lat: parseFloat(m[1]) * (m[2].toUpperCase() === 'S' ? -1 : 1),
    lng: parseFloat(m[3]) * (m[4].toUpperCase() === 'W' ? -1 : 1),
  };
}

// Dossier hero — three blocks separated by hairline rules:
//   1. MassiveDate (Source Serif 4 Black, opsz 60)
//   2. Time + duration meta line
//   3. Location name + coords
//
// Replaces the inline implementation in DossierPage (C3 placeholder).
export default function DossierHero({ session }: Props) {
  const { t } = useTranslation();
  const date = new Date(session.startsAt);
  const parsed = parseCoords(session.coords);

  // Play the letter-scramble reveal once per session arrival.
  // The flag is keyed to session id so navigating to a different dossier
  // re-plays it; navigating away and back to the same one within the same
  // mount does not.
  const playedFor = useRef<string | null>(null);
  const [animateIn, setAnimateIn] = useState(true);
  useEffect(() => {
    if (playedFor.current === session.id) return;
    playedFor.current = session.id;
    setAnimateIn(true);
    const id = window.setTimeout(() => setAnimateIn(false), 1200);
    return () => window.clearTimeout(id);
  }, [session.id]);

  return (
    <header style={{ marginBottom: 'var(--space-12)' }}>
      {/* 1 · MassiveDate — the editorial gesture, scrambled in on arrival */}
      <MassiveDate date={date} monthDisplay="alpha" animateIn={animateIn} />

      {/* 2 · Time + duration / location-kind */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
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
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--text-mono-cap)',
          }}
        >
          {t('dossier.duration_min', { n: session.durationMin })} · {session.locationKind}
        </span>
      </div>

      {/* 3 · Location name + coords — bracketed by hairline rules */}
      <section
        style={{
          borderTop: '1px solid var(--rule-default)',
          borderBottom: '1px solid var(--rule-default)',
          paddingBlock: 'var(--space-5)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--text-mono-cap)',
            marginBottom: 'var(--space-2)',
          }}
        >
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
                ? <LetterScrambleReveal text={session.locationName} duration={950} stagger={18} />
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
              ? <LetterScrambleReveal text={session.locationName} duration={950} stagger={18} />
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

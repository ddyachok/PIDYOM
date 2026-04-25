import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { AsemicStroke } from '../components/ui/ArcPrimitives';
import Logo from '../components/ui/Logo';
import { useStore } from '../store/useStore';
import { NEXT_PIDYOM_SESSION, formatSessionDate } from '../data/pidyomSessions';
import { format, formatDistanceToNowStrict } from 'date-fns';

const INTRO_SHOWN_KEY = 'pidyom-intro-shown';

type RsvpState = 'going' | 'maybe' | 'declined' | null;

export default function HomePage() {
  const setCurrentTab = useStore(s => s.setCurrentTab);
  const theme = useStore(s => s.theme);
  const isLight = theme === 'light';

  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem(INTRO_SHOWN_KEY));
  const [introPhase, setIntroPhase] = useState(0);
  const [rsvp, setRsvp] = useState<RsvpState>(null);

  useEffect(() => {
    if (!showIntro) return;
    const timers = [
      setTimeout(() => setIntroPhase(1), 200),
      setTimeout(() => setIntroPhase(2), 1500),
      setTimeout(() => {
        sessionStorage.setItem(INTRO_SHOWN_KEY, '1');
        setShowIntro(false);
      }, 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showIntro]);

  const session = NEXT_PIDYOM_SESSION;
  const f = formatSessionDate(session.startsAt);
  const countdown = formatDistanceToNowStrict(new Date(session.startsAt), { addSuffix: false });

  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <motion.div
          key="intro"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: isLight ? '#D5D5CD' : '#0D0D0D' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Asemic ПІДЙОМ — single brushstroke. */}
          {introPhase >= 1 && (
            <div style={{ color: isLight ? '#0A0A0A' : '#E8E8E1' }}>
              <AsemicStroke size={240} duration={1.2} />
            </div>
          )}
          {introPhase >= 2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase', color: isLight ? '#6A6A62' : '#9A9A90', marginTop: -8 }}
            >
              ПІДЙОМ — Pick up · Rise
            </motion.p>
          )}
        </motion.div>
      ) : (
        <PageTransition key="home" className="page">
          {/* Top stripe — coord stamp + date */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="flex items-center justify-between mb-12 md:mb-16"
            style={{ borderBottom: '1px solid var(--c-fg-12)', paddingBottom: 12 }}
          >
            <div className="coord-stamp" style={{ fontSize: 9 }}>FIELD NOTES // NEXT LIFT</div>
            <div style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--c-fg-45)', textTransform: 'uppercase', fontVariantNumeric: 'tabular-nums' }}>
              {format(new Date(), 'dd.MM.yyyy')} · REV 02
            </div>
          </motion.div>

          {/* THE FLYER — marquee */}
          <div style={{ position: 'relative', minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Watermark mark — bottom right, subtle */}
            <div style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.06, pointerEvents: 'none', color: 'var(--c-fg)' }}>
              <Logo size={360} animate={false} />
            </div>

            {/* Weekday + asemic accent above date */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-3 mb-2"
            >
              <span style={{ fontSize: 11, letterSpacing: '0.32em', color: 'var(--c-accent)', textTransform: 'uppercase', fontWeight: 700, padding: '2px 6px', background: 'rgba(198,255,0,0.10)' }}>
                {f.weekday}
              </span>
              <span style={{ height: 1, width: 64, background: 'var(--c-accent)' }} />
              <span style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--c-fg-45)', textTransform: 'uppercase', fontVariantNumeric: 'tabular-nums' }}>
                IN {countdown}
              </span>
            </motion.div>

            {/* Massive date */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                lineHeight: 0.82,
                letterSpacing: '-0.035em',
                textTransform: 'uppercase',
                color: 'var(--c-fg)',
                fontSize: 'clamp(96px, 18vw, 220px)',
                marginBottom: 8,
              }}
            >
              {f.day}<span style={{ color: 'var(--c-accent)' }}>.</span>{f.month}
            </motion.div>

            {/* Time + duration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-baseline gap-4 mb-10 md:mb-12"
            >
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(48px, 8vw, 88px)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: 'var(--c-fg)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {f.time}
              </span>
              <span style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--c-fg-45)', textTransform: 'uppercase' }}>
                {session.durationMin} min · {session.locationKind}
              </span>
            </motion.div>

            {/* Location — clickable lead */}
            <motion.a
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              href={session.mapUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              style={{
                borderTop: '1px solid var(--c-fg-15)',
                borderBottom: '1px solid var(--c-fg-15)',
                padding: '20px 0',
                marginBottom: 24,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--c-fg-45)', textTransform: 'uppercase', marginBottom: 6 }}>
                Location
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 'clamp(22px, 3vw, 32px)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.005em',
                    textTransform: 'uppercase',
                    color: 'var(--c-fg)',
                  }}
                >
                  {session.locationName}
                </div>
                <span style={{ fontSize: 14, color: 'var(--c-accent)', flexShrink: 0 }}>↗</span>
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--c-fg-45)', textTransform: 'uppercase', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
                {session.coords}
              </div>
            </motion.a>

            {/* Focus + bring */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
            >
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--c-fg-45)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Focus
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--c-fg)' }}>{session.focus}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--c-fg-45)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Bring
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.bring.map(b => (
                    <span key={b} className="pill pill--ghost" style={{ fontSize: 9 }}>{b}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* RSVP — three-way */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--c-fg-45)', textTransform: 'uppercase' }}>
                  RSVP
                </span>
                <span style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--c-fg-45)', textTransform: 'uppercase', fontVariantNumeric: 'tabular-nums' }}>
                  {session.rsvpCount + (rsvp === 'going' ? 1 : 0)} / {session.capacity} GOING
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['going', 'maybe', 'declined'] as const).map((s) => {
                  const isOn = rsvp === s;
                  const cls = s === 'going' ? (isOn ? 'btn btn-acid' : 'btn btn-outline')
                    : s === 'maybe' ? (isOn ? 'btn btn-solid' : 'btn btn-outline')
                    : (isOn ? 'btn btn-danger' : 'btn btn-outline');
                  const label = s === 'going' ? "I'M GOING" : s === 'maybe' ? 'MAYBE' : "CAN'T MAKE IT";
                  return (
                    <button
                      key={s}
                      onClick={() => setRsvp(prev => prev === s ? null : s)}
                      className={cls}
                      style={{ fontSize: 10, letterSpacing: '0.14em' }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Coach note — small, last */}
            {session.coachNote && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{
                  borderLeft: '2px solid var(--c-accent)',
                  paddingLeft: 14,
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: 'var(--c-fg-60)',
                  maxWidth: '60ch',
                }}
              >
                <div style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--c-fg-45)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Coach note
                </div>
                {session.coachNote}
              </motion.div>
            )}

            {/* Secondary lane — solo training */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="flex items-center justify-between mt-12 pt-6"
              style={{ borderTop: '1px solid var(--c-fg-12)' }}
            >
              <span style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--c-fg-45)', textTransform: 'uppercase' }}>
                Solo lift today?
              </span>
              <button
                onClick={() => setCurrentTab('workouts')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 10, letterSpacing: '0.14em' }}
              >
                OPEN TRAIN →
              </button>
            </motion.div>
          </div>
        </PageTransition>
      )}
    </AnimatePresence>
  );
}

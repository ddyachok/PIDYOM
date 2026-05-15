import { motion } from 'framer-motion';
import PageTransition from '../components/ui/PageTransition';
import { useStore } from '../store/useStore';
import { NEXT_PIDYOM_SESSION, PAST_PIDYOM_SESSIONS, formatSessionDate } from '../data/pidyomSessions';

export default function ClubPage() {
  const setCurrentTab = useStore(s => s.setCurrentTab);
  const next = formatSessionDate(NEXT_PIDYOM_SESSION.startsAt);

  return (
    <PageTransition className="page">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="coord-stamp mb-3">CLUB // PIDYOM SESSIONS</div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>The Club</h1>
        </div>
        <span className="pill pill--acid">{NEXT_PIDYOM_SESSION.rsvpCount}/{NEXT_PIDYOM_SESSION.capacity} GOING</span>
      </div>

      {/* Upcoming */}
      <div className="mb-10">
        <span className="section-tag mb-4">Next session</span>
        <motion.button
          onClick={() => setCurrentTab('home')}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-interactive w-full text-left"
          style={{ display: 'grid', gridTemplateColumns: '88px 1fr auto', gap: 20, alignItems: 'center', cursor: 'pointer' }}
        >
          <div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 56, lineHeight: 0.85, letterSpacing: '-0.02em' }}>
              {next.day}
            </div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--c-fg-45)', marginTop: 2 }}>
              {next.month}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.005em', marginBottom: 4 }}>
              {NEXT_PIDYOM_SESSION.focus}
            </div>
            <div style={{ fontSize: 11, color: 'var(--c-fg-60)' }}>
              {next.weekday} · {next.time} · {NEXT_PIDYOM_SESSION.locationName}
            </div>
          </div>
          <span style={{ fontSize: 18, color: 'var(--c-acid-text)' }}>→</span>
        </motion.button>
      </div>

      {/* Past */}
      <div>
        <span className="section-tag mb-4">Archive</span>
        <div>
          {PAST_PIDYOM_SESSIONS.map((s, i) => {
            const f = formatSessionDate(s.startsAt);
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="ex-row"
              >
                <span style={{ fontSize: 9, color: 'var(--c-fg-45)', width: 28, fontVariantNumeric: 'tabular-nums' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="status-dot status-dot--done" />
                <span style={{ fontSize: 13, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.01em', flex: 1 }}>
                  {s.focus}
                </span>
                <span className="dot-leader hidden md:block" />
                <span style={{ fontSize: 10, color: 'var(--c-fg-45)', fontVariantNumeric: 'tabular-nums' }}>
                  {f.full}
                </span>
                <span style={{ fontSize: 9, color: 'var(--c-fg-45)' }}>
                  {s.rsvpCount} attended
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="divider" />

      <div style={{ fontSize: 11, color: 'var(--c-fg-45)', lineHeight: 1.6, maxWidth: '60ch' }}>
        Past session detail (roster, photos, the workout itself) lands in the next iteration. Sessions are still mocked locally — Hasura wiring follows.
      </div>
    </PageTransition>
  );
}

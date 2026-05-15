import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import DossierHero from '../components/dossier/DossierHero';
import Focus from '../components/dossier/Focus';
import BringPills from '../components/dossier/BringPills';
import CoachNote from '../components/dossier/CoachNote';
import RsvpControl from '../components/dossier/RsvpControl';
import { ArcDivider } from '../components/ui/ArcPrimitives';
import { getSessionById } from '../data/pidyomSessions';

function shortId(id: string): string {
  const m = id.match(/(\d{1,4})/);
  return m ? m[1].padStart(3, '0') : id.slice(-3).toUpperCase();
}

function useIsWide(breakpoint = 1200): boolean {
  const [w, set] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth >= breakpoint,
  );
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => set(e.matches);
    set(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);
  return w;
}

export default function DossierPage() {
  const { id } = useParams<{ id: string }>();
  const session = id ? getSessionById(id) : null;
  const isWide = useIsWide();

  if (!session) return <Navigate to="/" replace />;

  const isPast = session.status === 'completed';
  const date = new Date(session.startsAt);
  const coords = session.coords;
  const docId = shortId(session.id);

  const mainContent = (
    <>
      <DossierHero session={session} />

      <section style={{ display: 'grid', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <Focus text={session.focus} />
        <BringPills items={session.bring} />
        <CoachNote text={session.coachNote} />
      </section>

      <ArcDivider />

      {!isPast && (
        <section style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
          <RsvpControl session={session} />
        </section>
      )}
    </>
  );

  return (
    <main
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--ink)',
        minHeight: '100dvh',
        position: 'relative',
        paddingBottom: isWide ? 80 : 'var(--space-16)',
      }}
    >
      {isWide ? (
        <>
          {/* Desktop full-bleed top stripe */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              padding: '24px 48px',
              borderBottom: '1px solid var(--ink-22)',
              gap: 24,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--stone-500)',
              }}
            >
              DOSSIER · {docId} · {format(date, 'dd.MM.yyyy')}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--stone-500)',
                textAlign: 'center',
              }}
            >
              SESSION FILE · KYIV · {session.locationKind.toUpperCase()}
            </span>
            <a
              href="/"
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--stone-500)',
                textDecoration: 'none',
                textAlign: 'right',
              }}
            >
              ↑ HOME
            </a>
          </div>

          {/* Two-column body */}
          <div
            style={{
              maxWidth: 1080,
              margin: '0 auto',
              padding: '48px',
            }}
          >
            {mainContent}
          </div>

          {/* Footer stripe */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              padding: '20px 48px',
              borderTop: '1px solid var(--ink-22)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--stone-500)',
            }}
          >
            <span>PIDYOM · DOSSIER · {docId}</span>
            <span>— Pick up · Rise —</span>
            <span>{coords}</span>
          </div>
        </>
      ) : (
        <div
          style={{
            padding: 'var(--space-6) var(--rail-mobile) var(--space-16)',
            maxWidth: 'var(--max-content)',
            margin: '0 auto',
          }}
        >
          {mainContent}
        </div>
      )}
    </main>
  );
}

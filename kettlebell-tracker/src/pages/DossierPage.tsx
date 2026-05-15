import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DossierHero from '../components/dossier/DossierHero';
import Focus from '../components/dossier/Focus';
import BringPills from '../components/dossier/BringPills';
import CoachNote from '../components/dossier/CoachNote';
import RsvpControl from '../components/dossier/RsvpControl';
import { getSessionById } from '../data/pidyomSessions';

export default function DossierPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const session = id ? getSessionById(id) : null;

  // Unknown id → bounce home. (Public past dossiers will get a 404 page in
  // a later brief; today the only callers are internal links.)
  if (!session) return <Navigate to="/" replace />;

  const isPast = session.status === 'completed';

  return (
    <main
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--ink)',
        minHeight: '100dvh',
        padding: 'var(--space-6) var(--rail-mobile) var(--space-16)',
        maxWidth: 'var(--max-content)',
        margin: '0 auto',
      }}
    >
      {/* Top stripe — back affordance */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-8)' }}>
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--text-mono-cap)',
            textDecoration: 'none',
          }}
        >
          {t('dossier.back_home')}
        </Link>
      </div>

      {/* Hero block (C6) — date + time + location, all bracketed by hairline rules */}
      <DossierHero session={session} />

      {/* Mid block (C7) — Focus / Bring / CoachNote */}
      <section style={{ display: 'grid', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
        <Focus text={session.focus} />
        <BringPills items={session.bring} />
        <CoachNote text={session.coachNote} />
      </section>

      {/* RSVP block (C8) — only on upcoming sessions */}
      {!isPast && (
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <RsvpControl session={session} />
        </section>
      )}

      {/* Roster / Galleries — ship in C9–C11 */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: 'var(--tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--text-mono-cap)',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--rule-hairline)',
        }}
      >
        {isPast ? '/* C12 · past-session variant */' : '/* C9–C11 · Roster / Gallery */'}
      </div>
    </main>
  );
}

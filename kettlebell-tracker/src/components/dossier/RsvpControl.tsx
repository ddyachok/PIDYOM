import { format, differenceInMinutes } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { CapacityDial } from '../ui/ArcPrimitives';
import type { PidyomSession } from '../../data/pidyomSessions';

type RsvpState = 'going' | 'maybe' | 'declined' | 'waitlist';

interface Props {
  session: PidyomSession;
  /**
   * RSVP commits lock 1h before the session starts (Phase 1 grill Q4a).
   * Override only for storybook / preview surfaces.
   */
  cutoffMinutesBefore?: number;
}

const ORDER: Exclude<RsvpState, 'waitlist'>[] = ['going', 'maybe', 'declined'];

export default function RsvpControl({ session, cutoffMinutesBefore = 60 }: Props) {
  const { t } = useTranslation();
  const rsvps = useStore(s => s.rsvps);
  const setRsvp = useStore(s => s.setRsvp);
  const current = rsvps[session.id] ?? null;

  const startsAt = new Date(session.startsAt);
  const minutesUntil = differenceInMinutes(startsAt, new Date());
  const locked = minutesUntil <= cutoffMinutesBefore;

  // Capacity model: a session is full when rsvp count meets capacity.
  // The mock data already carries the count; treat the user's existing
  // RSVP as part of that count to avoid double-counting flips.
  const userIsGoing = current === 'going' || current === 'waitlist';
  const effectiveCount = session.rsvpCount + (userIsGoing ? 0 : 0);
  const capacityFull = effectiveCount >= session.capacity;

  const handle = (state: Exclude<RsvpState, 'waitlist'>) => {
    if (locked) return;
    if (state === 'going') {
      // At capacity → enroll into waitlist instead
      if (capacityFull && current !== 'going' && current !== 'waitlist') {
        setRsvp(session.id, 'waitlist');
        return;
      }
      // Toggle off if already going / waitlisted
      if (current === 'going' || current === 'waitlist') {
        setRsvp(session.id, null);
        return;
      }
      setRsvp(session.id, 'going');
      return;
    }
    setRsvp(session.id, current === state ? null : state);
  };

  // Counts line: if locked we show the GOING/CAP fraction; otherwise the
  // full breakdown (going · maybe · waitlist).
  const goingCount = session.rsvpCount;
  const maybeCount = 0; // mock data has no maybe count yet
  const waitlistCount = current === 'waitlist' ? 1 : 0;

  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--text-mono-cap)',
              display: 'block',
              marginBottom: 4,
            }}
          >
            {t('dossier.rsvp')} · CAPACITY
          </span>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontVariationSettings: '"opsz" 32',
              fontWeight: 700,
              fontSize: 28,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--ink)',
            }}
          >
            {goingCount}
            <span style={{ color: 'var(--ink-50)', fontSize: 16 }}>/{session.capacity}</span>
          </div>
          {!locked && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-2xs)',
                letterSpacing: 'var(--tracking-widest)',
                textTransform: 'uppercase',
                color: 'var(--text-mono-cap)',
                fontVariantNumeric: 'tabular-nums',
                display: 'block',
                marginTop: 6,
              }}
            >
              {t('rsvp.counts_full', { going: goingCount, maybe: maybeCount, waitlist: waitlistCount })}
            </span>
          )}
        </div>
        <CapacityDial going={goingCount} capacity={session.capacity} size={92} locked={locked} />
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-2)',
        }}
      >
        {ORDER.map((state) => {
          const isOn = current === state || (state === 'going' && current === 'waitlist');
          const showsWaitlist = state === 'going' && capacityFull && current !== 'going';

          let label: string;
          if (state === 'going') {
            if (locked) label = t('dossier.locked_at', { time: format(startsAt, 'HH:mm') });
            else if (showsWaitlist && current !== 'waitlist') label = t('rsvp.waitlist_add');
            else label = t('rsvp.going');
          }
          else if (state === 'maybe') {
            label = locked ? t('dossier.locked_label') : t('rsvp.maybe');
          }
          else {
            label = locked ? t('dossier.locked_label') : t('rsvp.declined');
          }

          // Visual: 'going' filled slab when on; outline otherwise.
          const isFilled = isOn && state === 'going' && current === 'going';
          const baseStyle: React.CSSProperties = {
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-wider)',
            textTransform: 'uppercase',
            padding: '14px 8px',
            cursor: locked ? 'not-allowed' : 'pointer',
            border: '1px solid var(--ink-50)',
            background: isFilled ? 'var(--slab)' : 'transparent',
            color: isFilled
              ? 'var(--slab-text)'
              : isOn
                ? 'var(--ink)'
                : locked
                  ? 'var(--ink-35)'
                  : 'var(--ink-65)',
            transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          };
          if (isOn && !isFilled) {
            // 'maybe' / 'declined' active state — strong ink border, ink text
            baseStyle.borderColor = 'var(--ink)';
            baseStyle.color = 'var(--ink)';
          }
          if (locked) {
            baseStyle.borderColor = 'var(--ink-22)';
          }

          return (
            <button
              key={state}
              type="button"
              onClick={() => handle(state)}
              disabled={locked}
              aria-pressed={isOn}
              style={baseStyle}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Waitlist confirmation strip */}
      {current === 'waitlist' && !locked && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--text-mono-cap)',
            paddingTop: 'var(--space-2)',
          }}
        >
          {t('rsvp.waitlist_add')} · 1
        </div>
      )}
    </section>
  );
}

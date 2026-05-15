import { useTranslation } from 'react-i18next';

interface Props {
  /** Coach-pinned message for the session. */
  text: string;
}

// Italic Source Serif 4 with a hairline ink left rule — the brand voice
// pillar made into a primitive. Reading-width measure.
export default function CoachNote({ text }: Props) {
  const { t } = useTranslation();
  if (!text) return null;
  return (
    <aside
      style={{
        borderLeft: '1px solid var(--ink-50)',
        paddingLeft: 'var(--space-4)',
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
        {t('dossier.coach_note')}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 'var(--weight-regular)',
          fontVariationSettings: '"opsz" 12',
          fontSize: 'var(--text-base)',
          lineHeight: 'var(--leading-relaxed)',
          color: 'var(--ink-80)',
          maxWidth: 'var(--max-prose)',
        }}
      >
        {text}
      </div>
    </aside>
  );
}

import { useTranslation } from 'react-i18next';

interface Props {
  /** Coach-authored prose. */
  text: string;
}

// Coach-authored programming focus for the session. Inter regular weight,
// reading-width measure. Mono small-caps label above.
export default function Focus({ text }: Props) {
  const { t } = useTranslation();
  if (!text) return null;
  return (
    <div>
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
        {t('dossier.focus')}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 'var(--weight-regular)',
          fontSize: 'var(--text-md)',
          lineHeight: 'var(--leading-snug)',
          color: 'var(--ink)',
          maxWidth: 'var(--max-prose)',
        }}
      >
        {text}
      </div>
    </div>
  );
}

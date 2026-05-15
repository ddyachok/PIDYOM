import { useTranslation } from 'react-i18next';

interface Props {
  /** Coach-authored bring list. Read-only on the dossier; editable in coach mode. */
  items: string[];
}

// Pill row of items the coach asks attendees to bring. Mono small caps,
// hairline ink border. Coach-authored only — members do not edit.
export default function BringPills({ items }: Props) {
  const { t } = useTranslation();
  if (!items?.length) return null;
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: 'var(--tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--text-mono-cap)',
          marginBottom: 'var(--space-3)',
        }}
      >
        {t('dossier.bring')}
      </div>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        {items.map((item) => (
          <li
            key={item}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: 'var(--tracking-wider)',
              textTransform: 'uppercase',
              color: 'var(--ink-80)',
              padding: '6px 10px',
              border: '1px solid var(--ink-22)',
              whiteSpace: 'nowrap',
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Placeholder for routes that will get their own briefs in subsequent cycles.
// Renders a calm field-manual stub so the router compiles and the suppression
// list can be verified visually.

interface Props { surface: string }

export default function NotImplementedPage({ surface }: Props) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '48px 0',
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: 'var(--tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--ink-50)',
        }}
      >
        Surface · {surface}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--weight-regular)',
          fontVariationSettings: '"opsz" 32',
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--ink)',
        }}
      >
        Pending design brief.
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--ink-65)',
          maxWidth: '60ch',
          lineHeight: 'var(--leading-relaxed)',
        }}
      >
        This surface is reserved by the information architecture but not yet
        designed. The Home and Dossier surfaces are the reference build for
        the redesign cycle.
      </div>
    </div>
  );
}

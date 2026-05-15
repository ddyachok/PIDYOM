import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import Wordmark from '../../components/brand/Wordmark';
import CoordStamp from '../../components/brand/CoordStamp';
import LetterScrambleReveal from '../../components/motion/LetterScrambleReveal';

// Dev-only showcase for brand primitives. Routes to /__brand in dev mode.
// Used as the manual verification surface for theme + lang toggles
// (S4 + S5 will wire those into Settings; this page lets us flip them
// directly during build).
export default function BrandShowcase() {
  const { t } = useTranslation();
  const themePref = useStore(s => s.themePref);
  const setThemePref = useStore(s => s.setThemePref);
  const lang = useStore(s => s.lang);
  const setLang = useStore(s => s.setLang);

  // C5 demo state — bumping this re-mounts the reveal so it can be
  // re-played at will.
  const [scrambleSeed, setScrambleSeed] = useState(0);

  const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <section style={{ paddingBlock: 'var(--space-8)', borderTop: '1px solid var(--ink-15)' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: 'var(--tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--text-mono-cap)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>{children}</div>
    </section>
  );

  const ToggleRow = ({ items, current, onPick }: { items: { id: string; label: string }[]; current: string; onPick: (id: string) => void }) => (
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      {items.map(it => {
        const active = it.id === current;
        return (
          <button
            key={it.id}
            onClick={() => onPick(it.id)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-2xs)',
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase',
              padding: '8px 14px',
              border: '1px solid var(--ink-50)',
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--bg-primary)' : 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <main
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--ink)',
        minHeight: '100vh',
        padding: 'var(--space-12) var(--rail-mobile)',
        maxWidth: 'var(--max-content)',
        margin: '0 auto',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ marginBottom: 'var(--space-12)' }}>
        <Wordmark size="md" />
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: '"opsz" 32',
            fontSize: 'var(--text-xl)',
            color: 'var(--ink)',
            marginTop: 'var(--space-4)',
          }}
        >
          Brand showcase
        </div>
        <div style={{ marginTop: 'var(--space-2)', color: 'var(--ink-65)', fontSize: 'var(--text-sm)' }}>
          Dev-only verification surface for primitives, theme, and language.
        </div>
      </div>

      <Section label="Wordmark · sizes">
        <Wordmark size="sm" />
        <Wordmark size="md" />
        <Wordmark size="lg" />
        <Wordmark size="xl" />
      </Section>

      <Section label="CoordStamp">
        <CoordStamp lat={50.4439} lng={30.5108} />
        <CoordStamp lat={50.4439} lng={30.5108} time="18:30" />
        <CoordStamp lat={-22.9068} lng={-43.1729} time="07:00" precision={3} />
      </Section>

      <Section label="Type · Source Serif 4 · display ramp">
        <div style={{ fontFamily: 'var(--font-display)', fontVariationSettings: '"opsz" 60', fontWeight: 900, fontSize: 'var(--text-massive-date)', lineHeight: 'var(--leading-display)', letterSpacing: 'var(--tracking-display)' }}>
          29.APR
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontVariationSettings: '"opsz" 32', fontSize: 'var(--text-2xl)' }}>
          Section opener
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontVariationSettings: '"opsz" 12', fontStyle: 'italic', fontSize: 'var(--text-base)', color: 'var(--ink-80)', maxWidth: 'var(--max-prose)' }}>
          The lift is something we do together, and the way we coordinate it makes it feel like everyone is organising it alone.
        </div>
      </Section>

      <Section label="Type · Inter · UI ramp">
        <div style={{ fontWeight: 300, fontSize: 'var(--text-base)' }}>Light body — for long-form reading.</div>
        <div style={{ fontWeight: 400, fontSize: 'var(--text-sm)' }}>Regular body — for default UI text.</div>
        <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>Medium — for UI labels.</div>
        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Semibold — for emphasis.</div>
      </Section>

      <Section label="Type · Space Mono · technical">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', color: 'var(--text-mono-cap)' }}>
          50.4439°N · 30.5108°E · REV 03
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink-65)' }}>
          7 / 12 GOING · LOCKED · 17:30
        </div>
      </Section>

      <Section label="i18n · live RSVP labels">
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {['rsvp.going', 'rsvp.maybe', 'rsvp.declined', 'rsvp.waitlist_add'].map(k => (
            <span key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', padding: '6px 10px', border: '1px solid var(--ink-22)', color: 'var(--ink)' }}>
              {t(k)}
            </span>
          ))}
        </div>
      </Section>

      <Section label="Motion · letter-scramble reveal">
        <button
          onClick={() => setScrambleSeed(s => s + 1)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-2xs)',
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            padding: '8px 14px',
            border: '1px solid var(--ink-50)',
            background: 'transparent',
            color: 'var(--ink)',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          ↻ REPLAY
        </button>
        <div
          key={`reveal-mark-${scrambleSeed}`}
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: 'clamp(36px, 7vw, 72px)',
            letterSpacing: 'var(--tracking-wider)',
            color: 'var(--ink)',
          }}
        >
          <LetterScrambleReveal text={t('brand.wordmark')} duration={900} stagger={28} />
        </div>
        <div
          key={`reveal-coords-${scrambleSeed}`}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            letterSpacing: 'var(--tracking-widest)',
            color: 'var(--text-mono-cap)',
          }}
        >
          <LetterScrambleReveal text="50.4439°N · 30.5108°E · 18:30" duration={900} stagger={20} />
        </div>
      </Section>

      <Section label="Toggle · theme">
        <ToggleRow
          current={themePref}
          onPick={(id) => setThemePref(id as 'system' | 'paper' | 'void')}
          items={[
            { id: 'system', label: t('settings.theme_system') },
            { id: 'paper',  label: t('settings.theme_paper')  },
            { id: 'void',   label: t('settings.theme_void')   },
          ]}
        />
      </Section>

      <Section label="Toggle · language">
        <ToggleRow
          current={lang}
          onPick={(id) => setLang(id as 'ua' | 'en')}
          items={[
            { id: 'ua', label: t('settings.lang_ua') },
            { id: 'en', label: t('settings.lang_en') },
          ]}
        />
      </Section>
    </main>
  );
}

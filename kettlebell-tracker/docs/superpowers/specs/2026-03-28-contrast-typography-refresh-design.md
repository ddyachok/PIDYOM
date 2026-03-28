# Design Spec: Contrast & Typography Refresh
**Date:** 2026-03-28
**Approach:** Token Lift + Typography Scale (Option 1)
**Scope:** `src/index.css`, all page/component files with hardcoded `#6A6A62` inline styles, `docs/design-system.pdf`

---

## Problem

The app uses a pure-black (`#0D0D0D`) background with a brutalist monospace aesthetic. Several CSS token values are set so low that text is effectively invisible:

- `.coord-stamp` uses `rgba(255,255,255,0.14)` — 14% white opacity, ~1.3:1 contrast. Unreadable.
- `.data-label` uses `rgba(255,255,255,0.35)` — fails WCAG AA for all text sizes.
- `--color-steel: #6A6A62` — ~3.9:1 contrast on `#0D0D0D`, fails AA for normal text (<18pt).
- Many font sizes are 8–9px, compounding the legibility problem.

The goal is a **bold, legible refresh** that preserves the exact visual identity (pure black, acid green accent `#C6FF00`, Space Mono + Barlow Condensed) while making all text actually readable and the typography feel confident, not timid.

---

## Section 1: Color Token Changes

### `index.css` — CSS token/class updates

| Token / Class | Property | Current | New | Reason |
|---|---|---|---|---|
| `--color-steel` | value | `#6A6A62` | `#9A9A90` | Raises contrast to ~6.5:1 on #0D0D0D |
| `.coord-stamp` | `color` | `rgba(255,255,255,0.14)` | `rgba(255,255,255,0.50)` | Was nearly invisible (~1.3:1) |
| `.coord-stamp::before` | `background` | `rgba(198,255,0,0.4)` | `rgba(198,255,0,0.8)` | Indicator dot should pop |
| `.coord-stamp--light::before` | `background` | `rgba(10,10,10,0.3)` | `rgba(10,10,10,0.5)` | Parity for light theme |
| `.data-label` | `color` | `rgba(255,255,255,0.35)` | `rgba(255,255,255,0.55)` | Raises to ~5.5:1 |
| `.section-label` | `color` | `rgba(255,255,255,0.38)` | `rgba(255,255,255,0.55)` | Consistent with data-label |
| `.section-tag` | `color` | `#6A6A62` | `#9A9A90` | Matches new steel token |
| `.section-tag--light` | `color` | `#6A6A62` | `#6A6A62` | Unchanged (light bg, contrast OK) |
| `.pill--ghost` | `color` | `rgba(255,255,255,0.45)` | `rgba(255,255,255,0.70)` | Borderline → clearly readable |
| `.pill--ghost` | `border-color` | `rgba(255,255,255,0.12)` | `rgba(255,255,255,0.20)` | Border also more visible |
| `.btn-ghost` | `color` | `rgba(255,255,255,0.45)` | `rgba(255,255,255,0.65)` | Ghost buttons readable |
| `.btn-ghost:hover` | `color` | `rgba(255,255,255,0.75)` | `rgba(255,255,255,0.85)` | Consistent hover lift |
| `.tag` | `color` | `rgba(255,255,255,0.5)` | `rgba(255,255,255,0.70)` | Tags always visible |
| `.tag` | `border-color` | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.18)` | Border slightly more visible |
| `.status-dot--idle` | `background` | `rgba(255,255,255,0.2)` | `rgba(255,255,255,0.40)` | Idle state visible |
| `.dot-leader` | `border-color` | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.18)` | Subtle but present |
| `.bracket-card::before/after` | `border-color` | `rgba(255,255,255,0.15)` | `rgba(255,255,255,0.22)` | Bracket corners visible |

### Hardcoded `#6A6A62` inline style replacements

All occurrences of hardcoded `color: '#6A6A62'` in TSX files are replaced with `color: '#9A9A90'`. Files affected:

- `src/pages/HomePage.tsx` — date stamp, username, description text, "All →" link, workout list metadata
- `src/components/ui/DesktopSidebar.tsx` — "Movement Framework" subtitle
- `src/pages/WorkoutsPage.tsx` — any occurrences
- `src/pages/SchedulePage.tsx` — any occurrences
- `src/pages/ProgressPage.tsx` — any occurrences
- `src/pages/ProfilePage.tsx` — any occurrences

**Method:** search-and-replace `'#6A6A62'` → `'#9A9A90'` across all TSX files (leaving CSS alone since `--color-steel` handles that).

---

## Section 2: Typography Scale

Font sizes below 10px are too small to be readable at standard screen distances regardless of contrast. All micro-text is bumped up.

| Class / Element | Current size | New size |
|---|---|---|
| `.coord-stamp` | `8px` | `10px` |
| `.data-label` | `8px` | `10px` |
| `.section-label` | `9px` | `11px` |
| `.section-tag` | `9px` | `11px` |
| `.pill` | `9px` | `10px` |
| `.tag` | `9px` | `10px` |
| Bottom nav label (BottomNav.tsx inline) | `8px` | `9px` |
| Sidebar "Movement Framework" (DesktopSidebar.tsx inline) | `8px` | `9px` |
| Body/description `p` text (inline `fontSize: 11`) | `11px` | `13px` |
| Workout list metadata (inline `fontSize: 9`) | `9px` | `10px` |
| "All →" link (inline `fontSize: 8`) | `8px` | `10px` |
| Exercise count badge (inline `fontSize: 8`) | `8px` | `9px` |

`.section-label::before` line width: `12px` → `16px` (proportional to font size bump).

---

## Section 3: PDF Design System Document

After CSS changes are live, generate `docs/design-system.pdf` documenting the full updated design system. Content:

1. **Color Palette** — all named tokens with hex values, swatches, and contrast ratios on `#0D0D0D`
2. **Typography** — all classes with size, weight, letter-spacing, and sample text
3. **Buttons** — all variants: `.btn`, `.btn-acid`, `.btn-primary`, `.btn-ghost`, `.btn-outline`, `.btn-danger`, `.btn-solid`
4. **Pills & Tags** — all variants with usage guidance
5. **Cards** — `.card`, `.wk-card`, `.bracket-card` with visual examples
6. **Utility classes** — `.section-tag`, `.section-label`, `.coord-stamp`, `.data-label`, `.hero-stat`, `.page-title`

Use the `anthropic-skills:pdf` skill to generate the PDF from structured HTML.

---

## Files Changed

| File | Change type |
|---|---|
| `src/index.css` | Token values + font sizes updated |
| `src/pages/HomePage.tsx` | `#6A6A62` → `#9A9A90`, `fontSize: 11` → `13` for body copy |
| `src/components/ui/BottomNav.tsx` | `fontSize: 8` → `9` for nav labels |
| `src/components/ui/DesktopSidebar.tsx` | `fontSize: 8` → `9`, `#6A6A62` → `#9A9A90` |
| `src/pages/WorkoutsPage.tsx` | `#6A6A62` → `#9A9A90` scan |
| `src/pages/SchedulePage.tsx` | `#6A6A62` → `#9A9A90` scan |
| `src/pages/ProgressPage.tsx` | `#6A6A62` → `#9A9A90` scan |
| `src/pages/ProfilePage.tsx` | `#6A6A62` → `#9A9A90` scan |
| `docs/design-system.pdf` | New file — generated design system reference |

---

## Out of Scope

- Light theme changes (light theme already has sufficient contrast on its paper background)
- Structural layout changes
- New components or features
- Animation changes

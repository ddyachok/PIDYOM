# Contrast & Typography Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all text legible across every page by lifting low-opacity CSS tokens and bumping micro font sizes, while preserving the brutalist black/acid-green identity.

**Architecture:** All changes are pure style — no structural, logic, or component changes. Three change categories: (1) `index.css` token lifts, (2) local `steel`/`muted` variable fixes in ProgressPage and ProfilePage, (3) hardcoded `#6A6A62` replacement in SchedulePage, HomePage, BottomNav, DesktopSidebar. Ends with a generated PDF design system reference.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + `anthropic-skills:pdf` for the PDF step

---

## File Map

| File | What changes |
|---|---|
| `src/index.css` | Token color values + font sizes for `.coord-stamp`, `.data-label`, `.section-label`, `.section-tag`, `.pill`, `.pill--ghost`, `.btn-ghost`, `.tag`, `.status-dot--idle`, `.dot-leader`, `.bracket-card` |
| `src/pages/HomePage.tsx` | `#6A6A62` → `#9A9A90` in inline styles; description `p` fontSize 11 → 13; metadata fontSize 8/9 → 10 |
| `src/pages/SchedulePage.tsx` | 12× hardcoded `#6A6A62` → `#9A9A90`; tiny font sizes bumped |
| `src/pages/ProgressPage.tsx` | Local `steel` dark value `rgba(255,255,255,0.38)` → `rgba(255,255,255,0.55)`; local `muted` dark value `rgba(255,255,255,0.28)` → `rgba(255,255,255,0.40)` |
| `src/pages/ProfilePage.tsx` | Local `steel` dark value `rgba(255,255,255,0.38)` → `rgba(255,255,255,0.55)` |
| `src/components/ui/BottomNav.tsx` | Nav label fontSize 8 → 9 |
| `src/components/ui/DesktopSidebar.tsx` | "Movement Framework" subtitle fontSize 8 → 9; `#6A6A62` → `#9A9A90` |
| `docs/design-system.pdf` | New — generated PDF reference |

---

## Task 1: Fix CSS tokens in index.css

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Update `--color-steel` token**

In `src/index.css`, find and replace:
```css
/* BEFORE */
--color-steel: #6A6A62;

/* AFTER */
--color-steel: #9A9A90;
```

- [ ] **Step 2: Update `.coord-stamp` — color and font size**

```css
/* BEFORE */
.coord-stamp {
  font-size: 8px;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.14);
```

```css
/* AFTER */
.coord-stamp {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.50);
```

- [ ] **Step 3: Update `.coord-stamp::before` dot — make it pop**

```css
/* BEFORE */
.coord-stamp::before {
  content: '';
  display: inline-block;
  width: 4px; height: 4px;
  background: rgba(198,255,0,0.4);

/* AFTER */
.coord-stamp::before {
  content: '';
  display: inline-block;
  width: 4px; height: 4px;
  background: rgba(198,255,0,0.8);
```

- [ ] **Step 4: Update `.coord-stamp--light::before`**

```css
/* BEFORE */
.coord-stamp--light::before {
  background: rgba(10,10,10,0.3);
}

/* AFTER */
.coord-stamp--light::before {
  background: rgba(10,10,10,0.5);
}
```

- [ ] **Step 5: Update `.data-label` — color and font size**

```css
/* BEFORE */
.data-label {
  font-size: 8px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);

/* AFTER */
.data-label {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
```

- [ ] **Step 6: Update `.section-label` — color, font size, and marker width**

```css
/* BEFORE */
.section-label {
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.38);

/* AFTER */
.section-label {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
```

Also update the `::before` line width within `.section-label::before`:
```css
/* BEFORE */
.section-label::before {
  content: '';
  display: inline-block;
  width: 12px;

/* AFTER */
.section-label::before {
  content: '';
  display: inline-block;
  width: 16px;
```

- [ ] **Step 7: Update `.section-tag` — color and font size**

```css
/* BEFORE */
.section-tag {
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6A6A62;

/* AFTER */
.section-tag {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #9A9A90;
```

(Leave `.section-tag--light` color at `#6A6A62` — it sits on the paper background where that value has sufficient contrast.)

- [ ] **Step 8: Update `.pill` font size**

```css
/* BEFORE */
.pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-family: 'Space Mono', monospace;
  font-size: 9px;

/* AFTER */
.pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-family: 'Space Mono', monospace;
  font-size: 10px;
```

- [ ] **Step 9: Update `.pill--ghost` — color and border**

```css
/* BEFORE */
.pill--ghost {
  background: transparent;
  color: rgba(255,255,255,0.45);
  border-color: rgba(255,255,255,0.12);
}

/* AFTER */
.pill--ghost {
  background: transparent;
  color: rgba(255,255,255,0.70);
  border-color: rgba(255,255,255,0.20);
}
```

- [ ] **Step 10: Update `.btn-ghost` and `.btn-ghost:hover`**

```css
/* BEFORE */
.btn-ghost { border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.45); }
.btn-ghost:hover { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.03); }

/* AFTER */
.btn-ghost { border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.65); }
.btn-ghost:hover { color: rgba(255,255,255,0.85); border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.03); }
```

- [ ] **Step 11: Update `.tag` — color, border, and font size**

```css
/* BEFORE */
.tag {
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 8px;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);

/* AFTER */
.tag {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 8px;
  border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.70);
```

- [ ] **Step 12: Update `.status-dot--idle`**

```css
/* BEFORE */
.status-dot--idle { background: rgba(255,255,255,0.2); }

/* AFTER */
.status-dot--idle { background: rgba(255,255,255,0.40); }
```

- [ ] **Step 13: Update `.dot-leader`**

```css
/* BEFORE */
.dot-leader {
  flex: 1;
  border-bottom: 1px dotted rgba(255,255,255,0.1);

/* AFTER */
.dot-leader {
  flex: 1;
  border-bottom: 1px dotted rgba(255,255,255,0.18);
```

- [ ] **Step 14: Update `.bracket-card::before` and `::after`**

```css
/* BEFORE */
.bracket-card::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 18px; height: 18px;
  border-top: 1px solid rgba(255,255,255,0.15);
  border-left: 1px solid rgba(255,255,255,0.15);
  pointer-events: none;
}
.bracket-card::after {
  content: '';
  position: absolute; bottom: 0; right: 0;
  width: 18px; height: 18px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  border-right: 1px solid rgba(255,255,255,0.15);
  pointer-events: none;
}

/* AFTER */
.bracket-card::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 18px; height: 18px;
  border-top: 1px solid rgba(255,255,255,0.22);
  border-left: 1px solid rgba(255,255,255,0.22);
  pointer-events: none;
}
.bracket-card::after {
  content: '';
  position: absolute; bottom: 0; right: 0;
  width: 18px; height: 18px;
  border-bottom: 1px solid rgba(255,255,255,0.22);
  border-right: 1px solid rgba(255,255,255,0.22);
  pointer-events: none;
}
```

- [ ] **Step 15: Commit**

```bash
git add src/index.css
git commit -m "- update css contrast tokens and font sizes for legibility;"
```

---

## Task 2: Fix HomePage.tsx inline styles

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Replace `#6A6A62` color values and bump font sizes**

In `src/pages/HomePage.tsx`, make these targeted replacements:

**Date + username text (lines ~119, 125):**
```tsx
/* BEFORE */
<span style={{ fontSize: 9, letterSpacing: '0.12em', color: '#6A6A62' }}>
  {format(new Date(), 'dd.MM.yyyy')}
</span>
...
<span style={{ fontSize: 9, letterSpacing: '0.12em', color: '#6A6A62', textTransform: 'uppercase' }}>

/* AFTER */
<span style={{ fontSize: 9, letterSpacing: '0.12em', color: '#9A9A90' }}>
  {format(new Date(), 'dd.MM.yyyy')}
</span>
...
<span style={{ fontSize: 9, letterSpacing: '0.12em', color: '#9A9A90', textTransform: 'uppercase' }}>
```

**Workout card description paragraphs (lines ~205, 231, 244)** — bump fontSize AND color:
```tsx
/* BEFORE */
<p style={{ fontSize: 11, color: '#6A6A62', lineHeight: 1.6, marginBottom: 16 }}>

/* AFTER */
<p style={{ fontSize: 13, color: '#9A9A90', lineHeight: 1.6, marginBottom: 16 }}>
```
Apply this change to all three description `<p>` tags inside `.wk-card` blocks.

**"All →" link (line ~272):**
```tsx
/* BEFORE */
style={{ fontSize: 8, letterSpacing: '0.15em', color: '#6A6A62', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}

/* AFTER */
style={{ fontSize: 10, letterSpacing: '0.15em', color: '#9A9A90', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}
```

**Workout list row index number (line ~291):**
```tsx
/* BEFORE */
<span style={{ fontSize: 9, color: '#6A6A62', width: 20, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>

/* AFTER */
<span style={{ fontSize: 9, color: '#9A9A90', width: 20, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
```

**Workout list date (line ~299):**
```tsx
/* BEFORE */
<span style={{ fontSize: 9, color: '#6A6A62', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>

/* AFTER */
<span style={{ fontSize: 10, color: '#9A9A90', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
```

**Exercise count badge (line ~303):**
```tsx
/* BEFORE */
<span style={{ fontSize: 8, color: '#6A6A62', flexShrink: 0 }}>

/* AFTER */
<span style={{ fontSize: 9, color: '#9A9A90', flexShrink: 0 }}>
```

**Empty state body text (line ~320):**
```tsx
/* BEFORE */
<p style={{ fontSize: 11, color: '#6A6A62', marginBottom: 4 }}>No workouts logged yet.</p>

/* AFTER */
<p style={{ fontSize: 13, color: '#9A9A90', marginBottom: 4 }}>No workouts logged yet.</p>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "- improve home page text contrast and font sizes;"
```

---

## Task 3: Fix SchedulePage.tsx

**Files:**
- Modify: `src/pages/SchedulePage.tsx`

- [ ] **Step 1: Replace all hardcoded `#6A6A62` with `#9A9A90`**

SchedulePage has no local `steel` variable — it hardcodes `#6A6A62` directly in ~12 places. Do a full file replace:

Every occurrence of `color: '#6A6A62'` in this file → `color: '#9A9A90'`

Also the calendar month nav buttons that use `color: '#6A6A62'` inside a style prop.

After replacement, verify no `#6A6A62` remains by searching the file.

- [ ] **Step 2: Bump tiny font sizes in SchedulePage**

Find and replace the following specific occurrences:

**Month nav buttons (lines ~175, 195):**
```tsx
/* BEFORE */
style={{ cursor: 'pointer', background: 'transparent', border: `1px solid ${rule}`, color: '#9A9A90', fontSize: 9, padding: '5px 12px' }}

/* AFTER */
style={{ cursor: 'pointer', background: 'transparent', border: `1px solid ${rule}`, color: '#9A9A90', fontSize: 10, padding: '5px 12px' }}
```

**Day-of-week header (line ~207):**
```tsx
/* BEFORE */
style={{ textAlign: 'center', fontSize: 7, letterSpacing: '0.1em', color: '#9A9A90', padding: '4px 0', fontFamily: 'Space Mono, monospace' }}

/* AFTER */
style={{ textAlign: 'center', fontSize: 9, letterSpacing: '0.1em', color: '#9A9A90', padding: '4px 0', fontFamily: 'Space Mono, monospace' }}
```

**"TAP DAY TO PLAN" hint (line ~283):**
```tsx
/* BEFORE */
<span style={{ fontSize: 8, color: '#9A9A90', letterSpacing: '0.1em', fontFamily: 'Space Mono, monospace' }}>TAP DAY TO PLAN</span>

/* AFTER */
<span style={{ fontSize: 10, color: '#9A9A90', letterSpacing: '0.1em', fontFamily: 'Space Mono, monospace' }}>TAP DAY TO PLAN</span>
```

**Legend labels (lines ~286, 288):**
```tsx
/* BEFORE */
<span style={{ fontSize: 7, color: '#9A9A90' }}>Workout A</span>
...
<span style={{ fontSize: 7, color: '#9A9A90' }}>Workout B</span>

/* AFTER */
<span style={{ fontSize: 9, color: '#9A9A90' }}>Workout A</span>
...
<span style={{ fontSize: 9, color: '#9A9A90' }}>Workout B</span>
```

**"Remove" link (line ~316):**
```tsx
/* BEFORE */
style={{ fontSize: 8, letterSpacing: '0.15em', color: '#9A9A90', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}

/* AFTER */
style={{ fontSize: 10, letterSpacing: '0.15em', color: '#9A9A90', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
```

**Upcoming section label (line ~376):**
```tsx
/* BEFORE */
<span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A9A90', fontFamily: 'Space Mono, monospace' }}>Upcoming</span>

/* AFTER */
<span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A9A90', fontFamily: 'Space Mono, monospace' }}>Upcoming</span>
```

**Upcoming list date (line ~393):**
```tsx
/* BEFORE */
<span style={{ fontSize: 9, color: '#9A9A90', width: 80, flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace' }}>

/* AFTER */
<span style={{ fontSize: 10, color: '#9A9A90', width: 80, flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontFamily: 'Space Mono, monospace' }}>
```

**Empty upcoming state (line ~403):**
```tsx
/* BEFORE */
<p style={{ fontSize: 9, color: '#9A9A90', textAlign: 'center', padding: '24px 0', fontFamily: 'Space Mono, monospace' }}>

/* AFTER */
<p style={{ fontSize: 11, color: '#9A9A90', textAlign: 'center', padding: '24px 0', fontFamily: 'Space Mono, monospace' }}>
```

**Modal date label (line ~460):**
```tsx
/* BEFORE */
<p style={{ fontSize: 9, color: '#9A9A90', marginBottom: 20, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}>

/* AFTER */
<p style={{ fontSize: 11, color: '#9A9A90', marginBottom: 20, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em' }}>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/SchedulePage.tsx
git commit -m "- improve schedule page contrast and font sizes;"
```

---

## Task 4: Fix ProgressPage.tsx and ProfilePage.tsx local steel/muted variables

**Files:**
- Modify: `src/pages/ProgressPage.tsx`
- Modify: `src/pages/ProfilePage.tsx`

Both pages compute a local `steel` variable for dark theme that uses `rgba(255,255,255,0.38)` — below the target contrast. ProgressPage also has a `muted` variable at `rgba(255,255,255,0.28)`.

- [ ] **Step 1: Fix ProgressPage `steel` and `muted` dark values**

In `src/pages/ProgressPage.tsx`, find:
```tsx
const steel    = isLight ? '#6A6A62'             : 'rgba(255,255,255,0.38)';
const muted    = isLight ? 'rgba(10,10,10,0.35)' : 'rgba(255,255,255,0.28)';
```

Replace with:
```tsx
const steel    = isLight ? '#6A6A62'             : 'rgba(255,255,255,0.55)';
const muted    = isLight ? 'rgba(10,10,10,0.35)' : 'rgba(255,255,255,0.40)';
```

- [ ] **Step 2: Fix ProfilePage `steel` dark value**

In `src/pages/ProfilePage.tsx`, find:
```tsx
const steel = isLight ? '#6A6A62'             : 'rgba(255,255,255,0.38)';
```

Replace with:
```tsx
const steel = isLight ? '#6A6A62'             : 'rgba(255,255,255,0.55)';
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProgressPage.tsx src/pages/ProfilePage.tsx
git commit -m "- fix progress and profile page dark mode contrast;"
```

---

## Task 5: Fix BottomNav.tsx and DesktopSidebar.tsx

**Files:**
- Modify: `src/components/ui/BottomNav.tsx`
- Modify: `src/components/ui/DesktopSidebar.tsx`

- [ ] **Step 1: Bump BottomNav tab label font size**

In `src/components/ui/BottomNav.tsx`, find:
```tsx
<span style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
  {tab.label}
</span>
```

Replace with:
```tsx
<span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
  {tab.label}
</span>
```

- [ ] **Step 2: Fix DesktopSidebar "Movement Framework" subtitle**

In `src/components/ui/DesktopSidebar.tsx`, find:
```tsx
<div style={{ fontSize: 8, letterSpacing: '0.2em', color: '#6A6A62', textTransform: 'uppercase', marginTop: 3 }}>
  Movement Framework
</div>
```

Replace with:
```tsx
<div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#9A9A90', textTransform: 'uppercase', marginTop: 3 }}>
  Movement Framework
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BottomNav.tsx src/components/ui/DesktopSidebar.tsx
git commit -m "- bump nav font sizes and sidebar subtitle contrast;"
```

---

## Task 6: Visual verification

**Files:** none (verification only)

- [ ] **Step 1: Open all pages in preview and screenshot**

Open `http://localhost:5173/?preview=home` and verify:
- "CORE // MOVEMENT FRAMEWORK" coord stamp is clearly visible
- Date + username text is readable
- Workout card description text is larger and visible
- "WORKOUTS / SETS / KG TOTAL" labels are visible

Open `http://localhost:5173/?preview=workouts` and verify:
- "SEC-2 // TRAINING" stamp is visible
- "TODAY" section tag is readable
- "HISTORY" label visible

Open `http://localhost:5173/?preview=progress` and verify:
- Page title "INTEL" is clearly visible
- Stats and chart labels are readable

Open `http://localhost:5173/?preview=profile` and verify:
- Section dividers and labels readable
- Equipment, stats text visible

Open `http://localhost:5173/?preview=schedule` and verify:
- Calendar day-of-week headers visible
- "Upcoming" section label readable
- All metadata text legible

---

## Task 7: Generate PDF design system document

**Files:**
- Create: `docs/design-system.pdf`

- [ ] **Step 1: Invoke the PDF skill**

Use the `anthropic-skills:pdf` skill to generate `docs/design-system.pdf` with the following HTML content representing the full updated design system:

**Document structure:**
1. Cover: "PIDYOM — Design System" header on black background with acid green accent
2. **Color Palette section** — swatches with hex values and contrast ratios on #0D0D0D:
   - `#0D0D0D` Void (background)
   - `#E8E8E1` Paper (light bg / text)
   - `#0A0A0A` Ink (headings)
   - `#C6FF00` Acid (primary accent)
   - `#9A9A90` Steel (secondary text, ~7.1:1 on Void)
   - `#C0C0B8` Rule (borders/dividers on light)
   - `#22c55e` Success
   - `#ef4444` Error
3. **Typography section** — table of all text classes:
   - `.disp` / `.page-title` — Barlow Condensed 900, 40–56px
   - `.hero-stat` — Barlow Condensed 900, 44–60px
   - `.btn` — Space Mono 700, 11–12px, tracking 0.15em
   - `.section-tag` — Space Mono 400, 11px, tracking 0.2em
   - `.section-label` — Space Mono 700, 11px, tracking 0.22em
   - `.data-label` — Space Mono 400, 10px, tracking 0.18em
   - `.coord-stamp` — Space Mono 400, 10px, tracking 0.1em
   - `.pill` — Space Mono 400, 10px, tracking 0.12em
   - `.tag` — Space Mono 400, 10px, tracking 0.12em
4. **Buttons section** — all variants: `.btn`, `.btn-acid`, `.btn-primary`, `.btn-ghost`, `.btn-outline`, `.btn-danger`, `.btn-solid`
5. **Pills & Tags section** — `.pill--acid`, `.pill--ghost`, `.pill--ink`, `.pill--outline`, `.tag`, `.tag-acid`
6. **Cards section** — `.card`, `.wk-card`, `.bracket-card`
7. **Utility classes section** — `.coord-stamp`, `.data-label`, `.section-tag`, `.section-label`, `.hero-stat`, `.status-dot` variants

- [ ] **Step 2: Commit the PDF**

```bash
git add docs/design-system.pdf
git commit -m "- add design system pdf reference;"
```

# Build Tasks: PIDYOM — Foundation + Home Surface

Generated from: `.design/pidyom-redesign/DESIGN_BRIEF.md` (Rev 03),
`INFORMATION_ARCHITECTURE.md` (Rev 01), `DESIGN_TOKENS.css` (Rev 01).
Date: 2026-04-27.

> **Scope of this task list**
> Build only what the brief covers: **the brand foundation + the Home →
> Dossier surface**. Other surfaces (Club, Train, You) get their own briefs
> and task lists in subsequent cycles. Tasks below that touch shared
> infrastructure (routing, layout shell, theme system, i18n, fonts) deliver
> a complete foundation other briefs can slot into.
>
> **Conventions**
> · Each task is a vertical slice (structure + style + interaction in one).
> · Each task lists **Reuses / Modifies / New** components.
> · Tasks within a section are ordered by dependency. Run them top-to-bottom.
> · Where a task touches the Notion-locked schema, the migration is the
>   *backend half* of the slice — but real Hasura migrations are deferred
>   per the brief's *Out of Scope*. Until they ship, tasks consume
>   `src/data/pidyomSessions.ts` mock data.
>
> **Aesthetic anchor — establish in the first build task and never lose**
> *Field Manual* — editorial-restraint sportswear. Pigmented neutrals, no
> UI accent colour, Source Serif 4 + Inter + Space Mono trio. References:
> 28 Club, UVU, Lift The Movement, Tracksmith, Heresy.ltd. See
> `DESIGN_BRIEF.md` for full direction.

---

## Foundation

- [ ] **F1 · Wire fonts.** Replace Barlow Condensed loading in `index.html`
      with the Source Serif 4 + Inter + Space Mono trio. Single Google
      Fonts request with `display=swap`. Preconnect tags. Verify network
      tab shows three font files, no Barlow request, no FOUT. _Modifies:
      `index.html`._

- [ ] **F2 · Adopt token file.** Move `DESIGN_TOKENS.css` into
      `src/tokens.css`. Import it from `src/main.tsx` *before*
      `import './index.css'`. Verify `getComputedStyle(document.documentElement)
      .getPropertyValue('--paper')` resolves in the dev console.
      Establishes Field Manual aesthetic — every later task references
      these tokens. _New: `src/tokens.css`. Modifies: `src/main.tsx`._

- [ ] **F3 · Retire legacy acid + Barlow tokens.** Strip `--c-accent`,
      `--c-acid-*`, `--c-accent-*`, `--c-accent-glow` and the `--font-display:
      'Barlow Condensed'` declaration from `src/index.css` `@theme` and
      `:root`. Tailwind utilities like `bg-[#C6FF00]` and the
      `html[data-theme="light"]` acid overrides are not deleted yet
      (Phase 6 components migrate off them); but the tokens themselves
      stop existing. Build passes; type-check passes; existing pages
      still render (some will look wrong — that's expected and tracked
      in C7). _Modifies: `src/index.css`._

- [ ] **F4 · Zustand theme + lang slice.** Add `theme: 'system' | 'paper'
      | 'void'` and `lang: 'ua' | 'en'` to `src/store/useStore.ts` with
      persist middleware. Resolve `theme: 'system'` via
      `prefers-color-scheme` on read. Apply via `data-theme` on `<html>`
      pre-paint (`useLayoutEffect` in `App.tsx`). Default `theme: 'system'`,
      `lang: 'ua'`. Verify toggling persists across reload. _Modifies:
      `src/store/useStore.ts`, `src/App.tsx`._

- [ ] **F5 · i18n scaffolding.** Install `react-i18next` + `i18next`. Set
      up `src/i18n/index.ts` reading `src/i18n/locales/{ua,en}.json`. Wire
      `lang` from store to the i18n instance. Seed locales with the IA
      glossary (the bilingual Naming Conventions table) — only the keys
      Home + Dossier need now (the rest in later briefs). Verify
      `t('rsvp.going')` returns `'Я ЙДУ'` when `lang = ua`,
      `"I'M GOING"` when `lang = en`. _New: `src/i18n/`. Modifies:
      `src/main.tsx`, `package.json`._

- [ ] **F6 · Real routing via react-router-dom v7.** Replace the
      `currentTab`-based `<CurrentPage>` switch in `src/App.tsx` with a
      `<BrowserRouter>` + `<Routes>` tree matching `INFORMATION_ARCHITECTURE.md`
      site map. Build a single `<RootLayout>` that renders `<DesktopSidebar
      />` + `<Outlet />` + `<BottomNav />` and computes the suppression
      list from `useLocation()` (hide chrome on `/`, `/dossier/*`,
      `/train/today/active/*`, `/auth`). Stub all non-Home/Dossier routes
      to a placeholder `<NotImplementedPage tab="club" />` so the router
      compiles. Verify: nav between `/`, `/club`, `/train`, `/you`,
      `/auth` works; refresh holds the URL; chrome hides on `/`.
      _New: `src/layouts/RootLayout.tsx`, `src/pages/NotImplementedPage.tsx`.
      Modifies: `src/App.tsx`. Removes: `currentTab` switch._

- [ ] **F7 · Brand primitives — Wordmark + CoordStamp.** Two new
      stateless components in `src/components/brand/`. **`Wordmark`** —
      renders `PIDYOM` (or `ПІДЙОМ` per `lang`) in Space Mono small caps,
      sized via prop (`sm` 12 px / `md` 18 px / `xl` clamp(48px, 6vw,
      96px)). **`CoordStamp`** — renders one mono line `<lat>°N · <lng>°E`
      in `--text-2xs`, `--tracking-widest`, `--text-mono-cap`. Both read
      tokens; neither has any acid. Storybook-style demo route at
      `/__brand` (dev-only) listing both at every size. _New: `src/components/brand/Wordmark.tsx`, `src/components/brand/CoordStamp.tsx`,
      `src/pages/__brand/index.tsx` (gated to `import.meta.env.DEV`)._

- [ ] **F8 · Logo refinement.** Touch-up of `src/components/ui/Logo.tsx`
      (existing arc + circle) for the new ratio + ink-only fills (no
      acid, no `currentColor` to acid). Verify the favicon (also generated
      from this primitive) reads as a logical mark at 16 / 32 / 48 px.
      _Modifies: `src/components/ui/Logo.tsx`. Possibly modifies: favicon
      `<link>` in `index.html` if the existing asset still encodes acid._

---

## Core UI — Calling Card (Home, `/`)

- [ ] **C1 · `CallingCard` component.** New `src/components/home/CallingCard.tsx`.
      Renders centred `<Wordmark size="xl" />` + a single mono line below
      `<coords> · <time>` from `NEXT_PIDYOM_SESSION` (mock). Full-viewport
      sized; 100 dvh height. Tabbar suppression already handled by F6.
      Tap target = whole card, role=button, focus ring per token. **Standby
      state** when no upcoming session: card reads `PIDYOM` + `— · —`,
      `aria-disabled`, no press feedback (Q3). Verify dark mode + light
      mode both render with the right pigmented neutrals. _New component.
      Reads: tokens, mock data._

- [ ] **C2 · `HomePage` rebuild.** `src/pages/HomePage.tsx` becomes a
      thin wrapper that mounts `<CallingCard />` and the
      `LetterScrambleReveal` transition target (C5). Strip every
      Barlow/acid trace from this file (RSVP, Focus, Bring, coach note,
      roster all move to the dossier in C6+). Verify: tabbar absent on
      `/`, calling card centred, no horizontal scroll. _Modifies:
      `src/pages/HomePage.tsx` (heavy)._

---

## Core UI — Dossier (`/dossier/:id`)

- [ ] **C3 · Dossier route + data load.** `src/pages/DossierPage.tsx` at
      route `/dossier/:id`. Reads the session id, finds the matching
      record in mock data (will swap to a urql query in a later brief).
      Tabbar suppression already wired in F6. _New component._

- [ ] **C4 · `MassiveDate` primitive.** New
      `src/components/dossier/MassiveDate.tsx`. Source Serif 4 weight 900,
      `font-variation-settings: 'opsz' 60`, `--text-massive-date`,
      `--leading-display`, `--tracking-display`. Renders `dd.MM` with the
      `.` separator in `--ink` (not acid). Optional sub-baseline for time
      block (Source Serif 4 800, `--text-2xl`). Verify legibility at
      mobile 375 px and desktop 1440 px. _New component._

- [ ] **C5 · `LetterScrambleReveal` transition.** New
      `src/components/motion/LetterScrambleReveal.tsx`. Animates a string
      from random characters → resolved string. Random characters are
      drawn from the **same alphabet as the target string** (Latin or
      Cyrillic, never hex / surveillance HUD). Per-character scramble
      uses `--duration-scramble`. Total transition `--duration-page`.
      Respects `prefers-reduced-motion` (collapses to 120 ms cross-fade
      via the token override). Wraps the dossier mount in framer-motion's
      `AnimatePresence`. Verify the transition fires only on Home →
      Dossier (and reverse), not on tab switches. _New component, depends
      on F2._

- [ ] **C6 · Dossier hero block.** Wires C3 + C4 + `<CoordStamp />`
      (F7). Layout: `<MassiveDate />` then time + duration + location-kind
      chip on a baseline below, then location name + coords block with
      hairline `--rule-default` rules above and below. Reads tokens for
      every value; no inline hex. _Modifies: `src/pages/DossierPage.tsx`._

- [ ] **C7 · Dossier mid block — Focus / Bring / CoachNote.** Three
      sub-primitives in `src/components/dossier/`:
        · **`Focus`** — coach prose, Inter weight 400, `--text-md`,
          `--leading-snug`, max-width `--max-prose`.
        · **`BringPills`** — pill row, mono small caps, hairline ink
          border. Coach-authored only; read-only here.
        · **`CoachNote`** — italic Source Serif 4 (`--text-base`,
          `--leading-relaxed`, `--max-prose`), with hairline `--ink-50`
          left rule (1px). The legacy `wk-card` left-rule pattern, but
          ink, not acid.
      All three read tokens; none reach into legacy `--c-*`. _New
      components._

- [ ] **C8 · `RsvpControl` rebuild.** New `src/components/dossier/RsvpControl.tsx`
      replacing the inline RSVP block in the legacy `HomePage`. Three
      states: `going` (filled `--slab` chip + `--slab-text`), `maybe`
      (1px `--ink-50` outline + `--ink` text), `declined` (1px `--ink-22`
      outline + `--ink-65` text). At capacity, the going button reads
      `+ ВАЙТ-ЛИСТ` / `+ WAITLIST` (locale-keyed). Locked state at 1h
      cutoff: all buttons disabled, label shows `LOCKED · HH:mm` in mono.
      No acid anywhere; no glow box-shadow. State persisted to the
      zustand store (mock until backend), Toast confirmation on flip.
      _New component, replaces: legacy RSVP UI in `HomePage.tsx`._

- [ ] **C9 · `Roster` block.** New `src/components/dossier/Roster.tsx`.
      Mono small-caps counts line `7 GOING · 2 MAYBE · 2 WAITLIST`.
      Vertical names list grouped by RSVP state. Coach pinned at top of
      `going` group with a `coach-mark` glyph (mono asterisk by default;
      Phase 6 design review may swap to an asemic dot). Names in Inter
      400 `--text-sm`, ranks in mono. Mock data until backend. _New
      component._

- [ ] **C10 · `CoachGallery` block.** New
      `src/components/dossier/CoachGallery.tsx`. Horizontal scrolling
      strip, one image per viewport width with mono caption below. Coach
      uploads only — for now read-only with mock photo URLs. Lazy-load
      images (`loading="lazy"`). Snap-scroll on mobile. _New component._

- [ ] **C11 · `AttendeeWall` block.** New
      `src/components/dossier/AttendeeWall.tsx`. Grid (3-column on
      mobile, 5-column on desktop) of attendee photos with section
      header `СПІЛЬНОТА` / `COMMUNITY` (i18n-keyed). Visibility-gated:
      renders only when `me ∈ session.attendees` (Q6c + Q6d-i). Empty
      state: hairline ink `+ ADD PHOTO` placeholder for now (upload
      flow ships in a later brief). _New component._

- [ ] **C12 · Past-session variant.** `DossierPage` switches the RSVP
      block (C8) for a single mono CTA `↳ COPY TO MY HISTORY` /
      `↳ ДО МОЄЇ ІСТОРІЇ` when the session is past. Tap stub-logs to
      console (real history clone ships in the Train brief). Past dossier
      also renders the AttendeeWall in non-empty mode using mock past
      photos. _Modifies: `DossierPage`._

- [ ] **C13 · Coach role gating.** Render `RACK PREVIEW` chip strip
      between `BringPills` and `RsvpControl` *only* when `role = coach`
      (read from store). Render the `EDIT` affordance top-right *only*
      when `role = coach && session.coachId === me.id`. Both behind a
      `useRole()` hook so other surfaces reuse. _New: `src/hooks/useRole.ts`,
      `src/components/dossier/RackPreviewStrip.tsx`. Modifies: `DossierPage`._

---

## Interactions & States

- [ ] **S1 · Calling card → dossier transition.** Wires the
      `LetterScrambleReveal` (C5) to navigate from `/` to
      `/dossier/<NEXT_PIDYOM_SESSION.id>` on tap. Reverse scramble on the
      dossier's `↑ HOME` affordance (top-right mono link). Verify mid-
      transition click cancellation does not break navigation. _Modifies:
      `CallingCard`, `DossierPage`._

- [ ] **S2 · Standby tap suppression.** When `NEXT_PIDYOM_SESSION` is
      null, calling card press feedback is suppressed (no scramble, no
      navigation, `aria-disabled` true, no focus ring on hover). Add a
      mock toggle in the dev `__brand` page to flip the standby state for
      manual verification. _Modifies: `CallingCard`._

- [ ] **S3 · RSVP state machine.** Three-way control (C8) talks to the
      store. Cutoff at `session.startsAt - 1h` flips all three to the
      locked state. Capacity at full + tap on `going` enrolls into
      `waitlist`. Auto-promote on a `going → declined` flip is a server
      job in the future; for now expose a dev button in `__brand` that
      simulates promotion + fires a Toast `PROMOTED · YOU'RE GOING`.
      _Modifies: `RsvpControl`, `useStore`._

- [ ] **S4 · Theme toggle wired.** Surface for now lives in the dev
      `__brand` page (real Settings UI ships in the You brief). Three
      buttons `system / paper / void` flip the persisted preference;
      paint flash is gated by F4's `useLayoutEffect`. _Modifies:
      `__brand` page only._

- [ ] **S5 · Language toggle wired.** Same dev surface. Two buttons
      `UA / EN` flip the persisted lang and re-render i18n keys. Verify
      every Home + Dossier surface re-renders correctly in both
      languages. _Modifies: `__brand` page only._

- [ ] **S6 · Auth gate for upcoming dossiers.** Per IA-7 (Rev 03), past
      sessions are public; upcoming require auth. `DossierPage` reads
      `session.startsAt`: if upcoming AND user not authenticated, redirect
      to `/auth?redirect=/dossier/:id`. Past sessions render even when
      unauthenticated. _Modifies: `DossierPage`._

---

## Responsive & Polish

- [ ] **R1 · Mobile layout pass.** Verify the calling card centres at
      375 px / 414 px / 430 px viewport heights. Verify the dossier
      `MassiveDate` does not overflow at 320 px width. Verify the
      tabbar (when visible elsewhere) does not collide with the dossier
      body — but tabbar suppression on dossier is already handled in
      F6, so this is a regression check. Breakpoints: `sm`, `md`.
      _No new files; modifies token consumers as needed._

- [ ] **R2 · Tablet layout pass.** 768 px – 1199 px. Sidebar appears,
      but only on tab routes (suppression list still hides it on Home +
      Dossier). Dossier max-width clamps at 720 px reading width.
      Breakpoint: `md`. _No new files._

- [ ] **R3 · Desktop layout pass.** ≥ 1200 px. `DesktopSidebar` 220 px
      left rail; main content max-width 880 px, centred with editorial
      gutters (`--rail-desktop` 64 px). `MassiveDate` reaches `--text-6xl`
      220 px without breaking. Breakpoint: `lg`, `xl`. _No new files._

- [ ] **R4 · Reduced-motion verification.** Toggle macOS Reduce Motion
      and verify the letter-scramble collapses to a 120 ms cross-fade
      via the `prefers-reduced-motion` token override. Asemic stroke
      draw-on disabled. _Manual verification, no code changes if R4 is
      already token-driven._

- [ ] **R5 · Accessibility pass.**
        · All interactive elements reachable via tab in reading order.
        · Focus ring uses `--shadow-focus` (ink hairline at 2 px offset),
          never the browser default.
        · Calling card announces correctly to a screen reader: `PIDYOM,
          next lift, <date>, <location>, <time>. Tap to open dossier.`
          (`aria-label` keyed to i18n.)
        · `MassiveDate` exposes the resolved string as text, not as an
          image or pseudo-element.
        · Run axe-core / Lighthouse a11y audit; record any failures
          inline as new tasks. _No new files; possible touch-ups across
          C1, C4, C8._

- [ ] **R6 · Lighthouse + bundle pass.** Target Lighthouse Performance
      ≥ 90 mobile, Accessibility = 100. Bundle delta from F1
      (`Source Serif 4` + `Inter` + `Space Mono`) must not exceed
      legacy (Barlow Condensed + Space Mono). Use `font-display: swap`
      and `unicode-range` subsetting if needed. _Modifies: `index.html`._

---

## Review

- [ ] **Design review** — Run the `design-review` skill against the brief.
      Capture screenshots of `/` (paper + void), `/dossier/<upcoming>`
      (paper + void), `/dossier/<past>` (paper + void) at 375 / 768 /
      1280. Output to `.design/pidyom-redesign/screenshots/`. Critique
      against `DESIGN_BRIEF.md` Rev 03 + the Phase 1 + Phase 2 + Phase 3
      decisions ledgers. Address must-fix items before declaring the
      Home + Dossier surface complete.

---

## Backend tasks tracked but NOT scoped here (per brief Out-of-Scope)

> Tracked here for visibility only. Scheduled for the implementation
> plan (Phase 6 of the *design* flow ends with built UI; Hasura
> migrations are a separate plan that follows).

- Hasura schema migrations: `pidyom_sessions`, `session_rsvps`,
  `session_attendances`, `session_photos`, `user_equipment`, plus
  `users.role` column with `member / coach / admin` enum.
- Hasura permission policies enforcing role-based access (member can
  read public past sessions, coach can mutate own sessions, admin can
  override any).
- Mutations + queries via `urql` to replace mock `pidyomSessions.ts`.
- Photo upload pipeline (storage choice deferred — Vercel Blob vs.
  Hasura+S3, decided in the Coach console brief).
- Notifications worker (24h reminders, location-changed alerts,
  waitlist auto-promote toast).

These appear as their own tasks once the corresponding briefs land.

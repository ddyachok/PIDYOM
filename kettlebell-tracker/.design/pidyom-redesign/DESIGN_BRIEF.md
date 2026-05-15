# Design Brief: PIDYOM — Club Companion (Foundation + Home Surface)

> Slug: `pidyom-redesign` · Author: Danylo Dyachok · Date: 2026-04-27 · Rev 03
>
> **Scope:** Brand foundation and the Home → Dossier surface as the reference
> build. Other surfaces (Club, Train, You) follow the same system in
> subsequent briefs.
>
> **Rev 02 changes:** brand colour direction, typography, voice, and motion
> spec re-aligned to the *premium-club / editorial-journal* references the
> founder cited (28 Club, UVU, Lift The Movement). Acid `#C6FF00` retired.
> Barlow Condensed retired. Glyph-cycle motion softened.
>
> **Rev 03 changes:** Heresy.ltd added as a fifth reference. Brand future
> scope expanded from "premium sportswear" to **"editorial-research
> practice that produces apparel *and* a journal."** Colour system pinned to
> **pigmented neutrals** (warm-bone paper, carbon void, stone mids) rather
> than IBM-grey. Voice gains an explicit research register.

## Problem

A small kettlebell club trains together two or three times a week. Today the
practical questions — *when is the next lift, where, who's coming, what should
I bring* — are scattered across messenger groups, voice notes, and a coach's
memory. Members miss sessions because the call goes out in a thread that
scrolls past. New members can't find a recent location pin without scrolling
for ten minutes. The coach can't get a head count before they leave their
apartment.

The friction is not "we need an app." It's **the lift is something we do
together, and the way we coordinate it makes it feel like everyone is
organising it alone.**

## Solution

A field manual for the club. One quiet surface that says *the next lift is
on this date, at these coordinates, at this time.* Tap it, and a fuller
dossier opens — focus, coach note, who's coming, what to bring, photos from
last time.

Solo training stays available — for days when the club doesn't meet, or when
a member can't make it — but it lives one tab away, never on the front door.

The app speaks in editorial restraint, not motivational gradients. Greyscale,
serif display, modern sans body, mono small caps for the technical detail.
The same visual language scales to a hangtag, a lookbook spread, a printed
journal — because the brand will move into apparel, and the app is the first
chapter of that field manual, not a separate aesthetic to discard later.

## Experience Principles

1. **Silence over chrome** — The Home surface does the work of a printed
   flyer pinned to a wall: minimum information, maximum presence. Tabs,
   headers, navigation chrome are removed where they would interrupt the
   gesture.
2. **One commitment per surface** — Each screen has a single thing to do
   (read the next lift; commit; copy a workout to your history). Multi-
   purpose dashboards are anti-brand.
3. **Editorial first, motion second** — The static layout reads like a
   magazine page, not a UI. Motion is reserved for transitions between
   surfaces, used sparingly so each motion event is part of the brand, not
   a fidget.

## Voice Pillars

The brand's writing voice (and by extension, copy decisions) follows three
rules:

1. **Practice over event.** Sessions are entries in a longer practice, not
   one-off events. Copy reflects continuity ("the next lift", "the practice
   resumes") rather than single-event hype.
2. **Composed, not motivational.** No exclamation marks. No "Crush it." No
   streak shaming. No emoji. The voice is that of a coach with twenty years
   under the bar, not a brand intern with a Notion doc of growth tactics.
3. **The body is the project.** Members commit to a practice that reshapes
   them over years — the app's job is to honour that arc, not turn it into
   a badge economy.
4. **Research register.** The brand documents and reflects, not only
   announces. Coach notes, session essays, training philosophy, member
   reflections are first-class content the system anticipates — not
   afterthoughts bolted on. The voice is closer to a quarterly journal
   than to a marketing channel. (Heresy.ltd reference.)

## Aesthetic Direction

- **Philosophy:** *Field Manual.* Editorial-restraint sportswear sensibility.
  The app reads as pages of a field manual a coach hands you on day one of
  the club.

- **Tone:** Composed. Quiet authority. The visual register a high-end
  gallery placard or a published trail-running journal would use, not a
  fitness app.

- **Static reference points (visual):**
  - **28 Club (28club.co.uk)** — austere greyscale running-club brand,
    spacious product layouts, no UI accent colour, lifestyle photography
    carries the mood.
  - **UVU (uvuclub.com)** — premium running apparel; minimalist, elevated,
    disciplined; colour appears only as product variants, never as brand
    emphasis.
  - **Lift The Movement (liftthemovement.com)** — coaching brand whose
    typography pairs **Source Serif 4** (editorial display) with a modern
    sans (Outfit). Sincere, transformation-arc voice. Closest to PIDYOM's
    intended philosophy.
  - **Tracksmith** — run-journal editorial: mono captions, generous
    whitespace, calm authority around a practice. The reference for how
    serif display + modern sans + mono coexist on the same page.
  - **Wallpaper\*** magazine — how to use restraint and a single
    typographic gesture to anchor a calm grid.
  - **Heresy.ltd** — London editorial-research label whose seasonal
    collections sit alongside zine-style essays ("Noise" section). The
    reference for **pigmented neutrals** (warm bones, sages, deep carbon),
    intellectually-reserved voice, and the *editorial-research-as-brand*
    operating model — the brand publishes, not just sells.

- **Motion reference (single, soft):**
  - A *letter-scramble reveal* on Home → Dossier transition. Each character
    cycles only through letters from the **target alphabet** (Latin or
    Cyrillic, matching the resolved string) before settling. No hex, no
    surveillance HUD, no scanlines — those signals do not survive the
    apparel pivot. The reference is editorial type-setting (Wallpaper\* and
    The New York Times Magazine animations), not Watch Dogs ctOS.

- **Anti-references — what this must NOT feel like:**
  - **Strava / Apple Fitness / Whoop** — gamified rings, motivational
    gradients, badges, streak shaming. PIDYOM is the opposite of gamified.
  - **Crossfit-bro aesthetic** — black + red, distressed metal, "BEAST
    MODE" all-caps, hype-cycle fitness branding.
  - **Generic SaaS** — rounded cards, muted neutrals, illustrations of
    diverse cartoon people pointing at charts.
  - **Streetwear / hype graphics** — Supreme box-logo drops, Heron Preston
    industrial overlays, anything that depends on the 2024–25 brutalist-
    flyer trend cycle.
  - **Watch Dogs / ctOS / surveillance HUD** — explicitly retired in
    Rev 02. Hex floods, scanlines, glyph-static were the wrong direction
    for an apparel-bound brand.
  - **Tactical / gamer accent colours** — acid `#C6FF00`, neon orange,
    cyber green. Retired in Rev 02. The brand carries no UI accent colour.

## Brand Future Scope (for grounding)

This brief is informed by the founder's intent to evolve PIDYOM from a club
app into an **editorial-research practice that produces apparel *and* a
journal.** The Tracksmith / UVU / Heresy operating model: the practice is
documented and published; the apparel and the journal are two outputs of
the same brand voice; the app is the membership-facing interface for the
practice itself.

Every aesthetic decision in this document is made under the constraint
that **the visual system must be portable to:**

- A hangtag (1.5 × 3 cm, two-colour print)
- A lookbook spread (full-bleed editorial photography + caption)
- Packaging (kraft tones, mono type, single sticker)
- A **printed journal / zine** (long-form essays, photo essays,
  coach reflections, member portraits)
- A campaign film or seasonal video

…without modification. Decisions that would be cheaper for an app-only
product (heavy in-product motion graphics, trend-dependent surface
treatments, UI accent colours) are explicitly rejected.

The journal is **out of scope as a build** in this brief, but the visual
system anticipates it: typography, neutrals, layout discipline, and voice
are specced so a journal layout inherits the language without rework.

## Colour System

The brand carries **no UI accent colour.** This is the central move in
Rev 02 and the strongest signal of premium-club positioning. Rev 03 pins
the neutrals as **pigmented**, not IBM-grey.

- **Void** — `#0A0A0A`-vicinity — primary background in dark mode. **Warm
  carbon**, not cold black: a hint of warm-brown undertone so it reads as
  ink on heavy stock rather than as an OLED test pattern. Exact value
  pinned in Phase 4.
- **Paper** — `#D5D5CD`-vicinity — primary background in light mode. **Warm
  bone / cream**, a hint of yellow-undertone. Matches the paper warmth of
  28 Club / UVU lookbooks and the dusty-bone palette of Heresy seasonal
  campaigns.
- **Stone** — mid-grey range used for dividers, secondary surfaces, and
  any "card" treatments that are not full void/paper. **Warm stone**, not
  IBM-grey: a hint of green-grey or olive-grey that lives comfortably
  between the warm void and the warm paper.
- **Ink** — the foreground colour: warm-paper-on-void in dark mode,
  carbon-on-paper in light mode. Drives an alpha ramp (renamed in Phase 4
  to `--ink-{04..60}`) for typographic hierarchy and dividers.
- **Photography** carries colour. Apparel colourways (in the future) carry
  colour. **The UI does not.**
- **Functional state colours** — only where unavoidable for accessibility
  (error red, success green). Restricted to validation feedback and never
  used for brand expression. Even those are pulled toward warm/desaturated
  values so they coexist with the neutrals. Specced in Phase 4.

Implication: the existing `--c-accent`, `--c-acid-*`, `--c-accent-glow`
tokens are deleted in Phase 4. Existing components that used them (RSVP
button "going" state, sidebar active indicator, calling-card dot, asemic
accents) re-render in ink + ink-alpha only.

## Typography System

Three-typeface trio — editorial serif + modern sans + mono — pulled directly
from the Lift The Movement / Tracksmith playbook.

- **Display serif (editorial gravity):**
  **Source Serif 4** (Adobe, free, Google Fonts; variable, optical sizes
  8–60, weights 200–900). Used for the dossier hero (massive date),
  section openers, magazine-pull-quote moments. Optical size cranked to
  the upper bound (~60) at large display sizes; lowered to ~8–12 at body
  if used for inline emphasis. Italic available; reserved for editorial
  tension, not casual emphasis.
- **Modern sans (UI body and headlines):**
  **Inter** (free, variable, weights 100–900). Light weight (300–400) for
  body and metadata; regular (500) for UI; semibold (600) for emphasis.
  Replaces all current Barlow Condensed body usage. Inter chosen over
  Outfit for neutrality — Outfit is warmer / friendlier and reads slightly
  closer to consumer-app voice; Inter holds the gallery register better.
- **Mono (technical detail):**
  **Space Mono** kept for coord stamps, RSVP labels, "REV 02" markers,
  capacity counts, the calling-card sub-line, and any string with a
  technical / radio-call-sign quality. Used in small caps in most contexts.

**Barlow Condensed is fully retired in Rev 02.** It is the strongest
brutalist-flyer signifier we still carry; removing it is the single biggest
move toward the premium-club direction.

The PIDYOM wordmark on the calling card recasts as **mono small caps**
(Space Mono) — radio-call-sign quality — rather than display-type-shouting
in Barlow. Detail spec in Phase 4.

## Existing Patterns (codebase scan)

- **Loaded fonts (current):** Barlow Condensed, Space Mono. Rev 02 swaps
  Barlow Condensed → **Source Serif 4** + adds **Inter**. Space Mono stays.
- **Colour tokens (current):** `--c-fg`, `--c-fg-{04..60}` ramp, `--c-accent`
  (`#C6FF00`), `--c-acid-*`, `--c-accent-glow`. Rev 02 keeps the alpha ramp
  (renamed to `--ink-{04..60}`), retires `--c-accent` and all `--acid-*` /
  `--accent-glow`. Backgrounds renamed to `--paper`, `--void`. Detail in
  Phase 4.
- **Spacing** — Tailwind defaults; formalised in Phase 4 as a measured 4 / 8
  scale.
- **Components reused or extended:**
  - `Logo.tsx` — arc + circle mark; refined ratio + weight in Phase 4.
  - `ArcPrimitives.tsx` — `AsemicStroke` reused in Home standby state and
    section dividers; recoloured to ink.
  - `PageTransition.tsx` — replaced/wrapped by the letter-scramble Home →
    Dossier transition.
  - `BottomNav.tsx`, `DesktopSidebar.tsx` — reused but **conditionally
    hidden** on Home and Dossier (per Q-locked decision).
  - `Toast.tsx`, `ErrorBoundary.tsx` — reused as-is.
- **Stack** — React 19, Tailwind v4 (`@tailwindcss/vite`), framer-motion 12,
  zustand 5, urql + graphql-request, recharts. No external UI library —
  vocabulary is owned in-house.

## Component Inventory (Home + Dossier surfaces)

| Component                | Status   | Notes |
|--------------------------|----------|-------|
| `Logo` (mark)            | Modify   | Used at small + large scales; refine ratio. Ink only. |
| `Wordmark`               | New      | Standalone PIDYOM lockup in **Space Mono small caps** (Rev 02). Separate primitive from `Logo`. |
| `CoordStamp`             | New      | Mono one-line "50.4439°N · 30.5108°E" primitive used across surfaces. |
| `CallingCard` (Home)     | New      | Wordmark + coords + time. Standby state shows `— · —`. Tap dispatches the dossier transition. |
| `LetterScrambleReveal`   | New      | Home → Dossier reveal. Each character cycles through letters from its target alphabet (Latin / Cyrillic) before resolving. ~600–900ms total. Replaces the earlier "GlyphCycleTransition" spec. |
| `Dossier` (page)         | New (replaces current `HomePage`) | Holds: massive date (Source Serif 4), time, location, focus, bring, coach note, RSVP, roster, coach gallery, attendee wall. |
| `MassiveDate`            | New      | Editorial display block — **Source Serif 4 Black, optical size 60**, set tight. Replaces the Barlow Condensed 900 version. |
| `RsvpControl`            | Modify   | Three-way `Я ЙДУ / МОЖЛИВО / НЕ ЗМОЖУ`. Ink-only states; the "going" highlight is a 1px ink rule + filled chip in `ink-95`, no acid. Locked state at 1h cutoff. Waitlist mode when capacity full. |
| `Roster`                 | New      | Names list grouped by `going / maybe / waitlist`, coach pinned. Sans body, mono numerals. |
| `CoachNote`              | Modify   | Hairline left rule **in ink** (no acid), Source Serif 4 italic body, max-width measure (~60ch). |
| `BringPills`             | Modify   | Pill row, mono small caps, hairline ink border. Coach-authored only. |
| `RackPreviewStrip`       | New      | Coach-only chip row showing aggregated rack of `Я ЙДУ` members. Mono numerals. |
| `CoachGallery`           | New      | Curated horizontal photo strip, coach uploads only. Editorial sizing — one image per viewport width with a mono caption. |
| `AttendeeWall`           | New      | Grid of attendee photos, gated by attended status. |
| `BottomNav` / `DesktopSidebar` | Modify | Visibility rule: hidden on Home + Dossier; visible on Club / Train / You. Active indicator becomes a 1px ink rule, not an acid bar. |
| `ThemeToggle`            | Modify   | Lives in Profile only; removed from sidebar. |
| `LangToggle` (UA / EN)   | New      | Lives in Profile. App copy fully bilingual from day one. |

## Key Interactions

### Home — Calling Card
- The user opens the app and lands on a near-empty surface: `PIDYOM`
  wordmark in mono small caps centred, `<coords> · <time>` line below in
  mono. Negative space dominates. No tabbar, no top stripe, no chrome.
- Tap anywhere on the card → letter-scramble transition begins. The
  wordmark and coord/time line cycle through letters from their target
  alphabet (Latin or Cyrillic, matching the resolved string) for 350–500ms,
  then resolve in place into the dossier's massive date and location title.
  The transition acts as the page change — no separate routing animation.
- If no upcoming session: card reads `PIDYOM` + `— · —`. Card is
  non-tappable (suppress press feedback).

### Dossier — Session Detail
- Opens from the calling-card transition. Tabbar remains hidden so the
  dossier reads as a continuous editorial spread, not a tab page.
- Top region: **Source Serif 4 Black** massive date `dd.MM` set tight, the
  separator `.` an editorial dot in ink (not acid). Time block on the next
  baseline in Source Serif 4 800. Location name + coords as the third
  block, separated by hairline ink rules.
- Mid region: coach-authored `Focus` (sans, regular), `Bring` chips (mono
  small caps), optional `Coach Note` with hairline ink left-rule and
  Source Serif 4 italic body.
- Lower region: RSVP three-way control. The "going" state is a filled chip
  in `ink-95` with paper text — a high-contrast slab, not a colour.
  Disabled state shows `LOCKED · HH:mm` in mono. When at capacity, the
  `Я ЙДУ` button label flips to `+ ВАЙТ-ЛИСТ` / `+ WAITLIST`.
- Roster strip below: `7 GOING · 2 MAYBE · 2 WAITLIST` count line in mono
  small caps, then a vertical names list in sans. Coach pinned at top with
  a coach-mark glyph (mono asterisk or asemic dot — specced in Phase 4).
- For coach role: an extra `RACK PREVIEW` chip strip is rendered between
  `Bring` and RSVP — aggregated kettlebell counts of all `Я ЙДУ` members.
- Coach gallery (horizontal scroll) below the roster. Editorial sizing —
  one image per viewport width with a mono caption.
- Attendee wall (grid) at the bottom, visible only to confirmed attendees.
- Back to Home: a single mono `↑ HOME` affordance top-right; tapping
  reverses the letter-scramble.

### Past Session Dossier (variant)
- Same layout, but RSVP control is replaced by a single mono CTA:
  `↳ COPY TO MY HISTORY`. Tapping inserts a new entry into the user's solo
  history (clones the attached structured workout if one exists; otherwise
  inserts a note-only entry).

### Standby (no session)
- Calling-card variant only. Tap is suppressed. App still routable via
  tabs once the user navigates to Club / Train / You.

## Responsive Behavior

- **Mobile (< 768 px)** — primary target. Calling card is full-viewport;
  massive date in dossier scales `clamp(96px, 18vw, 220px)`. Tabbar (when
  visible) is `BottomNav` at the foot.
- **Tablet (768–1199 px)** — same single-column layout, content max-width
  ~720 px, generous side margins. Tabbar (when visible) becomes
  `DesktopSidebar`.
- **Desktop (≥ 1200 px)** — content max-width 880 px, centred. Wordmark
  and massive date scale up further but never become the page-width hero
  (whitespace > content). `DesktopSidebar` visible on Club / Train / You.

No layout changes are mode-conditional beyond what's listed.

## Accessibility Requirements

- **Contrast** — minimum **4.5:1** for body copy, **3:1** for the massive
  display type. The void/paper × ink pairing exceeds both thresholds at
  every weight.
- **Colour-not-only-carrier** — since the brand has no UI accent colour
  (Rev 02), every signal is already carried by typography, weight, rule,
  or position. The "going" state, the active tab, the locked button — all
  use slab + weight + rule, never a colour-only cue.
- **Keyboard** — calling card tap target is a button with visible focus
  ring (1.5 px ink hairline at 2 px offset). All buttons in the dossier
  reachable via tab order; focus order matches reading order.
- **Screen reader** — the calling card announces `PIDYOM, next lift,
  <date>, <location>, <time>. Tap to open dossier.` The letter-scramble
  transition is decorative and respects `prefers-reduced-motion`,
  collapsing to a 120 ms cross-fade.
- **Reduced motion** — `prefers-reduced-motion: reduce` collapses the
  scramble to a cross-fade and disables the asemic stroke draw-on.
- **Localisation** — all visible copy is keyed (UA + EN). Date/time
  formats follow locale; coord format stays universal.
- **Focus rings** — never default browser; always custom ink hairline at
  1.5 px / 2 px offset.

## Out of Scope (this brief)

- Build of Club, Train (Today / Plan / Progress sub-views), and You
  surfaces — separate briefs once Home + Dossier are landed.
- Backend schema migrations (`pidyom_sessions`, `session_rsvps`,
  `session_attendances`, `session_photos`, `user_equipment`) — covered in
  the implementation plan, not the design.
- Equipment onboarding wizard — separate brief once Profile surface is
  designed.
- Coach administration screens — separate brief.
- Photo upload UI and storage choice — implementation decision, deferred.
- Notifications — deferred to post-MVP.
- Apparel surfaces (lookbook, shop, journal) — out of scope as product,
  but the visual system in this brief is built so they can inherit it
  without rework.

## Decisions Ledger

For traceability — every decision below is encoded in this brief.

### Phase 1 — Grill Me

| # | Decision |
|---|---|
| 1 | Club-first; Train as peer tab (escape hatch for solo). |
| 2 | Train consolidates Workouts + Schedule + Progress as internal sub-nav. |
| 3 | No-session standby on Home = `PIDYOM` + `— · —`, non-tappable. |
| Home | Calling card only: wordmark + coords + time. Tabbar hidden on Home + Dossier. Tap → letter-scramble transition to Dossier. |
| 4a | RSVP locks 1h before session start. |
| 4b | Free flips until cutoff. |
| 4c | Roster shows count + names; coach pinned. |
| 4-label | UA: `Я ЙДУ` / `МОЖЛИВО` / `НЕ ЗМОЖУ`. EN: `I'M GOING` / `MAYBE` / `CAN'T MAKE IT`. |
| 5 | Capacity full → waitlist with auto-promote. Locks at cutoff. |
| 6a | Coach owns own sessions; admin can override any. |
| 6b | Coach can RSVP a member on their behalf (logged). |
| 6c | `Я ЙДУ` = auto-attended. Coach edits exceptions. |
| 6d | Coach gallery (curated) + attendee wall (community section in dossier, gated by attended). |
| 7 | Coach attaches optional structured workout template; copy clones to solo history. Note-only fallback. |
| 8a | Personal rack declared once, edited in Profile. |
| 8b | Coach sees RSVP-filtered rack preview per session. |
| 9 | Void (`#0A0A0A`) is the unknown-system theme fallback. |
| 10 | UA + EN bilingual, full-app from day one. |

### Phase 2 — Aesthetic (Rev 02 + Rev 03)

| # | Decision |
|---|---|
| A1 | Philosophy = *Field Manual.* Editorial-research practice that produces apparel *and* a journal (Rev 03). |
| A2 | Brand voice pillars: practice over event; composed not motivational; the body is the project; **research register** (Rev 03 — Heresy reference). |
| A3 | Static visual references: 28 Club, UVU, Lift The Movement, Tracksmith, Wallpaper\*, **Heresy.ltd** (Rev 03). |
| A4 | Brand carries **no UI accent colour**. Acid `#C6FF00` retired. Colour enters via photography (and, later, apparel colourways). |
| A4b | Neutrals are **pigmented**, not IBM-grey: warm carbon void, warm-bone paper, warm-stone mids (Rev 03). |
| A5 | Type trio: **Source Serif 4** (display) + **Inter** (body / UI sans) + **Space Mono** (technical detail). |
| A6 | Barlow Condensed retired. PIDYOM wordmark recast as Space Mono small caps. |
| A7 | Watch Dogs / ctOS direction retired. Transition softened to a *letter-scramble* within the target alphabet. Editorial type-setting reference, not surveillance HUD. |
| A8 | Theme: system-aware first; void fallback when system pref is unknown. |
| A9 | Brand future scope = **apparel + journal/zine**, not apparel alone (Rev 03). The visual system is portable to a printed journal layout without rework. |

# Information Architecture: PIDYOM — Club Companion

> Slug: `pidyom-redesign` · Date: 2026-04-27 · Rev 01
>
> Companion to `DESIGN_BRIEF.md`. Defines the structural skeleton of the app:
> routes, navigation, page priorities, user flows, naming, and growth.
>
> All decisions in this document trace to a Phase 1 grill answer or a Phase 3
> IA answer. Where one of them defines the structure, the source is cited
> inline.

## Site Map

Real URL routes via `react-router-dom v7` (already in dependencies). Tab-state
is dropped — every screen is addressable. (IA-1 → B.)

```
/                                 Calling Card (Home, no tabbar)
/dossier/:id                      Session Dossier (no tabbar; gated for upcoming, public for past — IA-7 → C)
/dossier/:id/edit                 Coach: edit-mode of dossier (in-place, IA-3 → B)

/club                             Club tab — past sessions index + roster + practice stats (IA-2 → B)
/club/new                         Coach: create new session (in-place form, IA-3 → B)

/train                            Train tab — redirects to /train/today
/train/today                      Today (active or upcoming solo workout)
/train/today/active/:workoutId    Solo workout-in-progress (full-screen takeover, no tabbar — IA-6 → C)
/train/plan                       Plan (A/B split schedule grid)
/train/progress                   Progress (charts, PRs, attendance streaks)

/you                              Profile tab — Profile sub-view (IA-4 → B)
/you/profile                      Profile (name, avatar, role, equipment rack, attendance history) — default
/you/settings                     Settings (theme, language, notifications, sign out)

/auth                             Sign in / sign up (Better Auth via Neon)
/auth?redirect=/dossier/:id       Auth with deferred redirect (IA-7 fallback for private dossiers)
```

## Navigation Model

### Primary navigation — bottom tabbar (mobile) / sidebar (desktop)

Four tabs only. Renders on `/club`, `/train/*`, `/you/*`. Hidden on `/`,
`/dossier/*`, `/train/today/active/*`, and `/auth`.

| # | Tab   | Route prefix     | Icon                     |
|---|-------|------------------|--------------------------|
| 1 | HOME  | `/`              | (none — wordmark anchor) |
| 2 | CLUB  | `/club`          | arc-mark                 |
| 3 | TRAIN | `/train`         | dumbbell                 |
| 4 | YOU   | `/you`           | user                     |

(Decisions Q1, Q2, Home-tabbar from the brief.)

The HOME tab in the bottom nav, when visible (i.e. on Club/Train/You), routes
back to `/`. There is no "Home tab" rendered while *on* Home — the user is
already there, the bar is suppressed.

### Secondary navigation — sub-tabs

- **Train**: horizontal sub-tabs `Today / Plan / Progress` (per Q2). Mono
  small caps. Active state = ink underline + ink-95 label; inactive =
  ink-45 label.
- **You**: horizontal sub-tabs `Profile / Settings` (IA-4 → B).
- **Club**: no sub-tabs — single editorial scroll (next-session card, then
  past-sessions index, then practice stats footer).

### Utility navigation

- Sign out → `/you/settings` (only).
- Theme toggle → `/you/settings`.
- Language toggle (UA / EN) → `/you/settings`.
- "Set up your rack" prompt → `/you/profile` (soft banner, IA-5 → C).
- Coach controls (create session, edit, mark attendance, upload photo) →
  contextual buttons on the relevant screen (IA-3 → B). No separate
  /coach surface.

### Mobile navigation

Bottom tabbar at `safe-bottom`, height 56 px. Hidden on:
- `/` — calling card lives full-viewport.
- `/dossier/*` — dossier reads as continuous editorial spread.
- `/train/today/active/*` — workout-in-progress is a commitment takeover.
- `/auth` — auth flow is its own surface.

Visible on every other route. The brief's "silence over chrome" principle
drives the suppression list.

### Desktop navigation

`DesktopSidebar` (220 px) renders left of `<main>` on viewports ≥ 768 px.
Same suppression list as mobile. Sidebar mirrors bottom-tab order, plus a
footer with Settings shortcut (theme/lang) and the wordmark.

## Content Hierarchy

For each major page, content priority from top to bottom. (Layout intent —
visual specifics live in Phase 4 + 6.)

### `/` — Calling Card

1. **Wordmark `PIDYOM`** (Space Mono small caps) — anchors the surface.
2. **Coords + time** in mono, on the next baseline. The single piece of
   information.
3. **Tap target** (the whole surface) — invisible affordance into the
   dossier.

Standby state (no upcoming session): `PIDYOM` + `— · —`. Tap suppressed.
(Q3.)

### `/dossier/:id` — Session Dossier

1. **Massive date** `dd.MM` — Source Serif 4 Black, optical 60.
2. **Time** + duration + location-kind chip — second baseline, sans/serif
   mix per Phase 4.
3. **Location name + coords** — third block, hairline rule above and below.
4. **Focus** (coach prose).
5. **Bring** (mono pills, coach-authored).
6. **Coach Note** (italic serif, hairline ink left rule).
7. **(Coach role only) Rack preview chip strip** (Q8b).
8. **RSVP control** — `Я ЙДУ / МОЖЛИВО / НЕ ЗМОЖУ`, with capacity / waitlist
   / locked states (Q4, Q5, Q6b).
9. **Roster** — counts line + names list, coach pinned (Q4c).
10. **Coach gallery** — horizontal scroll, editorial sizing (Q6d).
11. **Attendee wall** — grid, gated to confirmed attendees only (Q6d-i).
12. **`↑ HOME` affordance** — top-right; reverses the letter-scramble.

Past-session variant: same hierarchy, but block 8 (RSVP) is replaced by a
single CTA `↳ COPY TO MY HISTORY`. Attendee wall remains visible to that
session's attendees only. Coach controls (edit / upload photo) appear at
the dossier head when `role = coach && session.coachId = me`.

### `/club` — Club tab

1. **Next session preview** — small dossier card linking to `/dossier/:id`.
2. **Past sessions index** — vertical mono list, descending date,
   thumbnail (first photo from coach gallery) + dd.MM + location +
   attended-count. Tap → `/dossier/:id`. (IA-2 → B.)
3. **Practice stats footer** — mono read-only cell row: total sessions
   this quarter, attendance rate, latest coach essay link (when journal
   surface ships, currently placeholder).
4. **(Coach role only) `+ NEW SESSION` button** at the top, opens
   `/club/new`. (IA-3 → B.)

### `/train/today`

1. **Today's source line** — "From your A-week plan" or "Copied from
   2026-04-19 club lift".
2. **Workout title + focus** + duration estimate.
3. **Exercise list** — exercise name, target sets × reps, weight, rest.
4. **`▶ START WORKOUT`** primary action — routes to
   `/train/today/active/:workoutId`.
5. **Last logged session for this template** (if any) — collapsed by default.

### `/train/today/active/:workoutId` — Workout-in-progress (takeover)

Full-screen, no tabbar. (IA-6 → C.)

1. **Current exercise** — name, target sets × reps, weight.
2. **Set logger** — large tap targets for set N, weight, reps, rest timer.
3. **Progress strip** — N of M sets done in this exercise, N of M
   exercises done in this workout.
4. **Rest timer** — auto-starts on set log.
5. **`✕ END WORKOUT`** — top-right; confirmation dialog → save → back to
   `/train/today`.

### `/train/plan`

1. **Current week label** ("WEEK A · 2026-W17") — mono.
2. **Mon–Sun column** — each day shows the scheduled template (or a `—`).
3. **A/B split toggle** — coach-defined, member-overridable.

### `/train/progress`

1. **Streak strip** — sessions completed in last 4 weeks (mono).
2. **PR table** — top weight × reps per primary lift.
3. **Volume chart** — per-week kg × reps total.
4. **Attendance** — club sessions attended / scheduled, last 12 weeks.

### `/you/profile`

1. **Name + avatar + role badge** (member / coach / admin) + sign-out…
   *(Sign-out lives in Settings only — see IA-4.)*
2. **Equipment rack editor** — list of `(weight kg, count)` rows, add/remove.
3. **Attendance history** — vertical list of last 12 sessions, link to each
   dossier.
4. **Solo training stats** — N sessions this quarter, N kg lifted, etc.
5. **Soft prompt banner** — "Set up your rack →" only renders if rack is
   empty (IA-5 → C).

### `/you/settings`

1. **Theme** — system / paper / void.
2. **Language** — UA / EN.
3. **Notifications** — toggles for: new session posted, location changed,
   waitlist promoted, 24h reminder. (Wire stubs in MVP, real send post-MVP.)
4. **About PIDYOM** — single paragraph in Source Serif 4 italic — the
   brand voice anchor. Mono build version below.
5. **Sign out** — single mono button at the bottom.

## User Flows

### Flow A — Member, normal day, RSVP'ing

1. Member opens `/`.
2. Calling card shows wordmark + coords + time.
3. Member taps the card. Letter-scramble transition resolves into the
   dossier at `/dossier/:id`.
4. Member reads focus, bring list, coach note, roster.
5. Member taps `Я ЙДУ`. Button highlights to ink-95 chip; counts line
   updates `7 → 8 GOING`.
6. Member taps `↑ HOME`. Reverse scramble → calling card.

### Flow B — Member, capacity full, joining waitlist

1. Member opens `/dossier/:id`.
2. RSVP `Я ЙДУ` button label reads `+ ВАЙТ-ЛИСТ` / `+ WAITLIST`.
3. Member taps it. Roster gains a "WAITLIST" subgroup with their name.
4. (Later, server-side) someone flips to `НЕ ЗМОЖУ`. Member is auto-promoted.
   Toast (mono): `PROMOTED · YOU'RE GOING`.

### Flow C — Member, after the cutoff

1. Member opens `/dossier/:id` 30 min before the session.
2. RSVP buttons disabled. Label: `LOCKED · 17:30` in mono.
3. Roster still readable.
4. Member taps `↑ HOME` and walks to the park.

### Flow D — Member, post-session, copying workout to history

1. Member opens `/dossier/<past-id>` (link shared by coach in messenger).
2. (Public; auth not required, IA-7 → C.) Member sees the past dossier
   with a `↳ COPY TO MY HISTORY` CTA.
3. If unauthenticated → `/auth?redirect=/dossier/<past-id>`. After login,
   continues.
4. Member taps the CTA. Workout cloned into solo history. Toast:
   `COPIED · 2026-04-15 · GOBLET LADDER`.
5. Workout is now visible at `/train/today` (if today is its scheduled
   slot) or `/train/progress` (history).

### Flow E — Coach, creating a session

1. Coach lands on `/club`. Sees `+ NEW SESSION` at the top (rendered
   because `role = coach`).
2. Tap → `/club/new` form: date, time, duration, location, focus, bring,
   capacity, optional `coach note`, optional structured workout template
   picker (Q7).
3. Submit → server creates session row. Redirect to
   `/dossier/<new-id>/edit`.
4. Coach uploads photos (still empty until session has happened) and
   confirms. The session is now live and visible to all members.

### Flow F — Coach, editing a dossier in place

1. Coach lands on `/dossier/:id`. The same dossier any member sees, but
   with an inline `EDIT` affordance top-right.
2. Tap → `/dossier/:id/edit`. The fields turn editable in place — no
   separate page (IA-3 → B). The mono `EDIT` toggles to `SAVE`.
3. Save → mutation; revert URL to `/dossier/:id`.

### Flow G — New member, first run

1. Sign up at `/auth`. Better Auth creates user; default role = `member`.
2. Redirect to `/`. Calling card shows next session.
3. Member opens dossier; sees soft prompt at the top of `/you/profile`
   ("Set up your rack →"). No forced wizard (IA-5 → C).
4. Member completes rack at their own pace; banner disappears once
   rack is non-empty.

### Flow H — Member starts a solo workout

1. `/train/today` shows the day's scheduled workout.
2. Tap `▶ START WORKOUT`. Routes to `/train/today/active/:workoutId`,
   tabbar disappears.
3. Log sets. Rest timer auto-runs.
4. Tap `✕ END WORKOUT`. Confirm. Workout saved; routes back to
   `/train/today`.

### Flow I — Coach, marking attendance edits post-session

1. After session ends (server-side timestamp passed), the dossier shifts
   into "post" mode. RSVP control hidden.
2. Roster names shift to attendance view: every `Я ЙДУ` row is shown
   `ATTENDED` by default (Q6c).
3. Coach taps `EDIT` (top-right). Each row gets a toggle (`ATTENDED ↔
   NO-SHOW`). Names not on the RSVP list can be added inline (Q6b).
4. Save. Attendance is the source of truth; member's `/train/progress`
   updates accordingly.

## Naming Conventions

One word per concept, used consistently. UA + EN keys both committed in
day-one i18n.

| Concept                        | UI label (EN)              | UI label (UA)              | Notes |
|--------------------------------|----------------------------|----------------------------|-------|
| Brand wordmark                 | `PIDYOM`                   | `ПІДЙОМ`                   | Mono small caps, never lower-case. |
| A scheduled lift event         | `session`                  | `сесія`                    | Internal: `pidyom_sessions` table. |
| The detail page for one session| `dossier`                  | `досьє`                    | Carries the editorial framing. |
| Tap-into-the-app surface       | calling card               | (UI: no label; the surface itself) | Internal name only — not user-facing. |
| Member commits to attending    | `I'M GOING`                | `Я ЙДУ`                    | Code: `rsvp = 'going'`. |
| Member uncertain               | `MAYBE`                    | `МОЖЛИВО`                  | Code: `rsvp = 'maybe'`. |
| Member declines                | `CAN'T MAKE IT`            | `НЕ ЗМОЖУ`                 | Code: `rsvp = 'declined'`. |
| Group of all RSVPs             | `ROSTER`                   | `СКЛАД`                    | Mono small caps, the names list block. |
| Capacity overflow holding pen  | `WAITLIST`                 | `ВАЙТ-ЛИСТ`                | Latin in UA — kept as a transliteration. |
| Coach's pinned session message | `COACH NOTE`               | `НОТАТКА ТРЕНЕРА`          | Italic serif, hairline left rule. |
| Member's owned kettlebells     | `RACK`                     | `СТІЙКА`                   | Code: `user_equipment` table. |
| Coach's preview of the room    | `RACK PREVIEW`             | `СТІЙКА · ПОПЕРЕДНЯ`       | Coach-only, on the dossier. |
| Curated session photos         | `GALLERY`                  | `ГАЛЕРЕЯ`                  | Coach uploads only. |
| Member-uploaded session photos | `COMMUNITY`                | `СПІЛЬНОТА`                | Attendee wall section. |
| Solo workout                   | `WORKOUT`                  | `ТРЕНУВАННЯ`               | Code: `workouts` table. |
| Solo training tab              | `TRAIN`                    | `ТРЕНУВАННЯ`               | Singular tab label. |
| Tonnage / volume               | `VOLUME`                   | `ОБСЯГ`                    | kg × reps. |
| Personal best                  | `PB`                       | `РЕКОРД`                   | Mono. Never "PR" (initial collision with "Pull Request" in support tickets). |
| Sign-out action                | `SIGN OUT`                 | `ВИЙТИ`                    | Settings only. |

Negative vocabulary — words explicitly **not** used:
`Dashboard`, `Feed`, `Stream`, `Crush`, `Goal`, `Streak` (verb form), `Beast`,
`Mode`, `Boost`, `Drop`, `Hype`. Counter-brand.

## Component Reuse Map

Structural components shared across pages.

| Component             | Used on                                             | Behaviour differences |
|-----------------------|-----------------------------------------------------|----------------------|
| `RootLayout`          | every route                                         | Applies theme + lang; renders `Sidebar` + `<Outlet>` + `BottomNav`. Both nav bars are conditionally hidden by route. |
| `BottomNav`           | `/club`, `/train/*` (except `/train/today/active`), `/you/*` | Hidden on `/`, `/dossier/*`, `/train/today/active/*`, `/auth`. |
| `DesktopSidebar`      | viewports ≥ 768 px, same routes as `BottomNav`      | Same suppression as `BottomNav`. |
| `Logo` (arc + circle) | `/` (small), `/dossier/*` (watermark), sidebar      | Watermark variant at 6% opacity, large size. |
| `Wordmark`            | `/`, `/auth`                                        | Mono small caps; sized to viewport on `/`, fixed in header on `/auth`. |
| `CoordStamp`          | `/`, `/dossier/*`                                   | Universal `dd.dddd°N · dd.dddd°E` format. |
| `LetterScrambleReveal`| `/` ↔ `/dossier/*` transitions                      | Reverses on back-navigation. |
| `RsvpControl`         | `/dossier/:id` (upcoming only)                      | Capacity/locked/waitlist states. |
| `Roster`              | `/dossier/*`                                        | Pre-session = RSVP groups. Post-session = attendance toggles (coach only). |
| `BringPills`          | `/dossier/*`                                        | Read-only for members; editable in `/dossier/:id/edit`. |
| `CoachNote`           | `/dossier/*`                                        | Same pattern in member + coach modes. |
| `CoachGallery`        | `/dossier/*`                                        | Editable in `/dossier/:id/edit`. |
| `AttendeeWall`        | `/dossier/*` (post-session only, for attendees)     | Visible iff `me ∈ attendees`. |
| `MassiveDate`         | `/dossier/*`                                        | One per dossier. |
| `RackPreviewStrip`    | `/dossier/:id` (coach view of upcoming sessions)    | Rendered iff `role = coach`. |
| `SubTabs`             | `/train`, `/you`                                    | Same primitive, different items. |
| `EditAffordance`      | `/dossier/:id`, `/club`                             | Top-right `EDIT` / `+ NEW SESSION` button, gated on role. |
| `Toast`               | global                                              | Existing component reused. |
| `ErrorBoundary`       | wraps `<Outlet>` in `RootLayout`                    | Existing component reused. |

## Content Growth Plan

### What grows

- **Past sessions** — accumulate at ~2/week. After ~6 months, the
  `/club` index has 50+ entries.
  - **Pattern:** Group by month. Each month is a mono header
    (`2026 · APR`). Within the month, descending list. Lazy-load past
    24 months on first paint; older months loaded on demand.
  - **Search / filter** — *deferred*. Until the index passes ~200
    entries the editorial scroll is the right interaction. When it
    crosses, add a `FILTER · LOCATION · COACH · YEAR` mono row.
  - **Archive** — past sessions older than 24 months are reachable via
    `/club?year=2024` (URL-driven), not in the default scroll.

- **Member's solo workouts** — accumulate at member's own pace.
  - **Pattern:** Already partly handled in the legacy
    `WorkoutsPage`. Re-skinned in Phase 6, paginated by month.
  - **Progress charts** — `recharts`, already installed; range selector
    `4W / 12W / YEAR / ALL`.

- **Equipment rack** — small (3–6 rows typical). Static editor.

- **Photos (coach gallery + attendee wall)** — could grow large per
  session. Per-session capped at ~12 coach photos / ~24 attendee photos
  in MVP. Storage choice deferred.

- **Future: journal essays / coach reflections** — out of scope for
  build, but the route `/journal` and the listing pattern (mono index,
  descending date, large editorial body) will mirror `/club`'s
  past-sessions pattern. Designing now so it inherits the system.

### What does not grow (mostly)

- **Tabs** — fixed at 4. New surfaces enter as routes inside an existing
  tab, never as a 5th tab.
- **Roles** — three: member / coach / admin. Coach controls are
  contextual; admin overrides any session.
- **Settings options** — minimal: theme, language, notifications, about,
  sign out. New settings need explicit justification before being added.

## URL Strategy

### Pattern

`/<surface>` for primary tabs.
`/<surface>/<resource>` for resource pages.
`/<surface>/<resource>/<id>` for resource detail.
`/<surface>/<resource>/<id>/<action>` for resource sub-action (edit,
active, etc.).

All paths are kebab-case in URLs. UI labels stay in mono small caps.

### Dynamic segments

| Segment           | Source                              |
|-------------------|-------------------------------------|
| `:id` (session)   | `pidyom_sessions.id` (uuid).        |
| `:workoutId`      | `workouts.id` (uuid).               |

Sessions are referenced **by uuid only**, not by date — multiple
sessions per day are possible in the future, dates aren't unique.

### Query parameters

| Param                    | Used on                  | Purpose |
|--------------------------|--------------------------|---------|
| `?redirect=<path>`       | `/auth`                  | Deferred destination after sign in (Flow D). |
| `?year=YYYY`             | `/club`                  | Archive view of older past sessions. |
| `?range=4w` / `12w` / `y`| `/train/progress`        | Chart range selector. |
| `?lang=ua` / `en`        | any                      | Override locale (debug / share); persists to user profile if signed in. |

No query parameters for filtering, sorting, or pagination in MVP — those
arrive only when content volume demands them (see Content Growth Plan).

## Decisions Ledger — Phase 3

| # | Decision |
|---|---|
| IA-1 | Adopt real URL routing via `react-router-dom`. Tab-state is dropped. |
| IA-2 | Past sessions index lives in the `/club` tab. |
| IA-3 | Coach controls are contextual (in-place edit on the dossier; `+ NEW SESSION` button on `/club`). No separate `/coach` surface. |
| IA-4 | Profile is split into two sub-pages: `/you/profile` and `/you/settings`. |
| IA-5 | Equipment onboarding is a soft, dismissible banner on `/you/profile` — never a forced wizard. |
| IA-6 | Solo workout-in-progress is a full-screen takeover at `/train/today/active/:workoutId` (no tabbar). |
| IA-7 | Past-session dossiers are public; upcoming dossiers require auth. Auth deferred-redirect supports the public-link flow. |

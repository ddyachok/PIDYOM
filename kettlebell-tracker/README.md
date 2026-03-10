# PIDYOM — Kettlebell Tracker

> **PIDYOM** — *Progressive Intelligent Daily Your Own Movement* — a minimalist, monospace-aesthetic kettlebell & bodyweight training tracker.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Animations | Framer Motion |
| State | Zustand v5 (persist middleware → localStorage) |
| Auth | Neon Auth (`@neondatabase/neon-js`) |
| Database | Hasura DDN v3 + Neon PostgreSQL (GraphQL sync) |
| Charts | Recharts |
| Date utils | date-fns |

---

## Pages

| Route (tab) | Page | Description |
|---|---|---|
| `home` | **HOME** | Today's mission — shows scheduled or ad-hoc workout for today, or rest-day fallback |
| `workouts` | **WORKOUTS** | Active workout builder: add exercises, log sets, complete sessions |
| `schedule` | **MATRIX** | Monthly calendar: plan workouts, view scheduled & ad-hoc WODs, export to Google Calendar |
| `progress` | **TREES + VOLUME + GRID** | Three-panel progress view — exercise progression trees, weekly volume chart, 28-day heatmap |
| `profile` | **PROFILE** | User name, equipment setup, theme toggle (dark / light) |

---

## Features

### Workouts
- Create workouts from scratch or via scheduled entries
- 49 exercises across 7 movement patterns: `hinge`, `squat`, `push`, `pull`, `carry`, `core`, `flow`
- Exercise categories: `ballistic`, `grind`, `hybrid`
- Equipment filter: kettlebell, rings, rope, bodyweight, pull-up bar, parallettes, resistance band
- Log sets with weight, reps, RPE, notes; toggle individual sets complete
- Mark workout complete when all sets are logged

### Schedule (MATRIX)
- Monthly calendar view with Mon–Sun grid
- Plan workouts by type: **A** (Strength & Control) / **B** (Conditioning & Power)
- Ad-hoc workouts (added outside schedule) appear on the calendar with a **WOD** tag
- AUTO-schedule: generates 4 weeks of A/B splits starting next Monday
- Google Calendar export for any scheduled day
- Tap any day → selected-day panel shows workout info + Start / View / Continue action

### Progress
- **TREES** — Inline progression tree per exercise; tap to expand, unlock next level
- **VOLUME** — Weekly volume bar chart (last 8 weeks) with tooltip showing set × rep × weight breakdown
- **GRID** — 28-day calendar heatmap; volume fill rises from cell bottom; today badge; month labels; BEST WEEK / AVG / TOTAL stats

### Profile
- User name editing (synced to DB)
- Equipment selection (drives exercise availability)
- Dark / light theme toggle

### Auth
- Neon Auth — GitHub & Google OAuth + email/password
- Auth-gated: all pages behind sign-in wall
- Session syncs to Zustand store; profile hydrated from Hasura on login

---

## Design System

- **Background**: `#0A0A0A` dark / `#E8E8E1` cream light
- **Accent**: `#C6FF00` (acid-green)
- **Font**: Space Mono (monospace) + Barlow Condensed (headings)
- Utility classes: `.card`, `.tag`, `.btn`, `.btn-ghost`, `.btn-full`, `.btn-sm`, `.btn-solid`, `.btn-acid`, `.section-label`, `.page-title`, `.page`, `.divider`, `.modal-backdrop`, `.modal-panel`
- Layout: desktop sidebar (220px, ≥768px) / mobile bottom nav (<768px); main content max 720–880px

---

## Project Structure

```
src/
├── pages/
│   ├── AuthPage.tsx         # Sign in / sign up
│   ├── HomePage.tsx         # Today's mission
│   ├── WorkoutsPage.tsx     # Workout builder + exercise log
│   ├── SchedulePage.tsx     # MATRIX calendar
│   ├── ProgressPage.tsx     # TREES / VOLUME / GRID
│   └── ProfilePage.tsx      # Settings
├── store/
│   ├── useStore.ts          # Zustand store (app state + DB sync)
│   └── toastStore.ts        # Toast notification store
├── data/
│   ├── exercises.ts         # 49 exercises with progressionParentId trees
│   └── workouts.ts          # Workout types, templates, schedule generator
├── lib/
│   ├── types.ts             # All shared TypeScript types
│   ├── auth.ts              # Neon Auth helpers
│   └── gql/                 # GraphQL sync functions (Hasura DDN)
└── components/
    ├── ui/                  # PageTransition, Sidebar, BottomNav, Toast
    └── icons/Icons.tsx      # 30+ SVG icon components
```

---

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # TypeScript check + Vite build
npm run preview    # Preview production build
```

### Preview routes (bypass auth)

| URL | Page |
|---|---|
| `/?preview=home` | HomePage |
| `/?preview=workouts` | WorkoutsPage |
| `/?preview=schedule` | SchedulePage (MATRIX) |
| `/?preview=progress` | ProgressPage |
| `/?preview=profile` | ProfilePage |

---

## Data Model

```ts
Workout       { id, name, type, date, exercises[], completed, ... }
ScheduleEntry { id, date, workoutType, workoutId?, completed }
Exercise      { id, name, category, movementPattern, equipment[], progressionParentId?, ... }
WorkoutExercise { exerciseId, sets: ExerciseSet[] }
ExerciseSet   { weight, reps, rpe?, notes?, completed }
```

State persists to `localStorage` under key `pidyom-storage` and syncs to Neon PostgreSQL via Hasura GraphQL mutations on each action.

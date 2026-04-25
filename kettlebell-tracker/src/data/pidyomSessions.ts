import { addDays, format, setHours, setMinutes } from 'date-fns';

export interface PidyomSession {
  id: string;
  /** ISO datetime — session start. */
  startsAt: string;
  /** Duration in minutes. */
  durationMin: number;
  /** Human-readable location. */
  locationName: string;
  /** "Park, gym, outdoor" — one-word context. */
  locationKind: string;
  /** Free-form coords like "50.4501°N · 30.5234°E". */
  coords: string;
  /** Url for map (Google Maps share link). */
  mapUrl: string;
  /** Programming focus for this session. */
  focus: string;
  /** What the coach wants attendees to bring. */
  bring: string[];
  /** Coach-pinned note. */
  coachNote: string;
  /** Cap on attendees. */
  capacity: number;
  /** Currently RSVP'd, mocked. */
  rsvpCount: number;
  /** ISO weekday list of repeat (mocked, not enforced). */
  status: 'scheduled' | 'cancelled' | 'completed';
}

/**
 * Mock — until the Hasura schema for `pidyom_sessions` ships.
 * The next session is always 2 days from "now" so the flyer always
 * has something to render in dev.
 */
const _now = new Date();
const _next = setMinutes(setHours(addDays(_now, 2), 18), 30);

export const NEXT_PIDYOM_SESSION: PidyomSession = {
  id: 'session-next-mock',
  startsAt: _next.toISOString(),
  durationMin: 75,
  locationName: 'Парк Шевченка · Південний вхід',
  locationKind: 'Outdoor',
  coords: '50.4439°N · 30.5108°E',
  mapUrl: 'https://maps.google.com/?q=50.4439,30.5108',
  focus: 'Hinge primary, swing volume, finisher carry',
  bring: ['16kg KB', '24kg KB', 'Mat (optional)', 'Water'],
  coachNote: 'Прийдіть на 10 хв раніше — розгрінка спільна. Якщо дощ — переносимо на критий зал, попереджу зранку.',
  capacity: 12,
  rsvpCount: 7,
  status: 'scheduled',
};

export const PAST_PIDYOM_SESSIONS: PidyomSession[] = [
  {
    id: 'session-past-1',
    startsAt: addDays(_now, -3).toISOString(),
    durationMin: 70,
    locationName: 'Парк Шевченка · Південний вхід',
    locationKind: 'Outdoor',
    coords: '50.4439°N · 30.5108°E',
    mapUrl: '',
    focus: 'Squat day · goblet ladder',
    bring: [],
    coachNote: '',
    capacity: 12,
    rsvpCount: 9,
    status: 'completed',
  },
  {
    id: 'session-past-2',
    startsAt: addDays(_now, -7).toISOString(),
    durationMin: 75,
    locationName: 'Гімнастичний зал · Рівне',
    locationKind: 'Indoor',
    coords: '50.6199°N · 26.2516°E',
    mapUrl: '',
    focus: 'Snatch test · 10-min cap',
    bring: [],
    coachNote: '',
    capacity: 12,
    rsvpCount: 11,
    status: 'completed',
  },
];

export const PIDYOM_LOCATIONS = [
  { id: 'park-shevchenko', name: 'Парк Шевченка · Південний вхід', kind: 'Outdoor', coords: '50.4439°N · 30.5108°E' },
  { id: 'gym-rivne', name: 'Гімнастичний зал · Рівне', kind: 'Indoor', coords: '50.6199°N · 26.2516°E' },
];

export function formatSessionDate(iso: string) {
  const d = new Date(iso);
  return {
    day: format(d, 'dd'),
    month: format(d, 'MMM').toUpperCase(),
    weekday: format(d, 'EEEE').toUpperCase(),
    time: format(d, 'HH:mm'),
    full: format(d, 'EEE · dd.MM.yyyy · HH:mm'),
    iso: d.toISOString(),
  };
}

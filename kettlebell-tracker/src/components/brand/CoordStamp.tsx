import type { CSSProperties } from 'react';

interface Props {
  /** Decimal latitude — positive = north, negative = south. */
  lat: number;
  /** Decimal longitude — positive = east, negative = west. */
  lng: number;
  /** Significant decimal places (default 4 — ~10m precision). */
  precision?: number;
  /** Optional time string appended after a separator. */
  time?: string;
  /** Optional className for layout positioning. */
  className?: string;
  /** Optional inline style override. */
  style?: CSSProperties;
  /** Force a specific colour (otherwise resolves to `--text-mono-cap`). */
  color?: string;
  /** Override the font size (px). Defaults to `--text-2xs`. */
  size?: number;
}

function formatLat(lat: number, precision: number): string {
  const v = Math.abs(lat).toFixed(precision);
  return `${v}°${lat >= 0 ? 'N' : 'S'}`;
}

function formatLng(lng: number, precision: number): string {
  const v = Math.abs(lng).toFixed(precision);
  return `${v}°${lng >= 0 ? 'E' : 'W'}`;
}

export default function CoordStamp({
  lat,
  lng,
  precision = 4,
  time,
  className,
  style,
  color,
  size,
}: Props) {
  const parts = [formatLat(lat, precision), formatLng(lng, precision)];
  if (time) parts.push(time);

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: size ? `${size}px` : 'var(--text-2xs)',
        letterSpacing: 'var(--tracking-widest)',
        textTransform: 'uppercase',
        color: color ?? 'var(--text-mono-cap)',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {parts.join(' · ')}
    </span>
  );
}

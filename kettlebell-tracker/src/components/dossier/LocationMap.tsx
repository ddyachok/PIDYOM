import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useStore } from '../../store/useStore';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Props {
  /** Decimal latitude. */
  lat: number;
  /** Decimal longitude. */
  lng: number;
  /** Optional Google/Apple maps URL — if present, taps open it externally. */
  mapUrl?: string;
  /** Optional className for layout positioning. */
  className?: string;
}

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

const STYLE_DARK = 'mapbox://styles/mapbox/dark-v11';
const STYLE_LIGHT = 'mapbox://styles/mapbox/light-v11';

// Layer prefixes we suppress to drop chrome (POIs, transit, business labels).
// Anything starting with these is set invisible on style load. Roads + water
// + country borders + place labels stay.
const HIDE_LAYER_PREFIXES = [
  'poi',
  'transit',
  'airport',
  'building',
  'aeroway',
];

// Recolour rules — pulled from the Field Manual token system. Applied
// runtime against Mapbox's standard layers.
function recolorLayers(map: mapboxgl.Map, isDark: boolean) {
  const tokens = isDark
    ? {
        bg: '#0B0A09',          // --void
        bgSoft: '#161513',       // --void-soft
        roadFill: '#3F3E39',     // --stone-700
        roadCasing: '#161513',
        water: '#161513',
        landUse: '#161513',
        textPrimary: '#D7D6CC',  // --paper (ink in dark mode)
        textHalo: '#0B0A09',
        textSecondary: '#95948A',// --stone-300
      }
    : {
        bg: '#D7D6CC',           // --paper
        bgSoft: '#CFCEC4',        // --paper-soft
        roadFill: '#BFBEB4',      // --stone-100
        roadCasing: '#CFCEC4',
        water: '#BFBEB4',
        landUse: '#CFCEC4',
        textPrimary: '#0B0A09',   // --void (ink in light mode)
        textHalo: '#D7D6CC',
        textSecondary: '#6A6963', // --stone-500
      };

  const style = map.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    const id = layer.id;

    // Hide chrome
    if (HIDE_LAYER_PREFIXES.some(p => id.startsWith(p))) {
      try { map.setLayoutProperty(id, 'visibility', 'none'); } catch (_e) { void 0; }
      continue;
    }

    try {
      if (id === 'background') {
        map.setPaintProperty(id, 'background-color', tokens.bg);
        continue;
      }
      if (id.startsWith('water')) {
        if (layer.type === 'fill') map.setPaintProperty(id, 'fill-color', tokens.water);
        if (layer.type === 'line') map.setPaintProperty(id, 'line-color', tokens.water);
        continue;
      }
      if (id.startsWith('land') || id.startsWith('landuse') || id.startsWith('landcover') || id.startsWith('national-park')) {
        if (layer.type === 'fill') map.setPaintProperty(id, 'fill-color', tokens.landUse);
        continue;
      }
      if (id.startsWith('road') || id.startsWith('bridge') || id.startsWith('tunnel') || id.startsWith('motorway')) {
        if (layer.type === 'line') {
          if (id.includes('casing')) map.setPaintProperty(id, 'line-color', tokens.roadCasing);
          else map.setPaintProperty(id, 'line-color', tokens.roadFill);
        }
        if (layer.type === 'fill') map.setPaintProperty(id, 'fill-color', tokens.roadFill);
        continue;
      }
      if (layer.type === 'symbol') {
        // Text labels (place names, road names that we kept).
        if ('layout' in layer && layer.layout && 'text-field' in layer.layout) {
          const isMajor = id.startsWith('settlement') || id.startsWith('country') || id.startsWith('state');
          map.setPaintProperty(id, 'text-color', isMajor ? tokens.textPrimary : tokens.textSecondary);
          map.setPaintProperty(id, 'text-halo-color', tokens.textHalo);
          map.setPaintProperty(id, 'text-halo-width', 0.6);
        }
        continue;
      }
      if (id.startsWith('admin')) {
        if (layer.type === 'line') {
          map.setPaintProperty(id, 'line-color', tokens.textSecondary);
          map.setPaintProperty(id, 'line-opacity', 0.18);
        }
        continue;
      }
    } catch (_err) {
      // Ignore — layer may not support the property; safe to skip silently.
    }
  }
}

// Custom pin — the brand arc + circle as an SVG, ink-coloured for the
// active theme.
function buildMarkerEl(isDark: boolean): HTMLDivElement {
  const ink = isDark ? '#D7D6CC' : '#0B0A09';
  const el = document.createElement('div');
  el.style.width = '32px';
  el.style.height = '32px';
  el.style.cursor = 'pointer';
  el.style.transformOrigin = 'center bottom';
  el.innerHTML = `
    <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="6" fill="${ink}" />
      <path d="M 5 16 A 11 11 0 0 0 27 16" stroke="${ink}" stroke-width="2.4" fill="none" />
    </svg>
  `;
  return el;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function LocationMap({ lat, lng, mapUrl, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const theme = useStore(s => s.theme);
  const isDark = theme === 'dark';
  const hasToken = !!TOKEN;

  // Initialise once per mount.
  useEffect(() => {
    if (!hasToken || !containerRef.current) return;
    mapboxgl.accessToken = TOKEN as string;

    const reduced = prefersReducedMotion();

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: isDark ? STYLE_DARK : STYLE_LIGHT,
      center: [lng, lat],
      zoom: reduced ? 16 : 11.5,
      attributionControl: false,
      cooperativeGestures: true,
      pitchWithRotate: false,
      dragRotate: false,
    });
    mapRef.current = map;

    map.on('load', () => {
      recolorLayers(map, isDark);

      const marker = new mapboxgl.Marker({ element: buildMarkerEl(isDark), anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map);
      markerRef.current = marker;

      if (reduced) return;

      // Zoom-in flight on arrival
      map.flyTo({
        center: [lng, lat],
        zoom: 15.3,
        speed: 0.9,
        curve: 1.4,
        essential: true,
      });
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // Re-init only when coords change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, hasToken]);

  // Re-style on theme change without re-creating the map.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(isDark ? STYLE_DARK : STYLE_LIGHT);
    map.once('styledata', () => {
      recolorLayers(map, isDark);
      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ element: buildMarkerEl(isDark), anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map);
    });
  }, [isDark, lat, lng]);

  // No-token fallback — brand-clean placeholder, hooks above stayed intact.
  if (!hasToken) {
    return (
      <div
        className={className}
        style={{
          aspectRatio: '16 / 9',
          width: '100%',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--rule-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: 'var(--tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--text-mono-cap)',
          textAlign: 'center',
        }}
      >
        MAP · SET VITE_MAPBOX_TOKEN
      </div>
    );
  }

  return (
    <a
      href={mapUrl || `https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label="Open map in a new tab"
      style={{
        display: 'block',
        position: 'relative',
        aspectRatio: '16 / 9',
        width: '100%',
        textDecoration: 'none',
        border: '1px solid var(--rule-default)',
        // Suppress the Mapbox compass etc — we hide controls via init options
        // and cooperativeGestures, but a light frame helps the surface read
        // as a printed plate.
      }}
    >
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0 }}
      />
    </a>
  );
}

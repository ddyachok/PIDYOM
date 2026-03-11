/**
 * Vercel Edge Function — Neon Auth reverse proxy.
 *
 * 1. Spoofs Origin so Better Auth CSRF check passes (fixes 400).
 * 2. Strips Domain from Set-Cookie so cookies land on pidyom.vercel.app.
 * 3. Passes through 302 redirects to the browser (social login → Google).
 */

export const config = { runtime: 'edge' };

const NEON_AUTH_BASE =
  'https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech';

const SKIP_HEADERS = new Set([
  'connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'host',
]);

export default async function handler(req) {
  const url = new URL(req.url);

  // /api/auth/sign-in/email → /neondb/auth/sign-in/email
  const neonPath = url.pathname.replace(/^\/api\/auth/, '/neondb/auth');
  const targetUrl = NEON_AUTH_BASE + neonPath + url.search;

  // Forward request headers, spoofing Origin for CSRF
  const fwd = new Headers();
  for (const [k, v] of req.headers.entries()) {
    if (!SKIP_HEADERS.has(k.toLowerCase())) {
      fwd.set(k, v);
    }
  }
  fwd.set('host', new URL(NEON_AUTH_BASE).host);
  fwd.set('origin', NEON_AUTH_BASE);
  fwd.delete('accept-encoding');

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: fwd,
    body: hasBody ? req.body : null,
    ...(hasBody ? { duplex: 'half' } : {}),
    redirect: 'manual',
  });

  // Build response headers, stripping Domain from Set-Cookie
  const respHeaders = new Headers();
  for (const [k, v] of upstream.headers.entries()) {
    if (SKIP_HEADERS.has(k.toLowerCase())) continue;

    if (k.toLowerCase() === 'set-cookie') {
      // Strip Domain= so browser defaults to pidyom.vercel.app
      respHeaders.append('set-cookie', v.replace(/;\s*domain=[^;]*/gi, ''));
    } else {
      respHeaders.set(k, v);
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  });
}

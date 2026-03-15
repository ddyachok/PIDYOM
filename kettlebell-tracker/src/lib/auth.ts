import { createInternalNeonAuth } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

// Route auth through our same-origin Edge Function proxy (/api/auth/*).
// The proxy spoofs the Origin header so Better Auth's CSRF check passes,
// and forwards Set-Cookie responses from the Neon Auth server. Because the
// browser sees the response as coming from pidyom.vercel.app, the session
// cookie is stored as a first-party cookie — not blocked by Safari ITP.
//
// In dev:        Vite proxy  /api/auth → neonauth server  (see vite.config.ts)
// In production: Vercel Edge Function api/auth/[...path].ts  (see api/)
const authUrl = `${window.location.origin}/api/auth`;

// createInternalNeonAuth returns { adapter, getJWTToken }
// createAuthClient only returns the adapter — no getJWTToken!
const neonAuth = createInternalNeonAuth(authUrl, {
  adapter: BetterAuthReactAdapter(),
});

/** Better Auth client (useSession, signIn, signOut, etc.) */
export const authClient = neonAuth.adapter;

/** Get JWT token for GraphQL requests */
export const getJWTToken = () => neonAuth.getJWTToken();

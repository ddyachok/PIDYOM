import { createInternalNeonAuth } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

// Use a same-origin proxied path so Safari's ITP does not block session cookies.
// In dev:        Vite proxy  /neondb/auth → neonauth server  (see vite.config.ts)
// In production: Vercel edge fn /neondb/auth → neonauth server (see api/auth/[...path].js)
const authUrl = `${window.location.origin}/neondb/auth`;

// createInternalNeonAuth returns { adapter, getJWTToken }
// createAuthClient only returns the adapter — no getJWTToken!
const neonAuth = createInternalNeonAuth(authUrl, {
  adapter: BetterAuthReactAdapter(),
});

/** Better Auth client (useSession, signIn, signOut, etc.) */
export const authClient = neonAuth.adapter;

/** Get JWT token for GraphQL requests */
export const getJWTToken = () => neonAuth.getJWTToken();

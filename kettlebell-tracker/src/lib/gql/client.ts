import { GraphQLClient } from 'graphql-request';
import { getJWTToken } from '../auth';

const HASURA_URL = import.meta.env.VITE_HASURA_GRAPHQL_URL || 'https://classic-boa-53.hasura.app/v1/graphql';
const HASURA_ADMIN_SECRET = import.meta.env.VITE_HASURA_ADMIN_SECRET || '';

const gqlClient = new GraphQLClient(HASURA_URL);

/** Decode JWT payload without verification (for logging only) */
function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

let _authModeLogged = false;

/** Build auth headers for each request */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getJWTToken();

  if (token) {
    // Check if JWT has Hasura claims
    const payload = decodeJWTPayload(token);
    const hasClaims = !!payload?.['https://hasura.io/jwt/claims'];

    if (hasClaims) {
      if (import.meta.env.DEV && !_authModeLogged) {
        _authModeLogged = true;
        console.log('[PIDYOM gql] Using JWT with Hasura claims');
      }
      return { Authorization: `Bearer ${token}` };
    }

    // JWT exists but no Hasura claims — fall back to admin secret
    if (HASURA_ADMIN_SECRET) {
      if (import.meta.env.DEV && !_authModeLogged) {
        _authModeLogged = true;
        console.log('[PIDYOM gql] JWT lacks Hasura claims, using admin secret fallback');
      }
      return { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET };
    }

    // No admin secret either — try JWT anyway (may fail)
    return { Authorization: `Bearer ${token}` };
  }

  // No JWT token
  if (HASURA_ADMIN_SECRET) {
    if (import.meta.env.DEV && !_authModeLogged) {
      _authModeLogged = true;
      console.log('[PIDYOM gql] No JWT, using admin secret');
    }
    return { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET };
  }

  console.error('[PIDYOM gql] No auth available — requests will fail!');
  return {};
}

/** Execute a GraphQL request with proper auth headers */
export async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const headers = await getAuthHeaders();

  try {
    return await gqlClient.request<T>(query, variables, headers);
  } catch (err: unknown) {
    if (import.meta.env.DEV) {
      const opMatch = query.match(/(?:query|mutation)\s+(\w+)/);
      console.error(`[PIDYOM gql] ${opMatch?.[1] || 'unknown'} failed:`, err);
    }
    throw err;
  }
}

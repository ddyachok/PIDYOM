import express from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration from environment variables
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID;
const NEON_AUTH_ISSUER = process.env.NEON_AUTH_ISSUER || 'https://auth.neon.tech';
const NEON_JWKS_URI = process.env.NEON_JWKS_URI || `${NEON_AUTH_ISSUER}/.well-known/jwks.json`;

// Create JWKS (JSON Web Key Set) for JWT verification
let JWKS;
if (NEON_JWKS_URI) {
  JWKS = createRemoteJWKSet(new URL(NEON_JWKS_URI));
}

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Hasura webhook endpoint with production-grade JWT verification
app.post('/webhook', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];

    // If no authorization header, return unauthenticated role
    if (!authHeader) {
      return res.json({
        'X-Hasura-Role': 'anonymous',
      });
    }

    // Extract Bearer token
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return res.json({
        'X-Hasura-Role': 'anonymous',
      });
    }

    // PRODUCTION: Verify JWT signature with Neon's public key
    if (JWKS) {
      try {
        const { payload } = await jwtVerify(token, JWKS, {
          issuer: NEON_AUTH_ISSUER,
          audience: NEON_PROJECT_ID,
        });

        // Extract user information from verified JWT
        const userId = payload.sub;
        const email = payload.email || '';
        const role = payload.role || 'user';
        const name = payload.name || '';

        // You can add custom claims from Neon Auth here
        const customClaims = payload['https://hasura.io/jwt/claims'] || {};

        // Return Hasura session variables
        return res.json({
          'X-Hasura-User-Id': userId,
          'X-Hasura-Role': role,
          'X-Hasura-Email': email,
          'X-Hasura-Name': name,
          // Add any custom claims
          ...customClaims,
        });
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);

        // Log details for debugging
        if (jwtError.code === 'ERR_JWT_EXPIRED') {
          console.error('Token expired');
        } else if (jwtError.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
          console.error('Invalid signature');
        } else if (jwtError.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
          console.error('Claim validation failed:', jwtError.claim);
        }

        // Return anonymous role on verification failure
        return res.json({
          'X-Hasura-Role': 'anonymous',
        });
      }
    }

    // FALLBACK: If JWKS not configured, decode without verification (DEVELOPMENT ONLY)
    console.warn('WARNING: JWT verification is disabled. This should only be used in development!');

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.decode(token);

    if (!decoded || !decoded.sub) {
      return res.json({
        'X-Hasura-Role': 'anonymous',
      });
    }

    // Extract user information from unverified JWT (DEVELOPMENT ONLY)
    const userId = decoded.sub;
    const email = decoded.email || '';
    const role = decoded.role || 'user';

    return res.json({
      'X-Hasura-User-Id': userId,
      'X-Hasura-Role': role,
      'X-Hasura-Email': email,
    });
  } catch (error) {
    console.error('Webhook error:', error);

    // On error, return anonymous role
    return res.json({
      'X-Hasura-Role': 'anonymous',
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    'X-Hasura-Role': 'anonymous',
  });
});

app.listen(PORT, () => {
  console.log(`Neon Auth webhook server running on port ${PORT}`);
  console.log(`Environment: ${JWKS ? 'PRODUCTION (JWT verification enabled)' : 'DEVELOPMENT (JWT verification disabled)'}`);
  if (!NEON_PROJECT_ID && JWKS) {
    console.warn('WARNING: NEON_PROJECT_ID not set, audience validation will fail');
  }
});

# Neon Auth Integration with Hasura DDN

This document explains how Neon Auth has been integrated with your Hasura DDN project.

## What Was Done

### 1. Created Auth Webhook Service

A Node.js/Express webhook service was created in the `auth-webhook/` directory that:
- Receives authentication requests from Hasura
- Validates JWT tokens from Neon Auth
- Extracts user information (user ID, email, role)
- Returns Hasura session variables

### 2. Updated Hasura Auth Configuration

The `globals/metadata/auth-config.hml` file was updated to use webhook mode instead of noAuth:
```yaml
mode:
  webhook:
    url: http://local.hasura.dev:3001/webhook
    method: Post
```

### 3. Added Role-Based Permissions

Updated `app/metadata/Users.hml` with three roles:
- **admin**: Full access to all user records
- **user**: Can only view their own user record (filtered by user ID)
- **anonymous**: Can view only id and name fields of all users

### 4. Docker Compose Integration

Added the auth-webhook service to `compose.yaml` so it runs alongside your Hasura engine.

## How to Use

### 1. Install Dependencies

```bash
cd auth-webhook
npm install
cd ..
```

### 2. Rebuild and Start Services

First, rebuild the supergraph with the new auth configuration:

```bash
ddn supergraph build local
```

Then restart all services:

```bash
docker compose down
ddn run docker-start
```

### 3. Testing with Different Roles

#### Anonymous Access (No Token)
```bash
curl -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { id name } }"}'
```

#### Authenticated User Access (With JWT)
```bash
curl -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_NEON_JWT_TOKEN" \
  -d '{"query": "{ users { id name email createdAt } }"}'
```

### 4. Neon Auth Setup

To get JWT tokens from Neon Auth:

1. Enable Neon Auth in your Neon project dashboard
2. Configure authentication providers (OAuth, email/password, etc.)
3. Use Neon's authentication SDK in your frontend application
4. The SDK will provide JWT tokens that you include in requests to Hasura

### 5. Using with the Console

To test in the local console:

```bash
ddn console --local
```

In the console, add request headers:
```json
{
  "Authorization": "Bearer YOUR_NEON_JWT_TOKEN"
}
```

## JWT Token Structure

The webhook expects Neon Auth JWT tokens with this structure:

```json
{
  "sub": "user-id-123",
  "email": "user@example.com",
  "role": "user"
}
```

## Session Variables

The webhook sets these Hasura session variables:

- `X-Hasura-User-Id`: The user's ID from the JWT `sub` claim
- `X-Hasura-Role`: The user's role (user, admin, or anonymous)
- `X-Hasura-Email`: The user's email address

## Security Considerations

### Production Deployment

For production, you should:

1. **Verify JWT signatures**: Update `auth-webhook/index.js` to verify JWT signatures using Neon's public key:

```javascript
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://YOUR_NEON_PROJECT/.well-known/jwks.json'));

// In the webhook handler:
const { payload } = await jwtVerify(token, JWKS, {
  issuer: 'neon',
  audience: 'your-project-id'
});
```

2. **Use environment variables**: Store sensitive configuration in environment variables
3. **Enable HTTPS**: Use TLS for all communications
4. **Rate limiting**: Add rate limiting to the webhook endpoint
5. **Logging & monitoring**: Add proper logging and error tracking

## Customizing Roles

To add more roles or modify permissions, edit:

1. **Type Permissions**: `app/metadata/Users.hml` - controls which fields each role can see
2. **Model Permissions**: Same file - controls which records each role can query
3. **Webhook Logic**: `auth-webhook/index.js` - controls how roles are assigned from JWT

## Troubleshooting

### Webhook Not Reachable
- Ensure all services are running: `docker compose ps`
- Check webhook logs: `docker compose logs auth-webhook`

### Permission Denied Errors
- Verify JWT token is valid
- Check that user has the correct role
- Review permissions in `Users.hml`

### Build Errors
After changing metadata files, always rebuild:
```bash
ddn supergraph build local
docker compose restart engine
```

## Next Steps

1. Set up Neon Auth in your Neon project dashboard
2. Integrate Neon Auth SDK in your frontend application
3. Customize the webhook to match your JWT structure
4. Add more granular permissions as needed
5. Deploy to production with proper security measures

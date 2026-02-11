# Neon Auth Webhook for Hasura

This is a webhook service that integrates Neon Auth with Hasura DDN.

## What It Does

The webhook receives authentication requests from Hasura, validates JWT tokens from Neon Auth, and returns user session variables that Hasura uses for authorization.

## Files

- `index.js` - Development version (decodes JWT without verification)
- `index.production.js` - Production version (verifies JWT signatures)
- `package.json` - Node.js dependencies
- `Dockerfile` - Docker container configuration
- `.env.example` - Environment variable template

## Development vs Production

### Development Mode (Current)

Uses `index.js` which:
- ✅ Decodes JWT tokens
- ❌ Does NOT verify signatures
- ⚠️ Should only be used for local development

### Production Mode

Use `index.production.js` which:
- ✅ Decodes JWT tokens
- ✅ Verifies JWT signatures using Neon's public key
- ✅ Validates issuer and audience claims
- ✅ Handles expired tokens properly

## Switching to Production Mode

1. Install additional dependency:
```bash
npm install jose
```

2. Update `package.json` to use production version:
```json
{
  "scripts": {
    "start": "node index.production.js"
  }
}
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your Neon Auth configuration:
```env
NEON_PROJECT_ID=your-neon-project-id
NEON_AUTH_ISSUER=https://auth.neon.tech
NEON_JWKS_URI=https://auth.neon.tech/.well-known/jwks.json
```

5. Rebuild Docker image:
```bash
cd ..
docker compose build auth-webhook
docker compose restart auth-webhook
```

## Testing

### Test Health Endpoint
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok"}
```

### Test Webhook Without Auth
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected response:
```json
{"X-Hasura-Role":"anonymous"}
```

### Test Webhook With JWT Token
```bash
# Using a demo token
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'
```

Expected response:
```json
{
  "X-Hasura-User-Id": "user-id",
  "X-Hasura-Role": "user",
  "X-Hasura-Email": "user@example.com"
}
```

## Session Variables

The webhook returns these session variables to Hasura:

| Variable | Description | Example |
|----------|-------------|---------|
| `X-Hasura-User-Id` | User's unique identifier | `"1234567890"` |
| `X-Hasura-Role` | User's role | `"user"`, `"admin"`, `"anonymous"` |
| `X-Hasura-Email` | User's email address | `"user@example.com"` |

## Customization

### Adding Custom Session Variables

Edit `index.js` or `index.production.js`:

```javascript
// Extract custom claims from JWT
const department = decoded.department || 'general';
const subscriptionTier = decoded.subscription_tier || 'free';

return res.json({
  'X-Hasura-User-Id': userId,
  'X-Hasura-Role': role,
  'X-Hasura-Email': email,
  'X-Hasura-Department': department,
  'X-Hasura-Subscription-Tier': subscriptionTier,
});
```

### Customizing Role Logic

```javascript
// Assign roles based on JWT claims
let role = 'user'; // default

if (decoded.is_admin) {
  role = 'admin';
} else if (decoded.email_verified === false) {
  role = 'unverified_user';
} else if (decoded.subscription_active) {
  role = 'premium_user';
}
```

## Error Handling

The webhook returns `anonymous` role in these cases:
- No Authorization header provided
- Invalid JWT format
- JWT verification fails (in production mode)
- JWT is expired
- Any other error occurs

This ensures Hasura always gets a valid response and can apply appropriate permissions.

## Logging

View webhook logs:
```bash
docker compose logs -f auth-webhook
```

## Security Considerations

### Development
- JWT signatures are NOT verified
- Suitable only for local development
- Never deploy development mode to production

### Production
- JWT signatures are verified against Neon's public key
- Expired tokens are rejected
- Issuer and audience claims are validated
- All errors are logged for monitoring

## Deployment Checklist

- [ ] Switch to `index.production.js`
- [ ] Install `jose` package for JWT verification
- [ ] Set environment variables (NEON_PROJECT_ID, etc.)
- [ ] Test with real Neon Auth tokens
- [ ] Enable HTTPS/TLS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Review security settings

## Troubleshooting

### Webhook returns anonymous for valid tokens

**Development mode:**
- Check JWT token structure (should have `sub`, `email`, `role` claims)
- View logs: `docker compose logs auth-webhook`

**Production mode:**
- Verify NEON_PROJECT_ID matches your Neon project
- Check NEON_JWKS_URI is accessible
- Ensure JWT is not expired
- View logs for specific error messages

### Service won't start

```bash
# Check if port 3001 is already in use
lsof -i :3001

# View service logs
docker compose logs auth-webhook

# Rebuild image
docker compose build auth-webhook
```

### JWT verification fails in production

- Verify NEON_JWKS_URI is correct
- Check network connectivity to Neon Auth
- Ensure JWT token is from Neon Auth
- Verify issuer and audience claims match configuration

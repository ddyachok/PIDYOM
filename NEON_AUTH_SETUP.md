# Setting Up Real Neon Auth - Step by Step Guide

This guide walks you through setting up Neon Auth with your Hasura DDN project.

## Prerequisites

- ✅ Neon PostgreSQL database (you have this: `ep-plain-art-ag9lypls-pooler.c-2.eu-central-1.aws.neon.tech`)
- ✅ Hasura DDN project (already set up)
- ✅ Auth webhook service (already running)

## Step 1: Enable Neon Authorize in Neon Dashboard

### 1.1 Access Your Neon Project

1. Go to https://console.neon.tech
2. Select your project (the one with database `neondb`)
3. Look for your project ID in the connection string

### 1.2 Enable Neon Authorize

1. In your Neon project, navigate to **Settings** → **Authorize** (or **Authentication**)
2. Click **Enable Neon Authorize**
3. Note down the following values (you'll need them):
   - **Issuer URL**: Usually `https://YOUR_PROJECT_ID.auth.neon.tech`
   - **JWKS URL**: Usually `https://YOUR_PROJECT_ID.auth.neon.tech/.well-known/jwks.json`
   - **Project ID**: Your Neon project ID

### 1.3 Configure Authentication Providers

Neon Authorize typically supports:

**Option A: Email/Password Authentication**
1. Enable the Email provider
2. Configure email templates (optional)
3. Set up password requirements

**Option B: OAuth Providers** (Google, GitHub, etc.)
1. Click "Add Provider"
2. Choose your OAuth provider (Google, GitHub, etc.)
3. Enter OAuth credentials:
   - Client ID
   - Client Secret
   - Redirect URLs

**Option C: Magic Link Authentication**
1. Enable Magic Link
2. Configure email sending

Choose the provider(s) that fit your application needs.

## Step 2: Get Your Neon Auth Configuration

After enabling Neon Authorize, you should have:

```bash
# Copy these values from your Neon dashboard
NEON_PROJECT_ID="your-project-id"
NEON_AUTH_ISSUER="https://your-project-id.auth.neon.tech"
NEON_JWKS_URI="https://your-project-id.auth.neon.tech/.well-known/jwks.json"
```

## Step 3: Update Auth Webhook Configuration

### 3.1 Install Production Dependencies

```bash
cd auth-webhook
npm install jose
cd ..
```

### 3.2 Create Environment File

```bash
cd auth-webhook
cp .env.example .env
```

### 3.3 Edit `.env` File

Update `auth-webhook/.env` with your Neon Auth values:

```env
PORT=3001

# Replace these with your actual Neon Auth values
NEON_PROJECT_ID=your-actual-neon-project-id
NEON_AUTH_ISSUER=https://your-project-id.auth.neon.tech
NEON_JWKS_URI=https://your-project-id.auth.neon.tech/.well-known/jwks.json
```

### 3.4 Switch to Production Version

Update `auth-webhook/package.json`:

```json
{
  "name": "neon-auth-webhook",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.production.js",
    "dev": "node --watch index.production.js"
  },
  "dependencies": {
    "@neondatabase/auth": "^0.1.0-beta.21",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "jose": "^5.2.0"
  }
}
```

### 3.5 Update Docker Compose

Update `compose.yaml` to pass environment variables to auth-webhook:

```yaml
  auth-webhook:
    build:
      context: auth-webhook
      dockerfile: Dockerfile
    environment:
      PORT: 3001
      NEON_PROJECT_ID: ${NEON_PROJECT_ID}
      NEON_AUTH_ISSUER: ${NEON_AUTH_ISSUER}
      NEON_JWKS_URI: ${NEON_JWKS_URI}
    extra_hosts:
      - local.hasura.dev:host-gateway
    labels:
      io.hasura.ddn.service-name: auth-webhook
    ports:
      - 3001:3001
```

### 3.6 Add to Root .env File

Add these to your root `.env` file (next to compose.yaml):

```bash
# Add to /Users/danylodyachok/Dev/web/pidyom/.env

# Neon Auth Configuration
NEON_PROJECT_ID=your-actual-neon-project-id
NEON_AUTH_ISSUER=https://your-project-id.auth.neon.tech
NEON_JWKS_URI=https://your-project-id.auth.neon.tech/.well-known/jwks.json
```

### 3.7 Rebuild and Restart Services

```bash
# Rebuild the auth webhook with new dependencies
docker compose build auth-webhook

# Restart all services
docker compose down
docker compose up -d

# Check logs
docker compose logs -f auth-webhook
```

You should see:
```
Neon Auth webhook server running on port 3001
Environment: PRODUCTION (JWT verification enabled)
```

## Step 4: Set Up Database Schema for Neon Auth

Neon Authorize typically requires a users table. Let's check if we need to update the schema:

### 4.1 Connect to Your Neon Database

```bash
# Using the connection string from your .env
psql "postgresql://neondb_owner:npg_BMige52pCvGZ@ep-plain-art-ag9lypls-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

### 4.2 Check Current Schema

```sql
-- Check if users table exists
\dt users

-- View current structure
\d users
```

### 4.3 Update Schema if Needed

If your users table doesn't match Neon Auth's expected structure, update it:

```sql
-- Add auth-related columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Create index on auth_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
```

**Note**: The `auth_id` should match the `sub` claim from Neon Auth JWT tokens.

## Step 5: Test with Real Neon Auth Tokens

### 5.1 Get a Test JWT Token

You have several options:

**Option A: Use Neon Auth Dashboard**
1. Go to your Neon Authorize dashboard
2. Look for "Test" or "Try it" section
3. Sign up with a test user
4. Copy the JWT token

**Option B: Use the Frontend SDK**

Create a simple test page:

```html
<!-- test-auth.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Neon Auth Test</title>
</head>
<body>
    <button id="login">Login with Neon Auth</button>
    <div id="token"></div>

    <script type="module">
        import { NeonAuth } from '@neondatabase/auth';

        const auth = new NeonAuth({
            projectId: 'YOUR_NEON_PROJECT_ID',
            // Add other configuration from Neon dashboard
        });

        document.getElementById('login').onclick = async () => {
            const result = await auth.signIn({
                email: 'test@example.com',
                password: 'testpassword123'
            });

            document.getElementById('token').textContent = result.token;
            console.log('JWT Token:', result.token);
        };
    </script>
</body>
</html>
```

### 5.2 Test the Webhook

```bash
# Replace YOUR_REAL_JWT_TOKEN with the token from step 5.1
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_REAL_JWT_TOKEN" \
  -d '{}'
```

Expected response:
```json
{
  "X-Hasura-User-Id": "actual-user-id-from-token",
  "X-Hasura-Role": "user",
  "X-Hasura-Email": "user@example.com"
}
```

### 5.3 Test with Hasura

```bash
curl -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_REAL_JWT_TOKEN" \
  -d '{"query": "{ users { id name email createdAt } }"}'
```

### 5.4 Test in Hasura Console

```bash
ddn console --local
```

In the console, add the Authorization header:
```json
{
  "Authorization": "Bearer YOUR_REAL_JWT_TOKEN"
}
```

Then run queries and see the role-based filtering in action!

## Step 6: Frontend Integration

### 6.1 Install Neon Auth SDK

In your frontend project:

```bash
npm install @neondatabase/auth
```

### 6.2 Initialize Neon Auth

```javascript
import { NeonAuth } from '@neondatabase/auth';

const auth = new NeonAuth({
  projectId: 'your-neon-project-id',
  // Add configuration from your Neon dashboard
});

// Sign up
const signUp = async (email, password) => {
  const result = await auth.signUp({ email, password });
  return result.token;
};

// Sign in
const signIn = async (email, password) => {
  const result = await auth.signIn({ email, password });
  return result.token;
};

// Use token with Hasura
const queryHasura = async (token) => {
  const response = await fetch('http://localhost:3280/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: '{ users { id name email } }'
    })
  });

  return response.json();
};
```

## Step 7: Verify Everything Works

### 7.1 Checklist

- [ ] Neon Authorize enabled in Neon dashboard
- [ ] Auth provider(s) configured (Email/OAuth/etc.)
- [ ] NEON_PROJECT_ID, NEON_AUTH_ISSUER, NEON_JWKS_URI configured
- [ ] `jose` package installed in auth-webhook
- [ ] Auth webhook using `index.production.js`
- [ ] Environment variables in .env files
- [ ] Services rebuilt and restarted
- [ ] Webhook logs show "PRODUCTION (JWT verification enabled)"
- [ ] Real JWT token obtained from Neon Auth
- [ ] Webhook validates token successfully
- [ ] Hasura GraphQL works with token
- [ ] Role-based permissions working correctly

### 7.2 Common Issues

**Issue: Webhook returns anonymous for valid token**
- Check logs: `docker compose logs auth-webhook`
- Verify NEON_PROJECT_ID matches your actual project
- Ensure JWKS_URI is accessible from the container
- Check token hasn't expired

**Issue: JWT verification fails**
```
Error: ERR_JWT_CLAIM_VALIDATION_FAILED
```
- Verify issuer matches: token's `iss` claim should match NEON_AUTH_ISSUER
- Verify audience matches: token's `aud` claim should match NEON_PROJECT_ID

**Issue: Can't reach JWKS endpoint**
- Test connectivity: `curl https://your-project-id.auth.neon.tech/.well-known/jwks.json`
- Check if URL is correct in Neon dashboard
- Ensure DNS resolution works from Docker container

## Step 8: Production Deployment

When deploying to production:

1. **Environment Variables**: Set all NEON_* variables in your hosting platform
2. **HTTPS**: Ensure webhook is accessible via HTTPS
3. **Monitoring**: Set up logging and error tracking
4. **Rate Limiting**: Add rate limiting to webhook endpoint
5. **Secrets Management**: Use proper secrets management (AWS Secrets Manager, etc.)

## Need Help?

Check these resources:
- Neon Authorize Docs: https://neon.tech/docs/guides/neon-authorize
- Hasura DDN Auth Docs: https://hasura.io/docs/3.0/auth/
- Your webhook logs: `docker compose logs -f auth-webhook`
- Hasura engine logs: `docker compose logs -f engine`

## Summary

After completing these steps, you'll have:
- ✅ Real Neon Auth configured and running
- ✅ JWT tokens properly verified with signature validation
- ✅ Secure authentication flow
- ✅ Role-based access control working with real users
- ✅ Frontend integration ready

Your integration will be production-ready! 🚀

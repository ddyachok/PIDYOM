# Quick Start: Neon Auth + Hasura Integration

## Your Integration is Ready! ✅

The Neon Auth integration with Hasura DDN has been successfully set up. Here's what you can do now:

## Current Status

All services are running:
- ✅ Hasura Engine (GraphQL): http://localhost:3280/graphql
- ✅ Auth Webhook: http://localhost:3001
- ✅ Neon PostgreSQL Connector: http://localhost:8437
- ✅ OpenTelemetry Collector: http://localhost:4317

## Quick Test

### 1. Test Anonymous Access
```bash
curl -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { id name } }"}'
```

### 2. Test Authenticated Access
```bash
# Using a demo JWT token
curl -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIifQ.Ks_BdfkfUZKZhjKXRCHbjCh6h9eGo9z_vKlLqJNrKHo" \
  -d '{"query": "{ users { id name email createdAt } }"}'
```

### 3. Open the Console
```bash
ddn console --local
```

Then in the console, add this to the Request Headers:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIifQ.Ks_BdfkfUZKZhjKXRCHbjCh6h9eGo9z_vKlLqJNrKHo"
}
```

## What's Been Set Up

### 1. Auth Webhook Service
Location: `auth-webhook/`

This service:
- Receives JWT tokens from Neon Auth
- Validates and decodes them
- Returns user session variables to Hasura

### 2. Role-Based Access Control

Three roles configured:

**Admin**
- Full access to all user data
- Can see: id, name, email, createdAt

**User** (authenticated)
- Can only view their own user record
- Can see: id, name, email, createdAt
- Filter: WHERE id = X-Hasura-User-Id

**Anonymous** (not authenticated)
- Can view all users but limited fields
- Can see: id, name only

### 3. Auth Configuration
Updated `globals/metadata/auth-config.hml` to use webhook authentication

### 4. Docker Compose
Added auth-webhook service to run alongside Hasura engine

## Managing Services

### Start Services
```bash
ddn run docker-start
# OR
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### View Logs
```bash
# All services
docker compose logs -f

# Just auth webhook
docker compose logs -f auth-webhook

# Just engine
docker compose logs -f engine
```

### Rebuild After Changes
```bash
ddn supergraph build local
docker compose restart engine
```

## Next Steps

### 1. Set Up Real Neon Auth

1. **Enable Neon Auth** in your Neon project dashboard
2. **Configure providers** (OAuth, email/password, etc.)
3. **Get your Neon Auth endpoint** and update the webhook accordingly
4. **Update the webhook** (`auth-webhook/index.js`) to verify JWT signatures properly

### 2. Update JWT Verification

For production, add proper JWT verification:

```bash
cd auth-webhook
npm install jose
```

Then update `index.js` to verify signatures (see NEON_AUTH_INTEGRATION.md for details)

### 3. Customize Permissions

Edit `app/metadata/Users.hml` to:
- Add more roles
- Create different permission levels
- Add row-level security filters

### 4. Frontend Integration

Use the example in `examples/client-example.html` as a starting point for your frontend.

Install Neon Auth SDK:
```bash
npm install @neondatabase/auth
```

## Troubleshooting

### Services Won't Start
```bash
# Check what's running
docker compose ps

# View all logs
docker compose logs

# Restart everything
docker compose down
ddn run docker-start
```

### Permission Errors
```bash
# Rebuild the supergraph
ddn supergraph build local

# Restart the engine
docker compose restart engine
```

### Webhook Not Working
```bash
# Check webhook logs
docker compose logs auth-webhook

# Test webhook directly
curl http://localhost:3001/health
```

## Useful Commands

```bash
# Build supergraph
ddn supergraph build local

# Start services
ddn run docker-start

# Open console
ddn console --local

# View service status
docker compose ps

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild and restart
docker compose down
ddn supergraph build local
docker compose up -d --build
```

## Documentation

- `NEON_AUTH_INTEGRATION.md` - Detailed integration guide
- `examples/client-example.html` - Frontend example
- `auth-webhook/` - Webhook service code

## Support

For issues:
- Check logs: `docker compose logs`
- Verify services are running: `docker compose ps`
- Rebuild supergraph: `ddn supergraph build local`
- Restart services: `docker compose restart`

Hasura DDN docs: https://hasura.io/docs/3.0/
Neon Auth docs: https://neon.tech/docs/guides/neon-authorize

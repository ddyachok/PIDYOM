# Neon Auth + Hasura - Quick Reference

## 🚀 Essential Commands

### Start/Stop Services

```bash
# Start all services
ddn run docker-start

# Stop all services
docker compose down

# Restart a specific service
docker compose restart auth-webhook
docker compose restart engine

# Check service status
docker compose ps

# Check system status
./scripts/check-status.sh
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f auth-webhook
docker compose logs -f engine
docker compose logs -f app_my_pg

# Last 50 lines
docker compose logs --tail=50
```

### Development Workflow

```bash
# After changing database schema
ddn connector introspect my_pg
ddn model add my_pg "*"
ddn command add my_pg "*"
ddn relationship add my_pg "*"

# After changing permissions or auth config
ddn supergraph build local
docker compose restart engine

# After changing webhook code
docker compose build auth-webhook
docker compose restart auth-webhook

# Open console
ddn console --local
```

## 🔐 Testing Authentication

### Test Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Test webhook without auth
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: {"X-Hasura-Role":"anonymous"}

# Test webhook with JWT
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
# Expected: {"X-Hasura-User-Id":"...","X-Hasura-Role":"user","X-Hasura-Email":"..."}
```

### Demo JWT Token

For development testing:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIifQ.Ks_BdfkfUZKZhjKXRCHbjCh6h9eGo9z_vKlLqJNrKHo
```

This token contains:
```json
{
  "sub": "1234567890",
  "email": "test@example.com",
  "role": "user"
}
```

## 📊 GraphQL Queries

### Anonymous Access

```bash
curl -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ users { id name } }"
  }'
```

### Authenticated Access

```bash
curl -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "{ users { id name email createdAt } }"
  }'
```

### Common Queries

```graphql
# Get all users (respects role permissions)
query GetUsers {
  users {
    id
    name
    email
    createdAt
  }
}

# Get user by ID
query GetUserById {
  usersById(id: 123) {
    id
    name
    email
  }
}

# Insert user
mutation InsertUser {
  insertUsers(objects: {
    name: "John Doe"
    email: "john@example.com"
  }) {
    returning {
      id
      name
      email
    }
  }
}

# Update user
mutation UpdateUser {
  updateUsers(
    where: { id: { _eq: 123 } }
    _set: { name: "Jane Doe" }
  ) {
    returning {
      id
      name
    }
  }
}

# Delete user
mutation DeleteUser {
  deleteUsers(where: { id: { _eq: 123 } }) {
    returning {
      id
    }
  }
}
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# PostgreSQL Connector
APP_MY_PG_JDBC_URL=jdbc:postgresql://...

# Neon Auth (Production)
NEON_PROJECT_ID=your-project-id
NEON_AUTH_ISSUER=https://your-project.auth.neon.tech
NEON_JWKS_URI=https://your-project.auth.neon.tech/.well-known/jwks.json
```

### Enable Production Auth

```bash
# Automated
./scripts/enable-production-auth.sh

# Manual
cd auth-webhook
npm install jose
# Edit package.json to use index.production.js
# Configure .env with Neon Auth values
cd ..
docker compose build auth-webhook
docker compose up -d
```

## 🎭 Roles & Permissions

### Anonymous
- ❌ No authentication required
- ✅ Can query `users` table
- 👁️ Can only see: `id`, `name`
- ❌ No mutations

### User (Authenticated)
- ✅ Requires JWT token
- ✅ Can query `users` table
- 👁️ Can only see own record (filtered by user ID)
- 👁️ Can see: `id`, `name`, `email`, `createdAt`
- ✅ Can mutate own data

### Admin (Authenticated + Admin Role)
- ✅ Requires JWT token with `role: "admin"`
- ✅ Can query all users
- 👁️ Can see all fields
- ✅ Can mutate any data

## 🐛 Troubleshooting

### Services Won't Start
```bash
docker compose down
docker compose up -d
docker compose logs
```

### Permission Errors
```bash
ddn supergraph build local
docker compose restart engine
```

### JWT Validation Fails
```bash
# Check webhook logs
docker compose logs auth-webhook

# Verify environment variables
docker compose exec auth-webhook env | grep NEON

# Test webhook
curl -X POST http://localhost:3001/webhook \
  -H "Authorization: Bearer TOKEN" -d '{}'
```

### Database Connection Issues
```bash
# Re-introspect database
ddn connector introspect my_pg

# Check connector logs
docker compose logs app_my_pg
```

### Can't Access Console
```bash
# Make sure services are running
docker compose ps

# Rebuild supergraph
ddn supergraph build local

# Open console
ddn console --local
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables |
| `compose.yaml` | Docker services configuration |
| `globals/metadata/auth-config.hml` | Authentication settings |
| `app/metadata/Users.hml` | User model & permissions |
| `auth-webhook/index.js` | Auth webhook (development) |
| `auth-webhook/index.production.js` | Auth webhook (production) |

## 🌐 URLs

| Service | URL |
|---------|-----|
| Hasura Console | http://localhost:3280/graphql |
| GraphQL API | http://localhost:3280/graphql |
| Auth Webhook | http://localhost:3001 |
| Postgres Connector | http://localhost:8437 |

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| `README.md` | Project overview & quick start |
| `QUICK_START.md` | 5-minute getting started guide |
| `NEON_AUTH_SETUP.md` | Complete Neon Auth setup guide |
| `NEON_AUTH_INTEGRATION.md` | Technical integration details |
| `auth-webhook/README.md` | Webhook service documentation |

## 💡 Tips

- Use `ddn console --local` for interactive GraphQL testing
- Check `./scripts/check-status.sh` to verify everything is working
- Always rebuild supergraph after metadata changes: `ddn supergraph build local`
- View real-time logs: `docker compose logs -f`
- Test with demo token first before setting up real Neon Auth
- Keep development and production configurations separate

## 🎯 Next Steps

1. ✅ Services running? → Test with demo token
2. ✅ Demo working? → Set up real Neon Auth
3. ✅ Neon Auth ready? → Run `./scripts/enable-production-auth.sh`
4. ✅ Production mode enabled? → Integrate with your frontend
5. ✅ Frontend integrated? → Deploy to production

---

**Need more help?** Check the full documentation or run `./scripts/check-status.sh`

# Pidyom - Hasura DDN + Neon Auth Integration

A fully configured Hasura DDN project with Neon PostgreSQL and Neon Auth integration, featuring role-based access control and JWT authentication.

## 🎯 What's Inside

- ✅ **Hasura DDN v3** - Modern GraphQL API with supergraph architecture
- ✅ **Neon PostgreSQL** - Serverless PostgreSQL database
- ✅ **Neon Auth Integration** - JWT-based authentication with webhook
- ✅ **Role-Based Access Control** - Admin, User, and Anonymous roles
- ✅ **Docker Compose Setup** - All services containerized and ready to run
- ✅ **Production-Ready** - Includes both development and production configurations

## 🚀 Quick Start

### 1. Prerequisites

- Docker and Docker Compose installed
- Hasura DDN CLI (`ddn`) installed and authenticated
- Node.js 20+ (for local development)
- Access to a Neon PostgreSQL database

### 2. Start the Services

```bash
# Make sure you're in the project directory
cd /Users/danylodyachok/Dev/web/pidyom

# Start all services
ddn run docker-start

# Or use docker compose directly
docker compose up -d
```

### 3. Access the Services

- **Hasura Console**: http://localhost:3280/graphql (or run `ddn console --local`)
- **GraphQL API**: http://localhost:3280/graphql
- **Auth Webhook**: http://localhost:3001
- **Postgres Connector**: http://localhost:8437

### 4. Test It Out

```bash
# Query as anonymous user (limited access)
curl -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { id name } }"}'

# Query as authenticated user (full access to own data)
curl -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "{ users { id name email } }"}'
```

## 📚 Documentation

### Getting Started Guides

- **[QUICK_START.md](QUICK_START.md)** - Get up and running in 5 minutes
- **[NEON_AUTH_SETUP.md](NEON_AUTH_SETUP.md)** - Complete guide to setting up real Neon Auth
- **[NEON_AUTH_INTEGRATION.md](NEON_AUTH_INTEGRATION.md)** - Detailed technical documentation

### Examples

- **[examples/neon-auth-client.html](examples/neon-auth-client.html)** - Full-featured frontend example
- **[examples/client-example.html](examples/client-example.html)** - Simple integration example

### Component Documentation

- **[auth-webhook/README.md](auth-webhook/README.md)** - Auth webhook service documentation

## 🏗️ Project Structure

```
pidyom/
├── app/                          # Main application subgraph
│   ├── connector/
│   │   └── my_pg/               # Neon PostgreSQL connector
│   └── metadata/                # GraphQL schema and permissions
│       ├── Users.hml            # User model with permissions
│       ├── InsertUsers.hml      # Insert mutation
│       ├── UpdateUsers.hml      # Update mutation
│       └── DeleteUsers.hml      # Delete mutation
├── globals/                      # Global configuration
│   └── metadata/
│       ├── auth-config.hml      # Authentication configuration
│       └── graphql-config.hml   # GraphQL configuration
├── auth-webhook/                 # Authentication webhook service
│   ├── index.js                 # Development version (no signature verification)
│   ├── index.production.js      # Production version (with JWT verification)
│   ├── package.json             # Node.js dependencies
│   └── Dockerfile               # Docker configuration
├── engine/                       # Hasura engine build artifacts
├── examples/                     # Example code and demos
├── scripts/                      # Utility scripts
│   └── enable-production-auth.sh # Script to enable production auth
├── compose.yaml                  # Docker Compose configuration
├── supergraph.yaml              # Supergraph configuration
└── .env                         # Environment variables

```

## 🔐 Authentication & Authorization

### Current Setup (Development Mode)

The project is currently in **development mode**:
- Auth webhook validates JWT structure but doesn't verify signatures
- Suitable for local development and testing
- Uses demo JWT tokens

### Roles and Permissions

**Anonymous** (not authenticated)
- Can query users table
- Can only see: `id`, `name` fields
- No mutations allowed

**User** (authenticated)
- Can query users table
- Can only see their own record (filtered by `id = X-Hasura-User-Id`)
- Can see: `id`, `name`, `email`, `createdAt`
- Can perform mutations on their own data

**Admin** (authenticated with admin role)
- Full access to all data
- Can see all fields of all users
- Can perform all mutations

### Switching to Production Mode

To enable real Neon Auth with JWT signature verification:

```bash
# Quick way (automated script)
./scripts/enable-production-auth.sh

# Or manual way
cd auth-webhook
npm install jose
# Update package.json to use index.production.js
# Configure environment variables
cd ..
docker compose build auth-webhook
docker compose restart
```

See **[NEON_AUTH_SETUP.md](NEON_AUTH_SETUP.md)** for detailed instructions.

## 🛠️ Development

### Managing Services

```bash
# Start all services
ddn run docker-start
# OR
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f auth-webhook
docker compose logs -f engine

# Restart a service
docker compose restart auth-webhook
docker compose restart engine

# Rebuild services
docker compose build
docker compose up -d
```

### Making Changes

#### Update Database Schema

```bash
# After changing your Neon database schema
ddn connector introspect my_pg

# Add new models
ddn model add my_pg "*"

# Add new commands (mutations)
ddn command add my_pg "*"

# Add relationships
ddn relationship add my_pg "*"
```

#### Update Permissions

Edit the relevant HML files in `app/metadata/`, then:

```bash
ddn supergraph build local
docker compose restart engine
```

#### Update Auth Configuration

Edit `globals/metadata/auth-config.hml`, then:

```bash
ddn supergraph build local
docker compose restart engine
```

### Testing

```bash
# Test GraphQL API
curl -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { id name } }"}'

# Test auth webhook
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'

# Open interactive console
ddn console --local
```

## 🌐 Frontend Integration

### Install Dependencies

```bash
npm install @neondatabase/auth
```

### Example Usage

```javascript
import { NeonAuth } from '@neondatabase/auth';

// Initialize Neon Auth
const auth = new NeonAuth({
  projectId: 'your-neon-project-id',
  // ... other config from Neon dashboard
});

// Sign in
const { token } = await auth.signIn({
  email: 'user@example.com',
  password: 'password123'
});

// Use token with Hasura
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

const data = await response.json();
```

See `examples/neon-auth-client.html` for a complete working example.

## 🔧 Environment Variables

### Root .env File

```env
# PostgreSQL Connector (already configured)
APP_MY_PG_JDBC_URL=jdbc:postgresql://...
APP_MY_PG_READ_URL=http://local.hasura.dev:8437
APP_MY_PG_WRITE_URL=http://local.hasura.dev:8437

# Neon Auth (configure for production)
NEON_PROJECT_ID=              # Your Neon project ID
NEON_AUTH_ISSUER=             # https://your-project.auth.neon.tech
NEON_JWKS_URI=                # https://your-project.auth.neon.tech/.well-known/jwks.json
```

## 🐛 Troubleshooting

### Services won't start

```bash
# Check Docker is running
docker ps

# Check for port conflicts
lsof -i :3280  # Hasura
lsof -i :3001  # Auth webhook
lsof -i :8437  # Postgres connector

# View all logs
docker compose logs
```

### Permission denied errors

```bash
# Rebuild supergraph
ddn supergraph build local

# Restart engine
docker compose restart engine

# Check auth webhook is running
docker compose logs auth-webhook
```

### JWT validation fails

In development mode, this shouldn't happen. If using production mode:

```bash
# Check webhook logs
docker compose logs auth-webhook

# Verify environment variables are set
docker compose exec auth-webhook env | grep NEON

# Test webhook directly
curl -X POST http://localhost:3001/webhook \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
```

### Database connection issues

```bash
# Test database connection
docker compose exec app_my_pg-1 /bin/sh -c 'echo "select 1" | psql "$APP_MY_PG_JDBC_URL"'

# Re-introspect database
ddn connector introspect my_pg
```

## 📖 Learn More

- **Hasura DDN Documentation**: https://hasura.io/docs/3.0/
- **Neon Documentation**: https://neon.tech/docs
- **Neon Authorize Guide**: https://neon.tech/docs/guides/neon-authorize
- **GraphQL**: https://graphql.org/

## 🤝 Support

For issues and questions:
1. Check the documentation files in this project
2. Review logs: `docker compose logs`
3. Hasura DDN CLI help: `ddn --help`
4. Hasura Discord: https://hasura.io/discord

## 📝 License

[Add your license here]

---

**Built with ❤️ using Hasura DDN and Neon**

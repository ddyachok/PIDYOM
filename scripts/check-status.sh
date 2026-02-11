#!/bin/bash

# Script to check the status of all Neon Auth + Hasura services

echo "🔍 Checking Neon Auth + Hasura Integration Status"
echo "=================================================="
echo ""

# Check Docker
echo "📦 Docker Status:"
if command -v docker &> /dev/null; then
    echo "  ✅ Docker installed"
    if docker ps &> /dev/null; then
        echo "  ✅ Docker daemon running"
    else
        echo "  ❌ Docker daemon not running"
        exit 1
    fi
else
    echo "  ❌ Docker not installed"
    exit 1
fi
echo ""

# Check services
echo "🐳 Service Status:"
if [ -f "compose.yaml" ]; then
    SERVICES=$(docker compose ps --format json 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "  Services running:"
        docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    else
        echo "  ❌ No services running"
        echo "  Run: ddn run docker-start"
    fi
else
    echo "  ❌ compose.yaml not found"
    exit 1
fi
echo ""

# Check endpoints
echo "🌐 Endpoint Health:"

# Check Hasura Engine
if curl -s http://localhost:3280/healthz &> /dev/null; then
    echo "  ✅ Hasura Engine: http://localhost:3280/graphql"
else
    echo "  ❌ Hasura Engine: Not responding"
fi

# Check Auth Webhook
AUTH_HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null)
if [[ $AUTH_HEALTH == *"ok"* ]]; then
    echo "  ✅ Auth Webhook: http://localhost:3001"
else
    echo "  ❌ Auth Webhook: Not responding"
fi

# Check Postgres Connector
if curl -s http://localhost:8437/health &> /dev/null; then
    echo "  ✅ Postgres Connector: http://localhost:8437"
else
    echo "  ❌ Postgres Connector: Not responding"
fi
echo ""

# Check auth mode
echo "🔐 Authentication Mode:"
if docker compose logs auth-webhook 2>/dev/null | grep -q "PRODUCTION"; then
    echo "  🔒 Production Mode (JWT verification enabled)"

    # Check if environment variables are set
    if [ -f ".env" ]; then
        if grep -q "NEON_PROJECT_ID=.\+" .env; then
            echo "  ✅ NEON_PROJECT_ID configured"
        else
            echo "  ⚠️  NEON_PROJECT_ID not set"
        fi

        if grep -q "NEON_AUTH_ISSUER=.\+" .env; then
            echo "  ✅ NEON_AUTH_ISSUER configured"
        else
            echo "  ⚠️  NEON_AUTH_ISSUER not set"
        fi

        if grep -q "NEON_JWKS_URI=.\+" .env; then
            echo "  ✅ NEON_JWKS_URI configured"
        else
            echo "  ⚠️  NEON_JWKS_URI not set"
        fi
    fi
elif docker compose logs auth-webhook 2>/dev/null | grep -q "DEVELOPMENT"; then
    echo "  🔓 Development Mode (JWT verification disabled)"
    echo "  ⚠️  This is suitable for local development only"
    echo "  💡 To enable production mode: ./scripts/enable-production-auth.sh"
else
    echo "  ❓ Unable to determine auth mode"
fi
echo ""

# Test basic functionality
echo "🧪 Basic Functionality Tests:"

# Test anonymous query
echo "  Testing anonymous GraphQL query..."
ANON_RESULT=$(curl -s -X POST http://localhost:3280/graphql \
    -H "Content-Type: application/json" \
    -d '{"query": "{ users { id } }"}' 2>/dev/null)

if [[ $ANON_RESULT == *"data"* ]]; then
    echo "  ✅ Anonymous queries working"
else
    echo "  ❌ Anonymous queries failed"
    echo "     Response: $ANON_RESULT"
fi

# Test webhook
echo "  Testing auth webhook..."
WEBHOOK_RESULT=$(curl -s -X POST http://localhost:3001/webhook \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null)

if [[ $WEBHOOK_RESULT == *"anonymous"* ]]; then
    echo "  ✅ Auth webhook responding correctly"
else
    echo "  ❌ Auth webhook not responding as expected"
    echo "     Response: $WEBHOOK_RESULT"
fi

echo ""

# Summary
echo "📊 Summary:"
echo "  • Project: pidyom"
echo "  • Hasura DDN: $(docker compose exec -T engine /bin/ddn-engine-local --version 2>/dev/null | head -1 || echo 'unknown')"
echo "  • Services: $(docker compose ps --filter "status=running" --format json 2>/dev/null | wc -l | tr -d ' ') running"

echo ""
echo "📚 Documentation:"
echo "  • Quick Start: README.md"
echo "  • Neon Auth Setup: NEON_AUTH_SETUP.md"
echo "  • Integration Guide: NEON_AUTH_INTEGRATION.md"

echo ""
echo "🛠️  Useful Commands:"
echo "  • Start services: ddn run docker-start"
echo "  • Stop services: docker compose down"
echo "  • View logs: docker compose logs -f"
echo "  • Open console: ddn console --local"
echo "  • Enable production auth: ./scripts/enable-production-auth.sh"

echo ""
echo "✨ Status check complete!"

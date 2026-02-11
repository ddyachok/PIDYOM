#!/bin/bash

# Script to migrate from webhook auth to JWT mode with Neon Auth

set -e

echo "🔄 Migrating from Webhook Mode to JWT Mode with Neon Auth"
echo "=========================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "compose.yaml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Neon Auth configuration
NEON_JWKS_URL="https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech/neondb/auth/.well-known/jwks.json"
NEON_AUTH_URL="https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech/neondb/auth"

echo "📋 Configuration:"
echo "   Auth URL: $NEON_AUTH_URL"
echo "   JWKS URL: $NEON_JWKS_URL"
echo ""

# Test JWKS URL
echo "🧪 Testing JWKS URL accessibility..."
if curl -s -f "$NEON_JWKS_URL" > /dev/null 2>&1; then
    echo "✅ JWKS URL is accessible"
else
    echo "❌ Error: Cannot access JWKS URL"
    echo "   Make sure Neon Authorize is enabled in your Neon dashboard"
    echo "   URL: $NEON_JWKS_URL"
    exit 1
fi
echo ""

# Backup current configuration
echo "💾 Creating backup of current auth configuration..."
cp globals/metadata/auth-config.hml globals/metadata/auth-config.hml.backup
cp compose.yaml compose.yaml.backup
echo "✅ Backup created:"
echo "   - globals/metadata/auth-config.hml.backup"
echo "   - compose.yaml.backup"
echo ""

# Update auth-config.hml
echo "📝 Updating auth-config.hml to JWT mode..."
cat > globals/metadata/auth-config.hml << 'EOF'
kind: AuthConfig
version: v4
definition:
  mode:
    jwt:
      key:
        jwkFromUrl: https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech/neondb/auth/.well-known/jwks.json
      claimsConfig:
        namespace:
          claimsFormat: Json
          location: /https://hasura.io/jwt/claims
      tokenLocation:
        type: BearerAuthorization
EOF
echo "✅ auth-config.hml updated"
echo ""

# Comment out auth-webhook in compose.yaml
echo "🐳 Updating compose.yaml (commenting out auth-webhook service)..."
if grep -q "auth-webhook:" compose.yaml; then
    # Create a version with auth-webhook commented out
    sed -i.tmp '/^  auth-webhook:/,/^  [a-z]/s/^/#/' compose.yaml
    sed -i.tmp '/^  auth-webhook:/,/^$/s/^/#/' compose.yaml
    rm compose.yaml.tmp
    echo "✅ auth-webhook service commented out in compose.yaml"
else
    echo "ℹ️  auth-webhook service not found in compose.yaml (already removed?)"
fi
echo ""

# Rebuild supergraph
echo "🏗️  Rebuilding supergraph with new auth configuration..."
if ddn supergraph build local; then
    echo "✅ Supergraph rebuilt successfully"
else
    echo "❌ Error: Failed to rebuild supergraph"
    echo "   Restoring backup..."
    mv globals/metadata/auth-config.hml.backup globals/metadata/auth-config.hml
    mv compose.yaml.backup compose.yaml
    exit 1
fi
echo ""

# Restart services
echo "🔄 Restarting services..."
docker compose down
docker compose up -d
echo "✅ Services restarted"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service status
echo "📊 Service Status:"
docker compose ps
echo ""

# Test endpoints
echo "🧪 Testing endpoints..."

# Test Hasura
if curl -s -f http://localhost:3280/healthz > /dev/null 2>&1; then
    echo "✅ Hasura Engine is running"
else
    echo "⚠️  Hasura Engine might not be ready yet"
fi

# Test that auth-webhook is NOT running
if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "⚠️  Warning: auth-webhook is still running (should be stopped)"
else
    echo "✅ auth-webhook service stopped (as expected)"
fi
echo ""

echo "✅ Migration Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Important Next Steps:"
echo ""
echo "1. Configure Neon Auth JWT Claims"
echo "   Go to your Neon dashboard and configure custom JWT claims:"
echo ""
echo "   {"
echo "     \"https://hasura.io/jwt/claims\": {"
echo "       \"x-hasura-default-role\": \"user\","
echo "       \"x-hasura-allowed-roles\": [\"user\", \"admin\"],"
echo "       \"x-hasura-user-id\": \"\${user.id}\""
echo "     }"
echo "   }"
echo ""
echo "2. Get a Test JWT Token"
echo "   Use Neon Auth SDK or dashboard to get a JWT token"
echo ""
echo "3. Test the Integration"
echo "   curl -X POST http://localhost:3280/graphql \\"
echo "     -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "     -d '{\"query\": \"{ users { id name } }\"}'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Documentation:"
echo "   - Migration guide: MIGRATION_WEBHOOK_TO_JWT.md"
echo "   - Comparison: HASURA_VS_NEON_AUTH.md"
echo "   - Architecture: docs/auth-architecture-comparison.md"
echo ""
echo "🔙 Rollback (if needed):"
echo "   mv globals/metadata/auth-config.hml.backup globals/metadata/auth-config.hml"
echo "   mv compose.yaml.backup compose.yaml"
echo "   ddn supergraph build local"
echo "   docker compose down && docker compose up -d"
echo ""
echo "✨ Your architecture is now simpler and faster!"

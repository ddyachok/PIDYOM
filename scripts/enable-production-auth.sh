#!/bin/bash

# Script to enable production JWT verification for Neon Auth

set -e

echo "🔧 Enabling Production Auth Mode for Neon Auth"
echo ""

# Check if we're in the right directory
if [ ! -f "compose.yaml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if auth-webhook directory exists
if [ ! -d "auth-webhook" ]; then
    echo "❌ Error: auth-webhook directory not found"
    exit 1
fi

echo "📦 Step 1: Installing jose package for JWT verification..."
cd auth-webhook
npm install jose
cd ..
echo "✅ Jose package installed"
echo ""

echo "📝 Step 2: Updating package.json to use production version..."
cd auth-webhook

# Update package.json to use index.production.js
cat > package.json << 'EOF'
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
EOF

cd ..
echo "✅ package.json updated"
echo ""

echo "🔐 Step 3: Setting up environment variables..."
echo ""
echo "Please provide your Neon Auth configuration:"
echo ""

# Prompt for Neon Auth values
read -p "Enter your NEON_PROJECT_ID: " NEON_PROJECT_ID
read -p "Enter your NEON_AUTH_ISSUER (e.g., https://your-project.auth.neon.tech): " NEON_AUTH_ISSUER
read -p "Enter your NEON_JWKS_URI (e.g., https://your-project.auth.neon.tech/.well-known/jwks.json): " NEON_JWKS_URI

echo ""
echo "📄 Updating .env file..."

# Update root .env file
sed -i.bak "s|^NEON_PROJECT_ID=.*|NEON_PROJECT_ID=$NEON_PROJECT_ID|" .env
sed -i.bak "s|^NEON_AUTH_ISSUER=.*|NEON_AUTH_ISSUER=$NEON_AUTH_ISSUER|" .env
sed -i.bak "s|^NEON_JWKS_URI=.*|NEON_JWKS_URI=$NEON_JWKS_URI|" .env

# Create auth-webhook/.env
cat > auth-webhook/.env << EOF
PORT=3001
NEON_PROJECT_ID=$NEON_PROJECT_ID
NEON_AUTH_ISSUER=$NEON_AUTH_ISSUER
NEON_JWKS_URI=$NEON_JWKS_URI
EOF

echo "✅ Environment variables configured"
echo ""

echo "🐳 Step 4: Rebuilding Docker containers..."
docker compose build auth-webhook
echo "✅ Docker container rebuilt"
echo ""

echo "🔄 Step 5: Restarting services..."
docker compose down
docker compose up -d
echo "✅ Services restarted"
echo ""

echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "🧪 Step 6: Testing the webhook..."
echo ""

# Test webhook health
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
echo "Response: $HEALTH_RESPONSE"

if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    echo "Check logs with: docker compose logs auth-webhook"
    exit 1
fi

echo ""
echo "Testing webhook endpoint without auth..."
WEBHOOK_RESPONSE=$(curl -s -X POST http://localhost:3001/webhook -H "Content-Type: application/json" -d '{}')
echo "Response: $WEBHOOK_RESPONSE"

if [[ $WEBHOOK_RESPONSE == *"anonymous"* ]]; then
    echo "✅ Webhook responding correctly"
else
    echo "❌ Unexpected webhook response"
    echo "Check logs with: docker compose logs auth-webhook"
    exit 1
fi

echo ""
echo "📋 Checking auth-webhook logs..."
docker compose logs auth-webhook | tail -5

echo ""
echo "✅ Production auth mode enabled successfully!"
echo ""
echo "📚 Next steps:"
echo "   1. Go to your Neon dashboard and enable Neon Authorize"
echo "   2. Configure your authentication providers"
echo "   3. Get a test JWT token from Neon"
echo "   4. Test with: curl -X POST http://localhost:3001/webhook -H 'Authorization: Bearer YOUR_TOKEN' -d '{}'"
echo ""
echo "📖 For detailed instructions, see: NEON_AUTH_SETUP.md"
echo ""

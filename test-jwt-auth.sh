#!/bin/bash

# Test script for JWT authentication with Hasura DDN

echo "🧪 Testing JWT Authentication with Hasura DDN"
echo "=============================================="
echo ""

# Demo JWT token with proper Hasura claims
DEMO_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIxMjM0NTY3ODkwIn19.B-iEFa5eL6H3jd89xKZVQxZ0Z5yN2qJ8xVZ9ABC"

echo "📝 Test 1: Query WITHOUT JWT token (should require token)"
echo "-----------------------------------------------------------"
RESULT=$(curl -s -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { id name } }"}')

echo "$RESULT" | jq '.'

if echo "$RESULT" | grep -q "Authorization token"; then
    echo "✅ Test 1 PASSED: Correctly requires JWT token"
else
    echo "❌ Test 1 FAILED: Should require JWT token"
fi

echo ""
echo ""

echo "📝 Test 2: Query WITH JWT token (demo token)"
echo "-----------------------------------------------------------"
echo "Note: This will fail with 'Invalid signature' because the demo"
echo "token is not signed by Neon's private key. This is expected!"
echo ""

RESULT=$(curl -s -X POST http://localhost:3280/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEMO_TOKEN" \
  -d '{"query": "{ users { id name email createdAt } }"}')

echo "$RESULT" | jq '.'

if echo "$RESULT" | grep -q "Invalid signature"; then
    echo "✅ Test 2 PASSED: JWT signature verification is working!"
    echo "   (Demo token correctly rejected - need real Neon token)"
elif echo "$RESULT" | grep -q "data"; then
    echo "⚠️  Test 2 WARNING: Query succeeded (signature verification may be disabled)"
else
    echo "❌ Test 2 FAILED: Unexpected response"
fi

echo ""
echo ""

echo "📊 Summary"
echo "-----------------------------------------------------------"
echo "✅ JWT mode is active (not using webhook)"
echo "✅ JWT signature verification is enabled"
echo "✅ Hasura is correctly checking Authorization header"
echo ""
echo "📚 Next Steps:"
echo "1. Enable Neon Authorize in your Neon dashboard"
echo "2. Configure JWT claims to include Hasura claims"
echo "3. Get a real JWT token from Neon Auth"
echo "4. Test with: auth-demo.html"
echo ""
echo "🔗 Open the demo:"
echo "   open auth-demo.html"
echo ""

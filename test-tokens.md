# Test JWT Tokens for Hasura DDN

These tokens are for **testing only**. They use HS256 (not RS256) and won't work with Neon Auth's JWT verification, but they're useful for understanding the JWT claims structure.

## Demo Token (User Role)

This token includes the proper Hasura DDN v4 claims format:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIxMjM0NTY3ODkwIn19.qNW_pBXvf2sKZX8pJT7yyBBxuZqF5fC0KqJ8xVZ-ABC
```

**Decoded Payload:**
```json
{
  "sub": "1234567890",
  "email": "test@example.com",
  "https://hasura.io/jwt/claims": {
    "x-hasura-default-role": "user",
    "x-hasura-allowed-roles": ["user"],
    "x-hasura-user-id": "1234567890"
  }
}
```

**Expected Behavior:**
- Role: `user`
- Can only see their own data (filtered by user ID)
- Should see: id, name, email, createdAt

---

## Demo Token (Admin Role)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbjEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6ImFkbWluIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIiwiYWRtaW4iXSwieC1oYXN1cmEtdXNlci1pZCI6ImFkbWluMTIzIn19.XYZ123ABC456
```

**Decoded Payload:**
```json
{
  "sub": "admin123",
  "email": "admin@example.com",
  "https://hasura.io/jwt/claims": {
    "x-hasura-default-role": "admin",
    "x-hasura-allowed-roles": ["user", "admin"],
    "x-hasura-user-id": "admin123"
  }
}
```

**Expected Behavior:**
- Role: `admin`
- Can see ALL user data
- Full access to all fields

---

## Important Notes

### ⚠️ These Tokens Won't Work with Real Neon Auth

These demo tokens:
- ❌ Use HS256 algorithm (symmetric key)
- ❌ Not signed by Neon's private key
- ❌ Won't pass JWT signature verification

**For production**, you need real tokens from Neon Auth that:
- ✅ Use RS256 algorithm (asymmetric key)
- ✅ Signed by Neon's private key
- ✅ Verifiable with Neon's JWKS endpoint

### How to Get Real Neon Auth Tokens

#### Option 1: Using @neondatabase/auth SDK

```javascript
import { NeonAuth } from '@neondatabase/auth';

const auth = new NeonAuth({
  authUrl: 'https://ep-plain-art-ag9lypls.neonauth.c-2.eu-central-1.aws.neon.tech/neondb/auth'
});

// Sign up
const result = await auth.signUp({
  email: 'user@example.com',
  password: 'SecurePassword123!'
});

console.log('JWT Token:', result.token);
```

#### Option 2: Using Neon Dashboard

1. Go to your Neon project dashboard
2. Navigate to Authorize section
3. Use the built-in test/demo feature
4. Copy the generated JWT token

### Required JWT Claims Structure

Neon Auth must be configured to include these claims:

```json
{
  "sub": "user-id-from-neon",
  "email": "user@example.com",
  "https://hasura.io/jwt/claims": {
    "x-hasura-default-role": "user",
    "x-hasura-allowed-roles": ["user"],
    "x-hasura-user-id": "${user.id}",
    "x-hasura-email": "${user.email}"
  }
}
```

### Claims Configuration in Neon Dashboard

In your Neon Authorize settings, add custom claims:

```json
{
  "https://hasura.io/jwt/claims": {
    "x-hasura-default-role": "user",
    "x-hasura-allowed-roles": ["user", "admin"],
    "x-hasura-user-id": "${user.id}"
  }
}
```

## Testing the Demo

### 1. Open the Demo Page

```bash
# Open in your browser
open auth-demo.html
# or
open http://localhost:8080/auth-demo.html  # if serving locally
```

### 2. Test with Demo Token

1. Paste the demo token in the "JWT token" text area
2. Click "Use Manual Token"
3. Click "Test GraphQL Query"

### 3. Expected Results

#### With User Token:
```json
{
  "data": {
    "users": [
      // Only users where id = "1234567890"
      // Or empty if no matching users
    ]
  }
}
```

#### Without Token (Anonymous):
```json
{
  "data": {
    "users": [
      // All users but only id and name fields
    ]
  }
}
```

## Troubleshooting

### "Missing claim: x-hasura-default-role"

**Cause:** JWT doesn't include required Hasura claims

**Solution:** Make sure JWT has `https://hasura.io/jwt/claims` namespace

### "Invalid signature"

**Cause:** JWT signature verification failed

**Solution:**
- Demo tokens won't work with JWT mode (they're unsigned/wrong algorithm)
- You need real tokens from Neon Auth
- Or temporarily test without signature verification (development only)

### "Permission denied"

**Cause:** Role doesn't have permission for this operation

**Solution:** Check permissions in `app/metadata/Users.hml`

## Next Steps

1. ✅ Test with demo tokens to understand the flow
2. ⏭️ Enable Neon Authorize in Neon dashboard
3. ⏭️ Configure JWT claims in Neon
4. ⏭️ Get real JWT tokens from Neon Auth
5. ⏭️ Test with real tokens
6. ⏭️ Integrate Neon Auth SDK in your frontend

---

**Current Status:** JWT mode is configured and ready! Just need real tokens from Neon Auth.

# Authentication Architecture Comparison

## Current Setup (Webhook Mode)

```
┌─────────┐
│ Browser │
│ /Client │
└────┬────┘
     │
     │ 1. Request with JWT
     ▼
┌──────────────┐
│   Hasura     │
│   Engine     │
└──────┬───────┘
       │
       │ 2. Forward JWT to webhook
       ▼
┌──────────────┐
│    Auth      │
│  Webhook     │ ← Your custom Node.js service
│ (Node.js)    │
└──────┬───────┘
       │
       │ 3. Decode JWT, return session vars
       ▼
┌──────────────┐
│   Hasura     │
│   Engine     │ ← Apply permissions
└──────┬───────┘
       │
       │ 4. Query with permissions
       ▼
┌──────────────┐
│   Neon DB    │
└──────────────┘

⏱️ Latency: ~50-100ms (extra HTTP call to webhook)
🔧 Complexity: HIGH (maintain webhook service)
💰 Cost: FREE (but you maintain it)
```

## Recommended Setup (JWT Mode with Neon Auth)

```
┌─────────┐
│ Browser │
│ /Client │
└────┬────┘
     │
     │ 1. Sign up/Login
     ▼
┌──────────────┐
│  Neon Auth   │ ← Handles user registration, login
└──────┬───────┘
       │
       │ 2. Returns JWT token
       ▼
┌─────────┐
│ Browser │
└────┬────┘
     │
     │ 3. GraphQL request with JWT
     ▼
┌──────────────┐
│   Hasura     │
│   Engine     │ ← Validates JWT directly (JWKS)
│              │ ← Extracts claims
│              │ ← Applies permissions
└──────┬───────┘
       │
       │ 4. Query with permissions
       ▼
┌──────────────┐
│   Neon DB    │
└──────────────┘

⏱️ Latency: ~10-20ms (no webhook call)
🔧 Complexity: LOW (no custom service)
💰 Cost: FREE (included with Neon)
```

## Alternative: JWT Mode with Third-Party Auth

```
┌─────────┐
│ Browser │
└────┬────┘
     │
     │ 1. Sign up/Login
     ▼
┌──────────────┐
│   Auth0 /    │ ← Handles authentication
│   Clerk /    │
│   Firebase   │
└──────┬───────┘
       │
       │ 2. Returns JWT token
       ▼
┌─────────┐
│ Browser │
└────┬────┘
     │
     │ 3. GraphQL request with JWT
     ▼
┌──────────────┐
│   Hasura     │ ← Validates JWT (JWKS from Auth0/etc)
│   Engine     │ ← Applies permissions
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Neon DB    │
└──────────────┘

⏱️ Latency: ~10-20ms
🔧 Complexity: MEDIUM (configure third-party)
💰 Cost: $0-$240/month (depending on provider)
```

## What Each Component Does

### Authentication (User Management)
```
┌────────────────────────────────────┐
│       Neon Auth / Auth0 / Clerk    │
│                                    │
│  ✓ User Registration               │
│  ✓ Login / Logout                  │
│  ✓ Password Management             │
│  ✓ OAuth (Google, GitHub, etc.)    │
│  ✓ Email Verification              │
│  ✓ Password Reset                  │
│  ✓ Session Management              │
│  ✓ Issue JWT Tokens                │
│                                    │
│  ✗ Does NOT handle permissions     │
│  ✗ Does NOT know about your data   │
└────────────────────────────────────┘
```

### Authorization (Permissions)
```
┌────────────────────────────────────┐
│            Hasura DDN              │
│                                    │
│  ✓ Validate JWT Tokens             │
│  ✓ Extract User Info               │
│  ✓ Row-Level Security              │
│  ✓ Field-Level Permissions         │
│  ✓ Role-Based Access Control       │
│  ✓ Data Filtering                  │
│                                    │
│  ✗ Does NOT handle login/signup    │
│  ✗ Does NOT manage users           │
└────────────────────────────────────┘
```

## JWT Token Flow

### Step 1: User Authenticates
```
User → Neon Auth → JWT Token
```

Example JWT Token:
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-123",
    "email": "user@example.com",
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "user",
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": "user-123"
    }
  }
}
```

### Step 2: User Makes Request
```
Browser → Hasura
Headers:
  Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Hasura Validates & Applies Permissions

**JWT Mode (Recommended):**
```
1. Hasura fetches public key from JWKS URL
2. Validates JWT signature
3. Extracts claims: x-hasura-user-id, x-hasura-role
4. Applies permissions based on role
5. Adds filters: WHERE user_id = 'user-123'
6. Executes query
```

**Webhook Mode (Current):**
```
1. Hasura calls webhook: POST /webhook
2. Webhook decodes JWT
3. Webhook returns session variables
4. Hasura applies permissions
5. Hasura adds filters
6. Executes query
```

## Performance Comparison

### JWT Mode
```
Client Request → Hasura → Database
                 ↓
              Validate JWT (cache JWKS)
              Extract claims
              Apply permissions

Total: ~10-20ms
```

### Webhook Mode
```
Client Request → Hasura → Webhook → Hasura → Database
                          ↓
                    Decode JWT
                    Return session vars

Total: ~50-100ms (extra network round-trip)
```

## Security Comparison

| Aspect | JWT Mode | Webhook Mode |
|--------|----------|--------------|
| Token Validation | ✅ Signature verified | ⚠️ Depends on your code |
| Performance | ✅ Fast (cached JWKS) | ⚠️ Slower (HTTP call) |
| Single Point of Failure | ✅ No extra service | ❌ Webhook must be up |
| Attack Surface | ✅ Smaller | ⚠️ Larger (webhook endpoint) |
| Customization | ⚠️ Limited | ✅ Full control |

## Summary

### Use JWT Mode (Recommended) When:
- ✅ Standard authentication is sufficient
- ✅ Want better performance
- ✅ Prefer simpler architecture
- ✅ Using Neon Auth or standard providers (Auth0, Clerk, Firebase)

### Use Webhook Mode When:
- ✅ Need custom authentication logic
- ✅ Integrating with legacy auth systems
- ✅ Complex business rules for authorization
- ✅ Need to call external APIs during auth

### For Your Project:
**Recommendation: Switch to JWT Mode with Neon Auth**

Reasons:
1. Simpler (no webhook to maintain)
2. Faster (no extra HTTP call)
3. Free (included with Neon)
4. More secure (signature verification built-in)
5. Standard approach

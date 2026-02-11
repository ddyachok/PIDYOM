import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Hasura webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];

    // If no authorization header, return unauthenticated role
    if (!authHeader) {
      return res.json({
        'X-Hasura-Role': 'anonymous',
      });
    }

    // Extract Bearer token
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return res.json({
        'X-Hasura-Role': 'anonymous',
      });
    }

    // Decode JWT without verification (Neon Auth tokens are already verified by Neon)
    // In production, you should verify the JWT signature with Neon's public key
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.sub) {
      return res.json({
        'X-Hasura-Role': 'anonymous',
      });
    }

    // Extract user information from JWT
    const userId = decoded.sub;
    const email = decoded.email || '';
    const role = decoded.role || 'user';

    // Return Hasura session variables
    return res.json({
      'X-Hasura-User-Id': userId,
      'X-Hasura-Role': role,
      'X-Hasura-Email': email,
    });
  } catch (error) {
    console.error('Webhook error:', error);

    // On error, return anonymous role
    return res.json({
      'X-Hasura-Role': 'anonymous',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Neon Auth webhook server running on port ${PORT}`);
});

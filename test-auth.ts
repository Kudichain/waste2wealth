// Simple test to verify authentication flow
import express from "express";
import session from "express-session";

const app = express();

app.use(express.json());

// Test session middleware
app.use(
  session({
    secret: 'test-secret',
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    },
  })
);

// Test login endpoint
app.post('/api/test/login', (req: any, res) => {
  console.log('Login request received:', req.body);
  req.session.userId = 'test-user-id';
  res.json({ success: true, userId: req.session.userId });
});

// Test user endpoint
app.get('/api/test/user', (req: any, res) => {
  console.log('User request - session:', req.session);
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({ userId: req.session.userId, authenticated: true });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
});
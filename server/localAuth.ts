// Local Authentication System
import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import crypto from "crypto";
import { storage } from "./storage";
import { sendWelcomeEmail } from "./emailService";

// Simple password hashing using Node.js crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

// Extend Express Request type to include session user
declare global {
  namespace Express {
    interface Request {
      user?: {
        claims: {
          sub: string;
        };
      };
    }
  }
}

export async function setupAuth(app: Express) {
  // Session middleware with better configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
      name: 'sessionId',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: false, // Set to false for development (HTTP)
        sameSite: 'lax',
      },
    })
  );

  // Login endpoint - creates or gets existing user
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { username, password, role } = req.body;
      
      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return res.status(400).json({ message: "Username is required" });
      }

      if (!password || typeof password !== 'string' || password.trim().length === 0) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Special handling for admin login
      if (username === "admin@m.o.t3ch.io") {
        if (password !== "Nig5atom@") {
          return res.status(401).json({ message: "Invalid admin credentials" });
        }
        
        const adminUserId = "admin_user";
        let adminUser = await storage.getUser(adminUserId);
        if (!adminUser) {
          adminUser = await storage.createUser(adminUserId, username);
        }
        // Always ensure admin role is set
        adminUser = await storage.updateUserRole(adminUserId, "admin");
        
        req.session.userId = adminUserId;
        return res.json({ success: true, user: adminUser });
      }

      // Create a simple user ID based on username for regular users
      const userId = `user_${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      
      // Try to get existing user
      let user = await storage.getUser(userId);
      
      if (user) {
        // Existing user - verify password
        if (!user.passwordHash) {
          // User exists but has no password - set one now (migration path)
          const passwordHash = hashPassword(password);
          user = await storage.updateUserPassword(userId, passwordHash);
        } else {
          // Verify password
          if (!verifyPassword(password, user.passwordHash)) {
            return res.status(401).json({ message: "Invalid username or password" });
          }
        }
      } else {
        // New user - create with password
        if (!role || !["collector", "vendor"].includes(role)) {
          return res.status(400).json({ message: "Role is required for new users" });
        }
        
        const passwordHash = hashPassword(password);
        user = await storage.createUserWithPassword(userId, username, passwordHash);
        user = await storage.updateUserRole(userId, role);
        
        // Send welcome email for new users
        await sendWelcomeEmail({
          email: user.email || `${username}@temp.local`,
          firstName: user.firstName || 'New User',
          lastName: user.lastName || '',
          role: role as 'collector' | 'vendor' | 'factory' | 'admin',
          username
        });
      }
      
      // Store user in session
      req.session.userId = userId;
      
      res.json({ success: true, user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // OAuth login endpoints (simplified for demo)
  app.get("/api/auth/google", async (req: any, res) => {
    try {
      const { role } = req.query;
      
      if (!role || !["collector", "vendor"].includes(role)) {
        return res.status(400).json({ message: "Valid role is required" });
      }

      // Simulate OAuth user creation
      const oauthId = `google_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const username = `google_user_${oauthId}`;
      const userId = `user_${oauthId}`;

      // Create user
      let user = await storage.createUser(userId, username);
      user = await storage.updateUserRole(userId, role);

      // Send welcome email
      await sendWelcomeEmail({
        email: user.email || `${username}@temp.local`,
        firstName: user.firstName || 'New User',
        lastName: user.lastName || '',
        role: role as 'collector' | 'vendor' | 'factory' | 'admin',
        username
      });

      // Store user in session
      req.session.userId = userId;
      
      // Redirect to appropriate dashboard
      const redirectPath = role === "collector" ? "/collector" : "/vendors/dashboard";
      res.redirect(redirectPath);
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.status(500).json({ message: "OAuth login failed" });
    }
  });

  app.get("/api/auth/facebook", async (req: any, res) => {
    try {
      const { role } = req.query;
      
      if (!role || !["collector", "vendor"].includes(role)) {
        return res.status(400).json({ message: "Valid role is required" });
      }

      // Simulate OAuth user creation
      const oauthId = `facebook_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const username = `facebook_user_${oauthId}`;
      const userId = `user_${oauthId}`;

      // Create user
      let user = await storage.createUser(userId, username);
      user = await storage.updateUserRole(userId, role);

      // Send welcome email
      await sendWelcomeEmail({
        email: user.email || `${username}@temp.local`,
        firstName: user.firstName || 'New User',
        lastName: user.lastName || '',
        role: role as 'collector' | 'vendor' | 'factory' | 'admin',
        username
      });

      // Store user in session
      req.session.userId = userId;
      
      // Redirect to appropriate dashboard
      const redirectPath = role === "collector" ? "/collector" : "/vendors/dashboard";
      res.redirect(redirectPath);
    } catch (error) {
      console.error("Facebook OAuth error:", error);
      res.status(500).json({ message: "OAuth login failed" });
    }
  });

  // Check authentication status
  app.get("/api/auth/status", async (req: any, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ authenticated: false });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ authenticated: false });
      }
      
      res.json({ authenticated: true, user });
    } catch (error) {
      res.status(500).json({ message: "Failed to check auth status" });
    }
  });

  // User info endpoint
  app.get("/api/auth/user", async (req: any, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie('sessionId');
        res.json({ success: true, message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });
}

// Authentication middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  
  if (!session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Set user object for compatibility with existing code
  req.user = {
    claims: {
      sub: session.userId,
    },
  };

  next();
}

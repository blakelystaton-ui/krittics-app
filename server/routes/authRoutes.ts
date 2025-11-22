/**
 * authRoutes.ts
 * 
 * Production-ready authentication routes for email/password signup and login
 * Features:
 * - POST /api/auth/signup - Create new user account
 * - POST /api/auth/login - Log in with email/password
 * - POST /api/auth/logout - Log out and destroy session
 * - GET /api/auth/user - Get current authenticated user
 */

import type { Express } from "express";
import { randomUUID } from 'crypto';
import { authService } from "../services/AuthService";
import { storage } from "../storage";
import type { User } from "@shared/schema";

export function setupAuthRoutes(app: Express) {
  /**
   * POST /api/auth/signup
   * Register a new user with email, phone, username, password, and interests
   */
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, phone, username, password, interests } = req.body;

      // Validate required fields
      if (!email || !username || !password) {
        return res.status(400).json({ 
          error: 'Missing required fields: email, username, and password are required' 
        });
      }

      // Validate email format
      if (!authService.validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Validate username
      const usernameValidation = authService.validateUsername(username);
      if (!usernameValidation.valid) {
        return res.status(400).json({ error: usernameValidation.message });
      }

      // Validate password strength
      const passwordValidation = authService.validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
      }

      // Normalize and validate phone if provided
      let normalizedPhone: string | undefined;
      if (phone) {
        normalizedPhone = authService.normalizePhone(phone);
        if (!authService.validatePhone(normalizedPhone)) {
          return res.status(400).json({ 
            error: 'Invalid phone number format. Please use E.164 format (e.g., +15551234567)' 
          });
        }
      }

      // Check for existing email
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // Check for existing phone if provided
      if (normalizedPhone) {
        const existingPhone = await storage.getUserByPhone(normalizedPhone);
        if (existingPhone) {
          return res.status(409).json({ error: 'Phone number already exists' });
        }
      }

      // Check for existing username
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      // Hash password
      const passwordHash = await authService.hashPassword(password);

      // Generate permanent UUID for user
      const userId = randomUUID();

      // Create user with all required fields
      const newUser = await storage.upsertUser({
        id: userId,
        email: email.toLowerCase().trim(),
        phone: normalizedPhone,
        username: username.trim(),
        passwordHash,
        interests: Array.isArray(interests) ? interests : [],
        payoutId: '', // Empty for now, will be filled when user connects payout method
        hasCompletedOnboarding: true, // Mark as onboarded since they provided interests
      });

      // Set up session for auto-login
      if (req.session) {
        (req.session as any).userId = newUser.id;
        (req.session as any).user = {
          claims: {
            sub: newUser.id,
            email: newUser.email,
          },
        };
      }

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        message: 'Account created successfully',
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error('[Auth API] Signup error:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  });

  /**
   * POST /api/auth/login
   * Log in with email and password
   */
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValid = await authService.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Set up session
      if (req.session) {
        (req.session as any).userId = user.id;
        (req.session as any).user = {
          claims: {
            sub: user.id,
            email: user.email,
          },
        };
      }

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error('[Auth API] Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  /**
   * POST /api/auth/logout
   * Log out and destroy session
   */
  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error('[Auth API] Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  /**
   * GET /api/auth/user
   * Get current authenticated user
   */
  app.get('/api/auth/user', async (req, res) => {
    try {
      // Check if user is authenticated via session
      const session = req.session as any;
      if (!session?.userId && !session?.user?.claims?.sub) {
        return res.status(401).json({ error: 'Unauthorized - Please login' });
      }

      const userId = session.userId || session.user?.claims?.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('[Auth API] Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });
}

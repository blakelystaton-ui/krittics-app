/**
 * auth.ts
 * 
 * Authentication middleware using Replit Auth (OIDC)
 * Provides isAuthenticated middleware and session setup
 * Based on blueprint:javascript_log_in_with_replit
 */

import type { Express, Request, Response, NextFunction } from "express";
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "../storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

/**
 * Setup Replit Auth (OIDC) for the Express app
 * REQUIRED: Must be called before any authenticated routes
 */
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategyName, strategy);
      registeredStrategies.add(strategyName);
    }
    return strategyName;
  };

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // ===============================
  // Auth Routes
  // ===============================

  /**
   * GET /api/login
   * Initiate Replit Auth login flow
   */
  app.get("/api/login", (req, res, next) => {
    const domain = req.hostname;
    const strategyName = ensureStrategy(domain);
    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/",
    })(req, res, next);
  });

  /**
   * GET /api/callback
   * Handle Replit Auth callback
   */
  app.get("/api/callback", (req, res, next) => {
    const domain = req.hostname;
    const strategyName = ensureStrategy(domain);
    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/",
    })(req, res, next);
  });

  /**
   * POST /api/logout
   * Logout and destroy session
   */
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("[Auth] Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      req.session.destroy(() => {
        res.json({ success: true });
      });
    });
  });
}

/**
 * Middleware: Require authentication for a route
 * Usage: app.get('/protected', isAuthenticated, (req, res) => { ... })
 */
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized - Please login" });
}

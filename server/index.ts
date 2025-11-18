import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// FINAL WORKING CUSTOM-DOMAIN PROTECTION FOR REPLIT 2025
app.use((req, res, next) => {
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const isGoogle = 
    userAgent.includes("mediapartners-google") ||
    userAgent.includes("googlebot") ||
    userAgent.includes("adsbot-google");

  // THIS LINE is the only one that reliably detects real public traffic on Replit custom domains right now
  const isFromReplitPreview = 
    req.headers["x-replit-user-name"] !== undefined || 
    req.headers["x-replit-executor"] !== undefined;

  // If it's Google OR it's the Replit preview/editor → show full site
  if (isGoogle || isFromReplitPreview) {
    return next();
  }

  // Everyone else on the real domain → Coming Soon
  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Krittics – Coming Soon</title>
  <style>
    body{font-family:system-ui,sans-serif;text-align:center;padding:60px;background:#0f172a;color:#e2e8f0;margin:0;}
    h1{font-size:3rem;margin-bottom:0;}
    p{font-size:1.2rem;margin:20px 0;}
  </style>
</head>
<body>
  <h1>Krittics</h1>
  <p>We're putting the finishing touches on the site.<br>Launch coming very soon — stay tuned!</p>
</body>
</html>`);
});

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Serve static legal pages from /pages directory
app.use('/pages', express.static('pages'));

// Prevent aggressive caching in development (especially Safari iOS)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

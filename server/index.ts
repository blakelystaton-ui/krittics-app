import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Google AdSense Crawler Protection
// ONLY apply "Coming Soon" on custom domain, keep Replit preview working
app.use((req, res, next) => {
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  const isGoogle = ua.includes("mediapartners-google") || 
                   ua.includes("googlebot") || 
                   ua.includes("adsbot-google");

  // Get the actual hostname - check X-Forwarded-Host for custom domains
  const actualHost = (req.headers["x-forwarded-host"] || req.hostname || "").toString().toLowerCase();
  
  // Debug logging
  if (req.path === '/') {
    console.log('[Crawler Protection] X-Forwarded-Host:', req.headers["x-forwarded-host"], 'Hostname:', req.hostname, 'ActualHost:', actualHost, 'IsGoogle:', isGoogle);
  }

  // Check if this is a custom domain (not localhost or replit.dev)
  const isCustomDomain = actualHost !== "localhost" && 
                         actualHost !== "replit.dev" && 
                         !actualHost.endsWith(".replit.dev");

  // Show Coming Soon page on custom domain for non-Google visitors
  if (isCustomDomain && !isGoogle) {
    return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Krittics – Coming Soon</title>
  <style>
    body {font-family:system-ui,sans-serif;text-align:center;padding:60px;background:#0f172a;color:#e2e8f0;margin:0;}
    h1 {font-size:3rem;margin-bottom:0;}
    p {font-size:1.2rem;margin:20px 0;}
  </style>
</head>
<body>
  <h1>Krittics</h1>
  <p>We're putting the finishing touches on the site.<br>Launch coming very soon — stay tuned!</p>
</body>
</html>`);
  }
  next();
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

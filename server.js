// server.js
// index.js (or server.js) - ADD TO THE TOP OF THE FILE

import express from "express";
// 1. Import the main function from the gemini config file
// The path may need adjustment (e.g., './config/gemini.js') based on your exact file location.
import { generateAndSaveMovieMetadata } from "./config/gemini.js";

const app = express();

// ... other imports will be here ...
import express from "express";
// 1. Core security imports
import { auth, db } from "./firebase-admin-init.js";
import { checkAuth } from "./auth-middleware.js";

import secureApiRouter from "./secure-api-routes.js"; // 🛑 MUST have created this file 🛑

const app = express();
// Port 5000 is used, as confirmed by your Replit workflow
const port = process.env.PORT || 5000;

// Middleware to handle JSON requests
app.use(express.json());

// ------------------------------------------------------------------
// 🛑 CRITICAL INJECTION POINT 🛑
// ------------------------------------------------------------------

// ADD THIS LINE: Inject the router with the /api/user base path.
// This runs the checkAuth middleware BEFORE any other template routing can happen.
app.use("/api/user", secureApiRouter);

// --- PUBLIC ROUTE (Optional: Keep a simple entry point) ---
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Krittics Backend! The secure API is at /api/user/profile.",
  );
});

// ------------------------------------------------------------------
// (All other server setup, static file serving, and listeners remain below)

// Start the server
app.listen(port, () => {
  console.log(`Krittics backend running on port ${port}`);
});

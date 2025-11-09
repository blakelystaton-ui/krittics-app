// secure-api-routes.js

import express from "express";
// Import the middleware
import { checkAuth } from "./auth-middleware.js";

// Create a new router instance
const router = express.Router();

// ------------------------------------------------------------------
// SECURE ROUTE: Requires a valid Firebase ID Token to access
// ------------------------------------------------------------------
router.get("/user/profile", checkAuth, async (req, res) => {
  // If the request reaches here, authentication is guaranteed.
  const userId = req.user.uid;

  res.send({
    message: "Success! You accessed the secure profile data.",
    userId: userId,
  });
});

export default router;

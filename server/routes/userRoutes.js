const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Log in an existing user
router.post("/login", loginUser);

// Get the current user's profile (protected)
router.get("/me", protect, getMe);

module.exports = router;
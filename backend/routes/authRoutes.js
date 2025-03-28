const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  loginLimiter,
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);

// Protected route - Requires authentication
router.get("/me", protect, getUserProfile);

module.exports = router;

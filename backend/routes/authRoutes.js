const express = require("express");
const {
  registerUser,
  loginUser,
  updateUserProfile,
} = require("../controllers/authController");

const protect = require("../middlewares/authMiddleware")

const router = express.Router();

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, updateUserProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router;

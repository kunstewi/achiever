const express = require("express");
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

// All user routes require authentication and admin privileges
router.use(protect, adminOnly);

// User routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;

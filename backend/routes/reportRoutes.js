const express = require("express");
const {
    getTaskReport,
    exportTasksToExcel,
} = require("../controllers/reportController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// All report routes require authentication
router.use(protect);

// Report routes
router.get("/tasks", getTaskReport);
router.get("/export", exportTasksToExcel);

module.exports = router;

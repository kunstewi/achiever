const express = require("express");
const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskProgress,
    updateTodoChecklist,
} = require("../controllers/taskController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Task routes
router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/progress", updateTaskProgress);
router.patch("/:id/todos", updateTodoChecklist);

module.exports = router;

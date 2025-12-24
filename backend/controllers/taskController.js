const Task = require("../models/Task");
const User = require("../models/User");

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            status,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
        } = req.body;

        // Validate assigned users exist
        if (assignedTo && assignedTo.length > 0) {
            const users = await User.find({ _id: { $in: assignedTo } });
            if (users.length !== assignedTo.length) {
                return res
                    .status(400)
                    .json({ message: "One or more assigned users not found" });
            }
        }

        const task = await Task.create({
            title,
            description,
            priority,
            status,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            attachments,
            todoChecklist,
        });

        const populatedTask = await Task.findById(task._id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email profileImageUrl");

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all tasks with filters
// @route   GET /api/tasks
// @access  Private
const getAllTasks = async (req, res) => {
    try {
        const {
            status,
            priority,
            assignedTo,
            createdBy,
            search,
            page = 1,
            limit = 10,
        } = req.query;

        const query = {};

        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (createdBy) query.createdBy = createdBy;

        // Search by title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const tasks = await Task.find(query)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email profileImageUrl")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Task.countDocuments(query);

        res.json({
            tasks,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalTasks: count,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email profileImageUrl");

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            status,
            dueDate,
            assignedTo,
            attachments,
        } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user is creator or admin
        if (
            task.createdBy.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res
                .status(403)
                .json({ message: "Not authorized to update this task" });
        }

        // Validate assigned users if provided
        if (assignedTo && assignedTo.length > 0) {
            const users = await User.find({ _id: { $in: assignedTo } });
            if (users.length !== assignedTo.length) {
                return res
                    .status(400)
                    .json({ message: "One or more assigned users not found" });
            }
        }

        // Update fields
        if (title) task.title = title;
        if (description !== undefined) task.description = description;
        if (priority) task.priority = priority;
        if (status) task.status = status;
        if (dueDate) task.dueDate = dueDate;
        if (assignedTo) task.assignedTo = assignedTo;
        if (attachments) task.attachments = attachments;

        const updatedTask = await task.save();
        const populatedTask = await Task.findById(updatedTask._id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email profileImageUrl");

        res.json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user is creator or admin
        if (
            task.createdBy.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res
                .status(403)
                .json({ message: "Not authorized to delete this task" });
        }

        await task.deleteOne();
        res.json({ message: "Task removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update task progress
// @route   PATCH /api/tasks/:id/progress
// @access  Private
const updateTaskProgress = async (req, res) => {
    try {
        const { progress } = req.body;

        if (progress < 0 || progress > 100) {
            return res
                .status(400)
                .json({ message: "Progress must be between 0 and 100" });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.progress = progress;

        // Auto-update status based on progress
        if (progress === 0) {
            task.status = "Pending";
        } else if (progress === 100) {
            task.status = "Completed";
        } else {
            task.status = "In Progress";
        }

        const updatedTask = await task.save();
        const populatedTask = await Task.findById(updatedTask._id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email profileImageUrl");

        res.json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update todo checklist
// @route   PATCH /api/tasks/:id/todos
// @access  Private
const updateTodoChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        task.todoChecklist = todoChecklist;

        // Calculate progress based on completed todos
        if (todoChecklist && todoChecklist.length > 0) {
            const completedCount = todoChecklist.filter((todo) => todo.completed).length;
            task.progress = Math.round((completedCount / todoChecklist.length) * 100);

            // Auto-update status
            if (task.progress === 0) {
                task.status = "Pending";
            } else if (task.progress === 100) {
                task.status = "Completed";
            } else {
                task.status = "In Progress";
            }
        }

        const updatedTask = await task.save();
        const populatedTask = await Task.findById(updatedTask._id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email profileImageUrl");

        res.json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskProgress,
    updateTodoChecklist,
};

const Task = require("../models/Task");
const ExcelJS = require("exceljs");

// @desc    Get task statistics and report
// @route   GET /api/reports/tasks
// @access  Private
const getTaskReport = async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;

        // Build query
        const query = {};
        if (userId) {
            query.$or = [{ createdBy: userId }, { assignedTo: userId }];
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Get all tasks matching query
        const tasks = await Task.find(query);

        // Calculate statistics
        const totalTasks = tasks.length;

        // By status
        const statusStats = {
            Pending: tasks.filter((t) => t.status === "Pending").length,
            "In Progress": tasks.filter((t) => t.status === "In Progress").length,
            Completed: tasks.filter((t) => t.status === "Completed").length,
        };

        // By priority
        const priorityStats = {
            Low: tasks.filter((t) => t.priority === "Low").length,
            Medium: tasks.filter((t) => t.priority === "Medium").length,
            High: tasks.filter((t) => t.priority === "High").length,
        };

        // Average progress
        const averageProgress =
            totalTasks > 0
                ? tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks
                : 0;

        // Overdue tasks
        const now = new Date();
        const overdueTasks = tasks.filter(
            (t) => new Date(t.dueDate) < now && t.status !== "Completed"
        ).length;

        // Completion rate
        const completionRate =
            totalTasks > 0 ? (statusStats.Completed / totalTasks) * 100 : 0;

        res.json({
            totalTasks,
            statusStats,
            priorityStats,
            averageProgress: Math.round(averageProgress),
            overdueTasks,
            completionRate: Math.round(completionRate),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Export tasks to Excel
// @route   GET /api/reports/export
// @access  Private
const exportTasksToExcel = async (req, res) => {
    try {
        const { status, priority, assignedTo, createdBy } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (createdBy) query.createdBy = createdBy;

        // Get tasks
        const tasks = await Task.find(query)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks");

        // Define columns
        worksheet.columns = [
            { header: "Title", key: "title", width: 30 },
            { header: "Description", key: "description", width: 40 },
            { header: "Status", key: "status", width: 15 },
            { header: "Priority", key: "priority", width: 15 },
            { header: "Progress", key: "progress", width: 10 },
            { header: "Due Date", key: "dueDate", width: 15 },
            { header: "Created By", key: "createdBy", width: 25 },
            { header: "Assigned To", key: "assignedTo", width: 30 },
            { header: "Created At", key: "createdAt", width: 20 },
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4472C4" },
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

        // Add data rows
        tasks.forEach((task) => {
            worksheet.addRow({
                title: task.title,
                description: task.description || "",
                status: task.status,
                priority: task.priority,
                progress: `${task.progress}%`,
                dueDate: new Date(task.dueDate).toLocaleDateString(),
                createdBy: task.createdBy ? task.createdBy.name : "",
                assignedTo: task.assignedTo
                    .map((user) => user.name)
                    .join(", "),
                createdAt: new Date(task.createdAt).toLocaleString(),
            });
        });

        // Apply conditional formatting for status
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                const statusCell = row.getCell(3);
                if (statusCell.value === "Completed") {
                    statusCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FF92D050" },
                    };
                } else if (statusCell.value === "In Progress") {
                    statusCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFFFC000" },
                    };
                } else if (statusCell.value === "Pending") {
                    statusCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFFF6B6B" },
                    };
                }
            }
        });

        // Set response headers
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=tasks-${Date.now()}.xlsx`
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getTaskReport,
    exportTasksToExcel,
};

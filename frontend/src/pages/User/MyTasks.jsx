import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import { TASK_ENDPOINTS } from "../../utils/apiPaths";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import moment from "moment";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.search) params.append("search", filters.search);

      const response = await axiosInstance.get(`${TASK_ENDPOINTS.GET_ALL}?${params}`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axiosInstance.delete(TASK_ENDPOINTS.DELETE(id));
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const updateProgress = async (id, progress) => {
    try {
      await axiosInstance.patch(TASK_ENDPOINTS.UPDATE_PROGRESS(id), { progress });
      toast.success("Progress updated");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: "", priority: "", search: "" })}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No tasks found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-gray-600 mb-4">{task.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${task.priority === "High" ? "bg-red-100 text-red-800" :
                          task.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                        }`}>
                        {task.priority}
                      </span>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${task.status === "Completed" ? "bg-green-100 text-green-800" :
                          task.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                        }`}>
                        {task.status}
                      </span>
                      <span className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full">
                        Due: {moment(task.dueDate).format("MMM DD, YYYY")}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Todo Checklist */}
                    {task.todoChecklist && task.todoChecklist.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Checklist:</p>
                        <div className="space-y-1">
                          {task.todoChecklist.slice(0, 3).map((todo, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={todo.completed}
                                readOnly
                                className="mr-2"
                              />
                              <span className={todo.completed ? "line-through text-gray-500" : "text-gray-700"}>
                                {todo.text}
                              </span>
                            </div>
                          ))}
                          {task.todoChecklist.length > 3 && (
                            <p className="text-xs text-gray-500">+{task.todoChecklist.length - 3} more items</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;

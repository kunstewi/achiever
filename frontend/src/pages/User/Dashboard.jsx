import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import { TASK_ENDPOINTS, REPORT_ENDPOINTS } from "../../utils/apiPaths";
import { FaTasks, FaCheckCircle, FaClock, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch task statistics
      const statsRes = await axiosInstance.get(REPORT_ENDPOINTS.GET_STATS);
      setStats(statsRes.data);

      // Fetch recent tasks
      const tasksRes = await axiosInstance.get(`${TASK_ENDPOINTS.GET_ALL}?limit=5`);
      setRecentTasks(tasksRes.data.tasks || []);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Here's an overview of your tasks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTasks || 0}</p>
              </div>
              <FaTasks className="text-blue-600 text-3xl" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats?.statusStats?.Completed || 0}</p>
              </div>
              <FaCheckCircle className="text-green-600 text-3xl" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.statusStats?.["In Progress"] || 0}</p>
              </div>
              <FaSpinner className="text-yellow-600 text-3xl" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-2xl font-bold text-red-600">{stats?.statusStats?.Pending || 0}</p>
              </div>
              <FaClock className="text-red-600 text-3xl" />
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
          </div>
          <div className="p-6">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tasks yet. Create your first task!</p>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${task.priority === "High" ? "bg-red-100 text-red-800" :
                              task.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                                "bg-green-100 text-green-800"
                            }`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${task.status === "Completed" ? "bg-green-100 text-green-800" :
                              task.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                                "bg-gray-100 text-gray-800"
                            }`}>
                            {task.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Progress: {task.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

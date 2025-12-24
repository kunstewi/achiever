import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaTasks, FaUser, FaSignOutAlt, FaChartBar, FaUsers, FaPlus } from "react-icons/fa";
import { useState } from "react";

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center">
                            <FaTasks className="text-blue-600 text-2xl mr-2" />
                            <span className="text-xl font-bold text-gray-800">Achiever</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAdmin ? (
                            <>
                                <Link
                                    to="/admin/dashboard"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/admin/dashboard")
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <FaChartBar className="inline mr-2" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/admin/tasks"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/admin/tasks")
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <FaTasks className="inline mr-2" />
                                    All Tasks
                                </Link>
                                <Link
                                    to="/admin/create-task"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/admin/create-task")
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <FaPlus className="inline mr-2" />
                                    Create Task
                                </Link>
                                <Link
                                    to="/admin/users"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/admin/users")
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <FaUsers className="inline mr-2" />
                                    Users
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/dashboard")
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <FaChartBar className="inline mr-2" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/my-tasks"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/my-tasks")
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <FaTasks className="inline mr-2" />
                                    My Tasks
                                </Link>
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center">
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden md:block text-sm font-medium text-gray-700">
                                    {user?.name}
                                </span>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                        <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {user?.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <FaSignOutAlt className="mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

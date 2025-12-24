import { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { AUTH_ENDPOINTS } from "../utils/apiPaths";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Register function
    const register = async (userData) => {
        try {
            const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, userData);
            const { token, ...userInfo } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userInfo));
            setUser(userInfo);

            toast.success("Registration successful!");
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || "Registration failed";
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Login function
    const login = async (credentials) => {
        try {
            const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials);
            const { token, ...userInfo } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userInfo));
            setUser(userInfo);

            toast.success("Login successful!");
            return { success: true, user: userInfo };
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        toast.success("Logged out successfully");
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            const response = await axiosInstance.put(AUTH_ENDPOINTS.UPDATE_PROFILE, profileData);
            const updatedUser = response.data;

            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            toast.success("Profile updated successfully!");
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || "Profile update failed";
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

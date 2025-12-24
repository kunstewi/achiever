// API Base URL
export const API_BASE_URL = "http://localhost:8000/api";

// Auth Endpoints
export const AUTH_ENDPOINTS = {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    GET_PROFILE: `${API_BASE_URL}/auth/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
};

// Task Endpoints
export const TASK_ENDPOINTS = {
    CREATE: `${API_BASE_URL}/tasks`,
    GET_ALL: `${API_BASE_URL}/tasks`,
    GET_BY_ID: (id) => `${API_BASE_URL}/tasks/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/tasks/${id}`,
    DELETE: (id) => `${API_BASE_URL}/tasks/${id}`,
    UPDATE_PROGRESS: (id) => `${API_BASE_URL}/tasks/${id}/progress`,
    UPDATE_TODOS: (id) => `${API_BASE_URL}/tasks/${id}/todos`,
};

// User Endpoints (Admin only)
export const USER_ENDPOINTS = {
    GET_ALL: `${API_BASE_URL}/users`,
    GET_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/users/${id}`,
    DELETE: (id) => `${API_BASE_URL}/users/${id}`,
};

// Report Endpoints
export const REPORT_ENDPOINTS = {
    GET_STATS: `${API_BASE_URL}/reports/tasks`,
    EXPORT_EXCEL: `${API_BASE_URL}/reports/export`,
};

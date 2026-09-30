// API base URL configuration
// Using relative URL so Vite proxy forwards to backend during development
const BASE_URL = '/api';

// Helper function to handle HTTP requests with cookie-based authentication
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const config = {
    credentials: 'include', // Automatically send and receive cookies with requests
    ...options,
    headers
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, session cookie might be expired or invalid
      if (response.status === 401) {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }

      const error = new Error(data.message || 'Something went wrong');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Re-throw with user-friendly message
    throw error;
  }
}

// Authentication API endpoints
export const authApi = {
  // Register a new user
  register: (userData) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Login existing user
  login: (credentials) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // Logout user
  logout: () => {
    return request('/auth/logout', {
      method: 'POST'
    });
  },

  // Get current logged-in user details
  getMe: () => {
    return request('/auth/me', {
      method: 'GET'
    });
  }
};

// Task Management API endpoints
export const taskApi = {
  // Get all tasks with optional filters (status, priority, search, sortBy, sortOrder)
  getTasks: (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, { method: 'GET' });
  },

  // Get a single task by ID
  getTaskById: (id) => {
    return request(`/tasks/${id}`, {
      method: 'GET'
    });
  },

  // Create a new task
  createTask: (taskData) => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  // Update an existing task
  updateTask: (id, taskData) => {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  },

  // Delete a task
  deleteTask: (id) => {
    return request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }
};

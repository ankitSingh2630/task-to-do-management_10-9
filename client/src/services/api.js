const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error('VITE_API_URL is not defined');
}

// Helper function to handle HTTP requests with cookie-based authentication
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const config = {
    credentials: 'include',
    ...options,
    headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}


// Authentication API
export const authApi = {
  register: (userData) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  login: (credentials) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  logout: () => {
    return request('/auth/logout', {
      method: 'POST'
    });
  },

  getMe: () => {
    return request('/auth/me', {
      method: 'GET'
    });
  }
};


// Task API
export const taskApi = {
  getTasks: (filters = {}) => {
    const queryParams = new URLSearchParams();

    if (filters.status) {
      queryParams.append('status', filters.status);
    }

    if (filters.priority) {
      queryParams.append('priority', filters.priority);
    }

    if (filters.search) {
      queryParams.append('search', filters.search);
    }

    if (filters.sortBy) {
      queryParams.append('sortBy', filters.sortBy);
    }

    if (filters.sortOrder) {
      queryParams.append('sortOrder', filters.sortOrder);
    }

    const queryString = queryParams.toString();

    const endpoint = `/tasks${
      queryString ? `?${queryString}` : ''
    }`;

    return request(endpoint, {
      method: 'GET'
    });
  },

  getTaskById: (id) => {
    return request(`/tasks/${id}`, {
      method: 'GET'
    });
  },

  createTask: (taskData) => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  updateTask: (id, taskData) => {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  },

  deleteTask: (id) => {
    return request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }
};
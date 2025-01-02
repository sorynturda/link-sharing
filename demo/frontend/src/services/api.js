const API_URL = 'http://localhost:8080/api';

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  auth: {
    login: (username, password) => {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      return api.request('/auth/authenticate', {
        method: 'POST',
        body: formData,
      });
    },

    register: (username, email, password) => {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);

      return api.request('/auth/register', {
        method: 'POST',
        body: formData,
      });
    },
  }
};
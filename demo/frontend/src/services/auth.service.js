// src/services/auth.service.js
import axios from '../utils/axios';

const AUTH_API_URL = '/api/auth';

export const login = async (username, password) => {
  const response = await axios.post(`${AUTH_API_URL}/login`, {
    username,
    password,
  });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const register = async (username, email, password) => {
  return axios.post(`${AUTH_API_URL}/register`, {
    username,
    email,
    password,
  });
};

export const logout = () => {
  localStorage.removeItem('user');
};

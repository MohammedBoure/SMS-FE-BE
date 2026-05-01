/**
 * Authentication API Service
 * Handles login and user-related API calls
 */

import request from "./request";

export const authAPI = {
  login: async (username, password) => {
    return request("/users/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  logout: () => {
    localStorage.removeItem("user");
  },

  getUser: async (userId) => {
    return request(`/users/${userId}`);
  },

  updateUser: async (userId, userData) => {
    return request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },
};

export default authAPI;

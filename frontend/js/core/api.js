// js/core/api.js

const API_BASE_URL = "https://sms-fe-be.onrender.com";

const Api = {
  async request(method, endpoint, body = null) {
    const session = Storage.getSession();
    
    const headers = {}; 
    if (session.token) headers["Authorization"] = `Bearer ${session.token}`;

    const options = { method, headers };

    if (body) {
      if (body instanceof FormData) {
        options.body = body;
      } else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      const detail = data?.detail || data?.message || "Request failed";
      throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }

    return data;
  },

  get(endpoint) { return this.request("GET", endpoint); },
  post(endpoint, body) { return this.request("POST", endpoint, body); },
  put(endpoint, body) { return this.request("PUT", endpoint, body); },
  patch(endpoint, body) { return this.request("PATCH", endpoint, body); },
  delete(endpoint) { return this.request("DELETE", endpoint); },
};

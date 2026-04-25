// js/core/storage.js

const Storage = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    const item = localStorage.getItem(key);
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  clear() {
    localStorage.clear();
  },
  getSession() {
    return {
      token: this.get("token"),
      user_id: this.get("user_id"),
      role: this.get("role"),
    };
  },
  saveSession(user) {
    this.set("user_id", user.id);
    this.set("role", user.role_name);
    if (user.token) this.set("token", user.token);
  },
  clearSession() {
    this.remove("token");
    this.remove("user_id");
    this.remove("role");
  },
};
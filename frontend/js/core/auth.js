const Auth = {
  async login(username, password) {
    const data = await Api.post("/users/login", { username, password });
    const user = data.user;
    Storage.saveSession(user);
    return user;
  },

  logout() {
    Storage.clearSession();
    window.location.href = "../pages/login.html";
  },

  getSession() {
    return Storage.getSession();
  },

  isAuthenticated() {
    const session = Storage.getSession();
    return !!(session.role && session.user_id);
  },

  requireAuth(expectedRole = null) {
    if (!this.isAuthenticated()) {
      window.location.href = "../pages/login.html";
      return false;
    }
    const session = Storage.getSession();
    if (expectedRole && session.role !== expectedRole) {
      window.location.href = "../pages/login.html";
      return false;
    }
    return true;
  },
};

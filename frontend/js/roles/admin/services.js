const AdminServices = {
  async getUsers(roleFilter = null, activeFilter = null) {
    let endpoint = "/users";
    const params = [];
    if (roleFilter) params.push(`role_name=${roleFilter}`);
    if (activeFilter !== null) params.push(`is_active=${activeFilter}`);
    if (params.length) endpoint += "?" + params.join("&");
    return await Api.get(endpoint);
  },

  async createUser(userData) {
    return await Api.post("/users", userData);
  },

  async updateUser(userId, userData) {
    return await Api.put(`/users/${userId}`, userData);
  },

  async deleteUser(userId) {
    return await Api.delete(`/users/${userId}`);
  },

  async changeUserStatus(userId, isActive) {
    return await Api.patch(`/users/${userId}/status`, { is_active: isActive });
  },

  async getStudents() {
    return await Api.get("/students");
  },

  async getTeachers() {
    return await Api.get("/teachers");
  },

  async getClasses() {
    return await Api.get("/classes");
  },

  async getPayments() {
    return await Api.get("/payments");
  },

  async getNotifications() {
    return await Api.get("/notifications");
  },

  async getAttendance() {
    return await Api.get("/attendance");
  },

  async getAssessments() {
    return await Api.get("/assessments");
  },
};

// js/roles/admin/services.js

const AdminServices = {
  // --- الإدارة والمستخدمين ---
  async getUsers(roleFilter = null) {
    let url = "/users";
    if (roleFilter) url += `?role_name=${roleFilter}`;
    return await Api.get(url);
  },
  async changeUserStatus(userId, isActive) { return await Api.patch(`/users/${userId}/status`, { is_active: isActive }); },
  async getParents() { return await Api.get("/parents"); },
  async getParentStudents(parentId) { return await Api.get(`/parents/${parentId}/students`); },

  // --- الشؤون الأكاديمية ---
  async getClasses() { return await Api.get("/classes"); },
  async getClassesOccupancy() { return await Api.get("/classes/occupancy"); },
  async getStudents() { return await Api.get("/students"); },
  async getTeachers() { return await Api.get("/teachers"); },
  async getEnrollments() { return await Api.get("/enrollments"); },
  async getAttendance() { return await Api.get("/attendance"); },
  async getSchedules() { return await Api.get("/schedules"); },
  async getAssessments() { return await Api.get("/assessments"); },
  async getGrades() { return await Api.get("/grades"); },

  // --- المالية والموارد ---
  async getStudentFees() { return await Api.get("/student-fees"); },
  async getPayments() { return await Api.get("/payments"); },
  async getTransactions() { return await Api.get("/transactions"); },
  async getResources() { return await Api.get("/resources"); },

  // --- التواصل والإعلانات ---
  async getConversations() { return await Api.get("/conversations"); },
  async getNotifications() {
    const session = Storage.getSession();
    return await Api.get(`/notifications/user/${session.user_id}`);
  },
  async getPosts() { 
    return await Api.get("/posts"); 
  },

  // --- دوال الحذف العامة ---
  async deleteRecord(endpoint, id) {
    return await Api.delete(`${endpoint}/${id}`);
  }
};
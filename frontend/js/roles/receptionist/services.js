// js/roles/receptionist/services.js

const ReceptionistServices = {
  // === البحث والعرض ===
  async searchUsers(keyword) {
    return await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);
  },
  async getStudents() {
    return await Api.get("/students/");
  },
  async getStudent(studentId) {
    return await Api.get(`/students/${studentId}`);
  },
  async getParents() {
    return await Api.get("/parents/");
  },
  async getClasses() {
    return await Api.get("/classes/");
  },

  // === التسجيل (إنشاء حسابات) ===
  // ملاحظة: يجب أن يكون للـ Receptionist صلاحية إنشاء مستخدمين في Backend
  async createUser(userData) {
    return await Api.post("/users/", userData);
  },
  async updateUser(userId, userData) {
    return await Api.put(`/users/${userId}`, userData);
  },
  async createParent(parentId) {
    return await Api.post("/parents/", { user_id: parentId });
  },
  async createStudent(studentData) {
    return await Api.post("/students/", studentData);
  },
  async updateStudent(studentId, studentData) {
    return await Api.put(`/students/${studentId}`, studentData);
  },

  // === المتابعة الأكاديمية ===
  async getStudentGrades(studentId) {
    return await Api.get(`/grades/student/${studentId}`);
  },
  async getStudentAttendance(studentId) {
    return await Api.get(`/attendance/student/${studentId}`);
  },

  // === المالية ===
  async getStudentFees(studentId) {
    return await Api.get(`/student-fees/student/${studentId}`);
  },
  async processPayment(paymentData) {
    return await Api.post("/payments/", paymentData);
  },

  // === الإشعارات ===
  async getNotifications(userId) {
    return await Api.get(`/notifications/user/${userId}`);
  }
};

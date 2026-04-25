// js/roles/accountant/services.js

const AccountantServices = {
  async getPayments(page = 1) { return await Api.get(`/payments/?page=${page}&limit=50`); },
  async getAllFees(page = 1) { return await Api.get(`/student-fees/?page=${page}&limit=50`); },
  async getTransactions(page = 1) { return await Api.get(`/transactions/?page=${page}&limit=50`); },
  
  // دوال المستخدمين والطلاب (مع الصفحات)
  async getStudents(page = 1) { return await Api.get(`/students/?page=${page}&limit=50`); },
  async getAllUsers(page = 1) { return await Api.get(`/users/?page=${page}&limit=50`); },
  async searchUsers(keyword, page = 1) { return await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=50`); },
  
  async getStudent(studentId) { return await Api.get(`/students/${studentId}`); },
  async getStudentFees(studentId) { return await Api.get(`/student-fees/student/${studentId}`); },
  async getStudentPayments(studentId) { return await Api.get(`/payments/student/${studentId}`); },
  async getStudentAttendance(studentId) { return await Api.get(`/attendance/student/${studentId}`); },
  
  // العمليات
  async createFee(feeData) { return await Api.post("/student-fees/", feeData); },
  async recordPayment(paymentData) { return await Api.post("/payments/", paymentData); },
  async sendNotification(data) { return await Api.post("/notifications/", data); }
};
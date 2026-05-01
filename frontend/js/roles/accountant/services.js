// js/roles/accountant/services.js

const AccountantServices = {
  async getPayments(page = 1) { return await Api.get(`/payments/?page=${page}&limit=50`); },
  async getAllFees(page = 1) { return await Api.get(`/student-fees/?page=${page}&limit=50`); },
  async getTransactions(page = 1) { return await Api.get(`/transactions/?page=${page}&limit=50`); },
  
  // User and student APIs with pagination.
  async getStudents(page = 1) { return await Api.get(`/students/?page=${page}&limit=50`); },
  async getAllUsers(page = 1) { return await Api.get(`/users/?page=${page}&limit=50`); },
  async searchUsers(keyword, page = 1) { return await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=50`); },

  async getMessagesInbox(userId) { return await Api.get(`/messages/inbox/${userId}`); },
  async getConversation(userId, contactId) { return await Api.get(`/messages/conversation/${userId}/${contactId}`); },
  async sendMessage(senderId, receiverId, content) {
    return await Api.post("/messages/", {
      sender_id: parseInt(senderId),
      receiver_id: parseInt(receiverId),
      content
    });
  },
  async getNotifications(userId) { return await Api.get(`/notifications/user/${userId}`); },
  async markNotificationAsRead(notificationId) { return await Api.patch(`/notifications/${notificationId}/read`); },
  async markAllNotificationsAsRead(userId) { return await Api.patch(`/notifications/user/${userId}/read-all`); },
  
  async getStudent(studentId) { return await Api.get(`/students/${studentId}`); },
  async getStudentFees(studentId) { return await Api.get(`/student-fees/student/${studentId}`); },
  async getStudentPayments(studentId) { return await Api.get(`/payments/student/${studentId}`); },
  async getStudentAttendance(studentId) { return await Api.get(`/attendance/student/${studentId}`); },
  
  // Accountant operations.
  async createFee(feeData) { return await Api.post("/student-fees/", feeData); },
  async recordPayment(paymentData) { return await Api.post("/payments/", paymentData); },
  async sendNotification(data) { return await Api.post("/notifications/", data); }
};

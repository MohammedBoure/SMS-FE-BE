// js/roles/receptionist/services.js

const ReceptionistServices = {
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
  async getStudentGrades(studentId) {
    return await Api.get(`/grades/student/${studentId}`);
  },
  async getStudentAttendance(studentId) {
    return await Api.get(`/attendance/student/${studentId}`);
  },
  async getStudentFees(studentId) {
    return await Api.get(`/student-fees/student/${studentId}`);
  },
  async processPayment(paymentData) {
    return await Api.post("/payments/", paymentData);
  },
  async getNotifications(userId) {
    return await Api.get(`/notifications/user/${userId}`);
  },
  async markNotificationAsRead(notificationId) {
    return await Api.patch(`/notifications/${notificationId}/read`);
  },
  async markAllNotificationsAsRead(userId) {
    return await Api.patch(`/notifications/user/${userId}/read-all`);
  },
  async getPosts() {
    return await Api.get("/posts");
  },
  async createPost(data) {
    return await Api.post("/posts/", data);
  },
  async updatePost(postId, data) {
    return await Api.put(`/posts/${postId}`, data);
  },
  async deletePost(postId) {
    return await Api.delete(`/posts/${postId}`);
  },
  async getMessagesInbox(userId) {
    return await Api.get(`/messages/inbox/${userId}`);
  },
  async getConversation(userId, contactId) {
    return await Api.get(`/messages/conversation/${userId}/${contactId}`);
  },
  async sendMessage(senderId, receiverId, content) {
    return await Api.post("/messages/", {
      sender_id: parseInt(senderId),
      receiver_id: parseInt(receiverId),
      content
    });
  }
};

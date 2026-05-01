// js/roles/parent/services.js

const ParentServices = {
  // Parent profile by user id.
  async getParentProfile(userId) {
    return await Api.get(`/parents/user/${userId}`);
  },

  // Linked students.
  async getMyChildren(parentId) {
    return await Api.get(`/parents/${parentId}/students`);
  },

  // Student grades.
  async getChildGrades(studentId) {
    return await Api.get(`/grades/student/${studentId}`);
  },

  // Student attendance.
  async getChildAttendance(studentId) {
    return await Api.get(`/attendance/student/${studentId}`);
  },

  // Student fees.
  async getChildFees(studentId) {
    return await Api.get(`/student-fees/student/${studentId}`);
  },

  // Parent notifications by user id.
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

  async searchUsers(keyword) {
    return await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);
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

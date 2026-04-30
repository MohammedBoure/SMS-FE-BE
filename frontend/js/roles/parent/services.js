// js/roles/parent/services.js

const ParentServices = {
  // جلب الملف الشخصي للولي بواسطة رقم المستخدم (للحصول على parent_id)
  async getParentProfile(userId) {
    return await Api.get(`/parents/user/${userId}`);
  },

  // جلب قائمة الأبناء
  async getMyChildren(parentId) {
    return await Api.get(`/parents/${parentId}/students`);
  },

  // جلب علامات طالب معين
  async getChildGrades(studentId) {
    return await Api.get(`/grades/student/${studentId}`);
  },

  // جلب غياب طالب معين
  async getChildAttendance(studentId) {
    return await Api.get(`/attendance/student/${studentId}`);
  },

  // جلب الرسوم المالية لطالب معين
  async getChildFees(studentId) {
    return await Api.get(`/student-fees/student/${studentId}`);
  },

  // جلب إشعارات الولي (بواسطة user_id وليس parent_id لأن الإشعارات مرتبطة بالمستخدم)
  async getNotifications(userId) {
    return await Api.get(`/notifications/user/${userId}`);
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

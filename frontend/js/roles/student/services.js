// js/roles/student/services.js

const StudentServices = {
  async getStudentProfile(userId) {
    const response = await Api.get("/students/");
    const students = Array.isArray(response) ? response : (response?.data || []);
    return students.find(s => s.user_id === userId);
  },

  async getMyGrades(studentId) {
    return await Api.get(`/grades/student/${studentId}`);
  },

  async getMyAttendance(studentId) {
    return await Api.get(`/attendance/student/${studentId}`);
  },

  async getMySchedule(classId) {
    if (!classId) return [];
    return await Api.get(`/schedules/class/${classId}`);
  },

  async getMyAssessments(classId) {
    if (!classId) return [];
    try {
      return await Api.get(`/assessments/class/${classId}`);
    } catch (e) {
      return []; 
    }
  },

  async getMyFees(studentId) {
    return await Api.get(`/student-fees/student/${studentId}`);
  },

  async getResources() {
    return await Api.get("/resources/");
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
  },

  async getMyNotifications(userId) {
    return await Api.get(`/notifications/user/${userId}`);
  }
};

// js/roles/teacher/services.js

const TeacherServices = {
  async getMyAssignments(teacherId) {
    return await Api.get(`/assignments/teacher/${teacherId}`);
  },

  async getMySchedule(teacherId) {
    return await Api.get(`/schedules/teacher/${teacherId}`);
  },

  async getAttendanceSheet(classId, date) {
    return await Api.get(`/attendance/class/${classId}/sheet?target_date=${date}`);
  },

  async saveAttendance(data) {
    return await Api.post("/attendance/", data);
  },

  async getAssessments(assignmentId) {
    return await Api.get(`/assessments/assignment/${assignmentId}`);
  },

  async createAssessment(data) {
    return await Api.post("/assessments/", data);
  },

  async getAssessmentGrades(assessmentId) {
    return await Api.get(`/grades/assessment/${assessmentId}`);
  },

  async saveGrade(data) {
    return await Api.post("/grades/", data);
  },

  async getResources(assignmentId) {
    const response = await Api.get("/resources/");
    const resources = Array.isArray(response) ? response : (response?.data || []);
    if (!assignmentId) return resources;

    return resources.filter(resource => Number(resource.assignment_id) === Number(assignmentId));
  },

  async uploadResource(formData) {
    return await Api.post("/resources/upload", formData);
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

  async getNotifications(userId) {
    return await Api.get(`/notifications/user/${userId}`);
  },

  async markNotificationAsRead(notificationId) {
    return await Api.patch(`/notifications/${notificationId}/read`);
  },

  async markAllNotificationsAsRead(userId) {
    return await Api.patch(`/notifications/user/${userId}/read-all`);
  }
};

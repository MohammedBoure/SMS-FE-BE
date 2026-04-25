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
    return await Api.get(`/resources/assignment/${assignmentId}`);
  },

  async uploadResource(formData) {
    return await Api.post("/resources/upload", formData);
  },

  async getNotifications(userId) {
    return await Api.get(`/notifications/user/${userId}`);
  }
};
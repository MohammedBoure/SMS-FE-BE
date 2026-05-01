/**
 * Dashboard API Service
 * Aggregates backend data for role-based dashboards
 */

import request from "./request";

const toQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  if (!entries.length) {
    return "";
  }
  return `?${new URLSearchParams(Object.fromEntries(entries)).toString()}`;
};

export const dashboardAPI = {
  getTeachers: () => request("/teachers"),
  getClassesOccupancy: () => request("/classes/occupancy"),
  getTeacherAssignments: (teacherId) =>
    request(`/assignments/teacher/${teacherId}`),
  getTeacherSchedule: (teacherId) => request(`/schedules/teacher/${teacherId}`),
  getAssessmentsByAssignment: (assignmentId) =>
    request(`/assessments/assignment/${assignmentId}`),
  getAssessmentGrades: (assessmentId) =>
    request(`/grades/assessment/${assessmentId}`),
  getAssessmentStatistics: (assessmentId) =>
    request(`/grades/assessment/${assessmentId}/statistics`),
  getClassAttendanceSheet: (classId, targetDate) =>
    request(
      `/attendance/class/${classId}/sheet${toQueryString({ target_date: targetDate })}`,
    ),
  getMessagesInbox: (userId) => request(`/messages/inbox/${userId}`),
  getNotifications: (userId, unreadOnly = false, limit = 5) =>
    request(
      `/notifications/user/${userId}${toQueryString({ unread_only: unreadOnly, limit })}`,
    ),
  getPosts: () => request("/posts"),
  getResources: () => request("/resources"),
};

export async function loadTeacherDashboardData(user) {
  if (!user?.id) {
    return null;
  }

  const [
    teachers,
    classesOccupancy,
    messages,
    notifications,
    posts,
    resources,
  ] = await Promise.all([
    dashboardAPI.getTeachers(),
    dashboardAPI.getClassesOccupancy(),
    dashboardAPI.getMessagesInbox(user.id),
    dashboardAPI.getNotifications(user.id, false, 5),
    dashboardAPI.getPosts(),
    dashboardAPI.getResources(),
  ]);

  const teacher = teachers.find((item) => item.user_id === user.id) || null;

  let assignments = [];
  let schedule = [];
  let classAttendance = [];
  let recentAssessment = null;
  let grades = [];
  let assessmentStats = {
    total_grades: 0,
    average_grade: 0,
    highest_grade: 0,
    lowest_grade: 0,
  };

  if (teacher?.teacher_id) {
    const [teacherAssignments, teacherSchedule] = await Promise.all([
      dashboardAPI.getTeacherAssignments(teacher.teacher_id),
      dashboardAPI.getTeacherSchedule(teacher.teacher_id),
    ]);

    assignments = teacherAssignments;
    schedule = teacherSchedule;

    const firstAssignment = teacherAssignments[0];
    if (firstAssignment?.assignment_id) {
      const assessmentList = await dashboardAPI.getAssessmentsByAssignment(
        firstAssignment.assignment_id,
      );
      recentAssessment = assessmentList[0] || null;

      if (recentAssessment?.assessment_id) {
        const [gradesList, stats] = await Promise.all([
          dashboardAPI.getAssessmentGrades(recentAssessment.assessment_id),
          dashboardAPI.getAssessmentStatistics(recentAssessment.assessment_id),
        ]);
        grades = gradesList;
        assessmentStats = stats || assessmentStats;
      }
    }

    const firstClass = teacherAssignments[0];
    if (firstClass?.class_id) {
      const today = new Date().toISOString().split("T")[0];
      classAttendance = await dashboardAPI.getClassAttendanceSheet(
        firstClass.class_id,
        today,
      );
    }
  }

  return {
    user,
    teacher,
    classesOccupancy,
    assignments,
    schedule,
    classAttendance,
    recentAssessment,
    grades,
    assessmentStats,
    messages,
    notifications,
    posts,
    resources,
  };
}

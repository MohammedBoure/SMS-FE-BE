// js/roles/teacher/role.js

const TeacherRole = {
  currentSection: "assignments",
  teacherId: null,
  myAssignments: [],
  userProfile: null,

  async init() {
    if (!Auth.requireAuth("teacher")) return;

    if (window.I18n) {
      await I18n.init({ scope: "teacher", defaultLang: "ar" });
    }

    const session = Auth.getSession();

    try {
      this.userProfile = await Api.get(`/users/${session.user_id}`);
      TeacherUI.renderHeader(session, this.userProfile);

      const response = await Api.get("/teachers/");
      const teachers = Array.isArray(response) ? response : (response?.data || []);
      const currentTeacher = teachers.find(teacher => Number(teacher.user_id) === Number(session.user_id));

      if (!currentTeacher) {
        throw new Error(TeacherUI.t(
          "teacher.state.teacherProfileMissing",
          {},
          "Your account is not registered as a teacher. Please contact administration."
        ));
      }

      this.teacherId = currentTeacher.teacher_id || currentTeacher.id;
      this.myAssignments = await TeacherServices.getMyAssignments(this.teacherId);

      this.bindNavEvents();
      this.bindLanguageEvents();
      this.bindDynamicEvents();
      this.loadSection(this.currentSection);
    } catch (err) {
      console.error("Teacher initialization failed:", err);
      TeacherUI.renderError(err.message || TeacherUI.t(
        "teacher.state.initFailed",
        {},
        "Failed to initialize teacher data."
      ));
    }
  },

  bindLanguageEvents() {
    if (this._languageEventsBound) return;

    window.addEventListener("i18n:change", (event) => {
      if (event.detail?.scope && event.detail.scope !== "teacher") return;
      TeacherUI.renderHeader(Auth.getSession(), this.userProfile);
      this.loadSection(this.currentSection);
    });

    this._languageEventsBound = true;
  },

  bindNavEvents() {
    if (this._navEventsBound) return;

    const nav = document.getElementById("teacher-nav");
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-btn");
      if (btn) this.loadSection(btn.dataset.section);
    });

    this._navEventsBound = true;
  },

  async loadSection(section) {
    this.currentSection = section;
    TeacherUI.renderNav(section);
    TeacherUI.renderLoading();

    try {
      switch (section) {
        case "assignments":
          TeacherUI.renderAssignments(this.myAssignments);
          break;

        case "schedule": {
          const schedule = await TeacherServices.getMySchedule(this.teacherId);
          TeacherUI.renderSchedule(schedule);
          break;
        }

        case "attendance":
          TeacherUI.renderAttendance(this.myAssignments);
          break;

        case "grades":
          TeacherUI.renderGrades(this.myAssignments);
          break;

        case "resources":
          TeacherUI.renderResources(this.myAssignments);
          break;

        case "posts": {
          const posts = await TeacherServices.getPosts();
          TeacherUI.renderPosts(posts);
          break;
        }

        case "messages": {
          const messageSession = Auth.getSession();
          const inbox = await TeacherServices.getMessagesInbox(messageSession.user_id);
          TeacherUI.renderMessages(inbox, messageSession.user_id);
          break;
        }

        case "notifications": {
          const session = Auth.getSession();
          const notifications = await TeacherServices.getNotifications(session.user_id);
          TeacherUI.renderNotifications(notifications);
          break;
        }

        default:
          TeacherUI.renderError(TeacherUI.t("teacher.state.unknownSection", {}, "Unknown section"));
      }
    } catch (err) {
      TeacherUI.renderError(err.message);
    }
  },

  bindDynamicEvents() {
    if (this._dynamicEventsBound) return;

    const main = document.getElementById("teacher-main");
    if (!main) return;

    main.addEventListener("click", async (e) => {
      if (e.target.id === "teacher-mark-all-notifications-read") {
        const session = Auth.getSession();
        const originalText = e.target.textContent;
        e.target.disabled = true;
        e.target.textContent = TeacherUI.t("teacher.common.updating", {}, "Updating...");
        try {
          await TeacherServices.markAllNotificationsAsRead(session.user_id);
          await this.loadSection("notifications");
        } catch (err) {
          e.target.disabled = false;
          e.target.textContent = originalText;
          alert(err.message || TeacherUI.t(
            "teacher.actions.notificationsUpdateFailed",
            {},
            "Could not update notifications."
          ));
        }
        return;
      }

      const markNotificationBtn = e.target.closest(".teacher-mark-notification-read");
      if (markNotificationBtn) {
        const originalText = markNotificationBtn.textContent;
        markNotificationBtn.disabled = true;
        markNotificationBtn.textContent = TeacherUI.t("teacher.common.updating", {}, "Updating...");
        try {
          await TeacherServices.markNotificationAsRead(markNotificationBtn.dataset.notificationId);
          await this.loadSection("notifications");
        } catch (err) {
          markNotificationBtn.disabled = false;
          markNotificationBtn.textContent = originalText;
          alert(err.message || TeacherUI.t(
            "teacher.actions.notificationUpdateFailed",
            {},
            "Could not update the notification."
          ));
        }
        return;
      }

      if (e.target.id === "load-attendance-btn") {
        const classId = document.getElementById("attendance-class-select").value;
        const date = document.getElementById("attendance-date").value;
        const students = await TeacherServices.getAttendanceSheet(classId, date);
        TeacherUI.renderAttendanceSheet(students, date);
      }

      if (e.target.classList.contains("save-attendance-btn")) {
        const studentId = e.target.dataset.studentId;
        const classId = document.getElementById("attendance-class-select")?.value || null;
        const selectElement = document.querySelector(`.attendance-status[data-student-id="${studentId}"]`);
        await TeacherServices.saveAttendance({
          student_id: studentId,
          class_id: classId ? parseInt(classId, 10) : null,
          target_date: selectElement.dataset.date,
          status: selectElement.value
        });
        alert(TeacherUI.t("teacher.actions.attendanceSaved", {}, "Attendance saved."));
      }

      if (e.target.id === "load-assessments-btn") {
        const assignmentId = document.getElementById("grades-assignment-select").value;
        const assessments = await TeacherServices.getAssessments(assignmentId);
        TeacherUI.renderAssessmentsList(assessments, assignmentId);
      }

      if (e.target.id === "create-assess-btn") {
        const assignmentId = e.target.dataset.assignmentId;
        await TeacherServices.createAssessment({
          title: document.getElementById("new-assess-title").value,
          type: document.getElementById("new-assess-type").value,
          max_grade: parseFloat(document.getElementById("new-assess-max").value),
          assignment_id: parseInt(assignmentId, 10)
        });
        alert(TeacherUI.t("teacher.actions.assessmentCreated", {}, "Assessment created."));
        document.getElementById("load-assessments-btn").click();
      }

      if (e.target.classList.contains("load-grades-btn")) {
        const assessmentId = e.target.dataset.assessmentId;
        const grades = await TeacherServices.getAssessmentGrades(assessmentId);
        TeacherUI.renderGradesSheet(grades, assessmentId);
      }

      if (e.target.classList.contains("save-grade-btn")) {
        const studentId = e.target.dataset.studentId;
        const assessmentId = e.target.dataset.assessmentId;
        await TeacherServices.saveGrade({
          student_id: parseInt(studentId, 10),
          assessment_id: parseInt(assessmentId, 10),
          grade_value: parseFloat(document.querySelector(`.grade-input[data-student-id="${studentId}"]`).value),
          teacher_remarks: document.querySelector(`.remark-input[data-student-id="${studentId}"]`).value
        });
        alert(TeacherUI.t("teacher.actions.gradeSaved", {}, "Grade saved."));
      }
    });

    main.addEventListener("submit", async (e) => {
      if (e.target.id === "upload-resource-form") {
        e.preventDefault();
        const formData = new FormData();
        formData.append("assignment_id", document.getElementById("resource-assignment-id").value);
        formData.append("title", document.getElementById("resource-title").value);
        formData.append("resource_type", document.getElementById("resource-type").value);
        formData.append("file", document.getElementById("resource-file").files[0]);

        await TeacherServices.uploadResource(formData);
        alert(TeacherUI.t("teacher.actions.resourceUploaded", {}, "Resource uploaded."));
        e.target.reset();
      }
    });

    this._dynamicEventsBound = true;
  }
};

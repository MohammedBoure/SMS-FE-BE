// js/roles/student/role.js

const StudentRole = {
  currentSection: "schedule",
  studentId: null,
  classId: null,
  userProfile: null,

  async init() {
    if (!Auth.requireAuth("student")) return;

    if (window.I18n) {
      await I18n.init({ scope: "student", defaultLang: "ar" });
    }

    const session = Auth.getSession();

    try {
      this.userProfile = await Api.get(`/users/${session.user_id}`);
      StudentUI.renderHeader(this.userProfile);

      const studentsResponse = await Api.get("/students/");
      const studentsList = Array.isArray(studentsResponse) ? studentsResponse : (studentsResponse?.data || []);
      const targetUserId = Number(session.user_id);

      const studentProfile = studentsList.find(student =>
        (student.user_id && Number(student.user_id) === targetUserId) ||
        (student.student_name && student.student_name === this.userProfile.full_name) ||
        (student.full_name && student.full_name === this.userProfile.full_name)
      );

      if (!studentProfile) {
        throw new Error(StudentUI.t(
          "student.state.studentProfileMissing",
          {},
          "Your account is not registered as a student. Please contact administration."
        ));
      }

      const studentId = studentProfile.id || studentProfile.student_id;
      let fullStudentProfile = studentProfile;

      if (studentId) {
        try {
          const details = await StudentServices.getStudentById(studentId);
          fullStudentProfile = { ...studentProfile, ...(details || {}) };
        } catch (detailsErr) {
          console.warn("Could not load full student details:", detailsErr);
        }
      }

      this.studentId = fullStudentProfile.id || fullStudentProfile.student_id || studentId;
      this.classId = fullStudentProfile.class_id || fullStudentProfile.legacy_class_id || studentProfile.class_id || null;

      this.bindNavEvents();
      this.bindLanguageEvents();
      this.bindDynamicEvents();
      this.loadSection(this.currentSection);
    } catch (err) {
      console.error("Student initialization failed:", err);
      StudentUI.renderError(err.message || StudentUI.t(
        "student.state.initFailed",
        {},
        "Failed to initialize student data."
      ));
    }
  },

  bindLanguageEvents() {
    if (this._languageEventsBound) return;

    window.addEventListener("i18n:change", (event) => {
      if (event.detail?.scope && event.detail.scope !== "student") return;
      StudentUI.renderHeader(this.userProfile);
      this.loadSection(this.currentSection);
    });

    this._languageEventsBound = true;
  },

  bindNavEvents() {
    if (this._navEventsBound) return;

    const nav = document.getElementById("student-nav");
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-btn");
      if (btn) this.loadSection(btn.dataset.section);
    });

    this._navEventsBound = true;
  },

  bindDynamicEvents() {
    if (this._dynamicEventsBound) return;

    const main = document.getElementById("student-main");
    if (!main) return;

    main.addEventListener("click", async (e) => {
      if (e.target.id === "student-clear-resource-filters") {
        StudentUI.clearResourceFilters();
        return;
      }

      if (e.target.id === "student-mark-all-notifications-read") {
        const session = Auth.getSession();
        const originalText = e.target.textContent;
        e.target.disabled = true;
        e.target.textContent = StudentUI.t("student.common.updating", {}, "Updating...");
        try {
          await StudentServices.markAllNotificationsAsRead(session.user_id);
          await this.loadSection("notifications");
        } catch (err) {
          e.target.disabled = false;
          e.target.textContent = originalText;
          alert(err.message || StudentUI.t(
            "student.actions.notificationsUpdateFailed",
            {},
            "Could not update notifications."
          ));
        }
        return;
      }

      const markNotificationBtn = e.target.closest(".student-mark-notification-read");
      if (markNotificationBtn) {
        const originalText = markNotificationBtn.textContent;
        markNotificationBtn.disabled = true;
        markNotificationBtn.textContent = StudentUI.t("student.common.updating", {}, "Updating...");
        try {
          await StudentServices.markNotificationAsRead(markNotificationBtn.dataset.notificationId);
          await this.loadSection("notifications");
        } catch (err) {
          markNotificationBtn.disabled = false;
          markNotificationBtn.textContent = originalText;
          alert(err.message || StudentUI.t(
            "student.actions.notificationUpdateFailed",
            {},
            "Could not update the notification."
          ));
        }
      }
    });

    main.addEventListener("change", (e) => {
      if (e.target.id === "student-resource-type-filter") {
        StudentUI.updateResourceFilters({ type: e.target.value });
      }

      if (e.target.id === "student-resource-sort-select") {
        StudentUI.updateResourceFilters({ sort: e.target.value });
      }
    });

    main.addEventListener("input", (e) => {
      if (e.target.id === "student-resource-search-input") {
        StudentUI.updateResourceFilters({ query: e.target.value }, "student-resource-search-input");
      }
    });

    this._dynamicEventsBound = true;
  },

  async loadSection(section) {
    this.currentSection = section;
    StudentUI.renderNav(section);
    StudentUI.renderLoading();

    try {
      switch (section) {
        case "schedule": {
          const schedule = await StudentServices.getMySchedule(this.studentId);
          StudentUI.renderSchedule(schedule);
          break;
        }
        case "assessments": {
          const assessments = await StudentServices.getMyAssessments(this.studentId);
          StudentUI.renderAssessments(assessments);
          break;
        }
        case "grades": {
          const grades = await StudentServices.getMyGrades(this.studentId);
          StudentUI.renderGrades(grades);
          break;
        }
        case "attendance": {
          const records = await StudentServices.getMyAttendance(this.studentId);
          StudentUI.renderAttendance(records);
          break;
        }
        case "resources": {
          const resources = await StudentServices.getResources();
          StudentUI.renderResources(resources);
          break;
        }
        case "posts": {
          const posts = await StudentServices.getPosts();
          StudentUI.renderPosts(posts);
          break;
        }
        case "messages": {
          const session = Auth.getSession();
          const inbox = await StudentServices.getMessagesInbox(session.user_id);
          StudentUI.renderMessages(inbox, session.user_id);
          break;
        }
        case "fees": {
          const fees = await StudentServices.getMyFees(this.studentId);
          StudentUI.renderFees(fees);
          break;
        }
        case "notifications": {
          const session = Auth.getSession();
          const notifications = await StudentServices.getMyNotifications(session.user_id);
          StudentUI.renderNotifications(notifications);
          break;
        }
        default:
          StudentUI.renderError(StudentUI.t("student.state.unknownSection", {}, "Unknown section"));
      }
    } catch (err) {
      console.error("Could not load student section:", err);
      StudentUI.renderError(err.message);
    }
  }
};

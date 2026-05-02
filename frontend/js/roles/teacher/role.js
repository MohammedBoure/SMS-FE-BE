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
          await this.loadResourcesForSelectedAssignment();
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

      const loadGradesBtn = e.target.closest(".load-grades-btn");
      if (loadGradesBtn) {
        await this.loadGradesForAssessment(loadGradesBtn);
      }

      if (e.target.classList.contains("save-grade-btn")) {
        const studentId = e.target.dataset.studentId;
        const assessmentId = e.target.dataset.assessmentId;
        const gradeInput = document.querySelector(`.grade-input[data-student-id="${studentId}"]`);
        const remarkInput = document.querySelector(`.remark-input[data-student-id="${studentId}"]`);
        const gradeValue = parseFloat(gradeInput?.value);

        if (!Number.isFinite(gradeValue)) {
          alert(TeacherUI.t("teacher.grades.invalidGrade", {}, "Please enter a valid grade."));
          return;
        }

        await TeacherServices.saveGrade({
          student_id: parseInt(studentId, 10),
          assessment_id: parseInt(assessmentId, 10),
          grade_value: gradeValue,
          teacher_remarks: remarkInput?.value || ""
        });
        alert(TeacherUI.t("teacher.actions.gradeSaved", {}, "Grade saved."));
      }

      if (e.target.id === "clear-resource-filters") {
        TeacherUI.clearResourceFilters();
      }
    });

    main.addEventListener("change", async (e) => {
      if (e.target.id === "resource-assignment-id") {
        TeacherUI.resetResourceFilters();
        await this.loadResourcesForSelectedAssignment();
      }

      if (e.target.id === "resource-file") {
        TeacherUI.updateSelectedResourceFile(e.target.files?.[0] || null);
      }

      if (e.target.id === "resource-type-filter") {
        TeacherUI.updateResourceFilters({ type: e.target.value });
      }

      if (e.target.id === "resource-sort-select") {
        TeacherUI.updateResourceFilters({ sort: e.target.value });
      }
    });

    main.addEventListener("input", (e) => {
      if (e.target.id === "resource-search-input") {
        TeacherUI.updateResourceFilters({ query: e.target.value }, "resource-search-input");
      }
    });

    main.addEventListener("submit", async (e) => {
      if (e.target.id === "upload-resource-form") {
        e.preventDefault();
        const assignmentSelect = document.getElementById("resource-assignment-id");
        const assignmentId = assignmentSelect?.value || "";
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton?.textContent || "";
        const formData = new FormData();
        formData.append("assignment_id", assignmentId);
        formData.append("title", document.getElementById("resource-title").value);
        formData.append("resource_type", document.getElementById("resource-type").value);
        formData.append("file", document.getElementById("resource-file").files[0]);

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = TeacherUI.t("teacher.resources.uploading", {}, "Uploading...");
        }

        try {
          await TeacherServices.uploadResource(formData);
          alert(TeacherUI.t("teacher.actions.resourceUploaded", {}, "Resource uploaded."));
          e.target.reset();
          if (assignmentSelect) assignmentSelect.value = assignmentId;
          TeacherUI.updateSelectedResourceFile(null);
          await this.loadResourcesForSelectedAssignment();
        } catch (err) {
          alert(err.message || TeacherUI.t("teacher.resources.uploadFailed", {}, "Could not upload the resource."));
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText || TeacherUI.t("teacher.resources.uploadButton", {}, "Upload resource");
          }
        }
      }
    });

    this._dynamicEventsBound = true;
  },

  async loadGradesForAssessment(button) {
    const assessmentId = button.dataset.assessmentId;
    if (!assessmentId) {
      alert(TeacherUI.t("teacher.grades.missingAssessment", {}, "Assessment ID is missing."));
      return;
    }

    const assignmentId = button.dataset.assignmentId || document.getElementById("grades-assignment-select")?.value;
    const assignment = this.myAssignments.find(item => Number(item.assignment_id) === Number(assignmentId));
    const classId = assignment?.class_id;
    const maxGrade = Number(button.dataset.maxGrade);
    const sheetContainer = document.getElementById("grades-sheet-container");
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = TeacherUI.t("teacher.common.loading", {}, "Loading...");
    if (sheetContainer) {
      sheetContainer.innerHTML = `<p>${TeacherUI.t("teacher.state.loading", {}, "Loading data...")}</p>`;
    }

    try {
      const [grades, enrollments] = await Promise.all([
        TeacherServices.getAssessmentGrades(assessmentId),
        classId ? TeacherServices.getClassEnrollments(classId).catch(() => []) : Promise.resolve([])
      ]);
      TeacherUI.renderGradesSheet(
        this.buildGradeSheetRows(grades, enrollments, Number.isFinite(maxGrade) ? maxGrade : undefined),
        assessmentId
      );
    } catch (err) {
      TeacherUI.renderError(err.message);
    } finally {
      button.disabled = false;
      button.textContent = originalText || TeacherUI.t("teacher.grades.enterGrades", {}, "Enter grades");
    }
  },

  buildGradeSheetRows(gradesData, enrollmentsData, maxGrade) {
    const grades = this.toArray(gradesData);
    const enrollments = this.toArray(enrollmentsData);
    const rowsByStudent = new Map();

    enrollments.forEach(enrollment => {
      const studentId = Number(enrollment.student_id);
      if (!studentId) return;
      rowsByStudent.set(studentId, {
        student_id: studentId,
        student_name: enrollment.student_name,
        grade_value: null,
        teacher_remarks: "",
        max_grade: maxGrade ?? enrollment.max_grade ?? ""
      });
    });

    grades.forEach(grade => {
      const studentId = Number(grade.student_id);
      if (!studentId) return;
      const existing = rowsByStudent.get(studentId) || {};
      rowsByStudent.set(studentId, {
        ...existing,
        ...grade,
        student_id: studentId,
        student_name: grade.student_name || existing.student_name,
        max_grade: grade.max_grade ?? existing.max_grade ?? maxGrade ?? ""
      });
    });

    return Array.from(rowsByStudent.values())
      .sort((a, b) => String(a.student_name || "").localeCompare(String(b.student_name || "")));
  },

  toArray(value) {
    return Array.isArray(value) ? value : (value?.data || []);
  },

  async loadResourcesForSelectedAssignment() {
    const select = document.getElementById("resource-assignment-id");
    if (!select || !select.value) return;

    TeacherUI.renderResourcesLoading();
    try {
      const resources = await TeacherServices.getResources(select.value);
      TeacherUI.renderResourcesList(resources);
    } catch (err) {
      TeacherUI.renderResourcesError(err.message);
    }
  }
};

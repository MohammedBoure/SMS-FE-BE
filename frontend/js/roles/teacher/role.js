// js/roles/teacher/role.js

const TeacherRole = {
  currentSection: "assignments",
  teacherId: null,
  myAssignments: [],

  async init() {
    if (!Auth.requireAuth("teacher")) return;
    const session = Auth.getSession();

    try {
      // 1. جلب بيانات المستخدم الأساسية
      const teacherUser = await Api.get(`/users/${session.user_id}`);
      TeacherUI.renderHeader(session, teacherUser);

      // 2. البحث عن رقم الأستاذ (teacher_id) المرتبط برقم المستخدم
      const teachers = await Api.get('/teachers/');
      const currentTeacher = teachers.find(t => t.user_id === session.user_id);

      if (!currentTeacher) {
        throw new Error("حسابك غير مسجل كأستاذ في قاعدة البيانات. تواصل مع الإدارة.");
      }
      // حفظ المعرّف الحقيقي للأستاذ
      this.teacherId = currentTeacher.teacher_id;

      // 3. جلب الأقسام والمواد المسندة لهذا الأستاذ تحديداً
      this.myAssignments = await TeacherServices.getMyAssignments(this.teacherId);

      this.bindNavEvents();
      this.loadSection(this.currentSection);
      this.bindDynamicEvents();

    } catch (err) {
      console.error(err);
      TeacherUI.renderError(err.message || "فشل في تهيئة بيانات الأستاذ.");
    }
  },

  bindNavEvents() {
    const nav = document.getElementById("teacher-nav");
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-btn");
      if (btn) {
        this.loadSection(btn.dataset.section);
      }
    });
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
        case "schedule":
          // نمرر teacherId الديناميكي الصحيح
          const schedule = await TeacherServices.getMySchedule(this.teacherId);
          TeacherUI.renderSchedule(schedule);
          break;
        case "attendance":
          TeacherUI.renderAttendance(this.myAssignments);
          break;
        case "grades":
          TeacherUI.renderGrades(this.myAssignments);
          break;
        case "resources":
          TeacherUI.renderResources(this.myAssignments);
          break;
        case "posts":
          const posts = await TeacherServices.getPosts();
          TeacherUI.renderPosts(posts);
          break;
        case "messages":
          const messageSession = Auth.getSession();
          const inbox = await TeacherServices.getMessagesInbox(messageSession.user_id);
          TeacherUI.renderMessages(inbox, messageSession.user_id);
          break;
        case "notifications":
          const session = Auth.getSession();
          const notifications = await TeacherServices.getNotifications(session.user_id);
          TeacherUI.renderNotifications(notifications);
          break;
        default:
          TeacherUI.renderError("قسم غير معروف");
      }
    } catch (err) {
      TeacherUI.renderError(err.message);
    }
  },

  bindDynamicEvents() {
    const main = document.getElementById("teacher-main");

    main.addEventListener("click", async (e) => {
      if (e.target.id === "load-attendance-btn") {
        const classId = document.getElementById("attendance-class-select").value;
        const date = document.getElementById("attendance-date").value;
        const students = await TeacherServices.getAttendanceSheet(classId, date);
        TeacherUI.renderAttendanceSheet(students, date);
      }

      if (e.target.classList.contains("save-attendance-btn")) {
        const studentId = e.target.dataset.studentId;
        const selectElement = document.querySelector(`.attendance-status[data-student-id="${studentId}"]`);
        await TeacherServices.saveAttendance({
          student_id: studentId,
          target_date: selectElement.dataset.date,
          status: selectElement.value
        });
        alert("تم حفظ الحضور!");
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
          assignment_id: parseInt(assignmentId)
        });
        alert("تم الإنشاء!");
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
          student_id: parseInt(studentId),
          assessment_id: parseInt(assessmentId),
          grade_value: parseFloat(document.querySelector(`.grade-input[data-student-id="${studentId}"]`).value),
          teacher_remarks: document.querySelector(`.remark-input[data-student-id="${studentId}"]`).value
        });
        alert("تم رصد العلامة!");
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
        alert("تم رفع الملف!");
        e.target.reset();
      }
    });
  }
};

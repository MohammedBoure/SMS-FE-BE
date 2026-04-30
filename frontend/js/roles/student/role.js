// js/roles/student/role.js

const StudentRole = {
  currentSection: "schedule", 
  studentId: null,
  classId: null,

  async init() {
    if (!Auth.requireAuth("student")) return;
    const session = Auth.getSession();

    console.log("=== 🔍 بداية تشخيص بيانات الطالب ===");

    try {
      const userProfile = await Api.get(`/users/${session.user_id}`);
      StudentUI.renderHeader(userProfile);

      // استخراج قائمة الطلاب بشكل آمن ليدعم نظام الصفحات (Pagination)
      const studentsResponse = await Api.get("/students/");
      const studentsList = Array.isArray(studentsResponse) ? studentsResponse : (studentsResponse?.data || []);

      const targetUserId = parseInt(session.user_id);

      // مطابقة ذكية: نبحث بـ user_id أو نطابق الاسم الكامل
      const studentProfile = studentsList.find(s => 
        (s.user_id && parseInt(s.user_id) === targetUserId) || 
        (s.student_name && s.student_name === userProfile.full_name) ||
        (s.full_name && s.full_name === userProfile.full_name)
      );

      if (!studentProfile) {
        throw new Error("حسابك غير مسجل كطالب في قاعدة البيانات أو لم يتم تعيين قسم لك بعد. تواصل مع الإدارة.");
      }

      this.studentId = studentProfile.id || studentProfile.student_id;
      this.classId = studentProfile.class_id;

      console.log("✅ تم تحديد المعرفات بنجاح!", { studentId: this.studentId, classId: this.classId });

      this.bindNavEvents();
      this.loadSection(this.currentSection);

    } catch (err) {
      console.error("⚠️ تفاصيل الخطأ:", err);
      StudentUI.renderError(err.message || "فشل في تهيئة بيانات الطالب.");
    }
  },

  bindNavEvents() {
    const nav = document.getElementById("student-nav");
    nav.addEventListener("click", (e) => {
      if (e.target.classList.contains("nav-btn")) {
        this.loadSection(e.target.dataset.section);
      }
    });
  },

  async loadSection(section) {
    this.currentSection = section;
    StudentUI.renderNav(section);
    StudentUI.renderLoading();

    try {
      switch (section) {
        case "schedule": {
          const schedule = await StudentServices.getMySchedule(this.classId);
          StudentUI.renderSchedule(schedule);
          break;
        }
        case "assessments": {
          const assessments = await StudentServices.getMyAssessments(this.classId);
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
          StudentUI.renderError("قسم غير معروف");
      }
    } catch (err) {
      console.error("خطأ في تحميل القسم:", err);
      StudentUI.renderError(err.message);
    }
  }
};

// js/roles/admin/role.js

const AdminRole = {
  currentSection: "academic",

  async init() {
    if (!Auth.requireAuth("admin")) return;
    if (window.I18n) {
      await I18n.init({ scope: "admin", defaultLang: "ar" });
    }
    
    const session = Auth.getSession();
    AdminUI.renderHeader(session);
    AdminUI.wrapLocalizedMethods([
      "renderAcademicTab",
      "checkDashboardAttendance",
      "renderClassesTab",
      "showClassModal",
      "closeClassModal",
      "submitClass",
      "renderEnrollmentsTab",
      "_generateEnrollmentsTableHtml",
      "filterEnrollments",
      "updateEnrollmentStatus",
      "deleteEnrollmentItem",
      "showAddEnrollmentModal",
      "updateEnrollmentClassOptions",
      "closeEnrollmentModal",
      "submitNewEnrollment",
      "renderFinanceTab",
      "renderAttendanceTab",
      "searchStudentForAttendance",
      "selectStudentForAttendance",
      "loadClassSheet",
      "saveSingleAttendance",
      "saveAllAttendance",
      "loadStudentAttendance",
      "showJustificationModal",
      "submitJustification",
      "showAttendanceStats",
      "renderSchedulesTab",
      "loadSchedule",
      "drawScheduleGrid",
      "showAddScheduleModal",
      "closeScheduleModal",
      "loadClassAssignments",
      "submitNewSchedule",
      "deleteScheduleItem",
      "renderGradesTab",
      "searchStudentForGrades",
      "selectStudentForGrades",
      "loadAssessmentGrades",
      "searchStudentForQuickGrade",
      "selectStudentForQuickGrade",
      "saveGrade",
      "loadStudentRecord",
      "renderAssessmentsTab",
      "_generateAssessmentsTableHtml",
      "filterAssessmentsLocal",
      "searchAssessmentsLocal",
      "_applyFilters",
      "showAssessmentModal",
      "closeAssessmentModal",
      "submitAssessment",
      "viewAssessmentGrades",
      "closeGradesModal",
      "renderConversationsTab",
      "loadInitialUsers",
      "searchChatUsers",
      "renderUserListForChat",
      "openUserInbox",
      "loadChatHistory",
      "renderFeesTab",
      "_generateFeesTableHtml",
      "filterFeesFromBackend",
      "loadOverdueOnly",
      "searchFeesLocal",
      "showFeeModal",
      "closeFeeModal",
      "submitFee",
      "searchStudentForFee",
      "selectStudentForFee",
      "loadFeeEnrollmentsForStudent",
      "sendFeeReminder",
      "viewFeePayments",
      "closePaymentsModal",
      "renderParentsTab",
      "showAddParentModal",
      "closeParentModal",
      "submitNewParent",
      "deleteParentItem",
      "viewParentStudents",
      "closeStudentsModal",
      "renderNotificationsTab",
      "_generateNotificationsTableHtml",
      "filterLocalNotifications",
      "toggleNotifTargetInput",
      "searchUserForNotif",
      "selectUserForNotif",
      "handleSendNotification",
      "clearOldNotifications"
    ]);

    if (!this._i18nBound) {
      window.addEventListener("i18n:change", () => {
        AdminUI.renderHeader(Auth.getSession());
        this.loadSection(this.currentSection);
      });
      this._i18nBound = true;
    }
    
    // 1. مراقبة تغير الرابط (Hash) لتشغيل القسم المطلوب تلقائياً
    window.addEventListener("hashchange", () => this.handleRoute());

    // 2. تشغيل التوجيه عند أول تحميل للصفحة بناءً على الرابط الحالي
    this.handleRoute();
  },

  // دالة وسيطة لقراءة الرابط وتمريره لـ loadSection
  handleRoute() {
    const hash = window.location.hash.replace("#", "");
    const section = hash || this.currentSection; // إذا كان الرابط فارغاً استخدم "academic"
    this.loadSection(section);
  },

  async loadSection(section) {
    this.currentSection = section;
    AdminUI.renderNav(section);
    AdminUI.renderLoading();

    try {
      // نستخدم نفس منطق الـ switch الخاص بك تماماً لضمان عمل ملفاتك القديمة
      switch (section) {
        case "users": 
          AdminUI.renderUsersTab(await AdminServices.getUsers()); 
          break;
        case "parents": 
          AdminUI.renderParentsTab(await AdminServices.getParents()); 
          break;
        case "academic": 
          await AdminUI.renderAcademicTab(); 
          break;
        case "classes": 
          await AdminUI.renderClassesTab(await AdminServices.getClasses());
          break;
        case "students": 
          AdminUI.renderStudentsTab(await AdminServices.getStudents()); 
          break;
        case "teachers": 
          AdminUI.renderTeachersTab(await AdminServices.getTeachers()); 
          break;
        case "enrollments": 
          AdminUI.renderEnrollmentsTab(await AdminServices.getEnrollments()); 
          break;
        case "attendance": 
          await AdminUI.renderAttendanceTab(); 
          break;
        case "schedules": 
          await AdminUI.renderSchedulesTab(); 
          break;
        case "assessments": 
          AdminUI.renderAssessmentsTab(await AdminServices.getAssessments()); 
          break;
        case "grades": 
          await AdminUI.renderGradesTab(); 
          break;
        case "finance": 
          await AdminUI.renderFinanceTab(); 
          break;
        case "studentFees": 
          await AdminUI.renderFeesTab(await AdminServices.getStudentFees());
          break;
        case "payments": 
          AdminUI.renderPaymentsTab(await AdminServices.getPayments()); 
          break;
        case "transactions": 
          AdminUI.renderTransactionsTab(await AdminServices.getTransactions()); 
          break;
        case "resources": 
          AdminUI.renderResourcesTab(await AdminServices.getResources()); 
          break;
        case "conversations": 
          await AdminUI.renderConversationsTab(); 
          break;
        case "notifications": 
          AdminUI.renderNotificationsTab(await AdminServices.getNotifications()); 
          break;
        case "posts": 
          AdminUI.renderPostsTab(await AdminServices.getPosts()); 
          break;
        case "programs": 
          AdminUI.renderProgramsTab(await AdminServices.getPrograms()); 
          break;

        default:
          AdminUI.renderError(AdminUI.t("admin.messages.unknownSection", {}, "هذه الواجهة قيد التطوير أو غير مسجلة."));
      }
    } catch (err) {
      console.error("خطأ أثناء تحميل القسم:", err);
      AdminUI.renderError(err.message || AdminUI.t("admin.messages.loadFailed", {}, "فشل الاتصال بالخادم لجلب البيانات."));
    }
  },

  async deleteItem(endpoint, id, sectionRefresh) {
    if (!confirm(AdminUI.t("admin.messages.deleteConfirm", {}, "هل أنت متأكد من حذف هذا السجل بشكل نهائي؟"))) return;
    try {
      await AdminServices.deleteRecord(endpoint, id);
      alert(AdminUI.t("admin.messages.deleteSuccess", {}, "تم الحذف بنجاح."));
      this.loadSection(sectionRefresh || this.currentSection);
    } catch (err) {
      alert(AdminUI.t("admin.messages.deleteFailed", { message: err.message }, "تعذر الحذف: " + err.message));
    }
  }
};

window.AdminRole = AdminRole;

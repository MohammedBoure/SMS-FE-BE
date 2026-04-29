// js/roles/admin/role.js

const AdminRole = {
  currentSection: "academic",

  init() {
    if (!Auth.requireAuth("admin")) return;
    
    const session = Auth.getSession();
    AdminUI.renderHeader(session);
    
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
          AdminUI.renderClassesTab(await AdminServices.getClasses()); 
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
          AdminUI.renderFeesTab(await AdminServices.getStudentFees()); 
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

        default:
          AdminUI.renderError("هذه الواجهة قيد التطوير أو غير مسجلة.");
      }
    } catch (err) {
      console.error("خطأ أثناء تحميل القسم:", err);
      AdminUI.renderError(err.message || "فشل الاتصال بالخادم لجلب البيانات.");
    }
  },

  async deleteItem(endpoint, id, sectionRefresh) {
    if (!confirm("هل أنت متأكد من حذف هذا السجل بشكل نهائي؟")) return;
    try {
      await AdminServices.deleteRecord(endpoint, id);
      alert("تم الحذف بنجاح.");
      this.loadSection(sectionRefresh || this.currentSection);
    } catch (err) {
      alert("تعذر الحذف: " + err.message);
    }
  }
};
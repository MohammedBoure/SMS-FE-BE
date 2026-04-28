// js/roles/admin/role.js

const AdminRole = {
  currentSection: "academic", // الصفحة الافتراضية عند تسجيل الدخول

  init() {
    if (!Auth.requireAuth("admin")) return;
    
    const session = Auth.getSession();
    AdminUI.renderHeader(session);
    
    this.loadSection(this.currentSection);
  },

  async loadSection(section) {
    this.currentSection = section;
    AdminUI.renderNav(section);
    AdminUI.renderLoading();

    try {
      switch (section) {
        // الإدارة
        case "users": AdminUI.renderUsersTab(await AdminServices.getUsers()); break;
        case "parents": AdminUI.renderParentsTab(await AdminServices.getParents()); break;
        
        // الأكاديمي
        case "academic": await AdminUI.renderAcademicTab(); break; // دالة تجلب بياناتها بنفسها
        case "classes": AdminUI.renderClassesTab(await AdminServices.getClasses()); break;
        case "students": AdminUI.renderStudentsTab(await AdminServices.getStudents()); break;
        case "teachers": AdminUI.renderTeachersTab(await AdminServices.getTeachers()); break;
        case "enrollments": AdminUI.renderEnrollmentsTab(await AdminServices.getEnrollments()); break;
        case "attendance": await AdminUI.renderAttendanceTab(); break; // دالة تجلب بياناتها بنفسها
        case "schedules": await AdminUI.renderSchedulesTab(); break; // دالة تجلب بياناتها بنفسها
        case "assessments": AdminUI.renderAssessmentsTab(await AdminServices.getAssessments()); break;
        case "grades": await AdminUI.renderGradesTab(); break; // دالة تجلب بياناتها بنفسها

        // المالية
        case "finance": await AdminUI.renderFinanceTab(); break; // دالة تجلب بياناتها بنفسها
        case "studentFees": AdminUI.renderFeesTab(await AdminServices.getStudentFees()); break;
        case "payments": AdminUI.renderPaymentsTab(await AdminServices.getPayments()); break;
        case "transactions": AdminUI.renderTransactionsTab(await AdminServices.getTransactions()); break;
        case "resources": AdminUI.renderResourcesTab(await AdminServices.getResources()); break;

        // التواصل
        case "conversations": await AdminUI.renderConversationsTab(); break; // دالة تجلب بياناتها بنفسها
        case "notifications": AdminUI.renderNotificationsTab(await AdminServices.getNotifications()); break;
        case "posts": AdminUI.renderPostsTab(await AdminServices.getPosts()); break;

        default:
          AdminUI.renderError("هذه الواجهة قيد التطوير أو غير مسجلة في الموجه (Router).");
      }
    } catch (err) {
      console.error("خطأ أثناء تحميل القسم:", err);
      AdminUI.renderError(err.message || "فشل الاتصال بالخادم لجلب البيانات.");
    }
  },

  // وظيفة الحذف المركزية
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
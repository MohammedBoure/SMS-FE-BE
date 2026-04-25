// js/roles/accountant/role.js

const AccountantRole = {
  currentSection: "students", 
  
  // حالة الصفحات لكل قسم
  pages: {
    students: 1, search: 1, attendance: 1, fees: 1, payments: 1, transactions: 1
  },
  lastSearchKeyword: "", // لحفظ كلمة البحث أثناء التنقل بين الصفحات

  init() {
    if (!Auth.requireAuth("accountant")) return;
    document.body.dir = "rtl";
    document.body.style.fontFamily = "'Cairo', 'Segoe UI', Tahoma, sans-serif";
    AccountantUI.renderHeader(Auth.getSession());
    this.bindNavEvents();
    this.loadSection(this.currentSection);
    this.bindDynamicEvents();
  },

  bindNavEvents() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("nav-btn")) {
        this.loadSection(e.target.dataset.section, 1); // عند تغيير القسم نعود للصفحة 1
      }
    });
  },

  async loadSection(section, pageNum = null) {
    this.currentSection = section;
    if (pageNum !== null) this.pages[section] = pageNum;
    const page = this.pages[section];

    AccountantUI.renderNav(section);
    AccountantUI.renderLoading();

    try {
      switch (section) {
        case "students":
          AccountantUI.renderStudents(await AccountantServices.getStudents(page));
          break;
        case "fees":
          // إذا كان الباك اند لا يدعم الصفحات للرسوم سيعمل بشكل عادي
          AccountantUI.renderFees(await AccountantServices.getAllFees(page));
          break;
        case "payments":
          AccountantUI.renderPayments(await AccountantServices.getPayments(page));
          break;
        case "transactions":
          AccountantUI.renderTransactions(await AccountantServices.getTransactions(page));
          break;
        case "search":
          if (this.lastSearchKeyword) {
            AccountantUI.renderSearch(await AccountantServices.searchUsers(this.lastSearchKeyword, page));
          } else {
            AccountantUI.renderSearch(await AccountantServices.getAllUsers(page));
          }
          break;
        case "attendance":
          // القائمة الجانبية للطلاب
          const studentsData = await AccountantServices.getStudents(page);
          AccountantUI.renderAttendance(studentsData);
          break;
        default:
          AccountantUI.renderError("قسم غير معروف");
      }
    } catch (err) {
      AccountantUI.renderError(err.message);
    }
  },

  bindDynamicEvents() {
    // 1. الفلترة السريعة في الصفحة الحالية (للبحث السريع بدون سيرفر)
    document.addEventListener("input", (e) => {
      if (e.target.id === "finance-student-search") {
        const keyword = e.target.value.toLowerCase().trim();
        document.querySelectorAll("#finance-students-tbody tr").forEach(row => {
          if(row.dataset.search) row.style.display = row.dataset.search.toLowerCase().includes(keyword) ? "" : "none";
        });
      }
    });

    // 2. إدارة جميع النقرات
    document.addEventListener("click", async (e) => {
      
      // === أزرار الانتقال بين الصفحات (Pagination) ===
      if (e.target.classList.contains("pagination-btn")) {
        const section = e.target.dataset.section;
        const targetPage = parseInt(e.target.dataset.page, 10);
        if (targetPage > 0) {
          this.loadSection(section, targetPage);
        }
      }

      // === زر البحث في السيرفر ===
      if (e.target.id === "adv-search-btn") {
        const keyword = document.getElementById("adv-search-keyword").value.trim();
        if (keyword.length < 2) return alert("الرجاء إدخال حرفين على الأقل للبحث في السيرفر.");
        
        this.lastSearchKeyword = keyword; // حفظ الكلمة لاستخدامها في الصفحات التالية
        this.loadSection("search", 1); // تحميل الصفحة 1 من النتائج
      }

      // === زر فتح الوضعية المالية (من البحث الشامل أو قائمة الطلاب) ===
      if (e.target.classList.contains("search-finance-btn") || e.target.classList.contains("view-student-finance-btn")) {
        let studentId = e.target.dataset.id;      
        const userId = e.target.dataset.userId;   
        const btn = e.target;
        const originalText = btn.textContent;
        
        try {
          btn.disabled = true;
          btn.textContent = "جاري...";
          
          if (userId) {
            // البحث عن طالب مطابق للـ user_id لتفادي خطأ 404
            const res = await AccountantServices.getStudents(1); // يمكنك إضافة endpoint مخصص لاحقاً للبحث بالـ user_id
            const studentRecord = (res.data || []).find(s => String(s.user_id) === String(userId) || String(s.id) === String(userId));
            
            if (!studentRecord) return alert("هذا المستخدم ليس طالباً مسجلاً.");
            studentId = studentRecord.id || studentRecord.student_id;
          }
          
          const [student, fees, payments] = await Promise.all([
            AccountantServices.getStudent(studentId),
            AccountantServices.getStudentFees(studentId),
            AccountantServices.getStudentPayments(studentId)
          ]);
          
          AccountantUI.showStudentFinanceModal(student, fees, payments);
        } catch (error) {
          alert("خطأ: تعذر جلب البيانات المالية.");
        } finally {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }

      // === تسديد رسم معين (داخل النافذة المنبثقة) ===
      if (e.target.classList.contains("pay-specific-fee-btn")) {
        const feeId = e.target.dataset.feeId;
        const amountDue = e.target.dataset.amount;
        
        const amountToPayStr = prompt(`المبلغ المستحق هو ${amountDue} دج.\nأدخل المبلغ المستلم لتسجيل الدفعة:`, amountDue);
        
        if (amountToPayStr !== null && amountToPayStr.trim() !== "") {
          const amountPaid = parseInt(amountToPayStr, 10);
          if (isNaN(amountPaid) || amountPaid <= 0) return alert("مبلغ غير صحيح!");
          
          const btn = e.target;
          try {
            btn.disabled = true;
            btn.textContent = "جاري التسجيل...";
            
            const receipt = "REC-" + Date.now().toString().slice(-6);
            await AccountantServices.recordPayment({ fee_id: parseInt(feeId), amount_paid: amountPaid, receipt_number: receipt });

            alert(`تم تسجيل الدفعة بنجاح!\nرقم الوصل: ${receipt}`);
            document.getElementById("finance-modal").remove();
            this.loadSection(this.currentSection); // إعادة تحميل الصفحة الحالية
            
          } catch (err) {
            alert("خطأ أثناء التسجيل: " + err.message);
            btn.disabled = false;
            btn.textContent = "تسديد";
          }
        }
      }

      // === إغلاق النوافذ ===
      if (e.target.matches("#close-notif-modal, #cancel-notif")) {
         const modal = document.getElementById("notification-modal");
         if(modal) modal.remove();
      }

      // === فتح نافذة إرسال الإشعار ===
      if (e.target.classList.contains("search-notify-btn") || e.target.classList.contains("send-warning-btn")) {
        const userId = e.target.dataset.id || e.target.dataset.userId;
        const name = e.target.dataset.name;
        
        let defaultMessage = "يرجى مراجعة الإدارة المالية لتسوية وضعيتكم في أقرب وقت.";
        if (e.target.classList.contains("send-warning-btn")) {
          defaultMessage = `تذكير بتسديد الرسوم المتأخرة الخاصة بـ "${e.target.dataset.fee}" والبالغة ${e.target.dataset.amount} دج.`;
        }

        if (!userId || userId === "undefined") return alert("لا يوجد حساب مربوط بهذا المستخدم.");
        AccountantUI.showNotificationModal(userId, name, defaultMessage);
      }

      // === جلب تقرير الغيابات ===
      if (e.target.id === "fetch-attendance-btn" || e.target.classList.contains("fetch-attendance-btn")) {
        const studentId = e.target.dataset.id || document.getElementById("attendance-student-id")?.value;
        if (!studentId) return alert("الرجاء اختيار طالب");
        
        const btn = e.target;
        try {
          btn.disabled = true;
          document.getElementById("attendance-results").innerHTML = "<p style='text-align:center;'>جاري الجلب...</p>";
          const records = await AccountantServices.getStudentAttendance(studentId);
          AccountantUI.renderAttendanceReport(studentId, records);
        } catch (error) {
          document.getElementById("attendance-results").innerHTML = `<p style="color:red; text-align:center;">تعذر جلب البيانات</p>`;
        } finally {
          btn.disabled = false;
        }
      }
    });

    // 3. إدارة النماذج (Forms)
    document.addEventListener("submit", async (e) => {
      // نموذج إضافة رسم جديد
      if (e.target.id === "add-fee-form") {
        e.preventDefault();
        const form = e.target;
        try {
          form.querySelector('button[type="submit"]').disabled = true;
          await AccountantServices.createFee({
            student_id: parseInt(form.dataset.studentId),
            fee_type: document.getElementById("new-fee-type").value,
            amount_due: parseInt(document.getElementById("new-fee-amount").value),
            due_date: document.getElementById("new-fee-date").value,
            applied_discount: 0
          });
          alert("تمت إضافة الرسم بنجاح!");
          document.getElementById("finance-modal").remove();
          this.loadSection(this.currentSection);
        } catch (err) {
          alert("فشل في إضافة الرسم.");
          form.querySelector('button[type="submit"]').disabled = false;
        }
      }

      // نموذج إرسال الإشعار
      if (e.target.id === "send-notification-form") {
        e.preventDefault();
        const form = e.target;
        try {
          form.querySelector('button[type="submit"]').disabled = true;
          await AccountantServices.sendNotification({
            user_id: parseInt(form.dataset.userId),
            title: document.getElementById("notif-title").value,
            message: document.getElementById("notif-message").value
          });
          alert("تم إرسال الإشعار بنجاح!");
          document.getElementById("notification-modal").remove();
        } catch (err) {
          alert("فشل في إرسال الإشعار.");
          form.querySelector('button[type="submit"]').disabled = false;
        }
      }
    });
  }
};
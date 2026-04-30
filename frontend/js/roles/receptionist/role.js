// js/roles/receptionist/role.js

const ReceptionistRole = {
  currentSection: "students",
  classesList: [],
  parentsList: [],

  async init() {
    if (!Auth.requireAuth("receptionist")) return;
    const session = Auth.getSession();

    try {
      const userProfile = await Api.get(`/users/${session.user_id}`);
      ReceptionistUI.renderHeader(userProfile);

      this.classesList = await ReceptionistServices.getClasses();
      this.parentsList = await ReceptionistServices.getParents();

      this.bindNavEvents();
      this.loadSection(this.currentSection);
      this.bindDynamicEvents();
    } catch (err) {
      console.error(err);
      ReceptionistUI.renderError("فشل في تهيئة بيانات موظف الاستقبال.");
    }
  },

  bindNavEvents() {
    const nav = document.getElementById("receptionist-nav");
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-btn");
      if (btn) {
        this.loadSection(btn.dataset.section);
      }
    });
  },

  async loadSection(section) {
    this.currentSection = section;
    ReceptionistUI.renderNav(section);
    ReceptionistUI.renderLoading();
    ReceptionistUI.closeStudentDetailsModal();

    try {
      switch (section) {
        case "students": {
          const students = await ReceptionistServices.getStudents();
          ReceptionistUI.renderStudents(students, this.classesList, this.parentsList);
          break;
        }
        case "parents": {
          const parents = await ReceptionistServices.getParents();
          ReceptionistUI.renderParents(parents);
          break;
        }
        case "search": {
          ReceptionistUI.renderSearch();
          break;
        }
        case "finance": {
          ReceptionistUI.renderFinanceDashboard();
          break;
        }
        case "posts": {
          const posts = await ReceptionistServices.getPosts();
          ReceptionistUI.renderPosts(posts);
          break;
        }
        case "messages": {
          const session = Auth.getSession();
          const inbox = await ReceptionistServices.getMessagesInbox(session.user_id);
          ReceptionistUI.renderMessages(inbox, session.user_id);
          break;
        }
        case "notifications": {
          const session = Auth.getSession();
          const notifications = await ReceptionistServices.getNotifications(session.user_id);
          ReceptionistUI.renderNotifications(notifications);
          break;
        }
        default:
          ReceptionistUI.renderError("قسم غير معروف");
      }
    } catch (err) {
      ReceptionistUI.renderError(err.message);
    }
  },

  bindDynamicEvents() {
    const main = document.getElementById("receptionist-main");

    main.addEventListener("click", async (e) => {
      if (e.target.classList.contains("view-student-details-btn")) {
        const studentId = e.target.dataset.id;
        try {
          e.target.disabled = true;
          e.target.textContent = "جاري التحميل...";

          const [student, grades, attendance] = await Promise.all([
            ReceptionistServices.getStudent(studentId),
            ReceptionistServices.getStudentGrades(studentId),
            ReceptionistServices.getStudentAttendance(studentId)
          ]);

          ReceptionistUI.showStudentDetailsModal(studentId, student, grades, attendance);
        } catch (error) {
          alert("خطأ في جلب التفاصيل: " + error.message);
        } finally {
          e.target.disabled = false;
          e.target.textContent = "عرض التفاصيل";
        }
      }

      if (e.target.classList.contains("edit-student-btn")) {
        const studentId = e.target.dataset.id;
        try {
          e.target.disabled = true;
          e.target.textContent = "جاري التحميل...";
          const student = await ReceptionistServices.getStudent(studentId);
          ReceptionistUI.showStudentEditModal(student, this.classesList, this.parentsList);
        } catch (error) {
          alert("خطأ في جلب بيانات الطالب: " + error.message);
        } finally {
          e.target.disabled = false;
          e.target.textContent = "تعديل";
        }
      }

      if (e.target.id === "search-fees-btn") {
        const studentId = document.getElementById("finance-student-id").value;
        if (!studentId) return alert("الرجاء إدخال رقم الطالب");
        try {
          const fees = await ReceptionistServices.getStudentFees(studentId);
          ReceptionistUI.renderStudentFeesList(fees);
        } catch (error) {
          alert("خطأ: " + error.message);
        }
      }

      if (e.target.classList.contains("pay-fee-btn")) {
        const feeId = e.target.dataset.feeId;
        const amount = e.target.dataset.amount;

        if (confirm(`هل أنت متأكد من استلام مبلغ ${amount} دج؟`)) {
          try {
            await ReceptionistServices.processPayment({ fee_id: feeId, amount_paid: amount });
            alert("تم تسجيل الدفعة بنجاح واستخراج الوصل!");
            document.getElementById("search-fees-btn").click();
          } catch (error) {
            alert("خطأ أثناء الدفع: " + error.message);
          }
        }
      }
    });

    main.addEventListener("input", (e) => {
      if (e.target.id === "student-search-input") {
        ReceptionistUI.filterStudents(e.target.value);
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-close-student-modal]")) {
        ReceptionistUI.closeStudentDetailsModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        ReceptionistUI.closeStudentDetailsModal();
      }
    });

    document.addEventListener("submit", async (e) => {
      if (e.target.id === "register-parent-form") {
        e.preventDefault();
        try {
          const userData = {
            username: document.getElementById("p-username").value,
            password: "password123",
            full_name: document.getElementById("p-fullname").value,
            email: document.getElementById("p-email").value,
            phone: document.getElementById("p-phone").value,
            role_id: 4
          };
          const newUser = await ReceptionistServices.createUser(userData);
          await ReceptionistServices.createParent(newUser.user_id);

          alert("تم تسجيل ولي الأمر بنجاح!");
          this.loadSection("parents");
        } catch (error) {
          alert("خطأ في التسجيل: " + error.message);
        }
      }

      if (e.target.id === "register-student-form") {
        e.preventDefault();
        try {
          const userData = {
            username: document.getElementById("s-username").value,
            password: "password123",
            full_name: document.getElementById("s-fullname").value,
            email: document.getElementById("s-email").value || null,
            phone: document.getElementById("s-phone").value || null,
            address: document.getElementById("s-address").value || null,
            role_id: 3
          };
          const newUser = await ReceptionistServices.createUser(userData);

          const studentData = {
            user_id: newUser.user_id,
            parent_id: document.getElementById("s-parent-id").value,
            class_id: document.getElementById("s-class-id").value,
            date_of_birth: document.getElementById("s-dob").value,
            blood_group: document.getElementById("s-blood-group").value || null,
            medical_info: document.getElementById("s-medical-info").value || null,
            status: "active"
          };
          await ReceptionistServices.createStudent(studentData);

          alert("تم تسجيل الطالب بنجاح!");
          this.loadSection("students");
        } catch (error) {
          alert("خطأ في التسجيل: " + error.message);
        }
      }

      if (e.target.id === "edit-student-form") {
        e.preventDefault();
        const form = e.target;
        const studentId = form.dataset.studentId;
        const userId = form.dataset.userId;

        try {
          if (!userId) {
            throw new Error("لا يوجد user_id لهذا الطالب، لا يمكن تعديل بيانات الحساب.");
          }

          const submitBtn = form.querySelector('button[type="submit"]');
          const originalText = submitBtn.textContent;
          submitBtn.disabled = true;
          submitBtn.textContent = "جاري الحفظ...";

          const current = await ReceptionistServices.getStudent(studentId);
          
          // تمت إضافة اسم المستخدم وكلمة المرور إلى بيانات التحديث
          const userData = this._changedPayload(current, {
            full_name: [["student_name", "full_name"], document.getElementById("edit-student-name").value],
            username: [["username"], document.getElementById("edit-student-username").value],
            password: [["password"], document.getElementById("edit-student-password").value], // كلمة المرور
            email: [["email"], document.getElementById("edit-student-email").value],
            phone: [["phone", "student_phone"], document.getElementById("edit-student-phone").value],
            address: [["address"], document.getElementById("edit-student-address").value]
          });

          const studentData = this._changedPayload(current, {
            class_id: [["class_id"], document.getElementById("edit-student-class").value],
            parent_id: [["parent_id"], document.getElementById("edit-student-parent").value],
            date_of_birth: [["date_of_birth"], document.getElementById("edit-student-dob").value],
            registration_date: [["registration_date"], document.getElementById("edit-student-registration").value],
            blood_group: [["blood_group"], document.getElementById("edit-student-blood").value],
            status: [["status"], document.getElementById("edit-student-status").value],
            medical_info: [["medical_info"], document.getElementById("edit-student-medical").value]
          });

          if (Object.keys(userData).length === 0 && Object.keys(studentData).length === 0) {
            alert("لم يتم تغيير أي بيانات.");
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
          }

          if (Object.keys(userData).length > 0) {
            try {
              await ReceptionistServices.updateUser(userId, userData);
            } catch (err) {
              if (!err.message.includes("identical")) throw err;
            }
          }
          if (Object.keys(studentData).length > 0) {
            try {
              await ReceptionistServices.updateStudent(studentId, studentData);
            } catch (err) {
              if (!err.message.includes("identical")) throw err;
            }
          }

          alert("تم حفظ التعديلات بنجاح!");
          ReceptionistUI.closeStudentDetailsModal();
          this.loadSection("students");
          
        } catch (error) {
          alert("خطأ في حفظ التعديلات: " + error.message);
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "حفظ التعديلات";
          }
        }
      }
    });
  },

  _changedPayload(current, fields) {
    const payload = {};

    Object.entries(fields).forEach(([payloadKey, [currentKeys, nextValue]]) => {
      const rawNext = typeof nextValue === "string" ? nextValue.trim() : nextValue;
      const next = rawNext === "" ? null : rawNext;
      
      const keys = Array.isArray(currentKeys) ? currentKeys : [currentKeys];
      let previousRaw = null;
      for (let k of keys) {
        if (current[k] !== undefined && current[k] !== null) {
          previousRaw = current[k];
          break;
        }
      }
      
      const previous = previousRaw === null ? "" : String(previousRaw);
      const nextStr = next === null ? "" : String(next);

      if (nextStr !== previous) {
        payload[payloadKey] = next;
      }
    });

    return payload;
  }
};

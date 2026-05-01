// js/roles/receptionist/role.js

const ReceptionistRole = {
  currentSection: "students",
  classesList: [],
  parentsList: [],
  userProfile: null,

  async init() {
    if (!Auth.requireAuth("receptionist")) return;

    if (window.I18n) {
      await I18n.init({ scope: "receptionist", defaultLang: "ar" });
    }

    const session = Auth.getSession();

    try {
      this.userProfile = await Api.get(`/users/${session.user_id}`);
      ReceptionistUI.renderHeader(this.userProfile);

      this.classesList = await ReceptionistServices.getClasses();
      this.parentsList = await ReceptionistServices.getParents();

      this.bindNavEvents();
      this.bindLanguageEvents();
      this.loadSection(this.currentSection);
      this.bindDynamicEvents();
    } catch (err) {
      console.error(err);
      ReceptionistUI.renderError(ReceptionistUI.t("receptionist.state.initFailed", {}, "Failed to initialize receptionist data."));
    }
  },

  bindLanguageEvents() {
    if (this._languageEventsBound) return;

    window.addEventListener("i18n:change", (event) => {
      if (event.detail?.scope && event.detail.scope !== "receptionist") return;
      ReceptionistUI.renderHeader(this.userProfile);
      this.loadSection(this.currentSection);
    });

    this._languageEventsBound = true;
  },

  bindNavEvents() {
    if (this._navEventsBound) return;

    const nav = document.getElementById("receptionist-nav");
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-btn");
      if (btn) this.loadSection(btn.dataset.section);
    });

    this._navEventsBound = true;
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
        case "search":
          ReceptionistUI.renderSearch();
          break;
        case "finance":
          ReceptionistUI.renderFinanceDashboard();
          break;
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
          ReceptionistUI.renderError(ReceptionistUI.t("receptionist.state.unknownSection", {}, "Unknown section"));
      }
    } catch (err) {
      ReceptionistUI.renderError(err.message);
    }
  },

  bindDynamicEvents() {
    if (this._dynamicEventsBound) return;
    const main = document.getElementById("receptionist-main");

    main.addEventListener("click", async (e) => {
      if (e.target.id === "receptionist-mark-all-notifications-read") {
        const session = Auth.getSession();
        const originalText = e.target.textContent;
        e.target.disabled = true;
        e.target.textContent = ReceptionistUI.t("receptionist.common.updating", {}, "Updating...");
        try {
          await ReceptionistServices.markAllNotificationsAsRead(session.user_id);
          await this.loadSection("notifications");
        } catch (err) {
          e.target.disabled = false;
          e.target.textContent = originalText;
          alert(err.message || ReceptionistUI.t("receptionist.notifications.updateFailed", {}, "Could not update notifications."));
        }
        return;
      }

      const markNotificationBtn = e.target.closest(".receptionist-mark-notification-read");
      if (markNotificationBtn) {
        const originalText = markNotificationBtn.textContent;
        markNotificationBtn.disabled = true;
        markNotificationBtn.textContent = ReceptionistUI.t("receptionist.common.updating", {}, "Updating...");
        try {
          await ReceptionistServices.markNotificationAsRead(markNotificationBtn.dataset.notificationId);
          await this.loadSection("notifications");
        } catch (err) {
          markNotificationBtn.disabled = false;
          markNotificationBtn.textContent = originalText;
          alert(err.message || ReceptionistUI.t("receptionist.notifications.singleUpdateFailed", {}, "Could not update the notification."));
        }
        return;
      }

      if (e.target.classList.contains("view-student-details-btn")) {
        const studentId = e.target.dataset.id;
        const originalText = e.target.textContent;
        try {
          e.target.disabled = true;
          e.target.textContent = ReceptionistUI.t("receptionist.common.loading", {}, "Loading...");

          const [student, grades, attendance] = await Promise.all([
            ReceptionistServices.getStudent(studentId),
            ReceptionistServices.getStudentGrades(studentId),
            ReceptionistServices.getStudentAttendance(studentId)
          ]);

          ReceptionistUI.showStudentDetailsModal(studentId, student, grades, attendance);
        } catch (error) {
          alert(ReceptionistUI.t("receptionist.students.loadDetailsFailed", { message: error.message }, "Error loading details."));
        } finally {
          e.target.disabled = false;
          e.target.textContent = originalText || ReceptionistUI.t("receptionist.students.viewDetails", {}, "View details");
        }
      }

      if (e.target.classList.contains("edit-student-btn")) {
        const studentId = e.target.dataset.id;
        const originalText = e.target.textContent;
        try {
          e.target.disabled = true;
          e.target.textContent = ReceptionistUI.t("receptionist.common.loading", {}, "Loading...");
          const student = await ReceptionistServices.getStudent(studentId);
          ReceptionistUI.showStudentEditModal(student, this.classesList, this.parentsList);
        } catch (error) {
          alert(ReceptionistUI.t("receptionist.students.loadStudentFailed", { message: error.message }, "Error loading student data."));
        } finally {
          e.target.disabled = false;
          e.target.textContent = originalText || ReceptionistUI.t("receptionist.students.edit", {}, "Edit");
        }
      }

      if (e.target.id === "search-fees-btn") {
        const studentId = document.getElementById("finance-student-id").value;
        if (!studentId) {
          alert(ReceptionistUI.t("receptionist.finance.missingStudentId", {}, "Please enter the student ID."));
          return;
        }
        try {
          const fees = await ReceptionistServices.getStudentFees(studentId);
          ReceptionistUI.renderStudentFeesList(fees);
        } catch (error) {
          alert(ReceptionistUI.t("receptionist.finance.searchFailed", { message: error.message }, "Error."));
        }
      }

      if (e.target.classList.contains("pay-fee-btn")) {
        const feeId = e.target.dataset.feeId;
        const amount = e.target.dataset.amount;
        const formattedAmount = ReceptionistUI._formatCurrency(amount);

        if (confirm(ReceptionistUI.t("receptionist.finance.confirmPayment", { amount: formattedAmount }, `Are you sure you received ${formattedAmount}?`))) {
          try {
            await ReceptionistServices.processPayment({ fee_id: feeId, amount_paid: amount });
            alert(ReceptionistUI.t("receptionist.finance.paymentSuccess", {}, "Payment registered successfully."));
            document.getElementById("search-fees-btn").click();
          } catch (error) {
            alert(ReceptionistUI.t("receptionist.finance.paymentFailed", { message: error.message }, "Payment error."));
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
      if (e.key === "Escape") ReceptionistUI.closeStudentDetailsModal();
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

          alert(ReceptionistUI.t("receptionist.parents.successCreate", {}, "Parent registered successfully."));
          this.loadSection("parents");
        } catch (error) {
          alert(ReceptionistUI.t("receptionist.parents.createFailed", { message: error.message }, "Registration error."));
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

          alert(ReceptionistUI.t("receptionist.students.successCreate", {}, "Student registered successfully."));
          this.loadSection("students");
        } catch (error) {
          alert(ReceptionistUI.t("receptionist.students.createFailed", { message: error.message }, "Registration error."));
        }
      }

      if (e.target.id === "edit-student-form") {
        e.preventDefault();
        const form = e.target;
        const studentId = form.dataset.studentId;
        const userId = form.dataset.userId;

        try {
          if (!userId) {
            throw new Error(ReceptionistUI.t("receptionist.students.missingUserId", {}, "This student has no user_id."));
          }

          const submitBtn = form.querySelector('button[type="submit"]');
          const originalText = submitBtn.textContent;
          submitBtn.disabled = true;
          submitBtn.textContent = ReceptionistUI.t("receptionist.common.saving", {}, "Saving...");

          const current = await ReceptionistServices.getStudent(studentId);

          const userData = this._changedPayload(current, {
            full_name: [["student_name", "full_name"], document.getElementById("edit-student-name").value],
            username: [["username"], document.getElementById("edit-student-username").value],
            password: [["password"], document.getElementById("edit-student-password").value],
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
            alert(ReceptionistUI.t("receptionist.students.noChanges", {}, "No data was changed."));
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

          alert(ReceptionistUI.t("receptionist.students.successUpdate", {}, "Changes saved successfully."));
          ReceptionistUI.closeStudentDetailsModal();
          this.loadSection("students");
        } catch (error) {
          alert(ReceptionistUI.t("receptionist.students.updateFailed", { message: error.message }, "Error saving changes."));
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = ReceptionistUI.t("receptionist.common.saveChanges", {}, "Save changes");
          }
        }
      }
    });

    this._dynamicEventsBound = true;
  },

  _changedPayload(current, fields) {
    const payload = {};

    Object.entries(fields).forEach(([payloadKey, [currentKeys, nextValue]]) => {
      const rawNext = typeof nextValue === "string" ? nextValue.trim() : nextValue;
      const next = rawNext === "" ? null : rawNext;

      const keys = Array.isArray(currentKeys) ? currentKeys : [currentKeys];
      let previousRaw = null;
      for (const key of keys) {
        if (current[key] !== undefined && current[key] !== null) {
          previousRaw = current[key];
          break;
        }
      }

      const previous = previousRaw === null ? "" : String(previousRaw);
      const nextStr = next === null ? "" : String(next);

      if (nextStr !== previous) payload[payloadKey] = next;
    });

    return payload;
  }
};

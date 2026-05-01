// js/roles/accountant/role.js

const AccountantRole = {
  currentSection: "students",

  pages: {
    students: 1,
    search: 1,
    attendance: 1,
    fees: 1,
    payments: 1,
    transactions: 1,
    messages: 1,
    notifications: 1
  },

  lastSearchKeyword: "",

  async init() {
    if (!Auth.requireAuth("accountant")) return;

    if (window.I18n) {
      await I18n.init({ scope: "accountant", defaultLang: "ar" });
    }

    document.body.style.fontFamily = "'Cairo', 'Segoe UI', Tahoma, sans-serif";
    AccountantUI.renderHeader(Auth.getSession());
    this.bindNavEvents();
    this.bindLanguageEvents();
    this.bindDynamicEvents();
    this.loadSection(this.currentSection);
  },

  bindLanguageEvents() {
    if (this._languageEventsBound) return;

    window.addEventListener("i18n:change", (event) => {
      if (event.detail?.scope && event.detail.scope !== "accountant") return;
      AccountantUI.renderHeader(Auth.getSession());
      this.loadSection(this.currentSection);
    });

    this._languageEventsBound = true;
  },

  bindNavEvents() {
    if (this._navEventsBound) return;

    document.addEventListener("click", (e) => {
      const navButton = e.target.closest(".nav-btn");
      if (!navButton) return;
      this.loadSection(navButton.dataset.section, 1);
    });

    this._navEventsBound = true;
  },

  async loadSection(section, pageNum = null) {
    this.currentSection = section;
    if (pageNum !== null) this.pages[section] = pageNum;
    const page = this.pages[section] || 1;

    AccountantUI.renderNav(section);
    AccountantUI.renderLoading();

    try {
      switch (section) {
        case "students":
          AccountantUI.renderStudents(await AccountantServices.getStudents(page));
          break;
        case "fees":
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
          AccountantUI.renderAttendance(await AccountantServices.getStudents(page));
          break;
        case "messages": {
          const session = Auth.getSession();
          const inbox = await AccountantServices.getMessagesInbox(session.user_id);
          AccountantUI.renderMessages(inbox, session.user_id);
          break;
        }
        case "notifications": {
          const session = Auth.getSession();
          const notifications = await AccountantServices.getNotifications(session.user_id);
          AccountantUI.renderNotifications(notifications);
          break;
        }
        default:
          AccountantUI.renderError(AccountantUI.t("accountant.state.unknownSection", {}, "Unknown section"));
      }
    } catch (err) {
      AccountantUI.renderError(err.message);
    }
  },

  bindDynamicEvents() {
    if (this._dynamicEventsBound) return;

    document.addEventListener("input", (e) => {
      if (e.target.id === "finance-student-search") {
        const keyword = e.target.value.toLowerCase().trim();
        document.querySelectorAll("#finance-students-tbody tr").forEach(row => {
          if (row.dataset.search) {
            row.style.display = row.dataset.search.toLowerCase().includes(keyword) ? "" : "none";
          }
        });
      }

      if (e.target.id === "attendance-live-search") {
        const keyword = e.target.value.toLowerCase().trim();
        document.querySelectorAll("#attendance-students-tbody tr").forEach(row => {
          if (row.dataset.search) {
            row.style.display = row.dataset.search.toLowerCase().includes(keyword) ? "" : "none";
          }
        });
      }
    });

    document.addEventListener("click", async (e) => {
      if (e.target.id === "accountant-mark-all-notifications-read") {
        const session = Auth.getSession();
        const originalText = e.target.textContent;
        e.target.disabled = true;
        e.target.textContent = AccountantUI.t("accountant.common.updating", {}, "Updating...");
        try {
          await AccountantServices.markAllNotificationsAsRead(session.user_id);
          await this.loadSection("notifications");
        } catch (err) {
          e.target.disabled = false;
          e.target.textContent = originalText;
          alert(err.message || AccountantUI.t("accountant.actions.notificationsUpdateFailed", {}, "Could not update notifications."));
        }
        return;
      }

      const markNotificationBtn = e.target.closest(".accountant-mark-notification-read");
      if (markNotificationBtn) {
        const originalText = markNotificationBtn.textContent;
        markNotificationBtn.disabled = true;
        markNotificationBtn.textContent = AccountantUI.t("accountant.common.updating", {}, "Updating...");
        try {
          await AccountantServices.markNotificationAsRead(markNotificationBtn.dataset.notificationId);
          await this.loadSection("notifications");
        } catch (err) {
          markNotificationBtn.disabled = false;
          markNotificationBtn.textContent = originalText;
          alert(err.message || AccountantUI.t("accountant.actions.notificationUpdateFailed", {}, "Could not update the notification."));
        }
        return;
      }

      if (e.target.classList.contains("pagination-btn")) {
        const section = e.target.dataset.section;
        const targetPage = parseInt(e.target.dataset.page, 10);
        if (targetPage > 0) this.loadSection(section, targetPage);
      }

      if (e.target.id === "adv-search-btn") {
        const keyword = document.getElementById("adv-search-keyword").value.trim();
        if (keyword.length < 2) {
          alert(AccountantUI.t("accountant.actions.searchMinLength", {}, "Please enter at least two characters."));
          return;
        }

        this.lastSearchKeyword = keyword;
        this.loadSection("search", 1);
      }

      if (e.target.classList.contains("search-finance-btn") || e.target.classList.contains("view-student-finance-btn")) {
        let studentId = e.target.dataset.id;
        const userId = e.target.dataset.userId;
        const btn = e.target;
        const originalText = btn.textContent;

        try {
          btn.disabled = true;
          btn.textContent = AccountantUI.t("accountant.actions.loadingShort", {}, "Loading...");

          if (userId) {
            const res = await AccountantServices.getStudents(1);
            const studentRecord = (res.data || []).find(s => String(s.user_id) === String(userId) || String(s.id) === String(userId));

            if (!studentRecord) {
              alert(AccountantUI.t("accountant.actions.userNotStudent", {}, "This user is not linked to a registered student."));
              return;
            }
            studentId = studentRecord.id || studentRecord.student_id;
          }

          const [student, fees, payments] = await Promise.all([
            AccountantServices.getStudent(studentId),
            AccountantServices.getStudentFees(studentId),
            AccountantServices.getStudentPayments(studentId)
          ]);

          AccountantUI.showStudentFinanceModal(student, fees, payments);
        } catch (error) {
          alert(AccountantUI.t("accountant.actions.financeLoadFailed", {}, "Error: could not load financial data."));
        } finally {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }

      if (e.target.classList.contains("pay-specific-fee-btn")) {
        const feeId = e.target.dataset.feeId;
        const amountDue = e.target.dataset.amount;
        const amountToPayStr = prompt(
          AccountantUI.t(
            "accountant.actions.paymentPrompt",
            { amount: AccountantUI._formatCurrency(amountDue) },
            "Enter the received amount:"
          ),
          amountDue
        );

        if (amountToPayStr !== null && amountToPayStr.trim() !== "") {
          const amountPaid = parseInt(amountToPayStr, 10);
          if (Number.isNaN(amountPaid) || amountPaid <= 0) {
            alert(AccountantUI.t("accountant.actions.invalidAmount", {}, "Invalid amount."));
            return;
          }

          const btn = e.target;
          try {
            btn.disabled = true;
            btn.textContent = AccountantUI.t("accountant.actions.recording", {}, "Recording...");

            const receipt = "REC-" + Date.now().toString().slice(-6);
            await AccountantServices.recordPayment({
              fee_id: parseInt(feeId, 10),
              amount_paid: amountPaid,
              receipt_number: receipt
            });

            alert(AccountantUI.t("accountant.actions.paymentSuccess", { receipt }, "Payment registered successfully."));
            document.getElementById("finance-modal")?.remove();
            this.loadSection(this.currentSection);
          } catch (err) {
            alert(AccountantUI.t("accountant.actions.recordPaymentFailed", { message: err.message }, "Error while recording payment."));
            btn.disabled = false;
            btn.textContent = AccountantUI.t("accountant.financeModal.pay", {}, "Pay");
          }
        }
      }

      if (e.target.matches("#close-notif-modal, #cancel-notif")) {
        document.getElementById("notification-modal")?.remove();
      }

      if (e.target.classList.contains("search-notify-btn") || e.target.classList.contains("send-warning-btn")) {
        const userId = e.target.dataset.id || e.target.dataset.userId;
        const name = e.target.dataset.name;

        let defaultMessage = AccountantUI.t(
          "accountant.actions.defaultNotice",
          {},
          "Please contact the finance office to settle your account as soon as possible."
        );
        if (e.target.classList.contains("send-warning-btn")) {
          defaultMessage = AccountantUI.t(
            "accountant.actions.overdueReminder",
            {
              fee: e.target.dataset.fee,
              amount: AccountantUI._formatCurrency(e.target.dataset.amount)
            },
            "Reminder to pay the overdue fee."
          );
        }

        if (!userId || userId === "undefined") {
          alert(AccountantUI.t("accountant.actions.noLinkedUser", {}, "No account is linked to this user."));
          return;
        }
        AccountantUI.showNotificationModal(userId, name, defaultMessage);
      }

      if (e.target.id === "fetch-attendance-btn" || e.target.classList.contains("fetch-attendance-btn")) {
        const studentId = e.target.dataset.id || document.getElementById("attendance-student-id")?.value;
        if (!studentId) {
          alert(AccountantUI.t("accountant.actions.selectStudent", {}, "Please select a student."));
          return;
        }

        const btn = e.target;
        try {
          btn.disabled = true;
          document.getElementById("attendance-results").innerHTML = `<p style="text-align:center;">${AccountantUI.t("accountant.actions.fetching", {}, "Fetching...")}</p>`;
          const records = await AccountantServices.getStudentAttendance(studentId);
          AccountantUI.renderAttendanceReport(studentId, records);
        } catch (error) {
          document.getElementById("attendance-results").innerHTML = `<p style="color:red; text-align:center;">${AccountantUI.t("accountant.actions.attendanceLoadFailed", {}, "Could not load data.")}</p>`;
        } finally {
          btn.disabled = false;
        }
      }
    });

    document.addEventListener("submit", async (e) => {
      if (e.target.id === "add-fee-form") {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        try {
          if (submitBtn) submitBtn.disabled = true;
          await AccountantServices.createFee({
            student_id: parseInt(form.dataset.studentId, 10),
            fee_type: document.getElementById("new-fee-type").value,
            amount_due: parseInt(document.getElementById("new-fee-amount").value, 10),
            due_date: document.getElementById("new-fee-date").value,
            applied_discount: 0
          });
          alert(AccountantUI.t("accountant.actions.feeCreateSuccess", {}, "Fee added successfully."));
          document.getElementById("finance-modal")?.remove();
          this.loadSection(this.currentSection);
        } catch (err) {
          alert(AccountantUI.t("accountant.actions.feeCreateFailed", {}, "Failed to add the fee."));
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }
      }

      if (e.target.id === "send-notification-form") {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        try {
          if (submitBtn) submitBtn.disabled = true;
          await AccountantServices.sendNotification({
            user_id: parseInt(form.dataset.userId, 10),
            title: document.getElementById("notif-title").value,
            message: document.getElementById("notif-message").value
          });
          alert(AccountantUI.t("accountant.actions.notificationSendSuccess", {}, "Notification sent successfully."));
          document.getElementById("notification-modal")?.remove();
        } catch (err) {
          alert(AccountantUI.t("accountant.actions.notificationSendFailed", {}, "Failed to send the notification."));
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }
      }
    });

    this._dynamicEventsBound = true;
  }
};

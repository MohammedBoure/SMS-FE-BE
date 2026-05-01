// js/roles/parent/role.js

const ParentRole = {
  currentSection: "children",
  parentId: null,
  myChildren: [],
  userProfile: null,

  async init() {
    if (!Auth.requireAuth("parent")) return;

    if (window.I18n) {
      await I18n.init({ scope: "parent", defaultLang: "ar" });
    }

    const session = Auth.getSession();

    try {
      this.userProfile = await Api.get(`/users/${session.user_id}`);
      ParentUI.renderHeader(this.userProfile);

      const parentProfile = await ParentServices.getParentProfile(session.user_id);
      if (!parentProfile) {
        throw new Error(ParentUI.t("parent.state.parentProfileMissing", {}, "Your account is not registered as a parent."));
      }

      this.parentId = parentProfile.id || parentProfile.parent_id;

      const childrenRes = await ParentServices.getMyChildren(this.parentId);
      this.myChildren = Array.isArray(childrenRes) ? childrenRes : (childrenRes.data || []);

      this.bindNavEvents();
      this.bindLanguageEvents();
      this.bindDynamicEvents();
      this.loadSection(this.currentSection);
    } catch (err) {
      console.error(err);
      ParentUI.renderError(err.message || ParentUI.t("parent.state.initFailed", {}, "Failed to initialize parent data."));
    }
  },

  bindLanguageEvents() {
    if (this._languageEventsBound) return;

    window.addEventListener("i18n:change", (event) => {
      if (event.detail?.scope && event.detail.scope !== "parent") return;
      ParentUI.renderHeader(this.userProfile);
      this.loadSection(this.currentSection);
    });

    this._languageEventsBound = true;
  },

  bindNavEvents() {
    if (this._navEventsBound) return;

    const nav = document.getElementById("parent-nav");
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-btn");
      if (btn) this.loadSection(btn.dataset.section);
    });

    this._navEventsBound = true;
  },

  bindDynamicEvents() {
    if (this._dynamicEventsBound) return;

    const main = document.getElementById("parent-main");
    if (!main) return;

    main.addEventListener("click", async (e) => {
      if (e.target.id === "parent-mark-all-notifications-read") {
        const session = Auth.getSession();
        const originalText = e.target.textContent;
        e.target.disabled = true;
        e.target.textContent = ParentUI.t("parent.common.updating", {}, "Updating...");
        try {
          await ParentServices.markAllNotificationsAsRead(session.user_id);
          await this.loadSection("notifications");
        } catch (err) {
          e.target.disabled = false;
          e.target.textContent = originalText;
          alert(err.message || ParentUI.t("parent.actions.notificationsUpdateFailed", {}, "Could not update notifications."));
        }
        return;
      }

      const markNotificationBtn = e.target.closest(".parent-mark-notification-read");
      if (markNotificationBtn) {
        const originalText = markNotificationBtn.textContent;
        markNotificationBtn.disabled = true;
        markNotificationBtn.textContent = ParentUI.t("parent.common.updating", {}, "Updating...");
        try {
          await ParentServices.markNotificationAsRead(markNotificationBtn.dataset.notificationId);
          await this.loadSection("notifications");
        } catch (err) {
          markNotificationBtn.disabled = false;
          markNotificationBtn.textContent = originalText;
          alert(err.message || ParentUI.t("parent.actions.notificationUpdateFailed", {}, "Could not update the notification."));
        }
      }
    });

    this._dynamicEventsBound = true;
  },

  async loadSection(section) {
    this.currentSection = section;
    ParentUI.renderNav(section);
    ParentUI.renderLoading();

    try {
      switch (section) {
        case "children":
          ParentUI.renderChildren(this.myChildren);
          break;

        case "grades": {
          let allGrades = [];
          for (const child of this.myChildren) {
            const res = await ParentServices.getChildGrades(child.student_id || child.id);
            const grades = Array.isArray(res) ? res : (res.data || []);
            grades.forEach(g => { g.child_name = child.student_name || child.full_name; });
            allGrades = allGrades.concat(grades);
          }
          ParentUI.renderGrades(allGrades);
          break;
        }

        case "attendance": {
          let allAttendance = [];
          for (const child of this.myChildren) {
            const res = await ParentServices.getChildAttendance(child.student_id || child.id);
            const records = Array.isArray(res) ? res : (res.data || []);
            records.forEach(r => { r.child_name = child.student_name || child.full_name; });
            allAttendance = allAttendance.concat(records);
          }
          ParentUI.renderAttendance(allAttendance);
          break;
        }

        case "fees": {
          let allFees = [];
          for (const child of this.myChildren) {
            const res = await ParentServices.getChildFees(child.student_id || child.id);
            const fees = Array.isArray(res) ? res : (res.data || []);
            fees.forEach(f => { f.child_name = child.student_name || child.full_name; });
            allFees = allFees.concat(fees);
          }
          ParentUI.renderFees(allFees);
          break;
        }

        case "posts": {
          const res = await ParentServices.getPosts();
          ParentUI.renderPosts(res);
          break;
        }

        case "messages": {
          const session = Auth.getSession();
          const inbox = await ParentServices.getMessagesInbox(session.user_id);
          ParentUI.renderMessages(inbox, session.user_id);
          break;
        }

        case "notifications": {
          const session = Auth.getSession();
          const res = await ParentServices.getNotifications(session.user_id);
          const notifications = Array.isArray(res) ? res : (res.data || []);
          ParentUI.renderNotifications(notifications);
          break;
        }

        default:
          ParentUI.renderError(ParentUI.t("parent.state.unknownSection", {}, "Unknown section"));
      }
    } catch (err) {
      ParentUI.renderError(err.message);
    }
  }
};

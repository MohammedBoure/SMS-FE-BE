// js/roles/parent/role.js

const ParentRole = {
  currentSection: "children",
  parentId: null,
  myChildren: [], 

  async init() {
    if (!Auth.requireAuth("parent")) return;
    const session = Auth.getSession();

    try {
      const userProfile = await Api.get(`/users/${session.user_id}`);
      ParentUI.renderHeader(userProfile);

      const parentProfile = await ParentServices.getParentProfile(session.user_id);
      if (!parentProfile) {
        throw new Error("حسابك غير مسجل كولي أمر في قاعدة البيانات. تواصل مع الإدارة.");
      }
      
      this.parentId = parentProfile.id || parentProfile.parent_id;

      // استخراج المصفوفة بأمان
      const childrenRes = await ParentServices.getMyChildren(this.parentId);
      this.myChildren = Array.isArray(childrenRes) ? childrenRes : (childrenRes.data || []);

      this.bindNavEvents();
      this.bindDynamicEvents();
      this.loadSection(this.currentSection);

    } catch (err) {
      console.error(err);
      ParentUI.renderError(err.message || "فشل في تهيئة بيانات ولي الأمر.");
    }
  },

  bindNavEvents() {
    const nav = document.getElementById("parent-nav");
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".nav-btn");
      if (btn) {
        this.loadSection(btn.dataset.section);
      }
    });
  },

  bindDynamicEvents() {
    const main = document.getElementById("parent-main");
    if (!main) return;

    main.addEventListener("click", async (e) => {
      if (e.target.id === "parent-mark-all-notifications-read") {
        const session = Auth.getSession();
        const originalText = e.target.textContent;
        e.target.disabled = true;
        e.target.textContent = "جارٍ التحديث...";
        try {
          await ParentServices.markAllNotificationsAsRead(session.user_id);
          await this.loadSection("notifications");
        } catch (err) {
          e.target.disabled = false;
          e.target.textContent = originalText;
          alert(err.message || "تعذر تحديث الإشعارات.");
        }
        return;
      }

      const markNotificationBtn = e.target.closest(".parent-mark-notification-read");
      if (markNotificationBtn) {
        const originalText = markNotificationBtn.textContent;
        markNotificationBtn.disabled = true;
        markNotificationBtn.textContent = "جارٍ التحديث...";
        try {
          await ParentServices.markNotificationAsRead(markNotificationBtn.dataset.notificationId);
          await this.loadSection("notifications");
        } catch (err) {
          markNotificationBtn.disabled = false;
          markNotificationBtn.textContent = originalText;
          alert(err.message || "تعذر تحديث الإشعار.");
        }
      }
    });
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
          for (let child of this.myChildren) {
            const res = await ParentServices.getChildGrades(child.student_id || child.id);
            const grades = Array.isArray(res) ? res : (res.data || []);
            grades.forEach(g => g.child_name = child.student_name || child.full_name);
            allGrades = allGrades.concat(grades);
          }
          ParentUI.renderGrades(allGrades);
          break;
        }

        case "attendance": {
          let allAttendance = [];
          for (let child of this.myChildren) {
            const res = await ParentServices.getChildAttendance(child.student_id || child.id);
            const records = Array.isArray(res) ? res : (res.data || []);
            records.forEach(r => r.child_name = child.student_name || child.full_name);
            allAttendance = allAttendance.concat(records);
          }
          ParentUI.renderAttendance(allAttendance);
          break;
        }

        case "fees": {
          let allFees = [];
          for (let child of this.myChildren) {
            const res = await ParentServices.getChildFees(child.student_id || child.id);
            const fees = Array.isArray(res) ? res : (res.data || []);
            fees.forEach(f => f.child_name = child.student_name || child.full_name);
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
          ParentUI.renderError("قسم غير معروف");
      }
    } catch (err) {
      ParentUI.renderError(err.message);
    }
  }
};

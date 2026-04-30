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
      this.loadSection(this.currentSection);

    } catch (err) {
      console.error(err);
      ParentUI.renderError(err.message || "فشل في تهيئة بيانات ولي الأمر.");
    }
  },

  bindNavEvents() {
    const nav = document.getElementById("parent-nav");
    nav.addEventListener("click", (e) => {
      if (e.target.classList.contains("nav-btn")) {
        this.loadSection(e.target.dataset.section);
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

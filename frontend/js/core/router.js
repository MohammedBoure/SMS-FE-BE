const ROLE_DASHBOARD_MAP = {
  admin: "pages/admin.html",
  receptionist: "pages/receptionist.html",
  student: "pages/student.html",
  parent: "pages/parent.html",
  accountant: "pages/accountant.html",
  teacher: "pages/teacher.html",
};

const Router = {
  init() {
    const session = Storage.getSession();
    const currentPath = window.location.pathname;

    if (!session.role || !session.user_id) {
      if (!currentPath.endsWith("login.html")) {
        window.location.href = "pages/login.html";
      }
      return;
    }

    const dashboardPath = ROLE_DASHBOARD_MAP[session.role];
    if (!dashboardPath) {
      Storage.clearSession();
      window.location.href = "pages/login.html";
      return;
    }

    if (
      currentPath.endsWith("index.html") ||
      currentPath.endsWith("/") ||
      currentPath === ""
    ) {
      window.location.href = dashboardPath;
    }
  },

  redirectToDashboard(role) {
    const path = ROLE_DASHBOARD_MAP[role];
    if (path) {
      window.location.href = "../" + path;
    } else {
      window.location.href = "../pages/login.html";
    }
  },

  logout() {
    Storage.clearSession();
    window.location.href = "../pages/login.html";
  },
};

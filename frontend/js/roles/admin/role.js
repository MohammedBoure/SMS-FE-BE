const AdminRole = {
  currentSection: "users",

  init() {
    if (!Auth.requireAuth("admin")) return;
    const session = Auth.getSession();
    AdminUI.renderHeader(session);
    AdminUI.renderNav(this.currentSection);
    this.loadSection(this.currentSection);
  },

  async loadSection(section) {
    this.currentSection = section;
    AdminUI.renderNav(section);
    AdminUI.renderLoading();

    try {
      switch (section) {
        case "users": {
          const users = await AdminServices.getUsers();
          AdminUI.renderUsers(users);
          break;
        }
        case "students": {
          const students = await AdminServices.getStudents();
          AdminUI.renderStudents(students);
          break;
        }
        case "teachers": {
          const teachers = await AdminServices.getTeachers();
          AdminUI.renderTeachers(teachers);
          break;
        }
        case "classes": {
          const classes = await AdminServices.getClasses();
          AdminUI.renderClasses(classes);
          break;
        }
        case "payments": {
          const payments = await AdminServices.getPayments();
          AdminUI.renderPayments(payments);
          break;
        }
        case "attendance": {
          const attendance = await AdminServices.getAttendance();
          AdminUI.renderAttendance(attendance);
          break;
        }
        default:
          AdminUI.renderError("Unknown section");
      }
    } catch (err) {
      AdminUI.renderError(err.message);
    }
  },

  async toggleUserStatus(userId, currentActive) {
    try {
      await AdminServices.changeUserStatus(userId, !currentActive);
      this.loadSection("users");
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  },

  async deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await AdminServices.deleteUser(userId);
      this.loadSection("users");
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  },
};

// js/roles/admin/ui.js

const AdminUI = {
  SECTIONS: ["users", "students", "teachers", "classes", "payments", "attendance"],

  renderHeader(session) {
    const header = document.getElementById("admin-header");
    header.innerHTML = `
      <h1>Admin Dashboard</h1>
      <span>User ID: ${session.user_id} | Role: ${session.role}</span>
      <button id="logout-btn">Logout</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  },

  renderNav(activeSection) {
    const nav = document.getElementById("admin-nav");
    nav.innerHTML = this.SECTIONS.map(section =>
      `<button class="nav-btn${activeSection === section ? " active" : ""}" data-section="${section}">${this._capitalize(section)}</button>`
    ).join("");
    nav.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => AdminRole.loadSection(btn.dataset.section));
    });
  },

  renderLoading() {
    document.getElementById("admin-main").innerHTML = "<p>Loading...</p>";
  },

  renderError(message) {
    document.getElementById("admin-main").innerHTML = `<p>Error: ${message}</p>`;
  },

  renderUsers(response) {
    // استخراج المصفوفة بأمان
    const users = response.data || response || [];
    const main = document.getElementById("admin-main");
    if (!users || users.length === 0) {
      main.innerHTML = "<h2>Users</h2><p>No users found.</p>";
      return;
    }
    const rows = users.map(u => `
      <tr>
        <td>${u.id || u.user_id}</td>
        <td>${u.full_name}</td>
        <td>${u.username}</td>
        <td>${u.role_name}</td>
        <td>${u.email || ""}</td>
        <td>${u.is_active ? "Active" : "Inactive"}</td>
        <td>
          <button data-action="toggle-status" data-id="${u.id || u.user_id}" data-active="${u.is_active}">${u.is_active ? "Deactivate" : "Activate"}</button>
          <button data-action="delete-user" data-id="${u.id || u.user_id}">Delete</button>
        </td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>Users Management</h2>
      <table border="1">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Username</th><th>Role</th><th>Email</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    main.querySelectorAll("[data-action='toggle-status']").forEach(btn => {
      btn.addEventListener("click", () => AdminRole.toggleUserStatus(btn.dataset.id, btn.dataset.active === "true"));
    });
    main.querySelectorAll("[data-action='delete-user']").forEach(btn => {
      btn.addEventListener("click", () => AdminRole.deleteUser(btn.dataset.id));
    });
  },

  renderStudents(response) {
    // استخراج المصفوفة بأمان
    const students = response.data || response || [];
    const main = document.getElementById("admin-main");
    if (!students || students.length === 0) {
      main.innerHTML = "<h2>Students</h2><p>No students found.</p>";
      return;
    }
    const rows = students.map(s => `
      <tr>
        <td>${s.student_id || s.id}</td>
        <td>${s.student_name || s.full_name}</td>
        <td>${s.email || ""}</td>
        <td>${s.student_phone || s.phone || ""}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>Students</h2>
      <table border="1">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderTeachers(response) {
    const teachers = response.data || response || [];
    const main = document.getElementById("admin-main");
    if (!teachers || teachers.length === 0) {
      main.innerHTML = "<h2>Teachers</h2><p>No teachers found.</p>";
      return;
    }
    const rows = teachers.map(t => `
      <tr>
        <td>${t.teacher_id || t.id}</td>
        <td>${t.teacher_name || t.full_name}</td>
        <td>${t.subject || ""}</td>
        <td>${t.email || ""}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>Teachers</h2>
      <table border="1">
        <thead><tr><th>ID</th><th>Name</th><th>Subject</th><th>Email</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderClasses(response) {
    const classes = response.data || response || [];
    const main = document.getElementById("admin-main");
    if (!classes || classes.length === 0) {
      main.innerHTML = "<h2>Classes</h2><p>No classes found.</p>";
      return;
    }
    const rows = classes.map(c => `
      <tr>
        <td>${c.class_id || c.id}</td>
        <td>${c.class_name}</td>
        <td>${c.level || c.grade_level || ""}</td>
        <td>${c.capacity || ""}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>Classes</h2>
      <table border="1">
        <thead><tr><th>ID</th><th>Name</th><th>Level</th><th>Capacity</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderPayments(response) {
    const payments = response.data || response || [];
    const main = document.getElementById("admin-main");
    if (!payments || payments.length === 0) {
      main.innerHTML = "<h2>Payments</h2><p>No payments found.</p>";
      return;
    }
    const rows = payments.map(p => `
      <tr>
        <td>${p.payment_id || p.id}</td>
        <td>${p.student_id || p.student_name || ""}</td>
        <td>${p.amount_paid || p.amount}</td>
        <td>${p.payment_date || ""}</td>
        <td>${p.status || "completed"}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>Payments</h2>
      <table border="1">
        <thead><tr><th>ID</th><th>Student</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderAttendance(response) {
    const records = response.data || response || [];
    const main = document.getElementById("admin-main");
    if (!records || records.length === 0) {
      main.innerHTML = "<h2>Attendance</h2><p>No attendance records found.</p>";
      return;
    }
    const rows = records.map(r => `
      <tr>
        <td>${r.attendance_id || r.id}</td>
        <td>${r.student_id || r.student_name || ""}</td>
        <td>${r.class_id || ""}</td>
        <td>${r.date || ""}</td>
        <td>${r.status || ""}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>Attendance</h2>
      <table border="1">
        <thead><tr><th>ID</th><th>Student</th><th>Class</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  _capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
};
// js/roles/receptionist/ui.js

const ReceptionistUI = {
  SECTIONS: ["students", "parents", "search", "finance", "posts", "messages", "notifications"],

  renderHeader(userProfile) {
    const header = document.getElementById("receptionist-header");
    header.innerHTML = `
      <div>
        <h1>مكتب الاستقبال | مرحباً: ${this._escape(userProfile ? userProfile.full_name : "...")}</h1>
        <button id="logout-btn">تسجيل خروج</button>
      </div>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  },

  renderNav(activeSection) {
    const nav = document.getElementById("receptionist-nav");
    nav.innerHTML = this.SECTIONS.map(s =>
      `<button class="nav-btn${activeSection === s ? " active" : ""}" data-section="${s}">${this._translate(s)}</button>`
    ).join("");
  },

  renderLoading() {
    document.getElementById("receptionist-main").innerHTML = "<h3>جاري التحميل...</h3>";
  },

  renderError(msg) {
    document.getElementById("receptionist-main").innerHTML = `<h3 class="error-message">خطأ: ${this._escape(msg)}</h3>`;
  },

  // دالة عامة لإغلاق أي نافذة منبثقة (Modal)
  closeStudentDetailsModal() {
    const modal = document.getElementById("student-details-modal");
    if (modal) modal.remove();
    document.body.classList.remove("modal-open");
  },

  // === الدوال المساعدة (Helpers) ===
  _getNotificationId(notification) {
    const id = notification?.id ?? notification?.notification_id;
    return id === undefined || id === null || id === "" ? null : id;
  },

  _isNotificationRead(notification) {
    const value = notification?.is_read;
    return value === true || value === 1 || value === "1" || value === "true";
  },

  _translate(str) {
    const map = { students: "الطلاب", parents: "أولياء الأمور", search: "البحث الشامل", finance: "المالية", posts: "المنشورات", messages: "المراسلة", notifications: "الإشعارات" };
    return map[str] || str;
  },

  _translateRole(role) {
    const map = { student: "طالب", teacher: "أستاذ", parent: "ولي أمر", admin: "مدير", receptionist: "استقبال", accountant: "محاسب" };
    return map[role] || role;
  },

  _statusLabel(status) {
    const map = { active: "نشط", inactive: "غير نشط", suspended: "موقوف", graduated: "متخرج", withdrawn: "منسحب" };
    return map[status] || status || "-";
  },

  _formatValue(value) { 
    return value === null || value === undefined || value === "" ? "-" : value; 
  },

  _escape(value) {
    return String(this._formatValue(value)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  },

  _escapeAttr(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
};

// js/roles/admin/ui.js

const AdminUI = {
  // هيكل التنقل الشامل لجميع الأقسام الـ 19
  NAV_STRUCTURE: [
    { 
      category: "الإدارة الأساسية", 
      items: [
        { id: "users", label: "إدارة المستخدمين", icon: "👥" },
        { id: "parents", label: "أولياء الأمور", icon: "👨‍👩‍👧" }
      ] 
    },
    { 
      category: "الشؤون الأكاديمية", 
      items: [
        { id: "academic", label: "نظرة عامة (أكاديمي)", icon: "📈" },
        { id: "classes", label: "الفصول والمقاعد", icon: "🏫" },
        { id: "students", label: "شؤون الطلاب", icon: "🎓" },
        { id: "teachers", label: "الطاقم التعليمي", icon: "👨‍🏫" },
        { id: "programs", label: "البرامج الدراسية", icon: "📚" },
        { id: "enrollments", label: "سجلات التسجيل", icon: "📑" },
        { id: "attendance", label: "الحضور والغياب", icon: "⏱️" },
        { id: "schedules", label: "الجداول الزمنية", icon: "📅" },
        { id: "assessments", label: "التقييمات والامتحانات", icon: "📝" },
        { id: "grades", label: "الدرجات والنتائج", icon: "📊" }
      ] 
    },
    { 
      category: "المالية والموارد", 
      items: [
        { id: "finance", label: "نظرة عامة (مالية)", icon: "💰" },
        { id: "studentFees", label: "الرسوم والديون", icon: "🧾" },
        { id: "payments", label: "سجل المدفوعات", icon: "💳" },
        { id: "transactions", label: "الدفتر اليومي", icon: "📓" },
        { id: "resources", label: "المكتبة الرقمية", icon: "📚" }
      ] 
    },
    { 
      category: "التواصل والمجتمع", 
      items: [
        { id: "conversations", label: "المحادثات المباشرة", icon: "💬" },
        { id: "notifications", label: "الإشعارات والتنبيهات", icon: "📢" },
        { id: "posts", label: "لوحة الإعلانات", icon: "📰" }
      ] 
    }
  ],

  renderHeader(session) {
    const header = document.getElementById("admin-header");
    header.innerHTML = `
      <div style="padding: 10px 0;">
        <h2 style="margin:0; font-size: 1.2em;">لوحة الإدارة الشاملة</h2>
        <small style="color: #6ee7b7;">المعرف: #${session.user_id}</small>
      </div>
    `;
    
    document.getElementById("user-info").innerText = `حساب: ${session.role}`;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
    this.bindShellControls();
    this.setupResponsiveTables();
  },

  bindShellControls() {
    const toggle = document.getElementById("admin-menu-toggle");
    const backdrop = document.getElementById("admin-sidebar-backdrop");
    if (!toggle || toggle.dataset.bound === "true") return;

    const setOpen = (open) => {
      document.body.classList.toggle("sidebar-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    toggle.addEventListener("click", () => {
      setOpen(!document.body.classList.contains("sidebar-open"));
    });

    if (backdrop) {
      backdrop.addEventListener("click", () => setOpen(false));
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    toggle.dataset.bound = "true";
  },

  closeMobileSidebar() {
    document.body.classList.remove("sidebar-open");
    const toggle = document.getElementById("admin-menu-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  },

  setupResponsiveTables() {
    const main = document.getElementById("admin-main");
    if (!main || main.dataset.responsiveTablesBound === "true") return;

    const enhance = () => this.enhanceResponsiveTables(main);
    const observer = new MutationObserver(enhance);
    observer.observe(main, { childList: true, subtree: true });
    main.dataset.responsiveTablesBound = "true";
    requestAnimationFrame(enhance);
  },

  enhanceResponsiveTables(root = document) {
    root.querySelectorAll("table").forEach(table => {
      if (table.closest(".md-body, .tbl-mini-preview")) return;

      const headers = Array.from(table.querySelectorAll("thead th"))
        .map(th => th.textContent.replace(/\s+/g, " ").trim());
      if (!headers.length) return;

      table.classList.add("admin-auto-mobile-table");
      table.querySelectorAll("tbody tr").forEach(row => {
        Array.from(row.children).forEach((cell, index) => {
          if (cell.tagName !== "TD") return;
          if (cell.colSpan && cell.colSpan > 1) {
            cell.classList.add("admin-empty-cell");
            return;
          }
          if (!cell.getAttribute("data-label") && headers[index]) {
            cell.setAttribute("data-label", headers[index]);
          }
          if (/إجراءات|الأبناء|Actions/i.test(headers[index] || "")) {
            cell.classList.add("admin-actions-cell");
          }
        });
      });
    });
  },

  renderNav(activeSection) {
    const nav = document.getElementById("admin-nav");
    let html = "";

    this.NAV_STRUCTURE.forEach(group => {
      html += `<div class="nav-category" style="padding: 15px 20px 5px; font-size: 0.75em; color: #a7f3d0; opacity: 0.8; font-weight: bold;">${group.category}</div>`;
      group.items.forEach(item => {
        const isActive = activeSection === item.id ? " active" : "";
        html += `
          <button class="nav-btn${isActive}" data-section="${item.id}" style="width: 100%; text-align: right; display: flex; align-items: center; gap: 10px; border: none; background: transparent; color: white; padding: 10px 20px; cursor: pointer; transition: 0.2s;">
            <span style="font-size: 1.2em;">${item.icon}</span>
            <span>${item.label}</span>
          </button>`;
      });
    });

    nav.innerHTML = html;

    nav.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            this.closeMobileSidebar();
            window.location.hash = btn.dataset.section;
        });
    });
  },

  prepareMain(title) {
    const main = document.getElementById("admin-main");
    document.getElementById("section-title").innerText = title;
    main.innerHTML = ""; 
    return main;
  },

  renderLoading() {
    document.getElementById("admin-main").innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 300px; flex-direction: column; gap: 15px;">
        <div style="width: 40px; height: 40px; border: 4px solid #cbd5e1; border-top: 4px solid #064e3b; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="color: #64748b; font-weight: bold;">جاري تحميل البيانات...</p>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      </div>`;
  },

  renderError(message) {
    document.getElementById("admin-main").innerHTML = `
      <div style="background: #fef2f2; color: #991b1b; padding: 20px; border-radius: 8px; border: 1px solid #fca5a5; margin-top: 20px;">
        <strong>عذراً، حدث خطأ:</strong> ${message}
      </div>`;
  },

  _escape(str) {
    if (str === null || str === undefined) return "-";
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  },

  _formatCurrency(amount) {
    if (amount === null || amount === undefined) return "0.00 دج";
    return new Intl.NumberFormat('ar-DZ', { style: 'currency', currency: 'DZD' }).format(amount);
  }
};

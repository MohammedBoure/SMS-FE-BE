// js/roles/admin/ui.js

const AdminUI = {
  navCollapsedGroups: new Set(),
  navSearchQuery: "",

  // هيكل التنقل الشامل لجميع الأقسام الـ 19
  NAV_STRUCTURE: [
    { 
      category: "الإدارة الأساسية", 
      items: [
        { id: "users", label: "إدارة المستخدمين", icon: "users" },
        { id: "parents", label: "أولياء الأمور", icon: "parents" }
      ] 
    },
    { 
      category: "الشؤون الأكاديمية", 
      items: [
        { id: "academic", label: "نظرة عامة (أكاديمي)", icon: "trending" },
        { id: "classes", label: "الفصول والمقاعد", icon: "building" },
        { id: "students", label: "شؤون الطلاب", icon: "graduation" },
        { id: "teachers", label: "الطاقم التعليمي", icon: "teacher" },
        { id: "programs", label: "البرامج الدراسية", icon: "bookOpen" },
        { id: "enrollments", label: "سجلات التسجيل", icon: "files" },
        { id: "attendance", label: "الحضور والغياب", icon: "clock" },
        { id: "schedules", label: "الجداول الزمنية", icon: "calendar" },
        { id: "assessments", label: "التقييمات والامتحانات", icon: "clipboard" },
        { id: "grades", label: "الدرجات والنتائج", icon: "chart" }
      ] 
    },
    { 
      category: "المالية والموارد", 
      items: [
        { id: "finance", label: "نظرة عامة (مالية)", icon: "finance" },
        { id: "studentFees", label: "الرسوم والديون", icon: "receipt" },
        { id: "payments", label: "سجل المدفوعات", icon: "card" },
        { id: "transactions", label: "الدفتر اليومي", icon: "ledger" },
        { id: "resources", label: "المكتبة الرقمية", icon: "bookOpen" }
      ] 
    },
    { 
      category: "التواصل والمجتمع", 
      items: [
        { id: "conversations", label: "المحادثات المباشرة", icon: "message" },
        { id: "notifications", label: "الإشعارات والتنبيهات", icon: "megaphone" },
        { id: "posts", label: "لوحة الإعلانات", icon: "newspaper" }
      ] 
    }
  ],

  ICONS: {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    parents: '<path d="M10 19v-1a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v1"/><circle cx="5.5" cy="7" r="3"/><path d="M23 19v-1a4 4 0 0 0-4-4h-1a4 4 0 0 0-4 4v1"/><circle cx="18.5" cy="7" r="3"/><path d="M12 22v-2a3 3 0 0 1 6 0v2"/><circle cx="15" cy="14" r="2"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    building: '<path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/><path d="M9 16h1"/><path d="M14 16h1"/>',
    graduation: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/>',
    teacher: '<path d="M3 4h18v12H3z"/><path d="M7 20h10"/><path d="M12 16v4"/><circle cx="8" cy="10" r="2"/><path d="M12 13c-.7-1.2-1.9-2-4-2s-3.3.8-4 2"/><path d="M14 8h4"/><path d="M14 11h4"/>',
    bookOpen: '<path d="M2 4h7a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-7a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h8z"/>',
    files: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/>',
    clipboard: '<path d="M9 4h6a2 2 0 0 1 2 2v1H7V6a2 2 0 0 1 2-2Z"/><path d="M9 4a3 3 0 0 1 6 0"/><path d="M7 6H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    chart: '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="5" width="3" height="12"/>',
    finance: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M15 9.5A3 3 0 0 0 12 8c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2a3.2 3.2 0 0 1-3-1.5"/>',
    receipt: '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 1V2z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/><path d="M14 15h2"/>',
    ledger: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 6h8"/><path d="M8 10h8"/><path d="M8 14h5"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8"/><path d="M8 13h5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z"/>',
    megaphone: '<path d="M3 11v2a2 2 0 0 0 2 2h2l4 5v-5l8 2V7l-8 2H5a2 2 0 0 0-2 2Z"/><path d="M19 7a4 4 0 0 1 0 10"/>',
    newspaper: '<path d="M4 5h13a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M20 8h1a1 1 0 0 1 1 1v9a3 3 0 0 1-3 3"/><path d="M8 9h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-15.2 6.5L3 16"/><path d="M3 16h5v5"/><path d="M3 12A9 9 0 0 1 18.2 5.5L21 8"/><path d="M21 8h-5V3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    settings: '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 15H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="m12 3 10 18H2z"/><path d="M12 9v5"/><path d="M12 18h.01"/>',
    upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 16.5A4.5 4.5 0 0 1 15.5 21h-7A4.5 4.5 0 0 1 4 16.5"/>',
    download: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/><path d="M18 12h.01"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    archive: '<path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>',
    video: '<path d="M23 7 16 12l7 5V7Z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
    audio: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
    panelClose: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path d="m15 9-3 3 3 3"/>',
    panelOpen: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path d="m13 9 3 3-3 3"/>'
  },

  EMOJI_ICON_MAP: [
    ["👨‍👩‍👧", "parents"], ["👨‍🏫", "teacher"], ["🧑‍🎓", "graduation"],
    ["👥", "users"], ["📈", "trending"], ["🏫", "building"], ["🎓", "graduation"],
    ["📚", "bookOpen"], ["📑", "files"], ["⏱️", "clock"], ["⏱", "clock"],
    ["📅", "calendar"], ["🗓️", "calendar"], ["🗓", "calendar"], ["📝", "clipboard"],
    ["📊", "chart"], ["💰", "finance"], ["🧾", "receipt"], ["💳", "card"],
    ["📓", "ledger"], ["💬", "message"], ["📢", "megaphone"], ["📰", "newspaper"],
    ["🔍", "search"], ["🔄", "refresh"], ["👁️", "eye"], ["👁", "eye"],
    ["⚙️", "settings"], ["⚙", "settings"], ["🗑️", "trash"], ["🗑", "trash"],
    ["✏️", "edit"], ["✏", "edit"], ["🚫", "ban"], ["✅", "check"], ["✔️", "check"],
    ["✔", "check"], ["❌", "ban"], ["⚠️", "alert"], ["⚠", "alert"], ["☁️", "upload"],
    ["⬇️", "download"], ["⬇", "download"], ["🖨️", "printer"], ["🖨", "printer"],
    ["💾", "save"], ["🚀", "send"], ["🖼️", "image"], ["🖼", "image"], ["📄", "file"],
    ["📕", "file"], ["📦", "archive"], ["🎬", "video"], ["🎵", "audio"], ["☾", "moon"],
    ["☀", "sun"], ["⬆️", "upload"], ["⬆", "upload"], ["📞", "phone"], ["☎️", "phone"],
    ["☎", "phone"], ["✉️", "mail"], ["✉", "mail"], ["📧", "mail"]
  ],

  icon(name, className = "ui-icon") {
    const body = this.ICONS[name] || this.ICONS.file;
    return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  },

  renderHeader(session) {
    const header = document.getElementById("admin-header");
    header.innerHTML = `
      <div class="admin-brand">
        <div class="admin-brand-mark">A</div>
        <div class="admin-brand-text">
          <h2>لوحة الإدارة</h2>
          <small>المعرف: #${session.user_id}</small>
        </div>
      </div>
    `;
    
    document.getElementById("user-info").innerText = `حساب: ${session.role}`;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
    this.initTheme();
    this.bindShellControls();
    this.bindSidebarTools();
    this.setupIconReplacement();
    this.setupResponsiveTables();
  },

  initTheme() {
    const stored = localStorage.getItem("admin-theme");
    const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    this.applyTheme(stored || document.documentElement.dataset.theme || preferred);

    const btn = document.getElementById("admin-theme-toggle");
    if (!btn || btn.dataset.bound === "true") return;

    btn.addEventListener("click", () => {
      const current = document.body.dataset.theme === "dark" ? "dark" : "light";
      this.applyTheme(current === "dark" ? "light" : "dark");
    });
    btn.dataset.bound = "true";
  },

  applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    document.body.dataset.theme = nextTheme;
    localStorage.setItem("admin-theme", nextTheme);

    const btn = document.getElementById("admin-theme-toggle");
    if (!btn) return;

    const isDark = nextTheme === "dark";
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    const icon = btn.querySelector(".theme-toggle-icon");
    const label = btn.querySelector(".theme-toggle-label");
    if (icon) icon.innerHTML = this.icon(isDark ? "moon" : "sun", "theme-toggle-svg");
    if (label) label.textContent = isDark ? "داكن" : "فاتح";
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

  bindSidebarTools() {
    const collapseBtn = document.getElementById("admin-sidebar-collapse");
    const searchInput = document.getElementById("admin-nav-search");
    const searchIcon = document.querySelector(".sidebar-search span");
    if (searchIcon) searchIcon.innerHTML = this.icon("search", "sidebar-tool-svg");

    try {
      this.navCollapsedGroups = new Set(JSON.parse(localStorage.getItem("admin-nav-collapsed") || "[]"));
    } catch (err) {
      this.navCollapsedGroups = new Set();
    }

    if (localStorage.getItem("admin-sidebar-mini") === "true") {
      document.body.classList.add("sidebar-mini");
    }
    this.updateSidebarMiniState();

    if (collapseBtn && collapseBtn.dataset.bound !== "true") {
      collapseBtn.addEventListener("click", () => {
        const enteringMini = !document.body.classList.contains("sidebar-mini");
        document.body.classList.toggle("sidebar-mini");
        if (enteringMini && searchInput) {
          searchInput.value = "";
          this.navSearchQuery = "";
          this.applyNavFilter();
        }
        localStorage.setItem("admin-sidebar-mini", document.body.classList.contains("sidebar-mini") ? "true" : "false");
        this.updateSidebarMiniState();
      });
      collapseBtn.dataset.bound = "true";
    }

    if (searchInput && searchInput.dataset.bound !== "true") {
      searchInput.value = this.navSearchQuery;
      searchInput.addEventListener("input", () => {
        this.navSearchQuery = searchInput.value;
        this.applyNavFilter();
      });
      searchInput.dataset.bound = "true";
    }
  },

  updateSidebarMiniState() {
    const collapseBtn = document.getElementById("admin-sidebar-collapse");
    if (!collapseBtn) return;

    const isMini = document.body.classList.contains("sidebar-mini");
    collapseBtn.setAttribute("aria-pressed", isMini ? "true" : "false");
    collapseBtn.setAttribute("title", isMini ? "توسيع الشريط الجانبي" : "تصغير الشريط الجانبي");
    const icon = collapseBtn.querySelector(".sidebar-collapse-icon");
    if (icon) icon.innerHTML = this.icon(isMini ? "panelOpen" : "panelClose", "sidebar-tool-svg");
    const label = collapseBtn.querySelector(".sidebar-collapse-label");
    if (label) label.textContent = isMini ? "توسيع القائمة" : "تصغير القائمة";
  },

  closeMobileSidebar() {
    document.body.classList.remove("sidebar-open");
    const toggle = document.getElementById("admin-menu-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  },

  setupResponsiveTables() {
    const main = document.getElementById("admin-main");
    if (!main || main.dataset.responsiveTablesBound === "true") return;

    const enhance = () => {
      this.enhanceResponsiveTables(main);
      this.replaceEmojiIcons(main);
    };
    const observer = new MutationObserver(enhance);
    observer.observe(main, { childList: true, subtree: true });
    main.dataset.responsiveTablesBound = "true";
    requestAnimationFrame(enhance);
  },

  setupIconReplacement() {
    if (document.body.dataset.iconReplacementBound === "true") return;
    const enhance = () => this.replaceEmojiIcons(document.body);
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });
    document.body.dataset.iconReplacementBound = "true";
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

  replaceEmojiIcons(root = document) {
    if (!root || root.dataset?.iconsEnhanced === "true") return;

    const tokens = this.EMOJI_ICON_MAP
      .map(([emoji]) => emoji)
      .sort((a, b) => b.length - a.length)
      .map(emoji => emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!tokens.length) return;

    const tokenRegex = new RegExp(`(${tokens.join("|")})`, "gu");
    const iconByEmoji = new Map(this.EMOJI_ICON_MAP);
    const textNodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const value = node.nodeValue || "";
        if (!tokenRegex.test(value)) return NodeFilter.FILTER_REJECT;
        tokenRegex.lastIndex = 0;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("script, style, textarea, input, select, option, code, pre, svg, .emoji-icon-replacement")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(node => {
      const value = node.nodeValue || "";
      tokenRegex.lastIndex = 0;
      if (!tokenRegex.test(value)) return;
      tokenRegex.lastIndex = 0;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      value.replace(tokenRegex, (match, _token, offset) => {
        if (offset > lastIndex) {
          fragment.appendChild(document.createTextNode(value.slice(lastIndex, offset)));
        }
        const iconName = iconByEmoji.get(match);
        const wrapper = document.createElement("span");
        wrapper.className = "emoji-icon-replacement";
        wrapper.innerHTML = this.icon(iconName, "inline-svg-icon");
        fragment.appendChild(wrapper);
        lastIndex = offset + match.length;
        return match;
      });
      if (lastIndex < value.length) {
        fragment.appendChild(document.createTextNode(value.slice(lastIndex)));
      }
      node.parentNode.replaceChild(fragment, node);
    });
  },

  renderNav(activeSection) {
    const nav = document.getElementById("admin-nav");
    let html = "";

    this.NAV_STRUCTURE.forEach(group => {
      const hasActive = group.items.some(item => item.id === activeSection);
      const isCollapsed = this.navCollapsedGroups.has(group.category) && !hasActive && !this.navSearchQuery;
      html += `
        <section class="nav-group${isCollapsed ? " is-collapsed" : ""}" data-group="${this._escape(group.category)}">
          <button type="button" class="nav-category" aria-expanded="${isCollapsed ? "false" : "true"}">
            <span class="nav-category-title">${group.category}</span>
            <span class="nav-category-count">${group.items.length}</span>
            <span class="nav-category-chevron" aria-hidden="true">⌄</span>
          </button>
          <div class="nav-group-items">`;
      group.items.forEach(item => {
        const isActive = activeSection === item.id ? " active" : "";
        html += `
          <button class="nav-btn${isActive}" data-section="${item.id}" data-label="${this._escape(item.label)}" title="${this._escape(item.label)}" style="width: 100%; text-align: right; display: flex; align-items: center; gap: 10px; border: none; background: transparent; color: white; padding: 10px 20px; cursor: pointer; transition: 0.2s;">
            <span class="nav-icon">${this.icon(item.icon, "nav-icon-svg")}</span>
            <span>${item.label}</span>
          </button>`;
      });
      html += `
          </div>
        </section>`;
    });
    html += `<div class="nav-empty" id="admin-nav-empty" hidden>لا توجد نتيجة مطابقة</div>`;

    nav.innerHTML = html;

    nav.querySelectorAll(".nav-category").forEach(btn => {
      btn.addEventListener("click", () => {
        const groupEl = btn.closest(".nav-group");
        const groupName = groupEl.dataset.group;
        const willCollapse = !groupEl.classList.contains("is-collapsed");
        groupEl.classList.toggle("is-collapsed", willCollapse);
        btn.setAttribute("aria-expanded", willCollapse ? "false" : "true");
        if (willCollapse) this.navCollapsedGroups.add(groupName);
        else this.navCollapsedGroups.delete(groupName);
        localStorage.setItem("admin-nav-collapsed", JSON.stringify([...this.navCollapsedGroups]));
      });
    });

    nav.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            this.closeMobileSidebar();
            window.location.hash = btn.dataset.section;
        });
    });

    this.applyNavFilter();
  },

  applyNavFilter() {
    const nav = document.getElementById("admin-nav");
    const searchInput = document.getElementById("admin-nav-search");
    if (!nav) return;

    const query = this.normalizeNavText(searchInput ? searchInput.value : this.navSearchQuery);
    this.navSearchQuery = searchInput ? searchInput.value : this.navSearchQuery;
    let visibleGroups = 0;

    nav.querySelectorAll(".nav-group").forEach(group => {
      const groupTitle = this.normalizeNavText(group.dataset.group || "");
      let visibleItems = 0;

      group.querySelectorAll(".nav-btn").forEach(btn => {
        const haystack = this.normalizeNavText(`${btn.dataset.label || ""} ${btn.dataset.section || ""} ${group.dataset.group || ""}`);
        const matches = !query || haystack.includes(query) || groupTitle.includes(query);
        btn.hidden = !matches;
        if (matches) visibleItems += 1;
      });

      const shouldShowGroup = visibleItems > 0;
      group.hidden = !shouldShowGroup;
      if (shouldShowGroup) visibleGroups += 1;

      const categoryBtn = group.querySelector(".nav-category");
      if (query && shouldShowGroup) {
        group.classList.remove("is-collapsed");
        if (categoryBtn) categoryBtn.setAttribute("aria-expanded", "true");
      } else if (!query) {
        const hasActive = !!group.querySelector(".nav-btn.active");
        const shouldCollapse = this.navCollapsedGroups.has(group.dataset.group) && !hasActive;
        group.classList.toggle("is-collapsed", shouldCollapse);
        if (categoryBtn) categoryBtn.setAttribute("aria-expanded", shouldCollapse ? "false" : "true");
      }
    });

    const empty = document.getElementById("admin-nav-empty");
    if (empty) empty.hidden = visibleGroups > 0;
    nav.classList.toggle("nav-is-searching", !!query);
  },

  normalizeNavText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .trim();
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

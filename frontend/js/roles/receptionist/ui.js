// js/roles/receptionist/ui.js

const ReceptionistUI = {
  SECTIONS: ["students", "parents", "search", "finance", "posts", "messages", "notifications"],

  renderHeader(userProfile) {
    const header = document.getElementById("receptionist-header");
    const name = userProfile ? userProfile.full_name : "...";
    const languages = window.I18n
      ? I18n.getLanguages()
      : [{ code: "ar", label: "Arabic", dir: "rtl" }, { code: "en", label: "English", dir: "ltr" }];
    const activeLang = window.I18n ? I18n.currentLang : "ar";
    const options = languages.map(lang => `
      <option value="${this._escapeAttr(lang.code)}" dir="${this._escapeAttr(lang.dir || "auto")}" ${lang.code === activeLang ? "selected" : ""}>
        ${this._escape(lang.label)}
      </option>
    `).join("");

    header.innerHTML = `
      <div>
        <div class="receptionist-brand">
          <div class="receptionist-brand-mark" aria-hidden="true">R</div>
          <div class="receptionist-brand-copy">
            <h1>${this.t("receptionist.brand.title", {}, "Reception Office")}</h1>
            <small>${this.t("receptionist.brand.welcome", { name: this._escape(name) }, `Welcome: ${this._escape(name)}`)}</small>
          </div>
        </div>
        <div class="receptionist-header-actions">
          <label class="receptionist-language-control">
            <span>${this.t("receptionist.language.label", {}, "Language")}</span>
            <select id="receptionist-language-select" aria-label="${this._escapeAttr(this.t("receptionist.language.select", {}, "Choose language"))}">
              ${options}
            </select>
          </label>
          <button type="button" class="receptionist-theme-toggle" id="receptionist-theme-toggle" aria-pressed="false">
            <span class="receptionist-theme-indicator" aria-hidden="true"></span>
            <span class="receptionist-theme-label">${this.t("receptionist.theme.light", {}, "Light")}</span>
          </button>
          <button id="logout-btn">${this.t("receptionist.auth.logout", {}, "Log out")}</button>
        </div>
      </div>
    `;

    document.getElementById("logout-btn")?.addEventListener("click", () => Auth.logout());
    this.initTheme();
    const languageSelect = document.getElementById("receptionist-language-select");
    if (languageSelect && window.I18n) {
      languageSelect.addEventListener("change", async (event) => {
        languageSelect.disabled = true;
        await I18n.setLanguage(event.target.value);
        languageSelect.disabled = false;
      });
    }
  },

  initTheme() {
    const stored = localStorage.getItem("receptionist-theme");
    const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    this.applyTheme(stored || document.documentElement.dataset.theme || preferred);

    const toggle = document.getElementById("receptionist-theme-toggle");
    if (!toggle || toggle.dataset.bound === "true") return;

    toggle.addEventListener("click", () => {
      const current = document.body.dataset.theme === "dark" ? "dark" : "light";
      this.applyTheme(current === "dark" ? "light" : "dark");
    });
    toggle.dataset.bound = "true";
  },

  applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    document.body.dataset.theme = nextTheme;
    localStorage.setItem("receptionist-theme", nextTheme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", nextTheme === "dark" ? "#0b1220" : "#0f766e");

    const toggle = document.getElementById("receptionist-theme-toggle");
    if (!toggle) return;

    const isDark = nextTheme === "dark";
    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    const label = toggle.querySelector(".receptionist-theme-label");
    if (label) {
      label.textContent = isDark
        ? this.t("receptionist.theme.dark", {}, "Dark")
        : this.t("receptionist.theme.light", {}, "Light");
    }
  },

  renderNav(activeSection) {
    const nav = document.getElementById("receptionist-nav");
    nav.innerHTML = this.SECTIONS.map(section => `
      <button class="nav-btn${activeSection === section ? " active" : ""}" data-section="${this._escapeAttr(section)}">
        ${this._translate(section)}
      </button>
    `).join("");
  },

  renderLoading() {
    document.getElementById("receptionist-main").innerHTML = `<h3>${this.t("receptionist.state.loading", {}, "Loading...")}</h3>`;
  },

  renderError(msg) {
    document.getElementById("receptionist-main").innerHTML = `<h3 class="error-message">${this.t("receptionist.state.errorPrefix", {}, "Error:")} ${this._escape(msg)}</h3>`;
  },

  closeStudentDetailsModal() {
    const modal = document.getElementById("student-details-modal");
    if (modal) modal.remove();
    document.body.classList.remove("modal-open");
  },

  _getNotificationId(notification) {
    const id = notification?.id ?? notification?.notification_id;
    return id === undefined || id === null || id === "" ? null : id;
  },

  _isNotificationRead(notification) {
    const value = notification?.is_read;
    return value === true || value === 1 || value === "1" || value === "true";
  },

  _translate(section) {
    return this.t(`receptionist.nav.${section}`, {}, section);
  },

  _translateRole(role) {
    const raw = String(role || "").trim();
    if (!raw) return this.t("receptionist.common.notSpecified", {}, "Not specified");
    return this.t(`receptionist.roles.${raw.toLowerCase()}`, {}, raw);
  },

  _statusLabel(status) {
    const raw = String(status || "").trim();
    if (!raw) return this.t("receptionist.common.none", {}, "-");
    return this.t(`receptionist.status.${raw.toLowerCase()}`, {}, raw);
  },

  _formatCurrency(amount) {
    const number = Number(amount);
    const safeAmount = Number.isFinite(number) ? number : 0;
    return `${safeAmount.toLocaleString(this.locale())} ${this.t("receptionist.currency.dzd", {}, "DZD")}`;
  },

  formatDateTime(value) {
    if (!value) return this.t("receptionist.common.unknownDate", {}, "Unknown date");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(this.locale());
  },

  formatDate(value, options = { year: "numeric", month: "short", day: "numeric" }) {
    if (!value) return this.t("receptionist.common.unknownDate", {}, "Unknown date");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString(this.locale(), options);
  },

  locale() {
    return window.I18n ? I18n.get("meta.locale", this.isRtl() ? "ar-DZ" : "en-US") : "ar-DZ";
  },

  dir() {
    return window.I18n ? I18n.get("meta.dir", "rtl") : "rtl";
  },

  isRtl() {
    return this.dir() === "rtl";
  },

  start() {
    return this.isRtl() ? "right" : "left";
  },

  end() {
    return this.isRtl() ? "left" : "right";
  },

  t(key, params = {}, fallback = "") {
    return window.I18n ? I18n.t(key, params, fallback || key) : (fallback || key);
  },

  _formatValue(value) {
    return value === null || value === undefined || value === ""
      ? this.t("receptionist.common.none", {}, "-")
      : value;
  },

  _escape(value) {
    return String(this._formatValue(value))
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  _escapeAttr(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

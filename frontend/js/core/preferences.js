// js/core/preferences.js

const AppPreferences = {
  languageKey: "sms-language",
  themeKey: "sms-theme",
  scopes: ["login", "admin", "receptionist", "accountant", "parent", "student", "teacher"],

  getLocal(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  },

  setLocal(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {}
  },

  normalizeTheme(theme) {
    return theme === "dark" || theme === "light" ? theme : "";
  },

  systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },

  scopedKey(scope, suffix) {
    return scope ? `${scope}-${suffix}` : "";
  },

  getLanguage(scope, fallback = "ar") {
    const globalLang = this.getLocal(this.languageKey);
    if (globalLang) return globalLang;

    const scopedLang = this.getLocal(this.scopedKey(scope, "language"));
    if (scopedLang && scopedLang !== fallback) return scopedLang;

    const legacyValues = this.scopes
      .map(item => this.getLocal(this.scopedKey(item, "language")))
      .filter(Boolean);
    return legacyValues.find(value => value !== fallback) || scopedLang || legacyValues[0] || fallback;
  },

  setLanguage(lang, scope) {
    if (!lang) return;
    this.setLocal(this.languageKey, lang);
    if (scope) this.setLocal(this.scopedKey(scope, "language"), lang);
  },

  getTheme(scope, fallback = "") {
    const globalTheme = this.normalizeTheme(this.getLocal(this.themeKey));
    if (globalTheme) return globalTheme;

    const scopedTheme = this.normalizeTheme(this.getLocal(this.scopedKey(scope, "theme")));
    if (scopedTheme) return scopedTheme;

    const legacyValues = this.scopes
      .map(item => this.normalizeTheme(this.getLocal(this.scopedKey(item, "theme"))))
      .filter(Boolean);
    return legacyValues.find(value => value === "dark") || legacyValues[0] || this.normalizeTheme(fallback) || this.systemTheme();
  },

  setTheme(theme, scope) {
    const nextTheme = this.normalizeTheme(theme) || this.systemTheme();
    this.setLocal(this.themeKey, nextTheme);
    if (scope) this.setLocal(this.scopedKey(scope, "theme"), nextTheme);
    return nextTheme;
  },

  applyTheme(theme, options = {}) {
    const nextTheme = this.normalizeTheme(theme) || this.getTheme(options.scope);
    document.documentElement.dataset.theme = nextTheme;
    const applyBodyTheme = () => {
      if (document.body) document.body.dataset.theme = nextTheme;
    };
    if (document.body) {
      applyBodyTheme();
    } else {
      document.addEventListener("DOMContentLoaded", applyBodyTheme, { once: true });
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", nextTheme === "dark" ? "#0b1220" : "#0f766e");
    if (options.persist) this.setTheme(nextTheme, options.scope);
    return nextTheme;
  },

  initTheme(scope, fallback = "") {
    return this.applyTheme(this.getTheme(scope, fallback), { scope, persist: true });
  }
};

window.AppPreferences = AppPreferences;

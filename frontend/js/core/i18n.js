// js/core/i18n.js

const I18n = {
  scope: "admin",
  currentLang: "ar",
  defaultLang: "ar",
  translations: {},
  legacyKeys: [],
  supportedLanguages: [{ code: "ar", label: "العربية", dir: "rtl" }],

  async init(options = {}) {
    this.scope = options.scope || this.scope;
    this.defaultLang = options.defaultLang || this.defaultLang;

    const query = new URLSearchParams(window.location.search);
    const urlLang = query.get(`${this.scope}_lang`) || query.get("lang");
    const stored = localStorage.getItem(`${this.scope}-language`);
    const lang = urlLang || stored || options.lang || this.defaultLang;
    await this.setLanguage(lang, { silent: true });
    this.bindDialogLocalization();
    this.apply(document);
    this.observe();
    return this;
  },

  async setLanguage(lang, options = {}) {
    const requestedLang = lang || this.defaultLang;
    let nextLang = requestedLang;

    try {
      this.translations = await this.load(nextLang);
      this.currentLang = nextLang;
    } catch (err) {
      if (nextLang !== this.defaultLang) {
        this.translations = await this.load(this.defaultLang);
        this.currentLang = this.defaultLang;
        nextLang = this.defaultLang;
      } else {
        console.warn("Unable to load localization file:", err);
        this.translations = {};
        this.currentLang = this.defaultLang;
      }
    }

    localStorage.setItem(`${this.scope}-language`, this.currentLang);
    this.supportedLanguages = this.translations.languages || this.supportedLanguages;
    this.legacyKeys = Object.keys(this.translations.legacyText || {})
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    this.applyDocumentLocale();
    this.apply(document);

    if (!options.silent) {
      window.dispatchEvent(new CustomEvent("i18n:change", {
        detail: { scope: this.scope, lang: this.currentLang, requestedLang }
      }));
    }

    return this.currentLang;
  },

  async load(lang) {
    const urls = [
      new URL(`../locales/${lang}/${this.scope}.json`, window.location.href),
      new URL(`../locales/${this.scope}/${lang}.json`, window.location.href)
    ];

    for (const url of urls) {
      const response = await fetch(url, { cache: "no-cache" });
      if (response.ok) return response.json();
    }

    throw new Error(`Missing locale: ${lang}`);
  },

  get(path, fallback = undefined) {
    if (!path) return fallback;
    const value = String(path).split(".").reduce((acc, part) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, part)) return acc[part];
      return undefined;
    }, this.translations);
    return value === undefined || value === null ? fallback : value;
  },

  t(path, params = {}, fallback = "") {
    const raw = this.get(path, fallback || path);
    return this.interpolate(String(raw), params);
  },

  text(value, params = {}) {
    const source = String(value ?? "");
    const trimmed = source.replace(/\s+/g, " ").trim();
    const translated = this.translateLegacy(trimmed);
    const result = this.interpolate(String(translated), params);
    return source.match(/^\s/) || source.match(/\s$/)
      ? source.replace(trimmed, result)
      : result;
  },

  translateLegacy(value) {
    const source = String(value ?? "");
    const legacy = this.translations.legacyText || {};
    if (!source || !this.legacyKeys.length) return source;
    if (Object.prototype.hasOwnProperty.call(legacy, source)) {
      return legacy[source];
    }
    if (this.currentLang !== this.defaultLang && !/[\u0600-\u06FF]/.test(source)) {
      return source;
    }

    return this.legacyKeys
      .filter(key => source.includes(key))
      .reduce((text, key) => text.split(key).join(legacy[key]), source);
  },

  interpolate(value, params = {}) {
    return String(value).replace(/\{(\w+)\}/g, (_, key) => (
      params[key] === undefined || params[key] === null ? "" : String(params[key])
    ));
  },

  applyDocumentLocale() {
    const meta = this.translations.meta || {};
    document.documentElement.lang = meta.lang || this.currentLang;
    document.documentElement.dir = meta.dir || "rtl";
    document.body?.setAttribute("dir", meta.dir || "rtl");
    document.title = this.t("admin.documentTitle", {}, document.title);
  },

  apply(root = document) {
    if (!root) return;
    const scopeRoot = root.nodeType === Node.ELEMENT_NODE || root.nodeType === Node.DOCUMENT_NODE ? root : document;

    this.findAll(scopeRoot, "[data-i18n]").forEach(el => {
      el.textContent = this.t(el.dataset.i18n, {}, el.textContent);
    });

    this.findAll(scopeRoot, "[data-i18n-html]").forEach(el => {
      el.innerHTML = this.t(el.dataset.i18nHtml, {}, el.innerHTML);
    });

    this.applyAttribute(scopeRoot, "placeholder", "data-i18n-placeholder");
    this.applyAttribute(scopeRoot, "title", "data-i18n-title");
    this.applyAttribute(scopeRoot, "aria-label", "data-i18n-aria-label");
    this.applyLegacyAttributes(scopeRoot);
    this.applyLegacyOptions(scopeRoot);
    this.applyLegacyText(scopeRoot);
  },

  applyAttribute(root, attr, keyAttr) {
    this.findAll(root, `[${keyAttr}]`).forEach(el => {
      el.setAttribute(attr, this.t(el.getAttribute(keyAttr), {}, el.getAttribute(attr) || ""));
    });
  },

  applyLegacyAttributes(root) {
    ["placeholder", "title", "aria-label", "value"].forEach(attr => {
      this.findAll(root, `[${attr}]`).forEach(el => {
        if (attr === "value" && !["button", "submit", "reset"].includes((el.type || "").toLowerCase())) return;
        const source = el.getAttribute(attr);
        if (!source) return;
        const translated = this.text(source);
        if (translated !== source) el.setAttribute(attr, translated);
      });
    });
  },

  applyLegacyOptions(root) {
    this.findAll(root, "option").forEach(option => {
      const source = option.textContent || "";
      const translated = this.text(source);
      if (translated !== source) option.textContent = translated;
    });
  },

  findAll(root, selector) {
    const matches = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches?.(selector)) {
      matches.push(root);
    }
    root.querySelectorAll?.(selector).forEach(el => matches.push(el));
    return matches;
  },

  applyLegacyText(root) {
    const legacy = this.translations.legacyText || {};
    if (!Object.keys(legacy).length) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("script, style, textarea, input, select, code, pre, svg")) {
          return NodeFilter.FILTER_REJECT;
        }
        const trimmed = (node.nodeValue || "").replace(/\s+/g, " ").trim();
        return trimmed && this.translateLegacy(trimmed) !== trimmed ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      node.nodeValue = this.text(node.nodeValue);
    });
  },

  observe() {
    if (!document.body || document.body.dataset.i18nObserverBound === "true") return;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) this.apply(node);
          if (node.nodeType === Node.TEXT_NODE) this.applyTextNode(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.body.dataset.i18nObserverBound = "true";
  },

  applyTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style, textarea, input, select, code, pre, svg")) return;
    const translated = this.text(node.nodeValue || "");
    if (translated !== node.nodeValue) node.nodeValue = translated;
  },

  bindDialogLocalization() {
    if (window.__i18nDialogsBound) return;
    const nativeAlert = window.alert?.bind(window);
    const nativeConfirm = window.confirm?.bind(window);

    if (nativeAlert) {
      window.alert = (message) => nativeAlert(this.text(message));
    }
    if (nativeConfirm) {
      window.confirm = (message) => nativeConfirm(this.text(message));
    }

    window.__i18nDialogsBound = "true";
  },

  getLanguages() {
    return this.supportedLanguages;
  }
};

window.I18n = I18n;

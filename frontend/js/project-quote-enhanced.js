(function () {
  "use strict";

  const BASE_PRICE = 300000;
  const STORAGE_KEY = "genius-sms-project-quote";

  const baseFeatures = [
    { id: "scope", name: "تحليل وتجهيز نطاق العمل", description: "تثبيت الأولويات، ضبط الأدوار، وتجهيز الهيكل العام للنظام.", icon: "◎", tone: "feature-slate", price: 20000, bullets: ["تحليل احتياج المؤسسة", "ترتيب الأولويات", "تجهيز النطاق القابل للتنفيذ"] },
    { id: "dashboards", name: "الواجهة ولوحات الأدوار", description: "تجربة الدخول واللوحات الخاصة بالمدير والاستقبال والمحاسبة والأستاذ والطالب والولي.", icon: "⌂", tone: "feature-teal", price: 45000, bullets: ["ستة أدوار حالية", "لوحات حسب الصلاحية", "تصميم متجاوب"] },
    { id: "branches", name: "الفروع والطبقات الإدارية", description: "بنية تسمح بوجود مدير عام، مدراء فروع، ومستخدمين بنطاق واضح.", icon: "⌘", tone: "feature-blue", price: 45000, bullets: ["فروع متعددة", "تدرج إداري", "نطاق رؤية حسب الفرع"] },
    { id: "academic", name: "الإدارة الأكاديمية", description: "المستخدمون، الطلاب، الأولياء، الأساتذة، الأقسام، البرامج، التسجيلات والتعيينات.", icon: "▦", tone: "feature-violet", price: 45000, bullets: ["الطلاب والأولياء", "الأقسام والبرامج", "التسجيلات والتعيينات"] },
    { id: "tracking", name: "المتابعة التعليمية", description: "الحضور، الجداول، الواجبات، التقييمات، الدرجات، والموارد التعليمية.", icon: "◷", tone: "feature-amber", price: 40000, bullets: ["الحضور والغياب", "الجداول والتقييمات", "الدرجات والموارد"] },
    { id: "finance", name: "المالية والمداخيل", description: "رسوم الطلاب، الدفعات، الأرصدة، والحركات المالية المرتبطة بالطلاب.", icon: "▤", tone: "feature-amber", price: 35000, bullets: ["رسوم الطلاب", "الدفعات والأرصدة", "المعاملات المالية"] },
    { id: "communication", name: "التواصل والإشعارات", description: "قنوات داخلية لتقريب الإدارة من الطاقم التربوي والطلاب والأولياء.", icon: "✉", tone: "feature-rose", price: 25000, bullets: ["المحادثات والرسائل", "الإشعارات", "المنشورات والإعلانات"] },
    { id: "backend", name: "الواجهة الخلفية والبيانات", description: "FastAPI، نقاط REST، MySQL/SQLAlchemy، الربط، التحقق، والصلاحيات الأساسية.", icon: "◈", tone: "feature-slate", price: 30000, bullets: ["FastAPI REST API", "MySQL / SQLAlchemy", "التحقق والصلاحيات"] },
    { id: "delivery", name: "التعريب والاستجابة والتسليم", description: "RTL عربي، English، التوافق مع الهاتف، التحقق الأساسي، وشرح التشغيل.", icon: "✓", tone: "feature-teal", price: 15000, bullets: ["عربية / إنجليزية", "ثيم فاتح / داكن", "تسليم وشرح مختصر"] },
  ];

  const defaultAddons = [
    { id: "mobile-app", name: "تطبيق هاتف للطلاب والأولياء", note: "Android / iOS كتطبيق مستقل", price: 150000, selected: false },
    { id: "messaging", name: "SMS والبريد الإلكتروني", note: "تنبيهات خارجية مرتبطة بالنظام", price: 40000, selected: false },
    { id: "online-payment", name: "الدفع الإلكتروني", note: "ربط بوابة دفع حسب المزود المعتمد", price: 80000, selected: false },
    { id: "custom-reports", name: "تقارير مخصصة وهوية بصرية", note: "نماذج وتقارير إضافية حسب احتياج المؤسسة", price: 35000, selected: false },
    { id: "data-migration", name: "ترحيل البيانات القديمة", note: "استيراد وتنظيف بيانات من ملفات أو نظام سابق", price: 50000, selected: false },
  ];

  const branchPrices = { hierarchical: 0, single: 0, advanced: 45000 };
  const permissionPrices = { fixed: 0, hybrid: 35000, custom: 65000 };
  const $ = (selector) => document.querySelector(selector);
  const money = (value) => `${Number(value || 0).toLocaleString("fr-DZ")} دج`;
  const cloneFeatures = () => baseFeatures.map((feature) => ({ ...feature, bullets: [...feature.bullets], active: true, custom: false }));
  const cloneAddons = () => defaultAddons.map((addon) => ({ ...addon }));

  let state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {};
      return {
        clientName: saved.clientName || "",
        clientContact: saved.clientContact || "",
        deliveryDuration: saved.deliveryDuration || "حسب خطة الاعتماد والتجهيز",
        features: Array.isArray(saved.features) ? saved.features : cloneFeatures(),
        addons: Array.isArray(saved.addons) ? saved.addons : cloneAddons(),
        branchModel: branchPrices[saved.branchModel] !== undefined ? saved.branchModel : "hierarchical",
        permissionModel: permissionPrices[saved.permissionModel] !== undefined ? saved.permissionModel : "fixed",
        roles: Array.isArray(saved.roles) ? saved.roles : [],
      };
    } catch (error) {
      return { clientName: "", clientContact: "", deliveryDuration: "حسب خطة الاعتماد والتجهيز", features: cloneFeatures(), addons: cloneAddons(), branchModel: "hierarchical", permissionModel: "fixed", roles: [] };
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* The page still works if storage is unavailable. */ }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }

  function renderFeatures() {
    const grid = $("#base-feature-grid");
    const features = state.features;
    if (!features.length) {
      grid.innerHTML = '<div class="feature-empty">لا توجد ميزات في النطاق الحالي. أضف ميزة جديدة أو استعد الحزمة الأساسية.</div>';
    } else {
      grid.innerHTML = features.map((feature, index) => `
        <article class="feature-card ${escapeHtml(feature.tone || "feature-teal")} ${feature.active !== false ? "" : "is-disabled"}" data-feature-id="${escapeHtml(feature.id)}">
          <span class="feature-number">${String(index + 1).padStart(2, "0")}</span><span class="feature-icon">${escapeHtml(feature.icon || "✦")}</span>
          <h3>${escapeHtml(feature.name)}</h3>
          <p>${escapeHtml(feature.description)}</p>
          <ul>${(feature.bullets || []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
          ${feature.custom ? '<span class="feature-custom-label">ميزة أضافها العميل</span>' : ""}
          <div class="feature-editor-bar">
            <input class="feature-toggle" type="checkbox" data-feature-action="toggle" aria-label="تفعيل ${escapeHtml(feature.name)}" ${feature.active !== false ? "checked" : ""}>
            <span class="feature-editor-label">${feature.active !== false ? "مفعلة" : "غير مفعلة"}</span>
            <input class="feature-price-input" type="number" min="0" step="1000" data-feature-action="price" value="${Number(feature.price) || 0}" aria-label="سعر ${escapeHtml(feature.name)}">
            <button class="feature-remove" type="button" data-feature-action="remove" aria-label="حذف ${escapeHtml(feature.name)}">حذف</button>
          </div>
        </article>
      `).join("");
    }
    $("#feature-count").textContent = `${features.filter((feature) => feature.active !== false).length} من ${features.length} ميزات مفعلة`;
    renderPricing();
  }

  function renderPricing() {
    const body = $("#pricing-body");
    const activeFeatures = state.features.filter((feature) => feature.active !== false);
    if (!activeFeatures.length) {
      body.innerHTML = '<tr><td colspan="4"><div class="pricing-empty">لا توجد ميزات مفعلة في جدول السعر.</div></td></tr>';
      return;
    }
    body.innerHTML = activeFeatures.map((feature, index) => `
      <tr class="${feature.custom ? "custom-row" : ""}">
        <td>${String(index + 1).padStart(2, "0")}</td>
        <td><strong>${escapeHtml(feature.name)}</strong></td>
        <td>${escapeHtml(feature.description)}</td>
        <td>${money(feature.price)}</td>
      </tr>
    `).join("");
  }

  function selectedAddonTotal() {
    return state.addons.reduce((sum, addon) => sum + (addon.selected ? Number(addon.price) || 0 : 0), 0);
  }

  function activeFeatureTotal() {
    return state.features.reduce((sum, feature) => sum + (feature.active !== false ? Number(feature.price) || 0 : 0), 0);
  }

  function roleTotal() {
    return state.permissionModel === "fixed" ? 0 : state.roles.reduce((sum, role) => sum + (Number(role.price) || 0), 0);
  }

  function currentTotals() {
    const base = activeFeatureTotal();
    const branch = branchPrices[state.branchModel] || 0;
    const permission = permissionPrices[state.permissionModel] || 0;
    const roles = roleTotal();
    const addons = selectedAddonTotal();
    return { base, branch, permission, roles, addons, configuration: branch + permission, extras: roles + addons, total: base + branch + permission + roles + addons };
  }

  function updateTotals() {
    const totals = currentTotals();
    const total = totals.total;
    $("#base-table-total").textContent = money(totals.base);
    $("#base-scope-total").textContent = money(totals.base);
    $("#branch-model-price").textContent = money(totals.branch);
    $("#permission-model-price").textContent = money(totals.permission);
    $("#configuration-total").textContent = money(totals.configuration);
    $("#addons-total").textContent = money(totals.extras);
    $("#grand-total").innerHTML = `${total.toLocaleString("fr-DZ")} <small>دج</small>`;
    $("#hero-price").innerHTML = `${total.toLocaleString("fr-DZ")} <small>دج</small>`;
    $("#hero-price-caption").textContent = total === BASE_PRICE ? "قيمة الحزمة الأساسية الكاملة" : "قيمة النطاق المختار مع الإضافات";
    $("#price-callout-title").textContent = total === BASE_PRICE ? "السعر الأساسي الكامل: 300,000 دج" : `قيمة النطاق الحالي: ${money(total)}`;
    $("#price-callout-text").textContent = `${state.features.filter((feature) => feature.active !== false).length} ميزات مفعلة، مع نموذج الفروع والصلاحيات والإضافات التي اخترتها.`;
    $("#payment-initial").textContent = money(Math.round(total * 0.4));
    $("#payment-functional").textContent = money(Math.round(total * 0.4));
    $("#payment-final").textContent = money(total - Math.round(total * 0.4) - Math.round(total * 0.4));
    $("#footer-total").textContent = `GNS-2026-001 · ${total.toLocaleString("fr-DZ")} DZD`;
  }

  function updateOptionStates() {
    document.querySelectorAll(".config-option").forEach((option) => {
      const radio = option.querySelector("input");
      option.classList.toggle("is-active", Boolean(radio && radio.checked));
    });
    const disabled = state.permissionModel === "fixed";
    const builder = $("#role-builder");
    const badge = $("#role-mode-badge");
    builder.classList.toggle("is-disabled", disabled);
    badge.classList.toggle("is-ready", !disabled);
    badge.textContent = disabled ? "اختر نموذجاً قابلاً للتخصيص لتفعيل الأدوار" : `نموذج ${state.permissionModel === "custom" ? "مبرمج بالكامل" : "هجين"} مفعل`;
    builder.querySelectorAll("input, select, button").forEach((control) => { control.disabled = disabled; });
  }

  function renderRoles() {
    const list = $("#role-list");
    if (state.permissionModel === "fixed") {
      list.innerHTML = '<div class="role-empty">النموذج الثابت يعتمد الأدوار الجاهزة في النظام. اختر النموذج الهجين أو المبرمج بالكامل لتعريف أدوار جديدة.</div>';
      updateOptionStates();
      return;
    }
    if (!state.roles.length) {
      list.innerHTML = '<div class="role-empty">لم تتم إضافة أدوار مخصصة بعد. استخدم النموذج أدناه لإنشاء أول دور.</div>';
    } else {
      list.innerHTML = state.roles.map((role) => `
        <div class="role-row" data-role-id="${escapeHtml(role.id)}">
          <label class="role-field"><span>اسم الدور</span><input class="role-text-input" data-role-action="name" type="text" value="${escapeHtml(role.name)}"></label>
          <label class="role-field"><span>النطاق</span><select class="role-scope-select" data-role-action="scope">${["كل الفروع", "فرع محدد", "فرع + وحدات محددة"].map((scope) => `<option ${scope === role.scope ? "selected" : ""}>${scope}</option>`).join("")}</select></label>
          <label class="role-field"><span>الصلاحيات</span><input class="role-permissions-input" data-role-action="permissions" type="text" value="${escapeHtml(role.permissions)}"></label>
          <label class="role-field"><span>السعر</span><input class="role-price-input" data-role-action="price" type="number" min="0" step="1000" value="${Number(role.price) || 0}"></label>
          <button class="role-remove" type="button" data-role-action="remove" aria-label="حذف الدور">حذف</button>
        </div>
      `).join("");
    }
    updateOptionStates();
  }

  function renderAddons() {
    const list = $("#addon-list");
    list.innerHTML = state.addons.map((addon) => `
      <div class="addon-row${addon.selected ? " is-selected" : ""}" data-addon-id="${escapeHtml(addon.id)}">
        <input type="checkbox" class="addon-toggle" aria-label="تفعيل ${escapeHtml(addon.name)}" ${addon.selected ? "checked" : ""}>
        <div class="addon-name">${escapeHtml(addon.name)}<small>${escapeHtml(addon.note || "إضافة مستقبلية")}</small></div>
        <input class="addon-price" type="number" min="0" step="1000" value="${Number(addon.price) || 0}" aria-label="سعر ${escapeHtml(addon.name)}">
        <button class="addon-remove" type="button" aria-label="حذف ${escapeHtml(addon.name)}">حذف</button>
      </div>
    `).join("");
  }

  function setIssueDate() {
    $("#issue-date").textContent = new Intl.DateTimeFormat("ar-DZ", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());
  }

  function bindClientFields() {
    const fields = { "#client-name": "clientName", "#client-contact": "clientContact", "#delivery-duration": "deliveryDuration" };
    Object.entries(fields).forEach(([selector, key]) => {
      const input = $(selector);
      input.value = state[key];
      input.addEventListener("input", () => { state[key] = input.value; saveState(); });
    });
  }

  function bindEvents() {
    $("#print-quote").addEventListener("click", () => window.print());
    $("#reset-quote").addEventListener("click", () => {
      state = { clientName: "", clientContact: "", deliveryDuration: "حسب خطة الاعتماد والتجهيز", features: cloneFeatures(), addons: cloneAddons(), branchModel: "hierarchical", permissionModel: "fixed", roles: [] };
      saveState();
      bindClientFields();
      renderAll();
    });
    $("#restore-features").addEventListener("click", () => { state.features = cloneFeatures(); saveState(); renderAll(); });

    $("#base-feature-grid").addEventListener("change", (event) => {
      const row = event.target.closest("[data-feature-id]");
      if (!row) return;
      const feature = state.features.find((item) => item.id === row.dataset.featureId);
      if (!feature) return;
      if (event.target.dataset.featureAction === "toggle") feature.active = event.target.checked;
      if (event.target.dataset.featureAction === "price") feature.price = Math.max(0, Number(event.target.value) || 0);
      saveState();
      renderAll();
    });
    $("#base-feature-grid").addEventListener("input", (event) => {
      if (event.target.dataset.featureAction !== "price") return;
      const row = event.target.closest("[data-feature-id]");
      const feature = state.features.find((item) => item.id === row?.dataset.featureId);
      if (!feature) return;
      feature.price = Math.max(0, Number(event.target.value) || 0);
      saveState();
      renderPricing();
      updateTotals();
    });
    $("#base-feature-grid").addEventListener("click", (event) => {
      if (event.target.dataset.featureAction !== "remove") return;
      const row = event.target.closest("[data-feature-id]");
      state.features = state.features.filter((feature) => feature.id !== row.dataset.featureId);
      saveState();
      renderAll();
    });

    $("#add-feature-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#new-feature-name").value.trim();
      const description = $("#new-feature-description").value.trim();
      if (!name || !description) return;
      state.features.push({ id: `custom-feature-${Date.now()}`, name, description, icon: "✦", tone: "feature-teal", price: Math.max(0, Number($("#new-feature-price").value) || 0), bullets: [description], active: true, custom: true });
      saveState();
      event.target.reset();
      renderAll();
    });

    $("#branch-options").addEventListener("change", (event) => { if (event.target.name === "branch-model") { state.branchModel = event.target.value; saveState(); renderAll(); } });
    $("#permission-options").addEventListener("change", (event) => { if (event.target.name === "permission-model") { state.permissionModel = event.target.value; saveState(); renderAll(); } });

    $("#role-list").addEventListener("input", (event) => {
      const row = event.target.closest("[data-role-id]");
      if (!row) return;
      const role = state.roles.find((item) => item.id === row.dataset.roleId);
      if (!role) return;
      const action = event.target.dataset.roleAction;
      if (action === "name" || action === "permissions") role[action] = event.target.value;
      if (action === "price") role.price = Math.max(0, Number(event.target.value) || 0);
      saveState();
      updateTotals();
    });
    $("#role-list").addEventListener("change", (event) => {
      const row = event.target.closest("[data-role-id]");
      const role = state.roles.find((item) => item.id === row?.dataset.roleId);
      if (role && event.target.dataset.roleAction === "scope") { role.scope = event.target.value; saveState(); }
    });
    $("#role-list").addEventListener("click", (event) => {
      if (event.target.dataset.roleAction !== "remove") return;
      const row = event.target.closest("[data-role-id]");
      state.roles = state.roles.filter((role) => role.id !== row.dataset.roleId);
      saveState();
      renderAll();
    });
    $("#add-role-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#new-role-name").value.trim();
      const permissions = $("#new-role-permissions").value.trim();
      if (!name || !permissions) return;
      state.roles.push({ id: `custom-role-${Date.now()}`, name, scope: $("#new-role-scope").value, permissions, price: Math.max(0, Number($("#new-role-price").value) || 0) });
      saveState();
      event.target.reset();
      renderAll();
    });

    $("#addon-list").addEventListener("change", (event) => {
      const row = event.target.closest("[data-addon-id]");
      const addon = state.addons.find((item) => item.id === row?.dataset.addonId);
      if (!addon) return;
      if (event.target.classList.contains("addon-toggle")) addon.selected = event.target.checked;
      if (event.target.classList.contains("addon-price")) addon.price = Math.max(0, Number(event.target.value) || 0);
      saveState();
      renderAddons();
      updateTotals();
    });
    $("#addon-list").addEventListener("input", (event) => {
      if (!event.target.classList.contains("addon-price")) return;
      const row = event.target.closest("[data-addon-id]");
      const addon = state.addons.find((item) => item.id === row?.dataset.addonId);
      if (!addon) return;
      addon.price = Math.max(0, Number(event.target.value) || 0);
      saveState();
      updateTotals();
    });
    $("#addon-list").addEventListener("click", (event) => {
      if (!event.target.classList.contains("addon-remove")) return;
      const row = event.target.closest("[data-addon-id]");
      state.addons = state.addons.filter((addon) => addon.id !== row.dataset.addonId);
      saveState();
      renderAddons();
      updateTotals();
    });
    $("#add-addon-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#new-addon-name").value.trim();
      if (!name) return;
      state.addons.push({ id: `custom-addon-${Date.now()}`, name, note: "إضافة أضافها العميل", price: Math.max(0, Number($("#new-addon-price").value) || 0), selected: true });
      saveState();
      event.target.reset();
      renderAddons();
      updateTotals();
    });
  }

  function renderAll() {
    renderFeatures();
    renderRoles();
    renderAddons();
    updateOptionStates();
    updateTotals();
  }

  setIssueDate();
  bindClientFields();
  bindEvents();
  renderAll();
})();

(function () {
  "use strict";

  const BASE_PRICE = 300000;
  const STORAGE_KEY = "genius-sms-project-quote";
  const defaultAddons = [
    { id: "mobile-app", name: "تطبيق هاتف للطلاب والأولياء", note: "Android / iOS كتطبيق مستقل", price: 150000, selected: false },
    { id: "messaging", name: "SMS والبريد الإلكتروني", note: "تنبيهات خارجية مرتبطة بالنظام", price: 40000, selected: false },
    { id: "online-payment", name: "الدفع الإلكتروني", note: "ربط بوابة دفع حسب المزود المعتمد", price: 80000, selected: false },
    { id: "custom-reports", name: "تقارير مخصصة وهوية بصرية", note: "نماذج وتقارير إضافية حسب احتياج المؤسسة", price: 35000, selected: false },
    { id: "data-migration", name: "ترحيل البيانات القديمة", note: "استيراد وتنظيف بيانات من ملفات أو نظام سابق", price: 50000, selected: false },
  ];

  const $ = (selector) => document.querySelector(selector);
  const money = (value) => `${Number(value || 0).toLocaleString("fr-DZ")} دج`;

  let state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return {
        clientName: saved?.clientName || "",
        clientContact: saved?.clientContact || "",
        deliveryDuration: saved?.deliveryDuration || "حسب خطة الاعتماد والتجهيز",
        addons: Array.isArray(saved?.addons) ? saved.addons : defaultAddons.map((item) => ({ ...item })),
      };
    } catch (error) {
      return { clientName: "", clientContact: "", deliveryDuration: "حسب خطة الاعتماد والتجهيز", addons: defaultAddons.map((item) => ({ ...item })) };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    updateTotals();
  }

  function updateTotals() {
    const extras = state.addons.reduce((sum, addon) => sum + (addon.selected ? Number(addon.price) || 0 : 0), 0);
    $("#addons-total").textContent = money(extras);
    $("#grand-total").innerHTML = `${(BASE_PRICE + extras).toLocaleString("fr-DZ")} <small>دج</small>`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }

  function setIssueDate() {
    const date = new Intl.DateTimeFormat("ar-DZ", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());
    $("#issue-date").textContent = date;
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
      state = { clientName: "", clientContact: "", deliveryDuration: "حسب خطة الاعتماد والتجهيز", addons: defaultAddons.map((item) => ({ ...item })) };
      saveState();
      bindClientFields();
      renderAddons();
    });

    $("#addon-list").addEventListener("change", (event) => {
      const row = event.target.closest("[data-addon-id]");
      if (!row) return;
      const addon = state.addons.find((item) => item.id === row.dataset.addonId);
      if (!addon) return;
      if (event.target.classList.contains("addon-toggle")) addon.selected = event.target.checked;
      if (event.target.classList.contains("addon-price")) addon.price = Math.max(0, Number(event.target.value) || 0);
      saveState();
      renderAddons();
    });

    $("#addon-list").addEventListener("click", (event) => {
      const removeButton = event.target.closest(".addon-remove");
      const row = event.target.closest("[data-addon-id]");
      if (!removeButton || !row) return;
      state.addons = state.addons.filter((item) => item.id !== row.dataset.addonId);
      saveState();
      renderAddons();
    });

    $("#add-addon-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#new-addon-name").value.trim();
      const price = Math.max(0, Number($("#new-addon-price").value) || 0);
      if (!name) return;
      state.addons.push({ id: `custom-${Date.now()}`, name, note: "بند أضافه العميل", price, selected: true });
      saveState();
      event.target.reset();
      renderAddons();
    });
  }

  setIssueDate();
  bindClientFields();
  renderAddons();
  bindEvents();
})();

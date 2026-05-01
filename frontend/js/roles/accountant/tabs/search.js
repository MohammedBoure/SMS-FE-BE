// js/roles/accountant/tabs/search.js

AccountantUI.renderSearch = function(response) {
  const main = document.getElementById("accountant-main");
  main.style.padding = "20px 5%";

  const users = response?.data || response || [];
  const page = response?.page || 1;
  const total = response?.total || users.length;
  const limit = response?.limit || 50;
  const align = this.start();
  const end = this.end();

  const rows = users.map(u => {
    const roleName = String(u.role_name || "").toLowerCase();
    const isStudent = roleName === "student";
    return `
      <tr class="user-search-row" data-role="${this._escapeAttr(u.role_name)}" style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px;">${this._escape(u.id)}</td>
        <td style="padding: 12px;"><strong>${this._escape(u.full_name)}</strong><br><small style="color:#64748b;">${this._escape(u.username)}</small></td>
        <td style="padding: 12px;">${this._translateStatus(u.role_name)}</td>
        <td style="padding: 12px; direction: ltr; text-align: ${align};">${this._escape(u.phone || this.t("accountant.common.none", {}, "-"))}</td>
        <td style="padding: 12px; display: flex; gap: 5px; justify-content: flex-end; flex-wrap: wrap;">
          <button class="search-notify-btn" data-id="${this._escapeAttr(u.id)}" data-name="${this._escapeAttr(u.full_name)}" style="background: #eab308; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-family: inherit;">${this.t("accountant.search.notify", {}, "Notify")}</button>
          ${isStudent ? `<button class="search-finance-btn" data-user-id="${this._escapeAttr(u.id)}" data-name="${this._escapeAttr(u.full_name)}" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-family: inherit;">${this.t("accountant.search.finance", {}, "Finance")}</button>` : ""}
        </td>
      </tr>
    `;
  }).join("");

  main.innerHTML = `
    <h2 style="color: #064e3b; margin-bottom: 20px;">${this.t("accountant.search.title", {}, "User Directory and Quick Actions")}</h2>

    <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
      <input type="text" id="adv-search-keyword" placeholder="${this._escapeAttr(this.t("accountant.search.placeholder", {}, "Type to search the database..."))}" style="flex: 1; min-width: 220px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; font-size: 1rem; font-family: inherit;" />
      <button id="adv-search-btn" style="background: #064e3b; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: inherit;">${this.t("accountant.search.serverSearch", {}, "Search server")}</button>
    </div>

    <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse; text-align: ${align};">
        <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
          <tr>
            <th style="padding: 12px;">${this.t("accountant.search.columns.id", {}, "ID")}</th>
            <th style="padding: 12px;">${this.t("accountant.search.columns.account", {}, "Name / account")}</th>
            <th style="padding: 12px;">${this.t("accountant.search.columns.type", {}, "Type")}</th>
            <th style="padding: 12px;">${this.t("accountant.search.columns.phone", {}, "Phone")}</th>
            <th style="padding: 12px; text-align: ${end};">${this.t("accountant.search.columns.actions", {}, "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="5" style="text-align:center; padding: 20px;">${this.t("accountant.search.noUsers", {}, "No users found.")}</td></tr>`}
        </tbody>
      </table>
    </div>
    ${this.renderPagination(page, total, limit, "search")}
  `;
};

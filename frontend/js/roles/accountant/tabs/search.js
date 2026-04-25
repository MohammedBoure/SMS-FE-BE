// js/roles/accountant/tabs/search.js

AccountantUI.renderSearch = function(response) {
  const main = document.getElementById("accountant-main");
  main.style.padding = "20px 5%";

  const users = response.data || response || [];
  const page = response.page || 1;
  const total = response.total || users.length;
  const limit = response.limit || 50;

  const rows = users.map(u => {
    const isStudent = (u.role_name === 'student' || u.role_name === 'طالب');
    return `
    <tr class="user-search-row" data-role="${this._escape(u.role_name)}" style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px;">${this._escape(u.id)}</td>
      <td style="padding: 12px;"><strong>${this._escape(u.full_name)}</strong><br><small style="color:#64748b;">${this._escape(u.username)}</small></td>
      <td style="padding: 12px;">${this._translateStatus(u.role_name)}</td>
      <td style="padding: 12px; direction: ltr; text-align: right;">${this._escape(u.phone || "-")}</td>
      <td style="padding: 12px; display: flex; gap: 5px; justify-content: flex-end;">
        <button class="search-notify-btn" data-id="${u.id}" data-name="${this._escapeAttr(u.full_name)}" style="background: #eab308; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">إشعار 🔔</button>
        ${isStudent ? `<button class="search-finance-btn" data-user-id="${u.id}" data-name="${this._escapeAttr(u.full_name)}" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">المالية 💰</button>` : ''}
      </td>
    </tr>
  `}).join("");

  main.innerHTML = `
    <h2 style="color: #064e3b; margin-bottom: 20px;">دليل المستخدمين والعمليات السريعة</h2>
    
    <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
      <input type="text" id="adv-search-keyword" placeholder="اكتب للبحث في قاعدة البيانات..." style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; font-size: 1rem;" />
      <button id="adv-search-btn" style="background: #064e3b; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">بحث في السيرفر</button>
    </div>

    <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse; text-align: right;">
        <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
          <tr>
            <th style="padding: 12px;">المعرف</th>
            <th style="padding: 12px;">الاسم / الحساب</th>
            <th style="padding: 12px;">النوع</th>
            <th style="padding: 12px;">الهاتف</th>
            <th style="padding: 12px; text-align: left;">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="5" style="text-align:center; padding: 20px;">لا يوجد مستخدمين.</td></tr>'}
        </tbody>
      </table>
    </div>
    ${this.renderPagination(page, total, limit, "search")}
  `;
};
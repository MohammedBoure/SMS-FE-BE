// js/roles/accountant/ui.js

const AccountantUI = {
  SECTIONS: ["students", "fees", "payments", "transactions", "search", "attendance"],

  renderHeader(session) {
    const header = document.getElementById("accountant-header");
    header.innerHTML = `
      <div style="background: linear-gradient(135deg, #064e3b 0%, #10b981 100%); color: white; padding: 1rem 5%; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <h1 style="margin: 0; font-size: 1.4rem;">مكتب المحاسبة والمالية</h1>
        <button id="logout-btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); padding: 5px 15px; border-radius: 20px; cursor: pointer;">تسجيل خروج</button>
      </div>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  },

  renderNav(activeSection) {
    const nav = document.getElementById("accountant-nav");
    nav.style.cssText = "background: white; padding: 10px 5%; display: flex; gap: 10px; border-bottom: 1px solid #e2e8f0; overflow-x: auto;";
    
    nav.innerHTML = this.SECTIONS.map(s => {
      const isActive = activeSection === s;
      return `<button class="nav-btn" data-section="${s}" style="background: ${isActive ? '#dcfce7' : 'transparent'}; color: ${isActive ? '#166534' : '#64748b'}; border: 1px solid ${isActive ? '#22c55e' : 'transparent'}; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s;">${this._translate(s)}</button>`;
    }).join("");
  },

  renderLoading() {
    document.getElementById("accountant-main").innerHTML = "<h3 style='padding: 20px 5%; color: #10b981;'>جاري تحميل البيانات المالية...</h3>";
  },

  renderError(msg) {
    document.getElementById("accountant-main").innerHTML = `<h3 style="padding: 20px 5%; color: #ef4444;">خطأ: ${this._escape(msg)}</h3>`;
  },

  // === نافذة إرسال الإشعارات والإنذارات ===
  showNotificationModal(userId, userName, contextMessage = "") {
    const existing = document.getElementById("notification-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "notification-modal";
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 2000; backdrop-filter: blur(4px); direction: rtl;";

    overlay.innerHTML = `
      <div style="background: white; width: 90%; max-width: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <div style="background: #eab308; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">إرسال إشعار إلى: ${this._escape(userName)}</h3>
          <button id="close-notif-modal" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <form id="send-notification-form" data-user-id="${this._escapeAttr(userId)}" style="padding: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #475569;">عنوان الإشعار:</label>
          <input type="text" id="notif-title" required value="إشعار من الإدارة المالية" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 15px; box-sizing: border-box;" />
          
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #475569;">نص الرسالة:</label>
          <textarea id="notif-message" required rows="4" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 20px; box-sizing: border-box; font-family: inherit;">${this._escape(contextMessage)}</textarea>
          
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" id="cancel-notif" style="padding: 10px 15px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">إلغاء</button>
            <button type="submit" style="padding: 10px 20px; background: #eab308; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">إرسال الإشعار</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("close-notif-modal").onclick = () => overlay.remove();
    document.getElementById("cancel-notif").onclick = () => overlay.remove();
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
  },

  // === الدوال المساعدة للواجهة ===
  renderPagination(page, total, limit, section) {
    const totalPages = Math.ceil(total / limit) || 1;
    if (totalPages <= 1) return ""; // لا داعي للأزرار إذا كانت صفحة واحدة

    return `
      <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <button class="pagination-btn" data-action="prev" data-section="${section}" data-page="${page - 1}" ${page <= 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} style="padding: 8px 15px; background: #064e3b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">السابق</button>
        <span style="font-weight: bold; color: #334155;">صفحة ${page} من ${totalPages}</span>
        <button class="pagination-btn" data-action="next" data-section="${section}" data-page="${page + 1}" ${page >= totalPages ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} style="padding: 8px 15px; background: #064e3b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">التالي</button>
      </div>
    `;
  },

  _translate(str) {
    const map = { payments: "المدفوعات", fees: "الرسوم والديون", transactions: "الدفتر اليومي", students: "ملفات الطلاب", search: "بحث وعمليات", attendance: "مراقبة الغيابات" };
    return map[str] || str;
  },
  _translateStatus(status) {
    const map = { paid: "مدفوع", unpaid: "غير مدفوع", partial: "مدفوع جزئياً", overdue: "متأخر", completed: "مكتمل", pending: "قيد الانتظار", active: "نشط", inactive: "غير نشط" };
    return map[(status||"").toLowerCase()] || status;
  },
  _formatCurrency(amount) {
    if (amount === null || amount === undefined) return "0 دج";
    return Number(amount).toLocaleString('ar-DZ') + " دج";
  },
  _formatValue(value) { return value === null || value === undefined || value === "" ? "-" : value; },
  _escape(value) { return String(this._formatValue(value)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); },
  _escapeAttr(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
};

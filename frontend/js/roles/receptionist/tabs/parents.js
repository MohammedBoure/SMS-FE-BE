// js/roles/receptionist/tabs/parents.js

ReceptionistUI.renderParents = function(parentsData) {
  const main = document.getElementById("receptionist-main");
  
  // استخراج المصفوفة بأمان
  const parents = Array.isArray(parentsData) ? parentsData : (parentsData?.data || []);

  let html = `
    <h2>إدارة أولياء الأمور</h2>
    <div class="form-container">
      <h3>تسجيل ولي أمر جديد</h3>
      <form id="register-parent-form">
        <input type="text" id="p-fullname" placeholder="الاسم الكامل" required />
        <input type="text" id="p-username" placeholder="اسم المستخدم" required />
        <input type="email" id="p-email" placeholder="البريد الإلكتروني" />
        <input type="text" id="p-phone" placeholder="رقم الهاتف" required />
        <button type="submit">تسجيل الولي</button>
      </form>
    </div>
  `;

  if (!parents || parents.length === 0) {
    html += "<p>لا يوجد أولياء مسجلين.</p>";
  } else {
    const rows = parents.map(p => `
      <tr>
        <td>${this._escape(p.parent_id || p.id)}</td>
        <td><strong>${this._escape(p.full_name || "ولي أمر")}</strong></td>
        <td class="ltr-value">${this._escape(p.phone || "-")}</td>
      </tr>
    `).join("");
    html += `<table><thead><tr><th>المعرف</th><th>الاسم الكامل</th><th>رقم الهاتف</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  main.innerHTML = html;
};
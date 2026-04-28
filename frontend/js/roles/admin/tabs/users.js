// مثال: محتوى ملف frontend/js/roles/admin/tabs/users.js

AdminUI.renderUsersTab = function(response) {
  // 1. تحضير الحاوية وتغيير العنوان
  const main = this.prepareMain("إدارة المستخدمين");
  
  // 2. استخراج البيانات بأمان
  const users = response.data || response || [];

  // 3. التحقق من وجود بيانات
  if (users.length === 0) {
    main.innerHTML = `<p style="text-align:center; padding: 20px;">لا يوجد مستخدمين مسجلين.</p>`;
    return;
  }

  // 4. توليد صفوف الجدول
  const rows = users.map(u => `
    <tr>
      <td>${this._escape(u.id)}</td>
      <td><strong>${this._escape(u.full_name)}</strong></td>
      <td>${this._escape(u.role_name)}</td>
      <td>
        <span style="color: ${u.is_active ? '#166534' : '#991b1b'}; font-weight: bold;">
          ${u.is_active ? 'نشط' : 'معطل'}
        </span>
      </td>
      <td>
        <button onclick="AdminRole.toggleStatus(${u.id}, ${u.is_active})" style="background: #eab308; cursor: pointer; padding: 5px;">تغيير الحالة</button>
        <button onclick="AdminRole.deleteItem('/users', ${u.id}, 'users')" style="background: #ef4444; color: white; cursor: pointer; padding: 5px;">حذف</button>
      </td>
    </tr>
  `).join("");

  // 5. رسم الجدول النهائي
  main.innerHTML = `
    <div style="margin-bottom: 20px; text-align: left;">
      <button style="background: #064e3b; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">+ إضافة مستخدم</button>
    </div>
    <table class="data-table">
      <thead>
        <tr><th>الرقم</th><th>الاسم</th><th>الرتبة</th><th>الحالة</th><th>الإجراءات</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};
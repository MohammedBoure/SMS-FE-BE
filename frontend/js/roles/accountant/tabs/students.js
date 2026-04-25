// js/roles/accountant/tabs/students.js

AccountantUI.renderStudents = function(response) {
  const main = document.getElementById("accountant-main");
  main.style.padding = "20px 5%";

  const students = response.data || response || [];
  const page = response.page || 1;
  const total = response.total || students.length;
  const limit = response.limit || 50;

  if (students.length === 0) {
    main.innerHTML = "<h2 style='color: #064e3b;'>الملفات المالية للطلاب</h2><p>لا يوجد طلاب مسجلين في النظام.</p>";
    return;
  }
  
  const rows = students.map(s => {
    const sId = s.id || s.student_id;
    const name = s.full_name || s.student_name || "غير محدد";
    return `
    <tr style="border-bottom: 1px solid #e2e8f0; text-align: right;" data-search="${this._escape(name + ' ' + sId)}">
      <td style="padding: 12px;">${this._escape(sId)}</td>
      <td style="padding: 12px;"><strong>${this._escape(name)}</strong></td>
      <td style="padding: 12px;">${this._escape(s.class_name || "غير محدد")}</td>
      <td style="padding: 12px;">
        <button class="view-student-finance-btn" data-id="${this._escapeAttr(sId)}" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(16,185,129,0.2);">الملف المالي والتسديد 💰</button>
      </td>
    </tr>
  `}).join("");

  main.innerHTML = `
    <h2 style="color: #064e3b; margin-bottom: 20px;">البحث في الملفات المالية</h2>
    <div style="margin-bottom: 15px;">
      <input type="text" id="finance-student-search" placeholder="ابحث باسم الطالب أو رقمه في هذه الصفحة..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;" />
    </div>
    <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
          <tr>
            <th style="padding: 12px; text-align: right;">الرقم</th>
            <th style="padding: 12px; text-align: right;">الاسم الكامل</th>
            <th style="padding: 12px; text-align: right;">القسم</th>
            <th style="padding: 12px; text-align: right;">إجراء</th>
          </tr>
        </thead>
        <tbody id="finance-students-tbody">${rows}</tbody>
      </table>
    </div>
    ${this.renderPagination(page, total, limit, "students")}
  `;
};

AccountantUI.showStudentFinanceModal = function(student, fees, payments) {
  const existingModal = document.getElementById("finance-modal");
  if (existingModal) existingModal.remove();

  const safeFees = Array.isArray(fees) ? fees : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  const sId = student.id || student.student_id;
  const name = student.full_name || student.student_name;

  const overlay = document.createElement("div");
  overlay.id = "finance-modal";
  overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); direction: rtl;";

  const dialog = document.createElement("div");
  dialog.style.cssText = "background: white; width: 95%; max-width: 900px; max-height: 90vh; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);";

  const feesHtml = safeFees.length === 0 ? "<p>لا توجد رسوم مستحقة أو مسجلة.</p>" : `
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
      <tr style="background: #f8fafc;"><th style="padding: 8px; text-align:right;">النوع</th><th style="padding: 8px; text-align:right;">المبلغ</th><th style="padding: 8px; text-align:right;">الاستحقاق</th><th style="padding: 8px; text-align:right;">الحالة</th><th style="padding: 8px; text-align:right;">إجراء</th></tr>
      ${safeFees.map(f => {
        const isUnpaid = f.status === 'unpaid' || f.status === 'overdue' || f.status === 'partial';
        return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${isUnpaid ? 'background: #fef2f2;' : ''}">
          <td style="padding: 8px;">${this._escape(f.fee_type)}</td>
          <td style="padding: 8px; font-weight: bold; color: ${isUnpaid ? '#991b1b' : '#166534'};">${this._formatCurrency(f.amount_due)}</td>
          <td style="padding: 8px;">${this._escape(f.due_date)}</td>
          <td style="padding: 8px;">${this._translateStatus(f.status)}</td>
          <td style="padding: 8px;">
            ${isUnpaid ? `<button class="pay-specific-fee-btn" data-fee-id="${f.id || f.fee_id}" data-amount="${f.amount_due}" style="background: #10b981; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer;">تسديد</button>` : '<span style="color: #10b981; font-weight:bold;">✔️ مكتمل</span>'}
          </td>
        </tr>`;
      }).join("")}
    </table>`;

  dialog.innerHTML = `
    <div style="background: #064e3b; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0;">الملف المالي: ${this._escape(name)}</h3>
      <button id="close-finance-modal" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
    </div>
    
    <div style="padding: 20px; overflow-y: auto; flex: 1;">
      
      <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px dashed #94a3b8;">
        <h4 style="margin-top: 0; color: #334155;">إضافة مطالبة مالية (رسم) للطالب</h4>
        <form id="add-fee-form" data-student-id="${this._escapeAttr(sId)}" style="display: flex; gap: 10px; flex-wrap: wrap;">
          <input type="text" id="new-fee-type" placeholder="نوع الرسم (مثال: قسط شهري، نقل...)" required style="padding: 10px; border-radius: 4px; border: 1px solid #ccc; flex: 1; min-width: 150px;" />
          <input type="number" id="new-fee-amount" placeholder="المبلغ (دج)" required style="padding: 10px; border-radius: 4px; border: 1px solid #ccc; width: 120px;" />
          <input type="date" id="new-fee-date" required style="padding: 10px; border-radius: 4px; border: 1px solid #ccc;" />
          <button type="submit" style="background: #3b82f6; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">تسجيل الرسم</button>
        </form>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h4 style="color: #064e3b; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 0;">سجل الرسوم والمطالبات</h4>
          ${feesHtml}
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h4 style="color: #064e3b; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 0;">المدفوعات والوصولات السابقة</h4>
          ${safePayments.length === 0 ? "<p style='color:#64748b;'>لم يقم الطالب بأي دفعات حتى الآن.</p>" : `
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${safePayments.map(p => `
                <li style="background: #f0fdf4; border: 1px solid #bbf7d0; margin-bottom: 8px; padding: 10px; border-radius: 6px; border-right: 4px solid #10b981;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span style="color: #065f46;">وصل #${this._escape(p.receipt_number || p.payment_id || p.id)}</span>
                    <span style="color: #10b981;">+${this._formatCurrency(p.amount_paid)}</span>
                  </div>
                  <div style="font-size: 0.85em; color: #64748b; margin-top: 5px;">بتاريخ: ${this._escape(p.payment_date)}</div>
                </li>
              `).join("")}
            </ul>
          `}
        </div>
      </div>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  document.getElementById("close-finance-modal").onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); }
};
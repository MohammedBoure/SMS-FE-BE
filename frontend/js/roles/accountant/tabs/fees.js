// js/roles/accountant/tabs/fees.js

AccountantUI.renderFees = function(fees) {
  const main = document.getElementById("accountant-main");
  main.style.padding = "20px 5%";

  if (!fees || fees.length === 0) {
    main.innerHTML = "<h2 style='color: #064e3b;'>الرسوم والديون</h2><p>لا توجد رسوم مسجلة في النظام.</p>";
    return;
  }
  
  const rows = fees.map(f => {
    const isUnpaid = f.status === 'unpaid' || f.status === 'overdue';
    const isOverdue = f.status === 'overdue';
    
    // التقاط user_id الخاص بالطالب لكي نتمكن من مراسلته
    const userId = f.user_id || f.student_user_id || f.student_id; 
    const studentName = f.student_name || f.full_name || `طالب #${f.student_id}`;

    return `
    <tr style="border-bottom: 1px solid #e2e8f0; text-align: right; background: ${isOverdue ? '#fef2f2' : 'transparent'};">
      <td style="padding: 12px;">${this._escape(f.fee_id || f.id)}</td>
      <td style="padding: 12px;"><strong>${this._escape(studentName)}</strong></td>
      <td style="padding: 12px;">${this._escape(f.fee_type)}</td>
      <td style="padding: 12px; direction: ltr; font-weight: bold;">${this._formatCurrency(f.amount_due)}</td>
      <td style="padding: 12px; color: ${isOverdue ? '#dc2626' : '#1e293b'};">${this._escape(f.due_date)}</td>
      <td style="padding: 12px;">
        <span style="background: ${isUnpaid ? '#fee2e2' : '#dcfce7'}; color: ${isUnpaid ? '#991b1b' : '#166534'}; padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">
          ${this._translateStatus(f.status || "")}
        </span>
      </td>
      <td style="padding: 12px;">
        ${isOverdue ? `<button class="send-warning-btn" data-user-id="${this._escapeAttr(userId)}" data-name="${this._escapeAttr(studentName)}" data-fee="${this._escapeAttr(f.fee_type)}" data-amount="${this._escapeAttr(f.amount_due)}" style="background: #eab308; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">إرسال إنذار 🔔</button>` : '-'}
      </td>
    </tr>
  `}).join("");

  main.innerHTML = `
    <h2 style="color: #064e3b; margin-bottom: 20px;">سجل الرسوم والديون الشامل</h2>
    <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
          <tr>
            <th style="padding: 12px; text-align: right;">رقم الرسم</th>
            <th style="padding: 12px; text-align: right;">الطالب</th>
            <th style="padding: 12px; text-align: right;">نوع الرسم</th>
            <th style="padding: 12px; text-align: right;">المبلغ</th>
            <th style="padding: 12px; text-align: right;">تاريخ الاستحقاق</th>
            <th style="padding: 12px; text-align: right;">الحالة</th>
            <th style="padding: 12px; text-align: right;">إجراءات</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};
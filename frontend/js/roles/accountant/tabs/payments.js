// js/roles/accountant/tabs/payments.js
AccountantUI.renderPayments = function(payments) {
  const main = document.getElementById("accountant-main");
  main.style.padding = "20px 5%";

  if (!payments || payments.length === 0) {
    main.innerHTML = "<h2 style='color: #064e3b;'>المدفوعات المستلمة</h2><p>لا توجد مدفوعات مسجلة.</p>";
    return;
  }
  
  const rows = payments.map(p => `
    <tr style="border-bottom: 1px solid #e2e8f0; text-align: right;">
      <td style="padding: 12px; font-weight: bold; color: #0f172a;">${this._escape(p.receipt_number || p.payment_id || p.id)}</td>
      <td style="padding: 12px;">${this._escape(p.student_name || p.student_id || "طالب")}</td>
      <td style="padding: 12px; direction: ltr; font-weight: bold; color: #10b981;">${this._formatCurrency(p.amount_paid)}</td>
      <td style="padding: 12px;">${this._escape(p.payment_date)}</td>
    </tr>
  `).join("");

  main.innerHTML = `
    <h2 style="color: #064e3b; margin-bottom: 20px;">أرشيف الوصولات (المدفوعات المستلمة)</h2>
    <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
          <tr>
            <th style="padding: 12px; text-align: right;">رقم الوصل</th>
            <th style="padding: 12px; text-align: right;">الطالب / الولي</th>
            <th style="padding: 12px; text-align: right;">المبلغ المستلم</th>
            <th style="padding: 12px; text-align: right;">تاريخ الدفع</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};
// js/roles/accountant/tabs/transactions.js

AccountantUI.renderTransactions = function(response) {
  const main = document.getElementById("accountant-main");
  main.style.padding = "20px 5%";

  const transactions = response.data || response || [];
  const page = response.page || 1;
  const total = response.total || transactions.length;
  const limit = response.limit || 50;

  if (transactions.length === 0) {
    main.innerHTML = "<h2 style='color: #064e3b;'>سجل المعاملات</h2><p>الدفتر اليومي فارغ.</p>";
    return;
  }
  
  const rows = transactions.map(t => {
    const isIncome = t.transaction_type === 'income' || Number(t.amount) > 0;
    // إذا كان الباك اند يرسل الأسماء سنعرضها، وإلا نعرض الأرقام
    const fromUser = t.from_user_name || `مستخدم #${t.from_user_id}`;
    const toUser = t.to_user_name || `مستخدم #${t.to_user_id}`;

    return `
    <tr style="border-bottom: 1px solid #e2e8f0; text-align: right;">
      <td style="padding: 12px; font-weight: bold;">${this._escape(t.id)}</td>
      <td style="padding: 12px; direction: ltr; font-weight: bold; color: ${isIncome ? '#10b981' : '#ef4444'}; text-align: right;">
        ${isIncome ? '+' : '-'}${this._formatCurrency(Math.abs(t.amount))}
      </td>
      <td style="padding: 12px;">
        <span style="color: #64748b; font-size: 0.85em;">من:</span> <strong>${this._escape(fromUser)}</strong><br>
        <span style="color: #64748b; font-size: 0.85em;">إلى:</span> <strong>${this._escape(toUser)}</strong>
      </td>
      <td style="padding: 12px;">${this._escape(t.transaction_type || "عام")}</td>
      <td style="padding: 12px;">${this._escape(t.notes || t.reference_type || "-")}</td>
      <td style="padding: 12px; direction: ltr; text-align: right;">${this._escape(t.created_at)}</td>
    </tr>
  `}).join("");

  main.innerHTML = `
    <h2 style="color: #064e3b; margin-bottom: 20px;">الدفتر اليومي الشامل للمؤسسة</h2>
    <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
          <tr>
            <th style="padding: 12px; text-align: right;">المعرف</th>
            <th style="padding: 12px; text-align: right;">المبلغ</th>
            <th style="padding: 12px; text-align: right;">مسار الدفعة (من/إلى)</th>
            <th style="padding: 12px; text-align: right;">نوع الحركة</th>
            <th style="padding: 12px; text-align: right;">البيان</th>
            <th style="padding: 12px; text-align: right;">التاريخ</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${this.renderPagination(page, total, limit, "transactions")}
  `;
};
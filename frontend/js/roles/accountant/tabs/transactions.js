// js/roles/accountant/tabs/transactions.js

AccountantUI.renderTransactions = function(response) {
  const main = document.getElementById("accountant-main");
  main.style.padding = "20px 5%";

  const transactions = response?.data || response || [];
  const page = response?.page || 1;
  const total = response?.total || transactions.length;
  const limit = response?.limit || 50;
  const align = this.start();

  if (transactions.length === 0) {
    main.innerHTML = `
      <h2 style="color: #064e3b;">${this.t("accountant.transactions.emptyTitle", {}, "Transaction Record")}</h2>
      <p>${this.t("accountant.transactions.emptyText", {}, "The daily ledger is empty.")}</p>
    `;
    return;
  }

  const rows = transactions.map(t => {
    const isIncome = t.transaction_type === "income" || Number(t.amount) > 0;
    const fromUser = t.from_user_name || this.t("accountant.common.userFallback", { id: t.from_user_id }, `User #${t.from_user_id}`);
    const toUser = t.to_user_name || this.t("accountant.common.userFallback", { id: t.to_user_id }, `User #${t.to_user_id}`);
    const type = this._translateStatus(t.transaction_type || this.t("accountant.common.general", {}, "General"));

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; text-align: ${align};">
        <td style="padding: 12px; font-weight: bold;">${this._escape(t.id)}</td>
        <td style="padding: 12px; direction: ltr; font-weight: bold; color: ${isIncome ? '#10b981' : '#ef4444'}; text-align: ${align};">
          ${isIncome ? "+" : "-"}${this._formatCurrency(Math.abs(Number(t.amount) || 0))}
        </td>
        <td style="padding: 12px;">
          <span style="color: #64748b; font-size: 0.85em;">${this.t("accountant.common.from", {}, "From:")}</span> <strong>${this._escape(fromUser)}</strong><br>
          <span style="color: #64748b; font-size: 0.85em;">${this.t("accountant.common.to", {}, "To:")}</span> <strong>${this._escape(toUser)}</strong>
        </td>
        <td style="padding: 12px;">${this._escape(type)}</td>
        <td style="padding: 12px;">${this._escape(t.notes || t.reference_type || this.t("accountant.common.none", {}, "-"))}</td>
        <td style="padding: 12px; direction: ltr; text-align: ${align};">${this._escape(t.created_at)}</td>
      </tr>
    `;
  }).join("");

  main.innerHTML = `
    <h2 style="color: #064e3b; margin-bottom: 20px;">${this.t("accountant.transactions.title", {}, "Complete Daily Ledger")}</h2>
    <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <table style="width: 100%; border-collapse: collapse;">
        <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
          <tr>
            <th style="padding: 12px; text-align: ${align};">${this.t("accountant.transactions.columns.id", {}, "ID")}</th>
            <th style="padding: 12px; text-align: ${align};">${this.t("accountant.transactions.columns.amount", {}, "Amount")}</th>
            <th style="padding: 12px; text-align: ${align};">${this.t("accountant.transactions.columns.route", {}, "Payment path")}</th>
            <th style="padding: 12px; text-align: ${align};">${this.t("accountant.transactions.columns.type", {}, "Movement type")}</th>
            <th style="padding: 12px; text-align: ${align};">${this.t("accountant.transactions.columns.notes", {}, "Description")}</th>
            <th style="padding: 12px; text-align: ${align};">${this.t("accountant.transactions.columns.date", {}, "Date")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${this.renderPagination(page, total, limit, "transactions")}
  `;
};

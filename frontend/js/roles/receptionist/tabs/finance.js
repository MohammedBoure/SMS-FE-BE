// js/roles/receptionist/tabs/finance.js

ReceptionistUI.renderFinanceDashboard = function() {
  const main = document.getElementById("receptionist-main");
  main.innerHTML = `
    <h2>${this.t("receptionist.finance.title", {}, "Finance and Payment Reception")}</h2>
    <div class="form-container inline-form">
      <input type="number" id="finance-student-id" placeholder="${this._escapeAttr(this.t("receptionist.finance.studentIdPlaceholder", {}, "Enter student ID..."))}" />
      <button id="search-fees-btn">${this.t("receptionist.finance.searchFees", {}, "Search fees")}</button>
    </div>
    <div id="finance-results"><p>${this.t("receptionist.finance.initialHint", {}, "Enter the student ID to search their financial status.")}</p></div>
  `;
};

ReceptionistUI.renderStudentFeesList = function(feesData) {
  const container = document.getElementById("finance-results");
  const fees = Array.isArray(feesData) ? feesData : (feesData?.data || []);

  if (!fees || fees.length === 0) {
    container.innerHTML = `<p>${this.t("receptionist.finance.noFees", {}, "No due fees found.")}</p>`;
    return;
  }

  const rows = fees.map(f => `
    <tr>
      <td>${this._escape(f.fee_type)}</td>
      <td><strong>${this._formatCurrency(f.amount_due)}</strong></td>
      <td>${this._escape(f.due_date)}</td>
      <td><button class="pay-fee-btn" data-fee-id="${this._escapeAttr(f.id || f.fee_id)}" data-amount="${this._escapeAttr(f.amount_due)}">${this.t("receptionist.finance.receivePayment", {}, "Receive payment")}</button></td>
    </tr>
  `).join("");

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${this.t("receptionist.finance.columns.type", {}, "Type")}</th>
          <th>${this.t("receptionist.finance.columns.amount", {}, "Amount")}</th>
          <th>${this.t("receptionist.finance.columns.date", {}, "Date")}</th>
          <th>${this.t("receptionist.finance.columns.action", {}, "Action")}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

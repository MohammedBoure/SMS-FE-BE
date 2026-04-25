// js/roles/receptionist/tabs/finance.js

ReceptionistUI.renderFinanceDashboard = function() {
  const main = document.getElementById("receptionist-main");
  main.innerHTML = `
    <h2>المالية واستقبال الدفعات</h2>
    <div class="form-container inline-form">
      <input type="number" id="finance-student-id" placeholder="أدخل رقم الطالب..." />
      <button id="search-fees-btn">بحث عن الرسوم</button>
    </div>
    <div id="finance-results"><p>أدخل رقم الطالب للبحث عن وضعيته المالية.</p></div>
  `;
};

ReceptionistUI.renderStudentFeesList = function(feesData) {
  const container = document.getElementById("finance-results");
  
  // استخراج المصفوفة بأمان
  const fees = Array.isArray(feesData) ? feesData : (feesData?.data || []);

  if (!fees || fees.length === 0) {
    container.innerHTML = "<p>لا توجد رسوم مستحقة.</p>";
    return;
  }
  const rows = fees.map(f => `
    <tr>
      <td>${this._escape(f.fee_type)}</td>
      <td><strong>${this._escape(f.amount_due)} دج</strong></td>
      <td>${this._escape(f.due_date)}</td>
      <td><button class="pay-fee-btn" data-fee-id="${f.id}">استلام الدفعة</button></td>
    </tr>`).join("");

  container.innerHTML = `<table><thead><tr><th>النوع</th><th>المبلغ</th><th>التاريخ</th><th>إجراء</th></tr></thead><tbody>${rows}</tbody></table>`;
};
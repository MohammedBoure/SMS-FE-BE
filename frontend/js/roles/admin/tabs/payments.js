// frontend/js/roles/admin/tabs/payments.js

AdminUI.paymentsT = function(key, params = {}, fallback = "") {
    return this.t(`admin.paymentsTab.${key}`, params, fallback);
};

AdminUI.paymentInlineString = function(value) {
    return JSON.stringify(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.paymentDate = function(value) {
    if (!value) return new Date().toISOString().split("T")[0];
    const locale = window.I18n?.currentLang === "en" ? "en-US" : "ar-DZ";
    try {
        return new Date(value).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    } catch (err) {
        return value;
    }
};

AdminUI.paymentFeeTypeLabel = function(type, fallback = "") {
    const key = String(type || "other").trim().toLowerCase();
    const labels = {
        tuition: this.paymentsT("feeTypes.tuition", {}, "Tuition"),
        transport: this.paymentsT("feeTypes.transport", {}, "Transport"),
        activities: this.paymentsT("feeTypes.activities", {}, "Activities"),
        exam: this.paymentsT("feeTypes.exam", {}, "Exam fees"),
        other: this.paymentsT("feeTypes.other", {}, "Other")
    };
    return labels[key] || fallback || type || labels.other;
};

AdminUI.renderPaymentsTab = function(response) {
    const main = this.prepareMain(this.t("admin.sections.payments", {}, "Payments and Collections"));
    const payments = response.data || response || [];
    const totalCollected = payments.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);

    main.innerHTML = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #10b981; flex-wrap: wrap; gap: 15px;">
            <div>
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">${this.paymentsT("summary.totalCollected", {}, "Displayed collections total")}</div>
                <div style="font-size: 1.8em; font-weight: bold; color: #064e3b; margin-top: 5px;">${this._formatCurrency(totalCollected)}</div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex: 1; max-width: 400px; position: relative;">
                <input type="text" id="payment-search-input"
                       placeholder="${this.paymentsT("search.placeholder", {}, "Search by student name or receipt number...")}"
                       style="padding: 12px 15px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; outline: none; font-weight: bold; box-sizing: border-box;"
                       onkeyup="AdminUI.searchPaymentsLocal(this.value)">
                <button onclick="AdminRole.loadSection('payments')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;" title="${this.paymentsT("actions.reloadAll", {}, "Reload all")}">
                    ${this.icon("refresh", "inline-svg-icon")}
                </button>
            </div>
            <button onclick="AdminUI.showPaymentModal()" style="background: #0f172a; color: white; border: none; padding: 14px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s; font-size: 1.05em;">
                ${this.icon("card", "inline-svg-icon")} ${this.paymentsT("actions.recordPayment", {}, "Record Payment")}
            </button>
        </div>

        <div id="payments-table-container">
            ${this._generatePaymentsTableHtml(payments)}
        </div>

        <div id="payment-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: min(550px, calc(100vw - 28px)); max-height: calc(100vh - 28px); overflow: auto; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 id="payment-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("card", "inline-svg-icon")} ${this.paymentsT("modal.title", {}, "Record New Payment")}
                </h3>

                <input type="hidden" id="modal-payment-id">

                <div id="modal-payment-student-section" style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.paymentsT("modal.studentStep", {}, "1. Search for the target student *")}</label>
                    <div style="position: relative;">
                        <input type="text" id="modal-payment-student-search" placeholder="${this.paymentsT("modal.studentPlaceholder", {}, "Type student name to search...")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;" onkeyup="AdminUI.searchStudentForPayment(this.value)">
                        <input type="hidden" id="modal-payment-student-id">
                        <div id="modal-payment-student-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10; margin-top: 5px;"></div>
                    </div>
                </div>

                <div id="modal-payment-fee-section" style="margin-top: 15px; display: none;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.paymentsT("modal.feeStep", {}, "2. Choose the fee to settle *")}</label>
                    <select id="modal-payment-fee-id" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc; font-weight: bold; color: #0f172a;" onchange="AdminUI.fetchFeeBalanceForPayment(this.value)">
                        <option value="">${this.paymentsT("modal.chooseFee", {}, "-- Choose the fee --")}</option>
                    </select>

                    <div id="modal-payment-balance-box" style="display: none; margin-top: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 0.9em;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #64748b;">${this.paymentsT("balance.netAmount", {}, "Net fee amount:")}</span>
                            <strong id="info-net-amount">0</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #64748b;">${this.paymentsT("balance.previousPayments", {}, "Previous payments:")}</span>
                            <strong id="info-total-paid" style="color: #16a34a;">0</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 5px; margin-top: 5px;">
                            <span style="color: #dc2626; font-weight: bold;">${this.paymentsT("balance.remainingNow", {}, "Remaining to pay now:")}</span>
                            <strong id="info-remaining-balance" style="color: #dc2626; font-size: 1.1em;">0</strong>
                        </div>
                    </div>
                </div>

                <div id="modal-payment-details-section" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 15px; opacity: 0.5; pointer-events: none;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.paymentsT("modal.amountLabel", {}, "Paid amount *")}</label>
                        <input type="number" id="modal-payment-amount" min="1" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box; font-weight: bold; color: #16a34a; font-size: 1.1em;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.paymentsT("modal.receiptLabel", {}, "Receipt number (optional)")}</label>
                        <input type="text" id="modal-payment-receipt" placeholder="REC-XXXXX" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.paymentsT("modal.installmentLabel", {}, "Installment number")}</label>
                        <input type="number" id="modal-payment-installment" value="1" min="1" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px;">
                    <button onclick="AdminUI.closePaymentModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button id="btn-submit-payment" onclick="AdminUI.submitPayment()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2); pointer-events: none; opacity: 0.5;">${this.paymentsT("modal.confirmPayment", {}, "Confirm Payment")}</button>
                </div>
            </div>
        </div>

        <script>window.currentPaymentsData = ${JSON.stringify(payments)};</script>
    `;

    document.addEventListener("click", function(e) {
        const dropdown = document.getElementById("modal-payment-student-dropdown");
        const searchInput = document.getElementById("modal-payment-student-search");
        if (dropdown && e.target !== searchInput && e.target !== dropdown) dropdown.style.display = "none";
    });
};

AdminUI._generatePaymentsTableHtml = function(payments) {
    if (!payments || payments.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <span style="display: inline-flex; opacity: 0.55;">${this.icon("receipt", "inline-svg-icon")}</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">${this.paymentsT("table.empty", {}, "No payments are recorded or matching your search.")}</p>
            </div>
        `;
    }

    const rows = payments.map(p => {
        const id = p.payment_id || p.id;
        const paymentJSON = JSON.stringify(p).replace(/'/g, "&#39;");
        const studentName = p.student_name || this.paymentsT("table.studentFallback", { id: p.student_id }, `Student #${p.student_id}`);
        const feeLabel = this.paymentFeeTypeLabel(p.fee_type, p.fee_type || this.paymentsT("table.feeFallback", { id: p.fee_id }, `Fee #${p.fee_id}`));
        return `
            <tr class="payment-row" style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td data-label="${this.paymentsT("table.operation", {}, "Operation")}" style="padding: 15px; font-weight: bold; color: #64748b;">#${id}</td>
                <td data-label="${this.paymentsT("table.student", {}, "Student")}" style="padding: 15px;">
                    <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(studentName)}</div>
                </td>
                <td data-label="${this.paymentsT("table.feeType", {}, "Fee Type")}" style="padding: 15px;">
                    <span style="background: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-size: 0.85em; font-weight: bold;">${this._escape(feeLabel)}</span>
                </td>
                <td data-label="${this.paymentsT("table.amountPaid", {}, "Amount Paid")}" style="padding: 15px; font-weight: bold; color: #16a34a; font-size: 1.1em; direction: ltr; text-align: right;">${this._formatCurrency(p.amount_paid)}</td>
                <td data-label="${this.paymentsT("table.receipt", {}, "Receipt Number")}" style="padding: 15px;">
                    <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #475569;">${this._escape(p.receipt_number || this.paymentsT("table.noReceipt", {}, "No receipt"))}</span>
                </td>
                <td data-label="${this.paymentsT("table.installment", {}, "Installment")}" style="padding: 15px; color: #334155; font-weight: bold;">${this.paymentsT("table.installmentNumber", { number: p.installment_number || 1 }, `Installment ${p.installment_number || 1}`)}</td>
                <td data-label="${this.paymentsT("table.date", {}, "Date")}" style="padding: 15px; color: #64748b; font-size: 0.9em; direction: ltr; text-align: right; font-weight: bold;">${this._escape(this.paymentDate(p.payment_date))}</td>
                <td class="admin-actions-cell" data-label="${this.paymentsT("table.actions", {}, "Actions")}" style="padding: 15px; text-align: left;">
                    <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
                        <button onclick='AdminUI.printReceipt(${paymentJSON})' title="${this.paymentsT("actions.printReceiptTitle", {}, "Print receipt")}" style="background: #fffbeb; color: #d97706; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-weight: bold; display: inline-flex; align-items: center; gap: 6px;">${this.icon("printer", "inline-svg-icon")} ${this.paymentsT("actions.print", {}, "Print")}</button>
                        <button onclick="AdminRole.deleteItem('/payments', ${id}, 'payments')" title="${this.paymentsT("actions.cancelPaymentTitle", {}, "Cancel payment")}" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">${this.icon("trash", "inline-svg-icon")} ${this.t("admin.actions.delete", {}, "Delete")}</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.95em; color: #475569;">
                ${this.paymentsT("table.totalOperations", { count: payments.length }, `Total operations: ${payments.length}`)}
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">${this.paymentsT("table.operation", {}, "Operation")}</th>
                            <th style="padding: 15px; color: #334155;">${this.paymentsT("table.student", {}, "Student")}</th>
                            <th style="padding: 15px; color: #334155;">${this.paymentsT("table.feeType", {}, "Fee Type")}</th>
                            <th style="padding: 15px; color: #334155;">${this.paymentsT("table.amountPaid", {}, "Amount Paid")}</th>
                            <th style="padding: 15px; color: #334155;">${this.paymentsT("table.receipt", {}, "Receipt Number")}</th>
                            <th style="padding: 15px; color: #334155;">${this.paymentsT("table.installment", {}, "Installment")}</th>
                            <th style="padding: 15px; color: #334155;">${this.paymentsT("table.date", {}, "Date")}</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">${this.paymentsT("table.actions", {}, "Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

AdminUI.searchPaymentsLocal = function(keyword) {
    keyword = keyword.toLowerCase().trim();
    const allPayments = window.currentPaymentsData || [];
    const filtered = allPayments.filter(p => {
        const studentName = (p.student_name || "").toLowerCase();
        const receipt = (p.receipt_number || "").toLowerCase();
        return studentName.includes(keyword) || receipt.includes(keyword) || String(p.student_id).includes(keyword);
    });
    document.getElementById("payments-table-container").innerHTML = this._generatePaymentsTableHtml(filtered);
};

AdminUI.showPaymentModal = function() {
    const modal = document.getElementById("payment-modal");
    document.getElementById("modal-payment-id").value = "";
    document.getElementById("modal-payment-student-id").value = "";
    document.getElementById("modal-payment-student-search").value = "";

    const feeSection = document.getElementById("modal-payment-fee-section");
    const feeSelect = document.getElementById("modal-payment-fee-id");
    feeSelect.innerHTML = `<option value="">${this.paymentsT("modal.chooseFee", {}, "-- Choose the fee --")}</option>`;
    feeSelect.disabled = false;
    feeSection.style.display = "none";
    document.getElementById("modal-payment-balance-box").style.display = "none";

    document.getElementById("modal-payment-amount").value = "";
    document.getElementById("modal-payment-receipt").value = `REC-${Math.floor(Math.random() * 1000000)}`;
    document.getElementById("modal-payment-installment").value = "1";

    document.getElementById("modal-payment-details-section").style.pointerEvents = "none";
    document.getElementById("modal-payment-details-section").style.opacity = "0.5";
    document.getElementById("btn-submit-payment").style.pointerEvents = "none";
    document.getElementById("btn-submit-payment").style.opacity = "0.5";
    document.getElementById("btn-submit-payment").disabled = false;
    document.getElementById("btn-submit-payment").innerHTML = this.paymentsT("modal.confirmPayment", {}, "Confirm Payment");

    modal.style.display = "flex";
};

AdminUI.closePaymentModal = function() {
    document.getElementById("payment-modal").style.display = "none";
};

AdminUI.searchStudentForPayment = async function(keyword) {
    const dropdown = document.getElementById("modal-payment-student-dropdown");
    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/students/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const students = response.data || [];

        if (students.length === 0) {
            dropdown.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center;">${this.paymentsT("search.noResults", {}, "No results")}</div>`;
        } else {
            dropdown.innerHTML = students.map(s => {
                const id = s.student_id || s.id;
                const name = s.full_name || s.student_name || this.paymentsT("table.studentFallback", { id }, `Student #${id}`);
                return `
                    <div onclick="AdminUI.selectStudentForPayment(${id}, ${this.paymentInlineString(name)})"
                         style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s;"
                         onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <strong style="color: #0f172a;">${this._escape(name)}</strong>
                        <small style="color: #64748b; float: left;">${this.paymentsT("search.idLabel", { id }, `ID: ${id}`)}</small>
                    </div>
                `;
            }).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error(this.paymentsT("messages.searchFailed", {}, "Search failed:"), err);
    }
};

AdminUI.selectStudentForPayment = async function(id, name) {
    document.getElementById("modal-payment-student-search").value = name;
    document.getElementById("modal-payment-student-id").value = id;
    document.getElementById("modal-payment-student-dropdown").style.display = "none";

    const feeSection = document.getElementById("modal-payment-fee-section");
    const feeSelect = document.getElementById("modal-payment-fee-id");
    feeSelect.innerHTML = `<option value="">${this.paymentsT("fee.loadingStudentFees", {}, "Fetching student debts...")}</option>`;
    feeSelect.disabled = false;
    feeSection.style.display = "block";
    document.getElementById("modal-payment-balance-box").style.display = "none";

    try {
        const feesRes = await Api.get(`/student-fees/student/${id}`);
        const fees = feesRes.data || feesRes || [];
        const unpaidFees = fees.filter(f => f.status !== "paid");

        if (unpaidFees.length === 0) {
            feeSelect.innerHTML = `<option value="">${this.paymentsT("fee.noDebts", {}, "This student has no due debts or payable invoices currently.")}</option>`;
            feeSelect.disabled = true;
        } else {
            feeSelect.innerHTML = `<option value="">${this.paymentsT("fee.chooseFeeToPay", {}, "-- Choose the fee to pay --")}</option>` +
                unpaidFees.map(f => {
                    const actualFeeId = f.fee_id || f.id;
                    const labelType = this.paymentFeeTypeLabel(f.fee_type, f.fee_type);
                    const amount = f.net_amount || f.amount_due || 0;
                    return `<option value="${actualFeeId}">${this.paymentsT("fee.optionLabel", { id: actualFeeId, type: labelType, amount }, `#${actualFeeId} - ${labelType} - Amount: ${amount}`)}</option>`;
                }).join("");
            feeSelect.disabled = false;
        }
    } catch (err) {
        feeSelect.innerHTML = `<option value="">${this.paymentsT("fee.loadFailed", {}, "Failed to fetch student debts.")}</option>`;
    }
};

AdminUI.fetchFeeBalanceForPayment = async function(feeId) {
    const detailsSection = document.getElementById("modal-payment-details-section");
    const submitBtn = document.getElementById("btn-submit-payment");
    const balanceBox = document.getElementById("modal-payment-balance-box");
    const amountInput = document.getElementById("modal-payment-amount");

    if (!feeId) {
        balanceBox.style.display = "none";
        return;
    }

    balanceBox.style.display = "block";
    document.getElementById("info-net-amount").innerHTML = this.paymentsT("fee.calculating", {}, "Calculating...");

    try {
        const balanceData = await Api.get(`/payments/fee/${feeId}/balance`);
        const netAmount = balanceData.net_amount || 0;
        const totalPaid = balanceData.total_paid || 0;
        const remaining = balanceData.remaining_balance || 0;

        document.getElementById("info-net-amount").innerHTML = this._formatCurrency(netAmount);
        document.getElementById("info-total-paid").innerHTML = this._formatCurrency(totalPaid);
        document.getElementById("info-remaining-balance").innerHTML = this._formatCurrency(remaining);

        amountInput.value = remaining;
        detailsSection.style.pointerEvents = "auto";
        detailsSection.style.opacity = "1";
        submitBtn.style.pointerEvents = "auto";
        submitBtn.style.opacity = "1";
    } catch (err) {
        document.getElementById("info-net-amount").innerHTML = this.paymentsT("fee.fetchError", {}, "Error fetching data");
        console.error("Balance Fetch Error:", err);
    }
};

AdminUI.submitPayment = async function() {
    const feeId = document.getElementById("modal-payment-fee-id").value;
    const amount = parseFloat(document.getElementById("modal-payment-amount").value);
    const receipt = document.getElementById("modal-payment-receipt").value.trim();
    const installment = parseInt(document.getElementById("modal-payment-installment").value, 10) || 1;
    const btn = document.getElementById("btn-submit-payment");

    if (!feeId || isNaN(amount) || amount <= 0) {
        this.showToast(this.paymentsT("messages.amountRequired", {}, "Please choose a fee and enter a valid amount greater than zero."), "error");
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = this.paymentsT("messages.saving", {}, "Saving...");
    }

    try {
        await Api.post("/payments/", {
            fee_id: parseInt(feeId, 10),
            amount_paid: amount,
            installment_number: installment,
            receipt_number: receipt || null
        });

        this.showToast(this.paymentsT("messages.success", {}, "Payment recorded successfully."));
        this.closePaymentModal();
        AdminRole.loadSection("payments");
    } catch (err) {
        this.showToast(this.paymentsT("messages.saveFailed", { message: err.message || this.paymentsT("messages.checkData", {}, "Please check the data.") }, `Save failed: ${err.message}`), "error");
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = this.paymentsT("modal.confirmPayment", {}, "Confirm Payment");
        }
    }
};

AdminUI.printReceipt = function(paymentData) {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    const receiptId = paymentData.payment_id || paymentData.id;
    const receiptNumber = paymentData.receipt_number || `REC-${receiptId}`;

    printWindow.document.write(`
        <html dir="${document.documentElement.dir || "rtl"}" lang="${window.I18n?.currentLang || "ar"}">
        <head>
            <title>${this.paymentsT("receipt.documentTitle", { id: receiptId }, `Receipt #${receiptId}`)}</title>
            <style>
                @page { margin: 0; }
                body { font-family: 'Courier New', Courier, monospace; text-align: center; width: 300px; margin: 0 auto; padding: 20px 10px; color: black; }
                .header-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                .subtitle { font-size: 14px; margin-bottom: 15px; }
                .line { border-bottom: 1px dashed black; margin: 15px 0; }
                .details { text-align: start; font-size: 14px; line-height: 1.8; }
                .details span { font-weight: bold; float: inline-end; }
                .total { font-size: 18px; font-weight: bold; margin-top: 15px; border-top: 2px solid black; padding-top: 10px; }
                .footer { font-size: 12px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="header-title">${this.paymentsT("receipt.schoolName", {}, "Modern School")}</div>
            <div class="subtitle">${this.paymentsT("receipt.systemName", {}, "School Management System")}</div>
            <div class="line"></div>
            <h3 style="margin:5px 0;">${this.paymentsT("receipt.cashReceipt", {}, "Cash Receipt")}</h3>
            <p style="margin:5px 0; font-size:12px;">${this.paymentsT("receipt.receiptNumber", { value: receiptNumber }, `Receipt Number: ${receiptNumber}`)}</p>
            <div class="line"></div>
            <div class="details">
                <div>${this.paymentsT("receipt.date", {}, "Date:")} <span>${this._escape(this.paymentDate(paymentData.payment_date))}</span></div>
                <div>${this.paymentsT("receipt.reference", {}, "Reference:")} <span>#${receiptId}</span></div>
                <div>${this.paymentsT("receipt.studentName", {}, "Student Name:")} <span>${this._escape(paymentData.student_name || "")}</span></div>
                <div>${this.paymentsT("receipt.targetFee", {}, "Target Fee:")} <span>#${paymentData.fee_id}</span></div>
                <div>${this.paymentsT("receipt.installment", {}, "Installment:")} <span>${paymentData.installment_number || 1}</span></div>
            </div>
            <div class="total">
                ${this.paymentsT("receipt.paidAmount", {}, "Paid Amount:")}
                <span style="float:inline-end;">${this._formatCurrency(paymentData.amount_paid)}</span>
            </div>
            <div class="line"></div>
            <div class="footer">
                <p>${this.paymentsT("receipt.receivedNote", {}, "The amount shown above has been received.")}</p>
                <p>${this.paymentsT("receipt.thankYou", {}, "Thank you for choosing our school.")}</p>
                <p style="margin-top: 20px;">${this.paymentsT("receipt.cashierSignature", {}, "Cashier Signature")}</p>
                <p>.....................</p>
            </div>
            <script>
                window.onload = () => {
                    window.print();
                    setTimeout(() => window.close(), 500);
                };
            </script>
        </body>
        </html>
    `);
};

if (!AdminUI.showToast) {
    AdminUI.showToast = function(message, type = "success") {
        const toast = document.createElement("div");
        toast.innerText = message;
        const bgColor = type === "error" ? "#dc2626" : "#0f172a";
        toast.style.cssText = `position: fixed; bottom: 20px; left: 20px; background: ${bgColor}; color: white; padding: 12px 25px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-weight: bold; transition: opacity 0.5s;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = "0", 2500);
        setTimeout(() => toast.remove(), 3000);
    };
}

// frontend/js/roles/admin/tabs/fees.js

AdminUI.feesT = function(key, params = {}, fallback = "") {
    return this.t(`admin.fees.${key}`, params, fallback);
};

AdminUI.feeTypeLabel = function(type) {
    const labels = {
        tuition: this.feesT("types.tuition", {}, "Tuition"),
        transport: this.feesT("types.transport", {}, "Transport"),
        activities: this.feesT("types.activities", {}, "Activities"),
        exam: this.feesT("types.exam", {}, "Exam Fees"),
        other: this.feesT("types.other", {}, "Other")
    };
    return labels[type] || type || "-";
};

AdminUI.feeInlineJson = function(value) {
    return JSON.stringify(value || {})
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.feeInlineString = function(value) {
    return JSON.stringify(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.renderFeesTab = async function(feesData) {
    const main = this.prepareMain(this.t("admin.sections.studentFees", {}, "Fees and Debts Management"));
    const rawFees = feesData.data || feesData || [];

    main.innerHTML = `<div style="text-align:center; padding: 50px; color: #64748b; font-weight: bold;">${this.feesT("messages.processingBalances", {}, "Processing and calculating fee balances...")}</div>`;

    const feesPromises = rawFees.map(async (f) => {
        const feeId = f.fee_id || f.id;
        try {
            const balance = await Api.get(`/payments/fee/${feeId}/balance`);
            f.actual_remaining = balance.remaining_balance !== undefined
                ? balance.remaining_balance
                : (f.amount_due - (f.applied_discount || 0));
            f.actual_paid = balance.total_paid || 0;
        } catch (err) {
            f.actual_remaining = f.amount_due - (f.applied_discount || 0);
            f.actual_paid = 0;
        }

        f.is_paid = f.actual_remaining <= 0;
        f.is_overdue = !f.is_paid && new Date(f.due_date) < new Date();
        return f;
    });

    const fees = await Promise.all(feesPromises);
    window.currentFeesData = fees;

    const totalRemaining = fees.reduce((sum, f) => sum + (f.is_paid ? 0 : f.actual_remaining), 0);
    const overdueCount = fees.filter(f => f.is_overdue).length;

    const statsHeader = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #10b981;">
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">${this.feesT("stats.totalRemaining", {}, "Total Remaining Debt")}</div>
                <div style="font-size: 1.6em; font-weight: bold; color: #0f172a; margin-top: 5px;">${this._formatCurrency(totalRemaining)}</div>
            </div>
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #ef4444;">
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">${this.feesT("stats.overdueCases", {}, "Late Payment Cases")}</div>
                <div style="font-size: 1.6em; font-weight: bold; color: #ef4444; margin-top: 5px;">${overdueCount} <span style="font-size: 0.6em; color: #94a3b8;">${this.feesT("stats.overdueRecord", {}, "late records")}</span></div>
            </div>
            <div style="display: flex; align-items: center; justify-content: flex-end;">
                <button onclick="AdminUI.showFeeModal()" style="background: #0f172a; color: white; border: none; padding: 14px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s; font-size: 1.05em;">
                    ${this.icon("finance", "inline-svg-icon")} ${this.feesT("actions.add", {}, "Add New Fee")}
                </button>
            </div>
        </div>
    `;

    const filterBar = `
        <div class="admin-page-toolbar" style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div class="admin-mobile-stack" style="display: flex; align-items: center; gap: 8px;">
                <label style="font-weight: bold; color: #334155;">${this.feesT("filters.typeLabel", {}, "Type:")}</label>
                <select id="fee-type-filter" onchange="AdminUI.filterFeesFromBackend()" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-weight: bold; outline: none;">
                    <option value="">${this.feesT("filters.all", {}, "All")}</option>
                    <option value="tuition">${this.feeTypeLabel("tuition")}</option>
                    <option value="transport">${this.feeTypeLabel("transport")}</option>
                    <option value="activities">${this.feeTypeLabel("activities")}</option>
                    <option value="exam">${this.feeTypeLabel("exam")}</option>
                </select>
            </div>
            <div class="admin-toolbar-search" style="flex: 1; min-width: 250px;">
                <input type="text" id="fee-search-input" placeholder="${this.feesT("filters.searchPlaceholder", {}, "Quick search by student name or ID...")}" onkeyup="AdminUI.searchFeesLocal(this.value)" style="width: 100%; padding: 10px 15px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-weight: bold; box-sizing: border-box;">
            </div>
            <div class="admin-mobile-stack" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="AdminUI.loadOverdueOnly()" style="background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;">${this.icon("alert", "inline-svg-icon")} ${this.feesT("filters.overdueOnly", {}, "Overdue only")}</button>
                <button onclick="AdminRole.loadSection('studentFees')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;">${this.icon("refresh", "inline-svg-icon")} ${this.feesT("actions.refresh", {}, "Refresh")}</button>
            </div>
        </div>
    `;

    main.innerHTML = `
        ${statsHeader}
        ${filterBar}
        <div id="fees-table-container">
            ${this._generateFeesTableHtml(fees)}
        </div>

        <div id="fee-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px); padding: 18px;">
            <div style="background: white; width: min(500px, 100%); max-height: calc(100vh - 36px); overflow-y: auto; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 id="fee-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("finance", "inline-svg-icon")} ${this.feesT("form.addTitle", {}, "Add New Fee")}
                </h3>

                <input type="hidden" id="modal-fee-id">

                <div id="modal-student-section" style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.feesT("form.studentLabel", {}, "Target Student *")}</label>
                    <div style="position: relative;">
                        <input type="text" id="modal-fee-student-search" placeholder="${this.feesT("form.studentPlaceholder", {}, "Search by student name...")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;" onkeyup="AdminUI.searchStudentForFee(this.value)">
                        <input type="hidden" id="modal-fee-student-id">
                        <div id="modal-fee-student-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10; margin-top: 5px;"></div>
                    </div>
                </div>

                <div id="modal-fee-enrollment-section" style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.feesT("form.enrollmentLabel", {}, "Enrollment / Program *")}</label>
                    <select id="modal-fee-enrollment" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                        <option value="">${this.feesT("form.chooseStudentFirst", {}, "-- Choose the student first --")}</option>
                    </select>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.feesT("form.typeLabel", {}, "Fee Type *")}</label>
                        <select id="modal-fee-type" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                            <option value="tuition">${this.feeTypeLabel("tuition")}</option>
                            <option value="transport">${this.feeTypeLabel("transport")}</option>
                            <option value="activities">${this.feeTypeLabel("activities")}</option>
                            <option value="exam">${this.feeTypeLabel("exam")}</option>
                            <option value="other">${this.feeTypeLabel("other")}</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.feesT("form.dueDateLabel", {}, "Due Date *")}</label>
                        <input type="date" id="modal-fee-due-date" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.feesT("form.amountLabel", {}, "Total Amount (DZD) *")}</label>
                        <input type="number" id="modal-fee-amount" min="0" value="0" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.feesT("form.discountLabel", {}, "Discount / Grant (DZD)")}</label>
                        <input type="number" id="modal-fee-discount" min="0" value="0" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeFeeModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitFee()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">${this.feesT("form.save", {}, "Save Record")}</button>
                </div>
            </div>
        </div>

        <div id="payments-view-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1001; justify-content: center; align-items: center; backdrop-filter: blur(3px); padding: 18px;">
            <div style="background: white; width: min(600px, 100%); max-height: calc(100vh - 36px); display: flex; flex-direction: column; padding: 25px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; gap: 12px;">
                    <h3 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                        ${this.icon("card", "inline-svg-icon")} ${this.feesT("payments.title", {}, "Fee Payment History")}
                    </h3>
                    <button onclick="AdminUI.closePaymentsModal()" style="background: #f1f5f9; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2em; color: #64748b;">&times;</button>
                </div>

                <div class="admin-mobile-table" style="overflow-y: auto; flex: 1; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: right;">
                        <thead style="background: #f8fafc; position: sticky; top: 0;">
                            <tr>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">${this.feesT("payments.transaction", {}, "Transaction #")}</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">${this.feesT("payments.date", {}, "Payment Date")}</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">${this.feesT("payments.amount", {}, "Amount Paid")}</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">${this.feesT("payments.receipt", {}, "Receipt Number")}</th>
                            </tr>
                        </thead>
                        <tbody id="payments-modal-body"></tbody>
                    </table>
                </div>

                <button onclick="AdminUI.closePaymentsModal()" style="width: 100%; background: #0f172a; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.feesT("payments.close", {}, "Close History")}</button>
            </div>
        </div>
    `;

    if (!this._feeOutsideClickBound) {
        document.addEventListener("click", function(e) {
            const dropdown = document.getElementById("modal-fee-student-dropdown");
            const searchInput = document.getElementById("modal-fee-student-search");
            if (dropdown && e.target !== searchInput && e.target !== dropdown && !dropdown.contains(e.target)) {
                dropdown.style.display = "none";
            }
        });
        this._feeOutsideClickBound = true;
    }
};

AdminUI._generateFeesTableHtml = function(fees) {
    if (!fees || fees.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                <span style="display: inline-flex; width: 58px; height: 58px; align-items: center; justify-content: center; color: #64748b; opacity: 0.65;">${this.icon("receipt", "inline-svg-icon")}</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">${this.feesT("table.empty", {}, "No matching financial records.")}</p>
            </div>
        `;
    }

    const rows = fees.map(f => {
        const feeId = f.fee_id || f.id;
        const statusLabel = f.is_paid
            ? this.feesT("status.paid", {}, "Paid in full")
            : (f.is_overdue ? this.feesT("status.overdue", {}, "Overdue") : this.feesT("status.pending", {}, "Pending"));
        const statusColor = f.is_paid ? "#10b981" : (f.is_overdue ? "#ef4444" : "#f59e0b");
        const rowBg = f.is_paid ? "#f0fdf4" : (f.is_overdue ? "#fef2f2" : "transparent");
        const studentLabel = f.student_name || this.feesT("table.studentFallback", { id: f.student_id }, `Student #${f.student_id}`);
        const feeTypeLabel = this.feeTypeLabel(f.fee_type);
        const feeTypeArg = this.feeInlineString(feeTypeLabel);

        return `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${rowBg}; transition: 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${rowBg}'">
                <td style="padding: 15px; font-weight: bold; color: #64748b;">#${feeId}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(studentLabel)}</div>
                    <small style="color: #64748b;">ID: ${f.student_id}</small>
                    <div style="margin-top: 5px; color: #2563eb; font-size: 0.85em; font-weight: bold;">${this._escape(f.program_name || "-")} / ${this._escape(f.class_name || "-")}</div>
                </td>
                <td style="padding: 15px; font-weight: bold; color: #334155;">${this._escape(feeTypeLabel)}</td>
                <td style="padding: 15px; direction: ltr; text-align: right;">
                    <div style="font-weight: bold; color: #0f172a; font-size: 1.1em; ${f.is_paid ? "text-decoration: line-through; opacity:0.5;" : ""}">${this._formatCurrency(f.actual_remaining)}</div>
                    <small style="color: #10b981;">${this.feesT("table.paidAmount", { amount: f.actual_paid }, `Paid: ${f.actual_paid} DZD`)}</small>
                </td>
                <td style="padding: 15px; color: ${f.is_overdue ? "#dc2626" : "#475569"}; font-weight: ${f.is_overdue ? "bold" : "normal"}; direction: ltr; text-align: right;">${this._escape(f.due_date || "-")}</td>
                <td style="padding: 15px;">
                    <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; background: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                        ${statusLabel}
                    </span>
                </td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                    ${!f.is_paid ? `<button onclick="AdminUI.sendFeeReminder(${f.student_id}, ${feeTypeArg})" title="${this.feesT("actions.reminderTitle", {}, "Reminder")}" style="background: ${f.is_overdue ? "#fef2f2" : "#eff6ff"}; color: ${f.is_overdue ? "#dc2626" : "#2563eb"}; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">${this.icon("megaphone", "inline-svg-icon")}</button>` : ""}
                    <button onclick="AdminUI.viewFeePayments(${feeId})" title="${this.feesT("actions.paymentsTitle", {}, "Payment history")}" style="background: #f0fdf4; color: #16a34a; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">${this.icon("card", "inline-svg-icon")}</button>
                    <button onclick="AdminUI.showFeeModal(${this.feeInlineJson(f)})" title="${this.feesT("actions.editTitle", {}, "Edit record")}" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">${this.icon("edit", "inline-svg-icon")}</button>
                    <button onclick="AdminRole.deleteItem('/student-fees', ${feeId}, 'studentFees')" title="${this.t("admin.actions.delete", {}, "Delete")}" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">${this.icon("trash", "inline-svg-icon")}</button>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.95em; color: #475569;">
                ${this.feesT("table.total", { count: fees.length }, `Displayed records: ${fees.length}`)}
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">${this.feesT("table.student", {}, "Student")}</th>
                            <th style="padding: 15px; color: #334155;">${this.feesT("table.feeType", {}, "Fee Type")}</th>
                            <th style="padding: 15px; color: #334155;">${this.feesT("table.remainingAmount", {}, "Remaining Amount")}</th>
                            <th style="padding: 15px; color: #334155;">${this.feesT("table.dueDate", {}, "Due Date")}</th>
                            <th style="padding: 15px; color: #334155;">${this.feesT("table.status", {}, "Status")}</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">${this.feesT("table.actions", {}, "Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

AdminUI.filterFeesFromBackend = async function() {
    const type = document.getElementById("fee-type-filter").value;
    AdminUI.renderLoading();
    try {
        const endpoint = type ? `/student-fees?fee_type=${type}` : "/student-fees";
        const data = await Api.get(endpoint);
        await AdminUI.renderFeesTab(data);
        document.getElementById("fee-type-filter").value = type;
    } catch (err) {
        AdminUI.renderError(this.feesT("messages.filterFailed", { message: err.message }, `Filter failed: ${err.message}`));
    }
};

AdminUI.loadOverdueOnly = async function() {
    AdminUI.renderLoading();
    try {
        const data = await Api.get("/student-fees/overdue");
        await AdminUI.renderFeesTab(data);
    } catch (err) {
        AdminUI.renderError(this.feesT("messages.overdueLoadFailed", { message: err.message }, `Unable to load overdue records: ${err.message}`));
    }
};

AdminUI.searchFeesLocal = function(keyword) {
    const normalizedKeyword = keyword.toLowerCase().trim();
    const allFees = window.currentFeesData || [];
    const filtered = allFees.filter(f => {
        const studentName = String(f.student_name || "").toLowerCase();
        const studentId = String(f.student_id || "");
        return studentName.includes(normalizedKeyword) || studentId.includes(normalizedKeyword);
    });
    document.getElementById("fees-table-container").innerHTML = this._generateFeesTableHtml(filtered);
};

AdminUI.showFeeModal = function(feeData = null) {
    const modal = document.getElementById("fee-modal");
    const title = document.getElementById("fee-modal-title");
    const studentSection = document.getElementById("modal-student-section");
    const enrollmentSection = document.getElementById("modal-fee-enrollment-section");

    document.getElementById("modal-fee-id").value = "";
    document.getElementById("modal-fee-student-id").value = "";
    document.getElementById("modal-fee-student-search").value = "";
    document.getElementById("modal-fee-enrollment").innerHTML = `<option value="">${this.feesT("form.chooseStudentFirst", {}, "-- Choose the student first --")}</option>`;
    document.getElementById("modal-fee-type").value = "tuition";
    document.getElementById("modal-fee-amount").value = "0";
    document.getElementById("modal-fee-discount").value = "0";
    document.getElementById("modal-fee-due-date").value = new Date().toISOString().split("T")[0];

    if (feeData) {
        title.innerHTML = `${this.icon("edit", "inline-svg-icon")} ${this.feesT("form.editTitle", {}, "Edit Fee")}`;
        document.getElementById("modal-fee-id").value = feeData.fee_id || feeData.id;
        document.getElementById("modal-fee-type").value = feeData.fee_type || "tuition";
        document.getElementById("modal-fee-amount").value = feeData.amount_due || 0;
        document.getElementById("modal-fee-discount").value = feeData.applied_discount || 0;
        if (feeData.due_date) document.getElementById("modal-fee-due-date").value = feeData.due_date;
        studentSection.style.display = "none";
        enrollmentSection.style.display = "none";
    } else {
        title.innerHTML = `${this.icon("finance", "inline-svg-icon")} ${this.feesT("form.addTitle", {}, "Add New Fee")}`;
        studentSection.style.display = "block";
        enrollmentSection.style.display = "block";
    }

    modal.style.display = "flex";
};

AdminUI.closeFeeModal = function() {
    document.getElementById("fee-modal").style.display = "none";
};

AdminUI.submitFee = async function() {
    const id = document.getElementById("modal-fee-id").value;
    const studentId = document.getElementById("modal-fee-student-id").value;
    const enrollmentId = document.getElementById("modal-fee-enrollment").value;
    const type = document.getElementById("modal-fee-type").value;
    const amount = parseInt(document.getElementById("modal-fee-amount").value) || 0;
    const discount = parseInt(document.getElementById("modal-fee-discount").value) || 0;
    const dueDate = document.getElementById("modal-fee-due-date").value;

    if (!id && !studentId) {
        this.showToast(this.feesT("messages.chooseStudentFirst", {}, "Please choose the student first."), "error");
        return;
    }
    if (!id && !enrollmentId) {
        this.showToast(this.feesT("messages.chooseEnrollment", {}, "Please choose the student's program enrollment."), "error");
        return;
    }
    if (amount <= 0) {
        this.showToast(this.feesT("messages.amountRequired", {}, "Please enter a valid amount greater than zero."), "error");
        return;
    }

    try {
        if (id) {
            await Api.put(`/student-fees/${id}`, {
                fee_type: type,
                amount_due: amount,
                applied_discount: discount,
                due_date: dueDate || null
            });
            this.showToast(this.feesT("messages.updated", {}, "Updated successfully."));
        } else {
            await Api.post("/student-fees/", {
                student_id: parseInt(studentId),
                enrollment_id: parseInt(enrollmentId),
                fee_type: type,
                amount_due: amount,
                applied_discount: discount,
                due_date: dueDate || null
            });
            this.showToast(this.feesT("messages.created", {}, "Fee added successfully."));
        }
        this.closeFeeModal();
        AdminRole.loadSection("studentFees");
    } catch (err) {
        this.showToast(this.feesT("messages.saveFailed", { message: err.message }, `Save failed: ${err.message}`), "error");
    }
};

AdminUI.searchStudentForFee = async function(keyword) {
    const dropdown = document.getElementById("modal-fee-student-dropdown");

    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/students/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const students = response?.data?.data || response?.data || response || [];

        if (students.length === 0) {
            dropdown.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center;">${this.feesT("search.noResults", {}, "No results")}</div>`;
        } else {
            dropdown.innerHTML = students.map(s => {
                const name = s.full_name || s.student_name || "";
                return `
                    <div onclick="AdminUI.selectStudentForFee(${s.student_id || s.id}, ${this.feeInlineString(name)})"
                         style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s;"
                         onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <strong style="color: #0f172a;">${this._escape(name)}</strong>
                        <small style="color: #64748b; float: left;">${this.feesT("search.idLabel", { id: s.student_id || s.id }, `ID: ${s.student_id || s.id}`)}</small>
                    </div>
                `;
            }).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error(this.feesT("messages.searchFailed", {}, "Search failed:"), err);
    }
};

AdminUI.selectStudentForFee = function(id, name) {
    document.getElementById("modal-fee-student-search").value = name;
    document.getElementById("modal-fee-student-id").value = id;
    document.getElementById("modal-fee-student-dropdown").style.display = "none";
    this.loadFeeEnrollmentsForStudent(id);
};

AdminUI.loadFeeEnrollmentsForStudent = async function(studentId) {
    const select = document.getElementById("modal-fee-enrollment");
    if (!select) return;

    select.innerHTML = `<option value="">${this.feesT("form.loadingEnrollments", {}, "Loading enrollments...")}</option>`;

    try {
        const response = await Api.get(`/enrollments/student/${studentId}`);
        const enrollments = response.data || response || [];
        const activeEnrollments = enrollments.filter(e => !e.status || e.status === "active");

        if (activeEnrollments.length === 0) {
            select.innerHTML = `<option value="">${this.feesT("form.noActiveEnrollments", {}, "This student has no active enrollments")}</option>`;
            return;
        }

        select.innerHTML = `<option value="">${this.feesT("form.chooseEnrollment", {}, "-- Choose enrollment --")}</option>` +
            activeEnrollments.map(e => {
                const classLabel = e.class_name ? ` - ${e.class_name}` : "";
                const label = (e.program_name || this.feesT("form.programFallback", {}, "Program")) + classLabel;
                return `<option value="${e.enrollment_id || e.id}">${this._escape(label)}</option>`;
            }).join("");
    } catch (err) {
        select.innerHTML = `<option value="">${this.feesT("form.enrollmentsLoadFailed", {}, "Unable to load enrollments")}</option>`;
    }
};

AdminUI.sendFeeReminder = async function(studentId, feeType) {
    try {
        await Api.post("/notifications/", {
            user_id: studentId,
            title: this.feesT("reminder.title", {}, "Fee Payment Reminder"),
            message: this.feesT("reminder.message", { feeType }, "Dear student, you have a due fee awaiting payment.")
        });
        this.showToast(this.feesT("messages.reminderSent", {}, "Reminder notification sent successfully."));
    } catch (err) {
        this.showToast(this.feesT("messages.reminderFailed", {}, "Failed to send reminder notification."), "error");
    }
};

AdminUI.viewFeePayments = async function(feeId) {
    const modal = document.getElementById("payments-view-modal");
    const tbody = document.getElementById("payments-modal-body");

    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #64748b; font-weight: bold;">${this.feesT("payments.loading", {}, "Fetching payments...")}</td></tr>`;
    modal.style.display = "flex";

    try {
        const response = await Api.get(`/payments/fee/${feeId}`);
        const payments = response.data || response || [];

        if (payments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px;"><span style="display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; color: #64748b; opacity: 0.45;">${this.icon("chart", "inline-svg-icon")}</span><p style="color: #64748b; font-size: 1.1em; margin-top: 10px;">${this.feesT("payments.empty", {}, "No payments have been recorded for this fee.")}</p></td></tr>`;
            return;
        }

        tbody.innerHTML = payments.map(p => `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px 15px; font-weight: bold; color: #64748b;">#${p.payment_id || p.id}</td>
                <td style="padding: 12px 15px; direction: ltr; text-align: right; color: #475569; font-weight: bold;">${this._escape(p.payment_date || "-")}</td>
                <td style="padding: 12px 15px; font-weight: bold; color: #16a34a; direction: ltr; text-align: right;">${this._formatCurrency(p.amount_paid)}</td>
                <td style="padding: 12px 15px;"><span style="background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 0.9em; font-weight: bold; border: 1px solid #cbd5e1;">${this._escape(p.receipt_number || this.feesT("payments.noReceipt", {}, "No receipt"))}</span></td>
            </tr>
        `).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px; background: #fef2f2; color: #dc2626; font-weight: bold;">${this.feesT("payments.loadFailed", { message: err.message }, `Failed to fetch payment history: ${err.message}`)}</td></tr>`;
    }
};

AdminUI.closePaymentsModal = function() {
    document.getElementById("payments-view-modal").style.display = "none";
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

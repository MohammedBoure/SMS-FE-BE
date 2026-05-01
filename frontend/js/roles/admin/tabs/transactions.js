// frontend/js/roles/admin/tabs/transactions.js

AdminUI.transactionsT = function(key, params = {}, fallback = "") {
    return this.t(`admin.transactionsTab.${key}`, params, fallback);
};

AdminUI.transactionTypeLabel = function(type) {
    const labels = {
        payment: this.transactionsT("types.payment", {}, "Fee Payment"),
        refund: this.transactionsT("types.refund", {}, "Refund"),
        transfer: this.transactionsT("types.transfer", {}, "Transfer"),
        adjustment: this.transactionsT("types.adjustment", {}, "Adjustment"),
        salary: this.transactionsT("types.salary", {}, "Salary")
    };
    return labels[type] || type || "-";
};

AdminUI.transactionStatusMeta = function(status) {
    const labels = {
        completed: this.transactionsT("statuses.completed", {}, "Completed"),
        pending: this.transactionsT("statuses.pending", {}, "Pending"),
        failed: this.transactionsT("statuses.failed", {}, "Failed"),
        cancelled: this.transactionsT("statuses.cancelled", {}, "Cancelled")
    };
    const styles = {
        completed: { bg: "#dcfce7", text: "#166534", icon: "check" },
        pending: { bg: "#fef3c7", text: "#b45309", icon: "clock" },
        failed: { bg: "#fef2f2", text: "#991b1b", icon: "ban" },
        cancelled: { bg: "#f1f5f9", text: "#475569", icon: "ban" }
    };
    return { ...(styles[status] || styles.pending), label: labels[status] || status || "-" };
};

AdminUI.transactionStringArg = function(value) {
    return JSON.stringify(String(value || "")).replace(/'/g, "&#39;");
};

AdminUI.renderTransactionsTab = function(response) {
    const main = this.prepareMain(this.t("admin.sections.transactions", {}, "Transactions and Daily Ledger"));
    const source = response && response.data !== undefined ? response.data : response;
    const transactions = Array.isArray(source) ? source : [];

    const completedVolume = transactions
        .filter(transaction => transaction.status === "completed")
        .reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0);
    const pendingCount = transactions.filter(transaction => transaction.status === "pending").length;

    const headerHtml = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: var(--admin-surface); padding: 22px; border-radius: 12px; box-shadow: var(--admin-shadow-soft); border-inline-start: 5px solid #8b5cf6; flex-wrap: wrap; gap: 15px;">
            <div class="admin-mobile-stack" style="display: flex; gap: 30px; flex-wrap: wrap;">
                <div>
                    <div style="color: var(--text-muted); font-size: 0.9em; margin-bottom: 5px; font-weight: bold;">${this.transactionsT("summary.completedVolume", {}, "Completed Transfer Volume")}</div>
                    <div style="font-size: 1.8em; font-weight: bold; color: #6d28d9;">${this._formatCurrency(completedVolume)}</div>
                </div>
                <div>
                    <div style="color: var(--text-muted); font-size: 0.9em; margin-bottom: 5px; font-weight: bold;">${this.transactionsT("summary.pendingOperations", {}, "Pending Operations")}</div>
                    <div style="font-size: 1.8em; font-weight: bold; color: #f59e0b;">${pendingCount}</div>
                </div>
            </div>
            <div class="admin-mobile-stack" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="AdminUI.showUserStatementModal()" style="background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; padding: 12px 18px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">
                    ${this.icon("receipt", "inline-svg-icon")} ${this.transactionsT("actions.statement", {}, "Statement")}
                </button>
                <button onclick="AdminUI.showAddTransactionModal()" style="background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s;">
                    ${this.icon("finance", "inline-svg-icon")} ${this.transactionsT("actions.newTransfer", {}, "New Transfer")}
                </button>
            </div>
        </div>
    `;

    const filterHtml = `
        <div class="admin-page-toolbar" style="background: var(--admin-surface); padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 15px; align-items: center; border: 1px solid var(--admin-border); flex-wrap: wrap;">
            <div class="admin-mobile-stack" style="display: flex; align-items: center; gap: 8px; flex: 1; flex-wrap: wrap;">
                <label style="font-weight: bold; color: var(--text-main);">${this.transactionsT("filters.label", {}, "Filter:")}</label>
                <select id="transaction-type-filter" onchange="AdminUI.filterTransactions()" style="padding: 10px; border: 1px solid var(--admin-border); border-radius: 8px; background: var(--admin-surface-soft); font-weight: bold; outline: none; min-width: 180px;">
                    <option value="">${this.transactionsT("filters.allTypes", {}, "-- All Types --")}</option>
                    <option value="payment">${this.transactionsT("types.payment", {}, "Fee Payment")}</option>
                    <option value="refund">${this.transactionsT("types.refund", {}, "Refund")}</option>
                    <option value="transfer">${this.transactionsT("types.transfer", {}, "Internal Transfer")}</option>
                    <option value="adjustment">${this.transactionsT("types.adjustment", {}, "Adjustment")}</option>
                    <option value="salary">${this.transactionsT("types.salary", {}, "Salary")}</option>
                </select>
                <select id="transaction-status-filter" onchange="AdminUI.filterTransactions()" style="padding: 10px; border: 1px solid var(--admin-border); border-radius: 8px; background: var(--admin-surface-soft); font-weight: bold; outline: none; min-width: 150px;">
                    <option value="">${this.transactionsT("filters.allStatuses", {}, "-- All Statuses --")}</option>
                    <option value="completed">${this.transactionsT("filters.completedOnly", {}, "Completed only")}</option>
                    <option value="pending">${this.transactionsT("filters.pendingOnly", {}, "Pending only")}</option>
                    <option value="cancelled">${this.transactionsT("filters.cancelledOnly", {}, "Cancelled only")}</option>
                </select>
            </div>
            <button onclick="AdminRole.loadSection('transactions')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px;">${this.icon("refresh", "inline-svg-icon")} ${this.transactionsT("actions.refreshTable", {}, "Refresh Table")}</button>
        </div>
    `;

    const tableHtml = this._generateTransactionsTableHtml(transactions);
    const modalsHtml = this._generateTransactionsModalsHtml();

    main.innerHTML = headerHtml + filterHtml + tableHtml + `<div id="statement-container" style="margin-top: 30px;"></div>` + modalsHtml;

    document.addEventListener("click", function(event) {
        if (!event.target.closest("#trans-add-modal") && !event.target.closest("#trans-statement-modal")) return;
        ["from", "to", "statement"].forEach(type => {
            const prefix = type === "statement" ? "modal-statement" : `modal-trans-${type}`;
            const dropdown = document.getElementById(`${prefix}-dropdown`);
            const input = document.getElementById(`${prefix}-search`);
            if (dropdown && event.target !== input && event.target !== dropdown) dropdown.style.display = "none";
        });
    });
};

AdminUI._generateTransactionsTableHtml = function(transactions) {
    if (!transactions.length) {
        return `
            <div style="text-align: center; padding: 50px; background: var(--admin-surface); border-radius: 12px; border: 1px solid var(--admin-border);">
                <span style="display: inline-flex; opacity: 0.55;">${this.icon("finance", "inline-svg-icon")}</span>
                <p style="color: var(--text-muted); font-size: 1.1em; margin-top: 15px;">${this.transactionsT("table.empty", {}, "No matching financial transfers.")}</p>
            </div>
        `;
    }

    const rows = transactions.map(transaction => {
        const id = transaction.transaction_id || transaction.id;
        const status = this.transactionStatusMeta(transaction.status);
        const fromName = transaction.from_user_name || this.transactionsT("table.userFallback", { id: transaction.from_user_id }, `User #${transaction.from_user_id}`);
        const toName = transaction.to_user_name || this.transactionsT("table.userFallback", { id: transaction.to_user_id }, `User #${transaction.to_user_id}`);

        return `
            <tr style="border-bottom: 1px solid var(--admin-border); transition: 0.2s; opacity: ${transaction.status === "cancelled" ? "0.65" : "1"};">
                <td data-label="${this.transactionsT("table.transactionNumber", {}, "Transaction Number")}" style="padding: 15px; font-weight: bold; color: var(--text-muted);">#${id}</td>
                <td data-label="${this.transactionsT("table.transferParties", {}, "Transfer Parties")}" style="padding: 15px;">
                    <div style="color: var(--text-muted); font-size: 0.85em; display: flex; align-items: center; gap: 5px;">
                        <span style="color: #ef4444;">${this.transactionsT("table.from", {}, "From:")}</span>
                        <strong style="color: var(--text-main);">${this._escape(fromName)}</strong>
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.85em; display: flex; align-items: center; gap: 5px; margin-top: 4px;">
                        <span style="color: #10b981;">${this.transactionsT("table.to", {}, "To:")}</span>
                        <strong style="color: var(--text-main);">${this._escape(toName)}</strong>
                    </div>
                </td>
                <td data-label="${this.transactionsT("table.amount", {}, "Amount")}" style="padding: 15px; font-weight: bold; color: #8b5cf6; font-size: 1.1em; direction: ltr; text-align: right;">
                    ${this._formatCurrency(transaction.amount)}
                </td>
                <td data-label="${this.transactionsT("table.type", {}, "Type")}" style="padding: 15px;">
                    <span style="background: var(--admin-surface-soft); border: 1px solid var(--admin-border); padding: 4px 10px; border-radius: 6px; font-size: 0.85em; font-weight: bold; color: var(--text-main);">
                        ${this._escape(this.transactionTypeLabel(transaction.transaction_type))}
                    </span>
                </td>
                <td data-label="${this.transactionsT("table.notes", {}, "Notes")}" style="padding: 15px; color: var(--text-muted); font-size: 0.9em;">
                    ${this._escape(transaction.notes || "-")}
                </td>
                <td data-label="${this.transactionsT("table.status", {}, "Status")}" style="padding: 15px;">
                    <span style="background: ${status.bg}; color: ${status.text}; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;">
                        ${this.icon(status.icon, "inline-svg-icon")} ${status.label}
                    </span>
                </td>
                <td class="admin-actions-cell" data-label="${this.transactionsT("table.actions", {}, "Actions")}" style="padding: 15px; text-align: left;">
                    <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
                        <button onclick="AdminUI.showStatusModal(${id}, '${transaction.status}')" title="${this.transactionsT("actions.changeStatus", {}, "Change Status")}" style="background: #fffbeb; color: #d97706; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">${this.icon("refresh", "inline-svg-icon")} ${this.transactionsT("table.status", {}, "Status")}</button>
                        <button onclick="AdminRole.deleteItem('/transactions', ${id}, 'transactions')" title="${this.t("admin.actions.delete", {}, "Delete")}" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center;">${this.icon("trash", "inline-svg-icon")}</button>
                    </div>
                </td>
            </tr>`;
    }).join("");

    return `
        <div class="admin-mobile-table" style="background: var(--admin-surface); border-radius: 12px; box-shadow: var(--admin-shadow-soft); overflow: hidden; border: 1px solid var(--admin-border);">
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
                <thead style="background: var(--admin-surface-soft); border-bottom: 2px solid var(--admin-border);">
                    <tr>
                        <th style="padding: 15px; color: var(--text-main);">${this.transactionsT("table.transactionNumber", {}, "Transaction Number")}</th>
                        <th style="padding: 15px; color: var(--text-main);">${this.transactionsT("table.transferParties", {}, "Transfer Parties")}</th>
                        <th style="padding: 15px; color: var(--text-main);">${this.transactionsT("table.amount", {}, "Amount")}</th>
                        <th style="padding: 15px; color: var(--text-main);">${this.transactionsT("table.type", {}, "Type")}</th>
                        <th style="padding: 15px; color: var(--text-main);">${this.transactionsT("table.notes", {}, "Notes")}</th>
                        <th style="padding: 15px; color: var(--text-main);">${this.transactionsT("table.status", {}, "Status")}</th>
                        <th style="padding: 15px; text-align: left; color: var(--text-main);">${this.transactionsT("table.actions", {}, "Actions")}</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
};

AdminUI._generateTransactionsModalsHtml = function() {
    return `
        <div id="trans-add-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px); padding: 16px;">
            <div style="background: var(--admin-surface); width: min(580px, 100%); padding: 30px; border-radius: 12px; box-shadow: var(--admin-shadow); max-height: 90vh; overflow-y: auto;">
                <h3 style="margin-top: 0; color: var(--text-main); border-bottom: 2px solid var(--admin-border); padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("finance", "inline-svg-icon")} ${this.transactionsT("modal.addTitle", {}, "Record New Financial Transfer")}
                </h3>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-top: 20px;">
                    <div style="position: relative;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #ef4444;">${this.transactionsT("modal.fromLabel", {}, "Sender (From) *")}</label>
                        <input type="text" id="modal-trans-from-search" placeholder="${this.transactionsT("modal.userSearchPlaceholder", {}, "Search by username...")}" style="width: 100%; padding: 12px; border: 1px solid var(--admin-border); border-radius: 8px; outline: none; box-sizing: border-box;" onkeyup="AdminUI.searchUserForTrans(this.value, 'from')">
                        <input type="hidden" id="modal-trans-from-id">
                        <div id="modal-trans-from-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 8px; box-shadow: var(--admin-shadow-soft); max-height: 150px; overflow-y: auto; z-index: 10;"></div>
                    </div>

                    <div style="position: relative;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #10b981;">${this.transactionsT("modal.toLabel", {}, "Receiver (To) *")}</label>
                        <input type="text" id="modal-trans-to-search" placeholder="${this.transactionsT("modal.userSearchPlaceholder", {}, "Search by username...")}" style="width: 100%; padding: 12px; border: 1px solid var(--admin-border); border-radius: 8px; outline: none; box-sizing: border-box;" onkeyup="AdminUI.searchUserForTrans(this.value, 'to')">
                        <input type="hidden" id="modal-trans-to-id">
                        <div id="modal-trans-to-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 8px; box-shadow: var(--admin-shadow-soft); max-height: 150px; overflow-y: auto; z-index: 10;"></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: var(--text-main);">${this.transactionsT("modal.amountLabel", {}, "Amount (DZD) *")}</label>
                        <input type="number" id="modal-trans-amount" min="1" style="width: 100%; padding: 12px; border: 1px solid var(--admin-border); border-radius: 8px; outline: none; box-sizing: border-box; font-weight: bold;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: var(--text-main);">${this.transactionsT("modal.typeLabel", {}, "Operation Type *")}</label>
                        <select id="modal-trans-type" style="width: 100%; padding: 12px; border: 1px solid var(--admin-border); border-radius: 8px; outline: none; background: var(--admin-surface-soft);">
                            <option value="transfer">${this.transactionsT("types.transfer", {}, "Internal Transfer")}</option>
                            <option value="payment">${this.transactionsT("types.payment", {}, "Fee Payment")}</option>
                            <option value="refund">${this.transactionsT("types.refund", {}, "Refund")}</option>
                            <option value="adjustment">${this.transactionsT("types.adjustment", {}, "Adjustment")}</option>
                            <option value="salary">${this.transactionsT("types.salary", {}, "Salary")}</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: var(--text-main);">${this.transactionsT("modal.notesLabel", {}, "Notes / Operation Statement")}</label>
                    <input type="text" id="modal-trans-notes" placeholder="${this.transactionsT("modal.notesPlaceholder", {}, "Write the transfer reason...")}" style="width: 100%; padding: 12px; border: 1px solid var(--admin-border); border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeTransModals()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitTransaction()" style="padding: 12px 20px; border: none; background: #8b5cf6; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(139,92,246,0.2);">${this.transactionsT("modal.execute", {}, "Execute Transfer")}</button>
                </div>
            </div>
        </div>

        <div id="trans-status-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px); padding: 16px;">
            <div style="background: var(--admin-surface); width: min(420px, 100%); padding: 30px; border-radius: 12px; box-shadow: var(--admin-shadow);">
                <h3 style="margin-top: 0; color: var(--text-main); border-bottom: 2px solid var(--admin-border); padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">${this.icon("refresh", "inline-svg-icon")} ${this.transactionsT("modal.statusTitle", {}, "Change Transfer Status")}</h3>

                <input type="hidden" id="modal-status-trans-id">

                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: var(--text-main);">${this.transactionsT("modal.newStatusLabel", {}, "New Status:")}</label>
                    <select id="modal-status-select" style="width: 100%; padding: 12px; border: 1px solid var(--admin-border); border-radius: 8px; outline: none; background: var(--admin-surface-soft); font-weight: bold;">
                        <option value="completed">${this.transactionsT("statuses.completed", {}, "Completed")}</option>
                        <option value="pending">${this.transactionsT("statuses.pending", {}, "Pending")}</option>
                        <option value="cancelled">${this.transactionsT("statuses.cancelled", {}, "Cancelled")}</option>
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: var(--text-main);">${this.transactionsT("modal.statusNotesLabel", {}, "Reason for change (optional):")}</label>
                    <input type="text" id="modal-status-notes" placeholder="${this.transactionsT("modal.statusNotesPlaceholder", {}, "Short note...")}" style="width: 100%; padding: 12px; border: 1px solid var(--admin-border); border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeTransModals()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitStatusUpdate()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.transactionsT("modal.updateStatus", {}, "Update Status")}</button>
                </div>
            </div>
        </div>

        <div id="trans-statement-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px); padding: 16px;">
            <div style="background: var(--admin-surface); width: min(470px, 100%); padding: 30px; border-radius: 12px; box-shadow: var(--admin-shadow);">
                <h3 style="margin-top: 0; color: var(--text-main); border-bottom: 2px solid var(--admin-border); padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">${this.icon("receipt", "inline-svg-icon")} ${this.transactionsT("modal.statementTitle", {}, "Extract Account Statement")}</h3>

                <div style="margin-top: 20px; position: relative;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: var(--text-main);">${this.transactionsT("modal.statementSearchLabel", {}, "Search for user *")}</label>
                    <input type="text" id="modal-statement-search" placeholder="${this.transactionsT("modal.statementPlaceholder", {}, "Student or staff name...")}" style="width: 100%; padding: 12px; border: 1px solid var(--admin-border); border-radius: 8px; outline: none; box-sizing: border-box;" onkeyup="AdminUI.searchUserForTrans(this.value, 'statement')">
                    <input type="hidden" id="modal-statement-id">
                    <div id="modal-statement-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 8px; box-shadow: var(--admin-shadow-soft); max-height: 150px; overflow-y: auto; z-index: 10;"></div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeTransModals()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.generateStatement()" style="padding: 12px 20px; border: none; background: #0f172a; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.transactionsT("modal.extractStatement", {}, "Extract Statement")}</button>
                </div>
            </div>
        </div>
    `;
};

AdminUI.filterTransactions = async function() {
    const type = document.getElementById("transaction-type-filter").value;
    const status = document.getElementById("transaction-status-filter").value;
    this.renderLoading();
    try {
        let endpoint = "/transactions/?";
        if (type) endpoint += `transaction_type=${type}&`;
        if (status) endpoint += `status=${status}&`;

        const data = await Api.get(endpoint);
        this.renderTransactionsTab(data);

        setTimeout(() => {
            const typeSelect = document.getElementById("transaction-type-filter");
            const statusSelect = document.getElementById("transaction-status-filter");
            if (typeSelect) typeSelect.value = type;
            if (statusSelect) statusSelect.value = status;
        }, 100);
    } catch (err) {
        this.renderError(this.transactionsT("messages.filterFailed", { message: err.message }, `Filter failed: ${err.message}`));
    }
};

AdminUI.searchUserForTrans = async function(keyword, targetType) {
    const prefix = targetType === "statement" ? "modal-statement" : `modal-trans-${targetType}`;
    const dropdown = document.getElementById(`${prefix}-dropdown`);

    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const users = response.data || [];

        if (!users.length) {
            dropdown.innerHTML = `<div style="padding: 10px; color: var(--text-muted); text-align: center;">${this.transactionsT("search.noResults", {}, "No results")}</div>`;
        } else {
            dropdown.innerHTML = users.map(user => {
                const name = user.full_name || "-";
                return `
                    <div onclick='AdminUI.selectUserForTrans(${user.id}, ${this.transactionStringArg(name)}, "${targetType}")'
                         style="padding: 10px 15px; border-bottom: 1px solid var(--admin-border); cursor: pointer; transition: 0.2s;"
                         onmouseover="this.style.background='var(--admin-surface-soft)'" onmouseout="this.style.background='transparent'">
                        <strong style="color: var(--text-main);">${this._escape(name)}</strong>
                        <small style="color: var(--text-muted); float: left;">(${this._escape(user.role_name || "-")})</small>
                    </div>
                `;
            }).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error(this.transactionsT("messages.searchFailed", {}, "Search failed:"), err);
    }
};

AdminUI.selectUserForTrans = function(id, name, targetType) {
    const prefix = targetType === "statement" ? "modal-statement" : `modal-trans-${targetType}`;
    document.getElementById(`${prefix}-search`).value = name;
    document.getElementById(`${prefix}-id`).value = id;
    document.getElementById(`${prefix}-dropdown`).style.display = "none";
};

AdminUI.closeTransModals = function() {
    ["trans-add-modal", "trans-status-modal", "trans-statement-modal"].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = "none";
    });
};

AdminUI.showAddTransactionModal = function() {
    document.getElementById("modal-trans-from-id").value = "";
    document.getElementById("modal-trans-from-search").value = "";
    document.getElementById("modal-trans-to-id").value = "";
    document.getElementById("modal-trans-to-search").value = "";
    document.getElementById("modal-trans-amount").value = "";
    document.getElementById("modal-trans-notes").value = "";
    document.getElementById("modal-trans-type").value = "transfer";
    document.getElementById("trans-add-modal").style.display = "flex";
};

AdminUI.submitTransaction = async function() {
    const fromId = document.getElementById("modal-trans-from-id").value;
    const toId = document.getElementById("modal-trans-to-id").value;
    const amount = parseFloat(document.getElementById("modal-trans-amount").value);
    const type = document.getElementById("modal-trans-type").value;
    const notes = document.getElementById("modal-trans-notes").value;

    if (!fromId || !toId || isNaN(amount) || amount <= 0) {
        this.showToast(this.transactionsT("messages.requiredTransfer", {}, "Please fill all fields and enter a valid amount."), "error");
        return;
    }

    try {
        await Api.post("/transactions/", {
            from_user_id: parseInt(fromId, 10),
            to_user_id: parseInt(toId, 10),
            amount,
            transaction_type: type,
            notes: notes || null,
            status: "completed"
        });
        this.showToast(this.transactionsT("messages.transferCreated", {}, "Financial transfer recorded successfully."));
        this.closeTransModals();
        AdminRole.loadSection("transactions");
    } catch (err) {
        this.showToast(this.transactionsT("messages.transferFailed", { message: err.message }, `Transfer execution failed: ${err.message}`), "error");
    }
};

AdminUI.showStatusModal = function(transId, currentStatus) {
    document.getElementById("modal-status-trans-id").value = transId;
    document.getElementById("modal-status-select").value = currentStatus;
    document.getElementById("modal-status-notes").value = "";
    document.getElementById("trans-status-modal").style.display = "flex";
};

AdminUI.submitStatusUpdate = async function() {
    const transId = document.getElementById("modal-status-trans-id").value;
    const newStatus = document.getElementById("modal-status-select").value;
    const notes = document.getElementById("modal-status-notes").value;

    try {
        await Api.patch(`/transactions/${transId}/status`, {
            status: newStatus,
            notes: notes || null
        });
        this.showToast(this.transactionsT("messages.statusUpdated", {}, "Transfer status updated."));
        this.closeTransModals();
        AdminRole.loadSection("transactions");
    } catch (err) {
        this.showToast(this.transactionsT("messages.statusFailed", { message: err.message }, `Failed to update status: ${err.message}`), "error");
    }
};

AdminUI.showUserStatementModal = function() {
    document.getElementById("modal-statement-id").value = "";
    document.getElementById("modal-statement-search").value = "";
    document.getElementById("trans-statement-modal").style.display = "flex";
};

AdminUI.generateStatement = async function() {
    const userId = document.getElementById("modal-statement-id").value;
    const userName = document.getElementById("modal-statement-search").value;

    if (!userId) {
        this.showToast(this.transactionsT("messages.selectUserFirst", {}, "Please select the user first."), "error");
        return;
    }

    this.closeTransModals();
    const container = document.getElementById("statement-container");
    container.innerHTML = `<div style="text-align:center; padding:30px; font-weight: bold; color: var(--text-muted);">${this.transactionsT("messages.loadingStatement", {}, "Fetching and analyzing financial data...")}</div>`;

    try {
        const statementResponse = await Api.get(`/transactions/statement/${userId}`);
        const statementSource = statementResponse && statementResponse.data !== undefined ? statementResponse.data : statementResponse;
        const records = Array.isArray(statementSource) ? statementSource : [];

        if (!records || !records.length) {
            container.innerHTML = `
                <div style="background: var(--admin-surface); border-radius: 12px; padding: 30px; text-align: center; border: 1px solid var(--admin-border);">
                    <h3 style="color: var(--text-main); margin-top: 0; display: inline-flex; align-items: center; gap: 8px;">${this.icon("receipt", "inline-svg-icon")} ${this.transactionsT("statement.titleWithUser", { user: this._escape(userName) }, `Account Statement: ${this._escape(userName)}`)}</h3>
                    <p style="color: var(--text-muted); font-size: 1.1em;">${this.transactionsT("statement.emptyForUser", {}, "No financial movements are recorded for this user.")}</p>
                    <button onclick="document.getElementById('statement-container').innerHTML=''" style="margin-top: 15px; background: #f1f5f9; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.close", {}, "Close")}</button>
                </div>`;
            return;
        }

        let totalBalance = 0;
        records.forEach(record => {
            if (record.status === "completed") {
                if (record.flow_direction === "IN") totalBalance += parseFloat(record.amount);
                else totalBalance -= parseFloat(record.amount);
            }
        });

        const rows = records.map(record => {
            const isCredit = record.flow_direction === "IN";
            const sign = isCredit ? "+" : "-";
            const color = record.status !== "completed" ? "#94a3b8" : (isCredit ? "#16a34a" : "#dc2626");
            const otherParty = isCredit ? record.from_user_name : record.to_user_name;

            return `
                <tr style="border-bottom: 1px solid var(--admin-border); opacity: ${record.status !== "completed" ? "0.65" : "1"};">
                    <td data-label="${this.transactionsT("statement.date", {}, "Date")}" style="padding: 12px;">${record.created_at ? record.created_at.slice(0, 10) : "-"}</td>
                    <td data-label="${this.transactionsT("statement.type", {}, "Type")}" style="padding: 12px; font-weight: bold;">
                        ${this._escape(this.transactionTypeLabel(record.transaction_type))}
                        ${record.status !== "completed" ? `<small style="display:block; color:#b45309;">(${this._escape(this.transactionStatusMeta(record.status).label)})</small>` : ""}
                    </td>
                    <td data-label="${this.transactionsT("statement.otherParty", {}, "Other Party")}" style="padding: 12px; color: var(--text-muted);">${isCredit ? this.transactionsT("table.from", {}, "From:") : this.transactionsT("table.to", {}, "To:")} <strong>${this._escape(otherParty || "-")}</strong></td>
                    <td data-label="${this.transactionsT("statement.amount", {}, "Amount")}" style="padding: 12px; font-weight: bold; color: ${color}; direction: ltr; text-align: right; font-size: 1.1em;">
                        ${sign} ${this._formatCurrency(record.amount)}
                    </td>
                </tr>
            `;
        }).join("");

        container.innerHTML = `
            <div style="background: var(--admin-surface); border-radius: 12px; padding: 25px; box-shadow: var(--admin-shadow-soft); border: 1px solid var(--admin-border); border-top: 5px solid #0f172a;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid var(--admin-border); padding-bottom: 15px; gap: 16px; flex-wrap: wrap;">
                    <div>
                        <h3 style="margin: 0; color: var(--text-main); display: flex; align-items: center; gap: 8px;">${this.icon("receipt", "inline-svg-icon")} ${this.transactionsT("statement.detailedTitle", {}, "Detailed Financial Statement")}</h3>
                        <p style="margin: 8px 0 0 0; color: var(--text-muted); font-size: 1.1em;">${this.transactionsT("statement.user", {}, "User:")} <strong>${this._escape(userName)}</strong> (ID: ${userId})</p>
                    </div>
                    <div style="text-align: left; background: var(--admin-surface-soft); padding: 15px; border-radius: 8px; border: 1px solid var(--admin-border);">
                        <div style="color: var(--text-muted); font-size: 0.85em; font-weight: bold;">${this.transactionsT("statement.netBalance", {}, "Net Balance (completed)")}</div>
                        <div style="font-size: 1.8em; font-weight: bold; color: ${totalBalance >= 0 ? "#166534" : "#991b1b"};">${this._formatCurrency(totalBalance)}</div>
                    </div>
                </div>
                <div class="admin-mobile-table">
                    <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.95em;">
                        <thead style="background: var(--admin-surface-soft);">
                            <tr>
                                <th style="padding: 12px; border-bottom: 2px solid var(--admin-border); color: var(--text-main);">${this.transactionsT("statement.date", {}, "Date")}</th>
                                <th style="padding: 12px; border-bottom: 2px solid var(--admin-border); color: var(--text-main);">${this.transactionsT("statement.type", {}, "Type")}</th>
                                <th style="padding: 12px; border-bottom: 2px solid var(--admin-border); color: var(--text-main);">${this.transactionsT("statement.otherParty", {}, "Other Party")}</th>
                                <th style="padding: 12px; border-bottom: 2px solid var(--admin-border); text-align: left; color: var(--text-main);">${this.transactionsT("statement.amount", {}, "Amount")}</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
                <div style="margin-top: 20px; text-align: left;">
                    <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-left: 10px; display: inline-flex; align-items: center; gap: 6px;">${this.icon("printer", "inline-svg-icon")} ${this.transactionsT("statement.print", {}, "Print Statement")}</button>
                    <button onclick="document.getElementById('statement-container').innerHTML=''" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.close", {}, "Close")}</button>
                </div>
            </div>
        `;

        container.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 20px; border-radius: 8px; text-align: center; font-weight: bold;">${this.transactionsT("messages.statementFailed", { message: err.message }, `Failed to extract statement: ${err.message}`)}</div>`;
    }
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

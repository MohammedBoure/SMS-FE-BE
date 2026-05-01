// frontend/js/roles/admin/tabs/finance.js

AdminUI.financeT = function(key, params = {}, fallback = "") {
    return this.t(`admin.financeTab.${key}`, params, fallback);
};

AdminUI.financeStatusLabel = function(status) {
    const labels = {
        completed: this.financeT("status.completed", {}, "Completed"),
        pending: this.financeT("status.pending", {}, "Pending"),
        cancelled: this.financeT("status.cancelled", {}, "Cancelled")
    };
    return labels[status] || this._escape(status || "-");
};

AdminUI.renderFinanceTab = async function() {
    const main = this.prepareMain(this.t("admin.sections.finance", {}, "Financial Overview"));

    main.innerHTML = `
        <div style="text-align:center; padding: 50px; color: #64748b;">
            <div class="spinner" style="margin-bottom: 15px;"></div>
            <h3>${this.financeT("loading", {}, "Collecting accounting data...")}</h3>
        </div>
    `;

    try {
        const [feesRes, paymentsRes, transactionsRes] = await Promise.all([
            Api.get("/student-fees"),
            Api.get("/payments"),
            Api.get("/transactions")
        ]);

        const fees = feesRes.data || feesRes || [];
        const payments = paymentsRes.data || paymentsRes || [];
        const transactions = transactionsRes.data || transactionsRes || [];

        const totalCollected = payments.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);
        const totalDebts = fees
            .filter(f => f.status !== "paid")
            .reduce((sum, f) => sum + (parseFloat(f.amount_due) || 0), 0);

        const today = new Date();
        const overdueFees = fees.filter(f => f.status !== "paid" && f.due_date && new Date(f.due_date) < today);
        const totalOverdue = overdueFees.reduce((sum, f) => sum + (parseFloat(f.amount_due) || 0), 0);

        const statsHtml = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-bottom: 4px solid #10b981; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 16px; left: 16px; color: #10b981; opacity: 0.12;">${this.icon("finance", "inline-svg-icon")}</div>
                    <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 1em;">${this.financeT("stats.totalCollected", {}, "Total Collections")}</h4>
                    <div style="font-size: 2.2em; font-weight: bold; color: #064e3b;">${this._formatCurrency(totalCollected)}</div>
                    <div style="margin-top: 10px; font-size: 0.85em; color: #10b981;">${this.financeT("stats.paymentsCount", { count: payments.length }, `From ${payments.length} recorded payments`)}</div>
                </div>

                <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-bottom: 4px solid #f59e0b; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 16px; left: 16px; color: #f59e0b; opacity: 0.12;">${this.icon("clock", "inline-svg-icon")}</div>
                    <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 1em;">${this.financeT("stats.pendingFees", {}, "Pending Fees")}</h4>
                    <div style="font-size: 2.2em; font-weight: bold; color: #b45309;">${this._formatCurrency(totalDebts)}</div>
                    <div style="margin-top: 10px; font-size: 0.85em; color: #f59e0b;">${this.financeT("stats.expectedCollection", {}, "Expected collection amount")}</div>
                </div>

                <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-bottom: 4px solid #ef4444; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 16px; left: 16px; color: #ef4444; opacity: 0.12;">${this.icon("alert", "inline-svg-icon")}</div>
                    <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 1em;">${this.financeT("stats.overdueDebts", {}, "Overdue Debts")}</h4>
                    <div style="font-size: 2.2em; font-weight: bold; color: #991b1b;">${this._formatCurrency(totalOverdue)}</div>
                    <div style="margin-top: 10px; font-size: 0.85em; color: #ef4444; font-weight: bold;">${this.financeT("stats.overdueCount", { count: overdueFees.length }, `${overdueFees.length} students require follow-up`)}</div>
                </div>
            </div>
        `;

        const quickLinksHtml = `
            <div style="display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">
                <button onclick="AdminRole.loadSection('payments')" style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    ${this.icon("card", "inline-svg-icon")} ${this.financeT("quickLinks.payments", {}, "Manage Payments")}
                </button>
                <button onclick="AdminRole.loadSection('studentFees')" style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    ${this.icon("finance", "inline-svg-icon")} ${this.financeT("quickLinks.fees", {}, "Track Fees and Debts")}
                </button>
                <button onclick="AdminRole.loadSection('transactions')" style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    ${this.icon("ledger", "inline-svg-icon")} ${this.financeT("quickLinks.transactions", {}, "Daily Transaction Ledger")}
                </button>
            </div>
        `;

        const recentTransactions = transactions.slice(0, 5);
        let recentRows = recentTransactions.map(t => {
            const status = t.status || "pending";
            const isCompleted = status === "completed";
            return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; font-weight: bold;">#${t.transaction_id || t.id}</td>
                    <td style="padding: 12px;">${this._escape(t.transaction_type || "-")}</td>
                    <td style="padding: 12px; direction: ltr; text-align: right; color: #1e40af; font-weight: bold;">${this._formatCurrency(t.amount)}</td>
                    <td style="padding: 12px;"><span style="color: ${isCompleted ? "#166534" : "#b45309"};">${this.financeStatusLabel(status)}</span></td>
                </tr>
            `;
        }).join("");

        if (recentTransactions.length === 0) {
            recentRows = `<tr><td colspan="4" style="text-align:center; padding: 15px; color:#64748b;">${this.financeT("recent.empty", {}, "No transactions recorded.")}</td></tr>`;
        }

        const recentActivityHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${this.financeT("recent.title", {}, "Latest Ledger Activity")}</h3>
                <div class="admin-mobile-table" style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.95em;">
                        <thead style="background: #f1f5f9;">
                            <tr>
                                <th style="padding: 10px;">${this.financeT("recent.number", {}, "Number")}</th>
                                <th style="padding: 10px;">${this.financeT("recent.type", {}, "Type")}</th>
                                <th style="padding: 10px;">${this.financeT("recent.amount", {}, "Amount")}</th>
                                <th style="padding: 10px;">${this.financeT("recent.status", {}, "Status")}</th>
                            </tr>
                        </thead>
                        <tbody>${recentRows}</tbody>
                    </table>
                </div>
            </div>
        `;

        main.innerHTML = statsHtml + quickLinksHtml + recentActivityHtml;
    } catch (err) {
        main.innerHTML = `<div style="background: #fef2f2; color: #991b1b; padding: 20px; border-radius: 8px;"><strong>${this.financeT("messages.loadFailed", {}, "Failed to fetch financial data:")}</strong> ${this._escape(err.message)}</div>`;
    }
};

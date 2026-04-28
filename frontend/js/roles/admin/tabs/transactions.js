// frontend/js/roles/admin/tabs/transactions.js

/**
 * واجهة إدارة التحويلات المالية (الدفتر اليومي)
 * تتيح مراقبة التحويلات، تغيير حالاتها (معلقة، مكتملة، ملغاة)، واستخراج كشوفات الحساب
 */
AdminUI.renderTransactionsTab = function(response) {
    const main = this.prepareMain("سجل التحويلات والدفتر اليومي");
    const transactions = response.data || response || [];

    // 1. حساب الإحصائيات العلوية
    const completedVolume = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const pendingCount = transactions.filter(t => t.status === 'pending').length;

    // 2. شريط الإحصائيات والأدوات
    const headerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #8b5cf6; flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; gap: 30px;">
                <div>
                    <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px;">حجم التحويلات المكتملة</div>
                    <div style="font-size: 1.6em; font-weight: bold; color: #6d28d9;">${this._formatCurrency(completedVolume)}</div>
                </div>
                <div>
                    <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px;">عمليات معلقة</div>
                    <div style="font-size: 1.6em; font-weight: bold; color: #f59e0b;">${pendingCount}</div>
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="AdminUI.viewUserStatement()" style="background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    🧾 استخراج كشف حساب مستخدم
                </button>
                <button onclick="AdminUI.showAddTransactionModal()" style="background: #8b5cf6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <span>💸</span> تحويل جديد
                </button>
            </div>
        </div>
    `;

    // 3. شريط الفلترة
    const filterHtml = `
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
            <label style="font-weight: bold; color: #334155;">تصفية حسب النوع:</label>
            <select id="transaction-type-filter" onchange="AdminUI.filterTransactions()" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white; outline: none; min-width: 200px;">
                <option value="">جميع العمليات</option>
                <option value="payment">دفع رسوم (Payment)</option>
                <option value="refund">استرداد نقدي (Refund)</option>
                <option value="transfer">تحويل داخلي (Transfer)</option>
                <option value="adjustment">تسوية إدارية (Adjustment)</option>
            </select>
        </div>
    `;

    // 4. بناء الجدول
    let tableHtml = "";
    if (transactions.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 1.1em;">لا توجد تحويلات مالية مسجلة.</p>
            </div>
        `;
    } else {
        const rows = transactions.map(t => {
            // تنسيق الحالات والألوان
            const statusStyles = {
                'completed': { bg: '#dcfce7', text: '#166534', label: 'مكتمل' },
                'pending': { bg: '#fef3c7', text: '#b45309', label: 'معلق' },
                'failed': { bg: '#fef2f2', text: '#991b1b', label: 'فاشل' },
                'cancelled': { bg: '#f1f5f9', text: '#475569', label: 'ملغى' }
            };
            const style = statusStyles[t.status] || { bg: '#f1f5f9', text: '#475569', label: t.status };

            // أنواع العمليات
            const typeLabels = {
                'payment': 'دفع رسوم', 'refund': 'استرداد', 'transfer': 'تحويل', 'adjustment': 'تسوية'
            };

            return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #0f172a;">#${t.transaction_id || t.id}</td>
                <td style="padding: 15px;">
                    <div style="color: #64748b; font-size: 0.85em;">من: <strong style="color: #0f172a;">مستخدم #${t.from_user_id}</strong></div>
                    <div style="color: #64748b; font-size: 0.85em;">إلى: <strong style="color: #0f172a;">مستخدم #${t.to_user_id}</strong></div>
                </td>
                <td style="padding: 15px; font-weight: bold; color: #8b5cf6;">
                    ${this._formatCurrency(t.amount)}
                </td>
                <td style="padding: 15px;">
                    <span style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 4px; font-size: 0.85em;">
                        ${typeLabels[t.transaction_type] || t.transaction_type}
                    </span>
                </td>
                <td style="padding: 15px; color: #64748b; font-size: 0.9em; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${this._escape(t.notes || '')}">
                    ${this._escape(t.notes || "-")}
                </td>
                <td style="padding: 15px;">
                    <span style="background: ${style.bg}; color: ${style.text}; padding: 4px 10px; border-radius: 20px; font-size: 0.8em; font-weight: bold;">
                        ${style.label}
                    </span>
                </td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 5px; justify-content: flex-end;">
                    <button onclick="AdminUI.updateTransactionStatus(${t.transaction_id || t.id}, '${t.status}')" title="تغيير الحالة" style="background: white; border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; cursor: pointer;">🔄</button>
                    <button onclick="AdminRole.deleteItem('/transactions', ${t.transaction_id || t.id}, 'transactions')" title="حذف" style="background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; padding: 6px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            </tr>
        `}).join("");

        tableHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px;">رقم العملية</th>
                            <th style="padding: 15px;">أطراف التحويل</th>
                            <th style="padding: 15px;">المبلغ</th>
                            <th style="padding: 15px;">النوع</th>
                            <th style="padding: 15px;">البيان / ملاحظات</th>
                            <th style="padding: 15px;">الحالة</th>
                            <th style="padding: 15px; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    // إضافة حاوية فارغة لعرض كشف الحساب داخلها لاحقاً
    main.innerHTML = headerHtml + filterHtml + tableHtml + `<div id="statement-container" style="margin-top: 30px;"></div>`;
};

/**
 * فلترة التحويلات بناءً على النوع
 */
AdminUI.filterTransactions = async function() {
    const type = document.getElementById("transaction-type-filter").value;
    AdminUI.renderLoading();
    try {
        // الاتصال المباشر بمسار جلب التحويلات مع الفلتر
        const endpoint = type ? `/transactions/all?transaction_type=${type}` : '/transactions/all';
        const data = await Api.get(endpoint);
        AdminUI.renderTransactionsTab(data);
        document.getElementById("transaction-type-filter").value = type;
    } catch (err) {
        // محاولة استخدام المسار البديل في حال كان الـ API يفتقر إلى /all
        try {
            const endpointFallback = type ? `/transactions?transaction_type=${type}` : '/transactions';
            const data = await Api.get(endpointFallback);
            AdminUI.renderTransactionsTab(data);
            document.getElementById("transaction-type-filter").value = type;
        } catch (fallbackErr) {
            AdminUI.renderError("فشل الفلترة: " + fallbackErr.message);
        }
    }
};

/**
 * دالة لتغيير حالة التحويل (مكتمل، معلق، ملغى)
 */
AdminUI.updateTransactionStatus = async function(transactionId, currentStatus) {
    const statusOptions = {
        'completed': 'مكتمل',
        'pending': 'معلق',
        'failed': 'فاشل',
        'cancelled': 'ملغى'
    };
    
    let promptMsg = `أدخل الحالة الجديدة للعملية #${transactionId}:\n`;
    for (const [key, val] of Object.entries(statusOptions)) {
        promptMsg += `- ${key}: ${val}\n`;
    }

    const newStatus = prompt(promptMsg, currentStatus);
    
    if (newStatus && statusOptions[newStatus]) {
        const notes = prompt("أضف ملاحظة توضيحية لسبب تغيير الحالة (اختياري):", "");
        try {
            await Api.patch(`/transactions/${transactionId}/status`, {
                status: newStatus,
                notes: notes || null
            });
            alert("تم تحديث حالة العملية.");
            AdminRole.loadSection("transactions");
        } catch (err) {
            alert("فشل التحديث: " + err.message);
        }
    } else if (newStatus) {
        alert("حالة غير صالحة. يرجى إدخال الكلمة الإنجليزية للحالة (مثال: completed).");
    }
};

/**
 * إضافة تحويل مالي جديد يدوياً
 */
AdminUI.showAddTransactionModal = async function() {
    const fromUser = prompt("أدخل المعرف (User ID) للمرسل (أو حساب الخزينة):");
    if (!fromUser) return;

    const toUser = prompt("أدخل المعرف (User ID) للمستلم:");
    if (!toUser) return;

    const amount = prompt("أدخل المبلغ المراد تحويله:");
    const type = prompt("نوع العملية (payment, transfer, refund, adjustment):", "transfer");
    const notes = prompt("البيان أو الملاحظات للعملية:");

    try {
        await Api.post("/transactions/", {
            from_user_id: parseInt(fromUser),
            to_user_id: parseInt(toUser),
            amount: parseInt(amount),
            transaction_type: type,
            notes: notes,
            status: 'completed'
        });
        alert("تم تسجيل التحويل بنجاح.");
        AdminRole.loadSection("transactions");
    } catch (err) {
        alert("فشل التسجيل: " + err.message);
    }
};

/**
 * استخراج وعرض كشف حساب لمستخدم محدد
 */
AdminUI.viewUserStatement = async function() {
    const userId = prompt("أدخل رقم المستخدم (User ID) لاستخراج كشف الحساب:");
    if (!userId) return;

    const container = document.getElementById("statement-container");
    container.innerHTML = `<div style="text-align:center; padding:20px;">جاري استخراج الكشف...</div>`;

    try {
        const statement = await Api.get(`/transactions/user/${userId}/statement`);
        
        // بناء عرض كشف الحساب
        const records = statement.transactions || statement || [];
        const balance = statement.balance || 0;

        let rows = records.map(r => {
            const isCredit = r.to_user_id == userId; // دخول أموال
            const sign = isCredit ? "+" : "-";
            const color = isCredit ? "#166534" : "#991b1b";
            
            return `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${r.transaction_date ? r.transaction_date.slice(0,10) : '-'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${this._escape(r.transaction_type)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${this._escape(r.notes || "-")}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: ${color}; text-align: left; direction: ltr;">
                    ${sign} ${this._formatCurrency(r.amount)}
                </td>
            </tr>
            `;
        }).join("");

        if (records.length === 0) {
            rows = `<tr><td colspan="4" style="text-align:center; padding:20px;">لا توجد حركات مالية مسجلة لهذا المستخدم.</td></tr>`;
        }

        container.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.2); border-top: 4px solid #0f172a;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px;">
                    <div>
                        <h3 style="margin: 0; color: #0f172a;">🧾 كشف حساب شامل</h3>
                        <p style="margin: 5px 0 0 0; color: #64748b;">رقم المستخدم: <strong>${userId}</strong></p>
                    </div>
                    <div style="text-align: left;">
                        <div style="color: #64748b; font-size: 0.85em;">الرصيد الحالي المقدر</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: ${balance >= 0 ? '#166534' : '#991b1b'};">${this._formatCurrency(balance)}</div>
                    </div>
                </div>
                <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.9em;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">التاريخ</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">نوع الحركة</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">البيان</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left;">المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                <div style="margin-top: 15px; text-align: left;">
                    <button onclick="document.getElementById('statement-container').innerHTML=''" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 15px; border-radius: 4px; cursor: pointer;">إغلاق الكشف</button>
                </div>
            </div>
        `;
        
        container.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px; text-align: center;">فشل استخراج الكشف: قد لا يكون للمستخدم أي سجلات.</div>`;
    }
};
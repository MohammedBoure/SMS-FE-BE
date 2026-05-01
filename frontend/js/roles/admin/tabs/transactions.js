// frontend/js/roles/admin/tabs/transactions.js

/**
 * واجهة إدارة التحويلات المالية (الدفتر اليومي) - النسخة الاحترافية
 * تتيح مراقبة التحويلات، تغيير الحالات عبر نوافذ ذكية، واستخراج كشوفات الحساب بشكل أنيق
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
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #8b5cf6; flex-wrap: wrap; gap: 15px;">
            <div class="admin-mobile-stack" style="display: flex; gap: 30px;">
                <div>
                    <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px; font-weight: bold;">حجم التحويلات المكتملة</div>
                    <div style="font-size: 1.8em; font-weight: bold; color: #6d28d9;">${this._formatCurrency(completedVolume)}</div>
                </div>
                <div>
                    <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px; font-weight: bold;">عمليات معلقة</div>
                    <div style="font-size: 1.8em; font-weight: bold; color: #f59e0b;">${pendingCount}</div>
                </div>
            </div>
            <div class="admin-mobile-stack" style="display: flex; gap: 10px;">
                <button onclick="AdminUI.showUserStatementModal()" style="background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; padding: 12px 18px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; display: flex; align-items: center; gap: 5px;">
                    🧾 كشف حساب
                </button>
                <button onclick="AdminUI.showAddTransactionModal()" style="background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s;">
                    <span>💸</span> تحويل جديد
                </button>
            </div>
        </div>
    `;

    // 3. شريط الفلترة
    const filterHtml = `
        <div class="admin-page-toolbar" style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 15px; align-items: center; border: 1px solid #e2e8f0;">
            <div class="admin-mobile-stack" style="display: flex; align-items: center; gap: 8px; flex: 1;">
                <label style="font-weight: bold; color: #334155;">الفلترة:</label>
                <select id="transaction-type-filter" onchange="AdminUI.filterTransactions()" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-weight: bold; outline: none; min-width: 180px;">
                    <option value="">-- جميع الأنواع --</option>
                    <option value="payment">دفع رسوم</option>
                    <option value="refund">استرداد نقدي</option>
                    <option value="transfer">تحويل داخلي</option>
                    <option value="adjustment">تسوية إدارية</option>
                    <option value="salary">دفع راتب</option>
                </select>
                <select id="transaction-status-filter" onchange="AdminUI.filterTransactions()" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-weight: bold; outline: none; min-width: 150px;">
                    <option value="">-- كل الحالات --</option>
                    <option value="completed">مكتملة فقط</option>
                    <option value="pending">معلقة فقط</option>
                    <option value="cancelled">ملغاة فقط</option>
                </select>
            </div>
            <button onclick="AdminRole.loadSection('transactions')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold;">🔄 تحديث الجدول</button>
        </div>
    `;

    // 4. بناء الجدول
    let tableHtml = "";
    if (transactions.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                <span style="font-size: 4em; opacity: 0.5;">💸</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">لا توجد تحويلات مالية مطابقة.</p>
            </div>
        `;
    } else {
        const rows = transactions.map(t => {
            const statusStyles = {
                'completed': { bg: '#dcfce7', text: '#166534', label: '✅ مكتمل' },
                'pending': { bg: '#fef3c7', text: '#b45309', label: '⏳ معلق' },
                'failed': { bg: '#fef2f2', text: '#991b1b', label: '❌ فاشل' },
                'cancelled': { bg: '#f1f5f9', text: '#475569', label: '🚫 ملغى' }
            };
            const style = statusStyles[t.status] || { bg: '#f1f5f9', text: '#475569', label: t.status };
            const typeLabels = { 'payment': 'دفع رسوم', 'refund': 'استرداد', 'transfer': 'تحويل', 'adjustment': 'تسوية', 'salary': 'راتب' };

            return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: 0.2s; opacity: ${t.status === 'cancelled' ? '0.6' : '1'};" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #64748b;">#${t.transaction_id || t.id}</td>
                <td style="padding: 15px;">
                    <div style="color: #64748b; font-size: 0.85em; display: flex; align-items: center; gap: 5px;">
                        <span style="color: #ef4444;">⬆️ من:</span> 
                        <strong style="color: #0f172a;">${this._escape(t.from_user_name || "مستخدم #" + t.from_user_id)}</strong>
                    </div>
                    <div style="color: #64748b; font-size: 0.85em; display: flex; align-items: center; gap: 5px; margin-top: 4px;">
                        <span style="color: #10b981;">⬇️ إلى:</span> 
                        <strong style="color: #0f172a;">${this._escape(t.to_user_name || "مستخدم #" + t.to_user_id)}</strong>
                    </div>
                </td>
                <td style="padding: 15px; font-weight: bold; color: #8b5cf6; font-size: 1.1em; direction: ltr; text-align: right;">
                    ${this._formatCurrency(t.amount)}
                </td>
                <td style="padding: 15px;">
                    <span style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 0.85em; font-weight: bold; color: #334155;">
                        ${typeLabels[t.transaction_type] || t.transaction_type}
                    </span>
                </td>
                <td style="padding: 15px; color: #64748b; font-size: 0.9em;">
                    ${this._escape(t.notes || "-")}
                </td>
                <td style="padding: 15px;">
                    <span style="background: ${style.bg}; color: ${style.text}; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">
                        ${style.label}
                    </span>
                </td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="AdminUI.showStatusModal(${t.transaction_id || t.id}, '${t.status}')" title="تغيير الحالة" style="background: #fffbeb; color: #d97706; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">🔄 الحالة</button>
                    <button onclick="AdminRole.deleteItem('/transactions', ${t.transaction_id || t.id}, 'transactions')" title="حذف" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">🗑️</button>
                </td>
            </tr>
        `}).join("");

        tableHtml = `
            <div class="admin-mobile-table" style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">رقم العملية</th>
                            <th style="padding: 15px; color: #334155;">أطراف التحويل</th>
                            <th style="padding: 15px; color: #334155;">المبلغ</th>
                            <th style="padding: 15px; color: #334155;">النوع</th>
                            <th style="padding: 15px; color: #334155;">الملاحظات</th>
                            <th style="padding: 15px; color: #334155;">الحالة</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    // 5. بناء النوافذ المنبثقة (Modals)
    const modalsHtml = `
        <!-- نافذة إضافة تحويل -->
        <div id="trans-add-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 550px; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span>💸</span> تسجيل تحويل مالي جديد
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                    <!-- المرسل -->
                    <div style="position: relative;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #ef4444;">المرسل (From) *</label>
                        <input type="text" id="modal-trans-from-search" placeholder="ابحث باسم المستخدم..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;" onkeyup="AdminUI.searchUserForTrans(this.value, 'from')">
                        <input type="hidden" id="modal-trans-from-id">
                        <div id="modal-trans-from-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10;"></div>
                    </div>
                    
                    <!-- المستلم -->
                    <div style="position: relative;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #10b981;">المستلم (To) *</label>
                        <input type="text" id="modal-trans-to-search" placeholder="ابحث باسم المستخدم..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;" onkeyup="AdminUI.searchUserForTrans(this.value, 'to')">
                        <input type="hidden" id="modal-trans-to-id">
                        <div id="modal-trans-to-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10;"></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">المبلغ (دج) *</label>
                        <input type="number" id="modal-trans-amount" min="1" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box; font-weight: bold;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">نوع العملية *</label>
                        <select id="modal-trans-type" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                            <option value="transfer">تحويل داخلي</option>
                            <option value="payment">دفع رسوم</option>
                            <option value="refund">استرداد نقدي</option>
                            <option value="adjustment">تسوية</option>
                            <option value="salary">دفع راتب</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">ملاحظات / بيان العملية</label>
                    <input type="text" id="modal-trans-notes" placeholder="اكتب سبب التحويل..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px;">
                    <button onclick="AdminUI.closeTransModals()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitTransaction()" style="padding: 12px 20px; border: none; background: #8b5cf6; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(139,92,246,0.2);">تنفيذ التحويل</button>
                </div>
            </div>
        </div>

        <!-- نافذة تغيير الحالة -->
        <div id="trans-status-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 400px; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">🔄 تغيير حالة التحويل</h3>
                
                <input type="hidden" id="modal-status-trans-id">
                
                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">الحالة الجديدة:</label>
                    <select id="modal-status-select" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc; font-weight: bold;">
                        <option value="completed">✅ مكتمل (Completed)</option>
                        <option value="pending">⏳ معلق (Pending)</option>
                        <option value="cancelled">إلغاء (Cancelled)</option>
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">سبب التغيير (اختياري):</label>
                    <input type="text" id="modal-status-notes" placeholder="ملاحظة قصيرة..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px;">
                    <button onclick="AdminUI.closeTransModals()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitStatusUpdate()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">تحديث الحالة</button>
                </div>
            </div>
        </div>

        <!-- نافذة البحث لاستخراج كشف الحساب -->
        <div id="trans-statement-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 450px; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">🧾 استخراج كشف حساب</h3>
                
                <div style="margin-top: 20px; position: relative;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">ابحث عن المستخدم *</label>
                    <input type="text" id="modal-statement-search" placeholder="اسم الطالب أو الموظف..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;" onkeyup="AdminUI.searchUserForTrans(this.value, 'statement')">
                    <input type="hidden" id="modal-statement-id">
                    <div id="modal-statement-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10;"></div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px;">
                    <button onclick="AdminUI.closeTransModals()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.generateStatement()" style="padding: 12px 20px; border: none; background: #0f172a; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">استخراج الكشف</button>
                </div>
            </div>
        </div>
    `;

    main.innerHTML = headerHtml + filterHtml + tableHtml + `<div id="statement-container" style="margin-top: 30px;"></div>` + modalsHtml;

    // إخفاء القوائم عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#trans-add-modal') && !e.target.closest('#trans-statement-modal')) return;
        ['from', 'to', 'statement'].forEach(type => {
            const dropdown = document.getElementById(`modal-${type === 'statement' ? '' : 'trans-'}${type}-dropdown`);
            const input = document.getElementById(`modal-${type === 'statement' ? '' : 'trans-'}${type}-search`);
            if (dropdown && e.target !== input && e.target !== dropdown) dropdown.style.display = 'none';
        });
    });
};

// ==========================================
// وظائف البحث والفلترة (Backend Connected)
// ==========================================

AdminUI.filterTransactions = async function() {
    const type = document.getElementById("transaction-type-filter").value;
    const status = document.getElementById("transaction-status-filter").value;
    AdminUI.renderLoading();
    try {
        let endpoint = `/transactions/?`;
        if (type) endpoint += `transaction_type=${type}&`;
        if (status) endpoint += `status=${status}&`;
        
        const data = await Api.get(endpoint);
        AdminUI.renderTransactionsTab(data);
        
        // استعادة القيم المحددة في الفلاتر
        setTimeout(() => {
            document.getElementById("transaction-type-filter").value = type;
            document.getElementById("transaction-status-filter").value = status;
        }, 100);
    } catch (err) {
        AdminUI.renderError("فشل الفلترة: " + err.message);
    }
};

// ==========================================
// وظائف البحث التفاعلي عن المستخدمين (Autocomplete)
// ==========================================

AdminUI.searchUserForTrans = async function(keyword, targetType) {
    // targetType can be 'from', 'to', or 'statement'
    const prefix = targetType === 'statement' ? 'modal-statement' : `modal-trans-${targetType}`;
    const dropdown = document.getElementById(`${prefix}-dropdown`);
    
    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const users = response.data || [];

        if (users.length === 0) {
            dropdown.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center;">لا توجد نتائج</div>`;
        } else {
            dropdown.innerHTML = users.map(u => `
                <div onclick="AdminUI.selectUserForTrans(${u.id}, '${this._escape(u.full_name)}', '${targetType}')" 
                     style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s;" 
                     onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <strong style="color: #0f172a;">${this._escape(u.full_name)}</strong> 
                    <small style="color: #64748b; float: left;">(${u.role_name})</small>
                </div>
            `).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error("فشل البحث:", err);
    }
};

AdminUI.selectUserForTrans = function(id, name, targetType) {
    const prefix = targetType === 'statement' ? 'modal-statement' : `modal-trans-${targetType}`;
    document.getElementById(`${prefix}-search`).value = name;
    document.getElementById(`${prefix}-id`).value = id;
    document.getElementById(`${prefix}-dropdown`).style.display = "none";
};

// ==========================================
// وظائف النوافذ المنبثقة (Modals)
// ==========================================

AdminUI.closeTransModals = function() {
    document.getElementById("trans-add-modal").style.display = "none";
    document.getElementById("trans-status-modal").style.display = "none";
    document.getElementById("trans-statement-modal").style.display = "none";
};

// 1. إضافة تحويل
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
        this.showToast("❌ يرجى تعبئة جميع الحقول وإدخال مبلغ صحيح.", "error");
        return;
    }

    try {
        await Api.post("/transactions/", {
            from_user_id: parseInt(fromId),
            to_user_id: parseInt(toId),
            amount: amount,
            transaction_type: type,
            notes: notes || null,
            status: 'completed' // الحالة الافتراضية
        });
        this.showToast("✅ تم تسجيل التحويل المالي بنجاح.");
        this.closeTransModals();
        AdminRole.loadSection("transactions");
    } catch (err) {
        this.showToast("❌ فشل تنفيذ التحويل: " + err.message, "error");
    }
};

// 2. تحديث الحالة
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
        this.showToast("✅ تم تحديث حالة التحويل.");
        this.closeTransModals();
        AdminRole.loadSection("transactions");
    } catch (err) {
        this.showToast("❌ فشل تحديث الحالة: " + err.message, "error");
    }
};

// 3. استخراج كشف الحساب
AdminUI.showUserStatementModal = function() {
    document.getElementById("modal-statement-id").value = "";
    document.getElementById("modal-statement-search").value = "";
    document.getElementById("trans-statement-modal").style.display = "flex";
};

AdminUI.generateStatement = async function() {
    const userId = document.getElementById("modal-statement-id").value;
    const userName = document.getElementById("modal-statement-search").value;
    
    if (!userId) {
        this.showToast("❌ يرجى تحديد المستخدم أولاً.", "error");
        return;
    }

    this.closeTransModals();
    const container = document.getElementById("statement-container");
    container.innerHTML = `<div style="text-align:center; padding:30px; font-weight: bold; color: #64748b;">جاري جلب وتحليل البيانات المالية... ⏳</div>`;

    try {
        // الاتصال بمسار الـ Statement الخاص بـ UserTransactionsManager
        const records = await Api.get(`/transactions/statement/${userId}`);
        
        if (!records || records.length === 0) {
            container.innerHTML = `
                <div style="background: white; border-radius: 12px; padding: 30px; text-align: center; border: 1px solid #e2e8f0;">
                    <h3 style="color: #0f172a; margin-top: 0;">🧾 كشف حساب: ${this._escape(userName)}</h3>
                    <p style="color: #64748b; font-size: 1.1em;">لا توجد أي حركات مالية مسجلة لهذا المستخدم.</p>
                    <button onclick="document.getElementById('statement-container').innerHTML=''" style="margin-top: 15px; background: #f1f5f9; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">إغلاق</button>
                </div>`;
            return;
        }

        // حساب الرصيد التراكمي (دخول - خروج) للعمليات المكتملة فقط
        let totalBalance = 0;
        records.forEach(r => {
            if(r.status === 'completed') {
                if(r.flow_direction === 'IN') totalBalance += parseFloat(r.amount);
                else totalBalance -= parseFloat(r.amount);
            }
        });

        const typeLabels = { 'payment': 'دفع', 'refund': 'استرداد', 'transfer': 'تحويل', 'adjustment': 'تسوية', 'salary': 'راتب' };

        const rows = records.map(r => {
            const isCredit = r.flow_direction === 'IN'; // دخول
            const sign = isCredit ? "+" : "-";
            const color = r.status !== 'completed' ? '#94a3b8' : (isCredit ? "#16a34a" : "#dc2626");
            const otherParty = isCredit ? r.from_user_name : r.to_user_name;
            
            return `
            <tr style="border-bottom: 1px solid #e2e8f0; opacity: ${r.status !== 'completed' ? '0.6' : '1'};">
                <td style="padding: 12px;">${r.created_at ? r.created_at.slice(0,10) : '-'}</td>
                <td style="padding: 12px; font-weight: bold;">
                    ${typeLabels[r.transaction_type] || r.transaction_type}
                    ${r.status !== 'completed' ? `<small style="display:block; color:#b45309;">(${r.status})</small>` : ''}
                </td>
                <td style="padding: 12px; color: #475569;">${isCredit ? 'من: ' : 'إلى: '}<strong>${this._escape(otherParty)}</strong></td>
                <td style="padding: 12px; font-weight: bold; color: ${color}; direction: ltr; text-align: right; font-size: 1.1em;">
                    ${sign} ${this._formatCurrency(r.amount)}
                </td>
            </tr>
            `;
        }).join("");

        container.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; border-top: 5px solid #0f172a;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px;">
                    <div>
                        <h3 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;"><span>🧾</span> كشف حساب مالي تفصيلي</h3>
                        <p style="margin: 8px 0 0 0; color: #475569; font-size: 1.1em;">المستخدم: <strong>${this._escape(userName)}</strong> (ID: ${userId})</p>
                    </div>
                    <div style="text-align: left; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1;">
                        <div style="color: #64748b; font-size: 0.85em; font-weight: bold;">الرصيد الصافي (المكتمل)</div>
                        <div style="font-size: 1.8em; font-weight: bold; color: ${totalBalance >= 0 ? '#166534' : '#991b1b'};">${this._formatCurrency(totalBalance)}</div>
                    </div>
                </div>
                <div class="admin-mobile-table">
                    <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.95em;">
                        <thead style="background: #f8fafc;">
                            <tr>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">التاريخ</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">النوع</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">الطرف الآخر</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; text-align: left; color: #334155;">المبلغ</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
                <div style="margin-top: 20px; text-align: left;">
                    <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-left: 10px;">🖨️ طباعة الكشف</button>
                    <button onclick="document.getElementById('statement-container').innerHTML=''" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">إغلاق</button>
                </div>
            </div>
        `;
        
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 20px; border-radius: 8px; text-align: center; font-weight: bold;">❌ فشل استخراج الكشف: ${err.message}</div>`;
    }
};

/**
 * دالة مساعدة لإظهار الإشعارات السريعة (Toasts)
 */
if(!AdminUI.showToast) {
    AdminUI.showToast = function(message, type = "success") {
        const toast = document.createElement("div");
        toast.innerText = message;
        const bgColor = type === "error" ? "#dc2626" : "#0f172a";
        toast.style.cssText = `position: fixed; bottom: 20px; left: 20px; background: ${bgColor}; color: white; padding: 12px 25px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-weight: bold; transition: opacity 0.5s;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '0', 2500);
        setTimeout(() => toast.remove(), 3000);
    };
}

// frontend/js/roles/admin/tabs/finance.js

/**
 * لوحة التحكم المالية الشاملة (Financial Dashboard)
 * تقوم بجلب البيانات من الرسوم، المدفوعات، والتحويلات لحساب وعرض الموقف المالي العام للمدرسة
 */
AdminUI.renderFinanceTab = async function() {
    const main = this.prepareMain("النظرة العامة على المالية");

    // إظهار حالة التحميل
    main.innerHTML = `
        <div style="text-align:center; padding: 50px; color: #64748b;">
            <div class="spinner" style="margin-bottom: 15px;"></div>
            <h3>جاري تجميع البيانات المحاسبية...</h3>
        </div>
    `;

    try {
        // جلب البيانات من مختلف المسارات المالية بشكل متوازي لتسريع التحميل
        const [feesRes, paymentsRes, transactionsRes] = await Promise.all([
            Api.get("/student-fees"),
            Api.get("/payments"),
            Api.get("/transactions")
        ]);

        const fees = feesRes.data || feesRes || [];
        const payments = paymentsRes.data || paymentsRes || [];
        const transactions = transactionsRes.data || transactionsRes || [];

        // 1. العمليات الحسابية لاستخراج المؤشرات المالية
        
        // أ. إجمالي التحصيلات (المدفوعات الفعلية)
        const totalCollected = payments.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);
        
        // ب. إجمالي الديون المستحقة (الرسوم غير المدفوعة)
        const totalDebts = fees.filter(f => f.status !== 'paid')
                               .reduce((sum, f) => sum + (parseFloat(f.amount_due) || 0), 0);
                               
        // ج. إجمالي الديون المتأخرة (تجاوزت تاريخ الاستحقاق)
        const today = new Date();
        const overdueFees = fees.filter(f => f.status !== 'paid' && new Date(f.due_date) < today);
        const totalOverdue = overdueFees.reduce((sum, f) => sum + (parseFloat(f.amount_due) || 0), 0);

        // 2. تصميم بطاقات المؤشرات (Stats Cards)
        const statsHtml = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                
                <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-bottom: 4px solid #10b981; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; left: -10px; font-size: 5em; opacity: 0.05;">💰</div>
                    <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 1em;">إجمالي التحصيلات</h4>
                    <div style="font-size: 2.2em; font-weight: bold; color: #064e3b;">${this._formatCurrency(totalCollected)}</div>
                    <div style="margin-top: 10px; font-size: 0.85em; color: #10b981;">من إجمالي ${payments.length} دفعة مسجلة</div>
                </div>

                <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-bottom: 4px solid #f59e0b; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; left: -10px; font-size: 5em; opacity: 0.05;">⏳</div>
                    <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 1em;">الرسوم قيد الانتظار (غير محصلة)</h4>
                    <div style="font-size: 2.2em; font-weight: bold; color: #b45309;">${this._formatCurrency(totalDebts)}</div>
                    <div style="margin-top: 10px; font-size: 0.85em; color: #f59e0b;">مبالغ متوقعة التحصيل</div>
                </div>

                <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-bottom: 4px solid #ef4444; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; left: -10px; font-size: 5em; opacity: 0.05;">⚠️</div>
                    <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 1em;">الديون المتأخرة (تجاوزت الأجل)</h4>
                    <div style="font-size: 2.2em; font-weight: bold; color: #991b1b;">${this._formatCurrency(totalOverdue)}</div>
                    <div style="margin-top: 10px; font-size: 0.85em; color: #ef4444; font-weight: bold;">لدى ${overdueFees.length} طالب - يتطلب المتابعة</div>
                </div>
            </div>
        `;

        // 3. تصميم شريط التنقل السريع بين أقسام المالية
        const quickLinksHtml = `
            <div style="display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">
                <button onclick="AdminRole.loadSection('payments')" style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    <span>💳</span> إدارة المدفوعات
                </button>
                <button onclick="AdminRole.loadSection('studentFees')" style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    <span>💰</span> متابعة الرسوم والديون
                </button>
                <button onclick="AdminRole.loadSection('transactions')" style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    <span>📓</span> الدفتر اليومي للتحويلات
                </button>
            </div>
        `;

        // 4. جدول بآخر 5 تحويلات أو عمليات مالية حدثت في النظام
        const recentTransactions = transactions.slice(0, 5); // أخذ أحدث 5 فقط
        let recentRows = recentTransactions.map(t => {
            const isCompleted = t.status === 'completed';
            return `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-weight: bold;">#${t.transaction_id || t.id}</td>
                <td style="padding: 12px;">${this._escape(t.transaction_type)}</td>
                <td style="padding: 12px; direction: ltr; text-align: right; color: #1e40af; font-weight: bold;">${this._formatCurrency(t.amount)}</td>
                <td style="padding: 12px;"><span style="color: ${isCompleted ? '#166534' : '#b45309'};">${isCompleted ? 'مكتمل' : 'معلق'}</span></td>
            </tr>
        `}).join("");

        if(recentTransactions.length === 0) recentRows = `<tr><td colspan="4" style="text-align:center; padding: 15px; color:#64748b;">لا توجد عمليات مسجلة.</td></tr>`;

        const recentActivityHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">أحدث العمليات في الدفتر اليومي</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.95em;">
                    <thead style="background: #f1f5f9;">
                        <tr>
                            <th style="padding: 10px;">الرقم</th>
                            <th style="padding: 10px;">النوع</th>
                            <th style="padding: 10px;">المبلغ</th>
                            <th style="padding: 10px;">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>${recentRows}</tbody>
                </table>
            </div>
        `;

        // تركيب الصفحة
        main.innerHTML = statsHtml + quickLinksHtml + recentActivityHtml;

    } catch (err) {
        main.innerHTML = `<div style="background: #fef2f2; color: #991b1b; padding: 20px; border-radius: 8px;"><strong>خطأ في جلب البيانات المالية:</strong> ${err.message}</div>`;
    }
};
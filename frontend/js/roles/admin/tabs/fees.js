// frontend/js/roles/admin/tabs/fees.js

/**
 * واجهة إدارة الرسوم والديون
 * تتيح للمدير مراقبة المستحقات المالية، فلترة الديون المتأخرة، وإرسال تنبيهات الدفع
 */
AdminUI.renderFeesTab = async function(feesData) {
    const main = this.prepareMain("إدارة الرسوم والديون");
    const fees = feesData.data || feesData || [];

    // 1. جلب إحصائيات سريعة للديون المتأخرة
    let overdueCount = 0;
    try {
        const overdueData = await Api.get("/student-fees/overdue");
        overdueCount = overdueData.length || 0;
    } catch (err) {
        console.error("تعذر جلب إحصائيات الديون المتأخرة", err);
    }

    // 2. حساب إجمالي المبالغ المستحقة الظاهرة في القائمة الحالية
    const totalDue = fees.reduce((sum, f) => sum + (f.amount_due || 0), 0);

    // 3. قسم الملخص المالي العلوي
    const statsHeader = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #10b981;">
                <div style="color: #64748b; font-size: 0.85em;">إجمالي الرسوم المعروضة</div>
                <div style="font-size: 1.4em; font-weight: bold; color: #0f172a;">${this._formatCurrency(totalDue)}</div>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #ef4444;">
                <div style="color: #64748b; font-size: 0.85em;">حالات تأخير الدفع</div>
                <div style="font-size: 1.4em; font-weight: bold; color: #ef4444;">${overdueCount} طالب</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: flex-end;">
                <button onclick="AdminUI.showAddFeeModal()" style="background: #064e3b; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <span>💰</span> إضافة رسم جديد
                </button>
            </div>
        </div>
    `;

    // 4. شريط البحث والفلترة
    const filterBar = `
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="font-size: 0.9em; color: #475569;">نوع الرسم:</label>
                <select id="fee-type-filter" onchange="AdminUI.filterFees()" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: white;">
                    <option value="">الكل</option>
                    <option value="tuition">مصاريف دراسية</option>
                    <option value="transport">نقل مدرسي</option>
                    <option value="activities">أنشطة</option>
                </select>
            </div>
            <div style="flex: 1; min-width: 250px;">
                <input type="text" id="fee-search-input" placeholder="بحث باسم الطالب..." style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
            </div>
            <button onclick="AdminUI.loadOverdueOnly()" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9em;">عرض المتأخرات فقط ⚠️</button>
        </div>
    `;

    // 5. بناء الجدول
    let tableRows = fees.map(f => {
        const isOverdue = new Date(f.due_date) < new Date() && f.status !== 'paid';
        const statusLabel = isOverdue ? 'متأخر' : (f.status === 'paid' ? 'مدفوع' : 'قيد الانتظار');
        const statusColor = isOverdue ? '#ef4444' : (f.status === 'paid' ? '#10b981' : '#f59e0b');

        return `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${isOverdue ? '#fff1f2' : 'transparent'};">
                <td style="padding: 15px; font-weight: bold;">#${f.fee_id}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: 600;">${this._escape(f.student_name || "طالب #" + f.student_id)}</div>
                    <small style="color: #64748b;">رقم الطالب: ${f.student_id}</small>
                </td>
                <td style="padding: 15px;">${this._escape(f.fee_type)}</td>
                <td style="padding: 15px; font-weight: bold; color: #0f172a;">${this._formatCurrency(f.amount_due)}</td>
                <td style="padding: 15px; color: ${isOverdue ? '#dc2626' : '#475569'};">${this._escape(f.due_date || "-")}</td>
                <td style="padding: 15px;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.8em; font-weight: bold; background: ${statusColor}20; color: ${statusColor};">
                        ${statusLabel}
                    </span>
                </td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 5px; justify-content: flex-end;">
                    <button onclick="AdminUI.sendFeeReminder(${f.student_id}, '${this._escape(f.fee_type)}')" title="إرسال تذكير" style="background: white; border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; cursor: pointer;">🔔</button>
                    <button onclick="AdminUI.viewFeePayments(${f.fee_id})" title="سجل الدفعات" style="background: white; border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; cursor: pointer;">💳</button>
                    <button onclick="AdminRole.deleteItem('/student-fees', ${f.fee_id}, 'studentFees')" title="حذف" style="background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; padding: 6px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            </tr>
        `;
    }).join("");

    if (fees.length === 0) tableRows = `<tr><td colspan="7" style="text-align:center; padding: 30px; color: #64748b;">لا توجد سجلات مالية مطابقة.</td></tr>`;

    main.innerHTML = `
        ${statsHeader}
        ${filterBar}
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
                <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                    <tr>
                        <th style="padding: 15px;">المعرف</th>
                        <th style="padding: 15px;">الطالب</th>
                        <th style="padding: 15px;">نوع الرسم</th>
                        <th style="padding: 15px;">المبلغ المستحق</th>
                        <th style="padding: 15px;">تاريخ الاستحقاق</th>
                        <th style="padding: 15px;">الحالة</th>
                        <th style="padding: 15px; text-align: left;">إجراءات</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
    `;
};

/**
 * دالة فلترة الرسوم حسب النوع (تتصل بمسار /student-fees/ مع بارامتر النوع)
 */
AdminUI.filterFees = async function() {
    const type = document.getElementById("fee-type-filter").value;
    AdminUI.renderLoading();
    try {
        const endpoint = type ? `/student-fees?fee_type=${type}` : '/student-fees';
        const data = await Api.get(endpoint);
        AdminUI.renderFeesTab(data);
        document.getElementById("fee-type-filter").value = type;
    } catch (err) {
        AdminUI.renderError("فشل الفلترة: " + err.message);
    }
};

/**
 * عرض المتأخرات فقط عبر مسار /student-fees/overdue
 */
AdminUI.loadOverdueOnly = async function() {
    AdminUI.renderLoading();
    try {
        const data = await Api.get("/student-fees/overdue");
        AdminUI.renderFeesTab(data);
    } catch (err) {
        AdminUI.renderError("تعذر تحميل المتأخرات: " + err.message);
    }
};

/**
 * إضافة رسم جديد لطالب محدد
 */
AdminUI.showAddFeeModal = async function() {
    const studentId = prompt("أدخل معرف الطالب (Student ID):");
    if (!studentId) return;

    const type = prompt("نوع الرسم (مثال: tuition, transport, exam):", "tuition");
    const amount = prompt("المبلغ المطلوب (دج):");
    const dueDate = prompt("تاريخ الاستحقاق (YYYY-MM-DD):");

    try {
        await Api.post("/student-fees/", {
            student_id: parseInt(studentId),
            fee_type: type,
            amount_due: parseInt(amount),
            due_date: dueDate,
            applied_discount: 0
        });
        alert("تمت إضافة الرسم المالي بنجاح.");
        AdminRole.loadSection("studentFees");
    } catch (err) {
        alert("فشل إضافة الرسم: " + err.message);
    }
};

/**
 * إرسال تذكير بالدفع (عبر نظام الإشعارات)
 */
AdminUI.sendFeeReminder = async function(studentId, feeType) {
    if (!confirm("هل تريد إرسال إشعار تذكيري لهذا الطالب بخصوص مستحقاته؟")) return;
    
    try {
        await Api.post("/notifications/", {
            user_id: studentId,
            title: "تذكير بسداد الرسوم 💳",
            message: `عزيزي الطالب، يرجى العلم بوجود رسوم مستحقة من نوع (${feeType}) بانتظار السداد. شكراً لكم.`
        });
        alert("تم إرسال التذكير بنجاح.");
    } catch (err) {
        alert("فشل إرسال الإشعار: " + err.message);
    }
};

/**
 * عرض سجل الدفعات المرتبطة برسم معين
 */
AdminUI.viewFeePayments = async function(feeId) {
    try {
        const payments = await Api.get(`/payments/fee/${feeId}`);
        console.log("الدفعات:", payments);
        alert(`تم العثور على ${payments.length} دفعة مسجلة لهذا الرسم. سيتم عرض السجل التفصيلي قريباً.`);
    } catch (err) {
        alert("تعذر جلب سجل الدفعات.");
    }
};
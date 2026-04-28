// frontend/js/roles/admin/tabs/payments.js

/**
 * واجهة إدارة المدفوعات والتحصيلات
 * تتيح تسجيل الدفعات الجديدة (كلياً أو جزئياً)، استعراض الإيصالات، ومتابعة الأقساط
 */
AdminUI.renderPaymentsTab = function(response) {
    const main = this.prepareMain("سجل المدفوعات والتحصيلات");
    const payments = response.data || response || [];

    // حساب إجمالي التحصيلات المعروضة حالياً في الجدول
    const totalCollected = payments.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);

    // 1. الملخص المالي وشريط الإجراءات
    const headerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #10b981; flex-wrap: wrap; gap: 15px;">
            <div>
                <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px;">إجمالي التحصيلات المعروضة</div>
                <div style="font-size: 1.8em; font-weight: bold; color: #064e3b;">${this._formatCurrency(totalCollected)}</div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="number" id="payment-student-search" placeholder="بحث برقم الطالب..." style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; width: 180px;" onkeypress="if(event.key === 'Enter') AdminUI.searchPaymentsByStudent()">
                <button onclick="AdminUI.searchPaymentsByStudent()" style="background: #3b82f6; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">بحث 🔍</button>
            </div>
            <button onclick="AdminUI.showAddPaymentModal()" style="background: #064e3b; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <span>💳</span> تسجيل دفعة جديدة
            </button>
        </div>
    `;

    // 2. بناء جدول المدفوعات
    let tableHtml = "";
    if (payments.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="font-size: 3em;">🧾</span>
                <p style="color: #64748b; margin-top: 15px; font-size: 1.1em;">لا توجد مدفوعات مسجلة أو مطابقة لبحثك.</p>
            </div>
        `;
    } else {
        const rows = payments.map(p => `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #0f172a;">#${p.payment_id || p.id}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: 600;">${this._escape(p.student_name || "طالب #" + p.student_id)}</div>
                </td>
                <td style="padding: 15px;">
                    <span style="color: #0369a1; font-size: 0.9em;">رسم #${p.fee_id}</span>
                </td>
                <td style="padding: 15px; font-weight: bold; color: #166534;">
                    ${this._formatCurrency(p.amount_paid)}
                </td>
                <td style="padding: 15px;">
                    <span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; font-family: monospace;">
                        ${this._escape(p.receipt_number || "بدون إيصال")}
                    </span>
                </td>
                <td style="padding: 15px;">الدفعة ${p.installment_number || 1}</td>
                <td style="padding: 15px; color: #64748b; font-size: 0.9em; direction: ltr; text-align: right;">
                    ${this._escape(p.payment_date || new Date().toISOString().split('T')[0])}
                </td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 5px; justify-content: flex-end;">
                    <button onclick="AdminUI.printReceipt(${p.payment_id || p.id})" title="طباعة الإيصال" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 6px 10px; border-radius: 4px; cursor: pointer;">🖨️</button>
                    <button onclick="AdminRole.deleteItem('/payments', ${p.payment_id || p.id}, 'payments')" title="إلغاء الدفعة" style="background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; padding: 6px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            </tr>
        `).join("");

        tableHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px;">رقم العملية</th>
                            <th style="padding: 15px;">الطالب</th>
                            <th style="padding: 15px;">مرجع الرسم</th>
                            <th style="padding: 15px;">المبلغ المدفوع</th>
                            <th style="padding: 15px;">رقم الوصل (Receipt)</th>
                            <th style="padding: 15px;">القسط رقم</th>
                            <th style="padding: 15px;">التاريخ</th>
                            <th style="padding: 15px; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    main.innerHTML = headerHtml + tableHtml;
};

/**
 * دالة البحث عن مدفوعات طالب محدد
 */
AdminUI.searchPaymentsByStudent = async function() {
    const studentId = document.getElementById("payment-student-search").value.trim();
    if (!studentId) {
        AdminRole.loadSection("payments"); // إعادة تحميل الكل
        return;
    }

    AdminUI.renderLoading();
    try {
        const response = await Api.get(`/payments/student/${studentId}`);
        AdminUI.renderPaymentsTab(response);
        document.getElementById("payment-student-search").value = studentId; // الحفاظ على قيمة البحث
    } catch (err) {
        AdminUI.renderError("فشل جلب مدفوعات الطالب: " + err.message);
    }
};

/**
 * دالة لتسجيل دفعة جديدة
 */
AdminUI.showAddPaymentModal = async function() {
    const feeId = prompt("أدخل رقم الرسم المستحق (Fee ID) المراد تسديده:");
    if (!feeId) return;

    // استعلام سريع عن الرصيد المتبقي قبل الدفع
    try {
        const balanceData = await Api.get(`/payments/fee/${feeId}/balance`);
        const remaining = balanceData.remaining_balance;
        
        const amount = prompt(`المبلغ المتبقي لهذا الرسم هو: ${remaining} دج.\nأدخل المبلغ المراد دفعه الآن:`, remaining);
        if (!amount) return;

        const receiptNumber = prompt("أدخل رقم وصل الدفع (اختياري):", `REC-${Math.floor(Math.random() * 100000)}`);
        const installment = prompt("رقم القسط (الافتراضي 1):", "1");

        await Api.post("/payments/", {
            fee_id: parseInt(feeId),
            amount_paid: parseFloat(amount),
            installment_number: parseInt(installment) || 1,
            receipt_number: receiptNumber
        });

        alert("تم تسجيل الدفعة بنجاح.");
        AdminRole.loadSection("payments");
    } catch (err) {
        alert("فشل العملية: " + (err.message || "تأكد من صحة رقم الرسم (Fee ID)."));
    }
};

/**
 * دالة لطباعة إيصال الدفع (محاكاة)
 */
AdminUI.printReceipt = function(paymentId) {
    // يمكن هنا فتح نافذة جديدة بتنسيق طابعة Xprinter كما طلبت في المحادثات السابقة
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>طباعة إيصال #${paymentId}</title>
            <style>
                body { font-family: monospace; text-align: center; padding: 20px; }
                .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h2>المدرسة الحديثة</h2>
            <div class="line"></div>
            <h3>إيصال دفع #${paymentId}</h3>
            <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-DZ')}</p>
            <div class="line"></div>
            <p>تم استلام المبلغ بنجاح.</p>
            <p>شكراً لتعاملكم معنا.</p>
            <script>
                window.onload = () => { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `);
};
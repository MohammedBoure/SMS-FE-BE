// frontend/js/roles/admin/tabs/payments.js

/**
 * واجهة إدارة المدفوعات والتحصيلات (النسخة الاحترافية المصححة)
 * تتيح تسجيل الدفعات الجديدة عبر نوافذ ذكية، استعراض الإيصالات، ومتابعة التحصيلات
 */
AdminUI.renderPaymentsTab = function(response) {
    const main = this.prepareMain("سجل المدفوعات والتحصيلات");
    const payments = response.data || response || [];

    // حساب إجمالي التحصيلات المعروضة حالياً في الجدول
    const totalCollected = payments.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);

    // 1. الملخص المالي وشريط الإجراءات العلوي
    const headerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #10b981; flex-wrap: wrap; gap: 15px;">
            <div>
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">إجمالي التحصيلات المعروضة</div>
                <div style="font-size: 1.8em; font-weight: bold; color: #064e3b; margin-top: 5px;">${this._formatCurrency(totalCollected)}</div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex: 1; max-width: 400px; position: relative;">
                <input type="text" id="payment-search-input" placeholder="بحث باسم الطالب أو رقم الإيصال..." 
                       style="padding: 12px 15px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; outline: none; font-weight: bold; box-sizing: border-box;"
                       onkeyup="AdminUI.searchPaymentsLocal(this.value)">
                <button onclick="AdminRole.loadSection('payments')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;" title="إعادة تحميل الكل">🔄</button>
            </div>
            <button onclick="AdminUI.showPaymentModal()" style="background: #0f172a; color: white; border: none; padding: 14px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s; font-size: 1.05em;">
                <span>💳</span> تسجيل دفعة مالية
            </button>
        </div>
    `;

    // 2. الهيكل الأساسي
    main.innerHTML = `
        ${headerHtml}
        
        <div id="payments-table-container">
            ${this._generatePaymentsTableHtml(payments)}
        </div>

        <!-- النافذة المنبثقة: تسجيل دفعة جديدة -->
        <div id="payment-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 550px; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 id="payment-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span>💳</span> تسجيل دفعة مالية جديدة
                </h3>
                
                <input type="hidden" id="modal-payment-id">

                <!-- الخطوة 1: اختيار الطالب -->
                <div id="modal-payment-student-section" style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">1. ابحث عن الطالب المستهدف *</label>
                    <div style="position: relative;">
                        <input type="text" id="modal-payment-student-search" placeholder="اكتب اسم الطالب للبحث..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;" onkeyup="AdminUI.searchStudentForPayment(this.value)">
                        <input type="hidden" id="modal-payment-student-id">
                        <div id="modal-payment-student-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10; margin-top: 5px;"></div>
                    </div>
                </div>

                <!-- الخطوة 2: اختيار الرسم المالي -->
                <div id="modal-payment-fee-section" style="margin-top: 15px; display: none;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">2. اختر الرسم المراد تسديده *</label>
                    <select id="modal-payment-fee-id" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc; font-weight: bold; color: #0f172a;" onchange="AdminUI.fetchFeeBalanceForPayment(this.value)">
                        <option value="">-- اختر الرسم المالي --</option>
                    </select>
                    
                    <!-- صندوق تفاصيل الرصيد -->
                    <div id="modal-payment-balance-box" style="display: none; margin-top: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 0.9em;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #64748b;">المبلغ الصافي للرسم:</span>
                            <strong id="info-net-amount">0 دج</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #64748b;">المدفوعات السابقة (أقساط):</span>
                            <strong id="info-total-paid" style="color: #16a34a;">0 دج</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 5px; margin-top: 5px;">
                            <span style="color: #dc2626; font-weight: bold;">الباقي للدفع الآن:</span>
                            <strong id="info-remaining-balance" style="color: #dc2626; font-size: 1.1em;">0 دج</strong>
                        </div>
                    </div>
                </div>

                <!-- الخطوة 3: تفاصيل الدفع -->
                <div id="modal-payment-details-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; opacity: 0.5; pointer-events: none;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">المبلغ المدفوع (دج) *</label>
                        <input type="number" id="modal-payment-amount" min="1" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box; font-weight: bold; color: #16a34a; font-size: 1.1em;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">رقم الإيصال (اختياري)</label>
                        <input type="text" id="modal-payment-receipt" placeholder="REC-XXXXX" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">رقم القسط (الدفعة)</label>
                        <input type="number" id="modal-payment-installment" value="1" min="1" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px;">
                    <button onclick="AdminUI.closePaymentModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button id="btn-submit-payment" onclick="AdminUI.submitPayment()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2); pointer-events: none; opacity: 0.5;">تأكيد الدفع</button>
                </div>
            </div>
        </div>

        <!-- تخزين البيانات محلياً لتسهيل البحث -->
        <script>window.currentPaymentsData = ${JSON.stringify(payments)};</script>
    `;

    // إخفاء القائمة المنسدلة عند النقر خارجها
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('modal-payment-student-dropdown');
        const searchInput = document.getElementById('modal-payment-student-search');
        if (dropdown && e.target !== searchInput && e.target !== dropdown) {
            dropdown.style.display = 'none';
        }
    });
};

/**
 * دالة بناء جدول المدفوعات
 */
AdminUI._generatePaymentsTableHtml = function(payments) {
    if (!payments || payments.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <span style="font-size: 4em; opacity: 0.5;">🧾</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">لا توجد مدفوعات مسجلة أو مطابقة لبحثك.</p>
            </div>
        `;
    }

    const typeLabels = {
        'tuition': 'مصاريف دراسية',
        'transport': 'نقل مدرسي',
        'activities': 'أنشطة',
        'exam': 'رسوم امتحانات',
        'other': 'أخرى'
    };

    const rows = payments.map(p => `
        <tr class="payment-row" style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px; font-weight: bold; color: #64748b;">#${p.payment_id || p.id}</td>
            <td style="padding: 15px;">
                <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(p.student_name || "طالب #" + p.student_id)}</div>
            </td>
            <td style="padding: 15px;">
                <span style="background: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-size: 0.85em; font-weight: bold;">
                    ${typeLabels[p.fee_type] || p.fee_type || ('رسم #' + p.fee_id)}
                </span>
            </td>
            <td style="padding: 15px; font-weight: bold; color: #16a34a; font-size: 1.1em; direction: ltr; text-align: right;">
                ${this._formatCurrency(p.amount_paid)}
            </td>
            <td style="padding: 15px;">
                <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #475569;">
                    ${this._escape(p.receipt_number || "بدون إيصال")}
                </span>
            </td>
            <td style="padding: 15px; color: #334155; font-weight: bold;">الدفعة ${p.installment_number || 1}</td>
            <td style="padding: 15px; color: #64748b; font-size: 0.9em; direction: ltr; text-align: right; font-weight: bold;">
                ${this._escape(p.payment_date || new Date().toISOString().split('T')[0])}
            </td>
            <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                <button onclick='AdminUI.printReceipt(${JSON.stringify(p).replace(/'/g, "&apos;")})' title="طباعة الإيصال الحراري" style="background: #fffbeb; color: #d97706; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-weight: bold;">🖨️ طباعة</button>
                <button onclick="AdminRole.deleteItem('/payments', ${p.payment_id || p.id}, 'payments')" title="إلغاء الدفعة" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s;">🗑️ إلغاء</button>
            </td>
        </tr>
    `).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.95em; color: #475569;">
                إجمالي العمليات: <strong style="color: #0f172a;">${payments.length}</strong>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;"># العملية</th>
                            <th style="padding: 15px; color: #334155;">الطالب</th>
                            <th style="padding: 15px; color: #334155;">نوع الرسم</th>
                            <th style="padding: 15px; color: #334155;">المبلغ المدفوع</th>
                            <th style="padding: 15px; color: #334155;">رقم الوصل</th>
                            <th style="padding: 15px; color: #334155;">رقم القسط</th>
                            <th style="padding: 15px; color: #334155;">التاريخ</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

// ==========================================
// وظائف البحث والفلترة المحلية
// ==========================================

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


// ==========================================
// وظائف النافذة المنبثقة (Modal) لتسجيل الدفعات
// ==========================================

AdminUI.showPaymentModal = function() {
    const modal = document.getElementById("payment-modal");
    
    // تصفير الحقول
    document.getElementById("modal-payment-id").value = "";
    document.getElementById("modal-payment-student-id").value = "";
    document.getElementById("modal-payment-student-search").value = "";
    
    const feeSection = document.getElementById("modal-payment-fee-section");
    const feeSelect = document.getElementById("modal-payment-fee-id");
    feeSelect.innerHTML = '<option value="">-- اختر الرسم المالي --</option>';
    feeSection.style.display = "none";
    document.getElementById("modal-payment-balance-box").style.display = "none";

    document.getElementById("modal-payment-amount").value = "";
    document.getElementById("modal-payment-receipt").value = `REC-${Math.floor(Math.random() * 1000000)}`;
    document.getElementById("modal-payment-installment").value = "1";

    // قفل تفاصيل الدفع
    document.getElementById("modal-payment-details-section").style.pointerEvents = "none";
    document.getElementById("modal-payment-details-section").style.opacity = "0.5";
    document.getElementById("btn-submit-payment").style.pointerEvents = "none";
    document.getElementById("btn-submit-payment").style.opacity = "0.5";

    modal.style.display = "flex";
};

AdminUI.closePaymentModal = function() {
    document.getElementById("payment-modal").style.display = "none";
};

// ==========================================
// وظائف البحث الديناميكي واسترجاع الرصيد
// ==========================================

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
            dropdown.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center;">لا توجد نتائج</div>`;
        } else {
            dropdown.innerHTML = students.map(s => `
                <div onclick="AdminUI.selectStudentForPayment(${s.student_id || s.id}, '${this._escape(s.full_name || s.student_name)}')" 
                     style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s;" 
                     onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <strong style="color: #0f172a;">${this._escape(s.full_name || s.student_name)}</strong> 
                    <small style="color: #64748b; float: left;">(ID: ${s.student_id || s.id})</small>
                </div>
            `).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error("فشل البحث:", err);
    }
};

AdminUI.selectStudentForPayment = async function(id, name) {
    document.getElementById("modal-payment-student-search").value = name;
    document.getElementById("modal-payment-student-id").value = id;
    document.getElementById("modal-payment-student-dropdown").style.display = "none";

    const feeSection = document.getElementById("modal-payment-fee-section");
    const feeSelect = document.getElementById("modal-payment-fee-id");
    
    feeSelect.innerHTML = '<option value="">جاري جلب ديون الطالب... ⏳</option>';
    feeSection.style.display = "block";
    document.getElementById("modal-payment-balance-box").style.display = "none";

    const typeLabels = {
        'tuition': 'مصاريف دراسية',
        'transport': 'نقل مدرسي',
        'activities': 'أنشطة',
        'exam': 'رسوم امتحانات',
        'other': 'أخرى'
    };

    try {
        // جلب ديون الطالب
        const feesRes = await Api.get(`/student-fees/student/${id}`);
        const fees = feesRes.data || feesRes || [];
        
        // 💡 التصحيح هنا: نعتمد فقط على `fee_id` ونتأكد من استخراجه 
        // استبعاد الرسوم التي تم دفعها بالكامل عن طريق حساب net_amount
        const unpaidFees = fees.filter(f => {
            const isFullyPaid = f.status === 'paid'; 
            return !isFullyPaid;
        });

        if (unpaidFees.length === 0) {
            feeSelect.innerHTML = '<option value="">هذا الطالب ليس لديه أي ديون أو فواتير مستحقة الدفع حالياً ✅.</option>';
            feeSelect.disabled = true;
        } else {
            feeSelect.innerHTML = '<option value="">-- اختر الرسم المالي المراد تسديده --</option>' + 
                unpaidFees.map(f => {
                    const actualFeeId = f.fee_id || f.id; // استخراج رقم الرسم بشكل مضمون
                    const labelType = typeLabels[f.fee_type] || f.fee_type;
                    return `<option value="${actualFeeId}">[رقم #${actualFeeId}] ${labelType} - مبلغ: ${f.net_amount || f.amount_due} دج</option>`;
                }).join("");
            feeSelect.disabled = false;
        }
    } catch (err) {
        feeSelect.innerHTML = '<option value="">فشل جلب ديون الطالب.</option>';
    }
};

AdminUI.fetchFeeBalanceForPayment = async function(feeId) {
    const detailsSection = document.getElementById("modal-payment-details-section");
    const submitBtn = document.getElementById("btn-submit-payment");
    const balanceBox = document.getElementById("modal-payment-balance-box");
    const amountInput = document.getElementById("modal-payment-amount");

    if (!feeId || feeId === "") {
        balanceBox.style.display = "none";
        return;
    }

    balanceBox.style.display = "block";
    document.getElementById("info-net-amount").innerHTML = "جاري الحساب... ⏳";

    try {
        // التأكد من طلب الرصيد بناءً على المعرف المختار من القائمة
        const balanceData = await Api.get(`/payments/fee/${feeId}/balance`);
        
        // ملاحظة: الـ Backend يرسل net_amount و total_paid و remaining_balance
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
        document.getElementById("info-net-amount").innerHTML = "خطأ في جلب البيانات";
        console.error("Balance Fetch Error:", err);
    }
};
AdminUI.submitPayment = async function() {
    const feeId = document.getElementById("modal-payment-fee-id").value;
    const amount = parseFloat(document.getElementById("modal-payment-amount").value);
    const receipt = document.getElementById("modal-payment-receipt").value.trim();
    const installment = parseInt(document.getElementById("modal-payment-installment").value) || 1;

    if (!feeId || isNaN(amount) || amount <= 0) {
        this.showToast("❌ يرجى اختيار الرسم وإدخال مبلغ صحيح أكبر من الصفر.", "error");
        return;
    }

    // تعطيل الزر لمنع الضغط المزدوج
    document.getElementById("btn-submit-payment").disabled = true;
    document.getElementById("btn-submit-payment").innerHTML = "جاري الحفظ... ⏳";

    try {
        await Api.post("/payments/", {
            fee_id: parseInt(feeId),
            amount_paid: amount,
            installment_number: installment,
            receipt_number: receipt || null
        });
        
        this.showToast("✅ تم تسجيل الدفعة المالية بنجاح.");
        this.closePaymentModal();
        AdminRole.loadSection("payments");

    } catch (err) {
        this.showToast("❌ فشل الحفظ: " + (err.message || "الرجاء التأكد من صحة البيانات."), "error");
        document.getElementById("btn-submit-payment").disabled = false;
        document.getElementById("btn-submit-payment").innerHTML = "تأكيد الدفع";
    }
};

// ==========================================
// وظيفة طباعة الإيصال (Xprinter format)
// ==========================================

AdminUI.printReceipt = function(paymentData) {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>طباعة إيصال #${paymentData.payment_id || paymentData.id}</title>
            <style>
                @page { margin: 0; }
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    text-align: center; 
                    width: 300px; 
                    margin: 0 auto; 
                    padding: 20px 10px; 
                    color: black;
                }
                .header-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                .subtitle { font-size: 14px; margin-bottom: 15px; }
                .line { border-bottom: 1px dashed black; margin: 15px 0; }
                .details { text-align: right; font-size: 14px; line-height: 1.8; }
                .details span { font-weight: bold; float: left; }
                .total { font-size: 18px; font-weight: bold; margin-top: 15px; border-top: 2px solid black; padding-top: 10px; }
                .footer { font-size: 12px; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class="header-title">المدرسة الحديثة</div>
            <div class="subtitle">نظام الإدارة المدرسي</div>
            
            <div class="line"></div>
            <h3 style="margin:5px 0;">إيصال استلام نقدية</h3>
            <p style="margin:5px 0; font-size:12px;">رقم الإيصال: ${paymentData.receipt_number || "REC-" + (paymentData.payment_id || paymentData.id)}</p>
            <div class="line"></div>
            
            <div class="details">
                <div>التاريخ: <span>${paymentData.payment_date || new Date().toISOString().split('T')[0]}</span></div>
                <div>الرقم المرجعي: <span>#${paymentData.payment_id || paymentData.id}</span></div>
                <div>اسم الطالب: <span>${this._escape(paymentData.student_name)}</span></div>
                <div>الرسم المستهدف: <span>#${paymentData.fee_id}</span></div>
                <div>القسط رقم: <span>${paymentData.installment_number || 1}</span></div>
            </div>
            
            <div class="total">
                المبلغ المدفوع: 
                <span style="float:left;">${this._formatCurrency(paymentData.amount_paid)}</span>
            </div>
            
            <div class="line"></div>
            
            <div class="footer">
                <p>تم استلام المبلغ الموضح أعلاه.</p>
                <p>شكراً لاختياركم مدرستنا!</p>
                <p style="margin-top: 20px;">توقيع أمين الصندوق</p>
                <p>.....................</p>
            </div>
            
            <script>
                window.onload = () => { 
                    window.print(); 
                    setTimeout(() => window.close(), 500); 
                }
            </script>
        </body>
        </html>
    `);
};

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
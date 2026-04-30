// frontend/js/roles/admin/tabs/fees.js

/**
 * واجهة إدارة الرسوم والديون (النسخة الاحترافية)
 * تتيح مراقبة المستحقات، فلترة الديون، إرسال التنبيهات، وإدارة السجلات عبر نوافذ ذكية
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

    // 2. حساب إجمالي المبالغ المستحقة (بعد خصم التخفيضات إن وجدت)
    const totalDue = fees.reduce((sum, f) => {
        const amount = (f.amount_due || 0) - (f.applied_discount || 0);
        return sum + (amount > 0 ? amount : 0);
    }, 0);

    // 3. قسم الملخص المالي العلوي
    const statsHeader = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #10b981;">
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">إجمالي الرسوم المعروضة</div>
                <div style="font-size: 1.6em; font-weight: bold; color: #0f172a; margin-top: 5px;">${this._formatCurrency(totalDue)}</div>
            </div>
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #ef4444;">
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">حالات تأخير الدفع</div>
                <div style="font-size: 1.6em; font-weight: bold; color: #ef4444; margin-top: 5px;">${overdueCount} <span style="font-size: 0.6em; color: #94a3b8;">سجل متأخر</span></div>
            </div>
            <div style="display: flex; align-items: center; justify-content: flex-end;">
                <button onclick="AdminUI.showFeeModal()" style="background: #0f172a; color: white; border: none; padding: 14px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s; font-size: 1.05em;">
                    <span>💰</span> إضافة رسم جديد
                </button>
            </div>
        </div>
    `;

    // 4. شريط البحث والفلترة
    const filterBar = `
        <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="font-weight: bold; color: #334155;">النوع:</label>
                <select id="fee-type-filter" onchange="AdminUI.filterFeesFromBackend()" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-weight: bold; outline: none;">
                    <option value="">الكل</option>
                    <option value="tuition">مصاريف دراسية</option>
                    <option value="transport">نقل مدرسي</option>
                    <option value="activities">أنشطة</option>
                    <option value="exam">رسوم امتحانات</option>
                </select>
            </div>
            <div style="flex: 1; min-width: 250px;">
                <input type="text" id="fee-search-input" placeholder="بحث باسم الطالب..." onkeyup="AdminUI.searchFeesLocal(this.value)" style="width: 100%; padding: 10px 15px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-weight: bold; box-sizing: border-box;">
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="AdminUI.loadOverdueOnly()" style="background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s;">⚠️ المتأخرات فقط</button>
                <button onclick="AdminRole.loadSection('studentFees')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s;">🔄 تحديث</button>
            </div>
        </div>
    `;

    // 5. الهيكل الأساسي للواجهة
    main.innerHTML = `
        ${statsHeader}
        ${filterBar}
        <div id="fees-table-container">
            ${this._generateFeesTableHtml(fees)}
        </div>

        <!-- النافذة المنبثقة: إضافة وتعديل الرسوم -->
        <div id="fee-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 500px; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 id="fee-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span>💰</span> إضافة رسم جديد
                </h3>
                
                <input type="hidden" id="modal-fee-id">

                <div id="modal-student-section" style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">الطالب المستهدف *</label>
                    <div style="position: relative;">
                        <input type="text" id="modal-fee-student-search" placeholder="ابحث باسم الطالب..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;" onkeyup="AdminUI.searchStudentForFee(this.value)">
                        <input type="hidden" id="modal-fee-student-id">
                        <div id="modal-fee-student-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10; margin-top: 5px;"></div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">نوع الرسم *</label>
                        <select id="modal-fee-type" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                            <option value="tuition">مصاريف دراسية</option>
                            <option value="transport">نقل مدرسي</option>
                            <option value="activities">أنشطة</option>
                            <option value="exam">رسوم امتحانات</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">تاريخ الاستحقاق *</label>
                        <input type="date" id="modal-fee-due-date" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">المبلغ الإجمالي (دج) *</label>
                        <input type="number" id="modal-fee-amount" min="0" value="0" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">تخفيض / منحة (دج)</label>
                        <input type="number" id="modal-fee-discount" min="0" value="0" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px;">
                    <button onclick="AdminUI.closeFeeModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitFee()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">حفظ السجل المالي</button>
                </div>
            </div>
        </div>

        <!-- النافذة المنبثقة: سجل الدفعات -->
        <div id="payments-view-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1001; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 600px; max-height: 80vh; display: flex; flex-direction: column; padding: 25px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                        <span>💳</span> سجل دفعات الرسم المالي
                    </h3>
                    <button onclick="AdminUI.closePaymentsModal()" style="background: #f1f5f9; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2em; color: #64748b;">&times;</button>
                </div>
                
                <div style="overflow-y: auto; flex: 1; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: right;">
                        <thead style="background: #f8fafc; position: sticky; top: 0;">
                            <tr>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;"># رقم الدفعة</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">تاريخ الدفع</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">المبلغ المدفوع</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">طريقة الدفع</th>
                            </tr>
                        </thead>
                        <tbody id="payments-modal-body">
                            <!-- سيتم تعبئة البيانات هنا -->
                        </tbody>
                    </table>
                </div>
                
                <button onclick="AdminUI.closePaymentsModal()" style="width: 100%; background: #0f172a; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold;">إغلاق السجل</button>
            </div>
        </div>

        <script>window.currentFeesData = ${JSON.stringify(fees)};</script>
    `;

    // إخفاء قائمة البحث عند النقر خارجها
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('modal-fee-student-dropdown');
        const searchInput = document.getElementById('modal-fee-student-search');
        if (dropdown && e.target !== searchInput && e.target !== dropdown) {
            dropdown.style.display = 'none';
        }
    });
};

/**
 * دالة بناء جدول الرسوم
 */
AdminUI._generateFeesTableHtml = function(fees) {
    if (!fees || fees.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                <span style="font-size: 4em; opacity: 0.5;">🧾</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">لا توجد سجلات مالية مطابقة.</p>
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

    const rows = fees.map(f => {
        const isOverdue = new Date(f.due_date) < new Date() && f.status !== 'paid';
        const statusLabel = isOverdue ? '⚠️ متأخر' : (f.status === 'paid' ? '✅ مدفوع' : '⏳ قيد الانتظار');
        const statusColor = isOverdue ? '#ef4444' : (f.status === 'paid' ? '#10b981' : '#f59e0b');
        const finalAmount = (f.amount_due || 0) - (f.applied_discount || 0);

        return `
        <tr style="border-bottom: 1px solid #e2e8f0; background: ${isOverdue ? '#fef2f2' : (f.status === 'paid' ? '#f0fdf4' : 'transparent')}; transition: 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${isOverdue ? '#fef2f2' : (f.status === 'paid' ? '#f0fdf4' : 'transparent')}'">
            <td style="padding: 15px; font-weight: bold; color: #64748b;">#${f.fee_id || f.id}</td>
            <td style="padding: 15px;">
                <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(f.student_name || "طالب #" + f.student_id)}</div>
                <small style="color: #64748b;">ID: ${f.student_id}</small>
            </td>
            <td style="padding: 15px; font-weight: bold; color: #334155;">
                ${typeLabels[f.fee_type] || f.fee_type}
            </td>
            <td style="padding: 15px; direction: ltr; text-align: right;">
                <div style="font-weight: bold; color: #0f172a; font-size: 1.1em;">${this._formatCurrency(finalAmount)}</div>
                ${f.applied_discount > 0 ? `<small style="color: #10b981;">(تخفيض: ${f.applied_discount} دج)</small>` : ''}
            </td>
            <td style="padding: 15px; color: ${isOverdue ? '#dc2626' : '#475569'}; font-weight: ${isOverdue ? 'bold' : 'normal'}; direction: ltr; text-align: right;">
                ${this._escape(f.due_date || "-")}
            </td>
            <td style="padding: 15px;">
                <span style="display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; background: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                    ${statusLabel}
                </span>
            </td>
            <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                ${!isOverdue && f.status !== 'paid' ? `<button onclick="AdminUI.sendFeeReminder(${f.student_id}, '${typeLabels[f.fee_type] || f.fee_type}')" title="إرسال تذكير بالدفع" style="background: #eff6ff; color: #2563eb; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">🔔</button>` : ''}
                ${isOverdue ? `<button onclick="AdminUI.sendFeeReminder(${f.student_id}, '${typeLabels[f.fee_type] || f.fee_type}')" title="تنبيه تأخير" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">⚠️ تنبيه</button>` : ''}
                
                <button onclick="AdminUI.viewFeePayments(${f.fee_id || f.id})" title="سجل الدفعات" style="background: #f0fdf4; color: #16a34a; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">💳 الدفعات</button>
                <button onclick='AdminUI.showFeeModal(${JSON.stringify(f).replace(/'/g, "&apos;")})' title="تعديل السجل" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">✏️</button>
                <button onclick="AdminRole.deleteItem('/student-fees', ${f.fee_id || f.id}, 'studentFees')" title="حذف" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">🗑️</button>
            </td>
        </tr>
    `}).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.95em; color: #475569;">
                إجمالي السجلات المعروضة: <strong style="color: #0f172a;">${fees.length}</strong>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">الطالب</th>
                            <th style="padding: 15px; color: #334155;">نوع الرسم</th>
                            <th style="padding: 15px; color: #334155;">المبلغ الصافي</th>
                            <th style="padding: 15px; color: #334155;">تاريخ الاستحقاق</th>
                            <th style="padding: 15px; color: #334155;">الحالة</th>
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
// وظائف الفلترة والبحث
// ==========================================

AdminUI.filterFeesFromBackend = async function() {
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

AdminUI.loadOverdueOnly = async function() {
    AdminUI.renderLoading();
    try {
        const data = await Api.get("/student-fees/overdue");
        AdminUI.renderFeesTab(data);
    } catch (err) {
        AdminUI.renderError("تعذر تحميل المتأخرات: " + err.message);
    }
};

AdminUI.searchFeesLocal = function(keyword) {
    keyword = keyword.toLowerCase().trim();
    const allFees = window.currentFeesData || [];
    const filtered = allFees.filter(f => {
        const studentName = (f.student_name || "").toLowerCase();
        return studentName.includes(keyword) || String(f.student_id).includes(keyword);
    });
    document.getElementById("fees-table-container").innerHTML = this._generateFeesTableHtml(filtered);
};


// ==========================================
// وظائف النافذة المنبثقة (Modal) للإضافة والتعديل
// ==========================================

AdminUI.showFeeModal = function(feeData = null) {
    const modal = document.getElementById("fee-modal");
    const title = document.getElementById("fee-modal-title");
    const studentSection = document.getElementById("modal-student-section");

    // تصفير الحقول
    document.getElementById("modal-fee-id").value = "";
    document.getElementById("modal-fee-student-id").value = "";
    document.getElementById("modal-fee-student-search").value = "";
    document.getElementById("modal-fee-type").value = "tuition";
    document.getElementById("modal-fee-amount").value = "0";
    document.getElementById("modal-fee-discount").value = "0";
    
    // تاريخ اليوم كافتراضي
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("modal-fee-due-date").value = today;

    if (feeData) {
        // وضع التعديل
        title.innerHTML = "<span>✏️</span> تعديل الرسم المالي";
        document.getElementById("modal-fee-id").value = feeData.fee_id || feeData.id;
        document.getElementById("modal-fee-type").value = feeData.fee_type || "tuition";
        document.getElementById("modal-fee-amount").value = feeData.amount_due || 0;
        document.getElementById("modal-fee-discount").value = feeData.applied_discount || 0;
        if (feeData.due_date) document.getElementById("modal-fee-due-date").value = feeData.due_date;
        
        // إخفاء حقل اختيار الطالب لأن التعديل لا يغير الطالب المرتبط
        studentSection.style.display = "none";
    } else {
        // وضع الإضافة
        title.innerHTML = "<span>💰</span> إضافة رسم جديد";
        studentSection.style.display = "block";
    }

    modal.style.display = "flex";
};

AdminUI.closeFeeModal = function() {
    document.getElementById("fee-modal").style.display = "none";
};

AdminUI.submitFee = async function() {
    const id = document.getElementById("modal-fee-id").value;
    const studentId = document.getElementById("modal-fee-student-id").value;
    const type = document.getElementById("modal-fee-type").value;
    const amount = parseInt(document.getElementById("modal-fee-amount").value) || 0;
    const discount = parseInt(document.getElementById("modal-fee-discount").value) || 0;
    const dueDate = document.getElementById("modal-fee-due-date").value;

    if (!id && !studentId) {
        this.showToast("❌ يرجى اختيار الطالب أولاً.", "error");
        return;
    }

    if (amount <= 0) {
        this.showToast("❌ يرجى إدخال مبلغ صحيح أكبر من الصفر.", "error");
        return;
    }

    try {
        if (id) {
            // تحديث (PUT)
            await Api.put(`/student-fees/${id}`, {
                fee_type: type,
                amount_due: amount,
                applied_discount: discount,
                due_date: dueDate || null
            });
            this.showToast("✅ تم تحديث السجل المالي بنجاح.");
        } else {
            // إنشاء جديد (POST)
            await Api.post("/student-fees/", {
                student_id: parseInt(studentId),
                fee_type: type,
                amount_due: amount,
                applied_discount: discount,
                due_date: dueDate || null
            });
            this.showToast("✅ تمت إضافة الرسم المالي للطالب بنجاح.");
        }
        
        this.closeFeeModal();
        AdminRole.loadSection("studentFees");

    } catch (err) {
        this.showToast("❌ فشل الحفظ: " + (err.message || "تأكد من صحة البيانات المدخلة."), "error");
    }
};

// ==========================================
// وظائف البحث التفاعلي عن الطلاب (Autocomplete)
// ==========================================

AdminUI.searchStudentForFee = async function(keyword) {
    const dropdown = document.getElementById("modal-fee-student-dropdown");
    
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
                <div onclick="AdminUI.selectStudentForFee(${s.student_id || s.id}, '${this._escape(s.full_name || s.student_name)}')" 
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

AdminUI.selectStudentForFee = function(id, name) {
    document.getElementById("modal-fee-student-search").value = name;
    document.getElementById("modal-fee-student-id").value = id;
    document.getElementById("modal-fee-student-dropdown").style.display = "none";
};

// ==========================================
// وظائف الإشعارات وسجل الدفعات
// ==========================================

AdminUI.sendFeeReminder = async function(studentId, feeType) {
    try {
        // إرسال الإشعار الصامت في الخلفية
        await Api.post("/notifications/", {
            user_id: studentId, // يفترض أن إشعار الطالب يذهب للـ user_id الخاص به
            title: "تذكير بسداد الرسوم 💳",
            message: `عزيزي الطالب، يرجى العلم بوجود رسوم مستحقة من نوع (${feeType}) بانتظار السداد لتجنب غرامات التأخير. شكراً لكم.`
        });
        this.showToast("🔔 تم إرسال إشعار التذكير للطالب بنجاح.");
    } catch (err) {
        this.showToast("❌ فشل إرسال الإشعار للطالب.", "error");
    }
};

AdminUI.viewFeePayments = async function(feeId) {
    const modal = document.getElementById("payments-view-modal");
    const tbody = document.getElementById("payments-modal-body");
    
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #64748b; font-weight: bold;">جاري جلب الدفعات... ⏳</td></tr>`;
    modal.style.display = "flex";

    try {
        const response = await Api.get(`/payments/fee/${feeId}`);
        const payments = response.data || response || [];

        if (payments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px;">
                        <span style="font-size: 3em; opacity: 0.3;">📉</span>
                        <p style="color: #64748b; font-size: 1.1em; margin-top: 10px;">لم يتم تسجيل أي دفعات لهذا الرسم حتى الآن.</p>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = payments.map(p => {
            const methodLabels = { 'cash': 'نقداً', 'card': 'بطاقة بنكية', 'transfer': 'حوالة', 'online': 'أونلاين' };
            return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px 15px; font-weight: bold; color: #64748b;">#${p.payment_id || p.id}</td>
                <td style="padding: 12px 15px; direction: ltr; text-align: right; color: #475569; font-weight: bold;">${this._escape(p.payment_date || "-")}</td>
                <td style="padding: 12px 15px; font-weight: bold; color: #16a34a; direction: ltr; text-align: right;">${this._formatCurrency(p.amount_paid)}</td>
                <td style="padding: 12px 15px;">
                    <span style="background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 0.9em; font-weight: bold; border: 1px solid #cbd5e1;">
                        ${methodLabels[p.payment_method] || p.payment_method || 'غير محدد'}
                    </span>
                </td>
            </tr>
            `;
        }).join("");

    } catch (err) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; background: #fef2f2; color: #dc2626; font-weight: bold;">
                    ❌ فشل جلب سجل الدفعات: ${err.message}
                </td>
            </tr>`;
    }
};

AdminUI.closePaymentsModal = function() {
    document.getElementById("payments-view-modal").style.display = "none";
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
// frontend/js/roles/admin/tabs/enrollments.js

/**
 * واجهة إدارة تسجيلات الطلاب
 * تربط الطلاب بالبرامج/الفصول الدراسية وتدير حالات الالتحاق باحترافية
 */
AdminUI.renderEnrollmentsTab = function(response) {
    const main = this.prepareMain("إدارة تسجيلات الطلاب");
    const enrollments = response.data || response || [];

    // 1. شريط الأدوات العُلوي
    main.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); gap: 15px; flex-wrap: wrap;">
            <div style="display: flex; gap: 10px; flex: 1; min-width: 300px;">
                <select id="enrollment-status-filter" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc; font-weight: bold; color: #334155;" onchange="AdminUI.filterEnrollments()">
                    <option value="">-- تصفية حسب الحالة (الكل) --</option>
                    <option value="active">🟢 نشط</option>
                    <option value="completed">🔵 مكتمل</option>
                    <option value="dropped">🔴 منسحب</option>
                </select>
                <button onclick="AdminRole.loadSection('enrollments')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; cursor: pointer; transition: 0.2s;" title="إعادة تحميل القائمة">
                    🔄 تحديث
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showAddEnrollmentModal()" style="background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s;">
                    <span>📝</span> تسجيل طالب في برنامج
                </button>
            </div>
        </div>

        <!-- حاوية الجدول -->
        <div id="enrollments-table-container">
            ${this._generateEnrollmentsTableHtml(enrollments)}
        </div>

        <!-- النافذة المنبثقة (Modal) الذكية للتسجيل -->
        <div id="add-enrollment-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 500px; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span>📝</span> إنشاء سجل التحاق جديد
                </h3>
                
                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">الطالب المراد تسجيله *</label>
                    <select id="modal-enroll-student" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                        <option value="">جاري تحميل قائمة الطلاب...</option>
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">البرنامج / الفصل الدراسي *</label>
                    <select id="modal-enroll-program" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                        <option value="">جاري تحميل البرامج...</option>
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">اسم الفوج / المجموعة (اختياري)</label>
                    <input type="text" id="modal-enroll-group" placeholder="مثال: الفوج أ، المجموعة الصباحية..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">ملاحظات الإدارة (اختياري)</label>
                    <textarea id="modal-enroll-notes" rows="3" placeholder="أي ملاحظات حول هذا التسجيل..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box; resize: vertical;"></textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px;">
                    <button onclick="AdminUI.closeEnrollmentModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitNewEnrollment()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">تأكيد التسجيل</button>
                </div>
            </div>
        </div>
    `;
};

/**
 * بناء جدول التسجيلات
 */
AdminUI._generateEnrollmentsTableHtml = function(enrollments) {
    if (enrollments.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <span style="font-size: 4em; opacity: 0.5;">📂</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">لا توجد سجلات تسجيل حالية تطابق بحثك.</p>
            </div>
        `;
    }

    const rows = enrollments.map(e => {
        // تحديد خلفية الصف حسب الحالة لتسهيل القراءة البصرية
        const rowBg = e.status === 'dropped' ? '#fef2f2' : (e.status === 'completed' ? '#f0f9ff' : 'transparent');

        return `
        <tr style="border-bottom: 1px solid #e2e8f0; background: ${rowBg}; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${rowBg}'">
            <td style="padding: 15px; font-weight: bold; color: #64748b;">#${e.enrollment_id}</td>
            <td style="padding: 15px;">
                <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(e.full_name || e.student_name)}</div>
                <small style="color: #64748b;">طالب رقم: #${e.student_id}</small>
            </td>
            <td style="padding: 15px;">
                <div style="color: #0f172a; font-weight: bold;">${this._escape(e.program_name || "برنامج #" + e.program_id)}</div>
                <div style="color: #0369a1; font-size: 0.85em; margin-top: 3px;">الفوج: ${this._escape(e.group_name || "عام")}</div>
            </td>
            <td style="padding: 15px; color: #475569; font-size: 0.9em; direction: ltr; text-align: right;">
                ${this._escape(e.enrollment_date || "-")}
            </td>
            <td style="padding: 15px;">
                <!-- تغيير الحالة مباشرة من الجدول عبر القائمة المنسدلة -->
                <select onchange="AdminUI.updateEnrollmentStatus(${e.enrollment_id}, this.value)" style="padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; font-weight: bold; cursor: pointer; background: white; color: ${e.status === 'active' ? '#16a34a' : (e.status === 'completed' ? '#2563eb' : '#dc2626')};">
                    <option value="active" ${e.status === 'active' ? 'selected' : ''}>🟢 نشط</option>
                    <option value="completed" ${e.status === 'completed' ? 'selected' : ''}>🔵 مكتمل</option>
                    <option value="dropped" ${e.status === 'dropped' ? 'selected' : ''}>🔴 منسحب</option>
                </select>
            </td>
            <td style="padding: 15px; text-align: left;">
                <button onclick="AdminUI.deleteEnrollmentItem(${e.enrollment_id})" title="إلغاء وحذف التسجيل" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s;">
                    🗑️ حذف
                </button>
            </td>
        </tr>
    `}).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 12px 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.9em; color: #475569;">
                إجمالي السجلات المعروضة: <strong style="color: #0f172a;">${enrollments.length}</strong>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">الطالب</th>
                            <th style="padding: 15px; color: #334155;">البرنامج والفوج</th>
                            <th style="padding: 15px; color: #334155;">تاريخ التسجيل</th>
                            <th style="padding: 15px; color: #334155;">الحالة (انقر للتعديل)</th>
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
// وظائف الفلترة والحالة
// ==========================================

AdminUI.filterEnrollments = async function() {
    const status = document.getElementById("enrollment-status-filter").value;
    AdminUI.renderLoading();
    try {
        const endpoint = status ? `/enrollments?status=${status}` : '/enrollments';
        const response = await Api.get(endpoint);
        this.renderEnrollmentsTab(response);
        document.getElementById("enrollment-status-filter").value = status;
    } catch (err) {
        this.renderError("فشل الفلترة: " + err.message);
    }
};

/**
 * تحديث حالة التسجيل مباشرة من القائمة المنسدلة في الجدول
 */
AdminUI.updateEnrollmentStatus = async function(enrollmentId, newStatus) {
    try {
        await Api.patch(`/enrollments/${enrollmentId}/status`, { status: newStatus });
        // إظهار إشعار سريع نجاح العملية بدون إزعاج المستخدم
        const toast = document.createElement("div");
        toast.innerText = "✅ تم تحديث حالة التسجيل بنجاح.";
        toast.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: #10b981; color: white; padding: 10px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; transition: opacity 0.5s;";
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '0', 2500);
        setTimeout(() => toast.remove(), 3000);
        
        // تحديث الجدول لضمان تغير لون الصف
        AdminRole.loadSection("enrollments");
    } catch (err) {
        alert("❌ فشل تحديث الحالة: " + err.message);
        AdminRole.loadSection("enrollments"); // إعادة تحميل لإرجاع القيمة القديمة
    }
};

AdminUI.deleteEnrollmentItem = async function(enrollmentId) {
    if (!confirm("هل أنت متأكد من حذف سجل التسجيل هذا بشكل نهائي؟")) return;
    try {
        await Api.delete(`/enrollments/${enrollmentId}`);
        AdminRole.loadSection("enrollments");
    } catch (err) {
        alert("تعذر الحذف: " + err.message);
    }
};

AdminUI.showAddEnrollmentModal = async function() {
    const modal = document.getElementById("add-enrollment-modal");
    modal.style.display = "flex";
    
    const studentSelect = document.getElementById("modal-enroll-student");
    const programSelect = document.getElementById("modal-enroll-program");

    studentSelect.innerHTML = '<option value="">جاري التحميل...</option>';
    programSelect.innerHTML = '<option value="">جاري التحميل...</option>';

    try {
        // 💡 التعديل هنا: جلب البيانات من مسار البرامج الصحيح بدلاً من الفصول
        const [studentsRes, programsRes] = await Promise.all([
            Api.get("/students/"),
            Api.get("/programs/") // تم تصحيح المسار ليتطابق مع جدول قاعدة البيانات
        ]);

        const students = studentsRes.data || studentsRes || [];
        const programs = programsRes.data || programsRes || [];

        studentSelect.innerHTML = '<option value="">-- يرجى اختيار الطالب --</option>' + 
            students.map(s => `<option value="${s.student_id || s.id}">${this._escape(s.full_name || s.student_name)} (#${s.student_id || s.id})</option>`).join("");

        programSelect.innerHTML = '<option value="">-- يرجى اختيار البرنامج الدراسي --</option>' + 
            programs.map(p => `<option value="${p.id || p.program_id}">${this._escape(p.program_name)}</option>`).join("");

    } catch (err) {
        studentSelect.innerHTML = '<option value="">❌ فشل جلب البيانات</option>';
        programSelect.innerHTML = '<option value="">❌ تأكد من وجود مسار /programs/</option>';
        console.error(err);
    }
};
AdminUI.closeEnrollmentModal = function() {
    document.getElementById("add-enrollment-modal").style.display = "none";
    // تفريغ الحقول
    document.getElementById("modal-enroll-student").value = "";
    document.getElementById("modal-enroll-program").value = "";
    document.getElementById("modal-enroll-group").value = "";
    document.getElementById("modal-enroll-notes").value = "";
};

AdminUI.submitNewEnrollment = async function() {
    const studentId = document.getElementById("modal-enroll-student").value;
    const programId = document.getElementById("modal-enroll-program").value;
    const groupName = document.getElementById("modal-enroll-group").value.trim();
    const notes = document.getElementById("modal-enroll-notes").value.trim();

    if (!studentId || !programId) {
        alert("يرجى التأكد من اختيار الطالب والبرنامج الدراسي.");
        return;
    }

    try {
        await Api.post("/enrollments/", {
            student_id: parseInt(studentId),
            program_id: parseInt(programId),
            group_name: groupName || null,
            notes: notes || null,
            status: 'active',
            enrollment_date: new Date().toISOString().split('T')[0]
        });
        
        alert("✅ تمت إضافة سجل التسجيل بنجاح.");
        this.closeEnrollmentModal();
        AdminRole.loadSection("enrollments");

    } catch (err) {
        alert("❌ فشل التسجيل: " + (err.message || "تأكد من عدم تكرار تسجيل الطالب في نفس البرنامج."));
    }
};
// frontend/js/roles/admin/tabs/enrollments.js

/**
 * واجهة إدارة تسجيلات الطلاب
 * تربط الطلاب بالبرامج الدراسية وتتحكم في حالة الالتحاق
 */
AdminUI.renderEnrollmentsTab = function(response) {
    const main = this.prepareMain("إدارة تسجيلات الطلاب");
    const enrollments = response.data || response || [];

    // 1. شريط الأدوات العُلوي
    const actionHeader = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); gap: 15px;">
            <div style="display: flex; gap: 10px; flex: 1;">
                <select id="enrollment-status-filter" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: white;" onchange="AdminUI.filterEnrollments()">
                    <option value="">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="completed">مكتمل</option>
                    <option value="dropped">منسحب</option>
                </select>
                <input type="text" id="enrollment-search" placeholder="بحث باسم الطالب..." style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none;">
            </div>
            <button onclick="AdminUI.showAddEnrollmentModal()" style="background: #064e3b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <span>📝</span> تسجيل جديد
            </button>
        </div>
    `;

    // 2. بناء الجدول
    let tableHtml = "";
    if (enrollments.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 1.1em;">لا توجد سجلات تسجيل حالية.</p>
            </div>
        `;
    } else {
        const rows = enrollments.map(e => {
            const statusStyles = {
                'active': { bg: '#dcfce7', text: '#166534', label: 'نشط' },
                'completed': { bg: '#dbeafe', text: '#1e40af', label: 'مكتمل' },
                'dropped': { bg: '#fef2f2', text: '#991b1b', label: 'منسحب' }
            };
            const style = statusStyles[e.status] || { bg: '#f1f5f9', text: '#475569', label: e.status };

            return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold;">#${e.enrollment_id}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: 600;">${this._escape(e.full_name || e.student_name)}</div>
                    <small style="color: #64748b;">رقم الطالب: ${e.student_id}</small>
                </td>
                <td style="padding: 15px;">
                    <div style="color: #0f172a;">${this._escape(e.program_name || "برنامج #" + e.program_id)}</div>
                    <small style="color: #0369a1;">الفوج: ${this._escape(e.group_name || "-")}</small>
                </td>
                <td style="padding: 15px; font-size: 0.9em;">${this._escape(e.enrollment_date || "-")}</td>
                <td style="padding: 15px;">
                    <span style="background: ${style.bg}; color: ${style.text}; padding: 4px 10px; border-radius: 20px; font-size: 0.8em; font-weight: bold;">
                        ${style.label}
                    </span>
                </td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="AdminUI.editEnrollmentStatus(${e.enrollment_id}, '${e.status}')" title="تغيير الحالة" style="background: white; border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; cursor: pointer;">🔄</button>
                    <button onclick="AdminRole.deleteItem('/enrollments', ${e.enrollment_id}, 'enrollments')" title="حذف" style="background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; padding: 6px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            </tr>
        `}).join("");

        tableHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px;">المعرف</th>
                            <th style="padding: 15px;">الطالب</th>
                            <th style="padding: 15px;">البرنامج / الفوج</th>
                            <th style="padding: 15px;">تاريخ التسجيل</th>
                            <th style="padding: 15px;">الحالة</th>
                            <th style="padding: 15px; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    main.innerHTML = actionHeader + tableHtml;
};

/**
 * فلترة التسجيلات حسب الحالة (تستدعي الـ API مع البارامترات)
 */
AdminUI.filterEnrollments = async function() {
    const status = document.getElementById("enrollment-status-filter").value;
    AdminUI.renderLoading();
    try {
        const endpoint = status ? `/enrollments?status=${status}` : '/enrollments';
        const data = await Api.get(endpoint);
        AdminUI.renderEnrollmentsTab(data);
        // الحفاظ على قيمة الاختيار بعد إعادة الرسم
        document.getElementById("enrollment-status-filter").value = status;
    } catch (err) {
        AdminUI.renderError("فشل الفلترة: " + err.message);
    }
};

/**
 * تغيير حالة التسجيل (نشط، مكتمل، منسحب)
 */
AdminUI.editEnrollmentStatus = async function(enrollmentId, currentStatus) {
    const statusOptions = {
        'active': 'نشط',
        'completed': 'مكتمل',
        'dropped': 'منسحب'
    };
    
    let optionsList = Object.entries(statusOptions)
        .map(([val, label]) => `${val}: ${label}`)
        .join("\n");

    const newStatus = prompt(`أدخل الحالة الجديدة للطلب #${enrollmentId}:\n${optionsList}`, currentStatus);
    
    if (newStatus && statusOptions[newStatus]) {
        try {
            await Api.patch(`/enrollments/${enrollmentId}/status`, { status: newStatus });
            alert("تم تحديث الحالة بنجاح.");
            AdminRole.loadSection("enrollments");
        } catch (err) {
            alert("فشل التحديث: " + err.message);
        }
    } else if (newStatus) {
        alert("حالة غير صالحة.");
    }
};

/**
 * إضافة تسجيل جديد (ربط طالب ببرنامج)
 */
AdminUI.showAddEnrollmentModal = async function() {
    const studentId = prompt("أدخل معرف الطالب (Student ID):");
    if (!studentId) return;

    const programId = prompt("أدخل معرف البرنامج (Program ID):");
    if (!programId) return;

    const groupName = prompt("اسم الفوج / المجموعة (اختياري):");
    const notes = prompt("ملاحظات إضافية (اختياري):");

    try {
        await Api.post("/enrollments/", {
            student_id: parseInt(studentId),
            program_id: parseInt(programId),
            group_name: groupName,
            notes: notes,
            status: 'active',
            enrollment_date: new Date().toISOString().split('T')[0]
        });
        alert("تمت عملية التسجيل بنجاح.");
        AdminRole.loadSection("enrollments");
    } catch (err) {
        alert("فشل عملية التسجيل: " + err.message);
    }
};
// frontend/js/roles/admin/tabs/teachers.js

/**
 * واجهة إدارة المعلمين
 * تشمل عرض القائمة، البحث عن التخصصات، وإدارة بيانات المعلمين
 */
AdminUI.renderTeachersTab = function(teachersData) {
    const main = this.prepareMain("إدارة الطاقم التعليمي");
    const teachers = teachersData || [];

    // 1. شريط الإجراءات والبحث العُلوي
    const actionHeader = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); gap: 15px;">
            <div style="display: flex; gap: 10px; flex: 1;">
                <input type="text" id="teacher-search-input" placeholder="ابحث باسم المعلم أو التخصص..." 
                       style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none;"
                       onkeypress="if(event.key === 'Enter') AdminUI.searchTeachers()">
                <button onclick="AdminUI.searchTeachers()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    بحث 🔍
                </button>
            </div>
            <button onclick="AdminUI.showAddTeacherModal()" style="background: #064e3b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                + إضافة معلم جديد
            </button>
        </div>
    `;

    // 2. بناء الجدول
    let tableHtml = "";
    if (teachers.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 8px;">
                <p style="color: #64748b;">لا يوجد معلمون مسجلون حالياً أو لم يتم العثور على نتائج.</p>
            </div>
        `;
    } else {
        const rows = teachers.map(t => `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #064e3b;">#${t.teacher_id}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: 600;">${this._escape(t.full_name || t.teacher_name)}</div>
                    <small style="color: #64748b;">المعرف: ${t.user_id}</small>
                </td>
                <td style="padding: 15px;">
                    <span style="background: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-size: 0.9em; font-weight: 500;">
                        ${this._escape(t.specialty || "غير محدد")}
                    </span>
                </td>
                <td style="padding: 15px; color: #64748b; font-size: 0.9em;">
                    ${this._escape(t.hire_date || "-")}
                </td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="AdminUI.viewTeacherSchedule(${t.teacher_id})" title="جدول الحصص" style="background: white; border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; cursor: pointer;">📅</button>
                    <button onclick="AdminUI.editTeacher(${t.teacher_id})" title="تعديل" style="background: white; border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; cursor: pointer;">✏️</button>
                    <button onclick="AdminRole.deleteItem('/teachers', ${t.teacher_id}, 'teachers')" title="حذف" style="background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; padding: 6px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            </tr>
        `).join("");

        tableHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px;">ID</th>
                            <th style="padding: 15px;">المعلم</th>
                            <th style="padding: 15px;">التخصص</th>
                            <th style="padding: 15px;">تاريخ التعيين</th>
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
 * دالة البحث عن المعلمين
 */
AdminUI.searchTeachers = async function() {
    const keyword = document.getElementById("teacher-search-input").value.trim();
    if (keyword.length < 2) {
        alert("يرجى إدخال حرفين على الأقل للبحث.");
        return;
    }

    AdminUI.renderLoading();
    try {
        const response = await Api.get(`/teachers/search?keyword=${encodeURIComponent(keyword)}`);
        AdminUI.renderTeachersTab(response);
        document.getElementById("teacher-search-input").value = keyword;
    } catch (err) {
        AdminUI.renderError("فشل البحث: " + err.message);
    }
};

/**
 * إضافة معلم جديد (ربط مستخدم موجود بدور معلم)
 */
AdminUI.showAddTeacherModal = async function() {
    const userId = prompt("أدخل معرف المستخدم (User ID) لتعيينه كمعلم:");
    if (!userId) return;

    const specialty = prompt("تخصص المعلم (مثال: رياضيات، فيزياء):");
    const hireDate = new Date().toISOString().split('T')[0]; // تاريخ اليوم كافتراضي

    try {
        await Api.post("/teachers/", {
            user_id: parseInt(userId),
            specialty: specialty,
            hire_date: hireDate
        });
        alert("تم تعيين المعلم بنجاح.");
        AdminRole.loadSection("teachers");
    } catch (err) {
        alert("فشل التعيين: " + err.message);
    }
};

/**
 * عرض جدول حصص المعلم (رؤية مستقبلية)
 */
AdminUI.viewTeacherSchedule = function(teacherId) {
    alert(`سيتم عرض جدول الحصص التفصيلي للمعلم رقم #${teacherId} قريباً.`);
};

/**
 * تعديل بيانات المعلم
 */
AdminUI.editTeacher = function(teacherId) {
    alert(`واجهة تعديل بيانات المعلم رقم #${teacherId} قيد التجهيز.`);
};
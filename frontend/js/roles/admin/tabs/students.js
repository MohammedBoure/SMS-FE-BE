// frontend/js/roles/admin/tabs/students.js

/**
 * واجهة إدارة الطلاب
 * تشمل عرض القائمة، البحث المتقدم، إدارة الحالة، وإضافة طلاب جدد
 */
AdminUI.renderStudentsTab = function(response) {
    const main = this.prepareMain("إدارة شؤون الطلاب");
    
    // استخراج البيانات (يدعم الاستجابة المباشرة أو الكائن الذي يحتوي على data و pagination)
    const students = response.data || response || [];
    const total = response.total || students.length;

    // 1. شريط الإجراءات والبحث العُلوي
    const actionHeader = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; gap: 10px; flex: 1; min-width: 300px;">
                <input type="text" id="student-search-input" placeholder="ابحث بالاسم أو المعرف..." 
                       style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none; font-size: 1rem;"
                       onkeypress="if(event.key === 'Enter') AdminUI.searchStudents()">
                <button onclick="AdminUI.searchStudents()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    بحث 🔍
                </button>
                <button onclick="AdminRole.loadSection('students')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; cursor: pointer;" title="إعادة تحميل القائمة">
                    🔄
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showAddStudentModal()" style="background: #064e3b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    + تسجيل طالب جديد
                </button>
            </div>
        </div>
    `;

    // 2. بناء الجدول
    let tableHtml = "";
    if (students.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="font-size: 3em;">🎓</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">لا يوجد طلاب مسجلين أو لم يتم العثور على نتائج مطابقة لبحثك.</p>
            </div>
        `;
    } else {
        const rows = students.map(s => {
            const isActive = s.status === 'active';
            const statusColor = isActive ? '#10b981' : '#ef4444';
            const statusBg = isActive ? '#dcfce7' : '#fee2e2';
            const statusText = isActive ? 'نشط' : 'معطل';

            return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #0f172a;">#${s.student_id || s.id}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: bold;">${this._escape(s.full_name || s.student_name)}</div>
                    <small style="color: #64748b;">معرف المستخدم: ${s.user_id}</small>
                </td>
                <td style="padding: 15px;">${this._escape(s.class_name || "غير مسجل بفصل")}</td>
                <td style="padding: 15px; direction: ltr; text-align: right;">${this._escape(s.date_of_birth || "-")}</td>
                <td style="padding: 15px;">
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 8px; border-radius: 12px; font-size: 0.85em; font-weight: bold;">
                        ${statusText}
                    </span>
                </td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 5px; justify-content: flex-end;">
                    <button onclick="AdminUI.viewStudentProfile(${s.student_id || s.id})" title="عرض الملف" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                        👁️
                    </button>
                    <button onclick="AdminUI.toggleStudentStatus(${s.student_id || s.id}, '${s.status}')" title="${isActive ? 'تعطيل الحساب' : 'تنشيط الحساب'}" style="background: #fffbeb; color: #d97706; border: 1px solid #fde68a; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                        ⚙️
                    </button>
                    <button onclick="AdminRole.deleteItem('/students', ${s.student_id || s.id}, 'students')" title="حذف" style="background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
                        🗑️
                    </button>
                </td>
            </tr>
        `}).join("");

        tableHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="padding: 10px 15px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 0.85em; color: #64748b;">
                    إجمالي النتائج المعروضة: <strong>${total}</strong> طالب
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: right;">
                        <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                            <tr>
                                <th style="padding: 15px;">المعرف</th>
                                <th style="padding: 15px;">الطالب</th>
                                <th style="padding: 15px;">الفصل</th>
                                <th style="padding: 15px;">تاريخ الميلاد</th>
                                <th style="padding: 15px;">الحالة</th>
                                <th style="padding: 15px; text-align: left;">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    main.innerHTML = actionHeader + tableHtml;
};

/**
 * دالة البحث عن الطلاب (تتصل بمسار /students/search)
 */
AdminUI.searchStudents = async function() {
    const keyword = document.getElementById("student-search-input").value.trim();
    if (keyword.length < 2) {
        alert("يرجى إدخال حرفين على الأقل للبحث.");
        return;
    }

    AdminUI.renderLoading();
    try {
        // الاتصال المباشر بالـ API أو عبر AdminServices
        const response = await Api.get(`/students/search?keyword=${encodeURIComponent(keyword)}`);
        AdminUI.renderStudentsTab(response);
        // إعادة تعيين قيمة البحث في الحقل بعد التحديث
        document.getElementById("student-search-input").value = keyword;
    } catch (err) {
        AdminUI.renderError("فشل البحث: " + err.message);
    }
};

/**
 * دالة لتغيير حالة الطالب (نشط / معطل)
 */
AdminUI.toggleStudentStatus = async function(studentId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const actionName = newStatus === 'active' ? 'تنشيط' : 'تعطيل';
    
    if (!confirm(`هل أنت متأكد من رغبتك في ${actionName} حساب هذا الطالب؟`)) return;

    try {
        await Api.patch(`/students/${studentId}/status`, { status: newStatus });
        // إعادة تحميل القسم لتحديث الجدول
        AdminRole.loadSection("students");
    } catch (err) {
        alert("فشل في تغيير حالة الطالب: " + err.message);
    }
};

/**
 * دالة سريعة لإضافة طالب (Prompt) - يُفضل استبدالها بـ Modal لاحقاً
 */
AdminUI.showAddStudentModal = async function() {
    const userId = prompt("أدخل المعرف (User ID) الخاص بحساب المستخدم لتعيينه كطالب:");
    if (!userId) return;

    const dob = prompt("أدخل تاريخ الميلاد (YYYY-MM-DD):", "2010-01-01");

    try {
        await Api.post("/students/", {
            user_id: parseInt(userId),
            date_of_birth: dob,
            status: 'active'
        });
        alert("تم تسجيل الطالب بنجاح.");
        AdminRole.loadSection("students");
    } catch (err) {
        alert("فشل التسجيل: تأكد من أن المستخدم موجود وليس طالباً بالفعل.\n" + err.message);
    }
};

/**
 * دالة لعرض ملف الطالب التفصيلي
 */
AdminUI.viewStudentProfile = function(studentId) {
    // هذه الدالة ستقوم مستقبلاً بفتح نافذة منبثقة تحتوي على 
    // تفاصيل الطالب، غياباته، مدفوعاته، ونتائجه.
    alert(`سيتم فتح الملف التفصيلي للطالب رقم #${studentId} قريباً.`);
};
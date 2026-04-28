// frontend/js/roles/admin/tabs/parents.js

/**
 * واجهة إدارة أولياء الأمور
 * تشمل عرض البيانات، حذف الدور، وعرض الطلاب المرتبطين بولي الأمر
 */
AdminUI.renderParentsTab = function(parentsData) {
    const main = this.prepareMain("إدارة أولياء الأمور");
    const parents = parentsData || [];

    // 1. هيكل الصفحة العلوي (أزرار الإجراءات)
    const actionHeader = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div>
                <button onclick="AdminUI.showAddParentModal()" style="background: #064e3b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                    <span>➕</span> ربط ولي أمر جديد مستخدم
                </button>
            </div>
            <div style="color: #64748b; font-size: 0.9em;">
                إجمالي أولياء الأمور: <strong>${parents.length}</strong>
            </div>
        </div>
    `;

    // 2. بناء الجدول
    let tableHtml = "";
    if (parents.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px;">
                <p style="color: #64748b;">لا يوجد أولياء أمور مسجلين حالياً.</p>
            </div>
        `;
    } else {
        const rows = parents.map(p => `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #064e3b;">#${p.parent_id}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: 600;">${this._escape(p.full_name)}</div>
                    <small style="color: #64748b;">اسم المستخدم: ${this._escape(p.username)}</small>
                </td>
                <td style="padding: 15px; direction: ltr; text-align: right;">${this._escape(p.phone || "-")}</td>
                <td style="padding: 15px;">
                    <button onclick="AdminUI.viewParentStudents(${p.parent_id}, '${this._escape(p.full_name)}')" 
                            style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">
                        👁️ عرض الأبناء
                    </button>
                </td>
                <td style="padding: 15px; text-align: left;">
                    <button onclick="AdminRole.deleteItem('/parents', ${p.parent_id}, 'parents')" 
                            style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">
                        حذف الدور
                    </button>
                </td>
            </tr>
        `).join("");

        tableHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px;">المعرف</th>
                            <th style="padding: 15px;">ولي الأمر</th>
                            <th style="padding: 15px;">الهاتف</th>
                            <th style="padding: 15px;">الأبناء (الطلاب)</th>
                            <th style="padding: 15px; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 3. حقن المحتوى في الصفحة
    main.innerHTML = `
        ${actionHeader}
        ${tableHtml}
        <div id="parent-students-modal-container"></div>
    `;
};

/**
 * دالة فرعية لجلب وعرض أبناء ولي أمر محدد
 */
AdminUI.viewParentStudents = async function(parentId, parentName) {
    try {
        // جلب قائمة الطلاب المرتبطين بولي الأمر عبر API
        const students = await AdminServices.getParentStudents(parentId);
        
        const container = document.getElementById("parent-students-modal-container");
        
        const studentList = students.length > 0 
            ? students.map(s => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
                    <div>
                        <span style="font-weight: bold;">${this._escape(s.full_name)}</span>
                        <br><small style="color: #64748b;">الفصل: ${this._escape(s.class_name || "غير محدد")}</small>
                    </div>
                    <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 0.75em;">طالب نشط</span>
                </div>
            `).join("")
            : `<p style="text-align: center; color: #64748b; padding: 20px;">لا يوجد أبناء مرتبطين بهذا الحساب حالياً.</p>`;

        // عرض النتائج في منطقة مخصصة (يمكن تحويلها لـ Modal لاحقاً)
        container.innerHTML = `
            <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #1e40af;">أبناء ولي الأمر: ${parentName}</h3>
                    <button onclick="document.getElementById('parent-students-modal-container').innerHTML=''" style="background: none; border: none; cursor: pointer; font-size: 1.5em;">&times;</button>
                </div>
                ${studentList}
            </div>
        `;
        
        // التمرير التلقائي للنتائج
        container.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        alert("فشل في جلب بيانات الأبناء: " + err.message);
    }
};

/**
 * دالة تجريبية لإظهار كيفية الربط (يمكن توسيعها بـ Modal حقيقي)
 */
AdminUI.showAddParentModal = function() {
    const userId = prompt("أدخل رقم معرف المستخدم (User ID) لتعيينه كولي أمر:");
    if (userId) {
        AdminRole.createParent(userId);
    }
};
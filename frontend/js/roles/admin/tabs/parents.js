// frontend/js/roles/admin/tabs/parents.js

/**
 * واجهة إدارة أولياء الأمور
 * تشمل عرض البيانات، ربط أولياء الأمور بالمستخدمين، وعرض أبنائهم
 */
AdminUI.renderParentsTab = function(parentsData) {
    const main = this.prepareMain("إدارة أولياء الأمور");
    const parents = parentsData.data || parentsData || [];

    // 1. هيكل الصفحة العلوي والنوافذ المنبثقة
    main.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div>
                <button onclick="AdminUI.showAddParentModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s;">
                    <span>➕</span> ربط مستخدم كولي أمر
                </button>
            </div>
            <div style="color: #64748b; font-size: 0.9em;">
                إجمالي أولياء الأمور: <strong style="color: #0f172a; font-size: 1.2em;">${parents.length}</strong>
            </div>
        </div>

        <div id="parents-table-container"></div>

        <div id="add-parent-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(2px);">
            <div style="background: white; width: 450px; padding: 25px; border-radius: 10px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">ربط ولي أمر جديد</h3>
                
                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">اختر المستخدم (الحساب):</label>
                    <select id="modal-parent-user-select" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc; font-size: 1em;">
                        <option value="">جاري تحميل المستخدمين...</option>
                    </select>
                    <small style="color: #64748b; display: block; margin-top: 8px;">يتم عرض المستخدمين الذين لديهم رتبة "ولي أمر" فقط.</small>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px;">
                    <button onclick="AdminUI.closeParentModal()" style="padding: 10px 15px; border: none; background: #e2e8f0; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitNewParent()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;">حفظ الربط</button>
                </div>
            </div>
        </div>

        <div id="view-students-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(2px);">
            <div style="background: white; width: 500px; padding: 25px; border-radius: 10px; box-shadow: 0 10px 15px rgba(0,0,0,0.1); max-height: 80vh; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">
                    <h3 id="students-modal-title" style="margin: 0; color: #1e40af;">أبناء ولي الأمر</h3>
                    <button onclick="AdminUI.closeStudentsModal()" style="background: #f1f5f9; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1.2em; color: #64748b; line-height: 1;">&times;</button>
                </div>
                
                <div id="students-list-container" style="overflow-y: auto; flex: 1; padding-right: 5px;">
                    </div>
            </div>
        </div>
    `;

    // 2. رسم الجدول
    const tableContainer = document.getElementById("parents-table-container");
    
    if (parents.length === 0) {
        tableContainer.innerHTML = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="font-size: 3em;">👨‍👩‍👧</span>
                <p style="color: #64748b; font-size: 1.1em;">لا يوجد أولياء أمور مسجلين حالياً.</p>
            </div>
        `;
    } else {
        const rows = parents.map(p => `
            <tr style="border-bottom: 1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #64748b;">#${p.parent_id}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: bold; color: #0f172a; font-size: 1.1em;">${this._escape(p.full_name)}</div>
                    <div style="color: #0369a1; font-size: 0.85em;">@${this._escape(p.username)}</div>
                </td>
                <td style="padding: 15px; direction: ltr; text-align: right; color: #475569;">📞 ${this._escape(p.phone || "غير متوفر")}</td>
                <td style="padding: 15px; text-align: center;">
                    <button onclick="AdminUI.viewParentStudents(${p.parent_id}, '${this._escape(p.full_name)}')" 
                            style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9em; font-weight: bold; transition: 0.2s;"
                            onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                        👁️ عرض الأبناء
                    </button>
                </td>
                <td style="padding: 15px; text-align: left;">
                    <button onclick="AdminUI.deleteParentItem(${p.parent_id})" 
                            style="background: #fef2f2; color: #ef4444; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 1.2em; transition: 0.2s;" title="حذف الدور"
                            onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join("");

        tableContainer.innerHTML = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">المعرف</th>
                            <th style="padding: 15px; color: #334155;">بيانات ولي الأمر</th>
                            <th style="padding: 15px; color: #334155;">رقم الهاتف</th>
                            <th style="padding: 15px; color: #334155; text-align: center;">الأبناء (الطلاب)</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }
};

AdminUI.showAddParentModal = async function() {
    const modal = document.getElementById("add-parent-modal");
    const select = document.getElementById("modal-parent-user-select");
    
    // إظهار النافذة المنبثقة
    modal.style.display = "flex";
    
    // وضع حالة التحميل في القائمة المنسدلة
    select.innerHTML = '<option value="">جاري تحميل قائمة المستخدمين... ⏳</option>';
    select.disabled = true;

    try {
        // جلب جميع المستخدمين من الـ API (ملف users_api.py)
        // ملاحظة: يمكنك فلترة الرتبة هنا إذا كان السيرفر يدعم ذلك مثل: /users/?role_name=parent
        const response = await Api.get("/users/");
        const users = response.data || response || [];
        
        if (users.length === 0) {
            select.innerHTML = '<option value="">لا يوجد مستخدمين مسجلين في النظام</option>';
            return;
        }

        // بناء القائمة المنسدلة بأسماء المستخدمين
        // القيمة (value) هي الـ ID، والنص المعروض هو الاسم الكامل واسم المستخدم
        let optionsHtml = '<option value="">-- اختر المستخدم الذي تريد تعيينه --</option>';
        optionsHtml += users.map(u => `
            <option value="${u.id}">
                ${this._escape(u.full_name)} (@${this._escape(u.username)})
            </option>
        `).join("");

        select.innerHTML = optionsHtml;
        select.disabled = false;

    } catch (err) {
        select.innerHTML = '<option value="">❌ فشل جلب البيانات</option>';
        console.error("Error loading users for parent assignment:", err);
    }
};

AdminUI.closeParentModal = function() {
    document.getElementById("add-parent-modal").style.display = "none";
};

AdminUI.submitNewParent = async function() {
    const userId = document.getElementById("modal-parent-user-select").value;
    
    if (!userId) {
        alert("يرجى اختيار مستخدم من القائمة أولاً.");
        return;
    }

    try {
        // إرسال الطلب إلى POST /parents/ كما هو محدد في parents_api.py
        await Api.post("/parents/", { 
            user_id: parseInt(userId) 
        });
        
        alert("✅ تم تعيين المستخدم كولي أمر بنجاح.");
        this.closeParentModal();
        
        // إعادة تحميل قسم أولياء الأمور لتحديث الجدول
        AdminRole.loadSection("parents");

    } catch (err) {
        // عرض رسالة الخطأ القادمة من الـ API (مثل: المستخدم مسجل بالفعل)
        alert("فشل الإضافة: " + (err.message || "حدث خطأ غير متوقع"));
    }
};

AdminUI.deleteParentItem = async function(parentId) {
    if (!confirm("هل أنت متأكد من إزالة دور ولي الأمر عن هذا الحساب؟\n(لن يتم حذف الحساب الأصلي للمستخدم)")) return;
    
    try {
        await AdminRole.deleteItem('/parents', parentId);
        // التحديث التلقائي للواجهة يتم داخل دالة deleteItem العامة، ولكن تحسباً:
        AdminRole.loadSection("parents");
    } catch (err) {
        console.error(err);
    }
};

// ==========================================
// وظائف نافذة عرض الأبناء (View Students Modal)
// ==========================================

AdminUI.viewParentStudents = async function(parentId, parentName) {
    const modal = document.getElementById("view-students-modal");
    const container = document.getElementById("students-list-container");
    
    document.getElementById("students-modal-title").innerText = `أبناء ولي الأمر: ${parentName}`;
    container.innerHTML = `<div style="text-align:center; padding: 20px; color: #64748b;">جاري جلب البيانات... ⏳</div>`;
    modal.style.display = "flex";

    try {
        const students = await AdminServices.getParentStudents(parentId);
        
        if (!students || students.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; background: #f8fafc; border-radius: 8px;">
                    <p style="color: #64748b; margin: 0;">لا يوجد أبناء مرتبطين بهذا الحساب حالياً.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(s => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; background: white; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="background: #e0f2fe; color: #0284c7; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2em; font-weight: bold;">
                        🎓
                    </div>
                    <div>
                        <div style="font-weight: bold; color: #0f172a; font-size: 1.1em;">${this._escape(s.full_name)}</div>
                        <div style="color: #64748b; font-size: 0.9em; margin-top: 3px;">🏫 الفصل: ${this._escape(s.class_name || "غير محدد")}</div>
                    </div>
                </div>
                <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold;">
                    مسجل
                </span>
            </div>
        `).join("");

    } catch (err) {
        container.innerHTML = `<div style="color: #ef4444; background: #fef2f2; padding: 15px; border-radius: 6px; border: 1px solid #fca5a5;">فشل في جلب البيانات: ${err.message}</div>`;
    }
};

AdminUI.closeStudentsModal = function() {
    document.getElementById("view-students-modal").style.display = "none";
};
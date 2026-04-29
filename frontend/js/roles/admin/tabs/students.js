// frontend/js/roles/admin/tabs/students.js

/**
 * واجهة إدارة الطلاب الشاملة
 * تشمل: عرض القائمة، البحث المتقدم، إدارة الحالة، إضافة طلاب، وعرض الملف التفصيلي
 */
AdminUI.renderStudentsTab = function(response) {
    const main = this.prepareMain("إدارة شؤون الطلاب");
    
    // استخراج البيانات (دعم الاستجابة المباشرة أو الكائن المحتوي على total)
    const students = response.data || response || [];
    const total = response.total || students.length;

    // 1. شريط الإجراءات والبحث العُلوي + هيكل النوافذ المنبثقة (Modals)
    main.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; gap: 10px; flex: 1; min-width: 300px;">
                <input type="text" id="student-search-input" placeholder="ابحث بالاسم أو المعرف..." 
                       style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none; font-size: 1rem;"
                       onkeypress="if(event.key === 'Enter') AdminUI.searchStudents()">
                <button onclick="AdminUI.searchStudents()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
                    بحث 🔍
                </button>
                <button onclick="AdminRole.loadSection('students')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; cursor: pointer; transition: 0.2s;" title="إعادة تحميل القائمة">
                    🔄
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showAddStudentModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s;">
                    ➕ تسجيل طالب جديد
                </button>
            </div>
        </div>

        <div id="students-table-container">
            ${this._generateStudentsTableHtml(students, total)}
        </div>

        <div id="add-student-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(2px);">
            <div style="background: white; width: 600px; padding: 25px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); max-height: 90vh; overflow-y: auto;">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <span>🎓</span> تسجيل طالب جديد في النظام
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                    <div style="grid-column: span 2;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #334155;">حساب المستخدم المرتبط *</label>
                        <select id="modal-std-user" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; outline: none;">
                            <option value="">جاري تحميل الحسابات...</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #334155;">الفصل الدراسي</label>
                        <select id="modal-std-class" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                            <option value="">-- بدون فصل حالياً --</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #334155;">ولي الأمر</label>
                        <select id="modal-std-parent" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                            <option value="">-- بدون ولي أمر --</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #334155;">تاريخ الميلاد</label>
                        <input type="date" id="modal-std-dob" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #334155;">فصيلة الدم</label>
                        <select id="modal-std-blood" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                            <option value="">-- غير محدد --</option>
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        </select>
                    </div>

                    <div style="grid-column: span 2;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #334155;">ملاحظات طبية (اختياري)</label>
                        <textarea id="modal-std-medical" rows="2" placeholder="حساسية، أدوية، الخ..." style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box; resize: vertical;"></textarea>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                    <button onclick="AdminUI.closeStudentModal()" style="padding: 10px 15px; border: none; background: #f1f5f9; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitNewStudent()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;">حفظ البيانات</button>
                </div>
            </div>
        </div>
    `;
};

/**
 * توليد كود HTML للجدول (دالة مساعدة داخلياً)
 */
AdminUI._generateStudentsTableHtml = function(students, total) {
    if (students.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="font-size: 4em; opacity: 0.5;">🎓</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">لا توجد نتائج مطابقة للبحث.</p>
            </div>`;
    }

    const rows = students.map(s => {
        const isActive = s.status === 'active';
        const statusColor = isActive ? '#10b981' : '#ef4444';
        const statusBg = isActive ? '#dcfce7' : '#fee2e2';

        return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px; font-weight: bold; color: #64748b;">#${s.student_id || s.id}</td>
            <td style="padding: 15px;">
                <div style="font-weight: bold; color: #0f172a;">${this._escape(s.full_name || s.student_name)}</div>
                <small style="color: #64748b;">حساب: #${s.user_id}</small>
            </td>
            <td style="padding: 15px;">
                <span style="background: #f1f5f9; color: #334155; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;">
                    ${this._escape(s.class_name || "غير مسجل بفصل")}
                </span>
            </td>
            <td style="padding: 15px; direction: ltr; text-align: right; color: #475569;">${this._escape(s.date_of_birth || "-")}</td>
            <td style="padding: 15px;">
                <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold;">
                    ${isActive ? 'نشط' : 'معطل'}
                </span>
            </td>
            <td style="padding: 15px; text-align: left; display: flex; gap: 5px; justify-content: flex-end;">
                <button onclick="AdminUI.viewStudentProfile(${s.student_id || s.id})" title="عرض الملف التفصيلي" style="background: #eff6ff; color: #1d4ed8; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s;">👁️</button>
                <button onclick="AdminUI.toggleStudentStatus(${s.student_id || s.id}, '${s.status}')" title="تغيير الحالة" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s;">⚙️</button>
                <button onclick="AdminRole.deleteItem('/students', ${s.student_id || s.id}, 'students')" title="حذف" style="background: #fef2f2; color: #b91c1c; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s;">🗑️</button>
            </td>
        </tr>`;
    }).join("");

    return `
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="padding: 12px 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.9em; color: #475569;">
                إجمالي الطلاب: <strong style="color: #0f172a;">${total}</strong>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">المعرف</th>
                            <th style="padding: 15px; color: #334155;">الطالب</th>
                            <th style="padding: 15px; color: #334155;">الفصل</th>
                            <th style="padding: 15px; color: #334155;">تاريخ الميلاد</th>
                            <th style="padding: 15px; color: #334155;">الحالة</th>
                            <th style="padding: 15px; color: #334155; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
};

// ==========================================
// وظائف البحث والإضافة وإدارة الحالة
// ==========================================

AdminUI.searchStudents = async function() {
    const keyword = document.getElementById("student-search-input").value.trim();
    if (keyword.length > 0 && keyword.length < 2) {
        alert("يرجى إدخال حرفين على الأقل للبحث.");
        return;
    }
    this.renderLoading();
    try {
        const url = keyword.length === 0 ? "/students/" : `/students/search?keyword=${encodeURIComponent(keyword)}`;
        const response = await Api.get(url);
        this.renderStudentsTab(response);
        if (keyword) document.getElementById("student-search-input").value = keyword;
    } catch (err) {
        this.renderError("فشل البحث: " + err.message);
    }
};

AdminUI.toggleStudentStatus = async function(studentId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (!confirm(`هل أنت متأكد من تغيير حالة هذا الطالب إلى ${newStatus === 'active' ? 'نشط' : 'معطل'}؟`)) return;

    try {
        await Api.patch(`/students/${studentId}/status`, { status: newStatus });
        AdminRole.loadSection("students");
    } catch (err) {
        alert("فشل في تغيير الحالة: " + err.message);
    }
};

AdminUI.showAddStudentModal = async function() {
    const modal = document.getElementById("add-student-modal");
    modal.style.display = "flex";
    
    const userSelect = document.getElementById("modal-std-user");
    const classSelect = document.getElementById("modal-std-class");
    const parentSelect = document.getElementById("modal-std-parent");

    userSelect.innerHTML = '<option value="">جاري التحميل...</option>';
    
    try {
        const [usersRes, classesRes, parentsRes] = await Promise.all([
            Api.get("/users/"),
            Api.get("/classes/"),
            Api.get("/parents/")
        ]);

        const users = usersRes.data || usersRes || [];
        const classes = classesRes.data || classesRes || [];
        const parents = parentsRes.data || parentsRes || [];

        userSelect.innerHTML = '<option value="">-- اختر حساب المستخدم --</option>' + 
            users.map(u => `<option value="${u.id}">${this._escape(u.full_name)} (@${this._escape(u.username)})</option>`).join("");

        classSelect.innerHTML = '<option value="">-- بدون فصل حالياً --</option>' + 
            classes.map(c => `<option value="${c.class_id || c.id}">${this._escape(c.class_name)}</option>`).join("");

        parentSelect.innerHTML = '<option value="">-- بدون ولي أمر --</option>' + 
            parents.map(p => `<option value="${p.parent_id}">${this._escape(p.full_name)}</option>`).join("");

    } catch (err) {
        userSelect.innerHTML = '<option value="">❌ فشل جلب البيانات</option>';
    }
};

AdminUI.closeStudentModal = function() {
    document.getElementById("add-student-modal").style.display = "none";
};

AdminUI.submitNewStudent = async function() {
    const userId = document.getElementById("modal-std-user").value;
    if (!userId) { alert("يرجى اختيار حساب مستخدم أولاً."); return; }

    const payload = {
        user_id: parseInt(userId),
        class_id: document.getElementById("modal-std-class").value ? parseInt(document.getElementById("modal-std-class").value) : null,
        parent_id: document.getElementById("modal-std-parent").value ? parseInt(document.getElementById("modal-std-parent").value) : null,
        date_of_birth: document.getElementById("modal-std-dob").value || null,
        blood_group: document.getElementById("modal-std-blood").value || null,
        medical_info: document.getElementById("modal-std-medical").value.trim() || null,
        status: 'active'
    };

    try {
        await Api.post("/students/", payload);
        alert("✅ تم تسجيل الطالب بنجاح.");
        this.closeStudentModal();
        AdminRole.loadSection("students");
    } catch (err) {
        alert("❌ فشل التسجيل: " + err.message);
    }
};

// ==========================================
// وظائف الملف التفصيلي للطالب (View Profile)
// ==========================================

AdminUI.viewStudentProfile = async function(studentId) {
    // إظهار نافذة تحميل مؤقتة
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "profile-loading-overlay";
    loadingDiv.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(2px);";
    loadingDiv.innerHTML = `<div style="background: white; padding: 25px; border-radius: 8px; text-align: center;">جاري تجميع ملف الطالب... ⏳</div>`;
    document.body.appendChild(loadingDiv);

    try {
        // جلب البيانات من كافة الـ APIs المرتبطة
        const [student, grades, attendance, fees, payments] = await Promise.all([
            Api.get(`/students/${studentId}`),
            Api.get(`/grades/student/${studentId}`).catch(() => []),
            Api.get(`/attendance/student/${studentId}/statistics`).catch(() => ({})),
            Api.get(`/student-fees/student/${studentId}`).catch(() => []),
            Api.get(`/payments/student/${studentId}`).catch(() => [])
        ]);

        document.getElementById("profile-loading-overlay").remove();

        // معالجة الحسابات المالية
        const feesData = fees.data || fees || [];
        const paymentsData = payments.data || payments || [];
        let totalDue = 0, totalPaid = 0;
        
        feesData.forEach(f => totalDue += (f.amount_due - (f.applied_discount || 0)));
        paymentsData.forEach(p => totalPaid += p.amount_paid);
        const balance = totalDue - totalPaid;

        const profileHtml = `
            <div id="student-profile-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1500; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
                <div style="background: #f8fafc; width: 850px; border-radius: 12px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; box-shadow: 0 20px 25px rgba(0,0,0,0.15);">
                    
                    <div style="background: white; padding: 20px 25px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 50px; height: 50px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.5em;">🎓</div>
                            <div>
                                <h2 style="margin: 0; color: #0f172a;">${this._escape(student.full_name || student.student_name)}</h2>
                                <small style="color: #64748b;">معرف الطالب: #${studentId}</small>
                            </div>
                        </div>
                        <button onclick="document.getElementById('student-profile-modal').remove()" style="background: #f1f5f9; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">&times;</button>
                    </div>

                    <div style="display: flex; background: white; border-bottom: 2px solid #e2e8f0; padding: 0 20px;">
                        <button onclick="AdminUI.switchProfileTab('personal')" class="prof-tab-btn active" data-tab="personal" style="padding: 15px; border: none; background: transparent; font-weight: bold; color: #2563eb; border-bottom: 3px solid #2563eb; cursor: pointer;">👤 شخصي</button>
                        <button onclick="AdminUI.switchProfileTab('academic')" class="prof-tab-btn" data-tab="academic" style="padding: 15px; border: none; background: transparent; font-weight: bold; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer;">📚 أكاديمي</button>
                        <button onclick="AdminUI.switchProfileTab('finance')" class="prof-tab-btn" data-tab="finance" style="padding: 15px; border: none; background: transparent; font-weight: bold; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer;">💳 مالي</button>
                    </div>

                    <div style="padding: 25px; overflow-y: auto; flex: 1;">
                        <div id="prof-tab-personal" class="prof-tab-content">
                            <p><strong>تاريخ الميلاد:</strong> ${this._escape(student.date_of_birth || "-")}</p>
                            <p><strong>فصيلة الدم:</strong> <span style="color: #dc2626;">${this._escape(student.blood_group || "-")}</span></p>
                            <p><strong>ملاحظات طبية:</strong> ${this._escape(student.medical_info || "لا يوجد")}</p>
                        </div>

                        <div id="prof-tab-academic" class="prof-tab-content" style="display: none;">
                            <h4 style="margin-bottom: 10px;">سجل العلامات</h4>
                            <table style="width: 100%; text-align: right; border-collapse: collapse;">
                                <thead style="background: #f8fafc;"><tr><th style="padding: 10px;">التقييم</th><th style="padding: 10px;">المادة</th><th style="padding: 10px;">العلامة</th></tr></thead>
                                <tbody>
                                    ${(grades.data || grades).map(g => `<tr><td style="padding: 8px;">${g.title}</td><td style="padding: 8px;">${g.subject_name}</td><td style="padding: 8px;"><b>${g.grade_value}</b> / ${g.max_grade}</td></tr>`).join("") || "<tr><td colspan='3' style='text-align:center;'>لا يوجد سجل درجات</td></tr>"}
                                </tbody>
                            </table>
                        </div>

                        <div id="prof-tab-finance" class="prof-tab-content" style="display: none;">
                            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                                <div style="flex: 1; background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center;">
                                    <small>إجمالي المسدد</small><br><b>${this._formatCurrency(totalPaid)}</b>
                                </div>
                                <div style="flex: 1; background: #fef2f2; padding: 15px; border-radius: 8px; text-align: center;">
                                    <small>المبلغ المتبقي</small><br><b style="color: #dc2626;">${this._formatCurrency(balance)}</b>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', profileHtml);

    } catch (err) {
        document.getElementById("profile-loading-overlay")?.remove();
        alert("فشل جلب ملف الطالب: " + err.message);
    }
};

AdminUI.switchProfileTab = function(tabName) {
    document.querySelectorAll('.prof-tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.prof-tab-btn').forEach(b => {
        b.style.color = '#64748b'; b.style.borderBottomColor = 'transparent';
    });
    document.getElementById(`prof-tab-${tabName}`).style.display = 'block';
    const activeBtn = document.querySelector(`.prof-tab-btn[data-tab="${tabName}"]`);
    activeBtn.style.color = '#2563eb'; activeBtn.style.borderBottomColor = '#2563eb';
};
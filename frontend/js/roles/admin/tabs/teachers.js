// frontend/js/roles/admin/tabs/teachers.js

/**
 * واجهة إدارة الطاقم التعليمي
 * تشمل عرض القائمة، البحث المتقدم، الإضافة/التعديل عبر النوافذ، وعرض الملف التفصيلي (الجدول والتكليفات)
 */
AdminUI.renderTeachersTab = function(teachersData) {
    const main = this.prepareMain("إدارة الطاقم التعليمي");
    const teachers = teachersData || [];

    // 1. شريط الإجراءات والبحث العُلوي + هيكل النوافذ المنبثقة
    main.innerHTML = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); gap: 15px; flex-wrap: wrap;">
            <div class="admin-toolbar-search" style="display: flex; gap: 10px; flex: 1; min-width: 300px;">
                <input type="text" id="teacher-search-input" placeholder="ابحث باسم المعلم أو التخصص..." 
                       style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none;"
                       onkeypress="if(event.key === 'Enter') AdminUI.searchTeachers()">
                <button onclick="AdminUI.searchTeachers()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
                    بحث 🔍
                </button>
                <button onclick="AdminRole.loadSection('teachers')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; cursor: pointer; transition: 0.2s;" title="إعادة تحميل القائمة">
                    🔄
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showTeacherModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s;">
                    ➕ إضافة معلم جديد
                </button>
            </div>
        </div>

        <div id="teachers-table-container">
            ${this._generateTeachersTableHtml(teachers)}
        </div>

        <div id="teacher-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(2px);">
            <div style="background: white; width: 500px; padding: 25px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                <h3 id="teacher-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <span>👨‍🏫</span> إضافة طاقم تعليمي
                </h3>
                
                <input type="hidden" id="modal-teacher-id">

                <div style="margin-top: 20px;" id="modal-teacher-user-container">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">حساب المستخدم (إجباري) *</label>
                    <select id="modal-teacher-user" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc;">
                        <option value="">جاري تحميل الحسابات...</option>
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">التخصص الأكاديمي</label>
                    <input type="text" id="modal-teacher-specialty" placeholder="مثال: رياضيات، فيزياء، لغة عربية..." style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">تاريخ التعيين</label>
                    <input type="date" id="modal-teacher-hire-date" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                    <button onclick="AdminUI.closeTeacherModal()" style="padding: 10px 15px; border: none; background: #f1f5f9; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitTeacher()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;">حفظ البيانات</button>
                </div>
            </div>
        </div>
    `;
};

/**
 * توليد كود HTML للجدول
 */
AdminUI._generateTeachersTableHtml = function(teachers) {
    if (teachers.length === 0) {
        return `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="font-size: 4em; opacity: 0.5;">👨‍🏫</span>
                <p style="color: #64748b; font-size: 1.1em;">لا يوجد معلمون مسجلون حالياً أو لم يتم العثور على نتائج.</p>
            </div>
        `;
    }

    const rows = teachers.map(t => `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px; font-weight: bold; color: #64748b;">#${t.teacher_id || t.id}</td>
            <td style="padding: 15px;">
                <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(t.full_name || t.teacher_name)}</div>
                <small style="color: #64748b;">حساب مستخدم: #${t.user_id}</small>
            </td>
            <td style="padding: 15px;">
                <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-size: 0.9em; font-weight: bold;">
                    ${this._escape(t.specialty || "عام")}
                </span>
            </td>
            <td style="padding: 15px; color: #475569; direction: ltr; text-align: right;">
                ${this._escape(t.hire_date || "-")}
            </td>
            <td style="padding: 15px; text-align: left; display: flex; gap: 6px; justify-content: flex-end;">
                <button onclick="AdminUI.viewTeacherProfile(${t.teacher_id || t.id})" title="الملف والجدول الزمني" style="background: #eff6ff; color: #1d4ed8; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">👁️ ملف</button>
                <button onclick='AdminUI.showTeacherModal(${JSON.stringify(t).replace(/'/g, "&apos;")})' title="تعديل التخصص والتاريخ" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">✏️ تعديل</button>
                <button onclick="AdminRole.deleteItem('/teachers', ${t.teacher_id || t.id}, 'teachers')" title="حذف" style="background: #fef2f2; color: #b91c1c; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">🗑️ حذف</button>
            </td>
        </tr>
    `).join("");

    return `
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="padding: 12px 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.9em; color: #475569;">
                إجمالي المعلمين: <strong style="color: #0f172a;">${teachers.length}</strong>
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">المعلم</th>
                            <th style="padding: 15px; color: #334155;">التخصص</th>
                            <th style="padding: 15px; color: #334155;">تاريخ التعيين</th>
                            <th style="padding: 15px; color: #334155; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

// ==========================================
// وظائف البحث والنافذة المنبثقة (Modal)
// ==========================================

AdminUI.searchTeachers = async function() {
    const keyword = document.getElementById("teacher-search-input").value.trim();
    if (keyword.length > 0 && keyword.length < 2) {
        alert("يرجى إدخال حرفين على الأقل للبحث.");
        return;
    }
    
    if (keyword.length === 0) return AdminRole.loadSection("teachers");

    AdminUI.renderLoading();
    try {
        const response = await Api.get(`/teachers/search?keyword=${encodeURIComponent(keyword)}`);
        this.renderTeachersTab(response);
        document.getElementById("teacher-search-input").value = keyword;
    } catch (err) {
        this.renderError("فشل البحث: " + err.message);
    }
};

AdminUI.showTeacherModal = async function(teacherData = null) {
    const modal = document.getElementById("teacher-modal");
    const title = document.getElementById("teacher-modal-title");
    const userContainer = document.getElementById("modal-teacher-user-container");
    const userSelect = document.getElementById("modal-teacher-user");

    // تصفير الحقول
    document.getElementById("modal-teacher-id").value = "";
    document.getElementById("modal-teacher-specialty").value = "";
    document.getElementById("modal-teacher-hire-date").value = new Date().toISOString().split('T')[0];

    if (teacherData) {
        // وضع التعديل (Edit)
        title.innerHTML = "<span>✏️</span> تعديل بيانات المعلم";
        userContainer.style.display = "none";
        document.getElementById("modal-teacher-id").value = teacherData.teacher_id || teacherData.id;
        document.getElementById("modal-teacher-specialty").value = teacherData.specialty || "";
        if (teacherData.hire_date) document.getElementById("modal-teacher-hire-date").value = teacherData.hire_date;
        
    } else {
        // وضع الإضافة (Add)
        title.innerHTML = "<span>👨‍🏫</span> إضافة معلم جديد";
        userContainer.style.display = "block";
        userSelect.innerHTML = '<option value="">جاري تحميل الحسابات...</option>';
        
        try {
            const usersRes = await Api.get("/users/");
            const users = usersRes.data || usersRes || [];
            userSelect.innerHTML = '<option value="">-- اختر حساب المستخدم --</option>' + 
                users.map(u => `<option value="${u.id}">${this._escape(u.full_name)} (@${this._escape(u.username)})</option>`).join("");
        } catch (err) {
            userSelect.innerHTML = '<option value="">❌ فشل جلب الحسابات</option>';
        }
    }

    modal.style.display = "flex";
};

AdminUI.closeTeacherModal = function() {
    document.getElementById("teacher-modal").style.display = "none";
};

AdminUI.submitTeacher = async function() {
    const id = document.getElementById("modal-teacher-id").value;
    const specialty = document.getElementById("modal-teacher-specialty").value.trim();
    const hireDate = document.getElementById("modal-teacher-hire-date").value;

    try {
        if (id) {
            await Api.put(`/teachers/${id}`, { specialty: specialty || null, hire_date: hireDate || null });
            alert("تم تحديث بيانات المعلم بنجاح.");
        } else {
            const userId = document.getElementById("modal-teacher-user").value;
            if (!userId) { alert("يرجى اختيار حساب مستخدم."); return; }
            await Api.post("/teachers/", { user_id: parseInt(userId), specialty: specialty || null, hire_date: hireDate || null });
            alert("تم إنشاء المعلم بنجاح.");
        }
        
        this.closeTeacherModal();
        AdminRole.loadSection("teachers");

    } catch (err) {
        alert("فشل الحفظ: " + (err.message || "تأكد من صحة البيانات أو عدم تكرار الحساب."));
    }
};

// ==========================================
// الملف التفصيلي للمعلم (Profile & Schedule)
// ==========================================

AdminUI.viewTeacherProfile = async function(teacherId) {
    // إظهار نافذة تحميل
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "teacher-profile-loading";
    loadingDiv.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(2px);";
    loadingDiv.innerHTML = `<div style="background: white; padding: 25px; border-radius: 8px; text-align: center;">جاري جلب ملف المعلم والجدول... ⏳</div>`;
    document.body.appendChild(loadingDiv);

    try {
        const [teacher, assignments, schedule] = await Promise.all([
            Api.get(`/teachers/${teacherId}`),
            Api.get(`/assignments/teacher/${teacherId}`).catch(() => []),
            Api.get(`/schedules/teacher/${teacherId}`).catch(() => [])
        ]);

        document.getElementById("teacher-profile-loading").remove();

        // 1. معالجة التكليفات
        const assignmentsHtml = assignments.length > 0 ? assignments.map(a => `
            <div style="background: white; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: bold; color: #0f172a;">${this._escape(a.subject_name)}</div>
                    <div style="color: #64748b; font-size: 0.9em;">الفصل: ${this._escape(a.class_name)}</div>
                </div>
                <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 12px; font-size: 0.85em;">القسم: ${this._escape(a.level || "عام")}</span>
            </div>
        `).join("") : `<div style="text-align: center; color: #64748b; padding: 20px;">لا توجد تكليفات مسجلة.</div>`;

        // 2. معالجة الجدول الزمني (مع الفلتر الذكي للوقت)
        const days = ["الأحد", "الأثنين", "الثلاثاء", "الأربعاء", "الخميس"];
        const scheduleMap = { "Sunday": "الأحد", "Monday": "الأثنين", "Tuesday": "الثلاثاء", "Wednesday": "الأربعاء", "Thursday": "الخميس" };
        const scheduleByDay = {};
        days.forEach(d => scheduleByDay[d] = []);

        // 💡 الفلتر الذكي لمعالجة الثواني
        const formatTime = (timeVal) => {
            if (timeVal === null || timeVal === undefined || timeVal === "") return "00:00";
            let strTime = String(timeVal);
            if (strTime.includes(':')) return strTime.slice(0, 5);
            const totalSeconds = parseFloat(strTime);
            if (!isNaN(totalSeconds)) {
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                return String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0');
            }
            return "00:00";
        };

        schedule.forEach(s => {
            const arabicDay = scheduleMap[s.day_of_week];
            if (arabicDay && scheduleByDay[arabicDay]) scheduleByDay[arabicDay].push(s);
        });

        const scheduleHtml = days.map(day => {
            const sessions = scheduleByDay[day].sort((a, b) => {
                return formatTime(a.start_time).localeCompare(formatTime(b.start_time));
            });
            if (sessions.length === 0) return "";
            
            return `
                <div style="margin-bottom: 20px;">
                    <h5 style="background: #e2e8f0; padding: 8px 12px; border-radius: 6px; margin: 0 0 10px 0; color: #334155;">${day}</h5>
                    ${sessions.map(s => `
                        <div style="display: flex; justify-content: space-between; background: white; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
                            <div>
                                <strong style="color: #0f172a;">${this._escape(s.subject_name)}</strong>
                                <span style="color: #64748b; margin-right: 10px; font-size: 0.9em;">🏫 فصل: ${this._escape(s.class_name)}</span>
                            </div>
                            <div style="color: #ef4444; font-weight: bold; direction: ltr;">
                                ${formatTime(s.start_time)} - ${formatTime(s.end_time)}
                            </div>
                        </div>
                    `).join("")}
                </div>
            `;
        }).join("") || `<div style="text-align: center; color: #64748b; padding: 20px;">الجدول الزمني فارغ.</div>`;

        // 3. بناء النافذة
        const profileModalHtml = `
            <div id="teacher-profile-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1500; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
                <div style="background: #f8fafc; width: 750px; border-radius: 12px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; box-shadow: 0 20px 25px rgba(0,0,0,0.15);">
                    
                    <div style="background: white; padding: 20px 25px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 50px; height: 50px; background: #f3e8ff; color: #7e22ce; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.5em;">👨‍🏫</div>
                            <div>
                                <h2 style="margin: 0; color: #0f172a;">${this._escape(teacher.full_name || teacher.teacher_name)}</h2>
                                <small style="color: #64748b;">تخصص: ${this._escape(teacher.specialty || "عام")} | تعيين: ${this._escape(teacher.hire_date || "-")}</small>
                            </div>
                        </div>
                        <button onclick="document.getElementById('teacher-profile-modal').remove()" style="background: #f1f5f9; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;">&times;</button>
                    </div>

                    <div style="display: flex; background: white; border-bottom: 2px solid #e2e8f0; padding: 0 20px;">
                        <button onclick="AdminUI.switchTeacherTab('assignments')" class="tch-tab-btn active" data-tab="assignments" style="padding: 15px; border: none; background: transparent; font-weight: bold; color: #2563eb; border-bottom: 3px solid #2563eb; cursor: pointer;">📚 الفصول والتكليفات</button>
                        <button onclick="AdminUI.switchTeacherTab('schedule')" class="tch-tab-btn" data-tab="schedule" style="padding: 15px; border: none; background: transparent; font-weight: bold; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer;">📅 الجدول الزمني</button>
                    </div>

                    <div style="padding: 25px; overflow-y: auto; flex: 1;">
                        <div id="tch-tab-assignments" class="tch-tab-content">
                            ${assignmentsHtml}
                        </div>
                        <div id="tch-tab-schedule" class="tch-tab-content" style="display: none;">
                            ${scheduleHtml}
                        </div>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', profileModalHtml);

    } catch (err) {
        document.getElementById("teacher-profile-loading")?.remove();
        alert("فشل جلب تفاصيل المعلم: " + err.message);
    }
};

AdminUI.switchTeacherTab = function(tabName) {
    document.querySelectorAll('.tch-tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.tch-tab-btn').forEach(b => {
        b.style.color = '#64748b'; b.style.borderBottomColor = 'transparent';
    });
    document.getElementById(`tch-tab-${tabName}`).style.display = 'block';
    const activeBtn = document.querySelector(`.tch-tab-btn[data-tab="${tabName}"]`);
    activeBtn.style.color = '#2563eb'; activeBtn.style.borderBottomColor = '#2563eb';
};

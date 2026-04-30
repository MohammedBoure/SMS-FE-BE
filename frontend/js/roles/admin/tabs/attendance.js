// frontend/js/roles/admin/tabs/attendance.js

/**
 * واجهة إدارة الحضور والغياب
 * تم تصحيح مشكلة جلب الحالة (status) وتمت إضافة البحث التفاعلي (Autocomplete) بالاسم
 */
AdminUI.renderAttendanceTab = async function() {
    const main = this.prepareMain("إدارة سجلات الحضور والغياب");

    main.innerHTML = `<div style="text-align:center; padding: 50px; color: #64748b; font-weight: bold;">جاري تجهيز لوحة الحضور... ⏳</div>`;

    let classes = [];
    try {
        const response = await Api.get("/classes/");
        classes = response.data || response || [];
    } catch (err) {
        console.error("فشل في جلب الفصول", err);
    }

    const classOptions = classes.map(c => `<option value="${c.class_id || c.id}">${this._escape(c.class_name)} (${this._escape(c.level || "عام")})</option>`).join("");
    const today = new Date().toISOString().split('T')[0];

    // الهيكل الأساسي للصفحة
    main.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 25px;">
            
            <!-- قسم تسجيل حضور فصل -->
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #064e3b;">
                <h3 style="margin-top: 0; color: #064e3b; display: flex; align-items: center; gap: 8px;"><span>📝</span> تسجيل حضور فصل</h3>
                <p style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">اختر الفصل والتاريخ لاستعراض القائمة وتسجيل الحالات.</p>
                
                <div style="display: flex; gap: 10px;">
                    <select id="attendance-class-select" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; flex: 1; outline: none; background: #f8fafc; font-weight: bold; color: #334155;">
                        <option value="">-- يرجى اختيار الفصل --</option>
                        ${classOptions}
                    </select>
                    <input type="date" id="attendance-date" value="${today}" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-weight: bold; color: #334155;">
                </div>
                <button onclick="AdminUI.loadClassSheet()" style="margin-top: 15px; width: 100%; background: #064e3b; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05em; transition: 0.2s; box-shadow: 0 4px 6px rgba(6,78,59,0.2);">
                    عرض ورقة الحضور
                </button>
            </div>

            <!-- قسم البحث عن سجل طالب (تم تحديثه ليدعم البحث بالاسم) -->
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #1e40af; display: flex; align-items: center; gap: 8px;"><span>🔍</span> سجل غيابات طالب</h3>
                <p style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">ابحث باسم الطالب لعرض سجله وإدارة تبريراته.</p>
                
                <div style="display: flex; gap: 10px; position: relative;">
                    <div style="position: relative; flex: 1;">
                        <input type="text" id="attendance-student-search" placeholder="ابحث باسم الطالب..." 
                               style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; outline: none; font-weight: bold; box-sizing: border-box;"
                               onkeyup="AdminUI.searchStudentForAttendance(this.value)">
                        
                        <!-- حقل مخفي لتخزين الـ ID بعد اختيار الاسم -->
                        <input type="hidden" id="attendance-student-id">
                        
                        <!-- القائمة المنسدلة لنتائج البحث -->
                        <div id="attendance-student-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; z-index: 10; margin-top: 5px;"></div>
                    </div>
                </div>
                <button onclick="AdminUI.loadStudentAttendance()" style="margin-top: 15px; width: 100%; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05em; transition: 0.2s; box-shadow: 0 4px 6px rgba(59,130,246,0.2);">
                    عرض السجل الفردي
                </button>
            </div>

        </div>

        <!-- حاوية النتائج والجداول -->
        <div id="attendance-results-container" style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 25px; min-height: 400px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; color: #94a3b8; margin-top: 100px;">
                <span style="font-size: 4em; opacity: 0.5;">📋</span>
                <p style="font-size: 1.1em; margin-top: 15px;">البيانات ستظهر هنا بعد إجراء البحث أو اختيار الفصل من الأعلى.</p>
            </div>
        </div>

        <!-- النوافذ المنبثقة (Modals) للإحصائيات والتبريرات تبقى كما هي -->
        <div id="justification-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 450px; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;"><span>📝</span> تعديل تبرير الغياب</h3>
                <input type="hidden" id="modal-just-attendance-id">
                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">حالة التبرير:</label>
                    <select id="modal-just-status" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc; font-weight: bold;" onchange="document.getElementById('modal-just-reason').disabled = this.value === 'false'">
                        <option value="true">✅ غياب مبرر</option>
                        <option value="false">❌ غياب غير مبرر</option>
                    </select>
                </div>
                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">ملاحظات / سبب الغياب:</label>
                    <textarea id="modal-just-reason" rows="3" placeholder="أدخل تفاصيل التبرير (شهادة طبية، ظروف عائلية...)" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box; resize: vertical;"></textarea>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px;">
                    <button onclick="AdminUI.closeAttendanceModals()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitJustification()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">حفظ التعديلات</button>
                </div>
            </div>
        </div>

        <div id="stats-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 500px; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;"><span>📊</span> إحصائيات المواظبة</h3>
                    <button onclick="AdminUI.closeAttendanceModals()" style="background: #f1f5f9; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2em; color: #64748b;">&times;</button>
                </div>
                <div id="stats-modal-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;"></div>
                <button onclick="AdminUI.closeAttendanceModals()" style="margin-top: 25px; width: 100%; background: #0f172a; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold;">إغلاق</button>
            </div>
        </div>
    `;

    // إخفاء القائمة المنسدلة عند النقر خارجها
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('attendance-student-dropdown');
        const searchInput = document.getElementById('attendance-student-search');
        if (dropdown && e.target !== searchInput && e.target !== dropdown) {
            dropdown.style.display = 'none';
        }
    });
};

// ==========================================
// وظائف البحث الحي عن الطلاب (Autocomplete)
// ==========================================

AdminUI.searchStudentForAttendance = async function(keyword) {
    const dropdown = document.getElementById("attendance-student-dropdown");
    
    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/students/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const students = response.data || [];

        if (students.length === 0) {
            dropdown.innerHTML = `<div style="padding: 12px; color: #64748b; text-align: center; font-size: 0.9em;">لا توجد نتائج مطابقة</div>`;
        } else {
            dropdown.innerHTML = students.map(s => `
                <div onclick="AdminUI.selectStudentForAttendance(${s.student_id || s.id}, '${this._escape(s.full_name || s.student_name)}')" 
                     style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; display: flex; justify-content: space-between;" 
                     onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <strong style="color: #0f172a;">${this._escape(s.full_name || s.student_name)}</strong> 
                    <small style="color: #64748b;">(رقم: ${s.student_id || s.id})</small>
                </div>
            `).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error("فشل البحث في القائمة المنسدلة:", err);
    }
};

AdminUI.selectStudentForAttendance = function(id, name) {
    document.getElementById("attendance-student-search").value = name;
    document.getElementById("attendance-student-id").value = id;
    document.getElementById("attendance-student-dropdown").style.display = "none";
    
    // تشغيل البحث تلقائياً بعد اختيار الطالب
    this.loadStudentAttendance();
};


// ==========================================
// وظائف تسجيل حضور الفصول (تم تصحيح الحالة)
// ==========================================

AdminUI.loadClassSheet = async function() {
    const classId = document.getElementById("attendance-class-select").value;
    const date = document.getElementById("attendance-date").value;
    const container = document.getElementById("attendance-results-container");

    if (!classId || !date) {
        alert("يرجى اختيار الفصل والتاريخ أولاً.");
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 50px; font-weight: bold;">جاري جلب القائمة من السيرفر... ⏳</div>`;

    try {
        const sheet = await Api.get(`/attendance/class/${classId}/sheet?target_date=${date}`);
        const students = sheet.data || sheet || [];

        if (students.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 40px; border: 1px dashed #cbd5e1; border-radius: 12px;"><span style="font-size: 3em; opacity: 0.5;">🚷</span><p style="color: #64748b; margin-top: 15px;">لا يوجد طلاب مسجلين في هذا الفصل حالياً.</p></div>`;
            return;
        }

        const rows = students.map(s => {
            // 💡 الحل: التحقق من status أو attendance_status بناءً على إرجاع الخادم
            const currentStatus = s.status || s.attendance_status || 'present';
            // التحقق مما إذا كان الطالب لديه سجل محفوظ مسبقاً
            const isSaved = s.attendance_id != null || s.status != null;
            
            return `
            <tr class="attendance-row" data-studentid="${s.student_id}" style="border-bottom: 1px solid #e2e8f0; background: ${isSaved ? '#f8fafc' : 'transparent'};">
                <td style="padding: 15px; font-weight: bold; color: #64748b;">#${s.student_id}</td>
                <td style="padding: 15px; font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(s.student_name)}</td>
                <td style="padding: 15px;">
                    <select id="status-${s.student_id}" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; background: white; font-weight: bold; cursor: pointer;">
                        <option value="present" ${currentStatus === 'present' ? 'selected' : ''}>🟢 حاضر</option>
                        <option value="absent" ${currentStatus === 'absent' ? 'selected' : ''}>🔴 غائب</option>
                        <option value="late" ${currentStatus === 'late' ? 'selected' : ''}>🟠 متأخر</option>
                    </select>
                </td>
                <td style="padding: 15px;">
                    <input type="text" id="reason-${s.student_id}" placeholder="سبب (إن وجد)..." value="${this._escape(s.justification_reason || '')}" style="padding: 8px 12px; width: 90%; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                </td>
                <td style="padding: 15px; text-align: left;">
                    <button id="btn-save-${s.student_id}" onclick="AdminUI.saveSingleAttendance(${s.student_id}, '${date}')" style="background: ${isSaved ? '#10b981' : '#f59e0b'}; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s;">
                        ${isSaved ? 'تم الحفظ ✓' : 'حفظ'}
                    </button>
                </td>
            </tr>
        `}).join("");

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #0f172a;">ورقة الحضور ليوم: <span style="direction: ltr; display: inline-block; color: #2563eb;">${date}</span></h3>
                <button onclick="AdminUI.saveAllAttendance('${date}')" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(16,185,129,0.2); transition: 0.2s;">
                    💾 حفظ ورقة الفصل بالكامل
                </button>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">اسم الطالب</th>
                            <th style="padding: 15px; color: #334155;">الحالة</th>
                            <th style="padding: 15px; color: #334155;">ملاحظات / تبرير</th>
                            <th style="padding: 15px; color: #334155; text-align: left;">إجراء فردي</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fca5a5; font-weight: bold;">فشل تحميل القائمة: ${err.message}</div>`;
    }
};

AdminUI.saveSingleAttendance = async function(studentId, targetDate) {
    const status = document.getElementById(`status-${studentId}`).value;
    const reason = document.getElementById(`reason-${studentId}`).value.trim();
    const isJustified = reason.length > 0;

    try {
        await Api.post("/attendance/", {
            student_id: studentId,
            target_date: targetDate,
            status: status,
            is_justified: isJustified,
            justification_reason: reason || null
        });
        
        const btn = document.getElementById(`btn-save-${studentId}`);
        btn.style.background = "#10b981";
        btn.innerText = "تم الحفظ ✓";
        this.showToast("تم حفظ السجل بنجاح.");
    } catch (err) {
        alert("فشل الحفظ: " + err.message);
    }
};

AdminUI.saveAllAttendance = async function(targetDate) {
    const rows = document.querySelectorAll(".attendance-row");
    if (rows.length === 0) return;

    const btnAll = document.querySelector("button[onclick^='AdminUI.saveAllAttendance']");
    const originalText = btnAll.innerHTML;
    btnAll.innerHTML = "جاري الحفظ... ⏳";
    btnAll.disabled = true;

    const promises = Array.from(rows).map(row => {
        const studentId = row.dataset.studentid;
        const status = document.getElementById(`status-${studentId}`).value;
        const reason = document.getElementById(`reason-${studentId}`).value.trim();
        
        return Api.post("/attendance/", {
            student_id: parseInt(studentId),
            target_date: targetDate,
            status: status,
            is_justified: reason.length > 0,
            justification_reason: reason || null
        }).then(() => {
            const btn = document.getElementById(`btn-save-${studentId}`);
            btn.style.background = "#10b981";
            btn.innerText = "تم الحفظ ✓";
        });
    });

    try {
        await Promise.all(promises);
        this.showToast("✅ تم حفظ ورقة الحضور للفصل بالكامل بنجاح!");
    } catch (err) {
        alert("حدث خطأ أثناء حفظ بعض السجلات. يرجى المراجعة والمحاولة مرة أخرى.");
    } finally {
        btnAll.innerHTML = originalText;
        btnAll.disabled = false;
    }
};

// ==========================================
// وظائف السجل الفردي للطالب (كما هي مع تصحيح بسيط للألوان)
// ==========================================

AdminUI.loadStudentAttendance = async function() {
    const studentId = document.getElementById("attendance-student-id").value;
    const container = document.getElementById("attendance-results-container");

    if (!studentId) {
        alert("يرجى اختيار طالب من القائمة أو إدخال رقمه أولاً.");
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 50px; font-weight: bold;">جاري جلب سجل الطالب... ⏳</div>`;

    try {
        const history = await Api.get(`/attendance/student/${studentId}`);
        const records = history.data || history || [];

        if (records.length === 0) {
            container.innerHTML = `
                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 30px; border-radius: 12px; text-align: center;">
                    <span style="font-size: 3em;">🌟</span>
                    <h3 style="margin: 10px 0 0 0;">سجل الطالب نظيف!</h3>
                    <p style="margin-top: 5px;">لا توجد أي غيابات أو تأخيرات مسجلة لهذا الطالب.</p>
                </div>`;
            return;
        }

        const rows = records.map(r => {
            const isAbsent = r.status === 'absent';
            const statusLabel = isAbsent ? '🔴 غائب' : (r.status === 'late' ? '🟠 متأخر' : '🟢 حاضر');
            const statusColor = isAbsent ? '#dc2626' : (r.status === 'late' ? '#d97706' : '#16a34a');
            const attendanceId = r.id || r.attendance_id;
            
            return `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${isAbsent && !r.is_justified ? '#fef2f2' : 'transparent'};">
                <td style="padding: 15px; font-weight: bold; direction: ltr; text-align: right; color: #475569;">${this._escape(r.date || r.target_date)}</td>
                <td style="padding: 15px; font-weight: bold; color: ${statusColor};">${statusLabel}</td>
                <td style="padding: 15px;">
                    <span style="background: ${r.is_justified ? '#dcfce7' : '#fee2e2'}; color: ${r.is_justified ? '#166534' : '#991b1b'}; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold;">
                        ${r.is_justified ? '✔️ مبرر' : '❌ غير مبرر'}
                    </span>
                </td>
                <td style="padding: 15px; color: #64748b;">${this._escape(r.justification_reason || "-")}</td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="AdminUI.showJustificationModal(${attendanceId}, ${r.is_justified}, '${this._escape(r.justification_reason || '')}')" style="background: #fffbeb; border: none; color: #d97706; padding: 8px; border-radius: 6px; cursor: pointer;" title="تعديل التبرير">📝</button>
                    <button onclick="AdminRole.deleteItem('/attendance', ${attendanceId}, 'attendance')" style="background: #fef2f2; border: none; color: #dc2626; padding: 8px; border-radius: 6px; cursor: pointer;" title="حذف السجل">🗑️</button>
                </td>
            </tr>
        `}).join("");

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #0f172a;">سجل الغيابات والتأخيرات للطالب <span style="color: #2563eb;">#${studentId}</span></h3>
                <button onclick="AdminUI.showAttendanceStats(${studentId})" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(59,130,246,0.2);">
                    📊 عرض إحصائيات الطالب
                </button>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px;">التاريخ</th>
                            <th style="padding: 15px;">الحالة</th>
                            <th style="padding: 15px;">التبرير الإداري</th>
                            <th style="padding: 15px;">السبب / ملاحظات</th>
                            <th style="padding: 15px; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fca5a5;">فشل تحميل سجل الطالب: ${err.message}</div>`;
    }
};

// ==========================================
// وظائف النوافذ المنبثقة والإشعارات
// ==========================================

AdminUI.closeAttendanceModals = function() {
    document.getElementById("justification-modal").style.display = "none";
    document.getElementById("stats-modal").style.display = "none";
};

AdminUI.showJustificationModal = function(attendanceId, isJustified, currentReason) {
    document.getElementById("modal-just-attendance-id").value = attendanceId;
    document.getElementById("modal-just-status").value = isJustified ? "true" : "false";
    const reasonInput = document.getElementById("modal-just-reason");
    reasonInput.value = currentReason !== '-' ? currentReason : '';
    reasonInput.disabled = !isJustified;
    
    document.getElementById("justification-modal").style.display = "flex";
};

AdminUI.submitJustification = async function() {
    const attendanceId = document.getElementById("modal-just-attendance-id").value;
    const isJustified = document.getElementById("modal-just-status").value === "true";
    const reason = document.getElementById("modal-just-reason").value.trim();

    try {
        await Api.patch(`/attendance/${attendanceId}/justification`, {
            is_justified: isJustified,
            justification_reason: isJustified ? reason : null
        });
        this.closeAttendanceModals();
        this.showToast("✅ تم تحديث حالة التبرير بنجاح.");
        this.loadStudentAttendance();
    } catch (err) {
        alert("فشل التحديث: " + err.message);
    }
};

AdminUI.showAttendanceStats = async function(studentId) {
    const modal = document.getElementById("stats-modal");
    const content = document.getElementById("stats-modal-content");
    
    content.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #64748b; font-weight: bold;">جاري حساب الإحصائيات... ⏳</div>`;
    modal.style.display = "flex";

    try {
        const stats = await Api.get(`/attendance/student/${studentId}/statistics`);
        
        // 💡 استخراج البيانات باستخدام الأسماء الصحيحة المطابقة لـ Backend
        const totalAbsences = stats.absent_count || 0;
        const totalLates = stats.late_count || 0;
        const justifiedAbsences = stats.justified_absences || 0;
        
        // عملية حسابية لاستخراج الغيابات غير المبررة
        const unjustifiedAbsences = totalAbsences - justifiedAbsences;

        content.innerHTML = `
            <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
                <div style="font-size: 2.5em; font-weight: bold; color: #ef4444;">${totalAbsences}</div>
                <div style="color: #475569; font-weight: bold; margin-top: 5px;">إجمالي الغيابات</div>
            </div>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
                <div style="font-size: 2.5em; font-weight: bold; color: #f59e0b;">${totalLates}</div>
                <div style="color: #475569; font-weight: bold; margin-top: 5px;">إجمالي التأخيرات</div>
            </div>
            <div style="background: #dcfce7; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #a7f3d0;">
                <div style="font-size: 2.5em; font-weight: bold; color: #16a34a;">${justifiedAbsences}</div>
                <div style="color: #065f46; font-weight: bold; margin-top: 5px;">غيابات مبررة</div>
            </div>
            <div style="background: #fef2f2; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #fca5a5;">
                <div style="font-size: 2.5em; font-weight: bold; color: #dc2626;">${unjustifiedAbsences}</div>
                <div style="color: #991b1b; font-weight: bold; margin-top: 5px;">غيابات غير مبررة</div>
            </div>
        `;
    } catch (err) {
        content.innerHTML = `<div style="grid-column: 1/-1; color: #991b1b; text-align: center; font-weight: bold;">تعذر جلب الإحصائيات، يرجى المحاولة لاحقاً.</div>`;
    }
};
AdminUI.showToast = function(message) {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.cssText = "position: fixed; bottom: 20px; left: 20px; background: #0f172a; color: white; padding: 12px 25px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-weight: bold; transition: opacity 0.5s;";
    document.body.appendChild(toast);
    setTimeout(() => toast.style.opacity = '0', 2500);
    setTimeout(() => toast.remove(), 3000);
};
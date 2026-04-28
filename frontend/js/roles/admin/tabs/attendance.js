// frontend/js/roles/admin/tabs/attendance.js

/**
 * واجهة إدارة الحضور والغياب
 * تتيح تسجيل الحضور اليومي للفصول، ومراقبة وتبرير غيابات الطلاب الفردية
 */
AdminUI.renderAttendanceTab = async function() {
    const main = this.prepareMain("سجلات الحضور والغياب");

    // إظهار حالة تحميل مؤقتة أثناء جلب الفصول
    main.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b;">جاري تجهيز لوحة الحضور...</div>`;

    let classes = [];
    try {
        const response = await Api.get("/classes");
        classes = response.data || response || [];
    } catch (err) {
        console.error("فشل في جلب الفصول", err);
    }

    const classOptions = classes.map(c => `<option value="${c.class_id || c.id}">${this._escape(c.class_name)} (${this._escape(c.level || "عام")})</option>`).join("");
    const today = new Date().toISOString().split('T')[0];

    // هيكل الصفحة الرئيسي
    main.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px;">
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid #064e3b;">
                <h3 style="margin-top: 0; color: #064e3b; display: flex; align-items: center; gap: 8px;"><span>📝</span> تسجيل حضور فصل</h3>
                <p style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">اختر الفصل والتاريخ لاستعراض القائمة وتسجيل الحالات.</p>
                
                <div style="display: flex; gap: 10px;">
                    <select id="attendance-class-select" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none; background: white;">
                        <option value="">-- اختر الفصل --</option>
                        ${classOptions}
                    </select>
                    <input type="date" id="attendance-date" value="${today}" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                </div>
                <button onclick="AdminUI.loadClassSheet()" style="margin-top: 15px; width: 100%; background: #064e3b; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    عرض قائمة الطلاب
                </button>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #1e40af; display: flex; align-items: center; gap: 8px;"><span>🔍</span> سجل وتبريرات طالب</h3>
                <p style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">أدخل المعرف الخاص بالطالب (Student ID) لعرض سجل غياباته.</p>
                
                <div style="display: flex; gap: 10px;">
                    <input type="number" id="attendance-student-id" placeholder="رقم الطالب..." style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none;" onkeypress="if(event.key === 'Enter') AdminUI.loadStudentAttendance()">
                </div>
                <button onclick="AdminUI.loadStudentAttendance()" style="margin-top: 15px; width: 100%; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    بحث في السجل
                </button>
            </div>

        </div>

        <div id="attendance-results-container" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; min-height: 300px;">
            <div style="text-align: center; color: #94a3b8; margin-top: 80px;">
                <span style="font-size: 3em;">📋</span>
                <p>البيانات ستظهر هنا بعد إجراء البحث أو اختيار الفصل.</p>
            </div>
        </div>
    `;
};

/**
 * دالة استدعاء ورقة الحضور الخاصة بفصل معين
 */
AdminUI.loadClassSheet = async function() {
    const classId = document.getElementById("attendance-class-select").value;
    const date = document.getElementById("attendance-date").value;
    const container = document.getElementById("attendance-results-container");

    if (!classId || !date) {
        alert("يرجى اختيار الفصل والتاريخ أولاً.");
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;">جاري تحميل القائمة...</div>`;

    try {
        const sheet = await Api.get(`/attendance/class/${classId}/sheet?target_date=${date}`);
        const students = sheet.data || sheet || [];

        if (students.length === 0) {
            container.innerHTML = `<p style="text-align:center; color: #64748b; padding: 20px;">لا يوجد طلاب مسجلين في هذا الفصل.</p>`;
            return;
        }

        const rows = students.map(s => {
            const isSaved = s.attendance_status != null;
            const currentStatus = s.attendance_status || 'present';
            
            return `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${isSaved ? '#f8fafc' : 'transparent'};">
                <td style="padding: 12px; font-weight: bold; color: #0f172a;">#${s.student_id}</td>
                <td style="padding: 12px;"><strong>${this._escape(s.student_name)}</strong></td>
                <td style="padding: 12px;">
                    <select id="status-${s.student_id}" style="padding: 6px; border-radius: 4px; border: 1px solid #cbd5e1; outline: none; background: white;">
                        <option value="present" ${currentStatus === 'present' ? 'selected' : ''}>حاضر</option>
                        <option value="absent" ${currentStatus === 'absent' ? 'selected' : ''}>غائب</option>
                        <option value="late" ${currentStatus === 'late' ? 'selected' : ''}>متأخر</option>
                    </select>
                </td>
                <td style="padding: 12px;">
                    <input type="text" id="reason-${s.student_id}" placeholder="سبب الغياب (إن وجد)" value="${this._escape(s.justification_reason || '')}" style="padding: 6px; width: 90%; border: 1px solid #cbd5e1; border-radius: 4px;">
                </td>
                <td style="padding: 12px; text-align: left;">
                    <button onclick="AdminUI.saveSingleAttendance(${s.student_id}, '${date}')" style="background: ${isSaved ? '#10b981' : '#f59e0b'}; color: white; border: none; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ${isSaved ? 'تحديث ✓' : 'حفظ'}
                    </button>
                </td>
            </tr>
        `}).join("");

        container.innerHTML = `
            <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">ورقة الحضور: ${date}</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9;">
                        <tr>
                            <th style="padding: 12px;">المعرف</th>
                            <th style="padding: 12px;">اسم الطالب</th>
                            <th style="padding: 12px;">الحالة</th>
                            <th style="padding: 12px;">ملاحظات / تبرير</th>
                            <th style="padding: 12px; text-align: left;">إجراء</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">فشل تحميل القائمة: ${err.message}</div>`;
    }
};

/**
 * دالة حفظ حالة طالب واحد ضمن ورقة الفصل
 */
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
        
        // إعطاء تأكيد بصري
        const btn = document.querySelector(`button[onclick="AdminUI.saveSingleAttendance(${studentId}, '${targetDate}')"]`);
        btn.style.background = "#10b981";
        btn.innerText = "تم الحفظ ✓";
    } catch (err) {
        alert("فشل الحفظ: " + err.message);
    }
};

/**
 * دالة عرض سجل وتبريرات طالب محدد
 */
AdminUI.loadStudentAttendance = async function() {
    const studentId = document.getElementById("attendance-student-id").value;
    const container = document.getElementById("attendance-results-container");

    if (!studentId) {
        alert("يرجى إدخال رقم الطالب.");
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;">جاري جلب سجل الطالب...</div>`;

    try {
        const history = await Api.get(`/attendance/student/${studentId}`);
        const records = history.data || history || [];

        if (records.length === 0) {
            container.innerHTML = `
                <div style="background: #dcfce7; color: #166534; padding: 20px; border-radius: 8px; text-align: center; font-weight: bold;">
                    سجل الطالب نظيف، لا توجد غيابات أو تأخيرات مسجلة!
                </div>`;
            return;
        }

        const rows = records.map(r => {
            const isAbsent = r.status === 'absent';
            const statusLabel = isAbsent ? 'غائب' : (r.status === 'late' ? 'متأخر' : 'حاضر');
            const statusColor = isAbsent ? '#ef4444' : '#f59e0b';
            
            return `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${isAbsent && !r.is_justified ? '#fef2f2' : 'transparent'};">
                <td style="padding: 12px; font-weight: bold; direction: ltr; text-align: right;">${this._escape(r.date || r.target_date)}</td>
                <td style="padding: 12px; font-weight: bold; color: ${statusColor};">${statusLabel}</td>
                <td style="padding: 12px;">
                    <span style="color: ${r.is_justified ? '#166534' : '#991b1b'}; font-weight: bold;">
                        ${r.is_justified ? '✔️ مبرر' : '❌ غير مبرر'}
                    </span>
                </td>
                <td style="padding: 12px; color: #64748b;">${this._escape(r.justification_reason || "-")}</td>
                <td style="padding: 12px; text-align: left;">
                    <button onclick="AdminUI.editJustification(${r.id || r.attendance_id}, ${r.is_justified}, '${this._escape(r.justification_reason || '')}')" style="background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 4px; cursor: pointer; color: #0f172a;">
                        تعديل التبرير 📝
                    </button>
                    <button onclick="AdminRole.deleteItem('/attendance', ${r.id || r.attendance_id}, 'attendance')" style="background: #fee2e2; border: 1px solid #fca5a5; padding: 6px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                        🗑️
                    </button>
                </td>
            </tr>
        `}).join("");

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #0f172a;">سجل الغيابات والتأخيرات للطالب #${studentId}</h3>
                <button onclick="AdminUI.showAttendanceStats(${studentId})" style="background: #3b82f6; color: white; border: none; padding: 6px 15px; border-radius: 4px; cursor: pointer;">عرض الإحصائيات</button>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9;">
                        <tr>
                            <th style="padding: 12px;">التاريخ</th>
                            <th style="padding: 12px;">الحالة</th>
                            <th style="padding: 12px;">التبرير</th>
                            <th style="padding: 12px;">السبب / ملاحظات</th>
                            <th style="padding: 12px; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">فشل تحميل سجل الطالب: ${err.message}</div>`;
    }
};

/**
 * دالة إضافة أو تعديل تبرير لغياب محدد
 */
AdminUI.editJustification = async function(attendanceId, currentJustified, currentReason) {
    const reason = prompt("أدخل سبب التبرير (اترك الحقل فارغاً لإلغاء التبرير):", currentReason);
    
    // إذا ضغط المستخدم Cancel
    if (reason === null) return;

    const isJustified = reason.trim().length > 0;

    try {
        await Api.patch(`/attendance/${attendanceId}/justification`, {
            is_justified: isJustified,
            justification_reason: isJustified ? reason.trim() : null
        });
        alert("تم تحديث حالة التبرير.");
        // إعادة تحميل السجل
        AdminUI.loadStudentAttendance();
    } catch (err) {
        alert("فشل التحديث: " + err.message);
    }
};

/**
 * دالة لعرض الإحصائيات (تتصل بمسار الإحصائيات)
 */
AdminUI.showAttendanceStats = async function(studentId) {
    try {
        const stats = await Api.get(`/attendance/student/${studentId}/statistics`);
        alert(`إحصائيات الطالب #${studentId}:\n\n- إجمالي الغيابات: ${stats.total_absences || 0}\n- غيابات مبررة: ${stats.justified_absences || 0}\n- غيابات غير مبررة: ${stats.unjustified_absences || 0}\n- إجمالي التأخيرات: ${stats.total_lates || 0}`);
    } catch (err) {
        alert("تعذر جلب الإحصائيات.");
    }
};
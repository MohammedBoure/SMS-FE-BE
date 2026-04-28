// frontend/js/roles/admin/tabs/schedules.js

/**
 * واجهة إدارة الجداول الزمنية
 * تتيح عرض وإدارة الحصص الأسبوعية للفصول والمعلمين
 */
AdminUI.renderSchedulesTab = async function() {
    const main = this.prepareMain("إدارة الجداول الزمنية");

    // جلب البيانات الأساسية للقوائم المنسدلة
    let classes = [], teachers = [];
    try {
        const [classesRes, teachersRes] = await Promise.all([
            AdminServices.getClasses(),
            AdminServices.getTeachers()
        ]);
        classes = classesRes.data || classesRes || [];
        teachers = teachersRes.data || teachersRes || [];
    } catch (err) {
        console.error("فشل جلب البيانات الأساسية للجداول:", err);
    }

    const classOptions = classes.map(c => `<option value="${c.class_id || c.id}">${this._escape(c.class_name)}</option>`).join("");
    const teacherOptions = teachers.map(t => `<option value="${t.teacher_id}">${this._escape(t.full_name || t.teacher_name)}</option>`).join("");

    // 1. شريط التحكم والبحث
    main.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #059669;">
                <h4 style="margin: 0 0 10px 0; color: #065f46;">📅 جدول الفصل</h4>
                <div style="display: flex; gap: 10px;">
                    <select id="sch-class-select" style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: white;">
                        <option value="">-- اختر الفصل --</option>
                        ${classOptions}
                    </select>
                    <button onclick="AdminUI.loadSchedule('class')" style="background: #059669; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">عرض</button>
                </div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #2563eb;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">👨‍🏫 جدول المعلم</h4>
                <div style="display: flex; gap: 10px;">
                    <select id="sch-teacher-select" style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: white;">
                        <option value="">-- اختر المعلم --</option>
                        ${teacherOptions}
                    </select>
                    <button onclick="AdminUI.loadSchedule('teacher')" style="background: #2563eb; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">عرض</button>
                </div>
            </div>

        </div>

        <div style="text-align: left; margin-bottom: 20px;">
            <button onclick="AdminUI.showAddScheduleModal()" style="background: #064e3b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                + إضافة حصة للجدول
            </button>
        </div>

        <div id="schedule-view-container" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 400px;">
            <div style="text-align: center; color: #94a3b8; margin-top: 100px;">
                <span style="font-size: 4em;">🗓️</span>
                <p>اختر فصلاً أو معلماً لعرض الجدول الأسبوعي هنا.</p>
            </div>
        </div>
    `;
};

/**
 * تحميل وعرض الجدول (سواء للفصل أو المعلم)
 */
AdminUI.loadSchedule = async function(type) {
    const id = document.getElementById(`sch-${type}-select`).value;
    const container = document.getElementById("schedule-view-container");

    if (!id) {
        alert("يرجى الاختيار أولاً.");
        return;
    }

    container.innerHTML = `<p style="text-align:center; padding: 50px;">جاري تحميل الجدول...</p>`;

    try {
        const schedule = await Api.get(`/schedules/${type}/${id}`);
        this.drawScheduleGrid(schedule, type);
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">فشل تحميل الجدول: ${err.message}</div>`;
    }
};

/**
 * رسم شبكة الجدول الأسبوعي
 */
AdminUI.drawScheduleGrid = function(data, type) {
    const container = document.getElementById("schedule-view-container");
    const days = ["الأحد", "الأثنين", "الثلاثاء", "الأربعاء", "الخميس"];
    
    // تنظيم البيانات حسب الأيام
    const scheduleByDay = {};
    days.forEach(day => scheduleByDay[day] = []);
    data.forEach(item => {
        if (scheduleByDay[item.day_of_week]) {
            scheduleByDay[item.day_of_week].push(item);
        }
    });

    const dayColumns = days.map(day => {
        const sessions = scheduleByDay[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
        const sessionHtml = sessions.map(s => `
            <div style="background: #f1f5f9; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-size: 0.85em; position: relative;">
                <div style="font-weight: bold; color: #0f172a; margin-bottom: 3px;">${this._escape(s.subject_name || "مادة")}</div>
                <div style="color: #64748b;">${s.start_time.slice(0,5)} - ${s.end_time.slice(0,5)}</div>
                <div style="color: #0369a1; font-size: 0.9em; margin-top: 3px;">
                    ${type === 'class' ? '👨‍🏫 ' + this._escape(s.teacher_name) : '🏫 ' + this._escape(s.class_name)}
                </div>
                <div style="margin-top: 5px; font-size: 0.8em; color: #94a3b8;">قاعة: ${this._escape(s.room_number || "غير محدد")}</div>
                <button onclick="AdminRole.deleteItem('/schedules', ${s.schedule_id}, 'schedules')" 
                        style="position: absolute; top: 5px; left: 5px; background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2em;" title="حذف">&times;</button>
            </div>
        `).join("");

        return `
            <div style="flex: 1; min-width: 150px; background: #f8fafc; border-radius: 8px; padding: 10px;">
                <h5 style="text-align: center; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #cbd5e1; color: #334155;">${day}</h5>
                ${sessionHtml || '<p style="text-align:center; color:#cbd5e1; font-size:0.8em;">لا توجد حصص</p>'}
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;">
            ${dayColumns}
        </div>
    `;
};

/**
 * نموذج إضافة حصة جديدة
 */
AdminUI.showAddScheduleModal = async function() {
    // يتطلب هذا المسار جلب التكليفات (Assignments) لربط المعلم بالمادة بالفصل
    const assignmentId = prompt("أدخل رقم التكليف (Assignment ID):");
    if (!assignmentId) return;

    const day = prompt("اليوم (الأحد، الأثنين، الثلاثاء، الأربعاء، الخميس):");
    const start = prompt("وقت البدء (HH:MM):", "08:00");
    const end = prompt("وقت الانتهاء (HH:MM):", "09:30");
    const room = prompt("رقم القاعة (اختياري):");

    try {
        await Api.post("/schedules/", {
            assignment_id: parseInt(assignmentId),
            day_of_week: day,
            start_time: start,
            end_time: end,
            room_number: room
        });
        alert("تمت إضافة الحصة للجدول.");
        // لا نقوم بتحديث القسم بالكامل بل نترك المستخدم يختار ما يريد عرضه
    } catch (err) {
        alert("فشل الإضافة: " + err.message);
    }
};
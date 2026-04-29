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
        
        // حفظ الفصول لاستخدامها لاحقاً في نافذة الإضافة
        this._cachedClasses = classes; 
    } catch (err) {
        console.error("فشل جلب البيانات الأساسية للجداول:", err);
    }

    const classOptions = classes.map(c => `<option value="${c.class_id || c.id}">${this._escape(c.class_name)}</option>`).join("");
    const teacherOptions = teachers.map(t => `<option value="${t.teacher_id}">${this._escape(t.full_name || t.teacher_name)}</option>`).join("");

    // 1. شريط التحكم والبحث + إضافة HTML للنافذة المنبثقة (Modal)
    main.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
            
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #059669;">
                <h4 style="margin: 0 0 10px 0; color: #065f46;">📅 جدول الفصل</h4>
                <div style="display: flex; gap: 10px;">
                    <select id="sch-class-select" style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                        <option value="">-- اختر الفصل --</option>
                        ${classOptions}
                    </select>
                    <button onclick="AdminUI.loadSchedule('class')" style="background: #059669; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; transition: 0.2s;">عرض</button>
                </div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #2563eb;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">👨‍🏫 جدول المعلم</h4>
                <div style="display: flex; gap: 10px;">
                    <select id="sch-teacher-select" style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                        <option value="">-- اختر المعلم --</option>
                        ${teacherOptions}
                    </select>
                    <button onclick="AdminUI.loadSchedule('teacher')" style="background: #2563eb; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; transition: 0.2s;">عرض</button>
                </div>
            </div>

        </div>

        <div style="text-align: left; margin-bottom: 20px;">
            <button onclick="AdminUI.showAddScheduleModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                + إضافة حصة للجدول
            </button>
        </div>

        <div id="schedule-view-container" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 400px;">
            <div style="text-align: center; color: #94a3b8; margin-top: 100px;">
                <span style="font-size: 4em;">🗓️</span>
                <p>اختر فصلاً أو معلماً لعرض الجدول الأسبوعي هنا.</p>
            </div>
        </div>

        <div id="add-schedule-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
            <div style="background: white; width: 450px; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">إضافة حصة جديدة</h3>
                
                <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">الفصل:</label>
                        <select id="modal-class-select" onchange="AdminUI.loadClassAssignments(this.value)" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                            <option value="">-- اختر الفصل أولاً --</option>
                            ${classOptions}
                        </select>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">المادة والأستاذ (التكليف):</label>
                        <select id="modal-assignment-select" disabled style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
                            <option value="">-- يرجى اختيار الفصل --</option>
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">اليوم:</label>
                            <select id="modal-day" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                                <option value="Sunday">الأحد</option>
                                <option value="Monday">الأثنين</option>
                                <option value="Tuesday">الثلاثاء</option>
                                <option value="Wednesday">الأربعاء</option>
                                <option value="Thursday">الخميس</option>
                                <option value="Friday">الجمعة</option>
                                <option value="Saturday">السبت</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">القاعة:</label>
                            <input type="text" id="modal-room" placeholder="مثال: قاعة 101" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">وقت البدء:</label>
                            <input type="time" id="modal-start-time" value="08:00" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">وقت الانتهاء:</label>
                            <input type="time" id="modal-end-time" value="09:00" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px;">
                    <button onclick="AdminUI.closeScheduleModal()" style="padding: 10px 15px; border: none; background: #e2e8f0; border-radius: 6px; cursor: pointer;">إلغاء</button>
                    <button onclick="AdminUI.submitNewSchedule()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer;">حفظ الحصة</button>
                </div>
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
        alert("يرجى الاختيار من القائمة أولاً.");
        return;
    }

    container.innerHTML = `<div style="text-align:center; padding: 50px; color: #64748b;">جاري تحميل الجدول... ⏳</div>`;

    try {
        const schedule = await Api.get(`/schedules/${type}/${id}`);
        this.currentViewType = type; // حفظ نوع العرض الحالي لتحديثه لاحقاً
        this.currentViewId = id;
        this.drawScheduleGrid(schedule, type);
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px; border: 1px solid #fca5a5;">فشل تحميل الجدول: ${err.message || "لا توجد بيانات"}</div>`;
    }
};
AdminUI.drawScheduleGrid = function(data, type) {
    const container = document.getElementById("schedule-view-container");
    
    // خريطة لترجمة الأيام من الإنجليزية إلى العربية للعرض
    const daysMap = {
        "Sunday": "الأحد", "Monday": "الأثنين", "Tuesday": "الثلاثاء",
        "Wednesday": "الأربعاء", "Thursday": "الخميس", "Friday": "الجمعة", "Saturday": "السبت"
    };
    
    const englishDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    if (!data || data.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 50px; color: #64748b; font-size: 1.1em;">لا توجد حصص مسجلة في هذا الجدول حالياً.</div>`;
        return;
    }

    // دالة ذكية لتحويل الوقت (تتعامل مع الثواني أو النص)
    const formatTime = (timeVal) => {
        if (timeVal === null || timeVal === undefined || timeVal === "") return "00:00";
        
        // إذا كانت القيمة عبارة عن رقم (ثواني) ولا تحتوي على نقطتين ":"
        if (!isNaN(timeVal) && String(timeVal).indexOf(':') === -1) {
            const totalSeconds = parseInt(timeVal, 10);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            // إضافة صفر على اليسار إذا كان الرقم أقل من 10 (مثال: 8 تصبح 08)
            return String(hours).padStart(2, '0') + ":" + String(minutes).padStart(2, '0');
        }
        
        // إذا كانت القيمة نصية مسبقاً (مثل "08:00:00")
        return String(timeVal).slice(0, 5);
    };

    const scheduleByDay = {};
    englishDays.forEach(day => scheduleByDay[day] = []);
    
    data.forEach(item => {
        if (scheduleByDay[item.day_of_week]) {
            scheduleByDay[item.day_of_week].push(item);
        }
    });

    const dayColumns = englishDays.map(day => {
        // ترتيب الحصص حسب وقت البدء
        const sessions = scheduleByDay[day].sort((a, b) => {
            const timeA = formatTime(a.start_time);
            const timeB = formatTime(b.start_time);
            return timeA.localeCompare(timeB);
        });
        
        // إخفاء أيام الجمعة والسبت إذا كانت فارغة تماماً
        if (sessions.length === 0 && (day === "Friday" || day === "Saturday")) {
            return ""; 
        }

        const sessionHtml = sessions.map(s => {
            // استخدام دالة تحويل الوقت هنا
            const start = formatTime(s.start_time);
            const end = formatTime(s.end_time);

            return `
            <div style="background: white; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 0.85em; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-weight: bold; color: #0f172a; margin-bottom: 5px; font-size: 1.1em;">${this._escape(s.subject_name || "مادة")}</div>
                <div style="color: #ef4444; font-weight: bold; margin-bottom: 5px;">🕒 ${start} - ${end}</div>
                <div style="color: #0369a1; font-size: 0.9em;">
                    ${type === 'class' ? '👨‍🏫 أ. ' + this._escape(s.teacher_name) : '🏫 فصل: ' + this._escape(s.class_name)}
                </div>
                <div style="margin-top: 5px; font-size: 0.85em; color: #64748b; background: #f1f5f9; display: inline-block; padding: 2px 6px; border-radius: 4px;">🚪 قاعة: ${this._escape(s.room_number || "غير محدد")}</div>
                
                <button onclick="AdminUI.deleteScheduleItem(${s.schedule_id})" 
                        style="position: absolute; top: 5px; left: 5px; background: #fee2e2; border: none; color: #ef4444; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: 0.2s;" 
                        title="حذف الحصة">&times;</button>
            </div>`;
        }).join("");

        return `
            <div style="flex: 1; min-width: 180px; background: #f8fafc; border-radius: 8px; padding: 10px; border: 1px solid #e2e8f0;">
                <h5 style="text-align: center; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #cbd5e1; color: #334155; font-size: 1em;">${daysMap[day]}</h5>
                ${sessionHtml || '<p style="text-align:center; color:#cbd5e1; font-size:0.85em; margin-top: 20px;">فارغ</p>'}
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <div style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">
            ${dayColumns}
        </div>
    `;
};

AdminUI.showAddScheduleModal = function() {
    document.getElementById("add-schedule-modal").style.display = "flex";
};

AdminUI.closeScheduleModal = function() {
    document.getElementById("add-schedule-modal").style.display = "none";
    // إعادة تفريغ الحقول
    document.getElementById("modal-class-select").value = "";
    document.getElementById("modal-assignment-select").innerHTML = '<option value="">-- يرجى اختيار الفصل --</option>';
    document.getElementById("modal-assignment-select").disabled = true;
};

/**
 * جلب التكليفات (Assignments) الخاصة بالفصل المختار
 * (يحتاج إلى API: GET /assignments/class/{class_id})
 */
AdminUI.loadClassAssignments = async function(classId) {
    const assignmentSelect = document.getElementById("modal-assignment-select");
    
    if (!classId) {
        assignmentSelect.innerHTML = '<option value="">-- يرجى اختيار الفصل --</option>';
        assignmentSelect.disabled = true;
        return;
    }

    assignmentSelect.disabled = false;
    assignmentSelect.innerHTML = '<option value="">جاري التحميل...</option>';

    try {
        // نستدعي مسار التكليفات الذي أرسلته لي سابقاً
        const assignments = await Api.get(`/assignments/class/${classId}`);
        
        if (!assignments || assignments.length === 0) {
            assignmentSelect.innerHTML = '<option value="">لا يوجد أساتذة مكلفين بهذا الفصل</option>';
            return;
        }

        assignmentSelect.innerHTML = assignments.map(a => 
            `<option value="${a.assignment_id}">المادة: ${this._escape(a.subject_name)} | الأستاذ: ${this._escape(a.teacher_name)}</option>`
        ).join("");

    } catch (err) {
        assignmentSelect.innerHTML = '<option value="">خطأ في جلب البيانات</option>';
        console.error("Error loading assignments:", err);
    }
};

/**
 * إرسال البيانات وحفظ الحصة
 */
AdminUI.submitNewSchedule = async function() {
    const assignmentId = document.getElementById("modal-assignment-select").value;
    const day = document.getElementById("modal-day").value;
    const startTime = document.getElementById("modal-start-time").value;
    const endTime = document.getElementById("modal-end-time").value;
    const room = document.getElementById("modal-room").value;

    if (!assignmentId) {
        alert("يرجى اختيار المادة والأستاذ (التكليف).");
        return;
    }

    try {
        await Api.post("/schedules/", {
            assignment_id: parseInt(assignmentId),
            day_of_week: day,
            start_time: startTime + ":00", // الـ Backend غالباً يحتاج الثواني
            end_time: endTime + ":00",
            room_number: room || "غير محدد"
        });
        
        alert("تمت إضافة الحصة للجدول بنجاح.");
        this.closeScheduleModal();
        
        // تحديث الجدول المعروض حالياً إذا كان مفتوحاً
        if (this.currentViewType && this.currentViewId) {
            this.loadSchedule(this.currentViewType);
        }

    } catch (err) {
        alert("فشل الإضافة: " + (err.message || "تأكد من عدم وجود تضارب في الوقت."));
    }
};

/**
 * حذف حصة من الجدول
 */
AdminUI.deleteScheduleItem = async function(scheduleId) {
    if (!confirm("هل أنت متأكد من حذف هذه الحصة من الجدول؟")) return;
    
    try {
        await AdminRole.deleteItem('/schedules', scheduleId); // نستدعي دالة الحذف العامة
        // تحديث العرض تلقائياً
        if (this.currentViewType) {
            this.loadSchedule(this.currentViewType);
        }
    } catch (err) {
        console.error(err);
    }
};
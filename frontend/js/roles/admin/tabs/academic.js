// frontend/js/roles/admin/tabs/academic.js

/**
 * لوحة التحكم الأكاديمية الشاملة (Academic Dashboard)
 * تصميم عصري، إحصائيات دقيقة، ووصول سريع للمهام اليومية
 */
AdminUI.renderAcademicTab = async function() {
    const main = this.prepareMain("نظرة عامة على الشؤون الأكاديمية");

    // تاريخ اليوم لعرضه في الواجهة واستخدامه في الغيابات
    const todayDate = new Date().toISOString().split('T')[0];

    main.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 300px; flex-direction: column; gap: 15px;">
            <div style="width: 40px; height: 40px; border: 4px solid #cbd5e1; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: #64748b; font-weight: bold; font-size: 1.1em;">جاري تجميع وتحليل البيانات الأكاديمية...</p>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
    `;

    try {
        // جلب البيانات الأساسية بشكل متوازي وسريع
        const [studentsRes, teachersRes, occupancyRes] = await Promise.all([
            Api.get("/students?limit=1"), // استخراج total فقط
            Api.get("/teachers"),
            Api.get("/classes/occupancy")
        ]);

        // معالجة البيانات القادمة من الـ APIs
        const totalStudents = studentsRes.total || 0;
        const teachers = teachersRes.data || teachersRes || [];
        const totalTeachers = teachers.length;
        const occupancy = occupancyRes.data || occupancyRes || [];
        const totalClasses = occupancy.length;
        const getStudentCount = (cls) => Number(
            cls.current_student_count ??
            cls.student_count ??
            cls.students_count ??
            cls.current_occupancy ??
            cls.occupied ??
            cls.enrolled_count ??
            0
        ) || 0;
        const getCapacity = (cls) => Number(cls.capacity ?? 0) || 0;

        // حساب معدل الإشغال العام في المدرسة
        const totalCapacity = occupancy.reduce((sum, cls) => sum + getCapacity(cls), 0);
        const totalOccupied = occupancy.reduce((sum, cls) => sum + getStudentCount(cls), 0);
        const globalOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

        // 1. بطاقات المؤشرات الرئيسية (Stats Cards) بتصميم عصري (Gradients)
        const statsHtml = `
            <div class="academic-kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
                
                <div class="academic-kpi-card academic-kpi-blue" style="background: linear-gradient(135deg, #eff6ff, #bfdbfe); padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); position: relative; overflow: hidden; border: 1px solid #93c5fd;">
                    <div class="academic-kpi-icon" style="position: absolute; top: 10px; left: 15px; font-size: 3em; opacity: 0.2;">🎓</div>
                    <h4 class="academic-kpi-label" style="margin: 0 0 10px 0; color: #1e40af; font-size: 1em;">إجمالي الطلاب</h4>
                    <div class="academic-kpi-value" style="font-size: 2.5em; font-weight: 900; color: #1d4ed8;">${totalStudents}</div>
                </div>

                <div class="academic-kpi-card academic-kpi-purple" style="background: linear-gradient(135deg, #f5f3ff, #ddd6fe); padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); position: relative; overflow: hidden; border: 1px solid #c4b5fd;">
                    <div class="academic-kpi-icon" style="position: absolute; top: 10px; left: 15px; font-size: 3em; opacity: 0.2;">👨‍🏫</div>
                    <h4 class="academic-kpi-label" style="margin: 0 0 10px 0; color: #5b21b6; font-size: 1em;">الطاقم التعليمي</h4>
                    <div class="academic-kpi-value" style="font-size: 2.5em; font-weight: 900; color: #6d28d9;">${totalTeachers}</div>
                </div>

                <div class="academic-kpi-card academic-kpi-green" style="background: linear-gradient(135deg, #ecfdf5, #a7f3d0); padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); position: relative; overflow: hidden; border: 1px solid #6ee7b7;">
                    <div class="academic-kpi-icon" style="position: absolute; top: 10px; left: 15px; font-size: 3em; opacity: 0.2;">🏫</div>
                    <h4 class="academic-kpi-label" style="margin: 0 0 10px 0; color: #065f46; font-size: 1em;">الفصول الدراسية</h4>
                    <div class="academic-kpi-value" style="font-size: 2.5em; font-weight: 900; color: #047857;">${totalClasses}</div>
                </div>

                <div class="academic-kpi-card academic-kpi-amber" style="background: linear-gradient(135deg, #fff7ed, #fed7aa); padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); position: relative; overflow: hidden; border: 1px solid #fdba74;">
                    <div class="academic-kpi-icon" style="position: absolute; top: 10px; left: 15px; font-size: 3em; opacity: 0.2;">📊</div>
                    <h4 class="academic-kpi-label" style="margin: 0 0 10px 0; color: #9a3412; font-size: 1em;">معدل الامتلاء العام</h4>
                    <div class="academic-kpi-value" style="font-size: 2.5em; font-weight: 900; color: ${globalOccupancyRate >= 90 ? '#dc2626' : '#c2410c'};">${globalOccupancyRate}%</div>
                </div>

            </div>
        `;

        // 2. روابط الوصول السريع
        const quickLinksHtml = `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #0f172a; margin-bottom: 15px; font-size: 1.2em;">⚡ الإجراءات السريعة</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
                    <button onclick="AdminRole.loadSection('students')" class="quick-link-btn" style="background: white; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; color: #334155; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="font-size: 1.8em; margin-bottom: 8px;">🧑‍🎓</div> إدارة الطلاب
                    </button>
                    <button onclick="AdminRole.loadSection('attendance')" class="quick-link-btn" style="background: white; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; color: #334155; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="font-size: 1.8em; margin-bottom: 8px;">📝</div> تسجيل الغياب
                    </button>
                    <button onclick="AdminRole.loadSection('schedules')" class="quick-link-btn" style="background: white; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; color: #334155; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="font-size: 1.8em; margin-bottom: 8px;">📅</div> الجدول الزمني
                    </button>
                    <button onclick="AdminRole.loadSection('grades')" class="quick-link-btn" style="background: white; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; color: #334155; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="font-size: 1.8em; margin-bottom: 8px;">🏅</div> إدخال الدرجات
                    </button>
                </div>
                <style>.quick-link-btn:hover { transform: translateY(-3px); box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important; border-color: #cbd5e1 !important; }</style>
            </div>
        `;

        // 3. الجزء السفلي: المراقبة المتقدمة (أقسام مكتظة + غياب اليوم)
        
        // أ. جدول الفصول الأكثر اكتظاظاً
        const sortedOccupancy = occupancy.sort((a, b) => {
            const capacityA = getCapacity(a);
            const capacityB = getCapacity(b);
            const pA = capacityA > 0 ? getStudentCount(a) / capacityA : 0;
            const pB = capacityB > 0 ? getStudentCount(b) / capacityB : 0;
            return pB - pA;
        }).slice(0, 5);

        let occupancyRows = sortedOccupancy.map(cls => {
            const studentCount = getStudentCount(cls);
            const capacity = getCapacity(cls);
            const percent = capacity > 0 ? Math.round((studentCount / capacity) * 100) : 0;
            const barPercent = Math.min(percent, 100);
            const color = percent >= 95 ? '#ef4444' : (percent >= 80 ? '#f59e0b' : '#10b981');
            return `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-weight: bold; color: #0f172a;">
                    ${this._escape(cls.class_name)}
                    ${cls.program_name ? `<div style="color:#2563eb; font-size:.85em; margin-top:3px;">${this._escape(cls.program_name)}</div>` : ""}
                </td>
                <td style="padding: 12px; text-align: left;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                        <span style="font-size: 0.85em; font-weight: bold; color: #475569;">إشغال: ${studentCount} / ${capacity > 0 ? capacity : "∞"}</span>
                        <div style="width: 100px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${barPercent}%; height: 100%; background: ${color};"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `}).join("");

        if (sortedOccupancy.length === 0) {
            occupancyRows = `<tr><td colspan="2" style="text-align:center; padding: 20px; color:#64748b;">لا توجد بيانات للفصول الدراسية.</td></tr>`;
        }

        // ب. خيارات الفصول لـ "مراقب الغياب السريع"
        const classOptions = occupancy.map(c => `<option value="${c.class_id || c.id}">${this._escape((c.program_name ? c.program_name + " - " : "") + c.class_name)}</option>`).join("");

        const bottomWidgetsHtml = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                
                <div style="background: white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 20px; border: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 1.1em; display: flex; align-items: center; gap: 8px;">
                        <span>🚨</span> تنبيه الاكتظاظ (أعلى 5 فصول)
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.95em;">
                        <tbody>${occupancyRows}</tbody>
                    </table>
                </div>

                <div style="background: white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 20px; border: 1px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #0f172a; font-size: 1.1em; display: flex; align-items: center; gap: 8px;">
                            <span>⏱️</span> حضور اليوم (${todayDate})
                        </h3>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <select id="dash-attendance-class" style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc;">
                            <option value="">-- اختر فصلاً لمعرفة حضوره اليوم --</option>
                            ${classOptions}
                        </select>
                        <button onclick="AdminUI.checkDashboardAttendance('${todayDate}')" style="background: #2563eb; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">تحقق</button>
                    </div>

                    <div id="dash-attendance-result" style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; color: #64748b;">
                        اختر الفصل واضغط تحقق لرؤية إحصائية اليوم فوراً.
                    </div>
                </div>

            </div>
        `;

        main.innerHTML = statsHtml + quickLinksHtml + bottomWidgetsHtml;

    } catch (err) {
        main.innerHTML = `<div style="background: #fef2f2; color: #991b1b; padding: 20px; border-radius: 8px; border: 1px solid #fca5a5; margin-top: 20px;"><strong>خطأ في الاتصال بالخادم:</strong> ${err.message}</div>`;
    }
};

/**
 * دالة فرعية: مراقب الغياب السريع في لوحة التحكم
 * تعتمد على مسار: /attendance/class/{class_id}/sheet
 */
AdminUI.checkDashboardAttendance = async function(targetDate) {
    const classId = document.getElementById("dash-attendance-class").value;
    const resultContainer = document.getElementById("dash-attendance-result");

    if (!classId) {
        alert("يرجى اختيار الفصل أولاً.");
        return;
    }

    resultContainer.innerHTML = `<div style="color: #2563eb; font-weight: bold;">جاري جلب السجلات... ⏳</div>`;

    try {
        const response = await Api.get(`/attendance/class/${classId}/sheet?target_date=${targetDate}`);
        const records = response.data || response || [];

        if (records.length === 0) {
            resultContainer.innerHTML = `<div style="color: #f59e0b; font-weight: bold;">لم يتم تسجيل غياب/حضور هذا الفصل لليوم بعد.</div>`;
            return;
        }

        // حساب الحاضرين والغائبين
        const total = records.length;
        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const late = records.filter(r => r.status === 'late').length;

        const presentRate = Math.round((present / total) * 100);

        resultContainer.innerHTML = `
            <div style="display: flex; justify-content: space-around; align-items: center;">
                <div style="text-align: center;">
                    <div style="font-size: 2em; font-weight: bold; color: #16a34a;">${presentRate}%</div>
                    <div style="font-size: 0.8em; color: #64748b; font-weight: bold;">نسبة الحضور</div>
                </div>
                <div style="border-right: 1px solid #cbd5e1; height: 40px;"></div>
                <div style="text-align: right; font-size: 0.9em; line-height: 1.8;">
                    <div>✅ حاضر: <strong>${present}</strong></div>
                    <div>❌ غائب: <strong style="color: #ef4444;">${absent}</strong></div>
                    <div>⚠️ متأخر: <strong style="color: #f59e0b;">${late}</strong></div>
                </div>
            </div>
        `;

    } catch (err) {
        resultContainer.innerHTML = `<div style="color: #ef4444; font-size: 0.9em;">فشل الجلب: ${err.message}</div>`;
    }
};

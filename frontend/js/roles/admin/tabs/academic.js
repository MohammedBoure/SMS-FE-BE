// frontend/js/roles/admin/tabs/academic.js

/**
 * لوحة التحكم الأكاديمية الشاملة (Academic Dashboard)
 * تقوم بجمع وعرض الإحصائيات العامة للطلاب، المعلمين، والفصول، مع توفير روابط وصول سريع
 */
AdminUI.renderAcademicTab = async function() {
    const main = this.prepareMain("نظرة عامة على الشؤون الأكاديمية");

    // إظهار حالة التحميل
    main.innerHTML = `
        <div style="text-align:center; padding: 50px; color: #64748b;">
            <div class="spinner" style="margin-bottom: 15px;"></div>
            <h3>جاري تجميع البيانات الأكاديمية...</h3>
        </div>
    `;

    try {
        // جلب البيانات الأساسية بشكل متوازي لتسريع وقت التحميل
        const [studentsRes, teachersRes, occupancyRes] = await Promise.all([
            Api.get("/students?limit=1"), // نطلب عنصراً واحداً فقط لأننا نحتاج إجمالي العدد (total) من الاستجابة
            Api.get("/teachers"),
            Api.get("/classes/occupancy")
        ]);

        // استخراج الإحصائيات
        const totalStudents = studentsRes.total || (studentsRes.data ? studentsRes.data.length : 0);
        const teachers = teachersRes.data || teachersRes || [];
        const totalTeachers = teachers.length;
        const occupancy = occupancyRes.data || occupancyRes || [];
        const totalClasses = occupancy.length;

        // حساب إجمالي المقاعد المتاحة والمشغولة في المدرسة
        const totalCapacity = occupancy.reduce((sum, cls) => sum + (cls.capacity || 0), 0);
        const totalOccupied = occupancy.reduce((sum, cls) => sum + (cls.student_count || 0), 0);
        const globalOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

        // 1. تصميم بطاقات المؤشرات (Stats Cards)
        const statsHtml = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
                
                <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-bottom: 4px solid #3b82f6; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; left: -10px; font-size: 5em; opacity: 0.05;">🎓</div>
                    <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 1em;">إجمالي الطلاب المسجلين</h4>
                    <div style="font-size: 2.5em; font-weight: bold; color: #1e40af;">${totalStudents}</div>
                </div>

                <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-bottom: 4px solid #8b5cf6; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; left: -10px; font-size: 5em; opacity: 0.05;">👨‍🏫</div>
                    <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 1em;">الطاقم التعليمي</h4>
                    <div style="font-size: 2.5em; font-weight: bold; color: #6d28d9;">${totalTeachers}</div>
                </div>

                <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-bottom: 4px solid #10b981; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -10px; left: -10px; font-size: 5em; opacity: 0.05;">🏫</div>
                    <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 1em;">الفصول الدراسية</h4>
                    <div style="font-size: 2.5em; font-weight: bold; color: #064e3b;">${totalClasses}</div>
                    <div style="margin-top: 10px; font-size: 0.85em; color: ${globalOccupancyRate > 90 ? '#ef4444' : '#10b981'}; font-weight: bold;">
                        معدل امتلاء المدرسة: ${globalOccupancyRate}%
                    </div>
                </div>

            </div>
        `;

        // 2. تصميم شريط التنقل السريع بين الأقسام الأكاديمية
        const quickLinksHtml = `
            <h3 style="color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">روابط الوصول السريع</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
                <button onclick="AdminRole.loadSection('students')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    <div style="font-size: 1.5em; margin-bottom: 5px;">🎓</div> ملفات الطلاب
                </button>
                <button onclick="AdminRole.loadSection('teachers')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    <div style="font-size: 1.5em; margin-bottom: 5px;">👨‍🏫</div> إدارة المعلمين
                </button>
                <button onclick="AdminRole.loadSection('classes')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    <div style="font-size: 1.5em; margin-bottom: 5px;">🏫</div> الفصول والمقاعد
                </button>
                <button onclick="AdminRole.loadSection('schedules')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    <div style="font-size: 1.5em; margin-bottom: 5px;">📅</div> الجداول الزمنية
                </button>
                <button onclick="AdminRole.loadSection('grades')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    <div style="font-size: 1.5em; margin-bottom: 5px;">📊</div> الدرجات والنتائج
                </button>
                <button onclick="AdminRole.loadSection('attendance')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; cursor: pointer; font-weight: bold; color: #0f172a; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    <div style="font-size: 1.5em; margin-bottom: 5px;">📝</div> الغياب والحضور
                </button>
            </div>
        `;

        // 3. جدول مراقبة الأقسام المكتظة (للمتابعة الإدارية السريعة)
        // يتم فرز الفصول حسب نسبة الإشغال (الأكثر اكتظاظاً أولاً)
        const sortedOccupancy = occupancy.sort((a, b) => {
            const pA = a.capacity > 0 ? a.student_count / a.capacity : 0;
            const pB = b.capacity > 0 ? b.student_count / b.capacity : 0;
            return pB - pA;
        }).slice(0, 5); // عرض أعلى 5 فصول فقط

        let occupancyRows = sortedOccupancy.map(cls => {
            const percent = cls.capacity > 0 ? Math.round((cls.student_count / cls.capacity) * 100) : 0;
            const color = percent >= 90 ? '#ef4444' : (percent >= 70 ? '#f59e0b' : '#10b981');
            return `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-weight: bold;">${this._escape(cls.class_name)}</td>
                <td style="padding: 12px; color: #64748b;">${this._escape(cls.level || "عام")}</td>
                <td style="padding: 12px; text-align: left;">
                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                        <span style="font-size: 0.85em; font-weight: bold;">${cls.student_count} / ${cls.capacity}</span>
                        <div style="width: 100px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${percent}%; height: 100%; background: ${color};"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `}).join("");

        if(sortedOccupancy.length === 0) occupancyRows = `<tr><td colspan="3" style="text-align:center; padding: 15px; color:#64748b;">لا توجد بيانات للفصول الدراسية.</td></tr>`;

        const recentActivityHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #0f172a;">مراقبة اكتظاظ الفصول (أعلى 5)</h3>
                    <button onclick="AdminRole.loadSection('classes')" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-weight: bold;">عرض الكل ➡️</button>
                </div>
                <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.95em;">
                    <thead style="background: #f1f5f9;">
                        <tr>
                            <th style="padding: 10px;">اسم الفصل</th>
                            <th style="padding: 10px;">المستوى</th>
                            <th style="padding: 10px; text-align: left;">حالة الإشغال</th>
                        </tr>
                    </thead>
                    <tbody>${occupancyRows}</tbody>
                </table>
            </div>
        `;

        // تركيب الصفحة النهائية
        main.innerHTML = statsHtml + quickLinksHtml + recentActivityHtml;

    } catch (err) {
        main.innerHTML = `<div style="background: #fef2f2; color: #991b1b; padding: 20px; border-radius: 8px; border: 1px solid #fca5a5;"><strong>خطأ في تجميع البيانات الأكاديمية:</strong> ${err.message}</div>`;
    }
};
// frontend/js/roles/admin/tabs/grades.js

/**
 * واجهة إدارة الدرجات الأكاديمية
 * تتيح إدخال وتعديل درجات الامتحانات، وعرض كشوف النقاط للطلاب
 */
AdminUI.renderGradesTab = async function() {
    const main = this.prepareMain("سجل الدرجات الأكاديمية");

    // إظهار حالة تحميل مؤقتة
    main.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b;">جاري تجهيز لوحة الدرجات...</div>`;

    // جلب قائمة التقييمات لتسهيل الاختيار
    let assessments = [];
    try {
        const response = await Api.get("/assessments");
        assessments = response.data || response || [];
    } catch (err) {
        console.error("فشل في جلب قائمة التقييمات", err);
    }

    const assessmentOptions = assessments.map(a => `<option value="${a.assessment_id}">${this._escape(a.title)} (الدرجة القصوى: ${a.max_grade})</option>`).join("");

    // الهيكل الرئيسي للواجهة
    main.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px;">
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid #991b1b;">
                <h3 style="margin-top: 0; color: #991b1b; display: flex; align-items: center; gap: 8px;"><span>📝</span> درجات امتحان أو تقييم</h3>
                <p style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">اختر التقييم لعرض درجات الطلاب وإحصائيات النجاح.</p>
                
                <div style="display: flex; gap: 10px;">
                    <select id="grades-assessment-select" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none; background: white;">
                        <option value="">-- اختر التقييم --</option>
                        ${assessmentOptions}
                    </select>
                </div>
                <button onclick="AdminUI.loadAssessmentGrades()" style="margin-top: 15px; width: 100%; background: #991b1b; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    عرض قائمة الدرجات
                </button>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid #1e40af;">
                <h3 style="margin-top: 0; color: #1e40af; display: flex; align-items: center; gap: 8px;"><span>🎓</span> كشف نقاط طالب</h3>
                <p style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">ابحث عن الطالب لعرض سجله الأكاديمي الشامل.</p>
                
                <div style="display: flex; gap: 10px; position: relative;">
                    <div style="position: relative; flex: 1;">
                        <input type="text" id="grades-student-search" placeholder="ابحث باسم الطالب..." 
                               style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; width: 100%; outline: none; box-sizing: border-box;"
                               onkeyup="AdminUI.searchStudentForGrades(this.value)">
                        
                        <!-- حقل مخفي لتخزين الـ ID بعد اختيار الاسم -->
                        <input type="hidden" id="grades-student-id">
                        
                        <!-- القائمة المنسدلة لنتائج البحث -->
                        <div id="grades-student-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; z-index: 10; margin-top: 5px;"></div>
                    </div>
                </div>
                <button onclick="AdminUI.loadStudentRecord()" style="margin-top: 15px; width: 100%; background: #1e40af; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    استخراج كشف النقاط
                </button>
            </div>

        </div>

        <div id="grades-results-container" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; min-height: 300px;">
            <div style="text-align: center; color: #94a3b8; margin-top: 80px;">
                <span style="font-size: 4em;">📊</span>
                <p>البيانات والإحصائيات ستظهر هنا بعد إجراء البحث.</p>
            </div>
        </div>
    `;

    // إخفاء القائمة المنسدلة عند النقر خارجها
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('grades-student-dropdown');
        const searchInput = document.getElementById('grades-student-search');
        if (dropdown && e.target !== searchInput && e.target !== dropdown) {
            dropdown.style.display = 'none';
        }
    });
};

/**
 * وظائف البحث الحي عن الطلاب (Autocomplete)
 */
AdminUI.searchStudentForGrades = async function(keyword) {
    const dropdown = document.getElementById("grades-student-dropdown");
    
    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/students/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const students = response.data || [];

        if (students.length === 0) {
            dropdown.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center; font-size: 0.9em;">لا توجد نتائج مطابقة</div>`;
        } else {
            dropdown.innerHTML = students.map(s => `
                <div onclick="AdminUI.selectStudentForGrades(${s.student_id || s.id}, '${this._escape(s.full_name || s.student_name)}')" 
                     style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; display: flex; justify-content: space-between;" 
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

AdminUI.selectStudentForGrades = function(id, name) {
    document.getElementById("grades-student-search").value = name;
    document.getElementById("grades-student-id").value = id;
    document.getElementById("grades-student-dropdown").style.display = "none";
    
    // تشغيل استخراج الكشف تلقائياً بعد اختيار الطالب
    this.loadStudentRecord();
};

/**
 * دالة جلب وعرض درجات تقييم محدد مع الإحصائيات
 */
AdminUI.loadAssessmentGrades = async function() {
    const assessmentId = document.getElementById("grades-assessment-select").value;
    const container = document.getElementById("grades-results-container");

    if (!assessmentId) {
        alert("يرجى اختيار التقييم أولاً.");
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;">جاري تحميل الدرجات والإحصائيات...</div>`;

    try {
        // جلب الدرجات والإحصائيات بشكل متوازي
        const [gradesRes, statsRes, assessmentDetails] = await Promise.all([
            Api.get(`/grades/assessment/${assessmentId}`),
            Api.get(`/grades/assessment/${assessmentId}/statistics`),
            Api.get(`/assessments/${assessmentId}`)
        ]);

        const grades = gradesRes.data || gradesRes || [];
        const stats = statsRes || {};
        const maxGrade = assessmentDetails.max_grade || 20;

        // لوحة الإحصائيات العلوية
        const statsHtml = `
            <div style="display: flex; gap: 15px; margin-bottom: 20px; text-align: center;">
                <div style="flex: 1; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 0.85em; color: #64748b; margin-bottom: 5px;">متوسط العلامات</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #0f172a;">${stats.average_grade ? stats.average_grade.toFixed(2) : '-'} / ${maxGrade}</div>
                </div>
                <div style="flex: 1; background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
                    <div style="font-size: 0.85em; color: #166534; margin-bottom: 5px;">أعلى علامة</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #166534;">${stats.highest_grade || '-'}</div>
                </div>
                <div style="flex: 1; background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca;">
                    <div style="font-size: 0.85em; color: #991b1b; margin-bottom: 5px;">أدنى علامة</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #991b1b;">${stats.lowest_grade || '-'}</div>
                </div>
                <div style="flex: 1; background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe;">
                    <div style="font-size: 0.85em; color: #1e40af; margin-bottom: 5px;">الطلاب الممتحنين</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #1e40af;">${grades.length}</div>
                </div>
            </div>
        `;

        // نموذج إضافة درجة سريعة
        const addFormHtml = `
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 10px; align-items: center; position: relative;">
                <span style="font-weight: bold; color: #334155;">إدخال نقطة:</span>
                
                <div style="position: relative; flex: 1;">
                    <input type="text" id="quick-student-search" placeholder="ابحث عن الطالب..." style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; width: 100%; box-sizing: border-box;" onkeyup="AdminUI.searchStudentForQuickGrade(this.value)">
                    <input type="hidden" id="quick-student-id">
                    <div id="quick-student-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10; margin-top: 2px;"></div>
                </div>
                
                <input type="number" step="0.25" id="quick-grade-val" placeholder="العلامة" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; width: 100px;">
                <input type="text" id="quick-remarks" placeholder="ملاحظات الأستاذ (اختياري)" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; flex: 1;">
                <button onclick="AdminUI.saveGrade(${assessmentId})" style="background: #064e3b; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">حفظ</button>
            </div>
        `;

        let tableRows = grades.map(g => {
            const isPassing = g.grade_value >= (maxGrade / 2);
            return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px; font-weight: bold;">#${g.student_id}</td>
                <td style="padding: 12px;"><strong>${this._escape(g.student_name || "طالب #" + g.student_id)}</strong></td>
                <td style="padding: 12px;">
                    <span style="font-size: 1.1em; font-weight: bold; color: ${isPassing ? '#166534' : '#dc2626'};">
                        ${g.grade_value}
                    </span> / ${maxGrade}
                </td>
                <td style="padding: 12px; color: #64748b;">${this._escape(g.teacher_remarks || "-")}</td>
                <td style="padding: 12px; text-align: left;">
                    <button onclick="AdminRole.deleteItem('/grades', ${g.grade_id}, 'grades')" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️ حذف</button>
                </td>
            </tr>
        `}).join("");

        if(grades.length === 0) tableRows = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">لم يتم إدخال أي درجات لهذا التقييم بعد.</td></tr>`;

        container.innerHTML = `
            <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">إحصائيات ودرجات التقييم</h3>
            ${statsHtml}
            ${addFormHtml}
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
                <thead style="background: #f1f5f9;">
                    <tr>
                        <th style="padding: 12px;">المعرف</th>
                        <th style="padding: 12px;">اسم الطالب</th>
                        <th style="padding: 12px;">العلامة</th>
                        <th style="padding: 12px;">ملاحظات الأستاذ</th>
                        <th style="padding: 12px; text-align: left;">إجراءات</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        `;
        
        // إخفاء القائمة المنسدلة للدرجة السريعة عند النقر خارجها
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('quick-student-dropdown');
            const searchInput = document.getElementById('quick-student-search');
            if (dropdown && e.target !== searchInput && e.target !== dropdown) {
                dropdown.style.display = 'none';
            }
        });

    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">فشل تحميل بيانات التقييم: ${err.message}</div>`;
    }
};

/**
 * وظائف البحث الحي عن الطلاب للإدخال السريع للدرجات
 */
AdminUI.searchStudentForQuickGrade = async function(keyword) {
    const dropdown = document.getElementById("quick-student-dropdown");
    
    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/students/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const students = response.data || [];

        if (students.length === 0) {
            dropdown.innerHTML = `<div style="padding: 8px; color: #64748b; text-align: center; font-size: 0.85em;">لا توجد نتائج</div>`;
        } else {
            dropdown.innerHTML = students.map(s => `
                <div onclick="AdminUI.selectStudentForQuickGrade(${s.student_id || s.id}, '${this._escape(s.full_name || s.student_name)}')" 
                     style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; display: flex; justify-content: space-between; font-size: 0.9em;" 
                     onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <strong style="color: #0f172a;">${this._escape(s.full_name || s.student_name)}</strong> 
                </div>
            `).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error("فشل البحث في القائمة المنسدلة:", err);
    }
};

AdminUI.selectStudentForQuickGrade = function(id, name) {
    document.getElementById("quick-student-search").value = name;
    document.getElementById("quick-student-id").value = id;
    document.getElementById("quick-student-dropdown").style.display = "none";
};

/**
 * دالة حفظ نقطة جديدة
 */
AdminUI.saveGrade = async function(assessmentId) {
    const studentId = document.getElementById("quick-student-id").value;
    const gradeVal = document.getElementById("quick-grade-val").value;
    const remarks = document.getElementById("quick-remarks").value;

    if (!studentId || !gradeVal) {
        alert("يرجى اختيار الطالب وإدخال العلامة.");
        return;
    }

    try {
        await Api.post("/grades/", {
            student_id: parseInt(studentId),
            assessment_id: parseInt(assessmentId),
            grade_value: parseFloat(gradeVal),
            teacher_remarks: remarks || null
        });
        
        // مسح الحقول وإعادة تحميل القائمة
        document.getElementById("quick-student-id").value = "";
        document.getElementById("quick-student-search").value = "";
        document.getElementById("quick-grade-val").value = "";
        document.getElementById("quick-remarks").value = "";
        AdminUI.loadAssessmentGrades();
    } catch (err) {
        alert("فشل الحفظ: " + err.message);
    }
};

/**
 * دالة جلب كشف نقاط طالب
 */
AdminUI.loadStudentRecord = async function() {
    const studentId = document.getElementById("grades-student-id").value;
    const container = document.getElementById("grades-results-container");

    if (!studentId) {
        alert("يرجى اختيار الطالب أولاً.");
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;">جاري استخراج السجل الأكاديمي...</div>`;

    try {
        const history = await Api.get(`/grades/student/${studentId}`);
        const records = history.data || history || [];

        if (records.length === 0) {
            container.innerHTML = `<div style="background: #f8fafc; color: #475569; padding: 20px; border-radius: 8px; text-align: center;">لا توجد أي درجات مسجلة في السجل الأكاديمي لهذا الطالب حتى الآن.</div>`;
            return;
        }

        const rows = records.map(r => `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px; font-weight: bold; color: #0f172a;">${this._escape(r.assessment_title)}</td>
                <td style="padding: 12px;"><span style="background: #eff6ff; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 0.85em;">${this._escape(r.assessment_type || 'امتحان')}</span></td>
                <td style="padding: 12px;">
                    <span style="font-weight: bold; font-size: 1.1em;">${r.grade_value}</span> / ${r.max_grade || '?'}
                </td>
                <td style="padding: 12px; color: #64748b; font-size: 0.9em;">${this._escape(r.teacher_remarks || "-")}</td>
            </tr>
        `).join("");

        container.innerHTML = `
            <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">الكشف الأكاديمي الشامل: الطالب #${studentId}</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9;">
                        <tr>
                            <th style="padding: 12px;">التقييم / المادة</th>
                            <th style="padding: 12px;">النوع</th>
                            <th style="padding: 12px;">العلامة المحصلة</th>
                            <th style="padding: 12px;">الملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">فشل استخراج الكشف: ${err.message}</div>`;
    }
};
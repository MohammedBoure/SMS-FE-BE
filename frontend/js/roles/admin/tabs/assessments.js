// frontend/js/roles/admin/tabs/assessments.js

/**
 * واجهة إدارة التقييمات والامتحانات
 * تتيح إنشاء الاختبارات، تحديد الدرجات القصوى، ومتابعة تواريخ الامتحانات
 */
AdminUI.renderAssessmentsTab = function(response) {
    const main = this.prepareMain("إدارة التقييمات والامتحانات");
    const assessments = response.data || response || [];

    // 1. شريط الأدوات العلوي
    const actionHeader = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); gap: 15px;">
            <div style="display: flex; gap: 10px; flex: 1;">
                <select id="assessment-type-filter" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: white;" onchange="AdminUI.filterAssessments()">
                    <option value="">كل أنواع التقييمات</option>
                    <option value="exam">امتحان رسمي</option>
                    <option value="quiz">اختبار قصير (Quiz)</option>
                    <option value="homework">وظيفة منزلية</option>
                </select>
                <input type="text" id="assessment-search" placeholder="بحث باسم التقييم..." style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none;">
            </div>
            <button onclick="AdminUI.showAddAssessmentModal()" style="background: #064e3b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <span>➕</span> إضافة تقييم جديد
            </button>
        </div>
    `;

    // 2. بناء الجدول
    let tableHtml = "";
    if (assessments.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b;">لا توجد تقييمات مسجلة حالياً.</p>
            </div>
        `;
    } else {
        const rows = assessments.map(a => {
            const typeLabels = { 'exam': 'امتحان', 'quiz': 'اختبار', 'homework': 'واجب' };
            const typeColors = { 'exam': '#991b1b', 'quiz': '#1e40af', 'homework': '#166534' };
            const typeBg = { 'exam': '#fef2f2', 'quiz': '#eff6ff', 'homework': '#dcfce7' };

            return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold;">#${a.assessment_id}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: 600;">${this._escape(a.title)}</div>
                    <small style="color: #64748b;">التكليف المرجعي: #${a.assignment_id}</small>
                </td>
                <td style="padding: 15px;">
                    <span style="background: ${typeBg[a.type] || '#f1f5f9'}; color: ${typeColors[a.type] || '#475569'}; padding: 4px 10px; border-radius: 6px; font-size: 0.85em; font-weight: bold;">
                        ${typeLabels[a.type] || a.type}
                    </span>
                </td>
                <td style="padding: 15px; font-weight: bold; color: #0f172a;">${a.max_grade}</td>
                <td style="padding: 15px; color: #dc2626;">${this._escape(a.due_date || "غير محدد")}</td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="AdminUI.viewAssessmentGrades(${a.assessment_id}, '${this._escape(a.title)}')" title="عرض الدرجات" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; cursor: pointer;">📊</button>
                    <button onclick="AdminUI.editAssessment(${a.assessment_id})" title="تعديل" style="background: white; border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px; cursor: pointer;">✏️</button>
                    <button onclick="AdminRole.deleteItem('/assessments', ${a.assessment_id}, 'assessments')" title="حذف" style="background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; padding: 6px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            </tr>
        `}).join("");

        tableHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px;">ID</th>
                            <th style="padding: 15px;">عنوان التقييم</th>
                            <th style="padding: 15px;">النوع</th>
                            <th style="padding: 15px;">الدرجة القصوى</th>
                            <th style="padding: 15px;">تاريخ الاستحقاق</th>
                            <th style="padding: 15px; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    main.innerHTML = actionHeader + tableHtml;
};

/**
 * دالة لإظهار نموذج إضافة تقييم جديد
 */
AdminUI.showAddAssessmentModal = async function() {
    const title = prompt("عنوان التقييم (مثال: امتحان الفصل الأول رياضيات):");
    if (!title) return;

    const type = prompt("النوع (exam, quiz, homework):", "exam");
    const assignmentId = prompt("رقم التكليف الدراسي (Assignment ID):");
    const maxGrade = prompt("الدرجة القصوى (الافتراضي 20):", "20");
    const dueDate = prompt("تاريخ الاستحقاق (YYYY-MM-DD):");

    try {
        await Api.post("/assessments/", {
            title: title,
            type: type,
            assignment_id: parseInt(assignmentId),
            max_grade: parseFloat(maxGrade) || 20.0,
            due_date: dueDate
        });
        alert("تم إنشاء التقييم بنجاح.");
        AdminRole.loadSection("assessments");
    } catch (err) {
        alert("فشل إنشاء التقييم: " + err.message);
    }
};

/**
 * دالة لعرض درجات الطلاب في تقييم معين (تربط بـ grades_api)
 */
AdminUI.viewAssessmentGrades = async function(assessmentId, title) {
    try {
        // يتم جلب الدرجات من مسار الدرجات المخصص للتقييم
        const grades = await Api.get(`/grades/assessment/${assessmentId}`);
        console.log(`درجات التقييم ${title}:`, grades);
        alert(`تم جلب ${grades.length} سجل درجات لهذا التقييم. سيتم عرضها في جدول مفصل قريباً.`);
        // هنا يمكن استدعاء AdminUI.renderGradesTab(grades) لعرضها
    } catch (err) {
        alert("فشل في جلب الدرجات: " + err.message);
    }
};

AdminUI.editAssessment = async function(assessmentId) {
    try {
        const assessment = await Api.get(`/assessments/${assessmentId}`);
        const newTitle = prompt("تعديل عنوان التقييم:", assessment.title);
        if (newTitle === null) return;

        await Api.put(`/assessments/${assessmentId}`, {
            title: newTitle,
            max_grade: assessment.max_grade,
            due_date: assessment.due_date,
            type: assessment.type
        });
        alert("تم التحديث بنجاح");
        AdminRole.loadSection("assessments");
    } catch (err) {
        alert("فشل التعديل: " + err.message);
    }
};
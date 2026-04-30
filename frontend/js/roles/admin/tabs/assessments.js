// frontend/js/roles/admin/tabs/assessments.js

/**
 * واجهة إدارة التقييمات والامتحانات (النسخة الاحترافية والشاملة)
 * تتيح إنشاء الاختبارات، وتتضمن نوافذ ذكية لعرض درجات الطلاب مباشرة
 */
AdminUI.renderAssessmentsTab = function(response) {
    const main = this.prepareMain("إدارة التقييمات والامتحانات");
    const assessments = response.data || response || [];

    // 1. شريط الأدوات العلوي
    main.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); gap: 15px; flex-wrap: wrap;">
            <div style="display: flex; gap: 10px; flex: 1; min-width: 300px;">
                <select id="assessment-type-filter" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc; font-weight: bold; color: #334155;" onchange="AdminUI.filterAssessmentsLocal(this.value)">
                    <option value="all">-- كل أنواع التقييمات --</option>
                    <option value="exam">🔴 امتحان رسمي</option>
                    <option value="quiz">🔵 اختبار قصير (Quiz)</option>
                    <option value="homework">🟢 وظيفة منزلية</option>
                </select>
                <input type="text" id="assessment-search" placeholder="ابحث باسم التقييم..." 
                       style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; flex: 1; outline: none; font-weight: bold;"
                       onkeyup="AdminUI.searchAssessmentsLocal(this.value)">
                <button onclick="AdminRole.loadSection('assessments')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;" title="إعادة تحميل القائمة">
                    🔄 تحديث
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showAssessmentModal()" style="background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s;">
                    <span>➕</span> إضافة تقييم جديد
                </button>
            </div>
        </div>

        <!-- حاوية الجدول -->
        <div id="assessments-table-container">
            ${this._generateAssessmentsTableHtml(assessments)}
        </div>

        <!-- النافذة المنبثقة 1: إضافة/تعديل تقييم -->
        <div id="assessment-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 550px; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 id="assessment-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span>📝</span> إضافة تقييم جديد
                </h3>
                
                <input type="hidden" id="modal-assessment-id">

                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">عنوان التقييم (إجباري) *</label>
                    <input type="text" id="modal-assessment-title" placeholder="مثال: الفرض الأول في مادة الرياضيات..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">نوع التقييم *</label>
                        <select id="modal-assessment-type" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                            <option value="exam">امتحان رسمي</option>
                            <option value="quiz">اختبار قصير (Quiz)</option>
                            <option value="homework">وظيفة منزلية</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">الدرجة القصوى *</label>
                        <input type="number" id="modal-assessment-max-grade" value="20" min="1" step="0.5" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">التكليف المرجعي (المادة والأستاذ) *</label>
                    <select id="modal-assessment-assignment" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                        <option value="">جاري التحميل...</option>
                    </select>
                    <small style="color: #64748b; margin-top: 5px; display: block;">يربط هذا التقييم بالمادة والفصل لكي يتمكن الأستاذ من رصد النقاط.</small>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">تاريخ الاستحقاق (أو الإجراء)</label>
                    <input type="date" id="modal-assessment-due-date" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px;">
                    <button onclick="AdminUI.closeAssessmentModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitAssessment()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">حفظ التقييم</button>
                </div>
            </div>
        </div>

        <!-- النافذة المنبثقة 2: عرض درجات التقييم (الجديدة) -->
        <div id="grades-view-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1001; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 650px; max-height: 80vh; display: flex; flex-direction: column; padding: 25px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                    <h3 id="grades-modal-title" style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                        <span>📊</span> درجات التقييم
                    </h3>
                    <button onclick="AdminUI.closeGradesModal()" style="background: #f1f5f9; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2em; color: #64748b; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">&times;</button>
                </div>
                
                <div style="overflow-y: auto; flex: 1; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: right;">
                        <thead style="background: #f8fafc; position: sticky; top: 0;">
                            <tr>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;"># الطالب</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">الاسم الكامل</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">العلامة المحصلة</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">ملاحظات الأستاذ</th>
                            </tr>
                        </thead>
                        <tbody id="grades-modal-body">
                            <!-- سيتم تعبئة البيانات هنا عبر الدالة -->
                        </tbody>
                    </table>
                </div>
                
                <button onclick="AdminUI.closeGradesModal()" style="width: 100%; background: #0f172a; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s;">إغلاق النافذة</button>
            </div>
        </div>

        <!-- تخزين البيانات محلياً لتسهيل البحث والفلترة -->
        <script>window.currentAssessmentsData = ${JSON.stringify(assessments)};</script>
    `;
};

/**
 * دالة بناء جدول التقييمات الرئيسي
 */
AdminUI._generateAssessmentsTableHtml = function(assessments) {
    if (!assessments || assessments.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <span style="font-size: 4em; opacity: 0.5;">📝</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">لا توجد تقييمات مطابقة للبحث حالياً.</p>
            </div>
        `;
    }

    const rows = assessments.map(a => {
        const typeLabels = { 'exam': 'امتحان', 'quiz': 'اختبار', 'homework': 'واجب' };
        const typeColors = { 'exam': '#dc2626', 'quiz': '#2563eb', 'homework': '#16a34a' };
        const typeBg = { 'exam': '#fef2f2', 'quiz': '#eff6ff', 'homework': '#dcfce7' };

        return `
        <tr class="assessment-row" style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px; font-weight: bold; color: #64748b;">#${a.assessment_id || a.id}</td>
            <td style="padding: 15px;">
                <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(a.title)}</div>
                <small style="color: #64748b; font-weight: bold;">تطبيق على التكليف المرجعي: #${a.assignment_id}</small>
            </td>
            <td style="padding: 15px;">
                <span style="background: ${typeBg[a.type] || '#f1f5f9'}; color: ${typeColors[a.type] || '#475569'}; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; border: 1px solid ${typeColors[a.type]}40;">
                    ${typeLabels[a.type] || a.type}
                </span>
            </td>
            <td style="padding: 15px; font-weight: bold; color: #0f172a;">${a.max_grade} <small style="color:#94a3b8;">نقطة</small></td>
            <td style="padding: 15px; color: #dc2626; direction: ltr; text-align: right; font-weight: bold;">${this._escape(a.due_date || "غير محدد")}</td>
            <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                <button onclick="AdminUI.viewAssessmentGrades(${a.assessment_id || a.id}, '${this._escape(a.title)}')" title="عرض درجات الطلاب" style="background: #eff6ff; color: #1d4ed8; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; display: flex; align-items: center; gap: 5px;">
                    📊 الدرجات
                </button>
                <button onclick='AdminUI.showAssessmentModal(${JSON.stringify(a).replace(/'/g, "&apos;")})' title="تعديل خصائص التقييم" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">
                    ✏️
                </button>
                <button onclick="AdminRole.deleteItem('/assessments', ${a.assessment_id || a.id}, 'assessments')" title="حذف التقييم نهائياً" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">
                    🗑️
                </button>
            </td>
        </tr>
    `}).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.95em; color: #475569;">
                إجمالي التقييمات المعروضة: <strong style="color: #0f172a;">${assessments.length}</strong>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">عنوان التقييم والتكليف</th>
                            <th style="padding: 15px; color: #334155;">النوع</th>
                            <th style="padding: 15px; color: #334155;">الدرجة القصوى</th>
                            <th style="padding: 15px; color: #334155;">تاريخ الاستحقاق</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="assessments-table-body">${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

// ==========================================
// وظائف الفلترة والبحث المباشر
// ==========================================

AdminUI.filterAssessmentsLocal = function(type) {
    const keyword = document.getElementById("assessment-search").value.toLowerCase();
    this._applyFilters(type, keyword);
};

AdminUI.searchAssessmentsLocal = function(keyword) {
    const type = document.getElementById("assessment-type-filter").value;
    this._applyFilters(type, keyword.toLowerCase());
};

AdminUI._applyFilters = function(type, keyword) {
    const allAssessments = window.currentAssessmentsData || [];
    const filtered = allAssessments.filter(a => {
        const matchType = type === "all" || a.type === type;
        const matchKeyword = a.title.toLowerCase().includes(keyword) || String(a.assignment_id).includes(keyword);
        return matchType && matchKeyword;
    });
    document.getElementById("assessments-table-container").innerHTML = this._generateAssessmentsTableHtml(filtered);
};


// ==========================================
// وظائف النافذة المنبثقة (Modal) للإضافة والتعديل
// ==========================================

AdminUI.showAssessmentModal = async function(assessmentData = null) {
    const modal = document.getElementById("assessment-modal");
    const title = document.getElementById("assessment-modal-title");
    const assignSelect = document.getElementById("modal-assessment-assignment");

    document.getElementById("modal-assessment-id").value = "";
    document.getElementById("modal-assessment-title").value = "";
    document.getElementById("modal-assessment-type").value = "exam";
    document.getElementById("modal-assessment-max-grade").value = "20";
    document.getElementById("modal-assessment-due-date").value = "";

    assignSelect.innerHTML = '<option value="">جاري تحميل التكليفات...</option>';
    try {
        const assignRes = await Api.get("/assignments/"); 
        const assignments = assignRes.data || assignRes || [];
        assignSelect.innerHTML = '<option value="">-- يرجى اختيار التكليف المرجعي --</option>' + 
            assignments.map(a => `<option value="${a.id || a.assignment_id}">[#${a.id || a.assignment_id}] ${this._escape(a.subject_name || "مادة")} - فصل: ${this._escape(a.class_name || "عام")}</option>`).join("");
    } catch (err) {
        assignSelect.innerHTML = '<option value="">(يرجى كتابة رقم التكليف يدوياً في حالة فشل الجلب)</option>';
        assignSelect.outerHTML = `<input type="number" id="modal-assessment-assignment" placeholder="أدخل رقم التكليف (Assignment ID)" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none;">`;
    }

    if (assessmentData) {
        title.innerHTML = "<span>✏️</span> تعديل التقييم";
        document.getElementById("modal-assessment-id").value = assessmentData.assessment_id || assessmentData.id;
        document.getElementById("modal-assessment-title").value = assessmentData.title || "";
        document.getElementById("modal-assessment-type").value = assessmentData.type || "exam";
        document.getElementById("modal-assessment-max-grade").value = assessmentData.max_grade || 20;
        
        const currentAssignInput = document.getElementById("modal-assessment-assignment");
        currentAssignInput.value = assessmentData.assignment_id;
        currentAssignInput.disabled = true;

        if (assessmentData.due_date) document.getElementById("modal-assessment-due-date").value = assessmentData.due_date;
        
    } else {
        title.innerHTML = "<span>📝</span> إضافة تقييم جديد";
        const currentAssignInput = document.getElementById("modal-assessment-assignment");
        currentAssignInput.disabled = false;
    }

    modal.style.display = "flex";
};

AdminUI.closeAssessmentModal = function() {
    document.getElementById("assessment-modal").style.display = "none";
};

AdminUI.submitAssessment = async function() {
    const id = document.getElementById("modal-assessment-id").value;
    const title = document.getElementById("modal-assessment-title").value.trim();
    const type = document.getElementById("modal-assessment-type").value;
    const assignmentId = document.getElementById("modal-assessment-assignment").value;
    const maxGrade = parseFloat(document.getElementById("modal-assessment-max-grade").value) || 20;
    const dueDate = document.getElementById("modal-assessment-due-date").value;

    if (!title) {
        this.showToast("❌ يرجى إدخال عنوان التقييم", "error");
        return;
    }

    try {
        if (id) {
            await Api.put(`/assessments/${id}`, {
                title: title,
                type: type,
                max_grade: maxGrade,
                due_date: dueDate || null
            });
            this.showToast("✅ تم تحديث بيانات التقييم بنجاح.");
        } else {
            if (!assignmentId) {
                this.showToast("❌ يرجى اختيار التكليف المرجعي للتقييم", "error");
                return;
            }
            await Api.post("/assessments/", {
                title: title,
                type: type,
                assignment_id: parseInt(assignmentId),
                max_grade: maxGrade,
                due_date: dueDate || null
            });
            this.showToast("✅ تم إنشاء التقييم الجديد بنجاح.");
        }
        
        this.closeAssessmentModal();
        AdminRole.loadSection("assessments");

    } catch (err) {
        this.showToast("❌ فشل الحفظ: " + (err.message || "حدث خطأ غير متوقع."), "error");
    }
};

// ==========================================
// وظائف نافذة عرض الدرجات (الجديدة)
// ==========================================

AdminUI.viewAssessmentGrades = async function(assessmentId, title) {
    const modal = document.getElementById("grades-view-modal");
    const modalTitle = document.getElementById("grades-modal-title");
    const tbody = document.getElementById("grades-modal-body");
    
    // إظهار النافذة مع حالة التحميل
    modalTitle.innerHTML = `<span>📊</span> درجات: <span style="color:#2563eb;">${this._escape(title)}</span>`;
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #64748b; font-weight: bold;">جاري جلب بيانات الدرجات من السيرفر... ⏳</td></tr>`;
    modal.style.display = "flex";

    try {
        // الاتصال بالخادم لجلب الدرجات بناءً على الـ API الخاص بك
        const response = await Api.get(`/grades/assessment/${assessmentId}`);
        const gradesList = response.data || response || [];

        if (gradesList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px;">
                        <span style="font-size: 3em; opacity: 0.3;">📉</span>
                        <p style="color: #64748b; font-size: 1.1em; margin-top: 10px;">لا توجد درجات مرصودة لهذا التقييم حتى الآن.</p>
                    </td>
                </tr>`;
            return;
        }

        // بناء صفوف الجدول مع تمييز لوني للعلامات (الناجح بالأخضر والراسب بالأحمر)
        tbody.innerHTML = gradesList.map(g => {
            const maxGrade = g.max_grade || 20;
            const gradeValue = g.grade_value;
            const isPassing = gradeValue >= (maxGrade / 2);
            const gradeColor = isPassing ? '#16a34a' : '#dc2626';
            const gradeBg = isPassing ? '#dcfce7' : '#fef2f2';

            return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px 15px; font-weight: bold; color: #64748b;">#${g.student_id}</td>
                <td style="padding: 12px 15px; font-weight: bold; color: #0f172a;">${this._escape(g.student_name)}</td>
                <td style="padding: 12px 15px; font-weight: bold; direction: ltr; text-align: right;">
                    <span style="background: ${gradeBg}; color: ${gradeColor}; padding: 4px 10px; border-radius: 6px; font-size: 1.1em;">
                        ${gradeValue} <span style="font-size:0.8em; opacity:0.7;">/ ${maxGrade}</span>
                    </span>
                </td>
                <td style="padding: 12px 15px; color: #64748b; font-size: 0.95em;">
                    ${this._escape(g.teacher_remarks || "لا توجد ملاحظات")}
                </td>
            </tr>
            `;
        }).join("");

    } catch (err) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; background: #fef2f2; color: #dc2626; font-weight: bold;">
                    ❌ فشل جلب الدرجات: ${err.message}
                </td>
            </tr>`;
    }
};

AdminUI.closeGradesModal = function() {
    document.getElementById("grades-view-modal").style.display = "none";
};

/**
 * دالة مساعدة لإظهار الإشعارات السريعة
 */
if(!AdminUI.showToast) {
    AdminUI.showToast = function(message, type = "success") {
        const toast = document.createElement("div");
        toast.innerText = message;
        const bgColor = type === "error" ? "#dc2626" : "#0f172a";
        toast.style.cssText = `position: fixed; bottom: 20px; left: 20px; background: ${bgColor}; color: white; padding: 12px 25px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-weight: bold; transition: opacity 0.5s;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '0', 2500);
        setTimeout(() => toast.remove(), 3000);
    };
}
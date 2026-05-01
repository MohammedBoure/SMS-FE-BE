// frontend/js/roles/admin/tabs/assessments.js

AdminUI.assessmentsT = function(key, params = {}, fallback = "") {
    return this.t(`admin.assessments.${key}`, params, fallback);
};

AdminUI.assessmentTypeLabel = function(type) {
    const labels = {
        exam: this.assessmentsT("types.exam", {}, "Exam"),
        quiz: this.assessmentsT("types.quiz", {}, "Quiz"),
        homework: this.assessmentsT("types.homework", {}, "Homework")
    };
    return labels[type] || this._escape(type || "-");
};

AdminUI.assessmentTypePalette = function(type) {
    const palettes = {
        exam: { color: "#dc2626", bg: "#fef2f2" },
        quiz: { color: "#2563eb", bg: "#eff6ff" },
        homework: { color: "#16a34a", bg: "#dcfce7" }
    };
    return palettes[type] || { color: "#475569", bg: "#f1f5f9" };
};

AdminUI.ensureAssessmentAssignmentSelect = function(content = "") {
    const wrap = document.getElementById("modal-assessment-assignment-wrap");
    if (!wrap) return null;
    wrap.innerHTML = `
        <select id="modal-assessment-assignment" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
            ${content || `<option value="">${this.assessmentsT("form.loadingAssignments", {}, "Loading assignments...")}</option>`}
        </select>
    `;
    return document.getElementById("modal-assessment-assignment");
};

AdminUI.renderAssessmentsTab = function(response) {
    const main = this.prepareMain("admin.sections.assessments");
    const assessments = response.data || response || [];
    window.currentAssessmentsData = assessments;

    main.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); gap: 15px; flex-wrap: wrap;">
            <div style="display: flex; gap: 10px; flex: 1; min-width: 280px; flex-wrap: wrap;">
                <select id="assessment-type-filter" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc; font-weight: bold; color: #334155;" onchange="AdminUI.filterAssessmentsLocal(this.value)">
                    <option value="all">${this.assessmentsT("filters.allTypes", {}, "-- All assessment types --")}</option>
                    <option value="exam">${this.assessmentsT("types.examOfficial", {}, "Official Exam")}</option>
                    <option value="quiz">${this.assessmentsT("types.quizShort", {}, "Short Quiz")}</option>
                    <option value="homework">${this.assessmentsT("types.homework", {}, "Homework")}</option>
                </select>
                <input type="text" id="assessment-search" placeholder="${this.assessmentsT("filters.searchPlaceholder", {}, "Search by assessment name...")}"
                       style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; flex: 1; min-width: 180px; outline: none; font-weight: bold;"
                       onkeyup="AdminUI.searchAssessmentsLocal(this.value)">
                <button onclick="AdminRole.loadSection('assessments')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;" title="${this.assessmentsT("actions.reloadTitle", {}, "Reload list")}">
                    ${this.icon("refresh", "inline-svg-icon")} ${this.assessmentsT("actions.refresh", {}, "Refresh")}
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showAssessmentModal()" style="background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s;">
                    ${this.icon("clipboard", "inline-svg-icon")} ${this.assessmentsT("actions.add", {}, "Add New Assessment")}
                </button>
            </div>
        </div>

        <div id="assessments-table-container">
            ${this._generateAssessmentsTableHtml(assessments)}
        </div>

        <div id="assessment-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: min(550px, calc(100vw - 28px)); max-height: calc(100vh - 28px); overflow-y: auto; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 id="assessment-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("clipboard", "inline-svg-icon")} ${this.assessmentsT("form.addTitle", {}, "Add New Assessment")}
                </h3>
                <input type="hidden" id="modal-assessment-id">

                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.assessmentsT("form.titleLabel", {}, "Assessment Title (Required)")}</label>
                    <input type="text" id="modal-assessment-title" placeholder="${this.assessmentsT("form.titlePlaceholder", {}, "Example: First math assignment...")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.assessmentsT("form.typeLabel", {}, "Assessment Type")}</label>
                        <select id="modal-assessment-type" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                            <option value="exam">${this.assessmentsT("types.examOfficial", {}, "Official Exam")}</option>
                            <option value="quiz">${this.assessmentsT("types.quizShort", {}, "Short Quiz")}</option>
                            <option value="homework">${this.assessmentsT("types.homework", {}, "Homework")}</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.assessmentsT("form.maxGradeLabel", {}, "Maximum Grade")}</label>
                        <input type="number" id="modal-assessment-max-grade" value="20" min="1" step="0.5" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.assessmentsT("form.assignmentLabel", {}, "Reference Assignment (Subject and Teacher)")}</label>
                    <div id="modal-assessment-assignment-wrap">
                        <select id="modal-assessment-assignment" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                            <option value="">${this.assessmentsT("form.loadingAssignments", {}, "Loading assignments...")}</option>
                        </select>
                    </div>
                    <small style="color: #64748b; margin-top: 5px; display: block;">${this.assessmentsT("form.assignmentHint", {}, "Links this assessment to a subject and class so grades can be recorded.")}</small>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.assessmentsT("form.dueDateLabel", {}, "Due Date")}</label>
                    <input type="date" id="modal-assessment-due-date" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeAssessmentModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitAssessment()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">${this.assessmentsT("form.save", {}, "Save Assessment")}</button>
                </div>
            </div>
        </div>

        <div id="grades-view-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1001; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: min(650px, calc(100vw - 28px)); max-height: 80vh; display: flex; flex-direction: column; padding: 25px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                    <h3 id="grades-modal-title" style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                        ${this.icon("chart", "inline-svg-icon")} ${this.assessmentsT("gradesModal.title", {}, "Assessment Grades")}
                    </h3>
                    <button onclick="AdminUI.closeGradesModal()" style="background: #f1f5f9; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2em; color: #64748b; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">&times;</button>
                </div>

                <div class="admin-mobile-table" style="overflow-y: auto; flex: 1; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: right;">
                        <thead style="background: #f8fafc; position: sticky; top: 0;">
                            <tr>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">${this.assessmentsT("gradesModal.studentId", {}, "Student #")}</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">${this.assessmentsT("gradesModal.fullName", {}, "Full Name")}</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">${this.assessmentsT("gradesModal.grade", {}, "Grade")}</th>
                                <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #334155;">${this.assessmentsT("gradesModal.remarks", {}, "Teacher Remarks")}</th>
                            </tr>
                        </thead>
                        <tbody id="grades-modal-body"></tbody>
                    </table>
                </div>

                <button onclick="AdminUI.closeGradesModal()" style="width: 100%; background: #0f172a; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s;">${this.assessmentsT("gradesModal.close", {}, "Close Window")}</button>
            </div>
        </div>
    `;

    this.localize(main);
};

AdminUI._generateAssessmentsTableHtml = function(assessments) {
    if (!assessments || assessments.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <span style="font-size: 4em; opacity: 0.5;">${this.icon("clipboard", "inline-svg-icon")}</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">${this.assessmentsT("table.empty", {}, "No matching assessments found.")}</p>
            </div>
        `;
    }

    const rows = assessments.map(a => {
        const assessmentId = a.assessment_id || a.id;
        const palette = this.assessmentTypePalette(a.type);
        const titleArg = JSON.stringify(a.title || "").replace(/"/g, "&quot;");
        return `
            <tr class="assessment-row" style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #64748b;">#${assessmentId}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(a.title)}</div>
                    <small style="color: #64748b; font-weight: bold;">${this.assessmentsT("table.assignmentApplied", { id: a.assignment_id || "-" }, `Applied to assignment: #${a.assignment_id || "-"}`)}</small>
                </td>
                <td style="padding: 15px;">
                    <span style="background: ${palette.bg}; color: ${palette.color}; padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; border: 1px solid ${palette.color}40;">
                        ${this.assessmentTypeLabel(a.type)}
                    </span>
                </td>
                <td style="padding: 15px; font-weight: bold; color: #0f172a;">${this._escape(a.max_grade || 20)} <small style="color:#94a3b8;">${this.assessmentsT("table.points", {}, "points")}</small></td>
                <td style="padding: 15px; color: #dc2626; direction: ltr; text-align: right; font-weight: bold;">${this._escape(a.due_date || this.assessmentsT("table.notSpecified", {}, "Not specified"))}</td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="AdminUI.viewAssessmentGrades(${assessmentId}, ${titleArg})" title="${this.assessmentsT("actions.viewGradesTitle", {}, "View student grades")}" style="background: #eff6ff; color: #1d4ed8; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; display: flex; align-items: center; gap: 5px;">
                        ${this.icon("chart", "inline-svg-icon")} ${this.assessmentsT("actions.grades", {}, "Grades")}
                    </button>
                    <button onclick='AdminUI.showAssessmentModal(${JSON.stringify(a).replace(/'/g, "&apos;")})' title="${this.assessmentsT("actions.editTitle", {}, "Edit assessment properties")}" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">
                        ${this.icon("edit", "inline-svg-icon")}
                    </button>
                    <button onclick="AdminRole.deleteItem('/assessments', ${assessmentId}, 'assessments')" title="${this.assessmentsT("actions.deleteTitle", {}, "Delete assessment permanently")}" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">
                        ${this.icon("trash", "inline-svg-icon")}
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.95em; color: #475569;">
                ${this.assessmentsT("table.total", { count: assessments.length }, `Total assessments shown: ${assessments.length}`)}
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">${this.assessmentsT("table.titleAndAssignment", {}, "Assessment and Assignment")}</th>
                            <th style="padding: 15px; color: #334155;">${this.assessmentsT("table.type", {}, "Type")}</th>
                            <th style="padding: 15px; color: #334155;">${this.assessmentsT("table.maxGrade", {}, "Maximum Grade")}</th>
                            <th style="padding: 15px; color: #334155;">${this.assessmentsT("table.dueDate", {}, "Due Date")}</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">${this.assessmentsT("table.actions", {}, "Actions")}</th>
                        </tr>
                    </thead>
                    <tbody id="assessments-table-body">${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

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
        const title = String(a.title || "").toLowerCase();
        const matchType = type === "all" || a.type === type;
        const matchKeyword = title.includes(keyword) || String(a.assignment_id || "").includes(keyword);
        return matchType && matchKeyword;
    });
    const container = document.getElementById("assessments-table-container");
    if (container) container.innerHTML = this._generateAssessmentsTableHtml(filtered);
    this.localize(container);
};

AdminUI.showAssessmentModal = async function(assessmentData = null) {
    const modal = document.getElementById("assessment-modal");
    const title = document.getElementById("assessment-modal-title");
    let assignSelect = this.ensureAssessmentAssignmentSelect();

    document.getElementById("modal-assessment-id").value = "";
    document.getElementById("modal-assessment-title").value = "";
    document.getElementById("modal-assessment-type").value = "exam";
    document.getElementById("modal-assessment-max-grade").value = "20";
    document.getElementById("modal-assessment-due-date").value = "";

    try {
        const assignRes = await Api.get("/assignments/");
        const assignments = assignRes.data || assignRes || [];
        assignSelect = this.ensureAssessmentAssignmentSelect(
            `<option value="">${this.assessmentsT("form.chooseAssignment", {}, "-- Please choose the reference assignment --")}</option>` +
            assignments.map(a => {
                const id = a.id || a.assignment_id;
                const subject = this._escape(a.subject_name || this.assessmentsT("table.subject", {}, "Subject"));
                const className = this._escape(a.class_name || this.assessmentsT("table.general", {}, "General"));
                return `<option value="${id}">[#${id}] ${subject} - ${this.assessmentsT("table.classPrefix", {}, "Class:")} ${className}</option>`;
            }).join("")
        );
    } catch (err) {
        const wrap = document.getElementById("modal-assessment-assignment-wrap");
        wrap.innerHTML = `<input type="number" id="modal-assessment-assignment" placeholder="${this.assessmentsT("form.assignmentFallback", {}, "Enter Assignment ID")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none;">`;
    }

    if (assessmentData) {
        title.innerHTML = `${this.icon("edit", "inline-svg-icon")} ${this.assessmentsT("form.editTitle", {}, "Edit Assessment")}`;
        document.getElementById("modal-assessment-id").value = assessmentData.assessment_id || assessmentData.id;
        document.getElementById("modal-assessment-title").value = assessmentData.title || "";
        document.getElementById("modal-assessment-type").value = assessmentData.type || "exam";
        document.getElementById("modal-assessment-max-grade").value = assessmentData.max_grade || 20;

        const currentAssignInput = document.getElementById("modal-assessment-assignment");
        currentAssignInput.value = assessmentData.assignment_id;
        currentAssignInput.disabled = true;
        if (assessmentData.due_date) document.getElementById("modal-assessment-due-date").value = assessmentData.due_date;
    } else {
        title.innerHTML = `${this.icon("clipboard", "inline-svg-icon")} ${this.assessmentsT("form.addTitle", {}, "Add New Assessment")}`;
        const currentAssignInput = document.getElementById("modal-assessment-assignment");
        currentAssignInput.disabled = false;
    }

    modal.style.display = "flex";
    this.localize(modal);
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
        this.showToast(this.assessmentsT("messages.titleRequired", {}, "Please enter the assessment title."), "error");
        return;
    }

    try {
        if (id) {
            await Api.put(`/assessments/${id}`, {
                title,
                type,
                max_grade: maxGrade,
                due_date: dueDate || null
            });
            this.showToast(this.assessmentsT("messages.updated", {}, "Assessment updated successfully."));
        } else {
            if (!assignmentId) {
                this.showToast(this.assessmentsT("messages.assignmentRequired", {}, "Please choose the reference assignment."), "error");
                return;
            }
            await Api.post("/assessments/", {
                title,
                type,
                assignment_id: parseInt(assignmentId),
                max_grade: maxGrade,
                due_date: dueDate || null
            });
            this.showToast(this.assessmentsT("messages.created", {}, "Assessment created successfully."));
        }

        this.closeAssessmentModal();
        AdminRole.loadSection("assessments");

    } catch (err) {
        this.showToast(this.assessmentsT("messages.saveFailed", { message: err.message || this.assessmentsT("messages.unexpected", {}, "Unexpected error.") }, `Save failed: ${err.message}`), "error");
    }
};

AdminUI.viewAssessmentGrades = async function(assessmentId, title) {
    const modal = document.getElementById("grades-view-modal");
    const modalTitle = document.getElementById("grades-modal-title");
    const tbody = document.getElementById("grades-modal-body");

    modalTitle.innerHTML = `${this.icon("chart", "inline-svg-icon")} ${this.assessmentsT("gradesModal.titleWithName", { title: this._escape(title) }, `Grades: ${this._escape(title)}`)}`;
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #64748b; font-weight: bold;">${this.assessmentsT("gradesModal.loading", {}, "Fetching grades from server...")}</td></tr>`;
    modal.style.display = "flex";

    try {
        const response = await Api.get(`/grades/assessment/${assessmentId}`);
        const gradesList = response.data || response || [];

        if (gradesList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px;">
                        <span style="font-size: 3em; opacity: 0.3;">${this.icon("chart", "inline-svg-icon")}</span>
                        <p style="color: #64748b; font-size: 1.1em; margin-top: 10px;">${this.assessmentsT("gradesModal.empty", {}, "No grades have been recorded for this assessment yet.")}</p>
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = gradesList.map(g => {
            const maxGrade = g.max_grade || 20;
            const gradeValue = g.grade_value;
            const isPassing = gradeValue >= (maxGrade / 2);
            const gradeColor = isPassing ? "#16a34a" : "#dc2626";
            const gradeBg = isPassing ? "#dcfce7" : "#fef2f2";

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
                        ${this._escape(g.teacher_remarks || this.assessmentsT("gradesModal.noRemarks", {}, "No remarks"))}
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; background: #fef2f2; color: #dc2626; font-weight: bold;">
                    ${this.assessmentsT("gradesModal.fetchFailed", { message: err.message }, `Failed to fetch grades: ${err.message}`)}
                </td>
            </tr>`;
    }
};

AdminUI.closeGradesModal = function() {
    document.getElementById("grades-view-modal").style.display = "none";
};

if (!AdminUI.showToast) {
    AdminUI.showToast = function(message, type = "success") {
        const toast = document.createElement("div");
        toast.innerText = window.I18n ? I18n.text(message) : message;
        const bgColor = type === "error" ? "#dc2626" : "#0f172a";
        toast.style.cssText = `position: fixed; bottom: 20px; left: 20px; background: ${bgColor}; color: white; padding: 12px 25px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-weight: bold; transition: opacity 0.5s;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = "0", 2500);
        setTimeout(() => toast.remove(), 3000);
    };
}

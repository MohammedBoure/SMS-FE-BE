// frontend/js/roles/admin/tabs/grades.js

AdminUI.gradesT = function(key, params = {}, fallback = "") {
    return this.t(`admin.gradesTab.${key}`, params, fallback);
};

AdminUI.gradeInlineString = function(value) {
    return JSON.stringify(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.gradeTypeLabel = function(type) {
    const labels = {
        exam: this.gradesT("types.exam", {}, "Exam"),
        quiz: this.gradesT("types.quiz", {}, "Quiz"),
        homework: this.gradesT("types.homework", {}, "Homework")
    };
    return labels[type] || this._escape(type || labels.exam);
};

AdminUI.renderGradesTab = async function() {
    const main = this.prepareMain(this.t("admin.sections.grades", {}, "Grades and Results Management"));

    main.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b;">${this.gradesT("loading", {}, "Preparing grades panel...")}</div>`;

    let assessments = [];
    try {
        const response = await Api.get("/assessments");
        assessments = response.data || response || [];
    } catch (err) {
        console.error(this.gradesT("messages.assessmentsLoadFailed", {}, "Failed to load assessments list."), err);
    }

    const assessmentOptions = assessments.map(a => {
        const assessmentId = a.assessment_id || a.id;
        const maxGrade = a.max_grade || 20;
        const label = this.gradesT("assessment.optionLabel", {
            title: this._escape(a.title || "-"),
            max: maxGrade
        }, `${this._escape(a.title || "-")} (Max grade: ${maxGrade})`);
        return `<option value="${assessmentId}">${label}</option>`;
    }).join("");

    main.innerHTML = `
        <div class="admin-responsive-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid #991b1b;">
                <h3 style="margin-top: 0; color: #991b1b; display: flex; align-items: center; gap: 8px;">${this.icon("clipboard", "inline-svg-icon")} ${this.gradesT("assessmentCard.title", {}, "Exam or Assessment Grades")}</h3>
                <p style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">${this.gradesT("assessmentCard.description", {}, "Choose an assessment to view student grades and success statistics.")}</p>

                <div class="admin-mobile-stack" style="display: flex; gap: 10px;">
                    <select id="grades-assessment-select" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none; background: white;">
                        <option value="">${this.gradesT("assessment.choose", {}, "-- Choose assessment --")}</option>
                        ${assessmentOptions}
                    </select>
                </div>
                <button onclick="AdminUI.loadAssessmentGrades()" style="margin-top: 15px; width: 100%; background: #991b1b; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    ${this.gradesT("assessment.showGrades", {}, "Show Grades List")}
                </button>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-top: 4px solid #1e40af;">
                <h3 style="margin-top: 0; color: #1e40af; display: flex; align-items: center; gap: 8px;">${this.icon("graduation", "inline-svg-icon")} ${this.gradesT("studentCard.title", {}, "Student Grade Report")}</h3>
                <p style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">${this.gradesT("studentCard.description", {}, "Search for a student to view the full academic record.")}</p>

                <div class="admin-mobile-stack" style="display: flex; gap: 10px; position: relative;">
                    <div style="position: relative; flex: 1;">
                        <input type="text" id="grades-student-search" placeholder="${this.gradesT("studentCard.searchPlaceholder", {}, "Search by student name...")}"
                               style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; width: 100%; outline: none; box-sizing: border-box;"
                               onkeyup="AdminUI.searchStudentForGrades(this.value)">
                        <input type="hidden" id="grades-student-id">
                        <div id="grades-student-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; z-index: 10; margin-top: 5px;"></div>
                    </div>
                </div>
                <button onclick="AdminUI.loadStudentRecord()" style="margin-top: 15px; width: 100%; background: #1e40af; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    ${this.gradesT("studentCard.showRecord", {}, "Generate Grade Report")}
                </button>
            </div>
        </div>

        <div id="grades-results-container" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; min-height: 300px;">
            <div style="text-align: center; color: #94a3b8; margin-top: 80px;">
                <span style="display: inline-flex; width: 58px; height: 58px; align-items: center; justify-content: center;">${this.icon("chart", "inline-svg-icon")}</span>
                <p>${this.gradesT("results.emptyPrompt", {}, "Data and statistics will appear here after searching.")}</p>
            </div>
        </div>
    `;

    if (!this._gradesOutsideClickBound) {
        document.addEventListener("click", function(e) {
            const dropdowns = [
                [document.getElementById("grades-student-dropdown"), document.getElementById("grades-student-search")],
                [document.getElementById("quick-student-dropdown"), document.getElementById("quick-student-search")]
            ];
            dropdowns.forEach(([dropdown, input]) => {
                if (dropdown && input && e.target !== input && !dropdown.contains(e.target)) {
                    dropdown.style.display = "none";
                }
            });
        });
        this._gradesOutsideClickBound = true;
    }
};

AdminUI.searchStudentForGrades = async function(keyword) {
    const dropdown = document.getElementById("grades-student-dropdown");

    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/students/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const students = response?.data?.data || response?.data || response || [];

        if (students.length === 0) {
            dropdown.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center; font-size: 0.9em;">${this.gradesT("search.noResults", {}, "No matching results")}</div>`;
        } else {
            dropdown.innerHTML = students.map(s => {
                const id = s.student_id || s.id;
                const name = s.full_name || s.student_name || "";
                return `
                    <div onclick="AdminUI.selectStudentForGrades(${id}, ${this.gradeInlineString(name)})"
                         style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; display: flex; justify-content: space-between;"
                         onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <strong style="color: #0f172a;">${this._escape(name)}</strong>
                        <small style="color: #64748b;">${this.gradesT("search.idLabel", { id }, `ID: ${id}`)}</small>
                    </div>
                `;
            }).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error(this.gradesT("messages.searchFailed", {}, "Search failed:"), err);
    }
};

AdminUI.selectStudentForGrades = function(id, name) {
    document.getElementById("grades-student-search").value = name;
    document.getElementById("grades-student-id").value = id;
    document.getElementById("grades-student-dropdown").style.display = "none";
    this.loadStudentRecord();
};

AdminUI.loadAssessmentGrades = async function() {
    const assessmentId = document.getElementById("grades-assessment-select").value;
    const container = document.getElementById("grades-results-container");

    if (!assessmentId) {
        alert(this.gradesT("messages.chooseAssessmentFirst", {}, "Please choose an assessment first."));
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;">${this.gradesT("messages.loadingAssessmentGrades", {}, "Loading grades and statistics...")}</div>`;

    try {
        const [gradesRes, statsRes, assessmentRes] = await Promise.all([
            Api.get(`/grades/assessment/${assessmentId}`),
            Api.get(`/grades/assessment/${assessmentId}/statistics`),
            Api.get(`/assessments/${assessmentId}`)
        ]);

        const grades = gradesRes.data || gradesRes || [];
        const stats = statsRes.data || statsRes || {};
        const assessmentDetails = assessmentRes.data || assessmentRes || {};
        const maxGrade = Number(assessmentDetails.max_grade) || 20;
        const averageGrade = Number(stats.average_grade);

        const statsHtml = `
            <div class="admin-mobile-stack" style="display: flex; gap: 15px; margin-bottom: 20px; text-align: center;">
                <div style="flex: 1; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 0.85em; color: #64748b; margin-bottom: 5px;">${this.gradesT("stats.average", {}, "Average Grade")}</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #0f172a;">${Number.isFinite(averageGrade) ? averageGrade.toFixed(2) : "-"} / ${maxGrade}</div>
                </div>
                <div style="flex: 1; background: #dcfce7; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
                    <div style="font-size: 0.85em; color: #166534; margin-bottom: 5px;">${this.gradesT("stats.highest", {}, "Highest Grade")}</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #166534;">${stats.highest_grade ?? "-"}</div>
                </div>
                <div style="flex: 1; background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca;">
                    <div style="font-size: 0.85em; color: #991b1b; margin-bottom: 5px;">${this.gradesT("stats.lowest", {}, "Lowest Grade")}</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #991b1b;">${stats.lowest_grade ?? "-"}</div>
                </div>
                <div style="flex: 1; background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe;">
                    <div style="font-size: 0.85em; color: #1e40af; margin-bottom: 5px;">${this.gradesT("stats.gradedStudents", {}, "Graded Students")}</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #1e40af;">${grades.length}</div>
                </div>
            </div>
        `;

        const addFormHtml = `
            <div class="admin-mobile-stack" style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 10px; align-items: center; position: relative;">
                <span style="font-weight: bold; color: #334155;">${this.gradesT("quickForm.title", {}, "Enter Grade:")}</span>
                <div style="position: relative; flex: 1;">
                    <input type="text" id="quick-student-search" placeholder="${this.gradesT("quickForm.studentPlaceholder", {}, "Search for student...")}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; width: 100%; box-sizing: border-box;" onkeyup="AdminUI.searchStudentForQuickGrade(this.value)">
                    <input type="hidden" id="quick-student-id">
                    <div id="quick-student-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10; margin-top: 2px;"></div>
                </div>
                <input type="number" step="0.25" id="quick-grade-val" placeholder="${this.gradesT("quickForm.gradePlaceholder", {}, "Grade")}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; width: 100px;">
                <input type="text" id="quick-remarks" placeholder="${this.gradesT("quickForm.remarksPlaceholder", {}, "Teacher remarks (optional)")}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; flex: 1;">
                <button onclick="AdminUI.saveGrade(${assessmentId})" style="background: #064e3b; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.save", {}, "Save")}</button>
            </div>
        `;

        let tableRows = grades.map(g => {
            const isPassing = Number(g.grade_value) >= (maxGrade / 2);
            return `
                <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 12px; font-weight: bold;">#${g.student_id}</td>
                    <td style="padding: 12px;"><strong>${this._escape(g.student_name || this.gradesT("table.studentFallback", { id: g.student_id }, `Student #${g.student_id}`))}</strong></td>
                    <td style="padding: 12px;">
                        <span style="font-size: 1.1em; font-weight: bold; color: ${isPassing ? "#166534" : "#dc2626"};">${this._escape(g.grade_value)}</span> / ${maxGrade}
                    </td>
                    <td style="padding: 12px; color: #64748b;">${this._escape(g.teacher_remarks || "-")}</td>
                    <td style="padding: 12px; text-align: left;">
                        <button onclick="AdminRole.deleteItem('/grades', ${g.grade_id}, 'grades')" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 5px 10px; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">${this.icon("trash", "inline-svg-icon")} ${this.t("admin.actions.delete", {}, "Delete")}</button>
                    </td>
                </tr>
            `;
        }).join("");

        if (grades.length === 0) {
            tableRows = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">${this.gradesT("table.noAssessmentGrades", {}, "No grades have been entered for this assessment yet.")}</td></tr>`;
        }

        container.innerHTML = `
            <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${this.gradesT("assessmentResults.title", {}, "Assessment Statistics and Grades")}</h3>
            ${statsHtml}
            ${addFormHtml}
            <div class="admin-mobile-table">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9;">
                        <tr>
                            <th style="padding: 12px;">${this.gradesT("table.id", {}, "ID")}</th>
                            <th style="padding: 12px;">${this.gradesT("table.studentName", {}, "Student Name")}</th>
                            <th style="padding: 12px;">${this.gradesT("table.grade", {}, "Grade")}</th>
                            <th style="padding: 12px;">${this.gradesT("table.remarks", {}, "Teacher Remarks")}</th>
                            <th style="padding: 12px; text-align: left;">${this.gradesT("table.actions", {}, "Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">${this.gradesT("messages.assessmentLoadFailed", { message: err.message }, `Failed to load assessment data: ${err.message}`)}</div>`;
    }
};

AdminUI.searchStudentForQuickGrade = async function(keyword) {
    const dropdown = document.getElementById("quick-student-dropdown");

    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/students/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const students = response?.data?.data || response?.data || response || [];

        if (students.length === 0) {
            dropdown.innerHTML = `<div style="padding: 8px; color: #64748b; text-align: center; font-size: 0.85em;">${this.gradesT("search.noResults", {}, "No results")}</div>`;
        } else {
            dropdown.innerHTML = students.map(s => {
                const id = s.student_id || s.id;
                const name = s.full_name || s.student_name || "";
                return `
                    <div onclick="AdminUI.selectStudentForQuickGrade(${id}, ${this.gradeInlineString(name)})"
                         style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; display: flex; justify-content: space-between; font-size: 0.9em;"
                         onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <strong style="color: #0f172a;">${this._escape(name)}</strong>
                    </div>
                `;
            }).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error(this.gradesT("messages.searchFailed", {}, "Search failed:"), err);
    }
};

AdminUI.selectStudentForQuickGrade = function(id, name) {
    document.getElementById("quick-student-search").value = name;
    document.getElementById("quick-student-id").value = id;
    document.getElementById("quick-student-dropdown").style.display = "none";
};

AdminUI.saveGrade = async function(assessmentId) {
    const studentId = document.getElementById("quick-student-id").value;
    const gradeVal = document.getElementById("quick-grade-val").value;
    const remarks = document.getElementById("quick-remarks").value;

    if (!studentId || !gradeVal) {
        alert(this.gradesT("messages.studentAndGradeRequired", {}, "Please choose a student and enter the grade."));
        return;
    }

    try {
        await Api.post("/grades/", {
            student_id: parseInt(studentId),
            assessment_id: parseInt(assessmentId),
            grade_value: parseFloat(gradeVal),
            teacher_remarks: remarks || null
        });

        document.getElementById("quick-student-id").value = "";
        document.getElementById("quick-student-search").value = "";
        document.getElementById("quick-grade-val").value = "";
        document.getElementById("quick-remarks").value = "";
        this.showToast(this.gradesT("messages.gradeSaved", {}, "Grade saved successfully."));
        AdminUI.loadAssessmentGrades();
    } catch (err) {
        alert(this.gradesT("messages.saveFailed", { message: err.message }, `Save failed: ${err.message}`));
    }
};

AdminUI.loadStudentRecord = async function() {
    const studentId = document.getElementById("grades-student-id").value;
    const container = document.getElementById("grades-results-container");

    if (!studentId) {
        alert(this.gradesT("messages.chooseStudentFirst", {}, "Please choose a student first."));
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 40px;">${this.gradesT("messages.loadingStudentRecord", {}, "Generating academic record...")}</div>`;

    try {
        const history = await Api.get(`/grades/student/${studentId}`);
        const records = history.data || history || [];

        if (records.length === 0) {
            container.innerHTML = `<div style="background: #f8fafc; color: #475569; padding: 20px; border-radius: 8px; text-align: center;">${this.gradesT("studentRecord.empty", {}, "No grades are recorded in this student's academic record yet.")}</div>`;
            return;
        }

        const rows = records.map(r => `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px; font-weight: bold; color: #0f172a;">${this._escape(r.assessment_title || "-")}</td>
                <td style="padding: 12px;"><span style="background: #eff6ff; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 0.85em;">${this.gradeTypeLabel(r.assessment_type || "exam")}</span></td>
                <td style="padding: 12px;">${this._escape(r.program_name || "-")} / ${this._escape(r.class_name || "-")}</td>
                <td style="padding: 12px;">
                    <span style="font-weight: bold; font-size: 1.1em;">${this._escape(r.grade_value)}</span> / ${this._escape(r.max_grade || "?")}
                </td>
                <td style="padding: 12px; color: #64748b; font-size: 0.9em;">${this._escape(r.teacher_remarks || "-")}</td>
            </tr>
        `).join("");

        container.innerHTML = `
            <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${this.gradesT("studentRecord.title", { id: studentId }, `Full Academic Report: Student #${studentId}`)}</h3>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9;">
                        <tr>
                            <th style="padding: 12px;">${this.gradesT("studentRecord.assessment", {}, "Assessment / Subject")}</th>
                            <th style="padding: 12px;">${this.gradesT("studentRecord.type", {}, "Type")}</th>
                            <th style="padding: 12px;">${this.gradesT("studentRecord.programClass", {}, "Program / Class")}</th>
                            <th style="padding: 12px;">${this.gradesT("studentRecord.gradeValue", {}, "Grade")}</th>
                            <th style="padding: 12px;">${this.gradesT("studentRecord.remarks", {}, "Remarks")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">${this.gradesT("messages.studentRecordFailed", { message: err.message }, `Failed to generate report: ${err.message}`)}</div>`;
    }
};

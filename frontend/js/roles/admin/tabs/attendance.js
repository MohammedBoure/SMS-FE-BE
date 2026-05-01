// frontend/js/roles/admin/tabs/attendance.js

AdminUI.attendanceT = function(key, params = {}, fallback = "") {
    return this.t(`admin.attendanceTab.${key}`, params, fallback);
};

AdminUI.attendanceStatusLabel = function(status) {
    const labels = {
        present: this.attendanceT("status.present", {}, "Present"),
        absent: this.attendanceT("status.absent", {}, "Absent"),
        late: this.attendanceT("status.late", {}, "Late")
    };
    return labels[status] || labels.present;
};

AdminUI.attendanceStatusColor = function(status) {
    if (status === "absent") return "#dc2626";
    if (status === "late") return "#d97706";
    return "#16a34a";
};

AdminUI.renderAttendanceTab = async function() {
    const main = this.prepareMain("admin.sections.attendance");
    main.innerHTML = `<div style="text-align:center; padding: 50px; color: #64748b; font-weight: bold;">${this.attendanceT("loading", {}, "Preparing attendance panel...")}</div>`;

    let classes = [];
    try {
        const response = await Api.get("/classes/");
        classes = response.data || response || [];
    } catch (err) {
        console.error("Failed to fetch classes", err);
    }

    const classOptions = classes.map(c => {
        const programLabel = c.program_name ? `${c.program_name} - ` : "";
        const level = c.level || this.attendanceT("common.general", {}, "General");
        return `<option value="${c.class_id || c.id}">${this._escape(programLabel + c.class_name)} (${this._escape(level)})</option>`;
    }).join("");
    const today = new Date().toISOString().split("T")[0];

    main.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 25px;">
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #064e3b;">
                <h3 style="margin-top: 0; color: #064e3b; display: flex; align-items: center; gap: 8px;">${this.icon("clipboard", "inline-svg-icon")} ${this.attendanceT("classCard.title", {}, "Record Class Attendance")}</h3>
                <p style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">${this.attendanceT("classCard.description", {}, "Choose class and date to review the list and record statuses.")}</p>

                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <select id="attendance-class-select" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; flex: 1; min-width: 160px; outline: none; background: #f8fafc; font-weight: bold; color: #334155;">
                        <option value="">${this.attendanceT("classCard.chooseClass", {}, "-- Please choose the class --")}</option>
                        ${classOptions}
                    </select>
                    <input type="date" id="attendance-date" value="${today}" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-weight: bold; color: #334155;">
                </div>
                <button onclick="AdminUI.loadClassSheet()" style="margin-top: 15px; width: 100%; background: #064e3b; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05em; transition: 0.2s; box-shadow: 0 4px 6px rgba(6,78,59,0.2);">
                    ${this.attendanceT("classCard.showSheet", {}, "Show Attendance Sheet")}
                </button>
            </div>

            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #1e40af; display: flex; align-items: center; gap: 8px;">${this.icon("search", "inline-svg-icon")} ${this.attendanceT("studentCard.title", {}, "Student Absence Record")}</h3>
                <p style="color: #64748b; font-size: 0.9em; margin-bottom: 15px;">${this.attendanceT("studentCard.description", {}, "Search by student name to view the record and manage justifications.")}</p>

                <div style="display: flex; gap: 10px; position: relative;">
                    <div style="position: relative; flex: 1;">
                        <input type="text" id="attendance-student-search" placeholder="${this.attendanceT("studentCard.searchPlaceholder", {}, "Search by student name...")}"
                               style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; outline: none; font-weight: bold; box-sizing: border-box;"
                               onkeyup="AdminUI.searchStudentForAttendance(this.value)">
                        <input type="hidden" id="attendance-student-id">
                        <div id="attendance-student-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; z-index: 10; margin-top: 5px;"></div>
                    </div>
                </div>
                <button onclick="AdminUI.loadStudentAttendance()" style="margin-top: 15px; width: 100%; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05em; transition: 0.2s; box-shadow: 0 4px 6px rgba(59,130,246,0.2);">
                    ${this.attendanceT("studentCard.showRecord", {}, "Show Individual Record")}
                </button>
            </div>
        </div>

        <div id="attendance-results-container" style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 25px; min-height: 400px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; color: #94a3b8; margin-top: 100px;">
                <span style="font-size: 4em; opacity: 0.5;">${this.icon("clipboard", "inline-svg-icon")}</span>
                <p style="font-size: 1.1em; margin-top: 15px;">${this.attendanceT("results.emptyPrompt", {}, "Data will appear here after searching or choosing a class above.")}</p>
            </div>
        </div>

        <div id="justification-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: min(450px, calc(100vw - 28px)); padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">${this.icon("edit", "inline-svg-icon")} ${this.attendanceT("justification.title", {}, "Edit Absence Justification")}</h3>
                <input type="hidden" id="modal-just-attendance-id">
                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.attendanceT("justification.statusLabel", {}, "Justification Status:")}</label>
                    <select id="modal-just-status" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc; font-weight: bold;" onchange="document.getElementById('modal-just-reason').disabled = this.value === 'false'">
                        <option value="true">${this.attendanceT("justification.justified", {}, "Justified Absence")}</option>
                        <option value="false">${this.attendanceT("justification.unjustified", {}, "Unjustified Absence")}</option>
                    </select>
                </div>
                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.attendanceT("justification.reasonLabel", {}, "Notes / Absence Reason:")}</label>
                    <textarea id="modal-just-reason" rows="3" placeholder="${this.attendanceT("justification.reasonPlaceholder", {}, "Enter justification details...")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box; resize: vertical;"></textarea>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeAttendanceModals()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitJustification()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.attendanceT("justification.save", {}, "Save Changes")}</button>
                </div>
            </div>
        </div>

        <div id="stats-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: min(500px, calc(100vw - 28px)); padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">${this.icon("chart", "inline-svg-icon")} ${this.attendanceT("stats.title", {}, "Attendance Statistics")}</h3>
                    <button onclick="AdminUI.closeAttendanceModals()" style="background: #f1f5f9; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2em; color: #64748b;">&times;</button>
                </div>
                <div id="stats-modal-content" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px;"></div>
                <button onclick="AdminUI.closeAttendanceModals()" style="margin-top: 25px; width: 100%; background: #0f172a; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.close", {}, "Close")}</button>
            </div>
        </div>
    `;

    if (!this._attendanceDropdownBound) {
        document.addEventListener("click", function(e) {
            const dropdown = document.getElementById("attendance-student-dropdown");
            const searchInput = document.getElementById("attendance-student-search");
            if (dropdown && e.target !== searchInput && e.target !== dropdown) {
                dropdown.style.display = "none";
            }
        });
        this._attendanceDropdownBound = true;
    }

    this.localize(main);
};

AdminUI.searchStudentForAttendance = async function(keyword) {
    const dropdown = document.getElementById("attendance-student-dropdown");
    if (!dropdown) return;

    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/students/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const students = response.data || [];

        if (students.length === 0) {
            dropdown.innerHTML = `<div style="padding: 12px; color: #64748b; text-align: center; font-size: 0.9em;">${this.attendanceT("search.noResults", {}, "No matching results")}</div>`;
        } else {
            dropdown.innerHTML = students.map(s => {
                const id = s.student_id || s.id;
                const name = s.full_name || s.student_name || "-";
                const safeName = JSON.stringify(name).replace(/'/g, "&#39;");
                return `
                    <div onclick='AdminUI.selectStudentForAttendance(${id}, ${safeName})'
                         style="padding: 12px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; display: flex; justify-content: space-between;"
                         onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <strong style="color: #0f172a;">${this._escape(name)}</strong>
                        <small style="color: #64748b;">${this.attendanceT("search.idLabel", { id }, `ID: ${id}`)}</small>
                    </div>
                `;
            }).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error("Failed to search attendance student dropdown:", err);
    }
};

AdminUI.selectStudentForAttendance = function(id, name) {
    document.getElementById("attendance-student-search").value = name;
    document.getElementById("attendance-student-id").value = id;
    document.getElementById("attendance-student-dropdown").style.display = "none";
    this.loadStudentAttendance();
};

AdminUI.loadClassSheet = async function() {
    const classId = document.getElementById("attendance-class-select").value;
    const date = document.getElementById("attendance-date").value;
    const container = document.getElementById("attendance-results-container");

    if (!classId || !date) {
        alert(this.attendanceT("messages.chooseClassAndDate", {}, "Please choose a class and date first."));
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 50px; font-weight: bold;">${this.attendanceT("messages.loadingClassSheet", {}, "Fetching list from the server...")}</div>`;

    try {
        const sheet = await Api.get(`/attendance/class/${classId}/sheet?target_date=${date}`);
        const students = sheet.data || sheet || [];

        if (students.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 40px; border: 1px dashed #cbd5e1; border-radius: 12px;"><span style="font-size: 3em; opacity: 0.5;">${this.icon("ban", "inline-svg-icon")}</span><p style="color: #64748b; margin-top: 15px;">${this.attendanceT("messages.noStudentsInClass", {}, "No students are currently enrolled in this class.")}</p></div>`;
            return;
        }

        const rows = students.map(s => {
            const currentStatus = s.status || s.attendance_status || "present";
            const isSaved = s.attendance_id != null || s.status != null;
            return `
                <tr class="attendance-row" data-studentid="${s.student_id}" style="border-bottom: 1px solid #e2e8f0; background: ${isSaved ? "#f8fafc" : "transparent"};">
                    <td style="padding: 15px; font-weight: bold; color: #64748b;">#${s.student_id}</td>
                    <td style="padding: 15px; font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(s.student_name)}</td>
                    <td style="padding: 15px;">
                        <select id="status-${s.student_id}" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; background: white; font-weight: bold; cursor: pointer;">
                            <option value="present" ${currentStatus === "present" ? "selected" : ""}>${this.attendanceStatusLabel("present")}</option>
                            <option value="absent" ${currentStatus === "absent" ? "selected" : ""}>${this.attendanceStatusLabel("absent")}</option>
                            <option value="late" ${currentStatus === "late" ? "selected" : ""}>${this.attendanceStatusLabel("late")}</option>
                        </select>
                    </td>
                    <td style="padding: 15px;">
                        <input type="text" id="reason-${s.student_id}" placeholder="${this.attendanceT("sheet.reasonPlaceholder", {}, "Reason (if any)...")}" value="${this._escape(s.justification_reason || "")}" style="padding: 8px 12px; width: 90%; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                    </td>
                    <td style="padding: 15px; text-align: left;">
                        <button id="btn-save-${s.student_id}" onclick="AdminUI.saveSingleAttendance(${s.student_id}, '${date}')" style="background: ${isSaved ? "#10b981" : "#f59e0b"}; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s;">
                            ${isSaved ? this.attendanceT("sheet.saved", {}, "Saved") : this.t("admin.actions.save", {}, "Save")}
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px; gap: 12px; flex-wrap: wrap;">
                <h3 style="margin: 0; color: #0f172a;">${this.attendanceT("sheet.title", { date }, `Attendance Sheet for: ${date}`)}</h3>
                <button onclick="AdminUI.saveAllAttendance('${date}')" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(16,185,129,0.2); transition: 0.2s;">
                    ${this.icon("save", "inline-svg-icon")} ${this.attendanceT("sheet.saveAll", {}, "Save Entire Class Sheet")}
                </button>
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">${this.attendanceT("sheet.studentName", {}, "Student Name")}</th>
                            <th style="padding: 15px; color: #334155;">${this.attendanceT("sheet.status", {}, "Status")}</th>
                            <th style="padding: 15px; color: #334155;">${this.attendanceT("sheet.notes", {}, "Notes / Justification")}</th>
                            <th style="padding: 15px; color: #334155; text-align: left;">${this.attendanceT("sheet.singleAction", {}, "Single Action")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
        this.localize(container);
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fca5a5; font-weight: bold;">${this.attendanceT("messages.loadClassSheetFailed", { message: err.message }, `Failed to load list: ${err.message}`)}</div>`;
    }
};

AdminUI.saveSingleAttendance = async function(studentId, targetDate) {
    const classId = document.getElementById("attendance-class-select")?.value || null;
    const status = document.getElementById(`status-${studentId}`).value;
    const reason = document.getElementById(`reason-${studentId}`).value.trim();
    const isJustified = reason.length > 0;

    try {
        await Api.post("/attendance/", {
            student_id: studentId,
            class_id: classId ? parseInt(classId) : null,
            target_date: targetDate,
            status,
            is_justified: isJustified,
            justification_reason: reason || null
        });

        const btn = document.getElementById(`btn-save-${studentId}`);
        btn.style.background = "#10b981";
        btn.innerText = this.attendanceT("sheet.saved", {}, "Saved");
        this.showToast(this.attendanceT("messages.recordSaved", {}, "Record saved successfully."));
    } catch (err) {
        alert(this.attendanceT("messages.saveFailed", { message: err.message }, `Save failed: ${err.message}`));
    }
};

AdminUI.saveAllAttendance = async function(targetDate) {
    const rows = document.querySelectorAll(".attendance-row");
    if (rows.length === 0) return;

    const btnAll = document.querySelector("button[onclick^='AdminUI.saveAllAttendance']");
    const originalText = btnAll.innerHTML;
    btnAll.innerHTML = this.attendanceT("messages.saving", {}, "Saving...");
    btnAll.disabled = true;

    const promises = Array.from(rows).map(row => {
        const studentId = row.dataset.studentid;
        const classId = document.getElementById("attendance-class-select")?.value || null;
        const status = document.getElementById(`status-${studentId}`).value;
        const reason = document.getElementById(`reason-${studentId}`).value.trim();

        return Api.post("/attendance/", {
            student_id: parseInt(studentId),
            class_id: classId ? parseInt(classId) : null,
            target_date: targetDate,
            status,
            is_justified: reason.length > 0,
            justification_reason: reason || null
        }).then(() => {
            const btn = document.getElementById(`btn-save-${studentId}`);
            btn.style.background = "#10b981";
            btn.innerText = this.attendanceT("sheet.saved", {}, "Saved");
        });
    });

    try {
        await Promise.all(promises);
        this.showToast(this.attendanceT("messages.sheetSaved", {}, "Attendance sheet saved successfully."));
    } catch (err) {
        alert(this.attendanceT("messages.partialSaveFailed", {}, "An error occurred while saving some records. Please review and try again."));
    } finally {
        btnAll.innerHTML = originalText;
        btnAll.disabled = false;
    }
};

AdminUI.loadStudentAttendance = async function() {
    const studentId = document.getElementById("attendance-student-id").value;
    const container = document.getElementById("attendance-results-container");

    if (!studentId) {
        alert(this.attendanceT("messages.chooseStudentFirst", {}, "Please choose a student from the list first."));
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: #64748b; padding: 50px; font-weight: bold;">${this.attendanceT("messages.loadingStudentRecord", {}, "Fetching student record...")}</div>`;

    try {
        const history = await Api.get(`/attendance/student/${studentId}`);
        const records = history.data || history || [];

        if (records.length === 0) {
            container.innerHTML = `
                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 30px; border-radius: 12px; text-align: center;">
                    <span style="font-size: 3em;">${this.icon("check", "inline-svg-icon")}</span>
                    <h3 style="margin: 10px 0 0 0;">${this.attendanceT("record.cleanTitle", {}, "Student record is clean!")}</h3>
                    <p style="margin-top: 5px;">${this.attendanceT("record.cleanDescription", {}, "No absences or late arrivals are recorded for this student.")}</p>
                </div>`;
            return;
        }

        const rows = records.map(r => {
            const isAbsent = r.status === "absent";
            const statusColor = this.attendanceStatusColor(r.status);
            const attendanceId = r.id || r.attendance_id;
            const justifiedLabel = r.is_justified
                ? this.attendanceT("record.justified", {}, "Justified")
                : this.attendanceT("record.unjustified", {}, "Unjustified");
            const reasonArg = JSON.stringify(r.justification_reason || "").replace(/"/g, "&quot;");

            return `
                <tr style="border-bottom: 1px solid #e2e8f0; background: ${isAbsent && !r.is_justified ? "#fef2f2" : "transparent"};">
                    <td style="padding: 15px; font-weight: bold; direction: ltr; text-align: right; color: #475569;">${this._escape(r.date || r.target_date)}</td>
                    <td style="padding: 15px; color: #334155;">${this._escape(r.class_name || "-")}</td>
                    <td style="padding: 15px; font-weight: bold; color: ${statusColor};">${this.attendanceStatusLabel(r.status)}</td>
                    <td style="padding: 15px;">
                        <span style="background: ${r.is_justified ? "#dcfce7" : "#fee2e2"}; color: ${r.is_justified ? "#166534" : "#991b1b"}; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold;">
                            ${justifiedLabel}
                        </span>
                    </td>
                    <td style="padding: 15px; color: #64748b;">${this._escape(r.justification_reason || "-")}</td>
                    <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                        <button onclick="AdminUI.showJustificationModal(${attendanceId}, ${r.is_justified}, ${reasonArg})" style="background: #fffbeb; border: none; color: #d97706; padding: 8px; border-radius: 6px; cursor: pointer;" title="${this.attendanceT("record.editJustification", {}, "Edit justification")}">${this.icon("edit", "inline-svg-icon")}</button>
                        <button onclick="AdminRole.deleteItem('/attendance', ${attendanceId}, 'attendance')" style="background: #fef2f2; border: none; color: #dc2626; padding: 8px; border-radius: 6px; cursor: pointer;" title="${this.attendanceT("record.deleteRecord", {}, "Delete record")}">${this.icon("trash", "inline-svg-icon")}</button>
                    </td>
                </tr>
            `;
        }).join("");

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; gap: 12px; flex-wrap: wrap;">
                <h3 style="margin: 0; color: #0f172a;">${this.attendanceT("record.title", { id: studentId }, `Absence and lateness record for student #${studentId}`)}</h3>
                <button onclick="AdminUI.showAttendanceStats(${studentId})" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(59,130,246,0.2);">
                    ${this.icon("chart", "inline-svg-icon")} ${this.attendanceT("record.showStats", {}, "View Student Statistics")}
                </button>
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px;">${this.attendanceT("record.date", {}, "Date")}</th>
                            <th style="padding: 15px;">${this.attendanceT("record.class", {}, "Class")}</th>
                            <th style="padding: 15px;">${this.attendanceT("record.status", {}, "Status")}</th>
                            <th style="padding: 15px;">${this.attendanceT("record.adminJustification", {}, "Administrative Justification")}</th>
                            <th style="padding: 15px;">${this.attendanceT("record.reason", {}, "Reason / Notes")}</th>
                            <th style="padding: 15px; text-align: left;">${this.attendanceT("record.actions", {}, "Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
        this.localize(container);
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fca5a5;">${this.attendanceT("messages.loadStudentRecordFailed", { message: err.message }, `Failed to load student record: ${err.message}`)}</div>`;
    }
};

AdminUI.closeAttendanceModals = function() {
    document.getElementById("justification-modal").style.display = "none";
    document.getElementById("stats-modal").style.display = "none";
};

AdminUI.showJustificationModal = function(attendanceId, isJustified, currentReason) {
    document.getElementById("modal-just-attendance-id").value = attendanceId;
    document.getElementById("modal-just-status").value = isJustified ? "true" : "false";
    const reasonInput = document.getElementById("modal-just-reason");
    reasonInput.value = currentReason !== "-" ? currentReason : "";
    reasonInput.disabled = !isJustified;
    document.getElementById("justification-modal").style.display = "flex";
};

AdminUI.submitJustification = async function() {
    const attendanceId = document.getElementById("modal-just-attendance-id").value;
    const isJustified = document.getElementById("modal-just-status").value === "true";
    const reason = document.getElementById("modal-just-reason").value.trim();

    try {
        await Api.patch(`/attendance/${attendanceId}/justification`, {
            is_justified: isJustified,
            justification_reason: isJustified ? reason : null
        });
        this.closeAttendanceModals();
        this.showToast(this.attendanceT("messages.justificationUpdated", {}, "Justification status updated successfully."));
        this.loadStudentAttendance();
    } catch (err) {
        alert(this.attendanceT("messages.updateFailed", { message: err.message }, `Update failed: ${err.message}`));
    }
};

AdminUI.showAttendanceStats = async function(studentId) {
    const modal = document.getElementById("stats-modal");
    const content = document.getElementById("stats-modal-content");

    content.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #64748b; font-weight: bold;">${this.attendanceT("stats.loading", {}, "Calculating statistics...")}</div>`;
    modal.style.display = "flex";

    try {
        const stats = await Api.get(`/attendance/student/${studentId}/statistics`);
        const totalAbsences = stats.absent_count || 0;
        const totalLates = stats.late_count || 0;
        const justifiedAbsences = stats.justified_absences || 0;
        const unjustifiedAbsences = totalAbsences - justifiedAbsences;
        const boxes = [
            { value: totalAbsences, label: this.attendanceT("stats.totalAbsences", {}, "Total Absences"), color: "#ef4444", bg: "#f1f5f9", border: "#e2e8f0" },
            { value: totalLates, label: this.attendanceT("stats.totalLates", {}, "Total Late Arrivals"), color: "#f59e0b", bg: "#f1f5f9", border: "#e2e8f0" },
            { value: justifiedAbsences, label: this.attendanceT("stats.justifiedAbsences", {}, "Justified Absences"), color: "#16a34a", bg: "#dcfce7", border: "#a7f3d0" },
            { value: unjustifiedAbsences, label: this.attendanceT("stats.unjustifiedAbsences", {}, "Unjustified Absences"), color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" }
        ];

        content.innerHTML = boxes.map(box => `
            <div style="background: ${box.bg}; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid ${box.border};">
                <div style="font-size: 2.5em; font-weight: bold; color: ${box.color};">${box.value}</div>
                <div style="color: #475569; font-weight: bold; margin-top: 5px;">${box.label}</div>
            </div>
        `).join("");
    } catch (err) {
        content.innerHTML = `<div style="grid-column: 1/-1; color: #991b1b; text-align: center; font-weight: bold;">${this.attendanceT("stats.fetchFailed", {}, "Unable to fetch statistics. Please try again later.")}</div>`;
    }
};

AdminUI.showToast = function(message, type = "success") {
    const toast = document.createElement("div");
    toast.innerText = window.I18n ? I18n.text(message) : message;
    const bgColor = type === "error" ? "#dc2626" : "#0f172a";
    toast.style.cssText = `position: fixed; bottom: 20px; left: 20px; background: ${bgColor}; color: white; padding: 12px 25px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-weight: bold; transition: opacity 0.5s;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.style.opacity = "0", 2500);
    setTimeout(() => toast.remove(), 3000);
};

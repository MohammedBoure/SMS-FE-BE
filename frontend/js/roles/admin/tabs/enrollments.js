// frontend/js/roles/admin/tabs/enrollments.js

AdminUI.enrollmentsT = function(key, params = {}, fallback = "") {
    return this.t(`admin.enrollments.${key}`, params, fallback);
};

AdminUI.enrollmentStatusLabel = function(status) {
    const labels = {
        active: this.enrollmentsT("status.active", {}, "Active"),
        completed: this.enrollmentsT("status.completed", {}, "Completed"),
        dropped: this.enrollmentsT("status.dropped", {}, "Dropped")
    };
    return labels[status] || labels.active;
};

AdminUI.enrollmentStatusColor = function(status) {
    return {
        active: "#16a34a",
        completed: "#2563eb",
        dropped: "#dc2626"
    }[status] || "#16a34a";
};

AdminUI.renderEnrollmentsTab = function(response) {
    const main = this.prepareMain(this.t("admin.sections.enrollments", {}, "Enrollment Records Management"));
    const enrollments = response.data || response || [];

    main.innerHTML = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); gap: 15px; flex-wrap: wrap;">
            <div class="admin-toolbar-search" style="display: flex; gap: 10px; flex: 1; min-width: 300px; flex-wrap: wrap;">
                <select id="enrollment-status-filter" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc; font-weight: bold; color: #334155;" onchange="AdminUI.filterEnrollments()">
                    <option value="">${this.enrollmentsT("filters.allStatuses", {}, "-- Filter by status (All) --")}</option>
                    <option value="active">${this.enrollmentStatusLabel("active")}</option>
                    <option value="completed">${this.enrollmentStatusLabel("completed")}</option>
                    <option value="dropped">${this.enrollmentStatusLabel("dropped")}</option>
                </select>
                <button onclick="AdminRole.loadSection('enrollments')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;" title="${this.enrollmentsT("actions.reloadTitle", {}, "Reload list")}">
                    ${this.icon("refresh", "inline-svg-icon")} ${this.enrollmentsT("actions.refresh", {}, "Refresh")}
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showAddEnrollmentModal()" style="background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s;">
                    ${this.icon("clipboard", "inline-svg-icon")} ${this.enrollmentsT("actions.enrollStudent", {}, "Enroll Student in Program")}
                </button>
            </div>
        </div>

        <div id="enrollments-table-container">
            ${this._generateEnrollmentsTableHtml(enrollments)}
        </div>

        <div id="add-enrollment-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px); padding: 18px;">
            <div style="background: white; width: min(500px, 100%); max-height: calc(100vh - 36px); overflow-y: auto; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("clipboard", "inline-svg-icon")} ${this.enrollmentsT("form.title", {}, "Create New Enrollment Record")}
                </h3>

                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">${this.enrollmentsT("form.studentLabel", {}, "Student to Enroll *")}</label>
                    <select id="modal-enroll-student" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                        <option value="">${this.enrollmentsT("form.loadingStudents", {}, "Loading students...")}</option>
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">${this.enrollmentsT("form.programLabel", {}, "Program *")}</label>
                    <select id="modal-enroll-program" onchange="AdminUI.updateEnrollmentClassOptions(this.value)" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                        <option value="">${this.enrollmentsT("form.loadingPrograms", {}, "Loading programs...")}</option>
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">${this.enrollmentsT("form.classLabel", {}, "Class / Group *")}</label>
                    <select id="modal-enroll-class" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc;">
                        <option value="">${this.enrollmentsT("form.chooseProgramFirst", {}, "-- Choose the program first --")}</option>
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">${this.enrollmentsT("form.groupLabel", {}, "Group Name (Optional)")}</label>
                    <input type="text" id="modal-enroll-group" placeholder="${this.enrollmentsT("form.groupPlaceholder", {}, "Example: Group A, morning group...")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">${this.enrollmentsT("form.notesLabel", {}, "Administrative Notes (Optional)")}</label>
                    <textarea id="modal-enroll-notes" rows="3" placeholder="${this.enrollmentsT("form.notesPlaceholder", {}, "Any notes about this enrollment...")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box; resize: vertical;"></textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeEnrollmentModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitNewEnrollment()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">${this.enrollmentsT("form.confirm", {}, "Confirm Enrollment")}</button>
                </div>
            </div>
        </div>
    `;
};

AdminUI._generateEnrollmentsTableHtml = function(enrollments) {
    if (enrollments.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <span style="display: inline-flex; width: 58px; height: 58px; align-items: center; justify-content: center; color: #64748b; opacity: 0.65;">${this.icon("files", "inline-svg-icon")}</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px;">${this.enrollmentsT("table.empty", {}, "No enrollment records currently match your search.")}</p>
            </div>
        `;
    }

    const rows = enrollments.map(e => {
        const status = e.status || "active";
        const rowBg = status === "dropped" ? "#fef2f2" : (status === "completed" ? "#f0f9ff" : "transparent");
        const programLabel = e.program_name || this.enrollmentsT("table.programFallback", { id: e.program_id }, `Program #${e.program_id}`);
        const classLabel = e.class_name || this.enrollmentsT("common.notSpecified", {}, "Not specified");
        const groupLabel = e.group_name || this.enrollmentsT("common.general", {}, "General");

        return `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${rowBg}; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${rowBg}'">
                <td style="padding: 15px; font-weight: bold; color: #64748b;">#${e.enrollment_id}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(e.full_name || e.student_name || "-")}</div>
                    <small style="color: #64748b;">${this.enrollmentsT("table.studentId", { id: e.student_id }, `Student ID: #${e.student_id}`)}</small>
                </td>
                <td style="padding: 15px;">
                    <div style="color: #0f172a; font-weight: bold;">${this._escape(programLabel)}</div>
                    <div style="color: #334155; font-size: 0.85em; margin-top: 3px;">${this.enrollmentsT("table.className", { value: this._escape(classLabel) }, `Class: ${this._escape(classLabel)}`)}</div>
                    <div style="color: #0369a1; font-size: 0.85em; margin-top: 3px;">${this.enrollmentsT("table.groupName", { value: this._escape(groupLabel) }, `Group: ${this._escape(groupLabel)}`)}</div>
                </td>
                <td style="padding: 15px; color: #475569; font-size: 0.9em; direction: ltr; text-align: right;">
                    ${this._escape(e.enrollment_date || "-")}
                </td>
                <td style="padding: 15px;">
                    <select onchange="AdminUI.updateEnrollmentStatus(${e.enrollment_id}, this.value)" style="padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; font-weight: bold; cursor: pointer; background: white; color: ${this.enrollmentStatusColor(status)};">
                        <option value="active" ${status === "active" ? "selected" : ""}>${this.enrollmentStatusLabel("active")}</option>
                        <option value="completed" ${status === "completed" ? "selected" : ""}>${this.enrollmentStatusLabel("completed")}</option>
                        <option value="dropped" ${status === "dropped" ? "selected" : ""}>${this.enrollmentStatusLabel("dropped")}</option>
                    </select>
                </td>
                <td style="padding: 15px; text-align: left;">
                    <button onclick="AdminUI.deleteEnrollmentItem(${e.enrollment_id})" title="${this.enrollmentsT("actions.deleteEnrollmentTitle", {}, "Cancel and delete enrollment")}" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">
                        ${this.icon("trash", "inline-svg-icon")} ${this.t("admin.actions.delete", {}, "Delete")}
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 12px 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.9em; color: #475569;">
                ${this.enrollmentsT("table.total", { count: enrollments.length }, `Displayed records: ${enrollments.length}`)}
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">${this.enrollmentsT("table.student", {}, "Student")}</th>
                            <th style="padding: 15px; color: #334155;">${this.enrollmentsT("table.programAndClass", {}, "Program and Class")}</th>
                            <th style="padding: 15px; color: #334155;">${this.enrollmentsT("table.enrollmentDate", {}, "Enrollment Date")}</th>
                            <th style="padding: 15px; color: #334155;">${this.enrollmentsT("table.status", {}, "Status")}</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">${this.enrollmentsT("table.actions", {}, "Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

AdminUI.filterEnrollments = async function() {
    const status = document.getElementById("enrollment-status-filter").value;
    AdminUI.renderLoading();
    try {
        const endpoint = status ? `/enrollments?status=${status}` : "/enrollments";
        const response = await Api.get(endpoint);
        this.renderEnrollmentsTab(response);
        document.getElementById("enrollment-status-filter").value = status;
    } catch (err) {
        this.renderError(this.enrollmentsT("messages.filterFailed", { message: err.message }, `Filter failed: ${err.message}`));
    }
};

AdminUI.updateEnrollmentStatus = async function(enrollmentId, newStatus) {
    try {
        await Api.patch(`/enrollments/${enrollmentId}/status`, { status: newStatus });
        this.showToast(this.enrollmentsT("messages.statusUpdated", {}, "Enrollment status updated successfully."));
        AdminRole.loadSection("enrollments");
    } catch (err) {
        alert(this.enrollmentsT("messages.statusUpdateFailed", { message: err.message }, `Failed to update status: ${err.message}`));
        AdminRole.loadSection("enrollments");
    }
};

AdminUI.deleteEnrollmentItem = async function(enrollmentId) {
    if (!confirm(this.enrollmentsT("messages.deleteConfirm", {}, "Are you sure you want to permanently delete this enrollment record?"))) return;
    try {
        await Api.delete(`/enrollments/${enrollmentId}`);
        AdminRole.loadSection("enrollments");
    } catch (err) {
        alert(this.enrollmentsT("messages.deleteFailed", { message: err.message }, `Delete failed: ${err.message}`));
    }
};

AdminUI.showAddEnrollmentModal = async function() {
    const modal = document.getElementById("add-enrollment-modal");
    modal.style.display = "flex";

    const studentSelect = document.getElementById("modal-enroll-student");
    const programSelect = document.getElementById("modal-enroll-program");
    const classSelect = document.getElementById("modal-enroll-class");

    studentSelect.innerHTML = `<option value="">${this.enrollmentsT("form.loading", {}, "Loading...")}</option>`;
    programSelect.innerHTML = `<option value="">${this.enrollmentsT("form.loading", {}, "Loading...")}</option>`;
    classSelect.innerHTML = `<option value="">${this.enrollmentsT("form.chooseProgramFirst", {}, "-- Choose the program first --")}</option>`;

    try {
        const [studentsRes, programsRes, classesRes] = await Promise.all([
            Api.get("/students/"),
            Api.get("/programs/"),
            Api.get("/classes/")
        ]);

        const students = studentsRes.data || studentsRes || [];
        const programs = programsRes.data || programsRes || [];
        const classes = classesRes.data || classesRes || [];
        this._enrollmentClasses = classes;

        studentSelect.innerHTML = `<option value="">${this.enrollmentsT("form.chooseStudent", {}, "-- Please choose the student --")}</option>` +
            students.map(s => `<option value="${s.student_id || s.id}">${this._escape(s.full_name || s.student_name)} (#${s.student_id || s.id})</option>`).join("");

        programSelect.innerHTML = `<option value="">${this.enrollmentsT("form.chooseProgram", {}, "-- Please choose the study program --")}</option>` +
            programs.map(p => `<option value="${p.id || p.program_id}">${this._escape(p.program_name)}</option>`).join("");
        this.updateEnrollmentClassOptions("");
    } catch (err) {
        studentSelect.innerHTML = `<option value="">${this.enrollmentsT("messages.loadDataFailed", {}, "Failed to fetch data")}</option>`;
        programSelect.innerHTML = `<option value="">${this.enrollmentsT("messages.programEndpointHint", {}, "Make sure the /programs/ endpoint exists")}</option>`;
        classSelect.innerHTML = `<option value="">${this.enrollmentsT("messages.loadClassesFailed", {}, "Failed to fetch classes")}</option>`;
        console.error(err);
    }
};

AdminUI.updateEnrollmentClassOptions = function(programId) {
    const classSelect = document.getElementById("modal-enroll-class");
    if (!classSelect) return;

    const classes = this._enrollmentClasses || [];
    const filtered = programId
        ? classes.filter(c => String(c.program_id || "") === String(programId))
        : [];

    if (!programId) {
        classSelect.innerHTML = `<option value="">${this.enrollmentsT("form.chooseProgramFirst", {}, "-- Choose the program first --")}</option>`;
        return;
    }

    if (filtered.length === 0) {
        classSelect.innerHTML = `<option value="">${this.enrollmentsT("form.noClassesForProgram", {}, "No classes are available for this program")}</option>`;
        return;
    }

    classSelect.innerHTML = `<option value="">${this.enrollmentsT("form.chooseClass", {}, "-- Please choose the class --")}</option>` +
        filtered.map(c => `<option value="${c.class_id || c.id}">${this._escape(c.class_name)} (${this._escape(c.level || this.enrollmentsT("common.general", {}, "General"))})</option>`).join("");
};

AdminUI.closeEnrollmentModal = function() {
    document.getElementById("add-enrollment-modal").style.display = "none";
    document.getElementById("modal-enroll-student").value = "";
    document.getElementById("modal-enroll-program").value = "";
    document.getElementById("modal-enroll-class").value = "";
    document.getElementById("modal-enroll-group").value = "";
    document.getElementById("modal-enroll-notes").value = "";
};

AdminUI.submitNewEnrollment = async function() {
    const studentId = document.getElementById("modal-enroll-student").value;
    const programId = document.getElementById("modal-enroll-program").value;
    const classId = document.getElementById("modal-enroll-class").value;
    const groupName = document.getElementById("modal-enroll-group").value.trim();
    const notes = document.getElementById("modal-enroll-notes").value.trim();

    if (!studentId || !programId || !classId) {
        alert(this.enrollmentsT("messages.requiredSelections", {}, "Please make sure student, program, and class are selected."));
        return;
    }

    try {
        await Api.post("/enrollments/", {
            student_id: parseInt(studentId),
            program_id: parseInt(programId),
            class_id: parseInt(classId),
            group_name: groupName || null,
            notes: notes || null,
            status: "active",
            enrollment_date: new Date().toISOString().split("T")[0]
        });

        alert(this.enrollmentsT("messages.created", {}, "Enrollment record added successfully."));
        this.closeEnrollmentModal();
        AdminRole.loadSection("enrollments");
    } catch (err) {
        const message = err.message || this.enrollmentsT("messages.duplicateHint", {}, "Make sure the student is not enrolled in the same program twice.");
        alert(this.enrollmentsT("messages.createFailed", { message }, `Enrollment failed: ${message}`));
    }
};

// frontend/js/roles/admin/tabs/students.js

AdminUI.studentsT = function(key, params = {}, fallback = "") {
    return this.t(`admin.studentsTab.${key}`, params, fallback);
};

AdminUI.renderStudentsTab = function(response) {
    const main = this.prepareMain(this.t("admin.sections.students", {}, "Student Affairs Management"));
    const payload = response || [];
    const students = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
    const total = payload.total !== undefined ? payload.total : students.length;

    main.innerHTML = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: var(--admin-surface); padding: 15px; border-radius: 8px; box-shadow: var(--admin-shadow-soft); flex-wrap: wrap; gap: 15px;">
            <div class="admin-toolbar-search" style="display: flex; gap: 10px; flex: 1; min-width: min(300px, 100%); flex-wrap: wrap;">
                <input type="text" id="student-search-input" placeholder="${this.studentsT("search.placeholder", {}, "Search by name or ID...")}"
                       style="padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; flex: 1 1 220px; outline: none; font-size: 1rem;"
                       onkeypress="if(event.key === 'Enter') AdminUI.searchStudents()">
                <button onclick="AdminUI.searchStudents()" style="background: #2563eb; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">
                    ${this.icon("search", "inline-svg-icon")} ${this.t("admin.actions.search", {}, "Search")}
                </button>
                <button onclick="AdminRole.loadSection('students')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center;" title="${this.studentsT("actions.reloadTitle", {}, "Reload list")}">
                    ${this.icon("refresh", "inline-svg-icon")}
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showAddStudentModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;">
                    ${this.icon("graduation", "inline-svg-icon")} ${this.studentsT("actions.add", {}, "Register New Student")}
                </button>
            </div>
        </div>

        <div id="students-table-container">
            ${this._generateStudentsTableHtml(students, total)}
        </div>

        <div id="add-student-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(2px); padding: 16px;">
            <div style="background: var(--admin-surface); width: min(620px, 100%); padding: 25px; border-radius: 12px; box-shadow: var(--admin-shadow); max-height: 90vh; overflow-y: auto;">
                <h3 style="margin-top: 0; color: var(--text-main); border-bottom: 2px solid var(--admin-border); padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("graduation", "inline-svg-icon")} ${this.studentsT("form.title", {}, "Register New Student in the System")}
                </h3>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 15px; margin-top: 20px;">
                    <div style="grid-column: 1 / -1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.studentsT("form.userLabel", {}, "Linked User Account *")}</label>
                        <select id="modal-std-user" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; background: var(--admin-surface-soft); outline: none;">
                            <option value="">${this.studentsT("form.loadingAccounts", {}, "Loading accounts...")}</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.studentsT("form.parentLabel", {}, "Parent")}</label>
                        <select id="modal-std-parent" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; outline: none;">
                            <option value="">${this.studentsT("form.noParent", {}, "-- No parent --")}</option>
                        </select>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.studentsT("form.dobLabel", {}, "Date of Birth")}</label>
                        <input type="date" id="modal-std-dob" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; outline: none; box-sizing: border-box;">
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.studentsT("form.bloodLabel", {}, "Blood Group")}</label>
                        <select id="modal-std-blood" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; outline: none;">
                            <option value="">${this.studentsT("form.notSpecified", {}, "-- Not specified --")}</option>
                            <option value="A+">A+</option><option value="A-">A-</option>
                            <option value="B+">B+</option><option value="B-">B-</option>
                            <option value="O+">O+</option><option value="O-">O-</option>
                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                        </select>
                    </div>

                    <div style="grid-column: 1 / -1;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.studentsT("form.medicalLabel", {}, "Medical notes (optional)")}</label>
                        <textarea id="modal-std-medical" rows="2" placeholder="${this.studentsT("form.medicalPlaceholder", {}, "Allergies, medications, etc...")}" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; outline: none; box-sizing: border-box; resize: vertical;"></textarea>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; border-top: 1px solid var(--admin-border); padding-top: 15px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeStudentModal()" style="padding: 10px 15px; border: none; background: #f1f5f9; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitNewStudent()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px;">${this.icon("save", "inline-svg-icon")} ${this.studentsT("form.save", {}, "Save Data")}</button>
                </div>
            </div>
        </div>
    `;
};

AdminUI._generateStudentsTableHtml = function(students, total) {
    if (!students.length) {
        return `
            <div style="text-align: center; padding: 50px; background: var(--admin-surface); border-radius: 8px; box-shadow: var(--admin-shadow-soft);">
                <span style="display: inline-flex; opacity: 0.55;">${this.icon("graduation", "inline-svg-icon")}</span>
                <p style="color: var(--text-muted); font-size: 1.1em; margin-top: 15px;">${this.studentsT("table.empty", {}, "No matching search results.")}</p>
            </div>`;
    }

    const rows = students.map(student => {
        const id = student.student_id || student.id;
        const isActive = student.status === "active";
        const statusLabel = isActive
            ? this.studentsT("status.active", {}, "Active")
            : this.studentsT("status.inactive", {}, "Disabled");
        const statusColor = isActive ? "#10b981" : "#ef4444";
        const statusBg = isActive ? "#dcfce7" : "#fee2e2";
        const currentStatus = JSON.stringify(student.status || "inactive");

        return `
            <tr style="border-bottom: 1px solid var(--admin-border); transition: 0.2s;">
                <td data-label="${this.studentsT("table.id", {}, "ID")}" style="padding: 15px; font-weight: bold; color: var(--text-muted);">#${id}</td>
                <td data-label="${this.studentsT("table.student", {}, "Student")}" style="padding: 15px;">
                    <div style="font-weight: bold; color: var(--text-main);">${this._escape(student.full_name || student.student_name || "-")}</div>
                    <small style="color: var(--text-muted);">${this.studentsT("table.account", { id: student.user_id || "-" }, `Account: #${student.user_id || "-"}`)}</small>
                </td>
                <td data-label="${this.studentsT("table.class", {}, "Class")}" style="padding: 15px;">
                    <span style="background: #f1f5f9; color: #334155; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;">
                        ${this._escape(student.class_name || this.studentsT("table.classFallback", {}, "Not registered in a class"))}
                    </span>
                    ${student.program_names ? `<div style="margin-top: 5px; color: #2563eb; font-size: 0.85em; font-weight: bold;">${this._escape(student.program_names)}</div>` : ""}
                </td>
                <td data-label="${this.studentsT("table.dateOfBirth", {}, "Date of Birth")}" style="padding: 15px; direction: ltr; text-align: right; color: var(--text-main);">${this._escape(student.date_of_birth || "-")}</td>
                <td data-label="${this.studentsT("table.status", {}, "Status")}" style="padding: 15px;">
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold;">
                        ${statusLabel}
                    </span>
                </td>
                <td class="admin-actions-cell" data-label="${this.studentsT("table.actions", {}, "Actions")}" style="padding: 15px; text-align: left;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap;">
                        <button onclick="AdminUI.viewStudentProfile(${id})" title="${this.studentsT("actions.viewProfile", {}, "View Detailed Profile")}" style="background: #eff6ff; color: #1d4ed8; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center;">${this.icon("eye", "inline-svg-icon")}</button>
                        <button onclick='AdminUI.toggleStudentStatus(${id}, ${currentStatus})' title="${this.studentsT("actions.changeStatus", {}, "Change Status")}" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center;">${this.icon("settings", "inline-svg-icon")}</button>
                        <button onclick="AdminRole.deleteItem('/students', ${id}, 'students')" title="${this.t("admin.actions.delete", {}, "Delete")}" style="background: #fef2f2; color: #b91c1c; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center;">${this.icon("trash", "inline-svg-icon")}</button>
                    </div>
                </td>
            </tr>`;
    }).join("");

    return `
        <div style="background: var(--admin-surface); border-radius: 8px; box-shadow: var(--admin-shadow-soft); overflow: hidden;">
            <div style="padding: 12px 15px; background: var(--admin-surface-soft); border-bottom: 2px solid var(--admin-border); font-size: 0.9em; color: var(--text-muted);">
                ${this.studentsT("table.total", { count: total }, `Total Students: ${total}`)}
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: var(--admin-surface-soft); border-bottom: 2px solid var(--admin-border);">
                        <tr>
                            <th style="padding: 15px; color: var(--text-main);">${this.studentsT("table.id", {}, "ID")}</th>
                            <th style="padding: 15px; color: var(--text-main);">${this.studentsT("table.student", {}, "Student")}</th>
                            <th style="padding: 15px; color: var(--text-main);">${this.studentsT("table.class", {}, "Class")}</th>
                            <th style="padding: 15px; color: var(--text-main);">${this.studentsT("table.dateOfBirth", {}, "Date of Birth")}</th>
                            <th style="padding: 15px; color: var(--text-main);">${this.studentsT("table.status", {}, "Status")}</th>
                            <th style="padding: 15px; color: var(--text-main); text-align: left;">${this.studentsT("table.actions", {}, "Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
};

AdminUI.searchStudents = async function() {
    const keyword = document.getElementById("student-search-input").value.trim();
    if (keyword.length > 0 && keyword.length < 2) {
        alert(this.studentsT("messages.minSearch", {}, "Please enter at least two characters to search."));
        return;
    }

    this.renderLoading();
    try {
        const url = keyword.length === 0 ? "/students/" : `/students/search?keyword=${encodeURIComponent(keyword)}`;
        const response = await Api.get(url);
        this.renderStudentsTab(response);
        if (keyword) document.getElementById("student-search-input").value = keyword;
    } catch (err) {
        this.renderError(this.studentsT("messages.searchFailed", { message: err.message }, `Search failed: ${err.message}`));
    }
};

AdminUI.toggleStudentStatus = async function(studentId, currentStatus) {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const statusLabel = newStatus === "active"
        ? this.studentsT("status.active", {}, "Active")
        : this.studentsT("status.inactive", {}, "Disabled");

    if (!confirm(this.studentsT("messages.statusConfirm", { status: statusLabel }, `Are you sure you want to change this student's status to ${statusLabel}?`))) return;

    try {
        await Api.patch(`/students/${studentId}/status`, { status: newStatus });
        AdminRole.loadSection("students");
    } catch (err) {
        alert(this.studentsT("messages.statusFailed", { message: err.message }, `Failed to change status: ${err.message}`));
    }
};

AdminUI.showAddStudentModal = async function() {
    const modal = document.getElementById("add-student-modal");
    modal.style.display = "flex";

    const userSelect = document.getElementById("modal-std-user");
    const parentSelect = document.getElementById("modal-std-parent");
    userSelect.innerHTML = `<option value="">${this.studentsT("form.loadingAccounts", {}, "Loading accounts...")}</option>`;

    try {
        const [usersRes, parentsRes] = await Promise.all([
            Api.get("/users/"),
            Api.get("/parents/")
        ]);

        const users = usersRes.data || usersRes || [];
        const parents = parentsRes.data || parentsRes || [];

        userSelect.innerHTML = `<option value="">${this.studentsT("form.chooseUser", {}, "-- Choose user account --")}</option>` +
            users.map(user => `<option value="${user.id}">${this._escape(user.full_name || "-")} (@${this._escape(user.username || "-")})</option>`).join("");

        parentSelect.innerHTML = `<option value="">${this.studentsT("form.noParent", {}, "-- No parent --")}</option>` +
            parents.map(parent => `<option value="${parent.parent_id || parent.id}">${this._escape(parent.full_name || "-")}</option>`).join("");
    } catch (err) {
        userSelect.innerHTML = `<option value="">${this.studentsT("form.loadFailed", {}, "Failed to fetch data")}</option>`;
    }
};

AdminUI.closeStudentModal = function() {
    const modal = document.getElementById("add-student-modal");
    if (modal) modal.style.display = "none";
};

AdminUI.submitNewStudent = async function() {
    const userId = document.getElementById("modal-std-user").value;
    if (!userId) {
        alert(this.studentsT("messages.chooseUserFirst", {}, "Please choose a user account first."));
        return;
    }

    const parentId = document.getElementById("modal-std-parent").value;
    const payload = {
        user_id: parseInt(userId, 10),
        class_id: null,
        parent_id: parentId ? parseInt(parentId, 10) : null,
        date_of_birth: document.getElementById("modal-std-dob").value || null,
        blood_group: document.getElementById("modal-std-blood").value || null,
        medical_info: document.getElementById("modal-std-medical").value.trim() || null,
        status: "active"
    };

    try {
        await Api.post("/students/", payload);
        alert(this.studentsT("messages.created", {}, "Student registered successfully."));
        this.closeStudentModal();
        AdminRole.loadSection("students");
    } catch (err) {
        alert(this.studentsT("messages.createFailed", { message: err.message }, `Registration failed: ${err.message}`));
    }
};

AdminUI.viewStudentProfile = async function(studentId) {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "profile-loading-overlay";
    loadingDiv.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(2px); padding: 16px;";
    loadingDiv.innerHTML = `<div class="student-profile-loading-card" style="background: var(--admin-surface); color: var(--text-main); padding: 25px; border-radius: 8px; text-align: center; box-shadow: var(--admin-shadow);">${this.studentsT("messages.loadingProfile", {}, "Collecting student profile...")}</div>`;
    document.body.appendChild(loadingDiv);

    try {
        const [studentResponse, gradesResponse, attendanceResponse, feesResponse, paymentsResponse] = await Promise.all([
            Api.get(`/students/${studentId}`),
            Api.get(`/grades/student/${studentId}`).catch(() => []),
            Api.get(`/attendance/student/${studentId}/statistics`).catch(() => ({})),
            Api.get(`/student-fees/student/${studentId}`).catch(() => []),
            Api.get(`/payments/student/${studentId}`).catch(() => [])
        ]);

        document.getElementById("profile-loading-overlay").remove();

        const student = studentResponse.data || studentResponse || {};
        const unwrapArray = value => Array.isArray(value && value.data) ? value.data : (Array.isArray(value) ? value : []);
        const gradesData = unwrapArray(gradesResponse);
        const feesData = unwrapArray(feesResponse);
        const paymentsData = unwrapArray(paymentsResponse);
        void attendanceResponse;

        let totalDue = 0;
        let totalPaid = 0;
        feesData.forEach(fee => {
            totalDue += Number(fee.amount_due || 0) - Number(fee.applied_discount || 0);
        });
        paymentsData.forEach(payment => {
            totalPaid += Number(payment.amount_paid || 0);
        });
        const balance = totalDue - totalPaid;

        const gradeRows = gradesData.map(grade => `
            <tr>
                <td style="padding: 8px;">${this._escape(grade.title || "-")}</td>
                <td style="padding: 8px;">${this._escape(grade.subject_name || "-")}</td>
                <td style="padding: 8px;"><b>${this._escape(grade.grade_value ?? "-")}</b> / ${this._escape(grade.max_grade ?? "-")}</td>
            </tr>
        `).join("") || `<tr><td colspan="3" style="padding: 16px; text-align:center;">${this.studentsT("profile.academic.noGrades", {}, "No grade record")}</td></tr>`;

        const profileHtml = `
            <div id="student-profile-modal" class="student-profile-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1500; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(3px); padding: 16px;">
                <div class="student-profile-dialog" style="background: var(--admin-surface-soft); width: min(850px, 100%); border-radius: 12px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; box-shadow: var(--admin-shadow);">

                    <div class="student-profile-header" style="background: var(--admin-surface); padding: 20px 25px; border-bottom: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                        <div style="display: flex; align-items: center; gap: 15px; min-width: 0;">
                            <div class="student-profile-avatar" style="width: 50px; height: 50px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; justify-content: center; align-items: center; flex: 0 0 auto;">${this.icon("graduation", "inline-svg-icon")}</div>
                            <div style="min-width: 0;">
                                <h2 style="margin: 0; color: var(--text-main); overflow-wrap: anywhere;">${this._escape(student.full_name || student.student_name || "-")}</h2>
                                <small style="color: var(--text-muted);">${this.studentsT("profile.studentId", { id: studentId }, `Student ID: #${studentId}`)}</small>
                            </div>
                        </div>
                        <button onclick="document.getElementById('student-profile-modal').remove()" style="background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #334155;" aria-label="${this.t("admin.actions.close", {}, "Close")}">&times;</button>
                    </div>

                    <div class="student-profile-tabs" style="display: flex; background: var(--admin-surface); border-bottom: 2px solid var(--admin-border); padding: 0 20px; overflow-x: auto;">
                        <button onclick="AdminUI.switchProfileTab('personal')" class="prof-tab-btn active" data-tab="personal" style="padding: 15px; border: none; background: transparent; font-weight: bold; color: #2563eb; border-bottom: 3px solid #2563eb; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;">${this.icon("users", "inline-svg-icon")} ${this.studentsT("profile.tabs.personal", {}, "Personal")}</button>
                        <button onclick="AdminUI.switchProfileTab('academic')" class="prof-tab-btn" data-tab="academic" style="padding: 15px; border: none; background: transparent; font-weight: bold; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;">${this.icon("bookOpen", "inline-svg-icon")} ${this.studentsT("profile.tabs.academic", {}, "Academic")}</button>
                        <button onclick="AdminUI.switchProfileTab('finance')" class="prof-tab-btn" data-tab="finance" style="padding: 15px; border: none; background: transparent; font-weight: bold; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;">${this.icon("card", "inline-svg-icon")} ${this.studentsT("profile.tabs.finance", {}, "Finance")}</button>
                    </div>

                    <div class="student-profile-body" style="padding: 25px; overflow-y: auto; flex: 1; color: var(--text-main);">
                        <div id="prof-tab-personal" class="prof-tab-content">
                            <p><strong>${this.studentsT("profile.personal.dateOfBirth", {}, "Date of Birth:")}</strong> ${this._escape(student.date_of_birth || "-")}</p>
                            <p><strong>${this.studentsT("profile.personal.bloodGroup", {}, "Blood Group:")}</strong> <span style="color: #dc2626;">${this._escape(student.blood_group || "-")}</span></p>
                            <p><strong>${this.studentsT("profile.personal.medicalNotes", {}, "Medical Notes:")}</strong> ${this._escape(student.medical_info || this.studentsT("profile.personal.none", {}, "None"))}</p>
                        </div>

                        <div id="prof-tab-academic" class="prof-tab-content" style="display: none;">
                            <h4 style="margin-bottom: 10px; color: var(--text-main);">${this.studentsT("profile.academic.gradesTitle", {}, "Grade Record")}</h4>
                            <div class="admin-mobile-table" style="overflow-x: auto;">
                                <table style="width: 100%; text-align: right; border-collapse: collapse;">
                                    <thead style="background: var(--admin-surface);">
                                        <tr>
                                            <th style="padding: 10px;">${this.studentsT("profile.academic.assessment", {}, "Assessment")}</th>
                                            <th style="padding: 10px;">${this.studentsT("profile.academic.subject", {}, "Subject")}</th>
                                            <th style="padding: 10px;">${this.studentsT("profile.academic.grade", {}, "Grade")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>${gradeRows}</tbody>
                                </table>
                            </div>
                        </div>

                        <div id="prof-tab-finance" class="prof-tab-content" style="display: none;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px;">
                                <div class="student-profile-money-card is-paid" style="background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center;">
                                    <small>${this.studentsT("profile.finance.paidTotal", {}, "Total Paid")}</small><br><b>${this._formatCurrency(totalPaid)}</b>
                                </div>
                                <div class="student-profile-money-card is-due" style="background: #fef2f2; padding: 15px; border-radius: 8px; text-align: center;">
                                    <small>${this.studentsT("profile.finance.remaining", {}, "Remaining Amount")}</small><br><b style="color: #dc2626;">${this._formatCurrency(balance)}</b>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML("beforeend", profileHtml);
    } catch (err) {
        document.getElementById("profile-loading-overlay")?.remove();
        alert(this.studentsT("messages.profileFailed", { message: err.message }, `Failed to fetch student profile: ${err.message}`));
    }
};

AdminUI.switchProfileTab = function(tabName) {
    document.querySelectorAll(".prof-tab-content").forEach(content => {
        content.style.display = "none";
    });

    const activeColor = document.body.dataset.theme === "dark" ? "var(--primary-color)" : "#2563eb";
    const mutedColor = document.body.dataset.theme === "dark" ? "var(--text-muted)" : "#64748b";
    document.querySelectorAll(".prof-tab-btn").forEach(button => {
        button.classList.remove("active");
        button.style.color = mutedColor;
        button.style.borderBottomColor = "transparent";
    });

    const content = document.getElementById(`prof-tab-${tabName}`);
    if (content) content.style.display = "block";

    const activeBtn = document.querySelector(`.prof-tab-btn[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add("active");
        activeBtn.style.color = activeColor;
        activeBtn.style.borderBottomColor = activeColor;
    }
};

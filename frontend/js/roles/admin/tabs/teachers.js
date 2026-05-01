// frontend/js/roles/admin/tabs/teachers.js

AdminUI.teachersT = function(key, params = {}, fallback = "") {
    return this.t(`admin.teachersTab.${key}`, params, fallback);
};

AdminUI.teacherPayloadArg = function(teacher) {
    return encodeURIComponent(JSON.stringify(teacher || {}));
};

AdminUI.teacherFormatTime = function(timeVal) {
    if (timeVal === null || timeVal === undefined || timeVal === "") return "00:00";
    const value = String(timeVal);
    if (value.includes(":")) return value.slice(0, 5);
    const totalSeconds = parseFloat(value);
    if (!isNaN(totalSeconds)) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
    return "00:00";
};

AdminUI.renderTeachersTab = function(teachersData) {
    const main = this.prepareMain(this.t("admin.sections.teachers", {}, "Teaching Staff Management"));
    const source = teachersData && teachersData.data !== undefined ? teachersData.data : teachersData;
    const teachers = Array.isArray(source) ? source : [];

    main.innerHTML = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: var(--admin-surface); padding: 15px; border-radius: 8px; box-shadow: var(--admin-shadow-soft); gap: 15px; flex-wrap: wrap;">
            <div class="admin-toolbar-search" style="display: flex; gap: 10px; flex: 1; min-width: min(300px, 100%); flex-wrap: wrap;">
                <input type="text" id="teacher-search-input" placeholder="${this.teachersT("search.placeholder", {}, "Search by teacher name or specialty...")}"
                       style="padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; flex: 1 1 240px; outline: none;"
                       onkeypress="if(event.key === 'Enter') AdminUI.searchTeachers()">
                <button onclick="AdminUI.searchTeachers()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">
                    ${this.icon("search", "inline-svg-icon")} ${this.t("admin.actions.search", {}, "Search")}
                </button>
                <button onclick="AdminRole.loadSection('teachers')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center;" title="${this.teachersT("actions.reloadTitle", {}, "Reload list")}">
                    ${this.icon("refresh", "inline-svg-icon")}
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showTeacherModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;">
                    ${this.icon("teacher", "inline-svg-icon")} ${this.teachersT("actions.add", {}, "Add New Teacher")}
                </button>
            </div>
        </div>

        <div id="teachers-table-container">
            ${this._generateTeachersTableHtml(teachers)}
        </div>

        <div id="teacher-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(2px); padding: 16px;">
            <div style="background: var(--admin-surface); width: min(520px, 100%); padding: 25px; border-radius: 12px; box-shadow: var(--admin-shadow); max-height: 90vh; overflow-y: auto;">
                <h3 id="teacher-modal-title" style="margin-top: 0; color: var(--text-main); border-bottom: 2px solid var(--admin-border); padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("teacher", "inline-svg-icon")} ${this.teachersT("form.addTitle", {}, "Add Teaching Staff")}
                </h3>

                <input type="hidden" id="modal-teacher-id">

                <div style="margin-top: 20px;" id="modal-teacher-user-container">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-main);">${this.teachersT("form.userLabel", {}, "User Account *")}</label>
                    <select id="modal-teacher-user" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; outline: none; background: var(--admin-surface-soft);">
                        <option value="">${this.teachersT("form.loadingAccounts", {}, "Loading accounts...")}</option>
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-main);">${this.teachersT("form.specialty", {}, "Academic Specialty")}</label>
                    <input type="text" id="modal-teacher-specialty" placeholder="${this.teachersT("form.specialtyPlaceholder", {}, "Example: Mathematics, Physics, Arabic...")}" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; outline: none; box-sizing: border-box;">
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-main);">${this.teachersT("form.hireDate", {}, "Hire Date")}</label>
                    <input type="date" id="modal-teacher-hire-date" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; border-top: 1px solid var(--admin-border); padding-top: 15px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeTeacherModal()" style="padding: 10px 15px; border: none; background: #f1f5f9; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitTeacher()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px;">${this.icon("save", "inline-svg-icon")} ${this.teachersT("form.save", {}, "Save Data")}</button>
                </div>
            </div>
        </div>
    `;
};

AdminUI._generateTeachersTableHtml = function(teachers) {
    if (!teachers.length) {
        return `
            <div style="text-align: center; padding: 40px; background: var(--admin-surface); border-radius: 8px; box-shadow: var(--admin-shadow-soft);">
                <span style="display: inline-flex; opacity: 0.55;">${this.icon("teacher", "inline-svg-icon")}</span>
                <p style="color: var(--text-muted); font-size: 1.1em;">${this.teachersT("table.empty", {}, "No teachers are registered or matching your search.")}</p>
            </div>
        `;
    }

    const rows = teachers.map(teacher => {
        const id = teacher.teacher_id || teacher.id;
        const payload = this.teacherPayloadArg(teacher);
        return `
            <tr style="border-bottom: 1px solid var(--admin-border); transition: background 0.2s;">
                <td data-label="ID" style="padding: 15px; font-weight: bold; color: var(--text-muted);">#${id}</td>
                <td data-label="${this.teachersT("table.teacher", {}, "Teacher")}" style="padding: 15px;">
                    <div style="font-weight: bold; color: var(--text-main); font-size: 1.05em;">${this._escape(teacher.full_name || teacher.teacher_name)}</div>
                    <small style="color: var(--text-muted);">${this.teachersT("table.userAccount", { id: teacher.user_id || "-" }, `User account: #${teacher.user_id || "-"}`)}</small>
                </td>
                <td data-label="${this.teachersT("table.specialty", {}, "Specialty")}" style="padding: 15px;">
                    <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-size: 0.9em; font-weight: bold;">
                        ${this._escape(teacher.specialty || this.teachersT("table.general", {}, "General"))}
                    </span>
                </td>
                <td data-label="${this.teachersT("table.hireDate", {}, "Hire Date")}" style="padding: 15px; color: var(--text-main); direction: ltr; text-align: right;">
                    ${this._escape(teacher.hire_date || "-")}
                </td>
                <td class="admin-actions-cell" data-label="${this.teachersT("table.actions", {}, "Actions")}" style="padding: 15px; text-align: left;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap;">
                        <button onclick="AdminUI.viewTeacherProfile(${id})" title="${this.teachersT("actions.viewProfile", {}, "Profile and schedule")}" style="background: #eff6ff; color: #1d4ed8; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">${this.icon("eye", "inline-svg-icon")} ${this.teachersT("actions.profile", {}, "Profile")}</button>
                        <button onclick="AdminUI.showTeacherModal(JSON.parse(decodeURIComponent('${payload}')))" title="${this.teachersT("actions.editTitle", {}, "Edit specialty and date")}" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">${this.icon("edit", "inline-svg-icon")} ${this.t("admin.actions.edit", {}, "Edit")}</button>
                        <button onclick="AdminRole.deleteItem('/teachers', ${id}, 'teachers')" title="${this.t("admin.actions.delete", {}, "Delete")}" style="background: #fef2f2; color: #b91c1c; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">${this.icon("trash", "inline-svg-icon")} ${this.t("admin.actions.delete", {}, "Delete")}</button>
                    </div>
                </td>
            </tr>`;
    }).join("");

    return `
        <div style="background: var(--admin-surface); border-radius: 8px; box-shadow: var(--admin-shadow-soft); overflow: hidden;">
            <div style="padding: 12px 15px; background: var(--admin-surface-soft); border-bottom: 2px solid var(--admin-border); font-size: 0.9em; color: var(--text-muted);">
                ${this.teachersT("table.total", { count: teachers.length }, `Total Teachers: ${teachers.length}`)}
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: var(--admin-surface-soft); border-bottom: 2px solid var(--admin-border);">
                        <tr>
                            <th style="padding: 15px; color: var(--text-main);">ID</th>
                            <th style="padding: 15px; color: var(--text-main);">${this.teachersT("table.teacher", {}, "Teacher")}</th>
                            <th style="padding: 15px; color: var(--text-main);">${this.teachersT("table.specialty", {}, "Specialty")}</th>
                            <th style="padding: 15px; color: var(--text-main);">${this.teachersT("table.hireDate", {}, "Hire Date")}</th>
                            <th style="padding: 15px; color: var(--text-main); text-align: left;">${this.teachersT("table.actions", {}, "Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

AdminUI.searchTeachers = async function() {
    const keyword = document.getElementById("teacher-search-input").value.trim();
    if (keyword.length > 0 && keyword.length < 2) {
        alert(this.teachersT("messages.minSearch", {}, "Please enter at least two characters to search."));
        return;
    }

    if (keyword.length === 0) return AdminRole.loadSection("teachers");

    this.renderLoading();
    try {
        const response = await Api.get(`/teachers/search?keyword=${encodeURIComponent(keyword)}`);
        this.renderTeachersTab(response);
        document.getElementById("teacher-search-input").value = keyword;
    } catch (err) {
        this.renderError(this.teachersT("messages.searchFailed", { message: err.message }, `Search failed: ${err.message}`));
    }
};

AdminUI.showTeacherModal = async function(teacherData = null) {
    const modal = document.getElementById("teacher-modal");
    const title = document.getElementById("teacher-modal-title");
    const userContainer = document.getElementById("modal-teacher-user-container");
    const userSelect = document.getElementById("modal-teacher-user");

    document.getElementById("modal-teacher-id").value = "";
    document.getElementById("modal-teacher-specialty").value = "";
    document.getElementById("modal-teacher-hire-date").value = new Date().toISOString().split("T")[0];

    if (teacherData) {
        title.innerHTML = `${this.icon("edit", "inline-svg-icon")} ${this.teachersT("form.editTitle", {}, "Edit Teacher Data")}`;
        userContainer.style.display = "none";
        document.getElementById("modal-teacher-id").value = teacherData.teacher_id || teacherData.id;
        document.getElementById("modal-teacher-specialty").value = teacherData.specialty || "";
        if (teacherData.hire_date) document.getElementById("modal-teacher-hire-date").value = teacherData.hire_date;
    } else {
        title.innerHTML = `${this.icon("teacher", "inline-svg-icon")} ${this.teachersT("form.addNewTitle", {}, "Add New Teacher")}`;
        userContainer.style.display = "block";
        userSelect.innerHTML = `<option value="">${this.teachersT("form.loadingAccounts", {}, "Loading accounts...")}</option>`;

        try {
            const usersRes = await Api.get("/users/");
            const users = usersRes.data || usersRes || [];
            userSelect.innerHTML = `<option value="">${this.teachersT("form.chooseUser", {}, "-- Choose user account --")}</option>` +
                users.map(user => `<option value="${user.id}">${this._escape(user.full_name || "-")} (@${this._escape(user.username || "-")})</option>`).join("");
        } catch (err) {
            userSelect.innerHTML = `<option value="">${this.teachersT("form.loadAccountsFailed", {}, "Failed to load accounts")}</option>`;
        }
    }

    modal.style.display = "flex";
};

AdminUI.closeTeacherModal = function() {
    document.getElementById("teacher-modal").style.display = "none";
};

AdminUI.submitTeacher = async function() {
    const id = document.getElementById("modal-teacher-id").value;
    const specialty = document.getElementById("modal-teacher-specialty").value.trim();
    const hireDate = document.getElementById("modal-teacher-hire-date").value;

    try {
        if (id) {
            await Api.put(`/teachers/${id}`, { specialty: specialty || null, hire_date: hireDate || null });
            alert(this.teachersT("messages.updated", {}, "Teacher data updated successfully."));
        } else {
            const userId = document.getElementById("modal-teacher-user").value;
            if (!userId) {
                alert(this.teachersT("messages.chooseUser", {}, "Please choose a user account."));
                return;
            }
            await Api.post("/teachers/", { user_id: parseInt(userId, 10), specialty: specialty || null, hire_date: hireDate || null });
            alert(this.teachersT("messages.created", {}, "Teacher created successfully."));
        }

        this.closeTeacherModal();
        AdminRole.loadSection("teachers");
    } catch (err) {
        const message = err.message || this.teachersT("messages.checkData", {}, "Check the data or duplicate account.");
        alert(this.teachersT("messages.saveFailed", { message }, `Save failed: ${message}`));
    }
};

AdminUI.viewTeacherProfile = async function(teacherId) {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "teacher-profile-loading";
    loadingDiv.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(2px); padding: 16px;";
    loadingDiv.innerHTML = `<div style="background: var(--admin-surface); color: var(--text-main); padding: 25px; border-radius: 8px; text-align: center; box-shadow: var(--admin-shadow);">${this.teachersT("messages.loadingProfile", {}, "Loading teacher profile and schedule...")}</div>`;
    document.body.appendChild(loadingDiv);

    try {
        const [teacherResponse, assignmentsResponse, scheduleResponse] = await Promise.all([
            Api.get(`/teachers/${teacherId}`),
            Api.get(`/assignments/teacher/${teacherId}`).catch(() => []),
            Api.get(`/schedules/teacher/${teacherId}`).catch(() => [])
        ]);

        document.getElementById("teacher-profile-loading").remove();

        const teacher = teacherResponse.data || teacherResponse || {};
        const assignments = Array.isArray(assignmentsResponse && assignmentsResponse.data) ? assignmentsResponse.data : (assignmentsResponse || []);
        const schedule = Array.isArray(scheduleResponse && scheduleResponse.data) ? scheduleResponse.data : (scheduleResponse || []);

        const assignmentsHtml = assignments.length ? assignments.map(assignment => `
            <div style="background: var(--admin-surface); border: 1px solid var(--admin-border); padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
                <div>
                    <div style="font-weight: bold; color: var(--text-main);">${this._escape(assignment.subject_name || "-")}</div>
                    <div style="color: var(--text-muted); font-size: 0.9em;">${this.teachersT("profile.classLabel", {}, "Class:")} ${this._escape(assignment.class_name || "-")}</div>
                </div>
                <span style="background: var(--admin-surface-soft); padding: 4px 10px; border-radius: 12px; font-size: 0.85em;">${this.teachersT("profile.levelLabel", {}, "Level:")} ${this._escape(assignment.level || this.teachersT("table.general", {}, "General"))}</span>
            </div>
        `).join("") : `<div style="text-align: center; color: var(--text-muted); padding: 20px;">${this.teachersT("profile.noAssignments", {}, "No assignments are registered.")}</div>`;

        const dayKeys = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const scheduleByDay = {};
        dayKeys.forEach(day => {
            scheduleByDay[day] = [];
        });

        schedule.forEach(item => {
            if (scheduleByDay[item.day_of_week]) scheduleByDay[item.day_of_week].push(item);
        });

        const scheduleHtml = dayKeys.map(day => {
            const sessions = scheduleByDay[day].sort((a, b) => this.teacherFormatTime(a.start_time).localeCompare(this.teacherFormatTime(b.start_time)));
            if (!sessions.length && (day === "Friday" || day === "Saturday")) return "";
            if (!sessions.length) return "";

            return `
                <div style="margin-bottom: 20px;">
                    <h5 style="background: var(--admin-surface); padding: 8px 12px; border-radius: 6px; margin: 0 0 10px 0; color: var(--text-main);">${this.teachersT(`days.${day}`, {}, day)}</h5>
                    ${sessions.map(session => `
                        <div style="display: flex; justify-content: space-between; background: var(--admin-surface); border: 1px solid var(--admin-border); padding: 10px; border-radius: 6px; margin-bottom: 8px; gap: 12px; flex-wrap: wrap;">
                            <div>
                                <strong style="color: var(--text-main);">${this._escape(session.subject_name || "-")}</strong>
                                <span style="color: var(--text-muted); margin-inline-start: 10px; font-size: 0.9em;">${this.icon("building", "inline-svg-icon")} ${this.teachersT("profile.classLabel", {}, "Class:")} ${this._escape(session.class_name || "-")}</span>
                            </div>
                            <div style="color: #ef4444; font-weight: bold; direction: ltr;">
                                ${this.teacherFormatTime(session.start_time)} - ${this.teacherFormatTime(session.end_time)}
                            </div>
                        </div>
                    `).join("")}
                </div>
            `;
        }).join("") || `<div style="text-align: center; color: var(--text-muted); padding: 20px;">${this.teachersT("profile.emptySchedule", {}, "The schedule is empty.")}</div>`;

        const profileModalHtml = `
            <div id="teacher-profile-modal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1500; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(3px); padding: 16px;">
                <div style="background: var(--admin-surface-soft); width: min(780px, 100%); border-radius: 12px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; box-shadow: var(--admin-shadow);">

                    <div style="background: var(--admin-surface); padding: 20px 25px; border-bottom: 1px solid var(--admin-border); display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                        <div style="display: flex; align-items: center; gap: 15px; min-width: 0;">
                            <div style="width: 50px; height: 50px; background: #f3e8ff; color: #7e22ce; border-radius: 50%; display: flex; justify-content: center; align-items: center; flex: 0 0 auto;">${this.icon("teacher", "inline-svg-icon")}</div>
                            <div style="min-width: 0;">
                                <h2 style="margin: 0; color: var(--text-main); overflow-wrap: anywhere;">${this._escape(teacher.full_name || teacher.teacher_name || "-")}</h2>
                                <small style="color: var(--text-muted);">${this.teachersT("profile.specialtyLabel", {}, "Specialty:")} ${this._escape(teacher.specialty || this.teachersT("table.general", {}, "General"))} | ${this.teachersT("profile.hireLabel", {}, "Hired:")} ${this._escape(teacher.hire_date || "-")}</small>
                            </div>
                        </div>
                        <button onclick="document.getElementById('teacher-profile-modal').remove()" style="background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #334155;" aria-label="${this.t("admin.actions.close", {}, "Close")}">&times;</button>
                    </div>

                    <div style="display: flex; background: var(--admin-surface); border-bottom: 2px solid var(--admin-border); padding: 0 20px; overflow-x: auto;">
                        <button onclick="AdminUI.switchTeacherTab('assignments')" class="tch-tab-btn active" data-tab="assignments" style="padding: 15px; border: none; background: transparent; font-weight: bold; color: #2563eb; border-bottom: 3px solid #2563eb; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;">${this.icon("bookOpen", "inline-svg-icon")} ${this.teachersT("profile.tabs.assignments", {}, "Classes and Assignments")}</button>
                        <button onclick="AdminUI.switchTeacherTab('schedule')" class="tch-tab-btn" data-tab="schedule" style="padding: 15px; border: none; background: transparent; font-weight: bold; color: #64748b; border-bottom: 3px solid transparent; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;">${this.icon("calendar", "inline-svg-icon")} ${this.teachersT("profile.tabs.schedule", {}, "Schedule")}</button>
                    </div>

                    <div style="padding: 25px; overflow-y: auto; flex: 1;">
                        <div id="tch-tab-assignments" class="tch-tab-content">
                            ${assignmentsHtml}
                        </div>
                        <div id="tch-tab-schedule" class="tch-tab-content" style="display: none;">
                            ${scheduleHtml}
                        </div>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML("beforeend", profileModalHtml);
    } catch (err) {
        document.getElementById("teacher-profile-loading")?.remove();
        alert(this.teachersT("messages.profileFailed", { message: err.message }, `Failed to fetch teacher details: ${err.message}`));
    }
};

AdminUI.switchTeacherTab = function(tabName) {
    document.querySelectorAll(".tch-tab-content").forEach(content => {
        content.style.display = "none";
    });

    const activeColor = document.body.dataset.theme === "dark" ? "var(--primary-color)" : "#2563eb";
    const mutedColor = document.body.dataset.theme === "dark" ? "var(--text-muted)" : "#64748b";
    document.querySelectorAll(".tch-tab-btn").forEach(button => {
        button.style.color = mutedColor;
        button.style.borderBottomColor = "transparent";
    });

    const content = document.getElementById(`tch-tab-${tabName}`);
    if (content) content.style.display = "block";

    const activeBtn = document.querySelector(`.tch-tab-btn[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.style.color = activeColor;
        activeBtn.style.borderBottomColor = activeColor;
    }
};

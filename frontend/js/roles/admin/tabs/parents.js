// frontend/js/roles/admin/tabs/parents.js

AdminUI.parentsT = function(key, params = {}, fallback = "") {
    return this.t(`admin.parentsTab.${key}`, params, fallback);
};

AdminUI.parentInlineString = function(value) {
    return JSON.stringify(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.parentStudentDisplayName = function(student) {
    const id = student?.student_id || student?.id || "";
    return student?.full_name
        || student?.student_name
        || student?.name
        || student?.username
        || this.parentsT("studentsModal.studentFallback", { id }, `Student #${id || "-"}`);
};

AdminUI.parentStudentClassName = function(student) {
    return student?.class_name
        || student?.class_names
        || student?.level
        || this.parentsT("common.notSpecified", {}, "Not specified");
};

AdminUI.renderParentsTab = function(parentsData) {
    const main = this.prepareMain(this.t("admin.sections.parents", {}, "Parent Management"));
    const parents = parentsData.data || parentsData || [];

    main.innerHTML = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); gap: 12px; flex-wrap: wrap;">
            <div>
                <button onclick="AdminUI.showAddParentModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s;">
                    ${this.icon("parents", "inline-svg-icon")} ${this.parentsT("actions.linkUser", {}, "Assign User as Parent")}
                </button>
            </div>
            <div style="color: #64748b; font-size: 0.9em;">
                ${this.parentsT("toolbar.total", { count: parents.length }, `Total parents: ${parents.length}`)}
            </div>
        </div>

        <div id="parents-table-container"></div>

        <div id="add-parent-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(2px); padding: 18px;">
            <div style="background: white; width: min(450px, 100%); max-height: calc(100vh - 36px); overflow-y: auto; padding: 25px; border-radius: 10px; box-shadow: 0 10px 15px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">${this.parentsT("form.title", {}, "Assign New Parent")}</h3>

                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.parentsT("form.userLabel", {}, "Choose user account:")}</label>
                    <select id="modal-parent-user-select" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc; font-size: 1em;">
                        <option value="">${this.parentsT("form.loadingUsers", {}, "Loading users...")}</option>
                    </select>
                    <small style="color: #64748b; display: block; margin-top: 8px;">${this.parentsT("form.hint", {}, "Only users that can be assigned as parent accounts should be selected.")}</small>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeParentModal()" style="padding: 10px 15px; border: none; background: #e2e8f0; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitNewParent()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;">${this.parentsT("form.save", {}, "Save Assignment")}</button>
                </div>
            </div>
        </div>

        <div id="view-students-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(2px); padding: 18px;">
            <div style="background: white; width: min(500px, 100%); padding: 25px; border-radius: 10px; box-shadow: 0 10px 15px rgba(0,0,0,0.1); max-height: calc(100vh - 36px); display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; gap: 12px;">
                    <h3 id="students-modal-title" style="margin: 0; color: #1e40af;">${this.parentsT("studentsModal.title", {}, "Parent Children")}</h3>
                    <button onclick="AdminUI.closeStudentsModal()" style="background: #f1f5f9; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1.2em; color: #64748b; line-height: 1;">&times;</button>
                </div>

                <div id="students-list-container" style="overflow-y: auto; flex: 1; padding-right: 5px;"></div>
            </div>
        </div>
    `;

    const tableContainer = document.getElementById("parents-table-container");

    if (parents.length === 0) {
        tableContainer.innerHTML = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="display: inline-flex; width: 58px; height: 58px; align-items: center; justify-content: center; color: #64748b;">${this.icon("parents", "inline-svg-icon")}</span>
                <p style="color: #64748b; font-size: 1.1em;">${this.parentsT("table.empty", {}, "No parents are currently registered.")}</p>
            </div>
        `;
        return;
    }

    const rows = parents.map(p => {
        const parentId = p.parent_id || p.id;
        const parentName = p.full_name || "-";
        const parentNameArg = this.parentInlineString(parentName);
        const parentContact = p.username ? `@${p.username}` : (p.email || this.parentsT("common.notAvailable", {}, "Not available"));
        return `
            <tr class="admin-parent-row" style="border-bottom: 1px solid #f1f5f9; transition: 0.2s;">
                <td data-label="${this.parentsT("table.id", {}, "ID")}" style="padding: 15px; font-weight: bold; color: #64748b;">#${parentId}</td>
                <td data-label="${this.parentsT("table.parent", {}, "Parent")}" style="padding: 15px;">
                    <div style="font-weight: bold; color: #0f172a; font-size: 1.1em;">${this._escape(parentName)}</div>
                    <div style="color: #0369a1; font-size: 0.85em;">${this._escape(parentContact)}</div>
                </td>
                <td data-label="${this.parentsT("table.phone", {}, "Phone")}" style="padding: 15px; direction: ltr; text-align: right; color: #475569;">
                    <span class="admin-contact-line">${this.icon("phone", "inline-svg-icon")}<span>${this._escape(p.phone || this.parentsT("common.notAvailable", {}, "Not available"))}</span></span>
                </td>
                <td class="admin-actions-cell" data-label="${this.parentsT("table.children", {}, "Children")}" style="padding: 15px; text-align: center;">
                    <button class="admin-parent-action admin-parent-action--children" onclick="AdminUI.viewParentStudents(${parentId}, ${parentNameArg})"
                            style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9em; font-weight: bold; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;"
                            >
                        ${this.icon("eye", "inline-svg-icon")} ${this.parentsT("actions.viewChildren", {}, "View Children")}
                    </button>
                </td>
                <td class="admin-actions-cell" data-label="${this.parentsT("table.actions", {}, "Actions")}" style="padding: 15px; text-align: left;">
                    <button class="admin-parent-action admin-parent-action--delete" onclick="AdminUI.deleteParentItem(${parentId})"
                            style="background: #fef2f2; color: #ef4444; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;" title="${this.parentsT("actions.deleteRoleTitle", {}, "Remove role")}"
                            >
                        ${this.icon("trash", "inline-svg-icon")}
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    tableContainer.innerHTML = `
        <div class="admin-mobile-table" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
                <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <tr>
                        <th style="padding: 15px; color: #334155;">${this.parentsT("table.id", {}, "ID")}</th>
                        <th style="padding: 15px; color: #334155;">${this.parentsT("table.parentDetails", {}, "Parent Details")}</th>
                        <th style="padding: 15px; color: #334155;">${this.parentsT("table.phone", {}, "Phone Number")}</th>
                        <th style="padding: 15px; color: #334155; text-align: center;">${this.parentsT("table.children", {}, "Children (Students)")}</th>
                        <th style="padding: 15px; text-align: left; color: #334155;">${this.parentsT("table.actions", {}, "Actions")}</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
};

AdminUI.showAddParentModal = async function() {
    const modal = document.getElementById("add-parent-modal");
    const select = document.getElementById("modal-parent-user-select");

    modal.style.display = "flex";
    select.innerHTML = `<option value="">${this.parentsT("form.loadingUsers", {}, "Loading users...")}</option>`;
    select.disabled = true;

    try {
        const response = await Api.get("/users/");
        const users = response.data || response || [];

        if (users.length === 0) {
            select.innerHTML = `<option value="">${this.parentsT("form.noUsers", {}, "No users are registered in the system")}</option>`;
            return;
        }

        select.innerHTML = `<option value="">${this.parentsT("form.chooseUser", {}, "-- Choose the user to assign --")}</option>` +
            users.map(u => `<option value="${u.id}">${this._escape(u.full_name)} (@${this._escape(u.username)})</option>`).join("");
        select.disabled = false;
    } catch (err) {
        select.innerHTML = `<option value="">${this.parentsT("messages.loadUsersFailed", {}, "Failed to fetch data")}</option>`;
        console.error("Error loading users for parent assignment:", err);
    }
};

AdminUI.closeParentModal = function() {
    document.getElementById("add-parent-modal").style.display = "none";
};

AdminUI.submitNewParent = async function() {
    const userId = document.getElementById("modal-parent-user-select").value;

    if (!userId) {
        alert(this.parentsT("messages.chooseUserFirst", {}, "Please choose a user from the list first."));
        return;
    }

    try {
        await Api.post("/parents/", {
            user_id: parseInt(userId)
        });

        alert(this.parentsT("messages.assigned", {}, "User assigned as parent successfully."));
        this.closeParentModal();
        AdminRole.loadSection("parents");
    } catch (err) {
        alert(this.parentsT("messages.addFailed", { message: err.message || this.parentsT("messages.unexpected", {}, "Unexpected error") }, `Add failed: ${err.message}`));
    }
};

AdminUI.deleteParentItem = async function(parentId) {
    if (!confirm(this.parentsT("messages.deleteConfirm", {}, "Are you sure you want to remove the parent role from this account?"))) return;

    try {
        await AdminRole.deleteItem("/parents", parentId);
        AdminRole.loadSection("parents");
    } catch (err) {
        console.error(err);
    }
};

AdminUI.viewParentStudents = async function(parentId, parentName) {
    const modal = document.getElementById("view-students-modal");
    const container = document.getElementById("students-list-container");

    document.getElementById("students-modal-title").innerText = this.parentsT("studentsModal.titleWithName", { name: parentName }, `Parent Children: ${parentName}`);
    container.innerHTML = `<div style="text-align:center; padding: 20px; color: #64748b;">${this.parentsT("messages.loadingChildren", {}, "Fetching data...")}</div>`;
    modal.style.display = "flex";

    try {
        const result = await AdminServices.getParentStudents(parentId);
        const students = result.data || result || [];

        if (!students || students.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; background: #f8fafc; border-radius: 8px;">
                    <p style="color: #64748b; margin: 0;">${this.parentsT("studentsModal.empty", {}, "No children are linked to this account currently.")}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(s => {
            const studentId = s.student_id || s.id || "";
            const studentName = this.parentStudentDisplayName(s);
            const className = this.parentStudentClassName(s);

            return `
            <div class="admin-parent-student-card" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; background: white; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); gap: 12px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div class="admin-parent-student-avatar" style="background: #e0f2fe; color: #0284c7; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${this.icon("graduation", "inline-svg-icon")}
                    </div>
                    <div>
                        <div style="font-weight: bold; color: #0f172a; font-size: 1.1em;">${this._escape(studentName)}</div>
                        <div style="color: #64748b; font-size: 0.9em; margin-top: 3px;">${this.parentsT("studentsModal.className", { value: this._escape(className) }, `Class: ${this._escape(className)}`)}</div>
                        ${studentId ? `<div style="color: #94a3b8; font-size: 0.78em; margin-top: 2px;">#${this._escape(studentId)}</div>` : ""}
                    </div>
                </div>
                <span class="admin-parent-student-status" style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold;">
                    ${this.parentsT("studentsModal.registered", {}, "Registered")}
                </span>
            </div>
            `;
        }).join("");
    } catch (err) {
        container.innerHTML = `<div style="color: #ef4444; background: #fef2f2; padding: 15px; border-radius: 6px; border: 1px solid #fca5a5;">${this.parentsT("messages.loadChildrenFailed", { message: err.message }, `Failed to fetch data: ${err.message}`)}</div>`;
    }
};

AdminUI.closeStudentsModal = function() {
    document.getElementById("view-students-modal").style.display = "none";
};

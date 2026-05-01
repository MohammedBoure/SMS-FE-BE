// frontend/js/roles/admin/tabs/users.js

AdminUI.usersT = function(key, params = {}, fallback = "") {
    return this.t(`admin.usersTab.${key}`, params, fallback);
};

AdminUI.userPayloadArg = function(user) {
    return encodeURIComponent(JSON.stringify(user || {}));
};

AdminUI.userRoleLabel = function(roleId, fallback = "") {
    const labels = {
        1: this.usersT("roles.admin", {}, "Admin"),
        2: this.usersT("roles.receptionist", {}, "Receptionist"),
        3: this.usersT("roles.student", {}, "Student"),
        4: this.usersT("roles.parent", {}, "Parent"),
        5: this.usersT("roles.accountant", {}, "Accountant"),
        6: this.usersT("roles.teacher", {}, "Teacher")
    };
    return labels[roleId] || fallback || roleId || "-";
};

AdminUI.renderUsersTab = function(response) {
    const main = this.prepareMain(this.t("admin.sections.users", {}, "User Management"));

    main.innerHTML = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: var(--admin-surface); padding: 15px; border-radius: 8px; box-shadow: var(--admin-shadow-soft); gap: 15px; flex-wrap: wrap;">
            <div class="admin-toolbar-search" style="display: flex; gap: 10px; flex: 1; min-width: min(320px, 100%); flex-wrap: wrap;">
                <input type="text" id="user-search-input" placeholder="${this.usersT("search.placeholder", {}, "Search users (at least two characters)...")}" onkeyup="if(event.key === 'Enter') AdminUI.searchUsers()" style="padding: 10px; flex: 1 1 260px; border: 1px solid var(--admin-border); border-radius: 6px; outline: none;">
                <button onclick="AdminUI.searchUsers()" style="background: #2563eb; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; font-weight: bold;">${this.icon("search", "inline-svg-icon")} ${this.t("admin.actions.search", {}, "Search")}</button>
                <button onclick="AdminUI.loadUsers()" style="background: #64748b; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center;" title="${this.usersT("actions.reloadTitle", {}, "Reload list")}">${this.icon("refresh", "inline-svg-icon")}</button>
            </div>
            <div>
                <button onclick="AdminUI.showUserModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: inline-flex; align-items: center; gap: 8px;">
                    ${this.icon("users", "inline-svg-icon")} ${this.usersT("actions.add", {}, "Add New User")}
                </button>
            </div>
        </div>

        <div class="admin-mobile-table" style="background: var(--admin-surface); border-radius: 8px; box-shadow: var(--admin-shadow-soft); overflow: hidden; min-height: 300px;">
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
                <thead style="background: var(--admin-surface-soft); border-bottom: 2px solid var(--admin-border);">
                    <tr>
                        <th style="padding: 12px 15px; color: var(--text-main);">${this.usersT("table.id", {}, "ID")}</th>
                        <th style="padding: 12px 15px; color: var(--text-main);">${this.usersT("table.fullName", {}, "Full Name")}</th>
                        <th style="padding: 12px 15px; color: var(--text-main);">${this.usersT("table.username", {}, "Username")}</th>
                        <th style="padding: 12px 15px; color: var(--text-main);">${this.usersT("table.contact", {}, "Contact")}</th>
                        <th style="padding: 12px 15px; color: var(--text-main);">${this.usersT("table.status", {}, "Status")}</th>
                        <th style="padding: 12px 15px; color: var(--text-main); text-align: center;">${this.usersT("table.actions", {}, "Actions")}</th>
                    </tr>
                </thead>
                <tbody id="users-table-body">
                    <tr><td class="admin-empty-cell" colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">${this.usersT("messages.loading", {}, "Loading...")}</td></tr>
                </tbody>
            </table>
        </div>

        <div id="user-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; padding: 16px;">
            <div style="background: var(--admin-surface); width: min(560px, 100%); padding: 25px; border-radius: 10px; box-shadow: var(--admin-shadow); max-height: 90vh; overflow-y: auto;">
                <h3 id="user-modal-title" style="margin-top: 0; color: var(--text-main); border-bottom: 1px solid var(--admin-border); padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">${this.icon("users", "inline-svg-icon")} ${this.usersT("form.addTitle", {}, "Add New User")}</h3>

                <input type="hidden" id="modal-user-id">

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.usersT("form.fullName", {}, "Full Name *")}</label>
                        <input type="text" id="modal-user-fullname" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.usersT("form.role", {}, "Role *")}</label>
                        <select id="modal-user-role" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box; background: var(--admin-surface);">
                            <option value="" disabled selected>${this.usersT("form.selectRole", {}, "Select Role")}</option>
                            <option value="1">${this.userRoleLabel(1)}</option>
                            <option value="2">${this.userRoleLabel(2)}</option>
                            <option value="3">${this.userRoleLabel(3)}</option>
                            <option value="4">${this.userRoleLabel(4)}</option>
                            <option value="5">${this.userRoleLabel(5)}</option>
                            <option value="6">${this.userRoleLabel(6)}</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.usersT("form.username", {}, "Username *")}</label>
                        <input type="text" id="modal-user-username" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.usersT("form.password", {}, "Password *")}</label>
                        <input type="text" id="modal-user-password" placeholder="${this.usersT("form.passwordPlaceholder", {}, "Enter password")}" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box;">
                        <small id="password-hint" style="color: var(--text-muted); font-size: 0.8em; display: none;">${this.usersT("form.passwordHint", {}, "Leave it empty if you do not want to change it.")}</small>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.usersT("form.email", {}, "Email")}</label>
                        <input type="email" id="modal-user-email" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.usersT("form.phone", {}, "Phone")}</label>
                        <input type="text" id="modal-user-phone" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box;">
                    </div>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: var(--text-main);">${this.usersT("form.address", {}, "Address")}</label>
                    <input type="text" id="modal-user-address" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box;">
                </div>

                <div style="margin-top: 15px; display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="modal-user-active" checked style="width: 18px; height: 18px; cursor: pointer;">
                    <label for="modal-user-active" style="font-weight: bold; cursor: pointer; color: var(--text-main);">${this.usersT("form.activeAccount", {}, "Active account (can sign in)")}</label>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeUserModal()" style="padding: 10px 15px; border: none; background: #e2e8f0; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitUser()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px;">${this.icon("save", "inline-svg-icon")} ${this.usersT("form.save", {}, "Save Data")}</button>
                </div>
            </div>
        </div>
    `;

    this.populateUsersTable(response || []);
};

AdminUI.populateUsersTable = function(response) {
    const tbody = document.getElementById("users-table-body");
    const users = Array.isArray(response && response.data) ? response.data : (Array.isArray(response) ? response : []);
    if (!tbody) return;

    if (!users.length) {
        tbody.innerHTML = `<tr><td class="admin-empty-cell" colspan="6" style="text-align:center; padding: 40px; color: var(--text-muted);">${this.usersT("table.empty", {}, "No users to display.")}</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const isActive = !!user.is_active;
        const statusColor = isActive ? "#10b981" : "#ef4444";
        const statusText = isActive ? this.usersT("status.active", {}, "Active") : this.usersT("status.inactive", {}, "Disabled");
        const statusActionIcon = isActive ? this.icon("ban", "inline-svg-icon") : this.icon("check", "inline-svg-icon");
        const statusActionTitle = isActive ? this.usersT("actions.disable", {}, "Disable account") : this.usersT("actions.enable", {}, "Enable account");
        const payload = this.userPayloadArg(user);

        return `
            <tr style="border-bottom: 1px solid var(--admin-border); transition: 0.2s;">
                <td data-label="${this.usersT("table.id", {}, "ID")}" style="padding: 12px 15px; color: var(--text-muted); font-weight: bold;">#${this._escape(user.id)}</td>
                <td data-label="${this.usersT("table.fullName", {}, "Full Name")}" style="padding: 12px 15px;">
                    <div style="font-weight: bold; color: var(--text-main);">${this._escape(user.full_name)}</div>
                    <div style="font-size: 0.85em; color: var(--text-muted);">${this.usersT("table.roleId", { id: this._escape(user.role_id) }, `Role ID: ${this._escape(user.role_id)}`)}</div>
                </td>
                <td data-label="${this.usersT("table.username", {}, "Username")}" style="padding: 12px 15px; color: #0369a1; font-weight: bold;">${this._escape(user.username)}</td>
                <td data-label="${this.usersT("table.contact", {}, "Contact")}" style="padding: 12px 15px; font-size: 0.9em; color: var(--text-main);">
                    <div class="admin-contact-line">${this.icon("phone", "inline-svg-icon")}<span>${this._escape(user.phone || "-")}</span></div>
                    <div class="admin-contact-line">${this.icon("mail", "inline-svg-icon")}<span>${this._escape(user.email || "-")}</span></div>
                </td>
                <td data-label="${this.usersT("table.status", {}, "Status")}" style="padding: 12px 15px;">
                    <span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">${statusText}</span>
                </td>
                <td class="admin-actions-cell" data-label="${this.usersT("table.actions", {}, "Actions")}" style="padding: 12px 15px; text-align: center;">
                    <button onclick="AdminUI.toggleUserStatus(${user.id}, ${isActive})" title="${statusActionTitle}" style="background: none; border: none; cursor: pointer; color: #d97706; margin: 0 3px;">${statusActionIcon}</button>
                    <button onclick="AdminUI.showUserModal(JSON.parse(decodeURIComponent('${payload}')))" title="${this.t("admin.actions.edit", {}, "Edit")}" style="background: none; border: none; cursor: pointer; color: #eab308; margin: 0 3px;">${this.icon("edit", "inline-svg-icon")}</button>
                    <button onclick="AdminUI.deleteUserItem(${user.id})" title="${this.t("admin.actions.delete", {}, "Delete")}" style="background: none; border: none; cursor: pointer; color: #ef4444; margin: 0 3px;">${this.icon("trash", "inline-svg-icon")}</button>
                </td>
            </tr>`;
    }).join("");
};

AdminUI.loadUsers = async function() {
    try {
        const tbody = document.getElementById("users-table-body");
        if (tbody) {
            tbody.innerHTML = `<tr><td class="admin-empty-cell" colspan="6" style="text-align:center; padding: 20px;">${this.usersT("messages.refreshing", {}, "Refreshing...")}</td></tr>`;
        }
        const response = await Api.get("/users/");
        this.populateUsersTable(response);
    } catch (err) {
        alert(this.usersT("messages.loadFailed", { message: err.message }, `Failed to load users: ${err.message}`));
    }
};

AdminUI.searchUsers = async function() {
    const keyword = document.getElementById("user-search-input").value.trim();
    if (keyword.length > 0 && keyword.length < 2) {
        alert(this.usersT("messages.minSearch", {}, "Please enter at least two characters to search."));
        return;
    }

    if (keyword.length === 0) {
        return this.loadUsers();
    }

    try {
        document.getElementById("users-table-body").innerHTML = `<tr><td class="admin-empty-cell" colspan="6" style="text-align:center; padding: 20px;">${this.usersT("messages.searching", {}, "Searching...")}</td></tr>`;
        const response = await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);
        this.populateUsersTable(response);
    } catch (err) {
        alert(this.usersT("messages.searchFailed", { message: err.message }, `Search failed: ${err.message}`));
    }
};

AdminUI.toggleUserStatus = async function(userId, currentStatus) {
    const newStatus = !currentStatus;
    const confirmMsg = newStatus
        ? this.usersT("messages.enableConfirm", {}, "Do you want to enable this account?")
        : this.usersT("messages.disableConfirm", {}, "Do you want to disable this account and prevent sign-in?");

    if (!confirm(confirmMsg)) return;

    try {
        await Api.patch(`/users/${userId}/status`, { is_active: newStatus });
        this.loadUsers();
    } catch (err) {
        alert(this.usersT("messages.statusFailed", { message: err.message }, `Failed to change status: ${err.message}`));
    }
};

AdminUI.deleteUserItem = async function(userId) {
    if (!confirm(this.usersT("messages.deleteConfirm", {}, "Are you sure you want to permanently delete this user? This action cannot be undone."))) return;
    try {
        await AdminServices.deleteRecord("/users", userId);
        alert(this.t("admin.messages.deleteSuccess", {}, "Deleted successfully."));
        this.loadUsers();
    } catch (err) {
        alert(this.t("admin.messages.deleteFailed", { message: err.message }, `Delete failed: ${err.message}`));
    }
};

AdminUI.showUserModal = function(user = null) {
    const modal = document.getElementById("user-modal");
    const title = document.getElementById("user-modal-title");
    const passHint = document.getElementById("password-hint");

    document.getElementById("modal-user-id").value = "";
    document.getElementById("modal-user-fullname").value = "";
    document.getElementById("modal-user-username").value = "";
    document.getElementById("modal-user-password").value = "";
    document.getElementById("modal-user-role").value = "";
    document.getElementById("modal-user-email").value = "";
    document.getElementById("modal-user-phone").value = "";
    document.getElementById("modal-user-address").value = "";
    document.getElementById("modal-user-active").checked = true;

    if (user) {
        title.innerHTML = `${this.icon("edit", "inline-svg-icon")} ${this.usersT("form.editTitle", {}, "Edit User")}`;
        passHint.style.display = "block";

        document.getElementById("modal-user-id").value = user.id;
        document.getElementById("modal-user-fullname").value = user.full_name || "";
        document.getElementById("modal-user-username").value = user.username || "";
        document.getElementById("modal-user-role").value = user.role_id || "";
        document.getElementById("modal-user-email").value = user.email || "";
        document.getElementById("modal-user-phone").value = user.phone || "";
        document.getElementById("modal-user-address").value = user.address || "";
        document.getElementById("modal-user-active").checked = !!user.is_active;
    } else {
        title.innerHTML = `${this.icon("users", "inline-svg-icon")} ${this.usersT("form.addTitle", {}, "Add New User")}`;
        passHint.style.display = "none";
    }

    modal.style.display = "flex";
};

AdminUI.closeUserModal = function() {
    document.getElementById("user-modal").style.display = "none";
};

AdminUI.submitUser = async function() {
    const id = document.getElementById("modal-user-id").value;
    const fullName = document.getElementById("modal-user-fullname").value.trim();
    const username = document.getElementById("modal-user-username").value.trim();
    const password = document.getElementById("modal-user-password").value;
    const roleId = document.getElementById("modal-user-role").value;

    if (!fullName || !username || !roleId) {
        alert(this.usersT("messages.required", {}, "Please fill in all required fields: Full Name, Username, and Role."));
        return;
    }

    if (!id && !password) {
        alert(this.usersT("messages.passwordRequired", {}, "Please provide a password for the new user."));
        return;
    }

    const payload = {
        full_name: fullName,
        username: username,
        role_id: parseInt(roleId, 10),
        email: document.getElementById("modal-user-email").value.trim() || null,
        phone: document.getElementById("modal-user-phone").value.trim() || null,
        address: document.getElementById("modal-user-address").value.trim() || null,
        is_active: document.getElementById("modal-user-active").checked
    };

    if (password) payload.password = password;

    try {
        if (id) {
            await Api.put(`/users/${id}`, payload);
            alert(this.usersT("messages.updated", {}, "User updated successfully."));
        } else {
            await Api.post("/users/", payload);
            alert(this.usersT("messages.created", {}, "User created successfully."));
        }

        this.closeUserModal();
        this.loadUsers();
    } catch (err) {
        const fallback = this.usersT("messages.duplicateHint", {}, "Please check for duplicate usernames.");
        alert(this.usersT("messages.saveFailed", { message: err.message || fallback }, `Error saving data: ${err.message || fallback}`));
    }
};

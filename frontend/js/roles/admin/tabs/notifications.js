// frontend/js/roles/admin/tabs/notifications.js

AdminUI.notificationsT = function(key, params = {}, fallback = "") {
    return this.t(`admin.notificationsTab.${key}`, params, fallback);
};

AdminUI.notificationInlineString = function(value) {
    return JSON.stringify(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.notificationDate = function(value) {
    if (!value) return "-";
    const locale = window.I18n?.currentLang === "en" ? "en-US" : "ar-DZ";
    return new Date(value).toLocaleString(locale);
};

AdminUI.notificationTargetLabel = function(targetType) {
    const labels = {
        single: this.notificationsT("targets.single", {}, "Single user"),
        student: this.notificationsT("targets.student", {}, "All students"),
        teacher: this.notificationsT("targets.teacher", {}, "All teachers"),
        parent: this.notificationsT("targets.parent", {}, "All parents"),
        all: this.notificationsT("targets.all", {}, "All system users")
    };
    return labels[targetType] || targetType;
};

AdminUI.renderNotificationsTab = function(response) {
    const main = this.prepareMain(this.t("admin.sections.notifications", {}, "Notifications and Alerts"));

    let notifications = [];
    if (Array.isArray(response)) {
        notifications = response;
    } else if (response && Array.isArray(response.data)) {
        notifications = response.data;
    } else if (response && response.data && Array.isArray(response.data.data)) {
        notifications = response.data.data;
    } else if (response && typeof response === "object") {
        const possibleArray = Object.values(response).find(val => Array.isArray(val));
        notifications = possibleArray || [response];
    }

    notifications = notifications.filter(n => n && (n.id || n.notification_id));
    window.currentNotificationsData = notifications;

    const totalSent = notifications.length;
    const readCount = notifications.filter(n => n.is_read).length;
    const unreadCount = totalSent - readCount;

    const statsHtml = `
        <div class="admin-responsive-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #f59e0b;">
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">${this.notificationsT("stats.totalSent", {}, "Total Sent Notifications")}</div>
                <div style="font-size: 1.8em; font-weight: bold; color: #b45309; margin-top: 5px;">${totalSent}</div>
            </div>
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #10b981;">
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">${this.notificationsT("stats.read", {}, "Read by users")}</div>
                <div style="font-size: 1.8em; font-weight: bold; color: #16a34a; margin-top: 5px;">${readCount}</div>
            </div>
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #ef4444;">
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">${this.notificationsT("stats.unread", {}, "Unread / Pending")}</div>
                <div style="font-size: 1.8em; font-weight: bold; color: #dc2626; margin-top: 5px;">${unreadCount}</div>
            </div>
        </div>
    `;

    const sendFormHtml = `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 25px; margin-bottom: 25px; border: 1px solid #e2e8f0; border-top: 5px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #0f172a; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                ${this.icon("megaphone", "inline-svg-icon")} ${this.notificationsT("form.title", {}, "Send New Alert or Notification")}
            </h3>
            <form id="send-notification-form" onsubmit="AdminUI.handleSendNotification(event)">
                <div class="admin-responsive-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.notificationsT("form.targetLabel", {}, "Target Audience *")}</label>
                        <select id="notif-target" onchange="AdminUI.toggleNotifTargetInput()" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc; font-weight: bold;">
                            <option value="single">${this.notificationTargetLabel("single")}</option>
                            <option value="student">${this.notificationTargetLabel("student")}</option>
                            <option value="teacher">${this.notificationTargetLabel("teacher")}</option>
                            <option value="parent">${this.notificationTargetLabel("parent")}</option>
                            <option value="all">${this.notificationTargetLabel("all")}</option>
                        </select>
                    </div>

                    <div id="notif-single-user-container" style="position: relative;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.notificationsT("form.userSearchLabel", {}, "Search user *")}</label>
                        <input type="text" id="notif-user-search" placeholder="${this.notificationsT("form.userSearchPlaceholder", {}, "Type a username to search...")}" required style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none;" onkeyup="AdminUI.searchUserForNotif(this.value)">
                        <input type="hidden" id="notif-user-id">
                        <div id="notif-user-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10; margin-top: 5px;"></div>
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.notificationsT("form.notificationTitleLabel", {}, "Notification Title *")}</label>
                    <input type="text" id="notif-title" required placeholder="${this.notificationsT("form.titlePlaceholder", {}, "Example: Fee due date reminder...")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.notificationsT("form.messageLabel", {}, "Message Content *")}</label>
                    <textarea id="notif-message" required rows="4" placeholder="${this.notificationsT("form.messagePlaceholder", {}, "Write notification details here...")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none; resize: vertical;"></textarea>
                </div>

                <div class="admin-mobile-stack" style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" onclick="document.getElementById('send-notification-form').reset(); AdminUI.toggleNotifTargetInput();" style="background: #f1f5f9; color: #475569; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        ${this.notificationsT("form.clear", {}, "Clear Fields")}
                    </button>
                    <button type="submit" id="notif-submit-btn" style="background: #f59e0b; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(245,158,11,0.2);">
                        ${this.notificationsT("form.send", {}, "Send Notification")}
                    </button>
                </div>
            </form>
        </div>
    `;

    const filterHtml = `
        <div class="admin-page-toolbar" style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div class="admin-mobile-stack" style="display: flex; align-items: center; gap: 8px;">
                <label style="font-weight: bold; color: #334155;">${this.notificationsT("filters.readStatus", {}, "Read Status:")}</label>
                <select id="notif-status-filter" onchange="AdminUI.filterLocalNotifications()" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-weight: bold; outline: none;">
                    <option value="all">${this.notificationsT("filters.all", {}, "All")}</option>
                    <option value="read">${this.notificationsT("filters.readOnly", {}, "Read only")}</option>
                    <option value="unread">${this.notificationsT("filters.unreadOnly", {}, "Unread")}</option>
                </select>
            </div>
            <div class="admin-toolbar-search" style="flex: 1; min-width: 250px;">
                <input type="text" id="notif-search-input" placeholder="${this.notificationsT("filters.searchPlaceholder", {}, "Search notifications (recipient, title, content)...")}" onkeyup="AdminUI.filterLocalNotifications()" style="width: 100%; padding: 10px 15px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-weight: bold; box-sizing: border-box;">
            </div>
            <div class="admin-mobile-stack" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="AdminUI.clearOldNotifications()" style="background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;" title="${this.notificationsT("actions.cleanTitle", {}, "Remove read notifications older than 30 days")}">
                    ${this.icon("trash", "inline-svg-icon")} ${this.notificationsT("actions.clean", {}, "Clean Log (30 days)")}
                </button>
                <button onclick="AdminRole.loadSection('notifications')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;">${this.icon("refresh", "inline-svg-icon")} ${this.notificationsT("actions.refresh", {}, "Refresh")}</button>
            </div>
        </div>
    `;

    main.innerHTML = statsHtml + sendFormHtml + filterHtml + `<div id="notifications-table-container">${this._generateNotificationsTableHtml(notifications)}</div>`;

    if (!this._notificationsOutsideClickBound) {
        document.addEventListener("click", function(e) {
            const dropdown = document.getElementById("notif-user-dropdown");
            const searchInput = document.getElementById("notif-user-search");
            if (dropdown && searchInput && e.target !== searchInput && !dropdown.contains(e.target)) {
                dropdown.style.display = "none";
            }
        });
        this._notificationsOutsideClickBound = true;
    }
};

AdminUI._generateNotificationsTableHtml = function(notifications) {
    if (!notifications || notifications.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                <span style="display: inline-flex; width: 58px; height: 58px; align-items: center; justify-content: center; color: #64748b;">${this.icon("mail", "inline-svg-icon")}</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px; font-weight: bold;">${this.notificationsT("table.empty", {}, "No previous notifications or matching results.")}</p>
            </div>
        `;
    }

    const rows = notifications.map(n => {
        const id = n.id || n.notification_id;
        const isRead = n.is_read === 1 || n.is_read === true;
        return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s; opacity: ${isRead ? "0.7" : "1"};" onmouseover="this.style.opacity='1'; this.style.background='#f8fafc'" onmouseout="this.style.opacity='${isRead ? "0.7" : "1"}'; this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #64748b;">#${id}</td>
                <td style="padding: 15px;">
                    <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(n.full_name || this.notificationsT("table.userFallback", { id: n.user_id }, `User #${n.user_id}`))}</div>
                    <small style="color: #64748b;">ID: ${n.user_id}</small>
                </td>
                <td style="padding: 15px; max-width: 350px;">
                    <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(n.title)}</div>
                    <div style="color: #475569; font-size: 0.9em; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${this._escape(n.message)}">
                        ${this._escape(n.message)}
                    </div>
                </td>
                <td style="padding: 15px;">
                    <span style="display: inline-block; color: ${isRead ? "#16a34a" : "#d97706"}; font-weight: bold; background: ${isRead ? "#dcfce7" : "#fef3c7"}; border: 1px solid ${isRead ? "#bbf7d0" : "#fde68a"}; padding: 6px 12px; border-radius: 20px; font-size: 0.85em;">
                        ${isRead ? this.notificationsT("status.read", {}, "Read") : this.notificationsT("status.unread", {}, "Unread")}
                    </span>
                </td>
                <td style="padding: 15px; color: #475569; font-weight: bold; direction: ltr; text-align: right;">
                    ${this.notificationDate(n.created_at)}
                </td>
                <td style="padding: 15px; text-align: left;">
                    <button onclick="AdminRole.deleteItem('/notifications', ${id}, 'notifications')" title="${this.notificationsT("actions.removeTitle", {}, "Remove notification")}" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-weight: bold; display: inline-flex; align-items: center; gap: 6px;">${this.icon("trash", "inline-svg-icon")} ${this.notificationsT("actions.remove", {}, "Remove")}</button>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 2px solid #cbd5e1; font-weight: bold; color: #334155;">
                ${this.notificationsT("table.displayed", { count: notifications.length }, `Displayed results: ${notifications.length} notifications`)}
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">${this.notificationsT("table.recipient", {}, "Recipient")}</th>
                            <th style="padding: 15px; color: #334155;">${this.notificationsT("table.titleContent", {}, "Title and Content")}</th>
                            <th style="padding: 15px; color: #334155;">${this.notificationsT("table.deliveryStatus", {}, "Delivery Status")}</th>
                            <th style="padding: 15px; color: #334155;">${this.notificationsT("table.sentDate", {}, "Sent Date")}</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">${this.notificationsT("table.resolve", {}, "Resolve")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

AdminUI.filterLocalNotifications = function() {
    const keyword = document.getElementById("notif-search-input").value.toLowerCase().trim();
    const statusFilter = document.getElementById("notif-status-filter").value;
    const allNotifs = window.currentNotificationsData || [];

    const filtered = allNotifs.filter(n => {
        const isRead = n.is_read === 1 || n.is_read === true;
        let matchStatus = true;
        if (statusFilter === "read") matchStatus = isRead;
        if (statusFilter === "unread") matchStatus = !isRead;

        const name = (n.full_name || "").toLowerCase();
        const title = (n.title || "").toLowerCase();
        const message = (n.message || "").toLowerCase();
        const matchKeyword = name.includes(keyword) || title.includes(keyword) || message.includes(keyword) || String(n.user_id).includes(keyword);

        return matchStatus && matchKeyword;
    });

    document.getElementById("notifications-table-container").innerHTML = this._generateNotificationsTableHtml(filtered);
};

AdminUI.toggleNotifTargetInput = function() {
    const target = document.getElementById("notif-target").value;
    const singleContainer = document.getElementById("notif-single-user-container");
    const userSearchInput = document.getElementById("notif-user-search");

    if (target === "single") {
        singleContainer.style.display = "block";
        userSearchInput.setAttribute("required", "true");
    } else {
        singleContainer.style.display = "none";
        userSearchInput.removeAttribute("required");
        document.getElementById("notif-user-id").value = "";
    }
};

AdminUI.searchUserForNotif = async function(keyword) {
    const dropdown = document.getElementById("notif-user-dropdown");

    if (keyword.trim().length < 2) {
        dropdown.style.display = "none";
        return;
    }

    try {
        const response = await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}&limit=5`);
        const users = response?.data?.data || response?.data || response || [];

        if (users.length === 0) {
            dropdown.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center;">${this.notificationsT("search.noResults", {}, "No results")}</div>`;
        } else {
            dropdown.innerHTML = users.map(u => {
                const name = u.full_name || "";
                return `
                    <div onclick="AdminUI.selectUserForNotif(${u.id}, ${this.notificationInlineString(name)})"
                         style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s;"
                         onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                        <strong style="color: #0f172a;">${this._escape(name)}</strong>
                        <small style="color: #64748b; float: left;">(${this._escape(u.role_name || this.notificationsT("search.userRoleFallback", {}, "User"))})</small>
                    </div>
                `;
            }).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error(this.notificationsT("messages.userSearchFailed", {}, "User search failed:"), err);
    }
};

AdminUI.selectUserForNotif = function(id, name) {
    document.getElementById("notif-user-search").value = name;
    document.getElementById("notif-user-id").value = id;
    document.getElementById("notif-user-dropdown").style.display = "none";
};

AdminUI.handleSendNotification = async function(event) {
    event.preventDefault();
    const btn = document.getElementById("notif-submit-btn");

    const targetType = document.getElementById("notif-target").value;
    const title = document.getElementById("notif-title").value.trim();
    const message = document.getElementById("notif-message").value.trim();
    const sendLabel = this.notificationsT("form.send", {}, "Send Notification");

    if (!title || !message) {
        this.showToast(this.notificationsT("messages.titleMessageRequired", {}, "Please enter a title and notification content."), "error");
        return;
    }

    btn.disabled = true;
    btn.innerText = this.notificationsT("messages.sending", {}, "Sending...");

    try {
        if (targetType === "single") {
            const userId = document.getElementById("notif-user-id").value;
            if (!userId) {
                this.showToast(this.notificationsT("messages.chooseTargetUser", {}, "Please search and choose the target user from the list."), "error");
                btn.disabled = false;
                btn.innerText = sendLabel;
                return;
            }

            await Api.post("/notifications/", {
                user_id: parseInt(userId),
                title,
                message
            });
            this.showToast(this.notificationsT("messages.sentSingle", {}, "Notification sent to the user successfully."));
        } else {
            let endpoint = "/users/?limit=1000";
            if (targetType !== "all") {
                endpoint += `&role_name=${targetType}`;
            }

            const usersRes = await Api.get(endpoint);
            let users = [];
            if (Array.isArray(usersRes)) users = usersRes;
            else if (usersRes && Array.isArray(usersRes.data)) users = usersRes.data;
            else if (usersRes?.data?.data && Array.isArray(usersRes.data.data)) users = usersRes.data.data;

            const usersToNotify = users.map(u => u.id || u.user_id).filter(Boolean);

            if (usersToNotify.length === 0) {
                this.showToast(this.notificationsT("messages.noUsersForTarget", { target: this.notificationTargetLabel(targetType) }, "No users found in this category."), "error");
                btn.disabled = false;
                btn.innerText = sendLabel;
                return;
            }

            const confirmText = this.notificationsT("messages.bulkConfirm", { count: usersToNotify.length }, `This bulk notification will be sent to ${usersToNotify.length} users. Continue?`);
            if (!confirm(confirmText)) {
                btn.disabled = false;
                btn.innerText = sendLabel;
                return;
            }

            await Api.post("/notifications/bulk", {
                user_ids: usersToNotify,
                title,
                message
            });
            this.showToast(this.notificationsT("messages.sentBulk", { count: usersToNotify.length }, `Notification sent successfully to ${usersToNotify.length} users.`));
        }

        document.getElementById("send-notification-form").reset();
        document.getElementById("notif-user-id").value = "";
        document.getElementById("notif-user-search").value = "";
        this.toggleNotifTargetInput();
        AdminRole.loadSection("notifications");
    } catch (err) {
        this.showToast(this.notificationsT("messages.sendFailed", { message: err.message || this.notificationsT("messages.connectionHint", {}, "Check server connection.") }, `Send failed: ${err.message}`), "error");
        btn.disabled = false;
        btn.innerText = sendLabel;
    }
};

AdminUI.clearOldNotifications = async function() {
    if (!confirm(this.notificationsT("messages.cleanConfirm", {}, "Are you sure you want to clean the log and remove old read notifications? This cannot be undone."))) return;

    try {
        const result = await Api.delete("/notifications/old?days_old=30");
        this.showToast(result.message || this.notificationsT("messages.cleanSuccess", {}, "Old notifications were removed and the log was updated."));
        AdminRole.loadSection("notifications");
    } catch (err) {
        this.showToast(this.notificationsT("messages.cleanFailed", { message: err.message }, `Failed to clean log: ${err.message}`), "error");
    }
};

if (!AdminUI.showToast) {
    AdminUI.showToast = function(message, type = "success") {
        const toast = document.createElement("div");
        toast.innerText = message;
        const bgColor = type === "error" ? "#dc2626" : "#0f172a";
        toast.style.cssText = `position: fixed; bottom: 20px; left: 20px; background: ${bgColor}; color: white; padding: 12px 25px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-weight: bold; transition: opacity 0.5s;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = "0", 2500);
        setTimeout(() => toast.remove(), 3000);
    };
}

// js/roles/receptionist/tabs/notifications.js

ReceptionistUI.renderNotifications = function(notificationsData) {
  const main = document.getElementById("receptionist-main");
  const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.data || []);
  const start = this.start();
  const end = this.end();

  if (!notifications || notifications.length === 0) {
    main.innerHTML = `
      <h2>${this.t("receptionist.notifications.title", {}, "Notifications")}</h2>
      <p>${this.t("receptionist.notifications.empty", {}, "No new notifications.")}</p>
    `;
    return;
  }

  const unreadCount = notifications.filter(n => !this._isNotificationRead(n)).length;
  const items = notifications.map(n => {
    const date = n.created_at ? this.formatDateTime(n.created_at) : this.t("receptionist.common.unknownDate", {}, "Unknown date");
    const isRead = this._isNotificationRead(n);
    const notificationId = this._getNotificationId(n);
    const action = isRead
      ? `<span style="color:#16a34a; font-weight:700;">${this.t("receptionist.notifications.read", {}, "Read")}</span>`
      : notificationId !== null
        ? `<button type="button" class="receptionist-mark-notification-read" data-notification-id="${this._escapeAttr(notificationId)}">${this.t("receptionist.notifications.markRead", {}, "Mark as read")}</button>`
        : `<span style="color:#64748b; font-weight:700;">${this.t("receptionist.common.unavailable", {}, "Unavailable")}</span>`;
    const status = isRead
      ? this.t("receptionist.notifications.read", {}, "Read")
      : this.t("receptionist.notifications.unread", {}, "Unread");

    return `
      <div class="notification-item" style="background:#fff; padding:15px; margin-bottom:12px; border-radius:8px; border-${start}:4px solid ${isRead ? '#94a3b8' : '#0ea5e9'}; box-shadow:0 2px 4px rgba(0,0,0,0.05); opacity:${isRead ? '.78' : '1'};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:6px;">
          <strong style="display:block; color:#0f172a;">${this._escape(n.title || this.t("receptionist.notifications.defaultTitle", {}, "Notification"))}</strong>
          <span style="white-space:nowrap; color:${isRead ? '#16a34a' : '#d97706'}; background:${isRead ? '#dcfce7' : '#fef3c7'}; border:1px solid ${isRead ? '#bbf7d0' : '#fde68a'}; padding:4px 10px; border-radius:999px; font-size:.85rem; font-weight:700;">${status}</span>
        </div>
        <p style="margin:0; color:#334155; line-height:1.6;">${this._escape(n.message || "")}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:10px; flex-wrap:wrap;">
          <small style="color:#94a3b8; direction:ltr; text-align:${end};">${date}</small>
          ${action}
        </div>
      </div>
    `;
  }).join("");

  main.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
      <div>
        <h2 style="margin:0;">${this.t("receptionist.notifications.title", {}, "Notifications")}</h2>
        <small style="color:#64748b;">${this.t("receptionist.notifications.unreadCount", { count: unreadCount }, `${unreadCount} unread`)}</small>
      </div>
      ${unreadCount > 0 ? `<button type="button" id="receptionist-mark-all-notifications-read">${this.t("receptionist.notifications.markAllRead", {}, "Mark all as read")}</button>` : ""}
    </div>
    <div>${items}</div>
  `;
};

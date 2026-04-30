// js/roles/receptionist/tabs/notifications.js

ReceptionistUI.renderNotifications = function(notificationsData) {
  const main = document.getElementById("receptionist-main");
  
  // استخراج المصفوفة بأمان
  const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.data || []);

  if (!notifications || notifications.length === 0) {
    main.innerHTML = "<h2>الإشعارات</h2><p>لا توجد إشعارات جديدة.</p>";
    return;
  }

  const unreadCount = notifications.filter(n => !this._isNotificationRead(n)).length;
  const items = notifications.map(n => {
    const date = n.created_at ? new Date(n.created_at).toLocaleString("ar-DZ") : "تاريخ غير محدد";
    const isRead = this._isNotificationRead(n);
    const notificationId = this._getNotificationId(n);
    const action = isRead
      ? `<span style="color:#16a34a; font-weight:700;">مقروء</span>`
      : notificationId !== null
        ? `<button type="button" class="receptionist-mark-notification-read" data-notification-id="${this._escape(notificationId)}" style="background:#0ea5e9; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">تعيين كمقروء</button>`
        : `<span style="color:#64748b; font-weight:700;">غير متاح</span>`;

    return `
      <div class="notification-item" style="background:#fff; padding:15px; margin-bottom:12px; border-radius:8px; border-right:4px solid ${isRead ? '#94a3b8' : '#0ea5e9'}; box-shadow:0 2px 4px rgba(0,0,0,0.05); opacity:${isRead ? '.78' : '1'};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:6px;">
          <strong style="display:block; color:#0f172a;">${this._escape(n.title || "إشعار")}</strong>
          <span style="white-space:nowrap; color:${isRead ? '#16a34a' : '#d97706'}; background:${isRead ? '#dcfce7' : '#fef3c7'}; border:1px solid ${isRead ? '#bbf7d0' : '#fde68a'}; padding:4px 10px; border-radius:999px; font-size:.85rem; font-weight:700;">${isRead ? 'مقروء' : 'غير مقروء'}</span>
        </div>
        <p style="margin:0; color:#334155; line-height:1.6;">${this._escape(n.message || "")}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:10px; flex-wrap:wrap;">
          <small style="color:#94a3b8; direction:ltr; text-align:right;">${date}</small>
          ${action}
        </div>
      </div>
    `;
  }).join("");

  main.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
      <div>
        <h2 style="margin:0;">الإشعارات</h2>
        <small style="color:#64748b;">${unreadCount} إشعار غير مقروء</small>
      </div>
      ${unreadCount > 0 ? '<button type="button" id="receptionist-mark-all-notifications-read" style="background:#0f172a; color:white; border:none; padding:10px 14px; border-radius:8px; cursor:pointer; font-weight:700;">تعيين الكل كمقروء</button>' : ''}
    </div>
    <div>${items}</div>
  `;
};

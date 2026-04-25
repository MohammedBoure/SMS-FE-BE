// js/roles/receptionist/tabs/notifications.js

ReceptionistUI.renderNotifications = function(notificationsData) {
  const main = document.getElementById("receptionist-main");
  
  // استخراج المصفوفة بأمان
  const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.data || []);

  if (!notifications || notifications.length === 0) {
    main.innerHTML = "<h2>الإشعارات</h2><p>لا توجد إشعارات جديدة.</p>";
    return;
  }
  const items = notifications.map(n => `
    <div class="notification-item">
      <strong>${this._escape(n.title)}</strong>
      <p>${this._escape(n.message)}</p>
    </div>
  `).join("");
  main.innerHTML = `<h2>الإشعارات</h2><div>${items}</div>`;
};
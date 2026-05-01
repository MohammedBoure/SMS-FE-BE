// frontend/js/roles/admin/tabs/notifications.js

/**
 * واجهة إدارة الإشعارات (النسخة الاحترافية)
 * تتيح إرسال التنبيهات، والبحث المتقدم، وفلترة الرسائل المرسلة لتسوية وضعيتها
 */
AdminUI.renderNotificationsTab = function(response) {
    const main = this.prepareMain("إدارة التنبيهات والإشعارات");
    
    // خوارزمية استخراج مصفوفة الإشعارات
    let notifications = [];
    if (Array.isArray(response)) {
        notifications = response;
    } else if (response && Array.isArray(response.data)) {
        notifications = response.data;
    } else if (response && response.data && Array.isArray(response.data.data)) {
        notifications = response.data.data;
    } else if (response && typeof response === 'object') {
        const possibleArray = Object.values(response).find(val => Array.isArray(val));
        if (possibleArray) notifications = possibleArray;
        else notifications = [response];
    }

    notifications = notifications.filter(n => n && (n.id || n.notification_id));
    
    // تخزين الإشعارات محلياً لتشغيل البحث المتقدم السريع
    window.currentNotificationsData = notifications;

    // 1. حساب الإحصائيات
    const totalSent = notifications.length;
    const readCount = notifications.filter(n => n.is_read).length;
    const unreadCount = totalSent - readCount;

    // 2. إحصائيات علوية
    const statsHtml = `
        <div class="admin-responsive-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #f59e0b;">
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">إجمالي الإشعارات المرسلة</div>
                <div style="font-size: 1.8em; font-weight: bold; color: #b45309; margin-top: 5px;">${totalSent}</div>
            </div>
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #10b981;">
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">تمت قراءتها (استلمها المستخدم)</div>
                <div style="font-size: 1.8em; font-weight: bold; color: #16a34a; margin-top: 5px;">${readCount}</div>
            </div>
            <div style="background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #ef4444;">
                <div style="color: #64748b; font-size: 0.9em; font-weight: bold;">غير مقروءة (قيد الانتظار)</div>
                <div style="font-size: 1.8em; font-weight: bold; color: #dc2626; margin-top: 5px;">${unreadCount}</div>
            </div>
        </div>
    `;

    // 3. قسم إرسال إشعار جديد
    const sendFormHtml = `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 25px; margin-bottom: 25px; border: 1px solid #e2e8f0; border-top: 5px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #0f172a; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                <span>📢</span> إرسال تنبيه أو إشعار جديد
            </h3>
            <form id="send-notification-form" onsubmit="AdminUI.handleSendNotification(event)">
                <div class="admin-responsive-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">الجمهور المستهدف *</label>
                        <select id="notif-target" onchange="AdminUI.toggleNotifTargetInput()" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #f8fafc; font-weight: bold;">
                            <option value="single">مستخدم فردي (بواسطة الاسم)</option>
                            <option value="student">جميع الطلاب</option>
                            <option value="teacher">جميع الأساتذة</option>
                            <option value="parent">جميع أولياء الأمور</option>
                            <option value="all">جميع مستخدمي النظام 🌐</option>
                        </select>
                    </div>
                    
                    <div id="notif-single-user-container" style="position: relative;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">ابحث عن المستخدم *</label>
                        <input type="text" id="notif-user-search" placeholder="اكتب اسم المستخدم للبحث..." required style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none;" onkeyup="AdminUI.searchUserForNotif(this.value)">
                        <input type="hidden" id="notif-user-id">
                        <div id="notif-user-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 150px; overflow-y: auto; z-index: 10; margin-top: 5px;"></div>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">عنوان الإشعار *</label>
                    <input type="text" id="notif-title" required placeholder="مثال: تذكير بموعد استحقاق الرسوم..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">محتوى الرسالة *</label>
                    <textarea id="notif-message" required rows="4" placeholder="اكتب تفاصيل الإشعار هنا..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none; resize: vertical;"></textarea>
                </div>

                <div class="admin-mobile-stack" style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" onclick="document.getElementById('send-notification-form').reset(); AdminUI.toggleNotifTargetInput();" style="background: #f1f5f9; color: #475569; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        تفريغ الحقول
                    </button>
                    <button type="submit" id="notif-submit-btn" style="background: #f59e0b; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(245,158,11,0.2);">
                        إرسال الإشعار 🚀
                    </button>
                </div>
            </form>
        </div>
    `;

    // 4. شريط البحث والفلترة المتقدم (جديد)
    const filterHtml = `
        <div class="admin-page-toolbar" style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div class="admin-mobile-stack" style="display: flex; align-items: center; gap: 8px;">
                <label style="font-weight: bold; color: #334155;">حالة القراءة:</label>
                <select id="notif-status-filter" onchange="AdminUI.filterLocalNotifications()" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-weight: bold; outline: none;">
                    <option value="all">الكل</option>
                    <option value="read">المقروءة فقط ✅</option>
                    <option value="unread">غير المقروءة ⏳</option>
                </select>
            </div>
            <div class="admin-toolbar-search" style="flex: 1; min-width: 250px;">
                <input type="text" id="notif-search-input" placeholder="بحث في الإشعارات (المستلم، العنوان، المحتوى)..." onkeyup="AdminUI.filterLocalNotifications()" style="width: 100%; padding: 10px 15px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; font-weight: bold; box-sizing: border-box;">
            </div>
            <div class="admin-mobile-stack" style="display: flex; gap: 10px;">
                <button onclick="AdminUI.clearOldNotifications()" style="background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s;" title="إزالة الإشعارات التي مر عليها شهر">
                    🧹 تنظيف السجل (30 يوم)
                </button>
                <button onclick="AdminRole.loadSection('notifications')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s;">🔄 تحديث</button>
            </div>
        </div>
    `;

    main.innerHTML = statsHtml + sendFormHtml + filterHtml + `<div id="notifications-table-container">${this._generateNotificationsTableHtml(notifications)}</div>`;

    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('notif-user-dropdown');
        const searchInput = document.getElementById('notif-user-search');
        if (dropdown && e.target !== searchInput && e.target !== dropdown) {
            dropdown.style.display = 'none';
        }
    });
};

/**
 * دالة بناء جدول الإشعارات (مفصول ليدعم البحث الفوري)
 */
AdminUI._generateNotificationsTableHtml = function(notifications) {
    if (!notifications || notifications.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                <span style="font-size: 4em; opacity: 0.5;">📭</span>
                <p style="color: #64748b; font-size: 1.1em; margin-top: 15px; font-weight: bold;">لا توجد إشعارات سابقة أو مطابقة للبحث.</p>
            </div>
        `;
    }

    const rows = notifications.map(n => `
        <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s; opacity: ${n.is_read ? '0.7' : '1'};" onmouseover="this.style.opacity='1'; this.style.background='#f8fafc'" onmouseout="this.style.opacity='${n.is_read ? '0.7' : '1'}'; this.style.background='transparent'">
            <td style="padding: 15px; font-weight: bold; color: #64748b;">#${n.id || n.notification_id}</td>
            <td style="padding: 15px;">
                <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(n.full_name || "مستخدم #" + n.user_id)}</div>
                <small style="color: #64748b;">ID: ${n.user_id}</small>
            </td>
            <td style="padding: 15px; max-width: 350px;">
                <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(n.title)}</div>
                <div style="color: #475569; font-size: 0.9em; margin-top: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${this._escape(n.message)}">
                    ${this._escape(n.message)}
                </div>
            </td>
            <td style="padding: 15px;">
                <span style="display: inline-block; color: ${n.is_read ? '#16a34a' : '#d97706'}; font-weight: bold; background: ${n.is_read ? '#dcfce7' : '#fef3c7'}; border: 1px solid ${n.is_read ? '#bbf7d0' : '#fde68a'}; padding: 6px 12px; border-radius: 20px; font-size: 0.85em;">
                    ${n.is_read ? '✅ مقروء' : '⏳ غير مقروء'}
                </span>
            </td>
            <td style="padding: 15px; color: #475569; font-weight: bold; direction: ltr; text-align: right;">
                ${n.created_at ? new Date(n.created_at).toLocaleString('ar-DZ') : '-'}
            </td>
            <td style="padding: 15px; text-align: left;">
                <button onclick="AdminRole.deleteItem('/notifications', ${n.id || n.notification_id}, 'notifications')" title="إزالة الإشعار" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s; font-weight: bold;">🗑️ إزالة</button>
            </td>
        </tr>
    `).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 2px solid #cbd5e1; font-weight: bold; color: #334155;">
                النتائج المعروضة: ${notifications.length} إشعار
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">المستلم</th>
                            <th style="padding: 15px; color: #334155;">العنوان والمحتوى</th>
                            <th style="padding: 15px; color: #334155;">حالة الاستلام</th>
                            <th style="padding: 15px; color: #334155;">تاريخ الإرسال</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">تسوية (إزالة)</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

// ==========================================
// وظائف البحث والفلترة المتقدمة للإشعارات
// ==========================================

AdminUI.filterLocalNotifications = function() {
    const keyword = document.getElementById("notif-search-input").value.toLowerCase().trim();
    const statusFilter = document.getElementById("notif-status-filter").value;
    
    const allNotifs = window.currentNotificationsData || [];
    
    const filtered = allNotifs.filter(n => {
        // 1. فلترة حسب الحالة
        let matchStatus = true;
        if (statusFilter === 'read') matchStatus = n.is_read === 1 || n.is_read === true;
        if (statusFilter === 'unread') matchStatus = n.is_read === 0 || n.is_read === false;
        
        // 2. فلترة حسب النص المستهدف
        const name = (n.full_name || "").toLowerCase();
        const title = (n.title || "").toLowerCase();
        const message = (n.message || "").toLowerCase();
        const matchKeyword = name.includes(keyword) || title.includes(keyword) || message.includes(keyword) || String(n.user_id).includes(keyword);

        return matchStatus && matchKeyword;
    });

    document.getElementById("notifications-table-container").innerHTML = this._generateNotificationsTableHtml(filtered);
};


// ==========================================
// وظائف إرسال وإدارة الإشعارات
// ==========================================

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
        const users = response.data || response || [];

        if (users.length === 0) {
            dropdown.innerHTML = `<div style="padding: 10px; color: #64748b; text-align: center;">لا توجد نتائج</div>`;
        } else {
            dropdown.innerHTML = users.map(u => `
                <div onclick="AdminUI.selectUserForNotif(${u.id}, '${this._escape(u.full_name)}')" 
                     style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s;" 
                     onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                    <strong style="color: #0f172a;">${this._escape(u.full_name)}</strong> 
                    <small style="color: #64748b; float: left;">(${u.role_name || 'مستخدم'})</small>
                </div>
            `).join("");
        }
        dropdown.style.display = "block";
    } catch (err) {
        console.error("فشل البحث عن المستخدم:", err);
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

    if (!title || !message) {
        this.showToast("❌ يرجى إدخال عنوان ومحتوى للإشعار.", "error");
        return;
    }

    btn.disabled = true;
    btn.innerText = "جاري الإرسال... ⏳";

    try {
        if (targetType === "single") {
            const userId = document.getElementById("notif-user-id").value;
            if (!userId) {
                this.showToast("❌ يرجى البحث واختيار المستخدم المستهدف من القائمة.", "error");
                btn.disabled = false;
                btn.innerText = "إرسال الإشعار 🚀";
                return;
            }

            await Api.post("/notifications/", {
                user_id: parseInt(userId),
                title: title,
                message: message
            });
            this.showToast("✅ تم إرسال الإشعار للمستخدم بنجاح.");
        } else {
            // جلب أقصى عدد ممكن من المستخدمين بناء على الفئة
            let endpoint = `/users/?limit=1000`; 
            if (targetType !== "all") {
                endpoint += `&role_name=${targetType}`;
            }

            const usersRes = await Api.get(endpoint);
            let users = [];
            if (Array.isArray(usersRes)) users = usersRes;
            else if (usersRes && Array.isArray(usersRes.data)) users = usersRes.data;

            const usersToNotify = users.map(u => u.id || u.user_id).filter(id => id);

            if (usersToNotify.length === 0) {
                this.showToast(`❌ لا يوجد مستخدمين في فئة (${targetType}) لإرسال الإشعار إليهم.`, "error");
                btn.disabled = false;
                btn.innerText = "إرسال الإشعار 🚀";
                return;
            }

            if (!confirm(`سيتم إرسال هذا الإشعار الجماعي إلى ${usersToNotify.length} مستخدم. هل ترغب في المتابعة؟`)) {
                btn.disabled = false;
                btn.innerText = "إرسال الإشعار 🚀";
                return;
            }

            await Api.post("/notifications/bulk", {
                user_ids: usersToNotify,
                title: title,
                message: message
            });
            this.showToast(`✅ تم إرسال الإشعار بنجاح إلى ${usersToNotify.length} مستخدم.`);
        }

        document.getElementById("send-notification-form").reset();
        document.getElementById("notif-user-id").value = "";
        document.getElementById("notif-user-search").value = "";
        AdminUI.toggleNotifTargetInput();
        AdminRole.loadSection("notifications");

    } catch (err) {
        this.showToast("❌ فشل الإرسال: " + (err.message || "تأكد من الاتصال بالخادم."), "error");
        btn.disabled = false;
        btn.innerText = "إرسال الإشعار 🚀";
    }
};

AdminUI.clearOldNotifications = async function() {
    if (!confirm("⚠️ هل أنت متأكد من رغبتك في تنظيف السجل وإزالة الإشعارات المقروءة القديمة؟\n(لا يمكن التراجع)")) return;
    
    try {
        const result = await Api.delete("/notifications/old?days_old=30");
        this.showToast("✅ " + (result.message || "تم إزالة الإشعارات القديمة وتحديث السجل."));
        AdminRole.loadSection("notifications");
    } catch (err) {
        this.showToast("❌ فشل في تنظيف السجل: " + err.message, "error");
    }
};

if(!AdminUI.showToast) {
    AdminUI.showToast = function(message, type = "success") {
        const toast = document.createElement("div");
        toast.innerText = message;
        const bgColor = type === "error" ? "#dc2626" : "#0f172a";
        toast.style.cssText = `position: fixed; bottom: 20px; left: 20px; background: ${bgColor}; color: white; padding: 12px 25px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-weight: bold; transition: opacity 0.5s;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '0', 2500);
        setTimeout(() => toast.remove(), 3000);
    };
}

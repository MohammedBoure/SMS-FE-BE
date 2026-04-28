// frontend/js/roles/admin/tabs/notifications.js

/**
 * واجهة إدارة الإشعارات (المنفردة والجماعية)
 * تتيح إرسال التنبيهات المباشرة للمستخدمين ومراقبة سجل الإشعارات المرسلة
 */
AdminUI.renderNotificationsTab = function(response) {
    const main = this.prepareMain("إدارة التنبيهات والإشعارات");
    const notifications = response.data || response || [];

    // 1. قسم إرسال إشعار جديد (النصف العلوي)
    const sendFormHtml = `
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 25px; border-right: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #b45309; display: flex; align-items: center; gap: 8px;">
                <span>📢</span> إرسال إشعار جديد
            </h3>
            <form id="send-notification-form" onsubmit="AdminUI.handleSendNotification(event)">
                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 15px;">
                    <div style="flex: 1; min-width: 250px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">الجمهور المستهدف *</label>
                        <select id="notif-target" onchange="AdminUI.toggleNotifTargetInput()" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc;">
                            <option value="single">مستخدم فردي (بواسطة المعرف)</option>
                            <option value="student">جميع الطلاب</option>
                            <option value="teacher">جميع المعلمين</option>
                            <option value="parent">جميع أولياء الأمور</option>
                            <option value="all">جميع مستخدمي النظام</option>
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 250px;" id="notif-single-user-container">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">رقم المستخدم (User ID) *</label>
                        <input type="number" id="notif-user-id" placeholder="مثال: 105" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">عنوان الإشعار *</label>
                    <input type="text" id="notif-title" required placeholder="مثال: تذكير بموعد الامتحانات" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">محتوى الرسالة *</label>
                    <textarea id="notif-message" required rows="3" placeholder="اكتب تفاصيل الإشعار هنا..." style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; resize: vertical;"></textarea>
                </div>

                <div style="text-align: left;">
                    <button type="submit" id="notif-submit-btn" style="background: #f59e0b; color: white; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                        إرسال الإشعار 🚀
                    </button>
                </div>
            </form>
        </div>
    `;

    // 2. جدول سجل الإشعارات (النصف السفلي)
    let tableHtml = "";
    if (notifications.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 1.1em;">لا توجد إشعارات سابقة في السجل.</p>
            </div>
        `;
    } else {
        const rows = notifications.map(n => `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #0f172a;">#${n.id || n.notification_id}</td>
                <td style="padding: 15px; color: #0369a1; font-weight: bold;">
                    مستخدم #${n.user_id}
                </td>
                <td style="padding: 15px;">
                    <div style="font-weight: 600;">${this._escape(n.title)}</div>
                    <div style="color: #64748b; font-size: 0.9em; margin-top: 4px; max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${this._escape(n.message)}">
                        ${this._escape(n.message)}
                    </div>
                </td>
                <td style="padding: 15px;">
                    <span style="color: ${n.is_read ? '#166534' : '#b45309'}; font-weight: bold; background: ${n.is_read ? '#dcfce7' : '#fef3c7'}; padding: 4px 10px; border-radius: 20px; font-size: 0.85em;">
                        ${n.is_read ? 'مقروء' : 'غير مقروء'}
                    </span>
                </td>
                <td style="padding: 15px; text-align: left; direction: ltr;">
                    <small style="color: #64748b;">${n.created_at ? new Date(n.created_at).toLocaleString('ar-DZ') : '-'}</small>
                </td>
                <td style="padding: 15px; text-align: left;">
                    <button onclick="AdminRole.deleteItem('/notifications', ${n.id || n.notification_id}, 'notifications')" style="background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; padding: 6px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            </tr>
        `).join("");

        tableHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="padding: 15px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.1em; color: #0f172a;">📋 السجل التاريخي للإشعارات</h3>
                    <button onclick="AdminUI.clearOldNotifications()" style="background: white; border: 1px solid #cbd5e1; color: #475569; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">
                        تنظيف الإشعارات القديمة (أكثر من 30 يوم)
                    </button>
                </div>
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px;">ID</th>
                            <th style="padding: 15px;">المستلم</th>
                            <th style="padding: 15px;">العنوان والمحتوى</th>
                            <th style="padding: 15px;">الحالة</th>
                            <th style="padding: 15px; text-align: left;">تاريخ الإرسال</th>
                            <th style="padding: 15px; text-align: left;">حذف</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    main.innerHTML = sendFormHtml + tableHtml;
};

/**
 * دالة تفاعلية لإخفاء/إظهار حقل "رقم المستخدم" بناءً على اختيار الجمهور المستهدف
 */
AdminUI.toggleNotifTargetInput = function() {
    const target = document.getElementById("notif-target").value;
    const singleContainer = document.getElementById("notif-single-user-container");
    const userIdInput = document.getElementById("notif-user-id");

    if (target === "single") {
        singleContainer.style.display = "block";
        userIdInput.setAttribute("required", "true");
    } else {
        singleContainer.style.display = "none";
        userIdInput.removeAttribute("required");
    }
};

/**
 * معالجة نموذج إرسال الإشعار (يدعم الإرسال الفردي والجماعي Bulk)
 */
AdminUI.handleSendNotification = async function(event) {
    event.preventDefault();
    const btn = document.getElementById("notif-submit-btn");
    
    const targetType = document.getElementById("notif-target").value;
    const title = document.getElementById("notif-title").value;
    const message = document.getElementById("notif-message").value;

    btn.disabled = true;
    btn.innerText = "جاري المعالجة... ⏳";

    try {
        if (targetType === "single") {
            // مسار الإرسال الفردي
            const userId = document.getElementById("notif-user-id").value;
            await Api.post("/notifications/", {
                user_id: parseInt(userId),
                title: title,
                message: message
            });
            alert("تم إرسال الإشعار للمستخدم بنجاح.");
        } else {
            // مسار الإرسال الجماعي (Bulk)
            let usersToNotify = [];
            
            // جلب قائمة المستخدمين بناءً على الفئة لتصفية المعرفات (IDs)
            const roleFilter = targetType === "all" ? null : targetType;
            const usersData = await AdminServices.getUsers(roleFilter); // هذه الدالة موجودة في services.js
            const users = usersData.data || usersData || [];
            
            usersToNotify = users.map(u => u.id || u.user_id);

            if (usersToNotify.length === 0) {
                alert("لا يوجد مستخدمين في هذه الفئة لإرسال الإشعار إليهم.");
                btn.disabled = false;
                btn.innerText = "إرسال الإشعار 🚀";
                return;
            }

            // التأكيد المزدوج قبل الإرسال الجماعي
            if (!confirm(`سيتم إرسال هذا الإشعار إلى ${usersToNotify.length} مستخدم. هل أنت متأكد؟`)) {
                btn.disabled = false;
                btn.innerText = "إرسال الإشعار 🚀";
                return;
            }

            // إرسال المصفوفة للـ API المتخصص
            await Api.post("/notifications/bulk", {
                user_ids: usersToNotify,
                title: title,
                message: message
            });
            alert(`تم إرسال الإشعار الجماعي بنجاح إلى ${usersToNotify.length} مستخدم.`);
        }

        // مسح الحقول وإعادة تحميل القسم لتحديث الجدول
        document.getElementById("send-notification-form").reset();
        AdminUI.toggleNotifTargetInput(); // إعادة ضبط العرض
        AdminRole.loadSection("notifications");

    } catch (err) {
        alert("فشل الإرسال: " + err.message);
        btn.disabled = false;
        btn.innerText = "إرسال الإشعار 🚀";
    }
};

/**
 * دالة لتنظيف الإشعارات القديمة من قاعدة البيانات
 */
AdminUI.clearOldNotifications = async function() {
    if (!confirm("هل أنت متأكد من رغبتك في حذف جميع الإشعارات التي مر عليها أكثر من 30 يوماً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    
    try {
        const result = await Api.delete("/notifications/old?days_old=30");
        alert(result.message || "تم تنظيف السجل بنجاح.");
        AdminRole.loadSection("notifications");
    } catch (err) {
        alert("فشل في تنظيف السجل: " + err.message);
    }
};
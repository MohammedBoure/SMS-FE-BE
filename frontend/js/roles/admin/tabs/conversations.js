// frontend/js/roles/admin/tabs/conversations.js

/**
 * واجهة إدارة ومراقبة المحادثات
 * تتيح للمدير البحث عن مستخدم، استعراض صندوق الوارد الخاص به، وقراءة الرسائل المباشرة
 */
AdminUI.renderConversationsTab = async function() {
    const main = this.prepareMain("مراقبة المحادثات والرسائل المباشرة");

    // 1. شريط البحث عن المستخدمين
    const headerHtml = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #3b82f6;">
            <div>
                <h3 style="margin: 0; color: #1e40af;">بحث في سجلات التواصل</h3>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 0.9em;">ابحث عن أي مستخدم لاستعراض محادثاته وقراءة رسائله المباشرة.</p>
            </div>
            <div class="admin-toolbar-search" style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="conv-user-search" placeholder="ابحث باسم المستخدم..." style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; width: 250px;" onkeypress="if(event.key === 'Enter') AdminUI.searchChatUsers()">
                <button onclick="AdminUI.searchChatUsers()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    بحث 🔍
                </button>
            </div>
        </div>
    `;

    main.innerHTML = headerHtml + `
        <div id="conv-main-container">
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="font-size: 3em;">👥</span>
                <p style="color: #64748b; margin-top: 15px; font-size: 1.1em;">قم بالبحث عن مستخدم أو عرض القائمة لفتح صندوق المحادثات الخاص به.</p>
                <button onclick="AdminUI.loadInitialUsers()" style="margin-top: 15px; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 6px; cursor: pointer; color: #0f172a; font-weight: bold;">
                    عرض قائمة المستخدمين
                </button>
            </div>
        </div>
    `;
};

/**
 * جلب قائمة المستخدمين الافتراضية
 */
AdminUI.loadInitialUsers = async function() {
    const container = document.getElementById("conv-main-container");
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b;">جاري تحميل المستخدمين...</div>`;
    
    try {
        const response = await Api.get("/users");
        this.renderUserListForChat(response.data || response || []);
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">فشل تحميل المستخدمين: ${err.message}</div>`;
    }
};

/**
 * البحث عن مستخدمين لغرض الدردشة
 */
AdminUI.searchChatUsers = async function() {
    const keyword = document.getElementById("conv-user-search").value.trim();
    if (!keyword) return AdminUI.loadInitialUsers();

    const container = document.getElementById("conv-main-container");
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b;">جاري البحث...</div>`;

    try {
        const response = await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);
        this.renderUserListForChat(response.data || response || []);
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">فشل البحث: ${err.message}</div>`;
    }
};

/**
 * عرض جدول المستخدمين لتحديد من سنراقب محادثاته
 */
AdminUI.renderUserListForChat = function(users) {
    const container = document.getElementById("conv-main-container");

    if (users.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 30px; background: white; border-radius: 8px;">لا يوجد مستخدمين مطابقين للبحث.</div>`;
        return;
    }

    const rows = users.map(u => `
        <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px; font-weight: bold;">#${u.id}</td>
            <td style="padding: 15px;"><strong>${this._escape(u.full_name)}</strong></td>
            <td style="padding: 15px;">
                <span style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 20px; font-size: 0.85em;">
                    ${this._escape(u.role_name)}
                </span>
            </td>
            <td style="padding: 15px; text-align: left;">
                <button onclick="AdminUI.openUserInbox(${u.id}, '${this._escape(u.full_name)}')" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 5px; margin-left: 0; margin-right: auto;">
                    <span>💬</span> فتح المحادثات
                </button>
            </td>
        </tr>
    `).join("");

    container.innerHTML = `
        <div class="admin-mobile-table" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
                <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                    <tr>
                        <th style="padding: 15px;">المعرف</th>
                        <th style="padding: 15px;">المستخدم</th>
                        <th style="padding: 15px;">الرتبة</th>
                        <th style="padding: 15px; text-align: left;">إجراء</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
};

AdminUI._buildChatContacts = function(messages, mainUserId) {
    const userId = Number(mainUserId);
    const contactsMap = new Map();

    (messages || []).forEach(msg => {
        const senderId = Number(msg.sender_id);
        const receiverId = Number(msg.receiver_id);
        const contactId = senderId === userId ? receiverId : senderId;

        if (!contactId || contactId === userId) return;

        const contactName = senderId === userId
            ? (msg.receiver_name || `مستخدم #${contactId}`)
            : (msg.sender_name || `مستخدم #${contactId}`);
        const createdAt = msg.created_at || msg.timestamp || "";
        const existing = contactsMap.get(contactId);

        if (!existing || new Date(createdAt || 0) > new Date(existing.created_at || 0)) {
            contactsMap.set(contactId, {
                contact_id: contactId,
                contact_name: contactName,
                last_message: msg.content || msg.last_message || "...",
                created_at: createdAt
            });
        }
    });

    return Array.from(contactsMap.values())
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
};

/**
 * فتح صندوق الوارد (Inbox) لمستخدم معين (يقسم الشاشة لقسمين)
 */
AdminUI.openUserInbox = async function(userId, userName) {
    const container = document.getElementById("conv-main-container");
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b;">جاري جلب صندوق الرسائل لـ ${userName}...</div>`;

    try {
        // الاتصال بمسار الـ Inbox من messages_api.py
        const inbox = await Api.get(`/messages/inbox/${userId}`);
        const inboxMessages = inbox.data || inbox || [];
        const contacts = this._buildChatContacts(inboxMessages, userId);

        // إعداد تصميم ثنائي الأعمدة (جهات الاتصال يميناً، والمحادثة يساراً)
        const layoutHtml = `
            <div style="margin-bottom: 15px;">
                <button onclick="AdminUI.loadInitialUsers()" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 15px; border-radius: 6px; cursor: pointer;">
                    ⬅️ العودة لقائمة المستخدمين
                </button>
            </div>
            <div class="admin-conversation-layout" style="display: flex; gap: 20px; height: 600px;">
                
                <div class="admin-conversation-contacts" style="width: 300px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="padding: 15px; background: #1e40af; color: white; font-weight: bold;">
                        صندوق الوارد: ${userName}
                    </div>
                    <div style="flex: 1; overflow-y: auto; padding: 10px;" id="inbox-contacts-list">
                        ${contacts.length === 0 ? '<p style="text-align:center; color:#64748b; margin-top:20px;">لا توجد محادثات سابقة.</p>' : ''}
                        ${contacts.map(c => `
                            <div onclick="AdminUI.loadChatHistory(${userId}, ${c.contact_id}, '${this._escape(userName)}', '${this._escape(c.contact_name)}')" 
                                 style="padding: 12px; border-bottom: 1px solid #e2e8f0; cursor: pointer; border-radius: 6px; transition: background 0.2s;" 
                                 onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                <div style="font-weight: bold; color: #0f172a;">${this._escape(c.contact_name)}</div>
                                <div style="font-size: 0.8em; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${this._escape(c.last_message || '...')}
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div class="admin-conversation-chat" style="flex: 1; background: #f8fafc; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; border: 1px solid #e2e8f0; overflow: hidden;">
                    <div id="chat-header" style="padding: 15px; background: white; border-bottom: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">
                        اختر محادثة من القائمة لعرض التفاصيل
                    </div>
                    <div id="chat-messages-area" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
                        <div style="text-align: center; color: #94a3b8; margin-top: 150px;">
                            <span style="font-size: 3em;">💬</span>
                            <p>المحادثة ستظهر هنا.</p>
                        </div>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = layoutHtml;

    } catch (err) {
        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <button onclick="AdminUI.loadInitialUsers()" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 15px; border-radius: 6px; cursor: pointer;">العودة</button>
            </div>
            <div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">فشل جلب صندوق الوارد: ${err.message}</div>`;
    }
};

/**
 * جلب وعرض الرسائل بين مستخدمين اثنين (يعرض في القسم الأيسر)
 */
AdminUI.loadChatHistory = async function(mainUserId, contactId, mainUserName, contactName) {
    const header = document.getElementById("chat-header");
    const area = document.getElementById("chat-messages-area");

    if (!contactId || Number.isNaN(Number(contactId))) {
        area.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 10px; border-radius: 6px;">تعذر تحديد طرف المحادثة.</div>`;
        return;
    }

    header.innerHTML = `محادثة بين: <span style="color:#1d4ed8;">${mainUserName}</span> و <span style="color:#059669;">${contactName}</span>`;
    area.innerHTML = `<div style="text-align:center; color: #64748b; margin-top: 20px;">جاري تحميل الرسائل...</div>`;

    try {
        // الاتصال بمسار المحادثة الثنائية من messages_api.py
        const response = await Api.get(`/messages/conversation/${mainUserId}/${contactId}`);
        const messages = response.data || response || [];

        if (messages.length === 0) {
            area.innerHTML = `<div style="text-align:center; color: #64748b; margin-top: 20px;">لا توجد رسائل مسجلة.</div>`;
            return;
        }

        // ترتيب الرسائل زمنياً (من الأقدم للأحدث)
        messages.sort((a, b) => new Date(a.created_at || a.timestamp) - new Date(b.created_at || b.timestamp));

        const bubblesHtml = messages.map(msg => {
            // التحقق من صاحب الرسالة لتحديد اتجاه ولون الفقاعة
            const isMainUser = Number(msg.sender_id) === Number(mainUserId);
            
            const align = isMainUser ? 'align-self: flex-start;' : 'align-self: flex-end;';
            const bg = isMainUser ? 'background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;' : 'background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;';
            const author = isMainUser ? mainUserName : contactName;

            return `
                <div style="max-width: 70%; padding: 10px 15px; border-radius: 12px; ${bg} ${align}">
                    <div style="font-size: 0.75em; opacity: 0.7; margin-bottom: 5px; font-weight: bold;">${author}</div>
                    <div style="line-height: 1.4;">${this._escape(msg.content)}</div>
                    <div style="font-size: 0.7em; opacity: 0.6; text-align: left; margin-top: 5px; direction: ltr;">
                        ${msg.created_at ? new Date(msg.created_at).toLocaleString('ar-DZ') : ''}
                    </div>
                </div>
            `;
        }).join("");

        area.innerHTML = bubblesHtml;
        
        // التمرير التلقائي لأسفل المحادثة (أحدث رسالة)
        area.scrollTop = area.scrollHeight;

    } catch (err) {
        area.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 10px; border-radius: 6px;">تعذر تحميل الرسائل: ${err.message}</div>`;
    }
};

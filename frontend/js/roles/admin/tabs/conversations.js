// frontend/js/roles/admin/tabs/conversations.js

AdminUI.conversationsT = function(key, params = {}, fallback = "") {
    return this.t(`admin.conversations.${key}`, params, fallback);
};

AdminUI.conversationInlineString = function(value) {
    return JSON.stringify(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.conversationDate = function(value) {
    if (!value) return "";
    const locale = window.I18n?.currentLang === "en" ? "en-US" : "ar-DZ";
    return new Date(value).toLocaleString(locale);
};

AdminUI.renderConversationsTab = async function() {
    const main = this.prepareMain(this.t("admin.sections.conversations", {}, "Live Conversations"));

    const headerHtml = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #3b82f6; gap: 16px; flex-wrap: wrap;">
            <div>
                <h3 style="margin: 0; color: #1e40af; display: flex; align-items: center; gap: 8px;">${this.icon("message", "inline-svg-icon")} ${this.conversationsT("toolbar.title", {}, "Search Communication Records")}</h3>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 0.9em;">${this.conversationsT("toolbar.description", {}, "Search for any user to review conversations and direct messages.")}</p>
            </div>
            <div class="admin-toolbar-search" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <input type="text" id="conv-user-search" placeholder="${this.conversationsT("toolbar.searchPlaceholder", {}, "Search by username...")}" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; width: min(250px, 100%);" onkeypress="if(event.key === 'Enter') AdminUI.searchChatUsers()">
                <button onclick="AdminUI.searchChatUsers()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 8px;">
                    ${this.icon("search", "inline-svg-icon")} ${this.t("admin.actions.search", {}, "Search")}
                </button>
            </div>
        </div>
    `;

    main.innerHTML = headerHtml + `
        <div id="conv-main-container">
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="display: inline-flex; width: 56px; height: 56px; align-items: center; justify-content: center; color: #2563eb;">${this.icon("users", "inline-svg-icon")}</span>
                <p style="color: #64748b; margin-top: 15px; font-size: 1.1em;">${this.conversationsT("empty.description", {}, "Search for a user or show the list to open their conversation inbox.")}</p>
                <button onclick="AdminUI.loadInitialUsers()" style="margin-top: 15px; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 6px; cursor: pointer; color: #0f172a; font-weight: bold; display: inline-flex; align-items: center; gap: 8px;">
                    ${this.icon("users", "inline-svg-icon")} ${this.conversationsT("empty.showUsers", {}, "Show User List")}
                </button>
            </div>
        </div>
    `;
};

AdminUI.loadInitialUsers = async function() {
    const container = document.getElementById("conv-main-container");
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b;">${this.conversationsT("users.loading", {}, "Loading users...")}</div>`;

    try {
        const response = await Api.get("/users");
        this.renderUserListForChat(response.data || response || []);
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">${this.conversationsT("users.loadFailed", { message: err.message }, `Failed to load users: ${err.message}`)}</div>`;
    }
};

AdminUI.searchChatUsers = async function() {
    const keyword = document.getElementById("conv-user-search").value.trim();
    if (!keyword) return AdminUI.loadInitialUsers();

    const container = document.getElementById("conv-main-container");
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b;">${this.conversationsT("users.searching", {}, "Searching...")}</div>`;

    try {
        const response = await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);
        this.renderUserListForChat(response.data || response || []);
    } catch (err) {
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">${this.conversationsT("users.searchFailed", { message: err.message }, `Search failed: ${err.message}`)}</div>`;
    }
};

AdminUI.renderUserListForChat = function(users) {
    const container = document.getElementById("conv-main-container");

    if (users.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 30px; background: white; border-radius: 8px;">${this.conversationsT("users.empty", {}, "No users match the search.")}</div>`;
        return;
    }

    const rows = users.map(u => {
        const userNameArg = this.conversationInlineString(u.full_name);
        return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold;">#${u.id}</td>
                <td style="padding: 15px;"><strong>${this._escape(u.full_name)}</strong></td>
                <td style="padding: 15px;">
                    <span style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 20px; font-size: 0.85em;">
                        ${this._escape(u.role_name)}
                    </span>
                </td>
                <td style="padding: 15px; text-align: left;">
                    <button onclick="AdminUI.openUserInbox(${u.id}, ${userNameArg})" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 5px; margin-left: 0; margin-right: auto;">
                        ${this.icon("message", "inline-svg-icon")} ${this.conversationsT("users.open", {}, "Open Conversations")}
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    container.innerHTML = `
        <div class="admin-mobile-table" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
                <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                    <tr>
                        <th style="padding: 15px;">${this.conversationsT("users.table.id", {}, "ID")}</th>
                        <th style="padding: 15px;">${this.conversationsT("users.table.user", {}, "User")}</th>
                        <th style="padding: 15px;">${this.conversationsT("users.table.role", {}, "Role")}</th>
                        <th style="padding: 15px; text-align: left;">${this.conversationsT("users.table.action", {}, "Action")}</th>
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
            ? (msg.receiver_name || this.conversationsT("inbox.userFallback", { id: contactId }, `User #${contactId}`))
            : (msg.sender_name || this.conversationsT("inbox.userFallback", { id: contactId }, `User #${contactId}`));
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

AdminUI.openUserInbox = async function(userId, userName) {
    const container = document.getElementById("conv-main-container");
    const safeUserName = this._escape(userName);
    container.innerHTML = `<div style="text-align:center; padding: 40px; color: #64748b;">${this.conversationsT("inbox.loading", { name: safeUserName }, `Fetching inbox for ${safeUserName}...`)}</div>`;

    try {
        const inbox = await Api.get(`/messages/inbox/${userId}`);
        const inboxMessages = inbox.data || inbox || [];
        const contacts = this._buildChatContacts(inboxMessages, userId);
        const userArg = this.conversationInlineString(userName);

        const layoutHtml = `
            <div style="margin-bottom: 15px;">
                <button onclick="AdminUI.loadInitialUsers()" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 15px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                    ${this.icon("panelOpen", "inline-svg-icon")} ${this.conversationsT("inbox.backToUsers", {}, "Back to User List")}
                </button>
            </div>
            <div class="admin-conversation-layout" style="display: flex; gap: 20px; height: 600px;">
                <div class="admin-conversation-contacts" style="width: 300px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="padding: 15px; background: #1e40af; color: white; font-weight: bold;">
                        ${this.conversationsT("inbox.title", { name: safeUserName }, `Inbox: ${safeUserName}`)}
                    </div>
                    <div style="flex: 1; overflow-y: auto; padding: 10px;" id="inbox-contacts-list">
                        ${contacts.length === 0 ? `<p style="text-align:center; color:#64748b; margin-top:20px;">${this.conversationsT("inbox.noPrevious", {}, "No previous conversations.")}</p>` : ""}
                        ${contacts.map(c => {
                            const contactArg = this.conversationInlineString(c.contact_name);
                            return `
                                <div onclick="AdminUI.loadChatHistory(${userId}, ${c.contact_id}, ${userArg}, ${contactArg})"
                                     style="padding: 12px; border-bottom: 1px solid #e2e8f0; cursor: pointer; border-radius: 6px; transition: background 0.2s;"
                                     onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                    <div style="font-weight: bold; color: #0f172a;">${this._escape(c.contact_name)}</div>
                                    <div style="font-size: 0.8em; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        ${this._escape(c.last_message || "...")}
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>

                <div class="admin-conversation-chat" style="flex: 1; background: #f8fafc; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; border: 1px solid #e2e8f0; overflow: hidden;">
                    <div id="chat-header" style="padding: 15px; background: white; border-bottom: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">
                        ${this.conversationsT("chat.chooseConversation", {}, "Choose a conversation from the list to view details")}
                    </div>
                    <div id="chat-messages-area" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
                        <div style="text-align: center; color: #94a3b8; margin-top: 150px;">
                            <span style="display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center;">${this.icon("message", "inline-svg-icon")}</span>
                            <p>${this.conversationsT("chat.placeholder", {}, "The conversation will appear here.")}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = layoutHtml;
    } catch (err) {
        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <button onclick="AdminUI.loadInitialUsers()" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 15px; border-radius: 6px; cursor: pointer;">${this.conversationsT("inbox.back", {}, "Back")}</button>
            </div>
            <div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px;">${this.conversationsT("inbox.loadFailed", { message: err.message }, `Failed to fetch inbox: ${err.message}`)}</div>`;
    }
};

AdminUI.loadChatHistory = async function(mainUserId, contactId, mainUserName, contactName) {
    const header = document.getElementById("chat-header");
    const area = document.getElementById("chat-messages-area");

    if (!contactId || Number.isNaN(Number(contactId))) {
        area.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 10px; border-radius: 6px;">${this.conversationsT("chat.invalidContact", {}, "Unable to identify the other conversation participant.")}</div>`;
        return;
    }

    header.innerHTML = `${this.conversationsT("chat.conversationBetween", {}, "Conversation between:")} <span style="color:#1d4ed8;">${this._escape(mainUserName)}</span> <span style="color:#64748b;">/</span> <span style="color:#059669;">${this._escape(contactName)}</span>`;
    area.innerHTML = `<div style="text-align:center; color: #64748b; margin-top: 20px;">${this.conversationsT("chat.loadingMessages", {}, "Loading messages...")}</div>`;

    try {
        const response = await Api.get(`/messages/conversation/${mainUserId}/${contactId}`);
        const messages = response.data || response || [];

        if (messages.length === 0) {
            area.innerHTML = `<div style="text-align:center; color: #64748b; margin-top: 20px;">${this.conversationsT("chat.emptyMessages", {}, "No messages recorded.")}</div>`;
            return;
        }

        messages.sort((a, b) => new Date(a.created_at || a.timestamp) - new Date(b.created_at || b.timestamp));

        const bubblesHtml = messages.map(msg => {
            const isMainUser = Number(msg.sender_id) === Number(mainUserId);
            const align = isMainUser ? "align-self: flex-start;" : "align-self: flex-end;";
            const bg = isMainUser
                ? "background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;"
                : "background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;";
            const author = isMainUser ? mainUserName : contactName;
            const createdAt = msg.created_at || msg.timestamp || "";

            return `
                <div style="max-width: 70%; padding: 10px 15px; border-radius: 12px; ${bg} ${align}">
                    <div style="font-size: 0.75em; opacity: 0.7; margin-bottom: 5px; font-weight: bold;">${this._escape(author)}</div>
                    <div style="line-height: 1.4;">${this._escape(msg.content)}</div>
                    <div style="font-size: 0.7em; opacity: 0.6; text-align: left; margin-top: 5px; direction: ltr;">
                        ${this.conversationDate(createdAt)}
                    </div>
                </div>
            `;
        }).join("");

        area.innerHTML = bubblesHtml;
        area.scrollTop = area.scrollHeight;
    } catch (err) {
        area.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 10px; border-radius: 6px;">${this.conversationsT("chat.messagesLoadFailed", { message: err.message }, `Unable to load messages: ${err.message}`)}</div>`;
    }
};

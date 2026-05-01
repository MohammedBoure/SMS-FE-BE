// js/roles/accountant/ui.js

const AccountantUI = {
  SECTIONS: ["students", "fees", "payments", "transactions", "search", "attendance", "messages", "notifications"],
  _currentUserId: null,
  _activeMessageContact: null,

  renderHeader(session) {
    const header = document.getElementById("accountant-header");
    const languages = window.I18n
      ? I18n.getLanguages()
      : [{ code: "ar", label: "Arabic", dir: "rtl" }, { code: "en", label: "English", dir: "ltr" }];
    const activeLang = window.I18n ? I18n.currentLang : "ar";
    const options = languages.map(lang => `
      <option value="${this._escapeAttr(lang.code)}" dir="${this._escapeAttr(lang.dir || "auto")}" ${lang.code === activeLang ? "selected" : ""}>
        ${this._escape(lang.label)}
      </option>
    `).join("");

    header.innerHTML = `
      <div class="accountant-topbar">
        <div class="accountant-brand">
          <div class="accountant-brand-mark" aria-hidden="true">DZD</div>
          <div>
            <h1>${this.t("accountant.brand.title", {}, "Accounting and Finance Office")}</h1>
            <small>${this.t("accountant.brand.userId", { id: session.user_id }, `ID: #${session.user_id}`)}</small>
          </div>
        </div>
        <div class="accountant-topbar-actions">
          <label class="accountant-language-control">
            <span>${this.t("accountant.language.label", {}, "Language")}</span>
            <select id="accountant-language-select" aria-label="${this._escapeAttr(this.t("accountant.language.select", {}, "Choose language"))}">
              ${options}
            </select>
          </label>
          <button type="button" class="accountant-theme-toggle" id="accountant-theme-toggle" aria-pressed="false">
            <span class="accountant-theme-indicator" aria-hidden="true"></span>
            <span class="accountant-theme-label">${this.t("accountant.theme.light", {}, "Light")}</span>
          </button>
          <button id="logout-btn" class="accountant-logout-btn">${this.t("accountant.auth.logout", {}, "Log out")}</button>
        </div>
      </div>
    `;

    document.getElementById("logout-btn")?.addEventListener("click", () => Auth.logout());
    this.initTheme();
    const languageSelect = document.getElementById("accountant-language-select");
    if (languageSelect && window.I18n) {
      languageSelect.addEventListener("change", async (event) => {
        languageSelect.disabled = true;
        await I18n.setLanguage(event.target.value);
        languageSelect.disabled = false;
      });
    }
  },

  initTheme() {
    const stored = window.AppPreferences
      ? AppPreferences.getTheme("accountant", document.documentElement.dataset.theme)
      : (localStorage.getItem("sms-theme") || localStorage.getItem("accountant-theme"));
    const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    this.applyTheme(stored || document.documentElement.dataset.theme || preferred);

    const toggle = document.getElementById("accountant-theme-toggle");
    if (!toggle || toggle.dataset.bound === "true") return;

    toggle.addEventListener("click", () => {
      const current = document.body.dataset.theme === "dark" ? "dark" : "light";
      this.applyTheme(current === "dark" ? "light" : "dark");
    });
    toggle.dataset.bound = "true";
  },

  applyTheme(theme) {
    const nextTheme = window.AppPreferences
      ? AppPreferences.applyTheme(theme, { scope: "accountant", persist: true })
      : (theme === "dark" ? "dark" : "light");
    if (!window.AppPreferences) {
      document.documentElement.dataset.theme = nextTheme;
      document.body.dataset.theme = nextTheme;
      localStorage.setItem("sms-theme", nextTheme);
      localStorage.setItem("accountant-theme", nextTheme);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", nextTheme === "dark" ? "#0b1220" : "#0f766e");
    }

    const toggle = document.getElementById("accountant-theme-toggle");
    if (!toggle) return;

    const isDark = nextTheme === "dark";
    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    const label = toggle.querySelector(".accountant-theme-label");
    if (label) {
      label.textContent = isDark
        ? this.t("accountant.theme.dark", {}, "Dark")
        : this.t("accountant.theme.light", {}, "Light");
    }
  },

  renderNav(activeSection) {
    const nav = document.getElementById("accountant-nav");
    nav.className = "accountant-nav";
    nav.style.cssText = "";

    nav.innerHTML = this.SECTIONS.map(section => {
      const isActive = activeSection === section;
      return `
        <button class="nav-btn accountant-nav-btn${isActive ? " is-active" : ""}" data-section="${section}" aria-current="${isActive ? "page" : "false"}">
          ${this._translate(section)}
        </button>
      `;
    }).join("");
  },

  renderLoading() {
    document.getElementById("accountant-main").innerHTML = `<h3 style="padding: 20px 5%; color: #10b981;">${this.t("accountant.state.loading", {}, "Loading financial data...")}</h3>`;
  },

  renderError(msg) {
    document.getElementById("accountant-main").innerHTML = `
      <h3 style="padding: 20px 5%; color: #ef4444;">
        ${this.t("accountant.state.errorPrefix", {}, "Error:")} ${this._escape(msg)}
      </h3>
    `;
  },

  showNotificationModal(userId, userName, contextMessage = "") {
    const existing = document.getElementById("notification-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "notification-modal";
    overlay.className = "accountant-modal-overlay";
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 2000; backdrop-filter: blur(4px); direction: ${this.dir()};`;

    overlay.innerHTML = `
      <div class="accountant-modal-dialog accountant-notification-dialog" style="background: white; width: 90%; max-width: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <div class="accountant-modal-header accountant-modal-header-warning" style="background: #eab308; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          <h3 style="margin: 0;">${this.t("accountant.notificationModal.title", { name: this._escape(userName) }, "Send notification")}</h3>
          <button id="close-notif-modal" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <form id="send-notification-form" data-user-id="${this._escapeAttr(userId)}" style="padding: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #475569;">${this.t("accountant.notificationModal.titleLabel", {}, "Notification title:")}</label>
          <input type="text" id="notif-title" required value="${this._escapeAttr(this.t("accountant.notificationModal.defaultTitle", {}, "Notification from the finance office"))}" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 15px; box-sizing: border-box;" />

          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #475569;">${this.t("accountant.notificationModal.messageLabel", {}, "Message text:")}</label>
          <textarea id="notif-message" required rows="4" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 20px; box-sizing: border-box; font-family: inherit;">${this._escape(contextMessage)}</textarea>

          <div style="display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
            <button type="button" id="cancel-notif" style="padding: 10px 15px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer; font-family: inherit;">${this.t("accountant.notificationModal.cancel", {}, "Cancel")}</button>
            <button type="submit" style="padding: 10px 20px; background: #eab308; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; font-family: inherit;">${this.t("accountant.notificationModal.submit", {}, "Send notification")}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById("close-notif-modal").onclick = () => overlay.remove();
    document.getElementById("cancel-notif").onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  },

  renderPagination(page, total, limit, section) {
    const totalPages = Math.ceil(total / limit) || 1;
    if (totalPages <= 1) return "";

    const previousDisabled = page <= 1;
    const nextDisabled = page >= totalPages;
    const buttonBase = "padding: 8px 15px; background: #064e3b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-family: inherit;";

    return `
      <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex-wrap: wrap;">
        <button class="pagination-btn" data-action="prev" data-section="${this._escapeAttr(section)}" data-page="${page - 1}" ${previousDisabled ? "disabled" : ""} style="${buttonBase} ${previousDisabled ? 'opacity:.5; cursor:not-allowed;' : ''}">${this.t("accountant.pagination.previous", {}, "Previous")}</button>
        <span style="font-weight: bold; color: #334155;">${this.t("accountant.pagination.pageOf", { page, total: totalPages }, `Page ${page} of ${totalPages}`)}</span>
        <button class="pagination-btn" data-action="next" data-section="${this._escapeAttr(section)}" data-page="${page + 1}" ${nextDisabled ? "disabled" : ""} style="${buttonBase} ${nextDisabled ? 'opacity:.5; cursor:not-allowed;' : ''}">${this.t("accountant.pagination.next", {}, "Next")}</button>
      </div>
    `;
  },

  renderMessages(inboxData, userId) {
    this._currentUserId = Number(userId);
    this._activeMessageContact = null;
    const contacts = this._buildMessageContacts(inboxData, this._currentUserId);
    const main = document.getElementById("accountant-main");

    main.innerHTML = `
      <section class="accountant-messages-dashboard">
        <div class="accountant-messages-header">
          <div>
            <h2>${this.t("accountant.messagesTab.title", {}, "Messages")}</h2>
            <p>${this.t("accountant.messagesTab.subtitle", {}, "Follow your conversations or search for a user to contact.")}</p>
          </div>
          <div class="accountant-message-search">
            <input type="text" id="accountant-message-user-search" placeholder="${this._escapeAttr(this.t("accountant.messagesTab.searchPlaceholder", {}, "Search by user name..."))}" autocomplete="off">
            <button type="button" id="accountant-message-search-btn">${this.t("accountant.messagesTab.searchButton", {}, "Search")}</button>
          </div>
        </div>

        <div class="accountant-message-search-results" id="accountant-message-search-results"></div>

        <div class="accountant-messages-shell">
          <aside class="accountant-message-contacts">
            <div class="accountant-message-panel-title">${this.t("accountant.messagesTab.conversations", {}, "Conversations")}</div>
            <div id="accountant-message-contacts-list">
              ${this._renderMessageContacts(contacts)}
            </div>
          </aside>

          <section class="accountant-chat-panel">
            <div id="accountant-chat-header" class="accountant-chat-header">${this.t("accountant.messagesTab.selectPrompt", {}, "Choose a conversation from the list or search for a new user.")}</div>
            <div id="accountant-chat-messages" class="accountant-chat-messages">
              <div class="accountant-chat-empty">
                <p>${this.t("accountant.messagesTab.emptyConversation", {}, "The conversation will appear here.")}</p>
              </div>
            </div>
            <form id="accountant-message-form" class="accountant-message-form" hidden>
              <textarea id="accountant-message-input" rows="2" placeholder="${this._escapeAttr(this.t("accountant.messagesTab.inputPlaceholder", {}, "Write your message..."))}" required></textarea>
              <button type="submit">${this.t("accountant.common.send", {}, "Send")}</button>
              <small id="accountant-message-status"></small>
            </form>
          </section>
        </div>
      </section>
    `;

    this._bindMessageEvents();
  },

  async searchMessageUsers() {
    const input = document.getElementById("accountant-message-user-search");
    const results = document.getElementById("accountant-message-search-results");
    const keyword = input?.value?.trim() || "";

    if (!results) return;
    if (keyword.length < 2) {
      results.innerHTML = `<div class="accountant-message-inline-note">${this.t("accountant.messagesTab.minSearch", {}, "Type at least two characters to search.")}</div>`;
      return;
    }

    results.innerHTML = `<div class="accountant-message-inline-note">${this.t("accountant.messagesTab.searching", {}, "Searching...")}</div>`;

    try {
      const response = await AccountantServices.searchUsers(keyword);
      const users = (Array.isArray(response) ? response : (response?.data || []))
        .filter(user => {
          const userId = Number(user.id ?? user.user_id);
          return userId && userId !== this._currentUserId;
        });

      if (users.length === 0) {
        results.innerHTML = `<div class="accountant-message-inline-note">${this.t("accountant.messagesTab.noResults", {}, "No matching results.")}</div>`;
        return;
      }

      results.innerHTML = users.map(user => {
        const userId = Number(user.id ?? user.user_id);
        const name = user.full_name || user.username || this.t("accountant.messagesTab.userFallback", { id: userId }, `User #${userId}`);
        const role = this._translateStatus(user.role_name || user.role || user.user_type || this.t("accountant.messagesTab.roleFallback", {}, "User"));

        return `
          <button type="button" class="accountant-message-user-result" data-user-id="${userId}" data-user-name="${this._escapeAttr(name)}">
            <span>${this._escape(name)}</span>
            <small>${this._escape(role)}</small>
          </button>
        `;
      }).join("");

      results.querySelectorAll(".accountant-message-user-result").forEach(btn => {
        btn.addEventListener("click", () => {
          results.innerHTML = "";
          this.openMessageConversation(Number(btn.dataset.userId), btn.dataset.userName);
        });
      });
    } catch (err) {
      results.innerHTML = `<div class="accountant-message-inline-note error">${this.t("accountant.messagesTab.searchFailed", { message: this._escape(err.message) }, "Search failed.")}</div>`;
    }
  },

  async openMessageConversation(contactId, contactName) {
    this._activeMessageContact = { id: Number(contactId), name: contactName };

    const header = document.getElementById("accountant-chat-header");
    const messagesArea = document.getElementById("accountant-chat-messages");
    const form = document.getElementById("accountant-message-form");
    const status = document.getElementById("accountant-message-status");

    if (header) header.textContent = contactName;
    if (messagesArea) messagesArea.innerHTML = `<div class="accountant-message-inline-note">${this.t("accountant.messagesTab.loadingConversation", {}, "Loading conversation...")}</div>`;
    if (form) form.hidden = false;
    if (status) status.textContent = "";

    try {
      const response = await AccountantServices.getConversation(this._currentUserId, contactId);
      const messages = Array.isArray(response) ? response : (response?.data || []);
      this.renderMessageConversation(messages);
    } catch (err) {
      if (messagesArea) {
        messagesArea.innerHTML = `<div class="accountant-message-inline-note error">${this.t("accountant.messagesTab.loadFailed", { message: this._escape(err.message) }, "Could not load messages.")}</div>`;
      }
    }
  },

  renderMessageConversation(messages) {
    const area = document.getElementById("accountant-chat-messages");
    if (!area) return;

    const ordered = [...(messages || [])].sort((a, b) => new Date(a.created_at || a.timestamp || 0) - new Date(b.created_at || b.timestamp || 0));

    if (ordered.length === 0) {
      area.innerHTML = `<div class="accountant-chat-empty"><p>${this.t("accountant.messagesTab.noMessages", {}, "No messages yet.")}</p></div>`;
      return;
    }

    area.innerHTML = ordered.map(msg => {
      const isMine = Number(msg.sender_id) === this._currentUserId;
      const author = isMine
        ? this.t("accountant.messagesTab.you", {}, "You")
        : (msg.sender_name || this._activeMessageContact?.name || this.t("accountant.messagesTab.roleFallback", {}, "User"));
      const date = msg.created_at ? this.formatDateTime(msg.created_at) : "";

      return `
        <div class="accountant-message-bubble${isMine ? " mine" : ""}">
          <div class="accountant-message-author">${this._escape(author)}</div>
          <div>${this._escape(msg.content || "")}</div>
          <time>${date}</time>
        </div>
      `;
    }).join("");

    area.scrollTop = area.scrollHeight;
  },

  async sendMessageToActiveContact() {
    const input = document.getElementById("accountant-message-input");
    const status = document.getElementById("accountant-message-status");
    const content = input?.value?.trim() || "";

    if (!this._activeMessageContact || !content) return;

    if (status) {
      status.textContent = this.t("accountant.messagesTab.sending", {}, "Sending...");
      status.className = "";
    }

    try {
      await AccountantServices.sendMessage(this._currentUserId, this._activeMessageContact.id, content);
      input.value = "";
      if (status) status.textContent = this.t("accountant.messagesTab.sent", {}, "Sent");
      await this.openMessageConversation(this._activeMessageContact.id, this._activeMessageContact.name);
      this.refreshMessageContacts();
    } catch (err) {
      if (status) {
        status.textContent = this.t("accountant.messagesTab.sendFailed", { message: err.message }, "Send failed.");
        status.className = "error";
      }
    }
  },

  async refreshMessageContacts() {
    if (!this._currentUserId) return;

    try {
      const inbox = await AccountantServices.getMessagesInbox(this._currentUserId);
      const contacts = this._buildMessageContacts(inbox, this._currentUserId);
      const list = document.getElementById("accountant-message-contacts-list");
      if (list) {
        list.innerHTML = this._renderMessageContacts(contacts);
        this._bindMessageContactEvents();
      }
    } catch (err) {
      console.warn("Could not refresh accountant message inbox:", err);
    }
  },

  renderNotifications(notificationsData) {
    const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.data || []);
    const main = document.getElementById("accountant-main");

    if (!notifications || notifications.length === 0) {
      main.innerHTML = `
        <h2 style="padding:20px 5%; color:#1e293b;">${this.t("accountant.notificationsTab.title", {}, "Notifications")}</h2>
        <p style="padding:0 5%; color:#64748b;">${this.t("accountant.notificationsTab.empty", {}, "No new notifications.")}</p>
      `;
      return;
    }

    const unreadCount = notifications.filter(n => !this._isNotificationRead(n)).length;
    const items = notifications.map(n => {
      const date = n.created_at
        ? this.formatDateTime(n.created_at)
        : this.t("accountant.notificationsTab.unknownDate", {}, "Unknown date");
      const isRead = this._isNotificationRead(n);
      const notificationId = this._getNotificationId(n);
      const action = isRead
        ? `<span style="color:#16a34a; font-weight:700;">${this.t("accountant.notificationsTab.read", {}, "Read")}</span>`
        : notificationId !== null
          ? `<button type="button" class="accountant-mark-notification-read" data-notification-id="${this._escapeAttr(notificationId)}" style="background:#10b981; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-family: inherit;">${this.t("accountant.notificationsTab.markRead", {}, "Mark as read")}</button>`
          : `<span style="color:#64748b; font-weight:700;">${this.t("accountant.common.unavailable", {}, "Unavailable")}</span>`;
      const statusLabel = isRead
        ? this.t("accountant.notificationsTab.read", {}, "Read")
        : this.t("accountant.notificationsTab.unread", {}, "Unread");

      return `
        <div style="background:#fff; padding:15px 18px; margin-bottom:12px; border-radius:8px; border-${this.start()}:4px solid ${isRead ? '#94a3b8' : '#10b981'}; box-shadow:0 2px 4px rgba(0,0,0,0.05); opacity:${isRead ? '.78' : '1'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:6px;">
            <strong style="display:block; color:#0f172a; font-size:1.05rem;">${this._escape(n.title || this.t("accountant.notificationsTab.defaultTitle", {}, "Notification"))}</strong>
            <span style="white-space:nowrap; color:${isRead ? '#16a34a' : '#d97706'}; background:${isRead ? '#dcfce7' : '#fef3c7'}; border:1px solid ${isRead ? '#bbf7d0' : '#fde68a'}; padding:4px 10px; border-radius:999px; font-size:.85rem; font-weight:700;">${statusLabel}</span>
          </div>
          <p style="margin:0; color:#334155; line-height:1.6;">${this._escape(n.message || "")}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:10px; flex-wrap:wrap;">
            <small style="color:#94a3b8; direction:ltr; text-align:${this.end()};">${date}</small>
            ${action}
          </div>
        </div>
      `;
    }).join("");

    main.innerHTML = `
      <section style="padding:20px 5%;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
          <div>
            <h2 style="margin:0; color:#1e293b;">${this.t("accountant.notificationsTab.title", {}, "Notifications")}</h2>
            <small style="color:#64748b;">${this.t("accountant.notificationsTab.unreadCount", { count: unreadCount }, `${unreadCount} unread`)}</small>
          </div>
          ${unreadCount > 0 ? `<button type="button" id="accountant-mark-all-notifications-read" style="background:#064e3b; color:white; border:none; padding:10px 14px; border-radius:8px; cursor:pointer; font-weight:700; font-family: inherit;">${this.t("accountant.notificationsTab.markAllRead", {}, "Mark all as read")}</button>` : ""}
        </div>
        <div>${items}</div>
      </section>
    `;
  },

  _bindMessageEvents() {
    document.getElementById("accountant-message-search-btn")?.addEventListener("click", () => this.searchMessageUsers());
    document.getElementById("accountant-message-user-search")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.searchMessageUsers();
    });
    document.getElementById("accountant-message-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendMessageToActiveContact();
    });
    this._bindMessageContactEvents();
  },

  _bindMessageContactEvents() {
    document.querySelectorAll(".accountant-message-contact").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".accountant-message-contact").forEach(item => item.classList.remove("active"));
        btn.classList.add("active");
        this.openMessageConversation(Number(btn.dataset.contactId), btn.dataset.contactName);
      });
    });
  },

  _buildMessageContacts(inboxData, userId) {
    const messages = Array.isArray(inboxData) ? inboxData : (inboxData?.data || []);
    const contacts = new Map();
    const currentUserId = Number(userId);

    messages.forEach(message => {
      const senderId = Number(message.sender_id);
      const receiverId = Number(message.receiver_id);
      const contactId = senderId === currentUserId ? receiverId : senderId;
      if (!contactId || contactId === currentUserId) return;

      const contactName = senderId === currentUserId
        ? (message.receiver_name || message.receiver_full_name || message.receiver_username || this.t("accountant.messagesTab.userFallback", { id: contactId }, `User #${contactId}`))
        : (message.sender_name || message.sender_full_name || message.sender_username || this.t("accountant.messagesTab.userFallback", { id: contactId }, `User #${contactId}`));
      const createdAt = message.created_at || message.timestamp || "";
      const existing = contacts.get(contactId);

      if (!existing || new Date(createdAt || 0) > new Date(existing.created_at || 0)) {
        contacts.set(contactId, {
          id: contactId,
          name: contactName,
          last_message: message.content || message.last_message || "",
          created_at: createdAt
        });
      }
    });

    return Array.from(contacts.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  _renderMessageContacts(contacts) {
    if (!contacts || contacts.length === 0) {
      return `<div class="accountant-message-empty-list">${this.t("accountant.messagesTab.emptyList", {}, "No conversations yet.")}</div>`;
    }

    return contacts.map(contact => {
      const activeClass = Number(contact.id) === this._activeMessageContact?.id ? " active" : "";

      return `
        <button type="button" class="accountant-message-contact${activeClass}" data-contact-id="${contact.id}" data-contact-name="${this._escapeAttr(contact.name)}">
          <span>${this._escape(contact.name)}</span>
          <small>${this._escape(contact.last_message || "...")}</small>
        </button>
      `;
    }).join("");
  },

  _getNotificationId(notification) {
    const id = notification?.id ?? notification?.notification_id;
    return id === undefined || id === null || id === "" ? null : id;
  },

  _isNotificationRead(notification) {
    const value = notification?.is_read;
    return value === true || value === 1 || value === "1" || value === "true";
  },

  _translate(section) {
    return this.t(`accountant.nav.${section}`, {}, section);
  },

  _translateStatus(status) {
    const raw = String(status || "").trim();
    if (!raw) return this.t("accountant.common.notSpecified", {}, "Not specified");
    const normalized = raw.toLowerCase().replace(/\s+/g, "_");
    return this.t(`accountant.status.${normalized}`, {}, raw);
  },

  _formatCurrency(amount) {
    const number = Number(amount);
    const safeAmount = Number.isFinite(number) ? number : 0;
    return `${safeAmount.toLocaleString(this.locale())} ${this.t("accountant.currency.dzd", {}, "DZD")}`;
  },

  formatDateTime(value) {
    if (!value) return this.t("accountant.common.notSpecified", {}, "Not specified");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(this.locale());
  },

  locale() {
    return window.I18n ? I18n.get("meta.locale", this.isRtl() ? "ar-DZ" : "en-US") : "ar-DZ";
  },

  dir() {
    return window.I18n ? I18n.get("meta.dir", "rtl") : "rtl";
  },

  isRtl() {
    return this.dir() === "rtl";
  },

  start() {
    return this.isRtl() ? "right" : "left";
  },

  end() {
    return this.isRtl() ? "left" : "right";
  },

  t(key, params = {}, fallback = "") {
    return window.I18n ? I18n.t(key, params, fallback || key) : (fallback || key);
  },

  text(value, params = {}) {
    return window.I18n ? I18n.text(value, params) : value;
  },

  localize(root = document) {
    if (window.I18n) I18n.apply(root);
  },

  _formatValue(value) {
    return value === null || value === undefined || value === ""
      ? this.t("accountant.common.none", {}, "-")
      : value;
  },

  _escape(value) {
    return String(this._formatValue(value))
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  _escapeAttr(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

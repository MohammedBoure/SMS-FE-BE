// js/roles/parent/ui.js

const ParentUI = {
  SECTIONS: ["children", "grades", "attendance", "fees", "posts", "messages", "notifications"],
  _postsCache: [],
  _currentUserId: null,
  _activeMessageContact: null,

  renderHeader(userProfile) {
    const header = document.getElementById("parent-header");
    const name = userProfile ? userProfile.full_name : "...";
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
      <div class="parent-header-shell">
        <h1>${this.t("parent.brand.welcome", { name: this._escape(name) }, `Welcome: ${this._escape(name)}`)}</h1>
        <div class="parent-header-actions">
          <label class="parent-language-control">
            <span>${this.t("parent.language.label", {}, "Language")}</span>
            <select id="parent-language-select" aria-label="${this._escapeAttr(this.t("parent.language.select", {}, "Choose language"))}">
              ${options}
            </select>
          </label>
          <button id="logout-btn">${this.t("parent.auth.logout", {}, "Log out")}</button>
        </div>
      </div>
    `;

    document.getElementById("logout-btn")?.addEventListener("click", () => Auth.logout());
    const languageSelect = document.getElementById("parent-language-select");
    if (languageSelect && window.I18n) {
      languageSelect.addEventListener("change", async (event) => {
        languageSelect.disabled = true;
        await I18n.setLanguage(event.target.value);
        languageSelect.disabled = false;
      });
    }
  },

  renderNav(activeSection) {
    const nav = document.getElementById("parent-nav");
    nav.innerHTML = this.SECTIONS.map(section => `
      <button class="nav-btn${activeSection === section ? " active" : ""}" data-section="${this._escapeAttr(section)}">
        ${this._translate(section)}
      </button>
    `).join("");
  },

  renderLoading() {
    document.getElementById("parent-main").innerHTML = `<h3 style="padding: 20px;">${this.t("parent.state.loading", {}, "Loading data...")}</h3>`;
  },

  renderError(msg) {
    document.getElementById("parent-main").innerHTML = `
      <h3 style="color: #ef4444; padding: 20px;">
        ${this.t("parent.state.errorPrefix", {}, "Error:")} ${this._escape(msg)}
      </h3>
    `;
  },

  renderChildren(children) {
    const main = document.getElementById("parent-main");
    const align = this.start();

    if (!children || children.length === 0) {
      main.innerHTML = `
        <h2>${this.t("parent.children.emptyTitle", {}, "My Children")}</h2>
        <p style="color: #64748b;">${this.t("parent.children.emptyText", {}, "No children are currently linked to your account.")}</p>
      `;
      return;
    }

    const rows = children.map(c => `
      <tr>
        <td><strong>${this._escape(c.student_name || c.full_name)}</strong></td>
        <td>${this._escape(c.class_name)} (${this._escape(c.level)})</td>
        <td style="direction: ltr; text-align: ${align};">${this._escape(c.date_of_birth)}</td>
        <td><span style="background: ${c.status === "active" ? '#dcfce7' : '#f1f5f9'}; padding: 4px 8px; border-radius: 4px;">${this._translateStatus(c.status)}</span></td>
      </tr>
    `).join("");

    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${this.t("parent.children.title", {}, "My Registered Children")}</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: ${align};">
          <thead style="background: #f1f5f9;">
            <tr>
              <th>${this.t("parent.children.columns.name", {}, "Name")}</th>
              <th>${this.t("parent.children.columns.classLevel", {}, "Class (level)")}</th>
              <th>${this.t("parent.children.columns.birthDate", {}, "Date of birth")}</th>
              <th>${this.t("parent.children.columns.status", {}, "Status")}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderGrades(grades) {
    const main = document.getElementById("parent-main");
    const align = this.start();

    if (!grades || grades.length === 0) {
      main.innerHTML = `
        <h2>${this.t("parent.grades.emptyTitle", {}, "Grades and Assessments")}</h2>
        <p style="color: #64748b;">${this.t("parent.grades.emptyText", {}, "No grades have been recorded yet.")}</p>
      `;
      return;
    }

    const rows = grades.map(g => {
      const assessmentType = this._translateStatus(g.assessment_type === "exam" ? "exam" : "homework");
      return `
        <tr>
          <td><strong>${this._escape(g.child_name)}</strong></td>
          <td>${this._escape(g.subject_name)}</td>
          <td>${this._escape(g.assessment_title)} <span style="color:#64748b; font-size:0.85em;">(${this._escape(assessmentType)})</span></td>
          <td style="direction: ltr; text-align: ${align}; font-weight: bold; color: #10b981;">${this._escape(g.grade_value)} / ${this._escape(g.max_grade)}</td>
          <td>${this._escape(g.teacher_name)}</td>
        </tr>
      `;
    }).join("");

    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${this.t("parent.grades.title", {}, "Grades and Assessments")}</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: ${align};">
          <thead style="background: #f1f5f9;">
            <tr>
              <th>${this.t("parent.grades.columns.child", {}, "Child")}</th>
              <th>${this.t("parent.grades.columns.subject", {}, "Subject")}</th>
              <th>${this.t("parent.grades.columns.assessment", {}, "Assessment")}</th>
              <th>${this.t("parent.grades.columns.grade", {}, "Grade")}</th>
              <th>${this.t("parent.grades.columns.teacher", {}, "Teacher")}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderAttendance(records) {
    const main = document.getElementById("parent-main");
    const align = this.start();

    if (!records || records.length === 0) {
      main.innerHTML = `
        <h2>${this.t("parent.attendance.emptyTitle", {}, "Absence Record")}</h2>
        <p style="color: #64748b;">${this.t("parent.attendance.emptyText", {}, "No absences were found.")}</p>
      `;
      return;
    }

    const rows = records.map(r => {
      const statusColor = r.status === "absent" ? "#ef4444" : (r.status === "present" ? "#10b981" : "#f59e0b");
      const justification = r.is_justified
        ? this.t("parent.attendance.justifiedYes", { reason: this._escape(r.justification_reason) }, "Yes")
        : this.t("parent.attendance.justifiedNo", {}, "No");

      return `
        <tr style="background: ${r.status === 'absent' ? '#fef2f2' : 'white'};">
          <td><strong>${this._escape(r.child_name)}</strong></td>
          <td style="direction: ltr; text-align: ${align}; font-weight:bold;">${this._escape(r.date)}</td>
          <td style="font-weight:bold; color: ${statusColor};">${this._translateStatus(r.status)}</td>
          <td>${justification}</td>
        </tr>
      `;
    }).join("");

    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${this.t("parent.attendance.title", {}, "Absence and Tardiness Record")}</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: ${align};">
          <thead style="background: #f1f5f9;">
            <tr>
              <th>${this.t("parent.attendance.columns.child", {}, "Child")}</th>
              <th>${this.t("parent.attendance.columns.date", {}, "Date")}</th>
              <th>${this.t("parent.attendance.columns.status", {}, "Status")}</th>
              <th>${this.t("parent.attendance.columns.justified", {}, "Justified?")}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderFees(fees) {
    const main = document.getElementById("parent-main");
    const align = this.start();

    if (!fees || fees.length === 0) {
      main.innerHTML = `
        <h2>${this.t("parent.fees.emptyTitle", {}, "Financial Status")}</h2>
        <p style="color: #64748b;">${this.t("parent.fees.emptyText", {}, "No due debts were found.")}</p>
      `;
      return;
    }

    const rows = fees.map(f => {
      const isPaid = f.status === "paid" || f.status === "completed";
      const programName = f.program_name ? `<span style="color:#64748b;">(${this._escape(f.program_name)})</span>` : "";

      return `
        <tr style="background: ${isPaid ? 'white' : '#fef2f2'};">
          <td><strong>${this._escape(f.child_name)}</strong></td>
          <td>${this._escape(f.fee_type)} ${programName}</td>
          <td style="font-weight: bold;">${this._formatCurrency(f.amount_due || f.net_amount)}</td>
          <td style="direction: ltr; text-align: ${align};">${this._escape(f.due_date)}</td>
          <td style="color: ${isPaid ? '#10b981' : '#ef4444'}; font-weight: bold;">${this._translateStatus(f.status)}</td>
        </tr>
      `;
    }).join("");

    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${this.t("parent.fees.title", {}, "Financial Claims and Fees")}</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: ${align};">
          <thead style="background: #f1f5f9;">
            <tr>
              <th>${this.t("parent.fees.columns.child", {}, "Child")}</th>
              <th>${this.t("parent.fees.columns.feeType", {}, "Fee type")}</th>
              <th>${this.t("parent.fees.columns.amount", {}, "Amount")}</th>
              <th>${this.t("parent.fees.columns.dueDate", {}, "Due date")}</th>
              <th>${this.t("parent.fees.columns.status", {}, "Status")}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderNotifications(notifications) {
    const main = document.getElementById("parent-main");
    const start = this.start();
    const end = this.end();

    if (!notifications || notifications.length === 0) {
      main.innerHTML = `
        <h2>${this.t("parent.notifications.emptyTitle", {}, "Notifications and Alerts")}</h2>
        <p style="color: #64748b;">${this.t("parent.notifications.emptyText", {}, "The notifications inbox is empty.")}</p>
      `;
      return;
    }

    const unreadCount = notifications.filter(n => !this._isNotificationRead(n)).length;
    const items = notifications.map(n => {
      const dateStr = n.created_at ? this.formatDateTime(n.created_at) : this.t("parent.common.unknownDate", {}, "Unknown date");
      const isRead = this._isNotificationRead(n);
      const notificationId = this._getNotificationId(n);
      const action = isRead
        ? `<span style="color:#16a34a; font-weight:700;">${this.t("parent.notifications.read", {}, "Read")}</span>`
        : notificationId !== null
          ? `<button type="button" class="parent-mark-notification-read" data-notification-id="${this._escapeAttr(notificationId)}" style="background:#eab308; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-family: inherit;">${this.t("parent.notifications.markRead", {}, "Mark as read")}</button>`
          : `<span style="color:#64748b; font-weight:700;">${this.t("parent.common.unavailable", {}, "Unavailable")}</span>`;
      const statusLabel = isRead
        ? this.t("parent.notifications.read", {}, "Read")
        : this.t("parent.notifications.unread", {}, "Unread");

      return `
        <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-${start}: 4px solid ${isRead ? '#94a3b8' : '#eab308'}; box-shadow: 0 2px 4px rgba(0,0,0,0.05); opacity:${isRead ? '.78' : '1'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:5px;">
            <strong style="display:block; font-size:1.1rem; color: #0f172a;">${this._escape(n.title || this.t("parent.notifications.defaultTitle", {}, "Notification"))}</strong>
            <span style="white-space:nowrap; color:${isRead ? '#16a34a' : '#d97706'}; background:${isRead ? '#dcfce7' : '#fef3c7'}; border:1px solid ${isRead ? '#bbf7d0' : '#fde68a'}; padding:4px 10px; border-radius:999px; font-size:.85rem; font-weight:700;">${statusLabel}</span>
          </div>
          <p style="margin:0; color:#334155; line-height: 1.6;">${this._escape(n.message)}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:10px; flex-wrap:wrap;">
            <small style="color:#94a3b8; direction: ltr; text-align: ${end};">${dateStr}</small>
            ${action}
          </div>
        </div>
      `;
    }).join("");

    main.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; border-bottom:2px solid #e2e8f0; padding-bottom:10px;">
        <div>
          <h2 style="color:#1e293b; margin:0;">${this.t("parent.notifications.title", {}, "Incoming Notifications")}</h2>
          <small style="color:#64748b;">${this.t("parent.notifications.unreadCount", { count: unreadCount }, `${unreadCount} unread`)}</small>
        </div>
        ${unreadCount > 0 ? `<button type="button" id="parent-mark-all-notifications-read" style="background:#0f172a; color:white; border:none; padding:10px 14px; border-radius:8px; cursor:pointer; font-weight:700; font-family: inherit;">${this.t("parent.notifications.markAllRead", {}, "Mark all as read")}</button>` : ""}
      </div>
      <div>${items}</div>
    `;
  },

  renderMessages(inboxData, userId) {
    this._currentUserId = Number(userId);
    this._activeMessageContact = null;
    const contacts = this._buildMessageContacts(inboxData, this._currentUserId);
    const main = document.getElementById("parent-main");

    main.innerHTML = `
      <section class="parent-messages-dashboard">
        <div class="parent-messages-header">
          <div>
            <h2>${this.t("parent.messages.title", {}, "Messages")}</h2>
            <p>${this.t("parent.messages.subtitle", {}, "Follow your conversations or search for a new user to contact.")}</p>
          </div>
          <div class="parent-message-search">
            <input type="text" id="parent-message-user-search" placeholder="${this._escapeAttr(this.t("parent.messages.searchPlaceholder", {}, "Search by user name..."))}" autocomplete="off">
            <button type="button" id="parent-message-search-btn">${this.t("parent.messages.searchButton", {}, "Search")}</button>
          </div>
        </div>

        <div class="parent-message-search-results" id="parent-message-search-results"></div>

        <div class="parent-messages-shell">
          <aside class="parent-message-contacts">
            <div class="parent-message-panel-title">${this.t("parent.messages.conversations", {}, "Conversations")}</div>
            <div id="parent-message-contacts-list">
              ${this._renderMessageContacts(contacts)}
            </div>
          </aside>

          <section class="parent-chat-panel">
            <div id="parent-chat-header" class="parent-chat-header">${this.t("parent.messages.selectPrompt", {}, "Choose a conversation from the list or search for a new user.")}</div>
            <div id="parent-chat-messages" class="parent-chat-messages">
              <div class="parent-chat-empty">
                <p>${this.t("parent.messages.emptyConversation", {}, "The conversation will appear here.")}</p>
              </div>
            </div>
            <form id="parent-message-form" class="parent-message-form" hidden>
              <textarea id="parent-message-input" rows="2" placeholder="${this._escapeAttr(this.t("parent.messages.inputPlaceholder", {}, "Write your message..."))}" required></textarea>
              <button type="submit">${this.t("parent.common.send", {}, "Send")}</button>
              <small id="parent-message-status"></small>
            </form>
          </section>
        </div>
      </section>
    `;

    this._bindMessageEvents();
  },

  async searchMessageUsers() {
    const input = document.getElementById("parent-message-user-search");
    const results = document.getElementById("parent-message-search-results");
    const keyword = input?.value?.trim() || "";

    if (!results) return;
    if (keyword.length < 2) {
      results.innerHTML = `<div class="parent-message-inline-note">${this.t("parent.messages.minSearch", {}, "Type at least two characters to search.")}</div>`;
      return;
    }

    results.innerHTML = `<div class="parent-message-inline-note">${this.t("parent.messages.searching", {}, "Searching...")}</div>`;

    try {
      const response = await ParentServices.searchUsers(keyword);
      const users = (Array.isArray(response) ? response : (response?.data || []))
        .filter(user => {
          const userId = Number(user.id ?? user.user_id);
          return userId && userId !== this._currentUserId;
        });

      if (users.length === 0) {
        results.innerHTML = `<div class="parent-message-inline-note">${this.t("parent.messages.noResults", {}, "No matching results.")}</div>`;
        return;
      }

      results.innerHTML = users.map(user => {
        const userId = Number(user.id ?? user.user_id);
        const name = user.full_name || user.username || this.t("parent.common.userFallback", { id: userId }, `User #${userId}`);
        const role = this._translateStatus(user.role_name || user.role || user.user_type || this.t("parent.messages.roleFallback", {}, "User"));

        return `
          <button type="button" class="parent-message-user-result" data-user-id="${userId}" data-user-name="${this._escapeAttr(name)}">
            <span>${this._escape(name)}</span>
            <small>${this._escape(role)}</small>
          </button>
        `;
      }).join("");

      results.querySelectorAll(".parent-message-user-result").forEach(btn => {
        btn.addEventListener("click", () => {
          results.innerHTML = "";
          this.openMessageConversation(Number(btn.dataset.userId), btn.dataset.userName);
        });
      });
    } catch (err) {
      results.innerHTML = `<div class="parent-message-inline-note error">${this.t("parent.messages.searchFailed", { message: this._escape(err.message) }, "Search failed.")}</div>`;
    }
  },

  async openMessageConversation(contactId, contactName) {
    this._activeMessageContact = { id: Number(contactId), name: contactName };

    const header = document.getElementById("parent-chat-header");
    const messagesArea = document.getElementById("parent-chat-messages");
    const form = document.getElementById("parent-message-form");
    const status = document.getElementById("parent-message-status");

    if (header) header.textContent = contactName;
    if (messagesArea) messagesArea.innerHTML = `<div class="parent-message-inline-note">${this.t("parent.messages.loadingConversation", {}, "Loading conversation...")}</div>`;
    if (form) form.hidden = false;
    if (status) status.textContent = "";

    try {
      const response = await ParentServices.getConversation(this._currentUserId, contactId);
      const messages = Array.isArray(response) ? response : (response?.data || []);
      this.renderMessageConversation(messages);
    } catch (err) {
      if (messagesArea) {
        messagesArea.innerHTML = `<div class="parent-message-inline-note error">${this.t("parent.messages.loadFailed", { message: this._escape(err.message) }, "Could not load messages.")}</div>`;
      }
    }
  },

  renderMessageConversation(messages) {
    const area = document.getElementById("parent-chat-messages");
    if (!area) return;

    const ordered = [...(messages || [])].sort((a, b) => new Date(a.created_at || a.timestamp || 0) - new Date(b.created_at || b.timestamp || 0));

    if (ordered.length === 0) {
      area.innerHTML = `<div class="parent-chat-empty"><p>${this.t("parent.messages.noMessages", {}, "No messages yet.")}</p></div>`;
      return;
    }

    area.innerHTML = ordered.map(msg => {
      const isMine = Number(msg.sender_id) === this._currentUserId;
      const author = isMine
        ? this.t("parent.messages.you", {}, "You")
        : (msg.sender_name || this._activeMessageContact?.name || this.t("parent.messages.roleFallback", {}, "User"));
      const date = msg.created_at ? this.formatDateTime(msg.created_at) : "";

      return `
        <div class="parent-message-bubble${isMine ? " mine" : ""}">
          <div class="parent-message-author">${this._escape(author)}</div>
          <div>${this._escape(msg.content || "")}</div>
          <time>${date}</time>
        </div>
      `;
    }).join("");

    area.scrollTop = area.scrollHeight;
  },

  async sendMessageToActiveContact() {
    const input = document.getElementById("parent-message-input");
    const status = document.getElementById("parent-message-status");
    const content = input?.value?.trim() || "";

    if (!this._activeMessageContact || !content) return;

    if (status) {
      status.textContent = this.t("parent.messages.sending", {}, "Sending...");
      status.className = "";
    }

    try {
      await ParentServices.sendMessage(this._currentUserId, this._activeMessageContact.id, content);
      input.value = "";
      if (status) status.textContent = this.t("parent.messages.sent", {}, "Sent");
      await this.openMessageConversation(this._activeMessageContact.id, this._activeMessageContact.name);
      this.refreshMessageContacts();
    } catch (err) {
      if (status) {
        status.textContent = this.t("parent.messages.sendFailed", { message: err.message }, "Send failed.");
        status.className = "error";
      }
    }
  },

  async refreshMessageContacts() {
    if (!this._currentUserId) return;

    try {
      const inbox = await ParentServices.getMessagesInbox(this._currentUserId);
      const contacts = this._buildMessageContacts(inbox, this._currentUserId);
      const list = document.getElementById("parent-message-contacts-list");
      if (list) {
        list.innerHTML = this._renderMessageContacts(contacts);
        this._bindMessageContactEvents();
      }
    } catch (err) {
      console.warn("Could not refresh parent message inbox:", err);
    }
  },

  renderPosts(postsData) {
    const posts = Array.isArray(postsData) ? postsData : (postsData?.data || []);
    const main = document.getElementById("parent-main");
    const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    this._postsCache = sortedPosts;

    if (!sortedPosts || sortedPosts.length === 0) {
      main.innerHTML = `
        <div class="posts-dashboard student-posts-dashboard parent-posts-dashboard">
          <div class="posts-header-bar">
            <div>
              <h3>${this.t("parent.posts.title", {}, "Administration Posts")}</h3>
              <p>${this.t("parent.posts.emptySubtitle", {}, "Announcements and content published by administration will appear here.")}</p>
            </div>
          </div>
          <div class="posts-empty">
            <div class="empty-icon">${this.t("parent.common.file", {}, "File")}</div>
            <h4>${this.t("parent.posts.emptyTitle", {}, "No posts currently")}</h4>
            <p>${this.t("parent.posts.emptyText", {}, "Administration posts will appear here when available.")}</p>
          </div>
        </div>
      `;
      return;
    }

    const cards = sortedPosts.map((post, index) => {
      const title = this._escape(post.title || this.t("parent.posts.untitled", {}, "Untitled post"));
      const date = this._formatPostDate(post.created_at);
      const snippet = this._extractPostSnippet(post.content ?? "");
      const excerpt = snippet ? this._escape(snippet) : "";

      return `
        <article class="student-post-list-card">
          ${post.image
            ? `<img src="${this._escapeAttr(post.image)}" class="student-post-thumb" alt="${title}">`
            : `<div class="student-post-thumb student-post-thumb-placeholder">${this.t("parent.posts.filePlaceholder", {}, "Document")}</div>`}
          <div class="student-post-summary">
            <div>
              <div class="student-post-label">${this.t("parent.common.fromManagement", {}, "From administration")}</div>
              <h3 class="student-post-list-title">${title}</h3>
              <p>${excerpt || this.t("parent.posts.openHint", {}, "Open the post to view its details.")}</p>
            </div>
            <div class="student-post-list-actions">
              <time class="student-post-date">${date}</time>
              <button type="button" class="student-post-open" data-post-index="${index}">${this.t("parent.common.openDetails", {}, "View details")}</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    main.innerHTML = `
      <div class="posts-dashboard student-posts-dashboard parent-posts-dashboard">
        <div class="posts-header-bar">
          <div>
            <h3>${this.t("parent.posts.title", {}, "Administration Posts")}</h3>
            <p>${this.t("parent.posts.listSubtitle", {}, "Choose a post from the list to view the full details.")}</p>
          </div>
        </div>
        <div class="student-posts-list">${cards}</div>
      </div>
    `;
    main.querySelectorAll(".student-post-open").forEach(btn => {
      btn.addEventListener("click", () => this.renderPostDetails(Number(btn.dataset.postIndex)));
    });
  },

  renderPostDetails(index) {
    const post = this._postsCache[index];
    const main = document.getElementById("parent-main");

    if (!post) {
      this.renderPosts(this._postsCache);
      return;
    }

    const title = this._escape(post.title || this.t("parent.posts.untitled", {}, "Untitled post"));
    const date = this._formatPostDate(post.created_at);
    const contentHtml = this._processPostMarkdown(post.content ?? "");

    main.innerHTML = `
      <div class="posts-dashboard student-posts-dashboard parent-posts-dashboard">
        <div class="student-post-detail-topbar">
          <button type="button" class="btn-secondary" id="parent-posts-back">${this.t("parent.common.backToPosts", {}, "Back to posts")}</button>
          <time class="student-post-date">${date}</time>
        </div>
        <article class="student-post-card student-post-detail">
          ${post.image ? `<img src="${this._escapeAttr(post.image)}" class="student-post-cover" alt="${title}">` : ""}
          <div class="student-post-head">
            <div>
              <div class="student-post-label">${this.t("parent.common.fromManagement", {}, "From administration")}</div>
              <h3 class="preview-title">${title}</h3>
            </div>
          </div>
          <div class="md-body">${contentHtml || `<p class="preview-placeholder">${this.t("parent.common.noContent", {}, "This post has no content.")}</p>`}</div>
        </article>
      </div>
    `;

    document.getElementById("parent-posts-back")?.addEventListener("click", () => this.renderPosts(this._postsCache));
    this._typesetMath(main);
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
    return this.t(`parent.nav.${section}`, {}, section);
  },

  _translateStatus(status) {
    const raw = String(status || "").trim();
    if (!raw) return this.t("parent.common.notSpecified", {}, "Not specified");
    const normalized = raw.toLowerCase().replace(/\s+/g, "_");
    return this.t(`parent.status.${normalized}`, {}, raw);
  },

  _bindMessageEvents() {
    document.getElementById("parent-message-search-btn")?.addEventListener("click", () => this.searchMessageUsers());
    document.getElementById("parent-message-user-search")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.searchMessageUsers();
    });
    document.getElementById("parent-message-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendMessageToActiveContact();
    });
    this._bindMessageContactEvents();
  },

  _bindMessageContactEvents() {
    document.querySelectorAll(".parent-message-contact").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".parent-message-contact").forEach(item => item.classList.remove("active"));
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
        ? (message.receiver_name || message.receiver_full_name || message.receiver_username || this.t("parent.common.userFallback", { id: contactId }, `User #${contactId}`))
        : (message.sender_name || message.sender_full_name || message.sender_username || this.t("parent.common.userFallback", { id: contactId }, `User #${contactId}`));
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
      return `<div class="parent-message-empty-list">${this.t("parent.messages.emptyList", {}, "No conversations yet.")}</div>`;
    }

    return contacts.map(contact => {
      const activeClass = Number(contact.id) === this._activeMessageContact?.id ? " active" : "";

      return `
        <button type="button" class="parent-message-contact${activeClass}" data-contact-id="${contact.id}" data-contact-name="${this._escapeAttr(contact.name)}">
          <span>${this._escape(contact.name)}</span>
          <small>${this._escape(contact.last_message || "...")}</small>
        </button>
      `;
    }).join("");
  },

  _processPostMarkdown(raw) {
    if (!raw) return "";

    const downloadWords = ["\\u062a\\u062d\\u0645\\u064a\\u0644", "Download"];
    const downloadPattern = new RegExp(`\\[(?:${downloadWords.join("|")}):\\s*([^\\]|]+?)(?:\\|([^\\]|]*?))?(?:\\|([^\\]]*?))?\\]\\(([^)]+)\\)`, "g");
    let source = String(raw).replace(downloadPattern, (_, name, type, size, url) => {
      const safeUrl = this._escapeAttr(url.trim());
      const safeName = this._escape(name.trim());
      const ext = safeUrl.split(".").pop()?.split("?")[0];
      const icon = this._getFileIcon(ext);
      const meta = [type, size].map(part => part?.trim()).filter(Boolean).join(" - ");

      return `
        <a href="${safeUrl}" target="_blank" class="dl-card" rel="noopener noreferrer">
          <span class="dl-card-icon">${icon}</span>
          <span class="dl-card-info">
            <span class="dl-card-name">${safeName}</span>
            ${meta ? `<span class="dl-card-meta">${this._escape(meta)}</span>` : ""}
          </span>
          <span class="dl-card-btn">${this.t("parent.common.download", {}, "Download")}</span>
        </a>
      `;
    });

    let html = (typeof marked !== "undefined")
      ? marked.parse(source, { gfm: true, breaks: true, tables: true })
      : this._escape(source).replace(/\n/g, "<br>");

    if (typeof DOMPurify !== "undefined") {
      html = DOMPurify.sanitize(html, {
        ADD_ATTR: ["target", "rel", "class"]
      });
    }

    return html;
  },

  _typesetMath(container, attempt = 0) {
    if (!container || typeof MathJax === "undefined") return;

    if (MathJax.typesetPromise) {
      if (MathJax.typesetClear) MathJax.typesetClear([container]);
      MathJax.typesetPromise([container]).catch(() => {});
      return;
    }

    if (MathJax.startup?.promise) {
      MathJax.startup.promise.then(() => this._typesetMath(container, attempt + 1)).catch(() => {});
      return;
    }

    if (attempt < 8) {
      setTimeout(() => this._typesetMath(container, attempt + 1), 250);
    }
  },

  _formatPostDate(value) {
    if (!value) return this.t("parent.common.unknownDate", {}, "Unknown date");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return this.t("parent.common.unknownDate", {}, "Unknown date");

    return date.toLocaleDateString(this.locale(), {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  },

  _extractPostSnippet(markdown, length = 140) {
    const text = String(markdown)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
      .replace(/\[[^\]]+\]\([^)]+\)/g, match => match.replace(/^\[|\]\([^)]+\)$/g, ""))
      .replace(/[#>*_`~|$\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.length > length ? `${text.slice(0, length).trim()}...` : text;
  },

  _getFileIcon(ext) {
    return ext ? ext.toUpperCase().slice(0, 4) : this.t("parent.common.file", {}, "File");
  },

  _formatCurrency(amount) {
    const number = Number(amount);
    const safeAmount = Number.isFinite(number) ? number : 0;
    return `${safeAmount.toLocaleString(this.locale())} ${this.t("parent.currency.dzd", {}, "DZD")}`;
  },

  formatDateTime(value) {
    if (!value) return this.t("parent.common.unknownDate", {}, "Unknown date");
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

  _formatValue(value) {
    return value === null || value === undefined || value === ""
      ? this.t("parent.common.none", {}, "-")
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

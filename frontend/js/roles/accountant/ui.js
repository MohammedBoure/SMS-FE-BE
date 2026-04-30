// js/roles/accountant/ui.js

const AccountantUI = {
  SECTIONS: ["students", "fees", "payments", "transactions", "search", "attendance", "messages"],
  _currentUserId: null,
  _activeMessageContact: null,

  renderHeader(session) {
    const header = document.getElementById("accountant-header");
    header.innerHTML = `
      <div style="background: linear-gradient(135deg, #064e3b 0%, #10b981 100%); color: white; padding: 1rem 5%; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <h1 style="margin: 0; font-size: 1.4rem;">مكتب المحاسبة والمالية</h1>
        <button id="logout-btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); padding: 5px 15px; border-radius: 20px; cursor: pointer;">تسجيل خروج</button>
      </div>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  },

  renderNav(activeSection) {
    const nav = document.getElementById("accountant-nav");
    nav.style.cssText = "background: white; padding: 10px 5%; display: flex; gap: 10px; border-bottom: 1px solid #e2e8f0; overflow-x: auto;";
    
    nav.innerHTML = this.SECTIONS.map(s => {
      const isActive = activeSection === s;
      return `<button class="nav-btn" data-section="${s}" style="background: ${isActive ? '#dcfce7' : 'transparent'}; color: ${isActive ? '#166534' : '#64748b'}; border: 1px solid ${isActive ? '#22c55e' : 'transparent'}; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s;">${this._translate(s)}</button>`;
    }).join("");
  },

  renderLoading() {
    document.getElementById("accountant-main").innerHTML = "<h3 style='padding: 20px 5%; color: #10b981;'>جاري تحميل البيانات المالية...</h3>";
  },

  renderError(msg) {
    document.getElementById("accountant-main").innerHTML = `<h3 style="padding: 20px 5%; color: #ef4444;">خطأ: ${this._escape(msg)}</h3>`;
  },

  // === نافذة إرسال الإشعارات والإنذارات ===
  showNotificationModal(userId, userName, contextMessage = "") {
    const existing = document.getElementById("notification-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "notification-modal";
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 2000; backdrop-filter: blur(4px); direction: rtl;";

    overlay.innerHTML = `
      <div style="background: white; width: 90%; max-width: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
        <div style="background: #eab308; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">إرسال إشعار إلى: ${this._escape(userName)}</h3>
          <button id="close-notif-modal" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <form id="send-notification-form" data-user-id="${this._escapeAttr(userId)}" style="padding: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #475569;">عنوان الإشعار:</label>
          <input type="text" id="notif-title" required value="إشعار من الإدارة المالية" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 15px; box-sizing: border-box;" />
          
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #475569;">نص الرسالة:</label>
          <textarea id="notif-message" required rows="4" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 20px; box-sizing: border-box; font-family: inherit;">${this._escape(contextMessage)}</textarea>
          
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" id="cancel-notif" style="padding: 10px 15px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">إلغاء</button>
            <button type="submit" style="padding: 10px 20px; background: #eab308; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">إرسال الإشعار</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("close-notif-modal").onclick = () => overlay.remove();
    document.getElementById("cancel-notif").onclick = () => overlay.remove();
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
  },

  // === الدوال المساعدة للواجهة ===
  renderPagination(page, total, limit, section) {
    const totalPages = Math.ceil(total / limit) || 1;
    if (totalPages <= 1) return ""; // لا داعي للأزرار إذا كانت صفحة واحدة

    return `
      <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <button class="pagination-btn" data-action="prev" data-section="${section}" data-page="${page - 1}" ${page <= 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} style="padding: 8px 15px; background: #064e3b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">السابق</button>
        <span style="font-weight: bold; color: #334155;">صفحة ${page} من ${totalPages}</span>
        <button class="pagination-btn" data-action="next" data-section="${section}" data-page="${page + 1}" ${page >= totalPages ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} style="padding: 8px 15px; background: #064e3b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">التالي</button>
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
            <h2>المراسلة</h2>
            <p>تابع محادثاتك أو ابحث عن مستخدم للتواصل معه.</p>
          </div>
          <div class="accountant-message-search">
            <input type="text" id="accountant-message-user-search" placeholder="ابحث باسم المستخدم..." autocomplete="off">
            <button type="button" id="accountant-message-search-btn">بحث</button>
          </div>
        </div>

        <div class="accountant-message-search-results" id="accountant-message-search-results"></div>

        <div class="accountant-messages-shell">
          <aside class="accountant-message-contacts">
            <div class="accountant-message-panel-title">المحادثات</div>
            <div id="accountant-message-contacts-list">
              ${this._renderMessageContacts(contacts)}
            </div>
          </aside>

          <section class="accountant-chat-panel">
            <div id="accountant-chat-header" class="accountant-chat-header">اختر محادثة من القائمة أو ابحث عن مستخدم جديد.</div>
            <div id="accountant-chat-messages" class="accountant-chat-messages">
              <div class="accountant-chat-empty">
                <p>المحادثة ستظهر هنا.</p>
              </div>
            </div>
            <form id="accountant-message-form" class="accountant-message-form" hidden>
              <textarea id="accountant-message-input" rows="2" placeholder="اكتب رسالتك..." required></textarea>
              <button type="submit">إرسال</button>
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
      results.innerHTML = `<div class="accountant-message-inline-note">اكتب حرفين على الأقل للبحث.</div>`;
      return;
    }

    results.innerHTML = `<div class="accountant-message-inline-note">جاري البحث...</div>`;

    try {
      const response = await AccountantServices.searchUsers(keyword);
      const users = (Array.isArray(response) ? response : (response?.data || []))
        .filter(user => {
          const userId = Number(user.id ?? user.user_id);
          return userId && userId !== this._currentUserId;
        });

      if (users.length === 0) {
        results.innerHTML = `<div class="accountant-message-inline-note">لا توجد نتائج مطابقة.</div>`;
        return;
      }

      results.innerHTML = users.map(user => {
        const userId = Number(user.id ?? user.user_id);
        const name = user.full_name || user.username || `مستخدم #${userId}`;
        const role = user.role_name || user.role || user.user_type || "مستخدم";

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
      results.innerHTML = `<div class="accountant-message-inline-note error">فشل البحث: ${this._escape(err.message)}</div>`;
    }
  },

  async openMessageConversation(contactId, contactName) {
    this._activeMessageContact = { id: Number(contactId), name: contactName };

    const header = document.getElementById("accountant-chat-header");
    const messagesArea = document.getElementById("accountant-chat-messages");
    const form = document.getElementById("accountant-message-form");
    const status = document.getElementById("accountant-message-status");

    if (header) header.textContent = contactName;
    if (messagesArea) messagesArea.innerHTML = `<div class="accountant-message-inline-note">جاري تحميل المحادثة...</div>`;
    if (form) form.hidden = false;
    if (status) status.textContent = "";

    try {
      const response = await AccountantServices.getConversation(this._currentUserId, contactId);
      const messages = Array.isArray(response) ? response : (response?.data || []);
      this.renderMessageConversation(messages);
    } catch (err) {
      if (messagesArea) messagesArea.innerHTML = `<div class="accountant-message-inline-note error">تعذر تحميل الرسائل: ${this._escape(err.message)}</div>`;
    }
  },

  renderMessageConversation(messages) {
    const area = document.getElementById("accountant-chat-messages");
    if (!area) return;

    const ordered = [...(messages || [])].sort((a, b) => new Date(a.created_at || a.timestamp || 0) - new Date(b.created_at || b.timestamp || 0));

    if (ordered.length === 0) {
      area.innerHTML = `<div class="accountant-chat-empty"><p>لا توجد رسائل بعد.</p></div>`;
      return;
    }

    area.innerHTML = ordered.map(msg => {
      const isMine = Number(msg.sender_id) === this._currentUserId;
      const author = isMine ? "أنت" : (msg.sender_name || this._activeMessageContact?.name || "المستخدم");
      const date = msg.created_at ? new Date(msg.created_at).toLocaleString("ar-DZ") : "";

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
      status.textContent = "جاري الإرسال...";
      status.className = "";
    }

    try {
      await AccountantServices.sendMessage(this._currentUserId, this._activeMessageContact.id, content);
      input.value = "";
      if (status) status.textContent = "تم الإرسال";
      await this.openMessageConversation(this._activeMessageContact.id, this._activeMessageContact.name);
      this.refreshMessageContacts();
    } catch (err) {
      if (status) {
        status.textContent = "فشل الإرسال: " + err.message;
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
      console.warn("تعذر تحديث صندوق المحادثات:", err);
    }
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
        ? (message.receiver_name || message.receiver_full_name || message.receiver_username || `مستخدم #${contactId}`)
        : (message.sender_name || message.sender_full_name || message.sender_username || `مستخدم #${contactId}`);
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
      return `<div class="accountant-message-empty-list">لا توجد محادثات بعد.</div>`;
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

  _translate(str) {
    const map = { payments: "المدفوعات", fees: "الرسوم والديون", transactions: "الدفتر اليومي", students: "ملفات الطلاب", search: "بحث وعمليات", attendance: "مراقبة الغيابات", messages: "المراسلة" };
    return map[str] || str;
  },
  _translateStatus(status) {
    const map = { paid: "مدفوع", unpaid: "غير مدفوع", partial: "مدفوع جزئياً", overdue: "متأخر", completed: "مكتمل", pending: "قيد الانتظار", active: "نشط", inactive: "غير نشط" };
    return map[(status||"").toLowerCase()] || status;
  },
  _formatCurrency(amount) {
    if (amount === null || amount === undefined) return "0 دج";
    return Number(amount).toLocaleString('ar-DZ') + " دج";
  },
  _formatValue(value) { return value === null || value === undefined || value === "" ? "-" : value; },
  _escape(value) { return String(this._formatValue(value)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); },
  _escapeAttr(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
};

// js/roles/receptionist/tabs/messages.js

ReceptionistUI._currentUserId = null;
ReceptionistUI._activeMessageContact = null;

ReceptionistUI.renderMessages = function(inboxData, userId) {
  this._currentUserId = Number(userId);
  this._activeMessageContact = null;
  const contacts = this._buildMessageContacts(inboxData, this._currentUserId);
  const main = document.getElementById("receptionist-main");

  main.innerHTML = `
    <section class="receptionist-messages-dashboard">
      <div class="receptionist-messages-header">
        <div>
          <h2>المراسلة</h2>
          <p>تابع محادثات الاستقبال أو ابحث عن مستخدم جديد للتواصل معه.</p>
        </div>
        <div class="receptionist-message-search">
          <input type="text" id="receptionist-message-user-search" placeholder="ابحث باسم المستخدم..." autocomplete="off">
          <button type="button" id="receptionist-message-search-btn">بحث</button>
        </div>
      </div>

      <div class="receptionist-message-search-results" id="receptionist-message-search-results"></div>

      <div class="receptionist-messages-shell">
        <aside class="receptionist-message-contacts">
          <div class="receptionist-message-panel-title">المحادثات</div>
          <div id="receptionist-message-contacts-list">
            ${this._renderMessageContacts(contacts)}
          </div>
        </aside>

        <section class="receptionist-chat-panel">
          <div id="receptionist-chat-header" class="receptionist-chat-header">اختر محادثة من القائمة أو ابحث عن مستخدم جديد.</div>
          <div id="receptionist-chat-messages" class="receptionist-chat-messages">
            <div class="receptionist-chat-empty">
              <p>المحادثة ستظهر هنا.</p>
            </div>
          </div>
          <form id="receptionist-message-form" class="receptionist-message-form" hidden>
            <textarea id="receptionist-message-input" rows="2" placeholder="اكتب رسالتك..." required></textarea>
            <button type="submit">إرسال</button>
            <small id="receptionist-message-status"></small>
          </form>
        </section>
      </div>
    </section>
  `;

  this._bindMessageEvents();
};

ReceptionistUI.searchMessageUsers = async function() {
  const input = document.getElementById("receptionist-message-user-search");
  const results = document.getElementById("receptionist-message-search-results");
  const keyword = input?.value?.trim() || "";

  if (!results) return;
  if (keyword.length < 2) {
    results.innerHTML = `<div class="receptionist-message-inline-note">اكتب حرفين على الأقل للبحث.</div>`;
    return;
  }

  results.innerHTML = `<div class="receptionist-message-inline-note">جاري البحث...</div>`;

  try {
    const response = await ReceptionistServices.searchUsers(keyword);
    const users = (Array.isArray(response) ? response : (response?.data || []))
      .filter(user => {
        const userId = Number(user.id ?? user.user_id);
        return userId && userId !== this._currentUserId;
      });

    if (users.length === 0) {
      results.innerHTML = `<div class="receptionist-message-inline-note">لا توجد نتائج مطابقة.</div>`;
      return;
    }

    results.innerHTML = users.map(user => {
      const userId = Number(user.id ?? user.user_id);
      const name = user.full_name || user.username || `مستخدم #${userId}`;
      const role = user.role_name || user.role || user.user_type || "مستخدم";

      return `
        <button type="button" class="receptionist-message-user-result" data-user-id="${userId}" data-user-name="${this._escapeAttr(name)}">
          <span>${this._escape(name)}</span>
          <small>${this._escape(this._translateRole(role))}</small>
        </button>
      `;
    }).join("");

    results.querySelectorAll(".receptionist-message-user-result").forEach(btn => {
      btn.addEventListener("click", () => {
        results.innerHTML = "";
        this.openMessageConversation(Number(btn.dataset.userId), btn.dataset.userName);
      });
    });
  } catch (err) {
    results.innerHTML = `<div class="receptionist-message-inline-note error">فشل البحث: ${this._escape(err.message)}</div>`;
  }
};

ReceptionistUI.openMessageConversation = async function(contactId, contactName) {
  this._activeMessageContact = { id: Number(contactId), name: contactName };

  const header = document.getElementById("receptionist-chat-header");
  const messagesArea = document.getElementById("receptionist-chat-messages");
  const form = document.getElementById("receptionist-message-form");
  const status = document.getElementById("receptionist-message-status");

  if (header) header.textContent = contactName;
  if (messagesArea) messagesArea.innerHTML = `<div class="receptionist-message-inline-note">جاري تحميل المحادثة...</div>`;
  if (form) form.hidden = false;
  if (status) status.textContent = "";

  try {
    const response = await ReceptionistServices.getConversation(this._currentUserId, contactId);
    const messages = Array.isArray(response) ? response : (response?.data || []);
    this.renderMessageConversation(messages);
  } catch (err) {
    if (messagesArea) messagesArea.innerHTML = `<div class="receptionist-message-inline-note error">تعذر تحميل الرسائل: ${this._escape(err.message)}</div>`;
  }
};

ReceptionistUI.renderMessageConversation = function(messages) {
  const area = document.getElementById("receptionist-chat-messages");
  if (!area) return;

  const ordered = [...(messages || [])].sort((a, b) => new Date(a.created_at || a.timestamp || 0) - new Date(b.created_at || b.timestamp || 0));

  if (ordered.length === 0) {
    area.innerHTML = `<div class="receptionist-chat-empty"><p>لا توجد رسائل بعد.</p></div>`;
    return;
  }

  area.innerHTML = ordered.map(msg => {
    const isMine = Number(msg.sender_id) === this._currentUserId;
    const author = isMine ? "أنت" : (msg.sender_name || this._activeMessageContact?.name || "المستخدم");
    const date = msg.created_at ? new Date(msg.created_at).toLocaleString("ar-DZ") : "";

    return `
      <div class="receptionist-message-bubble${isMine ? " mine" : ""}">
        <div class="receptionist-message-author">${this._escape(author)}</div>
        <div>${this._escape(msg.content || "")}</div>
        <time>${date}</time>
      </div>
    `;
  }).join("");

  area.scrollTop = area.scrollHeight;
};

ReceptionistUI.sendMessageToActiveContact = async function() {
  const input = document.getElementById("receptionist-message-input");
  const status = document.getElementById("receptionist-message-status");
  const content = input?.value?.trim() || "";

  if (!this._activeMessageContact || !content) return;

  if (status) {
    status.textContent = "جاري الإرسال...";
    status.className = "";
  }

  try {
    await ReceptionistServices.sendMessage(this._currentUserId, this._activeMessageContact.id, content);
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
};

ReceptionistUI.refreshMessageContacts = async function() {
  if (!this._currentUserId) return;

  try {
    const inbox = await ReceptionistServices.getMessagesInbox(this._currentUserId);
    const contacts = this._buildMessageContacts(inbox, this._currentUserId);
    const list = document.getElementById("receptionist-message-contacts-list");
    if (list) {
      list.innerHTML = this._renderMessageContacts(contacts);
      this._bindMessageContactEvents();
    }
  } catch (err) {
    console.warn("تعذر تحديث صندوق المحادثات:", err);
  }
};

ReceptionistUI._bindMessageEvents = function() {
  document.getElementById("receptionist-message-search-btn")?.addEventListener("click", () => this.searchMessageUsers());
  document.getElementById("receptionist-message-user-search")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") this.searchMessageUsers();
  });
  document.getElementById("receptionist-message-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    this.sendMessageToActiveContact();
  });
  this._bindMessageContactEvents();
};

ReceptionistUI._bindMessageContactEvents = function() {
  document.querySelectorAll(".receptionist-message-contact").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".receptionist-message-contact").forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      this.openMessageConversation(Number(btn.dataset.contactId), btn.dataset.contactName);
    });
  });
};

ReceptionistUI._buildMessageContacts = function(inboxData, userId) {
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
};

ReceptionistUI._renderMessageContacts = function(contacts) {
  if (!contacts || contacts.length === 0) {
    return `<div class="receptionist-message-empty-list">لا توجد محادثات بعد.</div>`;
  }

  return contacts.map(contact => {
    const activeClass = Number(contact.id) === this._activeMessageContact?.id ? " active" : "";

    return `
      <button type="button" class="receptionist-message-contact${activeClass}" data-contact-id="${contact.id}" data-contact-name="${this._escapeAttr(contact.name)}">
        <span>${this._escape(contact.name)}</span>
        <small>${this._escape(contact.last_message || "...")}</small>
      </button>
    `;
  }).join("");
};

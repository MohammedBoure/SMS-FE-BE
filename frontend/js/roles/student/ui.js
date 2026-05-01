// js/roles/student/ui.js

const StudentUI = {
  SECTIONS: ["schedule", "assessments", "grades", "attendance", "resources", "posts", "messages", "fees", "notifications"],
  _postsCache: [],
  _currentUserId: null,
  _activeMessageContact: null,

  renderHeader(userProfile) {
    const header = document.getElementById("student-header");
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px;">
        <h1>مرحباً: ${userProfile ? userProfile.full_name : '...'}</h1>
        <button id="logout-btn">تسجيل خروج</button>
      </div>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  },

  renderNav(activeSection) {
    const nav = document.getElementById("student-nav");
    nav.innerHTML = this.SECTIONS.map(s =>
      `<button class="nav-btn${activeSection === s ? " active" : ""}" data-section="${s}">${this._translate(s)}</button>`
    ).join("");
  },

  renderLoading() {
    document.getElementById("student-main").innerHTML = "<h3>جاري التحميل...</h3>";
  },

  renderError(msg) {
    document.getElementById("student-main").innerHTML = `<h3 style="color: red;">خطأ: ${msg}</h3>`;
  },

  renderSchedule(scheduleData) {
    const schedule = Array.isArray(scheduleData) ? scheduleData : (scheduleData?.data || []);
    const main = document.getElementById("student-main");
    if (!schedule || schedule.length === 0) {
      main.innerHTML = "<h2>الجدول الزمني</h2><p>لم يتم إعداد الجدول الزمني لقسمك بعد.</p>";
      return;
    }
    const rows = schedule.map(s => `
      <tr>
        <td><strong>${this._translateDay(s.day_of_week)}</strong></td>
        <td><span style="direction:ltr; display:inline-block;">${this._formatTime(s.start_time)} - ${this._formatTime(s.end_time)}</span></td>
        <td>${s.subject_name}</td>
        <td>${this._escape(s.program_name || "-")} / ${this._escape(s.class_name || "-")}</td>
        <td>${s.teacher_name}</td>
        <td>${s.room_number || "غير محدد"}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>الجدول الزمني الأسبوعي</h2>
      <table>
        <thead><tr><th>اليوم</th><th>التوقيت</th><th>المادة</th><th>البرنامج / الفوج</th><th>الأستاذ</th><th>القاعة</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderAssessments(assessmentsData) {
    const assessments = Array.isArray(assessmentsData) ? assessmentsData : (assessmentsData?.data || []);
    const main = document.getElementById("student-main");
    if (!assessments || assessments.length === 0) {
      main.innerHTML = "<h2>الامتحانات والفروض القادمة</h2><p>لا توجد امتحانات مبرمجة حالياً.</p>";
      return;
    }
    const rows = assessments.map(a => `
      <tr>
        <td>${a.subject_name}</td>
        <td>${a.title} (${a.type === 'exam' ? 'امتحان' : 'واجب'})</td>
        <td>${this._escape(a.program_name || "-")} / ${this._escape(a.class_name || "-")}</td>
        <td><strong style="color:#e11d48;">${a.due_date || "غير محدد"}</strong></td>
        <td>${a.max_grade}</td>
        <td>${a.teacher_name}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>الامتحانات والفروض القادمة</h2>
      <table>
        <thead><tr><th>المادة</th><th>عنوان التقييم</th><th>البرنامج / الفوج</th><th>تاريخ الإجراء</th><th>العلامة القصوى</th><th>الأستاذ</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderGrades(gradesData) {
    const grades = Array.isArray(gradesData) ? gradesData : (gradesData?.data || []);
    const main = document.getElementById("student-main");
    if (!grades || grades.length === 0) {
      main.innerHTML = "<h2>كشف النقاط</h2><p>لا توجد علامات مرصودة لك حتى الآن.</p>";
      return;
    }
    const rows = grades.map(g => `
      <tr>
        <td><strong>${g.subject_name}</strong></td>
        <td>${g.assessment_title} (${g.assessment_type === 'exam' ? 'امتحان' : 'واجب'})</td>
        <td>${this._escape(g.program_name || "-")} / ${this._escape(g.class_name || "-")}</td>
        <td style="direction: ltr; text-align: right; font-weight: bold; color: ${g.grade_value >= (g.max_grade/2) ? 'green' : 'red'};">${g.grade_value} / ${g.max_grade}</td>
        <td>${g.teacher_name}</td>
        <td>${g.teacher_remarks || "-"}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>كشف النقاط والعلامات</h2>
      <table>
        <thead><tr><th>المادة</th><th>التقييم</th><th>البرنامج / الفوج</th><th>العلامة</th><th>الأستاذ</th><th>ملاحظات</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderAttendance(recordsData) {
    const records = Array.isArray(recordsData) ? recordsData : (recordsData?.data || []);
    const main = document.getElementById("student-main");
    if (!records || records.length === 0) {
      main.innerHTML = "<h2>سجل الغياب</h2><p>سجلك نظيف، لا يوجد غيابات.</p>";
      return;
    }
    const rows = records.map(r => {
      let statusAr = r.status === 'present' ? 'حاضر' : (r.status === 'absent' ? 'غائب' : 'متأخر');
      let statusColor = r.status === 'absent' ? 'color: red;' : 'color: green;';
      return `
      <tr>
        <td>${r.date}</td>
        <td>${this._escape(r.class_name || "-")}</td>
        <td style="font-weight:bold; ${statusColor}">${statusAr}</td>
        <td>${r.is_justified ? 'نعم (' + (r.justification_reason || '') + ')' : 'لا'}</td>
      </tr>
    `;
    }).join("");
    main.innerHTML = `
      <h2>سجل الحضور والغياب</h2>
      <table>
        <thead><tr><th>التاريخ</th><th>الفوج</th><th>الحالة</th><th>مُبرر؟</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderResources(resourcesData) {
    const resources = Array.isArray(resourcesData) ? resourcesData : (resourcesData?.data || []);
    const main = document.getElementById("student-main");
    if (!resources || resources.length === 0) {
      main.innerHTML = "<h2>الدروس والموارد</h2><p>لا توجد ملفات مرفوعة حالياً.</p>";
      return;
    }
    const items = resources.map(r => `
      <div style="background: #fff; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-right: 4px solid #0ea5e9; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
        <div>
            <strong style="display:block; font-size:1.1rem; color: #0f172a;">${r.title}</strong>
            <small style="color: #64748b;">النوع: ${r.resource_type} | الحجم: ${r.file_size_mb} MB</small>
            ${r.description ? `<p style="margin: 5px 0 0 0; color: #475569; font-size: 0.95rem;">${r.description}</p>` : ''}
        </div>
        <div>
            <a href="http://localhost:8000/resources/${r.id}/download" target="_blank" style="background: #0ea5e9; color: white; padding: 8px 15px; text-decoration: none; border-radius: 6px; font-weight: 600;">تحميل</a>
        </div>
      </div>
    `).join("");
    main.innerHTML = `<h2>الدروس والموارد التعليمية</h2><div>${items}</div>`;
  },

  renderFees(feesData) {
    const fees = Array.isArray(feesData) ? feesData : (feesData?.data || []);
    const main = document.getElementById("student-main");
    if (!fees || fees.length === 0) {
      main.innerHTML = "<h2>الوضعية المالية</h2><p>لا توجد رسوم مسجلة عليك.</p>";
      return;
    }
    const rows = fees.map(f => `
      <tr>
        <td>${f.fee_type} ${f.program_name ? '('+f.program_name+')' : ''} ${f.class_name ? '- '+f.class_name : ''}</td>
        <td>${f.amount_due} DZD</td>
        <td>${f.applied_discount} DZD</td>
        <td style="font-weight: bold; color: #0f172a;">${f.net_amount} DZD</td>
        <td style="direction: ltr; text-align: right;">${f.due_date}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>الوضعية المالية (الرسوم المستحقة)</h2>
      <table>
        <thead><tr><th>نوع الرسم (البرنامج)</th><th>المبلغ الإجمالي</th><th>الخصم</th><th>المبلغ الصافي</th><th>تاريخ الاستحقاق</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderNotifications(notificationsData) {
    const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.data || []);
    const main = document.getElementById("student-main");
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
          ? `<button type="button" class="student-mark-notification-read" data-notification-id="${this._escape(notificationId)}" style="background:#f59e0b; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">تعيين كمقروء</button>`
          : `<span style="color:#64748b; font-weight:700;">غير متاح</span>`;

      return `
        <div style="background:#fff; padding:15px; margin-bottom:10px; border-radius:8px; border-right:4px solid ${isRead ? '#94a3b8' : '#f59e0b'}; box-shadow:0 2px 4px rgba(0,0,0,0.05); opacity:${isRead ? '.78' : '1'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:5px;">
            <strong style="display:block; font-size:1.1rem;">${this._escape(n.title || "إشعار")}</strong>
            <span style="white-space:nowrap; color:${isRead ? '#16a34a' : '#d97706'}; background:${isRead ? '#dcfce7' : '#fef3c7'}; border:1px solid ${isRead ? '#bbf7d0' : '#fde68a'}; padding:4px 10px; border-radius:999px; font-size:.85rem; font-weight:700;">${isRead ? 'مقروء' : 'غير مقروء'}</span>
          </div>
          <p style="margin:0; color:#475569;">${this._escape(n.message || "")}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:8px; flex-wrap:wrap;">
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
        ${unreadCount > 0 ? '<button type="button" id="student-mark-all-notifications-read" style="background:#0f172a; color:white; border:none; padding:10px 14px; border-radius:8px; cursor:pointer; font-weight:700;">تعيين الكل كمقروء</button>' : ''}
      </div>
      <div>${items}</div>
    `;
  },

  renderPosts(postsData) {
    const posts = Array.isArray(postsData) ? postsData : (postsData?.data || []);
    const main = document.getElementById("student-main");
    const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    this._postsCache = sortedPosts;

    if (!sortedPosts || sortedPosts.length === 0) {
      main.innerHTML = `
        <div class="posts-dashboard student-posts-dashboard">
          <div class="posts-header-bar">
            <div>
              <h3>منشورات الإدارة</h3>
              <p>الإعلانات والمحتوى المنشور من الإدارة يظهر هنا.</p>
            </div>
          </div>
          <div class="posts-empty">
            <div class="empty-icon">📭</div>
            <h4>لا توجد منشورات حالياً</h4>
            <p>ستظهر منشورات الإدارة هنا عند توفرها.</p>
          </div>
        </div>
      `;
      return;
    }

    const cards = sortedPosts.map((post, index) => {
      const title = this._escape(post.title || "منشور بدون عنوان");
      const date = this._formatPostDate(post.created_at);
      const excerpt = this._escape(this._extractPostSnippet(post.content ?? ""));

      return `
        <article class="student-post-list-card">
          ${post.image
            ? `<img src="${this._escape(post.image)}" class="student-post-thumb" alt="${title}">`
            : `<div class="student-post-thumb student-post-thumb-placeholder">📄</div>`}
          <div class="student-post-summary">
            <div>
              <div class="student-post-label">من الإدارة</div>
              <h3 class="student-post-list-title">${title}</h3>
              <p>${excerpt || "اضغط لعرض تفاصيل المنشور."}</p>
            </div>
            <div class="student-post-list-actions">
              <time class="student-post-date">${date}</time>
              <button type="button" class="student-post-open" data-post-index="${index}">عرض التفاصيل</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    main.innerHTML = `
      <div class="posts-dashboard student-posts-dashboard">
        <div class="posts-header-bar">
          <div>
            <h3>منشورات الإدارة</h3>
            <p>اختر منشوراً من القائمة لعرض التفاصيل الكاملة.</p>
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
    const main = document.getElementById("student-main");

    if (!post) {
      this.renderPosts(this._postsCache);
      return;
    }

    const title = this._escape(post.title || "منشور بدون عنوان");
    const date = this._formatPostDate(post.created_at);
    const contentHtml = this._processPostMarkdown(post.content ?? "");

    main.innerHTML = `
      <div class="posts-dashboard student-posts-dashboard">
        <div class="student-post-detail-topbar">
          <button type="button" class="btn-secondary" id="student-posts-back">← الرجوع للمنشورات</button>
          <time class="student-post-date">${date}</time>
        </div>
        <article class="student-post-card student-post-detail">
          ${post.image ? `<img src="${this._escape(post.image)}" class="student-post-cover" alt="${title}">` : ""}
          <div class="student-post-head">
            <div>
              <div class="student-post-label">من الإدارة</div>
              <h3 class="preview-title">${title}</h3>
            </div>
          </div>
          <div class="md-body">${contentHtml || '<p class="preview-placeholder">لا يوجد محتوى لهذا المنشور.</p>'}</div>
        </article>
      </div>
    `;

    document.getElementById("student-posts-back")?.addEventListener("click", () => this.renderPosts(this._postsCache));
    this._typesetMath(main);
  },

  renderMessages(inboxData, userId) {
    this._currentUserId = Number(userId);
    this._activeMessageContact = null;
    const contacts = this._buildMessageContacts(inboxData, this._currentUserId);
    const main = document.getElementById("student-main");

    main.innerHTML = `
      <section class="student-messages-dashboard">
        <div class="student-messages-header">
          <div>
            <h2>المراسلة</h2>
            <p>تواصل مع الإدارة أو الأساتذة أو أي مستخدم متاح في النظام.</p>
          </div>
          <div class="student-message-search">
            <input type="text" id="student-message-user-search" placeholder="ابحث باسم المستخدم..." autocomplete="off">
            <button type="button" id="student-message-search-btn">بحث</button>
          </div>
        </div>

        <div class="student-message-search-results" id="student-message-search-results"></div>

        <div class="student-messages-shell">
          <aside class="student-message-contacts">
            <div class="student-message-panel-title">المحادثات</div>
            <div id="student-message-contacts-list">
              ${this._renderMessageContacts(contacts)}
            </div>
          </aside>

          <section class="student-chat-panel">
            <div id="student-chat-header" class="student-chat-header">اختر محادثة من القائمة أو ابحث عن مستخدم جديد.</div>
            <div id="student-chat-messages" class="student-chat-messages">
              <div class="student-chat-empty">
                <div>💬</div>
                <p>المحادثة ستظهر هنا.</p>
              </div>
            </div>
            <form id="student-message-form" class="student-message-form" hidden>
              <textarea id="student-message-input" rows="2" placeholder="اكتب رسالتك..." required></textarea>
              <button type="submit">إرسال</button>
              <small id="student-message-status"></small>
            </form>
          </section>
        </div>
      </section>
    `;

    this._bindMessageEvents();
  },

  async searchMessageUsers() {
    const input = document.getElementById("student-message-user-search");
    const results = document.getElementById("student-message-search-results");
    const keyword = input?.value?.trim() || "";

    if (!results) return;
    if (keyword.length < 2) {
      results.innerHTML = `<div class="student-message-inline-note">اكتب حرفين على الأقل للبحث.</div>`;
      return;
    }

    results.innerHTML = `<div class="student-message-inline-note">جاري البحث...</div>`;

    try {
      const response = await StudentServices.searchUsers(keyword);
      const users = (Array.isArray(response) ? response : (response?.data || []))
        .filter(user => Number(user.id) !== this._currentUserId);

      if (users.length === 0) {
        results.innerHTML = `<div class="student-message-inline-note">لا توجد نتائج مطابقة.</div>`;
        return;
      }

      results.innerHTML = users.map(user => `
        <button type="button" class="student-message-user-result" data-user-id="${user.id}" data-user-name="${this._escape(user.full_name || user.username || ('مستخدم #' + user.id))}">
          <span>${this._escape(user.full_name || user.username || ('مستخدم #' + user.id))}</span>
          <small>${this._escape(user.role_name || "مستخدم")}</small>
        </button>
      `).join("");

      results.querySelectorAll(".student-message-user-result").forEach(btn => {
        btn.addEventListener("click", () => {
          results.innerHTML = "";
          this.openMessageConversation(Number(btn.dataset.userId), btn.dataset.userName);
        });
      });
    } catch (err) {
      results.innerHTML = `<div class="student-message-inline-note error">فشل البحث: ${this._escape(err.message)}</div>`;
    }
  },

  async openMessageConversation(contactId, contactName) {
    this._activeMessageContact = { id: Number(contactId), name: contactName };

    const header = document.getElementById("student-chat-header");
    const messagesArea = document.getElementById("student-chat-messages");
    const form = document.getElementById("student-message-form");
    const status = document.getElementById("student-message-status");

    if (header) header.textContent = contactName;
    if (messagesArea) messagesArea.innerHTML = `<div class="student-message-inline-note">جاري تحميل المحادثة...</div>`;
    if (form) form.hidden = false;
    if (status) status.textContent = "";

    try {
      const response = await StudentServices.getConversation(this._currentUserId, contactId);
      const messages = Array.isArray(response) ? response : (response?.data || []);
      this.renderMessageConversation(messages);
    } catch (err) {
      if (messagesArea) messagesArea.innerHTML = `<div class="student-message-inline-note error">تعذر تحميل الرسائل: ${this._escape(err.message)}</div>`;
    }
  },

  renderMessageConversation(messages) {
    const area = document.getElementById("student-chat-messages");
    if (!area) return;

    const ordered = [...(messages || [])].sort((a, b) => new Date(a.created_at || a.timestamp || 0) - new Date(b.created_at || b.timestamp || 0));

    if (ordered.length === 0) {
      area.innerHTML = `<div class="student-chat-empty"><div>✉️</div><p>لا توجد رسائل بعد.</p></div>`;
      return;
    }

    area.innerHTML = ordered.map(msg => {
      const isMine = Number(msg.sender_id) === this._currentUserId;
      const author = isMine ? "أنت" : (msg.sender_name || this._activeMessageContact?.name || "المستخدم");
      const date = msg.created_at ? new Date(msg.created_at).toLocaleString("ar-DZ") : "";

      return `
        <div class="student-message-bubble${isMine ? " mine" : ""}">
          <div class="student-message-author">${this._escape(author)}</div>
          <div>${this._escape(msg.content || "")}</div>
          <time>${date}</time>
        </div>
      `;
    }).join("");

    area.scrollTop = area.scrollHeight;
  },

  async sendMessageToActiveContact() {
    const input = document.getElementById("student-message-input");
    const status = document.getElementById("student-message-status");
    const content = input?.value?.trim() || "";

    if (!this._activeMessageContact || !content) return;

    if (status) {
      status.textContent = "جاري الإرسال...";
      status.className = "";
    }

    try {
      await StudentServices.sendMessage(this._currentUserId, this._activeMessageContact.id, content);
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
      const inbox = await StudentServices.getMessagesInbox(this._currentUserId);
      const contacts = this._buildMessageContacts(inbox, this._currentUserId);
      const list = document.getElementById("student-message-contacts-list");
      if (list) {
        list.innerHTML = this._renderMessageContacts(contacts);
        this._bindMessageContactEvents();
      }
    } catch (err) {
      console.warn("تعذر تحديث صندوق المحادثات:", err);
    }
  },

  _getNotificationId(notification) {
    const id = notification?.id ?? notification?.notification_id;
    return id === undefined || id === null || id === "" ? null : id;
  },

  _isNotificationRead(notification) {
    const value = notification?.is_read;
    return value === true || value === 1 || value === "1" || value === "true";
  },

  _translate(str) {
    const map = {
      schedule: "الجدول الزمني", assessments: "الامتحانات", grades: "العلامات", 
      attendance: "الغياب", resources: "الدروس", posts: "منشورات الإدارة", messages: "المراسلة", fees: "المالية", notifications: "الإشعارات"
    };
    return map[str] || str;
  },

  _translateDay(day) {
    const map = { 'Sunday': 'الأحد', 'Monday': 'الإثنين', 'Tuesday': 'الثلاثاء', 'Wednesday': 'الأربعاء', 'Thursday': 'الخميس', 'Friday': 'الجمعة', 'Saturday': 'السبت' };
    return map[day] || day;
  },

  _bindMessageEvents() {
    document.getElementById("student-message-search-btn")?.addEventListener("click", () => this.searchMessageUsers());
    document.getElementById("student-message-user-search")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.searchMessageUsers();
    });
    document.getElementById("student-message-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendMessageToActiveContact();
    });
    this._bindMessageContactEvents();
  },

  _bindMessageContactEvents() {
    document.querySelectorAll(".student-message-contact").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".student-message-contact").forEach(item => item.classList.remove("active"));
        btn.classList.add("active");
        this.openMessageConversation(Number(btn.dataset.contactId), btn.dataset.contactName);
      });
    });
  },

  _buildMessageContacts(inboxData, userId) {
    const messages = Array.isArray(inboxData) ? inboxData : (inboxData?.data || []);
    const contacts = new Map();

    messages.forEach(message => {
      const senderId = Number(message.sender_id);
      const receiverId = Number(message.receiver_id);
      const contactId = senderId === Number(userId) ? receiverId : senderId;
      if (!contactId || contactId === Number(userId)) return;

      const contactName = senderId === Number(userId)
        ? (message.receiver_name || `مستخدم #${contactId}`)
        : (message.sender_name || `مستخدم #${contactId}`);
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
      return `<div class="student-message-empty-list">لا توجد محادثات بعد.</div>`;
    }

    return contacts.map(contact => `
      <button type="button" class="student-message-contact" data-contact-id="${contact.id}" data-contact-name="${this._escape(contact.name)}">
        <span>${this._escape(contact.name)}</span>
        <small>${this._escape(contact.last_message || "...")}</small>
      </button>
    `).join("");
  },

  _processPostMarkdown(raw) {
    if (!raw) return "";

    let source = String(raw).replace(
      /\[تحميل:\s*([^\]|]+?)(?:\|([^\]|]*?))?(?:\|([^\]]*?))?\]\(([^)]+)\)/g,
      (_, name, type, size, url) => {
        const safeUrl = this._escape(url.trim());
        const safeName = this._escape(name.trim());
        const ext = safeUrl.split(".").pop()?.split("?")[0];
        const icon = this._getFileIcon(ext);
        const meta = [type, size].map(part => part?.trim()).filter(Boolean).join(" · ");

        return `
          <a href="${safeUrl}" target="_blank" class="dl-card" rel="noopener noreferrer">
            <span class="dl-card-icon">${icon}</span>
            <span class="dl-card-info">
              <span class="dl-card-name">${safeName}</span>
              ${meta ? `<span class="dl-card-meta">${this._escape(meta)}</span>` : ""}
            </span>
            <span class="dl-card-btn">تحميل</span>
          </a>
        `;
      }
    );

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
    if (!value) return "تاريخ غير محدد";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "تاريخ غير محدد";

    return date.toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  },

  _formatTime(value) {
    if (value === null || value === undefined || value === "") return "00:00";

    const raw = String(value).trim();
    if (raw.includes(":")) {
      const [hours = "0", minutes = "0"] = raw.split(":");
      return `${String(parseInt(hours, 10) || 0).padStart(2, "0")}:${String(parseInt(minutes, 10) || 0).padStart(2, "0")}`;
    }

    const totalSeconds = Number(raw);
    if (Number.isNaN(totalSeconds)) return raw;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
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
    const icons = { pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊", ppt: "📑", pptx: "📑", zip: "🗜️", rar: "🗜️", mp4: "🎬", mp3: "🎵", png: "🖼️", jpg: "🖼️", jpeg: "🖼️" };
    return icons[ext?.toLowerCase()] || "📎";
  },

  _escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }
};

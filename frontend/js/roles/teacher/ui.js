// js/roles/teacher/ui.js

const TeacherUI = {
  SECTIONS: ["assignments", "schedule", "attendance", "grades", "resources", "posts", "messages", "notifications"],
  _postsCache: [],
  _currentUserId: null,
  _activeMessageContact: null,

  renderHeader(session, teacherData) {
    const header = document.getElementById("teacher-header");
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #2c3e50; color: white;">
        <h1>مرحباً أستاذ(ة): ${teacherData ? teacherData.full_name : '...'}</h1>
        <button id="logout-btn" style="padding: 5px 15px; background: #e74c3c; color: white; border: none; cursor: pointer;">تسجيل خروج</button>
      </div>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  },

  renderNav(activeSection) {
    const nav = document.getElementById("teacher-nav");
    nav.innerHTML = this.SECTIONS.map(s =>
      `<button class="nav-btn${activeSection === s ? " active" : ""}" data-section="${s}" style="margin: 5px; padding: 10px;">${this._translate(s)}</button>`
    ).join("");
  },

  renderLoading() {
    document.getElementById("teacher-main").innerHTML = "<h3>جاري التحميل...</h3>";
  },

  renderError(msg) {
    document.getElementById("teacher-main").innerHTML = `<h3 style="color: red;">خطأ: ${msg}</h3>`;
  },

  // 1. الأقسام والمواد
  renderAssignments(assignments) {
    const main = document.getElementById("teacher-main");
    if (!assignments || assignments.length === 0) {
      main.innerHTML = "<h2>أقسامي وموادي</h2><p>لم يتم إسناد أي أقسام لك بعد.</p>";
      return;
    }
    const rows = assignments.map(a => `
      <tr>
        <td>${a.class_name} (${a.level})</td>
        <td>${a.subject_name}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>الأقسام المسندة إليك</h2>
      <table border="1" width="100%" cellpadding="10">
        <thead><tr style="background:#f2f2f2;"><th>القسم (المستوى)</th><th>المادة</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  // 2. الجدول الزمني
  renderSchedule(schedule) {
    const main = document.getElementById("teacher-main");
    if (!schedule || schedule.length === 0) {
      main.innerHTML = "<h2>الجدول الزمني</h2><p>لا يوجد حصص مبرمجة.</p>";
      return;
    }
    const rows = schedule.map(s => `
      <tr>
        <td>${this._translateDay(s.day_of_week)}</td>
        <td>${this._formatTime(s.start_time)} - ${this._formatTime(s.end_time)}</td>
        <td>${s.class_name} (${s.level})</td>
        <td>${s.subject_name}</td>
        <td>${s.room_number || "غير محدد"}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>الجدول الأسبوعي</h2>
      <table border="1" width="100%" cellpadding="10">
        <thead><tr style="background:#f2f2f2;"><th>اليوم</th><th>التوقيت</th><th>القسم</th><th>المادة</th><th>القاعة</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  // 3. الغياب
  renderAttendance(assignments) {
    const options = assignments.map(a => `<option value="${a.class_id}">${a.class_name}</option>`).join("");
    const today = new Date().toISOString().split('T')[0];
    
    document.getElementById("teacher-main").innerHTML = `
      <h2>تسجيل الغياب والحضور</h2>
      <div style="margin-bottom: 20px;">
        <select id="attendance-class-select" style="padding: 5px;">${options}</select>
        <input type="date" id="attendance-date" value="${today}" style="padding: 5px;" />
        <button id="load-attendance-btn" style="padding: 5px 10px;">جلب قائمة المناداة</button>
      </div>
      <div id="attendance-sheet-container"></div>
    `;
  },

  renderAttendanceSheet(students, date) {
    const container = document.getElementById("attendance-sheet-container");
    if (!students || students.length === 0) {
      container.innerHTML = "<p>لا يوجد طلاب في هذا القسم.</p>";
      return;
    }
    const rows = students.map(s => `
      <tr>
        <td>${s.student_name}</td>
        <td>
          <select class="attendance-status" data-student-id="${s.student_id}" data-date="${date}">
            <option value="present" ${s.status === 'present' ? 'selected' : ''}>حاضر</option>
            <option value="absent" ${s.status === 'absent' ? 'selected' : ''}>غائب</option>
            <option value="late" ${s.status === 'late' ? 'selected' : ''}>متأخر</option>
          </select>
        </td>
        <td>
          <button class="save-attendance-btn" data-student-id="${s.student_id}">حفظ</button>
        </td>
      </tr>
    `).join("");
    
    container.innerHTML = `
      <table border="1" width="100%" cellpadding="10">
        <thead><tr style="background:#f2f2f2;"><th>الطالب</th><th>الحالة</th><th>إجراء</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  // 4. العلامات والتقييمات
  renderGrades(assignments) {
    const options = assignments.map(a => `<option value="${a.assignment_id}">${a.class_name} - ${a.subject_name}</option>`).join("");
    document.getElementById("teacher-main").innerHTML = `
      <h2>إدارة العلامات والتقييمات</h2>
      <div style="margin-bottom: 20px;">
        <select id="grades-assignment-select" style="padding: 5px;">${options}</select>
        <button id="load-assessments-btn" style="padding: 5px 10px;">عرض التقييمات</button>
      </div>
      <hr/>
      <div id="assessments-list-container"></div>
      <div id="grades-sheet-container" style="margin-top:20px;"></div>
    `;
  },

  renderAssessmentsList(assessments, assignmentId) {
    const container = document.getElementById("assessments-list-container");
    let html = `
      <div style="background:#ecf0f1; padding: 10px; margin-bottom:15px;">
        <h3>إضافة تقييم جديد (امتحان/واجب)</h3>
        <input type="text" id="new-assess-title" placeholder="عنوان التقييم (مثال: الفرض الأول)" required/>
        <select id="new-assess-type"><option value="exam">امتحان</option><option value="homework">واجب</option></select>
        <input type="number" id="new-assess-max" placeholder="العلامة القصوى" value="20" />
        <button id="create-assess-btn" data-assignment-id="${assignmentId}">إنشاء</button>
      </div>
    `;

    if (assessments && assessments.length > 0) {
      const rows = assessments.map(a => `
        <tr>
          <td>${a.title}</td>
          <td>${a.type === 'exam' ? 'امتحان' : 'واجب'}</td>
          <td>${a.max_grade}</td>
          <td><button class="load-grades-btn" data-assessment-id="${a.id}">رصد العلامات</button></td>
        </tr>
      `).join("");
      html += `<table border="1" width="100%" cellpadding="5"><thead><tr style="background:#f2f2f2;"><th>العنوان</th><th>النوع</th><th>العلامة القصوى</th><th>إجراء</th></tr></thead><tbody>${rows}</tbody></table>`;
    } else {
      html += "<p>لا توجد تقييمات سابقة.</p>";
    }
    container.innerHTML = html;
    document.getElementById("grades-sheet-container").innerHTML = ""; // مسح جدول العلامات القديم
  },

  renderGradesSheet(grades, assessmentId) {
    const container = document.getElementById("grades-sheet-container");
    const rows = grades.map(g => `
      <tr>
        <td>${g.student_name}</td>
        <td><input type="number" step="0.25" class="grade-input" data-student-id="${g.student_id}" value="${g.grade_value !== null ? g.grade_value : ''}" max="${g.max_grade}" /> / ${g.max_grade}</td>
        <td><input type="text" class="remark-input" data-student-id="${g.student_id}" value="${g.teacher_remarks || ''}" placeholder="ملاحظات..." /></td>
        <td><button class="save-grade-btn" data-student-id="${g.student_id}" data-assessment-id="${assessmentId}">حفظ</button></td>
      </tr>
    `).join("");
    
    container.innerHTML = `
      <h3>قائمة رصد العلامات</h3>
      <table border="1" width="100%" cellpadding="5">
        <thead><tr style="background:#f2f2f2;"><th>الطالب</th><th>العلامة</th><th>ملاحظات الأستاذ</th><th>إجراء</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  // 5. الموارد (الملفات)
  renderResources(assignments) {
    const options = assignments.map(a => `<option value="${a.assignment_id}">${a.class_name} - ${a.subject_name}</option>`).join("");
    document.getElementById("teacher-main").innerHTML = `
      <h2>الموارد التعليمية</h2>
      <div style="background:#ecf0f1; padding: 10px; margin-bottom:20px;">
        <h3>رفع ملف جديد للقسم</h3>
        <form id="upload-resource-form">
          <select id="resource-assignment-id" required>${options}</select>
          <input type="text" id="resource-title" placeholder="عنوان الدرس/الملف" required />
          <select id="resource-type"><option value="document">مستند</option><option value="video">فيديو</option></select>
          <input type="file" id="resource-file" required />
          <button type="submit">رفع المورد</button>
        </form>
      </div>
      <div id="resources-list-container">
        <p>اختر قسماً لعرض موارده...</p>
      </div>
    `;
  },

  renderNotifications(notificationsData) {
    const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.data || []);
    const main = document.getElementById("teacher-main");

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
          ? `<button type="button" class="teacher-mark-notification-read" data-notification-id="${this._escape(notificationId)}" style="background:#4f46e5; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">تعيين كمقروء</button>`
          : `<span style="color:#64748b; font-weight:700;">غير متاح</span>`;

      return `
        <div style="background:#fff; padding:16px 18px; margin-bottom:12px; border-radius:12px; border-right:4px solid ${isRead ? '#94a3b8' : '#4f46e5'}; box-shadow:0 2px 8px rgba(15,23,42,.06); opacity:${isRead ? '.78' : '1'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:6px;">
            <strong style="display:block; color:#0f172a; font-size:1.05rem;">${this._escape(n.title || "إشعار")}</strong>
            <span style="white-space:nowrap; color:${isRead ? '#16a34a' : '#d97706'}; background:${isRead ? '#dcfce7' : '#fef3c7'}; border:1px solid ${isRead ? '#bbf7d0' : '#fde68a'}; padding:4px 10px; border-radius:999px; font-size:.85rem; font-weight:700;">${isRead ? 'مقروء' : 'غير مقروء'}</span>
          </div>
          <p style="margin:0; color:#334155; line-height:1.7;">${this._escape(n.message || "")}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:10px; flex-wrap:wrap;">
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
        ${unreadCount > 0 ? '<button type="button" id="teacher-mark-all-notifications-read" style="background:#0f172a; color:white; border:none; padding:10px 14px; border-radius:8px; cursor:pointer; font-weight:700;">تعيين الكل كمقروء</button>' : ''}
      </div>
      <div>${items}</div>
    `;
  },

  renderMessages(inboxData, userId) {
    this._currentUserId = Number(userId);
    this._activeMessageContact = null;
    const contacts = this._buildMessageContacts(inboxData, this._currentUserId);
    const main = document.getElementById("teacher-main");

    main.innerHTML = `
      <section class="teacher-messages-dashboard">
        <div class="teacher-messages-header">
          <div>
            <h2>المراسلة</h2>
            <p>تابع محادثاتك أو ابحث عن طالب أو ولي أمر أو مستخدم آخر للتواصل معه.</p>
          </div>
          <div class="teacher-message-search">
            <input type="text" id="teacher-message-user-search" placeholder="ابحث باسم المستخدم..." autocomplete="off">
            <button type="button" id="teacher-message-search-btn">بحث</button>
          </div>
        </div>

        <div class="teacher-message-search-results" id="teacher-message-search-results"></div>

        <div class="teacher-messages-shell">
          <aside class="teacher-message-contacts">
            <div class="teacher-message-panel-title">المحادثات</div>
            <div id="teacher-message-contacts-list">
              ${this._renderMessageContacts(contacts)}
            </div>
          </aside>

          <section class="teacher-chat-panel">
            <div id="teacher-chat-header" class="teacher-chat-header">اختر محادثة من القائمة أو ابحث عن مستخدم جديد.</div>
            <div id="teacher-chat-messages" class="teacher-chat-messages">
              <div class="teacher-chat-empty">
                <p>المحادثة ستظهر هنا.</p>
              </div>
            </div>
            <form id="teacher-message-form" class="teacher-message-form" hidden>
              <textarea id="teacher-message-input" rows="2" placeholder="اكتب رسالتك..." required></textarea>
              <button type="submit">إرسال</button>
              <small id="teacher-message-status"></small>
            </form>
          </section>
        </div>
      </section>
    `;

    this._bindMessageEvents();
  },

  async searchMessageUsers() {
    const input = document.getElementById("teacher-message-user-search");
    const results = document.getElementById("teacher-message-search-results");
    const keyword = input?.value?.trim() || "";

    if (!results) return;
    if (keyword.length < 2) {
      results.innerHTML = `<div class="teacher-message-inline-note">اكتب حرفين على الأقل للبحث.</div>`;
      return;
    }

    results.innerHTML = `<div class="teacher-message-inline-note">جاري البحث...</div>`;

    try {
      const response = await TeacherServices.searchUsers(keyword);
      const users = (Array.isArray(response) ? response : (response?.data || []))
        .filter(user => {
          const userId = Number(user.id ?? user.user_id);
          return userId && userId !== this._currentUserId;
        });

      if (users.length === 0) {
        results.innerHTML = `<div class="teacher-message-inline-note">لا توجد نتائج مطابقة.</div>`;
        return;
      }

      results.innerHTML = users.map(user => {
        const userId = Number(user.id ?? user.user_id);
        const name = user.full_name || user.username || `مستخدم #${userId}`;
        const role = user.role_name || user.role || user.user_type || "مستخدم";

        return `
          <button type="button" class="teacher-message-user-result" data-user-id="${userId}" data-user-name="${this._escape(name)}">
            <span>${this._escape(name)}</span>
            <small>${this._escape(role)}</small>
          </button>
        `;
      }).join("");

      results.querySelectorAll(".teacher-message-user-result").forEach(btn => {
        btn.addEventListener("click", () => {
          results.innerHTML = "";
          this.openMessageConversation(Number(btn.dataset.userId), btn.dataset.userName);
        });
      });
    } catch (err) {
      results.innerHTML = `<div class="teacher-message-inline-note error">فشل البحث: ${this._escape(err.message)}</div>`;
    }
  },

  async openMessageConversation(contactId, contactName) {
    this._activeMessageContact = { id: Number(contactId), name: contactName };

    const header = document.getElementById("teacher-chat-header");
    const messagesArea = document.getElementById("teacher-chat-messages");
    const form = document.getElementById("teacher-message-form");
    const status = document.getElementById("teacher-message-status");

    if (header) header.textContent = contactName;
    if (messagesArea) messagesArea.innerHTML = `<div class="teacher-message-inline-note">جاري تحميل المحادثة...</div>`;
    if (form) form.hidden = false;
    if (status) status.textContent = "";

    try {
      const response = await TeacherServices.getConversation(this._currentUserId, contactId);
      const messages = Array.isArray(response) ? response : (response?.data || []);
      this.renderMessageConversation(messages);
    } catch (err) {
      if (messagesArea) messagesArea.innerHTML = `<div class="teacher-message-inline-note error">تعذر تحميل الرسائل: ${this._escape(err.message)}</div>`;
    }
  },

  renderMessageConversation(messages) {
    const area = document.getElementById("teacher-chat-messages");
    if (!area) return;

    const ordered = [...(messages || [])].sort((a, b) => new Date(a.created_at || a.timestamp || 0) - new Date(b.created_at || b.timestamp || 0));

    if (ordered.length === 0) {
      area.innerHTML = `<div class="teacher-chat-empty"><p>لا توجد رسائل بعد.</p></div>`;
      return;
    }

    area.innerHTML = ordered.map(msg => {
      const isMine = Number(msg.sender_id) === this._currentUserId;
      const author = isMine ? "أنت" : (msg.sender_name || this._activeMessageContact?.name || "المستخدم");
      const date = msg.created_at ? new Date(msg.created_at).toLocaleString("ar-DZ") : "";

      return `
        <div class="teacher-message-bubble${isMine ? " mine" : ""}">
          <div class="teacher-message-author">${this._escape(author)}</div>
          <div>${this._escape(msg.content || "")}</div>
          <time>${date}</time>
        </div>
      `;
    }).join("");

    area.scrollTop = area.scrollHeight;
  },

  async sendMessageToActiveContact() {
    const input = document.getElementById("teacher-message-input");
    const status = document.getElementById("teacher-message-status");
    const content = input?.value?.trim() || "";

    if (!this._activeMessageContact || !content) return;

    if (status) {
      status.textContent = "جاري الإرسال...";
      status.className = "";
    }

    try {
      await TeacherServices.sendMessage(this._currentUserId, this._activeMessageContact.id, content);
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
      const inbox = await TeacherServices.getMessagesInbox(this._currentUserId);
      const contacts = this._buildMessageContacts(inbox, this._currentUserId);
      const list = document.getElementById("teacher-message-contacts-list");
      if (list) {
        list.innerHTML = this._renderMessageContacts(contacts);
        this._bindMessageContactEvents();
      }
    } catch (err) {
      console.warn("تعذر تحديث صندوق المحادثات:", err);
    }
  },

  renderPosts(postsData) {
    const posts = Array.isArray(postsData) ? postsData : (postsData?.data || []);
    const main = document.getElementById("teacher-main");
    const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    this._postsCache = sortedPosts;

    if (!sortedPosts || sortedPosts.length === 0) {
      main.innerHTML = `
        <div class="posts-dashboard student-posts-dashboard teacher-posts-dashboard">
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
      const snippet = this._extractPostSnippet(post.content ?? "");
      const excerpt = snippet ? this._escape(snippet) : "";

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
      <div class="posts-dashboard student-posts-dashboard teacher-posts-dashboard">
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
    const main = document.getElementById("teacher-main");

    if (!post) {
      this.renderPosts(this._postsCache);
      return;
    }

    const title = this._escape(post.title || "منشور بدون عنوان");
    const date = this._formatPostDate(post.created_at);
    const contentHtml = this._processPostMarkdown(post.content ?? "");

    main.innerHTML = `
      <div class="posts-dashboard student-posts-dashboard teacher-posts-dashboard">
        <div class="student-post-detail-topbar">
          <button type="button" class="btn-secondary" id="teacher-posts-back">← الرجوع للمنشورات</button>
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

    document.getElementById("teacher-posts-back")?.addEventListener("click", () => this.renderPosts(this._postsCache));
    this._typesetMath(main);
  },

  // دوال مساعدة
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
      assignments: "أقسامي", schedule: "الجدول الزمني", attendance: "الغياب", 
      grades: "العلامات", resources: "الموارد", posts: "منشورات الإدارة", messages: "المراسلة", notifications: "الإشعارات"
    };
    return map[str] || str;
  },
  _bindMessageEvents() {
    document.getElementById("teacher-message-search-btn")?.addEventListener("click", () => this.searchMessageUsers());
    document.getElementById("teacher-message-user-search")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.searchMessageUsers();
    });
    document.getElementById("teacher-message-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendMessageToActiveContact();
    });
    this._bindMessageContactEvents();
  },

  _bindMessageContactEvents() {
    document.querySelectorAll(".teacher-message-contact").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".teacher-message-contact").forEach(item => item.classList.remove("active"));
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
      return `<div class="teacher-message-empty-list">لا توجد محادثات بعد.</div>`;
    }

    return contacts.map(contact => {
      const activeClass = Number(contact.id) === this._activeMessageContact?.id ? " active" : "";

      return `
        <button type="button" class="teacher-message-contact${activeClass}" data-contact-id="${contact.id}" data-contact-name="${this._escape(contact.name)}">
          <span>${this._escape(contact.name)}</span>
          <small>${this._escape(contact.last_message || "...")}</small>
        </button>
      `;
    }).join("");
  },

  _translateDay(day) {
    const map = { 'Sunday': 'الأحد', 'Monday': 'الإثنين', 'Tuesday': 'الثلاثاء', 'Wednesday': 'الأربعاء', 'Thursday': 'الخميس', 'Friday': 'الجمعة', 'Saturday': 'السبت' };
    return map[day] || day;
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

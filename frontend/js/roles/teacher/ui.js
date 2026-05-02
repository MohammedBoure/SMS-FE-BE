// js/roles/teacher/ui.js

const TeacherUI = {
  SECTIONS: ["assignments", "schedule", "attendance", "grades", "resources", "posts", "messages", "notifications"],
  _postsCache: [],
  _currentUserId: null,
  _activeMessageContact: null,

  renderHeader(session, teacherData) {
    const header = document.getElementById("teacher-header");
    const name = teacherData ? teacherData.full_name : "...";
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
      <div class="teacher-header-shell">
        <div class="teacher-brand">
          <div class="teacher-brand-mark" aria-hidden="true">T</div>
          <div class="teacher-brand-copy">
            <h1>${this.t("teacher.brand.welcome", { name: this._escape(name) }, `Welcome, teacher ${this._escape(name)}`)}</h1>
            <small>${this.t("teacher.brand.subtitle", {}, "Teaching workspace")}</small>
          </div>
        </div>
        <div class="teacher-header-actions">
          <label class="teacher-language-control">
            <span>${this.t("teacher.language.label", {}, "Language")}</span>
            <select id="teacher-language-select" aria-label="${this._escapeAttr(this.t("teacher.language.select", {}, "Choose language"))}">
              ${options}
            </select>
          </label>
          <button type="button" class="teacher-theme-toggle" id="teacher-theme-toggle" aria-pressed="false">
            <span class="teacher-theme-indicator" aria-hidden="true"></span>
            <span class="teacher-theme-label">${this.t("teacher.theme.light", {}, "Light")}</span>
          </button>
          <button id="logout-btn">${this.t("teacher.auth.logout", {}, "Log out")}</button>
        </div>
      </div>
    `;

    document.getElementById("logout-btn")?.addEventListener("click", () => Auth.logout());
    this.initTheme();
    const languageSelect = document.getElementById("teacher-language-select");
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
      ? AppPreferences.getTheme("teacher", document.documentElement.dataset.theme)
      : (localStorage.getItem("sms-theme") || localStorage.getItem("teacher-theme"));
    const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    this.applyTheme(stored || document.documentElement.dataset.theme || preferred);

    const toggle = document.getElementById("teacher-theme-toggle");
    if (!toggle || toggle.dataset.bound === "true") return;

    toggle.addEventListener("click", () => {
      const current = document.body.dataset.theme === "dark" ? "dark" : "light";
      this.applyTheme(current === "dark" ? "light" : "dark");
    });
    toggle.dataset.bound = "true";
  },

  applyTheme(theme) {
    const nextTheme = window.AppPreferences
      ? AppPreferences.applyTheme(theme, { scope: "teacher", persist: true })
      : (theme === "dark" ? "dark" : "light");
    if (!window.AppPreferences) {
      document.documentElement.dataset.theme = nextTheme;
      document.body.dataset.theme = nextTheme;
      localStorage.setItem("sms-theme", nextTheme);
      localStorage.setItem("teacher-theme", nextTheme);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", nextTheme === "dark" ? "#0b1220" : "#0f766e");
    }

    const toggle = document.getElementById("teacher-theme-toggle");
    if (!toggle) return;

    const isDark = nextTheme === "dark";
    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    const label = toggle.querySelector(".teacher-theme-label");
    if (label) {
      label.textContent = isDark
        ? this.t("teacher.theme.dark", {}, "Dark")
        : this.t("teacher.theme.light", {}, "Light");
    }
  },

  renderNav(activeSection) {
    const nav = document.getElementById("teacher-nav");
    nav.innerHTML = this.SECTIONS.map(section => `
      <button class="nav-btn${activeSection === section ? " active" : ""}" data-section="${this._escapeAttr(section)}">
        ${this._translate(section)}
      </button>
    `).join("");
  },

  renderLoading() {
    document.getElementById("teacher-main").innerHTML = `
      <h3>${this.t("teacher.state.loading", {}, "Loading data...")}</h3>
    `;
  },

  renderError(msg) {
    document.getElementById("teacher-main").innerHTML = `
      <h3 style="color: #ef4444;">
        ${this.t("teacher.state.errorPrefix", {}, "Error:")} ${this._escape(msg)}
      </h3>
    `;
  },

  renderAssignments(assignmentsData) {
    const assignments = this._toArray(assignmentsData);
    const main = document.getElementById("teacher-main");

    if (!assignments.length) {
      main.innerHTML = this._emptySection(
        "teacher.assignments.emptyTitle",
        "My Classes and Subjects",
        "teacher.assignments.emptyText",
        "No classes have been assigned to you yet."
      );
      return;
    }

    const rows = assignments.map(assignment => `
      <tr>
        <td>${this._escape(assignment.class_name)} (${this._escape(assignment.level)})</td>
        <td>${this._escape(assignment.subject_name)}</td>
      </tr>
    `).join("");

    main.innerHTML = `
      <h2>${this.t("teacher.assignments.title", {}, "Classes Assigned to You")}</h2>
      ${this._table(`
        <thead>
          <tr>
            <th>${this.t("teacher.assignments.columns.classLevel", {}, "Class (level)")}</th>
            <th>${this.t("teacher.assignments.columns.subject", {}, "Subject")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      `)}
    `;
  },

  renderSchedule(scheduleData) {
    const schedule = this._toArray(scheduleData);
    const main = document.getElementById("teacher-main");

    if (!schedule.length) {
      main.innerHTML = this._emptySection(
        "teacher.schedule.emptyTitle",
        "Schedule",
        "teacher.schedule.emptyText",
        "There are no scheduled sessions."
      );
      return;
    }

    const rows = schedule.map(item => `
      <tr>
        <td><strong>${this._translateDay(item.day_of_week)}</strong></td>
        <td><span class="ltr-value">${this._formatTime(item.start_time)} - ${this._formatTime(item.end_time)}</span></td>
        <td>${this._escape(item.class_name)} (${this._escape(item.level)})</td>
        <td>${this._escape(item.subject_name)}</td>
        <td>${this._escape(item.room_number || this.t("teacher.common.notSpecified", {}, "Not specified"))}</td>
      </tr>
    `).join("");

    main.innerHTML = `
      <h2>${this.t("teacher.schedule.title", {}, "Weekly Schedule")}</h2>
      ${this._table(`
        <thead>
          <tr>
            <th>${this.t("teacher.schedule.columns.day", {}, "Day")}</th>
            <th>${this.t("teacher.schedule.columns.time", {}, "Time")}</th>
            <th>${this.t("teacher.schedule.columns.class", {}, "Class")}</th>
            <th>${this.t("teacher.schedule.columns.subject", {}, "Subject")}</th>
            <th>${this.t("teacher.schedule.columns.room", {}, "Room")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      `)}
    `;
  },

  renderAttendance(assignmentsData) {
    const assignments = this._toArray(assignmentsData);
    const main = document.getElementById("teacher-main");

    if (!assignments.length) {
      main.innerHTML = this._emptySection(
        "teacher.attendance.emptyTitle",
        "Attendance",
        "teacher.attendance.noAssignments",
        "No classes are available for attendance."
      );
      return;
    }

    const options = assignments.map(assignment => `
      <option value="${this._escapeAttr(assignment.class_id)}">${this._escape(assignment.class_name)}</option>
    `).join("");
    const today = new Date().toISOString().split("T")[0];

    main.innerHTML = `
      <h2>${this.t("teacher.attendance.title", {}, "Attendance and Absence Entry")}</h2>
      <div class="teacher-panel teacher-toolbar">
        <select id="attendance-class-select" aria-label="${this._escapeAttr(this.t("teacher.attendance.classSelect", {}, "Class"))}">
          ${options}
        </select>
        <input type="date" id="attendance-date" value="${today}" aria-label="${this._escapeAttr(this.t("teacher.attendance.date", {}, "Date"))}" />
        <button id="load-attendance-btn">${this.t("teacher.attendance.loadButton", {}, "Load attendance sheet")}</button>
      </div>
      <div id="attendance-sheet-container"></div>
    `;
  },

  renderAttendanceSheet(studentsData, date) {
    const students = this._toArray(studentsData);
    const container = document.getElementById("attendance-sheet-container");
    if (!container) return;

    if (!students.length) {
      container.innerHTML = `<p>${this.t("teacher.attendance.emptyStudents", {}, "There are no students in this class.")}</p>`;
      return;
    }

    const rows = students.map(student => `
      <tr>
        <td>${this._escape(student.student_name)}</td>
        <td>
          <select class="attendance-status" data-student-id="${this._escapeAttr(student.student_id)}" data-date="${this._escapeAttr(date)}">
            <option value="present" ${student.status === "present" ? "selected" : ""}>${this._translateStatus("present")}</option>
            <option value="absent" ${student.status === "absent" ? "selected" : ""}>${this._translateStatus("absent")}</option>
            <option value="late" ${student.status === "late" ? "selected" : ""}>${this._translateStatus("late")}</option>
          </select>
        </td>
        <td>
          <button class="save-attendance-btn" data-student-id="${this._escapeAttr(student.student_id)}">${this.t("teacher.common.save", {}, "Save")}</button>
        </td>
      </tr>
    `).join("");

    container.innerHTML = this._table(`
      <thead>
        <tr>
          <th>${this.t("teacher.attendance.columns.student", {}, "Student")}</th>
          <th>${this.t("teacher.attendance.columns.status", {}, "Status")}</th>
          <th>${this.t("teacher.common.action", {}, "Action")}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    `);
  },

  renderGrades(assignmentsData) {
    const assignments = this._toArray(assignmentsData);
    const main = document.getElementById("teacher-main");

    if (!assignments.length) {
      main.innerHTML = this._emptySection(
        "teacher.grades.emptyTitle",
        "Grades and Assessments",
        "teacher.grades.noAssignments",
        "No assignments are available for grade entry."
      );
      return;
    }

    const options = assignments.map(assignment => `
      <option value="${this._escapeAttr(assignment.assignment_id)}">${this._escape(assignment.class_name)} - ${this._escape(assignment.subject_name)}</option>
    `).join("");

    main.innerHTML = `
      <h2>${this.t("teacher.grades.title", {}, "Grades and Assessments Management")}</h2>
      <div class="teacher-panel teacher-toolbar">
        <select id="grades-assignment-select" aria-label="${this._escapeAttr(this.t("teacher.grades.assignmentSelect", {}, "Assignment"))}">
          ${options}
        </select>
        <button id="load-assessments-btn">${this.t("teacher.grades.loadAssessments", {}, "Show assessments")}</button>
      </div>
      <hr/>
      <div id="assessments-list-container"></div>
      <div id="grades-sheet-container"></div>
    `;
  },

  renderAssessmentsList(assessmentsData, assignmentId) {
    const assessments = this._toArray(assessmentsData);
    const container = document.getElementById("assessments-list-container");
    if (!container) return;

    let html = `
      <div class="teacher-panel teacher-assessment-create">
        <h3>${this.t("teacher.grades.createTitle", {}, "Add a New Assessment")}</h3>
        <input type="text" id="new-assess-title" placeholder="${this._escapeAttr(this.t("teacher.grades.titlePlaceholder", {}, "Assessment title"))}" required/>
        <select id="new-assess-type">
          <option value="exam">${this._translateStatus("exam")}</option>
          <option value="homework">${this._translateStatus("homework")}</option>
        </select>
        <input type="number" id="new-assess-max" placeholder="${this._escapeAttr(this.t("teacher.grades.maxGradePlaceholder", {}, "Max grade"))}" value="20" />
        <button id="create-assess-btn" data-assignment-id="${this._escapeAttr(assignmentId)}">${this.t("teacher.common.create", {}, "Create")}</button>
      </div>
    `;

    if (assessments.length) {
      const rows = assessments.map(assessment => `
        <tr>
          <td>${this._escape(assessment.title)}</td>
          <td>${this._translateStatus(assessment.type === "exam" ? "exam" : "homework")}</td>
          <td>${this._escape(assessment.max_grade)}</td>
          <td><button class="load-grades-btn" data-assessment-id="${this._escapeAttr(assessment.id)}">${this.t("teacher.grades.enterGrades", {}, "Enter grades")}</button></td>
        </tr>
      `).join("");

      html += this._table(`
        <thead>
          <tr>
            <th>${this.t("teacher.grades.assessmentsColumns.title", {}, "Title")}</th>
            <th>${this.t("teacher.grades.assessmentsColumns.type", {}, "Type")}</th>
            <th>${this.t("teacher.grades.assessmentsColumns.maxGrade", {}, "Max grade")}</th>
            <th>${this.t("teacher.common.action", {}, "Action")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      `);
    } else {
      html += `<p>${this.t("teacher.grades.emptyAssessments", {}, "No previous assessments were found.")}</p>`;
    }

    container.innerHTML = html;
    const gradesContainer = document.getElementById("grades-sheet-container");
    if (gradesContainer) gradesContainer.innerHTML = "";
  },

  renderGradesSheet(gradesData, assessmentId) {
    const grades = this._toArray(gradesData);
    const container = document.getElementById("grades-sheet-container");
    if (!container) return;

    if (!grades.length) {
      container.innerHTML = `<p>${this.t("teacher.grades.emptySheet", {}, "No students are available for this assessment.")}</p>`;
      return;
    }

    const rows = grades.map(grade => `
      <tr>
        <td>${this._escape(grade.student_name)}</td>
        <td>
          <input type="number" step="0.25" class="grade-input" data-student-id="${this._escapeAttr(grade.student_id)}" value="${this._escapeAttr(grade.grade_value !== null ? grade.grade_value : "")}" max="${this._escapeAttr(grade.max_grade)}" />
          / ${this._escape(grade.max_grade)}
        </td>
        <td><input type="text" class="remark-input" data-student-id="${this._escapeAttr(grade.student_id)}" value="${this._escapeAttr(grade.teacher_remarks || "")}" placeholder="${this._escapeAttr(this.t("teacher.grades.remarksPlaceholder", {}, "Remarks..."))}" /></td>
        <td><button class="save-grade-btn" data-student-id="${this._escapeAttr(grade.student_id)}" data-assessment-id="${this._escapeAttr(assessmentId)}">${this.t("teacher.common.save", {}, "Save")}</button></td>
      </tr>
    `).join("");

    container.innerHTML = `
      <h3>${this.t("teacher.grades.sheetTitle", {}, "Grade Entry Sheet")}</h3>
      ${this._table(`
        <thead>
          <tr>
            <th>${this.t("teacher.grades.sheetColumns.student", {}, "Student")}</th>
            <th>${this.t("teacher.grades.sheetColumns.grade", {}, "Grade")}</th>
            <th>${this.t("teacher.grades.sheetColumns.remarks", {}, "Teacher remarks")}</th>
            <th>${this.t("teacher.common.action", {}, "Action")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      `)}
    `;
  },

  renderResources(assignmentsData) {
    const assignments = this._toArray(assignmentsData);
    const main = document.getElementById("teacher-main");

    if (!assignments.length) {
      main.innerHTML = this._emptySection(
        "teacher.resources.emptyTitle",
        "Educational Resources",
        "teacher.resources.noAssignments",
        "No assignments are available for uploading resources."
      );
      return;
    }

    const options = assignments.map(assignment => `
      <option value="${this._escapeAttr(assignment.assignment_id)}">${this._escape(assignment.class_name)} - ${this._escape(assignment.subject_name)}</option>
    `).join("");

    main.innerHTML = `
      <h2>${this.t("teacher.resources.title", {}, "Educational Resources")}</h2>
      <div class="teacher-panel teacher-resource-panel">
        <h3>${this.t("teacher.resources.uploadTitle", {}, "Upload a New File for the Class")}</h3>
        <form id="upload-resource-form">
          <select id="resource-assignment-id" required aria-label="${this._escapeAttr(this.t("teacher.resources.assignmentSelect", {}, "Class and subject"))}">${options}</select>
          <input type="text" id="resource-title" placeholder="${this._escapeAttr(this.t("teacher.resources.titlePlaceholder", {}, "Lesson/file title"))}" required />
          <select id="resource-type">
            <option value="document">${this.t("teacher.resources.types.document", {}, "Document")}</option>
            <option value="video">${this.t("teacher.resources.types.video", {}, "Video")}</option>
          </select>
          <input type="file" id="resource-file" required />
          <button type="submit">${this.t("teacher.resources.uploadButton", {}, "Upload resource")}</button>
        </form>
      </div>
      <div id="resources-list-container">
        <p>${this.t("teacher.resources.selectHint", {}, "Choose a class to view its resources...")}</p>
      </div>
    `;
  },

  renderResourcesLoading() {
    const container = document.getElementById("resources-list-container");
    if (!container) return;
    container.innerHTML = `<p class="teacher-resource-state">${this.t("teacher.resources.loading", {}, "Loading resources...")}</p>`;
  },

  renderResourcesError(message) {
    const container = document.getElementById("resources-list-container");
    if (!container) return;
    container.innerHTML = `
      <div class="teacher-resource-state teacher-resource-state-error">
        ${this.t("teacher.resources.loadFailed", {}, "Could not load resources.")}
        ${message ? `<small>${this._escape(message)}</small>` : ""}
      </div>
    `;
  },

  renderResourcesList(resourcesData) {
    const resources = this._toArray(resourcesData);
    const container = document.getElementById("resources-list-container");
    if (!container) return;

    if (!resources.length) {
      container.innerHTML = `
        <div class="teacher-resource-state">
          <strong>${this.t("teacher.resources.emptyListTitle", {}, "No resources for this class")}</strong>
          <span>${this.t("teacher.resources.emptyListText", {}, "Uploaded files linked to the selected class and subject will appear here.")}</span>
        </div>
      `;
      return;
    }

    const cards = resources.map(resource => {
      const id = resource.resource_id || resource.id;
      const date = resource.upload_date ? this.formatDateTime(resource.upload_date) : this.t("teacher.common.unknownDate", {}, "Unknown date");
      const type = this._translateResourceType(resource.resource_type);
      const size = resource.file_size_mb ? `${this._escape(resource.file_size_mb)} MB` : this.t("teacher.common.notSpecified", {}, "Not specified");
      const downloadAction = id
        ? `<a href="${this._escapeAttr(`${API_BASE_URL}/resources/${id}/download`)}" target="_blank" rel="noopener noreferrer">${this.t("teacher.common.download", {}, "Download")}</a>`
        : `<span>${this.t("teacher.common.unavailable", {}, "Unavailable")}</span>`;

      return `
        <article class="teacher-resource-card">
          <div class="teacher-resource-card-main">
            <div class="teacher-resource-type">${type}</div>
            <h3>${this._escape(resource.title || this.t("teacher.resources.untitled", {}, "Untitled resource"))}</h3>
            ${resource.description ? `<p>${this._escape(resource.description)}</p>` : ""}
            <div class="teacher-resource-meta">
              <span>${this.t("teacher.resources.sizeLabel", {}, "Size:")} ${size}</span>
              <span>${this.t("teacher.resources.uploadedAt", {}, "Uploaded:")} <span class="ltr-value">${date}</span></span>
            </div>
          </div>
          <div class="teacher-resource-actions">${downloadAction}</div>
        </article>
      `;
    }).join("");

    container.innerHTML = `
      <div class="teacher-resource-list-head">
        <h3>${this.t("teacher.resources.listTitle", {}, "Uploaded resources")}</h3>
        <small>${this.t("teacher.resources.count", { count: resources.length }, `${resources.length} file(s)`)}</small>
      </div>
      <div class="teacher-resource-list">${cards}</div>
    `;
  },

  renderNotifications(notificationsData) {
    const notifications = this._toArray(notificationsData);
    const main = document.getElementById("teacher-main");
    const start = this.start();
    const end = this.end();

    if (!notifications.length) {
      main.innerHTML = this._emptySection(
        "teacher.notifications.emptyTitle",
        "Notifications",
        "teacher.notifications.emptyText",
        "There are no new notifications."
      );
      return;
    }

    const unreadCount = notifications.filter(notification => !this._isNotificationRead(notification)).length;
    const items = notifications.map(notification => {
      const date = notification.created_at
        ? this.formatDateTime(notification.created_at)
        : this.t("teacher.common.unknownDate", {}, "Unknown date");
      const isRead = this._isNotificationRead(notification);
      const notificationId = this._getNotificationId(notification);
      const action = isRead
        ? `<span class="teacher-notification-action is-read">${this.t("teacher.notifications.read", {}, "Read")}</span>`
        : notificationId !== null
          ? `<button type="button" class="teacher-mark-notification-read" data-notification-id="${this._escapeAttr(notificationId)}">${this.t("teacher.notifications.markRead", {}, "Mark as read")}</button>`
          : `<span class="teacher-notification-action">${this.t("teacher.common.unavailable", {}, "Unavailable")}</span>`;
      const statusLabel = isRead
        ? this.t("teacher.notifications.read", {}, "Read")
        : this.t("teacher.notifications.unread", {}, "Unread");

      return `
        <article class="teacher-notification-card${isRead ? " is-read" : ""}" style="border-${start}: 4px solid ${isRead ? '#94a3b8' : '#4f46e5'};">
          <div class="teacher-notification-title-row">
            <strong>${this._escape(notification.title || this.t("teacher.notifications.defaultTitle", {}, "Notification"))}</strong>
            <span>${statusLabel}</span>
          </div>
          <p>${this._escape(notification.message || "")}</p>
          <div class="teacher-notification-footer">
            <small style="direction:ltr; text-align:${end};">${date}</small>
            ${action}
          </div>
        </article>
      `;
    }).join("");

    main.innerHTML = `
      <div class="teacher-section-topbar">
        <div>
          <h2>${this.t("teacher.notifications.title", {}, "Incoming Notifications")}</h2>
          <small>${this.t("teacher.notifications.unreadCount", { count: unreadCount }, `${unreadCount} unread`)}</small>
        </div>
        ${unreadCount > 0 ? `<button type="button" id="teacher-mark-all-notifications-read">${this.t("teacher.notifications.markAllRead", {}, "Mark all as read")}</button>` : ""}
      </div>
      <div class="teacher-notification-list">${items}</div>
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
            <h2>${this.t("teacher.messages.title", {}, "Messages")}</h2>
            <p>${this.t("teacher.messages.subtitle", {}, "Follow your conversations or search for another user to contact.")}</p>
          </div>
          <div class="teacher-message-search">
            <input type="text" id="teacher-message-user-search" placeholder="${this._escapeAttr(this.t("teacher.messages.searchPlaceholder", {}, "Search by user name..."))}" autocomplete="off">
            <button type="button" id="teacher-message-search-btn">${this.t("teacher.messages.searchButton", {}, "Search")}</button>
          </div>
        </div>

        <div class="teacher-message-search-results" id="teacher-message-search-results"></div>

        <div class="teacher-messages-shell">
          <aside class="teacher-message-contacts">
            <div class="teacher-message-panel-title">${this.t("teacher.messages.conversations", {}, "Conversations")}</div>
            <div id="teacher-message-contacts-list">
              ${this._renderMessageContacts(contacts)}
            </div>
          </aside>

          <section class="teacher-chat-panel">
            <div id="teacher-chat-header" class="teacher-chat-header">${this.t("teacher.messages.selectPrompt", {}, "Choose a conversation from the list or search for a new user.")}</div>
            <div id="teacher-chat-messages" class="teacher-chat-messages">
              <div class="teacher-chat-empty">
                <p>${this.t("teacher.messages.emptyConversation", {}, "The conversation will appear here.")}</p>
              </div>
            </div>
            <form id="teacher-message-form" class="teacher-message-form" hidden>
              <textarea id="teacher-message-input" rows="2" placeholder="${this._escapeAttr(this.t("teacher.messages.inputPlaceholder", {}, "Write your message..."))}" required></textarea>
              <button type="submit">${this.t("teacher.common.send", {}, "Send")}</button>
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
      results.innerHTML = `<div class="teacher-message-inline-note">${this.t("teacher.messages.minSearch", {}, "Type at least two characters to search.")}</div>`;
      return;
    }

    results.innerHTML = `<div class="teacher-message-inline-note">${this.t("teacher.messages.searching", {}, "Searching...")}</div>`;

    try {
      const response = await TeacherServices.searchUsers(keyword);
      const users = this._toArray(response).filter(user => {
        const userId = Number(user.id ?? user.user_id);
        return userId && userId !== this._currentUserId;
      });

      if (!users.length) {
        results.innerHTML = `<div class="teacher-message-inline-note">${this.t("teacher.messages.noResults", {}, "No matching results.")}</div>`;
        return;
      }

      results.innerHTML = users.map(user => {
        const userId = Number(user.id ?? user.user_id);
        const name = user.full_name || user.username || this.t("teacher.common.userFallback", { id: userId }, `User #${userId}`);
        const role = this._translateStatus(user.role_name || user.role || user.user_type || this.t("teacher.messages.roleFallback", {}, "User"));

        return `
          <button type="button" class="teacher-message-user-result" data-user-id="${userId}" data-user-name="${this._escapeAttr(name)}">
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
      results.innerHTML = `<div class="teacher-message-inline-note error">${this.t("teacher.messages.searchFailed", { message: this._escape(err.message) }, "Search failed.")}</div>`;
    }
  },

  async openMessageConversation(contactId, contactName) {
    this._activeMessageContact = { id: Number(contactId), name: contactName };

    const header = document.getElementById("teacher-chat-header");
    const messagesArea = document.getElementById("teacher-chat-messages");
    const form = document.getElementById("teacher-message-form");
    const status = document.getElementById("teacher-message-status");

    if (header) header.textContent = contactName;
    if (messagesArea) messagesArea.innerHTML = `<div class="teacher-message-inline-note">${this.t("teacher.messages.loadingConversation", {}, "Loading conversation...")}</div>`;
    if (form) form.hidden = false;
    if (status) status.textContent = "";

    try {
      const response = await TeacherServices.getConversation(this._currentUserId, contactId);
      this.renderMessageConversation(this._toArray(response));
    } catch (err) {
      if (messagesArea) {
        messagesArea.innerHTML = `<div class="teacher-message-inline-note error">${this.t("teacher.messages.loadFailed", { message: this._escape(err.message) }, "Could not load messages.")}</div>`;
      }
    }
  },

  renderMessageConversation(messages) {
    const area = document.getElementById("teacher-chat-messages");
    if (!area) return;

    const ordered = [...(messages || [])].sort((a, b) => new Date(a.created_at || a.timestamp || 0) - new Date(b.created_at || b.timestamp || 0));

    if (!ordered.length) {
      area.innerHTML = `<div class="teacher-chat-empty"><p>${this.t("teacher.messages.noMessages", {}, "No messages yet.")}</p></div>`;
      return;
    }

    area.innerHTML = ordered.map(message => {
      const isMine = Number(message.sender_id) === this._currentUserId;
      const author = isMine
        ? this.t("teacher.messages.you", {}, "You")
        : (message.sender_name || this._activeMessageContact?.name || this.t("teacher.messages.roleFallback", {}, "User"));
      const date = message.created_at ? this.formatDateTime(message.created_at) : "";

      return `
        <div class="teacher-message-bubble${isMine ? " mine" : ""}">
          <div class="teacher-message-author">${this._escape(author)}</div>
          <div>${this._escape(message.content || "")}</div>
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
      status.textContent = this.t("teacher.messages.sending", {}, "Sending...");
      status.className = "";
    }

    try {
      await TeacherServices.sendMessage(this._currentUserId, this._activeMessageContact.id, content);
      input.value = "";
      if (status) status.textContent = this.t("teacher.messages.sent", {}, "Sent");
      await this.openMessageConversation(this._activeMessageContact.id, this._activeMessageContact.name);
      this.refreshMessageContacts();
    } catch (err) {
      if (status) {
        status.textContent = this.t("teacher.messages.sendFailed", { message: err.message }, "Send failed.");
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
      console.warn("Could not refresh teacher message inbox:", err);
    }
  },

  renderPosts(postsData) {
    const posts = this._toArray(postsData);
    const main = document.getElementById("teacher-main");
    const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    this._postsCache = sortedPosts;

    if (!sortedPosts.length) {
      main.innerHTML = `
        <div class="posts-dashboard student-posts-dashboard teacher-posts-dashboard">
          <div class="posts-header-bar">
            <div>
              <h3>${this.t("teacher.posts.title", {}, "Administration Posts")}</h3>
              <p>${this.t("teacher.posts.emptySubtitle", {}, "Announcements and content published by administration will appear here.")}</p>
            </div>
          </div>
          <div class="posts-empty">
            <div class="empty-icon">${this.t("teacher.common.file", {}, "File")}</div>
            <h4>${this.t("teacher.posts.emptyTitle", {}, "No posts currently")}</h4>
            <p>${this.t("teacher.posts.emptyText", {}, "Administration posts will appear here when available.")}</p>
          </div>
        </div>
      `;
      return;
    }

    const cards = sortedPosts.map((post, index) => {
      const title = this._escape(post.title || this.t("teacher.posts.untitled", {}, "Untitled post"));
      const date = this._formatPostDate(post.created_at);
      const snippet = this._extractPostSnippet(post.content ?? "");
      const excerpt = snippet ? this._escape(snippet) : "";

      return `
        <article class="student-post-list-card">
          ${post.image
            ? `<img src="${this._escapeAttr(post.image)}" class="student-post-thumb" alt="${title}">`
            : `<div class="student-post-thumb student-post-thumb-placeholder">${this.t("teacher.posts.filePlaceholder", {}, "Document")}</div>`}
          <div class="student-post-summary">
            <div>
              <div class="student-post-label">${this.t("teacher.common.fromManagement", {}, "From administration")}</div>
              <h3 class="student-post-list-title">${title}</h3>
              <p>${excerpt || this.t("teacher.posts.openHint", {}, "Open the post to view its details.")}</p>
            </div>
            <div class="student-post-list-actions">
              <time class="student-post-date">${date}</time>
              <button type="button" class="student-post-open" data-post-index="${index}">${this.t("teacher.common.openDetails", {}, "View details")}</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    main.innerHTML = `
      <div class="posts-dashboard student-posts-dashboard teacher-posts-dashboard">
        <div class="posts-header-bar">
          <div>
            <h3>${this.t("teacher.posts.title", {}, "Administration Posts")}</h3>
            <p>${this.t("teacher.posts.listSubtitle", {}, "Choose a post from the list to view the full details.")}</p>
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

    const title = this._escape(post.title || this.t("teacher.posts.untitled", {}, "Untitled post"));
    const date = this._formatPostDate(post.created_at);
    const contentHtml = this._processPostMarkdown(post.content ?? "");

    main.innerHTML = `
      <div class="posts-dashboard student-posts-dashboard teacher-posts-dashboard">
        <div class="student-post-detail-topbar">
          <button type="button" class="btn-secondary" id="teacher-posts-back">${this.t("teacher.common.backToPosts", {}, "Back to posts")}</button>
          <time class="student-post-date">${date}</time>
        </div>
        <article class="student-post-card student-post-detail">
          ${post.image ? `<img src="${this._escapeAttr(post.image)}" class="student-post-cover" alt="${title}">` : ""}
          <div class="student-post-head">
            <div>
              <div class="student-post-label">${this.t("teacher.common.fromManagement", {}, "From administration")}</div>
              <h3 class="preview-title">${title}</h3>
            </div>
          </div>
          <div class="md-body">${contentHtml || `<p class="preview-placeholder">${this.t("teacher.common.noContent", {}, "This post has no content.")}</p>`}</div>
        </article>
      </div>
    `;

    document.getElementById("teacher-posts-back")?.addEventListener("click", () => this.renderPosts(this._postsCache));
    this._typesetMath(main);
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
    const messages = this._toArray(inboxData);
    const contacts = new Map();
    const currentUserId = Number(userId);

    messages.forEach(message => {
      const senderId = Number(message.sender_id);
      const receiverId = Number(message.receiver_id);
      const contactId = senderId === currentUserId ? receiverId : senderId;
      if (!contactId || contactId === currentUserId) return;

      const contactName = senderId === currentUserId
        ? (message.receiver_name || message.receiver_full_name || message.receiver_username || this.t("teacher.common.userFallback", { id: contactId }, `User #${contactId}`))
        : (message.sender_name || message.sender_full_name || message.sender_username || this.t("teacher.common.userFallback", { id: contactId }, `User #${contactId}`));
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
    if (!contacts || !contacts.length) {
      return `<div class="teacher-message-empty-list">${this.t("teacher.messages.emptyList", {}, "No conversations yet.")}</div>`;
    }

    return contacts.map(contact => {
      const activeClass = Number(contact.id) === this._activeMessageContact?.id ? " active" : "";

      return `
        <button type="button" class="teacher-message-contact${activeClass}" data-contact-id="${contact.id}" data-contact-name="${this._escapeAttr(contact.name)}">
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
          <span class="dl-card-btn">${this.t("teacher.common.download", {}, "Download")}</span>
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

  _emptySection(titleKey, titleFallback, textKey, textFallback) {
    return `
      <h2>${this.t(titleKey, {}, titleFallback)}</h2>
      <p>${this.t(textKey, {}, textFallback)}</p>
    `;
  },

  _table(content) {
    return `<div class="teacher-table-wrap"><table>${content}</table></div>`;
  },

  _toArray(value) {
    return Array.isArray(value) ? value : (value?.data || []);
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
    return this.t(`teacher.nav.${section}`, {}, section);
  },

  _translateDay(day) {
    const raw = String(day || "").trim();
    if (!raw) return this.t("teacher.common.notSpecified", {}, "Not specified");
    return this.t(`teacher.days.${raw}`, {}, raw);
  },

  _translateStatus(status) {
    const raw = String(status || "").trim();
    if (!raw) return this.t("teacher.common.notSpecified", {}, "Not specified");
    const normalized = raw.toLowerCase().replace(/\s+/g, "_");
    return this.t(`teacher.status.${normalized}`, {}, raw);
  },

  _translateResourceType(type) {
    const raw = String(type || "").trim();
    if (!raw) return this.t("teacher.resources.types.file", {}, "File");
    const normalized = raw.toLowerCase().replace(/\s+/g, "_");
    return this.t(`teacher.resources.types.${normalized}`, {}, raw);
  },

  _formatPostDate(value) {
    if (!value) return this.t("teacher.common.unknownDate", {}, "Unknown date");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return this.t("teacher.common.unknownDate", {}, "Unknown date");

    return date.toLocaleDateString(this.locale(), {
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
    return ext ? ext.toUpperCase().slice(0, 4) : this.t("teacher.common.file", {}, "File");
  },

  formatDateTime(value) {
    if (!value) return this.t("teacher.common.unknownDate", {}, "Unknown date");
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
      ? this.t("teacher.common.none", {}, "-")
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

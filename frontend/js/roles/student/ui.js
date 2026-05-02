// js/roles/student/ui.js

const StudentUI = {
  SECTIONS: ["schedule", "assessments", "grades", "attendance", "resources", "posts", "messages", "fees", "notifications"],
  _postsCache: [],
  _resourcesCache: [],
  _resourceFilters: {
    query: "",
    type: "all",
    sort: "newest"
  },
  _currentUserId: null,
  _activeMessageContact: null,

  renderHeader(userProfile) {
    const header = document.getElementById("student-header");
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
      <div class="student-header-shell">
        <h1>${this.t("student.brand.welcome", { name: this._escape(name) }, `Welcome: ${this._escape(name)}`)}</h1>
        <div class="student-header-actions">
          <label class="student-language-control">
            <span>${this.t("student.language.label", {}, "Language")}</span>
            <select id="student-language-select" aria-label="${this._escapeAttr(this.t("student.language.select", {}, "Choose language"))}">
              ${options}
            </select>
          </label>
          <button type="button" class="student-theme-toggle" id="student-theme-toggle" aria-pressed="false">
            <span class="student-theme-indicator" aria-hidden="true"></span>
            <span class="student-theme-label">${this.t("student.theme.light", {}, "Light")}</span>
          </button>
          <button id="logout-btn">${this.t("student.auth.logout", {}, "Log out")}</button>
        </div>
      </div>
    `;

    document.getElementById("logout-btn")?.addEventListener("click", () => Auth.logout());
    this.initTheme();
    const languageSelect = document.getElementById("student-language-select");
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
      ? AppPreferences.getTheme("student", document.documentElement.dataset.theme)
      : (localStorage.getItem("sms-theme") || localStorage.getItem("student-theme"));
    const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    this.applyTheme(stored || document.documentElement.dataset.theme || preferred);

    const toggle = document.getElementById("student-theme-toggle");
    if (!toggle || toggle.dataset.bound === "true") return;

    toggle.addEventListener("click", () => {
      const current = document.body.dataset.theme === "dark" ? "dark" : "light";
      this.applyTheme(current === "dark" ? "light" : "dark");
    });
    toggle.dataset.bound = "true";
  },

  applyTheme(theme) {
    const nextTheme = window.AppPreferences
      ? AppPreferences.applyTheme(theme, { scope: "student", persist: true })
      : (theme === "dark" ? "dark" : "light");
    if (!window.AppPreferences) {
      document.documentElement.dataset.theme = nextTheme;
      document.body.dataset.theme = nextTheme;
      localStorage.setItem("sms-theme", nextTheme);
      localStorage.setItem("student-theme", nextTheme);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", nextTheme === "dark" ? "#0b1220" : "#0f766e");
    }

    const toggle = document.getElementById("student-theme-toggle");
    if (!toggle) return;

    const isDark = nextTheme === "dark";
    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    const label = toggle.querySelector(".student-theme-label");
    if (label) {
      label.textContent = isDark
        ? this.t("student.theme.dark", {}, "Dark")
        : this.t("student.theme.light", {}, "Light");
    }
  },

  renderNav(activeSection) {
    const nav = document.getElementById("student-nav");
    nav.innerHTML = this.SECTIONS.map(section => `
      <button class="nav-btn${activeSection === section ? " active" : ""}" data-section="${this._escapeAttr(section)}">
        ${this._translate(section)}
      </button>
    `).join("");
  },

  renderLoading() {
    document.getElementById("student-main").innerHTML = `
      <h3>${this.t("student.state.loading", {}, "Loading data...")}</h3>
    `;
  },

  renderError(msg) {
    document.getElementById("student-main").innerHTML = `
      <h3 style="color: #ef4444;">
        ${this.t("student.state.errorPrefix", {}, "Error:")} ${this._escape(msg)}
      </h3>
    `;
  },

  renderSchedule(scheduleData) {
    const schedule = this._toArray(scheduleData);
    const main = document.getElementById("student-main");

    if (!schedule.length) {
      main.innerHTML = this._emptySection(
        "student.schedule.emptyTitle",
        "Schedule",
        "student.schedule.emptyText",
        "Your schedule has not been prepared yet."
      );
      return;
    }

    const rows = schedule.map(item => `
      <tr>
        <td><strong>${this._translateDay(item.day_of_week)}</strong></td>
        <td><span class="ltr-value">${this._formatTime(item.start_time)} - ${this._formatTime(item.end_time)}</span></td>
        <td>${this._escape(item.subject_name)}</td>
        <td>${this._escape(item.program_name || this.t("student.common.none", {}, "-"))} / ${this._escape(item.class_name || this.t("student.common.none", {}, "-"))}</td>
        <td>${this._escape(item.teacher_name)}</td>
        <td>${this._escape(item.room_number || this.t("student.common.notSpecified", {}, "Not specified"))}</td>
      </tr>
    `).join("");

    main.innerHTML = `
      <h2>${this.t("student.schedule.title", {}, "Weekly Schedule")}</h2>
      ${this._table(`
        <thead>
          <tr>
            <th>${this.t("student.schedule.columns.day", {}, "Day")}</th>
            <th>${this.t("student.schedule.columns.time", {}, "Time")}</th>
            <th>${this.t("student.schedule.columns.subject", {}, "Subject")}</th>
            <th>${this.t("student.schedule.columns.programClass", {}, "Program / Group")}</th>
            <th>${this.t("student.schedule.columns.teacher", {}, "Teacher")}</th>
            <th>${this.t("student.schedule.columns.room", {}, "Room")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      `)}
    `;
  },

  renderAssessments(assessmentsData) {
    const assessments = this._toArray(assessmentsData);
    const main = document.getElementById("student-main");

    if (!assessments.length) {
      main.innerHTML = this._emptySection(
        "student.assessments.emptyTitle",
        "Upcoming Assessments",
        "student.assessments.emptyText",
        "There are no scheduled assessments currently."
      );
      return;
    }

    const rows = assessments.map(item => {
      const type = this._translateStatus(item.type === "exam" ? "exam" : "homework");

      return `
        <tr>
          <td>${this._escape(item.subject_name)}</td>
          <td>${this._escape(item.title)} <span class="muted-value">(${this._escape(type)})</span></td>
          <td>${this._escape(item.program_name || this.t("student.common.none", {}, "-"))} / ${this._escape(item.class_name || this.t("student.common.none", {}, "-"))}</td>
          <td><strong class="danger-value">${this._escape(item.due_date || this.t("student.common.notSpecified", {}, "Not specified"))}</strong></td>
          <td>${this._escape(item.max_grade)}</td>
          <td>${this._escape(item.teacher_name)}</td>
        </tr>
      `;
    }).join("");

    main.innerHTML = `
      <h2>${this.t("student.assessments.title", {}, "Upcoming Assessments")}</h2>
      ${this._table(`
        <thead>
          <tr>
            <th>${this.t("student.assessments.columns.subject", {}, "Subject")}</th>
            <th>${this.t("student.assessments.columns.title", {}, "Assessment")}</th>
            <th>${this.t("student.assessments.columns.programClass", {}, "Program / Group")}</th>
            <th>${this.t("student.assessments.columns.dueDate", {}, "Due date")}</th>
            <th>${this.t("student.assessments.columns.maxGrade", {}, "Max grade")}</th>
            <th>${this.t("student.assessments.columns.teacher", {}, "Teacher")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      `)}
    `;
  },

  renderGrades(gradesData) {
    const grades = this._toArray(gradesData);
    const main = document.getElementById("student-main");
    const align = this.start();

    if (!grades.length) {
      main.innerHTML = this._emptySection(
        "student.grades.emptyTitle",
        "Grades",
        "student.grades.emptyText",
        "No grades have been recorded for you yet."
      );
      return;
    }

    const rows = grades.map(item => {
      const passed = Number(item.grade_value) >= (Number(item.max_grade) / 2);
      const type = this._translateStatus(item.assessment_type === "exam" ? "exam" : "homework");

      return `
        <tr>
          <td><strong>${this._escape(item.subject_name)}</strong></td>
          <td>${this._escape(item.assessment_title)} <span class="muted-value">(${this._escape(type)})</span></td>
          <td>${this._escape(item.program_name || this.t("student.common.none", {}, "-"))} / ${this._escape(item.class_name || this.t("student.common.none", {}, "-"))}</td>
          <td style="direction: ltr; text-align: ${align}; font-weight: bold; color: ${passed ? '#059669' : '#dc2626'};">${this._escape(item.grade_value)} / ${this._escape(item.max_grade)}</td>
          <td>${this._escape(item.teacher_name)}</td>
          <td>${this._escape(item.teacher_remarks || this.t("student.common.none", {}, "-"))}</td>
        </tr>
      `;
    }).join("");

    main.innerHTML = `
      <h2>${this.t("student.grades.title", {}, "Grades and Marks")}</h2>
      ${this._table(`
        <thead>
          <tr>
            <th>${this.t("student.grades.columns.subject", {}, "Subject")}</th>
            <th>${this.t("student.grades.columns.assessment", {}, "Assessment")}</th>
            <th>${this.t("student.grades.columns.programClass", {}, "Program / Group")}</th>
            <th>${this.t("student.grades.columns.grade", {}, "Grade")}</th>
            <th>${this.t("student.grades.columns.teacher", {}, "Teacher")}</th>
            <th>${this.t("student.grades.columns.remarks", {}, "Remarks")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      `)}
    `;
  },

  renderAttendance(recordsData) {
    const records = this._toArray(recordsData);
    const main = document.getElementById("student-main");

    if (!records.length) {
      main.innerHTML = this._emptySection(
        "student.attendance.emptyTitle",
        "Attendance Record",
        "student.attendance.emptyText",
        "Your attendance record is clean. No absences were found."
      );
      return;
    }

    const rows = records.map(record => {
      const statusColor = record.status === "absent" ? "#dc2626" : (record.status === "late" ? "#d97706" : "#059669");
      const justified = record.is_justified
        ? this.t("student.attendance.justifiedYes", { reason: this._escape(record.justification_reason || "") }, "Yes ({reason})")
        : this.t("student.attendance.justifiedNo", {}, "No");

      return `
        <tr>
          <td>${this._escape(record.date)}</td>
          <td>${this._escape(record.class_name || this.t("student.common.none", {}, "-"))}</td>
          <td style="font-weight:bold; color:${statusColor};">${this._translateStatus(record.status)}</td>
          <td>${justified}</td>
        </tr>
      `;
    }).join("");

    main.innerHTML = `
      <h2>${this.t("student.attendance.title", {}, "Attendance and Absence Record")}</h2>
      ${this._table(`
        <thead>
          <tr>
            <th>${this.t("student.attendance.columns.date", {}, "Date")}</th>
            <th>${this.t("student.attendance.columns.group", {}, "Group")}</th>
            <th>${this.t("student.attendance.columns.status", {}, "Status")}</th>
            <th>${this.t("student.attendance.columns.justified", {}, "Justified?")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      `)}
    `;
  },

  renderResources(resourcesData) {
    this._resourcesCache = this._toArray(resourcesData);
    this.renderResourcesCatalog();
  },

  renderResourcesCatalog() {
    const resources = this._resourcesCache || [];
    const main = document.getElementById("student-main");
    if (!resources.length) {
      main.innerHTML = `
        <h2>${this.t("student.resources.emptyTitle", {}, "Lessons and Resources")}</h2>
        <div class="student-resource-empty">
          <strong>${this.t("student.resources.emptyTitle", {}, "Lessons and Resources")}</strong>
          <span>${this.t("student.resources.emptyText", {}, "No uploaded files are available currently.")}</span>
        </div>
      `;
      return;
    }

    const filteredResources = this._getFilteredResources(resources);
    const typeOptions = this._resourceTypeOptions(resources);
    const totalSize = resources.reduce((sum, resource) => sum + this._resourceSizeValue(resource), 0);
    const latest = resources
      .map(resource => this._resourceDateValue(resource))
      .filter(Boolean)
      .sort((a, b) => b - a)[0];
    const hasActiveFilters = Boolean((this._resourceFilters.query || "").trim()) || this._resourceFilters.type !== "all";
    const apiBaseUrl = typeof API_BASE_URL === "string" ? API_BASE_URL : "http://localhost:8000";

    const cards = filteredResources.map(resource => {
      const id = resource.resource_id || resource.id;
      const normalizedType = this._normalizeResourceType(resource.resource_type);
      const type = this._translateResourceType(resource.resource_type);
      const size = this._formatResourceSize(resource.file_size_mb);
      const date = resource.upload_date ? this.formatDateTime(resource.upload_date) : this.t("student.common.unknownDate", {}, "Unknown date");
      const subject = resource.subject_name || this.t("student.common.notSpecified", {}, "Not specified");
      const group = resource.class_name || resource.level || this.t("student.common.notSpecified", {}, "Not specified");
      const teacher = resource.teacher_name || this.t("student.common.notSpecified", {}, "Not specified");
      const downloadAction = id
        ? `<a class="student-resource-download" href="${this._escapeAttr(`${apiBaseUrl}/resources/${id}/download`)}" target="_blank" rel="noopener noreferrer">${this.t("student.common.download", {}, "Download")}</a>`
        : `<span class="student-resource-unavailable">${this.t("student.common.unavailable", {}, "Unavailable")}</span>`;

      return `
        <article class="student-resource-card">
          <div class="student-resource-filemark" data-type="${this._escapeAttr(normalizedType)}">${this._escape(this._resourceTypeAbbr(normalizedType))}</div>
          <div class="student-resource-card-main">
            <div class="student-resource-card-topline">
              <span class="student-resource-type">${this._escape(type)}</span>
              <span class="student-resource-date ltr-value">${this._escape(date)}</span>
            </div>
            <h3>${this._escape(resource.title || this.t("student.resources.untitled", {}, "Untitled resource"))}</h3>
            ${resource.description ? `<p>${this._escape(resource.description)}</p>` : ""}
            <div class="student-resource-meta">
              <span><strong>${this.t("student.resources.subjectLabel", {}, "Subject:")}</strong> ${this._escape(subject)}</span>
              <span><strong>${this.t("student.resources.groupLabel", {}, "Group:")}</strong> ${this._escape(group)}</span>
              <span><strong>${this.t("student.resources.teacherLabel", {}, "Teacher:")}</strong> ${this._escape(teacher)}</span>
              <span><strong>${this.t("student.resources.sizeLabel", {}, "Size:")}</strong> ${this._escape(size)}</span>
            </div>
          </div>
          <div class="student-resource-actions">${downloadAction}</div>
        </article>
      `;
    }).join("");

    main.innerHTML = `
      <section class="student-resource-board" dir="${this._escapeAttr(this.dir())}">
        <div class="student-resource-heading">
          <div>
            <h2>${this.t("student.resources.title", {}, "Educational Lessons and Resources")}</h2>
            <p>${this.t("student.resources.subtitle", {}, "Search, filter, and download the files shared for your classes.")}</p>
          </div>
          <small>${this.t("student.resources.count", { count: filteredResources.length }, `${filteredResources.length} file(s)`)}</small>
        </div>

        <div class="student-resource-stats">
          <div>
            <span>${this.t("student.resources.stats.files", {}, "Files")}</span>
            <strong>${resources.length}</strong>
          </div>
          <div>
            <span>${this.t("student.resources.stats.types", {}, "Types")}</span>
            <strong>${typeOptions.length}</strong>
          </div>
          <div>
            <span>${this.t("student.resources.stats.size", {}, "Size")}</span>
            <strong>${this._formatResourceSize(totalSize)}</strong>
          </div>
          <div>
            <span>${this.t("student.resources.stats.latest", {}, "Latest")}</span>
            <strong>${latest ? this.formatDateTime(latest) : this.t("student.common.notSpecified", {}, "Not specified")}</strong>
          </div>
        </div>

        <div class="student-resource-toolbar">
          <label class="student-resource-control student-resource-search">
            <span>${this.t("student.resources.filters.search", {}, "Search")}</span>
            <input
              type="search"
              id="student-resource-search-input"
              value="${this._escapeAttr(this._resourceFilters.query)}"
              placeholder="${this._escapeAttr(this.t("student.resources.filters.searchPlaceholder", {}, "Search by title, subject, teacher..."))}"
            />
          </label>
          <label class="student-resource-control">
            <span>${this.t("student.resources.filters.type", {}, "Type")}</span>
            <select id="student-resource-type-filter">
              <option value="all">${this.t("student.resources.filters.allTypes", {}, "All types")}</option>
              ${typeOptions.map(type => `
                <option value="${this._escapeAttr(type)}" ${this._resourceFilters.type === type ? "selected" : ""}>
                  ${this._escape(this._translateResourceType(type))}
                </option>
              `).join("")}
            </select>
          </label>
          <label class="student-resource-control">
            <span>${this.t("student.resources.filters.sort", {}, "Sort")}</span>
            <select id="student-resource-sort-select">
              ${this._resourceSortOptions().map(option => `
                <option value="${this._escapeAttr(option.value)}" ${this._resourceFilters.sort === option.value ? "selected" : ""}>${this._escape(option.label)}</option>
              `).join("")}
            </select>
          </label>
          <button type="button" id="student-clear-resource-filters" class="student-resource-clear" ${hasActiveFilters ? "" : "disabled"}>
            ${this.t("student.resources.filters.clear", {}, "Clear filters")}
          </button>
        </div>

        <div class="student-resource-list-head">
          <h3>${this.t("student.resources.listTitle", {}, "Available resources")}</h3>
          <small>${this.t("student.resources.count", { count: filteredResources.length }, `${filteredResources.length} file(s)`)}</small>
        </div>

        ${filteredResources.length
          ? `<div class="student-resource-list">${cards}</div>`
          : `<div class="student-resource-empty is-filtered">
              <strong>${this.t("student.resources.emptyFilteredTitle", {}, "No matching resources")}</strong>
              <span>${this.t("student.resources.emptyFilteredText", {}, "Try a different search term or resource type.")}</span>
              <button type="button" id="student-clear-resource-filters">${this.t("student.resources.filters.clear", {}, "Clear filters")}</button>
            </div>`}
      </section>
    `;
  },

  renderFees(feesData) {
    const fees = this._toArray(feesData);
    const main = document.getElementById("student-main");
    const align = this.start();

    if (!fees.length) {
      main.innerHTML = this._emptySection(
        "student.fees.emptyTitle",
        "Financial Status",
        "student.fees.emptyText",
        "No fees are registered for you."
      );
      return;
    }

    const rows = fees.map(fee => {
      const details = [
        fee.program_name ? `(${this._escape(fee.program_name)})` : "",
        fee.class_name ? `- ${this._escape(fee.class_name)}` : ""
      ].filter(Boolean).join(" ");

      return `
        <tr>
          <td>${this._escape(fee.fee_type)} ${details}</td>
          <td>${this._formatCurrency(fee.amount_due)}</td>
          <td>${this._formatCurrency(fee.applied_discount)}</td>
          <td style="font-weight: bold; color: #0f172a;">${this._formatCurrency(fee.net_amount)}</td>
          <td style="direction: ltr; text-align: ${align};">${this._escape(fee.due_date)}</td>
        </tr>
      `;
    }).join("");

    main.innerHTML = `
      <h2>${this.t("student.fees.title", {}, "Financial Status and Due Fees")}</h2>
      ${this._table(`
        <thead>
          <tr>
            <th>${this.t("student.fees.columns.feeType", {}, "Fee type")}</th>
            <th>${this.t("student.fees.columns.amountDue", {}, "Gross amount")}</th>
            <th>${this.t("student.fees.columns.discount", {}, "Discount")}</th>
            <th>${this.t("student.fees.columns.netAmount", {}, "Net amount")}</th>
            <th>${this.t("student.fees.columns.dueDate", {}, "Due date")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      `)}
    `;
  },

  renderNotifications(notificationsData) {
    const notifications = this._toArray(notificationsData);
    const main = document.getElementById("student-main");
    const start = this.start();
    const end = this.end();

    if (!notifications.length) {
      main.innerHTML = this._emptySection(
        "student.notifications.emptyTitle",
        "Notifications",
        "student.notifications.emptyText",
        "There are no new notifications."
      );
      return;
    }

    const unreadCount = notifications.filter(notification => !this._isNotificationRead(notification)).length;
    const items = notifications.map(notification => {
      const date = notification.created_at
        ? this.formatDateTime(notification.created_at)
        : this.t("student.common.unknownDate", {}, "Unknown date");
      const isRead = this._isNotificationRead(notification);
      const notificationId = this._getNotificationId(notification);
      const action = isRead
        ? `<span class="student-notification-action is-read">${this.t("student.notifications.read", {}, "Read")}</span>`
        : notificationId !== null
          ? `<button type="button" class="student-mark-notification-read" data-notification-id="${this._escapeAttr(notificationId)}">${this.t("student.notifications.markRead", {}, "Mark as read")}</button>`
          : `<span class="student-notification-action">${this.t("student.common.unavailable", {}, "Unavailable")}</span>`;
      const statusLabel = isRead
        ? this.t("student.notifications.read", {}, "Read")
        : this.t("student.notifications.unread", {}, "Unread");

      return `
        <article class="student-notification-card${isRead ? " is-read" : ""}" style="border-${start}: 4px solid ${isRead ? '#94a3b8' : '#d97706'};">
          <div class="student-notification-title-row">
            <strong>${this._escape(notification.title || this.t("student.notifications.defaultTitle", {}, "Notification"))}</strong>
            <span>${statusLabel}</span>
          </div>
          <p>${this._escape(notification.message || "")}</p>
          <div class="student-notification-footer">
            <small style="direction:ltr; text-align:${end};">${date}</small>
            ${action}
          </div>
        </article>
      `;
    }).join("");

    main.innerHTML = `
      <div class="student-section-topbar">
        <div>
          <h2>${this.t("student.notifications.title", {}, "Incoming Notifications")}</h2>
          <small>${this.t("student.notifications.unreadCount", { count: unreadCount }, `${unreadCount} unread`)}</small>
        </div>
        ${unreadCount > 0 ? `<button type="button" id="student-mark-all-notifications-read">${this.t("student.notifications.markAllRead", {}, "Mark all as read")}</button>` : ""}
      </div>
      <div class="student-notification-list">${items}</div>
    `;
  },

  renderPosts(postsData) {
    const posts = this._toArray(postsData);
    const main = document.getElementById("student-main");
    const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    this._postsCache = sortedPosts;

    if (!sortedPosts.length) {
      main.innerHTML = `
        <div class="posts-dashboard student-posts-dashboard">
          <div class="posts-header-bar">
            <div>
              <h3>${this.t("student.posts.title", {}, "Administration Posts")}</h3>
              <p>${this.t("student.posts.emptySubtitle", {}, "Announcements and published content from administration will appear here.")}</p>
            </div>
          </div>
          <div class="posts-empty">
            <div class="empty-icon">${this.t("student.common.file", {}, "File")}</div>
            <h4>${this.t("student.posts.emptyTitle", {}, "No posts currently")}</h4>
            <p>${this.t("student.posts.emptyText", {}, "Administration posts will appear here when available.")}</p>
          </div>
        </div>
      `;
      return;
    }

    const cards = sortedPosts.map((post, index) => {
      const title = this._escape(post.title || this.t("student.posts.untitled", {}, "Untitled post"));
      const date = this._formatPostDate(post.created_at);
      const snippet = this._extractPostSnippet(post.content ?? "");
      const excerpt = snippet ? this._escape(snippet) : "";

      return `
        <article class="student-post-list-card">
          ${post.image
            ? `<img src="${this._escapeAttr(post.image)}" class="student-post-thumb" alt="${title}">`
            : `<div class="student-post-thumb student-post-thumb-placeholder">${this.t("student.posts.filePlaceholder", {}, "Document")}</div>`}
          <div class="student-post-summary">
            <div>
              <div class="student-post-label">${this.t("student.common.fromManagement", {}, "From administration")}</div>
              <h3 class="student-post-list-title">${title}</h3>
              <p>${excerpt || this.t("student.posts.openHint", {}, "Open the post to view its details.")}</p>
            </div>
            <div class="student-post-list-actions">
              <time class="student-post-date">${date}</time>
              <button type="button" class="student-post-open" data-post-index="${index}">${this.t("student.common.openDetails", {}, "View details")}</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    main.innerHTML = `
      <div class="posts-dashboard student-posts-dashboard">
        <div class="posts-header-bar">
          <div>
            <h3>${this.t("student.posts.title", {}, "Administration Posts")}</h3>
            <p>${this.t("student.posts.listSubtitle", {}, "Choose a post from the list to view the full details.")}</p>
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

    const title = this._escape(post.title || this.t("student.posts.untitled", {}, "Untitled post"));
    const date = this._formatPostDate(post.created_at);
    const contentHtml = this._processPostMarkdown(post.content ?? "");

    main.innerHTML = `
      <div class="posts-dashboard student-posts-dashboard">
        <div class="student-post-detail-topbar">
          <button type="button" class="btn-secondary" id="student-posts-back">${this.t("student.common.backToPosts", {}, "Back to posts")}</button>
          <time class="student-post-date">${date}</time>
        </div>
        <article class="student-post-card student-post-detail">
          ${post.image ? `<img src="${this._escapeAttr(post.image)}" class="student-post-cover" alt="${title}">` : ""}
          <div class="student-post-head">
            <div>
              <div class="student-post-label">${this.t("student.common.fromManagement", {}, "From administration")}</div>
              <h3 class="preview-title">${title}</h3>
            </div>
          </div>
          <div class="md-body">${contentHtml || `<p class="preview-placeholder">${this.t("student.common.noContent", {}, "This post has no content.")}</p>`}</div>
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
            <h2>${this.t("student.messages.title", {}, "Messages")}</h2>
            <p>${this.t("student.messages.subtitle", {}, "Contact administration, teachers, or any available user in the system.")}</p>
          </div>
          <div class="student-message-search">
            <input type="text" id="student-message-user-search" placeholder="${this._escapeAttr(this.t("student.messages.searchPlaceholder", {}, "Search by user name..."))}" autocomplete="off">
            <button type="button" id="student-message-search-btn">${this.t("student.messages.searchButton", {}, "Search")}</button>
          </div>
        </div>

        <div class="student-message-search-results" id="student-message-search-results"></div>

        <div class="student-messages-shell">
          <aside class="student-message-contacts">
            <div class="student-message-panel-title">${this.t("student.messages.conversations", {}, "Conversations")}</div>
            <div id="student-message-contacts-list">
              ${this._renderMessageContacts(contacts)}
            </div>
          </aside>

          <section class="student-chat-panel">
            <div id="student-chat-header" class="student-chat-header">${this.t("student.messages.selectPrompt", {}, "Choose a conversation from the list or search for a new user.")}</div>
            <div id="student-chat-messages" class="student-chat-messages">
              <div class="student-chat-empty">
                <p>${this.t("student.messages.emptyConversation", {}, "The conversation will appear here.")}</p>
              </div>
            </div>
            <form id="student-message-form" class="student-message-form" hidden>
              <textarea id="student-message-input" rows="2" placeholder="${this._escapeAttr(this.t("student.messages.inputPlaceholder", {}, "Write your message..."))}" required></textarea>
              <button type="submit">${this.t("student.common.send", {}, "Send")}</button>
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
      results.innerHTML = `<div class="student-message-inline-note">${this.t("student.messages.minSearch", {}, "Type at least two characters to search.")}</div>`;
      return;
    }

    results.innerHTML = `<div class="student-message-inline-note">${this.t("student.messages.searching", {}, "Searching...")}</div>`;

    try {
      const response = await StudentServices.searchUsers(keyword);
      const users = this._toArray(response).filter(user => {
        const userId = Number(user.id ?? user.user_id);
        return userId && userId !== this._currentUserId;
      });

      if (!users.length) {
        results.innerHTML = `<div class="student-message-inline-note">${this.t("student.messages.noResults", {}, "No matching results.")}</div>`;
        return;
      }

      results.innerHTML = users.map(user => {
        const userId = Number(user.id ?? user.user_id);
        const name = user.full_name || user.username || this.t("student.common.userFallback", { id: userId }, `User #${userId}`);
        const role = this._translateStatus(user.role_name || user.role || user.user_type || this.t("student.messages.roleFallback", {}, "User"));

        return `
          <button type="button" class="student-message-user-result" data-user-id="${userId}" data-user-name="${this._escapeAttr(name)}">
            <span>${this._escape(name)}</span>
            <small>${this._escape(role)}</small>
          </button>
        `;
      }).join("");

      results.querySelectorAll(".student-message-user-result").forEach(btn => {
        btn.addEventListener("click", () => {
          results.innerHTML = "";
          this.openMessageConversation(Number(btn.dataset.userId), btn.dataset.userName);
        });
      });
    } catch (err) {
      results.innerHTML = `<div class="student-message-inline-note error">${this.t("student.messages.searchFailed", { message: this._escape(err.message) }, "Search failed.")}</div>`;
    }
  },

  async openMessageConversation(contactId, contactName) {
    this._activeMessageContact = { id: Number(contactId), name: contactName };

    const header = document.getElementById("student-chat-header");
    const messagesArea = document.getElementById("student-chat-messages");
    const form = document.getElementById("student-message-form");
    const status = document.getElementById("student-message-status");

    if (header) header.textContent = contactName;
    if (messagesArea) messagesArea.innerHTML = `<div class="student-message-inline-note">${this.t("student.messages.loadingConversation", {}, "Loading conversation...")}</div>`;
    if (form) form.hidden = false;
    if (status) status.textContent = "";

    try {
      const response = await StudentServices.getConversation(this._currentUserId, contactId);
      this.renderMessageConversation(this._toArray(response));
    } catch (err) {
      if (messagesArea) {
        messagesArea.innerHTML = `<div class="student-message-inline-note error">${this.t("student.messages.loadFailed", { message: this._escape(err.message) }, "Could not load messages.")}</div>`;
      }
    }
  },

  renderMessageConversation(messages) {
    const area = document.getElementById("student-chat-messages");
    if (!area) return;

    const ordered = [...(messages || [])].sort((a, b) => new Date(a.created_at || a.timestamp || 0) - new Date(b.created_at || b.timestamp || 0));

    if (!ordered.length) {
      area.innerHTML = `<div class="student-chat-empty"><p>${this.t("student.messages.noMessages", {}, "No messages yet.")}</p></div>`;
      return;
    }

    area.innerHTML = ordered.map(message => {
      const isMine = Number(message.sender_id) === this._currentUserId;
      const author = isMine
        ? this.t("student.messages.you", {}, "You")
        : (message.sender_name || this._activeMessageContact?.name || this.t("student.messages.roleFallback", {}, "User"));
      const date = message.created_at ? this.formatDateTime(message.created_at) : "";

      return `
        <div class="student-message-bubble${isMine ? " mine" : ""}">
          <div class="student-message-author">${this._escape(author)}</div>
          <div>${this._escape(message.content || "")}</div>
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
      status.textContent = this.t("student.messages.sending", {}, "Sending...");
      status.className = "";
    }

    try {
      await StudentServices.sendMessage(this._currentUserId, this._activeMessageContact.id, content);
      input.value = "";
      if (status) status.textContent = this.t("student.messages.sent", {}, "Sent");
      await this.openMessageConversation(this._activeMessageContact.id, this._activeMessageContact.name);
      this.refreshMessageContacts();
    } catch (err) {
      if (status) {
        status.textContent = this.t("student.messages.sendFailed", { message: err.message }, "Send failed.");
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
      console.warn("Could not refresh student message inbox:", err);
    }
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
    const messages = this._toArray(inboxData);
    const contacts = new Map();
    const currentUserId = Number(userId);

    messages.forEach(message => {
      const senderId = Number(message.sender_id);
      const receiverId = Number(message.receiver_id);
      const contactId = senderId === currentUserId ? receiverId : senderId;
      if (!contactId || contactId === currentUserId) return;

      const contactName = senderId === currentUserId
        ? (message.receiver_name || message.receiver_full_name || message.receiver_username || this.t("student.common.userFallback", { id: contactId }, `User #${contactId}`))
        : (message.sender_name || message.sender_full_name || message.sender_username || this.t("student.common.userFallback", { id: contactId }, `User #${contactId}`));
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
      return `<div class="student-message-empty-list">${this.t("student.messages.emptyList", {}, "No conversations yet.")}</div>`;
    }

    return contacts.map(contact => {
      const activeClass = Number(contact.id) === this._activeMessageContact?.id ? " active" : "";

      return `
        <button type="button" class="student-message-contact${activeClass}" data-contact-id="${contact.id}" data-contact-name="${this._escapeAttr(contact.name)}">
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
          <span class="dl-card-btn">${this.t("student.common.download", {}, "Download")}</span>
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
    const dir = this.dir() === "ltr" ? "ltr" : "rtl";
    return `<div class="student-table-wrap" dir="${dir}"><table class="student-data-table">${content}</table></div>`;
  },

  updateResourceFilters(patch = {}, focusId = "") {
    this._resourceFilters = {
      ...this._resourceFilters,
      ...patch
    };
    this.renderResourcesCatalog();
    if (focusId) {
      requestAnimationFrame(() => {
        const control = document.getElementById(focusId);
        if (!control) return;
        control.focus();
        if (typeof control.setSelectionRange === "function" && typeof control.value === "string") {
          const end = control.value.length;
          control.setSelectionRange(end, end);
        }
      });
    }
  },

  resetResourceFilters() {
    this._resourceFilters = {
      query: "",
      type: "all",
      sort: "newest"
    };
  },

  clearResourceFilters() {
    this.resetResourceFilters();
    this.renderResourcesCatalog();
  },

  _getFilteredResources(resources) {
    const query = this._resourceSearchText(this._resourceFilters.query);
    const type = this._resourceFilters.type || "all";

    return [...resources]
      .filter(resource => {
        const normalizedType = this._normalizeResourceType(resource.resource_type);
        if (type !== "all" && normalizedType !== type) return false;
        if (!query) return true;
        const haystack = [
          resource.title,
          resource.description,
          resource.subject_name,
          resource.class_name,
          resource.level,
          resource.teacher_name,
          this._translateResourceType(resource.resource_type),
          resource.resource_type
        ].map(value => this._resourceSearchText(value)).join(" ");
        return haystack.includes(query);
      })
      .sort((a, b) => {
        const sort = this._resourceFilters.sort || "newest";
        if (sort === "oldest") return this._resourceDateValue(a) - this._resourceDateValue(b);
        if (sort === "title") return String(a.title || "").localeCompare(String(b.title || ""), this.locale());
        if (sort === "size") return this._resourceSizeValue(b) - this._resourceSizeValue(a);
        return this._resourceDateValue(b) - this._resourceDateValue(a);
      });
  },

  _resourceTypeOptions(resources) {
    return [...new Set(resources.map(resource => this._normalizeResourceType(resource.resource_type)).filter(Boolean))]
      .sort((a, b) => this._translateResourceType(a).localeCompare(this._translateResourceType(b), this.locale()));
  },

  _resourceSortOptions() {
    return [
      { value: "newest", label: this.t("student.resources.sort.newest", {}, "Newest first") },
      { value: "oldest", label: this.t("student.resources.sort.oldest", {}, "Oldest first") },
      { value: "title", label: this.t("student.resources.sort.title", {}, "Title") },
      { value: "size", label: this.t("student.resources.sort.size", {}, "Largest size") }
    ];
  },

  _normalizeResourceType(type) {
    return String(type || "file").trim().toLowerCase().replace(/\s+/g, "_") || "file";
  },

  _translateResourceType(type) {
    const normalized = this._normalizeResourceType(type);
    const fallback = type ? String(type).replace(/[_-]+/g, " ") : "File";
    return this.t(`student.resources.types.${normalized}`, {}, fallback);
  },

  _resourceTypeAbbr(type) {
    const normalized = this._normalizeResourceType(type);
    if (normalized === "document") return "DOC";
    if (normalized === "archive") return "ZIP";
    if (normalized === "image") return "IMG";
    if (normalized === "video") return "VID";
    if (normalized === "audio") return "AUD";
    if (normalized === "spreadsheet") return "XLS";
    if (normalized === "presentation") return "PPT";
    if (normalized === "code") return "CODE";
    return normalized.slice(0, 4).toUpperCase();
  },

  _resourceDateValue(resource) {
    const timestamp = new Date(resource?.upload_date || 0).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  },

  _resourceSizeValue(resource) {
    const value = typeof resource === "number" ? resource : Number(resource?.file_size_mb);
    return Number.isFinite(value) ? value : 0;
  },

  _formatResourceSize(value) {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) return this.t("student.common.notSpecified", {}, "Not specified");
    return `${size.toLocaleString(this.locale(), { maximumFractionDigits: 2 })} MB`;
  },

  _resourceSearchText(value) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase(this.locale());
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
    return this.t(`student.nav.${section}`, {}, section);
  },

  _translateDay(day) {
    const raw = String(day || "").trim();
    if (!raw) return this.t("student.common.notSpecified", {}, "Not specified");
    return this.t(`student.days.${raw}`, {}, raw);
  },

  _translateStatus(status) {
    const raw = String(status || "").trim();
    if (!raw) return this.t("student.common.notSpecified", {}, "Not specified");
    const normalized = raw.toLowerCase().replace(/\s+/g, "_");
    return this.t(`student.status.${normalized}`, {}, raw);
  },

  _formatPostDate(value) {
    if (!value) return this.t("student.common.unknownDate", {}, "Unknown date");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return this.t("student.common.unknownDate", {}, "Unknown date");

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
    return ext ? ext.toUpperCase().slice(0, 4) : this.t("student.common.file", {}, "File");
  },

  _formatCurrency(amount) {
    const number = Number(amount);
    const safeAmount = Number.isFinite(number) ? number : 0;
    return `${safeAmount.toLocaleString(this.locale())} ${this.t("student.currency.dzd", {}, "DZD")}`;
  },

  formatDateTime(value) {
    if (!value) return this.t("student.common.unknownDate", {}, "Unknown date");
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
      ? this.t("student.common.none", {}, "-")
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

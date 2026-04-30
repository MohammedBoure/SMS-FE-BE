// js/roles/teacher/ui.js

const TeacherUI = {
  SECTIONS: ["assignments", "schedule", "attendance", "grades", "resources", "posts", "notifications"],
  _postsCache: [],

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

    const items = notifications.map(n => {
      const date = n.created_at ? new Date(n.created_at).toLocaleString("ar-DZ") : "تاريخ غير محدد";

      return `
        <div style="background:#fff; padding:16px 18px; margin-bottom:12px; border-radius:12px; border-right:4px solid #4f46e5; box-shadow:0 2px 8px rgba(15,23,42,.06);">
          <strong style="display:block; margin-bottom:6px; color:#0f172a; font-size:1.05rem;">${this._escape(n.title || "إشعار")}</strong>
          <p style="margin:0; color:#334155; line-height:1.7;">${this._escape(n.message || "")}</p>
          <small style="color:#94a3b8; display:block; margin-top:8px; direction:ltr; text-align:right;">${date}</small>
        </div>
      `;
    }).join("");

    main.innerHTML = `
      <h2>الإشعارات</h2>
      <div>${items}</div>
    `;
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
  _translate(str) {
    const map = {
      assignments: "أقسامي", schedule: "الجدول الزمني", attendance: "الغياب", 
      grades: "العلامات", resources: "الموارد", posts: "منشورات الإدارة", notifications: "الإشعارات"
    };
    return map[str] || str;
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

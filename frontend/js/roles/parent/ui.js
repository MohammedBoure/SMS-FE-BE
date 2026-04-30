// js/roles/parent/ui.js

const ParentUI = {
  SECTIONS: ["children", "grades", "attendance", "fees", "posts", "notifications"],
  _postsCache: [],

  renderHeader(userProfile) {
    const header = document.getElementById("parent-header");
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px;">
        <h1 style="margin:0;">مرحباً بك: ${this._escape(userProfile ? userProfile.full_name : '...')}</h1>
        <button id="logout-btn" style="background: #ef4444; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">تسجيل خروج</button>
      </div>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  },

  renderNav(activeSection) {
    const nav = document.getElementById("parent-nav");
    nav.innerHTML = this.SECTIONS.map(s =>
      `<button class="nav-btn${activeSection === s ? " active" : ""}" data-section="${s}" style="padding: 10px 15px; margin-left: 5px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background: ${activeSection === s ? '#e0f2fe' : 'white'};">${this._translate(s)}</button>`
    ).join("");
  },

  renderLoading() {
    document.getElementById("parent-main").innerHTML = "<h3 style='padding: 20px;'>جاري جلب البيانات...</h3>";
  },

  renderError(msg) {
    document.getElementById("parent-main").innerHTML = `<h3 style="color: #ef4444; padding: 20px;">خطأ: ${this._escape(msg)}</h3>`;
  },

  renderChildren(children) {
    const main = document.getElementById("parent-main");
    if (!children || children.length === 0) {
      main.innerHTML = "<h2>أبنائي</h2><p style='color: #64748b;'>لا يوجد أبناء مسجلين بحسابك حالياً. يرجى مراجعة الإدارة.</p>";
      return;
    }
    const rows = children.map(c => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px;"><strong>${this._escape(c.student_name || c.full_name)}</strong></td>
        <td style="padding: 12px;">${this._escape(c.class_name)} (${this._escape(c.level)})</td>
        <td style="padding: 12px; direction: ltr; text-align: right;">${this._escape(c.date_of_birth)}</td>
        <td style="padding: 12px;"><span style="background: ${c.status === 'active' ? '#dcfce7' : '#f1f5f9'}; padding: 4px 8px; border-radius: 4px;">${c.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">أبنائي المسجلين</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead style="background: #f1f5f9;"><tr><th style="padding:12px;">الاسم</th><th style="padding:12px;">القسم (المستوى)</th><th style="padding:12px;">تاريخ الميلاد</th><th style="padding:12px;">الحالة</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderGrades(grades) {
    const main = document.getElementById("parent-main");
    if (!grades || grades.length === 0) {
      main.innerHTML = "<h2>العلامات والتقييمات</h2><p style='color: #64748b;'>لا توجد علامات مرصودة حتى الآن.</p>";
      return;
    }
    const rows = grades.map(g => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px;"><strong>${this._escape(g.child_name)}</strong></td>
        <td style="padding: 12px;">${this._escape(g.subject_name)}</td>
        <td style="padding: 12px;">${this._escape(g.assessment_title)} <span style="color:#64748b; font-size:0.85em;">(${g.assessment_type === 'exam' ? 'امتحان' : 'واجب'})</span></td>
        <td style="padding: 12px; direction: ltr; text-align: right; font-weight: bold; color: #10b981;">${this._escape(g.grade_value)} / ${this._escape(g.max_grade)}</td>
        <td style="padding: 12px;">${this._escape(g.teacher_name)}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">العلامات والتقييمات</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead style="background: #f1f5f9;"><tr><th style="padding:12px;">الابن</th><th style="padding:12px;">المادة</th><th style="padding:12px;">التقييم</th><th style="padding:12px;">العلامة</th><th style="padding:12px;">الأستاذ</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderAttendance(records) {
    const main = document.getElementById("parent-main");
    if (!records || records.length === 0) {
      main.innerHTML = "<h2>سجل الغياب</h2><p style='color: #64748b;'>سجل أبنائك نظيف، لا توجد غيابات.</p>";
      return;
    }
    const rows = records.map(r => {
      let statusAr = r.status === 'present' ? 'حاضر' : (r.status === 'absent' ? 'غائب' : 'متأخر');
      let statusColor = r.status === 'absent' ? 'color: #ef4444;' : 'color: #f59e0b;';
      return `
      <tr style="border-bottom: 1px solid #e2e8f0; background: ${r.status === 'absent' ? '#fef2f2' : 'transparent'};">
        <td style="padding: 12px;"><strong>${this._escape(r.child_name)}</strong></td>
        <td style="padding: 12px; direction: ltr; text-align: right; font-weight:bold;">${this._escape(r.date)}</td>
        <td style="padding: 12px; font-weight:bold; ${statusColor}">${statusAr}</td>
        <td style="padding: 12px;">${r.is_justified ? '✔️ نعم (' + this._escape(r.justification_reason) + ')' : '❌ لا'}</td>
      </tr>
    `;
    }).join("");
    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">سجل الغياب والتأخر</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead style="background: #f1f5f9;"><tr><th style="padding:12px;">الابن</th><th style="padding:12px;">التاريخ</th><th style="padding:12px;">الحالة</th><th style="padding:12px;">مُبرر؟</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderFees(fees) {
    const main = document.getElementById("parent-main");
    if (!fees || fees.length === 0) {
      main.innerHTML = "<h2>الوضعية المالية</h2><p style='color: #64748b;'>الوضعية مسواة، لا توجد ديون مستحقة.</p>";
      return;
    }
    const rows = fees.map(f => {
      const isPaid = f.status === 'paid' || f.status === 'completed';
      return `
      <tr style="border-bottom: 1px solid #e2e8f0; background: ${isPaid ? 'transparent' : '#fef2f2'};">
        <td style="padding: 12px;"><strong>${this._escape(f.child_name)}</strong></td>
        <td style="padding: 12px;">${this._escape(f.fee_type)} ${f.program_name ? '<span style="color:#64748b;">('+this._escape(f.program_name)+')</span>' : ''}</td>
        <td style="padding: 12px; font-weight: bold;">${this._escape(f.amount_due || f.net_amount)} دج</td>
        <td style="padding: 12px; direction: ltr; text-align: right;">${this._escape(f.due_date)}</td>
        <td style="padding: 12px; color: ${isPaid ? '#10b981' : '#ef4444'}; font-weight: bold;">${isPaid ? 'مسددة ✔️' : 'غير مسددة ❌'}</td>
      </tr>
    `}).join("");
    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">المطالبات والرسوم المالية</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead style="background: #f1f5f9;"><tr><th style="padding:12px;">الابن</th><th style="padding:12px;">نوع الرسم</th><th style="padding:12px;">المبلغ</th><th style="padding:12px;">تاريخ الاستحقاق</th><th style="padding:12px;">الحالة</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderNotifications(notifications) {
    const main = document.getElementById("parent-main");
    if (!notifications || notifications.length === 0) {
      main.innerHTML = "<h2>الإشعارات والإنذارات</h2><p style='color: #64748b;'>صندوق الإشعارات فارغ.</p>";
      return;
    }
    const items = notifications.map(n => {
      const dateStr = n.created_at ? new Date(n.created_at).toLocaleString('ar-DZ') : '';
      return `
      <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-right: 4px solid #eab308; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <strong style="display:block; margin-bottom:5px; font-size:1.1rem; color: #0f172a;">${this._escape(n.title)}</strong>
        <p style="margin:0; color:#334155; line-height: 1.6;">${this._escape(n.message)}</p>
        <small style="color:#94a3b8; display:block; margin-top:10px; direction: ltr; text-align: right;">${dateStr}</small>
      </div>
    `}).join("");
    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">الإشعارات الواردة</h2>
      <div>${items}</div>
    `;
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
      <div class="posts-dashboard student-posts-dashboard parent-posts-dashboard">
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
    const main = document.getElementById("parent-main");

    if (!post) {
      this.renderPosts(this._postsCache);
      return;
    }

    const title = this._escape(post.title || "منشور بدون عنوان");
    const date = this._formatPostDate(post.created_at);
    const contentHtml = this._processPostMarkdown(post.content ?? "");

    main.innerHTML = `
      <div class="posts-dashboard student-posts-dashboard parent-posts-dashboard">
        <div class="student-post-detail-topbar">
          <button type="button" class="btn-secondary" id="parent-posts-back">← الرجوع للمنشورات</button>
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

    document.getElementById("parent-posts-back")?.addEventListener("click", () => this.renderPosts(this._postsCache));
    this._typesetMath(main);
  },

  // === الدوال المساعدة (Helpers) ===
  _translate(str) {
    const map = {
      children: "أبنائي", grades: "العلامات", attendance: "الغياب", 
      fees: "المالية", posts: "منشورات الإدارة", notifications: "الإشعارات", messages: "الرسائل"
    };
    return map[str] || str;
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
  _formatValue(value) { 
    return value === null || value === undefined || value === "" ? "-" : value; 
  },
  _escape(value) {
    return String(this._formatValue(value)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
};

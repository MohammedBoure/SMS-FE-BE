// js/roles/receptionist/tabs/posts.js

ReceptionistUI._postsCache = [];
ReceptionistUI._editingPostId = null;

ReceptionistUI.renderPosts = function(postsData) {
  const main = document.getElementById("receptionist-main");
  const posts = Array.isArray(postsData) ? postsData : (postsData?.data || []);
  const sortedPosts = [...posts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const today = new Date().toDateString();
  const todayCount = sortedPosts.filter(post => post.created_at && new Date(post.created_at).toDateString() === today).length;
  const withImage = sortedPosts.filter(post => post.image).length;

  this._postsCache = sortedPosts;

  const rows = sortedPosts.map((post, index) => {
    const postId = this._getPostId(post);
    const date = post.created_at
      ? new Date(post.created_at).toLocaleDateString("ar-DZ", { year: "numeric", month: "short", day: "numeric" })
      : "-";
    const excerpt = this._extractPostSnippet(post.content || "");

    return `
      <tr data-post-title="${this._escapeAttr(String(post.title || "").toLowerCase())}">
        <td><span class="badge badge-blue">#${this._escape(postId)}</span></td>
        <td>
          <div class="post-title-cell">
            ${post.image
              ? `<img src="${this._escapeAttr(post.image)}" class="post-thumb" alt="">`
              : `<div class="post-thumb-placeholder">ملف</div>`}
            <div>
              <div class="post-title-text" title="${this._escapeAttr(post.title || "")}">${this._escape(post.title || "منشور بدون عنوان")}</div>
              <div class="post-excerpt">${this._escape(excerpt || "لا يوجد ملخص.")}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-green">مستخدم #${this._escape(post.user_id || "-")}</span></td>
        <td><span class="post-date">${date}</span></td>
        <td>
          <div class="tbl-actions">
            <button type="button" class="tbl-btn tbl-btn-preview" data-post-action="preview" data-post-index="${index}">معاينة</button>
            <button type="button" class="tbl-btn tbl-btn-edit" data-post-action="edit" data-post-index="${index}">تعديل</button>
            <button type="button" class="tbl-btn tbl-btn-delete" data-post-action="delete" data-post-index="${index}">حذف</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  const listHtml = sortedPosts.length === 0
    ? `
      <div class="posts-empty">
        <div class="empty-icon">منشورات</div>
        <h4>لا توجد منشورات منشورة حتى الآن</h4>
        <p>يمكنك إنشاء أول منشور من زر كتابة منشور جديد.</p>
      </div>
    `
    : `
      <div class="posts-table-wrap">
        <table class="posts-table" id="receptionist-posts-table">
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th>عنوان المنشور</th>
              <th style="width:130px">الكاتب</th>
              <th style="width:130px">تاريخ النشر</th>
              <th style="width:210px; text-align:left">إجراءات</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

  main.innerHTML = `
    <div class="posts-dashboard receptionist-posts-dashboard">
      <div class="posts-header-bar">
        <div>
          <h3>لوحة المنشورات المدرسية</h3>
          <p>إنشاء وإدارة المنشورات التي تظهر للطلاب والأولياء والأساتذة.</p>
        </div>
        <button type="button" class="btn-new-post" id="receptionist-new-post">كتابة منشور جديد</button>
      </div>

      <div class="posts-stats-row">
        <div class="pstat-card" style="--pstat-color:#064e3b">
          <div class="pstat-num">${sortedPosts.length}</div>
          <div class="pstat-lbl">إجمالي المنشورات</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#2563eb">
          <div class="pstat-num">${todayCount}</div>
          <div class="pstat-lbl">نشر اليوم</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#059669">
          <div class="pstat-num">${withImage}</div>
          <div class="pstat-lbl">بصورة غلاف</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#d97706">
          <div class="pstat-num">${sortedPosts.length - withImage}</div>
          <div class="pstat-lbl">نصي فقط</div>
        </div>
      </div>

      <div class="posts-toolbar">
        <div class="posts-search-wrap">
          <span class="search-icon">بحث</span>
          <input class="posts-search" id="receptionist-posts-search" placeholder="البحث في المنشورات...">
        </div>
      </div>

      ${listHtml}
    </div>
  `;

  document.getElementById("receptionist-new-post")?.addEventListener("click", () => this.showPostEditor());
  document.getElementById("receptionist-posts-search")?.addEventListener("input", (event) => this._filterPosts(event.target.value));

  main.querySelectorAll("[data-post-action]").forEach(button => {
    button.addEventListener("click", () => {
      const post = this._postsCache[Number(button.dataset.postIndex)];
      if (!post) return;

      if (button.dataset.postAction === "preview") this.previewPost(post);
      if (button.dataset.postAction === "edit") this.showPostEditor(post);
      if (button.dataset.postAction === "delete") this.deletePost(post);
    });
  });
};

ReceptionistUI.showPostEditor = function(post = null) {
  const main = document.getElementById("receptionist-main");
  const isEdit = Boolean(post);
  const postId = post ? this._getPostId(post) : null;
  this._editingPostId = postId;

  main.innerHTML = `
    <div class="post-editor-page receptionist-post-editor">
      <div class="editor-topbar">
        <h2>${isEdit ? "تعديل المنشور" : "كتابة منشور جديد"}</h2>
        <div class="editor-topbar-actions">
          <button type="button" class="btn-secondary" id="receptionist-posts-back">العودة للمنشورات</button>
        </div>
      </div>

      <div class="editor-meta-row">
        <input class="editor-input editor-input-title" id="editor-title" placeholder="عنوان المنشور" value="${this._escapeAttr(post?.title || "")}">
        <input class="editor-input" id="editor-image-url" placeholder="رابط صورة الغلاف اختياري" value="${this._escapeAttr(post?.image || "")}">
      </div>

      <div class="editor-toolbar" id="receptionist-post-toolbar">
        <div class="tb-group">
          <button type="button" class="tb-btn" data-md-start="# ">H1</button>
          <button type="button" class="tb-btn" data-md-start="## ">H2</button>
          <button type="button" class="tb-btn" data-md-start="### ">H3</button>
        </div>
        <div class="tb-sep"></div>
        <div class="tb-group">
          <button type="button" class="tb-btn" data-md-start="**" data-md-end="**">B</button>
          <button type="button" class="tb-btn" data-md-start="*" data-md-end="*">I</button>
          <button type="button" class="tb-btn" data-md-start="\`" data-md-end="\`">Code</button>
        </div>
        <div class="tb-sep"></div>
        <div class="tb-group">
          <button type="button" class="tb-btn" data-md-start="- ">قائمة</button>
          <button type="button" class="tb-btn" data-md-start="> ">اقتباس</button>
          <button type="button" class="tb-btn" data-editor-action="table">جدول</button>
          <button type="button" class="tb-btn" data-editor-action="link">رابط</button>
          <button type="button" class="tb-btn" data-editor-action="image">صورة</button>
          <button type="button" class="tb-btn" data-editor-action="download">تحميل</button>
          <button type="button" class="tb-btn" data-editor-action="math">LaTeX</button>
        </div>
      </div>

      <div class="editor-body">
        <div class="editor-pane">
          <div class="editor-pane-label">Markdown</div>
          <textarea class="editor-textarea" id="editor-content" placeholder="اكتب محتوى المنشور هنا...">${this._escape(post?.content || "")}</textarea>
        </div>
        <div class="editor-pane editor-preview-pane">
          <div class="editor-pane-label">المعاينة</div>
          <div class="preview-inner">
            <img class="preview-cover" id="preview-cover-image" alt="">
            <div class="preview-title" id="preview-title">عنوان المنشور</div>
            <div class="md-body" id="preview-body"></div>
          </div>
        </div>
      </div>

      <div class="editor-footer">
        <div class="editor-word-count" id="word-count">0 كلمة · 0 حرف</div>
        <div class="editor-footer-actions">
          <button type="button" class="btn-secondary" id="receptionist-post-preview">معاينة كاملة</button>
          <button type="button" class="btn-save" id="save-post-btn">${isEdit ? "حفظ التعديلات" : "نشر المنشور"}</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("receptionist-posts-back")?.addEventListener("click", () => ReceptionistRole.loadSection("posts"));
  document.getElementById("save-post-btn")?.addEventListener("click", () => this.savePost(postId));
  document.getElementById("receptionist-post-preview")?.addEventListener("click", () => {
    this.previewPost({
      title: document.getElementById("editor-title")?.value || "",
      content: document.getElementById("editor-content")?.value || "",
      image: document.getElementById("editor-image-url")?.value || ""
    });
  });

  document.querySelectorAll("#editor-title, #editor-image-url, #editor-content").forEach(input => {
    input.addEventListener("input", () => {
      this.updatePostPreview();
      this._updateWordCount();
    });
  });

  document.querySelectorAll("#receptionist-post-toolbar .tb-btn").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.editorAction) {
        this._editorAction(button.dataset.editorAction);
        return;
      }
      this.insertMarkdown(button.dataset.mdStart || "", button.dataset.mdEnd || "");
    });
  });

  this.updatePostPreview();
  this._updateWordCount();
};

ReceptionistUI.savePost = async function(postId = null) {
  const title = document.getElementById("editor-title")?.value?.trim();
  const content = document.getElementById("editor-content")?.value?.trim();
  const image = document.getElementById("editor-image-url")?.value?.trim() || null;

  if (!title) {
    this._showPostToast("يرجى إدخال عنوان المنشور", "error");
    return;
  }
  if (!content) {
    this._showPostToast("يرجى إدخال محتوى المنشور", "error");
    return;
  }

  const button = document.getElementById("save-post-btn");
  if (button) {
    button.disabled = true;
    button.textContent = "جاري الحفظ...";
  }

  try {
    const payload = { title, content, image };

    if (postId) {
      await ReceptionistServices.updatePost(postId, payload);
      this._showPostToast("تم تحديث المنشور بنجاح", "success");
    } else {
      const session = Auth.getSession();
      payload.user_id = parseInt(session.user_id, 10);
      await ReceptionistServices.createPost(payload);
      this._showPostToast("تم نشر المنشور بنجاح", "success");
    }

    setTimeout(() => ReceptionistRole.loadSection("posts"), 650);
  } catch (err) {
    this._showPostToast("تعذر حفظ المنشور: " + err.message, "error");
    if (button) {
      button.disabled = false;
      button.textContent = postId ? "حفظ التعديلات" : "نشر المنشور";
    }
  }
};

ReceptionistUI.previewPost = function(post) {
  const overlay = document.createElement("div");
  overlay.className = "post-full-preview";
  overlay.innerHTML = `
    <div class="post-full-preview-inner">
      <div class="preview-modal-header">
        <h4>معاينة المنشور</h4>
        <button type="button" class="preview-modal-close" data-close-post-preview>×</button>
      </div>
      <div class="preview-modal-body">
        ${post.image ? `<img src="${this._escapeAttr(post.image)}" class="receptionist-post-preview-cover" alt="">` : ""}
        <div class="preview-title">${this._escape(post.title || "منشور بدون عنوان")}</div>
        <div class="md-body">${this._processPostMarkdown(post.content || "") || '<p class="preview-placeholder">لا يوجد محتوى.</p>'}</div>
      </div>
    </div>
  `;
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.matches("[data-close-post-preview]")) overlay.remove();
  });
  document.body.appendChild(overlay);
  this._typesetPostMath(overlay);
};

ReceptionistUI.deletePost = async function(post) {
  const postId = this._getPostId(post);
  if (!postId) return;
  if (!confirm("هل تريد حذف هذا المنشور نهائيا؟")) return;

  try {
    await ReceptionistServices.deletePost(postId);
    this._showPostToast("تم حذف المنشور بنجاح", "success");
    await ReceptionistRole.loadSection("posts");
  } catch (err) {
    this._showPostToast("تعذر حذف المنشور: " + err.message, "error");
  }
};

ReceptionistUI.insertMarkdown = function(startTag, endTag = "") {
  const textarea = document.getElementById("editor-content");
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  textarea.value = textarea.value.slice(0, start) + startTag + selected + endTag + textarea.value.slice(end);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + startTag.length + selected.length + endTag.length;
  this.updatePostPreview();
  this._updateWordCount();
};

ReceptionistUI._editorAction = function(action) {
  if (action === "table") {
    this.insertMarkdown("\n| العنوان الأول | العنوان الثاني |\n| --- | --- |\n| بيانات | بيانات |\n", "");
    return;
  }
  if (action === "math") {
    this.insertMarkdown("$$\n", "\n$$");
    return;
  }
  if (action === "image") {
    const url = prompt("رابط الصورة:");
    if (!url) return;
    const alt = prompt("النص البديل:", "صورة") || "صورة";
    this.insertMarkdown(`\n![${alt}](${url})\n`, "");
    return;
  }
  if (action === "link") {
    const url = prompt("رابط URL:");
    if (!url) return;
    const text = prompt("نص الرابط:", "اضغط هنا") || "اضغط هنا";
    this.insertMarkdown(`[${text}](${url})`, "");
    return;
  }
  if (action === "download") {
    const name = prompt("اسم الملف:");
    if (!name) return;
    const url = prompt("رابط التحميل:");
    if (!url) return;
    const type = prompt("نوع الملف اختياري:", "") || "";
    const size = prompt("الحجم اختياري:", "") || "";
    const meta = [type, size].filter(Boolean).join("|");
    this.insertMarkdown(`\n[تحميل: ${name}${meta ? "|" + meta : ""}](${url})\n`, "");
  }
};

ReceptionistUI.updatePostPreview = function() {
  const titleInput = document.getElementById("editor-title");
  const imageInput = document.getElementById("editor-image-url");
  const contentInput = document.getElementById("editor-content");
  const title = document.getElementById("preview-title");
  const image = document.getElementById("preview-cover-image");
  const body = document.getElementById("preview-body");

  if (title) title.textContent = titleInput?.value || "عنوان المنشور";
  if (image) {
    const src = imageInput?.value?.trim() || "";
    image.src = src;
    image.style.display = src ? "block" : "none";
  }

  if (!body) return;
  const raw = contentInput?.value || "";
  body.innerHTML = raw.trim()
    ? this._processPostMarkdown(raw)
    : '<p class="preview-placeholder">ابدأ الكتابة لرؤية المعاينة هنا...</p>';
  this._typesetPostMath(body);
};

ReceptionistUI._filterPosts = function(query) {
  const value = String(query || "").toLowerCase().trim();
  document.querySelectorAll("#receptionist-posts-table tbody tr").forEach(row => {
    row.style.display = row.dataset.postTitle?.includes(value) ? "" : "none";
  });
};

ReceptionistUI._processPostMarkdown = function(raw) {
  if (!raw) return "";

  let source = String(raw).replace(
    /\[تحميل:\s*([^\]|]+?)(?:\|([^\]|]*?))?(?:\|([^\]]*?))?\]\(([^)]+)\)/g,
    (_, name, type, size, url) => {
      const safeUrl = this._escapeAttr(url.trim());
      const safeName = this._escape(name.trim());
      const meta = [type, size].map(part => part?.trim()).filter(Boolean).join(" · ");
      return `
        <a href="${safeUrl}" target="_blank" class="dl-card" rel="noopener noreferrer">
          <span class="dl-card-icon">ملف</span>
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
};

ReceptionistUI._typesetPostMath = function(container, attempt = 0) {
  if (!container || typeof MathJax === "undefined") return;

  if (MathJax.typesetPromise) {
    if (MathJax.typesetClear) MathJax.typesetClear([container]);
    MathJax.typesetPromise([container]).catch(() => {});
    return;
  }

  if (MathJax.startup?.promise) {
    MathJax.startup.promise.then(() => this._typesetPostMath(container, attempt + 1)).catch(() => {});
    return;
  }

  if (attempt < 8) {
    setTimeout(() => this._typesetPostMath(container, attempt + 1), 250);
  }
};

ReceptionistUI._updateWordCount = function() {
  const textarea = document.getElementById("editor-content");
  const counter = document.getElementById("word-count");
  if (!textarea || !counter) return;

  const trimmed = textarea.value.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  counter.textContent = `${words} كلمة · ${textarea.value.length} حرف`;
};

ReceptionistUI._extractPostSnippet = function(markdown, length = 95) {
  const text = String(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, match => match.replace(/^\[|\]\([^)]+\)$/g, ""))
    .replace(/[#>*_`~|$\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
};

ReceptionistUI._getPostId = function(post) {
  return post?.post_id ?? post?.id;
};

ReceptionistUI._showPostToast = function(message, type = "success") {
  let toast = document.querySelector(".post-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "post-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `post-toast ${type}`;
  void toast.offsetWidth;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
};

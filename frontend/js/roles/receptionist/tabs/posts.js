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
  const actionsAlign = this.end();

  this._postsCache = sortedPosts;

  const rows = sortedPosts.map((post, index) => {
    const postId = this._getPostId(post);
    const date = post.created_at ? this.formatDate(post.created_at) : this.t("receptionist.common.none", {}, "-");
    const excerpt = this._extractPostSnippet(post.content || "");

    return `
      <tr data-post-title="${this._escapeAttr(String(post.title || "").toLowerCase())}">
        <td><span class="badge badge-blue">#${this._escape(postId)}</span></td>
        <td>
          <div class="post-title-cell">
            ${post.image
              ? `<img src="${this._escapeAttr(post.image)}" class="post-thumb" alt="">`
              : `<div class="post-thumb-placeholder">${this.t("receptionist.posts.file", {}, "File")}</div>`}
            <div>
              <div class="post-title-text" title="${this._escapeAttr(post.title || "")}">${this._escape(post.title || this.t("receptionist.posts.untitled", {}, "Untitled post"))}</div>
              <div class="post-excerpt">${this._escape(excerpt || this.t("receptionist.posts.noSummary", {}, "No summary available."))}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-green">${this.t("receptionist.posts.author", { id: this._escape(post.user_id || "-") }, `User #${this._escape(post.user_id || "-")}`)}</span></td>
        <td><span class="post-date">${date}</span></td>
        <td>
          <div class="tbl-actions">
            <button type="button" class="tbl-btn tbl-btn-preview" data-post-action="preview" data-post-index="${index}">${this.t("receptionist.posts.preview", {}, "Preview")}</button>
            <button type="button" class="tbl-btn tbl-btn-edit" data-post-action="edit" data-post-index="${index}">${this.t("receptionist.posts.edit", {}, "Edit")}</button>
            <button type="button" class="tbl-btn tbl-btn-delete" data-post-action="delete" data-post-index="${index}">${this.t("receptionist.posts.delete", {}, "Delete")}</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  const listHtml = sortedPosts.length === 0
    ? `
      <div class="posts-empty">
        <div class="empty-icon">${this.t("receptionist.posts.file", {}, "File")}</div>
        <h4>${this.t("receptionist.posts.emptyTitle", {}, "No posts published yet")}</h4>
        <p>${this.t("receptionist.posts.emptyText", {}, "You can create the first post using the write new post button.")}</p>
      </div>
    `
    : `
      <div class="posts-table-wrap">
        <table class="posts-table" id="receptionist-posts-table">
          <thead>
            <tr>
              <th style="width:60px">ID</th>
              <th>${this.t("receptionist.posts.columns.title", {}, "Post title")}</th>
              <th style="width:130px">${this.t("receptionist.posts.columns.author", {}, "Author")}</th>
              <th style="width:130px">${this.t("receptionist.posts.columns.date", {}, "Publish date")}</th>
              <th style="width:210px; text-align:${actionsAlign}">${this.t("receptionist.posts.columns.actions", {}, "Actions")}</th>
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
          <h3>${this.t("receptionist.posts.dashboardTitle", {}, "School Posts Board")}</h3>
          <p>${this.t("receptionist.posts.dashboardSubtitle", {}, "Create and manage posts shown to students, parents, and teachers.")}</p>
        </div>
        <button type="button" class="btn-new-post" id="receptionist-new-post">${this.t("receptionist.posts.newPost", {}, "Write new post")}</button>
      </div>

      <div class="posts-stats-row">
        <div class="pstat-card" style="--pstat-color:#064e3b">
          <div class="pstat-num">${sortedPosts.length}</div>
          <div class="pstat-lbl">${this.t("receptionist.posts.total", {}, "Total posts")}</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#2563eb">
          <div class="pstat-num">${todayCount}</div>
          <div class="pstat-lbl">${this.t("receptionist.posts.today", {}, "Published today")}</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#059669">
          <div class="pstat-num">${withImage}</div>
          <div class="pstat-lbl">${this.t("receptionist.posts.withImage", {}, "With cover image")}</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#d97706">
          <div class="pstat-num">${sortedPosts.length - withImage}</div>
          <div class="pstat-lbl">${this.t("receptionist.posts.textOnly", {}, "Text only")}</div>
        </div>
      </div>

      <div class="posts-toolbar">
        <div class="posts-search-wrap">
          <span class="search-icon">${this.t("receptionist.posts.searchLabel", {}, "Search")}</span>
          <input class="posts-search" id="receptionist-posts-search" placeholder="${this._escapeAttr(this.t("receptionist.posts.searchPlaceholder", {}, "Search posts..."))}">
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
        <h2>${isEdit ? this.t("receptionist.posts.editorEdit", {}, "Edit Post") : this.t("receptionist.posts.editorNew", {}, "Write New Post")}</h2>
        <div class="editor-topbar-actions">
          <button type="button" class="btn-secondary" id="receptionist-posts-back">${this.t("receptionist.posts.back", {}, "Back to posts")}</button>
        </div>
      </div>

      <div class="editor-meta-row">
        <input class="editor-input editor-input-title" id="editor-title" placeholder="${this._escapeAttr(this.t("receptionist.posts.titlePlaceholder", {}, "Post title"))}" value="${this._escapeAttr(post?.title || "")}">
        <input class="editor-input" id="editor-image-url" placeholder="${this._escapeAttr(this.t("receptionist.posts.imagePlaceholder", {}, "Optional cover image URL"))}" value="${this._escapeAttr(post?.image || "")}">
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
          <button type="button" class="tb-btn" data-md-start="- ">${this.t("receptionist.posts.toolbar.list", {}, "List")}</button>
          <button type="button" class="tb-btn" data-md-start="> ">${this.t("receptionist.posts.toolbar.quote", {}, "Quote")}</button>
          <button type="button" class="tb-btn" data-editor-action="table">${this.t("receptionist.posts.toolbar.table", {}, "Table")}</button>
          <button type="button" class="tb-btn" data-editor-action="link">${this.t("receptionist.posts.toolbar.link", {}, "Link")}</button>
          <button type="button" class="tb-btn" data-editor-action="image">${this.t("receptionist.posts.toolbar.image", {}, "Image")}</button>
          <button type="button" class="tb-btn" data-editor-action="download">${this.t("receptionist.posts.toolbar.download", {}, "Download")}</button>
          <button type="button" class="tb-btn" data-editor-action="math">LaTeX</button>
        </div>
      </div>

      <div class="editor-body">
        <div class="editor-pane">
          <div class="editor-pane-label">Markdown</div>
          <textarea class="editor-textarea" id="editor-content" placeholder="${this._escapeAttr(this.t("receptionist.posts.contentPlaceholder", {}, "Write post content here..."))}">${this._escape(post?.content || "")}</textarea>
        </div>
        <div class="editor-pane editor-preview-pane">
          <div class="editor-pane-label">${this.t("receptionist.posts.previewLabel", {}, "Preview")}</div>
          <div class="preview-inner">
            <img class="preview-cover" id="preview-cover-image" alt="">
            <div class="preview-title" id="preview-title">${this.t("receptionist.posts.previewTitle", {}, "Post title")}</div>
            <div class="md-body" id="preview-body"></div>
          </div>
        </div>
      </div>

      <div class="editor-footer">
        <div class="editor-word-count" id="word-count">${this.t("receptionist.common.wordCount", { words: 0, chars: 0 }, "0 words - 0 characters")}</div>
        <div class="editor-footer-actions">
          <button type="button" class="btn-secondary" id="receptionist-post-preview">${this.t("receptionist.posts.fullPreview", {}, "Full preview")}</button>
          <button type="button" class="btn-save" id="save-post-btn">${isEdit ? this.t("receptionist.posts.saveChanges", {}, "Save changes") : this.t("receptionist.posts.publish", {}, "Publish post")}</button>
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
    this._showPostToast(this.t("receptionist.posts.titleRequired", {}, "Please enter the post title"), "error");
    return;
  }
  if (!content) {
    this._showPostToast(this.t("receptionist.posts.contentRequired", {}, "Please enter the post content"), "error");
    return;
  }

  const button = document.getElementById("save-post-btn");
  if (button) {
    button.disabled = true;
    button.textContent = this.t("receptionist.posts.saving", {}, "Saving...");
  }

  try {
    const payload = { title, content, image };

    if (postId) {
      await ReceptionistServices.updatePost(postId, payload);
      this._showPostToast(this.t("receptionist.posts.updated", {}, "Post updated successfully"), "success");
    } else {
      const session = Auth.getSession();
      payload.user_id = parseInt(session.user_id, 10);
      await ReceptionistServices.createPost(payload);
      this._showPostToast(this.t("receptionist.posts.created", {}, "Post published successfully"), "success");
    }

    setTimeout(() => ReceptionistRole.loadSection("posts"), 650);
  } catch (err) {
    this._showPostToast(this.t("receptionist.posts.saveFailed", { message: err.message }, "Could not save post."), "error");
    if (button) {
      button.disabled = false;
      button.textContent = postId ? this.t("receptionist.posts.saveChanges", {}, "Save changes") : this.t("receptionist.posts.publish", {}, "Publish post");
    }
  }
};

ReceptionistUI.previewPost = function(post) {
  const overlay = document.createElement("div");
  overlay.className = "post-full-preview";
  overlay.innerHTML = `
    <div class="post-full-preview-inner">
      <div class="preview-modal-header">
        <h4>${this.t("receptionist.posts.fullPreview", {}, "Full preview")}</h4>
        <button type="button" class="preview-modal-close" data-close-post-preview>x</button>
      </div>
      <div class="preview-modal-body">
        ${post.image ? `<img src="${this._escapeAttr(post.image)}" class="receptionist-post-preview-cover" alt="">` : ""}
        <div class="preview-title">${this._escape(post.title || this.t("receptionist.posts.untitled", {}, "Untitled post"))}</div>
        <div class="md-body">${this._processPostMarkdown(post.content || "") || `<p class="preview-placeholder">${this.t("receptionist.posts.noContent", {}, "No content.")}</p>`}</div>
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
  if (!confirm(this.t("receptionist.posts.confirmDelete", {}, "Do you want to permanently delete this post?"))) return;

  try {
    await ReceptionistServices.deletePost(postId);
    this._showPostToast(this.t("receptionist.posts.deleted", {}, "Post deleted successfully"), "success");
    await ReceptionistRole.loadSection("posts");
  } catch (err) {
    this._showPostToast(this.t("receptionist.posts.deleteFailed", { message: err.message }, "Could not delete post."), "error");
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
    this.insertMarkdown("\n" + this.t("receptionist.posts.markdown.table", {}, "| First heading | Second heading |\n| --- | --- |\n| Data | Data |\n"), "");
    return;
  }
  if (action === "math") {
    this.insertMarkdown("$$\n", "\n$$");
    return;
  }
  if (action === "image") {
    const url = prompt(this.t("receptionist.posts.prompts.imageUrl", {}, "Image URL:"));
    if (!url) return;
    const alt = prompt(this.t("receptionist.posts.prompts.imageAlt", {}, "Alt text:"), this.t("receptionist.posts.prompts.imageDefault", {}, "Image")) || this.t("receptionist.posts.prompts.imageDefault", {}, "Image");
    this.insertMarkdown(`\n![${alt}](${url})\n`, "");
    return;
  }
  if (action === "link") {
    const url = prompt(this.t("receptionist.posts.prompts.linkUrl", {}, "URL:"));
    if (!url) return;
    const text = prompt(this.t("receptionist.posts.prompts.linkText", {}, "Link text:"), this.t("receptionist.posts.prompts.linkDefault", {}, "Click here")) || this.t("receptionist.posts.prompts.linkDefault", {}, "Click here");
    this.insertMarkdown(`[${text}](${url})`, "");
    return;
  }
  if (action === "download") {
    const name = prompt(this.t("receptionist.posts.prompts.fileName", {}, "File name:"));
    if (!name) return;
    const url = prompt(this.t("receptionist.posts.prompts.downloadUrl", {}, "Download URL:"));
    if (!url) return;
    const type = prompt(this.t("receptionist.posts.prompts.fileType", {}, "Optional file type:"), "") || "";
    const size = prompt(this.t("receptionist.posts.prompts.fileSize", {}, "Optional size:"), "") || "";
    const meta = [type, size].filter(Boolean).join("|");
    const prefix = this.t("receptionist.posts.markdown.downloadPrefix", {}, "Download");
    this.insertMarkdown(`\n[${prefix}: ${name}${meta ? "|" + meta : ""}](${url})\n`, "");
  }
};

ReceptionistUI.updatePostPreview = function() {
  const titleInput = document.getElementById("editor-title");
  const imageInput = document.getElementById("editor-image-url");
  const contentInput = document.getElementById("editor-content");
  const title = document.getElementById("preview-title");
  const image = document.getElementById("preview-cover-image");
  const body = document.getElementById("preview-body");

  if (title) title.textContent = titleInput?.value || this.t("receptionist.posts.previewTitle", {}, "Post title");
  if (image) {
    const src = imageInput?.value?.trim() || "";
    image.src = src;
    image.style.display = src ? "block" : "none";
  }

  if (!body) return;
  const raw = contentInput?.value || "";
  body.innerHTML = raw.trim()
    ? this._processPostMarkdown(raw)
    : `<p class="preview-placeholder">${this.t("receptionist.posts.previewEmpty", {}, "Start writing to see the preview here...")}</p>`;
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

  const prefixes = ["\\u062a\\u062d\\u0645\\u064a\\u0644", "Download"];
  const downloadPattern = new RegExp(`\\[(?:${prefixes.join("|")}):\\s*([^\\]|]+?)(?:\\|([^\\]|]*?))?(?:\\|([^\\]]*?))?\\]\\(([^)]+)\\)`, "g");
  let source = String(raw).replace(downloadPattern, (_, name, type, size, url) => {
    const safeUrl = this._escapeAttr(url.trim());
    const safeName = this._escape(name.trim());
    const meta = [type, size].map(part => part?.trim()).filter(Boolean).join(" - ");
    return `
      <a href="${safeUrl}" target="_blank" class="dl-card" rel="noopener noreferrer">
        <span class="dl-card-icon">${this.t("receptionist.common.file", {}, "File")}</span>
        <span class="dl-card-info">
          <span class="dl-card-name">${safeName}</span>
          ${meta ? `<span class="dl-card-meta">${this._escape(meta)}</span>` : ""}
        </span>
        <span class="dl-card-btn">${this.t("receptionist.common.download", {}, "Download")}</span>
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
  counter.textContent = this.t("receptionist.common.wordCount", { words, chars: textarea.value.length }, `${words} words - ${textarea.value.length} characters`);
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

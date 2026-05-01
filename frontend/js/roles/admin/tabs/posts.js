// frontend/js/roles/admin/tabs/posts.js

AdminUI.postsT = function(key, params = {}, fallback = "") {
    return this.t(`admin.postsTab.${key}`, params, fallback);
};

AdminUI.postInlineString = function(value) {
    return JSON.stringify(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.postsDate = function(value) {
    if (!value) return "-";
    const locale = window.I18n?.currentLang === "en" ? "en-US" : "ar-DZ";
    try {
        return new Date(value).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    } catch (err) {
        return value;
    }
};

function _postT(key, params = {}, fallback = "") {
    return window.AdminUI?.postsT ? AdminUI.postsT(key, params, fallback) : fallback;
}

function _postEscapeAttr(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
}

function _postEscapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function _showToast(msg, type = "success") {
    let toast = document.querySelector(".post-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "post-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `post-toast ${type}`;
    void toast.offsetWidth;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
}

function _getFileIcon(ext) {
    const icons = {
        pdf: "file",
        doc: "files",
        docx: "files",
        xls: "chart",
        xlsx: "chart",
        ppt: "files",
        pptx: "files",
        zip: "archive",
        rar: "archive",
        mp4: "video",
        mp3: "audio",
        png: "image",
        jpg: "image",
        jpeg: "image"
    };
    return icons[ext?.toLowerCase()] || "file";
}

function _extractTextSnippet(md, len = 90) {
    const plain = String(md || "").replace(/[#*`>[\]!]/g, "").replace(/\n+/g, " ").trim();
    return plain.slice(0, len) + (plain.length > len ? "..." : "");
}

function _processMD(raw) {
    if (!raw) return "";

    const currentToken = _postEscapeRegExp(_postT("download.token", {}, "Download"));
    const downloadPattern = new RegExp(`\\[(?:Download|${currentToken}|\\u062a\\u062d\\u0645\\u064a\\u0644):\\s*([^\\]|]+?)(?:\\|([^\\]|]*?))?(?:\\|([^\\]]*?))?\\]\\(([^)]+)\\)`, "gi");

    raw = raw.replace(downloadPattern, (_, name, type, size, url) => {
        const ext = url.split(".").pop()?.split("?")[0];
        const icon = _getFileIcon(ext);
        const metaParts = [];
        if (type) metaParts.push(type.trim().toUpperCase());
        if (size) metaParts.push(size.trim());
        const meta = metaParts.join(" / ");
        return `<DLCARD data-url="${_postEscapeAttr(url)}" data-name="${_postEscapeAttr(name.trim())}" data-meta="${_postEscapeAttr(meta)}" data-icon="${_postEscapeAttr(icon)}"></DLCARD>`;
    });

    const mdOptions = { gfm: true, breaks: true, tables: true };
    let html = (typeof marked !== "undefined") ? marked.parse(raw, mdOptions) : raw.replace(/\n/g, "<br>");

    const cardHtml = (_, url, name, meta, iconName) => `
        <a href="${url}" target="_blank" class="dl-card" rel="noopener noreferrer">
          <span class="dl-card-icon">${AdminUI.icon(iconName, "inline-svg-icon")}</span>
          <span class="dl-card-info">
            <span class="dl-card-name">${name}</span>
            ${meta ? `<span class="dl-card-meta">${meta}</span>` : ""}
          </span>
          <span class="dl-card-btn">${_postT("download.button", {}, "Download")}</span>
        </a>`;

    html = html.replace(/<p><DLCARD data-url="([^"]*)" data-name="([^"]*)" data-meta="([^"]*)" data-icon="([^"]*)"><\/DLCARD><\/p>/gi, cardHtml);
    html = html.replace(/<DLCARD data-url="([^"]*)" data-name="([^"]*)" data-meta="([^"]*)" data-icon="([^"]*)"><\/DLCARD>/gi, cardHtml);

    if (typeof DOMPurify !== "undefined") {
        html = DOMPurify.sanitize(html, {
            ADD_TAGS: ["a", "span"],
            ADD_ATTR: ["target", "rel", "class", "href"],
            FORCE_BODY: false
        });
    }
    return html;
}

AdminUI.typesetPostMath = function(container, attempt = 0) {
    if (!container || typeof MathJax === "undefined") return;

    if (MathJax.typesetPromise) {
        if (MathJax.typesetClear) MathJax.typesetClear([container]);
        MathJax.typesetPromise([container]).catch(() => {});
        return;
    }

    if (MathJax.startup?.promise) {
        MathJax.startup.promise
            .then(() => this.typesetPostMath(container, attempt + 1))
            .catch(() => {});
        return;
    }

    if (attempt < 8) {
        setTimeout(() => this.typesetPostMath(container, attempt + 1), 250);
    }
};

AdminUI.renderPostsTab = function(response) {
    const main = this.prepareMain(this.t("admin.sections.posts", {}, "Announcements and Posts"));
    const posts = response?.data ?? response ?? [];
    const today = new Date().toDateString();
    const todayCount = posts.filter(p => p.created_at && new Date(p.created_at).toDateString() === today).length;
    const withImage = posts.filter(p => p.image).length;

    const statsHtml = `
      <div class="posts-stats-row">
        <div class="pstat-card" style="--pstat-color:#064e3b">
          <div class="pstat-num">${posts.length}</div>
          <div class="pstat-lbl">${this.postsT("stats.total", {}, "Total announcements")}</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#3b82f6">
          <div class="pstat-num">${todayCount}</div>
          <div class="pstat-lbl">${this.postsT("stats.today", {}, "Published today")}</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#f59e0b">
          <div class="pstat-num">${withImage}</div>
          <div class="pstat-lbl">${this.postsT("stats.withCover", {}, "With cover image")}</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#8b5cf6">
          <div class="pstat-num">${posts.length - withImage}</div>
          <div class="pstat-lbl">${this.postsT("stats.textOnly", {}, "Text only")}</div>
        </div>
      </div>`;

    const headerHtml = `
      <div class="posts-header-bar">
        <div>
          <h3>${this.icon("newspaper", "inline-svg-icon")} ${this.postsT("header.title", {}, "School Announcements Board")}</h3>
          <p>${this.postsT("header.description", {}, "Manage announcements and posts addressed to students and parents.")}</p>
        </div>
        <button class="btn-new-post" onclick="AdminUI.showPostEditor()">
          ${this.icon("edit", "inline-svg-icon")} ${this.postsT("actions.newPost", {}, "Write New Announcement")}
        </button>
      </div>`;

    const toolbarHtml = `
      <div class="posts-toolbar">
        <div class="posts-search-wrap">
          <span class="search-icon">${this.icon("search", "inline-svg-icon")}</span>
          <input class="posts-search" id="posts-search-input" placeholder="${this.postsT("search.placeholder", {}, "Search announcements...")}" oninput="AdminUI._filterPosts(this.value)">
        </div>
      </div>`;

    let listHtml;
    if (posts.length === 0) {
        listHtml = `
          <div class="posts-empty">
            <div class="empty-icon">${this.icon("newspaper", "inline-svg-icon")}</div>
            <h4>${this.postsT("empty.title", {}, "No announcements have been published yet")}</h4>
            <p>${this.postsT("empty.description", {}, "Start by writing the first announcement for the school community.")}</p>
          </div>`;
    } else {
        const rows = posts.map(p => {
            const pid = p.post_id ?? p.id;
            const date = this.postsDate(p.created_at);
            const excerpt = _extractTextSnippet(p.content ?? "");
            const postJSON = JSON.stringify(p).replace(/'/g, "&#39;");
            const searchText = `${p.title ?? ""} ${p.content ?? ""}`.toLowerCase();
            return `
              <tr data-search="${this._escape(searchText)}">
                <td data-label="ID"><span class="badge badge-blue">#${pid}</span></td>
                <td data-label="${this.postsT("table.announcement", {}, "Announcement")}">
                  <div class="post-title-cell">
                    ${p.image
                        ? `<img src="${this._escape(p.image)}" class="post-thumb" alt="">`
                        : `<div class="post-thumb-placeholder">${this.icon("file", "inline-svg-icon")}</div>`}
                    <div>
                      <div class="post-title-text" title="${this._escape(p.title)}">${this._escape(p.title)}</div>
                      <div class="post-excerpt">${this._escape(excerpt)}</div>
                    </div>
                  </div>
                </td>
                <td data-label="${this.postsT("table.author", {}, "Author")}"><span class="badge badge-green">${this.postsT("table.userFallback", { id: p.user_id }, `User #${p.user_id}`)}</span></td>
                <td data-label="${this.postsT("table.publishDate", {}, "Publish Date")}"><span style="font-size:.85rem; color:#64748b; direction:ltr; display:inline-block;">${date}</span></td>
                <td class="admin-actions-cell" data-label="${this.postsT("table.actions", {}, "Actions")}">
                  <div class="tbl-actions">
                    <button class="tbl-btn tbl-btn-preview" onclick='AdminUI.previewPost(${postJSON})' title="${this.postsT("actions.preview", {}, "Preview")}">${this.icon("eye", "inline-svg-icon")} ${this.postsT("actions.preview", {}, "Preview")}</button>
                    <button class="tbl-btn tbl-btn-edit" onclick='AdminUI.showPostEditor(${postJSON})' title="${this.t("admin.actions.edit", {}, "Edit")}">${this.icon("edit", "inline-svg-icon")} ${this.t("admin.actions.edit", {}, "Edit")}</button>
                    <button class="tbl-btn tbl-btn-delete" onclick="AdminRole.deleteItem('/posts',${pid},'posts')" title="${this.t("admin.actions.delete", {}, "Delete")}">${this.icon("trash", "inline-svg-icon")}</button>
                  </div>
                </td>
              </tr>`;
        }).join("");

        listHtml = `
          <div class="posts-table-wrap">
            <table class="posts-table" id="posts-table">
              <thead>
                <tr>
                  <th style="width:60px">ID</th>
                  <th>${this.postsT("table.title", {}, "Announcement Title")}</th>
                  <th style="width:130px">${this.postsT("table.author", {}, "Author")}</th>
                  <th style="width:130px">${this.postsT("table.publishDate", {}, "Publish Date")}</th>
                  <th style="width:200px; text-align:left">${this.postsT("table.actions", {}, "Actions")}</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`;
    }

    main.innerHTML = `<div class="posts-dashboard">${headerHtml}${statsHtml}${toolbarHtml}${listHtml}</div>`;
};

AdminUI._filterPosts = function(query) {
    const rows = document.querySelectorAll("#posts-table tbody tr");
    const q = query.toLowerCase();
    rows.forEach(row => {
        row.style.display = row.dataset.search?.includes(q) ? "" : "none";
    });
};

AdminUI.previewPost = function(post) {
    const overlay = document.createElement("div");
    overlay.className = "post-full-preview";
    const html = _processMD(post.content ?? "");
    overlay.innerHTML = `
      <div class="post-full-preview-inner">
        <div class="preview-modal-header">
          <h4>${this.postsT("preview.title", {}, "Announcement Preview")}</h4>
          <button class="preview-modal-close" onclick="this.closest('.post-full-preview').remove()" aria-label="${this.t("admin.actions.close", {}, "Close")}">&times;</button>
        </div>
        <div class="preview-modal-body">
          ${post.image ? `<img src="${this._escape(post.image)}" style="width:100%;max-height:220px;object-fit:cover;border-radius:10px;margin-bottom:20px" alt="">` : ""}
          <div class="preview-title">${this._escape(post.title ?? "")}</div>
          <div class="md-body">${html}</div>
        </div>
      </div>`;
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    this.typesetPostMath(overlay);
};

AdminUI.showPostEditor = function(post = null) {
    const main = document.getElementById("admin-main");
    const isEdit = !!post;
    const postId = post ? (post.post_id ?? post.id) : null;
    const titleVal = post ? this._escape(post.title) : "";
    const imageVal = post?.image ? this._escape(post.image) : "";

    const toolbarBtns = [
        { group: "headings", items: [
            { label: "H1", code: "# ", end: "" },
            { label: "H2", code: "## ", end: "" },
            { label: "H3", code: "### ", end: "" }
        ] },
        { sep: true },
        { group: "format", items: [
            { label: "<b>B</b>", code: "**", end: "**", title: this.postsT("toolbar.bold", {}, "Bold") },
            { label: "<i>I</i>", code: "*", end: "*", title: this.postsT("toolbar.italic", {}, "Italic") },
            { label: "<s>S</s>", code: "~~", end: "~~", title: this.postsT("toolbar.strike", {}, "Strikethrough") },
            { label: "`C`", code: "`", end: "`", title: this.postsT("toolbar.inlineCode", {}, "Inline code") }
        ] },
        { sep: true },
        { group: "structure", items: [
            { label: this.postsT("toolbar.list", {}, "List"), code: "- ", end: "" },
            { label: this.postsT("toolbar.numbered", {}, "Numbered"), code: "1. ", end: "" },
            { label: this.postsT("toolbar.quote", {}, "Quote"), code: "> ", end: "" },
            { label: this.postsT("toolbar.divider", {}, "Divider"), code: "\n---\n", end: "" }
        ] },
        { sep: true },
        { group: "advanced", items: [
            { label: this.postsT("toolbar.table", {}, "Table"), action: "insertTable", title: this.postsT("toolbar.insertTable", {}, "Insert table") },
            { label: this.postsT("toolbar.image", {}, "Image"), action: "insertImage", title: this.postsT("toolbar.insertImage", {}, "Insert image") },
            { label: this.postsT("toolbar.link", {}, "Link"), action: "insertLink", title: this.postsT("toolbar.insertLink", {}, "Insert link") },
            { label: this.postsT("toolbar.download", {}, "Download"), action: "insertDownload", title: this.postsT("toolbar.downloadLink", {}, "Download link") },
            { label: this.postsT("toolbar.codeBlock", {}, "Code block"), action: "insertCode", title: this.postsT("toolbar.insertCode", {}, "Insert code block") },
            { label: this.postsT("toolbar.math", {}, "Math"), action: "insertMath", title: this.postsT("toolbar.insertMath", {}, "Math equation") }
        ] }
    ];

    let tbHtml = "";
    for (const group of toolbarBtns) {
        if (group.sep) {
            tbHtml += '<div class="tb-sep"></div>';
            continue;
        }
        tbHtml += '<div class="tb-group">';
        for (const btn of group.items) {
            if (btn.action) {
                tbHtml += `<button type="button" class="tb-btn" onclick="AdminUI._editorAction('${btn.action}')" title="${this._escape(btn.title ?? "")}"><span class="tb-btn-label">${btn.label}</span></button>`;
            } else {
                const escapedCode = btn.code.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
                const escapedEnd = btn.end.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
                tbHtml += `<button type="button" class="tb-btn" onclick="AdminUI.insertMarkdown('${escapedCode}','${escapedEnd}')" title="${this._escape(btn.title ?? btn.label)}"><span style="font-weight:600;">${btn.label}</span></button>`;
            }
        }
        tbHtml += "</div>";
    }

    const savedMode = localStorage.getItem("admin-post-editor-mode") || "split";

    main.innerHTML = `
      <div class="post-editor-page" data-editor-mode="${savedMode}">
        <div class="editor-topbar">
          <div class="editor-title-block">
            <span class="editor-kicker">${isEdit ? this.postsT("editor.editKicker", {}, "Edit Post") : this.postsT("editor.newKicker", {}, "New Post")}</span>
            <h2>${isEdit ? this.postsT("editor.editTitle", {}, "Edit Announcement") : this.postsT("editor.newTitle", {}, "Write New Announcement")}</h2>
          </div>
          <div class="editor-topbar-actions">
            <div class="editor-mode-switch" role="group" aria-label="${this.postsT("editor.viewMode", {}, "View Mode")}">
              <button type="button" class="editor-mode-btn" data-mode="write" onclick="AdminUI.setPostEditorMode('write')">${this.postsT("editor.modeWrite", {}, "Write")}</button>
              <button type="button" class="editor-mode-btn" data-mode="split" onclick="AdminUI.setPostEditorMode('split')">${this.postsT("editor.modeSplit", {}, "Split")}</button>
              <button type="button" class="editor-mode-btn" data-mode="preview" onclick="AdminUI.setPostEditorMode('preview')">${this.postsT("editor.modePreview", {}, "Preview")}</button>
            </div>
            <button class="btn-secondary editor-fullscreen-btn" onclick="AdminUI.togglePostEditorFullscreen()" title="${this.postsT("editor.fullscreen", {}, "Fullscreen")}">${this.icon("panelOpen", "inline-svg-icon")}</button>
            <button class="btn-secondary" onclick="AdminRole.loadSection('posts')">${this.postsT("editor.backToList", {}, "Back to list")}</button>
          </div>
        </div>

        <div class="editor-draft-banner" id="editor-draft-banner" hidden>
          <span>${this.postsT("draft.savedDraftFound", {}, "A saved draft exists for this announcement.")}</span>
          <div>
            <button type="button" onclick="AdminUI.restorePostDraft()">${this.postsT("draft.restore", {}, "Restore")}</button>
            <button type="button" onclick="AdminUI.clearPostDraft()">${this.postsT("draft.dismiss", {}, "Dismiss")}</button>
          </div>
        </div>

        <div class="editor-meta-row">
          <label class="editor-field editor-field-title">
            <span>${this.postsT("editor.titleLabel", {}, "Announcement Title")}</span>
            <input type="text" id="editor-title" class="editor-input editor-input-title"
                   placeholder="${this.postsT("editor.titlePlaceholder", {}, "Write a clear title...")}" value="${titleVal}"
                   oninput="AdminUI.updatePostPreview()">
          </label>
          <label class="editor-field">
            <span>${this.postsT("editor.coverLabel", {}, "Cover Image")}</span>
            <input type="url" id="editor-image-url" class="editor-input"
                   placeholder="https://example.com/cover.jpg"
                   value="${imageVal}" oninput="AdminUI.updatePostPreview()">
          </label>
        </div>

        <div class="editor-toolbar-shell">
          <div class="editor-toolbar">${tbHtml}</div>
        </div>

        <div class="editor-body">
          <div class="editor-pane editor-write-pane">
            <div class="editor-pane-label">
              <span>${this.postsT("editor.editorPane", {}, "Editor")}</span>
              <span id="editor-cursor-info">${this.postsT("editor.lineColumn", { line: 1, column: 1 }, "Line 1 - Column 1")}</span>
            </div>
            <textarea id="editor-content" class="editor-textarea"
              placeholder="${this.postsT("editor.contentPlaceholder", {}, "Write announcement content here...")}"
              spellcheck="true"
              oninput="AdminUI.updatePostPreview(); AdminUI._updateWordCount()"></textarea>
          </div>

          <div class="editor-pane editor-preview-pane">
            <div class="editor-pane-label">
              <span>${this.postsT("editor.livePreview", {}, "Live Preview")}</span>
              <span id="editor-preview-state">${this.postsT("editor.ready", {}, "Ready")}</span>
            </div>
            <div class="preview-inner">
              <img id="preview-cover-image" class="preview-cover" alt="${this.postsT("editor.coverAlt", {}, "Cover")}">
              <div class="preview-title" id="preview-title">${this.postsT("editor.titleFallback", {}, "Announcement Title")}</div>
              <div class="md-body" id="preview-body">
                <p class="preview-placeholder">${this.postsT("editor.previewPlaceholder", {}, "Start typing to see the preview here...")}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="editor-footer">
          <div class="editor-footer-meta">
            <span class="editor-word-count" id="word-count">${this.postsT("editor.wordCount", { words: 0, chars: 0 }, "0 words - 0 characters")}</span>
            <span class="editor-draft-status" id="editor-draft-status">${this.postsT("editor.ready", {}, "Ready")}</span>
          </div>
          <div class="editor-footer-actions">
            <button class="btn-secondary" onclick="AdminRole.loadSection('posts')">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
            <button class="btn-save" id="save-post-btn" onclick="AdminUI.savePost(${postId})">
              ${isEdit ? this.postsT("actions.saveChanges", {}, "Save Changes") : this.postsT("actions.publish", {}, "Publish Announcement")}
            </button>
          </div>
        </div>
      </div>`;

    requestAnimationFrame(() => {
        const ta = document.getElementById("editor-content");
        if (ta && isEdit) ta.value = post.content ?? "";
        AdminUI.initPostEditorControls(postId);
        AdminUI.setPostEditorMode(savedMode);
        AdminUI.updatePostPreview();
        AdminUI._updateWordCount();
        AdminUI.updateEditorCursorInfo();
    });
};

AdminUI.initPostEditorControls = function(postId) {
    const page = document.querySelector(".post-editor-page");
    const titleInput = document.getElementById("editor-title");
    const imageInput = document.getElementById("editor-image-url");
    const textArea = document.getElementById("editor-content");
    if (!page || !titleInput || !imageInput || !textArea) return;

    page.dataset.draftKey = AdminUI.getPostDraftKey(postId);
    page.dataset.postId = postId ?? "";

    const draft = AdminUI.readPostDraft();
    const hasDraft = draft && [draft.title, draft.image, draft.content].some(value => String(value || "").trim());
    const differsFromCurrent = hasDraft && (
        draft.title !== titleInput.value ||
        draft.image !== imageInput.value ||
        draft.content !== textArea.value
    );
    const banner = document.getElementById("editor-draft-banner");
    if (banner) banner.hidden = !differsFromCurrent;

    const scheduleDraft = () => {
        AdminUI.updateEditorCursorInfo();
        const status = document.getElementById("editor-draft-status");
        if (status) status.textContent = AdminUI.postsT("draft.unsaved", {}, "Unsaved changes");
        clearTimeout(AdminUI._postDraftTimer);
        AdminUI._postDraftTimer = setTimeout(() => AdminUI.savePostDraft(), 450);
    };

    [titleInput, imageInput, textArea].forEach(el => el.addEventListener("input", scheduleDraft));
    textArea.addEventListener("keydown", event => AdminUI.handlePostEditorKeydown(event, postId));
    textArea.addEventListener("keyup", () => AdminUI.updateEditorCursorInfo());
    textArea.addEventListener("click", () => AdminUI.updateEditorCursorInfo());
    textArea.addEventListener("select", () => AdminUI.updateEditorCursorInfo());
};

AdminUI.getPostDraftKey = function(postId) {
    return `admin-post-editor-draft-${postId ?? "new"}`;
};

AdminUI.readPostDraft = function() {
    const page = document.querySelector(".post-editor-page");
    const key = page?.dataset?.draftKey;
    if (!key) return null;
    try {
        return JSON.parse(localStorage.getItem(key) || "null");
    } catch (err) {
        return null;
    }
};

AdminUI.savePostDraft = function() {
    const page = document.querySelector(".post-editor-page");
    const key = page?.dataset?.draftKey;
    if (!key) return;

    const draft = {
        title: document.getElementById("editor-title")?.value || "",
        image: document.getElementById("editor-image-url")?.value || "",
        content: document.getElementById("editor-content")?.value || "",
        updatedAt: new Date().toISOString()
    };

    try {
        localStorage.setItem(key, JSON.stringify(draft));
        const status = document.getElementById("editor-draft-status");
        if (status) status.textContent = this.postsT("draft.saved", {}, "Draft saved");
    } catch (err) {
        const status = document.getElementById("editor-draft-status");
        if (status) status.textContent = this.postsT("draft.saveFailed", {}, "Unable to save draft");
    }
};

AdminUI.restorePostDraft = function() {
    const draft = AdminUI.readPostDraft();
    if (!draft) return;

    const titleInput = document.getElementById("editor-title");
    const imageInput = document.getElementById("editor-image-url");
    const textArea = document.getElementById("editor-content");
    if (titleInput) titleInput.value = draft.title || "";
    if (imageInput) imageInput.value = draft.image || "";
    if (textArea) textArea.value = draft.content || "";

    const banner = document.getElementById("editor-draft-banner");
    if (banner) banner.hidden = true;
    AdminUI.updatePostPreview();
    AdminUI._updateWordCount();
    AdminUI.updateEditorCursorInfo();
    AdminUI.savePostDraft();
};

AdminUI.clearPostDraft = function(silent = false) {
    const page = document.querySelector(".post-editor-page");
    const key = page?.dataset?.draftKey;
    if (key) localStorage.removeItem(key);
    const banner = document.getElementById("editor-draft-banner");
    if (banner) banner.hidden = true;
    const status = document.getElementById("editor-draft-status");
    if (status) status.textContent = this.postsT("editor.ready", {}, "Ready");
    if (!silent) _showToast(this.postsT("draft.dismissed", {}, "Draft dismissed"), "success");
};

AdminUI.handlePostEditorKeydown = function(event, postId) {
    const key = event.key.toLowerCase();
    const isMod = event.ctrlKey || event.metaKey;

    if (event.key === "Enter" && AdminUI.continueEditorList()) {
        event.preventDefault();
        return;
    }

    if (event.key === "Tab") {
        event.preventDefault();
        AdminUI.indentEditorSelection(event.shiftKey);
        return;
    }

    if (!isMod) return;
    if (key === "b") {
        event.preventDefault();
        AdminUI.insertMarkdown("**", "**");
    } else if (key === "i") {
        event.preventDefault();
        AdminUI.insertMarkdown("*", "*");
    } else if (key === "k") {
        event.preventDefault();
        AdminUI._modalInsertLink();
    } else if (key === "s") {
        event.preventDefault();
        AdminUI.savePost(postId);
    }
};

AdminUI.continueEditorList = function() {
    const ta = document.getElementById("editor-content");
    if (!ta || ta.selectionStart !== ta.selectionEnd) return false;

    const start = ta.selectionStart;
    const value = ta.value;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const line = value.slice(lineStart, start);
    const match = line.match(/^(\s*)([-*+]|\d+\.|>)\s+(.*)$/);
    if (!match) return false;

    const [, spaces, marker, rest] = match;
    if (!rest.trim()) {
        ta.value = value.slice(0, lineStart) + value.slice(start);
        ta.setSelectionRange(lineStart, lineStart);
        AdminUI.updatePostPreview();
        AdminUI._updateWordCount();
        AdminUI.updateEditorCursorInfo();
        AdminUI.savePostDraft();
        return true;
    }

    const nextMarker = /^\d+\.$/.test(marker) ? `${parseInt(marker, 10) + 1}.` : marker;
    const insertion = `\n${spaces}${nextMarker} `;
    ta.value = value.slice(0, start) + insertion + value.slice(start);
    const nextPos = start + insertion.length;
    ta.setSelectionRange(nextPos, nextPos);
    AdminUI.updatePostPreview();
    AdminUI._updateWordCount();
    AdminUI.updateEditorCursorInfo();
    AdminUI.savePostDraft();
    return true;
};

AdminUI.indentEditorSelection = function(outdent = false) {
    const ta = document.getElementById("editor-content");
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = ta.value;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const selected = value.slice(lineStart, end);
    const indent = "    ";
    const next = selected.split("\n").map(line => {
        if (!outdent) return indent + line;
        return line.startsWith(indent) ? line.slice(indent.length) : line.replace(/^\s{1,3}/, "");
    }).join("\n");

    ta.value = value.slice(0, lineStart) + next + value.slice(end);
    ta.focus();
    ta.selectionStart = lineStart;
    ta.selectionEnd = lineStart + next.length;
    AdminUI.updatePostPreview();
    AdminUI._updateWordCount();
    AdminUI.updateEditorCursorInfo();
    AdminUI.savePostDraft();
};

AdminUI.setPostEditorMode = function(mode) {
    const page = document.querySelector(".post-editor-page");
    if (!page) return;
    const nextMode = ["write", "split", "preview"].includes(mode) ? mode : "split";
    page.dataset.editorMode = nextMode;
    localStorage.setItem("admin-post-editor-mode", nextMode);
    document.querySelectorAll(".editor-mode-btn").forEach(btn => {
        const isActive = btn.dataset.mode === nextMode;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
};

AdminUI.togglePostEditorFullscreen = function() {
    const page = document.querySelector(".post-editor-page");
    if (!page) return;
    const isFullscreen = page.classList.toggle("editor-fullscreen");
    document.body.classList.toggle("post-editor-fullscreen", isFullscreen);
};

AdminUI.updateEditorCursorInfo = function() {
    const ta = document.getElementById("editor-content");
    const info = document.getElementById("editor-cursor-info");
    if (!ta || !info) return;
    const before = ta.value.slice(0, ta.selectionStart);
    const lines = before.split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    info.textContent = this.postsT("editor.lineColumn", { line, column }, `Line ${line} - Column ${column}`);
};

AdminUI.insertMarkdown = function(startTag, endTag) {
    const ta = document.getElementById("editor-content");
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end);
    ta.value = ta.value.substring(0, start) + startTag + selected + endTag + ta.value.substring(end);
    ta.focus();
    const innerStart = start + startTag.length;
    const innerEnd = innerStart + selected.length;
    if (endTag) ta.setSelectionRange(innerStart, innerEnd);
    else ta.setSelectionRange(innerEnd, innerEnd);
    AdminUI.updatePostPreview();
    AdminUI._updateWordCount();
    AdminUI.updateEditorCursorInfo();
    AdminUI.savePostDraft();
};

AdminUI._editorAction = function(action) {
    const actions = {
        insertTable: AdminUI._modalInsertTable.bind(AdminUI),
        insertImage: AdminUI._modalInsertImage.bind(AdminUI),
        insertLink: AdminUI._modalInsertLink.bind(AdminUI),
        insertDownload: AdminUI._modalInsertDownload.bind(AdminUI),
        insertCode: AdminUI._quickInsertCode.bind(AdminUI),
        insertMath: AdminUI._quickInsertMath.bind(AdminUI)
    };
    actions[action]?.();
};

AdminUI.postDefaultAlign = function() {
    return document.documentElement.dir === "ltr" ? "left" : "right";
};

AdminUI.postDefaultHeader = function(index) {
    return this.postsT("tableBuilder.defaultHeader", { index }, `Column ${index}`);
};

AdminUI._tblState = { cols: 3, rows: 3, aligns: [], headers: [] };

AdminUI._modalInsertTable = function() {
    const s = AdminUI._tblState;
    if (!s.headers.length) s.headers = [1, 2, 3].map(i => AdminUI.postDefaultHeader(i));
    if (!s.aligns.length) s.aligns = [AdminUI.postDefaultAlign(), AdminUI.postDefaultAlign(), AdminUI.postDefaultAlign()];
    AdminUI._openModal(`
      <div class="modal-header">
        <h3>${AdminUI.icon("chart", "inline-svg-icon")} ${AdminUI.postsT("tableBuilder.title", {}, "Table Builder")}</h3>
        <button class="modal-close-btn" onclick="AdminUI._closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="tbl-builder-grid">
          <div>
            <div class="tbl-ctrl-row">
              <label>${AdminUI.postsT("tableBuilder.columns", {}, "Columns")}</label>
              <input type="range" min="2" max="8" value="${s.cols}" id="tbl-col-slider" oninput="AdminUI._tblUpdate()">
              <span id="tbl-col-val">${s.cols}</span>
            </div>
            <div class="tbl-ctrl-row">
              <label>${AdminUI.postsT("tableBuilder.rows", {}, "Rows")}</label>
              <input type="range" min="1" max="10" value="${s.rows}" id="tbl-row-slider" oninput="AdminUI._tblUpdate()">
              <span id="tbl-row-val">${s.rows}</span>
            </div>
            <div class="tbl-section-label">${AdminUI.postsT("tableBuilder.alignment", {}, "Column Alignment")}</div>
            <div class="tbl-align-row" id="tbl-align-row"></div>
            <div class="tbl-section-label">${AdminUI.postsT("tableBuilder.markdownCode", {}, "Markdown Code")}</div>
            <div class="tbl-md-preview" id="tbl-md-out"></div>
          </div>
          <div>
            <div class="tbl-section-label">${AdminUI.postsT("tableBuilder.previewHint", {}, "Preview - edit headers directly")}</div>
            <div class="tbl-mini-preview" id="tbl-mini-preview"></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn-cancel" onclick="AdminUI._closeModal()">${AdminUI.t("admin.actions.cancel", {}, "Cancel")}</button>
        <button class="modal-btn-primary" onclick="AdminUI._doInsertTable()">${AdminUI.postsT("tableBuilder.insert", {}, "Insert in editor")}</button>
      </div>`, { className: "table-builder-modal" });
    AdminUI._tblUpdate();
};

AdminUI._tblUpdate = function() {
    const s = AdminUI._tblState;
    s.cols = parseInt(document.getElementById("tbl-col-slider")?.value, 10) || 3;
    s.rows = parseInt(document.getElementById("tbl-row-slider")?.value, 10) || 3;
    document.getElementById("tbl-col-val").textContent = s.cols;
    document.getElementById("tbl-row-val").textContent = s.rows;
    while (s.aligns.length < s.cols) s.aligns.push(AdminUI.postDefaultAlign());
    while (s.headers.length < s.cols) s.headers.push(AdminUI.postDefaultHeader(s.headers.length + 1));
    s.aligns = s.aligns.slice(0, s.cols);
    s.headers = s.headers.slice(0, s.cols);

    const alignRow = document.getElementById("tbl-align-row");
    alignRow.innerHTML = "";
    for (let c = 0; c < s.cols; c++) {
        const group = document.createElement("div");
        group.className = "tbl-col-align";
        group.innerHTML = `<span>${c + 1}</span><div>
          ${["right", "center", "left"].map(a =>
            `<button class="tbl-align-btn${s.aligns[c] === a ? " sel" : ""}" onclick="AdminUI._tblSetAlign(${c},'${a}')" title="${AdminUI.postsT(`tableBuilder.align.${a}`, {}, a)}">${a === "right" ? "R" : a === "center" ? "C" : "L"}</button>`
          ).join("")}</div>`;
        alignRow.appendChild(group);
    }

    const preview = document.getElementById("tbl-mini-preview");
    let ths = "";
    for (let c = 0; c < s.cols; c++) {
        ths += `<th style="text-align:${s.aligns[c]}"><input value="${AdminUI._escape(s.headers[c] || "")}" placeholder="${AdminUI.postsT("tableBuilder.headerPlaceholder", {}, "Header")}" oninput="AdminUI._tblState.headers[${c}]=this.value;AdminUI._tblBuildMD()" style="text-align:${s.aligns[c]}"></th>`;
    }
    let trs = "";
    for (let r = 0; r < s.rows; r++) {
        let tds = "";
        for (let c = 0; c < s.cols; c++) tds += `<td style="text-align:${s.aligns[c]}">-</td>`;
        trs += `<tr>${tds}</tr>`;
    }
    preview.innerHTML = `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    AdminUI._tblBuildMD();
};

AdminUI._tblSetAlign = function(col, align) {
    AdminUI._tblState.aligns[col] = align;
    AdminUI._tblUpdate();
};

AdminUI._tblBuildMD = function() {
    const s = AdminUI._tblState;
    const sepMap = { right: "---", center: ":---:", left: ":---" };
    const header = "| " + Array.from({ length: s.cols }, (_, i) => s.headers[i] || AdminUI.postDefaultHeader(i + 1)).join(" | ") + " |";
    const sep = "| " + Array.from({ length: s.cols }, (_, i) => sepMap[s.aligns[i]] || "---").join(" | ") + " |";
    const row = "| " + Array(s.cols).fill(AdminUI.postsT("tableBuilder.sampleCell", {}, "Data")).join(" | ") + " |";
    const md = [header, sep, ...Array(s.rows).fill(row)].join("\n");
    const el = document.getElementById("tbl-md-out");
    if (el) el.textContent = md;
    AdminUI._tblState._md = md;
};

AdminUI._doInsertTable = function() {
    AdminUI._tblBuildMD();
    const md = AdminUI._tblState._md || "";
    if (!md) return;
    AdminUI.insertMarkdown("\n" + md + "\n", "");
    AdminUI._closeModal();
    _showToast(AdminUI.postsT("messages.tableInserted", {}, "Table inserted"), "success");
};

AdminUI._modalInsertImage = function() {
    AdminUI._openModal(`
      <h3>${AdminUI.icon("image", "inline-svg-icon")} ${AdminUI.postsT("insert.imageTitle", {}, "Insert Image")}</h3>
      <div class="modal-field"><label>${AdminUI.postsT("insert.imageUrl", {}, "Image URL")}</label>
        <input type="url" id="mi-img-url" placeholder="https://..."></div>
      <div class="modal-field"><label>${AdminUI.postsT("insert.altText", {}, "Alternative text")}</label>
        <input type="text" id="mi-img-alt" placeholder="${AdminUI.postsT("insert.altPlaceholder", {}, "Image description")}"></div>
      <div class="modal-actions">
        <button class="modal-btn-cancel" onclick="AdminUI._closeModal()">${AdminUI.t("admin.actions.cancel", {}, "Cancel")}</button>
        <button class="modal-btn-primary" onclick="AdminUI._doInsertImage()">${AdminUI.t("admin.actions.add", {}, "Add")}</button>
      </div>`);
};

AdminUI._doInsertImage = function() {
    const url = document.getElementById("mi-img-url")?.value?.trim();
    const alt = document.getElementById("mi-img-alt")?.value?.trim() || AdminUI.postsT("insert.imageDefaultAlt", {}, "Image");
    if (!url) return;
    AdminUI.insertMarkdown(`\n![${alt}](${url})\n`, "");
    AdminUI._closeModal();
};

AdminUI._modalInsertLink = function() {
    const ta = document.getElementById("editor-content");
    const sel = ta ? ta.value.substring(ta.selectionStart, ta.selectionEnd) : "";
    AdminUI._openModal(`
      <h3>${AdminUI.icon("message", "inline-svg-icon")} ${AdminUI.postsT("insert.linkTitle", {}, "Insert Link")}</h3>
      <div class="modal-field"><label>${AdminUI.postsT("insert.linkText", {}, "Link text")}</label>
        <input type="text" id="mi-lnk-text" value="${AdminUI._escape(sel || AdminUI.postsT("insert.linkDefaultText", {}, "Click here"))}"></div>
      <div class="modal-field"><label>${AdminUI.postsT("insert.url", {}, "URL")}</label>
        <input type="url" id="mi-lnk-url" placeholder="https://..."></div>
      <div class="modal-actions">
        <button class="modal-btn-cancel" onclick="AdminUI._closeModal()">${AdminUI.t("admin.actions.cancel", {}, "Cancel")}</button>
        <button class="modal-btn-primary" onclick="AdminUI._doInsertLink()">${AdminUI.t("admin.actions.add", {}, "Add")}</button>
      </div>`);
};

AdminUI._doInsertLink = function() {
    const text = document.getElementById("mi-lnk-text")?.value?.trim() || AdminUI.postsT("insert.linkDefaultText", {}, "Link");
    const url = document.getElementById("mi-lnk-url")?.value?.trim();
    if (!url) return;
    AdminUI.insertMarkdown(`[${text}](${url})`, "");
    AdminUI._closeModal();
};

AdminUI._modalInsertDownload = function() {
    AdminUI._openModal(`
      <h3>${AdminUI.icon("download", "inline-svg-icon")} ${AdminUI.postsT("insert.downloadTitle", {}, "Insert Download Link")}</h3>
      <div class="modal-field"><label>${AdminUI.postsT("insert.fileName", {}, "File name")}</label>
        <input type="text" id="mi-dl-name" placeholder="${AdminUI.postsT("insert.fileNamePlaceholder", {}, "Physics book - chapter one")}"></div>
      <div class="modal-field"><label>${AdminUI.postsT("insert.fileType", {}, "File type (optional)")}</label>
        <select id="mi-dl-type">
          <option value="">${AdminUI.postsT("insert.choose", {}, "-- Choose --")}</option>
          <option>PDF</option><option>Word</option><option>Excel</option>
          <option>PowerPoint</option><option>ZIP</option><option>${AdminUI.postsT("insert.video", {}, "Video")}</option><option>${AdminUI.postsT("insert.audio", {}, "Audio")}</option>
        </select>
      </div>
      <div class="modal-field"><label>${AdminUI.postsT("insert.fileSize", {}, "Size (optional)")}</label>
        <input type="text" id="mi-dl-size" placeholder="${AdminUI.postsT("insert.sizePlaceholder", {}, "Example: 2.4 MB")}"></div>
      <div class="modal-field"><label>${AdminUI.postsT("insert.downloadUrl", {}, "Download URL")}</label>
        <input type="url" id="mi-dl-url" placeholder="https://..."></div>
      <div class="modal-actions">
        <button class="modal-btn-cancel" onclick="AdminUI._closeModal()">${AdminUI.t("admin.actions.cancel", {}, "Cancel")}</button>
        <button class="modal-btn-primary" onclick="AdminUI._doInsertDownload()">${AdminUI.t("admin.actions.add", {}, "Add")}</button>
      </div>`);
};

AdminUI._doInsertDownload = function() {
    const name = document.getElementById("mi-dl-name")?.value?.trim();
    const type = document.getElementById("mi-dl-type")?.value?.trim();
    const size = document.getElementById("mi-dl-size")?.value?.trim();
    const url = document.getElementById("mi-dl-url")?.value?.trim();
    if (!name || !url) {
        _showToast(AdminUI.postsT("messages.downloadRequired", {}, "Please fill at least the file name and link."), "error");
        return;
    }
    const meta = [type, size].filter(Boolean).join("|");
    const token = AdminUI.postsT("download.token", {}, "Download");
    const md = `\n[${token}: ${name}${meta ? "|" + meta : ""}](${url})\n`;
    AdminUI.insertMarkdown(md, "");
    AdminUI._closeModal();
};

AdminUI._quickInsertCode = function() {
    const ta = document.getElementById("editor-content");
    const sel = ta ? ta.value.substring(ta.selectionStart, ta.selectionEnd) : "";
    if (sel) AdminUI.insertMarkdown("```\n", "\n```");
    else AdminUI.insertMarkdown("```python\n", "\n```");
};

AdminUI._quickInsertMath = function() {
    AdminUI.insertMarkdown("$$\n", "\n$$");
};

AdminUI._openModal = function(content, options = {}) {
    AdminUI._closeModal();
    const extraClass = typeof options === "string" ? options : (options.className || "");
    const modalClass = ["insert-modal", extraClass].filter(Boolean).join(" ");
    const overlay = document.createElement("div");
    overlay.className = "insert-modal-overlay";
    overlay.id = "editor-modal-overlay";
    overlay.innerHTML = `<div class="${modalClass}" role="dialog" aria-modal="true">${content}</div>`;
    overlay.addEventListener("click", e => { if (e.target === overlay) AdminUI._closeModal(); });
    document.body.appendChild(overlay);
    overlay.querySelector("input, select, textarea, button")?.focus();
};

AdminUI._closeModal = function() {
    document.getElementById("editor-modal-overlay")?.remove();
};

AdminUI.updatePostPreview = function() {
    const titleInput = document.getElementById("editor-title");
    const contentInput = document.getElementById("editor-content");
    const imageInput = document.getElementById("editor-image-url");
    if (!titleInput || !contentInput) return;

    const titleEl = document.getElementById("preview-title");
    if (titleEl) titleEl.textContent = titleInput.value || this.postsT("editor.titleFallback", {}, "Announcement Title");

    const imgEl = document.getElementById("preview-cover-image");
    if (imgEl) {
        const src = imageInput?.value?.trim();
        imgEl.src = src || "";
        imgEl.style.display = src ? "block" : "none";
    }

    const bodyEl = document.getElementById("preview-body");
    const stateEl = document.getElementById("editor-preview-state");
    if (!bodyEl) return;

    const raw = contentInput.value;
    if (!raw.trim()) {
        bodyEl.innerHTML = `<p class="preview-placeholder">${this.postsT("editor.previewPlaceholder", {}, "Start typing to see the preview here...")}</p>`;
        if (stateEl) stateEl.textContent = this.postsT("editor.empty", {}, "Empty");
        return;
    }

    bodyEl.innerHTML = _processMD(raw);
    if (stateEl) stateEl.textContent = this.postsT("editor.updated", {}, "Updated");
    this.typesetPostMath(bodyEl);
};

AdminUI._updateWordCount = function() {
    const ta = document.getElementById("editor-content");
    const el = document.getElementById("word-count");
    if (!ta || !el) return;
    const words = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
    el.textContent = this.postsT("editor.wordCount", { words, chars: ta.value.length }, `${words} words - ${ta.value.length} characters`);
};

AdminUI.savePost = async function(postId) {
    const title = document.getElementById("editor-title")?.value?.trim();
    const content = document.getElementById("editor-content")?.value?.trim();
    const image = document.getElementById("editor-image-url")?.value?.trim() || null;

    if (!title) {
        _showToast(this.postsT("messages.titleRequired", {}, "Please enter the announcement title."), "error");
        return;
    }
    if (!content) {
        _showToast(this.postsT("messages.contentRequired", {}, "Please enter the announcement content."), "error");
        return;
    }

    const btn = document.getElementById("save-post-btn");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = this.postsT("messages.saving", {}, "Saving...");
    }

    try {
        const session = Auth.getSession();
        const payload = { title, content, image };

        if (postId) {
            await Api.put(`/posts/${postId}`, payload);
            _showToast(this.postsT("messages.updated", {}, "Announcement updated successfully."), "success");
        } else {
            payload.user_id = parseInt(session.user_id, 10);
            await Api.post("/posts/", payload);
            _showToast(this.postsT("messages.published", {}, "Announcement published successfully."), "success");
        }

        AdminUI.clearPostDraft(true);
        setTimeout(() => AdminRole.loadSection("posts"), 900);
    } catch (err) {
        _showToast(this.postsT("messages.saveFailed", { message: err.message }, `Error while saving: ${err.message}`), "error");
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = postId ? this.postsT("actions.saveChanges", {}, "Save Changes") : this.postsT("actions.publish", {}, "Publish Announcement");
        }
    }
};

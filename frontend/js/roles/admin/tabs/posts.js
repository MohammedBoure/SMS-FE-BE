// frontend/js/roles/admin/tabs/posts.js

function _showToast(msg, type = 'success') {
    let t = document.querySelector('.post-toast');
    if (!t) { t = document.createElement('div'); t.className = 'post-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'post-toast ' + type;
    void t.offsetWidth;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
}

function _getFileIcon(ext) {
    const icons = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📑', pptx: '📑', zip: '🗜️', rar: '🗜️', mp4: '🎬', mp3: '🎵', png: '🖼️', jpg: '🖼️', jpeg: '🖼️' };
    return icons[ext?.toLowerCase()] || '📎';
}

function _extractTextSnippet(md, len = 90) {
    return md.replace(/[#*`>\[\]!]/g, '').replace(/\n+/g, ' ').trim().slice(0, len) + (md.length > len ? '…' : '');
}

/**
 * معالجة نصوص Markdown الخاصة بالمشروع:
 * - [تحميل:اسم الملف](رابط) → بطاقة تحميل جميلة
 * - جداول GFM عبر marked.js
 * - رياضيات LaTeX عبر MathJax
 */
function _processMD(raw) {
    if (!raw) return '';

    // استبدال صياغة التحميل المخصصة قبل marked
    // [تحميل: اسم_الملف | نوع | حجم](رابط)
    raw = raw.replace(
        /\[تحميل:\s*([^\]|]+?)(?:\|([^\]|]*?))?(?:\|([^\]]*?))?\]\(([^)]+)\)/g,
        (_, name, type, size, url) => {
            const ext = url.split('.').pop()?.split('?')[0];
            const icon = _getFileIcon(ext);
            const metaParts = [];
            if (type) metaParts.push(type.trim().toUpperCase());
            if (size) metaParts.push(size.trim());
            const meta = metaParts.join(' · ');
            // نستخدم placeholder خاص يحوّله marked إلى HTML آمن
            return `<DLCARD data-url="${url}" data-name="${name.trim()}" data-meta="${meta}" data-icon="${icon}"></DLCARD>`;
        }
    );

    // تفعيل جداول GFM
    const mdOptions = { gfm: true, breaks: true, tables: true };
    let html = (typeof marked !== 'undefined') ? marked.parse(raw, mdOptions) : raw.replace(/\n/g, '<br>');

    // تحويل DLCARD placeholders إلى بطاقات فعلية
    html = html.replace(
        /<p><DLCARD data-url="([^"]*)" data-name="([^"]*)" data-meta="([^"]*)" data-icon="([^"]*)"><\/DLCARD><\/p>/g,
        (_, url, name, meta, icon) => `
        <a href="${url}" target="_blank" class="dl-card" rel="noopener noreferrer">
          <span class="dl-card-icon">${icon}</span>
          <span class="dl-card-info">
            <span class="dl-card-name">${name}</span>
            ${meta ? `<span class="dl-card-meta">${meta}</span>` : ''}
          </span>
          <button class="dl-card-btn" onclick="event.preventDefault();window.open('${url}','_blank')">⬇ تحميل</button>
        </a>`
    );

    // DOMPurify
    if (typeof DOMPurify !== 'undefined') {
        html = DOMPurify.sanitize(html, {
            ADD_TAGS: ['a'],
            ADD_ATTR: ['target', 'rel', 'class', 'data-url', 'data-name'],
            FORCE_BODY: false
        });
    }
    return html;
}

// ═══════════════════════════════════════════════════
//  لوحة عرض المنشورات الرئيسية
// ═══════════════════════════════════════════════════

AdminUI.renderPostsTab = function(response) {
    const main = this.prepareMain("إدارة الإعلانات والمنشورات العامة");
    const posts = (response?.data ?? response ?? []);

    // إحصاءات
    const today = new Date().toDateString();
    const todayCount = posts.filter(p => p.created_at && new Date(p.created_at).toDateString() === today).length;
    const withImage  = posts.filter(p => p.image).length;

    const statsHtml = `
      <div class="posts-stats-row">
        <div class="pstat-card" style="--pstat-color:#064e3b">
          <div class="pstat-num">${posts.length}</div>
          <div class="pstat-lbl">إجمالي الإعلانات</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#3b82f6">
          <div class="pstat-num">${todayCount}</div>
          <div class="pstat-lbl">نُشر اليوم</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#f59e0b">
          <div class="pstat-num">${withImage}</div>
          <div class="pstat-lbl">بصورة غلاف</div>
        </div>
        <div class="pstat-card" style="--pstat-color:#8b5cf6">
          <div class="pstat-num">${posts.length - withImage}</div>
          <div class="pstat-lbl">نصي فقط</div>
        </div>
      </div>`;

    const headerHtml = `
      <div class="posts-header-bar">
        <div>
          <h3>📋 لوحة الإعلانات المدرسية</h3>
          <p>إدارة جميع الإعلانات والمنشورات الموجهة للطلاب والأولياء</p>
        </div>
        <button class="btn-new-post" onclick="AdminUI.showPostEditor()">
          ✍️ كتابة إعلان جديد
        </button>
      </div>`;

    const toolbarHtml = `
      <div class="posts-toolbar">
        <div class="posts-search-wrap">
          <span class="search-icon">🔍</span>
          <input class="posts-search" id="posts-search-input" placeholder="البحث في الإعلانات..." oninput="AdminUI._filterPosts(this.value)">
        </div>
      </div>`;

    let listHtml;
    if (posts.length === 0) {
        listHtml = `
          <div class="posts-empty">
            <div class="empty-icon">📭</div>
            <h4>لا توجد إعلانات منشورة حتى الآن</h4>
            <p>ابدأ بكتابة أول إعلان للمجتمع المدرسي</p>
          </div>`;
    } else {
        const rows = posts.map(p => {
            const pid      = p.post_id ?? p.id;
            const date     = p.created_at ? new Date(p.created_at).toLocaleDateString('ar-DZ', { year:'numeric', month:'short', day:'numeric' }) : '—';
            const excerpt  = _extractTextSnippet(p.content ?? '');
            const postJSON = JSON.stringify(p).replace(/'/g, "&#39;");
            return `
              <tr data-title="${(p.title??'').toLowerCase()}">
                <td data-label="ID"><span class="badge badge-blue">#${pid}</span></td>
                <td data-label="الإعلان">
                  <div class="post-title-cell">
                    ${p.image
                        ? `<img src="${this._escape(p.image)}" class="post-thumb" alt="">`
                        : `<div class="post-thumb-placeholder">📄</div>`}
                    <div>
                      <div class="post-title-text" title="${this._escape(p.title)}">${this._escape(p.title)}</div>
                      <div class="post-excerpt">${this._escape(excerpt)}</div>
                    </div>
                  </div>
                </td>
                <td data-label="الكاتب"><span class="badge badge-green">مستخدم #${p.user_id}</span></td>
                <td data-label="تاريخ النشر"><span style="font-size:.85rem; color:#64748b; direction:ltr; display:inline-block;">${date}</span></td>
                <td data-label="إجراءات">
                  <div class="tbl-actions">
                    <button class="tbl-btn tbl-btn-preview" onclick='AdminUI.previewPost(${postJSON})' title="معاينة">👁 معاينة</button>
                    <button class="tbl-btn tbl-btn-edit"    onclick='AdminUI.showPostEditor(${postJSON})' title="تعديل">✏️ تعديل</button>
                    <button class="tbl-btn tbl-btn-delete"  onclick="AdminRole.deleteItem('/posts',${pid},'posts')" title="حذف">🗑️</button>
                  </div>
                </td>
              </tr>`;
        }).join('');

        listHtml = `
          <div class="posts-table-wrap">
            <table class="posts-table" id="posts-table">
              <thead>
                <tr>
                  <th style="width:60px">ID</th>
                  <th>عنوان الإعلان</th>
                  <th style="width:130px">الكاتب</th>
                  <th style="width:130px">تاريخ النشر</th>
                  <th style="width:200px; text-align:left">إجراءات</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`;
    }

    main.innerHTML = `<div class="posts-dashboard">${headerHtml}${statsHtml}${toolbarHtml}${listHtml}</div>`;
};

/* فلترة بحث سريع */
AdminUI._filterPosts = function(query) {
    const rows = document.querySelectorAll('#posts-table tbody tr');
    const q = query.toLowerCase();
    rows.forEach(r => {
        r.style.display = r.dataset.title?.includes(q) ? '' : 'none';
    });
};

// ═══════════════════════════════════════════════════
//  معاينة منشور موجود
// ═══════════════════════════════════════════════════
AdminUI.previewPost = function(post) {
    const overlay = document.createElement('div');
    overlay.className = 'post-full-preview';
    const html = _processMD(post.content ?? '');
    overlay.innerHTML = `
      <div class="post-full-preview-inner">
        <div class="preview-modal-header">
          <h4>معاينة الإعلان</h4>
          <button class="preview-modal-close" onclick="this.closest('.post-full-preview').remove()">✕</button>
        </div>
        <div class="preview-modal-body">
          ${post.image ? `<img src="${this._escape(post.image)}" style="width:100%;max-height:220px;object-fit:cover;border-radius:10px;margin-bottom:20px">` : ''}
          <div class="preview-title">${this._escape(post.title ?? '')}</div>
          <div class="md-body">${html}</div>
        </div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        MathJax.typesetPromise([overlay]).catch(() => {});
    }
};

// ═══════════════════════════════════════════════════
//  محرر المنشورات — الواجهة الكاملة
// ═══════════════════════════════════════════════════

AdminUI.showPostEditor = function(post = null) {
    const main   = document.getElementById('admin-main');
    const isEdit = !!post;
    const postId = post ? (post.post_id ?? post.id) : null;

    const titleVal = post ? this._escape(post.title) : '';
    const imageVal = post?.image ? this._escape(post.image) : '';

    // أدوات شريط التنسيق
    const toolbarBtns = [
        // عناوين
        { group: 'headings', items: [
            { label: 'H1', code: '# ', end: '' },
            { label: 'H2', code: '## ', end: '' },
            { label: 'H3', code: '### ', end: '' },
        ]},
        { sep: true },
        // تنسيق نص
        { group: 'format', items: [
            { label: '<b>B</b>', code: '**', end: '**', title: 'عريض' },
            { label: '<i>I</i>', code: '*', end: '*', title: 'مائل' },
            { label: '<s>S</s>', code: '~~', end: '~~', title: 'مشطوب' },
            { label: '`C`',     code: '`', end: '`', title: 'كود مضمّن' },
        ]},
        { sep: true },
        // هيكل
        { group: 'structure', items: [
            { label: '☰ قائمة', code: '- ', end: '' },
            { label: '① مرقّمة', code: '1. ', end: '' },
            { label: '❝ اقتباس', code: '> ', end: '' },
            { label: '▬ فاصل',  code: '\n---\n', end: '' },
        ]},
        { sep: true },
        // متقدم
        { group: 'advanced', items: [
            { label: '⊞ جدول',   action: 'insertTable',    title: 'إدراج جدول' },
            { label: '🖼 صورة',   action: 'insertImage',    title: 'إدراج صورة' },
            { label: '🔗 رابط',   action: 'insertLink',     title: 'إدراج رابط' },
            { label: '⬇ تحميل',  action: 'insertDownload', title: 'رابط تحميل' },
            { label: '```كود```',  action: 'insertCode',     title: 'كتلة كود' },
            { label: '∑ رياضيات', action: 'insertMath',     title: 'معادلة رياضية' },
        ]},
    ];

    let tbHtml = '';
    for (const group of toolbarBtns) {
        if (group.sep) { tbHtml += '<div class="tb-sep"></div>'; continue; }
        tbHtml += `<div class="tb-group">`;
        for (const btn of group.items) {
            if (btn.action) {
                tbHtml += `<button type="button" class="tb-btn" onclick="AdminUI._editorAction('${btn.action}')" title="${btn.title ?? ''}"><span class="tb-btn-label">${btn.label}</span></button>`;
            } else {
                const escapedCode = btn.code.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                const escapedEnd  = btn.end.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                tbHtml += `<button type="button" class="tb-btn" onclick="AdminUI.insertMarkdown('${escapedCode}','${escapedEnd}')" title="${btn.title ?? btn.label}"><span style="font-weight:600;">${btn.label}</span></button>`;
            }
        }
        tbHtml += `</div>`;
    }

    const savedMode = localStorage.getItem('admin-post-editor-mode') || 'split';

    main.innerHTML = `
      <div class="post-editor-page" data-editor-mode="${savedMode}">

        <div class="editor-topbar">
          <div class="editor-title-block">
            <span class="editor-kicker">${isEdit ? 'تعديل منشور' : 'منشور جديد'}</span>
            <h2>${isEdit ? 'تعديل الإعلان' : 'كتابة إعلان جديد'}</h2>
          </div>
          <div class="editor-topbar-actions">
            <div class="editor-mode-switch" role="group" aria-label="طريقة العرض">
              <button type="button" class="editor-mode-btn" data-mode="write" onclick="AdminUI.setPostEditorMode('write')">كتابة</button>
              <button type="button" class="editor-mode-btn" data-mode="split" onclick="AdminUI.setPostEditorMode('split')">تقسيم</button>
              <button type="button" class="editor-mode-btn" data-mode="preview" onclick="AdminUI.setPostEditorMode('preview')">معاينة</button>
            </div>
            <button class="btn-secondary editor-fullscreen-btn" onclick="AdminUI.togglePostEditorFullscreen()" title="ملء الشاشة">⛶</button>
            <button class="btn-secondary" onclick="AdminRole.loadSection('posts')">← العودة للقائمة</button>
          </div>
        </div>

        <div class="editor-draft-banner" id="editor-draft-banner" hidden>
          <span>توجد مسودة محفوظة لهذا الإعلان.</span>
          <div>
            <button type="button" onclick="AdminUI.restorePostDraft()">استعادة</button>
            <button type="button" onclick="AdminUI.clearPostDraft()">تجاهل</button>
          </div>
        </div>

        <div class="editor-meta-row">
          <label class="editor-field editor-field-title">
            <span>عنوان الإعلان</span>
            <input type="text" id="editor-title" class="editor-input editor-input-title"
                   placeholder="اكتب عنوانا واضحا..." value="${titleVal}"
                   oninput="AdminUI.updatePostPreview()">
          </label>
          <label class="editor-field">
            <span>صورة الغلاف</span>
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
              <span>المحرر</span>
              <span id="editor-cursor-info">سطر 1 · عمود 1</span>
            </div>
            <textarea id="editor-content" class="editor-textarea"
              placeholder="اكتب محتوى الإعلان هنا..."
              spellcheck="true"
              oninput="AdminUI.updatePostPreview(); AdminUI._updateWordCount()"></textarea>
          </div>

          <div class="editor-pane editor-preview-pane">
            <div class="editor-pane-label">
              <span>المعاينة المباشرة</span>
              <span id="editor-preview-state">جاهزة</span>
            </div>
            <div class="preview-inner">
              <img id="preview-cover-image" class="preview-cover" alt="غلاف">
              <div class="preview-title" id="preview-title">عنوان الإعلان</div>
              <div class="md-body" id="preview-body">
                <p class="preview-placeholder">ابدأ الكتابة لرؤية المعاينة هنا...</p>
              </div>
            </div>
          </div>
        </div>

        <div class="editor-footer">
          <div class="editor-footer-meta">
            <span class="editor-word-count" id="word-count">0 كلمة</span>
            <span class="editor-draft-status" id="editor-draft-status">جاهز</span>
          </div>
          <div class="editor-footer-actions">
            <button class="btn-secondary" onclick="AdminRole.loadSection('posts')">إلغاء</button>
            <button class="btn-save" id="save-post-btn" onclick="AdminUI.savePost(${postId})">
              ${isEdit ? 'حفظ التعديلات' : 'نشر الإعلان'}
            </button>
          </div>
        </div>

      </div>`;

    requestAnimationFrame(() => {
        const ta = document.getElementById('editor-content');
        if (ta && isEdit) ta.value = post.content ?? '';
        AdminUI.initPostEditorControls(postId);
        AdminUI.setPostEditorMode(savedMode);
        AdminUI.updatePostPreview();
        AdminUI._updateWordCount();
        AdminUI.updateEditorCursorInfo();
    });
};

AdminUI.initPostEditorControls = function(postId) {
    const page = document.querySelector('.post-editor-page');
    const titleInput = document.getElementById('editor-title');
    const imageInput = document.getElementById('editor-image-url');
    const textArea = document.getElementById('editor-content');
    if (!page || !titleInput || !imageInput || !textArea) return;

    page.dataset.draftKey = AdminUI.getPostDraftKey(postId);
    page.dataset.postId = postId ?? '';

    const draft = AdminUI.readPostDraft();
    const hasDraft = draft && [draft.title, draft.image, draft.content].some(value => String(value || '').trim());
    const differsFromCurrent = hasDraft && (
        draft.title !== titleInput.value ||
        draft.image !== imageInput.value ||
        draft.content !== textArea.value
    );
    const banner = document.getElementById('editor-draft-banner');
    if (banner) banner.hidden = !differsFromCurrent;

    const scheduleDraft = () => {
        AdminUI.updateEditorCursorInfo();
        const status = document.getElementById('editor-draft-status');
        if (status) status.textContent = 'تغييرات غير محفوظة';
        clearTimeout(AdminUI._postDraftTimer);
        AdminUI._postDraftTimer = setTimeout(() => AdminUI.savePostDraft(), 450);
    };

    [titleInput, imageInput, textArea].forEach(el => {
        el.addEventListener('input', scheduleDraft);
    });

    textArea.addEventListener('keydown', (event) => AdminUI.handlePostEditorKeydown(event, postId));
    textArea.addEventListener('keyup', () => AdminUI.updateEditorCursorInfo());
    textArea.addEventListener('click', () => AdminUI.updateEditorCursorInfo());
    textArea.addEventListener('select', () => AdminUI.updateEditorCursorInfo());
};

AdminUI.getPostDraftKey = function(postId) {
    return `admin-post-editor-draft-${postId ?? 'new'}`;
};

AdminUI.readPostDraft = function() {
    const page = document.querySelector('.post-editor-page');
    const key = page?.dataset?.draftKey;
    if (!key) return null;
    try {
        return JSON.parse(localStorage.getItem(key) || 'null');
    } catch (err) {
        return null;
    }
};

AdminUI.savePostDraft = function() {
    const page = document.querySelector('.post-editor-page');
    const key = page?.dataset?.draftKey;
    if (!key) return;

    const draft = {
        title: document.getElementById('editor-title')?.value || '',
        image: document.getElementById('editor-image-url')?.value || '',
        content: document.getElementById('editor-content')?.value || '',
        updatedAt: new Date().toISOString()
    };

    try {
        localStorage.setItem(key, JSON.stringify(draft));
        const status = document.getElementById('editor-draft-status');
        if (status) status.textContent = 'تم حفظ المسودة';
    } catch (err) {
        const status = document.getElementById('editor-draft-status');
        if (status) status.textContent = 'تعذر حفظ المسودة';
    }
};

AdminUI.restorePostDraft = function() {
    const draft = AdminUI.readPostDraft();
    if (!draft) return;

    const titleInput = document.getElementById('editor-title');
    const imageInput = document.getElementById('editor-image-url');
    const textArea = document.getElementById('editor-content');

    if (titleInput) titleInput.value = draft.title || '';
    if (imageInput) imageInput.value = draft.image || '';
    if (textArea) textArea.value = draft.content || '';

    const banner = document.getElementById('editor-draft-banner');
    if (banner) banner.hidden = true;
    AdminUI.updatePostPreview();
    AdminUI._updateWordCount();
    AdminUI.updateEditorCursorInfo();
    AdminUI.savePostDraft();
};

AdminUI.clearPostDraft = function(silent = false) {
    const page = document.querySelector('.post-editor-page');
    const key = page?.dataset?.draftKey;
    if (key) localStorage.removeItem(key);
    const banner = document.getElementById('editor-draft-banner');
    if (banner) banner.hidden = true;
    const status = document.getElementById('editor-draft-status');
    if (status) status.textContent = 'جاهز';
    if (!silent) _showToast('تم تجاهل المسودة', 'success');
};

AdminUI.handlePostEditorKeydown = function(event, postId) {
    const key = event.key.toLowerCase();
    const isMod = event.ctrlKey || event.metaKey;

    if (event.key === 'Enter' && AdminUI.continueEditorList()) {
        event.preventDefault();
        return;
    }

    if (event.key === 'Tab') {
        event.preventDefault();
        AdminUI.indentEditorSelection(event.shiftKey);
        return;
    }

    if (!isMod) return;

    if (key === 'b') {
        event.preventDefault();
        AdminUI.insertMarkdown('**', '**');
    } else if (key === 'i') {
        event.preventDefault();
        AdminUI.insertMarkdown('*', '*');
    } else if (key === 'k') {
        event.preventDefault();
        AdminUI._modalInsertLink();
    } else if (key === 's') {
        event.preventDefault();
        AdminUI.savePost(postId);
    }
};

AdminUI.continueEditorList = function() {
    const ta = document.getElementById('editor-content');
    if (!ta || ta.selectionStart !== ta.selectionEnd) return false;

    const start = ta.selectionStart;
    const value = ta.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
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

    const nextMarker = /^\d+\.$/.test(marker)
        ? `${parseInt(marker, 10) + 1}.`
        : marker;
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
    const ta = document.getElementById('editor-content');
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = ta.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const selected = value.slice(lineStart, end);
    const lines = selected.split('\n');
    const indent = '    ';
    const nextLines = lines.map(line => {
        if (!outdent) return indent + line;
        return line.startsWith(indent) ? line.slice(indent.length) : line.replace(/^\s{1,3}/, '');
    });
    const next = nextLines.join('\n');

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
    const page = document.querySelector('.post-editor-page');
    if (!page) return;

    const nextMode = ['write', 'split', 'preview'].includes(mode) ? mode : 'split';
    page.dataset.editorMode = nextMode;
    localStorage.setItem('admin-post-editor-mode', nextMode);

    document.querySelectorAll('.editor-mode-btn').forEach(btn => {
        const isActive = btn.dataset.mode === nextMode;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
};

AdminUI.togglePostEditorFullscreen = function() {
    const page = document.querySelector('.post-editor-page');
    if (!page) return;
    const isFullscreen = page.classList.toggle('editor-fullscreen');
    document.body.classList.toggle('post-editor-fullscreen', isFullscreen);
};

AdminUI.updateEditorCursorInfo = function() {
    const ta = document.getElementById('editor-content');
    const info = document.getElementById('editor-cursor-info');
    if (!ta || !info) return;

    const before = ta.value.slice(0, ta.selectionStart);
    const lines = before.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    info.textContent = `سطر ${line} · عمود ${column}`;
};

// ═══════════════════════════════════════════════════
//  إدراج Markdown في موضع المؤشر
// ═══════════════════════════════════════════════════
AdminUI.insertMarkdown = function(startTag, endTag) {
    const ta = document.getElementById('editor-content');
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.substring(s, e);
    ta.value = ta.value.substring(0, s) + startTag + sel + endTag + ta.value.substring(e);
    ta.focus();
    const innerStart = s + startTag.length;
    const innerEnd = innerStart + sel.length;
    if (endTag) ta.setSelectionRange(innerStart, innerEnd);
    else ta.setSelectionRange(innerEnd, innerEnd);
    AdminUI.updatePostPreview();
    AdminUI._updateWordCount();
    AdminUI.updateEditorCursorInfo();
    AdminUI.savePostDraft();
};

// ═══════════════════════════════════════════════════
//  إجراءات شريط الأدوات المتقدمة
// ═══════════════════════════════════════════════════
AdminUI._editorAction = function(action) {
    const actions = {
        insertTable:    AdminUI._modalInsertTable.bind(AdminUI),
        insertImage:    AdminUI._modalInsertImage.bind(AdminUI),
        insertLink:     AdminUI._modalInsertLink.bind(AdminUI),
        insertDownload: AdminUI._modalInsertDownload.bind(AdminUI),
        insertCode:     AdminUI._quickInsertCode.bind(AdminUI),
        insertMath:     AdminUI._quickInsertMath.bind(AdminUI),
    };
    actions[action]?.();
};

/* ══════════════════════════════════════════════════════
   منشئ الجداول — تفاعلي بالكامل
══════════════════════════════════════════════════════ */
AdminUI._tblState = { cols: 3, rows: 3, aligns: ['right','right','right'], headers: ['العنوان الأول','العنوان الثاني','العنوان الثالث'] };

AdminUI._modalInsertTable = function() {
    const s = AdminUI._tblState;
    AdminUI._openModal(`
      <div class="modal-header">
        <h3>⊞ منشئ الجداول</h3>
        <button class="modal-close-btn" onclick="AdminUI._closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="tbl-builder-grid">
          <div>
            <div class="tbl-ctrl-row">
              <label>الأعمدة</label>
              <input type="range" min="2" max="7" value="${s.cols}" id="tbl-col-slider" oninput="AdminUI._tblUpdate()">
              <span id="tbl-col-val">${s.cols}</span>
            </div>
            <div class="tbl-ctrl-row">
              <label>الصفوف</label>
              <input type="range" min="1" max="10" value="${s.rows}" id="tbl-row-slider" oninput="AdminUI._tblUpdate()">
              <span id="tbl-row-val">${s.rows}</span>
            </div>
            <div style="font-size:.78rem;font-weight:600;color:#475569;margin-bottom:6px;">محاذاة الأعمدة</div>
            <div class="tbl-align-row" id="tbl-align-row"></div>
            <div style="font-size:.78rem;font-weight:600;color:#475569;margin-bottom:6px;">كود Markdown</div>
            <div class="tbl-md-preview" id="tbl-md-out"></div>
          </div>
          <div>
            <div style="font-size:.78rem;font-weight:600;color:#475569;margin-bottom:6px;">معاينة — عدّل العناوين مباشرة</div>
            <div class="tbl-mini-preview" id="tbl-mini-preview"></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-btn-cancel" onclick="AdminUI._closeModal()">إلغاء</button>
        <button class="modal-btn-primary" onclick="AdminUI._doInsertTable()">إدراج في المحرر ↵</button>
      </div>`, false);
    AdminUI._tblUpdate();
};

AdminUI._tblUpdate = function() {
    const s = AdminUI._tblState;
    s.cols = parseInt(document.getElementById('tbl-col-slider')?.value) || 3;
    s.rows = parseInt(document.getElementById('tbl-row-slider')?.value) || 3;
    document.getElementById('tbl-col-val').textContent = s.cols;
    document.getElementById('tbl-row-val').textContent = s.rows;
    while (s.aligns.length  < s.cols) s.aligns.push('right');
    while (s.headers.length < s.cols) s.headers.push(`العنوان ${s.headers.length + 1}`);

    // أزرار المحاذاة
    const alignRow = document.getElementById('tbl-align-row');
    alignRow.innerHTML = '';
    for (let c = 0; c < s.cols; c++) {
        const g = document.createElement('div');
        g.className = 'tbl-col-align';
        g.innerHTML = `<span>${c+1}</span><div>
          ${['right','center','left'].map(a =>
            `<button class="tbl-align-btn${s.aligns[c]===a?' sel':''}" onclick="AdminUI._tblSetAlign(${c},'${a}')" title="${a==='right'?'يمين':a==='center'?'وسط':'يسار'}">${a==='right'?'⇒':a==='center'?'⇔':'⇐'}</button>`
          ).join('')}</div>`;
        alignRow.appendChild(g);
    }

    // معاينة الجدول المصغّر
    const preview = document.getElementById('tbl-mini-preview');
    let ths = '';
    for (let c = 0; c < s.cols; c++) {
        ths += `<th style="text-align:${s.aligns[c]}"><input value="${s.headers[c]||''}" placeholder="عنوان" onchange="AdminUI._tblState.headers[${c}]=this.value;AdminUI._tblBuildMD()" style="text-align:${s.aligns[c]}"></th>`;
    }
    let trs = '';
    for (let r = 0; r < s.rows; r++) {
        let tds = '';
        for (let c = 0; c < s.cols; c++) tds += `<td style="text-align:${s.aligns[c]}">—</td>`;
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
    const sepMap = { right: '---', center: ':---:', left: ':---' };
    const header = '| ' + Array.from({length: s.cols}, (_, i) => s.headers[i] || `العنوان ${i+1}`).join(' | ') + ' |';
    const sep    = '| ' + Array.from({length: s.cols}, (_, i) => sepMap[s.aligns[i]] || '---').join(' | ') + ' |';
    const row    = '| ' + Array(s.cols).fill('بيانات').join(' | ') + ' |';
    const md = [header, sep, ...Array(s.rows).fill(row)].join('\n');
    const el = document.getElementById('tbl-md-out');
    if (el) el.textContent = md;
    AdminUI._tblState._md = md;
};

AdminUI._doInsertTable = function() {
    AdminUI._tblBuildMD();
    const md = AdminUI._tblState._md || '';
    if (!md) return;
    AdminUI.insertMarkdown('\n' + md + '\n', '');
    AdminUI._closeModal();
    _showToast('✅ تم إدراج الجدول', 'success');
};

/* ─── إدراج صورة ─── */
AdminUI._modalInsertImage = function() {
    AdminUI._openModal(`
      <h3>🖼 إدراج صورة</h3>
      <div class="modal-field"><label>رابط الصورة</label>
        <input type="url" id="mi-img-url" placeholder="https://..."></div>
      <div class="modal-field"><label>نص بديل</label>
        <input type="text" id="mi-img-alt" placeholder="وصف الصورة"></div>
      <div class="modal-actions">
        <button class="modal-btn-cancel" onclick="AdminUI._closeModal()">إلغاء</button>
        <button class="modal-btn-primary" onclick="AdminUI._doInsertImage()">إدراج</button>
      </div>`);
};
AdminUI._doInsertImage = function() {
    const url = document.getElementById('mi-img-url')?.value?.trim();
    const alt = document.getElementById('mi-img-alt')?.value?.trim() || 'صورة';
    if (!url) return;
    AdminUI.insertMarkdown(`\n![${alt}](${url})\n`, '');
    AdminUI._closeModal();
};

/* ─── إدراج رابط ─── */
AdminUI._modalInsertLink = function() {
    const ta  = document.getElementById('editor-content');
    const sel = ta ? ta.value.substring(ta.selectionStart, ta.selectionEnd) : '';
    AdminUI._openModal(`
      <h3>🔗 إدراج رابط</h3>
      <div class="modal-field"><label>نص الرابط</label>
        <input type="text" id="mi-lnk-text" value="${sel || 'اضغط هنا'}"></div>
      <div class="modal-field"><label>عنوان URL</label>
        <input type="url" id="mi-lnk-url" placeholder="https://..."></div>
      <div class="modal-actions">
        <button class="modal-btn-cancel" onclick="AdminUI._closeModal()">إلغاء</button>
        <button class="modal-btn-primary" onclick="AdminUI._doInsertLink()">إدراج</button>
      </div>`);
};
AdminUI._doInsertLink = function() {
    const text = document.getElementById('mi-lnk-text')?.value?.trim() || 'رابط';
    const url  = document.getElementById('mi-lnk-url')?.value?.trim();
    if (!url) return;
    AdminUI.insertMarkdown(`[${text}](${url})`, '');
    AdminUI._closeModal();
};

/* ─── إدراج رابط تحميل ─── */
AdminUI._modalInsertDownload = function() {
    AdminUI._openModal(`
      <h3>⬇ إدراج رابط تحميل</h3>
      <div class="modal-field"><label>اسم الملف</label>
        <input type="text" id="mi-dl-name" placeholder="كتاب الفيزياء — الفصل الأول"></div>
      <div class="modal-field"><label>نوع الملف (اختياري)</label>
        <select id="mi-dl-type">
          <option value="">— اختر —</option>
          <option>PDF</option><option>Word</option><option>Excel</option>
          <option>PowerPoint</option><option>ZIP</option><option>فيديو</option><option>صوت</option>
        </select>
      </div>
      <div class="modal-field"><label>الحجم (اختياري)</label>
        <input type="text" id="mi-dl-size" placeholder="مثال: 2.4 MB"></div>
      <div class="modal-field"><label>رابط التحميل</label>
        <input type="url" id="mi-dl-url" placeholder="https://..."></div>
      <div class="modal-actions">
        <button class="modal-btn-cancel" onclick="AdminUI._closeModal()">إلغاء</button>
        <button class="modal-btn-primary" onclick="AdminUI._doInsertDownload()">إدراج</button>
      </div>`);
};
AdminUI._doInsertDownload = function() {
    const name = document.getElementById('mi-dl-name')?.value?.trim();
    const type = document.getElementById('mi-dl-type')?.value?.trim();
    const size = document.getElementById('mi-dl-size')?.value?.trim();
    const url  = document.getElementById('mi-dl-url')?.value?.trim();
    if (!name || !url) { _showToast('يرجى ملء اسم الملف والرابط على الأقل', 'error'); return; }
    const meta = [type, size].filter(Boolean).join('|');
    const md = `\n[تحميل: ${name}${meta ? '|'+meta : ''}](${url})\n`;
    AdminUI.insertMarkdown(md, '');
    AdminUI._closeModal();
};

/* ─── إدراج سريع: كتلة كود ─── */
AdminUI._quickInsertCode = function() {
    const ta = document.getElementById('editor-content');
    const sel = ta ? ta.value.substring(ta.selectionStart, ta.selectionEnd) : '';
    if (sel) { AdminUI.insertMarkdown('```\n', '\n```'); }
    else      { AdminUI.insertMarkdown('```python\n', '\n```'); }
};

/* ─── إدراج سريع: معادلة رياضية ─── */
AdminUI._quickInsertMath = function() {
    const ta = document.getElementById('editor-content');
    const sel = ta ? ta.value.substring(ta.selectionStart, ta.selectionEnd) : '';
    if (sel) { AdminUI.insertMarkdown('$$\n', '\n$$'); }
    else      { AdminUI.insertMarkdown('$$\n', '\n$$'); }
};

/* ─── إدارة المودال ─── */
AdminUI._openModal = function(content) {
    AdminUI._closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'insert-modal-overlay';
    overlay.id = 'editor-modal-overlay';
    overlay.innerHTML = `<div class="insert-modal">${content}</div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) AdminUI._closeModal(); });
    document.body.appendChild(overlay);
    overlay.querySelector('input, select')?.focus();
};
AdminUI._closeModal = function() {
    document.getElementById('editor-modal-overlay')?.remove();
};

// ═══════════════════════════════════════════════════
//  تحديث المعاينة المباشرة
// ═══════════════════════════════════════════════════
AdminUI.updatePostPreview = function() {
    const titleInput   = document.getElementById('editor-title');
    const contentInput = document.getElementById('editor-content');
    const imageInput   = document.getElementById('editor-image-url');

    if (!titleInput || !contentInput) return;

    // العنوان
    const titleEl = document.getElementById('preview-title');
    if (titleEl) titleEl.textContent = titleInput.value || 'عنوان الإعلان';

    // الصورة
    const imgEl = document.getElementById('preview-cover-image');
    if (imgEl) {
        const src = imageInput?.value?.trim();
        imgEl.src     = src || '';
        imgEl.style.display = src ? 'block' : 'none';
    }

    // المحتوى
    const bodyEl = document.getElementById('preview-body');
    const stateEl = document.getElementById('editor-preview-state');
    if (!bodyEl) return;

    const raw = contentInput.value;
    if (!raw.trim()) {
        bodyEl.innerHTML = '<p class="preview-placeholder">ابدأ الكتابة لرؤية المعاينة هنا...</p>';
        if (stateEl) stateEl.textContent = 'فارغة';
        return;
    }

    bodyEl.innerHTML = _processMD(raw);
    if (stateEl) stateEl.textContent = 'محدثة';

    // MathJax
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        MathJax.typesetPromise([bodyEl]).catch(() => {});
    }
};

/* عداد الكلمات */
AdminUI._updateWordCount = function() {
    const ta = document.getElementById('editor-content');
    const el = document.getElementById('word-count');
    if (!ta || !el) return;
    const words = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
    el.textContent = `${words} كلمة · ${ta.value.length} حرف`;
};

// ═══════════════════════════════════════════════════
//  حفظ المنشور
// ═══════════════════════════════════════════════════
AdminUI.savePost = async function(postId) {
    const title   = document.getElementById('editor-title')?.value?.trim();
    const content = document.getElementById('editor-content')?.value?.trim();
    const image   = document.getElementById('editor-image-url')?.value?.trim() || null;

    if (!title)   { _showToast('يرجى إدخال عنوان الإعلان', 'error'); return; }
    if (!content) { _showToast('يرجى إدخال محتوى الإعلان', 'error'); return; }

    const btn = document.getElementById('save-post-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '⏳ جاري الحفظ...'; }

    try {
        const session = Auth.getSession();
        const payload = { title, content, image };

        if (postId) {
            await Api.put(`/posts/${postId}`, payload);
            _showToast('✅ تم تحديث الإعلان بنجاح', 'success');
        } else {
            payload.user_id = parseInt(session.user_id);
            await Api.post('/posts/', payload);
            _showToast('🚀 تم نشر الإعلان بنجاح', 'success');
        }

        AdminUI.clearPostDraft(true);
        setTimeout(() => AdminRole.loadSection('posts'), 900);

    } catch (err) {
        _showToast('❌ خطأ أثناء الحفظ: ' + err.message, 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = postId ? '💾 حفظ التعديلات' : '🚀 نشر الإعلان'; }
    }
};

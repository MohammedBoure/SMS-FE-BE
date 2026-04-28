// frontend/js/roles/admin/tabs/posts.js

/**
 * واجهة إدارة الإعلانات والمنشورات العامة
 * تتيح للمدير عرض، إضافة، تعديل، وحذف المنشورات باستخدام محرر Markdown متقدم
 */
AdminUI.renderPostsTab = function(response) {
    const main = this.prepareMain("إدارة الإعلانات والمنشورات العامة");
    const posts = response.data || response || [];

    // 1. شريط الأدوات العُلوي
    const headerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #3b82f6;">
            <div>
                <h3 style="margin: 0; color: #1e40af;">لوحة الإعلانات المدرسية</h3>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 0.9em;">إجمالي الإعلانات المنشورة: <strong>${posts.length}</strong></p>
            </div>
            <button onclick="AdminUI.showPostEditor()" style="background: #3b82f6; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <span>✍️</span> كتابة إعلان جديد
            </button>
        </div>
    `;

    // 2. بناء جدول المنشورات
    let tableHtml = "";
    if (posts.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="font-size: 3em;">📰</span>
                <p style="color: #64748b; margin-top: 15px; font-size: 1.1em;">لا توجد إعلانات منشورة حالياً.</p>
            </div>
        `;
    } else {
        const rows = posts.map(p => `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #0f172a;">#${p.post_id || p.id}</td>
                <td style="padding: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${p.image ? `<img src="${this._escape(p.image)}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid #cbd5e1;">` : `<div style="width: 40px; height: 40px; border-radius: 6px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 1.2em;">📄</div>`}
                        <div>
                            <div style="font-weight: bold; color: #0f172a; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this._escape(p.title)}</div>
                        </div>
                    </div>
                </td>
                <td style="padding: 15px; color: #64748b; font-size: 0.9em;">
                    بواسطة: مستخدم #${p.user_id}
                </td>
                <td style="padding: 15px; direction: ltr; text-align: right; color: #475569;">
                    ${p.created_at ? new Date(p.created_at).toLocaleDateString('ar-DZ') : '-'}
                </td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 5px; justify-content: flex-end;">
                    <button onclick='AdminUI.showPostEditor(${JSON.stringify(p).replace(/'/g, "&#39;")})' title="تعديل الإعلان" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 6px 10px; border-radius: 4px; cursor: pointer;">✏️ تعديل</button>
                    <button onclick="AdminRole.deleteItem('/posts', ${p.post_id || p.id}, 'posts')" title="حذف الإعلان" style="background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; padding: 6px 10px; border-radius: 4px; cursor: pointer;">🗑️ حذف</button>
                </td>
            </tr>
        `).join("");

        tableHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px;">ID</th>
                            <th style="padding: 15px;">عنوان الإعلان</th>
                            <th style="padding: 15px;">الكاتب</th>
                            <th style="padding: 15px;">تاريخ النشر</th>
                            <th style="padding: 15px; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    main.innerHTML = headerHtml + tableHtml;
};

/**
 * فتح محرر النصوص المتقدم (Markdown + LaTeX)
 * إذا تم تمرير كائن post، يتم فتح المحرر في وضع "التعديل"
 */
AdminUI.showPostEditor = function(post = null) {
    const main = document.getElementById("admin-main");
    const isEdit = !!post;
    const postId = post ? (post.post_id || post.id) : null;
    
    // تأمين النصوص للـ HTML
    const titleVal = post ? this._escape(post.title) : '';
    const contentVal = post ? this._escape(post.content) : '';
    const imageVal = post && post.image ? this._escape(post.image) : '';

    main.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #0f172a;">${isEdit ? '✏️ تعديل الإعلان' : '✍️ كتابة إعلان جديد'}</h2>
            <button onclick="AdminRole.loadSection('posts')" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                ❌ إلغاء والعودة
            </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: calc(100vh - 200px); min-height: 500px;">
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column;">
                <input type="text" id="editor-title" placeholder="عنوان الإعلان المثير للاهتمام..." value="${titleVal}" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1.1em; font-weight: bold; box-sizing: border-box; outline: none;">
                
                <input type="url" id="editor-image-url" placeholder="رابط صورة غلاف الإعلان (اختياري)..." value="${imageVal}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; outline: none;" oninput="AdminUI.updatePostPreview()">

                <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
                    <button type="button" onclick="AdminUI.insertMarkdown('# ', '')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer;">H1</button>
                    <button type="button" onclick="AdminUI.insertMarkdown('## ', '')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer;">H2</button>
                    <button type="button" onclick="AdminUI.insertMarkdown('**', '**')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">B</button>
                    <button type="button" onclick="AdminUI.insertMarkdown('*', '*')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-style: italic;">I</button>
                    <button type="button" onclick="AdminUI.insertMarkdown('- ', '')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer;">قائمة</button>
                    <button type="button" onclick="AdminUI.insertMarkdown('> ', '')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer;">اقتباس</button>
                    <button type="button" onclick="AdminUI.insertMarkdown('![صورة](', ')')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer;">صورة 🖼️</button>
                    <button type="button" onclick="AdminUI.insertMarkdown('$$', '$$')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer;">رياضيات ∑</button>
                </div>

                <textarea id="editor-content" placeholder="اكتب محتوى الإعلان هنا... يدعم Markdown و LaTeX ($...$)" style="flex: 1; width: 100%; padding: 15px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; resize: none; font-family: monospace; outline: none; line-height: 1.6;" oninput="AdminUI.updatePostPreview()"></textarea>

                <div style="margin-top: 15px; text-align: left;">
                    <button onclick="AdminUI.savePost(${postId})" id="save-post-btn" style="background: #064e3b; color: white; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1.05em;">
                        ${isEdit ? 'حفظ التعديلات 💾' : 'نشر الإعلان 🚀'}
                    </button>
                </div>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; overflow-y: auto; display: flex; flex-direction: column;">
                <div style="color: #64748b; font-size: 0.85em; text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 5px;">المعاينة المباشرة</div>
                <img id="preview-cover-image" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; display: none;">
                <h1 id="preview-title" style="color: #0f172a; margin-top: 0;"></h1>
                <div id="preview-body" class="markdown-body" style="line-height: 1.7; color: #334155; overflow-wrap: break-word;"></div>
            </div>

        </div>
    `;

    // تعبئة المحتوى الأولي في المعاينة عند فتح وضع التعديل
    if (isEdit) {
        // نستخدم setTimeout لضمان تحميل الـ DOM أولاً
        setTimeout(() => {
            document.getElementById("editor-content").value = post.content;
            AdminUI.updatePostPreview();
        }, 50);
    }
};

/**
 * دالة إدراج وسوم Markdown في مكان المؤشر
 */
AdminUI.insertMarkdown = function(startTag, endTag) {
    const textarea = document.getElementById('editor-content');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    textarea.value = text.substring(0, start) + startTag + selected + endTag + text.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + startTag.length + selected.length;
    
    AdminUI.updatePostPreview();
};

/**
 * تحديث المعاينة المباشرة
 * يعتمد على مكتبات marked.js و DOMPurify و MathJax إذا كانت متوفرة
 */
AdminUI.updatePostPreview = function() {
    const titleInput = document.getElementById("editor-title");
    const contentInput = document.getElementById("editor-content");
    const imageInput = document.getElementById("editor-image-url");
    
    if (!titleInput || !contentInput) return;

    const titleEl = document.getElementById("preview-title");
    const bodyEl = document.getElementById("preview-body");
    const imgEl = document.getElementById("preview-cover-image");

    // تحديث العنوان والصورة
    titleEl.innerText = titleInput.value || "عنوان الإعلان";
    if (imageInput && imageInput.value.trim() !== "") {
        imgEl.src = imageInput.value;
        imgEl.style.display = "block";
    } else {
        imgEl.style.display = "none";
    }

    // معالجة Markdown و LaTeX
    let rawContent = contentInput.value;
    
    if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        const dirtyHtml = marked.parse(rawContent || "ابدأ الكتابة لرؤية المعاينة هنا...");
        const cleanHtml = DOMPurify.sanitize(dirtyHtml);
        bodyEl.innerHTML = cleanHtml;

        // تشغيل MathJax لمعالجة المعادلات الرياضية
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([bodyEl]).catch(err => console.warn('MathJax Error:', err));
        }
    } else {
        // Fallback في حال عدم توفر المكتبات (يعرض كنص عادي مؤقتاً)
        bodyEl.innerText = rawContent || "ابدأ الكتابة لرؤية المعاينة هنا...";
    }
};

/**
 * حفظ المنشور (إضافة جديد أو تحديث الحالي)
 */
AdminUI.savePost = async function(postId) {
    const title = document.getElementById("editor-title").value.trim();
    const content = document.getElementById("editor-content").value.trim();
    const image = document.getElementById("editor-image-url").value.trim();
    
    if (!title || !content) {
        alert("يرجى إدخال العنوان والمحتوى.");
        return;
    }

    const btn = document.getElementById("save-post-btn");
    btn.disabled = true;
    btn.innerText = "جاري الحفظ... ⏳";

    try {
        const session = Auth.getSession();
        
        const payload = {
            title: title,
            content: content,
            image: image || null
        };

        if (postId) {
            // تحديث إعلان موجود
            await Api.put(`/posts/${postId}`, payload);
            alert("تم تحديث الإعلان بنجاح.");
        } else {
            // إضافة إعلان جديد (يتطلب إرسال user_id للكاتب)
            payload.user_id = parseInt(session.user_id);
            await Api.post("/posts/", payload);
            alert("تم نشر الإعلان بنجاح.");
        }

        // العودة للوحة الإعلانات
        AdminRole.loadSection("posts");

    } catch (err) {
        alert("حدث خطأ أثناء الحفظ: " + err.message);
        btn.disabled = false;
        btn.innerText = postId ? "حفظ التعديلات 💾" : "نشر الإعلان 🚀";
    }
};
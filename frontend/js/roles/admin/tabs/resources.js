// frontend/js/roles/admin/tabs/resources.js

AdminUI.renderResourcesTab = function(response) {
    const main = this.prepareMain("المكتبة والموارد التعليمية");
    const resources = response.data || response || [];

    // 1. الإحصائيات العلوية وشريط الإجراءات
    const totalFiles = resources.length;
    const totalSizeMB = resources.reduce((sum, r) => sum + (parseFloat(r.file_size_mb) || 0), 0).toFixed(2);

    const headerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #f59e0b; flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; gap: 30px;">
                <div>
                    <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px; font-weight: bold;">إجمالي الملفات المرفوعة</div>
                    <div style="font-size: 1.8em; font-weight: bold; color: #b45309;">${totalFiles} <span style="font-size: 0.6em; color: #94a3b8;">ملف</span></div>
                </div>
                <div>
                    <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px; font-weight: bold;">حجم المكتبة الإجمالي</div>
                    <div style="font-size: 1.8em; font-weight: bold; color: #0f172a;">${totalSizeMB} <span style="font-size: 0.6em; color: #94a3b8;">MB</span></div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex: 1; max-width: 400px; position: relative;">
                <input type="text" id="resource-search" placeholder="بحث بعنوان الملف، الوصف أو الأستاذ..." 
                       style="padding: 12px 15px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; outline: none; font-weight: bold; box-sizing: border-box;"
                       onkeyup="AdminUI.filterLocalResources(this.value)">
                <button onclick="AdminRole.loadSection('resources')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;" title="تحديث">🔄</button>
            </div>
            <button onclick="AdminUI.showUploadModal()" style="background: #f59e0b; color: white; border: none; padding: 14px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(245,158,11,0.2); transition: 0.2s; font-size: 1.05em;">
                <span>☁️</span> رفع ملف جديد
            </button>
        </div>
    `;

    // 2. الهيكل الأساسي للواجهة
    main.innerHTML = `
        ${headerHtml}
        
        <div id="resources-table-container">
            ${this._generateResourcesTableHtml(resources)}
        </div>

        <!-- النافذة المنبثقة: رفع الموارد التعليمية -->
        <div id="upload-modal-container" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; padding: 30px; border-radius: 12px; width: 550px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">
                    <h3 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                        <span>☁️</span> رفع ملف تعليمي جديد
                    </h3>
                    <button onclick="AdminUI.closeUploadModal()" style="background: #f1f5f9; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2em; color: #64748b;">&times;</button>
                </div>
                
                <form id="upload-resource-form" onsubmit="AdminUI.submitResourceUpload(event)">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">عنوان الملف *</label>
                        <input type="text" id="res-title" required placeholder="مثال: ملخص الفصل الأول..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none;">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">نوع الملف *</label>
                            <select id="res-type" required style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none; background: #f8fafc; font-weight: bold;">
                                <option value="pdf">كتاب / PDF 📕</option>
                                <option value="document">مستند نصي 📄</option>
                                <option value="video">مقطع فيديو</option>
                                <option value="image">صورة توضيحية</option>
                                <option value="archive">ملف مضغوط</option>
                            </select>
                        </div>
                        <div>
                            <!-- 💡 القائمة المنسدلة الديناميكية للتكليفات -->
                            <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">التكليف المرتبط (اختياري)</label>
                            <select id="res-assignment-id" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none; background: #f8fafc; font-weight: bold;">
                                <option value="">-- بدون ارتباط (عام) --</option>
                            </select>
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">وصف قصير (اختياري)</label>
                        <input type="text" id="res-desc" placeholder="معلومات إضافية حول الملف..." style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none;">
                    </div>

                    <div style="margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 2px dashed #94a3b8; text-align: center; transition: 0.3s;" id="upload-dropzone">
                        <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #334155; cursor: pointer;">
                            <span style="font-size: 2.5em; display: block; margin-bottom: 10px; color: #f59e0b;">📥</span>
                            انقر لاختيار الملف (الحد الأقصى 5MB)
                            <input type="file" id="res-file" required style="display: none;" onchange="AdminUI.handleFileSelect(this)">
                        </label>
                        <div id="file-name-display" style="color: #10b981; font-weight: bold; word-break: break-all; margin-top: 10px;"></div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 12px;">
                        <button type="button" onclick="AdminUI.closeUploadModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">إلغاء</button>
                        <button type="submit" id="res-submit-btn" style="padding: 12px 20px; border: none; background: #f59e0b; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(245,158,11,0.2);">بدء الرفع ☁️</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- تخزين مؤقت للفلترة -->
        <script>window.currentResourcesData = ${JSON.stringify(resources)};</script>
    `;
};

AdminUI._generateResourcesTableHtml = function(resources) {
    if (!resources || resources.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <span style="font-size: 4em; opacity: 0.5;">📂</span>
                <p style="color: #64748b; margin-top: 15px; font-size: 1.1em; font-weight: bold;">المكتبة فارغة أو لا توجد نتائج مطابقة لبحثك.</p>
            </div>
        `;
    }

    const typeIcons = { 'pdf': '📕', 'document': '📄', 'video': '🎬', 'image': '🖼️', 'archive': '📦' };

    const rows = resources.map(r => {
        const icon = typeIcons[r.resource_type?.toLowerCase()] || '📁';
        
        let assignmentInfo = `<span style="color: #94a3b8; font-size: 0.85em;">ملف عام (غير مرتبط)</span>`;
        if (r.assignment_id) {
            assignmentInfo = `
                <div style="color: #1e40af; font-size: 0.85em; font-weight: bold;">📚 ${this._escape(r.subject_name || 'مادة')} - ${this._escape(r.class_name || 'قسم')}</div>
                <div style="color: #64748b; font-size: 0.8em;">👨‍🏫 الأستاذ: ${this._escape(r.teacher_name || 'غير محدد')}</div>
            `;
        }

        return `
        <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px; font-weight: bold; color: #64748b;">#${r.resource_id || r.id}</td>
            <td style="padding: 15px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <span style="font-size: 1.8em; margin-top: 2px;">${icon}</span>
                    <div>
                        <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(r.title)}</div>
                        <div style="color: #64748b; font-size: 0.9em; margin-top: 3px;">${this._escape(r.description || "بدون وصف")}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 15px;">${assignmentInfo}</td>
            <td style="padding: 15px;">
                <span style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 0.85em; font-weight: bold; color: #334155; text-transform: uppercase;">
                    ${this._escape(r.resource_type)}
                </span>
            </td>
            <td style="padding: 15px; color: #0f172a; font-family: monospace; font-weight: bold; direction: ltr; text-align: right;">
                ${r.file_size_mb ? r.file_size_mb + " MB" : "-"}
            </td>
            <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                <button onclick="AdminUI.downloadResource(${r.resource_id || r.id}, '${this._escape(r.title)}')" title="تنزيل الملف" style="background: #f0fdf4; color: #16a34a; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; display: flex; align-items: center; gap: 5px;">
                    ⬇️ تنزيل
                </button>
                <button onclick="AdminRole.deleteItem('/resources', ${r.resource_id || r.id}, 'resources')" title="حذف نهائي" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s;">
                    🗑️
                </button>
            </td>
        </tr>
    `}).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">اسم الملف والتفاصيل</th>
                            <th style="padding: 15px; color: #334155;">الارتباط الأكاديمي</th>
                            <th style="padding: 15px; color: #334155;">النوع</th>
                            <th style="padding: 15px; color: #334155;">الحجم</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="resources-tbody">${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

// ==========================================
// وظائف الفلترة والنافذة المنبثقة
// ==========================================

AdminUI.filterLocalResources = function(keyword) {
    keyword = keyword.toLowerCase().trim();
    const allResources = window.currentResourcesData || [];
    const filtered = allResources.filter(r => {
        const title = (r.title || "").toLowerCase();
        const desc = (r.description || "").toLowerCase();
        const teacher = (r.teacher_name || "").toLowerCase();
        const subject = (r.subject_name || "").toLowerCase();
        return title.includes(keyword) || desc.includes(keyword) || teacher.includes(keyword) || subject.includes(keyword);
    });
    document.getElementById("resources-table-container").innerHTML = this._generateResourcesTableHtml(filtered);
};

AdminUI.handleFileSelect = function(input) {
    const display = document.getElementById('file-name-display');
    const dropzone = document.getElementById('upload-dropzone');
    if (input.files && input.files[0]) {
        display.innerHTML = `✅ تم اختيار الملف: <br/> <span style="color:#0f172a;">${input.files[0].name}</span>`;
        dropzone.style.borderColor = "#10b981";
        dropzone.style.background = "#f0fdf4";
    } else {
        display.innerHTML = "";
        dropzone.style.borderColor = "#94a3b8";
        dropzone.style.background = "#f8fafc";
    }
};

AdminUI.showUploadModal = async function() {
    document.getElementById("upload-modal-container").style.display = "flex";
    
    // جلب التكليفات لملء القائمة المنسدلة ديناميكياً
    const assignSelect = document.getElementById("res-assignment-id");
    assignSelect.innerHTML = '<option value="">جاري تحميل التكليفات... ⏳</option>';
    try {
        const response = await Api.get("/assignments/");
        const assignments = response.data || response || [];
        assignSelect.innerHTML = '<option value="">-- بدون ارتباط (ملف عام) --</option>' + 
            assignments.map(a => `<option value="${a.id || a.assignment_id}">${this._escape(a.subject_name || "مادة")} - ${this._escape(a.class_name || "قسم")}</option>`).join("");
    } catch (err) {
        assignSelect.innerHTML = '<option value="">-- تعذر جلب التكليفات، يمكنك تركه فارغاً --</option>';
    }
};

AdminUI.closeUploadModal = function() {
    document.getElementById("upload-modal-container").style.display = "none";
    document.getElementById("upload-resource-form").reset();
    document.getElementById("file-name-display").innerText = "";
    document.getElementById('upload-dropzone').style.borderColor = "#94a3b8";
    document.getElementById('upload-dropzone').style.background = "#f8fafc";
};

// ==========================================
// معالجة الرفع والتنزيل
// ==========================================

AdminUI.submitResourceUpload = async function(event) {
    event.preventDefault();
    const btn = document.getElementById("res-submit-btn");
    btn.disabled = true;
    btn.innerHTML = "جاري الرفع... ⏳";

    const title = document.getElementById("res-title").value;
    const type = document.getElementById("res-type").value;
    const desc = document.getElementById("res-desc").value;
    const assignId = document.getElementById("res-assignment-id").value;
    const fileInput = document.getElementById("res-file");
    
    if (fileInput.files.length === 0) {
        this.showToast("❌ الرجاء تحديد ملف للرفع.", "error");
        btn.disabled = false;
        btn.innerHTML = "بدء الرفع ☁️";
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("resource_type", type);
    if (desc) formData.append("description", desc);
    if (assignId) formData.append("assignment_id", assignId);
    formData.append("file", fileInput.files[0]);

    try {
        await Api.post("/resources/upload", formData);
        this.showToast("✅ تم رفع الملف بنجاح وإضافته للمكتبة.");
        this.closeUploadModal();
        AdminRole.loadSection("resources");
    } catch (err) {
        this.showToast("❌ فشل رفع الملف: " + (err.message || "تأكد من نوع وحجم الملف."), "error");
        btn.disabled = false;
        btn.innerHTML = "بدء الرفع ☁️";
    }
};

AdminUI.downloadResource = async function(resourceId, filename) {
    try {
        const session = Storage.getSession();
        const headers = {};
        if (session.token) headers["Authorization"] = `Bearer ${session.token}`;

        this.showToast("⏳ جاري تحضير الملف للتنزيل، يرجى الانتظار...");

        const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/download`, {
            method: "GET",
            headers: headers
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || "تعذر جلب الملف من الخادم، قد يكون محذوفاً أو المسار غير صالح.");
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        
        // استخراج الامتداد الأصلي للملف إذا أمكن لحفظه باسم صحيح
        const ext = response.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") || "";
        a.download = ext ? ext : filename; 
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);

    } catch (err) {
        this.showToast("❌ خطأ أثناء التنزيل: " + err.message, "error");
    }
};

// ==========================================
// الإشعارات السريعة
// ==========================================
if(!AdminUI.showToast) {
    AdminUI.showToast = function(message, type = "success") {
        const toast = document.createElement("div");
        toast.innerText = message;
        const bgColor = type === "error" ? "#dc2626" : "#0f172a";
        toast.style.cssText = `position: fixed; bottom: 20px; left: 20px; background: ${bgColor}; color: white; padding: 12px 25px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-weight: bold; transition: opacity 0.5s;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '0', 2500);
        setTimeout(() => toast.remove(), 3000);
    };
}

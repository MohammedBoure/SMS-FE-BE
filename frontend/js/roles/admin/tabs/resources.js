// frontend/js/roles/admin/tabs/resources.js

/**
 * واجهة إدارة الموارد والمكتبة الرقمية
 * تتيح رفع الملفات التعليمية، استعراضها، تصفيتها، وتنزيلها
 */
AdminUI.renderResourcesTab = function(response) {
    const main = this.prepareMain("المكتبة والموارد التعليمية");
    const resources = response.data || response || [];

    // 1. الإحصائيات العلوية وشريط الإجراءات
    const totalFiles = resources.length;
    const totalSizeMB = resources.reduce((sum, r) => sum + (parseFloat(r.file_size_mb) || 0), 0).toFixed(2);

    const headerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid #f59e0b; flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; gap: 30px;">
                <div>
                    <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px;">إجمالي الملفات</div>
                    <div style="font-size: 1.6em; font-weight: bold; color: #b45309;">${totalFiles} ملف</div>
                </div>
                <div>
                    <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px;">حجم المكتبة</div>
                    <div style="font-size: 1.6em; font-weight: bold; color: #0f172a;">${totalSizeMB} MB</div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="resource-search" placeholder="بحث بعنوان الملف..." style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; width: 200px;" onkeyup="AdminUI.filterLocalResources()">
            </div>
            <button onclick="AdminUI.showUploadModal()" style="background: #f59e0b; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <span>☁️</span> رفع ملف جديد
            </button>
        </div>
    `;

    // 2. بناء الجدول
    let tableHtml = "";
    if (resources.length === 0) {
        tableHtml = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="font-size: 3em;">📂</span>
                <p style="color: #64748b; margin-top: 15px; font-size: 1.1em;">المكتبة فارغة. قم برفع أول ملف تعليمي.</p>
            </div>
        `;
    } else {
        const rows = resources.map(r => {
            // تحديد أيقونة الملف بناءً على نوعه
            const typeIcons = {
                'pdf': '📕', 'document': '📄', 'video': '🎬', 'image': '🖼️', 'archive': '📦'
            };
            const icon = typeIcons[r.resource_type?.toLowerCase()] || '📁';

            return `
            <tr class="resource-row" data-title="${this._escape(r.title).toLowerCase()}" style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 15px; font-weight: bold; color: #0f172a;">#${r.resource_id || r.id}</td>
                <td style="padding: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5em;">${icon}</span>
                        <div>
                            <div style="font-weight: 600; color: #0f172a;">${this._escape(r.title)}</div>
                            <small style="color: #64748b;">${this._escape(r.description || "بدون وصف")}</small>
                        </div>
                    </div>
                </td>
                <td style="padding: 15px;">
                    <span style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">
                        ${this._escape(r.resource_type)}
                    </span>
                </td>
                <td style="padding: 15px; color: #475569; font-family: monospace;">
                    ${r.file_size_mb ? r.file_size_mb + " MB" : "-"}
                </td>
                <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                    <button onclick="AdminUI.downloadResource(${r.resource_id || r.id}, '${this._escape(r.title)}')" title="تنزيل الملف" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        تنزيل ⬇️
                    </button>
                    <button onclick="AdminRole.deleteItem('/resources', ${r.resource_id || r.id}, 'resources')" title="حذف" style="background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                        حذف 🗑️
                    </button>
                </td>
            </tr>
        `}).join("");

        tableHtml = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px;">ID</th>
                            <th style="padding: 15px;">اسم الملف والوصف</th>
                            <th style="padding: 15px;">النوع</th>
                            <th style="padding: 15px;">الحجم</th>
                            <th style="padding: 15px; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="resources-tbody">${rows}</tbody>
                </table>
            </div>
        `;
    }

    // إضافة الحاوية للنافذة المنبثقة للرفع
    main.innerHTML = headerHtml + tableHtml + `<div id="upload-modal-container"></div>`;
};

/**
 * فلترة الملفات محلياً بدون الرجوع للخادم لتسريع البحث
 */
AdminUI.filterLocalResources = function() {
    const keyword = document.getElementById("resource-search").value.toLowerCase();
    const rows = document.querySelectorAll(".resource-row");
    
    rows.forEach(row => {
        const title = row.getAttribute("data-title");
        if (title.includes(keyword)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
};

/**
 * عرض نافذة رفع الملفات (Modal)
 */
AdminUI.showUploadModal = function() {
    const container = document.getElementById("upload-modal-container");
    container.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 30px; border-radius: 10px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                    <h3 style="margin: 0; color: #0f172a;">رفع ملف تعليمي جديد</h3>
                    <button onclick="document.getElementById('upload-modal-container').innerHTML=''" style="background: none; border: none; font-size: 1.5em; cursor: pointer; color: #64748b;">&times;</button>
                </div>
                <form id="upload-resource-form" onsubmit="AdminUI.submitResourceUpload(event)">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">عنوان الملف *</label>
                        <input type="text" id="res-title" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">نوع الملف *</label>
                        <select id="res-type" required style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                            <option value="pdf">كتاب / PDF</option>
                            <option value="document">مستند نصي</option>
                            <option value="video">مقطع فيديو</option>
                            <option value="image">صورة توضيحية</option>
                            <option value="archive">ملف مضغوط (Archive)</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">وصف قصير (اختياري)</label>
                        <input type="text" id="res-desc" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">اختر الملف *</label>
                        <input type="file" id="res-file" required style="width: 100%; padding: 10px; border: 1px dashed #94a3b8; border-radius: 6px; box-sizing: border-box; background: #f8fafc;">
                    </div>
                    <div style="text-align: left;">
                        <button type="button" onclick="document.getElementById('upload-modal-container').innerHTML=''" style="background: white; border: 1px solid #cbd5e1; padding: 10px 15px; border-radius: 6px; cursor: pointer; margin-left: 10px;">إلغاء</button>
                        <button type="submit" id="res-submit-btn" style="background: #f59e0b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">بدء الرفع ☁️</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

/**
 * معالجة ورفع الملف باستخدام FormData
 */
AdminUI.submitResourceUpload = async function(event) {
    event.preventDefault();
    const btn = document.getElementById("res-submit-btn");
    btn.disabled = true;
    btn.innerText = "جاري الرفع... ⏳";

    const title = document.getElementById("res-title").value;
    const type = document.getElementById("res-type").value;
    const desc = document.getElementById("res-desc").value;
    const fileInput = document.getElementById("res-file");
    
    if (fileInput.files.length === 0) {
        alert("الرجاء تحديد ملف للرفع.");
        btn.disabled = false;
        btn.innerText = "بدء الرفع ☁️";
        return;
    }

    // بناء كائن FormData متوافق مع /resources/upload
    const formData = new FormData();
    formData.append("title", title);
    formData.append("resource_type", type);
    if (desc) formData.append("description", desc);
    formData.append("file", fileInput.files[0]);

    try {
        // ملف api.js الخاص بك يدعم FormData تلقائياً ويقوم بحذف Content-Type 
        await Api.post("/resources/upload", formData);
        alert("تم رفع الملف بنجاح.");
        document.getElementById("upload-modal-container").innerHTML = ""; // إغلاق النافذة
        AdminRole.loadSection("resources"); // تحديث الجدول
    } catch (err) {
        alert("فشل رفع الملف: " + err.message);
        btn.disabled = false;
        btn.innerText = "بدء الرفع ☁️";
    }
};

/**
 * دالة مخصصة لتنزيل الملفات بأمان مع تمرير Token الجلسة
 */
AdminUI.downloadResource = async function(resourceId, filename) {
    try {
        // لا يمكننا استخدام api.js هنا لأنه يحاول تحويل النتيجة إلى JSON (response.json())
        // التنزيل يحتاج إلى استخراج كائن Blob
        const session = Storage.getSession();
        const headers = {};
        if (session.token) headers["Authorization"] = `Bearer ${session.token}`;

        // إظهار تنبيه بصري للمستخدم
        const toast = document.createElement("div");
        toast.style.cssText = "position:fixed; bottom:20px; right:20px; background:#0f172a; color:white; padding:15px; border-radius:8px; z-index:9999;";
        toast.innerText = "جاري تحضير الملف للتنزيل...";
        document.body.appendChild(toast);

        const response = await fetch(`${API_BASE_URL}/resources/download/${resourceId}`, {
            method: "GET",
            headers: headers
        });

        if (!response.ok) throw new Error("تعذر جلب الملف من الخادم.");

        // تحويل الاستجابة إلى مسار قابل للتحميل
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // إنشاء رابط وهمي والنقر عليه برمجياً
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = filename; // محاولة فرض اسم الملف
        document.body.appendChild(a);
        a.click();
        
        // تنظيف الذاكرة
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        document.body.removeChild(toast);

    } catch (err) {
        alert("حدث خطأ أثناء تنزيل الملف: " + err.message);
    }
};
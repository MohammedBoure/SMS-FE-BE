// frontend/js/roles/admin/tabs/programs.js

/**
 * واجهة إدارة البرامج الدراسية (Programs)
 * تتيح عرض، إضافة، وتعديل البرامج التي يُسجل فيها الطلاب
 */
AdminUI.renderProgramsTab = function(programsData) {
    const main = this.prepareMain("إدارة البرامج الدراسية");
    const programs = programsData.data || programsData || [];

    // 1. شريط الإجراءات والبحث العُلوي
    main.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); gap: 15px; flex-wrap: wrap;">
            <div style="display: flex; gap: 10px; flex: 1; min-width: 300px;">
                <input type="text" id="program-search-input" placeholder="ابحث باسم البرنامج..." 
                       style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none; font-size: 1rem;"
                       onkeypress="if(event.key === 'Enter') AdminUI.searchPrograms()">
                <button onclick="AdminUI.searchPrograms()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">
                    بحث 🔍
                </button>
                <button onclick="AdminRole.loadSection('programs')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; cursor: pointer; transition: 0.2s;" title="إعادة تحميل القائمة">
                    🔄
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showProgramModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s;">
                    ➕ إضافة برنامج جديد
                </button>
            </div>
        </div>

        <!-- جدول البيانات -->
        <div id="programs-table-container">
            ${this._generateProgramsTableHtml(programs)}
        </div>

        <!-- النافذة المنبثقة: إضافة/تعديل برنامج -->
        <div id="program-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(2px);">
            <div style="background: white; width: 500px; padding: 25px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                <h3 id="program-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <span>📚</span> إضافة برنامج دراسي
                </h3>
                
                <input type="hidden" id="modal-program-id">

                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">اسم البرنامج (إجباري) *</label>
                    <input type="text" id="modal-program-name" placeholder="مثال: دورة تقوية رياضيات، كورس لغات..." style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">نوع البرنامج (إجباري) *</label>
                    <input type="text" id="modal-program-type" placeholder="مثال: دورة، دبلوم، نشاط صيفي..." style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">السعر (نقداً)</label>
                        <input type="number" id="modal-program-price-cash" value="0" min="0" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">السعر (بالتقسيط)</label>
                        <input type="number" id="modal-program-price-installments" value="0" min="0" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                    <button onclick="AdminUI.closeProgramModal()" style="padding: 10px 15px; border: none; background: #f1f5f9; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitProgram()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;">حفظ البرنامج</button>
                </div>
            </div>
        </div>
    `;
};

/**
 * توليد كود HTML لجدول البرامج
 */
AdminUI._generateProgramsTableHtml = function(programs) {
    if (programs.length === 0) {
        return `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="font-size: 4em; opacity: 0.5;">📚</span>
                <p style="color: #64748b; font-size: 1.1em;">لا توجد برامج دراسية مسجلة حالياً.</p>
            </div>
        `;
    }

    const rows = programs.map(p => `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 15px; font-weight: bold; color: #64748b;">#${p.id}</td>
            <td style="padding: 15px; font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(p.program_name)}</td>
            <td style="padding: 15px;">
                <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-size: 0.9em; font-weight: bold;">
                    ${this._escape(p.program_type)}
                </span>
            </td>
            <td style="padding: 15px; font-weight: bold; color: #059669; direction: ltr; text-align: right;">${this._formatCurrency(p.price_cash)}</td>
            <td style="padding: 15px; font-weight: bold; color: #d97706; direction: ltr; text-align: right;">${this._formatCurrency(p.price_installments)}</td>
            <td style="padding: 15px; text-align: left; display: flex; gap: 6px; justify-content: flex-end;">
                <button onclick='AdminUI.showProgramModal(${JSON.stringify(p).replace(/'/g, "&apos;")})' title="تعديل البرنامج" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">✏️ تعديل</button>
                <button onclick="AdminRole.deleteItem('/programs', ${p.id}, 'programs')" title="حذف البرنامج" style="background: #fef2f2; color: #b91c1c; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">🗑️ حذف</button>
            </td>
        </tr>
    `).join("");

    return `
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="padding: 12px 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.9em; color: #475569;">
                إجمالي البرامج: <strong style="color: #0f172a;">${programs.length}</strong>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">اسم البرنامج</th>
                            <th style="padding: 15px; color: #334155;">النوع</th>
                            <th style="padding: 15px; color: #334155;">السعر نقداً</th>
                            <th style="padding: 15px; color: #334155;">السعر بالتقسيط</th>
                            <th style="padding: 15px; color: #334155; text-align: left;">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

// ==========================================
// وظائف البحث والنافذة المنبثقة (Modal)
// ==========================================

AdminUI.searchPrograms = async function() {
    const keyword = document.getElementById("program-search-input").value.trim();
    if (keyword.length > 0 && keyword.length < 2) {
        alert("يرجى إدخال حرفين على الأقل للبحث.");
        return;
    }
    
    if (keyword.length === 0) return AdminRole.loadSection("programs");

    AdminUI.renderLoading();
    try {
        const response = await Api.get(`/programs/search?keyword=${encodeURIComponent(keyword)}`);
        this.renderProgramsTab(response);
        document.getElementById("program-search-input").value = keyword;
    } catch (err) {
        this.renderError("فشل البحث: " + err.message);
    }
};

AdminUI.showProgramModal = function(programData = null) {
    const modal = document.getElementById("program-modal");
    const title = document.getElementById("program-modal-title");

    // تصفير الحقول الافتراضية
    document.getElementById("modal-program-id").value = "";
    document.getElementById("modal-program-name").value = "";
    document.getElementById("modal-program-type").value = "";
    document.getElementById("modal-program-price-cash").value = "0";
    document.getElementById("modal-program-price-installments").value = "0";

    if (programData) {
        // وضع التعديل (Edit)
        title.innerHTML = "<span>✏️</span> تعديل البرنامج";
        document.getElementById("modal-program-id").value = programData.id;
        document.getElementById("modal-program-name").value = programData.program_name || "";
        document.getElementById("modal-program-type").value = programData.program_type || "";
        document.getElementById("modal-program-price-cash").value = programData.price_cash || 0;
        document.getElementById("modal-program-price-installments").value = programData.price_installments || 0;
    } else {
        // وضع الإضافة (Add)
        title.innerHTML = "<span>📚</span> إضافة برنامج دراسي";
    }

    modal.style.display = "flex";
};

AdminUI.closeProgramModal = function() {
    document.getElementById("program-modal").style.display = "none";
};

AdminUI.submitProgram = async function() {
    const id = document.getElementById("modal-program-id").value;
    const name = document.getElementById("modal-program-name").value.trim();
    const type = document.getElementById("modal-program-type").value.trim();
    const priceCash = parseInt(document.getElementById("modal-program-price-cash").value) || 0;
    const priceInstallments = parseInt(document.getElementById("modal-program-price-installments").value) || 0;

    if (!name || !type) {
        alert("يرجى إدخال اسم ونوع البرنامج الأكاديمي.");
        return;
    }

    const payload = {
        program_name: name,
        program_type: type,
        price_cash: priceCash,
        price_installments: priceInstallments
    };

    try {
        if (id) {
            // تحديث برنامج موجود
            await Api.put(`/programs/${id}`, payload);
            alert("✅ تم تحديث بيانات البرنامج بنجاح.");
        } else {
            // إضافة برنامج جديد
            await Api.post("/programs/", payload);
            alert("✅ تمت إضافة البرنامج الجديد بنجاح.");
        }
        
        this.closeProgramModal();
        AdminRole.loadSection("programs");

    } catch (err) {
        alert("❌ فشل الحفظ: " + (err.message || "حدث خطأ غير متوقع."));
    }
};
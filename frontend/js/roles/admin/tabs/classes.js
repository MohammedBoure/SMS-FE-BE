// frontend/js/roles/admin/tabs/classes.js

/**
 * واجهة إدارة الفصول الدراسية
 * تشمل عرض السعة الاستيعابية الحية، إدارة الفصول، والبيانات الأكاديمية
 */
AdminUI.renderClassesTab = async function(classesData) {
    const main = this.prepareMain("إدارة الفصول الدراسية والمقاعد");
    
    // 1. جلب بيانات الإشغال (Occupancy) بشكل منفصل لتعزيز دقة الإحصائيات
    let occupancy = [];
    try {
        const occRes = await AdminServices.getClassesOccupancy();
        occupancy = occRes.data || occRes || [];
    } catch (err) {
        console.error("فشل في جلب بيانات الإشغال:", err);
    }

    // 2. تصميم قسم الإحصائيات السريعة (مراقبة السعة لكل فصل)
    const occupancyCards = occupancy.map(cls => {
        const capacity = cls.capacity || 0;
        const studentCount = cls.student_count || 0;
        const percent = capacity > 0 ? Math.round((studentCount / capacity) * 100) : 0;
        
        // تحديد اللون حسب نسبة الامتلاء
        const statusColor = percent >= 95 ? '#ef4444' : (percent >= 80 ? '#f59e0b' : '#10b981');
        const bgColor = percent >= 95 ? '#fef2f2' : '#ffffff';
        
        return `
            <div style="background: ${bgColor}; padding: 18px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; border-right: 5px solid ${statusColor}; transition: 0.3s; position: relative; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h4 style="margin: 0; color: #0f172a; font-size: 1.1em;">${this._escape(cls.class_name)}</h4>
                    <span style="font-size: 0.85em; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 12px;">${this._escape(cls.level || "عام")}</span>
                </div>
                <div style="margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.9em; font-weight: bold; margin-bottom: 8px; color: #475569;">
                        <span>إشغال: ${studentCount} / ${capacity > 0 ? capacity : "∞"}</span>
                        <span style="color: ${statusColor};">${percent}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: ${statusColor}; transition: width 0.8s ease-in-out;"></div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // 3. استخراج قائمة الفصول لجدول التفاصيل
    const classesList = classesData.data || classesData || [];

    // 4. بناء الهيكل الرئيسي للصفحة مع النافذة المنبثقة (Modal) المدمجة
    main.innerHTML = `
        <div style="margin-bottom: 35px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    <span>📊</span> الرصد الحي لامتلاء الفصول
                </h3>
                <button onclick="AdminUI.showClassModal()" style="background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s;">
                    ➕ إنشاء فصل دراسي
                </button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
                ${occupancyCards || '<div style="grid-column: 1/-1; text-align: center; color:#64748b; padding: 30px; background: white; border-radius: 8px;">لا توجد بيانات إشغال متاحة. قم بإنشاء فصول وإضافة طلاب.</div>'}
            </div>
        </div>

        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 18px 20px; background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 1.1em; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    <span>🏫</span> إدارة هيكلة الفصول
                </h3>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px; color: #475569;">رقم الفصل</th>
                            <th style="padding: 15px; color: #475569;">الاسم الأكاديمي</th>
                            <th style="padding: 15px; color: #475569;">المستوى الدراسي</th>
                            <th style="padding: 15px; color: #475569;">الفئة العمرية</th>
                            <th style="padding: 15px; color: #475569;">السعة القصوى</th>
                            <th style="padding: 15px; text-align: left; color: #475569;">إجراءات الإدارة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${classesList.length > 0 ? classesList.map(c => `
                            <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                <td style="padding: 15px; font-weight: bold; color: #64748b;">#${c.class_id || c.id}</td>
                                <td style="padding: 15px; font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(c.class_name)}</td>
                                <td style="padding: 15px; color: #334155;">${this._escape(c.level || "-")}</td>
                                <td style="padding: 15px; color: #334155;">${this._escape(c.age_group || "-")}</td>
                                <td style="padding: 15px;">
                                    <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 0.9em;">
                                        ${c.capacity ? c.capacity + ' مقعد' : 'غير محدد'}
                                    </span>
                                </td>
                                <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                                    <button onclick='AdminUI.showClassModal(${JSON.stringify(c).replace(/'/g, "&apos;")})' title="تعديل الفصل" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">✏️ تعديل</button>
                                    <button onclick="AdminRole.deleteItem('/classes', ${c.class_id || c.id}, 'classes')" title="حذف الفصل" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;">🗑️ حذف</button>
                                </td>
                            </tr>
                        `).join("") : `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #64748b;">لا توجد فصول دراسية مسجلة حالياً.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <div id="class-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; width: 450px; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                <h3 id="class-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <span>🏫</span> إضافة فصل جديد
                </h3>
                
                <input type="hidden" id="modal-class-id">

                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">اسم الفصل الأكاديمي *</label>
                    <input type="text" id="modal-class-name" placeholder="مثال: فصل أينشتاين (أ)" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">المستوى الدراسي</label>
                    <input type="text" id="modal-class-level" placeholder="مثال: السنة الأولى ثانوي" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">الفئة العمرية</label>
                        <input type="text" id="modal-class-age" placeholder="مثال: 15-16" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">السعة القصوى (مقاعد)</label>
                        <input type="number" id="modal-class-capacity" placeholder="مثال: 30" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px;">
                    <button onclick="AdminUI.closeClassModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitClass()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">حفظ بيانات الفصل</button>
                </div>
            </div>
        </div>
    `;
};

// ==========================================
// وظائف النافذة المنبثقة للفصول (Add & Edit)
// ==========================================

/**
 * دالة لفتح نافذة الإضافة أو التعديل
 * @param {Object} classData - إذا تم تمرير كائن، تفتح في وضع التعديل
 */
AdminUI.showClassModal = function(classData = null) {
    const modal = document.getElementById("class-modal");
    const title = document.getElementById("class-modal-title");

    // تصفير الحقول دائماً
    document.getElementById("modal-class-id").value = "";
    document.getElementById("modal-class-name").value = "";
    document.getElementById("modal-class-level").value = "";
    document.getElementById("modal-class-age").value = "";
    document.getElementById("modal-class-capacity").value = "";

    if (classData) {
        // وضع التعديل (Edit Mode)
        title.innerHTML = "<span>✏️</span> تعديل بيانات الفصل";
        document.getElementById("modal-class-id").value = classData.id || classData.class_id;
        document.getElementById("modal-class-name").value = classData.class_name || "";
        document.getElementById("modal-class-level").value = classData.level || "";
        document.getElementById("modal-class-age").value = classData.age_group || "";
        document.getElementById("modal-class-capacity").value = classData.capacity || "";
    } else {
        // وضع الإضافة (Add Mode)
        title.innerHTML = "<span>🏫</span> إضافة فصل جديد";
    }

    modal.style.display = "flex";
};

/**
 * إغلاق النافذة المنبثقة
 */
AdminUI.closeClassModal = function() {
    document.getElementById("class-modal").style.display = "none";
};

/**
 * إرسال البيانات للخادم (للإضافة أو التعديل)
 */
AdminUI.submitClass = async function() {
    const id = document.getElementById("modal-class-id").value;
    const className = document.getElementById("modal-class-name").value.trim();
    const level = document.getElementById("modal-class-level").value.trim();
    const ageGroup = document.getElementById("modal-class-age").value.trim();
    const capacityRaw = document.getElementById("modal-class-capacity").value;

    // التحقق من المدخلات الأساسية
    if (!className) {
        alert("يرجى إدخال اسم الفصل الدراسي.");
        return;
    }

    // تجهيز حزمة البيانات حسب ما يتطلبه الـ API
    const payload = {
        class_name: className,
        level: level || null,
        age_group: ageGroup || null,
        capacity: capacityRaw ? parseInt(capacityRaw) : null
    };

    try {
        if (id) {
            // تحديث فصل موجود (PUT /classes/{class_id})
            await Api.put(`/classes/${id}`, payload);
            alert("تم تحديث بيانات الفصل بنجاح.");
        } else {
            // إنشاء فصل جديد (POST /classes/)
            await Api.post("/classes/", payload);
            alert("تم إنشاء الفصل الجديد بنجاح.");
        }
        
        // إغلاق النافذة وتحديث القسم لإظهار التغييرات
        this.closeClassModal();
        AdminRole.loadSection("classes");

    } catch (err) {
        alert("فشل في حفظ بيانات الفصل: " + (err.message || "حدث خطأ غير متوقع."));
    }
};
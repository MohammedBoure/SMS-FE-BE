// frontend/js/roles/admin/tabs/classes.js

/**
 * واجهة إدارة الفصول الدراسية
 * تشمل عرض السعة الاستيعابية، إدارة الفصول، والبيانات الأكاديمية
 */
AdminUI.renderClassesTab = async function(classesData) {
    const main = this.prepareMain("إدارة الفصول الدراسية");
    
    // جلب بيانات الإشغال (Occupancy) بشكل منفصل لتعزيز دقة الإحصائيات
    let occupancy = [];
    try {
        occupancy = await AdminServices.getClassesOccupancy();
    } catch (err) {
        console.error("فشل في جلب بيانات الإشغال:", err);
    }

    // 1. قسم الإحصائيات السريعة (مراقبة السعة)
    const occupancyCards = occupancy.map(cls => {
        const percent = cls.capacity > 0 ? Math.round((cls.student_count / cls.capacity) * 100) : 0;
        const statusColor = percent >= 90 ? '#ef4444' : (percent >= 70 ? '#f59e0b' : '#10b981');
        
        return `
            <div style="background: white; padding: 15px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-right: 4px solid ${statusColor};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h4 style="margin: 0; color: #0f172a;">${this._escape(cls.class_name)}</h4>
                    <span style="font-size: 0.8em; color: #64748b;">${this._escape(cls.level)}</span>
                </div>
                <div style="margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85em; margin-bottom: 5px;">
                        <span>الإشغال: ${cls.student_count}/${cls.capacity}</span>
                        <span>${percent}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: ${statusColor}; transition: width 0.5s;"></div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // 2. الهيكل الرئيسي للواجهة
    main.innerHTML = `
        <div style="margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #064e3b;">📊 نظرة عامة على الإشغال</h3>
                <button onclick="AdminUI.showAddClassModal()" style="background: #064e3b; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    + إضافة فصل جديد
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px;">
                ${occupancyCards || '<p style="color:#64748b;">لا توجد بيانات إشغال متاحة.</p>'}
            </div>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="padding: 15px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                <h3 style="margin: 0; font-size: 1.1em; color: #0f172a;">📋 قائمة الفصول التفصيلية</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
                <thead style="background: #f1f5f9;">
                    <tr>
                        <th style="padding: 12px;">المعرف</th>
                        <th style="padding: 12px;">اسم الفصل</th>
                        <th style="padding: 12px;">المستوى الأكاديمي</th>
                        <th style="padding: 12px;">الفئة العمرية</th>
                        <th style="padding: 12px;">السعة القصوى</th>
                        <th style="padding: 12px; text-align: left;">إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${(classesData.data || classesData || []).map(c => `
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 12px;">#${c.class_id || c.id}</td>
                            <td style="padding: 12px; font-weight: bold;">${this._escape(c.class_name)}</td>
                            <td style="padding: 12px;">${this._escape(c.level || "-")}</td>
                            <td style="padding: 12px;">${this._escape(c.age_group || "-")}</td>
                            <td style="padding: 12px;">${c.capacity} مقعد</td>
                            <td style="padding: 12px; text-align: left; display: flex; gap: 5px; justify-content: flex-end;">
                                <button onclick="AdminUI.editClass(${c.class_id || c.id})" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✏️</button>
                                <button onclick="AdminRole.deleteItem('/classes', ${c.class_id || c.id}, 'classes')" style="background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
};

/**
 * دالة لإظهار نموذج إضافة فصل جديد (Prompt سريع كمثال)
 */
AdminUI.showAddClassModal = async function() {
    const className = prompt("اسم الفصل الدراسي:");
    if (!className) return;
    
    const level = prompt("المستوى (مثال: السنة الثالثة):");
    const capacity = prompt("السعة الاستيعابية (رقم):");

    try {
        await Api.post("/classes/", {
            class_name: className,
            level: level,
            capacity: parseInt(capacity) || 30
        });
        alert("تم إنشاء الفصل بنجاح");
        AdminRole.loadSection("classes");
    } catch (err) {
        alert("فشل الإضافة: " + err.message);
    }
};

/**
 * دالة تعديل الفصل
 */
AdminUI.editClass = async function(classId) {
    // يمكن توسيع هذه الدالة لتفتح Modal يحتوي على نموذج مكتمل
    console.log("تعديل الفصل رقم:", classId);
    alert("وظيفة التعديل ستفتح نافذة منبثقة (Modal) قريباً.");
};
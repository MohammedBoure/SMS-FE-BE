// js/roles/receptionist/tabs/students.js

ReceptionistUI.renderStudents = function(studentsData, classesList, parentsList) {
  const main = document.getElementById("receptionist-main");
  
  // استخراج المصفوفة بأمان
  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.data || []);
  
  const classOptions = classesList.map(c => `<option value="${this._escapeAttr(c.id)}">${this._escape(c.class_name)}</option>`).join("");
  const parentOptions = parentsList.map(p => {
    const pId = p.id || p.parent_id;
    return `<option value="${this._escapeAttr(pId)}">${this._escape(p.full_name || "ولي أمر")}</option>`;
  }).join("");

  let html = `
    <h2>إدارة الطلاب</h2>
    
    <div class="form-container">
      <h3>تسجيل طالب جديد</h3>
      <form id="register-student-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
        <input type="text" id="s-fullname" placeholder="الاسم الكامل للطالب" required />
        <input type="text" id="s-username" placeholder="اسم المستخدم للدخول" required />
        <input type="email" id="s-email" placeholder="البريد الإلكتروني" />
        <input type="text" id="s-phone" placeholder="رقم الهاتف" />
        <input type="text" id="s-address" placeholder="عنوان الطالب" />
        <input type="date" id="s-dob" required />
        <input type="text" id="s-blood-group" placeholder="زمرة الدم" />
        <input type="text" id="s-medical-info" placeholder="معلومات طبية" />
        <select id="s-parent-id" required><option value="">اختر ولي الأمر...</option>${parentOptions}</select>
        <select id="s-class-id" required><option value="">اختر القسم...</option>${classOptions}</select>
        <button type="submit" style="grid-column: 1 / -1; margin-top: 10px;">تسجيل الطالب</button>
      </form>
    </div>

    <section class="students-panel">
      <div class="students-panel__header" style="margin-bottom: 15px;">
        <input type="search" id="student-search-input" placeholder="ابحث بالاسم أو الرقم..." autocomplete="off" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ccc;" />
      </div>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead style="background: var(--secondary, #2e1065); color: white;">
            <tr>
              <th style="padding: 10px;">الرقم</th>
              <th style="padding: 10px;">الاسم الكامل</th>
              <th style="padding: 10px;">القسم</th>
              <th style="padding: 10px;">الحالة</th>
              <th style="padding: 10px;">إجراء</th>
            </tr>
          </thead>
          <tbody id="students-table-body">
            ${students.map(s => `
              <tr data-student-row data-search="${this._escape((s.student_name || s.full_name) + " " + (s.id || s.student_id))}" style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${this._escape(s.id || s.student_id)}</td>
                <td style="padding: 10px;"><strong>${this._escape(s.student_name || s.full_name)}</strong></td>
                <td style="padding: 10px;">${this._escape(s.class_name || "غير محدد")}</td>
                <td style="padding: 10px;"><span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">${this._statusLabel(s.status)}</span></td>
                <td style="padding: 10px; display: flex; gap: 5px;">
                  <button class="view-student-details-btn" data-id="${s.id || s.student_id}" style="padding: 5px 10px; background: var(--primary, #7c3aed); color: white; border: none; border-radius: 4px; cursor: pointer;">عرض التفاصيل</button>
                  <button class="edit-student-btn" data-id="${s.id || s.student_id}" style="padding: 5px 10px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer;">تعديل</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
  main.innerHTML = html;
};

/**
 * عرض تفاصيل الطالب الكاملة
 */
ReceptionistUI.showStudentDetailsModal = function(studentId, student, grades, attendance) {
  this.closeStudentDetailsModal();

  const safeGrades = Array.isArray(grades) ? grades : (grades?.data || []);
  const safeAttendance = Array.isArray(attendance) ? attendance : (attendance?.data || []);
  const studentName = student ? (student.student_name || student.full_name) : "غير محدد";

  const overlay = document.createElement("div");
  overlay.id = "student-details-modal";
  overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px);";

  const dialog = document.createElement("div");
  dialog.style.cssText = "background: white; width: 95%; max-width: 800px; max-height: 85vh; border-radius: 12px; overflow-y: auto; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); direction: rtl;";

  dialog.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
      <h3 style="margin: 0; color: #7c3aed;">الملف الشامل: ${this._escape(studentName)}</h3>
      <button data-close-student-modal style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <div><strong>رقم الطالب:</strong> ${this._escape(studentId)}</div>
      <div><strong>اسم المستخدم (الدخول):</strong> <span style="color: #0284c7; font-weight: bold;">${this._escape(student?.username || "غير متوفر")}</span></div>
      <div><strong>البريد الإلكتروني:</strong> ${this._escape(student?.email || "-")}</div>
      <div><strong>الهاتف:</strong> <span dir="ltr">${this._escape(student?.phone || student?.student_phone || "-")}</span></div>
      <div><strong>العنوان:</strong> ${this._escape(student?.address || "-")}</div>
      <div><strong>القسم:</strong> ${this._escape(student?.class_name || "غير محدد")}</div>
      <div><strong>ولي الأمر:</strong> ${this._escape(student?.parent_name || "غير محدد")}</div>
      <div><strong>هاتف الولي:</strong> <span dir="ltr">${this._escape(student?.parent_phone || "-")}</span></div>
      <div><strong>تاريخ الميلاد:</strong> <span dir="ltr">${this._escape(student?.date_of_birth || "-")}</span></div>
      <div><strong>تاريخ التسجيل:</strong> <span dir="ltr">${this._escape(student?.registration_date || "-")}</span></div>
      <div><strong>زمرة الدم:</strong> <span dir="ltr">${this._escape(student?.blood_group || "-")}</span></div>
      <div><strong>الحالة:</strong> <span style="color: #7c3aed; font-weight: bold;">${this._statusLabel(student?.status)}</span></div>
      <div style="grid-column: 1 / -1;"><strong>معلومات طبية:</strong> <p style="margin: 5px 0 0 0; color: #dc2626;">${this._escape(student?.medical_info || "لا توجد")}</p></div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <h4 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">سجل الغيابات</h4>
        ${safeAttendance.length > 0 ? `
          <ul style="list-style: none; padding: 0; margin: 0; max-height: 200px; overflow-y: auto;">
            ${safeAttendance.map(a => `<li style="padding: 8px; border-bottom: 1px solid #eee; font-size: 0.9em;"><strong>${this._escape(a.date)}</strong> - ${this._escape(a.status)} (${a.is_justified ? '<span style="color: green;">مبرر</span>' : '<span style="color: red;">غير مبرر</span>'})</li>`).join("")}
          </ul>
        ` : "<p style='color: #64748b;'>لا توجد غيابات مسجلة.</p>"}
      </div>
      <div>
        <h4 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">كشف العلامات</h4>
        ${safeGrades.length > 0 ? `
          <div style="max-height: 200px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
              <tr style="background: #f1f5f9;">
                <th style="padding: 8px; text-align: right;">المادة</th>
                <th style="padding: 8px; text-align: center;">العلامة</th>
              </tr>
              ${safeGrades.map(g => `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${this._escape(g.subject_name)}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center; direction: ltr;"><strong>${this._escape(g.grade_value)}</strong> / ${this._escape(g.max_grade)}</td>
                </tr>
              `).join("")}
            </table>
          </div>
        ` : "<p style='color: #64748b;'>لا توجد علامات مسجلة.</p>"}
      </div>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
};

ReceptionistUI.showStudentEditModal = function(student, classesList, parentsList) {
  this.closeStudentDetailsModal();

  const classOptions = [`<option value="">بدون قسم</option>`, ...classesList.map(c => `
    <option value="${this._escapeAttr(c.id)}" ${String(c.id) === String(student?.class_id || "") ? "selected" : ""}>
      ${this._escape(c.class_name)}
    </option>
  `)].join("");

  const parentOptions = [`<option value="">بدون ولي أمر</option>`, ...parentsList.map(p => {
    const pId = p.id || p.parent_id;
    return `<option value="${this._escapeAttr(pId)}" ${String(pId) === String(student?.parent_id || "") ? "selected" : ""}>${this._escape(p.full_name || "ولي أمر")}</option>`;
  })].join("");

  const overlay = document.createElement("div");
  overlay.id = "student-details-modal"; 
  overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px);";

  const dialog = document.createElement("div");
  dialog.style.cssText = "background: white; width: 95%; max-width: 600px; max-height: 90vh; border-radius: 12px; overflow-y: auto; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); direction: rtl;";

  dialog.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
      <h3 style="margin: 0; color: #f59e0b;">تعديل بيانات: ${this._escape(student?.student_name || student?.full_name || "")}</h3>
      <button data-close-student-modal style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
    </div>

    <form id="edit-student-form" data-student-id="${this._escapeAttr(student?.id || student?.student_id || "")}" data-user-id="${this._escapeAttr(student?.user_id || "")}">
      
      <h4 style="margin-bottom: 10px; color: #475569;">بيانات الدخول (الحساب)</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; background: #f0fdf4; padding: 10px; border-radius: 8px; border: 1px solid #bbf7d0;">
        <div>
          <label style="display:block; font-size:0.9em; font-weight: bold;">اسم المستخدم</label>
          <input type="text" id="edit-student-username" value="${this._escapeAttr(student?.username || "")}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" />
        </div>
        <div>
          <label style="display:block; font-size:0.9em; font-weight: bold; color: #dc2626;">كلمة المرور الجديدة</label>
          <input type="text" id="edit-student-password" placeholder="اتركها فارغة لعدم التغيير" autocomplete="off" style="width:100%; padding:8px; border:1px solid #fca5a5; border-radius:4px;" />
        </div>
      </div>

      <h4 style="margin-bottom: 10px; color: #475569;">البيانات الشخصية</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
        <div><label style="display:block; font-size:0.9em;">الاسم الكامل</label><input type="text" id="edit-student-name" value="${this._escapeAttr(student?.student_name || student?.full_name || "")}" required style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" /></div>
        <div><label style="display:block; font-size:0.9em;">البريد الإلكتروني</label><input type="email" id="edit-student-email" value="${this._escapeAttr(student?.email || "")}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" /></div>
        <div><label style="display:block; font-size:0.9em;">رقم الهاتف</label><input type="text" id="edit-student-phone" value="${this._escapeAttr(student?.phone || student?.student_phone || "")}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" /></div>
        <div><label style="display:block; font-size:0.9em;">العنوان</label><input type="text" id="edit-student-address" value="${this._escapeAttr(student?.address || "")}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" /></div>
      </div>

      <h4 style="margin-bottom: 10px; color: #475569;">البيانات الأكاديمية والطبية</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
        <div><label style="display:block; font-size:0.9em;">القسم</label><select id="edit-student-class" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">${classOptions}</select></div>
        <div><label style="display:block; font-size:0.9em;">ولي الأمر</label><select id="edit-student-parent" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">${parentOptions}</select></div>
        <div><label style="display:block; font-size:0.9em;">تاريخ الميلاد</label><input type="date" id="edit-student-dob" value="${this._escapeAttr(student?.date_of_birth || "")}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" /></div>
        <div><label style="display:block; font-size:0.9em;">تاريخ التسجيل</label><input type="date" id="edit-student-registration" value="${this._escapeAttr(student?.registration_date || "")}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" /></div>
        <div><label style="display:block; font-size:0.9em;">زمرة الدم</label><input type="text" id="edit-student-blood" value="${this._escapeAttr(student?.blood_group || "")}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" dir="ltr" /></div>
        <div>
          <label style="display:block; font-size:0.9em;">الحالة</label>
          <select id="edit-student-status" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
            <option value="active" ${student?.status === "active" ? "selected" : ""}>نشط</option>
            <option value="inactive" ${student?.status === "inactive" ? "selected" : ""}>غير نشط</option>
            <option value="suspended" ${student?.status === "suspended" ? "selected" : ""}>موقوف</option>
            <option value="graduated" ${student?.status === "graduated" ? "selected" : ""}>متخرج</option>
            <option value="withdrawn" ${student?.status === "withdrawn" ? "selected" : ""}>منسحب</option>
          </select>
        </div>
        <div style="grid-column: 1 / -1;"><label style="display:block; font-size:0.9em;">معلومات طبية</label><textarea id="edit-student-medical" rows="3" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">${this._escapeAttr(student?.medical_info || "")}</textarea></div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
        <button type="button" data-close-student-modal style="padding: 10px 20px; background: #e2e8f0; border: none; border-radius: 6px; cursor: pointer;">إلغاء</button>
        <button type="submit" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">حفظ التعديلات</button>
      </div>
    </form>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
};

ReceptionistUI.filterStudents = function(keyword) {
  const rows = document.querySelectorAll("[data-student-row]");
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  rows.forEach(row => {
    const text = row.getAttribute("data-search").toLowerCase();
    row.style.display = text.includes(normalizedKeyword) ? "" : "none";
  });
};
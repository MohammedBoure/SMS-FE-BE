// js/roles/receptionist/tabs/students.js

ReceptionistUI.renderStudents = function(studentsData, classesList, parentsList) {
  const main = document.getElementById("receptionist-main");
  const students = Array.isArray(studentsData) ? studentsData : (studentsData?.data || []);
  const align = this.start();

  const classOptions = classesList.map(c => `<option value="${this._escapeAttr(c.id)}">${this._escape(c.class_name)}</option>`).join("");
  const parentOptions = parentsList.map(p => {
    const pId = p.id || p.parent_id;
    return `<option value="${this._escapeAttr(pId)}">${this._escape(p.full_name || this.t("receptionist.parents.fallback", {}, "Parent"))}</option>`;
  }).join("");

  const rows = students.map(s => {
    const studentId = s.id || s.student_id;
    const name = s.student_name || s.full_name || this.t("receptionist.common.notSpecified", {}, "Not specified");
    return `
      <tr data-student-row data-search="${this._escapeAttr((name + " " + studentId).toLowerCase())}">
        <td>${this._escape(studentId)}</td>
        <td><strong>${this._escape(name)}</strong></td>
        <td>${this._escape(s.class_name || this.t("receptionist.common.notSpecified", {}, "Not specified"))}</td>
        <td><span class="status-badge status-${this._escapeAttr(s.status || "inactive")}">${this._statusLabel(s.status)}</span></td>
        <td>
          <div class="row-actions">
            <button class="view-student-details-btn" data-id="${this._escapeAttr(studentId)}">${this.t("receptionist.students.viewDetails", {}, "View details")}</button>
            <button class="edit-student-btn" data-id="${this._escapeAttr(studentId)}">${this.t("receptionist.students.edit", {}, "Edit")}</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  main.innerHTML = `
    <h2>${this.t("receptionist.students.title", {}, "Student Management")}</h2>

    <div class="form-container">
      <h3>${this.t("receptionist.students.registerTitle", {}, "Register New Student")}</h3>
      <form id="register-student-form">
        <input type="text" id="s-fullname" placeholder="${this._escapeAttr(this.t("receptionist.students.placeholders.fullName", {}, "Student full name"))}" required />
        <input type="text" id="s-username" placeholder="${this._escapeAttr(this.t("receptionist.students.placeholders.username", {}, "Login username"))}" required />
        <input type="password" id="s-password" placeholder="${this._escapeAttr(this.t("receptionist.common.password", {}, "Password"))}" required minlength="6" autocomplete="new-password" />
        <input type="email" id="s-email" placeholder="${this._escapeAttr(this.t("receptionist.students.placeholders.email", {}, "Email"))}" />
        <input type="text" id="s-phone" placeholder="${this._escapeAttr(this.t("receptionist.students.placeholders.phone", {}, "Phone number"))}" />
        <input type="text" id="s-address" placeholder="${this._escapeAttr(this.t("receptionist.students.placeholders.address", {}, "Student address"))}" />
        <input type="date" id="s-dob" required />
        <input type="text" id="s-blood-group" placeholder="${this._escapeAttr(this.t("receptionist.students.placeholders.blood", {}, "Blood group"))}" />
        <input type="text" id="s-medical-info" placeholder="${this._escapeAttr(this.t("receptionist.students.placeholders.medical", {}, "Medical information"))}" />
        <select id="s-parent-id" required><option value="">${this.t("receptionist.students.selectParent", {}, "Select parent...")}</option>${parentOptions}</select>
        <select id="s-class-id" required><option value="">${this.t("receptionist.students.selectClass", {}, "Select class...")}</option>${classOptions}</select>
        <button type="submit" style="grid-column: 1 / -1; margin-top: 10px;">${this.t("receptionist.students.submit", {}, "Register student")}</button>
      </form>
    </div>

    <section class="students-panel">
      <div class="students-panel__header">
        <input type="search" id="student-search-input" placeholder="${this._escapeAttr(this.t("receptionist.students.searchPlaceholder", {}, "Search by name or ID..."))}" autocomplete="off" />
      </div>
      <div class="table-shell">
        <table style="text-align: ${align};">
          <thead>
            <tr>
              <th>${this.t("receptionist.students.columns.id", {}, "ID")}</th>
              <th>${this.t("receptionist.students.columns.fullName", {}, "Full name")}</th>
              <th>${this.t("receptionist.students.columns.class", {}, "Class")}</th>
              <th>${this.t("receptionist.students.columns.status", {}, "Status")}</th>
              <th>${this.t("receptionist.students.columns.action", {}, "Action")}</th>
            </tr>
          </thead>
          <tbody id="students-table-body">${rows}</tbody>
        </table>
      </div>
    </section>
  `;
};

ReceptionistUI.showStudentDetailsModal = function(studentId, student, grades, attendance) {
  this.closeStudentDetailsModal();

  const safeGrades = Array.isArray(grades) ? grades : (grades?.data || []);
  const safeAttendance = Array.isArray(attendance) ? attendance : (attendance?.data || []);
  const studentName = student ? (student.student_name || student.full_name) : this.t("receptionist.common.notSpecified", {}, "Not specified");
  const align = this.start();

  const overlay = document.createElement("div");
  overlay.id = "student-details-modal";
  overlay.className = "student-modal";
  overlay.innerHTML = `
    <div class="student-modal__backdrop" data-close-student-modal></div>
    <div class="student-modal__dialog" dir="${this._escapeAttr(this.dir())}">
      <div class="student-modal__header">
        <div>
          <h3>${this.t("receptionist.studentDetails.title", { name: this._escape(studentName) }, "Complete file")}</h3>
          <p>${this.t("receptionist.studentDetails.studentId", {}, "Student ID:")} ${this._escape(studentId)}</p>
        </div>
        <button class="student-modal__close" data-close-student-modal>&times;</button>
      </div>
      <div class="student-modal__body">
        <section>
          <div class="student-detail-grid">
            ${this._detailItem("receptionist.studentDetails.loginUsername", student?.username || this.t("receptionist.common.unavailable", {}, "Unavailable"))}
            ${this._detailItem("receptionist.studentDetails.email", student?.email || this.t("receptionist.common.none", {}, "-"))}
            ${this._detailItem("receptionist.studentDetails.phone", student?.phone || student?.student_phone || this.t("receptionist.common.none", {}, "-"), true)}
            ${this._detailItem("receptionist.studentDetails.address", student?.address || this.t("receptionist.common.none", {}, "-"))}
            ${this._detailItem("receptionist.studentDetails.class", student?.class_name || this.t("receptionist.common.notSpecified", {}, "Not specified"))}
            ${this._detailItem("receptionist.studentDetails.parent", student?.parent_name || this.t("receptionist.common.notSpecified", {}, "Not specified"))}
            ${this._detailItem("receptionist.studentDetails.parentPhone", student?.parent_phone || this.t("receptionist.common.none", {}, "-"), true)}
            ${this._detailItem("receptionist.studentDetails.birthDate", student?.date_of_birth || this.t("receptionist.common.none", {}, "-"), true)}
            ${this._detailItem("receptionist.studentDetails.registrationDate", student?.registration_date || this.t("receptionist.common.none", {}, "-"), true)}
            ${this._detailItem("receptionist.studentDetails.blood", student?.blood_group || this.t("receptionist.common.none", {}, "-"), true)}
            ${this._detailItem("receptionist.studentDetails.status", this._statusLabel(student?.status))}
            ${this._detailItem("receptionist.studentDetails.medical", student?.medical_info || this.t("receptionist.studentDetails.noMedical", {}, "No medical information"))}
          </div>
        </section>

        <section>
          <h4>${this.t("receptionist.studentDetails.attendanceTitle", {}, "Absence Record")}</h4>
          ${safeAttendance.length > 0 ? `
            <ul class="student-modal-list">
              ${safeAttendance.map(a => `
                <li>
                  <span>${this._escape(a.date)} - ${this._statusLabel(a.status)}</span>
                  <strong>${a.is_justified ? this.t("receptionist.status.justified", {}, "Justified") : this.t("receptionist.status.unjustified", {}, "Unjustified")}</strong>
                </li>
              `).join("")}
            </ul>
          ` : `<p class="modal-empty">${this.t("receptionist.studentDetails.noAttendance", {}, "No absences are registered.")}</p>`}
        </section>

        <section>
          <h4>${this.t("receptionist.studentDetails.gradesTitle", {}, "Grade Report")}</h4>
          ${safeGrades.length > 0 ? `
            <div class="table-shell">
              <table style="text-align:${align};">
                <thead>
                  <tr>
                    <th>${this.t("receptionist.studentDetails.subject", {}, "Subject")}</th>
                    <th>${this.t("receptionist.studentDetails.grade", {}, "Grade")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${safeGrades.map(g => `
                    <tr>
                      <td>${this._escape(g.subject_name)}</td>
                      <td class="ltr-value"><strong>${this._escape(g.grade_value)}</strong> / ${this._escape(g.max_grade)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          ` : `<p class="modal-empty">${this.t("receptionist.studentDetails.noGrades", {}, "No grades are registered.")}</p>`}
        </section>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("modal-open");
};

ReceptionistUI.showStudentEditModal = function(student, classesList, parentsList) {
  this.closeStudentDetailsModal();

  const classOptions = [`<option value="">${this.t("receptionist.studentEdit.noClass", {}, "No class")}</option>`, ...classesList.map(c => `
    <option value="${this._escapeAttr(c.id)}" ${String(c.id) === String(student?.class_id || "") ? "selected" : ""}>${this._escape(c.class_name)}</option>
  `)].join("");
  const parentOptions = [`<option value="">${this.t("receptionist.studentEdit.noParent", {}, "No parent")}</option>`, ...parentsList.map(p => {
    const pId = p.id || p.parent_id;
    return `<option value="${this._escapeAttr(pId)}" ${String(pId) === String(student?.parent_id || "") ? "selected" : ""}>${this._escape(p.full_name || this.t("receptionist.parents.fallback", {}, "Parent"))}</option>`;
  })].join("");
  const name = student?.student_name || student?.full_name || "";

  const overlay = document.createElement("div");
  overlay.id = "student-details-modal";
  overlay.className = "student-modal";
  overlay.innerHTML = `
    <div class="student-modal__backdrop" data-close-student-modal></div>
    <div class="student-modal__dialog" dir="${this._escapeAttr(this.dir())}">
      <div class="student-modal__header">
        <h3>${this.t("receptionist.studentEdit.title", { name: this._escape(name) }, "Edit data")}</h3>
        <button class="student-modal__close" data-close-student-modal>&times;</button>
      </div>
      <form id="edit-student-form" data-student-id="${this._escapeAttr(student?.id || student?.student_id || "")}" data-user-id="${this._escapeAttr(student?.user_id || "")}" class="student-modal__body">
        <section>
          <h4>${this.t("receptionist.studentEdit.accountTitle", {}, "Login Data")}</h4>
          <div class="student-edit-grid">
            <label>${this.t("receptionist.common.username", {}, "Username")}<input type="text" id="edit-student-username" value="${this._escapeAttr(student?.username || "")}" /></label>
            <label>${this.t("receptionist.studentEdit.newPassword", {}, "New password")}<input type="text" id="edit-student-password" placeholder="${this._escapeAttr(this.t("receptionist.studentEdit.passwordPlaceholder", {}, "Leave empty to keep unchanged"))}" autocomplete="off" /></label>
          </div>
        </section>
        <section>
          <h4>${this.t("receptionist.studentEdit.personalTitle", {}, "Personal Data")}</h4>
          <div class="student-edit-grid">
            <label>${this.t("receptionist.common.fullName", {}, "Full name")}<input type="text" id="edit-student-name" value="${this._escapeAttr(name)}" required /></label>
            <label>${this.t("receptionist.common.email", {}, "Email")}<input type="email" id="edit-student-email" value="${this._escapeAttr(student?.email || "")}" /></label>
            <label>${this.t("receptionist.common.phone", {}, "Phone")}<input type="text" id="edit-student-phone" value="${this._escapeAttr(student?.phone || student?.student_phone || "")}" /></label>
            <label>${this.t("receptionist.common.address", {}, "Address")}<input type="text" id="edit-student-address" value="${this._escapeAttr(student?.address || "")}" /></label>
          </div>
        </section>
        <section>
          <h4>${this.t("receptionist.studentEdit.academicTitle", {}, "Academic and Medical Data")}</h4>
          <div class="student-edit-grid">
            <label>${this.t("receptionist.common.class", {}, "Class")}<select id="edit-student-class">${classOptions}</select></label>
            <label>${this.t("receptionist.common.parent", {}, "Parent")}<select id="edit-student-parent">${parentOptions}</select></label>
            <label>${this.t("receptionist.studentDetails.birthDate", {}, "Date of birth:")}<input type="date" id="edit-student-dob" value="${this._escapeAttr(student?.date_of_birth || "")}" /></label>
            <label>${this.t("receptionist.studentDetails.registrationDate", {}, "Registration date:")}<input type="date" id="edit-student-registration" value="${this._escapeAttr(student?.registration_date || "")}" /></label>
            <label>${this.t("receptionist.studentDetails.blood", {}, "Blood group:")}<input type="text" id="edit-student-blood" value="${this._escapeAttr(student?.blood_group || "")}" dir="ltr" /></label>
            <label>${this.t("receptionist.common.status", {}, "Status")}<select id="edit-student-status">
              ${["active", "inactive", "suspended", "graduated", "withdrawn"].map(status => `<option value="${status}" ${student?.status === status ? "selected" : ""}>${this._statusLabel(status)}</option>`).join("")}
            </select></label>
            <label class="wide-field">${this.t("receptionist.studentDetails.medical", {}, "Medical information:")}<textarea id="edit-student-medical" rows="3">${this._escape(student?.medical_info || "")}</textarea></label>
          </div>
        </section>
        <div class="student-modal__footer">
          <button type="button" class="secondary-btn" data-close-student-modal>${this.t("receptionist.common.cancel", {}, "Cancel")}</button>
          <button type="submit">${this.t("receptionist.common.saveChanges", {}, "Save changes")}</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("modal-open");
};

ReceptionistUI.filterStudents = function(keyword) {
  const rows = document.querySelectorAll("[data-student-row]");
  const normalizedKeyword = keyword.toLowerCase().trim();

  rows.forEach(row => {
    const text = row.getAttribute("data-search").toLowerCase();
    row.style.display = text.includes(normalizedKeyword) ? "" : "none";
  });
};

ReceptionistUI._detailItem = function(labelKey, value, ltr = false) {
  return `
    <div class="student-detail-item">
      <span>${this.t(labelKey, {}, labelKey)}</span>
      <strong ${ltr ? 'class="ltr-value"' : ""}>${this._escape(value)}</strong>
    </div>
  `;
};

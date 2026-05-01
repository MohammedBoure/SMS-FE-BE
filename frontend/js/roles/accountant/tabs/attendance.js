// js/roles/accountant/tabs/attendance.js

AccountantUI.renderAttendance = function(response) {
  const main = document.getElementById("accountant-main");
  main.style.padding = "20px 5%";

  const students = response?.data || response || [];
  const page = response?.page || 1;
  const total = response?.total || students.length;
  const limit = response?.limit || 50;
  const align = this.start();
  const end = this.end();

  const rows = students.map(s => {
    const sId = s.id || s.student_id;
    const name = s.full_name || s.student_name || this.t("accountant.common.notSpecified", {}, "Not specified");
    return `
      <tr class="attendance-student-row" data-search="${this._escapeAttr(name + " " + sId)}" style="border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: background 0.2s;">
        <td style="padding: 10px;">${this._escape(sId)}</td>
        <td style="padding: 10px;"><strong>${this._escape(name)}</strong></td>
        <td style="padding: 10px;">${this._escape(s.class_name || this.t("accountant.common.none", {}, "-"))}</td>
        <td style="padding: 10px; text-align: ${end};">
          <button class="fetch-attendance-btn" data-id="${this._escapeAttr(sId)}" style="background: #0f172a; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-family: inherit;">${this.t("accountant.attendance.viewButton", {}, "View absences")}</button>
        </td>
      </tr>
    `;
  }).join("");

  main.innerHTML = `
    <h2 style="color: #064e3b; margin-bottom: 20px;">${this.t("accountant.attendance.title", {}, "Student Attendance and Absence Monitor")}</h2>

    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; align-items: start;">
      <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="padding: 15px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <input type="text" id="attendance-live-search" placeholder="${this._escapeAttr(this.t("accountant.attendance.searchPlaceholder", {}, "Search for a student on this page..."))}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; font-family: inherit;" />
        </div>
        <div style="max-height: 500px; overflow-y: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: ${align}; font-size: 0.9em;">
            <tbody id="attendance-students-tbody">
              ${rows || `<tr><td colspan="4" style="text-align:center; padding:15px;">${this.t("accountant.attendance.noStudents", {}, "No students found.")}</td></tr>`}
            </tbody>
          </table>
        </div>
        ${this.renderPagination(page, total, limit, "attendance")}
      </div>

      <div id="attendance-results" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 200px; display: flex; justify-content: center; align-items: center;">
        <p style="color: #64748b;">${this.t("accountant.attendance.selectHint", {}, "Select a student from the list to view the absence record here.")}</p>
      </div>
    </div>
  `;
};

AccountantUI.renderAttendanceReport = function(studentId, attendanceRecords) {
  const container = document.getElementById("attendance-results");
  container.style.display = "block";
  const align = this.start();

  if (!attendanceRecords || attendanceRecords.length === 0) {
    container.innerHTML = `<div style="background: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; text-align: center;">${this.t("accountant.attendance.cleanRecord", {}, "The student record is clean. No absences are registered.")}</div>`;
    return;
  }

  const total = attendanceRecords.length;
  const unjustified = attendanceRecords.filter(a => !a.is_justified && a.status === "absent").length;

  const rows = attendanceRecords.map(a => {
    const isProblem = a.status === "absent" && !a.is_justified;
    return `
      <tr style="border-bottom: 1px solid #e2e8f0; background: ${isProblem ? '#fef2f2' : 'transparent'};">
        <td style="padding: 10px; font-weight: bold;">${this._escape(a.date)}</td>
        <td style="padding: 10px;">${this._translateStatus(a.status)}</td>
        <td style="padding: 10px;">
          <span style="color: ${a.is_justified ? '#166534' : '#991b1b'}; font-weight: bold;">
            ${a.is_justified ? this.t("accountant.status.justified", {}, "Justified") : this.t("accountant.status.unjustified", {}, "Unjustified")}
          </span>
        </td>
        <td style="padding: 10px;">${this._escape(a.justification_reason || this.t("accountant.common.none", {}, "-"))}</td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <h3 style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${this.t("accountant.attendance.reportTitle", {}, "Absence Report")}</h3>
    <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
      <div style="background: #f8fafc; padding: 10px; border-radius: 6px; flex: 1; min-width: 160px; text-align: center; border: 1px solid #e2e8f0;">
        <h5 style="margin: 0; color: #64748b;">${this.t("accountant.attendance.totalRecords", {}, "Total records")}</h5>
        <span style="font-size: 1.2rem; font-weight: bold;">${total}</span>
      </div>
      <div style="background: #fef2f2; padding: 10px; border-radius: 6px; flex: 1; min-width: 160px; text-align: center; border: 1px solid #fca5a5;">
        <h5 style="margin: 0; color: #991b1b;">${this.t("accountant.attendance.unjustifiedAbsences", {}, "Unjustified absences")}</h5>
        <span style="font-size: 1.2rem; font-weight: bold; color: #991b1b;">${unjustified}</span>
      </div>
    </div>
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: ${align}; font-size: 0.9em;">
        <thead style="background: #f1f5f9;">
          <tr>
            <th style="padding: 8px;">${this.t("accountant.attendance.columns.date", {}, "Date")}</th>
            <th style="padding: 8px;">${this.t("accountant.attendance.columns.status", {}, "Status")}</th>
            <th style="padding: 8px;">${this.t("accountant.attendance.columns.justification", {}, "Justification")}</th>
            <th style="padding: 8px;">${this.t("accountant.attendance.columns.notes", {}, "Notes")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

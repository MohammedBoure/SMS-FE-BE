// js/roles/receptionist/tabs/parents.js

ReceptionistUI.renderParents = function(parentsData) {
  const main = document.getElementById("receptionist-main");
  const parents = Array.isArray(parentsData) ? parentsData : (parentsData?.data || []);

  let html = `
    <h2>${this.t("receptionist.parents.title", {}, "Parent Management")}</h2>
    <div class="form-container">
      <h3>${this.t("receptionist.parents.registerTitle", {}, "Register New Parent")}</h3>
      <form id="register-parent-form">
        <input type="text" id="p-fullname" placeholder="${this._escapeAttr(this.t("receptionist.common.fullName", {}, "Full name"))}" required />
        <input type="text" id="p-username" placeholder="${this._escapeAttr(this.t("receptionist.common.username", {}, "Username"))}" required />
        <input type="email" id="p-email" placeholder="${this._escapeAttr(this.t("receptionist.common.email", {}, "Email"))}" />
        <input type="text" id="p-phone" placeholder="${this._escapeAttr(this.t("receptionist.common.phone", {}, "Phone number"))}" required />
        <button type="submit">${this.t("receptionist.parents.submit", {}, "Register parent")}</button>
      </form>
    </div>
  `;

  if (!parents || parents.length === 0) {
    html += `<p>${this.t("receptionist.parents.empty", {}, "No parents are registered.")}</p>`;
  } else {
    const rows = parents.map(p => `
      <tr>
        <td>${this._escape(p.parent_id || p.id)}</td>
        <td><strong>${this._escape(p.full_name || this.t("receptionist.parents.fallback", {}, "Parent"))}</strong></td>
        <td class="ltr-value">${this._escape(p.phone || this.t("receptionist.common.none", {}, "-"))}</td>
      </tr>
    `).join("");
    html += `
      <table>
        <thead>
          <tr>
            <th>${this.t("receptionist.common.id", {}, "ID")}</th>
            <th>${this.t("receptionist.common.fullName", {}, "Full name")}</th>
            <th>${this.t("receptionist.common.phone", {}, "Phone number")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  main.innerHTML = html;
};

// js/roles/receptionist/tabs/search.js

ReceptionistUI.renderSearch = function() {
  const main = document.getElementById("receptionist-main");
  main.innerHTML = `
    <h2>${this.t("receptionist.search.title", {}, "Global System Search")}</h2>
    <div class="form-container inline-form">
      <input type="text" id="search-input" placeholder="${this._escapeAttr(this.t("receptionist.search.placeholder", {}, "Search by name, username, or email..."))}" />
      <button id="search-btn">${this.t("receptionist.common.search", {}, "Search")}</button>
    </div>
    <div id="search-results"></div>
  `;

  document.getElementById("search-btn").addEventListener("click", async () => {
    const keyword = document.getElementById("search-input").value.trim();
    const resultsContainer = document.getElementById("search-results");

    if (keyword.length < 2) {
      resultsContainer.innerHTML = `<p class="error-text">${this.t("receptionist.search.minLength", {}, "Please enter at least two characters to search.")}</p>`;
      return;
    }

    resultsContainer.innerHTML = `<p>${this.t("receptionist.search.searching", {}, "Searching...")}</p>`;

    try {
      const response = await ReceptionistServices.searchUsers(keyword);
      const results = Array.isArray(response) ? response : (response?.data || []);

      if (!results || results.length === 0) {
        resultsContainer.innerHTML = `<p>${this.t("receptionist.search.noResults", {}, "No results found.")}</p>`;
        return;
      }

      const rows = results.map(u => `
        <tr>
          <td>${this._escape(u.id)}</td>
          <td><strong>${this._escape(u.full_name)}</strong></td>
          <td>${this._escape(u.username)}</td>
          <td>${this._escape(this._translateRole(u.role_name))}</td>
        </tr>
      `).join("");

      resultsContainer.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>${this.t("receptionist.search.columns.id", {}, "ID")}</th>
              <th>${this.t("receptionist.search.columns.fullName", {}, "Full name")}</th>
              <th>${this.t("receptionist.search.columns.username", {}, "Username")}</th>
              <th>${this.t("receptionist.search.columns.role", {}, "Role")}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } catch (error) {
      resultsContainer.innerHTML = `<p class="error-text">${this.t("receptionist.search.failed", { message: this._escape(error.message) }, "An error occurred.")}</p>`;
    }
  });
};

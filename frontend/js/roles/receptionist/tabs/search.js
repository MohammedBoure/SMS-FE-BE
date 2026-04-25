// js/roles/receptionist/tabs/search.js

ReceptionistUI.renderSearch = function() {
  const main = document.getElementById("receptionist-main");
  main.innerHTML = `
    <h2>البحث الشامل في النظام</h2>
    <div class="form-container inline-form">
      <input type="text" id="search-input" placeholder="ابحث بالاسم، اسم المستخدم، أو البريد..." />
      <button id="search-btn">بحث</button>
    </div>
    <div id="search-results"></div>
  `;

  document.getElementById("search-btn").addEventListener("click", async () => {
    const keyword = document.getElementById("search-input").value.trim();
    const resultsContainer = document.getElementById("search-results");

    if (keyword.length < 2) {
      resultsContainer.innerHTML = "<p class='error-text'>الرجاء إدخال حرفين على الأقل للبحث.</p>";
      return;
    }

    resultsContainer.innerHTML = "<p>جاري البحث...</p>";

    try {
      const response = await ReceptionistServices.searchUsers(keyword);
      // استخراج المصفوفة بأمان
      const results = Array.isArray(response) ? response : (response?.data || []);

      if (!results || results.length === 0) {
        resultsContainer.innerHTML = "<p>لم يتم العثور على أي نتائج.</p>";
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
          <thead><tr><th>المعرف</th><th>الاسم الكامل</th><th>اسم المستخدم</th><th>الدور</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } catch (error) {
      resultsContainer.innerHTML = `<p class='error-text'>حدث خطأ: ${this._escape(error.message)}</p>`;
    }
  });
};
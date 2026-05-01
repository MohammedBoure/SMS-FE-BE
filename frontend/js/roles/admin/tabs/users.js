// frontend/js/roles/admin/tabs/users.js

/**
 * واجهة إدارة المستخدمين الشاملة
 */
AdminUI.renderUsersTab = function(response) {
    const main = this.prepareMain("إدارة المستخدمين");
    
    // شريط الأدوات والنافذة المنبثقة
    main.innerHTML = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div class="admin-toolbar-search" style="display: flex; gap: 10px; flex: 1;">
                <input type="text" id="user-search-input" placeholder="ابحث عن مستخدم (حرفين على الأقل)..." onkeyup="if(event.key === 'Enter') AdminUI.searchUsers()" style="padding: 10px; width: 300px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none;">
                <button onclick="AdminUI.searchUsers()" style="background: #2563eb; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; transition: 0.2s;">🔍 بحث</button>
                <button onclick="AdminUI.loadUsers()" style="background: #64748b; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; transition: 0.2s;" title="إعادة تحميل القائمة">🔄</button>
            </div>
            <div>
                <button onclick="AdminUI.showUserModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    + إضافة مستخدم جديد
                </button>
            </div>
        </div>

        <div class="admin-mobile-table" style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; min-height: 300px;">
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
                <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <tr>
                        <th style="padding: 12px 15px; color: #334155;">الرقم</th>
                        <th style="padding: 12px 15px; color: #334155;">الاسم الكامل</th>
                        <th style="padding: 12px 15px; color: #334155;">اسم المستخدم</th>
                        <th style="padding: 12px 15px; color: #334155;">معلومات التواصل</th>
                        <th style="padding: 12px 15px; color: #334155;">الحالة</th>
                        <th style="padding: 12px 15px; color: #334155; text-align: center;">الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="users-table-body">
                    <tr><td class="admin-empty-cell" colspan="6" style="text-align: center; padding: 30px; color: #64748b;">جاري التحميل...</td></tr>
                </tbody>
            </table>
        </div>

        <div id="user-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
            <div style="background: white; width: 500px; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-height: 90vh; overflow-y: auto;">
                <h3 id="user-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">إضافة مستخدم جديد</h3>
                
                <input type="hidden" id="modal-user-id">

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em;">الاسم الكامل *</label>
                        <input type="text" id="modal-user-fullname" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em;">الرتبة (Role) *</label>
                        <select id="modal-user-role" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; background: white;">
                            <option value="" disabled selected>Select Role</option>
                            <option value="1">admin</option>
                            <option value="2">receptionist</option>
                            <option value="3">student</option>
                            <option value="4">parent</option>
                            <option value="5">accountant</option>
                            <option value="6">teacher</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em;">اسم المستخدم (للدخول) *</label>
                        <input type="text" id="modal-user-username" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em;">كلمة المرور *</label>
                        <input type="text" id="modal-user-password" placeholder="أدخل كلمة المرور" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                        <small id="password-hint" style="color: #64748b; font-size: 0.8em; display: none;">اتركه فارغاً إذا كنت لا تريد تغييره.</small>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em;">البريد الإلكتروني</label>
                        <input type="email" id="modal-user-email" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em;">رقم الهاتف</label>
                        <input type="text" id="modal-user-phone" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                    </div>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em;">العنوان</label>
                    <input type="text" id="modal-user-address" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                </div>

                <div style="margin-top: 15px; display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="modal-user-active" checked style="width: 18px; height: 18px; cursor: pointer;">
                    <label for="modal-user-active" style="font-weight: bold; cursor: pointer;">حساب نشط (يمكنه تسجيل الدخول)</label>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px;">
                    <button onclick="AdminUI.closeUserModal()" style="padding: 10px 15px; border: none; background: #e2e8f0; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">إلغاء</button>
                    <button onclick="AdminUI.submitUser()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;">حفظ البيانات</button>
                </div>
            </div>
        </div>
    `;

    // تعبئة الجدول بالبيانات المبدئية الممررة للدالة
    this.populateUsersTable(response);
};

/**
 * تعبئة جدول المستخدمين بالبيانات
 */
AdminUI.populateUsersTable = function(response) {
    const tbody = document.getElementById("users-table-body");
    const users = response.data || response || [];

    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td class="admin-empty-cell" colspan="6" style="text-align:center; padding: 40px; color: #64748b;">لا يوجد مستخدمين لعرضهم.</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(u => {
        // تحديد لون وتسمية الحالة
        const statusColor = u.is_active ? '#10b981' : '#ef4444';
        const statusText = u.is_active ? 'نشط' : 'معطل';
        const statusActionIcon = u.is_active ? '🚫' : '✅';
        const statusActionTitle = u.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب';

        return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td data-label="الرقم" style="padding: 12px 15px; color: #64748b; font-weight: bold;">#${this._escape(u.id)}</td>
            <td data-label="الاسم الكامل" style="padding: 12px 15px;">
                <div style="font-weight: bold; color: #0f172a;">${this._escape(u.full_name)}</div>
                <div style="font-size: 0.85em; color: #64748b;">رتبة ID: ${this._escape(u.role_id)}</div>
            </td>
            <td data-label="اسم المستخدم" style="padding: 12px 15px; color: #0369a1; font-weight: bold;">@${this._escape(u.username)}</td>
            <td data-label="التواصل" style="padding: 12px 15px; font-size: 0.9em; color: #475569;">
                <div class="admin-contact-line">${this.icon("phone", "inline-svg-icon")}<span>${this._escape(u.phone || '-')}</span></div>
                <div class="admin-contact-line">${this.icon("mail", "inline-svg-icon")}<span>${this._escape(u.email || '-')}</span></div>
            </td>
            <td data-label="الحالة" style="padding: 12px 15px;">
                <span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">
                    ${statusText}
                </span>
            </td>
            <td class="admin-actions-cell" data-label="الإجراءات" style="padding: 12px 15px; text-align: center;">
                <button onclick="AdminUI.toggleUserStatus(${u.id}, ${u.is_active})" title="${statusActionTitle}" style="background: none; border: none; cursor: pointer; font-size: 1.2em; margin: 0 3px;">${statusActionIcon}</button>
                <button onclick='AdminUI.showUserModal(${JSON.stringify(u).replace(/'/g, "&apos;")})' title="تعديل" style="background: none; border: none; cursor: pointer; font-size: 1.2em; color: #eab308; margin: 0 3px;">✏️</button>
                <button onclick="AdminUI.deleteUserItem(${u.id})" title="حذف" style="background: none; border: none; cursor: pointer; font-size: 1.2em; color: #ef4444; margin: 0 3px;">🗑️</button>
            </td>
        </tr>`;
    }).join("");
};

// --- دوال الاتصال بالخادم والتفاعل ---

AdminUI.loadUsers = async function() {
    try {
        document.getElementById("users-table-body").innerHTML = `<tr><td class="admin-empty-cell" colspan="6" style="text-align:center; padding: 20px;">جاري التحديث... ⏳</td></tr>`;
        const response = await Api.get("/users/");
        this.populateUsersTable(response);
    } catch (err) {
        alert("فشل تحميل المستخدمين: " + err.message);
    }
};

AdminUI.searchUsers = async function() {
    const keyword = document.getElementById("user-search-input").value.trim();
    if (keyword.length > 0 && keyword.length < 2) {
        alert("يرجى إدخال حرفين على الأقل للبحث.");
        return;
    }
    
    if (keyword.length === 0) {
        return this.loadUsers(); // إذا كان الحقل فارغاً، اجلب كل شيء
    }

    try {
        document.getElementById("users-table-body").innerHTML = `<tr><td class="admin-empty-cell" colspan="6" style="text-align:center; padding: 20px;">جاري البحث... 🔍</td></tr>`;
        const response = await Api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);
        this.populateUsersTable(response);
    } catch (err) {
        alert("فشل البحث: " + err.message);
    }
};

AdminUI.toggleUserStatus = async function(userId, currentStatus) {
    const newStatus = !currentStatus;
    const confirmMsg = newStatus ? "هل تريد تفعيل هذا الحساب؟" : "هل تريد تعطيل هذا الحساب ومنعه من الدخول؟";
    
    if (!confirm(confirmMsg)) return;

    try {
        await Api.patch(`/users/${userId}/status`, { is_active: newStatus });
        this.loadUsers(); // إعادة تحميل القائمة لتحديث الواجهة
    } catch (err) {
        alert("فشل تغيير الحالة: " + err.message);
    }
};

AdminUI.deleteUserItem = async function(userId) {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم بشكل نهائي؟ (هذا الإجراء لا يمكن التراجع عنه)")) return;
    try {
        await AdminRole.deleteItem('/users', userId);
        this.loadUsers();
    } catch (err) {
        console.error(err);
    }
};

AdminUI.showUserModal = function(user = null) {
    const modal = document.getElementById("user-modal");
    const title = document.getElementById("user-modal-title");
    const passHint = document.getElementById("password-hint");
    
    // Reset all form fields
    document.getElementById("modal-user-id").value = "";
    document.getElementById("modal-user-fullname").value = "";
    document.getElementById("modal-user-username").value = "";
    document.getElementById("modal-user-password").value = "";
    document.getElementById("modal-user-role").value = "";
    document.getElementById("modal-user-email").value = "";
    document.getElementById("modal-user-phone").value = "";
    document.getElementById("modal-user-address").value = "";
    document.getElementById("modal-user-active").checked = true;

    if (user) {
        // Edit Mode
        title.innerText = "Edit User";
        passHint.style.display = "block";

        document.getElementById("modal-user-id").value = user.id;
        document.getElementById("modal-user-fullname").value = user.full_name || "";
        document.getElementById("modal-user-username").value = user.username || "";
        document.getElementById("modal-user-role").value = user.role_id || "";
        document.getElementById("modal-user-email").value = user.email || "";
        document.getElementById("modal-user-phone").value = user.phone || "";
        document.getElementById("modal-user-address").value = user.address || "";
        document.getElementById("modal-user-active").checked = user.is_active;
    } else {
        // Add Mode
        title.innerText = "Add New User";
        passHint.style.display = "none";
    }

    modal.style.display = "flex";
};

AdminUI.closeUserModal = function() {
    document.getElementById("user-modal").style.display = "none";
};

AdminUI.submitUser = async function() {
    const id = document.getElementById("modal-user-id").value;
    const fullName = document.getElementById("modal-user-fullname").value.trim();
    const username = document.getElementById("modal-user-username").value.trim();
    const password = document.getElementById("modal-user-password").value;
    const roleId = document.getElementById("modal-user-role").value;
    
    // Validate required fields
    if (!fullName || !username || !roleId) {
        alert("Please fill in all required fields (Full Name, Username, and Role).");
        return;
    }

    // Password is required for new users
    if (!id && !password) {
        alert("Please provide a password for the new user.");
        return;
    }

    const payload = {
        full_name: fullName,
        username: username,
        role_id: parseInt(roleId),
        email: document.getElementById("modal-user-email").value.trim() || null,
        phone: document.getElementById("modal-user-phone").value.trim() || null,
        address: document.getElementById("modal-user-address").value.trim() || null,
        is_active: document.getElementById("modal-user-active").checked
    };

    if (password) {
        payload.password = password;
    }

    try {
        if (id) {
            await Api.put(`/users/${id}`, payload);
            alert("User updated successfully.");
        } else {
            await Api.post("/users/", payload);
            alert("User created successfully.");
        }
        
        this.closeUserModal();
        this.loadUsers();

    } catch (err) {
        alert("Error saving data: " + (err.message || "Please check for duplicate usernames."));
    }
};

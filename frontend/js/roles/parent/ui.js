// js/roles/parent/ui.js

const ParentUI = {
  SECTIONS: ["children", "grades", "attendance", "fees", "notifications"],

  renderHeader(userProfile) {
    const header = document.getElementById("parent-header");
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px;">
        <h1 style="margin:0;">مرحباً بك: ${this._escape(userProfile ? userProfile.full_name : '...')}</h1>
        <button id="logout-btn" style="background: #ef4444; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">تسجيل خروج</button>
      </div>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  },

  renderNav(activeSection) {
    const nav = document.getElementById("parent-nav");
    nav.innerHTML = this.SECTIONS.map(s =>
      `<button class="nav-btn${activeSection === s ? " active" : ""}" data-section="${s}" style="padding: 10px 15px; margin-left: 5px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background: ${activeSection === s ? '#e0f2fe' : 'white'};">${this._translate(s)}</button>`
    ).join("");
  },

  renderLoading() {
    document.getElementById("parent-main").innerHTML = "<h3 style='padding: 20px;'>جاري جلب البيانات...</h3>";
  },

  renderError(msg) {
    document.getElementById("parent-main").innerHTML = `<h3 style="color: #ef4444; padding: 20px;">خطأ: ${this._escape(msg)}</h3>`;
  },

  renderChildren(children) {
    const main = document.getElementById("parent-main");
    if (!children || children.length === 0) {
      main.innerHTML = "<h2>أبنائي</h2><p style='color: #64748b;'>لا يوجد أبناء مسجلين بحسابك حالياً. يرجى مراجعة الإدارة.</p>";
      return;
    }
    const rows = children.map(c => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px;"><strong>${this._escape(c.student_name || c.full_name)}</strong></td>
        <td style="padding: 12px;">${this._escape(c.class_name)} (${this._escape(c.level)})</td>
        <td style="padding: 12px; direction: ltr; text-align: right;">${this._escape(c.date_of_birth)}</td>
        <td style="padding: 12px;"><span style="background: ${c.status === 'active' ? '#dcfce7' : '#f1f5f9'}; padding: 4px 8px; border-radius: 4px;">${c.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">أبنائي المسجلين</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead style="background: #f1f5f9;"><tr><th style="padding:12px;">الاسم</th><th style="padding:12px;">القسم (المستوى)</th><th style="padding:12px;">تاريخ الميلاد</th><th style="padding:12px;">الحالة</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderGrades(grades) {
    const main = document.getElementById("parent-main");
    if (!grades || grades.length === 0) {
      main.innerHTML = "<h2>العلامات والتقييمات</h2><p style='color: #64748b;'>لا توجد علامات مرصودة حتى الآن.</p>";
      return;
    }
    const rows = grades.map(g => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px;"><strong>${this._escape(g.child_name)}</strong></td>
        <td style="padding: 12px;">${this._escape(g.subject_name)}</td>
        <td style="padding: 12px;">${this._escape(g.assessment_title)} <span style="color:#64748b; font-size:0.85em;">(${g.assessment_type === 'exam' ? 'امتحان' : 'واجب'})</span></td>
        <td style="padding: 12px; direction: ltr; text-align: right; font-weight: bold; color: #10b981;">${this._escape(g.grade_value)} / ${this._escape(g.max_grade)}</td>
        <td style="padding: 12px;">${this._escape(g.teacher_name)}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">العلامات والتقييمات</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead style="background: #f1f5f9;"><tr><th style="padding:12px;">الابن</th><th style="padding:12px;">المادة</th><th style="padding:12px;">التقييم</th><th style="padding:12px;">العلامة</th><th style="padding:12px;">الأستاذ</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderAttendance(records) {
    const main = document.getElementById("parent-main");
    if (!records || records.length === 0) {
      main.innerHTML = "<h2>سجل الغياب</h2><p style='color: #64748b;'>سجل أبنائك نظيف، لا توجد غيابات.</p>";
      return;
    }
    const rows = records.map(r => {
      let statusAr = r.status === 'present' ? 'حاضر' : (r.status === 'absent' ? 'غائب' : 'متأخر');
      let statusColor = r.status === 'absent' ? 'color: #ef4444;' : 'color: #f59e0b;';
      return `
      <tr style="border-bottom: 1px solid #e2e8f0; background: ${r.status === 'absent' ? '#fef2f2' : 'transparent'};">
        <td style="padding: 12px;"><strong>${this._escape(r.child_name)}</strong></td>
        <td style="padding: 12px; direction: ltr; text-align: right; font-weight:bold;">${this._escape(r.date)}</td>
        <td style="padding: 12px; font-weight:bold; ${statusColor}">${statusAr}</td>
        <td style="padding: 12px;">${r.is_justified ? '✔️ نعم (' + this._escape(r.justification_reason) + ')' : '❌ لا'}</td>
      </tr>
    `;
    }).join("");
    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">سجل الغياب والتأخر</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead style="background: #f1f5f9;"><tr><th style="padding:12px;">الابن</th><th style="padding:12px;">التاريخ</th><th style="padding:12px;">الحالة</th><th style="padding:12px;">مُبرر؟</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderFees(fees) {
    const main = document.getElementById("parent-main");
    if (!fees || fees.length === 0) {
      main.innerHTML = "<h2>الوضعية المالية</h2><p style='color: #64748b;'>الوضعية مسواة، لا توجد ديون مستحقة.</p>";
      return;
    }
    const rows = fees.map(f => {
      const isPaid = f.status === 'paid' || f.status === 'completed';
      return `
      <tr style="border-bottom: 1px solid #e2e8f0; background: ${isPaid ? 'transparent' : '#fef2f2'};">
        <td style="padding: 12px;"><strong>${this._escape(f.child_name)}</strong></td>
        <td style="padding: 12px;">${this._escape(f.fee_type)} ${f.program_name ? '<span style="color:#64748b;">('+this._escape(f.program_name)+')</span>' : ''}</td>
        <td style="padding: 12px; font-weight: bold;">${this._escape(f.amount_due || f.net_amount)} دج</td>
        <td style="padding: 12px; direction: ltr; text-align: right;">${this._escape(f.due_date)}</td>
        <td style="padding: 12px; color: ${isPaid ? '#10b981' : '#ef4444'}; font-weight: bold;">${isPaid ? 'مسددة ✔️' : 'غير مسددة ❌'}</td>
      </tr>
    `}).join("");
    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">المطالبات والرسوم المالية</h2>
      <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
          <thead style="background: #f1f5f9;"><tr><th style="padding:12px;">الابن</th><th style="padding:12px;">نوع الرسم</th><th style="padding:12px;">المبلغ</th><th style="padding:12px;">تاريخ الاستحقاق</th><th style="padding:12px;">الحالة</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },

  renderNotifications(notifications) {
    const main = document.getElementById("parent-main");
    if (!notifications || notifications.length === 0) {
      main.innerHTML = "<h2>الإشعارات والإنذارات</h2><p style='color: #64748b;'>صندوق الإشعارات فارغ.</p>";
      return;
    }
    const items = notifications.map(n => {
      const dateStr = n.created_at ? new Date(n.created_at).toLocaleString('ar-DZ') : '';
      return `
      <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-right: 4px solid #eab308; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <strong style="display:block; margin-bottom:5px; font-size:1.1rem; color: #0f172a;">${this._escape(n.title)}</strong>
        <p style="margin:0; color:#334155; line-height: 1.6;">${this._escape(n.message)}</p>
        <small style="color:#94a3b8; display:block; margin-top:10px; direction: ltr; text-align: right;">${dateStr}</small>
      </div>
    `}).join("");
    main.innerHTML = `
      <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">الإشعارات الواردة</h2>
      <div>${items}</div>
    `;
  },

  // === الدوال المساعدة (Helpers) ===
  _translate(str) {
    const map = {
      children: "أبنائي", grades: "العلامات", attendance: "الغياب", 
      fees: "المالية", notifications: "الإشعارات", messages: "الرسائل"
    };
    return map[str] || str;
  },
  _formatValue(value) { 
    return value === null || value === undefined || value === "" ? "-" : value; 
  },
  _escape(value) {
    return String(this._formatValue(value)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
};
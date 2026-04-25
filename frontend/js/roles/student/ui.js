// js/roles/student/ui.js

const StudentUI = {
  SECTIONS: ["schedule", "assessments", "grades", "attendance", "resources", "fees", "notifications"],

  renderHeader(userProfile) {
    const header = document.getElementById("student-header");
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px;">
        <h1>مرحباً: ${userProfile ? userProfile.full_name : '...'}</h1>
        <button id="logout-btn">تسجيل خروج</button>
      </div>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => Auth.logout());
  },

  renderNav(activeSection) {
    const nav = document.getElementById("student-nav");
    nav.innerHTML = this.SECTIONS.map(s =>
      `<button class="nav-btn${activeSection === s ? " active" : ""}" data-section="${s}">${this._translate(s)}</button>`
    ).join("");
  },

  renderLoading() {
    document.getElementById("student-main").innerHTML = "<h3>جاري التحميل...</h3>";
  },

  renderError(msg) {
    document.getElementById("student-main").innerHTML = `<h3 style="color: red;">خطأ: ${msg}</h3>`;
  },

  renderSchedule(scheduleData) {
    const schedule = Array.isArray(scheduleData) ? scheduleData : (scheduleData?.data || []);
    const main = document.getElementById("student-main");
    if (!schedule || schedule.length === 0) {
      main.innerHTML = "<h2>الجدول الزمني</h2><p>لم يتم إعداد الجدول الزمني لقسمك بعد.</p>";
      return;
    }
    const rows = schedule.map(s => `
      <tr>
        <td><strong>${this._translateDay(s.day_of_week)}</strong></td>
        <td><span style="direction:ltr; display:inline-block;">${s.start_time} - ${s.end_time}</span></td>
        <td>${s.subject_name}</td>
        <td>${s.teacher_name}</td>
        <td>${s.room_number || "غير محدد"}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>الجدول الزمني الأسبوعي</h2>
      <table>
        <thead><tr><th>اليوم</th><th>التوقيت</th><th>المادة</th><th>الأستاذ</th><th>القاعة</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderAssessments(assessmentsData) {
    const assessments = Array.isArray(assessmentsData) ? assessmentsData : (assessmentsData?.data || []);
    const main = document.getElementById("student-main");
    if (!assessments || assessments.length === 0) {
      main.innerHTML = "<h2>الامتحانات والفروض القادمة</h2><p>لا توجد امتحانات مبرمجة حالياً.</p>";
      return;
    }
    const rows = assessments.map(a => `
      <tr>
        <td>${a.subject_name}</td>
        <td>${a.title} (${a.type === 'exam' ? 'امتحان' : 'واجب'})</td>
        <td><strong style="color:#e11d48;">${a.due_date || "غير محدد"}</strong></td>
        <td>${a.max_grade}</td>
        <td>${a.teacher_name}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>الامتحانات والفروض القادمة</h2>
      <table>
        <thead><tr><th>المادة</th><th>عنوان التقييم</th><th>تاريخ الإجراء</th><th>العلامة القصوى</th><th>الأستاذ</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderGrades(gradesData) {
    const grades = Array.isArray(gradesData) ? gradesData : (gradesData?.data || []);
    const main = document.getElementById("student-main");
    if (!grades || grades.length === 0) {
      main.innerHTML = "<h2>كشف النقاط</h2><p>لا توجد علامات مرصودة لك حتى الآن.</p>";
      return;
    }
    const rows = grades.map(g => `
      <tr>
        <td><strong>${g.subject_name}</strong></td>
        <td>${g.assessment_title} (${g.assessment_type === 'exam' ? 'امتحان' : 'واجب'})</td>
        <td style="direction: ltr; text-align: right; font-weight: bold; color: ${g.grade_value >= (g.max_grade/2) ? 'green' : 'red'};">${g.grade_value} / ${g.max_grade}</td>
        <td>${g.teacher_name}</td>
        <td>${g.teacher_remarks || "-"}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>كشف النقاط والعلامات</h2>
      <table>
        <thead><tr><th>المادة</th><th>التقييم</th><th>العلامة</th><th>الأستاذ</th><th>ملاحظات</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderAttendance(recordsData) {
    const records = Array.isArray(recordsData) ? recordsData : (recordsData?.data || []);
    const main = document.getElementById("student-main");
    if (!records || records.length === 0) {
      main.innerHTML = "<h2>سجل الغياب</h2><p>سجلك نظيف، لا يوجد غيابات.</p>";
      return;
    }
    const rows = records.map(r => {
      let statusAr = r.status === 'present' ? 'حاضر' : (r.status === 'absent' ? 'غائب' : 'متأخر');
      let statusColor = r.status === 'absent' ? 'color: red;' : 'color: green;';
      return `
      <tr>
        <td>${r.date}</td>
        <td style="font-weight:bold; ${statusColor}">${statusAr}</td>
        <td>${r.is_justified ? 'نعم (' + (r.justification_reason || '') + ')' : 'لا'}</td>
      </tr>
    `;
    }).join("");
    main.innerHTML = `
      <h2>سجل الحضور والغياب</h2>
      <table>
        <thead><tr><th>التاريخ</th><th>الحالة</th><th>مُبرر؟</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderResources(resourcesData) {
    const resources = Array.isArray(resourcesData) ? resourcesData : (resourcesData?.data || []);
    const main = document.getElementById("student-main");
    if (!resources || resources.length === 0) {
      main.innerHTML = "<h2>الدروس والموارد</h2><p>لا توجد ملفات مرفوعة حالياً.</p>";
      return;
    }
    const items = resources.map(r => `
      <div style="background: #fff; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-right: 4px solid #0ea5e9; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
        <div>
            <strong style="display:block; font-size:1.1rem; color: #0f172a;">${r.title}</strong>
            <small style="color: #64748b;">النوع: ${r.resource_type} | الحجم: ${r.file_size_mb} MB</small>
            ${r.description ? `<p style="margin: 5px 0 0 0; color: #475569; font-size: 0.95rem;">${r.description}</p>` : ''}
        </div>
        <div>
            <a href="http://localhost:8000/resources/${r.id}/download" target="_blank" style="background: #0ea5e9; color: white; padding: 8px 15px; text-decoration: none; border-radius: 6px; font-weight: 600;">تحميل</a>
        </div>
      </div>
    `).join("");
    main.innerHTML = `<h2>الدروس والموارد التعليمية</h2><div>${items}</div>`;
  },

  renderFees(feesData) {
    const fees = Array.isArray(feesData) ? feesData : (feesData?.data || []);
    const main = document.getElementById("student-main");
    if (!fees || fees.length === 0) {
      main.innerHTML = "<h2>الوضعية المالية</h2><p>لا توجد رسوم مسجلة عليك.</p>";
      return;
    }
    const rows = fees.map(f => `
      <tr>
        <td>${f.fee_type} ${f.program_name ? '('+f.program_name+')' : ''}</td>
        <td>${f.amount_due} DZD</td>
        <td>${f.applied_discount} DZD</td>
        <td style="font-weight: bold; color: #0f172a;">${f.net_amount} DZD</td>
        <td style="direction: ltr; text-align: right;">${f.due_date}</td>
      </tr>
    `).join("");
    main.innerHTML = `
      <h2>الوضعية المالية (الرسوم المستحقة)</h2>
      <table>
        <thead><tr><th>نوع الرسم (البرنامج)</th><th>المبلغ الإجمالي</th><th>الخصم</th><th>المبلغ الصافي</th><th>تاريخ الاستحقاق</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  },

  renderNotifications(notificationsData) {
    const notifications = Array.isArray(notificationsData) ? notificationsData : (notificationsData?.data || []);
    const main = document.getElementById("student-main");
    if (!notifications || notifications.length === 0) {
      main.innerHTML = "<h2>الإشعارات</h2><p>لا توجد إشعارات جديدة.</p>";
      return;
    }
    const items = notifications.map(n => `
      <div style="background: #fff; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-right: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <strong style="display:block; margin-bottom:5px; font-size:1.1rem;">${n.title}</strong>
        <p style="margin:0; color:#475569;">${n.message}</p>
        <small style="color:#94a3b8; display:block; margin-top:5px;">${new Date(n.created_at).toLocaleString('ar-DZ')}</small>
      </div>
    `).join("");
    main.innerHTML = `<h2>الإشعارات</h2><div>${items}</div>`;
  },

  _translate(str) {
    const map = {
      schedule: "الجدول الزمني", assessments: "الامتحانات", grades: "العلامات", 
      attendance: "الغياب", resources: "الدروس", fees: "المالية", notifications: "الإشعارات"
    };
    return map[str] || str;
  },

  _translateDay(day) {
    const map = { 'Sunday': 'الأحد', 'Monday': 'الإثنين', 'Tuesday': 'الثلاثاء', 'Wednesday': 'الأربعاء', 'Thursday': 'الخميس', 'Friday': 'الجمعة', 'Saturday': 'السبت' };
    return map[day] || day;
  }
};
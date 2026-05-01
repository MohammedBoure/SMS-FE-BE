// frontend/js/roles/admin/tabs/academic.js

AdminUI.renderAcademicTab = async function() {
    const main = this.prepareMain("admin.sections.academic");
    const t = (key, params = {}, fallback = "") => this.t(`admin.academic.${key}`, params, fallback);
    const todayDate = new Date().toISOString().split("T")[0];

    main.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 300px; flex-direction: column; gap: 15px;">
            <div style="width: 40px; height: 40px; border: 4px solid #cbd5e1; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: #64748b; font-weight: bold; font-size: 1.1em;">${t("loading", {}, "Collecting and analyzing academic data...")}</p>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
    `;

    try {
        const [studentsRes, teachersRes, occupancyRes] = await Promise.all([
            Api.get("/students?limit=1"),
            Api.get("/teachers"),
            Api.get("/classes/occupancy")
        ]);

        const totalStudents = Number(studentsRes.total ?? studentsRes.count ?? studentsRes.data?.total ?? 0) || 0;
        const teachersPayload = teachersRes.data || teachersRes || [];
        const teachers = Array.isArray(teachersPayload) ? teachersPayload : (teachersPayload.items || []);
        const totalTeachers = teachers.length;
        const occupancyPayload = occupancyRes.data || occupancyRes || [];
        const occupancy = Array.isArray(occupancyPayload)
            ? occupancyPayload
            : (occupancyPayload.items || occupancyPayload.classes || []);

        const getStudentCount = (cls) => Number(
            cls.current_student_count ??
            cls.student_count ??
            cls.students_count ??
            cls.current_occupancy ??
            cls.occupied ??
            cls.enrolled_count ??
            0
        ) || 0;
        const getCapacity = (cls) => Number(cls.capacity ?? 0) || 0;

        const totalClasses = occupancy.length;
        const totalCapacity = occupancy.reduce((sum, cls) => sum + getCapacity(cls), 0);
        const totalOccupied = occupancy.reduce((sum, cls) => sum + getStudentCount(cls), 0);
        const globalOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

        const stats = [
            {
                className: "academic-kpi-blue",
                icon: "graduation",
                label: t("kpis.totalStudents", {}, "Total Students"),
                value: totalStudents,
                valueColor: "#1d4ed8",
                labelColor: "#1e40af",
                border: "#93c5fd",
                background: "linear-gradient(135deg, #eff6ff, #bfdbfe)"
            },
            {
                className: "academic-kpi-purple",
                icon: "teacher",
                label: t("kpis.teachingStaff", {}, "Teaching Staff"),
                value: totalTeachers,
                valueColor: "#6d28d9",
                labelColor: "#5b21b6",
                border: "#c4b5fd",
                background: "linear-gradient(135deg, #f5f3ff, #ddd6fe)"
            },
            {
                className: "academic-kpi-green",
                icon: "building",
                label: t("kpis.classes", {}, "Classes"),
                value: totalClasses,
                valueColor: "#047857",
                labelColor: "#065f46",
                border: "#6ee7b7",
                background: "linear-gradient(135deg, #ecfdf5, #a7f3d0)"
            },
            {
                className: "academic-kpi-amber",
                icon: "chart",
                label: t("kpis.occupancyRate", {}, "Overall Occupancy Rate"),
                value: `${globalOccupancyRate}%`,
                valueColor: globalOccupancyRate >= 90 ? "#dc2626" : "#c2410c",
                labelColor: "#9a3412",
                border: "#fdba74",
                background: "linear-gradient(135deg, #fff7ed, #fed7aa)"
            }
        ];

        const statsHtml = `
            <div class="academic-kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
                ${stats.map(card => `
                    <div class="academic-kpi-card ${card.className}" style="background: ${card.background}; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); position: relative; overflow: hidden; border: 1px solid ${card.border};">
                        <div class="academic-kpi-icon" style="position: absolute; top: 12px; left: 15px; font-size: 3em; opacity: 0.2; color: ${card.valueColor};">${this.icon(card.icon, "inline-svg-icon")}</div>
                        <h4 class="academic-kpi-label" style="margin: 0 0 10px 0; color: ${card.labelColor}; font-size: 1em;">${card.label}</h4>
                        <div class="academic-kpi-value" style="font-size: 2.5em; font-weight: 900; color: ${card.valueColor};">${card.value}</div>
                    </div>
                `).join("")}
            </div>
        `;

        const quickActions = [
            { section: "students", icon: "graduation", label: t("quickActions.students", {}, "Manage Students") },
            { section: "attendance", icon: "clipboard", label: t("quickActions.attendance", {}, "Record Attendance") },
            { section: "schedules", icon: "calendar", label: t("quickActions.schedule", {}, "Schedule") },
            { section: "grades", icon: "chart", label: t("quickActions.grades", {}, "Enter Grades") }
        ];

        const quickLinksHtml = `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #0f172a; margin-bottom: 15px; font-size: 1.2em; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("refresh", "inline-svg-icon")} ${t("quickActions.title", {}, "Quick Actions")}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
                    ${quickActions.map(action => `
                        <button onclick="AdminRole.loadSection('${action.section}')" class="quick-link-btn" style="background: white; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold; color: #334155; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <div style="font-size: 1.8em; margin-bottom: 8px;">${this.icon(action.icon, "inline-svg-icon")}</div>
                            <span>${action.label}</span>
                        </button>
                    `).join("")}
                </div>
                <style>.quick-link-btn:hover { transform: translateY(-3px); box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important; border-color: #cbd5e1 !important; }</style>
            </div>
        `;

        const sortedOccupancy = [...occupancy].sort((a, b) => {
            const capacityA = getCapacity(a);
            const capacityB = getCapacity(b);
            const pA = capacityA > 0 ? getStudentCount(a) / capacityA : 0;
            const pB = capacityB > 0 ? getStudentCount(b) / capacityB : 0;
            return pB - pA;
        }).slice(0, 5);

        let occupancyRows = sortedOccupancy.map(cls => {
            const studentCount = getStudentCount(cls);
            const capacity = getCapacity(cls);
            const capacityLabel = capacity > 0 ? String(capacity) : "&infin;";
            const percent = capacity > 0 ? Math.round((studentCount / capacity) * 100) : 0;
            const barPercent = Math.min(percent, 100);
            const color = percent >= 95 ? "#ef4444" : (percent >= 80 ? "#f59e0b" : "#10b981");
            const label = t("occupancy.label", { current: studentCount, capacity: capacityLabel }, `Occupancy: ${studentCount} / ${capacityLabel}`);

            return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px; font-weight: bold; color: #0f172a;">
                        ${this._escape(cls.class_name)}
                        ${cls.program_name ? `<div style="color:#2563eb; font-size:.85em; margin-top:3px;">${this._escape(cls.program_name)}</div>` : ""}
                    </td>
                    <td style="padding: 12px; text-align: left;">
                        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                            <span style="font-size: 0.85em; font-weight: bold; color: #475569;">${label}</span>
                            <div style="width: 100px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                                <div style="width: ${barPercent}%; height: 100%; background: ${color};"></div>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        if (sortedOccupancy.length === 0) {
            occupancyRows = `<tr><td colspan="2" style="text-align:center; padding: 20px; color:#64748b;">${t("occupancy.empty", {}, "No class data is available.")}</td></tr>`;
        }

        const classOptions = occupancy.map(c => {
            const prefix = c.program_name ? `${c.program_name} - ` : "";
            return `<option value="${c.class_id || c.id}">${this._escape(prefix + c.class_name)}</option>`;
        }).join("");

        const bottomWidgetsHtml = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px;">
                <div style="background: white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 20px; border: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 1.1em; display: flex; align-items: center; gap: 8px;">
                        ${this.icon("alert", "inline-svg-icon")} ${t("occupancy.title", {}, "Crowding Alert (Top 5 Classes)")}
                    </h3>
                    <div class="admin-mobile-table">
                        <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 0.95em;">
                            <thead style="display: none;">
                                <tr>
                                    <th>${t("occupancy.classColumn", {}, "Class")}</th>
                                    <th>${t("occupancy.occupancyColumn", {}, "Occupancy")}</th>
                                </tr>
                            </thead>
                            <tbody>${occupancyRows}</tbody>
                        </table>
                    </div>
                </div>

                <div style="background: white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 20px; border: 1px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #0f172a; font-size: 1.1em; display: flex; align-items: center; gap: 8px;">
                            ${this.icon("clock", "inline-svg-icon")} ${t("attendance.title", { date: todayDate }, `Today's Attendance (${todayDate})`)}
                        </h3>
                    </div>

                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <select id="dash-attendance-class" style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc;">
                            <option value="">${t("attendance.choosePlaceholder", {}, "-- Choose a class to view today's attendance --")}</option>
                            ${classOptions}
                        </select>
                        <button onclick="AdminUI.checkDashboardAttendance('${todayDate}')" style="background: #2563eb; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s;">${t("attendance.check", {}, "Check")}</button>
                    </div>

                    <div id="dash-attendance-result" style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; color: #64748b;">
                        ${t("attendance.helper", {}, "Choose a class and click Check to view today's statistics.")}
                    </div>
                </div>
            </div>
        `;

        main.innerHTML = statsHtml + quickLinksHtml + bottomWidgetsHtml;
        this.localize(main);

    } catch (err) {
        main.innerHTML = `
            <div style="background: #fef2f2; color: #991b1b; padding: 20px; border-radius: 8px; border: 1px solid #fca5a5; margin-top: 20px;">
                <strong>${t("errors.server", {}, "Server connection error:")}</strong> ${this._escape(err.message)}
            </div>
        `;
    }
};

AdminUI.checkDashboardAttendance = async function(targetDate) {
    const t = (key, params = {}, fallback = "") => this.t(`admin.academic.attendance.${key}`, params, fallback);
    const classId = document.getElementById("dash-attendance-class").value;
    const resultContainer = document.getElementById("dash-attendance-result");

    if (!classId) {
        alert(t("chooseClassFirst", {}, "Please choose a class first."));
        return;
    }

    resultContainer.innerHTML = `<div style="color: #2563eb; font-weight: bold;">${t("loadingRecords", {}, "Fetching records...")}</div>`;

    try {
        const response = await Api.get(`/attendance/class/${classId}/sheet?target_date=${targetDate}`);
        const records = response.data || response || [];

        if (records.length === 0) {
            resultContainer.innerHTML = `<div style="color: #f59e0b; font-weight: bold;">${t("empty", {}, "No attendance has been recorded for this class today yet.")}</div>`;
            return;
        }

        const total = records.length;
        const present = records.filter(r => r.status === "present").length;
        const absent = records.filter(r => r.status === "absent").length;
        const late = records.filter(r => r.status === "late").length;
        const presentRate = Math.round((present / total) * 100);

        resultContainer.innerHTML = `
            <div style="display: flex; justify-content: space-around; align-items: center;">
                <div style="text-align: center;">
                    <div style="font-size: 2em; font-weight: bold; color: #16a34a;">${presentRate}%</div>
                    <div style="font-size: 0.8em; color: #64748b; font-weight: bold;">${t("rate", {}, "Attendance Rate")}</div>
                </div>
                <div style="border-right: 1px solid #cbd5e1; height: 40px;"></div>
                <div style="text-align: right; font-size: 0.9em; line-height: 1.8;">
                    <div>${this.icon("check", "inline-svg-icon")} ${t("present", {}, "Present:")} <strong>${present}</strong></div>
                    <div>${this.icon("ban", "inline-svg-icon")} ${t("absent", {}, "Absent:")} <strong style="color: #ef4444;">${absent}</strong></div>
                    <div>${this.icon("alert", "inline-svg-icon")} ${t("late", {}, "Late:")} <strong style="color: #f59e0b;">${late}</strong></div>
                </div>
            </div>
        `;
        this.localize(resultContainer);

    } catch (err) {
        resultContainer.innerHTML = `<div style="color: #ef4444; font-size: 0.9em;">${t("fetchFailed", {}, "Fetch failed:")} ${this._escape(err.message)}</div>`;
    }
};

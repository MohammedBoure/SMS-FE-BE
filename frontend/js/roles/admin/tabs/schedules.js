// frontend/js/roles/admin/tabs/schedules.js

AdminUI.schedulesT = function(key, params = {}, fallback = "") {
    return this.t(`admin.schedulesTab.${key}`, params, fallback);
};

AdminUI.scheduleDayKeys = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

AdminUI.renderSchedulesTab = async function() {
    const main = this.prepareMain(this.t("admin.sections.schedules", {}, "Schedule Management"));

    let classes = [];
    let teachers = [];
    try {
        const [classesRes, teachersRes] = await Promise.all([
            AdminServices.getClasses(),
            AdminServices.getTeachers()
        ]);
        classes = classesRes.data || classesRes || [];
        teachers = teachersRes.data || teachersRes || [];
        this._cachedClasses = classes;
    } catch (err) {
        console.error(this.schedulesT("messages.baseLoadFailed", {}, "Failed to load schedule base data:"), err);
    }

    const classOptions = classes.map(c => {
        const id = c.class_id || c.id;
        const className = c.class_name || this.schedulesT("table.classFallback", {}, "Class");
        const label = (c.program_name ? `${c.program_name} - ` : "") + className;
        return `<option value="${id}">${this._escape(label)}</option>`;
    }).join("");

    const teacherOptions = teachers.map(t => {
        const id = t.teacher_id || t.id;
        const label = t.full_name || t.teacher_name || this.schedulesT("table.teacherFallback", {}, "Teacher");
        return `<option value="${id}">${this._escape(label)}</option>`;
    }).join("");

    const dayOptions = this.scheduleDayKeys.map(day =>
        `<option value="${day}">${this.schedulesT(`days.${day}`, {}, day)}</option>`
    ).join("");

    main.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 25px;">
            <div style="background: var(--admin-surface); padding: 16px; border-radius: 8px; box-shadow: var(--admin-shadow-soft); border-inline-start: 4px solid #059669;">
                <h4 style="margin: 0 0 12px 0; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                    ${this.icon("building", "inline-svg-icon")} ${this.schedulesT("cards.classSchedule", {}, "Class Schedule")}
                </h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <select id="sch-class-select" style="flex: 1 1 180px; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; outline: none;">
                        <option value="">${this.schedulesT("cards.chooseClass", {}, "-- Choose class --")}</option>
                        ${classOptions}
                    </select>
                    <button onclick="AdminUI.loadSchedule('class')" style="background: #059669; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; font-weight: bold;">
                        ${this.icon("eye", "inline-svg-icon")} ${this.schedulesT("cards.show", {}, "Show")}
                    </button>
                </div>
            </div>

            <div style="background: var(--admin-surface); padding: 16px; border-radius: 8px; box-shadow: var(--admin-shadow-soft); border-inline-start: 4px solid #2563eb;">
                <h4 style="margin: 0 0 12px 0; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                    ${this.icon("teacher", "inline-svg-icon")} ${this.schedulesT("cards.teacherSchedule", {}, "Teacher Schedule")}
                </h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <select id="sch-teacher-select" style="flex: 1 1 180px; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; outline: none;">
                        <option value="">${this.schedulesT("cards.chooseTeacher", {}, "-- Choose teacher --")}</option>
                        ${teacherOptions}
                    </select>
                    <button onclick="AdminUI.loadSchedule('teacher')" style="background: #2563eb; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; font-weight: bold;">
                        ${this.icon("eye", "inline-svg-icon")} ${this.schedulesT("cards.show", {}, "Show")}
                    </button>
                </div>
            </div>
        </div>

        <div style="text-align: end; margin-bottom: 20px;">
            <button onclick="AdminUI.showAddScheduleModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: inline-flex; align-items: center; gap: 8px;">
                ${this.icon("calendar", "inline-svg-icon")} ${this.schedulesT("actions.addSession", {}, "Add Session to Schedule")}
            </button>
        </div>

        <div id="schedule-view-container" style="background: var(--admin-surface); padding: 20px; border-radius: 8px; box-shadow: var(--admin-shadow-soft); min-height: 400px;">
            <div style="text-align: center; color: var(--text-muted); margin-top: 100px;">
                <span style="display: inline-flex; opacity: 0.55;">${this.icon("calendar", "inline-svg-icon")}</span>
                <p>${this.schedulesT("emptyPrompt", {}, "Choose a class or teacher to display the weekly schedule here.")}</p>
            </div>
        </div>

        <div id="add-schedule-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; padding: 16px;">
            <div style="background: var(--admin-surface); width: min(520px, 100%); padding: 25px; border-radius: 10px; box-shadow: var(--admin-shadow); max-height: 90vh; overflow-y: auto;">
                <h3 style="margin-top: 0; color: var(--text-main); border-bottom: 1px solid var(--admin-border); padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("calendar", "inline-svg-icon")} ${this.schedulesT("modal.title", {}, "Add New Session")}
                </h3>

                <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-main);">${this.schedulesT("modal.classLabel", {}, "Class:")}</label>
                        <select id="modal-class-select" onchange="AdminUI.loadClassAssignments(this.value)" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px;">
                            <option value="">${this.schedulesT("modal.chooseClassFirst", {}, "-- Choose class first --")}</option>
                            ${classOptions}
                        </select>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-main);">${this.schedulesT("modal.assignmentLabel", {}, "Subject and teacher assignment:")}</label>
                        <select id="modal-assignment-select" disabled style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; background: var(--admin-surface-soft);">
                            <option value="">${this.schedulesT("modal.chooseClass", {}, "-- Please choose the class --")}</option>
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-main);">${this.schedulesT("modal.dayLabel", {}, "Day:")}</label>
                            <select id="modal-day" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px;">
                                ${dayOptions}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-main);">${this.schedulesT("modal.roomLabel", {}, "Room:")}</label>
                            <input type="text" id="modal-room" placeholder="${this.schedulesT("modal.roomPlaceholder", {}, "Example: Room 101")}" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box;">
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-main);">${this.schedulesT("modal.startTimeLabel", {}, "Start Time:")}</label>
                            <input type="time" id="modal-start-time" value="08:00" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: var(--text-main);">${this.schedulesT("modal.endTimeLabel", {}, "End Time:")}</label>
                            <input type="time" id="modal-end-time" value="09:00" style="width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box;">
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeScheduleModal()" style="padding: 10px 15px; border: none; background: #e2e8f0; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitNewSchedule()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px;">${this.icon("save", "inline-svg-icon")} ${this.schedulesT("modal.save", {}, "Save Session")}</button>
                </div>
            </div>
        </div>
    `;
};

AdminUI.loadSchedule = async function(type) {
    const select = document.getElementById(`sch-${type}-select`);
    const container = document.getElementById("schedule-view-container");
    const id = select ? select.value : "";

    if (!id) {
        alert(this.schedulesT("messages.chooseFromList", {}, "Please choose from the list first."));
        return;
    }

    container.innerHTML = `<div style="text-align:center; padding: 50px; color: var(--text-muted);">${this.schedulesT("messages.loadingSchedule", {}, "Loading schedule...")}</div>`;

    try {
        const schedule = await Api.get(`/schedules/${type}/${id}`);
        this.currentViewType = type;
        this.currentViewId = id;
        this.drawScheduleGrid(schedule, type);
    } catch (err) {
        const message = err.message || this.schedulesT("messages.noData", {}, "No data");
        container.innerHTML = `<div style="color: #991b1b; background: #fef2f2; padding: 15px; border-radius: 6px; border: 1px solid #fca5a5;">${this.schedulesT("messages.loadFailed", { message }, `Failed to load schedule: ${message}`)}</div>`;
    }
};

AdminUI.drawScheduleGrid = function(data, type) {
    const container = document.getElementById("schedule-view-container");
    const days = this.scheduleDayKeys;
    const items = Array.isArray(data && data.data) ? data.data : (Array.isArray(data) ? data : []);

    if (!items.length) {
        container.innerHTML = `<div style="text-align:center; padding: 50px; color: var(--text-muted); font-size: 1.1em;">${this.schedulesT("table.emptySchedule", {}, "No sessions are currently registered in this schedule.")}</div>`;
        return;
    }

    const formatTime = (timeVal) => {
        if (timeVal === null || timeVal === undefined || timeVal === "") return "00:00";
        if (!isNaN(timeVal) && String(timeVal).indexOf(":") === -1) {
            const totalSeconds = parseInt(timeVal, 10);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        }
        return String(timeVal).slice(0, 5);
    };

    const scheduleByDay = {};
    days.forEach(day => {
        scheduleByDay[day] = [];
    });

    items.forEach(item => {
        if (scheduleByDay[item.day_of_week]) {
            scheduleByDay[item.day_of_week].push(item);
        }
    });

    const dayColumns = days.map(day => {
        const sessions = scheduleByDay[day].sort((a, b) => formatTime(a.start_time).localeCompare(formatTime(b.start_time)));
        if (sessions.length === 0 && (day === "Friday" || day === "Saturday")) return "";

        const sessionHtml = sessions.map(session => {
            const id = session.schedule_id || session.id;
            const start = formatTime(session.start_time);
            const end = formatTime(session.end_time);
            const subject = session.subject_name || this.schedulesT("table.subjectFallback", {}, "Subject");
            const notSpecified = this.schedulesT("table.notSpecified", {}, "Not specified");
            const personLine = type === "class"
                ? `${this.icon("teacher", "inline-svg-icon")} ${this.schedulesT("table.teacherPrefix", {}, "Teacher:")} ${this._escape(session.teacher_name || notSpecified)}`
                : `${this.icon("building", "inline-svg-icon")} ${this.schedulesT("table.classPrefix", {}, "Class:")} ${this._escape(session.class_name || notSpecified)}`;

            return `
                <div style="background: var(--admin-surface); border: 1px solid var(--admin-border); padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 0.85em; position: relative; box-shadow: var(--admin-shadow-soft);">
                    <div style="font-weight: bold; color: var(--text-main); margin-bottom: 5px; font-size: 1.1em;">${this._escape(subject)}</div>
                    <div style="color: #ef4444; font-weight: bold; margin-bottom: 5px; display: flex; align-items: center; gap: 5px;">${this.icon("clock", "inline-svg-icon")} ${start} - ${end}</div>
                    <div style="color: #0369a1; font-size: 0.9em; display: flex; align-items: center; gap: 5px;">${personLine}</div>
                    <div style="margin-top: 5px; font-size: 0.85em; color: var(--text-muted); background: var(--admin-surface-soft); display: inline-flex; align-items: center; gap: 5px; padding: 2px 6px; border-radius: 4px;">
                        ${this.icon("building", "inline-svg-icon")} ${this.schedulesT("table.roomPrefix", {}, "Room:")} ${this._escape(session.room_number || notSpecified)}
                    </div>
                    <button onclick="AdminUI.deleteScheduleItem(${id})"
                            style="position: absolute; top: 5px; inset-inline-end: 5px; background: #fee2e2; border: none; color: #ef4444; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s;"
                            title="${this.schedulesT("actions.deleteSessionTitle", {}, "Delete session")}">${this.icon("trash", "inline-svg-icon")}</button>
                </div>`;
        }).join("");

        return `
            <div style="flex: 1; min-width: 180px; background: var(--admin-surface-soft); border-radius: 8px; padding: 10px; border: 1px solid var(--admin-border);">
                <h5 style="text-align: center; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid var(--admin-border); color: var(--text-main); font-size: 1em;">${this.schedulesT(`days.${day}`, {}, day)}</h5>
                ${sessionHtml || `<p style="text-align:center; color: var(--text-muted); font-size:0.85em; margin-top: 20px;">${this.schedulesT("table.emptyDay", {}, "Empty")}</p>`}
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <div style="display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;">
            ${dayColumns}
        </div>
    `;
};

AdminUI.showAddScheduleModal = function() {
    document.getElementById("add-schedule-modal").style.display = "flex";
};

AdminUI.closeScheduleModal = function() {
    const modal = document.getElementById("add-schedule-modal");
    const classSelect = document.getElementById("modal-class-select");
    const assignmentSelect = document.getElementById("modal-assignment-select");

    if (modal) modal.style.display = "none";
    if (classSelect) classSelect.value = "";
    if (assignmentSelect) {
        assignmentSelect.innerHTML = `<option value="">${this.schedulesT("modal.chooseClass", {}, "-- Please choose the class --")}</option>`;
        assignmentSelect.disabled = true;
    }
};

AdminUI.loadClassAssignments = async function(classId) {
    const assignmentSelect = document.getElementById("modal-assignment-select");

    if (!classId) {
        assignmentSelect.innerHTML = `<option value="">${this.schedulesT("modal.chooseClass", {}, "-- Please choose the class --")}</option>`;
        assignmentSelect.disabled = true;
        return;
    }

    assignmentSelect.disabled = false;
    assignmentSelect.innerHTML = `<option value="">${this.schedulesT("assignments.loading", {}, "Loading...")}</option>`;

    try {
        const response = await Api.get(`/assignments/class/${classId}`);
        const assignments = response.data || response || [];

        if (!assignments.length) {
            assignmentSelect.innerHTML = `<option value="">${this.schedulesT("assignments.none", {}, "No teachers are assigned to this class")}</option>`;
            return;
        }

        assignmentSelect.innerHTML = assignments.map(assignment => {
            const subject = assignment.subject_name || this.schedulesT("table.subjectFallback", {}, "Subject");
            const teacher = assignment.teacher_name || this.schedulesT("table.teacherFallback", {}, "Teacher");
            const label = this.schedulesT("assignments.optionLabel", { subject, teacher }, `Subject: ${subject} | Teacher: ${teacher}`);
            return `<option value="${assignment.assignment_id || assignment.id}">${this._escape(label)}</option>`;
        }).join("");
    } catch (err) {
        assignmentSelect.innerHTML = `<option value="">${this.schedulesT("assignments.loadFailed", {}, "Error fetching data")}</option>`;
        console.error("Error loading assignments:", err);
    }
};

AdminUI.submitNewSchedule = async function() {
    const assignmentId = document.getElementById("modal-assignment-select").value;
    const day = document.getElementById("modal-day").value;
    const startTime = document.getElementById("modal-start-time").value;
    const endTime = document.getElementById("modal-end-time").value;
    const room = document.getElementById("modal-room").value.trim();

    if (!assignmentId) {
        alert(this.schedulesT("messages.chooseAssignment", {}, "Please choose the subject and teacher assignment."));
        return;
    }

    try {
        await Api.post("/schedules/", {
            assignment_id: parseInt(assignmentId, 10),
            day_of_week: day,
            start_time: `${startTime}:00`,
            end_time: `${endTime}:00`,
            room_number: room || ""
        });

        alert(this.schedulesT("messages.created", {}, "Session added to the schedule successfully."));
        this.closeScheduleModal();

        if (this.currentViewType && this.currentViewId) {
            this.loadSchedule(this.currentViewType);
        }
    } catch (err) {
        const message = err.message || this.schedulesT("messages.timeConflictHint", {}, "Make sure there is no time conflict.");
        alert(this.schedulesT("messages.createFailed", { message }, `Add failed: ${message}`));
    }
};

AdminUI.deleteScheduleItem = async function(scheduleId) {
    if (!confirm(this.schedulesT("messages.deleteConfirm", {}, "Are you sure you want to delete this schedule session?"))) return;

    try {
        await AdminServices.deleteRecord("/schedules", scheduleId);
        alert(this.t("admin.messages.deleteSuccess", {}, "Deleted successfully."));
        if (this.currentViewType) {
            this.loadSchedule(this.currentViewType);
        }
    } catch (err) {
        alert(this.t("admin.messages.deleteFailed", { message: err.message }, `Delete failed: ${err.message}`));
    }
};

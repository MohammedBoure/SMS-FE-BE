// frontend/js/roles/admin/tabs/classes.js

AdminUI.classesT = function(key, params = {}, fallback = "") {
    return this.t(`admin.classes.${key}`, params, fallback);
};

AdminUI.classInlineJson = function(value) {
    return JSON.stringify(value || {})
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.renderClassesTab = async function(classesData) {
    const main = this.prepareMain(this.t("admin.sections.classes", {}, "Classrooms and Seat Management"));

    let occupancy = [];
    try {
        const occRes = await AdminServices.getClassesOccupancy();
        occupancy = occRes.data || occRes || [];
    } catch (err) {
        console.error(this.classesT("messages.occupancyLoadFailed", {}, "Failed to load occupancy data."), err);
    }

    let programs = [];
    try {
        const programsRes = await AdminServices.getPrograms();
        programs = programsRes.data || programsRes || [];
    } catch (err) {
        console.error(this.classesT("messages.programsLoadFailed", {}, "Failed to load programs."), err);
    }

    const getCapacity = (cls) => Number(cls.capacity ?? 0) || 0;
    const getStudentCount = (cls) => Number(
        cls.current_student_count ??
        cls.student_count ??
        cls.students_count ??
        cls.current_occupancy ??
        cls.occupied ??
        cls.enrolled_count ??
        0
    ) || 0;

    const occupancyCards = occupancy.map(cls => {
        const capacity = getCapacity(cls);
        const studentCount = getStudentCount(cls);
        const percent = capacity > 0 ? Math.round((studentCount / capacity) * 100) : 0;
        const progressWidth = Math.min(percent, 100);
        const statusColor = percent >= 95 ? "#ef4444" : (percent >= 80 ? "#f59e0b" : "#10b981");
        const bgColor = percent >= 95 ? "#fef2f2" : "#ffffff";
        const capacityLabel = capacity > 0 ? capacity : "&infin;";

        return `
            <div style="background: ${bgColor}; padding: 18px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; border-right: 5px solid ${statusColor}; transition: 0.3s; position: relative; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                    <h4 style="margin: 0; color: #0f172a; font-size: 1.1em;">${this._escape(cls.class_name)}</h4>
                    <span style="font-size: 0.85em; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 12px;">${this._escape(cls.level || this.classesT("common.general", {}, "General"))}</span>
                </div>
                <div style="margin-top: 8px; color: #2563eb; font-size: 0.9em; font-weight: bold;">${this._escape(cls.program_name || this.classesT("common.noProgram", {}, "No Program"))}</div>
                <div style="margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.9em; font-weight: bold; margin-bottom: 8px; color: #475569;">
                        <span>${this.classesT("occupancy.label", { current: studentCount, capacity: capacityLabel }, `Occupancy: ${studentCount} / ${capacityLabel}`)}</span>
                        <span style="color: ${statusColor};">${percent}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${progressWidth}%; height: 100%; background: ${statusColor}; transition: width 0.8s ease-in-out;"></div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    const classesList = classesData.data || classesData || [];
    const programOptions = programs.map(p =>
        `<option value="${p.id || p.program_id}">${this._escape(p.program_name)}</option>`
    ).join("");

    main.innerHTML = `
        <div style="margin-bottom: 35px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; flex-wrap: wrap;">
                <h3 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("chart", "inline-svg-icon")} ${this.classesT("occupancy.title", {}, "Live Class Occupancy")}
                </h3>
                <button onclick="AdminUI.showClassModal()" style="background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;">
                    ${this.icon("building", "inline-svg-icon")} ${this.classesT("actions.create", {}, "Create Class")}
                </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
                ${occupancyCards || `<div style="grid-column: 1/-1; text-align: center; color:#64748b; padding: 30px; background: white; border-radius: 8px;">${this.classesT("occupancy.empty", {}, "No occupancy data is available. Create classes and add students.")}</div>`}
            </div>
        </div>

        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="padding: 18px 20px; background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <h3 style="margin: 0; font-size: 1.1em; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("building", "inline-svg-icon")} ${this.classesT("table.title", {}, "Class Structure Management")}
                </h3>
            </div>
            <div class="admin-mobile-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 15px; color: #475569;">${this.classesT("table.id", {}, "Class ID")}</th>
                            <th style="padding: 15px; color: #475569;">${this.classesT("table.name", {}, "Academic Name")}</th>
                            <th style="padding: 15px; color: #475569;">${this.classesT("table.program", {}, "Program")}</th>
                            <th style="padding: 15px; color: #475569;">${this.classesT("table.level", {}, "Academic Level")}</th>
                            <th style="padding: 15px; color: #475569;">${this.classesT("table.ageGroup", {}, "Age Group")}</th>
                            <th style="padding: 15px; color: #475569;">${this.classesT("table.capacity", {}, "Maximum Capacity")}</th>
                            <th style="padding: 15px; text-align: left; color: #475569;">${this.classesT("table.actions", {}, "Management Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${classesList.length > 0 ? classesList.map(c => {
                            const classId = c.class_id || c.id;
                            const capacity = c.capacity
                                ? this.classesT("table.capacityValue", { count: c.capacity }, `${c.capacity} seats`)
                                : this.classesT("common.notSpecified", {}, "Not specified");
                            return `
                                <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                    <td style="padding: 15px; font-weight: bold; color: #64748b;">#${classId}</td>
                                    <td style="padding: 15px; font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(c.class_name)}</td>
                                    <td style="padding: 15px; color: #2563eb; font-weight: bold;">${this._escape(c.program_name || "-")}</td>
                                    <td style="padding: 15px; color: #334155;">${this._escape(c.level || "-")}</td>
                                    <td style="padding: 15px; color: #334155;">${this._escape(c.age_group || "-")}</td>
                                    <td style="padding: 15px;">
                                        <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 0.9em;">
                                            ${capacity}
                                        </span>
                                    </td>
                                    <td style="padding: 15px; text-align: left; display: flex; gap: 8px; justify-content: flex-end;">
                                        <button onclick="AdminUI.showClassModal(${this.classInlineJson(c)})" title="${this.classesT("actions.editTitle", {}, "Edit class")}" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">${this.icon("edit", "inline-svg-icon")} ${this.t("admin.actions.edit", {}, "Edit")}</button>
                                        <button onclick="AdminRole.deleteItem('/classes', ${classId}, 'classes')" title="${this.classesT("actions.deleteTitle", {}, "Delete class")}" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;">${this.icon("trash", "inline-svg-icon")} ${this.t("admin.actions.delete", {}, "Delete")}</button>
                                    </td>
                                </tr>
                            `;
                        }).join("") : `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #64748b;">${this.classesT("table.empty", {}, "No classes are currently registered.")}</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>

        <div id="class-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px); padding: 18px;">
            <div style="background: white; width: min(450px, 100%); max-height: calc(100vh - 36px); overflow-y: auto; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                <h3 id="class-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("building", "inline-svg-icon")} ${this.classesT("form.addTitle", {}, "Add New Class")}
                </h3>

                <input type="hidden" id="modal-class-id">

                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">${this.classesT("form.programLabel", {}, "Program")}</label>
                    <select id="modal-class-program" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box; background: #f8fafc;">
                        <option value="">${this.classesT("form.noProgramOption", {}, "-- No Program --")}</option>
                        ${programOptions}
                    </select>
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">${this.classesT("form.nameLabel", {}, "Academic Class Name *")}</label>
                    <input type="text" id="modal-class-name" placeholder="${this.classesT("form.namePlaceholder", {}, "Example: Einstein Class (A)")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">${this.classesT("form.levelLabel", {}, "Academic Level")}</label>
                    <input type="text" id="modal-class-level" placeholder="${this.classesT("form.levelPlaceholder", {}, "Example: First Year Secondary")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">${this.classesT("form.ageLabel", {}, "Age Group")}</label>
                        <input type="text" id="modal-class-age" placeholder="${this.classesT("form.agePlaceholder", {}, "Example: 15-16")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #334155;">${this.classesT("form.capacityLabel", {}, "Maximum Capacity (Seats)")}</label>
                        <input type="number" id="modal-class-capacity" placeholder="${this.classesT("form.capacityPlaceholder", {}, "Example: 30")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; flex-wrap: wrap;">
                    <button onclick="AdminUI.closeClassModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitClass()" style="padding: 12px 20px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">${this.classesT("form.save", {}, "Save Class Details")}</button>
                </div>
            </div>
        </div>
    `;
};

AdminUI.showClassModal = function(classData = null) {
    const modal = document.getElementById("class-modal");
    const title = document.getElementById("class-modal-title");

    document.getElementById("modal-class-id").value = "";
    document.getElementById("modal-class-program").value = "";
    document.getElementById("modal-class-name").value = "";
    document.getElementById("modal-class-level").value = "";
    document.getElementById("modal-class-age").value = "";
    document.getElementById("modal-class-capacity").value = "";

    if (classData) {
        title.innerHTML = `${this.icon("edit", "inline-svg-icon")} ${this.classesT("form.editTitle", {}, "Edit Class Details")}`;
        document.getElementById("modal-class-id").value = classData.id || classData.class_id;
        document.getElementById("modal-class-program").value = classData.program_id || "";
        document.getElementById("modal-class-name").value = classData.class_name || "";
        document.getElementById("modal-class-level").value = classData.level || "";
        document.getElementById("modal-class-age").value = classData.age_group || "";
        document.getElementById("modal-class-capacity").value = classData.capacity || "";
    } else {
        title.innerHTML = `${this.icon("building", "inline-svg-icon")} ${this.classesT("form.addTitle", {}, "Add New Class")}`;
    }

    modal.style.display = "flex";
};

AdminUI.closeClassModal = function() {
    document.getElementById("class-modal").style.display = "none";
};

AdminUI.submitClass = async function() {
    const id = document.getElementById("modal-class-id").value;
    const programId = document.getElementById("modal-class-program").value;
    const className = document.getElementById("modal-class-name").value.trim();
    const level = document.getElementById("modal-class-level").value.trim();
    const ageGroup = document.getElementById("modal-class-age").value.trim();
    const capacityRaw = document.getElementById("modal-class-capacity").value;

    if (!className) {
        alert(this.classesT("messages.nameRequired", {}, "Please enter the class name."));
        return;
    }

    const payload = {
        program_id: programId ? parseInt(programId) : null,
        class_name: className,
        level: level || null,
        age_group: ageGroup || null,
        capacity: capacityRaw ? parseInt(capacityRaw) : null
    };

    try {
        if (id) {
            await Api.put(`/classes/${id}`, payload);
            alert(this.classesT("messages.updated", {}, "Class details updated successfully."));
        } else {
            await Api.post("/classes/", payload);
            alert(this.classesT("messages.created", {}, "New class created successfully."));
        }

        this.closeClassModal();
        AdminRole.loadSection("classes");
    } catch (err) {
        const message = err.message || this.classesT("messages.unexpected", {}, "An unexpected error occurred.");
        alert(this.classesT("messages.saveFailed", { message }, `Failed to save class details: ${message}`));
    }
};

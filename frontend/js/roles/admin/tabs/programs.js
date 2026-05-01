// frontend/js/roles/admin/tabs/programs.js

AdminUI.programsT = function(key, params = {}, fallback = "") {
    return this.t(`admin.programsTab.${key}`, params, fallback);
};

AdminUI.programInlineString = function(value) {
    return JSON.stringify(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.renderProgramsTab = function(programsData) {
    const main = this.prepareMain(this.t("admin.sections.programs", {}, "Study Programs"));
    const programs = programsData.data || programsData || [];

    main.innerHTML = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); gap: 15px; flex-wrap: wrap;">
            <div style="display: flex; gap: 10px; flex: 1; min-width: 300px;">
                <input type="text" id="program-search-input"
                       placeholder="${this.programsT("search.placeholder", {}, "Search by program name...")}"
                       style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; flex: 1; outline: none; font-size: 1rem;"
                       onkeypress="if(event.key === 'Enter') AdminUI.searchPrograms()">
                <button onclick="AdminUI.searchPrograms()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;">
                    ${this.icon("search", "inline-svg-icon")} ${this.t("admin.actions.search", {}, "Search")}
                </button>
                <button onclick="AdminRole.loadSection('programs')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; cursor: pointer; transition: 0.2s;" title="${this.programsT("actions.reloadTitle", {}, "Reload list")}">
                    ${this.icon("refresh", "inline-svg-icon")}
                </button>
            </div>
            <div>
                <button onclick="AdminUI.showProgramModal()" style="background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;">
                    ${this.icon("bookOpen", "inline-svg-icon")} ${this.programsT("actions.add", {}, "Add New Program")}
                </button>
            </div>
        </div>

        <div id="programs-table-container">
            ${this._generateProgramsTableHtml(programs)}
        </div>

        <div id="program-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(2px);">
            <div style="background: white; width: min(500px, calc(100vw - 28px)); max-height: calc(100vh - 28px); overflow: auto; padding: 25px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                <h3 id="program-modal-title" style="margin-top: 0; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    ${this.icon("bookOpen", "inline-svg-icon")} ${this.programsT("form.addTitle", {}, "Add Study Program")}
                </h3>

                <input type="hidden" id="modal-program-id">

                <div style="margin-top: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">${this.programsT("form.nameLabel", {}, "Program Name *")}</label>
                    <input type="text" id="modal-program-name" placeholder="${this.programsT("form.namePlaceholder", {}, "Example: Math support course, language course...")}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                </div>

                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">${this.programsT("form.typeLabel", {}, "Program Type *")}</label>
                    <input type="text" id="modal-program-type" placeholder="${this.programsT("form.typePlaceholder", {}, "Example: Course, diploma, summer activity...")}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">${this.programsT("form.cashPriceLabel", {}, "Cash Price")}</label>
                        <input type="number" id="modal-program-price-cash" value="0" min="0" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #334155;">${this.programsT("form.installmentPriceLabel", {}, "Installment Price")}</label>
                        <input type="number" id="modal-program-price-installments" value="0" min="0" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; box-sizing: border-box;">
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                    <button onclick="AdminUI.closeProgramModal()" style="padding: 10px 15px; border: none; background: #f1f5f9; color: #334155; border-radius: 6px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                    <button onclick="AdminUI.submitProgram()" style="padding: 10px 15px; border: none; background: #0f172a; color: white; border-radius: 6px; cursor: pointer; font-weight: bold;">${this.programsT("form.save", {}, "Save Program")}</button>
                </div>
            </div>
        </div>
    `;
};

AdminUI._generateProgramsTableHtml = function(programs) {
    if (!programs || programs.length === 0) {
        return `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="display: inline-flex; opacity: 0.55;">${this.icon("bookOpen", "inline-svg-icon")}</span>
                <p style="color: #64748b; font-size: 1.1em;">${this.programsT("table.empty", {}, "No study programs are currently registered.")}</p>
            </div>
        `;
    }

    const rows = programs.map(program => {
        const programPayload = encodeURIComponent(JSON.stringify(program));
        return `
            <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td data-label="ID" style="padding: 15px; font-weight: bold; color: #64748b;">#${program.id}</td>
                <td data-label="${this.programsT("table.name", {}, "Program Name")}" style="padding: 15px; font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(program.program_name)}</td>
                <td data-label="${this.programsT("table.type", {}, "Type")}" style="padding: 15px;">
                    <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-size: 0.9em; font-weight: bold;">${this._escape(program.program_type)}</span>
                </td>
                <td data-label="${this.programsT("table.cashPrice", {}, "Cash Price")}" style="padding: 15px; font-weight: bold; color: #059669; direction: ltr; text-align: right;">${this._formatCurrency(program.price_cash)}</td>
                <td data-label="${this.programsT("table.installmentPrice", {}, "Installment Price")}" style="padding: 15px; font-weight: bold; color: #d97706; direction: ltr; text-align: right;">${this._formatCurrency(program.price_installments)}</td>
                <td class="admin-actions-cell" data-label="${this.programsT("table.actions", {}, "Actions")}" style="padding: 15px; text-align: left;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap;">
                        <button onclick="AdminUI.showProgramModal(JSON.parse(decodeURIComponent('${programPayload}')))" title="${this.programsT("actions.editTitle", {}, "Edit program")}" style="background: #fffbeb; color: #d97706; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;" onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">${this.icon("edit", "inline-svg-icon")} ${this.t("admin.actions.edit", {}, "Edit")}</button>
                        <button onclick="AdminRole.deleteItem('/programs', ${program.id}, 'programs')" title="${this.programsT("actions.deleteTitle", {}, "Delete program")}" style="background: #fef2f2; color: #b91c1c; border: none; padding: 8px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">${this.icon("trash", "inline-svg-icon")} ${this.t("admin.actions.delete", {}, "Delete")}</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="padding: 12px 15px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 0.9em; color: #475569;">
                ${this.programsT("table.total", { count: programs.length }, `Total Programs: ${programs.length}`)}
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">${this.programsT("table.name", {}, "Program Name")}</th>
                            <th style="padding: 15px; color: #334155;">${this.programsT("table.type", {}, "Type")}</th>
                            <th style="padding: 15px; color: #334155;">${this.programsT("table.cashPrice", {}, "Cash Price")}</th>
                            <th style="padding: 15px; color: #334155;">${this.programsT("table.installmentPrice", {}, "Installment Price")}</th>
                            <th style="padding: 15px; color: #334155; text-align: left;">${this.programsT("table.actions", {}, "Actions")}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

AdminUI.searchPrograms = async function() {
    const keyword = document.getElementById("program-search-input").value.trim();
    if (keyword.length > 0 && keyword.length < 2) {
        alert(this.programsT("messages.minSearch", {}, "Please enter at least two characters to search."));
        return;
    }

    if (keyword.length === 0) return AdminRole.loadSection("programs");

    AdminUI.renderLoading();
    try {
        const response = await Api.get(`/programs/search?keyword=${encodeURIComponent(keyword)}`);
        this.renderProgramsTab(response);
        document.getElementById("program-search-input").value = keyword;
    } catch (err) {
        this.renderError(this.programsT("messages.searchFailed", { message: err.message }, `Search failed: ${err.message}`));
    }
};

AdminUI.showProgramModal = function(programData = null) {
    const modal = document.getElementById("program-modal");
    const title = document.getElementById("program-modal-title");

    document.getElementById("modal-program-id").value = "";
    document.getElementById("modal-program-name").value = "";
    document.getElementById("modal-program-type").value = "";
    document.getElementById("modal-program-price-cash").value = "0";
    document.getElementById("modal-program-price-installments").value = "0";

    if (programData) {
        title.innerHTML = `${this.icon("edit", "inline-svg-icon")} ${this.programsT("form.editTitle", {}, "Edit Program")}`;
        document.getElementById("modal-program-id").value = programData.id;
        document.getElementById("modal-program-name").value = programData.program_name || "";
        document.getElementById("modal-program-type").value = programData.program_type || "";
        document.getElementById("modal-program-price-cash").value = programData.price_cash || 0;
        document.getElementById("modal-program-price-installments").value = programData.price_installments || 0;
    } else {
        title.innerHTML = `${this.icon("bookOpen", "inline-svg-icon")} ${this.programsT("form.addTitle", {}, "Add Study Program")}`;
    }

    modal.style.display = "flex";
};

AdminUI.closeProgramModal = function() {
    document.getElementById("program-modal").style.display = "none";
};

AdminUI.submitProgram = async function() {
    const id = document.getElementById("modal-program-id").value;
    const name = document.getElementById("modal-program-name").value.trim();
    const type = document.getElementById("modal-program-type").value.trim();
    const priceCash = parseInt(document.getElementById("modal-program-price-cash").value, 10) || 0;
    const priceInstallments = parseInt(document.getElementById("modal-program-price-installments").value, 10) || 0;

    if (!name || !type) {
        alert(this.programsT("messages.required", {}, "Please enter the academic program name and type."));
        return;
    }

    const payload = {
        program_name: name,
        program_type: type,
        price_cash: priceCash,
        price_installments: priceInstallments
    };

    try {
        if (id) {
            await Api.put(`/programs/${id}`, payload);
            alert(this.programsT("messages.updated", {}, "Program details updated successfully."));
        } else {
            await Api.post("/programs/", payload);
            alert(this.programsT("messages.created", {}, "New program added successfully."));
        }

        this.closeProgramModal();
        AdminRole.loadSection("programs");
    } catch (err) {
        alert(this.programsT("messages.saveFailed", { message: err.message || this.programsT("messages.unexpected", {}, "Unexpected error") }, `Save failed: ${err.message}`));
    }
};

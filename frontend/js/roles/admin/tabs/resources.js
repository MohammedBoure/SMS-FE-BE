// frontend/js/roles/admin/tabs/resources.js

AdminUI.resourcesT = function(key, params = {}, fallback = "") {
    return this.t(`admin.resourcesTab.${key}`, params, fallback);
};

AdminUI.resourceInlineString = function(value) {
    return JSON.stringify(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
};

AdminUI.resourceTypeMeta = function(type) {
    const key = String(type || "file").toLowerCase();
    const map = {
        pdf: { icon: "file", label: this.resourcesT("types.pdf", {}, "Book / PDF") },
        document: { icon: "files", label: this.resourcesT("types.document", {}, "Text Document") },
        video: { icon: "video", label: this.resourcesT("types.video", {}, "Video") },
        image: { icon: "image", label: this.resourcesT("types.image", {}, "Image") },
        archive: { icon: "archive", label: this.resourcesT("types.archive", {}, "Archive") },
        file: { icon: "file", label: this.resourcesT("types.file", {}, "File") }
    };
    return map[key] || { icon: "file", label: type || map.file.label };
};

AdminUI.renderResourcesTab = function(response) {
    const main = this.prepareMain(this.t("admin.sections.resources", {}, "Library and Learning Resources"));
    const resources = response.data || response || [];
    const totalFiles = resources.length;
    const totalSizeMB = resources.reduce((sum, r) => sum + (parseFloat(r.file_size_mb) || 0), 0).toFixed(2);

    const headerHtml = `
        <div class="admin-page-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: white; padding: 22px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-right: 5px solid #f59e0b; flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                <div>
                    <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px; font-weight: bold;">${this.resourcesT("stats.totalFiles", {}, "Total Uploaded Files")}</div>
                    <div style="font-size: 1.8em; font-weight: bold; color: #b45309;">${totalFiles} <span style="font-size: 0.6em; color: #94a3b8;">${this.resourcesT("stats.fileUnit", {}, "files")}</span></div>
                </div>
                <div>
                    <div style="color: #64748b; font-size: 0.9em; margin-bottom: 5px; font-weight: bold;">${this.resourcesT("stats.librarySize", {}, "Total Library Size")}</div>
                    <div style="font-size: 1.8em; font-weight: bold; color: #0f172a;">${totalSizeMB} <span style="font-size: 0.6em; color: #94a3b8;">MB</span></div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex: 1; max-width: 400px; position: relative;">
                <input type="text" id="resource-search"
                       placeholder="${this.resourcesT("search.placeholder", {}, "Search by file title, description, or teacher...")}"
                       style="padding: 12px 15px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; outline: none; font-weight: bold; box-sizing: border-box;"
                       onkeyup="AdminUI.filterLocalResources(this.value)">
                <button onclick="AdminRole.loadSection('resources')" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s;" title="${this.t("admin.actions.reload", {}, "Reload")}">${this.icon("refresh", "inline-svg-icon")}</button>
            </div>
            <button onclick="AdminUI.showUploadModal()" style="background: #f59e0b; color: white; border: none; padding: 14px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(245,158,11,0.2); transition: 0.2s; font-size: 1.05em;">
                ${this.icon("upload", "inline-svg-icon")} ${this.resourcesT("actions.uploadNew", {}, "Upload New File")}
            </button>
        </div>
    `;

    main.innerHTML = `
        ${headerHtml}

        <div id="resources-table-container">
            ${this._generateResourcesTableHtml(resources)}
        </div>

        <div id="upload-modal-container" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(3px);">
            <div style="background: white; padding: 30px; border-radius: 12px; width: min(550px, calc(100vw - 28px)); max-height: calc(100vh - 28px); overflow: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">
                    <h3 style="margin: 0; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                        ${this.icon("upload", "inline-svg-icon")} ${this.resourcesT("upload.title", {}, "Upload New Learning Resource")}
                    </h3>
                    <button onclick="AdminUI.closeUploadModal()" style="background: #f1f5f9; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2em; color: #64748b;" aria-label="${this.t("admin.actions.close", {}, "Close")}">&times;</button>
                </div>

                <form id="upload-resource-form" onsubmit="AdminUI.submitResourceUpload(event)">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.resourcesT("upload.titleLabel", {}, "File Title *")}</label>
                        <input type="text" id="res-title" required placeholder="${this.resourcesT("upload.titlePlaceholder", {}, "Example: First chapter summary...")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none;">
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.resourcesT("upload.typeLabel", {}, "File Type *")}</label>
                            <select id="res-type" required style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none; background: #f8fafc; font-weight: bold;">
                                <option value="pdf">${this.resourceTypeMeta("pdf").label}</option>
                                <option value="document">${this.resourceTypeMeta("document").label}</option>
                                <option value="video">${this.resourceTypeMeta("video").label}</option>
                                <option value="image">${this.resourceTypeMeta("image").label}</option>
                                <option value="archive">${this.resourceTypeMeta("archive").label}</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.resourcesT("upload.assignmentLabel", {}, "Linked assignment (optional)")}</label>
                            <select id="res-assignment-id" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none; background: #f8fafc; font-weight: bold;">
                                <option value="">${this.resourcesT("upload.noAssignment", {}, "-- No link (general file) --")}</option>
                            </select>
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #334155;">${this.resourcesT("upload.descriptionLabel", {}, "Short description (optional)")}</label>
                        <input type="text" id="res-desc" placeholder="${this.resourcesT("upload.descriptionPlaceholder", {}, "Additional information about the file...")}" style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; outline: none;">
                    </div>

                    <div style="margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 2px dashed #94a3b8; text-align: center; transition: 0.3s;" id="upload-dropzone">
                        <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #334155; cursor: pointer;">
                            <span style="display: inline-flex; margin-bottom: 10px; color: #f59e0b;">${this.icon("upload", "inline-svg-icon")}</span>
                            <span style="display: block;">${this.resourcesT("upload.chooseFile", {}, "Click to choose the file (max 5MB)")}</span>
                            <input type="file" id="res-file" required style="display: none;" onchange="AdminUI.handleFileSelect(this)">
                        </label>
                        <div id="file-name-display" style="color: #10b981; font-weight: bold; word-break: break-all; margin-top: 10px;"></div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 12px;">
                        <button type="button" onclick="AdminUI.closeUploadModal()" style="padding: 12px 20px; border: none; background: #f1f5f9; color: #475569; border-radius: 8px; cursor: pointer; font-weight: bold;">${this.t("admin.actions.cancel", {}, "Cancel")}</button>
                        <button type="submit" id="res-submit-btn" style="padding: 12px 20px; border: none; background: #f59e0b; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(245,158,11,0.2);">${this.resourcesT("upload.startUpload", {}, "Start Upload")}</button>
                    </div>
                </form>
            </div>
        </div>

        <script>window.currentResourcesData = ${JSON.stringify(resources)};</script>
    `;
};

AdminUI._generateResourcesTableHtml = function(resources) {
    if (!resources || resources.length === 0) {
        return `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <span style="display: inline-flex; opacity: 0.55;">${this.icon("files", "inline-svg-icon")}</span>
                <p style="color: #64748b; margin-top: 15px; font-size: 1.1em; font-weight: bold;">${this.resourcesT("table.empty", {}, "The library is empty or no results match your search.")}</p>
            </div>
        `;
    }

    const rows = resources.map(resource => {
        const id = resource.resource_id || resource.id;
        const typeMeta = this.resourceTypeMeta(resource.resource_type);

        let assignmentInfo = `<span style="color: #94a3b8; font-size: 0.85em;">${this.resourcesT("table.generalFile", {}, "General File (Unlinked)")}</span>`;
        if (resource.assignment_id) {
            assignmentInfo = `
                <div style="color: #1e40af; font-size: 0.85em; font-weight: bold;">${this.icon("bookOpen", "inline-svg-icon")} ${this._escape(resource.subject_name || this.resourcesT("table.subjectFallback", {}, "Subject"))} - ${this._escape(resource.class_name || this.resourcesT("table.classFallback", {}, "Class"))}</div>
                <div style="color: #64748b; font-size: 0.8em;">${this.icon("teacher", "inline-svg-icon")} ${this.resourcesT("table.teacherLabel", {}, "Teacher:")} ${this._escape(resource.teacher_name || this.resourcesT("table.notSpecified", {}, "Not specified"))}</div>
            `;
        }

        return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td data-label="ID" style="padding: 15px; font-weight: bold; color: #64748b;">#${id}</td>
                <td data-label="${this.resourcesT("table.fileDetails", {}, "File Name and Details")}" style="padding: 15px;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <span style="display: inline-flex; margin-top: 2px;">${this.icon(typeMeta.icon, "inline-svg-icon")}</span>
                        <div>
                            <div style="font-weight: bold; color: #0f172a; font-size: 1.05em;">${this._escape(resource.title)}</div>
                            <div style="color: #64748b; font-size: 0.9em; margin-top: 3px;">${this._escape(resource.description || this.resourcesT("table.noDescription", {}, "No description"))}</div>
                        </div>
                    </div>
                </td>
                <td data-label="${this.resourcesT("table.academicLink", {}, "Academic Link")}" style="padding: 15px;">${assignmentInfo}</td>
                <td data-label="${this.resourcesT("table.type", {}, "Type")}" style="padding: 15px;">
                    <span style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 0.85em; font-weight: bold; color: #334155; text-transform: uppercase;">${this._escape(typeMeta.label)}</span>
                </td>
                <td data-label="${this.resourcesT("table.size", {}, "Size")}" style="padding: 15px; color: #0f172a; font-family: monospace; font-weight: bold; direction: ltr; text-align: right;">${resource.file_size_mb ? resource.file_size_mb + " MB" : "-"}</td>
                <td class="admin-actions-cell" data-label="${this.resourcesT("table.actions", {}, "Actions")}" style="padding: 15px; text-align: left;">
                    <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
                        <button onclick="AdminUI.downloadResource(${id}, ${this.resourceInlineString(resource.title)})" title="${this.resourcesT("actions.downloadTitle", {}, "Download file")}" style="background: #f0fdf4; color: #16a34a; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; display: flex; align-items: center; gap: 5px;">
                            ${this.icon("download", "inline-svg-icon")} ${this.t("admin.actions.download", {}, "Download")}
                        </button>
                        <button onclick="AdminRole.deleteItem('/resources', ${id}, 'resources')" title="${this.resourcesT("actions.deleteTitle", {}, "Permanent delete")}" style="background: #fef2f2; color: #dc2626; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s;">
                            ${this.icon("trash", "inline-svg-icon")}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    return `
        <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                    <thead style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <tr>
                            <th style="padding: 15px; color: #334155;">ID</th>
                            <th style="padding: 15px; color: #334155;">${this.resourcesT("table.fileDetails", {}, "File Name and Details")}</th>
                            <th style="padding: 15px; color: #334155;">${this.resourcesT("table.academicLink", {}, "Academic Link")}</th>
                            <th style="padding: 15px; color: #334155;">${this.resourcesT("table.type", {}, "Type")}</th>
                            <th style="padding: 15px; color: #334155;">${this.resourcesT("table.size", {}, "Size")}</th>
                            <th style="padding: 15px; text-align: left; color: #334155;">${this.resourcesT("table.actions", {}, "Actions")}</th>
                        </tr>
                    </thead>
                    <tbody id="resources-tbody">${rows}</tbody>
                </table>
            </div>
        </div>
    `;
};

AdminUI.filterLocalResources = function(keyword) {
    keyword = keyword.toLowerCase().trim();
    const allResources = window.currentResourcesData || [];
    const filtered = allResources.filter(resource => {
        const title = (resource.title || "").toLowerCase();
        const desc = (resource.description || "").toLowerCase();
        const teacher = (resource.teacher_name || "").toLowerCase();
        const subject = (resource.subject_name || "").toLowerCase();
        return title.includes(keyword) || desc.includes(keyword) || teacher.includes(keyword) || subject.includes(keyword);
    });
    document.getElementById("resources-table-container").innerHTML = this._generateResourcesTableHtml(filtered);
};

AdminUI.handleFileSelect = function(input) {
    const display = document.getElementById("file-name-display");
    const dropzone = document.getElementById("upload-dropzone");
    if (input.files && input.files[0]) {
        display.innerHTML = `${this.resourcesT("upload.fileSelected", {}, "Selected file:")}<br><span style="color:#0f172a;">${this._escape(input.files[0].name)}</span>`;
        dropzone.style.borderColor = "#10b981";
        dropzone.style.background = "#f0fdf4";
    } else {
        display.innerHTML = "";
        dropzone.style.borderColor = "#94a3b8";
        dropzone.style.background = "#f8fafc";
    }
};

AdminUI.showUploadModal = async function() {
    document.getElementById("upload-modal-container").style.display = "flex";

    const assignSelect = document.getElementById("res-assignment-id");
    assignSelect.innerHTML = `<option value="">${this.resourcesT("upload.loadingAssignments", {}, "Loading assignments...")}</option>`;
    try {
        const response = await Api.get("/assignments/");
        const assignments = response.data || response || [];
        assignSelect.innerHTML = `<option value="">${this.resourcesT("upload.noAssignment", {}, "-- No link (general file) --")}</option>` +
            assignments.map(assignment => {
                const id = assignment.id || assignment.assignment_id;
                const label = `${assignment.subject_name || this.resourcesT("table.subjectFallback", {}, "Subject")} - ${assignment.class_name || this.resourcesT("table.classFallback", {}, "Class")}`;
                return `<option value="${id}">${this._escape(label)}</option>`;
            }).join("");
    } catch (err) {
        assignSelect.innerHTML = `<option value="">${this.resourcesT("upload.assignmentsLoadFailed", {}, "Unable to fetch assignments; you may leave it empty")}</option>`;
    }
};

AdminUI.closeUploadModal = function() {
    document.getElementById("upload-modal-container").style.display = "none";
    document.getElementById("upload-resource-form").reset();
    document.getElementById("file-name-display").innerText = "";
    document.getElementById("upload-dropzone").style.borderColor = "#94a3b8";
    document.getElementById("upload-dropzone").style.background = "#f8fafc";
};

AdminUI.submitResourceUpload = async function(event) {
    event.preventDefault();
    const btn = document.getElementById("res-submit-btn");
    btn.disabled = true;
    btn.innerHTML = this.resourcesT("messages.uploading", {}, "Uploading...");

    const title = document.getElementById("res-title").value;
    const type = document.getElementById("res-type").value;
    const desc = document.getElementById("res-desc").value;
    const assignId = document.getElementById("res-assignment-id").value;
    const fileInput = document.getElementById("res-file");

    if (fileInput.files.length === 0) {
        this.showToast(this.resourcesT("messages.fileRequired", {}, "Please choose a file to upload."), "error");
        btn.disabled = false;
        btn.innerHTML = this.resourcesT("upload.startUpload", {}, "Start Upload");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("resource_type", type);
    if (desc) formData.append("description", desc);
    if (assignId) formData.append("assignment_id", assignId);
    formData.append("file", fileInput.files[0]);

    try {
        await Api.post("/resources/upload", formData);
        this.showToast(this.resourcesT("messages.uploadSuccess", {}, "File uploaded successfully and added to the library."));
        this.closeUploadModal();
        AdminRole.loadSection("resources");
    } catch (err) {
        this.showToast(this.resourcesT("messages.uploadFailed", { message: err.message || this.resourcesT("messages.checkFile", {}, "Check file type and size.") }, `Upload failed: ${err.message}`), "error");
        btn.disabled = false;
        btn.innerHTML = this.resourcesT("upload.startUpload", {}, "Start Upload");
    }
};

AdminUI.downloadResource = async function(resourceId, filename) {
    try {
        const session = Storage.getSession();
        const headers = {};
        if (session.token) headers.Authorization = `Bearer ${session.token}`;

        this.showToast(this.resourcesT("messages.preparingDownload", {}, "Preparing file for download, please wait..."));

        const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/download`, {
            method: "GET",
            headers
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || this.resourcesT("messages.downloadMissing", {}, "Unable to fetch the file from the server. It may be deleted or the path is invalid."));
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = downloadUrl;

        const contentFileName = response.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") || "";
        link.download = contentFileName || filename;

        document.body.appendChild(link);
        link.click();

        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);
    } catch (err) {
        this.showToast(this.resourcesT("messages.downloadFailed", { message: err.message }, `Download failed: ${err.message}`), "error");
    }
};

if (!AdminUI.showToast) {
    AdminUI.showToast = function(message, type = "success") {
        const toast = document.createElement("div");
        toast.innerText = message;
        const bgColor = type === "error" ? "#dc2626" : "#0f172a";
        toast.style.cssText = `position: fixed; bottom: 20px; left: 20px; background: ${bgColor}; color: white; padding: 12px 25px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; font-weight: bold; transition: opacity 0.5s;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = "0", 2500);
        setTimeout(() => toast.remove(), 3000);
    };
}

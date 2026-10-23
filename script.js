
/* ==========================================================
   CLOUDNOVA - SMART CLOUD STORAGE MANAGER
   Interactive Frontend Application
   ========================================================== */

"use strict";

/* ===================== 1. CONFIGURATION ===================== */

const CONFIG = {
    storageLimit: 15 * 1024 * 1024 * 1024,
    storageKey: "cloudnova_files_v1",
    foldersKey: "cloudnova_folders_v1",
    themeKey: "cloudnova_theme_v1",
    activityKey: "cloudnova_activity_v1",
    maxFileSize: 100 * 1024 * 1024
};

/* ===================== 2. DOM HELPERS ===================== */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

const elements = {
    sidebar: $("#sidebar"),
    menuToggle: $("#menuToggle"),
    globalSearch: $("#globalSearch"),
    themeToggle: $("#themeToggle"),
    notificationButton: $("#notificationButton"),

    uploadButton: $("#uploadButton"),
    quickUpload: $("#quickUpload"),
    fileInput: $("#fileInput"),
    emptyUploadButton: $("#emptyUploadButton"),

    newFolderButton: $("#newFolderButton"),
    quickFolder: $("#quickFolder"),
    folderModal: $("#folderModal"),
    folderForm: $("#folderForm"),
    folderName: $("#folderName"),

    detailsModal: $("#detailsModal"),
    detailsTitle: $("#detailsTitle"),
    detailsDescription: $("#detailsDescription"),
    detailsList: $("#detailsList"),

    notificationModal: $("#notificationModal"),
    toastContainer: $("#toastContainer"),

    fileGrid: $("#fileGrid"),
    fileTableWrapper: $("#fileTableWrapper"),
    fileTableBody: $("#fileTableBody"),
    emptyState: $("#emptyState"),

    fileFilters: $("#fileFilters"),
    gridViewButton: $("#gridViewButton"),
    listViewButton: $("#listViewButton"),
    sortSelect: $("#sortSelect"),

    totalFiles: $("#totalFiles"),
    totalStorage: $("#totalStorage"),
    sharedFiles: $("#sharedFiles"),
    totalUploads: $("#totalUploads"),

    sidebarUsed: $("#sidebarUsed"),
    sidebarProgress: $("#sidebarProgress"),
    storageMessage: $("#storageMessage"),

    donutChart: $("#donutChart"),
    donutPercentage: $("#donutPercentage"),
    documentsSize: $("#documentsSize"),
    imagesSize: $("#imagesSize"),
    videosSize: $("#videosSize"),
    othersSize: $("#othersSize"),
    availableStorage: $("#availableStorage"),

    breadcrumbTitle: $("#breadcrumbTitle"),
    filesHeadingTitle: $("#filesHeadingTitle"),
    fileCountText: $("#fileCountText"),
    currentYear: $("#currentYear"),

    activityList: $("#activityList"),
    favoritesList: $("#favoritesList")
};

/* ===================== 3. APPLICATION STATE ===================== */

const state = {
    files: [],
    folders: [],
    activity: [],
    filter: "all",
    search: "",
    sort: "name",
    view: "grid",
    currentPage: "dashboard",
    showTrash: false,
    toastId: 0
};

/*
  Uploaded files are browser-local demo records.
  No remote cloud server is connected.
*/

const objectUrls = new Map();

/* ===================== 4. DEMO DATA ===================== */

function createInitialFiles() {
    const now = Date.now();

    return [
        {
            id: "demo-pdf",
            name: "Project_Report.pdf",
            type: "application/pdf",
            category: "document",
            size: 2.4 * 1024 * 1024,
            modified: now - 10 * 60 * 1000,
            starred: true,
            shared: false,
            deleted: false,
            demo: true
        },
        {
            id: "demo-word",
            name: "Meeting_Notes.docx",
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            category: "document",
            size: 640 * 1024,
            modified: now - 24 * 60 * 60 * 1000,
            starred: true,
            shared: false,
            deleted: false,
            demo: true
        },
        {
            id: "demo-image",
            name: "Dashboard_UI.png",
            type: "image/png",
            category: "image",
            size: 1.8 * 1024 * 1024,
            modified: now - 2 * 60 * 60 * 1000,
            starred: true,
            shared: true,
            deleted: false,
            demo: true
        },
        {
            id: "demo-excel",
            name: "Storage_Analytics.xlsx",
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            category: "document",
            size: 850 * 1024,
            modified: now - 3 * 60 * 60 * 1000,
            starred: false,
            shared: true,
            deleted: false,
            demo: true
        },
        {
            id: "demo-video",
            name: "Product_Demo.mp4",
            type: "video/mp4",
            category: "video",
            size: 900 * 1024 * 1024,
            modified: now - 5 * 60 * 60 * 1000,
            starred: false,
            shared: false,
            deleted: false,
            demo: true
        },
        {
            id: "demo-zip",
            name: "Design_Assets.zip",
            type: "application/zip",
            category: "other",
            size: 250 * 1024 * 1024,
            modified: now - 60 * 60 * 1000,
            starred: false,
            shared: true,
            deleted: false,
            demo: true
        },
        {
            id: "demo-photo",
            name: "Team_Photo.jpg",
            type: "image/jpeg",
            category: "image",
            size: 850 * 1024 * 1024,
            modified: now - 4 * 60 * 60 * 1000,
            starred: false,
            shared: false,
            deleted: false,
            demo: true
        },
        {
            id: "demo-audio",
            name: "Presentation_Audio.mp3",
            type: "audio/mpeg",
            category: "other",
            size: 250 * 1024 * 1024,
            modified: now - 8 * 60 * 60 * 1000,
            starred: false,
            shared: false,
            deleted: false,
            demo: true
        }
    ];
}

/* ===================== 5. SAFE STORAGE ===================== */

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return fallback;
        }

        return JSON.parse(value);
    } catch (error) {
        console.warn("Could not read saved data:", error);
        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn("Could not save data:", error);
        showToast(
            "Browser storage is full",
            "Some changes could not be saved. Try removing saved records.",
            "warning"
        );
        return false;
    }
}

function loadApplicationData() {
    const savedFiles = readStorage(CONFIG.storageKey, null);

    if (Array.isArray(savedFiles)) {
        state.files = savedFiles;
    } else {
        state.files = createInitialFiles();
        saveStorage(CONFIG.storageKey, state.files);
    }

    const savedFolders = readStorage(CONFIG.foldersKey, []);

    state.folders = Array.isArray(savedFolders)
        ? savedFolders
        : [];

    const savedActivity = readStorage(CONFIG.activityKey, []);

    state.activity = Array.isArray(savedActivity)
        ? savedActivity
        : [];

    state.files = state.files.map(file => ({
        ...file,
        deleted: Boolean(file.deleted),
        starred: Boolean(file.starred),
        shared: Boolean(file.shared)
    }));
}

/* ===================== 6. SAVE APPLICATION DATA ===================== */

function saveFiles() {
    const serializableFiles = state.files.map(file => {
        const {
            fileObject,
            ...metadata
        } = file;

        return metadata;
    });

    saveStorage(CONFIG.storageKey, serializableFiles);
}

function saveFolders() {
    saveStorage(CONFIG.foldersKey, state.folders);
}

function saveActivity() {
    saveStorage(CONFIG.activityKey, state.activity);
}

/* ===================== 7. UNIQUE IDENTIFIERS ===================== */

function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return "file-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 10);
}

/* ===================== 8. HTML ESCAPING ===================== */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}

/* ===================== 9. FILE FORMATTING ===================== */

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );

    const value = bytes / Math.pow(1024, index);

    return value.toFixed(index === 0 ? 0 : 1) + " " + units[index];
}

function formatDate(timestamp) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function timeAgo(timestamp) {
    const seconds = Math.max(
        0,
        Math.floor((Date.now() - timestamp) / 1000)
    );

    if (seconds < 60) {
        return "Just now";
    }

    if (seconds < 3600) {
        return Math.floor(seconds / 60) + " min ago";
    }

    if (seconds < 86400) {
        return Math.floor(seconds / 3600) + " hours ago";
    }

    if (seconds < 604800) {
        return Math.floor(seconds / 86400) + " days ago";
    }

    return formatDate(timestamp);
}

function getExtension(filename) {
    const parts = filename.split(".");

    if (parts.length < 2) {
        return "";
    }

    return parts.pop().toLowerCase();
}

/* ===================== 10. FILE TYPE DETECTION ===================== */

function getCategory(file) {
    const extension = getExtension(file.name);
    const type = file.type || "";

    if (
        type.startsWith("image/") ||
        ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif"].includes(extension)
    ) {
        return "image";
    }

    if (
        type.startsWith("video/") ||
        ["mp4", "webm", "mov", "avi", "mkv"].includes(extension)
    ) {
        return "video";
    }

    if (
        type.startsWith("text/") ||
        type.includes("pdf") ||
        type.includes("document") ||
        type.includes("word") ||
        type.includes("spreadsheet") ||
        type.includes("presentation") ||
        [
            "pdf", "doc", "docx", "txt", "rtf",
            "odt", "xls", "xlsx", "csv", "ppt", "pptx"
        ].includes(extension)
    ) {
        return "document";
    }

    return "other";
}

function getFileIcon(file) {
    const extension = getExtension(file.name);

    if (file.category === "image") {
        return {
            icon: "fa-file-image",
            color: "image"
        };
    }

    if (file.category === "video") {
        return {
            icon: "fa-file-video",
            color: "video"
        };
    }

    if (extension === "pdf") {
        return {
            icon: "fa-file-pdf",
            color: "pdf"
        };
    }

    if (["doc", "docx", "rtf", "odt"].includes(extension)) {
        return {
            icon: "fa-file-word",
            color: "word"
        };
    }

    if (["xls", "xlsx", "csv"].includes(extension)) {
        return {
            icon: "fa-file-excel",
            color: "excel"
        };
    }

    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
        return {
            icon: "fa-file-zipper",
            color: "archive"
        };
    }

    if (["mp3", "wav", "ogg", "m4a"].includes(extension)) {
        return {
            icon: "fa-file-audio",
            color: "audio"
        };
    }

    if (file.category === "document") {
        return {
            icon: "fa-file-lines",
            color: "word"
        };
    }

    return {
        icon: "fa-file",
        color: "other"
    };
}

/* ===================== 11. FIND FILES ===================== */

function findFile(id) {
    return state.files.find(file => file.id === id);
}

function getVisibleFiles() {
    let files = state.files.filter(file => {
        if (state.showTrash) {
            return file.deleted;
        }

        return !file.deleted;
    });

    if (state.currentPage === "starred") {
        files = files.filter(file => file.starred);
    } else if (state.currentPage === "shared") {
        files = files.filter(file => file.shared);
    } else if (state.currentPage === "recent") {
        files.sort((a, b) => b.modified - a.modified);
        files = files.slice(0, 20);
    }

    if (state.filter !== "all" && !state.showTrash) {
        files = files.filter(file => file.category === state.filter);
    }

    if (state.search.trim()) {
        const searchTerm = state.search.toLowerCase().trim();

        files = files.filter(file =>
            file.name.toLowerCase().includes(searchTerm)
        );
    }

    switch (state.sort) {
        case "size":
            files.sort((a, b) => b.size - a.size);
            break;

        case "date":
            files.sort((a, b) => b.modified - a.modified);
            break;

        case "type":
            files.sort((a, b) =>
                a.category.localeCompare(b.category)
            );
            break;

        default:
            files.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
    }

    return files;
}

/* ===================== 12. RENDER FILE CARD ===================== */

function renderFileCard(file) {
    const fileIcon = getFileIcon(file);

    const safeName = escapeHTML(file.name);
    const safeId = escapeHTML(file.id);

    const starClass = file.starred ? "starred" : "";
    const starIcon = file.starred ? "fa-solid" : "fa-regular";

    const sharedBadge = file.shared
        ? `<span class="shared-badge">
               <i class="fa-solid fa-share-nodes"></i>
               Shared
           </span>`
        : "";

    const trashAction = state.showTrash
        ? `<button class="file-action-button"
                   data-action="restore" data-id="${safeId}">
               <i class="fa-solid fa-rotate-left"></i> Restore
           </button>
           <button class="file-action-button"
                   data-action="delete-permanently" data-id="${safeId}">
               <i class="fa-solid fa-trash"></i>
           </button>`
        : `<button class="file-action-button ${starClass}"
                   data-action="star" data-id="${safeId}"
                   aria-label="${file.starred ? "Unstar" : "Star"} file">
               <i class="${starIcon} fa-star"></i>
           </button>
           <button class="file-action-button"
                   data-action="details" data-id="${safeId}">
               <i class="fa-solid fa-circle-info"></i>
               Details
           </button>`;

    return `
        <article class="file-card" data-id="${safeId}">

            <div class="file-card-top">
                <div class="file-type-icon ${fileIcon.color}">
                    <i class="fa-solid ${fileIcon.icon}"></i>
                </div>

                <button class="more-button"
                        data-action="details"
                        data-id="${safeId}"
                        aria-label="View ${safeName} details">
                    <i class="fa-solid fa-ellipsis"></i>
                </button>
            </div>

            <h3 title="${safeName}">${safeName}</h3>

            <p>${escapeHTML(file.category.toUpperCase())}</p>

            ${sharedBadge}

            <div class="file-card-footer">
                <span class="file-size">${formatBytes(file.size)}</span>
                <span class="file-date">${timeAgo(file.modified)}</span>
            </div>

            <div class="file-card-actions">
                ${trashAction}
            </div>

        </article>
    `;
}

/* ===================== 13. RENDER FILE TABLE ===================== */

function renderFileTable(files) {
    if (!elements.fileTableBody) {
        return;
    }

    elements.fileTableBody.innerHTML = files.map(file => {
        const icon = getFileIcon(file);
        const safeName = escapeHTML(file.name);
        const safeId = escapeHTML(file.id);

        const action = state.showTrash
            ? `<button class="table-action-button"
                       data-action="restore" data-id="${safeId}">
                   Restore
               </button>`
            : `<button class="table-action-button"
                       data-action="details" data-id="${safeId}">
                   Details
               </button>`;

        return `
            <tr>
                <td>
                    <div class="table-file-name">
                        <div class="file-type-icon ${icon.color}">
                            <i class="fa-solid ${icon.icon}"></i>
                        </div>
                        <span>${safeName}</span>
                    </div>
                </td>

                <td>${escapeHTML(file.category)}</td>
                <td>${formatBytes(file.size)}</td>
                <td>${formatDate(file.modified)}</td>
                <td>${action}</td>
            </tr>
        `;
    }).join("");
}

/* ===================== 14. RENDER FILES ===================== */

function renderFiles() {
    const files = getVisibleFiles();

    if (!elements.fileGrid) {
        return;
    }

    elements.fileGrid.innerHTML = files.map(renderFileCard).join("");

    elements.fileGrid.classList.toggle(
        "list-view",
        state.view === "list"
    );

    if (elements.emptyState) {
        elements.emptyState.hidden = files.length !== 0;
    }

    if (elements.fileGrid) {
        elements.fileGrid.hidden = state.view === "list";
    }

    if (elements.fileTableWrapper) {
        elements.fileTableWrapper.hidden = state.view !== "list";
    }

    renderFileTable(files);

    if (elements.fileCountText) {
        elements.fileCountText.textContent =
            `Showing ${files.length} file${files.length === 1 ? "" : "s"}`;
    }

    if (elements.gridViewButton) {
        elements.gridViewButton.classList.toggle(
            "active",
            state.view === "grid"
        );
    }

    if (elements.listViewButton) {
        elements.listViewButton.classList.toggle(
            "active",
            state.view === "list"
        );
    }
}

/* ===================== 15. STORAGE STATISTICS ===================== */

function calculateStorage() {
    const activeFiles = state.files.filter(file => !file.deleted);

    const usedBytes = activeFiles.reduce(
        (total, file) => total + file.size,
        0
    );

    const categories = {
        document: 0,
        image: 0,
        video: 0,
        other: 0
    };

    activeFiles.forEach(file => {
        const category = categories[file.category] !== undefined
            ? file.category
            : "other";

        categories[category] += file.size;
    });

    const availableBytes = Math.max(
        0,
        CONFIG.storageLimit - usedBytes
    );

    const percentage = Math.min(
        100,
        (usedBytes / CONFIG.storageLimit) * 100
    );

    return {
        activeFiles,
        usedBytes,
        availableBytes,
        percentage,
        categories
    };
}

function updateStatistics() {
    const stats = calculateStorage();

    if (elements.totalFiles) {
        elements.totalFiles.textContent =
            stats.activeFiles.length.toLocaleString("en-IN");
    }

    if (elements.totalStorage) {
        elements.totalStorage.textContent = formatBytes(stats.usedBytes);
    }

    if (elements.sharedFiles) {
        elements.sharedFiles.textContent =
            stats.activeFiles.filter(file => file.shared).length;
    }

    if (elements.totalUploads) {
        elements.totalUploads.textContent =
            stats.activeFiles.filter(file => !file.demo).length;
    }

    if (elements.sidebarUsed) {
        elements.sidebarUsed.textContent = formatBytes(stats.usedBytes);
    }

    if (elements.sidebarProgress) {
        elements.sidebarProgress.style.width =
            stats.percentage + "%";
    }

    if (elements.storageMessage) {
        elements.storageMessage.textContent =
            stats.percentage.toFixed(1) + "% of your storage used";
    }

    if (elements.donutPercentage) {
        elements.donutPercentage.textContent =
            Math.round(stats.percentage) + "%";
    }

    if (elements.availableStorage) {
        elements.availableStorage.textContent =
            formatBytes(stats.availableBytes);
    }

    if (elements.documentsSize) {
        elements.documentsSize.textContent =
            formatBytes(stats.categories.document);
    }

    if (elements.imagesSize) {
        elements.imagesSize.textContent =
            formatBytes(stats.categories.image);
    }

    if (elements.videosSize) {
        elements.videosSize.textContent =
            formatBytes(stats.categories.video);
    }

    if (elements.othersSize) {
        elements.othersSize.textContent =
            formatBytes(stats.categories.other);
    }

    if (elements.donutChart) {
        const total = stats.usedBytes || 1;
        const documentDegrees =
            stats.categories.document / total * 360;
        const imageDegrees =
            stats.categories.image / total * 360;
        const videoDegrees =
            stats.categories.video / total * 360;

        const first = documentDegrees;
        const second = first + imageDegrees;
        const third = second + videoDegrees;

        elements.donutChart.style.background = `
            conic-gradient(
                #7968f5 0deg ${first}deg,
                #4c91f5 ${first}deg ${second}deg,
                #36b78b ${second}deg ${third}deg,
                #f3a64a ${third}deg 360deg
            )
        `;
    }
}

/* ===================== 16. ACTIVITY LOG ===================== */

function addActivity(title, description) {
    state.activity.unshift({
        id: createId(),
        title,
        description,
        timestamp: Date.now()
    });

    state.activity = state.activity.slice(0, 30);

    saveActivity();
    renderActivity();
}

function renderActivity() {
    if (!elements.activityList) {
        return;
    }

    const items = state.activity.slice(0, 5);

    if (items.length === 0) {
        elements.activityList.innerHTML = `
            <p class="empty-activity">
                No new activity yet. Upload a file to get started.
            </p>
        `;
        return;
    }

    elements.activityList.innerHTML = items.map(item => `
        <div class="activity-item">
            <div class="activity-icon purple">
                <i class="fa-solid fa-clock"></i>
            </div>

            <div class="activity-details">
                <strong>${escapeHTML(item.title)}</strong>
                <p>${escapeHTML(item.description)}</p>
            </div>

            <span class="activity-time">
                ${timeAgo(item.timestamp)}
            </span>
        </div>
    `).join("");
}

/* ===================== 17. STARRED FILES ===================== */

function renderFavorites() {
    if (!elements.favoritesList) {
        return;
    }

    const favorites = state.files
        .filter(file => file.starred && !file.deleted)
        .slice(0, 5);

    if (favorites.length === 0) {
        elements.favoritesList.innerHTML = `
            <p class="empty-activity">
                Star a file to keep it here for quick access.
            </p>
        `;
        return;
    }

    elements.favoritesList.innerHTML = favorites.map(file => {
        const icon = getFileIcon(file);
        const safeId = escapeHTML(file.id);

        return `
            <div class="favorite-item">
                <div class="file-type-icon ${icon.color}">
                    <i class="fa-solid ${icon.icon}"></i>
                </div>

                <div class="favorite-info">
                    <strong>${escapeHTML(file.name)}</strong>
                    <span>
                        ${formatBytes(file.size)} ·
                        ${escapeHTML(file.category)}
                    </span>
                </div>

                <button class="more-button"
                        data-action="details"
                        data-id="${safeId}"
                        aria-label="View file details">
                    <i class="fa-solid fa-ellipsis"></i>
                </button>
            </div>
        `;
    }).join("");
}

/* ===================== 18. FULL REFRESH ===================== */

function refreshDashboard() {
    renderFiles();
    updateStatistics();
    renderFavorites();
    renderActivity();
}

/* ===================== 19. TOAST MESSAGES ===================== */

function showToast(title, message, type = "success") {
    if (!elements.toastContainer) {
        alert(title + "\n" + message);
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icons = {
        success: "fa-circle-check",
        error: "fa-circle-exclamation",
        warning: "fa-triangle-exclamation",
        info: "fa-circle-info"
    };

    const icon = icons[type] || icons.success;

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>

        <div class="toast-content">
            <strong>${escapeHTML(title)}</strong>
            <p>${escapeHTML(message)}</p>
        </div>

        <button class="toast-close" aria-label="Dismiss">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    elements.toastContainer.appendChild(toast);

    const removeToast = () => {
        if (!toast.isConnected) {
            return;
        }

        toast.classList.add("removing");

        setTimeout(() => toast.remove(), 250);
    };

    $(".toast-close", toast).addEventListener("click", removeToast);

    setTimeout(removeToast, 4000);
}

/* ===================== 20. MODAL HELPERS ===================== */

function openModal(modal) {
    if (!modal) {
        return;
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
}

function closeModal(modal) {
    if (!modal) {
        return;
    }

    modal.hidden = true;

    if (!$(".modal-overlay:not([hidden])")) {
        document.body.style.overflow = "";
    }
}

function closeAllModals() {
    $$(".modal-overlay").forEach(modal => {
        modal.hidden = true;
    });

    document.body.style.overflow = "";
}

/* ===================== 21. FOLDER CREATION ===================== */

function createFolder(name) {
    const cleanName = name.trim();

    if (!cleanName) {
        showToast(
            "Folder name required",
            "Please enter a name for your folder.",
            "warning"
        );
        return false;
    }

    const duplicate = state.folders.some(folder =>
        folder.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (duplicate) {
        showToast(
            "Folder already exists",
            "Choose a different folder name.",
            "warning"
        );
        return false;
    }

    state.folders.push({
        id: createId(),
        name: cleanName,
        created: Date.now()
    });

    saveFolders();

    addActivity(cleanName, "New folder created");

    showToast(
        "Folder created",
        `"${cleanName}" was added to your workspace.`
    );

    return true;
}

function handleFolderSubmit(event) {
    event.preventDefault();

    if (!elements.folderName) {
        return;
    }

    const success = createFolder(elements.folderName.value);

    if (success) {
        elements.folderForm.reset();
        closeModal(elements.folderModal);
    }
}

/* ===================== 22. UPLOAD FILES ===================== */

function handleUploadClick() {
    if (elements.fileInput) {
        elements.fileInput.click();
    }
}

function handleSelectedFiles(event) {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
        return;
    }

    let addedCount = 0;
    let rejectedCount = 0;

    const currentStorage = calculateStorage().usedBytes;

    let projectedStorage = currentStorage;

    selectedFiles.forEach(fileObject => {
        if (fileObject.size > CONFIG.maxFileSize) {
            rejectedCount++;

            showToast(
                "File too large",
                `${fileObject.name} exceeds the 100 MB demo limit.`,
                "warning"
            );

            return;
        }

        if (projectedStorage + fileObject.size > CONFIG.storageLimit) {
            rejectedCount++;

            showToast(
                "Storage limit reached",
                `${fileObject.name} cannot fit in the available demo storage.`,
                "warning"
            );

            return;
        }

        const id = createId();

        const file = {
            id,
            name: fileObject.name,
            type: fileObject.type || "application/octet-stream",
            category: getCategory(fileObject),
            size: fileObject.size,
            modified: Date.now(),
            starred: false,
            shared: false,
            deleted: false,
            demo: false,
            fileObject
        };

        state.files.unshift(file);

        projectedStorage += fileObject.size;

        addedCount++;

        addActivity(
            fileObject.name,
            "File added to browser demo workspace"
        );
    });

    saveFiles();
    refreshDashboard();

    if (addedCount > 0) {
        showToast(
            "Upload completed",
            `${addedCount} file${addedCount === 1 ? "" : "s"} added to the demo workspace.`
        );
    }

    if (rejectedCount > 0) {
        showToast(
            "Some files were skipped",
            `${rejectedCount} file${rejectedCount === 1 ? "" : "s"} could not be added.`,
            "warning"
        );
    }

    // Allow the same file to be selected again.
    event.target.value = "";
}

/* ===================== 23. FILE DETAILS ===================== */

function showFileDetails(id) {
    const file = findFile(id);

    if (!file) {
        showToast(
            "File not found",
            "This file may have been removed.",
            "error"
        );
        return;
    }

    if (elements.detailsTitle) {
        elements.detailsTitle.textContent = file.name;
    }

    if (elements.detailsDescription) {
        elements.detailsDescription.textContent =
            "File information stored in this browser demo.";
    }

    const details = [
        ["File name", file.name],
        ["File type", file.type || "Unknown"],
        ["Category", file.category],
        ["File size", formatBytes(file.size)],
        ["Modified", formatDate(file.modified)],
        ["Starred", file.starred ? "Yes" : "No"],
        ["Shared", file.shared ? "Yes" : "No"],
        ["Status", file.deleted ? "In Trash" : "Active"],
        ["Storage", file.demo ? "Sample demo record" : "Browser demo record"]
    ];

    if (elements.detailsList) {
        elements.detailsList.innerHTML = details.map(([label, value]) => `
            <div class="details-row">
                <span>${escapeHTML(label)}</span>
                <strong>${escapeHTML(value)}</strong>
            </div>
        `).join("");
    }

    openModal(elements.detailsModal);
}

/* ===================== 24. STAR AND UNSTAR ===================== */

function toggleStar(id) {
    const file = findFile(id);

    if (!file || file.deleted) {
        return;
    }

    file.starred = !file.starred;
    file.modified = Date.now();

    saveFiles();
    refreshDashboard();

    addActivity(
        file.name,
        file.starred ? "Added to starred files" : "Removed from starred files"
    );

    showToast(
        file.starred ? "File starred" : "Star removed",
        file.name
    );
}

/* ===================== 25. SHARE FILE ===================== */

function toggleShare(id) {
    const file = findFile(id);

    if (!file || file.deleted) {
        return;
    }

    file.shared = !file.shared;

    saveFiles();
    refreshDashboard();

    addActivity(
        file.name,
        file.shared
            ? "Marked as shared in the demo"
            : "Removed shared status in the demo"
    );

    showToast(
        file.shared ? "Sharing enabled" : "Sharing disabled",
        file.shared
            ? "The file is marked as shared locally. No one has been sent a link."
            : "The file is no longer marked as shared."
    );
}

/* ===================== 26. DOWNLOAD FILE ===================== */

function downloadFile(id) {
    const file = findFile(id);

    if (!file || file.deleted) {
        showToast(
            "File unavailable",
            "This file is no longer available for download.",
            "error"
        );
        return;
    }

    if (file.fileObject instanceof Blob) {
        const url = URL.createObjectURL(file.fileObject);
        const link = document.createElement("a");

        link.href = url;
        link.download = file.name;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        addActivity(file.name, "File downloaded");
        showToast("Download started", file.name);

        return;
    }

    showToast(
        "Sample file",
        "This sample record has no original file data. Upload a real file to download it.",
        "info"
    );
}

/* ===================== 27. TRASH AND RESTORE ===================== */

function moveToTrash(id) {
    const file = findFile(id);

    if (!file || file.deleted) {
        return;
    }

    file.deleted = true;

    saveFiles();
    refreshDashboard();

    addActivity(file.name, "Moved to trash");

    showToast(
        "Moved to trash",
        `${file.name} can be restored from Trash.`
    );
}

function restoreFile(id) {
    const file = findFile(id);

    if (!file || !file.deleted) {
        return;
    }

    file.deleted = false;

    saveFiles();
    refreshDashboard();

    addActivity(file.name, "Restored from trash");

    showToast("File restored", file.name);
}

function deletePermanently(id) {
    const file = findFile(id);

    if (!file || !file.deleted) {
        return;
    }

    const confirmed = window.confirm(
        `Permanently delete "${file.name}" from this demo?`
    );

    if (!confirmed) {
        return;
    }

    state.files = state.files.filter(item => item.id !== id);

    saveFiles();
    refreshDashboard();

    showToast(
        "File removed",
        "The file record was permanently removed from this demo."
    );
}

/* ===================== 28. FILE ACTION DISPATCHER ===================== */

function handleFileAction(event) {
    const button = event.target.closest("[data-action]");

    if (!button) {
        return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;

    switch (action) {
        case "details":
            showFileDetails(id);
            break;

        case "star":
            toggleStar(id);
            break;

        case "share":
            toggleShare(id);
            break;

        case "download":
            downloadFile(id);
            break;

        case "trash":
            moveToTrash(id);
            break;

        case "restore":
            restoreFile(id);
            break;

        case "delete-permanently":
            deletePermanently(id);
            break;

        default:
            console.warn("Unknown file action:", action);
    }
}

/* ===================== 29. SEARCH ===================== */

function handleSearch(event) {
    state.search = event.target.value;
    renderFiles();
}

function setupSearchShortcut() {
    document.addEventListener("keydown", event => {
        const isShortcut = (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k";

        if (isShortcut) {
            event.preventDefault();

            if (elements.globalSearch) {
                elements.globalSearch.focus();
            }
        }

        if (event.key === "Escape") {
            closeAllModals();

            if (elements.sidebar) {
                elements.sidebar.classList.remove("open");
            }
        }
    });
}

/* ===================== 30. FILE FILTERS ===================== */

function handleFilterClick(event) {
    const button = event.target.closest("[data-filter]");

    if (!button) {
        return;
    }

    state.filter = button.dataset.filter;

    $$(".filter-button", elements.fileFilters).forEach(item => {
        item.classList.toggle("active", item === button);
    });

    renderFiles();
}

/* ===================== 31. GRID AND LIST VIEW ===================== */

function setView(view) {
    state.view = view;
    renderFiles();
}

/* ===================== 32. SORTING ===================== */

function handleSort(event) {
    state.sort = event.target.value;
    renderFiles();
}

/* ===================== 33. PAGE NAVIGATION ===================== */

function navigateTo(page) {
    const supportedPages = [
        "dashboard",
        "my-files",
        "recent",
        "starred",
        "shared",
        "trash",
        "analytics",
        "activity",
        "settings"
    ];

    if (!supportedPages.includes(page)) {
        page = "dashboard";
    }

    state.currentPage = page;
    state.showTrash = page === "trash";
    state.filter = "all";

    $$(".filter-button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === "all"
        );
    });

    const pageNames = {
        dashboard: "Dashboard",
        "my-files": "My Files",
        recent: "Recent Files",
        starred: "Starred Files",
        shared: "Shared Files",
        trash: "Trash",
        analytics: "Storage Analytics",
        activity: "Activity Log",
        settings: "Settings"
    };

    const pageName = pageNames[page];

    if (elements.breadcrumbTitle) {
        elements.breadcrumbTitle.textContent = pageName;
    }

    if (elements.filesHeadingTitle) {
        elements.filesHeadingTitle.textContent =
            state.showTrash ? "Trash" : pageName;
    }

    $$(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === page
        );
    });

    if (elements.sidebar) {
        elements.sidebar.classList.remove("open");
    }

    if (page === "dashboard") {
        $("#dashboard")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } else {
        $("#my-files")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    if (page === "analytics") {
        $("#dashboard")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        showToast(
            "Storage Analytics",
            "Review the storage overview and category breakdown."
        );
    }

    if (page === "settings") {
        showToast(
            "Settings",
            "Use the theme button in the top bar to change appearance."
        );
    }

    refreshDashboard();
}

function handleNavigation(event) {
    const link = event.target.closest(".nav-link");

    if (!link) {
        return;
    }

    event.preventDefault();

    navigateTo(link.dataset.page);
}

/* ===================== 34. THEME SWITCHING ===================== */

function applyTheme(theme) {
    const dark = theme === "dark";

    document.body.classList.toggle("dark-theme", dark);

    if (elements.themeToggle) {
        elements.themeToggle.innerHTML = dark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-regular fa-moon"></i>';

        elements.themeToggle.setAttribute(
            "aria-label",
            dark ? "Switch to light theme" : "Switch to dark theme"
        );
    }

    try {
        localStorage.setItem(CONFIG.themeKey, dark ? "dark" : "light");
    } catch (error) {
        console.warn("Could not save theme preference:", error);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains("dark-theme");

    applyTheme(isDark ? "light" : "dark");
}

function loadTheme() {
    let theme = "light";

    try {
        theme = localStorage.getItem(CONFIG.themeKey) || "light";
    } catch (error) {
        console.warn("Could not read theme preference:", error);
    }

    applyTheme(theme);
}

/* ===================== 35. MOBILE SIDEBAR ===================== */

function toggleSidebar() {
    if (!elements.sidebar) {
        return;
    }

    elements.sidebar.classList.toggle("open");
}

document.addEventListener("click", event => {
    if (!elements.sidebar || window.innerWidth > 760) {
        return;
    }

    const clickedInsideSidebar = elements.sidebar.contains(event.target);
    const clickedMenu = elements.menuToggle?.contains(event.target);

    if (
        !clickedInsideSidebar &&
        !clickedMenu &&
        elements.sidebar.classList.contains("open")
    ) {
        elements.sidebar.classList.remove("open");
    }
});

/* ===================== 36. NOTIFICATIONS ===================== */

function openNotifications() {
    openModal(elements.notificationModal);
}

/* ===================== 37. UPGRADE STORAGE ===================== */

function handleUpgrade() {
    showToast(
        "Upgrade Plan",
        "This is a frontend demo. Connect a backend and billing provider to offer real storage upgrades.",
        "info"
    );
}

/* ===================== 38. QUICK ACTIONS ===================== */

function openNewFolder() {
    openModal(elements.folderModal);

    setTimeout(() => {
        elements.folderName?.focus();
    }, 50);
}

function openQuickRecent() {
    navigateTo("recent");
}

function openQuickAnalytics() {
    navigateTo("analytics");
}

function viewAllFiles() {
    navigateTo("my-files");
}

function viewAllActivity() {
    navigateTo("activity");
}

/* ===================== 39. MODAL CLOSE HANDLERS ===================== */

document.addEventListener("click", event => {
    const closeButton = event.target.closest("[data-close-modal]");

    if (closeButton) {
        closeModal(
            document.getElementById(closeButton.dataset.closeModal)
        );
        return;
    }

    if (event.target.classList.contains("modal-overlay")) {
        closeModal(event.target);
    }
});

/* ===================== 40. EVENT LISTENERS ===================== */

function setupEventListeners() {
    elements.menuToggle?.addEventListener("click", toggleSidebar);

    elements.globalSearch?.addEventListener("input", handleSearch);

    elements.themeToggle?.addEventListener("click", toggleTheme);

    elements.notificationButton?.addEventListener(
        "click",
        openNotifications
    );

    elements.uploadButton?.addEventListener(
        "click",
        handleUploadClick
    );

    elements.quickUpload?.addEventListener(
        "click",
        handleUploadClick
    );

    elements.emptyUploadButton?.addEventListener(
        "click",
        handleUploadClick
    );

    elements.fileInput?.addEventListener(
        "change",
        handleSelectedFiles
    );

    elements.newFolderButton?.addEventListener(
        "click",
        openNewFolder
    );

    elements.quickFolder?.addEventListener(
        "click",
        openNewFolder
    );

    elements.folderForm?.addEventListener(
        "submit",
        handleFolderSubmit
    );

    elements.fileGrid?.addEventListener(
        "click",
        handleFileAction
    );

    elements.fileTableBody?.addEventListener(
        "click",
        handleFileAction
    );

    elements.favoritesList?.addEventListener(
        "click",
        handleFileAction
    );

    elements.fileFilters?.addEventListener(
        "click",
        handleFilterClick
    );

    elements.gridViewButton?.addEventListener(
        "click",
        () => setView("grid")
    );

    elements.listViewButton?.addEventListener(
        "click",
        () => setView("list")
    );

    elements.sortSelect?.addEventListener(
        "change",
        handleSort
    );

    elements.sidebar?.addEventListener(
        "click",
        handleNavigation
    );

    $("#upgradeButton")?.addEventListener(
        "click",
        handleUpgrade
    );

    $("#quickRecent")?.addEventListener(
        "click",
        openQuickRecent
    );

    $("#quickAnalytics")?.addEventListener(
        "click",
        openQuickAnalytics
    );

    $("#viewAllButton")?.addEventListener(
        "click",
        viewAllFiles
    );

    $("#viewActivityButton")?.addEventListener(
        "click",
        viewAllActivity
    );

    $("#storageMoreButton")?.addEventListener("click", () => {
        showToast(
            "Storage Overview",
            "Storage usage is calculated from active demo file records.",
            "info"
        );
    });

    $("#profileMenu")?.addEventListener("click", () => {
        showToast(
            "Demo Profile",
            "Cloud Nova is the sample profile for this browser workspace.",
            "info"
        );
    });

    // Prevent placeholder footer links from navigating away.
    $$(".footer-links a").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            showToast(
                "CloudNova",
                "This demo page does not have a separate information page yet.",
                "info"
            );
        });
    });
}

/* ===================== 41. STARTUP ===================== */

function initializeApplication() {
    loadApplicationData();
    loadTheme();
    setupEventListeners();
    setupSearchShortcut();

    if (elements.currentYear) {
        elements.currentYear.textContent = new Date().getFullYear();
    }

    refreshDashboard();

    console.log("CloudNova initialized successfully.");
    console.log("Storage mode: Browser-based demo.");
}

/* ===================== 42. RUN APPLICATION ===================== */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication,
        { once: true }
    );
} else {
    initializeApplication();
}

/* ===================== END OF CLOUDNOVA ===================== */

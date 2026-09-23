// ==========================================================================
// materials.js — logic specific to materials.html ONLY
// ==========================================================================

let selectedCourseId = null;
let selectedModuleId = null;

// Maps material_type -> a Lucide icon name, for a nicer table display
const MATERIAL_TYPE_ICONS = {
  pdf: "file-text",
  video: "video",
  doc: "file",
  link: "link",
  image: "image",
  audio: "music",
  presentation: "presentation",
  spreadsheet: "file-spreadsheet",
};

// ---- Filter dropdowns (top of page) ----
function populateFilterCourseDropdown() {
  const select = document.getElementById("materialCourseFilter");
  select.innerHTML = MOCK_COURSES.map(function (course) {
    return `<option value="${course.id}">${course.title}</option>`;
  }).join("");

  if (MOCK_COURSES.length > 0 && selectedCourseId === null) {
    selectedCourseId = MOCK_COURSES[0].id;
  }
  select.value = selectedCourseId;
}

function populateFilterModuleDropdown() {
  const select = document.getElementById("materialModuleFilter");
  const courseModules = MOCK_MODULES.filter(function (m) { return m.course_id === selectedCourseId; });

  select.innerHTML = courseModules.map(function (mod) {
    return `<option value="${mod.id}">${mod.title}</option>`;
  }).join("");

  if (courseModules.length > 0) {
    selectedModuleId = courseModules[0].id;
    select.value = selectedModuleId;
  } else {
    selectedModuleId = null;
  }
}

document.getElementById("materialCourseFilter").addEventListener("change", function (e) {
  selectedCourseId = Number(e.target.value);
  populateFilterModuleDropdown();
  renderMaterials();
});

document.getElementById("materialModuleFilter").addEventListener("change", function (e) {
  selectedModuleId = Number(e.target.value);
  renderMaterials();
});

// ---- Render the materials table for the currently selected module ----
let sortableInstance = null;

function renderMaterials() {
  const tbody = document.getElementById("materialsTableBody");

  if (selectedModuleId === null) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i data-lucide="layers" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>This course has no modules yet. Add a module first.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  const moduleMaterials = MOCK_MATERIALS
    .filter(function (mat) { return mat.module_id === selectedModuleId; })
    .sort(function (a, b) { return (a.order_number || 0) - (b.order_number || 0); });

  if (moduleMaterials.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i data-lucide="file-text" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No materials yet for this module.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = moduleMaterials.map(function (mat) {
    const iconName = MATERIAL_TYPE_ICONS[mat.material_type] || "file";
    return `
      <tr data-material-id="${mat.id}">
        <td style="width:32px;">
          <span class="drag-handle" style="cursor:grab; color: var(--color-text-muted); display:flex;">
            <i data-lucide="grip-vertical" style="width:16px;height:16px;"></i>
          </span>
        </td>
        <td data-label="Title">
          <div style="display:flex; align-items:center; gap: var(--space-sm);">
            <span class="material-icon-tile ${mat.material_type}"><i data-lucide="${iconName}" style="width:18px;height:18px;"></i></span>
            ${escapeHtml(mat.title)}
          </div>
        </td>
        <td data-label="Type"><span class="badge badge-info">${mat.material_type.toUpperCase()}</span></td>
        <td data-label="Uploaded">${mat.created_at}</td>
        <td data-label="Actions">
          <div class="table-actions">
            <a href="${mat.file_url}" target="_blank" class="btn-icon" title="Preview">
              <i data-lucide="external-link" style="width:16px;height:16px;"></i>
            </a>
            <button class="btn-icon" onclick="editMaterial(${mat.id})" title="Edit">
              <i data-lucide="pencil" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn-icon" onclick="deleteMaterial(${mat.id})" title="Delete">
              <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  refreshIcons();
  initializeDragAndDrop();
}

// ---- Set up (or refresh) drag-to-reorder on the materials table ----
function initializeDragAndDrop() {
  const tbody = document.getElementById("materialsTableBody");

  if (sortableInstance) {
    sortableInstance.destroy();
  }

  sortableInstance = Sortable.create(tbody, {
    handle: ".drag-handle",
    animation: 150,
    onEnd: function () {
      const rows = tbody.querySelectorAll("tr[data-material-id]");
      rows.forEach(function (row, index) {
        const materialId = Number(row.getAttribute("data-material-id"));
        const mat = MOCK_MATERIALS.find(function (m) { return m.id === materialId; });
        if (mat) {
          mat.order_number = index + 1;
        }
      });
      renderMaterials();
    },
  });
}

// ---- Modal: Course + Module dropdowns (cascading, same idea as the filters) ----
function populateModalCourseDropdown() {
  const select = document.getElementById("materialCourse");
  select.innerHTML = MOCK_COURSES.map(function (course) {
    return `<option value="${course.id}">${course.title}</option>`;
  }).join("");
}

function populateModalModuleDropdown(courseId) {
  const select = document.getElementById("materialModule");
  const courseModules = MOCK_MODULES.filter(function (m) { return m.course_id === courseId; });
  select.innerHTML = courseModules.map(function (mod) {
    return `<option value="${mod.id}">${mod.title}</option>`;
  }).join("");
}

document.getElementById("materialCourse").addEventListener("change", function (e) {
  populateModalModuleDropdown(Number(e.target.value));
});

// ---- Modal open/close ----
function openMaterialModal() {
  populateModalCourseDropdown();

  document.getElementById("materialModalTitle").textContent = "New Material";
  document.getElementById("materialId").value = "";
  document.getElementById("materialCourse").value = selectedCourseId;
  populateModalModuleDropdown(selectedCourseId);
  document.getElementById("materialModule").value = selectedModuleId;
  document.getElementById("materialTitle").value = "";
  document.getElementById("materialDescription").value = "";
  document.getElementById("materialType").value = "pdf";
  document.getElementById("materialFileUrl").value = "";
  document.getElementById("materialTitleError").style.display = "none";
  document.getElementById("materialModal").classList.add("open");
}

function closeMaterialModal() {
  document.getElementById("materialModal").classList.remove("open");
}

// ---- Edit: pre-fill the modal ----
function editMaterial(id) {
  const mat = MOCK_MATERIALS.find(function (m) { return m.id === id; });
  if (!mat) return;

  const parentModule = MOCK_MODULES.find(function (m) { return m.id === mat.module_id; });

  populateModalCourseDropdown();
  document.getElementById("materialModalTitle").textContent = "Edit Material";
  document.getElementById("materialId").value = mat.id;
  document.getElementById("materialCourse").value = parentModule.course_id;
  populateModalModuleDropdown(parentModule.course_id);
  document.getElementById("materialModule").value = mat.module_id;
  document.getElementById("materialTitle").value = mat.title;
  document.getElementById("materialDescription").value = mat.description;
  document.getElementById("materialType").value = mat.material_type;
  document.getElementById("materialFileUrl").value = mat.file_url === "#" ? "" : mat.file_url;
  document.getElementById("materialTitleError").style.display = "none";
  document.getElementById("materialModal").classList.add("open");
}

// ---- Save: validate, then add or update ----
function saveMaterial() {
  const id = document.getElementById("materialId").value;
  const moduleId = Number(document.getElementById("materialModule").value);
  const title = document.getElementById("materialTitle").value.trim();
  const description = document.getElementById("materialDescription").value.trim();
  const materialType = document.getElementById("materialType").value;
  const fileUrl = document.getElementById("materialFileUrl").value.trim() || "#";

  if (title === "") {
    document.getElementById("materialTitleError").style.display = "block";
    return;
  }
  document.getElementById("materialTitleError").style.display = "none";

  if (id) {
    const mat = MOCK_MATERIALS.find(function (m) { return m.id === Number(id); });
    mat.module_id = moduleId;
    mat.title = title;
    mat.description = description;
    mat.material_type = materialType;
    mat.file_url = fileUrl;
  } else {
    const newId = MOCK_MATERIALS.length > 0
      ? Math.max.apply(null, MOCK_MATERIALS.map(function (m) { return m.id; })) + 1
      : 1;
    MOCK_MATERIALS.push({
      id: newId,
      module_id: moduleId,
      title: title,
      description: description,
      file_url: fileUrl,
      material_type: materialType,
      created_at: new Date().toISOString().split("T")[0],
    });
  }

  closeMaterialModal();

  // Follow the saved material's module in the page filters
  selectedModuleId = moduleId;
  const parentModule = MOCK_MODULES.find(function (m) { return m.id === moduleId; });
  selectedCourseId = parentModule.course_id;
  document.getElementById("materialCourseFilter").value = selectedCourseId;
  populateFilterModuleDropdown();
  document.getElementById("materialModuleFilter").value = selectedModuleId;
  renderMaterials();
}

// ---- Delete: simple confirm, nothing depends on a material ----
function deleteMaterial(id) {
  const mat = MOCK_MATERIALS.find(function (m) { return m.id === id; });
  if (!mat) return;

  if (confirm('Are you sure you want to delete "' + mat.title + '"?')) {
    const index = MOCK_MATERIALS.findIndex(function (m) { return m.id === id; });
    MOCK_MATERIALS.splice(index, 1);
    renderMaterials();
  }
}

// ---- Initial setup on page load ----
populateFilterCourseDropdown();
populateFilterModuleDropdown();
renderMaterials();

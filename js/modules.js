// ==========================================================================
// modules.js — logic specific to modules.html ONLY
// ==========================================================================

// Tracks which course is currently selected in the filter dropdown
let selectedCourseId = null;

// ---- Fill the course filter dropdown (top of page) ----
function populateCourseFilter() {
  const filterSelect = document.getElementById("moduleCourseFilter");
  filterSelect.innerHTML = MOCK_COURSES.map(function (course) {
    return `<option value="${course.id}">${course.title}</option>`;
  }).join("");

  // Default to the first course
  if (MOCK_COURSES.length > 0 && selectedCourseId === null) {
    selectedCourseId = MOCK_COURSES[0].id;
  }
  filterSelect.value = selectedCourseId;
}

document.getElementById("moduleCourseFilter").addEventListener("change", function (e) {
  selectedCourseId = Number(e.target.value);
  renderModules();
});

// ---- Render the modules table for the currently selected course ----
let sortableInstance = null;

function renderModules() {
  const tbody = document.getElementById("modulesTableBody");

  const courseModules = MOCK_MODULES
    .filter(function (m) { return m.course_id === selectedCourseId; })
    .sort(function (a, b) { return a.order_number - b.order_number; });

  if (courseModules.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <i data-lucide="layers" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No modules yet for this course.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = courseModules.map(function (mod) {
    return `
      <tr data-module-id="${mod.id}">
        <td style="width:32px;">
          <span class="drag-handle" style="cursor:grab; color: var(--color-text-muted); display:flex;">
            <i data-lucide="grip-vertical" style="width:16px;height:16px;"></i>
          </span>
        </td>
        <td data-label="Order"><span class="badge badge-info">${mod.order_number}</span></td>
        <td data-label="Module Title">${escapeHtml(mod.title)}</td>
        <td data-label="Actions">
          <div class="table-actions">
            <button class="btn-icon" onclick="editModule(${mod.id})" title="Edit">
              <i data-lucide="pencil" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn-icon" onclick="deleteModule(${mod.id})" title="Delete">
              <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  refreshIcons();
  initializeDragAndDrop();
}

// ---- Set up (or refresh) drag-to-reorder on the modules table ----
function initializeDragAndDrop() {
  const tbody = document.getElementById("modulesTableBody");

  // Destroy the previous instance first, so we don't stack duplicate listeners
  // every time the table re-renders.
  if (sortableInstance) {
    sortableInstance.destroy();
  }

  sortableInstance = Sortable.create(tbody, {
    handle: ".drag-handle",   // only the grip icon starts a drag, not the whole row
    animation: 150,
    onEnd: function () {
      // After dropping, read the new row order from the DOM and
      // reassign order_number (1, 2, 3...) to match.
      const rows = tbody.querySelectorAll("tr[data-module-id]");
      rows.forEach(function (row, index) {
        const moduleId = Number(row.getAttribute("data-module-id"));
        const mod = MOCK_MODULES.find(function (m) { return m.id === moduleId; });
        if (mod) {
          mod.order_number = index + 1;
        }
      });
      renderModules(); // refresh the Order badges to show the new numbers
    },
  });
}

// ---- Fill the Course dropdown inside the Add/Edit modal ----
function populateModuleCourseDropdown() {
  const select = document.getElementById("moduleCourse");
  select.innerHTML = MOCK_COURSES.map(function (course) {
    return `<option value="${course.id}">${course.title}</option>`;
  }).join("");
}

// ---- Modal open/close ----
function openModuleModal() {
  populateModuleCourseDropdown();

  document.getElementById("moduleModalTitle").textContent = "New Module";
  document.getElementById("moduleId").value = "";
  document.getElementById("moduleCourse").value = selectedCourseId; // pre-select the filtered course
  document.getElementById("moduleTitle").value = "";
  document.getElementById("moduleOrder").value = "";
  document.getElementById("moduleTitleError").style.display = "none";
  document.getElementById("moduleModal").classList.add("open");
}

function closeModuleModal() {
  document.getElementById("moduleModal").classList.remove("open");
}

// ---- Edit: pre-fill the modal ----
function editModule(id) {
  const mod = MOCK_MODULES.find(function (m) { return m.id === id; });
  if (!mod) return;

  populateModuleCourseDropdown();

  document.getElementById("moduleModalTitle").textContent = "Edit Module";
  document.getElementById("moduleId").value = mod.id;
  document.getElementById("moduleCourse").value = mod.course_id;
  document.getElementById("moduleTitle").value = mod.title;
  document.getElementById("moduleOrder").value = mod.order_number;
  document.getElementById("moduleTitleError").style.display = "none";
  document.getElementById("moduleModal").classList.add("open");
}

// ---- Save: validate, then add or update ----
function saveModule() {
  const id = document.getElementById("moduleId").value;
  const courseId = Number(document.getElementById("moduleCourse").value);
  const title = document.getElementById("moduleTitle").value.trim();
  const orderNumber = Number(document.getElementById("moduleOrder").value) || 1;

  if (title === "") {
    document.getElementById("moduleTitleError").style.display = "block";
    return;
  }
  document.getElementById("moduleTitleError").style.display = "none";

  if (id) {
    const mod = MOCK_MODULES.find(function (m) { return m.id === Number(id); });
    mod.course_id = courseId;
    mod.title = title;
    mod.order_number = orderNumber;
  } else {
    const newId = MOCK_MODULES.length > 0
      ? Math.max.apply(null, MOCK_MODULES.map(function (m) { return m.id; })) + 1
      : 1;
    MOCK_MODULES.push({ id: newId, course_id: courseId, title: title, order_number: orderNumber });
  }

  closeModuleModal();

  // If the module was reassigned to a different course, switch the filter to follow it
  selectedCourseId = courseId;
  document.getElementById("moduleCourseFilter").value = courseId;
  renderModules();
}

// ---- Delete: blocked if materials are attached to this module ----
function deleteModule(id) {
  const mod = MOCK_MODULES.find(function (m) { return m.id === id; });
  if (!mod) return;

  const materialCount = MOCK_MATERIALS.filter(function (mat) { return mat.module_id === id; }).length;

  if (materialCount > 0) {
    alert(
      'Cannot delete "' + mod.title + '" — it still has ' + materialCount + ' material(s) attached.\n\n' +
      'Remove those materials first before deleting this module.'
    );
    return;
  }

  if (confirm('Are you sure you want to delete "' + mod.title + '"?')) {
    const index = MOCK_MODULES.findIndex(function (m) { return m.id === id; });
    MOCK_MODULES.splice(index, 1);
    renderModules();
  }
}

// ---- Initial setup on page load ----
populateCourseFilter();
renderModules();

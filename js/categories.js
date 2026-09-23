// ==========================================================================
// categories.js — logic specific to categories.html ONLY
// ==========================================================================

// ---- Render the categories table ----
function renderCategories(filterText) {
  const tbody = document.getElementById("categoriesTableBody");
  const search = (filterText || "").toLowerCase();

  const filtered = MOCK_CATEGORIES.filter(function (cat) {
    return cat.name.toLowerCase().includes(search);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <i data-lucide="folder-x" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No categories found.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = filtered.map(function (cat) {
    const courseCount = MOCK_COURSES.filter(function (course) {
      return course.category_id === cat.id;
    }).length;

    return `
      <tr>
        <td data-label="Name">${escapeHtml(cat.name)}</td>
<td data-label="Description">${escapeHtml(cat.description)}</td>
        <td data-label="Courses"><span class="badge badge-info">${courseCount}</span></td>
        <td data-label="Actions">
          <div class="table-actions">
            <button class="btn-icon" onclick="editCategory(${cat.id})" title="Edit">
              <i data-lucide="pencil" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn-icon" onclick="deleteCategory(${cat.id})" title="Delete">
              <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  refreshIcons();
}

// ---- Search box: re-render table as admin types ----
document.getElementById("categorySearch").addEventListener("input", function (e) {
  renderCategories(e.target.value);
});

// ---- Modal open/close ----
function openCategoryModal() {
  document.getElementById("categoryModalTitle").textContent = "New Category";
  document.getElementById("categoryId").value = "";
  document.getElementById("categoryName").value = "";
  document.getElementById("categoryDescription").value = "";
  document.getElementById("categoryNameError").style.display = "none";
  document.getElementById("categoryModal").classList.add("open");
}

function closeCategoryModal() {
  document.getElementById("categoryModal").classList.remove("open");
}

// ---- Edit: pre-fill the modal with the selected category's data ----
function editCategory(id) {
  const cat = MOCK_CATEGORIES.find(function (c) { return c.id === id; });
  if (!cat) return;

  document.getElementById("categoryModalTitle").textContent = "Edit Category";
  document.getElementById("categoryId").value = cat.id;
  document.getElementById("categoryName").value = cat.name;
  document.getElementById("categoryDescription").value = cat.description;
  document.getElementById("categoryNameError").style.display = "none";
  document.getElementById("categoryModal").classList.add("open");
}

// ---- Save: either update an existing category or add a new one ----
function saveCategory() {
  const id = document.getElementById("categoryId").value;
  const name = document.getElementById("categoryName").value.trim();
  const description = document.getElementById("categoryDescription").value.trim();

  if (name === "") {
    document.getElementById("categoryNameError").style.display = "block";
    return;
  }

  if (id) {
    const cat = MOCK_CATEGORIES.find(function (c) { return c.id === Number(id); });
    cat.name = name;
    cat.description = description;
  } else {
    const newId = MOCK_CATEGORIES.length > 0
      ? Math.max.apply(null, MOCK_CATEGORIES.map(function (c) { return c.id; })) + 1
      : 1;
    MOCK_CATEGORIES.push({ id: newId, name: name, description: description });
  }

  closeCategoryModal();
  renderCategories();
}

// ---- Delete: warn if courses are using this category, then confirm ----
function deleteCategory(id) {
  const cat = MOCK_CATEGORIES.find(function (c) { return c.id === id; });
  if (!cat) return;

  const courseCount = MOCK_COURSES.filter(function (course) {
    return course.category_id === id;
  }).length;

  let message = 'Are you sure you want to delete "' + cat.name + '"?';
  if (courseCount > 0) {
    message = '"' + cat.name + '" is used by ' + courseCount + ' course(s). Deleting it may affect those courses. Are you sure you want to continue?';
  }

  if (confirm(message)) {
    const index = MOCK_CATEGORIES.findIndex(function (c) { return c.id === id; });
    MOCK_CATEGORIES.splice(index, 1);
    renderCategories();
  }
}

// ---- Initial render on page load ----
renderCategories();

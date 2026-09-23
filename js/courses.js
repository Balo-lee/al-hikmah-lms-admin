// =======================================
// courses.js — logic specific to courses.html ONLY

// ---- Render the courses table ----
function renderCourses() {
  const tbody = document.getElementById("coursesTableBody");
  const search = document.getElementById("courseSearch").value.toLowerCase();
  const categoryFilter = document.getElementById("courseCategoryFilter").value;

  const filtered = MOCK_COURSES.filter(function (course) {
    const matchesSearch = course.title.toLowerCase().includes(search);
    const matchesCategory = categoryFilter === "all" || course.category_id === Number(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <i data-lucide="book-x" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No courses found.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = filtered.map(function (course) {
    const category = MOCK_CATEGORIES.find(function (c) { return c.id === course.category_id; });
    const instructor = MOCK_INSTRUCTORS.find(function (i) { return i.id === course.instructor_id; });

    const statusBadge = course.status === "published"
      ? '<span class="badge badge-success">Published</span>'
      : '<span class="badge badge-muted">Draft</span>';

    const instructorCell = instructor
      ? `<div style="display:flex; align-items:center; gap: var(--space-sm);">
           <span class="table-avatar ${getInstructorColorClass(instructor.id)}">${escapeHtml(instructor.first_name.charAt(0).toUpperCase())}</span>
           ${escapeHtml(instructor.first_name + " " + instructor.last_name)}
         </div>`
      : "—";

    return `
      <tr>
        <td data-label="Title">${escapeHtml(course.title)}</td>
        <td data-label="Category">${category ? escapeHtml(category.name) : "—"}</td>
        <td data-label="Instructor">${instructorCell}</td>
        <td data-label="Duration">${escapeHtml(course.duration)}</td>
        <td data-label="Status">${statusBadge}</td>
        <td data-label="Actions">
          <div class="table-actions">
            <button class="btn-icon" onclick="viewCourseOverview(${course.id})" title="View Overview">
              <i data-lucide="eye" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn-icon" onclick="editCourse(${course.id})" title="Edit">
              <i data-lucide="pencil" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn-icon" onclick="deleteCourse(${course.id})" title="Delete">
              <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  refreshIcons();
}

// Cycles through 4 colors based on instructor id, for the avatar chip
function getInstructorColorClass(id) {
  const colors = ["blue", "purple", "green", "orange"];
  return colors[id % colors.length];
}

// Fill the category filter dropdown
function populateCategoryFilterDropdown() {
  const select = document.getElementById("courseCategoryFilter");
  const options = ['<option value="all">All Categories</option>'].concat(
    MOCK_CATEGORIES.map(function (cat) {
      return `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`;
    })
  );
  select.innerHTML = options.join("");
}

// ---- Search box ----
document.getElementById("courseSearch").addEventListener("input", function () {
  renderCourses();
});

document.getElementById("courseCategoryFilter").addEventListener("change", function () {
  renderCourses();
});

// ---- Fill the Category and Instructor dropdowns inside the modal ----
function populateCourseDropdowns() {
  const categorySelect = document.getElementById("courseCategory");
  categorySelect.innerHTML = MOCK_CATEGORIES.map(function (cat) {
    return `<option value="${cat.id}">${cat.name}</option>`;
  }).join("");

  const instructorSelect = document.getElementById("courseInstructor");
  // Only show active instructors — disabled ones shouldn't be assignable to new courses
  const activeInstructors = MOCK_INSTRUCTORS.filter(function (i) { return i.status === "active"; });
  instructorSelect.innerHTML = activeInstructors.map(function (inst) {
    return `<option value="${inst.id}">${inst.first_name} ${inst.last_name}</option>`;
  }).join("");
}

// ---- Modal open/close ----
function openCourseModal() {
  populateCourseDropdowns();

  document.getElementById("courseModalTitle").textContent = "New Course";
  document.getElementById("courseId").value = "";
  document.getElementById("courseTitle").value = "";
  document.getElementById("courseDescription").value = "";
  document.getElementById("courseDuration").value = "";
  document.getElementById("courseStatus").value = "draft";
  document.getElementById("courseThumbnail").value = "";
  document.getElementById("courseTitleError").style.display = "none";
  document.getElementById("courseModal").classList.add("open");
}

function closeCourseModal() {
  document.getElementById("courseModal").classList.remove("open");
}

// ---- Edit: pre-fill the modal with the selected course's data ----
function editCourse(id) {
  const course = MOCK_COURSES.find(function (c) { return c.id === id; });
  if (!course) return;

  populateCourseDropdowns();

  document.getElementById("courseModalTitle").textContent = "Edit Course";
  document.getElementById("courseId").value = course.id;
  document.getElementById("courseTitle").value = course.title;
  document.getElementById("courseDescription").value = course.description;
  document.getElementById("courseCategory").value = course.category_id;
  document.getElementById("courseInstructor").value = course.instructor_id;
  document.getElementById("courseDuration").value = course.duration;
  document.getElementById("courseStatus").value = course.status;
  document.getElementById("courseThumbnail").value = course.thumbnail || "";
  document.getElementById("courseTitleError").style.display = "none";
  document.getElementById("courseModal").classList.add("open");
}

// ---- Save: validate, then add or update ----
function saveCourse() {
  const id = document.getElementById("courseId").value;
  const title = document.getElementById("courseTitle").value.trim();
  const description = document.getElementById("courseDescription").value.trim();
  const categoryId = Number(document.getElementById("courseCategory").value);
  const instructorId = Number(document.getElementById("courseInstructor").value);
  const duration = document.getElementById("courseDuration").value.trim();
  const status = document.getElementById("courseStatus").value;
  const thumbnail = document.getElementById("courseThumbnail").value.trim() || null;

  if (title === "") {
    document.getElementById("courseTitleError").style.display = "block";
    return;
  }
  document.getElementById("courseTitleError").style.display = "none";

  if (id) {
    // Editing an existing course
    const course = MOCK_COURSES.find(function (c) { return c.id === Number(id); });
    course.title = title;
    course.description = description;
    course.category_id = categoryId;
    course.instructor_id = instructorId;
    course.duration = duration;
    course.status = status;
    course.thumbnail = thumbnail;
  } else {
    // Adding a new course
    const newId = MOCK_COURSES.length > 0
      ? Math.max.apply(null, MOCK_COURSES.map(function (c) { return c.id; })) + 1
      : 1;
    MOCK_COURSES.push({
      id: newId,
      title: title,
      description: description,
      category_id: categoryId,
      instructor_id: instructorId,
      thumbnail: thumbnail,
      duration: duration,
      status: status,
      created_at: new Date().toISOString().split("T")[0],
    });
  }

  closeCourseModal();
  renderCourses();
}

// ---- Delete: BLOCKED if the course has modules, assignments, or quizzes ----
function deleteCourse(id) {
  const course = MOCK_COURSES.find(function (c) { return c.id === id; });
  if (!course) return;

  const moduleCount = MOCK_MODULES.filter(function (m) { return m.course_id === id; }).length;
  const assignmentCount = MOCK_ASSIGNMENTS.filter(function (a) { return a.course_id === id; }).length;
  const quizCount = MOCK_QUIZZES.filter(function (q) { return q.course_id === id; }).length;

  if (moduleCount > 0 || assignmentCount > 0 || quizCount > 0) {
    alert(
      'Cannot delete "' + course.title + '" — it still has ' +
      moduleCount + ' module(s), ' +
      assignmentCount + ' assignment(s), and ' +
      quizCount + ' quiz(zes) attached.\n\n' +
      'Remove those first before deleting this course.'
    );
    return;
  }

  if (confirm('Are you sure you want to delete "' + course.title + '"? This cannot be undone.')) {
    const index = MOCK_COURSES.findIndex(function (c) { return c.id === id; });
    MOCK_COURSES.splice(index, 1);
    renderCourses();
  }
}

function viewCourseOverview(id) {
  const course = MOCK_COURSES.find(function (c) { return c.id === id; });
  if (!course) return;

  const category = MOCK_CATEGORIES.find(function (c) { return c.id === course.category_id; });
  const instructor = MOCK_INSTRUCTORS.find(function (i) { return i.id === course.instructor_id; });

  document.getElementById("overviewCourseTitle").textContent = course.title;
  document.getElementById("overviewCourseDescription").textContent = course.description || "No description provided.";
  document.getElementById("overviewCourseCategory").textContent = category ? category.name : "—";
  document.getElementById("overviewCourseInstructor").textContent = instructor ? (instructor.first_name + " " + instructor.last_name) : "—";
  document.getElementById("overviewCourseDuration").textContent = course.duration || "—";
  document.getElementById("overviewCourseStatus").innerHTML = course.status === "published"
    ? '<span class="badge badge-success">Published</span>'
    : '<span class="badge badge-muted">Draft</span>';

  const moduleIds = MOCK_MODULES.filter(function (m) { return m.course_id === id; }).map(function (m) { return m.id; });
  const materialCount = MOCK_MATERIALS.filter(function (mat) { return moduleIds.includes(mat.module_id); }).length;
  const assignmentCount = MOCK_ASSIGNMENTS.filter(function (a) { return a.course_id === id; }).length;
  const quizCount = MOCK_QUIZZES.filter(function (q) { return q.course_id === id; }).length;

  document.getElementById("overviewModuleCount").textContent = moduleIds.length;
  document.getElementById("overviewMaterialCount").textContent = materialCount;
  document.getElementById("overviewAssignmentCount").textContent = assignmentCount;
  document.getElementById("overviewQuizCount").textContent = quizCount;

  document.getElementById("courseOverviewModal").classList.add("open");
  refreshIcons();
}

function closeCourseOverviewModal() {
  document.getElementById("courseOverviewModal").classList.remove("open");
}

// ---- Initial setup on page load ----
populateCategoryFilterDropdown();
renderCourses();

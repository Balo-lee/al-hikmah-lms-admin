// ==========================================================================
// assignments.js — logic specific to assignments.html ONLY
// ==========================================================================

let selectedCourseId = null;

// ---- Course filter dropdown (top of page) ----
function populateCourseFilter() {
  const select = document.getElementById("assignmentCourseFilter");
  select.innerHTML = MOCK_COURSES.map(function (course) {
    return `<option value="${course.id}">${course.title}</option>`;
  }).join("");

  if (MOCK_COURSES.length > 0 && selectedCourseId === null) {
    selectedCourseId = MOCK_COURSES[0].id;
  }
  select.value = selectedCourseId;
}

document.getElementById("assignmentCourseFilter").addEventListener("change", function (e) {
  selectedCourseId = Number(e.target.value);
  renderAssignments();
});

// ---- Render the assignments table for the currently selected course ----
function renderAssignments() {
  const tbody = document.getElementById("assignmentsTableBody");

  const courseAssignments = MOCK_ASSIGNMENTS.filter(function (a) { return a.course_id === selectedCourseId; });

  if (courseAssignments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <i data-lucide="clipboard-list" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No assignments yet for this course.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  const today = new Date();

  tbody.innerHTML = courseAssignments.map(function (a) {
    const submissionCount = MOCK_SUBMISSIONS.filter(function (s) { return s.assignment_id === a.id; }).length;
    const isOverdue = new Date(a.deadline) < today;
    const statusBadge = isOverdue
      ? '<span class="badge badge-danger">Overdue</span>'
      : '<span class="badge badge-success">Open</span>';

    const countdown = getDeadlineCountdown(a.deadline);
const gradedCount = MOCK_SUBMISSIONS.filter(function (s) {
  return s.assignment_id === a.id && s.status === "graded";
}).length;
const gradingPercent = submissionCount > 0 ? Math.round((gradedCount / submissionCount) * 100) : 0;

return `
  <tr>
    <td data-label="Title">${escapeHtml(a.title)}</td>
    <td data-label="Deadline">
      ${a.deadline}
      <span class="deadline-countdown ${countdown.className}">${countdown.text}</span>
    </td>
    <td data-label="Max Score">${a.maximum_score}</td>
    <td data-label="Submissions">
      <a href="submissions.html?assignment_id=${a.id}" class="badge badge-info">${submissionCount}</a>
      <div style="min-width:80px;">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width:${gradingPercent}%;"></div>
        </div>
        <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">${gradedCount}/${submissionCount} graded</span>
      </div>
    </td>
    <td data-label="Status">${statusBadge}</td>
        <td data-label="Actions">
          <div class="table-actions">
            <button class="btn-icon" onclick="editAssignment(${a.id})" title="Edit">
              <i data-lucide="pencil" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn-icon" onclick="deleteAssignment(${a.id})" title="Delete">
              <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  refreshIcons();
}

// Returns a human-friendly countdown string + a CSS class for coloring
function getDeadlineCountdown(deadlineStr) {
  const deadline = new Date(deadlineStr);
  const today = new Date();
  // Zero out time so we're comparing whole days, not hours/minutes
  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((deadline - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: "Overdue by " + Math.abs(diffDays) + " day(s)", className: "overdue" };
  }
  if (diffDays === 0) {
    return { text: "Due today", className: "soon" };
  }
  if (diffDays <= 3) {
    return { text: diffDays + " day(s) left", className: "soon" };
  }
  return { text: diffDays + " day(s) left", className: "upcoming" };
}

// ---- Fill the Course dropdown inside the Add/Edit modal ----
function populateModalCourseDropdown() {
  const select = document.getElementById("assignmentCourse");
  select.innerHTML = MOCK_COURSES.map(function (course) {
    return `<option value="${course.id}">${course.title}</option>`;
  }).join("");
}

// ---- Modal open/close ----
function openAssignmentModal() {
  populateModalCourseDropdown();

  document.getElementById("assignmentModalTitle").textContent = "New Assignment";
  document.getElementById("assignmentId").value = "";
  document.getElementById("assignmentCourse").value = selectedCourseId;
  document.getElementById("assignmentTitle").value = "";
  document.getElementById("assignmentDescription").value = "";
  document.getElementById("assignmentDeadline").value = "";
  document.getElementById("assignmentMaxScore").value = "";
  document.getElementById("assignmentTitleError").style.display = "none";
  document.getElementById("assignmentDeadlineError").style.display = "none";
  document.getElementById("assignmentModal").classList.add("open");
}

function closeAssignmentModal() {
  document.getElementById("assignmentModal").classList.remove("open");
}

// ---- Edit: pre-fill the modal ----
function editAssignment(id) {
  const a = MOCK_ASSIGNMENTS.find(function (x) { return x.id === id; });
  if (!a) return;

  populateModalCourseDropdown();

  document.getElementById("assignmentModalTitle").textContent = "Edit Assignment";
  document.getElementById("assignmentId").value = a.id;
  document.getElementById("assignmentCourse").value = a.course_id;
  document.getElementById("assignmentTitle").value = a.title;
  document.getElementById("assignmentDescription").value = a.description;
  document.getElementById("assignmentDeadline").value = a.deadline;
  document.getElementById("assignmentMaxScore").value = a.maximum_score;
  document.getElementById("assignmentTitleError").style.display = "none";
  document.getElementById("assignmentDeadlineError").style.display = "none";
  document.getElementById("assignmentModal").classList.add("open");
}

// ---- Save: validate, then add or update ----
function saveAssignment() {
  const id = document.getElementById("assignmentId").value;
  const courseId = Number(document.getElementById("assignmentCourse").value);
  const title = document.getElementById("assignmentTitle").value.trim();
  const description = document.getElementById("assignmentDescription").value.trim();
  const deadline = document.getElementById("assignmentDeadline").value;
  const maxScore = Number(document.getElementById("assignmentMaxScore").value) || 100;

  let hasError = false;

  if (title === "") {
    document.getElementById("assignmentTitleError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("assignmentTitleError").style.display = "none";
  }

  if (deadline === "") {
    document.getElementById("assignmentDeadlineError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("assignmentDeadlineError").style.display = "none";
  }

  if (hasError) return;

  if (id) {
    const a = MOCK_ASSIGNMENTS.find(function (x) { return x.id === Number(id); });
    a.course_id = courseId;
    a.title = title;
    a.description = description;
    a.deadline = deadline;
    a.maximum_score = maxScore;
  } else {
    const newId = MOCK_ASSIGNMENTS.length > 0
      ? Math.max.apply(null, MOCK_ASSIGNMENTS.map(function (x) { return x.id; })) + 1
      : 1;
    MOCK_ASSIGNMENTS.push({
      id: newId,
      course_id: courseId,
      title: title,
      description: description,
      deadline: deadline,
      maximum_score: maxScore,
      created_at: new Date().toISOString().split("T")[0],
    });
  }

  closeAssignmentModal();

  selectedCourseId = courseId;
  document.getElementById("assignmentCourseFilter").value = courseId;
  renderAssignments();
}

// ---- Delete: allowed freely if no submissions yet, BLOCKED if students have submitted ----
function deleteAssignment(id) {
  const a = MOCK_ASSIGNMENTS.find(function (x) { return x.id === id; });
  if (!a) return;

  const submissionCount = MOCK_SUBMISSIONS.filter(function (s) { return s.assignment_id === id; }).length;

  if (submissionCount > 0) {
    alert(
      'Cannot delete "' + a.title + '" — ' + submissionCount + ' student(s) have already submitted work for it.\n\n' +
      'Deleting it now would remove their submitted work. You can still edit the assignment instead.'
    );
    return;
  }

  if (confirm('Are you sure you want to delete "' + a.title + '"? No students have submitted yet, so this is safe.')) {
    const index = MOCK_ASSIGNMENTS.findIndex(function (x) { return x.id === id; });
    MOCK_ASSIGNMENTS.splice(index, 1);
    renderAssignments();
  }
}

// ---- Initial setup on page load ----
populateCourseFilter();
renderAssignments();

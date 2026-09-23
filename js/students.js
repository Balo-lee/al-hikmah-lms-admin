// ==========================================================================
// students.js — logic specific to students.html ONLY
// ==========================================================================

// ---- Render the students table ----
function renderStudents(filterText) {
  const tbody = document.getElementById("studentsTableBody");
  const search = (filterText || "").toLowerCase();

  const filtered = MOCK_STUDENTS.filter(function (s) {
    const fullName = (s.first_name + " " + s.last_name).toLowerCase();
    return fullName.includes(search) || s.email.toLowerCase().includes(search);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <i data-lucide="user-x" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No students found.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = filtered.map(function (s) {
    const enrollments = MOCK_ENROLLMENTS.filter(function (e) { return e.student_id === s.id; });
    const courseCount = enrollments.length;

    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce(function (sum, e) { return sum + e.progress; }, 0) / enrollments.length)
      : null;

    const statusBadge = s.status === "active"
      ? '<span class="badge badge-success">Active</span>'
      : '<span class="badge badge-danger">Disabled</span>';

    const toggleLabel = s.status === "active" ? "Disable" : "Enable";
    const toggleIcon = s.status === "active" ? "user-x" : "user-check";

    const progressCell = avgProgress !== null
      ? `<div style="min-width:80px;">
           <div class="progress-bar-track">
             <div class="progress-bar-fill" style="width:${avgProgress}%;"></div>
           </div>
           <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">${avgProgress}%</span>
         </div>`
      : '<span class="badge badge-muted">No courses</span>';

    return `
      <tr>
        <td data-label="Name">${escapeHtml(s.first_name + " " + s.last_name)}</td>
        <td data-label="Email">${escapeHtml(s.email)}</td>
        <td data-label="Phone">${escapeHtml(s.phone)}</td>
        <td data-label="Courses"><span class="badge badge-info">${courseCount}</span></td>
        <td data-label="Progress">${progressCell}</td>
        <td data-label="Status">${statusBadge}</td>
        <td data-label="Actions">
          <div class="table-actions">
            <button class="btn-icon" onclick="viewStudentDetails(${s.id})" title="View Details">
              <i data-lucide="eye" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn-icon" onclick="toggleStudentStatus(${s.id})" title="${toggleLabel}">
              <i data-lucide="${toggleIcon}" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  refreshIcons();
}

// ---- Search box ----
document.getElementById("studentSearch").addEventListener("input", function (e) {
  renderStudents(e.target.value);
});

// ---- View details modal ----
// Tracks which student's details are currently open, so Enroll/Unenroll
// know who to apply to.
let currentDetailStudentId = null;

function viewStudentDetails(id) {
  const s = MOCK_STUDENTS.find(function (x) { return x.id === id; });
  if (!s) return;

  currentDetailStudentId = id;

  document.getElementById("detailStudentName").textContent = s.first_name + " " + s.last_name;
  document.getElementById("detailStudentEmail").textContent = s.email;
  document.getElementById("detailStudentPhone").textContent = s.phone;
  document.getElementById("detailStudentJoined").textContent = s.created_at;
  document.getElementById("detailStudentStatus").innerHTML = s.status === "active"
    ? '<span class="badge badge-success">Active</span>'
    : '<span class="badge badge-danger">Disabled</span>';

  refreshEnrolledCoursesDisplay(id);
  populateEnrollDropdown(id);
  renderStudentPerformanceSummary(id);

  document.getElementById("studentDetailsModal").classList.add("open");
}

// ---- Rebuilds the "Enrolled Courses" list inside the modal, each with
//      a small remove button ----
function refreshEnrolledCoursesDisplay(studentId) {
  const enrollments = MOCK_ENROLLMENTS.filter(function (e) { return e.student_id === studentId; });

  if (enrollments.length === 0) {
    document.getElementById("detailStudentCourses").innerHTML = "<div>Not enrolled in any courses yet.</div>";
    refreshIcons();
    return;
  }

  document.getElementById("detailStudentCourses").innerHTML = enrollments.map(function (e) {
    const course = MOCK_COURSES.find(function (c) { return c.id === e.course_id; });
    const courseName = course ? course.title : "Unknown course";
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; padding: 6px 0; border-bottom: 1px solid var(--color-border);">
        <span>${escapeHtml(courseName)} (${e.progress}% complete)</span>
        <button type="button" class="btn-icon" onclick="unenrollStudent(${e.id})" title="Remove enrollment">
          <i data-lucide="x" style="width:14px;height:14px;"></i>
        </button>
      </div>`;
  }).join("");

  refreshIcons();
}

// ---- Performance summary for the Student Details modal ----
function renderStudentPerformanceSummary(studentId) {
  const submissions = MOCK_SUBMISSIONS.filter(function (s) { return s.student_id === studentId; });
  const attempts = MOCK_QUIZ_ATTEMPTS.filter(function (a) { return a.student_id === studentId; });

  document.getElementById("detailAssignmentsSubmitted").textContent = submissions.length;
  document.getElementById("detailQuizzesTaken").textContent = attempts.length;

  // Combine graded submission percentages + quiz attempt percentages into one average
  const percentages = [];

  submissions.forEach(function (sub) {
    if (sub.status !== "graded") return;
    const assignment = MOCK_ASSIGNMENTS.find(function (a) { return a.id === sub.assignment_id; });
    if (assignment) percentages.push((sub.score / assignment.maximum_score) * 100);
  });

  attempts.forEach(function (attempt) {
    const quiz = MOCK_QUIZZES.find(function (q) { return q.id === attempt.quiz_id; });
    if (quiz) percentages.push((attempt.score / quiz.total_marks) * 100);
  });

  if (percentages.length === 0) {
    document.getElementById("detailAvgGrade").textContent = "—";
    return;
  }

  const avgPercentage = percentages.reduce(function (sum, p) { return sum + p; }, 0) / percentages.length;
  const grade = getGrade(avgPercentage);
  document.getElementById("detailAvgGrade").innerHTML = `<span class="badge ${grade.badgeClass}">${Math.round(avgPercentage)}%</span>`;
}

// ---- Fill the "Enroll in a Course" dropdown with courses the student
//      is NOT already enrolled in ----
function populateEnrollDropdown(studentId) {
  const select = document.getElementById("enrollCourseSelect");
  const enrolledCourseIds = MOCK_ENROLLMENTS
    .filter(function (e) { return e.student_id === studentId; })
    .map(function (e) { return e.course_id; });

  const availableCourses = MOCK_COURSES.filter(function (c) {
    return !enrolledCourseIds.includes(c.id);
  });

  if (availableCourses.length === 0) {
    select.innerHTML = `<option value="">Already enrolled in all courses</option>`;
    select.disabled = true;
  } else {
    select.disabled = false;
    select.innerHTML = availableCourses.map(function (c) {
      return `<option value="${c.id}">${escapeHtml(c.title)}</option>`;
    }).join("");
  }
}

// ---- Enroll the currently viewed student in the selected course ----
function enrollStudentInCourse() {
  const select = document.getElementById("enrollCourseSelect");
  const courseId = Number(select.value);
  if (!courseId) return;

  const newId = MOCK_ENROLLMENTS.length > 0
    ? Math.max.apply(null, MOCK_ENROLLMENTS.map(function (e) { return e.id; })) + 1
    : 1;

  MOCK_ENROLLMENTS.push({
    id: newId,
    student_id: currentDetailStudentId,
    course_id: courseId,
    enrollment_date: new Date().toISOString().split("T")[0],
    status: "active",
    progress: 0,
  });

  refreshEnrolledCoursesDisplay(currentDetailStudentId);
  populateEnrollDropdown(currentDetailStudentId);
  renderStudents(document.getElementById("studentSearch").value);
}

// ---- Remove a student's enrollment in one course ----
function unenrollStudent(enrollmentId) {
  const enrollment = MOCK_ENROLLMENTS.find(function (e) { return e.id === enrollmentId; });
  if (!enrollment) return;

  const course = MOCK_COURSES.find(function (c) { return c.id === enrollment.course_id; });

  if (confirm('Remove this student from "' + (course ? course.title : "this course") + '"?')) {
    const index = MOCK_ENROLLMENTS.findIndex(function (e) { return e.id === enrollmentId; });
    MOCK_ENROLLMENTS.splice(index, 1);

    refreshEnrolledCoursesDisplay(currentDetailStudentId);
    populateEnrollDropdown(currentDetailStudentId);
    renderStudents(document.getElementById("studentSearch").value);
  }
}

function closeStudentDetailsModal() {
  document.getElementById("studentDetailsModal").classList.remove("open");
}

// ---- Toggle active/disabled status ----
function toggleStudentStatus(id) {
  const s = MOCK_STUDENTS.find(function (x) { return x.id === id; });
  if (!s) return;

  const action = s.status === "active" ? "disable" : "enable";
  const message = 'Are you sure you want to ' + action + ' ' + s.first_name + ' ' + s.last_name + '?';

  if (confirm(message)) {
    s.status = s.status === "active" ? "disabled" : "active";
    renderStudents(document.getElementById("studentSearch").value);
  }
}

// ---- Initial render on page load ----
renderStudents();
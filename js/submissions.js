// ==========================================================================
// submissions.js — logic specific to submissions.html ONLY
// ===================================================================l

let selectedAssignmentId = null;

// ---- Read the URL to see if we arrived here via a link like
//      submissions.html?assignment_id=1 (clicked from the Assignments page) ----
function getAssignmentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("assignment_id");
  return value ? Number(value) : null;
}

// ---- "Time ago" helper for the Submitted column ----
function getTimeAgo(dateStr) {
  const submitted = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.round((today - submitted) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return diffDays + " days ago";
}

document.getElementById("submissionStatusFilter").addEventListener("change", function () {
  renderSubmissions();
});

// ---- Assignment filter dropdown (top of page) ----
function populateAssignmentFilter() {
  const select = document.getElementById("submissionAssignmentFilter");
  select.innerHTML = MOCK_ASSIGNMENTS.map(function (a) {
    return `<option value="${a.id}">${a.title}</option>`;
  }).join("");

  const fromUrl = getAssignmentIdFromUrl();
  if (fromUrl && MOCK_ASSIGNMENTS.some(function (a) { return a.id === fromUrl; })) {
    selectedAssignmentId = fromUrl;
  } else if (MOCK_ASSIGNMENTS.length > 0) {
    selectedAssignmentId = MOCK_ASSIGNMENTS[0].id;
  }

  select.value = selectedAssignmentId;
}

document.getElementById("submissionAssignmentFilter").addEventListener("change", function (e) {
  selectedAssignmentId = Number(e.target.value);
  renderSubmissions();
});

// ---- Render the submissions table for the currently selected assignment ----
function renderSubmissions() {
  const tbody = document.getElementById("submissionsTableBody");
  const statusFilter = document.getElementById("submissionStatusFilter").value;

  const allForAssignment = MOCK_SUBMISSIONS.filter(function (s) {
    return s.assignment_id === selectedAssignmentId;
  });

  // ---- Stat cards (based on ALL submissions for this assignment, not the status-filtered list) ----
  const total = allForAssignment.length;
  const graded = allForAssignment.filter(function (s) { return s.status === "graded"; });
  const pending = total - graded.length;
  const avgScore = graded.length > 0
    ? Math.round(graded.reduce(function (sum, s) { return sum + s.score; }, 0) / graded.length)
    : null;

  document.getElementById("statTotalSubs").textContent = total;
  document.getElementById("statGradedSubs").textContent = graded.length;
  document.getElementById("statPendingSubs").textContent = pending;
  document.getElementById("statAvgScore").textContent = avgScore !== null ? avgScore + "%" : "—";

  // ---- Table rows (respects the status filter) ----
  const assignmentSubmissions = allForAssignment.filter(function (s) {
    if (statusFilter === "all") return true;
    return s.status === statusFilter;
  });

  if (assignmentSubmissions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i data-lucide="inbox" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No submissions match this filter.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = assignmentSubmissions.map(function (sub) {
    const student = MOCK_STUDENTS.find(function (s) { return s.id === sub.student_id; });

    const statusBadge = sub.status === "graded"
      ? '<span class="badge badge-success">Graded</span>'
      : '<span class="badge badge-warning">Pending</span>';

    const scoreDisplay = sub.score === null ? "—" : sub.score;

    return `
      <tr>
        <td data-label="Student">${escapeHtml(student.first_name + " " + student.last_name)}</td>
        <td data-label="Submitted">
          ${sub.submitted_at}
          <span style="display:block; font-size: var(--font-size-xs); color: var(--color-text-secondary);">${getTimeAgo(sub.submitted_at)}</span>
        </td>
        <td data-label="Score">${scoreDisplay}</td>
        <td data-label="Status">${statusBadge}</td>
        <td data-label="Actions">
          <button class="btn btn-outline btn-sm" onclick="openGradeModal(${sub.id})">
            <i data-lucide="pencil" style="width:14px;height:14px;"></i>
            Grade
          </button>
        </td>
      </tr>`;
  }).join("");

  refreshIcons();
}

// ---- Grade modal open/close ----
function openGradeModal(submissionId) {
  const sub = MOCK_SUBMISSIONS.find(function (s) { return s.id === submissionId; });
  if (!sub) return;

  const student = MOCK_STUDENTS.find(function (s) { return s.id === sub.student_id; });
  const assignment = MOCK_ASSIGNMENTS.find(function (a) { return a.id === sub.assignment_id; });

  document.getElementById("gradeSubmissionId").value = sub.id;
  document.getElementById("gradeStudentName").textContent = student.first_name + " " + student.last_name;
  document.getElementById("gradeFileLink").href = sub.file_url;
  document.getElementById("gradeMaxScore").textContent = assignment.maximum_score;
document.getElementById("gradeScore").value = sub.score !== null ? sub.score : "";
document.getElementById("gradeScore").max = assignment.maximum_score;
  document.getElementById("gradeFeedback").value = sub.feedback || "";
  document.getElementById("gradeScoreError").style.display = "none";

  const preview = document.getElementById("gradePreview");
if (sub.score !== null) {
  const percentage = (sub.score / assignment.maximum_score) * 100;
  const grade = getGrade(percentage);
  preview.innerHTML = `<span class="badge ${grade.badgeClass}">${grade.label}</span>`;
} else {
  preview.innerHTML = "";
}

  document.getElementById("gradeModal").classList.add("open");
}

function closeGradeModal() {
  document.getElementById("gradeModal").classList.remove("open");
}

// ---- Live grade preview as the admin types a score ----
document.getElementById("gradeScore").addEventListener("input", function () {
  const preview = document.getElementById("gradePreview");
  const scoreValue = Number(this.value);
  const maxScore = Number(document.getElementById("gradeMaxScore").textContent);

  if (this.value === "" || isNaN(scoreValue)) {
    preview.innerHTML = "";
    return;
  }

  const percentage = (scoreValue / maxScore) * 100;
  const grade = getGrade(percentage);
  preview.innerHTML = `<span class="badge ${grade.badgeClass}">${grade.label}</span>`;
});

// ---- Save the grade ----
function saveGrade() {
  const id = Number(document.getElementById("gradeSubmissionId").value);
  const sub = MOCK_SUBMISSIONS.find(function (s) { return s.id === id; });
  const assignment = MOCK_ASSIGNMENTS.find(function (a) { return a.id === sub.assignment_id; });

  const scoreInput = document.getElementById("gradeScore").value;
  const score = Number(scoreInput);
  const feedback = document.getElementById("gradeFeedback").value.trim();

  if (scoreInput === "" || isNaN(score) || score < 0 || score > assignment.maximum_score) {
    document.getElementById("gradeScoreError").textContent =
      "Enter a score between 0 and " + assignment.maximum_score;
    document.getElementById("gradeScoreError").style.display = "block";
    return;
  }
  document.getElementById("gradeScoreError").style.display = "none";

  sub.score = score;
  sub.feedback = feedback;
  sub.status = "graded";

  closeGradeModal();
  renderSubmissions();
}

// ---- Initial setup on page load ----
populateAssignmentFilter();
renderSubmissions();
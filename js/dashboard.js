// ==========================================================================
// dashboard.js — logic specific to dashboard.html ONLY
// ==========================================================================

// Welcome banner name
document.getElementById("welcomeAdminName").textContent = CURRENT_ADMIN.first_name;

// Stat card numbers
const stats = getDashboardStats();
document.getElementById("statStudents").textContent = stats.totalStudents;
document.getElementById("statCourses").textContent = stats.totalCourses;
document.getElementById("statAssignments").textContent = stats.totalAssignments;
document.getElementById("statQuizzes").textContent = stats.totalQuizzes;

// ---- Pending Submissions table ----
const pendingSubmissionsBody = document.getElementById("pendingSubmissionsBody");
const pendingSubmissions = MOCK_SUBMISSIONS.filter(function (s) {
  return s.status === "pending";
});

pendingSubmissionsBody.innerHTML = pendingSubmissions.map(function (sub) {
  const assignment = MOCK_ASSIGNMENTS.find(function (a) { return a.id === sub.assignment_id; });
  const student = MOCK_STUDENTS.find(function (s) { return s.id === sub.student_id; });
  return `
    <tr onclick="window.location.href='submissions.html?id=${sub.id}'" style="cursor:pointer;">
      <td data-label="Student">${escapeHtml(student.first_name + " " + student.last_name)}</td>
<td data-label="Assignment">${escapeHtml(assignment.title)}</td>
      <td data-label="Submitted">${sub.submitted_at}</td>
      <td data-label="Status"><span class="badge badge-warning">Pending</span></td>
    </tr>`;
}).join("");

// ---- Recent Students table (last 4 registered) ----
const recentStudentsBody = document.getElementById("recentStudentsBody");
const recentStudents = MOCK_STUDENTS.slice(-4).reverse();

recentStudentsBody.innerHTML = recentStudents.map(function (s) {
  const statusClass = s.status === "active" ? "badge-success" : "badge-danger";
  return `
    <tr onclick="window.location.href='students.html?id=${s.id}'" style="cursor:pointer;">
      <td data-label="Name">${escapeHtml(s.first_name + " " + s.last_name)}</td>
<td data-label="Email">${escapeHtml(s.email)}</td>
      <td data-label="Joined">${s.created_at}</td>
      <td data-label="Status"><span class="badge ${statusClass}">${s.status}</span></td>
    </tr>`;
}).join("");
// ---- Pass/Fail donut chart (all quiz attempts + graded assignments, all courses) ----
function renderPassFailChart() {
  let passCount = 0;
  let failCount = 0;

  MOCK_QUIZ_ATTEMPTS.forEach(function (attempt) {
    const quiz = MOCK_QUIZZES.find(function (q) { return q.id === attempt.quiz_id; });
    if (!quiz) return;
    const percentage = (attempt.score / quiz.total_marks) * 100;
    if (percentage >= 50) passCount++; else failCount++;
  });

  MOCK_SUBMISSIONS.forEach(function (sub) {
    if (sub.status !== "graded") return;
    const assignment = MOCK_ASSIGNMENTS.find(function (a) { return a.id === sub.assignment_id; });
    if (!assignment) return;
    const percentage = (sub.score / assignment.maximum_score) * 100;
    if (percentage >= 50) passCount++; else failCount++;
  });

  const total = passCount + failCount;
  const passPercent = total > 0 ? Math.round((passCount / total) * 100) : 0;

  document.getElementById("passFailDonut").style.setProperty("--pass-percent", passPercent + "%");
  document.getElementById("passFailLabel").textContent = passPercent + "%";
  document.getElementById("passCount").textContent = passCount;
  document.getElementById("failCount").textContent = failCount;
}

renderPassFailChart();
// ==========================================================================
// results.js — logic specific to results.html ONLY
// ========================================

let selectedCourseId = null;

// ---- Course filter dropdown (top of page) ----
function populateCourseFilter() {
  const select = document.getElementById("resultsCourseFilter");
  select.innerHTML = MOCK_COURSES.map(function (course) {
    return `<option value="${course.id}">${course.title}</option>`;
  }).join("");

  if (MOCK_COURSES.length > 0 && selectedCourseId === null) {
    selectedCourseId = MOCK_COURSES[0].id;
  }
  select.value = selectedCourseId;
}

document.getElementById("resultsCourseFilter").addEventListener("change", function (e) {
  selectedCourseId = Number(e.target.value);
  renderResults();
});

// ---- Build a combined list of results (quiz attempts + graded submissions)
//      for the currently selected course ----
function getResultsForSelectedCourse() {
  const results = [];

  const courseQuizIds = MOCK_QUIZZES
    .filter(function (q) { return q.course_id === selectedCourseId; })
    .map(function (q) { return q.id; });

  MOCK_QUIZ_ATTEMPTS.forEach(function (attempt) {
    if (!courseQuizIds.includes(attempt.quiz_id)) return;

    const quiz = MOCK_QUIZZES.find(function (q) { return q.id === attempt.quiz_id; });
    const student = MOCK_STUDENTS.find(function (s) { return s.id === attempt.student_id; });
    const percentage = (attempt.score / quiz.total_marks) * 100;

    results.push({
      studentName: student.first_name + " " + student.last_name,
      type: "Quiz",
      title: quiz.title,
      score: attempt.score + " / " + quiz.total_marks,
      percentage: percentage,
    });
  });

  const courseAssignmentIds = MOCK_ASSIGNMENTS
    .filter(function (a) { return a.course_id === selectedCourseId; })
    .map(function (a) { return a.id; });

  MOCK_SUBMISSIONS.forEach(function (sub) {
    if (sub.status !== "graded" || !courseAssignmentIds.includes(sub.assignment_id)) return;

    const assignment = MOCK_ASSIGNMENTS.find(function (a) { return a.id === sub.assignment_id; });
    const student = MOCK_STUDENTS.find(function (s) { return s.id === sub.student_id; });
    const percentage = (sub.score / assignment.maximum_score) * 100;

    results.push({
      studentName: student.first_name + " " + student.last_name,
      type: "Assignment",
      title: assignment.title,
      score: sub.score + " / " + assignment.maximum_score,
      percentage: percentage,
    });
  });

  return results;
}

const GRADE_BANDS = [
  { label: "Excellent", min: 85, color: "var(--color-success)" },
  { label: "Very Good", min: 70, color: "var(--color-primary)" },
  { label: "Good", min: 60, color: "var(--color-purple)" },
  { label: "Fair", min: 50, color: "var(--color-warning)" },
  { label: "Poor", min: 0, color: "var(--color-danger)" },
];

function renderGradeDistribution(results) {
  const container = document.getElementById("gradeDistributionChart");

  if (results.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding: var(--space-lg);">No data yet.</div>';
    return;
  }

  const counts = GRADE_BANDS.map(function () { return 0; });
  results.forEach(function (r) {
    for (let i = 0; i < GRADE_BANDS.length; i++) {
      if (r.percentage >= GRADE_BANDS[i].min) {
        counts[i]++;
        break;
      }
    }
  });

  const maxCount = Math.max.apply(null, counts);

  container.innerHTML = GRADE_BANDS.map(function (band, i) {
    const widthPercent = maxCount > 0 ? (counts[i] / maxCount) * 100 : 0;
    return `
      <div class="grade-bar-row">
        <div class="grade-bar-label">${band.label}</div>
        <div class="grade-bar-track">
          <div class="grade-bar-fill" style="width:${widthPercent}%; background:${band.color};"></div>
        </div>
        <div class="grade-bar-count">${counts[i]}</div>
      </div>`;
  }).join("");
}

// ---- Render the summary stat cards + results table ----
function renderResults() {
  const results = getResultsForSelectedCourse();
  const tbody = document.getElementById("resultsTableBody");
  renderGradeDistribution(results);

  document.getElementById("statTotalResults").textContent = results.length;

  if (results.length === 0) {
    document.getElementById("statAverageScore").textContent = "—";
    document.getElementById("statPassRate").textContent = "—";

    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i data-lucide="trophy" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No results yet for this course.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  const averagePercentage = results.reduce(function (sum, r) { return sum + r.percentage; }, 0) / results.length;
  const passCount = results.filter(function (r) { return r.percentage >= 50; }).length;
  const passRate = (passCount / results.length) * 100;

  document.getElementById("statAverageScore").textContent = Math.round(averagePercentage) + "%";
  document.getElementById("statPassRate").textContent = Math.round(passRate) + "%";

  tbody.innerHTML = results.map(function (r) {
    const grade = getGrade(r.percentage);
    return `
      <tr>
        <td data-label="Student">${escapeHtml(r.studentName)}</td>
        <td data-label="Type"><span class="badge badge-muted">${r.type}</span></td>
        <td data-label="Title">${escapeHtml(r.title)}</td>
        <td data-label="Score">${r.score}</td>
        <td data-label="Grade"><span class="badge ${grade.badgeClass}">${grade.label}</span></td>
      </tr>`;
  }).join("");

  refreshIcons();
}

// ---- Initial setup on page load ----
populateCourseFilter();
renderResults();
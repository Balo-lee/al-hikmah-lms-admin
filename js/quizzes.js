// ==========================================================================
// quizzes.js — logic specific to quizzes.html ONLY
// ==========================================================================

let selectedCourseId = null;

// ---- Course filter dropdown (top of page) ----
function populateCourseFilter() {
  const select = document.getElementById("quizCourseFilter");
  select.innerHTML = MOCK_COURSES.map(function (course) {
    return `<option value="${course.id}">${course.title}</option>`;
  }).join("");

  if (MOCK_COURSES.length > 0 && selectedCourseId === null) {
    selectedCourseId = MOCK_COURSES[0].id;
  }
  select.value = selectedCourseId;
}

document.getElementById("quizCourseFilter").addEventListener("change", function (e) {
  selectedCourseId = Number(e.target.value);
  renderQuizzes();
});

// ---- Render the quizzes table for the currently selected course ----
function renderQuizzes() {
  const tbody = document.getElementById("quizzesTableBody");

  const courseQuizzes = MOCK_QUIZZES.filter(function (q) { return q.course_id === selectedCourseId; });

  if (courseQuizzes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <i data-lucide="help-circle" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No quizzes yet for this course.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = courseQuizzes.map(function (quiz) {
    const questionCount = MOCK_QUESTIONS.filter(function (q) { return q.quiz_id === quiz.id; }).length;

    const attempts = MOCK_QUIZ_ATTEMPTS.filter(function (a) { return a.quiz_id === quiz.id; });
const avgPercentage = attempts.length > 0
  ? attempts.reduce(function (sum, a) { return sum + (a.score / quiz.total_marks) * 100; }, 0) / attempts.length
  : null;
const avgGradeBadge = avgPercentage !== null
  ? (function () {
      const grade = getGrade(avgPercentage);
      return `<span class="badge ${grade.badgeClass}">${Math.round(avgPercentage)}% — ${grade.label}</span>`;
    })()
  : '<span class="badge badge-muted">No attempts</span>';

return `
  <tr>
    <td data-label="Title">${escapeHtml(quiz.title)}</td>
    <td data-label="Duration">${quiz.duration} min</td>
    <td data-label="Total Marks">${quiz.total_marks}</td>
    <td data-label="Pass Mark">${quiz.pass_mark}</td>
    <td data-label="Questions">
      <a href="questions.html?quiz_id=${quiz.id}" class="badge badge-info">${questionCount}</a>
    </td>
    <td data-label="Attempts"><span class="badge badge-muted">${attempts.length}</span></td>
    <td data-label="Avg. Score">${avgGradeBadge}</td>
    <td data-label="Actions">
          <div class="table-actions">
            <a href="questions.html?quiz_id=${quiz.id}" class="btn-icon" title="Manage Questions">
              <i data-lucide="list-checks" style="width:16px;height:16px;"></i>
            </a>
            <button class="btn-icon" onclick="editQuiz(${quiz.id})" title="Edit">
              <i data-lucide="pencil" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn-icon" onclick="deleteQuiz(${quiz.id})" title="Delete">
              <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  refreshIcons();
}

// ---- Fill the Course dropdown inside the Add/Edit modal ----
function populateModalCourseDropdown() {
  const select = document.getElementById("quizCourse");
  select.innerHTML = MOCK_COURSES.map(function (course) {
    return `<option value="${course.id}">${course.title}</option>`;
  }).join("");
}

// ---- Modal open/close ----
function openQuizModal() {
  populateModalCourseDropdown();

  document.getElementById("quizModalTitle").textContent = "New Quiz";
  document.getElementById("quizId").value = "";
  document.getElementById("quizCourse").value = selectedCourseId;
  document.getElementById("quizTitle").value = "";
  document.getElementById("quizDescription").value = "";
  document.getElementById("quizDuration").value = "";
  document.getElementById("quizTotalMarks").value = "";
  document.getElementById("quizPassMark").value = "";
  document.getElementById("quizTitleError").style.display = "none";
  document.getElementById("quizDurationError").style.display = "none";
  document.getElementById("quizModal").classList.add("open");
}

function closeQuizModal() {
  document.getElementById("quizModal").classList.remove("open");
}

// ---- Edit: pre-fill the modal ----
function editQuiz(id) {
  const quiz = MOCK_QUIZZES.find(function (q) { return q.id === id; });
  if (!quiz) return;

  populateModalCourseDropdown();

  document.getElementById("quizModalTitle").textContent = "Edit Quiz";
  document.getElementById("quizId").value = quiz.id;
  document.getElementById("quizCourse").value = quiz.course_id;
  document.getElementById("quizTitle").value = quiz.title;
  document.getElementById("quizDescription").value = quiz.description;
  document.getElementById("quizDuration").value = quiz.duration;
  document.getElementById("quizTotalMarks").value = quiz.total_marks;
  document.getElementById("quizPassMark").value = quiz.pass_mark;
  document.getElementById("quizTitleError").style.display = "none";
  document.getElementById("quizDurationError").style.display = "none";
  document.getElementById("quizModal").classList.add("open");
}

// ---- Save: validate, then add or update ----
function saveQuiz() {
  const id = document.getElementById("quizId").value;
  const courseId = Number(document.getElementById("quizCourse").value);
  const title = document.getElementById("quizTitle").value.trim();
  const description = document.getElementById("quizDescription").value.trim();
  const duration = Number(document.getElementById("quizDuration").value);
  const totalMarks = Number(document.getElementById("quizTotalMarks").value) || 10;
  const passMark = Number(document.getElementById("quizPassMark").value) || 0;

  let hasError = false;

  if (title === "") {
    document.getElementById("quizTitleError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("quizTitleError").style.display = "none";
  }

  if (!duration || duration <= 0) {
    document.getElementById("quizDurationError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("quizDurationError").style.display = "none";
  }

  if (hasError) return;

  if (id) {
    const quiz = MOCK_QUIZZES.find(function (q) { return q.id === Number(id); });
    quiz.course_id = courseId;
    quiz.title = title;
    quiz.description = description;
    quiz.duration = duration;
    quiz.total_marks = totalMarks;
    quiz.pass_mark = passMark;
  } else {
    const newId = MOCK_QUIZZES.length > 0
      ? Math.max.apply(null, MOCK_QUIZZES.map(function (q) { return q.id; })) + 1
      : 1;
    MOCK_QUIZZES.push({
      id: newId,
      course_id: courseId,
      title: title,
      description: description,
      duration: duration,
      total_marks: totalMarks,
      pass_mark: passMark,
    });
  }

  closeQuizModal();

  selectedCourseId = courseId;
  document.getElementById("quizCourseFilter").value = courseId;
  renderQuizzes();
}

// ---- Delete: blocked if students have already attempted the quiz ----
function deleteQuiz(id) {
  const quiz = MOCK_QUIZZES.find(function (q) { return q.id === id; });
  if (!quiz) return;

  const attemptCount = MOCK_QUIZ_ATTEMPTS.filter(function (a) { return a.quiz_id === id; }).length;

  if (attemptCount > 0) {
    alert(
      'Cannot delete "' + quiz.title + '" — ' + attemptCount + ' student attempt(s) already exist for it.\n\n' +
      'Deleting it now would remove their quiz results. You can still edit the quiz instead.'
    );
    return;
  }

  if (confirm('Are you sure you want to delete "' + quiz.title + '"? This will also remove its questions.')) {
    // Also clean up any questions/options belonging to this quiz
    const questionIdsToRemove = MOCK_QUESTIONS.filter(function (q) { return q.quiz_id === id; }).map(function (q) { return q.id; });

    for (let i = MOCK_OPTIONS.length - 1; i >= 0; i--) {
      if (questionIdsToRemove.includes(MOCK_OPTIONS[i].question_id)) {
        MOCK_OPTIONS.splice(i, 1);
      }
    }
    for (let i = MOCK_QUESTIONS.length - 1; i >= 0; i--) {
      if (MOCK_QUESTIONS[i].quiz_id === id) {
        MOCK_QUESTIONS.splice(i, 1);
      }
    }

    const index = MOCK_QUIZZES.findIndex(function (q) { return q.id === id; });
    MOCK_QUIZZES.splice(index, 1);
    renderQuizzes();
  }
}

// ---- Initial setup on page load ----
populateCourseFilter();
renderQuizzes();

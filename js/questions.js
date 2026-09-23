//=======================================
// questions.js — logic specific to questions.html ONLY

let selectedQuizId = null;
let optionRowCounter = 0; // gives each option row a unique id as we add more

// ---- Read ?quiz_id= from the URL (arriving from Quizzes page) ----
function getQuizIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("quiz_id");
  return value ? Number(value) : null;
}

// ---- Quiz filter dropdown (top of page) ----
function populateQuizFilter() {
  const select = document.getElementById("questionQuizFilter");
  select.innerHTML = MOCK_QUIZZES.map(function (quiz) {
    return `<option value="${quiz.id}">${quiz.title}</option>`;
  }).join("");

  const fromUrl = getQuizIdFromUrl();
  if (fromUrl && MOCK_QUIZZES.some(function (q) { return q.id === fromUrl; })) {
    selectedQuizId = fromUrl;
  } else if (MOCK_QUIZZES.length > 0) {
    selectedQuizId = MOCK_QUIZZES[0].id;
  }

  select.value = selectedQuizId;
}

document.getElementById("questionQuizFilter").addEventListener("change", function (e) {
  selectedQuizId = Number(e.target.value);
  renderQuestions();
});

// ---- Render the questions table for the currently selected quiz ----
function renderQuestions() {
  const tbody = document.getElementById("questionsTableBody");

  const quizQuestions = MOCK_QUESTIONS.filter(function (q) { return q.quiz_id === selectedQuizId; });

  if (quizQuestions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i data-lucide="check-square" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No questions yet for this quiz.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = quizQuestions.map(function (q) {
    const options = MOCK_OPTIONS.filter(function (o) { return o.question_id === q.id; });
    const correctOption = options.find(function (o) { return o.is_correct; });

    return `
  <tr>
    <td data-label="Question">${escapeHtml(q.question)}</td>
    <td data-label="Marks">${q.marks}</td>
    <td data-label="Options"><span class="badge badge-info">${options.length}</span></td>
    <td data-label="Correct Answer">${correctOption ? escapeHtml(correctOption.option_text) : "—"}</td>
    <td data-label="Actions">
      <div class="table-actions">
        <button class="btn-icon" onclick="previewQuestion(${q.id})" title="Preview">
          <i data-lucide="eye" style="width:16px;height:16px;"></i>
        </button>
        <button class="btn-icon" onclick="duplicateQuestion(${q.id})" title="Duplicate">
          <i data-lucide="copy" style="width:16px;height:16px;"></i>
        </button>
        <button class="btn-icon" onclick="editQuestion(${q.id})" title="Edit">
          <i data-lucide="pencil" style="width:16px;height:16px;"></i>
        </button>
        <button class="btn-icon" onclick="deleteQuestion(${q.id})" title="Delete">
          <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
        </button>
      </div>
    </td>
  </tr>`;
  }).join("");

  refreshIcons();
  renderMarksTotal();
}

// ---- Shows a badge comparing marks used vs the quiz's total_marks ----
function renderMarksTotal() {
  const quiz = MOCK_QUIZZES.find(function (q) { return q.id === selectedQuizId; });
  if (!quiz) return;

  const quizQuestions = MOCK_QUESTIONS.filter(function (q) { return q.quiz_id === selectedQuizId; });
  const marksUsed = quizQuestions.reduce(function (sum, q) { return sum + q.marks; }, 0);

  const matches = marksUsed === quiz.total_marks;
  const badgeClass = matches ? "badge-success" : "badge-warning";

  document.getElementById("marksTotalIndicator").innerHTML =
    `<span class="badge ${badgeClass}">Marks: ${marksUsed} / ${quiz.total_marks}</span>`;
}

// ---- Clones a question and all its options as a new question ----
function duplicateQuestion(id) {
  const original = MOCK_QUESTIONS.find(function (q) { return q.id === id; });
  if (!original) return;

  const newQuestionId = MOCK_QUESTIONS.length > 0
    ? Math.max.apply(null, MOCK_QUESTIONS.map(function (q) { return q.id; })) + 1
    : 1;

  MOCK_QUESTIONS.push({
    id: newQuestionId,
    quiz_id: original.quiz_id,
    question: original.question + " (Copy)",
    marks: original.marks,
  });

  const originalOptions = MOCK_OPTIONS.filter(function (o) { return o.question_id === id; });
  let nextOptionId = MOCK_OPTIONS.length > 0
    ? Math.max.apply(null, MOCK_OPTIONS.map(function (o) { return o.id; })) + 1
    : 1;

  originalOptions.forEach(function (opt) {
    MOCK_OPTIONS.push({
      id: nextOptionId,
      question_id: newQuestionId,
      option_text: opt.option_text,
      is_correct: opt.is_correct,
    });
    nextOptionId++;
  });

  renderQuestions();
}

// ---- Shows a question exactly as a student would see it (no answers revealed) ----
function previewQuestion(id) {
  const q = MOCK_QUESTIONS.find(function (x) { return x.id === id; });
  if (!q) return;

  const options = MOCK_OPTIONS.filter(function (o) { return o.question_id === id; });

  document.getElementById("previewQuestionText").textContent = q.question;
  document.getElementById("previewOptionsList").innerHTML = options.map(function (opt, index) {
    const optionId = "previewOpt" + index;
    return `
      <label for="${optionId}" style="display:flex; align-items:center; gap: var(--space-sm); padding: var(--space-sm) 0; cursor:default;">
        <input type="radio" id="${optionId}" name="previewOption" disabled>
        ${escapeHtml(opt.option_text)}
      </label>`;
  }).join("");

  document.getElementById("questionPreviewModal").classList.add("open");
  refreshIcons();
}

function closeQuestionPreviewModal() {
  document.getElementById("questionPreviewModal").classList.remove("open");
}

// ---- Fill the Quiz dropdown inside the Add/Edit modal ----
function populateModalQuizDropdown() {
  const select = document.getElementById("questionQuiz");
  select.innerHTML = MOCK_QUIZZES.map(function (quiz) {
    return `<option value="${quiz.id}">${quiz.title}</option>`;
  }).join("");
}

// ---- Build one option row (text input + "correct" radio + remove button) ----
function addOptionRow(text, isCorrect) {
  optionRowCounter++;
  const rowId = "optionRow" + optionRowCounter;

  const row = document.createElement("div");
  row.id = rowId;
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.gap = "8px";
  row.style.marginBottom = "8px";

  row.innerHTML = `
    <input type="radio" name="correctOption" value="${rowId}" ${isCorrect ? "checked" : ""} style="flex-shrink:0;">
    <input type="text" class="form-control option-text-input" placeholder="Option text" value="${text ? text.replace(/"/g, "&quot;") : ""}">
    <button type="button" class="btn-icon" onclick="removeOptionRow('${rowId}')" title="Remove option">
      <i data-lucide="x" style="width:14px;height:14px;"></i>
    </button>
  `;

  document.getElementById("optionsContainer").appendChild(row);
  refreshIcons();
}

// ---- Remove one option row ----
function removeOptionRow(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.remove();
}

// ---- Clear all option rows (used when opening the modal fresh) ----
function clearOptionRows() {
  document.getElementById("optionsContainer").innerHTML = "";
}

// ---- Modal open/close ----
function openQuestionModal() {
  populateModalQuizDropdown();
  clearOptionRows();

  document.getElementById("questionModalTitle").textContent = "New Question";
  document.getElementById("questionId").value = "";
  document.getElementById("questionQuiz").value = selectedQuizId;
  document.getElementById("questionText").value = "";
  document.getElementById("questionMarks").value = "1";
  document.getElementById("questionTextError").style.display = "none";
  document.getElementById("optionsError").style.display = "none";

  // Start with 2 blank options, since most questions need at least that many
  addOptionRow("", false);
  addOptionRow("", false);

  document.getElementById("questionModal").classList.add("open");
}

function closeQuestionModal() {
  document.getElementById("questionModal").classList.remove("open");
}

// ---- Edit: pre-fill the modal, including existing options ----
function editQuestion(id) {
  const q = MOCK_QUESTIONS.find(function (x) { return x.id === id; });
  if (!q) return;

  populateModalQuizDropdown();
  clearOptionRows();

  document.getElementById("questionModalTitle").textContent = "Edit Question";
  document.getElementById("questionId").value = q.id;
  document.getElementById("questionQuiz").value = q.quiz_id;
  document.getElementById("questionText").value = q.question;
  document.getElementById("questionMarks").value = q.marks;
  document.getElementById("questionTextError").style.display = "none";
  document.getElementById("optionsError").style.display = "none";

  const existingOptions = MOCK_OPTIONS.filter(function (o) { return o.question_id === id; });
  existingOptions.forEach(function (opt) {
    addOptionRow(opt.option_text, opt.is_correct);
  });

  document.getElementById("questionModal").classList.add("open");
}

// ---- Save: validate question + options, then add or update ----
function saveQuestion() {
  const id = document.getElementById("questionId").value;
  const quizId = Number(document.getElementById("questionQuiz").value);
  const questionText = document.getElementById("questionText").value.trim();
  const marks = Number(document.getElementById("questionMarks").value) || 1;

  let hasError = false;

  if (questionText === "") {
    document.getElementById("questionTextError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("questionTextError").style.display = "none";
  }

  // Collect all option rows currently in the form
  const optionRows = document.querySelectorAll("#optionsContainer > div");
  const collectedOptions = [];

  optionRows.forEach(function (row) {
    const textInput = row.querySelector(".option-text-input");
    const radio = row.querySelector('input[type="radio"]');
    const text = textInput.value.trim();
    if (text !== "") {
      collectedOptions.push({ text: text, isCorrect: radio.checked });
    }
  });

  const hasCorrectAnswer = collectedOptions.some(function (o) { return o.isCorrect; });

  if (collectedOptions.length < 2 || !hasCorrectAnswer) {
    document.getElementById("optionsError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("optionsError").style.display = "none";
  }

  if (hasError) return;

  let questionId;

  if (id) {
    questionId = Number(id);
    const q = MOCK_QUESTIONS.find(function (x) { return x.id === questionId; });
    q.quiz_id = quizId;
    q.question = questionText;
    q.marks = marks;

    for (let i = MOCK_OPTIONS.length - 1; i >= 0; i--) {
      if (MOCK_OPTIONS[i].question_id === questionId) {
        MOCK_OPTIONS.splice(i, 1);
      }
    }
  } else {
    questionId = MOCK_QUESTIONS.length > 0
      ? Math.max.apply(null, MOCK_QUESTIONS.map(function (x) { return x.id; })) + 1
      : 1;
    MOCK_QUESTIONS.push({ id: questionId, quiz_id: quizId, question: questionText, marks: marks });
  }

  let nextOptionId = MOCK_OPTIONS.length > 0
    ? Math.max.apply(null, MOCK_OPTIONS.map(function (o) { return o.id; })) + 1
    : 1;

  collectedOptions.forEach(function (opt) {
    MOCK_OPTIONS.push({
      id: nextOptionId,
      question_id: questionId,
      option_text: opt.text,
      is_correct: opt.isCorrect,
    });
    nextOptionId++;
  });

  closeQuestionModal();

  selectedQuizId = quizId;
  document.getElementById("questionQuizFilter").value = quizId;
  renderQuestions();
}

// ---- Delete: simple confirm, also removes its options ----
function deleteQuestion(id) {
  const q = MOCK_QUESTIONS.find(function (x) { return x.id === id; });
  if (!q) return;

  if (confirm('Are you sure you want to delete this question?\n\n"' + q.question + '"')) {
    for (let i = MOCK_OPTIONS.length - 1; i >= 0; i--) {
      if (MOCK_OPTIONS[i].question_id === id) {
        MOCK_OPTIONS.splice(i, 1);
      }
    }
    const index = MOCK_QUESTIONS.findIndex(function (x) { return x.id === id; });
    MOCK_QUESTIONS.splice(index, 1);
    renderQuestions();
  }
}

// ---- Initial setup on page load ----
populateQuizFilter();
renderQuestions();
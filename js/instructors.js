// ====================================
// instructors.js — logic specific to instructors.html ONLY

// ---- Render the instructors table ----
function renderInstructors(filterText) {
  const tbody = document.getElementById("instructorsTableBody");
  const search = (filterText || "").toLowerCase();

  const filtered = MOCK_INSTRUCTORS.filter(function (inst) {
    const fullName = (inst.first_name + " " + inst.last_name).toLowerCase();
    return fullName.includes(search) || inst.email.toLowerCase().includes(search);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <i data-lucide="user-x" class="empty-state__icon" style="width:40px;height:40px;"></i>
            <div>No instructors found.</div>
          </div>
        </td>
      </tr>`;
    refreshIcons();
    return;
  }

  tbody.innerHTML = filtered.map(function (inst) {
    // Count how many courses this instructor teaches
    const courseCount = MOCK_COURSES.filter(function (course) {
      return course.instructor_id === inst.id;
    }).length;

    const statusBadge = inst.status === "active"
      ? '<span class="badge badge-success">Active</span>'
      : '<span class="badge badge-danger">Disabled</span>';

    const toggleLabel = inst.status === "active" ? "Disable" : "Enable";
    const toggleIcon = inst.status === "active" ? "user-x" : "user-check";

    return `
      <tr>
        <td data-label="Name">${escapeHtml(inst.first_name + " " + inst.last_name)}</td>
<td data-label="Email">${escapeHtml(inst.email)}</td>
<td data-label="Phone">${escapeHtml(inst.phone)}</td>
        <td data-label="Courses"><span class="badge badge-info">${courseCount}</span></td>
        <td data-label="Status">${statusBadge}</td>
        <td data-label="Actions">
          <div class="table-actions">
            <button class="btn-icon" onclick="editInstructor(${inst.id})" title="Edit">
              <i data-lucide="pencil" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn-icon" onclick="toggleInstructorStatus(${inst.id})" title="${toggleLabel}">
              <i data-lucide="${toggleIcon}" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  refreshIcons();
}

// ---- Search box ----
document.getElementById("instructorSearch").addEventListener("input", function (e) {
  renderInstructors(e.target.value);
});

// ---- Modal open/close ----
function openInstructorModal() {
  document.getElementById("instructorModalTitle").textContent = "New Instructor";
  document.getElementById("instructorId").value = "";
  document.getElementById("instructorFirstName").value = "";
  document.getElementById("instructorLastName").value = "";
  document.getElementById("instructorEmail").value = "";
  document.getElementById("instructorPhone").value = "";
  document.getElementById("instructorFirstNameError").style.display = "none";
  document.getElementById("instructorLastNameError").style.display = "none";
  document.getElementById("instructorEmailError").style.display = "none";
  document.getElementById("instructorModal").classList.add("open");
}

function closeInstructorModal() {
  document.getElementById("instructorModal").classList.remove("open");
}

// ---- Edit: pre-fill the modal ----
function editInstructor(id) {
  const inst = MOCK_INSTRUCTORS.find(function (i) { return i.id === id; });
  if (!inst) return;

  document.getElementById("instructorModalTitle").textContent = "Edit Instructor";
  document.getElementById("instructorId").value = inst.id;
  document.getElementById("instructorFirstName").value = inst.first_name;
  document.getElementById("instructorLastName").value = inst.last_name;
  document.getElementById("instructorEmail").value = inst.email;
  document.getElementById("instructorPhone").value = inst.phone;
  document.getElementById("instructorModal").classList.add("open");
}

// ---- Save: validate, then add or update ----
function saveInstructor() {
  const id = document.getElementById("instructorId").value;
  const firstName = document.getElementById("instructorFirstName").value.trim();
  const lastName = document.getElementById("instructorLastName").value.trim();
  const email = document.getElementById("instructorEmail").value.trim();
  const phone = document.getElementById("instructorPhone").value.trim();

  let hasError = false;

  if (firstName === "") {
    document.getElementById("instructorFirstNameError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("instructorFirstNameError").style.display = "none";
  }

  if (lastName === "") {
    document.getElementById("instructorLastNameError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("instructorLastNameError").style.display = "none";
  }

  // Simple email check: must contain "@" and "."
  if (email === "" || !email.includes("@") || !email.includes(".")) {
    document.getElementById("instructorEmailError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("instructorEmailError").style.display = "none";
  }

  if (hasError) return;

  if (id) {
    // Editing an existing instructor
    const inst = MOCK_INSTRUCTORS.find(function (i) { return i.id === Number(id); });
    inst.first_name = firstName;
    inst.last_name = lastName;
    inst.email = email;
    inst.phone = phone;
  } else {
    // Adding a new instructor
    const newId = MOCK_INSTRUCTORS.length > 0
      ? Math.max.apply(null, MOCK_INSTRUCTORS.map(function (i) { return i.id; })) + 1
      : 1;
    MOCK_INSTRUCTORS.push({
      id: newId,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      status: "active",
      created_at: new Date().toISOString().split("T")[0],
    });
  }

  closeInstructorModal();
  renderInstructors();
}

// ---- Toggle active/disabled status (instead of hard delete) ----
function toggleInstructorStatus(id) {
  const inst = MOCK_INSTRUCTORS.find(function (i) { return i.id === id; });
  if (!inst) return;

  const courseCount = MOCK_COURSES.filter(function (course) {
    return course.instructor_id === id;
  }).length;

  const action = inst.status === "active" ? "disable" : "enable";
  let message = 'Are you sure you want to ' + action + ' ' + inst.first_name + ' ' + inst.last_name + '?';

  if (action === "disable" && courseCount > 0) {
    message = inst.first_name + ' ' + inst.last_name + ' is currently teaching ' + courseCount + ' course(s). Disabling them may affect those courses. Continue?';
  }

  if (confirm(message)) {
    inst.status = inst.status === "active" ? "disabled" : "active";
    renderInstructors();
  }
}

// ---- Initial render on page load ----
renderInstructors();

// ==========================================================================
// profile.js — logic specific to profile.html ONLY
// ==========================================================================

// ---- Pre-fill the Personal Info form with the current admin's data ----
function loadProfileForm() {
  document.getElementById("profileFirstName").value = CURRENT_ADMIN.first_name;
  document.getElementById("profileLastName").value = CURRENT_ADMIN.last_name;
  document.getElementById("profileEmail").value = CURRENT_ADMIN.email || "";
  document.getElementById("profilePhone").value = CURRENT_ADMIN.phone || "";
  document.getElementById("profilePhotoInitials").textContent = getAdminInitials(CURRENT_ADMIN);
}

// ---- Save Personal Info ----
function saveProfileInfo() {
  const firstName = document.getElementById("profileFirstName").value.trim();
  const lastName = document.getElementById("profileLastName").value.trim();
  const email = document.getElementById("profileEmail").value.trim();
  const phone = document.getElementById("profilePhone").value.trim();

  let hasError = false;

  if (firstName === "") {
    document.getElementById("profileFirstNameError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("profileFirstNameError").style.display = "none";
  }

  if (lastName === "") {
    document.getElementById("profileLastNameError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("profileLastNameError").style.display = "none";
  }

  if (email === "" || !email.includes("@") || !email.includes(".")) {
    document.getElementById("profileEmailError").style.display = "block";
    hasError = true;
  } else {
    document.getElementById("profileEmailError").style.display = "none";
  }

  if (hasError) {
    document.getElementById("profileSavedMessage").style.display = "none";
    return;
  }

  // Update the shared CURRENT_ADMIN object — this is what the header,
  // sidebar avatar, and dashboard welcome banner all read from, so the
  // change appears everywhere immediately without a page reload.
  CURRENT_ADMIN.first_name = firstName;
  CURRENT_ADMIN.last_name = lastName;
  CURRENT_ADMIN.email = email;
  CURRENT_ADMIN.phone = phone;
  
  profileFormDirty = false;

  // Refresh this page's own header (admin-layout.js only sets these once on load)
  document.getElementById("adminInitials").textContent = getAdminInitials(CURRENT_ADMIN);
  document.getElementById("adminName").textContent = firstName + " " + lastName;
  document.getElementById("profilePhotoInitials").textContent = getAdminInitials(CURRENT_ADMIN);

  document.getElementById("profileSavedMessage").style.display = "block";
  setTimeout(function () {
  document.getElementById("profileSavedMessage").style.display = "none";
}, 3000);
}

// ---- Save Password (form validation only — no real backend yet) ----
function savePassword() {
  const current = document.getElementById("currentPassword").value;
  const newPass = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  const errorBox = document.getElementById("passwordError");

  if (current === "") {
    errorBox.textContent = "Enter your current password.";
    errorBox.style.display = "block";
    document.getElementById("passwordSavedMessage").style.display = "none";
    return;
  }

  if (newPass.length < 6) {
    errorBox.textContent = "New password must be at least 6 characters.";
    errorBox.style.display = "block";
    document.getElementById("passwordSavedMessage").style.display = "none";
    return;
  }

  if (newPass !== confirm) {
    errorBox.textContent = "New password and confirmation do not match.";
    errorBox.style.display = "block";
    document.getElementById("passwordSavedMessage").style.display = "none";
    return;
  }

  errorBox.style.display = "none";

  // No real backend yet, so we just clear the fields and show success.
  // TODO: replace with a real call to /api/auth/change-password once backend is ready.
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
  
document.getElementById("passwordSavedMessage").style.display = "block";
setTimeout(function () {
  document.getElementById("passwordSavedMessage").style.display = "none";
}, 3000);
}

// ---- Toggle a password field between hidden (••••) and visible (plain text) ----
function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";

  input.type = isHidden ? "text" : "password";
  button.innerHTML = isHidden
    ? '<i data-lucide="eye-off"></i>'
    : '<i data-lucide="eye"></i>';

  refreshIcons();
}

// ---- Warn before leaving the page if Personal Info has unsaved changes ----
let profileFormDirty = false;

function markProfileFormDirty() {
  profileFormDirty = true;
}

["profileFirstName", "profileLastName", "profileEmail", "profilePhone"].forEach(function (fieldId) {
  document.getElementById(fieldId).addEventListener("input", markProfileFormDirty);
});

window.addEventListener("beforeunload", function (e) {
  if (profileFormDirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// ---- Initial setup on page load ----
loadProfileForm();
// ==========================================================================
// admin-layout.js
// Handles ONLY things that appear on EVERY page: sidebar open/close,
// notifications dropdown, and the logged-in admin's name/initials.
// Page-specific logic (dashboard stats, categories table, etc.) lives in
// that page's own .js file (dashboard.js, categories.js, etc.)
// ==========================================================================

// Render all Lucide icons on the page
lucide.createIcons();

// Re-renders any newly added <i data-lucide="..."> icons.
// Call this after injecting new HTML that contains icons.
function refreshIcons() {
  lucide.createIcons();
}

// ---- Sidebar open/close ----
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");   // hamburger button (header)
const sidebarClose = document.getElementById("sidebarClose");     // X button (inside sidebar)
const sidebarOverlay = document.getElementById("sidebarOverlay"); // dark background overlay

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("open");
  document.body.classList.add("no-scroll");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

sidebarToggle.addEventListener("click", openSidebar);
sidebarClose.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

// Clicking any nav link closes the sidebar (only matters on mobile)
const sidebarLinks = sidebar.querySelectorAll(".sidebar__link");
sidebarLinks.forEach(function (link) {
  link.addEventListener("click", closeSidebar);
});

// ---- Logout ----
function handleLogout() {
  // TODO: replace with a real logout API call once backend is ready
  if (confirm("Are you sure you want to log out?")) {
    window.location.href = "login.html";
  }
}

// ---- Notifications dropdown ----
const notificationBtn = document.getElementById("notificationBtn");
const notificationDropdown = document.getElementById("notificationDropdown");
const notificationList = document.getElementById("notificationList");
const notificationBadge = document.getElementById("notificationBadge");

function renderNotifications() {
  const unreadCount = MOCK_NOTIFICATIONS.filter(function (n) { return !n.read; }).length;
  notificationBadge.textContent = unreadCount;
  notificationBadge.style.display = unreadCount > 0 ? "flex" : "none";

  notificationList.innerHTML = MOCK_NOTIFICATIONS.map(function (n) {
    const unreadClass = n.read ? "" : "unread";
    return `
      <a href="${n.link}" class="notification-item ${unreadClass}">
  ${escapeHtml(n.message)}
  <span class="notification-item__time">${n.created_at}</span>
</a>`;
  }).join("");
}

renderNotifications();

notificationBtn.addEventListener("click", function (event) {
  event.stopPropagation();
  notificationDropdown.classList.toggle("open");
});

document.addEventListener("click", function () {
  notificationDropdown.classList.remove("open");
});

// ---- Logged-in admin name / initials / role ----
document.getElementById("adminInitials").textContent = getAdminInitials(CURRENT_ADMIN);
document.getElementById("adminName").textContent = CURRENT_ADMIN.first_name + " " + CURRENT_ADMIN.last_name;
document.getElementById("adminRole").textContent = CURRENT_ADMIN.role;

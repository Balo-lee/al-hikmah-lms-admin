/* ==========================================================================
   MOCK DATA
   Field names match the database schema in the project roadmap (§13) so
   swapping these arrays for real fetch() calls to the Node/Express API
   later is a clean 1:1 replacement — not a rewrite.

   When backend is ready:
     const students = MOCK_STUDENTS;             ❌ remove
     const students = await fetch('/api/users?role=student').then(r => r.json()); ✅ add
   ========================================================================== */
   
   // ---- Shared helper: safely escape text before inserting into HTML ----
// Prevents user-entered text like "<a>" from being treated as real HTML.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---- Shared helper: 5-band grading system based on percentage score ----
function getGrade(percentage) {
  if (percentage >= 85) return { label: "Excellent", badgeClass: "badge-success" };
  if (percentage >= 70) return { label: "Very Good", badgeClass: "badge-blue" };
  if (percentage >= 60) return { label: "Good", badgeClass: "badge-info" };
  if (percentage >= 50) return { label: "Fair", badgeClass: "badge-warning" };
  return { label: "Poor", badgeClass: "badge-danger" };
}

// ---- current logged-in admin (mock — replace with real session data once backend auth is ready) ----
const CURRENT_ADMIN = {
  first_name: "Lawal",
  last_name: "Abdulwahab",
  email: "lawalabdulahab_123@alhikmahtech.net",
  phone: "08086485210",
  role: "Administrator",
};

// Builds initials from first + last name, e.g. "Great Stack" -> "GS"
function getAdminInitials(admin) {
  const first = admin.first_name.charAt(0).toUpperCase();
  const last = admin.last_name.charAt(0).toUpperCase();
  return first + last;
}

// ---- notifications (mock, until backend is ready) ----
const MOCK_NOTIFICATIONS = [
  { id: 1, message: "Chinedu Okafor submitted 'Build a Personal Website'", type: "submission", link: "submissions.html", read: false, created_at: "2026-08-22" },
  { id: 2, message: "New student registered: Emeka Nwosu", type: "student", link: "students.html", read: false, created_at: "2026-08-21" },
  { id: 3, message: "Amina Yusuf completed 'HTML Quiz' — scored 85%", type: "quiz", link: "results.html", read: true, created_at: "2026-08-20" },
];

// ---- users (role: student) ----
const MOCK_STUDENTS = [
  { id: 1, first_name: "Amina", last_name: "Yusuf", email: "amina.yusuf@gmail.com", phone: "08012345671", profile_image: null, status: "active", created_at: "2026-06-01" },
  { id: 2, first_name: "Chinedu", last_name: "Okafor", email: "chineduokafor556@gmail.com", phone: "08012345672", profile_image: null, status: "active", created_at: "2026-06-03" },
  { id: 3, first_name: "Fatima", last_name: "Bello", email: "fatimabellozahra@gmail.com", phone: "08012345673", profile_image: null, status: "disabled", created_at: "2026-06-05" },
  { id: 4, first_name: "Muhammad", last_name: "Jibril", email: "muhammad_jibril001@gmail.com", phone: "08012345674", profile_image: null, status: "active", created_at: "2026-06-10" },
];

// ---- users (role: instructor) ----
const MOCK_INSTRUCTORS = [
  { id: 101, first_name: "John", last_name: "Samuel", email: "johnsammy@alhikmahtech.net", phone: "08060884357", status: "active", created_at: "2026-05-15" },
  { id: 102, first_name: "Khadijah", last_name: "Ibrahim", email: "kadijah.ibrahim@alhikmahtech.net", phone: "08035925749", status: "active", created_at: "2026-05-20" },
];

// ---- categories ----
const MOCK_CATEGORIES = [
  { id: 1, name: "Web Development", description: "Frontend and backend web technologies" },
  { id: 2, name: "Cybersecurity", description: "Network and information security" },
  { id: 3, name: "Data Analysis", description: "Data handling, visualization and insights" },
  { id: 4, name: "AI/ML", description: "Build AIs and learn machine languages" },
];

// ---- courses ----
const MOCK_COURSES = [
  { id: 1, title: "Web Development Fundamentals", description: "HTML, CSS, JavaScript basics through to a final project.", category_id: 1, instructor_id: 101, thumbnail: null, duration: "12 Weeks", status: "published", created_at: "2026-06-01" },
  { id: 2, title: "Cybersecurity Essentials", description: "Core concepts in network and information security.", category_id: 2, instructor_id: 102, thumbnail: null, duration: "8 Weeks", status: "published", created_at: "2026-06-05" },
  { id: 3, title: "Data Analysis with Excel", description: "Practical data analysis techniques for beginners.", category_id: 3, instructor_id: 101, thumbnail: null, duration: "6 Weeks", status: "draft", created_at: "2026-06-12" },
];

// ---- modules ----
const MOCK_MODULES = [
  { id: 1, course_id: 1, title: "Introduction", order_number: 1 },
  { id: 2, course_id: 1, title: "HTML", order_number: 2 },
  { id: 3, course_id: 1, title: "CSS", order_number: 3 },
  { id: 4, course_id: 1, title: "JavaScript", order_number: 4 },
  { id: 5, course_id: 1, title: "Final Project", order_number: 5 },
];

// ---- materials ----
const MOCK_MATERIALS = [
  { id: 1, module_id: 2, title: "HTML Basics Slides", description: "Intro slide deck", file_url: "#", material_type: "pdf", order_number: 1, created_at: "2026-06-02" },
  { id: 2, module_id: 3, title: "CSS Flexbox Guide", description: "Layout guide", file_url: "#", material_type: "pdf", order_number: 1, created_at: "2026-06-08" },
  { id: 3, module_id: 4, title: "JS Fundamentals Video", description: "Recorded lecture", file_url: "#", material_type: "video", order_number: 1, created_at: "2026-06-15" },
];

// ---- assignments ----
const MOCK_ASSIGNMENTS = [
  { id: 1, course_id: 1, title: "Build a Personal Website", description: "Create a static personal portfolio site.", deadline: "2026-09-30", maximum_score: 100, created_at: "2026-06-20" },
  { id: 2, course_id: 2, title: "Security Audit Report", description: "Perform a basic audit on a sample system.", deadline: "2026-09-15", maximum_score: 100, created_at: "2026-06-22" },
];

// ---- submissions ----
const MOCK_SUBMISSIONS = [
  { id: 1, assignment_id: 1, student_id: 1, file_url: "#", submitted_at: "2026-08-15", score: null, feedback: null, status: "pending" },
  { id: 2, assignment_id: 1, student_id: 2, file_url: "#", submitted_at: "2026-08-10", score: 88, feedback: "Great structure, clean CSS.", status: "graded" },
  { id: 3, assignment_id: 2, student_id: 4, file_url: "#", submitted_at: "2026-08-18", score: null, feedback: null, status: "pending" },
];

// ---- quizzes ----
const MOCK_QUIZZES = [
  { id: 1, course_id: 1, title: "HTML Quiz", description: "Test your HTML knowledge", duration: 15, total_marks: 10, pass_mark: 6 },
  { id: 2, course_id: 1, title: "CSS Quiz", description: "Test your CSS knowledge", duration: 15, total_marks: 10, pass_mark: 6 },
  { id: 3, course_id: 2, title: "Security Basics Quiz", description: "Core security concepts", duration: 20, total_marks: 10, pass_mark: 6 },
];

// ---- questions ----
const MOCK_QUESTIONS = [
  { id: 1, quiz_id: 1, question: "What does HTML stand for?", marks: 1 },
  { id: 2, quiz_id: 1, question: "Which tag creates a hyperlink?", marks: 1 },
];

// ---- options ----
const MOCK_OPTIONS = [
  { id: 1, question_id: 1, option_text: "Hyper Text Markup Language", is_correct: true },
  { id: 2, question_id: 1, option_text: "High Text Machine Language", is_correct: false },
  { id: 3, question_id: 1, option_text: "Hyperlink Text Management Language", is_correct: false },
  { id: 4, question_id: 1, option_text: "Home Tool Markup Language", is_correct: false },
  { id: 5, question_id: 2, option_text: "<a>", is_correct: true },
  { id: 6, question_id: 2, option_text: "<link>", is_correct: false },
];

// ---- quiz_attempts ----
const MOCK_QUIZ_ATTEMPTS = [
  { id: 1, quiz_id: 1, student_id: 1, score: 9, started_at: "2026-08-01T10:00:00", completed_at: "2026-08-01T10:12:00" },
  { id: 2, quiz_id: 2, student_id: 1, score: 6, started_at: "2026-08-03T09:00:00", completed_at: "2026-08-03T09:14:00" },
  { id: 3, quiz_id: 3, student_id: 3, score: 5, started_at: "2026-08-05T11:00:00", completed_at: "2026-08-05T11:20:00" },
];

// ---- enrollments ----
const MOCK_ENROLLMENTS = [
  { id: 1, student_id: 1, course_id: 1, enrollment_date: "2026-06-05", status: "active", progress: 65 },
  { id: 2, student_id: 1, course_id: 2, enrollment_date: "2026-06-10", status: "active", progress: 40 },
  { id: 3, student_id: 2, course_id: 1, enrollment_date: "2026-06-06", status: "active", progress: 80 },
  { id: 4, student_id: 4, course_id: 2, enrollment_date: "2026-06-15", status: "active", progress: 20 },
];

// ---- Dashboard summary helper ----
function getDashboardStats() {
  return {
    totalStudents: MOCK_STUDENTS.length,
    totalCourses: MOCK_COURSES.length,
    totalAssignments: MOCK_ASSIGNMENTS.length,
    totalQuizzes: MOCK_QUIZZES.length,
    pendingSubmissions: MOCK_SUBMISSIONS.filter(s => s.status === "pending").length,
  };
}

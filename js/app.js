/* ==========================================================================
   অর্থপাঠ — Main App Logic
   ========================================================================== */

const ADMIN_PASSWORD = "Orthopath@Rimon26"; // এখানে বদলাতে পারবেন

let App = {
  currentQuiz: null,   // active MCQ session state
  currentView: "home",
};

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  renderLogo();
  checkLoginState();
  bindNav();
  bindLoginForms();
  bindAdmin();
  renderHome();
  renderPractice();
  renderEvaluation();
  renderContact();
  renderAbout();
  updateOnlineBadge();
  window.addEventListener("online", updateOnlineBadge);
  window.addEventListener("offline", updateOnlineBadge);
});

function updateOnlineBadge() {
  const el = document.getElementById("connStatus");
  if (!el) return;
  if (navigator.onLine) {
    el.textContent = "অনলাইন";
    el.className = "pill";
  } else {
    el.textContent = "অফলাইন মোডে চলছে";
    el.className = "pill pill-gold";
  }
}

// ============================================================
// LOGO (uses the app's real icon image, cached offline via service worker)
// ============================================================
function renderLogo() {
  const img = `<img src="assets/icon-512.png" alt="অর্থপাঠ" style="width:100%; height:100%; object-fit:contain; border-radius:50%;">`;
  document.querySelectorAll(".logo-slot").forEach(el => el.innerHTML = img);
}

// ============================================================
// LOGIN / AUTH
// ============================================================
function checkLoginState() {
  const student = Store.getStudent();
  const adminIn = Store.isAdminLoggedIn();

  if (adminIn) {
    showAdminPanel();
  } else if (student) {
    showMainApp();
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("mainApp").style.display = "none";
  document.getElementById("adminPanel").style.display = "none";
}

function showMainApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("mainApp").style.display = "block";
  document.getElementById("adminPanel").style.display = "none";
  const student = Store.getStudent();
  const nameEl = document.getElementById("studentNameDisplay");
  if (nameEl && student) nameEl.textContent = student.name;
}

function showAdminPanel() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("mainApp").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";
  renderAdminDashboard();
}

function bindLoginForms() {
  // Tabs
  document.getElementById("tabStudent").addEventListener("click", () => switchLoginTab("student"));
  document.getElementById("tabAdmin").addEventListener("click", () => switchLoginTab("admin"));

  // Student login
  document.getElementById("studentLoginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("studentNameInput").value.trim();
    const phone = document.getElementById("studentPhoneInput").value.trim();
    if (!name || !phone) return showToast("নাম ও মোবাইল নম্বর দিন");
    if (!/^[0-9+]{10,15}$/.test(phone)) return showToast("সঠিক মোবাইল নম্বর দিন");

    const student = { name, phone, joinedAt: Date.now() };
    Store.setStudent(student);
    Store.saveStudentRecord(student);
    showToast("স্বাগতম, " + name);
    showMainApp();
  });

  // Admin login
  document.getElementById("adminLoginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = document.getElementById("adminPassInput").value;
    if (pass === ADMIN_PASSWORD) {
      Store.setAdminLoggedIn(true);
      showToast("এডমিন হিসেবে লগইন সফল");
      showAdminPanel();
    } else {
      showToast("পাসওয়ার্ড সঠিক নয়");
    }
  });
}

function switchLoginTab(which) {
  document.getElementById("tabStudent").classList.toggle("active", which === "student");
  document.getElementById("tabAdmin").classList.toggle("active", which === "admin");
  document.getElementById("studentLoginForm").style.display = which === "student" ? "block" : "none";
  document.getElementById("adminLoginForm").style.display = which === "admin" ? "block" : "none";
}

function logoutStudent() {
  Store.logoutStudent();
  showLoginScreen();
}

function logoutAdmin() {
  Store.setAdminLoggedIn(false);
  showLoginScreen();
}

// ============================================================
// BOTTOM NAV
// ============================================================
function bindNav() {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });
}

function switchView(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById("view-" + view).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  App.currentView = view;
  document.querySelector(".app-header .brand-row").scrollIntoView({ behavior: "instant" });
  const backBtn = document.getElementById("headerBackBtn");
  if (backBtn) backBtn.classList.remove("show");
}

// ============================================================
// HOME (ক)
// ============================================================
function renderHome() {
  const container = document.getElementById("view-home");
  const chapters1 = ORTHOPATH_DATA.paper1.chapters;
  container.innerHTML = `
    <div class="section-title">🏠 হোম</div>

    <div class="feature-grid">
      <button class="feature-card" onclick="openChapterList('paper1')">
        <div class="f-icon">📘</div>
        <div class="f-label">১ম পত্র<br>(৯ অধ্যায়)</div>
      </button>
      <button class="feature-card" onclick="openPaper2Menu()">
        <div class="f-icon">📗</div>
        <div class="f-label">২য় পত্র<br>ব্যাংকিং ও বিমা</div>
      </button>
      <button class="feature-card" onclick="openFormulas()">
        <div class="f-icon">📐</div>
        <div class="f-label">অধ্যায়ভিত্তিক<br>সূত্র</div>
      </button>
      <button class="feature-card" onclick="openVideos()">
        <div class="f-icon">🎬</div>
        <div class="f-label">ভিডিও<br>লেকচার</div>
      </button>
    </div>

    <div id="homeSubView"></div>
  `;
}

function homeSubView(html) {
  const el = document.getElementById("homeSubView");
  el.innerHTML = html;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("headerBackBtn").classList.add("show");
}

function openChapterList(paperKey, filterFn) {
  const chapters = ORTHOPATH_DATA.paper1.chapters;
  homeSubView(`
    <div class="section-title">১ম পত্র — অধ্যায়সমূহ</div>
    <div class="ledger-list">
      ${chapters.map(c => `
        <button class="ledger-item" onclick="openChapterDetail('${c.id}')">
          <span class="item-num">${toBnNum(c.num)}</span>
          <span>${c.name}</span>
          <span class="item-arrow">›</span>
        </button>
      `).join("")}
    </div>
  `);
}

function openPaper2Menu() {
  homeSubView(`
    <div class="section-title">২য় পত্র</div>
    <div class="ledger-list mb-14">
      <button class="ledger-item" onclick="openPaper2Sub('banking')">
        <span class="item-num">🏦</span>
        <span>${ORTHOPATH_DATA.paper2.banking.title}</span>
        <span class="item-badge">৯ অধ্যায়</span>
        <span class="item-arrow">›</span>
      </button>
      <button class="ledger-item" onclick="openPaper2Sub('insurance')">
        <span class="item-num">🛡️</span>
        <span>${ORTHOPATH_DATA.paper2.insurance.title}</span>
        <span class="item-badge">৫ অধ্যায়</span>
        <span class="item-arrow">›</span>
      </button>
    </div>
  `);
}

function openPaper2Sub(subKey) {
  const data = ORTHOPATH_DATA.paper2[subKey];
  homeSubView(`
    <div class="section-title">${data.title}</div>
    <div class="ledger-list">
      ${data.chapters.map(c => `
        <button class="ledger-item" onclick="openChapterDetail('${c.id}')">
          <span class="item-num">${toBnNum(c.num)}</span>
          <span>${c.name}</span>
          <span class="item-arrow">›</span>
        </button>
      `).join("")}
    </div>
  `);
}

function findChapterById(id) {
  return getAllChaptersList().find(c => c.id === id);
}

function openChapterDetail(chapterId) {
  const ch = findChapterById(chapterId);
  if (!ch) return;
  const custom = Store.getCustomContent() || {};
  const notes = (custom[chapterId] && custom[chapterId].notes) || ch.notes || "";
  homeSubView(`
    <div class="section-title">${ch.name}</div>
    <div class="badge-row">
      <span class="pill">${ch.section}</span>
    </div>
    <div class="card">
      ${notes
        ? `<div style="white-space:pre-wrap; line-height:1.8; font-size:14.5px;">${escapeHtml(notes)}</div>`
        : `<div class="empty-state"><div class="e-icon">📝</div>এই অধ্যায়ের নোট এখনো যোগ করা হয়নি।<br><span class="small-muted">শিক্ষক এডমিন প্যানেল থেকে যোগ করবেন।</span></div>`
      }
    </div>
    <button class="btn btn-outline" onclick="goPracticeChapter('${chapterId}')">📚 এই অধ্যায়ের চর্চা করুন</button>
  `);
}

function openFormulas() {
  const customFormulas = Store.get("formulasData", null) || ORTHOPATH_DATA.formulas;
  homeSubView(`
    <div class="section-title">📐 অধ্যায়ভিত্তিক সূত্র</div>
    ${customFormulas.length === 0
      ? `<div class="empty-state"><div class="e-icon">📐</div>এখনো কোনো সূত্র যোগ করা হয়নি।</div>`
      : customFormulas.map(f => `
        <div class="card">
          <div class="section-title" style="font-size:15px; border:none; margin:0 0 8px;">${f.chapterName}</div>
          ${f.formulas.map(x => `<div class="mb-14"><b>${escapeHtml(x.name)}</b><br><span class="small-muted">${escapeHtml(x.formula)}</span></div>`).join("")}
        </div>
      `).join("")
    }
  `);
}

function openVideos() {
  const customVideos = Store.get("videosData", null) || ORTHOPATH_DATA.videos;
  homeSubView(`
    <div class="section-title">🎬 ভিডিও লেকচার</div>
    ${customVideos.length === 0
      ? `<div class="empty-state"><div class="e-icon">🎬</div>এখনো কোনো ভিডিও যোগ করা হয়নি।</div>`
      : customVideos.map(v => `
        <div class="video-card">
          <div class="video-thumb">
            <a href="${escapeAttr(v.youtubeUrl)}" target="_blank" rel="noopener" style="color:inherit;">▶️ ভিডিও দেখুন</a>
          </div>
          <div class="video-info">
            <div class="video-title">${escapeHtml(v.title)}</div>
          </div>
        </div>
      `).join("")
    }
  `);
}

// ============================================================
// PRACTICE (খ চর্চা)
// ============================================================
function renderPractice() {
  const container = document.getElementById("view-practice");
  container.innerHTML = `
    <div class="section-title">📚 চর্চা</div>
    <div class="ledger-list mb-14">
      <button class="ledger-item" onclick="practiceChapterPicker('paper1')">
        <span class="item-num">১</span>
        <span>১ম পত্র — অধ্যায়ভিত্তিক MCQ ও লিখিত</span>
        <span class="item-arrow">›</span>
      </button>
      <button class="ledger-item" onclick="practiceChapterPicker('paper2')">
        <span class="item-num">২</span>
        <span>২য় পত্র — ব্যাংকিং ও বিমা অনুশীলন</span>
        <span class="item-arrow">›</span>
      </button>
      <button class="ledger-item" onclick="openBoardQuestions()">
        <span class="item-num">৩</span>
        <span>বিগত বোর্ড প্রশ্ন</span>
        <span class="item-arrow">›</span>
      </button>
    </div>
    <div id="practiceSubView"></div>
  `;
}

function practiceSubView(html) {
  const el = document.getElementById("practiceSubView");
  el.innerHTML = html;
  el.scrollIntoView({ behavior: "smooth" });
}

function practiceChapterPicker(paperKey) {
  const all = getAllChaptersList().filter(c => c.paper === paperKey);
  practiceSubView(`
    <div class="section-title" style="font-size:16px;">অধ্যায় নির্বাচন করুন</div>
    <div class="ledger-list">
      ${all.map(c => `
        <button class="ledger-item" onclick="goPracticeChapter('${c.id}')">
          <span class="item-num">${toBnNum(c.num)}</span>
          <span>${c.name} <span class="small-muted">(${c.section})</span></span>
          <span class="item-arrow">›</span>
        </button>
      `).join("")}
    </div>
  `);
}

function goPracticeChapter(chapterId) {
  switchView("practice");
  const ch = findChapterById(chapterId);
  practiceSubView(`
    <div class="section-title" style="font-size:16px;">${ch.name}</div>
    <div class="ledger-list mb-14">
      <button class="ledger-item" onclick="startMcq('${chapterId}')">
        <span class="item-num">✓</span>
        <span>MCQ অনুশীলন</span>
        <span class="item-arrow">›</span>
      </button>
      <button class="ledger-item" onclick="openWritten('${chapterId}')">
        <span class="item-num">✍️</span>
        <span>লিখিত অনুশীলন</span>
        <span class="item-arrow">›</span>
      </button>
    </div>
  `);
}

function openWritten(chapterId) {
  const bank = Store.get("writtenBank", null) || ORTHOPATH_DATA.writtenBank;
  const items = bank.filter(w => w.chapterId === chapterId);
  practiceSubView(`
    <div class="section-title" style="font-size:16px;">লিখিত অনুশীলন</div>
    ${items.length === 0
      ? `<div class="empty-state"><div class="e-icon">✍️</div>এই অধ্যায়ের লিখিত প্রশ্ন এখনো যোগ করা হয়নি।</div>`
      : items.map((w, i) => `
        <div class="card">
          <div class="mcq-q-num">প্রশ্ন ${toBnNum(i + 1)}</div>
          <div class="mcq-question">${escapeHtml(w.question)}</div>
          <details><summary style="cursor:pointer; color:var(--ledger-green); font-weight:600; font-size:13.5px;">মডেল উত্তর দেখুন</summary>
          <div class="mt-8 small-muted" style="line-height:1.7;">${escapeHtml(w.modelAnswer || "শীঘ্রই যোগ করা হবে")}</div></details>
        </div>
      `).join("")
    }
  `);
}

function openBoardQuestions() {
  const bq = Store.get("boardQuestionsData", null) || ORTHOPATH_DATA.boardQuestions;
  practiceSubView(`
    <div class="section-title" style="font-size:16px;">বিগত বোর্ড প্রশ্ন</div>
    <div class="ledger-list mb-14">
      <button class="ledger-item" onclick="showBoardList('paper1')">
        <span class="item-num">১</span><span>১ম পত্র</span><span class="item-arrow">›</span>
      </button>
      <button class="ledger-item" onclick="showBoardList('paper2')">
        <span class="item-num">২</span><span>২য় পত্র</span><span class="item-arrow">›</span>
      </button>
    </div>
    <div id="boardListArea"></div>
  `);
}

function showBoardList(paperKey) {
  const bq = Store.get("boardQuestionsData", null) || ORTHOPATH_DATA.boardQuestions;
  const items = bq[paperKey] || [];
  document.getElementById("boardListArea").innerHTML = items.length === 0
    ? `<div class="empty-state"><div class="e-icon">📄</div>এখনো বোর্ড প্রশ্ন যোগ করা হয়নি।</div>`
    : items.map(q => `
      <div class="card">
        <div class="badge-row"><span class="pill">${escapeHtml(q.board || "")}</span><span class="pill pill-gold">${escapeHtml(q.year || "")}</span></div>
        <div class="mcq-question">${escapeHtml(q.question)}</div>
      </div>
    `).join("");
}

// ============================================================
// MCQ ENGINE
// ============================================================
function startMcq(chapterId) {
  const bank = Store.getMcqBank();
  const questions = bank.filter(q => q.chapterId === chapterId);
  if (questions.length === 0) {
    practiceSubView(`<div class="empty-state"><div class="e-icon">❓</div>এই অধ্যায়ের MCQ এখনো যোগ করা হয়নি।</div>`);
    return;
  }
  App.currentQuiz = {
    chapterId,
    questions,
    index: 0,
    answers: [],
    startedAt: Date.now()
  };
  renderMcqQuestion();
}

function renderMcqQuestion() {
  const quiz = App.currentQuiz;
  const q = quiz.questions[quiz.index];
  const total = quiz.questions.length;

  practiceSubView(`
    <div class="mcq-card">
      <div class="mcq-q-num">প্রশ্ন ${toBnNum(quiz.index + 1)} / ${toBnNum(total)}</div>
      <div class="mcq-question">${escapeHtml(q.question)}</div>
      <div class="mcq-options" id="mcqOptions">
        ${q.options.map((opt, i) => `
          <button class="mcq-option" data-idx="${i}" onclick="selectMcqOption(${i})">
            <span class="opt-letter">${["ক","খ","গ","ঘ"][i]}</span>
            <span>${escapeHtml(opt)}</span>
          </button>
        `).join("")}
      </div>
      <div id="mcqFeedback"></div>
      <button class="btn btn-primary mt-14" id="mcqNextBtn" style="display:none;" onclick="nextMcqQuestion()">
        ${quiz.index === total - 1 ? "ফলাফল দেখুন" : "পরবর্তী প্রশ্ন"}
      </button>
    </div>
  `);
}

function selectMcqOption(idx) {
  const quiz = App.currentQuiz;
  const q = quiz.questions[quiz.index];
  if (quiz.answers[quiz.index] !== undefined) return; // already answered

  quiz.answers[quiz.index] = idx;
  const options = document.querySelectorAll("#mcqOptions .mcq-option");
  options.forEach((el, i) => {
    el.disabled = true;
    if (i === q.correctIndex) el.classList.add("correct");
    else if (i === idx) el.classList.add("wrong");
  });

  const feedback = document.getElementById("mcqFeedback");
  if (idx === q.correctIndex) {
    feedback.innerHTML = `<div class="info-note mt-14">✅ সঠিক উত্তর! ${q.explanation ? escapeHtml(q.explanation) : ""}</div>`;
  } else {
    feedback.innerHTML = `<div class="info-note mt-14" style="background:#FBEAE7; border-color:var(--danger); color:var(--danger);">❌ সঠিক উত্তর: "${["ক","খ","গ","ঘ"][q.correctIndex]}" ${q.explanation ? "— " + escapeHtml(q.explanation) : ""}</div>`;
  }
  document.getElementById("mcqNextBtn").style.display = "flex";
}

function nextMcqQuestion() {
  const quiz = App.currentQuiz;
  if (quiz.index < quiz.questions.length - 1) {
    quiz.index++;
    renderMcqQuestion();
  } else {
    finishMcqQuiz();
  }
}

function finishMcqQuiz() {
  const quiz = App.currentQuiz;
  let correct = 0;
  quiz.questions.forEach((q, i) => {
    if (quiz.answers[i] === q.correctIndex) correct++;
  });
  const total = quiz.questions.length;
  const percent = Math.round((correct / total) * 100);
  const ch = findChapterById(quiz.chapterId);
  const student = Store.getStudent();

  const result = {
    id: "r_" + Date.now(),
    studentName: student ? student.name : "অতিথি",
    studentPhone: student ? student.phone : "",
    chapterId: quiz.chapterId,
    chapterName: ch ? ch.name : "",
    type: "mcq",
    correct, total, percent,
    takenAt: Date.now()
  };
  Store.saveResult(result);

  practiceSubView(`
    <div class="card text-center">
      <div style="font-size:40px;">🎯</div>
      <div class="section-title" style="border:none; justify-content:center;">ফলাফল</div>
      <div class="stat-grid" style="grid-template-columns: repeat(3,1fr);">
        <div class="stat-box"><div class="s-num">${toBnNum(correct)}</div><div class="s-label">সঠিক</div></div>
        <div class="stat-box"><div class="s-num">${toBnNum(total - correct)}</div><div class="s-label">ভুল</div></div>
        <div class="stat-box"><div class="s-num">${toBnNum(percent)}%</div><div class="s-label">স্কোর</div></div>
      </div>
      <button class="btn btn-primary mt-14" onclick="startMcq('${quiz.chapterId}')">আবার চেষ্টা করুন</button>
      <button class="btn btn-outline mt-8" onclick="switchView('evaluation'); renderResultHistory();">সব ফলাফল দেখুন</button>
    </div>
  `);
  App.currentQuiz = null;
}

// ============================================================
// EVALUATION (গ মূল্যায়ন)
// ============================================================
function renderEvaluation() {
  const container = document.getElementById("view-evaluation");
  container.innerHTML = `
    <div class="section-title">🏆 মূল্যায়ন</div>
    <div class="ledger-list mb-14">
      <button class="ledger-item" onclick="openModelTests()">
        <span class="item-num">১</span><span>মডেল টেস্ট</span><span class="item-arrow">›</span>
      </button>
      <button class="ledger-item" onclick="renderResultHistory()">
        <span class="item-num">২</span><span>ফলাফল ও পারফরম্যান্স ট্র্যাকিং</span><span class="item-arrow">›</span>
      </button>
      <button class="ledger-item" onclick="renderLeaderboard()">
        <span class="item-num">৩</span><span>লিডারবোর্ড</span><span class="item-arrow">›</span>
      </button>
    </div>
    <div id="evalSubView"></div>
  `;
}

function evalSubView(html) {
  const el = document.getElementById("evalSubView");
  el.innerHTML = html;
  el.scrollIntoView({ behavior: "smooth" });
}

function openModelTests() {
  const tests = Store.get("modelTestsData", null) || ORTHOPATH_DATA.modelTests;
  evalSubView(`
    <div class="section-title" style="font-size:16px;">মডেল টেস্ট</div>
    ${tests.length === 0
      ? `<div class="empty-state"><div class="e-icon">📝</div>এখনো মডেল টেস্ট যোগ করা হয়নি।</div>`
      : tests.map(t => `
        <div class="card flex-row" style="justify-content:space-between;">
          <div><b>${escapeHtml(t.title)}</b><br><span class="small-muted">${t.durationMin} মিনিট • ${t.questions.length} প্রশ্ন</span></div>
          <button class="btn btn-gold" style="width:auto; padding:8px 16px;" onclick="startModelTest('${t.id}')">শুরু করুন</button>
        </div>
      `).join("")
    }
  `);
}

function startModelTest(testId) {
  const tests = Store.get("modelTestsData", null) || ORTHOPATH_DATA.modelTests;
  const test = tests.find(t => t.id === testId);
  const bank = Store.getMcqBank();
  const questions = test.questions.map(qid => bank.find(q => q.id === qid)).filter(Boolean);
  if (questions.length === 0) return showToast("এই টেস্টে প্রশ্ন পাওয়া যায়নি");

  App.currentQuiz = { chapterId: "model_" + testId, questions, index: 0, answers: [], startedAt: Date.now(), isModelTest: true, testTitle: test.title };
  switchView("evaluation");
  renderModelTestQuestion();
}

function renderModelTestQuestion() {
  const quiz = App.currentQuiz;
  const q = quiz.questions[quiz.index];
  const total = quiz.questions.length;
  evalSubView(`
    <div class="mcq-card">
      <div class="mcq-q-num">${escapeHtml(quiz.testTitle)} — প্রশ্ন ${toBnNum(quiz.index + 1)} / ${toBnNum(total)}</div>
      <div class="mcq-question">${escapeHtml(q.question)}</div>
      <div class="mcq-options" id="mcqOptions">
        ${q.options.map((opt, i) => `
          <button class="mcq-option" data-idx="${i}" onclick="selectModelTestOption(${i})">
            <span class="opt-letter">${["ক","খ","গ","ঘ"][i]}</span><span>${escapeHtml(opt)}</span>
          </button>
        `).join("")}
      </div>
      <button class="btn btn-primary mt-14" id="mcqNextBtn" style="display:none;" onclick="nextModelTestQuestion()">
        ${quiz.index === total - 1 ? "ফলাফল জমা দিন" : "পরবর্তী প্রশ্ন"}
      </button>
    </div>
  `);
}

function selectModelTestOption(idx) {
  const quiz = App.currentQuiz;
  if (quiz.answers[quiz.index] !== undefined) return;
  quiz.answers[quiz.index] = idx;
  document.querySelectorAll("#mcqOptions .mcq-option").forEach((el, i) => {
    el.disabled = true;
    if (i === idx) el.classList.add("selected");
  });
  document.getElementById("mcqNextBtn").style.display = "flex";
}

function nextModelTestQuestion() {
  const quiz = App.currentQuiz;
  if (quiz.index < quiz.questions.length - 1) {
    quiz.index++;
    renderModelTestQuestion();
  } else {
    finishModelTest();
  }
}

function finishModelTest() {
  const quiz = App.currentQuiz;
  let correct = 0;
  quiz.questions.forEach((q, i) => { if (quiz.answers[i] === q.correctIndex) correct++; });
  const total = quiz.questions.length;
  const percent = Math.round((correct / total) * 100);
  const student = Store.getStudent();

  Store.saveResult({
    id: "r_" + Date.now(),
    studentName: student ? student.name : "অতিথি",
    studentPhone: student ? student.phone : "",
    chapterId: quiz.chapterId,
    chapterName: quiz.testTitle,
    type: "model_test",
    correct, total, percent,
    takenAt: Date.now()
  });

  evalSubView(`
    <div class="card text-center">
      <div style="font-size:40px;">🏅</div>
      <div class="section-title" style="border:none; justify-content:center;">${escapeHtml(quiz.testTitle)} — ফলাফল</div>
      <div class="stat-grid" style="grid-template-columns: repeat(3,1fr);">
        <div class="stat-box"><div class="s-num">${toBnNum(correct)}</div><div class="s-label">সঠিক</div></div>
        <div class="stat-box"><div class="s-num">${toBnNum(total-correct)}</div><div class="s-label">ভুল</div></div>
        <div class="stat-box"><div class="s-num">${toBnNum(percent)}%</div><div class="s-label">স্কোর</div></div>
      </div>
    </div>
  `);
  App.currentQuiz = null;
}

function renderResultHistory() {
  const student = Store.getStudent();
  const results = Store.getResults().filter(r => !student || r.studentPhone === student.phone).slice().reverse();

  if (results.length === 0) {
    evalSubView(`<div class="empty-state"><div class="e-icon">📊</div>এখনো কোনো পরীক্ষা দেওয়া হয়নি।</div>`);
    return;
  }

  const avg = Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length);
  evalSubView(`
    <div class="stat-grid">
      <div class="stat-box"><div class="s-num">${toBnNum(results.length)}</div><div class="s-label">মোট পরীক্ষা</div></div>
      <div class="stat-box"><div class="s-num">${toBnNum(avg)}%</div><div class="s-label">গড় স্কোর</div></div>
      <div class="stat-box"><div class="s-num">${toBnNum(Math.max(...results.map(r=>r.percent)))}%</div><div class="s-label">সর্বোচ্চ</div></div>
    </div>
    <div class="ledger-list">
      ${results.map(r => `
        <div class="ledger-item" style="cursor:default;">
          <span class="item-num">${r.percent}%</span>
          <span>${escapeHtml(r.chapterName)}<br><span class="small-muted">${new Date(r.takenAt).toLocaleDateString('bn-BD')}</span></span>
          <span class="item-badge">${toBnNum(r.correct)}/${toBnNum(r.total)}</span>
        </div>
      `).join("")}
    </div>
  `);
}

function renderLeaderboard() {
  const results = Store.getResults();
  const student = Store.getStudent();
  const byStudent = {};
  results.forEach(r => {
    const key = r.studentPhone || r.studentName;
    if (!byStudent[key]) byStudent[key] = { name: r.studentName, total: 0, count: 0 };
    byStudent[key].total += r.percent;
    byStudent[key].count += 1;
  });
  const ranked = Object.values(byStudent)
    .map(s => ({ name: s.name, avg: Math.round(s.total / s.count) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 20);

  evalSubView(`
    <div class="info-note">এই লিডারবোর্ড শুধুমাত্র এই ফোনে দেওয়া পরীক্ষার ফলাফলের উপর ভিত্তি করে তৈরি (অফলাইন মোড)।</div>
    ${ranked.length === 0
      ? `<div class="empty-state"><div class="e-icon">🏆</div>এখনো কোনো ফলাফল নেই।</div>`
      : `<div class="ledger-list">
          ${ranked.map((s, i) => `
            <div class="leader-row ${i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':''}">
              <div class="leader-rank">${toBnNum(i+1)}</div>
              <div class="leader-name">${escapeHtml(s.name)}${student && student.name===s.name ? " (তুমি)" : ""}</div>
              <div class="leader-score">${toBnNum(s.avg)}%</div>
            </div>
          `).join("")}
        </div>`
    }
  `);
}

// ============================================================
// CONTACT (ঘ যোগাযোগ)
// ============================================================
function renderContact() {
  const container = document.getElementById("view-contact");
  const info = Store.get("contactInfoData", null) || ORTHOPATH_DATA.contactInfo;
  const posts = Store.getForumPosts();

  container.innerHTML = `
    <div class="section-title">💬 যোগাযোগ</div>

    <div class="card">
      <b>প্রশ্নোত্তর ফোরাম</b>
      <div class="field mt-14">
        <textarea id="forumInput" placeholder="তোমার প্রশ্ন লেখো..."></textarea>
      </div>
      <button class="btn btn-primary" onclick="postForumQuestion()">প্রশ্ন পোস্ট করুন</button>
    </div>

    <div id="forumList" class="mb-14">
      ${posts.length === 0
        ? `<div class="empty-state"><div class="e-icon">💬</div>এখনো কোনো প্রশ্ন পোস্ট করা হয়নি।</div>`
        : posts.map(p => `
          <div class="card">
            <b>${escapeHtml(p.studentName)}</b>
            <div class="mt-8">${escapeHtml(p.question)}</div>
            <div class="small-muted mt-8">${new Date(p.postedAt).toLocaleDateString('bn-BD')}</div>
          </div>
        `).join("")
      }
    </div>

    <div class="section-title" style="font-size:16px;">নোটিস / আপডেট</div>
    <div class="ledger-list mb-14">
      ${Store.getNotices().map(n => `
        <div class="ledger-item" style="cursor:default;">
          <span class="item-num">📢</span>
          <span><b>${escapeHtml(n.title)}</b><br><span class="small-muted">${escapeHtml(n.body)}</span></span>
        </div>
      `).join("")}
    </div>

    <div class="feature-grid">
      ${info.facebookUrl ? `
      <a class="feature-card" href="${escapeAttr(info.facebookUrl)}" target="_blank" rel="noopener">
        <div class="f-icon">📘</div><div class="f-label">ফেসবুক পেজ</div>
      </a>` : ""}
      ${info.whatsappNumber ? `
      <a class="feature-card" href="https://wa.me/${escapeAttr(info.whatsappNumber.replace(/[^0-9]/g,''))}" target="_blank" rel="noopener">
        <div class="f-icon">📱</div><div class="f-label">হোয়াটসঅ্যাপ</div>
      </a>` : ""}
    </div>
  `;
}

function postForumQuestion() {
  const text = document.getElementById("forumInput").value.trim();
  if (!text) return showToast("প্রশ্ন লিখুন");
  const student = Store.getStudent();
  Store.saveForumPost({
    id: "f_" + Date.now(),
    studentName: student ? student.name : "অতিথি",
    question: text,
    postedAt: Date.now()
  });
  document.getElementById("forumInput").value = "";
  renderContact();
  showToast("প্রশ্ন পোস্ট হয়েছে");
}

// ============================================================
// ABOUT (ছ নিজ সম্পর্কে)
// ============================================================
function renderAbout() {
  const container = document.getElementById("view-about");
  const a = ORTHOPATH_DATA.aboutAuthor;
  container.innerHTML = `
    <div class="section-title">✍️ নিজ সম্পর্কে</div>
    <div class="card">
      <div class="flex-row">
        <div class="credit-avatar" style="background:var(--ledger-green); color:var(--paper);">${a.name.charAt(0)}</div>
        <div>
          <div style="font-weight:700; font-size:16px;">${escapeHtml(a.name)}</div>
          <div class="small-muted">${escapeHtml(a.designation)}</div>
        </div>
      </div>
      <div class="mt-14" style="line-height:1.8; font-size:14px;">
        <b>প্রতিষ্ঠান:</b> ${escapeHtml(a.institution)}<br>
        ${a.education ? `<b>শিক্ষাগত যোগ্যতা:</b> ${escapeHtml(a.education)}<br>` : ""}
      </div>
      <div class="mt-14" style="line-height:1.8; font-size:14px; color:var(--ink-soft);">${escapeHtml(a.bio)}</div>
    </div>

    <div class="credit-card">
      <div class="credit-row">
        <div class="credit-avatar">${a.name.charAt(0)}</div>
        <div>
          <div class="credit-name">${escapeHtml(a.name)}</div>
          <div class="credit-role">${escapeHtml(a.designation)}</div>
          <div class="credit-inst">${escapeHtml(a.institution)}</div>
        </div>
      </div>
      <div class="mt-14 small-muted" style="color:rgba(250,246,237,0.8);">
        © ২০২৬ অর্থপাঠ — সর্বস্বত্ব সংরক্ষিত। এই অ্যাপের সকল কনটেন্ট এর নির্মাতার অনুমতি ছাড়া পুনঃপ্রকাশ নিষিদ্ধ।
      </div>
    </div>
  `;
}

// ============================================================
// UTILITIES
// ============================================================
function toBnNum(n) {
  const map = { "0":"০","1":"১","2":"২","3":"৩","4":"৪","5":"৫","6":"৬","7":"৭","8":"৮","9":"৯" };
  return String(n).split("").map(ch => map[ch] !== undefined ? map[ch] : ch).join("");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function escapeAttr(str) { return escapeHtml(str); }

function showToast(msg) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ==========================================================================
   অর্থপাঠ — Admin Panel Logic
   ========================================================================== */

function bindAdmin() {
  document.querySelectorAll(".admin-nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.aview;
      switchAdminView(view);
    });
  });
}

function switchAdminView(view) {
  document.querySelectorAll(".admin-view").forEach(v => v.classList.remove("active"));
  document.getElementById("aview-" + view).classList.add("active");
  document.querySelectorAll(".admin-nav-item").forEach(b => b.classList.toggle("active", b.dataset.aview === view));
  if (view === "content") renderAdminContent();
  if (view === "quiz") renderAdminQuiz();
  if (view === "students") renderAdminStudents();
}

function renderAdminDashboard() {
  switchAdminView("content");
}

// ============================================================
// ১. কনটেন্ট আপলোড
// ============================================================
function renderAdminContent() {
  const container = document.getElementById("aview-content");
  const chapters = getAllChaptersList();

  container.innerHTML = `
    <div class="section-title">📤 কনটেন্ট আপলোড</div>
    <div class="field">
      <label>অধ্যায় নির্বাচন করুন</label>
      <select id="contentChapterSelect" onchange="loadChapterContentForm()">
        <option value="">-- নির্বাচন করুন --</option>
        ${chapters.map(c => `<option value="${c.id}">${c.section} — ${c.name}</option>`).join("")}
      </select>
    </div>
    <div id="chapterContentForm"></div>

    <div class="section-title mt-14" style="font-size:16px;">অধ্যায়ের নাম সম্পাদনা</div>
    <div class="card">
      <div class="small-muted mb-14">নিচে প্রতিটি অধ্যায়ের প্লেসহোল্ডার নাম পরিবর্তন করে আসল নাম বসান।</div>
      <div class="ledger-list">
        ${chapters.map(c => `
          <div class="ledger-item" style="cursor:default;">
            <span class="item-num">${toBnNum(c.num)}</span>
            <input type="text" value="${escapeAttr(c.name)}" style="border:1px solid var(--line); border-radius:6px; padding:6px 8px; flex:1;" onchange="renameChapter('${c.id}', this.value)">
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renameChapter(chapterId, newName) {
  const overrides = Store.get("chapterNameOverrides", {});
  overrides[chapterId] = newName;
  Store.set("chapterNameOverrides", overrides);
  applyChapterNameOverrides();
  showToast("অধ্যায়ের নাম আপডেট হয়েছে");
}

function applyChapterNameOverrides() {
  const overrides = Store.get("chapterNameOverrides", {});
  [...ORTHOPATH_DATA.paper1.chapters, ...ORTHOPATH_DATA.paper2.banking.chapters, ...ORTHOPATH_DATA.paper2.insurance.chapters]
    .forEach(c => { if (overrides[c.id]) c.name = overrides[c.id]; });
}

function loadChapterContentForm() {
  const chapterId = document.getElementById("contentChapterSelect").value;
  const formArea = document.getElementById("chapterContentForm");
  if (!chapterId) { formArea.innerHTML = ""; return; }

  const custom = Store.getCustomContent() || {};
  const existing = custom[chapterId] || {};

  formArea.innerHTML = `
    <div class="card mt-14">
      <div class="field">
        <label>অধ্যায়ের নোট / বিষয়বস্তু (লেখা)</label>
        <textarea id="chapterNotesInput" rows="6" placeholder="এখানে অধ্যায়ের পাঠ লিখুন...">${escapeHtml(existing.notes || "")}</textarea>
      </div>
      <div class="field">
        <label>ইউটিউব ভিডিও লিংক (ঐচ্ছিক)</label>
        <input type="text" id="chapterVideoInput" placeholder="https://youtube.com/..." value="${escapeAttr(existing.videoUrl || "")}">
      </div>
      <button class="btn btn-primary" onclick="saveChapterContent('${chapterId}')">সংরক্ষণ করুন</button>
    </div>
  `;
}

function saveChapterContent(chapterId) {
  const notes = document.getElementById("chapterNotesInput").value.trim();
  const videoUrl = document.getElementById("chapterVideoInput").value.trim();
  const custom = Store.getCustomContent() || {};
  custom[chapterId] = { notes, videoUrl };
  Store.saveCustomContent(custom);

  if (videoUrl) {
    const videos = Store.get("videosData", null) || [...ORTHOPATH_DATA.videos];
    const ch = findChapterById(chapterId);
    const existingIdx = videos.findIndex(v => v.chapterId === chapterId);
    const videoEntry = { chapterId, title: ch.name, youtubeUrl: videoUrl };
    if (existingIdx >= 0) videos[existingIdx] = videoEntry;
    else videos.push(videoEntry);
    Store.set("videosData", videos);
  }

  showToast("কনটেন্ট সংরক্ষিত হয়েছে");
}

// ============================================================
// ২. কুইজ তৈরি (MCQ)
// ============================================================
function renderAdminQuiz() {
  const container = document.getElementById("aview-quiz");
  const chapters = getAllChaptersList();
  const bank = Store.getMcqBank();

  container.innerHTML = `
    <div class="section-title">📝 কুইজ তৈরি (MCQ)</div>
    <div class="card">
      <div class="field">
        <label>অধ্যায়</label>
        <select id="quizChapterSelect">
          <option value="">-- নির্বাচন করুন --</option>
          ${chapters.map(c => `<option value="${c.id}">${c.section} — ${c.name}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>প্রশ্ন</label>
        <textarea id="quizQuestionInput" rows="2" placeholder="প্রশ্ন লিখুন"></textarea>
      </div>
      <div class="field"><label>বিকল্প ক</label><input type="text" id="opt0"></div>
      <div class="field"><label>বিকল্প খ</label><input type="text" id="opt1"></div>
      <div class="field"><label>বিকল্প গ</label><input type="text" id="opt2"></div>
      <div class="field"><label>বিকল্প ঘ</label><input type="text" id="opt3"></div>
      <div class="field">
        <label>সঠিক উত্তর</label>
        <select id="correctOptSelect">
          <option value="0">ক</option><option value="1">খ</option><option value="2">গ</option><option value="3">ঘ</option>
        </select>
      </div>
      <div class="field">
        <label>ব্যাখ্যা (ঐচ্ছিক)</label>
        <textarea id="quizExplainInput" rows="2" placeholder="সঠিক উত্তরের ব্যাখ্যা"></textarea>
      </div>
      <button class="btn btn-primary" onclick="addMcqQuestion()">প্রশ্ন যোগ করুন</button>
    </div>

    <div class="section-title" style="font-size:16px;">বিদ্যমান প্রশ্ন (${toBnNum(bank.length)})</div>
    <div id="mcqBankList"></div>
  `;
  renderMcqBankList();
}

function renderMcqBankList() {
  const bank = Store.getMcqBank();
  const listEl = document.getElementById("mcqBankList");
  if (bank.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><div class="e-icon">❓</div>এখনো কোনো প্রশ্ন যোগ করা হয়নি।</div>`;
    return;
  }
  listEl.innerHTML = bank.slice().reverse().map(q => {
    const ch = findChapterById(q.chapterId);
    return `
    <div class="card">
      <div class="badge-row"><span class="pill">${ch ? ch.name : q.chapterId}</span></div>
      <div class="mcq-question">${escapeHtml(q.question)}</div>
      <div class="small-muted">সঠিক: ${["ক","খ","গ","ঘ"][q.correctIndex]} — ${escapeHtml(q.options[q.correctIndex])}</div>
      <button class="btn btn-danger mt-8" style="width:auto; padding:6px 14px; font-size:12.5px;" onclick="deleteMcqQuestion('${q.id}')">মুছে ফেলুন</button>
    </div>
  `;
  }).join("");
}

function addMcqQuestion() {
  const chapterId = document.getElementById("quizChapterSelect").value;
  const question = document.getElementById("quizQuestionInput").value.trim();
  const options = [0,1,2,3].map(i => document.getElementById("opt"+i).value.trim());
  const correctIndex = parseInt(document.getElementById("correctOptSelect").value, 10);
  const explanation = document.getElementById("quizExplainInput").value.trim();

  if (!chapterId) return showToast("অধ্যায় নির্বাচন করুন");
  if (!question) return showToast("প্রশ্ন লিখুন");
  if (options.some(o => !o)) return showToast("সবগুলো বিকল্প পূরণ করুন");

  const ch = findChapterById(chapterId);
  const bank = Store.getMcqBank();
  bank.push({
    id: "q_" + Date.now(),
    chapterId,
    paper: ch.paper,
    question, options, correctIndex, explanation
  });
  Store.saveMcqBank(bank);

  document.getElementById("quizQuestionInput").value = "";
  [0,1,2,3].forEach(i => document.getElementById("opt"+i).value = "");
  document.getElementById("quizExplainInput").value = "";

  renderMcqBankList();
  showToast("প্রশ্ন যোগ হয়েছে");
}

function deleteMcqQuestion(qId) {
  const bank = Store.getMcqBank().filter(q => q.id !== qId);
  Store.saveMcqBank(bank);
  renderMcqBankList();
  showToast("প্রশ্ন মুছে ফেলা হয়েছে");
}

// ============================================================
// ৩. স্টুডেন্ট পারফরম্যান্স
// ============================================================
function renderAdminStudents() {
  const container = document.getElementById("aview-students");
  const students = Store.getAllStudents();
  const results = Store.getResults();

  container.innerHTML = `
    <div class="section-title">👥 স্টুডেন্ট পারফরম্যান্স</div>
    <div class="info-note">এই তালিকায় শুধু এই ফোনে লগইন করা শিক্ষার্থীদের তথ্য দেখা যাচ্ছে (অফলাইন মোড)।</div>
    <div class="stat-grid">
      <div class="stat-box"><div class="s-num">${toBnNum(students.length)}</div><div class="s-label">মোট শিক্ষার্থী</div></div>
      <div class="stat-box"><div class="s-num">${toBnNum(results.length)}</div><div class="s-label">মোট পরীক্ষা</div></div>
      <div class="stat-box"><div class="s-num">${results.length ? Math.round(results.reduce((s,r)=>s+r.percent,0)/results.length) : 0}%</div><div class="s-label">গড় স্কোর</div></div>
    </div>

    <div class="ledger-list">
      ${students.length === 0
        ? `<div class="empty-state"><div class="e-icon">👥</div>এখনো কোনো শিক্ষার্থী লগইন করেনি।</div>`
        : students.map(s => {
          const sResults = results.filter(r => r.studentPhone === s.phone);
          const avg = sResults.length ? Math.round(sResults.reduce((sum,r)=>sum+r.percent,0)/sResults.length) : 0;
          return `
          <div class="ledger-item" style="cursor:default;">
            <span class="item-num">${s.name.charAt(0)}</span>
            <span>${escapeHtml(s.name)}<br><span class="small-muted">${escapeHtml(s.phone)} • ${toBnNum(sResults.length)} পরীক্ষা</span></span>
            <span class="item-badge">${toBnNum(avg)}%</span>
          </div>
        `;
        }).join("")
      }
    </div>
  `;
}

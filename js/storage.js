/* ==========================================================================
   অর্থপাঠ — Storage Layer
   এখন: সব ডেটা localStorage এ (অফলাইন ফার্স্ট)
   ভবিষ্যতে: Firestore যোগ হলে শুধু syncNow() ফাংশন বাস্তবায়ন করলেই
   সব existing local ডেটা ক্লাউডে upload হয়ে যাবে (syncQueue প্যাটার্ন)
   ========================================================================== */

const DB_PREFIX = "orthopath_";

const Store = {
  // ---- Basic get/set wrappers ----
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(DB_PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Store.get error", key, e);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
      Store._queueSync(key, value);
      return true;
    } catch (e) {
      console.error("Store.set error", key, e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(DB_PREFIX + key);
  },

  // ---- Sync queue: prepares this app for later Firestore integration ----
  // যখন Firestore যোগ হবে, তখন এই queue থেকে ডেটা আপলোড হবে এবং
  // isOnline() true হলে syncNow() call করলেই কাজ হয়ে যাবে।
  _queueSync(key, value) {
    if (key === "syncQueue") return; // avoid recursion
    const queue = Store.get("syncQueue", []);
    queue.push({ key, value, ts: Date.now(), synced: false });
    // Keep queue bounded
    const trimmed = queue.slice(-500);
    try {
      localStorage.setItem(DB_PREFIX + "syncQueue", JSON.stringify(trimmed));
    } catch (e) { /* ignore quota errors on queue */ }
  },

  isOnline() {
    return navigator.onLine;
  },

  // Placeholder — will POST queued items to Firestore once configured.
  async syncNow() {
    if (!Store.isOnline()) return { synced: false, reason: "offline" };
    // TODO: Firestore integration point.
    // const queue = Store.get("syncQueue", []);
    // for (const item of queue) { await firebaseSet(item.key, item.value); }
    return { synced: false, reason: "sync-not-configured-yet" };
  },

  // ---- Domain-specific helpers ----
  getStudent() {
    return Store.get("currentStudent", null);
  },
  setStudent(student) {
    Store.set("currentStudent", student);
  },
  logoutStudent() {
    Store.remove("currentStudent");
  },

  getAllStudents() {
    return Store.get("studentsList", []);
  },
  saveStudentRecord(student) {
    const list = Store.getAllStudents();
    const idx = list.findIndex(s => s.phone === student.phone);
    if (idx >= 0) list[idx] = { ...list[idx], ...student };
    else list.push(student);
    Store.set("studentsList", list);
  },

  isAdminLoggedIn() {
    return Store.get("adminSession", false) === true;
  },
  setAdminLoggedIn(val) {
    Store.set("adminSession", val);
  },

  getResults() {
    return Store.get("testResults", []);
  },
  saveResult(result) {
    const results = Store.getResults();
    results.push(result);
    Store.set("testResults", results);
  },

  getCustomContent() {
    return Store.get("customContent", null);
  },
  saveCustomContent(data) {
    Store.set("customContent", data);
  },

  getMcqBank() {
    return Store.get("mcqBank", null) || ORTHOPATH_DATA.mcqBank;
  },
  saveMcqBank(bank) {
    Store.set("mcqBank", bank);
  },

  getNotices() {
    return Store.get("notices", null) || ORTHOPATH_DATA.notices;
  },
  saveNotices(notices) {
    Store.set("notices", notices);
  },

  getForumPosts() {
    return Store.get("forumPosts", []);
  },
  saveForumPost(post) {
    const posts = Store.getForumPosts();
    posts.unshift(post);
    Store.set("forumPosts", posts);
  }
};

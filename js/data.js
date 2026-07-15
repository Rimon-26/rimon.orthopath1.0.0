/* ==========================================================================
   অর্থপাঠ — কনটেন্ট ডেটা (Chapters, MCQ placeholders, Board questions)
   এডমিন প্যানেল থেকে এই ডেটা আপডেট করা যাবে (localStorage এ ওভাররাইড হবে)
   ========================================================================== */

const ORTHOPATH_DATA = {

  // ---------------- প্রথম পত্র: ফিন্যান্স, ব্যাংকিং ও বিমা (৯ অধ্যায়) ----------------
  paper1: {
    title: "ফিন্যান্স, ব্যাংকিং ও বিমা (১ম পত্র)",
    chapters: [
      { id: "p1c1", num: 1, name: "অধ্যায় ১", notes: "", pdfUrl: "", videoUrl: "" },
      { id: "p1c2", num: 2, name: "অধ্যায় ২", notes: "", pdfUrl: "", videoUrl: "" },
      { id: "p1c3", num: 3, name: "অধ্যায় ৩", notes: "", pdfUrl: "", videoUrl: "" },
      { id: "p1c4", num: 4, name: "অধ্যায় ৪", notes: "", pdfUrl: "", videoUrl: "" },
      { id: "p1c5", num: 5, name: "অধ্যায় ৫", notes: "", pdfUrl: "", videoUrl: "" },
      { id: "p1c6", num: 6, name: "অধ্যায় ৬", notes: "", pdfUrl: "", videoUrl: "" },
      { id: "p1c7", num: 7, name: "অধ্যায় ৭", notes: "", pdfUrl: "", videoUrl: "" },
      { id: "p1c8", num: 8, name: "অধ্যায় ৮", notes: "", pdfUrl: "", videoUrl: "" },
      { id: "p1c9", num: 9, name: "অধ্যায় ৯", notes: "", pdfUrl: "", videoUrl: "" }
    ]
  },

  // ---------------- দ্বিতীয় পত্র: ব্যাংকিং + বিমা ----------------
  paper2: {
    title: "ফিন্যান্স, ব্যাংকিং ও বিমা (২য় পত্র)",
    banking: {
      title: "ব্যাংকিং অংশ",
      chapters: [
        { id: "p2b1", num: 1, name: "অধ্যায় ১", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2b2", num: 2, name: "অধ্যায় ২", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2b3", num: 3, name: "অধ্যায় ৩", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2b4", num: 4, name: "অধ্যায় ৪", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2b5", num: 5, name: "অধ্যায় ৫", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2b6", num: 6, name: "অধ্যায় ৬", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2b7", num: 7, name: "অধ্যায় ৭", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2b8", num: 8, name: "অধ্যায় ৮", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2b9", num: 9, name: "অধ্যায় ৯", notes: "", pdfUrl: "", videoUrl: "" }
      ]
    },
    insurance: {
      title: "বিমা অংশ",
      chapters: [
        { id: "p2i10", num: 10, name: "অধ্যায় ১০", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2i11", num: 11, name: "অধ্যায় ১১", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2i12", num: 12, name: "অধ্যায় ১২", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2i13", num: 13, name: "অধ্যায় ১৩", notes: "", pdfUrl: "", videoUrl: "" },
        { id: "p2i14", num: 14, name: "অধ্যায় ১৪", notes: "", pdfUrl: "", videoUrl: "" }
      ]
    }
  },

  // ---------------- অধ্যায় ভিত্তিক সূত্র ----------------
  formulas: [
    // { chapterId: "p1c1", chapterName: "অধ্যায় ১", formulas: [{name:"", formula:"", note:""}] }
  ],

  // ---------------- ভিডিও লেকচার ----------------
  videos: [
    // { chapterId: "p1c1", title: "", youtubeUrl: "" }
  ],

  // ---------------- MCQ ব্যাংক ----------------
  // প্রতিটা প্রশ্ন: { id, chapterId, paper, question, options:[4], correctIndex, explanation }
  mcqBank: [],

  // ---------------- লিখিত (Written) প্রশ্ন ব্যাংক ----------------
  writtenBank: [
    // { id, chapterId, paper, question, modelAnswer }
  ],

  // ---------------- বিগত বোর্ড প্রশ্ন ----------------
  boardQuestions: {
    paper1: [], // { id, year, board, question, type: 'mcq'|'written', ... }
    paper2: []
  },

  // ---------------- মডেল টেস্ট ----------------
  modelTests: [
    // { id, title, paper, durationMin, questions: [mcqId,...] }
  ],

  // ---------------- নোটিস / আপডেট ----------------
  notices: [
    { id: "n1", date: "", title: "স্বাগতম", body: "অর্থপাঠ এ তোমাদের স্বাগতম। এখানে নিয়মিত নোটিশ ও আপডেট দেওয়া হবে।" }
  ],

  // ---------------- যোগাযোগ তথ্য ----------------
  contactInfo: {
    facebookUrl: "",
    whatsappNumber: "",
    forumEnabled: true
  },

  // ---------------- লেখক পরিচিতি ----------------
  aboutAuthor: {
    name: "মাহফুজুর রহমান রিমন",
    designation: "প্রভাষক, ফিন্যান্স, ব্যাংকিং ও বিমা",
    institution: "মাদাইয়া মুক্তিযোদ্ধা স্মৃতি কলেজ, চান্দিনা, কুমিল্লা",
    education: "",
    bio: "একাদশ ও দ্বাদশ শ্রেণীর শিক্ষার্থীদের ফিন্যান্স, ব্যাংকিং ও বিমা বিষয়ে সহজ ও কার্যকরভাবে শেখানোর লক্ষ্যে অর্থপাঠ অ্যাপটি তৈরি করা হয়েছে।"
  }
};

// ---------------- MCQ ফরম ফরম্যাট হেল্পার ----------------
function getAllChaptersList() {
  const list = [];
  ORTHOPATH_DATA.paper1.chapters.forEach(c => list.push({ ...c, paper: "paper1", section: "১ম পত্র" }));
  ORTHOPATH_DATA.paper2.banking.chapters.forEach(c => list.push({ ...c, paper: "paper2", section: "২য় পত্র - ব্যাংকিং" }));
  ORTHOPATH_DATA.paper2.insurance.chapters.forEach(c => list.push({ ...c, paper: "paper2", section: "২য় পত্র - বিমা" }));
  return list;
}

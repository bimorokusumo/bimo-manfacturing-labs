/**
 * =============================================================================
 * BIMO MANUFACTURING LABS - GOOGLE APPS SCRIPT MASTER GRADEBOOK
 * =============================================================================
 * Skrip Google Apps Script untuk Google Spreadsheet Rekap Nilai Siswa.
 * Sesuai dengan Struktur Sidebar Website BIMO Manufacturing Labs:
 * 
 * 1. Tab Baris Bawah Spreadsheet (Sheet Tabs) diklasifikasikan per Modul Lab:
 *    - 🛡️ 1. Safety Lab
 *    - ⚙️ 2. Machine Lab
 *    - 🔪 3. Alat Pemotong
 *    - 🌡️ 4. Heat Treatment
 *    - 🔧 5. Mekanika Teknik
 *    - ⚡ 6. Welding Lab
 *    - 📏 7. Alat Ukur Presisi
 *    - 📐 8. Design Lab
 *    - 🏭 9. Virtual Bengkel
 *    - 🎓 10. Evaluasi Akhir
 *    - 📊 Rekap Seluruh Lab (Master Summary)
 *    - 📥 Data Masuk (Raw Data)
 * 
 * 2. Di dalam setiap tab Modul Lab, disediakan 2 BAGIAN UTAMA:
 *    - BAGIAN 1: REKAP TUGAS LAB (DAFTAR PER ROW / BARIS)
 *      Setiap baris adalah 1 tugas/kuis, menampilkan total siswa mengumpulkan,
 *      rata-rata nilai, daftar nama yang sudah selesai (dan skornya),
 *      serta daftar nama yang belum mengumpulkan.
 *    - BAGIAN 2: MATRIKS CEKLIS NILAI SISWA (Tabel Siswa x Tugas)
 *      Memperlihatkan ceklis status kelulusan tiap siswa (Hijau = LULUS, Abu-abu = Belum).
 * =============================================================================
 */

// DEFINISI MODUL LAB & TUGAS-TUGASNYA SESUAI SIDEBAR
var LAB_CONFIGS = [
  {
    id: "safety",
    tabName: "🛡️ 1. Safety Lab",
    shortTitle: "Safety Lab (K3LH)",
    tasks: [
      { key: "apd", name: "🛡️ Inspeksi APD Operator", category: "Kuis Praktik K3", keywords: ["inspeksi apd", "apd"] },
      { key: "jsa_bor", name: "📋 JSA Pengeboran Pelat Baja", category: "Asesmen JSA", keywords: ["pengeboran", "pelat", "bor meja"] },
      { key: "jsa_pahat", name: "📋 JSA Pengasahan Pahat Bubut", category: "Asesmen JSA", keywords: ["pengasahan", "pahat", "gerinda"] },
      { key: "apar", name: "🧯 Simulasi APAR P-A-S-S", category: "Tanggap Darurat", keywords: ["apar", "pass", "kebakaran"] },
      { key: "5r", name: "✨ Budaya Kerja 5R & Etika DUDI", category: "Etika Industri", keywords: ["5r", "budaya"] },
      { key: "perkakas", name: "🔧 SOP Perkakas Tangan & Ragum", category: "SOP Praktik", keywords: ["perkakas", "ragum"] },
      { key: "qc", name: "🔍 Audit QC Benda Uji DUDI", category: "Pengukuran & QC", keywords: ["qc", "benda uji", "tarik"] },
      { key: "diag_safety", name: "📝 Tes Diagnostik Safety K3", category: "Tes Diagnostik", keywords: ["diagnostik safety", "diagnostik k3"] }
    ]
  },
  {
    id: "machine",
    tabName: "⚙️ 2. Machine Lab",
    shortTitle: "Machine Lab (Permesinan)",
    tasks: [
      { key: "pretest", name: "⚙️ Pre-Test Teori Permesinan", category: "Pre-Test Formatif", keywords: ["pre-test", "pretest", "teori permesinan"] },
      { key: "cnc", name: "💻 Kuis Teori & Kode CNC", category: "Kuis CNC & G-Code", keywords: ["cnc", "g-code", "kode g"] },
      { key: "lathe", name: "🔩 Praktik Mesin Bubut & Frais", category: "Praktik Mesin", keywords: ["bubut", "frais", "praktik mesin"] },
      { key: "diag_machine", name: "📝 Tes Diagnostik Machine Lab", category: "Tes Diagnostik", keywords: ["diagnostik machine", "diagnostik mesin"] }
    ]
  },
  {
    id: "cutting-tools",
    tabName: "🔪 3. Alat Pemotong",
    shortTitle: "Alat Pemotong & RPM",
    tasks: [
      { key: "cutting_quiz", name: "🔪 Kuis Pahat & Kalkulasi RPM", category: "Kuis Parameter Potong", keywords: ["kalkulasi rpm", "pahat", "sudut potong", "cutting"] },
      { key: "diag_cutting", name: "📝 Tes Diagnostik Alat Potong", category: "Tes Diagnostik", keywords: ["diagnostik cutting", "diagnostik alat potong"] }
    ]
  },
  {
    id: "heat-treatment",
    tabName: "🌡️ 4. Heat Treatment",
    shortTitle: "Heat Treatment & Metalurgi",
    tasks: [
      { key: "metallurgy", name: "🌡️ Kuis Evaluasi Metalurgi", category: "Evaluasi Metalurgi", keywords: ["metalurgi", "hardening", "quenching", "tempering", "heat treatment"] },
      { key: "diag_heat", name: "📝 Tes Diagnostik Heat Treatment", category: "Tes Diagnostik", keywords: ["diagnostik heat", "diagnostik perlakuan panas"] }
    ]
  },
  {
    id: "mechanics",
    tabName: "🔧 5. Mekanika Teknik",
    shortTitle: "Mekanika Teknik Terapan",
    tasks: [
      { key: "torque", name: "⚖️ Kuis Momen Gaya & Torsi", category: "Kuis Mekanika Terapan", keywords: ["torsi", "momen gaya", "tuas", "kesetimbangan"] },
      { key: "diag_mechanics", name: "📝 Tes Diagnostik Mekanika", category: "Tes Diagnostik", keywords: ["diagnostik mekanika", "diagnostik mechanics"] }
    ]
  },
  {
    id: "welding",
    tabName: "⚡ 6. Welding Lab",
    shortTitle: "Welding Lab (Pengelasan)",
    tasks: [
      { key: "smaw", name: "⚡ Kuis Asesmen Las SMAW", category: "Asesmen Pengelasan", keywords: ["smaw", "las busur", "pengelasan", "welding"] },
      { key: "diag_welding", name: "📝 Tes Diagnostik Welding Lab", category: "Tes Diagnostik", keywords: ["diagnostik welding", "diagnostik las"] }
    ]
  },
  {
    id: "measuring",
    tabName: "📏 7. Alat Ukur Presisi",
    shortTitle: "Alat Ukur Presisi & Metrologi",
    tasks: [
      { key: "caliper_micrometer", name: "📏 Uji Pembacaan Kaliper & Mikrometer", category: "Uji Presisi", keywords: ["kaliper", "mikrometer", "jangka sorong", "alat ukur", "measuring"] },
      { key: "diag_measuring", name: "📝 Tes Diagnostik Alat Ukur", category: "Tes Diagnostik", keywords: ["diagnostik alat ukur", "diagnostik measuring"] }
    ]
  },
  {
    id: "design",
    tabName: "📐 8. Design Lab",
    shortTitle: "Design Lab & Studio CAD",
    tasks: [
      { key: "cad_drawing", name: "📐 Kuis Gambar Teknik & CAD", category: "Kuis Gambar Teknik", keywords: ["gambar teknik", "cad", "proyeksi", "studio cad"] },
      { key: "diag_design", name: "📝 Tes Diagnostik Design Lab", category: "Tes Diagnostik", keywords: ["diagnostik design", "diagnostik gambar"] }
    ]
  },
  {
    id: "virtual-bengkel",
    tabName: "🏭 9. Virtual Bengkel",
    shortTitle: "Virtual Bengkel 3D",
    tasks: [
      { key: "virtual_bengkel", name: "🏭 Praktik Workshop 3D", category: "Eksplorasi Bengkel", keywords: ["workshop 3d", "virtual bengkel", "bengkel 3d", "sop bengkel"] },
      { key: "diag_virtual", name: "📝 Tes Diagnostik Bengkel 3D", category: "Tes Diagnostik", keywords: ["diagnostik bengkel", "diagnostik virtual"] }
    ]
  },
  {
    id: "evaluasi",
    tabName: "🎓 10. Evaluasi Akhir",
    shortTitle: "Evaluasi Akhir Komprehensif",
    tasks: [
      { key: "evaluasi_final", name: "🎓 Evaluasi Akhir Komprehensif", category: "Ujian Akhir", keywords: ["evaluasi akhir", "komprehensif", "ujian akhir", "evaluasi"] }
    ]
  }
];

/**
 * =============================================================================
 * 1. WEBHOOK POST (doPost) - MENERIMA NILAI DARI WEBSITE SECARA REAL-TIME
 * =============================================================================
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var rawSheet = getOrCreateRawSheet(ss);

    // Parse Data yang Dikirim dari Web
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var nowStr = data.waktu || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    var namaSiswa = (data.namaSiswa || "Siswa Praktikan").trim();
    var nomorAbsen = data.nomorAbsen !== undefined ? String(data.nomorAbsen) : "-";
    var kelas = data.kelas || "-";
    var sekolah = data.sekolah || "-";
    var modul = data.modul || "-";
    var subModul = data.subModul || data.jenisKuis || "-";
    var judulKuis = data.judulKuis || "-";
    var skor = Number(data.skor !== undefined ? data.skor : 0);
    var jawabanBenar = data.jawabanBenar !== undefined ? data.jawabanBenar : "-";
    var totalSoal = data.totalSoal !== undefined ? data.totalSoal : "-";
    var status = data.status || (skor >= 75 ? "LULUS" : "REMEDIAL");
    var detailJawaban = typeof data.detailJawaban === "object" ? JSON.stringify(data.detailJawaban) : String(data.detailJawaban || "-");

    // Simpan baris baru ke sheet data masuk
    rawSheet.appendRow([
      nowStr,
      namaSiswa,
      nomorAbsen,
      kelas,
      sekolah,
      modul,
      subModul,
      judulKuis,
      skor,
      jawabanBenar,
      totalSoal,
      status,
      detailJawaban
    ]);

    var lastRow = rawSheet.getLastRow();
    rawSheet.setRowHeight(lastRow, 26);
    rawSheet.getRange(lastRow, 3).setHorizontalAlignment("center");
    rawSheet.getRange(lastRow, 4).setHorizontalAlignment("center");
    rawSheet.getRange(lastRow, 9).setHorizontalAlignment("center");
    rawSheet.getRange(lastRow, 10).setHorizontalAlignment("center");
    rawSheet.getRange(lastRow, 11).setHorizontalAlignment("center");
    rawSheet.getRange(lastRow, 12).setHorizontalAlignment("center");

    var scoreCell = rawSheet.getRange(lastRow, 9);
    var statusCell = rawSheet.getRange(lastRow, 12);
    scoreCell.setFontWeight("bold");
    statusCell.setFontWeight("bold");

    if (skor >= 75) {
      statusCell.setBackground("#dcfce7");
      statusCell.setFontColor("#166534");
      scoreCell.setFontColor("#16a34a");
    } else {
      statusCell.setBackground("#fee2e2");
      statusCell.setFontColor("#991b1b");
      scoreCell.setFontColor("#dc2626");
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data nilai " + namaSiswa + " berhasil dicatat ke spreadsheet.",
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Google Apps Script BIMO Manufacturing Labs aktif & siap menerima data nilai siswa."
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * =============================================================================
 * 2. MENU KHUSUS BIMO LABS PADA SPREADSHEET
 * =============================================================================
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("⚡ Menu BIMO Labs")
      .addItem("📊 1. Buat Semua Tab Lab & Rekap Tugas (Sesuai Sidebar)", "buatSemuaTabModulLab")
      .addItem("📋 2. Buat Matriks Rekap Seluruh Lab", "buatMatriksRekapSeluruhLab")
      .addItem("🔄 3. Sinkronkan & Rapikan Ulang Semua Data", "buatSemuaTabModulLab")
      .addSeparator()
      .addItem("ℹ️ Panduan Pemakaian", "tampilkanPanduan")
      .addToUi();
  } catch (e) {}
}

function tampilkanPanduan() {
  var pesan = "CARA MENGGUNAKAN MENU BIMO LABS:\n\n" +
    "1. Klik '📊 1. Buat Semua Tab Lab & Rekap Tugas (Sesuai Sidebar)':\n" +
    "   Sistem otomatis membuat tab di bar bawah sesuai sidebar website:\n" +
    "   🛡️ Safety Lab, ⚙️ Machine Lab, 🔪 Alat Pemotong, 🌡️ Heat Treatment, dll.\n\n" +
    "2. Di dalam tiap tab modul lab terdapat:\n" +
    "   - Bagian 1: Daftar tugas-tugas lab dibuat per row/baris (lengkap dengan nama siswa yang sudah & belum mengumpulkan).\n" +
    "   - Bagian 2: Matriks ceklis nilai siswa (warna hijau untuk Lulus, abu-abu untuk Belum).\n\n" +
    "3. Tab '📊 Rekap Seluruh Lab' memperlihatkan status penyelesaian seluruh siswa di semua lab.\n\n" +
    "Seluruh data nilai dijamin 100% aman dan tidak akan terhapus.";
  SpreadsheetApp.getUi().alert("Panduan Rekap Nilai BIMO Labs", pesan, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ALIAS FUNGSI: Agar jika guru menekan tombol '▷ Jalankan' di toolbar Apps Script tetap berjalan sempurna
function buatMatriksRekapPengumpulan() {
  buatSemuaTabModulLab();
}

function rapikanDanPisahkanKuisOtomatis() {
  buatSemuaTabModulLab();
}

/**
 * =============================================================================
 * 3. FUNGSI UTAMA: BUAT TAB-TAB MODUL LAB SESUAI SIDEBAR
 * =============================================================================
 */
function buatSemuaTabModulLab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allRows = getAllDataRows(ss);

  if (allRows.length === 0) {
    try {
      SpreadsheetApp.getUi().alert("Belum ada data nilai siswa yang tersimpan di spreadsheet.");
    } catch (e) {}
    return;
  }

  // 1. Ekstrak data siswa unik (diurutkan berdasarkan No. Absen lalu Nama)
  var studentsMap = {};
  allRows.forEach(function(r) {
    var nama = String(r[1] || "").trim();
    if (!nama || nama.toLowerCase().indexOf("percobaan") !== -1) return;
    var absen = String(r[2] || "-");
    var kelas = String(r[3] || "-");
    var key = nama.toLowerCase();

    if (!studentsMap[key]) {
      studentsMap[key] = {
        nama: nama,
        absen: absen,
        kelas: kelas,
        scoresByTask: {}
      };
    } else {
      if (studentsMap[key].absen === "-" && absen !== "-") studentsMap[key].absen = absen;
      if (studentsMap[key].kelas === "-" && kelas !== "-") studentsMap[key].kelas = kelas;
    }

    var quizTitle = String(r[7] || r[6] || "").trim();
    var modulName = String(r[5] || "").trim();
    var score = Number(r[8] !== undefined ? r[8] : (r[7] !== undefined ? r[7] : 0));
    var matched = identifyLabAndTask(modulName, quizTitle);

    var taskFullKey = matched.labId + "_" + matched.taskKey;
    if (studentsMap[key].scoresByTask[taskFullKey] === undefined || score > studentsMap[key].scoresByTask[taskFullKey].skor) {
      studentsMap[key].scoresByTask[taskFullKey] = {
        skor: score,
        waktu: String(r[0] || ""),
        labId: matched.labId,
        taskKey: matched.taskKey,
        taskName: matched.taskName
      };
    }
  });

  var sortedStudentKeys = Object.keys(studentsMap).sort(function(a, b) {
    var numA = parseInt(studentsMap[a].absen, 10);
    var numB = parseInt(studentsMap[b].absen, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return studentsMap[a].nama.localeCompare(studentsMap[b].nama);
  });

  // 2. Bangun masing-masing Tab Modul Lab sesuai urutan Sidebar
  LAB_CONFIGS.forEach(function(lab) {
    renderLabSheet(ss, lab, studentsMap, sortedStudentKeys);
  });

  // 3. Bangun Tab Master: Rekap Seluruh Lab
  renderMasterMatrixSheet(ss, LAB_CONFIGS, studentsMap, sortedStudentKeys);

  try {
    SpreadsheetApp.getUi().alert("✅ Berhasil!\n\nSeluruh tab modul lab (Safety Lab, Machine Lab, Alat Pemotong, Heat Treatment, dll) dan lembar '📊 Rekap Seluruh Lab' telah berhasil dibuat sesuai sidebar website.");
  } catch (e) {}
}

/**
 * =============================================================================
 * 4. RENDER SATU SHEET LAB: BERISI REKAP TUGAS PER ROW + MATRIKS SISWA
 * =============================================================================
 */
function renderLabSheet(ss, lab, studentsMap, sortedStudentKeys) {
  var sheet = ss.getSheetByName(lab.tabName);
  if (!sheet) {
    sheet = ss.insertSheet(lab.tabName);
  } else {
    sheet.clear();
  }

  var tasks = lab.tasks;
  var totalStudents = sortedStudentKeys.length;
  var nowFormatted = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd-MM-yyyy HH:mm");

  // BANNER 1: JUDUL BESAR LAB
  sheet.appendRow([lab.tabName.toUpperCase() + " - REKAPITULASI TUGAS & MATRIKS PENGUMPULAN SISWA"]);
  var b1 = sheet.getRange(1, 1, 1, 11);
  b1.merge();
  b1.setBackground("#064e3b");
  b1.setFontColor("#ffffff");
  b1.setFontWeight("bold");
  b1.setFontSize(11);
  b1.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);

  // BANNER 2: INFO MODUL & STANDAR KKM
  sheet.appendRow([
    "Modul: " + lab.shortTitle + "  |  Target KKM: 75  |  Total Tugas: " + tasks.length + " Tugas  |  Total Siswa Terdaftar: " + totalStudents + " Siswa  |  Diperbarui: " + nowFormatted + " WIB"
  ]);
  var b2 = sheet.getRange(2, 1, 1, 11);
  b2.merge();
  b2.setBackground("#0f766e");
  b2.setFontColor("#ecfdf5");
  b2.setFontWeight("bold");
  b2.setFontSize(9);
  b2.setVerticalAlignment("middle");
  sheet.setRowHeight(2, 26);

  // SPASI BARIS 3
  sheet.appendRow([""]);
  sheet.setRowHeight(3, 10);

  // ---------------------------------------------------------------------------
  // BAGIAN 1: REKAPITULASI TUGAS LABORATORIUM (DAFTAR PER ROW / BARIS)
  // ---------------------------------------------------------------------------
  sheet.appendRow(["📌 BAGIAN 1: REKAPITULASI TUGAS LABORATORIUM (DAFTAR TUGAS PER BARIS / ROW)"]);
  var sec1Title = sheet.getRange(4, 1, 1, 11);
  sec1Title.merge();
  sec1Title.setBackground("#1e293b");
  sec1Title.setFontColor("#f8fafc");
  sec1Title.setFontWeight("bold");
  sec1Title.setFontSize(10);
  sec1Title.setVerticalAlignment("middle");
  sheet.setRowHeight(4, 28);

  var taskHeaders = [
    "No",
    "Nama Tugas / Asesmen Lab",
    "Kategori Asesmen",
    "Target KKM",
    "Siswa Selesai",
    "Lulus (>=75)",
    "Remedial (<75)",
    "% Kelulusan",
    "Rata-rata Nilai",
    "Daftar Siswa yang Sudah Mengumpulkan (Lengkap dg Nilai)",
    "Daftar Siswa yang Belum Mengumpulkan"
  ];
  sheet.appendRow(taskHeaders);
  var tHRange = sheet.getRange(5, 1, 1, taskHeaders.length);
  tHRange.setBackground("#334155");
  tHRange.setFontColor("#ffffff");
  tHRange.setFontWeight("bold");
  tHRange.setFontSize(9);
  tHRange.setHorizontalAlignment("center");
  tHRange.setVerticalAlignment("middle");
  sheet.setRowHeight(5, 30);

  // ISI DATA ROW UNTUK SETIAP TUGAS LAB
  var taskRowStart = 6;
  var noTask = 1;

  tasks.forEach(function(t) {
    var taskFullKey = lab.id + "_" + t.key;
    var submittedStudents = [];
    var notSubmittedStudents = [];
    var passedCount = 0;
    var totalScore = 0;

    sortedStudentKeys.forEach(function(k) {
      var s = studentsMap[k];
      var rec = s.scoresByTask[taskFullKey];
      if (rec !== undefined) {
        submittedStudents.push(s.nama + " (" + rec.skor + ")");
        totalScore += rec.skor;
        if (rec.skor >= 75) passedCount++;
      } else {
        notSubmittedStudents.push(s.nama);
      }
    });

    var subCount = submittedStudents.length;
    var remCount = subCount - passedCount;
    var avgScore = subCount > 0 ? Math.round(totalScore / subCount) : 0;
    var passPct = subCount > 0 ? Math.round((passedCount / subCount) * 100) + "%" : "0%";

    var submittedText = submittedStudents.length > 0 ? submittedStudents.join(", ") : "-";
    var notSubmittedText = notSubmittedStudents.length > 0 ? notSubmittedStudents.join(", ") : "(Semua Sudah Mengumpulkan)";

    sheet.appendRow([
      noTask++,
      t.name,
      t.category,
      ">= 75",
      subCount + " / " + totalStudents + " Siswa",
      passedCount + " Siswa",
      remCount + " Siswa",
      passPct,
      avgScore,
      submittedText,
      notSubmittedText
    ]);

    var lr = sheet.getLastRow();
    sheet.setRowHeight(lr, 26);
    sheet.getRange(lr, 1).setHorizontalAlignment("center");
    sheet.getRange(lr, 4).setHorizontalAlignment("center");
    sheet.getRange(lr, 5).setHorizontalAlignment("center");
    sheet.getRange(lr, 6).setHorizontalAlignment("center");
    sheet.getRange(lr, 7).setHorizontalAlignment("center");
    sheet.getRange(lr, 8).setHorizontalAlignment("center");
    sheet.getRange(lr, 9).setHorizontalAlignment("center");

    var avgCell = sheet.getRange(lr, 9);
    avgCell.setFontWeight("bold");
    if (avgScore >= 75) {
      avgCell.setFontColor("#16a34a");
    } else if (subCount > 0) {
      avgCell.setFontColor("#dc2626");
    }

    var subCell = sheet.getRange(lr, 5);
    subCell.setFontWeight("bold");
    if (subCount === totalStudents && totalStudents > 0) {
      subCell.setBackground("#dcfce7");
      subCell.setFontColor("#166534");
    }
  });

  // SPASI ANTAR BAGIAN
  sheet.appendRow([""]);
  var curRow = sheet.getLastRow();
  sheet.setRowHeight(curRow, 14);

  // ---------------------------------------------------------------------------
  // BAGIAN 2: MATRIKS CEKLIS NILAI SISWA (STATUS PENGUMPULAN PER SISWA)
  // ---------------------------------------------------------------------------
  var sec2StartRow = curRow + 1;
  sheet.appendRow(["📋 BAGIAN 2: MATRIKS CEKLIS NILAI SISWA (STATUS PENGUMPULAN PER SISWA)"]);
  var sec2Title = sheet.getRange(sec2StartRow, 1, 1, 4 + tasks.length + 3);
  sec2Title.merge();
  sec2Title.setBackground("#1e293b");
  sec2Title.setFontColor("#f8fafc");
  sec2Title.setFontWeight("bold");
  sec2Title.setFontSize(10);
  sec2Title.setVerticalAlignment("middle");
  sheet.setRowHeight(sec2StartRow, 28);

  var matrixHeaders = ["No", "Nama Lengkap Siswa", "No. Absen", "Kelas / Jurusan"];
  tasks.forEach(function(t) {
    matrixHeaders.push(t.name);
  });
  matrixHeaders.push("Total Selesai");
  matrixHeaders.push("Rata-rata Nilai");
  matrixHeaders.push("Status Kelengkapan");

  sheet.appendRow(matrixHeaders);
  var mHRow = sec2StartRow + 1;
  var mHRange = sheet.getRange(mHRow, 1, 1, matrixHeaders.length);
  mHRange.setBackground("#0f172a");
  mHRange.setFontColor("#ffffff");
  mHRange.setFontWeight("bold");
  mHRange.setFontSize(9);
  mHRange.setHorizontalAlignment("center");
  mHRange.setVerticalAlignment("middle");
  sheet.setRowHeight(mHRow, 34);

  // ISI ROW DATA SETIAP SISWA
  var noSiswa = 1;
  var taskSubmissionCounts = new Array(tasks.length).fill(0);
  var taskScoreSums = new Array(tasks.length).fill(0);

  sortedStudentKeys.forEach(function(k) {
    var s = studentsMap[k];
    var row = [noSiswa++, s.nama, s.absen, s.kelas];
    var finishedCount = 0;
    var studentScoreSum = 0;

    tasks.forEach(function(t, idx) {
      var taskFullKey = lab.id + "_" + t.key;
      var rec = s.scoresByTask[taskFullKey];
      if (rec !== undefined) {
        finishedCount++;
        studentScoreSum += rec.skor;
        taskSubmissionCounts[idx]++;
        taskScoreSums[idx] += rec.skor;
        row.push(rec.skor + " (LULUS)");
      } else {
        row.push("⏳ Belum");
      }
    });

    var studentAvg = finishedCount > 0 ? Math.round(studentScoreSum / finishedCount) : 0;
    row.push(finishedCount + " / " + tasks.length + " Tugas");
    row.push(studentAvg);
    row.push(finishedCount === tasks.length ? "LENGKAP" : (finishedCount > 0 ? "SEBAGIAN" : "BELUM ADA"));

    sheet.appendRow(row);
    var rRow = sheet.getLastRow();
    sheet.setRowHeight(rRow, 26);
    sheet.getRange(rRow, 1).setHorizontalAlignment("center");
    sheet.getRange(rRow, 3).setHorizontalAlignment("center");
    sheet.getRange(rRow, 4).setHorizontalAlignment("center");
    sheet.getRange(rRow, matrixHeaders.length - 2).setHorizontalAlignment("center");
    sheet.getRange(rRow, matrixHeaders.length - 1).setHorizontalAlignment("center");
    sheet.getRange(rRow, matrixHeaders.length).setHorizontalAlignment("center");

    // Format warna sel kuis
    for (var c = 0; c < tasks.length; c++) {
      var cell = sheet.getRange(rRow, 5 + c);
      cell.setHorizontalAlignment("center");
      var val = String(row[4 + c]);
      if (val.indexOf("Belum") !== -1) {
        cell.setBackground("#f1f5f9");
        cell.setFontColor("#94a3b8");
      } else {
        cell.setBackground("#dcfce7");
        cell.setFontColor("#166534");
        cell.setFontWeight("bold");
      }
    }

    var compCell = sheet.getRange(rRow, matrixHeaders.length);
    compCell.setFontWeight("bold");
    if (finishedCount === tasks.length) {
      compCell.setBackground("#dcfce7");
      compCell.setFontColor("#166534");
    } else if (finishedCount > 0) {
      compCell.setBackground("#fef3c7");
      compCell.setFontColor("#92400e");
    } else {
      compCell.setBackground("#f1f5f9");
      compCell.setFontColor("#64748b");
    }
  });

  // BARIS FOOTER TOTAL PENGUMPULAN
  var footerRow = ["TOTAL SISWA MENGUMPULKAN:", "", "", ""];
  tasks.forEach(function(t, idx) {
    footerRow.push(taskSubmissionCounts[idx] + " / " + totalStudents + " Siswa");
  });
  footerRow.push("-");
  footerRow.push("-");
  footerRow.push("-");

  sheet.appendRow(footerRow);
  var fRow = sheet.getLastRow();
  sheet.setRowHeight(fRow, 28);
  var fMerged = sheet.getRange(fRow, 1, 1, 4);
  fMerged.merge();
  fMerged.setHorizontalAlignment("right");
  fMerged.setFontWeight("bold");

  var fRange = sheet.getRange(fRow, 1, 1, matrixHeaders.length);
  fRange.setBackground("#e2e8f0");
  fRange.setFontWeight("bold");
  fRange.setFontSize(9);
  for (var c = 0; c < tasks.length; c++) {
    sheet.getRange(fRow, 5 + c).setHorizontalAlignment("center");
  }

  // ATUR LEBAR KOLOM IDEAL
  sheet.setColumnWidth(1, 45);  // No
  sheet.setColumnWidth(2, 220); // Nama Lengkap
  sheet.setColumnWidth(3, 85);  // Absen
  sheet.setColumnWidth(4, 120); // Kelas
  for (var i = 0; i < tasks.length; i++) {
    sheet.setColumnWidth(5 + i, 190); // Kolom Tugas
  }
  sheet.setColumnWidth(matrixHeaders.length - 2, 130); // Total Selesai
  sheet.setColumnWidth(matrixHeaders.length - 1, 110); // Rata-rata
  sheet.setColumnWidth(matrixHeaders.length, 140);     // Status
}

/**
 * =============================================================================
 * 5. RENDER MASTER TAB: REKAP SELURUH LAB (SUMMARY MATRIX)
 * =============================================================================
 */
function renderMasterMatrixSheet(ss, labs, studentsMap, sortedStudentKeys) {
  var masterName = "📊 Rekap Seluruh Lab";
  var sheet = ss.getSheetByName(masterName);
  if (!sheet) {
    sheet = ss.insertSheet(masterName, 0);
  } else {
    sheet.clear();
  }

  // BANNER MASTER
  sheet.appendRow(["📊 REKAPITULASI KELENGKAPAN TUGAS SELURUH LABORATORIUM (BIMO MANUFACTURING LABS)"]);
  var b1 = sheet.getRange(1, 1, 1, 4 + labs.length + 3);
  b1.merge();
  b1.setBackground("#0f172a");
  b1.setFontColor("#ffffff");
  b1.setFontWeight("bold");
  b1.setFontSize(11);
  sheet.setRowHeight(1, 38);

  var nowFormatted = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd-MM-yyyy HH:mm");
  sheet.appendRow([
    "Instansi: SMKN 2 Depok  |  Master Gradebook Seluruh Modul  |  Total Lab: " + labs.length + " Modul  |  Diperbarui: " + nowFormatted + " WIB"
  ]);
  var b2 = sheet.getRange(2, 1, 1, 4 + labs.length + 3);
  b2.merge();
  b2.setBackground("#1e293b");
  b2.setFontColor("#cbd5e1");
  b2.setFontWeight("bold");
  b2.setFontSize(9);
  sheet.setRowHeight(2, 26);

  var headers = ["No", "Nama Lengkap Siswa", "No. Absen", "Kelas / Jurusan"];
  labs.forEach(function(l) {
    headers.push(l.tabName);
  });
  headers.push("Total Semua Tugas Selesai");
  headers.push("Rata-rata Nilai Keseluruhan");
  headers.push("Status Akhir Siswa");

  sheet.appendRow(headers);
  var hRange = sheet.getRange(3, 1, 1, headers.length);
  hRange.setBackground("#064e3b");
  hRange.setFontColor("#ffffff");
  hRange.setFontWeight("bold");
  hRange.setFontSize(9);
  hRange.setHorizontalAlignment("center");
  sheet.setRowHeight(3, 34);
  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(2);

  // Total semua tugas di website
  var grandTotalTasks = 0;
  labs.forEach(function(l) { grandTotalTasks += l.tasks.length; });

  var no = 1;
  sortedStudentKeys.forEach(function(k) {
    var s = studentsMap[k];
    var row = [no++, s.nama, s.absen, s.kelas];
    var overallFinished = 0;
    var overallScoreSum = 0;

    labs.forEach(function(l) {
      var labTasks = l.tasks;
      var labFinished = 0;
      var labScoreSum = 0;

      labTasks.forEach(function(t) {
        var taskFullKey = l.id + "_" + t.key;
        var rec = s.scoresByTask[taskFullKey];
        if (rec !== undefined) {
          labFinished++;
          labScoreSum += rec.skor;
          overallFinished++;
          overallScoreSum += rec.skor;
        }
      });

      if (labFinished > 0) {
        var labAvg = Math.round(labScoreSum / labFinished);
        row.push(labFinished + "/" + labTasks.length + " (" + labAvg + ")");
      } else {
        row.push("⏳ 0/" + labTasks.length);
      }
    });

    var overallAvg = overallFinished > 0 ? Math.round(overallScoreSum / overallFinished) : 0;
    row.push(overallFinished + " / " + grandTotalTasks + " Tugas");
    row.push(overallAvg);
    row.push(overallFinished === grandTotalTasks ? "LENGKAP" : (overallFinished > 0 ? "SEBAGIAN" : "BELUM ADA"));

    sheet.appendRow(row);
    var lr = sheet.getLastRow();
    sheet.setRowHeight(lr, 26);
    sheet.getRange(lr, 1).setHorizontalAlignment("center");
    sheet.getRange(lr, 3).setHorizontalAlignment("center");
    sheet.getRange(lr, 4).setHorizontalAlignment("center");
    sheet.getRange(lr, headers.length - 2).setHorizontalAlignment("center");
    sheet.getRange(lr, headers.length - 1).setHorizontalAlignment("center");
    sheet.getRange(lr, headers.length).setHorizontalAlignment("center");

    for (var c = 0; c < labs.length; c++) {
      var cell = sheet.getRange(lr, 5 + c);
      cell.setHorizontalAlignment("center");
      var val = String(row[4 + c]);
      if (val.indexOf("⏳") !== -1) {
        cell.setBackground("#f1f5f9");
        cell.setFontColor("#94a3b8");
      } else {
        cell.setBackground("#dcfce7");
        cell.setFontColor("#166534");
        cell.setFontWeight("bold");
      }
    }

    var compCell = sheet.getRange(lr, headers.length);
    compCell.setFontWeight("bold");
    if (overallFinished === grandTotalTasks) {
      compCell.setBackground("#dcfce7");
      compCell.setFontColor("#166534");
    } else if (overallFinished > 0) {
      compCell.setBackground("#fef3c7");
      compCell.setFontColor("#92400e");
    }
  });

  sheet.setColumnWidth(1, 45);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 85);
  sheet.setColumnWidth(4, 120);
  for (var i = 0; i < labs.length; i++) {
    sheet.setColumnWidth(5 + i, 160);
  }
  sheet.setColumnWidth(headers.length - 2, 140);
  sheet.setColumnWidth(headers.length - 1, 110);
  sheet.setColumnWidth(headers.length, 140);
}

function buatMatriksRekapSeluruhLab() {
  buatSemuaTabModulLab();
}

/**
 * =============================================================================
 * 6. HELPER: PENGENALAN LAB & TUGAS SPESIFIK BERDASARKAN JUDUL & MODUL
 * =============================================================================
 */
function identifyLabAndTask(modulStr, quizStr) {
  var m = String(modulStr || "").toLowerCase();
  var q = String(quizStr || "").toLowerCase();
  var text = m + " " + q;

  // 1. Cari kecocokan lab & task pada konfigurasi
  for (var i = 0; i < LAB_CONFIGS.length; i++) {
    var lab = LAB_CONFIGS[i];
    for (var j = 0; j < lab.tasks.length; j++) {
      var task = lab.tasks[j];
      var matched = false;
      for (var k = 0; k < task.keywords.length; k++) {
        if (text.indexOf(task.keywords[k]) !== -1) {
          matched = true;
          break;
        }
      }
      if (matched) {
        return {
          labId: lab.id,
          taskKey: task.key,
          taskName: task.name
        };
      }
    }
  }

  // 2. Fallback berdasarkan modul
  if (text.indexOf("safety") !== -1 || text.indexOf("k3") !== -1) {
    return { labId: "safety", taskKey: "safety_gen", taskName: q || "Praktik Safety K3" };
  }
  if (text.indexOf("cutting") !== -1 || text.indexOf("potong") !== -1) {
    return { labId: "cutting-tools", taskKey: "cutting_gen", taskName: q || "Praktik Alat Potong" };
  }
  if (text.indexOf("heat") !== -1 || text.indexOf("panas") !== -1) {
    return { labId: "heat-treatment", taskKey: "heat_gen", taskName: q || "Praktik Heat Treatment" };
  }
  if (text.indexOf("mekanika") !== -1 || text.indexOf("mechanic") !== -1) {
    return { labId: "mechanics", taskKey: "mech_gen", taskName: q || "Praktik Mekanika" };
  }
  if (text.indexOf("weld") !== -1 || text.indexOf("las") !== -1) {
    return { labId: "welding", taskKey: "weld_gen", taskName: q || "Praktik Pengelasan" };
  }
  if (text.indexOf("ukur") !== -1 || text.indexOf("measur") !== -1) {
    return { labId: "measuring", taskKey: "meas_gen", taskName: q || "Praktik Alat Ukur" };
  }
  if (text.indexOf("design") !== -1 || text.indexOf("cad") !== -1) {
    return { labId: "design", taskKey: "cad_gen", taskName: q || "Praktik Design Lab" };
  }
  if (text.indexOf("bengkel") !== -1) {
    return { labId: "virtual-bengkel", taskKey: "bengkel_gen", taskName: q || "Praktik Bengkel 3D" };
  }
  if (text.indexOf("evaluasi") !== -1) {
    return { labId: "evaluasi", taskKey: "evaluasi_final", taskName: "🎓 Evaluasi Akhir Komprehensif" };
  }

  return { labId: "machine", taskKey: "machine_gen", taskName: q || "Praktik Machine Lab" };
}

/**
 * =============================================================================
 * 7. HELPER: AMBIL SELURUH DATA BARIS DARI SPREADSHEET (TERTINGGI PER SISWA)
 * =============================================================================
 */
function getAllDataRows(ss) {
  var bestRows = {};
  var sheets = ss.getSheets();

  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    // Lewati sheet matriks atau sheet hasil render
    if (name.indexOf("📊") !== -1 || name.indexOf("🛡️") !== -1 || name.indexOf("⚙️") !== -1 || name.indexOf("🔪") !== -1 || name.indexOf("🌡️") !== -1 || name.indexOf("🔧") !== -1 || name.indexOf("⚡") !== -1 || name.indexOf("📏") !== -1 || name.indexOf("📐") !== -1 || name.indexOf("🏭") !== -1 || name.indexOf("🎓") !== -1 || name.indexOf("📋") !== -1) {
      return;
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    var headerRowIdx = -1;
    for (var i = 0; i < Math.min(data.length, 5); i++) {
      var rowStr = data[i].join(" ").toLowerCase();
      if (rowStr.indexOf("nama") !== -1 && (rowStr.indexOf("nilai") !== -1 || rowStr.indexOf("kuis") !== -1 || rowStr.indexOf("skor") !== -1)) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx === -1) return;

    for (var r = headerRowIdx + 1; r < data.length; r++) {
      var row = data[r];
      var studentName = String(row[1] || "").trim();
      var quizTitle = String(row[7] || row[6] || "").trim();
      var score = Number(row[8] !== undefined ? row[8] : (row[7] !== undefined ? row[7] : 0));

      if (typeof row[0] === "number" && isNaN(new Date(row[1]).getTime())) {
        studentName = String(row[2] || "").trim();
        quizTitle = String(row[7] || row[6] || "").trim();
      }

      if (studentName && quizTitle && studentName.toLowerCase().indexOf("percobaan") === -1) {
        var studentKey = studentName.toLowerCase() + "_" + quizTitle.toLowerCase();
        if (!bestRows[studentKey] || score > Number(bestRows[studentKey][8] || bestRows[studentKey][7] || 0)) {
          bestRows[studentKey] = row;
        }
      }
    }
  });

  var result = Object.keys(bestRows).map(function(k) { return bestRows[k]; });

  // Fallback: Jika belum ada di multi-sheet, ambil dari sheet pertama
  if (result.length === 0) {
    var firstSheet = ss.getSheets()[0];
    var curData = firstSheet.getDataRange().getValues();
    for (var i = 1; i < curData.length; i++) {
      if (curData[i][1] && String(curData[i][1]).toLowerCase().indexOf("percobaan") === -1) {
        result.push(curData[i]);
      }
    }
  }

  return result;
}

/**
 * =============================================================================
 * 8. HELPER: CARI ATAU BUAT SHEET RAW DATA MASUK
 * =============================================================================
 */
function getOrCreateRawSheet(ss) {
  var rawName = "📥 Data Masuk (Raw Data)";
  var sheet = ss.getSheetByName(rawName);
  if (!sheet) {
    // Coba gunakan sheet pertama jika masih bernama Sheet1
    var firstSheet = ss.getSheets()[0];
    var firstSheetName = firstSheet.getName();
    if (firstSheetName === "Sheet1" || firstSheetName === "Halaman1" || firstSheetName === "Jawaban Formulir 1") {
      firstSheet.setName(rawName);
      sheet = firstSheet;
    } else {
      sheet = ss.insertSheet(rawName);
    }
  }

  if (sheet.getLastRow() === 0) {
    var headers = [
      "Waktu & Tanggal",
      "Nama Lengkap Siswa",
      "No. Absen",
      "Kelas / Jurusan",
      "Sekolah / Instansi",
      "Modul Lab (Sidebar)",
      "Sub-Kuis / Lembar",
      "Nama Kuis / Asesmen",
      "Nilai (0 - 100)",
      "Jawaban Benar",
      "Total Soal",
      "Status KKM",
      "Rincian Jawaban Siswa"
    ];
    sheet.appendRow(headers);
    var hRange = sheet.getRange(1, 1, 1, headers.length);
    hRange.setBackground("#064e3b");
    hRange.setFontColor("#ffffff");
    hRange.setFontWeight("bold");
    hRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    sheet.setColumnWidth(1, 170);
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(3, 85);
    sheet.setColumnWidth(4, 120);
    sheet.setColumnWidth(5, 170);
    sheet.setColumnWidth(6, 160);
    sheet.setColumnWidth(7, 200);
    sheet.setColumnWidth(8, 240);
    sheet.setColumnWidth(9, 110);
    sheet.setColumnWidth(10, 110);
    sheet.setColumnWidth(11, 100);
    sheet.setColumnWidth(12, 110);
    sheet.setColumnWidth(13, 280);
  }

  return sheet;
}

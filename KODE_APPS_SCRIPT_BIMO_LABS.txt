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
 * 2. Seluruh nilai yang ditampilkan 100% adalah NILAI ASLI SISWA (Skala 0 - 100,
 *    misal: 75, 80, 85, 90, 100). Tidak ada lagi pecahan/rasio (1/2/3/4/5/6/7/8/9)
 *    maupun jumlah benar di kolom nilai.
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

    // Pastikan Nilai Berupa Angka Asli (0 - 100)
    var skor = Number(data.skor !== undefined ? data.skor : 0);
    if (skor > 0 && skor <= 10) {
      // Jika terkirim skala 1-10 (misal benar 8 dari 10 soal), ubah ke skala 100 asli
      skor = Math.round(skor * 10);
    }

    var jawabanBenar = data.jawabanBenar !== undefined ? data.jawabanBenar : "-";
    var totalSoal = data.totalSoal !== undefined ? data.totalSoal : "-";
    var status = data.status || (skor >= 75 ? "LULUS" : "REMEDIAL");
    var detailJawaban = typeof data.detailJawaban === "object" ? JSON.stringify(data.detailJawaban) : String(data.detailJawaban || "-");

    // Periksa apakah format sheet raw menggunakan 12 kolom atau 13 kolom
    var numCols = rawSheet.getLastColumn();
    var hasSubModulCol = false;
    if (rawSheet.getLastRow() > 0 && numCols > 0) {
      var hRow = rawSheet.getRange(1, 1, 1, Math.min(numCols, 15)).getValues()[0];
      for (var c = 0; c < hRow.length; c++) {
        if (String(hRow[c] || "").toLowerCase().indexOf("sub") !== -1) {
          hasSubModulCol = true;
          break;
        }
      }
    }

    var newRowData;
    if (hasSubModulCol) {
      newRowData = [
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
      ];
    } else {
      newRowData = [
        nowStr,
        namaSiswa,
        nomorAbsen,
        kelas,
        sekolah,
        modul,
        judulKuis,
        skor,
        jawabanBenar,
        totalSoal,
        status,
        detailJawaban
      ];
    }

    rawSheet.appendRow(newRowData);

    var lastRow = rawSheet.getLastRow();
    rawSheet.setRowHeight(lastRow, 26);
    rawSheet.getRange(lastRow, 3).setHorizontalAlignment("center");
    rawSheet.getRange(lastRow, 4).setHorizontalAlignment("center");

    var scoreCol = hasSubModulCol ? 9 : 8;
    var statusCol = hasSubModulCol ? 12 : 11;

    rawSheet.getRange(lastRow, scoreCol).setHorizontalAlignment("center");
    rawSheet.getRange(lastRow, scoreCol + 1).setHorizontalAlignment("center");
    rawSheet.getRange(lastRow, scoreCol + 2).setHorizontalAlignment("center");
    rawSheet.getRange(lastRow, statusCol).setHorizontalAlignment("center");

    var scoreCell = rawSheet.getRange(lastRow, scoreCol);
    var statusCell = rawSheet.getRange(lastRow, statusCol);
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
      message: "Data nilai " + namaSiswa + " (" + skor + ") berhasil dicatat ke spreadsheet.",
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
    "2. Nilai yang ditampilkan adalah NILAI ASLI SISWA (Skala 0 - 100, misal: 80, 85, 90, 100).\n" +
    "   - Bagian 1: Daftar tugas-tugas lab per row (lengkap dengan nama & nilai asli).\n" +
    "   - Bagian 2: Matriks ceklis nilai siswa (Hijau = LULUS, Merah = REMEDIAL, Abu-abu = Belum).\n\n" +
    "3. Tab '📊 Rekap Seluruh Lab' memperlihatkan nilai asli rata-rata tiap lab untuk seluruh siswa.\n\n" +
    "Seluruh data nilai dijamin 100% aman dan tidak akan terhapus.";
  SpreadsheetApp.getUi().alert("Panduan Rekap Nilai BIMO Labs", pesan, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ALIAS: Jika guru menekan tombol '▷ Jalankan' di toolbar atas Apps Script
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
  allRows.forEach(function(parsed) {
    var nama = parsed.nama;
    if (!nama || nama.toLowerCase().indexOf("percobaan") !== -1) return;
    var absen = parsed.absen || "-";
    var kelas = parsed.kelas || "-";
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

    var quizTitle = parsed.judulKuis || "";
    var modulName = parsed.modul || "";
    var score = parsed.skor; // Nilai Asli (0 - 100)
    var matched = identifyLabAndTask(modulName, quizTitle);

    var taskFullKey = matched.labId + "_" + matched.taskKey;
    if (studentsMap[key].scoresByTask[taskFullKey] === undefined || score > studentsMap[key].scoresByTask[taskFullKey].skor) {
      studentsMap[key].scoresByTask[taskFullKey] = {
        skor: score,
        waktu: parsed.waktu || "",
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
    SpreadsheetApp.getUi().alert("✅ Berhasil!\n\nSeluruh tab modul lab dan lembar '📊 Rekap Seluruh Lab' telah berhasil dibuat dengan 100% NILAI ASLI siswa.");
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
    "Rata-rata Nilai Asli",
    "Daftar Siswa yang Sudah Mengumpulkan (Lengkap dg Nilai Asli)",
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
      subCount + " Siswa",
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
  sheet.appendRow(["📋 BAGIAN 2: MATRIKS CEKLIS NILAI ASLI SISWA (STATUS PENGUMPULAN PER SISWA)"]);
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
  matrixHeaders.push("Total Tugas Selesai");
  matrixHeaders.push("Rata-rata Nilai Asli");
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
  var taskSubmissionCounts = [];
  var taskScoreSums = [];
  for (var ti = 0; ti < tasks.length; ti++) {
    taskSubmissionCounts.push(0);
    taskScoreSums.push(0);
  }

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
        // Tampilkan Nilai Asli Siswa
        if (rec.skor >= 75) {
          row.push(rec.skor + " (LULUS)");
        } else {
          row.push(rec.skor + " (REMEDIAL)");
        }
      } else {
        row.push("⏳ Belum");
      }
    });

    var studentAvg = finishedCount > 0 ? Math.round(studentScoreSum / finishedCount) : 0;
    row.push(finishedCount + " Tugas");
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
      } else if (val.indexOf("LULUS") !== -1) {
        cell.setBackground("#dcfce7");
        cell.setFontColor("#166534");
        cell.setFontWeight("bold");
      } else {
        cell.setBackground("#fee2e2");
        cell.setFontColor("#991b1b");
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
    footerRow.push(taskSubmissionCounts[idx] + " Siswa");
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
  sheet.setColumnWidth(matrixHeaders.length - 2, 140); // Total Tugas Selesai
  sheet.setColumnWidth(matrixHeaders.length - 1, 130); // Rata-rata Nilai Asli
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

      // Tampilkan Nilai Asli Rata-rata Modul Lab (misal: 85 (LULUS) atau ⏳ Belum)
      if (labFinished > 0) {
        var labAvg = Math.round(labScoreSum / labFinished);
        if (labAvg >= 75) {
          row.push(labAvg + " (LULUS)");
        } else {
          row.push(labAvg + " (REMEDIAL)");
        }
      } else {
        row.push("⏳ Belum");
      }
    });

    var overallAvg = overallFinished > 0 ? Math.round(overallScoreSum / overallFinished) : 0;
    row.push(overallFinished + " Tugas Selesai");
    row.push(overallAvg);
    row.push(overallFinished > 0 ? (overallAvg >= 75 ? "LULUS" : "REMEDIAL") : "BELUM ADA");

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
      if (val.indexOf("Belum") !== -1) {
        cell.setBackground("#f1f5f9");
        cell.setFontColor("#94a3b8");
      } else if (val.indexOf("LULUS") !== -1) {
        cell.setBackground("#dcfce7");
        cell.setFontColor("#166534");
        cell.setFontWeight("bold");
      } else {
        cell.setBackground("#fee2e2");
        cell.setFontColor("#991b1b");
        cell.setFontWeight("bold");
      }
    }

    var compCell = sheet.getRange(lr, headers.length);
    compCell.setFontWeight("bold");
    if (overallFinished > 0 && overallAvg >= 75) {
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
  sheet.setColumnWidth(headers.length - 2, 160);
  sheet.setColumnWidth(headers.length - 1, 140);
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

  if (text.indexOf("safety") !== -1 || text.indexOf("k3") !== -1) return { labId: "safety", taskKey: "safety_gen", taskName: q || "Praktik Safety K3" };
  if (text.indexOf("cutting") !== -1 || text.indexOf("potong") !== -1) return { labId: "cutting-tools", taskKey: "cutting_gen", taskName: q || "Praktik Alat Potong" };
  if (text.indexOf("heat") !== -1 || text.indexOf("panas") !== -1) return { labId: "heat-treatment", taskKey: "heat_gen", taskName: q || "Praktik Heat Treatment" };
  if (text.indexOf("mekanika") !== -1 || text.indexOf("mechanic") !== -1) return { labId: "mechanics", taskKey: "mech_gen", taskName: q || "Praktik Mekanika" };
  if (text.indexOf("weld") !== -1 || text.indexOf("las") !== -1) return { labId: "welding", taskKey: "weld_gen", taskName: q || "Praktik Pengelasan" };
  if (text.indexOf("ukur") !== -1 || text.indexOf("measur") !== -1) return { labId: "measuring", taskKey: "meas_gen", taskName: q || "Praktik Alat Ukur" };
  if (text.indexOf("design") !== -1 || text.indexOf("cad") !== -1) return { labId: "design", taskKey: "cad_gen", taskName: q || "Praktik Design Lab" };
  if (text.indexOf("bengkel") !== -1) return { labId: "virtual-bengkel", taskKey: "bengkel_gen", taskName: q || "Praktik Bengkel 3D" };
  if (text.indexOf("evaluasi") !== -1) return { labId: "evaluasi", taskKey: "evaluasi_final", taskName: "🎓 Evaluasi Akhir Komprehensif" };

  return { labId: "machine", taskKey: "machine_gen", taskName: q || "Praktik Machine Lab" };
}

/**
 * =============================================================================
 * 7. HELPER: PARSING DATA BARIS SECARA CERDAS & DETEKSI NILAI ASLI (0 - 100)
 * =============================================================================
 */
function parseRowData(row, headerMap) {
  var nama = "";
  var absen = "-";
  var kelas = "-";
  var sekolah = "-";
  var modul = "";
  var judulKuis = "";
  var skor = 0;
  var waktu = "";

  if (headerMap) {
    if (headerMap.waktu !== undefined) waktu = String(row[headerMap.waktu] || "");
    if (headerMap.nama !== undefined) nama = String(row[headerMap.nama] || "").trim();
    if (headerMap.absen !== undefined) absen = String(row[headerMap.absen] !== undefined ? row[headerMap.absen] : "-").trim();
    if (headerMap.kelas !== undefined) kelas = String(row[headerMap.kelas] || "-").trim();
    if (headerMap.sekolah !== undefined) sekolah = String(row[headerMap.sekolah] || "-").trim();
    if (headerMap.modul !== undefined) modul = String(row[headerMap.modul] || "").trim();
    if (headerMap.kuis !== undefined) judulKuis = String(row[headerMap.kuis] || "").trim();
    if (headerMap.nilai !== undefined) skor = Number(row[headerMap.nilai]);
  }

  if (!waktu) waktu = String(row[0] || "");
  if (!nama) nama = String(row[1] || row[2] || "").trim();
  if (absen === "-") absen = String(row[2] || "-").trim();
  if (kelas === "-") kelas = String(row[3] || "-").trim();
  if (!modul) modul = String(row[5] || "").trim();

  if (!judulKuis) {
    var candidate1 = String(row[7] || "").trim();
    var candidate2 = String(row[6] || "").trim();
    if (isNaN(Number(candidate1)) && candidate1.length > 3) {
      judulKuis = candidate1;
    } else if (isNaN(Number(candidate2)) && candidate2.length > 3) {
      judulKuis = candidate2;
    } else {
      judulKuis = candidate2 || candidate1;
    }
  }

  // DETEKSI NILAI ASLI SISWA (0 - 100):
  // 1. Ambil nilai dari kolom nilai (indeks 7 atau 8)
  var val7 = Number(row[7]);
  var val8 = Number(row[8]);
  var candidateScore = !isNaN(val7) ? val7 : (!isNaN(val8) ? val8 : skor);

  // Jika nilai berada pada rentang 15 s.d 100, gunakan langsung
  if (candidateScore >= 15 && candidateScore <= 100) {
    skor = candidateScore;
  } else if (candidateScore > 0 && candidateScore <= 10) {
    // Jika nilai tersimpan dalam skala 1-10 (misal benar 8 dari 10 soal), ubah ke skala 100
    skor = Math.round(candidateScore * 10);
  } else {
    // Scan kolom lain untuk menemukan nilai riil 0 - 100
    var found = false;
    for (var j = 6; j < Math.min(row.length, 11); j++) {
      var num = Number(row[j]);
      if (!isNaN(num) && num >= 15 && num <= 100) {
        skor = num;
        found = true;
        break;
      }
    }
    if (!found) {
      for (var k = 7; k < Math.min(row.length, 10); k++) {
        var n = Number(row[k]);
        if (!isNaN(n) && n > 0 && n <= 10) {
          skor = Math.round(n * 10);
          break;
        }
      }
    }
  }

  // Jaminan 100%: Nilai tidak boleh bernilai 1 - 10, harus skala 100
  if (skor > 0 && skor <= 10) {
    skor = Math.round(skor * 10);
  }

  return {
    waktu: waktu,
    nama: nama,
    absen: absen,
    kelas: kelas,
    sekolah: sekolah,
    modul: modul,
    judulKuis: judulKuis,
    skor: skor
  };
}

/**
 * =============================================================================
 * 8. HELPER: AMBIL SELURUH DATA BARIS DARI SPREADSHEET (TERTINGGI PER SISWA)
 * =============================================================================
 */
function getAllDataRows(ss) {
  var bestRows = {};
  var sheets = ss.getSheets();

  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    if (name.indexOf("📊") !== -1 || name.indexOf("🛡️") !== -1 || name.indexOf("⚙️") !== -1 || name.indexOf("🔪") !== -1 || name.indexOf("🌡️") !== -1 || name.indexOf("🔧") !== -1 || name.indexOf("⚡") !== -1 || name.indexOf("📏") !== -1 || name.indexOf("📐") !== -1 || name.indexOf("🏭") !== -1 || name.indexOf("🎓") !== -1 || name.indexOf("📋") !== -1) {
      return;
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    var headerRowIdx = -1;
    var headerMap = {};

    for (var i = 0; i < Math.min(data.length, 5); i++) {
      var row = data[i];
      var rowStr = row.join(" ").toLowerCase();
      if (rowStr.indexOf("nama") !== -1 && (rowStr.indexOf("nilai") !== -1 || rowStr.indexOf("kuis") !== -1 || rowStr.indexOf("skor") !== -1)) {
        headerRowIdx = i;
        for (var c = 0; c < row.length; c++) {
          var h = String(row[c] || "").toLowerCase().trim();
          if (h.indexOf("waktu") !== -1 || h.indexOf("tanggal") !== -1) headerMap.waktu = c;
          else if (h.indexOf("nama") !== -1 && h.indexOf("kuis") === -1) headerMap.nama = c;
          else if (h.indexOf("absen") !== -1) headerMap.absen = c;
          else if (h.indexOf("kelas") !== -1) headerMap.kelas = c;
          else if (h.indexOf("sekolah") !== -1) headerMap.sekolah = c;
          else if (h.indexOf("modul") !== -1 && h.indexOf("sub") === -1) headerMap.modul = c;
          else if (h.indexOf("kuis") !== -1 || h.indexOf("asesmen") !== -1) headerMap.kuis = c;
          else if (h.indexOf("nilai") !== -1 || h.indexOf("skor") !== -1) headerMap.nilai = c;
        }
        break;
      }
    }

    if (headerRowIdx === -1) return;

    for (var r = headerRowIdx + 1; r < data.length; r++) {
      var row = data[r];
      var parsed = parseRowData(row, headerMap);

      if (parsed.nama && parsed.judulKuis && parsed.nama.toLowerCase().indexOf("percobaan") === -1) {
        var studentKey = parsed.nama.toLowerCase() + "_" + parsed.judulKuis.toLowerCase();
        if (!bestRows[studentKey] || parsed.skor > bestRows[studentKey].skor) {
          bestRows[studentKey] = parsed;
        }
      }
    }
  });

  var result = Object.keys(bestRows).map(function(k) { return bestRows[k]; });

  if (result.length === 0) {
    var firstSheet = ss.getSheets()[0];
    var curData = firstSheet.getDataRange().getValues();
    for (var i = 1; i < curData.length; i++) {
      var parsedFallback = parseRowData(curData[i], null);
      if (parsedFallback.nama && parsedFallback.nama.toLowerCase().indexOf("percobaan") === -1) {
        result.push(parsedFallback);
      }
    }
  }

  return result;
}

/**
 * =============================================================================
 * 9. HELPER: CARI ATAU BUAT SHEET RAW DATA MASUK
 * =============================================================================
 */
function getOrCreateRawSheet(ss) {
  var rawName = "📥 Data Masuk (Raw Data)";
  var sheet = ss.getSheetByName(rawName);
  if (!sheet) {
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
      "Modul Laboratorium",
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
    sheet.setColumnWidth(6, 170);
    sheet.setColumnWidth(7, 240);
    sheet.setColumnWidth(8, 110);
    sheet.setColumnWidth(9, 110);
    sheet.setColumnWidth(10, 100);
    sheet.setColumnWidth(11, 110);
    sheet.setColumnWidth(12, 280);
  }

  return sheet;
}

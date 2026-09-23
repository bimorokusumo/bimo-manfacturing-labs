import{r as e}from"./rolldown-runtime-hePW80VL.js";import{s as t}from"./vendor-react-CrESwwka.js";import{c as n}from"./vendor-libs-CzXoy4to.js";import{a as r,c as i,d as a,g as o,h as s,i as c,l as ee,m as te,n as l,o as ne,p as re,s as ie,u}from"./index-DGycAZhw.js";var d=e(n(),1),f=t(),p=`/**
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
  var pesan = "CARA MENGGUNAKAN MENU BIMO LABS:

" +
    "1. Klik '📊 1. Buat Semua Tab Lab & Rekap Tugas (Sesuai Sidebar)':
" +
    "   Sistem otomatis membuat tab di bar bawah sesuai sidebar website:
" +
    "   🛡️ Safety Lab, ⚙️ Machine Lab, 🔪 Alat Pemotong, 🌡️ Heat Treatment, dll.

" +
    "2. Nilai yang ditampilkan adalah NILAI ASLI SISWA (Skala 0 - 100, misal: 80, 85, 90, 100).
" +
    "   - Bagian 1: Daftar tugas-tugas lab per row (lengkap dengan nama & nilai asli).
" +
    "   - Bagian 2: Matriks ceklis nilai siswa (Hijau = LULUS, Merah = REMEDIAL, Abu-abu = Belum).

" +
    "3. Tab '📊 Rekap Seluruh Lab' memperlihatkan nilai asli rata-rata tiap lab untuk seluruh siswa.

" +
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
    SpreadsheetApp.getUi().alert("✅ Berhasil!

Seluruh tab modul lab dan lembar '📊 Rekap Seluruh Lab' telah berhasil dibuat dengan 100% NILAI ASLI siswa.");
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
`,m=[{id:`all`,label:`Semua Modul`,icon:`📋`},{id:`safety`,label:`Safety Lab (K3)`,icon:`🛡️`},{id:`machine`,label:`Machine Lab`,icon:`⚙️`},{id:`cutting-tools`,label:`Alat Pemotong`,icon:`🔪`},{id:`heat-treatment`,label:`Heat Treatment`,icon:`🌡️`},{id:`mechanics`,label:`Mekanika Teknik`,icon:`🔧`},{id:`welding`,label:`Welding Lab`,icon:`⚡`},{id:`measuring`,label:`Alat Ukur Presisi`,icon:`📏`},{id:`design`,label:`Design Lab`,icon:`📐`},{id:`virtual-bengkel`,label:`Virtual Bengkel 3D`,icon:`🏭`},{id:`evaluasi`,label:`Evaluasi`,icon:`📝`}],ae={safety:[{id:`all`,label:`Semua Kuis Safety Lab`,icon:`📑`},{id:`apd`,label:`Kuis Inspeksi APD Operator`,icon:`🛡️`},{id:`diagnostic`,label:`Tes Diagnostik K3 (10 Soal)`,icon:`📋`},{id:`apar`,label:`Simulasi APAR P-A-S-S`,icon:`🧯`},{id:`5r`,label:`Budaya Kerja 5R & Etika DUDI`,icon:`🧹`},{id:`perkakas`,label:`SOP Perkakas Tangan`,icon:`🛠️`},{id:`jsa`,label:`Penyusunan JSA DUDI`,icon:`📋`},{id:`qc`,label:`Audit QC Benda Uji DUDI`,icon:`🔍`}],machine:[{id:`all`,label:`Semua Machine Lab`,icon:`📑`},{id:`diagnostic`,label:`Tes Diagnostik Machine Lab (10 Soal)`,icon:`📋`},{id:`pretest`,label:`Pre-Test Teori Permesinan`,icon:`📝`},{id:`cnc`,label:`Kuis Teori & Kode CNC`,icon:`💻`},{id:`lathe`,label:`Praktik Mesin Bubut`,icon:`⚙️`}],"cutting-tools":[{id:`all`,label:`Semua Alat Pemotong`,icon:`📑`},{id:`diagnostic`,label:`Tes Diagnostik Alat Potong (10 Soal)`,icon:`📋`},{id:`cutting_quiz`,label:`Kuis Pahat & Kalkulasi RPM`,icon:`🔪`}],"heat-treatment":[{id:`all`,label:`Semua Heat Treatment`,icon:`📑`},{id:`diagnostic`,label:`Tes Diagnostik Heat Treatment (10 Soal)`,icon:`📋`},{id:`metallurgy`,label:`Kuis Evaluasi Metalurgi`,icon:`🌡️`}],mechanics:[{id:`all`,label:`Semua Mekanika Teknik`,icon:`📑`},{id:`diagnostic`,label:`Tes Diagnostik Mekanika (10 Soal)`,icon:`📋`},{id:`torque`,label:`Kuis Momen Gaya & Torsi`,icon:`🔧`}],welding:[{id:`all`,label:`Semua Welding Lab`,icon:`📑`},{id:`diagnostic`,label:`Tes Diagnostik Welding Lab (10 Soal)`,icon:`📋`},{id:`smaw`,label:`Kuis Asesmen Las SMAW`,icon:`⚡`}],measuring:[{id:`all`,label:`Semua Alat Ukur`,icon:`📑`},{id:`diagnostic`,label:`Tes Diagnostik Alat Ukur (10 Soal)`,icon:`📋`},{id:`caliper_micrometer`,label:`Uji Pembacaan Kaliper & Mikrometer`,icon:`📏`}],design:[{id:`all`,label:`Semua Design Lab`,icon:`📑`},{id:`diagnostic`,label:`Tes Diagnostik Design Lab (10 Soal)`,icon:`📋`},{id:`cad_drawing`,label:`Kuis Gambar Teknik & CAD`,icon:`📐`}],"virtual-bengkel":[{id:`all`,label:`Semua Bengkel 3D`,icon:`📑`},{id:`diagnostic`,label:`Tes Diagnostik Bengkel 3D (10 Soal)`,icon:`📋`}],evaluasi:[{id:`all`,label:`Semua Evaluasi`,icon:`📑`},{id:`evaluasi_final`,label:`Evaluasi Akhir Komprehensif`,icon:`📝`}]},h=()=>{let[e,t]=(0,d.useState)([]),[n,h]=(0,d.useState)(``),[g,oe]=(0,d.useState)(``),[_,se]=(0,d.useState)(`all`),[v,y]=(0,d.useState)(`all`),[b,x]=(0,d.useState)(`grouped`),ce=b===`grouped`,[S,le]=(0,d.useState)(`quiz_name`),[C,ue]=(0,d.useState)(`safety`),[w,T]=(0,d.useState)(`all`),[de,fe]=(0,d.useState)(``),[pe,me]=(0,d.useState)(`I2`),[he,E]=(0,d.useState)(!1),[ge,D]=(0,d.useState)(!1),[_e,O]=(0,d.useState)(!1),[ve,k]=(0,d.useState)(!1),[A,ye]=(0,d.useState)(!1),[j,M]=(0,d.useState)(null),[N,P]=(0,d.useState)(``),[F,I]=(0,d.useState)(!1),[L,be]=(0,d.useState)(()=>u()),[R,z]=(0,d.useState)(``),B=e=>{te(e),be(u())},V=e=>{fe(e),setTimeout(()=>fe(``),3500)},xe=async()=>{l.playClick(),(await r(G)).success?(l.playSuccess(),window.open(`https://sheets.new`,`_blank`),O(!0)):V(`Gagal menyalin tabel. Silakan gunakan tombol Unduh Excel.`)},[Se,Ce]=(0,d.useState)(()=>new Date().toLocaleTimeString(`id-ID`)),H=()=>{let e=ee();t(e),h(a()),Ce(new Date().toLocaleTimeString(`id-ID`))};(0,d.useEffect)(()=>{H();let e=()=>H();window.addEventListener(`bimo:quiz_submitted`,e);let t=e=>{e.key===`bimo_quiz_scores`&&H()};window.addEventListener(`storage`,t);let n=setInterval(()=>{H()},3e3);return()=>{window.removeEventListener(`bimo:quiz_submitted`,e),window.removeEventListener(`storage`,t),clearInterval(n)}},[]);let U=(0,d.useMemo)(()=>e.map(e=>{let t=ne(e);return{...e,labId:t.labId,labLabel:t.labLabel,labIcon:t.labIcon,subId:t.subId,subLabel:e.subModul||e.jenisKuis||t.subLabel}}),[e]),we=e=>{l.playClick(),ue(e),T(`all`),y(`all`)},Te=e=>{l.playClick(),T(e),y(`all`)},W=(0,d.useMemo)(()=>{let e=C===`all`?U:U.filter(e=>e.labId===C),t=new Set;return e.forEach(e=>{let n=(e.judulKuis||``).trim();n&&t.add(n)}),Array.from(t).sort()},[U,C]),G=(0,d.useMemo)(()=>U.filter(e=>{let t=C===`all`||e.labId===C,n=w===`all`||e.subId===w,r=v===`all`||e.judulKuis&&e.judulKuis.trim()===v,i=g.toLowerCase(),a=!g.trim()||(e.namaSiswa||``).toLowerCase().includes(i)||String(e.nomorAbsen||``).includes(i)||(e.kelas||``).toLowerCase().includes(i)||(e.sekolah||``).toLowerCase().includes(i)||(e.judulKuis||``).toLowerCase().includes(i)||(e.subLabel||``).toLowerCase().includes(i),o=_===`all`||e.status===_;return t&&n&&r&&a&&o}),[U,C,w,v,g,_]),Ee=(0,d.useMemo)(()=>{let e={};return G.forEach(t=>{let n=(t.judulKuis||`Kuis Asesmen Terintegrasi`).trim();e[n]||(e[n]=[]),e[n].push(t)}),Object.keys(e).forEach(t=>{e[t].sort((e,t)=>S===`student_name`?(e.namaSiswa||``).localeCompare(t.namaSiswa||``):S===`highest_score`?(Number(t.skor)||0)-(Number(e.skor)||0):S===`newest_time`?new Date(t.timestamp||0)-new Date(e.timestamp||0):(e.namaSiswa||``).localeCompare(t.namaSiswa||``))}),Object.keys(e).sort((e,t)=>e.localeCompare(t)).map(t=>{let n=e[t],r=n.length>0?Math.round(n.reduce((e,t)=>e+(Number(t.skor)||0),0)/n.length):0,i=n.length>0?Math.max(...n.map(e=>Number(e.skor)||0)):0,a=n.filter(e=>e.status===`LULUS`||Number(e.skor)>=75).length;return{quizName:t,items:n,avgScore:r,maxScore:i,passedCount:a,passPct:n.length>0?Math.round(a/n.length*100):0,totalCount:n.length}})},[G,S]),K=(0,d.useMemo)(()=>{let e={},t=new Set;return(C===`all`?U:U.filter(e=>e.labId===C)).forEach(n=>{let r=(n.namaSiswa||``).trim(),i=(n.judulKuis||``).trim();if(!r||!i)return;t.add(i);let a=r.toLowerCase();e[a]||(e[a]={nama:r,nomorAbsen:n.nomorAbsen||`-`,kelas:n.kelas||`-`,sekolah:n.sekolah||`SMKN 2 Depok`,submissions:{}}),e[a].nomorAbsen===`-`&&n.nomorAbsen&&(e[a].nomorAbsen=n.nomorAbsen),e[a].kelas===`-`&&n.kelas&&(e[a].kelas=n.kelas);let o=e[a].submissions[i];(!o||Number(n.skor)>Number(o.skor))&&(e[a].submissions[i]={skor:Number(n.skor)||0,status:n.status||(Number(n.skor)>=75?`LULUS`:`REMEDIAL`),waktu:n.waktu||n.timestamp?.slice(0,10),jawabanBenar:n.jawabanBenar,totalSoal:n.totalSoal,record:n})}),{quizList:Array.from(t).sort(),studentList:Object.values(e).sort((e,t)=>{let n=parseInt(e.nomorAbsen,10),r=parseInt(t.nomorAbsen,10);return!isNaN(n)&&!isNaN(r)?n-r:e.nama.localeCompare(t.nama)})}},[U,C]),De=(0,d.useMemo)(()=>{let e=[...G];return S===`quiz_name`?e.sort((e,t)=>{let n=(e.judulKuis||``).localeCompare(t.judulKuis||``);return n===0?(e.namaSiswa||``).localeCompare(t.namaSiswa||``):n}):S===`student_name`?e.sort((e,t)=>(e.namaSiswa||``).localeCompare(t.namaSiswa||``)):S===`highest_score`?e.sort((e,t)=>(Number(t.skor)||0)-(Number(e.skor)||0)):S===`newest_time`&&e.sort((e,t)=>new Date(t.timestamp||0)-new Date(e.timestamp||0)),e},[G,S]),q=G.length,Oe=new Set(G.map(e=>`${e.namaSiswa}_${e.nomorAbsen}`)).size,J=q>0?Math.round(G.reduce((e,t)=>e+(Number(t.skor)||0),0)/q):0,Y=G.filter(e=>e.status===`LULUS`).length,X=q>0?Math.round(Y/q*100):0,ke=G.reduce((e,t)=>e+(Number(t.jawabanBenar)||0),0),Ae=G.reduce((e,t)=>e+(Number(t.totalSoal)||0),0),Z=e.filter(e=>!e.synced).length,Q=(0,d.useMemo)(()=>C===`all`?[]:ae[C]||[],[C]),$=(0,d.useMemo)(()=>{let e=m.find(e=>e.id===C),t=e?e.label:`Semua Modul`;if(w!==`all`){let e=Q.find(e=>e.id===w);return`${t} ➔ ${e?e.label:``}`}return t},[C,w,Q]);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`18px`,maxWidth:`1440px`,margin:`0 auto`,paddingBottom:`50px`},children:[de&&(0,f.jsxs)(`div`,{style:{position:`fixed`,top:`20px`,right:`20px`,zIndex:999999,background:`#064e3b`,color:`#ecfdf5`,border:`1.5px solid #10b981`,padding:`12px 20px`,borderRadius:`10px`,boxShadow:`0 8px 24px rgba(0,0,0,0.25)`,fontWeight:700,fontSize:`0.88rem`,display:`flex`,alignItems:`center`,gap:`10px`,animation:`fadeIn 0.2s ease-out`},children:[(0,f.jsx)(`span`,{children:`📗`}),(0,f.jsx)(`span`,{children:de})]}),(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{background:`linear-gradient(135deg, #064e3b 0%, #0f172a 100%)`,borderRadius:`16px`,padding:`24px 28px`,color:`#ffffff`,position:`relative`,overflow:`hidden`,boxShadow:`0 8px 32px rgba(6, 78, 59, 0.25)`,border:`1px solid rgba(16, 185, 129, 0.3)`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`flex-start`,flexWrap:`wrap`,gap:`16px`},children:[(0,f.jsxs)(`div`,{children:[(0,f.jsxs)(`div`,{style:{display:`inline-flex`,alignItems:`center`,gap:`8px`,background:`rgba(16, 185, 129, 0.25)`,border:`1.5px solid #10b981`,padding:`5px 14px`,borderRadius:`20px`,color:`#6ee7b7`,fontSize:`0.8rem`,fontWeight:800,marginBottom:`10px`},children:[(0,f.jsx)(`span`,{style:{display:`inline-block`,width:`9px`,height:`9px`,borderRadius:`50%`,background:`#10b981`,boxShadow:`0 0 10px #10b981`}}),(0,f.jsx)(`span`,{children:`LIVE SPREADSHEET MONITORING - REAL TIME`}),(0,f.jsx)(`span`,{style:{background:`#10b981`,color:`#064e3b`,padding:`1px 8px`,borderRadius:`10px`,fontSize:`0.7rem`,fontWeight:900},children:`TERHUBUNG`})]}),(0,f.jsx)(`h1`,{style:{fontSize:`1.75rem`,fontWeight:900,color:`#ffffff`,margin:0,fontFamily:`'Chakra Petch', sans-serif`,letterSpacing:`0.5px`},children:`REKAP NILAI SISWA (SMKN 2 DEPOK)`}),(0,f.jsxs)(`p`,{style:{color:`#cbd5e1`,fontSize:`0.88rem`,marginTop:`6px`,maxWidth:`800px`,lineHeight:1.5,margin:0},children:[`Pantau langsung hasil kuis seluruh siswa secara real-time di spreadsheet ini. Nilai otomatis masuk dan terkelompok rapi per modul lab & sub-kuis (seperti `,(0,f.jsx)(`strong`,{children:`Kuis Inspeksi APD`}),`) tanpa perlu rumus manual.`]})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`,alignItems:`center`},children:[(0,f.jsxs)(`button`,{onClick:()=>{l.playClick(),H(),V(`✅ Data nilai siswa berhasil diperbarui!`)},style:{background:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`,border:`none`,color:`#ffffff`,padding:`9px 15px`,borderRadius:`8px`,fontWeight:800,fontSize:`0.82rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`,boxShadow:`0 4px 12px rgba(2, 132, 199, 0.35)`},title:`Segarkan data nilai terbaru sekarang`,children:[(0,f.jsx)(`span`,{children:`🔄`}),(0,f.jsx)(`span`,{children:`Segarkan Data`})]}),(0,f.jsxs)(`div`,{style:{display:`inline-flex`,borderRadius:`8px`,overflow:`hidden`,boxShadow:`0 4px 14px rgba(16, 185, 129, 0.45)`},children:[(0,f.jsxs)(`a`,{href:L||`https://docs.google.com/spreadsheets/d/1-YH8PCzHIUv1B8I1dCj_XmcQ2c-jyAavPQfWGHYCUT4/edit?hl=id&gid=1804603706#gid=1804603706`,target:`_blank`,rel:`noopener noreferrer`,onClick:()=>{l.playClick(),V(`🌐 Membuka Google Spreadsheet Nilai Siswa (SMKN 2 Depok) di tab baru...`)},style:{background:`linear-gradient(135deg, #10b981 0%, #059669 100%)`,color:`#ffffff`,textDecoration:`none`,padding:`9px 16px`,fontWeight:800,fontSize:`0.82rem`,display:`flex`,alignItems:`center`,gap:`6px`},title:`Buka langsung Google Spreadsheet: ${L||`https://docs.google.com/spreadsheets/d/1-YH8PCzHIUv1B8I1dCj_XmcQ2c-jyAavPQfWGHYCUT4/edit?hl=id&gid=1804603706#gid=1804603706`}`,children:[(0,f.jsx)(`span`,{style:{fontSize:`1rem`},children:`↗️`}),(0,f.jsx)(`span`,{children:`Buka Google Sheets`})]}),(0,f.jsx)(`button`,{onClick:()=>{l.playClick(),z(L||`https://docs.google.com/spreadsheets/d/1-YH8PCzHIUv1B8I1dCj_XmcQ2c-jyAavPQfWGHYCUT4/edit?hl=id&gid=1804603706#gid=1804603706`),k(!0)},style:{background:`#047857`,border:`none`,borderLeft:`1px solid rgba(255, 255, 255, 0.25)`,color:`#ffffff`,padding:`9px 10px`,fontSize:`0.78rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`center`},title:`Pilihan & Pengaturan Tautan Google Spreadsheet`,children:`⚙️`})]}),(0,f.jsxs)(`button`,{onClick:()=>{l.playClick(),i(G)},style:{background:`rgba(255, 255, 255, 0.12)`,border:`1px solid rgba(255, 255, 255, 0.25)`,color:`#ffffff`,padding:`9px 14px`,borderRadius:`8px`,fontWeight:700,fontSize:`0.82rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},title:`Unduh tabel yang sedang aktif ke format Excel (.xls)`,children:[(0,f.jsx)(`span`,{children:`📥`}),(0,f.jsx)(`span`,{children:`Unduh Excel (.xls)`})]}),(0,f.jsxs)(`button`,{onClick:()=>{l.playClick(),ie(G)},style:{background:`rgba(255, 255, 255, 0.12)`,border:`1px solid rgba(255, 255, 255, 0.25)`,color:`#ffffff`,padding:`9px 14px`,borderRadius:`8px`,fontWeight:700,fontSize:`0.82rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},title:`Unduh format standar CSV`,children:[(0,f.jsx)(`span`,{children:`📄`}),(0,f.jsx)(`span`,{children:`Unduh CSV`})]}),(0,f.jsxs)(`button`,{onClick:async()=>{l.playClick();let e=await r(G);e.success&&l.playSuccess(),V(e.message)},style:{background:`rgba(245, 158, 11, 0.18)`,border:`1px solid #f59e0b`,color:`#fef3c7`,padding:`9px 14px`,borderRadius:`8px`,fontWeight:700,fontSize:`0.82rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},title:`Salin data lembar ini ke clipboard`,children:[(0,f.jsx)(`span`,{children:`📋`}),(0,f.jsx)(`span`,{children:`Salin Lembar Ini`})]}),(0,f.jsxs)(`button`,{onClick:()=>{l.playClick(),window.print()},style:{background:`rgba(255, 255, 255, 0.1)`,border:`1px solid rgba(255, 255, 255, 0.2)`,color:`#ffffff`,padding:`9px 14px`,borderRadius:`8px`,fontWeight:700,fontSize:`0.82rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},title:`Cetak atau simpan sebagai dokumen PDF resmi`,children:[(0,f.jsx)(`span`,{children:`🖨️`}),(0,f.jsx)(`span`,{children:`Cetak / PDF`})]})]})]}),(0,f.jsxs)(`div`,{style:{marginTop:`18px`,paddingTop:`14px`,borderTop:`1px solid rgba(255,255,255,0.12)`,display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`10px`,fontSize:`0.82rem`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`12px`,flexWrap:`wrap`},children:[(0,f.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:`6px`,color:`#6ee7b7`,fontWeight:800},children:[(0,f.jsx)(`span`,{children:`📍`}),(0,f.jsxs)(`span`,{children:[`Lembar Aktif: `,(0,f.jsx)(`strong`,{children:$})]})]}),(0,f.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,f.jsxs)(`span`,{style:{color:`#cbd5e1`},children:[`Guru Pengampu: `,(0,f.jsx)(`strong`,{children:`Bimoro Kusumo, S.Pd.`})]}),(0,f.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,f.jsxs)(`span`,{style:{color:`#cbd5e1`},children:[`Kelas: `,(0,f.jsx)(`strong`,{children:`X TPM 1 (Teknik Permesinan)`})]}),(0,f.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,f.jsxs)(`span`,{style:{color:`#6ee7b7`,fontSize:`0.78rem`},children:[`🕒 Pembaruan Terakhir: `,(0,f.jsxs)(`strong`,{children:[Se,` WIB`]})]})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,f.jsx)(`button`,{onClick:()=>{l.playClick(),i(U)},style:{background:`rgba(16, 185, 129, 0.2)`,border:`1px solid #10b981`,color:`#ecfdf5`,padding:`4px 10px`,borderRadius:`6px`,fontSize:`0.75rem`,fontWeight:700,cursor:`pointer`},title:`Unduh seluruh rekap semua modul lab sekaligus`,children:`📦 Unduh Seluruh Lab (.xls)`}),(0,f.jsx)(`button`,{onClick:()=>{l.playClick(),window.confirm(`PERINGATAN GURU:
Apakah Anda yakin ingin menghapus seluruh data nilai di perangkat ini?`)&&(c(),t([]),l.playSuccess(),V(`🗑️ Data lokal berhasil dibersihkan.`))},style:{background:`transparent`,border:`1px solid rgba(239, 68, 68, 0.4)`,color:`#fca5a5`,padding:`4px 10px`,borderRadius:`6px`,fontSize:`0.75rem`,fontWeight:700,cursor:`pointer`},title:`Bersihkan riwayat data nilai lokal di perangkat ini`,children:`🗑️ Reset Data`})]})]})]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`div`,{style:{fontSize:`0.75rem`,fontWeight:800,color:`var(--text-muted, #64748b)`,marginBottom:`6px`,textTransform:`uppercase`,letterSpacing:`0.5px`},children:`1. Pilih Modul Laboratorium (Sesuai Sidebar):`}),(0,f.jsx)(`div`,{style:{display:`flex`,gap:`6px`,overflowX:`auto`,paddingBottom:`4px`,borderBottom:`2px solid var(--border-light, #e2e8f0)`},children:m.map(e=>{let t=C===e.id,n=e.id===`all`?U.length:U.filter(t=>t.labId===e.id).length;return(0,f.jsxs)(`button`,{onClick:()=>we(e.id),style:{display:`flex`,alignItems:`center`,gap:`6px`,padding:`9px 15px`,borderRadius:`8px 8px 0 0`,border:t?`1.5px solid #10b981`:`1px solid #cbd5e1`,borderBottom:t?`3px solid #10b981`:`1px solid #cbd5e1`,background:t?`#064e3b`:`var(--bg-card, #ffffff)`,color:t?`#ffffff`:`var(--text-main, #0f172a)`,fontWeight:t?800:600,fontSize:`0.82rem`,cursor:`pointer`,whiteSpace:`nowrap`,transition:`all 0.15s`},children:[(0,f.jsx)(`span`,{children:e.icon}),(0,f.jsx)(`span`,{children:e.label}),(0,f.jsx)(`span`,{style:{background:t?`#10b981`:`#e2e8f0`,color:t?`#064e3b`:`#475569`,padding:`2px 7px`,borderRadius:`10px`,fontSize:`0.72rem`,fontWeight:800},children:n})]},e.id)})})]}),Q.length>0&&(0,f.jsxs)(`div`,{style:{background:`#f8fafc`,padding:`12px 16px`,borderRadius:`10px`,border:`1.5px solid #cbd5e1`,display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`8px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`,fontSize:`0.8rem`,fontWeight:800,color:`#0f172a`},children:[(0,f.jsx)(`span`,{children:`📑`}),(0,f.jsxs)(`span`,{children:[`2. Pilih Lembar Sub-Kuis Spesifik di `,(0,f.jsx)(`strong`,{children:$.split(` ➔ `)[0]}),`:`]})]}),(0,f.jsx)(`span`,{style:{fontSize:`0.74rem`,color:`#64748b`},children:(0,f.jsx)(`em`,{children:`Klik sub-kuis untuk mengisolasi nilainya tanpa tercampur dengan kuis lain`})})]}),(0,f.jsx)(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`},children:Q.map(e=>{let t=w===e.id,n=e.id===`all`?U.filter(e=>e.labId===C).length:U.filter(t=>t.labId===C&&t.subId===e.id).length;return(0,f.jsxs)(`button`,{onClick:()=>Te(e.id),style:{display:`flex`,alignItems:`center`,gap:`6px`,padding:`6px 12px`,borderRadius:`8px`,border:t?`1.5px solid #059669`:`1px solid #cbd5e1`,background:t?`#059669`:`#ffffff`,color:t?`#ffffff`:`#1e293b`,fontSize:`0.78rem`,fontWeight:t?800:600,cursor:`pointer`,transition:`all 0.15s`,boxShadow:t?`0 2px 6px rgba(5, 150, 105, 0.3)`:`none`},children:[(0,f.jsx)(`span`,{children:e.icon}),(0,f.jsx)(`span`,{children:e.label}),(0,f.jsx)(`span`,{style:{background:t?`#ffffff`:`#f1f5f9`,color:t?`#059669`:`#475569`,padding:`1px 6px`,borderRadius:`8px`,fontSize:`0.7rem`,fontWeight:800},children:n})]},e.id)})})]}),(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`10px 16px`,display:`flex`,alignItems:`center`,gap:`12px`,background:`var(--bg-card, #ffffff)`,borderRadius:`10px`,border:`1px solid var(--border-light, #e2e8f0)`,boxShadow:`0 2px 6px rgba(0,0,0,0.04)`},children:[(0,f.jsx)(`div`,{style:{padding:`4px 10px`,borderRadius:`6px`,background:`#f1f5f9`,border:`1px solid #cbd5e1`,fontFamily:`monospace`,fontSize:`0.82rem`,fontWeight:800,color:`#0f172a`},children:pe}),(0,f.jsx)(`div`,{style:{fontFamily:`serif`,fontStyle:`italic`,fontWeight:900,fontSize:`1.05rem`,color:`#64748b`},children:`fx`}),(0,f.jsxs)(`div`,{style:{flex:1,fontFamily:`monospace`,fontSize:`0.84rem`,color:`#0f172a`,background:`#f8fafc`,border:`1px solid #e2e8f0`,padding:`6px 12px`,borderRadius:`6px`,display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`6px`},children:[(0,f.jsxs)(`span`,{children:[(0,f.jsxs)(`strong`,{style:{color:`#059669`},children:[`=AVERAGE(I2:I`,G.length+1,`)`]}),(0,f.jsxs)(`span`,{style:{color:`#64748b`,marginLeft:`10px`},children:[`➔ Lembar: `,(0,f.jsx)(`strong`,{children:$}),` | Rata-rata Skor: `,(0,f.jsxs)(`strong`,{children:[J,` / 100`]})]})]}),(0,f.jsx)(`span`,{style:{fontSize:`0.76rem`,color:`#64748b`},children:`KKM Standar: 75`})]})]}),(0,f.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(220px, 1fr))`,gap:`14px`},children:[(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`16px 20px`,borderLeft:`4px solid #2563eb`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,f.jsx)(`span`,{style:{fontSize:`0.72rem`,fontWeight:800,color:`var(--text-muted)`,textTransform:`uppercase`},children:`Formula: =COUNTA(B2:B)`}),(0,f.jsx)(`span`,{style:{fontSize:`1.2rem`},children:`📝`})]}),(0,f.jsxs)(`div`,{style:{fontSize:`1.5rem`,fontWeight:900,color:`var(--text-main)`,marginTop:`4px`},children:[q,` `,(0,f.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:600,color:`#64748b`},children:`Siswa Mengerjakan`})]}),(0,f.jsxs)(`div`,{style:{fontSize:`0.75rem`,color:`#64748b`,marginTop:`2px`},children:[`Pada lembar: `,$]})]}),(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`16px 20px`,borderLeft:`4px solid #10b981`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,f.jsx)(`span`,{style:{fontSize:`0.72rem`,fontWeight:800,color:`var(--text-muted)`,textTransform:`uppercase`},children:`Formula: =COUNTUNIQUE(B2:B)`}),(0,f.jsx)(`span`,{style:{fontSize:`1.2rem`},children:`👥`})]}),(0,f.jsxs)(`div`,{style:{fontSize:`1.5rem`,fontWeight:900,color:`#10b981`,marginTop:`4px`},children:[Oe,` `,(0,f.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:600,color:`#64748b`},children:`Siswa Unik`})]}),(0,f.jsx)(`div`,{style:{fontSize:`0.75rem`,color:`#64748b`,marginTop:`2px`},children:`SMKN 2 Depok Jurusan TPM`})]}),(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`16px 20px`,borderLeft:`4px solid #f59e0b`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,f.jsx)(`span`,{style:{fontSize:`0.72rem`,fontWeight:800,color:`var(--text-muted)`,textTransform:`uppercase`},children:`Formula: =AVERAGE(I2:I)`}),(0,f.jsx)(`span`,{style:{fontSize:`1.2rem`},children:`⭐`})]}),(0,f.jsxs)(`div`,{style:{fontSize:`1.5rem`,fontWeight:900,color:J>=75?`#10b981`:`#f59e0b`,marginTop:`4px`},children:[J,` `,(0,f.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:600,color:`#64748b`},children:`/ 100`})]}),(0,f.jsx)(`div`,{style:{fontSize:`0.75rem`,color:`#64748b`,marginTop:`2px`},children:`Batas KKM Kelulusan: 75`})]}),(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`16px 20px`,borderLeft:`4px solid #8b5cf6`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,f.jsx)(`span`,{style:{fontSize:`0.72rem`,fontWeight:800,color:`var(--text-muted)`,textTransform:`uppercase`},children:`Formula: =COUNTIF(K:K, "LULUS")`}),(0,f.jsx)(`span`,{style:{fontSize:`1.2rem`},children:`🎯`})]}),(0,f.jsxs)(`div`,{style:{fontSize:`1.5rem`,fontWeight:900,color:X>=75?`#10b981`:`#ef4444`,marginTop:`4px`},children:[X,`% `,(0,f.jsxs)(`span`,{style:{fontSize:`0.8rem`,fontWeight:600,color:`#64748b`},children:[`(`,Y,`/`,q,`)`]})]}),(0,f.jsx)(`div`,{style:{fontSize:`0.75rem`,color:`#64748b`,marginTop:`2px`},children:`Siswa mencapai KKM kompetensi`})]})]}),(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`14px 18px`,display:`flex`,flexDirection:`column`,gap:`12px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`12px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`,flexWrap:`wrap`,flex:1,minWidth:`280px`},children:[(0,f.jsxs)(`div`,{style:{position:`relative`,flex:1,minWidth:`200px`},children:[(0,f.jsx)(`span`,{style:{position:`absolute`,left:`12px`,top:`50%`,transform:`translateY(-50%)`,color:`#94a3b8`},children:`🔍`}),(0,f.jsx)(`input`,{type:`text`,placeholder:`Cari nama siswa, nomor absen, kuis...`,value:g,onChange:e=>oe(e.target.value),style:{width:`100%`,padding:`8px 12px 8px 36px`,borderRadius:`8px`,border:`1px solid var(--border-light, #cbd5e1)`,fontSize:`0.84rem`,outline:`none`,background:`var(--bg-game, #f8fafc)`,color:`var(--text-main, #0f172a)`}})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,f.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:800,color:`#065f46`,whiteSpace:`nowrap`},children:`📋 Nama Kuis:`}),(0,f.jsxs)(`select`,{value:v,onChange:e=>{l.playClick(),y(e.target.value)},style:{padding:`8px 12px`,borderRadius:`8px`,border:`1.5px solid #10b981`,fontSize:`0.82rem`,background:`#ecfdf5`,color:`#065f46`,fontWeight:800,cursor:`pointer`,maxWidth:`300px`},title:`Saring tabel langsung berdasarkan satu Nama Kuis / Asesmen tertentu`,children:[(0,f.jsxs)(`option`,{value:`all`,children:[`Semua Nama Kuis (`,W.length,` Kuis)`]}),W.map(e=>{let t=U.filter(t=>(t.judulKuis||``).trim()===e&&(C===`all`||t.labId===C)).length;return(0,f.jsxs)(`option`,{value:e,children:[e,` (`,t,` Siswa)`]},e)})]})]}),(0,f.jsxs)(`select`,{value:_,onChange:e=>se(e.target.value),style:{padding:`8px 12px`,borderRadius:`8px`,border:`1px solid var(--border-light, #cbd5e1)`,fontSize:`0.82rem`,background:`var(--bg-game, #f8fafc)`,color:`var(--text-main, #0f172a)`,cursor:`pointer`},children:[(0,f.jsx)(`option`,{value:`all`,children:`Semua Status`}),(0,f.jsx)(`option`,{value:`LULUS`,children:`✓ LULUS (≥ 75)`}),(0,f.jsx)(`option`,{value:`REMEDIAL`,children:`✗ REMEDIAL (< 75)`})]}),(0,f.jsxs)(`select`,{value:S,onChange:e=>{l.playClick(),le(e.target.value)},style:{padding:`8px 12px`,borderRadius:`8px`,border:`1px solid var(--border-light, #cbd5e1)`,fontSize:`0.82rem`,background:`var(--bg-game, #f8fafc)`,color:`var(--text-main, #0f172a)`,cursor:`pointer`},children:[(0,f.jsx)(`option`,{value:`quiz_name`,children:`Urutkan: Nama Kuis (A-Z)`}),(0,f.jsx)(`option`,{value:`student_name`,children:`Urutkan: Nama Siswa (A-Z)`}),(0,f.jsx)(`option`,{value:`highest_score`,children:`Urutkan: Skor Tertinggi (100 ➔ 0)`}),(0,f.jsx)(`option`,{value:`newest_time`,children:`Urutkan: Waktu Terbaru`})]})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`4px`,background:`#f1f5f9`,padding:`3px`,borderRadius:`8px`,border:`1px solid #cbd5e1`},children:[(0,f.jsxs)(`button`,{onClick:()=>{l.playClick(),x(`grouped`)},style:{padding:`6px 12px`,borderRadius:`6px`,border:`none`,background:b===`grouped`?`#064e3b`:`transparent`,color:b===`grouped`?`#ffffff`:`#475569`,fontWeight:800,fontSize:`0.78rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`5px`},title:`Kelompokkan tabel rapi per Nama Kuis / Asesmen`,children:[(0,f.jsx)(`span`,{children:`📑`}),(0,f.jsx)(`span`,{children:`Dikelompokkan per Kuis`})]}),(0,f.jsxs)(`button`,{onClick:()=>{l.playClick(),x(`matrix`)},style:{padding:`6px 12px`,borderRadius:`6px`,border:`none`,background:b===`matrix`?`#064e3b`:`transparent`,color:b===`matrix`?`#ffffff`:`#475569`,fontWeight:800,fontSize:`0.78rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`5px`},title:`Tampilkan matriks ceklis pengumpulan siswa per kuis`,children:[(0,f.jsx)(`span`,{children:`📊`}),(0,f.jsx)(`span`,{children:`Matriks Pengumpulan Siswa`})]}),(0,f.jsxs)(`button`,{onClick:()=>{l.playClick(),x(`flat`)},style:{padding:`6px 12px`,borderRadius:`6px`,border:`none`,background:b===`flat`?`#064e3b`:`transparent`,color:b===`flat`?`#ffffff`:`#475569`,fontWeight:800,fontSize:`0.78rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`5px`},title:`Tampilkan tabel baris datar`,children:[(0,f.jsx)(`span`,{children:`📋`}),(0,f.jsx)(`span`,{children:`Tabel Datar`})]})]})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`8px`,fontSize:`0.78rem`,color:`#64748b`,borderTop:`1px solid #f1f5f9`,paddingTop:`8px`},children:[(0,f.jsx)(`div`,{children:b===`matrix`?(0,f.jsxs)(f.Fragment,{children:[`Menampilkan Matriks Rekap Pengumpulan: `,(0,f.jsx)(`strong`,{children:K.studentList.length}),` Siswa terdaftar pada `,(0,f.jsx)(`strong`,{children:K.quizList.length}),` Kuis di lembar `,(0,f.jsx)(`strong`,{children:$}),`.`]}):(0,f.jsxs)(f.Fragment,{children:[`Menampilkan `,(0,f.jsx)(`strong`,{children:G.length}),` data nilai siswa pada `,(0,f.jsx)(`strong`,{children:Ee.length}),` kelompok kuis di lembar `,(0,f.jsx)(`strong`,{children:$}),`.`]})}),v!==`all`&&(0,f.jsx)(`button`,{onClick:()=>y(`all`),style:{background:`transparent`,border:`none`,color:`#dc2626`,fontWeight:800,cursor:`pointer`,fontSize:`0.78rem`},children:`✕ Hapus Filter Kuis (Tampilkan Semua)`})]})]}),(0,f.jsx)(`div`,{className:`dashboard-card`,style:{overflow:`hidden`,padding:0,border:`1.5px solid #cbd5e1`,borderRadius:`12px`,boxShadow:`0 4px 16px rgba(0,0,0,0.06)`},children:(0,f.jsx)(`div`,{style:{overflowX:`auto`,maxHeight:`650px`},children:b===`matrix`?(0,f.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,textAlign:`left`,fontSize:`0.83rem`,fontFamily:`system-ui, -apple-system, sans-serif`},children:[(0,f.jsxs)(`thead`,{style:{position:`sticky`,top:0,zIndex:10},children:[(0,f.jsxs)(`tr`,{style:{background:`#f1f5f9`,color:`#64748b`,fontSize:`0.72rem`,borderBottom:`1px solid #cbd5e1`},children:[(0,f.jsx)(`th`,{style:{width:`45px`,padding:`6px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`#`}),(0,f.jsx)(`th`,{style:{padding:`6px 14px`,borderRight:`1px solid #cbd5e1`},children:`A`}),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`B`}),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`C`}),K.quizList.map((e,t)=>(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:String.fromCharCode(68+t)},t)),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`Σ Selesai`}),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`Rata-rata`}),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`},children:`Status`})]}),(0,f.jsxs)(`tr`,{style:{background:`#064e3b`,color:`#f0fdf4`,borderBottom:`2px solid #047857`},children:[(0,f.jsx)(`th`,{style:{padding:`12px 6px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,width:`45px`},children:`No`}),(0,f.jsx)(`th`,{style:{padding:`12px 16px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`,minWidth:`190px`},children:`Nama Lengkap Siswa`}),(0,f.jsx)(`th`,{style:{padding:`12px 10px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Absen`}),(0,f.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Kelas`}),K.quizList.map((e,t)=>(0,f.jsxs)(`th`,{style:{padding:`10px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,minWidth:`170px`,maxWidth:`220px`,fontSize:`0.78rem`},title:e,children:[(0,f.jsxs)(`div`,{style:{background:`rgba(255,255,255,0.18)`,padding:`2px 6px`,borderRadius:`4px`,marginBottom:`3px`,fontSize:`0.68rem`,display:`inline-block`},children:[`KUIS `,t+1]}),(0,f.jsx)(`div`,{style:{lineHeight:`1.25`},children:e})]},e)),(0,f.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Total Selesai`}),(0,f.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Rata-rata Skor`}),(0,f.jsx)(`th`,{style:{padding:`12px 14px`,textAlign:`center`,fontWeight:800,whiteSpace:`nowrap`},children:`Status`})]})]}),(0,f.jsx)(`tbody`,{children:K.studentList.length===0?(0,f.jsx)(`tr`,{children:(0,f.jsxs)(`td`,{colSpan:7+K.quizList.length,style:{padding:`50px 20px`,textAlign:`center`,color:`#64748b`,background:`#ffffff`},children:[(0,f.jsx)(`div`,{style:{fontSize:`2.5rem`,marginBottom:`8px`},children:`📂`}),(0,f.jsx)(`div`,{style:{fontWeight:800,fontSize:`1.05rem`,color:`#0f172a`},children:`Belum Ada Siswa yang Mengumpulkan Tugas`}),(0,f.jsx)(`p`,{style:{margin:`6px 0 0 0`,fontSize:`0.85rem`},children:`Data pengerjaan siswa untuk modul ini akan otomatis tercatat di sini saat siswa menekan tombol Kirim Nilai.`})]})}):K.studentList.map((e,t)=>{let n=Object.keys(e.submissions),r=n.length,i=K.quizList.length,a=n.reduce((t,n)=>t+(e.submissions[n]?.skor||0),0),o=r>0?Math.round(a/r):0,s=i>0&&r===i,c=t%2==0;return(0,f.jsxs)(`tr`,{style:{background:c?`#ffffff`:`#f8fafc`,borderBottom:`1px solid #e2e8f0`,transition:`background 0.15s`},onMouseEnter:e=>e.currentTarget.style.background=`#f0fdf4`,onMouseLeave:e=>e.currentTarget.style.background=c?`#ffffff`:`#f8fafc`,children:[(0,f.jsx)(`td`,{style:{padding:`10px 6px`,textAlign:`center`,fontFamily:`monospace`,color:`#64748b`,background:`#f1f5f9`,borderRight:`1px solid #cbd5e1`,fontWeight:700,fontSize:`0.78rem`},children:t+1}),(0,f.jsx)(`td`,{style:{padding:`10px 16px`,fontWeight:800,color:`#0f172a`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:e.nama}),(0,f.jsx)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,fontWeight:800,borderRight:`1px solid #e2e8f0`},children:(0,f.jsx)(`span`,{style:{background:`#f1f5f9`,padding:`2px 8px`,borderRadius:`4px`,border:`1px solid #e2e8f0`},children:e.nomorAbsen||`-`})}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,color:`#334155`,fontWeight:600,borderRight:`1px solid #e2e8f0`},children:e.kelas||`-`}),K.quizList.map(t=>{let n=e.submissions[t];if(!n)return(0,f.jsx)(`td`,{style:{padding:`8px 10px`,textAlign:`center`,borderRight:`1px solid #e2e8f0`,background:`#f8fafc`},children:(0,f.jsx)(`span`,{style:{color:`#94a3b8`,fontSize:`0.75rem`,fontWeight:600},children:`⏳ Belum`})},t);let r=n.status===`LULUS`||n.skor>=75;return(0,f.jsx)(`td`,{onClick:()=>{n.record&&(l.playClick(),M(n.record))},style:{padding:`8px 10px`,textAlign:`center`,borderRight:`1px solid #e2e8f0`,background:r?`rgba(220, 252, 231, 0.25)`:`rgba(254, 226, 226, 0.25)`,cursor:n.record?`pointer`:`default`},title:n.record?`Klik untuk lihat rincian lembar jawaban ${e.nama}`:``,children:(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`2px`},children:[(0,f.jsxs)(`span`,{style:{background:r?`#10b981`:`#ef4444`,color:`#ffffff`,padding:`2px 8px`,borderRadius:`10px`,fontWeight:900,fontSize:`0.78rem`},children:[r?`✓`:`✗`,` `,n.skor]}),n.jawabanBenar!==void 0&&(0,f.jsxs)(`span`,{style:{fontSize:`0.68rem`,color:`#64748b`},children:[n.jawabanBenar,`/`,n.totalSoal,` soal`]})]})},t)}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,fontWeight:800,borderRight:`1px solid #e2e8f0`},children:(0,f.jsxs)(`span`,{style:{padding:`3px 8px`,borderRadius:`6px`,background:s?`#dcfce7`:`#fef3c7`,color:s?`#166534`:`#92400e`,fontSize:`0.78rem`},children:[r,` / `,i,` Kuis`]})}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,fontFamily:`monospace`,fontWeight:900,fontSize:`0.95rem`,borderRight:`1px solid #e2e8f0`,color:o>=75?`#166534`:`#991b1b`},children:r>0?o:`-`}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`},children:(0,f.jsx)(`span`,{style:{padding:`3px 10px`,borderRadius:`12px`,fontSize:`0.72rem`,fontWeight:800,background:s?`#dcfce7`:r>0?`#fef3c7`:`#fee2e2`,color:s?`#166534`:r>0?`#92400e`:`#991b1b`,border:`1px solid ${s?`#bbf7d0`:r>0?`#fde68a`:`#fecaca`}`,display:`inline-block`},children:s?`✓ LENGKAP`:r>0?`SEBAGIAN`:`BELUM ADA`})})]},e.nama+t)})}),K.studentList.length>0&&(0,f.jsx)(`tfoot`,{style:{position:`sticky`,bottom:0,zIndex:10,background:`#f8fafc`,borderTop:`2px solid #064e3b`},children:(0,f.jsxs)(`tr`,{style:{fontWeight:800,fontSize:`0.8rem`,color:`#0f172a`},children:[(0,f.jsx)(`td`,{colSpan:4,style:{padding:`10px 14px`,textAlign:`right`,borderRight:`1px solid #cbd5e1`},children:`Total Siswa yang Sudah Mengumpulkan:`}),K.quizList.map(e=>{let t=K.studentList.filter(t=>t.submissions[e]).length,n=Math.round(t/K.studentList.length*100);return(0,f.jsxs)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`,color:`#065f46`},children:[(0,f.jsx)(`strong`,{children:t}),` Siswa (`,n,`%)`]},e)}),(0,f.jsxs)(`td`,{colSpan:3,style:{padding:`10px 14px`,textAlign:`center`,color:`#64748b`},children:[K.studentList.length,` Total Siswa Terdata`]})]})})]}):(0,f.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,textAlign:`left`,fontSize:`0.83rem`,fontFamily:`system-ui, -apple-system, sans-serif`},children:[(0,f.jsxs)(`thead`,{style:{position:`sticky`,top:0,zIndex:10},children:[(0,f.jsxs)(`tr`,{style:{background:`#f1f5f9`,color:`#64748b`,fontSize:`0.72rem`,borderBottom:`1px solid #cbd5e1`},children:[(0,f.jsx)(`th`,{style:{width:`40px`,padding:`6px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`#`}),(0,f.jsx)(`th`,{style:{padding:`6px 12px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`A`}),(0,f.jsx)(`th`,{style:{padding:`6px 14px`,borderRight:`1px solid #cbd5e1`},children:`B`}),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`C`}),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`D`}),(0,f.jsx)(`th`,{style:{padding:`6px 12px`,borderRight:`1px solid #cbd5e1`},children:`E`}),(0,f.jsx)(`th`,{style:{padding:`6px 12px`,borderRight:`1px solid #cbd5e1`},children:`F`}),(0,f.jsx)(`th`,{style:{padding:`6px 14px`,borderRight:`1px solid #cbd5e1`},children:`G`}),(0,f.jsx)(`th`,{style:{padding:`6px 16px`,borderRight:`1px solid #cbd5e1`},children:`H`}),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`I`}),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`J`}),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`K`}),(0,f.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`},children:`L`})]}),(0,f.jsxs)(`tr`,{style:{background:`#064e3b`,color:`#f0fdf4`,borderBottom:`2px solid #047857`},children:[(0,f.jsx)(`th`,{style:{padding:`12px 6px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,width:`40px`},children:`No`}),(0,f.jsx)(`th`,{style:{padding:`12px 14px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Waktu & Tanggal`}),(0,f.jsx)(`th`,{style:{padding:`12px 16px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Nama Siswa`}),(0,f.jsx)(`th`,{style:{padding:`12px 10px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Absen`}),(0,f.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Kelas`}),(0,f.jsx)(`th`,{style:{padding:`12px 14px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Sekolah`}),(0,f.jsx)(`th`,{style:{padding:`12px 14px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Modul Lab (Sidebar)`}),(0,f.jsx)(`th`,{style:{padding:`12px 14px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`,background:`#047857`},children:`Lembar / Sub-Kuis`}),(0,f.jsx)(`th`,{style:{padding:`12px 16px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Nama Kuis / Asesmen`}),(0,f.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Skor (0-100)`}),(0,f.jsx)(`th`,{style:{padding:`12px 10px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Benar / Total`}),(0,f.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Status KKM`}),(0,f.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,fontWeight:800,whiteSpace:`nowrap`},children:`Aksi`})]})]}),(0,f.jsx)(`tbody`,{children:G.length===0?(0,f.jsx)(`tr`,{children:(0,f.jsxs)(`td`,{colSpan:`13`,style:{padding:`50px 20px`,textAlign:`center`,color:`#64748b`,background:`#ffffff`},children:[(0,f.jsx)(`div`,{style:{fontSize:`2.5rem`,marginBottom:`8px`},children:`📂`}),(0,f.jsx)(`div`,{style:{fontWeight:800,fontSize:`1.05rem`,color:`#0f172a`},children:`Belum Ada Hasil Pengerjaan untuk Kategori Ini`}),(0,f.jsxs)(`p`,{style:{margin:`6px 0 16px 0`,fontSize:`0.85rem`},children:[`Belum ada siswa yang menyelesaikan kuis pada pilihan `,(0,f.jsxs)(`strong`,{children:[`"`,$,`"`]}),`.`]}),(0,f.jsx)(`div`,{style:{display:`flex`,gap:`8px`,justifyContent:`center`},children:(0,f.jsx)(`button`,{onClick:()=>{T(`all`),y(`all`)},style:{padding:`8px 16px`,borderRadius:`8px`,background:`#064e3b`,color:`#fff`,border:`none`,fontWeight:700,fontSize:`0.82rem`,cursor:`pointer`},children:`Lihat Semua Kuis di Modul Ini`})})]})}):ce?Ee.map((e,t)=>(0,f.jsxs)(d.Fragment,{children:[(0,f.jsx)(`tr`,{style:{background:`linear-gradient(90deg, #064e3b 0%, #0f172a 100%)`,color:`#ffffff`},children:(0,f.jsxs)(`td`,{colSpan:`13`,style:{padding:`12px 16px`,borderBottom:`2px solid #10b981`,borderTop:t>0?`6px solid #e2e8f0`:`none`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`8px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,f.jsx)(`span`,{style:{background:`#10b981`,color:`#064e3b`,padding:`2px 8px`,borderRadius:`6px`,fontWeight:900,fontSize:`0.72rem`},children:`KLASIFIKASI KUIS`}),(0,f.jsxs)(`strong`,{style:{fontSize:`0.98rem`,letterSpacing:`0.3px`,color:`#ffffff`},children:[`📋 `,e.quizName]})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`14px`,fontSize:`0.78rem`},children:[(0,f.jsxs)(`span`,{children:[`👥 `,(0,f.jsx)(`strong`,{children:e.totalCount}),` Siswa`]}),(0,f.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,f.jsxs)(`span`,{children:[`⭐ Rata-rata: `,(0,f.jsx)(`strong`,{children:e.avgScore}),`/100`]}),(0,f.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,f.jsxs)(`span`,{children:[`🏆 Tertinggi: `,(0,f.jsx)(`strong`,{children:e.maxScore})]}),(0,f.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,f.jsxs)(`span`,{style:{color:e.passPct>=75?`#6ee7b7`:`#fca5a5`},children:[`✅ Kelulusan KKM: `,(0,f.jsxs)(`strong`,{children:[e.passedCount,`/`,e.totalCount,` (`,e.passPct,`%)`]})]})]})]}),(0,f.jsxs)(`div`,{style:{marginTop:`8px`,paddingTop:`8px`,borderTop:`1px solid rgba(255, 255, 255, 0.15)`,display:`flex`,alignItems:`center`,flexWrap:`wrap`,gap:`6px`},children:[(0,f.jsxs)(`span`,{style:{fontSize:`0.72rem`,color:`#a7f3d0`,fontWeight:700,textTransform:`uppercase`,letterSpacing:`0.4px`},children:[`👤 Siswa yang Sudah Mengumpulkan (`,e.totalCount,` Siswa):`]}),e.items.map((e,t)=>{let n=e.status===`LULUS`||Number(e.skor)>=75;return(0,f.jsxs)(`span`,{onClick:()=>{l.playClick(),M(e)},style:{background:n?`rgba(16, 185, 129, 0.22)`:`rgba(239, 68, 68, 0.22)`,color:`#ffffff`,border:`1px solid ${n?`#10b981`:`#f87171`}`,padding:`2px 8px`,borderRadius:`12px`,fontSize:`0.75rem`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:`5px`,cursor:`pointer`},title:`Klik untuk lihat rincian lembar pengerjaan ${e.namaSiswa}`,children:[(0,f.jsx)(`span`,{children:e.namaSiswa}),(0,f.jsx)(`span`,{style:{background:n?`#10b981`:`#ef4444`,color:`#ffffff`,borderRadius:`6px`,padding:`0 5px`,fontSize:`0.68rem`,fontWeight:800},children:e.skor})]},e.id||t)})]})]})}),e.items.map((e,t)=>{let n=e.status===`LULUS`,r=t%2==0;return(0,f.jsxs)(`tr`,{onClick:()=>me(`I${t+2}`),style:{background:r?`#ffffff`:`#f8fafc`,borderBottom:`1px solid #e2e8f0`,transition:`background 0.15s`},onMouseEnter:e=>e.currentTarget.style.background=`#f0fdf4`,onMouseLeave:e=>e.currentTarget.style.background=r?`#ffffff`:`#f8fafc`,children:[(0,f.jsx)(`td`,{style:{padding:`10px 6px`,textAlign:`center`,fontFamily:`monospace`,color:`#64748b`,background:`#f1f5f9`,borderRight:`1px solid #cbd5e1`,fontWeight:700,fontSize:`0.78rem`},children:t+1}),(0,f.jsx)(`td`,{style:{padding:`10px 14px`,color:`#475569`,fontSize:`0.78rem`,whiteSpace:`nowrap`,borderRight:`1px solid #e2e8f0`},children:e.waktu||e.timestamp?.slice(0,10)}),(0,f.jsx)(`td`,{style:{padding:`10px 16px`,fontWeight:800,color:`#0f172a`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:e.namaSiswa}),(0,f.jsx)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,fontWeight:800,borderRight:`1px solid #e2e8f0`},children:(0,f.jsx)(`span`,{style:{background:`#f1f5f9`,padding:`2px 8px`,borderRadius:`4px`,border:`1px solid #e2e8f0`},children:e.nomorAbsen||`-`})}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,color:`#334155`,fontWeight:600,borderRight:`1px solid #e2e8f0`},children:e.kelas||`-`}),(0,f.jsx)(`td`,{style:{padding:`10px 14px`,color:`#475569`,fontSize:`0.8rem`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:e.sekolah||`SMKN 2 Depok`}),(0,f.jsx)(`td`,{style:{padding:`10px 14px`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:(0,f.jsxs)(`span`,{style:{fontWeight:800,color:`#065f46`,background:`rgba(16, 185, 129, 0.12)`,padding:`3px 8px`,borderRadius:`6px`,border:`1px solid rgba(16, 185, 129, 0.25)`,fontSize:`0.78rem`},children:[e.labIcon,` `,e.labLabel]})}),(0,f.jsx)(`td`,{style:{padding:`10px 14px`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:(0,f.jsx)(`span`,{style:{fontWeight:700,color:`#1e293b`,background:`#f1f5f9`,padding:`3px 8px`,borderRadius:`6px`,fontSize:`0.78rem`,border:`1px solid #e2e8f0`},children:e.subLabel})}),(0,f.jsx)(`td`,{style:{padding:`10px 16px`,borderRight:`1px solid #e2e8f0`},children:(0,f.jsx)(`div`,{style:{fontWeight:800,color:`#065f46`,fontSize:`0.84rem`},children:e.judulKuis})}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,fontFamily:`monospace`,fontWeight:900,fontSize:`1rem`,color:n?`#166534`:`#991b1b`,background:n?`rgba(220, 252, 231, 0.4)`:`rgba(254, 226, 226, 0.4)`,borderRight:`1px solid #e2e8f0`},children:e.skor}),(0,f.jsxs)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,color:`#475569`,fontWeight:700,borderRight:`1px solid #e2e8f0`},children:[e.jawabanBenar,` / `,e.totalSoal]}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,borderRight:`1px solid #e2e8f0`},children:(0,f.jsx)(`span`,{style:{padding:`3px 10px`,borderRadius:`12px`,fontSize:`0.72rem`,fontWeight:800,background:n?`#dcfce7`:`#fee2e2`,color:n?`#166534`:`#991b1b`,border:`1px solid ${n?`#bbf7d0`:`#fecaca`}`,display:`inline-block`},children:n?`✓ LULUS`:`✗ REMEDIAL`})}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`},children:(0,f.jsx)(`button`,{onClick:()=>{l.playClick(),M(e)},style:{background:`#f8fafc`,border:`1px solid #cbd5e1`,padding:`4px 10px`,borderRadius:`6px`,fontSize:`0.74rem`,cursor:`pointer`,color:`#0284c7`,fontWeight:800},children:`🔍 Rincian`})})]},e.id||t)}),(0,f.jsxs)(`tr`,{style:{background:`#ecfdf5`,fontWeight:800,fontSize:`0.8rem`,color:`#065f46`,borderBottom:`2px solid #10b981`},children:[(0,f.jsxs)(`td`,{colSpan:`9`,style:{padding:`9px 16px`,textAlign:`right`,borderRight:`1px solid #cbd5e1`},children:[`Subtotal Rata-rata Skor [`,(0,f.jsx)(`strong`,{children:e.quizName}),`]:`]}),(0,f.jsx)(`td`,{style:{padding:`9px 10px`,textAlign:`center`,fontFamily:`monospace`,fontSize:`0.98rem`,color:`#065f46`,borderRight:`1px solid #cbd5e1`},children:e.avgScore}),(0,f.jsxs)(`td`,{colSpan:`3`,style:{padding:`9px 14px`},children:[`Kelulusan KKM: `,(0,f.jsxs)(`strong`,{children:[e.passPct,`%`]}),` (`,e.passedCount,` dari `,e.totalCount,` Siswa)`]})]})]},e.quizName)):De.map((e,t)=>{let n=e.status===`LULUS`,r=t+2,i=t%2==0;return(0,f.jsxs)(`tr`,{onClick:()=>me(`I${r}`),style:{background:i?`#ffffff`:`#f8fafc`,borderBottom:`1px solid #e2e8f0`,transition:`background 0.15s`},onMouseEnter:e=>e.currentTarget.style.background=`#f0fdf4`,onMouseLeave:e=>e.currentTarget.style.background=i?`#ffffff`:`#f8fafc`,children:[(0,f.jsx)(`td`,{style:{padding:`10px 6px`,textAlign:`center`,fontFamily:`monospace`,color:`#64748b`,background:`#f1f5f9`,borderRight:`1px solid #cbd5e1`,fontWeight:700,fontSize:`0.78rem`},children:r}),(0,f.jsx)(`td`,{style:{padding:`10px 14px`,color:`#475569`,fontSize:`0.78rem`,whiteSpace:`nowrap`,borderRight:`1px solid #e2e8f0`},children:e.waktu||e.timestamp?.slice(0,10)}),(0,f.jsx)(`td`,{style:{padding:`10px 16px`,fontWeight:800,color:`#0f172a`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:e.namaSiswa}),(0,f.jsx)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,fontWeight:800,borderRight:`1px solid #e2e8f0`},children:(0,f.jsx)(`span`,{style:{background:`#f1f5f9`,padding:`2px 8px`,borderRadius:`4px`,border:`1px solid #e2e8f0`},children:e.nomorAbsen||`-`})}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,color:`#334155`,fontWeight:600,borderRight:`1px solid #e2e8f0`},children:e.kelas||`-`}),(0,f.jsx)(`td`,{style:{padding:`10px 14px`,color:`#475569`,fontSize:`0.8rem`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:e.sekolah||`SMKN 2 Depok`}),(0,f.jsx)(`td`,{style:{padding:`10px 14px`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:(0,f.jsxs)(`span`,{style:{fontWeight:800,color:`#065f46`,background:`rgba(16, 185, 129, 0.12)`,padding:`3px 8px`,borderRadius:`6px`,border:`1px solid rgba(16, 185, 129, 0.25)`,fontSize:`0.78rem`},children:[e.labIcon,` `,e.labLabel]})}),(0,f.jsx)(`td`,{style:{padding:`10px 14px`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:(0,f.jsx)(`span`,{style:{fontWeight:700,color:`#1e293b`,background:`#f1f5f9`,padding:`3px 8px`,borderRadius:`6px`,fontSize:`0.78rem`,border:`1px solid #e2e8f0`},children:e.subLabel})}),(0,f.jsx)(`td`,{style:{padding:`10px 16px`,borderRight:`1px solid #e2e8f0`},children:(0,f.jsx)(`div`,{style:{fontWeight:800,color:`#065f46`,fontSize:`0.84rem`},children:e.judulKuis})}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,fontFamily:`monospace`,fontWeight:900,fontSize:`1rem`,color:n?`#166534`:`#991b1b`,background:n?`rgba(220, 252, 231, 0.4)`:`rgba(254, 226, 226, 0.4)`,borderRight:`1px solid #e2e8f0`},children:e.skor}),(0,f.jsxs)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,color:`#475569`,fontWeight:700,borderRight:`1px solid #e2e8f0`},children:[e.jawabanBenar,` / `,e.totalSoal]}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,borderRight:`1px solid #e2e8f0`},children:(0,f.jsx)(`span`,{style:{padding:`3px 10px`,borderRadius:`12px`,fontSize:`0.72rem`,fontWeight:800,background:n?`#dcfce7`:`#fee2e2`,color:n?`#166534`:`#991b1b`,border:`1px solid ${n?`#bbf7d0`:`#fecaca`}`,display:`inline-block`},children:n?`✓ LULUS`:`✗ REMEDIAL`})}),(0,f.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`},children:(0,f.jsx)(`button`,{onClick:()=>{l.playClick(),M(e)},style:{background:`#f8fafc`,border:`1px solid #cbd5e1`,padding:`4px 10px`,borderRadius:`6px`,fontSize:`0.74rem`,cursor:`pointer`,color:`#0284c7`,fontWeight:800},children:`🔍 Rincian`})})]},e.id||t)})}),G.length>0&&(0,f.jsx)(`tfoot`,{style:{position:`sticky`,bottom:0,zIndex:10,background:`#f8fafc`,borderTop:`2px solid #064e3b`},children:(0,f.jsxs)(`tr`,{style:{fontWeight:800,fontSize:`0.82rem`,color:`#0f172a`},children:[(0,f.jsx)(`td`,{style:{padding:`12px 6px`,textAlign:`center`,background:`#e2e8f0`,borderRight:`1px solid #cbd5e1`,color:`#064e3b`},children:`Σ`}),(0,f.jsx)(`td`,{style:{padding:`12px 14px`,borderRight:`1px solid #cbd5e1`,color:`#64748b`},children:`=SUMMARY()`}),(0,f.jsxs)(`td`,{style:{padding:`12px 16px`,borderRight:`1px solid #cbd5e1`},children:[`Total: `,(0,f.jsxs)(`strong`,{style:{color:`#064e3b`},children:[G.length,` Siswa`]})]}),(0,f.jsx)(`td`,{style:{padding:`12px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`-`}),(0,f.jsx)(`td`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`-`}),(0,f.jsx)(`td`,{style:{padding:`12px 14px`,borderRight:`1px solid #cbd5e1`},children:`SMKN 2 Depok`}),(0,f.jsx)(`td`,{style:{padding:`12px 14px`,borderRight:`1px solid #cbd5e1`},children:`-`}),(0,f.jsx)(`td`,{style:{padding:`12px 14px`,borderRight:`1px solid #cbd5e1`,color:`#065f46`},children:w===`all`?`Semua Sub-Kuis`:$.split(` ➔ `)[1]}),(0,f.jsx)(`td`,{style:{padding:`12px 16px`,borderRight:`1px solid #cbd5e1`,color:`#64748b`},children:`=AVERAGE(I:I)`}),(0,f.jsx)(`td`,{style:{padding:`12px 12px`,textAlign:`center`,fontFamily:`monospace`,fontWeight:900,fontSize:`1.05rem`,color:J>=75?`#166534`:`#991b1b`,background:`#ecfdf5`,borderRight:`1px solid #cbd5e1`},children:J}),(0,f.jsxs)(`td`,{style:{padding:`12px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:[ke,` / `,Ae]}),(0,f.jsx)(`td`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:(0,f.jsxs)(`span`,{style:{color:`#166534`,fontWeight:900},children:[Y,` Lulus (`,X,`%)`]})}),(0,f.jsx)(`td`,{style:{padding:`12px 12px`,textAlign:`center`},children:(0,f.jsx)(`button`,{onClick:()=>{l.playClick(),i(G)},style:{padding:`4px 8px`,borderRadius:`4px`,background:`#10b981`,color:`#fff`,border:`none`,fontSize:`0.72rem`,fontWeight:800,cursor:`pointer`},children:`Unduh .xls`})})]})})]})})}),(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`12px 18px`,display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`12px`,background:`#f8fafc`,borderRadius:`10px`,border:`1px solid #cbd5e1`,fontSize:`0.82rem`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,f.jsx)(`span`,{style:{background:`#064e3b`,color:`#ffffff`,padding:`3px 8px`,borderRadius:`4px`,fontWeight:800},children:w===`all`?`SHEET 1`:w.toUpperCase()}),(0,f.jsxs)(`span`,{style:{fontWeight:700,color:`#334155`},children:[`Lembar Aktif: `,(0,f.jsx)(`strong`,{children:$}),` (SMKN 2 Depok - Kurikulum Merdeka)`]})]}),(0,f.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`14px`,color:`#64748b`},children:(0,f.jsxs)(`span`,{children:[`💡 `,(0,f.jsxs)(`em`,{children:[`Klik tombol `,(0,f.jsx)(`strong`,{children:`"Unduh Excel Lembar Ini (.xls)"`}),` untuk langsung mencetak atau mengolah nilai sub-kuis ini.`]})]})})]}),(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`18px 24px`,background:`var(--bg-card, #ffffff)`,border:`1px solid var(--border-light, #e2e8f0)`,borderRadius:`12px`},children:[(0,f.jsxs)(`div`,{onClick:()=>ye(!A),style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,cursor:`pointer`,userSelect:`none`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,f.jsx)(`span`,{style:{fontSize:`1.2rem`},children:`⚙️`}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`div`,{style:{fontWeight:800,fontSize:`0.92rem`,color:`var(--text-main, #0f172a)`},children:`Integrasi Cloud Otomatis ke Google Drive (Opsional)`}),(0,f.jsx)(`div`,{style:{fontSize:`0.78rem`,color:`#64748b`},children:`Spreadsheet di atas sudah siap digunakan langsung. Buka bagian ini HANYA jika Anda ingin hasil kuis otomatis dikirim ke Google Sheets di akun Google Anda.`})]})]}),(0,f.jsx)(`div`,{style:{fontSize:`1rem`,color:`#64748b`,fontWeight:800},children:A?`▲ Sembunyikan`:`▼ Lihat Pengaturan`})]}),A&&(0,f.jsxs)(`div`,{style:{marginTop:`20px`,paddingTop:`16px`,borderTop:`1px solid #e2e8f0`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,gap:`12px`,flexWrap:`wrap`,alignItems:`center`,marginBottom:`16px`},children:[(0,f.jsx)(`button`,{onClick:()=>{l.playClick(),D(!0)},style:{background:`#0284c7`,color:`#fff`,border:`none`,padding:`8px 16px`,borderRadius:`8px`,fontSize:`0.8rem`,fontWeight:800,cursor:`pointer`},children:`📋 Panduan & Salin Kode Apps Script`}),(0,f.jsx)(`button`,{onClick:()=>{l.playClick(),E(!0)},style:{background:n?`#10b981`:`#f59e0b`,color:`#fff`,border:`none`,padding:`8px 16px`,borderRadius:`8px`,fontSize:`0.8rem`,fontWeight:800,cursor:`pointer`},children:n?`🟢 Ganti URL Webhook`:`⚙️ Tempel URL Webhook`}),Z>0&&(0,f.jsxs)(`button`,{onClick:async()=>{l.playClick();let e=await o();H(),e.synced>0?(l.playSuccess(),alert(`Berhasil menyinkronkan ${e.synced} dari ${e.total} data ke Google Spreadsheet!`)):alert(`Tidak ada data tertunda yang berhasil disinkronkan. Pastikan URL Spreadsheet valid.`)},style:{background:`#d97706`,border:`none`,color:`#fff`,padding:`8px 14px`,borderRadius:`8px`,fontSize:`0.8rem`,fontWeight:800,cursor:`pointer`},children:[`🔄 Sinkronkan `,Z,` Nilai Tertunda`]})]}),(0,f.jsxs)(`div`,{style:{fontSize:`0.8rem`,color:`#64748b`},children:[`Target Webhook saat ini: `,(0,f.jsx)(`code`,{style:{background:`#f1f5f9`,padding:`2px 8px`,borderRadius:`4px`,color:n?`#059669`:`#dc2626`},children:n||`(Belum dipasang - Data tetap aman tersimpan di spreadsheet lab ini)`})]})]})]}),j&&(0,f.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,background:`rgba(0,0,0,0.7)`,zIndex:99999,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`20px`},children:(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{width:`100%`,maxWidth:`640px`,background:`#fff`,borderRadius:`16px`,padding:`26px`,maxHeight:`88vh`,overflowY:`auto`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`16px`,borderBottom:`1px solid #e2e8f0`,paddingBottom:`12px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,f.jsx)(`span`,{style:{fontSize:`1.3rem`},children:`🔍`}),(0,f.jsx)(`h3`,{style:{margin:0,fontSize:`1.15rem`,fontWeight:800,color:`#0f172a`},children:`Rincian Hasil Asesmen Siswa`})]}),(0,f.jsx)(`button`,{onClick:()=>M(null),style:{background:`transparent`,border:`none`,fontSize:`1.3rem`,cursor:`pointer`,color:`#64748b`},children:`✕`})]}),(0,f.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`12px`,fontSize:`0.85rem`,marginBottom:`16px`,background:`#f8fafc`,padding:`16px`,borderRadius:`10px`,border:`1px solid #e2e8f0`},children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`Nama Siswa:`}),` `,j.namaSiswa]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`No. Absen:`}),` `,j.nomorAbsen]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`Kelas / Jurusan:`}),` `,j.kelas]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`Sekolah:`}),` `,j.sekolah||`SMKN 2 Depok`]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`Modul Lab:`}),` `,j.labLabel||j.modul]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`Lembar Sub-Kuis:`}),` `,j.subLabel]}),(0,f.jsxs)(`div`,{style:{gridColumn:`span 2`},children:[(0,f.jsx)(`strong`,{children:`Nama Kuis / Asesmen:`}),` `,j.judulKuis]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`Skor Hasil:`}),` `,(0,f.jsxs)(`span`,{style:{fontWeight:900,fontSize:`1.05rem`,color:j.status===`LULUS`?`#16a34a`:`#dc2626`},children:[j.skor,` / 100`]})]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:`Status KKM:`}),` `,(0,f.jsx)(`span`,{style:{fontWeight:800,color:j.status===`LULUS`?`#16a34a`:`#dc2626`},children:j.status})]}),(0,f.jsxs)(`div`,{style:{gridColumn:`span 2`,fontSize:`0.8rem`,color:`#64748b`},children:[(0,f.jsx)(`strong`,{children:`Waktu Selesai:`}),` `,j.waktu]})]}),(0,f.jsxs)(`div`,{style:{marginBottom:`18px`},children:[(0,f.jsx)(`label`,{style:{display:`block`,fontWeight:800,fontSize:`0.85rem`,color:`#0f172a`,marginBottom:`6px`},children:`Rekaman Jawaban Soal:`}),(0,f.jsx)(`pre`,{style:{background:`#0f172a`,color:`#38bdf8`,padding:`14px`,borderRadius:`8px`,fontSize:`0.8rem`,overflowX:`auto`,whiteSpace:`pre-wrap`,maxHeight:`220px`,lineHeight:1.5},children:j.detailJawaban||`Tidak ada catatan jawaban tambahan.`})]}),(0,f.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:(0,f.jsx)(`button`,{onClick:()=>M(null),style:{padding:`8px 18px`,borderRadius:`8px`,background:`#0f172a`,color:`#fff`,border:`none`,cursor:`pointer`,fontWeight:800,fontSize:`0.85rem`},children:`Tutup`})})]})}),he&&(0,f.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,background:`rgba(0,0,0,0.7)`,zIndex:99999,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`20px`},children:(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{width:`100%`,maxWidth:`640px`,background:`#fff`,borderRadius:`16px`,padding:`28px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`16px`,borderBottom:`1px solid #e2e8f0`,paddingBottom:`12px`},children:[(0,f.jsxs)(`h3`,{style:{margin:0,fontSize:`1.2rem`,fontWeight:800,display:`flex`,alignItems:`center`,gap:`8px`,color:`#0f172a`},children:[(0,f.jsx)(`span`,{children:`⚙️`}),` Konfigurasi Webhook Google Spreadsheet`]}),(0,f.jsx)(`button`,{onClick:()=>E(!1),style:{background:`transparent`,border:`none`,fontSize:`1.2rem`,cursor:`pointer`,color:`#64748b`},children:`✕`})]}),(0,f.jsxs)(`p`,{style:{fontSize:`0.86rem`,color:`#475569`,lineHeight:1.5,margin:`0 0 14px 0`},children:[`Konfigurasikan integrasi Google Spreadsheet agar hasil kuis otomatis terkirim dan tombol `,(0,f.jsx)(`strong`,{children:`Buka Google Sheets`}),` langsung membuka file Anda.`]}),(0,f.jsxs)(`div`,{style:{background:`#f8fafc`,border:`1px solid #e2e8f0`,borderRadius:`10px`,padding:`12px 14px`,marginBottom:`14px`},children:[(0,f.jsxs)(`div`,{style:{fontSize:`0.8rem`,fontWeight:800,color:`#0f172a`,marginBottom:`8px`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,f.jsx)(`span`,{children:`📌`}),(0,f.jsx)(`span`,{children:`Tautan Cepat Membuka Google Sheets:`})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,gap:`10px`,flexWrap:`wrap`},children:[(0,f.jsx)(`a`,{href:`https://sheets.google.com`,target:`_blank`,rel:`noopener noreferrer`,style:{padding:`7px 12px`,background:`#0284c7`,color:`#ffffff`,borderRadius:`8px`,fontSize:`0.78rem`,fontWeight:700,textDecoration:`none`,display:`inline-flex`,alignItems:`center`,gap:`6px`},children:(0,f.jsx)(`span`,{children:`📂 Buka Daftar Sheets Anda (sheets.google.com) ↗`})}),(0,f.jsx)(`a`,{href:`https://sheets.new`,target:`_blank`,rel:`noopener noreferrer`,style:{padding:`7px 12px`,background:`#10b981`,color:`#ffffff`,borderRadius:`8px`,fontSize:`0.78rem`,fontWeight:700,textDecoration:`none`,display:`inline-flex`,alignItems:`center`,gap:`6px`},children:(0,f.jsx)(`span`,{children:`➕ Buat File Baru (sheets.new) ↗`})})]})]}),(0,f.jsxs)(`form`,{onSubmit:e=>{e.preventDefault(),l.playClick(),s(n),R!==void 0&&B(R),l.playSuccess(),P(`✅ Pengaturan berhasil disimpan!`),setTimeout(()=>{P(``),E(!1)},1200)},style:{display:`flex`,flexDirection:`column`,gap:`14px`},children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`label`,{style:{display:`block`,fontSize:`0.85rem`,fontWeight:800,marginBottom:`6px`,color:`#0f172a`},children:`🔗 Tautan Langsung Dokumen Spreadsheet Anda (Opsional):`}),(0,f.jsx)(`input`,{type:`url`,placeholder:`https://docs.google.com/spreadsheets/d/.../edit`,value:R!==void 0&&R!==``?R:L,onChange:e=>z(e.target.value),style:{width:`100%`,padding:`11px 13px`,borderRadius:`8px`,border:`1.5px solid #cbd5e1`,fontSize:`0.84rem`}}),(0,f.jsxs)(`div`,{style:{fontSize:`0.74rem`,color:`#64748b`,marginTop:`4px`},children:[`Saat diisi, tombol `,(0,f.jsx)(`strong`,{children:`↗️ Buka Google Sheets`}),` di toolbar akan langsung membuka file ini.`]})]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`label`,{style:{display:`block`,fontSize:`0.85rem`,fontWeight:800,marginBottom:`6px`,color:`#0f172a`},children:`⚡ URL Web App Google Apps Script (Webhook Pengirim Nilai):`}),(0,f.jsx)(`input`,{type:`url`,placeholder:`https://script.google.com/macros/s/AKfycb.../exec`,value:n,onChange:e=>h(e.target.value),style:{width:`100%`,padding:`12px 14px`,borderRadius:`8px`,border:`1.5px solid #cbd5e1`,fontSize:`0.85rem`,fontFamily:`monospace`}})]}),N&&(0,f.jsx)(`div`,{style:{padding:`10px 14px`,borderRadius:`8px`,background:`#f8fafc`,border:`1px solid #cbd5e1`,fontSize:`0.85rem`,color:`#0f172a`,fontWeight:600},children:N}),(0,f.jsxs)(`div`,{style:{display:`flex`,gap:`10px`,marginTop:`10px`},children:[(0,f.jsx)(`button`,{type:`button`,onClick:async()=>{if(!n.trim()){alert(`Silakan masukkan URL Webhook Google Apps Script terlebih dahulu.`);return}P(`Mengirim data uji coba...`),l.playClick();let e={waktu:new Date().toLocaleString(`id-ID`),namaSiswa:`Siswa Percobaan (Test)`,nomorAbsen:`99`,kelas:`X TPM 1`,sekolah:`SMKN 2 Depok`,modul:`Safety Lab`,subModul:`Kuis Inspeksi APD`,jenisKuis:`Kuis Inspeksi APD`,judulKuis:`Inspeksi APD Operator: Mesin Bubut Konvensional (Uji Coba)`,skor:100,jawabanBenar:1,totalSoal:1,status:`LULUS`,detailJawaban:`Tes koneksi webhook berhasil terhubung dari website BIMO Labs!`},t=await re(e);t.success?(l.playSuccess(),P(`✅ Berhasil terkirim! Silakan periksa Google Spreadsheet Anda.`)):(l.playError(),P(`⚠️ Gagal mengirim: ${t.error||t.reason||`Periksa kembali URL Webhook Anda`}`))},style:{padding:`10px 16px`,borderRadius:`8px`,background:`#f8fafc`,border:`1px solid #cbd5e1`,color:`#0f172a`,fontWeight:700,fontSize:`0.85rem`,cursor:`pointer`},children:`🧪 Uji Kirim Baris Tes`}),(0,f.jsx)(`button`,{type:`submit`,style:{flex:1,padding:`10px 16px`,borderRadius:`8px`,background:`linear-gradient(135deg, #10b981 0%, #059669 100%)`,color:`#ffffff`,border:`none`,fontWeight:800,fontSize:`0.85rem`,cursor:`pointer`},children:`Simpan Pengaturan`})]})]})]})}),ge&&(0,f.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,background:`rgba(0,0,0,0.8)`,zIndex:99999,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`20px`},children:(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{width:`100%`,maxWidth:`820px`,background:`#fff`,borderRadius:`18px`,padding:`28px`,maxHeight:`90vh`,overflowY:`auto`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`16px`,borderBottom:`1px solid #e2e8f0`,paddingBottom:`12px`},children:[(0,f.jsxs)(`h3`,{style:{margin:0,fontSize:`1.25rem`,fontWeight:800,display:`flex`,alignItems:`center`,gap:`8px`,color:`#0f172a`},children:[(0,f.jsx)(`span`,{children:`📋`}),` Kode Google Apps Script & Cara Pasang (Opsional)`]}),(0,f.jsx)(`button`,{onClick:()=>D(!1),style:{background:`transparent`,border:`none`,fontSize:`1.3rem`,cursor:`pointer`,color:`#64748b`},children:`✕`})]}),(0,f.jsxs)(`div`,{style:{background:`#f8fafc`,border:`1px solid #e2e8f0`,borderRadius:`12px`,padding:`16px`,marginBottom:`20px`,fontSize:`0.86rem`,lineHeight:1.6},children:[(0,f.jsx)(`div`,{style:{fontWeight:800,color:`#0f172a`,marginBottom:`8px`},children:`Langkah Pemasangan di Google Spreadsheet Pribadi:`}),(0,f.jsxs)(`ol`,{style:{margin:0,paddingLeft:`20px`,display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,f.jsxs)(`li`,{children:[`Buka `,(0,f.jsx)(`strong`,{children:`https://sheets.new`}),` di tab baru untuk membuat spreadsheet kosong.`]}),(0,f.jsxs)(`li`,{children:[`Klik menu `,(0,f.jsx)(`strong`,{children:`Ekstensi (Extensions)`}),` ➔ pilih `,(0,f.jsx)(`strong`,{children:`Apps Script`}),`.`]}),(0,f.jsxs)(`li`,{children:[`Hapus kode lama, lalu klik tombol `,(0,f.jsx)(`strong`,{children:`"Salin Kode Apps Script"`}),` di bawah dan tempelkan.`]}),(0,f.jsxs)(`li`,{children:[`Klik `,(0,f.jsx)(`strong`,{children:`Simpan`}),` (ikon disket), lalu klik tombol biru `,(0,f.jsx)(`strong`,{children:`Terapkan (Deploy)`}),` ➔ `,(0,f.jsx)(`strong`,{children:`Penerapan baru`}),`.`]}),(0,f.jsxs)(`li`,{children:[`Pilih jenis `,(0,f.jsx)(`strong`,{children:`Aplikasi web`}),`, ubah `,(0,f.jsx)(`em`,{children:`Yang memiliki akses`}),` menjadi: `,(0,f.jsx)(`strong`,{children:`Siapa saja (Anyone)`}),`.`]}),(0,f.jsxs)(`li`,{children:[`Salin URL Web App yang berakhiran `,(0,f.jsx)(`code`,{children:`/exec`}),` lalu tempelkan di menu pengaturan webhook.`]})]})]}),(0,f.jsxs)(`div`,{style:{position:`relative`,marginBottom:`20px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,background:`#1e293b`,color:`#cbd5e1`,padding:`10px 16px`,borderTopLeftRadius:`10px`,borderTopRightRadius:`10px`,fontSize:`0.8rem`},children:[(0,f.jsx)(`span`,{style:{fontWeight:700},children:`Code.gs (Google Apps Script)`}),(0,f.jsx)(`button`,{onClick:()=>{l.playClick(),navigator.clipboard.writeText(p),I(!0),setTimeout(()=>I(!1),2500)},style:{background:F?`#10b981`:`#f59e0b`,color:`#fff`,border:`none`,padding:`6px 14px`,borderRadius:`6px`,fontWeight:800,fontSize:`0.78rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:F?`✓ Kode Berhasil Disalin!`:`📋 Salin Kode Apps Script`})]}),(0,f.jsx)(`pre`,{style:{background:`#0f172a`,color:`#93c5fd`,padding:`16px`,borderBottomLeftRadius:`10px`,borderBottomRightRadius:`10px`,fontSize:`0.76rem`,overflowX:`auto`,maxHeight:`280px`,margin:0,fontFamily:`monospace`},children:p})]}),(0,f.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:(0,f.jsx)(`button`,{onClick:()=>{D(!1),E(!0)},style:{padding:`10px 18px`,borderRadius:`8px`,background:`#10b981`,color:`#fff`,border:`none`,fontWeight:800,fontSize:`0.85rem`,cursor:`pointer`},children:`Lanjut Masukkan URL Webhook ➔`})})]})}),_e&&(0,f.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,background:`rgba(0,0,0,0.75)`,zIndex:999999,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`20px`},children:(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{width:`100%`,maxWidth:`620px`,background:`#fff`,borderRadius:`18px`,padding:`28px`,boxShadow:`0 20px 40px rgba(0,0,0,0.3)`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`16px`,borderBottom:`1px solid #e2e8f0`,paddingBottom:`12px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,f.jsx)(`span`,{style:{fontSize:`1.4rem`},children:`📋`}),(0,f.jsx)(`h3`,{style:{margin:0,fontSize:`1.2rem`,fontWeight:900,color:`#0f172a`},children:`Data Nilai Berhasil Disalin! Buka Google Sheets & Paste`})]}),(0,f.jsx)(`button`,{onClick:()=>O(!1),style:{background:`transparent`,border:`none`,fontSize:`1.3rem`,cursor:`pointer`,color:`#64748b`},children:`✕`})]}),(0,f.jsxs)(`div`,{style:{background:`#ecfdf5`,border:`1.5px solid #10b981`,borderRadius:`12px`,padding:`16px`,marginBottom:`18px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`,color:`#065f46`,fontWeight:800,fontSize:`0.95rem`,marginBottom:`6px`},children:[(0,f.jsx)(`span`,{children:`✅`}),(0,f.jsx)(`span`,{children:`Data Siswa Bapak Tetap Aman & Tidak Hilang!`})]}),(0,f.jsxs)(`p`,{style:{margin:0,fontSize:`0.86rem`,color:`#047857`,lineHeight:1.5},children:[`Tautan `,(0,f.jsx)(`em`,{children:`sheets.new`}),` membuka dokumen baru yang masih kosong dari Google. Sebanyak `,(0,f.jsxs)(`strong`,{children:[G.length,` data nilai siswa`]}),` pada lembar ini sudah otomatis disalin ke memori komputer Anda.`]})]}),(0,f.jsxs)(`div`,{style:{background:`#f8fafc`,border:`1px solid #e2e8f0`,borderRadius:`12px`,padding:`16px`,marginBottom:`20px`,fontSize:`0.88rem`,lineHeight:1.6},children:[(0,f.jsx)(`div`,{style:{fontWeight:800,color:`#0f172a`,marginBottom:`8px`},children:`Langkah Mudah Menempelkan Data di Tab Google Sheets:`}),(0,f.jsxs)(`ol`,{style:{margin:0,paddingLeft:`20px`,display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,f.jsxs)(`li`,{children:[`Buka `,(0,f.jsx)(`strong`,{children:`tab baru Google Sheets`}),` yang baru saja terbuka di sebelah tab ini.`]}),(0,f.jsxs)(`li`,{children:[`Klik pada sel `,(0,f.jsx)(`strong`,{children:`A1`}),` (kotak paling kiri atas).`]}),(0,f.jsxs)(`li`,{children:[`Tekan tombol keyboard:`,(0,f.jsxs)(`div`,{style:{marginTop:`4px`},children:[(0,f.jsx)(`kbd`,{style:{background:`#e2e8f0`,border:`1px solid #cbd5e1`,padding:`3px 8px`,borderRadius:`6px`,fontWeight:800,color:`#0f172a`,fontFamily:`monospace`},children:`Cmd + V`}),` (di Mac) atau `,(0,f.jsx)(`kbd`,{style:{background:`#e2e8f0`,border:`1px solid #cbd5e1`,padding:`3px 8px`,borderRadius:`6px`,fontWeight:800,color:`#0f172a`,fontFamily:`monospace`},children:`Ctrl + V`}),` (di Windows).`]})]}),(0,f.jsx)(`li`,{children:`Selesai! Seluruh tabel nilai akan langsung tertempel rapi dengan kolom dan skor lengkap.`})]})]}),(0,f.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:(0,f.jsx)(`button`,{onClick:()=>O(!1),style:{padding:`10px 22px`,borderRadius:`8px`,background:`linear-gradient(135deg, #10b981 0%, #059669 100%)`,color:`#fff`,border:`none`,fontWeight:800,fontSize:`0.88rem`,cursor:`pointer`,boxShadow:`0 4px 12px rgba(16, 185, 129, 0.35)`},children:`Saya Mengerti, Tutup Panduan`})})]})}),ve&&(0,f.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,background:`rgba(0,0,0,0.75)`,zIndex:999999,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`20px`},children:(0,f.jsxs)(`div`,{className:`dashboard-card`,style:{width:`100%`,maxWidth:`580px`,background:`#ffffff`,borderRadius:`16px`,padding:`26px`,boxShadow:`0 20px 40px rgba(0,0,0,0.35)`,color:`#0f172a`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`18px`,borderBottom:`1px solid #e2e8f0`,paddingBottom:`12px`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,f.jsx)(`span`,{style:{fontSize:`1.5rem`},children:`📊`}),(0,f.jsx)(`h3`,{style:{margin:0,fontSize:`1.2rem`,fontWeight:900,color:`#0f172a`},children:`Akses Google Sheets (SMKN 2 Depok)`})]}),(0,f.jsx)(`button`,{onClick:()=>k(!1),style:{background:`transparent`,border:`none`,fontSize:`1.3rem`,cursor:`pointer`,color:`#64748b`},children:`✕`})]}),(0,f.jsxs)(`p`,{style:{fontSize:`0.88rem`,color:`#475569`,lineHeight:1.5,margin:`0 0 18px 0`},children:[`Pilih cara membuka spreadsheet atau tautkan URL Google Spreadsheet yang biasa Anda gunakan agar tombol `,(0,f.jsx)(`strong`,{children:`Buka Google Sheets`}),` langsung menuju dokumen nilai Anda.`]}),(0,f.jsxs)(`div`,{style:{background:`#f8fafc`,border:`1.5px solid #cbd5e1`,borderRadius:`12px`,padding:`16px`,marginBottom:`16px`},children:[(0,f.jsx)(`label`,{style:{display:`block`,fontWeight:800,fontSize:`0.86rem`,color:`#0f172a`,marginBottom:`6px`},children:`🔗 Tautan Langsung Google Spreadsheet Anda:`}),(0,f.jsxs)(`div`,{style:{display:`flex`,gap:`8px`},children:[(0,f.jsx)(`input`,{type:`url`,placeholder:`https://docs.google.com/spreadsheets/d/.../edit`,value:R!==void 0&&R!==``?R:L,onChange:e=>z(e.target.value),style:{flex:1,padding:`9px 12px`,borderRadius:`8px`,border:`1.5px solid #94a3b8`,fontSize:`0.84rem`}}),(0,f.jsx)(`button`,{onClick:()=>{l.playClick();let e=R!==void 0&&R!==``?R:L;B(e),e&&e.trim().startsWith(`http`)?(window.open(e.trim(),`_blank`),k(!1),V(`✅ Tautan disimpan & Spreadsheet dibuka!`)):V(`✅ Pengaturan tautan diperbarui!`)},style:{padding:`9px 16px`,borderRadius:`8px`,background:`#10b981`,color:`#ffffff`,border:`none`,fontWeight:800,fontSize:`0.82rem`,cursor:`pointer`,whiteSpace:`nowrap`},children:`Simpan & Buka ↗`})]}),(0,f.jsx)(`div`,{style:{fontSize:`0.75rem`,color:`#64748b`,marginTop:`6px`},children:`💡 Tempelkan link file Spreadsheet Anda di sini. Tombol di toolbar akan langsung membuka file ini setiap kali diklik.`})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`10px`},children:[(0,f.jsx)(`div`,{style:{fontWeight:800,fontSize:`0.84rem`,color:`#334155`},children:`Atau Buka Cepat:`}),(0,f.jsxs)(`button`,{onClick:()=>{l.playClick(),window.open(`https://docs.google.com/spreadsheets/u/0/`,`_blank`),k(!1)},style:{width:`100%`,padding:`12px 16px`,borderRadius:`10px`,background:`rgba(2, 132, 199, 0.08)`,border:`1.5px solid #0284c7`,color:`#0369a1`,fontWeight:800,fontSize:`0.86rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`space-between`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,f.jsx)(`span`,{children:`📂`}),(0,f.jsx)(`span`,{children:`Buka Beranda Google Sheets (docs.google.com)`})]}),(0,f.jsx)(`span`,{children:`↗`})]}),(0,f.jsxs)(`button`,{onClick:()=>{k(!1),xe()},style:{width:`100%`,padding:`12px 16px`,borderRadius:`10px`,background:`rgba(16, 185, 129, 0.08)`,border:`1.5px solid #10b981`,color:`#065f46`,fontWeight:800,fontSize:`0.86rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`space-between`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,f.jsx)(`span`,{children:`➕`}),(0,f.jsx)(`span`,{children:`Buat File Baru (sheets.new) & Salin Otomatis Tabel Ini`})]}),(0,f.jsx)(`span`,{children:`↗`})]})]}),(0,f.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,marginTop:`20px`},children:(0,f.jsx)(`button`,{onClick:()=>k(!1),style:{padding:`8px 18px`,borderRadius:`8px`,background:`#e2e8f0`,color:`#475569`,border:`none`,fontWeight:700,fontSize:`0.84rem`,cursor:`pointer`},children:`Tutup`})})]})})]})};export{h as default};
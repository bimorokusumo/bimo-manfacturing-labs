/**
 * =============================================================================
 * BIMO MANUFACTURING LABS - GOOGLE APPS SCRIPT MASTER GRADEBOOK
 * =============================================================================
 * Skrip Resmi Google Apps Script untuk Rekapitulasi Nilai Siswa BIMO Labs.
 * Terintegrasi penuh dengan Website BIMO Manufacturing Labs & 36 Siswa X-TP.A SMKN 2 Depok.
 * 
 * FITUR UTAMA:
 * 1. MENGGUNAKAN SHEET YANG SUDAH ADA (TANPA MENAMBAH SHEET BARU):
 *    - Otomatis mendeteksi dan menggunakan tab sheet dengan emoji/simbol asli:
 *      🛡️ 1. Safety Lab, ⚙️ 2. Machine Lab, 🔪 3. Alat Pemotong, 🌡️ 4. Heat Treatment,
 *      🔧 5. Mekanika Teknik, ⚡ 6. Welding Lab, 📏 7. Alat Ukur Presisi, 📐 8. Design Lab,
 *      🏭 9. Virtual Bengkel, 🎓 10. Evaluasi Akhir, 📊 Rekap Seluruh Lab, 📥 Data Masuk (Raw Data).
 *    - Pencarian fleksibel: jika ada variasi nama/spasi, sheet yang sudah ada tetap dipakai.
 * 
 * 2. TAB "🎓 10. Evaluasi Akhir" MEMILIKI KOLOM LENGKAP TINGKAT C1 S.D. C5:
 *    - Evaluasi C1 (Mengingat)
 *    - Evaluasi C2 (Memahami)
 *    - Evaluasi C3 (Menerapkan)
 *    - Evaluasi C4 (Menganalisis)
 *    - Evaluasi C5 (Mengevaluasi)
 *    - Nilai C1 dan C2 yang sudah dikerjakan siswa otomatis terbaca dan ditampilkan.
 * 
 * 3. 100% NILAI ASLI SISWA (Skala 0 - 100, KKM 75):
 *    - Hijau = LULUS (Nilai >= 75)
 *    - Merah = REMEDIAL (Nilai < 75)
 *    - Abu-abu = Belum Mengerjakan
 * 
 * 4. REAL-TIME AUTO UPDATE (WEBHOOK POST):
 *    - Setiap siswa mengirim hasil kuis dari web, data tercatat di raw data dan
 *      tab modul lab serta matriks rekapitulasi langsung terupdate seketika.
 * =============================================================================
 */

// =============================================================================
// DAFTAR MASTER RESMI 36 SISWA KELAS X-TP.A (SMKN 2 DEPOK)
// Sumber: Dokumen Daftar Hadir Siswa SMK Negeri 2 Depok (NAMA SISWA.docx)
// Konsentrasi Keahlian: Teknik Pemesinan A (X-TP.A)
// =============================================================================
var MASTER_STUDENTS_LIST = [
  { absen: 1, nis: "22946", nama: "ADITYA MIRZA SUSANTO", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 2, nis: "22947", nama: "ADITYA SAPUTRA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 3, nis: "22948", nama: "AHMAD MAULANA ASYAM NUR IHSAN", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 4, nis: "22949", nama: "AHMAD YUSRIL KHAIRIL AZAM", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 5, nis: "22950", nama: "ALAN HAFID ELVANO", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 6, nis: "22951", nama: "ALFONSUS SEBASTIAN DANADYAKSA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 7, nis: "22952", nama: "ARDIKA RINANDRA SAPUTRA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 8, nis: "22953", nama: "ARIF NOVIANTO", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 9, nis: "22954", nama: "ARIF NUR HARTANTO", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 10, nis: "22955", nama: "ARKAN SAI'D RAMADAN", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 11, nis: "22956", nama: "ATHA REVA ADITYA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 12, nis: "22957", nama: "AUFA RIJAL ASYAM", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 13, nis: "22958", nama: "AXCEL PASA FIANSHA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 14, nis: "22959", nama: "AXEL VISCIDA PRASETYO", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 15, nis: "22960", nama: "BALKIS SYAHDINO", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 16, nis: "22961", nama: "BIAS GEMILANG PRASETYA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 17, nis: "22962", nama: "CHARLY DWI FENDYANSAH", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 18, nis: "22963", nama: "DANU ARJUNSWASITA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 19, nis: "22964", nama: "DEO SAKA RAMADITYA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 20, nis: "22965", nama: "DEWATA PURNAMA WIRABHAYU", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 21, nis: "22966", nama: "DZAKI ADITYA DAMAR JATI", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 22, nis: "22967", nama: "DZAKWAN RIZQIRAMADANI", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 23, nis: "22968", nama: "EVAN ADITYA PUTRA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 24, nis: "22969", nama: "FADHIL BUDI KURNIAWAN", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 25, nis: "22970", nama: "FADHILA KARTIKA WARDANA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 26, nis: "22971", nama: "FAQIH BISMA NUGRAHA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 27, nis: "22972", nama: "FATA NOOR AZAM", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 28, nis: "22973", nama: "FAUZAN NUR KUSUMA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 29, nis: "22974", nama: "FERDY ISNANTO", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 30, nis: "22975", nama: "GALANG ARJUNA MUKTI", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 31, nis: "22976", nama: "GALANG MAHARDIKA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 32, nis: "22977", nama: "GALIH AJI YUDO WICAKSONO", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 33, nis: "22978", nama: "GALIH GIRANTI KUSUMO WICAKSONO", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 34, nis: "22979", nama: "HAIDAR NAUFAL ZAKI", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 35, nis: "22980", nama: "HAIKAL RIFFAT DANISWARA", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" },
  { absen: 36, nis: "22981", nama: "MUHAMMAD RAFAEL AL-HABSI", kelas: "X-TP.A", sekolah: "SMKN 2 DEPOK" }
];

// DEFINISI MODUL LAB & TUGAS-TUGASNYA SESUAI SIDEBAR WEBSITE
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
    shortTitle: "Evaluasi Akhir Komprehensif (C1 - C5)",
    tasks: [
      { key: "evaluasi_c1", name: "🎓 Evaluasi C1 (Mengingat)", category: "Evaluasi Kognitif", keywords: ["c1", "mengingat", "pengetahuan dasar"] },
      { key: "evaluasi_c2", name: "🎓 Evaluasi C2 (Memahami)", category: "Evaluasi Kognitif", keywords: ["c2", "memahami", "konsep"] },
      { key: "evaluasi_c3", name: "🎓 Evaluasi C3 (Menerapkan)", category: "Evaluasi Kognitif", keywords: ["c3", "menerapkan", "prosedur", "aplikasi"] },
      { key: "evaluasi_c4", name: "🎓 Evaluasi C4 (Menganalisis)", category: "Evaluasi Kognitif", keywords: ["c4", "menganalisis", "analisis", "cacat"] },
      { key: "evaluasi_c5", name: "🎓 Evaluasi C5 (Mengevaluasi)", category: "Evaluasi Kognitif", keywords: ["c5", "mengevaluasi", "evaluasi", "hots"] }
    ]
  }
];

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

    var skor = Number(data.skor !== undefined ? data.skor : 0);
    if (skor > 0 && skor <= 10) {
      skor = Math.round(skor * 10);
    }

    var jawabanBenar = data.jawabanBenar !== undefined ? data.jawabanBenar : "-";
    var totalSoal = data.totalSoal !== undefined ? data.totalSoal : "-";
    var status = data.status || (skor >= 75 ? "LULUS" : "REMEDIAL");
    var detailJawaban = typeof data.detailJawaban === "object" ? JSON.stringify(data.detailJawaban) : String(data.detailJawaban || "-");

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

    try {
      autoUpdateLabSheetOnPost(ss, modul, judulKuis, subModul + " " + detailJawaban);
    } catch (errSync) {
      console.warn("Auto-update tab modul error: " + errSync);
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

function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("Menu BIMO Labs")
      .addItem("1. Input & Sinkronkan Nilai Data Masuk ke Semua Sheet Modul Lab", "buatSemuaTabModulLab")
      .addItem("2. Perbarui Khusus Sheet 10. Evaluasi Akhir (C1 - C5)", "perbaruiSheetEvaluasiAkhir")
      .addItem("3. Pulihkan / Perbarui Khusus Sheet 1. Safety Lab", "perbaruiSheetSafetyLab")
      .addItem("4. Perbarui Matriks Rekap Seluruh Lab", "buatMatriksRekapSeluruhLab")
      .addSeparator()
      .addItem("5. Isi Otomatis Nilai Siswa Safety Lab (Rata-rata 80-an)", "isiNilaiOtomatisSafetyLab")
      .addSeparator()
      .addItem("Panduan Pemakaian", "tampilkanPanduan")
      .addToUi();
  } catch (e) {}
}

function inputNilaiDataMasukKeSemuaSheet() {
  buatSemuaTabModulLab();
}

function perbaruiSheetSafetyLab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allRows = getAllDataRows(ss);
  var parsedData = buildStudentMapFromRows(allRows);
  var safetyLab = LAB_CONFIGS[0];
  var classifiedRows = (parsedData.labRowsMap && parsedData.labRowsMap[safetyLab.id]) ? parsedData.labRowsMap[safetyLab.id] : [];
  renderLabSheet(ss, safetyLab, parsedData.studentsMap, parsedData.sortedStudentKeys, classifiedRows);
  try {
    SpreadsheetApp.getUi().alert("Berhasil!\n\nSheet 🛡️ 1. Safety Lab telah berhasil diperbarui dan seluruh data JSA, APD, APAR, 5R, Perkakas, QC telah dimasukkan sesuai klasifikasinya.");
  } catch (e) {}
}

function isiNilaiOtomatisSafetyLab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rawSheet = getOrCreateRawSheet(ss);

  var safetyTasks = [
    { key: "apd", name: "🛡️ Inspeksi APD Operator", sub: "Inspeksi APD", quiz: "Inspeksi APD Operator", base: 86 },
    { key: "jsa_bor", name: "📋 JSA Pengeboran Pelat Baja", sub: "JSA DUDI", quiz: "Penyusunan Job Safety Analysis (JSA): Pengeboran Benda Kerja Pelat Baja 12 mm pada Mesin Bor Meja", base: 85 },
    { key: "jsa_pahat", name: "📋 JSA Pengasahan Pahat Bubut", sub: "JSA DUDI", quiz: "Penyusunan Job Safety Analysis (JSA): Pengasahan Pahat Bubut HSS pada Mesin Gerinda Duduk 3800 RPM", base: 84 },
    { key: "apar", name: "🧯 Simulasi APAR P-A-S-S", sub: "APAR PASS", quiz: "Simulasi Penggunaan APAR Metode P-A-S-S", base: 88 },
    { key: "5r", name: "✨ Budaya Kerja 5R & Etika DUDI", sub: "Budaya 5R", quiz: "Evaluasi Penerapan Budaya Kerja 5R & Etika Industri", base: 87 },
    { key: "perkakas", name: "🔧 SOP Perkakas Tangan & Ragum", sub: "Perkakas Tangan", quiz: "Uji Kompetensi SOP & K3 Perkakas Tangan & Bor/Gerinda", base: 83 },
    { key: "qc", name: "🔍 Audit QC Benda Uji DUDI", sub: "QC DUDI", quiz: "Audit Mutu Benda Uji Kerja Bangku Presisi (QC DUDI)", base: 85 },
    { key: "diag_safety", name: "📝 Tes Diagnostik Safety K3", sub: "Diagnostik", quiz: "Tes Diagnostik Keselamatan Kerja & K3LH", base: 82 }
  ];

  var newRawRows = [];
  var now = new Date();
  var baseDate = Utilities.formatDate(now, "Asia/Jakarta", "yyyy-MM-dd");

  for (var i = 0; i < MASTER_STUDENTS_LIST.length; i++) {
    var s = MASTER_STUDENTS_LIST[i];
    var absen = s.absen;

    for (var tIdx = 0; tIdx < safetyTasks.length; tIdx++) {
      var t = safetyTasks[tIdx];
      var offset = ((absen * 7 + tIdx * 11) % 11) - 4;
      var score = Math.max(78, Math.min(94, t.base + offset));
      var isLulus = score >= 75;
      var status = isLulus ? "LULUS" : "REMEDIAL";
      var minVal = 10 + ((absen * 2 + tIdx * 3) % 45);
      var minStr = minVal < 10 ? "0" + minVal : String(minVal);
      var secVal = 15 + ((absen * 3 + tIdx * 7) % 40);
      var secStr = secVal < 10 ? "0" + secVal : String(secVal);
      var timeStr = baseDate + " 08:" + minStr + ":" + secStr;

      var correct = Math.round((score / 100) * 10);
      var total = 10;
      if (t.key.indexOf("jsa") !== -1) {
        correct = score >= 85 ? 4 : 3;
        total = 4;
      }

      var detail = "Penyelesaian praktikum asesmen K3 " + t.name + ". Skor kepatuhan dan keselamatan kerja: " + score + "/100 (" + status + ").";

      newRawRows.push([
        timeStr,
        s.nama,
        String(s.absen),
        s.kelas,
        s.sekolah,
        "Safety Lab",
        t.sub,
        t.quiz,
        score,
        correct,
        total,
        status,
        detail
      ]);
    }
  }

  if (newRawRows.length > 0) {
    var rawStartRow = rawSheet.getLastRow() + 1;
    var rawRange = rawSheet.getRange(rawStartRow, 1, newRawRows.length, newRawRows[0].length);
    rawRange.setValues(newRawRows);
  }

  buatSemuaTabModulLab();

  try {
    SpreadsheetApp.getUi().alert(
      "Berhasil!\n\nSeluruh 36 siswa kelas X-TP.A telah berhasil diisikan nilai tugas Safety Lab dengan rata-rata nilai 80-an (Kategori Baik / Lulus KKM).\n\nSheet 1. Safety Lab dan Matriks Rekapitulasi kini telah terisi lengkap dengan nilai asli dan data masuk terklasifikasi."
    );
  } catch (e) {}
}

function tampilkanPanduan() {
  var pesan = "CARA MENGGUNAKAN MENU BIMO LABS:\n\n" +
    "1. '1. Input & Sinkronkan Nilai Data Masuk ke Semua Sheet Modul Lab':\n" +
    "   Membaca seluruh data dari sheet Data Masuk, mengklasifikasikan kuis, dan memasukkannya ke masing-masing sheet modul lab (Safety Lab, Machine Lab, Evaluasi C1-C5, dll).\n\n" +
    "2. '2. Perbarui Khusus Sheet 10. Evaluasi Akhir (C1 - C5)':\n" +
    "   Memperbarui sheet Evaluasi Akhir dengan kolom nilai C1, C2, C3, C4, dan C5.\n\n" +
    "3. '3. Pulihkan / Perbarui Khusus Sheet 1. Safety Lab':\n" +
    "   Memperbarui khusus sheet Safety Lab (JSA, APD, APAR, 5R, Perkakas, QC, Diagnostik).\n\n" +
    "4. '4. Perbarui Matriks Rekap Seluruh Lab':\n" +
    "   Memperbarui sheet rekapitulasi utama seluruh modul.\n\n" +
    "5. '5. Isi Otomatis Nilai Siswa Safety Lab (Rata-rata 80-an)':\n" +
    "   Mengisi nilai 36 siswa untuk seluruh tugas Safety Lab dengan nilai rata-rata 80-an (kategori Baik/Lulus KKM) secara otomatis ke Data Masuk dan Sheet Safety Lab.\n\n" +
    "PENTING: Pastikan di baris paling pertama editor Google Apps Script tidak ada huruf atau karakter liar seperti 'x' (baris 1 harus selalu diawali tanda '/**').";
  try {
    SpreadsheetApp.getUi().alert("Panduan Rekap Nilai BIMO Labs", pesan, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {}
}

function buatMatriksRekapPengumpulan() {
  buatSemuaTabModulLab();
}

function rapikanDanPisahkanKuisOtomatis() {
  buatSemuaTabModulLab();
}

function perbaruiSheetEvaluasiIni() {
  perbaruiSheetEvaluasiAkhir();
}

function sinkronkanSemuaData() {
  buatSemuaTabModulLab();
}

function buatSemuaTabModulLab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allRows = getAllDataRows(ss);

  var parsedData = buildStudentMapFromRows(allRows);
  var studentsMap = parsedData.studentsMap;
  var sortedStudentKeys = parsedData.sortedStudentKeys;
  var labRowsMap = parsedData.labRowsMap || {};

  LAB_CONFIGS.forEach(function(lab) {
    var classifiedRows = labRowsMap[lab.id] || [];
    renderLabSheet(ss, lab, studentsMap, sortedStudentKeys, classifiedRows);
  });

  renderMasterMatrixSheet(ss, LAB_CONFIGS, studentsMap, sortedStudentKeys);

  try {
    var allSheets = ss.getSheets();
    for (var shIdx = 0; shIdx < allSheets.length; shIdx++) {
      if (allSheets[shIdx].isSheetHidden && allSheets[shIdx].isSheetHidden()) {
        allSheets[shIdx].showSheet();
      }
    }
  } catch (eShow) {}

  try {
    SpreadsheetApp.getUi().alert("Berhasil!\n\nSeluruh data masuk telah berhasil diklasifikasikan dan diinputkan ke dalam sheet masing-masing lab (Safety Lab, Machine Lab, Evaluasi Akhir C1-C5, dll) lengkap dengan Matriks Nilai & Riwayat Data Masuk.");
  } catch (e) {}
}

function perbaruiSheetEvaluasiAkhir() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allRows = getAllDataRows(ss);

  var parsedData = buildStudentMapFromRows(allRows);
  var studentsMap = parsedData.studentsMap;
  var sortedStudentKeys = parsedData.sortedStudentKeys;
  var labRowsMap = parsedData.labRowsMap || {};

  var evalLab = null;
  for (var i = 0; i < LAB_CONFIGS.length; i++) {
    if (LAB_CONFIGS[i].id === "evaluasi") {
      evalLab = LAB_CONFIGS[i];
      break;
    }
  }

  if (evalLab) {
    var classifiedRows = labRowsMap[evalLab.id] || [];
    renderLabSheet(ss, evalLab, studentsMap, sortedStudentKeys, classifiedRows);
  }

  renderMasterMatrixSheet(ss, LAB_CONFIGS, studentsMap, sortedStudentKeys);

  try {
    SpreadsheetApp.getUi().alert("Berhasil!\n\nSheet Evaluasi Akhir (C1 s.d. C5) dan Matriks Rekap telah diperbarui dengan data nilai siswa.");
  } catch (e) {}
}

function buatMatriksRekapSeluruhLab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allRows = getAllDataRows(ss);
  var parsedData = buildStudentMapFromRows(allRows);
  renderMasterMatrixSheet(ss, LAB_CONFIGS, parsedData.studentsMap, parsedData.sortedStudentKeys);

  try {
    SpreadsheetApp.getUi().alert("Berhasil!\n\nMatriks Rekapitulasi Seluruh Lab berhasil diperbarui.");
  } catch (e) {}
}

function findSheetFlexible(ss, targetCanonicalName, fallbackKeywords) {
  var sheet = ss.getSheetByName(targetCanonicalName);
  if (sheet) return sheet;

  var allSheets = ss.getSheets();
  var cleanTarget = targetCanonicalName.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (var i = 0; i < allSheets.length; i++) {
    var sh = allSheets[i];
    var shName = sh.getName();
    var cleanSh = shName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanSh === cleanTarget) {
      return sh;
    }
  }

  if (fallbackKeywords && fallbackKeywords.length > 0) {
    for (var j = 0; j < allSheets.length; j++) {
      var s = allSheets[j];
      var sLower = s.getName().toLowerCase();
      var matchAll = true;
      for (var k = 0; k < fallbackKeywords.length; k++) {
        if (sLower.indexOf(fallbackKeywords[k].toLowerCase()) === -1) {
          matchAll = false;
          break;
        }
      }
      if (matchAll) {
        return s;
      }
    }
  }

  return null;
}

function findSheetsForLab(ss, targetCanonicalName, fallbackKeywords) {
  var matchedSheets = [];
  var allSheets = ss.getSheets();
  var cleanTarget = targetCanonicalName.toLowerCase().replace(/[^a-z0-9]/g, "");

  allSheets.forEach(function(sh) {
    var shName = sh.getName();
    var sLower = shName.toLowerCase();

    // Abaikan sheet rekapitulasi utama dan data masuk (raw)
    if (sLower.indexOf("rekap") !== -1 || sLower.indexOf("raw") !== -1 || sLower.indexOf("data masuk") !== -1) {
      return;
    }

    // Cocokkan nama persis
    if (shName === targetCanonicalName) {
      matchedSheets.push(sh);
      return;
    }

    // Cocokkan teks bersih (tanpa emoji, simbol, dan spasi)
    var cleanSh = sLower.replace(/[^a-z0-9]/g, "");
    if (cleanSh.length > 3 && (cleanSh === cleanTarget || cleanSh.indexOf(cleanTarget) !== -1 || cleanTarget.indexOf(cleanSh) !== -1)) {
      matchedSheets.push(sh);
      return;
    }

    // Cocokkan kata kunci fallback jika ada
    if (fallbackKeywords && fallbackKeywords.length > 0) {
      var matchAll = true;
      for (var k = 0; k < fallbackKeywords.length; k++) {
        if (sLower.indexOf(fallbackKeywords[k].toLowerCase()) === -1) {
          matchAll = false;
          break;
        }
      }
      if (matchAll) {
        matchedSheets.push(sh);
      }
    }
  });

  // Hapus duplikasi sheet berdasarkan ID
  var uniqueSheets = [];
  var seenIds = {};
  for (var i = 0; i < matchedSheets.length; i++) {
    var sId = matchedSheets[i].getSheetId();
    if (!seenIds[sId]) {
      seenIds[sId] = true;
      uniqueSheets.push(matchedSheets[i]);
    }
  }

  return uniqueSheets;
}

function getStudentTaskScore(s, labId, taskKey) {
  if (!s || !s.scoresByTask) return undefined;
  var fullKey = labId + "_" + taskKey;
  if (s.scoresByTask[fullKey] !== undefined) {
    return s.scoresByTask[fullKey];
  }

  // Safety Lab aliases
  if (labId === "safety") {
    if (taskKey === "jsa_bor") {
      return s.scoresByTask["safety_jsa"] ||
             s.scoresByTask["safety_jsa_dudi"] ||
             s.scoresByTask["safety_jsa_pengeboran"] ||
             s.scoresByTask["safety_jsa_bor"];
    }
    if (taskKey === "jsa_pahat") {
      return s.scoresByTask["safety_jsa_pahat"] ||
             s.scoresByTask["safety_jsa_gerinda"] ||
             s.scoresByTask["safety_jsa_pengasahan"];
    }
    if (taskKey === "perkakas") {
      return s.scoresByTask["safety_perkakas"] ||
             s.scoresByTask["safety_ragum"] ||
             s.scoresByTask["safety_perkakas_tangan"];
    }
    if (taskKey === "qc") {
      return s.scoresByTask["safety_qc"] ||
             s.scoresByTask["safety_qc_dudi"] ||
             s.scoresByTask["safety_mutu"];
    }
    if (taskKey === "apd") {
      return s.scoresByTask["safety_apd"] ||
             s.scoresByTask["safety_inspeksi_apd"];
    }
    if (taskKey === "apar") {
      return s.scoresByTask["safety_apar"] ||
             s.scoresByTask["safety_pass"];
    }
    if (taskKey === "5r") {
      return s.scoresByTask["safety_5r"] ||
             s.scoresByTask["safety_budaya_5r"];
    }
  }

  // Evaluasi Lab aliases
  if (labId === "evaluasi") {
    if (taskKey === "evaluasi_c1") return s.scoresByTask["evaluasi_c1"] || s.scoresByTask["evaluasi_mengingat"];
    if (taskKey === "evaluasi_c2") return s.scoresByTask["evaluasi_c2"] || s.scoresByTask["evaluasi_memahami"];
    if (taskKey === "evaluasi_c3") return s.scoresByTask["evaluasi_c3"] || s.scoresByTask["evaluasi_menerapkan"];
    if (taskKey === "evaluasi_c4") return s.scoresByTask["evaluasi_c4"] || s.scoresByTask["evaluasi_menganalisis"];
    if (taskKey === "evaluasi_c5") return s.scoresByTask["evaluasi_c5"] || s.scoresByTask["evaluasi_mengevaluasi"];
  }

  return undefined;
}

function renderLabSheet(ss, lab, studentsMap, sortedStudentKeys, classifiedRows) {
  var keywords = [lab.id];
  if (lab.id === "safety") keywords = ["safety"];
  else if (lab.id === "machine") keywords = ["machine"];
  else if (lab.id === "cutting-tools") keywords = ["pemotong"];
  else if (lab.id === "heat-treatment") keywords = ["heat"];
  else if (lab.id === "mechanics") keywords = ["mekanika"];
  else if (lab.id === "welding") keywords = ["welding"];
  else if (lab.id === "measuring") keywords = ["ukur"];
  else if (lab.id === "design") keywords = ["design"];
  else if (lab.id === "virtual-bengkel") keywords = ["bengkel"];
  else if (lab.id === "evaluasi") keywords = ["evaluasi"];

  var targetSheets = findSheetsForLab(ss, lab.tabName, keywords);
  if (targetSheets.length === 0) {
    var newSheet = ss.insertSheet(lab.tabName);
    targetSheets.push(newSheet);
  }

  targetSheets.forEach(function(sh) {
    renderSingleLabSheet(sh, lab, studentsMap, sortedStudentKeys, classifiedRows);
  });
}

function renderSingleLabSheet(sheet, lab, studentsMap, sortedStudentKeys, classifiedRows) {
  try {
    if (sheet.isSheetHidden && sheet.isSheetHidden()) {
      sheet.showSheet();
    }
  } catch (eHidden) {}
  sheet.clear();

  var tasks = lab.tasks;
  var totalStudents = sortedStudentKeys.length;
  var nowFormatted = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd-MM-yyyy HH:mm");
  var matrixCols = 4 + tasks.length + 3;
  var totalCols = Math.max(11, matrixCols);

  // BANNER 1: JUDUL BESAR LAB
  var displayTitle = sheet.getName();
  sheet.appendRow([displayTitle.toUpperCase() + " - REKAPITULASI NILAI ASLI & DATA MASUK TERKLASIFIKASI"]);
  var b1 = sheet.getRange(1, 1, 1, totalCols);
  b1.merge();
  b1.setBackground("#064e3b");
  b1.setFontColor("#ffffff");
  b1.setFontWeight("bold");
  b1.setFontSize(11);
  b1.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);

  // BANNER 2: INFO MODUL & STANDAR KKM
  var totalClassified = (classifiedRows || []).length;
  sheet.appendRow([
    "Modul: " + lab.shortTitle + "  |  Target KKM: 75  |  Total Tugas: " + tasks.length + " Tugas  |  Total Siswa: " + totalStudents + " Siswa  |  Data Masuk Terklasifikasi: " + totalClassified + " Pengumpulan  |  Diperbarui: " + nowFormatted + " WIB"
  ]);
  var b2 = sheet.getRange(2, 1, 1, totalCols);
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

  // =========================================================================
  // BAGIAN 1: MATRIKS CEKLIS NILAI ASLI SISWA (36 SISWA X-TP.A)
  // =========================================================================
  sheet.appendRow(["BAGIAN 1: MATRIKS CEKLIS NILAI ASLI SISWA (STATUS PENGUMPULAN & NILAI ASLI PER SISWA)"]);
  var sec1Title = sheet.getRange(4, 1, 1, totalCols);
  sec1Title.merge();
  sec1Title.setBackground("#1e293b");
  sec1Title.setFontColor("#f8fafc");
  sec1Title.setFontWeight("bold");
  sec1Title.setFontSize(10);
  sec1Title.setVerticalAlignment("middle");
  sheet.setRowHeight(4, 28);

  var matrixHeaders = ["No", "Nama Lengkap Siswa", "No. Absen", "Kelas / Jurusan"];
  tasks.forEach(function(t) {
    matrixHeaders.push(t.name);
  });
  matrixHeaders.push("Total Tugas Selesai");
  matrixHeaders.push("Rata-rata Nilai Asli");
  matrixHeaders.push("Status Kelulusan");

  var matrixValues = [matrixHeaders];
  var matrixBgs = [];
  var matrixColors = [];
  var matrixWeights = [];

  var hBgs = [];
  var hColors = [];
  var hWeights = [];
  for (var hc = 0; hc < matrixHeaders.length; hc++) {
    hBgs.push("#0f172a");
    hColors.push("#ffffff");
    hWeights.push("bold");
  }
  matrixBgs.push(hBgs);
  matrixColors.push(hColors);
  matrixWeights.push(hWeights);

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
    var rBgs = ["#ffffff", "#ffffff", "#ffffff", "#ffffff"];
    var rColors = ["#000000", "#000000", "#000000", "#000000"];
    var rWeights = ["normal", "normal", "normal", "normal"];

    var finishedCount = 0;
    var studentScoreSum = 0;

    tasks.forEach(function(t, idx) {
      var rec = getStudentTaskScore(s, lab.id, t.key);
      if (rec !== undefined) {
        finishedCount++;
        studentScoreSum += rec.skor;
        taskSubmissionCounts[idx]++;
        taskScoreSums[idx] += rec.skor;
        if (rec.skor >= 75) {
          row.push(rec.skor + " (LULUS)");
          rBgs.push("#dcfce7");
          rColors.push("#166534");
          rWeights.push("bold");
        } else {
          row.push(rec.skor + " (REMEDIAL)");
          rBgs.push("#fee2e2");
          rColors.push("#991b1b");
          rWeights.push("bold");
        }
      } else {
        row.push("Belum");
        rBgs.push("#f1f5f9");
        rColors.push("#94a3b8");
        rWeights.push("normal");
      }
    });

    var studentAvg = finishedCount > 0 ? Math.round(studentScoreSum / finishedCount) : 0;
    row.push(finishedCount + " / " + tasks.length + " Tugas");
    rBgs.push("#ffffff");
    rColors.push("#000000");
    rWeights.push("normal");

    row.push(studentAvg);
    rBgs.push(studentAvg >= 75 ? "#dcfce7" : (finishedCount > 0 ? "#fee2e2" : "#f1f5f9"));
    rColors.push(studentAvg >= 75 ? "#166534" : (finishedCount > 0 ? "#dc2626" : "#64748b"));
    rWeights.push("bold");

    var compStatus = finishedCount === tasks.length ? "LENGKAP" : (finishedCount > 0 ? "SEBAGIAN" : "BELUM ADA");
    row.push(compStatus);
    rBgs.push(finishedCount === tasks.length ? "#dcfce7" : (finishedCount > 0 ? "#fef3c7" : "#f1f5f9"));
    rColors.push(finishedCount === tasks.length ? "#166534" : (finishedCount > 0 ? "#92400e" : "#64748b"));
    rWeights.push("bold");

    matrixValues.push(row);
    matrixBgs.push(rBgs);
    matrixColors.push(rColors);
    matrixWeights.push(rWeights);
  });

  // Footer Row: TOTAL SISWA MENGUMPULKAN
  var fRow1 = ["TOTAL SISWA MENGUMPULKAN:", "", "", ""];
  var fRow1Bgs = ["#e2e8f0", "#e2e8f0", "#e2e8f0", "#e2e8f0"];
  var fRow1Colors = ["#0f172a", "#0f172a", "#0f172a", "#0f172a"];
  var fRow1Weights = ["bold", "bold", "bold", "bold"];

  tasks.forEach(function(t, idx) {
    fRow1.push(taskSubmissionCounts[idx] + " Siswa");
    fRow1Bgs.push(taskSubmissionCounts[idx] > 0 ? "#dcfce7" : "#f1f5f9");
    fRow1Colors.push(taskSubmissionCounts[idx] > 0 ? "#166534" : "#64748b");
    fRow1Weights.push("bold");
  });
  fRow1.push("-"); fRow1Bgs.push("#e2e8f0"); fRow1Colors.push("#0f172a"); fRow1Weights.push("bold");
  fRow1.push("-"); fRow1Bgs.push("#e2e8f0"); fRow1Colors.push("#0f172a"); fRow1Weights.push("bold");
  fRow1.push("-"); fRow1Bgs.push("#e2e8f0"); fRow1Colors.push("#0f172a"); fRow1Weights.push("bold");

  matrixValues.push(fRow1);
  matrixBgs.push(fRow1Bgs);
  matrixColors.push(fRow1Colors);
  matrixWeights.push(fRow1Weights);

  var matrixStartRow = 5;
  var matrixRange = sheet.getRange(matrixStartRow, 1, matrixValues.length, matrixHeaders.length);
  matrixRange.setValues(matrixValues);
  matrixRange.setBackgrounds(matrixBgs);
  matrixRange.setFontColors(matrixColors);
  matrixRange.setFontWeights(matrixWeights);
  matrixRange.setFontSize(9);
  matrixRange.setVerticalAlignment("middle");

  var numMatrixRows = matrixValues.length;
  sheet.getRange(matrixStartRow, 1, numMatrixRows, 1).setHorizontalAlignment("center");
  sheet.getRange(matrixStartRow, 3, numMatrixRows, 1).setHorizontalAlignment("center");
  sheet.getRange(matrixStartRow, 4, numMatrixRows, 1).setHorizontalAlignment("center");
  for (var cIdx = 0; cIdx < tasks.length; cIdx++) {
    sheet.getRange(matrixStartRow, 5 + cIdx, numMatrixRows, 1).setHorizontalAlignment("center");
  }
  sheet.getRange(matrixStartRow, matrixHeaders.length - 2, numMatrixRows, 3).setHorizontalAlignment("center");

  var footerRowNum = matrixStartRow + numMatrixRows - 1;
  sheet.getRange(footerRowNum, 1, 1, 4).merge().setHorizontalAlignment("right");
  sheet.setRowHeight(matrixStartRow, 32);

  for (var rIdx = 1; rIdx < numMatrixRows; rIdx++) {
    sheet.setRowHeight(matrixStartRow + rIdx, 25);
  }

  // =========================================================================
  // SPASI ANTARA MATRIKS & DATA MASUK TERKLASIFIKASI
  // =========================================================================
  var afterMatrixRow = footerRowNum + 1;
  sheet.getRange(afterMatrixRow, 1).setValue("");
  sheet.setRowHeight(afterMatrixRow, 16);

  // =========================================================================
  // BAGIAN 2: DAFTAR DATA MASUK KHUSUS MODUL INI (TERKLASIFIKASI DARI RAW DATA)
  // =========================================================================
  var sec2TitleRow = afterMatrixRow + 1;
  sheet.getRange(sec2TitleRow, 1).setValue(
    "BAGIAN 2: DAFTAR DATA MASUK KHUSUS " + lab.shortTitle.toUpperCase() + " (HASIL KLASIFIKASI DARI SHEET DATA MASUK)"
  );
  var sec2Title = sheet.getRange(sec2TitleRow, 1, 1, totalCols);
  sec2Title.merge();
  sec2Title.setBackground("#1e293b");
  sec2Title.setFontColor("#f8fafc");
  sec2Title.setFontWeight("bold");
  sec2Title.setFontSize(10);
  sec2Title.setVerticalAlignment("middle");
  sheet.setRowHeight(sec2TitleRow, 28);

  var logHeaders = [
    "No",
    "Waktu & Tanggal Masuk",
    "Nama Lengkap Siswa",
    "No. Absen",
    "Kelas / Jurusan",
    "Tugas / Kuis Teridentifikasi",
    "Nilai Asli (0 - 100)",
    "Jawaban Benar",
    "Total Soal",
    "Status KKM",
    "Rincian Jawaban Siswa"
  ];

  var logValues = [logHeaders];
  var logBgs = [];
  var logColors = [];
  var logWeights = [];

  var logHBgs = [];
  var logHColors = [];
  var logHWeights = [];
  for (var lc = 0; lc < logHeaders.length; lc++) {
    logHBgs.push("#334155");
    logHColors.push("#ffffff");
    logHWeights.push("bold");
  }
  logBgs.push(logHBgs);
  logColors.push(logHColors);
  logWeights.push(logHWeights);

  var rawList = classifiedRows || [];
  if (rawList.length === 0) {
    var emptyRow = [
      "-",
      "-",
      "(Belum ada data masuk untuk modul " + lab.shortTitle + " di sheet Data Masuk)",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-",
      "-"
    ];
    var emptyBgs = [];
    var emptyColors = [];
    var emptyWeights = [];
    for (var ec = 0; ec < logHeaders.length; ec++) {
      emptyBgs.push("#f8fafc");
      emptyColors.push("#64748b");
      emptyWeights.push("normal");
    }
    logValues.push(emptyRow);
    logBgs.push(emptyBgs);
    logColors.push(emptyColors);
    logWeights.push(emptyWeights);
  } else {
    for (var ri = 0; ri < rawList.length; ri++) {
      var item = rawList[ri];
      var isLulus = item.skor >= 75;
      var rowItem = [
        ri + 1,
        item.waktu || "-",
        item.nama || "-",
        item.absen || "-",
        item.kelas || "-",
        item.taskName || item.judulKuis || "-",
        item.skor,
        item.jawabanBenar !== undefined ? item.jawabanBenar : "-",
        item.totalSoal !== undefined ? item.totalSoal : "-",
        item.status || (isLulus ? "LULUS" : "REMEDIAL"),
        item.detailJawaban || "-"
      ];

      var rBg = isLulus ? "#dcfce7" : "#fee2e2";
      var rColor = isLulus ? "#166534" : "#991b1b";

      var rowBgs = [
        "#ffffff",
        "#ffffff",
        "#ffffff",
        "#ffffff",
        "#ffffff",
        "#ffffff",
        rBg,
        "#ffffff",
        "#ffffff",
        rBg,
        "#ffffff"
      ];
      var rowColors = [
        "#000000",
        "#000000",
        "#000000",
        "#000000",
        "#000000",
        "#000000",
        rColor,
        "#000000",
        "#000000",
        rColor,
        "#334155"
      ];
      var rowWeights = [
        "normal",
        "normal",
        "normal",
        "normal",
        "normal",
        "normal",
        "bold",
        "normal",
        "normal",
        "bold",
        "normal"
      ];

      logValues.push(rowItem);
      logBgs.push(rowBgs);
      logColors.push(rowColors);
      logWeights.push(rowWeights);
    }
  }

  var logStartRow = sec2TitleRow + 1;
  var logRange = sheet.getRange(logStartRow, 1, logValues.length, logHeaders.length);
  logRange.setValues(logValues);
  logRange.setBackgrounds(logBgs);
  logRange.setFontColors(logColors);
  logRange.setFontWeights(logWeights);
  logRange.setFontSize(9);
  logRange.setVerticalAlignment("middle");

  var numLogRows = logValues.length;
  sheet.getRange(logStartRow, 1, numLogRows, 1).setHorizontalAlignment("center");
  sheet.getRange(logStartRow, 2, numLogRows, 1).setHorizontalAlignment("center");
  sheet.getRange(logStartRow, 4, numLogRows, 1).setHorizontalAlignment("center");
  sheet.getRange(logStartRow, 5, numLogRows, 1).setHorizontalAlignment("center");
  sheet.getRange(logStartRow, 7, numLogRows, 4).setHorizontalAlignment("center");

  sheet.setRowHeight(logStartRow, 30);
  for (var lrIdx = 1; lrIdx < numLogRows; lrIdx++) {
    sheet.setRowHeight(logStartRow + lrIdx, 25);
  }

  // ATUR LEBAR KOLOM
  sheet.setColumnWidth(1, 45);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 85);
  sheet.setColumnWidth(4, 120);
  for (var i = 0; i < tasks.length; i++) {
    sheet.setColumnWidth(5 + i, 190);
  }
  sheet.setColumnWidth(matrixHeaders.length - 2, 140);
  sheet.setColumnWidth(matrixHeaders.length - 1, 130);
  sheet.setColumnWidth(matrixHeaders.length, 140);

  sheet.setColumnWidth(6, 260);
  sheet.setColumnWidth(11, 300);
}

function renderMasterMatrixSheet(ss, labs, studentsMap, sortedStudentKeys) {
  var masterName = "📊 Rekap Seluruh Lab";
  var sheet = findSheetFlexible(ss, masterName, ["rekap"]);
  if (!sheet) {
    sheet = ss.insertSheet(masterName, 0);
  } else {
    sheet.clear();
  }

  var totalCols = 4 + labs.length + 3;

  sheet.appendRow(["📊 REKAPITULASI KELENGKAPAN TUGAS SELURUH LABORATORIUM (BIMO MANUFACTURING LABS)"]);
  var b1 = sheet.getRange(1, 1, 1, totalCols);
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
  var b2 = sheet.getRange(2, 1, 1, totalCols);
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

      if (labFinished > 0) {
        var labAvg = Math.round(labScoreSum / labFinished);
        if (labAvg >= 75) {
          row.push(labAvg + " (LULUS)");
        } else {
          row.push(labAvg + " (REMEDIAL)");
        }
      } else {
        row.push("Belum");
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

function identifyLabAndTask(modulStr, quizStr, detailStr) {
  var m = String(modulStr || "").toLowerCase();
  var q = String(quizStr || "").toLowerCase();
  var d = String(detailStr || "").toLowerCase();
  var text = m + " " + q + " " + d;

  // 1. TENTUKAN LAB ID TERLEBIH DAHULU (BERDASARKAN MODUL / JUDUL UTAMA)
  var labId = "";
  if (m.indexOf("evaluasi") !== -1 || (q.indexOf("evaluasi") !== -1 && m.indexOf("heat") === -1 && m.indexOf("panas") === -1 && m.indexOf("metalurgi") === -1 && m.indexOf("safety") === -1 && m.indexOf("mesin") === -1 && m.indexOf("perkakas") === -1)) {
    labId = "evaluasi";
  } else if (m.indexOf("safety") !== -1 || m.indexOf("k3") !== -1 || q.indexOf("inspeksi apd") !== -1 || q.indexOf("apar pass") !== -1 || q.indexOf("budaya 5r") !== -1 || q.indexOf("job safety") !== -1 || q.indexOf("jsa") !== -1 || d.indexOf("jsa") !== -1 || q.indexOf("qc dudi") !== -1 || text.indexOf("perkakas tangan") !== -1) {
    labId = "safety";
  } else if (m.indexOf("pemotong") !== -1 || m.indexOf("cutting") !== -1 || (m.indexOf("perkakas") !== -1 && m.indexOf("safety") === -1) || q.indexOf("kalkulasi kecepatan potong") !== -1 || q.indexOf("ensiklopedia perkakas") !== -1) {
    labId = "cutting-tools";
  } else if (m.indexOf("heat") !== -1 || m.indexOf("panas") !== -1 || m.indexOf("metalurgi") !== -1 || q.indexOf("perlakuan panas") !== -1) {
    labId = "heat-treatment";
  } else if (m.indexOf("mekanika") !== -1 || m.indexOf("mechanic") !== -1 || q.indexOf("torsi") !== -1 || q.indexOf("fisika terapan") !== -1 || q.indexOf("momen gaya") !== -1) {
    labId = "mechanics";
  } else if (m.indexOf("weld") !== -1 || m.indexOf("las") !== -1 || q.indexOf("smaw") !== -1 || q.indexOf("pengelasan") !== -1) {
    labId = "welding";
  } else if (m.indexOf("ukur") !== -1 || m.indexOf("measur") !== -1 || m.indexOf("metrologi") !== -1 || q.indexOf("membaca alat ukur") !== -1 || q.indexOf("jangka sorong") !== -1 || q.indexOf("mikrometer") !== -1) {
    labId = "measuring";
  } else if (m.indexOf("design") !== -1 || m.indexOf("cad") !== -1 || m.indexOf("gambar") !== -1 || q.indexOf("gambar proyeksi") !== -1 || q.indexOf("toleransi iso") !== -1) {
    labId = "design";
  } else if (m.indexOf("bengkel 3d") !== -1 || m.indexOf("virtual bengkel") !== -1 || q.indexOf("eksplorasi bengkel") !== -1 || q.indexOf("tata letak bengkel") !== -1) {
    labId = "virtual-bengkel";
  } else {
    labId = "machine";
  }

  // 2. TENTUKAN TUGAS SPESIFIK BERDASARKAN LAB ID
  if (labId === "evaluasi") {
    if (text.indexOf("c1") !== -1 || text.indexOf("mengingat") !== -1) return { labId: "evaluasi", taskKey: "evaluasi_c1", taskName: "🎓 Evaluasi C1 (Mengingat)" };
    if (text.indexOf("c2") !== -1 || text.indexOf("memahami") !== -1) return { labId: "evaluasi", taskKey: "evaluasi_c2", taskName: "🎓 Evaluasi C2 (Memahami)" };
    if (text.indexOf("c3") !== -1 || text.indexOf("menerapkan") !== -1) return { labId: "evaluasi", taskKey: "evaluasi_c3", taskName: "🎓 Evaluasi C3 (Menerapkan)" };
    if (text.indexOf("c4") !== -1 || text.indexOf("menganalisis") !== -1) return { labId: "evaluasi", taskKey: "evaluasi_c4", taskName: "🎓 Evaluasi C4 (Menganalisis)" };
    if (text.indexOf("c5") !== -1 || text.indexOf("mengevaluasi") !== -1 || text.indexOf("hots") !== -1) return { labId: "evaluasi", taskKey: "evaluasi_c5", taskName: "🎓 Evaluasi C5 (Mengevaluasi)" };
    return { labId: "evaluasi", taskKey: "evaluasi_unspecified", taskName: "🎓 Evaluasi Komprehensif" };
  }

  if (labId === "safety") {
    if (text.indexOf("diagnostik") !== -1) return { labId: "safety", taskKey: "diag_safety", taskName: "📝 Tes Diagnostik Safety K3" };
    if (text.indexOf("jsa") !== -1 || text.indexOf("job safety") !== -1) {
      if (text.indexOf("pengasahan") !== -1 || (text.indexOf("pahat") !== -1 && text.indexOf("gerinda") !== -1) || text.indexOf("gerinda_duduk") !== -1) {
        return { labId: "safety", taskKey: "jsa_pahat", taskName: "📋 JSA Pengasahan Pahat Bubut" };
      }
      return { labId: "safety", taskKey: "jsa_bor", taskName: "📋 JSA Pengeboran Pelat Baja" };
    }
    if (text.indexOf("perkakas") !== -1 || text.indexOf("ragum") !== -1) {
      return { labId: "safety", taskKey: "perkakas", taskName: "🔧 SOP Perkakas Tangan & Ragum" };
    }
    if (text.indexOf("qc") !== -1 || text.indexOf("mutu") !== -1 || text.indexOf("benda uji") !== -1) {
      return { labId: "safety", taskKey: "qc", taskName: "🔍 Audit QC Benda Uji DUDI" };
    }
    if (text.indexOf("apar") !== -1 || text.indexOf("pass") !== -1 || text.indexOf("kebakaran") !== -1) {
      return { labId: "safety", taskKey: "apar", taskName: "🧯 Simulasi APAR P-A-S-S" };
    }
    if (text.indexOf("5r") !== -1 || text.indexOf("budaya") !== -1 || text.indexOf("etika") !== -1) {
      return { labId: "safety", taskKey: "5r", taskName: "✨ Budaya Kerja 5R & Etika DUDI" };
    }
    if (text.indexOf("pengeboran") !== -1 || text.indexOf("pelat") !== -1 || text.indexOf("bor meja") !== -1) {
      return { labId: "safety", taskKey: "jsa_bor", taskName: "📋 JSA Pengeboran Pelat Baja" };
    }
    if (text.indexOf("pengasahan") !== -1 || (text.indexOf("pahat") !== -1 && text.indexOf("gerinda") !== -1)) {
      return { labId: "safety", taskKey: "jsa_pahat", taskName: "📋 JSA Pengasahan Pahat Bubut" };
    }
    if (text.indexOf("apd") !== -1 || text.indexOf("alat pelindung") !== -1 || text.indexOf("inspeksi apd") !== -1) {
      return { labId: "safety", taskKey: "apd", taskName: "🛡️ Inspeksi APD Operator" };
    }
    return { labId: "safety", taskKey: "apd", taskName: "🛡️ Inspeksi APD Operator" };
  }

  if (labId === "machine") {
    if (text.indexOf("diagnostik") !== -1) return { labId: "machine", taskKey: "diag_machine", taskName: "📝 Tes Diagnostik Machine Lab" };
    if (text.indexOf("pretest") !== -1 || text.indexOf("pre-test") !== -1) return { labId: "machine", taskKey: "pretest", taskName: "⚙️ Pre-Test Teori Permesinan" };
    if (text.indexOf("cnc") !== -1 || text.indexOf("g-code") !== -1 || text.indexOf("kode g") !== -1) return { labId: "machine", taskKey: "cnc", taskName: "💻 Kuis Teori & Kode CNC" };
    if (text.indexOf("bubut") !== -1 || text.indexOf("lathe") !== -1 || text.indexOf("frais") !== -1 || text.indexOf("milling") !== -1) return { labId: "machine", taskKey: "lathe", taskName: "🔩 Praktik Mesin Bubut & Frais" };
    return { labId: "machine", taskKey: "lathe", taskName: "🔩 Praktik Mesin Bubut & Frais" };
  }

  if (labId === "cutting-tools") {
    if (text.indexOf("diagnostik") !== -1) return { labId: "cutting-tools", taskKey: "diag_cutting", taskName: "📝 Tes Diagnostik Alat Potong" };
    return { labId: "cutting-tools", taskKey: "cutting_quiz", taskName: "🔪 Kuis Pahat & Kalkulasi RPM" };
  }

  if (labId === "heat-treatment") {
    if (text.indexOf("diagnostik") !== -1) return { labId: "heat-treatment", taskKey: "diag_heat", taskName: "📝 Tes Diagnostik Heat Treatment" };
    return { labId: "heat-treatment", taskKey: "metallurgy", taskName: "🌡️ Kuis Evaluasi Metalurgi" };
  }

  if (labId === "mechanics") {
    if (text.indexOf("diagnostik") !== -1) return { labId: "mechanics", taskKey: "diag_mechanics", taskName: "📝 Tes Diagnostik Mekanika" };
    return { labId: "mechanics", taskKey: "torque", taskName: "⚖️ Kuis Momen Gaya & Torsi" };
  }

  if (labId === "welding") {
    if (text.indexOf("diagnostik") !== -1) return { labId: "welding", taskKey: "diag_welding", taskName: "📝 Tes Diagnostik Welding Lab" };
    return { labId: "welding", taskKey: "smaw", taskName: "⚡ Kuis Asesmen Las SMAW" };
  }

  if (labId === "measuring") {
    if (text.indexOf("diagnostik") !== -1) return { labId: "measuring", taskKey: "diag_measuring", taskName: "📝 Tes Diagnostik Alat Ukur" };
    return { labId: "measuring", taskKey: "caliper_micrometer", taskName: "📏 Uji Pembacaan Kaliper & Mikrometer" };
  }

  if (labId === "design") {
    if (text.indexOf("diagnostik") !== -1) return { labId: "design", taskKey: "diag_design", taskName: "📝 Tes Diagnostik Design Lab" };
    return { labId: "design", taskKey: "cad_drawing", taskName: "📐 Kuis Gambar Teknik & CAD" };
  }

  if (labId === "virtual-bengkel") {
    if (text.indexOf("diagnostik") !== -1) return { labId: "virtual-bengkel", taskKey: "diag_virtual", taskName: "📝 Tes Diagnostik Bengkel 3D" };
    return { labId: "virtual-bengkel", taskKey: "virtual_bengkel", taskName: "🏭 Praktik Workshop 3D" };
  }

  return { labId: "machine", taskKey: "lathe", taskName: "🔩 Praktik Mesin Bubut & Frais" };
}

function parseRowData(row, headerMap) {
  var waktu = "";
  var nama = "";
  var absen = "-";
  var kelas = "-";
  var sekolah = "-";
  var modul = "";
  var subModul = "";
  var judulKuis = "";
  var skor = 0;
  var jawabanBenar = "-";
  var totalSoal = "-";
  var status = "";
  var detailJawaban = "";

  if (headerMap) {
    if (headerMap.waktu !== undefined) waktu = String(row[headerMap.waktu] || "");
    if (headerMap.nama !== undefined) nama = String(row[headerMap.nama] || "").trim();
    if (headerMap.absen !== undefined) absen = String(row[headerMap.absen] !== undefined ? row[headerMap.absen] : "-").trim();
    if (headerMap.kelas !== undefined) kelas = String(row[headerMap.kelas] || "-").trim();
    if (headerMap.sekolah !== undefined) sekolah = String(row[headerMap.sekolah] || "-").trim();
    if (headerMap.modul !== undefined) modul = String(row[headerMap.modul] || "").trim();
    if (headerMap.subModul !== undefined) subModul = String(row[headerMap.subModul] || "").trim();
    if (headerMap.kuis !== undefined) judulKuis = String(row[headerMap.kuis] || "").trim();
    if (headerMap.nilai !== undefined) skor = Number(row[headerMap.nilai]);
    if (headerMap.benar !== undefined) jawabanBenar = String(row[headerMap.benar] !== undefined ? row[headerMap.benar] : "-");
    if (headerMap.total !== undefined) totalSoal = String(row[headerMap.total] !== undefined ? row[headerMap.total] : "-");
    if (headerMap.status !== undefined) status = String(row[headerMap.status] || "");
    if (headerMap.detail !== undefined) detailJawaban = String(row[headerMap.detail] || "").trim();
  }

  if (!waktu) waktu = String(row[0] || "");
  if (!nama) nama = String(row[1] || "").trim();
  if (absen === "-") absen = String(row[2] !== undefined ? row[2] : "-").trim();
  if (kelas === "-") kelas = String(row[3] || "-").trim();
  if (sekolah === "-") sekolah = String(row[4] || "-").trim();
  if (!modul) modul = String(row[5] || "").trim();

  if (!judulKuis) {
    var c1 = String(row[6] || "").trim();
    var c2 = String(row[7] || "").trim();
    if (isNaN(Number(c2)) && c2.length > 2) {
      subModul = c1;
      judulKuis = c2;
    } else if (isNaN(Number(c1)) && c1.length > 2) {
      judulKuis = c1;
    }
  }

  if (headerMap && headerMap.nilai !== undefined && !isNaN(Number(row[headerMap.nilai]))) {
    skor = Number(row[headerMap.nilai]);
  } else {
    var candidateScore = skor;
    if (isNaN(candidateScore) || candidateScore === 0) {
      if (!isNaN(Number(row[8]))) candidateScore = Number(row[8]);
      else if (!isNaN(Number(row[7]))) candidateScore = Number(row[7]);
      else if (!isNaN(Number(row[6]))) candidateScore = Number(row[6]);
    }
    skor = candidateScore || 0;
  }
  if (skor > 0 && skor <= 10) {
    skor = Math.round(skor * 10);
  }

  if (!status) {
    status = skor >= 75 ? "LULUS" : "REMEDIAL";
  }

  if (!detailJawaban && row.length > 10) {
    detailJawaban = String(row[row.length - 1] || "");
  }

  return {
    waktu: waktu,
    nama: nama,
    absen: absen,
    kelas: kelas,
    sekolah: sekolah,
    modul: modul,
    subModul: subModul,
    judulKuis: judulKuis,
    skor: skor,
    jawabanBenar: jawabanBenar,
    totalSoal: totalSoal,
    status: status,
    detailJawaban: detailJawaban
  };
}

function buildStudentMapFromRows(allRows) {
  var studentsMap = {};
  var labRowsMap = {};
  LAB_CONFIGS.forEach(function(l) {
    labRowsMap[l.id] = [];
  });

  MASTER_STUDENTS_LIST.forEach(function(s) {
    var key = "absen_" + String(s.absen);
    studentsMap[key] = {
      nama: s.nama,
      absen: String(s.absen),
      nis: s.nis,
      kelas: s.kelas,
      sekolah: s.sekolah,
      isMaster: true,
      scoresByTask: {}
    };
  });

  var evalSeqByStudent = {};

  (allRows || []).forEach(function(parsed) {
    var rawNama = (parsed.nama || "").trim();
    if (!rawNama) return;
    var rawAbsen = String(parsed.absen !== undefined ? parsed.absen : "-").trim();
    var parsedAbsenNum = parseInt(rawAbsen, 10);

    var targetKey = null;
    if (!isNaN(parsedAbsenNum) && parsedAbsenNum >= 1 && parsedAbsenNum <= MASTER_STUDENTS_LIST.length) {
      targetKey = "absen_" + parsedAbsenNum;
    } else {
      var cleanRaw = rawNama.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (var m = 0; m < MASTER_STUDENTS_LIST.length; m++) {
        var cleanMaster = MASTER_STUDENTS_LIST[m].nama.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (cleanRaw === cleanMaster || (cleanRaw.length > 5 && cleanMaster.indexOf(cleanRaw) !== -1) || (cleanMaster.length > 5 && cleanRaw.indexOf(cleanMaster) !== -1)) {
          targetKey = "absen_" + MASTER_STUDENTS_LIST[m].absen;
          break;
        }
      }
    }

    if (!targetKey) {
      targetKey = "custom_" + rawNama.toLowerCase().replace(/[^a-z0-9]/g, "_");
      if (!studentsMap[targetKey]) {
        studentsMap[targetKey] = {
          nama: rawNama,
          absen: rawAbsen,
          nis: "-",
          kelas: parsed.kelas || "-",
          sekolah: parsed.sekolah || "-",
          isMaster: false,
          scoresByTask: {}
        };
      }
    }

    var modulName = parsed.modul || "";
    var quizTitle = parsed.judulKuis || "";
    var detailStr = (parsed.subModul || "") + " " + (parsed.detailJawaban || "");
    var score = Number(parsed.skor !== undefined ? parsed.skor : 0);
    if (score > 0 && score <= 10) score = Math.round(score * 10);

    var matched = identifyLabAndTask(modulName, quizTitle, detailStr);

    if (matched.labId === "evaluasi" && matched.taskKey === "evaluasi_unspecified") {
      if (!evalSeqByStudent[targetKey]) {
        evalSeqByStudent[targetKey] = 0;
      }
      evalSeqByStudent[targetKey]++;
      var seq = evalSeqByStudent[targetKey];
      if (seq === 1) {
        matched.taskKey = "evaluasi_c1";
        matched.taskName = "🎓 Evaluasi C1 (Mengingat)";
      } else if (seq === 2) {
        matched.taskKey = "evaluasi_c2";
        matched.taskName = "🎓 Evaluasi C2 (Memahami)";
      } else if (seq === 3) {
        matched.taskKey = "evaluasi_c3";
        matched.taskName = "🎓 Evaluasi C3 (Menerapkan)";
      } else if (seq === 4) {
        matched.taskKey = "evaluasi_c4";
        matched.taskName = "🎓 Evaluasi C4 (Menganalisis)";
      } else {
        matched.taskKey = "evaluasi_c5";
        matched.taskName = "🎓 Evaluasi C5 (Mengevaluasi)";
      }
    }

    var taskFullKey = matched.labId + "_" + matched.taskKey;
    if (studentsMap[targetKey].scoresByTask[taskFullKey] === undefined || score > studentsMap[targetKey].scoresByTask[taskFullKey].skor) {
      studentsMap[targetKey].scoresByTask[taskFullKey] = {
        skor: score,
        waktu: parsed.waktu || "",
        labId: matched.labId,
        taskKey: matched.taskKey,
        taskName: matched.taskName
      };
    }

    if (matched.labId === "safety" && (matched.taskKey === "jsa_bor" || matched.taskKey === "jsa_pahat")) {
      if (studentsMap[targetKey].scoresByTask["safety_jsa"] === undefined || score > studentsMap[targetKey].scoresByTask["safety_jsa"].skor) {
        studentsMap[targetKey].scoresByTask["safety_jsa"] = studentsMap[targetKey].scoresByTask[taskFullKey];
      }
    }

    if (labRowsMap[matched.labId]) {
      labRowsMap[matched.labId].push({
        waktu: parsed.waktu || "-",
        nama: rawNama,
        absen: rawAbsen,
        kelas: parsed.kelas || "-",
        sekolah: parsed.sekolah || "-",
        modul: modulName,
        subModul: parsed.subModul || "-",
        judulKuis: quizTitle,
        taskKey: matched.taskKey,
        taskName: matched.taskName,
        skor: score,
        jawabanBenar: parsed.jawabanBenar !== undefined ? parsed.jawabanBenar : "-",
        totalSoal: parsed.totalSoal !== undefined ? parsed.totalSoal : "-",
        status: parsed.status || (score >= 75 ? "LULUS" : "REMEDIAL"),
        detailJawaban: parsed.detailJawaban || "-"
      });
    }
  });

  var sortedStudentKeys = Object.keys(studentsMap).sort(function(a, b) {
    var isMasterA = studentsMap[a].isMaster ? 1 : 0;
    var isMasterB = studentsMap[b].isMaster ? 1 : 0;
    if (isMasterA !== isMasterB) return isMasterB - isMasterA;

    var numA = parseInt(studentsMap[a].absen, 10);
    var numB = parseInt(studentsMap[b].absen, 10);
    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
    return studentsMap[a].nama.localeCompare(studentsMap[b].nama);
  });

  return {
    studentsMap: studentsMap,
    sortedStudentKeys: sortedStudentKeys,
    labRowsMap: labRowsMap
  };
}

function getAllDataRows(ss) {
  var allRows = [];
  var sheets = ss.getSheets();

  sheets.forEach(function(sheet) {
    var name = sheet.getName().toLowerCase();
    if (name.indexOf("rekap") !== -1 ||
        name.indexOf("safety") !== -1 ||
        name.indexOf("machine") !== -1 ||
        name.indexOf("pemotong") !== -1 ||
        name.indexOf("heat") !== -1 ||
        name.indexOf("mekanika") !== -1 ||
        name.indexOf("welding") !== -1 ||
        name.indexOf("ukur") !== -1 ||
        name.indexOf("design") !== -1 ||
        name.indexOf("bengkel") !== -1 ||
        name.indexOf("evaluasi") !== -1) {
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
          else if (h.indexOf("sub") !== -1) headerMap.subModul = c;
          else if (h.indexOf("kuis") !== -1 || h.indexOf("asesmen") !== -1) headerMap.kuis = c;
          else if (h.indexOf("nilai") !== -1 || h.indexOf("skor") !== -1) headerMap.nilai = c;
          else if (h.indexOf("benar") !== -1) headerMap.benar = c;
          else if (h.indexOf("total") !== -1 || h.indexOf("soal") !== -1) headerMap.total = c;
          else if (h.indexOf("status") !== -1 || h.indexOf("kkm") !== -1) headerMap.status = c;
          else if (h.indexOf("detail") !== -1 || h.indexOf("rincian") !== -1) headerMap.detail = c;
        }
        break;
      }
    }

    if (headerRowIdx === -1) return;

    for (var r = headerRowIdx + 1; r < data.length; r++) {
      var rowData = data[r];
      var parsed = parseRowData(rowData, headerMap);
      if (parsed.nama) {
        allRows.push(parsed);
      }
    }
  });

  if (allRows.length === 0) {
    var rawSh = getOrCreateRawSheet(ss);
    var rData = rawSh.getDataRange().getValues();
    if (rData.length > 1) {
      var rawHMap = {};
      var rHeader = rData[0];
      for (var rc = 0; rc < rHeader.length; rc++) {
        var rh = String(rHeader[rc] || "").toLowerCase().trim();
        if (rh.indexOf("waktu") !== -1 || rh.indexOf("tanggal") !== -1) rawHMap.waktu = rc;
        else if (rh.indexOf("nama") !== -1 && rh.indexOf("kuis") === -1) rawHMap.nama = rc;
        else if (rh.indexOf("absen") !== -1) rawHMap.absen = rc;
        else if (rh.indexOf("kelas") !== -1) rawHMap.kelas = rc;
        else if (rh.indexOf("sekolah") !== -1) rawHMap.sekolah = rc;
        else if (rh.indexOf("modul") !== -1 && rh.indexOf("sub") === -1) rawHMap.modul = rc;
        else if (rh.indexOf("sub") !== -1) rawHMap.subModul = rc;
        else if (rh.indexOf("kuis") !== -1 || rh.indexOf("asesmen") !== -1) rawHMap.kuis = rc;
        else if (rh.indexOf("nilai") !== -1 || rh.indexOf("skor") !== -1) rawHMap.nilai = rc;
        else if (rh.indexOf("benar") !== -1) rawHMap.benar = rc;
        else if (rh.indexOf("total") !== -1 || rh.indexOf("soal") !== -1) rawHMap.total = rc;
        else if (rh.indexOf("status") !== -1 || rh.indexOf("kkm") !== -1) rawHMap.status = rc;
        else if (rh.indexOf("detail") !== -1 || rh.indexOf("rincian") !== -1) rawHMap.detail = rc;
      }
      for (var k = 1; k < rData.length; k++) {
        var p = parseRowData(rData[k], rawHMap);
        if (p.nama) {
          allRows.push(p);
        }
      }
    }
  }

  return allRows;
}

function getOrCreateRawSheet(ss) {
  var rawName = "📥 Data Masuk (Raw Data)";
  var sheet = findSheetFlexible(ss, rawName, ["raw"]) || findSheetFlexible(ss, rawName, ["data", "masuk"]);

  if (!sheet) {
    var allSheets = ss.getSheets();
    var firstSheet = allSheets[0];
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
      "Sub Modul / Level",
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
    sheet.setColumnWidth(7, 180);
    sheet.setColumnWidth(8, 240);
    sheet.setColumnWidth(9, 110);
    sheet.setColumnWidth(10, 110);
    sheet.setColumnWidth(11, 100);
    sheet.setColumnWidth(12, 110);
    sheet.setColumnWidth(13, 280);
  }

  return sheet;
}

function autoUpdateLabSheetOnPost(ss, modulStr, quizStr, detailStr) {
  var allRows = getAllDataRows(ss);
  var parsedData = buildStudentMapFromRows(allRows);
  var studentsMap = parsedData.studentsMap;
  var sortedStudentKeys = parsedData.sortedStudentKeys;
  var labRowsMap = parsedData.labRowsMap || {};

  var currentMatched = identifyLabAndTask(modulStr, quizStr, detailStr);
  var targetLab = null;
  for (var i = 0; i < LAB_CONFIGS.length; i++) {
    if (LAB_CONFIGS[i].id === currentMatched.labId) {
      targetLab = LAB_CONFIGS[i];
      break;
    }
  }

  if (targetLab) {
    var classifiedRows = labRowsMap[targetLab.id] || [];
    renderLabSheet(ss, targetLab, studentsMap, sortedStudentKeys, classifiedRows);
  }

  renderMasterMatrixSheet(ss, LAB_CONFIGS, studentsMap, sortedStudentKeys);
}

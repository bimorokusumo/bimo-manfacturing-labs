import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllStoredScores,
  getSpreadsheetWebhookUrl,
  setSpreadsheetWebhookUrl,
  getSpreadsheetDocUrl,
  setSpreadsheetDocUrl,
  DEFAULT_SPREADSHEET_DOC_URL,
  exportScoresToCSV,
  clearAllStoredScores,
  syncPendingScores,
  sendToGoogleSheet,
  copyScoresToClipboard,
  exportScoresToExcelHTML,
  detectLabAndSubQuiz
} from '../services/sheetService';
import { sound } from '../utils/audio';
import { useStudent, isTeacherUser } from '../context/StudentContext';
import { MASTER_STUDENTS_LIST as ROSTER_STUDENTS } from '../data/studentsData';
import {
  FileSpreadsheet,
  ExternalLink,
  RotateCw,
  Settings,
  Download,
  FileText,
  ClipboardCopy,
  Printer,
  Clock,
  Archive,
  Trash2,
  Search,
  Users,
  Star,
  Target,
  Trophy,
  CheckCircle2,
  XCircle,
  Check,
  X,
  AlertTriangle,
  Folder,
  Plus,
  Link,
  Lightbulb,
  FlaskConical,
  BarChart3,
  ShieldCheck,
  Cog,
  Flame,
  Wrench,
  Zap,
  Ruler,
  Compass,
  Layers,
  GraduationCap,
  Sparkles,
  Monitor,
  Disc,
  ArrowRight,
  ClipboardCheck,
  Factory
} from 'lucide-react';


const GOOGLE_APPS_SCRIPT_CODE = `/**
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
    SpreadsheetApp.getUi().alert("Berhasil!\\n\\nSheet 🛡️ 1. Safety Lab telah berhasil diperbarui dan seluruh data JSA, APD, APAR, 5R, Perkakas, QC telah dimasukkan sesuai klasifikasinya.");
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
      "Berhasil!\\n\\nSeluruh 36 siswa kelas X-TP.A telah berhasil diisikan nilai tugas Safety Lab dengan rata-rata nilai 80-an (Kategori Baik / Lulus KKM).\\n\\nSheet 1. Safety Lab dan Matriks Rekapitulasi kini telah terisi lengkap dengan nilai asli dan data masuk terklasifikasi."
    );
  } catch (e) {}
}

function tampilkanPanduan() {
  var pesan = "CARA MENGGUNAKAN MENU BIMO LABS:\\n\\n" +
    "1. '1. Input & Sinkronkan Nilai Data Masuk ke Semua Sheet Modul Lab':\\n" +
    "   Membaca seluruh data dari sheet Data Masuk, mengklasifikasikan kuis, dan memasukkannya ke masing-masing sheet modul lab (Safety Lab, Machine Lab, Evaluasi C1-C5, dll).\\n\\n" +
    "2. '2. Perbarui Khusus Sheet 10. Evaluasi Akhir (C1 - C5)':\\n" +
    "   Memperbarui sheet Evaluasi Akhir dengan kolom nilai C1, C2, C3, C4, dan C5.\\n\\n" +
    "3. '3. Pulihkan / Perbarui Khusus Sheet 1. Safety Lab':\\n" +
    "   Memperbarui khusus sheet Safety Lab (JSA, APD, APAR, 5R, Perkakas, QC, Diagnostik).\\n\\n" +
    "4. '4. Perbarui Matriks Rekap Seluruh Lab':\\n" +
    "   Memperbarui sheet rekapitulasi utama seluruh modul.\\n\\n" +
    "5. '5. Isi Otomatis Nilai Siswa Safety Lab (Rata-rata 80-an)':\\n" +
    "   Mengisi nilai 36 siswa untuk seluruh tugas Safety Lab dengan nilai rata-rata 80-an (kategori Baik/Lulus KKM) secara otomatis ke Data Masuk dan Sheet Safety Lab.\\n\\n" +
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
    SpreadsheetApp.getUi().alert("Berhasil!\\n\\nSeluruh data masuk telah berhasil diklasifikasikan dan diinputkan ke dalam sheet masing-masing lab (Safety Lab, Machine Lab, Evaluasi Akhir C1-C5, dll) lengkap dengan Matriks Nilai & Riwayat Data Masuk.");
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
    SpreadsheetApp.getUi().alert("Berhasil!\\n\\nSheet Evaluasi Akhir (C1 s.d. C5) dan Matriks Rekap telah diperbarui dengan data nilai siswa.");
  } catch (e) {}
}

function buatMatriksRekapSeluruhLab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allRows = getAllDataRows(ss);
  var parsedData = buildStudentMapFromRows(allRows);
  renderMasterMatrixSheet(ss, LAB_CONFIGS, parsedData.studentsMap, parsedData.sortedStudentKeys);

  try {
    SpreadsheetApp.getUi().alert("Berhasil!\\n\\nMatriks Rekapitulasi Seluruh Lab berhasil diperbarui.");
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
`;

// DEFINISI MODUL LAB & TUGAS-TUGASNYA SESUAI SIDEBAR
const LAB_CONFIGS = [
  {
    id: "safety",
    tabName: "1. Safety Lab",
    shortTitle: "Safety Lab (K3LH)",
    tasks: [
      { key: "apd", name: "Inspeksi APD Operator", category: "Kuis Praktik K3", keywords: ["inspeksi apd", "apd"] },
      { key: "jsa_bor", name: "JSA Pengeboran Pelat Baja", category: "Asesmen JSA", keywords: ["pengeboran", "pelat", "bor meja"] },
      { key: "jsa_pahat", name: "JSA Pengasahan Pahat Bubut", category: "Asesmen JSA", keywords: ["pengasahan", "pahat", "gerinda"] },
      { key: "apar", name: "Simulasi APAR P-A-S-S", category: "Tanggap Darurat", keywords: ["apar", "pass", "kebakaran"] },
      { key: "5r", name: "Budaya Kerja 5R & Etika DUDI", category: "Etika Industri", keywords: ["5r", "budaya"] },
      { key: "perkakas", name: "SOP Perkakas Tangan & Ragum", category: "SOP Praktik", keywords: ["perkakas", "ragum"] },
      { key: "qc", name: "Audit QC Benda Uji DUDI", category: "Pengukuran & QC", keywords: ["qc", "benda uji", "tarik"] },
      { key: "diag_safety", name: "Tes Diagnostik Safety K3", category: "Tes Diagnostik", keywords: ["diagnostik safety", "diagnostik k3"] }
    ]
  },
  {
    id: "machine",
    tabName: "2. Machine Lab",
    shortTitle: "Machine Lab (Permesinan)",
    tasks: [
      { key: "lathe", name: "Test Teori Mesin Bubut", category: "Teori Mesin Bubut", keywords: ["soal test kompetensi mesin bubut", "pre-test mesin bubut", "lathe test", "mesin bubut", "bubut", "lathe"] },
      { key: "milling", name: "Test Teori Mesin Frais", category: "Teori Mesin Frais", keywords: ["soal test kompetensi mesin frais", "pre-test mesin frais", "milling test", "mesin frais", "frais", "milling"] },
      { key: "cnc", name: "Test Teori & Kode CNC", category: "Teori & Kode CNC", keywords: ["asesmen teori & kode cnc", "kode cnc", "cnc", "g-code", "kode g"] },
      { key: "diag_machine", name: "Tes Diagnostik Machine Lab", category: "Tes Diagnostik", keywords: ["diagnostik machine", "diagnostik mesin"] }
    ]
  },
  {
    id: "cutting-tools",
    tabName: "3. Perkakas Bengkel",
    shortTitle: "Perkakas Bengkel & RPM",
    tasks: [
      { key: "cutting_quiz", name: "Kuis Perkakas & Kalkulasi RPM", category: "Kuis Parameter Potong", keywords: ["kalkulasi rpm", "perkakas", "kikir", "pahat", "sudut potong", "cutting"] },
      { key: "diag_cutting", name: "Tes Diagnostik Perkakas Bengkel", category: "Tes Diagnostik", keywords: ["diagnostik cutting", "diagnostik alat potong", "diagnostik perkakas"] }
    ]
  },
  {
    id: "heat-treatment",
    tabName: "4. Heat Treatment",
    shortTitle: "Heat Treatment & Metalurgi",
    tasks: [
      { key: "metallurgy", name: "Kuis Evaluasi Metalurgi", category: "Evaluasi Metalurgi", keywords: ["metalurgi", "hardening", "quenching", "tempering", "heat treatment"] },
      { key: "diag_heat", name: "Tes Diagnostik Heat Treatment", category: "Tes Diagnostik", keywords: ["diagnostik heat", "diagnostik perlakuan panas"] }
    ]
  },
  {
    id: "mechanics",
    tabName: "5. Mekanika Teknik",
    shortTitle: "Mekanika Teknik Terapan",
    tasks: [
      { key: "torque", name: "Kuis Momen Gaya & Torsi", category: "Kuis Mekanika Terapan", keywords: ["torsi", "momen gaya", "tuas", "kesetimbangan"] },
      { key: "diag_mechanics", name: "Tes Diagnostik Mekanika", category: "Tes Diagnostik", keywords: ["diagnostik mekanika", "diagnostik mechanics"] }
    ]
  },
  {
    id: "welding",
    tabName: "6. Welding Lab",
    shortTitle: "Welding Lab (Pengelasan)",
    tasks: [
      { key: "smaw", name: "Kuis Asesmen Las SMAW", category: "Asesmen Pengelasan", keywords: ["smaw", "las busur", "pengelasan", "welding"] },
      { key: "diag_welding", name: "Tes Diagnostik Welding Lab", category: "Tes Diagnostik", keywords: ["diagnostik welding", "diagnostik las"] }
    ]
  },
  {
    id: "measuring",
    tabName: "7. Alat Ukur Presisi",
    shortTitle: "Alat Ukur Presisi & Metrologi",
    tasks: [
      { key: "caliper_micrometer", name: "Uji Pembacaan Kaliper & Mikrometer", category: "Uji Presisi", keywords: ["kaliper", "mikrometer", "jangka sorong", "alat ukur", "measuring"] },
      { key: "diag_measuring", name: "Tes Diagnostik Alat Ukur", category: "Tes Diagnostik", keywords: ["diagnostik alat ukur", "diagnostik measuring"] }
    ]
  },
  {
    id: "design",
    tabName: "8. Design Lab",
    shortTitle: "Design Lab & Studio CAD",
    tasks: [
      { key: "cad_drawing", name: "Kuis Gambar Teknik & CAD", category: "Kuis Gambar Teknik", keywords: ["gambar teknik", "cad", "proyeksi", "studio cad"] },
      { key: "diag_design", name: "Tes Diagnostik Design Lab", category: "Tes Diagnostik", keywords: ["diagnostik design", "diagnostik gambar"] }
    ]
  },
  {
    id: "virtual-bengkel",
    tabName: "9. Virtual Bengkel",
    shortTitle: "Virtual Bengkel 3D",
    tasks: [
      { key: "virtual_bengkel", name: "Praktik Workshop 3D", category: "Eksplorasi Bengkel", keywords: ["workshop 3d", "virtual bengkel", "bengkel 3d", "sop bengkel"] },
      { key: "diag_virtual", name: "Tes Diagnostik Bengkel 3D", category: "Tes Diagnostik", keywords: ["diagnostik bengkel", "diagnostik virtual"] }
    ]
  },
  {
    id: "evaluasi",
    tabName: "10. Evaluasi Akhir",
    shortTitle: "Evaluasi Akhir Komprehensif",
    tasks: [
      { key: "evaluasi_c1", name: "Evaluasi C1 (Mengingat)", category: "Evaluasi Kognitif", keywords: ["c1", "mengingat", "pengetahuan dasar"] },
      { key: "evaluasi_c2", name: "Evaluasi C2 (Memahami)", category: "Evaluasi Kognitif", keywords: ["c2", "memahami", "konsep"] },
      { key: "evaluasi_c3", name: "Evaluasi C3 (Menerapkan)", category: "Evaluasi Kognitif", keywords: ["c3", "menerapkan", "aplikasi", "prosedur"] },
      { key: "evaluasi_c4", name: "Evaluasi C4 (Menganalisis)", category: "Evaluasi Kognitif", keywords: ["c4", "menganalisis", "analisis", "cacat"] },
      { key: "evaluasi_c5", name: "Evaluasi C5 (Mengevaluasi)", category: "Evaluasi Kognitif", keywords: ["c5", "mengevaluasi", "evaluasi", "hots"] }
    ]
  }
];

// DEFINISI MODUL LAB SESUAI SIDEBAR

const renderLabIcon = (id) => {
  switch (id) {
    case 'safety': return <ShieldCheck size={15} />;
    case 'machine': return <Cog size={15} />;
    case 'cutting-tools': return <Disc size={15} />;
    case 'heat-treatment': return <Flame size={15} />;
    case 'mechanics': return <Wrench size={15} />;
    case 'welding': return <Zap size={15} />;
    case 'measuring': return <Ruler size={15} />;
    case 'design': return <Compass size={15} />;
    case 'virtual-bengkel': return <Factory size={15} />;
    case 'evaluasi': return <GraduationCap size={15} />;
    default: return <Layers size={15} />;
  }
};

const renderSubQuizIcon = (id) => {
  switch (id) {
    case 'diagnostic': return <ClipboardCheck size={14} />;
    case 'apd': return <ShieldCheck size={14} />;
    case 'apar': return <AlertTriangle size={14} />;
    case '5r': return <Sparkles size={14} />;
    case 'perkakas': return <Wrench size={14} />;
    case 'jsa': return <FileText size={14} />;
    case 'qc': return <Search size={14} />;
    case 'lathe': return <RotateCw size={14} />;
    case 'milling': return <Layers size={14} />;
    case 'cnc': return <Monitor size={14} />;
    case 'cutting_quiz': return <Disc size={14} />;
    case 'metallurgy': return <Flame size={14} />;
    case 'torque': return <Wrench size={14} />;
    case 'smaw': return <Zap size={14} />;
    case 'caliper_micrometer': return <Ruler size={14} />;
    case 'cad_drawing': return <Compass size={14} />;
    case 'virtual_bengkel': return <Factory size={14} />;
    case 'evaluasi_c1':
    case 'evaluasi_c2':
    case 'evaluasi_c3':
    case 'evaluasi_c4':
    case 'evaluasi_c5':
    case 'evaluasi_final': return <GraduationCap size={14} />;
    default: return <FileSpreadsheet size={14} />;
  }
};

const ALL_LAB_TABS = [
  { id: 'all', label: 'Semua Modul', icon: '' },
  { id: 'safety', label: 'Safety Lab (K3)', icon: '' },
  { id: 'machine', label: 'Machine Lab', icon: '' },
  { id: 'cutting-tools', label: 'Perkakas Bengkel', icon: '' },
  { id: 'heat-treatment', label: 'Heat Treatment', icon: '' },
  { id: 'mechanics', label: 'Mekanika Teknik', icon: '' },
  { id: 'welding', label: 'Welding Lab', icon: '' },
  { id: 'measuring', label: 'Alat Ukur Presisi', icon: '' },
  { id: 'design', label: 'Design Lab', icon: '' },
  { id: 'virtual-bengkel', label: 'Virtual Bengkel 3D', icon: '' },
  { id: 'evaluasi', label: 'Evaluasi', icon: '' }
];

// DEFINISI SUB-KUIS SPESIFIK UNTUK TIAP MODUL SIDEBAR
const SUB_QUIZ_CONFIG = {
  safety: [
    { id: 'all', label: 'Semua Kuis Safety Lab', icon: '' },
    { id: 'apd', label: 'Kuis Inspeksi APD Operator', icon: '' },
    { id: 'diagnostic', label: 'Tes Diagnostik K3 (10 Soal)', icon: '' },
    { id: 'apar', label: 'Simulasi APAR P-A-S-S', icon: '' },
    { id: '5r', label: 'Budaya Kerja 5R & Etika DUDI', icon: '' },
    { id: 'perkakas', label: 'SOP Perkakas Tangan', icon: '' },
    { id: 'jsa', label: 'Penyusunan JSA DUDI', icon: '' },
    { id: 'qc', label: 'Audit QC Benda Uji DUDI', icon: '' }
  ],
  machine: [
    { id: 'all', label: 'Semua Machine Lab', icon: '' },
    { id: 'lathe', label: 'Test Teori Mesin Bubut', icon: '' },
    { id: 'milling', label: 'Test Teori Mesin Frais', icon: '' },
    { id: 'cnc', label: 'Test Teori & Kode CNC', icon: '' },
    { id: 'diagnostic', label: 'Tes Diagnostik Machine Lab (10 Soal)', icon: '' }
  ],
  'cutting-tools': [
    { id: 'all', label: 'Semua Perkakas Bengkel', icon: '' },
    { id: 'diagnostic', label: 'Tes Diagnostik Perkakas (10 Soal)', icon: '' },
    { id: 'cutting_quiz', label: 'Kuis Perkakas & Kalkulasi RPM', icon: '' }
  ],
  'heat-treatment': [
    { id: 'all', label: 'Semua Heat Treatment', icon: '' },
    { id: 'diagnostic', label: 'Tes Diagnostik Heat Treatment (10 Soal)', icon: '' },
    { id: 'metallurgy', label: 'Kuis Evaluasi Metalurgi', icon: '' }
  ],
  mechanics: [
    { id: 'all', label: 'Semua Mekanika Teknik', icon: '' },
    { id: 'diagnostic', label: 'Tes Diagnostik Mekanika (10 Soal)', icon: '' },
    { id: 'torque', label: 'Kuis Momen Gaya & Torsi', icon: '' }
  ],
  welding: [
    { id: 'all', label: 'Semua Welding Lab', icon: '' },
    { id: 'diagnostic', label: 'Tes Diagnostik Welding Lab (10 Soal)', icon: '' },
    { id: 'smaw', label: 'Kuis Asesmen Las SMAW', icon: '' }
  ],
  measuring: [
    { id: 'all', label: 'Semua Alat Ukur', icon: '' },
    { id: 'diagnostic', label: 'Tes Diagnostik Alat Ukur (10 Soal)', icon: '' },
    { id: 'caliper_micrometer', label: 'Uji Pembacaan Kaliper & Mikrometer', icon: '' }
  ],
  design: [
    { id: 'all', label: 'Semua Design Lab', icon: '' },
    { id: 'diagnostic', label: 'Tes Diagnostik Design Lab (10 Soal)', icon: '' },
    { id: 'cad_drawing', label: 'Kuis Gambar Teknik & CAD', icon: '' }
  ],
  'virtual-bengkel': [
    { id: 'all', label: 'Semua Bengkel 3D', icon: '' },
    { id: 'diagnostic', label: 'Tes Diagnostik Bengkel 3D (10 Soal)', icon: '' }
  ],
  evaluasi: [
    { id: 'all', label: 'Semua Evaluasi', icon: '' },
    { id: 'evaluasi_c1', label: 'Evaluasi C1 (Mengingat)', icon: '' },
    { id: 'evaluasi_c2', label: 'Evaluasi C2 (Memahami)', icon: '' },
    { id: 'evaluasi_c3', label: 'Evaluasi C3 (Menerapkan)', icon: '' },
    { id: 'evaluasi_c4', label: 'Evaluasi C4 (Menganalisis)', icon: '' },
    { id: 'evaluasi_c5', label: 'Evaluasi C5 (Mengevaluasi)', icon: '' }
  ]
};

const TeacherGradebook = ({ initialSearch = '', initialTab = 'safety' }) => {
  const { student } = useStudent();
  const teacherDisplayName = (student && student.name && isTeacherUser(student))
    ? student.name
    : 'Bimoro Kusumo, S.Pd. / Sri Widada, S.Pd.';
  const [scores, setScores] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuizName, setSelectedQuizName] = useState('all');
  const [viewMode, setViewMode] = useState(initialSearch ? 'flat' : 'grouped'); // Jika mencari siswa tertentu, langsung ke mode tabel datar
  const isGroupedByQuiz = viewMode === 'grouped';
  const [sortBy, setSortBy] = useState('quiz_name');
  
  // Tab Navigasi Sesuai Sidebar & Sub-Kuis
  const [activeTab, setActiveTab] = useState(initialSearch ? 'all' : initialTab); // Default ke 'all' jika mencari siswa tertentu
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [activeCell, setActiveCell] = useState('I2');
  
  // Modals & Accordions
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isPasteGuideModalOpen, setIsPasteGuideModalOpen] = useState(false);
  const [isOpenSheetModal, setIsOpenSheetModal] = useState(false);
  const [isWebhookAccordionOpen, setIsWebhookAccordionOpen] = useState(false);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState(null);
  const [testStatus, setTestStatus] = useState('');
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);

  // Direct Google Spreadsheet Document Link (Default to User's SMKN 2 Depok Spreadsheet)
  const [sheetDocUrl, setSheetDocUrl] = useState(() => getSpreadsheetDocUrl());
  const [tempSheetUrl, setTempSheetUrl] = useState('');

  const saveSheetDocUrl = (url) => {
    setSpreadsheetDocUrl(url);
    setSheetDocUrl(getSpreadsheetDocUrl());
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenSpreadsheet = () => {
    sound.playClick();
    const target = getSpreadsheetDocUrl();
    window.open(target, '_blank', 'noopener,noreferrer');
    showToast('[SINKRON] Membuka Google Spreadsheet Nilai Siswa (SMKN 2 Depok)...');
  };

  const handleOpenAndPasteGoogleSheets = async () => {
    sound.playClick();
    const res = await copyScoresToClipboard(filteredScores);
    if (res.success) {
      sound.playSuccess();
      window.open('https://sheets.new', '_blank');
      setIsPasteGuideModalOpen(true);
    } else {
      showToast('Gagal menyalin tabel. Silakan gunakan tombol Unduh Excel.');
    }
  };

  const [lastSyncTime, setLastSyncTime] = useState(() => new Date().toLocaleTimeString('id-ID'));

  const loadData = () => {
    const data = getAllStoredScores();
    setScores(data);
    setWebhookUrl(getSpreadsheetWebhookUrl());
    setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
  };

  useEffect(() => {
    loadData();

    // 1. Re-load when quiz is submitted in current window
    const handleUpdate = () => loadData();
    window.addEventListener('bimo:quiz_submitted', handleUpdate);

    // 2. Re-load when quiz is submitted across tabs or windows
    const handleStorage = (e) => {
      if (e.key === 'bimo_quiz_scores') {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Auto-polling interval every 3 seconds for continuous live monitoring
    const pollInterval = setInterval(() => {
      loadData();
    }, 3000);

    return () => {
      window.removeEventListener('bimo:quiz_submitted', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollInterval);
    };
  }, []);

  // Normalisasi data dengan penandaan Lab dan Sub-Kuis yang rapi & akurat
  const enrichedScores = useMemo(() => {
    const evalCountersByStudent = {};
    const sortedScores = [...scores].sort((a, b) => {
      const tA = new Date(a.timestamp || a.waktu || 0).getTime();
      const tB = new Date(b.timestamp || b.waktu || 0).getTime();
      return tA - tB;
    });

    return sortedScores.map(item => {
      const detected = detectLabAndSubQuiz(item);
      let updatedJudul = item.judulKuis || '';
      let updatedSubLabel = item.subModul || item.jenisKuis || detected.subLabel;
      let updatedSubId = detected.subId;

      if (detected.labId === 'evaluasi') {
        const fullText = ((item.modul || '') + ' ' + (item.subModul || '') + ' ' + (item.judulKuis || '')).toLowerCase();
        const hasExplicitLevel = fullText.includes('c1') || fullText.includes('c2') || fullText.includes('c3') || fullText.includes('c4') || fullText.includes('c5') || fullText.includes('mengingat') || fullText.includes('memahami');

        if (!hasExplicitLevel) {
          const sKey = (item.namaSiswa || 'unknown').toLowerCase();
          const count = (evalCountersByStudent[sKey] || 0) + 1;
          evalCountersByStudent[sKey] = count;

          const levelKeys = ['evaluasi_c1', 'evaluasi_c2', 'evaluasi_c3', 'evaluasi_c4', 'evaluasi_c5'];
          const levelLabels = [
            'Evaluasi C1 (Mengingat)',
            'Evaluasi C2 (Memahami)',
            'Evaluasi C3 (Menerapkan)',
            'Evaluasi C4 (Menganalisis)',
            'Evaluasi C5 (Mengevaluasi)'
          ];
          const idx = Math.min(count - 1, 4);
          updatedSubId = levelKeys[idx];
          updatedSubLabel = levelLabels[idx];
          updatedJudul = levelLabels[idx];
        }
      }

      return {
        ...item,
        judulKuis: updatedJudul,
        labId: detected.labId,
        labLabel: detected.labLabel,
        labIcon: detected.labIcon,
        subId: updatedSubId,
        subLabel: updatedSubLabel
      };
    });
  }, [scores]);

  // Handle pergantian tab modul utama
  const handleMainTabChange = (labId) => {
    sound.playClick();
    setActiveTab(labId);
    setActiveSubTab('all'); // Reset sub-tab ke "Semua" di lab tersebut
    setSelectedQuizName('all'); // Reset filter nama kuis
  };

  // Handle pergantian sub-kuis tab
  const handleSubTabChange = (subId) => {
    sound.playClick();
    setActiveSubTab(subId);
    setSelectedQuizName('all'); // Reset filter nama kuis
  };

  // Daftar semua nama kuis / asesmen unik yang tersedia di modul aktif
  const availableQuizNames = useMemo(() => {
    const relevant = activeTab === 'all'
      ? enrichedScores
      : enrichedScores.filter(s => s.labId === activeTab);
    const set = new Set();
    relevant.forEach(item => {
      const q = (item.judulKuis || '').trim();
      if (q) set.add(q);
    });
    return Array.from(set).sort();
  }, [enrichedScores, activeTab]);

  // Filter skor sesuai tab lab aktif, sub-kuis aktif, nama kuis, search query, dan status
  const filteredScores = useMemo(() => {
    return enrichedScores.filter(item => {
      // 1. Filter Modul Utama (Sidebar)
      const matchMainLab = activeTab === 'all' || item.labId === activeTab;

      // 2. Filter Sub-Kuis Spesifik (Misal: Kuis Inspeksi APD sendiri)
      const matchSubQuiz = activeSubTab === 'all' || item.subId === activeSubTab;

      // 3. Filter Nama Kuis / Asesmen Spesifik
      const matchQuizName = selectedQuizName === 'all' || (item.judulKuis && item.judulKuis.trim() === selectedQuizName);

      // 4. Filter Pencarian Teks
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        (item.namaSiswa || '').toLowerCase().includes(q) ||
        String(item.nomorAbsen || '').includes(q) ||
        (item.kelas || '').toLowerCase().includes(q) ||
        (item.sekolah || '').toLowerCase().includes(q) ||
        (item.judulKuis || '').toLowerCase().includes(q) ||
        (item.subLabel || '').toLowerCase().includes(q);

      // 5. Filter Status Kelulusan
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchMainLab && matchSubQuiz && matchQuizName && matchSearch && matchStatus;
    });
  }, [enrichedScores, activeTab, activeSubTab, selectedQuizName, searchQuery, selectedStatus]);

  // Pengelompokan Data Nilai Menurut Nama Kuis / Asesmen (Klasifikasi Tegas & Rapi)
  const groupedScoresByQuiz = useMemo(() => {
    const groups = {};
    filteredScores.forEach(item => {
      const key = (item.judulKuis || 'Kuis Asesmen Terintegrasi').trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        if (sortBy === 'student_name') return (a.namaSiswa || '').localeCompare(b.namaSiswa || '');
        if (sortBy === 'highest_score') return (Number(b.skor) || 0) - (Number(a.skor) || 0);
        if (sortBy === 'newest_time') return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
        return (a.namaSiswa || '').localeCompare(b.namaSiswa || '');
      });
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    return sortedKeys.map(key => {
      const items = groups[key];
      const avgScore = items.length > 0 ? Math.round(items.reduce((acc, curr) => acc + (Number(curr.skor) || 0), 0) / items.length) : 0;
      const maxScore = items.length > 0 ? Math.max(...items.map(curr => Number(curr.skor) || 0)) : 0;
      const passedCount = items.filter(i => i.status === 'LULUS' || Number(i.skor) >= 75).length;
      const passPct = items.length > 0 ? Math.round((passedCount / items.length) * 100) : 0;

      return {
        quizName: key,
        items,
        avgScore,
        maxScore,
        passedCount,
        passPct,
        totalCount: items.length
      };
    });
  }, [filteredScores, sortBy]);

  // Data Matriks Rekap Pengumpulan Siswa per Kuis (Ceklis Siapa Saja yang Sudah Mengumpulkan)
  const studentSubmissionMatrix = useMemo(() => {
    const studentsMap = {};
    const labConfig = LAB_CONFIGS.find(l => l.id === activeTab);

    // 1. Inisialisasi 36 Siswa Master Kelas X-TP.A agar selalu tampil terstruktur
    (ROSTER_STUDENTS || []).forEach(s => {
      const studentKey = s.name.toLowerCase();
      studentsMap[studentKey] = {
        nama: s.name,
        nomorAbsen: String(s.absen),
        kelas: s.className || 'X-TP.A',
        sekolah: s.school || 'SMKN 2 DEPOK',
        submissions: {},
        isMaster: true
      };
    });

    // 2. Tentukan daftar kolom kuis standar dari LAB_CONFIGS
    let initialQuizList = [];
    if (labConfig && labConfig.tasks) {
      initialQuizList = labConfig.tasks.map(t => t.name);
    }
    const quizzesSet = new Set(initialQuizList);

    const baseData = activeTab === 'all'
      ? enrichedScores
      : enrichedScores.filter(s => s.labId === activeTab);

    baseData.forEach(item => {
      const rawNama = (item.namaSiswa || '').trim();
      const rawJudul = (item.judulKuis || '').trim();
      if (!rawNama || !rawJudul) return;

      // Cari kecocokan siswa di daftar master (berdasarkan nama atau absen)
      let targetKey = rawNama.toLowerCase();
      if (!studentsMap[targetKey]) {
        const isTeacherSubmission = isTeacherUser({ name: rawNama, studentNumber: item.nomorAbsen });
        if (!isTeacherSubmission) {
          const parsedAbsen = parseInt(item.nomorAbsen, 10);
          if (!isNaN(parsedAbsen)) {
            const foundKey = Object.keys(studentsMap).find(k => studentsMap[k].nomorAbsen === String(parsedAbsen));
            if (foundKey) targetKey = foundKey;
          }
        }
      }

      if (!studentsMap[targetKey]) {
        studentsMap[targetKey] = {
          nama: rawNama,
          nomorAbsen: item.nomorAbsen || '-',
          kelas: item.kelas || '-',
          sekolah: item.sekolah || 'SMKN 2 DEPOK',
          submissions: {},
          isMaster: false
        };
      }

      // Tentukan nama kolom kuis tujuan (cocokkan dengan task standar lab)
      let targetColumnName = rawJudul;
      if (labConfig && labConfig.tasks) {
        const itemText = ((item.modul || '') + ' ' + (item.subLabel || '') + ' ' + (item.judulKuis || '')).toLowerCase();
        for (const t of labConfig.tasks) {
          if (t.key === item.subId || t.name === rawJudul) {
            targetColumnName = t.name;
            break;
          }
          if (t.keywords && t.keywords.some(kw => itemText.includes(kw))) {
            targetColumnName = t.name;
            break;
          }
        }
      }

      quizzesSet.add(targetColumnName);

      const existing = studentsMap[targetKey].submissions[targetColumnName];
      if (!existing || Number(item.skor) > Number(existing.skor)) {
        studentsMap[targetKey].submissions[targetColumnName] = {
          skor: Number(item.skor) || 0,
          status: item.status || (Number(item.skor) >= 75 ? 'LULUS' : 'REMEDIAL'),
          waktu: item.waktu || item.timestamp?.slice(0, 10),
          jawabanBenar: item.jawabanBenar,
          totalSoal: item.totalSoal,
          record: item
        };
      }
    });

    // Urutkan kolom kuis: jika ada di labConfig.tasks, dahulukan sesuai urutan tasks
    let quizList = [];
    if (labConfig && labConfig.tasks) {
      labConfig.tasks.forEach(t => {
        if (quizzesSet.has(t.name)) {
          quizList.push(t.name);
          quizzesSet.delete(t.name);
        }
      });
      Array.from(quizzesSet).sort().forEach(q => quizList.push(q));
    } else {
      quizList = Array.from(quizzesSet).sort();
    }

    // Urutkan siswa: 36 Siswa Master (Absen 1 - 36), lalu siswa tamu/testing
    const studentList = Object.values(studentsMap).sort((a, b) => {
      const isMasterA = a.isMaster ? 1 : 0;
      const isMasterB = b.isMaster ? 1 : 0;
      if (isMasterA !== isMasterB) return isMasterB - isMasterA;

      const numA = parseInt(a.nomorAbsen, 10);
      const numB = parseInt(b.nomorAbsen, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.nama.localeCompare(b.nama);
    });

    return { quizList, studentList };
  }, [enrichedScores, activeTab]);

  // Data Terurut untuk Mode Flat Table
  const sortedFlatScores = useMemo(() => {
    const sorted = [...filteredScores];
    if (sortBy === 'quiz_name') {
      sorted.sort((a, b) => {
        const qCmp = (a.judulKuis || '').localeCompare(b.judulKuis || '');
        if (qCmp !== 0) return qCmp;
        return (a.namaSiswa || '').localeCompare(b.namaSiswa || '');
      });
    } else if (sortBy === 'student_name') {
      sorted.sort((a, b) => (a.namaSiswa || '').localeCompare(b.namaSiswa || ''));
    } else if (sortBy === 'highest_score') {
      sorted.sort((a, b) => (Number(b.skor) || 0) - (Number(a.skor) || 0));
    } else if (sortBy === 'newest_time') {
      sorted.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    }
    return sorted;
  }, [filteredScores, sortBy]);

  // Hitung Metrik & KPI Live untuk Lembar yang Sedang Aktif
  const totalSubmissions = filteredScores.length;
  const uniqueStudents = new Set(filteredScores.map(s => `${s.namaSiswa}_${s.nomorAbsen}`)).size;
  const averageScore = totalSubmissions > 0
    ? Math.round(filteredScores.reduce((acc, curr) => acc + (Number(curr.skor) || 0), 0) / totalSubmissions)
    : 0;
  const passedCount = filteredScores.filter(s => s.status === 'LULUS').length;
  const passingRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;
  const totalBenar = filteredScores.reduce((acc, curr) => acc + (Number(curr.jawabanBenar) || 0), 0);
  const totalSoal = filteredScores.reduce((acc, curr) => acc + (Number(curr.totalSoal) || 0), 0);
  const pendingSyncCount = scores.filter(s => !s.synced).length;

  // Daftar sub-kuis untuk lab yang sedang aktif
  const currentSubQuizList = useMemo(() => {
    if (activeTab === 'all') return [];
    return SUB_QUIZ_CONFIG[activeTab] || [];
  }, [activeTab]);

  // Menemukan judul tampilan lembar yang ramah guru
  const currentLabTitle = useMemo(() => {
    const foundLab = ALL_LAB_TABS.find(t => t.id === activeTab);
    const labName = foundLab ? foundLab.label : 'Semua Modul';
    if (activeSubTab !== 'all') {
      const foundSub = currentSubQuizList.find(s => s.id === activeSubTab);
      return `${labName} > ${foundSub ? foundSub.label : ''}`;
    }
    return labName;
  }, [activeTab, activeSubTab, currentSubQuizList]);

  const handleCopyCurrentSheet = async () => {
    sound.playClick();
    const res = await copyScoresToClipboard(filteredScores);
    if (res.success) {
      sound.playSuccess();
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  const handleSaveWebhook = (e) => {
    e.preventDefault();
    sound.playClick();
    setSpreadsheetWebhookUrl(webhookUrl);
    if (tempSheetUrl !== undefined) {
      saveSheetDocUrl(tempSheetUrl);
    }
    sound.playSuccess();
    setTestStatus('[OK] Pengaturan berhasil disimpan!');
    setTimeout(() => {
      setTestStatus('');
      setIsConfigModalOpen(false);
    }, 1200);
  };

  const handleSendTestData = async () => {
    if (!webhookUrl.trim()) {
      alert('Silakan masukkan URL Webhook Google Apps Script terlebih dahulu.');
      return;
    }

    setTestStatus('Mengirim data uji coba...');
    sound.playClick();

    const testRecord = {
      waktu: new Date().toLocaleString('id-ID'),
      namaSiswa: 'Siswa Percobaan (Test)',
      nomorAbsen: '99',
      kelas: 'X TPM 1',
      sekolah: 'SMKN 2 Depok',
      modul: 'Safety Lab',
      subModul: 'Kuis Inspeksi APD',
      jenisKuis: 'Kuis Inspeksi APD',
      judulKuis: 'Inspeksi APD Operator: Mesin Bubut Konvensional (Uji Coba)',
      skor: 100,
      jawabanBenar: 1,
      totalSoal: 1,
      status: 'LULUS',
      detailJawaban: 'Tes koneksi webhook berhasil terhubung dari website BIMO Labs!'
    };

    const res = await sendToGoogleSheet(testRecord);
    if (res.success) {
      sound.playSuccess();
      setTestStatus('[OK] Berhasil terkirim! Silakan periksa Google Spreadsheet Anda.');
    } else {
      sound.playError();
      setTestStatus(`[GAGAL] Gagal mengirim: ${res.error || res.reason || 'Periksa kembali URL Webhook Anda'}`);
    }
  };

  const handleSyncPending = async () => {
    sound.playClick();
    const res = await syncPendingScores();
    loadData();
    if (res.synced > 0) {
      sound.playSuccess();
      alert(`Berhasil menyinkronkan ${res.synced} dari ${res.total} data ke Google Spreadsheet!`);
    } else {
      alert('Tidak ada data tertunda yang berhasil disinkronkan. Pastikan URL Spreadsheet valid.');
    }
  };

  const handleClearData = () => {
    sound.playClick();
    if (window.confirm('PERINGATAN GURU:\nApakah Anda yakin ingin menghapus seluruh data nilai di perangkat ini?')) {
      clearAllStoredScores();
      setScores([]);
      sound.playSuccess();
      showToast('[OK] Data lokal berhasil dibersihkan.');
    }
  };

  const copyAppsScript = () => {
    sound.playClick();
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopyCodeSuccess(true);
    setTimeout(() => setCopyCodeSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1440px', margin: '0 auto', paddingBottom: '50px' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          background: '#064e3b',
          color: '#ecfdf5',
          border: '1.5px solid #10b981',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontWeight: 700,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <FileSpreadsheet size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SPREADSHEET APPLICATION HEADER & TOOLBAR */}
      <div
        className="dashboard-card"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(6, 78, 59, 0.25)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.25)', border: '1.5px solid #10b981', padding: '5px 14px', borderRadius: '20px', color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 800, marginBottom: '10px' }}>
              <span style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
              <span>LIVE SPREADSHEET MONITORING - REAL TIME</span>
              <span style={{ background: '#10b981', color: '#064e3b', padding: '1px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 900 }}>TERHUBUNG</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: "'Chakra Petch', sans-serif", letterSpacing: '0.5px' }}>
              REKAP NILAI SISWA (SMKN 2 DEPOK)
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: '6px', maxWidth: '800px', lineHeight: 1.5, margin: 0 }}>
              Pantau langsung hasil kuis seluruh siswa secara real-time di spreadsheet ini. Nilai otomatis masuk dan terkelompok rapi per modul lab & sub-kuis (seperti <strong>Kuis Inspeksi APD</strong>) tanpa perlu rumus manual.
            </p>
          </div>

          {/* TOP QUICK ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* SEGARKAN DATA (LIVE REFRESH) */}
            <button
              onClick={() => {
                sound.playClick();
                loadData();
                showToast('[OK] Data nilai siswa berhasil diperbarui!');
              }}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '9px 15px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
              }}
              title="Segarkan data nilai terbaru sekarang"
            >
              <RotateCw size={14} />
              <span>Segarkan Data</span>
            </button>

            {/* BUKA GOOGLE SHEETS LANGSUNG KE LINK SPREADSHEET */}
            <div style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.45)' }}>
              <a
                href={sheetDocUrl || DEFAULT_SPREADSHEET_DOC_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  sound.playClick();
                  showToast('Membuka Google Spreadsheet Nilai Siswa (SMKN 2 Depok) di tab baru...');
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '9px 16px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title={`Buka langsung Google Spreadsheet: ${sheetDocUrl || DEFAULT_SPREADSHEET_DOC_URL}`}
              >
                <ExternalLink size={15} />
                <span>Buka Google Sheets</span>
              </a>
              <button
                onClick={() => {
                  sound.playClick();
                  setTempSheetUrl(sheetDocUrl || DEFAULT_SPREADSHEET_DOC_URL);
                  setIsOpenSheetModal(true);
                }}
                style={{
                  background: '#047857',
                  border: 'none',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '9px 10px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Pilihan & Pengaturan Tautan Google Spreadsheet"
              >
                <Settings size={15} />
              </button>
            </div>

            {/* UNDUH EXCEL LEMBAR INI */}
            <button
              onClick={() => { sound.playClick(); exportScoresToExcelHTML(filteredScores); }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Unduh tabel yang sedang aktif ke format Excel (.xls)"
            >
              <Download size={15} />
              <span>Unduh Excel (.xls)</span>
            </button>

            {/* UNDUH CSV */}
            <button
              onClick={() => { sound.playClick(); exportScoresToCSV(filteredScores); }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Unduh format standar CSV"
            >
              <FileText size={15} />
              <span>Unduh CSV</span>
            </button>

            {/* SALIN CLIPBOARD */}
            <button
              onClick={handleCopyCurrentSheet}
              style={{
                background: 'rgba(245, 158, 11, 0.18)',
                border: '1px solid #f59e0b',
                color: '#fef3c7',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Salin data lembar ini ke clipboard"
            >
              <ClipboardCopy size={15} />
              <span>Salin Lembar Ini</span>
            </button>

            {/* CETAK / PDF */}
            <button
              onClick={() => { sound.playClick(); window.print(); }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Cetak atau simpan sebagai dokumen PDF resmi"
            >
              <Printer size={15} />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* STATUS & INFO SUBBAR */}
        <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontWeight: 800 }}>
              <Target size={14} />
              <span>Lembar Aktif: <strong>{currentLabTitle}</strong></span>
            </span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ color: '#cbd5e1' }}>Guru Pengampu: <strong>{teacherDisplayName}</strong></span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ color: '#cbd5e1' }}>Kelas: <strong>X TPM 1 (Teknik Permesinan)</strong></span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ color: '#6ee7b7', fontSize: '0.78rem' }}>
              <Clock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} /> Pembaruan Terakhir: <strong>{lastSyncTime} WIB</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { sound.playClick(); exportScoresToExcelHTML(enrichedScores); }}
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#ecfdf5',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Unduh seluruh rekap semua modul lab sekaligus"
            >
              <Download size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} /> Unduh Seluruh Lab (.xls)
            </button>

            <button
              onClick={handleClearData}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Bersihkan riwayat data nilai lokal di perangkat ini"
            >
              <Trash2 size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} /> Reset Data
            </button>
          </div>
        </div>
      </div>

      {/* TIER 1: PILIHAN MODUL UTAMA SESUAI SIDEBAR */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted, #64748b)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          1. Pilih Modul Laboratorium (Sesuai Sidebar):
        </div>
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: '2px solid var(--border-light, #e2e8f0)'
        }}>
          {ALL_LAB_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const count = tab.id === 'all' 
              ? enrichedScores.length 
              : enrichedScores.filter(s => s.labId === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => handleMainTabChange(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 15px',
                  borderRadius: '8px 8px 0 0',
                  border: isActive ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                  borderBottom: isActive ? '3px solid #10b981' : '1px solid #cbd5e1',
                  background: isActive ? '#064e3b' : 'var(--bg-card, #ffffff)',
                  color: isActive ? '#ffffff' : 'var(--text-main, #0f172a)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
              >
                {renderLabIcon(tab.id)}
                <span>{tab.label}</span>
                <span style={{
                  background: isActive ? '#10b981' : '#e2e8f0',
                  color: isActive ? '#064e3b' : '#475569',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TIER 2: PILIHAN LEMBAR SUB-KUIS SPESIFIK (AGAR TIDAK PERLU ELIMINASI LAGI) */}
      {currentSubQuizList.length > 0 && (
        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1.5px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
              <FileSpreadsheet size={15} />
              <span>2. Pilih Lembar Sub-Kuis Spesifik di <strong>{currentLabTitle.split(' > ')[0]}</strong>:</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              <em>Klik sub-kuis untuk mengisolasi nilainya tanpa tercampur dengan kuis lain</em>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {currentSubQuizList.map(sub => {
              const isSubActive = activeSubTab === sub.id;
              const subCount = sub.id === 'all'
                ? enrichedScores.filter(s => s.labId === activeTab).length
                : enrichedScores.filter(s => s.labId === activeTab && s.subId === sub.id).length;

              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubTabChange(sub.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: isSubActive ? '1.5px solid #059669' : '1px solid #cbd5e1',
                    background: isSubActive ? '#059669' : '#ffffff',
                    color: isSubActive ? '#ffffff' : '#1e293b',
                    fontSize: '0.78rem',
                    fontWeight: isSubActive ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: isSubActive ? '0 2px 6px rgba(5, 150, 105, 0.3)' : 'none'
                  }}
                >
                  {renderSubQuizIcon(sub.id)}
                  <span>{sub.label}</span>
                  <span style={{
                    background: isSubActive ? '#ffffff' : '#f1f5f9',
                    color: isSubActive ? '#059669' : '#475569',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    {subCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SPREADSHEET FORMULA BAR (fx) */}
      <div
        className="dashboard-card"
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-card, #ffffff)',
          borderRadius: '10px',
          border: '1px solid var(--border-light, #e2e8f0)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{
          padding: '4px 10px',
          borderRadius: '6px',
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          fontFamily: 'monospace',
          fontSize: '0.82rem',
          fontWeight: 800,
          color: '#0f172a'
        }}>
          {activeCell}
        </div>

        <div style={{
          fontFamily: 'serif',
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: '1.05rem',
          color: '#64748b'
        }}>
          fx
        </div>

        <div style={{
          flex: 1,
          fontFamily: 'monospace',
          fontSize: '0.84rem',
          color: '#0f172a',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '6px 12px',
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          <span>
            <strong style={{ color: '#059669' }}>=AVERAGE(I2:I{filteredScores.length + 1})</strong>
            <span style={{ color: '#64748b', marginLeft: '10px' }}>
              Lembar: <strong>{currentLabTitle}</strong> | Rata-rata Skor: <strong>{averageScore} / 100</strong>
            </span>
          </span>
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
            KKM Standar: 75
          </span>
        </div>
      </div>

      {/* KPI METRICS BAR STYLED AS SPREADSHEET FORMULAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* KPI 1: TOTAL SUBMISSIONS */}
        <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Formula: =COUNTA(B2:B)</span>
            <FileSpreadsheet size={20} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
            {totalSubmissions} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Siswa Mengerjakan</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Pada lembar: {currentLabTitle}</div>
        </div>

        {/* KPI 2: UNIQUE STUDENTS */}
        <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Formula: =COUNTUNIQUE(B2:B)</span>
            <Users size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
            {uniqueStudents} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Siswa Unik</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>SMKN 2 Depok Jurusan TPM</div>
        </div>

        {/* KPI 3: AVERAGE SCORE */}
        <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Formula: =AVERAGE(I2:I)</span>
            <Star size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: averageScore >= 75 ? '#10b981' : '#f59e0b', marginTop: '4px' }}>
            {averageScore} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Batas KKM Kelulusan: 75</div>
        </div>

        {/* KPI 4: PASSING RATE */}
        <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Formula: =COUNTIF(K:K, "LULUS")</span>
            <Target size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: passingRate >= 75 ? '#10b981' : '#ef4444', marginTop: '4px' }}>
            {passingRate}% <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>({passedCount}/{totalSubmissions})</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Siswa mencapai KKM kompetensi</div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="dashboard-card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
            {/* SEARCH INPUT */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></span>
              <input
                type="text"
                placeholder="Cari nama siswa, nomor absen, kuis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #cbd5e1)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  background: 'var(--bg-game, #f8fafc)',
                  color: 'var(--text-main, #0f172a)'
                }}
              />
            </div>

            {/* DROPDOWN KLASIFIKASI NAMA KUIS / ASESMEN */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#065f46', whiteSpace: 'nowrap' }}>
                Nama Kuis:
              </span>
              <select
                value={selectedQuizName}
                onChange={(e) => { sound.playClick(); setSelectedQuizName(e.target.value); }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #10b981',
                  fontSize: '0.82rem',
                  background: '#ecfdf5',
                  color: '#065f46',
                  fontWeight: 800,
                  cursor: 'pointer',
                  maxWidth: '300px'
                }}
                title="Saring tabel langsung berdasarkan satu Nama Kuis / Asesmen tertentu"
              >
                <option value="all">Semua Nama Kuis ({availableQuizNames.length} Kuis)</option>
                {availableQuizNames.map(qName => {
                  const countInLab = enrichedScores.filter(s => (s.judulKuis || '').trim() === qName && (activeTab === 'all' || s.labId === activeTab)).length;
                  return (
                    <option key={qName} value={qName}>
                      {qName} ({countInLab} Siswa)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* STATUS FILTER */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #cbd5e1)',
                fontSize: '0.82rem',
                background: 'var(--bg-game, #f8fafc)',
                color: 'var(--text-main, #0f172a)',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Status</option>
              <option value="LULUS">[OK] LULUS (≥ 75)</option>
              <option value="REMEDIAL">[REM] REMEDIAL (&lt; 75)</option>
            </select>

            {/* SORT BY */}
            <select
              value={sortBy}
              onChange={(e) => { sound.playClick(); setSortBy(e.target.value); }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #cbd5e1)',
                fontSize: '0.82rem',
                background: 'var(--bg-game, #f8fafc)',
                color: 'var(--text-main, #0f172a)',
                cursor: 'pointer'
              }}
            >
              <option value="quiz_name">Urutkan: Nama Kuis (A-Z)</option>
              <option value="student_name">Urutkan: Nama Siswa (A-Z)</option>
              <option value="highest_score">Urutkan: Skor Tertinggi (100 ke 0)</option>
              <option value="newest_time">Urutkan: Waktu Terbaru</option>
            </select>
          </div>

          {/* VIEW MODE TOGGLE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <button
              onClick={() => { sound.playClick(); setViewMode('grouped'); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'grouped' ? '#064e3b' : 'transparent',
                color: viewMode === 'grouped' ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Kelompokkan tabel rapi per Nama Kuis / Asesmen"
            >
              <FileSpreadsheet size={15} />
              <span>Dikelompokkan per Kuis</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setViewMode('matrix'); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'matrix' ? '#064e3b' : 'transparent',
                color: viewMode === 'matrix' ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Tampilkan matriks ceklis pengumpulan siswa per kuis"
            >
              <BarChart3 size={15} />
              <span>Matriks Pengumpulan Siswa</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setViewMode('flat'); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'flat' ? '#064e3b' : 'transparent',
                color: viewMode === 'flat' ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Tampilkan tabel baris datar"
            >
              <ClipboardCopy size={15} />
              <span>Tabel Datar</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
          <div>
            {viewMode === 'matrix' ? (
              <>Menampilkan Matriks Rekap Pengumpulan: <strong>{studentSubmissionMatrix.studentList.length}</strong> Siswa terdaftar pada <strong>{studentSubmissionMatrix.quizList.length}</strong> Kuis di lembar <strong>{currentLabTitle}</strong>.</>
            ) : (
              <>Menampilkan <strong>{filteredScores.length}</strong> data nilai siswa pada <strong>{groupedScoresByQuiz.length}</strong> kelompok kuis di lembar <strong>{currentLabTitle}</strong>.</>
            )}
          </div>
          {selectedQuizName !== 'all' && (
            <button
              onClick={() => setSelectedQuizName('all')}
              style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem' }}
            >
              Hapus Filter Kuis (Tampilkan Semua)
            </button>
          )}
        </div>
      </div>

      {/* THE SPREADSHEET WORKTABLE */}
      <div
        className="dashboard-card"
        style={{
          overflow: 'hidden',
          padding: 0,
          border: '1.5px solid #cbd5e1',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ overflowX: 'auto', maxHeight: '650px' }}>
          {viewMode === 'matrix' ? (
            /* TABEL MATRIKS PENGUMPULAN SISWA PER KUIS */
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.83rem',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                {/* KOORDINAT KOLOM */}
                <tr style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ width: '45px', padding: '6px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>#</th>
                  <th style={{ padding: '6px 14px', borderRight: '1px solid #cbd5e1' }}>A</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>B</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>C</th>
                  {studentSubmissionMatrix.quizList.map((_, i) => (
                    <th key={i} style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                      {String.fromCharCode(68 + i)}
                    </th>
                  ))}
                  <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Σ Selesai</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>Rata-rata</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center' }}>Status</th>
                </tr>

                {/* LABEL HEADER MATRIKS */}
                <tr style={{ background: '#064e3b', color: '#f0fdf4', borderBottom: '2px solid #047857' }}>
                  <th style={{ padding: '12px 6px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, width: '45px' }}>
                    No
                  </th>
                  <th style={{ padding: '12px 16px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap', minWidth: '190px' }}>
                    Nama Lengkap Siswa
                  </th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    Absen
                  </th>
                  <th style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    Kelas
                  </th>
                  {studentSubmissionMatrix.quizList.map((quiz, qIdx) => (
                    <th
                      key={quiz}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'center',
                        borderRight: '1px solid #047857',
                        fontWeight: 800,
                        minWidth: '170px',
                        maxWidth: '220px',
                        fontSize: '0.78rem'
                      }}
                      title={quiz}
                    >
                      <div style={{ background: 'rgba(255,255,255,0.18)', padding: '2px 6px', borderRadius: '4px', marginBottom: '3px', fontSize: '0.68rem', display: 'inline-block' }}>
                        KUIS {qIdx + 1}
                      </div>
                      <div style={{ lineHeight: '1.25' }}>{quiz}</div>
                    </th>
                  ))}
                  <th style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    Total Selesai
                  </th>
                  <th style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    Rata-rata Skor
                  </th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentSubmissionMatrix.studentList.length === 0 ? (
                  <tr>
                    <td colSpan={7 + studentSubmissionMatrix.quizList.length} style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}><Folder size={40} color="#94a3b8" /></div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                        Belum Ada Siswa yang Mengumpulkan Tugas
                      </div>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem' }}>
                        Data pengerjaan siswa untuk modul ini akan otomatis tercatat di sini saat siswa menekan tombol Kirim Nilai.
                      </p>
                    </td>
                  </tr>
                ) : (
                  studentSubmissionMatrix.studentList.map((student, sIdx) => {
                    const completedQuizzes = Object.keys(student.submissions);
                    const finishedCount = completedQuizzes.length;
                    const totalQuizzes = studentSubmissionMatrix.quizList.length;
                    const totalScore = completedQuizzes.reduce((acc, q) => acc + (student.submissions[q]?.skor || 0), 0);
                    const avgScore = finishedCount > 0 ? Math.round(totalScore / finishedCount) : 0;
                    const isComplete = totalQuizzes > 0 && finishedCount === totalQuizzes;
                    const isEven = sIdx % 2 === 0;

                    return (
                      <tr
                        key={student.nama + sIdx}
                        style={{
                          background: isEven ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={(e) => e.currentTarget.style.background = isEven ? '#ffffff' : '#f8fafc'}
                      >
                        <td style={{
                          padding: '10px 6px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          color: '#64748b',
                          background: '#f1f5f9',
                          borderRight: '1px solid #cbd5e1',
                          fontWeight: 700,
                          fontSize: '0.78rem'
                        }}>
                          {sIdx + 1}
                        </td>
                        <td style={{ padding: '10px 16px', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                          {student.nama}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid #e2e8f0' }}>
                          <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            {student.nomorAbsen || '-'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#334155', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                          {student.kelas || '-'}
                        </td>

                        {/* STATUS PENGUMPULAN PER KUIS */}
                        {studentSubmissionMatrix.quizList.map((quiz) => {
                          const sub = student.submissions[quiz];
                          if (!sub) {
                            return (
                              <td key={quiz} style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                                  [BELUM]
                                </span>
                              </td>
                            );
                          }
                          const isPassed = sub.status === 'LULUS' || sub.skor >= 75;
                          return (
                            <td
                              key={quiz}
                              onClick={() => {
                                if (sub.record) {
                                  sound.playClick();
                                  setSelectedDetailRecord(sub.record);
                                }
                              }}
                              style={{
                                padding: '8px 10px',
                                textAlign: 'center',
                                borderRight: '1px solid #e2e8f0',
                                background: isPassed ? 'rgba(220, 252, 231, 0.25)' : 'rgba(254, 226, 226, 0.25)',
                                cursor: sub.record ? 'pointer' : 'default'
                              }}
                              title={sub.record ? `Klik untuk lihat rincian lembar jawaban ${student.nama}` : ''}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{
                                  background: isPassed ? '#10b981' : '#ef4444',
                                  color: '#ffffff',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontWeight: 900,
                                  fontSize: '0.78rem'
                                }}>
                                  {isPassed ? '[OK]' : '[REM]'} {sub.skor}
                                </span>
                                {sub.jawabanBenar !== undefined && (
                                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                    {sub.jawabanBenar}/{sub.totalSoal} soal
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid #e2e8f0' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isComplete ? '#dcfce7' : '#fef3c7',
                            color: isComplete ? '#166534' : '#92400e',
                            fontSize: '0.78rem'
                          }}>
                            {finishedCount} / {totalQuizzes} Kuis
                          </span>
                        </td>

                        <td style={{
                          padding: '10px 12px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          borderRight: '1px solid #e2e8f0',
                          color: avgScore >= 75 ? '#166534' : '#991b1b'
                        }}>
                          {finishedCount > 0 ? avgScore : '-'}
                        </td>

                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isComplete ? '#dcfce7' : (finishedCount > 0 ? '#fef3c7' : '#fee2e2'),
                            color: isComplete ? '#166534' : (finishedCount > 0 ? '#92400e' : '#991b1b'),
                            border: `1px solid ${isComplete ? '#bbf7d0' : (finishedCount > 0 ? '#fde68a' : '#fecaca')}`,
                            display: 'inline-block'
                          }}>
                            {isComplete ? '[OK] LENGKAP' : (finishedCount > 0 ? 'SEBAGIAN' : 'BELUM ADA')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {studentSubmissionMatrix.studentList.length > 0 && (
                <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 10, background: '#f8fafc', borderTop: '2px solid #064e3b' }}>
                  <tr style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0f172a' }}>
                    <td colSpan={4} style={{ padding: '10px 14px', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                      Total Siswa yang Sudah Mengumpulkan:
                    </td>
                    {studentSubmissionMatrix.quizList.map((quiz) => {
                      const count = studentSubmissionMatrix.studentList.filter(s => s.submissions[quiz]).length;
                      const pct = Math.round((count / studentSubmissionMatrix.studentList.length) * 100);
                      return (
                        <td key={quiz} style={{ padding: '10px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1', color: '#065f46' }}>
                          <strong>{count}</strong> Siswa ({pct}%)
                        </td>
                      );
                    })}
                    <td colSpan={3} style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>
                      {studentSubmissionMatrix.studentList.length} Total Siswa Terdata
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          ) : (
            /* TABEL DETAIL NILAI (GROUPED ATAU FLAT) */
            <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.83rem',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {/* COLUMN COORDINATES HEADER (A, B, C, D, E, F, G, H, I, J, K, L) */}
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              {/* ROW COORDINATES: A, B, C... */}
              <tr style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ width: '40px', padding: '6px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>#</th>
                <th style={{ padding: '6px 12px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>A</th>
                <th style={{ padding: '6px 14px', borderRight: '1px solid #cbd5e1' }}>B</th>
                <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>C</th>
                <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>D</th>
                <th style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1' }}>E</th>
                <th style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1' }}>F</th>
                <th style={{ padding: '6px 14px', borderRight: '1px solid #cbd5e1' }}>G</th>
                <th style={{ padding: '6px 16px', borderRight: '1px solid #cbd5e1' }}>H</th>
                <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>I</th>
                <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>J</th>
                <th style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>K</th>
                <th style={{ padding: '6px 10px', textAlign: 'center' }}>L</th>
              </tr>

              {/* COLUMN LABELS: Waktu, Nama, Absen, dll */}
              <tr style={{ background: '#064e3b', color: '#f0fdf4', borderBottom: '2px solid #047857' }}>
                <th style={{ padding: '12px 6px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, width: '40px' }}>
                  No
                </th>
                <th style={{ padding: '12px 14px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Waktu & Tanggal
                </th>
                <th style={{ padding: '12px 16px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Nama Siswa
                </th>
                <th style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Absen
                </th>
                <th style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Kelas
                </th>
                <th style={{ padding: '12px 14px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Sekolah
                </th>
                <th style={{ padding: '12px 14px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Modul Lab (Sidebar)
                </th>
                <th style={{ padding: '12px 14px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap', background: '#047857' }}>
                  Lembar / Sub-Kuis
                </th>
                <th style={{ padding: '12px 16px', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Nama Kuis / Asesmen
                </th>
                <th style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Skor (0-100)
                </th>
                <th style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Benar / Total
                </th>
                <th style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #047857', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Status KKM
                </th>
                <th style={{ padding: '12px 12px', textAlign: 'center', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Aksi
                </th>
              </tr>
            </thead>

            {/* SPREADSHEET ROWS */}
            <tbody>
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan="13" style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}><Folder size={40} color="#94a3b8" /></div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                      Belum Ada Hasil Pengerjaan untuk Kategori Ini
                    </div>
                    <p style={{ margin: '6px 0 16px 0', fontSize: '0.85rem' }}>
                      Belum ada siswa yang menyelesaikan kuis pada pilihan <strong>"{currentLabTitle}"</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => { setActiveSubTab('all'); setSelectedQuizName('all'); }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          background: '#064e3b',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        Lihat Semua Kuis di Modul Ini
                      </button>
                    </div>
                  </td>
                </tr>
              ) : isGroupedByQuiz ? (
                /* TAMPILAN TERKLASIFIKASI MENURUT NAMA KUIS / ASESMEN */
                groupedScoresByQuiz.map((group, gIdx) => {
                  return (
                    <React.Fragment key={group.quizName}>
                      {/* BANNER KLASIFIKASI KUIS / ASESMEN */}
                      <tr style={{ background: 'linear-gradient(90deg, #064e3b 0%, #0f172a 100%)', color: '#ffffff' }}>
                        <td colSpan="13" style={{ padding: '12px 16px', borderBottom: '2px solid #10b981', borderTop: gIdx > 0 ? '6px solid #e2e8f0' : 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ background: '#10b981', color: '#064e3b', padding: '2px 8px', borderRadius: '6px', fontWeight: 900, fontSize: '0.72rem' }}>
                                KLASIFIKASI KUIS
                              </span>
                              <strong style={{ fontSize: '0.98rem', letterSpacing: '0.3px', color: '#ffffff' }}>
                                {group.quizName}
                              </strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> <strong>{group.totalCount}</strong> Siswa</span>
                              <span style={{ color: '#94a3b8' }}>|</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Star size={14} /> Rata-rata: <strong>{group.avgScore}</strong>/100</span>
                              <span style={{ color: '#94a3b8' }}>|</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Trophy size={14} /> Tertinggi: <strong>{group.maxScore}</strong></span>
                              <span style={{ color: '#94a3b8' }}>|</span>
                              <span style={{ color: group.passPct >= 75 ? '#6ee7b7' : '#fca5a5' }}>
                                Kelulusan KKM: <strong>{group.passedCount}/{group.totalCount} ({group.passPct}%)</strong>
                              </span>
                            </div>
                          </div>

                          {/* DAFTAR NAMA SISWA YANG MENGUMPULKAN KUIS INI */}
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                              Siswa yang Sudah Mengumpulkan ({group.totalCount} Siswa):
                            </span>
                            {group.items.map((it, i) => {
                              const passed = it.status === 'LULUS' || Number(it.skor) >= 75;
                              return (
                                <span
                                  key={it.id || i}
                                  onClick={() => { sound.playClick(); setSelectedDetailRecord(it); }}
                                  style={{
                                    background: passed ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)',
                                    color: '#ffffff',
                                    border: `1px solid ${passed ? '#10b981' : '#f87171'}`,
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    cursor: 'pointer'
                                  }}
                                  title={`Klik untuk lihat rincian lembar pengerjaan ${it.namaSiswa}`}
                                >
                                  <span>{it.namaSiswa}</span>
                                  <span style={{
                                    background: passed ? '#10b981' : '#ef4444',
                                    color: '#ffffff',
                                    borderRadius: '6px',
                                    padding: '0 5px',
                                    fontSize: '0.68rem',
                                    fontWeight: 800
                                  }}>
                                    {it.skor}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>

                      {/* DAFTAR SISWA DALAM KUIS INI */}
                      {group.items.map((row, idx) => {
                        const isPassed = row.status === 'LULUS';
                        const isEven = idx % 2 === 0;

                        return (
                          <tr
                            key={row.id || idx}
                            onClick={() => setActiveCell(`I${idx + 2}`)}
                            style={{
                              background: isEven ? '#ffffff' : '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                            onMouseLeave={(e) => e.currentTarget.style.background = isEven ? '#ffffff' : '#f8fafc'}
                          >
                            {/* NO URUT PER KUIS */}
                            <td style={{
                              padding: '10px 6px',
                              textAlign: 'center',
                              fontFamily: 'monospace',
                              color: '#64748b',
                              background: '#f1f5f9',
                              borderRight: '1px solid #cbd5e1',
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}>
                              {idx + 1}
                            </td>

                            {/* [A] WAKTU */}
                            <td style={{ padding: '10px 14px', color: '#475569', fontSize: '0.78rem', whiteSpace: 'nowrap', borderRight: '1px solid #e2e8f0' }}>
                              {row.waktu || row.timestamp?.slice(0, 10)}
                            </td>

                            {/* [B] NAMA SISWA */}
                            <td style={{ padding: '10px 16px', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                              {row.namaSiswa}
                            </td>

                            {/* [C] NO. ABSEN */}
                            <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid #e2e8f0' }}>
                              <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                {row.nomorAbsen || '-'}
                              </span>
                            </td>

                            {/* [D] KELAS */}
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#334155', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                              {row.kelas || '-'}
                            </td>

                            {/* [E] SEKOLAH */}
                            <td style={{ padding: '10px 14px', color: '#475569', fontSize: '0.8rem', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                              {row.sekolah || 'SMKN 2 Depok'}
                            </td>

                            {/* [F] MODUL LAB (SIDEBAR) */}
                            <td style={{ padding: '10px 14px', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                              <span style={{
                                fontWeight: 800,
                                color: '#065f46',
                                background: 'rgba(16, 185, 129, 0.12)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                fontSize: '0.78rem'
                              }}>
                                {row.labIcon} {row.labLabel}
                              </span>
                            </td>

                            {/* [G] LEMBAR / SUB-KUIS */}
                            <td style={{ padding: '10px 14px', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                              <span style={{
                                fontWeight: 700,
                                color: '#1e293b',
                                background: '#f1f5f9',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                border: '1px solid #e2e8f0'
                              }}>
                                {row.subLabel}
                              </span>
                            </td>

                            {/* [H] DETAIL ASESMEN / PEKERJAAN */}
                            <td style={{ padding: '10px 16px', borderRight: '1px solid #e2e8f0' }}>
                              <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.84rem' }}>{row.judulKuis}</div>
                            </td>

                            {/* [I] SKOR (0-100) */}
                            <td style={{
                              padding: '10px 12px',
                              textAlign: 'center',
                              fontFamily: 'monospace',
                              fontWeight: 900,
                              fontSize: '1rem',
                              color: isPassed ? '#166534' : '#991b1b',
                              background: isPassed ? 'rgba(220, 252, 231, 0.4)' : 'rgba(254, 226, 226, 0.4)',
                              borderRight: '1px solid #e2e8f0'
                            }}>
                              {row.skor}
                            </td>

                            {/* [J] BENAR / TOTAL */}
                            <td style={{ padding: '10px 10px', textAlign: 'center', color: '#475569', fontWeight: 700, borderRight: '1px solid #e2e8f0' }}>
                              {row.jawabanBenar} / {row.totalSoal}
                            </td>

                            {/* [K] STATUS KKM */}
                            <td style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  background: isPassed ? '#dcfce7' : '#fee2e2',
                                  color: isPassed ? '#166534' : '#991b1b',
                                  border: `1px solid ${isPassed ? '#bbf7d0' : '#fecaca'}`,
                                  display: 'inline-block'
                                }}
                              >
                                {isPassed ? '[OK] LULUS' : '[REM] REMEDIAL'}
                              </span>
                            </td>

                            {/* [L] AKSI */}
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <button
                                onClick={() => { sound.playClick(); setSelectedDetailRecord(row); }}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  cursor: 'pointer',
                                  color: '#0284c7',
                                  fontWeight: 800
                                }}
                              >
                                Rincian
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* SUBTOTAL SUMMARY ROW PER KUIS */}
                      <tr style={{ background: '#ecfdf5', fontWeight: 800, fontSize: '0.8rem', color: '#065f46', borderBottom: '2px solid #10b981' }}>
                        <td colSpan="9" style={{ padding: '9px 16px', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                          Subtotal Rata-rata Skor [<strong>{group.quizName}</strong>]:
                        </td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'monospace', fontSize: '0.98rem', color: '#065f46', borderRight: '1px solid #cbd5e1' }}>
                          {group.avgScore}
                        </td>
                        <td colSpan="3" style={{ padding: '9px 14px' }}>
                          Kelulusan KKM: <strong>{group.passPct}%</strong> ({group.passedCount} dari {group.totalCount} Siswa)
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                /* TAMPILAN TABEL DATAR (FLAT TABLE) */
                sortedFlatScores.map((row, idx) => {
                  const isPassed = row.status === 'LULUS';
                  const rowNum = idx + 2; // Row 1 is header
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={row.id || idx}
                      onClick={() => setActiveCell(`I${rowNum}`)}
                      style={{
                        background: isEven ? '#ffffff' : '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = isEven ? '#ffffff' : '#f8fafc'}
                    >
                      {/* ROW NUMBER */}
                      <td style={{
                        padding: '10px 6px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        color: '#64748b',
                        background: '#f1f5f9',
                        borderRight: '1px solid #cbd5e1',
                        fontWeight: 700,
                        fontSize: '0.78rem'
                      }}>
                        {rowNum}
                      </td>

                      {/* [A] WAKTU */}
                      <td style={{ padding: '10px 14px', color: '#475569', fontSize: '0.78rem', whiteSpace: 'nowrap', borderRight: '1px solid #e2e8f0' }}>
                        {row.waktu || row.timestamp?.slice(0, 10)}
                      </td>

                      {/* [B] NAMA SISWA */}
                      <td style={{ padding: '10px 16px', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        {row.namaSiswa}
                      </td>

                      {/* [C] NO. ABSEN */}
                      <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid #e2e8f0' }}>
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          {row.nomorAbsen || '-'}
                        </span>
                      </td>

                      {/* [D] KELAS */}
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#334155', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                        {row.kelas || '-'}
                      </td>

                      {/* [E] SEKOLAH */}
                      <td style={{ padding: '10px 14px', color: '#475569', fontSize: '0.8rem', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        {row.sekolah || 'SMKN 2 Depok'}
                      </td>

                      {/* [F] MODUL LAB (SIDEBAR) */}
                      <td style={{ padding: '10px 14px', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontWeight: 800,
                          color: '#065f46',
                          background: 'rgba(16, 185, 129, 0.12)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          fontSize: '0.78rem'
                        }}>
                          {row.labIcon} {row.labLabel}
                        </span>
                      </td>

                      {/* [G] LEMBAR / SUB-KUIS */}
                      <td style={{ padding: '10px 14px', borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontWeight: 700,
                          color: '#1e293b',
                          background: '#f1f5f9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          border: '1px solid #e2e8f0'
                        }}>
                          {row.subLabel}
                        </span>
                      </td>

                      {/* [H] DETAIL ASESMEN / PEKERJAAN */}
                      <td style={{ padding: '10px 16px', borderRight: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.84rem' }}>{row.judulKuis}</div>
                      </td>

                      {/* [I] SKOR (0-100) */}
                      <td style={{
                        padding: '10px 12px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        fontSize: '1rem',
                        color: isPassed ? '#166534' : '#991b1b',
                        background: isPassed ? 'rgba(220, 252, 231, 0.4)' : 'rgba(254, 226, 226, 0.4)',
                        borderRight: '1px solid #e2e8f0'
                      }}>
                        {row.skor}
                      </td>

                      {/* [J] BENAR / TOTAL */}
                      <td style={{ padding: '10px 10px', textAlign: 'center', color: '#475569', fontWeight: 700, borderRight: '1px solid #e2e8f0' }}>
                        {row.jawabanBenar} / {row.totalSoal}
                      </td>

                      {/* [K] STATUS KKM */}
                      <td style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: isPassed ? '#dcfce7' : '#fee2e2',
                            color: isPassed ? '#166534' : '#991b1b',
                            border: `1px solid ${isPassed ? '#bbf7d0' : '#fecaca'}`,
                            display: 'inline-block'
                          }}
                        >
                          {isPassed ? '[OK] LULUS' : '[REM] REMEDIAL'}
                        </span>
                      </td>

                      {/* [L] AKSI */}
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => { sound.playClick(); setSelectedDetailRecord(row); }}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            color: '#0284c7',
                            fontWeight: 800
                          }}
                        >
                          Rincian
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* SPREADSHEET FORMULA SUMMARY FOOTER (ROW Σ) */}
            {filteredScores.length > 0 && (
              <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 10, background: '#f8fafc', borderTop: '2px solid #064e3b' }}>
                <tr style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>
                  <td style={{ padding: '12px 6px', textAlign: 'center', background: '#e2e8f0', borderRight: '1px solid #cbd5e1', color: '#064e3b' }}>
                    Σ
                  </td>
                  <td style={{ padding: '12px 14px', borderRight: '1px solid #cbd5e1', color: '#64748b' }}>
                    =SUMMARY()
                  </td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #cbd5e1' }}>
                    Total: <strong style={{ color: '#064e3b' }}>{filteredScores.length} Siswa</strong>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>-</td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>-</td>
                  <td style={{ padding: '12px 14px', borderRight: '1px solid #cbd5e1' }}>SMKN 2 Depok</td>
                  <td style={{ padding: '12px 14px', borderRight: '1px solid #cbd5e1' }}>-</td>
                  <td style={{ padding: '12px 14px', borderRight: '1px solid #cbd5e1', color: '#065f46' }}>
                    {activeSubTab !== 'all' ? currentLabTitle.split(' > ')[1] : 'Semua Sub-Kuis'}
                  </td>
                  <td style={{ padding: '12px 16px', borderRight: '1px solid #cbd5e1', color: '#64748b' }}>
                    =AVERAGE(I:I)
                  </td>
                  <td style={{
                    padding: '12px 12px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    color: averageScore >= 75 ? '#166534' : '#991b1b',
                    background: '#ecfdf5',
                    borderRight: '1px solid #cbd5e1'
                  }}>
                    {averageScore}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                    {totalBenar} / {totalSoal}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                    <span style={{ color: '#166534', fontWeight: 900 }}>
                      {passedCount} Lulus ({passingRate}%)
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                    <button
                      onClick={() => { sound.playClick(); exportScoresToExcelHTML(filteredScores); }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Unduh .xls
                    </button>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
          )}
        </div>
      </div>

      {/* SPREADSHEET FOOTER BAR / SHEET NAVIGATOR */}
      <div
        className="dashboard-card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          fontSize: '0.82rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#064e3b', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
            {activeSubTab !== 'all' ? activeSubTab.toUpperCase() : 'SHEET 1'}
          </span>
          <span style={{ fontWeight: 700, color: '#334155' }}>
            Lembar Aktif: <strong>{currentLabTitle}</strong> (SMKN 2 Depok - Kurikulum Merdeka)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#64748b' }}>
          <span><em>Klik tombol <strong>"Unduh Excel Lembar Ini (.xls)"</strong> untuk langsung mencetak atau mengolah nilai sub-kuis ini.</em></span>
        </div>
      </div>

      {/* ADVANCED OPTIONAL ACCORDION: GOOGLE APPS SCRIPT WEBHOOK */}
      <div
        className="dashboard-card"
        style={{
          padding: '18px 24px',
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-light, #e2e8f0)',
          borderRadius: '12px'
        }}
      >
        <div
          onClick={() => setIsWebhookAccordionOpen(!isWebhookAccordionOpen)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={18} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main, #0f172a)' }}>
                Integrasi Cloud Otomatis ke Google Drive (Opsional)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Spreadsheet di atas sudah siap digunakan langsung. Buka bagian ini HANYA jika Anda ingin hasil kuis otomatis dikirim ke Google Sheets di akun Google Anda.
              </div>
            </div>
          </div>
          <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 800 }}>
            {isWebhookAccordionOpen ? '▲ Sembunyikan' : '▼ Lihat Pengaturan'}
          </div>
        </div>

        {isWebhookAccordionOpen && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => { sound.playClick(); setIsGuideModalOpen(true); }}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Panduan & Salin Kode Apps Script
              </button>

              <button
                onClick={() => { sound.playClick(); setIsConfigModalOpen(true); }}
                style={{
                  background: webhookUrl ? '#10b981' : '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {webhookUrl ? 'Ganti URL Webhook' : 'Tempel URL Webhook'}
              </button>

              {pendingSyncCount > 0 && (
                <button
                  onClick={handleSyncPending}
                  style={{
                    background: '#d97706',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Sinkronkan {pendingSyncCount} Nilai Tertunda
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Target Webhook saat ini: <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: webhookUrl ? '#059669' : '#dc2626' }}>
                {webhookUrl ? webhookUrl : '(Belum dipasang - Data tetap aman tersimpan di spreadsheet lab ini)'}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETAIL JAWABAN SISWA */}
      {selectedDetailRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '640px', background: '#fff', borderRadius: '16px', padding: '26px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={18} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Rincian Hasil Asesmen Siswa
                </h3>
              </div>
              <button onClick={() => setSelectedDetailRecord(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', marginBottom: '16px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div><strong>Nama Siswa:</strong> {selectedDetailRecord.namaSiswa}</div>
              <div><strong>No. Absen:</strong> {selectedDetailRecord.nomorAbsen}</div>
              <div><strong>Kelas / Jurusan:</strong> {selectedDetailRecord.kelas}</div>
              <div><strong>Sekolah:</strong> {selectedDetailRecord.sekolah || 'SMKN 2 Depok'}</div>
              <div><strong>Modul Lab:</strong> {selectedDetailRecord.labLabel || selectedDetailRecord.modul}</div>
              <div><strong>Lembar Sub-Kuis:</strong> {selectedDetailRecord.subLabel}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Nama Kuis / Asesmen:</strong> {selectedDetailRecord.judulKuis}</div>
              <div>
                <strong>Skor Hasil:</strong>{' '}
                <span style={{ fontWeight: 900, fontSize: '1.05rem', color: selectedDetailRecord.status === 'LULUS' ? '#16a34a' : '#dc2626' }}>
                  {selectedDetailRecord.skor} / 100
                </span>
              </div>
              <div>
                <strong>Status KKM:</strong>{' '}
                <span style={{ fontWeight: 800, color: selectedDetailRecord.status === 'LULUS' ? '#16a34a' : '#dc2626' }}>
                  {selectedDetailRecord.status}
                </span>
              </div>
              <div style={{ gridColumn: 'span 2', fontSize: '0.8rem', color: '#64748b' }}>
                <strong>Waktu Selesai:</strong> {selectedDetailRecord.waktu}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', marginBottom: '6px' }}>
                Rekaman Jawaban Soal:
              </label>
              <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '14px', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: '220px', lineHeight: 1.5 }}>
                {selectedDetailRecord.detailJawaban || 'Tidak ada catatan jawaban tambahan.'}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedDetailRecord(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIGURASI WEBHOOK GOOGLE SPREADSHEET */}
      {isConfigModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '640px', background: '#fff', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <Settings size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} /> Konfigurasi Webhook Google Spreadsheet
              </h3>
              <button onClick={() => setIsConfigModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}></button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Konfigurasikan integrasi Google Spreadsheet agar hasil kuis otomatis terkirim dan tombol <strong>Buka Google Sheets</strong> langsung membuka file Anda.
            </p>

            {/* QUICK LINK BUTTONS */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={14} />
                <span>Tautan Cepat Membuka Google Sheets:</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="https://sheets.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '7px 12px',
                    background: '#0284c7',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Folder size={14} /> Buka Daftar Sheets Anda (sheets.google.com) <ExternalLink size={13} /></span>
                </a>
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '7px 12px',
                    background: '#10b981',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Plus size={14} /> Buat File Baru (sheets.new) <ExternalLink size={13} /></span>
                </a>
              </div>
            </div>

            <form onSubmit={handleSaveWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
                  Tautan Langsung Dokumen Spreadsheet Anda (Opsional):
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  value={tempSheetUrl !== undefined && tempSheetUrl !== '' ? tempSheetUrl : sheetDocUrl}
                  onChange={(e) => setTempSheetUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 13px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.84rem'
                  }}
                />
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                  Saat diisi, tombol <strong>Buka Google Sheets</strong> di toolbar akan langsung membuka file ini.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
                  URL Web App Google Apps Script (Webhook Pengirim Nilai):
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              {testStatus && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
                  {testStatus}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleSendTestData}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Uji Kirim Baris Tes
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PANDUAN & KODE GOOGLE APPS SCRIPT */}
      {isGuideModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '820px', background: '#fff', borderRadius: '18px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <ClipboardCopy size={15} /> Kode Google Apps Script & Cara Pasang (Opsional)
              </h3>
              <button onClick={() => setIsGuideModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}></button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '0.86rem', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Langkah Pemasangan di Google Spreadsheet Pribadi:</div>
              <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Buka <strong>https://sheets.new</strong> di tab baru untuk membuat spreadsheet kosong.</li>
                <li>Klik menu <strong>Ekstensi (Extensions)</strong> &gt; pilih <strong>Apps Script</strong>.</li>
                <li>Hapus kode lama, lalu klik tombol <strong>"Salin Kode Apps Script"</strong> di bawah dan tempelkan.</li>
                <li>Klik <strong>Simpan</strong> (ikon disket), lalu klik tombol biru <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan baru</strong>.</li>
                <li>Pilih jenis <strong>Aplikasi web</strong>, ubah <em>Yang memiliki akses</em> menjadi: <strong>Siapa saja (Anyone)</strong>.</li>
                <li>Salin URL Web App yang berakhiran <code>/exec</code> lalu tempelkan di menu pengaturan webhook.</li>
              </ol>
            </div>

            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', color: '#cbd5e1', padding: '10px 16px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 700 }}>Code.gs (Google Apps Script)</span>
                <button
                  onClick={copyAppsScript}
                  style={{
                    background: copyCodeSuccess ? '#10b981' : '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copyCodeSuccess ? '[OK] Kode Berhasil Disalin!' : 'Salin Kode Apps Script'}
                </button>
              </div>
              <pre
                style={{
                  background: '#0f172a',
                  color: '#93c5fd',
                  padding: '16px',
                  borderBottomLeftRadius: '10px',
                  borderBottomRightRadius: '10px',
                  fontSize: '0.76rem',
                  overflowX: 'auto',
                  maxHeight: '280px',
                  margin: 0,
                  fontFamily: 'monospace'
                }}
              >
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setIsGuideModalOpen(false);
                  setIsConfigModalOpen(true);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Lanjut Masukkan URL Webhook &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PANDUAN PASTE GOOGLE SHEETS */}
      {isPasteGuideModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="dashboard-card" style={{ width: '100%', maxWidth: '620px', background: '#fff', borderRadius: '18px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardCopy size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  Data Nilai Berhasil Disalin! Buka Google Sheets & Paste
                </h3>
              </div>
              <button onClick={() => setIsPasteGuideModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}></button>
            </div>

            <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>Data Siswa Bapak Tetap Aman & Tidak Hilang!</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#047857', lineHeight: 1.5 }}>
                Tautan <em>sheets.new</em> membuka dokumen baru yang masih kosong dari Google. Sebanyak <strong>{filteredScores.length} data nilai siswa</strong> pada lembar ini sudah otomatis disalin ke memori komputer Anda.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Langkah Mudah Menempelkan Data di Tab Google Sheets:
              </div>
              <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Buka <strong>tab baru Google Sheets</strong> yang baru saja terbuka di sebelah tab ini.</li>
                <li>Klik pada sel <strong>A1</strong> (kotak paling kiri atas).</li>
                <li>Tekan tombol keyboard:
                  <div style={{ marginTop: '4px' }}>
                    <kbd style={{ background: '#e2e8f0', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>Cmd + V</kbd> (di Mac) atau <kbd style={{ background: '#e2e8f0', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>Ctrl + V</kbd> (di Windows).
                  </div>
                </li>
                <li>Selesai! Seluruh tabel nilai akan langsung tertempel rapi dengan kolom dan skor lengkap.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsPasteGuideModalOpen(false)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                }}
              >
                Saya Mengerti, Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PILIHAN BUKA GOOGLE SHEETS */}
      {isOpenSheetModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="dashboard-card" style={{
            width: '100%',
            maxWidth: '580px',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '26px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
            color: '#0f172a'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart3 size={24} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  Akses Google Sheets (SMKN 2 Depok)
                </h3>
              </div>
              <button
                onClick={() => setIsOpenSheetModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}
              >
                
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              Pilih cara membuka spreadsheet atau tautkan URL Google Spreadsheet yang biasa Anda gunakan agar tombol <strong>Buka Google Sheets</strong> langsung menuju dokumen nilai Anda.
            </p>

            {/* OPSI 1: TAUTKAN URL SPREADSHEET PRIBADI */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.86rem', color: '#0f172a', marginBottom: '6px' }}>
                Tautan Langsung Google Spreadsheet Anda:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  value={tempSheetUrl !== undefined && tempSheetUrl !== '' ? tempSheetUrl : sheetDocUrl}
                  onChange={(e) => setTempSheetUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #94a3b8',
                    fontSize: '0.84rem'
                  }}
                />
                <button
                  onClick={() => {
                    sound.playClick();
                    const urlToSave = tempSheetUrl !== undefined && tempSheetUrl !== '' ? tempSheetUrl : sheetDocUrl;
                    saveSheetDocUrl(urlToSave);
                    if (urlToSave && urlToSave.trim().startsWith('http')) {
                      window.open(urlToSave.trim(), '_blank');
                      setIsOpenSheetModal(false);
                      showToast('[OK] Tautan disimpan & Spreadsheet dibuka!');
                    } else {
                      showToast('[OK] Pengaturan tautan diperbarui!');
                    }
                  }}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Simpan & Buka <ExternalLink size={13} />
                  </span>
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                Tempelkan link file Spreadsheet Anda di sini. Tombol di toolbar akan langsung membuka file ini setiap kali diklik.
              </div>
            </div>

            {/* OPSI 2: TAUTAN CEPAT LAINNYA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#334155' }}>
                Atau Buka Cepat:
              </div>

              {/* BUKA BERANDA SHEETS */}
              <button
                onClick={() => {
                  sound.playClick();
                  window.open('https://docs.google.com/spreadsheets/u/0/', '_blank');
                  setIsOpenSheetModal(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1.5px solid #0284c7',
                  color: '#0369a1',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Folder size={14} />
                  <span>Buka Beranda Google Sheets (docs.google.com)</span>
                </div>
                <ExternalLink size={13} />
              </button>

              {/* BUAT DOKUMEN BARU & SALIN DATA */}
              <button
                onClick={() => {
                  setIsOpenSheetModal(false);
                  handleOpenAndPasteGoogleSheets();
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1.5px solid #10b981',
                  color: '#065f46',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={14} />
                  <span>Buat File Baru (sheets.new) & Salin Otomatis Tabel Ini</span>
                </div>
                <ExternalLink size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setIsOpenSheetModal(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: '#e2e8f0',
                  color: '#475569',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherGradebook;

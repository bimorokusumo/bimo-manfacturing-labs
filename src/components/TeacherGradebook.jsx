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
 * GOOGLE APPS SCRIPT - BIMO MANUFACTURING LABS (REKAP EVALUASI C1 - C5)
 * =============================================================================
 * 
 * Versi Khusus: Mode Sheet Tunggal (Tanpa Menambah Sheet Baru)
 * - Menggunakan sheet yang sudah ada di spreadsheet Anda (misal: '🎓 10. Evaluasi Akhir').
 * - Menampilkan kolom mandiri: C1, C2, C3, C4, dan C5.
 * - Otomatis mendeteksi nilai C1 dan C2 yang sudah dikerjakan siswa sebelumnya.
 * - Real-time auto update ketika siswa mengirim jawaban evaluasi dari web.
 * - 100% Nilai Asli Siswa skala 0 - 100 dengan indikator KKM 75 (Lulus / Remedial).
 * =============================================================================
 */

// DAFTAR RESMI 36 SISWA KELAS X-TP.A (SMKN 2 DEPOK)
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

/**
 * =============================================================================
 * 1. MENU KHUSUS PADA GOOGLE SPREADSHEET
 * =============================================================================
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu("Menu BIMO Labs")
      .addItem("1. Perbarui Nilai Evaluasi C1 - C5 (Sheet Ini)", "perbaruiSheetEvaluasiIni")
      .addItem("2. Hapus Tab Tambahan Lainnya (Sisakan Sheet Ini Saja)", "hapusTabTambahan")
      .addToUi();
  } catch (e) {}
}

/**
 * =============================================================================
 * 2. MENDAPATKAN SHEET YANG SUDAH ADA (FLEKSIBEL DENGAN EMOJI / SIMBOL APAPUN)
 * =============================================================================
 */
function getExistingTargetSheet(ss) {
  var sheets = ss.getSheets();
  
  // 1. Cari sheet yang namanya mengandung kata 'evaluasi' (misal: '🎓 10. Evaluasi Akhir', 'Evaluasi Akhir', dll)
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName().toLowerCase();
    if (name.indexOf("evaluasi") !== -1) {
      return sheets[i];
    }
  }

  // 2. Prioritaskan sheet yang sedang aktif dibuka jika bukan data raw
  var active = ss.getActiveSheet();
  if (active && active.getName().toLowerCase().indexOf("raw") === -1 && active.getName().toLowerCase().indexOf("data masuk") === -1) {
    return active;
  }

  // 3. Cari sheet pertama yang bukan sheet penampung raw data
  for (var j = 0; j < sheets.length; j++) {
    var n = sheets[j].getName().toLowerCase();
    if (n.indexOf("data") === -1 && n.indexOf("raw") === -1) {
      return sheets[j];
    }
  }

  // 4. Fallback ke sheet pertama
  return sheets[0];
}

/**
 * =============================================================================
 * 3. MENGUMPULKAN SEMUA NILAI EVALUASI DARI DATA YANG ADA DI SPREADSHEET
 * =============================================================================
 */
function collectEvaluasiScores(ss) {
  var studentScores = {};

  // Inisialisasi awal 36 siswa resmi
  MASTER_STUDENTS_LIST.forEach(function(s) {
    var k = "absen_" + s.absen;
    studentScores[k] = {
      nama: s.nama,
      absen: String(s.absen),
      kelas: s.kelas,
      c1: null,
      c2: null,
      c3: null,
      c4: null,
      c5: null
    };
  });

  var evalCounters = {};
  var sheets = ss.getSheets();

  sheets.forEach(function(sh) {
    var data = sh.getDataRange().getValues();
    if (data.length <= 1) return;

    var headerRowIdx = -1;
    var colMap = { nama: -1, absen: -1, kuis: -1, modul: -1, nilai: -1, detail: -1 };

    for (var r = 0; r < Math.min(data.length, 5); r++) {
      var rowStr = data[r].join(" ").toLowerCase();
      if (rowStr.indexOf("nama") !== -1 && (rowStr.indexOf("nilai") !== -1 || rowStr.indexOf("skor") !== -1 || rowStr.indexOf("kuis") !== -1)) {
        headerRowIdx = r;
        for (var c = 0; c < data[r].length; c++) {
          var h = String(data[r][c] || "").toLowerCase();
          if (h.indexOf("nama") !== -1 && colMap.nama === -1) colMap.nama = c;
          if ((h.indexOf("absen") !== -1 || h.indexOf("no.") !== -1) && colMap.absen === -1) colMap.absen = c;
          if ((h.indexOf("kuis") !== -1 || h.indexOf("asesmen") !== -1 || h.indexOf("tugas") !== -1) && colMap.kuis === -1) colMap.kuis = c;
          if (h.indexOf("modul") !== -1 && colMap.modul === -1) colMap.modul = c;
          if ((h.indexOf("nilai") !== -1 || h.indexOf("skor") !== -1) && colMap.nilai === -1) colMap.nilai = c;
          if (h.indexOf("detail") !== -1 || h.indexOf("rincian") !== -1) colMap.detail = c;
        }
        break;
      }
    }

    var startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 1;

    for (var rowIdx = startRow; rowIdx < data.length; rowIdx++) {
      var row = data[rowIdx];
      var rawNama = colMap.nama !== -1 ? String(row[colMap.nama] || "").trim() : String(row[1] || "").trim();
      if (!rawNama || rawNama.toLowerCase().indexOf("percobaan") !== -1 || rawNama.toLowerCase().indexOf("testing") !== -1) continue;

      var rawAbsen = colMap.absen !== -1 ? String(row[colMap.absen] || "-").trim() : String(row[2] || "-").trim();
      var rawModul = colMap.modul !== -1 ? String(row[colMap.modul] || "").trim() : "";
      var rawKuis = colMap.kuis !== -1 ? String(row[colMap.kuis] || "").trim() : String(row[6] || "").trim();
      var rawDetail = colMap.detail !== -1 ? String(row[colMap.detail] || "").trim() : "";

      var scoreVal = 0;
      if (colMap.nilai !== -1) {
        scoreVal = Number(row[colMap.nilai]);
      } else {
        for (var ci = 6; ci < Math.min(row.length, 11); ci++) {
          var num = Number(row[ci]);
          if (!isNaN(num) && num >= 15 && num <= 100) {
            scoreVal = num;
            break;
          }
        }
      }
      if (isNaN(scoreVal) || scoreVal <= 0) continue;
      if (scoreVal > 0 && scoreVal <= 10) scoreVal = Math.round(scoreVal * 10);

      var targetKey = null;
      var parsedAbsen = parseInt(rawAbsen, 10);
      if (!isNaN(parsedAbsen) && parsedAbsen >= 1 && parsedAbsen <= MASTER_STUDENTS_LIST.length) {
        targetKey = "absen_" + parsedAbsen;
      } else {
        var cleanRaw = rawNama.toLowerCase().replace(/[^a-z0-9]/g, "");
        for (var m = 0; m < MASTER_STUDENTS_LIST.length; m++) {
          var cleanMaster = MASTER_STUDENTS_LIST[m].nama.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (cleanRaw === cleanMaster || (cleanRaw.length > 5 && cleanMaster.indexOf(cleanRaw) !== -1)) {
            targetKey = "absen_" + MASTER_STUDENTS_LIST[m].absen;
            break;
          }
        }
      }

      if (!targetKey) {
        targetKey = "custom_" + rawNama.toLowerCase();
        if (!studentScores[targetKey]) {
          studentScores[targetKey] = {
            nama: rawNama,
            absen: rawAbsen,
            kelas: "X-TP.A",
            c1: null,
            c2: null,
            c3: null,
            c4: null,
            c5: null
          };
        }
      }

      var text = (rawModul + " " + rawKuis + " " + rawDetail).toLowerCase();
      var detectedLevel = null;

      if (text.indexOf("c1") !== -1 || text.indexOf("mengingat") !== -1) {
        detectedLevel = "c1";
      } else if (text.indexOf("c2") !== -1 || text.indexOf("memahami") !== -1) {
        detectedLevel = "c2";
      } else if (text.indexOf("c3") !== -1 || text.indexOf("menerapkan") !== -1) {
        detectedLevel = "c3";
      } else if (text.indexOf("c4") !== -1 || text.indexOf("menganalisis") !== -1) {
        detectedLevel = "c4";
      } else if (text.indexOf("c5") !== -1 || text.indexOf("mengevaluasi") !== -1 || text.indexOf("hots") !== -1) {
        detectedLevel = "c5";
      } else if (text.indexOf("evaluasi") !== -1 || text.indexOf("komprehensif") !== -1) {
        if (!evalCounters[targetKey]) evalCounters[targetKey] = 0;
        evalCounters[targetKey]++;
        var seq = evalCounters[targetKey];
        if (seq === 1) detectedLevel = "c1";
        else if (seq === 2) detectedLevel = "c2";
        else if (seq === 3) detectedLevel = "c3";
        else if (seq === 4) detectedLevel = "c4";
        else detectedLevel = "c5";
      }

      if (detectedLevel) {
        var prevScore = studentScores[targetKey][detectedLevel];
        if (prevScore === null || scoreVal > prevScore) {
          studentScores[targetKey][detectedLevel] = scoreVal;
        }
      }
    }
  });

  return studentScores;
}

/**
 * =============================================================================
 * 4. FUNGSI UTAMA: PERBARUI SHEET YANG SUDAH ADA (TANPA MENAMBAH SHEET)
 * =============================================================================
 */
function perbaruiSheetEvaluasiIni() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getExistingTargetSheet(ss);
  
  var studentScores = collectEvaluasiScores(ss);
  var nowFormatted = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd-MM-yyyy HH:mm");

  sheet.clear();

  // BARIS 1: JUDUL UTAMA
  sheet.appendRow(["REKAPITULASI EVALUASI AKHIR (C1 - C5) - TINGKAT KOGNITIF SISWA"]);
  var b1 = sheet.getRange(1, 1, 1, 11);
  b1.merge();
  b1.setBackground("#064e3b");
  b1.setFontColor("#ffffff");
  b1.setFontWeight("bold");
  b1.setFontSize(11);
  b1.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);

  // BARIS 2: INFO KKM & WAKTU PEMBARUAN
  sheet.appendRow([
    "Konsentrasi Keahlian: X-TP.A (SMKN 2 Depok)  |  Target KKM: 75  |  Level Kognitif: C1 s.d. C5  |  Diperbarui: " + nowFormatted + " WIB"
  ]);
  var b2 = sheet.getRange(2, 1, 1, 11);
  b2.merge();
  b2.setBackground("#0f766e");
  b2.setFontColor("#ecfdf5");
  b2.setFontWeight("bold");
  b2.setFontSize(9);
  b2.setVerticalAlignment("middle");
  sheet.setRowHeight(2, 26);

  // BARIS 3: SPASI
  sheet.appendRow([""]);
  sheet.setRowHeight(3, 10);

  // BARIS 4: HEADER TABEL
  var headers = [
    "No",
    "Nama Lengkap Siswa",
    "No. Absen",
    "Kelas",
    "Evaluasi C1 (Mengingat)",
    "Evaluasi C2 (Memahami)",
    "Evaluasi C3 (Menerapkan)",
    "Evaluasi C4 (Menganalisis)",
    "Evaluasi C5 (Mengevaluasi)",
    "Rata-rata Nilai",
    "Status Akhir"
  ];
  sheet.appendRow(headers);
  var hRange = sheet.getRange(4, 1, 1, headers.length);
  hRange.setBackground("#1e293b");
  hRange.setFontColor("#ffffff");
  hRange.setFontWeight("bold");
  hRange.setFontSize(9);
  hRange.setHorizontalAlignment("center");
  hRange.setVerticalAlignment("middle");
  sheet.setRowHeight(4, 32);
  sheet.setFrozenRows(4);

  // BARIS 5 s.d 40: DATA SISWA RESMI X-TP.A
  var c1Total = 0, c1Count = 0;
  var c2Total = 0, c2Count = 0;
  var c3Total = 0, c3Count = 0;
  var c4Total = 0, c4Count = 0;
  var c5Total = 0, c5Count = 0;

  MASTER_STUDENTS_LIST.forEach(function(s) {
    var k = "absen_" + s.absen;
    var rec = studentScores[k] || { c1: null, c2: null, c3: null, c4: null, c5: null };

    var sum = 0;
    var count = 0;
    if (rec.c1 !== null) { sum += rec.c1; count++; c1Total += rec.c1; c1Count++; }
    if (rec.c2 !== null) { sum += rec.c2; count++; c2Total += rec.c2; c2Count++; }
    if (rec.c3 !== null) { sum += rec.c3; count++; c3Total += rec.c3; c3Count++; }
    if (rec.c4 !== null) { sum += rec.c4; count++; c4Total += rec.c4; c4Count++; }
    if (rec.c5 !== null) { sum += rec.c5; count++; c5Total += rec.c5; c5Count++; }

    var avg = count > 0 ? Math.round(sum / count) : 0;
    var status = count === 0 ? "BELUM MENGERJAKAN" : (avg >= 75 ? "LULUS" : "REMEDIAL");

    sheet.appendRow([
      s.absen,
      s.nama,
      String(s.absen),
      s.kelas,
      rec.c1 !== null ? rec.c1 : "-",
      rec.c2 !== null ? rec.c2 : "-",
      rec.c3 !== null ? rec.c3 : "-",
      rec.c4 !== null ? rec.c4 : "-",
      rec.c5 !== null ? rec.c5 : "-",
      count > 0 ? avg : "-",
      status
    ]);

    var lr = sheet.getLastRow();
    sheet.setRowHeight(lr, 24);
    sheet.getRange(lr, 1).setHorizontalAlignment("center");
    sheet.getRange(lr, 3).setHorizontalAlignment("center");
    sheet.getRange(lr, 4).setHorizontalAlignment("center");

    for (var col = 5; col <= 9; col++) {
      var cell = sheet.getRange(lr, col);
      cell.setHorizontalAlignment("center");
      var val = cell.getValue();
      if (typeof val === "number") {
        cell.setFontWeight("bold");
        if (val >= 75) {
          cell.setFontColor("#16a34a");
        } else {
          cell.setFontColor("#dc2626");
        }
      }
    }

    var avgCell = sheet.getRange(lr, 10);
    avgCell.setHorizontalAlignment("center");
    avgCell.setFontWeight("bold");

    var statCell = sheet.getRange(lr, 11);
    statCell.setHorizontalAlignment("center");
    statCell.setFontWeight("bold");
    if (status === "LULUS") {
      statCell.setBackground("#dcfce7");
      statCell.setFontColor("#166534");
    } else if (status === "REMEDIAL") {
      statCell.setBackground("#fee2e2");
      statCell.setFontColor("#991b1b");
    } else {
      statCell.setFontColor("#94a3b8");
    }
  });

  // BARIS REKAPITULASI RATA-RATA KELAS DI BAGIAN BAWAH
  sheet.appendRow([""]);

  var avgC1 = c1Count > 0 ? Math.round(c1Total / c1Count) : "-";
  var avgC2 = c2Count > 0 ? Math.round(c2Total / c2Count) : "-";
  var avgC3 = c3Count > 0 ? Math.round(c3Total / c3Count) : "-";
  var avgC4 = c4Count > 0 ? Math.round(c4Total / c4Count) : "-";
  var avgC5 = c5Count > 0 ? Math.round(c5Total / c5Count) : "-";

  sheet.appendRow([
    "",
    "RATA-RATA NILAI KELAS",
    "",
    "",
    avgC1,
    avgC2,
    avgC3,
    avgC4,
    avgC5,
    "",
    ""
  ]);

  var summaryRow = sheet.getLastRow();
  sheet.setRowHeight(summaryRow, 28);
  var sumRange = sheet.getRange(summaryRow, 1, 1, 11);
  sumRange.setBackground("#334155");
  sumRange.setFontColor("#ffffff");
  sumRange.setFontWeight("bold");
  for (var c = 5; c <= 9; c++) {
    sheet.getRange(summaryRow, c).setHorizontalAlignment("center");
  }

  // Atur lebar kolom
  sheet.setColumnWidth(1, 45);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 80);
  sheet.setColumnWidth(4, 90);
  sheet.setColumnWidth(5, 140);
  sheet.setColumnWidth(6, 140);
  sheet.setColumnWidth(7, 140);
  sheet.setColumnWidth(8, 140);
  sheet.setColumnWidth(9, 140);
  sheet.setColumnWidth(10, 110);
  sheet.setColumnWidth(11, 160);

  try {
    var sheetTitle = sheet.getName();
    var pesanBerhasil = "[OK] Berhasil!\n\n" +
      "Sheet '" + sheetTitle + "' telah diperbarui secara langsung dengan kolom Evaluasi C1 hingga C5.\n\n" +
      "Nilai C1 dan C2 yang dikerjakan siswa telah berhasil ditampilkan tanpa menambah sheet baru.";
    SpreadsheetApp.getUi().alert(pesanBerhasil);
  } catch (e) {}
}

/**
 * =============================================================================
 * 5. FUNGSI PEMBERSIH TAB TAMBAHAN (HANYA JIKA DIBUTUHKAN GURU)
 * =============================================================================
 */
function hapusTabTambahan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var targetSheet = getExistingTargetSheet(ss);
  var sheets = ss.getSheets();

  if (sheets.length <= 1) {
    try {
      SpreadsheetApp.getUi().alert("Hanya ada 1 sheet di spreadsheet ini, tidak ada tab tambahan yang perlu dihapus.");
    } catch (e) {}
    return;
  }

  var ui = SpreadsheetApp.getUi();
  var pesanKonfirmasi = "Apakah Anda ingin menghapus tab-tab tambahan (misal Safety Lab, Machine Lab, dll) dan HANYA MENYISAKAN sheet utama '" + targetSheet.getName() + "'?";
  var resp = ui.alert("Konfirmasi Bersihkan Tab Tambahan", pesanKonfirmasi, ui.ButtonSet.YES_NO);
  
  if (resp === ui.Button.YES) {
    sheets.forEach(function(sh) {
      if (sh.getSheetId() !== targetSheet.getSheetId()) {
        try {
          ss.deleteSheet(sh);
        } catch (errDel) {}
      }
    });
    ui.alert("[OK] Tab tambahan berhasil dibersihkan! Spreadsheet sekarang hanya memiliki 1 sheet utama.");
  }
}

/**
 * =============================================================================
 * 6. WEBHOOK POST (doPost) - PENERIMAAN NILAI REAL-TIME DARI WEBSITE
 * =============================================================================
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
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

    var namaSiswa = (data.namaSiswa || "Siswa Praktikan").trim();
    var nomorAbsen = String(data.nomorAbsen !== undefined ? data.nomorAbsen : "-").trim();
    var modul = String(data.modul || "").trim();
    var judulKuis = String(data.judulKuis || "").trim();
    var detailJawaban = String(data.detailJawaban || "").trim();
    var skor = Number(data.skor !== undefined ? data.skor : 0);
    if (skor > 0 && skor <= 10) skor = Math.round(skor * 10);

    var sheet = getExistingTargetSheet(ss);

    var text = (modul + " " + judulKuis + " " + detailJawaban).toLowerCase();
    var targetCol = 5;
    if (text.indexOf("c2") !== -1 || text.indexOf("memahami") !== -1) targetCol = 6;
    else if (text.indexOf("c3") !== -1 || text.indexOf("menerapkan") !== -1) targetCol = 7;
    else if (text.indexOf("c4") !== -1 || text.indexOf("menganalisis") !== -1) targetCol = 8;
    else if (text.indexOf("c5") !== -1 || text.indexOf("mengevaluasi") !== -1 || text.indexOf("hots") !== -1) targetCol = 9;

    var lastRow = sheet.getLastRow();
    var targetRow = -1;

    if (lastRow >= 5) {
      var sheetData = sheet.getRange(5, 1, lastRow - 4, 3).getValues();
      var parsedAbsen = parseInt(nomorAbsen, 10);

      for (var r = 0; r < sheetData.length; r++) {
        var rowAbsen = parseInt(sheetData[r][2], 10);
        var rowNama = String(sheetData[r][1] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        var cleanTargetNama = namaSiswa.toLowerCase().replace(/[^a-z0-9]/g, "");

        if (!isNaN(parsedAbsen) && rowAbsen === parsedAbsen) {
          targetRow = 5 + r;
          break;
        } else if (cleanTargetNama && (rowNama === cleanTargetNama || (cleanTargetNama.length > 5 && rowNama.indexOf(cleanTargetNama) !== -1))) {
          targetRow = 5 + r;
          break;
        }
      }
    }

    if (targetRow !== -1) {
      var cell = sheet.getRange(targetRow, targetCol);
      var currentVal = cell.getValue();
      if (typeof currentVal !== "number" || skor > currentVal) {
        cell.setValue(skor);
        cell.setFontWeight("bold");
        cell.setFontColor(skor >= 75 ? "#16a34a" : "#dc2626");
      }

      var rowScores = sheet.getRange(targetRow, 5, 1, 5).getValues()[0];
      var sum = 0, count = 0;
      for (var s = 0; s < rowScores.length; s++) {
        if (typeof rowScores[s] === "number") {
          sum += rowScores[s];
          count++;
        }
      }
      if (count > 0) {
        var avg = Math.round(sum / count);
        var avgCell = sheet.getRange(targetRow, 10);
        avgCell.setValue(avg);
        avgCell.setFontWeight("bold");

        var statCell = sheet.getRange(targetRow, 11);
        statCell.setValue(avg >= 75 ? "LULUS" : "REMEDIAL");
        statCell.setFontWeight("bold");
        if (avg >= 75) {
          statCell.setBackground("#dcfce7");
          statCell.setFontColor("#166534");
        } else {
          statCell.setBackground("#fee2e2");
          statCell.setFontColor("#991b1b");
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Nilai " + namaSiswa + " (" + skor + ") berhasil diperbarui di sheet yang ada."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Google Apps Script BIMO Labs (Mode Sheet Tunggal C1-C5) siap digunakan."
  })).setMimeType(ContentService.MimeType.JSON);
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

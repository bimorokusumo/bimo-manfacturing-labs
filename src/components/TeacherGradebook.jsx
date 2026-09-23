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

const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

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

      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#064e3b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);

      sheet.setColumnWidth(1, 180);
      sheet.setColumnWidth(2, 220);
      sheet.setColumnWidth(3, 90);
      sheet.setColumnWidth(4, 130);
      sheet.setColumnWidth(5, 180);
      sheet.setColumnWidth(6, 170);
      sheet.setColumnWidth(7, 200);
      sheet.setColumnWidth(8, 240);
      sheet.setColumnWidth(9, 110);
      sheet.setColumnWidth(10, 110);
      sheet.setColumnWidth(11, 100);
      sheet.setColumnWidth(12, 110);
      sheet.setColumnWidth(13, 280);
    }

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
    var namaSiswa = data.namaSiswa || "Siswa Praktikan";
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
    var detailJawaban = typeof data.detailJawaban === 'object' ? JSON.stringify(data.detailJawaban) : String(data.detailJawaban || "-");

    sheet.appendRow([
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

    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 3).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 4).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 9).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 10).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 11).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 12).setHorizontalAlignment("center");

    var scoreCell = sheet.getRange(lastRow, 9);
    var statusCell = sheet.getRange(lastRow, 12);
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

// MENU OTOMATIS BIMO LABS PADA GOOGLE SHEETS
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('⚡ Menu BIMO Labs')
      .addItem('📊 1. Klasifikasikan Nilai per Tab Kuis (Otomatis)', 'rapikanDanPisahkanKuisOtomatis')
      .addItem('📋 2. Buat Matriks Rekap Pengumpulan Siswa', 'buatMatriksRekapPengumpulan')
      .addSeparator()
      .addItem('ℹ️ Panduan Pemakaian', 'tampilkanPanduan')
      .addToUi();
  } catch (e) {}
}

function tampilkanPanduan() {
  var pesan = "CARA MENGGUNAKAN MENU BIMO LABS:\\n\\n" +
    "1. Klik menu '📊 1. Klasifikasikan Nilai per Tab Kuis':\\n" +
    "   Sistem otomatis membuat tab khusus per kuis (seperti '🛡️ Inspeksi APD', '📋 JSA Pengeboran') dan mengelompokkan siswa.\\n\\n" +
    "2. Klik menu '📋 2. Buat Matriks Rekap Pengumpulan Siswa':\\n" +
    "   Sistem membuat tabel rekap silang nama siswa vs seluruh kuis (ceklis skor dan status pengumpulan).\\n\\n" +
    "Semua data siswa aman dan tidak akan terhapus.";
  SpreadsheetApp.getUi().alert("Panduan Menu BIMO Labs", pesan, SpreadsheetApp.getUi().ButtonSet.OK);
}

function rapikanDanPisahkanKuisOtomatis() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allRows = getAllDataRows(ss);
  if (allRows.length === 0) {
    SpreadsheetApp.getUi().alert("Belum ada data nilai siswa yang tersimpan di spreadsheet.");
    return;
  }

  var groups = {};
  allRows.forEach(function(row) {
    var quizTitle = String(row[6] || "").trim();
    if (!quizTitle || quizTitle.toLowerCase().indexOf("percobaan") !== -1) return;
    var tabName = getCleanTabName(quizTitle);
    if (!groups[tabName]) groups[tabName] = { title: quizTitle, rows: [] };
    groups[tabName].rows.push(row);
  });

  var groupKeys = Object.keys(groups);
  if (groupKeys.length === 0) {
    SpreadsheetApp.getUi().alert("Tidak ditemukan nama kuis yang valid untuk diklasifikasikan.");
    return;
  }

  groupKeys.forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) { sheet = ss.insertSheet(tabName); } else { sheet.clear(); }

    var quizTitle = groups[tabName].title;
    var items = groups[tabName].rows;

    items.sort(function(a, b) {
      var numA = parseInt(a[2], 10);
      var numB = parseInt(b[2], 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a[1]).localeCompare(String(b[1]));
    });

    var totalCount = items.length;
    var passedCount = items.filter(function(r) { return Number(r[7] || 0) >= 75; }).length;
    var avgScore = totalCount > 0 ? Math.round(items.reduce(function(acc, curr) { return acc + Number(curr[7] || 0); }, 0) / totalCount) : 0;

    sheet.appendRow(["📋 DAFTAR SISWA YANG SUDAH MENGUMPULKAN: " + quizTitle.toUpperCase()]);
    var b1 = sheet.getRange(1, 1, 1, 11);
    b1.merge();
    b1.setBackground("#064e3b");
    b1.setFontColor("#ffffff");
    b1.setFontWeight("bold");
    b1.setFontSize(11);
    sheet.setRowHeight(1, 38);

    sheet.appendRow(["Total Siswa Mengumpulkan: " + totalCount + " Siswa  |  Lulus KKM (>=75): " + passedCount + " Siswa  |  Rata-rata: " + avgScore + " / 100"]);
    var b2 = sheet.getRange(2, 1, 1, 11);
    b2.merge();
    b2.setBackground("#0f766e");
    b2.setFontColor("#ecfdf5");
    b2.setFontWeight("bold");
    b2.setFontSize(9);
    sheet.setRowHeight(2, 28);

    var headers = ["No", "Waktu Pengumpulan", "Nama Lengkap Siswa", "No. Absen", "Kelas / Jurusan", "Sekolah / Instansi", "Modul Laboratorium", "Nilai (0 - 100)", "Benar / Total", "Status KKM", "Rincian Jawaban Siswa"];
    sheet.appendRow(headers);
    var hRange = sheet.getRange(3, 1, 1, headers.length);
    hRange.setBackground("#1e293b");
    hRange.setFontColor("#ffffff");
    hRange.setFontWeight("bold");
    hRange.setHorizontalAlignment("center");
    sheet.setRowHeight(3, 32);
    sheet.setFrozenRows(3);

    var no = 1;
    items.forEach(function(r) {
      var score = Number(r[7] || 0);
      var correct = r[8] !== undefined ? r[8] : "-";
      var total = r[9] !== undefined ? r[9] : "-";
      var status = r[10] || (score >= 75 ? "LULUS" : "REMEDIAL");
      var detail = r[11] || "-";

      sheet.appendRow([no++, r[0], r[1], r[2], r[3], r[4], r[5], score, correct + " / " + total, status, detail]);
      var lr = sheet.getLastRow();
      sheet.setRowHeight(lr, 26);
      sheet.getRange(lr, 1).setHorizontalAlignment("center");
      sheet.getRange(lr, 2).setHorizontalAlignment("center");
      sheet.getRange(lr, 4).setHorizontalAlignment("center");
      sheet.getRange(lr, 5).setHorizontalAlignment("center");
      sheet.getRange(lr, 8).setHorizontalAlignment("center");
      sheet.getRange(lr, 9).setHorizontalAlignment("center");
      sheet.getRange(lr, 10).setHorizontalAlignment("center");

      var scCell = sheet.getRange(lr, 8);
      var stCell = sheet.getRange(lr, 10);
      scCell.setFontWeight("bold");
      stCell.setFontWeight("bold");
      if (score >= 75) {
        stCell.setBackground("#dcfce7");
        stCell.setFontColor("#166534");
        scCell.setFontColor("#16a34a");
      } else {
        stCell.setBackground("#fee2e2");
        stCell.setFontColor("#991b1b");
        scCell.setFontColor("#dc2626");
      }
    });

    sheet.setColumnWidth(1, 45);
    sheet.setColumnWidth(2, 160);
    sheet.setColumnWidth(3, 230);
    sheet.setColumnWidth(4, 85);
    sheet.setColumnWidth(5, 110);
    sheet.setColumnWidth(6, 160);
    sheet.setColumnWidth(7, 150);
    sheet.setColumnWidth(8, 100);
    sheet.setColumnWidth(9, 100);
    sheet.setColumnWidth(10, 110);
    sheet.setColumnWidth(11, 280);
  });

  buatMatriksRekapPengumpulan();
  SpreadsheetApp.getUi().alert("✅ Berhasil! Nilai siswa diklasifikasikan ke tab kuis masing-masing dan lembar Matriks Rekap Pengumpulan telah selesai dibuat.");
}

function buatMatriksRekapPengumpulan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allRows = getAllDataRows(ss);
  if (allRows.length === 0) return;

  var studentsMap = {};
  var quizzesSet = {};

  allRows.forEach(function(r) {
    var nama = String(r[1] || "").trim();
    if (!nama || nama.toLowerCase().indexOf("percobaan") !== -1) return;
    var absen = String(r[2] || "-");
    var kelas = String(r[3] || "-");
    var judulKuis = String(r[6] || "").trim();
    var skor = Number(r[7] || 0);
    if (!judulKuis) return;

    var studentKey = nama.toLowerCase();
    if (!studentsMap[studentKey]) {
      studentsMap[studentKey] = { nama: nama, absen: absen, kelas: kelas, scores: {} };
    }
    if (studentsMap[studentKey].scores[judulKuis] === undefined || skor > studentsMap[studentKey].scores[judulKuis].skor) {
      studentsMap[studentKey].scores[judulKuis] = { skor: skor, waktu: String(r[0] || "") };
    }
    quizzesSet[judulKuis] = true;
  });

  var quizList = Object.keys(quizzesSet).sort();
  var studentKeys = Object.keys(studentsMap).sort(function(a, b) {
    var numA = parseInt(studentsMap[a].absen, 10);
    var numB = parseInt(studentsMap[b].absen, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return studentsMap[a].nama.localeCompare(studentsMap[b].nama);
  });

  var matrixSheetName = "📊 Matriks Rekap Pengumpulan";
  var sheet = ss.getSheetByName(matrixSheetName);
  if (!sheet) { sheet = ss.insertSheet(matrixSheetName, 0); } else { sheet.clear(); }

  var matrixHeaders = ["No", "Nama Lengkap Siswa", "No. Absen", "Kelas / Jurusan"];
  quizList.forEach(function(q) { matrixHeaders.push(getCleanTabName(q)); });
  matrixHeaders.push("Total Selesai");
  matrixHeaders.push("Rata-rata Nilai");
  matrixHeaders.push("Status");

  sheet.appendRow(matrixHeaders);
  var hRange = sheet.getRange(1, 1, 1, matrixHeaders.length);
  hRange.setBackground("#0f172a");
  hRange.setFontColor("#ffffff");
  hRange.setFontWeight("bold");
  hRange.setHorizontalAlignment("center");
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);

  var no = 1;
  studentKeys.forEach(function(k) {
    var s = studentsMap[k];
    var row = [no++, s.nama, s.absen, s.kelas];
    var finishedCount = 0;
    var totalScore = 0;

    quizList.forEach(function(q) {
      if (s.scores[q] !== undefined) {
        finishedCount++;
        totalScore += s.scores[q].skor;
        row.push(s.scores[q].skor + " (LULUS)");
      } else {
        row.push("⏳ Belum");
      }
    });

    var avg = finishedCount > 0 ? Math.round(totalScore / finishedCount) : 0;
    row.push(finishedCount + " / " + quizList.length + " Kuis");
    row.push(avg);
    row.push(finishedCount === quizList.length ? "LENGKAP" : (finishedCount > 0 ? "SEBAGIAN" : "BELUM ADA"));

    sheet.appendRow(row);
    var lr = sheet.getLastRow();
    sheet.setRowHeight(lr, 26);
    sheet.getRange(lr, 1).setHorizontalAlignment("center");
    sheet.getRange(lr, 3).setHorizontalAlignment("center");
    sheet.getRange(lr, 4).setHorizontalAlignment("center");
    sheet.getRange(lr, matrixHeaders.length - 2).setHorizontalAlignment("center");
    sheet.getRange(lr, matrixHeaders.length - 1).setHorizontalAlignment("center");
    sheet.getRange(lr, matrixHeaders.length).setHorizontalAlignment("center");

    for (var c = 0; c < quizList.length; c++) {
      var cell = sheet.getRange(lr, 5 + c);
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
  });

  sheet.setColumnWidth(1, 45);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 85);
  sheet.setColumnWidth(4, 110);
  for (var i = 0; i < quizList.length; i++) { sheet.setColumnWidth(5 + i, 180); }
}

function getCleanTabName(quizTitle) {
  var q = String(quizTitle || "").toLowerCase();
  if (q.indexOf("inspeksi apd") !== -1 || q.indexOf("apd") !== -1) return "🛡️ Inspeksi APD";
  if (q.indexOf("pengeboran") !== -1 || q.indexOf("pelat") !== -1) return "📋 JSA Pengeboran Pelat";
  if (q.indexOf("pengasahan") !== -1 || q.indexOf("pahat") !== -1 || q.indexOf("gerinda") !== -1) return "📋 JSA Pengasahan Pahat";
  if (q.indexOf("jsa") !== -1 || q.indexOf("job safety") !== -1) return "📋 JSA Praktik Mesin";
  if (q.indexOf("apar") !== -1 || q.indexOf("kebakaran") !== -1) return "🧯 Kuis APAR PASS";
  if (q.indexOf("5r") !== -1 || q.indexOf("budaya") !== -1) return "✨ Budaya Kerja 5R";
  if (q.indexOf("perkakas") !== -1) return "🔧 Perkakas Tangan";
  if (q.indexOf("qc") !== -1 || q.indexOf("benda uji") !== -1) return "🔍 Audit QC Benda Uji";
  if (q.indexOf("diagnostik") !== -1) return "📝 Tes Diagnostik";
  if (q.indexOf("evaluasi") !== -1) return "🎓 Evaluasi Akhir";
  var clean = quizTitle.replace(/[:\\\\/?*\\[\\]]/g, "-").trim();
  return clean.length > 35 ? clean.substring(0, 32) + "..." : clean;
}

function getAllDataRows(ss) {
  var bestRows = {};
  var sheets = ss.getSheets();
  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    if (name.indexOf("📊") !== -1 || name.indexOf("🛡️") !== -1 || name.indexOf("📋") !== -1 || name.indexOf("🧯") !== -1 || name.indexOf("✨") !== -1 || name.indexOf("🔧") !== -1 || name.indexOf("🔍") !== -1) return;
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    var headerRowIdx = -1;
    for (var i = 0; i < Math.min(data.length, 5); i++) {
      var rowStr = data[i].join(" ").toLowerCase();
      if (rowStr.indexOf("nama") !== -1 && (rowStr.indexOf("nilai") !== -1 || rowStr.indexOf("kuis") !== -1)) {
        headerRowIdx = i;
        break;
      }
    }
    if (headerRowIdx === -1) return;
    for (var r = headerRowIdx + 1; r < data.length; r++) {
      var row = data[r];
      var studentName = String(row[1] || "").trim();
      var quizTitle = String(row[6] || "").trim();
      if (typeof row[0] === "number" && isNaN(new Date(row[1]).getTime())) {
        studentName = String(row[2] || "").trim();
        quizTitle = String(row[6] || "").trim();
      }
      if (studentName && quizTitle && studentName.toLowerCase().indexOf("percobaan") === -1) {
        var studentKey = studentName.toLowerCase() + "_" + quizTitle.toLowerCase();
        var score = Number(row[7] || 0);
        if (!bestRows[studentKey] || score > Number(bestRows[studentKey][7] || 0)) {
          bestRows[studentKey] = row;
        }
      }
    }
  });
  var result = Object.keys(bestRows).map(function(k) { return bestRows[k]; });
  if (result.length === 0) {
    var curData = ss.getActiveSheet().getDataRange().getValues();
    for (var i = 1; i < curData.length; i++) {
      if (curData[i][1] && String(curData[i][1]).toLowerCase().indexOf("percobaan") === -1) {
        result.push(curData[i]);
      }
    }
  }
  return result;
}`;

// DEFINISI MODUL LAB SESUAI SIDEBAR
const ALL_LAB_TABS = [
  { id: 'all', label: 'Semua Modul', icon: '📋' },
  { id: 'safety', label: 'Safety Lab (K3)', icon: '🛡️' },
  { id: 'machine', label: 'Machine Lab', icon: '⚙️' },
  { id: 'cutting-tools', label: 'Alat Pemotong', icon: '🔪' },
  { id: 'heat-treatment', label: 'Heat Treatment', icon: '🌡️' },
  { id: 'mechanics', label: 'Mekanika Teknik', icon: '🔧' },
  { id: 'welding', label: 'Welding Lab', icon: '⚡' },
  { id: 'measuring', label: 'Alat Ukur Presisi', icon: '📏' },
  { id: 'design', label: 'Design Lab', icon: '📐' },
  { id: 'virtual-bengkel', label: 'Virtual Bengkel 3D', icon: '🏭' },
  { id: 'evaluasi', label: 'Evaluasi', icon: '📝' }
];

// DEFINISI SUB-KUIS SPESIFIK UNTUK TIAP MODUL SIDEBAR
const SUB_QUIZ_CONFIG = {
  safety: [
    { id: 'all', label: 'Semua Kuis Safety Lab', icon: '📑' },
    { id: 'apd', label: 'Kuis Inspeksi APD Operator', icon: '🛡️' },
    { id: 'diagnostic', label: 'Tes Diagnostik K3 (10 Soal)', icon: '📋' },
    { id: 'apar', label: 'Simulasi APAR P-A-S-S', icon: '🧯' },
    { id: '5r', label: 'Budaya Kerja 5R & Etika DUDI', icon: '🧹' },
    { id: 'perkakas', label: 'SOP Perkakas Tangan', icon: '🛠️' },
    { id: 'jsa', label: 'Penyusunan JSA DUDI', icon: '📋' },
    { id: 'qc', label: 'Audit QC Benda Uji DUDI', icon: '🔍' }
  ],
  machine: [
    { id: 'all', label: 'Semua Machine Lab', icon: '📑' },
    { id: 'diagnostic', label: 'Tes Diagnostik Machine Lab (10 Soal)', icon: '📋' },
    { id: 'pretest', label: 'Pre-Test Teori Permesinan', icon: '📝' },
    { id: 'cnc', label: 'Kuis Teori & Kode CNC', icon: '💻' },
    { id: 'lathe', label: 'Praktik Mesin Bubut', icon: '⚙️' }
  ],
  'cutting-tools': [
    { id: 'all', label: 'Semua Alat Pemotong', icon: '📑' },
    { id: 'diagnostic', label: 'Tes Diagnostik Alat Potong (10 Soal)', icon: '📋' },
    { id: 'cutting_quiz', label: 'Kuis Pahat & Kalkulasi RPM', icon: '🔪' }
  ],
  'heat-treatment': [
    { id: 'all', label: 'Semua Heat Treatment', icon: '📑' },
    { id: 'diagnostic', label: 'Tes Diagnostik Heat Treatment (10 Soal)', icon: '📋' },
    { id: 'metallurgy', label: 'Kuis Evaluasi Metalurgi', icon: '🌡️' }
  ],
  mechanics: [
    { id: 'all', label: 'Semua Mekanika Teknik', icon: '📑' },
    { id: 'diagnostic', label: 'Tes Diagnostik Mekanika (10 Soal)', icon: '📋' },
    { id: 'torque', label: 'Kuis Momen Gaya & Torsi', icon: '🔧' }
  ],
  welding: [
    { id: 'all', label: 'Semua Welding Lab', icon: '📑' },
    { id: 'diagnostic', label: 'Tes Diagnostik Welding Lab (10 Soal)', icon: '📋' },
    { id: 'smaw', label: 'Kuis Asesmen Las SMAW', icon: '⚡' }
  ],
  measuring: [
    { id: 'all', label: 'Semua Alat Ukur', icon: '📑' },
    { id: 'diagnostic', label: 'Tes Diagnostik Alat Ukur (10 Soal)', icon: '📋' },
    { id: 'caliper_micrometer', label: 'Uji Pembacaan Kaliper & Mikrometer', icon: '📏' }
  ],
  design: [
    { id: 'all', label: 'Semua Design Lab', icon: '📑' },
    { id: 'diagnostic', label: 'Tes Diagnostik Design Lab (10 Soal)', icon: '📋' },
    { id: 'cad_drawing', label: 'Kuis Gambar Teknik & CAD', icon: '📐' }
  ],
  'virtual-bengkel': [
    { id: 'all', label: 'Semua Bengkel 3D', icon: '📑' },
    { id: 'diagnostic', label: 'Tes Diagnostik Bengkel 3D (10 Soal)', icon: '📋' }
  ],
  evaluasi: [
    { id: 'all', label: 'Semua Evaluasi', icon: '📑' },
    { id: 'evaluasi_final', label: 'Evaluasi Akhir Komprehensif', icon: '📝' }
  ]
};

const TeacherGradebook = () => {
  const [scores, setScores] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuizName, setSelectedQuizName] = useState('all');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'matrix' | 'flat'
  const isGroupedByQuiz = viewMode === 'grouped';
  const [sortBy, setSortBy] = useState('quiz_name');
  
  // Tab Navigasi Sesuai Sidebar & Sub-Kuis
  const [activeTab, setActiveTab] = useState('safety'); // Default langsung ke Safety Lab K3 sesuai permintaan guru
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
    showToast('🌐 Membuka Google Spreadsheet Nilai Siswa (SMKN 2 Depok)...');
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
    return scores.map(item => {
      const detected = detectLabAndSubQuiz(item);
      return {
        ...item,
        labId: detected.labId,
        labLabel: detected.labLabel,
        labIcon: detected.labIcon,
        subId: detected.subId,
        subLabel: item.subModul || item.jenisKuis || detected.subLabel
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
    const quizzesSet = new Set();

    const baseData = activeTab === 'all'
      ? enrichedScores
      : enrichedScores.filter(s => s.labId === activeTab);

    baseData.forEach(item => {
      const nama = (item.namaSiswa || '').trim();
      const judulKuis = (item.judulKuis || '').trim();
      if (!nama || !judulKuis) return;

      quizzesSet.add(judulKuis);
      const studentKey = nama.toLowerCase();

      if (!studentsMap[studentKey]) {
        studentsMap[studentKey] = {
          nama: nama,
          nomorAbsen: item.nomorAbsen || '-',
          kelas: item.kelas || '-',
          sekolah: item.sekolah || 'SMKN 2 Depok',
          submissions: {}
        };
      }

      if (studentsMap[studentKey].nomorAbsen === '-' && item.nomorAbsen) {
        studentsMap[studentKey].nomorAbsen = item.nomorAbsen;
      }
      if (studentsMap[studentKey].kelas === '-' && item.kelas) {
        studentsMap[studentKey].kelas = item.kelas;
      }

      const existing = studentsMap[studentKey].submissions[judulKuis];
      if (!existing || Number(item.skor) > Number(existing.skor)) {
        studentsMap[studentKey].submissions[judulKuis] = {
          skor: Number(item.skor) || 0,
          status: item.status || (Number(item.skor) >= 75 ? 'LULUS' : 'REMEDIAL'),
          waktu: item.waktu || item.timestamp?.slice(0, 10),
          jawabanBenar: item.jawabanBenar,
          totalSoal: item.totalSoal,
          record: item
        };
      }
    });

    const quizList = Array.from(quizzesSet).sort();
    const studentList = Object.values(studentsMap).sort((a, b) => {
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
      return `${labName} ➔ ${foundSub ? foundSub.label : ''}`;
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
    setTestStatus('✅ Pengaturan berhasil disimpan!');
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
      setTestStatus('✅ Berhasil terkirim! Silakan periksa Google Spreadsheet Anda.');
    } else {
      sound.playError();
      setTestStatus(`⚠️ Gagal mengirim: ${res.error || res.reason || 'Periksa kembali URL Webhook Anda'}`);
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
      showToast('🗑️ Data lokal berhasil dibersihkan.');
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
          <span>📗</span>
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
                showToast('✅ Data nilai siswa berhasil diperbarui!');
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
              <span>🔄</span>
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
                  showToast('🌐 Membuka Google Spreadsheet Nilai Siswa (SMKN 2 Depok) di tab baru...');
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
                <span style={{ fontSize: '1rem' }}>↗️</span>
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
                ⚙️
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
              <span>📥</span>
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
              <span>📄</span>
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
              <span>📋</span>
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
              <span>🖨️</span>
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* STATUS & INFO SUBBAR */}
        <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontWeight: 800 }}>
              <span>📍</span>
              <span>Lembar Aktif: <strong>{currentLabTitle}</strong></span>
            </span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ color: '#cbd5e1' }}>Guru Pengampu: <strong>Bimoro Kusumo, S.Pd.</strong></span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ color: '#cbd5e1' }}>Kelas: <strong>X TPM 1 (Teknik Permesinan)</strong></span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ color: '#6ee7b7', fontSize: '0.78rem' }}>
              🕒 Pembaruan Terakhir: <strong>{lastSyncTime} WIB</strong>
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
              📦 Unduh Seluruh Lab (.xls)
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
              🗑️ Reset Data
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
                <span>{tab.icon}</span>
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
              <span>📑</span>
              <span>2. Pilih Lembar Sub-Kuis Spesifik di <strong>{currentLabTitle.split(' ➔ ')[0]}</strong>:</span>
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
                  <span>{sub.icon}</span>
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
              ➔ Lembar: <strong>{currentLabTitle}</strong> | Rata-rata Skor: <strong>{averageScore} / 100</strong>
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
            <span style={{ fontSize: '1.2rem' }}>📝</span>
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
            <span style={{ fontSize: '1.2rem' }}>👥</span>
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
            <span style={{ fontSize: '1.2rem' }}>⭐</span>
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
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
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
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
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
                📋 Nama Kuis:
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
              <option value="LULUS">✓ LULUS (≥ 75)</option>
              <option value="REMEDIAL">✗ REMEDIAL (&lt; 75)</option>
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
              <option value="highest_score">Urutkan: Skor Tertinggi (100 ➔ 0)</option>
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
              <span>📑</span>
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
              <span>📊</span>
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
              <span>📋</span>
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
              ✕ Hapus Filter Kuis (Tampilkan Semua)
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
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📂</div>
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
                                  ⏳ Belum
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
                                  {isPassed ? '✓' : '✗'} {sub.skor}
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
                            {isComplete ? '✓ LENGKAP' : (finishedCount > 0 ? 'SEBAGIAN' : 'BELUM ADA')}
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
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📂</div>
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
                                📋 {group.quizName}
                              </strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem' }}>
                              <span>👥 <strong>{group.totalCount}</strong> Siswa</span>
                              <span style={{ color: '#94a3b8' }}>|</span>
                              <span>⭐ Rata-rata: <strong>{group.avgScore}</strong>/100</span>
                              <span style={{ color: '#94a3b8' }}>|</span>
                              <span>🏆 Tertinggi: <strong>{group.maxScore}</strong></span>
                              <span style={{ color: '#94a3b8' }}>|</span>
                              <span style={{ color: group.passPct >= 75 ? '#6ee7b7' : '#fca5a5' }}>
                                ✅ Kelulusan KKM: <strong>{group.passedCount}/{group.totalCount} ({group.passPct}%)</strong>
                              </span>
                            </div>
                          </div>

                          {/* DAFTAR NAMA SISWA YANG MENGUMPULKAN KUIS INI */}
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                              👤 Siswa yang Sudah Mengumpulkan ({group.totalCount} Siswa):
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
                                {isPassed ? '✓ LULUS' : '✗ REMEDIAL'}
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
                                🔍 Rincian
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
                          {isPassed ? '✓ LULUS' : '✗ REMEDIAL'}
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
                          🔍 Rincian
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
                    {activeSubTab !== 'all' ? currentLabTitle.split(' ➔ ')[1] : 'Semua Sub-Kuis'}
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
          <span>💡 <em>Klik tombol <strong>"Unduh Excel Lembar Ini (.xls)"</strong> untuk langsung mencetak atau mengolah nilai sub-kuis ini.</em></span>
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
            <span style={{ fontSize: '1.2rem' }}>⚙️</span>
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
                📋 Panduan & Salin Kode Apps Script
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
                {webhookUrl ? '🟢 Ganti URL Webhook' : '⚙️ Tempel URL Webhook'}
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
                  🔄 Sinkronkan {pendingSyncCount} Nilai Tertunda
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
                <span style={{ fontSize: '1.3rem' }}>🔍</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Rincian Hasil Asesmen Siswa
                </h3>
              </div>
              <button onClick={() => setSelectedDetailRecord(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
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
                <span>⚙️</span> Konfigurasi Webhook Google Spreadsheet
              </h3>
              <button onClick={() => setIsConfigModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Konfigurasikan integrasi Google Spreadsheet agar hasil kuis otomatis terkirim dan tombol <strong>Buka Google Sheets</strong> langsung membuka file Anda.
            </p>

            {/* QUICK LINK BUTTONS */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📌</span>
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
                  <span>📂 Buka Daftar Sheets Anda (sheets.google.com) ↗</span>
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
                  <span>➕ Buat File Baru (sheets.new) ↗</span>
                </a>
              </div>
            </div>

            <form onSubmit={handleSaveWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
                  🔗 Tautan Langsung Dokumen Spreadsheet Anda (Opsional):
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
                  Saat diisi, tombol <strong>↗️ Buka Google Sheets</strong> di toolbar akan langsung membuka file ini.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
                  ⚡ URL Web App Google Apps Script (Webhook Pengirim Nilai):
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
                  🧪 Uji Kirim Baris Tes
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
                <span>📋</span> Kode Google Apps Script & Cara Pasang (Opsional)
              </h3>
              <button onClick={() => setIsGuideModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', fontSize: '0.86rem', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Langkah Pemasangan di Google Spreadsheet Pribadi:</div>
              <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Buka <strong>https://sheets.new</strong> di tab baru untuk membuat spreadsheet kosong.</li>
                <li>Klik menu <strong>Ekstensi (Extensions)</strong> ➔ pilih <strong>Apps Script</strong>.</li>
                <li>Hapus kode lama, lalu klik tombol <strong>"Salin Kode Apps Script"</strong> di bawah dan tempelkan.</li>
                <li>Klik <strong>Simpan</strong> (ikon disket), lalu klik tombol biru <strong>Terapkan (Deploy)</strong> ➔ <strong>Penerapan baru</strong>.</li>
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
                  {copyCodeSuccess ? '✓ Kode Berhasil Disalin!' : '📋 Salin Kode Apps Script'}
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
                Lanjut Masukkan URL Webhook ➔
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
                <span style={{ fontSize: '1.4rem' }}>📋</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  Data Nilai Berhasil Disalin! Buka Google Sheets & Paste
                </h3>
              </div>
              <button onClick={() => setIsPasteGuideModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px' }}>
                <span>✅</span>
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
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  Akses Google Sheets (SMKN 2 Depok)
                </h3>
              </div>
              <button
                onClick={() => setIsOpenSheetModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              Pilih cara membuka spreadsheet atau tautkan URL Google Spreadsheet yang biasa Anda gunakan agar tombol <strong>Buka Google Sheets</strong> langsung menuju dokumen nilai Anda.
            </p>

            {/* OPSI 1: TAUTKAN URL SPREADSHEET PRIBADI */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.86rem', color: '#0f172a', marginBottom: '6px' }}>
                🔗 Tautan Langsung Google Spreadsheet Anda:
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
                      showToast('✅ Tautan disimpan & Spreadsheet dibuka!');
                    } else {
                      showToast('✅ Pengaturan tautan diperbarui!');
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
                  Simpan & Buka ↗
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                💡 Tempelkan link file Spreadsheet Anda di sini. Tombol di toolbar akan langsung membuka file ini setiap kali diklik.
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
                  <span>📂</span>
                  <span>Buka Beranda Google Sheets (docs.google.com)</span>
                </div>
                <span>↗</span>
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
                  <span>➕</span>
                  <span>Buat File Baru (sheets.new) & Salin Otomatis Tabel Ini</span>
                </div>
                <span>↗</span>
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

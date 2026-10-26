import{r as e}from"./rolldown-runtime-hePW80VL.js";import{c as t}from"./vendor-libs-CzXoy4to.js";import{At as n,Ct as r,E as i,F as a,Gt as o,H as s,It as c,K as l,Kt as u,L as ee,Mt as d,N as f,Nt as p,Ot as m,Qt as h,S as g,U as te,Vt as _,Yt as ne,Zt as v,_ as re,a as y,b as ie,c as b,et as x,f as ae,ft as S,jt as oe,nn as se,o as C,q as ce,sn as le,v as w,w as ue,zt as de}from"./vendor-react-BGJjV_-c.js";import{S as fe,_ as pe,c as me,d as he,f as ge,g as _e,h as ve,i as ye,l as be,o as xe,p as Se,r as T,s as Ce,u as E,v as we,x as Te}from"./index-BZAlG26j.js";var D=e(t(),1),O=y(),Ee=`/**
 * =============================================================================
 * GOOGLE APPS SCRIPT - BIMO MANUFACTURING LABS (REKAP EVALUASI C1 - C5)
 * =============================================================================
 * 
 * Versi Khusus: Mode Sheet Tunggal (Tanpa Menambah Sheet Baru)
 * - Menggunakan sheet yang sudah ada di spreadsheet Anda secara langsung.
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

// DEFINISI 5 TINGKATAN EVALUASI KOGNITIF (C1 S.D. C5)
var EVAL_TASKS = [
  { key: "c1", colIdx: 5, name: "Evaluasi C1 (Mengingat)", short: "C1: Mengingat", keywords: ["c1", "mengingat", "pengetahuan dasar"] },
  { key: "c2", colIdx: 6, name: "Evaluasi C2 (Memahami)", short: "C2: Memahami", keywords: ["c2", "memahami", "konsep"] },
  { key: "c3", colIdx: 7, name: "Evaluasi C3 (Menerapkan)", short: "C3: Menerapkan", keywords: ["c3", "menerapkan", "prosedur", "aplikasi"] },
  { key: "c4", colIdx: 8, name: "Evaluasi C4 (Menganalisis)", short: "C4: Menganalisis", keywords: ["c4", "menganalisis", "analisis", "cacat"] },
  { key: "c5", colIdx: 9, name: "Evaluasi C5 (Mengevaluasi)", short: "C5: Mengevaluasi", keywords: ["c5", "mengevaluasi", "evaluasi", "hots"] }
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
 * 2. MENDAPATKAN SHEET YANG SUDAH ADA (TANPA MENAMBAH SHEET BARU)
 * =============================================================================
 */
function getExistingTargetSheet(ss) {
  var sheets = ss.getSheets();
  
  // 1. Prioritaskan sheet yang aktif dibuka oleh guru
  var active = ss.getActiveSheet();
  if (active && active.getName().toLowerCase().indexOf("raw") === -1 && active.getName().toLowerCase().indexOf("data masuk") === -1) {
    return active;
  }

  // 2. Cari sheet yang namanya mengandung kata 'evaluasi'
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName().toLowerCase();
    if (name.indexOf("evaluasi") !== -1) {
      return sheets[i];
    }
  }

  // 3. Cari sheet pertama yang bukan sheet penampung raw data
  for (var j = 0; j < sheets.length; j++) {
    var n = sheets[j].getName().toLowerCase();
    if (n.indexOf("data") === -1 && n.indexOf("raw") === -1) {
      return sheets[j];
    }
  }

  // 4. Fallback ke sheet pertama yang ada
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

    // Deteksi letak kolom nama, kuis, nilai, absen
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

      // Cari nilai angka (0 - 100)
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

      // Cari kecocokan siswa di master list
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

      // Identifikasi apakah ini evaluasi C1, C2, C3, C4, atau C5
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
        // Pemulihan berurutan jika judul sebelumnya "Evaluasi undefined"
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

    // Format nilai C1 - C5
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

    // Format Rata-rata & Status
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
  var statStartRow = sheet.getLastRow() + 1;

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

  // Atur lebar kolom agar proporsional dan mudah dibaca
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
    SpreadsheetApp.getUi().alert("[OK] Berhasil!

Sheet ini telah diperbarui secara langsung dengan kolom Evaluasi C1 hingga C5.

Nilai C1 dan C2 yang dikerjakan siswa telah berhasil ditampilkan tanpa menambah sheet baru.");
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
  var resp = ui.alert("Konfirmasi Bersihkan Tab Tambahan", "Apakah Anda ingin menghapus tab-tab tambahan (misal Safety Lab, Machine Lab, dll) dan HANYA MENYISAKAN sheet utama '" + targetSheet.getName() + "'?", ui.ButtonSet.YES_NO);
  
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

    // Dapatkan target sheet yang sudah ada
    var sheet = getExistingTargetSheet(ss);

    // Identifikasi level C1 - C5
    var text = (modul + " " + judulKuis + " " + detailJawaban).toLowerCase();
    var targetCol = 5; // Default C1 (Kolom E)
    if (text.indexOf("c2") !== -1 || text.indexOf("memahami") !== -1) targetCol = 6;
    else if (text.indexOf("c3") !== -1 || text.indexOf("menerapkan") !== -1) targetCol = 7;
    else if (text.indexOf("c4") !== -1 || text.indexOf("menganalisis") !== -1) targetCol = 8;
    else if (text.indexOf("c5") !== -1 || text.indexOf("mengevaluasi") !== -1 || text.indexOf("hots") !== -1) targetCol = 9;

    // Cari baris siswa di sheet
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
      // Update cell skor langsung di sheet yang ada
      var cell = sheet.getRange(targetRow, targetCol);
      var currentVal = cell.getValue();
      if (typeof currentVal !== "number" || skor > currentVal) {
        cell.setValue(skor);
        cell.setFontWeight("bold");
        cell.setFontColor(skor >= 75 ? "#16a34a" : "#dc2626");
      }

      // Hitung ulang rata-rata baris
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

`,De=[{id:`safety`,tabName:`1. Safety Lab`,shortTitle:`Safety Lab (K3LH)`,tasks:[{key:`apd`,name:`Inspeksi APD Operator`,category:`Kuis Praktik K3`,keywords:[`inspeksi apd`,`apd`]},{key:`jsa_bor`,name:`JSA Pengeboran Pelat Baja`,category:`Asesmen JSA`,keywords:[`pengeboran`,`pelat`,`bor meja`]},{key:`jsa_pahat`,name:`JSA Pengasahan Pahat Bubut`,category:`Asesmen JSA`,keywords:[`pengasahan`,`pahat`,`gerinda`]},{key:`apar`,name:`Simulasi APAR P-A-S-S`,category:`Tanggap Darurat`,keywords:[`apar`,`pass`,`kebakaran`]},{key:`5r`,name:`Budaya Kerja 5R & Etika DUDI`,category:`Etika Industri`,keywords:[`5r`,`budaya`]},{key:`perkakas`,name:`SOP Perkakas Tangan & Ragum`,category:`SOP Praktik`,keywords:[`perkakas`,`ragum`]},{key:`qc`,name:`Audit QC Benda Uji DUDI`,category:`Pengukuran & QC`,keywords:[`qc`,`benda uji`,`tarik`]},{key:`diag_safety`,name:`Tes Diagnostik Safety K3`,category:`Tes Diagnostik`,keywords:[`diagnostik safety`,`diagnostik k3`]}]},{id:`machine`,tabName:`2. Machine Lab`,shortTitle:`Machine Lab (Permesinan)`,tasks:[{key:`lathe`,name:`Test Teori Mesin Bubut`,category:`Teori Mesin Bubut`,keywords:[`soal test kompetensi mesin bubut`,`pre-test mesin bubut`,`lathe test`,`mesin bubut`,`bubut`,`lathe`]},{key:`milling`,name:`Test Teori Mesin Frais`,category:`Teori Mesin Frais`,keywords:[`soal test kompetensi mesin frais`,`pre-test mesin frais`,`milling test`,`mesin frais`,`frais`,`milling`]},{key:`cnc`,name:`Test Teori & Kode CNC`,category:`Teori & Kode CNC`,keywords:[`asesmen teori & kode cnc`,`kode cnc`,`cnc`,`g-code`,`kode g`]},{key:`diag_machine`,name:`Tes Diagnostik Machine Lab`,category:`Tes Diagnostik`,keywords:[`diagnostik machine`,`diagnostik mesin`]}]},{id:`cutting-tools`,tabName:`3. Perkakas Bengkel`,shortTitle:`Perkakas Bengkel & RPM`,tasks:[{key:`cutting_quiz`,name:`Kuis Perkakas & Kalkulasi RPM`,category:`Kuis Parameter Potong`,keywords:[`kalkulasi rpm`,`perkakas`,`kikir`,`pahat`,`sudut potong`,`cutting`]},{key:`diag_cutting`,name:`Tes Diagnostik Perkakas Bengkel`,category:`Tes Diagnostik`,keywords:[`diagnostik cutting`,`diagnostik alat potong`,`diagnostik perkakas`]}]},{id:`heat-treatment`,tabName:`4. Heat Treatment`,shortTitle:`Heat Treatment & Metalurgi`,tasks:[{key:`metallurgy`,name:`Kuis Evaluasi Metalurgi`,category:`Evaluasi Metalurgi`,keywords:[`metalurgi`,`hardening`,`quenching`,`tempering`,`heat treatment`]},{key:`diag_heat`,name:`Tes Diagnostik Heat Treatment`,category:`Tes Diagnostik`,keywords:[`diagnostik heat`,`diagnostik perlakuan panas`]}]},{id:`mechanics`,tabName:`5. Mekanika Teknik`,shortTitle:`Mekanika Teknik Terapan`,tasks:[{key:`torque`,name:`Kuis Momen Gaya & Torsi`,category:`Kuis Mekanika Terapan`,keywords:[`torsi`,`momen gaya`,`tuas`,`kesetimbangan`]},{key:`diag_mechanics`,name:`Tes Diagnostik Mekanika`,category:`Tes Diagnostik`,keywords:[`diagnostik mekanika`,`diagnostik mechanics`]}]},{id:`welding`,tabName:`6. Welding Lab`,shortTitle:`Welding Lab (Pengelasan)`,tasks:[{key:`smaw`,name:`Kuis Asesmen Las SMAW`,category:`Asesmen Pengelasan`,keywords:[`smaw`,`las busur`,`pengelasan`,`welding`]},{key:`diag_welding`,name:`Tes Diagnostik Welding Lab`,category:`Tes Diagnostik`,keywords:[`diagnostik welding`,`diagnostik las`]}]},{id:`measuring`,tabName:`7. Alat Ukur Presisi`,shortTitle:`Alat Ukur Presisi & Metrologi`,tasks:[{key:`caliper_micrometer`,name:`Uji Pembacaan Kaliper & Mikrometer`,category:`Uji Presisi`,keywords:[`kaliper`,`mikrometer`,`jangka sorong`,`alat ukur`,`measuring`]},{key:`diag_measuring`,name:`Tes Diagnostik Alat Ukur`,category:`Tes Diagnostik`,keywords:[`diagnostik alat ukur`,`diagnostik measuring`]}]},{id:`design`,tabName:`8. Design Lab`,shortTitle:`Design Lab & Studio CAD`,tasks:[{key:`cad_drawing`,name:`Kuis Gambar Teknik & CAD`,category:`Kuis Gambar Teknik`,keywords:[`gambar teknik`,`cad`,`proyeksi`,`studio cad`]},{key:`diag_design`,name:`Tes Diagnostik Design Lab`,category:`Tes Diagnostik`,keywords:[`diagnostik design`,`diagnostik gambar`]}]},{id:`virtual-bengkel`,tabName:`9. Virtual Bengkel`,shortTitle:`Virtual Bengkel 3D`,tasks:[{key:`virtual_bengkel`,name:`Praktik Workshop 3D`,category:`Eksplorasi Bengkel`,keywords:[`workshop 3d`,`virtual bengkel`,`bengkel 3d`,`sop bengkel`]},{key:`diag_virtual`,name:`Tes Diagnostik Bengkel 3D`,category:`Tes Diagnostik`,keywords:[`diagnostik bengkel`,`diagnostik virtual`]}]},{id:`evaluasi`,tabName:`10. Evaluasi Akhir`,shortTitle:`Evaluasi Akhir Komprehensif`,tasks:[{key:`evaluasi_c1`,name:`Evaluasi C1 (Mengingat)`,category:`Evaluasi Kognitif`,keywords:[`c1`,`mengingat`,`pengetahuan dasar`]},{key:`evaluasi_c2`,name:`Evaluasi C2 (Memahami)`,category:`Evaluasi Kognitif`,keywords:[`c2`,`memahami`,`konsep`]},{key:`evaluasi_c3`,name:`Evaluasi C3 (Menerapkan)`,category:`Evaluasi Kognitif`,keywords:[`c3`,`menerapkan`,`aplikasi`,`prosedur`]},{key:`evaluasi_c4`,name:`Evaluasi C4 (Menganalisis)`,category:`Evaluasi Kognitif`,keywords:[`c4`,`menganalisis`,`analisis`,`cacat`]},{key:`evaluasi_c5`,name:`Evaluasi C5 (Mengevaluasi)`,category:`Evaluasi Kognitif`,keywords:[`c5`,`mengevaluasi`,`evaluasi`,`hots`]}]}],Oe=e=>{switch(e){case`safety`:return(0,O.jsx)(f,{size:15});case`machine`:return(0,O.jsx)(u,{size:15});case`cutting-tools`:return(0,O.jsx)(_,{size:15});case`heat-treatment`:return(0,O.jsx)(n,{size:15});case`mechanics`:return(0,O.jsx)(b,{size:15});case`welding`:return(0,O.jsx)(C,{size:15});case`measuring`:return(0,O.jsx)(s,{size:15});case`design`:return(0,O.jsx)(o,{size:15});case`virtual-bengkel`:return(0,O.jsx)(p,{size:15});case`evaluasi`:return(0,O.jsx)(r,{size:15});default:return(0,O.jsx)(S,{size:15})}},ke=e=>{switch(e){case`diagnostic`:return(0,O.jsx)(h,{size:14});case`apd`:return(0,O.jsx)(f,{size:14});case`apar`:return(0,O.jsx)(w,{size:14});case`5r`:return(0,O.jsx)(i,{size:14});case`perkakas`:return(0,O.jsx)(b,{size:14});case`jsa`:return(0,O.jsx)(oe,{size:14});case`qc`:return(0,O.jsx)(ee,{size:14});case`lathe`:return(0,O.jsx)(te,{size:14});case`milling`:return(0,O.jsx)(S,{size:14});case`cnc`:return(0,O.jsx)(x,{size:14});case`cutting_quiz`:return(0,O.jsx)(_,{size:14});case`metallurgy`:return(0,O.jsx)(n,{size:14});case`torque`:return(0,O.jsx)(b,{size:14});case`smaw`:return(0,O.jsx)(C,{size:14});case`caliper_micrometer`:return(0,O.jsx)(s,{size:14});case`cad_drawing`:return(0,O.jsx)(o,{size:14});case`virtual_bengkel`:return(0,O.jsx)(p,{size:14});case`evaluasi_c1`:case`evaluasi_c2`:case`evaluasi_c3`:case`evaluasi_c4`:case`evaluasi_c5`:case`evaluasi_final`:return(0,O.jsx)(r,{size:14});default:return(0,O.jsx)(d,{size:14})}},Ae=[{id:`all`,label:`Semua Modul`,icon:``},{id:`safety`,label:`Safety Lab (K3)`,icon:``},{id:`machine`,label:`Machine Lab`,icon:``},{id:`cutting-tools`,label:`Perkakas Bengkel`,icon:``},{id:`heat-treatment`,label:`Heat Treatment`,icon:``},{id:`mechanics`,label:`Mekanika Teknik`,icon:``},{id:`welding`,label:`Welding Lab`,icon:``},{id:`measuring`,label:`Alat Ukur Presisi`,icon:``},{id:`design`,label:`Design Lab`,icon:``},{id:`virtual-bengkel`,label:`Virtual Bengkel 3D`,icon:``},{id:`evaluasi`,label:`Evaluasi`,icon:``}],je={safety:[{id:`all`,label:`Semua Kuis Safety Lab`,icon:``},{id:`apd`,label:`Kuis Inspeksi APD Operator`,icon:``},{id:`diagnostic`,label:`Tes Diagnostik K3 (10 Soal)`,icon:``},{id:`apar`,label:`Simulasi APAR P-A-S-S`,icon:``},{id:`5r`,label:`Budaya Kerja 5R & Etika DUDI`,icon:``},{id:`perkakas`,label:`SOP Perkakas Tangan`,icon:``},{id:`jsa`,label:`Penyusunan JSA DUDI`,icon:``},{id:`qc`,label:`Audit QC Benda Uji DUDI`,icon:``}],machine:[{id:`all`,label:`Semua Machine Lab`,icon:``},{id:`lathe`,label:`Test Teori Mesin Bubut`,icon:``},{id:`milling`,label:`Test Teori Mesin Frais`,icon:``},{id:`cnc`,label:`Test Teori & Kode CNC`,icon:``},{id:`diagnostic`,label:`Tes Diagnostik Machine Lab (10 Soal)`,icon:``}],"cutting-tools":[{id:`all`,label:`Semua Perkakas Bengkel`,icon:``},{id:`diagnostic`,label:`Tes Diagnostik Perkakas (10 Soal)`,icon:``},{id:`cutting_quiz`,label:`Kuis Perkakas & Kalkulasi RPM`,icon:``}],"heat-treatment":[{id:`all`,label:`Semua Heat Treatment`,icon:``},{id:`diagnostic`,label:`Tes Diagnostik Heat Treatment (10 Soal)`,icon:``},{id:`metallurgy`,label:`Kuis Evaluasi Metalurgi`,icon:``}],mechanics:[{id:`all`,label:`Semua Mekanika Teknik`,icon:``},{id:`diagnostic`,label:`Tes Diagnostik Mekanika (10 Soal)`,icon:``},{id:`torque`,label:`Kuis Momen Gaya & Torsi`,icon:``}],welding:[{id:`all`,label:`Semua Welding Lab`,icon:``},{id:`diagnostic`,label:`Tes Diagnostik Welding Lab (10 Soal)`,icon:``},{id:`smaw`,label:`Kuis Asesmen Las SMAW`,icon:``}],measuring:[{id:`all`,label:`Semua Alat Ukur`,icon:``},{id:`diagnostic`,label:`Tes Diagnostik Alat Ukur (10 Soal)`,icon:``},{id:`caliper_micrometer`,label:`Uji Pembacaan Kaliper & Mikrometer`,icon:``}],design:[{id:`all`,label:`Semua Design Lab`,icon:``},{id:`diagnostic`,label:`Tes Diagnostik Design Lab (10 Soal)`,icon:``},{id:`cad_drawing`,label:`Kuis Gambar Teknik & CAD`,icon:``}],"virtual-bengkel":[{id:`all`,label:`Semua Bengkel 3D`,icon:``},{id:`diagnostic`,label:`Tes Diagnostik Bengkel 3D (10 Soal)`,icon:``}],evaluasi:[{id:`all`,label:`Semua Evaluasi`,icon:``},{id:`evaluasi_c1`,label:`Evaluasi C1 (Mengingat)`,icon:``},{id:`evaluasi_c2`,label:`Evaluasi C2 (Memahami)`,icon:``},{id:`evaluasi_c3`,label:`Evaluasi C3 (Menerapkan)`,icon:``},{id:`evaluasi_c4`,label:`Evaluasi C4 (Menganalisis)`,icon:``},{id:`evaluasi_c5`,label:`Evaluasi C5 (Mengevaluasi)`,icon:``}]},Me=({initialSearch:e=``,initialTab:t=`safety`})=>{let{student:n}=fe(),r=n&&n.name&&Te(n)?n.name:`Bimoro Kusumo, S.Pd. / Sri Widada, S.Pd.`,[i,o]=(0,D.useState)([]),[s,u]=(0,D.useState)(``),[f,p]=(0,D.useState)(e||``),[h,_]=(0,D.useState)(`all`),[y,b]=(0,D.useState)(`all`),[x,S]=(0,D.useState)(e?`flat`:`grouped`),C=x===`grouped`,[w,Me]=(0,D.useState)(`quiz_name`),[k,Ne]=(0,D.useState)(e?`all`:t),[A,j]=(0,D.useState)(`all`),[Pe,Fe]=(0,D.useState)(``),[Ie,Le]=(0,D.useState)(`I2`),[Re,M]=(0,D.useState)(!1),[ze,N]=(0,D.useState)(!1),[Be,P]=(0,D.useState)(!1),[Ve,F]=(0,D.useState)(!1),[I,He]=(0,D.useState)(!1),[L,R]=(0,D.useState)(null),[Ue,z]=(0,D.useState)(``),[We,Ge]=(0,D.useState)(!1),[B,Ke]=(0,D.useState)(()=>ge()),[V,H]=(0,D.useState)(``),qe=e=>{_e(e),Ke(ge())},U=e=>{Fe(e),setTimeout(()=>Fe(``),3500)},Je=async()=>{T.playClick(),(await Ce(K)).success?(T.playSuccess(),window.open(`https://sheets.new`,`_blank`),P(!0)):U(`Gagal menyalin tabel. Silakan gunakan tombol Unduh Excel.`)},[Ye,Xe]=(0,D.useState)(()=>new Date().toLocaleTimeString(`id-ID`)),W=()=>{let e=he();o(e),u(Se()),Xe(new Date().toLocaleTimeString(`id-ID`))};(0,D.useEffect)(()=>{W();let e=()=>W();window.addEventListener(`bimo:quiz_submitted`,e);let t=e=>{e.key===`bimo_quiz_scores`&&W()};window.addEventListener(`storage`,t);let n=setInterval(()=>{W()},3e3);return()=>{window.removeEventListener(`bimo:quiz_submitted`,e),window.removeEventListener(`storage`,t),clearInterval(n)}},[]);let G=(0,D.useMemo)(()=>{let e={};return[...i].sort((e,t)=>new Date(e.timestamp||e.waktu||0).getTime()-new Date(t.timestamp||t.waktu||0).getTime()).map(t=>{let n=me(t),r=t.judulKuis||``,i=t.subModul||t.jenisKuis||n.subLabel,a=n.subId;if(n.labId===`evaluasi`){let n=((t.modul||``)+` `+(t.subModul||``)+` `+(t.judulKuis||``)).toLowerCase();if(!(n.includes(`c1`)||n.includes(`c2`)||n.includes(`c3`)||n.includes(`c4`)||n.includes(`c5`)||n.includes(`mengingat`)||n.includes(`memahami`))){let n=(t.namaSiswa||`unknown`).toLowerCase(),o=(e[n]||0)+1;e[n]=o;let s=[`evaluasi_c1`,`evaluasi_c2`,`evaluasi_c3`,`evaluasi_c4`,`evaluasi_c5`],c=[`Evaluasi C1 (Mengingat)`,`Evaluasi C2 (Memahami)`,`Evaluasi C3 (Menerapkan)`,`Evaluasi C4 (Menganalisis)`,`Evaluasi C5 (Mengevaluasi)`],l=Math.min(o-1,4);a=s[l],i=c[l],r=c[l]}}return{...t,judulKuis:r,labId:n.labId,labLabel:n.labLabel,labIcon:n.labIcon,subId:a,subLabel:i}})},[i]),Ze=e=>{T.playClick(),Ne(e),j(`all`),b(`all`)},Qe=e=>{T.playClick(),j(e),b(`all`)},$e=(0,D.useMemo)(()=>{let e=k===`all`?G:G.filter(e=>e.labId===k),t=new Set;return e.forEach(e=>{let n=(e.judulKuis||``).trim();n&&t.add(n)}),Array.from(t).sort()},[G,k]),K=(0,D.useMemo)(()=>G.filter(e=>{let t=k===`all`||e.labId===k,n=A===`all`||e.subId===A,r=y===`all`||e.judulKuis&&e.judulKuis.trim()===y,i=f.toLowerCase(),a=!f.trim()||(e.namaSiswa||``).toLowerCase().includes(i)||String(e.nomorAbsen||``).includes(i)||(e.kelas||``).toLowerCase().includes(i)||(e.sekolah||``).toLowerCase().includes(i)||(e.judulKuis||``).toLowerCase().includes(i)||(e.subLabel||``).toLowerCase().includes(i),o=h===`all`||e.status===h;return t&&n&&r&&a&&o}),[G,k,A,y,f,h]),et=(0,D.useMemo)(()=>{let e={};return K.forEach(t=>{let n=(t.judulKuis||`Kuis Asesmen Terintegrasi`).trim();e[n]||(e[n]=[]),e[n].push(t)}),Object.keys(e).forEach(t=>{e[t].sort((e,t)=>w===`student_name`?(e.namaSiswa||``).localeCompare(t.namaSiswa||``):w===`highest_score`?(Number(t.skor)||0)-(Number(e.skor)||0):w===`newest_time`?new Date(t.timestamp||0)-new Date(e.timestamp||0):(e.namaSiswa||``).localeCompare(t.namaSiswa||``))}),Object.keys(e).sort((e,t)=>e.localeCompare(t)).map(t=>{let n=e[t],r=n.length>0?Math.round(n.reduce((e,t)=>e+(Number(t.skor)||0),0)/n.length):0,i=n.length>0?Math.max(...n.map(e=>Number(e.skor)||0)):0,a=n.filter(e=>e.status===`LULUS`||Number(e.skor)>=75).length;return{quizName:t,items:n,avgScore:r,maxScore:i,passedCount:a,passPct:n.length>0?Math.round(a/n.length*100):0,totalCount:n.length}})},[K,w]),q=(0,D.useMemo)(()=>{let e={},t=De.find(e=>e.id===k);(ye||[]).forEach(t=>{let n=t.name.toLowerCase();e[n]={nama:t.name,nomorAbsen:String(t.absen),kelas:t.className||`X-TP.A`,sekolah:t.school||`SMKN 2 DEPOK`,submissions:{},isMaster:!0}});let n=[];t&&t.tasks&&(n=t.tasks.map(e=>e.name));let r=new Set(n);(k===`all`?G:G.filter(e=>e.labId===k)).forEach(n=>{let i=(n.namaSiswa||``).trim(),a=(n.judulKuis||``).trim();if(!i||!a)return;let o=i.toLowerCase();if(!e[o]&&!Te({name:i,studentNumber:n.nomorAbsen})){let t=parseInt(n.nomorAbsen,10);if(!isNaN(t)){let n=Object.keys(e).find(n=>e[n].nomorAbsen===String(t));n&&(o=n)}}e[o]||(e[o]={nama:i,nomorAbsen:n.nomorAbsen||`-`,kelas:n.kelas||`-`,sekolah:n.sekolah||`SMKN 2 DEPOK`,submissions:{},isMaster:!1});let s=a;if(t&&t.tasks){let e=((n.modul||``)+` `+(n.subLabel||``)+` `+(n.judulKuis||``)).toLowerCase();for(let r of t.tasks){if(r.key===n.subId||r.name===a){s=r.name;break}if(r.keywords&&r.keywords.some(t=>e.includes(t))){s=r.name;break}}}r.add(s);let c=e[o].submissions[s];(!c||Number(n.skor)>Number(c.skor))&&(e[o].submissions[s]={skor:Number(n.skor)||0,status:n.status||(Number(n.skor)>=75?`LULUS`:`REMEDIAL`),waktu:n.waktu||n.timestamp?.slice(0,10),jawabanBenar:n.jawabanBenar,totalSoal:n.totalSoal,record:n})});let i=[];t&&t.tasks?(t.tasks.forEach(e=>{r.has(e.name)&&(i.push(e.name),r.delete(e.name))}),Array.from(r).sort().forEach(e=>i.push(e))):i=Array.from(r).sort();let a=Object.values(e).sort((e,t)=>{let n=+!!e.isMaster,r=+!!t.isMaster;if(n!==r)return r-n;let i=parseInt(e.nomorAbsen,10),a=parseInt(t.nomorAbsen,10);return!isNaN(i)&&!isNaN(a)?i-a:e.nama.localeCompare(t.nama)});return{quizList:i,studentList:a}},[G,k]),tt=(0,D.useMemo)(()=>{let e=[...K];return w===`quiz_name`?e.sort((e,t)=>{let n=(e.judulKuis||``).localeCompare(t.judulKuis||``);return n===0?(e.namaSiswa||``).localeCompare(t.namaSiswa||``):n}):w===`student_name`?e.sort((e,t)=>(e.namaSiswa||``).localeCompare(t.namaSiswa||``)):w===`highest_score`?e.sort((e,t)=>(Number(t.skor)||0)-(Number(e.skor)||0)):w===`newest_time`&&e.sort((e,t)=>new Date(t.timestamp||0)-new Date(e.timestamp||0)),e},[K,w]),J=K.length,nt=new Set(K.map(e=>`${e.namaSiswa}_${e.nomorAbsen}`)).size,Y=J>0?Math.round(K.reduce((e,t)=>e+(Number(t.skor)||0),0)/J):0,X=K.filter(e=>e.status===`LULUS`).length,Z=J>0?Math.round(X/J*100):0,rt=K.reduce((e,t)=>e+(Number(t.jawabanBenar)||0),0),it=K.reduce((e,t)=>e+(Number(t.totalSoal)||0),0),at=i.filter(e=>!e.synced).length,Q=(0,D.useMemo)(()=>k===`all`?[]:je[k]||[],[k]),$=(0,D.useMemo)(()=>{let e=Ae.find(e=>e.id===k),t=e?e.label:`Semua Modul`;if(A!==`all`){let e=Q.find(e=>e.id===A);return`${t} > ${e?e.label:``}`}return t},[k,A,Q]);return(0,O.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`18px`,maxWidth:`1440px`,margin:`0 auto`,paddingBottom:`50px`},children:[Pe&&(0,O.jsxs)(`div`,{style:{position:`fixed`,top:`20px`,right:`20px`,zIndex:999999,background:`#064e3b`,color:`#ecfdf5`,border:`1.5px solid #10b981`,padding:`12px 20px`,borderRadius:`10px`,boxShadow:`0 8px 24px rgba(0,0,0,0.25)`,fontWeight:700,fontSize:`0.88rem`,display:`flex`,alignItems:`center`,gap:`10px`,animation:`fadeIn 0.2s ease-out`},children:[(0,O.jsx)(d,{size:16}),(0,O.jsx)(`span`,{children:Pe})]}),(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{background:`linear-gradient(135deg, #064e3b 0%, #0f172a 100%)`,borderRadius:`16px`,padding:`24px 28px`,color:`#ffffff`,position:`relative`,overflow:`hidden`,boxShadow:`0 8px 32px rgba(6, 78, 59, 0.25)`,border:`1px solid rgba(16, 185, 129, 0.3)`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`flex-start`,flexWrap:`wrap`,gap:`16px`},children:[(0,O.jsxs)(`div`,{children:[(0,O.jsxs)(`div`,{style:{display:`inline-flex`,alignItems:`center`,gap:`8px`,background:`rgba(16, 185, 129, 0.25)`,border:`1.5px solid #10b981`,padding:`5px 14px`,borderRadius:`20px`,color:`#6ee7b7`,fontSize:`0.8rem`,fontWeight:800,marginBottom:`10px`},children:[(0,O.jsx)(`span`,{style:{display:`inline-block`,width:`9px`,height:`9px`,borderRadius:`50%`,background:`#10b981`,boxShadow:`0 0 10px #10b981`}}),(0,O.jsx)(`span`,{children:`LIVE SPREADSHEET MONITORING - REAL TIME`}),(0,O.jsx)(`span`,{style:{background:`#10b981`,color:`#064e3b`,padding:`1px 8px`,borderRadius:`10px`,fontSize:`0.7rem`,fontWeight:900},children:`TERHUBUNG`})]}),(0,O.jsx)(`h1`,{style:{fontSize:`1.75rem`,fontWeight:900,color:`#ffffff`,margin:0,fontFamily:`'Chakra Petch', sans-serif`,letterSpacing:`0.5px`},children:`REKAP NILAI SISWA (SMKN 2 DEPOK)`}),(0,O.jsxs)(`p`,{style:{color:`#cbd5e1`,fontSize:`0.88rem`,marginTop:`6px`,maxWidth:`800px`,lineHeight:1.5,margin:0},children:[`Pantau langsung hasil kuis seluruh siswa secara real-time di spreadsheet ini. Nilai otomatis masuk dan terkelompok rapi per modul lab & sub-kuis (seperti `,(0,O.jsx)(`strong`,{children:`Kuis Inspeksi APD`}),`) tanpa perlu rumus manual.`]})]}),(0,O.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`,alignItems:`center`},children:[(0,O.jsxs)(`button`,{onClick:()=>{T.playClick(),W(),U(`[OK] Data nilai siswa berhasil diperbarui!`)},style:{background:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`,border:`none`,color:`#ffffff`,padding:`9px 15px`,borderRadius:`8px`,fontWeight:800,fontSize:`0.82rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`,boxShadow:`0 4px 12px rgba(2, 132, 199, 0.35)`},title:`Segarkan data nilai terbaru sekarang`,children:[(0,O.jsx)(te,{size:14}),(0,O.jsx)(`span`,{children:`Segarkan Data`})]}),(0,O.jsxs)(`div`,{style:{display:`inline-flex`,borderRadius:`8px`,overflow:`hidden`,boxShadow:`0 4px 14px rgba(16, 185, 129, 0.45)`},children:[(0,O.jsxs)(`a`,{href:B||`https://docs.google.com/spreadsheets/d/1-YH8PCzHIUv1B8I1dCj_XmcQ2c-jyAavPQfWGHYCUT4/edit?hl=id&gid=1804603706#gid=1804603706`,target:`_blank`,rel:`noopener noreferrer`,onClick:()=>{T.playClick(),U(`Membuka Google Spreadsheet Nilai Siswa (SMKN 2 Depok) di tab baru...`)},style:{background:`linear-gradient(135deg, #10b981 0%, #059669 100%)`,color:`#ffffff`,textDecoration:`none`,padding:`9px 16px`,fontWeight:800,fontSize:`0.82rem`,display:`flex`,alignItems:`center`,gap:`6px`},title:`Buka langsung Google Spreadsheet: ${B||`https://docs.google.com/spreadsheets/d/1-YH8PCzHIUv1B8I1dCj_XmcQ2c-jyAavPQfWGHYCUT4/edit?hl=id&gid=1804603706#gid=1804603706`}`,children:[(0,O.jsx)(c,{size:15}),(0,O.jsx)(`span`,{children:`Buka Google Sheets`})]}),(0,O.jsx)(`button`,{onClick:()=>{T.playClick(),H(B||`https://docs.google.com/spreadsheets/d/1-YH8PCzHIUv1B8I1dCj_XmcQ2c-jyAavPQfWGHYCUT4/edit?hl=id&gid=1804603706#gid=1804603706`),F(!0)},style:{background:`#047857`,border:`none`,borderLeft:`1px solid rgba(255, 255, 255, 0.25)`,color:`#ffffff`,padding:`9px 10px`,fontSize:`0.78rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`center`},title:`Pilihan & Pengaturan Tautan Google Spreadsheet`,children:(0,O.jsx)(a,{size:15})})]}),(0,O.jsxs)(`button`,{onClick:()=>{T.playClick(),E(K)},style:{background:`rgba(255, 255, 255, 0.12)`,border:`1px solid rgba(255, 255, 255, 0.25)`,color:`#ffffff`,padding:`9px 14px`,borderRadius:`8px`,fontWeight:700,fontSize:`0.82rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},title:`Unduh tabel yang sedang aktif ke format Excel (.xls)`,children:[(0,O.jsx)(de,{size:15}),(0,O.jsx)(`span`,{children:`Unduh Excel (.xls)`})]}),(0,O.jsxs)(`button`,{onClick:()=>{T.playClick(),be(K)},style:{background:`rgba(255, 255, 255, 0.12)`,border:`1px solid rgba(255, 255, 255, 0.25)`,color:`#ffffff`,padding:`9px 14px`,borderRadius:`8px`,fontWeight:700,fontSize:`0.82rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},title:`Unduh format standar CSV`,children:[(0,O.jsx)(oe,{size:15}),(0,O.jsx)(`span`,{children:`Unduh CSV`})]}),(0,O.jsxs)(`button`,{onClick:async()=>{T.playClick();let e=await Ce(K);e.success&&T.playSuccess(),U(e.message)},style:{background:`rgba(245, 158, 11, 0.18)`,border:`1px solid #f59e0b`,color:`#fef3c7`,padding:`9px 14px`,borderRadius:`8px`,fontWeight:700,fontSize:`0.82rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},title:`Salin data lembar ini ke clipboard`,children:[(0,O.jsx)(v,{size:15}),(0,O.jsx)(`span`,{children:`Salin Lembar Ini`})]}),(0,O.jsxs)(`button`,{onClick:()=>{T.playClick(),window.print()},style:{background:`rgba(255, 255, 255, 0.1)`,border:`1px solid rgba(255, 255, 255, 0.2)`,color:`#ffffff`,padding:`9px 14px`,borderRadius:`8px`,fontWeight:700,fontSize:`0.82rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},title:`Cetak atau simpan sebagai dokumen PDF resmi`,children:[(0,O.jsx)(l,{size:15}),(0,O.jsx)(`span`,{children:`Cetak / PDF`})]})]})]}),(0,O.jsxs)(`div`,{style:{marginTop:`18px`,paddingTop:`14px`,borderTop:`1px solid rgba(255,255,255,0.12)`,display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`10px`,fontSize:`0.82rem`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`12px`,flexWrap:`wrap`},children:[(0,O.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:`6px`,color:`#6ee7b7`,fontWeight:800},children:[(0,O.jsx)(g,{size:14}),(0,O.jsxs)(`span`,{children:[`Lembar Aktif: `,(0,O.jsx)(`strong`,{children:$})]})]}),(0,O.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,O.jsxs)(`span`,{style:{color:`#cbd5e1`},children:[`Guru Pengampu: `,(0,O.jsx)(`strong`,{children:r})]}),(0,O.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,O.jsxs)(`span`,{style:{color:`#cbd5e1`},children:[`Kelas: `,(0,O.jsx)(`strong`,{children:`X TPM 1 (Teknik Permesinan)`})]}),(0,O.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,O.jsxs)(`span`,{style:{color:`#6ee7b7`,fontSize:`0.78rem`},children:[(0,O.jsx)(ne,{size:13,style:{display:`inline`,marginRight:`4px`,verticalAlign:`-2px`}}),` Pembaruan Terakhir: `,(0,O.jsxs)(`strong`,{children:[Ye,` WIB`]})]})]}),(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,O.jsxs)(`button`,{onClick:()=>{T.playClick(),E(G)},style:{background:`rgba(16, 185, 129, 0.2)`,border:`1px solid #10b981`,color:`#ecfdf5`,padding:`4px 10px`,borderRadius:`6px`,fontSize:`0.75rem`,fontWeight:700,cursor:`pointer`},title:`Unduh seluruh rekap semua modul lab sekaligus`,children:[(0,O.jsx)(de,{size:14,style:{display:`inline`,marginRight:`4px`,verticalAlign:`-2px`}}),` Unduh Seluruh Lab (.xls)`]}),(0,O.jsxs)(`button`,{onClick:()=>{T.playClick(),window.confirm(`PERINGATAN GURU:
Apakah Anda yakin ingin menghapus seluruh data nilai di perangkat ini?`)&&(xe(),o([]),T.playSuccess(),U(`[OK] Data lokal berhasil dibersihkan.`))},style:{background:`transparent`,border:`1px solid rgba(239, 68, 68, 0.4)`,color:`#fca5a5`,padding:`4px 10px`,borderRadius:`6px`,fontSize:`0.75rem`,fontWeight:700,cursor:`pointer`},title:`Bersihkan riwayat data nilai lokal di perangkat ini`,children:[(0,O.jsx)(ie,{size:14,style:{display:`inline`,marginRight:`4px`,verticalAlign:`-2px`}}),` Reset Data`]})]})]})]}),(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`div`,{style:{fontSize:`0.75rem`,fontWeight:800,color:`var(--text-muted, #64748b)`,marginBottom:`6px`,textTransform:`uppercase`,letterSpacing:`0.5px`},children:`1. Pilih Modul Laboratorium (Sesuai Sidebar):`}),(0,O.jsx)(`div`,{style:{display:`flex`,gap:`6px`,overflowX:`auto`,paddingBottom:`4px`,borderBottom:`2px solid var(--border-light, #e2e8f0)`},children:Ae.map(e=>{let t=k===e.id,n=e.id===`all`?G.length:G.filter(t=>t.labId===e.id).length;return(0,O.jsxs)(`button`,{onClick:()=>Ze(e.id),style:{display:`flex`,alignItems:`center`,gap:`6px`,padding:`9px 15px`,borderRadius:`8px 8px 0 0`,border:t?`1.5px solid #10b981`:`1px solid #cbd5e1`,borderBottom:t?`3px solid #10b981`:`1px solid #cbd5e1`,background:t?`#064e3b`:`var(--bg-card, #ffffff)`,color:t?`#ffffff`:`var(--text-main, #0f172a)`,fontWeight:t?800:600,fontSize:`0.82rem`,cursor:`pointer`,whiteSpace:`nowrap`,transition:`all 0.15s`},children:[Oe(e.id),(0,O.jsx)(`span`,{children:e.label}),(0,O.jsx)(`span`,{style:{background:t?`#10b981`:`#e2e8f0`,color:t?`#064e3b`:`#475569`,padding:`2px 7px`,borderRadius:`10px`,fontSize:`0.72rem`,fontWeight:800},children:n})]},e.id)})})]}),Q.length>0&&(0,O.jsxs)(`div`,{style:{background:`#f8fafc`,padding:`12px 16px`,borderRadius:`10px`,border:`1.5px solid #cbd5e1`,display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`8px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`,fontSize:`0.8rem`,fontWeight:800,color:`#0f172a`},children:[(0,O.jsx)(d,{size:15}),(0,O.jsxs)(`span`,{children:[`2. Pilih Lembar Sub-Kuis Spesifik di `,(0,O.jsx)(`strong`,{children:$.split(` > `)[0]}),`:`]})]}),(0,O.jsx)(`span`,{style:{fontSize:`0.74rem`,color:`#64748b`},children:(0,O.jsx)(`em`,{children:`Klik sub-kuis untuk mengisolasi nilainya tanpa tercampur dengan kuis lain`})})]}),(0,O.jsx)(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`},children:Q.map(e=>{let t=A===e.id,n=e.id===`all`?G.filter(e=>e.labId===k).length:G.filter(t=>t.labId===k&&t.subId===e.id).length;return(0,O.jsxs)(`button`,{onClick:()=>Qe(e.id),style:{display:`flex`,alignItems:`center`,gap:`6px`,padding:`6px 12px`,borderRadius:`8px`,border:t?`1.5px solid #059669`:`1px solid #cbd5e1`,background:t?`#059669`:`#ffffff`,color:t?`#ffffff`:`#1e293b`,fontSize:`0.78rem`,fontWeight:t?800:600,cursor:`pointer`,transition:`all 0.15s`,boxShadow:t?`0 2px 6px rgba(5, 150, 105, 0.3)`:`none`},children:[ke(e.id),(0,O.jsx)(`span`,{children:e.label}),(0,O.jsx)(`span`,{style:{background:t?`#ffffff`:`#f1f5f9`,color:t?`#059669`:`#475569`,padding:`1px 6px`,borderRadius:`8px`,fontSize:`0.7rem`,fontWeight:800},children:n})]},e.id)})})]}),(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`10px 16px`,display:`flex`,alignItems:`center`,gap:`12px`,background:`var(--bg-card, #ffffff)`,borderRadius:`10px`,border:`1px solid var(--border-light, #e2e8f0)`,boxShadow:`0 2px 6px rgba(0,0,0,0.04)`},children:[(0,O.jsx)(`div`,{style:{padding:`4px 10px`,borderRadius:`6px`,background:`#f1f5f9`,border:`1px solid #cbd5e1`,fontFamily:`monospace`,fontSize:`0.82rem`,fontWeight:800,color:`#0f172a`},children:Ie}),(0,O.jsx)(`div`,{style:{fontFamily:`serif`,fontStyle:`italic`,fontWeight:900,fontSize:`1.05rem`,color:`#64748b`},children:`fx`}),(0,O.jsxs)(`div`,{style:{flex:1,fontFamily:`monospace`,fontSize:`0.84rem`,color:`#0f172a`,background:`#f8fafc`,border:`1px solid #e2e8f0`,padding:`6px 12px`,borderRadius:`6px`,display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`6px`},children:[(0,O.jsxs)(`span`,{children:[(0,O.jsxs)(`strong`,{style:{color:`#059669`},children:[`=AVERAGE(I2:I`,K.length+1,`)`]}),(0,O.jsxs)(`span`,{style:{color:`#64748b`,marginLeft:`10px`},children:[`Lembar: `,(0,O.jsx)(`strong`,{children:$}),` | Rata-rata Skor: `,(0,O.jsxs)(`strong`,{children:[Y,` / 100`]})]})]}),(0,O.jsx)(`span`,{style:{fontSize:`0.76rem`,color:`#64748b`},children:`KKM Standar: 75`})]})]}),(0,O.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(220px, 1fr))`,gap:`14px`},children:[(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`16px 20px`,borderLeft:`4px solid #2563eb`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,O.jsx)(`span`,{style:{fontSize:`0.72rem`,fontWeight:800,color:`var(--text-muted)`,textTransform:`uppercase`},children:`Formula: =COUNTA(B2:B)`}),(0,O.jsx)(d,{size:20,color:`#0284c7`})]}),(0,O.jsxs)(`div`,{style:{fontSize:`1.5rem`,fontWeight:900,color:`var(--text-main)`,marginTop:`4px`},children:[J,` `,(0,O.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:600,color:`#64748b`},children:`Siswa Mengerjakan`})]}),(0,O.jsxs)(`div`,{style:{fontSize:`0.75rem`,color:`#64748b`,marginTop:`2px`},children:[`Pada lembar: `,$]})]}),(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`16px 20px`,borderLeft:`4px solid #10b981`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,O.jsx)(`span`,{style:{fontSize:`0.72rem`,fontWeight:800,color:`var(--text-muted)`,textTransform:`uppercase`},children:`Formula: =COUNTUNIQUE(B2:B)`}),(0,O.jsx)(ae,{size:20,color:`#10b981`})]}),(0,O.jsxs)(`div`,{style:{fontSize:`1.5rem`,fontWeight:900,color:`#10b981`,marginTop:`4px`},children:[nt,` `,(0,O.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:600,color:`#64748b`},children:`Siswa Unik`})]}),(0,O.jsx)(`div`,{style:{fontSize:`0.75rem`,color:`#64748b`,marginTop:`2px`},children:`SMKN 2 Depok Jurusan TPM`})]}),(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`16px 20px`,borderLeft:`4px solid #f59e0b`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,O.jsx)(`span`,{style:{fontSize:`0.72rem`,fontWeight:800,color:`var(--text-muted)`,textTransform:`uppercase`},children:`Formula: =AVERAGE(I2:I)`}),(0,O.jsx)(ue,{size:20,color:`#f59e0b`})]}),(0,O.jsxs)(`div`,{style:{fontSize:`1.5rem`,fontWeight:900,color:Y>=75?`#10b981`:`#f59e0b`,marginTop:`4px`},children:[Y,` `,(0,O.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:600,color:`#64748b`},children:`/ 100`})]}),(0,O.jsx)(`div`,{style:{fontSize:`0.75rem`,color:`#64748b`,marginTop:`2px`},children:`Batas KKM Kelulusan: 75`})]}),(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`16px 20px`,borderLeft:`4px solid #8b5cf6`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`},children:[(0,O.jsx)(`span`,{style:{fontSize:`0.72rem`,fontWeight:800,color:`var(--text-muted)`,textTransform:`uppercase`},children:`Formula: =COUNTIF(K:K, "LULUS")`}),(0,O.jsx)(g,{size:20,color:`#8b5cf6`})]}),(0,O.jsxs)(`div`,{style:{fontSize:`1.5rem`,fontWeight:900,color:Z>=75?`#10b981`:`#ef4444`,marginTop:`4px`},children:[Z,`% `,(0,O.jsxs)(`span`,{style:{fontSize:`0.8rem`,fontWeight:600,color:`#64748b`},children:[`(`,X,`/`,J,`)`]})]}),(0,O.jsx)(`div`,{style:{fontSize:`0.75rem`,color:`#64748b`,marginTop:`2px`},children:`Siswa mencapai KKM kompetensi`})]})]}),(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`14px 18px`,display:`flex`,flexDirection:`column`,gap:`12px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`12px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`,flexWrap:`wrap`,flex:1,minWidth:`280px`},children:[(0,O.jsxs)(`div`,{style:{position:`relative`,flex:1,minWidth:`200px`},children:[(0,O.jsx)(`span`,{style:{position:`absolute`,left:`12px`,top:`50%`,transform:`translateY(-50%)`,color:`#94a3b8`}}),(0,O.jsx)(`input`,{type:`text`,placeholder:`Cari nama siswa, nomor absen, kuis...`,value:f,onChange:e=>p(e.target.value),style:{width:`100%`,padding:`8px 12px 8px 36px`,borderRadius:`8px`,border:`1px solid var(--border-light, #cbd5e1)`,fontSize:`0.84rem`,outline:`none`,background:`var(--bg-game, #f8fafc)`,color:`var(--text-main, #0f172a)`}})]}),(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,O.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:800,color:`#065f46`,whiteSpace:`nowrap`},children:`Nama Kuis:`}),(0,O.jsxs)(`select`,{value:y,onChange:e=>{T.playClick(),b(e.target.value)},style:{padding:`8px 12px`,borderRadius:`8px`,border:`1.5px solid #10b981`,fontSize:`0.82rem`,background:`#ecfdf5`,color:`#065f46`,fontWeight:800,cursor:`pointer`,maxWidth:`300px`},title:`Saring tabel langsung berdasarkan satu Nama Kuis / Asesmen tertentu`,children:[(0,O.jsxs)(`option`,{value:`all`,children:[`Semua Nama Kuis (`,$e.length,` Kuis)`]}),$e.map(e=>{let t=G.filter(t=>(t.judulKuis||``).trim()===e&&(k===`all`||t.labId===k)).length;return(0,O.jsxs)(`option`,{value:e,children:[e,` (`,t,` Siswa)`]},e)})]})]}),(0,O.jsxs)(`select`,{value:h,onChange:e=>_(e.target.value),style:{padding:`8px 12px`,borderRadius:`8px`,border:`1px solid var(--border-light, #cbd5e1)`,fontSize:`0.82rem`,background:`var(--bg-game, #f8fafc)`,color:`var(--text-main, #0f172a)`,cursor:`pointer`},children:[(0,O.jsx)(`option`,{value:`all`,children:`Semua Status`}),(0,O.jsx)(`option`,{value:`LULUS`,children:`[OK] LULUS (≥ 75)`}),(0,O.jsx)(`option`,{value:`REMEDIAL`,children:`[REM] REMEDIAL (< 75)`})]}),(0,O.jsxs)(`select`,{value:w,onChange:e=>{T.playClick(),Me(e.target.value)},style:{padding:`8px 12px`,borderRadius:`8px`,border:`1px solid var(--border-light, #cbd5e1)`,fontSize:`0.82rem`,background:`var(--bg-game, #f8fafc)`,color:`var(--text-main, #0f172a)`,cursor:`pointer`},children:[(0,O.jsx)(`option`,{value:`quiz_name`,children:`Urutkan: Nama Kuis (A-Z)`}),(0,O.jsx)(`option`,{value:`student_name`,children:`Urutkan: Nama Siswa (A-Z)`}),(0,O.jsx)(`option`,{value:`highest_score`,children:`Urutkan: Skor Tertinggi (100 ke 0)`}),(0,O.jsx)(`option`,{value:`newest_time`,children:`Urutkan: Waktu Terbaru`})]})]}),(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`4px`,background:`#f1f5f9`,padding:`3px`,borderRadius:`8px`,border:`1px solid #cbd5e1`},children:[(0,O.jsxs)(`button`,{onClick:()=>{T.playClick(),S(`grouped`)},style:{padding:`6px 12px`,borderRadius:`6px`,border:`none`,background:x===`grouped`?`#064e3b`:`transparent`,color:x===`grouped`?`#ffffff`:`#475569`,fontWeight:800,fontSize:`0.78rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`5px`},title:`Kelompokkan tabel rapi per Nama Kuis / Asesmen`,children:[(0,O.jsx)(d,{size:15}),(0,O.jsx)(`span`,{children:`Dikelompokkan per Kuis`})]}),(0,O.jsxs)(`button`,{onClick:()=>{T.playClick(),S(`matrix`)},style:{padding:`6px 12px`,borderRadius:`6px`,border:`none`,background:x===`matrix`?`#064e3b`:`transparent`,color:x===`matrix`?`#ffffff`:`#475569`,fontWeight:800,fontSize:`0.78rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`5px`},title:`Tampilkan matriks ceklis pengumpulan siswa per kuis`,children:[(0,O.jsx)(le,{size:15}),(0,O.jsx)(`span`,{children:`Matriks Pengumpulan Siswa`})]}),(0,O.jsxs)(`button`,{onClick:()=>{T.playClick(),S(`flat`)},style:{padding:`6px 12px`,borderRadius:`6px`,border:`none`,background:x===`flat`?`#064e3b`:`transparent`,color:x===`flat`?`#ffffff`:`#475569`,fontWeight:800,fontSize:`0.78rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`5px`},title:`Tampilkan tabel baris datar`,children:[(0,O.jsx)(v,{size:15}),(0,O.jsx)(`span`,{children:`Tabel Datar`})]})]})]}),(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`8px`,fontSize:`0.78rem`,color:`#64748b`,borderTop:`1px solid #f1f5f9`,paddingTop:`8px`},children:[(0,O.jsx)(`div`,{children:x===`matrix`?(0,O.jsxs)(O.Fragment,{children:[`Menampilkan Matriks Rekap Pengumpulan: `,(0,O.jsx)(`strong`,{children:q.studentList.length}),` Siswa terdaftar pada `,(0,O.jsx)(`strong`,{children:q.quizList.length}),` Kuis di lembar `,(0,O.jsx)(`strong`,{children:$}),`.`]}):(0,O.jsxs)(O.Fragment,{children:[`Menampilkan `,(0,O.jsx)(`strong`,{children:K.length}),` data nilai siswa pada `,(0,O.jsx)(`strong`,{children:et.length}),` kelompok kuis di lembar `,(0,O.jsx)(`strong`,{children:$}),`.`]})}),y!==`all`&&(0,O.jsx)(`button`,{onClick:()=>b(`all`),style:{background:`transparent`,border:`none`,color:`#dc2626`,fontWeight:800,cursor:`pointer`,fontSize:`0.78rem`},children:`Hapus Filter Kuis (Tampilkan Semua)`})]})]}),(0,O.jsx)(`div`,{className:`dashboard-card`,style:{overflow:`hidden`,padding:0,border:`1.5px solid #cbd5e1`,borderRadius:`12px`,boxShadow:`0 4px 16px rgba(0,0,0,0.06)`},children:(0,O.jsx)(`div`,{style:{overflowX:`auto`,maxHeight:`650px`},children:x===`matrix`?(0,O.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,textAlign:`left`,fontSize:`0.83rem`,fontFamily:`system-ui, -apple-system, sans-serif`},children:[(0,O.jsxs)(`thead`,{style:{position:`sticky`,top:0,zIndex:10},children:[(0,O.jsxs)(`tr`,{style:{background:`#f1f5f9`,color:`#64748b`,fontSize:`0.72rem`,borderBottom:`1px solid #cbd5e1`},children:[(0,O.jsx)(`th`,{style:{width:`45px`,padding:`6px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`#`}),(0,O.jsx)(`th`,{style:{padding:`6px 14px`,borderRight:`1px solid #cbd5e1`},children:`A`}),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`B`}),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`C`}),q.quizList.map((e,t)=>(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:String.fromCharCode(68+t)},t)),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`Σ Selesai`}),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`Rata-rata`}),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`},children:`Status`})]}),(0,O.jsxs)(`tr`,{style:{background:`#064e3b`,color:`#f0fdf4`,borderBottom:`2px solid #047857`},children:[(0,O.jsx)(`th`,{style:{padding:`12px 6px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,width:`45px`},children:`No`}),(0,O.jsx)(`th`,{style:{padding:`12px 16px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`,minWidth:`190px`},children:`Nama Lengkap Siswa`}),(0,O.jsx)(`th`,{style:{padding:`12px 10px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Absen`}),(0,O.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Kelas`}),q.quizList.map((e,t)=>(0,O.jsxs)(`th`,{style:{padding:`10px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,minWidth:`170px`,maxWidth:`220px`,fontSize:`0.78rem`},title:e,children:[(0,O.jsxs)(`div`,{style:{background:`rgba(255,255,255,0.18)`,padding:`2px 6px`,borderRadius:`4px`,marginBottom:`3px`,fontSize:`0.68rem`,display:`inline-block`},children:[`KUIS `,t+1]}),(0,O.jsx)(`div`,{style:{lineHeight:`1.25`},children:e})]},e)),(0,O.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Total Selesai`}),(0,O.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Rata-rata Skor`}),(0,O.jsx)(`th`,{style:{padding:`12px 14px`,textAlign:`center`,fontWeight:800,whiteSpace:`nowrap`},children:`Status`})]})]}),(0,O.jsx)(`tbody`,{children:q.studentList.length===0?(0,O.jsx)(`tr`,{children:(0,O.jsxs)(`td`,{colSpan:7+q.quizList.length,style:{padding:`50px 20px`,textAlign:`center`,color:`#64748b`,background:`#ffffff`},children:[(0,O.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`,marginBottom:`8px`},children:(0,O.jsx)(m,{size:40,color:`#94a3b8`})}),(0,O.jsx)(`div`,{style:{fontWeight:800,fontSize:`1.05rem`,color:`#0f172a`},children:`Belum Ada Siswa yang Mengumpulkan Tugas`}),(0,O.jsx)(`p`,{style:{margin:`6px 0 0 0`,fontSize:`0.85rem`},children:`Data pengerjaan siswa untuk modul ini akan otomatis tercatat di sini saat siswa menekan tombol Kirim Nilai.`})]})}):q.studentList.map((e,t)=>{let n=Object.keys(e.submissions),r=n.length,i=q.quizList.length,a=n.reduce((t,n)=>t+(e.submissions[n]?.skor||0),0),o=r>0?Math.round(a/r):0,s=i>0&&r===i,c=t%2==0;return(0,O.jsxs)(`tr`,{style:{background:c?`#ffffff`:`#f8fafc`,borderBottom:`1px solid #e2e8f0`,transition:`background 0.15s`},onMouseEnter:e=>e.currentTarget.style.background=`#f0fdf4`,onMouseLeave:e=>e.currentTarget.style.background=c?`#ffffff`:`#f8fafc`,children:[(0,O.jsx)(`td`,{style:{padding:`10px 6px`,textAlign:`center`,fontFamily:`monospace`,color:`#64748b`,background:`#f1f5f9`,borderRight:`1px solid #cbd5e1`,fontWeight:700,fontSize:`0.78rem`},children:t+1}),(0,O.jsx)(`td`,{style:{padding:`10px 16px`,fontWeight:800,color:`#0f172a`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:e.nama}),(0,O.jsx)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,fontWeight:800,borderRight:`1px solid #e2e8f0`},children:(0,O.jsx)(`span`,{style:{background:`#f1f5f9`,padding:`2px 8px`,borderRadius:`4px`,border:`1px solid #e2e8f0`},children:e.nomorAbsen||`-`})}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,color:`#334155`,fontWeight:600,borderRight:`1px solid #e2e8f0`},children:e.kelas||`-`}),q.quizList.map(t=>{let n=e.submissions[t];if(!n)return(0,O.jsx)(`td`,{style:{padding:`8px 10px`,textAlign:`center`,borderRight:`1px solid #e2e8f0`,background:`#f8fafc`},children:(0,O.jsx)(`span`,{style:{color:`#94a3b8`,fontSize:`0.75rem`,fontWeight:600},children:`[BELUM]`})},t);let r=n.status===`LULUS`||n.skor>=75;return(0,O.jsx)(`td`,{onClick:()=>{n.record&&(T.playClick(),R(n.record))},style:{padding:`8px 10px`,textAlign:`center`,borderRight:`1px solid #e2e8f0`,background:r?`rgba(220, 252, 231, 0.25)`:`rgba(254, 226, 226, 0.25)`,cursor:n.record?`pointer`:`default`},title:n.record?`Klik untuk lihat rincian lembar jawaban ${e.nama}`:``,children:(0,O.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`2px`},children:[(0,O.jsxs)(`span`,{style:{background:r?`#10b981`:`#ef4444`,color:`#ffffff`,padding:`2px 8px`,borderRadius:`10px`,fontWeight:900,fontSize:`0.78rem`},children:[r?`[OK]`:`[REM]`,` `,n.skor]}),n.jawabanBenar!==void 0&&(0,O.jsxs)(`span`,{style:{fontSize:`0.68rem`,color:`#64748b`},children:[n.jawabanBenar,`/`,n.totalSoal,` soal`]})]})},t)}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,fontWeight:800,borderRight:`1px solid #e2e8f0`},children:(0,O.jsxs)(`span`,{style:{padding:`3px 8px`,borderRadius:`6px`,background:s?`#dcfce7`:`#fef3c7`,color:s?`#166534`:`#92400e`,fontSize:`0.78rem`},children:[r,` / `,i,` Kuis`]})}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,fontFamily:`monospace`,fontWeight:900,fontSize:`0.95rem`,borderRight:`1px solid #e2e8f0`,color:o>=75?`#166534`:`#991b1b`},children:r>0?o:`-`}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`},children:(0,O.jsx)(`span`,{style:{padding:`3px 10px`,borderRadius:`12px`,fontSize:`0.72rem`,fontWeight:800,background:s?`#dcfce7`:r>0?`#fef3c7`:`#fee2e2`,color:s?`#166534`:r>0?`#92400e`:`#991b1b`,border:`1px solid ${s?`#bbf7d0`:r>0?`#fde68a`:`#fecaca`}`,display:`inline-block`},children:s?`[OK] LENGKAP`:r>0?`SEBAGIAN`:`BELUM ADA`})})]},e.nama+t)})}),q.studentList.length>0&&(0,O.jsx)(`tfoot`,{style:{position:`sticky`,bottom:0,zIndex:10,background:`#f8fafc`,borderTop:`2px solid #064e3b`},children:(0,O.jsxs)(`tr`,{style:{fontWeight:800,fontSize:`0.8rem`,color:`#0f172a`},children:[(0,O.jsx)(`td`,{colSpan:4,style:{padding:`10px 14px`,textAlign:`right`,borderRight:`1px solid #cbd5e1`},children:`Total Siswa yang Sudah Mengumpulkan:`}),q.quizList.map(e=>{let t=q.studentList.filter(t=>t.submissions[e]).length,n=Math.round(t/q.studentList.length*100);return(0,O.jsxs)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`,color:`#065f46`},children:[(0,O.jsx)(`strong`,{children:t}),` Siswa (`,n,`%)`]},e)}),(0,O.jsxs)(`td`,{colSpan:3,style:{padding:`10px 14px`,textAlign:`center`,color:`#64748b`},children:[q.studentList.length,` Total Siswa Terdata`]})]})})]}):(0,O.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,textAlign:`left`,fontSize:`0.83rem`,fontFamily:`system-ui, -apple-system, sans-serif`},children:[(0,O.jsxs)(`thead`,{style:{position:`sticky`,top:0,zIndex:10},children:[(0,O.jsxs)(`tr`,{style:{background:`#f1f5f9`,color:`#64748b`,fontSize:`0.72rem`,borderBottom:`1px solid #cbd5e1`},children:[(0,O.jsx)(`th`,{style:{width:`40px`,padding:`6px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`#`}),(0,O.jsx)(`th`,{style:{padding:`6px 12px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`A`}),(0,O.jsx)(`th`,{style:{padding:`6px 14px`,borderRight:`1px solid #cbd5e1`},children:`B`}),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`C`}),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`D`}),(0,O.jsx)(`th`,{style:{padding:`6px 12px`,borderRight:`1px solid #cbd5e1`},children:`E`}),(0,O.jsx)(`th`,{style:{padding:`6px 12px`,borderRight:`1px solid #cbd5e1`},children:`F`}),(0,O.jsx)(`th`,{style:{padding:`6px 14px`,borderRight:`1px solid #cbd5e1`},children:`G`}),(0,O.jsx)(`th`,{style:{padding:`6px 16px`,borderRight:`1px solid #cbd5e1`},children:`H`}),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`I`}),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`J`}),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`K`}),(0,O.jsx)(`th`,{style:{padding:`6px 10px`,textAlign:`center`},children:`L`})]}),(0,O.jsxs)(`tr`,{style:{background:`#064e3b`,color:`#f0fdf4`,borderBottom:`2px solid #047857`},children:[(0,O.jsx)(`th`,{style:{padding:`12px 6px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,width:`40px`},children:`No`}),(0,O.jsx)(`th`,{style:{padding:`12px 14px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Waktu & Tanggal`}),(0,O.jsx)(`th`,{style:{padding:`12px 16px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Nama Siswa`}),(0,O.jsx)(`th`,{style:{padding:`12px 10px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Absen`}),(0,O.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Kelas`}),(0,O.jsx)(`th`,{style:{padding:`12px 14px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Sekolah`}),(0,O.jsx)(`th`,{style:{padding:`12px 14px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Modul Lab (Sidebar)`}),(0,O.jsx)(`th`,{style:{padding:`12px 14px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`,background:`#047857`},children:`Lembar / Sub-Kuis`}),(0,O.jsx)(`th`,{style:{padding:`12px 16px`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Nama Kuis / Asesmen`}),(0,O.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Skor (0-100)`}),(0,O.jsx)(`th`,{style:{padding:`12px 10px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Benar / Total`}),(0,O.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #047857`,fontWeight:800,whiteSpace:`nowrap`},children:`Status KKM`}),(0,O.jsx)(`th`,{style:{padding:`12px 12px`,textAlign:`center`,fontWeight:800,whiteSpace:`nowrap`},children:`Aksi`})]})]}),(0,O.jsx)(`tbody`,{children:K.length===0?(0,O.jsx)(`tr`,{children:(0,O.jsxs)(`td`,{colSpan:`13`,style:{padding:`50px 20px`,textAlign:`center`,color:`#64748b`,background:`#ffffff`},children:[(0,O.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`,marginBottom:`8px`},children:(0,O.jsx)(m,{size:40,color:`#94a3b8`})}),(0,O.jsx)(`div`,{style:{fontWeight:800,fontSize:`1.05rem`,color:`#0f172a`},children:`Belum Ada Hasil Pengerjaan untuk Kategori Ini`}),(0,O.jsxs)(`p`,{style:{margin:`6px 0 16px 0`,fontSize:`0.85rem`},children:[`Belum ada siswa yang menyelesaikan kuis pada pilihan `,(0,O.jsxs)(`strong`,{children:[`"`,$,`"`]}),`.`]}),(0,O.jsx)(`div`,{style:{display:`flex`,gap:`8px`,justifyContent:`center`},children:(0,O.jsx)(`button`,{onClick:()=>{j(`all`),b(`all`)},style:{padding:`8px 16px`,borderRadius:`8px`,background:`#064e3b`,color:`#fff`,border:`none`,fontWeight:700,fontSize:`0.82rem`,cursor:`pointer`},children:`Lihat Semua Kuis di Modul Ini`})})]})}):C?et.map((e,t)=>(0,O.jsxs)(D.Fragment,{children:[(0,O.jsx)(`tr`,{style:{background:`linear-gradient(90deg, #064e3b 0%, #0f172a 100%)`,color:`#ffffff`},children:(0,O.jsxs)(`td`,{colSpan:`13`,style:{padding:`12px 16px`,borderBottom:`2px solid #10b981`,borderTop:t>0?`6px solid #e2e8f0`:`none`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`8px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,O.jsx)(`span`,{style:{background:`#10b981`,color:`#064e3b`,padding:`2px 8px`,borderRadius:`6px`,fontWeight:900,fontSize:`0.72rem`},children:`KLASIFIKASI KUIS`}),(0,O.jsx)(`strong`,{style:{fontSize:`0.98rem`,letterSpacing:`0.3px`,color:`#ffffff`},children:e.quizName})]}),(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`14px`,fontSize:`0.78rem`},children:[(0,O.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[(0,O.jsx)(ae,{size:14}),` `,(0,O.jsx)(`strong`,{children:e.totalCount}),` Siswa`]}),(0,O.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,O.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[(0,O.jsx)(ue,{size:14}),` Rata-rata: `,(0,O.jsx)(`strong`,{children:e.avgScore}),`/100`]}),(0,O.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,O.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[(0,O.jsx)(re,{size:14}),` Tertinggi: `,(0,O.jsx)(`strong`,{children:e.maxScore})]}),(0,O.jsx)(`span`,{style:{color:`#94a3b8`},children:`|`}),(0,O.jsxs)(`span`,{style:{color:e.passPct>=75?`#6ee7b7`:`#fca5a5`},children:[`Kelulusan KKM: `,(0,O.jsxs)(`strong`,{children:[e.passedCount,`/`,e.totalCount,` (`,e.passPct,`%)`]})]})]})]}),(0,O.jsxs)(`div`,{style:{marginTop:`8px`,paddingTop:`8px`,borderTop:`1px solid rgba(255, 255, 255, 0.15)`,display:`flex`,alignItems:`center`,flexWrap:`wrap`,gap:`6px`},children:[(0,O.jsxs)(`span`,{style:{fontSize:`0.72rem`,color:`#a7f3d0`,fontWeight:700,textTransform:`uppercase`,letterSpacing:`0.4px`},children:[`Siswa yang Sudah Mengumpulkan (`,e.totalCount,` Siswa):`]}),e.items.map((e,t)=>{let n=e.status===`LULUS`||Number(e.skor)>=75;return(0,O.jsxs)(`span`,{onClick:()=>{T.playClick(),R(e)},style:{background:n?`rgba(16, 185, 129, 0.22)`:`rgba(239, 68, 68, 0.22)`,color:`#ffffff`,border:`1px solid ${n?`#10b981`:`#f87171`}`,padding:`2px 8px`,borderRadius:`12px`,fontSize:`0.75rem`,fontWeight:600,display:`inline-flex`,alignItems:`center`,gap:`5px`,cursor:`pointer`},title:`Klik untuk lihat rincian lembar pengerjaan ${e.namaSiswa}`,children:[(0,O.jsx)(`span`,{children:e.namaSiswa}),(0,O.jsx)(`span`,{style:{background:n?`#10b981`:`#ef4444`,color:`#ffffff`,borderRadius:`6px`,padding:`0 5px`,fontSize:`0.68rem`,fontWeight:800},children:e.skor})]},e.id||t)})]})]})}),e.items.map((e,t)=>{let n=e.status===`LULUS`,r=t%2==0;return(0,O.jsxs)(`tr`,{onClick:()=>Le(`I${t+2}`),style:{background:r?`#ffffff`:`#f8fafc`,borderBottom:`1px solid #e2e8f0`,transition:`background 0.15s`},onMouseEnter:e=>e.currentTarget.style.background=`#f0fdf4`,onMouseLeave:e=>e.currentTarget.style.background=r?`#ffffff`:`#f8fafc`,children:[(0,O.jsx)(`td`,{style:{padding:`10px 6px`,textAlign:`center`,fontFamily:`monospace`,color:`#64748b`,background:`#f1f5f9`,borderRight:`1px solid #cbd5e1`,fontWeight:700,fontSize:`0.78rem`},children:t+1}),(0,O.jsx)(`td`,{style:{padding:`10px 14px`,color:`#475569`,fontSize:`0.78rem`,whiteSpace:`nowrap`,borderRight:`1px solid #e2e8f0`},children:e.waktu||e.timestamp?.slice(0,10)}),(0,O.jsx)(`td`,{style:{padding:`10px 16px`,fontWeight:800,color:`#0f172a`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:e.namaSiswa}),(0,O.jsx)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,fontWeight:800,borderRight:`1px solid #e2e8f0`},children:(0,O.jsx)(`span`,{style:{background:`#f1f5f9`,padding:`2px 8px`,borderRadius:`4px`,border:`1px solid #e2e8f0`},children:e.nomorAbsen||`-`})}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,color:`#334155`,fontWeight:600,borderRight:`1px solid #e2e8f0`},children:e.kelas||`-`}),(0,O.jsx)(`td`,{style:{padding:`10px 14px`,color:`#475569`,fontSize:`0.8rem`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:e.sekolah||`SMKN 2 Depok`}),(0,O.jsx)(`td`,{style:{padding:`10px 14px`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:(0,O.jsxs)(`span`,{style:{fontWeight:800,color:`#065f46`,background:`rgba(16, 185, 129, 0.12)`,padding:`3px 8px`,borderRadius:`6px`,border:`1px solid rgba(16, 185, 129, 0.25)`,fontSize:`0.78rem`},children:[e.labIcon,` `,e.labLabel]})}),(0,O.jsx)(`td`,{style:{padding:`10px 14px`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:(0,O.jsx)(`span`,{style:{fontWeight:700,color:`#1e293b`,background:`#f1f5f9`,padding:`3px 8px`,borderRadius:`6px`,fontSize:`0.78rem`,border:`1px solid #e2e8f0`},children:e.subLabel})}),(0,O.jsx)(`td`,{style:{padding:`10px 16px`,borderRight:`1px solid #e2e8f0`},children:(0,O.jsx)(`div`,{style:{fontWeight:800,color:`#065f46`,fontSize:`0.84rem`},children:e.judulKuis})}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,fontFamily:`monospace`,fontWeight:900,fontSize:`1rem`,color:n?`#166534`:`#991b1b`,background:n?`rgba(220, 252, 231, 0.4)`:`rgba(254, 226, 226, 0.4)`,borderRight:`1px solid #e2e8f0`},children:e.skor}),(0,O.jsxs)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,color:`#475569`,fontWeight:700,borderRight:`1px solid #e2e8f0`},children:[e.jawabanBenar,` / `,e.totalSoal]}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,borderRight:`1px solid #e2e8f0`},children:(0,O.jsx)(`span`,{style:{padding:`3px 10px`,borderRadius:`12px`,fontSize:`0.72rem`,fontWeight:800,background:n?`#dcfce7`:`#fee2e2`,color:n?`#166534`:`#991b1b`,border:`1px solid ${n?`#bbf7d0`:`#fecaca`}`,display:`inline-block`},children:n?`[OK] LULUS`:`[REM] REMEDIAL`})}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`},children:(0,O.jsx)(`button`,{onClick:()=>{T.playClick(),R(e)},style:{background:`#f8fafc`,border:`1px solid #cbd5e1`,padding:`4px 10px`,borderRadius:`6px`,fontSize:`0.74rem`,cursor:`pointer`,color:`#0284c7`,fontWeight:800},children:`Rincian`})})]},e.id||t)}),(0,O.jsxs)(`tr`,{style:{background:`#ecfdf5`,fontWeight:800,fontSize:`0.8rem`,color:`#065f46`,borderBottom:`2px solid #10b981`},children:[(0,O.jsxs)(`td`,{colSpan:`9`,style:{padding:`9px 16px`,textAlign:`right`,borderRight:`1px solid #cbd5e1`},children:[`Subtotal Rata-rata Skor [`,(0,O.jsx)(`strong`,{children:e.quizName}),`]:`]}),(0,O.jsx)(`td`,{style:{padding:`9px 10px`,textAlign:`center`,fontFamily:`monospace`,fontSize:`0.98rem`,color:`#065f46`,borderRight:`1px solid #cbd5e1`},children:e.avgScore}),(0,O.jsxs)(`td`,{colSpan:`3`,style:{padding:`9px 14px`},children:[`Kelulusan KKM: `,(0,O.jsxs)(`strong`,{children:[e.passPct,`%`]}),` (`,e.passedCount,` dari `,e.totalCount,` Siswa)`]})]})]},e.quizName)):tt.map((e,t)=>{let n=e.status===`LULUS`,r=t+2,i=t%2==0;return(0,O.jsxs)(`tr`,{onClick:()=>Le(`I${r}`),style:{background:i?`#ffffff`:`#f8fafc`,borderBottom:`1px solid #e2e8f0`,transition:`background 0.15s`},onMouseEnter:e=>e.currentTarget.style.background=`#f0fdf4`,onMouseLeave:e=>e.currentTarget.style.background=i?`#ffffff`:`#f8fafc`,children:[(0,O.jsx)(`td`,{style:{padding:`10px 6px`,textAlign:`center`,fontFamily:`monospace`,color:`#64748b`,background:`#f1f5f9`,borderRight:`1px solid #cbd5e1`,fontWeight:700,fontSize:`0.78rem`},children:r}),(0,O.jsx)(`td`,{style:{padding:`10px 14px`,color:`#475569`,fontSize:`0.78rem`,whiteSpace:`nowrap`,borderRight:`1px solid #e2e8f0`},children:e.waktu||e.timestamp?.slice(0,10)}),(0,O.jsx)(`td`,{style:{padding:`10px 16px`,fontWeight:800,color:`#0f172a`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:e.namaSiswa}),(0,O.jsx)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,fontWeight:800,borderRight:`1px solid #e2e8f0`},children:(0,O.jsx)(`span`,{style:{background:`#f1f5f9`,padding:`2px 8px`,borderRadius:`4px`,border:`1px solid #e2e8f0`},children:e.nomorAbsen||`-`})}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,color:`#334155`,fontWeight:600,borderRight:`1px solid #e2e8f0`},children:e.kelas||`-`}),(0,O.jsx)(`td`,{style:{padding:`10px 14px`,color:`#475569`,fontSize:`0.8rem`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:e.sekolah||`SMKN 2 Depok`}),(0,O.jsx)(`td`,{style:{padding:`10px 14px`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:(0,O.jsxs)(`span`,{style:{fontWeight:800,color:`#065f46`,background:`rgba(16, 185, 129, 0.12)`,padding:`3px 8px`,borderRadius:`6px`,border:`1px solid rgba(16, 185, 129, 0.25)`,fontSize:`0.78rem`},children:[e.labIcon,` `,e.labLabel]})}),(0,O.jsx)(`td`,{style:{padding:`10px 14px`,borderRight:`1px solid #e2e8f0`,whiteSpace:`nowrap`},children:(0,O.jsx)(`span`,{style:{fontWeight:700,color:`#1e293b`,background:`#f1f5f9`,padding:`3px 8px`,borderRadius:`6px`,fontSize:`0.78rem`,border:`1px solid #e2e8f0`},children:e.subLabel})}),(0,O.jsx)(`td`,{style:{padding:`10px 16px`,borderRight:`1px solid #e2e8f0`},children:(0,O.jsx)(`div`,{style:{fontWeight:800,color:`#065f46`,fontSize:`0.84rem`},children:e.judulKuis})}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,fontFamily:`monospace`,fontWeight:900,fontSize:`1rem`,color:n?`#166534`:`#991b1b`,background:n?`rgba(220, 252, 231, 0.4)`:`rgba(254, 226, 226, 0.4)`,borderRight:`1px solid #e2e8f0`},children:e.skor}),(0,O.jsxs)(`td`,{style:{padding:`10px 10px`,textAlign:`center`,color:`#475569`,fontWeight:700,borderRight:`1px solid #e2e8f0`},children:[e.jawabanBenar,` / `,e.totalSoal]}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`,borderRight:`1px solid #e2e8f0`},children:(0,O.jsx)(`span`,{style:{padding:`3px 10px`,borderRadius:`12px`,fontSize:`0.72rem`,fontWeight:800,background:n?`#dcfce7`:`#fee2e2`,color:n?`#166534`:`#991b1b`,border:`1px solid ${n?`#bbf7d0`:`#fecaca`}`,display:`inline-block`},children:n?`[OK] LULUS`:`[REM] REMEDIAL`})}),(0,O.jsx)(`td`,{style:{padding:`10px 12px`,textAlign:`center`},children:(0,O.jsx)(`button`,{onClick:()=>{T.playClick(),R(e)},style:{background:`#f8fafc`,border:`1px solid #cbd5e1`,padding:`4px 10px`,borderRadius:`6px`,fontSize:`0.74rem`,cursor:`pointer`,color:`#0284c7`,fontWeight:800},children:`Rincian`})})]},e.id||t)})}),K.length>0&&(0,O.jsx)(`tfoot`,{style:{position:`sticky`,bottom:0,zIndex:10,background:`#f8fafc`,borderTop:`2px solid #064e3b`},children:(0,O.jsxs)(`tr`,{style:{fontWeight:800,fontSize:`0.82rem`,color:`#0f172a`},children:[(0,O.jsx)(`td`,{style:{padding:`12px 6px`,textAlign:`center`,background:`#e2e8f0`,borderRight:`1px solid #cbd5e1`,color:`#064e3b`},children:`Σ`}),(0,O.jsx)(`td`,{style:{padding:`12px 14px`,borderRight:`1px solid #cbd5e1`,color:`#64748b`},children:`=SUMMARY()`}),(0,O.jsxs)(`td`,{style:{padding:`12px 16px`,borderRight:`1px solid #cbd5e1`},children:[`Total: `,(0,O.jsxs)(`strong`,{style:{color:`#064e3b`},children:[K.length,` Siswa`]})]}),(0,O.jsx)(`td`,{style:{padding:`12px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`-`}),(0,O.jsx)(`td`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:`-`}),(0,O.jsx)(`td`,{style:{padding:`12px 14px`,borderRight:`1px solid #cbd5e1`},children:`SMKN 2 Depok`}),(0,O.jsx)(`td`,{style:{padding:`12px 14px`,borderRight:`1px solid #cbd5e1`},children:`-`}),(0,O.jsx)(`td`,{style:{padding:`12px 14px`,borderRight:`1px solid #cbd5e1`,color:`#065f46`},children:A===`all`?`Semua Sub-Kuis`:$.split(` > `)[1]}),(0,O.jsx)(`td`,{style:{padding:`12px 16px`,borderRight:`1px solid #cbd5e1`,color:`#64748b`},children:`=AVERAGE(I:I)`}),(0,O.jsx)(`td`,{style:{padding:`12px 12px`,textAlign:`center`,fontFamily:`monospace`,fontWeight:900,fontSize:`1.05rem`,color:Y>=75?`#166534`:`#991b1b`,background:`#ecfdf5`,borderRight:`1px solid #cbd5e1`},children:Y}),(0,O.jsxs)(`td`,{style:{padding:`12px 10px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:[rt,` / `,it]}),(0,O.jsx)(`td`,{style:{padding:`12px 12px`,textAlign:`center`,borderRight:`1px solid #cbd5e1`},children:(0,O.jsxs)(`span`,{style:{color:`#166534`,fontWeight:900},children:[X,` Lulus (`,Z,`%)`]})}),(0,O.jsx)(`td`,{style:{padding:`12px 12px`,textAlign:`center`},children:(0,O.jsx)(`button`,{onClick:()=>{T.playClick(),E(K)},style:{padding:`4px 8px`,borderRadius:`4px`,background:`#10b981`,color:`#fff`,border:`none`,fontSize:`0.72rem`,fontWeight:800,cursor:`pointer`},children:`Unduh .xls`})})]})})]})})}),(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`12px 18px`,display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`12px`,background:`#f8fafc`,borderRadius:`10px`,border:`1px solid #cbd5e1`,fontSize:`0.82rem`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,O.jsx)(`span`,{style:{background:`#064e3b`,color:`#ffffff`,padding:`3px 8px`,borderRadius:`4px`,fontWeight:800},children:A===`all`?`SHEET 1`:A.toUpperCase()}),(0,O.jsxs)(`span`,{style:{fontWeight:700,color:`#334155`},children:[`Lembar Aktif: `,(0,O.jsx)(`strong`,{children:$}),` (SMKN 2 Depok - Kurikulum Merdeka)`]})]}),(0,O.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`14px`,color:`#64748b`},children:(0,O.jsx)(`span`,{children:(0,O.jsxs)(`em`,{children:[`Klik tombol `,(0,O.jsx)(`strong`,{children:`"Unduh Excel Lembar Ini (.xls)"`}),` untuk langsung mencetak atau mengolah nilai sub-kuis ini.`]})})})]}),(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{padding:`18px 24px`,background:`var(--bg-card, #ffffff)`,border:`1px solid var(--border-light, #e2e8f0)`,borderRadius:`12px`},children:[(0,O.jsxs)(`div`,{onClick:()=>He(!I),style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,cursor:`pointer`,userSelect:`none`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,O.jsx)(a,{size:18}),(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`div`,{style:{fontWeight:800,fontSize:`0.92rem`,color:`var(--text-main, #0f172a)`},children:`Integrasi Cloud Otomatis ke Google Drive (Opsional)`}),(0,O.jsx)(`div`,{style:{fontSize:`0.78rem`,color:`#64748b`},children:`Spreadsheet di atas sudah siap digunakan langsung. Buka bagian ini HANYA jika Anda ingin hasil kuis otomatis dikirim ke Google Sheets di akun Google Anda.`})]})]}),(0,O.jsx)(`div`,{style:{fontSize:`1rem`,color:`#64748b`,fontWeight:800},children:I?`▲ Sembunyikan`:`▼ Lihat Pengaturan`})]}),I&&(0,O.jsxs)(`div`,{style:{marginTop:`20px`,paddingTop:`16px`,borderTop:`1px solid #e2e8f0`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,gap:`12px`,flexWrap:`wrap`,alignItems:`center`,marginBottom:`16px`},children:[(0,O.jsx)(`button`,{onClick:()=>{T.playClick(),N(!0)},style:{background:`#0284c7`,color:`#fff`,border:`none`,padding:`8px 16px`,borderRadius:`8px`,fontSize:`0.8rem`,fontWeight:800,cursor:`pointer`},children:`Panduan & Salin Kode Apps Script`}),(0,O.jsx)(`button`,{onClick:()=>{T.playClick(),M(!0)},style:{background:s?`#10b981`:`#f59e0b`,color:`#fff`,border:`none`,padding:`8px 16px`,borderRadius:`8px`,fontSize:`0.8rem`,fontWeight:800,cursor:`pointer`},children:s?`Ganti URL Webhook`:`Tempel URL Webhook`}),at>0&&(0,O.jsxs)(`button`,{onClick:async()=>{T.playClick();let e=await we();W(),e.synced>0?(T.playSuccess(),alert(`Berhasil menyinkronkan ${e.synced} dari ${e.total} data ke Google Spreadsheet!`)):alert(`Tidak ada data tertunda yang berhasil disinkronkan. Pastikan URL Spreadsheet valid.`)},style:{background:`#d97706`,border:`none`,color:`#fff`,padding:`8px 14px`,borderRadius:`8px`,fontSize:`0.8rem`,fontWeight:800,cursor:`pointer`},children:[`Sinkronkan `,at,` Nilai Tertunda`]})]}),(0,O.jsxs)(`div`,{style:{fontSize:`0.8rem`,color:`#64748b`},children:[`Target Webhook saat ini: `,(0,O.jsx)(`code`,{style:{background:`#f1f5f9`,padding:`2px 8px`,borderRadius:`4px`,color:s?`#059669`:`#dc2626`},children:s||`(Belum dipasang - Data tetap aman tersimpan di spreadsheet lab ini)`})]})]})]}),L&&(0,O.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,background:`rgba(0,0,0,0.7)`,zIndex:99999,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`20px`},children:(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{width:`100%`,maxWidth:`640px`,background:`#fff`,borderRadius:`16px`,padding:`26px`,maxHeight:`88vh`,overflowY:`auto`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`16px`,borderBottom:`1px solid #e2e8f0`,paddingBottom:`12px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,O.jsx)(ee,{size:18}),(0,O.jsx)(`h3`,{style:{margin:0,fontSize:`1.15rem`,fontWeight:800,color:`#0f172a`},children:`Rincian Hasil Asesmen Siswa`})]}),(0,O.jsx)(`button`,{onClick:()=>R(null),style:{background:`transparent`,border:`none`,fontSize:`1.3rem`,cursor:`pointer`,color:`#64748b`}})]}),(0,O.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`12px`,fontSize:`0.85rem`,marginBottom:`16px`,background:`#f8fafc`,padding:`16px`,borderRadius:`10px`,border:`1px solid #e2e8f0`},children:[(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`strong`,{children:`Nama Siswa:`}),` `,L.namaSiswa]}),(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`strong`,{children:`No. Absen:`}),` `,L.nomorAbsen]}),(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`strong`,{children:`Kelas / Jurusan:`}),` `,L.kelas]}),(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`strong`,{children:`Sekolah:`}),` `,L.sekolah||`SMKN 2 Depok`]}),(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`strong`,{children:`Modul Lab:`}),` `,L.labLabel||L.modul]}),(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`strong`,{children:`Lembar Sub-Kuis:`}),` `,L.subLabel]}),(0,O.jsxs)(`div`,{style:{gridColumn:`span 2`},children:[(0,O.jsx)(`strong`,{children:`Nama Kuis / Asesmen:`}),` `,L.judulKuis]}),(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`strong`,{children:`Skor Hasil:`}),` `,(0,O.jsxs)(`span`,{style:{fontWeight:900,fontSize:`1.05rem`,color:L.status===`LULUS`?`#16a34a`:`#dc2626`},children:[L.skor,` / 100`]})]}),(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`strong`,{children:`Status KKM:`}),` `,(0,O.jsx)(`span`,{style:{fontWeight:800,color:L.status===`LULUS`?`#16a34a`:`#dc2626`},children:L.status})]}),(0,O.jsxs)(`div`,{style:{gridColumn:`span 2`,fontSize:`0.8rem`,color:`#64748b`},children:[(0,O.jsx)(`strong`,{children:`Waktu Selesai:`}),` `,L.waktu]})]}),(0,O.jsxs)(`div`,{style:{marginBottom:`18px`},children:[(0,O.jsx)(`label`,{style:{display:`block`,fontWeight:800,fontSize:`0.85rem`,color:`#0f172a`,marginBottom:`6px`},children:`Rekaman Jawaban Soal:`}),(0,O.jsx)(`pre`,{style:{background:`#0f172a`,color:`#38bdf8`,padding:`14px`,borderRadius:`8px`,fontSize:`0.8rem`,overflowX:`auto`,whiteSpace:`pre-wrap`,maxHeight:`220px`,lineHeight:1.5},children:L.detailJawaban||`Tidak ada catatan jawaban tambahan.`})]}),(0,O.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:(0,O.jsx)(`button`,{onClick:()=>R(null),style:{padding:`8px 18px`,borderRadius:`8px`,background:`#0f172a`,color:`#fff`,border:`none`,cursor:`pointer`,fontWeight:800,fontSize:`0.85rem`},children:`Tutup`})})]})}),Re&&(0,O.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,background:`rgba(0,0,0,0.7)`,zIndex:99999,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`20px`},children:(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{width:`100%`,maxWidth:`640px`,background:`#fff`,borderRadius:`16px`,padding:`28px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`16px`,borderBottom:`1px solid #e2e8f0`,paddingBottom:`12px`},children:[(0,O.jsxs)(`h3`,{style:{margin:0,fontSize:`1.2rem`,fontWeight:800,display:`flex`,alignItems:`center`,gap:`8px`,color:`#0f172a`},children:[(0,O.jsx)(a,{size:18,style:{display:`inline`,marginRight:`6px`,verticalAlign:`-2px`}}),` Konfigurasi Webhook Google Spreadsheet`]}),(0,O.jsx)(`button`,{onClick:()=>M(!1),style:{background:`transparent`,border:`none`,fontSize:`1.2rem`,cursor:`pointer`,color:`#64748b`}})]}),(0,O.jsxs)(`p`,{style:{fontSize:`0.86rem`,color:`#475569`,lineHeight:1.5,margin:`0 0 14px 0`},children:[`Konfigurasikan integrasi Google Spreadsheet agar hasil kuis otomatis terkirim dan tombol `,(0,O.jsx)(`strong`,{children:`Buka Google Sheets`}),` langsung membuka file Anda.`]}),(0,O.jsxs)(`div`,{style:{background:`#f8fafc`,border:`1px solid #e2e8f0`,borderRadius:`10px`,padding:`12px 14px`,marginBottom:`14px`},children:[(0,O.jsxs)(`div`,{style:{fontSize:`0.8rem`,fontWeight:800,color:`#0f172a`,marginBottom:`8px`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,O.jsx)(g,{size:14}),(0,O.jsx)(`span`,{children:`Tautan Cepat Membuka Google Sheets:`})]}),(0,O.jsxs)(`div`,{style:{display:`flex`,gap:`10px`,flexWrap:`wrap`},children:[(0,O.jsx)(`a`,{href:`https://sheets.google.com`,target:`_blank`,rel:`noopener noreferrer`,style:{padding:`7px 12px`,background:`#0284c7`,color:`#ffffff`,borderRadius:`8px`,fontSize:`0.78rem`,fontWeight:700,textDecoration:`none`,display:`inline-flex`,alignItems:`center`,gap:`6px`},children:(0,O.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:`6px`},children:[(0,O.jsx)(m,{size:14}),` Buka Daftar Sheets Anda (sheets.google.com) `,(0,O.jsx)(c,{size:13})]})}),(0,O.jsx)(`a`,{href:`https://sheets.new`,target:`_blank`,rel:`noopener noreferrer`,style:{padding:`7px 12px`,background:`#10b981`,color:`#ffffff`,borderRadius:`8px`,fontSize:`0.78rem`,fontWeight:700,textDecoration:`none`,display:`inline-flex`,alignItems:`center`,gap:`6px`},children:(0,O.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:`6px`},children:[(0,O.jsx)(ce,{size:14}),` Buat File Baru (sheets.new) `,(0,O.jsx)(c,{size:13})]})})]})]}),(0,O.jsxs)(`form`,{onSubmit:e=>{e.preventDefault(),T.playClick(),pe(s),V!==void 0&&qe(V),T.playSuccess(),z(`[OK] Pengaturan berhasil disimpan!`),setTimeout(()=>{z(``),M(!1)},1200)},style:{display:`flex`,flexDirection:`column`,gap:`14px`},children:[(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`label`,{style:{display:`block`,fontSize:`0.85rem`,fontWeight:800,marginBottom:`6px`,color:`#0f172a`},children:`Tautan Langsung Dokumen Spreadsheet Anda (Opsional):`}),(0,O.jsx)(`input`,{type:`url`,placeholder:`https://docs.google.com/spreadsheets/d/.../edit`,value:V!==void 0&&V!==``?V:B,onChange:e=>H(e.target.value),style:{width:`100%`,padding:`11px 13px`,borderRadius:`8px`,border:`1.5px solid #cbd5e1`,fontSize:`0.84rem`}}),(0,O.jsxs)(`div`,{style:{fontSize:`0.74rem`,color:`#64748b`,marginTop:`4px`},children:[`Saat diisi, tombol `,(0,O.jsx)(`strong`,{children:`Buka Google Sheets`}),` di toolbar akan langsung membuka file ini.`]})]}),(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`label`,{style:{display:`block`,fontSize:`0.85rem`,fontWeight:800,marginBottom:`6px`,color:`#0f172a`},children:`URL Web App Google Apps Script (Webhook Pengirim Nilai):`}),(0,O.jsx)(`input`,{type:`url`,placeholder:`https://script.google.com/macros/s/AKfycb.../exec`,value:s,onChange:e=>u(e.target.value),style:{width:`100%`,padding:`12px 14px`,borderRadius:`8px`,border:`1.5px solid #cbd5e1`,fontSize:`0.85rem`,fontFamily:`monospace`}})]}),Ue&&(0,O.jsx)(`div`,{style:{padding:`10px 14px`,borderRadius:`8px`,background:`#f8fafc`,border:`1px solid #cbd5e1`,fontSize:`0.85rem`,color:`#0f172a`,fontWeight:600},children:Ue}),(0,O.jsxs)(`div`,{style:{display:`flex`,gap:`10px`,marginTop:`10px`},children:[(0,O.jsx)(`button`,{type:`button`,onClick:async()=>{if(!s.trim()){alert(`Silakan masukkan URL Webhook Google Apps Script terlebih dahulu.`);return}z(`Mengirim data uji coba...`),T.playClick();let e={waktu:new Date().toLocaleString(`id-ID`),namaSiswa:`Siswa Percobaan (Test)`,nomorAbsen:`99`,kelas:`X TPM 1`,sekolah:`SMKN 2 Depok`,modul:`Safety Lab`,subModul:`Kuis Inspeksi APD`,jenisKuis:`Kuis Inspeksi APD`,judulKuis:`Inspeksi APD Operator: Mesin Bubut Konvensional (Uji Coba)`,skor:100,jawabanBenar:1,totalSoal:1,status:`LULUS`,detailJawaban:`Tes koneksi webhook berhasil terhubung dari website BIMO Labs!`},t=await ve(e);t.success?(T.playSuccess(),z(`[OK] Berhasil terkirim! Silakan periksa Google Spreadsheet Anda.`)):(T.playError(),z(`[GAGAL] Gagal mengirim: ${t.error||t.reason||`Periksa kembali URL Webhook Anda`}`))},style:{padding:`10px 16px`,borderRadius:`8px`,background:`#f8fafc`,border:`1px solid #cbd5e1`,color:`#0f172a`,fontWeight:700,fontSize:`0.85rem`,cursor:`pointer`},children:`Uji Kirim Baris Tes`}),(0,O.jsx)(`button`,{type:`submit`,style:{flex:1,padding:`10px 16px`,borderRadius:`8px`,background:`linear-gradient(135deg, #10b981 0%, #059669 100%)`,color:`#ffffff`,border:`none`,fontWeight:800,fontSize:`0.85rem`,cursor:`pointer`},children:`Simpan Pengaturan`})]})]})]})}),ze&&(0,O.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,background:`rgba(0,0,0,0.8)`,zIndex:99999,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`20px`},children:(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{width:`100%`,maxWidth:`820px`,background:`#fff`,borderRadius:`18px`,padding:`28px`,maxHeight:`90vh`,overflowY:`auto`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`16px`,borderBottom:`1px solid #e2e8f0`,paddingBottom:`12px`},children:[(0,O.jsxs)(`h3`,{style:{margin:0,fontSize:`1.25rem`,fontWeight:800,display:`flex`,alignItems:`center`,gap:`8px`,color:`#0f172a`},children:[(0,O.jsx)(v,{size:15}),` Kode Google Apps Script & Cara Pasang (Opsional)`]}),(0,O.jsx)(`button`,{onClick:()=>N(!1),style:{background:`transparent`,border:`none`,fontSize:`1.3rem`,cursor:`pointer`,color:`#64748b`}})]}),(0,O.jsxs)(`div`,{style:{background:`#f8fafc`,border:`1px solid #e2e8f0`,borderRadius:`12px`,padding:`16px`,marginBottom:`20px`,fontSize:`0.86rem`,lineHeight:1.6},children:[(0,O.jsx)(`div`,{style:{fontWeight:800,color:`#0f172a`,marginBottom:`8px`},children:`Langkah Pemasangan di Google Spreadsheet Pribadi:`}),(0,O.jsxs)(`ol`,{style:{margin:0,paddingLeft:`20px`,display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,O.jsxs)(`li`,{children:[`Buka `,(0,O.jsx)(`strong`,{children:`https://sheets.new`}),` di tab baru untuk membuat spreadsheet kosong.`]}),(0,O.jsxs)(`li`,{children:[`Klik menu `,(0,O.jsx)(`strong`,{children:`Ekstensi (Extensions)`}),` > pilih `,(0,O.jsx)(`strong`,{children:`Apps Script`}),`.`]}),(0,O.jsxs)(`li`,{children:[`Hapus kode lama, lalu klik tombol `,(0,O.jsx)(`strong`,{children:`"Salin Kode Apps Script"`}),` di bawah dan tempelkan.`]}),(0,O.jsxs)(`li`,{children:[`Klik `,(0,O.jsx)(`strong`,{children:`Simpan`}),` (ikon disket), lalu klik tombol biru `,(0,O.jsx)(`strong`,{children:`Terapkan (Deploy)`}),` > `,(0,O.jsx)(`strong`,{children:`Penerapan baru`}),`.`]}),(0,O.jsxs)(`li`,{children:[`Pilih jenis `,(0,O.jsx)(`strong`,{children:`Aplikasi web`}),`, ubah `,(0,O.jsx)(`em`,{children:`Yang memiliki akses`}),` menjadi: `,(0,O.jsx)(`strong`,{children:`Siapa saja (Anyone)`}),`.`]}),(0,O.jsxs)(`li`,{children:[`Salin URL Web App yang berakhiran `,(0,O.jsx)(`code`,{children:`/exec`}),` lalu tempelkan di menu pengaturan webhook.`]})]})]}),(0,O.jsxs)(`div`,{style:{position:`relative`,marginBottom:`20px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,background:`#1e293b`,color:`#cbd5e1`,padding:`10px 16px`,borderTopLeftRadius:`10px`,borderTopRightRadius:`10px`,fontSize:`0.8rem`},children:[(0,O.jsx)(`span`,{style:{fontWeight:700},children:`Code.gs (Google Apps Script)`}),(0,O.jsx)(`button`,{onClick:()=>{T.playClick(),navigator.clipboard.writeText(Ee),Ge(!0),setTimeout(()=>Ge(!1),2500)},style:{background:We?`#10b981`:`#f59e0b`,color:`#fff`,border:`none`,padding:`6px 14px`,borderRadius:`6px`,fontWeight:800,fontSize:`0.78rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:We?`[OK] Kode Berhasil Disalin!`:`Salin Kode Apps Script`})]}),(0,O.jsx)(`pre`,{style:{background:`#0f172a`,color:`#93c5fd`,padding:`16px`,borderBottomLeftRadius:`10px`,borderBottomRightRadius:`10px`,fontSize:`0.76rem`,overflowX:`auto`,maxHeight:`280px`,margin:0,fontFamily:`monospace`},children:Ee})]}),(0,O.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:(0,O.jsx)(`button`,{onClick:()=>{N(!1),M(!0)},style:{padding:`10px 18px`,borderRadius:`8px`,background:`#10b981`,color:`#fff`,border:`none`,fontWeight:800,fontSize:`0.85rem`,cursor:`pointer`},children:`Lanjut Masukkan URL Webhook >`})})]})}),Be&&(0,O.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,background:`rgba(0,0,0,0.75)`,zIndex:999999,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`20px`},children:(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{width:`100%`,maxWidth:`620px`,background:`#fff`,borderRadius:`18px`,padding:`28px`,boxShadow:`0 20px 40px rgba(0,0,0,0.3)`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`16px`,borderBottom:`1px solid #e2e8f0`,paddingBottom:`12px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,O.jsx)(v,{size:20,color:`#0284c7`}),(0,O.jsx)(`h3`,{style:{margin:0,fontSize:`1.2rem`,fontWeight:900,color:`#0f172a`},children:`Data Nilai Berhasil Disalin! Buka Google Sheets & Paste`})]}),(0,O.jsx)(`button`,{onClick:()=>P(!1),style:{background:`transparent`,border:`none`,fontSize:`1.3rem`,cursor:`pointer`,color:`#64748b`}})]}),(0,O.jsxs)(`div`,{style:{background:`#ecfdf5`,border:`1.5px solid #10b981`,borderRadius:`12px`,padding:`16px`,marginBottom:`18px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`,color:`#065f46`,fontWeight:800,fontSize:`0.95rem`,marginBottom:`6px`},children:[(0,O.jsx)(se,{size:18,color:`#10b981`}),(0,O.jsx)(`span`,{children:`Data Siswa Bapak Tetap Aman & Tidak Hilang!`})]}),(0,O.jsxs)(`p`,{style:{margin:0,fontSize:`0.86rem`,color:`#047857`,lineHeight:1.5},children:[`Tautan `,(0,O.jsx)(`em`,{children:`sheets.new`}),` membuka dokumen baru yang masih kosong dari Google. Sebanyak `,(0,O.jsxs)(`strong`,{children:[K.length,` data nilai siswa`]}),` pada lembar ini sudah otomatis disalin ke memori komputer Anda.`]})]}),(0,O.jsxs)(`div`,{style:{background:`#f8fafc`,border:`1px solid #e2e8f0`,borderRadius:`12px`,padding:`16px`,marginBottom:`20px`,fontSize:`0.88rem`,lineHeight:1.6},children:[(0,O.jsx)(`div`,{style:{fontWeight:800,color:`#0f172a`,marginBottom:`8px`},children:`Langkah Mudah Menempelkan Data di Tab Google Sheets:`}),(0,O.jsxs)(`ol`,{style:{margin:0,paddingLeft:`20px`,display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,O.jsxs)(`li`,{children:[`Buka `,(0,O.jsx)(`strong`,{children:`tab baru Google Sheets`}),` yang baru saja terbuka di sebelah tab ini.`]}),(0,O.jsxs)(`li`,{children:[`Klik pada sel `,(0,O.jsx)(`strong`,{children:`A1`}),` (kotak paling kiri atas).`]}),(0,O.jsxs)(`li`,{children:[`Tekan tombol keyboard:`,(0,O.jsxs)(`div`,{style:{marginTop:`4px`},children:[(0,O.jsx)(`kbd`,{style:{background:`#e2e8f0`,border:`1px solid #cbd5e1`,padding:`3px 8px`,borderRadius:`6px`,fontWeight:800,color:`#0f172a`,fontFamily:`monospace`},children:`Cmd + V`}),` (di Mac) atau `,(0,O.jsx)(`kbd`,{style:{background:`#e2e8f0`,border:`1px solid #cbd5e1`,padding:`3px 8px`,borderRadius:`6px`,fontWeight:800,color:`#0f172a`,fontFamily:`monospace`},children:`Ctrl + V`}),` (di Windows).`]})]}),(0,O.jsx)(`li`,{children:`Selesai! Seluruh tabel nilai akan langsung tertempel rapi dengan kolom dan skor lengkap.`})]})]}),(0,O.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:(0,O.jsx)(`button`,{onClick:()=>P(!1),style:{padding:`10px 22px`,borderRadius:`8px`,background:`linear-gradient(135deg, #10b981 0%, #059669 100%)`,color:`#fff`,border:`none`,fontWeight:800,fontSize:`0.88rem`,cursor:`pointer`,boxShadow:`0 4px 12px rgba(16, 185, 129, 0.35)`},children:`Saya Mengerti, Tutup Panduan`})})]})}),Ve&&(0,O.jsx)(`div`,{style:{position:`fixed`,top:0,left:0,right:0,bottom:0,background:`rgba(0,0,0,0.75)`,zIndex:999999,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`20px`},children:(0,O.jsxs)(`div`,{className:`dashboard-card`,style:{width:`100%`,maxWidth:`580px`,background:`#ffffff`,borderRadius:`16px`,padding:`26px`,boxShadow:`0 20px 40px rgba(0,0,0,0.35)`,color:`#0f172a`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`18px`,borderBottom:`1px solid #e2e8f0`,paddingBottom:`12px`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,O.jsx)(le,{size:24,color:`#0284c7`}),(0,O.jsx)(`h3`,{style:{margin:0,fontSize:`1.2rem`,fontWeight:900,color:`#0f172a`},children:`Akses Google Sheets (SMKN 2 Depok)`})]}),(0,O.jsx)(`button`,{onClick:()=>F(!1),style:{background:`transparent`,border:`none`,fontSize:`1.3rem`,cursor:`pointer`,color:`#64748b`}})]}),(0,O.jsxs)(`p`,{style:{fontSize:`0.88rem`,color:`#475569`,lineHeight:1.5,margin:`0 0 18px 0`},children:[`Pilih cara membuka spreadsheet atau tautkan URL Google Spreadsheet yang biasa Anda gunakan agar tombol `,(0,O.jsx)(`strong`,{children:`Buka Google Sheets`}),` langsung menuju dokumen nilai Anda.`]}),(0,O.jsxs)(`div`,{style:{background:`#f8fafc`,border:`1.5px solid #cbd5e1`,borderRadius:`12px`,padding:`16px`,marginBottom:`16px`},children:[(0,O.jsx)(`label`,{style:{display:`block`,fontWeight:800,fontSize:`0.86rem`,color:`#0f172a`,marginBottom:`6px`},children:`Tautan Langsung Google Spreadsheet Anda:`}),(0,O.jsxs)(`div`,{style:{display:`flex`,gap:`8px`},children:[(0,O.jsx)(`input`,{type:`url`,placeholder:`https://docs.google.com/spreadsheets/d/.../edit`,value:V!==void 0&&V!==``?V:B,onChange:e=>H(e.target.value),style:{flex:1,padding:`9px 12px`,borderRadius:`8px`,border:`1.5px solid #94a3b8`,fontSize:`0.84rem`}}),(0,O.jsx)(`button`,{onClick:()=>{T.playClick();let e=V!==void 0&&V!==``?V:B;qe(e),e&&e.trim().startsWith(`http`)?(window.open(e.trim(),`_blank`),F(!1),U(`[OK] Tautan disimpan & Spreadsheet dibuka!`)):U(`[OK] Pengaturan tautan diperbarui!`)},style:{padding:`9px 16px`,borderRadius:`8px`,background:`#10b981`,color:`#ffffff`,border:`none`,fontWeight:800,fontSize:`0.82rem`,cursor:`pointer`,whiteSpace:`nowrap`},children:(0,O.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[`Simpan & Buka `,(0,O.jsx)(c,{size:13})]})})]}),(0,O.jsx)(`div`,{style:{fontSize:`0.75rem`,color:`#64748b`,marginTop:`6px`},children:`Tempelkan link file Spreadsheet Anda di sini. Tombol di toolbar akan langsung membuka file ini setiap kali diklik.`})]}),(0,O.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`10px`},children:[(0,O.jsx)(`div`,{style:{fontWeight:800,fontSize:`0.84rem`,color:`#334155`},children:`Atau Buka Cepat:`}),(0,O.jsxs)(`button`,{onClick:()=>{T.playClick(),window.open(`https://docs.google.com/spreadsheets/u/0/`,`_blank`),F(!1)},style:{width:`100%`,padding:`12px 16px`,borderRadius:`10px`,background:`rgba(2, 132, 199, 0.08)`,border:`1.5px solid #0284c7`,color:`#0369a1`,fontWeight:800,fontSize:`0.86rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`space-between`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,O.jsx)(m,{size:14}),(0,O.jsx)(`span`,{children:`Buka Beranda Google Sheets (docs.google.com)`})]}),(0,O.jsx)(c,{size:13})]}),(0,O.jsxs)(`button`,{onClick:()=>{F(!1),Je()},style:{width:`100%`,padding:`12px 16px`,borderRadius:`10px`,background:`rgba(16, 185, 129, 0.08)`,border:`1.5px solid #10b981`,color:`#065f46`,fontWeight:800,fontSize:`0.86rem`,cursor:`pointer`,display:`flex`,alignItems:`center`,justifyContent:`space-between`},children:[(0,O.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,O.jsx)(ce,{size:14}),(0,O.jsx)(`span`,{children:`Buat File Baru (sheets.new) & Salin Otomatis Tabel Ini`})]}),(0,O.jsx)(c,{size:13})]})]}),(0,O.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,marginTop:`20px`},children:(0,O.jsx)(`button`,{onClick:()=>F(!1),style:{padding:`8px 18px`,borderRadius:`8px`,background:`#e2e8f0`,color:`#475569`,border:`none`,fontWeight:700,fontSize:`0.84rem`,cursor:`pointer`},children:`Tutup`})})]})})]})};export{Me as default};
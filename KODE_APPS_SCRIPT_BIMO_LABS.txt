/**
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

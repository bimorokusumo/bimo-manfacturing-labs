/**
 * =============================================================================
 * BIMO MANUFACTURING LABS - GOOGLE APPS SCRIPT PENERIMA NILAI SISWA
 * =============================================================================
 * Skrip ini dipasang pada Google Spreadsheet guru untuk secara otomatis:
 * 1. Menerima kiriman nilai ujian/kuis dari website BIMO Manufacturing Labs.
 * 2. Membuat header kolom otomatis jika spreadsheet masih kosong.
 * 3. Memformat warna otomatis (Hijau untuk LULUS, Merah untuk REMEDIAL).
 * 4. Menyimpan data secara rapi dan real-time.
 *
 * CARA PEMASANGAN (1 - 2 MENIT):
 * 1. Buat Google Spreadsheet baru di https://sheets.new
 * 2. Beri nama file: "Rekap Nilai Siswa - Bimo Manufacturing Labs"
 * 3. Klik menu: Ekstensi (Extensions) > Apps Script
 * 4. Hapus seluruh isi kode bawaan, lalu Paste (Tempel) SELURUH KODE DI BAWAH INI.
 * 5. Klik tombol "Simpan" (ikon disket / Ctrl+S).
 * 6. Klik tombol biru "Terapkan" (Deploy) > "Penerapan baru" (New deployment).
 * 7. Pada ikon gerigi "Pilih jenis", pilih "Aplikasi web" (Web app).
 * 8. Konfigurasikan:
 *    - Deskripsi: Webhook Rekap Nilai Bimo Labs
 *    - Jalankan sebagai (Execute as): Saya (email Anda)
 *    - Yang memiliki akses (Who has access): Siapa saja (Anyone) -> WAJIB!
 * 9. Klik "Terapkan" (Deploy), berikan izin akses akun Google Anda jika diminta.
 * 10. Salin URL Aplikasi Web (Web App URL) yang berakhiran "/exec".
 * 11. Masukkan URL tersebut ke menu "Monitoring Nilai Guru" pada website Bimo Labs.
 * =============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Kunci script selama maksimal 30 detik untuk mencegah race condition jika banyak siswa submit bersamaan
  lock.tryLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // 1. Buat Header Otomatis jika Sheet masih kosong
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
        "Status",
        "Rincian Jawaban Siswa"
      ];
      sheet.appendRow(headers);

      // Styling Header Baris 1
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0f172a"); // Dark Navy/Slate
      headerRange.setFontColor("#f8fafc"); // White text
      headerRange.setFontWeight("bold");
      headerRange.setFontSize(10);
      headerRange.setHorizontalAlignment("center");
      headerRange.setVerticalAlignment("middle");
      sheet.setRowHeight(1, 38);
      sheet.setFrozenRows(1);

      // Set lebar kolom ideal
      sheet.setColumnWidth(1, 180); // Waktu
      sheet.setColumnWidth(2, 220); // Nama
      sheet.setColumnWidth(3, 90);  // Absen
      sheet.setColumnWidth(4, 130); // Kelas
      sheet.setColumnWidth(5, 180); // Sekolah
      sheet.setColumnWidth(6, 170); // Modul
      sheet.setColumnWidth(7, 240); // Judul Kuis
      sheet.setColumnWidth(8, 110); // Nilai
      sheet.setColumnWidth(9, 110); // Benar
      sheet.setColumnWidth(10, 100); // Total
      sheet.setColumnWidth(11, 110); // Status
      sheet.setColumnWidth(12, 280); // Detail Jawaban
    }

    // 2. Parse Data yang Dikirim dari Web
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
    var judulKuis = data.judulKuis || "-";
    var skor = Number(data.skor !== undefined ? data.skor : 0);
    var jawabanBenar = data.jawabanBenar !== undefined ? data.jawabanBenar : "-";
    var totalSoal = data.totalSoal !== undefined ? data.totalSoal : "-";
    var status = data.status || (skor >= 75 ? "LULUS" : "REMEDIAL");
    var detailJawaban = typeof data.detailJawaban === 'object' ? JSON.stringify(data.detailJawaban) : String(data.detailJawaban || "-");

    // 3. Tambahkan baris baru
    sheet.appendRow([
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
    ]);

    var lastRow = sheet.getLastRow();
    sheet.setRowHeight(lastRow, 28);

    // Styling baris data baru
    var rowRange = sheet.getRange(lastRow, 1, 1, 12);
    rowRange.setFontSize(9);
    rowRange.setVerticalAlignment("middle");

    // Alignment spesifik
    sheet.getRange(lastRow, 3).setHorizontalAlignment("center"); // Absen
    sheet.getRange(lastRow, 4).setHorizontalAlignment("center"); // Kelas
    sheet.getRange(lastRow, 8).setHorizontalAlignment("center"); // Nilai
    sheet.getRange(lastRow, 9).setHorizontalAlignment("center"); // Benar
    sheet.getRange(lastRow, 10).setHorizontalAlignment("center"); // Total
    sheet.getRange(lastRow, 11).setHorizontalAlignment("center"); // Status

    // Pewarnaan nilai & kelulusan
    var scoreCell = sheet.getRange(lastRow, 8);
    var statusCell = sheet.getRange(lastRow, 11);
    scoreCell.setFontWeight("bold");
    statusCell.setFontWeight("bold");

    if (skor >= 75) {
      statusCell.setBackground("#dcfce7"); // Light Green
      statusCell.setFontColor("#166534"); // Dark Green
      scoreCell.setFontColor("#16a34a");
    } else {
      statusCell.setBackground("#fee2e2"); // Light Red
      statusCell.setFontColor("#991b1b"); // Dark Red
      scoreCell.setFontColor("#dc2626");
    }

    // 4. Catat juga secara otomatis ke Tab Sheet Khusus untuk Kuis ini
    try {
      var quizTabName = judulKuis.length > 50 ? judulKuis.substring(0, 47) + "..." : judulKuis;
      quizTabName = quizTabName.replace(/[:\\/?*\[\]]/g, "-").trim();
      
      var quizSheet = ss.getSheetByName(quizTabName);
      if (!quizSheet) {
        quizSheet = ss.insertSheet(quizTabName);
        var qHeaders = [
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
        quizSheet.appendRow(qHeaders);
        var qHRange = quizSheet.getRange(1, 1, 1, qHeaders.length);
        qHRange.setBackground("#064e3b");
        qHRange.setFontColor("#ffffff");
        qHRange.setFontWeight("bold");
        qHRange.setHorizontalAlignment("center");
        quizSheet.setRowHeight(1, 35);
        quizSheet.setFrozenRows(1);
      }

      quizSheet.appendRow([
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
      ]);

      var qLastRow = quizSheet.getLastRow();
      quizSheet.setRowHeight(qLastRow, 26);
      var qScoreCell = quizSheet.getRange(qLastRow, 8);
      var qStatusCell = quizSheet.getRange(qLastRow, 11);
      qScoreCell.setFontWeight("bold");
      qStatusCell.setFontWeight("bold");
      qScoreCell.setHorizontalAlignment("center");
      qStatusCell.setHorizontalAlignment("center");

      if (skor >= 75) {
        qStatusCell.setBackground("#dcfce7");
        qStatusCell.setFontColor("#166534");
        qScoreCell.setFontColor("#16a34a");
      } else {
        qStatusCell.setBackground("#fee2e2");
        qStatusCell.setFontColor("#991b1b");
        qScoreCell.setFontColor("#dc2626");
      }
    } catch (eQuiz) {
      // Abaikan jika ada batasan penamaan tab
    }

    // Kembalikan respons sukses
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

// Handler untuk tes koneksi via browser biasa (GET)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Google Apps Script BIMO Manufacturing Labs aktif & siap menerima data nilai siswa."
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * =============================================================================
 * MENU OTOMATIS BIMO LABS PADA GOOGLE SHEETS
 * =============================================================================
 * Menu ini akan muncul secara otomatis di baris atas Google Sheets (sebelah menu Bantuan)
 * setiap kali Bapak membuka dokumen Spreadsheet.
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('⚡ Menu BIMO Labs')
      .addItem('📊 1. Klasifikasikan Nilai per Tab Kuis (Otomatis)', 'rapikanDanPisahkanKuisOtomatis')
      .addItem('📋 2. Buat Matriks Rekap Pengumpulan Siswa', 'buatMatriksRekapPengumpulan')
      .addSeparator()
      .addItem('ℹ️ Panduan Pemakaian', 'tampilkanPanduan')
      .addToUi();
  } catch (e) {
    // Abaikan jika dibuka dalam konteks web service
  }
}

function tampilkanPanduan() {
  var pesan = "CARA MENGGUNAKAN MENU BIMO LABS:\n\n" +
    "1. Klik menu '📊 1. Klasifikasikan Nilai per Tab Kuis':\n" +
    "   Sistem akan otomatis membuat tab khusus untuk masing-masing kuis (seperti '🛡️ Inspeksi APD', '📋 JSA Pengeboran', dll) dan mengelompokkan siswa yang sudah mengumpulkan tugas tersebut.\n\n" +
    "2. Klik menu '📋 2. Buat Matriks Rekap Pengumpulan Siswa':\n" +
    "   Sistem akan membuat tabel rekap utama yang memperlihatkan daftar seluruh siswa beserta ceklis kuis mana yang sudah dikumpulkan dan mana yang belum.\n\n" +
    "Semua data nilai dan riwayat siswa dijamin 100% aman dan tidak akan terhapus.";
  SpreadsheetApp.getUi().alert("Panduan Menu BIMO Labs", pesan, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * =============================================================================
 * FUNGSI 1: KLASIFIKASIKAN SELURUH DATA KE TAB NAMA KUIS MASING-MASING
 * =============================================================================
 */
function rapikanDanPisahkanKuisOtomatis() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var allRows = getAllDataRows(ss);

  if (allRows.length === 0) {
    SpreadsheetApp.getUi().alert("Belum ada data nilai siswa yang tersimpan di spreadsheet.");
    return;
  }

  // Kelompokkan baris berdasarkan Nama Kuis (Kolom G / indeks 6)
  var groups = {};
  allRows.forEach(function(row) {
    var quizTitle = String(row[6] || "").trim();
    if (!quizTitle || quizTitle.toLowerCase().indexOf("percobaan") !== -1) return;

    var tabName = getCleanTabName(quizTitle);

    if (!groups[tabName]) {
      groups[tabName] = {
        title: quizTitle,
        rows: []
      };
    }
    groups[tabName].rows.push(row);
  });

  var groupKeys = Object.keys(groups);
  if (groupKeys.length === 0) {
    SpreadsheetApp.getUi().alert("Tidak ditemukan nama kuis yang valid untuk diklasifikasikan.");
    return;
  }

  // Buat Sheet untuk tiap kelompok kuis
  groupKeys.forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    } else {
      sheet.clear();
    }

    var quizTitle = groups[tabName].title;
    var items = groups[tabName].rows;

    // Urutkan siswa berdasarkan No. Absen jika angka, atau Nama Siswa
    items.sort(function(a, b) {
      var numA = parseInt(a[2], 10);
      var numB = parseInt(b[2], 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a[1]).localeCompare(String(b[1]));
    });

    var totalCount = items.length;
    var passedCount = items.filter(function(r) { return Number(r[7] || 0) >= 75; }).length;
    var avgScore = totalCount > 0 ? Math.round(items.reduce(function(acc, curr) { return acc + Number(curr[7] || 0); }, 0) / totalCount) : 0;

    // BARIS 1: BANNER JUDUL KUIS & DAFTAR SISWA YANG MENGUMPULKAN
    sheet.appendRow(["📋 DAFTAR SISWA YANG SUDAH MENGUMPULKAN: " + quizTitle.toUpperCase()]);
    var b1 = sheet.getRange(1, 1, 1, 11);
    b1.merge();
    b1.setBackground("#064e3b");
    b1.setFontColor("#ffffff");
    b1.setFontWeight("bold");
    b1.setFontSize(11);
    b1.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 38);

    // BARIS 2: STATISTIK RINGKAS
    sheet.appendRow([
      "Total Siswa Mengumpulkan: " + totalCount + " Siswa  |  Lulus KKM (>=75): " + passedCount + " Siswa  |  Remedial: " + (totalCount - passedCount) + " Siswa  |  Rata-rata Nilai: " + avgScore + " / 100"
    ]);
    var b2 = sheet.getRange(2, 1, 1, 11);
    b2.merge();
    b2.setBackground("#0f766e");
    b2.setFontColor("#ecfdf5");
    b2.setFontWeight("bold");
    b2.setFontSize(9);
    b2.setVerticalAlignment("middle");
    sheet.setRowHeight(2, 28);

    // BARIS 3: HEADER TABEL
    var headers = [
      "No",
      "Waktu Pengumpulan",
      "Nama Lengkap Siswa",
      "No. Absen",
      "Kelas / Jurusan",
      "Sekolah / Instansi",
      "Modul Laboratorium",
      "Nilai (0 - 100)",
      "Benar / Total",
      "Status KKM",
      "Rincian Jawaban Siswa"
    ];
    sheet.appendRow(headers);

    var hRange = sheet.getRange(3, 1, 1, headers.length);
    hRange.setBackground("#1e293b");
    hRange.setFontColor("#ffffff");
    hRange.setFontWeight("bold");
    hRange.setFontSize(9);
    hRange.setHorizontalAlignment("center");
    hRange.setVerticalAlignment("middle");
    sheet.setRowHeight(3, 32);
    sheet.setFrozenRows(3);

    // BARIS 4+: DATA SISWA
    var no = 1;
    items.forEach(function(r) {
      var score = Number(r[7] || 0);
      var correct = r[8] !== undefined ? r[8] : "-";
      var total = r[9] !== undefined ? r[9] : "-";
      var status = r[10] || (score >= 75 ? "LULUS" : "REMEDIAL");
      var detail = r[11] || "-";

      sheet.appendRow([
        no++,
        r[0], // Waktu
        r[1], // Nama
        r[2], // Absen
        r[3], // Kelas
        r[4], // Sekolah
        r[5], // Modul
        score,
        correct + " / " + total,
        status,
        detail
      ]);

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

    // Atur Lebar Kolom yang Nyaman Dibaca
    sheet.setColumnWidth(1, 45);  // No
    sheet.setColumnWidth(2, 160); // Waktu
    sheet.setColumnWidth(3, 230); // Nama Lengkap
    sheet.setColumnWidth(4, 85);  // Absen
    sheet.setColumnWidth(5, 110); // Kelas
    sheet.setColumnWidth(6, 160); // Sekolah
    sheet.setColumnWidth(7, 150); // Modul
    sheet.setColumnWidth(8, 100); // Nilai
    sheet.setColumnWidth(9, 100); // Benar/Total
    sheet.setColumnWidth(10, 110); // Status
    sheet.setColumnWidth(11, 280); // Detail
  });

  // Otomatis buat juga lembar Matriks Rekap Pengumpulan Siswa
  buatMatriksRekapPengumpulan();

  SpreadsheetApp.getUi().alert("✅ Berhasil!\n\nSeluruh nilai siswa berhasil diklasifikasikan ke tab masing-masing kuis (Inspeksi APD, Penyusunan JSA, dll) dan lembar '📊 Matriks Rekap Pengumpulan' sudah selesai dibuat.");
}

/**
 * =============================================================================
 * FUNGSI 2: BUAT MATRIKS REKAP PENGUMPULAN SISWA (CEKLIS KELENGKAPAN TUGAS)
 * =============================================================================
 */
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
      studentsMap[studentKey] = {
        nama: nama,
        absen: absen,
        kelas: kelas,
        scores: {}
      };
    } else {
      if (studentsMap[studentKey].absen === "-" && absen !== "-") {
        studentsMap[studentKey].absen = absen;
      }
      if (studentsMap[studentKey].kelas === "-" && kelas !== "-") {
        studentsMap[studentKey].kelas = kelas;
      }
    }

    if (studentsMap[studentKey].scores[judulKuis] === undefined || skor > studentsMap[studentKey].scores[judulKuis].skor) {
      studentsMap[studentKey].scores[judulKuis] = {
        skor: skor,
        waktu: String(r[0] || "")
      };
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
  if (!sheet) {
    sheet = ss.insertSheet(matrixSheetName, 0);
  } else {
    sheet.clear();
  }

  // Header matriks
  var matrixHeaders = ["No", "Nama Lengkap Siswa", "No. Absen", "Kelas / Jurusan"];
  quizList.forEach(function(q) {
    matrixHeaders.push(getCleanTabName(q));
  });
  matrixHeaders.push("Total Selesai");
  matrixHeaders.push("Rata-rata Nilai");
  matrixHeaders.push("Status Kelengkapan");

  sheet.appendRow(matrixHeaders);

  var hRange = sheet.getRange(1, 1, 1, matrixHeaders.length);
  hRange.setBackground("#0f172a");
  hRange.setFontColor("#ffffff");
  hRange.setFontWeight("bold");
  hRange.setFontSize(9);
  hRange.setHorizontalAlignment("center");
  hRange.setVerticalAlignment("middle");
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
      var colIdx = 5 + c;
      var cell = sheet.getRange(lr, colIdx);
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

    var compCell = sheet.getRange(lr, matrixHeaders.length);
    compCell.setFontWeight("bold");
    if (finishedCount === quizList.length) {
      compCell.setBackground("#dcfce7");
      compCell.setFontColor("#166534");
    } else {
      compCell.setBackground("#fef3c7");
      compCell.setFontColor("#92400e");
    }
  });

  sheet.setColumnWidth(1, 45);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 85);
  sheet.setColumnWidth(4, 110);
  for (var i = 0; i < quizList.length; i++) {
    sheet.setColumnWidth(5 + i, 180);
  }
  sheet.setColumnWidth(matrixHeaders.length - 2, 130);
  sheet.setColumnWidth(matrixHeaders.length - 1, 100);
  sheet.setColumnWidth(matrixHeaders.length, 140);
}

/**
 * Helper: Ambil nama tab yang ramah dan representatif
 */
function getCleanTabName(quizTitle) {
  var q = String(quizTitle || "").toLowerCase();
  if (q.indexOf("inspeksi apd") !== -1 || q.indexOf("apd") !== -1) {
    return "🛡️ Inspeksi APD";
  }
  if (q.indexOf("jsa") !== -1 || q.indexOf("job safety analysis") !== -1) {
    return "📋 JSA Pengeboran Pelat";
  }
  if (q.indexOf("apar") !== -1 || q.indexOf("kebakaran") !== -1) {
    return "🧯 Kuis APAR PASS";
  }
  if (q.indexOf("5r") !== -1 || q.indexOf("budaya") !== -1) {
    return "✨ Budaya Kerja 5R";
  }
  if (q.indexOf("perkakas") !== -1 || q.indexOf("bench") !== -1) {
    return "🔧 Perkakas Tangan";
  }
  if (q.indexOf("diagnostik") !== -1) {
    return "📝 Tes Diagnostik";
  }
  if (q.indexOf("evaluasi") !== -1) {
    return "🎓 Evaluasi Akhir";
  }
  var clean = quizTitle.replace(/[:\\/?*\[\]]/g, "-").trim();
  return clean.length > 35 ? clean.substring(0, 32) + "..." : clean;
}

/**
 * Helper: Ambil seluruh data baris siswa dari spreadsheet tanpa duplikasi
 */
function getAllDataRows(ss) {
  var allRows = [];
  var seenIds = {};
  var sheets = ss.getSheets();

  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    if (name.indexOf("📊 Matriks") !== -1) return;

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    // Temukan baris header (bisa baris 1 atau 3 jika ada banner)
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

      // Jika format baris memiliki kolom No di awal
      if (typeof row[0] === "number" && isNaN(new Date(row[1]).getTime())) {
        studentName = String(row[2] || "").trim();
        quizTitle = String(row[6] || "").trim();
      }

      if (studentName && quizTitle && studentName.toLowerCase().indexOf("percobaan") === -1) {
        var uniqueId = studentName.toLowerCase() + "_" + quizTitle.toLowerCase();
        if (!seenIds[uniqueId]) {
          seenIds[uniqueId] = true;
          allRows.push(row);
        }
      }
    }
  });

  // Fallback jika belum terdeteksi dari multi-sheet
  if (allRows.length === 0) {
    var curData = ss.getActiveSheet().getDataRange().getValues();
    for (var i = 1; i < curData.length; i++) {
      if (curData[i][1] && String(curData[i][1]).toLowerCase().indexOf("percobaan") === -1) {
        allRows.push(curData[i]);
      }
    }
  }

  return allRows;
}

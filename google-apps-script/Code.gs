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
 * FUNGSI 1-KLIK UNTUK GURU: RAPIIKAN & PISAHKAN SEMUA KUIS KE TAB SENDIRI-SENDIRI
 * =============================================================================
 * Cara Pakai:
 * 1. Di Google Sheets, buka menu: Ekstensi > Apps Script
 * 2. Di bagian atas editor Apps Script, pilih fungsi: "rapikanDanPisahkanKuisOtomatis"
 * 3. Klik tombol "Jalankan" (Run).
 * 4. Selesai! Seluruh baris di lembar "1. Safety Lab K3" akan otomatis dipisahkan
 *    ke dalam tab khusus masing-masing kuis (Inspeksi APD, JSA, dll) secara rapi!
 * =============================================================================
 */
function rapikanDanPisahkanKuisOtomatis() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var masterSheet = ss.getSheetByName("1. Safety Lab K3") || ss.getActiveSheet();
  var dataRange = masterSheet.getDataRange();
  var values = dataRange.getValues();

  if (values.length <= 1) {
    SpreadsheetApp.getUi().alert("Data masih kosong atau hanya baris header.");
    return;
  }

  var headers = values[0];
  var rows = values.slice(1);

  // Kelompokkan baris berdasarkan Nama Kuis (Kolom G / indeks 6)
  var groups = {};
  rows.forEach(function(row) {
    var quizTitle = String(row[6] || "").trim();
    if (!quizTitle) return;

    var tabName = quizTitle.length > 50 ? quizTitle.substring(0, 47) + "..." : quizTitle;
    tabName = tabName.replace(/[:\\/?*\[\]]/g, "-").trim();

    if (!groups[tabName]) {
      groups[tabName] = {
        title: quizTitle,
        rows: []
      };
    }
    groups[tabName].rows.push(row);
  });

  // Buat Sheet untuk tiap kelompok kuis
  Object.keys(groups).forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    } else {
      sheet.clear();
    }

    // Pasang Header
    sheet.appendRow(headers);
    var hRange = sheet.getRange(1, 1, 1, headers.length);
    hRange.setBackground("#064e3b");
    hRange.setFontColor("#ffffff");
    hRange.setFontWeight("bold");
    hRange.setHorizontalAlignment("center");
    sheet.setRowHeight(1, 35);
    sheet.setFrozenRows(1);

    // Urutkan siswa berdasarkan nama (Kolom B / indeks 1)
    var items = groups[tabName].rows;
    items.sort(function(a, b) {
      return String(a[1]).localeCompare(String(b[1]));
    });

    items.forEach(function(r) {
      sheet.appendRow(r);
      var lr = sheet.getLastRow();
      sheet.setRowHeight(lr, 26);

      var score = Number(r[7]);
      var scCell = sheet.getRange(lr, 8);
      var stCell = sheet.getRange(lr, 11);
      scCell.setFontWeight("bold");
      stCell.setFontWeight("bold");
      scCell.setHorizontalAlignment("center");
      stCell.setHorizontalAlignment("center");

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

    for (var col = 1; col <= Math.min(headers.length, 12); col++) {
      try { sheet.autoResizeColumn(col); } catch (e) {}
    }
  });

  SpreadsheetApp.getUi().alert("Berhasil! Seluruh data nilai sudah otomatis dipisahkan ke tab masing-masing kuis.");
}

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

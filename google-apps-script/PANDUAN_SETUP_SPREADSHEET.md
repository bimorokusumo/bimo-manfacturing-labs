# PANDUAN INTEGRASI GOOGLE SPREADSHEET (REKAP NILAI SISWA)
## BIMO VIRTUAL MANUFACTURING LABS

Panduan ini ditujukan bagi **Bapak/Ibu Guru** untuk menyiapkan Google Spreadsheet otomatis agar nilai seluruh kuis dan asesmen praktikum siswa terekam secara rapi dan real-time.

---

### Langkah 1: Buat File Google Spreadsheet Baru
1. Buka browser dan buka tautan: **[https://sheets.new](https://sheets.new)** (atau buka Google Drive lalu buat Spreadsheet Baru).
2. Beri nama spreadsheet Anda, contohnya:  
   `Rekap Nilai Siswa - Bimo Manufacturing Labs`

---

### Langkah 2: Buka Apps Script
1. Pada menu atas spreadsheet Anda, klik **Ekstensi** (atau *Extensions* jika bahasa Inggris) ➔ pilih **Apps Script**.
2. Akan terbuka tab baru berupa editor kode Google Apps Script.

---

### Langkah 3: Tempel Kode Penerima Nilai
1. Hapus seluruh isi kode bawaan (`function myFunction() { ... }`) di editor hingga kosong.
2. Buka file **`google-apps-script/Code.gs`** (atau klik tombol **"Salin Kode Apps Script"** di menu *Monitoring Nilai Guru* pada website).
3. **Paste (Tempel)** seluruh kodenya ke editor Apps Script.
4. Tekan tombol **Simpan** (ikon disket atau shortcut `Ctrl + S` / `Cmd + S`).

---

### Langkah 4: Terapkan Sebagai Aplikasi Web (Deploy as Web App)
1. Di pojok kanan atas editor Apps Script, klik tombol biru **Terapkan** (*Deploy*) ➔ pilih **Penerapan baru** (*New deployment*).
2. Di jendela yang muncul, klik ikon **Roda Gigi (⚙️)** di sebelah "Pilih jenis", lalu pilih **Aplikasi web** (*Web app*).
3. Isi kolom pengaturan berikut:
   - **Deskripsi**: `Webhook Nilai Bimo Labs`
   - **Jalankan sebagai** (*Execute as*): **Saya** (*Me - email Anda*)
   - **Yang memiliki akses** (*Who has access*): **Siapa saja** (*Anyone*) ⚠️ **WAJIB DIPILIH AGAR SISWA BISA MENGIRIM NILAI**
4. Klik tombol **Terapkan** (*Deploy*).
5. Jika muncul permintaan izin (*Authorization required*):
   - Klik **Tinjau Izin** (*Review Permissions*).
   - Pilih akun Google Anda.
   - Jika muncul peringatan *"Google hasn't verified this app"*, klik **Lanjutan** (*Advanced*) di bagian bawah, lalu klik **Buka [Nama Script] (tidak aman)** / *Go to Untitled project (unsafe)*.
   - Klik **Izinkan** (*Allow*).
6. Google akan memberikan **URL Aplikasi Web** (berakhiran `/exec`), contoh:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. Klik **Salin** (*Copy*) URL tersebut.

---

### Langkah 5: Hubungkan ke Website BIMO Labs
1. Buka website **BIMO Manufacturing Labs**.
2. Masuk ke menu sidebar: **"Monitoring Nilai Guru"** (atau klik ikon profil di Header).
3. Klik tombol **"⚙️ Konfigurasi Spreadsheet"**.
4. Tempelkan (*Paste*) URL Web App yang tadi disalin.
5. Klik **"Simpan & Uji Koneksi"**.
6. Sistem akan otomatis mengirimkan satu baris data uji coba ke Spreadsheet Anda! Buka spreadsheet Anda, baris data uji coba beserta header warna akan langsung terbuat secara otomatis.

---

### Fitur Otomatis Spreadsheet yang Disediakan:
- Header kolom otomatis berlatar Navy gelap dengan teks putih.
- Nilai siswa ≥ 75 otomatis berstatus **LULUS** dengan latar **Hijau**.
- Nilai siswa < 75 otomatis berstatus **REMEDIAL** dengan latar **Merah**.
- Pencatatan waktu real-time format Indonesia (WIB).
- Dilengkapi kunci script (*lock service*) sehingga aman digunakan oleh puluhan siswa serentak tanpa tabrakan data.

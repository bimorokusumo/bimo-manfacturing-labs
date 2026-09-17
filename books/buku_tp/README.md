# 📖 Buku Digital Interaktif: Dasar-Dasar Keahlian Teknik Pemesinan (TP)
## Fase E (Kelas X) SMK Negeri 2 Depok Sleman
### Pendekatan Kurikulum Deep Learning (50 Halaman Lengkap)

Disusun oleh: **Bimoro Kusumo, S.Pd**  
Program Pendidikan Profesi Guru (PPG) 2025/2026  
SMK Negeri 2 Depok Sleman, D.I. Yogyakarta

---

## 🌟 Keunggulan Utama Buku Digital

1. **Struktur Lengkap 50 Halaman Konkret**:
   - Memuat 6 Elemen CP & ATP Teknik Pemesinan secara mendalam, dari etika bengkel, K3LH, material science, metrologi, gambar teknik ISO, sistem mekanik, hingga revolusi Industri 4.0 dan technopreneurship.
   - Dilengkapi ratusan foto industri nyata, ilustrasi mikroskopik, dan diagram teknis SVG beresolusi tinggi.

2. **Integrasi Penuh Kurikulum Deep Learning**:
   - Berpijak pada **3 Pilar Filosofis**: *Mindful Learning* (Berkesadaran), *Meaningful Learning* (Bermakna), dan *Joyful Learning* (Menggembirakan).
   - Menerapkan **Siklus 3 Tahap**: *Memahami (Understand)*, *Mengaplikasikan (Apply)*, dan *Merefleksi (Reflect)* di setiap bab pembelajaran.
   - Murni berlandaskan paradigma Kurikulum Deep Learning (Mindful, Meaningful, Joyful Learning).

3. **Dual Reading Mode (2 Mode Membaca Cerdas)**:
   - **Mode 3D Flip Book**: Tampilan layaknya buku fisik nyata dengan efek kedalaman perspektif, bayangan punggung buku (*spine shadow*), lipatan sudut halaman (*corner curls*), dan suara lembaran kertas alami (*procedural paper rustle sound* via Web Audio API).
   - **Mode Smart Continuous Reader**: Alur membaca vertikal terus-menerus tanpa batasan lembaran spread, dilengkapi *sticky header* dan *jump dropdown* 50 halaman.

4. **Interaktivitas Fisik & Sentuhan Lembaran**:
   - **Klik Langsung di Mana Saja**:
     - Klik sampul depan langsung membuka buku.
     - Klik di sembarang area halaman kanan untuk membalik ke lembaran berikutnya (*next*).
     - Klik di sembarang area halaman kiri atau sudut lipatan untuk membalik ke lembaran sebelumnya (*prev*).
     - Elemen interaktif internal (slider, tombol, canvas) dilindungi dari picuan pembalik halaman yang tidak disengaja.

5. **Laboratorium Virtual & Simulator Sains Mesin**:
   - **Simulator Jangka Sorong (Vernier Caliper 0,05 mm)**: Dilengkapi mistar geser interaktif, pembacaan resolusi, tombol intip nilai, dan mini challenge acak.
   - **Kalkulator Parameter Pemotongan Mesin Bubut**: Menghitung RPM spindel secara dinamis dengan rumus $n = (1000 \cdot Cs) / (\pi \cdot d)$ lengkap dengan selector material benda kerja, material pahat (HSS vs Karbida), dan snapping gear shift mesin bubut nyata.
   - **Simulator Proyeksi Ortogonal ISO**: Menampilkan perbandingan dinamis Kuadran I (Eropa) vs Kuadran III (Amerika).
   - **Simulator Dekoder Kode Bearing ISO**: Menguraikan tipe bearing (6205-2RS, 6308-ZZ, 30206), diameter poros, pelindung seal, dan batas kelonggaran.
   - **Inspektor APD Interaktif Pemesinan**: Membedakan APD wajib bengkel mesin serta menegaskan **larangan penggunaan sarung tangan** pada mesin berputar (bubut, gurdi).
   - **Papan Audit Budaya Kerja 5R / 5S**: Checklist visual interaktif Ringkas, Rapi, Resik, Rawat, Rajin.

6. **Evaluasi Formatif Terpadu & Sertifikat Digital**:
   - Kuis interaktif pada Bab 1 hingga Bab 6 dengan skoring instan.
   - Sertifikat Kelulusan Resmi Digital ber-QR Code dengan verifikasi Kepala Sekolah **Dodot Yuliantoro, S.Pd., M.T.** dan Guru Pengampu **Bimoro Kusumo, S.Pd**, siap cetak PDF / print.

---

## 🚀 Cara Menjalankan Buku Digital

### Cara 1: Menggunakan Script Peluncur (Rekomendasi)
Buka terminal pada folder ini dan jalankan:
```bash
./buka_buku.sh
```
Script akan otomatis menyalakan server lokal di `http://localhost:8080` dan membukanya di browser bawaan Anda.

### Cara 2: Membuka File Langsung
Klik dua kali file `index.html` pada file manager / Finder untuk membukanya di Google Chrome, Safari, atau Firefox.

---

## 📂 Struktur Berkas
- `index.html`: Berkas inti buku digital 50 halaman lengkap.
- `css/styles.css`: Gaya tata letak 3D flip book, typography, reader mode, dan responsivitas.
- `css/interactives.css`: Gaya komponen interaktif simulator, kuis, APD inspector, dan sertifikat.
- `js/flipbook.js`: Engine pembalik halaman 3D, gesture swipe, dan direct page-click navigation.
- `js/audio.js`: Sintesis audio Web Audio API dan Speech Synthesis bahasa Indonesia.
- `js/simulators.js`: Logika komputasi simulator (Caliper, Lathe RPM, Proyeksi, Bearing, APD, 5R).
- `js/quiz.js`: Bank soal formatif Bab 1–6 dan generator sertifikat kelulusan digital.
- `js/app.js`: Manajemen modal daftar isi, pencarian instan 50 halaman, dan tema.
- `assets/images/`: Ratusan foto industri resolusi tinggi.
- `assets/svg/`: Diagram teknis vektor presisi mesin bubut, transmisi, tegangan-regangan, dan proyeksi.

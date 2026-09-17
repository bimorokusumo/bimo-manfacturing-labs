import React, { Suspense, useState, useEffect, useMemo, Component } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, GizmoHelper, GizmoViewcube } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';

// ==========================================
// DATA INFORMASI AREA PEMESINAN (BUBUT & FRAIS)
// ==========================================
const MACHINING_DATA = {
  'lathe-chuck': {
    id: 'lathe-chuck',
    category: 'Mesin Bubut',
    badgeColor: '#2563eb',
    position: [-7.16, 1.67, 1.09],
    title: 'Chuck (Cekam 3-Rahang)',
    subtitle: '3-Jaw Self-Centering Scroll Chuck',
    spec: 'Diameter 200mm, Scroll Mandrel Presisi',
    description: 'Cekam rahang tiga (self-centering scroll chuck) berfungsi untuk memegang dan memusatkan benda kerja silindris secara otomatis saat diputar oleh poros spindel utama dengan konsentrisitas tinggi.',
    sop: '1. Masukkan kunci chuck ke lubang pinion.\n2. Buka rahang sesuai diameter benda kerja.\n3. Kencangkan kunci chuck secara merata.\n4. WAJIB mencabut kunci chuck sebelum sakelar spindel dihidupkan!',
    k3: 'BAHAYA FATAL: Kunci chuck yang tertinggal dapat terlempar saat mesin berputar dan menyebabkan cedera berat. Selalu periksa chuck sebelum menekan tombol start.'
  },
  'lathe-toolpost': {
    id: 'lathe-toolpost',
    category: 'Mesin Bubut',
    badgeColor: '#2563eb',
    position: [-5.8, 1.45, 1.1],
    title: 'Tool Post & Pahat Bubut',
    subtitle: 'Quick Change 4-Way Tool Post',
    spec: 'Pahat Karbida Indexable Insert ISO Standar',
    description: 'Rumah pahat (tool post) berfungsi menjepit pahat bubut dengan kuat pada ketinggian tepat setinggi sumbu senter mesin. Pahat karbida digunakan untuk pembubutan muka (facing), rata (turning), dan alur.',
    sop: '1. Pasang pahat dengan ganjal plat hingga ujung sayat tepat setinggi senter kepala lepas.\n2. Kencangkan baut pengikat secara diagonal.\n3. Jangan memanjangkan pahat melebihi 1.5 kali tebal badannya.',
    k3: 'Gunakan kacamata pelindung (safety glasses). Jauhkan tangan dari bram/tatal yang berputar saat pemakanan.'
  },
  'lathe-carriage': {
    id: 'lathe-carriage',
    category: 'Mesin Bubut',
    badgeColor: '#2563eb',
    position: [-4.42, 0.99, 1.01],
    title: 'Eretan (Carriage & Cross Slide)',
    subtitle: 'Eretan Memanjang, Melintang & Eretan Atas',
    spec: 'Resolusi Nonius 0.02 mm, Dovetail Guideway',
    description: 'Kombinasi eretan memanjang (longitudinal), eretan melintang (cross slide), dan eretan atas (compound rest). Berfungsi mengatur posisi dan gerak pemakanan (feeding) pahat secara manual maupun otomatis.',
    sop: '1. Putar handwheel untuk memposisikan pahat.\n2. Kalibrasi cincin nonius ke angka 0 saat ujung pahat menyentuh permukaan benda kerja.\n3. Putar eretan atas jika ingin membubut tirus sudut tertentu.',
    k3: 'Pastikan jalur eretan bersih dari tatal logam dan lumasi guideway sebelum dan sesudah pengoperasian.'
  },
  'lathe-tailstock': {
    id: 'lathe-tailstock',
    category: 'Mesin Bubut',
    badgeColor: '#2563eb',
    position: [-2.79, 1.67, 0.63],
    title: 'Tailstock (Kepala Lepas)',
    subtitle: 'Tailstock Assembly with Live Center',
    spec: 'Tirus Morse Taper MT3, Stroke Selongsong 100mm',
    description: 'Kepala lepas dapat digeser di sepanjang alas (bed) mesin bubut. Berfungsi untuk menyokong ujung benda kerja panjang menggunakan center putar (live center) atau memegang chuck bor untuk pengeboran senter.',
    sop: '1. Geser tailstock mendekati ujung benda kerja dan kunci tuas klem dasar.\n2. Putar handwheel selongsong hingga center masuk ke lubang senter benda kerja.\n3. Kunci tuas pengunci selongsong quill.',
    k3: 'Berikan pelumas pada center mati jika tidak menggunakan center putar agar gesekan tidak membakar ujung benda kerja.'
  },
  'lathe-headstock': {
    id: 'lathe-headstock',
    category: 'Mesin Bubut',
    badgeColor: '#2563eb',
    position: [-8.49, 0.72, 0.63],
    title: 'Headstock (Kepala Tetap)',
    subtitle: 'All-Geared Headstock & Speed Selector',
    spec: 'Rentang RPM 45 - 2000 RPM, Gearbox Reduksi Oli',
    description: 'Kepala tetap menampung spindel utama dan kotak roda gigi (gearbox) pengatur variasi kecepatan putar. Mengubah putaran motor listrik menjadi torsi kuat untuk menyayat berbagai jenis material logam.',
    sop: '1. Tentukan putaran RPM berdasarkan rumus cutting speed material.\n2. Pindahkan tuas pengatur kecepatan HANYA saat motor dalam kondisi BERHENTI sempurna.\n3. Putar sedikit chuck dengan tangan jika gigi transmisi belum pas.',
    k3: 'JANGAN PERNAH memindahkan tuas kecepatan saat spindel masih berputar karena akan mematahkan gigi transmisi!'
  },
  'lathe-leadscrew': {
    id: 'lathe-leadscrew',
    category: 'Mesin Bubut',
    badgeColor: '#2563eb',
    position: [-4.5, 0.65, 1.4],
    title: 'Poros Transportir & Pembawa',
    subtitle: 'Lead Screw & Feed Shaft Mechanism',
    spec: 'Ulir Trapesium Acme Pitch 6mm & Poros Heksagonal',
    description: 'Poros transportir (lead screw) digunakan untuk menggerakkan eretan secara otomatis saat proses pembuatan ulir (threading). Poros pembawa digunakan untuk gerak pemakanan otomatis pembubutan rata.',
    sop: '1. Pilih kisar ulir pada tabel kotak roda gigi (norton box).\n2. Hubungkan tuas mur belah (half-nut lever) saat ingin membubut ulir.\n3. Gunakan handle otomatis eretan untuk pembubutan halus.',
    k3: 'Jangan menyentuh poros yang sedang berputar. Pastikan kancing lengan baju wearpack terpasang rapi.'
  },
  'lathe-chippan': {
    id: 'lathe-chippan',
    category: 'Mesin Bubut',
    badgeColor: '#2563eb',
    position: [-5.5, 0.35, 0.4],
    title: 'Bak Tatal & Sistem Coolant',
    subtitle: 'Chip Collector Pan & Coolant Pump',
    spec: 'Kapasitas Pompa 40 L/menit, Emulsi Coolant 5%',
    description: 'Bak penampung serpihan/tatal logam (chips/bram) di bawah bed mesin, dilengkapi saringan dan sirkulasi pompa pendingin untuk mendinginkan pahat dan menyerap panas selama pemotongan intensif.',
    sop: '1. Periksa volume air coolant di tangki penampung.\n2. Arahkan selang pendingin tepat pada titik potong mata pahat.\n3. Bersihkan tatal dari bak menggunakan serokan tatal, jangan dengan tangan telanjang.',
    k3: 'Gunakan kaitan tatal (chip hook) untuk menarik tatal panjang yang melilit. Tatal logam sangat panas dan tajam.'
  },

  // --- MESIN FRAIS (MILLING) ---
  'mill-spindle': {
    id: 'mill-spindle',
    category: 'Mesin Frais',
    badgeColor: '#d97706',
    position: [5.5, 3.1, 1.3],
    title: 'Spindel & Collet Chuck Frais',
    subtitle: 'Milling Spindle Nose & Endmill Cutter',
    spec: 'Standar ISO 40 / R8, Collet ER32, Endmill 4-Flute',
    description: 'Spindel mesin frais vertikal memutar pisau frais (endmill, face mill) dengan kecepatan tinggi dan presisi run-out di bawah 0.01mm. Pisau frais menyayat permukaan benda kerja menjadi alur, bidang rata, atau kontur.',
    sop: '1. Bersihkan tirus spindel dan arbor sebelum dipasang.\n2. Pasang pisau endmill pada collet ER32 lalu kencangkan kunci arbor.\n3. Kunci drawbar di bagian atas spindel dengan torsi yang tepat.',
    k3: 'Dilarang keras memakai sarung tangan saat mengoperasikan mesin frais karena dapat tersangkut putaran pisau cutter.'
  },
  'mill-table': {
    id: 'mill-table',
    category: 'Mesin Frais',
    badgeColor: '#d97706',
    position: [5.5, 2.5, 0.9],
    title: 'Meja Mesin Frais Alur T',
    subtitle: 'T-Slot Precision Milling Worktable',
    spec: 'Dimensi 1250 x 300 mm, 3 Alur T 18mm Presisi',
    description: 'Meja kerja tempat mengikat benda kerja atau ragum mesin menggunakan klem baut T (T-bolts). Dapat bergerak horizontal pada sumbu memanjang (X) dan sumbu melintang (Y) secara presisi.',
    sop: '1. Bersihkan alur T dari bram logam sebelum memasang baut T.\n2. Sejajarkan bibir ragum dengan dial indicator sebelum pengencangan final.\n3. Beri alas pelat paralel di bawah benda kerja untuk mencegah meja tergores cutter.',
    k3: 'Jangan meletakkan perkakas keras sembarangan di atas permukaan meja agar tidak menciderai kerataan meja kerja presisi.'
  },
  'mill-vise': {
    id: 'mill-vise',
    category: 'Mesin Frais',
    badgeColor: '#d97706',
    position: [5.5, 2.85, 0.9],
    title: 'Ragum Mesin Frais Presisi',
    subtitle: 'Precision Milling Machine Vise',
    spec: 'Lebar Rahang 160mm, Rahang Baja Keras HRC 58-62',
    description: 'Ragum khusus mesin pemesinan berstruktur kaku tinggi yang dirancang untuk menahan gaya potong dinamis dari pisau frais tanpa goyah atau bergeser selama proses pengefraisan berlangsung.',
    sop: '1. Pasang dua balok paralel (parallel blocks) di dasar ragum.\n2. Letakkan benda kerja dan jepit dengan tuas ragum.\n3. Ketok perlahan benda kerja dengan palu plastik/kuningan agar duduk rata sempurna pada balok paralel.',
    k3: 'Pastikan tuas ragum dilepas dari poros ragum setelah penjepitan selesai agar tidak berputar liar membentur tiang mesin.'
  },
  'mill-knee': {
    id: 'mill-knee',
    category: 'Mesin Frais',
    badgeColor: '#d97706',
    position: [5.5, 1.6, 0.8],
    title: 'Sadel & Lutut (Knee) Mesin',
    subtitle: 'Saddle & Knee Vertical Elevation Column',
    spec: 'Stroke Vertikal 400mm, Ulir Teleskopik Pelumas Otomatis',
    description: 'Lutut (knee) menopang sadel dan meja frais pada tiang vertikal. Menaikkan dan menurunkan seluruh rakitan meja pada sumbu Z untuk mengatur kedalaman pemakanan secara akurat.',
    sop: '1. Kendorkan tuas klem pengunci lutut pada tiang sebelum menaik-turunkan meja.\n2. Putar handle pemutar elevasi lutut searah jarum jam untuk menaikkan meja.\n3. Kencangkan kembali klem pengunci lutut setelah posisi kedalaman tercapai.',
    k3: 'Jangan pernah membiarkan tuas pengunci lutut dalam keadaan kendor saat proses pemakanan pemotongan berlangsung.'
  },
  'mill-handwheels': {
    id: 'mill-handwheels',
    category: 'Mesin Frais',
    badgeColor: '#d97706',
    position: [7.8, 2.4, 0.9],
    title: 'Roda Pemutar Eretan X, Y, Z',
    subtitle: 'Graduated Micrometer Dials & Handwheels',
    spec: 'Graduasi Cincin Nonius 0.02 mm / 0.001 inch',
    description: 'Roda pemutar manual sumbu X (longitudinal), sumbu Y (cross), dan sumbu Z (vertikal). Dilengkapi cincin skala nonius bergraduasi presisi yang dapat dinolkan (zero-set) untuk mengukur pergeseran pemakanan.',
    sop: '1. Putar roda pemutar perlahan mendekati benda kerja.\n2. Saat pisau menyentuh permukaan benda (zeroing), tahan handle dan putar cincin skala ke angka nol.\n3. Berikan kedalaman pemakanan sesuai angka strip pada nonius.',
    k3: 'Perhatikan arah putaran untuk menghindari benturan mendadak antara pisau frais dengan ragum mesin.'
  },
  'mill-motor': {
    id: 'mill-motor',
    category: 'Mesin Frais',
    badgeColor: '#d97706',
    position: [5.5, 4.6, 1.1],
    title: 'Motor & Kepala Vertikal Frais',
    subtitle: 'Milling Head Drive Motor & Step Pulley',
    spec: 'Motor 3 HP 3-Fasa, Kecepatan 80 - 4500 RPM',
    description: 'Kepala vertikal mesin frais dapat diputar miring (swivel) sudut ±45° untuk pengefraisan miring. Digerakkan motor 3-fasa dengan sabuk atau gearbox transmisi untuk menghasilkan putaran stabil.',
    sop: '1. Periksa sakelar putaran (Forward / Reverse) sesuai arah putaran pisau frais.\n2. Ubah kombinasi sabuk atau tuas gigi kecepatan saat motor mati.\n3. Gunakan tuas penggerak quill untuk pemakanan vertikal manual.',
    k3: 'Pastikan penutup sabuk transmisi (pulley belt guard) terpasang rapat sebelum menghidupkan motor listrik.'
  },
  'mill-estop': {
    id: 'mill-estop',
    category: 'Keselamatan K3',
    badgeColor: '#dc2626',
    position: [4.2, 2.8, 1.4],
    title: 'Tombol Emergency Stop',
    subtitle: 'Industrial Mushroom Push-Lock Safety Button',
    spec: 'Standar IEC 60947-5-5, Kontak Pemutus Seketika',
    description: 'Sakelar pengaman darurat berukuran besar berbentuk jamur merah. Berfungsi memutus suplai listrik ke seluruh motor penggerak secara instan saat terjadi bahaya atau insiden kerja.',
    sop: '1. Tekan tombol merah kuat-kuat jika terjadi getaran abnormal atau benda kerja lepas.\n2. Mesin akan terkunci seketika dalam keadaan mati.\n3. Untuk me-reset, putar kepala tombol searah jarum jam hingga meletup keluar.',
    k3: 'Kenali lokasi tombol E-Stop sebelum mulai mengoperasikan mesin bubut maupun mesin frais!'
  },

  // --- PROPS BENGKEL MESIN ---
  'shop-toolcart': {
    id: 'shop-toolcart',
    category: 'Perlengkapan Bengkel',
    badgeColor: '#059669',
    position: [-10.5, 0.9, -2.5],
    title: 'Lemari Perkakas Mesin',
    subtitle: 'Heavy Duty Machine Tool Cabinet & Cart',
    spec: 'Rangka Baja 1.5mm, 5 Laci Berpelor, Kunci Pengaman',
    description: 'Lemari kabinet perkakas pemesinan untuk menyimpan kunci chuck, arbor, mata bor morse, collet chuck ER, dial indicator, jangka sorong, micrometer sekrup, dan kotak insert karbida secara teratur.',
    sop: '1. Ambil perkakas sesuai kebutuhan praktikum.\n2. Bersihkan perkakas dari cairan pendingin/oli sebelum disimpan kembali.\n3. Kembalikan perkakas ke slot berbusa (foam tray) masing-masing.',
    k3: 'Tutup laci kabinet setelah mengambil alat agar tidak menjadi rintangan jalur lalu lintas bengkel.'
  },
  'shop-rawstock': {
    id: 'shop-rawstock',
    category: 'Perlengkapan Bengkel',
    badgeColor: '#059669',
    position: [10.5, 1.2, -2.5],
    title: 'Rak Bahan Baku Logam',
    subtitle: 'Raw Stock Metal Bar & Billet Storage',
    spec: 'Baja St.37, Baja Karbon S45C, Aluminium 6061',
    description: 'Tempat penyimpanan material mentah logam berbentuk poros silinder pejal, pipa baja, dan balok aluminium yang siap dipotong untuk praktikum pembubutan dan pengefraisan.',
    sop: '1. Ukur dan tandai panjang bahan menggunakan penggores dan siku.\n2. Potong bahan menggunakan gergaji mesin (bandsaw / power hacksaw).\n3. Berikan kode warna pada ujung bahan sesuai grade materialnya.',
    k3: 'Gunakan sarung tangan saat mengangkat bahan baku mentah untuk menghindari luka sayat dari ujung bahan yang tajam.'
  },
  'shop-scrapbin': {
    id: 'shop-scrapbin',
    category: 'Fasilitas K3',
    badgeColor: '#475569',
    position: [0, 0.6, -4.5],
    title: 'Bak Penampung Bram Logam',
    subtitle: 'Metal Scrap & Chip Recycling Bin',
    spec: 'Kapasitas 150 Liter, Roda Kastor, Saluran Tiris Oli',
    description: 'Tempat pengumpulan serpihan bram/tatal sisa penyayatan mesin bubut dan frais. Dilengkapi dasar berlubang untuk meniriskan sisa cairan pendingin sebelum bram dikirim ke unit daur ulang.',
    sop: '1. Kumpulkan bram dari bak mesin menggunakan serokan tatal.\n2. Masukkan bram ke bak pembuangan.\n3. Pisahkan antara tatal baja dan tatal aluminium/kuningan.',
    k3: 'DILARANG memegang atau menekan tatal bram dengan tangan langsung karena sangat tajam dan panas.'
  },
  'shop-k3sign': {
    id: 'shop-k3sign',
    category: 'Keselamatan K3',
    badgeColor: '#dc2626',
    position: [0, 3.8, -6.9],
    title: 'Papan SOP & Rambu K3 Bengkel',
    subtitle: 'Occupational Safety & Health Regulation Board',
    spec: 'Standar ISO 45001 & Permenaker No. 05/2018',
    description: 'Pedoman keselamatan bengkel pemesinan: Wajib memakai kacamata safety, sepatu keselamatan bersol baja, baju kerja (wearpack), rambut rapi, serta DILARANG memakai perhiasan, jam tangan, dan sarung tangan.',
    sop: '1. Baca dan pahami instruksi kerja SOP sebelum menghidupkan mesin.\n2. Gunakan seluruh APD standar bengkel pemesinan.\n3. Jika terjadi keraguan atau kendala teknis, segera lapor ke guru pembimbing/instruktur.',
    k3: 'Keselamatan Kerja (Safety First) adalah prioritas nomor satu dalam setiap aktivitas pemesinan manufaktur.'
  }
};

// ==========================================
// DATA INFORMASI AREA KERJA BANGKU (BENCHWORK)
// ==========================================
const BENCHWORK_DATA = {
  'bench-vise-1': {
    id: 'bench-vise-1',
    category: 'Kerja Bangku',
    badgeColor: '#059669',
    position: [-2.8, 1.25, -4.55],
    title: 'Ragum Meja (Stasiun Kerja 1)',
    subtitle: 'Heavy Duty Bench Vise with Swivel Base',
    spec: 'Lebar Rahang 150mm, Bukaan 200mm, Besi Cor Nodular',
    description: 'Ragum meja kokoh yang dibaut kencang pada meja kerja bangku. Berfungsi menjepit benda kerja secara kaku pada ketinggian siku operator saat mengikir, menggergaji, memahat, atau mengetap.',
    sop: '1. Putar tuas T untuk membuka rahang penjepit.\n2. Pasang pelat pelindung rahang (soft jaws dari tembaga/aluminium) jika menjepit benda kerja yang sudah dihaluskan.\n3. Jepit benda kerja di tengah-tengah rahang secara seimbang.',
    k3: 'Jangan memukul tuas ragum dengan palu untuk mengencangkan karena dapat meretakkan ulir transportir ragum.'
  },
  'bench-vise-2': {
    id: 'bench-vise-2',
    category: 'Kerja Bangku',
    badgeColor: '#059669',
    position: [0, 1.25, -4.55],
    title: 'Ragum Meja Utama & Benda Kerja',
    subtitle: 'Bench Vise Station with Active Workpiece',
    spec: 'Benda Kerja Balok Baja St.37 dengan Garis Ukur Tata Letak',
    description: 'Stasiun ragum utama tempat praktikan melakukan latihan mengikir rata dan siku. Benda kerja dijepit dengan proyeksi keluar sekitar 10-15 mm di atas rahang agar tidak bergetar saat dikikir.',
    sop: '1. Atur ketinggian kerja tepat setinggi siku operator (posisi ergonomis).\n2. Berdirilah dengan kuda-kuda kokoh (kaki kiri di depan bagi yang tidak kidal).\n3. Dorong kikir dengan tekanan stabil ke depan.',
    k3: 'Gunakan kacamata pelindung agar serbuk gram logam tidak memercik ke mata saat mengikir dan membersihkan benda kerja.'
  },
  'bench-vise-3': {
    id: 'bench-vise-3',
    category: 'Kerja Bangku',
    badgeColor: '#059669',
    position: [2.8, 1.25, -4.55],
    title: 'Ragum Meja (Stasiun Kerja 3)',
    subtitle: 'Parallel Bench Vise with Anvil Horn',
    spec: 'Landasan Pukul Anvil Belakang, Dudukan Putar 360°',
    description: 'Ragum paralel stasiun ketiga dilengkapi landasan anvil kecil di bagian belakang untuk pekerjaan pengetokan ringan, pelurusan kawat/pelat, dan pemukulan penitik pemusat lubang bor.',
    sop: '1. Gunakan landasan anvil belakang hanya untuk pukulan ringan.\n2. Jangan gunakan landasan geser silinder sebagai tempat memukul.\n3. Berikan gemuk pelumas pada ulir ulir ragum secara berkala.',
    k3: 'Pastikan klem putar pengunci dasar meja ragum terkunci kencang sebelum memulai pemotongan atau pengetokan.'
  },
  'bench-surfaceplate': {
    id: 'bench-surfaceplate',
    category: 'Alat Ukur & Inspeksi',
    badgeColor: '#4f46e5',
    position: [6.0, 1.05, -5.4],
    title: 'Meja Perata Granit Presisi',
    subtitle: 'Precision Black Granite Surface Plate',
    spec: 'Ukuran 800 x 600 x 120 mm, Standar DIN 876 Grade 0',
    description: 'Landasan referensi bidang datar presisi tinggi dari batu granit hitam alam yang tidak dapat berkarat dan tahan perubahan suhu. Digunakan sebagai bidang dasar untuk melukis benda kerja dan pengukuran ketinggian.',
    sop: '1. Bersihkan permukaan granit dari debu menggunakan kain pembersih halus dan cairan cleaner khusus.\n2. Letakkan alat ukur dan benda kerja perlahan tanpa membantingnya.\n3. Tutup kembali dengan cover pelindung setelah selesai digunakan.',
    k3: 'DILARANG KERAS memukul, menitik, atau mengikir benda kerja di atas meja perata granit!'
  },
  'bench-heightgauge': {
    id: 'bench-heightgauge',
    category: 'Alat Ukur & Inspeksi',
    badgeColor: '#4f46e5',
    position: [5.7, 1.55, -5.6],
    title: 'Jangka Sorong Ketinggian',
    subtitle: 'Vernier Height Gauge with Carbide Scriber',
    spec: 'Rentang Ukur 0 - 300 mm, Ketelitian Nonius 0.02 mm',
    description: 'Alat ukur presisi berkaki landasan berat yang meluncur di atas meja perata. Dilengkapi ujung penggores karbida untuk mengukur tinggi dan melukis garis ketinggian presisi pada benda kerja.',
    sop: '1. Gerakkan landasan height gauge dengan menekan lembut dasar kakinya pada permukaan meja granit.\n2. Tempelkan ujung penggores pada benda kerja, kunci klem halus, lalu setel mikrometer sekrup.\n3. Goreskan garis perlahan searah gerakan stabil.',
    k3: 'Hindari benturan pada ujung jarum penggores karbida karena material karbida getas dan mudah cuil.'
  },
  'bench-vblock': {
    id: 'bench-vblock',
    category: 'Alat Ukur & Inspeksi',
    badgeColor: '#4f46e5',
    position: [6.4, 1.25, -5.2],
    title: 'Balok V Presisi & Klem',
    subtitle: 'Precision Matched Pair V-Blocks with Clamp',
    spec: 'Sudut V 90°, Baja Perkakas Dikeraskan HRC 60',
    description: 'Balok baja presisi dengan alur bersudut 90 derajat berpasangan. Berfungsi untuk menumpu dan memegang benda kerja silindris bulat agar stabil saat diukur, dilukis garis senter, atau dititik.',
    sop: '1. Bersihkan alur V dari kotoran sebelum meletakkan poros silinder.\n2. Pasang klem berbentuk busur untuk mengunci poros bila diperlukan.\n3. Putar poros perlahan untuk memeriksa kebulatan menggunakan dial indicator.',
    k3: 'Simpan sepasang balok V dalam satu kotak penyimpanan kayu agar tidak saling berbenturan.'
  },
  'bench-flatfile': {
    id: 'bench-flatfile',
    category: 'Perkakas Tangan',
    badgeColor: '#d97706',
    position: [-3.2, 3.7, -6.83],
    title: 'Kikir Pipih (Flat File)',
    subtitle: 'Flat Bastard & Smooth File with Wood Handle',
    spec: 'Panjang 10 - 12 Inch, Gigi Ganda (Double Cut)',
    description: 'Kikir berpenampang persegi panjang tipis dengan gigi ganda di kedua sisinya. Berfungsi untuk meratakan dan mengurangi ketebalan permukaan bidang datar logam secara luas.',
    sop: '1. Pegang gagang kikir dengan tangan kanan, telapak tangan kiri menekan ujung kikir.\n2. Dorong kikir lurus ke depan dengan tekanan stabil (penyayatan hanya terjadi saat dorongan maju).\n3. Angkat sedikit kikir saat ditarik mundur.',
    k3: 'JANGAN PERNAH menggunakan kikir tanpa gagang kayu/plastik! Tangkai kikir yang lancip dapat menusuk telapak tangan Anda.'
  },
  'bench-halfroundfile': {
    id: 'bench-halfroundfile',
    category: 'Perkakas Tangan',
    badgeColor: '#d97706',
    position: [-2.2, 3.7, -6.83],
    title: 'Kikir Setengah Bulat',
    subtitle: 'Half-Round Bastard & Smooth File',
    spec: 'Sisi Rata & Sisi Radius Lengkung Konveks',
    description: 'Kikir serbaguna dengan satu sisi datar dan satu sisi melengkung cembung. Sisi melengkung digunakan untuk mengikir permukaan cekung bagian dalam pipa atau lubang beradius besar.',
    sop: '1. Gunakan sisi cembung dengan gerakan maju sambil sedikit diputar (rocking motion) mengikuti radius lengkungan.\n2. Bersihkan gigi kikir secara berkala dengan sikat kikir.\n3. Periksa kelengkungan dengan mal radius.',
    k3: 'Pastikan gagang kikir terpasang kencang dan tidak goyang.'
  },
  'bench-roundfile': {
    id: 'bench-roundfile',
    category: 'Perkakas Tangan',
    badgeColor: '#d97706',
    position: [-1.2, 3.7, -6.83],
    title: 'Kikir Bulat (Round File)',
    subtitle: 'Round / Rat-tail File with Single Cut',
    spec: 'Penampang Silinder Tirus Berujung Runcing',
    description: 'Sering disebut kikir ekor tikus (rat-tail file). Berpenampang bundar tirus yang digunakan khusus untuk memperbesar lubang silinder bulat atau menghaluskan alur cekung yang sempit.',
    sop: '1. Masukkan kikir ke dalam lubang benda kerja.\n2. Dorong maju sambil memutar kikir searah jarum jam untuk menghasilkan permukaan lubang yang halus dan bulat.\n3. Hindari menekan terlalu keras pada ujung kikir yang tirus.',
    k3: 'Jangan menggunakan kikir sebagai pengungkit (lever) karena kikir terbuat dari baja keras yang sangat getas dan mudah patah.'
  },
  'bench-trianglefile': {
    id: 'bench-trianglefile',
    category: 'Perkakas Tangan',
    badgeColor: '#d97706',
    position: [-0.2, 3.7, -6.83],
    title: 'Kikir Segitiga (Triangular File)',
    subtitle: 'Three-Square / Triangular Machinist File',
    spec: 'Penampang Segitiga Sama Sisi Sudut 60°',
    description: 'Kikir berbentuk penampang segitiga dengan ketiga sudut 60 derajat. Sangat efektif untuk meratakan sudut lancip, alur pasak V, alur ekor burung, dan memperbaiki puncak ulir sekrup yang rusak.',
    sop: '1. Pasang salah satu rusuk kikir tepat di sudut dalam benda kerja.\n2. Dorong lurus ke depan dengan menjaga sudut kikir tetap tegak lurus alur.\n3. Jangan biarkan rusuk kikir memotong bagian yang tidak diinginkan.',
    k3: 'Selalu bersihkan tatal bram yang menyumbat dengan sikat kikir kuningan.'
  },
  'bench-hacksaw': {
    id: 'bench-hacksaw',
    category: 'Perkakas Tangan',
    badgeColor: '#d97706',
    position: [1.2, 3.8, -6.83],
    title: 'Gergaji Besi (Hacksaw)',
    subtitle: 'Adjustable Steel Frame Hacksaw 24 TPI',
    spec: 'Rangka Pipa Baja Krom, Daun Gergaji Bi-Metal 300mm',
    description: 'Gergaji tangan untuk memotong profil logam batangan atau pelat. Menggunakan daun gergaji baja berkekuatan tinggi dengan kerapatan gigi 18 hingga 24 TPI (Teeth Per Inch).',
    sop: '1. Pasang daun gergaji dengan arah gigi menghadap ke depan (menjauhi pegangan).\n2. Kencangkan baut sayap (wing nut) hingga daun gergaji berbunyi dentang nyaring saat dipetik.\n3. Mulai pemotongan dengan membuat takikan awal dibantu ibu jari.\n4. Potong dengan kecepatan stabil sekitar 40 - 50 langkah per menit.',
    k3: 'Kurangi tekanan saat pemotongan hampir putus agar benda kerja tidak jatuh mendadak mengenai kaki.'
  },
  'bench-hammer': {
    id: 'bench-hammer',
    category: 'Perkakas Tangan',
    badgeColor: '#d97706',
    position: [2.4, 3.8, -6.83],
    title: 'Palu Konde (Ball-Peen Hammer)',
    subtitle: 'Forged Steel Ball-Peen Hammer (0.5 - 1.0 lb)',
    spec: 'Kepala Baja Tempa, Gagang Kayu Hickory / Fiber',
    description: 'Palu standar mekanik perkakas. Kepala datar digunakan untuk memukul penitik, pahat dingin, dan meluruskan pelat. Kepala bulat (konde) digunakan khusus untuk mengeling (riveting) dan membentuk lengkungan pelat.',
    sop: '1. Pegang ujung gagang palu untuk mendapatkan daya ayun maksimal.\n2. Arahkan mata tepat pada sasaran pukulan.\n3. Pukul dengan ayunan pergelangan tangan dan siku secara teratur.',
    k3: 'Periksa pasak pengunci kepala palu! Dilarang memakai palu dengan gagang longgar atau kepala berjamur (mushroom head).'
  },
  'bench-mallet': {
    id: 'bench-mallet',
    category: 'Perkakas Tangan',
    badgeColor: '#d97706',
    position: [3.4, 3.8, -6.83],
    title: 'Palu Lunak Karet / Plastik',
    subtitle: 'Dual-Face Soft Mallet (Rubber / Polyurethane)',
    spec: 'Diameter Kepala 40mm, Anti-Rebound Deadblow',
    description: 'Palu dengan kepala lunak dari karet keras atau nilon sintetis. Digunakan untuk mengetok benda kerja presisi pada ragum mesin agar duduk rata di atas balok paralel tanpa menimbulkan goresan atau deformasi.',
    sop: '1. Pilih sisi karet untuk ketokan empuk atau sisi nilon untuk benturan sedikit lebih kaku.\n2. Ketuk bagian atas benda kerja di ragum secara merata.\n3. Periksa kerapatan balok paralel di bawahnya (bila tidak bisa digeser dengan tangan, berarti sudah duduk rata).',
    k3: 'Jangan gunakan palu lunak untuk memukul penitik atau pahat dingin berbahan baja keras.'
  },
  'bench-centerpunch': {
    id: 'bench-centerpunch',
    category: 'Alat Penanda',
    badgeColor: '#db2777',
    position: [-3.2, 2.85, -6.83],
    title: 'Penitik Pusat & Penitik Garis',
    subtitle: 'Center Punch (90°) & Prick Punch (60°)',
    spec: 'Baja Perkakas Dikeraskan HRC 55-58, Badan Knurling',
    description: 'Penitik garis (60°) digunakan untuk memperjelas garis goresan tata letak. Penitik pusat (90°) membuat lubang kerucut yang lebih lebar sebagai panduan ujung mata bor agar bor tidak meleset saat mulai mengebor.',
    sop: '1. Tempelkan ujung penitik miring pada perpotongan garis gores, lalu tegakkan penitik 90° terhadap benda kerja.\n2. Pukul kepala penitik sekali secara tegak lurus menggunakan palu konde.\n3. Periksa posisi titik menggunakan kaca pembesar bila perlu.',
    k3: 'Gerinda kembali ujung penitik bila tumpul dan selalu kenakan kacamata safety saat memukul penitik.'
  },
  'bench-scriber': {
    id: 'bench-scriber',
    category: 'Alat Penanda',
    badgeColor: '#db2777',
    position: [-2.2, 2.85, -6.83],
    title: 'Penggores Baja Karbida (Scriber)',
    subtitle: 'Tungsten Carbide Tipped Engineer\'s Scriber',
    spec: 'Panjang 150mm, Jarum Karbida Tajam, Gagang Berulir',
    description: 'Berfungsi seperti pena mekanik untuk melukis garis ukuran pada permukaan benda kerja logam. Ujungnya terbuat dari baja keras atau tungsten carbide sehingga mampu menggores logam dengan garis tipis dan tajam.',
    sop: '1. Rapatkan bilah siku baja atau mistar baja pada garis ukuran.\n2. Miringkan penggores sekitar 15° ke arah gerakan goresan sambil menempel rapat pada bilah panduan.\n3. Goreskan garis hanya satu kali dengan tekanan mantap.',
    k3: 'Jangan mengantongi penggores tanpa tutup pelindung di saku baju karena ujung jarumnya dapat menusuk tubuh.'
  },
  'bench-trysquare': {
    id: 'bench-trysquare',
    category: 'Alat Ukur & Inspeksi',
    badgeColor: '#4f46e5',
    position: [-1.2, 2.85, -6.83],
    title: 'Siku Baja Presisi 90° (Try Square)',
    subtitle: 'Engineer\'s Precision Try Square Standar 90°',
    spec: 'Bilah Baja Stainless 150mm, Toleransi Sudut Grade 1',
    description: 'Alat pemeriksa kesikuan sudut 90 derajat dan kerataan permukaan bidang benda kerja hasil pengikiran. Menggunakan metode celah cahaya (light gap inspection) untuk mendeteksi penyimpangan mikro.',
    sop: '1. Bersihkan benda kerja dan bilah siku dari serbuk bram kikir.\n2. Tempelkan landasan tebal siku pada bidang referensi benda kerja.\n3. Turunkan bilah tipis siku hingga menyentuh bidang yang diuji dan amati celah cahaya di baliknya.',
    k3: 'Jangan menjatuhkan siku baja ke lantai! Benturan keras akan merusak ketepatan sudut 90 derajat.'
  },
  'bench-tap': {
    id: 'bench-tap',
    category: 'Perkakas Pembuat Ulir',
    badgeColor: '#7c3aed',
    position: [0, 2.85, -6.83],
    title: 'Set Tap & Tangkai Tap (Tap Wrench)',
    subtitle: 'Hand Tap Set (M3 - M12) with Adjustable Wrench',
    spec: 'Set 3 Nomor: No.1 (Taper), No.2 (Plug), No.3 (Bottoming)',
    description: 'Set perkakas untuk membuat ulir dalam secara manual pada lubang yang telah dibor. Tangkai tap lurus menjepit ujung kotak tap untuk memutar tap secara tegak lurus.',
    sop: '1. Pastikan lubang bor sesuai rumus diameter tap (D_bor = D_nominal - Pitch).\n2. Mulai dengan Tap No.1, putar 1/2 putaran maju lalu putar 1/4 putaran mundur untuk mematahkan tatal bram.\n3. Berikan pelumas pemotongan (cutting oil) secara kontinyu.',
    k3: 'Jaga posisi tap selalu tegak lurus (90°) dengan permukaan benda. Tap yang miring akan terjepit dan mudah patah di dalam lubang.'
  },
  'bench-die': {
    id: 'bench-die',
    category: 'Perkakas Pembuat Ulir',
    badgeColor: '#7c3aed',
    position: [1.2, 2.85, -6.83],
    title: 'Set Snei & Tangkai Snei (Die Stock)',
    subtitle: 'Circular Split Die & Die Stock Holder',
    spec: 'Baja Cepat HSS Metris, Dilengkapi Baut Setel Celah',
    description: 'Snei bulat terbelah (circular split die) berfungsi untuk membuat ulir luar (drat baut) manual pada poros silindris. Tangkai snei dilengkapi tiga baut pengatur kedalaman pemakanan ulir.',
    sop: '1. Chamfer ujung poros silinder dengan kemiringan 45° agar snei mudah masuk.\n2. Letakkan sisi tirus snei menghadap ke bawah menuju ujung poros.\n3. Putar bolak-balik dengan ritme maju-mundur dan beri pelumas oli.',
    k3: 'Kencangkan baut pengunci tangkai snei pada alur cekung snei agar snei tidak berputar di dalam rumahnya.'
  },
  'bench-filecard': {
    id: 'bench-filecard',
    category: 'Perawatan Perkakas',
    badgeColor: '#059669',
    position: [2.2, 2.85, -6.83],
    title: 'Sikat Pembersih Kikir (File Card)',
    subtitle: 'Brass Wire File Card Cleaner & Scraper Pick',
    spec: 'Kawat Kuningan Halus Anti-Aus, Papan Kayu Ergonomis',
    description: 'Papan sikat berbulu kawat logam halus yang dirancang khusus untuk membersihkan serpihan tatal gram (pinning) yang terselip pada celah gigi-gigi kikir agar kikir kembali tajam dan tidak menggores benda kerja.',
    sop: '1. Letakkan kikir di atas meja kerja bangku.\n2. Sikat permukaan kikir searah kemiringan alur gigi kikir (jangan disikat berlawanan).\n3. Gunakan kawat tembaga runcing pada pegangan sikat untuk mencongkel bram yang membandel.',
    k3: 'Membersihkan kikir secara teratur memperpanjang usia pakai kikir dan mencegah goresan kasar pada benda kerja presisi.'
  },
  'bench-chisel': {
    id: 'bench-chisel',
    category: 'Perkakas Tangan',
    badgeColor: '#d97706',
    position: [3.2, 2.85, -6.83],
    title: 'Pahat Dingin / Pahat Pelat (Cold Chisel)',
    subtitle: 'Flat Cold Chisel for Metal Cutting',
    spec: 'Baja Paduan Chrome-Vanadium, Sudut Baji Potong 60°',
    description: 'Pahat baja berujung pipih tajam yang digunakan untuk memotong pelat logam tipis, membuang tonjolan las berlebih, dan membelah baut berkarat dengan bantuan pukulan palu konde.',
    sop: '1. Pasang pelindung tangan dari karet pada badan pahat.\n2. Posisikan sudut mata pahat sekitar 30° - 35° terhadap permukaan benda kerja.\n3. Pandangan mata harus tertuju pada ujung mata potong pahat, bukan pada kepala pahat!',
    k3: 'Waspada serpihan logam yang terlempar! WAJIB mengenakan kacamata pelindung safety glasses saat memahat.'
  },
  'bench-safety': {
    id: 'bench-safety',
    category: 'Fasilitas K3',
    badgeColor: '#dc2626',
    position: [4.2, 3.4, -6.83],
    title: 'Stasiun APD Kerja Bangku',
    subtitle: 'Personal Protective Equipment (PPE) Station',
    spec: 'Kacamata Polikarbonat ANSI Z87.1, Sarung Tangan Kulit/Katun',
    description: 'Stasiun penyimpanan perlengkapan keselamatan kerja bangku: Kacamata pelindung benturan serpihan gram, penutup telinga (ear plug), dan sarung tangan katun tebal (diperbolehkan khusus pada kerja bangku manual untuk mencegah sayatan).',
    sop: '1. Ambil kacamata safety dan bersihkan lensanya dengan lap microfiber.\n2. Kenakan kacamata safety selama berada di area kerja bangku.\n3. Gunakan sarung tangan hanya saat memegang benda panas atau pelat beram tajam.',
    k3: 'INGAT: Sarung tangan HANYA untuk kerja bangku manual. DILARANG KERAS dipakai di mesin bubut atau frais yang berputar!'
  }
};

// ==========================================
// FUNGSI SUARA TEXT-TO-SPEECH
// ==========================================
const speakText = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\n*#-]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// ==========================================
// KOMPONEN INTERAKTIF ALAT / KOMPONEN 3D
// (Langsung klik pada komponen, tanpa titik menutupi)
// ==========================================
const InteractivePart = ({ data, onSelect, isActive, children, labelOffset = [0, 0.4, 0], hitArgs = null, hitPosition = [0, 0, 0] }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {children}

      {/* Hitbox transparan pembantu klik */}
      {hitArgs && (
        <mesh position={hitPosition}>
          <boxGeometry args={hitArgs} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* Garis wireframe penanda halus saat disorot kursor atau aktif */}
      {(hovered || isActive) && hitArgs && (
        <mesh position={hitPosition}>
          <boxGeometry args={hitArgs} />
          <meshBasicMaterial
            color={isActive ? '#dc2626' : '#2563eb'}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Label Tooltip Bersih (Hanya muncul saat disorot / aktif) */}
      {(hovered || isActive) && (
        <Html position={labelOffset} center distanceFactor={14} zIndexRange={[100, 0]}>
          <div
            style={{
              background: isActive ? 'rgba(220, 38, 38, 0.95)' : 'rgba(15, 23, 42, 0.92)',
              color: '#ffffff',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: `1.5px solid ${isActive ? '#ffffff' : '#38bdf8'}`,
              boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
              backdropFilter: 'blur(6px)',
              pointerEvents: 'none',
              transform: 'translateY(-6px)',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>{data.title}</span>
            <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 500 }}>
              {isActive ? 'Sedang Dipilih' : 'Klik untuk info'}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};

// ==========================================
// 3D MESIN BUBUT REALISTIS (OBJ KNUTH V28)
// ==========================================
class LatheErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('Lathe model fallback active:', err);
  }
  render() {
    if (this.state.hasError) {
      return <LatheFallback />;
    }
    return this.props.children;
  }
}

const RealisticLatheOBJ = () => {
  const materials = useLoader(MTLLoader, '/Knuth v28.mtl');
  const obj = useLoader(OBJLoader, '/Knuth v28.obj', (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  useMemo(() => {
    if (!obj) return;
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const name = child.name || '';

        // Skema warna cerah industri mesin (terlihat jelas, tidak gelap)
        if (name.includes('Body1:77')) {
          // Chuck 3 Rahang -> Baja Chrome Mengkilap Terang
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#f8fafc'),
            roughness: 0.15,
            metalness: 0.95
          });
        } else if (name.includes('Body1:3')) {
          // Bed & Slideways -> Baja Presisi Halus Terang
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#e2e8f0'),
            roughness: 0.2,
            metalness: 0.85
          });
        } else if (name.includes('Body1:88') || name.includes('Body1:89')) {
          // Poros Transportir & Pembawa -> Baja Terang Mengkilap
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ffffff'),
            roughness: 0.25,
            metalness: 0.9
          });
        } else if (name.includes('Body1:24')) {
          // Pelindung Percikan Bram -> Lembaran Logam Slate Bersih
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#94a3b8'),
            roughness: 0.4,
            metalness: 0.5
          });
        } else if (name === 'Body1' || name === 'Body1:1' || name === 'Body1:2') {
          // Kaki & Bak Penampung Bram -> Slate Industri Abu-Abu Bersih
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#64748b'),
            roughness: 0.5,
            metalness: 0.5
          });
        } else if (
          name.includes('Body1:47') ||
          name.includes('Body1:48') ||
          name.includes('Body1:49') ||
          name.includes('Body1:50')
        ) {
          // Rumah Pahat & Compound Rest -> Baja Terang
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#cbd5e1'),
            roughness: 0.25,
            metalness: 0.85
          });
        } else if (
          name.includes('Body1:25') ||
          name.includes('Body1:26') ||
          name.includes('Body1:60') ||
          name.includes('Body1:63')
        ) {
          // Tuas & Handel Operasi -> Merah & Kuning K3 Terang
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ef4444'),
            roughness: 0.3,
            metalness: 0.5
          });
        } else {
          // Bodi Utama (Headstock, Tailstock, Eretan) -> Biru Industri Cerah Standar Mesin (RAL 5015)
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#0284c7'),
            roughness: 0.35,
            metalness: 0.45,
            side: THREE.DoubleSide
          });
        }
      }
    });
  }, [obj]);

  return (
    <primitive
      object={obj}
      position={[-3.69, 2.40, 60.0]}
    />
  );
};

const LatheFallback = () => (
  <group position={[0, 0, 0]}>
    {/* Base Stand & Chip Pan */}
    <mesh castShadow position={[0, 0.4, 0]}>
      <boxGeometry args={[4.2, 0.8, 1.4]} />
      <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
    </mesh>
    {/* Bed & Slideways */}
    <mesh castShadow position={[0, 1.1, 0]}>
      <boxGeometry args={[4.0, 0.5, 0.9]} />
      <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.2} />
    </mesh>
    {/* Headstock */}
    <mesh castShadow position={[-1.4, 1.8, 0]}>
      <boxGeometry args={[1.1, 0.9, 0.9]} />
      <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.35} />
    </mesh>
    {/* Chuck */}
    <mesh castShadow position={[-0.65, 1.8, 0.05]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.35, 0.35, 0.3, 32]} />
      <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.15} />
    </mesh>
    {/* Carriage & Apron */}
    <mesh castShadow position={[0.4, 1.5, 0.2]}>
      <boxGeometry args={[0.9, 0.8, 1.0]} />
      <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.35} />
    </mesh>
    {/* Toolpost */}
    <mesh castShadow position={[0.4, 2.05, 0.2]}>
      <boxGeometry args={[0.35, 0.3, 0.35]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
    </mesh>
    {/* Tailstock */}
    <mesh castShadow position={[1.5, 1.7, 0]}>
      <boxGeometry args={[0.7, 0.7, 0.7]} />
      <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.35} />
    </mesh>
    {/* Leadscrew */}
    <mesh castShadow position={[0.2, 1.2, 0.45]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.035, 0.035, 3.2, 16]} />
      <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.2} />
    </mesh>
  </group>
);

// ==========================================
// 3D MESIN FRAIS INDUSTRI LENGKAP
// ==========================================
const IndustrialMillingMachine = ({ position = [5.0, 0, 0], onSelect, activeId }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.5, 3.2]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.45, 0.4]} receiveShadow>
        <boxGeometry args={[2.2, 0.1, 1.8]} />
        <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.5} />
      </mesh>

      <mesh position={[0, 2.4, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 3.8, 2.0]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.4, 0.61]} castShadow>
        <boxGeometry args={[0.9, 3.4, 0.06]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.85} />
      </mesh>

      <mesh position={[0, 4.35, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.6, 2.8]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* MOTOR & KEPALA FRAIS */}
      <InteractivePart
        data={MACHINING_DATA['mill-motor']}
        onSelect={onSelect}
        isActive={activeId === 'mill-motor'}
        labelOffset={[0, 5.8, 1.2]}
        hitArgs={[1.4, 1.8, 1.6]}
        hitPosition={[0, 4.6, 1.2]}
      >
        <group position={[0, 4.1, 1.3]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.55, 0.5, 0.9, 24]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.95, -0.1]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.9, 20]} />
            <meshStandardMaterial color="#0369a1" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.1, 0.3, 1.3]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0.56, 0.55, 0.2]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0.56, 0.55, -0.2]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
        </group>
      </InteractivePart>

      {/* SPINDEL & CUTTER */}
      <InteractivePart
        data={MACHINING_DATA['mill-spindle']}
        onSelect={onSelect}
        isActive={activeId === 'mill-spindle'}
        labelOffset={[0, 3.6, 1.4]}
        hitArgs={[0.7, 1.1, 0.7]}
        hitPosition={[0, 3.2, 1.3]}
      >
        <group position={[0, 3.35, 1.3]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.6, 24]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.35, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.14, 0.3, 24]} />
            <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.65, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.35, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.95} />
          </mesh>
          <mesh position={[0.3, 0.1, 0.1]} rotation={[0, 0, -Math.PI / 3]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 12]} />
            <meshStandardMaterial color="#2563eb" roughness={0.6} />
          </mesh>
          <mesh position={[0.42, -0.2, 0.1]} rotation={[0, 0, Math.PI / 4]}>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 12]} />
            <meshStandardMaterial color="#ea580c" roughness={0.5} />
          </mesh>
        </group>
      </InteractivePart>

      {/* LUTUT (KNEE) */}
      <InteractivePart
        data={MACHINING_DATA['mill-knee']}
        onSelect={onSelect}
        isActive={activeId === 'mill-knee'}
        labelOffset={[0, 1.8, 1.2]}
        hitArgs={[2.2, 1.4, 2.0]}
        hitPosition={[0, 1.5, 0.7]}
      >
        <group>
          <mesh position={[0, 1.5, 0.7]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 1.1, 1.8]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.6, 0.9]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
            <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.6, 0.9]}>
            <cylinderGeometry args={[0.2, 0.2, 0.7, 16]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>
        </group>
      </InteractivePart>

      <mesh position={[0, 2.15, 0.85]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.35, 1.5]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.75} />
      </mesh>

      {/* MEJA FRAIS ALUR T */}
      <InteractivePart
        data={MACHINING_DATA['mill-table']}
        onSelect={onSelect}
        isActive={activeId === 'mill-table'}
        labelOffset={[0, 2.9, 1.5]}
        hitArgs={[4.6, 0.4, 1.2]}
        hitPosition={[0, 2.45, 0.85]}
      >
        <group position={[0, 2.45, 0.85]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4.4, 0.25, 1.0]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.126, -0.2]}>
            <boxGeometry args={[4.3, 0.01, 0.08]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.126, 0]}>
            <boxGeometry args={[4.3, 0.01, 0.08]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.126, 0.2]}>
            <boxGeometry args={[4.3, 0.01, 0.08]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </InteractivePart>

      {/* RAGUM MESIN FRAIS */}
      <InteractivePart
        data={MACHINING_DATA['mill-vise']}
        onSelect={onSelect}
        isActive={activeId === 'mill-vise'}
        labelOffset={[0, 3.2, 0.9]}
        hitArgs={[1.2, 0.6, 0.8]}
        hitPosition={[0, 2.75, 0.85]}
      >
        <group position={[0, 2.67, 0.85]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.12, 0.6]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.16, -0.15]} castShadow>
            <boxGeometry args={[0.8, 0.2, 0.1]} />
            <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.16, 0.08]} castShadow>
            <boxGeometry args={[0.8, 0.2, 0.1]} />
            <meshStandardMaterial color="#475569" roughness={0.25} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.12, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.22, -0.03]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.16, 0.14]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.85} />
          </mesh>
        </group>
      </InteractivePart>

      {/* HANDWHEELS */}
      <InteractivePart
        data={MACHINING_DATA['mill-handwheels']}
        onSelect={onSelect}
        isActive={activeId === 'mill-handwheels'}
        labelOffset={[2.4, 2.8, 0.85]}
        hitArgs={[0.8, 0.8, 0.8]}
        hitPosition={[2.4, 2.45, 0.85]}
      >
        <group>
          <mesh position={[-2.3, 2.45, 0.85]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
          <mesh position={[2.3, 2.45, 0.85]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.1, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
          <mesh position={[0, 2.0, 1.65]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
          <mesh position={[0.7, 1.4, 1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
        </group>
      </InteractivePart>

      {/* E-STOP */}
      <InteractivePart
        data={MACHINING_DATA['mill-estop']}
        onSelect={onSelect}
        isActive={activeId === 'mill-estop'}
        labelOffset={[-1.2, 3.2, 1.4]}
        hitArgs={[0.5, 0.6, 0.4]}
        hitPosition={[-1.2, 2.8, 1.4]}
      >
        <group position={[-1.2, 2.8, 1.4]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.45, 0.18]} />
            <meshStandardMaterial color="#ca8a04" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.05, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.06, 0.08, 16]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} />
          </mesh>
        </group>
      </InteractivePart>

      <mesh position={[0, 0.015, 2.1]} receiveShadow>
        <boxGeometry args={[2.6, 0.03, 1.2]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
    </group>
  );
};

// ==========================================
// PROPS PERLENGKAPAN BENGKEL MESIN
// ==========================================
const MachineShopProps = ({ onSelect, activeId }) => {
  return (
    <group>
      <InteractivePart
        data={MACHINING_DATA['shop-toolcart']}
        onSelect={onSelect}
        isActive={activeId === 'shop-toolcart'}
        labelOffset={[-10.5, 2.0, -2.5]}
        hitArgs={[1.6, 1.8, 1.2]}
        hitPosition={[-10.5, 0.9, -2.5]}
      >
        <group position={[-10.5, 0, -2.5]}>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.6, 1.0]} />
            <meshStandardMaterial color="#dc2626" roughness={0.35} metalness={0.5} />
          </mesh>
          {[-0.4, -0.15, 0.1, 0.35, 0.6].map((y, idx) => (
            <mesh key={idx} position={[0, 0.9 + y, 0.51]}>
              <boxGeometry args={[1.25, 0.18, 0.02]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 1.71, 0]}>
            <boxGeometry args={[1.35, 0.02, 0.95]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[-0.3, 1.76, 0]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[0.4, 0.05, 0.15]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
          </mesh>
        </group>
      </InteractivePart>

      <InteractivePart
        data={MACHINING_DATA['shop-rawstock']}
        onSelect={onSelect}
        isActive={activeId === 'shop-rawstock'}
        labelOffset={[10.5, 2.5, -2.5]}
        hitArgs={[1.8, 2.4, 1.4]}
        hitPosition={[10.5, 1.2, -2.5]}
      >
        <group position={[10.5, 0, -2.5]}>
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.6, 2.2, 1.0]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
          {[-0.5, 0, 0.5].map((y, idx) => (
            <group key={idx} position={[0, 1.0 + y, 0]}>
              <mesh position={[-0.4, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 1.2, 16]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.85} />
              </mesh>
              <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
              <mesh position={[0.4, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.12, 1.2, 16]} />
                <meshStandardMaterial color="#ca8a04" metalness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      </InteractivePart>

      <InteractivePart
        data={MACHINING_DATA['shop-scrapbin']}
        onSelect={onSelect}
        isActive={activeId === 'shop-scrapbin'}
        labelOffset={[0, 1.2, -4.5]}
        hitArgs={[2.0, 1.1, 1.4]}
        hitPosition={[0, 0.5, -4.5]}
      >
        <group position={[0, 0, -4.5]}>
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.9, 1.2]} />
            <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[1.6, 0.2, 1.0]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.9} metalness={0.6} />
          </mesh>
        </group>
      </InteractivePart>

      <group position={[-10.5, 0, 1.0]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 1.1, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// ==========================================
// 3D AREA KERJA BANGKU (BENCHWORK LAB)
// Papan 5S dipasang menempel rapi di tembok belakang!
// Meja kerja bersandar rapi di depan dinding!
// ==========================================
const BenchworkArea3D = ({ onSelect, activeId }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. MEJA KERJA BANGKU BERAT BERSANDAR DI DEPAN DINDING (Z = -5.4) */}
      <group position={[0, 0, -5.4]}>
        <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.4, 0.16, 1.8]} />
          <meshStandardMaterial color="#854d0e" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0, 1.06, 0.85]} receiveShadow>
          <boxGeometry args={[8.4, 0.02, 0.15]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        {[
          [-4.0, -0.8], [-4.0, 0.8],
          [-1.3, -0.8], [-1.3, 0.8],
          [1.3, -0.8], [1.3, 0.8],
          [4.0, -0.8], [4.0, 0.8]
        ].map(([x, z], idx) => (
          <mesh key={idx} position={[x, 0.48, z]} castShadow receiveShadow>
            <boxGeometry args={[0.14, 0.98, 0.14]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.0, 0.05, 1.5]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
      </group>

      {/* 2. TIGA RAGUM MEJA PARALEL DI BIBIR DEPAN MEJA (Z = -4.55) */}
      {[
        { x: -2.8, key: 'bench-vise-1', data: BENCHWORK_DATA['bench-vise-1'] },
        { x: 0, key: 'bench-vise-2', data: BENCHWORK_DATA['bench-vise-2'] },
        { x: 2.8, key: 'bench-vise-3', data: BENCHWORK_DATA['bench-vise-3'] }
      ].map(({ x, key, data }, idx) => (
        <InteractivePart
          key={key}
          data={data}
          onSelect={onSelect}
          isActive={activeId === key}
          labelOffset={[x, 1.8, -4.55]}
          hitArgs={[0.8, 0.6, 0.9]}
          hitPosition={[x, 1.35, -4.55]}
        >
          <group position={[x, 1.15, -4.55]}>
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.26, 0.3, 0.1, 20]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.22, -0.05]} castShadow>
              <boxGeometry args={[0.45, 0.26, 0.4]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.26, 0.12]} castShadow>
              <boxGeometry args={[0.42, 0.12, 0.04]} />
              <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.85} />
            </mesh>
            <mesh position={[0, 0.22, 0.22]} castShadow>
              <boxGeometry args={[0.45, 0.26, 0.16]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.26, 0.15]} castShadow>
              <boxGeometry args={[0.42, 0.12, 0.04]} />
              <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.85} />
            </mesh>
            <mesh position={[0, 0.16, 0.32]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.3, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.16, 0.48]} rotation={[0, 0, Math.PI / 3]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.45, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.25, -0.22]} castShadow>
              <boxGeometry args={[0.22, 0.08, 0.18]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>

            {idx === 1 && (
              <group position={[0, 0.28, 0.135]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.26, 0.18, 0.03]} />
                  <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.04, 0.016]}>
                  <planeGeometry args={[0.24, 0.005]} />
                  <meshBasicMaterial color="#0284c7" />
                </mesh>
              </group>
            )}
          </group>
        </InteractivePart>
      ))}

      {/* 3. MEJA PERATA GRANIT PRESISI (Z = -5.4) */}
      <InteractivePart
        data={BENCHWORK_DATA['bench-surfaceplate']}
        onSelect={onSelect}
        isActive={activeId === 'bench-surfaceplate'}
        labelOffset={[6.0, 1.4, -5.4]}
        hitArgs={[2.0, 0.6, 1.6]}
        hitPosition={[6.0, 0.95, -5.4]}
      >
        <group position={[6.0, 0, -5.4]}>
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.9, 1.6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.98, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.8, 0.18, 1.4]} />
            <meshStandardMaterial color="#111827" roughness={0.15} metalness={0.3} />
          </mesh>
        </group>
      </InteractivePart>

      {/* VERNIER HEIGHT GAUGE DI ATAS GRANIT */}
      <InteractivePart
        data={BENCHWORK_DATA['bench-heightgauge']}
        onSelect={onSelect}
        isActive={activeId === 'bench-heightgauge'}
        labelOffset={[5.7, 1.8, -5.6]}
        hitArgs={[0.4, 0.8, 0.3]}
        hitPosition={[5.7, 1.4, -5.6]}
      >
        <group position={[5.7, 1.07, -5.6]}>
          <mesh position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[0.25, 0.08, 0.18]} />
            <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.06, 0.6, 0.03]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[0.08, 0.42, 0]} castShadow>
            <boxGeometry args={[0.12, 0.06, 0.04]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          <mesh position={[0.16, 0.4, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
            <cylinderGeometry args={[0.01, 0.002, 0.1]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
        </group>
      </InteractivePart>

      {/* BALOK V PRESISI & POROS */}
      <InteractivePart
        data={BENCHWORK_DATA['bench-vblock']}
        onSelect={onSelect}
        isActive={activeId === 'bench-vblock'}
        labelOffset={[6.4, 1.5, -5.2]}
        hitArgs={[0.4, 0.4, 0.4]}
        hitPosition={[6.4, 1.2, -5.2]}
      >
        <group position={[6.4, 1.13, -5.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.12, 0.22]} />
            <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.28, 20]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>
      </InteractivePart>

      {/* 4. PAPAN GANTUNG PERKAKAS DI TEMBOK DENGAN BACKGROUND WARNA KUNING */}
      <group position={[0, 3.2, -6.88]}>
        {/* Frame Bingkai Papan Perkakas */}
        <mesh receiveShadow>
          <boxGeometry args={[9.0, 2.5, 0.04]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Background Papan Perkakas Warna Kuning Terang (Safety Industrial Tool Board) */}
        <mesh position={[0, 0, 0.025]} receiveShadow>
          <planeGeometry args={[8.8, 2.3]} />
          <meshStandardMaterial
            color="#facc15"
            roughness={0.4}
            metalness={0.15}
          />
        </mesh>

        {/* Header Bersih Papan Alat Bengkel */}
        <mesh position={[0, 0.98, 0.03]}>
          <planeGeometry args={[8.6, 0.22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <Html position={[0, 0.98, 0.04]} center transform distanceFactor={11} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              padding: '3px 20px',
              color: '#facc15',
              fontWeight: 900,
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, sans-serif',
              whiteSpace: 'nowrap'
            }}
          >
            PAPAN PERKAKAS KERJA BANGKU (WORKSHOP TOOL BOARD)
          </div>
        </Html>

        {/* --- 15 PERKAKAS TERGANTUNG NEMPEL DI PAPAN TEMBOK --- */}
        {/* 1. Kikir Pipih */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-flatfile']}
          onSelect={onSelect}
          isActive={activeId === 'bench-flatfile'}
          labelOffset={[-3.2, 1.0, 0.1]}
          hitArgs={[0.25, 0.9, 0.1]}
          hitPosition={[-3.2, 0.35, 0.05]}
        >
          <group position={[-3.2, 0.5, 0.05]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.65, 0.02]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.6} metalness={0.7} />
            </mesh>
            <mesh position={[0, -0.4, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.03, 0.22]} />
              <meshStandardMaterial color="#854d0e" roughness={0.8} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 2. Kikir Setengah Bulat */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-halfroundfile']}
          onSelect={onSelect}
          isActive={activeId === 'bench-halfroundfile'}
          labelOffset={[-2.2, 1.0, 0.1]}
          hitArgs={[0.25, 0.9, 0.1]}
          hitPosition={[-2.2, 0.35, 0.05]}
        >
          <group position={[-2.2, 0.5, 0.05]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.65, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.6} metalness={0.7} />
            </mesh>
            <mesh position={[0, -0.4, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.03, 0.22]} />
              <meshStandardMaterial color="#854d0e" roughness={0.8} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 3. Kikir Bulat */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-roundfile']}
          onSelect={onSelect}
          isActive={activeId === 'bench-roundfile'}
          labelOffset={[-1.2, 1.0, 0.1]}
          hitArgs={[0.25, 0.9, 0.1]}
          hitPosition={[-1.2, 0.35, 0.05]}
        >
          <group position={[-1.2, 0.5, 0.05]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.035, 0.015, 0.65, 16]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.6} metalness={0.7} />
            </mesh>
            <mesh position={[0, -0.4, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.03, 0.22]} />
              <meshStandardMaterial color="#854d0e" roughness={0.8} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 4. Kikir Segitiga */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-trianglefile']}
          onSelect={onSelect}
          isActive={activeId === 'bench-trianglefile'}
          labelOffset={[-0.2, 1.0, 0.1]}
          hitArgs={[0.25, 0.9, 0.1]}
          hitPosition={[-0.2, 0.35, 0.05]}
        >
          <group position={[-0.2, 0.5, 0.05]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.65, 3]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.6} metalness={0.7} />
            </mesh>
            <mesh position={[0, -0.4, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.03, 0.22]} />
              <meshStandardMaterial color="#854d0e" roughness={0.8} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 5. Gergaji Besi (Hacksaw) */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-hacksaw']}
          onSelect={onSelect}
          isActive={activeId === 'bench-hacksaw'}
          labelOffset={[1.2, 1.1, 0.1]}
          hitArgs={[1.0, 0.6, 0.15]}
          hitPosition={[1.2, 0.45, 0.05]}
        >
          <group position={[1.2, 0.6, 0.05]}>
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.04, 0.03]} />
              <meshStandardMaterial color="#2563eb" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[-0.38, -0.15, 0]} castShadow>
              <boxGeometry args={[0.04, 0.32, 0.03]} />
              <meshStandardMaterial color="#2563eb" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0.38, -0.15, 0]} castShadow>
              <boxGeometry args={[0.04, 0.32, 0.03]} />
              <meshStandardMaterial color="#2563eb" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, -0.3, 0]} castShadow>
              <boxGeometry args={[0.8, 0.015, 0.005]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
            </mesh>
            <mesh position={[0.44, -0.15, 0]} castShadow>
              <boxGeometry args={[0.08, 0.28, 0.05]} />
              <meshStandardMaterial color="#020617" roughness={0.7} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 6. Palu Konde */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-hammer']}
          onSelect={onSelect}
          isActive={activeId === 'bench-hammer'}
          labelOffset={[2.4, 1.0, 0.1]}
          hitArgs={[0.5, 0.8, 0.15]}
          hitPosition={[2.4, 0.5, 0.05]}
        >
          <group position={[2.4, 0.6, 0.05]}>
            <mesh position={[0, 0.22, 0]} castShadow>
              <boxGeometry args={[0.26, 0.09, 0.09]} />
              <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0.16, 0.22, 0]} castShadow>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.12, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.035, 0.55]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.7} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 7. Palu Lunak Karet */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-mallet']}
          onSelect={onSelect}
          isActive={activeId === 'bench-mallet'}
          labelOffset={[3.4, 1.0, 0.1]}
          hitArgs={[0.5, 0.8, 0.15]}
          hitPosition={[3.4, 0.5, 0.05]}
        >
          <group position={[3.4, 0.6, 0.05]}>
            <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.26, 16]} />
              <meshStandardMaterial color="#020617" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.12, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.035, 0.55]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.7} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 8. Penitik (Punch) */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-centerpunch']}
          onSelect={onSelect}
          isActive={activeId === 'bench-centerpunch'}
          labelOffset={[-3.2, 0.1, 0.1]}
          hitArgs={[0.2, 0.5, 0.1]}
          hitPosition={[-3.2, -0.35, 0.05]}
        >
          <group position={[-3.2, -0.35, 0.05]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.18, 0]} castShadow>
              <coneGeometry args={[0.025, 0.06, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 9. Penggores Baja (Scriber) */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-scriber']}
          onSelect={onSelect}
          isActive={activeId === 'bench-scriber'}
          labelOffset={[-2.2, 0.1, 0.1]}
          hitArgs={[0.2, 0.5, 0.1]}
          hitPosition={[-2.2, -0.35, 0.05]}
        >
          <group position={[-2.2, -0.35, 0.05]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.38, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 10. Siku Baja 90° */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-trysquare']}
          onSelect={onSelect}
          isActive={activeId === 'bench-trysquare'}
          labelOffset={[-1.2, 0.2, 0.1]}
          hitArgs={[0.5, 0.5, 0.1]}
          hitPosition={[-1.2, -0.3, 0.05]}
        >
          <group position={[-1.2, -0.35, 0.05]}>
            <mesh position={[-0.08, 0, 0]} castShadow>
              <boxGeometry args={[0.04, 0.42, 0.06]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            <mesh position={[0.14, 0.16, 0]} castShadow>
              <boxGeometry args={[0.4, 0.04, 0.01]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 11. Set Tap & Tangkai Tap */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-tap']}
          onSelect={onSelect}
          isActive={activeId === 'bench-tap'}
          labelOffset={[0, 0.1, 0.1]}
          hitArgs={[0.6, 0.3, 0.1]}
          hitPosition={[0, -0.35, 0.05]}
        >
          <group position={[0, -0.35, 0.05]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.5, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.85} />
            </mesh>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.08, 0.06]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 12. Snei & Tangkai Snei */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-die']}
          onSelect={onSelect}
          isActive={activeId === 'bench-die'}
          labelOffset={[1.2, 0.1, 0.1]}
          hitArgs={[0.8, 0.3, 0.1]}
          hitPosition={[1.2, -0.35, 0.05]}
        >
          <group position={[1.2, -0.35, 0.05]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.05, 20]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
            <mesh position={[-0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.35, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.85} />
            </mesh>
            <mesh position={[0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.018, 0.018, 0.35, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.85} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 13. Sikat Kikir (File Card) */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-filecard']}
          onSelect={onSelect}
          isActive={activeId === 'bench-filecard'}
          labelOffset={[2.2, 0.1, 0.1]}
          hitArgs={[0.3, 0.4, 0.1]}
          hitPosition={[2.2, -0.35, 0.05]}
        >
          <group position={[2.2, -0.35, 0.05]}>
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.28, 0.03]} />
              <meshStandardMaterial color="#ca8a04" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.1, 0.22, 0.015]} />
              <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 14. Pahat Pelat Logam (Cold Chisel) */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-chisel']}
          onSelect={onSelect}
          isActive={activeId === 'bench-chisel'}
          labelOffset={[3.2, 0.1, 0.1]}
          hitArgs={[0.2, 0.5, 0.1]}
          hitPosition={[3.2, -0.35, 0.05]}
        >
          <group position={[3.2, -0.35, 0.05]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.36, 6]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.2, 0]} castShadow>
              <boxGeometry args={[0.07, 0.05, 0.015]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </group>
        </InteractivePart>

        {/* 15. Kotak APD Kacamata Safety */}
        <InteractivePart
          data={BENCHWORK_DATA['bench-safety']}
          onSelect={onSelect}
          isActive={activeId === 'bench-safety'}
          labelOffset={[4.2, 0.7, 0.1]}
          hitArgs={[0.5, 0.6, 0.3]}
          hitPosition={[4.2, 0.2, 0.05]}
        >
          <group position={[4.2, 0.2, 0.05]}>
            <mesh castShadow>
              <boxGeometry args={[0.4, 0.5, 0.2]} />
              <meshStandardMaterial color="#ef4444" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.05, 0.11]}>
              <boxGeometry args={[0.28, 0.22, 0.02]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.1} transparent opacity={0.7} />
            </mesh>
          </group>
        </InteractivePart>
      </group>
    </group>
  );
};

// ==========================================
// POSTER-POSTER CAMPAIGN K3 DI TEMBOK BENGKEL
// ==========================================
const K3WallCampaignPosters = ({ viewMode }) => {
  return (
    <group position={[0, 0, -6.88]}>
      {/* 1. POSTER NASIONAL K3: UTAMAKAN KESELAMATAN & KESEHATAN KERJA */}
      <group position={[-11.5, 5.0, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[2.8, 2.0]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <Html position={[0, 0, 0.02]} center transform distanceFactor={8.5}>
          <div
            style={{
              width: '320px',
              padding: '14px',
              backgroundColor: '#059669',
              color: '#ffffff',
              borderRadius: '8px',
              border: '3px solid #ffffff',
              boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
              fontFamily: 'system-ui, sans-serif',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '2px' }}>🛡️</div>
            <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
              UTAMAKAN KESELAMATAN &amp; KESEHATAN KERJA (K3)
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fef08a', margin: '4px 0' }}>
              ZERO ACCIDENT IS OUR GOAL
            </div>
            <div style={{ fontSize: '10px', lineHeight: '1.4', color: '#d1fae5', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '6px' }}>
              Bekerja dengan selamat, pulang dengan sehat kepada keluarga tercinta.
            </div>
          </div>
        </Html>
      </group>

      {/* 2. POSTER AREA WAJIB APD STANDAR BENGKEL */}
      <group position={[-6.0, 5.2, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[3.0, 1.9]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <Html position={[0, 0, 0.02]} center transform distanceFactor={8.5}>
          <div
            style={{
              width: '340px',
              padding: '12px 14px',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              borderRadius: '8px',
              border: '3px solid #38bdf8',
              boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '24px' }}>🥽</span>
              <div style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', color: '#38bdf8' }}>
                AREA WAJIB ALAT PELINDUNG DIRI (APD)
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', color: '#e0e7ff' }}>
              <div>• Kacamata Safety ANSI Z87</div>
              <div>• Sepatu Safety Sol Baja</div>
              <div>• Baju Praktik / Wearpack</div>
              <div>• Rambut Rapi / Ikat Aman</div>
            </div>
          </div>
        </Html>
      </group>

      {/* 3. POSTER BUDAYA 5R/5S MANUFAKTUR */}
      <group position={[6.0, 5.2, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[3.2, 1.9]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <Html position={[0, 0, 0.02]} center transform distanceFactor={8.5}>
          <div
            style={{
              width: '360px',
              padding: '12px 14px',
              backgroundColor: '#ca8a04',
              color: '#0f172a',
              borderRadius: '8px',
              border: '3px solid #ffffff',
              boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>
              ⭐ BUDAYA 5R DI BENGKEL MANUFAKTUR
            </div>
            <div style={{ fontSize: '10px', lineHeight: '1.45', color: '#1e293b' }}>
              <strong>1. Ringkas:</strong> Pisahkan alat penting &amp; tidak penting.<br />
              <strong>2. Rapi:</strong> Kembalikan alat ke papan siluet 5S.<br />
              <strong>3. Resik:</strong> Bersihkan bram logam sehabis bekerja.<br />
              <strong>4. Rawat:</strong> Lumasi mesin &amp; ragum secara berkala.<br />
              <strong>5. Rajin:</strong> Disiplin patuhi SOP setiap saat.
            </div>
          </div>
        </Html>
      </group>

      {/* 4. POSTER KESELAMATAN KERJA BANGKU & ATURAN MENGIKIR */}
      <group position={[11.5, 5.0, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[2.8, 2.0]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <Html position={[0, 0, 0.02]} center transform distanceFactor={8.5}>
          <div
            style={{
              width: '320px',
              padding: '12px 14px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              borderRadius: '8px',
              border: '3px solid #ffffff',
              boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>
              ⚠️ SOP KESELAMATAN KERJA BANGKU
            </div>
            <div style={{ fontSize: '10px', lineHeight: '1.45', color: '#fee2e2' }}>
              • <strong>KIKIR:</strong> WAJIB pakai gagang kayu/plastik kokoh!<br />
              • <strong>TATAL BRAM:</strong> DILARANG meniup tatal dengan mulut.<br />
              • <strong>MEMAHAT:</strong> Wajib pakai kacamata &amp; pelindung tangan.<br />
              • <strong>RAGUM:</strong> Jangan memukul tuas dengan palu keras!
            </div>
          </div>
        </Html>
      </group>

      {/* 5. POSTER PANDUAN APAR (PASS METHOD) DI DEKAT APAR */}
      <group position={[-11.5, 1.8, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[2.4, 1.4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <Html position={[0, 0, 0.02]} center transform distanceFactor={8.5}>
          <div
            style={{
              width: '280px',
              padding: '10px 12px',
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              borderRadius: '6px',
              border: '2px solid #ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#fef08a', textTransform: 'uppercase', marginBottom: '3px' }}>
              🧯 CARA PENGGUNAAN APAR (P-A-S-S)
            </div>
            <div style={{ fontSize: '9px', lineHeight: '1.4', color: '#fee2e2' }}>
              <strong>P - Pull:</strong> Cabut pin pengaman tabung.<br />
              <strong>A - Aim:</strong> Arahkan corong ke dasar api.<br />
              <strong>S - Squeeze:</strong> Tekan tuas katup.<br />
              <strong>S - Sweep:</strong> Sapukan dari sisi ke sisi merata.
            </div>
          </div>
        </Html>
      </group>

      {/* 6. POSTER JALUR EVAKUASI & EMERGENCY EXIT */}
      <group position={[11.5, 1.8, 0]}>
        <mesh receiveShadow>
          <planeGeometry args={[2.4, 1.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <Html position={[0, 0, 0.02]} center transform distanceFactor={8.5}>
          <div
            style={{
              width: '280px',
              padding: '10px 12px',
              backgroundColor: '#047857',
              color: '#ffffff',
              borderRadius: '6px',
              border: '2px solid #ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              fontFamily: 'system-ui, sans-serif',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '20px' }}>🏃 ➡️ 🏁</div>
            <div style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
              JALUR EVAKUASI DARURAT
            </div>
            <div style={{ fontSize: '9px', color: '#d1fae5', marginTop: '2px' }}>
              Tetap tenang • Menuju titik kumpul (Assembly Point)
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};

// ==========================================
// LANTAI & DINDING BENGKEL DENGAN LATAR ABU-ABU TERANG
// ==========================================
const WorkshopHallEnvironment = ({ viewMode }) => {
  return (
    <group>
      {/* 1. LANTAI BENGKEL ABU-ABU TERANG INDUSTRIAL EPOXY */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[34, 26]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.35} metalness={0.2} />
      </mesh>

      {/* 2. JALUR ZONA KESELAMATAN K3 WALKWAY HIJAU */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 5.5]} receiveShadow>
        <planeGeometry args={[30, 2.0]} />
        <meshStandardMaterial color="#059669" roughness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 4.45]}>
        <planeGeometry args={[30, 0.12]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 6.55]}>
        <planeGeometry args={[30, 0.12]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>

      {/* Zebra Crossing Jalur K3 */}
      {[-12, -8, -4, 0, 4, 8, 12].map((x, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.009, 5.5]}>
          <planeGeometry args={[0.8, 1.8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* 3. MARKA ZONA KERJA MESIN PADA AREA MESIN */}
      {viewMode === 'mesin' && (
        <group>
          {/* Zona Mesin Bubut */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.5, 0.006, 0.8]}>
            <planeGeometry args={[9.5, 5.5]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.5, 0.009, -1.95]}>
            <planeGeometry args={[9.5, 0.14]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.5, 0.009, 3.55]}>
            <planeGeometry args={[9.5, 0.14]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>

          {/* Zona Mesin Frais */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.5, 0.006, 0.8]}>
            <planeGeometry args={[7.5, 5.5]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.5, 0.009, -1.95]}>
            <planeGeometry args={[7.5, 0.14]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.5, 0.009, 3.55]}>
            <planeGeometry args={[7.5, 0.14]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
        </group>
      )}

      {/* 4. DINDING BELAKANG BENGKEL INDUSTRI WARNA ABU-ABU BERSIH */}
      <mesh position={[0, 5.0, -7.0]} receiveShadow>
        <planeGeometry args={[34, 10]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      {/* Kolom Tiang Baja Struktural H-Beam */}
      {[-16, -11, -5.5, 0, 5.5, 11, 16].map((x, idx) => (
        <mesh key={idx} position={[x, 5.0, -6.9]} castShadow>
          <boxGeometry args={[0.5, 10, 0.25]} />
          <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* 5. TABUNG PEMADAM API (APAR) */}
      <group position={[-11, 2.0, -6.7]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.75, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* 6. POSTER-POSTER CAMPAIGN K3 DI TEMBOK */}
      <K3WallCampaignPosters viewMode={viewMode} />
    </group>
  );
};

// ==========================================
// KOMPONEN UTAMA VIRTUAL BENGKEL 3D
// ==========================================
const VirtualBengkel = () => {
  const [viewMode, setViewMode] = useState('mesin'); // 'mesin' | 'bangku'
  const [activeItem, setActiveItem] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Posisi kamera & target preset
  const [cameraPreset, setCameraPreset] = useState({
    pos: [0, 5.5, 12],
    look: [0, 1.6, 0]
  });

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Update kamera default saat ganti tab area
  useEffect(() => {
    setActiveItem(null);
    stopSpeech();
    setIsSpeaking(false);

    if (viewMode === 'mesin') {
      setCameraPreset({
        pos: [0, 5.5, 12],
        look: [0, 1.8, 0]
      });
    } else {
      // Area Kerja Bangku: pandangan menghadap meja dan tembok 5S
      setCameraPreset({
        pos: [0, 4.6, 1.2],
        look: [0, 1.8, -5.2]
      });
    }
  }, [viewMode]);

  const handleSelectItem = (item) => {
    setActiveItem(item);
    setIsSpeaking(true);

    // Otomatis arahkan pandangan kamera mendekati alat yang diklik
    const [hx, hy, hz] = item.position;
    setCameraPreset({
      pos: [hx, hy + 1.2, hz + 3.2],
      look: [hx, hy, hz]
    });

    const fullText = `${item.title}. Kategori: ${item.category}. ${item.description}. Prosedur: ${item.sop}. K3: ${item.k3}`;
    speakText(fullText);
  };

  const handleCloseModal = () => {
    setActiveItem(null);
    stopSpeech();
    setIsSpeaking(false);
  };

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else if (activeItem) {
      setIsSpeaking(true);
      const fullText = `${activeItem.title}. ${activeItem.description}. Prosedur: ${activeItem.sop}. K3: ${activeItem.k3}`;
      speakText(fullText);
    }
  };

  const applyCameraView = (type) => {
    stopSpeech();
    setIsSpeaking(false);
    setActiveItem(null);

    if (viewMode === 'mesin') {
      switch (type) {
        case 'lathe':
          setCameraPreset({ pos: [-5.0, 3.2, 5.5], look: [-5.0, 1.8, 0] });
          break;
        case 'milling':
          setCameraPreset({ pos: [5.0, 3.4, 5.5], look: [5.0, 2.2, 0] });
          break;
        default:
          setCameraPreset({ pos: [0, 5.5, 12], look: [0, 1.8, 0] });
          break;
      }
    } else {
      switch (type) {
        case 'vise':
          setCameraPreset({ pos: [0, 2.4, -2.4], look: [0, 1.3, -4.55] });
          break;
        case 'tools':
          setCameraPreset({ pos: [0, 3.2, -3.2], look: [0, 3.2, -6.88] });
          break;
        case 'granite':
          setCameraPreset({ pos: [6.0, 2.4, -3.2], look: [6.0, 1.2, -5.4] });
          break;
        default:
          setCameraPreset({ pos: [0, 4.6, 1.2], look: [0, 1.8, -5.2] });
          break;
      }
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        width: '100%',
        height: 'calc(100vh - 140px)',
        position: 'relative',
        backgroundColor: '#cbd5e1', // Latar belakang abu-abu terang
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* ==================================================== */}
      {/* HEADER ATAS: JUDUL & SWITCHER TAB AREA */}
      {/* ==================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          right: '20px',
          zIndex: 30,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          pointerEvents: 'none'
        }}
      >
        {/* Judul Virtual Bengkel */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.88)',
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🏭</span>
            <h2
              style={{
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '0.5px'
              }}
            >
              BIMO Virtual Manufacturing Lab
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '3px 0 0 0' }}>
            {viewMode === 'mesin'
              ? 'Area Bengkel Mesin: Mesin Bubut (Lathe) & Mesin Frais (Milling)'
              : 'Area Bengkel Kerja Bangku: Ragum Meja, Meja Granit, & Papan Perkakas di Tembok'}
          </p>
        </div>

        {/* Tab Tombol Pengalih Area */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '6px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
        >
          <button
            onClick={() => setViewMode('mesin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: viewMode === 'mesin' ? '#2563eb' : 'transparent',
              color: viewMode === 'mesin' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'mesin' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
            }}
          >
            <span>⚙️</span> Area Mesin (Bubut & Frais)
          </button>
          <button
            onClick={() => setViewMode('bangku')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: viewMode === 'bangku' ? '#10b981' : 'transparent',
              color: viewMode === 'bangku' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'bangku' ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            <span>🔨</span> Area Kerja Bangku
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* FLOATING PRESET KAMERA (SUDUT PANDANG CEPAT) */}
      {/* ==================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '20px',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.88)',
          padding: '8px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}
      >
        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, padding: '2px 6px', textTransform: 'uppercase' }}>
          Sudut Pandang Kamera
        </span>
        {viewMode === 'mesin' ? (
          <>
            <button
              onClick={() => applyCameraView('all')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🌐 Luas Bengkel
            </button>
            <button
              onClick={() => applyCameraView('lathe')}
              style={{
                background: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid #2563eb',
                color: '#93c5fd',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🌀 Fokus Mesin Bubut
            </button>
            <button
              onClick={() => applyCameraView('milling')}
              style={{
                background: 'rgba(245, 158, 11, 0.25)',
                border: '1px solid #f59e0b',
                color: '#fcd34d',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ⚙️ Fokus Mesin Frais
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => applyCameraView('all')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🌐 Seluruh Meja Kerja
            </button>
            <button
              onClick={() => applyCameraView('vise')}
              style={{
                background: 'rgba(16, 185, 129, 0.25)',
                border: '1px solid #10b981',
                color: '#6ee7b7',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🔩 Ragum & Benda Kerja
            </button>
            <button
              onClick={() => applyCameraView('tools')}
              style={{
                background: 'rgba(236, 72, 153, 0.25)',
                border: '1px solid #ec4899',
                color: '#f472b6',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🗄️ Papan Perkakas di Tembok
            </button>
            <button
              onClick={() => applyCameraView('granite')}
              style={{
                background: 'rgba(99, 102, 241, 0.25)',
                border: '1px solid #6366f1',
                color: '#a5b4fc',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📐 Meja Perata Granit
            </button>
          </>
        )}
      </div>

      {/* ==================================================== */}
      {/* 3D CANVAS UTAMA (THREE.JS / REACT THREE FIBER) */}
      {/* ==================================================== */}
      <Canvas
        shadows
        camera={{ position: cameraPreset.pos, fov: 48 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Latar Belakang Abu-Abu Terang Bersih */}
        <color attach="background" args={['#d5dbe4']} />

        {/* Pencahayaan Bengkel Terang & Jelas */}
        <ambientLight intensity={1.3} />
        <directionalLight
          position={[12, 18, 10]}
          intensity={1.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-12, 14, -8]} intensity={0.9} />
        <pointLight position={[0, 9, 2]} intensity={1.5} distance={30} />
        <spotLight position={[5.5, 9, 2]} angle={0.6} penumbra={0.8} intensity={1.4} castShadow />

        {/* Lingkungan Aula Bengkel Industri & Poster-Poster K3 di Dinding */}
        <WorkshopHallEnvironment viewMode={viewMode} />

        {/* KONTEN AREA SESUAI TAB AKTIF */}
        {viewMode === 'mesin' ? (
          <group>
            {/* 1. MESIN BUBUT REALISTIS & KOMPONEN KLIK LANGSUNG */}
            <group position={[-5.0, 0, 0]}>
              <LatheErrorBoundary>
                <Suspense fallback={<LatheFallback />}>
                  <group
                    scale={[0.022, 0.022, 0.022]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0, 0]}
                  >
                    <RealisticLatheOBJ />
                  </group>
                </Suspense>
              </LatheErrorBoundary>

              {/* Komponen-Komponen Mesin Bubut yang Langsung Bisa Diklik */}
              <InteractivePart
                data={MACHINING_DATA['lathe-headstock']}
                onSelect={handleSelectItem}
                isActive={activeItem?.id === 'lathe-headstock'}
                labelOffset={[-1.48, 2.7, 0.1]}
                hitArgs={[1.0, 1.1, 1.2]}
                hitPosition={[-1.48, 1.97, 0.10]}
              />
              <InteractivePart
                data={MACHINING_DATA['lathe-chuck']}
                onSelect={handleSelectItem}
                isActive={activeItem?.id === 'lathe-chuck'}
                labelOffset={[-0.66, 3.0, 0.1]}
                hitArgs={[0.9, 0.9, 0.9]}
                hitPosition={[-0.66, 2.39, 0.04]}
              />
              <InteractivePart
                data={MACHINING_DATA['lathe-toolpost']}
                onSelect={handleSelectItem}
                isActive={activeItem?.id === 'lathe-toolpost'}
                labelOffset={[0.68, 2.9, 0.25]}
                hitArgs={[0.7, 0.7, 0.7]}
                hitPosition={[0.68, 2.30, 0.25]}
              />
              <InteractivePart
                data={MACHINING_DATA['lathe-carriage']}
                onSelect={handleSelectItem}
                isActive={activeItem?.id === 'lathe-carriage'}
                labelOffset={[0.68, 2.2, 0.6]}
                hitArgs={[1.1, 1.2, 1.1]}
                hitPosition={[0.68, 1.50, 0.2]}
              />
              <InteractivePart
                data={MACHINING_DATA['lathe-tailstock']}
                onSelect={handleSelectItem}
                isActive={activeItem?.id === 'lathe-tailstock'}
                labelOffset={[1.56, 2.6, 0.1]}
                hitArgs={[0.9, 0.8, 0.8]}
                hitPosition={[1.56, 1.98, 0.07]}
              />
              <InteractivePart
                data={MACHINING_DATA['lathe-leadscrew']}
                onSelect={handleSelectItem}
                isActive={activeItem?.id === 'lathe-leadscrew'}
                labelOffset={[0.31, 1.6, 0.55]}
                hitArgs={[3.2, 0.3, 0.3]}
                hitPosition={[0.31, 1.33, 0.43]}
              />
              <InteractivePart
                data={MACHINING_DATA['lathe-chippan']}
                onSelect={handleSelectItem}
                isActive={activeItem?.id === 'lathe-chippan'}
                labelOffset={[0, 0.3, 0.8]}
                hitArgs={[4.2, 0.5, 1.5]}
                hitPosition={[-0.08, 0.7, 0.05]}
              />
            </group>

            {/* 2. MESIN FRAIS INDUSTRI LENGKAP */}
            <IndustrialMillingMachine
              position={[5.5, 0, 0]}
              onSelect={handleSelectItem}
              activeId={activeItem?.id}
            />

            {/* 3. PROPS BENGKEL MESIN */}
            <MachineShopProps
              onSelect={handleSelectItem}
              activeId={activeItem?.id}
            />
          </group>
        ) : (
          <group>
            {/* AREA KERJA BANGKU (Semua alat di meja & papan 5S di tembok klik langsung) */}
            <BenchworkArea3D
              onSelect={handleSelectItem}
              activeId={activeItem?.id}
            />
          </group>
        )}

        {/* Bayangan Kontak pada Lantai */}
        <ContactShadows position={[0, 0.002, 0]} opacity={0.5} scale={30} blur={2.0} far={6} />

        {/* Kontrol Orbit Kamera */}
        <OrbitControls
          makeDefault
          enableDamping={true}
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={28}
          maxPolarAngle={Math.PI / 2 - 0.05}
          target={cameraPreset.look}
        />

        {/* ViewCube Sudut CAD di Kanan Bawah */}
        <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
          <GizmoViewcube
            color="#475569"
            strokeColor="#94a3b8"
            textColor="#ffffff"
            hoverColor="#2563eb"
            faces={['Kanan', 'Kiri', 'Atas', 'Bawah', 'Depan', 'Belakang']}
          />
        </GizmoHelper>
      </Canvas>

      {/* ==================================================== */}
      {/* PETUNJUK KONTROL NAVIGASI (KIRI BAWAH) */}
      {/* ==================================================== */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '20px',
          zIndex: 20,
          background: 'rgba(15, 23, 42, 0.88)',
          padding: '8px 14px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#e2e8f0',
          fontSize: '11px',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <span style={{ color: '#38bdf8', fontWeight: 700 }}>💡 Interaksi:</span> Klik langsung pada perkakas di papan dinding atau meja untuk membuka materi • Tahan klik kiri untuk memutar • Scroll untuk zoom
      </div>

      {/* ==================================================== */}
      {/* MODAL KARTU INFORMASI ALAT / KOMPONEN */}
      {/* ==================================================== */}
      {activeItem && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            width: '90%',
            maxWidth: '460px',
            maxHeight: 'calc(100% - 120px)',
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.96)',
            border: `2px solid ${activeItem.badgeColor || '#2563eb'}`,
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(37, 99, 235, 0.25)',
            backdropFilter: 'blur(16px)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            color: '#ffffff'
          }}
        >
          {/* Header Modal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: activeItem.badgeColor || '#2563eb',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  letterSpacing: '0.5px',
                  marginBottom: '6px'
                }}
              >
                {activeItem.category}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
                {activeItem.title}
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>
                {activeItem.subtitle}
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#cbd5e1',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.5)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'rgba(255,255,255,0.1)')}
            >
              &times;
            </button>
          </div>

          {/* Spesifikasi / Standar */}
          {activeItem.spec && (
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#38bdf8'
              }}
            >
              <strong>📐 Standar/Spesifikasi:</strong> {activeItem.spec}
            </div>
          )}

          {/* Deskripsi Fungsi */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
              Fungsi & Prinsip Kerja:
            </div>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#e2e8f0' }}>
              {activeItem.description}
            </p>
          </div>

          {/* Prosedur SOP Industri */}
          {activeItem.sop && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '10px 14px',
                borderRadius: '10px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', marginBottom: '4px' }}>
                📋 SOP Prosedur Penggunaan Industri:
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.55', color: '#d1fae5', whiteSpace: 'pre-line' }}>
                {activeItem.sop}
              </div>
            </div>
          )}

          {/* Peraturan Keselamatan K3 */}
          {activeItem.k3 && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                padding: '10px 14px',
                borderRadius: '10px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', marginBottom: '4px' }}>
                🛡️ Keselamatan Kerja (K3):
              </div>
              <div style={{ fontSize: '12px', lineHeight: '1.55', color: '#fee2e2' }}>
                {activeItem.k3}
              </div>
            </div>
          )}

          {/* Kontrol Audio Narator Suara */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
            <button
              onClick={handleToggleVoice}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: isSpeaking ? '#dc2626' : '#2563eb',
                border: 'none',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span>{isSpeaking ? '⏹️' : '🔊'}</span>
              {isSpeaking ? 'Hentikan Suara' : 'Dengarkan Penjelasan'}
            </button>

            {isSpeaking && (
              <span style={{ fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="animate-pulse">●</span> Membacakan materi...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualBengkel;

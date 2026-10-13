import React, { useState, useMemo } from 'react';
import { sound } from '../utils/audio';
import { recordQuizResult } from '../services/sheetService';

// =============================================================================
// DATABASE 1: KATEGORI MATERIAL ISO STANDAR UNTUK INSERT & ALAT POTONG
// =============================================================================
const ISO_MATERIAL_CATEGORIES = [
  {
    letter: 'P',
    name: 'Baja (Steel)',
    color: '#2563eb',
    bgColor: '#dbeafe',
    examples: 'Baja Karbon (ST37, S45C), Baja Paduan (AISI 4140, SCM440)',
    chips: 'Tatal panjang bergelombang (Continuous chips), menghasilkan panas tinggi',
    characteristics: 'Material feritik/perlitik yang membutuhkan ketahanan aus abrasi dan deformasi plastis pada suhu sedang-tinggi.',
    coating: 'CVD / PVD (TiCN + Al2O3 + TiN tebal) untuk menahan suhu tinggi dan difusi kawah (crater wear).'
  },
  {
    letter: 'M',
    name: 'Baja Tahan Karat (Stainless Steel)',
    color: '#ca8a04',
    bgColor: '#fef08a',
    examples: 'Austenitic (SS 304, SS 316), Martensitic (SS 410, SS 420), Duplex',
    chips: 'Tatal liat ulet, rentan pengerasan regang (work hardening) & built-up edge (BUE)',
    characteristics: 'Tinggi kandungan Kromium & Nikel; konduktivitas termal buruk sehingga panas menumpuk di ujung mata potong.',
    coating: 'PVD lapisan tipis halus (TiAlN / AlTiN) bertepi tajam dengan sudut tatal positif untuk meminimalkan gaya potong.'
  },
  {
    letter: 'K',
    name: 'Besi Tuang / Cor (Cast Iron)',
    color: '#dc2626',
    bgColor: '#fee2e2',
    examples: 'Besi Tuang Kelabu (FC25 / Gray Cast Iron), Besi Tuang Nodular (FCD50 / Ductile)',
    chips: 'Tatal serbuk pendek terputus-putus (Discontinuous chips), sangat abrasif',
    characteristics: 'Kaya grafit; tidak memerlukan pendingin cair (dry cutting diutamakan agar tidak membentuk lumpur abrasif).',
    coating: 'CVD tebal dengan lapisan Al2O3 keras untuk menahan aus abrasi tinggi pada bidang bebas (flank wear).'
  },
  {
    letter: 'N',
    name: 'Non-Ferrous (Aluminium & Kuningan)',
    color: '#16a34a',
    bgColor: '#dcfce7',
    examples: 'Aluminium 6061-T6, Duralumin 7075, Kuningan (Brass), Tembaga (Copper)',
    chips: 'Tatal sangat licin & lengket, rentan menempel pada bidang pahat (smearing/welding)',
    characteristics: 'Kekerasan rendah, konduktivitas panas tinggi; membutuhkan kecepatan potong sangat tinggi (Vc hingga 1000 m/min).',
    coating: 'Karbida tanpa pelapis (Uncoated polesh cermin) atau pelapis Karbon Mirip Intan (DLC / Diamond-Like Carbon).'
  },
  {
    letter: 'S',
    name: 'Paduan Super Tahan Panas (Heat Resistant Superalloys)',
    color: '#ea580c',
    bgColor: '#ffedd5',
    examples: 'Inconel 718, Titanium Paduan (Ti-6Al-4V), Hastelloy, Waspaloy',
    chips: 'Kekuatan geser tinggi pada suhu ekstrem (> 800°C), elastisitas tinggi',
    characteristics: 'Material luar angkasa & turbin jet; mempertahankan kekuatan mekanik pada suhu merah menyala, sangat menuntut ketajaman pahat.',
    coating: 'PVD Nano-composite (AlTiSiN) tahan oksidasi panas hingga 1100°C dengan pendinginan bertekanan tinggi (High-pressure coolant).'
  },
  {
    letter: 'H',
    name: 'Baja Keras (Hardened Steel)',
    color: '#475569',
    bgColor: '#f1f5f9',
    examples: 'Baja Tool Steel Sepuhan (45 s.d. 65 HRC), Baja Bantalan SUJ2 (60 HRC)',
    chips: 'Tatal merah membara seperti jarum tajam, getaran potong tinggi',
    characteristics: 'Proses Hard Turning sebagai pengganti gerinda (grinding); membutuhkan geometri mata potong negatif berkekuatan puncak.',
    coating: 'CBN (Cubic Boron Nitride) atau Keramik Padat (Al2O3 + TiC) dengan chamfer penahan mata (T-land preparation).'
  }
];

// =============================================================================
// DATABASE 2: 6 JENIS UTAMA ALAT POTONG FRAIS (MILLING CUTTERS) + TAMBAHAN
// =============================================================================
const MILLING_CUTTERS_CATALOG = [
  {
    id: 'facemill',
    name: 'Face Mill (Pisau Frais Muka / Shell Mill)',
    category: 'Milling Permukaan Datar',
    icon: '🥞',
    diaRange: 'Ø40 – Ø200 mm',
    fluteOrInserts: '4 – 12 Indexable Inserts',
    leadAngle: '45° (Standar Serbaguna) atau 90° (Bahu Tegak)',
    deskripsi: 'Pisau frais berdiameter besar yang dipasang pada arbor mesin frais vertikal/horizontal. Dilengkapi banyak sisipan karbida (insert) lepas-pasang yang dapat diputar sisi potongnya jika aus.',
    fungsiUtama: 'Meratakan bidang permukaan datar atas balok logam dalam area lebar dengan laju pembuangan tatal (Material Removal Rate - MRR) yang sangat tinggi.',
    keunggulan: 'Sudut masuk 45° memberikan efek penipisan tatal (Chip Thinning Effect), sehingga kecepatan pemakanan (feed rate) dapat ditingkatkan hingga 40% tanpa membebani spindel secara berlebih.',
    tipsTeknis: 'Pastikan lebar pisau frais mencakup sekitar 70-80% dari lebar benda kerja (posisi offset sedikit dari sumbu tengah) agar insert masuk secara bertahap dan meminimalkan tumbukan.'
  },
  {
    id: 'endmill',
    name: 'Square End Mill (Pisau Frais Jari Ujung Datar)',
    category: 'Milling Kontur, Alur & Dinding',
    icon: '📏',
    diaRange: 'Ø2 – Ø25 mm (Solid Carbide / HSS)',
    fluteOrInserts: '2-Flute (Aluminium) / 4-Flute (Baja)',
    leadAngle: '90° (Tegak Lurus Siku)',
    deskripsi: 'Alat potong silindris dengan mata potong di sekeliling silinder (heliks) dan di muka ujungnya. Tersedia tipe Center-Cutting (bisa mengebor vertikal) dan Non-Center Cutting.',
    fungsiUtama: 'Membuat alur pasak (slotting), dinding tegak 90° siku sempurna, merapikan kontur luar profil benda, dan membuat kantong (pocketing).',
    keunggulan: 'Pisau 2-flute memiliki kantong tatal (flute pocket) yang sangat luas sehingga bram tidak menyumbat saat memotong aluminium. Pisau 4-flute memiliki inti tebal yang kokoh untuk finishing baja presisi.',
    tipsTeknis: 'Untuk pemotongan slot penuh (slotting kedalaman = diameter), kurangi kecepatan pemakanan hingga 50% dan gunakan pendingin semprot untuk meniup bram keluar dari alur.'
  },
  {
    id: 'ballmill',
    name: 'Ball Nose End Mill (Pisau Frais Ujung Bulat / Ball Mill)',
    category: 'Milling Permukaan 3D / Cetakan',
    icon: '🔮',
    diaRange: 'Ø1 – Ø20 mm (Radius R = D/2)',
    fluteOrInserts: '2 atau 4 Helical Flutes',
    leadAngle: 'Radius Kontur Bola (Hemisferikal)',
    deskripsi: 'Pisau frais yang memiliki ujung setengah bola sempurna dengan jari-jari R sama dengan separuh diameternya (misal endmill Ø10 mm memiliki radius ujung R5 mm).',
    fungsiUtama: 'Pemesinan kontur permukaan 3D bebas, rongga cetakan plastik (injection mold), dies penempaan, serta permukaan aerodinamis sudu turbin.',
    keunggulan: 'Mampu menghasilkan transisi kurva bebas yang mulus tanpa meninggalkan sudut tajam berundak, dengan jejak mata potong melengkung (cusp height terkontrol).',
    tipsTeknis: 'Perhatikan bahwa kecepatan potong efektif (effective cutting speed) di titik pusat puncak bola mendekati nol! Miringkan spindel 10°-15° pada mesin 5-axis agar titik potong aktif berada di sisi bola.'
  },
  {
    id: 'bullnose',
    name: 'Corner Radius / Bull Nose End Mill',
    category: 'Milling Pengasaran Berat & Fillet',
    icon: '🛡️',
    diaRange: 'Ø6 – Ø20 mm (Radius Pojok R0.5 – R3.0 mm)',
    fluteOrInserts: '3 – 5 Helical Flutes',
    leadAngle: '90° dengan Radius Sudut Pengaman',
    deskripsi: 'Pisau frais ujung datar yang bagian sudut tajam luarnya diberi pembulatan radius kecil (Corner Radius). Menggabungkan kelebihan Square End Mill dan Ball Mill.',
    fungsiUtama: 'Operasi pengasaran berat (heavy roughing), penggalian kantong berdinding tegak dengan fillet bawah, serta pemotongan material keras (Hard Milling).',
    keunggulan: 'Sudut yang dibulatkan menghilangkan konsentrasi tegangan tajam pada ujung pisau, sehingga mata potong jauh lebih tahan terhadap gompal (chipping) dan usia pahat meningkat hingga 2-3 kali lipat.',
    tipsTeknis: 'Sangat direkomendasikan untuk pemrograman High-Efficiency Milling (HEM) atau pemakanan trochoidal dengan kedalaman aksial dalam (Ap besar) dan radial tipis (Ae kecil).'
  },
  {
    id: 'tslot',
    name: 'T-Slot Milling Cutter (Pisau Frais Alur T)',
    category: 'Milling Alur Khusus Mesin',
    icon: '⚓',
    diaRange: 'Ø12 – Ø40 mm (Sesuai Standar Baut T ISO)',
    fluteOrInserts: 'Gigi Silang Bergantian (Staggered Teeth)',
    leadAngle: 'Piringan Cakram 90° Atas & Bawah',
    deskripsi: 'Pisau pemotong berkepala piringan cakram bergigi samping dan muka yang ditopang oleh tangkai leher silindris berdiameter lebih kecil dari kepalanya.',
    fungsiUtama: 'Membuat alur T standar ISO pada meja mesin frais, meja mesin serut, meja bor, serta blok pencekam ragum presisi.',
    keunggulan: 'Desain gigi silang (staggered teeth) membagi beban pemotongan antara sisi kiri dan kanan piringan, mencegah getaran (chatter) di dalam ruang tertutup sempit.',
    tipsTeknis: 'Alur T WAJIB didahului dengan pembuatan alur vertikal menggunakan Square End Mill biasa! Jangan pernah menusuk T-slot cutter langsung ke bongkahan logam mentah.'
  },
  {
    id: 'dovetail',
    name: 'Dovetail Milling Cutter (Pisau Frais Ekor Burung)',
    category: 'Milling Pemandu Luncur Mesin',
    icon: '🕊️',
    diaRange: 'Sudut 45°, 55°, dan 60° (Ø16 – Ø50 mm)',
    fluteOrInserts: 'Multi-Flute HSS / Solid Carbide',
    leadAngle: 'Konis Bersudut Miring 45°/55°/60°',
    deskripsi: 'Pisau frais berbentuk kerucut terbalik dengan sudut kemiringan standar tertentu yang memiliki mata potong heliks di sisi miring dan muka bawahnya.',
    fungsiUtama: 'Membuat alur pasak luncur pemandu (slideway / guideway) ekor burung pada eretan meja mesin bubut, meja mesin frais, dan komponen presisi mesin perkakas.',
    keunggulan: 'Membentuk sudut baji presisi yang berfungsi sebagai pengunci mekanis mandiri agar sambungan eretan mesin tidak terangkat saat menerima beban dorong.',
    tipsTeknis: 'Gunakan kedalaman potong bertahap (multi-pass) dengan putaran RPM stabil dan pelumasan melimpah, karena bram rentan terjebak di sudut baji lancip.'
  },
  {
    id: 'chamfermill',
    name: 'Chamfer Mill (Pisau Frais Kemiringan Tepi & Deburring)',
    category: 'Finishing & Deburring',
    icon: '📐',
    diaRange: 'Sudut 45° / 90° dan 60°',
    fluteOrInserts: '2 – 4 Flutes / Indexable Inserts',
    leadAngle: 'Konis 45° Simetris',
    deskripsi: 'Pisau konis berbentuk lancip V yang difungsikan khusus untuk menyayat sudut tepi tajam benda kerja setelah seluruh proses pemesinan selesai.',
    fungsiUtama: 'Menghilangkan burr tajam (deburring), membuat kemiringan chamfer 45° untuk keselamatan tangan operator, dan memberi jalan masuk (lead-in) baut.',
    keunggulan: 'Satu alat dapat digunakan untuk chamfering atas dan chamfering bawah (back chamfering) pada lubang pelat tanpa perlu membalik posisi benda kerja.',
    tipsTeknis: 'Gunakan bagian diameter tengah pisau untuk pemotongan chamfer, jangan gunakan ujung paling runcing karena kecepatan keliling (Vc) di titik puncak sangat rendah.'
  },
  {
    id: 'slittingsaw',
    name: 'Slitting Saw (Piringan Frais Pemotong Celah & Belah)',
    category: 'Pemotongan Celah Tipis',
    icon: '💿',
    diaRange: 'Ø50 – Ø125 mm (Tebal 0.5 – 4 mm)',
    fluteOrInserts: 'Gigi Banyak (Fine Pitch 30-80 Gigi)',
    leadAngle: 'Gergaji Piringan Tipis Radial',
    deskripsi: 'Piringan baja HSS tipis bergigi melingkar yang dipasang pada arbor horizontal dengan cincin penahan (spacing collars).',
    fungsiUtama: 'Membelah benda kerja logam, membuat alur celah klem pengunci ragum, dan membuat alur sempit kabel/kontak listrik.',
    keunggulan: 'Mampu menghasilkan celah yang sangat sempit dan presisi dengan lebar sayatan minimal sehingga menghemat bahan baku mahal.',
    tipsTeknis: 'Gunakan RPM rendah dan feed yang konsisten. Pastikan tidak ada geram yang terjepit di antara piringan dan dinding alur untuk mencegah bilah melengkung pecah.'
  }
];

// =============================================================================
// DATABASE 3: SISTEM DEKODER KODE STANDAR ISO 1832 INSERT KARBIDA
// =============================================================================
const INSERT_ISO_SYSTEM = {
  sampleCode: 'CNMG 120408-PM',
  positions: [
    {
      pos: 1,
      name: 'Bentuk Insert (Shape)',
      codeLetter: 'C',
      description: 'Menentukan sudut baji geometri insert dan kekuatan fisik mata potong.',
      options: [
        { code: 'C', label: 'Rhombic 80°', desc: 'Sangat kuat, serbaguna untuk bubut rata luar & muka (CNMG)' },
        { code: 'D', label: 'Rhombic 55°', desc: 'Fleksibel untuk profil kontur & pemotongan tirus (DNMG)' },
        { code: 'V', label: 'Rhombic 35°', desc: 'Ujung sangat lancip untuk kontur rumit & undercut sempit (VNMG)' },
        { code: 'T', label: 'Triangular 60°', desc: 'Segitiga ekonomis dengan 6 sisi potong (TNMG)' },
        { code: 'W', label: 'Trigon 80°', desc: 'Bintang trigon 3 sudut berkekuatan tinggi dengan 6 sisi potong (WNMG)' },
        { code: 'S', label: 'Square 90°', desc: 'Bujur sangkar 8 sisi potong untuk pengasaran berat (SNMG)' },
        { code: 'R', label: 'Round / Bulat', desc: 'Ketahanan mata potong tertinggi terhadap beban tumbukan (RNMG)' },
        { code: 'A', label: 'Parallelogram 85°', desc: 'Standar pisau frais bahu siku 90° (APKT / APMT)' }
      ]
    },
    {
      pos: 2,
      name: 'Sudut Bebas (Clearance Angle)',
      codeLetter: 'N',
      description: 'Sudut antara bidang bebas insert dengan garis tegak lurus bidang dasar.',
      options: [
        { code: 'N', label: '0° (Negative Insert)', desc: 'Insert bolak-balik 2 sisi muka (dua kali lipat sisi potong), sangat kokoh dan ekonomis' },
        { code: 'C', label: '7° (Positive Insert)', desc: 'Gaya potong rendah, cocok untuk mesin ringan, benda tipis, dan pembubutan dalam (boring)' },
        { code: 'P', label: '11° (Positive Insert)', desc: 'Mata potong sangat bebas, ideal untuk pemakanan ringan dan bebas getaran' },
        { code: 'B', label: '5° (Positive Insert)', desc: 'Kompromi antara kekuatan sisi potong dan kebebasan sudut bidang' }
      ]
    },
    {
      pos: 3,
      name: 'Kelas Toleransi (Tolerance Class)',
      codeLetter: 'M',
      description: 'Presisi dimensi ketebalan, lebar sudut, dan posisi lingkaran dalam (IC).',
      options: [
        { code: 'M', label: 'Molded (Standar Industri)', desc: 'Toleransi cetakan sinter standar industri, paling ekonomis untuk pembubutan umum' },
        { code: 'G', label: 'Ground (Gerinda Presisi)', desc: 'Tepi digerinda presisi tinggi untuk finishing mikro dan konsistensi ukuran ketat' },
        { code: 'E', label: 'Ekstra Presisi', desc: 'Toleransi sangat tinggi untuk perkakas indexing otomatis CNC berkecepatan tinggi' }
      ]
    },
    {
      pos: 4,
      name: 'Tipe Lubang & Pengencangan (Clamping / Hole)',
      codeLetter: 'G',
      description: 'Geometri lubang pengunci baut/klem serta konfigurasi alur pemecah tatal (chipbreaker).',
      options: [
        { code: 'G', label: 'Lubang Silindris + Chipbreaker 2 Muka', desc: 'Standar insert negatif CNMG dengan lubang baut dan alur bram di kedua sisinya' },
        { code: 'T', label: 'Lubang Konis 40°–60°', desc: 'Insert dikencangkan dengan sekrup tirus dari atas (Screw clamp)' },
        { code: 'W', label: 'Lubang Konis + Klem Tuas', desc: 'Pengencangan kombinasi tuas penarik (Lever lock) dari dalam lubang' },
        { code: 'N', label: 'Tanpa Lubang (Solid)', desc: 'Insert padat dikencangkan dengan klem jepit dari atas (Top clamp)' }
      ]
    },
    {
      pos: 5,
      name: 'Ukuran Panjang Sisi Potong (Size / IC)',
      codeLetter: '12',
      description: 'Panjang sisi potong efektif dalam milimeter (berkaitan dengan diameter lingkaran dalam IC).',
      options: [
        { code: '12', label: '12 mm (IC 12.7 mm)', desc: 'Ukuran standar utama untuk tangkai pahat bubut shank 20x20 mm dan 25x25 mm' },
        { code: '16', label: '16 mm (IC 15.875 mm)', desc: 'Ukuran besar untuk pemesinan berat dan kedalaman potong (DOC) hingga 6-8 mm' },
        { code: '09', label: '9 mm (IC 9.525 mm)', desc: 'Ukuran kompak untuk pahat bubut kecil shank 12-16 mm dan boring bar dalam' }
      ]
    },
    {
      pos: 6,
      name: 'Ketebalan Insert (Thickness)',
      codeLetter: '04',
      description: 'Ketebalan fisik pelat karbida dalam milimeter (kode 04 = tebal 4.76 mm).',
      options: [
        { code: '04', label: '4.76 mm (Kode 04)', desc: 'Ketebalan standar paling banyak digunakan di bengkel mesin' },
        { code: '03', label: '3.18 mm (Kode 03)', desc: 'Ketebalan sedang untuk pemotongan ringan hingga medium' },
        { code: '06', label: '6.35 mm (Kode 06)', desc: 'Ketebalan ekstra untuk menahan beban tumbukan pemotongan terputus (interrupted cut)' }
      ]
    },
    {
      pos: 7,
      name: 'Radius Ujung Pahat (Nose Radius rε)',
      codeLetter: '08',
      description: 'Jari-jari kelengkungan ujung mata potong (04 = 0.4 mm, 08 = 0.8 mm, 12 = 1.2 mm).',
      options: [
        { code: '04', label: 'rε = 0.4 mm (Finishing Halus)', desc: 'Gaya potong kecil, mencegah getaran (chatter) pada poros ramping dan dinding tipis' },
        { code: '08', label: 'rε = 0.8 mm (Medium / Serbaguna)', desc: 'Standar emas bengkel mesin: kompromi sempurna antara kekuatan mata potong dan kehalusan Ra' },
        { code: '12', label: 'rε = 1.2 mm (Roughing Berat)', desc: 'Ujung sangat kokoh, memungkinkan feed besar, tahan aus pada kerak cor keras' }
      ]
    }
  ]
};

// =============================================================================
// DATABASE 4: MATA BOR, SET TAP, DAN SNEI (THREADING & HOLEMAKING)
// =============================================================================
const HOLE_THREAD_TOOLS = [
  {
    id: 'twist-drill',
    name: 'Mata Bor Spiral (Twist Drill)',
    icon: '🔩',
    standar: 'DIN 338 / DIN 345 (Morse Taper)',
    sudutPuncak: '118° (Baja Lunak & Umum) vs 135° Split-Point (Baja Keras & Stainless)',
    anatomi: [
      { bagian: 'Tangkai (Shank)', fungsi: 'Bagian pemegang; silindris lurus untuk chuck bor atau Morse Taper (MT1-MT4) untuk spindel langsung.' },
      { bagian: 'Alur Spiral (Flute)', fungsi: 'Saluran pembuang tatal (chip evacuation) dan jalan masuk cairan pendingin (coolant).' },
      { bagian: 'Bibir Potong (Cutting Lips)', fungsi: 'Dua sisi potong utama yang menyayat logam di dasar lubang.' },
      { bagian: 'Tepi Pembimbing (Margin)', fungsi: 'Pita sempit di tepi alur yang menuntun bor agar lubang tetap lurus silindris dan tidak bergetar.' },
      { bagian: 'Mata Senter (Chisel Edge)', fungsi: 'Garis penghubung di ujung pusat; pada 135° split point garis ini ditipiskan agar bor tidak lari saat start.' }
    ],
    tipsPraktik: 'Selalu awali pengeboran logam dengan Center Drill (bor senter) untuk membuat titik pemusat akurat sebelum menggunakan twist drill berdiameter besar.'
  },
  {
    id: 'hand-tap-set',
    name: 'Set Hand Tap Manual (3 Buah Pembuat Ulir Dalam ISO)',
    icon: '🧵',
    standar: 'ISO 529 / DIN 352 (Metrik 60°)',
    sudutPuncak: 'Sudut Profil Gigi 60° Standar Metrik ISO',
    anatomi: [
      { bagian: 'Tap No. 1 (Taper / Pemula)', fungsi: 'Ditandai 1 strip cincin di tangkai; memiliki ketirusan panjang 8-10 gigi awal untuk mengawali ulir secara lurus dan ringan.' },
      { bagian: 'Tap No. 2 (Plug / Antara)', fungsi: 'Ditandai 2 strip cincin; tirus 3-5 gigi untuk membentuk profil alur ulir hingga mencapai 80% ukuran nominal.' },
      { bagian: 'Tap No. 3 (Bottoming / Finis)', fungsi: 'Tanpa cincin / 3 strip; tirus sangat pendek 1-1.5 gigi saja untuk menyelesaikan ulir hingga dasar lubang buntu (blind hole).' },
      { bagian: 'Tangkai Segi Empat (Square Drive)', fungsi: 'Ujung kotak untuk dijepit kuat pada gagang pemutar tap (Tap Wrench / Piringan Pemutar).' }
    ],
    tipsPraktik: 'Putar tap 1/2 putaran searah jarum jam untuk menyayat, lalu putar balik 1/4 putaran ke kiri untuk mematahkan tatal! Gunakan oli pelumas pemotongan.'
  },
  {
    id: 'snei-dies',
    name: 'Snei Bulat Terbelah (Split Round Threading Die)',
    icon: '⭕',
    standar: 'DIN EN 22568 / ISO Metrik 60°',
    sudutPuncak: 'Sudut Ulir 60° Luar untuk Baut & Poros',
    anatomi: [
      { bagian: 'Bodi Bulat Terbelah (Split Ring)', fungsi: 'Cincin baja perkakas keras berkepala ulir dalam dengan satu celah belah ekspansi.' },
      { bagian: 'Celah Belah & Lubang Penyetel', fungsi: 'Memungkinkan diameter ulir disetel sedikit lebih longgar atau rapat menggunakan 3 baut pada rumah snei (Die Stock).' },
      { bagian: 'Lubang Pembuang Bram', fungsi: '3 atau 4 lubang silinder di sela gigi untuk membuang tatal sayatan keluar saat memotong batang poros.' }
    ],
    tipsPraktik: 'Diameter poros bahan WAJIB dibubut sedikit lebih kecil dari diameter nominal ulir: Dporos = Dnominal - (0.1 x Kisar P). Buat chamfer 45° di ujung poros agar snei masuk lurus!'
  }
];

// Tabel Rekomendasi Lubang Bor Pra-Tap ISO Metrik Kasar
const TAP_DRILL_TABLE = [
  { baut: 'M3 × 0.5', pitch: 0.5, diaBor: 2.5, diaPorosSnei: 2.95 },
  { baut: 'M4 × 0.7', pitch: 0.7, diaBor: 3.3, diaPorosSnei: 3.93 },
  { baut: 'M5 × 0.8', pitch: 0.8, diaBor: 4.2, diaPorosSnei: 4.92 },
  { baut: 'M6 × 1.0', pitch: 1.0, diaBor: 5.0, diaPorosSnei: 5.90 },
  { baut: 'M8 × 1.25', pitch: 1.25, diaBor: 6.8, diaPorosSnei: 7.88 },
  { baut: 'M10 × 1.5', pitch: 1.5, diaBor: 8.5, diaPorosSnei: 9.85 },
  { baut: 'M12 × 1.75', pitch: 1.75, diaBor: 10.2, diaPorosSnei: 11.82 },
  { baut: 'M16 × 2.0', pitch: 2.0, diaBor: 14.0, diaPorosSnei: 15.80 }
];

// =============================================================================
// DATABASE 5: KUIS ASESMEN KOMPETENSI ALAT POTONG (10 SOAL)
// =============================================================================
const CUTTING_TOOLS_QUIZ = [
  {
    id: 1,
    q: 'Pada klasifikasi material ISO untuk insert karbida, warna BIRU dengan kode huruf "P" dikhususkan untuk memotong material...',
    opts: [
      'Baja Karbon dan Baja Paduan (Steel)',
      'Baja Tahan Karat (Stainless Steel)',
      'Besi Tuang / Besi Cor (Cast Iron)',
      'Aluminium dan Tembaga (Non-Ferrous)'
    ],
    ans: 0,
    exp: 'Kode ISO P (warna Biru) diperuntukkan khusus bagi kelompok Baja (Steel) seperti ST37, S45C, AISI 4140 yang menghasilkan tatal panjang bergelombang.'
  },
  {
    id: 2,
    q: 'Pada sistem kode ISO insert "CNMG 120408", huruf kedua yaitu "N" memiliki arti teknis bahwa insert tersebut memiliki...',
    opts: [
      'Sudut bebas 0° (Negative Insert, dapat dibalik kedua sisinya)',
      'Sudut bebas 7° (Positive Insert)',
      'Bahan dasar Nikel murni',
      'Sudut potong 35° lancip'
    ],
    ans: 0,
    exp: 'Huruf ke-2 menunjukkan sudut bebas (clearance angle). "N" berarti 0° (Negative insert), sehingga insert memiliki sisi potong di kedua muka (atas & bawah).'
  },
  {
    id: 3,
    q: 'Mengapa pisau frais Face Mill bersudut masuk (lead angle) 45° sangat disukai untuk pemakanan rata permukaan bidang lebar?',
    opts: [
      'Memberikan efek penipisan tatal (chip thinning) sehingga feed rate dapat dinaikkan lebih tinggi tanpa kelebihan beban',
      'Dapat membuat dinding siku tegak 90° sempurna',
      'Hanya membutuhkan 1 buah insert karbida saja',
      'Tidak menghasilkan panas sama sekali saat memotong'
    ],
    ans: 0,
    exp: 'Sudut masuk 45° menipiskan ketebalan tatal maksimum menjadi 0.707 dari nilai feed, mendistribusikan beban secara seimbang antara gaya aksial dan radial.'
  },
  {
    id: 4,
    q: 'Untuk membuat alur pasak poros (keyway) dengan dinding siku tegak 90° sempurna pada mesin frais, jenis pisau frais yang paling tepat adalah...',
    opts: [
      'Square End Mill (Pisau Frais Jari Ujung Datar)',
      'Ball Nose End Mill',
      'Face Mill 45°',
      'Slitting Saw gergaji tipis'
    ],
    ans: 0,
    exp: 'Square End Mill memiliki sudut pojok 90° tegak lurus sempurna, sangat ideal untuk pembuatan alur pasak dan dinding bahu siku.'
  },
  {
    id: 5,
    q: 'Berapakah ukuran diameter mata bor yang tepat untuk membuat lubang sebelum di-tap ulir dalam Metrik M10 × 1.5?',
    opts: [
      'Ø 8.5 mm',
      'Ø 10.0 mm',
      'Ø 9.0 mm',
      'Ø 7.5 mm'
    ],
    ans: 0,
    exp: 'Rumus lubang bor pra-tap metrik standar: D_bor = D_nominal - Kisar (P) = 10 - 1.5 = 8.5 mm.'
  },
  {
    id: 6,
    q: 'Pada set Hand Tap manual standar ISO yang terdiri dari 3 buah tap, tap nomor berapakah yang digunakan untuk memulai pemotongan awal?',
    opts: [
      'Tap No. 1 (Taper / Tirus panjang 8-10 gigi awal)',
      'Tap No. 2 (Plug / Antara)',
      'Tap No. 3 (Bottoming / Finis)',
      'Bisa sembarang tap tanpa urutan'
    ],
    ans: 0,
    exp: 'Tap No. 1 (Taper) memiliki tirus terpanjang (8-10 gigi awal) untuk memandu masuknya tap secara lurus dan membagi beban sayatan pertama secara ringan.'
  },
  {
    id: 7,
    q: 'Sebelum membuat ulir luar menggunakan Snei (Die) pada poros berdiameter nominal M12 × 1.75, diameter bahan poros sebaiknya dibubut berukuran...',
    opts: [
      'Sedikit lebih kecil sekitar Ø 11.82 mm (D - 0.1 x P)',
      'Tepat Ø 12.00 mm',
      'Lebih besar Ø 12.50 mm',
      'Ø 10.25 mm'
    ],
    ans: 0,
    exp: 'Agar pemakanan snei tidak macet dan puncak ulir tidak pecah, diameter poros dibubut: D_poros = D_nominal - (0.1 x P) = 12 - 0.175 = 11.825 mm.'
  },
  {
    id: 8,
    q: 'Pisau frais Ball Nose End Mill (Ball Mill) sangat unggul dan lazim digunakan untuk pengerjaan...',
    opts: [
      'Pemesinan permukaan kontur kurva 3D bebas dan rongga cetakan (mold & die)',
      'Membuat ulir luar pipa',
      'Memotong pelat strip menjadi dua bagian',
      'Mengebor lubang bertingkat'
    ],
    ans: 0,
    exp: 'Ujung hemisferikal (setengah bola) pada Ball Mill memungkinkan pisau bergerak dalam koordinat 3D untuk membentuk permukaan melengkung mulus.'
  },
  {
    id: 9,
    q: 'Hubungan antara sudut tatal (Rake Angle / γ), sudut baji (Wedge Angle / β), dan sudut bebas (Clearance Angle / α) pada pahat bubut adalah...',
    opts: [
      'α + β + γ = 90°',
      'α + β - γ = 180°',
      'α × β = γ',
      'α + β + γ = 360°'
    ],
    ans: 0,
    exp: 'Pada bidang acuan tegak lurus, jumlah sudut bebas (α), sudut baji (β), dan sudut tatal (γ) selalu berjumlah 90 derajat siku.'
  },
  {
    id: 10,
    q: 'Sudut puncak (Point Angle) standar untuk mata bor spiral (Twist Drill) yang digunakan untuk mengebor baja karbon lunak adalah...',
    opts: [
      '118°',
      '90°',
      '135°',
      '60°'
    ],
    ans: 0,
    exp: 'Standar sudut puncak bor DIN untuk baja karbon umum adalah 118°, sedangkan 135° split-point digunakan untuk material keras dan stainless steel.'
  }
];

// =============================================================================
// KOMPONEN UTAMA: MachineCuttingToolsLab
// =============================================================================
const MachineCuttingToolsLab = ({ addXP = () => {}, onNavigateToLathe, onNavigateToMilling }) => {
  const [activeTab, setActiveTab] = useState('pahat'); // 'pahat', 'milling', 'insert', 'hole-thread', 'kalkulator', 'quiz'
  const [selectedIsoCat, setSelectedIsoCat] = useState('P');
  const [selectedMillingId, setSelectedMillingId] = useState('facemill');
  const [activeInsertPos, setActiveInsertPos] = useState(1);
  const [activeHoleToolId, setActiveHoleToolId] = useState('twist-drill');

  // State Kalkulator Kecepatan Potong
  const [calcMaterialVc, setCalcMaterialVc] = useState(120); // m/min
  const [calcDia, setCalcDia] = useState(50); // mm
  const [calcTeeth, setCalcTeeth] = useState(5); // jumlah mata potong (Z)
  const [calcFz, setCalcFz] = useState(0.12); // mm/gigi

  // Hasil Kalkulasi
  const calcRpm = useMemo(() => {
    if (!calcDia || calcDia <= 0) return 0;
    return Math.round((1000 * calcMaterialVc) / (Math.PI * calcDia));
  }, [calcMaterialVc, calcDia]);

  const calcFeedRate = useMemo(() => {
    return Math.round(calcRpm * calcFz * calcTeeth);
  }, [calcRpm, calcFz, calcTeeth]);

  // State Kuis
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [xpClaimed, setXpClaimed] = useState(false);

  const handleSelectAnswer = (qId, optionIdx) => {
    if (quizSubmitted) return;
    sound.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleGradeQuiz = () => {
    sound.playClick();
    let correct = 0;
    CUTTING_TOOLS_QUIZ.forEach(q => {
      if (selectedAnswers[q.id] === q.ans) correct += 1;
    });
    const finalScore = Math.round((correct / CUTTING_TOOLS_QUIZ.length) * 100);
    setQuizScore(finalScore);
    setQuizSubmitted(true);

    if (finalScore >= 70) {
      sound.playLevelUp?.();
    } else {
      sound.playComplete?.();
    }

    try {
      recordQuizResult('Machine Lab - Cutting Tools', finalScore, finalScore >= 70);
    } catch {
      // silent
    }
  };

  const handleClaimXP = () => {
    if (xpClaimed) return;
    sound.playLevelUp?.();
    addXP(1000);
    setXpClaimed(true);
  };

  const handleResetQuiz = () => {
    sound.playClick();
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setXpClaimed(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
        color: '#ffffff',
        padding: '24px 28px',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(3, 105, 161, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        border: '1px solid #334155'
      }}>
        <div style={{ maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.72rem', fontWeight: 900, padding: '3px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              MACHINE LAB • CUTTING TOOLS ACADEMY
            </span>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#e0f2fe', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
              ISO 1832 • DIN 338 • SANDVIK COROMANT
            </span>
          </div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '1.65rem', fontWeight: 900, letterSpacing: '0.5px', color: '#ffffff' }}>
            🔪 Cutting Tools Lab: Katalog Visual Alat Potong Mesin
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            Eksplorasi mendalam anatomi pahat bubut HSS &amp; karbida, 6+ jenis pisau frais (Face Mill, End Mill, Ball Mill, dll.), dekoder kode insert ISO, geometri sudut potong, serta kalkulator parameter pemesinan presisi.
          </p>
        </div>

        {/* Quick Jump Buttons to Practical Simulators */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onNavigateToLathe && (
            <button
              onClick={() => { sound.playClick(); onNavigateToLathe(); }}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <span>⚙️</span> Praktik Bubut
            </button>
          )}
          {onNavigateToMilling && (
            <button
              onClick={() => { sound.playClick(); onNavigateToMilling(); }}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s'
              }}
            >
              <span>🪵</span> Praktik Frais
            </button>
          )}
        </div>
      </div>

      {/* 6 MAIN CATEGORY TABS */}
      <div style={{
        display: 'flex',
        gap: '6px',
        background: '#ffffff',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        overflowX: 'auto',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        {[
          { id: 'pahat', label: '1. Pahat Bubut (HSS & Karbida)', icon: '🪓', color: '#2563eb' },
          { id: 'milling', label: '2. Pisau Frais / Milling (6 Jenis)', icon: '🌀', color: '#0284c7' },
          { id: 'insert', label: '3. Insert Karbida & Sudut Geometri', icon: '📐', color: '#ea580c' },
          { id: 'hole-thread', label: '4. Mata Bor, Tap & Snei', icon: '🔩', color: '#16a34a' },
          { id: 'kalkulator', label: '5. Kalkulator Kecepatan Potong', icon: '🧮', color: '#7c3aed' },
          { id: 'quiz', label: '6. Kuis Asesmen (1000 XP)', icon: '🎯', color: '#dc2626' }
        ].map(t => {
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { sound.playClick(); setActiveTab(t.id); }}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: isSelected ? `2px solid ${t.color}` : '1px solid transparent',
                background: isSelected ? `${t.color}15` : 'transparent',
                color: isSelected ? t.color : '#475569',
                fontWeight: isSelected ? 900 : 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: PAHAT BUBUT (HSS & KARBIDA INSERT)                             */}
      {/* ===================================================================== */}
      {activeTab === 'pahat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card Visual Anatomi Pahat Bubut */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  ANATOMI ALAT POTONG TUNGGAL (SINGLE POINT TOOL)
                </span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
                  🔍 Anatomi Geometri Pahat Bubut Standar ISO
                </h3>
              </div>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Pedoman Sudut Siku: <strong>Sudut Bebas (α) + Sudut Baji (β) + Sudut Tatal (γ) = 90°</strong>
              </span>
            </div>

            {/* SVG Visual Anatomi Pahat */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 760 300" style={{ width: '100%', maxWidth: '750px', height: 'auto', maxHeight: '290px' }}>
                <defs>
                  <linearGradient id="shankGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                  <linearGradient id="insertGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                  <marker id="arrow-geo" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#2563eb" />
                  </marker>
                </defs>

                {/* Shank Badan Pahat Baja */}
                <rect x="240" y="80" width="460" height="130" fill="url(#shankGrad)" rx="6" stroke="#1e293b" strokeWidth="2" />
                <text x="470" y="150" fill="#cbd5e1" fontSize="16" fontWeight="900" letterSpacing="3">
                  TANGKAI PAHAT (TOOL SHANK 25×25 mm)
                </text>

                {/* Dudukan Insert / Pocket */}
                <polygon points="120,60 250,60 250,180 160,210 90,130" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

                {/* Insert Karbida Emas (Rhombic 80° CNMG) */}
                <polygon points="110,65 210,65 170,175 70,175" fill="url(#insertGold)" stroke="#ca8a04" strokeWidth="2.5" />
                {/* Lubang Baut Pengunci Tengah */}
                <circle cx="140" cy="120" r="14" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                <circle cx="140" cy="120" r="8" fill="#1e293b" />
                {/* Alur Chipbreaker */}
                <path d="M 100,75 Q 140,85 190,75" fill="none" stroke="#b45309" strokeWidth="3" />
                <path d="M 80,165 Q 120,155 160,165" fill="none" stroke="#b45309" strokeWidth="3" />

                {/* Sudut Hidung Pahat (Nose Radius) */}
                <circle cx="70" cy="175" r="7" fill="#dc2626" opacity="0.85" />

                {/* Pin / Callout 1: Tangkai (Shank) */}
                <circle cx="500" cy="80" r="10" fill="#2563eb" />
                <text x="500" y="84" fill="#fff" fontSize="10" fontWeight="900" textAnchor="middle">1</text>

                {/* Pin / Callout 2: Insert Karbida */}
                <circle cx="140" cy="90" r="10" fill="#2563eb" />
                <text x="140" y="94" fill="#fff" fontSize="10" fontWeight="900" textAnchor="middle">2</text>

                {/* Pin / Callout 3: Sisi Potong Utama */}
                <circle cx="90" cy="175" r="10" fill="#2563eb" />
                <text x="90" y="179" fill="#fff" fontSize="10" fontWeight="900" textAnchor="middle">3</text>

                {/* Pin / Callout 4: Radius Hidung (rε) */}
                <circle cx="55" cy="190" r="10" fill="#dc2626" />
                <text x="55" y="194" fill="#fff" fontSize="10" fontWeight="900" textAnchor="middle">4</text>

                {/* Pin / Callout 5: Alur Pemecah Tatal (Chipbreaker) */}
                <circle cx="115" cy="72" r="10" fill="#16a34a" />
                <text x="115" y="76" fill="#fff" fontSize="10" fontWeight="900" textAnchor="middle">5</text>

                {/* Label Panah Arah Putaran Benda Kerja */}
                <path d="M 30,130 Q 30,220 70,240" fill="none" stroke="#0284c7" strokeWidth="2.5" markerEnd="url(#arrow-geo)" strokeDasharray="6 3" />
                <text x="20" y="120" fill="#0284c7" fontSize="11" fontWeight="800">Putaran Spindel n (RPM)</text>
              </svg>
            </div>

            {/* Keterangan 5 Komponen Anatomi Pahat */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                { no: '1', title: 'Tangkai Pahat (Shank)', desc: 'Badan baja perkakas berpenampang kotak (20x20 atau 25x25 mm) yang dicekam pada tool post eretan mesin bubut.' },
                { no: '2', title: 'Sisipan Karbida (Insert)', desc: 'Pelat keras Tungsten Carbide berlapis TiN/AlTiN yang melakukan kontak langsung penyayatan pada suhu di atas 800°C.' },
                { no: '3', title: 'Sisi Potong Utama (Major Edge)', desc: 'Garis tepi tajam yang menyayat ketebalan tatal utama saat pahat digerakkan membubut memanjang.' },
                { no: '4', title: 'Radius Hidung (Nose Radius rε)', desc: 'Jari-jari lengkung di titik temu mata potong; menentukan kekuatan ujung dan kehalusan permukaan (Ra).' },
                { no: '5', title: 'Chipbreaker (Alur Tatal)', desc: 'Kontur cekungan pada bidang tatal yang melipat dan mematahkan tatal kontinu menjadi serpihan pendek aman.' }
              ].map(c => (
                <div key={c.no} style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', marginBottom: '4px' }}>
                    #{c.no}. {c.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
                    {c.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PERBANDINGAN: BAJA HSS VS KARBIDA SINTERED */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Kartu HSS */}
            <div className="dashboard-card" style={{ padding: '20px', borderTop: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  Baja HSS (High Speed Steel)
                </h4>
                <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  Standar M2 &amp; M42 Cobalt
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#334155', lineHeight: 1.7 }}>
                <li><strong>Ketahanan Panas (Red Hardness):</strong> Bertahan hingga 550°C – 600°C sebelum melunak.</li>
                <li><strong>Keuletan (Toughness):</strong> Sangat tinggi; tahan terhadap getaran dan beban kejut saat menyayat benda berlubang.</li>
                <li><strong>Kemudahan Pengasahan:</strong> Dapat diasah ulang dengan mudah menggunakan batu gerinda korundum putih (Al2O3).</li>
                <li><strong>Kecepatan Potong (Vc):</strong> Rendah (20 – 40 m/min pada baja ST37).</li>
                <li><strong>Aplikasi Ideal:</strong> Bengkel manual, produksi satuan, pahat profil khusus buatan sendiri, bor, dan tap ulir.</li>
              </ul>
            </div>

            {/* Kartu Karbida Sintered */}
            <div className="dashboard-card" style={{ padding: '20px', borderTop: '4px solid #ea580c' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  Karbida Sintered (Tungsten Carbide WC-Co)
                </h4>
                <span style={{ fontSize: '0.72rem', background: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  Kekerasan 90 – 93 HRA
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#334155', lineHeight: 1.7 }}>
                <li><strong>Ketahanan Panas (Red Hardness):</strong> Bertahan stabil di atas 1000°C – 1200°C tanpa kehilangan kekerasan.</li>
                <li><strong>Keuletan (Toughness):</strong> Cenderung getas; rentan patah/chipping bila mesin mengalami getaran kuat.</li>
                <li><strong>Kemudahan Pengasahan:</strong> Hanya dapat diasah dengan roda intan (Diamond wheel) atau diganti sisipan insert-nya.</li>
                <li><strong>Kecepatan Potong (Vc):</strong> Sangat tinggi (120 – 350 m/min pada baja, 1000 m/min pada aluminium).</li>
                <li><strong>Aplikasi Ideal:</strong> Mesin CNC, produksi massal berkecepatan tinggi, pemotongan material keras.</li>
              </ul>
            </div>
          </div>

          {/* KLASIFIKASI KODE WARNA STANDAR ISO UNTUK MATERIAL BENDA KERJA */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px' }}>
                STANDAR INTERNASIONAL ISO 513
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                🎨 Kode Warna ISO Material Benda Kerja pada Insert Karbida
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                Pilihlah huruf kategori di bawah untuk melihat spesifikasi tatal, rekomendasi pelapis, dan penanganan mesin:
              </p>
            </div>

            {/* Button Selector 6 Kategori ISO */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ISO_MATERIAL_CATEGORIES.map(cat => {
                const isSelected = selectedIsoCat === cat.letter;
                return (
                  <button
                    key={cat.letter}
                    onClick={() => { sound.playClick(); setSelectedIsoCat(cat.letter); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: isSelected ? `2.5px solid ${cat.color}` : '1.5px solid #cbd5e1',
                      background: isSelected ? cat.bgColor : '#ffffff',
                      color: isSelected ? cat.color : '#334155',
                      fontWeight: 900,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: cat.color, color: '#fff', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900
                    }}>
                      {cat.letter}
                    </span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Detail Box Kategori Terpilih */}
            {(() => {
              const current = ISO_MATERIAL_CATEGORIES.find(c => c.letter === selectedIsoCat) || ISO_MATERIAL_CATEGORIES[0];
              return (
                <div style={{
                  background: current.bgColor,
                  border: `2px solid ${current.color}`,
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: current.color }}>
                      Kategori ISO {current.letter} • {current.name}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#ffffff', color: current.color, padding: '3px 10px', borderRadius: '6px', border: `1px solid ${current.color}` }}>
                      Warna Penanda: {current.letter === 'P' ? 'BIRU' : current.letter === 'M' ? 'KUNING' : current.letter === 'K' ? 'MERAH' : current.letter === 'N' ? 'HIJAU' : current.letter === 'S' ? 'ORANYE' : 'ABU-ABU'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', fontSize: '0.83rem', color: '#1e293b' }}>
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px' }}>
                      <strong style={{ color: current.color }}>Contoh Material Nyata:</strong><br />
                      {current.examples}
                    </div>
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px' }}>
                      <strong style={{ color: current.color }}>Bentuk Tatal (Chips):</strong><br />
                      {current.chips}
                    </div>
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px' }}>
                      <strong style={{ color: current.color }}>Karakteristik Pemotongan:</strong><br />
                      {current.characteristics}
                    </div>
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px' }}>
                      <strong style={{ color: current.color }}>Rekomendasi Pelapis (Coating):</strong><br />
                      {current.coating}
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: ALAT POTONG FRAIS / MILLING CUTTERS (6 JENIS UTAMA)            */}
      {/* ===================================================================== */}
      {activeTab === 'milling' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Card */}
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #0369a1, #0c4a6e)', color: '#ffffff' }}>
            <span style={{ background: '#38bdf8', color: '#082f49', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              KATALOG 8 PISAU FRAIS MESIN (MILLING CUTTERS)
            </span>
            <h2 style={{ margin: '8px 0 6px 0', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
              Jenis-Jenis Alat Potong Pekerjaan Frais (Milling)
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#e0f2fe', lineHeight: 1.5, maxWidth: '850px' }}>
              Mesin frais menggunakan alat potong multi-gigi yang berputar menyayat benda kerja yang bergerak translasi. Setiap geometri pisau dirancang spesifik untuk menghasilkan bidang rata, alur pasak, dinding 90°, profil 3D, alur T, maupun alur ekor burung.
            </p>
          </div>

          {/* Quick Selector Grid Pisau Frais */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}>
            {MILLING_CUTTERS_CATALOG.map(tool => {
              const isSelected = selectedMillingId === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => { sound.playClick(); setSelectedMillingId(tool.id); }}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: isSelected ? '2.5px solid #0284c7' : '1px solid #cbd5e1',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    color: isSelected ? '#0369a1' : '#1e293b',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.6rem' }}>{tool.icon}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: isSelected ? '#0284c7' : '#e2e8f0', color: isSelected ? '#fff' : '#475569' }}>
                      {tool.category}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                    {tool.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    {tool.diaRange}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail Showcase Pisau Frais Terpilih */}
          {(() => {
            const current = MILLING_CUTTERS_CATALOG.find(t => t.id === selectedMillingId) || MILLING_CUTTERS_CATALOG[0];
            return (
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', borderLeft: '6px solid #0284c7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '4px' }}>
                      {current.category}
                    </span>
                    <h3 style={{ margin: '8px 0 4px 0', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                      {current.icon} {current.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Rentang Diameter: <strong>{current.diaRange}</strong> • Mata Potong: <strong>{current.fluteOrInserts}</strong>
                    </div>
                  </div>

                  <span style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: 800, color: '#0369a1' }}>
                    Sudut Masuk: {current.leadAngle}
                  </span>
                </div>

                <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {current.deskripsi}
                </div>

                {/* 3 Kolom Penjelasan Fungsi, Keunggulan & Tips Bengkel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                  <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e40af', marginBottom: '6px' }}>
                      🎯 Fungsi Utama Pengerjaan
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                      {current.fungsiUtama}
                    </div>
                  </div>

                  <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#166534', marginBottom: '6px' }}>
                      ⚡ Keunggulan Mekanik
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#14532d', lineHeight: 1.5 }}>
                      {current.keunggulan}
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', padding: '14px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#92400e', marginBottom: '6px' }}>
                      💡 Tips &amp; Trik Bengkel
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
                      {current.tipsTeknis}
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: INSERT KARBIDA, KODE ISO & SUDUT GEOMETRI                      */}
      {/* ===================================================================== */}
      {activeTab === 'insert' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* DEKODER KODE STANDAR ISO 1832 INSERT */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '4px' }}>
                STANDARISASI SISTEM KODE ISO 1832
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                🏷️ Dekoder Interaktif Kode ISO Insert Karbida: CNMG 120408
              </h3>
              <p style={{ margin: 0, fontSize: '0.83rem', color: '#64748b' }}>
                Klik salah satu huruf/angka pada blok kode di bawah ini untuk mempelajari makna teknis, sudut geometri, dan fungsi pemotongannya:
              </p>
            </div>

            {/* Interactive Code Display Bar */}
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '14px',
              background: '#0f172a',
              borderRadius: '12px',
              overflowX: 'auto',
              justifyContent: 'center'
            }}>
              {INSERT_ISO_SYSTEM.positions.map(p => {
                const isSelected = activeInsertPos === p.pos;
                return (
                  <button
                    key={p.pos}
                    onClick={() => { sound.playClick(); setActiveInsertPos(p.pos); }}
                    style={{
                      background: isSelected ? '#ea580c' : '#1e293b',
                      color: '#ffffff',
                      border: isSelected ? '2px solid #fdba74' : '1px solid #334155',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '1px' }}>
                      {p.codeLetter}
                    </span>
                    <span style={{ fontSize: '0.64rem', color: isSelected ? '#ffedd5' : '#94a3b8', whiteSpace: 'nowrap' }}>
                      #{p.pos}: {p.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Panel Penjelasan Posisi Terpilih */}
            {(() => {
              const currentPos = INSERT_ISO_SYSTEM.positions.find(p => p.pos === activeInsertPos) || INSERT_ISO_SYSTEM.positions[0];
              return (
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                      Posisi #{currentPos.pos}: {currentPos.name} (Kode Saat Ini: <span style={{ color: '#ea580c' }}>{currentPos.codeLetter}</span>)
                    </div>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#475569' }}>
                    {currentPos.description}
                  </div>

                  {/* Opsi Huruf/Nilai Standar ISO */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                    {currentPos.options.map(opt => {
                      const isMatch = opt.code === currentPos.codeLetter;
                      return (
                        <div
                          key={opt.code}
                          style={{
                            background: isMatch ? '#fff7ed' : '#ffffff',
                            border: isMatch ? '2px solid #ea580c' : '1px solid #e2e8f0',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <span style={{
                            fontSize: '1rem', fontWeight: 900, color: isMatch ? '#ea580c' : '#0f172a',
                            background: isMatch ? '#ffedd5' : '#f1f5f9', width: '28px', height: '28px',
                            borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {opt.code}
                          </span>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a' }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                              {opt.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          </div>

          {/* GEOMETRI SUDUT MATA POTONG (RAKE, CLEARANCE, NOSE RADIUS, CHIPBREAKER) */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              📐 4 Sudut Geometri Kritis &amp; Fungsinya pada Pembentukan Tatal
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* Sudut Tatal */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', borderTop: '4px solid #2563eb' }}>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#1e40af', marginBottom: '6px' }}>
                  1. Sudut Tatal (Rake Angle / γ)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.55 }}>
                  • <strong>Positif (+):</strong> Tepi sangat tajam, gaya potong ringan, minim panas. Sangat cocok untuk aluminium, tembaga, dan baja ulet.<br />
                  • <strong>Negatif (-):</strong> Ujung sangat kuat tahan benturan saat membubut benda bersegi atau kerak cor kasar, menuntut daya mesin lebih besar.
                </div>
              </div>

              {/* Sudut Bebas */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', borderTop: '4px solid #16a34a' }}>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#166534', marginBottom: '6px' }}>
                  2. Sudut Bebas (Clearance Angle / α)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.55 }}>
                  • Menghindari gesekan friksi antara bidang bebas pahat (flank) dengan permukaan benda kerja yang telah terpotong.<br />
                  • <strong>Bila terlalu kecil (&lt; 5°):</strong> Pahat bergesek panas, timbul getaran (chatter) dan permukaan kasar.<br />
                  • <strong>Bila terlalu besar (&gt; 12°):</strong> Ujung mata potong menjadi rapuh dan mudah patah.
                </div>
              </div>

              {/* Radius Ujung & Kehalusan */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', borderTop: '4px solid #ea580c' }}>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#c2410c', marginBottom: '6px' }}>
                  3. Radius Hidung (Nose Radius / rε)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.55 }}>
                  • <strong>Rumus Kehalusan Permukaan Teoretis:</strong><br />
                  <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>Ra ≈ (f² / 32·rε) × 1000 µm</code><br />
                  • Radius lebih besar (rε = 1.2 mm) menghasilkan permukaan lebih halus pada feed sama, tetapi gaya radial meningkat dan rentan defleksi pada poros ramping.
                </div>
              </div>

              {/* Sudut Masuk */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', borderTop: '4px solid #7c3aed' }}>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#6d28d9', marginBottom: '6px' }}>
                  4. Sudut Masuk (Entering Angle / κr)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.55 }}>
                  • <strong>Sudut 90°:</strong> Gaya potong murni radial searah pemakanan, tidak membelokkan benda kerja tipis, menghasilkan bahu siku 90°.<br />
                  • <strong>Sudut 45°:</strong> Efek Chip Thinning; ketebalan tatal menipis sehingga kecepatan sayat feed bisa digandakan untuk produktivitas tinggi.
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: MATA BOR, SET TAP & SNEI (HOLEMAKING & THREADING)              */}
      {/* ===================================================================== */}
      {activeTab === 'hole-thread' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Card */}
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #15803d, #14532d)', color: '#ffffff' }}>
            <span style={{ background: '#86efac', color: '#052e16', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              PEMBUATAN LUBANG &amp; ULIR PRESISI
            </span>
            <h2 style={{ margin: '8px 0 6px 0', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
              Mata Bor Spiral (Drill), Set Hand Tap, &amp; Snei (Dies)
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#dcfce7', lineHeight: 1.5, maxWidth: '850px' }}>
              Pengeboran dan pembuatan ulir manual/mesin menuntut ketepatan diameter lubang pra-ulir. Jika lubang bor terlalu kecil, tap akan patah di dalam lubang; jika terlalu besar, puncak ulir tidak terbentuk sempurna.
            </p>
          </div>

          {/* 3 Tool Switcher Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {HOLE_THREAD_TOOLS.map(t => {
              const isSelected = activeHoleToolId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { sound.playClick(); setActiveHoleToolId(t.id); }}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isSelected ? '2.5px solid #16a34a' : '1px solid #cbd5e1',
                    background: isSelected ? '#f0fdf4' : '#ffffff',
                    color: isSelected ? '#15803d' : '#1e293b',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: isSelected ? '0 4px 14px rgba(22, 163, 74, 0.2)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: '1.8rem' }}>{t.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: '1rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.standar}</div>
                </button>
              );
            })}
          </div>

          {/* Showcase Alat Terpilih */}
          {(() => {
            const current = HOLE_THREAD_TOOLS.find(t => t.id === activeHoleToolId) || HOLE_THREAD_TOOLS[0];
            return (
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', borderLeft: '6px solid #16a34a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                    {current.icon} {current.name}
                  </h3>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem' }}>
                    {current.sudutPuncak}
                  </span>
                </div>

                {/* Anatomi Komponen */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {current.anatomi.map((a, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#15803d', marginBottom: '4px' }}>
                        • {a.bagian}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                        {a.fungsi}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 18px', borderRadius: '8px', fontSize: '0.84rem', color: '#14532d', lineHeight: 1.5 }}>
                  💡 <strong>Kaidah Praktik Kerja Bangku &amp; Mesin:</strong> {current.tipsPraktik}
                </div>
              </div>
            );
          })()}

          {/* TABEL STANDAR LUBANG BOR PRA-TAP METRIK ISO (RUMUS D = Dnom - P) */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  📊 Tabel Standar Diameter Lubang Bor Pra-Tap &amp; Poros Snei ISO
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Rumus Lubang Tap: <code>Dbor = D - P</code> • Rumus Poros Snei: <code>Dporos = D - (0.1 × P)</code>
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                    <th style={{ padding: '10px 14px', borderRadius: '6px 0 0 0' }}>Ukuran Ulir Baut (Metrik)</th>
                    <th style={{ padding: '10px 14px' }}>Kisar Pitch (P mm)</th>
                    <th style={{ padding: '10px 14px' }}>Diameter Lubang Bor (mm)</th>
                    <th style={{ padding: '10px 14px', borderRadius: '0 6px 0 0' }}>Diameter Poros Snei (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {TAP_DRILL_TABLE.map((row, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0f172a' }}>{row.baut}</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{row.pitch} mm</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#16a34a' }}>Ø {row.diaBor.toFixed(1)} mm</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#0284c7' }}>Ø {row.diaPorosSnei.toFixed(2)} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: KALKULATOR KECEPATAN POTONG & PARAMETER PEMESINAN              */}
      {/* ===================================================================== */}
      {activeTab === 'kalkulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #6d28d9, #4c1d95)', color: '#ffffff' }}>
            <span style={{ background: '#c4b5fd', color: '#2e1065', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              KALKULATOR PARAMETER TEKNIK PEMESINAN
            </span>
            <h2 style={{ margin: '8px 0 6px 0', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
              Kalkulator Putaran Spindel (RPM n) &amp; Kecepatan Makan (F)
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#ede9fe', lineHeight: 1.5, maxWidth: '850px' }}>
              Gunakan rumus resmi manufaktur: <code>n = (1000 × Vc) / (π × d)</code> dan <code>F = fz × z × n</code> untuk menghitung kecepatan potong mesin bubut maupun frais secara instan.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* INPUT CONTROLS */}
            <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                ⚙️ Parameter Input Pemesinan
              </h3>

              {/* Material Preset Buttons */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  PRESET KECEPATAN POTONG (Vc) MATERIAL:
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Baja ST37 (HSS: 30 m/min)', vc: 30 },
                    { label: 'Baja ST37 (Karbida: 140 m/min)', vc: 140 },
                    { label: 'Aluminium (Karbida: 350 m/min)', vc: 350 },
                    { label: 'Stainless 304 (Karbida: 90 m/min)', vc: 90 },
                    { label: 'Besi Cor (Karbida: 110 m/min)', vc: 110 }
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => { sound.playClick(); setCalcMaterialVc(p.vc); }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: calcMaterialVc === p.vc ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                        background: calcMaterialVc === p.vc ? '#ede9fe' : '#ffffff',
                        color: calcMaterialVc === p.vc ? '#6d28d9' : '#334155',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Vc */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Cutting Speed Vc (meter/menit):
                </label>
                <input
                  type="number"
                  value={calcMaterialVc}
                  onChange={e => setCalcMaterialVc(Number(e.target.value) || 0)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 800 }}
                />
              </div>

              {/* Input Diameter */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Diameter Benda Kerja / Pisau Frais d (mm):
                </label>
                <input
                  type="number"
                  value={calcDia}
                  onChange={e => setCalcDia(Number(e.target.value) || 0)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 800 }}
                />
              </div>

              {/* Input Gigi Z (Khusus Frais) */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Jumlah Gigi / Insert Pisau Frais (Z):
                </label>
                <input
                  type="number"
                  value={calcTeeth}
                  onChange={e => setCalcTeeth(Number(e.target.value) || 1)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 800 }}
                />
              </div>

              {/* Input fz */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Pemakanan per Gigi fz (mm/tooth):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={calcFz}
                  onChange={e => setCalcFz(Number(e.target.value) || 0)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 800 }}
                />
              </div>

            </div>

            {/* HASIL KALKULASI DISPLAY */}
            <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#faf5ff', border: '2px solid #c4b5fd' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#581c87' }}>
                📊 Output Parameter Putaran Mesin
              </h3>

              {/* Display RPM */}
              <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e9d5ff', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>
                  Putaran Spindel Mesin (n)
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#7c3aed', margin: '6px 0' }}>
                  {calcRpm.toLocaleString()} <span style={{ fontSize: '1.1rem' }}>RPM</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Rumus: <code>n = (1000 × {calcMaterialVc}) / (3.1416 × {calcDia})</code>
                </div>
              </div>

              {/* Display Feed Rate (Frais) */}
              <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e9d5ff', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>
                  Kecepatan Pemakanan Meja Frais (F / Vf)
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0284c7', margin: '6px 0' }}>
                  {calcFeedRate.toLocaleString()} <span style={{ fontSize: '1.1rem' }}>mm/menit</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Rumus: <code>F = {calcFz} × {calcTeeth} gigi × {calcRpm} RPM</code>
                </div>
              </div>

              {/* Tips Keselamatan Permesinan */}
              <div style={{ background: '#fdf4ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f0abfc', fontSize: '0.78rem', color: '#86198f', lineHeight: 1.5 }}>
                ⚠️ <strong>Perhatian Teknisi Mesin:</strong> Pada mesin bubut manual, pilih tuas transmisi gearbox RPM yang paling mendekati nilai perhitungan di atas tanpa melebihi batas getaran aman benda kerja.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: KUIS ASESMEN KOMPETENSI (10 SOAL + 1000 XP)                    */}
      {/* ===================================================================== */}
      {activeTab === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #b91c1c, #991b1b)', color: '#ffffff' }}>
            <span style={{ background: '#fecaca', color: '#7f1d1d', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              EVALUASI KOMPETENSI TEKNIK PEMESINAN
            </span>
            <h2 style={{ margin: '8px 0 6px 0', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
              🎯 Kuis Asesmen Teori Alat Potong Mesin (10 Soal)
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#fee2e2', lineHeight: 1.5 }}>
              Uji pemahamanmu tentang kode insert ISO, jenis pisau frais, tap &amp; snei, serta sudut geometri potong. Capai nilai ≥ 70 untuk mengklaim <strong>1000 XP</strong> ke profil belajarmu!
            </p>
          </div>

          {/* DAFTAR SOAL KUIS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {CUTTING_TOOLS_QUIZ.map((q, qIdx) => {
              const userAns = selectedAnswers[q.id];
              const isCorrect = userAns === q.ans;
              return (
                <div
                  key={q.id}
                  className="dashboard-card"
                  style={{
                    padding: '20px',
                    borderLeft: quizSubmitted
                      ? isCorrect ? '6px solid #16a34a' : '6px solid #dc2626'
                      : '6px solid #cbd5e1'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a', marginBottom: '12px' }}>
                    {qIdx + 1}. {q.q}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.opts.map((opt, oIdx) => {
                      const isSelected = userAns === oIdx;
                      let optBg = '#f8fafc';
                      let optBorder = '1px solid #cbd5e1';

                      if (quizSubmitted) {
                        if (oIdx === q.ans) {
                          optBg = '#dcfce7';
                          optBorder = '2px solid #16a34a';
                        } else if (isSelected && !isCorrect) {
                          optBg = '#fee2e2';
                          optBorder = '2px solid #dc2626';
                        }
                      } else if (isSelected) {
                        optBg = '#e0f2fe';
                        optBorder = '2px solid #0284c7';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectAnswer(q.id, oIdx)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: optBg,
                            border: optBorder,
                            textAlign: 'left',
                            fontSize: '0.84rem',
                            fontWeight: isSelected ? 800 : 600,
                            color: '#1e293b',
                            cursor: quizSubmitted ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <span style={{
                            width: '22px', height: '22px', borderRadius: '50%',
                            background: isSelected ? '#0284c7' : '#e2e8f0',
                            color: isSelected ? '#fff' : '#475569',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.72rem', fontWeight: 900
                          }}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: isCorrect ? '#f0fdf4' : '#fef2f2',
                      border: isCorrect ? '1px solid #bbf7d0' : '1px solid #fecaca',
                      fontSize: '0.8rem',
                      color: isCorrect ? '#14532d' : '#991b1b',
                      lineHeight: 1.45
                    }}>
                      <strong>{isCorrect ? '✅ Benar!' : '❌ Salah.'}</strong> {q.exp}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ACTION BUTTONS & SCORE DISPLAY */}
          <div className="dashboard-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            {!quizSubmitted ? (
              <button
                onClick={handleGradeQuiz}
                disabled={Object.keys(selectedAnswers).length < CUTTING_TOOLS_QUIZ.length}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  background: Object.keys(selectedAnswers).length < CUTTING_TOOLS_QUIZ.length ? '#94a3b8' : '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  cursor: Object.keys(selectedAnswers).length < CUTTING_TOOLS_QUIZ.length ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
              >
                Kirim Jawaban &amp; Lihat Skor ({Object.keys(selectedAnswers).length}/{CUTTING_TOOLS_QUIZ.length})
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: quizScore >= 70 ? '#16a34a' : '#dc2626' }}>
                  Skor Anda: {quizScore} / 100 {quizScore >= 70 ? '🎉 LULUS' : '⚠️ REMEDIAL'}
                </div>
                {quizScore >= 70 && !xpClaimed && (
                  <button
                    onClick={handleClaimXP}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
                    }}
                  >
                    ⭐ Klaim 1000 XP
                  </button>
                )}
                {xpClaimed && (
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '6px 12px', borderRadius: '6px' }}>
                    ✅ 1000 XP Berhasil Diklaim!
                  </span>
                )}
                <button
                  onClick={handleResetQuiz}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Ulangi Kuis
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default MachineCuttingToolsLab;

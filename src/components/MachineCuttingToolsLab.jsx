import React, { useState, useMemo, useEffect } from 'react';
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
    englishName: 'Face Milling Cutter / Indexable Shell Mill',
    category: 'Milling Permukaan Datar',
    icon: '🥞',
    fotoReal: '/assets/images/machine_cutting_tools/face_mill.jpg',
    isoStandard: 'DIN 8030 / ISO 6462 (Lead Angle 45° & 90°)',
    materialBadan: 'Baja Paduan Perkakas 42CrMo4 Sepuh + Sisipan Karbida Sintered',
    pelapis: 'TiN (Emas) / TiAlN (Violet Gelap) pada Insert Karbida',
    diaRange: 'Ø40 – Ø200 mm',
    fluteOrInserts: '4 – 12 Indexable Inserts',
    leadAngle: '45° (Standar Serbaguna) atau 90° (Bahu Tegak)',
    deskripsi: 'Pisau frais berdiameter besar yang dipasang pada arbor mesin frais vertikal/horizontal. Dilengkapi banyak sisipan karbida (insert) lepas-pasang yang dapat diputar sisi potongnya jika aus.',
    fungsiUtama: 'Meratakan bidang permukaan datar atas balok logam dalam area lebar dengan laju pembuangan tatal (Material Removal Rate - MRR) yang sangat tinggi.',
    keunggulan: 'Sudut masuk 45° memberikan efek penipisan tatal (Chip Thinning Effect), sehingga kecepatan pemakanan (feed rate) dapat ditingkatkan hingga 40% tanpa membebani spindel secara berlebih.',
    tipsTeknis: 'Pastikan lebar pisau frais mencakup sekitar 70-80% dari lebar benda kerja (posisi offset sedikit dari sumbu tengah) agar insert masuk secara bertahap dan meminimalkan tumbukan.',
    rekomendasiMaterial: ['P', 'M', 'K', 'N', 'S', 'H'],
    params: { vc: '150 – 320 m/min', fz: '0.10 – 0.25 mm/gigi', ap: '1.5 – 4.0 mm', ae: '70% – 80% Diameter' },
    kesalahanBengkel: 'Memposisikan cutter tepat di tengah sumbu benda kerja (50-50). Ini menyebabkan insert menabrak benda kerja secara tegak lurus (impact shock maksimum) dan mempercepat keausan kawah insert.',
    simulasi: {
      judul: 'Penyayatan Bidang Rata Permukaan (Face Milling)',
      aksi: 'Spindel berputar n RPM menggerakkan 6 insert karbida menyayat lapisan atas balok baja S45C.',
      hasil: 'Menghasilkan bidang atas yang rata sempurna dengan bekas sapuan melengkung seragam (cross-hatch finish).'
    },
    blueprint: {
      judul: 'Standar Kerataan Bidang Permukaan',
      profil: 'Permukaan Rata Lebar dengan Kekasaran Ra 0.8 µm',
      toleransi: 'Toleransi Kerataan (Flatness): 0.01 mm / 100 mm'
    },
    pins: [
      { id: 1, label: 'Dudukan Arbor Mesin (Arbor Bore)', x: 400, y: 70, desc: 'Lubang poros standar ISO 40/BT40 dengan baut pengunci tengah.', tip: 'Kencangkan baut arbor dengan kunci momen sesuai torsi spesifikasi pabrik.' },
      { id: 2, label: 'Alur Pasak Poros (Drive Keyway DIN 138)', x: 312, y: 132, desc: 'Mentransmisikan torsi rotasi spindel ke badan pisau tanpa selip.', tip: 'Pastikan pasak arbor tidak aus atau longgar untuk mencegah getaran chatter.' },
      { id: 3, label: 'Badan Pisau Baja (Cutter Head 42CrMo4)', x: 480, y: 175, desc: 'Badan baja paduan berkekuatan tinggi dengan kantong (pocket) insert presisi.', tip: 'Bersihkan kotoran/bram mikro dari pocket sebelum memasang insert baru.' },
      { id: 4, label: 'Insert Karbida Sisipan (Indexable Inserts)', x: 232, y: 255, desc: 'Sisipan tungsten karbida berlapis TiN emas dengan 4-8 sisi potong aktif.', tip: 'Putar sisi insert jika salah satu sudut potong sudah aus lebih dari 0.3 mm.' },
      { id: 5, label: 'Baut Pengunci Torx (Insert Screw)', x: 275, y: 242, desc: 'Baut baja berkepala Torx T15/T20 yang menahan insert di kantong dudukan.', tip: 'Gunakan gemuk anti-seize pada ulir baut agar baut tidak macet akibat panas tinggi.' },
      { id: 6, label: 'Sudut Masuk 45° (Lead Angle)', x: 195, y: 280, desc: 'Sudut miring 45° membagi gaya potong menjadi 50% aksial dan 50% radial.', tip: 'Menghasilkan tatal tipis dan memperhalus keluar-masuknya mata potong pada logam.' }
    ]
  },
  {
    id: 'endmill',
    name: 'Square End Mill (Pisau Frais Jari Ujung Datar)',
    englishName: 'Square End Mill (Flat Bottom / 90° Shoulder)',
    category: 'Milling Kontur, Alur & Dinding Siku',
    icon: '📏',
    fotoReal: '/assets/images/machine_cutting_tools/end_mill.jpg',
    isoStandard: 'DIN 844 / DIN 6527 (Solid Carbide / HSS-Co8)',
    materialBadan: 'Solid Tungsten Carbide (Mikrograin WC 10% Co) / HSS-Co8',
    pelapis: 'TiAlN / AlTiN Violet Gelap (Tahan Panas s.d. 900°C)',
    diaRange: 'Ø2 – Ø25 mm (Solid Carbide / HSS)',
    fluteOrInserts: '2-Flute (Aluminium) / 4-Flute (Baja)',
    leadAngle: '90° (Tegak Lurus Siku)',
    deskripsi: 'Alat potong silindris dengan mata potong di sekeliling silinder (heliks) dan di muka ujungnya. Tersedia tipe Center-Cutting (bisa mengebor vertikal) dan Non-Center Cutting.',
    fungsiUtama: 'Membuat alur pasak (slotting), dinding tegak 90° siku sempurna, merapikan kontur luar profil benda, dan membuat kantong (pocketing).',
    keunggulan: 'Pisau 2-flute memiliki kantong tatal (flute pocket) yang sangat luas sehingga bram tidak menyumbat saat memotong aluminium. Pisau 4-flute memiliki inti tebal yang kokoh untuk finishing baja presisi.',
    tipsTeknis: 'Untuk pemotongan slot penuh (slotting kedalaman = diameter), kurangi kecepatan pemakanan hingga 50% dan gunakan pendingin semprot untuk meniup bram keluar dari alur.',
    rekomendasiMaterial: ['P', 'M', 'K', 'N', 'H'],
    params: { vc: '80 – 220 m/min', fz: '0.04 – 0.12 mm/gigi', ap: '0.5 – 1.5 × Dia', ae: '20% – 100% Diameter' },
    kesalahanBengkel: 'Melakukan gerakan bor vertikal (plunge) langsung ke tengah logam dengan pisau tipe Non-Center Cutting. Pisau akan patah seketika karena bagian tengahnya tidak memiliki sisi potong!',
    simulasi: {
      judul: 'Penyayatan Dinding Siku 90° & Alur Pasak (Shoulder & Slotting)',
      aksi: 'End mill Ø16 mm berputar searah jarum jam menyayat dinding tegak dan dasar rata pada balok baja.',
      hasil: 'Membentuk dinding vertikal 90° presisi dan lantai horizontal yang tegak lurus sempurna.'
    },
    blueprint: {
      judul: 'Standar Kesikuan Dinding & Lebar Alur',
      profil: 'Alur Persegi Kedalaman 12 mm & Dinding Siku 90°',
      toleransi: 'Toleransi Kesikuan (Perpendicularity): 0.02 mm / 50 mm'
    },
    pins: [
      { id: 1, label: 'Tangkai Silindris Presisi (Cylindrical Shank h6)', x: 400, y: 80, desc: 'Tangkai pengikat silinder dengan toleransi diameter h6 untuk pencekam collet chuck ER.', tip: 'Jaga tangkai selalu bersih dan bebas goresan agar runout putaran di bawah 0.005 mm.' },
      { id: 2, label: 'Leher Transisi Bebas (Tool Neck)', x: 400, y: 170, desc: 'Zona transisi radius yang mendistribusikan tegangan lentur pemotongan.', tip: 'Pilihlah overhang pisau sependek mungkin dari bibir collet untuk meredam lenturan.' },
      { id: 3, label: 'Alur Spiral Heliks 30°–35° (Helical Flutes)', x: 375, y: 220, desc: 'Alur spiral yang berfungsi mengalirkan tatal keluar ke atas seperti sekrup Archimedes.', tip: 'Gunakan 2 flute untuk aluminium agar bram tidak menyumbat, gunakan 4 flute untuk baja keras.' },
      { id: 4, label: 'Sisi Potong Samping (Peripheral Cutting Edge)', x: 440, y: 260, desc: 'Mata potong di keliling silinder yang menyayat dinding tegak benda kerja.', tip: 'Perhatikan keausan bidang samping (flank wear); ganti sebelum dinding benda bergelombang.' },
      { id: 5, label: 'Mata Potong Ujung Muka (End Cutting Teeth)', x: 400, y: 326, desc: 'Mata potong di dasar pisau untuk menyayat lantai rata alur atau kantong.', tip: 'Tipe Center-Cutting memiliki mata potong melintasi sumbu tengah sehingga bisa menembus plunging.' },
      { id: 6, label: 'Sudut Siku 90° Tajam (Square Corner 90°)', x: 358, y: 324, desc: 'Sudut tajam siku yang membentuk sudut 90° presisi antara dinding dan lantai.', tip: 'Sudut tajam rentan gompal pada pemakanan kejut; kurangi feed saat memasuki sudut tajam.' }
    ]
  },
  {
    id: 'ballmill',
    name: 'Ball Nose End Mill (Pisau Frais Ujung Bulat / Ball Mill)',
    englishName: 'Ball Nose End Mill (3D Contouring / Mold & Die)',
    category: 'Milling Permukaan 3D & Cetakan',
    icon: '🔮',
    fotoReal: '/assets/images/machine_cutting_tools/ball_nose_mill.jpg',
    isoStandard: 'DIN 6527 L / ISO Ball Nose Standard',
    materialBadan: 'Solid Micrograin Tungsten Carbide',
    pelapis: 'AlTiN / nACo (Nano-Composite Biru-Ungu) Tahan Panas 1100°C',
    diaRange: 'Ø1 – Ø20 mm (Radius R = D/2)',
    fluteOrInserts: '2 atau 4 Helical Flutes',
    leadAngle: 'Radius Kontur Bola (Hemisferikal)',
    deskripsi: 'Pisau frais yang memiliki ujung setengah bola sempurna dengan jari-jari R sama dengan separuh diameternya (misal endmill Ø10 mm memiliki radius ujung R5 mm).',
    fungsiUtama: 'Pemesinan kontur permukaan 3D bebas, rongga cetakan plastik (injection mold), dies penempaan, serta permukaan aerodinamis sudu turbin.',
    keunggulan: 'Mampu menghasilkan transisi kurva bebas yang mulus tanpa meninggalkan sudut tajam berundak, dengan jejak mata potong melengkung (cusp height terkontrol).',
    tipsTeknis: 'Perhatikan bahwa kecepatan potong efektif (effective cutting speed) di titik pusat puncak bola mendekati nol! Miringkan spindel 10°-15° pada mesin 5-axis agar titik potong aktif berada di sisi bola.',
    rekomendasiMaterial: ['P', 'M', 'K', 'S', 'H'],
    params: { vc: '100 – 260 m/min', fz: '0.03 – 0.08 mm/gigi', ap: '0.1 – 0.5 mm (Finishing)', ae: '0.05 – 0.2 × Dia (Step-over)' },
    kesalahanBengkel: 'Memotong permukaan datar lurus menggunakan ujung paling puncak bola. Karena kecepatan putar di titik pusat adalah 0 m/min, logam bukan disayat melainkan digerus/ditekan, merusak ujung pahat!',
    simulasi: {
      judul: 'Pemesinan Kontur Permukaan Cetakan 3D (3D Surface Profiling)',
      aksi: 'Ujung bola R8 mm bergerak interpolasi 3-sumbu menyayat rongga cembung-cekung cetakan logam.',
      hasil: 'Menghasilkan dinding kurva lengkung bebas tanpa undakan siku tajam.'
    },
    blueprint: {
      judul: 'Standar Kontur Radius Permukaan Bebas',
      profil: 'Rongga Kurva Sferikal Cekung Radius R8.0 mm',
      toleransi: 'Tinggi Undakan Sisa (Cusp Height): h < 0.003 mm'
    },
    pins: [
      { id: 1, label: 'Tangkai Silindris Pengikat (Tool Shank)', x: 400, y: 80, desc: 'Tangkai baja karbida dengan ketahanan lentur (modulus elastisitas tinggi).', tip: 'Gunakan chuck hidrolik atau shrink-fit holder untuk meminimalkan getaran frekuensi tinggi.' },
      { id: 2, label: 'Alur Spiral Ganda (Helical Flutes)', x: 375, y: 220, desc: 'Alur spiral yang melilit hingga ke ujung bola untuk membuang tatal halus finishing.', tip: 'Tatal finishing 3D sangat halus; gunakan hembusan udara (air blast) agar tatal tidak tergilas ulang.' },
      { id: 3, label: 'Ujung Bola Hemisferikal (Ball Tip R = D/2)', x: 442, y: 295, desc: 'Ujung setengah bola presisi tinggi dengan toleransi radius bola ±0.005 mm.', tip: 'Periksa profil bola secara berkala dengan optical comparator untuk mendeteksi keausan asimetris.' },
      { id: 4, label: 'Titik Puncak Sumbu (Tool Center Point - Vc ≈ 0)', x: 400, y: 326, desc: 'Pusat rotasi di mana kecepatan potong keliling secara matematis bernilai 0 m/min.', tip: 'Hindari kontak pemotongan murni di titik ini; gunakan lintasan miring (lead angle toolpath).' },
      { id: 5, label: 'Sisi Potong Radius Bola (Ball Cutting Edge)', x: 362, y: 300, desc: 'Busur mata potong yang aktif menyayat permukaan kontur miring benda kerja.', tip: 'Semakin kecil step-over (jarak antar lintasan sayat), semakin halus permukaan akhir produk.' }
    ]
  },
  {
    id: 'roughing',
    name: 'Roughing End Mill (Pisau Frais Kasar / Ripper)',
    englishName: 'Roughing End Mill / Corn Cob Ripper (DIN 844 NR/HR)',
    category: 'Milling Pengasaran Berat & Pembuangan Bram',
    icon: '⚡',
    fotoReal: '/assets/images/machine_cutting_tools/roughing_mill.jpg',
    isoStandard: 'DIN 844 NR (Profil Knuckle Kasar) & HR (Profil Halus)',
    materialBadan: 'Baja Paduan HSS-Co8 / Solid Sub-Micrograin Tungsten Carbide',
    pelapis: 'TiAlN / AlCrN Multi-Layer (Sangat Tahan Aus Suhu Tinggi 900°C)',
    diaRange: 'Ø6 – Ø32 mm (Knuckle Profile Wave)',
    fluteOrInserts: '3 – 5 Helical Flutes Bergerigi',
    leadAngle: '90° dengan Gerigi Pemecah Tatal (Knuckle Profile)',
    deskripsi: 'Pisau frais jari silindris dengan profil gerigi bergelombang (scalloped teeth) di sekeliling alur heliksnya. Setiap puncak gerigi menyayat serpihan kecil terpisah sehingga tatal tidak menggulung panjang.',
    fungsiUtama: 'Pemesinan pengasaran berat (heavy roughing) untuk membuang volume logam mentah dalam jumlah besar (MRR tinggi) dengan konsumsi daya spindel yang jauh lebih efisien.',
    keunggulan: 'Gaya potong aksial dan getaran chatter berkurang hingga 40% dibanding Square End Mill biasa, meminimalkan risiko pisau patah saat memotong balok tebal.',
    tipsTeknis: 'Gunakan kedalaman potong aksial dalam (Ap = 1.5 – 2.5 × Dia). Karena meninggalkan jejak garis bergelombang pada dinding, selalu sisakan stok 0.5–0.8 mm untuk lintasan finishing akhir.',
    rekomendasiMaterial: ['P', 'M', 'K', 'S', 'H'],
    params: { vc: '90 – 240 m/min', fz: '0.10 – 0.25 mm/gigi', ap: '1.5 – 2.5 × Dia', ae: '25% – 50% Diameter' },
    kesalahanBengkel: 'Menggunakan pisau roughing untuk lintasan akhir (finishing pass). Permukaan produk akan bergelombang kasar dan tidak memenuhi toleransi dimensi Ra!',
    simulasi: {
      judul: 'Penyayatan Kasar Cepat Pemecah Geram (Heavy Roughing)',
      aksi: 'Pisau Ø20 mm berputar menyayat balok baja dengan kedalaman besar, memecah tatal menjadi butiran pendek yang mudah dievakuasi.',
      hasil: 'Membuang volume logam tebal dalam waktu singkat dengan temperatur pisau tetap dingin.'
    },
    blueprint: {
      judul: 'Standar Kedalaman Pengasaran & Sisa Stok',
      profil: 'Alur Kasar Cepat dengan Sisa Toleransi Finishing 0.8 mm',
      toleransi: 'Sisa Stok Dinding Finishing (Finishing Allowance): +0.80 ± 0.10 mm'
    },
    pins: [
      { id: 1, label: 'Tangkai Silindris Pengikat (Tool Shank)', x: 400, y: 75, desc: 'Tangkai baja karbida/HSS berpresisi h6 untuk pencekaman collet atau Weldon.', tip: 'Gunakan pemegang sistem Weldon untuk mengunci pisau dari risiko tertarik keluar (pull-out).' },
      { id: 2, label: 'Inti Pisau Tebal (Thick Core Web)', x: 375, y: 195, desc: 'Diameter inti dipertebal untuk menahan beban kejut pemotongan intermiten.', tip: 'Inti tebal meredam getaran lentur saat menyayat logam keras.' },
      { id: 3, label: 'Profil Gerigi Bergelombang (Scalloped Teeth DIN 844)', x: 440, y: 250, desc: 'Gerigi melingkar bergelombang yang memotong tatal menjadi kepingan kecil pendek.', tip: 'Kepingan tatal pendek mudah disembur keluar oleh pendingin dan tidak menyumbat alur.' },
      { id: 4, label: 'Sisi Potong Muka Ujung (End Cutting Teeth)', x: 400, y: 326, desc: 'Mata potong dasar untuk pemakanan vertikal bertahap.', tip: 'Tipe center-cutting memungkinkan penetrasi plunging bertahap ke dalam balok logam.' }
    ]
  },
  {
    id: 'tslot',
    name: 'T-Slot Milling Cutter (Pisau Frais Alur T)',
    englishName: 'T-Slot Milling Cutter (Woodruff & ISO T-Nut Slotter)',
    category: 'Milling Alur Khusus Mesin',
    icon: '⚓',
    fotoReal: '/assets/images/machine_cutting_tools/t_slot_cutter.jpg',
    isoStandard: 'DIN 851 / ISO 299 (Standar Meja Mesin Perkakas)',
    materialBadan: 'Baja Paduan HSS-E (Cobalt 8%) / Sisipan Karbida Brazed',
    pelapis: 'TiN (Titanium Nitride Kuning Mengkilap) Mencegah Keausan Gesek',
    diaRange: 'Ø12 – Ø40 mm (Sesuai Standar Baut T ISO)',
    fluteOrInserts: 'Gigi Silang Bergantian (Staggered Teeth)',
    leadAngle: 'Piringan Cakram 90° Atas & Bawah',
    deskripsi: 'Pisau pemotong berkepala piringan cakram bergigi samping dan muka yang ditopang oleh tangkai leher silindris berdiameter lebih kecil dari kepalanya.',
    fungsiUtama: 'Membuat alur T standar ISO pada meja mesin frais, meja mesin serut, meja bor, serta blok pencekam ragum presisi.',
    keunggulan: 'Desain gigi silang (staggered teeth) membagi beban pemotongan antara sisi kiri dan kanan piringan, mencegah getaran (chatter) di dalam ruang tertutup sempit.',
    tipsTeknis: 'Alur T WAJIB didahului dengan pembuatan alur vertikal menggunakan Square End Mill biasa! Jangan pernah menusuk T-slot cutter langsung ke bongkahan logam mentah.',
    rekomendasiMaterial: ['P', 'M', 'K', 'N'],
    params: { vc: '25 – 45 m/min (HSS) / 90 – 140 m/min (Karbida)', fz: '0.04 – 0.08 mm/gigi', ap: 'Sesuai Tebal Piringan', ae: 'Pelebaran Sisi Alur T' },
    kesalahanBengkel: 'Mencoba menusukkan pisau alur T langsung ke logam tanpa membuat alur vertikal pendahulu (pre-slotting). Leher pisau akan patah terpuntir dalam sepersekian detik!',
    simulasi: {
      judul: 'Penyayatan Rongga Bawah Alur T (T-Slot Undercutting)',
      aksi: 'Pisau masuk melewati alur vertikal awal, memotong bagian dasar kiri dan kanan untuk ruang kepala baut T.',
      hasil: 'Membentuk alur penahan baut T berstandar ISO untuk pencekaman klem meja mesin.'
    },
    blueprint: {
      judul: 'Standar Profil Alur Baut T ISO 299',
      profil: 'Alur T ISO 14 mm (Leher 14 mm, Ruang Bawah Lebar 25 mm)',
      toleransi: 'Toleransi Lebar Alur: H12 (+0.18 / 0 mm)'
    },
    pins: [
      { id: 1, label: 'Tangkai Silindris Pengikat (Tool Shank)', x: 400, y: 75, desc: 'Tangkai silindris pengunci ke adaptor spindel mesin frais.', tip: 'Gunakan pencekam tangkai yang kuat karena gaya puntir alur T cukup besar.' },
      { id: 2, label: 'Leher Silinder Ramping (Relieved Slender Neck)', x: 400, y: 195, desc: 'Diameter leher lebih kecil dari kepala agar bebas bergerak di dalam alur vertikal.', tip: 'Pastikan celah vertikal yang sudah dibuat lebih lebar minimal 1-2 mm dari diameter leher ini.' },
      { id: 3, label: 'Piringan Cakram Potong (Disc Cutter Head)', x: 495, y: 288, desc: 'Kepala pemotong berbentuk piringan cakram yang menyayat rongga horizontal alur T.', tip: 'Tebal piringan disesuaikan dengan tinggi kepala baut T standar ISO.' },
      { id: 4, label: 'Gigi Silang Bergantian (Staggered Teeth)', x: 285, y: 288, desc: 'Gigi potong dengan kemiringan heliks berselang-seling kiri dan kanan.', tip: 'Mencegah getaran dan memberikan ruang bebas tatal di dalam ruang sayat tertutup.' },
      { id: 5, label: 'Mata Potong Muka Atas & Bawah (Face Teeth)', x: 350, y: 265, desc: 'Mata potong di bidang horizontal piringan yang meratakan langit-langit dan lantai alur T.', tip: 'Semprotkan cairan pendingin bertekanan tinggi untuk membilas tatal keluar dari rongga alur.' }
    ]
  },
  {
    id: 'dovetail',
    name: 'Dovetail Milling Cutter (Pisau Frais Ekor Burung)',
    englishName: 'Dovetail Milling Cutter (Machine Slideway & Gib Slot)',
    category: 'Milling Pemandu Luncur Mesin',
    icon: '🕊️',
    fotoReal: '/assets/images/machine_cutting_tools/dovetail_cutter.jpg',
    isoStandard: 'DIN 1833 Standard Dovetail Cutters',
    materialBadan: 'Baja HSS-Co8 / Solid Tungsten Carbide',
    pelapis: 'TiAlN / Uncoated Polished Ground',
    diaRange: 'Sudut 45°, 55°, dan 60° (Ø16 – Ø50 mm)',
    fluteOrInserts: 'Multi-Flute HSS / Solid Carbide',
    leadAngle: 'Konis Bersudut Miring 45°/55°/60°',
    deskripsi: 'Pisau frais berbentuk kerucut terbalik dengan sudut kemiringan standar tertentu yang memiliki mata potong heliks di sisi miring dan muka bawahnya.',
    fungsiUtama: 'Membuat alur pasak luncur pemandu (slideway / guideway) ekor burung pada eretan meja mesin bubut, meja mesin frais, dan komponen presisi mesin perkakas.',
    keunggulan: 'Membentuk sudut baji presisi yang berfungsi sebagai pengunci mekanis mandiri agar sambungan eretan mesin tidak terangkat saat menerima beban dorong.',
    tipsTeknis: 'Gunakan kedalaman potong bertahap (multi-pass) dengan putaran RPM stabil dan pelumasan melimpah, karena bram rentan terjebak di sudut baji lancip.',
    rekomendasiMaterial: ['P', 'M', 'K', 'N'],
    params: { vc: '20 – 35 m/min (HSS) / 80 – 130 m/min (Karbida)', fz: '0.03 – 0.06 mm/gigi', ap: 'Bertahap (Multi-pass)', ae: 'Sesuai Lebar Kemiringan' },
    kesalahanBengkel: 'Memotong seluruh kedalaman ekor burung dalam 1 kali lintasan (single pass). Tatal akan memadat di sudut lancip dan mematahkan gigi pisau seketika!',
    simulasi: {
      judul: 'Penyayatan Rel Luncur Ekor Burung (Dovetail Slideway)',
      aksi: 'Kepala kerucut 60° berputar menyayat sisi miring guideway eretan meja mesin perkakas.',
      hasil: 'Menghasilkan sudut baji 60° presisi untuk memasang pasak penegang (gib strip).'
    },
    blueprint: {
      judul: 'Standar Rel Luncur Ekor Burung 60°',
      profil: 'Slideway Ekor Burung Bersudut Miring 60° ± 5 menit',
      toleransi: 'Toleransi Sudut: 60° ± 5\' (Diverifikasi dengan Silinder Ukur)'
    },
    pins: [
      { id: 1, label: 'Tangkai Silindris Mesin Frais (Tool Shank)', x: 400, y: 75, desc: 'Tangkai baja presisi pengikat ke collet spindel.', tip: 'Pencekaman harus sekuat mungkin untuk menahan momen lentur akibat sudut baji potong.' },
      { id: 2, label: 'Leher Penghubung (Cutter Neck)', x: 400, y: 175, desc: 'Leher silindris penghubung antara tangkai dan kepala kerucut terbalik.', tip: 'Pastikan celah alur awal memberikan kelonggaran minimal 1 mm dari leher ini.' },
      { id: 3, label: 'Kepala Kerucut Terbalik (Inverted Conical Head)', x: 468, y: 260, desc: 'Geometri konis terbalik dengan sudut standar 60° (paling umum) atau 45°/55°.', tip: 'Gunakan cairan pendingin melimpah untuk mendinginkan kepala pisau di dalam celah tertutup.' },
      { id: 4, label: 'Sisi Potong Miring 60° (Angled Cutting Flutes)', x: 310, y: 275, desc: 'Mata potong di sisi miring kerucut yang membentuk dinding pemandu luncur eretan.', tip: 'Penyayatan finishing akhir harus dilakukan dengan pemakanan sangat tipis untuk mencapai toleransi sudut.' },
      { id: 5, label: 'Mata Potong Dasar Bawah (Bottom Face Teeth)', x: 400, y: 300, desc: 'Gigi potong di muka bawah untuk merapikan dasar alur ekor burung.', tip: 'Bersihkan bram dari alur sebelum melakukan lintasan pengukuran dengan silinder ukur.' }
    ]
  },
  {
    id: 'chamfermill',
    name: 'Chamfer Mill (Pisau Frais Kemiringan Tepi & Deburring)',
    englishName: 'Chamfering End Mill (Edge Beveling & Deburring 45°/90°)',
    category: 'Finishing & Deburring Tepi',
    icon: '📐',
    fotoReal: '/assets/images/machine_cutting_tools/chamfer_mill.jpg',
    isoStandard: 'DIN 6527 Chamfer Standard (Sudut Konis 45° / 60°)',
    materialBadan: 'Solid Tungsten Carbide / Sisipan Indexable Insert',
    pelapis: 'TiAlN / AlTiN Ungu-Hitam (Sangat Tajam & Tahan Suhu Tinggi)',
    diaRange: 'Sudut 45° / 90° dan 60° (Ø6 – Ø20 mm)',
    fluteOrInserts: '2 – 4 Flutes / Indexable Inserts',
    leadAngle: 'Konis 45° Simetris (Included Angle 90°)',
    deskripsi: 'Pisau konis berbentuk lancip V yang difungsikan khusus untuk menyayat sudut tepi tajam benda kerja setelah seluruh proses pemesinan selesai.',
    fungsiUtama: 'Menghilangkan burr tajam (deburring), membuat kemiringan chamfer 45° untuk keselamatan tangan operator, dan memberi jalan masuk (lead-in) baut.',
    keunggulan: 'Satu alat dapat digunakan untuk chamfering atas dan chamfering bawah (back chamfering) pada lubang pelat tanpa perlu membalik posisi benda kerja.',
    tipsTeknis: 'Gunakan bagian diameter tengah pisau untuk pemotongan chamfer, jangan gunakan ujung paling runcing karena kecepatan keliling (Vc) di titik puncak sangat rendah.',
    rekomendasiMaterial: ['P', 'M', 'K', 'N', 'S', 'H'],
    params: { vc: '150 – 350 m/min', fz: '0.04 – 0.10 mm/gigi', ap: 'Sesuai Ukuran Chamfer (C0.5 – C3)', ae: 'Sesuai Lebar Chamfer' },
    kesalahanBengkel: 'Menyetel kedalaman Z terlalu dalam sehingga ujung paling runcing pisau yang bekerja. Pada titik runcing, Vc mendekati nol sehingga logam robek kasar dan ujung pisau mudah tumpul/patah!',
    simulasi: {
      judul: 'Penyayatan Tepi Miring Pengaman (45° Edge Chamfering)',
      aksi: 'Mata potong konis 45° bergerak menyusuri tepi tajam balok baja dan bibir lubang baut.',
      hasil: 'Menghilangkan geram tajam (burr) dan membentuk kemiringan rata 45° × 2 mm yang aman dipegang.'
    },
    blueprint: {
      judul: 'Standar Kemiringan Sudut Benda Kerja ISO 13715',
      profil: 'Chamfer Tepi Rata 45° × 2.0 mm & Countersink Lubang',
      toleransi: 'Toleransi Kemiringan: 45° ± 1° • Dimensi C2.0 ± 0.1 mm'
    },
    pins: [
      { id: 1, label: 'Tangkai Silindris Putaran Tinggi (Tool Shank)', x: 400, y: 80, desc: 'Tangkai silindris untuk putaran spindel tinggi (3000 – 8000 RPM).', tip: 'Gunakan putaran tinggi dengan feed halus untuk menghasilkan chamfer mengkilap cermin.' },
      { id: 2, label: 'Sisi Potong Konis 45° (Chamfer Cutting Flute)', x: 425, y: 240, desc: 'Mata potong miring bersudut 45° yang menyayat sudut tajam benda kerja.', tip: 'Pastikan titik potong kontak berada di zona tengah bilah, bukan di ujung runcing.' },
      { id: 3, label: 'Alur Spiral Evakuasi Geram (Chip Flutes)', x: 375, y: 210, desc: 'Alur pelarian serpihan tatal halus agar tidak menggores permukaan chamfer.', tip: 'Tatal chamfering berupa pita sangat tipis; semprot dengan pendingin cair agar benda tetap dingin.' },
      { id: 4, label: 'Ujung Puncak Konis (Tip Apex)', x: 400, y: 320, desc: 'Titik runcing paling bawah pisau konis.', tip: 'Hindari kontak fisik di titik ini; selalu posisikan Z pisau lebih dalam dari tepi benda kerja.' }
    ]
  },
  {
    id: 'slittingsaw',
    name: 'Slitting Saw (Piringan Frais Pemotong Celah & Belah)',
    englishName: 'Metal Slitting Saw / Circular Slotting Saw (Thin Disc Cutter)',
    category: 'Pemotongan Celah Tipis & Pembelahan',
    icon: '💿',
    fotoReal: '/assets/images/machine_cutting_tools/slitting_saw.jpg',
    isoStandard: 'DIN 1837 A (Gigi Halus) / DIN 1838 B (Gigi Kasar)',
    materialBadan: 'Baja Perkakas HSS-DMo5 / HSS-Co5 Tempa Presisi',
    pelapis: 'VAPO (Steam Tempered Hitam Anti-Gesek) / TiN Emas',
    diaRange: 'Ø50 – Ø125 mm (Tebal 0.5 – 4 mm)',
    fluteOrInserts: 'Gigi Banyak (Fine Pitch 30-80 Gigi)',
    leadAngle: 'Gergaji Piringan Tipis Radial',
    deskripsi: 'Piringan baja HSS tipis bergigi melingkar yang dipasang pada arbor horizontal dengan cincin penahan (spacing collars).',
    fungsiUtama: 'Membelah benda kerja logam, membuat alur celah klem pengunci ragum, dan membuat alur sempit kabel/kontak listrik.',
    keunggulan: 'Mampu menghasilkan celah yang sangat sempit dan presisi dengan lebar sayatan minimal sehingga menghemat bahan baku mahal.',
    tipsTeknis: 'Gunakan RPM rendah dan feed yang konsisten. Pastikan tidak ada geram yang terjepit di antara piringan dan dinding alur untuk mencegah bilah melengkung pecah.',
    rekomendasiMaterial: ['P', 'M', 'K', 'N'],
    params: { vc: '20 – 40 m/min', fz: '0.01 – 0.03 mm/gigi', ap: 'Hingga Kedalaman Maksimal Bilah', ae: 'Sesuai Tebal Bilah (0.5 – 3 mm)' },
    kesalahanBengkel: 'Menggunakan putaran RPM terlalu tinggi atau pemakanan tersendat-sendat. Bilah tipis akan mengalami panas berlebih (overheat), memuai, terjepit di celah sempit, lalu pecah hancur!',
    simulasi: {
      judul: 'Pembelahan & Pembuatan Celah Sempit (Slitting & Parting)',
      aksi: 'Piringan gergaji tipis 1.5 mm berputar pada arbor horizontal menyayat celah jepit tembus.',
      hasil: 'Menghasilkan celah sempit presisi lebar 1.5 mm dengan pemborosan material minimal.'
    },
    blueprint: {
      judul: 'Standar Celah Jepit Ragum & Potong Belah',
      profil: 'Alur Celah Sempit Lebar 1.5 mm × Kedalaman 25 mm',
      toleransi: 'Toleransi Lebar Celah: 1.5 mm (+0.05 / -0.02 mm)'
    },
    pins: [
      { id: 1, label: 'Piringan Baja HSS Tempa Tipis (Thin Disc Body)', x: 275, y: 120, desc: 'Bilah bundar tipis (0.5 – 3.0 mm) berkekerasan 63 – 65 HRC.', tip: 'Gunakan ring spacer berdiameter sebesar mungkin untuk menjaga kekakuan piringan.' },
      { id: 2, label: 'Lubang Poros Arbor Spindel (Center Arbor Bore)', x: 400, y: 200, desc: 'Lubang tengah dudukan arbor horizontal (standar Ø16, Ø22, Ø27, atau Ø32 mm).', tip: 'Pastikan ring penjepit arbor benar-benar rata sejajar agar piringan tidak bergelombang (wobble).' },
      { id: 3, label: 'Alur Pasak Pengunci (Drive Keyway DIN 6885)', x: 400, y: 165, desc: 'Alur pasak pengunci transmisi torsi agar piringan tidak slip saat memotong logam.', tip: 'Jangan mengoperasikan gergaji tanpa pasak pengunci terpasang dengan pas.' },
      { id: 4, label: 'Gigi Potong Keliling Berjarak Rapat (Peripheral Teeth)', x: 535, y: 200, desc: 'Puluhan gigi baji pemotong cepat di sekeliling piringan.', tip: 'Gigi tipe A (rapat) untuk material tipis, tipe B (jarang) untuk material padat tebal.' },
      { id: 5, label: 'Sisi Bebas Samping (Side Clearance Grinding)', x: 475, y: 285, desc: 'Ketebalan bilah di dekat poros lebih tipis dibanding di gigi untuk mencegah jepitan.', tip: 'Jika bilah terjepit gesek, segera hentikan putaran spindel dan tambahkan oli pendingin.' }
    ]
  },
  {
    id: 'threadmill',
    name: 'Thread Mill (Pisau Frais Pembuat Ulir)',
    englishName: 'Thread Milling Cutter / Helical Thread Mill',
    category: 'Pembuatan Ulir Presisi CNC',
    icon: '🔩',
    fotoReal: '/assets/images/machine_cutting_tools/thread_mill.jpg',
    isoStandard: 'ISO 68-1 / DIN 13 (Profil Ulir Metrik 60°)',
    materialBadan: 'Solid Sub-Micrograin Tungsten Carbide',
    pelapis: 'TiAlN / AlCrN Violet Gelap (Sangat Tahan Panas 900°C)',
    diaRange: 'M3 s.d. M36 (Single-Point / Multi-Rib Flute)',
    fluteOrInserts: '3 – 4 Helical Thread Flutes',
    leadAngle: 'Profil Ulir Metrik 60° Presisi',
    deskripsi: 'Pisau frais karbida padat dengan profil ulir 60° di sepanjang alur heliksnya. Bergerak interpolasi heliks 3D (lingkaran X-Y sambil turun sumbu Z) untuk memotong ulir internal maupun eksternal.',
    fungsiUtama: 'Membuat ulir dalam (internal thread) pada lubang buntu atau tembus benda kerja berharga mahal tanpa risiko tap patah di dalam lubang.',
    keunggulan: 'Jika alat aus/patah, pisau thread mill berdiameter lebih kecil dari lubang sehingga dapat langsung diangkat keluar tanpa merusak benda kerja, berbeda dengan hand tap yang langsung macet total!',
    tipsTeknis: 'Gunakan pemrograman CNC interpolasi heliks (G02/G03 dengan perintah X, Y, Z dan pitch I, J). Satu pisau dapat membuat ulir kanan (RH) maupun ulir kiri (LH).',
    rekomendasiMaterial: ['P', 'M', 'K', 'N', 'S', 'H'],
    params: { vc: '100 – 250 m/min', fz: '0.03 – 0.08 mm/gigi', ap: 'Sesuai Pitch Ulir', ae: 'Interpolasi Melingkar' },
    kesalahanBengkel: 'Melupakan kompensasi radius alat (cutter radius compensation G41/G42) saat interpolasi heliks, menyebabkan profil ulir terlalu longgar atau terlalu sempit!',
    simulasi: {
      judul: 'Interpolasi Heliks Pembuatan Ulir Dalam (Helical Threading)',
      aksi: 'Pisau berputar cepat mengitari dinding lubang silinder sambil bergerak turun sesuai pitch 1.75 mm per putaran.',
      hasil: 'Membentuk alur ulir presisi tinggi M12x1.75 dengan toleransi kelas 6H tanpa sisa bram terjepit.'
    },
    blueprint: {
      judul: 'Standar Profil Ulir Metrik ISO 68-1',
      profil: 'Ulir Dalam Metrik M12 × Pitch 1.75 mm Kelas 6H',
      toleransi: 'Toleransi Diameter Efektif Ulir: 6H (+0.16 / 0 mm)'
    },
    pins: [
      { id: 1, label: 'Tangkai Silindris Pengikat (Tool Shank)', x: 400, y: 75, desc: 'Tangkai karbida silindris presisi h6 untuk hydraulic chuck.', tip: 'Runout tangkai wajib < 0.003 mm untuk menjaga akurasi pitch ulir.' },
      { id: 2, label: 'Leher Bebas (Relieved Neck)', x: 400, y: 175, desc: 'Diameter leher lebih ramping dari lubang ulir untuk ruang gerak interpolasi.', tip: 'Pastikan kedalaman lubang mencukupi panjang leher pisau.' },
      { id: 3, label: 'Alur Spiral Evakuasi Bram (Helical Flutes)', x: 375, y: 220, desc: 'Alur spiral yang mendorong bram halus keluar ke atas.', tip: 'Gunakan semprotan pendingin cairan atau udara bertekanan tinggi.' },
      { id: 4, label: 'Gigi Profil Ulir Metrik 60° (60° Thread Ribs)', x: 440, y: 270, desc: 'Deretan profil gigi segitiga 60° yang serentak membentuk puncak dan lembah ulir.', tip: 'Periksa profil gigi secara visual sebelum proses threading massal.' }
    ]
  },
  {
    id: 'concavemill',
    name: 'Concave Milling Cutter (Pisau Frais Cembung-Cekung)',
    englishName: 'Concave Form Relieved Milling Cutter (Convex Radius Cutter)',
    category: 'Pemesinan Bentuk Khusus (Form Milling)',
    icon: '⭕',
    fotoReal: '/assets/images/machine_cutting_tools/concave_mill.jpg',
    isoStandard: 'DIN 856 Concave Milling Cutters',
    materialBadan: 'Baja Paduan Perkakas HSS-Co5 / HSS-Co8 Tempa',
    pelapis: 'TiN Emas / Uncoated Precision Ground',
    diaRange: 'Radius R1.0 – R20 mm (Ø50 – Ø125 mm)',
    fluteOrInserts: '10 – 18 Gigi Form Relieved',
    leadAngle: 'Profil Cekung Setengah Lingkaran (Concave Arc)',
    deskripsi: 'Pisau frais piringan yang memiliki profil gigi melengkung cekung ke dalam. Saat menyayat sisi luar benda kerja, pisau ini membentuk profil tepi cembung (convex half-round) yang halus sempurna.',
    fungsiUtama: 'Membuat pembulatan tepi luar (convex full-radius) pada pelat logam, profil rel pemandu, sudu mekanis, dan komponen mesin bertepi bulat.',
    keunggulan: 'Gigi tipe Form Relieved dapat diasah ulang berkali-kali pada bidang mukanya saja tanpa mengubah bentuk radius kelengkungan aslinya!',
    tipsTeknis: 'Pasang pisau pada arbor horizontal dengan penahan ring spacer kokoh. Berikan cairan pendingin melimpah karena area kontak busur sayat cukup lebar.',
    rekomendasiMaterial: ['P', 'M', 'K', 'N'],
    params: { vc: '25 – 45 m/min', fz: '0.04 – 0.08 mm/gigi', ap: 'Sesuai Radius R', ae: 'Penyayatan Penuh Profil' },
    kesalahanBengkel: 'Mengasah bidang samping lengkung profil saat menajamkan pisau tumpul. Ini akan merusak toleransi radius lengkung; pengasahan HANYA boleh pada muka gigi radial!',
    simulasi: {
      judul: 'Penyayatan Tepi Bulat Cembung (Convex Edge Milling)',
      aksi: 'Pisau cekung R10 mm berputar pada arbor horizontal menyayat sudut tajam balok logam.',
      hasil: 'Menghasilkan tepi memanjang berbentuk setengah lingkaran cembung R10 yang mulus merata.'
    },
    blueprint: {
      judul: 'Standar Kelengkungan Tepi DIN 856',
      profil: 'Tepi Luar Cembung Setengah Lingkaran Radius R10.0 mm',
      toleransi: 'Toleransi Radius: R10.0 ± 0.03 mm'
    },
    pins: [
      { id: 1, label: 'Lubang Poros Arbor Spindel (Center Arbor Bore)', x: 400, y: 190, desc: 'Lubang tengah pas presisi untuk pemasangan di poros arbor mesin frais.', tip: 'Bersihkan lubang dan poros arbor sebelum pemasangan agar tidak oleng.' },
      { id: 2, label: 'Alur Pasak Penahan Torsi (Drive Keyway)', x: 400, y: 155, desc: 'Mengunci piringan dengan pasak poros agar tidak selip saat sayatan berat.', tip: 'Gunakan pasak standar DIN 6885 yang pas tanpa goyang.' },
      { id: 3, label: 'Profil Gigi Cekung Radius (Concave Cutting Arc)', x: 480, y: 130, desc: 'Lekukan setengah bola cekung yang membentuk tepi cembung pada logam.', tip: 'Asah hanya muka depan gigi saat tumpul agar profil radius tidak berubah.' },
      { id: 4, label: 'Sudut Bebas Form Relieved (Relief Angle)', x: 535, y: 220, desc: 'Punggung gigi dibentuk melengkung eksentrik untuk ruang bebas gesek.', tip: 'Menjaga pisau tidak panas akibat gesekan samping pada dinding balok.' }
    ]
  },
  {
    id: 'flycutter',
    name: 'Fly Cutter (Pemotong Muka Spindel Tunggal)',
    englishName: 'Fly Cutter (Single-Point Sweep Facing Tool)',
    category: 'Finishing Permukaan Cermin Super Rata',
    icon: '🪶',
    fotoReal: '/assets/images/machine_cutting_tools/fly_cutter.jpg',
    isoStandard: 'Toolroom Machinist Facing Standard',
    materialBadan: 'Baja Paduan Karbon 40Cr Sepuh + Tool Bit Karbida',
    pelapis: 'Black Oxide Badan + Insert Karbida Polished',
    diaRange: 'Radius Sapuan Efektif Ø50 – Ø150 mm',
    fluteOrInserts: '1 Single-Point Tool Bit / Insert Karbida',
    leadAngle: 'Sudut Sayat Sapuan Melingkar Lebar',
    deskripsi: 'Kepala pemotong yang memegang satu buah mata potong pahat bubut / insert karbida dengan radius sapuan yang dapat disetel. Berputar menyapu bidang permukaan dengan lintasan lingkaran lebar.',
    fungsiUtama: 'Menghasilkan bidang permukaan logam yang sangat datar dengan tingkat kehalusan sangat tinggi (mirror finish / efek cermin) pada mesin frais manual maupun CNC.',
    keunggulan: 'Hanya menggunakan satu mata potong sehingga tidak ada variasi ketinggian gigi (zero tooth height error), menghasilkan bidang yang bebas undakan mikro.',
    tipsTeknis: 'Gunakan kecepatan potong Vc tinggi dengan kecepatan pemakanan feed rate sangat lambat (fine feed) dan sedikit pelumas minyak kelapa/parafin untuk aluminium.',
    rekomendasiMaterial: ['P', 'M', 'K', 'N'],
    params: { vc: '120 – 300 m/min', fz: '0.02 – 0.05 mm/rev', ap: '0.05 – 0.20 mm (Finishing)', ae: 'Sapuan Penuh Bidang' },
    kesalahanBengkel: 'Mengambil kedalaman potong tebal (Ap > 0.5 mm) dengan fly cutter. Konstruksi satu mata potong tidak didesain untuk pengasaran berat; spindel dan batang pahat akan bergetar hebat!',
    simulasi: {
      judul: 'Penyayatan Sapuan Cermin Muka Datar (Mirror Sweep Facing)',
      aksi: 'Satu mata pahat berputar menyapu lapisan tipis 0.1 mm pada balok aluminium mesin.',
      hasil: 'Menghasilkan bidang permukaan super rata mengkilap cermin (mirror finish Ra 0.2).'
    },
    blueprint: {
      judul: 'Standar Kerataan Sapuan Cermin',
      profil: 'Bidang Atas Rata Cermin dengan Kekasaran Ra 0.2 µm',
      toleransi: 'Kerataan Bidang (Surface Flatness): 0.005 mm / 100 mm'
    },
    pins: [
      { id: 1, label: 'Tangkai Pengikat Poros (Tool Shank R8 / MT / ISO)', x: 400, y: 70, desc: 'Tangkai silindris atau tirus Morse/R8 yang langsung dipasang ke collet spindel.', tip: 'Pastikan tangkai terkunci kencang karena momen putar sapuan radius luar cukup besar.' },
      { id: 2, label: 'Badan Blok Pemegang (Cutter Head Body)', x: 400, y: 170, desc: 'Blok silinder baja seimbang yang memiliki slot miring tempat menaruh batang pahat.', tip: 'Jaga kebersihan alur lubang baut pengunci dari bram halus.' },
      { id: 3, label: 'Baut Pengunci Batang Pahat (Locking Set Screws)', x: 370, y: 235, desc: 'Deretan baut tanam soket hex yang mengunci batang pahat pada radius yang disetel.', tip: 'Kencangkan semua baut pengunci secara bertahap dan merata.' },
      { id: 4, label: 'Pahat Sayat Tunggal (Single-Point Tool Bit)', x: 440, y: 285, desc: 'Mata potong karbida atau HSS tunggal yang menyayat logam dengan radius sapuan lebar.', tip: 'Gunakan radius hidung pahat rε = 0.8–1.2 mm yang diasah halus cermin.' }
    ]
  }
];

// =============================================================================
// DATABASE 2B: 6 JENIS UTAMA PAHAT BUBUT (LATHE TURNING TOOLS)
// =============================================================================
const LATHE_TOOLS_CATALOG = [
  {
    id: 'pahat-rata-kanan',
    name: 'Pahat Bubut Rata Kanan (Right-Hand Turning)',
    englishName: 'Right-Hand External Turning Tool (ISO 6 / DIN 4980)',
    arahSayat: 'Kanan ke Kiri (Menuju Chuck)',
    isoDIN: 'ISO 6 / DIN 4980',
    tipe: 'Pembubutan Memanjang Luar (Longitudinal)',
    leadAngle: '75° / 45°',
    color: '#2563eb',
    fotoReal: '/assets/images/machine_cutting_tools/pahat_rata_kanan.jpg',
    deskripsi: 'Pahat bubut luar utama yang menyayat dari arah kanan ke kiri (mendekati kepala tetap / cekam). Menghasilkan diameter silinder yang rata, lurus, dan berdimensi presisi tinggi sepanjang poros kerja.',
    aplikasi: 'Pembubutan muka luar silinder (roughing & finishing poros memanjang, pembuatan diameter bertingkat).',
    keunggulan: 'Sisi potong utama di sebelah kiri mengalirkan tatal menjauhi permukaan hasil sayatan sehingga benda tetap mulus.',
    tipsTeknis: 'Setel ketinggian ujung mata potong tepat setinggi senter kepala lepas (±0.05 mm) agar sudut bebas asli tidak berubah menjadi negatif.',
    pins: [
      { id: 1, label: 'Tangkai Pahat Baja (Tool Shank 25×25)', desc: 'Badan baja perkakas kokoh berpenampang kotak yang dicekam kuat pada tool post eretan mesin bubut.', tip: 'Pencekaman tangkai harus sependek mungkin (overhang < 1.5× tebal shank) untuk mencegah chatter.' },
      { id: 2, label: 'Insert Karbida Rhombic 80° (CNMG)', desc: 'Sisipan tungsten karbida berlapis TiN emas pemotong utama berdaya tahan panas di atas 900°C.', tip: 'Putar sisi insert jika salah satu sudut hidung sudah aus lebih dari 0.3 mm.' },
      { id: 3, label: 'Sisi Potong Utama (Major Cutting Edge)', desc: 'Tepi tajam di sisi kiri pahat yang menyayat ketebalan geram utama saat gerak makan memanjang.', tip: 'Pastikan sudut potong tidak terbentur kerak keras coran tanpa perlakuan chamfer.' },
      { id: 4, label: 'Radius Hidung (Nose Radius rε = 0.8 mm)', desc: 'Ujung lengkung yang menghasilkan kehalusan permukaan Ra dan menahan beban potong radial.', tip: 'Gunakan rε = 0.4 mm untuk poros ramping dan rε = 0.8-1.2 mm untuk pengasaran berat.' },
      { id: 5, label: 'Alur Pemecah Tatal (Chipbreaker)', desc: 'Cekungan khusus yang melipat dan mematahkan tatal kontinu menjadi serpihan C/6 yang aman.', tip: 'Pilih alur chipbreaker tipe finishing untuk kedalaman potong dangkal (ap < 1 mm).' }
    ]
  },
  {
    id: 'pahat-rata-kiri',
    name: 'Pahat Bubut Rata Kiri (Left-Hand Turning)',
    englishName: 'Left-Hand External Turning Tool (ISO 5 / DIN 4977)',
    arahSayat: 'Kiri ke Kanan (Menjauhi Chuck)',
    isoDIN: 'ISO 5 / DIN 4977',
    tipe: 'Pembubutan Memanjang Mundur',
    leadAngle: '75° / 45° Kiri',
    color: '#ea580c',
    fotoReal: '/assets/images/machine_cutting_tools/pahat_rata_kiri.jpg',
    deskripsi: 'Pahat bubut dengan sisi potong di sebelah kanan, menyayat dari arah kiri ke kanan (menjauhi cekam spindel). Digunakan untuk membubut bidang bertingkat dari sisi dalam atau pembubutan mundur.',
    aplikasi: 'Pembubutan mundur pada poros bertingkat atau sudut bahu kiri benda kerja yang dekat dengan rahang cekam.',
    keunggulan: 'Dapat menyelesaikan pembubutan bahu yang berbatasan dekat dengan chuck tanpa risiko rumah pahat menabrak rahang cekam.',
    tipsTeknis: 'Pastikan eretan digerakkan mundur secara konstan dengan backlash ulir yang telah dieliminasi.',
    pins: [
      { id: 1, label: 'Tangkai Kiri (Left-Hand Shank)', desc: 'Geometri shank dimiringkan ke kanan untuk memfasilitasi gerak pemakanan menjauhi cekam.', tip: 'Gunakan baut penjepit toolpost paling depan dengan torsi merata.' },
      { id: 2, label: 'Sisi Potong Kanan (Right Cutting Edge)', desc: 'Tepi potong utama berada di sebelah kanan kepala pahat untuk gerak makan ke kanan.', tip: 'Periksa keausan kawah pada sisi potong kanan secara periodik.' },
      { id: 3, label: 'Sudut Bebas Flank Kiri', desc: 'Sudut bebas samping mencegah gesekan dengan dinding bahu silinder yang sudah jadi.', tip: 'Beri ruang gerak bebas minimal 2 mm saat berhenti di ujung bahu.' }
    ]
  },
  {
    id: 'pahat-muka',
    name: 'Pahat Bubut Muka / Facing (Facing Tool)',
    englishName: 'Facing Turning Tool (ISO 2 / DIN 4972)',
    arahSayat: 'Luar ke Sumbu Pusat (Melintang)',
    isoDIN: 'ISO 2 / DIN 4972',
    tipe: 'Pembubutan Muka Ujung Poros (Facing)',
    leadAngle: '45°',
    color: '#16a34a',
    fotoReal: '/assets/images/machine_cutting_tools/pahat_muka.jpg',
    deskripsi: 'Pahat khusus dengan sudut potong miring 45° untuk meratakan permukaan bidang ujung penampang silinder dengan gerakan melintang eretan lintang (cross-slide feed).',
    aplikasi: 'Facing ujung benda kerja untuk menentukan panjang absolut dan bidang referensi titik nol (datum face).',
    keunggulan: 'Sudut masuk 45° memotong secara bertahap dari diameter terluar ke pusat tanpa menimbulkan getaran benturan.',
    tipsTeknis: 'Ketinggian pahat WAJIB 100% tepat di senter pusat; jika terlalu rendah atau tinggi akan menyisakan tonjolan pentil di pusat poros!',
    pins: [
      { id: 1, label: 'Kepala Sudut Potong 45°', desc: 'Sudut potong miring 45° ideal untuk pemakanan melintang dari luar ke pusat poros.', tip: 'Sudut 45° membagi gaya dorong menjadi 50% aksial dan 50% radial.' },
      { id: 2, label: 'Mata Potong Karbida Facing', desc: 'Menghadapi kecepatan potong (Vc) yang menurun drastis dari tepi luar maksimum ke titik pusat nol RPM.', tip: 'Kurangi gerak makan fz saat mendekati titik pusat diameter nol.' },
      { id: 3, label: 'Bidang Bebas Ujung', desc: 'Memberikan ruang bebas saat menyentuh titik senter silinder agar tidak menggosok.', tip: 'Pastikan eretan memanjang terkunci erat (carriage lock) saat membubut muka.' }
    ]
  },
  {
    id: 'pahat-alur-potong',
    name: 'Pahat Alur & Potong (Parting & Grooving)',
    englishName: 'Parting-Off & External Grooving Tool (ISO 7 / DIN 4981)',
    arahSayat: 'Tegak Lurus Melintang Radial ke Pusat',
    isoDIN: 'ISO 7 / DIN 4981',
    tipe: 'Pembuatan Alur & Pemotongan Putus',
    leadAngle: '90° (Bilah Lebar 2 – 4 mm)',
    color: '#d97706',
    fotoReal: '/assets/images/machine_cutting_tools/pahat_alur.jpg',
    deskripsi: 'Pahat bilah tipis panjang dengan sisi potong lurus di ujungnya dan sudut bebas samping ganda untuk membuat celah alur pasak/O-ring atau memotong putus benda kerja.',
    aplikasi: 'Alur penahan snap ring, alur seal karet O-ring, alur pembebas ulir, dan pemotongan putus batang bahan silinder.',
    keunggulan: 'Bilah kaku berkepala insert self-clamping tipis meminimalkan volume logam yang terbuang menjadi bram.',
    tipsTeknis: 'Gunakan cairan pendingin berlimpah langsung ke celah potong dan kurangi RPM hingga 50% saat mendekati pemotongan putus akhir!',
    pins: [
      { id: 1, label: 'Bilah Tipis (Blade Shank 3 mm)', desc: 'Bilah baja paduan tipis berdaya tahan lentur tinggi dengan dudukan insert jepit.', tip: 'Bilah harus dipasang tegak lurus absolut 90° terhadap sumbu silinder.' },
      { id: 2, label: 'Insert Alur Lurus (Grooving Insert)', desc: 'Mata potong lurus bertepi siku 90° dengan cekungan pembentuk geram melipat.', tip: 'Jangan menghentikan pendingin saat memotong alur dalam karena geram bisa mengelas panas.' },
      { id: 3, label: 'Sudut Bebas Ganda Samping (Side Relief)', desc: 'Celah bebas 1.5° di kedua sisi bilah agar bilah tidak terjepit oleh dinding alur.', tip: 'Jika timbul suara berdecit, segera tarik mundur pahat dan bersihkan serpihan geram.' }
    ]
  },
  {
    id: 'pahat-ulir-luar',
    name: 'Pahat Ulir Luar Metrik 60° (Threading Tool)',
    englishName: 'External Threading Tool 60° (ISO Metric DIN 282)',
    arahSayat: 'Longitudinal Sinkron Spindel (Lead Screw Pitch)',
    isoDIN: 'DIN 282 / ISO Metrik 60°',
    tipe: 'Pembuatan Ulir Baut Luar',
    leadAngle: 'Sudut Puncak Profil 60°',
    color: '#7c3aed',
    fotoReal: '/assets/images/machine_cutting_tools/pahat_ulir.jpg',
    deskripsi: 'Pahat dengan ujung baji segitiga presisi sudut 60° (Metrik) atau 55° (Whitworth) yang digerakkan secara sinkron oleh poros transportir untuk menyayat alur spiral ulir baut.',
    aplikasi: 'Pembuatan ulir luar segitiga metrik (M6 s.d. M30), ulir trapesium gerak, dan ulir modul presisi.',
    keunggulan: 'Insert ulir penuh (full-profile) sekaligus membentuk puncak dan dasar ulir berstandar toleransi ISO 6g.',
    tipsTeknis: 'Gunakan mal ulir (center gauge) saat memasang pahat ke rumah pahat agar sumbu simetri pahat tegak lurus sempurna terhadap sumbu benda kerja!',
    pins: [
      { id: 1, label: 'Ujung Baji Segitiga 60°', desc: 'Sudut profil presisi 60° standar Metrik ISO yang membentuk sudut ulir baut.', tip: 'Periksa keausan ujung dengan mal ulir sebelum memulai pembuatan ulir kelas presisi.' },
      { id: 2, label: 'Radius Puncak Ulir (Crest Radius)', desc: 'Radius ujung kecil sesuai kisar ulir baut (misal pitch 1.5 mm).', tip: 'Pemakanan ulir sebaiknya dilakukan dengan metode miring 29° eretan atas (compound rest).' },
      { id: 3, label: 'Pelat Landasan Shim (Anvil)', desc: 'Pelat miring di bawah insert untuk mengompensasi sudut heliks kisar ulir.', tip: 'Ganti shim anvil bila membuat ulir berpitch sangat kasar (P > 3 mm).' }
    ]
  },
  {
    id: 'pahat-dalam-boring',
    name: 'Pahat Bubut Dalam / Boring Bar (Internal Boring)',
    englishName: 'Internal Boring Bar Tool (ISO 8 / DIN 4973)',
    arahSayat: 'Aksial Masuk ke Dalam Lubang Silinder',
    isoDIN: 'ISO 8 / DIN 4973',
    tipe: 'Pembubutan Lubang Silinder Dalam',
    leadAngle: '95° (CCMT / WCMT)',
    color: '#0284c7',
    fotoReal: '/assets/images/machine_cutting_tools/pahat_dalam.jpg',
    deskripsi: 'Pahat berbentuk silinder pejal panjang (sering berbahan karbida anti-getar) dengan kepala insert offset untuk memperbesar, meratakan, dan menghaluskan lubang dalam silindris.',
    aplikasi: 'Perbesaran lubang hasil bor, pembuatan dudukan bearing H7 presisi, pembubutan rumah silinder rem dan blok mesin.',
    keunggulan: 'Batang silindris kokoh meminimalkan defleksi lentur pada kedalaman lubang (L/D hingga 4× untuk baja, 7× untuk karbida).',
    tipsTeknis: 'Pilih diameter batang boring bar sebesar mungkin yang masih muat di dalam lubang untuk meminimalkan getaran getar (vibration chatter).',
    pins: [
      { id: 1, label: 'Batang Silindris (Boring Bar)', desc: 'Batang baja paduan pejal peredam getaran chatter saat menjangkau kedalaman lubang.', tip: 'Jaga overhang batang seminimal mungkin sesuai kedalaman lubang kerja.' },
      { id: 2, label: 'Kepala Offset Insert (CCMT)', desc: 'Dudukan insert menghadap keluar dinding dalam lubang dengan sudut potong 95° bebas bahu.', tip: 'Pastikan bidang bebas insert tidak menggesek kurva kelengkungan dinding dalam.' },
      { id: 3, label: 'Saluran Pendingin Internal', desc: 'Lubang tembus di dalam batang untuk menyemprot cairan pendingin dan meniup geram keluar.', tip: 'Tekanan pendingin tinggi membantu memecah geram yang bersarang di lubang buntu.' }
    ]
  }
];

// =============================================================================
// DATABASE 2C: 7 BENTUK GEOMETRI INSERT KARBIDA STANDAR ISO 1832
// =============================================================================
const CARBIDE_INSERTS_CATALOG = [
  {
    shape: 'C',
    name: 'Bentuk C: Rhombic 80° (CNMG / CCMT)',
    sudutHidung: '80° (Belah Ketupat 80°)',
    sisiPotong: '4 Sisi (Positif) / 8 Sisi (Negatif)',
    kekuatanTepi: '⭐⭐⭐⭐⭐ (Sangat Kuat)',
    fleksibilitas: '⭐⭐⭐ (Sedang)',
    color: '#2563eb',
    fotoReal: '/assets/images/machine_cutting_tools/insert_c_cnmg.jpg',
    deskripsi: 'Bentuk paling populer dan standar utama di bengkel mesin bubut seluruh dunia. Sudut hidung 80° memberikan ketahanan luar biasa terhadap beban pemakanan berat tanpa mudah gompal.',
    fungsi: 'Pembubutan rata memanjang luar & dalam, facing muka, pengasaran (roughing) hingga medium finishing.',
    keunggulan: 'Dapat melakukan pembubutan muka dan memanjang tanpa perlu mengganti pahat.'
  },
  {
    shape: 'D',
    name: 'Bentuk D: Rhombic 55° (DNMG / DCMT)',
    sudutHidung: '55° (Belah Ketupat 55°)',
    sisiPotong: '4 Sisi (Positif) / 8 Sisi (Negatif)',
    kekuatanTepi: '⭐⭐⭐⭐ (Kuat)',
    fleksibilitas: '⭐⭐⭐⭐ (Tinggi)',
    color: '#ea580c',
    fotoReal: '/assets/images/machine_cutting_tools/insert_d_dnmg.jpg',
    deskripsi: 'Bentuk belah ketupat sudut 55° yang memungkinkan pahat masuk ke sudut bahu 90° dan membubut profil kontur tirus tanpa mengalami interferensi dinding.',
    fungsi: 'Pembubutan kontur luar/dalam, profil tirus, pembubutan bahu siku 90°, dan finishing presisi.',
    keunggulan: 'Aksesibilitas sudut profil jauh lebih lincah dibanding bentuk C.'
  },
  {
    shape: 'S',
    name: 'Bentuk S: Square 90° (SNMG / SCMT)',
    sudutHidung: '90° (Bujur Sangkar)',
    sisiPotong: '4 Sisi (Positif) / 8 Sisi (Negatif)',
    kekuatanTepi: '⭐⭐⭐⭐⭐ (Kekuatan Maksimum)',
    fleksibilitas: '⭐⭐ (Terbatas)',
    color: '#16a34a',
    fotoReal: '/assets/images/machine_cutting_tools/insert_s_square.svg',
    deskripsi: 'Bentuk bujur sangkar dengan sudut hidung 90° terkuat. Sangat hemat karena memiliki total 8 sisi potong aktif (pada tipe negatif SNMG bolak-balik).',
    fungsi: 'Pengasaran berat (heavy roughing), pemotongan logam berkerak cor kasar, dan chamfering 45°.',
    keunggulan: 'Ketahanan puncak terhadap beban tumbukan intermiten dan pemotongan terputus.'
  },
  {
    shape: 'T',
    name: 'Bentuk T: Triangular 60° (TNMG / TCMT)',
    sudutHidung: '60° (Segitiga Sama Sisi)',
    sisiPotong: '3 Sisi (Positif) / 6 Sisi (Negatif)',
    kekuatanTepi: '⭐⭐⭐ (Sedang)',
    fleksibilitas: '⭐⭐⭐⭐ (Tinggi)',
    color: '#d97706',
    fotoReal: '/assets/images/machine_cutting_tools/insert_t_tnmg.jpg',
    deskripsi: 'Bentuk segitiga sama sisi yang sangat ekonomis dengan harga per sisi potong termurah. Sudut baji 60° tajam dan gaya potong relatif ringan.',
    fungsi: 'Pembubutan umum serbaguna, pembubutan dalam lubang kecil, dan pembuatan alur V.',
    keunggulan: 'Ekonomis dengan 6 sisi potong dan gaya potong aksial yang rendah.'
  },
  {
    shape: 'W',
    name: 'Bentuk W: Trigon 80° (WNMG / WCMT)',
    sudutHidung: '80° (Trigon 3 Sudut)',
    sisiPotong: '6 Sisi Potong Aktif Bolak-Balik',
    kekuatanTepi: '⭐⭐⭐⭐⭐ (Sangat Kuat)',
    fleksibilitas: '⭐⭐⭐ (Sedang)',
    color: '#7c3aed',
    fotoReal: '/assets/images/machine_cutting_tools/carbide_inserts.jpg',
    deskripsi: 'Pengembangan modern dari perpaduan bentuk C dan T. Memiliki sudut hidung 80° sekokoh bentuk C, tetapi memiliki 6 sisi potong aktif bolak-balik seperti bentuk segitiga!',
    fungsi: 'Pilihan paling ekonomis dan efisien untuk produksi massal pembubutan luar dan facing mesin CNC.',
    keunggulan: 'Kekuatan setara bentuk C tetapi hemat 50% lebih banyak sisi potong.'
  },
  {
    shape: 'V',
    name: 'Bentuk V: Rhombic 35° (VNMG / VCMT)',
    sudutHidung: '35° (Sangat Lancip)',
    sisiPotong: '4 Sisi (Positif) / 4 Sisi (Negatif)',
    kekuatanTepi: '⭐⭐ (Rentan Beban Berat)',
    fleksibilitas: '⭐⭐⭐⭐⭐ (Aksesibilitas Maksimum)',
    color: '#db2777',
    fotoReal: '/assets/images/machine_cutting_tools/carbide_inserts_vhm.jpg',
    deskripsi: 'Bentuk belah ketupat sangat lancip 35° yang dapat menjangkau ceruk sempit, alur kontur kurva tajam, dan pembubutan undercut.',
    fungsi: 'Finishing profil kurva kompleks CNC, salinan kontur tirus sempit, dan pembuatan pola ornamen halus.',
    keunggulan: 'Dapat memotong profil undercut dengan sudut hingga 30° tanpa gesekan bodi.'
  },
  {
    shape: 'R',
    name: 'Bentuk R: Round / Bulat (RNMG / RCMT)',
    sudutHidung: 'Bulat Melingkar (Lingkaran Penuh)',
    sisiPotong: 'Dapat Diputar Berkeliling (Tak Terhingga)',
    kekuatanTepi: '⭐⭐⭐⭐⭐ (Paling Tahan Benturan)',
    fleksibilitas: '⭐⭐⭐ (Khusus Kontur Radius)',
    color: '#0284c7',
    fotoReal: '/assets/images/machine_cutting_tools/insert_r_round.svg',
    deskripsi: 'Sisipan berbentuk piringan lingkaran penuh tanpa sudut tajam. Menghilangkan titik konsentrasi tegangan sehingga tahan terhadap beban kejut pemotongan terputus.',
    fungsi: 'Pembubutan permukaan cekung bulat, pembuatan alur radius besar, pemotongan cetakan (die & mold).',
    keunggulan: 'Sisi potong dapat diindeks (diputar) berkali-kali hingga seluruh keliling lingkaran terpakai.'
  }
];

// =============================================================================
// KOMPONEN MINIATUR THUMBNAIL PISAU FRAIS (SVG KONTUR NYATA)
// =============================================================================
const MillingCutterThumbnail = ({ toolId, isSelected }) => {
  const strokeColor = isSelected ? '#0284c7' : '#64748b';
  const bgFill = isSelected ? '#e0f2fe' : '#f8fafc';

  return (
    <svg viewBox="0 0 64 64" style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '8px', background: bgFill, border: `1.5px solid ${strokeColor}40` }}>
      <defs>
        <linearGradient id="thumbShank" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="thumbTiN" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id="thumbTiAlN" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>
      </defs>

      {/* FACE MILL THUMBNAIL */}
      {toolId === 'facemill' && (
        <g>
          <rect x="26" y="6" width="12" height="10" rx="1" fill="url(#thumbShank)" />
          <polygon points="12,16 52,16 56,38 8,38" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <polygon points="7,34 13,28 17,32 11,38" fill="url(#thumbTiN)" stroke="#ca8a04" strokeWidth="0.8" />
          <polygon points="57,34 51,28 47,32 53,38" fill="url(#thumbTiN)" stroke="#ca8a04" strokeWidth="0.8" />
          <rect x="23" y="33" width="7" height="6" rx="1" fill="url(#thumbTiN)" />
          <rect x="34" y="33" width="7" height="6" rx="1" fill="url(#thumbTiN)" />
          <circle cx="32" cy="24" r="5" fill="#0f172a" />
          <circle cx="32" cy="24" r="2.5" fill="#94a3b8" />
        </g>
      )}

      {/* SQUARE END MILL THUMBNAIL */}
      {toolId === 'endmill' && (
        <g>
          <rect x="24" y="6" width="16" height="20" rx="2" fill="url(#thumbShank)" />
          <rect x="24" y="26" width="16" height="28" rx="1" fill="url(#thumbTiAlN)" />
          <path d="M 24 30 Q 32 36 40 42" stroke="#a5b4fc" strokeWidth="2.5" fill="none" />
          <path d="M 24 40 Q 32 46 40 52" stroke="#a5b4fc" strokeWidth="2.5" fill="none" />
          <line x1="24" y1="54" x2="40" y2="54" stroke="#c7d2fe" strokeWidth="2.5" />
          <line x1="24" y1="26" x2="24" y2="54" stroke="#818cf8" strokeWidth="1" />
          <line x1="40" y1="26" x2="40" y2="54" stroke="#818cf8" strokeWidth="1" />
        </g>
      )}

      {/* BALL NOSE END MILL THUMBNAIL */}
      {toolId === 'ballmill' && (
        <g>
          <rect x="24" y="6" width="16" height="20" rx="2" fill="url(#thumbShank)" />
          <rect x="24" y="26" width="16" height="18" fill="url(#thumbTiAlN)" />
          <path d="M 24 44 A 8 8 0 0 0 40 44 Z" fill="url(#thumbTiAlN)" stroke="#818cf8" strokeWidth="1" />
          <path d="M 24 30 Q 32 38 40 44" stroke="#67e8f9" strokeWidth="2" fill="none" />
          <path d="M 26 44 Q 32 52 38 44" stroke="#67e8f9" strokeWidth="2" fill="none" />
          <circle cx="32" cy="52" r="1.5" fill="#ef4444" />
        </g>
      )}

      {/* BULL NOSE / CORNER RADIUS THUMBNAIL */}
      {toolId === 'bullnose' && (
        <g>
          <rect x="24" y="6" width="16" height="20" rx="2" fill="url(#thumbShank)" />
          <rect x="24" y="26" width="16" height="24" fill="url(#thumbTiAlN)" />
          <path d="M 24 32 Q 32 38 40 44" stroke="#38bdf8" strokeWidth="2" fill="none" />
          <path d="M 24 42 Q 32 48 40 52" stroke="#38bdf8" strokeWidth="2" fill="none" />
          {/* Rounded corner fillets at bottom */}
          <path d="M 24 48 Q 24 53 28 53 L 36 53 Q 40 53 40 48" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
        </g>
      )}

      {/* T-SLOT CUTTER THUMBNAIL */}
      {toolId === 'tslot' && (
        <g>
          <rect x="26" y="6" width="12" height="14" rx="1" fill="url(#thumbShank)" />
          <rect x="29" y="20" width="6" height="18" fill="#64748b" />
          <rect x="12" y="38" width="40" height="14" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <line x1="12" y1="45" x2="52" y2="45" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="16" y1="38" x2="16" y2="52" stroke="#94a3b8" strokeWidth="1" />
          <line x1="48" y1="38" x2="48" y2="52" stroke="#94a3b8" strokeWidth="1" />
        </g>
      )}

      {/* DOVETAIL CUTTER THUMBNAIL */}
      {toolId === 'dovetail' && (
        <g>
          <rect x="26" y="6" width="12" height="15" rx="1" fill="url(#thumbShank)" />
          <rect x="28" y="21" width="8" height="10" fill="#64748b" />
          <polygon points="28,31 36,31 52,51 12,51" fill="#1e293b" stroke="#0284c7" strokeWidth="1.2" />
          <line x1="16" y1="46" x2="24" y2="36" stroke="#38bdf8" strokeWidth="1.8" />
          <line x1="48" y1="46" x2="40" y2="36" stroke="#38bdf8" strokeWidth="1.8" />
          <line x1="12" y1="51" x2="52" y2="51" stroke="#f59e0b" strokeWidth="1.5" />
        </g>
      )}

      {/* CHAMFER MILL THUMBNAIL */}
      {toolId === 'chamfermill' && (
        <g>
          <rect x="25" y="6" width="14" height="22" rx="2" fill="url(#thumbShank)" />
          <polygon points="23,28 41,28 32,53" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.2" />
          <line x1="23" y1="28" x2="32" y2="53" stroke="#f59e0b" strokeWidth="2" />
          <line x1="41" y1="28" x2="32" y2="53" stroke="#f59e0b" strokeWidth="2" />
          <line x1="32" y1="28" x2="32" y2="50" stroke="#bae6fd" strokeWidth="1" strokeDasharray="2 2" />
        </g>
      )}

      {/* SLITTING SAW THUMBNAIL */}
      {toolId === 'slittingsaw' && (
        <g>
          <circle cx="32" cy="32" r="22" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <circle cx="32" cy="32" r="22" stroke="#e2e8f0" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
          <circle cx="32" cy="32" r="14" stroke="#475569" strokeWidth="1" fill="none" />
          <circle cx="32" cy="32" r="6" fill="#0f172a" />
          <rect x="31" y="24" width="2" height="5" fill="#0f172a" />
        </g>
      )}
    </svg>
  );
};

// =============================================================================
// KOMPONEN KARTU VISUAL REALISTIS PISAU FRAIS (200x110 PX UNTUK SETIAP KARTU)
// =============================================================================
const MillingCutterCardVisual = ({ toolId, isSelected = false }) => {
  return (
    <svg viewBox="0 0 200 110" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', filter: isSelected ? 'drop-shadow(0 4px 8px rgba(2, 132, 199, 0.28))' : 'none' }}>
      <defs>
        <linearGradient id={`cardSteelShank_${toolId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="30%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id={`cardGunmetal_${toolId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id={`cardTiNGold_${toolId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id={`cardTiAlNViolet_${toolId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="35%" stopColor="#4338ca" />
          <stop offset="70%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>

      {/* Grid background samar */}
      <line x1="100" y1="5" x2="100" y2="105" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />

      {/* 1. FACE MILL */}
      {toolId === 'facemill' && (
        <g>
          {/* Arbor shank */}
          <rect x="85" y="8" width="30" height="20" rx="2" fill={`url(#cardSteelShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <rect x="74" y="28" width="52" height="8" rx="1" fill="#334155" stroke="#1e293b" strokeWidth="1" />
          {/* Cutter head body */}
          <polygon points="56,36 144,36 158,74 42,74" fill={`url(#cardGunmetal_${toolId})`} stroke="#0f172a" strokeWidth="1.5" />
          {/* Center bore and socket bolt */}
          <circle cx="100" cy="55" r="14" fill="#0f172a" />
          <circle cx="100" cy="55" r="9" fill="#475569" stroke="#334155" strokeWidth="1" />
          <polygon points="97,52 103,52 106,55 103,58 97,58 94,55" fill="#0f172a" />
          {/* Left 45° insert */}
          <polygon points="36,70 48,58 58,68 46,80" fill={`url(#cardTiNGold_${toolId})`} stroke="#ca8a04" strokeWidth="1" />
          <circle cx="47" cy="69" r="2" fill="#78350f" />
          {/* Center inserts */}
          <polygon points="68,74 84,74 84,86 68,86" fill={`url(#cardTiNGold_${toolId})`} stroke="#ca8a04" strokeWidth="1" />
          <circle cx="76" cy="80" r="1.8" fill="#78350f" />
          <polygon points="116,74 132,74 132,86 116,86" fill={`url(#cardTiNGold_${toolId})`} stroke="#ca8a04" strokeWidth="1" />
          <circle cx="124" cy="80" r="1.8" fill="#78350f" />
          {/* Right 45° insert */}
          <polygon points="164,70 152,58 142,68 154,80" fill={`url(#cardTiNGold_${toolId})`} stroke="#ca8a04" strokeWidth="1" />
          <circle cx="153" cy="69" r="2" fill="#78350f" />
          {/* 45° lead label */}
          <text x="24" y="66" fill="#0284c7" fontSize="8" fontWeight="900">45°</text>
          <text x="100" y="102" fill="#0369a1" fontSize="9" fontWeight="900" textAnchor="middle">45° FACE MILL • INSERT TiN</text>
        </g>
      )}

      {/* 2. SQUARE END MILL */}
      {toolId === 'endmill' && (
        <g>
          {/* Shank */}
          <rect x="85" y="8" width="30" height="36" rx="2" fill={`url(#cardSteelShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <text x="100" y="24" fill="#475569" fontSize="7.5" fontWeight="900" textAnchor="middle">Ø16 DIN 844</text>
          <text x="100" y="34" fill="#64748b" fontSize="6.5" fontWeight="800" textAnchor="middle">HSS-Co8</text>
          {/* Neck transition */}
          <polygon points="85,44 115,44 113,50 87,50" fill="#475569" />
          {/* Helical flutes body */}
          <rect x="85" y="50" width="30" height="40" fill={`url(#cardTiAlNViolet_${toolId})`} stroke="#1e1b4b" strokeWidth="1.5" />
          {/* 30° helix curves */}
          <path d="M 85,56 Q 100,68 115,80" fill="none" stroke="#a5b4fc" strokeWidth="2.5" />
          <path d="M 85,68 Q 100,80 115,90" fill="none" stroke="#a5b4fc" strokeWidth="2.5" />
          {/* Sharp 90° square bottom edge */}
          <line x1="85" y1="90" x2="115" y2="90" stroke="#ffffff" strokeWidth="2.2" />
          <path d="M 85,83 L 92,83 L 92,90" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <path d="M 115,83 L 108,83 L 108,90" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <text x="76" y="88" fill="#ef4444" fontSize="8" fontWeight="900">90°</text>
          <text x="100" y="103" fill="#4338ca" fontSize="9" fontWeight="900" textAnchor="middle">SQUARE END MILL (90° SIKU)</text>
        </g>
      )}

      {/* 3. BALL NOSE END MILL */}
      {toolId === 'ballmill' && (
        <g>
          {/* Shank */}
          <rect x="85" y="8" width="30" height="38" rx="2" fill={`url(#cardSteelShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <text x="100" y="26" fill="#475569" fontSize="7.5" fontWeight="900" textAnchor="middle">R8 / Ø16</text>
          {/* Helical flutes body */}
          <rect x="85" y="46" width="30" height="26" fill={`url(#cardTiAlNViolet_${toolId})`} stroke="#1e1b4b" strokeWidth="1.2" />
          <path d="M 85,52 Q 100,60 115,68" fill="none" stroke="#67e8f9" strokeWidth="2.2" />
          {/* Hemispherical ball nose tip */}
          <path d="M 85,72 A 15 15 0 0 0 115,72 Z" fill={`url(#cardTiAlNViolet_${toolId})`} stroke="#818cf8" strokeWidth="1.5" />
          <path d="M 88,72 Q 100,86 112,72" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="100" cy="87" r="2.2" fill="#ef4444" />
          {/* Radius label */}
          <line x1="100" y1="72" x2="114" y2="78" stroke="#ef4444" strokeWidth="1" />
          <text x="122" y="80" fill="#ef4444" fontSize="8" fontWeight="900">R=D/2</text>
          <text x="100" y="103" fill="#0284c7" fontSize="9" fontWeight="900" textAnchor="middle">BALL NOSE (KONTUR 3D)</text>
        </g>
      )}

      {/* 4. ROUGHING END MILL */}
      {toolId === 'roughing' && (
        <g>
          {/* Shank */}
          <rect x="85" y="8" width="30" height="36" rx="2" fill={`url(#cardSteelShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <text x="100" y="24" fill="#475569" fontSize="7.5" fontWeight="900" textAnchor="middle">Ø20 DIN 844 NR</text>
          <text x="100" y="34" fill="#64748b" fontSize="6.5" fontWeight="800" textAnchor="middle">KNUCKLE HSS-Co8</text>
          {/* Neck */}
          <polygon points="85,44 115,44 113,50 87,50" fill="#475569" />
          {/* Scalloped wavy teeth flute body */}
          <rect x="85" y="50" width="30" height="40" fill={`url(#cardTiAlNViolet_${toolId})`} stroke="#1e1b4b" strokeWidth="1.5" />
          {/* Knuckle wavy profile paths */}
          <path d="M 85,55 Q 92,58 100,55 Q 108,52 115,55" fill="none" stroke="#f59e0b" strokeWidth="2.2" />
          <path d="M 85,65 Q 92,68 100,65 Q 108,62 115,65" fill="none" stroke="#f59e0b" strokeWidth="2.2" />
          <path d="M 85,75 Q 92,78 100,75 Q 108,72 115,75" fill="none" stroke="#f59e0b" strokeWidth="2.2" />
          <path d="M 85,85 Q 92,88 100,85 Q 108,82 115,85" fill="none" stroke="#f59e0b" strokeWidth="2.2" />
          <text x="100" y="103" fill="#ea580c" fontSize="9" fontWeight="900" textAnchor="middle">ROUGHING END MILL (KASAR)</text>
        </g>
      )}

      {/* BULL NOSE / CORNER RADIUS (LEGACY / ALIAS) */}
      {toolId === 'bullnose' && (
        <g>
          {/* Shank */}
          <rect x="85" y="8" width="30" height="38" rx="2" fill={`url(#cardSteelShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <text x="100" y="26" fill="#475569" fontSize="7.5" fontWeight="900" textAnchor="middle">Ø16 r1.5</text>
          {/* Flute body */}
          <rect x="85" y="46" width="30" height="36" fill={`url(#cardTiAlNViolet_${toolId})`} stroke="#1e1b4b" strokeWidth="1.2" />
          <path d="M 85,54 Q 100,64 115,74" fill="none" stroke="#38bdf8" strokeWidth="2" />
          {/* Corner radius fillets at bottom */}
          <path d="M 85,76 Q 85,86 91,86 L 109,86 Q 115,86 115,76" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1="91" y1="86" x2="109" y2="86" stroke="#ffffff" strokeWidth="1.5" />
          <text x="72" y="83" fill="#f59e0b" fontSize="7.5" fontWeight="900">r=1.5</text>
          <text x="118" y="83" fill="#f59e0b" fontSize="7.5" fontWeight="900">r=1.5</text>
          <text x="100" y="103" fill="#d97706" fontSize="9" fontWeight="900" textAnchor="middle">BULL NOSE (CORNER RADIUS)</text>
        </g>
      )}

      {/* 5. T-SLOT CUTTER */}
      {toolId === 'tslot' && (
        <g>
          {/* Shank */}
          <rect x="88" y="8" width="24" height="24" rx="2" fill={`url(#cardSteelShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          {/* Relieved neck (narrow neck) */}
          <rect x="94" y="32" width="12" height="30" fill="#64748b" stroke="#334155" strokeWidth="1" />
          <line x1="94" y1="34" x2="94" y2="60" stroke="#94a3b8" strokeWidth="1" />
          {/* Wide disc cutting head */}
          <rect x="62" y="62" width="76" height="24" rx="2" fill={`url(#cardGunmetal_${toolId})`} stroke="#0f172a" strokeWidth="1.5" />
          {/* Staggered cutting teeth */}
          <line x1="62" y1="74" x2="138" y2="74" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="5 3" />
          <rect x="62" y="62" width="8" height="24" fill={`url(#cardTiNGold_${toolId})`} />
          <rect x="130" y="62" width="8" height="24" fill={`url(#cardTiNGold_${toolId})`} />
          {/* Leher sempit indicator */}
          <text x="110" y="48" fill="#64748b" fontSize="7" fontWeight="800">Leher Bebas</text>
          <text x="100" y="103" fill="#b45309" fontSize="9" fontWeight="900" textAnchor="middle">T-SLOT CUTTER (ALUR T DIN 650)</text>
        </g>
      )}

      {/* 6. DOVETAIL CUTTER */}
      {toolId === 'dovetail' && (
        <g>
          {/* Shank */}
          <rect x="88" y="8" width="24" height="24" rx="2" fill={`url(#cardSteelShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          {/* Relieved neck */}
          <rect x="93" y="32" width="14" height="18" fill="#64748b" stroke="#334155" strokeWidth="1" />
          {/* Inverted cone 60° dovetail head */}
          <polygon points="90,50 110,50 144,84 56,84" fill={`url(#cardGunmetal_${toolId})`} stroke="#0f172a" strokeWidth="1.5" />
          {/* Angular teeth */}
          <line x1="68" y1="80" x2="88" y2="58" stroke="#38bdf8" strokeWidth="2.2" />
          <line x1="132" y1="80" x2="112" y2="58" stroke="#38bdf8" strokeWidth="2.2" />
          <line x1="56" y1="84" x2="144" y2="84" stroke="#f59e0b" strokeWidth="1.8" />
          {/* 60° arc indicator */}
          <path d="M 68,84 A 12 12 0 0 1 75,75" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <text x="56" y="78" fill="#ef4444" fontSize="8" fontWeight="900">60°</text>
          <text x="100" y="103" fill="#0284c7" fontSize="9" fontWeight="900" textAnchor="middle">DOVETAIL 60° (EKOR BURUNG)</text>
        </g>
      )}

      {/* 7. CHAMFER MILL */}
      {toolId === 'chamfermill' && (
        <g>
          {/* Shank */}
          <rect x="86" y="8" width="28" height="34" rx="2" fill={`url(#cardSteelShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <text x="100" y="24" fill="#475569" fontSize="7.5" fontWeight="900" textAnchor="middle">45° / 90° Point</text>
          {/* Conical bevel head */}
          <polygon points="76,42 124,42 100,84" fill={`url(#cardTiAlNViolet_${toolId})`} stroke="#1e1b4b" strokeWidth="1.5" />
          {/* Bevel cutting edges */}
          <line x1="76" y1="42" x2="100" y2="84" stroke="#f59e0b" strokeWidth="2.8" />
          <line x1="124" y1="42" x2="100" y2="84" stroke="#f59e0b" strokeWidth="2.8" />
          <line x1="100" y1="42" x2="100" y2="80" stroke="#bae6fd" strokeWidth="1.2" strokeDasharray="3 2" />
          {/* 45° angle text */}
          <text x="110" y="72" fill="#ef4444" fontSize="8" fontWeight="900">45°</text>
          <text x="100" y="103" fill="#0369a1" fontSize="9" fontWeight="900" textAnchor="middle">CHAMFER MILL (BEVEL 45°)</text>
        </g>
      )}

      {/* 8. SLITTING SAW */}
      {toolId === 'slittingsaw' && (
        <g>
          {/* Metallic disc saw */}
          <circle cx="100" cy="50" r="35" fill={`url(#cardGunmetal_${toolId})`} stroke="#475569" strokeWidth="1.2" />
          <circle cx="100" cy="50" r="35" stroke="#e2e8f0" strokeWidth="3.5" strokeDasharray="3.5 3.5" fill="none" />
          <circle cx="100" cy="50" r="22" stroke="#334155" strokeWidth="1.2" fill="none" />
          {/* Center bore and DIN keyway */}
          <circle cx="100" cy="50" r="9" fill="#0f172a" />
          <rect x="98.5" y="38" width="3" height="7" fill="#0f172a" />
          {/* Thin blade kerf label */}
          <text x="100" y="30" fill="#38bdf8" fontSize="7.5" fontWeight="800" textAnchor="middle">Tebal: 1.5–3 mm</text>
          <text x="100" y="103" fill="#64748b" fontSize="9" fontWeight="900" textAnchor="middle">SLITTING SAW (GERGAJI FRAIS)</text>
        </g>
      )}

      {/* 9. THREAD MILL */}
      {toolId === 'threadmill' && (
        <g>
          {/* Shank */}
          <rect x="86" y="8" width="28" height="34" rx="2" fill={`url(#cardSteelShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <text x="100" y="24" fill="#475569" fontSize="7.5" fontWeight="900" textAnchor="middle">M12×1.75 ISO</text>
          {/* Neck */}
          <rect x="91" y="42" width="18" height="14" fill="#64748b" stroke="#334155" strokeWidth="1" />
          {/* Thread teeth body */}
          <rect x="87" y="56" width="26" height="34" fill={`url(#cardTiAlNViolet_${toolId})`} stroke="#1e1b4b" strokeWidth="1.2" />
          {/* Multi-rib 60° thread teeth */}
          <path d="M 87,60 L 83,63 L 87,66 L 83,69 L 87,72 L 83,75 L 87,78 L 83,81 L 87,84" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <path d="M 113,60 L 117,63 L 113,66 L 117,69 L 113,72 L 117,75 L 113,78 L 117,81 L 113,84" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <line x1="87" y1="63" x2="113" y2="63" stroke="#fef08a" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="87" y1="75" x2="113" y2="75" stroke="#fef08a" strokeWidth="1" strokeDasharray="3 2" />
          <text x="100" y="103" fill="#0284c7" fontSize="9" fontWeight="900" textAnchor="middle">THREAD MILL (PEMBUAT ULIR)</text>
        </g>
      )}

      {/* 10. CONCAVE MILL */}
      {toolId === 'concavemill' && (
        <g>
          {/* Disc body */}
          <circle cx="100" cy="50" r="34" fill={`url(#cardGunmetal_${toolId})`} stroke="#475569" strokeWidth="1.2" />
          <circle cx="100" cy="50" r="22" stroke="#334155" strokeWidth="1" fill="none" />
          <circle cx="100" cy="50" r="9" fill="#0f172a" />
          <rect x="98.5" y="38" width="3" height="7" fill="#0f172a" />
          {/* Concave cutout teeth on perimeter */}
          <path d="M 85,18 A 8 8 0 0 0 97,18" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M 103,18 A 8 8 0 0 0 115,18" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M 66,50 A 8 8 0 0 0 66,62" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M 134,50 A 8 8 0 0 1 134,62" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="100" y="32" fill="#38bdf8" fontSize="7.5" fontWeight="900" textAnchor="middle">R10 DIN 856</text>
          <text x="100" y="103" fill="#0369a1" fontSize="9" fontWeight="900" textAnchor="middle">CONCAVE MILL (CEMBUNG-CEKUNG)</text>
        </g>
      )}

      {/* 11. FLY CUTTER */}
      {toolId === 'flycutter' && (
        <g>
          {/* Spindle arbor shank */}
          <rect x="88" y="8" width="24" height="26" rx="2" fill={`url(#cardSteelShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          {/* Horizontal cross block */}
          <rect x="55" y="34" width="90" height="22" rx="3" fill={`url(#cardGunmetal_${toolId})`} stroke="#0f172a" strokeWidth="1.5" />
          {/* Clamping set screws */}
          <circle cx="80" cy="45" r="3" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
          <circle cx="120" cy="45" r="3" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Downward tool bit holder arm */}
          <polygon points="128,45 142,45 138,82 130,82" fill="#64748b" stroke="#334155" strokeWidth="1" />
          {/* Single carbide tool bit */}
          <polygon points="130,82 142,82 146,90 128,90" fill={`url(#cardTiNGold_${toolId})`} stroke="#ca8a04" strokeWidth="1" />
          {/* Sweep radius arc */}
          <path d="M 65,88 A 60 20 0 0 0 146,88" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="100" y="76" fill="#38bdf8" fontSize="7.5" fontWeight="800" textAnchor="middle">Sweep Ø100 mm</text>
          <text x="100" y="103" fill="#0284c7" fontSize="9" fontWeight="900" textAnchor="middle">FLY CUTTER (FACING CERMIN)</text>
        </g>
      )}
    </svg>
  );
};

// =============================================================================
// KOMPONEN BESAR: MillingCutterVisual (3 VIEW MODES: ANATOMI, SIMULASI, PROFIL)
// =============================================================================
const MillingCutterVisual = ({ tool, mode = 'anatomy', activePinId = 1, onPinClick = () => {} }) => {
  return (
    <div style={{ position: 'relative', width: '100%', background: mode === 'profile' ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: '1.5px solid #cbd5e1', overflow: 'hidden' }}>
      <svg viewBox="0 0 800 380" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '420px' }}>
        <defs>
          {/* Gradients Logam & Pelapis */}
          <linearGradient id="visSteelShank" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="30%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="visGunmetal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="80%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="visTiNGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="visTiAlNViolet" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="25%" stopColor="#4338ca" />
            <stop offset="60%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="visAlTiNCyan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0c4a6e" />
            <stop offset="30%" stopColor="#0284c7" />
            <stop offset="70%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="visWorkpieceSteel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="visMachinedFace" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>

          {/* Marker Panah Teknik */}
          <marker id="millingArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
          </marker>
          <marker id="feedArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ea580c" />
          </marker>

          {/* Pattern Hatching ISO Cross-Section untuk Mode Blueprint */}
          <pattern id="isoHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#38bdf8" strokeWidth="1" opacity="0.35" />
          </pattern>
          <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
        </defs>

        {/* ================================================================= */}
        {/* MODE 1: VISUAL ANATOMI & GEOMETRI FISIK REAL ALAT POTONG         */}
        {/* ================================================================= */}
        {mode === 'anatomy' && (
          <g>
            {/* Grid background samar */}
            <rect width="800" height="380" fill="#f8fafc" />
            <line x1="400" y1="20" x2="400" y2="360" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 4" />

            {/* 1. FACE MILL ANATOMI */}
            {tool.id === 'facemill' && (
              <g>
                {/* Tangkai / Arbor Mount */}
                <rect x="360" y="30" width="80" height="85" rx="4" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="2" />
                <rect x="310" y="115" width="180" height="30" rx="4" fill="url(#visGunmetal)" stroke="#0f172a" strokeWidth="2" />
                {/* Alur Pasak DIN 138 */}
                <rect x="302" y="120" width="16" height="20" fill="#0f172a" />
                <rect x="482" y="120" width="16" height="20" fill="#0f172a" />
                {/* Badan Shell Mill Cutter */}
                <polygon points="250,145 550,145 580,250 220,250" fill="url(#visGunmetal)" stroke="#0f172a" strokeWidth="2.5" />
                <rect x="220" y="250" width="360" height="15" rx="3" fill="#0f172a" />
                {/* Lubang Poros Tengah & Baut Hex */}
                <circle cx="400" cy="198" r="42" fill="#0f172a" />
                <circle cx="400" cy="198" r="28" fill="#475569" stroke="#334155" strokeWidth="2" />
                <polygon points="392,188 408,188 416,198 408,208 392,208 384,198" fill="#0f172a" />
                {/* 6 Insert Karbida Emas TiN */}
                {/* Insert Kiri 45° Lead Angle */}
                <polygon points="208,245 238,215 258,235 228,265" fill="url(#visTiNGold)" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="233" cy="240" r="5" fill="#78350f" />
                <circle cx="233" cy="240" r="2.5" fill="#0f172a" />
                {/* Insert Tengah Kiri */}
                <polygon points="280,248 315,248 315,278 280,278" fill="url(#visTiNGold)" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="297" cy="263" r="4" fill="#78350f" />
                {/* Insert Depan Kiri */}
                <polygon points="340,252 375,252 375,282 340,282" fill="url(#visTiNGold)" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="357" cy="267" r="4" fill="#78350f" />
                {/* Insert Depan Kanan */}
                <polygon points="425,252 460,252 460,282 425,282" fill="url(#visTiNGold)" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="442" cy="267" r="4" fill="#78350f" />
                {/* Insert Tengah Kanan */}
                <polygon points="485,248 520,248 520,278 485,278" fill="url(#visTiNGold)" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="502" cy="263" r="4" fill="#78350f" />
                {/* Insert Kanan 45° Lead Angle */}
                <polygon points="592,245 562,215 542,235 572,265" fill="url(#visTiNGold)" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="567" cy="240" r="5" fill="#78350f" />
                <circle cx="567" cy="240" r="2.5" fill="#0f172a" />
                {/* Indikator Sudut Masuk 45° */}
                <line x1="175" y1="280" x2="230" y2="280" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="195" y1="280" x2="220" y2="255" stroke="#0284c7" strokeWidth="2" />
                <text x="180" y="300" fill="#0284c7" fontSize="12" fontWeight="900">45° Lead Angle</text>
                {/* Putaran Spindel */}
                <path d="M 450,45 A 60,20 0 0,1 350,45" fill="none" stroke="#0284c7" strokeWidth="2.5" markerEnd="url(#millingArrow)" />
                <text x="460" y="42" fill="#0284c7" fontSize="11" fontWeight="800">n (RPM)</text>
              </g>
            )}

            {/* 2. SQUARE END MILL ANATOMI */}
            {tool.id === 'endmill' && (
              <g>
                {/* Tangkai Silindris */}
                <rect x="360" y="30" width="80" height="135" rx="4" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="2" />
                <text x="400" y="85" fill="#475569" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="1">
                  Ø16 HSS-Co8 / TiAlN
                </text>
                <text x="400" y="105" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">
                  DIN 844 • 4-FLUTE
                </text>
                {/* Transisi Leher */}
                <polygon points="360,165 440,165 435,185 365,185" fill="#475569" />
                {/* Badan Heliks TiAlN */}
                <rect x="360" y="185" width="80" height="142" rx="1" fill="url(#visTiAlNViolet)" stroke="#1e1b4b" strokeWidth="2" />
                {/* Spiral Heliks Alur Potong 30° */}
                <path d="M 360,200 Q 400,230 440,260" fill="none" stroke="#a5b4fc" strokeWidth="4.5" />
                <path d="M 360,230 Q 400,260 440,290" fill="none" stroke="#a5b4fc" strokeWidth="4.5" />
                <path d="M 360,260 Q 400,290 440,320" fill="none" stroke="#a5b4fc" strokeWidth="4.5" />
                <path d="M 360,290 Q 390,312 420,327" fill="none" stroke="#a5b4fc" strokeWidth="4.5" />
                {/* Bayangan Alur Pocket */}
                <path d="M 362,208 Q 402,238 438,268" fill="none" stroke="#1e1b4b" strokeWidth="6" opacity="0.5" />
                <path d="M 362,238 Q 402,268 438,298" fill="none" stroke="#1e1b4b" strokeWidth="6" opacity="0.5" />
                {/* Ujung Muka Rata Siku 90° */}
                <line x1="360" y1="327" x2="440" y2="327" stroke="#e0e7ff" strokeWidth="3" />
                {/* Simbol Sudut Siku 90° */}
                <path d="M 360,317 L 370,317 L 370,327" fill="none" stroke="#ef4444" strokeWidth="2" />
                <path d="M 440,317 L 430,317 L 430,327" fill="none" stroke="#ef4444" strokeWidth="2" />
                <text x="345" y="315" fill="#ef4444" fontSize="11" fontWeight="900">90°</text>
                {/* Indikator Diameter & Panjang */}
                <line x1="325" y1="185" x2="325" y2="327" stroke="#0284c7" strokeWidth="1.5" markerEnd="url(#millingArrow)" />
                <text x="315" y="260" fill="#0284c7" fontSize="11" fontWeight="800" textAnchor="end">Lc = 45 mm</text>
              </g>
            )}

            {/* 3. BALL NOSE END MILL ANATOMI */}
            {tool.id === 'ballmill' && (
              <g>
                {/* Tangkai Silindris */}
                <rect x="360" y="30" width="80" height="135" rx="4" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="2" />
                <text x="400" y="85" fill="#475569" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="1">
                  Ø16 R8.0 SOLID CARBIDE
                </text>
                <text x="400" y="105" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">
                  AlTiN COATING • 3D DIE
                </text>
                {/* Transisi Leher */}
                <polygon points="360,165 440,165 435,185 365,185" fill="#475569" />
                {/* Badan Heliks */}
                <rect x="360" y="185" width="80" height="95" fill="url(#visAlTiNCyan)" stroke="#0c4a6e" strokeWidth="2" />
                {/* Ujung Bola Hemisferikal Sempurna R = D/2 */}
                <path d="M 360,280 A 40 40 0 0 0 440,280 Z" fill="url(#visAlTiNCyan)" stroke="#0c4a6e" strokeWidth="2" />
                {/* Spiral Melengkung hingga Ujung Bola */}
                <path d="M 360,200 Q 400,230 440,260" fill="none" stroke="#67e8f9" strokeWidth="4" />
                <path d="M 360,240 Q 400,270 440,290" fill="none" stroke="#67e8f9" strokeWidth="4" />
                <path d="M 364,282 Q 400,320 436,282" fill="none" stroke="#67e8f9" strokeWidth="3.5" />
                {/* Titik Pusat Puncak Vc = 0 */}
                <circle cx="400" cy="320" r="4.5" fill="#ef4444" />
                <line x1="400" y1="325" x2="400" y2="350" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="400" y="365" fill="#ef4444" fontSize="11" fontWeight="900" textAnchor="middle">
                  Pusat Sumbu Bola (Vc ≈ 0 m/min)
                </text>
                {/* Busur Ukuran Radius R = D/2 */}
                <line x1="400" y1="280" x2="435" y2="305" stroke="#0284c7" strokeWidth="2" markerEnd="url(#millingArrow)" />
                <text x="445" y="308" fill="#0284c7" fontSize="12" fontWeight="900">R = 8.0 mm</text>
              </g>
            )}

            {/* 4. ROUGHING END MILL ANATOMI */}
            {tool.id === 'roughing' && (
              <g>
                <rect x="360" y="30" width="80" height="135" rx="4" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="2" />
                <text x="400" y="85" fill="#475569" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="1">
                  Ø20 DIN 844 NR
                </text>
                <text x="400" y="105" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">
                  KNUCKLE FORM ROUGHER
                </text>
                <polygon points="360,165 440,165 435,185 365,185" fill="#475569" />
                <rect x="360" y="185" width="80" height="142" rx="1" fill="url(#visTiAlNViolet)" stroke="#1e1b4b" strokeWidth="2" />
                {/* Wavy knuckle serrations along flutes */}
                {[200, 225, 250, 275, 300].map((yVal, i) => (
                  <path key={i} d={`M 360,${yVal} Q 380,${yVal + 12} 400,${yVal} Q 420,${yVal - 12} 440,${yVal}`} fill="none" stroke="#f59e0b" strokeWidth="3.5" />
                ))}
                <path d="M 360,200 Q 400,230 440,260" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="4 3" />
                <path d="M 360,250 Q 400,280 440,310" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="4 3" />
                <line x1="360" y1="327" x2="440" y2="327" stroke="#e0e7ff" strokeWidth="3" />
                <text x="400" y="350" fill="#ea580c" fontSize="11" fontWeight="900" textAnchor="middle">
                  Profil Knuckle Scalloped DIN 844 NR
                </text>
              </g>
            )}

            {/* BULL NOSE / CORNER RADIUS ANATOMI (LEGACY / ALIAS) */}
            {tool.id === 'bullnose' && (
              <g>
                {/* Tangkai Silindris */}
                <rect x="360" y="30" width="80" height="135" rx="4" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="2" />
                <text x="400" y="85" fill="#475569" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="1">
                  Ø16 R1.5 BULL NOSE
                </text>
                <text x="400" y="105" fill="#64748b" fontSize="9" fontWeight="800" textAnchor="middle">
                  HIGH-FEED HEM TOROIDAL
                </text>
                {/* Badan Heliks */}
                <rect x="360" y="165" width="80" height="145" fill="url(#visTiAlNViolet)" stroke="#1e1b4b" strokeWidth="2" />
                <path d="M 360,185 Q 400,215 440,245" fill="none" stroke="#38bdf8" strokeWidth="4" />
                <path d="M 360,225 Q 400,255 440,285" fill="none" stroke="#38bdf8" strokeWidth="4" />
                <path d="M 360,265 Q 400,295 440,315" fill="none" stroke="#38bdf8" strokeWidth="4" />
                {/* Dasar Datar dengan Corner Radius R1.5 */}
                {/* Fillet Kiri */}
                <path d="M 360,300 Q 360,325 375,325 L 425,325 Q 440,325 440,300" fill="none" stroke="#f59e0b" strokeWidth="4" />
                <rect x="375" y="310" width="50" height="15" fill="url(#visTiAlNViolet)" />
                <line x1="375" y1="325" x2="425" y2="325" stroke="#fef08a" strokeWidth="3" />
                {/* Highlight Callout Radius Sudut Pengaman */}
                <circle cx="363" cy="318" r="8" fill="none" stroke="#ea580c" strokeWidth="2" strokeDasharray="3 2" />
                <line x1="355" y1="318" x2="310" y2="330" stroke="#ea580c" strokeWidth="1.5" />
                <text x="305" y="334" fill="#ea580c" fontSize="11" fontWeight="900" textAnchor="end">
                  Radius Sudut Pengaman (R1.5 mm Anti-Chipping)
                </text>
              </g>
            )}

            {/* 5. T-SLOT CUTTER ANATOMI */}
            {tool.id === 'tslot' && (
              <g>
                {/* Tangkai */}
                <rect x="365" y="30" width="70" height="110" rx="4" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="2" />
                <text x="400" y="85" fill="#475569" fontSize="10" fontWeight="900" textAnchor="middle">
                  T-SLOT CUTTER ISO
                </text>
                {/* Leher Ramping Ramping (Relieved Slender Neck) */}
                <rect x="384" y="140" width="32" height="125" rx="2" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="1.5" />
                {/* Piringan Cakram Potong Kepala Lebar */}
                <rect x="270" y="265" width="260" height="60" rx="4" fill="url(#visGunmetal)" stroke="#0f172a" strokeWidth="2.5" />
                {/* Gigi Silang Bergantian (Staggered Teeth) */}
                {[280, 310, 340, 370, 400, 430, 460, 490].map((gx, idx) => (
                  <g key={idx}>
                    <line x1={gx} y1="265" x2={gx + 12} y2="325" stroke="#f59e0b" strokeWidth="2" />
                    <rect x={gx + 2} y={idx % 2 === 0 ? 266 : 315} width="8" height="9" fill="#fef08a" />
                  </g>
                ))}
                {/* Indikator Leher Ramping vs Diameter Kepala */}
                <line x1="240" y1="295" x2="265" y2="295" stroke="#0284c7" strokeWidth="2" markerEnd="url(#millingArrow)" />
                <text x="235" y="299" fill="#0284c7" fontSize="11" fontWeight="900" textAnchor="end">Ø Kepala 32 mm</text>
                <line x1="430" y1="200" x2="455" y2="200" stroke="#0284c7" strokeWidth="1.5" />
                <text x="460" y="204" fill="#0284c7" fontSize="11" fontWeight="800">Ø Leher 12 mm</text>
              </g>
            )}

            {/* 6. DOVETAIL CUTTER ANATOMI */}
            {tool.id === 'dovetail' && (
              <g>
                {/* Tangkai */}
                <rect x="365" y="30" width="70" height="110" rx="4" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="2" />
                {/* Leher */}
                <rect x="382" y="140" width="36" height="65" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="1.5" />
                {/* Kepala Kerucut Terbalik 60° */}
                <polygon points="382,205 418,205 490,295 310,295" fill="url(#visGunmetal)" stroke="#0f172a" strokeWidth="2.5" />
                {/* Gigi Potong Sisi Miring Konis */}
                <line x1="330" y1="285" x2="384" y2="218" stroke="#38bdf8" strokeWidth="3" />
                <line x1="360" y1="295" x2="395" y2="245" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="470" y1="285" x2="416" y2="218" stroke="#38bdf8" strokeWidth="3" />
                <line x1="440" y1="295" x2="405" y2="245" stroke="#38bdf8" strokeWidth="2.5" />
                {/* Gigi Bawah */}
                <line x1="310" y1="295" x2="490" y2="295" stroke="#f59e0b" strokeWidth="3" />
                {/* Indikator Sudut Miring 60° */}
                <path d="M 310,295 L 350,295" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M 310,295 L 340,258" stroke="#ea580c" strokeWidth="2" />
                <text x="275" y="275" fill="#ea580c" fontSize="13" fontWeight="900">Sudut 60°</text>
              </g>
            )}

            {/* 7. CHAMFER MILL ANATOMI */}
            {tool.id === 'chamfermill' && (
              <g>
                {/* Tangkai */}
                <rect x="365" y="30" width="70" height="135" rx="4" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="2" />
                <text x="400" y="85" fill="#475569" fontSize="11" fontWeight="900" textAnchor="middle">
                  CHAMFER MILL 45°
                </text>
                {/* Kepala Konis Lancip 45° (Included Angle 90°) */}
                <polygon points="360,165 440,165 400,315" fill="url(#visAlTiNCyan)" stroke="#0c4a6e" strokeWidth="2.5" />
                {/* Sisi Potong Flute */}
                <line x1="360" y1="165" x2="400" y2="315" stroke="#f59e0b" strokeWidth="3.5" />
                <line x1="440" y1="165" x2="400" y2="315" stroke="#f59e0b" strokeWidth="3.5" />
                <line x1="400" y1="165" x2="400" y2="310" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="4 3" />
                {/* Sudut Konis 45° / 90° Total */}
                <path d="M 380,240 A 30,30 0 0,0 420,240" fill="none" stroke="#ea580c" strokeWidth="2" />
                <text x="400" y="260" fill="#ea580c" fontSize="11" fontWeight="900" textAnchor="middle">
                  90° (45° per sisi)
                </text>
                {/* Titik Puncak */}
                <circle cx="400" cy="315" r="3" fill="#ef4444" />
                <text x="400" y="340" fill="#64748b" fontSize="10" fontWeight="800" textAnchor="middle">
                  Ujung Konis Runcing (Apex)
                </text>
              </g>
            )}

            {/* 8. SLITTING SAW ANATOMI */}
            {tool.id === 'slittingsaw' && (
              <g>
                {/* Piringan Bundar Besar */}
                <circle cx="400" cy="200" r="140" fill="url(#visGunmetal)" stroke="#334155" strokeWidth="2" />
                {/* Pola Cincin Pengasahan Logam */}
                <circle cx="400" cy="200" r="105" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 6" />
                <circle cx="400" cy="200" r="75" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 6" />
                {/* Puluhan Gigi Potong di Keliling */}
                <circle cx="400" cy="200" r="140" fill="none" stroke="#f59e0b" strokeWidth="5" strokeDasharray="4 4" />
                {/* Lubang Poros Arbor & Pasak */}
                <circle cx="400" cy="200" r="35" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="393" y="160" width="14" height="15" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="400" y="205" fill="#cbd5e1" fontSize="11" fontWeight="900" textAnchor="middle">
                  Ø22 H7
                </text>
                {/* Label Tebal Bilah */}
                <rect x="560" y="80" width="180" height="40" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="650" y="98" fill="#0f172a" fontSize="11" fontWeight="900" textAnchor="middle">
                  Tebal Bilah (Blade Width)
                </text>
                <text x="650" y="113" fill="#0284c7" fontSize="11" fontWeight="800" textAnchor="middle">
                  T = 1.5 mm Ultra-Tipis
                </text>
              </g>
            )}

            {/* 9. THREAD MILL ANATOMI */}
            {tool.id === 'threadmill' && (
              <g>
                <rect x="365" y="30" width="70" height="120" rx="4" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="2" />
                <text x="400" y="85" fill="#475569" fontSize="11" fontWeight="900" textAnchor="middle">
                  M12 × 1.75 ISO THREAD
                </text>
                <rect x="382" y="150" width="36" height="50" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="1.5" />
                <rect x="370" y="200" width="60" height="120" fill="url(#visTiAlNViolet)" stroke="#1e1b4b" strokeWidth="2" />
                {/* 60° thread teeth rows */}
                {[210, 228, 246, 264, 282, 300].map((ty, idx) => (
                  <g key={idx}>
                    <polygon points={`370,${ty} 355,${ty + 9} 370,${ty + 18}`} fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                    <polygon points={`430,${ty} 445,${ty + 9} 430,${ty + 18}`} fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
                    <line x1="370" y1={ty + 9} x2="430" y2={ty + 9} stroke="#a5b4fc" strokeWidth="1" strokeDasharray="3 3" />
                  </g>
                ))}
                <text x="400" y="345" fill="#0284c7" fontSize="11" fontWeight="900" textAnchor="middle">
                  Multi-Rib Helical Thread Flutes 60°
                </text>
              </g>
            )}

            {/* 10. CONCAVE MILL ANATOMI */}
            {tool.id === 'concavemill' && (
              <g>
                <circle cx="400" cy="190" r="130" fill="url(#visGunmetal)" stroke="#334155" strokeWidth="2" />
                <circle cx="400" cy="190" r="85" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 4" />
                <circle cx="400" cy="190" r="35" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="393" y="150" width="14" height="15" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                {/* Concave edge profile around rim */}
                <path d="M 370,60 A 30 30 0 0 1 430,60" fill="none" stroke="#f59e0b" strokeWidth="6" />
                <path d="M 530,160 A 30 30 0 0 1 530,220" fill="none" stroke="#f59e0b" strokeWidth="6" />
                <path d="M 270,160 A 30 30 0 0 0 270,220" fill="none" stroke="#f59e0b" strokeWidth="6" />
                <text x="400" y="195" fill="#cbd5e1" fontSize="11" fontWeight="900" textAnchor="middle">
                  DIN 856 R10
                </text>
                <text x="400" y="345" fill="#f59e0b" fontSize="11" fontWeight="900" textAnchor="middle">
                  Profil Cekung Form-Relieved (Convex-Producing Arc)
                </text>
              </g>
            )}

            {/* 11. FLY CUTTER ANATOMI */}
            {tool.id === 'flycutter' && (
              <g>
                <rect x="365" y="30" width="70" height="90" rx="4" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="2" />
                <text x="400" y="75" fill="#475569" fontSize="11" fontWeight="900" textAnchor="middle">
                  SPINDLE ARBOR
                </text>
                {/* Large horizontal fly cutter block */}
                <rect x="250" y="120" width="300" height="60" rx="6" fill="url(#visGunmetal)" stroke="#0f172a" strokeWidth="2.5" />
                <circle cx="330" cy="150" r="8" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="470" cy="150" r="8" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Single tool bit arm extension */}
                <polygon points="500,150 540,150 525,270 495,270" fill="url(#visSteelShank)" stroke="#334155" strokeWidth="1.5" />
                {/* Single indexable carbide insert */}
                <polygon points="495,270 525,270 535,295 485,295" fill="url(#visTiNGold)" stroke="#ca8a04" strokeWidth="2" />
                {/* Sweep arc */}
                <path d="M 270,295 A 130 35 0 0 0 530,295" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3" />
                <text x="400" y="335" fill="#0284c7" fontSize="12" fontWeight="900" textAnchor="middle">
                  Radius Sapuan Facing: Ø 120 mm Single-Point Bit
                </text>
              </g>
            )}

            {/* INTERACTIVE ANATOMY CALLOUT PINS */}
            {tool.pins.map(pin => {
              const isPinActive = pin.id === activePinId;
              return (
                <g key={pin.id} onClick={() => onPinClick(pin.id)} style={{ cursor: 'pointer' }}>
                  {/* Glowing Pulse Ring if Active */}
                  {isPinActive && (
                    <circle cx={pin.x} cy={pin.y} r="18" fill="rgba(2, 132, 199, 0.25)">
                      <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Pin Circle */}
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="11"
                    fill={isPinActive ? '#0284c7' : '#1e293b'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pin.x}
                    y={pin.y + 4}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {pin.id}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* ================================================================= */}
        {/* MODE 2: SIMULASI PENYAYATAN BENDA KERJA (CHIP REMOVAL ACTION)     */}
        {/* ================================================================= */}
        {mode === 'simulation' && (
          <g>
            <rect width="800" height="380" fill="#f1f5f9" />

            {/* Benda Kerja Balok Baja S45C */}
            <rect x="80" y="210" width="640" height="140" rx="4" fill="url(#visWorkpieceSteel)" stroke="#1e293b" strokeWidth="2" />
            <text x="100" y="335" fill="#94a3b8" fontSize="12" fontWeight="900">
              BENDA KERJA: BALOK BAJA S45C (KEKERASAN 200 HB)
            </text>

            {/* CUTTING INTERACTION BY TOOL */}
            {tool.id === 'facemill' && (
              <g>
                {/* Zona Termakan Rata (Kiri Cutter) */}
                <rect x="80" y="235" width="280" height="115" fill="url(#visMachinedFace)" />
                <line x1="80" y1="235" x2="360" y2="235" stroke="#38bdf8" strokeWidth="3" />
                <text x="140" y="260" fill="#0369a1" fontSize="11" fontWeight="800">
                  Bidang Selesai Frais (Ra 0.8 µm)
                </text>
                {/* Cutter Posisi Sedang Menyayat */}
                <rect x="310" y="80" width="180" height="25" fill="url(#visGunmetal)" />
                <polygon points="260,105 540,105 565,225 235,225" fill="url(#visGunmetal)" stroke="#0f172a" strokeWidth="2" />
                <polygon points="225,220 255,190 275,210 245,240" fill="url(#visTiNGold)" stroke="#ca8a04" strokeWidth="2" />
                <polygon points="575,220 545,190 525,210 555,240" fill="url(#visTiNGold)" stroke="#ca8a04" strokeWidth="2" />
                {/* Bram / Curled Chips Terbang */}
                <path d="M 230,230 Q 210,190 180,210 Q 190,170 160,185" fill="none" stroke="#f59e0b" strokeWidth="3.5" />
                <path d="M 245,220 Q 225,180 200,195" fill="none" stroke="#fef08a" strokeWidth="3" />
                <path d="M 235,245 Q 215,225 190,240" fill="none" stroke="#ea580c" strokeWidth="3" />
                {/* Dimensi ap & vf */}
                <line x1="360" y1="210" x2="360" y2="235" stroke="#ef4444" strokeWidth="2" />
                <text x="370" y="226" fill="#ef4444" fontSize="11" fontWeight="900">ap = 2.5 mm</text>
                <line x1="620" y1="270" x2="520" y2="270" stroke="#ea580c" strokeWidth="3" markerEnd="url(#feedArrow)" />
                <text x="630" y="274" fill="#ea580c" fontSize="11" fontWeight="900">Gerak Meja vf (Feed)</text>
              </g>
            )}

            {tool.id === 'endmill' && (
              <g>
                {/* Alur Siku 90° Termakan */}
                <polygon points="200,210 360,210 360,285 200,285" fill="url(#visMachinedFace)" />
                <line x1="360" y1="210" x2="360" y2="285" stroke="#ef4444" strokeWidth="2.5" />
                <line x1="200" y1="285" x2="360" y2="285" stroke="#38bdf8" strokeWidth="3" />
                <text x="368" y="250" fill="#ef4444" fontSize="11" fontWeight="900">Dinding 90°</text>
                {/* End Mill Menyayat Siku */}
                <rect x="360" y="100" width="80" height="185" fill="url(#visTiAlNViolet)" stroke="#1e1b4b" strokeWidth="2" />
                <path d="M 360,180 Q 400,210 440,240" fill="none" stroke="#a5b4fc" strokeWidth="3.5" />
                <path d="M 360,220 Q 400,250 440,280" fill="none" stroke="#a5b4fc" strokeWidth="3.5" />
                {/* Bram Keluar Lewat Heliks ke Atas */}
                <path d="M 355,240 Q 320,210 340,180" fill="none" stroke="#f59e0b" strokeWidth="3" />
                <path d="M 350,220 Q 310,190 325,160" fill="none" stroke="#fef08a" strokeWidth="3" />
                {/* Dimensi */}
                <text x="240" y="305" fill="#0284c7" fontSize="11" fontWeight="900">ae = 16 mm (Full Slot)</text>
              </g>
            )}

            {tool.id === 'ballmill' && (
              <g>
                {/* Rongga Kurva 3D Termakan */}
                <path d="M 280,210 Q 400,295 520,210" fill="url(#visMachinedFace)" stroke="#38bdf8" strokeWidth="3" />
                <text x="400" y="270" fill="#0284c7" fontSize="11" fontWeight="900" textAnchor="middle">
                  Rongga Kurva 3D Mold &amp; Die
                </text>
                {/* Ball Nose Submerged */}
                <rect x="360" y="80" width="80" height="150" fill="url(#visAlTiNCyan)" />
                <path d="M 360,230 A 40 40 0 0 0 440,230 Z" fill="url(#visAlTiNCyan)" stroke="#0c4a6e" strokeWidth="2" />
                {/* Tatal Halus Menyemprot Tangensial */}
                <circle cx="340" cy="245" r="3" fill="#f59e0b" />
                <circle cx="330" cy="235" r="2.5" fill="#fef08a" />
                <circle cx="455" cy="245" r="3" fill="#f59e0b" />
              </g>
            )}

            {tool.id === 'roughing' && (
              <g>
                {/* Deep roughing slot cut */}
                <polygon points="180,210 360,210 360,310 180,310" fill="url(#visMachinedFace)" />
                <line x1="360" y1="210" x2="360" y2="310" stroke="#ef4444" strokeWidth="2.5" />
                {/* Scalloped wavy bottom & wall */}
                <path d="M 180,310 Q 210,305 240,310 Q 270,305 300,310 Q 330,305 360,310" fill="none" stroke="#f59e0b" strokeWidth="3" />
                {/* Roughing cutter active */}
                <rect x="360" y="70" width="80" height="240" fill="url(#visTiAlNViolet)" stroke="#1e1b4b" strokeWidth="2" />
                {[90, 120, 150, 180, 210, 240, 270].map((yy, i) => (
                  <path key={i} d={`M 360,${yy} Q 400,${yy + 15} 440,${yy}`} fill="none" stroke="#f59e0b" strokeWidth="3" />
                ))}
                {/* Broken curlicue chips flying */}
                <circle cx="340" cy="270" r="4" fill="#f59e0b" />
                <circle cx="330" cy="250" r="3" fill="#ea580c" />
                <circle cx="320" cy="280" r="3.5" fill="#fef08a" />
                <circle cx="310" cy="230" r="4" fill="#f59e0b" />
                <text x="270" y="270" fill="#ea580c" fontSize="11" fontWeight="900">Tatal Pendek Terpecah (No Clogging)</text>
                <text x="370" y="200" fill="#ef4444" fontSize="11" fontWeight="900">ap = 20 mm (Heavy MRR)</text>
              </g>
            )}

            {tool.id === 'bullnose' && (
              <g>
                {/* Kantong dengan Fillet R1.5 */}
                <path d="M 240,210 L 240,280 Q 240,295 255,295 L 425,295 Q 440,295 440,280 L 440,210" fill="url(#visMachinedFace)" stroke="#38bdf8" strokeWidth="2.5" />
                <text x="340" y="280" fill="#0369a1" fontSize="11" fontWeight="900" textAnchor="middle">
                  Kantong Fillet R1.5 mm
                </text>
                <rect x="360" y="90" width="80" height="190" fill="url(#visTiAlNViolet)" stroke="#1e1b4b" strokeWidth="2" />
                <path d="M 360,270 Q 360,295 375,295 L 425,295 Q 440,295 440,270" fill="none" stroke="#f59e0b" strokeWidth="3.5" />
              </g>
            )}

            {tool.id === 'tslot' && (
              <g>
                {/* Alur T Sempurna (Celah Vertikal + Rongga Horizontal) */}
                <polygon points="375,210 425,210 425,250 510,250 510,310 290,310 290,250 375,250" fill="url(#visMachinedFace)" stroke="#38bdf8" strokeWidth="2" />
                {/* Pisau Sedang di Dalam Rongga */}
                <rect x="388" y="120" width="24" height="130" fill="url(#visSteelShank)" />
                <rect x="280" y="250" width="240" height="55" fill="url(#visGunmetal)" stroke="#0f172a" strokeWidth="2" />
                <text x="400" y="282" fill="#fef08a" fontSize="11" fontWeight="900" textAnchor="middle">
                  Memotong Rongga Bawah Alur T
                </text>
                {/* Panah Celah Bebas */}
                <line x1="360" y1="225" x2="385" y2="225" stroke="#ef4444" strokeWidth="1.5" />
                <text x="350" y="229" fill="#ef4444" fontSize="10" fontWeight="900" textAnchor="end">Alur Awal Bebas</text>
              </g>
            )}

            {tool.id === 'dovetail' && (
              <g>
                {/* Alur Ekor Burung 60° */}
                <polygon points="360,210 440,210 440,240 500,295 300,295 360,240" fill="url(#visMachinedFace)" stroke="#38bdf8" strokeWidth="2" />
                <rect x="385" y="110" width="30" height="90" fill="url(#visSteelShank)" />
                <polygon points="385,200 415,200 490,290 310,290" fill="url(#visGunmetal)" stroke="#0f172a" strokeWidth="2" />
                <text x="400" y="260" fill="#fef08a" fontSize="11" fontWeight="900" textAnchor="middle">
                  Sayatan Kemiringan 60°
                </text>
              </g>
            )}

            {tool.id === 'chamfermill' && (
              <g>
                {/* Sudut Balok Terpotong Miring 45° */}
                <polygon points="350,210 410,270 410,210" fill="#f1f5f9" />
                <line x1="350" y1="210" x2="410" y2="270" stroke="#ef4444" strokeWidth="3" />
                <text x="365" y="255" fill="#ef4444" fontSize="12" fontWeight="900">Chamfer 45°</text>
                <polygon points="370,120 450,120 410,270" fill="url(#visAlTiNCyan)" stroke="#0c4a6e" strokeWidth="2" />
              </g>
            )}

            {tool.id === 'slittingsaw' && (
              <g>
                {/* Celah Sempit Terbelah */}
                <rect x="395" y="210" width="10" height="120" fill="#0f172a" />
                <line x1="395" y1="210" x2="395" y2="330" stroke="#38bdf8" strokeWidth="2" />
                <line x1="405" y1="210" x2="405" y2="330" stroke="#38bdf8" strokeWidth="2" />
                {/* Saw Submerged */}
                <circle cx="400" cy="180" r="130" fill="url(#visGunmetal)" opacity="0.9" />
                <circle cx="400" cy="180" r="130" stroke="#f59e0b" strokeWidth="4" strokeDasharray="4 4" fill="none" />
                <text x="430" y="310" fill="#38bdf8" fontSize="11" fontWeight="900">Celah Tembus 1.5 mm</text>
              </g>
            )}

            {tool.id === 'threadmill' && (
              <g>
                {/* Pre-drilled hole with threaded walls */}
                <rect x="330" y="210" width="140" height="120" fill="url(#visMachinedFace)" stroke="#38bdf8" strokeWidth="1.5" />
                {[220, 238, 256, 274, 292, 310].map((gy, i) => (
                  <g key={i}>
                    <line x1="330" y1={gy} x2="340" y2={gy + 6} stroke="#ef4444" strokeWidth="2" />
                    <line x1="470" y1={gy} x2="460" y2={gy + 6} stroke="#ef4444" strokeWidth="2" />
                  </g>
                ))}
                {/* Thread mill interpolating */}
                <rect x="360" y="110" width="60" height="190" fill="url(#visTiAlNViolet)" stroke="#1e1b4b" strokeWidth="2" />
                {/* Helical orbit circle */}
                <ellipse cx="400" cy="210" rx="35" ry="12" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 3" />
                <text x="400" y="195" fill="#0284c7" fontSize="11" fontWeight="900" textAnchor="middle">Interpolasi Heliks 3D (G02/G03)</text>
              </g>
            )}

            {tool.id === 'concavemill' && (
              <g>
                {/* Rounded edge of workpiece */}
                <path d="M 280,210 Q 340,210 340,250 L 340,350 L 80,350 L 80,210 Z" fill="url(#visMachinedFace)" stroke="#38bdf8" strokeWidth="2" />
                {/* Concave cutter contacting edge */}
                <circle cx="340" cy="180" r="90" fill="url(#visGunmetal)" opacity="0.9" />
                <path d="M 320,250 A 20 20 0 0 1 360,250" fill="none" stroke="#f59e0b" strokeWidth="4" />
                <text x="260" y="240" fill="#0284c7" fontSize="11" fontWeight="900">Tepi Cembung R10 mm</text>
              </g>
            )}

            {tool.id === 'flycutter' && (
              <g>
                {/* Super flat mirrored top face */}
                <rect x="80" y="215" width="480" height="135" fill="url(#visMachinedFace)" />
                <line x1="80" y1="215" x2="560" y2="215" stroke="#38bdf8" strokeWidth="3" />
                <text x="240" y="245" fill="#0369a1" fontSize="11" fontWeight="900">Sapuan Cermin Super Rata (Ra 0.2 µm)</text>
                {/* Fly cutter sweep */}
                <rect x="350" y="70" width="160" height="40" fill="url(#visGunmetal)" stroke="#0f172a" strokeWidth="2" />
                <polygon points="480,110 510,110 500,215 480,215" fill="url(#visSteelShank)" />
                <polygon points="480,210 505,210 510,225 475,225" fill="url(#visTiNGold)" stroke="#ca8a04" strokeWidth="2" />
                <ellipse cx="430" cy="215" rx="120" ry="25" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3" />
              </g>
            )}

            {/* Kotak Info Simulasi */}
            <rect x="80" y="20" width="640" height="48" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="100" y="42" fill="#0f172a" fontSize="12" fontWeight="900">
              ⚡ {tool.simulasi.judul}
            </text>
            <text x="100" y="58" fill="#475569" fontSize="10.5" fontWeight="700">
              {tool.simulasi.aksi}
            </text>
          </g>
        )}

        {/* ================================================================= */}
        {/* MODE 3: PROFIL PENAMPANG HASIL FRAIS (CAD BLUEPRINT SPECIFICATION)*/}
        {/* ================================================================= */}
        {mode === 'profile' && (
          <g>
            {/* Dark Blueprint Grid Background */}
            <rect width="800" height="380" fill="#0b1329" />
            <rect width="800" height="380" fill="url(#blueprintGrid)" />

            {/* Header Blueprint */}
            <rect x="40" y="20" width="720" height="42" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" rx="6" />
            <text x="60" y="46" fill="#38bdf8" fontSize="13" fontWeight="900" letterSpacing="1">
              📐 BLUEPRINT TEKNIK: {tool.blueprint.judul.toUpperCase()}
            </text>
            <text x="740" y="46" fill="#94a3b8" fontSize="11" fontWeight="800" textAnchor="end">
              STANDAR ISO 1101 / DIN 7168
            </text>

            {/* Gambar Penampang Hasil Sayatan dalam Benda Kerja Logam */}
            <g transform="translate(60, 80)">
              {/* Benda Kerja Logam Arsir ISO */}
              <rect x="40" y="40" width="600" height="190" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <rect x="40" y="40" width="600" height="190" fill="url(#isoHatch)" />

              {/* Fitur Profil Potongan Hasil Frais */}
              {tool.id === 'facemill' && (
                <g>
                  <rect x="40" y="40" width="600" height="35" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="340" y="62" fill="#38bdf8" fontSize="14" fontWeight="900" textAnchor="middle">
                    BIDANG ATAS FRAIS RATA (SURFACE FINISH Ra = 0.8 µm)
                  </text>
                  <text x="340" y="110" fill="#fef08a" fontSize="12" fontWeight="800" textAnchor="middle">
                    Simbol Kerataan: ⏥ 0.01 mm • Simbol Kekasaran: ▽▽▽ N6
                  </text>
                </g>
              )}

              {tool.id === 'endmill' && (
                <g>
                  <rect x="180" y="40" width="280" height="90" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  <line x1="180" y1="130" x2="460" y2="130" stroke="#f59e0b" strokeWidth="3" />
                  <line x1="460" y1="40" x2="460" y2="130" stroke="#ef4444" strokeWidth="3" />
                  <text x="320" y="90" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">
                    ALUR PASAK SIKU 90° (W = 16 mm, H = 12 mm)
                  </text>
                  <text x="320" y="165" fill="#fef08a" fontSize="12" fontWeight="800" textAnchor="middle">
                    Kesikuan: ⟂ 0.02 mm • Toleransi Lebar: 16 H9 (+0.043 / 0)
                  </text>
                </g>
              )}

              {tool.id === 'ballmill' && (
                <g>
                  <path d="M 220,40 Q 340,160 460,40 Z" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="340" y="105" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">
                    RONGGA CETAKAN KURVA BOLA R8.0 mm
                  </text>
                  <text x="340" y="175" fill="#fef08a" fontSize="12" fontWeight="800" textAnchor="middle">
                    Toleransi Profil Permukaan Bebas: ⌒ 0.01 mm
                  </text>
                </g>
              )}

              {tool.id === 'roughing' && (
                <g>
                  <rect x="180" y="40" width="280" height="100" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  <path d="M 180,140 Q 210,135 240,140 Q 270,135 300,140 Q 330,135 360,140 Q 390,135 420,140 Q 440,135 460,140" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                  <text x="320" y="90" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">
                    ALUR KASAR DENGAN SISA STOK FINISHING
                  </text>
                  <text x="320" y="170" fill="#fef08a" fontSize="12" fontWeight="800" textAnchor="middle">
                    Finishing Allowance: 0.8 mm disisakan untuk Square End Mill
                  </text>
                </g>
              )}

              {tool.id === 'bullnose' && (
                <g>
                  <path d="M 200,40 L 200,120 Q 200,135 215,135 L 465,135 Q 480,135 480,120 L 480,40 Z" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="340" y="95" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">
                    KANTONG TEGAK DENGAN FILLET POJOK R1.5 mm
                  </text>
                  <text x="340" y="175" fill="#fef08a" fontSize="12" fontWeight="800" textAnchor="middle">
                    Radius Pengaman: R1.5 ± 0.05 mm • Bebas Konsentrasi Tegangan
                  </text>
                </g>
              )}

              {tool.id === 'tslot' && (
                <g>
                  <polygon points="310,40 370,40 370,100 450,100 450,170 230,170 230,100 310,100" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  {/* Baut T Ghosted */}
                  <polygon points="325,40 355,40 355,115 435,115 435,155 245,155 245,115 325,115" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="340" y="140" fill="#f59e0b" fontSize="11" fontWeight="900" textAnchor="middle">
                    DIN 508 T-BOLT
                  </text>
                  <text x="340" y="205" fill="#38bdf8" fontSize="12" fontWeight="800" textAnchor="middle">
                    Standar Alur Meja Frais: ISO 299 • Lebar 14 H12
                  </text>
                </g>
              )}

              {tool.id === 'dovetail' && (
                <g>
                  <polygon points="280,40 400,40 400,80 470,160 210,160 280,80" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="340" y="125" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">
                    REL LUNCUR EKOR BURUNG (DOVETAIL 60°)
                  </text>
                  <text x="340" y="195" fill="#fef08a" fontSize="12" fontWeight="800" textAnchor="middle">
                    Toleransi Sudut Guideway: 60° ± 5 menit busur
                  </text>
                </g>
              )}

              {tool.id === 'chamfermill' && (
                <g>
                  <polygon points="40,40 100,40 40,100" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  <line x1="100" y1="40" x2="40" y2="100" stroke="#f59e0b" strokeWidth="3" />
                  <text x="340" y="110" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">
                    CHAMFER KEMIRINGAN TEPI C2.0 (45° × 2.0 mm)
                  </text>
                  <text x="340" y="150" fill="#fef08a" fontSize="12" fontWeight="800" textAnchor="middle">
                    Standar Deburring: ISO 13715 (Bebas Burr Tajam)
                  </text>
                </g>
              )}

              {tool.id === 'slittingsaw' && (
                <g>
                  <rect x="330" y="40" width="20" height="150" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="340" y="115" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle" transform="rotate(-90 340 115)">
                    CELAH 1.5 mm
                  </text>
                  <text x="440" y="115" fill="#fef08a" fontSize="12" fontWeight="800">
                    Lebar Celah: 1.5 mm (+0.05 / -0.02)
                  </text>
                </g>
              )}

              {tool.id === 'threadmill' && (
                <g>
                  <rect x="220" y="40" width="200" height="140" fill="#0b1329" stroke="#38bdf8" strokeWidth="2" />
                  {[50, 70, 90, 110, 130, 150].map((py, idx) => (
                    <g key={idx}>
                      <polygon points={`220,${py} 210,${py + 7} 220,${py + 14}`} fill="#38bdf8" />
                      <polygon points={`420,${py} 430,${py + 7} 420,${py + 14}`} fill="#38bdf8" />
                    </g>
                  ))}
                  <text x="320" y="95" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">
                    PROFIL ULIR DALAM METRIK M12 × 1.75
                  </text>
                  <text x="320" y="165" fill="#fef08a" fontSize="12" fontWeight="800" textAnchor="middle">
                    Standar ISO 68-1 • Kelas Toleransi 6H • Sudut Puncak 60°
                  </text>
                </g>
              )}

              {tool.id === 'concavemill' && (
                <g>
                  <path d="M 40,40 L 220,40 A 60 60 0 0 1 220,160 L 40,160 Z" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="340" y="95" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">
                    TEPI LUAR CEMBUNG FULL-RADIUS (CONVEX R10 mm)
                  </text>
                  <text x="340" y="150" fill="#fef08a" fontSize="12" fontWeight="800" textAnchor="middle">
                    Standar DIN 856 • Radius R10.0 ± 0.03 mm Mulus Sempurna
                  </text>
                </g>
              )}

              {tool.id === 'flycutter' && (
                <g>
                  <rect x="40" y="40" width="600" height="25" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="340" y="58" fill="#38bdf8" fontSize="14" fontWeight="900" textAnchor="middle">
                    BIDANG ATAS SAPUAN CERMIN (MIRROR FACING FINISH)
                  </text>
                  <text x="340" y="110" fill="#fef08a" fontSize="12" fontWeight="800" textAnchor="middle">
                    Kekasaran Permukaan: Ra 0.2 µm • Kerataan Total: ⏥ 0.005 mm
                  </text>
                </g>
              )}
            </g>

            {/* Footer Blueprint Box */}
            <rect x="40" y="325" width="720" height="35" fill="#1e293b" rx="4" />
            <text x="60" y="347" fill="#38bdf8" fontSize="11" fontWeight="900">
              {tool.blueprint.profil}
            </text>
            <text x="740" y="347" fill="#fef08a" fontSize="11" fontWeight="800" textAnchor="end">
              {tool.blueprint.toleransi}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

// =============================================================================
// KOMPONEN KARTU VISUAL REALISTIS PAHAT BUBUT (200x110 PX)
// =============================================================================
const LatheToolCardVisual = ({ toolId, isSelected = false }) => {
  return (
    <svg viewBox="0 0 200 110" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', filter: isSelected ? 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.28))' : 'none' }}>
      <defs>
        <linearGradient id={`latheShank_${toolId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="35%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id={`latheTiN_${toolId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <marker id={`arrow_${toolId}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
        </marker>
        <marker id={`arrowOr_${toolId}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ea580c" />
        </marker>
      </defs>

      {/* Grid background garis tengah */}
      <line x1="10" y1="55" x2="190" y2="55" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.25" />

      {/* 1. PAHAT RATA KANAN (ISO 6) */}
      {toolId === 'pahat-rata-kanan' && (
        <g>
          <rect x="70" y="38" width="120" height="40" rx="2" fill={`url(#latheShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <text x="130" y="62" fill="#475569" fontSize="8" fontWeight="900" letterSpacing="0.5">25×25 mm</text>
          <polygon points="70,38 35,52 35,78 70,78" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <polygon points="35,52 68,52 56,78 23,78" fill={`url(#latheTiN_${toolId})`} stroke="#ca8a04" strokeWidth="1.2" />
          <circle cx="45" cy="65" r="4" fill="#78350f" />
          <circle cx="45" cy="65" r="2" fill="#0f172a" />
          <line x1="23" y1="78" x2="35" y2="52" stroke="#ef4444" strokeWidth="2.2" />
          <line x1="150" y1="22" x2="80" y2="22" stroke="#2563eb" strokeWidth="2.5" markerEnd={`url(#arrow_${toolId})`} />
          <text x="115" y="16" fill="#2563eb" fontSize="8" fontWeight="900" textAnchor="middle">vf ← (KE ARAH CHUCK)</text>
          <text x="100" y="102" fill="#2563eb" fontSize="9" fontWeight="900" textAnchor="middle">PAHAT RATA KANAN (ISO 6)</text>
        </g>
      )}

      {/* 2. PAHAT RATA KIRI (ISO 5) */}
      {toolId === 'pahat-rata-kiri' && (
        <g>
          <rect x="10" y="38" width="120" height="40" rx="2" fill={`url(#latheShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <text x="65" y="62" fill="#475569" fontSize="8" fontWeight="900" letterSpacing="0.5">25×25 mm</text>
          <polygon points="130,38 165,52 165,78 130,78" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <polygon points="132,52 165,52 177,78 144,78" fill={`url(#latheTiN_${toolId})`} stroke="#ca8a04" strokeWidth="1.2" />
          <circle cx="155" cy="65" r="4" fill="#78350f" />
          <line x1="165" y1="52" x2="177" y2="78" stroke="#ef4444" strokeWidth="2.2" />
          <line x1="50" y1="22" x2="120" y2="22" stroke="#ea580c" strokeWidth="2.5" markerEnd={`url(#arrowOr_${toolId})`} />
          <text x="85" y="16" fill="#ea580c" fontSize="8" fontWeight="900" textAnchor="middle">vf → (MENJAUHI CHUCK)</text>
          <text x="100" y="102" fill="#ea580c" fontSize="9" fontWeight="900" textAnchor="middle">PAHAT RATA KIRI (ISO 5)</text>
        </g>
      )}

      {/* 3. PAHAT MUKA / FACING (ISO 2) */}
      {toolId === 'pahat-muka' && (
        <g>
          <rect x="50" y="46" width="115" height="38" rx="2" fill={`url(#latheShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <polygon points="50,46 16,22 32,8 75,46" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <polygon points="16,22 40,4 58,22 34,40" fill={`url(#latheTiN_${toolId})`} stroke="#ca8a04" strokeWidth="1.2" />
          <circle cx="37" cy="22" r="3.5" fill="#78350f" />
          <text x="70" y="24" fill="#16a34a" fontSize="8.5" fontWeight="900">45° FACING</text>
          <line x1="20" y1="50" x2="20" y2="82" stroke="#16a34a" strokeWidth="2.5" markerEnd={`url(#arrow_${toolId})`} />
          <text x="25" y="70" fill="#16a34a" fontSize="7.5" fontWeight="900">vf ↓</text>
          <text x="100" y="102" fill="#16a34a" fontSize="9" fontWeight="900" textAnchor="middle">PAHAT MUKA / FACING (ISO 2)</text>
        </g>
      )}

      {/* 4. PAHAT ALUR & POTONG (ISO 7) */}
      {toolId === 'pahat-alur-potong' && (
        <g>
          <rect x="75" y="40" width="110" height="38" rx="2" fill={`url(#latheShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <rect x="22" y="50" width="55" height="20" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="1" />
          <rect x="12" y="50" width="12" height="20" fill={`url(#latheTiN_${toolId})`} stroke="#ca8a04" strokeWidth="1" />
          <line x1="12" y1="50" x2="12" y2="70" stroke="#ef4444" strokeWidth="2" />
          <text x="18" y="42" fill="#d97706" fontSize="8" fontWeight="900" textAnchor="middle">W=3 mm</text>
          <line x1="18" y1="18" x2="18" y2="35" stroke="#d97706" strokeWidth="2.5" markerEnd={`url(#arrowOr_${toolId})`} />
          <text x="100" y="102" fill="#d97706" fontSize="9" fontWeight="900" textAnchor="middle">PAHAT ALUR & POTONG (ISO 7)</text>
        </g>
      )}

      {/* 5. PAHAT ULIR LUAR 60° (DIN 282) */}
      {toolId === 'pahat-ulir-luar' && (
        <g>
          <rect x="60" y="42" width="125" height="38" rx="2" fill={`url(#latheShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <polygon points="60,42 28,42 40,80 60,80" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <polygon points="16,52 38,34 38,70" fill={`url(#latheTiN_${toolId})`} stroke="#ca8a04" strokeWidth="1.2" />
          <circle cx="31" cy="52" r="3.5" fill="#78350f" />
          <path d="M 28,47 A 8 8 0 0 1 28,57" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <text x="44" y="55" fill="#ef4444" fontSize="8" fontWeight="900">60°</text>
          <text x="100" y="102" fill="#7c3aed" fontSize="9" fontWeight="900" textAnchor="middle">PAHAT ULIR METRIK 60° (DIN 282)</text>
        </g>
      )}

      {/* 6. PAHAT BUBUT DALAM / BORING BAR (ISO 8) */}
      {toolId === 'pahat-dalam-boring' && (
        <g>
          <rect x="35" y="48" width="150" height="26" rx="4" fill={`url(#latheShank_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <circle cx="172" cy="61" r="3.5" fill="#0284c7" />
          <text x="145" y="42" fill="#64748b" fontSize="7" fontWeight="800">Internal Coolant</text>
          <polygon points="35,48 12,38 12,62 35,74" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <polygon points="12,38 24,28 28,44 16,54" fill={`url(#latheTiN_${toolId})`} stroke="#ca8a04" strokeWidth="1" />
          <circle cx="20" cy="41" r="2" fill="#78350f" />
          <line x1="5" y1="24" x2="40" y2="24" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="22" y="20" fill="#0284c7" fontSize="7" fontWeight="900">Lubang Ø</text>
          <text x="100" y="102" fill="#0284c7" fontSize="9" fontWeight="900" textAnchor="middle">PAHAT DALAM / BORING BAR (ISO 8)</text>
        </g>
      )}
    </svg>
  );
};

// =============================================================================
// KOMPONEN BESAR MASTER PAHAT BUBUT (ANATOMI & SIMULASI PENYAYATAN BUBUT)
// =============================================================================
const LatheToolMasterVisual = ({ tool, mode = 'anatomy', activePinId = 1, onPinClick = () => {} }) => {
  return (
    <div style={{ position: 'relative', width: '100%', background: mode === 'simulation' ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: '1.5px solid #cbd5e1', overflow: 'hidden' }}>
      <svg viewBox="0 0 800 320" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '360px' }}>
        <defs>
          <linearGradient id="visLatheShank" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="25%" stopColor="#94a3b8" />
            <stop offset="65%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="visLatheWorkpiece" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="visLatheTurned" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="visLatheTiN" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <marker id="visArrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
          </marker>
          <marker id="visArrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" />
          </marker>
        </defs>

        {/* MODE 1: ANATOMI FISIK */}
        {mode === 'anatomy' && (
          <g>
            <rect width="800" height="320" fill="#f8fafc" />
            <line x1="400" y1="10" x2="400" y2="310" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 4" />

            {/* Tangkai Pahat Baja 25x25 mm */}
            <rect x="250" y="70" width="480" height="150" rx="6" fill="url(#visLatheShank)" stroke="#1e293b" strokeWidth="2.5" />
            <text x="490" y="150" fill="#334155" fontSize="18" fontWeight="900" letterSpacing="3">
              TANGKAI BAJA (TOOL SHANK 25×25 mm)
            </text>
            <text x="490" y="175" fill="#64748b" fontSize="11" fontWeight="800">
              STANDAR DIN 4980 / ISO KOTAK KAKU
            </text>

            {/* Dudukan Pocket Baja Sepuhan */}
            <polygon points="120,50 260,50 260,190 170,230 90,140" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />

            {/* Insert Karbida Emas Sesuai Jenis */}
            {tool.id === 'pahat-alur-potong' ? (
              <g>
                <rect x="40" y="110" width="120" height="40" fill="url(#visLatheTiN)" stroke="#ca8a04" strokeWidth="2" />
                <rect x="30" y="110" width="18" height="40" fill="#ca8a04" />
                <text x="100" y="135" fill="#78350f" fontSize="12" fontWeight="900">W = 3 mm</text>
              </g>
            ) : tool.id === 'pahat-ulir-luar' ? (
              <g>
                <polygon points="60,130 180,60 180,200" fill="url(#visLatheTiN)" stroke="#ca8a04" strokeWidth="2.5" />
                <circle cx="140" cy="130" r="16" fill="#78350f" />
                <text x="100" y="135" fill="#ffffff" fontSize="14" fontWeight="900">60°</text>
              </g>
            ) : (
              <g>
                <polygon points="110,55 220,55 175,185 65,185" fill="url(#visLatheTiN)" stroke="#ca8a04" strokeWidth="2.5" />
                <circle cx="145" cy="120" r="15" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                <circle cx="145" cy="120" r="8" fill="#1e293b" />
                <path d="M 100,66 Q 145,78 200,66" fill="none" stroke="#b45309" strokeWidth="3.5" />
                <path d="M 80,174 Q 125,162 170,174" fill="none" stroke="#b45309" strokeWidth="3.5" />
                <circle cx="65" cy="185" r="7" fill="#dc2626" opacity="0.85" />
              </g>
            )}

            {/* Pins Hotspot */}
            {tool.pins?.map(pin => {
              const isPinActive = pin.id === activePinId;
              const coords = [
                { x: 530, y: 70 },
                { x: 145, y: 80 },
                { x: 80, y: 185 },
                { x: 50, y: 200 },
                { x: 125, y: 65 }
              ][pin.id - 1] || { x: 200, y: 150 };

              return (
                <g
                  key={pin.id}
                  onClick={() => onPinClick(pin.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={coords.x} cy={coords.y} r={isPinActive ? 15 : 12} fill={isPinActive ? '#2563eb' : '#0f172a'} stroke="#ffffff" strokeWidth="2.5" />
                  <text x={coords.x} y={coords.y + 4} fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">{pin.id}</text>
                </g>
              );
            })}
          </g>
        )}

        {/* MODE 2: SIMULASI PENYAYATAN BUBUT */}
        {mode === 'simulation' && (
          <g>
            <rect width="800" height="320" fill="#0f172a" />
            <rect x="30" y="50" width="70" height="220" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <rect x="85" y="65" width="30" height="35" rx="2" fill="#64748b" stroke="#94a3b8" />
            <rect x="85" y="220" width="30" height="35" rx="2" fill="#64748b" stroke="#94a3b8" />
            <path d="M 50,40 A 25,12 0 0,1 90,40" fill="none" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#visArrowBlue)" />
            <text x="65" y="32" fill="#38bdf8" fontSize="10" fontWeight="800" textAnchor="middle">n = 850 RPM</text>

            {/* Benda Kerja Poros Mentah S45C */}
            <rect x="115" y="85" width="280" height="150" fill="url(#visLatheWorkpiece)" stroke="#475569" strokeWidth="2" />
            <text x="210" y="165" fill="#1e293b" fontSize="13" fontWeight="900">Ø60 mm (BAJA S45C)</text>

            {/* Bagian Sudah Terbubut Halus */}
            <rect x="395" y="100" width="280" height="120" fill="url(#visLatheTurned)" stroke="#38bdf8" strokeWidth="2" />
            <text x="500" y="165" fill="#0369a1" fontSize="12" fontWeight="900">HASIL BUBUT Ø54 mm (Ra 1.6 µm)</text>

            {/* Pahat Sedang Menyayat di Pertemuan Bahu */}
            <rect x="395" y="200" width="160" height="80" rx="3" fill="url(#visLatheShank)" stroke="#0f172a" strokeWidth="2" />
            <polygon points="380,200 415,200 405,240 370,240" fill="url(#visLatheTiN)" stroke="#ca8a04" strokeWidth="2" />
            
            {/* Bram Terlempar Menggulung Emas */}
            <path d="M 390,200 Q 365,160 335,175 Q 315,145 285,165" fill="none" stroke="#fef08a" strokeWidth="4" />
            <path d="M 385,205 Q 360,170 340,195" fill="none" stroke="#f59e0b" strokeWidth="3" />

            {/* Indikator Depth of Cut ap = 3 mm */}
            <line x1="395" y1="85" x2="395" y2="100" stroke="#ef4444" strokeWidth="2.5" />
            <text x="402" y="95" fill="#ef4444" fontSize="10" fontWeight="900">ap = 3 mm</text>

            {/* Panah Gerak Makan Eretan vf */}
            <line x1="560" y1="290" x2="420" y2="290" stroke="#22c55e" strokeWidth="3" markerEnd="url(#visArrowGreen)" />
            <text x="575" y="294" fill="#22c55e" fontSize="11" fontWeight="900">Gerak Makan vf (f = 0.15 mm/put)</text>
          </g>
        )}
      </svg>
    </div>
  );
};

// =============================================================================
// KOMPONEN KARTU VISUAL BENTUK INSERT KARBIDA ISO 1832 (140x95 PX)
// =============================================================================
const CarbideInsertCardVisual = ({ shape, isSelected = false }) => {
  return (
    <svg viewBox="0 0 140 95" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', filter: isSelected ? 'drop-shadow(0 4px 8px rgba(234, 88, 12, 0.35))' : 'none' }}>
      <defs>
        <linearGradient id={`insGold_${shape}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#eab308" />
          <stop offset="80%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
      </defs>

      {/* SHAPE C: RHOMBIC 80° */}
      {shape === 'C' && (
        <g>
          <polygon points="70,10 115,35 70,85 25,60" fill={`url(#insGold_${shape})`} stroke="#854d0e" strokeWidth="1.5" />
          <circle cx="70" cy="47" r="9" fill="#78350f" />
          <circle cx="70" cy="47" r="5" fill="#1e293b" />
          <path d="M 64,18 L 105,40" stroke="#713f12" strokeWidth="1.5" />
          <path d="M 32,58 L 72,80" stroke="#713f12" strokeWidth="1.5" />
          <text x="18" y="60" fill="#dc2626" fontSize="8" fontWeight="900">80°</text>
        </g>
      )}

      {/* SHAPE D: RHOMBIC 55° */}
      {shape === 'D' && (
        <g>
          <polygon points="70,8 112,45 70,87 28,50" fill={`url(#insGold_${shape})`} stroke="#854d0e" strokeWidth="1.5" />
          <circle cx="70" cy="47" r="9" fill="#78350f" />
          <circle cx="70" cy="47" r="5" fill="#1e293b" />
          <path d="M 64,16 L 103,48" stroke="#713f12" strokeWidth="1.5" />
          <path d="M 37,48 L 76,80" stroke="#713f12" strokeWidth="1.5" />
          <text x="20" y="52" fill="#dc2626" fontSize="8" fontWeight="900">55°</text>
        </g>
      )}

      {/* SHAPE S: SQUARE 90° */}
      {shape === 'S' && (
        <g>
          <rect x="40" y="17" width="60" height="60" rx="3" fill={`url(#insGold_${shape})`} stroke="#854d0e" strokeWidth="1.5" />
          <circle cx="70" cy="47" r="9" fill="#78350f" />
          <circle cx="70" cy="47" r="5" fill="#1e293b" />
          <path d="M 45,25 Q 52,32 52,42" fill="none" stroke="#713f12" strokeWidth="1.5" />
          <path d="M 95,25 Q 88,32 88,42" fill="none" stroke="#713f12" strokeWidth="1.5" />
          <text x="32" y="26" fill="#dc2626" fontSize="8" fontWeight="900">90°</text>
        </g>
      )}

      {/* SHAPE T: TRIANGLE 60° */}
      {shape === 'T' && (
        <g>
          <polygon points="70,12 118,80 22,80" fill={`url(#insGold_${shape})`} stroke="#854d0e" strokeWidth="1.5" />
          <circle cx="70" cy="52" r="9" fill="#78350f" />
          <circle cx="70" cy="52" r="5" fill="#1e293b" />
          <path d="M 65,22 L 108,76" stroke="#713f12" strokeWidth="1.5" />
          <path d="M 32,76 L 70,22" stroke="#713f12" strokeWidth="1.5" />
          <text x="65" y="8" fill="#dc2626" fontSize="8" fontWeight="900">60°</text>
        </g>
      )}

      {/* SHAPE W: TRIGON 80° */}
      {shape === 'W' && (
        <g>
          <polygon points="70,12 114,36 100,78 40,78 26,36" fill={`url(#insGold_${shape})`} stroke="#854d0e" strokeWidth="1.5" />
          <circle cx="70" cy="48" r="9" fill="#78350f" />
          <circle cx="70" cy="48" r="5" fill="#1e293b" />
          <text x="65" y="8" fill="#dc2626" fontSize="8" fontWeight="900">80°</text>
          <text x="70" y="90" fill="#7c3aed" fontSize="7" fontWeight="900" textAnchor="middle">6 SISI POTONG</text>
        </g>
      )}

      {/* SHAPE V: RHOMBIC 35° */}
      {shape === 'V' && (
        <g>
          <polygon points="70,8 96,48 70,88 44,48" fill={`url(#insGold_${shape})`} stroke="#854d0e" strokeWidth="1.5" />
          <circle cx="70" cy="48" r="8" fill="#78350f" />
          <circle cx="70" cy="48" r="4.5" fill="#1e293b" />
          <path d="M 65,16 L 90,48" stroke="#713f12" strokeWidth="1.5" />
          <path d="M 50,48 L 75,80" stroke="#713f12" strokeWidth="1.5" />
          <text x="70" y="6" fill="#dc2626" fontSize="8" fontWeight="900" textAnchor="middle">35°</text>
        </g>
      )}

      {/* SHAPE R: ROUND BULAT */}
      {shape === 'R' && (
        <g>
          <circle cx="70" cy="47" r="33" fill={`url(#insGold_${shape})`} stroke="#854d0e" strokeWidth="1.5" />
          <circle cx="70" cy="47" r="9" fill="#78350f" />
          <circle cx="70" cy="47" r="5" fill="#1e293b" />
          <circle cx="70" cy="47" r="23" fill="none" stroke="#713f12" strokeWidth="1.5" strokeDasharray="6 3" />
          <text x="70" y="90" fill="#0284c7" fontSize="7.5" fontWeight="900" textAnchor="middle">RADIUS PENUH</text>
        </g>
      )}
    </svg>
  );
};

// =============================================================================
// KOMPONEN VISUAL 4 SUDUT GEOMETRI KRITIS (760x220 PX)
// =============================================================================
const CarbideGeometryVisual = ({ activeAngleId = 'rake', onSelectAngle = () => {} }) => {
  return (
    <div style={{ background: '#0f172a', borderRadius: '12px', border: '1.5px solid #334155', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'rake', label: '1. Sudut Tatal (Rake Angle γ)', color: '#38bdf8' },
          { id: 'clearance', label: '2. Sudut Bebas (Clearance Angle α)', color: '#4ade80' },
          { id: 'nose', label: '3. Radius Hidung (Nose Radius rε)', color: '#fb923c' },
          { id: 'lead', label: '4. Sudut Masuk (Lead Angle κr)', color: '#c084fc' }
        ].map(ang => (
          <button
            key={ang.id}
            onClick={() => onSelectAngle(ang.id)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: activeAngleId === ang.id ? `2px solid ${ang.color}` : '1px solid #334155',
              background: activeAngleId === ang.id ? `${ang.color}25` : 'transparent',
              color: activeAngleId === ang.id ? ang.color : '#94a3b8',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            {ang.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 760 180" style={{ width: '100%', height: 'auto', display: 'block' }}>
        {activeAngleId === 'rake' && (
          <g>
            <rect width="760" height="180" fill="#1e293b" rx="8" />
            <g transform="translate(40, 20)">
              <text x="140" y="20" fill="#38bdf8" fontSize="13" fontWeight="900" textAnchor="middle">SUDUT TATAL POSITIF (+10°)</text>
              <rect x="20" y="40" width="100" height="90" fill="#475569" stroke="#64748b" />
              <polygon points="120,40 240,40 240,130 140,130 120,60" fill="#ca8a04" stroke="#fef08a" strokeWidth="2" />
              <line x1="120" y1="25" x2="120" y2="70" stroke="#94a3b8" strokeDasharray="3 3" />
              <path d="M 120,40 Q 130,45 140,40" fill="none" stroke="#ef4444" strokeWidth="2" />
              <text x="145" y="35" fill="#ef4444" fontSize="10" fontWeight="900">+γ</text>
              <path d="M 115,40 Q 135,20 160,35 Q 180,50 165,70" fill="none" stroke="#fde047" strokeWidth="3" />
              <text x="140" y="150" fill="#94a3b8" fontSize="10" textAnchor="middle">Gaya potong ringan, tajam, cocok utk aluminium & baja ulet</text>
            </g>

            <g transform="translate(420, 20)">
              <text x="140" y="20" fill="#f87171" fontSize="13" fontWeight="900" textAnchor="middle">SUDUT TATAL NEGATIF (-6°)</text>
              <rect x="20" y="40" width="100" height="90" fill="#475569" stroke="#64748b" />
              <polygon points="120,40 240,40 240,130 130,130 110,40" fill="#ca8a04" stroke="#fef08a" strokeWidth="2" />
              <line x1="120" y1="25" x2="120" y2="70" stroke="#94a3b8" strokeDasharray="3 3" />
              <path d="M 120,38 Q 115,35 110,40" fill="none" stroke="#ef4444" strokeWidth="2" />
              <text x="100" y="32" fill="#ef4444" fontSize="10" fontWeight="900">-γ</text>
              <text x="140" y="150" fill="#94a3b8" fontSize="10" textAnchor="middle">Mata potong sangat kokoh, tahan beban kejut & pengasaran berat</text>
            </g>
          </g>
        )}

        {activeAngleId === 'clearance' && (
          <g>
            <rect width="760" height="180" fill="#1e293b" rx="8" />
            <text x="380" y="30" fill="#4ade80" fontSize="14" fontWeight="900" textAnchor="middle">SUDUT BEBAS (CLEARANCE ANGLE α = 7°)</text>
            <circle cx="260" cy="90" r="60" fill="#475569" stroke="#64748b" strokeWidth="2" />
            <text x="260" y="95" fill="#cbd5e1" fontSize="11" fontWeight="800" textAnchor="middle">Benda Kerja</text>
            <polygon points="320,90 480,90 480,150 340,150 325,100" fill="#ca8a04" stroke="#fef08a" strokeWidth="2" />
            <line x1="320" y1="90" x2="320" y2="160" stroke="#94a3b8" strokeDasharray="3 3" />
            <path d="M 320,130 Q 328,130 335,140" fill="none" stroke="#4ade80" strokeWidth="2.5" />
            <text x="345" y="135" fill="#4ade80" fontSize="12" fontWeight="900">α = 7°</text>
            <text x="380" y="168" fill="#94a3b8" fontSize="11" textAnchor="middle">
              Mencegah bidang bebas (flank) menggesek permukaan benda kerja yang telah terpotong halus.
            </text>
          </g>
        )}

        {activeAngleId === 'nose' && (
          <g>
            <rect width="760" height="180" fill="#1e293b" rx="8" />
            <text x="380" y="25" fill="#fb923c" fontSize="13" fontWeight="900" textAnchor="middle">PENGARUH RADIUS HIDUNG (rε) TERHADAP KEHALUSAN PERMUKAAN (Ra)</text>
            <g transform="translate(60, 45)">
              <text x="80" y="20" fill="#94a3b8" fontSize="11" fontWeight="900" textAnchor="middle">rε = 0.4 mm</text>
              <path d="M 40,70 Q 80,45 120,70" fill="none" stroke="#ef4444" strokeWidth="3" />
              <text x="80" y="95" fill="#ef4444" fontSize="10" textAnchor="middle">Gaya radial kecil (Anti-chatter)</text>
            </g>
            <g transform="translate(290, 45)">
              <text x="80" y="20" fill="#22c55e" fontSize="11" fontWeight="900" textAnchor="middle">rε = 0.8 mm (Standar)</text>
              <path d="M 30,70 Q 80,35 130,70" fill="none" stroke="#22c55e" strokeWidth="4" />
              <text x="80" y="95" fill="#22c55e" fontSize="10" textAnchor="middle">Kekuatan &amp; kehalusan optimal</text>
            </g>
            <g transform="translate(520, 45)">
              <text x="80" y="20" fill="#38bdf8" fontSize="11" fontWeight="900" textAnchor="middle">rε = 1.2 mm</text>
              <path d="M 20,70 Q 80,25 140,70" fill="none" stroke="#38bdf8" strokeWidth="5" />
              <text x="80" y="95" fill="#38bdf8" fontSize="10" textAnchor="middle">Sangat halus Ra &amp; tahan benturan</text>
            </g>
            <text x="380" y="165" fill="#fde047" fontSize="11" fontWeight="800" textAnchor="middle">
              Rumus Hubungan: Ra ≈ (f² / 32·rε) × 1000 µm • Semakin besar rε, permukaan semakin halus!
            </text>
          </g>
        )}

        {activeAngleId === 'lead' && (
          <g>
            <rect width="760" height="180" fill="#1e293b" rx="8" />
            <text x="380" y="25" fill="#c084fc" fontSize="13" fontWeight="900" textAnchor="middle">SUDUT MASUK (LEAD ANGLE κr): 90° VS 45° CHIP THINNING</text>
            <g transform="translate(80, 45)">
              <text x="120" y="20" fill="#38bdf8" fontSize="12" fontWeight="900" textAnchor="middle">κr = 90° (Bahu Siku Tegak)</text>
              <rect x="40" y="35" width="160" height="60" fill="#475569" stroke="#64748b" />
              <polygon points="120,35 180,35 180,95 120,95" fill="#ca8a04" stroke="#fef08a" strokeWidth="2" />
              <text x="120" y="115" fill="#94a3b8" fontSize="10" textAnchor="middle">Gaya potong murni radial, tatal tebal h = fz</text>
            </g>
            <g transform="translate(440, 45)">
              <text x="120" y="20" fill="#c084fc" fontSize="12" fontWeight="900" textAnchor="middle">κr = 45° (Chip Thinning Effect)</text>
              <rect x="40" y="35" width="160" height="60" fill="#475569" stroke="#64748b" />
              <polygon points="100,35 180,35 180,95 140,95" fill="#ca8a04" stroke="#fef08a" strokeWidth="2" />
              <text x="120" y="115" fill="#c084fc" fontSize="10" textAnchor="middle">Tatal menipis h = 0.7×fz → Feed rate naik 40%!</text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

// =============================================================================
// KOMPONEN KARTU VISUAL MATA BOR, TAP, DAN SNEI (200x110 PX)
// =============================================================================
const HoleThreadCardVisual = ({ toolId, isSelected = false }) => {
  return (
    <svg viewBox="0 0 200 110" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', filter: isSelected ? 'drop-shadow(0 4px 8px rgba(22, 163, 74, 0.3))' : 'none' }}>
      <defs>
        <linearGradient id={`holeSteel_${toolId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* 1. MATA BOR SPIRAL (TWIST DRILL) */}
      {toolId === 'twist-drill' && (
        <g>
          <rect x="25" y="44" width="60" height="22" rx="2" fill={`url(#holeSteel_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <text x="55" y="58" fill="#475569" fontSize="7" fontWeight="900" textAnchor="middle">DIN 338</text>
          <rect x="85" y="44" width="75" height="22" fill="#334155" stroke="#1e293b" strokeWidth="1.2" />
          <path d="M 85,48 Q 105,62 125,48 Q 145,34 160,48" stroke="#38bdf8" strokeWidth="3" fill="none" />
          <path d="M 85,58 Q 105,72 125,58 Q 145,44 160,58" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
          <polygon points="160,44 182,55 160,66" fill={`url(#holeSteel_${toolId})`} stroke="#0284c7" strokeWidth="1.5" />
          <line x1="160" y1="55" x2="182" y2="55" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 1" />
          <text x="175" y="40" fill="#0284c7" fontSize="8" fontWeight="900">118°</text>
          <text x="100" y="102" fill="#0284c7" fontSize="9" fontWeight="900" textAnchor="middle">MATA BOR SPIRAL 118° (DIN 338)</text>
        </g>
      )}

      {/* 2. BOR SENTER 60° (CENTER DRILL) */}
      {toolId === 'center-drill' && (
        <g>
          <rect x="40" y="38" width="75" height="34" rx="2" fill={`url(#holeSteel_${toolId})`} stroke="#334155" strokeWidth="1.2" />
          <text x="77" y="58" fill="#475569" fontSize="7.5" fontWeight="900" textAnchor="middle">DIN 333 A</text>
          <polygon points="115,38 140,49 140,61 115,72" fill="#475569" stroke="#334155" strokeWidth="1.2" />
          <rect x="140" y="51" width="24" height="8" fill="#334155" stroke="#1e293b" strokeWidth="1" />
          <polygon points="164,51 172,55 164,59" fill="#cbd5e1" />
          <text x="130" y="34" fill="#f59e0b" fontSize="8" fontWeight="900">60°</text>
          <text x="100" y="102" fill="#d97706" fontSize="9" fontWeight="900" textAnchor="middle">BOR SENTER 60° (DIN 333 TIPE A)</text>
        </g>
      )}

      {/* 3. SET HAND TAP (3 BUAH) */}
      {toolId === 'hand-tap-set' && (
        <g>
          <g transform="translate(25, 14)">
            <rect x="0" y="24" width="30" height="12" fill={`url(#holeSteel_${toolId})`} stroke="#334155" />
            <rect x="0" y="24" width="6" height="12" fill="#1e293b" />
            <rect x="12" y="24" width="3" height="12" fill="#ef4444" />
            <rect x="30" y="24" width="38" height="12" fill="#334155" stroke="#1e293b" />
            <polygon points="68,24 78,28 78,32 68,36" fill="#cbd5e1" />
            <text x="95" y="33" fill="#ef4444" fontSize="8" fontWeight="900">No. 1 Taper (1 Ring)</text>
          </g>
          <g transform="translate(25, 36)">
            <rect x="0" y="24" width="30" height="12" fill={`url(#holeSteel_${toolId})`} stroke="#334155" />
            <rect x="0" y="24" width="6" height="12" fill="#1e293b" />
            <rect x="10" y="24" width="2.5" height="12" fill="#f59e0b" />
            <rect x="15" y="24" width="2.5" height="12" fill="#f59e0b" />
            <rect x="30" y="24" width="42" height="12" fill="#334155" stroke="#1e293b" />
            <polygon points="72,24 78,27 78,33 72,36" fill="#cbd5e1" />
            <text x="95" y="33" fill="#f59e0b" fontSize="8" fontWeight="900">No. 2 Plug (2 Ring)</text>
          </g>
          <g transform="translate(25, 58)">
            <rect x="0" y="24" width="30" height="12" fill={`url(#holeSteel_${toolId})`} stroke="#334155" />
            <rect x="0" y="24" width="6" height="12" fill="#1e293b" />
            <rect x="30" y="24" width="46" height="12" fill="#334155" stroke="#1e293b" />
            <line x1="76" y1="24" x2="76" y2="36" stroke="#22c55e" strokeWidth="2" />
            <text x="95" y="33" fill="#22c55e" fontSize="8" fontWeight="900">No. 3 Bottoming (Finis)</text>
          </g>
          <text x="100" y="103" fill="#16a34a" fontSize="9" fontWeight="900" textAnchor="middle">SET 3 HAND TAP MANUAL (DIN 352)</text>
        </g>
      )}

      {/* 4. SNEI BULAT TERBELAH (ROUND DIE) */}
      {toolId === 'snei-dies' && (
        <g>
          <circle cx="100" cy="48" r="35" fill="#334155" stroke="#64748b" strokeWidth="2" />
          <circle cx="100" cy="48" r="28" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <circle cx="85" cy="36" r="6" fill="#0f172a" />
          <circle cx="115" cy="36" r="6" fill="#0f172a" />
          <circle cx="85" cy="60" r="6" fill="#0f172a" />
          <circle cx="115" cy="60" r="6" fill="#0f172a" />
          <circle cx="100" cy="48" r="14" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" strokeDasharray="3 2" />
          <text x="100" y="52" fill="#ca8a04" fontSize="8" fontWeight="900" textAnchor="middle">M10</text>
          <rect x="98.5" y="13" width="3" height="10" fill="#0f172a" />
          <text x="100" y="102" fill="#0284c7" fontSize="9" fontWeight="900" textAnchor="middle">SNEI BULAT TERBELAH (DIN 22568)</text>
        </g>
      )}
    </svg>
  );
};

// =============================================================================
// KOMPONEN BESAR MASTER MATA BOR, TAP, DAN SNEI (800x300 PX)
// =============================================================================
const HoleThreadMasterVisual = ({ tool, mode = 'anatomy', activePinId = 1, onPinClick = () => {} }) => {
  return (
    <div style={{ position: 'relative', width: '100%', background: mode === 'simulation' ? '#0f172a' : '#f8fafc', borderRadius: '12px', border: '1.5px solid #cbd5e1', overflow: 'hidden' }}>
      <svg viewBox="0 0 800 300" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '340px' }}>
        <defs>
          <linearGradient id="visHoleSteel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        {mode === 'anatomy' && (
          <g>
            <rect width="800" height="300" fill="#f8fafc" />
            {tool.id === 'twist-drill' && (
              <g>
                <rect x="80" y="110" width="220" height="80" rx="4" fill="url(#visHoleSteel)" stroke="#334155" strokeWidth="2" />
                <text x="190" y="155" fill="#475569" fontSize="13" fontWeight="900" textAnchor="middle">TANGKAI SILINDRIS (SHANK DIN 338)</text>
                <rect x="300" y="110" width="300" height="80" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                <path d="M 300,120 Q 360,165 420,120 Q 480,75 540,120 Q 600,165 600,120" stroke="#38bdf8" strokeWidth="8" fill="none" />
                <path d="M 300,160 Q 360,205 420,160 Q 480,115 540,160 Q 600,205 600,160" stroke="#94a3b8" strokeWidth="6" fill="none" />
                <polygon points="600,110 680,150 600,190" fill="url(#visHoleSteel)" stroke="#0284c7" strokeWidth="2.5" />
                <line x1="680" y1="145" x2="680" y2="155" stroke="#ef4444" strokeWidth="4" />
                <text x="690" y="135" fill="#ef4444" fontSize="11" fontWeight="900">Chisel Edge</text>
                <text x="645" y="95" fill="#0284c7" fontSize="14" fontWeight="900">118° Point Angle</text>
              </g>
            )}

            {tool.id === 'center-drill' && (
              <g>
                <rect x="150" y="90" width="300" height="120" rx="6" fill="url(#visHoleSteel)" stroke="#334155" strokeWidth="2" />
                <text x="300" y="155" fill="#475569" fontSize="14" fontWeight="900" textAnchor="middle">BADAN TEBAL KAKU (DIN 333 TIPE A)</text>
                <polygon points="450,90 540,130 540,170 450,210" fill="#475569" stroke="#334155" strokeWidth="2" />
                <rect x="540" y="135" width="80" height="30" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                <polygon points="620,135 645,150 620,165" fill="#cbd5e1" stroke="#334155" />
                <text x="500" y="80" fill="#f59e0b" fontSize="14" fontWeight="900">60° Kerucut Senter</text>
              </g>
            )}

            {tool.id === 'hand-tap-set' && (
              <g>
                <text x="400" y="45" fill="#16a34a" fontSize="14" fontWeight="900" textAnchor="middle">PERBANDINGAN PANJANG KETIRUSAN 3 SET HAND TAP (DIN 352)</text>
                <g transform="translate(100, 60)">
                  <rect x="0" y="15" width="120" height="25" fill="url(#visHoleSteel)" />
                  <rect x="25" y="15" width="6" height="25" fill="#ef4444" />
                  <rect x="120" y="15" width="360" height="25" fill="#334155" />
                  <polygon points="430,15 480,22 480,33 430,40" fill="#94a3b8" />
                  <text x="500" y="32" fill="#ef4444" fontSize="11" fontWeight="900">No. 1 Taper: Tirus 8-10 ulir (4°)</text>
                </g>
                <g transform="translate(100, 120)">
                  <rect x="0" y="15" width="120" height="25" fill="url(#visHoleSteel)" />
                  <rect x="20" y="15" width="5" height="25" fill="#f59e0b" />
                  <rect x="30" y="15" width="5" height="25" fill="#f59e0b" />
                  <rect x="120" y="15" width="360" height="25" fill="#334155" />
                  <polygon points="455,15 480,20 480,35 455,40" fill="#94a3b8" />
                  <text x="500" y="32" fill="#f59e0b" fontSize="11" fontWeight="900">No. 2 Plug: Tirus 4-5 ulir (10°)</text>
                </g>
                <g transform="translate(100, 180)">
                  <rect x="0" y="15" width="120" height="25" fill="url(#visHoleSteel)" />
                  <rect x="120" y="15" width="360" height="25" fill="#334155" />
                  <polygon points="472,15 480,18 480,37 472,40" fill="#94a3b8" />
                  <text x="500" y="32" fill="#22c55e" fontSize="11" fontWeight="900">No. 3 Bottoming: Tirus 1.5 ulir (Finishing)</text>
                </g>
              </g>
            )}

            {tool.id === 'snei-dies' && (
              <g>
                <circle cx="400" cy="150" r="105" fill="#334155" stroke="#64748b" strokeWidth="4" />
                <circle cx="400" cy="150" r="85" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <circle cx="360" cy="115" r="18" fill="#0f172a" />
                <circle cx="440" cy="115" r="18" fill="#0f172a" />
                <circle cx="360" cy="185" r="18" fill="#0f172a" />
                <circle cx="440" cy="185" r="18" fill="#0f172a" />
                <circle cx="400" cy="150" r="42" fill="#0f172a" stroke="#ca8a04" strokeWidth="3" strokeDasharray="5 3" />
                <text x="400" y="156" fill="#ca8a04" fontSize="18" fontWeight="900" textAnchor="middle">M12 × 1.75</text>
                <rect x="396" y="45" width="8" height="28" fill="#0f172a" />
                <text x="530" y="60" fill="#38bdf8" fontSize="11" fontWeight="800">Celah Belah Penyetel Ukuran</text>
              </g>
            )}
          </g>
        )}

        {mode === 'simulation' && (
          <g>
            <rect width="800" height="300" fill="#0f172a" />
            <text x="400" y="35" fill="#22c55e" fontSize="14" fontWeight="900" textAnchor="middle">
              SIMULASI PEMESINAN PENGEBORAN &amp; PEMBUATAN ULIR
            </text>
            <rect x="180" y="80" width="440" height="170" rx="4" fill="#334155" stroke="#475569" strokeWidth="2" />
            <text x="400" y="235" fill="#94a3b8" fontSize="12" fontWeight="800" textAnchor="middle">BENDA KERJA BAJA ST37</text>

            {tool.id === 'twist-drill' ? (
              <g>
                <rect x="360" y="80" width="80" height="90" fill="#0f172a" />
                <rect x="370" y="30" width="60" height="90" fill="url(#visHoleSteel)" stroke="#38bdf8" />
                <polygon points="370,120 400,140 430,120" fill="#0284c7" />
                <path d="M 360,110 Q 330,80 345,50" fill="none" stroke="#fde047" strokeWidth="4" />
                <path d="M 440,110 Q 470,80 455,50" fill="none" stroke="#fde047" strokeWidth="4" />
                <text x="400" y="25" fill="#38bdf8" fontSize="11" fontWeight="800" textAnchor="middle">Bor Berputar n RPM &amp; Gerak Makan Turun ↓</text>
              </g>
            ) : (
              <g>
                <rect x="365" y="80" width="70" height="110" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" strokeDasharray="6 3" />
                <text x="400" y="140" fill="#ca8a04" fontSize="12" fontWeight="900" textAnchor="middle">Ulir Metrik 60°</text>
                <text x="400" y="270" fill="#22c55e" fontSize="11" fontWeight="800" textAnchor="middle">Kaidah Tap: Putar 1/2 putaran CW sayat, putar balik 1/4 CCW patahkan geram!</text>
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

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
    fotoReal: '/assets/images/machine_cutting_tools/mata_bor.jpg',
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
    id: 'center-drill',
    name: 'Mata Bor Senter (Center Drill DIN 333 Tipe A 60°)',
    icon: '📍',
    fotoReal: '/assets/images/machine_cutting_tools/bor_senter.jpg',
    standar: 'DIN 333 Tipe A (Sudut 60°)',
    sudutPuncak: 'Sudut Kerucut 60° dengan Bor Perintis Kecil',
    anatomi: [
      { bagian: 'Tangkai Tebal Silindris (Heavy Body)', fungsi: 'Diameter badan besar yang sangat kaku, mencegah bor melengkung atau meliuk saat start pengeboran awal.' },
      { bagian: 'Ujung Bor Perintis (Pilot Drill)', fungsi: 'Ujung silinder kecil bertingkat yang membuat lubang awal pembebas tatal.' },
      { bagian: 'Tirus Kerucut 60° (Countersink Chamfer)', fungsi: 'Membentuk dudukan kerucut 60° yang presisi untuk senter putar (revolving center) kepala lepas mesin bubut.' },
      { bagian: 'Muka Potong Ganda (Double Ended)', fungsi: 'Memiliki dua ujung mata potong bolak-balik; bila salah satu tumpul, bor dapat dibalik.' }
    ],
    tipsPraktik: 'Kedalaman pengeboran bor senter hanya boleh sampai 2/3 dari tinggi tirus 60°. Jangan terlalu dalam karena leher bor senter rentan patah bila tertekan berlebih!'
  },
  {
    id: 'hand-tap-set',
    name: 'Set Hand Tap Manual (3 Buah Pembuat Ulir Dalam ISO)',
    icon: '🧵',
    fotoReal: '/assets/images/machine_cutting_tools/tap_t_wrench.jpg',
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
    fotoReal: '/assets/images/machine_cutting_tools/snei_die.jpg',
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
// KOMPONEN VISUAL KARTU UNIVERSAL (SPLIT / CAD / REAL PHOTO DUAL-VIEW)
// =============================================================================
const UniversalToolCardVisual = React.memo(({
  type = 'milling', // 'milling' | 'lathe' | 'insert' | 'hole'
  tool,
  isSelected = false,
  cardViewMode = 'split',
  onToggle = () => {}
}) => {
  const isSplit = cardViewMode === 'split';
  const isCad = cardViewMode === 'cad';
  const isPhoto = cardViewMode === 'photo';

  return (
    <div style={{
      width: '100%',
      height: '130px',
      background: '#090d16',
      borderBottom: `2px solid ${isSelected ? (tool.color || '#0284c7') : '#1e293b'}`,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      {isSplit && (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          {/* Sisi Kiri: Profil Geometri CAD */}
          <div style={{
            flex: '1 1 50%',
            height: '100%',
            position: 'relative',
            padding: '2px',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)'
          }}>
            <span style={{
              position: 'absolute', top: '4px', left: '6px',
              fontSize: '0.55rem', fontWeight: 900, color: '#38bdf8',
              background: 'rgba(2, 132, 199, 0.25)', padding: '1px 5px',
              borderRadius: '3px', letterSpacing: '0.5px', zIndex: 2
            }}>
              📐 CAD
            </span>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {type === 'milling' && <MillingCutterCardVisual toolId={tool.id} isSelected={isSelected} />}
              {type === 'lathe' && <LatheToolCardVisual toolId={tool.id} isSelected={isSelected} />}
              {type === 'insert' && <CarbideInsertCardVisual shape={tool.shape} isSelected={isSelected} />}
              {type === 'hole' && <HoleThreadCardVisual toolId={tool.id} isSelected={isSelected} />}
            </div>
          </div>

          {/* Sisi Kanan: Foto Asli Workshop */}
          <div style={{
            flex: '1 1 50%',
            height: '100%',
            position: 'relative',
            background: type === 'milling' ? '#ffffff' : '#020617',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <span style={{
              position: 'absolute', top: '4px', right: '6px',
              fontSize: '0.55rem', fontWeight: 900, color: type === 'milling' ? '#15803d' : '#4ade80',
              background: type === 'milling' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.25)', padding: '1px 5px',
              borderRadius: '3px', letterSpacing: '0.5px', zIndex: 2
            }}>
              📷 FOTO ASLI
            </span>
            <img
              src={tool.fotoReal}
              alt={tool.name}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '4px',
                display: 'block',
                filter: isSelected ? 'brightness(1.05) saturate(1.1)' : 'brightness(1)'
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      )}

      {isCad && (
        <div style={{ width: '100%', height: '100%', padding: '4px', position: 'relative' }}>
          <span style={{
            position: 'absolute', top: '6px', left: '8px',
            fontSize: '0.58rem', fontWeight: 900, color: '#38bdf8',
            background: 'rgba(2, 132, 199, 0.25)', padding: '2px 6px',
            borderRadius: '4px', zIndex: 2
          }}>
            📐 BENTUK GEOMETRI CAD
          </span>
          {type === 'milling' && <MillingCutterCardVisual toolId={tool.id} isSelected={isSelected} />}
          {type === 'lathe' && <LatheToolCardVisual toolId={tool.id} isSelected={isSelected} />}
          {type === 'insert' && <CarbideInsertCardVisual shape={tool.shape} isSelected={isSelected} />}
          {type === 'hole' && <HoleThreadCardVisual toolId={tool.id} isSelected={isSelected} />}
        </div>
      )}

      {isPhoto && (
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: type === 'milling' ? '#ffffff' : '#090d16'
        }}>
          <span style={{
            position: 'absolute', top: '6px', left: '8px',
            fontSize: '0.58rem', fontWeight: 900, color: type === 'milling' ? '#15803d' : '#4ade80',
            background: type === 'milling' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.25)', padding: '2px 6px',
            borderRadius: '4px', zIndex: 2
          }}>
            📷 FOTO ASLI BENGKEL
          </span>
          <img
            src={tool.fotoReal}
            alt={tool.name}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '6px',
              display: 'block',
              filter: isSelected ? 'brightness(1.05) saturate(1.1)' : 'brightness(1)'
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Tombol Mini Switcher Mode Kartu */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        title="Klik untuk ganti mode visual kartu ini (Split 🔀 -> CAD 📐 -> Foto 📷)"
        style={{
          position: 'absolute',
          bottom: '5px',
          right: '6px',
          padding: '2px 7px',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(15, 23, 42, 0.88)',
          color: '#ffffff',
          fontSize: '0.62rem',
          fontWeight: 800,
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          zIndex: 6,
          transition: 'all 0.15s'
        }}
      >
        {isSplit ? '🔀 Split' : isCad ? '📐 CAD' : '📷 Foto'}
      </button>
    </div>
  );
});

// =============================================================================
// KOMPONEN INSPEKSI FOTO ASLI BENGKEL & ANALISIS GEOMETRI FISIK
// =============================================================================
const RealPhotoShowcase = React.memo(({ tool, category = 'milling' }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
      borderRadius: '14px',
      border: '1.5px solid #334155',
      padding: '20px',
      color: '#ffffff',
      display: 'grid',
      gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(280px, 1fr)',
      gap: '24px',
      alignItems: 'center'
    }}>
      {/* Frame Foto Asli Nyata */}
      <div style={{
        background: category === 'milling' ? '#ffffff' : '#020617',
        borderRadius: '12px',
        border: '2px solid rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        height: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: category === 'milling' ? 'inset 0 0 10px rgba(0,0,0,0.06)' : 'inset 0 0 20px rgba(0,0,0,0.8)'
      }}>
        <img
          src={tool.fotoReal}
          alt={tool.name}
          loading="lazy"
          decoding="async"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            padding: '12px',
            display: 'block',
            filter: 'brightness(1.05) contrast(1.05)'
          }}
        />
        <div style={{
          position: 'absolute', bottom: '10px', left: '12px',
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
          padding: '4px 10px', borderRadius: '6px',
          fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.3)'
        }}>
          📷 Foto Dokumentasi Asli Mesin Perkakas
        </div>
      </div>

      {/* Panel Analisis Visual & Spesifikasi Fisik */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {tool.category || tool.tipe || tool.standar || 'Spesifikasi Fisik'}
          </div>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
            {tool.name}
          </h4>
          {tool.englishName && (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
              {tool.englishName}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>STANDAR / ISO</div>
            <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 800, marginTop: '2px' }}>
              {tool.isoStandard || tool.isoDIN || tool.standar || 'Standar DIN/ISO'}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>SUDUT / GEOMETRI</div>
            <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 800, marginTop: '2px' }}>
              {tool.leadAngle || tool.sudutHidung || tool.sudutPuncak || 'Geometri Potong'}
            </div>
          </div>

          {tool.materialBadan && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>MATERIAL BADAN</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginTop: '2px' }}>
                {tool.materialBadan}
              </div>
            </div>
          )}

          {tool.pelapis && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>LAPISAN COATING</div>
              <div style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700, marginTop: '2px' }}>
                {tool.pelapis}
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#4ade80', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span> Panduan Identifikasi Visual di Bengkel Mesin:
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 }}>
            {tool.tipsTeknis || tool.keunggulan || tool.tipsPraktik || tool.deskripsi}
          </p>
        </div>
      </div>
    </div>
  );
});

// =============================================================================
// KOMPONEN UTAMA: MachineCuttingToolsLab
// =============================================================================
const MachineCuttingToolsLab = ({ addXP = () => {}, onNavigateToLathe, onNavigateToMilling, initialTab = 'milling' }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'milling'); // 'milling', 'pahat', 'insert', 'hole-thread', 'kalkulator', 'quiz'
  const [selectedIsoCat, setSelectedIsoCat] = useState('P');
  const [selectedMillingId, setSelectedMillingId] = useState('facemill');
  const [showMillingRefModal, setShowMillingRefModal] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [millingMode, setMillingMode] = useState('anatomy'); // 'anatomy' | 'simulation' | 'profile' | 'realPhoto'
  const [activeMillingPinId, setActiveMillingPinId] = useState(1);
  const [activeInsertPos, setActiveInsertPos] = useState(1);
  const [activeHoleToolId, setActiveHoleToolId] = useState('twist-drill');

  // State Pahat Bubut Showcase
  const [selectedLatheId, setSelectedLatheId] = useState('pahat-rata-kanan');
  const [latheMode, setLatheMode] = useState('anatomy'); // 'anatomy' | 'simulation' | 'realPhoto'
  const [activeLathePinId, setActiveLathePinId] = useState(1);

  // State Insert Karbida Visual
  const [selectedInsertShape, setSelectedInsertShape] = useState('C');
  const [activeAngleId, setActiveAngleId] = useState('rake');

  // State Hole & Thread Visual Showcase
  const [holeViewMode, setHoleViewMode] = useState('anatomy'); // 'anatomy' | 'simulation' | 'realPhoto'

  // State Mode Tampilan Kartu Visual ('split' | 'cad' | 'photo')
  const [millingCardView, setMillingCardView] = useState('split');
  const [latheCardView, setLatheCardView] = useState('split');
  const [insertCardView, setInsertCardView] = useState('split');
  const [holeCardView, setHoleCardView] = useState('split');
  const [cardOverrides, setCardOverrides] = useState({});

  const toggleCardOverride = (id) => {
    sound.playClick();
    setCardOverrides(prev => {
      const current = prev[id] || 'split';
      const next = current === 'split' ? 'cad' : current === 'cad' ? 'photo' : 'split';
      return { ...prev, [id]: next };
    });
  };

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
          { id: 'milling', label: '1. Pisau Frais / Milling (8 Jenis Real)', icon: '🌀', color: '#0284c7' },
          { id: 'pahat', label: '2. Pahat Bubut (HSS & Karbida)', icon: '🪓', color: '#2563eb' },
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
          
          {/* KATALOG 6 JENIS PAHAT BUBUT (LATHE CUTTING TOOLS) */}
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #1e3a8a, #172554)', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: '#38bdf8', color: '#082f49', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                KATALOG 6 PAHAT BUBUT MESIN (LATHE TOOLS)
              </span>
              <span style={{ background: 'rgba(255,255,255,0.18)', color: '#e0f2fe', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                ILUSTRASI TEKNIK REAL-TIME &amp; SIMULASI PENYAYATAN
              </span>
            </div>
            <h2 style={{ margin: '8px 0 6px 0', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
              🪓 Jenis-Jenis Pahat Bubut (Lathe Tools) Standar ISO &amp; DIN
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#e0f2fe', lineHeight: 1.5, maxWidth: '850px' }}>
              Pekerjaan membubut menggunakan alat potong bermata tunggal (single-point tool) untuk membentuk silinder luar, bidang muka, alur, ulir baut, hingga lubang tembus dalam. Pilih jenis pahat di bawah ini untuk melihat ilustrasi CAD nyata, arah sayat, dan simulasi pemesinannya.
            </p>
          </div>

          {/* Toolbar Pengendali Tampilan Visual Kartu Pahat Bubut */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0f172a' }}>
                👁️ Mode Tampilan Kartu Pahat Bubut:
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                (Pilih tampilan bentuk profil CAD, foto workshop asli, atau keduanya)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button
                onClick={() => { sound.playClick(); setLatheCardView('split'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: latheCardView === 'split' ? '#2563eb' : 'transparent',
                  color: latheCardView === 'split' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                🔀 Split (CAD + Foto)
              </button>
              <button
                onClick={() => { sound.playClick(); setLatheCardView('cad'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: latheCardView === 'cad' ? '#2563eb' : 'transparent',
                  color: latheCardView === 'cad' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                📐 Bentuk CAD / Profil
              </button>
              <button
                onClick={() => { sound.playClick(); setLatheCardView('photo'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: latheCardView === 'photo' ? '#2563eb' : 'transparent',
                  color: latheCardView === 'photo' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                📷 Foto Asli Bengkel
              </button>
            </div>
          </div>

          {/* Quick Selector Grid 6 Jenis Pahat Bubut dengan Ilustrasi Kontur Nyata */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {LATHE_TOOLS_CATALOG.map(tool => {
              const isSelected = selectedLatheId === tool.id;
              const cardMode = cardOverrides[tool.id] || latheCardView;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedLatheId(tool.id);
                    setActiveLathePinId(1);
                  }}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: isSelected ? `2.5px solid ${tool.color}` : '1.5px solid #cbd5e1',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isSelected ? `0 8px 20px ${tool.color}35` : '0 2px 6px rgba(0,0,0,0.04)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Visual Kartu Universal (Split / CAD / Foto Real) */}
                  <UniversalToolCardVisual
                    type="lathe"
                    tool={tool}
                    isSelected={isSelected}
                    cardViewMode={cardMode}
                    onToggle={() => toggleCardOverride(tool.id)}
                  />

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: tool.color, textTransform: 'uppercase' }}>
                          {tool.isoDIN}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, background: `${tool.color}15`, color: tool.color, padding: '2px 6px', borderRadius: '4px' }}>
                          {tool.leadAngle}
                        </span>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '0.96rem', color: '#0f172a' }}>
                        {tool.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', marginTop: '1px' }}>
                        {tool.englishName}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {tool.deskripsi}
                    </div>

                    <div style={{ paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>
                        📍 {tool.arahSayat.split('(')[0]}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: tool.color }}>
                        {isSelected ? '✓ Sedang Dipilih' : 'Lihat Detail →'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master Showcase Pahat Bubut Terpilih */}
          {(() => {
            const current = LATHE_TOOLS_CATALOG.find(t => t.id === selectedLatheId) || LATHE_TOOLS_CATALOG[0];
            const activePin = current.pins?.find(p => p.id === activeLathePinId) || current.pins?.[0];

            return (
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', borderTop: `5px solid ${current.color}` }}>
                
                {/* Header Kontrol Mode Visual */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '10px',
                      overflow: 'hidden', border: `2px solid ${current.color}`, flexShrink: 0,
                      background: '#0f172a'
                    }}>
                      <img
                        src={current.fotoReal}
                        alt={current.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px', display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, background: `${current.color}15`, color: current.color, padding: '3px 8px', borderRadius: '4px' }}>
                          {current.isoDIN} • {current.tipe}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                          Arah Sayat: <strong>{current.arahSayat}</strong>
                        </span>
                      </div>
                      <h3 style={{ margin: '6px 0 0 0', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                        {current.name}
                      </h3>
                    </div>
                  </div>

                  {/* Mode Toggles */}
                  <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <button
                      onClick={() => { sound.playClick(); setLatheMode('anatomy'); }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: latheMode === 'anatomy' ? current.color : 'transparent',
                        color: latheMode === 'anatomy' ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>🔍</span> Anatomi Detail
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setLatheMode('realPhoto'); }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: latheMode === 'realPhoto' ? current.color : 'transparent',
                        color: latheMode === 'realPhoto' ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>📷</span> Foto Asli Bengkel
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setLatheMode('simulation'); }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: latheMode === 'simulation' ? current.color : 'transparent',
                        color: latheMode === 'simulation' ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>⚙️</span> Simulasi Pembubutan
                    </button>
                  </div>
                </div>

                {/* Konten Showcase Berdasarkan Mode */}
                {latheMode === 'realPhoto' ? (
                  <RealPhotoShowcase tool={current} category="lathe" />
                ) : (
                  <LatheToolMasterVisual
                    tool={current}
                    mode={latheMode}
                    activePinId={activeLathePinId}
                    onPinClick={(id) => {
                      sound.playClick();
                      setActiveLathePinId(id);
                    }}
                  />
                )}

                {/* Interactive Hotspot Inspector */}
                {latheMode === 'anatomy' && activePin && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        PILIH TITIK ANATOMI UNTUK DIPERIKSA:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {current.pins.map(p => {
                          const isPinSelected = p.id === activeLathePinId;
                          return (
                            <button
                              key={p.id}
                              onClick={() => { sound.playClick(); setActiveLathePinId(p.id); }}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: isPinSelected ? `2px solid ${current.color}` : '1px solid #cbd5e1',
                                background: isPinSelected ? current.color : '#ffffff',
                                color: isPinSelected ? '#ffffff' : '#334155',
                                fontWeight: 900,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s'
                              }}
                            >
                              {p.id}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: current.color,
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {activePin.id}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: '0.98rem', color: '#0f172a', marginBottom: '4px' }}>
                          {activePin.label}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, marginBottom: '6px' }}>
                          {activePin.desc}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: current.color, background: `${current.color}10`, padding: '6px 10px', borderRadius: '6px', borderLeft: `3px solid ${current.color}` }}>
                          <strong>💡 Tips Praktik Bengkel:</strong> {activePin.tip}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deskripsi & Ringkasan Pahat */}
                <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {current.deskripsi}
                </div>

                {/* 3 Kolom Penjelasan Aplikasi, Keunggulan & Tips Bengkel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                  <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e40af', marginBottom: '6px' }}>
                      🎯 Aplikasi Pekerjaan Utama
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                      {current.aplikasi}
                    </div>
                  </div>

                  <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#166534', marginBottom: '6px' }}>
                      ⚡ Keunggulan Geometri &amp; Mekanik
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#14532d', lineHeight: 1.5 }}>
                      {current.keunggulan}
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', padding: '14px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#92400e', marginBottom: '6px' }}>
                      💡 Pedoman Penyetelan &amp; Operasi
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
                      {current.tipsTeknis}
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* Card Visual Anatomi Pahat Bubut Umum */}
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
      {/* TAB 2: ALAT POTONG FRAIS / MILLING CUTTERS (8 JENIS DENGAN VISUAL NYATA) */}
      {/* ===================================================================== */}
      {activeTab === 'milling' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Card */}
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #0369a1, #0c4a6e)', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: '#38bdf8', color: '#082f49', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                KATALOG 11 PISAU FRAIS MESIN STANDAR INDUSTRI (ISO &amp; DIN)
              </span>
              <span style={{ background: 'rgba(255,255,255,0.18)', color: '#e0f2fe', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                ILUSTRASI TEKNIK REAL-TIME &amp; CAD CROSS-SECTION
              </span>
            </div>
            <h2 style={{ margin: '8px 0 6px 0', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
              🌀 Jenis-Jenis Alat Potong Pekerjaan Frais (Milling)
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#e0f2fe', lineHeight: 1.5, maxWidth: '850px' }}>
              Mesin frais menggunakan alat potong multi-gigi yang berputar menyayat benda kerja yang bergerak translasi. Di bawah ini ditampilkan visual fisik nyata, geometri heliks, sudut potong, simulasi sayatan ke logam, dan blueprint penampang hasil pemesinannya sesuai standar bengkel presisi.
            </p>
          </div>

          {/* Reference Poster Banner (Want.net / EngineeringLearn Reference) */}
          <div style={{
            background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
            border: '1.5px solid #38bdf8',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#ffffff',
                  border: '1.5px solid #38bdf8',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => { sound.playClick(); setShowMillingRefModal(true); }}
                title="Klik untuk memperbesar bagan referensi teknik"
              >
                <img
                  src="/assets/images/machine_cutting_tools/milling_cutters_types_reference.jpg"
                  alt="Poster Referensi Alat Frais"
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.68rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                    POSTER REFERENSI RESMI
                  </span>
                  <span style={{ color: '#38bdf8', fontSize: '0.78rem', fontWeight: 800 }}>
                    Standard Types of Milling Cutters Chart
                  </span>
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#ffffff' }}>
                  Bagan Standar Industri Visual Asli: 9 Jenis Pisau Frais Terpopuler
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  Berdasarkan standar manufaktur presisi want.net &amp; engineeringlearn.com
                </div>
              </div>
            </div>
            <button
              onClick={() => { sound.playClick(); setShowMillingRefModal(true); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 16px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)',
                transition: 'all 0.15s'
              }}
            >
              🔍 Buka Poster Bagan Referensi Lengkap
            </button>
          </div>

          {/* Toolbar Pengendali Tampilan Visual Kartu */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0f172a' }}>
                👁️ Mode Tampilan Kartu Pisau Frais:
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                (Pilih tampilan bentuk profil CAD, foto workshop asli, atau keduanya)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button
                onClick={() => { sound.playClick(); setMillingCardView('split'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: millingCardView === 'split' ? '#0284c7' : 'transparent',
                  color: millingCardView === 'split' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                🔀 Split (CAD + Foto)
              </button>
              <button
                onClick={() => { sound.playClick(); setMillingCardView('cad'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: millingCardView === 'cad' ? '#0284c7' : 'transparent',
                  color: millingCardView === 'cad' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                📐 Bentuk CAD / Profil
              </button>
              <button
                onClick={() => { sound.playClick(); setMillingCardView('photo'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: millingCardView === 'photo' ? '#0284c7' : 'transparent',
                  color: millingCardView === 'photo' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                📷 Foto Asli Bengkel
              </button>
            </div>
          </div>

          {/* Quick Selector Grid Pisau Frais dengan Kartu Visual Kontur & Geometri Nyata */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {MILLING_CUTTERS_CATALOG.map(tool => {
              const isSelected = selectedMillingId === tool.id;
              const cardMode = cardOverrides[tool.id] || millingCardView;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedMillingId(tool.id);
                    setActiveMillingPinId(1);
                  }}
                  style={{
                    background: isSelected ? '#ffffff' : '#f8fafc',
                    borderRadius: '14px',
                    border: isSelected ? '2.5px solid #0284c7' : '1px solid #cbd5e1',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 24px rgba(2, 132, 199, 0.22)' : '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Visual Kartu Universal (Split / CAD / Foto Real) */}
                  <UniversalToolCardVisual
                    type="milling"
                    tool={tool}
                    isSelected={isSelected}
                    cardViewMode={cardMode}
                    onToggle={() => toggleCardOverride(tool.id)}
                  />

                  {/* Informasi & Parameter Pisau */}
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '0.96rem', color: isSelected ? '#0369a1' : '#0f172a', marginBottom: '2px', lineHeight: 1.3 }}>
                        {tool.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' }}>
                        {tool.englishName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                          📐 {tool.diaRange}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          ⚙️ {tool.fluteOrInserts}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      background: isSelected ? '#0284c7' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s'
                    }}>
                      {isSelected ? '✓ Sedang Diinspeksi di Bawah' : 'Buka Anatomi & Simulasi →'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Showcase Pisau Frais Terpilih */}
          {(() => {
            const current = MILLING_CUTTERS_CATALOG.find(t => t.id === selectedMillingId) || MILLING_CUTTERS_CATALOG[0];
            const activePin = current.pins?.find(p => p.id === activeMillingPinId) || current.pins?.[0];

            return (
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '6px solid #0284c7' }}>
                
                {/* Header Detail Pisau */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '10px',
                      overflow: 'hidden', border: '2px solid #0284c7', flexShrink: 0,
                      background: '#0f172a'
                    }}>
                      <img
                        src={current.fotoReal}
                        alt={current.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px', display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '4px' }}>
                          {current.category}
                        </span>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px' }}>
                          Standar: {current.isoStandard}
                        </span>
                      </div>
                      <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>
                        {current.name}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                        {current.englishName}
                      </div>
                    </div>
                  </div>

                  {/* Mode Visual Switcher Buttons */}
                  <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <button
                      onClick={() => { sound.playClick(); setMillingMode('anatomy'); }}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: millingMode === 'anatomy' ? '#0284c7' : 'transparent',
                        color: millingMode === 'anatomy' ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>🔍</span> Anatomi Fisik
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setMillingMode('realPhoto'); }}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: millingMode === 'realPhoto' ? '#0284c7' : 'transparent',
                        color: millingMode === 'realPhoto' ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>📷</span> Foto Asli Bengkel
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setMillingMode('simulation'); }}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: millingMode === 'simulation' ? '#0284c7' : 'transparent',
                        color: millingMode === 'simulation' ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>⚙️</span> Simulasi Sayatan
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setMillingMode('profile'); }}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: millingMode === 'profile' ? '#0284c7' : 'transparent',
                        color: millingMode === 'profile' ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>📐</span> Blueprint CAD
                    </button>
                  </div>
                </div>

                {/* Konten Showcase Berdasarkan Mode */}
                {millingMode === 'realPhoto' ? (
                  <RealPhotoShowcase tool={current} category="milling" />
                ) : (
                  <MillingCutterVisual
                    tool={current}
                    mode={millingMode}
                    activePinId={activeMillingPinId}
                    onPinClick={(id) => {
                      sound.playClick();
                      setActiveMillingPinId(id);
                    }}
                  />
                )}

                {/* Interactive Hotspot Inspector (Mode Anatomi) */}
                {millingMode === 'anatomy' && activePin && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        PILIH BAGIAN ANATOMI UNTUK DIPERIKSA:
                      </span>
                      {/* Button Pins 1..N */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {current.pins.map(p => {
                          const isPinSelected = p.id === activeMillingPinId;
                          return (
                            <button
                              key={p.id}
                              onClick={() => { sound.playClick(); setActiveMillingPinId(p.id); }}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: isPinSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                background: isPinSelected ? '#0284c7' : '#ffffff',
                                color: isPinSelected ? '#ffffff' : '#334155',
                                fontWeight: 900,
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s'
                              }}
                            >
                              {p.id}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detail Komponen yang Dipilih */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#0284c7',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {activePin.id}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: '0.98rem', color: '#0f172a', marginBottom: '4px' }}>
                          {activePin.label}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, marginBottom: '6px' }}>
                          {activePin.desc}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#0284c7', background: '#f0f9ff', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #0284c7' }}>
                          <strong>💡 Tips Perawatan Bengkel:</strong> {activePin.tip}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deskripsi & Ringkasan Pisau */}
                <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {current.deskripsi}
                </div>

                {/* Parameter Rekomendasi Pemesinan Bengkel */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>
                      📊 Parameter Pemesinan Rekomendasi (Standar Workshop)
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Kompatibilitas ISO:</span>
                      {current.rekomendasiMaterial.map(m => (
                        <span key={m} style={{
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: m === 'P' ? '#2563eb' : m === 'M' ? '#ca8a04' : m === 'K' ? '#dc2626' : m === 'N' ? '#16a34a' : m === 'S' ? '#ea580c' : '#475569',
                          color: '#ffffff'
                        }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>Kecepatan Potong (Vc)</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0284c7' }}>{current.params.vc}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>Pemakanan per Gigi (fz)</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0284c7' }}>{current.params.fz}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>Kedalaman Aksial (ap)</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0284c7' }}>{current.params.ap}</div>
                    </div>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>Lebar Radial (ae)</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0284c7' }}>{current.params.ae}</div>
                    </div>
                  </div>
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

                {/* Kesalahan Fatal Siswa di Bengkel Mesin */}
                <div style={{
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '1.4rem' }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: '0.88rem', color: '#991b1b', marginBottom: '3px' }}>
                      Kesalahan Fatal yang Sering Dilakukan Siswa di Bengkel:
                    </div>
                    <div style={{ fontSize: '0.81rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                      {current.kesalahanBengkel}
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
          
          {/* BANNER 7 BENTUK GEOMETRI INSERT ISO */}
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #c2410c, #7c2d12)', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: '#fdba74', color: '#7c2d12', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                STANDAR INTERNASIONAL ISO 1832
              </span>
              <span style={{ background: 'rgba(255,255,255,0.18)', color: '#ffedd5', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                KATALOG 7 BENTUK GEOMETRI INSERT KARBIDA
              </span>
            </div>
            <h2 style={{ margin: '8px 0 6px 0', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
              📐 Visualisasi 7 Bentuk Geometri Insert Karbida (C, D, S, T, W, V, R)
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#ffedd5', lineHeight: 1.5, maxWidth: '850px' }}>
              Setiap bentuk insert karbida dirancang dengan kompromi antara <strong>Kekuatan Sisi Potong (Edge Strength)</strong> dan <strong>Fleksibilitas Menjangkau Kontur (Accessibility)</strong>. Klik bentuk insert di bawah untuk melihat geometri CAD nyata dan karakteristik teknisnya.
            </p>
          </div>

          {/* Toolbar Pengendali Tampilan Visual Kartu Insert Karbida */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0f172a' }}>
                👁️ Mode Tampilan Kartu Insert Karbida:
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                (Pilih tampilan bentuk profil CAD, foto workshop asli, atau keduanya)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button
                onClick={() => { sound.playClick(); setInsertCardView('split'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: insertCardView === 'split' ? '#c2410c' : 'transparent',
                  color: insertCardView === 'split' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                🔀 Split (CAD + Foto)
              </button>
              <button
                onClick={() => { sound.playClick(); setInsertCardView('cad'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: insertCardView === 'cad' ? '#c2410c' : 'transparent',
                  color: insertCardView === 'cad' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                📐 Bentuk CAD / Profil
              </button>
              <button
                onClick={() => { sound.playClick(); setInsertCardView('photo'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: insertCardView === 'photo' ? '#c2410c' : 'transparent',
                  color: insertCardView === 'photo' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                📷 Foto Asli Bengkel
              </button>
            </div>
          </div>

          {/* Grid 7 Bentuk Insert Karbida dengan Kartu Visual Kontur Nyata */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px'
          }}>
            {CARBIDE_INSERTS_CATALOG.map(ins => {
              const isSelected = selectedInsertShape === ins.shape;
              const cardMode = cardOverrides[ins.shape] || insertCardView;
              return (
                <div
                  key={ins.shape}
                  onClick={() => {
                    sound.playClick();
                    setSelectedInsertShape(ins.shape);
                  }}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: isSelected ? `2.5px solid ${ins.color}` : '1.5px solid #cbd5e1',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isSelected ? `0 6px 16px ${ins.color}35` : '0 2px 4px rgba(0,0,0,0.03)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {/* Visual Kartu Universal (Split / CAD / Foto Real) */}
                  <UniversalToolCardVisual
                    type="insert"
                    tool={ins}
                    isSelected={isSelected}
                    cardViewMode={cardMode}
                    onToggle={() => toggleCardOverride(ins.shape)}
                  />

                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: ins.color,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.85rem'
                      }}>
                        {ins.shape}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: ins.color, background: `${ins.color}15`, padding: '2px 6px', borderRadius: '4px' }}>
                        {ins.sudutHidung.split('(')[0].trim()}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', lineHeight: 1.3 }}>
                      {ins.name.split(':')[1]?.trim() || ins.name}
                    </div>

                    <div style={{ paddingTop: '4px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>
                        Kekuatan: {ins.kekuatanTepi.split(' ')[0]}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: ins.color }}>
                        {isSelected ? '✓ Terpilih' : 'Pilih'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master Showcase Bentuk Insert Karbida Terpilih */}
          {(() => {
            const currentIns = CARBIDE_INSERTS_CATALOG.find(i => i.shape === selectedInsertShape) || CARBIDE_INSERTS_CATALOG[0];
            return (
              <div className="dashboard-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: `6px solid ${currentIns.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: `2px solid ${currentIns.color}`,
                      flexShrink: 0,
                      background: '#0f172a'
                    }}>
                      <img
                        src={currentIns.fotoReal || '/assets/images/machine_cutting_tools/carbide_inserts.jpg'}
                        alt={currentIns.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px', display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <span style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: currentIns.color,
                      color: '#ffffff',
                      fontSize: '1.3rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {currentIns.shape}
                    </span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                        {currentIns.name}
                      </h3>
                      <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        Sudut Hidung: <strong>{currentIns.sudutHidung}</strong> • Kapasitas: <strong>{currentIns.sisiPotong}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#f1f5f9', color: '#334155', padding: '4px 8px', borderRadius: '6px' }}>
                      Kekuatan Sisi: <strong>{currentIns.kekuatanTepi}</strong>
                    </span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#f1f5f9', color: '#334155', padding: '4px 8px', borderRadius: '6px' }}>
                      Aksesibilitas Kontur: <strong>{currentIns.fleksibilitas}</strong>
                    </span>
                  </div>
                </div>

                {/* Visual Perbandingan: Bentuk Geometri CAD vs Foto Asli */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '14px',
                  background: '#090d16',
                  borderRadius: '12px',
                  border: '1.5px solid #334155',
                  padding: '12px',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#020617', borderRadius: '8px', padding: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>📐 BENTUK GEOMETRI CAD & SUDUT HIDUNG</div>
                    <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CarbideInsertCardVisual shape={currentIns.shape} isSelected={true} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#020617', borderRadius: '8px', padding: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#4ade80', marginBottom: '6px' }}>📷 FOTO ASLI BENGKEL DOKUMENTASI</div>
                    <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={currentIns.fotoReal}
                        alt={currentIns.name}
                        loading="lazy"
                        decoding="async"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '4px', display: 'block', filter: 'brightness(1.1) saturate(1.15)' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {currentIns.deskripsi}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.83rem', color: '#166534', marginBottom: '4px' }}>
                      🎯 Fungsi Utama Pengerjaan
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#14532d', lineHeight: 1.5 }}>
                      {currentIns.fungsi}
                    </div>
                  </div>
                  <div style={{ background: '#fffbeb', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.83rem', color: '#92400e', marginBottom: '4px' }}>
                      ⚡ Keunggulan Mekanik &amp; Efisiensi
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
                      {currentIns.keunggulan}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

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
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '4px' }}>
                DIAGRAM TEKNIK REAL-TIME
              </span>
              <h3 style={{ margin: '6px 0 2px 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                📐 4 Sudut Geometri Kritis &amp; Fungsinya pada Pembentukan Tatal
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                Klik tombol tab sudut di bawah untuk melihat simulasi visual efek sudut baji terhadap arah aliran geram dan gaya pemotongan:
              </p>
            </div>

            {/* Visual Interaktif 4 Sudut Geometri Kritis */}
            <CarbideGeometryVisual
              activeAngleId={activeAngleId}
              onSelectAngle={(id) => {
                sound.playClick();
                setActiveAngleId(id);
              }}
            />

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

          {/* Toolbar Pilihan Mode Tampilan Kartu Hole & Thread */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0f172a' }}>
                👁️ Mode Tampilan Kartu Bor & Ulir:
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                (Pilih tampilan bentuk profil CAD, foto workshop asli, atau keduanya)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button
                onClick={() => { sound.playClick(); setHoleCardView('split'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: holeCardView === 'split' ? '#16a34a' : 'transparent',
                  color: holeCardView === 'split' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                🔀 Split (CAD + Foto)
              </button>
              <button
                onClick={() => { sound.playClick(); setHoleCardView('cad'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: holeCardView === 'cad' ? '#16a34a' : 'transparent',
                  color: holeCardView === 'cad' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                📐 Bentuk CAD / Profil
              </button>
              <button
                onClick={() => { sound.playClick(); setHoleCardView('photo'); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none',
                  background: holeCardView === 'photo' ? '#16a34a' : 'transparent',
                  color: holeCardView === 'photo' ? '#ffffff' : '#334155',
                  fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                📷 Foto Asli Bengkel
              </button>
            </div>
          </div>

          {/* Quick Selector Grid 4 Alat Pengeboran & Pembuatan Ulir dengan Ilustrasi Kontur Nyata */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {HOLE_THREAD_TOOLS.map(t => {
              const isSelected = activeHoleToolId === t.id;
              const cardMode = cardOverrides[t.id] || holeCardView;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveHoleToolId(t.id);
                  }}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: isSelected ? '2.5px solid #16a34a' : '1.5px solid #cbd5e1',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isSelected ? '0 8px 20px rgba(22, 163, 74, 0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Visual Kartu Universal (Split / CAD / Foto Real) */}
                  <UniversalToolCardVisual
                    type="hole"
                    tool={t}
                    isSelected={isSelected}
                    cardViewMode={cardMode}
                    onToggle={() => toggleCardOverride(t.id)}
                  />

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                          {t.standar.split('/')[0]}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px' }}>
                          {t.sudutPuncak.split('(')[0].trim()}
                        </span>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '0.96rem', color: '#0f172a' }}>
                        {t.name}
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>
                        Standar DIN / ISO
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#16a34a' }}>
                        {isSelected ? '✓ Sedang Dipilih' : 'Lihat Detail →'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master Showcase Alat Terpilih dengan Visual Realistis & Mode Toggles */}
          {(() => {
            const current = HOLE_THREAD_TOOLS.find(t => t.id === activeHoleToolId) || HOLE_THREAD_TOOLS[0];
            return (
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '5px solid #16a34a' }}>
                
                {/* Header Kontrol Mode Visual */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '10px',
                      overflow: 'hidden', border: '2px solid #16a34a', flexShrink: 0,
                      background: '#0f172a'
                    }}>
                      <img
                        src={current.fotoReal}
                        alt={current.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px', display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px' }}>
                          {current.standar}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                          Profil: <strong>{current.sudutPuncak}</strong>
                        </span>
                      </div>
                      <h3 style={{ margin: '6px 0 0 0', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                        {current.icon} {current.name}
                      </h3>
                    </div>
                  </div>

                  {/* Mode Toggles */}
                  <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <button
                      onClick={() => { sound.playClick(); setHoleViewMode('anatomy'); }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: holeViewMode === 'anatomy' ? '#16a34a' : 'transparent',
                        color: holeViewMode === 'anatomy' ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>🔍</span> Anatomi &amp; Dimensi Standar
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setHoleViewMode('realPhoto'); }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: holeViewMode === 'realPhoto' ? '#16a34a' : 'transparent',
                        color: holeViewMode === 'realPhoto' ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>📷</span> Foto Asli Bengkel
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setHoleViewMode('simulation'); }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: holeViewMode === 'simulation' ? '#16a34a' : 'transparent',
                        color: holeViewMode === 'simulation' ? '#ffffff' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>⚙️</span> Simulasi Proses Kerja
                    </button>
                  </div>
                </div>

                {/* Konten Showcase Berdasarkan Mode */}
                {holeViewMode === 'realPhoto' ? (
                  <RealPhotoShowcase tool={current} category="hole" />
                ) : (
                  <HoleThreadMasterVisual
                    tool={current}
                    mode={holeViewMode}
                  />
                )}

                {/* Anatomi Komponen */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {current.anatomi.map((a, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a' }}>
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

      {/* MODAL POSTER BAGAN REFERENSI JENIS PISAU FRAIS */}
      {showMillingRefModal && (
        <div
          onClick={() => setShowMillingRefModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              borderRadius: '16px',
              border: '2px solid #38bdf8',
              maxWidth: '980px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header Modal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #334155',
              background: '#1e293b',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>📖</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>
                    Bagan Standar Industri: Types of Milling Cutters
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
                    Dokumentasi Referensi Pemesinan Presisi Bengkel Mesin Perkakas (Want.net / EngineeringLearn)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMillingRefModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  fontSize: '1rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Poster Gambar Asli */}
            <div style={{
              padding: '16px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src="/assets/images/machine_cutting_tools/milling_cutters_types_reference.jpg"
                alt="Standard Types of Milling Cutters Poster Reference"
                loading="lazy"
                decoding="async"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  display: 'block',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                }}
              />
            </div>

            {/* Footer Penjelasan & Quick Guide */}
            <div style={{ padding: '16px 20px', background: '#0f172a', borderTop: '1px solid #334155' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', marginBottom: '8px' }}>
                ⚡ 9 Jenis Pisau Frais Standar pada Bagan Referensi:
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
                fontSize: '0.75rem',
                color: '#cbd5e1'
              }}>
                <div>1. <strong>Face Milling Cutter:</strong> Facing muka rata insert</div>
                <div>2. <strong>Roughing End Mill:</strong> Pengasaran gerigi wavy</div>
                <div>3. <strong>End Mill Cutter:</strong> Kontur, alur &amp; dinding 90°</div>
                <div>4. <strong>Ball Cutter:</strong> Permukaan kurva 3D &amp; cetakan</div>
                <div>5. <strong>Side Milling Cutter:</strong> Celah sempit &amp; pembelahan</div>
                <div>6. <strong>Fly Cutter:</strong> Sapuan facing cermin ultra-rata</div>
                <div>7. <strong>T-Slot Cutter:</strong> Alur kepala baut T mesin</div>
                <div>8. <strong>Thread Mill Cutter:</strong> Interpolasi ulir CNC</div>
                <div>9. <strong>Concave Milling Cutter:</strong> Tepi lengkung cembung</div>
              </div>
              <div style={{ textAlign: 'right', marginTop: '12px' }}>
                <button
                  onClick={() => setShowMillingRefModal(false)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#0284c7',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Tutup Poster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MachineCuttingToolsLab;

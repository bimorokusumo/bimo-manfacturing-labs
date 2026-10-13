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
    englishName: 'Face Milling Cutter / Indexable Shell Mill',
    category: 'Milling Permukaan Datar',
    icon: '🥞',
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
    id: 'bullnose',
    name: 'Corner Radius / Bull Nose End Mill',
    englishName: 'Corner Radius End Mill / Bull Nose (Toroidal Cutter)',
    category: 'Milling Pengasaran Berat & Fillet',
    icon: '🛡️',
    isoStandard: 'DIN 6527 Standard Corner Radius',
    materialBadan: 'Solid Sub-Micrograin Tungsten Carbide',
    pelapis: 'TiAlN / AlCrN Berlapis Multi-Layer (Sangat Tahan Aus Abrasif)',
    diaRange: 'Ø6 – Ø20 mm (Radius Pojok R0.5 – R3.0 mm)',
    fluteOrInserts: '3 – 5 Helical Flutes',
    leadAngle: '90° dengan Radius Sudut Pengaman',
    deskripsi: 'Pisau frais ujung datar yang bagian sudut tajam luarnya diberi pembulatan radius kecil (Corner Radius). Menggabungkan kelebihan Square End Mill dan Ball Mill.',
    fungsiUtama: 'Operasi pengasaran berat (heavy roughing), penggalian kantong berdinding tegak dengan fillet bawah, serta pemotongan material keras (Hard Milling).',
    keunggulan: 'Sudut yang dibulatkan menghilangkan konsentrasi tegangan tajam pada ujung pisau, sehingga mata potong jauh lebih tahan terhadap gompal (chipping) dan usia pahat meningkat hingga 2-3 kali lipat.',
    tipsTeknis: 'Sangat direkomendasikan untuk pemrograman High-Efficiency Milling (HEM) atau pemakanan trochoidal dengan kedalaman aksial dalam (Ap besar) dan radial tipis (Ae kecil).',
    rekomendasiMaterial: ['P', 'M', 'K', 'S', 'H'],
    params: { vc: '120 – 280 m/min', fz: '0.08 – 0.18 mm/gigi', ap: '1.0 – 2.0 × Dia', ae: '10% – 30% Diameter' },
    kesalahanBengkel: 'Memprogram radius pojok pisau lebih besar daripada radius sudut gambar kerja produk. Ini akan memotong material berlebih (gouging) di sudut dalam kantong!',
    simulasi: {
      judul: 'Pengasaran Kantong Cepat (High-Efficiency Roughing)',
      aksi: 'Pisau Ø16 mm R1.5 menyayat kantong balok baja dengan pemakanan aksial dalam dan kecepatan tinggi.',
      hasil: 'Menghasilkan dinding tegak dengan fillet sudut dasar R1.5 mm tanpa risiko patah sudut pisau.'
    },
    blueprint: {
      judul: 'Standar Fillet Pojok Kantong Bawah',
      profil: 'Kantong Berdinding Tegak dengan Radius Sudut R1.5 mm',
      toleransi: 'Toleransi Radius Fillet: R1.5 ± 0.05 mm'
    },
    pins: [
      { id: 1, label: 'Tangkai Pengikat Kokoh (Tool Shank)', x: 400, y: 80, desc: 'Tangkai karbida bervolume tebal untuk menyerap gaya potong radial dinamis.', tip: 'Pilihlah holder sistem Weldon atau Hydraulic chuck untuk mencegah pisau tertarik keluar (pull-out).' },
      { id: 2, label: 'Alur Heliks Inti Tebal (Flutes with Thick Core)', x: 375, y: 220, desc: 'Desain inti (core web) dipertebal 10% dibanding end mill biasa untuk mencegah patah.', tip: 'Alur heliks bervariasi (variable pitch) membantu memutus resonansi getaran mesin.' },
      { id: 3, label: 'Sisi Potong Samping 90° (Peripheral Flute)', x: 440, y: 260, desc: 'Menyayat dinding tegak vertikal 90° dengan laju pembuangan tatal tinggi.', tip: 'Gunakan teknik trochoidal milling untuk memaksimalkan panjang kontak sisi samping.' },
      { id: 4, label: 'Radius Sudut Pengaman (Corner Radius R1.5 mm)', x: 360, y: 312, desc: 'Sudut luar yang dibulatkan untuk mendistribusikan panas dan tegangan mekanik.', tip: 'Fitur inilah yang membuat pisau ini jauh lebih awet daripada Square End Mill berujung tajam.' },
      { id: 5, label: 'Muka Ujung Datar Tengah (Flat Bottom Face)', x: 400, y: 326, desc: 'Bagian dasar rata yang menyayat lantai kantong datar dengan efisiensi tinggi.', tip: 'Mampu menghasilkan lantai kantong yang rata mulus dalam satu kali lintasan penyayatan.' }
    ]
  },
  {
    id: 'tslot',
    name: 'T-Slot Milling Cutter (Pisau Frais Alur T)',
    englishName: 'T-Slot Milling Cutter (Woodruff & ISO T-Nut Slotter)',
    category: 'Milling Alur Khusus Mesin',
    icon: '⚓',
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

            {/* 4. BULL NOSE / CORNER RADIUS ANATOMI */}
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
  const [millingMode, setMillingMode] = useState('anatomy'); // 'anatomy' | 'simulation' | 'profile'
  const [activeMillingPinId, setActiveMillingPinId] = useState(1);
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
      {/* TAB 2: ALAT POTONG FRAIS / MILLING CUTTERS (8 JENIS DENGAN VISUAL NYATA) */}
      {/* ===================================================================== */}
      {activeTab === 'milling' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Card */}
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #0369a1, #0c4a6e)', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: '#38bdf8', color: '#082f49', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                KATALOG 8 PISAU FRAIS MESIN (MILLING CUTTERS)
              </span>
              <span style={{ background: 'rgba(255,255,255,0.18)', color: '#e0f2fe', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                ILUSTRASI TEKNIK REAL-TIME &amp; CAD CROSS-SECTION
              </span>
            </div>
            <h2 style={{ margin: '8px 0 6px 0', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
              🌀 Jenis-Jenis Alat Potong Pekerjaan Frais (Milling)
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#e0f2fe', lineHeight: 1.5, maxWidth: '850px' }}>
              Mesin frais menggunakan alat potong multi-gigi yang berputar menyayat benda kerja yang bergerak translasi. Di bawah ini ditampilkan visual fisik nyata, geometri heliks, sudut potong, simulasi sayatan ke logam, dan blueprint penampang hasil pemesinannya.
            </p>
          </div>

          {/* Quick Selector Grid Pisau Frais dengan Thumbnail Kontur Nyata */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px'
          }}>
            {MILLING_CUTTERS_CATALOG.map(tool => {
              const isSelected = selectedMillingId === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedMillingId(tool.id);
                    setActiveMillingPinId(1);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isSelected ? '2.5px solid #0284c7' : '1px solid #cbd5e1',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    color: isSelected ? '#0369a1' : '#1e293b',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s'
                  }}
                >
                  {/* Thumbnail SVG Kontur Nyata Alat */}
                  <MillingCutterThumbnail toolId={tool.id} isSelected={isSelected} />

                  {/* Informasi Teks Pisau */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isSelected ? '#0284c7' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#475569',
                        whiteSpace: 'nowrap'
                      }}>
                        {tool.category}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800 }}>
                        {tool.isoStandard?.split(' ')[0]}
                      </span>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '0.88rem', color: isSelected ? '#0369a1' : '#0f172a', lineHeight: 1.3 }}>
                      {tool.name.split('(')[0].trim()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      {tool.diaRange}
                    </div>
                  </div>
                </button>
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

                {/* SVG Visual Kanvas Realistis */}
                <MillingCutterVisual
                  tool={current}
                  mode={millingMode}
                  activePinId={activeMillingPinId}
                  onPinClick={(id) => {
                    sound.playClick();
                    setActiveMillingPinId(id);
                  }}
                />

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

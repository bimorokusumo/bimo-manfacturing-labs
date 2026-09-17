import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';

const CNCTheoryGuide = () => {
  const [activeTab, setActiveTab] = useState('pengenalan'); // 'pengenalan', 'komponen', 'gcode'
  
  // TAB 1: COORDINATE SYSTEM STATES
  const [coordMode, setCoordMode] = useState('absolut'); // 'absolut' (G90) vs 'inkremental' (G91)
  const [selectedCoordPoint, setSelectedCoordPoint] = useState(1);
  
  // TAB 2: MACHINE COMPONENT INSPECTION STATES
  const [selectedMachineType, setSelectedMachineType] = useState('vmc'); // 'vmc' (Milling) or 'lathe' (Bubut)
  const [selectedComponentKey, setSelectedComponentKey] = useState('spindle');

  // TAB 3: G-CODE & M-CODE SIMULATOR STATES
  const [activeCodeCategory, setActiveCodeCategory] = useState('all_g'); // 'all_g', 'motion', 'coord', 'm_code'
  const [selectedGcodePreset, setSelectedGcodePreset] = useState('contour'); // 'contour', 'circle', 'drill'
  const [simStep, setSimStep] = useState(0);
  const [isPlayingSim, setIsPlayingSim] = useState(false);

  // Tabs Definition
  const tabs = [
    { id: 'pengenalan', label: '1. Pengenalan Dasar CNC & Sistem Sumbu', icon: '💡' },
    { id: 'komponen', label: '2. Bagian Komponen Mesin CNC', icon: '🏗️' },
    { id: 'gcode', label: '3. Pemrograman G-Code & M-Code', icon: '💻' }
  ];

  // =========================================================================
  // DATA KOMPONEN MESIN CNC
  // =========================================================================
  const MACHINE_COMPONENTS = {
    vmc: {
      title: 'Vertical Machining Center (CNC Milling 3-Axis)',
      components: {
        spindle: {
          name: 'Kepala Poros Utama (Spindle Head & Motor)',
          role: 'Pemutar Pisau Potong Berkecepatan Tinggi',
          desc: 'Poros presisi yang digerakkan oleh motor AC bertenaga besar (500 – 12.000+ RPM). Dilengkapi sistem pendingin oli internal (spindle chiller) untuk mencegah pemuaian termal yang dapat merusak akurasi pemotongan.',
          spec: 'Standar Taper: BT40 / BT30 / HSK, Daya: 7.5 - 15 kW, Rentang RPM: 50 - 15.000 RPM',
          k3Tip: 'Pastikan putaran spindel telah benar-benar berhenti (M05) sebelum membuka kabin mesin atau menyentuh pisau potong!',
          color: '#38bdf8',
          pos: { x: 380, y: 95 }
        },
        tool_holder: {
          name: 'Pemegang Alat Potong (Tool Holder & Collet)',
          role: 'Pencekam Endmill, Drill, & Face Mill Berpresisi Tinggi',
          desc: 'Konus baja paduan berkekuatan tinggi tempat memasang pisau potong. Menggunakan collet ER atau sistem hydraulic chuck dengan runout mendekati 0.003 mm agar putaran pisau seimbang sempurna.',
          spec: 'Tipe Collet: ER16 / ER32 / ER40, Kekencangan Torsi: 80 - 120 Nm',
          k3Tip: 'Bersihkan konus dari debu dan tatal gram sebelum dipasang ke spindle nose untuk mencegah penyimpangan titik pusat.',
          color: '#fbbf24',
          pos: { x: 380, y: 145 }
        },
        worktable: {
          name: 'Meja Kerja & Alur T (T-Slot Machine Bed)',
          role: 'Tempat Pemasangan Ragum & Benda Kerja',
          desc: 'Meja besi cor kelabu (cast iron) dengan perlakuan panas penuaan (*stress relieved*) yang sangat kokoh meredam getaran. Dilengkapi alur T-Slot standar untuk memasang ragum presisi atau fixture klem.',
          spec: 'Beban Maksimal Meja: 400 - 800 kg, Kerataan Permukaan: < 0.005 mm',
          k3Tip: 'Selalu gunakan dial indicator untuk mengecek kesejajaran ragum terhadap sumbu X sebelum proses pemesinan dimulai.',
          color: '#34d399',
          pos: { x: 380, y: 220 }
        },
        ballscrew: {
          name: 'Poros Ulir Bola Presisi (Ground Ball Screw & Linear Guide)',
          role: 'Pengubah Putaran Motor Menjadi Gerak Linier Tanpa Backlash',
          desc: 'Poros ulir baja khusus dengan butiran bola baja presisi di dalam mur ulirnya. Menggerakkan eretan sumbu X, Y, dan Z dengan efisiensi mekanis > 90% dan toleransi nol kelonggaran (zero backlash).',
          spec: 'Akurasi Lead Pitch: C3 / C5 Class, Pelumasan Otomatis Pompa Grease Terpusat',
          k3Tip: 'Pastikan tabung oli pelumas peluncur otomatis (automatic lubricator) selalu terisi oli penuntun VG68.',
          color: '#a78bfa',
          pos: { x: 260, y: 245 }
        },
        servo_motor: {
          name: 'Motor Servo AC Sumbu & Optical Encoder',
          role: 'Penggerak Sumbu Koordinat X, Y, Z Presisi Mikron',
          desc: 'Motor listrik tanpa sikat (brushless) yang dikendalikan oleh servo drive. Dilengkapi sensor encoder beresolusi puluhan ribu pulsa per putaran untuk memverifikasi posisi aktual pahat secara real-time.',
          spec: 'Torsi: 6 - 22 Nm, Resolusi Encoder: 20-bit / 24-bit (akurasi 0.0001 mm)',
          k3Tip: 'Bila alarm "Servo Overload" menyala, segera hentikan mesin dan periksa kemungkinan terjadinya pemakanan terlalu dalam atau sumbu terganjal.',
          color: '#f472b6',
          pos: { x: 500, y: 245 }
        },
        atc: {
          name: 'Automatic Tool Changer (ATC Magasin Payung / Arm)',
          role: 'Pengganti Alat Potong Otomatis Tanpa Intervensi Manual',
          desc: 'Magasin penyimpan alat potong berkapasitas 16 hingga 24 tool. Saat menerima instruksi M06 T..., lengan mekanik ganda (twin arm) akan menukar tool di spindle dalam waktu 2 – 4 detik.',
          spec: 'Kapasitas: 16 - 32 Tools, Waktu Tukar Tool-to-Tool: 1.8 detik',
          k3Tip: 'Periksa nomor urut tool di magasin (Pot Number) agar tidak tertukar pisau frais dengan pisau bor yang berpotensi memicu tabrakan (crash)!',
          color: '#fb923c',
          pos: { x: 240, y: 110 }
        },
        controller: {
          name: 'Panel Kontrol CNC & Unit Pemroses (CNC Controller Unit)',
          role: 'Otak Komputer Pemroses Baris Program G-Code',
          desc: 'Unit mikrokomputer industri (misal: FANUC, Siemens SINUMERIK, GSK, Mitsubishi). Berisi layar grafis, tombol alfanumerik, saklar mode (AUTO, EDIT, MDI, JOG, REF), serta tombol darurat.',
          spec: 'Sistem: Fanuc 0i-MF / Siemens 828D, Pemrosesan Blok: 1.000 blok/detik (Look-Ahead)',
          k3Tip: 'Gunakan mode Single Block dan aktifkan Dry Run saat pertama kali menguji program baru yang belum diverifikasi.',
          color: '#60a5fa',
          pos: { x: 560, y: 140 }
        },
        mpg: {
          name: 'Handwheel Manual Pulse Generator (MPG Wheel)',
          role: 'Penggerak Sumbu Manual Saat Proses Nol Offset',
          desc: 'Roda putar genggam manual yang menghasilkan pulsa sinyal penggerak sumbu. Memiliki selektor sumbu (X, Y, Z) dan pengali skala pergerakan (x1 = 0.001 mm, x10 = 0.01 mm, x100 = 0.1 mm).',
          spec: '100 Pulsa per putaran klik dengan detent tactile presisi',
          k3Tip: 'Hati-hati saat menggunakan skala pengali x100 di dekat permukaan benda kerja agar tidak menabrakkan pisau ke ragum!',
          color: '#4ade80',
          pos: { x: 570, y: 200 }
        },
        coolant: {
          name: 'Sistem Pendingin (Flood Coolant & Chip Flushing)',
          role: 'Pembuang Panas Gesekan & Pembersih Tatal Gram',
          desc: 'Pompa cairan pendingin bertekanan yang menyemprotkan emulsi minyak larut air (soluble oil) ke ujung pisau potong, mencegah mata pisau terbakar dan membilas tatal ke bak penampungan.',
          spec: 'Tekanan Pompa: 3 - 5 Bar, Rasio Campuran Oli-Air: 1 : 10 atau 1 : 15 (Refractometer 6-8%)',
          k3Tip: 'Gunakan kacamata pelindung dan pastikan pintu kabin rapat sebelum menyalakan semprotan coolant M08.',
          color: '#38bdf8',
          pos: { x: 340, y: 165 }
        },
        enclosure: {
          name: 'Kabin Pengaman & Saklar Interlock Pintu (Safety Enclosure)',
          role: 'Melindungi Operator dari Lonjakan Gram & Pecahan Pisau',
          desc: 'Kabin baja tertutup dengan jendela kaca polikarbonat tebal tahan benturan. Memiliki sensor saklar keselamatan (door safety interlock) yang langsung memutus siklus pemotongan bila pintu dibuka paksa.',
          spec: 'Kaca: Polycarbonate Laminated 8 mm Tahan Impak 200 Joule',
          k3Tip: 'DILARANG membypass saklar sensor interlock pintu; kecelakaan fatal sering terjadi akibat membuka pintu saat spindle berputar 10.000 RPM!',
          color: '#f87171',
          pos: { x: 190, y: 200 }
        }
      }
    },
    lathe: {
      title: 'CNC Slant-Bed Lathe (Mesin Bubut CNC 2-Axis)',
      components: {
        spindle: {
          name: 'Kepala Tetap & Spindel Cekam Bubut (Headstock & Chuck)',
          role: 'Pemutar Benda Kerja Silindris Berkecepatan Tinggi',
          desc: 'Unit poros bertenaga tinggi yang memutar benda kerja melalui cekam hidrolik 3-rahang (hydraulic 3-jaw chuck) dengan kecepatan hingga 4.000 RPM.',
          spec: 'Diameter Cekam: 6" - 10", Lubang Spindle (Bore): Ø 45 - 65 mm',
          k3Tip: 'Periksa tekanan hidrolik penjepitan cekam pada manometer agar benda kerja tidak terlempar keluar saat putaran tinggi.',
          color: '#38bdf8',
          pos: { x: 260, y: 160 }
        },
        turret: {
          name: 'Turret Perkakas Otomatis (Automatic Indexing Tool Turret)',
          role: 'Penyimpan & Pemilih Pahat Bubut Otomatis',
          desc: 'Piringan turret bersegi 8 atau 12 tempat memasang berbagai pahat bubut (pahat muka, pahat alur, ulir, bor dalam). Berputar cepat menentukan pahat via kode T (Tool).',
          spec: 'Jumlah Stasiun Pahat: 8 atau 12 Stasiun, Waktu Indeks: 0.2 detik',
          k3Tip: 'Perhatikan overhang (panjang juluran pahat dari holder); semakin pendek juluran, semakin minim getaran dan risiko patah.',
          color: '#fbbf24',
          pos: { x: 450, y: 130 }
        },
        tailstock: {
          name: 'Kepala Lepas Hidrolik (Hydraulic Tailstock)',
          role: 'Penumpu Ujung Benda Kerja Panjang',
          desc: 'Unit penumpu dengan center putar (*live center*) yang digerakkan oleh pedal hidrolik untuk menahan benda kerja panjang agar tidak lentur saat disayat.',
          spec: 'Perjalanan Quill: 80 - 120 mm, Standar Morse Taper: MT-4 / MT-5',
          k3Tip: 'Wajib pasang tailstock jika perbandingan panjang benda kerja terhadap diameter melebihi 3 : 1 (L/D > 3).',
          color: '#34d399',
          pos: { x: 540, y: 190 }
        },
        controller: {
          name: 'Panel Kontroler CNC Bubut',
          role: 'Antarmuka Pengendali Kode X dan Z',
          desc: 'Unit kontroler yang memproses koordinat diameter (sumbu X) dan panjang silindris (sumbu Z) serta siklus pembubutan otomatis (G71, G72, G76).',
          spec: 'Fanuc 0i-TF / GSK 980TDi / Siemens 808D Advanced',
          k3Tip: 'Pahami perbedaan pemrograman diameter vs radius pada sumbu X mesin bubut CNC!',
          color: '#60a5fa',
          pos: { x: 570, y: 80 }
        }
      }
    }
  };

  // =========================================================================
  // DATA KAMUS G-CODE & M-CODE LENGKAP
  // =========================================================================
  const G_CODES_LIST = [
    { code: 'G00', name: 'Rapid Positioning Traverse', cat: 'motion', desc: 'Gerak cepat tanpa menyayat melayang di udara ke posisi tujuan. Tidak memakan material.', example: 'G00 X50.0 Y30.0 Z5.0' },
    { code: 'G01', name: 'Linear Feed Interpolation', cat: 'motion', desc: 'Gerak pemakanan lurus teratur menyayat benda kerja dengan kecepatan yang diatur oleh kode F (Feedrate).', example: 'G01 Z-2.0 F120' },
    { code: 'G02', name: 'Circular Interpolation Clockwise (CW)', cat: 'motion', desc: 'Gerak penyayatan melingkar searah jarum jam dengan mendefinisikan radius (R) atau vektor titik pusat (I, J).', example: 'G02 X30.0 Y40.0 R15.0 F150' },
    { code: 'G03', name: 'Circular Interpolation Counter-CW (CCW)', cat: 'motion', desc: 'Gerak penyayatan melingkar berlawanan arah putaran jarum jam.', example: 'G03 X10.0 Y20.0 R10.0 F150' },
    { code: 'G04', name: 'Dwell (Waktu Jeda Sesaat)', cat: 'motion', desc: 'Mesin berhenti bergerak sesaat di posisi akhir selama nilai detik/milidetik tertentu (misal: membersihkan dasar lubang bor).', example: 'G04 P1000 (Jeda 1 detik)' },
    { code: 'G17', name: 'XY Plane Selection', cat: 'coord', desc: 'Memilih bidang kerja koordinat X dan Y (standar pengefraisan vertikal CNC Milling).', example: 'G17 (Bidang datar atas)' },
    { code: 'G20', name: 'Input in Inches', cat: 'coord', desc: 'Mengatur satuan dimensi sistem Inci (Imperial).', example: 'G20' },
    { code: 'G21', name: 'Input in Millimeters', cat: 'coord', desc: 'Mengatur satuan dimensi sistem Metrik / Milimeter (Standar bengkel industri Indonesia).', example: 'G21' },
    { code: 'G28', name: 'Return to Machine Home (Zero Return)', cat: 'coord', desc: 'Mengembalikan seluruh sumbu mesin ke titik nol fisik referensi pabrik pembuat mesin.', example: 'G28 G91 Z0.0' },
    { code: 'G40', name: 'Cutter Compensation Cancel', cat: 'comp', desc: 'Membatalkan kompensasi radius pisau frais (kembali ke jalur tengah titik pusat pisau).', example: 'G40' },
    { code: 'G41', name: 'Cutter Compensation Left', cat: 'comp', desc: 'Kompensasi radius pisau di sebelah kiri garis kontur (climb milling standar).', example: 'G41 D01 X20.0 Y10.0' },
    { code: 'G42', name: 'Cutter Compensation Right', cat: 'comp', desc: 'Kompensasi radius pisau di sebelah kanan garis kontur.', example: 'G42 D01 X20.0 Y10.0' },
    { code: 'G43', name: 'Tool Length Offset Compensation (+)', cat: 'comp', desc: 'Mengaktifkan kompensasi panjang alat potong berdasarkan register H.', example: 'G43 H01 Z50.0' },
    { code: 'G54', name: 'Work Coordinate System 1 (WCS)', cat: 'coord', desc: 'Memilih titik nol acuan benda kerja utama (Part Zero) yang telah disetting operator.', example: 'G54 (X0 Y0 Z0 Benda Kerja)' },
    { code: 'G81', name: 'Simple Drilling Canned Cycle', cat: 'cycle', desc: 'Siklus otomatis pengeboran langsung ke kedalaman Z dan kembali cepat ke bidang aman R.', example: 'G81 X20.0 Y20.0 Z-15.0 R2.0 F80' },
    { code: 'G83', name: 'Peck Drilling Cycle (Deep Hole)', cat: 'cycle', desc: 'Siklus pengeboran lubang dalam dengan gerakan maju-mundur berkala untuk membuang tatal.', example: 'G83 X30.0 Y30.0 Z-30.0 Q5.0 R2.0 F60' },
    { code: 'G90', name: 'Absolute Coordinate Programming', cat: 'coord', desc: 'Sistem koordinat absolut: semua titik tujuan diukur dari titik nol tetap (0,0,0).', example: 'G90 (Semua posisi absolut)' },
    { code: 'G91', name: 'Incremental Coordinate Programming', cat: 'coord', desc: 'Sistem koordinat inkremental: titik tujuan dihitung relatif terhadap posisi terakhir pisau.', example: 'G91 (Posisi relatif bertahap)' }
  ];

  const M_CODES_LIST = [
    { code: 'M00', name: 'Program Stop', desc: 'Menghentikan jalannya mesin sementara. Operator dapat memeriksa benda sebelum menekan Cycle Start kembali.' },
    { code: 'M01', name: 'Optional Program Stop', desc: 'Program berhenti hanya jika saklar "Optional Stop" pada panel kontrol diaktifkan oleh operator.' },
    { code: 'M02', name: 'End of Program', desc: 'Menandakan program telah selesai (tanpa otomatis rewind ke baris paling atas).' },
    { code: 'M03', name: 'Spindle Start Clockwise (CW)', desc: 'Menyalakan putaran poros utama (spindle) searah jarum jam. Wajib dipadukan dengan kecepatan putar S (Speed).' },
    { code: 'M04', name: 'Spindle Start Counter-CW (CCW)', desc: 'Menyalakan putaran spindel berlawanan arah jarum jam (biasanya untuk tap ulir kiri).' },
    { code: 'M05', name: 'Spindle Stop', desc: 'Menghentikan putaran poros utama secara elektrik dengan rem dinamis.' },
    { code: 'M06', name: 'Automatic Tool Change (ATC)', desc: 'Memerintahkan lengan ATC mengganti pisau potong dengan tool baru yang dipanggil via nomor T.' },
    { code: 'M08', name: 'Coolant Pump ON', desc: 'Menyalakan semprotan cairan pendingin pemotong untuk membilas tatal dan membuang panas gesekan.' },
    { code: 'M09', name: 'Coolant Pump OFF', desc: 'Mematikan semprotan cairan pendingin sebelum proses ganti pisau atau program berakhir.' },
    { code: 'M30', name: 'Program End and Rewind', desc: 'Program selesai, seluruh motor dan coolant dimatikan, dan pembacaan memori otomatis kembali ke baris awal (O1001).' }
  ];

  // =========================================================================
  // SIMULATOR TRAJECTORY DATA (SUB-MODUL 3)
  // =========================================================================
  const TRAJECTORY_PRESETS = {
    contour: {
      title: 'Pembuatan Profil Kotak Berpengecilan (Contour Milling)',
      codeLines: [
        { code: 'O1001 (PROFIL KOTAK)', desc: 'Nomor program identitas', x: 0, y: 0, z: 20, type: 'init' },
        { code: 'G21 G90 G54 G17', desc: 'Satuan mm, Koordinat Absolut, Titik Nol Benda G54, Bidang XY', x: 0, y: 0, z: 20, type: 'init' },
        { code: 'M03 S2500 M08', desc: 'Putar spindel 2500 RPM searah jarum jam, Nyalakan cairan pendingin', x: 0, y: 0, z: 20, type: 'init' },
        { code: 'G00 X-25.0 Y-25.0 Z5.0', desc: 'Gerak cepat melayang (Rapid) ke posisi aman di atas pojok kiri bawah', x: -25, y: -25, z: 5, type: 'rapid' },
        { code: 'G01 Z-3.0 F150', desc: 'Gerak pemakanan turun vertikal menembus material sedalam 3 mm', x: -25, y: -25, z: -3, type: 'cut' },
        { code: 'G01 X25.0 Y-25.0 F300', desc: 'Pemakanan lurus horizontal ke kanan menuju titik (25, -25)', x: 25, y: -25, z: -3, type: 'cut' },
        { code: 'G01 X25.0 Y25.0', desc: 'Pemakanan lurus vertikal ke atas menuju titik (25, 25)', x: 25, y: 25, z: -3, type: 'cut' },
        { code: 'G01 X-25.0 Y25.0', desc: 'Pemakanan lurus horizontal ke kiri menuju titik (-25, 25)', x: -25, y: 25, z: -3, type: 'cut' },
        { code: 'G01 X-25.0 Y-25.0', desc: 'Pemakanan menutup kontur kembali ke titik awal (-25, -25)', x: -25, y: -25, z: -3, type: 'cut' },
        { code: 'G00 Z20.0', desc: 'Angkat pisau cepat (Rapid) ke ketinggian aman Z20', x: -25, y: -25, z: 20, type: 'rapid' },
        { code: 'M05 M09', desc: 'Matikan putaran spindel dan matikan cairan pendingin', x: -25, y: -25, z: 20, type: 'end' },
        { code: 'M30', desc: 'Program selesai dan memori kembali ke baris awal', x: -25, y: -25, z: 20, type: 'end' }
      ]
    },
    circle: {
      title: 'Interpolasi Melingkar G02 (CW) & G03 (CCW)',
      codeLines: [
        { code: 'O1002 (KONTUR RADIUS)', desc: 'Nomor program interpolasi lengkung', x: 0, y: 0, z: 20, type: 'init' },
        { code: 'G21 G90 G54 G17', desc: 'Inisialisasi mode absolut & bidang XY', x: 0, y: 0, z: 20, type: 'init' },
        { code: 'M03 S3000 M08', desc: 'Spindel 3000 RPM CW, Coolant ON', x: 0, y: 0, z: 20, type: 'init' },
        { code: 'G00 X-30.0 Y0.0 Z5.0', desc: 'Rapid ke titik awal lingkaran sisi kiri (-30, 0)', x: -30, y: 0, z: 5, type: 'rapid' },
        { code: 'G01 Z-2.0 F120', desc: 'Turun menyayat sedalam Z -2.0 mm', x: -30, y: 0, z: -2, type: 'cut' },
        { code: 'G02 X0.0 Y30.0 R30.0 F250', desc: 'Interpolasi radius searah jarum jam (CW) R30 ke puncak atas (0, 30)', x: 0, y: 30, z: -2, type: 'arc' },
        { code: 'G02 X30.0 Y0.0 R30.0', desc: 'Lanjut busur melingkar CW R30 ke sisi kanan (30, 0)', x: 30, y: 0, z: -2, type: 'arc' },
        { code: 'G02 X0.0 Y-30.0 R30.0', desc: 'Lanjut busur melingkar CW R30 ke sisi bawah (0, -30)', x: 0, y: -30, z: -2, type: 'arc' },
        { code: 'G02 X-30.0 Y0.0 R30.0', desc: 'Tutup lingkaran penuh 360 derajat CW kembali ke (-30, 0)', x: -30, y: 0, z: -2, type: 'arc' },
        { code: 'G00 Z25.0', desc: 'Tarik pisau cepat ke posisi aman melayang', x: -30, y: 0, z: 25, type: 'rapid' },
        { code: 'M05 M09 M30', desc: 'Spindel Stop, Coolant Stop, Program End & Rewind', x: -30, y: 0, z: 25, type: 'end' }
      ]
    },
    drill: {
      title: 'Pola Pengeboran 4 Lubang Baut (PCD Bolt Holes G81)',
      codeLines: [
        { code: 'O1003 (BOR 4 LUBANG)', desc: 'Program siklus pengeboran kaleng (Canned Cycle)', x: 0, y: 0, z: 20, type: 'init' },
        { code: 'G21 G90 G54', desc: 'Mode milimeter, absolut, WCS G54', x: 0, y: 0, z: 20, type: 'init' },
        { code: 'M03 S1500 M08', desc: 'Spindel bor 1500 RPM, Coolant ON', x: 0, y: 0, z: 20, type: 'init' },
        { code: 'G00 Z10.0', desc: 'Rapid posisi aman', x: 0, y: 0, z: 10, type: 'rapid' },
        { code: 'G81 X-20.0 Y-20.0 Z-10.0 R2.0 F80', desc: 'Siklus Bor Lubang 1 di (-20, -20) sedalam 10 mm dengan bidang mundur R2', x: -20, y: -20, z: -10, type: 'drill' },
        { code: 'X20.0 Y-20.0', desc: 'Siklus otomatis mengebor Lubang 2 di (20, -20)', x: 20, y: -20, z: -10, type: 'drill' },
        { code: 'X20.0 Y20.0', desc: 'Siklus otomatis mengebor Lubang 3 di (20, 20)', x: 20, y: 20, z: -10, type: 'drill' },
        { code: 'X-20.0 Y20.0', desc: 'Siklus otomatis mengebor Lubang 4 di (-20, 20)', x: -20, y: 20, z: -10, type: 'drill' },
        { code: 'G80 G00 Z25.0', desc: 'G80 Batalkan siklus bor, angkat pisau aman ke Z25', x: -20, y: 20, z: 25, type: 'rapid' },
        { code: 'M05 M09 M30', desc: 'Spindel Mati, Pendingin Mati, Selesai', x: -20, y: 20, z: 25, type: 'end' }
      ]
    }
  };

  const curPreset = TRAJECTORY_PRESETS[selectedGcodePreset];
  const curLines = curPreset.codeLines;
  const activeLine = curLines[simStep] || curLines[0];

  // Auto-play loop for G-code simulation
  useEffect(() => {
    let timer;
    if (isPlayingSim) {
      timer = setInterval(() => {
        setSimStep(prev => {
          if (prev < curLines.length - 1) {
            return prev + 1;
          } else {
            setIsPlayingSim(false);
            sound.playSuccess();
            return prev;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlayingSim, curLines.length]);

  // Current machine component object
  const currentMach = MACHINE_COMPONENTS[selectedMachineType];
  const curComp = currentMach.components[selectedComponentKey] || Object.values(currentMach.components)[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* HEADER BANNER */}
      <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)', color: '#ffffff' }}>
        <span style={{ background: '#38bdf8', color: '#000', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
          MODUL PEMBELAJARAN MESIN CNC (COMPUTER NUMERICAL CONTROL)
        </span>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '12px 0 8px 0', color: '#ffffff' }}>
          ⚙️ Pengenalan Dasar, Anatomi Komponen & Pemrograman G/M Code
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#e0f2fe', lineHeight: 1.6, maxWidth: '950px', margin: 0 }}>
          Pelajari konsep dasar mesin CNC dan kaidah tangan kanan, anatomi 10 komponen utama mesin milling & bubut CNC, serta kamus lengkap dan <strong>simulator lintasan pemrograman G-Code & M-Code</strong>!
        </p>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: 'var(--bg-card)',
        padding: '10px',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-game)',
        overflowX: 'auto',
        maxWidth: '100%'
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { sound.playClick(); setActiveTab(t.id); }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: activeTab === t.id ? '2px solid #0284c7' : '1px solid var(--border-light)',
              background: activeTab === t.id ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
              color: activeTab === t.id ? '#0284c7' : 'var(--text-main)',
              fontWeight: activeTab === t.id ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* =================================================================== */}
      {/* SUB-MODUL 1: PENGENALAN DASAR CNC & SISTEM SUMBU KOORDINAT           */}
      {/* =================================================================== */}
      {activeTab === 'pengenalan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* KONSEP DASAR & PERBEDAAN */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                PRINSIP KERJA OTOMASI INDUSTRI
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                💡 Apa Itu Mesin CNC? (Computer Numerical Control)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                <strong>CNC (Computer Numerical Control)</strong> adalah sistem otomasi mesin perkakas yang dioperasikan oleh perintah alfanumerik (huruf dan angka) yang telah diprogram dan disimpan di dalam komputer kontroler.
              </p>
            </div>

            {/* PERBANDINGAN KONVENSIONAL VS CNC */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px' }}>
                  <span>🕹️</span> MESIN PERKAKAS KONVENSIONAL
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Penggerak:</strong> Digerakkan secara manual oleh tangan juru mesin melalui engkol roda pemutar (handwheel).</li>
                  <li><strong>Tingkat Akurasi:</strong> Bergantung tinggi pada ketelitian mata, pengalaman, dan tingkat kelelahan operator (toleransi ± 0.05 mm).</li>
                  <li><strong>Bentuk Benda Kerja:</strong> Sangat terbatas pada geometri lurus, chamfer, atau tirus sederhana. Mustahil membuat kontur 3D lengkung rumit secara manual.</li>
                  <li><strong>Kecepatan Produksi:</strong> Lambat, memerlukan pengukuran berulang kali di setiap lintasan pemotongan.</li>
                </ul>
              </div>

              <div style={{ background: '#f0fdf4', padding: '18px', borderRadius: '10px', border: '1px solid #86efac' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px' }}>
                  <span>⚡</span> MESIN PERKAKAS CNC MODERN
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#166534', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Penggerak:</strong> Digerakkan motor servo AC otomatis berdasar kode angka (G-Code) dari prosesor komputer.</li>
                  <li><strong>Tingkat Akurasi:</strong> Sangat tinggi hingga ketelitian 0.001 mm (1 mikron) dengan pengulangan identik (repeatability sempurna).</li>
                  <li><strong>Bentuk Benda Kerja:</strong> Mampu memotong kontur 3D lengkung aerodinamis kompleks (cetakan mold die, bilah turbin pesawat, prostetik implan medis).</li>
                  <li><strong>Kecepatan Produksi:</strong> Siklus produksi massal sangat cepat, konsisten, dan tingkat kecelakaan kerja operator menurun drastis.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* KAIDAH TANGAN KANAN & SISTEM SUMBU KARTESIUS */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                STANDARISASI ISO 841
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                ✋ Kaidah Tangan Kanan & Sistem Sumbu Mesin CNC (X, Y, Z)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Arah pergerakan sumbu mesin CNC ditetapkan secara internasional menggunakan <strong>Kaidah Tangan Kanan (Right Hand Rule)</strong>.
              </p>
            </div>

            {/* VISUAL DIAGRAM SVG KAIDAH TANGAN KANAN & SUMBU 3D */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '16px',
              alignItems: 'center'
            }}>
              {/* SVG Canvas Sumbu 3D */}
              <div style={{
                background: '#0b1329',
                borderRadius: '12px',
                border: '1px solid #1e293b',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', marginBottom: '8px', alignSelf: 'flex-start' }}>
                  📐 SKEMA SUMBU KARTESIUS CNC MILLING (3-AXIS)
                </div>
                <svg viewBox="0 0 380 260" style={{ width: '100%', maxWidth: '380px', height: 'auto' }}>
                  {/* Grid Lines */}
                  <line x1="190" y1="40" x2="190" y2="220" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="60" y1="170" x2="320" y2="170" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Workpiece Box in 3D Isometric */}
                  <polygon points="150,150 230,150 260,120 180,120" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                  <polygon points="150,150 230,150 230,180 150,180" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                  <polygon points="230,150 260,120 260,150 230,180" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <text x="205" y="168" fill="#e2e8f0" fontSize="10" fontWeight="800" textAnchor="middle">BENDA KERJA</text>

                  {/* Z AXIS (Vertical - Spindle) */}
                  <line x1="190" y1="130" x2="190" y2="35" stroke="#ef4444" strokeWidth="3.5" />
                  <polygon points="190,25 183,40 197,40" fill="#ef4444" />
                  <text x="205" y="45" fill="#ef4444" fontSize="13" fontWeight="900">+Z (Naik Melayang)</text>
                  <line x1="190" y1="130" x2="190" y2="210" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 2" />
                  <polygon points="190,218 184,206 196,206" fill="#ef4444" />
                  <text x="205" y="215" fill="#f87171" fontSize="11" fontWeight="800">-Z (Menyayat Turun)</text>

                  {/* X AXIS (Horizontal Left-Right) */}
                  <line x1="190" y1="130" x2="330" y2="130" stroke="#3b82f6" strokeWidth="3.5" />
                  <polygon points="340,130 326,124 326,136" fill="#3b82f6" />
                  <text x="310" y="118" fill="#3b82f6" fontSize="13" fontWeight="900">+X (Kanan)</text>
                  <line x1="190" y1="130" x2="50" y2="130" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4 2" />
                  <polygon points="40,130 54,124 54,136" fill="#3b82f6" />
                  <text x="50" y="148" fill="#93c5fd" fontSize="11" fontWeight="800">-X (Kiri)</text>

                  {/* Y AXIS (Depth Forward-Backward) */}
                  <line x1="190" y1="130" x2="275" y2="70" stroke="#10b981" strokeWidth="3.5" />
                  <polygon points="283,64 268,70 276,78" fill="#10b981" />
                  <text x="280" y="85" fill="#10b981" fontSize="13" fontWeight="900">+Y (Menjauh)</text>
                  <line x1="190" y1="130" x2="115" y2="185" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4 2" />
                  <polygon points="107,191 122,185 114,177" fill="#10b981" />
                  <text x="80" y="200" fill="#6ee7b7" fontSize="11" fontWeight="800">-Y (Mendekat)</text>

                  {/* Origin Indicator */}
                  <circle cx="190" cy="130" r="5" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
                  <text x="175" y="122" fill="#ffffff" fontSize="10" fontWeight="900">W (G54)</text>
                </svg>
              </div>

              {/* Aturan 3 Sumbu & Kaidah Jari */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: '#fef2f2', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.85rem' }}>
                    🔴 Sumbu Z = Jari Tengah (Arah Spindel Vertikal)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#450a0a', marginTop: '2px', lineHeight: 1.5 }}>
                    Sumbu Z <strong>selalu sejajar dengan sumbu putar poros spindel</strong>. Arah <strong>+Z selalu bergerak menjauhi benda kerja</strong> (arah mundur aman), sedangkan <strong>-Z bergerak masuk menyayat material</strong>.
                  </div>
                </div>

                <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.85rem' }}>
                    🔵 Sumbu X = Ibu Jari (Gerakan Longitudinal Meja)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1e3a8a', marginTop: '2px', lineHeight: 1.5 }}>
                    Sumbu X terletak mendatar sejajar bidang meja kerja. Arah <strong>+X bergerak ke kanan</strong> juru mesin, sedangkan <strong>-X bergerak ke kiri</strong>.
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.85rem' }}>
                    🟢 Sumbu Y = Jari Telunjuk (Gerakan Transversal Meja)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#064e3b', marginTop: '2px', lineHeight: 1.5 }}>
                    Sumbu Y tegak lurus terhadap sumbu X dan Z. Arah <strong>+Y bergerak menjauhi operator</strong> (ke arah tiang kolom mesin), sedangkan <strong>-Y bergerak mendekati operator</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATOR KOORDINAT: ABSOLUT (G90) VS INKREMENTAL (G91) */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                  METODE PEMROGRAMAN LINTASAN
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                  📊 Perbandingan Koordinat Absolut (G90) vs Inkremental (G91)
                </h3>
              </div>

              {/* Mode Switcher */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => { sound.playClick(); setCoordMode('absolut'); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: coordMode === 'absolut' ? '2px solid #0284c7' : '1px solid var(--border-light)',
                    background: coordMode === 'absolut' ? '#0284c7' : '#ffffff',
                    color: coordMode === 'absolut' ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Mode Absolut (G90)
                </button>
                <button
                  onClick={() => { sound.playClick(); setCoordMode('inkremental'); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: coordMode === 'inkremental' ? '2px solid #9333ea' : '1px solid var(--border-light)',
                    background: coordMode === 'inkremental' ? '#9333ea' : '#ffffff',
                    color: coordMode === 'inkremental' ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Mode Inkremental (G91)
                </button>
              </div>
            </div>

            {/* Interactive Coordinate Plotter Canvas */}
            <div style={{
              background: '#0b1329',
              borderRadius: '12px',
              border: '1px solid #334155',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {coordMode === 'absolut' 
                    ? '🎯 Sistem Absolut (G90): Semua titik X dan Y SELALU diukur dari satu titik acuan nol tetap (0,0) di pojok kiri bawah.'
                    : '🔄 Sistem Inkremental (G91): Titik tujuan berikutnya dihitung dari POSISI TERAKHIR pisau berada (jarak pergeseran incremental).'
                  }
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                  Klik tombol titik (P1 - P4) di bawah tabel!
                </div>
              </div>

              {/* Grid 2D Plot */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', background: '#030712', borderRadius: '8px', padding: '10px 0' }}>
                <svg viewBox="0 0 500 240" style={{ width: '100%', maxWidth: '520px', height: 'auto' }}>
                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200, 250, 300, 350, 400, 450].map(gx => (
                    <line key={gx} x1={gx+40} y1="20" x2={gx+40} y2="210" stroke="#1f2937" strokeWidth="0.8" />
                  ))}
                  {[0, 30, 60, 90, 120, 150, 180].map(gy => (
                    <line key={gy} x1="30" y1={gy+20} x2="480" y2={gy+20} stroke="#1f2937" strokeWidth="0.8" />
                  ))}

                  {/* Main Axis (0,0) */}
                  <line x1="60" y1="20" x2="60" y2="200" stroke="#4b5563" strokeWidth="2" />
                  <line x1="60" y1="200" x2="460" y2="200" stroke="#4b5563" strokeWidth="2" />
                  <polygon points="468,200 458,196 458,204" fill="#4b5563" />
                  <polygon points="60,12 56,22 64,22" fill="#4b5563" />
                  <text x="470" y="215" fill="#9ca3af" fontSize="11" fontWeight="700">+X (mm)</text>
                  <text x="35" y="16" fill="#9ca3af" fontSize="11" fontWeight="700">+Y (mm)</text>
                  <text x="50" y="215" fill="#f87171" fontSize="12" fontWeight="900">0,0</text>

                  {/* Path Lines Between P1, P2, P3, P4 */}
                  <line x1="60" y1="200" x2="180" y2="200" stroke="#38bdf8" strokeWidth="3" />
                  <line x1="180" y1="200" x2="180" y2="90" stroke="#38bdf8" strokeWidth="3" />
                  <line x1="180" y1="90" x2="340" y2="90" stroke="#38bdf8" strokeWidth="3" />

                  {/* Dimension Indicators if G90 */}
                  {coordMode === 'absolut' && (
                    <g>
                      <line x1="60" y1="225" x2="180" y2="225" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="60" y1="225" x2="340" y2="225" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="120" y="222" fill="#38bdf8" fontSize="10" textAnchor="middle">X40 (dari 0)</text>
                      <text x="260" y="222" fill="#38bdf8" fontSize="10" textAnchor="middle">X80 (dari 0)</text>
                    </g>
                  )}

                  {/* Dimension Indicators if G91 */}
                  {coordMode === 'inkremental' && (
                    <g>
                      <line x1="60" y1="185" x2="180" y2="185" stroke="#c084fc" strokeWidth="1.5" />
                      <text x="120" y="180" fill="#c084fc" fontSize="10" fontWeight="700" textAnchor="middle">ΔX +40</text>
                      <line x1="195" y1="200" x2="195" y2="90" stroke="#c084fc" strokeWidth="1.5" />
                      <text x="225" y="145" fill="#c084fc" fontSize="10" fontWeight="700">ΔY +30</text>
                      <line x1="180" y1="75" x2="340" y2="75" stroke="#c084fc" strokeWidth="1.5" />
                      <text x="260" y="70" fill="#c084fc" fontSize="10" fontWeight="700" textAnchor="middle">ΔX +40</text>
                    </g>
                  )}

                  {/* Points */}
                  <g onClick={() => setSelectedCoordPoint(1)} style={{ cursor: 'pointer' }}>
                    <circle cx="60" cy="200" r="7" fill={selectedCoordPoint === 1 ? '#f59e0b' : '#38bdf8'} stroke="#ffffff" strokeWidth="2" />
                    <text x="45" y="195" fill="#ffffff" fontSize="11" fontWeight="800">P1</text>
                  </g>

                  <g onClick={() => setSelectedCoordPoint(2)} style={{ cursor: 'pointer' }}>
                    <circle cx="180" cy="200" r="7" fill={selectedCoordPoint === 2 ? '#f59e0b' : '#38bdf8'} stroke="#ffffff" strokeWidth="2" />
                    <text x="180" y="185" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle">P2</text>
                  </g>

                  <g onClick={() => setSelectedCoordPoint(3)} style={{ cursor: 'pointer' }}>
                    <circle cx="180" cy="90" r="7" fill={selectedCoordPoint === 3 ? '#f59e0b' : '#38bdf8'} stroke="#ffffff" strokeWidth="2" />
                    <text x="165" y="85" fill="#ffffff" fontSize="11" fontWeight="800">P3</text>
                  </g>

                  <g onClick={() => setSelectedCoordPoint(4)} style={{ cursor: 'pointer' }}>
                    <circle cx="340" cy="90" r="7" fill={selectedCoordPoint === 4 ? '#f59e0b' : '#38bdf8'} stroke="#ffffff" strokeWidth="2" />
                    <text x="340" y="75" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle">P4</text>
                  </g>
                </svg>
              </div>

              {/* Table of Points Comparison */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#e2e8f0', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', borderBottom: '2px solid #334155' }}>
                      <th style={{ padding: '8px' }}>Titik</th>
                      <th style={{ padding: '8px' }}>Kode G90 (Absolut)</th>
                      <th style={{ padding: '8px' }}>Kode G91 (Inkremental)</th>
                      <th style={{ padding: '8px' }}>Keterangan Pergerakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #334155', background: selectedCoordPoint === 1 ? 'rgba(56, 189, 248, 0.15)' : 'transparent' }}>
                      <td style={{ padding: '8px', fontWeight: 800, color: '#f59e0b' }}>P1 (Titik Nol)</td>
                      <td style={{ padding: '8px', color: '#38bdf8', fontWeight: 700 }}>X0.0 Y0.0</td>
                      <td style={{ padding: '8px', color: '#c084fc', fontWeight: 700 }}>X0.0 Y0.0</td>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>Posisi awal titik nol acuan benda kerja (G54)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #334155', background: selectedCoordPoint === 2 ? 'rgba(56, 189, 248, 0.15)' : 'transparent' }}>
                      <td style={{ padding: '8px', fontWeight: 800, color: '#f59e0b' }}>P2</td>
                      <td style={{ padding: '8px', color: '#38bdf8', fontWeight: 700 }}>X40.0 Y0.0</td>
                      <td style={{ padding: '8px', color: '#c084fc', fontWeight: 700 }}>X40.0 Y0.0</td>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>Maju lurus ke kanan sejauh 40 mm pada sumbu X</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #334155', background: selectedCoordPoint === 3 ? 'rgba(56, 189, 248, 0.15)' : 'transparent' }}>
                      <td style={{ padding: '8px', fontWeight: 800, color: '#f59e0b' }}>P3</td>
                      <td style={{ padding: '8px', color: '#38bdf8', fontWeight: 700 }}>X40.0 Y30.0</td>
                      <td style={{ padding: '8px', color: '#c084fc', fontWeight: 700 }}>X0.0 Y30.0</td>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>G90 membaca Y30 dari nol; G91 bergeser +30 dari P2</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #334155', background: selectedCoordPoint === 4 ? 'rgba(56, 189, 248, 0.15)' : 'transparent' }}>
                      <td style={{ padding: '8px', fontWeight: 800, color: '#f59e0b' }}>P4</td>
                      <td style={{ padding: '8px', color: '#38bdf8', fontWeight: 700 }}>X80.0 Y30.0</td>
                      <td style={{ padding: '8px', color: '#c084fc', fontWeight: 700 }}>X40.0 Y0.0</td>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>G90 membaca X80 dari nol; G91 hanya geser +40 dari P3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-MODUL 2: BAGIAN KOMPONEN MESIN CNC (BLUEPRINT INTERAKTIF)       */}
      {/* =================================================================== */}
      {activeTab === 'komponen' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                  ANATOMI MEKATRONIKA CNC
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                  🏗️ Skema Blueprint & Komponen Utama Mesin CNC
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Pilih tipe mesin dan klik komponen pada diagram teknis untuk menginspeksi fungsi, spesifikasi & aturan K3.
                </p>
              </div>

              {/* Machine Type Selector */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { sound.playClick(); setSelectedMachineType('vmc'); setSelectedComponentKey('spindle'); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: selectedMachineType === 'vmc' ? '2px solid #0284c7' : '1px solid var(--border-light)',
                    background: selectedMachineType === 'vmc' ? '#0284c7' : '#ffffff',
                    color: selectedMachineType === 'vmc' ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  CNC Milling (VMC)
                </button>
                <button
                  onClick={() => { sound.playClick(); setSelectedMachineType('lathe'); setSelectedComponentKey('spindle'); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: selectedMachineType === 'lathe' ? '2px solid #ea580c' : '1px solid var(--border-light)',
                    background: selectedMachineType === 'lathe' ? '#ea580c' : '#ffffff',
                    color: selectedMachineType === 'lathe' ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  CNC Lathe (Bubut)
                </button>
              </div>
            </div>

            {/* TECHNICAL BLUEPRINT SVG CANVAS */}
            <div style={{
              background: '#090d16',
              borderRadius: '12px',
              border: '2px solid #1e293b',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>
                  📐 BLUEPRINT DIAGRAM: {currentMach.title}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  💡 Klik salah satu lingkaran pada skema mesin!
                </span>
              </div>

              {/* Blueprint Canvas */}
              <div style={{
                width: '100%',
                background: 'radial-gradient(ellipse at 50% 50%, #1e293b 0%, #030712 100%)',
                borderRadius: '8px',
                border: '1px solid #334155',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px 0'
              }}>
                <svg viewBox="0 0 760 320" style={{ width: '100%', maxWidth: '760px', height: 'auto', display: 'block' }}>
                  <defs>
                    <pattern id="cncGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" />
                    </pattern>
                  </defs>
                  <rect width="760" height="320" fill="url(#cncGrid)" />

                  {/* VMC SCHEMATIC */}
                  {selectedMachineType === 'vmc' && (
                    <g>
                      <rect x="150" y="30" width="460" height="260" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                      <rect x="180" y="50" width="400" height="220" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

                      <rect x="330" y="40" width="100" height="110" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                      <line x1="380" y1="40" x2="380" y2="150" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                      
                      <polygon points="355,150 405,150 395,185 365,185" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                      <rect x="376" y="185" width="8" height="25" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

                      <rect x="250" y="225" width="260" height="35" rx="4" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="270" y1="235" x2="490" y2="235" stroke="#1e293b" strokeWidth="2.5" />
                      <line x1="270" y1="245" x2="490" y2="245" stroke="#1e293b" strokeWidth="2.5" />

                      <rect x="340" y="212" width="80" height="13" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
                      <rect x="360" y="202" width="40" height="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />

                      <ellipse cx="230" cy="110" rx="40" ry="20" fill="#334155" stroke="#fb923c" strokeWidth="2" />
                      <circle cx="210" cy="110" r="4" fill="#fb923c" />
                      <circle cx="230" cy="100" r="4" fill="#fb923c" />
                      <circle cx="250" cy="110" r="4" fill="#fb923c" />
                      <text x="230" y="90" fill="#fb923c" fontSize="9" fontWeight="800" textAnchor="middle">ATC MAGASIN</text>

                      <polygon points="560,90 580,90 580,240 560,240" fill="#334155" stroke="#475569" strokeWidth="1" />
                      <rect x="580" y="80" width="120" height="140" rx="6" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
                      <rect x="592" y="92" width="96" height="55" rx="3" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1" />
                      <text x="640" y="115" fill="#38bdf8" fontSize="8" fontWeight="800" textAnchor="middle">FANUC 0i-MF</text>
                      <text x="640" y="130" fill="#a7f3d0" fontSize="7" textAnchor="middle">MEM: G01 X50.0</text>
                      <circle cx="675" cy="195" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="675" y="212" fill="#ef4444" fontSize="6" fontWeight="900" textAnchor="middle">E-STOP</text>

                      <path d="M 335,160 Q 345,175 365,190" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                      <line x1="365" y1="190" x2="375" y2="200" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />

                      <rect x="180" y="50" width="190" height="220" fill="rgba(56, 189, 248, 0.05)" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
                      <rect x="390" y="50" width="190" height="220" fill="rgba(56, 189, 248, 0.05)" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 2" />
                    </g>
                  )}

                  {/* LATHE SCHEMATIC */}
                  {selectedMachineType === 'lathe' && (
                    <g>
                      <polygon points="120,70 640,70 600,280 80,280" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                      <polygon points="180,100 580,100 550,250 150,250" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

                      <rect x="160" y="110" width="90" height="110" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                      <rect x="250" y="125" width="35" height="80" rx="2" fill="#475569" stroke="#cbd5e1" strokeWidth="1.5" />
                      <rect x="285" y="145" width="160" height="40" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />

                      <polygon points="430,90 480,90 470,150 420,150" fill="#334155" stroke="#fbbf24" strokeWidth="2" />
                      <rect x="395" y="135" width="30" height="10" fill="#94a3b8" stroke="#ffffff" strokeWidth="1" />
                      <polygon points="395,135 385,140 395,145" fill="#ef4444" />
                      <text x="450" y="115" fill="#fbbf24" fontSize="8" fontWeight="800" textAnchor="middle">TURRET 12-T</text>

                      <polygon points="500,140 540,140 550,210 490,210" fill="#334155" stroke="#34d399" strokeWidth="1.5" />
                      <polygon points="460,165 500,155 500,175" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
                      <text x="520" y="180" fill="#34d399" fontSize="8" fontWeight="800" textAnchor="middle">TAILSTOCK</text>

                      <rect x="580" y="50" width="130" height="130" rx="6" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
                      <rect x="590" y="60" width="110" height="50" rx="3" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1" />
                      <text x="645" y="80" fill="#38bdf8" fontSize="8" fontWeight="800" textAnchor="middle">CNC LATHE 2-AXIS</text>
                      <text x="645" y="95" fill="#a7f3d0" fontSize="7" textAnchor="middle">X: Ø50.0  Z: -25.0</text>
                    </g>
                  )}

                  {/* CLICKABLE HOTSPOTS */}
                  {Object.entries(currentMach.components).map(([key, comp]) => {
                    const isSelected = selectedComponentKey === key;
                    return (
                      <g 
                        key={key} 
                        onClick={() => { sound.playClick(); setSelectedComponentKey(key); }}
                        style={{ cursor: 'pointer' }}
                      >
                        {isSelected && (
                          <circle cx={comp.pos.x} cy={comp.pos.y} r="18" fill="none" stroke={comp.color} strokeWidth="2" strokeDasharray="3 3">
                            <animateTransform attributeName="transform" type="rotate" from={`0 ${comp.pos.x} ${comp.pos.y}`} to={`360 ${comp.pos.x} ${comp.pos.y}`} dur="6s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <circle cx={comp.pos.x} cy={comp.pos.y} r="10" fill={isSelected ? comp.color : '#0f172a'} stroke={comp.color} strokeWidth="2" />
                        <circle cx={comp.pos.x} cy={comp.pos.y} r="4" fill={isSelected ? '#ffffff' : comp.color} />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Component Buttons Selector Legenda */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(currentMach.components).map(([key, comp]) => {
                  const isSelected = selectedComponentKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { sound.playClick(); setSelectedComponentKey(key); }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: isSelected ? `2px solid ${comp.color}` : '1px solid #334155',
                        background: isSelected ? comp.color : '#1e293b',
                        color: isSelected ? '#000000' : '#cbd5e1',
                        fontWeight: isSelected ? 900 : 600,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {comp.name.split(' (')[0]}
                    </button>
                  );
                })}
              </div>

              {/* COMPONENT DETAIL INSPECTION CARD */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.85)',
                borderRadius: '10px',
                border: `2px solid ${curComp.color}`,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ background: curComp.color, color: '#000', fontSize: '0.7rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px' }}>
                      INSPEKSI MEKATRONIKA
                    </span>
                    <h4 style={{ margin: '6px 0 2px 0', fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
                      {curComp.name}
                    </h4>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: curComp.color }}>
                      Fungsi Utama: {curComp.role}
                    </div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                  {curComp.desc}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginTop: '4px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: '8px', borderLeft: `3px solid ${curComp.color}` }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800 }}>⚙️ SPESIFIKASI TEKNIS INDUSTRI:</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{curComp.spec}</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                    <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 800 }}>⚠️ K3 & SAFETY OPERATOR:</div>
                    <div style={{ fontSize: '0.82rem', color: '#fed7aa', marginTop: '2px' }}>{curComp.k3Tip}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-MODUL 3: PEMROGRAMAN G-CODE & M-CODE (SIMULATOR LINTASAN)        */}
      {/* =================================================================== */}
      {activeTab === 'gcode' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ANATOMI BLOK PROGRAM G-CODE */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                STANDAR FORMAT DIN 66025 / ISO
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                📝 Anatomi Struktur Satu Baris Blok Program CNC
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Setiap baris kode program CNC disebut <strong>Blok (Block)</strong> yang tersusun dari kombinasi huruf (Word Address) dan angka.
              </p>
            </div>

            {/* Block Anatomy Visual Badges */}
            <div style={{
              background: '#0b1329',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #1e293b',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>
                CONTOH BARIS BLOK PEMAKANAN:
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b' }}>N0030</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Nomor Urut Blok</div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #38bdf8', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8' }}>G01</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Fungsi Gerak Lurus</div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#60a5fa' }}>X50.0 Y25.0</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Koordinat Titik Tujuan</div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f87171' }}>Z-3.0</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Kedalaman Sayat</div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #10b981', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#34d399' }}>F200</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Feed (mm/menit)</div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #ec4899', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f472b6' }}>S2500</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Speed (RPM)</div>
                </div>

                <div style={{ background: '#1e293b', border: '1px solid #a855f7', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#c084fc' }}>M03</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>Fungsi Bantu Spindel</div>
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATOR LINTASAN PAHAT G-CODE STEP-BY-STEP */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                  INTERACTIVE G-CODE TOOLPATH SIMULATOR
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                  🎮 Simulator Eksekusi Kode G Langkah-demi-Langkah
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Pilih skenario program di bawah, lalu jalankan animasi untuk melihat pergerakan mata pahat dan pembacaan kode real-time!
                </p>
              </div>

              {/* Preset Selector */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { sound.playClick(); setSelectedGcodePreset('contour'); setSimStep(0); setIsPlayingSim(false); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: selectedGcodePreset === 'contour' ? '2px solid #0284c7' : '1px solid var(--border-light)',
                    background: selectedGcodePreset === 'contour' ? '#0284c7' : '#ffffff',
                    color: selectedGcodePreset === 'contour' ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Contoh 1: Profil Kotak (G01)
                </button>
                <button
                  onClick={() => { sound.playClick(); setSelectedGcodePreset('circle'); setSimStep(0); setIsPlayingSim(false); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: selectedGcodePreset === 'circle' ? '2px solid #0284c7' : '1px solid var(--border-light)',
                    background: selectedGcodePreset === 'circle' ? '#0284c7' : '#ffffff',
                    color: selectedGcodePreset === 'circle' ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Contoh 2: Radius Melingkar (G02/G03)
                </button>
                <button
                  onClick={() => { sound.playClick(); setSelectedGcodePreset('drill'); setSimStep(0); setIsPlayingSim(false); }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: selectedGcodePreset === 'drill' ? '2px solid #0284c7' : '1px solid var(--border-light)',
                    background: selectedGcodePreset === 'drill' ? '#0284c7' : '#ffffff',
                    color: selectedGcodePreset === 'drill' ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Contoh 3: Siklus Bor (G81)
                </button>
              </div>
            </div>

            {/* SIMULATOR LAYOUT: CANVAS 2D + CODE EDITOR MONITOR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '16px' }}>
              
              {/* Toolpath 2D Canvas */}
              <div style={{
                background: '#090d16',
                borderRadius: '12px',
                border: '1px solid #1e293b',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>
                    🖥️ VISUALISASI LINTASAN MEJA XY
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Titik Saat Ini: <strong style={{ color: '#ffffff' }}>X: {activeLine.x}, Y: {activeLine.y}, Z: {activeLine.z}</strong>
                  </div>
                </div>

                <div style={{ width: '100%', background: '#020617', borderRadius: '8px', border: '1px solid #334155', padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
                  <svg viewBox="0 0 320 240" style={{ width: '100%', maxWidth: '340px', height: 'auto' }}>
                    {/* Grid Lines */}
                    {[40, 80, 120, 160, 200, 240, 280].map(gx => (
                      <line key={gx} x1={gx} y1="20" x2={gx} y2="220" stroke="#1e293b" strokeWidth="0.8" />
                    ))}
                    {[40, 80, 120, 160, 200].map(gy => (
                      <line key={gy} x1="20" y1={gy} x2="300" y2={gy} stroke="#1e293b" strokeWidth="0.8" />
                    ))}

                    {/* Workpiece Base 60x60mm at center (160, 120) */}
                    <rect x="100" y="60" width="120" height="120" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                    {/* Center Axes (0,0) */}
                    <line x1="160" y1="30" x2="160" y2="210" stroke="#4b5563" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="40" y1="120" x2="280" y2="120" stroke="#4b5563" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="160" cy="120" r="4" fill="#ffffff" />
                    <text x="168" y="115" fill="#ffffff" fontSize="9" fontWeight="800">X0 Y0</text>

                    {/* PATHS DRAWING ACCORDING TO PRESET */}
                    {selectedGcodePreset === 'contour' && (
                      <g>
                        <line x1="160" y1="120" x2="100" y2="180" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
                        <rect x="100" y="60" width="120" height="120" fill="none" stroke="#38bdf8" strokeWidth="3" />
                      </g>
                    )}

                    {selectedGcodePreset === 'circle' && (
                      <g>
                        <line x1="160" y1="120" x2="85" y2="120" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
                        <circle cx="160" cy="120" r="75" fill="none" stroke="#f59e0b" strokeWidth="3" />
                      </g>
                    )}

                    {selectedGcodePreset === 'drill' && (
                      <g>
                        <circle cx="110" cy="170" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="210" cy="170" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="210" cy="70" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="110" cy="70" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    )}

                    {/* ANIMATED TOOL POSITION */}
                    <g>
                      <circle 
                        cx={160 + (activeLine.x * 2.4)} 
                        cy={120 - (activeLine.y * 2.4)} 
                        r="10" 
                        fill={activeLine.z < 0 ? '#ef4444' : '#38bdf8'} 
                        fillOpacity="0.8" 
                        stroke="#ffffff" 
                        strokeWidth="2" 
                      />
                      <circle 
                        cx={160 + (activeLine.x * 2.4)} 
                        cy={120 - (activeLine.y * 2.4)} 
                        r="3" 
                        fill="#ffffff" 
                      />
                      <text 
                        x={160 + (activeLine.x * 2.4)} 
                        y={140 - (activeLine.y * 2.4)} 
                        fill="#ffffff" 
                        fontSize="9" 
                        fontWeight="900" 
                        textAnchor="middle"
                      >
                        TOOL
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Status Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
                  <div style={{ background: '#1e293b', padding: '6px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>X AXIS</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>{activeLine.x} mm</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '6px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Y AXIS</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399' }}>{activeLine.y} mm</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '6px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Z AXIS</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: activeLine.z < 0 ? '#ef4444' : '#fbbf24' }}>{activeLine.z} mm</div>
                  </div>
                  <div style={{ background: '#1e293b', padding: '6px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>STATUS</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: activeLine.z < 0 ? '#ef4444' : '#a78bfa' }}>
                      {activeLine.z < 0 ? 'CUTTING' : 'RAPID'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Monitor & Step-by-Step Playback */}
              <div style={{
                background: '#090d16',
                borderRadius: '12px',
                border: '1px solid #1e293b',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>
                    📜 PROGRAM BUFFER (ACTIVE G-CODE)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Baris {simStep + 1} dari {curLines.length}
                  </span>
                </div>

                {/* Lines scroll window */}
                <div style={{
                  background: '#020617',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  padding: '8px',
                  height: '180px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontFamily: 'monospace'
                }}>
                  {curLines.map((l, idx) => {
                    const isActive = idx === simStep;
                    return (
                      <div
                        key={idx}
                        onClick={() => { sound.playClick(); setSimStep(idx); setIsPlayingSim(false); }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: isActive ? '#0284c7' : 'transparent',
                          color: isActive ? '#ffffff' : '#94a3b8',
                          fontWeight: isActive ? 800 : 500,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{l.code}</span>
                        {isActive && <span style={{ fontSize: '0.68rem', color: '#fef08a' }}>◀ AKTIF</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation of current active line */}
                <div style={{ background: 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '8px', padding: '10px 14px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800 }}>
                    💡 PENJELASAN BARIS BLOK AKTIF:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 700, marginTop: '2px' }}>
                    {activeLine.code}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px', lineHeight: 1.4 }}>
                    {activeLine.desc}
                  </div>
                </div>

                {/* Controller Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsPlayingSim(!isPlayingSim);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      background: isPlayingSim ? '#ef4444' : '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{isPlayingSim ? '⏸ Jeda' : '▶ Jalankan Siklus'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsPlayingSim(false);
                      setSimStep(prev => Math.max(0, prev - 1));
                    }}
                    disabled={simStep === 0}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      color: '#e2e8f0',
                      border: '1px solid #475569',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: simStep === 0 ? 'not-allowed' : 'pointer',
                      opacity: simStep === 0 ? 0.5 : 1
                    }}
                  >
                    ⏮ Mundur
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsPlayingSim(false);
                      setSimStep(prev => Math.min(curLines.length - 1, prev + 1));
                    }}
                    disabled={simStep === curLines.length - 1}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#1e293b',
                      color: '#e2e8f0',
                      border: '1px solid #475569',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: simStep === curLines.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: simStep === curLines.length - 1 ? 0.5 : 1
                    }}
                  >
                    Maju ⏭
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsPlayingSim(false);
                      setSimStep(0);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#334155',
                      color: '#e2e8f0',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Reset
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* KAMUS KODE G & M LENGKAP */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                  REFERENSI LENGKAP BENGKEL
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                  📖 Kamus Kode G & Kode M Standar Industri
                </h3>
              </div>

              {/* Filter Buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all_g', label: 'Semua Kode G' },
                  { id: 'motion', label: 'Gerak (G00-G04)' },
                  { id: 'coord', label: 'Koordinat (G90/G91/G54)' },
                  { id: 'm_code', label: 'Kode M (Fungsi Bantu)' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { sound.playClick(); setActiveCodeCategory(cat.id); }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: activeCodeCategory === cat.id ? '2px solid #0284c7' : '1px solid var(--border-light)',
                      background: activeCodeCategory === cat.id ? '#0284c7' : '#ffffff',
                      color: activeCodeCategory === cat.id ? '#ffffff' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of G Codes */}
            {activeCodeCategory !== 'm_code' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '12px' }}>
                {G_CODES_LIST
                  .filter(item => activeCodeCategory === 'all_g' || item.cat === activeCodeCategory)
                  .map(item => (
                    <div 
                      key={item.code} 
                      style={{ 
                        background: '#ffffff', 
                        padding: '14px', 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0', 
                        borderLeft: '4px solid #0284c7',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0284c7' }}>
                          {item.code}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#f0f9ff', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {item.name}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
                        {item.desc}
                      </p>
                      <div style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#0f172a', fontWeight: 700 }}>
                        {item.example}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* List of M Codes */}
            {activeCodeCategory === 'm_code' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '12px' }}>
                {M_CODES_LIST.map(item => (
                  <div 
                    key={item.code} 
                    style={{ 
                      background: '#ffffff', 
                      padding: '14px', 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0', 
                      borderLeft: '4px solid #9333ea',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#9333ea' }}>
                        {item.code}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#faf5ff', color: '#7e22ce', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {item.name}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default CNCTheoryGuide;

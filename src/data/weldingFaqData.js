// DATABASE TANYA JAWAB (FAQ) & KOMPARASI METALURGI PENGELASAN INDUSTRI
// Sesuai Standar AWS (American Welding Society), ASME IX, dan ISO 14175

export const FAQ_CATEGORIES = [
  { id: 'all', label: 'Semua Tanya Jawab', count: 10, icon: '📋' },
  { id: 'mig_mag', label: 'MIG vs MAG', count: 3, icon: '⚡' },
  { id: 'metalurgi', label: 'Gas & Metalurgi Logam', count: 3, icon: '🧪' },
  { id: 'pemilihan', label: 'Pemilihan Proses (SMAW / MIG / TIG)', count: 3, icon: '⚖️' },
  { id: 'tig_acdc', label: 'TIG & Karakteristik Arus', count: 3, icon: '🎯' },
  { id: 'k3_oven', label: 'K3, Oven & Keselamatan Gas', count: 2, icon: '🛡️' }
];

export const FAQ_ITEMS = [
  {
    id: 1,
    categories: ['mig_mag', 'pemilihan'],
    categoryLabel: 'MIG vs MAG',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    badgeBorder: '#93c5fd',
    question: 'Apa perbedaan mendasar antara pengelasan MIG (Metal Inert Gas) dan MAG (Metal Active Gas)?',
    subtitle: 'Perbedaan utama terletak pada sifat kimiawi gas pelindung terhadap kawah las cair—MIG bersifat pasif murni tanpa reaksi, sedangkan MAG bereaksi aktif mempengaruhi metalurgi sambungan.',
    highlights: [
      'MIG: Menggunakan gas mulia murni (Argon 99.99% atau Helium) yang tidak bereaksi secara kimiawi pada suhu busur.',
      'MAG: Menggunakan gas aktif reaktif (CO₂ murni atau campuran Ar + CO₂ / Ar + O₂) yang mengalami disosiasi termal di kawah cair.',
      'Keduanya sama-sama masuk klasifikasi GMAW (Gas Metal Arc Welding) dan memakai mesin kawat gulungan (wire feeder) yang sama.'
    ],
    table: {
      title: 'Tabel Perbandingan Komprehensif MIG vs MAG',
      headers: ['Parameter / Aspek', 'MIG (Metal Inert Gas)', 'MAG (Metal Active Gas)'],
      rows: [
        ['Sifat Gas Pelindung', 'Inert murni (Gas mulia, valensi penuh, non-reaktif)', 'Aktif / Reaktif (bereaksi secara termal & kimiawi)'],
        ['Komposisi Gas Populer', '100% Argon murni, atau Ar + 25-50% Helium', '100% CO₂, Ar + 18-25% CO₂, atau Ar + 2-5% O₂'],
        ['Material Kerja Utama', 'Aluminium, Paduan Tembaga, Nikel, Titanium (Non-Ferro)', 'Baja Karbon Lunak (Mild Steel / MS), Baja Struktural (Ferro)'],
        ['Pola Penetrasi Las', 'Sempit menusuk di tengah (finger-like penetration)', 'Mangkuk lebar dan dalam (deep bowl-shaped penetration)'],
        ['Tegangan Permukaan Cairan', 'Sangat tinggi pada baja (cenderung menggumpal/roping)', 'Rendah (pembasahan/wetting tepi sangat licin & mulus)'],
        ['Reaksi Kimia di Kawah', 'Nol (Hanya isolasi fisik mengusir udara luar)', 'Disosiasi CO₂ → CO + O (melepas panas rekombinasi)'],
        ['Biaya Gas Pelindung', 'Relatif mahal (3x – 5x lebih tinggi dari CO₂)', 'Sangat ekonomis dan mudah didapatkan di pasaran'],
        ['Standar Kawat Elektroda', 'AWS A5.10 (ER4043, ER5356 untuk Aluminium)', 'AWS A5.18 (ER70S-6 dengan deoksidator Mn & Si)']
      ]
    },
    detail: `Secara struktural dan mekanikal, mesin las MIG dan MAG adalah mesin yang sama (GMAW). Perbedaannya murni terletak pada tabung gas pelindung yang dipasang ke regulator.
    
Gas inert murni (MIG) memiliki kulit elektron valensi oktet yang sangat stabil, sehingga atom-atomnya tidak akan berikatan atau melepaskan elektron dengan cairan logam pada suhu busur 3.000°C – 6.000°C. Hal ini mutlak diperlukan saat mengelas logam yang sangat reaktif seperti Aluminium.
    
Sebaliknya, pada MAG, gas CO₂ atau penambahan oksigen sengaja dimanfaatkan secara reaktif untuk menurunkan tegangan permukaan cairan baja dan menghasilkan penetrasi yang kokoh pada konstruksi baja karbon.`,
    proTip: 'Di bengkel-bengkel umum sering disebut "Las CO2" untuk MAG baja karbon, dan "Las Argon" untuk MIG aluminium atau stainless.',
    standards: 'AWS D1.1 (Structural Steel), AWS C5.6 (GMAW Recommended Practice), ISO 14175 (Gas Shielding Classification).'
  },
  {
    id: 2,
    categories: ['mig_mag', 'metalurgi'],
    categoryLabel: 'Gas & Metalurgi',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    badgeBorder: '#a7f3d0',
    question: 'Mengapa MAG (CO₂ / Ar+CO₂) digunakan khusus untuk Baja Karbon (Mild Steel)? Mengapa tidak memakai Argon murni saja?',
    subtitle: 'Disosiasi termal gas CO₂ menghasilkan penetrasi mangkuk dalam, menurunkan tegangan permukaan cairan baja (good wetting), dan deoksidasi kawat ER70S-6 menjamin hasil bebas porositas dengan biaya hemat.',
    highlights: [
      'Penetrasi Mangkuk Dalam: Disosiasi CO₂ → CO + O melepaskan panas rekombinasi dahsyat di kawah baja, melebur dinding kampuh secara utuh.',
      'Wetting Action Sempurna: CO₂ menurunkan tegangan permukaan cairan baja sehingga rigi las mengalir rata dan tidak membentuk undercut tajam.',
      'Deoksidasi Terencana: Kawat ER70S-6 mengandung Mangan (Mn) dan Silikon (Si) tinggi yang mengikat oksigen bebas menjadi mikroslag tak berbahaya.',
      'Masalah Argon Murni pada Baja: Menghasilkan penetrasi tirus sempit (finger penetration), fusi dinding samping buruk, dan rigi menggumpal tinggi (roping).'
    ],
    detail: `Ada 3 alasan ilmiah dan metalurgi mendasar:

1. TERMODINAMIKA & BENTUK PENETRASI BUSUR:
Pada suhu busur las (> 3.000°C), molekul CO₂ menyerap energi busur dan mengalami disosiasi endotermik:
CO₂ ➔ CO + O
Saat gas mengalir turun dan menyentuh permukaan plat baja yang suhunya lebih dingin (± 1.600°C), atom-atom tersebut mengalami rekombinasi eksotermik menjadi molekul CO₂ kembali sembari membebaskan energi panas kalor yang sangat besar langsung di dasar kawah las. Fenomena ini menciptakan penetrasi mangkuk yang lebar dan dalam (bowl-shaped penetration), menjamin fusi dinding kampuh yang sempurna.
Sebaliknya, bila baja karbon dilas dengan Argon murni, busur membentuk kolom sempit runcing (finger-like penetration). Bagian tengah menembus dalam tapi sisi kiri-kanan tidak melebur sempurna, memicu cacat Lack of Side-Wall Fusion.

2. TEGANGAN PERMUKAAN & PEMBASAHAN (WETTING ACTION):
Baja cair di bawah selubung Argon murni memiliki tegangan permukaan (surface tension) yang sangat tinggi. Cairan las enggan mengalir ke tepi dan cenderung menggumpal tinggi membentuk penampang seperti tali tambang tebal (roping bead) dengan parit tajam di kakinya (undercut).
Gas aktif CO₂ (atau penambahan 2-5% O₂) secara drastis menurunkan tegangan permukaan cairan baja, sehingga cairan mengalir licin dan membasahi (wetting) tepi plat dengan sudut transisi landai yang kuat terhadap beban lelah (fatigue strength).

3. SISTEM DEOKSIDASI ELEKTRODA ER70S-6:
Kawat las baja karbon ER70S-6 sengaja dirancang mengandung Mangan (Mn 1.40 - 1.85%) dan Silikon (Si 0.80 - 1.15%). Zat ini bertindak sebagai pemulung oksigen (oxygen scavenger):
Mn + O ➔ MnO
Si + 2O ➔ SiO₂
Oksida MnO dan SiO₂ ini memiliki berat jenis lebih ringan daripada baja cair, sehingga mengapung ke permukaan jalur lasan sebagai bercak kaca coklat mengkilap (silica islands) yang mudah dikelupas, meninggalkan logam las murni tanpa cacat porositas.`,
    proTip: 'Untuk hasil optimal pada baja tebal di industri fabrikasi, gunakan gas campuran Ar 80% + CO₂ 20% (Arcal 21 / Corgon). Campuran ini menggabungkan busur tenang minim spatter dari Argon dengan penetrasi dan fusi sempurna dari CO₂!',
    standards: 'AWS A5.18 (ER70S-6 Chemical Composition), ASME Section IX QW-404.'
  },
  {
    id: 3,
    categories: ['metalurgi', 'mig_mag'],
    categoryLabel: 'Metalurgi Logam',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2',
    badgeBorder: '#fecaca',
    question: 'Mengapa pengelasan logam Non-Ferro (Aluminium) WAJIB menggunakan MIG (Argon murni) dan DILARANG KERAS memakai gas MAG?',
    subtitle: 'Aluminium memiliki afinitas ekstrem terhadap oksigen; gas aktif CO₂ seketika membakar kawah aluminium menjadi kerak refraktori Al₂O₃ (titik lebur 2.072°C) yang memicu porositas spons dan patah getas!',
    highlights: [
      'Alumina Refraktori: Aluminium terbakar membentuk Al₂O₃ dengan titik leleh 2.072°C—hampir 3x lipat titik lebur logam aluminium induk (660°C).',
      'Kerak Tidak Melebur: Kerak Al₂O₃ mengapung keras di dalam cairan las, menghalangi penggabungan logam induk dan kawat (Lack of Fusion total).',
      'Porositas Masif: Reaksi aktif menghasilkan gelembung gas terjebak berulang kali di seluruh sambungan, menyebabkan struktur seperti spons rapuh.',
      'Kewajiban Mutlak: Pengelasan Aluminium WAJIB 100% menggunakan Gas Inert Murni (Argon 99.99% atau Ar + He).'
    ],
    detail: `Aluminium (Al) adalah logam dengan afinitas termodinamika terhadap oksigen yang paling kuat di antara logam-logam struktural industri.

BENCANA METALURGI BILA TERKENA GAS MAG (CO₂ / O₂):
1. Titik lebur logam paduan Aluminium hanyalah 660°C.
2. Namun, saat atom Aluminium kontak dengan gas aktif CO₂ pada suhu busur las (> 3.000°C), Aluminium bereaksi secara eksplosif membentuk lapisan oksida Aluminium Oksida:
4Al + 3CO₂ ➔ 2Al₂O₃ + 3C
3. Senyawa Al₂O₃ (alumina) ini adalah material keramik refraktori tahan api yang memiliki titik lebur sangat tinggi, yaitu 2.072°C!
4. Karena panas busur pengelasan aluminium dirancang untuk suhu kerja rendah (di bawah 1.000°C), lapisan Al₂O₃ sama sekali TIDAK BISA MELELEH!
5. Lapisan ini membentuk kulit kerak padat di atas kawah las yang mencegah cairan filler rod membasahi logam induk. Karbon bebas yang terbentuk juga mencemari sambungan.
6. Gas yang terperangkap menciptakan cacat porositas busa (spongy porosity). Sambungan las akan rapuh seperti kapur tulis dan patah seketika saat menerima getaran kecil.

Oleh karena itu, pengelasan aluminium, paduan magnesium, titanium, dan tembaga murni WAJIB menggunakan gas pelindung 100% Argon murni (Ultra High Purity 99.99%) atau campuran Argon-Helium tanpa molekul oksigen sama sekali!`,
    proTip: 'Sebelum mengelas aluminium, sikat permukaan kampuh menggunakan sikat kawat stainless steel khusus aluminium (jangan bekas menyikat besi!) untuk membuang lapisan oksida awal.',
    standards: 'AWS D1.2 (Structural Welding Code - Aluminum), ISO 18273.'
  },
  {
    id: 4,
    categories: ['pemilihan'],
    categoryLabel: 'Pemilihan Proses',
    badgeColor: '#ea580c',
    badgeBg: '#fff7ed',
    badgeBorder: '#fed7aa',
    question: 'Kapan kita harus memilih antara MIG/MAG dengan SMAW (Stick Welding)?',
    subtitle: 'Pilih SMAW untuk pekerjaan outdoor/konstruksi lapangan tahan angin dan material berkarat; pilih MIG/MAG untuk bengkel produksi indoor berkecepatan tinggi tanpa terak.',
    highlights: [
      'Pilih SMAW (MMA): Proyek lapangan terbuka (outdoor), berangin kencang, elevasi tinggi, material agak kotor/berkarat, mobilitas tinggi tanpa tabung berat.',
      'Pilih MIG/MAG (GMAW): Bengkel pabrikasi tertutup (indoor), lini produksi massal, plat tipis hingga menengah, kuota harian tinggi (efisiensi deposisi 95% vs SMAW 65%).'
    ],
    table: {
      title: 'Matriks Keputusan: SMAW vs MIG/MAG di Lapangan Industri',
      headers: ['Faktor Penentu', 'Pilih SMAW (Stick Welding)', 'Pilih MIG/MAG (GMAW)'],
      rows: [
        ['Lokasi Pekerjaan', 'Outdoor, lapangan terbuka, atap gedung, perancah tinggi', 'Indoor workshop, pabrik karoseri, bengkel fabrikasi tertutup'],
        ['Ketahanan Cuaca & Angin', 'Sangat tahan hembusan angin (fluks padat melebur di busur)', 'Sangat rentan angin (kecepatan angin > 5 km/jam meniup gas)'],
        ['Kondisi Permukaan Plat', 'Toleran terhadap karat ringan, cat sisa, kerak giling (mill scale)', 'Wajib bersih tuntas dari minyak, cat, dan karat tebal'],
        ['Efisiensi Deposisi Logam', 'Rendah (± 60 - 65% karena puntung kawat las terbuang & terak)', 'Sangat tinggi (± 93 - 98%, kawat gulungan habis terpakai)'],
        ['Waktu Pembersihan Terak', 'Lama (wajib memahat kerak slag tebal di setiap lintasan)', 'Hampir nol (hanya lapisan tipis mikrosilika yang mudah disikat)'],
        ['Kemudahan Manuver Welder', 'Sangat tinggi (hanya membawa tang las & kabel panjang)', 'Sedang-Rendah (terikat tabung gas 60 kg dan unit wire feeder)'],
        ['Pengelasan Plat Sangat Tipis', 'Sulit di bawah 1.6 mm (cenderung mudah bolong/burn-through)', 'Sangat mudah (bisa mengelas plat mobil 0.7 mm – 1.2 mm)']
      ]
    },
    detail: `Secara praktis di industri konstruksi Indonesia:
Jika Anda membangun jembatan di tengah hutan, memasang instalasi pipa migas di pedalaman, atau memperbaiki kapal di dock terbuka pelabuhan, SMAW adalah raja karena peralatannya tahan banting dan tidak bergantung pada pasokan tabung gas pelindung.
Namun jika Anda memproduksi gerbong kereta, bak truk kontainer, tangki solar di dalam pabrik, atau perakitan sepeda motor, MIG/MAG adalah pilihan wajib karena memberikan penghematan biaya tenaga kerja hingga 60% berkat kecepatan laju penimbunan (deposition rate) yang tiada tanding.`,
    proTip: 'Jika harus mengelas konstruksi luar ruangan dengan kecepatan kawat gulung kontinu, gunakan proses alternatif FCAW-S (Flux Cored Arc Welding - Self Shielded) yang tidak memerlukan tabung gas eksternal!',
    standards: 'AWS D1.1 (Structural Steel), API 1104 (Welding of Pipelines).'
  },
  {
    id: 5,
    categories: ['pemilihan', 'tig_acdc'],
    categoryLabel: 'Pemilihan Proses',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    badgeBorder: '#ddd6fe',
    question: 'Kapan kita memilih TIG (GTAW) dibandingkan MIG/MAG atau SMAW?',
    subtitle: 'TIG dipilih saat kualitas sambungan mutlak bebas cacat (High-Integrity 100% X-Ray NDT), root pass pipa bertekanan, instalasi makanan/farmasi food-grade, serta material kedirgantaraan.',
    highlights: [
      'Penembusan Akar Pipa (Root Pass): Kendali visual lubang kunci (keyhole) terbaik untuk penetrasi bagian dalam pipa migas yang bulat mulus.',
      'Higienitas & Estetika Bersih: Tanpa percikan spatter sama sekali dan tanpa terak, standar mutlak industri makanan (food-grade) & farmasi.',
      'Logam Khusus & Eksotis: Pilihan utama untuk Stainless Steel 316L, Titanium, Inconel, Monel, dan Aluminium tipis presisi.',
      'Plat Ultra Tipis: Arus mikro stabil hingga 5 Ampere untuk lembaran logam 0.5 mm tanpa distorsi.'
    ],
    detail: `Meskipun TIG memiliki laju pengisian logam yang paling lambat di antara semua proses las busur listrik, TIG tetap tak tergantikan di sektor-sektor kritis:

1. ONE-SIDE ROOT PASS PIPA TEKANAN TINGGI (HIGH PRESSURE PIPING):
Pada pipa boiler PLTU, kilang minyak, dan pipa uap bertekanan > 100 bar, akar lasan (root) bagian dalam pipa tidak boleh memiliki tonjolan tajam, kerak, atau kurang fusi yang dapat memicu turbulensi fluida dan korosi erosi. Juru las TIG dapat mengamati dan mengontrol pembentukan rigi dalam (penetration bead) dengan presisi mikrometer.

2. STANDAR SANITASI FOOD GRADE & MEDIS:
Industri pengolahan susu, bir, obat-obatan, dan instrumen bedah wajib memakai baja tahan karat (Stainless Steel 304L/316L). Percikan spatter dari SMAW atau MAG dapat menjadi titik awal tumbuhnya bakteri atau karat korosi sumuran (pitting corrosion). TIG menghasilkan sambungan higienis steril yang cermin halus.

3. KEDIRGANTARAAN (AEROSPACE) & OTOMOTIF BALAP:
Rangka pesawat terbang, pipa knalpot titanium supercar, dan sasis Chromoly 4130 membutuhkan rasio kekuatan terhadap bobot yang optimal tanpa cacat mikroskopis. TIG memberikan input panas terkonsentrasi yang meminimalkan daerah terpengaruh panas (HAZ) sehingga logam tidak kehilangan kekuatannya.`,
    proTip: 'Kombinasi standar di industri pipa migas: Lapisan akar (Root Pass) dan lapisan panas (Hot Pass) menggunakan TIG, kemudian lapisan pengisi (Fill Pass) dan penutup (Cap Pass) dilanjutkan menggunakan SMAW Low-Hydrogen LB-52U atau kawat kawat FCAW.',
    standards: 'ASME Boiler and Pressure Vessel Code (BPVC) Section VIII & IX, AWS D18.1 (Sanitary Tube Applications).'
  },
  {
    id: 6,
    categories: ['tig_acdc'],
    categoryLabel: 'TIG & Karakteristik Arus',
    badgeColor: '#0891b2',
    badgeBg: '#ecfeff',
    badgeBorder: '#a5f3fc',
    question: 'Mengapa pengelasan Aluminium dengan TIG (GTAW) wajib menggunakan arus AC (Bolak-Balik) dan bukan arus DC?',
    subtitle: 'Siklus positif AC menghasilkan aksi pembersihan katodik (Cathodic Cleaning) memecah lapisan oksida Al₂O₃, sedangkan siklus negatif memberikan penetrasi panas lebur yang dalam.',
    highlights: [
      'Masalah DCEN (DC-): Panas terkonsentrasi di plat (penetrasi bagus), tapi tidak ada pembersihan oksida sama sekali; cairan tertutup kulit keras Al₂O₃.',
      'Masalah DCEP (DC+): Pembersihan oksida sangat kuat, tapi 70% panas menghantam jarum tungsten hingga meleleh bulat dan hancur.',
      'Solusi AC (Alternating Current): Menggabungkan kedua keunggulan secara bergantian 50-120 kali per detik.',
      'Fitur Modern AC Balance: Menyeimbangkan persentase pembersihan (Cleaning %) vs persentase penetrasi (Penetration %).'
    ],
    detail: `Untuk memahami hal ini, kita harus melihat perilaku elektron dan ion gas pada masing-masing polaritas:

1. BILA MENGGUNAKAN DCEN (Direct Current Electrode Negative / Polaritas Lurus):
• Jarum tungsten bermuatan negatif (-), benda kerja plat aluminium bermuatan positif (+).
• Aliran elektron menembak deras dari jarum tungsten menuju plat aluminium.
• 70% panas busur berada di benda kerja, menghasilkan penetrasi yang sangat bagus. Jarum tungsten tetap runcing dan dingin.
• KELEMAHAN FATAL: Elektron keluar dari tungsten menuju plat, sehingga tidak ada partikel berat yang menumbuk lapisan oksida Al₂O₃ di permukaan plat. Akibatnya, lapisan keras Al₂O₃ (titik leleh 2.072°C) tetap utuh menutupi kawah las. Cairan aluminium di bawahnya tidak bisa menyatu dengan kawat filler!

2. BILA MENGGUNAKAN DCEP (Direct Current Electrode Positive / Polaritas Balik):
• Jarum tungsten bermuatan positif (+), plat aluminium bermuatan negatif (-).
• Elektron menembak keluar dari plat menuju jarum tungsten.
• Ion-ion Argon (Ar+) yang bermassa berat ditarik dengan kecepatan tinggi menumbuk permukaan plat aluminium. Tumbukan ion berat ini bertindak seperti semprotan pasir mikro (sandblasting) yang menghancurkan dan mengangkat lapisan oksida Al₂O₃. Fenomena ini disebut PEMBERSIHAN KATODIK (Cathodic Cleaning Action).
• KELEMAHAN FATAL: 70% energi panas busur listrik berkumpul di ujung jarum tungsten. Jarum tungsten seketika meleleh menjadi bola bulat besar, terbakar habis, dan kawah las tercemar serpihan wolfram.

3. SOLUSI CERDAS: ARUS BOLAK-BALIK (AC):
Pada gelombang arus AC, arah arus berbalik secara teratur:
• Saat siklus Positif (EP): Melakukan pembersihan katodik memecah kulit oksida Al₂O₃.
• Saat siklus Negatif (EN): Memberikan penetrasi panas lebur ke dalam plat dan memberi waktu jeda bagi jarum tungsten untuk mendingin.

PENGATURAN AC BALANCE PADA MESIN INVERTER TIG MODERN:
Mesin TIG modern memungkinkan juru las mengatur persentase siklus EN vs EP (misal 70% EN dan 30% EP). Dengan setelan 70% EN, juru las mendapatkan penetrasi yang dalam dan jarum tungsten tetap tajam, dengan pembersihan oksida yang cukup ditandai adanya garis putih bersih (etched zone) selebar 1-2 mm di tepi rigi las.`,
    proTip: 'Gunakan elektroda tungsten Pure Tungsten (kode warna hijau / EWP) atau Zirconiated (coklat / EWZr) pada mesin trafo lama, atau Ceriated (abu-abu / EWCe-2) dan Lanthanated (emas / EWLa-1.5) pada mesin inverter TIG AC modern.',
    standards: 'AWS C5.5 (Recommended Practices for GTAW), ISO 6848 (Tungsten Electrodes).'
  },
  {
    id: 7,
    categories: ['tig_acdc'],
    categoryLabel: 'TIG & Cacat Las',
    badgeColor: '#b45309',
    badgeBg: '#fffbeb',
    badgeBorder: '#fde68a',
    question: 'Apa itu cacat "Tungsten Inclusion" pada las TIG dan bagaimana cara mencegahnya?',
    subtitle: 'Terjebaknya partikel logam wolfram (titik lebur 3.422°C) di dalam kawah las, tampak sebagai bintik putih terang pada foto X-Ray NDT dan menyebabkan penolakan uji kualifikasi.',
    highlights: [
      'Penyebab 1: Ujung jarum tungsten mencelup ke kolam las cair karena jarak busur terlalu dekat atau tangan gemetar.',
      'Penyebab 2: Kawat filler menyentuh jarum tungsten yang sedang membara panas.',
      'Penyebab 3: Arus Ampere disetel melebihi batas daya hantar diameter elektroda tungsten.',
      'Pencegahan: Gunakan HF Start tanpa sentuh, asah tungsten secara longitudinal, dan pertahankan jarak busur 1.5 - 2.5 mm.'
    ],
    detail: `Wolfram (Tungsten) adalah logam dengan titik lebur tertinggi di dunia (3.422°C) dengan massa jenis yang sangat padat (19.25 g/cm³).

MENGAPA SANGAT BERBAHAYA DALAM UJI NDT?
Karena massa jenis tungsten jauh lebih padat daripada baja atau aluminium, partikel tungsten yang tertanam di logam lasan akan menyerap sinar rontgen secara total pada uji Radiographic Testing (RT / X-Ray). Cacat ini akan terlihat sangat jelas sebagai bintik putih terang benderang dengan tepi tajam di film rontgen.
Tungsten inclusion bertindak sebagai konsentrator tegangan (notch stress concentration) yang menjadi titik awal retakan lelah (fatigue crack).

LANGKAH PENCEGAHAN PRAKTIS:
1. METODE PENYALAAN BUSUR:
Hindari menyalakan busur dengan cara menggoreskan ujung jarum ke plat (Scratch Start). Gunakan fitur High Frequency (HF Start) atau Lift-Arc yang menyalakan busur plasma secara non-kontak tanpa menyentuhkan tungsten ke plat.
2. TEKNIK MENGASAH TUNGSTEN:
Asah ujung jarum tungsten secara memanjang (longitudinal grinding), searah dengan sumbu elektroda. Jangan diasah melintang karena goresan melintang memicu busur listrik melompat liar dan menyebabkan ujung jarum rontok.
3. BATAS KAPASITAS ARUS:
Sesuaikan diameter tungsten dengan arus kerja:
• Dia 1.6 mm: Maksimal 130 A (DCEN) / 100 A (AC)
• Dia 2.4 mm: Maksimal 220 A (DCEN) / 160 A (AC)
• Dia 3.2 mm: Maksimal 300 A (DCEN) / 240 A (AC)
4. TINDAKAN PERBAIKAN BILA TERSENTUH:
Jika ujung tungsten tidak sengaja menyentuh kawah cair atau kawat filler, SEGERA HENTIKAN PENGELASAN! Matikan busur, potong ujung tungsten yang terkontaminasi, asah ulang, dan cungkil/gerinda kawah las yang terkena kotoran wolfram sebelum melanjutkan pekerjaan.`,
    proTip: 'Sediakan 4-5 batang jarum tungsten yang sudah diasah tajam sebelum mulai bekerja, sehingga jika terjadi kontaminasi, juru las cukup mengganti jarum cadangan tanpa membuang waktu mengasah bolak-balik.',
    standards: 'ASME Section IX QW-510, ISO 5817 Level B (Quality levels for imperfections).'
  },
  {
    id: 8,
    categories: ['k3_oven'],
    categoryLabel: 'K3 & Prosedur Oven',
    badgeColor: '#b91c1c',
    badgeBg: '#fef2f2',
    badgeBorder: '#fecaca',
    question: 'Mengapa elektroda Low-Hydrogen (AWS E7018 / LB-52) WAJIB disimpan di dalam oven pemanas?',
    subtitle: 'Mencegah fenomena Retak Dingin Tertunda (Hydrogen-Induced Cracking / Underbead Cracking) pada baja tegangan tinggi yang baru pecah 24 - 72 jam setelah pengelasan selesai!',
    highlights: [
      'Sifat Higroskopis: Fluks kapur kalsium karbonat menyerap molekul air (H₂O) dari kelembaban udara terbuka.',
      'Disosiasi Hidrogen: Panas busur menguraikan air menjadi atom hidrogen bebas (H) yang terlarut ke dalam kawah cair.',
      'Retak Tertunda (Delayed Cracking): Saat struktur mikro mendingin menjadi martensit, gas H₂ memicu tegangan internal ekstrem yang meledakkan sambungan dari dalam.',
      'SOP Oven: Baking pada 300°C – 350°C selama 1 jam, lalu simpan di holding oven 120°C – 150°C, dan bawa ke lapangan dengan termos quiver 100°C.'
    ],
    detail: `Elektroda E7018, E7016 (LB-52), dan E8018 dirancang khusus untuk mengelas baja berkekuatan tarik tinggi, jembatan, bejana tekan, dan struktur gedung bertingkat tahan gempa.

MEKANISME RETAK HIDROGEN (HYDROGEN-INDUCED CRACKING / HIC):
1. Fluks elektroda Low-Hydrogen mengandung mineral kalsium karbonat (CaCO₃) dan kalsium fluorida (CaF₂). Bahan ini sangat rakus menyerap uap air dari udara (higroskopis).
2. Jika elektroda dibiarkan di udara lembab selama beberapa jam, fluks akan jenuh dengan uap air (H₂O).
3. Saat elektroda lembab ini dibakar pada suhu busur 3.500°C, molekul air terurai seketika menjadi atom-atom Hidrogen bebas:
H₂O ➔ 2H + O
4. Atom hidrogen memiliki diameter atom paling kecil di alam semesta, sehingga dengan leluasa masuk dan terlarut ke dalam kisi kristal cairan baja las.
5. Saat sambungan las mendingin melewati suhu 200°C menuju suhu ruang, kelarutan hidrogen di dalam kisi kristal besi menurun drastis. Atom-atom hidrogen terdesak dan berdifusi mencari ruang kosong mikro (micro-cavities) di batas butir fasa martensit yang keras dan getas di daerah HAZ (Heat Affected Zone).
6. Di dalam rongga mikro tersebut, atom hidrogen bergabung kembali menjadi molekul gas Hidrogen (H₂). Tekanan gas molekuler yang terperangkap ini dapat mencapai ribuan atmosfer!
7. Bersama dengan tegangan sisa pengelasan (residual stress), tekanan internal hidrogen ini memicu retakan tajam di bawah jalur las (underbead crack).
8. Tragedi dari retak hidrogen adalah sifatnya yang tertunda (Delayed Cracking)—sambungan las lolos uji visual di sore hari, namun tiba-tiba retak terbelah sendiri 24 hingga 72 jam kemudian!

STANDAR OPERASIONAL BAKING & HOLDING (AWS D1.1):
• Oven Pengering (Re-Baking Oven): 300°C – 350°C selama 1 hingga 2 jam untuk elektroda yang kemasannya baru dibuka atau sempat terpapar udara.
• Oven Penyimpanan Bengkel (Holding Oven): 120°C – 150°C secara terus-menerus.
• Termos Pemanas Portabel Welder (Quiver): 70°C – 100°C saat dibawa ke lokasi sambungan.
• Waktu Paparan Maksimal (Atmospheric Exposure Limit): Maksimal 4 jam di luar termos pemanas. Jika lewat batas, elektroda wajib di-baking ulang.`,
    proTip: 'Elektroda tipe Selulosa seperti AWS E6010 TIDAK BOLEH DI-OVEN PANAS! Fluks E6010 membutuhkan kadar kelembaban alami 3-7% agar menghasilkan tekanan gas sembur yang kuat untuk menembus akar pipa.',
    standards: 'AWS D1.1 Clause 5.3.2.2 (Storage and Baking of Low-Hydrogen Electrodes), EN ISO 3690.'
  },
  {
    id: 9,
    categories: ['k3_oven'],
    categoryLabel: 'Keselamatan Gas OAW',
    badgeColor: '#c026d3',
    badgeBg: '#fdf4ff',
    badgeBorder: '#f5d0fe',
    question: 'Berapa batas tekanan kerja aman gas Asetilen pada OAW dan mengapa tidak boleh melebihi 1 Bar / 15 PSI?',
    subtitle: 'Di atas 15 psi (1.03 bar), gas asetilen bebas mengalami disosiasi eksotermik spontan (terurai sendiri menghasilkan panas dahsyat) bahkan tanpa oksigen, yang memicu ledakan berdaya hancur tinggi!',
    highlights: [
      'Batas Mutlak: Tekanan kerja pengatur (regulator gauge) gas Asetilen TIDAK BOLEH melebihi 15 psi (1.03 bar / 100 kPa).',
      'Disosiasi Spontan: C₂H₂ ➔ 2C + H₂ + 227 kJ/mol Panas (meledak seketika tanpa membutuhkan oksigen).',
      'Penyimpanan Tabung Aman: Gas asetilen dilarutkan ke dalam cairan Aseton di dalam massa spons berpori kalsium silikat.',
      'SOP Tabung: Tabung asetilen wajib selalu berdiri tegak saat digunakan demi mencegah cairan aseton ikut tersedot keluar ke torch.'
    ],
    detail: `Gas Asetilen (Ethyne / C₂H₂) adalah gas bahan bakar dengan suhu nyala tertinggi di dunia saat dibakar bersama oksigen murni (mencapai 3.200°C). Namun gas ini menyimpan bahaya kimia termodinamika yang unik:

1. BAHAYA IKATAN RANGKAP TIGA ENDOTERMIK:
Molekul asetilen memiliki ikatan rangkap tiga karbon-karbon (H-C≡C-H). Ikatan ini bersifat sangat endotermik—artinya, molekul ini terbentuk dengan menyerap energi panas yang sangat tinggi dan selalu berusaha untuk terurai kembali.

2. FENOMENA DISOSIASI SPONTAN (> 15 PSI / 1.03 BAR):
Jika gas asetilen berada dalam wujud gas bebas di dalam pipa atau selang dengan tekanan melebihi 15 psi (1.03 bar / 100 kPa), molekul tersebut menjadi tidak stabil secara ekstrem.
Sedikit guncangan mekanik, percikan statis, atau kenaikan suhu lokal di atas 100°C akan memicu DISOSIASI EKSOTERMIK SPONTAN:
C₂H₂ ➔ 2C (karbon padat) + H₂ (gas hidrogen) + 227 kJ/mol Energi Panas
Reaksi ini TIDAK MEMBUTUHKAN GAS OKSIGEN SAMA SEKALI! Gas asetilen akan meledak dari dalam dirinya sendiri. Kenaikan tekanan gas hidrogen panas yang mendadak melipatgandakan tekanan hingga puluhan kali lipat, merobek selang las dan menghancurkan regulator seketika.

3. MENGAPA TABUNG ASETILEN BISA BERTEKANAN HINGGA 15 - 18 BAR?
Banyak teknisi pemula bingung: jika di atas 1 bar meledak, mengapa tabung asetilen diisi hingga tekanan 15 - 18 bar (250 psi)?
Jawabannya: Tabung asetilen BUKAN tabung hampa kosong seperti tabung oksigen!
• Di dalam tabung baja asetilen diisi penuh dengan Massa Monolitik Berpori Padat (Porous Mass) berbahan kalsium silikat yang memiliki mikropori hingga 90% volume tabung.
• Mikropori tersebut kemudian diisi dengan cairan pelarut organik ASETON (CH₃COCH₃).
• Cairan aseton memiliki kemampuan luar biasa melarutkan gas asetilen (1 liter aseton dapat melarutkan 25 liter gas asetilen untuk setiap 1 bar tekanan).
• Gas asetilen yang terlarut di dalam cairan aseton dalam ruang kapiler mikroskopis terisolasi dari rantai reaksi disosiasi, sehingga aman disimpan pada tekanan tinggi.

4. ATURAN KESELAMATAN WAJIB:
• Jaga tabung asetilen SELALU DALAM POSISI TEGAK lurus. Jika tabung sempat ditidurkan saat transportasi, tabung harus diberdirikan minimal 2 jam sebelum dibuka agar cairan aseton turun kembali ke dasar tabung dan tidak menyembur keluar merusak katup torch!`,
    proTip: 'Pastikan regulator asetilen memiliki tanda garis merah (red danger zone) pada angka di atas 15 psi / 1 bar, dan pasang Flashback Arrestor di kedua jalur selang torch!',
    standards: 'OSHA 1910.252 (Welding, Cutting, and Brazing), NFPA 51 (Standard for the Design and Installation of Oxygen-Fuel Gas Systems).'
  },
  {
    id: 10,
    categories: ['tig_acdc', 'mig_mag'],
    categoryLabel: 'Parameter Gas Pelindung',
    badgeColor: '#0284c7',
    badgeBg: '#f0f9ff',
    badgeBorder: '#bae6fd',
    question: 'Apa fungsi parameter Pre-Flow dan Post-Flow gas pelindung pada las MIG dan TIG?',
    subtitle: 'Pre-flow mengusir kontaminasi atmosfer sebelum busur menyala; post-flow melindungi kawah las yang membeku dari crater crack dan menjaga jarum tungsten tetap tajam terlindung.',
    highlights: [
      'Pre-Flow (0.2 – 0.8 detik): Meniupkan gas sebelum busur menyala untuk membuang udara luar di dalam nozel, mencegah porositas awal (start porosity).',
      'Post-Flow (5 – 12 detik): Mempertahankan semburan gas pelindung setelah busur padam sampai kawah las dan jarum tungsten mendingin di bawah suhu oksidasi.',
      'Bahaya Post-Flow Mati Terlalu Cepat: Terbentuk cekungan retak kawah (crater crack) dan jarum tungsten hangus menghitam teroksidasi.',
      'Rumus Durasi Post-Flow TIG: Minimal 1 detik untuk setiap penambahan 10 Ampere arus pengelasan (misal 100 A = 10 detik).'
    ],
    detail: `Pada mesin las inverter modern MIG/MAG dan TIG (GTAW), parameter Pre-Flow dan Post-Flow adalah fitur kunci untuk memastikan sambungan lolos uji kualitas tanpa cacat awal dan akhir:

1. FUNGSI PRE-FLOW TIMER:
Saat obor las (torch) tidak digunakan, udara atmosfer yang mengandung oksigen (21%), nitrogen (78%), dan kelembaban uap air mengendap di dalam rongga nozel gas keramik dan selang gas.
Jika busur las langsung dinyalakan bersamaan dengan semburan gas pertama, busur plasma akan membakar sisa udara kotor tersebut. Akibatnya, pada 5 mm pertama jalur lasan akan langsung muncul lubang-lubang cacing gas (worm-hole start porosity).
Dengan menyetel Pre-Flow timer (0.3 – 0.5 detik), gas murni akan menyembur keluar terlebih dahulu mendesak seluruh udara kotor keluar dari nozel, sehingga busur menyala di lingkungan atmosfer murni 100%.

2. FUNGSI POST-FLOW TIMER:
Ketika juru las melepas sakelar obor dan busur listrik padam, proses pendinginan logam las baru saja dimulai. Kawah las cair yang bersuhu 1.600°C masih membara merah panas (> 600°C) selama beberapa detik.
Jika aliran gas pelindung langsung dimatikan sesaat busur padam:
• Oksigen udara luar akan langsung menyergap cairan logam panas, menimbulkan rongga penyusutan yang retak di titik akhir (Crater Cracking & End Porosity).
• Pada las TIG, ujung jarum tungsten yang suhunya masih melampaui 1.500°C akan langsung teroksidasi udara, berubah warna menjadi biru kehitaman atau putih berkerak. Kerak oksida wolfram ini membuat busur pada pengelasan berikutnya melompat liar dan jarum cepat aus.

Dengan mempertahankan semburan Post-Flow selama 5 hingga 10 detik (sambil tetap menahan moncong torch diam di atas kawah las yang baru padam), jalur lasan dan ujung jarum tungsten akan mendingin sempurna dalam selubung gas murni, menghasilkan permukaan rigi las mengkilap seperti cermin dan jarum tungsten tetap berwarna perak berkilau.`,
    proTip: 'Gunakan aturan praktis Welder TIG profesional: Waktu Post-Flow (detik) = Ampere Arus ÷ 10. Jika Anda mengelas pipa stainless steel pada arus 90 Ampere, setel Post-Flow minimal 9 detik!',
    standards: 'AWS C5.5 (Gas Tungsten Arc Welding Guidelines), ASME Section IX.'
  }
];

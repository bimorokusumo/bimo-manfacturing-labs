/**
 * Bank Soal Tes Diagnostik Awal Kemampuan Siswa Teknik Pemesinan & Manufaktur
 * Setiap kategori berisi tepat 10 Soal Pilihan Ganda (Pilgan)
 * Digunakan oleh guru di awal pembelajaran untuk mendeteksi kesiapan dan pemahaman awal siswa.
 */

export const DIAGNOSTIC_CATEGORIES = {
  komprehensif: {
    id: 'komprehensif',
    title: 'Diagnostik Umum (Dasar Pemesinan & K3)',
    icon: '🎯',
    badge: 'Rekomendasi Awal',
    desc: 'Diagnosa menyeluruh 10 kompetensi inti: K3, jangka sorong, RPM bubut, pengetapan, gergaji, frais, gambar teknik, dan budaya 5R.'
  },
  mesin_konvensional: {
    id: 'mesin_konvensional',
    title: 'Diagnostik Mesin Bubut & Frais',
    icon: '⚙️',
    badge: 'Pemesinan',
    desc: 'Diagnosa parameter pemotongan, geometri alat potong pahat, pencekaman chuck/ragum, dan jenis pengerjaan bubut/frais.'
  },
  alat_ukur: {
    id: 'alat_ukur',
    title: 'Diagnostik Alat Ukur Presisi (Metrologi)',
    icon: '📏',
    badge: 'Metrologi',
    desc: 'Diagnosa pembacaan jangka sorong 0.05 & 0.02 mm, mikrometer sekrup 0.01 mm, kalibrasi nol, dan toleransi ISO.'
  },
  k3_5r: {
    id: 'k3_5r',
    title: 'Diagnostik K3LH, APAR & Budaya 5R',
    icon: '🛡️',
    badge: 'K3 & Budaya',
    desc: 'Diagnosa kesadaran bahaya mekanik, pemilihan APD wajib, teknik pemadaman APAR PASS, dan pilar 5S industri.'
  },
  pengelasan: {
    id: 'pengelasan',
    title: 'Diagnostik Pengelasan & Fabrikasi Logam',
    icon: '⚡',
    badge: 'Fabrikasi',
    desc: 'Diagnosa prinsip dasar las busur listrik SMAW, pemilihan kode elektroda E6013, keselamatan radiasi, dan cacat las.'
  }
};

export const DIAGNOSTIC_QUESTIONS = {
  komprehensif: [
    {
      id: 1,
      domain: 'Keselamatan Kerja (K3)',
      question: 'Mengapa operator DILARANG KERAS mengenakan sarung tangan kain saat mengoperasikan mesin bubut atau mesin bor yang sedang berputar?',
      options: [
        'A. Sarung tangan membuat tangan operator cepat berkeringat',
        'B. Serat kain sangat mudah tersangkut pada poros/benda berputar dan dapat menarik tangan hingga tergilas mesin',
        'C. Mengotori handel eretan dan tuas kontrol mesin',
        'D. Menghalangi semprotan cairan pendingin (coolant)'
      ],
      correct: 1,
      explanation: 'Bahaya keterbelitan (entanglement)! Serabut benang rajut sangat rentan tersangkut benda kerja atau spindel berputar, menarik jari ke putaran mesin dalam hitungan 0.1 detik.'
    },
    {
      id: 2,
      domain: 'Alat Ukur Presisi',
      question: 'Pada jangka sorong dengan ketelitian 0.05 mm, jika garis ke-7 pada skala nonius lurus segaris dengan skala utama, maka nilai desimalnya adalah...',
      options: [
        'A. 0.07 mm',
        'B. 0.70 mm',
        'C. 0.35 mm',
        'D. 0.14 mm'
      ],
      correct: 2,
      explanation: 'Perhitungan nonius: Nilai = Jumlah garis x Ketelitian = 7 x 0.05 mm = 0.35 mm.'
    },
    {
      id: 3,
      domain: 'Parameter Pemesinan',
      question: 'Sebuah benda kerja baja lunak berdiameter 50 mm akan dibubut dengan kecepatan potong (Cs) 30 meter/menit. Berapakah putaran spindel (RPM) teoritis yang harus diatur pada mesin? (Rumus: n = 1000 × Cs / (π × d), gunakan π ≈ 3.14)',
      options: [
        'A. ~191 RPM',
        'B. ~350 RPM',
        'C. ~500 RPM',
        'D. ~600 RPM'
      ],
      correct: 0,
      explanation: 'n = (1000 x 30) / (3.14 x 50) = 30000 / 157 = 191.08 RPM.'
    },
    {
      id: 4,
      domain: 'Perkakas Tangan Manual',
      question: 'Bagaimanakah arah pemasangan mata daun gergaji besi manual (hacksaw blade) yang benar pada bingkainya?',
      options: [
        'A. Gigi gergaji menghadap ke belakang ke arah gagang pemegang',
        'B. Gigi gergaji menghadap ke depan menjauhi gagang pemegang',
        'C. Posisi gigi bebas menghadap ke mana saja',
        'D. Miring 45 derajat ke sisi samping'
      ],
      correct: 1,
      explanation: 'Gigi gergaji besi dirancang memotong material saat langkah maju/dorong. Pemasangan gigi menghadap depan memastikan penekanan efektif saat langkah maju.'
    },
    {
      id: 5,
      domain: 'Perkakas Pembuat Ulir',
      question: 'Untuk membuat ulir dalam metrik M8 × 1.25 menggunakan tap tangan manual, berapakah diameter mata bor yang tepat untuk mengebor lubang awalnya?',
      options: [
        'A. 8.0 mm',
        'B. 7.5 mm',
        'C. 6.8 mm',
        'D. 6.0 mm'
      ],
      correct: 2,
      explanation: 'Rumus diameter lubang bor tap: D_bor = D_nominal - Pitch = 8 - 1.25 = 6.75 mm (dibulatkan standar bor 6.8 mm).'
    },
    {
      id: 6,
      domain: 'Penandaan Benda Kerja',
      question: 'Alat penanda yang memiliki sudut kerucut ujung sebesar 90° dan digunakan untuk membuat lesung pemandu mata bor adalah...',
      options: [
        'A. Penggores (Scriber)',
        'B. Penitik Rintik (Prick Punch)',
        'C. Penitik Pusat (Center Punch)',
        'D. Pahat Tangan (Chisel)'
      ],
      correct: 2,
      explanation: 'Center Punch memiliki sudut 90° untuk membuat cekungan pusat pemandu mata bor agar tidak bergeser (walking) saat awal mengebor.'
    },
    {
      id: 7,
      domain: 'Proses Pemesinan',
      question: 'Perbedaan mendasar antara proses kerja mesin bubut (lathe) dengan mesin frais (milling) adalah...',
      options: [
        'A. Pada mesin bubut benda kerja berputar dan alat potong diam/bergeser, sedangkan pada mesin frais alat potong berputar dan benda kerja bergeser',
        'B. Mesin bubut hanya untuk memotong kayu, sedangkan mesin frais untuk logam',
        'C. Mesin bubut menggunakan pisau berputar jam pasir',
        'D. Keduanya memiliki gerakan kerja yang persis sama'
      ],
      correct: 0,
      explanation: 'Prinsip pemesinan: Mesin bubut memutar benda kerja silindris terhadap pahat diam; mesin frais memutar pisau fris (milling cutter) terhadap meja benda kerja.'
    },
    {
      id: 8,
      domain: 'Gambar Teknik Manufaktur',
      question: 'Pada standar gambar teknik proyeksi ortogonal, proyeksi yang menempatkan tampak kanan di sebelah kanan tampak depan (kuadran III) disebut proyeksi...',
      options: [
        'A. Proyeksi Eropa (Sudut Pertama)',
        'B. Proyeksi Amerika (Sudut Ketiga)',
        'C. Proyeksi Piktorial Isometri',
        'D. Proyeksi Perspektif Dua Titik Hilang'
      ],
      correct: 1,
      explanation: 'Proyeksi Amerika (Third Angle Projection) meletakkan pandangan sesuai arah pandang mata: tampak kanan di kanan, tampak atas di atas.'
    },
    {
      id: 9,
      domain: 'Keadaan Darurat & APAR',
      question: 'Ketika memadamkan api menggunakan tabung APAR, urutan tindakan yang benar sesuai metode P-A-S-S adalah...',
      options: [
        'A. Push -> Aim -> Strike -> Stop',
        'B. Pull (Tarik pin) -> Aim (Arahkan nozzle) -> Squeeze (Tekan tuas) -> Sweep (Sapukan dari sisi ke sisi)',
        'C. Pump -> Activate -> Spray -> Sweep',
        'D. Point -> Approach -> Squeeze -> Stop'
      ],
      correct: 1,
      explanation: 'Metode standar PASS pemadam api: Pull pin -> Aim at base of fire -> Squeeze lever -> Sweep side to side.'
    },
    {
      id: 10,
      domain: 'Budaya Kerja Industri 5R',
      question: 'Tindakan menyingkirkan benda-benda yang sudah tidak terpakai, rusak, atau afkir dari meja kerja mesin ke tempat karantina merupakan pilar 5R...',
      options: [
        'A. RINGKAS (Seiri)',
        'B. RAPI (Seiton)',
        'C. RESIK (Seiso)',
        'D. RAWAT (Seiketsu)'
      ],
      correct: 0,
      explanation: 'Ringkas (Seiri) adalah prinsip memisahkan benda yang diperlukan dengan yang tidak diperlukan, serta menyingkirkan benda tak terpakai (Red Tag Strategy).'
    }
  ],

  mesin_konvensional: [
    {
      id: 1,
      domain: 'Pencekaman Benda Kerja',
      question: 'Pencekam mesin bubut berahang 3 (three-jaw chuck) umumnya digunakan untuk mencekam benda kerja yang berbentuk...',
      options: [
        'A. Balok kubus tak beraturan',
        'B. Silindris bulat atau bersegi kelipatan 3',
        'C. Pelat tipis berlubang',
        'D. Profil trapesium panjang'
      ],
      correct: 1,
      explanation: 'Three-jaw chuck bergerak serempak (self-centering), sangat ideal untuk benda silindris bulat atau segi enam beraturan.'
    },
    {
      id: 2,
      domain: 'Geometri Alat Potong',
      question: 'Sudut bebas (clearance angle) pada pahat bubut dibuat bertujuan untuk...',
      options: [
        'A. Mencegah bidang bawah mata potong pahat bergesekan dengan permukaan benda kerja yang dibubut',
        'B. Memperbesar gaya potong mesin',
        'C. Mempercepat pendinginan pahat',
        'D. Membuat tatal menjadi lurus panjang'
      ],
      correct: 0,
      explanation: 'Sudut bebas (clearance angle) mencegah sisi belakang pahat menggesek benda kerja yang dapat menimbulkan panas berlebih dan getaran (chatter).'
    },
    {
      id: 3,
      domain: 'Operasi Bubut',
      question: 'Proses pembubutan yang bertujuan untuk mengurangi diameter luar benda kerja silindris sepanjang sumbu memanjang disebut...',
      options: [
        'A. Bubut Muka (Facing)',
        'B. Bubut Rata / Silindris (Turning)',
        'C. Bubut Alur (Grooving)',
        'D. Pembuatan Ulir (Threading)'
      ],
      correct: 1,
      explanation: 'Bubut rata (turning/longitudinal feed) memotong permukaan silindris benda kerja searah sumbu memanjang poros mesin.'
    },
    {
      id: 4,
      domain: 'Operasi Mesin Frais',
      question: 'Metode pengefraisan di mana arah putaran pisau frais searah dengan arah gerakan pemakanan benda kerja disebut pengefraisan...',
      options: [
        'A. Konvensional (Up Milling)',
        'B. Searah (Down Milling / Climb Milling)',
        'C. Pengefraisan Tegak',
        'D. Pengefraisan Endmill'
      ],
      correct: 1,
      explanation: 'Climb/Down Milling adalah pengefraisan di mana putaran pisau dan pemakanan meja searah. Menghasilkan permukaan lebih halus namun memerlukan mekanisme backlash eliminator.'
    },
    {
      id: 5,
      domain: 'Perhitungan Waktu Permesinan',
      question: 'Jika panjang bidang bubut L = 100 mm, pemakanan f = 0.2 mm/putaran, dan putaran mesin n = 500 RPM, berapa waktu pemotongan teoritis (tc) untuk satu kali jalan? (tc = L / (f × n))',
      options: [
        'A. 0.5 menit',
        'B. 1.0 menit',
        'C. 2.0 menit',
        'D. 5.0 menit'
      ],
      correct: 1,
      explanation: 'tc = 100 / (0.2 x 500) = 100 / 100 = 1.0 menit.'
    },
    {
      id: 6,
      domain: 'Komponen Mesin Bubut',
      question: 'Bagian mesin bubut yang berfungsi menopang ujung benda kerja yang panjang agar tidak melengkung saat dibubut adalah...',
      options: [
        'A. Eretan Atas (Top Slide)',
        'B. Kepala Lepas (Tailstock)',
        'C. Poros Transportir',
        'D. Apron'
      ],
      correct: 1,
      explanation: 'Kepala Lepas (Tailstock) dilengkapi senter putar (live center) untuk mendukung ujung benda kerja panjang agar stabil dan tidak lentur.'
    },
    {
      id: 7,
      domain: 'Jenis Pisau Frais',
      question: 'Pisau frais yang memiliki sisi potong di bagian selubung silinder sekaligus di bagian ujung mukanya disebut...',
      options: [
        'A. End Mill Cutter (Pisau Jari)',
        'B. Slab Mill',
        'C. Angle Cutter',
        'D. Slitting Saw'
      ],
      correct: 0,
      explanation: 'End Mill Cutter memiliki mata potong pada bagian ujung (face) dan keliling (perimeter), sehingga dapat membuat alur tembus dan kantong (pocket).'
    },
    {
      id: 8,
      domain: 'Pemasangan Pahat Bubut',
      question: 'Apa akibatnya jika ujung mata pahat bubut dipasang jauh LEBIH RENDAH dari titik senter sumbu benda kerja saat membubut muka (facing)?',
      options: [
        'A. Benda kerja menjadi sangat halus',
        'B. Terbentuk tonjolan kecil berupa pentil di titik pusat sumbu benda kerja',
        'C. Putaran spindel menjadi lebih cepat',
        'D. Tatal menjadi sangat tipis dan terputus'
      ],
      correct: 1,
      explanation: 'Jika pahat di bawah senter, ujung pahat tidak mampu menyayat titik pusat geometri benda kerja sehingga menyisakan tonjolan (pentil) di tengah.'
    },
    {
      id: 9,
      domain: 'Pelumasan & Pendinginan',
      question: 'Cairan pendingin (coolant) pada proses pemotongan logam berfungsi terutama untuk...',
      options: [
        'A. Mendinginkan mata pahat dan benda kerja, melumasi bidang kontak, serta menghanyutkan tatal',
        'B. Mengubah warna logam menjadi mengkilap',
        'C. Menambah berat benda kerja',
        'D. Mengeringkan gram logam seketika'
      ],
      correct: 0,
      explanation: 'Fungsi utama coolant: pendinginan (heat extraction), pelumasan (friction reduction), dan pembersih/pembawa serpihan tatal (chip flushing).'
    },
    {
      id: 10,
      domain: 'K3 Mesin Bubut',
      question: 'Tindakan yang WAJIB dilakukan sebelum menyalakan saklar motor mesin bubut setelah proses setting benda kerja adalah...',
      options: [
        'A. Menyemprotkan oli ke lantai',
        'B. Memastikan kunci chuck (chuck key) telah dicabut dari lubang kepala pencekam',
        'C. Memegang chuck dengan tangan kosong',
        'D. Menutup kaca mata pengaman'
      ],
      correct: 1,
      explanation: 'Kunci chuck yang tertinggal akan terlontar keluar berkecepatan peluru saat mesin berputar, menjadi ancaman maut bagi siapa pun di sekitarnya.'
    }
  ],

  alat_ukur: [
    {
      id: 1,
      domain: 'Prinsip Ketelitian',
      question: 'Ketelitian (resolusi) sebuah jangka sorong ditentukan oleh...',
      options: [
        'A. Panjang rahang ukurnya',
        'B. Selisih antara satu bagian skala utama dengan satu bagian skala nonius',
        'C. Ketebalan pelat baja jangka sorong',
        'D. Angka terbesar pada batang utama'
      ],
      correct: 1,
      explanation: 'Ketelitian jangka sorong adalah selisih terkecil antara 1 divisi skala utama (1 mm) dengan 1 divisi skala nonius (misal 39mm/20 divisi = 0.05 mm).'
    },
    {
      id: 2,
      domain: 'Pembacaan Jangka Sorong',
      question: 'Hasil ukur jangka sorong menunjukkan garis 0 nonius berada setelah 24 mm di skala utama, dan garis nonius ke-6 lurus segaris (ketelitian 0.05 mm). Berapakah hasil pengukuran tersebut?',
      options: [
        'A. 24.06 mm',
        'B. 24.30 mm',
        'C. 24.60 mm',
        'D. 24.12 mm'
      ],
      correct: 1,
      explanation: 'Hasil ukur = Skala Utama + (Garis Nonius x Ketelitian) = 24 mm + (6 x 0.05 mm) = 24.30 mm.'
    },
    {
      id: 3,
      domain: 'Mikrometer Sekrup',
      question: 'Berapakah ketelitian standar dari mikrometer sekrup luar (outside micrometer) yang umum digunakan di bengkel presisi?',
      options: [
        'A. 0.1 mm',
        'B. 0.05 mm',
        'C. 0.01 mm',
        'D. 0.001 mm'
      ],
      correct: 2,
      explanation: 'Mikrometer sekrup standar metrik memiliki ketelitian 0.01 mm (pitch sekrup 0.5 mm dibagi 50 garis pada thimble/selubung luar).'
    },
    {
      id: 4,
      domain: 'Komponen Mikrometer',
      question: 'Komponen mikrometer sekrup yang berfungsi membatasi tekanan putaran pengukuran agar gaya sentuh rahang selalu konstan adalah...',
      options: [
        'A. Landasan (Anvil)',
        'B. Rachet Stop (Gigi Gelatik)',
        'C. Kunci Pengunci (Lock Nut)',
        'D. Rangka (Frame)'
      ],
      correct: 1,
      explanation: 'Ratchet stop berbunyi klik 2-3 kali saat tekanan telah ideal (antara 5 s/d 10 N), mencegah pemaksaan yang membuat poros ukur melar atau membengkok.'
    },
    {
      id: 5,
      domain: 'Kalibrasi Titik Nol',
      question: 'Sebelum menggunakan mikrometer sekrup, kedua permukaan ukur dirapatkan. Jika garis nol pada thimble tidak berimpit lurus dengan garis indeks sumbu sleeve, kondisi ini disebut...',
      options: [
        'A. Kesalahan Paralaks',
        'B. Kesalahan Titik Nol (Zero Error)',
        'C. Deformasi Plastis',
        'D. Histeresis Pengukuran'
      ],
      correct: 1,
      explanation: 'Zero error (kesalahan nol) harus dikoreksi menggunakan kunci penyetel khusus sebelum alat digunakan untuk mengukur benda kerja.'
    },
    {
      id: 6,
      domain: 'Pengukuran Kedalaman',
      question: 'Bagian manakah pada jangka sorong standar yang digunakan untuk mengukur kedalaman lubang atau celah bertingkat?',
      options: [
        'A. Rahang Ukur Luar Bawah',
        'B. Rahang Ukur Dalam Atas',
        'C. Tangkai Batang Kedalaman (Depth Bar) di ekor jangka sorong',
        'D. Baut Pengunci'
      ],
      correct: 2,
      explanation: 'Depth bar (batang lidah pengukur kedalaman) menjulur dari ekor jangka sorong untuk mengukur dasar lubang tegak lurus.'
    },
    {
      id: 7,
      domain: 'Dial Indicator',
      question: 'Dial Test Indicator (DTI) paling tepat digunakan untuk mengukur...',
      options: [
        'A. Panjang total bahan baku baja 6 meter',
        'B. Kebulatan (run-out), kerataan, dan kelurusan kesejajaran bidang benda kerja',
        'C. Suhu oli mesin',
        'D. Kekerasan permukaan logam'
      ],
      correct: 1,
      explanation: 'Dial Indicator mendeteksi deviasi pergeseran permukaan mikron untuk memeriksa eksentrisitas (runout) chuck dan kerataan bidang meja mesin.'
    },
    {
      id: 8,
      domain: 'Pengukur Sudut',
      question: 'Alat ukur yang digunakan untuk memeriksa dan mengukur kemiringan sudut benda kerja dengan ketelitian hingga 5 menit (5\') adalah...',
      options: [
        'A. Busur Derajat Biasa',
        'B. Bevel Protractor Universal Ber-Nonius',
        'C. Siku Perata 90°',
        'D. Mistar Baja'
      ],
      correct: 1,
      explanation: 'Universal Bevel Protractor dilengkapi skala nonius piringan dengan ketelitian 5 menit (1/12 derajat).'
    },
    {
      id: 9,
      domain: 'Suhu Standar Pengukuran',
      question: 'Menurut standar internasional (ISO 1), pengukuran geometris presisi bengkel harus dilakukan pada suhu acuan standar sebesar...',
      options: [
        'A. 0°C',
        'B. 20°C',
        'C. 27°C',
        'D. 100°C'
      ],
      correct: 1,
      explanation: 'Suhu standar metrologi internasional adalah 20°C (68°F) untuk menghindari pemuaian atau penyusutan termal logam benda kerja dan alat ukur.'
    },
    {
      id: 10,
      domain: 'Perawatan Alat Ukur',
      question: 'Tindakan yang BENAR dalam menyimpan mikrometer sekrup ke dalam kotaknya setelah digunakan adalah...',
      options: [
        'A. Mengunci spindle rapat-rapat tanpa celah hingga menempel kuat',
        'B. Membersihkan dari tatal oli, menyisakan celah 1-2 mm antara anvil dan spindle, lalu dikunci ringan',
        'C. Menyimpan bertumpuk dengan palu besi dan kikir',
        'D. Merendam mikrometer dalam air sabun'
      ],
      correct: 1,
      explanation: 'Permukaan ukur tidak boleh dirapatkan rapat saat disimpan karena perubahan suhu ruangan dapat menyebabkan pemuaian yang merusak ulir presisi spindel.'
    }
  ],

  k3_5r: [
    {
      id: 1,
      domain: 'Alat Pelindung Diri (APD)',
      question: 'APD wajib yang TIDAK BOLEH ditinggalkan sama sekali saat memasuki area bengkel mesin yang sedang beroperasi adalah...',
      options: [
        'A. Sandal jepit kulit',
        'B. Kacamata Safety, Pakaian Kerja (Wearpack), dan Sepatu Safety bertutup baja',
        'C. Sarung tangan wol rajut tebal',
        'D. Topi santai pantai'
      ],
      correct: 1,
      explanation: 'Kacamata melindungi dari gram panas 250°C, wearpack pas badan mencegah keterbelitan, dan safety shoes melindungi dari kejatuhan benda berat.'
    },
    {
      id: 2,
      domain: 'Klasifikasi Kebakaran',
      question: 'Kebakaran yang bersumber dari tumpahan oli pelumas mesin atau solar di lantai bengkel diklasifikasikan sebagai kebakaran kelas...',
      options: [
        'A. Kelas A (Benda Padat)',
        'B. Kelas B (Cairan Mudah Terbakar)',
        'C. Kelas C (Peralatan Listrik)',
        'D. Kelas D (Logam Mudah Terbakar)'
      ],
      correct: 1,
      explanation: 'Kebakaran Kelas B melibatkan cairan dan gas mudah menyala seperti oli, solar, bensin, dan pelarut kimia.'
    },
    {
      id: 3,
      domain: 'Media Pemadam Api',
      question: 'Mengapa dilarang keras menyiram kebakaran panel listrik bertegangan tinggi 380V dengan air biasa?',
      options: [
        'A. Air akan membuat panel listrik menjadi karatan',
        'B. Air adalah konduktor listrik yang dapat menghantarkan arus mematikan langsung ke tubuh pemadam',
        'C. Air membuat api padam terlalu cepat',
        'D. Air mengeluarkan aroma tidak sedap'
      ],
      correct: 1,
      explanation: 'Air menghantarkan arus listrik bertegangan tinggi (elektrokusi). Gunakan APAR CO2 atau Dry Chemical Powder.'
    },
    {
      id: 4,
      domain: 'Piramida Heinrich',
      question: 'Berdasarkan teori keselamatan kerja Heinrich, di balik 1 kecelakaan fatal/kematian di tempat kerja, terdapat...',
      options: [
        'A. 5 kecelakaan berat dan 10 nyaris celaka',
        'B. 29 kecelakaan ringan dan 300 kejadian nyaris celaka (near-miss)',
        'C. 100 kecelakaan sedang tanpa luka',
        'D. 1000 kerusakan alat'
      ],
      correct: 1,
      explanation: 'Rasio Heinrich 1 : 29 : 300 membuktikan bahwa mencegah 300 tindakan nyaris celaka (near miss) akan mencegah 1 kecelakaan fatal.'
    },
    {
      id: 5,
      domain: 'Hirarki Pengendalian Bahaya',
      question: 'Tingkatan tertinggi dalam Hirarki Pengendalian Risiko K3 (ISO 45001) adalah...',
      options: [
        'A. Memakai APD lengkap',
        'B. Pengendalian Administratif',
        'C. Eliminasi (Menghilangkan bahaya sepenuhnya dari sumbernya)',
        'D. Memasang rambu peringatan'
      ],
      correct: 2,
      explanation: 'Eliminasi adalah tingkat pengendalian terkuat karena menyingkirkan sumber bahaya secara fisik dan permanen.'
    },
    {
      id: 6,
      domain: 'Penerapan 5R: Seiton',
      question: 'Pemberian garis demarkasi warna kuning-hitam di lantai sekitar mesin bubut dan papan bayangan (shadow board) untuk kunci chuck merupakan penerapan pilar...',
      options: [
        'A. RINGKAS (Seiri)',
        'B. RAPI (Seiton)',
        'C. RESIK (Seiso)',
        'D. RAJIN (Shitsuke)'
      ],
      correct: 1,
      explanation: 'Rapi (Seiton) adalah menata letak barang agar mudah ditemukan, diambil, dan dikembalikan dengan standar visual jelas.'
    },
    {
      id: 7,
      domain: 'Penerapan 5R: Seiso',
      question: 'Prinsip "Resik sebagai sarana inspeksi" memiliki arti bahwa...',
      options: [
        'A. Bersih-bersih hanya dilakukan saat ada kunjungan tamu penting',
        'B. Saat membersihkan mesin, operator sekaligus memeriksa kebocoran oli, baut yang kendur, atau keausan komponen',
        'C. Membiarkan tatal gram menumpuk di bed mesin selama seminggu',
        'D. Menyapu kotoran ke bawah kolong meja mesin'
      ],
      correct: 1,
      explanation: 'Pembersihan adalah inspeksi. Dengan menyeka mesin, teknisi dapat mendeteksi dini retakan, getaran abnormal, dan tetesan oli bocor.'
    },
    {
      id: 8,
      domain: 'Pertolongan Pertama (P3K)',
      question: 'Jika serpihan gram logam masuk ke dalam mata praktikan di bengkel, tindakan pertama yang WAJIB dilakukan adalah...',
      options: [
        'A. Mengucek mata sekuat tenaga dengan tangan kotor',
        'B. Membilas mata dengan air mengalir bersih di stasiun pencuci mata (eye wash) selama 15 menit tanpa menguceknya',
        'C. Mengorek mata dengan ujung obeng',
        'D. Meneteskan air kopi hangat'
      ],
      correct: 1,
      explanation: 'Segera gunakan stasiun pencuci mata darurat (eye wash station). Mengucek mata akan menyebabkan gram tajam menggores kornea secara permanen.'
    },
    {
      id: 9,
      domain: 'Limbah B3 Bengkel',
      question: 'Kain majun yang sudah terkena oli, solar, dan pelarut kimia di bengkel mesin harus dibuang ke...',
      options: [
        'A. Saluran selokan umum sekolah',
        'B. Wadah tertutup khusus limbah padat B3 tahan api (Oily Waste Can)',
        'C. Bak sampah dedaunan organik',
        'D. Dibakar di halaman depan kelas'
      ],
      correct: 1,
      explanation: 'Majun berminyak berisiko mengalami penyalaan spontan (spontaneous combustion). Wajib dibuang ke wadah logam tertutup khusus limbah B3.'
    },
    {
      id: 10,
      domain: 'Etika Teknisi Mesin',
      question: 'Seorang teknisi membubut benda kerja presisi, dan setelah diukur diameter poros ternyata 0.05 mm di bawah batas toleransi (undersize). Tindakan beretika profesional yang benar adalah...',
      options: [
        'A. Memalsukan data di lembar kerja menjadi pas toleransi',
        'B. Menutupi ukuran cacat dengan dempul atau amplas',
        'C. Melaporkan secara jujur kepada instruktur/Quality Control untuk penanganan atau pembuatan part baru',
        'D. Menyembunyikan benda kerja di loker siswa lain'
      ],
      correct: 2,
      explanation: 'Integritas toleransi adalah harga mati keselamatan di dunia industri manufaktur otomotif dan kedirgantaraan.'
    }
  ],

  pengelasan: [
    {
      id: 1,
      domain: 'Prinsip Dasar Pengelasan',
      question: 'Pada proses pengelasan SMAW (Shielded Metal Arc Welding), panas untuk mencairkan logam berasal dari...',
      options: [
        'A. Pembakaran gas elpiji dan oksigen',
        'B. Busur listrik yang terbentuk antara ujung elektroda terbungkus dengan benda kerja logam',
        'C. Gesekan mekanik dua poros',
        'D. Sinar laser optik inframerah'
      ],
      correct: 1,
      explanation: 'SMAW menggunakan loncatan busur listrik bertegangan rendah berarus tinggi (3000°C+) antara elektroda dan benda kerja.'
    },
    {
      id: 2,
      domain: 'Fungsi Fluks Elektroda',
      question: 'Lapisan salutan (flux) pada kawat elektroda las SMAW berfungsi penting untuk...',
      options: [
        'A. Memberi aroma wangi saat mengelas',
        'B. Membentuk gas pelindung dan terak (slag) untuk melindungi kawah las cair dari kontaminasi oksigen dan nitrogen udara',
        'C. Membuat kawat elektroda menjadi lebih berat',
        'D. Mencegah kawat las dari karat saat basah'
      ],
      correct: 1,
      explanation: 'Fluks mengurai menghasilkan gas pelindung dan lapisan terak (slag) yang mencegah oksidasi dan porositas pada logam las cair.'
    },
    {
      id: 3,
      domain: 'Kodefikasi Elektroda AWS',
      question: 'Pada kode elektroda AWS E6013, angka "60" memiliki arti...',
      options: [
        'A. Diameter kawat sebesar 6.0 mm',
        'B. Kekuatan tarik minimum logam las sebesar 60.000 psi (pounds per square inch)',
        'C. Arus pengelasan harus 60 Ampere',
        'D. Waktu pengelasan maksimum 60 detik'
      ],
      correct: 1,
      explanation: 'Dua digit pertama (60) menunjukkan tensile strength minimum logam las: 60 x 1000 psi = 60.000 psi (~420 MPa).'
    },
    {
      id: 4,
      domain: 'Posisi Pengelasan',
      question: 'Kode posisi pengelasan "1G" pada sambungan pelat tumpul (butt joint) mengindikasikan posisi las...',
      options: [
        'A. Di bawah tangan (Flat position)',
        'B. Mendatar / Horisontal',
        'C. Tegak / Vertikal',
        'D. Di atas kepala (Overhead)'
      ],
      correct: 0,
      explanation: '1G adalah posisi pengelasan alur (groove) di bawah tangan (flat), di mana benda kerja diletakkan rata di bawah elektroda.'
    },
    {
      id: 5,
      domain: 'Keselamatan Radiasi Las',
      question: 'Alat Pelindung Diri (APD) utama untuk melindungi mata dan seluruh wajah dari bahaya kebutaan akibat radiasi sinar ultraviolet (UV) dan inframerah busur las adalah...',
      options: [
        'A. Kacamata hitam pantai',
        'B. Topeng Las (Welding Helmet / Shield) dengan kaca filter gelap (Shade 9 - 12)',
        'C. Kacamata baca bening',
        'D. Topi proyek plastik'
      ],
      correct: 1,
      explanation: 'Busur las menghasilkan radiasi ultraviolet ekstrem. Topeng las berfilter DIN/Shade 9-12 melindungi kornea dari kebutaan akibat flash burn (arc eye).'
    },
    {
      id: 6,
      domain: 'Pengaturan Arus (Ampere)',
      question: 'Apa akibat yang terjadi jika penyetelan arus pengelasan (Ampere) disetel JAUH TERLALU TINGGI dari diameter kawat elektroda?',
      options: [
        'A. Penetrasi dangkal dan terak sulit lepas',
        'B. Terjadi undercut pada tepi las, percikan (spatter) berlebihan, dan benda kerja pelat tipis jebol bolong',
        'C. Elektroda menempel macet pada benda kerja',
        'D. Busur las tidak dapat menyala sama sekali'
      ],
      correct: 1,
      explanation: 'Arus terlalu tinggi menyebabkan panas berlebih, semprotan spatter kasar, cacat undercut di pinggir lasan, serta risiko benda tembus terbakar.'
    },
    {
      id: 7,
      domain: 'Identifikasi Cacat Las',
      question: 'Cacat las berupa lubang-lubang rongga gas kecil yang terjebak di dalam atau permukaan rigi-rigi las disebut...',
      options: [
        'A. Porositas (Porosity)',
        'B. Retak Dingin (Crack)',
        'C. Kurang Penetrasi (Lack of Penetration)',
        'D. Distorsi'
      ],
      correct: 0,
      explanation: 'Porositas adalah gelembung gas (udara lembap atau kotoran oli) yang terperangkap dalam kawah las saat membeku.'
    },
    {
      id: 8,
      domain: 'Polaritas Pengelasan',
      question: 'Pada mesin las DC, polaritas DCEP (Direct Current Electrode Positive / Reverse Polarity) memiliki karakteristik...',
      options: [
        'A. Elektroda terhubung ke kutub negatif',
        'B. Elektroda terhubung ke kutub positif, menghasilkan penetrasi pengelasan yang lebih dalam pada benda kerja',
        'C. Menggunakan arus bolak-balik tanpa kutub',
        'D. Arus hanya mengalir satu detik lalu mati'
      ],
      correct: 1,
      explanation: 'Pada DCEP, elektroda pada kutub positif (+), 70% panas terkonsentrasi di ujung elektroda dan menghasilkan penetrasi dalam pada logam induk.'
    },
    {
      id: 9,
      domain: 'Pembersihan Terak',
      question: 'Setelah selesai membuat rigi-rigi las, terak las (slag) yang membungkus sambungan harus dibersihkan menggunakan...',
      options: [
        'A. Palu terak (chipping hammer) dan sikat baja dengan tetap memakai kacamata pelindung',
        'B. Telapak tangan kosong secara langsung',
        'C. Disiram bensin lalu dinyalakan',
        'D. Dibenturkan ke lantai berkali-kali'
      ],
      correct: 0,
      explanation: 'Gunakan palu terak runcing dan sikat kawat baja. Wajib memakai kacamata pengaman karena serpihan terak panas dapat meloncat ke mata.'
    },
    {
      id: 10,
      domain: 'K3 Pencegahan Kebakaran',
      question: 'Sebelum memulai pekerjaan pengelasan di workshop, tindakan pencegahan bahaya kebakaran yang benar adalah...',
      options: [
        'A. Menyemprotkan thinner ke meja las agar bersih',
        'B. Menyingkirkan semua bahan mudah terbakar (kain majun, oli, kardus, gas) dalam radius minimal 5 meter dan menyiapkan tabung APAR siap pakai',
        'C. Mengelas di dekat tempat pengisian bahan bakar',
        'D. Membiarkan percikan bunga api mengenai kabel listrik'
      ],
      correct: 1,
      explanation: 'Percikan las bersuhu 1000°C dapat melesat hingga 5-10 meter. Wajib bersihkan bahan mudah terbakar dan letakkan APAR dekat operator.'
    }
  ]
};

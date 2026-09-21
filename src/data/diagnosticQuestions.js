/**
 * Bank Soal Tes Diagnostik Awal Kemampuan Siswa per Laboratorium & Modul
 * Tepat 10 Soal Pilihan Ganda (Pilgan) untuk SETIAP Modul di Sidebar:
 * 1. Machine Lab (machine)
 * 2. Alat Pemotong (cutting-tools)
 * 3. Heat Treatment (heat-treatment)
 * 4. Mekanika Teknik (mechanics)
 * 5. Welding Lab (welding)
 * 6. Alat Ukur Presisi (measuring)
 * 7. Design Lab (design)
 * 8. Safety Lab (safety)
 * 9. Virtual Bengkel 3D (virtual-bengkel)
 * 
 * Digunakan oleh guru (Pak Bimoro Kusumo) di awal pembelajaran untuk mendiagnosa kesiapan siswa.
 */

export const DIAGNOSTIC_CATEGORIES = {
  machine: {
    id: 'machine',
    title: 'Diagnostik Machine Lab (Bubut, Frais & CNC)',
    shortTitle: 'Machine Lab',
    icon: '⚙️',
    badge: 'Pemesinan',
    desc: 'Diagnosa kesiapan pengoperasian mesin bubut, penentuan RPM & pemakanan, ragum frais, geometri pahat, dan kode dasar CNC.'
  },
  'cutting-tools': {
    id: 'cutting-tools',
    title: 'Diagnostik Alat Pemotong (Cutting Tools)',
    shortTitle: 'Alat Pemotong',
    icon: '🔪',
    badge: 'Perkakas Potong',
    desc: 'Diagnosa material pahat HSS vs Karbida, sudut bor 118°, tap & snei, reamer toleransi presisi, dan mata pisau frais.'
  },
  'heat-treatment': {
    id: 'heat-treatment',
    title: 'Diagnostik Heat Treatment & Metalurgi',
    shortTitle: 'Heat Treatment',
    icon: '🔥',
    badge: 'Termal Logam',
    desc: 'Diagnosa proses hardening, laju quenching, tempering keuletan, annealing pelunakan, normalizing, dan 7-bak blackening.'
  },
  mechanics: {
    id: 'mechanics',
    title: 'Diagnostik Mekanika Teknik & Statika Terapan',
    shortTitle: 'Mekanika Teknik',
    icon: '🔧',
    badge: 'Statika Mesin',
    desc: 'Diagnosa perhitungan momen gaya & torsi baut, keuntungan mekanis tuas kelas 1-3, kesetimbangan tumpuan, dan tegangan-regangan.'
  },
  welding: {
    id: 'welding',
    title: 'Diagnostik Welding Lab (Las Busur SMAW)',
    shortTitle: 'Welding Lab',
    icon: '⚡',
    badge: 'Fabrikasi Las',
    desc: 'Diagnosa prinsip las busur manual SMAW, kode elektroda AWS E6013, pengaturan ampere, sudut elektroda, dan mitigasi cacat las.'
  },
  measuring: {
    id: 'measuring',
    title: 'Diagnostik Alat Ukur Presisi (Metrologi Industri)',
    shortTitle: 'Alat Ukur Presisi',
    icon: '📏',
    badge: 'Metrologi',
    desc: 'Diagnosa pembacaan jangka sorong 0.05 & 0.02 mm, mikrometer sekrup 0.01 mm, kalibrasi nol, dial indicator, dan toleransi ISO.'
  },
  design: {
    id: 'design',
    title: 'Diagnostik Design Lab & Gambar Teknik Mesin',
    shortTitle: 'Design Lab',
    icon: '📐',
    badge: 'CAD & Gambar Teknik',
    desc: 'Diagnosa proyeksi Amerika vs Eropa, aturan garis ISO, potongan sayatan, toleransi geometris GD&T, simbol kekasaran Ra, dan dasar CAD.'
  },
  safety: {
    id: 'safety',
    title: 'Diagnostik Safety Lab, K3LH & Budaya 5R',
    shortTitle: 'Safety Lab',
    icon: '🛡️',
    badge: 'K3LH & Budaya Industri',
    desc: 'Diagnosa bahaya mekanik bengkel mesin, APD wajib, larangan sarung tangan, prosedur APAR PASS kelas kebakaran, dan 5R Seiri-Shitsuke.'
  },
  'virtual-bengkel': {
    id: 'virtual-bengkel',
    title: 'Diagnostik Virtual Bengkel 3D & Workshop',
    shortTitle: 'Virtual Bengkel 3D',
    icon: '🏭',
    badge: 'Manajemen Workshop',
    desc: 'Diagnosa tata letak bengkel, safety line, penanganan tatal beram, tombol emergency stop, jalur evakuasi, dan checklist harian mesin.'
  }
};

export const DIAGNOSTIC_QUESTIONS = {
  // =========================================================================
  // 1. MACHINE LAB (10 SOAL)
  // =========================================================================
  machine: [
    {
      id: 1,
      domain: 'Prinsip Bubut Konvensional',
      question: 'Prinsip kerja dasar pembubutan (turning) pada mesin bubut konvensional adalah...',
      options: [
        'A. Benda kerja berputar dan pahat potong bergerak melakukan gerakan translasi/penyayatan',
        'B. Pahat potong berputar cepat sementara benda kerja diam dijepit kuat pada meja',
        'C. Benda kerja dan pahat sama-sama berputar pada kecepatan RPM yang sama',
        'D. Spindel mesin bergerak translasi maju-mundur tanpa adanya putaran poros'
      ],
      correct: 0,
      explanation: 'Pada mesin bubut, gerakan utama (putaran) dilakukan oleh benda kerja yang dicekam pada spindel, sedangkan gerakan pemakanan (feed) dilakukan oleh pahat yang bergerak translasi.'
    },
    {
      id: 2,
      domain: 'Perhitungan Putaran Spindel (RPM)',
      question: 'Benda kerja baja karbon berdiameter d = 50 mm akan dibubut dengan kecepatan potong Cs = 25 m/menit. Berapakah putaran spindel (n) yang harus disetel pada mesin bubut? (Gunakan rumus n = (1000 x Cs) / (π x d))',
      options: [
        'A. ~159 RPM',
        'B. ~318 RPM',
        'C. ~500 RPM',
        'D. ~80 RPM'
      ],
      correct: 0,
      explanation: 'n = (1000 x 25) / (3.14 x 50) = 25.000 / 157 = 159.23 RPM. Mesin disetel ke tingkat putaran terdekat yaitu sekitar 160 RPM.'
    },
    {
      id: 3,
      domain: 'Pencekaman Benda Kerja',
      question: 'Untuk membubut benda kerja berbentuk silindris pejal secara cepat dan otomatis konsentris terpusat di titik tengah, perlengkapan cekam yang paling tepat digunakan adalah...',
      options: [
        'A. Cekam rahang tiga otomatis memusat (Three-jaw self-centering chuck)',
        'B. Cekam rahang empat bebas tidak memusat (Four-jaw independent chuck)',
        'C. Pelat pembawa (face plate)',
        'D. Kolet magnetik darurat'
      ],
      correct: 0,
      explanation: 'Three-jaw self-centering chuck memiliki mekanisme ulir spiral piringan yang menggerakkan ketiga rahang secara serentak sehingga benda silinder langsung konsentris di tengah.'
    },
    {
      id: 4,
      domain: 'Geometri Pahat Bubut',
      question: 'Penyetelan ketinggian ujung mata pahat bubut terhadap sumbu senter mesin harus tepat setinggi senter putar (center line). Apa akibatnya jika pahat dipasang TERLALU RENDAH dari sumbu senter saat facing?',
      options: [
        'A. Benda kerja akan memiliki tonjolan/pentolan sisa di titik pusat muka yang tidak terpotong',
        'B. Benda kerja akan langsung terlempar keluar dari cekam',
        'C. Putaran spindel mesin akan berhenti otomatis',
        'D. Benda kerja menjadi sangat halus melebihi standar N6'
      ],
      correct: 0,
      explanation: 'Jika ujung mata pahat berada di bawah titik pusat benda, ujung sayat tidak mampu menjangkau titik pusat (R=0) sehingga menyisakan tonjolan silinder kecil di tengah penampang muka.'
    },
    {
      id: 5,
      domain: 'Metode Pembubutan Tirus',
      question: 'Untuk membubut tirus pendek dengan sudut kemiringan besar (misalnya tirus sudut 30° dengan panjang 20 mm), metode paling praktis yang dilakukan pada mesin bubut konvensional adalah...',
      options: [
        'A. Memutar dan menggeser sudut eretan atas (compound rest)',
        'B. Menggeser kepala lepas (offsetting tailstock)',
        'C. Menggunakan perlengkapan tirus (taper attachment)',
        'D. Mengatur tuas transmisi gearbox utama ke mode ulir'
      ],
      correct: 0,
      explanation: 'Eretan atas dapat diputar sudutnya hingga 90° ke kiri atau kanan. Pemakanan dilakukan secara manual dengan memutar eretan atas untuk menghasilkan permukaan tirus bersudut besar.'
    },
    {
      id: 6,
      domain: 'Prinsip Mesin Frais (Milling)',
      question: 'Pada mesin frais (milling machine), perbedaan mendasar jenis pemotongan naik (Up Milling / Conventional) dengan pemotongan turun (Down Milling / Climb) adalah...',
      options: [
        'A. Pada Up Milling arah putaran pisau berlawanan arah dengan arah gerak meja benda kerja',
        'B. Pada Down Milling pisau frais tidak memotong melainkan menggosok benda kerja',
        'C. Up Milling hanya bisa dipakai untuk logam lunak seperti timbal dan plastik',
        'D. Down Milling selalu menghasilkan gram yang diawali dari ketebalan nol ke ketebalan maksimal'
      ],
      correct: 0,
      explanation: 'Pada Up Milling, mata pisau menyayat ke atas berlawanan arah dengan arah jalannya meja, ketebalan serpihan dimulai dari nol hingga mencapai titik tebal maksimum.'
    },
    {
      id: 7,
      domain: 'Jenis Pisau Frais',
      question: 'Pisau frais yang digunakan untuk meratakan permukaan bidang atas yang luas secara cepat dengan efisiensi tinggi pada mesin frais vertikal adalah...',
      options: [
        'A. Face Mill Cutter (Pisau Frais Muka bertip karbida)',
        'B. End Mill 2 Flute diameter 4 mm',
        'C. Pisau Frais Sudut Tunggal (Single Angle Cutter)',
        'D. Slitting Saw Cutter tipis'
      ],
      correct: 0,
      explanation: 'Face Mill Cutter memiliki diameter besar dan dilengkapi banyak sisipan mata potong karbida (inserts) yang mampu meratakan permukaan luas dengan laju pembuangan logam (MRR) sangat tinggi.'
    },
    {
      id: 8,
      domain: 'Pemasangan Ragum Mesin Frais',
      question: 'Sebelum ragum mesin frais dikencangkan untuk memulai pengerjaan presisi, apa tindakan kalibrasi wajib yang harus dilakukan operator?',
      options: [
        'A. Meluruskan kerataan rahang tetap ragum terhadap sumbu sumbu meja menggunakan Dial Indicator',
        'B. Memukul rahang ragum dengan palu baja keras',
        'C. Menyemprotkan cairan oli pelumas ke seluruh permukaan rahang ragum',
        'D. Mengencangkan baut tumpuan meja tanpa melihat skala derajat'
      ],
      correct: 0,
      explanation: 'Rahang tetap ragum harus disejajarkan dengan sumbu gerakan meja mesin (sumbu X atau Y) menggunakan Dial Indicator agar benda kerja yang dijepit tidak mengalami kemiringan (paralelisme terjaga).'
    },
    {
      id: 9,
      domain: 'Dasar Pemrograman CNC',
      question: 'Pada mesin bubut CNC atau Frais CNC standar ISO, kode pemrograman G-Code yang berfungsi untuk memerintahkan gerakan lurus menyayat dengan kecepatan pemakanan teratur (feedrate) adalah...',
      options: [
        'A. G01',
        'B. G00',
        'C. G02',
        'D. G28'
      ],
      correct: 0,
      explanation: 'G01 adalah Linear Interpolation (gerak lurus penyayatan dengan kecepatan F yang ditentukan). Sedangkan G00 adalah gerak cepat tanpa penyayatan (rapid positioning).'
    },
    {
      id: 10,
      domain: 'Keselamatan Mesin Perkakas',
      question: 'Tindakan paling berbahaya yang sering menyebabkan kecelakaan fatal pada operator mesin bubut adalah...',
      options: [
        'A. Meninggalkan kunci chuck (chuck key) menancap pada kepala cekam bubut',
        'B. Menggunakan kacamata pelindung kerja bening',
        'C. Mengoleskan cairan pendingin ke permukaan benda kerja',
        'D. Mengukur benda kerja menggunakan jangka sorong setelah mesin dimatikan total'
      ],
      correct: 0,
      explanation: 'Kunci chuck yang tertinggal pada cekam akan terlempar seperti peluru berkecepatan tinggi saat spindel mesin dinyalakan dan dapat berakibat fatal bagi operator di sekitarnya.'
    }
  ],

  // =========================================================================
  // 2. ALAT PEMOTONG (10 SOAL)
  // =========================================================================
  'cutting-tools': [
    {
      id: 1,
      domain: 'Material Alat Potong',
      question: 'Keunggulan utama alat potong karbida (cemented carbide) dibandingkan baja HSS (High Speed Steel) dalam proses pemesinan modern adalah...',
      options: [
        'A. Memiliki kekerasan panas (red hardness) yang jauh lebih tinggi sehingga mampu memotong pada kecepatan tinggi (Cs tinggi)',
        'B. Memiliki kelenturan yang sangat tinggi dan tidak bisa pecah bila terkena benturan',
        'C. Harganya jauh lebih murah daripada baja karbon biasa',
        'D. Sangat mudah diasah dengan batu gerinda pasir biasa tanpa intan'
      ],
      correct: 0,
      explanation: 'Karbida mempertahankan kekerasannya hingga suhu lebih dari 1000°C (red hardness tinggi), memungkinkan pemotongan 3 hingga 5 kali lebih cepat dibanding HSS.'
    },
    {
      id: 2,
      domain: 'Geometri Mata Bor (Drill Bit)',
      question: 'Sudut puncak (point angle) standar pada mata bor spiral (twist drill) yang dirancang khusus untuk mengebor baja karbon lunak (mild steel) adalah...',
      options: [
        'A. 118°',
        'B. 90°',
        'C. 60°',
        'D. 140°'
      ],
      correct: 0,
      explanation: 'Sudut puncak standar untuk mata bor twist drill pengerjaan baja lunak dan material umum adalah 118° dengan sudut bebas bibir sekitar 8° - 12°.'
    },
    {
      id: 3,
      domain: 'Sudut Bebas Pahat Potong',
      question: 'Apa akibat yang terjadi pada proses pemotongan jika sudut bebas (clearance angle) pada pahat bubut atau mata bor dibuat TERLALU KECIL (mendekati 0°)?',
      options: [
        'A. Bagian bawah pahat bergesekan kuat dengan benda kerja menimbulkan panas tinggi dan tidak menyayat',
        'B. Pahat akan memotong benda kerja menjadi sangat tajam tanpa hambatan',
        'C. Benda kerja akan langsung terbelah menjadi dua bagian',
        'D. Gram hasil sayatan akan berbentuk serbuk halus seperti tepung'
      ],
      correct: 0,
      explanation: 'Sudut bebas berfungsi mencegah gesekan antara punggung pahat dengan permukaan benda kerja. Jika clearance angle terlalu kecil, pahat menekan benda alih-alih menyayat.'
    },
    {
      id: 4,
      domain: 'Penggunaan Hand Tap (Pembuat Ulir Dalam)',
      question: 'Satu set tap tangan (hand tap) pembuat ulir dalam manual umumnya terdiri dari 3 buah tap. Urutan pemakaian yang benar adalah...',
      options: [
        'A. Tap No 1 (Taper/Tirus) -> Tap No 2 (Plug/Antara) -> Tap No 3 (Bottoming/Rata)',
        'B. Tap No 3 (Bottoming) -> Tap No 2 (Plug) -> Tap No 1 (Taper)',
        'C. Tap No 2 (Plug) -> Tap No 1 (Taper) -> Tap No 3 (Bottoming)',
        'D. Ketiga tap digunakan secara acak tanpa aturan urutan'
      ],
      correct: 0,
      explanation: 'Tap 1 bertirus panjang sebagai pemandu awal alur ulir, Tap 2 memperdalam profil ulir, dan Tap 3 menyelesaikan profil penuh hingga dasar lubang tembus/buntu.'
    },
    {
      id: 5,
      domain: 'Perhitungan Lubang Bor Pengetapan',
      question: 'Berapakah diameter mata bor yang harus digunakan untuk membuat lubang sebelum ditap ulir metris M10 x 1.5? (Gunakan rumus D = D_nominal - Kisar/Pitch)',
      options: [
        'A. 8.5 mm',
        'B. 9.5 mm',
        'C. 10.0 mm',
        'D. 7.5 mm'
      ],
      correct: 0,
      explanation: 'D = D_nominal - Pitch = 10 - 1.5 = 8.5 mm. Jika mata bor yang digunakan 10 mm, maka ulir tidak akan terbentuk sama sekali.'
    },
    {
      id: 6,
      domain: 'Alat Pembuat Ulir Luar (Snei / Die)',
      question: 'Perkakas potong manual yang digunakan untuk membuat ulir luar pada batang poros silinder adalah...',
      options: [
        'A. Snei (Dies) dan Rumah Snei (Die Stock)',
        'B. Hand Tap dan Tap Wrench',
        'C. Pahat Sekrap Pengkasar',
        'D. Gergaji Besi Manual'
      ],
      correct: 0,
      explanation: 'Snei (Dies) adalah perkakas potong berlubang dengan profil ulir di bagian dalamnya yang diputar menggunakan rumah snei (die stock) untuk menyayat ulir luar pada poros.'
    },
    {
      id: 7,
      domain: 'Pisau Reamer (Peluang)',
      question: 'Fungsi utama perkakas potong reamer (peluang) setelah proses pengeboran adalah...',
      options: [
        'A. Memperhalus permukaan dinding lubang dan mencapai ukuran diameter dengan tingkat toleransi presisi tinggi (misal IT7/H7)',
        'B. Membuat lubang awal pertama kali pada benda kerja pejal',
        'C. Membuat alur pasak memanjang di bagian dalam lubang',
        'D. Memotong poros logam silinder menjadi dua bagian'
      ],
      correct: 0,
      explanation: 'Mata bor hanya menghasilkan lubang kasar. Reamer digunakan untuk finishing lubang dengan penyayatan sangat tipis (0.1 - 0.2 mm) untuk mencapai toleransi H7 presisi tinggi.'
    },
    {
      id: 8,
      domain: 'Pisau Frais Jari (Endmill Cutter)',
      question: 'Kapan operator sebaiknya memilih pisau frais Endmill 2-Flute dibanding Endmill 4-Flute saat pengerjaan frais?',
      options: [
        'A. Saat membuat alur tertutup (slotting/plunging) karena memiliki kantong tatal (chip pocket) yang lebih luas untuk evakuasi serpihan',
        'B. Saat ingin menghasilkan permukaan samping paling halus pada baja keras',
        'C. Saat pengerjaan bubut permukaan luar',
        'D. Saat memotong lembaran kaca akrilik tipis'
      ],
      correct: 0,
      explanation: 'Endmill 2-flute memiliki ruang pembuangan gram (chip pocket) yang jauh lebih besar sehingga tidak mudah tersumbat gram saat menusuk dan menyayat alur penuh (slotting).'
    },
    {
      id: 9,
      domain: 'Daun Gergaji Besi (Hacksaw Blade)',
      question: 'Bagaimana pemasangan daun gergaji besi (hacksaw blade) yang benar pada sengkang gergaji tangan?',
      options: [
        'A. Gigi gergaji harus menghadap ke arah DEPAN menjauhi gagang karena langkah memotong terjadi saat gergaji didorong maju',
        'B. Gigi gergaji harus menghadap ke arah BELAKANG mendekati gagang',
        'C. Dipasang bolak-balik tanpa memperhatikan arah kemiringan mata gigi',
        'D. Dikendorkan sepenuhnya agar bilah melengkung saat memotong'
      ],
      correct: 0,
      explanation: 'Gergaji tangan manual memotong pada langkah dorong (forward stroke), sehingga mata gigi potong wajib menghadap ke depan menjauhi pegangan tangan operator.'
    },
    {
      id: 10,
      domain: 'Pahat Bubut Potong (Parting Tool)',
      question: 'Saat melakukan pemotongan benda kerja (parting off) pada mesin bubut hingga putus, mengapa cairan pendingin (coolant) sangat krusial diberikan secara berlimpah?',
      options: [
        'A. Mengurangi gesekan tinggi pada celah sempit agar bilah pahat potong tipis tidak terjepit dan patah',
        'B. Agar benda kerja tidak berubah warna menjadi mengkilap',
        'C. Untuk mempercepat putaran spindel mesin secara otomatis',
        'D. Mencegah cekam bubut terlepas dari poros utama'
      ],
      correct: 0,
      explanation: 'Pahat potong memiliki bilah yang tipis dan panjang. Celah pemotongan sempit rentan penumpukan panas dan serpihan gram, yang dapat membuat pahat macet dan patah mendadak.'
    }
  ],

  // =========================================================================
  // 3. HEAT TREATMENT (10 SOAL)
  // =========================================================================
  'heat-treatment': [
    {
      id: 1,
      domain: 'Tujuan Proses Hardening',
      question: 'Tujuan utama dilakukannya perlakuan panas pengerasan (hardening) pada baja perkakas adalah...',
      options: [
        'A. Meningkatkan kekerasan dan ketahanan aus benda kerja agar tahan terhadap gesekan dan deformasi beban',
        'B. Menjadikan baja sangat lunak dan ulet sehingga mudah dibengkokkan dengan tangan',
        'C. Menurunkan titik lebur baja agar mudah dicairkan kembali',
        'D. Menghilangkan seluruh unsur karbon di dalam komposisi baja'
      ],
      correct: 0,
      explanation: 'Hardening bertujuan meningkatkan kekerasan mikrostruktur material logam agar memiliki daya tahan aus yang tinggi saat digunakan sebagai alat potong atau komponen mesin.'
    },
    {
      id: 2,
      domain: 'Fase Austenit dan Suhu Pemanasan',
      question: 'Sebelum dilakukan pendinginan cepat (quenching), baja dipanaskan ke daerah suhu austenisasi (sekitar 30°C - 50°C di atas garis kritis A3/A1) dengan tujuan...',
      options: [
        'A. Mengubah struktur mikro baja secara homogen menjadi fasa Austenit yang mampu melarutkan karbon',
        'B. Menguapkan seluruh air yang menempel pada permukaan baja',
        'C. Melelehkan bagian sudut luar benda kerja',
        'D. Mengubah baja ferit langsung menjadi baja tahan karat (stainless steel)'
      ],
      correct: 0,
      explanation: 'Pemanasan di atas garis kritis memicu transformasi fasa dari perlit/ferit menjadi austenit (struktur FCC) di mana atom karbon larut sempurna dalam kisi besi gamma.'
    },
    {
      id: 3,
      domain: 'Media Pendingin Quenching',
      question: 'Di antara media pendingin berikut, manakah yang memiliki laju pendinginan (cooling rate) PALING CEPAT dan drastis saat proses quenching?',
      options: [
        'A. Air garam (Brine solution)',
        'B. Oli perlakuan panas khusus (Quenching oil)',
        'C. Udara hembus tekan (Air blast)',
        'D. Pasir kuarsa kering di dalam tungku'
      ],
      correct: 0,
      explanation: 'Air garam (brine) memecah lapisan gelembung uap air seketika, menghasilkan laju pendinginan tercepat melampaui kecepatan pendinginan kritis baja.'
    },
    {
      id: 4,
      domain: 'Struktur Martensit',
      question: 'Hasil struktur mikro yang terbentuk dari pendinginan sangat cepat fasa austenit pada proses hardening baja karbon adalah...',
      options: [
        'A. Martensit (struktur kristal BCT yang sangat keras dan getas)',
        'B. Ferit murni (sangat lunak dan ulet)',
        'C. Grafit bulat nodular',
        'D. Austenit sisa yang fleksibel'
      ],
      correct: 0,
      explanation: 'Martensit adalah larutan padat lewat jenuh karbon dalam besi alpha berstruktur Body-Centered Tetragonal (BCT) yang menghasilkan kisi tegang berkekerasan sangat tinggi namun getas.'
    },
    {
      id: 5,
      domain: 'Proses Tempering',
      question: 'Mengapa baja yang baru saja selesai dikeraskan (quenched) WAJIB dilanjutkan dengan proses pemanasan kembali (tempering)?',
      options: [
        'A. Menurunkan tegangan sisa internal dan kerapuhan ekstrem serta meningkatkan keuletan/ketangguhan baja',
        'B. Mengembalikan ukuran dimensi benda yang membesar menjadi menyusut',
        'C. Memberikan lapisan warna emas pada permukaan baja',
        'D. Menghilangkan kandungan besi dari baja perkakas'
      ],
      correct: 0,
      explanation: 'Baja hasil quench sangat getas dan menyimpan tegangan dalam tinggi sehingga mudah pecah mendadak. Tempering menurunkan kerapuhan dan mengembalikan ketangguhan mekanik.'
    },
    {
      id: 6,
      domain: 'Proses Annealing (Pelunakan)',
      question: 'Ciri khas proses pendinginan pada perlakuan panas pelunakan penuh (Full Annealing) adalah...',
      options: [
        'A. Benda kerja didinginkan sangat perlahan bersama tungku pemanas yang dimatikan (furnace cooling)',
        'B. Benda kerja langsung dicelupkan ke dalam drum berisi es batu',
        'C. Benda kerja dikeluarkan lalu disemprot air bertekanan tinggi',
        'D. Didinginkan di ruangan terbuka di bawah tiupan kipas angin tornado'
      ],
      correct: 0,
      explanation: 'Annealing membutuhkan pendinginan super lambat (misal 10°C - 30°C per jam) di dalam ruang tungku pemanas untuk menghasilkan struktur butir kasar yang sangat lunak dan bebas tegangan.'
    },
    {
      id: 7,
      domain: 'Normalizing',
      question: 'Tujuan utama dilakukannya perlakuan panas Normalizing (penyeragaman) pada benda kerja hasil proses tempa (forging) atau coran adalah...',
      options: [
        'A. Menyeragamkan ukuran dan bentuk butiran kristal serta menghilangkan tegangan struktur',
        'B. Membuat permukaan baja menjadi sekeras intan',
        'C. Mengubah seluruh baja menjadi baja tahan karat',
        'D. Menghilangkan lubang porositas dengan cara pengelasan panas'
      ],
      correct: 0,
      explanation: 'Normalizing memanaskan baja di atas A3 kemudian didinginkan di udara tenang (still air) untuk meregenerasi dan menghaluskan susunan butiran kristal mikrostruktur yang seragam.'
    },
    {
      id: 8,
      domain: 'Case Hardening (Karburasi)',
      question: 'Baja karbon rendah (kadar C < 0.25%) tidak dapat dikeraskan langsung dengan quenching biasa. Metode yang tepat untuk mengeraskan permukaan roda giginya adalah...',
      options: [
        'A. Case Hardening (Karburasi) untuk mendifusikan atom karbon ke permukaan luar benda kerja',
        'B. Merendam baja dalam air es selama 24 jam',
        'C. Melakukan pendinginan di dalam oli pelumas dingin',
        'D. Mengikis permukaan baja menggunakan batu amplas kasar'
      ],
      correct: 0,
      explanation: 'Karburasi mendifusikan karbon pada suhu tinggi ke lapisan kulit luar benda kerja sehingga kulitnya menjadi baja karbon tinggi yang bisa dikeraskan, sedangkan bagian inti tetap ulet liat.'
    },
    {
      id: 9,
      domain: 'Proses Blackening (Black Oxide)',
      question: 'Keunggulan utama pelapisan konversi kimia Black Oxide (Blackening 7-Bak) pada komponen mesin presisi dibanding pengecatan tebal adalah...',
      options: [
        'A. Tidak mengubah dimensi geometris benda kerja (penambahan tebal 0.000 mm) dan tahan korosi ringan',
        'B. Menambah ketebalan dinding sebesar 1 hingga 2 milimeter',
        'C. Meningkatkan kekerasan hingga setara mata intan bor',
        'D. Menghantarkan arus listrik tegangan ekstra tinggi'
      ],
      correct: 0,
      explanation: 'Black oxide membentuk lapisan tipis konversi magnetit (Fe3O4) dari reaksi kimia permukaan logam itu sendiri dengan toleransi 0.000 mm sehingga pasak dan poros presisi tidak berubah ukuran.'
    },
    {
      id: 10,
      domain: 'Uji Percikan Baja (Spark Testing)',
      question: 'Pada pengujian percikan api di mesin gerinda duduk (spark testing), pola percikan dengan banyak ledakan bunga api bercabang lebat (bintang meledak-ledak) menandakan bahwa baja tersebut...',
      options: [
        'A. Memiliki kadar karbon tinggi (High Carbon Steel)',
        'B. Merupakan besi murni tanpa kandungan karbon (Wrought Iron)',
        'C. Logam non-ferro seperti aluminium atau tembaga murni',
        'D. Plastik polimer berkekuatan tinggi'
      ],
      correct: 0,
      explanation: 'Karbon bereaksi dengan oksigen saat serpihan berpijar, meledak menjadi bunga api bintang berulang kali. Semakin tinggi kadar karbon, semakin lebat dan ramai percikan bunga api yang terbentuk.'
    }
  ],

  // =========================================================================
  // 4. MEKANIKA TEKNIK (10 SOAL)
  // =========================================================================
  mechanics: [
    {
      id: 1,
      domain: 'Konsep Momen Gaya (Torsi)',
      question: 'Sebuah kunci pas dengan panjang gagang r = 25 cm (0.25 m) ditarik tegak lurus dengan gaya F = 80 N untuk mengencangkan baut. Berapakah momen gaya (torsi) yang dihasilkan? (Rumus: τ = F x r)',
      options: [
        'A. 20 Nm',
        'B. 320 Nm',
        'C. 200 Nm',
        'D. 2 Nm'
      ],
      correct: 0,
      explanation: 'τ = F x r = 80 N x 0.25 m = 20 Nm. Momen gaya bertambah besar seiring dengan bertambahnya panjang lengan momen.'
    },
    {
      id: 2,
      domain: 'Penggunaan Kunci Momen (Torque Wrench)',
      question: 'Mengapa baut silinder head pada blok mesin sepeda motor atau mobil wajib dikencangkan dengan Kunci Momen (Torque Wrench) sesuai buku manual servis?',
      options: [
        'A. Memastikan tegangan pengencangan seragam sesuai batas elastis baut tanpa merusak ulir atau mendistorsi kepala silinder',
        'B. Agar baut dapat dikencangkan sekuat-kuat tenaga mekanik tanpa batas',
        'C. Supaya baut tidak pernah bisa dilepas lagi selamanya',
        'D. Menghilangkan bunyi bising mesin saat dinyalakan'
      ],
      correct: 0,
      explanation: 'Torsi yang terlalu kendor memicu kebocoran kompresi, sedangkan torsi berlebihan meregangkan baut melewati batas luluh dan membuat blok aluminium retak/melintir.'
    },
    {
      id: 3,
      domain: 'Sistem Tuas Kelas Pertama',
      question: 'Pada sistem tuas jenis pertama (Class 1 Lever), posisi titik tumpu (fulcrum) berada di...',
      options: [
        'A. Di antara titik gaya kuasa dan titik beban (contoh: tang pemotong, linggis)',
        'B. Di salah satu ujung dengan titik beban berada di tengah',
        'C. Di tempat yang sama dengan titik kuasa operator',
        'D. Di luar bidang kerja tuas'
      ],
      correct: 0,
      explanation: 'Tuas kelas 1 memiliki susunan Kuasa - Tumpuan - Beban. Contoh peralatan bengkel adalah tang kombinasi, gunting pelat, dan linggis pengungkit mesin.'
    },
    {
      id: 4,
      domain: 'Keuntungan Mekanis Tuas',
      question: 'Sebuah tuas memiliki panjang lengan kuasa Lk = 120 cm dan lengan beban Lb = 30 cm. Berapakah keuntungan mekanis (KM) tuas tersebut? (Rumus: KM = Lk / Lb)',
      options: [
        'A. 4 kali',
        'B. 0.25 kali',
        'C. 3.6 kali',
        'D. 36 kali'
      ],
      correct: 0,
      explanation: 'KM = Lk / Lb = 120 / 30 = 4 kali. Artinya gaya kuasa yang diperlukan operator untuk mengangkat beban menjadi 4 kali lebih ringan dibanding mengangkat langsung.'
    },
    {
      id: 5,
      domain: 'Sistem Tuas Kelas Kedua',
      question: 'Contoh peralatan kerja bengkel fabrikasi yang menerapkan prinsip tuas jenis kedua (Beban berada di antara Titik Tumpu dan Kuasa) adalah...',
      options: [
        'A. Mesin pemotong pelat manual sistem tuas (Hand Lever Shear)',
        'B. Pinset penjepit komponen elektronik mini',
        'C. Tang penjepit kabel',
        'D. Palu martil saat memukul paku'
      ],
      correct: 0,
      explanation: 'Pada hand lever shear pemotong pelat, engsel tumpuan berada di ujung depan, mata pisau penekan beban berada di tengah, dan gagang tuas kuasa ditarik di ujung belakang (KM > 1).'
    },
    {
      id: 6,
      domain: 'Kesetimbangan Statis Balok',
      question: 'Sebuah balok horizontal berada dalam kondisi kesetimbangan statis statis jika memenuhi syarat kesetimbangan gaya dan momen berikut, yaitu...',
      options: [
        'A. ΣFx = 0, ΣFy = 0, dan ΣM = 0',
        'B. ΣF > 0 dan ΣM > 0',
        'C. Hanya gaya vertikal yang berjumlah nol (ΣFy = 0)',
        'D. Kecepatan balok bertambah secara konstan'
      ],
      correct: 0,
      explanation: 'Kesetimbangan statis rigid body mensyaratkan resultan seluruh gaya horizontal (ΣFx), resultan gaya vertikal (ΣFy), dan jumlah momen di setiap titik acuan (ΣM) sama dengan nol.'
    },
    {
      id: 7,
      domain: 'Konsep Tegangan Tarik (Tensile Stress)',
      question: 'Batang silinder baja dengan luas penampang A = 20 mm² ditarik gaya aksial F = 4.000 N. Berapakah tegangan tarik (σ) yang terjadi pada penampang batang? (Rumus: σ = F / A)',
      options: [
        'A. 200 N/mm² (MPa)',
        'B. 80.000 N/mm²',
        'C. 20 N/mm²',
        'D. 0.005 N/mm²'
      ],
      correct: 0,
      explanation: 'σ = F / A = 4000 N / 20 mm² = 200 N/mm² (setara dengan 200 MPa).'
    },
    {
      id: 8,
      domain: 'Regangan Normal (Strain)',
      question: 'Kawat uji tarik dengan panjang mula-mula L0 = 100 mm bertambah panjang menjadi L = 100.5 mm saat dibebani. Berapakah regangan teknik (ε) kawat tersebut? (Rumus: ε = ΔL / L0)',
      options: [
        'A. 0.005 (tanpa satuan atau 0.5%)',
        'B. 0.5 mm',
        'C. 50 N',
        'D. 200 MPa'
      ],
      correct: 0,
      explanation: 'ΔL = 100.5 - 100 = 0.5 mm. ε = ΔL / L0 = 0.5 / 100 = 0.005. Regangan merupakan nilai nisbi perbandingan tanpa satuan dimensi.'
    },
    {
      id: 9,
      domain: 'Sistem Katrol dan Chain Block',
      question: 'Pada sistem derek rantai manual (Chain Block) di bengkel perawatan mesin, kelebihan gaya angkat operator diperoleh dari...',
      options: [
        'A. Keuntungan mekanis susunan roda gigi reduksi (planetary gear) dan puli rantai penahan beban',
        'B. Pemanasan motor listrik berkecepatan tinggi',
        'C. Penggunaan oli pelumas berkadar asam pekat',
        'D. Pengurangan massa beban saat diangkat ke atas udara'
      ],
      correct: 0,
      explanation: 'Chain block menggunakan transmisi roda gigi reduksi ganda dan katrol penahan sehingga gaya tarik tangan yang kecil mampu mengangkat mesin berbobot berton-ton.'
    },
    {
      id: 10,
      domain: 'Hukum Gesekan pada Bidang Miring',
      question: 'Sebuah peti mesin digeser naik pada bidang miring. Apa pengaruh penggunaan pelat peluncur beralas roda gelinding (roller skids) dibanding menyeret langsung peti tersebut?',
      options: [
        'A. Koefisien gesek gelinding jauh lebih kecil dibanding koefisien gesek luncur statis sehingga gaya tarik menjadi jauh lebih ringan',
        'B. Menambah berat beban peti mesin',
        'C. Menghilangkan gaya gravitasi bumi seketika',
        'D. Mempercepat keausan lantai semen bengkel'
      ],
      correct: 0,
      explanation: 'Koefisien gesekan gelinding (rolling friction) jauh lebih rendah daripada gesekan geser (sliding friction), mereduksi gaya dorong/tarik yang dibutuhkan secara signifikan.'
    }
  ],

  // =========================================================================
  // 5. WELDING LAB (10 SOAL)
  // =========================================================================
  welding: [
    {
      id: 1,
      domain: 'Prinsip Las SMAW',
      question: 'Prinsip dasar pembentukan sambungan logam pada proses las busur listrik SMAW (Shielded Metal Arc Welding) adalah...',
      options: [
        'A. Pencairan logam dasar dan elektroda melalui loncatan busur listrik bertegangan rendah berarus tinggi yang dilindungi selaput fluks',
        'B. Penekanan dua pelat logam menggunakan roda tembaga berputar tanpa elektroda tambahan',
        'C. Pembakaran gas asetilin dan oksigen murni untuk melunakkan kawat solder timah',
        'D. Perekatan logam dingin menggunakan cairan kimia epoksi dua komponen'
      ],
      correct: 0,
      explanation: 'SMAW memanfaatkan loncatan busur api listrik antara ujung elektroda berselaput dengan benda kerja (suhu mencapai 3000°C - 5000°C) yang mencairkan logam secara serentak.'
    },
    {
      id: 2,
      domain: 'Kode Elektroda AWS E6013',
      question: 'Pada kode elektroda las busur listrik menurut standar AWS A5.1 "E6013", arti angka "60" menyatakan...',
      options: [
        'A. Kekuatan tarik minimum logam las sebesar 60.000 psi (pon per inci persegi)',
        'B. Panjang kawat elektroda 60 sentimeter',
        'C. Diameter kawat inti sebesar 6.0 milimeter',
        'D. Kuat arus listrik pengelasan wajib 60 Ampere'
      ],
      correct: 0,
      explanation: 'Dua angka pertama (atau 3 angka pada E70xx/E100xx) menunjukkan kuat tarik minimum (tensile strength) x 1000 psi. E60 = 60.000 psi (~42 kg/mm²).'
    },
    {
      id: 3,
      domain: 'Posisi Pengelasan Kode AWS',
      question: 'Pada kode elektroda AWS E6013, arti digit ketiga angka "1" menunjukkan bahwa elektroda tersebut dapat digunakan untuk posisi...',
      options: [
        'A. Semua posisi pengelasan (datar, horizontal, vertikal, dan di atas kepala / overhead)',
        'B. Hanya posisi datar (flat position) saja',
        'C. Hanya posisi vertikal turun (vertical down) saja',
        'D. Khusus pengelasan di dalam air laut (underwater)'
      ],
      correct: 0,
      explanation: 'Angka 1 = semua posisi pengelasan (all positions). Angka 2 = hanya posisi flat dan horizontal fillet. Angka 4 = vertikal turun khusus.'
    },
    {
      id: 4,
      domain: 'Fungsi Selaput Fluks (Flux Coating)',
      question: 'Salah satu fungsi krusial dari selaput fluks yang membungkus kawat inti elektroda las SMAW saat terbakar adalah...',
      options: [
        'A. Menghasilkan gas pelindung dan terak (slag) cair untuk melindungi cairan logam las dari kontaminasi oksigen dan nitrogen udara luar',
        'B. Mendinginkan kawat elektroda agar tidak cepat mencair',
        'C. Mengubah arus AC dari trafo las menjadi arus DC otomatis',
        'D. Menempelkan elektroda secara permanen pada klem masa'
      ],
      correct: 0,
      explanation: 'Fluks yang terbakar menghasilkan atmosfer gas pelindung (CO2/CO) dan lapisan terak (slag) yang mengapung di atas kawah las, mencegah oksidasi dan pembentukan gelembung porositas.'
    },
    {
      id: 5,
      domain: 'Polaritas Pengelasan DC',
      question: 'Pengelasan DC dengan konfigurasi DCEP (Direct Current Electrode Positive / Polaritas Terbalik) memiliki karakteristik utama...',
      options: [
        'A. Penetrasi tembusan las yang lebih dalam pada benda kerja dasar',
        'B. Elektroda tidak memanas sama sekali selama pengelasan',
        'C. Terak las tidak perlu dibersihkan setelah selesai',
        'D. Benda kerja selalu tetap dingin di bawah 0°C'
      ],
      correct: 0,
      explanation: 'Pada DCEP (elektroda kutub positif), 70% panas busur terkonsentrasi pada benda kerja (kutub negatif) sehingga menghasilkan penetrasi akar las yang dalam.'
    },
    {
      id: 6,
      domain: 'Penyetelan Arus (Ampere) Las',
      question: 'Apa akibat yang terjadi pada hasil sambungan las jika operator menyetel kuat arus (Ampere) TERLALU TINGGI melebihi batas rekomendasi elektroda?',
      options: [
        'A. Terjadi cacat bakar tembus (burn through), alur undercut di tepi las, dan percikan (spatter) berlebihan',
        'B. Busur las sangat sulit menyala dan elektroda terus-menerus menempel membeku',
        'C. Penetrasi las menjadi sangat dangkal dan tidak menyatu',
        'D. Elektroda las bertambah panjang secara otomatis'
      ],
      correct: 0,
      explanation: 'Arus terlalu tinggi menyebabkan kawah las terlalu cair dan bergolak hebat, mengikis dinding sambungan (undercut) dan menimbulkan semburan spatter yang kotor.'
    },
    {
      id: 7,
      domain: 'Panjang Busur Nyala (Arc Length)',
      question: 'Berapakah jarak panjang busur nyala (arc length) yang ideal antara ujung kawat elektroda dengan kawah las?',
      options: [
        'A. Kira-kira sama dengan diameter kawat inti elektroda (misal kawat Ø 3.2 mm maka jarak busur ~3 mm)',
        'B. Minimal 20 mm hingga 30 mm dari permukaan pelat',
        'C. Menekan kuat menyentuh pelat hingga tidak ada celah',
        'D. Sekitar 1 meter di atas meja las'
      ],
      correct: 0,
      explanation: 'Panjang busur standar sama dengan diameter kawat inti elektroda (1 x d). Busur terlalu panjang menyebabkan percikan banyak dan gas pelindung hilang.'
    },
    {
      id: 8,
      domain: 'Alat Pelindung Diri (APD) Las',
      question: 'Kaca filter gelap pada topeng/kedok las (welding helmet) nomor shade DIN 10 - 11 wajib digunakan saat mengelas busur listrik untuk melindungi mata dari bahaya...',
      options: [
        'A. Radiasi sinar ultraviolet (UV) dan inframerah (IR) intensitas tinggi yang memicu radang mata (arc eye / welders flash)',
        'B. Percikan tetesan air pendingin biasa',
        'C. Hembusan angin sepoi-sepoi bengkel',
        'D. Suara bising kompresor udara'
      ],
      correct: 0,
      explanation: 'Sinar busur listrik memancarkan sinar UV dan inframerah intensitas tinggi yang dapat membakar kornea mata dalam hitungan detik dan merusak retina secara permanen.'
    },
    {
      id: 9,
      domain: 'Cacat Las Undercut',
      question: 'Cacat las berupa alur parit celah termakan pada pinggiran jalur las yang tidak terisi logam cair pengisi disebut...',
      options: [
        'A. Undercut',
        'B. Porosity',
        'C. Incomplete Penetration',
        'D. Slag Inclusion'
      ],
      correct: 0,
      explanation: 'Undercut adalah lekukan parit pada batas tepi sambungan las akibat arus terlalu tinggi atau ayunan elektroda terlalu cepat di bagian tepi sisi sambungan.'
    },
    {
      id: 10,
      domain: 'Pembersihan Terak Las',
      question: 'Saat membersihkan terak las (slag) yang membeku menggunakan palu terak (chipping hammer) dan sikat baja, operator wajib mengenakan...',
      options: [
        'A. Kacamata pengaman bening (safety clear glasses) untuk mencegah serpihan terak panas memantul mengenai mata',
        'B. Sarung tangan kain rajut tipis yang basah',
        'C. Sandal jepit karet santai',
        'D. Menutup kedua mata rapat-rapat saat memukul'
      ],
      correct: 0,
      explanation: 'Serpihan terak las sangat rapuh, tajam, dan bersuhu tinggi. Saat dipukul palu terak, serpihan terak mudah melenting tajam ke arah mata operator.'
    }
  ],

  // =========================================================================
  // 6. ALAT UKUR PRESISI (10 SOAL)
  // =========================================================================
  measuring: [
    {
      id: 1,
      domain: 'Jangka Sorong Ketelitian 0.05 mm',
      question: 'Pada jangka sorong dengan ketelitian 0.05 mm, skala nonius terdiri dari 20 bagian garis skala yang bernilai total 39 mm. Berapakah nilai 1 strip bagian skala nonius tersebut?',
      options: [
        'A. 0.05 mm',
        'B. 0.50 mm',
        'C. 0.02 mm',
        'D. 0.01 mm'
      ],
      correct: 0,
      explanation: 'Ketelitian alat ukur jangka sorong dihitung dari nilai skala utama (1 mm) dibagi jumlah pembagian skala nonius (20 bagian) = 1/20 = 0.05 mm.'
    },
    {
      id: 2,
      domain: 'Pembacaan Jangka Sorong 0.05 mm',
      question: 'Garis nol skala nonius jangka sorong berada di antara angka 24 mm dan 25 mm skala utama. Garis skala nonius ke-6 berimpit lurus dengan garis skala utama. Berapakah hasil pembacaannya?',
      options: [
        'A. 24.30 mm',
        'B. 24.06 mm',
        'C. 24.60 mm',
        'D. 25.30 mm'
      ],
      correct: 0,
      explanation: 'Skala utama = 24 mm. Skala nonius = garis ke-6 x 0.05 mm = 0.30 mm. Hasil ukur = 24 + 0.30 = 24.30 mm.'
    },
    {
      id: 3,
      domain: 'Mikrometer Luar Ketelitian 0.01 mm',
      question: 'Pada mikrometer luar (outside micrometer) standar kisar ulir poros 0.5 mm, tabung putar (thimble) dibagi menjadi 50 bagian skala melingkar. Nilai setiap 1 strip perputaran thimble adalah...',
      options: [
        'A. 0.01 mm',
        'B. 0.10 mm',
        'C. 0.05 mm',
        'D. 0.001 mm'
      ],
      correct: 0,
      explanation: 'Ketelitian mikrometer = Kisar poros (0.5 mm) dibagi jumlah skala putar thimble (50 bagian) = 0.5 / 50 = 0.01 mm.'
    },
    {
      id: 4,
      domain: 'Fungsi Ratchet Stop Mikrometer',
      question: 'Fungsi mekanisme rachet stop (roda bergerigi berbunyi klik di ujung mikrometer) saat melakukan pengukuran adalah...',
      options: [
        'A. Menjaga tekanan kontak pengukuran tetap konstan dan seragam agar benda tidak tertekan berlebih',
        'B. Mengunci poros spindel mikrometer agar tidak bergeser',
        'C. Memutar mikrometer dengan kecepatan putaran tinggi',
        'D. Mengikis permukaan benda kerja yang kasar'
      ],
      correct: 0,
      explanation: 'Rachet stop dilengkapi pegas gesek yang akan selip dan berbunyi klik setelah tekanan ukur ideal tercapai, mencegah kesalahan ukur akibat penekanan berlebih oleh tangan.'
    },
    {
      id: 5,
      domain: 'Kalibrasi Titik Nol (Zero Error)',
      question: 'Saat kedua rahang ukur mikrometer dikatupkan rapat tanpa benda kerja, garis nol thimble berada 2 strip di atas garis sumbu tabung tetap (+0.02 mm). Maka pembacaan benda kerja harus...',
      options: [
        'A. Dikurangi 0.02 mm dari angka pembacaan akhir',
        'B. Ditambah 0.02 mm dari angka pembacaan akhir',
        'C. Dikalikan dua kali lipat',
        'D. Dibiarkan saja tanpa koreksi apa pun'
      ],
      correct: 0,
      explanation: 'Kesalahan nol positif (+0.02 mm) berarti mikrometer membaca lebih besar dari ukuran sebenarnya, sehingga ukuran riil = hasil baca - kesalahan nol (0.02 mm).'
    },
    {
      id: 6,
      domain: 'Dial Indicator (Jam Ukur)',
      question: 'Alat ukur dial indicator (jam ukur analog ketelitian 0.01 mm) paling tepat diaplikasikan di bengkel pemesinan untuk...',
      options: [
        'A. Memeriksa kebulatan (run-out), kelurusan, dan kesejajaran permukaan poros saat diputar di atas blok V',
        'B. Mengukur panjang total balok baja sepanjang 3 meter',
        'C. Mengukur berat massa benda kerja coran',
        'D. Menentukan suhu pembakaran tungku heat treatment'
      ],
      correct: 0,
      explanation: 'Dial indicator berfungsi mengukur penyimpangan geometri kecil (kerataan, run-out, paralelisme) dengan mentransmisikan gerakan sensor jarum peraba ke piringan jam jarum ukur.'
    },
    {
      id: 7,
      domain: 'Mistar Sorong Jam (Dial Caliper)',
      question: 'Kelebihan utama jangka sorong jam ukur (Dial Caliper) dibandingkan jangka sorong nonius garis manual adalah...',
      options: [
        'A. Pembacaan nilai desimal lebih cepat, jelas, dan meminimalisir kesalahan pembacaan mata paralaks',
        'B. Tidak memerlukan perawatan dan tidak bisa rusak bila terjatuh',
        'C. Dapat dipakai mengukur diameter hingga jarak 5 meter',
        'D. Harganya selalu lebih murah dari mistar ukur plastik'
      ],
      correct: 0,
      explanation: 'Jarum pada dial caliper langsung menunjuk angka desimal yang tertera pada piringan jam sehingga operator tidak perlu memicingkan mata mencari garis nonius yang lurus berimpit.'
    },
    {
      id: 8,
      domain: 'Busur Derajat Universal (Bevel Protractor)',
      question: 'Tingkat ketelitian alat ukur sudut presisi Universal Bevel Protractor yang dilengkapi skala nonius sudut adalah...',
      options: [
        'A. 5 menit (5\') atau 1/12 derajat',
        'B. 1 derajat utuh (1°)',
        'C. 0.01 milimeter (0.01 mm)',
        'D. 10 detik busur (10\")'
      ],
      correct: 0,
      explanation: 'Universal Bevel Protractor membagi 1 derajat (60 menit) menjadi 12 bagian skala nonius, sehingga ketelitian pembacaan sudutnya adalah 60\' / 12 = 5 menit (5\').'
    },
    {
      id: 9,
      domain: 'Sistem Toleransi ISO',
      question: 'Dalam penulisan toleransi standar ISO pada gambar kerja teknik pemesinan, penulisan simbol huruf kapital "H7" dan huruf kecil "h6" menunjukkan...',
      options: [
        'A. Huruf kapital (H7) untuk daerah toleransi LUBANG, dan huruf kecil (h6) untuk toleransi POROS',
        'B. Huruf kapital untuk poros dan huruf kecil untuk lubang',
        'C. Huruf H menunjukkan baja keras dan huruf h menunjukkan baja lunak',
        'D. Keduanya menunjukkan jenis pahat potong bubut'
      ],
      correct: 0,
      explanation: 'Sistem toleransi ISO menetapkan huruf BESAR (kapital seperti H, G, F) untuk toleransi lubang/elemen dalam, dan huruf kecil (seperti h, g, f) untuk poros/elemen luar.'
    },
    {
      id: 10,
      domain: 'Suhu Standar Pengukuran Metrologi',
      question: 'Sesuai standar Metrologi Internasional (ISO 1), seluruh kalibrasi dan pengukuran presisi benda kerja logam harus diukur pada suhu acuan baku sebesar...',
      options: [
        'A. 20°C (68°F)',
        'B. 0°C (32°F)',
        'C. 27°C (suhu tropis kamar)',
        'D. 100°C (suhu air mendidih)'
      ],
      correct: 0,
      explanation: 'ISO 1 menetapkan 20°C sebagai suhu referensi standar internasional untuk pengukuran geometri metrologi presisi guna meniadakan kesalahan muai panas material.'
    }
  ],

  // =========================================================================
  // 7. DESIGN LAB & GAMBAR TEKNIK (10 SOAL)
  // =========================================================================
  design: [
    {
      id: 1,
      domain: 'Proyeksi Amerika vs Eropa',
      question: 'Pada gambar teknik manufaktur dengan standar Proyeksi Amerika (Third Angle Projection), letak penempatan pandangan samping kanan terhadap pandangan depan berada di...',
      options: [
        'A. Sebelah KANAN dari gambar pandangan depan',
        'B. Sebelah KIRI dari gambar pandangan depan',
        'C. Di bagian BAWAH dari gambar pandangan depan',
        'D. Di lembar kertas terpisah'
      ],
      correct: 0,
      explanation: 'Proyeksi sudut ketiga (Amerika) menempatkan proyeksi searah pandangan mata: pandangan kanan diletakkan di kanan pandangan depan, pandangan atas di atas pandangan depan.'
    },
    {
      id: 2,
      domain: 'Standar Garis Gambar ISO',
      question: 'Garis gores-titik tipis (Chain thin line / garis strip-titik) pada gambar teknik mesin standar ISO berfungsi untuk menggambarkan...',
      options: [
        'A. Sumbu simetri benda putar dan sumbu pusat lingkaran lubang',
        'B. Garis tepi benda kerja yang tampak nyata terlihat mata',
        'C. Garis batas ukuran dan garis penunjuk dimensi',
        'D. Garis arsir penampang potongan'
      ],
      correct: 0,
      explanation: 'Garis strip-titik tipis (dash-dot) difungsikan khusus sebagai garis sumbu perputaran, garis simetri, lintasan gerak, dan lingkaran jarak baut.'
    },
    {
      id: 3,
      domain: 'Garis Tersembunyi (Hidden Line)',
      question: 'Garis putus-putus sedang (Dashed line) pada gambar proyeksi ortogonal digunakan untuk mewakili...',
      options: [
        'A. Garis tepi atau kontur benda kerja yang terhalang/tersembunyi dari pandangan mata',
        'B. Garis pemotong kertas etiket gambar',
        'C. Garis batas air radiator pendingin',
        'D. Garis petunjuk pembuatan sketsa'
      ],
      correct: 0,
      explanation: 'Tepi atau sudut benda kerja yang tidak langsung terlihat dari arah pandang pengamat harus digambar menggunakan garis gores/putus-putus (hidden line).'
    },
    {
      id: 4,
      domain: 'Garis Arsir Penampang Potongan',
      question: 'Pada gambar potongan (section view), bidang penampang material padat yang terpotong ditandai dengan garis arsir miring bersudut...',
      options: [
        'A. 45° terhadap garis sumbu atau garis kontur utama',
        'B. 90° tegak lurus vertikal',
        'C. 0° horizontal sejajar dasar kertas',
        'D. 180° berlawanan arah'
      ],
      correct: 0,
      explanation: 'Standar ISO mengatur garis arsir penampang dipotong digambar menggunakan garis tipis kontinu dengan kemiringan 45° terhadap sumbu simetri atau garis tepi benda.'
    },
    {
      id: 5,
      domain: 'Penulisan Toleransi Linier',
      question: 'Pada gambar kerja poros tertulis dimensi ukuran "Ø 30 ± 0.05 mm". Berapakah ukuran diameter batas maksimum dan batas minimum poros yang diizinkan untuk diluluskan QC?',
      options: [
        'A. Maksimum 30.05 mm dan Minimum 29.95 mm',
        'B. Maksimum 30.50 mm dan Minimum 29.50 mm',
        'C. Maksimum 31.00 mm dan Minimum 29.00 mm',
        'D. Harus tepat 30.00 mm tanpa toleransi'
      ],
      correct: 0,
      explanation: 'Batas atas = 30 + 0.05 = 30.05 mm. Batas bawah = 30 - 0.05 = 29.95 mm. Benda kerja dengan ukuran di luar rentang tersebut dinyatakan cacat (reject).'
    },
    {
      id: 6,
      domain: 'Simbol Kekasaran Permukaan (Ra)',
      question: 'Angka nilai pada simbol kekasaran permukaan centang (permukaan hasil pengerjaan mesin) menunjukkan parameter Ra dalam satuan ukuran...',
      options: [
        'A. Mikrometer (µm)',
        'B. Milimeter (mm)',
        'C. Centimeter (cm)',
        'D. Derajat Celcius (°C)'
      ],
      correct: 0,
      explanation: 'Ra (Roughness Average) mengukur deviasi rata-rata aritmetika profil kekasaran permukaan dari garis tengah profil dalam satuan mikrometer (1 µm = 0.001 mm).'
    },
    {
      id: 7,
      domain: 'Toleransi Geometris GD&T',
      question: 'Simbol toleransi geometris berupa lingkaran dengan tanda tambah di dalamnya (⨁) pada kotak kontrol fitur GD&T melambangkan toleransi...',
      options: [
        'A. Posisi (Position tolerance)',
        'B. Kebulatan (Circularity)',
        'C. Kerataan (Flatness)',
        'D. Ketegaklurusan (Perpendicularity)'
      ],
      correct: 0,
      explanation: 'Simbol ⨁ adalah simbol toleransi posisi (true position) yang membatasi penyimpangan lokasi sumbu lubang atau pin dari posisi teoretis sejatinya.'
    },
    {
      id: 8,
      domain: 'Fitur 3D CAD: Extrude',
      question: 'Dalam aplikasi pemodelan 3D CAD (seperti SolidWorks, Inventor, Fusion 360), perintah dasar untuk mengubah sketsa 2D tertutup menjadi bentuk benda padat 3D dengan memberikan ketebalan linier adalah...',
      options: [
        'A. Extrude (Extruded Boss/Base)',
        'B. Revolve',
        'C. Fillet',
        'D. Chamfer'
      ],
      correct: 0,
      explanation: 'Extrude menarik profil sketsa 2D tegak lurus bidang sketsa sepanjang dimensi jarak tertentu untuk menghasilkan benda padat prisma/silinder 3D.'
    },
    {
      id: 9,
      domain: 'Fitur 3D CAD: Revolve',
      question: 'Perintah pemodelan 3D CAD yang paling efisien untuk membuat komponen poros bertingkat atau puli V-belt adalah...',
      options: [
        'A. Revolve (memutar separuh profil sketsa 2D mengelilingi sumbu rotasi 360°)',
        'B. Shell (mengosongkan bagian dalam)',
        'C. Mirror 3D bertingkat',
        'D. Menggambar 100 lapis sketsa tipis'
      ],
      correct: 0,
      explanation: 'Fitur Revolve memutar profil penampang 2D mengelilingi satu garis sumbu putar (axis) hingga 360°, sangat ideal dan cepat untuk membuat seluruh geometri benda putar silindris.'
    },
    {
      id: 10,
      domain: 'Standar Kertas Gambar ISO Seri A',
      question: 'Berdasarkan standar ISO 216, ukuran dimensi kertas gambar teknik format A3 adalah...',
      options: [
        'A. 297 x 420 mm',
        'B. 210 x 297 mm',
        'C. 420 x 594 mm',
        'D. 594 x 841 mm'
      ],
      correct: 0,
      explanation: 'Format kertas ISO seri A: A4 = 210 x 297 mm, A3 = 297 x 420 mm (dua kali ukuran A4), A2 = 420 x 594 mm, A1 = 594 x 841 mm, dan A0 = 841 x 1189 mm (1 m²).'
    }
  ],

  // =========================================================================
  // 8. SAFETY LAB, K3LH & 5R (10 SOAL)
  // =========================================================================
  safety: [
    {
      id: 1,
      domain: 'Bahaya Mekanik Bengkel Mesin',
      question: 'Mengapa operator DILARANG KERAS mengenakan sarung tangan kain rajut saat mengoperasikan mesin bubut, mesin bor, atau mesin frais?',
      options: [
        'A. Serabut benang kain sangat mudah tersangkut pada poros/benda kerja berputar dan dapat menarik tangan hingga tergilas mesin seketika',
        'B. Sarung tangan membuat tangan operator cepat berkeringat',
        'C. Sarung tangan dapat mengotori handel eretan mesin',
        'D. Menghalangi semprotan cairan pendingin coolant'
      ],
      correct: 0,
      explanation: 'Bahaya keterbelitan (entanglement hazard)! Serabut kain rajut yang menyentuh spindel berputar 500 RPM akan melilit dan menarik jari/lengan ke dalam mesin dalam 0.1 detik.'
    },
    {
      id: 2,
      domain: 'APD Wajib di Bengkel Mesin',
      question: 'Alat Pelindung Diri (APD) primer yang WAJIB selalu terpasang di wajah saat memasuki area bengkel permesinan aktif adalah...',
      options: [
        'A. Kacamata pengaman (safety glasses dengan pelindung samping tahan benturan)',
        'B. Masker kain motif batik santai',
        'C. Topi pet terbalik',
        'D. Sarung tangan wol musim dingin'
      ],
      correct: 0,
      explanation: 'Serpihan tatal beram tajam berkecepatan tinggi dapat melayang kapan saja di area bengkel mesin. Kacamata pengaman standar ANSI Z87.1 mutlak wajib dipakai.'
    },
    {
      id: 3,
      domain: 'Pakaian Kerja Bengkel Mesin',
      question: 'Ketentuan pakaian kerja (wearpack) yang aman saat mengoperasikan mesin bubut konvensional adalah...',
      options: [
        'A. Lengan baju dikancingkan rapi atau digulung ke dalam di atas siku, dan baju dimasukkan ke dalam celana tanpa tali yang menjulur',
        'B. Memakai syal leher panjang dan jaket hoodie berkerudung longgar',
        'C. Menggunakan perhiasan cincin, gelang rantai, dan jam tangan longgar',
        'D. Memakai baju kaos tanpa kancing yang robek-robek'
      ],
      correct: 0,
      explanation: 'Pakaian yang longgar, syal, dasi, atau ujung lengan menjuntai adalah pemicu fatal keterbelitan pada mesin perkakas berputar.'
    },
    {
      id: 4,
      domain: 'Pemadaman APAR Teknik PASS',
      question: 'Urutan 4 langkah standar pengoperasian Alat Pemadam Api Ringan (APAR) dengan akronim internasional "PASS" adalah...',
      options: [
        'A. Pull (cabut pin) -> Aim (arahkan nozzle ke dasar api) -> Squeeze (tekan tuas) -> Sweep (sapukan sisi ke sisi)',
        'B. Push (dorong tabung) -> Aim (arahkan) -> Shake (kocok) -> Stop (berhenti)',
        'C. Pull (tarik selang) -> Alert (teriak) -> Spray (semprot atas) -> Sweep (sapu)',
        'D. Point (tunjuk) -> Ask (tanya) -> Save (simpan) -> Stop (padam)'
      ],
      correct: 0,
      explanation: 'PASS: 1. Pull the pin, 2. Aim at the base of fire (pangkal api), 3. Squeeze the operating handle, 4. Sweep from side to side.'
    },
    {
      id: 5,
      domain: 'Klasifikasi Kebakaran Panel Listrik',
      question: 'Kebakaran yang terjadi pada panel listrik kontrol mesin bubut atau motor listrik bertegangan masuk dalam Kebakaran Kelas C. Jenis APAR yang PALING AMAN dan efektif digunakan adalah...',
      options: [
        'A. APAR Gas Karbon Dioksida (CO2) atau Dry Chemical Powder',
        'B. Semprotan air bertekanan tinggi dari selang hidran',
        'C. Busa kimia basah berbasis air (AFFF Foam)',
        'D. Mengipasi api dengan kardus bekas'
      ],
      correct: 0,
      explanation: 'Air menghantarkan arus listrik bertegangan tinggi yang dapat menyengat pemadam. Gas CO2 bersifat non-konduktif (tidak menghantarkan listrik) dan tidak meninggalkan residu cairan perusak komponen elektronik.'
    },
    {
      id: 6,
      domain: 'Budaya 5R: Seiri (Ringkas)',
      question: 'Penerapan pilar pertama 5R "Seiri / Ringkas" di bengkel manufaktur dilakukan dengan cara...',
      options: [
        'A. Memilah dan menyingkirkan barang yang rusak/tidak diperlukan dari area kerja ke tempat afkir/karantina',
        'B. Mengecat lantai bengkel dengan warna-warni cerah',
        'C. Mengelap bodi mesin sampai mengkilap setiap 5 menit',
        'D. Menempelkan slogan motivasi di pintu masuk'
      ],
      correct: 0,
      explanation: 'Seiri (Ringkas/Sort) adalah memisahkan benda yang diperlukan dari yang tidak diperlukan, lalu menyingkirkan barang yang tidak diperlukan agar area kerja tidak sempit dan bebas bahaya tersandung.'
    },
    {
      id: 7,
      domain: 'Budaya 5R: Seiton (Rapi)',
      question: 'Penerapan visual management berupa papan bayangan perkakas (shadow board) di atas meja kerja bengkel merupakan implementasi dari pilar 5R...',
      options: [
        'A. Seiton (Rapi)',
        'B. Seiri (Ringkas)',
        'C. Seiso (Resik)',
        'D. Shitsuke (Rajin)'
      ],
      correct: 0,
      explanation: 'Seiton (Rapi/Set in order) mengatur penempatan barang dengan prinsip: siapapun dapat menemukan barang yang dibutuhkan dalam 30 detik dan mengembalikannya ke tempat semula dengan benar.'
    },
    {
      id: 8,
      domain: 'Budaya 5R: Seiso (Resik)',
      question: 'Dalam budaya kerja industri modern, kegiatan "Seiso / Resik" (membersihkan mesin dan area kerja) memiliki peran ganda yang sangat penting yaitu...',
      options: [
        'A. Sebagai sarana inspeksi dini untuk mendeteksi baut kendor, kebocoran oli pelumas, atau retak pada komponen mesin',
        'B. Menghabiskan sisa jam pelajaran agar tidak perlu praktik mesin',
        'C. Mengumpulkan gram besi untuk dijual pribadi',
        'D. Menyembunyikan kerusakan mesin dari instruktur guru'
      ],
      correct: 0,
      explanation: 'Pembersihan adalah inspeksi (Cleaning is inspection). Saat membersihkan mesin, operator dapat melihat apakah ada baut kendor, kebocoran seal oli, atau suara transmisi yang tidak wajar sebelum menjadi kerusakan parah.'
    },
    {
      id: 9,
      domain: 'Budaya 5R: Shitsuke (Rajin)',
      question: 'Indikator keberhasilan penerapan pilar kelima 5R "Shitsuke / Rajin" (Sustain/Disiplin) pada peserta didik adalah...',
      options: [
        'A. Terbentuknya kesadaran dan kebiasaan mematuhi SOP K3 dan 5R secara mandiri tanpa perlu diawasi atau ditegur guru',
        'B. Siswa hanya membersihkan bengkel bila ada inspeksi kepala sekolah',
        'C. Menyuruh siswa yang datang terlambat membersihkan seluruh bengkel sendirian',
        'D. Mengunci seluruh perkakas di lemari agar tidak pernah dipakai'
      ],
      correct: 0,
      explanation: 'Shitsuke (Rajin/Disiplin) adalah tahap tertinggi budaya kerja di mana norma keselamatan dan keteraturan telah mendarah daging menjadi kebiasaan alami (habit) setiap individu.'
    },
    {
      id: 10,
      domain: 'Job Safety Analysis (JSA)',
      question: 'Tujuan dibuatnya lembar analisis keselamatan kerja (Job Safety Analysis / JSA) sebelum siswa memulai tugas pembuatan benda kerja di bengkel mesin adalah...',
      options: [
        'A. Mengidentifikasi potensi bahaya pada setiap tahapan langkah kerja dan menentukan tindakan pengendalian risikonya sebelum kecelakaan terjadi',
        'B. Menghitung harga jual produk jadi kepada konsumen',
        'C. Menggantikan peran guru pengampu di dalam bengkel',
        'D. Memperlama waktu persiapan kerja agar siswa tidak lelah'
      ],
      correct: 0,
      explanation: 'JSA membedah langkah kerja langkah demi langkah, memetakan risiko kecelakaan (misal: terjepit, tergores, terlempar benda), dan menetapkan SOP mitigasi untuk mencegah kecelakaan fatal.'
    }
  ],

  // =========================================================================
  // 9. VIRTUAL BENGKEL 3D & WORKSHOP (10 SOAL)
  // =========================================================================
  'virtual-bengkel': [
    {
      id: 1,
      domain: 'Marka Garis Keselamatan (Safety Walkway)',
      question: 'Di lantai bengkel mesin modern, garis marka batas warna KUNING tebal yang membatasi lorong utama lalu lintas orang berfungsi untuk...',
      options: [
        'A. Menandai jalur aman pejalan kaki yang harus selalu bersih dan bebas dari serpihan beram serta jangkauan gerak operator mesin',
        'B. Jalur khusus untuk balapan troli dorong',
        'C. Garis batas tempat meletakkan tumpukan bahan baku mentah yang belum dipotong',
        'D. Hiasan lantai agar terlihat artistik seperti jalan raya'
      ],
      correct: 0,
      explanation: 'Safety Walkway (marka kuning) memisahkan area lalu lintas orang dengan zona bahaya operasional mesin. Dilarang menaruh barang apa pun di dalam area safety line.'
    },
    {
      id: 2,
      domain: 'Tombol Emergency Stop (E-Stop)',
      question: 'Tombol Darurat (Emergency Stop) pada mesin bubut/frais berbentuk jamur merah dengan latar lingkaran kuning. Kapan tombol ini ditekan oleh siswa/operator?',
      options: [
        'A. Saat terjadi situasi darurat, malfungsi mesin, benda kerja macet terbentur, atau pakaian/anggota tubuh tersangkut untuk memutus aliran daya seketika',
        'B. Setiap kali ingin mematikan mesin saat istirahat siang normal',
        'C. Untuk menyalakan lampu penerangan mesin',
        'D. Saat ingin mengatur putaran RPM spindel mesin'
      ],
      correct: 0,
      explanation: 'Emergency Stop dirancang untuk ditekan seketika dalam kondisi krisis bahaya untuk menghentikan seluruh penggerak mesin secara mekanik dan elektrik tanpa delay.'
    },
    {
      id: 3,
      domain: 'Penanganan Tatal / Beram Besi',
      question: 'Bagaimanakah SOP yang benar dan aman untuk membersihkan serpihan beram/tatal tajam sisa pembubutan dari atas meja mesin?',
      options: [
        'A. Menggunakan kuas pembersih atau tongkat penarik tatal berujung kait setelah spindel mesin berhenti berputar',
        'B. Meniup sekuat tenaga menggunakan selang udara kompresor bertekanan tinggi',
        'C. Mengusap serpihan menggunakan telapak tangan telanjang',
        'D. Menyapu beram menggunakan sarung tangan kain basah saat mesin masih berputar'
      ],
      correct: 0,
      explanation: 'Dilarang keras meniup gram dengan kompresor karena beram tajam akan melesat mengenai mata rekan kerja. Dilarang pula memakai tangan telanjang karena tatal besi sangat tajam seperti silet.'
    },
    {
      id: 4,
      domain: 'Tata Letak (Layout) Bengkel Mesin',
      question: 'Dalam penataan tata letak (layout) mesin bubut di workshop manufaktur, pertimbangan jarak antar mesin yang aman harus memperhitungkan...',
      options: [
        'A. Ruang gerak bebas operator, ayunan pintu panel listrik, dan panjang maksimal material batang yang keluar dari lubang spindel (spindle bore)',
        'B. Menempelkan mesin sedekat mungkin hingga bodi mesin saling bergesekan',
        'C. Menghadap-hadapkan chuck mesin bubut dalam jarak 20 cm',
        'D. Meletakkan mesin di depan pintu keluar darurat'
      ],
      correct: 0,
      explanation: 'Batang poros panjang yang dimasukkan dari belakang kepala tetap (headstock) membutuhkan ruang bebas yang memadai agar tidak membentur mesin atau pejalan kaki lain.'
    },
    {
      id: 5,
      domain: 'Akses Penempatan Tabung APAR',
      question: 'Sesuai regulasi standar keselamatan kerja K3 permenaker, tabung APAR di bengkel mesin harus ditempatkan dengan syarat...',
      options: [
        'A. Mudah terlihat, mudah dijangkau tanpa terhalang tumpukan barang apa pun, dan dipasang di dinding dengan ketinggian sekitar 1.2 meter',
        'B. Disimpan terkunci di dalam lemari gudang paling belakang',
        'C. Ditaruh di atas atap genteng bengkel',
        'D. Ditutupi dengan tumpukan kain majun bekas'
      ],
      correct: 0,
      explanation: 'Dalam keadaan kebakaran, detik-detik awal sangat menentukan. APAR harus dapat dijangkau dan dioperasikan dalam waktu kurang dari 10 detik tanpa rintangan halangan.'
    },
    {
      id: 6,
      domain: 'Pemeriksaan Awal Harian (Daily Inspection)',
      question: 'Sebelum menekan tombol daya ON untuk menyalakan mesin bubut atau frais di pagi hari, checklist pemeriksaan awal yang wajib dilakukan adalah...',
      options: [
        'A. Memeriksa kecukupan level oli gearbox pelumas, memastikan kunci chuck tidak tertinggal, dan menguji kebebasan putaran spindel secara manual',
        'B. Langsung memutar mesin pada putaran maksimal 2000 RPM',
        'C. Mengisi bak coolant dengan air sabun deterjen pakaian',
        'D. Memukul handel pengubah kecepatan dengan martil besi'
      ],
      correct: 0,
      explanation: 'Pemeriksaan harian memastikan mesin terlumasi dengan baik dan tidak ada perkakas asing yang tertinggal di cekam yang dapat terlempar saat mesin mulai berputar.'
    },
    {
      id: 7,
      domain: 'Jalur Evakuasi Darurat Workshop',
      question: 'Jika sirine tanda bahaya kebakaran berbunyi saat siswa sedang melakukan kegiatan praktikum di bengkel, tindakan yang benar adalah...',
      options: [
        'A. Segera matikan tombol daya mesin, tinggalkan barang bawaan, dan berjalan tertib mengikuti petunjuk jalur evakuasi hijau menuju titik kumpul (assembly point)',
        'B. Melanjutkan pembubutan hingga benda kerja selesai tuntas',
        'C. Berlari kencang saling dorong dan berteriak histeris',
        'D. Bersembunyi di dalam bak penampungan coolant mesin bubut'
      ],
      correct: 0,
      explanation: 'Prosedur evakuasi K3: matikan mesin terdekat untuk mencegah korsleting/kebakaran sekunder, jalan cepat jangan berlari saling dorong, ikuti jalur hijau ke assembly point aman.'
    },
    {
      id: 8,
      domain: 'Pencahayaan Mesin (Machine Lighting)',
      question: 'Lampu penerangan lokal fleksibel yang terpasang pada bodi mesin bubut/frais harus diarahkan...',
      options: [
        'A. Tepat ke titik kontak pemotongan antara mata pahat dan benda kerja tanpa menimbulkan silau ke mata operator',
        'B. Ke wajah operator yang sedang membubut',
        'C. Ke arah dinding belakang bengkel yang kosong',
        'D. Ke bawah lantai tepat di kaki operator'
      ],
      correct: 0,
      explanation: 'Pencahayaan lokal yang baik menghilangkan bayangan pada titik potong presisi dan mencegah kelelahan mata operator (eye strain).'
    },
    {
      id: 9,
      domain: 'Penanganan Tumpahan Cairan / Oli',
      question: 'Jika terjadi tumpahan oli pelumas mesin atau cairan coolant di lantai bengkel, tindakan wajib yang harus dilakukan saat itu juga adalah...',
      options: [
        'A. Segera bersihkan tumpahan menggunakan serbuk gergaji/majun dan beri tanda peringatan lantai licin sampai benar-benar kering',
        'B. Dibiarkan saja hingga oli mengering dengan sendirinya besok pagi',
        'C. Menyiramkan air sebanyak-banyaknya agar oli menyebar ke seluruh lantai',
        'D. Melompati tumpahan oli sambil tertawa'
      ],
      correct: 0,
      explanation: 'Tumpahan oli adalah pemicu utama kecelakaan slip and fall (terpeleset) di lantai bengkel mekanik yang dapat membuat operator jatuh membentur mesin yang sedang berputar.'
    },
    {
      id: 10,
      domain: 'Etika Kerja Profesional di Bengkel',
      question: 'Prinsip etika kerja profesional teknisi manufaktur yang paling dilarang saat berada di lingkungan bengkel mesin adalah...',
      options: [
        'A. Bercanda (horseplay), saling mengejutkan rekan, berlari, atau mengalihkan perhatian rekan operator yang sedang fokus membubut',
        'B. Membaca gambar kerja dengan teliti sebelum menyalakan mesin',
        'C. Bertanya kepada instruktur guru jika ada hal teknis yang belum dipahami',
        'D. Memakai sepatu pengaman bersol baja (safety shoes)'
      ],
      correct: 0,
      explanation: 'Bercanda gurau (horseplay) di bengkel mesin adalah pelanggaran berat keselamatan kerja karena 1 detik hilang konsentrasi dapat berakibat fatal seumur hidup.'
    }
  ]
};

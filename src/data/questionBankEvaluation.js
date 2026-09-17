// BANK SOAL EVALUASI BENGKEL MANUFAKTUR & TEKNIK MESIN FASE E
// Terdiri dari 4 Tingkatan Kognitif: C1 (Mengingat), C2 (Memahami), C3 (Menerapkan), dan HOTS Fase E
// Masing-masing tingkatan memiliki 25 Soal Pilihan Ganda dan 5 Soal Essay (Total 100 Pilgan + 20 Essay)

export const evaluationData = {
  c1: {
    id: 'c1',
    levelTitle: 'Tingkat C1: Pengetahuan Dasar (Mengingat)',
    shortTitle: 'Level C1 - Mengingat',
    badge: 'C1: Mengingat',
    badgeColor: '#38bdf8',
    description: 'Evaluasi penguasaan terminologi, nama bagian mesin, alat keselamatan K3, definisi alat ukur, dan fakta dasar teknik pemesinan.',
    multipleChoice: [
  {
    "id": 1,
    "question": "Apa singkatan dari K3 dalam dunia industri dan manufaktur?",
    "options": [
      "Kesehatan, Keselamatan, dan Kesejahteraan",
      "Kesehatan dan Keselamatan Kerja",
      "Ketertiban, Keamanan, dan Keselamatan",
      "Kesiapan, Keselamatan, dan Kewaspadaan"
    ],
    "answer": "Kesehatan dan Keselamatan Kerja",
    "explanation": "K3 singkatan dari Kesehatan dan Keselamatan Kerja, yang merupakan bidang terkait kesehatan, keselamatan, dan kesejahteraan manusia yang bekerja di sebuah institusi maupun lokasi proyek."
  },
  {
    "id": 2,
    "question": "Alat pelindung diri (APD) yang wajib digunakan saat mengoperasikan mesin bubut untuk melindungi mata dari tatal (beram) adalah...",
    "options": [
      "Sarung tangan",
      "Sepatu safety",
      "Kacamata safety",
      "Masker kain"
    ],
    "answer": "Kacamata safety",
    "explanation": "Kacamata safety berfungsi melindungi mata dari serpihan logam (tatal) yang terlempar saat proses pemesinan."
  },
  {
    "id": 3,
    "question": "Gerakan utama pada mesin bubut (lathe) dilakukan oleh bagian...",
    "options": [
      "Eretan yang bergerak translasi",
      "Pahat yang berputar",
      "Benda kerja yang berputar",
      "Senter kepala lepas"
    ],
    "answer": "Benda kerja yang berputar",
    "explanation": "Pada mesin bubut, benda kerja dijepit pada chuck dan berputar pada sumbunya sebagai gerak potong utama."
  },
  {
    "id": 4,
    "question": "Fungsi utama dari cairan pendingin (coolant) pada proses pemesinan adalah...",
    "options": [
      "Memperindah tampilan benda kerja",
      "Mencegah mesin dari karat",
      "Mengurangi panas dan gesekan pada alat potong",
      "Membuat putaran spindel lebih kencang"
    ],
    "answer": "Mengurangi panas dan gesekan pada alat potong",
    "explanation": "Coolant berfungsi mendinginkan suhu alat potong dan benda kerja, sekaligus sebagai pelumas untuk mengurangi gesekan."
  },
  {
    "id": 5,
    "question": "Mesin frais (milling) adalah mesin perkakas yang gerakan utamanya adalah...",
    "options": [
      "Alat potong berputar dan benda kerja diam/bergeser",
      "Benda kerja berputar dan alat potong bergeser",
      "Alat potong dan benda kerja diam",
      "Benda kerja ditekan pada cetakan"
    ],
    "answer": "Alat potong berputar dan benda kerja diam/bergeser",
    "explanation": "Pada mesin frais, pisau frais (milling cutter) berputar pada spindel sedangkan benda kerja digerakkan menuju alat potong."
  },
  {
    "id": 6,
    "question": "Kode 'G00' pada pemrograman mesin CNC berfungsi untuk...",
    "options": [
      "Gerak lurus dengan pemakanan",
      "Gerak lurus cepat tanpa pemakanan (rapid traverse)",
      "Gerak melingkar searah jarum jam",
      "Mematikan putaran spindel"
    ],
    "answer": "Gerak lurus cepat tanpa pemakanan (rapid traverse)",
    "explanation": "G00 digunakan untuk memindahkan posisi pahat secara cepat ke titik tujuan tanpa melakukan penyayatan."
  },
  {
    "id": 7,
    "question": "Kode M yang digunakan untuk memutar spindel searah jarum jam (Clockwise) pada mesin CNC adalah...",
    "options": [
      "M03",
      "M04",
      "M05",
      "M08"
    ],
    "answer": "M03",
    "explanation": "M03 (Spindle On Clockwise) digunakan untuk menghidupkan putaran spindel utama searah putaran jarum jam."
  },
  {
    "id": 8,
    "question": "Bahan logam yang mengandung unsur besi (Fe) dan karbon (C) sebagai unsur utama disebut...",
    "options": [
      "Logam Non-Ferro",
      "Alumunium Alloy",
      "Logam Ferro (Baja)",
      "Polimer"
    ],
    "answer": "Logam Ferro (Baja)",
    "explanation": "Logam ferro adalah logam paduan yang unsur dasarnya adalah besi, contohnya baja dan besi tuang."
  },
  {
    "id": 9,
    "question": "Sifat bahan yang tahan terhadap goresan, keausan, dan penetrasi disebut...",
    "options": [
      "Keuletan (Ductility)",
      "Ketangguhan (Toughness)",
      "Kekerasan (Hardness)",
      "Kerapuhan (Brittleness)"
    ],
    "answer": "Kekerasan (Hardness)",
    "explanation": "Kekerasan (Hardness) adalah kemampuan suatu material untuk menahan deformasi plastis lokal, seperti goresan atau identasi."
  },
  {
    "id": 10,
    "question": "Pada proses pengelasan SMAW, lapisan pembungkus elektroda (fluks) berfungsi untuk...",
    "options": [
      "Membuat api lebih panas",
      "Menghasilkan gas pelindung untuk mencegah oksidasi",
      "Memperindah bentuk lasan",
      "Mencegah operator tersengat listrik"
    ],
    "answer": "Menghasilkan gas pelindung untuk mencegah oksidasi",
    "explanation": "Fluks akan mencair dan menghasilkan gas serta terak (slag) yang melindungi kawah las dari kontaminasi udara luar."
  },
  {
    "id": 11,
    "question": "Alat ukur presisi yang digunakan untuk mengukur diameter luar, diameter dalam, dan kedalaman suatu benda adalah...",
    "options": [
      "Penggaris baja",
      "Jangka sorong (Vernier Caliper)",
      "Mikrometer sekrup",
      "Dial indicator"
    ],
    "answer": "Jangka sorong (Vernier Caliper)",
    "explanation": "Jangka sorong memiliki rahang luar, rahang dalam, dan ekor pengukur kedalaman."
  },
  {
    "id": 12,
    "question": "Berapa tingkat ketelitian umum dari mikrometer sekrup standar?",
    "options": [
      "0,1 mm",
      "0,05 mm",
      "0,01 mm",
      "1 mm"
    ],
    "answer": "0,01 mm",
    "explanation": "Mikrometer sekrup standar memiliki tingkat ketelitian (resolusi) sebesar 0,01 mm, lebih presisi dibandingkan jangka sorong biasa."
  },
  {
    "id": 13,
    "question": "Proses pembuatan ulir luar (baut) secara manual menggunakan perkakas tangan disebut...",
    "options": [
      "Tapping",
      "Senai (Threading dengan Die)",
      "Reaming",
      "Boring"
    ],
    "answer": "Senai (Threading dengan Die)",
    "explanation": "Senai (Die) adalah alat untuk membuat ulir luar pada poros, sedangkan Tapping (Tap) untuk ulir dalam pada lubang."
  },
  {
    "id": 14,
    "question": "Bagian pada mesin bubut yang berfungsi untuk menyangga ujung benda kerja yang panjang agar tidak bergetar adalah...",
    "options": [
      "Chuck",
      "Toolpost",
      "Senter putar pada Kepala Lepas (Tailstock)",
      "Spindel"
    ],
    "answer": "Senter putar pada Kepala Lepas (Tailstock)",
    "explanation": "Tailstock memegang senter putar yang menopang ujung benda kerja panjang untuk mencegah defleksi dan getaran."
  },
  {
    "id": 15,
    "question": "Dalam K3, warna standar rambu peringatan bahaya (Warning/Caution) biasanya menggunakan warna dasar...",
    "options": [
      "Merah",
      "Biru",
      "Kuning",
      "Hijau"
    ],
    "answer": "Kuning",
    "explanation": "Warna kuning menandakan peringatan atau waspada terhadap potensi bahaya (contoh: rambu lantai licin)."
  },
  {
    "id": 16,
    "question": "Tindakan yang harus dilakukan PERTAMA KALI apabila terjadi kebakaran pada panel listrik mesin CNC adalah...",
    "options": [
      "Menyiram air ke mesin",
      "Menekan tombol Emergency Stop dan mematikan sumber listrik",
      "Meniup api agar padam",
      "Lari meninggalkan bengkel"
    ],
    "answer": "Menekan tombol Emergency Stop dan mematikan sumber listrik",
    "explanation": "Memutus aliran listrik adalah langkah pertama untuk mencegah korsleting berlanjut sebelum memadamkan api dengan APAR jenis CO2/Dry Chemical."
  },
  {
    "id": 17,
    "question": "Logam yang sangat ringan, tahan korosi, dan banyak digunakan pada industri penerbangan adalah...",
    "options": [
      "Besi tuang",
      "Kuningan",
      "Tembaga",
      "Aluminium"
    ],
    "answer": "Aluminium",
    "explanation": "Aluminium memiliki massa jenis rendah (sekitar 2,7 g/cm³) dan tahan korosi."
  },
  {
    "id": 18,
    "question": "Proses pemesinan pada mesin bubut untuk meratakan permukaan ujung benda kerja disebut...",
    "options": [
      "Turning",
      "Facing",
      "Grooving",
      "Threading"
    ],
    "answer": "Facing",
    "explanation": "Facing adalah proses pemotongan menyilang sumbu putar untuk menghasilkan permukaan datar pada ujung benda kerja."
  },
  {
    "id": 19,
    "question": "Mesin frais yang posisi spindelnya tegak lurus terhadap meja kerja disebut...",
    "options": [
      "Mesin Frais Horizontal",
      "Mesin Frais Vertikal",
      "Mesin Frais Universal",
      "Mesin Frais Bed-Type"
    ],
    "answer": "Mesin Frais Vertikal",
    "explanation": "Pada mesin frais vertikal, spindel (tempat pisau) berada pada posisi vertikal (tegak lurus meja kerja)."
  },
  {
    "id": 20,
    "question": "Benda kerja pada mesin frais umumnya dijepit menggunakan perlengkapan yang disebut...",
    "options": [
      "Chuck rahang tiga",
      "Collet",
      "Ragum (Vise)",
      "Toolpost"
    ],
    "answer": "Ragum (Vise)",
    "explanation": "Ragum mesin frais (Milling Vise) dijepitkan di meja mesin untuk memegang balok/benda kerja dengan kuat."
  },
  {
    "id": 21,
    "question": "Apa arti dari 5R (5S) pada budaya kerja bengkel?",
    "options": [
      "Rajin, Rapi, Ramah, Resik, Rawat",
      "Ringkas, Rapi, Resik, Rawat, Rajin",
      "Rapikan, Ringkaskan, Rawat, Resik, Rajin",
      "Rumah, Rapi, Ruang, Resik, Rajin"
    ],
    "answer": "Ringkas, Rapi, Resik, Rawat, Rajin",
    "explanation": "5R merupakan terjemahan dari Seiri, Seiton, Seiso, Seiketsu, Shitsuke (Budaya tempat kerja produktif)."
  },
  {
    "id": 22,
    "question": "Kikir (File) digunakan untuk...",
    "options": [
      "Memotong baja tebal",
      "Menghaluskan dan meratakan permukaan benda kerja secara manual",
      "Mengukur dimensi benda",
      "Membuat lubang"
    ],
    "answer": "Menghaluskan dan meratakan permukaan benda kerja secara manual",
    "explanation": "Kikir adalah perkakas tangan untuk membuang material dalam jumlah kecil, meratakan, atau menghaluskan benda kerja."
  },
  {
    "id": 23,
    "question": "Perkakas mesin untuk membuat lubang silindris pada benda kerja padat adalah...",
    "options": [
      "Mesin Bubut",
      "Mesin Gurdi (Drilling Machine)",
      "Mesin Sekrap (Shaper)",
      "Mesin Gerinda"
    ],
    "answer": "Mesin Gurdi (Drilling Machine)",
    "explanation": "Mesin gurdi/bor digunakan bersama mata bor (twist drill) untuk membuat lubang."
  },
  {
    "id": 24,
    "question": "Berapa sudut puncak mata bor standar (twist drill) untuk pengeboran baja umum?",
    "options": [
      "90 derajat",
      "118 derajat",
      "135 derajat",
      "180 derajat"
    ],
    "answer": "118 derajat",
    "explanation": "Sudut puncak 118° adalah sudut paling umum yang digunakan untuk mengebor material baja konvensional."
  },
  {
    "id": 25,
    "question": "Pada G-Code mesin bubut CNC, huruf 'X' dan 'Z' secara berurutan merepresentasikan sumbu arah...",
    "options": [
      "X untuk memanjang, Z untuk melintang (diameter)",
      "X untuk melintang (diameter), Z untuk memanjang",
      "X untuk naik turun, Z untuk memanjang",
      "X untuk putaran spindel, Z untuk kecepatan pemotongan"
    ],
    "answer": "X untuk melintang (diameter), Z untuk memanjang",
    "explanation": "Pada CNC Lathe, X mengontrol diameter (gerak lintang pahat) dan Z mengontrol panjang/kedalaman potong sejajar sumbu putar."
  }
],
    essays: [
  {
    "id": 1,
    "question": "Jelaskan dengan singkat perbedaan prinsip kerja antara Mesin Bubut (Lathe) dan Mesin Frais (Milling)!",
    "expectedPoints": [
      "Bubut: benda kerja berputar, pahat bergeser.",
      "Frais: pisau berputar, benda kerja bergeser/diumpankan."
    ]
  },
  {
    "id": 2,
    "question": "Sebutkan minimal 3 alat pelindung diri (APD) yang wajib digunakan di area bengkel pemesinan, serta jelaskan fungsinya!",
    "expectedPoints": [
      "Kacamata (melindungi mata dari tatal)",
      "Sepatu safety (melindungi kaki dari benda jatuh)",
      "Pakaian kerja/wearpack (melindungi tubuh)",
      "Earplug (melindungi telinga dari bising)"
    ]
  },
  {
    "id": 3,
    "question": "Apa fungsi dari cairan pendingin (coolant) pada proses penyayatan logam?",
    "expectedPoints": [
      "Mendinginkan pahat dan benda kerja",
      "Melumasi (mengurangi gesekan)",
      "Membilas beram/tatal agar keluar dari area potong"
    ]
  },
  {
    "id": 4,
    "question": "Jelaskan apa yang dimaksud dengan material Baja Karbon (Carbon Steel) dan sebutkan satu contoh penggunaannya di industri!",
    "expectedPoints": [
      "Baja karbon adalah logam paduan besi dan karbon.",
      "Contoh: poros, pelat struktur, roda gigi, konstruksi mesin."
    ]
  },
  {
    "id": 5,
    "question": "Mengapa pada mesin CNC sangat penting untuk mengatur titik nol (Zero Point / Work Offset) sebelum memulai pemesinan otomatis?",
    "expectedPoints": [
      "Agar mesin mengetahui referensi posisi benda kerja.",
      "Mencegah pahat menabrak chuck/benda kerja secara tidak terkendali.",
      "Memastikan dimensi produk akurat sesuai program."
    ]
  }
]
  },
  c2: {
    id: 'c2',
    levelTitle: 'Tingkat C2: Pemahaman Konsep (Memahami)',
    shortTitle: 'Level C2 - Memahami',
    badge: 'C2: Memahami',
    badgeColor: '#10b981',
    description: 'Evaluasi pemahaman prinsip kerja mesin bubut & frais, pembacaan skala alat ukur presisi, karakteristik bahan, polaritas las, dan simbol gambar teknik.',
    multipleChoice: [
  {
    "id": 1,
    "question": "Mengapa pada jangka sorong ketelitian 0,02 mm terdapat 50 garis bagian pada skala nonius sepanjang 49 mm?",
    "options": [
      "Karena selisih antara 1 skala utama (1 mm) dengan 1 skala nonius (0,98 mm) adalah 0,02 mm",
      "Karena angka 50 merupakan standar panjang rahang ukur pada sistem metrik internasional",
      "Agar pengguna lebih mudah melihat angka kelipatan 5 saat mengukur benda kerja",
      "Karena skala nonius dibagi berdasarkan perputaran baut ulir presisi di dalam bilah ukur"
    ],
    "answer": "Karena selisih antara 1 skala utama (1 mm) dengan 1 skala nonius (0,98 mm) adalah 0,02 mm",
    "explanation": "Ketelitian jangka sorong diperoleh dari selisih satu bagian skala utama (1 mm) dengan satu bagian skala nonius (49/50 = 0,98 mm), yaitu 1 mm - 0,98 mm = 0,02 mm."
  },
  {
    "id": 2,
    "question": "Pada proses pembubutan, perbedaan mendasar antara pembubutan muka (facing) dan pembubutan memanjang (turning) adalah...",
    "options": [
      "Facing menggerakkan pahat tegak lurus sumbu spindel, sedangkan turning menggerakkan pahat sejajar sumbu spindel",
      "Facing hanya dilakukan pada material lunak, sedangkan turning dilakukan pada semua jenis baja",
      "Facing menggunakan putaran spindel berlawanan jarum jam, sedangkan turning searah jarum jam",
      "Facing menggunakan pahat HSS, sedangkan turning wajib menggunakan pahat karbida"
    ],
    "answer": "Facing menggerakkan pahat tegak lurus sumbu spindel, sedangkan turning menggerakkan pahat sejajar sumbu spindel",
    "explanation": "Facing (bubut muka) bertujuan meratakan permukaan ujung benda kerja dengan gerak melintang tegak lurus sumbu putar, sedangkan turning (bubut memanjang) mengurangi diameter sepanjang sumbu poros."
  },
  {
    "id": 3,
    "question": "Metode pengefraisan Climb Milling (Down Milling) memiliki karakteristik gaya potong yang...",
    "options": [
      "Menekan benda kerja ke bawah ke arah meja mesin sehingga getaran lebih teredam pada mesin yang kaku",
      "Mengangkat benda kerja ke atas menjauhi meja mesin sehingga berisiko terlepas dari ragum",
      "Menarik meja mesin secara perlahan berlawanan dengan arah putaran pisau frais",
      "Menghasilkan geram yang tebal di akhir pemotongan dan tipis di awal pemotongan"
    ],
    "answer": "Menekan benda kerja ke bawah ke arah meja mesin sehingga getaran lebih teredam pada mesin yang kaku",
    "explanation": "Pada climb milling, arah putaran pisau searah dengan gerak makan benda kerja, sehingga gaya potong menekan benda kerja ke bawah meja dan menghasilkan kualitas permukaan lebih halus."
  },
  {
    "id": 4,
    "question": "Apa pengaruh yang terjadi jika sudut tatal (rake angle / γ) pada pahat bubut dibuat semakin besar?",
    "options": [
      "Pemotongan menjadi lebih ringan dan gaya potong berkurang, namun kekuatan mata potong menurun",
      "Kekuatan mata potong meningkat drastis sehingga tahan terhadap pemotongan material keras",
      "Gesekan antara bidang bebas pahat dan benda kerja meningkat sehingga timbul panas tinggi",
      "Pahat menjadi tumpul lebih lambat dan menghasilkan geram yang terputus-putus pendek"
    ],
    "answer": "Pemotongan menjadi lebih ringan dan gaya potong berkurang, namun kekuatan mata potong menurun",
    "explanation": "Sudut tatal yang besar memudahkan pengaliran geram dan memperkecil gaya potong, namun memperkecil sudut baji (wedge angle) sehingga ujung pahat lebih rapuh terhadap beban kejut."
  },
  {
    "id": 5,
    "question": "Pada pengelasan busur manual (SMAW), polaritas DCEP (Direct Current Electrode Positive / DCRP) menghasilkan...",
    "options": [
      "Panas 70% pada benda kerja dan 30% pada elektroda sehingga penetrasi lebih dangkal",
      "Panas 70% pada elektroda dan 30% pada benda kerja sehingga menghasilkan penetrasi las yang dalam",
      "Panas terbagi rata 50% - 50% tanpa menimbulkan percikan logam (spatter)",
      "Penetrasi las sangat lebar dengan pencairan logam induk yang sangat lambat"
    ],
    "answer": "Panas 70% pada elektroda dan 30% pada benda kerja sehingga menghasilkan penetrasi las yang dalam",
    "explanation": "Pada DCEP (Reverse Polarity), elektron mengalir dari benda kerja ke elektroda sehingga tumbukan elektron menghasilkan penetrasi yang dalam dan peleburan elektroda yang stabil."
  },
  {
    "id": 6,
    "question": "Prinsip kerja mikrometer luar (outside micrometer) dalam menghasilkan ketelitian 0,01 mm didasarkan pada...",
    "options": [
      "Kombinasi ulir presisi dengan kisar 0,5 mm dan tabung putar (thimble) yang memiliki 50 garis pembagian",
      "Pembagian skala vernier geser pada poros geser sepanjang 25 milimeter",
      "Pergerakan batang bergigi pinion yang dihubungkan ke jarum penunjuk mekanik",
      "Sistem pegas pegas penahan beban konstan di dalam rangka berbentuk huruf U"
    ],
    "answer": "Kombinasi ulir presisi dengan kisar 0,5 mm dan tabung putar (thimble) yang memiliki 50 garis pembagian",
    "explanation": "Satu putaran penuh thimble memajukan poros geser sebesar kisar ulir (0,5 mm). Karena thimble dibagi menjadi 50 bagian, maka 1 bagian bernilai 0,5 / 50 = 0,01 mm."
  },
  {
    "id": 7,
    "question": "Berdasarkan kandungan karbonnya, baja karbon sedang (0,3% - 0,6% C) umumnya paling cocok diaplikasikan untuk...",
    "options": [
      "Komponen mesin yang membutuhkan kekuatan tarik dan keuletan seimbang seperti poros engkol dan roda gigi",
      "Pelat tipis bodi mobil yang membutuhkan kemampuan mampu bentuk (deep drawing) sangat tinggi",
      "Mata pahat potong dan kikir yang membutuhkan kekerasan ekstrem di atas 60 HRC",
      "Struktur jembatan yang membutuhkan kemudahan pengelasan tanpa pemanasan awal"
    ],
    "answer": "Komponen mesin yang membutuhkan kekuatan tarik dan keuletan seimbang seperti poros engkol dan roda gigi",
    "explanation": "Baja karbon sedang (medium carbon steel) memiliki kombinasi kekuatan mekanik, ketangguhan, dan kemampuan dikeraskan (heat treatable) yang ideal untuk poros, roda gigi, dan komponen bergerak."
  },
  {
    "id": 8,
    "question": "Pada pengelasan gas Oxy-Acetylene (OAW), nyala api karburasi (nyala kelebihan gas asetilin) ditandai dengan...",
    "options": [
      "Adanya tiga daerah nyala, yaitu inti nyala, kerucut antara (feather cone), dan nyala luar",
      "Inti nyala berbentuk bulat tumpul dengan suara mendesis tajam dan warna biru terang",
      "Hanya terdapat dua kerucut nyala dengan perbandingan gas oksigen dan asetilin tepat 1:1",
      "Nyala api berwarna ungu transparan tanpa menghasilkan asap hitam jelaga"
    ],
    "answer": "Adanya tiga daerah nyala, yaitu inti nyala, kerucut antara (feather cone), dan nyala luar",
    "explanation": "Nyala karburasi memiliki lidah api ketiga (feather cone) di antara inti dan selubung luar akibat kelebihan gas asetilin, biasa digunakan untuk mengelas baja nikel atau brazing."
  },
  {
    "id": 9,
    "question": "Fungsi utama dari dial indicator (jam ukur) saat proses persiapan pembubutan pada chuck 4 rahang adalah...",
    "options": [
      "Memeriksa dan mengatur kesenteran (run-out) putaran benda kerja hingga mencapai toleransi deviasi terkecil",
      "Mengukur diameter luar benda kerja secara langsung dengan satuan mikrometer",
      "Menentukan kecepatan putar spindel mesin secara otomatis melalui sensor mekanis",
      "Mengunci posisi eretan lintang agar tidak bergeser saat pemakanan kasar"
    ],
    "answer": "Memeriksa dan mengatur kesenteran (run-out) putaran benda kerja hingga mencapai toleransi deviasi terkecil",
    "explanation": "Dial indicator digunakan untuk mendeteksi penyimpangan gerak putar (radial run-out) saat menyetel rahang independen chuck 4 rahang hingga benda kerja berputar konsentris."
  },
  {
    "id": 10,
    "question": "Dalam sistem toleransi dan suaian ISO, apa yang dimaksud dengan 'Suaian Sesak' (Interference Fit)?",
    "options": [
      "Kondisi di mana diameter poros selalu lebih besar daripada diameter lubang sebelum dirakit",
      "Kondisi di mana diameter lubang selalu lebih besar daripada diameter poros sehingga poros bebas berputar",
      "Kondisi di mana ukuran poros dan lubang memiliki peluang sama untuk longgar maupun pas",
      "Kondisi di mana perakitan dapat dilakukan tanpa bantuan alat tekan hidrolik atau pemanasan"
    ],
    "answer": "Kondisi di mana diameter poros selalu lebih besar daripada diameter lubang sebelum dirakit",
    "explanation": "Suaian sesak (interference fit) menghasilkan hubungan yang terkunci mati permanen karena batas ukuran terkecil poros lebih besar daripada batas ukuran terbesar lubang."
  },
  {
    "id": 11,
    "question": "Pada gambar teknik mesin, simbol kekasaran permukaan Ra = 0,8 µm memiliki arti...",
    "options": [
      "Nilai rata-rata aritmetika penyimpangan profil permukaan tidak boleh melebihi 0,8 mikrometer (sangat halus)",
      "Kedalaman pemakanan pahat pada langkah penyelesaian harus disetel tepat 0,8 milimeter",
      "Permukaan benda kerja boleh dikerjakan dengan proses pengecoran tanpa pemesinan lanjut",
      "Panjang gelombang bekas pahat potong di permukaan harus berjarak minimal 0,8 sentimeter"
    ],
    "answer": "Nilai rata-rata aritmetika penyimpangan profil permukaan tidak boleh melebihi 0,8 mikrometer (sangat halus)",
    "explanation": "Ra (Roughness Average) adalah parameter kekasaran permukaan standar ISO dalam satuan mikrometer (µm). Nilai Ra 0,8 µm tergolong permukaan sangat halus (finishing grinding/precision turning)."
  },
  {
    "id": 12,
    "question": "Mengapa proses pengerasan baja (hardening) harus selalu diikuti dengan proses penempaan panas (tempering)?",
    "options": [
      "Untuk mengurangi kerapuhan (brittleness) dan tegangan sisa internal tanpa banyak menurunkan kekerasan",
      "Agar baja kembali lunak sehingga mudah dibubut dan digurdi ulang",
      "Untuk meningkatkan kadar karbon pada lapisan terluar benda kerja",
      "Agar permukaan benda kerja terlindung secara permanen dari bahaya oksidasi karat"
    ],
    "answer": "Untuk mengurangi kerapuhan (brittleness) dan tegangan sisa internal tanpa banyak menurunkan kekerasan",
    "explanation": "Baja yang baru di-quench memiliki struktur martensit yang sangat keras namun getas. Tempering memulihkan keuletan dan ketangguhan baja agar tidak mudah pecah saat menerima beban kejut."
  },
  {
    "id": 13,
    "question": "Mengapa operator mesin bubut harus menurunkan putaran spindel (RPM) saat membubut benda kerja yang berdiameter lebih besar?",
    "options": [
      "Agar kecepatan potong (Cutting Speed / Cs) pada permukaan terluar benda kerja tetap berada dalam batas rekomendasi",
      "Agar motor listrik mesin tidak mengalami kelebihan beban ampere saat start awal",
      "Karena gaya gesekan udara pada benda kerja berdiameter besar dapat menghentikan putaran chuck",
      "Agar getaran pada meja eretan tidak mengganggu pembacaan skala nonius"
    ],
    "answer": "Agar kecepatan potong (Cutting Speed / Cs) pada permukaan terluar benda kerja tetap berada dalam batas rekomendasi",
    "explanation": "Hubungan kecepatan potong adalah Cs = (π × d × n) / 1000. Jika diameter (d) semakin besar, maka putaran (n) harus diturunkan agar nilai kecepatan potong (Cs) tidak melampaui batas ketahanan pahat."
  },
  {
    "id": 14,
    "question": "Perbedaan fungsi antara pisau frais jari (End Mill Cutter) dengan pisau frais muka (Face Mill Cutter) adalah...",
    "options": [
      "End mill mampu membuat alur, kantung (pocket), dan kontur samping, sedangkan face mill dikhususkan untuk meratakan bidang permukaan luas",
      "End mill hanya memiliki mata potong pada bagian keliling silindris, sedangkan face mill hanya pada bagian ujung bawah",
      "End mill selalu dipasang pada arbor horizontal, sedangkan face mill dipasang langsung pada ragum",
      "End mill digunakan untuk proses pemotongan kasar (roughing), sedangkan face mill hanya untuk penghalusan akhir (superfinishing)"
    ],
    "answer": "End mill mampu membuat alur, kantung (pocket), dan kontur samping, sedangkan face mill dikhususkan untuk meratakan bidang permukaan luas",
    "explanation": "End mill memiliki mata potong di ujung dan sisi silindris sehingga serbaguna untuk alur dan kontur, sedangkan face mill berdiameter besar untuk efisiensi penyayatan bidang datar luas."
  },
  {
    "id": 15,
    "question": "Apa konsekuensi teknis jika ujung mata pahat bubut dipasang di bawah garis senter mesin saat membubut memanjang?",
    "options": [
      "Sudut bebas (clearance angle) bertambah besar namun sudut tatal efektif berkurang, dan benda kerja berisiko terangkat/tertarik ke atas pahat",
      "Sudut bebas menjadi nol sehingga bidang belakang pahat menggesek benda kerja dan tidak memotong",
      "Hasil pembubutan muka (facing) akan meninggalkan tonjolan kecil persis di titik tengah poros",
      "Pahat akan mengalami keausan kawah (crater wear) secara instan dalam 30 detik pertama"
    ],
    "answer": "Sudut bebas (clearance angle) bertambah besar namun sudut tatal efektif berkurang, dan benda kerja berisiko terangkat/tertarik ke atas pahat",
    "explanation": "Pahat di bawah senter memperbesar sudut bebas efektif namun memperkecil sudut tatal, menyebabkan gaya potong cenderung menarik benda kerja ke atas mata pahat dan menimbulkan getaran."
  },
  {
    "id": 16,
    "question": "Pada pemrograman CNC ISO/DIN, apa perbedaan mendasar antara instruksi G00 dan G01?",
    "options": [
      "G00 adalah gerak lurus cepat tanpa pemotongan (rapid traverse), sedangkan G01 adalah gerak lurus dengan pemakanan terprogram (feed)",
      "G00 menggerakkan spindel berputar searah jarum jam, sedangkan G01 menghentikan putaran spindel",
      "G00 menggunakan sistem koordinat inkremental, sedangkan G01 menggunakan sistem koordinat absolut",
      "G00 digunakan untuk interpolasi melingkar, sedangkan G01 digunakan untuk pembuatan ulir otomatis"
    ],
    "answer": "G00 adalah gerak lurus cepat tanpa pemotongan (rapid traverse), sedangkan G01 adalah gerak lurus dengan pemakanan terprogram (feed)",
    "explanation": "G00 digunakan untuk memposisikan pahat mendekati atau menjauhi benda kerja pada kecepatan maksimal tanpa menyayat, sedangkan G01 memotong material sesuai nilai feed (F) yang ditentukan."
  },
  {
    "id": 17,
    "question": "Mengapa pahat sisipan karbida (Cemented Carbide Insert) mampu beroperasi pada kecepatan potong (Cs) 3-4 kali lebih tinggi daripada pahat HSS?",
    "options": [
      "Karena karbida memiliki sifat 'Hot Hardness' (kekerasan panas) yang mampu bertahan stabil hingga suhu di atas 900°C - 1000°C",
      "Karena karbida memiliki elastisitas yang sangat tinggi sehingga tahan terhadap benturan keras",
      "Karena massa jenis karbida lebih ringan daripada logam baja paduan lainnya",
      "Karena karbida dapat diasah ulang menggunakan batu gerinda aluminium oksida biasa"
    ],
    "answer": "Karena karbida memiliki sifat 'Hot Hardness' (kekerasan panas) yang mampu bertahan stabil hingga suhu di atas 900°C - 1000°C",
    "explanation": "Karbida tersusun atas partikel karbida tungsten (WC) yang diikat kobalt (Co), memiliki ketahanan aus dan stabilitas kekerasan pada suhu tinggi (hot hardness) jauh melampaui HSS (600°C)."
  },
  {
    "id": 18,
    "question": "Dalam satu set tap manual perulir dalam standar (terdiri dari 3 tap), fungsi tap nomor 1 (taper tap) adalah...",
    "options": [
      "Membentuk alur awal sebagai pemandu pemotongan karena memiliki tirus pemotong yang panjang (8-10 ulir)",
      "Menghaluskan puncak dan dasar ulir hingga mencapai ukuran akhir yang presisi",
      "Membuat ulir penuh sampai ke dasar lubang buntu (blind hole)",
      "Membersihkan sisa beram logam yang tersumbat di dalam lubang berulir"
    ],
    "answer": "Membentuk alur awal sebagai pemandu pemotongan karena memiliki tirus pemotong yang panjang (8-10 ulir)",
    "explanation": "Tap nomor 1 memiliki bagian tirus pemotong paling landai (sekitar 4°) sepanjang 8-10 ulir awal untuk mempermudah start penyayatan lurus sepusat dengan lubang bor."
  },
  {
    "id": 19,
    "question": "Pada prosedur pemadaman api menggunakan APAR metode PASS, huruf 'S' yang pertama dan kedua berturut-turut adalah...",
    "options": [
      "Squeeze (tekan tuas katup) dan Sweep (sapukan corong dari sisi ke sisi)",
      "Start (hidupkan mesin pompa) dan Stop (hentikan aliran bahan bakar)",
      "Safety (gunakan kacamata pelindung) dan Secure (amankan area kerja)",
      "Shake (kocok tabung silinder) dan Spray (semprotkan ke udara bebas)"
    ],
    "answer": "Squeeze (tekan tuas katup) dan Sweep (sapukan corong dari sisi ke sisi)",
    "explanation": "PASS adalah akronim internasional: Pull the pin, Aim at the base of fire, Squeeze the operating handle, dan Sweep side to side."
  },
  {
    "id": 20,
    "question": "Pada ragum mesin frais, apa fungsi dari pelat penyejajar (parallel block) yang diletakkan di bawah benda kerja?",
    "options": [
      "Menopang benda kerja agar posisinya sejajar sempurna dengan permukaan meja mesin dan mengatur ketinggian bidang sayat",
      "Melindungi bibir ragum dari percikan cairan pendingin (coolant) bertekanan tinggi",
      "Mencegah benda kerja bergeser secara melintang saat menerima beban pemakanan aksial",
      "Menambah gaya jepit ragum tanpa memerlukan perpanjangan tuas engkol pemutar"
    ],
    "answer": "Menopang benda kerja agar posisinya sejajar sempurna dengan permukaan meja mesin dan mengatur ketinggian bidang sayat",
    "explanation": "Parallel block adalah balok baja presisi yang dipasangkan di bawah benda kerja pada ragum untuk menjamin kerataan dan kesejajaran bidang yang akan disayat terhadap meja mesin."
  },
  {
    "id": 21,
    "question": "Mata bor standar memiliki alur heliks (spiral flutes) yang berfungsi utama untuk...",
    "options": [
      "Membentuk sudut tatal mata potong dan menjadi saluran evakuasi pengeluaran beram dari dalam lubang",
      "Menahan gaya puntir agar mata bor tidak patah saat menembus pelat baja",
      "Mengurangi diameter mata bor secara bertahap ke arah tangkai pegangan",
      "Memudahkan operator memegang mata bor saat diganti di dalam cekam bor"
    ],
    "answer": "Membentuk sudut tatal mata potong dan menjadi saluran evakuasi pengeluaran beram dari dalam lubang",
    "explanation": "Alur heliks bor memiliki dua fungsi penting: membentuk sudut potong tatal pada bibir bor serta mengalirkan beram dan cairan pendingin ke luar dari lubang pengeboran."
  },
  {
    "id": 22,
    "question": "Pahat ulir metris dan pahat ulir Withworth memiliki sudut asahan ujung mata potong yang berbeda, yaitu berturut-turut...",
    "options": [
      "60° untuk ulir metris dan 55° untuk ulir Withworth",
      "55° untuk ulir metris dan 60° untuk ulir Withworth",
      "90° untuk ulir metris dan 45° untuk ulir Withworth",
      "45° untuk ulir metris dan 60° untuk ulir Withworth"
    ],
    "answer": "60° untuk ulir metris dan 55° untuk ulir Withworth",
    "explanation": "Standar ulir metris (ISO) memiliki sudut puncak profil 60° dengan dasar dan puncak rata/radius, sedangkan ulir Withworth (Inggris/BSW) memiliki sudut profil 55° dengan puncak bulat."
  },
  {
    "id": 23,
    "question": "Kelebihan utama jangka sorong berskala dial (Dial Caliper) dibandingkan jangka sorong vernier konvensional adalah...",
    "options": [
      "Pembacaan nilai desimal lebih cepat, ergonomis, dan meminimalkan kesalahan paralaks penglihatan",
      "Mampu mengukur dimensi benda kerja hingga panjang lebih dari 3 meter tanpa batas",
      "Tahan terhadap benturan keras dan tidak terpengaruh oleh kotoran serpihan beram pada rel",
      "Dapat digunakan untuk mengukur suhu benda kerja saat pemesinan berlangsung"
    ],
    "answer": "Pembacaan nilai desimal lebih cepat, ergonomis, dan meminimalkan kesalahan paralaks penglihatan",
    "explanation": "Dial caliper menampilkan pecahan ukuran langsung melalui jarum penunjuk jam ukur sehingga teknisi tidak perlu menyelaraskan garis vernier secara manual yang rentan salah baca (paralaks)."
  },
  {
    "id": 24,
    "question": "Perbedaan mendasar antara proses pengelasan MIG (GMAW) dan TIG (GTAW) terletak pada...",
    "options": [
      "MIG menggunakan elektroda gulungan kawat yang ikut mencair sebagai bahan pengisi, sedangkan TIG menggunakan elektroda tungsten yang tidak mencair",
      "MIG hanya menggunakan gas argon murni, sedangkan TIG selalu menggunakan gas karbon dioksida (CO2)",
      "MIG tidak memerlukan sumber arus listrik, sedangkan TIG menggunakan generator arus searah berkekuatan tinggi",
      "MIG dikhususkan untuk pelat tipis di bawah 0,5 mm, sedangkan TIG hanya untuk konstruksi baja kapal tebal"
    ],
    "answer": "MIG menggunakan elektroda gulungan kawat yang ikut mencair sebagai bahan pengisi, sedangkan TIG menggunakan elektroda tungsten yang tidak mencair",
    "explanation": "Pada GMAW/MIG, elektroda berupa kawat kontinu yang meleleh menjadi logam las. Pada GTAW/TIG, elektrodanya adalah tungsten non-consumable yang hanya berfungsi membuat busur listrik."
  },
  {
    "id": 25,
    "question": "Berdasarkan standar penamaan elektroda AWS A5.1, arti angka '1' pada digit ketiga kode elektroda E6013 adalah...",
    "options": [
      "Elektroda dapat digunakan untuk pengelasan di segala posisi (posisi 1G, 2G, 3G, dan 4G)",
      "Elektroda hanya boleh digunakan pada posisi pengelasan bawah tangan (flat)",
      "Kandungan unsur paduan karbon pada kawat inti adalah sebesar 0,1 persen",
      "Tingkat ketahanan impak elektroda telah lolos uji pada suhu minus 10 derajat celcius"
    ],
    "answer": "Elektroda dapat digunakan untuk pengelasan di segala posisi (posisi 1G, 2G, 3G, dan 4G)",
    "explanation": "Pada kode AWS (misal E6013): digit 1-2 (60) = kuat tarik min 60.000 psi; digit 3 (1) = posisi pengelasan (1 = semua posisi, 2 = flat & horizontal filet, 4 = khusus vertikal turun); digit 4 = tipe fluks dan arus."
  }
],
    essays: [
  {
    "id": 1,
    "question": "Jelaskan prinsip kerja serta perbandingan gaya potong antara metode Up Milling (Konvensional) dan Down Milling (Climb Milling) pada mesin frais!",
    "expectedPoints": [
      "Up milling: putaran pisau berlawanan arah pemakanan, gaya potong mengangkat benda kerja, awal geram tipis akhir tebal.",
      "Down milling: putaran pisau searah pemakanan, gaya potong menekan benda kerja ke bawah meja, awal geram tebal akhir tipis.",
      "Down milling menghasilkan kehalusan permukaan lebih baik tetapi mensyaratkan mesin bebas backlash ulir meja."
    ]
  },
  {
    "id": 2,
    "question": "Jelaskan pengaruh teknis yang terjadi apabila ujung mata pahat bubut disetel tidak tepat pada garis senter mesin (terlalu tinggi atau terlalu rendah)!",
    "expectedPoints": [
      "Pahat di atas senter: sudut bebas (alpha) mengecil sehingga bidang bebas menggesek benda kerja, sudut tatal membesar, timbul panas dan permukaan kasar.",
      "Pahat di bawah senter: sudut bebas membesar namun sudut tatal mengecil, gaya potong cenderung menarik benda kerja ke atas dan timbul getaran/chatter.",
      "Pada pembubutan muka (facing), posisi tidak setinggi senter akan menyisakan tonjolan inti di pusat benda kerja."
    ]
  },
  {
    "id": 3,
    "question": "Jelaskan perbedaan mendasar antara perlakuan panas Annealing, Hardening, dan Tempering pada baja karbon serta tujuan utama masing-masing proses!",
    "expectedPoints": [
      "Annealing: pemanasan di atas suhu kritis lalu pendinginan lambat di tungku, bertujuan melunakkan baja dan menghapus tegangan sisa.",
      "Hardening: pemanasan hingga fase austenit lalu pendinginan cepat (quenching) di air/oli, bertujuan membentuk martensit keras.",
      "Tempering: pemanasan ulang di bawah suhu kritis setelah hardening, bertujuan mengurangi kegetasan dan meningkatkan keuletan/ketangguhan."
    ]
  },
  {
    "id": 4,
    "question": "Jelaskan prosedur pembacaan nilai ukur pada jangka sorong ketelitian 0,05 mm dan mikrometer luar ketelitian 0,01 mm!",
    "expectedPoints": [
      "Jangka sorong: baca skala utama di kiri nol nonius (angka bulat mm), cari garis nonius yang segaris lurus dengan skala utama lalu kalikan 0,05 mm, jumlahkan kedua nilai.",
      "Mikrometer luar: baca garis skala utama milimeter dan garis setengah milimeter pada tabung silinder, baca garis thimble yang segaris dengan garis tengah tabung lalu kalikan 0,01 mm, jumlahkan kedua nilai."
    ]
  },
  {
    "id": 5,
    "question": "Jelaskan perbedaan pengaruh pemilihan polaritas DCEP (Direct Current Electrode Positive) dibanding DCEN (Direct Current Electrode Negative) terhadap penetrasi dan laju peleburan pada las SMAW!",
    "expectedPoints": [
      "DCEP (Reverse Polarity): elektroda dihubungkan ke kutub positif, menghasilkan penetrasi pengelasan yang lebih dalam dan busur stabil.",
      "DCEN (Straight Polarity): elektroda dihubungkan ke kutub negatif, menghasilkan laju peleburan elektroda lebih cepat namun penetrasi lebih dangkal.",
      "DCEP lebih cocok untuk pelat tebal dan sambungan kritis, sedangkan DCEN cocok untuk pelat yang lebih tipis atau penumpukan permukaan (surfacing)."
    ]
  }
]
  },
  c3: {
    id: 'c3',
    levelTitle: 'Tingkat C3: Penerapan & Prosedur (Menerapkan)',
    shortTitle: 'Level C3 - Menerapkan',
    badge: 'C3: Menerapkan',
    badgeColor: '#f59e0b',
    description: 'Evaluasi penerapan rumus pemesinan (RPM, pemakanan, waktu potong), penyetelan sudut tirus, perhitungan diameter bor tap, arus las, dan toleransi suaian.',
    multipleChoice: [
  {
    "id": 1,
    "question": "Sebuah poros baja liat berdiameter 50 mm akan dibubut dengan kecepatan potong (Cs) 30 m/menit. Berapakah putaran spindel mesin bubut teoritis (n) yang harus disetel?",
    "options": [
      "191 RPM",
      "240 RPM",
      "318 RPM",
      "382 RPM"
    ],
    "answer": "191 RPM",
    "explanation": "Rumus: n = (1000 × Cs) / (π × d) = (1000 × 30) / (3,14 × 50) = 30000 / 157 = 191,08 RPM."
  },
  {
    "id": 2,
    "question": "Sebuah pisau frais muka (face mill) berdiameter 80 mm digunakan untuk mengefrais pelat baja dengan Cs = 25 m/menit. Putaran spindel mesin frais teoritis adalah...",
    "options": [
      "99,5 RPM",
      "120 RPM",
      "150 RPM",
      "200 RPM"
    ],
    "answer": "99,5 RPM",
    "explanation": "Rumus: n = (1000 × Cs) / (π × d) = (1000 × 25) / (3,14 × 80) = 25000 / 251,2 ≈ 99,5 RPM."
  },
  {
    "id": 3,
    "question": "Pada mesin frais, sebuah pisau jari memiliki 4 mata potong (z = 4), gerak makan per gigi fz = 0,08 mm/gigi, dan spindel berputar pada n = 500 RPM. Kecepatan pemakanan meja mesin (F) adalah...",
    "options": [
      "160 mm/menit",
      "120 mm/menit",
      "40 mm/menit",
      "200 mm/menit"
    ],
    "answer": "160 mm/menit",
    "explanation": "Rumus kecepatan pemakanan: F = fz × z × n = 0,08 × 4 × 500 = 160 mm/menit."
  },
  {
    "id": 4,
    "question": "Benda kerja akan dibubut tirus dengan data: diameter besar D = 46 mm, diameter kecil d = 36 mm, dan panjang tirus L = 50 mm. Berapakah besar pergeseran sudut eretan atas (tan α)?",
    "options": [
      "tan α = 0,10 (sudut α ≈ 5,71°)",
      "tan α = 0,20 (sudut α ≈ 11,3°)",
      "tan α = 0,05 (sudut α ≈ 2,86°)",
      "tan α = 0,25 (sudut α ≈ 14,04°)"
    ],
    "answer": "tan α = 0,10 (sudut α ≈ 5,71°)",
    "explanation": "Rumus sudut tirus eretan atas: tan α = (D - d) / (2 × L) = (46 - 36) / (2 × 50) = 10 / 100 = 0,10 -> α = arctan(0,10) ≈ 5,71°."
  },
  {
    "id": 5,
    "question": "Berapakah ukuran diameter mata bor yang tepat untuk membuat lubang ulir dalam metris standar M12 x 1,75 pada pelat baja?",
    "options": [
      "10,25 mm",
      "10,00 mm",
      "10,75 mm",
      "11,25 mm"
    ],
    "answer": "10,25 mm",
    "explanation": "Rumus diameter mata bor untuk tap metris: D_bor = D_nominal - Kisar (P) = 12 mm - 1,75 mm = 10,25 mm."
  },
  {
    "id": 6,
    "question": "Sebuah poros dibubut muka (facing) dengan diameter d = 60 mm pada putaran n = 400 RPM dan pemakanan f = 0,15 mm/putaran. Waktu pemesinan (tc) untuk satu kali pemakanan muka adalah...",
    "options": [
      "0,50 menit (30 detik)",
      "1,00 menit (60 detik)",
      "0,25 menit (15 detik)",
      "0,75 menit (45 detik)"
    ],
    "answer": "0,50 menit (30 detik)",
    "explanation": "Panjang lintasan potong facing: L = d / 2 = 60 / 2 = 30 mm. Waktu pemesinan: tc = L / (f × n) = 30 / (0,15 × 400) = 30 / 60 = 0,5 menit (30 detik)."
  },
  {
    "id": 7,
    "question": "Poros baja sepanjang L = 120 mm dibubut silindris memanjang dengan n = 600 RPM dan gerak makan f = 0,2 mm/putaran. Berapakah waktu pemesinan dasar (tc) yang dibutuhkan untuk 1 lintasan potong?",
    "options": [
      "1,00 menit",
      "1,50 menit",
      "0,80 menit",
      "2,00 menit"
    ],
    "answer": "1,00 menit",
    "explanation": "Rumus waktu pembubutan memanjang: tc = L / (f × n) = 120 / (0,2 × 600) = 120 / 120 = 1,00 menit."
  },
  {
    "id": 8,
    "question": "Sebuah benda kerja berpanjang total 200 mm dibubut tirus dengan pergeseran kepala lepas (offset tailstock). Jika D = 50 mm, d = 42 mm, dan panjang tirus l = 100 mm, nilai pergeseran kepala lepas (X) adalah...",
    "options": [
      "8 mm",
      "4 mm",
      "16 mm",
      "2 mm"
    ],
    "answer": "8 mm",
    "explanation": "Rumus pergeseran kepala lepas: X = [L_total × (D - d)] / (2 × l_tirus) = [200 × (50 - 42)] / (2 × 100) = (200 × 8) / 200 = 8 mm."
  },
  {
    "id": 9,
    "question": "Seorang teknisi membaca mikrometer luar 0-25 mm. Skala utama tabung diam menunjukkan 14,5 mm dan garis ke-28 pada thimble berimpit lurus dengan garis horizontal. Hasil ukur benda kerja adalah...",
    "options": [
      "14,78 mm",
      "14,28 mm",
      "14,528 mm",
      "14,88 mm"
    ],
    "answer": "14,78 mm",
    "explanation": "Nilai ukur = Skala Utama + (Skala Thimble × 0,01 mm) = 14,5 mm + (28 × 0,01 mm) = 14,5 + 0,28 = 14,78 mm."
  },
  {
    "id": 10,
    "question": "Pembacaan jangka sorong 0,02 mm menunjukkan garis nol nonius berada di antara 32 mm dan 33 mm pada skala utama, dan garis ke-17 pada skala nonius tepat segaris. Nilai pembacaannya adalah...",
    "options": [
      "32,34 mm",
      "32,17 mm",
      "32,68 mm",
      "32,85 mm"
    ],
    "answer": "32,34 mm",
    "explanation": "Nilai ukur = Skala Utama + (Garis Nonius × Ketelitian) = 32 mm + (17 × 0,02 mm) = 32 + 0,34 = 32,34 mm."
  },
  {
    "id": 11,
    "question": "Untuk melakukan pengelasan pelat baja tebal 6 mm posisi bawah tangan menggunakan elektroda E6013 diameter 3,2 mm, setelan kuat arus listrik (Ampere) yang paling proporsional adalah...",
    "options": [
      "100 - 125 Ampere",
      "40 - 60 Ampere",
      "180 - 220 Ampere",
      "250 - 300 Ampere"
    ],
    "answer": "100 - 125 Ampere",
    "explanation": "Aturan umum praktis kuat arus elektroda diameter 3,2 mm adalah berkisar antara 90 - 130 Ampere (rata-rata 35-40 A per mm diameter)."
  },
  {
    "id": 12,
    "question": "Pada pembubutan ulir metris M10 x 1,5, berapakah kedalaman pemotongan ulir total (h) secara teoritis jika menggunakan rumus h = 0,6134 × P?",
    "options": [
      "0,92 mm",
      "1,50 mm",
      "0,61 mm",
      "1,22 mm"
    ],
    "answer": "0,92 mm",
    "explanation": "Kedalaman ulir luar metris teoritis: h = 0,6134 × Kisar (P) = 0,6134 × 1,5 mm = 0,9201 mm ≈ 0,92 mm."
  },
  {
    "id": 13,
    "question": "Sebuah poros berdiameter 25 mm berputar pada putaran spindel n = 800 RPM. Berapakah kecepatan potong aktualnya (Cs)?",
    "options": [
      "62,8 m/menit",
      "45,0 m/menit",
      "78,5 m/menit",
      "31,4 m/menit"
    ],
    "answer": "62,8 m/menit",
    "explanation": "Rumus: Cs = (π × d × n) / 1000 = (3,14 × 25 × 800) / 1000 = 62800 / 1000 = 62,8 m/menit."
  },
  {
    "id": 14,
    "question": "Menggunakan kepala pembagi (dividing head) dengan rasio cacing 40:1, berapa putaran engkol yang harus dilakukan untuk mengefrais batang segi-6 beraturan?",
    "options": [
      "6 putaran penuh ditambah 4/6 putaran (atau 16 lubang pada piringan 24)",
      "4 putaran penuh pas",
      "10 putaran penuh pas",
      "5 putaran penuh ditambah 1/2 putaran"
    ],
    "answer": "6 putaran penuh ditambah 4/6 putaran (atau 16 lubang pada piringan 24)",
    "explanation": "Rumus pembagian sederhana kepala pembagi: n_engkol = i / z = 40 / 6 = 6 4/6 = 6 2/3 putaran (pada piringan berlubang 24: 6 putaran penuh + 16 lubang)."
  },
  {
    "id": 15,
    "question": "Untuk membuat ulir dalam M8 x 1,25, teknisi harus menyiapkan mata bor berukuran diameter...",
    "options": [
      "6,75 mm",
      "7,25 mm",
      "6,00 mm",
      "7,50 mm"
    ],
    "answer": "6,75 mm",
    "explanation": "D_bor = D_nominal - P = 8 mm - 1,25 mm = 6,75 mm (dapat menggunakan mata bor 6,7 mm atau 6,8 mm)."
  },
  {
    "id": 16,
    "question": "Saat mengelas sambungan tumpul (butt joint) posisi bawah tangan (flat 1G) dengan SMAW, sudut kemiringan elektroda yang benar terhadap garis kerja arah pengelasan adalah...",
    "options": [
      "70° - 80° (miring menarik 10° - 20° dari garis tegak lurus)",
      "30° - 40° (miring rebah mendatar)",
      "Tepat 90° tegak lurus tanpa kemiringan",
      "45° miring ke arah samping sambungan"
    ],
    "answer": "70° - 80° (miring menarik 10° - 20° dari garis tegak lurus)",
    "explanation": "Sudut elektroda yang tepat pada posisi 1G adalah 70° hingga 80° searah gerakan las (metode menarik / dragging) dengan sudut bidang kerja 90°."
  },
  {
    "id": 17,
    "question": "Berapakah kedalaman pemotongan (depth of cut / a) pada mesin bubut jika diameter poros dikurangi dari 54 mm menjadi 48 mm dalam 1 kali lintasan?",
    "options": [
      "3,0 mm",
      "6,0 mm",
      "1,5 mm",
      "4,5 mm"
    ],
    "answer": "3,0 mm",
    "explanation": "Rumus kedalaman potong pembubutan silindris: a = (D_awal - D_akhir) / 2 = (54 - 48) / 2 = 6 / 2 = 3,0 mm."
  },
  {
    "id": 18,
    "question": "Pelat baja setebal 20 mm akan dilubangi tembus dengan mata bor d = 10 mm. Jika panjang ujung tirus bor adalah 0,3 × d, berapakah panjang total langkah pemakanan mata bor hingga tembus penuh?",
    "options": [
      "23 mm",
      "20 mm",
      "25 mm",
      "28 mm"
    ],
    "answer": "23 mm",
    "explanation": "Panjang ujung tirus bor h = 0,3 × d = 0,3 × 10 = 3 mm. Total langkah potong = tebal pelat + h = 20 + 3 = 23 mm."
  },
  {
    "id": 19,
    "question": "Dua komponen mesin dirakit dengan toleransi ISO: Lubang Ø30 H7 (+0,021 / 0) dan Poros Ø30 g6 (-0,007 / -0,020). Jenis suaian yang dihasilkan adalah...",
    "options": [
      "Suaian Longgar (Clearance Fit)",
      "Suaian Sesak (Interference Fit)",
      "Suaian Paksa Panas (Shrink Fit)",
      "Suaian Transisi Ketat (Press Fit)"
    ],
    "answer": "Suaian Longgar (Clearance Fit)",
    "explanation": "Ukuran poros terbesar (29,993 mm) masih lebih kecil dari ukuran lubang terkecil (30,000 mm), sehingga selalu terdapat celah kelonggaran positif (Suaian Longgar/Clearance)."
  },
  {
    "id": 20,
    "question": "Seorang pembubut memerlukan bahan baku untuk membuat 4 unit benda kerja panjang masing-masing 45 mm. Lebar pahat potong 3 mm dan kelonggaran facing ujung 2 mm per benda. Panjang bahan mentah minimal adalah...",
    "options": [
      "200 mm",
      "180 mm",
      "192 mm",
      "215 mm"
    ],
    "answer": "200 mm",
    "explanation": "Kebutuhan per benda: 45 mm + 2 mm facing + 3 mm alur potong = 50 mm. Untuk 4 unit benda kerja: 4 × 50 mm = 200 mm."
  },
  {
    "id": 21,
    "question": "Saat membubut ulir metris segitiga, metode pemakanan miring eretan atas (compound rest) disetel pada sudut sebesar...",
    "options": [
      "29° hingga 30°",
      "45° hingga 50°",
      "60° tepat",
      "15° hingga 20°"
    ],
    "answer": "29° hingga 30°",
    "explanation": "Eretan atas disetel setengah dari sudut profil ulir (60° / 2 = 30°, praktiknya 29°-29,5°) agar penyayatan terjadi hanya pada satu sisi mata potong pahat untuk mengurangi beban potong dan mencegah getaran."
  },
  {
    "id": 22,
    "question": "Sebuah poros berdiameter 40 mm dibubut menggunakan pahat karbida (Cs = 120 m/menit). Berapakah putaran spindel (n) yang harus disetel operator?",
    "options": [
      "955 RPM",
      "600 RPM",
      "1200 RPM",
      "450 RPM"
    ],
    "answer": "955 RPM",
    "explanation": "n = (1000 × Cs) / (π × d) = (1000 × 120) / (3,14 × 40) = 120000 / 125,6 ≈ 955 RPM."
  },
  {
    "id": 23,
    "question": "Pada pembubutan finishing, jika gerak makan f = 0,1 mm/putaran dan radius ujung pahat rε = 0,8 mm, berapakah nilai kekasaran permukaan teoritis puncak-ke-lembah (Rmax = f² / 8rε)?",
    "options": [
      "1,56 µm",
      "3,12 µm",
      "0,78 µm",
      "6,25 µm"
    ],
    "answer": "1,56 µm",
    "explanation": "Rmax = f² / (8 × rε) = (0,1)² / (8 × 0,8) = 0,01 / 6,4 = 0,00156 mm = 1,56 µm."
  },
  {
    "id": 24,
    "question": "Pahat CNC berada di posisi absolut (X20, Z-15). Jika diprogram dengan sistem inkremental (G91) menuju posisi (X40, Z-35), nilai masukan program adalah...",
    "options": [
      "G91 X20 Z-20",
      "G91 X40 Z-35",
      "G91 X-20 Z20",
      "G91 X60 Z-50"
    ],
    "answer": "G91 X20 Z-20",
    "explanation": "Nilai inkremental (jarak pergeseran): ΔX = X_tujuan - X_awal = 40 - 20 = +20; ΔZ = Z_tujuan - Z_awal = -35 - (-15) = -20. Jadi: G91 X20 Z-20."
  },
  {
    "id": 25,
    "question": "Berapakah laju pembuangan logam (Metal Removal Rate / MRR) dalam cm³/menit pada pembubutan dengan Cs = 60 m/menit, kedalaman potong a = 2 mm, dan gerak makan f = 0,25 mm/putaran? (Rumus: MRR = Cs × a × f)",
    "options": [
      "30 cm³/menit",
      "15 cm³/menit",
      "60 cm³/menit",
      "120 cm³/menit"
    ],
    "answer": "30 cm³/menit",
    "explanation": "MRR = Cs (m/menit) × a (mm) × f (mm) = 60 × 1000 mm/menit × 2 mm × 0,25 mm = 30.000 mm³/menit = 30 cm³/menit."
  }
],
    essays: [
  {
    "id": 1,
    "question": "Sebuah poros baja ST41 berdiameter 60 mm akan dibubut rata sepanjang 150 mm dengan kecepatan potong (Cs) 30 m/menit dan gerak makan (f) 0,2 mm/putaran. Hitunglah putaran spindel teoritis (n) dan waktu pemesinan (tc) untuk 1 kali lintasan!",
    "expectedPoints": [
      "Menghitung putaran spindel: n = (1000 × Cs) / (π × d) = (1000 × 30) / (3,14 × 60) = 30000 / 188,4 = 159,2 RPM (dibulatkan sesuai tingkat spindel mesin, misal 160 RPM).",
      "Menghitung waktu pemesinan: tc = L / (f × n) = 150 / (0,2 × 159,2) = 150 / 31,84 = 4,71 menit (sekitar 4 menit 43 detik)."
    ]
  },
  {
    "id": 2,
    "question": "Sebuah benda kerja silindris akan dibubut tirus dengan spesifikasi: diameter besar D = 55 mm, diameter kecil d = 45 mm, dan panjang bagian tirus L = 70 mm. Hitunglah besar sudut pergeseran eretan atas (α) yang harus disetel oleh operator!",
    "expectedPoints": [
      "Menuliskan rumus pergeseran sudut eretan atas: tan α = (D - d) / (2 × L).",
      "Substitusi nilai: tan α = (55 - 45) / (2 × 70) = 10 / 140 = 0,0714.",
      "Menghitung sudut: α = arctan(0,0714) ≈ 4,08° (atau 4 derajat 5 menit busur)."
    ]
  },
  {
    "id": 3,
    "question": "Jelaskan langkah-langkah penerapan prosedur membubut ulir metris luar M16 x 2,0 pada mesin bubut konvensional mulai dari penyiapan benda kerja, penyetelan roda gigi, hingga penyayatan akhir!",
    "expectedPoints": [
      "Membubut diameter luar poros menjadi ukuran nominal M16 (atau sedikit dikurangi 0,1-0,2 mm menjadi 15,8-15,9 mm) dan membuat chamfer serta alur pembebas.",
      "Menyetel tuas gearbox/roda gigi transmisi drat sesuai tabel kisar 2,0 mm dan memasang pahat ulir 60° setinggi senter tegak lurus sumbu poros menggunakan mal ulir.",
      "Menyetel eretan atas miring 29°-30°, menyentuhkan pahat, menolkan skala, dan melakukan penyayatan bertahap dengan kedalaman berkurang tiap lintasan sambil menggunakan cairan pendingin hingga kedalaman total ~1,22 mm dan memeriksa dengan mal/mur M16."
    ]
  },
  {
    "id": 4,
    "question": "Pelat baja tebal 15 mm akan dibuat lubang ulir dalam M10 x 1,5. Tentukan diameter mata bor yang digunakan, hitung putaran mesin bor jika Cs = 22 m/menit, dan jelaskan urutan penggunaan tap nomor 1, 2, dan 3!",
    "expectedPoints": [
      "Diameter bor: D_bor = D_nominal - P = 10 - 1,5 = 8,5 mm.",
      "Putaran bor: n = (1000 × 22) / (3,14 × 8,5) = 22000 / 26,69 ≈ 824 RPM.",
      "Urutan pengetapan: Tap No. 1 (tirus panjang) untuk awal alur ulir tegak lurus, Tap No. 2 (tirus sedang) untuk membentuk profil ulir utama, Tap No. 3 (ujung tumpul) untuk penyelesaian akhir ulir penuh dengan gerakan 3/4 maju dan 1/4 putaran balik memutus geram menggunakan pelumas."
    ]
  },
  {
    "id": 5,
    "question": "Pada pengelasan sambungan tumpul (butt joint) pelat baja karbon setebal 8 mm menggunakan las busur listrik SMAW, tentukan bentuk kampuh las yang dibuat, jenis dan diameter elektroda yang tepat, serta besaran kuat arus (Ampere) yang disetel!",
    "expectedPoints": [
      "Bentuk kampuh: Kampuh V tunggal (Single V-Groove) dengan sudut buka 60°-70°, root face 1-2 mm, dan root gap 1,5-2 mm.",
      "Elektroda: AWS E6013 atau E7018. Root pass menggunakan diameter 2,6 mm (arus 70-90 A), filler dan capping pass menggunakan diameter 3,2 mm (arus 100-130 A).",
      "Teknik pengelasan: pembersihan terak antar layer secara tuntas sebelum mengelas lapisan penutup (capping)."
    ]
  }
]
  },
  hots: {
    id: 'hots',
    levelTitle: 'Tingkat HOTS Fase E: Analisis & Problem Solving',
    shortTitle: 'HOTS Fase E',
    badge: 'HOTS Fase E: Analisis & Evaluasi',
    badgeColor: '#ec4899',
    description: 'Evaluasi tingkat tinggi kurikulum merdeka Fase E: analisis cacat manufaktur, keausan pahat & BUE, getaran chatter, investigasi K3, dan rencana proses pemesinan kompleks.',
    multipleChoice: [
  {
    "id": 1,
    "question": "Seorang operator membubut poros baja pejal panjang 600 mm dengan diameter 24 mm (rasio L/D = 25). Saat pemakanan, terjadi getaran hebat (chatter) dan diameter bagian tengah poros menjadi 0,3 mm lebih besar dibanding kedua ujungnya. Solusi rekayasa teknis paling tepat adalah...",
    "options": [
      "Memasang penyangga jalan (follow rest) atau kacamata tetap (steady rest) dan mengurangi kedalaman potong",
      "Menaikkan putaran spindel ke RPM maksimum dan menekan pahat lebih keras",
      "Mengganti pahat HSS dengan pahat karbida tanpa mengubah sistem pencekaman",
      "Menggeser kepala lepas (tailstock) menjauhi benda kerja agar poros bebas memuai"
    ],
    "answer": "Memasang penyangga jalan (follow rest) atau kacamata tetap (steady rest) dan mengurangi kedalaman potong",
    "explanation": "Rasio L/D > 10 menyebabkan defleksi lentur akibat gaya potong radial. Poros melengkung di tengah sehingga menghasilkan diameter cembung dan getaran (chatter). Solusinya adalah memasang steady/follow rest untuk menopang defleksi."
  },
  {
    "id": 2,
    "question": "Saat membubut material aluminium liat dengan pahat HSS pada kecepatan potong rendah, operator mendapati permukaan benda kerja menjadi buram, sobek, dan terdapat gumpalan logam yang mengelas diri pada ujung pahat. Fenomena ini disebut...",
    "options": [
      "Built-Up Edge (BUE), yang diatasi dengan menaikkan kecepatan potong (Cs) dan memberikan cairan pendingin berpelumas tinggi",
      "Flank Wear, yang diatasi dengan memperlambat laju gerak makan (feed rate)",
      "Thermal Shock, yang diatasi dengan mematikan aliran pendingin secara berkala",
      "Crater Wear difusional, yang diatasi dengan menurunkan sudut tatal pahat"
    ],
    "answer": "Built-Up Edge (BUE), yang diatasi dengan menaikkan kecepatan potong (Cs) dan memberikan cairan pendingin berpelumas tinggi",
    "explanation": "BUE terjadi ketika serpihan material liat menempel pada ujung mata potong akibat tekanan dan gesekan tinggi pada suhu rendah-menengah. BUE dapat dicegah dengan menaikkan Cs, menggunakan pahat poles licin berlapis, dan pelumasan yang baik."
  },
  {
    "id": 3,
    "question": "Pada pengefraisan bidang rata pelat baja, hasil permukaan menunjukkan bekas gelombang melintang tidak beraturan (chatter marks). Setelah diinvestigasi, meja mesin bergerak tersendat-sendat mengikuti putaran pisau. Evaluasi akar masalah teknis yang paling tepat adalah...",
    "options": [
      "Operator menerapkan metode Down Milling pada mesin konvensional tua yang memiliki celah kelonggaran ulir meja (backlash) besar",
      "Kecepatan putaran spindel terlalu rendah sehingga pisau frais kehilangan daya puntir motor",
      "Benda kerja dijepit terlalu kuat pada ragum sehingga mengalami deformasi elastis",
      "Cairan pendingin yang digunakan memiliki viskositas yang terlalu encer"
    ],
    "answer": "Operator menerapkan metode Down Milling pada mesin konvensional tua yang memiliki celah kelonggaran ulir meja (backlash) besar",
    "explanation": "Pada down milling, pisau menarik meja mesin ke arah pemakanan. Jika mesin tua tidak dilengkapi sistem backlash eliminator, celah ulir menyebabkan meja tersentak maju tak terkontrol menghasilkan chatter marks dan berisiko mematahkan pisau."
  },
  {
    "id": 4,
    "question": "Hasil pemeriksaan visual sambungan las SMAW menemukan cacat berupa parit tajam memanjang pada batas antara logam las dan logam induk (undercut). Analisis penyebab utama cacat tersebut adalah...",
    "options": [
      "Kuat arus (Ampere) disetel terlalu tinggi, ayunan elektroda terlalu cepat di bagian tepi, dan sudut elektroda salah",
      "Arus listrik terlalu rendah dan jarak busur nyala (arc length) terlalu dekat",
      "Elektroda belum dikeringkan di dalam oven pemanas (holding oven)",
      "Logam induk yang dilas memiliki kandungan karbon yang terlalu rendah"
    ],
    "answer": "Kuat arus (Ampere) disetel terlalu tinggi, ayunan elektroda terlalu cepat di bagian tepi, dan sudut elektroda salah",
    "explanation": "Undercut disebabkan oleh panas berlebih (arus terlalu tinggi) yang mencairkan tepi logam induk, diperparah dengan kecepatan ayunan terlalu cepat di tepi sambungan sehingga logam pengisi belum sempat mengisi parit lelehan tersebut."
  },
  {
    "id": 5,
    "question": "Sebuah benda kerja silinder dibubut memanjang dijepit di antara dua senter (between centers). Setelah diukur, diameter ujung dekat kepala tetap adalah 30,00 mm, sedangkan diameter ujung dekat kepala lepas adalah 30,35 mm. Evaluasi tindakan perbaikan adalah...",
    "options": [
      "Menyetel kelurusan kepala lepas (tailstock alignment) dengan menggeser badan tailstock ke arah depan operator sejauh 0,175 mm",
      "Mengganti senter putar kepala lepas dengan senter mati karbida",
      "Mengasah ulang sudut tatal pahat menjadi lebih tirus",
      "Menaikkan posisi pahat 0,35 mm di atas garis senter"
    ],
    "answer": "Menyetel kelurusan kepala lepas (tailstock alignment) dengan menggeser badan tailstock ke arah depan operator sejauh 0,175 mm",
    "explanation": "Benda tirus membesar ke arah tailstock berarti sumbu tailstock bergeser menjauhi operator. Koreksi pergeseran sebesar setengah dari selisih diameter: (30,35 - 30,00) / 2 = 0,175 mm ke arah depan operator."
  },
  {
    "id": 6,
    "question": "Ulir metris luar M12 x 1,75 yang selesai dibubut tidak dapat masuk ke dalam mur standar, padahal diameter luar (12 mm) dan kedalaman potong nominal sudah dicapai. Hasil analisis pemeriksaan dengan mal ulir menunjukkan celah sudut profil tidak rapat. Akar masalah kegagalan tersebut adalah...",
    "options": [
      "Sudut asah ujung pahat ulir tidak tepat 60° atau penyetelan posisi pahat tidak tegak lurus sempurna terhadap sumbu poros",
      "Kecepatan putaran spindel mesin saat membubut ulir disetel terlalu lambat",
      "Minyak pelumas yang digunakan saat mengulir menyebabkan pemuaian dimensi logam",
      "Pahat potong mengalami keausan kawah pada bidang buang beram"
    ],
    "answer": "Sudut asah ujung pahat ulir tidak tepat 60° atau penyetelan posisi pahat tidak tegak lurus sempurna terhadap sumbu poros",
    "explanation": "Jika sudut pahat tidak tepat 60° atau posisinya miring (tidak tegak lurus sumbu dengan mal ulir), profil sudut alur ulir menjadi cacat/miring, sehingga diameter efektif (pitch diameter) tidak sesuai dan mur tidak dapat berpasangan."
  },
  {
    "id": 7,
    "question": "Dalam investigasi insiden K3 bengkel manufaktur, kunci chuck terlempar mengenai dinding saat sakelar mesin bubut dinyalakan. Evaluasi pengendalian bahaya tingkat rekayasa teknik (Engineering Control) paling efektif untuk mencegah terulangnya insiden ini adalah...",
    "options": [
      "Memasang tudung pengaman chuck (chuck guard) terintegrasi sakelar pembatas (safety limit switch) sehingga mesin tidak dapat menyala jika tudung terbuka",
      "Membuat poster peringatan K3 berukuran besar tepat di atas kepala tetap mesin bubut",
      "Mewajibkan operator memakai helm pengaman dan kacamata safety berlapis ganda",
      "Memberikan sanksi teguran tertulis kepada siswa yang meninggalkan kunci chuck"
    ],
    "answer": "Memasang tudung pengaman chuck (chuck guard) terintegrasi sakelar pembatas (safety limit switch) sehingga mesin tidak dapat menyala jika tudung terbuka",
    "explanation": "Sesuai hierarki pengendalian bahaya, Engineering Control berupa interlock safety guard mencegah mesin hidup saat cover terbuka/kunci terpasang, mengeliminasi faktor kelalaian manusia (human error)."
  },
  {
    "id": 8,
    "question": "Sebuah pelat tipis tebal 3 mm dijepit pada ragum mesin frais untuk diratakan permukaannya. Setelah dilepas dari ragum, pelat tersebut melengkung (warping) seperti busur. Analisis penyebab kegagalan dan solusinya adalah...",
    "options": [
      "Gaya pencekaman ragum berlebih menyebabkan tekuk elastis saat pemotongan; solusinya gunakan meja magnetik, klem vakum, atau penjepitan pelat bertingkat",
      "Cairan pendingin terlalu dingin sehingga membekukan logam pelat; solusinya pemotongan kering",
      "Pisau frais berputar terlalu lambat; solusinya naikkan RPM ke batas tertinggi",
      "Benda kerja harus dipanaskan terlebih dahulu hingga 500°C sebelum dijepit pada ragum"
    ],
    "answer": "Gaya pencekaman ragum berlebih menyebabkan tekuk elastis saat pemotongan; solusinya gunakan meja magnetik, klem vakum, atau penjepitan pelat bertingkat",
    "explanation": "Pelat tipis mudah tertekuk (buckling) saat dijepit ragum horizontal. Ketika disayat dalam kondisi tertekuk lalu dilepas, tegangan internal dan elastisitas membuatnya melengkung. Solusinya adalah pencekaman vakum/magnetik atau fixture khusus."
  },
  {
    "id": 9,
    "question": "Dalam pembuatan poros bertingkat yang memiliki ulir metris pada ujungnya dan alur pasak di bagian tengah, urutan perencanaan proses (process planning) yang paling benar dan aman adalah...",
    "options": [
      "Bubut bertingkat -> Bubut ulir -> Frais alur pasak -> Finishing chamfer dan deburring",
      "Frais alur pasak -> Bubut bertingkat kasar -> Bubut ulir -> Potong bahan",
      "Bubut ulir -> Frais alur pasak -> Bubut bertingkat kasar -> Bubut halus",
      "Potong bahan -> Frais alur pasak -> Bubut bertingkat -> Bubut ulir"
    ],
    "answer": "Bubut bertingkat -> Bubut ulir -> Frais alur pasak -> Finishing chamfer dan deburring",
    "explanation": "Pembubutan harus diselesaikan lebih dahulu (karena pencekaman silindris butuh konsentrisitas tinggi). Jika alur pasak dibuat sebelum membubut, sayatan pada alur pasak menjadi 'interrupted cut' yang membuat pahat bubut mudah patah dan bergetar."
  },
  {
    "id": 10,
    "question": "Pada pembubutan kecepatan tinggi baja paduan menggunakan pahat karbida, timbul cekungan kawah (crater wear) pada bidang tatal pahat. Berdasarkan teori keausan pahat, mekanisme utama terjadinya crater wear adalah...",
    "options": [
      "Difusi atomik antara serbuk karbida dan beram logam pada suhu kontak yang sangat tinggi di atas bidang tatal",
      "Kerapuhan partikel kobalt akibat tumbukan mekanik getaran meja mesin",
      "Oksidasi udara bebas pada saat cairan pendingin disemprotkan secara tidak merata",
      "Adanya kotoran pasir cetak yang menempel pada permukaan benda kerja"
    ],
    "answer": "Difusi atomik antara serbuk karbida dan beram logam pada suhu kontak yang sangat tinggi di atas bidang tatal",
    "explanation": "Crater wear terjadi pada bidang tatal akibat fenomena difusi atomik padat (kimiawi) antara elemen pahat dan geram yang mengalir di bawah tekanan dan temperatur sangat tinggi (700°-1100°C)."
  },
  {
    "id": 11,
    "question": "Hasil pengeboran lubang diameter 12 mm pada pelat baja menghasilkan lubang yang lonjong (tidak bulat) dan diameternya membesar menjadi 12,45 mm. Evaluasi kondisi geometri mata bor yang menjadi penyebabnya adalah...",
    "options": [
      "Panjang bibir potong (cutting lip) kiri dan kanan diasah tidak sama panjang dan sudut puncak tidak simetris",
      "Sudut bebas (lip relief angle) mata bor dibuat terlalu kecil kurang dari 3 derajat",
      "Alur heliks mata bor tersumbat oleh serpihan beram logam kering",
      "Tangkai tirus morse mata bor dipasang tanpa menggunakan sarung tirus perantara"
    ],
    "answer": "Panjang bibir potong (cutting lip) kiri dan kanan diasah tidak sama panjang dan sudut puncak tidak simetris",
    "explanation": "Jika salah satu bibir potong lebih panjang atau sudutnya tidak sama, titik senter mata bor akan terdorong eksentris saat berputar, menghasilkan lubang yang 'oversize' dan tidak silindris sempurna."
  },
  {
    "id": 12,
    "question": "Pada pengelasan konstruksi baja luar ruangan (outdoor) dengan SMAW, ditemukan cacat porositas (porosity / lubang cacing) yang masif pada logam las. Hasil evaluasi penyebab yang paling relevan adalah...",
    "options": [
      "Fluks elektroda lembap karena tidak di-oven, kampuh terkontaminasi air/karat, dan hembusan angin kencang mengganggu gas pelindung",
      "Kuat arus listrik yang digunakan terlalu rendah sehingga terak tidak dapat mengapung ke atas",
      "Sudut kampuh sambungan dibuka terlalu lebar hingga 90 derajat",
      "Kawat elektroda memiliki diameter yang terlalu besar dibandingkan tebal pelat"
    ],
    "answer": "Fluks elektroda lembap karena tidak di-oven, kampuh terkontaminasi air/karat, dan hembusan angin kencang mengganggu gas pelindung",
    "explanation": "Porositas terjadi akibat terperangkapnya gas hidrogen (dari uap air/fluks lembap/karat) dan nitrogen/oksigen (dari angin kencang yang meniup gas pelindung) saat cairan las membeku cepat."
  },
  {
    "id": 13,
    "question": "Dalam konsep High Speed Machining (HSM) pada mesin frais modern, strategi pemotongan yang diterapkan untuk memaksimalkan efisiensi dan keawetan pahat adalah...",
    "options": [
      "Kedalaman aksial dalam (high ap), lebar pemakanan radial tipis (small ae), dan kecepatan makan (feed rate) sangat tinggi",
      "Kedalaman aksial sangat dangkal, pemakanan radial penuh (slotting), dan RPM sangat rendah",
      "Mematikan cairan pendingin dan memperbesar sudut baji pahat hingga 90 derajat",
      "Menggunakan pahat berdiameter sangat besar dengan putaran spindel lambat"
    ],
    "answer": "Kedalaman aksial dalam (high ap), lebar pemakanan radial tipis (small ae), dan kecepatan makan (feed rate) sangat tinggi",
    "explanation": "HSM mengandalkan sayatan aksial panjang (memanfaatkan seluruh panjang mata potong) dengan 'radial engagement' kecil, sehingga panas pemotongan terbawa keluar bersama geram (chip thinning effect)."
  },
  {
    "id": 14,
    "question": "Komponen baja perkakas karbon tinggi (0,9% C) yang baru saja di-quench dari suhu 820°C mengalami keretakan longitudinal fatal sebelum sempat masuk ke tungku tempering. Analisis penyebab kegagalan termal ini adalah...",
    "options": [
      "Media pendingin terlalu drastis (air dingin) dan jeda waktu menuju proses tempering terlalu lama sehingga tegangan sisa transformasi martensit memecahkan baja",
      "Suhu pemanasan austenit kurang tinggi sehingga struktur mikro ferit kasar tidak larut",
      "Benda kerja dimasukkan ke bak pendingin secara vertikal sejajar sumbu poros",
      "Kandungan karbon pada baja terlalu rendah sehingga laju pendinginan kurang cepat"
    ],
    "answer": "Media pendingin terlalu drastis (air dingin) dan jeda waktu menuju proses tempering terlalu lama sehingga tegangan sisa transformasi martensit memecahkan baja",
    "explanation": "Baja karbon tinggi sangat sensitif terhadap distorsi dan retak quench (quench cracking). Media air menghasilkan laju pendinginan terlalu ekstrem, memicu tegangan ekspansi transformasi martensit masif."
  },
  {
    "id": 15,
    "question": "Berdasarkan persamaan umur pahat Taylor (V · T^n = C), jika kecepatan potong (V) dinaikkan sebesar 50%, apa dampak matematis dan praktis terhadap umur pahat potong (T)?",
    "options": [
      "Umur pahat menurun secara eksponensial drastis karena suhu pada zona kontak mata potong meningkat tajam",
      "Umur pahat akan meningkat proporsional karena waktu kontak penyayatan menjadi lebih singkat",
      "Umur pahat tetap konstan karena nilai eksponen n mengimbangi kenaikan kecepatan potong",
      "Umur pahat berkurang tepat 50% mengikuti penurunan kecepatan potong secara linier"
    ],
    "answer": "Umur pahat menurun secara eksponensial drastis karena suhu pada zona kontak mata potong meningkat tajam",
    "explanation": "Karena nilai n umumnya antara 0,1 - 0,4 (eksponen fraksional), kenaikan kecil pada kecepatan potong (V) mengakibatkan penurunan drastis pada umur pahat (T) akibat percepatan laju keausan termal."
  },
  {
    "id": 16,
    "question": "Pada perakitan sistem poros dan bantalan (bearing), seorang teknisi mendapati bahwa poros dengan ukuran batas material maksimum (MMC) tidak dapat masuk ke lubang bantalan berukuran batas material minimum (MMCL). Analisis kondisi toleransi ini menunjukkan...",
    "options": [
      "Terjadi suaian sesak (interference) atau penyimpangan bentuk geometri (kebulatan/kelurusan) yang melampaui batas toleransi",
      "Alat ukur mikrometer yang digunakan mengalami keausan pada permukaan landasannya",
      "Poros mengalami penyusutan termal akibat berada di ruangan ber-AC",
      "Bantalan kehilangan lapisan oli pelumas sebelum dipasang ke rumah bantalan"
    ],
    "answer": "Terjadi suaian sesak (interference) atau penyimpangan bentuk geometri (kebulatan/kelurusan) yang melampaui batas toleransi",
    "explanation": "Bila poros di ukuran terbesar (MMC) dipasangkan dengan lubang di ukuran terkecil (MMC lubang), jika selisihnya positif pada poros atau terdapat cacat kebulatan/kelurusan, perakitan akan macet (terjadi interferensi tak terencana)."
  },
  {
    "id": 17,
    "question": "Saat membuat ulir dalam pada pelat baja tahan karat (Stainless Steel AISI 304) menggunakan tap M6, mata tap patah terjepit di dalam lubang. Analisis sifat mekanik material dan kesalahan prosedur yang memicu patahnya tap adalah...",
    "options": [
      "Stainless steel memiliki kecenderungan pengerasan regangan (work hardening) tinggi; operator memutar tap terus-menerus tanpa putaran balik pemutus beram dan tanpa pelumas khusus",
      "Stainless steel terlalu lunak sehingga material meleleh dan membekukan mata tap di dalam lubang",
      "Mata bor yang digunakan memiliki diameter yang terlalu besar sehingga tap kehilangan kontak sayat",
      "Operator menyetel kecepatan pemotongan tap terlalu tinggi pada mesin bubut otomatis"
    ],
    "answer": "Stainless steel memiliki kecenderungan pengerasan regangan (work hardening) tinggi; operator memutar tap terus-menerus tanpa putaran balik pemutus beram dan tanpa pelumas khusus",
    "explanation": "AISI 304 bersifat liat dan sangat cepat mengalami work hardening saat terdeformasi gesek. Pengetapan manual wajib diputar balik 1/4 putaran secara berkala untuk memutus beram dan menggunakan pelumas sulfurized cutting oil."
  },
  {
    "id": 18,
    "question": "Di bengkel manufaktur terjadi tumpahan cairan pendingin berminyak (coolant emulsion) di jalur evakuasi utama. Menurut standar keselamatan kerja bengkel, urutan penanganan darurat paling tepat adalah...",
    "options": [
      "Pasang tanda bahaya lantai licin -> Taburkan serbuk gergaji/pasir penyerap -> Bersihkan serbuk -> Pel lantai dengan cairan pembersih -> Evaluasi sumber kebocoran",
      "Bilas tumpahan minyak dengan air bertekanan tinggi menuju selokan luar ruangan",
      "Biarkan mengering dengan sendirinya sambil menyalakan kipas angin ventilasi bengkel",
      "Menutupi tumpahan oli dengan kain majun basah dan melanjutkan pekerjaan mesin"
    ],
    "answer": "Pasang tanda bahaya lantai licin -> Taburkan serbuk gergaji/pasir penyerap -> Bersihkan serbuk -> Pel lantai dengan cairan pembersih -> Evaluasi sumber kebocoran",
    "explanation": "Penanganan tumpahan bahan kimia/oli wajib mengutamakan isolasi bahaya terpeleset (tanda barikade), absorpsi cairan dengan penyerap kering, pembersihan tuntas, dan inspeksi preventif kebocoran mesin."
  },
  {
    "id": 19,
    "question": "Pengujian radiografi pada sambungan las pelat tebal 12 mm menemukan cacat Kurang Penetrasi (Incomplete Penetration) pada akar las. Evaluasi faktor pengelasan yang paling berpotensi menyebabkan cacat tersebut adalah...",
    "options": [
      "Root gap (celah akar) terlalu rapat, root face terlalu tebal, dan kuat arus pada lintasan akar (root pass) terlalu rendah",
      "Sudut bevel kampuh dibuka terlalu lebar hingga 80 derajat",
      "Kecepatan las (travel speed) terlalu lambat sehingga masukan panas berlebih",
      "Ayunan elektroda terlalu lebar melebihi tiga kali diameter kawat inti"
    ],
    "answer": "Root gap (celah akar) terlalu rapat, root face terlalu tebal, dan kuat arus pada lintasan akar (root pass) terlalu rendah",
    "explanation": "Incomplete penetration terjadi ketika busur las gagal mencairkan akar sambungan secara penuh akibat celah akar tertutup rapat, muka akar terlalu tebal, atau arus las tidak cukup kuat menembus dasar kampuh."
  },
  {
    "id": 20,
    "question": "Sebuah bengkel menerima pesanan manufaktur 10.000 unit poros bertingkat presisi tinggi (toleransi ±0,005 mm). Evaluasi pemilihan kombinasi mesin paling ekonomis dan efisien untuk produksi massal tersebut adalah...",
    "options": [
      "Mesin CNC Turning Lathe untuk pengerjaan kasar dan semi-finish, dilanjutkan Mesin Cylindrical Grinding untuk finishing presisi",
      "Mesin Bubut Konvensional dikerjakan manual oleh 50 operator secara bergantian",
      "Mesin Frais Universal menggunakan pisau modul roda gigi horizontal",
      "Mesin Sekrap (Shaper) dengan alat bantu fixture khusus pemegang poros"
    ],
    "answer": "Mesin CNC Turning Lathe untuk pengerjaan kasar dan semi-finish, dilanjutkan Mesin Cylindrical Grinding untuk finishing presisi",
    "explanation": "Untuk 10.000 unit dengan toleransi ketat IT5/IT6 (±0,005 mm), CNC Lathe menjamin kecepatan dan konsistensi bentuk massal, disusul Cylindrical Grinder untuk mencapai toleransi dimensi dan kehalusan permukaan sub-mikron."
  },
  {
    "id": 21,
    "question": "Saat mengefrais dinding tipis (thin wall) dari balok aluminium, dinding tersebut bergetar dan melengkung menjauhi pisau potong sehingga ketebalannya tidak seragam. Rekomendasi strategi pemotongan untuk mengatasi masalah ini adalah...",
    "options": [
      "Mengurangi kedalaman potong radial (ae), menggunakan strategi step-down berpasangan, dan mengisi bagian rongga dalam dengan lilin penopang (support wax)",
      "Menaikkan gaya potong dan menggunakan pisau berdiameter paling besar",
      "Mengerjakan pengefraisan kering tanpa pelumas agar dinding cepat memuai",
      "Menjepit dinding tipis secara langsung menggunakan baut penekan klem T"
    ],
    "answer": "Mengurangi kedalaman potong radial (ae), menggunakan strategi step-down berpasangan, dan mengisi bagian rongga dalam dengan lilin penopang (support wax)",
    "explanation": "Dinding tipis rentan defleksi akibat gaya potong radial. Solusinya adalah meminimalkan gaya radial (ae kecil), pemotongan seimbang bertahap kedua sisi, serta memberikan media pendukung mekanik (damping support)."
  },
  {
    "id": 22,
    "question": "Sebuah mata pisau end mill karbida patah secara seketika saat pertama kali menyentuh benda kerja baja cor yang masih memiliki kerak kulit keras (casting scale). Analisis kegagalan alat potong tersebut adalah...",
    "options": [
      "Pahat karbida yang getas menerima beban impak kejut saat menabrak kerak coran yang keras dan berpasir; solusinya lakukan pemotongan awal dengan pahat roughing tangguh atau gerinda keraknya terlebih dahulu",
      "Kecepatan potong yang digunakan terlalu tinggi sehingga mata pisau terbakar",
      "Cairan pendingin disemprotkan terlalu awal sebelum pisau menyentuh benda kerja",
      "Pencekaman pisau pada collet chuck terlalu kencang melampaui torsi standar"
    ],
    "answer": "Pahat karbida yang getas menerima beban impak kejut saat menabrak kerak coran yang keras dan berpasir; solusinya lakukan pemotongan awal dengan pahat roughing tangguh atau gerinda keraknya terlebih dahulu",
    "explanation": "Kerak pengecoran (casting skin) mengandung inklusi pasir dan karbida besi yang sangat keras dan abrasif. Pahat karbida standar yang getas akan langsung pecah (chipping/fracture) bila menabrak kerak ini tanpa kedalaman potong yang menembus di bawah lapisan kerak."
  },
  {
    "id": 23,
    "question": "Hasil uji tekuk (bend test) pada spesimen las menunjukkan keretakan getas pada daerah Heat Affected Zone (HAZ). Evaluasi metalurgi pengelasan yang mendasari keretakan di zona HAZ adalah...",
    "options": [
      "Terjadi pertumbuhan butir kristal kasar dan pembentukan fasa martensit keras-getas akibat siklus termal pendinginan terlalu cepat",
      "Terak las mencair dan bereaksi dengan gas argon membentuk rongga kosong",
      "Logam pengisi elektroda tidak menyatu dengan fluks pelindung",
      "Kandungan unsur tembaga pada kawat las menyebabkan pemuaian berlebih"
    ],
    "answer": "Terjadi pertumbuhan butir kristal kasar dan pembentukan fasa martensit keras-getas akibat siklus termal pendinginan terlalu cepat",
    "explanation": "Zona HAZ mengalami pemanasan mendekati titik leleh diikuti pendinginan cepat oleh massa logam induk sekitarnya, memicu pertumbuhan butir kasar (coarse grain HAZ) dan fasa martensit yang rentan retak getas saat ditekuk."
  },
  {
    "id": 24,
    "question": "Dalam merancang perlengkapan pencekam khusus (Jig & Fixture) pada mesin gurdi, prinsip pembatasan 6 derajat kebebasan (Degree of Freedom / DOF) sistem 3-2-1 locator menetapkan bahwa...",
    "options": [
      "3 titik tumpu pada bidang dasar (membatasi 3 DOF), 2 titik pada bidang samping (membatasi 2 DOF), dan 1 titik pada bidang ujung (membatasi 1 DOF)",
      "6 titik tumpu dipasang melingkar pada satu bidang permukaan yang sama",
      "3 baut penjepit dipasang di bagian atas dan 3 baut dipasang di bagian bawah",
      "Benda kerja harus ditahan oleh 3 ragum putar dan 2 blok V bertingkat"
    ],
    "answer": "3 titik tumpu pada bidang dasar (membatasi 3 DOF), 2 titik pada bidang samping (membatasi 2 DOF), dan 1 titik pada bidang ujung (membatasi 1 DOF)",
    "explanation": "Prinsip 3-2-1 locating adalah standar penentuan posisi benda kerja dalam fixture: 3 pin pada bidang utama meniadakan 3 DOF (translasi Z, rotasi X & Y), 2 pin pada bidang kedua meniadakan 2 DOF (translasi X, rotasi Z), dan 1 pin pada bidang ketiga meniadakan 1 DOF (translasi Y)."
  },
  {
    "id": 25,
    "question": "Dalam upaya menerapkan manufaktur ramah lingkungan (Green Manufacturing), bengkel permesinan mengganti sistem pendingin banjir (Flood Coolant) dengan Minimum Quantity Lubrication (MQL). Evaluasi manfaat teknis dan lingkungannya adalah...",
    "options": [
      "MQL menyemprotkan aerosol kabut mikro pelumas nabati murni sehingga mengeliminasi limbah cair kimia B3 bengkel secara signifikan",
      "MQL mampu mendinginkan benda kerja hingga di bawah titik beku nol derajat celcius",
      "MQL tidak membutuhkan tekanan udara kompresor sehingga menghemat daya listrik total",
      "MQL membuat serbuk tatal menempel permanen pada meja mesin tanpa perlu dibersihkan"
    ],
    "answer": "MQL menyemprotkan aerosol kabut mikro pelumas nabati murni sehingga mengeliminasi limbah cair kimia B3 bengkel secara signifikan",
    "explanation": "MQL menggunakan mikro-tetesan pelumas nabati (10-100 ml/jam) dengan udara bertekanan, memberikan pelumasan efektif di zona potong tanpa menghasilkan limbah ribuan liter emulsi pendingin beracun (B3)."
  }
],
    essays: [
  {
    "id": 1,
    "question": "Seorang operator membubut poros baja sepanjang 600 mm dengan diameter hanya 25 mm (L/D = 24). Terjadi getaran hebat (chatter) dan diameter bagian tengah poros 0,4 mm lebih besar dibanding kedua ujungnya. Lakukan analisis teknis mengapa hal tersebut terjadi, dan rancang strategi pemecahan masalahnya!",
    "expectedPoints": [
      "Analisis akar masalah: rasio L/D = 24 melampaui batas kekakuan bebas (L/D > 10-12), gaya potong radial mendesak poros melengkung di bagian tengah menjauhi pahat sehingga diameter tengah menjadi cembung (oversize) dan memicu getaran resonansi chatter.",
      "Solusi setup & pencekaman: pasang penyangga jalan (follow rest) yang menempel pada eretan untuk menahan gaya potong tepat di depan pahat, atau gunakan kacamata tetap (steady rest) di tengah poros.",
      "Solusi parameter potong: kurangi kedalaman potong (ap) dan radius ujung pahat (rε) untuk menurunkan gaya potong radial, pilih sudut potong utama mendekati 90° (misal 93° atau 95°), serta atur arah pemakanan menuju kepala tetap."
    ]
  },
  {
    "id": 2,
    "question": "Pada proses pengefraisan balok aluminium paduan menggunakan pisau HSS, didapati permukaan benda kerja sobek-sobek kasar dan terdapat gumpalan logam melekat erat pada ujung mata pisau frais. Analisislah penyebab utama Built-Up Edge (BUE) tersebut, dan jelaskan langkah optimasinya!",
    "expectedPoints": [
      "Penyebab BUE: aluminium memiliki sifat liat dan afinitas kimiawi tinggi terhadap besi pada suhu pemotongan rendah-sedang, tekanan gesek menyebabkan lapisan logam terdeformasi plastis dan mengelas dingin (cold welding) pada bidang tatal pahat.",
      "Optimasi parameter: naikkan kecepatan potong (Cutting Speed) di atas zona kritis pembentukan BUE, tingkatkan gerak makan (feed per tooth) agar ketebalan geram stabil.",
      "Optimasi alat potong & pelumasan: gunakan pahat karbida yang dipoles cermin (mirror polished) atau berlapis DLC (Diamond-Like Carbon), perbesar sudut tatal (positive rake), dan gunakan cairan pendingin emulsi berkonsentrasi tinggi atau MQL khusus aluminium."
    ]
  },
  {
    "id": 3,
    "question": "Sambungan las butt joint pelat baja 10 mm pada rangka mesin mengalami kegagalan uji NDT karena ditemukan cacat undercut memanjang di tepi rigi-rigi las dan cacat slag inclusion di antara lapisan las pertama dan kedua. Lakukan investigasi teknis dan susun prosedur perbaikannya!",
    "expectedPoints": [
      "Investigasi undercut: arus listrik (Ampere) terlalu tinggi, ayunan elektroda terlalu cepat di bagian tepi dinding kampuh, atau sudut elektroda tidak seimbang.",
      "Investigasi slag inclusion: pembersihan terak/slag pada lintasan akar (root pass) tidak tuntas menggunakan palu terak dan sikat kawat baja sebelum melapiskan fill pass, atau ayunan elektroda terlalu sempit sehingga terak terjebak di ceruk kampuh.",
      "Prosedur perbaikan: gerinda/gouging seluruh bagian las yang cacat hingga mencapai logam sehat bebas retak, periksa dengan Dye Penetrant, bersihkan alur sambungan, setel ulang kuat arus yang proporsional, dan lakukan pengelasan ulang dengan pembersihan terak menyeluruh tiap layer."
    ]
  },
  {
    "id": 4,
    "question": "Rancanglah urutan rencana pengerjaan proses pemesinan (process routing plan) untuk membuat poros bertingkat presisi yang memiliki alur pasak, ulir metris luar M20 x 2,5, lubang senter di kedua ujung, dan lubang oli tembus transversal di salah satu tingkat poros! Berikan justifikasi teknis urutannya!",
    "expectedPoints": [
      "1. Pemotongan bahan baku dengan kelonggaran panjang dan diameter.",
      "2. Pembubutan muka (facing) kedua ujung dan pembuatan lubang senter bor (center drill) di kedua sisi.",
      "3. Pembubutan silindris kasar (rough turning) bertingkat di antara dua senter dengan menyisakan toleransi finishing 0,3-0,5 mm.",
      "4. Pembubutan halus (finish turning) bertingkat hingga mencapai dimensi toleransi presisi.",
      "5. Pembubutan alur pembebas ulir (undercut/thread relief) dan pembuatan ulir M20 x 2,5 pada mesin bubut.",
      "6. Pengeboran lubang oli transversal pada mesin bor atau frais menggunakan V-block fixture sebelum pasak dibuat.",
      "7. Pengefraisan alur pasak menggunakan mesin frais vertikal dengan clamping terproteksi.",
      "Justifikasi teknis: operasi pembubutan harus selesai sebelum frais alur pasak dan lubang oli dibuat guna mencegah interrupted cut yang dapat mematahkan pahat bubut dan menimbulkan getaran."
    ]
  },
  {
    "id": 5,
    "question": "Di bengkel manufaktur SMK, seorang siswa mengalami cedera tangan akibat tergulung benda kerja yang berputar saat membersihkan beram menggunakan kain majun (lap) sambil mesin menyala. Lakukan analisis akar masalah (5-Why), identifikasi pelanggaran K3, dan buat rekomendasi pengendalian hierarkis!",
    "expectedPoints": [
      "Analisis 5-Why: Mengapa tangan tergulung? Kain lap tersangkut benda kerja berputar. Mengapa pakai kain lap? Ingin membersihkan beram dengan cepat. Mengapa mesin menyala saat dibersihkan? Tidak menghentikan spindel. Mengapa tidak mematikan mesin? Meremehkan bahaya & terburu-buru. Mengapa tidak menggunakan kuas/kait pembersih? Kurangnya pengawasan dan kepatuhan disiplin SOP K3.",
      "Pelanggaran SOP: DILARANG KERAS menggunakan kain lap/sarung tangan rajut di dekat benda berputar, DILARANG membersihkan beram saat spindel berputar, dan wajib menggunakan kuas/hook beram bertangkai.",
      "Rekomendasi hierarki pengendalian: Rekayasa Teknik (pasang interlock chuck guard dan rem kaki darurat foot brake); Administratif (briefing K3 harian, SOP tertulis di tiap mesin, sertifikasi izin operasional mesin bagi siswa); APD (kacamata safety, pakaian kerja pas badan tanpa lengan longgar, larangan memakai sarung tangan)."
    ]
  }
]
  }
};

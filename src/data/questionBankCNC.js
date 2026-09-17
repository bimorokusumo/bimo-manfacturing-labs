export const cncQuestions = {
  title: "Mesin CNC - Pre-Test C1",
  mcqs: [
    {
      id: 1,
      question: "Kepanjangan dari singkatan CNC adalah...",
      options: [
        { id: 'A', text: "Computer Numerical Control" },
        { id: 'B', text: "Center Number Calculation" },
        { id: 'C', text: "Control Network Computer" },
        { id: 'D', text: "Centralized Node Control" }
      ],
      correctAnswer: 'A',
      explanation: "CNC singkatan dari Computer Numerical Control, yang berarti mesin dikendalikan oleh instruksi numerik berbasis komputer."
    },
    {
      id: 2,
      question: "Kode perintah (G-Code) yang digunakan untuk memutar spindel (pisau/benda kerja) searah jarum jam adalah...",
      options: [
        { id: 'A', text: "M03" },
        { id: 'B', text: "M05" },
        { id: 'C', text: "G00" },
        { id: 'D', text: "G01" }
      ],
      correctAnswer: 'A',
      explanation: "Kode M03 berfungsi untuk menyalakan putaran spindel searah putaran jarum jam (Clockwise/CW)."
    },
    {
      id: 3,
      question: "Apa fungsi dari perintah G00 pada mesin CNC?",
      options: [
        { id: 'A', text: "Melakukan penyayatan lurus secara perlahan" },
        { id: 'B', text: "Gerak cepat tanpa menyayat (Rapid Traverse)" },
        { id: 'C', text: "Mematikan aliran cairan pendingin (coolant)" },
        { id: 'D', text: "Mengganti pisau potong (Tool Change)" }
      ],
      correctAnswer: 'B',
      explanation: "G00 digunakan untuk memposisikan alat potong secara cepat ke titik tujuan tanpa melakukan pemotongan material."
    },
    {
      id: 4,
      question: "Tombol yang ditekan dalam keadaan darurat untuk menghentikan seluruh mesin secara seketika disebut...",
      options: [
        { id: 'A', text: "Cycle Start" },
        { id: 'B', text: "Feed Hold" },
        { id: 'C', text: "Emergency Stop (E-Stop)" },
        { id: 'D', text: "Power On" }
      ],
      correctAnswer: 'C',
      explanation: "Emergency Stop adalah tombol keselamatan (biasanya berwarna merah besar) untuk memutus tenaga mekanis mesin saat kondisi bahaya."
    },
    {
      id: 5,
      question: "Dalam pemrograman CNC Milling 3 Sumbu (3-Axis), arah pergerakan vertikal (naik/turunnya spindel) dilambangkan dengan sumbu...",
      options: [
        { id: 'A', text: "Sumbu X" },
        { id: 'B', text: "Sumbu Y" },
        { id: 'C', text: "Sumbu Z" },
        { id: 'D', text: "Sumbu A" }
      ],
      correctAnswer: 'C',
      explanation: "Sumbu Z merepresentasikan gerakan naik-turun alat potong/spindel terhadap benda kerja."
    },
    {
      id: 6,
      question: "Perintah G-Code untuk melakukan gerakan lurus menyayat benda kerja dengan kecepatan asupan (feed rate) yang terukur adalah...",
      options: [
        { id: 'A', text: "G00" },
        { id: 'B', text: "G01" },
        { id: 'C', text: "G02" },
        { id: 'D', text: "G03" }
      ],
      correctAnswer: 'B',
      explanation: "G01 digunakan untuk pemakanan/interpolasi lurus (Linear Interpolation) dengan gerak yang dikendalikan oleh kode 'F' (Feed)."
    },
    {
      id: 7,
      question: "Perintah G02 dan G03 digunakan untuk pergerakan interpolasi berbentuk...",
      options: [
        { id: 'A', text: "Lurus sejajar" },
        { id: 'B', text: "Diagonal 45 derajat" },
        { id: 'C', text: "Melingkar/Radius (Circular Interpolation)" },
        { id: 'D', text: "Putaran spindel" }
      ],
      correctAnswer: 'C',
      explanation: "G02 (melingkar searah jarum jam) dan G03 (berlawanan arah jarum jam) memotong sudut atau radius melingkar."
    },
    {
      id: 8,
      question: "Kode 'F' (Feedrate) dalam suatu baris program contohnya 'G01 X10 Y20 F150', nilai 150 menunjukkan...",
      options: [
        { id: 'A', text: "Panjang total pemotongan 150 mm" },
        { id: 'B', text: "Kecepatan putar spindel 150 RPM" },
        { id: 'C', text: "Kecepatan pemakanan/dorong pahat (biasanya dalam mm/menit)" },
        { id: 'D', text: "Alat potong nomor 150" }
      ],
      correctAnswer: 'C',
      explanation: "F150 berarti sumbu akan digerakkan dengan kecepatan 150 milimeter per menit."
    },
    {
      id: 9,
      question: "Kode 'S' (Spindle Speed) mengatur putaran poros utama dalam satuan...",
      options: [
        { id: 'A', text: "mm/menit (Feed)" },
        { id: 'B', text: "RPM (Rotations per Minute)" },
        { id: 'C', text: "Liter/detik" },
        { id: 'D', text: "Derajat" }
      ],
      correctAnswer: 'B',
      explanation: "Misalnya M03 S2000 berarti putar spindel searah jarum jam (M03) dengan kelajuan 2000 RPM (S2000)."
    },
    {
      id: 10,
      question: "Jika pahat atau alat potong patah di tengah jalannya program (mesin beroperasi), langkah operator yang paling tepat adalah menekan...",
      options: [
        { id: 'A', text: "Tombol Reset / Feed Hold / E-Stop agar pergerakan berhenti, matikan spindel" },
        { id: 'B', text: "Tombol Power Off utama gedung" },
        { id: 'C', text: "Membuka pintu mesin dan mengambilnya saat masih bergerak" },
        { id: 'D', text: "Memanggil teman" }
      ],
      correctAnswer: 'A',
      explanation: "Penanganan pertama adalah segera menghentikan gerakan motor (Feed Hold / E-Stop) untuk menghindari kerusakan tabrakan lanjutan pada cekam/ragum."
    },
    {
      id: 11,
      question: "Perangkat lunak (Software) yang digunakan untuk mendesain gambar komponen dan menerjemahkannya otomatis menjadi kode bahasa mesin (G-Code) disebut sistem...",
      options: [
        { id: 'A', text: "Windows & Office" },
        { id: 'B', text: "CAD / CAM (Computer Aided Design / Manufacturing)" },
        { id: 'C', text: "Antivirus" },
        { id: 'D', text: "PLC (Programmable Logic Controller)" }
      ],
      correctAnswer: 'B',
      explanation: "Software CAD (seperti AutoCAD, SolidWorks) dipakai untuk menggambar, lalu modul CAM (Mastercam, Fusion360) bertugas menghitung dan men-generate G-Code untuk CNC."
    },
    {
      id: 12,
      question: "Kode persiapan (G-code) untuk membatalkan semua nilai kompensasi radius pisau (Cutter Compensation Cancel) adalah...",
      options: [
        { id: 'A', text: "G40" },
        { id: 'B', text: "G41" },
        { id: 'C', text: "G42" },
        { id: 'D', text: "G54" }
      ],
      correctAnswer: 'A',
      explanation: "G40 dipakai untuk membatalkan G41(Kompensasi kiri) atau G42(Kompensasi kanan)."
    },
    {
      id: 13,
      question: "Kode M06 berfungsi untuk...",
      options: [
        { id: 'A', text: "Menyalakan cairan coolant" },
        { id: 'B', text: "Menukar pahat (Auto Tool Change)" },
        { id: 'C', text: "Mengebor secara terputus (Peck Drill)" },
        { id: 'D', text: "Mematikan program selamanya" }
      ],
      correctAnswer: 'B',
      explanation: "M06 (Tool Change) memerintahkan mesin CNC Milling (atau Lathe berturret) untuk memasang pisau baru, contoh pemanggilan: T02 M06."
    },
    {
      id: 14,
      question: "Sistem koordinat absolut dalam penulisan program G-Code disimbolkan oleh kode...",
      options: [
        { id: 'A', text: "G90" },
        { id: 'B', text: "G91" },
        { id: 'C', text: "G54" },
        { id: 'D', text: "G92" }
      ],
      correctAnswer: 'A',
      explanation: "G90 mengatur mesin agar semua ukuran gerakan X, Y, Z membaca dari titik nol statis. G91 digunakan untuk sistem Incremental (membaca posisi relatif lintasan terakhir)."
    },
    {
      id: 15,
      question: "Pengaturan Titik Nol Benda Kerja (Workpiece Zero / Work Offset) yang paling standar pada program CNC menggunakan alamat koordinat registrasi bernomor...",
      options: [
        { id: 'A', text: "G00 sampai G03" },
        { id: 'B', text: "G54 sampai G59" },
        { id: 'C', text: "M00 sampai M09" },
        { id: 'D', text: "G17, G18, G19" }
      ],
      correctAnswer: 'B',
      explanation: "G54 adalah register standar yang umum dipakai untuk menyimpan posisi X=0 Y=0 Z=0 dari material mentah (benda kerja) yang sudah diukur oleh operator di atas meja/ragum."
    },
    {
      id: 16,
      question: "Fitur 'Dry Run' (Jalan Kering) dan 'Single Block' pada panel kontrol CNC sangat penting digunakan pada saat...",
      options: [
        { id: 'A', text: "Produksi masal (ribuan benda siap potong)" },
        { id: 'B', text: "Menjalankan (men-tes) program yang baru pertama kali dibuat dan belum teruji (Proving out a program)" },
        { id: 'C', text: "Mengganti jenis baut" },
        { id: 'D', text: "Memanaskan spindel mesin" }
      ],
      correctAnswer: 'B',
      explanation: "Sangat berbahaya menjalankan program baru, Single Block menjalankan kode baris-demi-baris secara aman sehingga tabrakan bisa diamati dan dicegah sebelum mengenai chuck."
    },
    {
      id: 17,
      question: "Sebuah program CNC akan berakhir dan mesin otomatis me-reset bacaan ke awal, jika di ujung baris (footer) dicantumkan kode...",
      options: [
        { id: 'A', text: "G00" },
        { id: 'B', text: "M30" },
        { id: 'C', text: "M08" },
        { id: 'D', text: "G28" }
      ],
      correctAnswer: 'B',
      explanation: "M30 (End of Program & Rewind) akan memberhentikan spindel, coolant, lalu mereset kontroler agar siap ditekan 'Cycle Start' untuk benda kerja berikutnya."
    },
    {
      id: 18,
      question: "Kode siklus tetap (Canned Cycle) untuk mengebor lubang terputus-putus dengan tujuan membuang tatal pada lubang yang dalam adalah...",
      options: [
        { id: 'A', text: "G01" },
        { id: 'B', text: "G83 (Peck Drilling Cycle)" },
        { id: 'C', text: "G21" },
        { id: 'D', text: "G80" }
      ],
      correctAnswer: 'B',
      explanation: "G83 membuat bor masuk-keluar secara ritmis ('mematuk') untuk mengangkat serpihan logam dari dasar lubang dalam agar bor tidak patah/macet."
    },
    {
      id: 19,
      question: "Mesin CNC Bubut (Lathe) pada dasarnya hanya menggunakan dua sumbu pergerakan linear, yaitu sumbu...",
      options: [
        { id: 'A', text: "Y dan Z" },
        { id: 'B', text: "X dan Z" },
        { id: 'C', text: "A dan C" },
        { id: 'D', text: "X dan Y" }
      ],
      correctAnswer: 'B',
      explanation: "Mesin bubut dua aksis beroperasi dengan sumbu Z (gerak memanjang sejajar benda berputar) dan sumbu X (gerak menyilang/kedalaman potong/diameter)."
    },
    {
      id: 20,
      question: "Pada penulisan CNC Lathe standar (untuk bubut luar), nilai koordinat sumbu X umumnya melambangkan besaran...",
      options: [
        { id: 'A', text: "Diameter mutlak dari hasil benda kerja" },
        { id: 'B', text: "Panjang ulir" },
        { id: 'C', text: "Radius/jari-jari pahat" },
        { id: 'D', text: "Suhu potong" }
      ],
      correctAnswer: 'A',
      explanation: "Sebagian besar sistem kontrol bubut memprogram sumbu X sebagai diameter (bukan jari-jari). Jadi perintah memindah X menjadi X50.0 akan membentuk material dengan ketebalan 50mm."
    },
    {
      id: 21,
      question: "Fungsi G28 atau Home Position Return pada G-Code adalah...",
      options: [
        { id: 'A', text: "Membawa alat potong (Tool) mundur ke titik referensi nol mesin secara aman" },
        { id: 'B', text: "Membawa spindel mendekat menyentuh material" },
        { id: 'C', text: "Mengunci program" },
        { id: 'D', text: "Mengganti koordinat ke imperial (inchi)" }
      ],
      correctAnswer: 'A',
      explanation: "G28 digunakan untuk menggerakkan seluruh sumbu alat potong kembali ke tempat kalibrasi asli mesin (Machine Zero / Home)."
    },
    {
      id: 22,
      question: "Dalam penulisan format blok, nilai jarak pergerakan dapat ditulis sebagai mm dengan titik desimal. Bila ditulis X10. (memakai titik desimal), artinya...",
      options: [
        { id: 'A', text: "Error sintaks" },
        { id: 'B', text: "10 milimeter" },
        { id: 'C', text: "0,01 milimeter" },
        { id: 'D', text: "10 meter" }
      ],
      correctAnswer: 'B',
      explanation: "Format desimal (seperti '10.' atau '10.0') di mesin CNC modern memastikan kontroler membaca sebagai 10 milimeter bulat. Tanpa titik, mesin fanuc lama dapat membacanya sebagai 0.010 mm (format mikron)."
    },
    {
      id: 23,
      question: "Kecelakaan CNC parah (Crash) sering terjadi saat pergantian alat potong secara otomatis, biasanya disebabkan karena operator lupa melakukan...",
      options: [
        { id: 'A', text: "Mengganti coolant ke oli murni" },
        { id: 'B', text: "Set alat potong (Tool Length Offset/H-value) tiap-tiap pisau yang panjangnya berbeda secara teliti" },
        { id: 'C', text: "Menekan klakson" },
        { id: 'D', text: "Membuka pintu panel belakang" }
      ],
      correctAnswer: 'B',
      explanation: "Mesin 'buta' terhadap panjang sebenarnya fisik pisau. Jika operator lupa me-registrasi selisih panjang alat (Tool Height Offset, misal G43 H1), mesin akan menabrakkan pisau ke meja."
    },
    {
      id: 24,
      question: "Menyalakan cairan pendingin otomatis dengan pompa dapat diperintah dengan M-Code...",
      options: [
        { id: 'A', text: "M08" },
        { id: 'B', text: "M09" },
        { id: 'C', text: "M30" },
        { id: 'D', text: "M05" }
      ],
      correctAnswer: 'A',
      explanation: "M08 (Coolant On) akan menyemprotkan fluida pendingin/oli, dan akan dimatikan nanti dengan perintah M09 (Coolant Off)."
    },
    {
      id: 25,
      question: "Di dalam blok CNC, huruf 'N' (misal: N10, N20, N30...) berfungsi sebagai...",
      options: [
        { id: 'A', text: "Nomor alat (Tool number)" },
        { id: 'B', text: "Nomor putaran (Speed)" },
        { id: 'C', text: "Nomor identifikasi baris (Sequence/Block Number) untuk referensi urutan" },
        { id: 'D', text: "Nilai suhu kerja mesin" }
      ],
      correctAnswer: 'C',
      explanation: "N Number (Sequence Number) digunakan untuk memberi label tiap baris (atau baris-baris blok khusus pergantian alat) agar operator mudah meloncat membaca/memeriksa program."
    }
  ],
  essays: [
    {
      id: 'e1',
      question: "Jelaskan dengan bahasamu, tahapan besar dari bentuk desain sketsa hingga menjadi bentuk produk utuh di mesin CNC!"
    },
    {
      id: 'e2',
      question: "Uraikan fungsi kritis tombol 'Emergency Stop' dan juga 'Feed Hold' pada mesin. Apa perbedaan kondisi di mana keduanya seharusnya ditekan?"
    },
    {
      id: 'e3',
      question: "Sebutkan dan jelaskan perbedaan absolut koordinat sistem referensi nol absolut benda (Workpiece Zero) G54 dengan titik Nol Mesin (Machine Zero) G28!"
    },
    {
      id: 'e4',
      question: "Jika di dalam program terlihat kode seperti: 'N40 G01 Z-5.0 F100', analisa apa arti gerakan dari mesin pada blok ini secara mendetail!"
    },
    {
      id: 'e5',
      question: "Jelaskan mengapa operator dilarang keras mencoba program untuk pergerakan part/kode anyar langsung secara kontinyu dan diwajibkan menyalakan tombol 'Single Block' pada uji coba (Dry Run/Prove-out) awal!"
    }
  ]
};

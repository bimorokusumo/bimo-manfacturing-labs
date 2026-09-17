export const latheQuestions = {
  title: "Mesin Bubut (Lathe) - Pre-Test C1",
  mcqs: [
    {
      id: 1,
      question: "Fungsi utama dari mesin bubut adalah...",
      options: [
        { id: 'A', text: "Memotong kayu menjadi papan." },
        { id: 'B', text: "Menyayat benda kerja yang berputar untuk membentuk silinder." },
        { id: 'C', text: "Mencairkan logam." },
        { id: 'D', text: "Menyambung dua plat besi." }
      ],
      correctAnswer: 'B',
      explanation: "Mesin bubut bekerja dengan memutar benda kerja, lalu pahat disayatkan untuk membentuk objek silindris."
    },
    {
      id: 2,
      question: "Alat keselamatan kerja (K3) yang wajib digunakan saat mengoperasikan mesin bubut adalah...",
      options: [
        { id: 'A', text: "Kacamata safety (goggles)" },
        { id: 'B', text: "Topi baret" },
        { id: 'C', text: "Jas hujan" },
        { id: 'D', text: "Sandal jepit" }
      ],
      correctAnswer: 'A',
      explanation: "Kacamata safety wajib digunakan untuk melindungi mata dari percikan tatal (beram) yang panas dan tajam."
    },
    {
      id: 3,
      question: "Komponen mesin bubut yang berfungsi untuk menjepit benda kerja agar berputar bersama spindel adalah...",
      options: [
        { id: 'A', text: "Kepala lepas (Tailstock)" },
        { id: 'B', text: "Eretan (Carriage)" },
        { id: 'C', text: "Cekam (Chuck)" },
        { id: 'D', text: "Pahat (Tool)" }
      ],
      correctAnswer: 'C',
      explanation: "Cekam (Chuck) dipasang pada kepala tetap dan berfungsi menjepit benda kerja dengan kuat."
    },
    {
      id: 4,
      question: "Pahat bubut umumnya dibuat dari bahan yang keras. Salah satu bahan pahat yang sering digunakan di bengkel sekolah adalah...",
      options: [
        { id: 'A', text: "HSS (High Speed Steel)" },
        { id: 'B', text: "Aluminium" },
        { id: 'C', text: "Plastik ABS" },
        { id: 'D', text: "Tembaga murni" }
      ],
      correctAnswer: 'A',
      explanation: "HSS adalah baja kecepatan tinggi yang umum digunakan sebagai alat potong di bengkel pemesinan dasar."
    },
    {
      id: 5,
      question: "Arah putaran spindel mesin bubut saat melakukan pembubutan rata (pahat di depan) adalah...",
      options: [
        { id: 'A', text: "Berlawanan arah jarum jam (berputar ke arah pahat)" },
        { id: 'B', text: "Searah jarum jam (berputar menjauhi pahat)" },
        { id: 'C', text: "Maju mundur" },
        { id: 'D', text: "Berhenti" }
      ],
      correctAnswer: 'A',
      explanation: "Benda kerja berputar ke arah bawah (berlawanan jarum jam jika dilihat dari kanan) agar material menabrak ujung mata potong pahat."
    },
    {
      id: 6,
      question: "Proses pemotongan menyilang sumbu putar pada benda kerja untuk mendapatkan permukaan rata disebut...",
      options: [
        { id: 'A', text: "Facing (membubut muka)" },
        { id: 'B', text: "Turning (membubut rata)" },
        { id: 'C', text: "Grooving (membuat alur)" },
        { id: 'D', text: "Threading (mengulir)" }
      ],
      correctAnswer: 'A',
      explanation: "Facing digunakan untuk meratakan permukaan ujung benda kerja dan menentukan panjang awal yang akurat."
    },
    {
      id: 7,
      question: "Berapa sudut puncak mata bor bantu (center drill) yang umum digunakan untuk mengawali pengeboran di mesin bubut?",
      options: [
        { id: 'A', text: "30 derajat" },
        { id: 'B', text: "60 derajat" },
        { id: 'C', text: "90 derajat" },
        { id: 'D', text: "120 derajat" }
      ],
      correctAnswer: 'B',
      explanation: "Center drill umumnya memiliki sudut ujung 60 derajat untuk menyesuaikan dengan sudut ujung senter putar."
    },
    {
      id: 8,
      question: "Rumus dasar untuk menghitung kecepatan putaran mesin (n) dalam RPM adalah...",
      options: [
        { id: 'A', text: "n = (Vc x 1000) / (π x d)" },
        { id: 'B', text: "n = (π x d) / (Vc x 1000)" },
        { id: 'C', text: "n = (Vc x d) / (π x 1000)" },
        { id: 'D', text: "n = (1000 x π) / (Vc x d)" }
      ],
      correctAnswer: 'A',
      explanation: "Kecepatan putar (n) dihitung dari Kecepatan potong (Vc) dikali 1000 dibagi dengan (Pi x diameter benda kerja)."
    },
    {
      id: 9,
      question: "Senter yang dipasang pada kepala lepas dan ikut berputar bersama benda kerja disebut...",
      options: [
        { id: 'A', text: "Senter mati (Dead center)" },
        { id: 'B', text: "Senter putar (Live center)" },
        { id: 'C', text: "Senter bor (Center drill)" },
        { id: 'D', text: "Senter kepala tetap" }
      ],
      correctAnswer: 'B',
      explanation: "Senter putar memiliki bearing di dalamnya sehingga ujungnya dapat berputar menahan beban sambil mengikuti putaran material."
    },
    {
      id: 10,
      question: "Apa fungsi dari eretan lintang (cross slide)?",
      options: [
        { id: 'A', text: "Menggerakkan pahat sejajar dengan sumbu mesin" },
        { id: 'B', text: "Menggerakkan pahat tegak lurus terhadap sumbu mesin" },
        { id: 'C', text: "Mengatur putaran spindel" },
        { id: 'D', text: "Menahan benda kerja yang panjang" }
      ],
      correctAnswer: 'B',
      explanation: "Eretan lintang bergerak melintang (tegak lurus) terhadap sumbu putar untuk mengatur kedalaman pemakanan atau melakukan facing."
    },
    {
      id: 11,
      question: "Knurling atau mengartel pada mesin bubut bertujuan untuk...",
      options: [
        { id: 'A', text: "Memperhalus permukaan" },
        { id: 'B', text: "Membuat permukaan menjadi kasar (berpola) agar tidak licin saat dipegang" },
        { id: 'C', text: "Mengecilkan diameter benda kerja" },
        { id: 'D', text: "Membuat ulir" }
      ],
      correctAnswer: 'B',
      explanation: "Knurling menciptakan pola menyilang/lurus pada permukaan logam (misal gagang mikrometer) agar lebih mudah dan kuat saat digenggam tangan."
    },
    {
      id: 12,
      question: "Proses memperbesar lubang silindris yang sudah ada menggunakan pahat bubut dalam (boring bar) disebut...",
      options: [
        { id: 'A', text: "Drilling" },
        { id: 'B', text: "Reaming" },
        { id: 'C', text: "Boring" },
        { id: 'D', text: "Tapping" }
      ],
      correctAnswer: 'C',
      explanation: "Boring adalah operasi pembubutan di bagian dalam lubang (internal turning) untuk memperbesar diameternya dengan akurasi tinggi."
    },
    {
      id: 13,
      question: "Untuk mengatur posisi tinggi mata pahat agar tepat berada di sumbu tengah (center) benda kerja, digunakan referensi...",
      options: [
        { id: 'A', text: "Lantai bengkel" },
        { id: 'B', text: "Ujung senter pada kepala lepas" },
        { id: 'C', text: "Pegangan cekam" },
        { id: 'D', text: "Bagian bawah eretan" }
      ],
      correctAnswer: 'B',
      explanation: "Ujung senter di kepala lepas terletak tepat segaris dengan sumbu putar utama, sehingga dijadikan acuan penyetelan tinggi pahat."
    },
    {
      id: 14,
      question: "Pahat yang dipasang di bawah senter (center height) akan mengakibatkan...",
      options: [
        { id: 'A', text: "Hasil bubutan sangat mulus" },
        { id: 'B', text: "Pahat tidak bisa memotong ke pusat saat facing (meninggalkan sisa di tengah)" },
        { id: 'C', text: "Mesin akan otomatis berhenti" },
        { id: 'D', text: "Benda kerja mengembang" }
      ],
      correctAnswer: 'B',
      explanation: "Pahat yang kurang tinggi (di bawah sumbu senter) akan menyisakan tonjolan kecil di tengah saat membubut muka (facing)."
    },
    {
      id: 15,
      question: "Jenis pahat bubut yang digunakan untuk memotong (memutuskan) benda kerja adalah...",
      options: [
        { id: 'A', text: "Pahat rata kanan" },
        { id: 'B', text: "Pahat ulir" },
        { id: 'C', text: "Pahat potong (Parting tool)" },
        { id: 'D', text: "Pahat alur" }
      ],
      correctAnswer: 'C',
      explanation: "Pahat potong memiliki ujung yang panjang dan tipis untuk masuk memisahkan bagian dalam poros benda kerja."
    },
    {
      id: 16,
      question: "Rumus dasar untuk Ulir Metrik (misal M10x1.5) memiliki sudut puncak sebesar...",
      options: [
        { id: 'A', text: "55 derajat" },
        { id: 'B', text: "60 derajat" },
        { id: 'C', text: "45 derajat" },
        { id: 'D', text: "90 derajat" }
      ],
      correctAnswer: 'B',
      explanation: "Ulir standar ISO metrik memiliki sudut puncak profil segi tiga sebesar 60 derajat."
    },
    {
      id: 17,
      question: "Gerakan eretan atas (compound rest) saat membubut tirus dilakukan secara...",
      options: [
        { id: 'A', text: "Otomatis menggunakan tuas" },
        { id: 'B', text: "Manual dengan memutar handel eretan atas" },
        { id: 'C', text: "Otomatis dengan lead screw" },
        { id: 'D', text: "Digerakkan oleh tailstock" }
      ],
      correctAnswer: 'B',
      explanation: "Pemakanan pada eretan atas (saat telah diputar sudut tertentu untuk menirus) hanya bisa dilakukan secara manual karena tidak terhubung dengan roda gigi otomatis."
    },
    {
      id: 18,
      question: "Cekam rahang empat bebas (independent chuck) digunakan untuk...",
      options: [
        { id: 'A', text: "Menjepit benda kerja bundar secara cepat" },
        { id: 'B', text: "Menjepit benda kerja dengan bentuk tidak beraturan atau persegi panjang" },
        { id: 'C', text: "Menggantikan peran pahat" },
        { id: 'D', text: "Memegang mata bor" }
      ],
      correctAnswer: 'B',
      explanation: "Tiap rahang pada independent chuck bergerak sendiri-sendiri, sehingga bisa menjepit benda kerja yang tidak silindris (misal balok kotak)."
    },
    {
      id: 19,
      question: "Untuk merawat meja mesin bubut (bed/ways) agar tidak berkarat dan tetap licin, kita harus...",
      options: [
        { id: 'A', text: "Mengecatnya dengan warna tebal" },
        { id: 'B', text: "Mengoleskan oli pelumas setelah mesin dibersihkan" },
        { id: 'C', text: "Menyiramnya dengan air sabun" },
        { id: 'D', text: "Memukulnya dengan palu besi" }
      ],
      correctAnswer: 'B',
      explanation: "Meja (bed) adalah jalur presisi, sehingga setelah tatal dibersihkan wajib diolesi oli khusus pelumas lintasan (way oil) untuk mencegah karat."
    },
    {
      id: 20,
      question: "Cairan coolant atau pendingin saat membubut berfungsi untuk...",
      options: [
        { id: 'A', text: "Membersihkan karat pada besi" },
        { id: 'B', text: "Mencegah pahat dan material menjadi terlalu panas serta membersihkan tatal" },
        { id: 'C', text: "Memberi warna pada logam" },
        { id: 'D', text: "Meningkatkan putaran spindel" }
      ],
      correctAnswer: 'B',
      explanation: "Suhu yang sangat tinggi saat pemesinan dapat merusak ketajaman pahat dan sifat mekanis benda kerja, sehingga wajib didinginkan."
    },
    {
      id: 21,
      question: "Poros berulir panjang yang terletak di bagian depan mesin bubut dan berputar saat proses pembuatan ulir otomatis disebut...",
      options: [
        { id: 'A', text: "Poros transporter (Lead screw)" },
        { id: 'B', text: "Poros spindel" },
        { id: 'C', text: "Eretan lintang" },
        { id: 'D', text: "Chuck" }
      ],
      correctAnswer: 'A',
      explanation: "Lead screw atau ulir transporter terhubung dari kotak gigi ke carriage/eretan untuk menarik eretan secara otomatis mengikuti kisar ulir."
    },
    {
      id: 22,
      question: "Alat untuk mengukur diameter luar benda kerja dengan tingkat ketelitian tinggi (0,01 mm) di mesin bubut adalah...",
      options: [
        { id: 'A', text: "Penggaris mistar baja" },
        { id: 'B', text: "Jangka sorong biasa (Vernier Caliper)" },
        { id: 'C', text: "Mikrometer luar (Outside Micrometer)" },
        { id: 'D', text: "Busur derajat" }
      ],
      correctAnswer: 'C',
      explanation: "Mikrometer memberikan pengukuran presisi hingga seperseratus milimeter, sangat cocok untuk inspeksi toleransi suaian poros."
    },
    {
      id: 23,
      question: "Menyisakan benda kerja terlalu panjang mencuat keluar dari cekam tanpa disokong oleh senter dapat menyebabkan...",
      options: [
        { id: 'A', text: "Proses pemotongan lebih cepat" },
        { id: 'B', text: "Defleksi, benda melentur, bengkok, dan bergetar hebat saat disayat" },
        { id: 'C', text: "Benda kerja menjadi lebih mengkilap" },
        { id: 'D', text: "Pahat tidak mudah tumpul" }
      ],
      correctAnswer: 'B',
      explanation: "Material yang mencuat panjang tanpa dukungan ujung (senter lepas) akan melentur karena tekanan pahat, berbahaya dan hasil permukaannya kasar."
    },
    {
      id: 24,
      question: "Berapa jarak atau posisi ujung pahat terhadap benda kerja saat melakukan Setting Nol (Zero Point) secara manual?",
      options: [
        { id: 'A', text: "Terpisah 5 cm dari benda kerja" },
        { id: 'B', text: "Menempel tipis hingga menimbulkan sedikit goresan halus di permukaan benda kerja" },
        { id: 'C', text: "Langsung menekan keras ke benda kerja" },
        { id: 'D', text: "Berada di atas benda kerja" }
      ],
      correctAnswer: 'B',
      explanation: "Menyentuhkan ujung pahat tipis-tipis ke benda kerja sambil berputar lambat berguna mencari posisi Z=0 atau X=0 sebelum mengatur angka skala."
    },
    {
      id: 25,
      question: "Jika operator membubut diameter dari ukuran 50 mm menjadi 46 mm dalam 1 kali lintasan potong rata, berapakah kedalaman potong (depth of cut) pahat?",
      options: [
        { id: 'A', text: "4 mm" },
        { id: 'B', text: "8 mm" },
        { id: 'C', text: "2 mm" },
        { id: 'D', text: "1 mm" }
      ],
      correctAnswer: 'C',
      explanation: "Karena pemakanan terjadi di sepanjang keliling, memotong tebal 2 mm di radius akan mengurangi diameter keseluruhan sebesar 2x2 = 4 mm."
    }
  ],
  essays: [
    {
      id: 'e1',
      question: "Sebutkan 3 bagian utama pada mesin bubut beserta masing-masing fungsinya secara singkat!"
    },
    {
      id: 'e2',
      question: "Jelaskan langkah-langkah dalam memasang pahat bubut agar ketinggian ujung potongnya sejajar (center) dengan sumbu mesin!"
    },
    {
      id: 'e3',
      question: "Mengapa K3 melarang keras penggunaan sarung tangan kain, perhiasan cincin, dan pakaian longgar saat mengoperasikan mesin bubut?"
    },
    {
      id: 'e4',
      question: "Apa yang dimaksud dengan pembubutan tirus (taper turning)? Sebutkan satu metode/cara melakukan pembubutan tirus pada mesin bubut manual!"
    },
    {
      id: 'e5',
      question: "Jelaskan bahaya yang bisa timbul apabila benda kerja panjang dijepit pada cekam namun tidak ditopang oleh kepala lepas (tailstock) di ujungnya!"
    }
  ]
};

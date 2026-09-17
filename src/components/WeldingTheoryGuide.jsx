import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';

const WeldingTheoryGuide = () => {
  const [activeTab, setActiveTab] = useState('alat'); // Open on 'alat' so user can see electrode codes immediately
  const [selectedProcess, setSelectedProcess] = useState('SMAW'); // 'SMAW', 'MIG', 'TIG', 'OAW', 'FCAW'
  const [selectedDiagramPart, setSelectedDiagramPart] = useState(null);
  
  // AWS CODE DECODER STATES
  const [selectedAwsCode, setSelectedAwsCode] = useState('E6013'); // 'E6013', 'E7018', 'E7016', 'E6010'
  const [selectedAwsPart, setSelectedAwsPart] = useState('tensile'); // 'prefix', 'tensile', 'position', 'flux'

  // POPULAR TRADE BRANDS STATES (LB, RD, RB)
  const [selectedTradeBrand, setSelectedTradeBrand] = useState('RD260'); // 'RD260', 'LB52', 'RB26'

  // SIMULATOR STATES (Sub-Modul 3)
  const [simMode, setSimMode] = useState('sudut'); // 'sudut', 'jarak', 'ayunan'
  const [travelAngle, setTravelAngle] = useState(75); // 50 to 90 degrees (ideal 70-80)
  const [workJointType, setWorkJointType] = useState('butt'); // 'butt' (90 deg) or 'fillet' (45 deg)
  const [arcLength, setArcLength] = useState(2.5); // 0.5 to 8.0 mm (ideal 2-3 mm)
  const [weavePattern, setWeavePattern] = useState('zigzag'); // 'stringer', 'zigzag', 'triangle', 'crescent', 'circular'
  const [isAnimatingWeave, setIsAnimatingWeave] = useState(true);
  const [animProgress, setAnimProgress] = useState(0);

  // Animated loop for weaving pattern
  useEffect(() => {
    let timer;
    if (isAnimatingWeave && activeTab === 'teknik' && simMode === 'ayunan') {
      timer = setInterval(() => {
        setAnimProgress(prev => (prev + 1) % 100);
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isAnimatingWeave, activeTab, simMode]);

  const tabs = [
    { id: 'jenis', label: '1. Jenis-Jenis Pengelasan', icon: '⚡' },
    { id: 'alat', label: '2. Kode Elektroda & Peralatan Bengkel Las', icon: '🧰' },
    { id: 'teknik', label: '3. Simulasi Praktik & Teknik Dasar', icon: '🔥' }
  ];

  // PROCESS DATA
  const PROCESS_DATA = {
    SMAW: {
      id: 'SMAW',
      title: 'SMAW (Shielded Metal Arc Welding)',
      alias: 'Las Busur Listrik Manual / Las Elektroda Terbungkus (Stick Welding)',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      borderColor: '#d97706',
      temp: '3.000°C – 3.500°C',
      shielding: 'Fluks padat membungkus kawat yang menguap menghasilkan gas CO2 & kerak terak pelindung.',
      filler: 'Kawat las batangan (elektroda konsumabel bersalut fluks).',
      polarity: 'DCEP (penetrasi dalam), DCEN (plat tipis), atau AC.',
      description: 'Metode pengelasan paling populer di dunia industri, perbengkelan, dan konstruksi lapangan. Busur listrik terbentuk antara ujung kawat las terbungkus fluks dengan logam induk.',
      advantages: [
        'Peralatan murah, sangat portabel, mudah dibawa ke puncak gedung atau lapangan terbuka.',
        'Tidak memerlukan tabung gas pelindung eksternal (tahan hembusan angin luar ruangan).',
        'Mampu mengelas berbagai jenis baja karbon, baja paduan, dan besi cor dengan mengganti jenis elektroda.'
      ],
      limitations: [
        'Produktivitas rendah karena juru las harus sering berhenti mengganti elektroda yang habis.',
        'Menghasilkan lapisan terak (slag) tebal yang wajib dibersihkan di setiap lintasan las (pass).',
        'Tingkat percikan percikan las (spatter) cukup tinggi bila arus tidak tepat.'
      ],
      applications: 'Konstruksi jembatan, perpipaan minyak & gas, galangan kapal, bengkel fabrikasi umum.'
    },
    MIG: {
      id: 'MIG',
      title: 'GMAW / MIG & MAG (Gas Metal Arc Welding)',
      alias: 'Las Kawat Gulung Semi-Otomatis (CO2 / Argon Welding)',
      color: '#2563eb',
      bgColor: '#dbeafe',
      borderColor: '#1d4ed8',
      temp: '3.200°C – 4.000°C',
      shielding: 'Gas Mulia Murni (Argon/Helium untuk MIG) atau Gas Aktif (CO2 / Ar+CO2 untuk MAG).',
      filler: 'Kawat las gulungan kontinu (wire spool) diumpankan otomatis oleh motor feeder.',
      polarity: 'DCEP (Direct Current Electrode Positive) untuk busur stabil dan penetrasi merata.',
      description: 'Pengelasan berkecepatan tinggi di mana kawat las diumpankan tanpa henti melalui gun/torch las dengan perlindungan selubung gas eksternal dari tabung bertekanan.',
      advantages: [
        'Efisiensi dan kecepatan deposisi sangat tinggi (tidak perlu berhenti mengganti elektroda batangan).',
        'Minim terak sehingga tidak memakan waktu pembersihan terak yang melelahkan.',
        'Hasil lasan sangat bersih dan mudah dipelajari oleh operator pemula.'
      ],
      limitations: [
        'Sangat rentan terhadap hembusan angin (bila gas tertiup, langsung timbul cacat porositas).',
        'Peralatan lebih mahal dan kompleks (unit feeder, selang gas, regulator pemanas CO2).',
        'Kurang fleksibel untuk mobilitas tinggi di medan berat.'
      ],
      applications: 'Industri karoseri otomotif, fabrikasi tangki, manufaktur baja ringan, perakitan massal pabrik.'
    },
    TIG: {
      id: 'TIG',
      title: 'GTAW / TIG (Gas Tungsten Arc Welding)',
      alias: 'Las Argon / Las Elektroda Wolfram Tak Terumpan',
      color: '#10b981',
      bgColor: '#d1fae5',
      borderColor: '#059669',
      temp: '3.500°C – 4.500°C',
      shielding: 'Gas Argon murni (Ultra High Purity 99.99%) atau Helium.',
      filler: 'Kawat las batangan tanpa fluks (filler rod) diumpankan manual dengan tangan kiri.',
      polarity: 'DCEN (untuk baja/stainless steel) atau AC (untuk aluminium & magnesium).',
      description: 'Proses pengelasan berkualitas paling presisi dan bersih. Busur listrik menyala dari elektroda wolfram murni (non-consumable) yang tidak ikut meleleh.',
      advantages: [
        'Kualitas sambungan dan kekuatan mekanis tertinggi, tanpa terak dan bebas percikan spatter.',
        'Mampu menyambung logam-logam khusus: Stainless Steel, Titanium, Aluminium, Paduan Nikel.',
        'Kontrol panas sangat presisi, ideal untuk plat sangat tipis (< 1 mm) hingga pipa boiler bertekanan tinggi.'
      ],
      limitations: [
        'Kecepatan pengelasan paling lambat dan biaya operasional gas argon tinggi.',
        'Membutuhkan keterampilan dan koordinasi dua tangan yang sangat tinggi dari juru las.',
        'Sensitif terhadap kotoran, minyak, dan oksigen di udara.'
      ],
      applications: 'Pipa uap PLTU bertekanan tinggi, industri kedirgantaraan pesawat, tangki farmasi & makanan, knalpot balap.'
    },
    OAW: {
      id: 'OAW',
      title: 'OAW (Oxy-Acetylene Welding)',
      alias: 'Las Gas Karbit / Las Asetilen-Oksigen',
      color: '#ef4444',
      bgColor: '#fee2e2',
      borderColor: '#b91c1c',
      temp: '3.100°C – 3.300°C',
      shielding: 'Gas CO2 dan H2O hasil pembakaran kimia api asetilen menyelimuti kawah las.',
      filler: 'Kawat las pakan polos (bila diperlukan) atau tanpa logam pengisi (autogenous).',
      polarity: 'Tanpa Arus Listrik (Menggunakan Energi Reaksi Kimia Termal Pembakaran Gas).',
      description: 'Pengelasan menggunakan energi panas hasil reaksi pembakaran gas Asetilen (C2H2) dengan gas Oksigen murni (O2) melalui blender pembakar (blowpipe).',
      advantages: [
        'Mandiri tanpa memerlukan instalasi listrik PLN maupun mesin generator.',
        'Sangat multifungsi: selain untuk mengelas, juga dapat memotong plat tebal (blender potong) dan memanaskan benda (brazing/preheating).',
        'Pemanasan dan pendinginan relatif lambat sehingga mengurangi tegangan sisa.'
      ],
      limitations: [
        'Suhu nyala api lebih rendah dibanding busur listrik, menyebabkan area terpengaruh panas (HAZ) sangat lebar.',
        'Resiko bahaya ledakan tabung gas asetilen dan arus balik api (flashback).',
        'Laju pembekuan lambat, kurang efisien untuk plat-plat tebal konstruksi berat.'
      ],
      applications: 'Bengkel las knalpot motor, perbaikan body mobil, pengelasan pipa refrigerasi AC (brazing tembaga), pemotongan plat baja kapal.'
    },
    FCAW: {
      id: 'FCAW',
      title: 'FCAW (Flux Cored Arc Welding)',
      alias: 'Las Busur Listrik Kawat Berinti Fluks',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      borderColor: '#6d28d9',
      temp: '3.500°C – 4.200°C',
      shielding: 'Fluks di dalam inti kawat tubular + Gas Pelindung Eksternal CO2 (atau Gasless).',
      filler: 'Kawat las berlubang pipa berisi serbuk fluks dan deoksidan.',
      polarity: 'DCEP (Gas-Shielded) atau DCEN (Self-Shielded).',
      description: 'Penggabungan keunggulan produktivitas tinggi GMAW dengan ketahanan fluks SMAW. Kawat las berbentuk pipa mini yang di dalamnya terisi padat serbuk fluks kimia.',
      advantages: [
        'Laju penimbunan logam las (deposition rate) tercepat di antara semua pengelasan manual/semi-otomatis.',
        'Penetrasi lasan sangat dalam dan kuat, mampu mengelas plat sangat tebal dalam sedikit lintasan.',
        'Tipe Self-Shielded (FCAW-S) tahan hembusan angin lapangan tanpa butuh tabung gas.'
      ],
      limitations: [
        'Menghasilkan asap las dan gas buang pekat dalam jumlah besar (butuh blower ventilasi khusus).',
        'Menghasilkan lapisan terak tipis yang harus dibersihkan sebelum lintasan berikutnya.',
        'Harga kawat las tubular relatif lebih mahal.'
      ],
      applications: 'Pengeboran minyak lepas pantai (offshore rig), struktur jembatan baja bentang panjang, konstruksi alat berat tambang.'
    }
  };

  // AWS CODES DATABASE
  const AWS_CODES = {
    E6013: {
      code: 'E6013',
      name: 'AWS A5.1 E6013 (Rutile Serbaguna)',
      tensileValue: '60',
      tensileDesc: '60.000 psi (± 420 - 460 MPa)',
      posValue: '1',
      posDesc: '1 = Semua Posisi (Datar, Horizontal, Vertikal, Overhead)',
      fluxValue: '3',
      fluxDesc: '3 = Kalium Titania Tinggi (Rutile), Arus AC, DCEN, atau DCEP',
      fullExplanation: 'Kawat las serbaguna paling populer di bengkel-bengkel umum. Memiliki penetrasi sedang, busur lembut yang mudah dinyalakan kembali, spatter sedikit, dan terak mengelupas sendiri saat dingin.',
      popularEquiv: 'Setara dengan merk dagang: RD-260 (Nikko Steel) dan RB-26 (Kobelco).'
    },
    E7018: {
      code: 'E7018',
      name: 'AWS A5.1 E7018 (Low-Hydrogen Iron Powder)',
      tensileValue: '70',
      tensileDesc: '70.000 psi (± 490 - 520 MPa)',
      posValue: '1',
      posDesc: '1 = Semua Posisi',
      fluxValue: '8',
      fluxDesc: '8 = Serbuk Besi & Hidrogen Rendah, Arus AC atau DCEP',
      fullExplanation: 'Elektroda berkekuatan tarik tinggi dan tahan retak dingin. Wajib di-oven pada suhu 250°C - 350°C sebelum digunakan agar kadar hidrogen bebas tetap rendah.',
      popularEquiv: 'Banyak digunakan untuk struktur gedung bertingkat tahan gempa, jembatan, dan bejana tekan.'
    },
    E7016: {
      code: 'E7016',
      name: 'AWS A5.1 E7016 (Low-Hydrogen Potassium)',
      tensileValue: '70',
      tensileDesc: '70.000 psi (± 490 - 520 MPa)',
      posValue: '1',
      posDesc: '1 = Semua Posisi',
      fluxValue: '6',
      fluxDesc: '6 = Kalium Hidrogen Rendah, Arus AC atau DCEP',
      fullExplanation: 'Elektroda hidrogen rendah dengan penetrasi yang sangat terarah dan stabil pada busur pendek. Wajib di-oven pada 300°C - 350°C.',
      popularEquiv: 'Setara dengan merk dagang legendaris: LB-52 dan LB-52U (Kobelco) untuk pengelasan pipa migas.'
    },
    E6010: {
      code: 'E6010',
      name: 'AWS A5.1 E6010 (High Cellulose Sodium)',
      tensileValue: '60',
      tensileDesc: '60.000 psi (± 420 MPa)',
      posValue: '1',
      posDesc: '1 = Semua Posisi (Khusus Vertikal Turun / Downhill Cepat)',
      fluxValue: '0',
      fluxDesc: '0 = Selulosa Natrium Murni, Wajib Arus DCEP',
      fullExplanation: 'Elektroda dengan penetrasi paling dalam dan semburan busur keras. Tidak boleh di-oven terlalu panas karena fluks selulosa butuh kelembaban alami 3-7%.',
      popularEquiv: 'Standar utama pengelasan akar (root pass) pipa transmisi minyak dan gas jalur darat.'
    }
  };

  // POPULAR TRADE BRANDS (LB, RD, RB)
  const TRADE_BRANDS = {
    RD260: {
      id: 'RD260',
      name: 'RD-260 (Nikko Steel)',
      brand: 'NIKKO STEEL (PT Interweld)',
      awsCode: 'AWS A5.1 E6013',
      jisCode: 'JIS Z3211 D4313',
      badge: 'NO.1 PALING POPULER DI BENGKEL INDONESIA',
      type: 'High Titania Oxide (Rutile Serbaguna Red-Label)',
      tensile: '60.000 psi (≈ 430 - 460 MPa)',
      characteristics: 'Busur sangat stabil dan tenang, percikan spatter sangat minim, asap sedikit, dan terak mengelupas sendiri secara otomatis saat dingin (self-peeling slag).',
      ovenRule: 'Tidak memerlukan oven pemanas khusus, cukup disimpan di tempat kering.',
      usage: 'Pilihan utama di ribuan bengkel las Indonesia untuk pembuatan pagar, teralis jendela, kanopi, bodi kendaraan, rangka baja ringan, dan sambungan plat tipis.'
    },
    LB52: {
      id: 'LB52',
      name: 'LB-52 / LB-52U (Kobelco)',
      brand: 'KOBELCO (Kobe Steel, Ltd.)',
      awsCode: 'AWS A5.1 E7016',
      jisCode: 'JIS Z3211 D5016',
      badge: 'STANDAR EMAS INDUSTRI PIPA MIGAS',
      type: 'Low-Hydrogen Potassium (Hidrogen Rendah)',
      tensile: '70.000 psi (≈ 490 - 520 MPa)',
      characteristics: 'Penetrasi dalam dan terarah. Varian LB-52U (U = Uragumi/Backing bead) dibuat khusus untuk penembusan akar pipa satu sisi (one-side root pass) tanpa backing plate, menghasilkan rigi bagian dalam mulus bebas cacat.',
      ovenRule: 'Wajib di-oven pada suhu 300°C – 350°C selama 30-60 menit sebelum dipakai agar bebas retak hidrogen.',
      usage: 'Standar industri minyak & gas bumi, perpipaan bertekanan tinggi, tangki kilang, bejana tekan (pressure vessel), dan struktur konstruksi baja berat.'
    },
    RB26: {
      id: 'RB26',
      name: 'RB-26 (Kobelco)',
      brand: 'KOBELCO (Kobe Steel, Ltd.)',
      awsCode: 'AWS A5.1 E6013',
      jisCode: 'JIS Z3211 D4313',
      badge: 'LEGENDARIS PERKAPALAN & STRUKTUR BAJA',
      type: 'High Titania Oxide (Rutile Kobelco)',
      tensile: '60.000 psi (≈ 420 - 450 MPa)',
      characteristics: 'Busur nyala lembut dan stabil, penetrasi sedang yang mencegah plat jebol, dan permukaan jalur lasan bergelombang halus mengkilap. Sangat handal pada posisi vertikal turun (downhill).',
      ovenRule: 'Cukup disimpan di ruangan kering berventilasi baik pada suhu normal.',
      usage: 'Pilihan utama industri galangan perkapalan (shipbuilding), tangki penampung air/minyak, struktur bangunan umum, dan fabrikasi mesin manufaktur.'
    }
  };

    // ===================================================================
  // DATA ILUSTRASI TEKNIS & ANATOMI FISIK PENGELASAN
  // ===================================================================
  const PROCESS_DIAGRAM_DATA = {
    SMAW: {
      title: 'Skema Anatomi Fisik Busur Las SMAW (Stick Welding)',
      subtitle: 'Kawat inti meleleh dihantarkan busur plasma di bawah perlindungan selubung gas fluks & terak terapung.',
      components: {
        core_wire: {
          name: 'Kawat Inti Logam (Core Wire)',
          role: 'Penghantar Arus Listrik & Logam Pengisi (Filler Metal)',
          desc: 'Kawat baja pejal di tengah elektroda yang menyalurkan arus listrik pengelasan. Ujungnya meleleh membentuk tetesan cairan logam yang mengisi kampuh las.',
          temp: 'Titik lebur baja: ± 1.530°C',
          tip: 'Pastikan ukuran diameter kawat sesuai dengan ketebalan plat kerja dan kapasitas ampere mesin las.',
          badge: '⚡ Logam Pengisi',
          color: '#94a3b8'
        },
        flux_coating: {
          name: 'Salutan Fluks Padat (Flux Coating)',
          role: 'Pembentuk Gas Pelindung, Terak & Pembersih Terak (Deoxidizer)',
          desc: 'Campuran mineral padat (titania, selulosa, serbuk besi, kalsium karbonat). Panas busur menguapkan fluks menjadi selubung gas dan terak cair yang mengikat kotoran oksida.',
          temp: 'Menguap pada suhu > 1.200°C',
          tip: 'Jaga elektroda tetap kering; fluks lembab akan menghasilkan gas hidrogen penyebab retak dingin.',
          badge: '🛡️ Salutan Fluks',
          color: '#d97706'
        },
        arc_plasma: {
          name: 'Busur Listrik Plasma (Arc Column Plasma)',
          role: 'Sumber Energi Termal Pelebur Logam (3.000°C – 3.500°C)',
          desc: 'Loncatan arus listrik berenergi tinggi yang mengionisasi udara menjadi plasma bertekanan tinggi untuk melebur kawat elektroda dan logam induk seketika.',
          temp: 'Suhu busur: 3.000°C – 3.500°C',
          tip: 'Jaga panjang busur stabil (setara diameter kawat inti, ± 2-3 mm) agar cairan las tidak meletup-letup (spatter).',
          badge: '🔥 Plasma Busur',
          color: '#f59e0b'
        },
        gas_shield: {
          name: 'Selubung Gas Pelindung (Shielding Gas Vapor)',
          role: 'Isolator Udara Luar (Mencegah Oksigen & Nitrogen)',
          desc: 'Uap gas CO, CO2, dan H2O hasil penguraian zat kimia fluks yang menyelimuti busur plasma sehingga cairan logam tidak teroksidasi oleh udara sekitar.',
          temp: 'Suhu gas selubung: ± 1.800°C - 2.200°C',
          tip: 'Keunggulan utama SMAW: gas pelindung diproduksi langsung dari kawat sehingga tahan terpaan angin luar ruangan.',
          badge: '💨 Gas Pelindung',
          color: '#38bdf8'
        },
        weld_pool: {
          name: 'Kawah Las Cair (Molten Weld Pool)',
          role: 'Peleburan & Percampuran Homogen Logam',
          desc: 'Kolam cairan logam induk dan logam kawat las yang mencair sempurna pada suhu ± 1.600°C sebelum membeku menjadi sambungan permanen.',
          temp: 'Suhu cairan: 1.550°C – 1.700°C',
          tip: 'Perhatikan tepi kawah las (puddle toes); isi kampuh dengan tenang tanpa meninggalkan cacat undercut.',
          badge: '🌊 Kawah Cair',
          color: '#ef4444'
        },
        slag: {
          name: 'Lapisan Kerak Terak (Solidifying Slag)',
          role: 'Pelindung Pendinginan Bertahap & Pembentuk Rigi',
          desc: 'Cairan terak yang memiliki massa jenis lebih ringan mengapung ke atas kawah cair dan mengeras membentuk lapisan pelindung oksidasi serta memperlambat laju pendinginan.',
          temp: 'Membeku pada suhu ± 1.100°C',
          tip: 'Wajib dibersihkan tuntas menggunakan palu terak (chipping hammer) sebelum melanjutkan lintasan las berikutnya!',
          badge: '🧱 Kerak Terak',
          color: '#b45309'
        },
        weld_bead: {
          name: 'Jalur Lasan Beku (Solidified Weld Bead)',
          role: 'Sambungan Konstruksi Permanen',
          desc: 'Logam las yang telah mengkristal sempurna dengan struktur mikro ferit-perlit berkekuatan tarik tinggi melampaui logam induk aslinya.',
          temp: 'Membeku di bawah 1.400°C',
          tip: 'Rigi-rigi las yang seragam dan simetris menandakan kecepatan tarik (travel speed) yang konsisten.',
          badge: '✅ Rigi Las Beku',
          color: '#64748b'
        },
        base_metal: {
          name: 'Logam Induk / Plat Kerja (Base Metal)',
          role: 'Benda Kerja Konstruksi yang Disambung',
          desc: 'Plat baja karbon atau baja struktural yang diberi kampuh (groove) dan terhubung dengan kabel masa (ground clamp) mesin las.',
          temp: 'Menerima rambatan panas (HAZ: 800°C - 1.100°C)',
          tip: 'Bersihkan permukaan plat dari karat, cat, dan minyak sebelum mengelas demi mencegah cacat porositas.',
          badge: '⚙️ Logam Induk',
          color: '#475569'
        }
      }
    },
    MIG: {
      title: 'Skema Anatomi Fisik Busur Las GMAW / MIG-MAG',
      subtitle: 'Kawat pejal kontinu keluar dari nozel dengan semburan gas mulia eksternal tanpa menghasilkan kerak terak padat.',
      components: {
        gas_nozzle: {
          name: 'Nozel Gas Pelindung (Gas Shroud Nozzle)',
          role: 'Mengarahkan Semburan Gas Pelindung Laminer',
          desc: 'Corong tembaga presisi di ujung stang las yang mengarahkan aliran gas pelindung secara seragam menyelimuti busur listrik.',
          temp: 'Didinginkan oleh gas atau sirkulasi air',
          tip: 'Bersihkan cipratan las (spatter) di dalam nozel secara berkala menggunakan anti-spatter spray.',
          badge: '🛡️ Corong Nozel',
          color: '#f97316'
        },
        contact_tip: {
          name: 'Mata Kontak Tembaga (Copper Contact Tip)',
          role: 'Penyalur Arus Listrik ke Kawat Las',
          desc: 'Komponen tembaga berlubang mikro tempat meluncurnya kawat las sambil mentransfer arus listrik tegangan searah DC(+).',
          temp: 'Titik kontak arus tinggi: ± 300°C - 500°C',
          tip: 'Ganti contact tip jika lubangnya telah membesar/oval agar busur tidak goyang dan tidak terjadi burn-back.',
          badge: '⚡ Contact Tip',
          color: '#eab308'
        },
        solid_wire: {
          name: 'Kawat Las Pejal Kontinu (Continuous Solid Wire)',
          role: 'Elektroda Konsumabel Otomatis',
          desc: 'Kawat baja berlapis tembaga tipis yang diumpankan terus-menerus oleh motor feeder, menghilangkan kebutuhan mengganti kawat batangan.',
          temp: 'Diameter umum: 0.8 mm, 1.0 mm, 1.2 mm',
          tip: 'Sesuaikan tekanan roller penarik wire feeder agar kawat tidak selip ataupun tertekuk.',
          badge: '🔄 Kawat Gulung',
          color: '#3b82f6'
        },
        gas_shield: {
          name: 'Selubung Gas Eksternal (Shielding Gas Cone)',
          role: 'Pelindung Atmosfer Murni (Argon / CO2)',
          desc: 'Gas pelindung bertekanan dari tabung silinder (Argon murni untuk MIG atau CO2 / campuran Ar+CO2 untuk MAG) yang memblokir udara luar.',
          temp: 'Laju aliran standar: 12 – 18 Liter/menit',
          tip: 'Hindari hembusan angin langsung di area kerja karena dapat menerbangkan selubung gas dan memicu porositas.',
          badge: '💨 Gas Pelindung',
          color: '#06b6d4'
        },
        arc_plasma: {
          name: 'Busur Listrik GMAW (Spray/Short-Circuit Arc)',
          role: 'Pelelehan Kawat Berkecepatan Tinggi (3.200°C – 4.000°C)',
          desc: 'Busur listrik bertekanan plasma yang mentransfer tetesan logam cair secara halus dan cepat ke kawah las.',
          temp: 'Suhu busur: 3.200°C – 4.000°C',
          tip: 'Pahami mode transfer logam: Short-Circuiting untuk plat tipis, Spray Transfer untuk plat tebal.',
          badge: '🔥 Busur Cepat',
          color: '#2563eb'
        },
        weld_pool: {
          name: 'Kawah Las Cair Bersih (Clean Molten Pool)',
          role: 'Kolam Fusi Bebas Terak',
          desc: 'Cairan logam sangat bersih tanpa lapisan terak padat tebal, hanya menyisakan pulau silikon mikroskopis tipis di tepinya.',
          temp: 'Suhu kawah: ± 1.650°C',
          tip: 'Pertahankan panjang penonjolan kawat (stick-out) sekitar 10 - 15 mm untuk menjaga stabilitas kawah.',
          badge: '🌊 Kawah Bersih',
          color: '#ef4444'
        },
        weld_bead: {
          name: 'Jalur Las Rapi & Bebas Terak (Clean Solid Bead)',
          role: 'Hasil Sambungan Produktivitas Tinggi',
          desc: 'Jalur lasan dengan rigi-rigi halus mengkilap, menghemat waktu fabrikasi hingga 50% karena tidak perlu proses pembersihan terak.',
          temp: 'Efisiensi deposisi: 95% - 98%',
          tip: 'Sangat cocok untuk perakitan bodi otomotif, tangki fabrikasi, dan produksi massal pabrik.',
          badge: '✅ Rigi Rapi',
          color: '#1d4ed8'
        },
        base_metal: {
          name: 'Logam Induk Fabrikasi (Base Plate)',
          role: 'Material Benda Kerja',
          desc: 'Plat baja struktural atau lembaran bodi kendaraan yang menerima penetrasi panas konstan dari busur semi-otomatis.',
          temp: 'Area HAZ terlokalisasi sempit',
          tip: 'Pemasangan klem ground yang kencang sangat krusial untuk kestabilan sirkuit tegangan konstan GMAW.',
          badge: '⚙️ Logam Induk',
          color: '#475569'
        }
      }
    },
    TIG: {
      title: 'Skema Anatomi Fisik Busur Las GTAW / TIG (Las Argon)',
      subtitle: 'Elektroda Wolfram tak meleleh memusatkan busur jarum berpresisi tinggi, kawat pakan diumpankan manual.',
      components: {
        ceramic_cup: {
          name: 'Nozel Keramik Alumina (Pink Ceramic Cup)',
          role: 'Isolator Suhu Tinggi & Pengarah Gas Argon',
          desc: 'Corong keramik berbahan alumina merah muda yang tahan temperatur sangat tinggi, bertugas mengarahkan aliran gas Argon laminer.',
          temp: 'Tahan panas hingga > 1.800°C',
          tip: 'Gunakan gas lens di dalam keramik untuk menghasilkan aliran gas Argon yang benar-benar laminer dan bebas turbulensi.',
          badge: '🌸 Keramik Alumina',
          color: '#ec4899'
        },
        tungsten: {
          name: 'Elektroda Wolfram / Tungsten (Non-Consumable)',
          role: 'Pemancar Busur Jarum Presisi (Titik Lebur 3.422°C)',
          desc: 'Batang wolfram murni atau paduan thorium/ceria berujung runcing tajam yang sama sekali tidak ikut meleleh selama pengelasan berlangsung.',
          temp: 'Titik lebur: 3.422°C (Logam titik lebur tertinggi)',
          tip: 'Asah ujung tungsten secara memanjang (bukan melingkar) dengan sudut 30° - 60° agar busur terfokus lurus.',
          badge: '💎 Wolfram Non-Melt',
          color: '#6366f1'
        },
        filler_rod: {
          name: 'Kawat Las Pakan Batangan (Manual Filler Rod)',
          role: 'Pengisi Logam Sambungan (Tangan Kiri)',
          desc: 'Kawat batangan polos tanpa fluks yang dicelupkan secara berirama oleh juru las ke bagian depan kawah las yang mencair.',
          temp: 'Dilelehkan oleh panas kolam cair (bukan oleh busur langsung)',
          tip: 'Selalu jaga ujung kawat filler tetap berada di dalam selubung gas Argon agar tidak teroksidasi saat ditarik keluar.',
          badge: '🥢 Kawat Pakan',
          color: '#10b981'
        },
        gas_shield: {
          name: 'Selubung Gas Argon Murni (Ultra High Purity 99.99%)',
          role: 'Perlindungan Mutlak Terhadap Kontaminasi Udara',
          desc: 'Gas mulia murni yang sama sekali tidak bereaksi secara kimia, melindungi elektroda wolfram panas dan kolam cairan logam dari oksigen.',
          temp: 'Kemurnian gas: 99.99% Argon Murni',
          tip: 'Atur waktu post-flow gas 5-10 detik setelah busur mati agar tungsten dan kawah dingin tanpa teroksidasi.',
          badge: '💨 Argon 99.99%',
          color: '#14b8a6'
        },
        arc_plasma: {
          name: 'Busur Jarum Presisi Tinggi (Pinpoint Needle Arc)',
          role: 'Pemusatan Energi Termal Terkontrol (3.500°C – 4.500°C)',
          desc: 'Busur listrik berdaya fokus jarum yang sangat tenang, stabil, dan bebas percikan (zero spatter), memungkinkan pengelasan plat super tipis.',
          temp: 'Suhu busur: 3.500°C – 4.500°C',
          tip: 'Hindari menyentuhkan ujung tungsten ke kawah cair agar tidak terjadi kontaminasi wolfram (tungsten inclusion).',
          badge: '🔥 Busur Jarum',
          color: '#059669'
        },
        weld_pool: {
          name: 'Kawah Las Presisi Tinggi (Mirror-Puddle)',
          role: 'Kolam Cair Bersih Berkilau',
          desc: 'Cairan logam bening mengkilap seperti cermin tanpa sedikitpun asap, kotoran, atau terak.',
          temp: 'Suhu kawah: ± 1.600°C',
          tip: 'Gunakan pedal kontrol kaki (foot pedal) untuk mengatur besar kecilnya ampere secara real-time saat mengelas.',
          badge: '🌊 Kawah Cermin',
          color: '#10b981'
        },
        stack_dimes: {
          name: 'Rigi Sisik Ikan / Koin Tumpuk (Stack-of-Dimes)',
          role: 'Simbol Kualitas & Estetika Las Kelas Tertinggi',
          desc: 'Rigi-rigi berjarak presisi menyerupai tumpukan koin atau sisik ikan yang seragam sempurna, standar tertinggi pipa PLTU dan pesawat terbang.',
          temp: 'Bebas terak & tanpa spatter',
          tip: 'Irama celupan filler rod dan kecepatan maju stang las harus benar-benar selaras untuk mendapatkan rigi sisik ikan.',
          badge: '✨ Stack of Dimes',
          color: '#047857'
        },
        base_metal: {
          name: 'Logam Paduan Presisi (Stainless Steel / Ti / Al)',
          role: 'Material Mutu Tinggi',
          desc: 'Pipa uap tekanan tinggi, plat stainless steel food grade, aluminium kapal cepat, atau paduan nikel industri kedirgantaraan.',
          temp: 'Penetrasi akar las (root pass) sangat sempurna',
          tip: 'Bersihkan permukaan sambungan dengan sikat stainless steel khusus (jangan pakai sikat bekas baja karbon).',
          badge: '⚙️ Logam Khusus',
          color: '#475569'
        }
      }
    },
    OAW: {
      title: 'Skema Anatomi Fisik Nyala Api OAW (Las Karbit / Oksi-Asetilen)',
      subtitle: 'Reaksi kimia pembakaran Asetilen + Oksigen membentuk 3 zona nyala api dengan suhu 3.200°C tanpa energi listrik.',
      components: {
        torch_tip: {
          name: 'Ujung Blender Las (Blowpipe Torch Tip Kuningan)',
          role: 'Mencampur Gas Oksigen & Asetilen Secara Proporsional',
          desc: 'Moncong kuningan berlubang kalibrasi tempat bertemunya gas O2 dan C2H2 dalam rasio 1:1 untuk menciptakan nyala api netral.',
          temp: 'Dibuat dari kuningan padat penghantar panas',
          tip: 'Pilih ukuran mata blender (nozzle size) yang sesuai dengan ketebalan plat agar api tidak meletup (backfire).',
          badge: '🔥 Blender Las',
          color: '#ea580c'
        },
        gas_hoses: {
          name: 'Saluran Selang Gas Ganda (Twin Gas Hoses)',
          role: 'Penyalur Bahan Bakar Gas Bertekanan',
          desc: 'Selang merah membawa gas bahan bakar asetilen (tekanan kerja 0.3-0.5 bar) dan selang biru membawa gas pengoksidasi (1.5-2.5 bar).',
          temp: 'Dilengkapi katup pengaman arus balik (flashback arrestor)',
          tip: 'Wajib pasang Flashback Arrestor pada regulator dan blender untuk mencegah api menjalar balik ke dalam tabung gas!',
          badge: '🔴🔵 Selang Kembar',
          color: '#dc2626'
        },
        inner_cone: {
          name: 'Kerucut Api Inti Putih Terang (Inner White Cone)',
          role: 'Pusat Reaksi Primer & Titik Terpanas (3.100°C – 3.300°C)',
          desc: 'Kerucut api pendek berwarna putih terang berkilau tempat terjadinya reaksi pembakaran primer C2H2 + O2 -> 2CO + H2.',
          temp: 'Suhu tertinggi: 3.100°C – 3.300°C',
          tip: 'Posisikan ujung kerucut putih 2 - 3 mm di atas permukaan plat kerja (jangan sampai menyentuh cairan las).',
          badge: '⚪ Kerucut Inti',
          color: '#ffffff'
        },
        outer_envelope: {
          name: 'Selubung Api Luar Kebiruan (Outer Blue Envelope)',
          role: 'Reaksi Pembakaran Sekunder & Pelindung Kawah',
          desc: 'Nyala api luar berwarna biru lembayung yang mereaksikan gas CO dan H2 dengan oksigen udara bebas menjadi CO2 dan uap air pelindung.',
          temp: 'Suhu zona luar: 1.200°C – 2.000°C',
          tip: 'Nyala api netral (perbandingan O2 dan C2H2 seimbang) adalah jenis nyala standar untuk mengelas baja lunak.',
          badge: '🔵 Selubung Luar',
          color: '#38bdf8'
        },
        filler_rod: {
          name: 'Kawat Las Pakan Karbit (Bare Steel Filler Rod)',
          role: 'Penambah Volume Sambungan Kampuh',
          desc: 'Batang kawat baja lunak berlapis tembaga tipis yang diselipkan perlahan ke dalam kawah cair setelah plat kerja meleleh.',
          temp: 'Dilelehkan oleh panas konduksi kawah cair',
          tip: 'Bisa digunakan tanpa kawat pakan sama sekali (teknik autogenous) untuk sambungan lipat plat tipis.',
          badge: '🥢 Kawat Pakan',
          color: '#f87171'
        },
        weld_pool: {
          name: 'Kawah Las Cair Termal (Molten Thermal Puddle)',
          role: 'Peleburan Logam oleh Energi Kimia Api',
          desc: 'Kolam cairan logam yang terbentuk murni akibat rambatan panas api gas (tanpa loncatan arus listrik).',
          temp: 'Suhu kawah: ± 1.500°C',
          tip: 'Pendinginan berlangsung lambat sehingga sambungan memiliki keuletan tinggi dan tidak mudah getas.',
          badge: '🌊 Kawah Termal',
          color: '#ef4444'
        },
        weld_bead: {
          name: 'Jalur Lasan Halus (Solidified Gas Bead)',
          role: 'Sambungan Las Plat Tipis',
          desc: 'Jalur las yang mulus dan rata dengan zona pengaruh panas (HAZ) yang relatif lebih lebar dibanding las busur listrik.',
          temp: 'Laju pendinginan bertahap',
          tip: 'Sangat handal untuk reparasi tangki motor, pipa refrigerasi AC (brazing), dan perbaikan bodi mobil.',
          badge: '✅ Jalur Halus',
          color: '#b91c1c'
        },
        base_metal: {
          name: 'Plat Baja Tipis / Sambungan Pipa (Base Workpiece)',
          role: 'Material Benda Kerja Tanpa Listrik',
          desc: 'Plat tipis ketebalan 0.5 - 3.0 mm atau pipa tembaga pendingin yang memerlukan panas merata terkontrol.',
          temp: 'Zona HAZ lebar (perlu antisipasi distorsi panas)',
          tip: 'Lakukan pemanasan awal (preheating) perlahan untuk mengurangi resiko perubahan bentuk plat tipis.',
          badge: '⚙️ Plat Tipis',
          color: '#475569'
        }
      }
    },
    FCAW: {
      title: 'Skema Anatomi Fisik Busur Las FCAW (Flux Cored Arc Welding)',
      subtitle: 'Kawat las pipa berongga berisi serbuk fluks padat menghasilkan laju deposisi tertinggi dan penetrasi terdalam.',
      components: {
        tubular_wire: {
          name: 'Kawat Tubular Selubung Baja (Steel Sheath Tube)',
          role: 'Pipa Pembawa Arus Listrik & Logam Pengisi',
          desc: 'Kawat las berbentuk pipa silinder baja tipis yang digulung mengelilingi serbuk fluks, diumpankan kontinu dari mesin feeder.',
          temp: 'Kepadatan arus sangat tinggi',
          tip: 'Gunakan roller bergerigi khusus (knurled drive roll) pada wire feeder agar kawat pipa berongga tidak penyet.',
          badge: '🔘 Selubung Pipa',
          color: '#8b5cf6'
        },
        flux_core: {
          name: 'Serbuk Inti Fluks Kimia (Internal Flux Powder Core)',
          role: 'Penghasil Gas Pelindung & Pembersih Terak Dalam',
          desc: 'Serbuk mineral kimia padat di dalam rongga kawat yang meledak seketika saat busur menyala, membentuk selimut terak dan gas pelindung.',
          temp: 'Bereaksi kimia di dalam busur',
          tip: 'Tipe FCAW Self-Shielded (FCAW-S) tidak memerlukan tabung gas sama sekali, sangat perkasa di lapangan berangin kencang.',
          badge: '🧪 Inti Fluks',
          color: '#c084fc'
        },
        gas_shield: {
          name: 'Sistem Perlindungan Gas Ganda (Dual Gas Shield)',
          role: 'Pelindung Kawah dari Luar dan Dalam',
          desc: 'Kombinasi perlindungan uap gas hasil dekomposisi fluks di dalam kawat dengan semburan gas CO2 eksternal (tipe FCAW-G).',
          temp: 'Laju semprot gas: 15 – 25 Liter/menit',
          tip: 'FCAW tipe gas-shielded menghasilkan penetrasi terkuat dan nilai uji ketangguhan impak tertinggi.',
          badge: '💨 Gas Ganda',
          color: '#60a5fa'
        },
        arc_plasma: {
          name: 'Busur Listrik Arus Tinggi (High-Current Spray Arc)',
          role: 'Peleburan Masif Cepat (3.500°C – 4.200°C)',
          desc: 'Busur plasma berenergi sangat tinggi yang mentransfer logam kawat secara semprotan halus (spray) dengan laju lebur tercepat di industri.',
          temp: 'Suhu busur: 3.500°C – 4.200°C',
          tip: 'Perhatikan ventilasi bengkel! Asap las (fume) FCAW lebih pekat dibanding SMAW atau MIG biasa.',
          badge: '🔥 Busur Masif',
          color: '#7c3aed'
        },
        weld_pool: {
          name: 'Kawah Las Penetrasi Sangat Dalam (Deep Penetration Pool)',
          role: 'Peleburan Akar Kampuh Plat Sangat Tebal',
          desc: 'Kawah las cair bertekanan besar yang mampu menembus akar kampuh baja tebal tanpa resiko cacat lack of penetration.',
          temp: 'Suhu kawah: 1.650°C – 1.800°C',
          tip: 'Mampu menyambung plat baja tebal dalam jumlah pass (lintasan) yang jauh lebih sedikit dibanding metode lain.',
          badge: '🌊 Penetrasi Dalam',
          color: '#ef4444'
        },
        slag_blanket: {
          name: 'Selimut Terak Cepat Membeku (Fast-Freezing Slag)',
          role: 'Penahan Cairan Logam di Semua Posisi',
          desc: 'Lapisan kerak terak yang mengeras sepersekian detik lebih cepat untuk menopang kolam cairan logam berat pada posisi vertikal atau overhead.',
          temp: 'Membeku seketika di atas cairan logam',
          tip: 'Kerak terak FCAW mudah terkelupas lepas (self-peeling) setelah sambungan lasan mendingin.',
          badge: '🧱 Terak Cepat Beku',
          color: '#6d28d9'
        },
        weld_bead: {
          name: 'Jalur Lasan Struktural Berat (Heavy-Duty Bead)',
          role: 'Sambungan Baja Raksasa Tahan Gempa',
          desc: 'Jalur las berkekuatan mekanis luar biasa yang lulus uji radiografi (X-Ray) dan uji ultrasonik pada struktur konstruksi kritis.',
          temp: 'Laju deposisi mencapai 8 - 12 kg logam/jam',
          tip: 'Pilihan utama konstruksi kilang minyak lepas pantai (offshore), jembatan baja gantung, dan alat berat tambang.',
          badge: '✅ Las Struktural',
          color: '#5b21b6'
        },
        base_metal: {
          name: 'Plat Konstruksi Tebal (Heavy Structural Plate)',
          role: 'Benda Kerja Baja Ketebalan Tinggi',
          desc: 'Plat baja tebal 12 mm hingga lebih dari 50 mm yang membutuhkan sambungan kokoh berkekuatan luluh tinggi.',
          temp: 'Menerima masukan panas tinggi (High Heat Input)',
          tip: 'Perhitungkan suhu interpass (maksimal 250°C) agar ketangguhan struktur mikro logam tidak menurun.',
          badge: '⚙️ Plat Baja Tebal',
          color: '#475569'
        }
      }
    }
  };


  const curProc = PROCESS_DATA[selectedProcess];
  const curDiagram = PROCESS_DIAGRAM_DATA[selectedProcess];
  const activeComp = selectedDiagramPart && curDiagram?.components[selectedDiagramPart] ? curDiagram.components[selectedDiagramPart] : null;
  const curAws = AWS_CODES[selectedAwsCode];
  const curTrade = TRADE_BRANDS[selectedTradeBrand];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* MODULE HEADER */}
      <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #7c2d12, #431407)', color: '#ffffff' }}>
        <span style={{ background: '#f97316', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
          MODUL PEMBELAJARAN PENGELASAN LOGAM (WELDING LAB)
        </span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 8px 0', color: '#fff' }}>
          Standarisasi Teknologi Pengelasan, Material & K3 Industri
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#fed7aa', lineHeight: 1.6, maxWidth: '900px', margin: 0 }}>
          Pelajari klasifikasi elektroda standar AWS (<strong>E6013, E7018, E7016, E6010</strong>) serta merk dagang populer industri Indonesia (<strong>LB-52, RD-260, RB-26</strong>), aturan K3, dan <strong>simulasi praktik sudut, jarak, & ayunan las</strong>!
        </p>
      </div>

      {/* TOP SUB-MODULE NAVIGATION TABS */}
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
              border: activeTab === t.id ? '2px solid #ea580c' : '1px solid var(--border-light)',
              background: activeTab === t.id ? 'rgba(234, 88, 12, 0.1)' : 'transparent',
              color: activeTab === t.id ? '#ea580c' : 'var(--text-main)',
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
      {/* SUB-MODUL 1: JENIS-JENIS PENGELASAN INDUSTRI                        */}
      {/* =================================================================== */}
      {activeTab === 'jenis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  ⚡ Klasifikasi 5 Proses Pengelasan Utama (Welding Processes)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Pilih salah satu teknologi pengelasan di bawah untuk melihat prinsip kerja, kelebihan, dan aplikasi industrinya.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['SMAW', 'MIG', 'TIG', 'OAW', 'FCAW'].map(p => (
                  <button
                    key={p}
                    onClick={() => { sound.playClick(); setSelectedProcess(p); setSelectedDiagramPart(null); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: selectedProcess === p ? `2px solid ${PROCESS_DATA[p].borderColor}` : '1px solid var(--border-light)',
                      background: selectedProcess === p ? PROCESS_DATA[p].color : '#ffffff',
                      color: selectedProcess === p ? '#ffffff' : 'var(--text-main)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

                        {/* =============================================================== */}
            {/* ILUSTRASI TEKNIS ANATOMI & PRINSIP FISIK PENGELASAN             */}
            {/* =============================================================== */}
            <div style={{
              background: '#0b1329',
              borderRadius: '14px',
              border: `2px solid ${curProc.borderColor}`,
              padding: '20px',
              color: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
              {/* Diagram Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: curProc.color, color: '#fff', fontSize: '0.7rem', fontWeight: 900, padding: '3px 8px', borderRadius: '4px' }}>
                      SKEMA TEKNIS
                    </span>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                      🔬 {curDiagram.title}
                    </h4>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {curDiagram.subtitle}
                  </p>
                </div>
                
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#38bdf8', 
                  background: 'rgba(56, 189, 248, 0.12)', 
                  border: '1px solid rgba(56, 189, 248, 0.3)', 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontWeight: 700 
                }}>
                  💡 Klik salah satu komponen pada gambar atau daftar di bawah!
                </div>
              </div>

              {/* Technical SVG Canvas */}
              <div style={{
                width: '100%',
                background: 'radial-gradient(ellipse at 50% 50%, #1e293b 0%, #090d16 100%)',
                borderRadius: '10px',
                border: '1px solid #334155',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '6px 0'
              }}>
                <svg 
                  viewBox="0 0 760 300" 
                  style={{ width: '100%', maxWidth: '760px', height: 'auto', maxHeight: '310px', display: 'block' }}
                >
                  <defs>
                    {/* Gradients */}
                    <linearGradient id="weldingPlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>

                    <linearGradient id="moltenPoolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="40%" stopColor="#f97316" />
                      <stop offset="80%" stopColor="#fef08a" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>

                    <radialGradient id="arcPlasmaGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                      <stop offset="30%" stopColor="#fef08a" stopOpacity="0.9" />
                      <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </radialGradient>

                    <radialGradient id="tigArcGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                      <stop offset="30%" stopColor="#a7f3d0" stopOpacity="0.9" />
                      <stop offset="70%" stopColor="#10b981" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#047857" stopOpacity="0" />
                    </radialGradient>

                    <linearGradient id="copperNozzleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#c2410c" />
                      <stop offset="50%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#9a3412" />
                    </linearGradient>

                    <linearGradient id="ceramicCupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#db2777" />
                      <stop offset="50%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#9d174d" />
                    </linearGradient>

                    <linearGradient id="slagGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#b45309" />
                      <stop offset="100%" stopColor="#78350f" />
                    </linearGradient>

                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                    </pattern>
                  </defs>

                  {/* Grid background */}
                  <rect width="760" height="300" fill="url(#grid)" />

                  {/* Direction of Travel Bar */}
                  <g>
                    <line x1="100" y1="28" x2="380" y2="28" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" />
                    <polygon points="390,28 375,22 375,34" fill="#38bdf8" />
                    <text x="240" y="20" fill="#38bdf8" fontSize="11" fontWeight="700" textAnchor="middle">
                      ➡️ Arah Pengelasan (Direction of Travel)
                    </text>
                  </g>

                  {/* Base Metal Plates (Workpiece) */}
                  <g 
                    onClick={() => { sound.playClick(); setSelectedDiagramPart('base_metal'); }}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Left Plate with bevel */}
                    <polygon 
                      points="60,205 375,205 385,225 385,265 60,265" 
                      fill="url(#weldingPlateGrad)" 
                      stroke={selectedDiagramPart === 'base_metal' ? '#38bdf8' : '#64748b'} 
                      strokeWidth={selectedDiagramPart === 'base_metal' ? '2.5' : '1.5'} 
                    />
                    {/* Right Plate with bevel */}
                    <polygon 
                      points="425,225 435,205 700,205 700,265 425,265" 
                      fill="url(#weldingPlateGrad)" 
                      stroke={selectedDiagramPart === 'base_metal' ? '#38bdf8' : '#64748b'} 
                      strokeWidth={selectedDiagramPart === 'base_metal' ? '2.5' : '1.5'} 
                    />
                    {/* Plate Hatching details */}
                    <line x1="80" y1="265" x2="110" y2="225" stroke="#334155" strokeWidth="1" />
                    <line x1="140" y1="265" x2="170" y2="225" stroke="#334155" strokeWidth="1" />
                    <line x1="620" y1="265" x2="650" y2="225" stroke="#334155" strokeWidth="1" />
                    <line x1="660" y1="265" x2="690" y2="225" stroke="#334155" strokeWidth="1" />
                    
                    <text x="560" y="240" fill="#cbd5e1" fontSize="11" fontWeight="800">
                      LOGAM INDUK (BASE METAL)
                    </text>
                    <text x="560" y="254" fill="#94a3b8" fontSize="9">
                      Klem Massa Ground (-) Terhubung
                    </text>
                  </g>

                  {/* ======================================================= */}
                  {/* SMAW DIAGRAM                                            */}
                  {/* ======================================================= */}
                  {selectedProcess === 'SMAW' && (
                    <g>
                      {/* Shielding Gas Vapor Envelope */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('gas_shield'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <ellipse 
                          cx="405" 
                          cy="195" 
                          rx="65" 
                          ry="35" 
                          fill="rgba(56, 189, 248, 0.15)" 
                          stroke={selectedDiagramPart === 'gas_shield' ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'} 
                          strokeWidth="1.5" 
                          strokeDasharray="4 3" 
                        />
                        <text x="440" y="165" fill="#38bdf8" fontSize="10" fontWeight="700">
                          Selubung Gas CO₂ / CO
                        </text>
                      </g>

                      {/* Solidified Weld Bead */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('weld_bead'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <path 
                          d="M 80,205 Q 120,185 160,205 Q 200,185 240,205 Q 280,185 320,205 Q 350,187 375,205 L 375,225 L 80,225 Z" 
                          fill="#475569" 
                          stroke={selectedDiagramPart === 'weld_bead' ? '#f59e0b' : '#94a3b8'} 
                          strokeWidth={selectedDiagramPart === 'weld_bead' ? '2.5' : '1.5'} 
                        />
                        {[100, 130, 160, 190, 220, 250, 280, 310, 340].map((rx, idx) => (
                          <path key={idx} d={`M ${rx-15},207 Q ${rx},190 ${rx+15},207`} fill="none" stroke="#64748b" strokeWidth="1.5" />
                        ))}
                      </g>

                      {/* Slag Layer */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('slag'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <path 
                          d="M 120,195 Q 160,180 200,195 Q 240,180 280,195 Q 320,180 360,195 L 360,201 Q 320,186 280,201 Q 240,186 200,201 Q 160,186 120,201 Z" 
                          fill="url(#slagGrad)" 
                          stroke={selectedDiagramPart === 'slag' ? '#f59e0b' : '#78350f'} 
                          strokeWidth={selectedDiagramPart === 'slag' ? '2' : '1'} 
                        />
                        <text x="210" y="178" fill="#d97706" fontSize="10" fontWeight="800">
                          Kerak Terak (Slag)
                        </text>
                      </g>

                      {/* Molten Weld Pool */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('weld_pool'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <ellipse 
                          cx="398" 
                          cy="212" 
                          rx="30" 
                          ry="15" 
                          fill="url(#moltenPoolGrad)" 
                          stroke={selectedDiagramPart === 'weld_pool' ? '#ffffff' : '#ea580c'} 
                          strokeWidth={selectedDiagramPart === 'weld_pool' ? '2.5' : '1.5'} 
                        />
                        <path d="M 375,212 Q 398,228 422,212" fill="none" stroke="#dc2626" strokeWidth="1.5" />
                      </g>

                      {/* Arc Column Plasma */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('arc_plasma'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle cx="405" cy="192" r="16" fill="url(#arcPlasmaGlow)" />
                        <line x1="412" y1="178" x2="400" y2="208" stroke="#ffffff" strokeWidth="3" />
                        <line x1="407" y1="177" x2="395" y2="209" stroke="#fef08a" strokeWidth="2" />
                        {/* Spatter sparks */}
                        <line x1="405" y1="190" x2="425" y2="182" stroke="#fef08a" strokeWidth="1.2" strokeDasharray="2 2" />
                        <line x1="402" y1="192" x2="385" y2="180" stroke="#fef08a" strokeWidth="1.2" strokeDasharray="2 2" />
                        <line x1="408" y1="195" x2="430" y2="200" stroke="#f97316" strokeWidth="1.2" />
                      </g>

                      {/* Electrode (Core Wire + Flux Coating) at 70 deg angle */}
                      {/* Flux Coating Sleeve */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('flux_coating'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="520,38 535,44 425,165 412,159" 
                          fill="#d97706" 
                          stroke={selectedDiagramPart === 'flux_coating' ? '#ffffff' : '#b45309'} 
                          strokeWidth={selectedDiagramPart === 'flux_coating' ? '2.5' : '1'} 
                        />
                        <text x="515" y="115" fill="#fed7aa" fontSize="10" fontWeight="700">
                          Salutan Fluks Padat
                        </text>
                      </g>

                      {/* Exposed Core Wire Tip */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('core_wire'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="425,165 412,159 408,174 419,178" 
                          fill="#94a3b8" 
                          stroke={selectedDiagramPart === 'core_wire' ? '#ffffff' : '#64748b'} 
                          strokeWidth={selectedDiagramPart === 'core_wire' ? '2.5' : '1'} 
                        />
                        <line x1="527" y1="41" x2="414" y2="176" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />
                        <text x="445" y="145" fill="#e2e8f0" fontSize="10" fontWeight="700">
                          Kawat Inti Logam
                        </text>
                      </g>

                      {/* Stang Las (Holder) at Top */}
                      <g>
                        <rect x="525" y="20" width="80" height="22" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                        <path d="M 605,31 Q 650,31 660,60" fill="none" stroke="#ef4444" strokeWidth="4" />
                        <text x="535" y="35" fill="#f8fafc" fontSize="9" fontWeight="800">
                          STANG LAS (+)
                        </text>
                      </g>
                    </g>
                  )}

                  {/* ======================================================= */}
                  {/* MIG / MAG (GMAW) DIAGRAM                                */}
                  {/* ======================================================= */}
                  {selectedProcess === 'MIG' && (
                    <g>
                      {/* Shielding Gas Flow Shroud (Argon/CO2) */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('gas_shield'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="405,130 445,145 460,205 365,205" 
                          fill="rgba(6, 182, 212, 0.22)" 
                          stroke={selectedDiagramPart === 'gas_shield' ? '#06b6d4' : 'rgba(6, 182, 212, 0.5)'} 
                          strokeWidth="1.5" 
                          strokeDasharray="4 3" 
                        />
                        <text x="315" y="165" fill="#06b6d4" fontSize="10" fontWeight="700">
                          Gas Pelindung (Ar / CO₂)
                        </text>
                      </g>

                      {/* Clean Solidified Weld Bead (No Slag) */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('weld_bead'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <path 
                          d="M 80,205 Q 120,188 160,205 Q 200,188 240,205 Q 280,188 320,205 Q 355,188 385,205 L 385,225 L 80,225 Z" 
                          fill="#3b82f6" 
                          fillOpacity="0.8" 
                          stroke={selectedDiagramPart === 'weld_bead' ? '#ffffff' : '#60a5fa'} 
                          strokeWidth={selectedDiagramPart === 'weld_bead' ? '2.5' : '1.5'} 
                        />
                        {[100, 130, 160, 190, 220, 250, 280, 310, 340, 370].map((rx, idx) => (
                          <path key={idx} d={`M ${rx-12},206 Q ${rx},194 ${rx+12},206`} fill="none" stroke="#93c5fd" strokeWidth="1.2" />
                        ))}
                        <text x="170" y="180" fill="#93c5fd" fontSize="10" fontWeight="800">
                          Jalur Lasan Bersih (Tanpa Kerak Terak)
                        </text>
                      </g>

                      {/* Molten Weld Pool */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('weld_pool'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <ellipse 
                          cx="405" 
                          cy="212" 
                          rx="28" 
                          ry="14" 
                          fill="url(#moltenPoolGrad)" 
                          stroke={selectedDiagramPart === 'weld_pool' ? '#ffffff' : '#ea580c'} 
                          strokeWidth={selectedDiagramPart === 'weld_pool' ? '2.5' : '1.5'} 
                        />
                      </g>

                      {/* Arc Column */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('arc_plasma'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle cx="410" cy="196" r="15" fill="url(#arcPlasmaGlow)" />
                        <line x1="416" y1="184" x2="408" y2="208" stroke="#ffffff" strokeWidth="2.5" />
                        {/* Spray droplets */}
                        <circle cx="411" cy="192" r="1.8" fill="#ffffff" />
                        <circle cx="409" cy="198" r="1.8" fill="#fef08a" />
                      </g>

                      {/* Continuous Solid Wire */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('solid_wire'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <line 
                          x1="432" 
                          y1="135" 
                          x2="413" 
                          y2="194" 
                          stroke={selectedDiagramPart === 'solid_wire' ? '#ffffff' : '#f59e0b'} 
                          strokeWidth="3.5" 
                        />
                        <text x="445" y="172" fill="#fbbf24" fontSize="10" fontWeight="700">
                          Kawat Solid Kontinu
                        </text>
                      </g>

                      {/* Contact Tip */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('contact_tip'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="438,105 448,110 436,145 428,142" 
                          fill="#eab308" 
                          stroke={selectedDiagramPart === 'contact_tip' ? '#ffffff' : '#a16207'} 
                          strokeWidth={selectedDiagramPart === 'contact_tip' ? '2' : '1'} 
                        />
                        <text x="460" y="130" fill="#fef08a" fontSize="10" fontWeight="700">
                          Contact Tip Tembaga
                        </text>
                      </g>

                      {/* Gas Nozzle Torch */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('gas_nozzle'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="480,35 520,50 452,142 418,130" 
                          fill="url(#copperNozzleGrad)" 
                          stroke={selectedDiagramPart === 'gas_nozzle' ? '#ffffff' : '#7c2d12'} 
                          strokeWidth={selectedDiagramPart === 'gas_nozzle' ? '2.5' : '1.5'} 
                        />
                        <text x="510" y="80" fill="#fed7aa" fontSize="10" fontWeight="800">
                          Nozel Gas (Torch Gun)
                        </text>
                      </g>
                    </g>
                  )}

                  {/* ======================================================= */}
                  {/* TIG / GTAW DIAGRAM                                      */}
                  {/* ======================================================= */}
                  {selectedProcess === 'TIG' && (
                    <g>
                      {/* Pure Argon Gas Cone */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('gas_shield'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="408,135 448,150 455,205 365,205" 
                          fill="rgba(20, 184, 166, 0.22)" 
                          stroke={selectedDiagramPart === 'gas_shield' ? '#14b8a6' : 'rgba(20, 184, 166, 0.5)'} 
                          strokeWidth="1.5" 
                          strokeDasharray="4 3" 
                        />
                        <text x="445" y="180" fill="#2dd4bf" fontSize="10" fontWeight="700">
                          Gas Argon 99.99%
                        </text>
                      </g>

                      {/* Stack-of-Dimes Solidified Bead */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('stack_dimes'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <path 
                          d="M 80,205 Q 120,190 160,205 Q 200,190 240,205 Q 280,190 320,205 Q 355,190 380,205 L 380,225 L 80,225 Z" 
                          fill="#065f46" 
                          stroke={selectedDiagramPart === 'stack_dimes' ? '#ffffff' : '#10b981'} 
                          strokeWidth={selectedDiagramPart === 'stack_dimes' ? '2.5' : '1.5'} 
                        />
                        {[100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 370].map((rx, idx) => (
                          <path key={idx} d={`M ${rx-10},206 Q ${rx+2},192 ${rx+14},206`} fill="none" stroke="#6ee7b7" strokeWidth="1.5" />
                        ))}
                        <text x="160" y="180" fill="#6ee7b7" fontSize="10" fontWeight="800">
                          Rigi Sisik Ikan Presisi (Stack of Dimes)
                        </text>
                      </g>

                      {/* Molten Weld Pool */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('weld_pool'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <ellipse 
                          cx="402" 
                          cy="210" 
                          rx="25" 
                          ry="12" 
                          fill="url(#moltenPoolGrad)" 
                          stroke={selectedDiagramPart === 'weld_pool' ? '#ffffff' : '#059669'} 
                          strokeWidth={selectedDiagramPart === 'weld_pool' ? '2.5' : '1.5'} 
                        />
                      </g>

                      {/* Precision Needle Arc */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('arc_plasma'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle cx="408" cy="195" r="12" fill="url(#tigArcGlow)" />
                        <polygon points="412,184 405,206 411,206" fill="#ffffff" />
                        <text x="445" y="202" fill="#34d399" fontSize="9" fontWeight="700">
                          Busur Jarum Presisi
                        </text>
                      </g>

                      {/* Non-consumable Tungsten Electrode */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('tungsten'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="435,115 442,118 414,185 411,184" 
                          fill="#475569" 
                          stroke={selectedDiagramPart === 'tungsten' ? '#ffffff' : '#1e293b'} 
                          strokeWidth={selectedDiagramPart === 'tungsten' ? '2.5' : '1'} 
                        />
                        <polygon points="414,185 411,184 412.5,190" fill="#e2e8f0" />
                        <text x="450" y="145" fill="#cbd5e1" fontSize="10" fontWeight="700">
                          Elektroda Wolfram Runcing
                        </text>
                      </g>

                      {/* Ceramic Cup (Pink Alumina) */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('ceramic_cup'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="475,40 515,55 450,146 415,133" 
                          fill="url(#ceramicCupGrad)" 
                          stroke={selectedDiagramPart === 'ceramic_cup' ? '#ffffff' : '#831843'} 
                          strokeWidth={selectedDiagramPart === 'ceramic_cup' ? '2.5' : '1.5'} 
                        />
                        <text x="505" y="85" fill="#fbcfe8" fontSize="10" fontWeight="800">
                          Nozel Keramik Alumina
                        </text>
                      </g>

                      {/* Manual Filler Rod (Fed from Left by Left Hand) */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('filler_rod'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <line 
                          x1="260" 
                          y1="170" 
                          x2="385" 
                          y2="208" 
                          stroke={selectedDiagramPart === 'filler_rod' ? '#ffffff' : '#10b981'} 
                          strokeWidth="3" 
                        />
                        <circle cx="385" cy="208" r="3" fill="#ffffff" />
                        <text x="240" y="160" fill="#34d399" fontSize="10" fontWeight="800">
                          Kawat Pakan Manual (Filler Rod)
                        </text>
                      </g>
                    </g>
                  )}

                  {/* ======================================================= */}
                  {/* OAW (OXY-ACETYLENE) DIAGRAM                             */}
                  {/* ======================================================= */}
                  {selectedProcess === 'OAW' && (
                    <g>
                      {/* Outer Flame Envelope (Blue/Purple) */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('outer_envelope'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="420,135 450,145 465,205 345,205" 
                          fill="rgba(59, 130, 246, 0.25)" 
                          stroke={selectedDiagramPart === 'outer_envelope' ? '#38bdf8' : 'rgba(59, 130, 246, 0.5)'} 
                          strokeWidth="1.5" 
                          strokeDasharray="4 3" 
                        />
                        <text x="445" y="175" fill="#60a5fa" fontSize="10" fontWeight="700">
                          Selubung Api Luar (1.200°C)
                        </text>
                      </g>

                      {/* Molten Puddle */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('weld_pool'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <ellipse 
                          cx="395" 
                          cy="210" 
                          rx="32" 
                          ry="15" 
                          fill="url(#moltenPoolGrad)" 
                          stroke={selectedDiagramPart === 'weld_pool' ? '#ffffff' : '#dc2626'} 
                          strokeWidth={selectedDiagramPart === 'weld_pool' ? '2.5' : '1.5'} 
                        />
                      </g>

                      {/* Solidified Gas Weld Bead */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('weld_bead'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <path 
                          d="M 80,205 Q 125,188 170,205 Q 215,188 260,205 Q 305,188 350,205 L 365,207 L 365,225 L 80,225 Z" 
                          fill="#991b1b" 
                          stroke={selectedDiagramPart === 'weld_bead' ? '#ffffff' : '#f87171'} 
                          strokeWidth={selectedDiagramPart === 'weld_bead' ? '2.5' : '1.5'} 
                        />
                        {[100, 140, 180, 220, 260, 300, 340].map((rx, idx) => (
                          <path key={idx} d={`M ${rx-15},206 Q ${rx},194 ${rx+15},206`} fill="none" stroke="#fca5a5" strokeWidth="1.2" />
                        ))}
                        <text x="180" y="180" fill="#fca5a5" fontSize="10" fontWeight="800">
                          Jalur Las Termal Padat
                        </text>
                      </g>

                      {/* Inner White Cone (Hottest Point: 3.200°C) */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('inner_cone'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="422,142 429,145 408,188 404,185" 
                          fill="#ffffff" 
                          stroke={selectedDiagramPart === 'inner_cone' ? '#f59e0b' : '#38bdf8'} 
                          strokeWidth={selectedDiagramPart === 'inner_cone' ? '2.5' : '1'} 
                        />
                        <text x="425" y="160" fill="#ffffff" fontSize="10" fontWeight="800">
                          Kerucut Inti Putih (3.200°C)
                        </text>
                      </g>

                      {/* Torch Tip (Brass Blowpipe) */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('torch_tip'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="470,60 495,72 432,146 418,139" 
                          fill="#d97706" 
                          stroke={selectedDiagramPart === 'torch_tip' ? '#ffffff' : '#78350f'} 
                          strokeWidth={selectedDiagramPart === 'torch_tip' ? '2.5' : '1.5'} 
                        />
                        <text x="480" y="95" fill="#fef08a" fontSize="10" fontWeight="800">
                          Blender Las Kuningan
                        </text>
                      </g>

                      {/* Gas Hoses (Oxygen Blue & Acetylene Red) */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('gas_hoses'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Acetylene Hose (Red) */}
                        <path d="M 478,63 Q 510,40 560,45" fill="none" stroke="#ef4444" strokeWidth="4" />
                        <text x="565" y="48" fill="#fca5a5" fontSize="9" fontWeight="800">
                          C₂H₂ (Asetilen - Merah)
                        </text>
                        {/* Oxygen Hose (Blue) */}
                        <path d="M 488,68 Q 520,45 560,65" fill="none" stroke="#3b82f6" strokeWidth="4" />
                        <text x="565" y="68" fill="#93c5fd" fontSize="9" fontWeight="800">
                          O₂ (Oksigen - Biru)
                        </text>
                      </g>

                      {/* Bare Filler Rod */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('filler_rod'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <line 
                          x1="260" 
                          y1="160" 
                          x2="380" 
                          y2="208" 
                          stroke={selectedDiagramPart === 'filler_rod' ? '#ffffff' : '#f87171'} 
                          strokeWidth="3" 
                        />
                        <text x="240" y="150" fill="#fca5a5" fontSize="10" fontWeight="700">
                          Kawat Pakan Karbit
                        </text>
                      </g>
                    </g>
                  )}

                  {/* ======================================================= */}
                  {/* FCAW (FLUX-CORED) DIAGRAM                               */}
                  {/* ======================================================= */}
                  {selectedProcess === 'FCAW' && (
                    <g>
                      {/* Dual Shield Gas Vapor */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('gas_shield'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <polygon 
                          points="405,130 445,145 460,205 365,205" 
                          fill="rgba(139, 92, 246, 0.22)" 
                          stroke={selectedDiagramPart === 'gas_shield' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.5)'} 
                          strokeWidth="1.5" 
                          strokeDasharray="4 3" 
                        />
                        <text x="445" y="175" fill="#a78bfa" fontSize="10" fontWeight="700">
                          Gas Pelindung Ganda (Dual Shield)
                        </text>
                      </g>

                      {/* Deep Weld Bead */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('weld_bead'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <path 
                          d="M 80,205 Q 120,185 160,205 Q 200,185 240,205 Q 280,185 320,205 Q 350,187 375,205 L 375,235 L 80,235 Z" 
                          fill="#4c1d95" 
                          stroke={selectedDiagramPart === 'weld_bead' ? '#ffffff' : '#8b5cf6'} 
                          strokeWidth={selectedDiagramPart === 'weld_bead' ? '2.5' : '1.5'} 
                        />
                        {[100, 130, 160, 190, 220, 250, 280, 310, 340].map((rx, idx) => (
                          <path key={idx} d={`M ${rx-15},207 Q ${rx},190 ${rx+15},207`} fill="none" stroke="#a78bfa" strokeWidth="1.2" />
                        ))}
                        <text x="180" y="180" fill="#c4b5fd" fontSize="10" fontWeight="800">
                          Jalur Las Struktural Dalam
                        </text>
                      </g>

                      {/* Fast-Freezing Slag Blanket */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('slag_blanket'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <path 
                          d="M 120,195 Q 160,180 200,195 Q 240,180 280,195 Q 320,180 360,195 L 360,201 Q 320,186 280,201 Q 240,186 200,201 Q 160,186 120,201 Z" 
                          fill="#6d28d9" 
                          stroke={selectedDiagramPart === 'slag_blanket' ? '#ffffff' : '#4c1d95'} 
                          strokeWidth={selectedDiagramPart === 'slag_blanket' ? '2' : '1'} 
                        />
                        <text x="210" y="172" fill="#ddd6fe" fontSize="9" fontWeight="800">
                          Terak Cepat Beku (Fast-Freeze)
                        </text>
                      </g>

                      {/* Deep Molten Pool */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('weld_pool'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <ellipse 
                          cx="400" 
                          cy="215" 
                          rx="32" 
                          ry="18" 
                          fill="url(#moltenPoolGrad)" 
                          stroke={selectedDiagramPart === 'weld_pool' ? '#ffffff' : '#7c3aed'} 
                          strokeWidth={selectedDiagramPart === 'weld_pool' ? '2.5' : '1.5'} 
                        />
                      </g>

                      {/* High Power Arc */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('arc_plasma'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle cx="408" cy="195" r="16" fill="url(#arcPlasmaGlow)" />
                        <line x1="416" y1="180" x2="402" y2="212" stroke="#ffffff" strokeWidth="3" />
                      </g>

                      {/* Tubular Wire (Cutaway showing outer sheath + inner flux core) */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('tubular_wire'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Outer steel tube sheath */}
                        <polygon 
                          points="435,130 445,135 416,190 406,185" 
                          fill="#94a3b8" 
                          stroke={selectedDiagramPart === 'tubular_wire' ? '#ffffff' : '#64748b'} 
                          strokeWidth="1.5" 
                        />
                      </g>

                      {/* Internal Flux Core */}
                      <g 
                        onClick={() => { sound.playClick(); setSelectedDiagramPart('flux_core'); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <line 
                          x1="439" 
                          y1="133" 
                          x2="411" 
                          y2="187" 
                          stroke={selectedDiagramPart === 'flux_core' ? '#ffffff' : '#c084fc'} 
                          strokeWidth="2" 
                          strokeDasharray="3 2" 
                        />
                        <text x="445" y="150" fill="#c084fc" fontSize="10" fontWeight="800">
                          Inti Serbuk Fluks Kimia
                        </text>
                      </g>

                      {/* Heavy Torch Gun */}
                      <g>
                        <polygon 
                          points="480,35 520,50 452,142 418,130" 
                          fill="#475569" 
                          stroke="#334155" 
                          strokeWidth="1.5" 
                        />
                        <text x="510" y="80" fill="#e2e8f0" fontSize="10" fontWeight="800">
                          Heavy-Duty FCAW Gun
                        </text>
                      </g>
                    </g>
                  )}
                </svg>
              </div>

              {/* Component Selector Buttons (Interactive Hotspots Legenda) */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🏷️ Pilih Komponen untuk Inspeksi Metalurgi & Fungsi:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.entries(curDiagram.components).map(([key, comp]) => {
                    const isSelected = selectedDiagramPart === key;
                    return (
                      <button
                        key={key}
                        onClick={() => { sound.playClick(); setSelectedDiagramPart(isSelected ? null : key); }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: isSelected ? `2px solid ${comp.color}` : '1px solid #334155',
                          background: isSelected ? comp.color : '#1e293b',
                          color: isSelected ? '#ffffff' : '#cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 800 : 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{comp.badge.split(' ')[0]}</span>
                        <span>{comp.name.split(' (')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COMPONENT INSPECTOR CARD */}
              {activeComp ? (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
                  borderRadius: '10px',
                  border: `2px solid ${activeComp.color}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ 
                        background: activeComp.color, 
                        color: '#fff', 
                        fontSize: '0.7rem', 
                        fontWeight: 900, 
                        padding: '3px 8px', 
                        borderRadius: '4px' 
                      }}>
                        {activeComp.badge}
                      </span>
                      <h4 style={{ margin: '6px 0 2px 0', fontSize: '1.05rem', fontWeight: 900, color: '#f8fafc' }}>
                        {activeComp.name}
                      </h4>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: activeComp.color }}>
                        {activeComp.role}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedDiagramPart(null)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #475569',
                        color: '#94a3b8',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Tutup Detail
                    </button>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                    {activeComp.desc}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginTop: '4px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', borderLeft: `3px solid ${activeComp.color}` }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800 }}>🌡️ SUHU / PARAMETER KERJA:</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>{activeComp.temp}</div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                      <div style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 800 }}>🛠️ TIPS PRAKTIK BENGKEL:</div>
                      <div style={{ fontSize: '0.82rem', color: '#e2e8f0', marginTop: '2px' }}>{activeComp.tip}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: '8px',
                  border: '1px dashed #334155',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#94a3b8',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                  <span>
                    <strong>Tips Interaktif:</strong> Klik pada komponen di dalam ilustrasi (misal: busur, kawah las, kawat inti, fluks/gas) atau tombol di atas untuk melihat detail mekanisme kimia & metalurginya.
                  </span>
                </div>
              )}
            </div>

            {/* PROCESS DETAIL CARD */}

            <div style={{
              background: curProc.bgColor,
              borderRadius: '12px',
              border: `2px solid ${curProc.borderColor}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, background: curProc.color, color: '#fff', padding: '3px 10px', borderRadius: '4px' }}>
                    {curProc.id} PROCESS
                  </span>
                  <h3 style={{ margin: '8px 0 4px 0', fontSize: '1.35rem', fontWeight: 900, color: curProc.borderColor }}>
                    {curProc.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    {curProc.alias}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ background: '#ffffff', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>SUHU NYALA BUSUR:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: curProc.borderColor }}>{curProc.temp}</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>POLARITAS LISTRIK:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>{curProc.polarity.split(' ')[0]}</div>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6, margin: 0, background: '#ffffff', padding: '14px', borderRadius: '8px' }}>
                {curProc.description}
              </p>

              {/* SPECIFICATION PILLS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px' }}>
                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: curProc.borderColor, marginBottom: '4px' }}>🛡️ METODE PELINDUNG (SHIELDING):</div>
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>{curProc.shielding}</div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: curProc.borderColor, marginBottom: '4px' }}>🔩 LOGAM PENGISI (FILLER METAL):</div>
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>{curProc.filler}</div>
                </div>

                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: curProc.borderColor, marginBottom: '4px' }}>🏭 APLIKASI UTAMA INDUSTRI:</div>
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>{curProc.applications}</div>
                </div>
              </div>

              {/* ADVANTAGES & LIMITATIONS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#065f46', marginBottom: '8px' }}>
                    ✅ KEUNGGULAN UTAMA:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#334155', lineHeight: 1.6 }}>
                    {curProc.advantages.map((adv, idx) => (
                      <li key={idx}>{adv}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#991b1b', marginBottom: '8px' }}>
                    ⚠️ KETERBATASAN / KEKURANGAN:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#334155', lineHeight: 1.6 }}>
                    {curProc.limitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-MODUL 2: KODE ELEKTRODA AWS & MERK & PERALATAN UTAMA BENGKEL   */}
      {/* =================================================================== */}
      {activeTab === 'alat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* =============================================================== */}
          {/* BAGIAN 1: DEKODER ANATOMI KODE ELEKTRODA AWS STANDAR             */}
          {/* =============================================================== */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                STANDAR AMERICAN WELDING SOCIETY (AWS A5.1 / A5.5)
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                🏷️ Anatomi & Cara Membaca Kode Elektroda Las (Contoh: E6013, E7018, E7016, E6010)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Pilih jenis kawat las AWS di bawah, lalu <strong>klik pada setiap kotak kode (E, 60/70, 1, 3/8)</strong> untuk melihat arti spesifikasi teknisnya.
              </p>
            </div>

            {/* AWS Code Selector Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['E6013', 'E7018', 'E7016', 'E6010'].map(codeKey => (
                <button
                  key={codeKey}
                  onClick={() => { sound.playClick(); setSelectedAwsCode(codeKey); }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: selectedAwsCode === codeKey ? '2px solid #ea580c' : '1px solid #cbd5e1',
                    background: selectedAwsCode === codeKey ? '#ea580c' : '#ffffff',
                    color: selectedAwsCode === codeKey ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Kawat Las {codeKey}
                </button>
              ))}
            </div>

            {/* Interactive Code Anatomy Blocks */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                KLIK SETIAP KOTAK KODE UNTUK MEMBUKA PENJELASAN ILMIAHNYA:
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* 1. PREFIX 'E' */}
                <div
                  onClick={() => { sound.playClick(); setSelectedAwsPart('prefix'); }}
                  style={{
                    padding: '12px 22px',
                    borderRadius: '8px',
                    background: selectedAwsPart === 'prefix' ? '#2563eb' : '#ffffff',
                    color: selectedAwsPart === 'prefix' ? '#ffffff' : '#2563eb',
                    border: '2px solid #2563eb',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: selectedAwsPart === 'prefix' ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>E</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800 }}>ELEKTRODA</div>
                </div>

                {/* 2. TENSILE STRENGTH (60 or 70) */}
                <div
                  onClick={() => { sound.playClick(); setSelectedAwsPart('tensile'); }}
                  style={{
                    padding: '12px 22px',
                    borderRadius: '8px',
                    background: selectedAwsPart === 'tensile' ? '#ea580c' : '#ffffff',
                    color: selectedAwsPart === 'tensile' ? '#ffffff' : '#ea580c',
                    border: '2px solid #ea580c',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: selectedAwsPart === 'tensile' ? '0 4px 12px rgba(234,88,12,0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{curAws.tensileValue}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800 }}>KEKUATAN TARIK</div>
                </div>

                {/* 3. WELDING POSITION (1) */}
                <div
                  onClick={() => { sound.playClick(); setSelectedAwsPart('position'); }}
                  style={{
                    padding: '12px 22px',
                    borderRadius: '8px',
                    background: selectedAwsPart === 'position' ? '#10b981' : '#ffffff',
                    color: selectedAwsPart === 'position' ? '#ffffff' : '#10b981',
                    border: '2px solid #10b981',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: selectedAwsPart === 'position' ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{curAws.posValue}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800 }}>POSISI LAS</div>
                </div>

                {/* 4. FLUX & CURRENT (3, 8, 6, or 0) */}
                <div
                  onClick={() => { sound.playClick(); setSelectedAwsPart('flux'); }}
                  style={{
                    padding: '12px 22px',
                    borderRadius: '8px',
                    background: selectedAwsPart === 'flux' ? '#7c3aed' : '#ffffff',
                    color: selectedAwsPart === 'flux' ? '#ffffff' : '#7c3aed',
                    border: '2px solid #7c3aed',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: selectedAwsPart === 'flux' ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{curAws.fluxValue}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800 }}>SALUTAN & ARUS</div>
                </div>
              </div>

              {/* Dynamic Explanation for Selected Code Block */}
              <div style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' }}>
                {selectedAwsPart === 'prefix' && (
                  <div>
                    <span style={{ color: '#2563eb', fontWeight: 800, fontSize: '0.85rem' }}>HURUF PERTAMA "E" :</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>Elektroda Busur Listrik Terbungkus (Arc Welding Electrode)</div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                      Menandakan bahwa material ini adalah elektroda las busur logam terlindung (SMAW). Kawat ini mengalirkan arus listrik pembentuk busur sekaligus ikut meleleh sebagai logam pengisi (filler metal) ke dalam sambungan las.
                    </p>
                  </div>
                )}
                {selectedAwsPart === 'tensile' && (
                  <div>
                    <span style={{ color: '#ea580c', fontWeight: 800, fontSize: '0.85rem' }}>DUA ANGKA KEDUA "{curAws.tensileValue}" :</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>Kekuatan Tarik Minimum (Tensile Strength) = {curAws.tensileDesc}</div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                      Nilai angka ini dikalikan 1.000 psi. Contoh: <strong>60</strong> berarti kekuatan tarik deposit las minimal 60.000 psi (setara ± 420 MPa atau 42 kg/mm²). Sedangkan <strong>70</strong> berarti kekuatan tarik minimal 70.000 psi (± 490 MPa) yang dirancang untuk baja berkekuatan tinggi.
                    </p>
                  </div>
                )}
                {selectedAwsPart === 'position' && (
                  <div>
                    <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>ANGKA KETIGA "{curAws.posValue}" :</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{curAws.posDesc}</div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                      Standar posisi pengelasan AWS:<br />
                      • <strong>1</strong> = Dapat digunakan pada <strong>SEMUA POSISI</strong> (Datar/Flat, Horizontal, Vertikal Naik/Turun, dan Di Atas Kepala/Overhead).<br />
                      • <strong>2</strong> = Hanya untuk posisi Datar (Flat) dan Sudut Mendatar (Horizontal Fillet).<br />
                      • <strong>4</strong> = Khusus untuk pengelasan Vertikal Turun (Vertical Downhill).
                    </p>
                  </div>
                )}
                {selectedAwsPart === 'flux' && (
                  <div>
                    <span style={{ color: '#7c3aed', fontWeight: 800, fontSize: '0.85rem' }}>ANGKA TERAKHIR "{curAws.fluxValue}" :</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{curAws.fluxDesc}</div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                      Menentukan bahan kimia salutan pembungkus kawat serta jenis arus pengelasan yang cocok:<br />
                      • <strong>3</strong> (Rutile/Titania): Arus AC, DCEN, atau DCEP. Busur nyala lembut, terak mudah rontok, spatter minim.<br />
                      • <strong>8</strong> (Low-Hydrogen Iron Powder): Arus AC atau DCEP. Terak tebal, sangat ulet, bebas retak.<br />
                      • <strong>6</strong> (Low-Hydrogen Potassium): Arus AC atau DCEP. Sangat stabil untuk pengelasan pipa.<br />
                      • <strong>0</strong> (Cellulose Sodium): Khusus arus DCEP. Penetrasi semprotan dalam untuk root pass pipa.
                    </p>
                  </div>
                )}
              </div>

              {/* General Summary Card for Selected AWS Code */}
              <div style={{ width: '100%', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#92400e', marginBottom: '4px' }}>
                  📌 Rangkuman Karakteristik Kawat Las {curAws.code}:
                </div>
                <div style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
                  {curAws.fullExplanation} <em>{curAws.popularEquiv}</em>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* BAGIAN 2: MEREK & KODE DAGANG POPULER DI INDONESIA (LB, RD, RB)  */}
          {/* =============================================================== */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
              <span style={{ background: '#ffedd5', color: '#c2410c', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                MEREK DAGANG BENGKEL & INDUSTRI (KOBELCO & NIKKO STEEL)
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                🏭 Kawat Las Paling Banyak Dipakai di Indonesia: RD-260, LB-52, & RB-26
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Di bengkel kerja nyata, welder sering menyebut kawat las dengan nama merk dagangnya. Berikut korelasi dan spesifikasi detailnya:
              </p>
            </div>

            {/* Trade Brand Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { id: 'RD260', label: 'RD-260 (Nikko Steel)', sub: 'Setara AWS E6013 • Bengkel Umum No.1' },
                { id: 'LB52', label: 'LB-52 / LB-52U (Kobelco)', sub: 'Setara AWS E7016 • Pipa Migas & Bejana' },
                { id: 'RB26', label: 'RB-26 (Kobelco)', sub: 'Setara AWS E6013 • Perkapalan & Struktur' }
              ].map(tb => (
                <button
                  key={tb.id}
                  onClick={() => { sound.playClick(); setSelectedTradeBrand(tb.id); }}
                  style={{
                    flex: '1 1 240px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: selectedTradeBrand === tb.id ? '2px solid #ea580c' : '1px solid #cbd5e1',
                    background: selectedTradeBrand === tb.id ? '#fff7ed' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: selectedTradeBrand === tb.id ? '0 4px 12px rgba(234,88,12,0.15)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedTradeBrand === tb.id ? '#ea580c' : '#0f172a' }}>
                    {tb.label}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {tb.sub}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Trade Brand Detail Card */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #ea580c',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ background: '#ea580c', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                    {curTrade.badge}
                  </span>
                  <h3 style={{ margin: '8px 0 2px 0', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                    {curTrade.name}
                  </h3>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                    Produsen: {curTrade.brand} • Klasifikasi Resmi: <strong>{curTrade.awsCode}</strong> ({curTrade.jisCode})
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>KEKUATAN TARIK:</div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ea580c' }}>{curTrade.tensile}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', marginBottom: '4px' }}>Tipe Salutan Fluks:</div>
                  <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{curTrade.type}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', marginBottom: '4px' }}>Perilaku Busur & Terak:</div>
                  <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{curTrade.characteristics}</div>
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#92400e', marginBottom: '2px' }}>
                  🌡️ Aturan Oven / Pemanasan:
                </div>
                <div style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
                  {curTrade.ovenRule}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#166534', marginBottom: '2px' }}>
                  🏭 Rekomendasi Aplikasi Bengkel & Proyek:
                </div>
                <div style={{ fontSize: '0.8rem', color: '#14532d', lineHeight: 1.5 }}>
                  {curTrade.usage}
                </div>
              </div>
            </div>

            {/* Tabel Komparasi Praktis */}
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
                📊 TABEL PERBANDINGAN PRAKTIS RD-260, LB-52, & RB-26 DI LAPANGAN:
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '10px' }}>Nama Merk Dagang</th>
                      <th style={{ padding: '10px' }}>Kode Standar AWS</th>
                      <th style={{ padding: '10px' }}>Karakter Fluks</th>
                      <th style={{ padding: '10px' }}>Pelepasan Terak</th>
                      <th style={{ padding: '10px' }}>Wajib Di-Oven?</th>
                      <th style={{ padding: '10px' }}>Aplikasi Utama</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: selectedTradeBrand === 'RD260' ? '#ffedd5' : '#fff' }}>
                      <td style={{ padding: '10px', fontWeight: 800, color: '#2563eb' }}>RD-260 (Nikko Steel)</td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>E6013</td>
                      <td style={{ padding: '10px' }}>High Titania (Rutile)</td>
                      <td style={{ padding: '10px', color: '#16a34a', fontWeight: 700 }}>Terlepas Sendiri (Self-Peeling)</td>
                      <td style={{ padding: '10px', color: '#16a34a' }}>Tidak Perlu</td>
                      <td style={{ padding: '10px' }}>Pagar, teralis, kanopi, bodi mobil, plat tipis</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: selectedTradeBrand === 'LB52' ? '#ffedd5' : '#fff' }}>
                      <td style={{ padding: '10px', fontWeight: 800, color: '#ea580c' }}>LB-52 / LB-52U (Kobelco)</td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>E7016</td>
                      <td style={{ padding: '10px' }}>Low-Hydrogen Potassium</td>
                      <td style={{ padding: '10px' }}>Sedang (Diketuk)</td>
                      <td style={{ padding: '10px', color: '#dc2626', fontWeight: 800 }}>Wajib (300°C–350°C)</td>
                      <td style={{ padding: '10px' }}>Pipa migas (root pass), tangki, jembatan berat</td>
                    </tr>
                    <tr style={{ background: selectedTradeBrand === 'RB26' ? '#ffedd5' : '#fff' }}>
                      <td style={{ padding: '10px', fontWeight: 800, color: '#059669' }}>RB-26 (Kobelco)</td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>E6013</td>
                      <td style={{ padding: '10px' }}>Rutile-Basic Kobelco</td>
                      <td style={{ padding: '10px', color: '#16a34a', fontWeight: 700 }}>Sangat Mudah Rontok</td>
                      <td style={{ padding: '10px', color: '#16a34a' }}>Tidak Perlu</td>
                      <td style={{ padding: '10px' }}>Galangan kapal, rangka struktur baja umum</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* =============================================================== */}
          {/* BAGIAN 3: PERALATAN UTAMA PENGELASAN (FOTO REAL FISIK)          */}
          {/* =============================================================== */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                  FOTO FISIK ALAT
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '6px 0 0 0' }}>
                  🛠️ Peralatan Utama Bengkel Las Mesin
                </h3>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Visualisasi Fisik Standar Industri Las SMAW
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
              {[
                { 
                  name: 'Mesin Las Inverter', 
                  sub: 'MMA / SMAW Power Source',
                  img: '/assets/images/welding_tools/mesin_las_inverter.jpg',
                  tag: 'Sumber Arus'
                },
                { 
                  name: 'Tang Penjepit Elektroda', 
                  sub: 'Electrode Holder / Stinger',
                  img: '/assets/images/welding_tools/tang_elektroda.jpg',
                  tag: 'Pemegang Kawat'
                },
                { 
                  name: 'Klem Massa Las', 
                  sub: 'Earth / Ground Clamp',
                  img: '/assets/images/welding_tools/klem_massa.jpg',
                  tag: 'Kutub Massa'
                },
                { 
                  name: 'Palu Terak Las', 
                  sub: 'Chipping Hammer (Peredam Getar)',
                  img: '/assets/images/welding_tools/palu_terak.jpg',
                  tag: 'Pembersih Terak'
                },
                { 
                  name: 'Sikat Kawat Baja', 
                  sub: 'Steel Wire Brush',
                  img: '/assets/images/welding_tools/sikat_kawat.jpg',
                  tag: 'Pembersih Karat'
                },
                { 
                  name: 'Mistar Ukur Las', 
                  sub: 'Bridge Cam / Welding Gauge',
                  img: '/assets/images/welding_tools/mistar_las.jpg',
                  tag: 'Inspeksi Dimensi'
                }
              ].map((tool, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    background: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    overflow: 'hidden',
                    display: 'flex', 
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '190px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={tool.img} 
                      alt={tool.name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }} 
                    />
                    <span style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.02em',
                      border: '1px solid rgba(255,255,255,0.15)'
                    }}>
                      {tool.tag}
                    </span>
                  </div>
                  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      {tool.name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                      {tool.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-MODUL 3: SIMULASI PRAKTIK & TEKNIK DASAR PENGELASAN             */}
      {/* =================================================================== */}
      {activeTab === 'teknik' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SIMULATOR INTERAKTIF: SUDUT, JARAK, & AYUNAN */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', border: '2px solid #ea580c' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ background: '#ea580c', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                  SIMULATOR PRAKTIK INTERAKTIF
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                  🎮 Simulasi Teknik Dasar: Sudut, Jarak Busur, & Gerakan Ayunan
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Uji coba parameter sudut kemiringan, jarak panjang busur, dan lihat animasi pola ayunan elektroda.
                </p>
              </div>

              {/* SIMULATION MODE TABS */}
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.06)', padding: '4px', borderRadius: '10px' }}>
                <button
                  onClick={() => { sound.playClick(); setSimMode('sudut'); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: simMode === 'sudut' ? '#ea580c' : 'transparent',
                    color: simMode === 'sudut' ? '#fff' : 'var(--text-main)',
                    transition: 'all 0.2s'
                  }}
                >
                  📐 1. Sudut Elektroda
                </button>
                <button
                  onClick={() => { sound.playClick(); setSimMode('jarak'); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: simMode === 'jarak' ? '#ea580c' : 'transparent',
                    color: simMode === 'jarak' ? '#fff' : 'var(--text-main)',
                    transition: 'all 0.2s'
                  }}
                >
                  📏 2. Jarak Busur (Arc Length)
                </button>
                <button
                  onClick={() => { sound.playClick(); setSimMode('ayunan'); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: simMode === 'ayunan' ? '#ea580c' : 'transparent',
                    color: simMode === 'ayunan' ? '#fff' : 'var(--text-main)',
                    transition: 'all 0.2s'
                  }}
                >
                  〰️ 3. Pola Ayunan (Weaving)
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SIMULASI 1: SUDUT ELEKTRODA                                  */}
            {/* ------------------------------------------------------------- */}
            {simMode === 'sudut' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Controls Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          Sudut Kemiringan Elektroda (Travel / Drag Angle):
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                          Terhadap Benda Kerja: <strong style={{ color: (travelAngle >= 70 && travelAngle <= 80) ? '#16a34a' : '#ea580c' }}>{travelAngle}°</strong> | Miring Menarik: <strong style={{ color: ((90 - travelAngle) >= 10 && (90 - travelAngle) <= 15) ? '#16a34a' : ((90 - travelAngle) >= 10 && (90 - travelAngle) <= 20) ? '#2563eb' : '#ea580c' }}>{90 - travelAngle}° dari tegak lurus</strong>
                        </div>
                      </div>
                      <span style={{ fontSize: '1.05rem', fontWeight: 900, color: (travelAngle >= 70 && travelAngle <= 80) ? '#16a34a' : '#dc2626' }}>
                        {travelAngle}° {(travelAngle >= 70 && travelAngle <= 80) ? '✅ (IDEAL 70°-80°)' : travelAngle > 80 ? '⚠️ (TERLALU TEGAK)' : '⚠️ (TERLALU REBAH)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      step="1"
                      value={travelAngle}
                      onChange={(e) => setTravelAngle(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#ea580c', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                      <span>50° (Rebah / Miring 40°)</span>
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>70° – 80° (Miring 10° – 15° Menarik / Standar AWS)</span>
                      <span>90° (Tegak Lurus / Miring 0°)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Tipe Sambungan:</span>
                    <button
                      onClick={() => setWorkJointType('butt')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: workJointType === 'butt' ? '#2563eb' : '#fff',
                        color: workJointType === 'butt' ? '#fff' : 'var(--text-main)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Butt Joint (Work Angle 90°)
                    </button>
                    <button
                      onClick={() => setWorkJointType('fillet')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: workJointType === 'fillet' ? '#2563eb' : '#fff',
                        color: workJointType === 'fillet' ? '#fff' : 'var(--text-main)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Fillet / T-Joint (Work Angle 45°)
                    </button>
                  </div>
                </div>

                {/* SVG Visualizer for Electrode Angle */}
                <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'center' }}>
                  <svg viewBox="0 0 600 300" style={{ width: '100%', maxWidth: '650px', height: 'auto', maxHeight: '300px' }}>
                    {/* Base Steel Plate */}
                    <rect x="50" y="210" width="500" height="40" fill="#334155" stroke="#64748b" strokeWidth="2" rx="4" />
                    <text x="70" y="235" fill="#94a3b8" fontSize="11" fontWeight="bold">PLAT BAJA INDUK (BASE METAL)</text>

                    {/* Weld Seam & Bead */}
                    <path d="M 50 210 Q 150 195 240 210 Z" fill="#64748b" stroke="#cbd5e1" strokeWidth="1" />
                    <path d="M 50 208 Q 120 196 230 208" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
                    
                    {/* Molten Puddle (Kawah Las Cair) at contact point (250, 210) */}
                    <ellipse cx="250" cy="208" rx="16" ry="6" fill="#f97316" filter="drop-shadow(0 0 8px #f97316)" />
                    <circle cx="250" cy="208" r="8" fill="#fef08a" />

                    {/* Arc Plasma & Sparks */}
                    <path d="M 250 208 L 244 198 L 256 198 Z" fill="#60a5fa" filter="drop-shadow(0 0 10px #60a5fa)" />
                    
                    {/* Slag flow direction indicator */}
                    {travelAngle > 80 ? (
                      <g>
                        <path d="M 250 208 Q 280 206 310 210" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="4 2" />
                        <text x="320" y="205" fill="#ef4444" fontSize="11" fontWeight="bold">⚠️ Terak Mendahului Busur!</text>
                      </g>
                    ) : (
                      <g>
                        <path d="M 230 208 Q 180 206 140 208" fill="none" stroke="#10b981" strokeWidth="3" />
                        <text x="110" y="185" fill="#10b981" fontSize="11" fontWeight="bold">✓ Terak Tertolak ke Belakang</text>
                      </g>
                    )}

                    {/* ELECTRODE ROTATION GROUP */}
                    {(() => {
                      const dragAngle = 90 - travelAngle;
                      const rad = (dragAngle * Math.PI) / 180;
                      const xEnd = 250 - 150 * Math.sin(rad);
                      const yEnd = 204 - 150 * Math.cos(rad);
                      const xMid = 250 - 110 * Math.sin(rad);
                      const yMid = 204 - 110 * Math.cos(rad);

                      return (
                        <g>
                          {/* 90 DEGREE NORMAL VERTICAL REFERENCE LINE */}
                          <line x1="250" y1="204" x2="250" y2="55" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
                          <text x="255" y="65" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                            90° Garis Tegak Lurus
                          </text>

                          {/* Burning Flux-Coated Electrode */}
                          <line x1="250" y1="204" x2={xEnd} y2={yEnd} stroke="#78716c" strokeWidth="10" strokeLinecap="round" />
                          <line x1="250" y1="204" x2={xEnd} y2={yEnd} stroke="#cbd5e1" strokeWidth="4" />
                          <circle cx="250" cy="204" r="5" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />

                          {/* Electrode Holder Tang Las */}
                          <line x1={xMid} y1={yMid} x2={xEnd - 20 * Math.sin(rad)} y2={yEnd - 20 * Math.cos(rad)} stroke="#dc2626" strokeWidth="18" strokeLinecap="round" />

                          {/* ARC 1: KEMIRINGAN DARI TEGAK LURUS (10° - 15° MENARIK) */}
                          {dragAngle > 0 && (
                            <g>
                              <path
                                d={`M 250 114 A 90 90 0 0 0 ${250 - 90 * Math.sin(rad)} ${204 - 90 * Math.cos(rad)}`}
                                fill="none"
                                stroke={(dragAngle >= 10 && dragAngle <= 15) ? '#38bdf8' : '#f59e0b'}
                                strokeWidth="2.5"
                                strokeDasharray="3 2"
                              />
                              <text
                                x={250 - 110 * Math.sin(rad / 2)}
                                y={204 - 110 * Math.cos(rad / 2)}
                                fill={(dragAngle >= 10 && dragAngle <= 15) ? '#38bdf8' : '#f59e0b'}
                                fontSize="11"
                                fontWeight="bold"
                                textAnchor="end"
                              >
                                Miring {dragAngle}° {(dragAngle >= 10 && dragAngle <= 15) ? '✨ (10°-15°)' : ''}
                              </text>
                            </g>
                          )}

                          {/* ARC 2: SUDUT TERHADAP GARIS LURUS BENDA KERJA (70° - 80°) */}
                          <path
                            d={`M 180 204 A 70 70 0 0 1 ${250 - 70 * Math.sin(rad)} ${204 - 70 * Math.cos(rad)}`}
                            fill="none"
                            stroke={(travelAngle >= 70 && travelAngle <= 80) ? '#10b981' : '#f59e0b'}
                            strokeWidth="2.5"
                          />
                          <text
                            x={250 - 88 * Math.cos((travelAngle / 2) * Math.PI / 180)}
                            y={204 - 88 * Math.sin((travelAngle / 2) * Math.PI / 180)}
                            fill={(travelAngle >= 70 && travelAngle <= 80) ? '#10b981' : '#f59e0b'}
                            fontSize="13"
                            fontWeight="bold"
                            textAnchor="end"
                          >
                            {travelAngle}°
                          </text>

                          {/* Direction of Travel Arrow */}
                          <line x1="230" y1="270" x2="360" y2="270" stroke="#38bdf8" strokeWidth="3" />
                          <polygon points="360,270 350,265 350,275" fill="#38bdf8" />
                          <text x="295" y="288" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                            ARAH TARIKAN LAS (TRAVEL DIRECTION) ➔
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* Real-time Status Diagnostic Card */}
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  background: (travelAngle >= 70 && travelAngle <= 80) ? '#f0fdf4' : '#fef2f2',
                  border: `2px solid ${(travelAngle >= 70 && travelAngle <= 80) ? '#16a34a' : '#ef4444'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontWeight: 900, fontSize: '0.98rem', color: (travelAngle >= 70 && travelAngle <= 80) ? '#166534' : '#991b1b' }}>
                    {(travelAngle >= 70 && travelAngle <= 80)
                      ? `✅ KONDISI SUDUT OPTIMAL: ${travelAngle}° terhadap benda kerja (Miring ${90 - travelAngle}° menarik dari tegak lurus)`
                      : travelAngle > 80
                      ? `⚠️ PERINGATAN: ELEKTRODA TERLALU TEGAK (${travelAngle}° > 80° / Hanya Miring ${90 - travelAngle}° dari Posisi Tegak Lurus)`
                      : `⚠️ PERINGATAN: ELEKTRODA TERLALU REBAH (${travelAngle}° < 70° / Miring ${90 - travelAngle}° > 20° dari Posisi Tegak Lurus)`}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55 }}>
                    {(travelAngle >= 70 && travelAngle <= 80)
                      ? <><strong>Sudut kemiringan elektroda yang benar umumnya adalah 70 hingga 80 derajat terhadap garis lurus benda kerja atau sedikit miring (menarik) sekitar 10 hingga 15 derajat dari posisi tegak lurus.</strong> Pada posisi ini, semburan gaya dorong busur listrik secara alami mendorong cairan terak (slag) agar tetap berada di belakang kawah las cair. Terak membeku di atas logam cair secara teratur membentuk rigi-rigi halus tanpa ada terak yang terjebak di dalam daging las.</>
                      : travelAngle > 80
                      ? <>Akibat elektroda terlalu tegak lurus (hanya miring {90 - travelAngle}° dari posisi tegak lurus), gaya dorong busur las ke belakang hilang sehingga cairan terak mengalir mendahului busur dan masuk ke kawah las. Ini adalah penyebab nomor satu cacat <em>Slag Inclusion</em> (terak terperangkap) dan percikan <em>spatter</em> melompat ke segala arah. <strong>Posisikan elektroda miring 10° hingga 15° dari posisi tegak lurus (70° hingga 80° terhadap garis lurus benda kerja).</strong></>
                      : <>Akibat elektroda terlalu rebah ({travelAngle}° &lt; 70° / miring {90 - travelAngle}° &gt; 20° dari posisi tegak lurus), jarak busur menjadi panjang secara semu, penetrasi dangkal, dan panas logam induk hilang ke belakang. Jalur lasan menjadi kurus, cembung tidak merata, serta rentan cacat lack of fusion.</>}
                  </div>
                </div>

                {/* PEDOMAN STANDAR SUDUT KEMIRINGAN ELEKTRODA */}
                <div style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: '1.5px solid #f59e0b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📐</span>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#92400e' }}>
                        PEDOMAN STANDAR SUDUT KEMIRINGAN ELEKTRODA (SMAW)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>
                        Kaidah Mutlak Juru Las Standar Industri & Kurikulum Vokasi / SMK
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: '#ffffff',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    border: '1px solid #fde68a',
                    fontSize: '0.9rem',
                    color: '#78350f',
                    lineHeight: 1.6
                  }}>
                    💡 <strong>Kaidah Utama:</strong> Sudut kemiringan elektroda yang benar umumnya adalah <strong>70 hingga 80 derajat terhadap garis lurus benda kerja</strong> atau sedikit miring (menarik) sekitar <strong>10 hingga 15 derajat dari posisi tegak lurus</strong>.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
                        1. Terhadap Garis Lurus Benda Kerja
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 3px 0' }}>
                        70° – 80° (Travel Angle)
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                        Diukur antara sumbu kawat elektroda dan permukaan plat benda kerja searah jalur pengelasan.
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                        2. Dari Posisi Tegak Lurus (Drag / Menarik)
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 3px 0' }}>
                        Miring 10° – 15° Menarik
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                        Diukur dari garis vertikal normal 90° condong ke arah tarikan las sebesar 10° sampai 15° (maksimal 20°).
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                        3. Alasan Ilmiah & Fungsi Mekanis
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 3px 0' }}>
                        Kontrol Cairan Terak (Slag)
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                        Semburan plasma busur menahan terak tetap berada di belakang kawah cair sehingga tidak terjadi cacat <em>slag inclusion</em>.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SIMULASI 2: JARAK ELEKTRODA (ARC LENGTH)                     */}
            {/* ------------------------------------------------------------- */}
            {simMode === 'jarak' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Controls Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Panjang Busur Nyala (Arc Length):
                      </span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: (arcLength >= 1.8 && arcLength <= 3.2) ? '#16a34a' : '#dc2626' }}>
                        {arcLength.toFixed(1)} mm {(arcLength >= 1.8 && arcLength <= 3.2) ? '✅ (IDEAL)' : arcLength < 1.8 ? '❌ (NEMPEL/PADAM)' : '⚠️ (TERLALU JAUH)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="8.0"
                      step="0.5"
                      value={arcLength}
                      onChange={(e) => setArcLength(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#ea580c', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                      <span style={{ color: '#dc2626' }}>0.5 mm (Nempel)</span>
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>2.0 - 3.0 mm (Ideal = Diameter Kawat)</span>
                      <span style={{ color: '#dc2626' }}>8.0 mm (Liar / Porositas)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (arcLength < 1.8) {
                        sound.playError();
                      } else {
                        sound.playSuccess();
                      }
                    }}
                    className="btn-game btn-game-primary"
                    style={{ padding: '10px 18px', fontSize: '0.8rem' }}
                  >
                    🔊 Cek Karakter Suara Busur
                  </button>
                </div>

                {/* SVG Visualizer for Arc Length */}
                <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'center' }}>
                  <svg viewBox="0 0 600 280" style={{ width: '100%', maxWidth: '650px', height: 'auto', maxHeight: '280px' }}>
                    {/* Base Metal Plate */}
                    <rect x="80" y="220" width="440" height="36" fill="#334155" stroke="#64748b" strokeWidth="2" rx="4" />
                    <text x="300" y="242" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">
                      BENDA KERJA (LOGAM INDUK BAJA)
                    </text>

                    {(() => {
                      const gapPx = arcLength * 10;
                      const rodBottomY = 220 - gapPx;
                      const isStuck = arcLength < 1.5;
                      const isIdeal = arcLength >= 1.5 && arcLength <= 3.5;

                      return (
                        <g>
                          {/* Molten Crater (Kawah Las Cair) */}
                          <ellipse
                            cx="300"
                            cy="220"
                            rx={isIdeal ? 35 : isStuck ? 15 : 60}
                            ry={isIdeal ? 10 : isStuck ? 4 : 14}
                            fill={isStuck ? '#475569' : '#ea580c'}
                            filter="drop-shadow(0 0 10px #ea580c)"
                          />
                          {!isStuck && (
                            <ellipse cx="300" cy="220" rx={isIdeal ? 20 : 35} ry={isIdeal ? 6 : 8} fill="#fef08a" />
                          )}

                          {/* ARC PLASMA FLAME */}
                          {isStuck ? (
                            <circle cx="300" cy="218" r="6" fill="#ef4444" />
                          ) : isIdeal ? (
                            <g>
                              <polygon points={`300,220 288,${rodBottomY} 312,${rodBottomY}`} fill="#60a5fa" filter="drop-shadow(0 0 12px #38bdf8)" />
                              <circle cx="300" cy={(220 + rodBottomY) / 2} r="12" fill="#ffffff" opacity="0.9" />
                            </g>
                          ) : (
                            <g>
                              <path
                                d={`M 300 220 Q 260 ${(220 + rodBottomY) / 2} 290 ${rodBottomY} Q 340 ${(220 + rodBottomY) / 2} 300 220`}
                                fill="#a855f7"
                                opacity="0.7"
                                filter="drop-shadow(0 0 16px #ec4899)"
                              />
                              <circle cx="230" cy="180" r="3" fill="#f97316" />
                              <circle cx="370" cy="160" r="3.5" fill="#f97316" />
                              <circle cx="390" cy="210" r="2.5" fill="#f97316" />
                              <circle cx="210" cy="215" r="3" fill="#f97316" />
                              <text x="390" y="150" fill="#f97316" fontSize="10" fontWeight="bold">Percikan Spatter!</text>
                            </g>
                          )}

                          {/* ELECTRODE STICK */}
                          <rect x="288" y={rodBottomY - 140} width="24" height="140" fill="#78716c" stroke="#44403c" strokeWidth="1.5" rx="2" />
                          <rect x="296" y={rodBottomY - 140} width="8" height="140" fill="#cbd5e1" />
                          <circle cx="300" cy={rodBottomY} r="5" fill={isStuck ? '#dc2626' : '#ffffff'} />

                          {/* Arc Length Measurement Indicator */}
                          <line x1="330" y1="220" x2="330" y2={rodBottomY} stroke="#f59e0b" strokeWidth="2" />
                          <line x1="325" y1="220" x2="335" y2="220" stroke="#f59e0b" strokeWidth="2" />
                          <line x1="325" y1={rodBottomY} x2="335" y2={rodBottomY} stroke="#f59e0b" strokeWidth="2" />
                          <text x="345" y={(220 + rodBottomY) / 2 + 4} fill="#f59e0b" fontSize="12" fontWeight="bold">
                            {arcLength.toFixed(1)} mm
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* Real-time Status Diagnostic Card */}
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: (arcLength >= 1.8 && arcLength <= 3.2) ? '#f0fdf4' : '#fef2f2',
                  border: `2px solid ${(arcLength >= 1.8 && arcLength <= 3.2) ? '#16a34a' : '#ef4444'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', color: (arcLength >= 1.8 && arcLength <= 3.2) ? '#166534' : '#991b1b' }}>
                    {(arcLength >= 1.8 && arcLength <= 3.2)
                      ? '✅ JARAK BUSUR IDEAL: STABIL & SUARA MENDELEBUR SEMPURNA'
                      : arcLength < 1.8
                      ? '❌ JARAK TERLALU PENDEK: ELEKTRODA MENEMPEL / SHORT CIRCUIT'
                      : '⚠️ JARAK TERLALU PANJANG: BAHAYA CACAT POROSITAS & TEGANGAN MELONJAK'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    {(arcLength >= 1.8 && arcLength <= 3.2)
                      ? 'Jarak busur sama dengan diameter kawat inti elektroda (± 2.5 mm). Selubung gas pelindung fluks menutup rapat kawah las dari kontaminasi udara. Karakter suara busur terdengar mendesis renyah dan konsisten seperti suara menggoreng telur (crisp bacon sound).'
                      : arcLength < 1.8
                      ? 'Ujung kawat las menyentuh logam induk tanpa ada ruang celah busur. Terjadi hubung singkat listrik (short circuit), elektroda membara merah, salutan fluks rontok, dan lasan padam membeku seketika.'
                      : 'Voltase busur melonjak tajam membuat busur meliuk liar tak terkontrol (arc wander). Gas pelindung robek sehingga udara atmosfer masuk ke cairan logam yang memicu cacat POROSITAS (gelembung gas keropos) dan menghasilkan percikan spatter melompat-lompat.'}
                  </div>
                </div>

              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SIMULASI 3: MACAM GERAKAN AYUNAN (WEAVING MOTION)            */}
            {/* ------------------------------------------------------------- */}
            {simMode === 'ayunan' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Pattern Selector Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  {[
                    { id: 'stringer', label: '1. Stringer Bead (Lurus)', icon: '━', desc: 'Tanpa ayunan, untuk akar pipa (root pass)' },
                    { id: 'zigzag', label: '2. Pola Zig-Zag', icon: '⚡', desc: 'Gerakan bolak-balik dengan jeda di sisi kampuh' },
                    { id: 'triangle', label: '3. Pola Segitiga (Triangle)', icon: '▲', desc: 'Khusus posisi vertikal naik (3G Upward)' },
                    { id: 'crescent', label: '4. Pola Bulan Sabit (Crescent)', icon: '🌙', desc: 'Ayunan melengkung untuk capping permukaan' },
                    { id: 'circular', label: '5. Pola Melingkar (Circular)', icon: '🔄', desc: 'Untuk mengisi celah kampuh yang lebar' }
                  ].map(w => (
                    <button
                      key={w.id}
                      onClick={() => { sound.playClick(); setWeavePattern(w.id); }}
                      style={{
                        flex: '1 1 180px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: weavePattern === w.id ? '2px solid #ea580c' : '1px solid #cbd5e1',
                        background: weavePattern === w.id ? '#ea580c' : '#ffffff',
                        color: weavePattern === w.id ? '#ffffff' : 'var(--text-main)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{w.label}</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>{w.desc}</span>
                    </button>
                  ))}
                </div>

                {/* SVG Visualizer for Weaving Motion */}
                <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  
                  <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>
                    SIMULASI TRAJEKTORI AYUNAN ELEKTRODA PADA ALUR KAMPUH LAS:
                  </div>

                  <svg viewBox="0 0 600 240" style={{ width: '100%', maxWidth: '650px', height: 'auto', maxHeight: '240px' }}>
                    {/* Groove Plates (Left & Right Beveled Steel) */}
                    <rect x="50" y="20" width="220" height="200" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                    <rect x="330" y="20" width="220" height="200" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                    
                    {/* Groove Gap (Kampuh V-Groove Celah 40px) */}
                    <rect x="270" y="20" width="60" height="200" fill="#020617" />
                    <line x1="270" y1="20" x2="270" y2="220" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="330" y1="20" x2="330" y2="220" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                    
                    <text x="160" y="45" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">PLAT KIRI</text>
                    <text x="440" y="45" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">PLAT KANAN</text>

                    {/* WEAVING PATH TRAILS */}
                    {weavePattern === 'stringer' && (
                      <g>
                        <line x1="300" y1="30" x2="300" y2="210" stroke="#f97316" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
                        <line x1="300" y1="30" x2="300" y2="210" stroke="#fef08a" strokeWidth="2" strokeDasharray="6 4" />
                        <circle cx="300" cy={30 + (animProgress / 100) * 180} r="8" fill="#ef4444" filter="drop-shadow(0 0 8px #ef4444)" />
                      </g>
                    )}

                    {weavePattern === 'zigzag' && (
                      <g>
                        <path
                          d="
                            M 275 30 L 325 50 L 275 70 L 325 90 L 275 110 L 325 130 L 275 150 L 325 170 L 275 190 L 325 210
                          "
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="5"
                          strokeLinecap="round"
                          opacity="0.5"
                        />
                        {[30, 70, 110, 150, 190].map(y => (
                          <circle key={y} cx="275" cy={y} r="5" fill="#10b981" />
                        ))}
                        {[50, 90, 130, 170, 210].map(y => (
                          <circle key={y} cx="325" cy={y} r="5" fill="#10b981" />
                        ))}
                        <text x="220" y="115" fill="#10b981" fontSize="10" fontWeight="bold">Jeda (Pause)</text>
                        <text x="345" y="135" fill="#10b981" fontSize="10" fontWeight="bold">Jeda (Pause)</text>
                      </g>
                    )}

                    {weavePattern === 'triangle' && (
                      <g>
                        <path
                          d="
                            M 275 190 L 300 160 L 325 190 L 275 150 L 300 120 L 325 150 L 275 110 L 300 80 L 325 110 L 275 70 L 300 40 L 325 70
                          "
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="5"
                          strokeLinecap="round"
                          opacity="0.5"
                        />
                        <text x="300" y="215" fill="#a855f7" fontSize="11" fontWeight="bold" textAnchor="middle">
                          ▲ ARAH NAIK VERTIKAL (3G UPWARD) ▲
                        </text>
                      </g>
                    )}

                    {weavePattern === 'crescent' && (
                      <g>
                        <path
                          d="
                            M 275 40 Q 300 60 325 40
                            M 275 80 Q 300 100 325 80
                            M 275 120 Q 300 140 325 120
                            M 275 160 Q 300 180 325 160
                            M 275 200 Q 300 220 325 200
                          "
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="5"
                          strokeLinecap="round"
                          opacity="0.6"
                        />
                      </g>
                    )}

                    {weavePattern === 'circular' && (
                      <g>
                        <path
                          d="
                            M 285 40 C 330 30, 330 65, 285 60 C 270 55, 270 45, 285 40
                            M 285 90 C 330 80, 330 115, 285 110 C 270 105, 270 95, 285 90
                            M 285 140 C 330 130, 330 165, 285 160 C 270 155, 270 145, 285 140
                            M 285 190 C 330 180, 330 215, 285 210 C 270 205, 270 195, 285 190
                          "
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="4"
                          opacity="0.6"
                        />
                      </g>
                    )}
                  </svg>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={() => setIsAnimatingWeave(!isAnimatingWeave)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isAnimatingWeave ? '#dc2626' : '#16a34a',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {isAnimatingWeave ? '⏸️ Jeda Animasi' : '▶️ Jalankan Animasi'}
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Kecepatan Gerak: Konsisten dengan jeda 0.5 detik di kedua tepi kampuh.
                    </span>
                  </div>
                </div>

                {/* Weaving Motion Educational Principle */}
                <div style={{ padding: '16px', background: '#f8fafc', borderLeft: '4px solid #ea580c', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontWeight: 900, fontSize: '0.9rem', color: '#0f172a' }}>
                    💡 HUKUM EMAS TEKNIK AYUNAN ELEKTRODA (WEAVING RULE):
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
                    • <strong>JEDA SEJENAK DI TEPI (PAUSE AT TOES):</strong> Juru las wajib berhenti sejenak (0.5 – 1 detik) di setiap dinding sisi kiri dan kanan kampuh agar cairan logam las mengisi penuh cerukan dan <strong>mencegah timbulnya cacat Undercut</strong>!<br />
                    • <strong>MELINTAS CEPAT DI TENGAH:</strong> Saat bergerak melintasi bagian tengah alur kampuh, gerakan harus dipercepat sedikit agar timbunan logam tidak menumpuk terlalu tinggi dan cembung membumbung.
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* STANDAR POSISI PENGELASAN 1G - 6G */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              🧭 Standarisasi Posisi Pengelasan Plat & Pipa (AWS D1.1 & ISO 6947)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>
              {[
                { code: '1G / 1F', name: 'Posisi Datar (Flat)', desc: 'Pengelasan paling mudah dan produktif. Gravitasi membantu cairan mengalir sempurna ke dasar celah.' },
                { code: '2G / 2F', name: 'Posisi Mendatar (Horizontal)', desc: 'Garis las horizontal pada plat tegak. Cairan cenderung melorot ke bawah, sudut elektroda diarahkan sedikit ke atas.' },
                { code: '3G / 3F', name: 'Posisi Tegak (Vertical)', desc: 'Vertical Up (dari bawah ke atas untuk plat tebal) atau Vertical Down (dari atas ke bawah untuk plat tipis).' },
                { code: '4G / 4F', name: 'Di Atas Kepala (Overhead)', desc: 'Tingkat kesulitan tinggi melawan gravitasi. Membutuhkan busur pendek ketat agar cairan tidak menetes jatuh.' },
                { code: '5G (Pipa)', name: 'Pipa Mendatar Tetap (Fixed Horizontal)', desc: 'Sumbu pipa diletakkan mendatar dan tidak boleh diputar. Juru las mengelas mengitari keliling pipa dari bawah ke atas.' },
                { code: '6G (Pipa)', name: 'Pipa Miring 45° Tetap (Incline 45°)', desc: 'Uji sertifikasi kualifikasi tertinggi seorang Welder. Menggabungkan semua posisi (1G, 2G, 3G, 4G) sekaligus dalam satu pipa miring.' }
              ].map((pos, idx) => (
                <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ea580c' }}>{pos.code}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#f8fafc', color: '#64748b', padding: '2px 6px', borderRadius: '4px' }}>AWS Code</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>{pos.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{pos.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* OAW FLAME TYPES GUIDE */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              🔥 3 Jenis Nyala Api Las Karbit / OAW (Oxy-Acetylene Flame)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', borderTop: '4px solid #10b981' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#065f46', marginBottom: '4px' }}>1. Api Netral (Rasio 1 : 1)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Perbandingan volume gas Asetilen dan Oksigen seimbang. Memiliki inti api bulat putih tumpul tanpa selubung karburasi (suhu ± 3.200°C). Digunakan untuk mengelas baja lunak, tembaga, dan besi cor.
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', borderTop: '4px solid #f59e0b' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#92400e', marginBottom: '4px' }}>2. Api Karburasi (Asetilen Berlebih)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Jumlah gas Asetilen lebih banyak daripada Oksigen. Memiliki tiga zona nyala (terdapat kerucut antara berwarna bulu kemerahan). Digunakan untuk pengerasan permukaan (hardfacing), las aluminium, dan timbal.
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', borderTop: '4px solid #3b82f6' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e40af', marginBottom: '4px' }}>3. Api Oksidasi (Oksigen Berlebih)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Jumlah gas Oksigen lebih banyak daripada Asetilen. Inti api lebih runcing, warna ungu kebiruan dengan suara desis tajam (suhu mencapai 3.300°C). Digunakan khusus untuk mengelas kuningan dan perunggu.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default WeldingTheoryGuide;

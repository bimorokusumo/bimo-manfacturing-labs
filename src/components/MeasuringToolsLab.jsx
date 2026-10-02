import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import { useAccessibility } from '../context/AccessibilityContext';
import { recordQuizResult } from '../services/sheetService';
import { getAssetUrl } from '../utils/assets';
import LabDiagnosticBanner from './LabDiagnosticBanner';

// =========================================================================
// DATA ANATOMI & KOMPONEN ALAT UKUR (STANDAR METROLOGI INDUSTRI & KURIKULUM MESIN)
// =========================================================================
const TOOL_ANATOMY_DATA = {
  vernier: {
    title: 'Jangka Sorong (Vernier Caliper)',
    standard: 'DIN 862 / ISO 13385-1',
    resolution: '0.05 mm & 0.02 mm',
    diagramImg: 'assets/images/measuring_tools/vernier_caliper_anatomy.svg',
    photoImg: 'assets/images/measuring_tools/vernier_caliper_real.jpg',
    photoCaption: 'Jangka Sorong Vernier Baja Tahan Karat Presisi dengan Rahang Pengukur Luar & Dalam',
    components: [
      {
        num: 1,
        name: 'Rahang Ukur Luar (External Jaws)',
        sub: 'Rahang Tetap & Rahang Geser Luar',
        desc: 'Digunakan untuk mengukur dimensi luar benda kerja seperti diameter luar silinder poros bubut, ketebalan pelat baja, lebar balok, dan dimensi panjang komponen.',
        tip: 'Rapatkan rahang tanpa menekan berlebihan untuk menghindari kesalahan lentur (Abbe error).'
      },
      {
        num: 2,
        name: 'Rahang Ukur Dalam (Internal Jaws)',
        sub: 'Rahang Atas Cakar Tirus',
        desc: 'Digunakan untuk mengukur diameter lubang dalam silinder poros, rongga tabung, celah alur pasak, atau lebar rongga internal dengan tingkat ketepatan tinggi.',
        tip: 'Pastikan sumbu cakar rahang tegak lurus sempurna terhadap diameter maksimum lubang silinder.'
      },
      {
        num: 3,
        name: 'Baut Pengunci (Locking Screw)',
        sub: 'Knurled Clamp Thumb Screw',
        desc: 'Berfungsi mengunci rahang geser pada posisinya setelah benda kerja dijepit, sehingga nilai ukuran tidak bergeser saat caliper diangkat untuk dibaca.',
        tip: 'Kencangkan secukupnya dengan jempol sebelum membaca skala di bawah penerangan lampu yang cukup.'
      },
      {
        num: 4,
        name: 'Skala Utama (Main Scale Beam)',
        sub: 'Batang Baja Berskala Milimeter & Inchi',
        desc: 'Batang utama kaku dengan penandaan garis skala milimeter (0 - 150 mm) pada bagian bawah dan inchi pada bagian atas. Menentukan nilai bilangan bulat.',
        tip: 'Garis nol skala nonius yang berada di sebelah kanan garis utama menentukan nilai milimeter utuh.'
      },
      {
        num: 5,
        name: 'Skala Nonius (Vernier Scale)',
        sub: 'Skala Pembagi Fraksi Ketelitian',
        desc: 'Skala tambahan pada rahang geser (20 pembagian untuk ketelitian 0.05 mm, atau 50 pembagian untuk ketelitian 0.02 mm) ciptaan Pierre Vernier.',
        tip: 'Cari satu garis nonius yang berimpit lurus sempurna dengan salah satu garis di skala utama.'
      },
      {
        num: 6,
        name: 'Tumpuan Jempol (Thumb Rest / Roller)',
        sub: 'Penahan Luncur Ergonomis',
        desc: 'Tonjolan bergerigi di bawah rahang geser untuk memudahkan ibu jari operator mendorong dan menarik rahang geser dengan gaya yang terkontrol halus.',
        tip: 'Gunakan dorongan konstan halus saat mendekati permukaan benda ukur.'
      },
      {
        num: 7,
        name: 'Tangkai Kedalaman (Depth Measuring Blade)',
        sub: 'Bilah Tipis Peluncur Belakang',
        desc: 'Bilah baja pipih di ujung ekor batang utama yang keluar secara proporsional sesuai bukaan rahang luar, khusus mengukur kedalaman lubang buta.',
        tip: 'Pastikan dasar bidang caliper menempel rata pada bibir lubang referensi.'
      },
      {
        num: 8,
        name: 'Bidang Bertingkat (Step Measuring Faces)',
        sub: 'Datum Muka Belakang Rahang',
        desc: 'Bidang ukur di kepala rahang geser dan rahang tetap untuk mengukur selisih ketinggian atau jarak undakan (step) antar permukaan bertingkat.',
        tip: 'Letakkan bidang referensi bawah menempel kokoh pada undakan pertama benda kerja.'
      }
    ]
  },
  micrometer: {
    title: 'Mikrometer Sekrup Luar (Outside Micrometer)',
    standard: 'DIN 863 / ISO 3611',
    resolution: '0.01 mm (Rentang 0 - 25 mm)',
    diagramImg: 'assets/images/measuring_tools/micrometer_anatomy.svg',
    photoImg: 'assets/images/measuring_tools/micrometer_real.jpg',
    photoCaption: 'Mikrometer Luar Baja Tempa dengan Landasan Karbida dan Raset Ratchet Stop Presisi',
    components: [
      {
        num: 1,
        name: 'Landasan Tetap (Anvil)',
        sub: 'Fixed Anvil with Carbide Tip',
        desc: 'Landasan diam yang menyatu dengan rangka busur U sebagai bidang datum referensi kontak pertama. Dilengkapi tip tungsten karbida tahan aus.',
        tip: 'Bersihkan selalu permukaan anvil dengan kertas halus sebelum kalibrasi nol.'
      },
      {
        num: 2,
        name: 'Poros Ukur Geser (Spindle)',
        sub: 'Precision Ground Spindle',
        desc: 'Silinder poros presisi yang bergerak maju-mundur digerakkan oleh ulir transmisi mikro berpresisi tinggi dengan kisar (pitch) tepat 0.50 mm.',
        tip: 'Jangan pernah memutar spindle hingga menabrak keras anvil tanpa mekanisme ratchet.'
      },
      {
        num: 3,
        name: 'Tuas Pengunci (Locking Lever / Nut)',
        sub: 'Spindle Lock Mechanism',
        desc: 'Tuas mekanis untuk mengunci gerakan spindel secara kokoh agar nilai posisi ukuran tidak bergeser saat mikrometer dilepaskan dari benda kerja.',
        tip: 'Kunci tuas hanya setelah ratchet berbunyi klik 2-3 kali.'
      },
      {
        num: 4,
        name: 'Silinder Tetap / Laras (Sleeve / Barrel)',
        sub: 'Inner Sleeve with Datum Line',
        desc: 'Silinder tabung tetap yang memuat garis datum acuan horizontal, skala milimeter bulat di sisi atas, dan skala setengah milimeter (0.50 mm) di sisi bawah.',
        tip: 'Perhatikan apakah garis 0.5 mm di bawah garis datum sudah tampak terbuka atau belum.'
      },
      {
        num: 5,
        name: 'Bidal / Tabung Putar (Thimble)',
        sub: 'Rotating Thimble with Vernier Scale',
        desc: 'Silinder putar keliling yang memuat 50 garis pembagian skala nonius. 1 putaran penuh memajukan spindle sejauh 0.5 mm, sehingga 1 garis bernilai 0.01 mm.',
        tip: 'Baca garis thimble yang tepat berimpit dengan garis horizontal tengah sleeve.'
      },
      {
        num: 6,
        name: 'Gigi Gelincir / Raset (Ratchet Stop)',
        sub: 'Constant Measuring Force Mechanism',
        desc: 'Mekanisme gesek pegas di ujung bidal yang selip saat tekanan penjepitan mencapai 5 s.d. 10 Newton untuk menjamin gaya ukur konstan seragam.',
        tip: 'WAJIB diputar 2-3 kali klik saat mendekati kontak benda ukur untuk hasil sahih.'
      },
      {
        num: 7,
        name: 'Rangka Busur U (Bow Frame)',
        sub: 'Drop Forged Rigid Steel Frame',
        desc: 'Rangka baja tempa kaku berkekuatan tinggi yang menahan deformasi lentur elastis saat poros spindel menjepit benda kerja.',
        tip: 'Gunakan stand mikrometer jika mengukur benda lepas untuk kestabilan maksimum.'
      },
      {
        num: 8,
        name: 'Pelat Isolator Panas (Thermal Insulator Pad)',
        sub: 'Heat Protection Grip',
        desc: 'Pelat plastik isolator termal pada lengkungan rangka U untuk mencegah perpindahan panas tubuh dari jari operator yang dapat memuai rangka mikron.',
        tip: 'Pegang mikrometer hanya pada bagian isolator ini saat pengukuran berlangsung.'
      }
    ]
  },
  height: {
    title: 'Vernier Height Gauge (Pengukur Ketinggian Presisi)',
    standard: 'DIN 862 / ISO 13225',
    resolution: '0.02 mm (Rentang 0 - 300 mm)',
    diagramImg: 'assets/images/measuring_tools/height_gauge_anatomy.svg',
    photoImg: 'assets/images/measuring_tools/height_gauge_real.jpg',
    photoCaption: 'Vernier Height Gauge Tegak di Atas Meja Perata Granit Hitam Presisi',
    components: [
      {
        num: 1,
        name: 'Landasan Basis Berat (Heavy Cast Base)',
        sub: 'Ground Flat Reference Base',
        desc: 'Basis logam cor masif dengan permukaan bawah yang di-lap super rata agar meluncur mulus dan stabil di atas meja perata granit tanpa goyangan.',
        tip: 'Jaga kebersihan dasar landasan dan meja granit dari butiran gram/tatal bubut.'
      },
      {
        num: 2,
        name: 'Tiang Batang Kolom (Main Vertical Beam)',
        sub: 'Rigid Column with Main Scale',
        desc: 'Kolom vertikal baja tegak lurus sempurna 90° terhadap basis, memuat skala utama milimeter dengan ketepatan garis tinggi.',
        tip: 'Pastikan kolom tiang tidak mengalami benturan yang dapat merusak ketegaklurusan.'
      },
      {
        num: 3,
        name: 'Peluncur Skala Nonius (Vernier Slider / Carriage)',
        sub: 'Movable Measuring Carriage',
        desc: 'Rumah blok geser yang meluncur naik-turun sepanjang kolom tiang membawa skala nonius pembacaan beresolusi 0.02 mm.',
        tip: 'Ketinggian dibaca dari perpaduan garis nol nonius dan skala tiang utama.'
      },
      {
        num: 4,
        name: 'Cakar Penggores Karbida (Carbide Scriber)',
        sub: 'Carbide-Tipped Measuring & Marking Jaw',
        desc: 'Rahang pengukur dengan ujung mata karbida tajam untuk mengukur ketinggian permukaan sekaligus melukis garis acuan tata letak (marking out).',
        tip: 'Gunakan permukaan bawah scriber untuk pengukuran datum tinggi ke meja.'
      },
      {
        num: 5,
        name: 'Baut Pengunci Utama (Main Slider Lock Screw)',
        sub: 'Coarse Lock Clamp',
        desc: 'Baut penjepit untuk mengunci posisi peluncur setelah didekatkan secara kasar ke posisi ketinggian benda kerja.',
        tip: 'Kunci baut penyetel halus terlebih dahulu sebelum mengunci baut utama.'
      },
      {
        num: 6,
        name: 'Sekrup Penyetel Halus (Fine Adjustment Feed Screw)',
        sub: 'Micrometer Feed Wheel & Screw',
        desc: 'Roda ulir transmisi mikro untuk menggeser scriber naik atau turun secara sangat lambat dan presisi hingga garis skala berimpit sempurna.',
        tip: 'Sangat vital untuk menyetel titik sentuh scriber pada permukaan toleransi ketat.'
      },
      {
        num: 7,
        name: 'Meja Rata Granit (Granite Surface Plate)',
        sub: 'Primary Datum Reference Plane',
        desc: 'Meja batu granit alam hitam berkerataan Grade 00 yang menjadi datum referensi nol mutlak untuk seluruh pengukuran height gauge.',
        tip: 'Height gauge tidak dapat difungsikan tanpa meja perata granit terstandardisasi.'
      }
    ]
  },
  dial: {
    title: 'Dial Indikator (Jam Ukur Presisi)',
    standard: 'DIN 878 / ISO 463',
    resolution: '0.01 mm (Rentang 0 - 10 mm)',
    diagramImg: 'assets/images/measuring_tools/dial_indicator_anatomy.svg',
    photoImg: 'assets/images/measuring_tools/dial_indicator_real.jpg',
    photoCaption: 'Pengujian Kebulatan dan Run-Out Poros Silinder Menggunakan Dial Indicator',
    components: [
      {
        num: 1,
        name: 'Cincin Putar Luar (Rotatable Bezel)',
        sub: 'Outer Bezel with Clamping Screw',
        desc: 'Cincin luar piringan dial yang dapat diputar 360° bersama kaca pelindung untuk menyejajarkan angka 0 tepat pada posisi awal jarum penunjuk (zeroing).',
        tip: 'Kencangkan baut pengunci bezel setelah jarum nol diposisikan.'
      },
      {
        num: 2,
        name: 'Piringan Skala Dial (Dial Face 0 - 100)',
        sub: 'Graduated Dial Plate (100 Divisions)',
        desc: 'Piringan jam berskala 0 hingga 100 dengan pembagian 0.01 mm per garis. Satu putaran penuh jarum utama (360°) mewakili pergeseran linier 1.00 mm.',
        tip: 'Skala dibuat dua arah (searah dan berlawanan jarum jam) untuk kemudahan komparasi.'
      },
      {
        num: 3,
        name: 'Jarum Penunjuk Utama (Main Long Pointer)',
        sub: 'High Ratio Amplified Needle',
        desc: 'Jarum penunjuk panjang yang digerakkan oleh mekanisme roda gigi presisi (gear train) dengan rasio pembesaran hingga ~300 kali gerak spindel.',
        tip: 'Amati arah putaran jarum untuk mengetahui penyimpangan cembung (+) atau cekung (-).'
      },
      {
        num: 4,
        name: 'Jarum Penghitung Putaran (Revolution Counter)',
        sub: 'Small Sub-Dial Hand (0 - 10 mm)',
        desc: 'Jarum kecil pada sub-dial yang mencatat berapa putaran penuh jarum besar telah berputar, menunjukkan total jarak pergeseran dalam milimeter utuh.',
        tip: 'Cegah kesalahan hitung kelipatan 1 mm saat jarum besar berputar berkali-kali.'
      },
      {
        num: 5,
        name: 'Batang Leher Penjepit (Stem Ø8 mm)',
        sub: 'Precision Clamping Sleeve',
        desc: 'Silinder baja tahan karat berdiameter luar standar Ø8 mm h6 untuk dipasang pada lubang klem magnetic base stand atau pemegang perkakas mesin.',
        tip: 'Jepit pada bagian stem dengan kencang merata, hindari menjepit poros spindle bergerak.'
      },
      {
        num: 6,
        name: 'Ujung Sensor Sentuh / Stylus (Contact Point)',
        sub: 'Replaceable Carbide Ball Tip',
        desc: 'Ujung kontak sensor berupa bola karbida halus yang bersentuhan langsung dengan permukaan benda kerja. Dapat diganti dengan model rol/pipih.',
        tip: 'Posisikan spindle sedapat mungkin tegak lurus (90°) dengan permukaan benda ukur.'
      },
      {
        num: 7,
        name: 'Penanda Batas Toleransi (Limit Markers)',
        sub: 'Adjustable Red Tolerance Pointers',
        desc: 'Dua jarum penanda merah yang dapat digeser di sekeliling bezel untuk menandai batas atas (Upper Limit) dan batas bawah (Lower Limit) toleransi produk.',
        tip: 'Memudahkan inspeksi Quality Control (QC) massal secara visual lulus/gagal (Go / No-Go).'
      },
      {
        num: 8,
        name: 'Dudukan Kupingan Belakang (Lug Back)',
        sub: 'Rear Mounting Bracket',
        desc: 'Plat tutup belakang dengan lubang baut kupingan sebagai opsi pemasangan alternatif ke batang articulated arm magnetic stand.',
        tip: 'Gunakan lug back jika ruang penjepitan leher stem terbatas di area mesin.'
      }
    ]
  },
  feeler: {
    title: 'Feeler Gauge (Kaliber Celah Presisi)',
    standard: 'DIN 2275 / ISO 3932',
    resolution: 'Bilah 0.02 mm s.d. 1.00 mm',
    diagramImg: 'assets/images/measuring_tools/feeler_gauge_anatomy.svg',
    photoImg: 'assets/images/measuring_tools/feeler_gauge_real.jpg',
    photoCaption: 'Bilah Baja Pegas Feeler Gauge Mengembang Rapi dengan Markings Laser Etched',
    components: [
      {
        num: 1,
        name: 'Bilah Baja Pegas Presisi (Steel Leaves / Blades)',
        sub: 'Hardened & Tempered Carbon Spring Steel',
        desc: 'Lembaran baja tipis berkualitas tinggi yang dikeraskan dan ditemper dengan toleransi ketebalan sangat ketat. Memiliki elastisitas tinggi anti-patah.',
        tip: 'Jangan pernah menekuk bilah dengan sudut tajam atau memaksanya masuk ke celah sempit.'
      },
      {
        num: 2,
        name: 'Cangkang / Rangka Pelindung (Protective Steel Shell)',
        sub: 'Foldable Protective Casing',
        desc: 'Gagang penutup baja berprofil U yang melindungi bilah-bilah tipis dari tekukan, debu kasar, dan benturan saat disimpan di kotak perkakas.',
        tip: 'Lipat kembali seluruh bilah ke dalam rangka setelah selesai digunakan.'
      },
      {
        num: 3,
        name: 'Mur / Baut Poros Pengunci (Knurled Locking Nut)',
        sub: 'Adjustable Pivot Screw',
        desc: 'Baut pengencang berulir halus di titik engsel bilah untuk mengatur kelonggaran ayunan bilah atau mengunci bilah tertentu agar tetap terbuka.',
        tip: 'Longgarkan sedikit mur saat memilah bilah, kencangkan kembali saat inspeksi.'
      },
      {
        num: 4,
        name: 'Grafir Ukuran Tebal (Laser-Etched Markings)',
        sub: 'Metric & Inch Nominal Markings',
        desc: 'Penulisan nominal ketebalan bilah dengan grafir permanen tahan luntur dalam satuan milimeter (mm) dan seperseribu inchi (inch).',
        tip: 'Jika tulisan grafir aus atau terhapus karat, ukur ulang tebal bilah dengan mikrometer.'
      },
      {
        num: 5,
        name: 'Ujung Bilah Membulat (Rounded Inspection Tip)',
        sub: 'Smooth Radius Leading Edge',
        desc: 'Ujung daun bilah dibentuk radius tumpul halus agar dapat diselipkan ke celah sempit tanpa mencakar atau merusak permukaan komponen mesin.',
        tip: 'Masukkan bilah secara sejajar searah bidang celah celah.'
      },
      {
        num: 6,
        name: 'Sensasi Luncur (Tactile Slight Drag / Snug Fit)',
        sub: 'Standard Inspection Technique',
        desc: 'Sensasi sentuhan baku metrologi: bilah harus masuk dengan hambatan luncur halus (seperti menarik lembar kertas dari sela buku tebal).',
        tip: 'Jika bilah longgar tanpa hambatan = celah lebih besar; jika harus ditekan keras = celah terlalu sempit.'
      }
    ]
  },
  block: {
    title: 'Gauge Block (Blok Ukur Presisi Johansson)',
    standard: 'ISO 3650 (Grade 0, 1, 2)',
    resolution: 'Akurasi Sub-Mikron (±0.0001 mm)',
    diagramImg: 'assets/images/measuring_tools/gauge_block_anatomy.svg',
    photoImg: 'assets/images/measuring_tools/gauge_blocks_real.jpg',
    photoCaption: 'Set Blok Ukur Baja Presisi dalam Kotak Kayu Bersama Dua Blok Wrung Seamless',
    components: [
      {
        num: 1,
        name: 'Muka Ukur Optik Cermin (Mirror Measuring Faces)',
        sub: 'Ultra-Flat Lapped Faces (Ra < 0.01 µm)',
        desc: 'Dua permukaan berlawanan yang dihaluskan dengan proses lapping super presisi hingga mencapai kerataan optik sub-mikron bebas gelombang.',
        tip: 'Dilarang keras menyentuh muka ukur cermin dengan jari telanjang (keringat asam memicu karat pitting).'
      },
      {
        num: 2,
        name: 'Grafir Dimensi Nominal (Nominal Dimension Engraving)',
        sub: 'Laser Etched Size Standard @ 20°C',
        desc: 'Angka nominal ukuran panjang balok yang terkalibrasi tepat pada suhu standar internasional 20°C (68°F), misalnya 20.000 mm atau 1.005 mm.',
        tip: 'Selalu lakukan perhitungan kombinasi balok dari digit desimal terkecil.'
      },
      {
        num: 3,
        name: 'Bidang Samping Non-Ukur (Side Datum Faces)',
        sub: 'Side Handling & Identification Faces',
        desc: 'Permukaan sisi samping balok tempat memegang balok dengan sarung tangan katun, memuat nomor seri pabrikan dan tanda grade akurasi.',
        tip: 'Pegang blok hanya pada bidang samping non-ukur ini.'
      },
      {
        num: 4,
        name: 'Lapisan Film Wringing (Molecular Adhesion Interface)',
        sub: 'Van der Waals Molecular Force Binding',
        desc: 'Bidang kontak antar dua blok yang saling melekat sangat kuat akibat gaya tarik molekuler Van der Waals dan lapisan film minyak ultra-tipis.',
        tip: 'Lakukan teknik pelengketan: silang 90°, tekan perlahan, putar searah hingga sejajar.'
      },
      {
        num: 5,
        name: 'Tepi Bevel Pengaman (Safety Chamfered Edges)',
        sub: 'Micro-Chamfered Corner Protection',
        desc: 'Sudut-sudut tepi balok dibuat tirus halus (chamfer) untuk mencegah timbulnya tonjolan tajam (burr) yang dapat merusak kerataan saat wringing.',
        tip: 'Periksa tepi balok terhadap goresan sebelum menggabungkan dua blok.'
      },
      {
        num: 6,
        name: 'Grade Presisi ISO 3650 (Accuracy Classification)',
        sub: 'Grade 00, Grade 0, Grade 1, Grade 2',
        desc: 'Tingkat akurasi internasional: Grade 0 (standar kalibrasi mikrometer/caliper), Grade 1 (toolroom bengkel), Grade 2 (lantai produksi mesin).',
        tip: 'Blok ukur Grade 0 wajib dikalibrasi ulang berkala oleh laboratorium metrologi terakreditasi.'
      }
    ]
  }
};

// =========================================================================
// KOMPONEN TAMPILAN ANATOMI & KOMPONEN ALAT UKUR (INTERAKTIF & RESPONSIF)
// =========================================================================
const ToolAnatomySection = ({ toolKey, onOpenModal }) => {
  const data = TOOL_ANATOMY_DATA[toolKey];
  const [viewMode, setViewMode] = useState('diagram'); // 'diagram' or 'photo'
  const [activeCompNum, setActiveCompNum] = useState(1);

  if (!data) return null;

  const currentImage = viewMode === 'diagram' ? data.diagramImg : data.photoImg;
  const currentTitle = viewMode === 'diagram' ? `Diagram Anatomi & Komponen: ${data.title}` : `Foto Fisik & Kalibrasi: ${data.title}`;
  const currentCaption = viewMode === 'diagram'
    ? 'Diagram Teknik Skematik Vektor dengan Penomoran Komponen Anatomi Standar Industri'
    : data.photoCaption;

  const activeComponent = data.components.find(c => c.num === activeCompNum) || data.components[0];

  return (
    <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* SECTION HEADER & VIEW CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.3rem' }}>🔬</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
              Anatomi &amp; Komponen: {data.title}
            </h3>
            <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#047857', fontSize: '0.72rem', fontWeight: 800 }}>
              {data.standard}
            </span>
            <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', fontSize: '0.72rem', fontWeight: 800 }}>
              {data.resolution}
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Pelajari setiap komponen struktural instrumen pengukuran melalui diagram skematik berlabel dan foto fisik asli.
          </p>
        </div>

        {/* TOGGLE BUTTONS */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('diagram');
            }}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: viewMode === 'diagram' ? '1.5px solid #10b981' : '1px solid var(--border-light)',
              background: viewMode === 'diagram' ? '#10b981' : 'var(--bg-card)',
              color: viewMode === 'diagram' ? '#000000' : 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>📐</span>
            <span>Diagram Anatomi Berlabel</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setViewMode('photo');
            }}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: viewMode === 'photo' ? '1.5px solid #0284c7' : '1px solid var(--border-light)',
              background: viewMode === 'photo' ? '#0284c7' : 'var(--bg-card)',
              color: viewMode === 'photo' ? '#ffffff' : 'var(--text-main)',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>📸</span>
            <span>Foto Fisik Nyata (HD)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              if (onOpenModal) {
                onOpenModal({
                  src: currentImage,
                  title: currentTitle,
                  caption: currentCaption
                });
              }
            }}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-main)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="Perbesar gambar ke layar penuh"
          >
            <span>🔍</span>
            <span>Perbesar HD</span>
          </button>
        </div>
      </div>

      {/* IMAGE DISPLAY CONTAINER */}
      <div 
        onClick={() => {
          sound.playClick();
          if (onOpenModal) {
            onOpenModal({
              src: currentImage,
              title: currentTitle,
              caption: currentCaption
            });
          }
        }}
        title="Klik gambar untuk memperbesar ke layar penuh"
        style={{
          position: 'relative',
          background: '#070f1e',
          borderRadius: '12px',
          border: '1.5px solid #1e293b',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'zoom-in',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', padding: '5px 10px', borderRadius: '6px', border: '1px solid #334155', fontSize: '0.72rem', color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>🔍</span>
          <span>Klik untuk Perbesar</span>
        </div>

        <img
          src={getAssetUrl(currentImage)}
          alt={currentTitle}
          style={{
            maxWidth: '100%',
            height: 'auto',
            maxHeight: '440px',
            objectFit: 'contain',
            borderRadius: '8px',
            transition: 'transform 0.25s ease'
          }}
        />

        <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', fontWeight: 600 }}>
          {currentCaption}
        </div>
      </div>

      {/* INTERACTIVE COMPONENT SELECTOR BUTTONS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚙️</span>
            <span>Rincian Komponen &amp; Fungsinya (Pilih Nomor Komponen):</span>
          </h4>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Nomor pada tombol sesuai dengan penomoran pada diagram di atas</span>
        </div>

        {/* Component Badges Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {data.components.map(c => {
            const isSelected = activeCompNum === c.num;
            return (
              <button
                key={c.num}
                onClick={() => {
                  sound.playClick();
                  setActiveCompNum(c.num);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: isSelected ? '1.5px solid #10b981' : '1px solid var(--border-light)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                  color: isSelected ? '#047857' : 'var(--text-main)',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: isSelected ? '#10b981' : '#334155',
                  color: isSelected ? '#000000' : '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 900
                }}>
                  {c.num}
                </span>
                <span>{c.name.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Component Detailed Spotlight Card */}
        {activeComponent && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1.5px solid #10b981',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#10b981',
                    color: '#000000',
                    fontSize: '0.8rem',
                    fontWeight: 900
                  }}>
                    {activeComponent.num}
                  </span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>
                    {activeComponent.name}
                  </strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, marginLeft: '32px', marginTop: '2px' }}>
                  Istilah Teknis: {activeComponent.sub}
                </div>
              </div>

              <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.1)', color: '#047857', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Komponen Aktif #{activeComponent.num}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.55 }}>
              {activeComponent.desc}
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #f59e0b',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: '#334155'
            }}>
              <strong style={{ color: '#b45309' }}>💡 Kaidah Presisi &amp; Perawatan:</strong> {activeComponent.tip}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// =========================================================================
// DATA METROLOGI: KLASIFIKASI ALAT UKUR LANGSUNG VS PEMBANDING
// =========================================================================
const METROLOGY_TOOLS = [
  {
    id: 'vernier',
    name: 'Jangka Sorong',
    enName: 'Vernier Caliper',
    icon: '📏',
    res: '0.05 / 0.02 mm',
    category: 'direct',
    categoryLabel: 'Ukur Langsung',
    badgeColor: '#047857',
    badgeBg: '#ecfdf5',
    borderBadge: '#10b981',
    desc: 'Membaca langsung dimensi luar, dalam, dan kedalaman dari nol.'
  },
  {
    id: 'micrometer',
    name: 'Mikrometer Sekrup',
    enName: 'Outside Micrometer',
    icon: '🔬',
    res: '0.01 mm',
    category: 'direct',
    categoryLabel: 'Ukur Langsung',
    badgeColor: '#047857',
    badgeBg: '#ecfdf5',
    borderBadge: '#10b981',
    desc: 'Membaca langsung ketebalan presisi tinggi dengan ulir transmisi mikro.'
  },
  {
    id: 'height',
    name: 'Vernier Height Gauge',
    enName: 'Height Gauge',
    icon: '📐',
    res: '0.02 mm',
    category: 'direct',
    categoryLabel: 'Ukur Langsung',
    badgeColor: '#047857',
    badgeBg: '#ecfdf5',
    borderBadge: '#10b981',
    desc: 'Membaca langsung ketinggian benda ukur di atas meja perata granit.'
  },
  {
    id: 'dial',
    name: 'Dial Indikator',
    enName: 'Dial Gauge / Runout',
    icon: '⏱️',
    res: '0.01 mm / TIR',
    category: 'comparator',
    categoryLabel: 'Alat Pembanding',
    badgeColor: '#b45309',
    badgeBg: '#fef3c7',
    borderBadge: '#f59e0b',
    desc: 'Mengukur deviasi/penyimpangan, keolengan (TIR), dan kerataan permukaan.'
  },
  {
    id: 'feeler',
    name: 'Feeler Gauge',
    enName: 'Thickness Clearance Gauge',
    icon: '🪒',
    res: 'Celah Presisi',
    category: 'reference',
    categoryLabel: 'Kaliber Celah',
    badgeColor: '#6d28d9',
    badgeBg: '#f5f3ff',
    borderBadge: '#8b5cf6',
    desc: 'Memeriksa celah celah presisi (valve clearance, gap ring piston).'
  },
  {
    id: 'block',
    name: 'Gauge Block',
    enName: 'Johansson Gauge Block',
    icon: '🧱',
    res: 'Master Kalibrasi',
    category: 'reference',
    categoryLabel: 'Standar Acuan Master',
    badgeColor: '#0369a1',
    badgeBg: '#e0f2fe',
    borderBadge: '#0ea5e9',
    desc: 'Blok standar acuan presisi tertinggi untuk kalibrasi dan setting alat pembanding.'
  },
  {
    id: 'quiz',
    name: 'Kuis Asesmen Membaca',
    enName: 'Metrology Quiz & Evaluation',
    icon: '🏆',
    res: 'XP & Evaluasi',
    category: 'evaluation',
    categoryLabel: 'Uji Kompetensi',
    badgeColor: '#be123c',
    badgeBg: '#ffe4e6',
    borderBadge: '#f43f5e',
    desc: 'Uji kemampuan membaca skala vernier, mikrometer, dan dial gauge.'
  }
];

const MeasuringToolsLab = ({
  addXP = () => {},
  addMissionCompleted = () => {},
  onOpenDiagnostic,
  initialTab = 'simulator',
  initialTool = 'vernier',
  initialCategoryFilter = 'all'
}) => {
  const [activeTool, setActiveTool] = useState(initialTool || 'vernier');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter); // 'all', 'direct', 'comparator', 'reference', 'evaluation'
  const [showComparisonGuide, setShowComparisonGuide] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialTool) {
      setActiveTool(initialTool);
    }
  }, [initialTool]);

  useEffect(() => {
    if (initialCategoryFilter) {
      setCategoryFilter(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);
  
  // ==========================================
  // 1. JANGKA SORONG STATE (VERNIER CALIPER)
  // ==========================================
  const [caliperValue, setCaliperValue] = useState(18.45); // in mm
  const [caliperResolution, setCaliperResolution] = useState(0.05); // 0.05 mm or 0.02 mm
  const [caliperWorkpiece, setCaliperWorkpiece] = useState('outer-shaft'); // outer-shaft, inner-hole, plate, depth-step, none
  const [showCaliperReadout, setShowCaliperReadout] = useState(true);
  const [caliperUnit, setCaliperUnit] = useState('mm'); // 'mm' or 'inch'
  const [caliperZeroOffset, setCaliperZeroOffset] = useState(0);

  // ==========================================
  // 2. MIKROMETER SEKRUP STATE (0-25 mm)
  // ==========================================
  const [microValue, setMicroValue] = useState(7.74); // in mm (0 to 25) - default 7.74 mm matches textbook reference diagram
  const [microWorkpiece, setMicroWorkpiece] = useState('bearing-ball');
  const [microReadingMode, setMicroReadingMode] = useState('standard'); // 'standard' or 'simple'
  const [showMicroReadout, setShowMicroReadout] = useState(true);
  const [isRatchetClicking, setIsRatchetClicking] = useState(false);
  const [microViewMode, setMicroViewMode] = useState('detail'); // 'detail' (close-up like reference image), 'full' (whole micrometer), 'both'
  const [microShowGuides, setMicroShowGuides] = useState(true); // show alignment guidelines and annotations

  // ==========================================
  // 3. HEIGHT GAUGE STATE (0-150 mm)
  // ==========================================
  const [heightValue, setHeightValue] = useState(45.50); // in mm (0 to 100)
  const [scribedLines, setScribedLines] = useState([25.0, 50.0]); // marks on workpiece
  const [isScribing, setIsScribing] = useState(false);
  const [showHeightReadout, setShowHeightReadout] = useState(true);

  // ==========================================
  // 4. DIAL INDIKATOR STATE (0-10 mm / 0.01 mm)
  // ==========================================
  const [dialDeflection, setDialDeflection] = useState(1.45); // in mm
  const [dialBezelOffset, setDialBezelOffset] = useState(0); // rotation offset for zeroing
  const [dialToleranceMin, setDialToleranceMin] = useState(-0.05);
  const [dialToleranceMax, setDialToleranceMax] = useState(+0.05);
  const [isTestingRunout, setIsTestingRunout] = useState(false);
  const [runoutHistory, setRunoutHistory] = useState([]);
  const [shaftAngle, setShaftAngle] = useState(0);
  const [shaftEccentricity, setShaftEccentricity] = useState(0.04); // 0.04 mm runout amplitude
  const [showDialReadout, setShowDialReadout] = useState(true);
  const runoutAnimRef = useRef(null);

  // ==========================================
  // 5. FEELER GAUGE STATE
  // ==========================================
  const availableBlades = [0.02, 0.03, 0.04, 0.05, 0.08, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.75, 1.00];
  const [selectedBlades, setSelectedBlades] = useState([0.15, 0.20]);
  const [simulatedGap, setSimulatedGap] = useState(0.35); // target gap
  const [gapInspectionResult, setGapInspectionResult] = useState(null); // 'tight', 'snug', 'loose'
  const [gapMode, setGapMode] = useState('valve'); // valve, sparkplug, piston

  // ==========================================
  // 6. GAUGE BLOCK STATE (BLOK UKUR)
  // ==========================================
  const [wringStep, setWringStep] = useState(0); // 0: clean, 1: cross, 2: twist, 3: wringed
  const [targetBlockDimension, setTargetBlockDimension] = useState(38.425);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const standardBlocks = [
    // 0.001 series
    1.001, 1.002, 1.005, 1.009,
    // 0.01 series
    1.01, 1.05, 1.12, 1.20, 1.37, 1.42,
    // 0.5 / 1.0 series
    1.5, 2.0, 3.0, 5.0, 7.0, 10.0,
    // Base series
    20.0, 30.0, 50.0, 75.0, 100.0
  ];

  // ==========================================
  // 7. QUIZ / EVALUATION STATE
  // ==========================================
  const quizQuestions = [
    {
      id: 1,
      tool: 'Jangka Sorong (0.05 mm)',
      question: 'Berapakah hasil pembacaan jangka sorong jika garis nol skala nonius berada di antara 24 mm dan 25 mm pada skala utama, dan garis nonius ke-7 berimpit tepat dengan skala utama?',
      options: ['24.35 mm', '24.70 mm', '24.07 mm', '25.35 mm'],
      correct: 0,
      explanation: 'Skala Utama = 24.00 mm. Skala Nonius = garis ke-7 x 0.05 mm = 0.35 mm. Total = 24.00 + 0.35 = 24.35 mm.'
    },
    {
      id: 2,
      tool: 'Mikrometer Sekrup (0.01 mm)',
      question: 'Pada mikrometer sekrup 0-25 mm, garis skala sleeve menunjukkan angka 12 mm dan garis 0.5 mm di bawahnya sudah terlihat jelas. Garis thimble yang segaris dengan garis tengah sleeve menunjukkan angka 28. Berapakah ukuran totalnya?',
      options: ['12.28 mm', '12.78 mm', '12.50 mm', '13.28 mm'],
      correct: 1,
      explanation: 'Sleeve atas = 12.00 mm. Sleeve bawah = 0.50 mm (terlihat). Thimble = 28 x 0.01 mm = 0.28 mm. Total = 12.00 + 0.50 + 0.28 = 12.78 mm.'
    },
    {
      id: 3,
      tool: 'Dial Indikator (Jam Ukur)',
      question: 'Saat mengukur keolengan (runout/TIR) suatu poros silinder yang berputar 360°, jarum panjang dial indikator bergerak dari posisi minimum -0.04 mm ke posisi maksimum +0.08 mm. Berapakah nilai Total Indicator Reading (TIR)?',
      options: ['0.04 mm', '0.08 mm', '0.12 mm', '0.06 mm'],
      correct: 2,
      explanation: 'TIR = Posisi Maksimum - Posisi Minimum = (+0.08 mm) - (-0.04 mm) = 0.12 mm.'
    },
    {
      id: 4,
      tool: 'Feeler Gauge (Kaliber Celah)',
      question: 'Bagaimanakah sensasi sentuhan (feeling tactile) yang benar saat memasukkan bilah feeler gauge ke dalam celah katup motor (valve clearance)?',
      options: [
        'Bilah harus masuk dengan sangat longgar tanpa gesekan sama sekali',
        'Bilah terasa ada hambatan luncur halus (slight drag/snug) seperti menarik kertas dari buku tebal',
        'Bilah harus dipukul perlahan atau dipaksa agar masuk ke celah',
        'Bilah boleh tertekuk asalkan dapat menembus celah'
      ],
      correct: 1,
      explanation: 'Sensasi yang benar menurut standar mekanik presisi adalah "slight drag" (geseran halus dan pas). Jangan terlalu longgar atau terlalu sempit dipaksa.'
    },
    {
      id: 5,
      tool: 'Gauge Block (Blok Ukur Presisi)',
      question: 'Fenomena fisika apakah yang menyebabkan dua blok ukur presisi dapat saling melekat sangat kuat setelah proses pelengketan (wringing process)?',
      options: [
        'Kemagnetan permanen pada baja blok ukur',
        'Gaya molekuler Van der Waals dan tegangan permukaan lapisan tipis oli/udara',
        'Reaksi kimia lem pelapis permukaan',
        'Gaya gravitasi antar benda padat'
      ],
      correct: 1,
      explanation: 'Dua permukaan blok ukur memiliki kehalusan super (optical flatness). Saat di-wring, gaya tarik antarmolekul (Van der Waals) dan tegangan kapiler lapisan tipis minyak pelindung menyatukan kedua blok dengan sangat kuat.'
    },
    {
      id: 6,
      tool: 'Vernier Height Gauge',
      question: 'Bidang referensi (datum) apakah yang mutlak wajib digunakan bersamaan dengan Vernier Height Gauge saat melakukan pengukuran atau penggoresan benda kerja presisi?',
      options: [
        'Meja las besi baja profil',
        'Meja perata granit (Granite Surface Plate) dengan tingkat kerataan tinggi',
        'Ragum mesin frais penjepit',
        'Lantai bengkel yang sudah dipel'
      ],
      correct: 1,
      explanation: 'Vernier Height Gauge harus diletakkan di atas Meja Perata Granit (Surface Plate) yang telah distandardisasi kerataannya sebagai datum referensi nol.'
    }
  ];

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Escape key listener to close modalImage
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalImage) {
        setModalImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalImage]);

  // Audio Narator Aksesibilitas & Inklusi
  const { speakText, stopSpeech, isSpeaking, currentNarrativeTitle } = useAccessibility();

  const getMeasuringNarration = () => {
    if (activeTab === 'theory') {
      const data = TOOL_ANATOMY_DATA[activeTool];
      if (data) {
        return `Anda sedang berada pada tab Anatomi dan Teori Metrologi untuk ${data.title}. Standar acuan instrumen ini adalah ${data.standard} dengan resolusi ketelitian ${data.resolution}. Di layar tersedia diagram teknik skematik berlabel penomoran komponen, serta foto fisik asli beresolusi tinggi. Anda dapat mengklik tombol nomor komponen untuk mempelajari fungsi detail serta kaidah perawatannya.`;
      }
    }
    switch (activeTool) {
      case 'vernier':
        return `Anda sedang menggunakan simulator Jangka Sorong atau Vernier Caliper dengan ketelitian ${caliperResolution} milimeter. Posisi pengukuran saat ini adalah ${caliperValue.toFixed(2)} milimeter. Rahang bawah mengukur diameter luar atau ketebalan pelat, rahang atas mengukur diameter dalam rongga pipa, dan batang ukur kedalaman di bagian ekor mengukur kedalaman lubang. Geser slider untuk mengubah ukuran.`;
      case 'micrometer':
        return `Anda sedang menggunakan simulator Mikrometer Sekrup Luar kapasitas 0 sampai 25 milimeter dengan ketelitian sangat tinggi yaitu 0.01 milimeter. Posisi pengukuran saat ini adalah ${microValue.toFixed(2)} milimeter. Putar ratchet silinder pemutar secara perlahan hingga menyentuh bidang benda kerja sampai berbunyi klik 2 hingga 3 kali.`;
      case 'height':
        return `Anda sedang menggunakan alat ukur Vernier Height Gauge atau Pengukur Ketinggian dengan ketelitian 0.02 milimeter. Ketinggian terukur saat ini adalah ${heightValue.toFixed(2)} milimeter. Rahang penggores karbida digunakan untuk menandai garis goresan presisi di atas meja perata granit.`;
      case 'dial':
        return `Anda sedang menggunakan Jam Ukur atau Dial Indikator dengan ketelitian 0.01 milimeter. Simpangan jarum jam ukur saat ini adalah ${dialDeflection.toFixed(2)} milimeter. Alat ukur komparatif ini mendeteksi penyimpangan kerataan, kebulatan, dan run-out poros saat diputar.`;
      case 'feeler':
        return `Anda sedang menggunakan Feeler Gauge atau Kaliber Celah. Celah simulasi yang sedang diuji berukuran ${simulatedGap.toFixed(2)} milimeter. Sisipkan kombinasi bilah baja presisi hingga terasa pas dan tidak longgar.`;
      case 'block':
        return `Anda sedang menggunakan Gauge Block atau Blok Ukur standar acuan metrologi presisi grade nol berukuran target ${targetBlockDimension.toFixed(3)} milimeter. Rangkai blok ukur menggunakan gerakan wringing menyilang hingga menempel sempurna tanpa lapisan udara.`;
      default:
        return 'Modul simulasi alat ukur dan metrologi presisi pemesinan.';
    }
  };

  const isSpeakingThisMeasure = isSpeaking && currentNarrativeTitle === `Alat Ukur: ${activeTool}`;

  const handleToggleMeasureAudio = () => {
    const title = `Alat Ukur: ${activeTool}`;
    if (isSpeaking && currentNarrativeTitle === title) {
      stopSpeech();
    } else {
      speakText(getMeasuringNarration(), title);
    }
  };

  // ==========================================
  // RUNOUT ANIMATION LOOP (DIAL INDICATOR)
  // ==========================================
  useEffect(() => {
    if (!isTestingRunout) {
      if (runoutAnimRef.current) cancelAnimationFrame(runoutAnimRef.current);
      return;
    }

    let angle = shaftAngle;
    const animate = () => {
      angle = (angle + 3) % 360;
      setShaftAngle(angle);
      
      const rad = (angle * Math.PI) / 180;
      // Base deflection + sinusoidal runout + small high-frequency harmonic
      const currentRunout = shaftEccentricity * Math.sin(rad) + 0.008 * Math.sin(rad * 3);
      const newDeflection = 1.00 + currentRunout;
      setDialDeflection(newDeflection);

      setRunoutHistory(prev => {
        const next = [...prev, currentRunout * 1000]; // in microns
        if (next.length > 50) next.shift();
        return next;
      });

      runoutAnimRef.current = requestAnimationFrame(animate);
    };

    runoutAnimRef.current = requestAnimationFrame(animate);

    return () => {
      if (runoutAnimRef.current) cancelAnimationFrame(runoutAnimRef.current);
    };
  }, [isTestingRunout, shaftAngle, shaftEccentricity]);

  // Ratchet click sound effect helper
  const triggerRatchetClick = () => {
    sound.playClick();
    setIsRatchetClicking(true);
    setTimeout(() => setIsRatchetClicking(false), 150);
  };

  // ==========================================
  // CALIPER MATH HELPERS
  // ==========================================
  const caliperNetValue = Math.max(0, caliperValue - caliperZeroOffset);
  const caliperMainScale = Math.floor(caliperValue);
  const caliperRemainder = caliperValue - caliperMainScale;
  const caliperVernierIndex = Math.round(caliperRemainder / caliperResolution);
  const caliperVernierValue = caliperVernierIndex * caliperResolution;
  const caliperCoincidentIndex = caliperVernierIndex;
  const caliperLcdDisplay = caliperUnit === 'mm'
    ? caliperNetValue.toFixed(2)
    : (caliperNetValue / 25.4).toFixed(3);

  // ==========================================
  // MICROMETER MATH HELPERS (STANDARD & SIMPLE)
  // ==========================================
  const safeMicroVal = Math.round(microValue * 100) / 100;
  const microWholeMm = Math.floor(safeMicroVal);
  const microFraction = Math.round((safeMicroVal - microWholeMm) * 100) / 100;
  const microHalfMm = (microReadingMode === 'standard' && microFraction >= 0.5) ? 0.5 : 0.0;
  const microThimbleValue = microReadingMode === 'standard' 
    ? Math.round((microFraction - microHalfMm) * 100) / 100 
    : microFraction;
  const microThimbleDivisions = Math.round(microThimbleValue * 100);
  const microMainScale = microReadingMode === 'standard' ? (microWholeMm + microHalfMm) : microWholeMm;
  const microNoniusScale = Math.round(microThimbleDivisions) * 0.01;

  // ==========================================
  // FEELER GAUGE FIT CHECKER
  // ==========================================
  const checkFeelerFit = () => {
    const totalSelected = selectedBlades.reduce((sum, b) => sum + b, 0);
    const roundedSelected = Math.round(totalSelected * 100) / 100;
    const roundedGap = Math.round(simulatedGap * 100) / 100;
    
    sound.playClick();
    if (roundedSelected > roundedGap) {
      setGapInspectionResult('tight');
      sound.playError();
    } else if (Math.abs(roundedSelected - roundedGap) < 0.015) {
      setGapInspectionResult('snug');
      sound.playSuccess();
      addXP(15);
    } else {
      setGapInspectionResult('loose');
    }
  };

  // ==========================================
  // GAUGE BLOCK COMBINATION HELPER
  // ==========================================
  const currentBlockTotal = Math.round(selectedBlocks.reduce((a, b) => a + b, 0) * 1000) / 1000;
  const targetBlockRemaining = Math.round((targetBlockDimension - currentBlockTotal) * 1000) / 1000;

  const toggleBlockSelection = (val) => {
    sound.playClick();
    if (selectedBlocks.includes(val)) {
      setSelectedBlocks(selectedBlocks.filter(b => b !== val));
    } else {
      setSelectedBlocks([...selectedBlocks, val]);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      
      <LabDiagnosticBanner
        labTitle="Alat Ukur Presisi & Metrologi Industri"
        desc="Diagnosa 10 soal cara membaca jangka sorong (0.05/0.02 mm), mikrometer sekrup (0.01 mm), dial indicator, dan standar suhu ISO 1."
        onOpenDiagnostic={onOpenDiagnostic}
      />

      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 60%, #1e293b 100%)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
            fontSize: '1.8rem'
          }}>
            📐
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
                LAB METROLOGI & ALAT UKUR PRESISI
              </h2>
              <span style={{ background: '#10b981', color: '#000000', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                ISO 9001 / DIN COMPLIANT
              </span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
              Simulasi interaktif, visualisasi skala dinamis, SOP pengukuran bengkel mesin, dan uji kompetensi metrologi industri.
            </p>
          </div>
        </div>

        {/* QUICK STATS */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.5px' }}>INSTRUMEN TERSEDIA</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#34d399' }}>6 ALAT UTAMA</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '10px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.5px' }}>STANDAR SUHU</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fbbf24' }}>20°C (ISO 1)</div>
          </div>
        </div>
      </div>

      {/* FILTER KATEGORI: ALAT UKUR LANGSUNG VS PEMBANDING */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        padding: '12px 18px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🏷️ Kategori Metrologi:
          </span>
          {[
            { id: 'all', label: '🌐 Semua Alat (6+1)' },
            { id: 'direct', label: '📏 Alat Ukur Langsung Presisi (3)' },
            { id: 'comparator', label: '⏱️ Alat Ukur Pembanding & Acuan (3)' },
            { id: 'evaluation', label: '🏆 Kuis Asesmen (1)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                sound.playClick();
                setCategoryFilter(f.id);
                if (f.id === 'direct' && (activeTool === 'dial' || activeTool === 'feeler' || activeTool === 'block' || activeTool === 'quiz')) {
                  setActiveTool('vernier');
                } else if (f.id === 'comparator' && (activeTool === 'vernier' || activeTool === 'micrometer' || activeTool === 'height' || activeTool === 'quiz')) {
                  setActiveTool('dial');
                } else if (f.id === 'evaluation') {
                  setActiveTool('quiz');
                }
              }}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: categoryFilter === f.id ? '1.5px solid #10b981' : '1px solid var(--border-light)',
                background: categoryFilter === f.id ? '#10b981' : 'transparent',
                color: categoryFilter === f.id ? '#000000' : 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: categoryFilter === f.id ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* TOMBOL PANDUAN PERBEDAAN ALAT UKUR LANGSUNG VS PEMBANDING */}
        <button
          onClick={() => {
            sound.playClick();
            setShowComparisonGuide(!showComparisonGuide);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: showComparisonGuide ? '1.5px solid #f59e0b' : '1.5px solid #cbd5e1',
            background: showComparisonGuide ? '#fef3c7' : 'rgba(245, 158, 11, 0.1)',
            color: showComparisonGuide ? '#92400e' : '#b45309',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            boxShadow: showComparisonGuide ? '0 4px 12px rgba(245, 158, 11, 0.25)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <span>⚖️</span>
          <span>{showComparisonGuide ? 'Tutup Perbandingan' : 'Pahami Perbedaan: Langsung vs Pembanding'}</span>
        </button>
      </div>

      {/* PANDUAN EDUKASI INTERAKTIF: PERBEDAAN ALAT UKUR LANGSUNG VS PEMBANDING */}
      {showComparisonGuide && (
        <div className="dashboard-card" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>⚖️</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                  Klasifikasi Metrologi: Alat Ukur Langsung Presisi vs. Alat Ukur Pembanding
                </h3>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                Dalam metrologi industri dan teknik pemesinan, instrumen pengukuran diklasifikasikan berdasarkan <strong>metode pengukuran</strong> dan <strong>titik acuan (datum)</strong> yang digunakan.
              </p>
            </div>
            <button
              onClick={() => setShowComparisonGuide(false)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              ✕ Tutup
            </button>
          </div>

          {/* 3 PILAR PERBEDAAN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* 1. ALAT UKUR LANGSUNG */}
            <div style={{
              background: '#ecfdf5',
              border: '1.5px solid #10b981',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>📏</span>
                <div>
                  <h4 style={{ margin: 0, color: '#065f46', fontSize: '1rem', fontWeight: 900 }}>1. Alat Ukur Langsung Presisi</h4>
                  <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>DIRECT MEASURING INSTRUMENTS</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#1f2937', lineHeight: 1.5 }}>
                Instrumen yang <strong>memiliki skala ukur sendiri</strong> dan langsung memberikan nilai ukuran fisik benda kerja dari titik nol tanpa memerlukan benda standar referensi.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#065f46', background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <strong>Contoh Alat:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                  <li><strong>Jangka Sorong (Vernier Caliper):</strong> 0.05 / 0.02 mm</li>
                  <li><strong>Mikrometer Sekrup (Micrometer):</strong> 0.01 mm</li>
                  <li><strong>Vernier Height Gauge:</strong> 0.02 mm</li>
                </ul>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 600 }}>
                🎯 <strong>Ciri:</strong> Jangkauan ukur panjang (0-150 mm), hasil berupa nilai nominal absolut (misal: 25.42 mm).
              </div>
            </div>

            {/* 2. ALAT UKUR PEMBANDING */}
            <div style={{
              background: '#fffbeb',
              border: '1.5px solid #f59e0b',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>⏱️</span>
                <div>
                  <h4 style={{ margin: 0, color: '#92400e', fontSize: '1rem', fontWeight: 900 }}>2. Alat Ukur Pembanding</h4>
                  <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>COMPARATIVE INSTRUMENTS (COMPARATOR)</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#1f2937', lineHeight: 1.5 }}>
                Instrumen yang <strong>tidak membaca ukuran absolut dari nol</strong>, melainkan mengukur perbedaan atau penyimpangan (deviasi $\Delta L$) terhadap suatu ukuran standar datum.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#92400e', background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <strong>Contoh Alat:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                  <li><strong>Dial Indikator (Jam Ukur):</strong> 0.01 mm / TIR</li>
                  <li><strong>Pupitas (Dial Test Indicator):</strong> 0.01 / 0.002 mm</li>
                  <li><strong>Cylinder Bore Gauge:</strong> Perbandingan diameter lubang</li>
                </ul>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 600 }}>
                🎯 <strong>Ciri:</strong> Peka terhadap mikron, jangkauan gerak pendek (0-10 mm), menguji keolengan/TIR, kerataan, dan kebulatan.
              </div>
            </div>

            {/* 3. STANDAR ACUAN MASTER */}
            <div style={{
              background: '#f0f9ff',
              border: '1.5px solid #0284c7',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🧱</span>
                <div>
                  <h4 style={{ margin: 0, color: '#075985', fontSize: '1rem', fontWeight: 900 }}>3. Standar Acuan Master &amp; Celah</h4>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>REFERENCE STANDARD &amp; CLEARANCE GAUGES</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#1f2937', lineHeight: 1.5 }}>
                Standar fisik material terkalibrasi dengan ketelitian tertinggi untuk <strong>menyetel titik nol alat pembanding</strong> dan mengkalibrasi alat ukur langsung.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#075985', background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <strong>Contoh Alat:</strong>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                  <li><strong>Gauge Block (Blok Ukur Johansson):</strong> Standar ISO 3650</li>
                  <li><strong>Feeler Gauge (Kaliber Celah):</strong> Bilah celah presisi</li>
                  <li><strong>Master Ring / Plug Gauge:</strong> Standar datum silinder</li>
                </ul>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#0369a1', fontWeight: 600 }}>
                🎯 <strong>Ciri:</strong> Akurasi sub-mikron, menjadi "jantung" kalibrasi seluruh instrumen di bengkel industri.
              </div>
            </div>
          </div>

          {/* TABEL KOMPARASI LENGKAP */}
          <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 800 }}>Parameter Metrologi</th>
                  <th style={{ padding: '12px 16px', color: '#047857', fontWeight: 800 }}>Alat Ukur Langsung Presisi</th>
                  <th style={{ padding: '12px 16px', color: '#b45309', fontWeight: 800 }}>Alat Ukur Pembanding (Comparator)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: '#334155' }}>Prinsip Pengukuran</td>
                  <td style={{ padding: '10px 16px', color: '#1e293b' }}>Mengukur besaran dimensi langsung dari titik 0 ke batas benda</td>
                  <td style={{ padding: '10px 16px', color: '#1e293b' }}>Mengukur selisih/deviasi relatif terhadap datum master</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fcfcfc' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: '#334155' }}>Hasil Pembacaan</td>
                  <td style={{ padding: '10px 16px', color: '#047857', fontWeight: 700 }}>Nilai absolut nominal (Contoh: 18.45 mm, 25.00 mm)</td>
                  <td style={{ padding: '10px 16px', color: '#b45309', fontWeight: 700 }}>Nilai penyimpangan &plusmn; (Contoh: +0.03 mm, TIR 0.02 mm)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: '#334155' }}>Kebutuhan Master Datum</td>
                  <td style={{ padding: '10px 16px', color: '#1e293b' }}>Mandiri (cukup kalibrasi nol saat rahang tertutup)</td>
                  <td style={{ padding: '10px 16px', color: '#1e293b' }}>Wajib disetel pada blok ukur master / datum sebelum ukur</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fcfcfc' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: '#334155' }}>Jangkauan Ukur (Range)</td>
                  <td style={{ padding: '10px 16px', color: '#1e293b' }}>Panjang (0 - 150 mm untuk caliper, 0 - 25 mm micrometer)</td>
                  <td style={{ padding: '10px 16px', color: '#1e293b' }}>Pendek (biasanya 0 - 10 mm atau 0 - 1 mm)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: '#334155' }}>Ketelitian &amp; Kepekaan</td>
                  <td style={{ padding: '10px 16px', color: '#1e293b' }}>0.05 mm, 0.02 mm, hingga 0.01 mm</td>
                  <td style={{ padding: '10px 16px', color: '#1e293b' }}>Sangat peka (0.01 mm, 0.002 mm, hingga 0.001 mm / 1 mikron)</td>
                </tr>
                <tr style={{ background: '#fcfcfc' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: '#334155' }}>Aplikasi Utama di Bengkel</td>
                  <td style={{ padding: '10px 16px', color: '#1e293b' }}>Membubut poros, memfrais tebal balok, mengebor lubang komponen</td>
                  <td style={{ padding: '10px 16px', color: '#1e293b' }}>Memeriksa keolengan spindel (Runout), kelurusan meja mesin, QC massal</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TIPS PRAKTIS DI INDUSTRI */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', fontSize: '0.8rem', color: '#78350f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>💡</span>
            <div>
              <strong>Kaidah Pemilihan di Industri:</strong> Gunakan <em>Alat Ukur Langsung</em> saat Anda membuat benda kerja dari nol untuk mengetahui dimensinya. Gunakan <em>Alat Ukur Pembanding</em> saat Anda ingin menguji kualitas kesimetrisan bentuk (kebulatan, kesejajaran, kerataan) atau saat memeriksa ribuan komponen secara cepat apakah berada dalam toleransi &plusmn;0.02 mm.
            </div>
          </div>
        </div>
      )}

      {/* INSTRUMENT NAVIGATION TABS (TERKATEGORISASI & BERLABEL) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: 'var(--bg-card)',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        overflowX: 'auto'
      }}>
        {METROLOGY_TOOLS
          .filter(tool => {
            if (categoryFilter === 'all') return true;
            if (categoryFilter === 'direct') return tool.category === 'direct';
            if (categoryFilter === 'comparator') return tool.category === 'comparator' || tool.category === 'reference';
            if (categoryFilter === 'evaluation') return tool.category === 'evaluation';
            return true;
          })
          .map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                sound.playClick();
                setActiveTool(tool.id);
              }}
              style={{
                flex: '1 0 auto',
                padding: '10px 14px',
                borderRadius: '8px',
                border: activeTool === tool.id ? `1.5px solid ${tool.borderBadge}` : '1px solid transparent',
                background: activeTool === tool.id ? tool.badgeBg : 'transparent',
                color: activeTool === tool.id ? tool.badgeColor : '#334155',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontWeight: activeTool === tool.id ? 800 : 600,
                fontSize: '0.82rem',
                transition: 'all 0.2s',
                minWidth: '125px'
              }}
            >
              <div style={{ fontSize: '1.2rem' }}>{tool.icon}</div>
              <div style={{ fontWeight: 800 }}>{tool.name}</div>
              
              {/* BADGE KATEGORI ALAT */}
              <div style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                background: activeTool === tool.id ? tool.badgeColor : 'rgba(0,0,0,0.06)',
                color: activeTool === tool.id ? '#ffffff' : '#64748b',
                marginTop: '2px'
              }}>
                {tool.categoryLabel}
              </div>

              <div style={{ fontSize: '0.66rem', color: activeTool === tool.id ? tool.badgeColor : '#64748b', fontWeight: 600, marginTop: '1px' }}>
                {tool.res}
              </div>
            </button>
          ))}
      </div>

      {/* SUB-TAB SELECTOR (SIMULATOR / TEORI / SOP) & AUDIO NARRATOR - ONLY FOR TOOLS 1 TO 6 */}
      {activeTool !== 'quiz' && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'simulator', label: '🧪 Simulasi Interaktif Bergerak' },
              { id: 'theory', label: '🔬 Anatomi & Komponen (Diagram & Foto HD)' },
              { id: 'sop', label: '📋 SOP & Cara Penggunaan Standar Industri' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id);
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: activeTab === tab.id ? '1px solid #10b981' : '1px solid var(--border-light)',
                  background: activeTab === tab.id ? '#10b981' : 'var(--bg-card)',
                  color: activeTab === tab.id ? '#000' : 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tombol Audio Narator Alat Ukur */}
          <button
            onClick={handleToggleMeasureAudio}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: isSpeakingThisMeasure ? '1.5px solid #059669' : '1.5px solid #a7f3d0',
              background: isSpeakingThisMeasure ? '#059669' : '#ecfdf5',
              color: isSpeakingThisMeasure ? '#ffffff' : '#065f46',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isSpeakingThisMeasure ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
            title="Dengarkan penjelasan suara materi dan nilai alat ukur ini (Fitur Inklusi)"
          >
            <span style={{ fontSize: '1rem' }}>{isSpeakingThisMeasure ? '⏹️' : '🔊'}</span>
            <span>{isSpeakingThisMeasure ? 'Hentikan Audio' : 'Dengarkan Penjelasan Suara'}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. JANGKA SORONG (VERNIER CALIPER)                                         */}
      {/* ========================================================================= */}
      {activeTool === 'vernier' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'simulator' && (
            <div className="metrology-lab-grid">
              
              {/* INTERACTIVE WORKSPACE & MOVABLE SVG */}
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Simulasi Jangka Sorong Digital & Vernier (0 - 50 mm)
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      Model bengkel presisi standar industri/SMK. Geser slider atau tekan tombol pada jangka sorong.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('theory');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid #10b981',
                        color: '#047857',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Buka diagram anatomi dan komponen jangka sorong"
                    >
                      <span>📖</span>
                      <span>Gambar Anatomi</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setCaliperResolution(caliperResolution === 0.05 ? 0.02 : 0.05);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid #f59e0b',
                        color: '#f59e0b',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Resolusi: {caliperResolution} mm
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setCaliperUnit(caliperUnit === 'mm' ? 'inch' : 'mm');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: caliperUnit === 'inch' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Satuan: {caliperUnit.toUpperCase()}
                    </button>
                    {caliperZeroOffset !== 0 && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          setCaliperZeroOffset(0);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(234, 179, 8, 0.2)',
                          border: '1px solid #eab308',
                          color: '#eab308',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Reset Tara (Zero)
                      </button>
                    )}
                    <button
                      onClick={() => setShowCaliperReadout(!showCaliperReadout)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: showCaliperReadout ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: showCaliperReadout ? '1px solid #10b981' : '1px solid #ef4444',
                        color: showCaliperReadout ? '#10b981' : '#ef4444',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {showCaliperReadout ? '👁️ Nilai Tampil' : '🙈 Sembunyikan (Uji Mandiri)'}
                    </button>
                  </div>
                </div>

                {/* WORKPIECE SELECTOR BAR */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', padding: '6px 10px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Benda Kerja yang Diukur:
                  </span>
                  {[
                    { id: 'outer-shaft', label: '🔘 Poros Bulat (Luar)' },
                    { id: 'plate', label: '🔲 Plat Datar (Tebal)' },
                    { id: 'inner-hole', label: '⭕ Busing Lubang (Dalam)' },
                    { id: 'none', label: '🚫 Tanpa Benda' }
                  ].map(wp => (
                    <button
                      key={wp.id}
                      onClick={() => {
                        sound.playClick();
                        setCaliperWorkpiece(wp.id);
                      }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        background: caliperWorkpiece === wp.id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${caliperWorkpiece === wp.id ? 'var(--primary)' : 'rgba(255,255,255,0.12)'}`,
                        color: caliperWorkpiece === wp.id ? '#ffffff' : 'var(--text-main)',
                        fontSize: '0.75rem',
                        fontWeight: caliperWorkpiece === wp.id ? 800 : 600,
                        cursor: 'pointer'
                      }}
                    >
                      {wp.label}
                    </button>
                  ))}
                </div>

                {/* MOVABLE CALIPER SVG VIEWPORT */}
                <div className="metrology-svg-container" style={{ background: '#1b3b64', borderRadius: '12px', padding: '14px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)', overflowX: 'auto' }}>
                  <svg viewBox="0 0 880 340" style={{ width: "100%", maxWidth: "880px", height: "auto", display: "block", userSelect: "none" }}>
                    <defs>
                      <linearGradient id="beamSteelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8c96a0" />
                        <stop offset="50%" stopColor="#a0abb6" />
                        <stop offset="100%" stopColor="#7a8590" />
                      </linearGradient>
                      <linearGradient id="sliderHousingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#cbd5e1" />
                        <stop offset="20%" stopColor="#e2e8f0" />
                        <stop offset="80%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#94a3b8" />
                      </linearGradient>
                      <linearGradient id="jawBevelPad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="60%" stopColor="#e2e8f0" />
                        <stop offset="100%" stopColor="#cbd5e1" />
                      </linearGradient>
                      <linearGradient id="jawBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8c96a0" />
                        <stop offset="60%" stopColor="#7a8590" />
                        <stop offset="100%" stopColor="#68737e" />
                      </linearGradient>
                      <linearGradient id="brassWorkpiece" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fde68a" />
                        <stop offset="40%" stopColor="#f59e0b" />
                        <stop offset="80%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#78350f" />
                      </linearGradient>
                      <filter id="cShadow" x="-5%" y="-5%" width="110%" height="110%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
                      </filter>
                    </defs>

                    {/* BLUE BACKGROUND (MATCHING unnamed.png) */}
                    <rect width="880" height="340" fill="#1b3b64" rx="8" />

                    {/* DEPTH PROBE (TANGKAI KEDALAMAN) AT BACK RIGHT */}
                    <rect
                      x={840}
                      y={136}
                      width={Math.max(0, caliperValue * 10)}
                      height="7"
                      fill="#cbd5e1"
                      stroke="#475569"
                      strokeWidth="1"
                    />

                    {/* ================================================================= */}
                    {/* 1. FIXED FRAME & MAIN BEAM (BATANG UTAMA & RAHANG TETAP)          */}
                    {/* ================================================================= */}
                    <g id="main-beam-group">
                      {/* Top Steel Strip of Beam */}
                      <rect x={40} y={96} width={810} height={22} fill="url(#beamSteelGrad)" stroke="#475569" strokeWidth="1" />
                      <line x1={40} y1={97} x2={850} y2={97} stroke="#cbd5e1" strokeWidth="1" />

                      {/* Main Beam Jet-Black Measurement Track */}
                      <rect x={40} y={118} width={810} height={44} fill="#060911" stroke="#1e293b" strokeWidth="1" />

                      {/* Bottom Steel Strip of Beam */}
                      <rect x={40} y={162} width={810} height={14} fill="url(#beamSteelGrad)" stroke="#475569" strokeWidth="1" />

                      {/* FIXED LOWER JAW (RAHANG LUAR TETAP) */}
                      <path
                        d="M 40 96 L 135 96 L 135 285 L 122 295 L 85 278 L 45 180 L 40 162 Z"
                        fill="url(#jawBodyGrad)"
                        stroke="#334155"
                        strokeWidth="1.5"
                      />
                      {/* Left Stepped Shoulder Notch */}
                      <path
                        d="M 40 96 L 68 96 L 68 118 L 40 118 Z"
                        fill="#717c87"
                        stroke="#334155"
                        strokeWidth="1"
                      />
                      {/* Precision Ground Silver Measuring Pad on Fixed Jaw */}
                      <rect x={122} y={218} width={13} height={67} fill="url(#jawBevelPad)" stroke="#94a3b8" strokeWidth="0.8" />
                      {/* Bottom 45-deg Chamfer bevel highlight */}
                      <polygon points="122,285 135,285 122,295" fill="#cbd5e1" />

                      {/* FIXED UPPER JAW (RAHANG DALAM TETAP) */}
                      <path
                        d="M 112 96 L 135 96 L 135 48 L 122 48 L 112 78 Z"
                        fill="url(#jawBodyGrad)"
                        stroke="#334155"
                        strokeWidth="1.5"
                      />
                      {/* Silver highlight bevel on right edge of upper fixed jaw */}
                      <polygon points="127,48 135,48 135,96 129,96" fill="url(#jawBevelPad)" stroke="#94a3b8" strokeWidth="0.8" />

                      {/* MAIN SCALE ENGRAVINGS ON BLACK BAND (0 to 70 mm, x = 135 + i * 10) */}
                      {Array.from({ length: 72 }).map((_, i) => {
                        const x = 135 + i * 10;
                        const isMajor = i % 10 === 0;
                        const isMid = i % 5 === 0 && !isMajor;
                        const tickH = isMajor ? 18 : (isMid ? 12 : 7);
                        const cmNumber = i / 10;

                        return (
                          <g key={'main-tick-' + i}>
                            {/* White tick mark from baseline y=162 going UP */}
                            <line
                              x1={x}
                              y1={162}
                              x2={x}
                              y2={162 - tickH}
                              stroke="#ffffff"
                              strokeWidth={isMajor ? 1.5 : (isMid ? 1.1 : 0.8)}
                              strokeLinecap="square"
                            />
                            {/* Number on top of major ticks (0, 1, 2, 3, 4, 5, 6, 7) */}
                            {isMajor && i <= 70 && (
                              <text
                                x={x}
                                y={136}
                                fontSize="12.5"
                                fontWeight="900"
                                fill="#ffffff"
                                textAnchor="middle"
                                fontFamily="Arial, sans-serif"
                              >
                                {cmNumber}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>

                    {/* ================================================================= */}
                    {/* WORKPIECE (BENDA KERJA)                                           */}
                    {/* ================================================================= */}
                    {caliperWorkpiece === 'outer-shaft' && caliperValue > 0.4 && (
                      <g id="workpiece-shaft" filter="url(#cShadow)">
                        <circle
                          cx={135 + (caliperValue * 10) / 2}
                          cy={251}
                          r={Math.min(caliperValue * 5, 42)}
                          fill="url(#brassWorkpiece)"
                          stroke="#92400e"
                          strokeWidth="2"
                        />
                        <circle
                          cx={135 + (caliperValue * 10) / 2}
                          cy={251}
                          r={Math.min(caliperValue * 5, 42) * 0.65}
                          fill="none"
                          stroke="rgba(255,255,255,0.4)"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={135 + (caliperValue * 10) / 2}
                          y={255}
                          fontSize="9"
                          fontWeight="700"
                          fill="#1e293b"
                          textAnchor="middle"
                        >
                          Poros (Ø)
                        </text>
                      </g>
                    )}

                    {caliperWorkpiece === 'plate' && caliperValue > 0.4 && (
                      <g id="workpiece-plate" filter="url(#cShadow)">
                        <rect
                          x={135}
                          y={225}
                          width={caliperValue * 10}
                          height={50}
                          fill="url(#brassWorkpiece)"
                          stroke="#92400e"
                          strokeWidth="1.5"
                          rx="2"
                        />
                        <text
                          x={135 + (caliperValue * 10) / 2}
                          y={254}
                          fontSize="9"
                          fontWeight="700"
                          fill="#1e293b"
                          textAnchor="middle"
                        >
                          Plat Datar
                        </text>
                      </g>
                    )}

                    {caliperWorkpiece === 'inner-hole' && caliperValue > 0.4 && (
                      <g id="workpiece-inner-hole">
                        <path
                          d={`M ${135 - 20} 35 L ${135 + caliperValue * 10 + 20} 35 L ${135 + caliperValue * 10 + 20} 70 L ${135 + caliperValue * 10} 70 L ${135 + caliperValue * 10} 48 L ${135} 48 L ${135} 70 L ${135 - 20} 70 Z`}
                          fill="rgba(245, 158, 11, 0.35)"
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                        <text
                          x={135 + (caliperValue * 10) / 2}
                          y={44}
                          fontSize="8.5"
                          fontWeight="700"
                          fill="#fbbf24"
                          textAnchor="middle"
                        >
                          Lubang Dalam
                        </text>
                      </g>
                    )}

                    {/* ================================================================= */}
                    {/* 2. MOVABLE SLIDING CARRIAGE (RAHANG GESER HYBRID DIGITAL-VERNIER) */}
                    {/* ================================================================= */}
                    <g transform={`translate(${135 + caliperValue * 10}, 0)`} filter="url(#cShadow)">
                      {/* SLIDING LOWER JAW (RAHANG GESER LUAR) */}
                      <path
                        d="M 0 162 L 0 285 L 13 295 L 48 278 L 54 185 L 226 185 L 226 70 L 0 70 Z"
                        fill="url(#jawBodyGrad)"
                        stroke="#334155"
                        strokeWidth="1.5"
                      />
                      {/* Precision Ground Silver Measuring Pad on Sliding Jaw */}
                      <rect x={0} y={218} width={13} height={67} fill="url(#jawBevelPad)" stroke="#94a3b8" strokeWidth="0.8" />
                      {/* Bottom 45-deg Chamfer bevel */}
                      <polygon points="0,285 13,285 13,295" fill="#cbd5e1" />

                      {/* SLIDING UPPER JAW (RAHANG GESER DALAM) */}
                      <path
                        d="M 0 70 L 0 48 L 13 48 L 26 70 Z"
                        fill="url(#jawBodyGrad)"
                        stroke="#334155"
                        strokeWidth="1.5"
                      />
                      <polygon points="0,48 7,48 7,70 0,70" fill="url(#jawBevelPad)" stroke="#94a3b8" strokeWidth="0.8" />

                      {/* ERGONOMIC THUMB REST (PENDORONG IBU JARI) AT BOTTOM RIGHT */}
                      <path
                        d="M 160 185 Q 192 205 226 185 Z"
                        fill="#475569"
                        stroke="#1e293b"
                        strokeWidth="1.5"
                      />
                      {/* Grip Ribs on Thumb Rest */}
                      <line x1={180} y1={187} x2={180} y2={196} stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1={188} y1={187} x2={188} y2={198} stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1={196} y1={187} x2={196} y2={196} stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />

                      {/* TOP KNURLED LOCKING SCREW (BAUT PENGUNCI) */}
                      <rect x={112} y={64} width={16} height={6} fill="#94a3b8" stroke="#475569" strokeWidth="1" />
                      <rect x={102} y={50} width={36} height={14} rx="1.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
                      {[106, 110, 114, 118, 122, 126, 130, 134].map(gx => (
                        <line key={'knurl-' + gx} x1={gx} y1={50} x2={gx} y2={64} stroke="#475569" strokeWidth="1.2" />
                      ))}

                      {/* MAIN SLIDER HOUSING BODY */}
                      <rect x={2} y={70} width={224} height={90} fill="url(#sliderHousingGrad)" stroke="#475569" strokeWidth="1" rx="2" />
                      <rect x={2} y={70} width={224} height={5} fill="#64748b" />

                      {/* DIGITAL LCD DISPLAY WINDOW (BLANK UNTUK MODE UJI BACA SKALA) */}
                      <rect x={8} y={77} width={160} height={38} rx="2" fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
                      <rect x={10} y={79} width={156} height={34} rx="1" fill="#f8fafc" />

                      {/* BUTTON 1: ZERO */}
                      <g
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          setCaliperZeroOffset(caliperZeroOffset === 0 ? caliperValue : 0);
                        }}
                      >
                        <title>Tare / Zero: Klik untuk menyetel titik nol</title>
                        <circle cx={182} cy={87} r={8} fill={caliperZeroOffset !== 0 ? '#fef08a' : '#ffffff'} stroke="#94a3b8" strokeWidth="1.5" />
                        <text x={194} y={90.5} fontSize="9.5" fontWeight="800" fill="#000000" fontFamily="Arial, sans-serif">
                          zero
                        </text>
                      </g>

                      {/* BUTTON 2: INCH / MM */}
                      <g
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          setCaliperUnit(caliperUnit === 'mm' ? 'inch' : 'mm');
                        }}
                      >
                        <title>Unit Switch: Klik untuk ubah mm / inch</title>
                        <circle cx={182} cy={105} r={8} fill={caliperUnit === 'inch' ? '#bbf7d0' : '#ffffff'} stroke="#94a3b8" strokeWidth="1.5" />
                        <text x={194} y={101} fontSize="8" fontWeight="800" fill="#000000" fontFamily="Arial, sans-serif">
                          inch
                        </text>
                        <line x1={194} y1={103} x2={210} y2={103} stroke="#000000" strokeWidth="1" />
                        <text x={194} y={111} fontSize="8" fontWeight="800" fill="#000000" fontFamily="Arial, sans-serif">
                          mm
                        </text>
                      </g>

                      {/* LOWER VERNIER / NONIUS SCALE PLATE (SKALA NONIUS BAWAH) */}
                      <rect x={2} y={160} width={224} height={25} fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
                      <line x1={2} y1={160} x2={226} y2={160} stroke="#334155" strokeWidth="1.2" />

                      {/* VERNIER TICKS (0.05 mm = 20 divisions across 19 mm = 190 px, each div = 9.5 px) */}
                      {caliperResolution === 0.05 ? (
                        Array.from({ length: 21 }).map((_, vi) => {
                          const vx = vi * 9.5;
                          const isMajorV = vi % 2 === 0;
                          const isAligned = vi === caliperVernierIndex;
                          const tickLen = isMajorV ? 11 : 6;
                          return (
                            <g key={'v5-' + vi}>
                              <line
                                x1={vx}
                                y1={160}
                                x2={vx}
                                y2={160 + tickLen}
                                stroke={isAligned ? '#dc2626' : '#000000'}
                                strokeWidth={isAligned ? 2.2 : (isMajorV ? 1.2 : 0.8)}
                              />
                              {isMajorV && (
                                <text
                                  x={vx}
                                  y={180}
                                  fontSize="8.5"
                                  fontWeight={isAligned ? '900' : '700'}
                                  fill={isAligned ? '#dc2626' : '#000000'}
                                  textAnchor="middle"
                                  fontFamily="Arial, sans-serif"
                                >
                                  {vi / 2}
                                </text>
                              )}
                              {isAligned && (
                                <polygon points={`${vx - 3},184 ${vx + 3},184 ${vx},180`} fill="#dc2626" />
                              )}
                            </g>
                          );
                        })
                      ) : (
                        Array.from({ length: 26 }).map((_, vi) => {
                          const vx = vi * 7.5;
                          const isMajorV = vi % 5 === 0;
                          const isAligned = vi === Math.min(25, caliperVernierIndex);
                          const tickLen = isMajorV ? 10 : 5;
                          return (
                            <g key={'v2-' + vi}>
                              <line
                                x1={vx}
                                y1={160}
                                x2={vx}
                                y2={160 + tickLen}
                                stroke={isAligned ? '#dc2626' : '#000000'}
                                strokeWidth={isAligned ? 2.2 : (isMajorV ? 1.2 : 0.8)}
                              />
                              {isMajorV && (
                                <text
                                  x={vx}
                                  y={180}
                                  fontSize="8"
                                  fontWeight={isAligned ? '900' : '700'}
                                  fill={isAligned ? '#dc2626' : '#000000'}
                                  textAnchor="middle"
                                  fontFamily="Arial, sans-serif"
                                >
                                  {vi / 5}
                                </text>
                              )}
                              {isAligned && (
                                <polygon points={`${vx - 3},184 ${vx + 3},184 ${vx},180`} fill="#dc2626" />
                              )}
                            </g>
                          );
                        })
                      )}

                      {/* Vernier scale precision badge on right side of nonius plate */}
                      <text
                        x={204}
                        y={173}
                        fontSize="8"
                        fontWeight="900"
                        fill="#000000"
                        textAnchor="middle"
                        fontFamily="Arial, sans-serif"
                      >
                        {caliperResolution} mm
                      </text>
                    </g>
                  </svg>
                </div>

                {/* CONTROLS (SLIDER & STEPPERS) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Geser Posisi Rahang Ukur (Rentang 0.00 mm s/d 50.00 mm):
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="50"
                    step={caliperResolution}
                    value={caliperValue}
                    onChange={(e) => {
                      setCaliperValue(parseFloat(e.target.value));
                    }}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />

                  {/* QUICK STEPPERS */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { label: '-1.0 mm', delta: -1.0 },
                      { label: `-${caliperResolution} mm`, delta: -caliperResolution },
                      { label: `+${caliperResolution} mm`, delta: caliperResolution },
                      { label: '+1.0 mm', delta: +1.0 },
                      { label: 'Set 0.00 mm', exact: 0 },
                      { label: 'Set 2.00 mm (Model)', exact: 2.00 },
                      { label: 'Set 12.35 mm', exact: 12.35 },
                      { label: 'Set 18.45 mm', exact: 18.45 },
                      { label: 'Set 25.80 mm', exact: 25.80 },
                      { label: 'Acak Ukuran 🎲', random: true }
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          sound.playClick();
                          if (btn.random) {
                            const rand = (Math.floor(Math.random() * 800) * caliperResolution).toFixed(2);
                            setCaliperValue(Math.min(48, parseFloat(rand)));
                          } else if (btn.exact !== undefined) {
                            setCaliperValue(btn.exact);
                          } else {
                            setCaliperValue(prev => Math.max(0, Math.min(50, parseFloat((prev + btn.delta).toFixed(2)))));
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: btn.exact === 2.00 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                          border: btn.exact === 2.00 ? '1px solid #38bdf8' : '1px solid var(--border-light)',
                          color: btn.exact === 2.00 ? '#38bdf8' : '#fff',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* READOUT CARD & DECONSTRUCTION FORMULA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* CALCULATION BOX */}
                <div className="dashboard-card" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', letterSpacing: '1px', marginBottom: '10px' }}>
                    📐 BEDAH RUMUS PEMBACAAN SKALA & DIGITAL
                  </div>

                  {showCaliperReadout ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Skala Utama */}
                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                        <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>1. SKALA UTAMA BATANG (SU)</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>
                          {caliperMainScale}.00 mm
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                          Garis strip skala utama tepat di sebelah kiri angka 0 skala nonius.
                        </div>
                      </div>

                      {/* Skala Nonius */}
                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>2. SKALA NONIUS SLIDER (SN)</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>
                          {caliperVernierValue.toFixed(2)} mm
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                          Garis ke-{caliperVernierIndex} berimpit tegak lurus (garis merah) × {caliperResolution} mm.
                        </div>
                      </div>

                      {/* Tampilan Layar LCD Digital */}
                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>3. BACAAN LCD DIGITAL</div>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {caliperUnit.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
                          {caliperLcdDisplay} {caliperUnit}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                          {caliperZeroOffset !== 0 ? `Titik Nol Relatif (Tara Offset): -${caliperZeroOffset.toFixed(2)} mm` : 'Titik Nol Absolut (Datum Rahang Tertutup)'}
                        </div>
                      </div>

                      {/* Total */}
                      <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1.5px solid #10b981', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 800 }}>HASIL TOTAL FISIK (L = SU + SN)</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#064e3b', fontFamily: 'monospace' }}>
                          {caliperValue.toFixed(2)} mm
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                          ≈ {(caliperValue / 25.4).toFixed(3)} inch
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '30px 20px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px dashed #ef4444',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🙈</div>
                      <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.9rem' }}>MODE UJI BACA MANDIRI AKTIF</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '6px 0 14px 0' }}>
                        Tebak hasil bacaan pada ilustrasi jangka sorong, lalu klik tombol untuk mengecek ketepatan Anda.
                      </p>
                      <button
                        onClick={() => setShowCaliperReadout(true)}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Buka Jawaban
                      </button>
                    </div>
                  )}
                </div>

                {/* 4 CARA PENGUKURAN */}
                <div className="dashboard-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                    🎯 4 Dimensi Pengukuran Caliper:
                  </div>
                  <ul style={{ fontSize: '0.75rem', color: '#334155', paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong style={{ color: '#0f172a' }}>Rahang Luar:</strong> Mengukur diameter luar, ketebalan, atau panjang poros.</li>
                    <li><strong style={{ color: '#0f172a' }}>Rahang Dalam:</strong> Mengukur diameter lubang dalam atau lebar celah alur.</li>
                    <li><strong style={{ color: '#0f172a' }}>Tangkai Kedalaman:</strong> Mengukur kedalaman lubang buta atau ceruk.</li>
                    <li><strong style={{ color: '#0f172a' }}>Bidang Tingkat (Step):</strong> Mengukur beda ketinggian permukaan bertingkat.</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* TEORI JANGKA SORONG */}
          {activeTab === 'theory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ToolAnatomySection toolKey="vernier" onOpenModal={setModalImage} />

              <div className="metrology-cards-grid-2">
                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    3 Fungsi Pengukuran Utama Jangka Sorong
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', color: '#334155' }}>
                      <strong style={{ color: '#0f172a' }}>1. Pengukuran Dimensi Luar (External):</strong> Menggunakan rahang ukur bawah untuk mengukur diameter luar silinder poros bubut, ketebalan pelat baja, dan panjang benda.
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', color: '#334155' }}>
                      <strong style={{ color: '#0f172a' }}>2. Pengukuran Dimensi Dalam (Internal):</strong> Menggunakan rahang ukur atas untuk mengukur diameter lubang bor, ceruk alur pasak, atau rongga silinder.
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', color: '#334155' }}>
                      <strong style={{ color: '#0f172a' }}>3. Pengukuran Kedalaman (Depth):</strong> Menggunakan bilah batang kedalaman di ujung ekor untuk mengukur kedalaman lubang buta atau ceruk bertingkat.
                    </div>
                  </div>
                </div>

                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#b45309', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Prinsip Ketelitian Skala Nonius
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', color: '#334155' }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      Prinsip kerja vernier memanfaatkan perbedaan kecil antara panjang pembagian pada skala utama dan skala nonius:
                    </p>
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Ketelitian 0.05 mm (1/20):</div>
                      <div style={{ color: '#334155' }}>Panjang 39 mm pada skala utama dibagi menjadi 20 bagian sama panjang pada skala nonius.</div>
                      <div style={{ fontFamily: 'monospace', color: '#b45309', marginTop: '6px', fontWeight: 600 }}>
                        1 strip nonius = 39 / 20 = 1.95 mm.<br/>
                        Selisih per strip = 2.00 mm - 1.95 mm = 0.05 mm.
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Ketelitian 0.02 mm (1/50):</div>
                      <div style={{ color: '#334155' }}>Panjang 49 mm pada skala utama dibagi menjadi 50 bagian sama panjang pada skala nonius.</div>
                      <div style={{ fontFamily: 'monospace', color: '#047857', marginTop: '6px', fontWeight: 600 }}>
                        1 strip nonius = 49 / 50 = 0.98 mm.<br/>
                        Selisih per strip = 1.00 mm - 0.98 mm = 0.02 mm.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SOP JANGKA SORONG */}
          {activeTab === 'sop' && (
            <div className="dashboard-card" style={{ padding: '24px' }}>
              <h3 style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
                Standard Operating Procedure (SOP) Penggunaan Jangka Sorong di Industri Mesin
              </h3>
              <div className="metrology-cards-grid-4">
                {[
                  {
                    step: '01',
                    title: 'Pembersihan & Zero Check',
                    desc: 'Lap rahang ukur dengan kain bersih/kertas halus. Rapatkan rahang perlahan, amati garis 0 nonius harus berimpit sempurna dengan garis 0 skala utama. Jika tidak, terdapat zero error.'
                  },
                  {
                    step: '02',
                    title: 'Posisi Pengukuran Tegak Lurus',
                    desc: 'Pastikan sumbu benda kerja tegak lurus dengan rahang jangka sorong. Jangan sampai miring (tilt error) atau terjepit di ujung tirus rahang (gunakan bagian tengah rahang).'
                  },
                  {
                    step: '03',
                    title: 'Penguncian & Pandangan Mata',
                    desc: 'Kencangkan baut pengunci dengan tenaga jari secukupnya. Posisikan mata tegak lurus 90° terhadap skala saat membaca untuk mengeliminasi kesalahan paralaks (parallax error).'
                  },
                  {
                    step: '04',
                    title: 'Perawatan Pasca Kerja',
                    desc: 'Kendurkan baut pengunci, beri sedikit celah (1-2 mm) antar rahang (jangan dirapatkan penuh), oleskan lapisan tipis oli anti-karat, dan simpan dalam kotak busa aslinya.'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857', marginBottom: '8px' }}>{item.step}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MIKROMETER SEKRUP (MICROMETER 0 - 25 mm / 0.01 mm)                      */}
      {/* ========================================================================= */}
      {activeTool === 'micrometer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'simulator' && (
            <div className="metrology-lab-grid">
              
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* TOOL HEADER WITH MODE TOGGLE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Simulasi Mikrometer Sekrup (0 - 25 mm / 0.01 mm)
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '3px' }}>
                      Rumus Standar: <strong style={{ color: '#0f172a' }}>Skala Utama (pada Sleeve)</strong> + <strong style={{ color: '#0f172a' }}>Skala Nonius (pada Thimble)</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('theory');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(2, 132, 199, 0.12)',
                        border: '1px solid #0284c7',
                        color: '#0284c7',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Buka diagram anatomi dan komponen mikrometer sekrup"
                    >
                      <span>📖</span>
                      <span>Gambar Anatomi</span>
                    </button>

                    {/* MODE TOGGLE: STANDARD VS SIMPLE */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        setMicroReadingMode(microReadingMode === 'standard' ? 'simple' : 'standard');
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        background: microReadingMode === 'standard' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        border: microReadingMode === 'standard' ? '1.5px solid #38bdf8' : '1.5px solid #f59e0b',
                        color: microReadingMode === 'standard' ? '#38bdf8' : '#f59e0b',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{microReadingMode === 'standard' ? '⚙️ Mode Standar (Ada Garis 0.5 mm)' : '⚡ Mode Sederhana (Hanya Garis 1 mm)'}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(Klik Ganti)</span>
                    </button>

                    <button
                      onClick={() => setShowMicroReadout(!showMicroReadout)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: showMicroReadout ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: showMicroReadout ? '1px solid #10b981' : '1px solid #ef4444',
                        color: showMicroReadout ? '#10b981' : '#ef4444',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {showMicroReadout ? '👁️ Bacaan Tampil' : '🙈 Mode Uji'}
                    </button>
                  </div>
                </div>
                {/* VIEW MODE SELECTOR & GUIDELINE TOGGLE */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px' }}>
                      Mode Tampilan:
                    </span>
                    <button
                      onClick={() => { sound.playClick(); setMicroViewMode('detail'); }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        background: microViewMode === 'detail' ? '#0284c7' : 'transparent',
                        color: microViewMode === 'detail' ? '#fff' : 'var(--text-muted)',
                        border: microViewMode === 'detail' ? '1px solid #38bdf8' : '1px solid transparent',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🔬 Detail Skala Presisi (Standar Soal/Gambar)
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setMicroViewMode('full'); }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        background: microViewMode === 'full' ? '#0284c7' : 'transparent',
                        color: microViewMode === 'full' ? '#fff' : 'var(--text-muted)',
                        border: microViewMode === 'full' ? '1px solid #38bdf8' : '1px solid transparent',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      📐 Alat Fisik Lengkap (U-Frame)
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setMicroViewMode('both'); }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        background: microViewMode === 'both' ? '#0284c7' : 'transparent',
                        color: microViewMode === 'both' ? '#fff' : 'var(--text-muted)',
                        border: microViewMode === 'both' ? '1px solid #38bdf8' : '1px solid transparent',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✨ Tampilan Ganda (Keduanya)
                    </button>
                  </div>

                  {(microViewMode === 'detail' || microViewMode === 'both') && (
                    <button
                      onClick={() => { sound.playClick(); setMicroShowGuides(!microShowGuides); }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        background: microShowGuides ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                        border: microShowGuides ? '1px solid #10b981' : '1px solid #64748b',
                        color: microShowGuides ? '#10b981' : '#94a3b8',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Nyalakan/matikan garis bantu penunjuk segaris dan pembacaan"
                    >
                      <span>{microShowGuides ? '🎯 Garis Bantu: AKTIF' : '📝 Tampilan Murni (Soal)'}</span>
                    </button>
                  )}
                </div>

                {/* 1. HIGH-DETAIL CLOSE-UP SCALE VIEWPORT (SESUAI GAMBAR SOAL / BUKU TEKNIK) */}
                {(microViewMode === 'detail' || microViewMode === 'both') && (
                  <div style={{
                    background: '#030712',
                    borderRadius: '12px',
                    border: '2px solid #334155',
                    padding: '16px',
                    overflowX: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: 'inset 0 2px 14px rgba(0,0,0,0.85)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.5px' }}>
                          🔬 TAMPILAN DETAIL SKALA (MAKRO / KACA PEMBESAR)
                        </span>
                        <span style={{ fontSize: '0.68rem', background: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                          Ketelitian 0.01 mm
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Standar Soal Fisika, UN/USK SMK & Mitutoyo
                      </span>
                    </div>

                    {/* CLOSE-UP SVG */}
                    {(() => {
                      const scalePPM = 45; // 45 pixels per mm for huge, unmistakable clarity
                      const thimbleX = Math.min(480, 140 + safeMicroVal * scalePPM);
                      const markZeroX = thimbleX - safeMicroVal * scalePPM;
                      const totalHundredths = Math.round(safeMicroVal * 100);
                      const maxDiv = microReadingMode === 'standard' ? 50 : 100;
                      const activeDiv = ((totalHundredths % maxDiv) + maxDiv) % maxDiv;
                      const nearestIntDiv = Math.round(activeDiv);

                      return (
                        <svg viewBox="0 0 920 380" style={{ width: "100%", maxWidth: "920px", height: "auto", display: "block", userSelect: "none" }}>
                          {/* VIEWPORT BACKGROUND: PURE BLACK / MAXIMUM DRAFTING CONTRAST */}
                          <rect x="0" y="0" width="920" height="380" fill="#000000" rx="8" />

                          {/* SLEEVE / BARREL CYLINDER (LARAS TETAP) */}
                          {/* Top border band */}
                          <rect x="0" y="90" width={thimbleX} height="30" fill="#9e9e9e" />
                          {/* Center main cylinder body */}
                          <rect x="0" y="120" width={thimbleX} height="140" fill="#f0f0f0" />
                          {/* Bottom border band */}
                          <rect x="0" y="260" width={thimbleX} height="30" fill="#9e9e9e" />

                          {/* SLEEVE HORIZONTAL DATUM LINE (GARIS REFERENSI TENGAH PENUH) */}
                          {/* Membentang penuh dari kiri laras (x=0) lurus horizontal hingga menyentuh bidal (thimbleX) */}
                          <line x1="0" y1="190" x2={thimbleX} stroke="#000000" strokeWidth="3.6" strokeLinecap="square" />

                          {/* SLEEVE GRADUATIONS (0 to 25 mm) */}
                          {Array.from({ length: 26 }).map((_, i) => {
                            const xi = markZeroX + i * scalePPM;
                            if (xi < 0 || xi > thimbleX) return null;
                            const isFive = i % 5 === 0;

                            return (
                              <g key={'macro-slv-' + i}>
                                {/* Upper Millimeter Line (Skala Atas Bulat) */}
                                <line
                                  x1={xi}
                                  y1="190"
                                  x2={xi}
                                  y2={isFive ? "95" : "138"}
                                  stroke="#000000"
                                  strokeWidth={isFive ? 3.4 : 2.4}
                                  strokeLinecap="square"
                                />
                                {/* Upper Number Label (Setiap kelipatan 5 mm: 0, 5, 10, 15, 20, 25) */}
                                {isFive && (
                                  <text
                                    x={xi}
                                    y="80"
                                    fontSize="26"
                                    fontWeight="bold"
                                    fill="#000000"
                                    textAnchor="middle"
                                    fontFamily="system-ui, -apple-system, sans-serif"
                                  >
                                    {i}
                                  </text>
                                )}

                                {/* Lower Half-Millimeter Line (0.5 mm) - Standard Mode */}
                                {microReadingMode === 'standard' && i < 25 && (() => {
                                  const xHalf = xi + scalePPM * 0.5;
                                  if (xHalf < 0 || xHalf > thimbleX) return null;
                                  return (
                                    <line
                                      key={'macro-half-' + i}
                                      x1={xHalf}
                                      y1="190"
                                      x2={xHalf}
                                      y2="242"
                                      stroke="#000000"
                                      strokeWidth="2.4"
                                      strokeLinecap="square"
                                    />
                                  );
                                })()}
                              </g>
                            );
                          })}

                          {/* ROTATING THIMBLE ASSEMBLY (BIDAL PUTAR) */}
                          {/* 1. Thimble Bevel Nose (Tirus Bidal) - Bersih tanpa garis outline */}
                          <polygon
                            points={`${thimbleX},90 ${thimbleX + 90},40 ${thimbleX + 90},340 ${thimbleX},290`}
                            fill="#cccccc"
                          />

                          {/* 2. Thimble Cylindrical Body (Badan Silinder Bidal) */}
                          {/* Top shaded band */}
                          <rect x={thimbleX + 90} y="40" width={920 - (thimbleX + 90)} height="50" fill="#9e9e9e" />
                          {/* Center main cylinder body */}
                          <rect x={thimbleX + 90} y="90" width={920 - (thimbleX + 90)} height="200" fill="#f0f0f0" />
                          {/* Center light highlight band */}
                          <rect x={thimbleX + 90} y="165" width={920 - (thimbleX + 90)} height="50" fill="#ffffff" />
                          {/* Bottom shaded band */}
                          <rect x={thimbleX + 90} y="290" width={920 - (thimbleX + 90)} height="50" fill="#9e9e9e" />

                          {/* 3. Thimble Rotational Graduations (Garis Skala Putar Nonius) */}
                          {/* Garis tengah lurus horizontal, sedangkan garis di atas & bawahnya miring di ujung mengikuti kerucut bidal */}
                          {[-8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map((offset) => {
                            const divValue = ((nearestIntDiv + offset) % maxDiv + maxDiv) % maxDiv;
                            let diff = divValue - activeDiv;
                            while (diff > maxDiv / 2) diff -= maxDiv;
                            while (diff < -maxDiv / 2) diff += maxDiv;
                            
                            const yDiv = 190 - diff * 15.5;
                            if (yDiv < 35 || yDiv > 345) return null;

                            const isFive = divValue % 5 === 0;
                            const isCoincident = Math.abs(diff) < 0.5;

                            // Kemiringan garis mengikuti tirus kerucut di ujung bidal:
                            // Jika tepat di tengah (yDiv = 190), kemiringan = 0 (lurus sejajar garis tengah laras)
                            // Jika di atas, miring ke atas; jika di bawah, miring ke bawah
                            const coneSlope = (yDiv - 190) * 0.20;
                            const yLongEnd = yDiv + coneSlope * (115 / 90);
                            const yTickEnd = isCoincident ? 190 : (yDiv + coneSlope * (36 / 90));
                            const tickLength = isCoincident ? 50 : 36;

                            return (
                              <g key={'macro-thim-' + offset}>
                                {isFive ? (
                                  // Garis kelipatan 5 (misal 20, 25) miring mengikuti tirus tembus ke silinder dengan angka di ujung
                                  <g>
                                    <line
                                      x1={thimbleX}
                                      y1={yDiv}
                                      x2={thimbleX + 115}
                                      y2={yLongEnd}
                                      stroke="#000000"
                                      strokeWidth="2.8"
                                      strokeLinecap="square"
                                    />
                                    <text
                                      x={thimbleX + 125}
                                      y={yLongEnd}
                                      fontSize="26"
                                      fontWeight="bold"
                                      fill="#000000"
                                      dominantBaseline="central"
                                      fontFamily="system-ui, -apple-system, sans-serif"
                                    >
                                      {divValue}
                                    </text>
                                  </g>
                                ) : (
                                  // Garis strip satuan pendek di ujung tirus miring mengikuti kerucut
                                  // Jika garis segaris tengah (isCoincident), tepat horizontal lurus menyambung garis tengah
                                  <line
                                    x1={thimbleX}
                                    y1={isCoincident ? 190 : yDiv}
                                    x2={thimbleX + tickLength}
                                    y2={yTickEnd}
                                    stroke="#000000"
                                    strokeWidth={isCoincident ? 3.4 : 2.2}
                                    strokeLinecap="square"
                                  />
                                )}
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}

                    {/* DIAGRAM BREAKDOWN PILLS BELOW CLOSE-UP */}
                    {microShowGuides && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '10px',
                        width: '100%',
                        marginTop: '4px'
                      }}>
                        <div style={{ background: 'rgba(2, 132, 199, 0.15)', border: '1px solid #0284c7', borderRadius: '8px', padding: '8px 12px' }}>
                          <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 800 }}>SKALA ATAS (BULAT)</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>{microWholeMm} mm</div>
                          <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Garis atas terakhir terlewati</div>
                        </div>

                        <div style={{ background: microHalfMm > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)', border: microHalfMm > 0 ? '1px solid #10b981' : '1px solid #64748b', borderRadius: '8px', padding: '8px 12px' }}>
                          <div style={{ fontSize: '0.68rem', color: microHalfMm > 0 ? '#34d399' : '#94a3b8', fontWeight: 800 }}>GARIS BAWAH (0.5 mm)</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: microHalfMm > 0 ? '#34d399' : '#94a3b8' }}>
                            {microReadingMode === 'standard' ? (microHalfMm > 0 ? '+0.50 mm (TERLIHAT)' : '+0.00 mm (TERTUTUP)') : 'Mode 1 mm'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                            {microReadingMode === 'standard' ? (microHalfMm > 0 ? 'Garis 0.5 mm sudah keluar dari bidal' : 'Garis 0.5 mm belum keluar dari bidal') : 'Hanya ada garis 1 mm'}
                          </div>
                        </div>

                        <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '8px 12px' }}>
                          <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 800 }}>SKALA NONIUS (BIDAL)</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>+{microNoniusScale.toFixed(2)} mm</div>
                          <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Garis ke-{microThimbleDivisions} × 0.01 mm</div>
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.25)', border: '1.5px solid #10b981', borderRadius: '8px', padding: '8px 12px' }}>
                          <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 900 }}>TOTAL BACAAN</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>
                            {microValue.toFixed(2)} mm
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                            {microMainScale.toFixed(2)} + {microNoniusScale.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. FULL ASSEMBLY MICROMETER SVG VIEWPORT */}
                {(microViewMode === 'full' || microViewMode === 'both') && (
                  <div style={{
                    background: '#090e18',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    padding: '24px 16px',
                    overflowX: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '320px',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8' }}>
                        📐 ANATOMI FISIK LENGKAP (FRAME, ANVIL, SPINDLE, & BENDA KERJA)
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Benda: {microWorkpiece === 'bearing-ball' ? 'Bola Baja (Bearing)' : 'Pelat Logam'}
                      </span>
                    </div>

                    <svg viewBox="0 0 860 300" style={{ width: "100%", maxWidth: "860px", height: "auto", display: "block", userSelect: "none" }}>
                      <defs>
                        <linearGradient id="uFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1e3a5f" />
                          <stop offset="50%" stopColor="#2c5282" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <linearGradient id="chromeSteel" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#cfd8dc" />
                          <stop offset="50%" stopColor="#ffffff" />
                          <stop offset="100%" stopColor="#90a4ae" />
                        </linearGradient>
                        <linearGradient id="thimbleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#78909c" />
                          <stop offset="30%" stopColor="#cfd8dc" />
                          <stop offset="70%" stopColor="#eceff1" />
                          <stop offset="100%" stopColor="#607d8b" />
                        </linearGradient>
                      </defs>

                      {/* CAST STEEL U-FRAME (BINGKAI U) */}
                      <path
                        d="M 230 115 C 130 115, 70 175, 70 225 C 70 285, 150 305, 260 305 C 360 305, 410 275, 430 205 L 380 195 C 365 245, 320 265, 250 265 C 160 265, 115 240, 115 215 C 115 175, 165 155, 230 155 Z"
                        fill="url(#uFrameGrad)"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />

                      {/* HEAT INSULATING PLATE (PELINDUNG PANAS TANGAN) */}
                      <rect x="170" y="270" width="140" height="22" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                      <text x="240" y="285" fontSize="10" fontWeight="bold" fill="#f59e0b" textAnchor="middle">
                        0-25mm 0.01mm Mitutoyo
                      </text>

                      {/* FIXED ANVIL (LANDASAN TETAP) */}
                      <rect x="220" y="122" width="25" height="36" fill="url(#chromeSteel)" stroke="#475569" strokeWidth="1" />
                      {/* Carbide Tip on Anvil */}
                      <rect x="240" y="122" width="5" height="36" fill="#1e293b" />

                      {/* WORKPIECE BETWEEN ANVIL & SPINDLE */}
                      {microWorkpiece === 'bearing-ball' && microValue > 0.5 && (
                        <g id="workpiece-ball">
                          <circle
                            cx={245 + (microValue * 8.5) / 2}
                            cy="140"
                            r={Math.min((microValue * 8.5) / 2, 28)}
                            fill="url(#goldHighlight)"
                            stroke="#b45309"
                            strokeWidth="1.5"
                          />
                          <text
                            x={245 + (microValue * 8.5) / 2}
                            y="144"
                            fontSize="8"
                            fontWeight="bold"
                            fill="#000"
                            textAnchor="middle"
                          >
                            Bola (Ø)
                          </text>
                        </g>
                      )}

                      {/* MOVABLE SPINDLE (POROS UKUR GESER) */}
                      <rect
                        x={245 + microValue * 8.5}
                        y="122"
                        width={185 - microValue * 8.5}
                        height="36"
                        fill="url(#chromeSteel)"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                      {/* Carbide Tip on Spindle */}
                      <rect x={245 + microValue * 8.5} y="122" width="5" height="36" fill="#1e293b" />

                      {/* SPINDLE LOCK NUT LEVER */}
                      <rect x="415" y="112" width="15" height="56" rx="3" fill="#64748b" stroke="#334155" />
                      <circle cx="422" cy="140" r="5" fill="#f59e0b" />

                      {/* SLEEVE / BARREL (SILINDER UTAMA TETAP) */}
                      <rect x="430" y="116" width="250" height="48" fill="url(#chromeSteel)" stroke="#475569" strokeWidth="1.5" />
                      
                      {/* Compute thimble X position in assembly */}
                      {(() => {
                        const thimbleX = 445 + microValue * 8.5;
                        return (
                          <g>
                            {/* SLEEVE DATUM LINE */}
                            <line x1="430" y1="140" x2={thimbleX} stroke="#0f172a" strokeWidth="2" />

                            {/* SLEEVE ENGRAVINGS (0 to 25 mm) */}
                            {Array.from({ length: 26 }).map((_, i) => {
                              const sx = 445 + i * 8.5;
                              if (sx > thimbleX) return null;
                              const isFive = i % 5 === 0;
                              return (
                                <g key={'slv-' + i}>
                                  <line
                                    x1={sx}
                                    y1="140"
                                    x2={sx}
                                    y2={isFive ? "120" : "126"}
                                    stroke="#0f172a"
                                    strokeWidth={isFive ? 1.8 : 1.1}
                                  />
                                  {isFive && (
                                    <text x={sx} y="117" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                                      {i}
                                    </text>
                                  )}
                                  {microReadingMode === 'standard' && i < 25 && (sx + 4.25 <= thimbleX) && (
                                    <line
                                      x1={sx + 4.25}
                                      y1="140"
                                      x2={sx + 4.25}
                                      y2="153"
                                      stroke="#0f172a"
                                      strokeWidth="1.1"
                                    />
                                  )}
                                </g>
                              );
                            })}

                            {/* ROTATING THIMBLE */}
                            <g transform={`translate(${thimbleX}, 0)`}>
                              {/* Thimble Bevel Nose */}
                              <polygon
                                points="0,114 38,108 38,172 0,166"
                                fill="url(#thimbleGrad)"
                                stroke="#334155"
                                strokeWidth="1.2"
                              />
                              {/* Thimble Main Cylindrical Body */}
                              <rect x="38" y="108" width="125" height="64" fill="url(#thimbleGrad)" stroke="#334155" strokeWidth="1.2" />
                              
                              {/* Knurled Grip Texture */}
                              {Array.from({ length: 11 }).map((_, ki) => (
                                <line key={'knurl-' + ki} x1={70 + ki * 5} y1="110" x2={70 + ki * 5} y2="170" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
                              ))}

                              {/* SKALA NONIUS ENGRAVINGS */}
                              {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((offset) => {
                                const maxDivA = microReadingMode === 'standard' ? 50 : 100;
                                let divNum = (microThimbleDivisions + offset + maxDivA) % maxDivA;
                                const ty = 140 - offset * 4.8;
                                const isCoincident = offset === 0;
                                const isFiveT = divNum % 5 === 0;
                                return (
                                  <g key={'thim-tick-' + offset}>
                                    <line
                                      x1="0"
                                      y1={ty}
                                      x2={isCoincident ? "22" : (isFiveT ? "15" : "9")}
                                      stroke={isCoincident ? "#ef4444" : "#0f172a"}
                                      strokeWidth={isCoincident ? 2.5 : 1}
                                    />
                                    {(isFiveT || isCoincident) && (
                                      <text
                                        x="24"
                                        y={ty + 3.5}
                                        fontSize={isCoincident ? "10" : "8"}
                                        fontWeight={isCoincident ? "900" : "bold"}
                                        fill={isCoincident ? "#ef4444" : "#1e293b"}
                                        textAnchor="start"
                                      >
                                        {divNum}
                                      </text>
                                    )}
                                  </g>
                                );
                              })}

                              {/* RATCHET STOP KNOB */}
                              <rect x="163" y="120" width="46" height="40" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
                              <circle cx="186" cy="140" r="8" fill={isRatchetClicking ? '#f59e0b' : '#334155'} />
                            </g>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                )}

                {/* CONTROLS (SLIDER & STEPPERS) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)'
                }}>
                  {/* BARIS 1: JUDUL & INPUT ANGKA MANUAL */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <label htmlFor="micro-range-slider" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Atur Putaran Spindle & Thimble (Rentang 0.00 s/d 25.00 mm):
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Input Manual:</span>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1.5px solid #38bdf8', borderRadius: '6px', padding: '3px 8px' }}>
                        <input
                          id="micro-number-input"
                          type="number"
                          min="0"
                          max="25"
                          step="0.01"
                          value={microValue}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) setMicroValue(Math.max(0, Math.min(25, parseFloat(val.toFixed(2)))));
                          }}
                          style={{
                            width: '65px',
                            background: 'transparent',
                            border: 'none',
                            color: '#38bdf8',
                            fontSize: '1.05rem',
                            fontWeight: 900,
                            fontFamily: 'monospace',
                            outline: 'none',
                            textAlign: 'right'
                          }}
                        />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, marginLeft: '4px' }}>mm</span>
                      </div>
                    </div>
                  </div>

                  {/* BARIS 2: SLIDER RANGE & PENANDA RULER */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      id="micro-range-slider"
                      type="range"
                      min="0"
                      max="25"
                      step="0.01"
                      value={microValue}
                      onChange={(e) => setMicroValue(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer', height: '6px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      <span>0 mm</span>
                      <span>5 mm</span>
                      <span>10 mm</span>
                      <span>15 mm</span>
                      <span>20 mm</span>
                      <span>25 mm</span>
                    </div>
                  </div>

                  {/* BARIS 3: PENGATUR LANGKAH HALUS (STEPPERS) & RATCHET DI TENGAH */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {/* TOMBOL LANGKAH MUNDUR */}
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Mundur:</span>
                      {[-0.5, -0.05, -0.01].map((delta) => (
                        <button
                          key={delta}
                          onClick={() => {
                            sound.playClick();
                            setMicroValue(prev => Math.max(0, parseFloat((prev + delta).toFixed(2))));
                          }}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '5px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#fca5a5',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {delta} mm
                        </button>
                      ))}
                    </div>

                    {/* TOMBOL RATCHET MEKANIK */}
                    <button
                      onClick={() => {
                        triggerRatchetClick();
                        setMicroValue(prev => Math.min(25, parseFloat((prev + 0.01).toFixed(2))));
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        border: 'none',
                        color: '#000',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
                      }}
                    >
                      🔊 Putar Ratchet (+0.01 mm Klik!)
                    </button>

                    {/* TOMBOL LANGKAH MAJU */}
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>Maju:</span>
                      {[+0.01, +0.05, +0.5].map((delta) => (
                        <button
                          key={delta}
                          onClick={() => {
                            sound.playClick();
                            setMicroValue(prev => Math.min(25, parseFloat((prev + delta).toFixed(2))));
                          }}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '5px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#6ee7b7',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          +{delta} mm
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BARIS 4: PRESET LATIHAN & CONTOH SOAL */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', marginRight: '2px' }}>
                      Contoh Soal:
                    </span>
                    {[
                      { label: '⭐ 7.74 mm (Gambar Soal)', exact: 7.74, active: true },
                      { label: '0.00 mm (Nol)', exact: 0.00 },
                      { label: '5.50 mm (Garis 0.5 Pas)', exact: 5.50 },
                      { label: '7.48 mm (Belum 0.5 mm)', exact: 7.48 },
                      { label: '7.52 mm (Lewat 0.5 mm)', exact: 7.52 },
                      { label: '12.35 mm', exact: 12.35 },
                      { label: 'Acak 🎲', random: true }
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          sound.playClick();
                          if (btn.random) {
                            const rand = (Math.floor(Math.random() * 2500) / 100).toFixed(2);
                            setMicroValue(parseFloat(rand));
                          } else if (btn.exact !== undefined) {
                            setMicroValue(btn.exact);
                          }
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '5px',
                          background: btn.active ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255,255,255,0.05)',
                          border: btn.active ? '1px solid #38bdf8' : '1px solid var(--border-light)',
                          color: '#fff',
                          fontSize: '0.74rem',
                          fontWeight: btn.active ? 800 : 600,
                          cursor: 'pointer'
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* READOUT CARD (STANDAR UMUM BUKU KEMDIKBUD & SMK) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="dashboard-card" style={{ padding: '20px', border: '1.5px solid rgba(56, 189, 248, 0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '1px' }}>
                      📖 RUMUS STANDAR UMUM
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      SU + SN
                    </span>
                  </div>

                  {showMicroReadout ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      
                      {/* LANGKAH 1: SKALA UTAMA */}
                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800 }}>
                            1. SKALA UTAMA (SU)
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Pada Silinder Tetap (Sleeve)</span>
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                          {microMainScale.toFixed(2)} mm
                        </div>
                        <div style={{ fontSize: '0.73rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                          {microReadingMode === 'standard' ? (
                            <>
                              • Skala atas terbaca: <strong style={{ color: '#ffffff' }}>{microWholeMm} mm</strong><br/>
                              • Garis bawah (0.5 mm): {microHalfMm > 0 ? (
                                <strong style={{ color: '#34d399' }}>SUDAH TERLIHAT (+0.50 mm)</strong>
                              ) : (
                                <strong style={{ color: '#94a3b8' }}>BELUM TERLIHAT (0.00 mm)</strong>
                              )}
                            </>
                          ) : (
                            <>
                              • Terbaca milimeter bulat: <strong style={{ color: '#ffffff' }}>{microWholeMm}.00 mm</strong> (tanpa garis bawah).
                            </>
                          )}
                        </div>
                      </div>

                      {/* LANGKAH 2: SKALA NONIUS */}
                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800 }}>
                            2. SKALA NONIUS (SN)
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Pada Bidal Putar (Thimble)</span>
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                          +{microNoniusScale.toFixed(2)} mm
                        </div>
                        <div style={{ fontSize: '0.73rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                          Garis ke-<strong style={{ color: '#ffffff' }}>{microThimbleDivisions}</strong> pada bidal lurus sejajar dengan garis horizontal skala utama:
                          <br/>
                          <span style={{ fontFamily: 'monospace', color: '#fbbf24', fontWeight: 700 }}>
                            {microThimbleDivisions} × 0.01 mm = {microNoniusScale.toFixed(2)} mm
                          </span>
                        </div>
                      </div>

                      {/* HASIL TOTAL PENGUKURAN */}
                      <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1.5px solid #10b981', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800, letterSpacing: '0.5px' }}>
                          HASIL PENGUKURAN = SKALA UTAMA + SKALA NONIUS
                        </div>
                        <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#064e3b', fontFamily: 'monospace', margin: '4px 0' }}>
                          {microValue.toFixed(2)} mm
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 600 }}>
                          {microMainScale.toFixed(2)} mm + {microNoniusScale.toFixed(2)} mm
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div style={{ padding: '30px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed #ef4444', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🙈</div>
                      <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.9rem' }}>MODE UJI BACA MANDIRI</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '6px 0 14px 0' }}>
                        Amati angka pada Skala Utama dan Skala Nonius di atas, lalu tebak hasilnya.
                      </p>
                      <button
                        onClick={() => setShowMicroReadout(true)}
                        style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                      >
                        Lihat Jawaban
                      </button>
                    </div>
                  )}
                </div>

                {/* PENJELASAN PRAKTIS SKALA & TIPS MENGHILANGKAN KEBINGUNGAN SISWA */}
                <div className="dashboard-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b45309', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💡</span> Panduan Membaca Tanpa Bingung (Standar Gambar Soal):
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: '#0f172a' }}>1. Skala Atas (Milimeter Bulat):</strong> Amati garis-garis di atas garis horizontal. Angka terakhir yang terbuka sebelum bibir bidal adalah milimeter bulat (saat ini: <strong style={{ color: '#0284c7' }}>{microWholeMm} mm</strong>).
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: '#0f172a' }}>2. Garis Bawah (Setengah Milimeter / 0.5 mm):</strong> Garis ini berada di posisi selang-seling di bawah garis horizontal.
                      <br/>
                      {microReadingMode === 'standard' ? (
                        microHalfMm > 0 ? (
                          <span style={{ color: '#059669', fontWeight: 700 }}>
                            ✓ Garis bawah setelah {microWholeMm} mm <u>SUDAH TERLIHAT</u> keluar dari bibir bidal &rarr; Tambahkan <strong style={{ color: '#059669' }}>+0.50 mm</strong>!
                          </span>
                        ) : (
                          <span style={{ color: '#64748b', fontWeight: 600 }}>
                            ✗ Garis bawah setelah {microWholeMm} mm <u>BELUM TERLIHAT</u> (masih tertutup bidal) &rarr; Bernilai <strong style={{ color: '#64748b' }}>+0.00 mm</strong>.
                          </span>
                        )
                      ) : (
                        <span>Mode sederhana: instrumen kisar 1 mm (hanya garis atas).</span>
                      )}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: '#0f172a' }}>3. Skala Nonius Bidal (0.01 mm):</strong> Cari satu garis pada keliling bidal putar yang <strong>tepat lurus segaris</strong> dengan garis acuan horizontal tengah laras.
                      <br/>
                      Nilai = garis ke-<strong style={{ color: '#b45309' }}>{microThimbleDivisions}</strong> &times; 0.01 mm = <strong style={{ color: '#b45309' }}>+{microNoniusScale.toFixed(2)} mm</strong>.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                      <strong style={{ color: '#0284c7' }}>
                        📌 Total = Skala Atas ({microWholeMm}) + Garis Bawah ({microHalfMm.toFixed(2)}) + Bidal ({microNoniusScale.toFixed(2)}) = {microValue.toFixed(2)} mm
                      </strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'theory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ToolAnatomySection toolKey="micrometer" onOpenModal={setModalImage} />

              <div className="metrology-cards-grid-2">
                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#0284c7', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Fungsi Skala Nonius pada Mikrometer
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    Pada mikrometer sekrup, skala yang terdapat pada silinder putar (thimble) berfungsi sebagai <strong style={{ color: '#0f172a' }}>Skala Nonius</strong>:
                  </p>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7', marginTop: '10px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>Kisar Ulir (Pitch) = 0.5 mm</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                      Setiap 1 putaran penuh thimble (360°), poros bergerak sejauh <strong style={{ color: '#0f172a' }}>0.50 mm</strong>.
                    </div>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '10px' }}>Skala Nonius = 50 Bagian</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                      Keliling bidal dibagi menjadi 50 garis setara.
                      <br/>
                      Ketelitian Skala Nonius = 0.5 mm / 50 = <strong style={{ color: '#0284c7' }}>0.01 mm</strong> per garis.
                    </div>
                  </div>
                </div>

                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#b45309', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Fungsi Ratchet Stop (Gigi Gelincir)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    Mengapa pengukuran akhir <strong style={{ color: '#0f172a' }}>WAJIB</strong> menggunakan ratchet stop dan bukan memutar thimble secara langsung?
                  </p>
                  <ul style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <li><strong style={{ color: '#0f172a' }}>Gaya Tekan Standar:</strong> Ratchet dirancang selip pada tekanan ~5 sampai 10 Newton untuk memastikan gaya jepit konstan setiap pengukuran.</li>
                    <li><strong style={{ color: '#0f172a' }}>Mencegah Deformasi:</strong> Tekanan tangan berlebih dapat meremukkan benda kerja tipis (elastisitas/deformasi).</li>
                    <li><strong style={{ color: '#0f172a' }}>Melindungi Ulir Presisi:</strong> Mencegah keausan dan pemaksaan pada ulir mikron mikrometer.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sop' && (
            <div className="dashboard-card" style={{ padding: '24px' }}>
              <h3 style={{ color: '#0284c7', fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
                SOP Pengukuran Outside Micrometer Sesuai Standar Kalibrasi
              </h3>
              <div className="metrology-cards-grid-4">
                {[
                  { step: '01', title: 'Pembersihan Kontak', desc: 'Jepit selembar kertas bersih di antara anvil dan spindle, lalu tarik perlahan untuk mengangkat debu atau lapisan minyak pelindung.' },
                  { step: '02', title: 'Pemeriksaan Titik Nol', desc: 'Rapatkan anvil dan spindle HANYA menggunakan ratchet stop (2-3 klik). Pastikan garis 0 thimble sejajar tepat dengan garis horizontal sleeve.' },
                  { step: '03', title: 'Teknik Ratchet 3 Klik', desc: 'Posisikan benda kerja, putar thimble hingga mendekati benda, lalu putar ratchet stop hingga terdengar bunyi KLIK 2-3 KALI. Kunci tuas clamp.' },
                  { step: '04', title: 'Penyimpanan Tepat', desc: 'Beri celah 2-3 mm antara spindle dan anvil saat disimpan agar tidak terjadi pemuaian logam atau transfer korosi kontak.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7', marginBottom: '8px' }}>{item.step}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VERNIER HEIGHT GAUGE                                                   */}
      {/* ========================================================================= */}
      {activeTool === 'height' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'simulator' && (
            <div className="metrology-lab-grid">
              
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Simulasi: Vernier Height Gauge & Meja Perata Granit
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('theory');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid #10b981',
                        color: '#047857',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Buka diagram anatomi dan komponen vernier height gauge"
                    >
                      <span>📖</span>
                      <span>Gambar Anatomi</span>
                    </button>
                    <button
                      onClick={() => setShowHeightReadout(!showHeightReadout)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: showHeightReadout ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: showHeightReadout ? '1px solid #10b981' : '1px solid #ef4444',
                        color: showHeightReadout ? '#10b981' : '#ef4444',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {showHeightReadout ? '👁️ Nilai Tampil' : '🙈 Sembunyikan (Uji Mandiri)'}
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setIsScribing(true);
                        if (!scribedLines.includes(heightValue)) {
                          setScribedLines([...scribedLines, heightValue]);
                        }
                        setTimeout(() => setIsScribing(false), 500);
                        addXP(10);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: isScribing ? '#f59e0b' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#000',
                        fontSize: '0.82rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      ✏️ Gores Garis (Scribe Line)
                    </button>
                  </div>
                </div>

                {/* MOVABLE HEIGHT GAUGE SVG */}
                <div className="metrology-svg-container">
                  <svg viewBox="0 0 780 380" style={{ width: "100%", maxWidth: "780px", height: "auto", display: "block", userSelect: "none" }}>
                    <defs>
                      <linearGradient id="graniteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="50%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#020617" />
                      </linearGradient>
                    </defs>

                    {/* GRANITE SURFACE PLATE (MEJA PERATA GRANIT) */}
                    <rect x="40" y="320" width="700" height="40" rx="4" fill="url(#graniteGrad)" stroke="#475569" strokeWidth="2" />
                    <text x="390" y="345" fontSize="11" fontWeight="bold" fill="#64748b" textAnchor="middle" letterSpacing="2">
                      GRANITE SURFACE PLATE (DATUM REFERENSI 0.00 mm - DIN 876 GRADE 0)
                    </text>

                    {/* WORKPIECE BLOCK ON SURFACE PLATE */}
                    <rect x="420" y="160" width="160" height="160" fill="#334155" stroke="#64748b" strokeWidth="2" />
                    <text x="500" y="240" fontSize="12" fontWeight="bold" fill="#94a3b8" textAnchor="middle">
                      BENDA KERJA (STEEL BLOCK)
                    </text>

                    {/* PREVIOUSLY SCRIBED LINES ON WORKPIECE */}
                    {scribedLines.map((lineHeight, idx) => {
                      // 1 mm = 1.6 px, height from bottom 320: y = 320 - (lineHeight * 1.6)
                      const sy = 320 - lineHeight * 1.6;
                      return (
                        <g key={'scribe-' + idx}>
                          <line x1="420" y1={sy} x2="580" y2={sy} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,2" />
                          <text x="585" y={sy + 3} fontSize="9" fontWeight="bold" fill="#f59e0b">
                            {lineHeight.toFixed(1)} mm
                          </text>
                        </g>
                      );
                    })}

                    {/* HEIGHT GAUGE BASE (CAST IRON BASE) */}
                    <path
                      d="M 100 320 L 260 320 L 250 280 L 190 270 L 190 40 L 170 40 L 170 270 L 110 280 Z"
                      fill="#475569"
                      stroke="#334155"
                      strokeWidth="1.5"
                    />

                    {/* VERTICAL COLUMN SCALE (0 to 100 mm, each mm = 1.6 px) */}
                    {Array.from({ length: 101 }).map((_, hi) => {
                      if (hi % 5 !== 0) return null;
                      const hy = 320 - hi * 1.6;
                      const isTen = hi % 10 === 0;
                      return (
                        <g key={'hscale-' + hi}>
                          <line x1="170" y1={hy} x2={isTen ? "185" : "178"} stroke="#cbd5e1" strokeWidth={isTen ? 1.2 : 0.8} />
                          {isTen && (
                            <text x="165" y={hy + 3} fontSize="8" fontWeight="bold" fill="#cbd5e1" textAnchor="end">
                              {hi}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* MOVABLE SLIDER CARRIAGE WITH CARBIDE SCRIBER */}
                    {/* Position: y = 320 - heightValue * 1.6 */}
                    <g transform={`translate(0, ${-heightValue * 1.6})`}>
                      {/* Slider Body */}
                      <rect x="155" y="300" width="50" height="40" rx="3" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
                      {/* Vernier scale window */}
                      <rect x="160" y="308" width="40" height="24" fill="#0f172a" rx="2" />
                      {/* Vernier index mark line */}
                      <line x1="160" y1="320" x2="175" y2="320" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1="175" y1="316" x2="175" y2="324" stroke="#38bdf8" strokeWidth="1.2" />

                      {/* Fine adjustment bracket & knob */}
                      <rect x="160" y="275" width="40" height="18" fill="#64748b" rx="2" />
                      <line x1="180" y1="293" x2="180" y2="300" stroke="#f59e0b" strokeWidth="3" />

                      {/* Scriber Arm extending to the right over the workpiece */}
                      <path
                        d="M 205 315 L 430 315 L 440 320 L 425 322 L 205 322 Z"
                        fill={isScribing ? '#f59e0b' : '#cbd5e1'}
                        stroke="#334155"
                        strokeWidth="1"
                      />
                      {/* Carbide tip */}
                      <polygon points="430,315 440,320 425,322" fill="#ef4444" />
                      
                      {/* Indicator of scriber tip contact point */}
                      <circle cx="440" cy="320" r="3" fill="#ef4444" />
                    </g>
                  </svg>
                </div>

                {/* CONTROLS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Atur Ketinggian Penggores dari Meja Perata (Rentang 0 - 100 mm):
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.05"
                    value={heightValue}
                    onChange={(e) => setHeightValue(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Datum Nol (0.00 mm)', exact: 0 },
                      { label: 'Tingkat 1: 25.00 mm', exact: 25.0 },
                      { label: 'Tingkat 2: 45.50 mm', exact: 45.5 },
                      { label: 'Tingkat 3: 72.80 mm', exact: 72.8 },
                      { label: 'Bersihkan Garis Gores 🧹', clear: true }
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          sound.playClick();
                          if (btn.clear) {
                            setScribedLines([]);
                          } else {
                            setHeightValue(btn.exact);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-light)',
                          color: '#fff',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* READOUT & INFO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="dashboard-card" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', letterSpacing: '1px', marginBottom: '10px' }}>
                    📐 PEMBACAAN TINGGI VERNIER
                  </div>

                  {showHeightReadout ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                        <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Skala Utama Vertikal</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
                          {Math.floor(heightValue)}.00 mm
                        </div>
                      </div>

                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>Skala Nonius Slider</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24' }}>
                          +{(heightValue - Math.floor(heightValue)).toFixed(2)} mm
                        </div>
                      </div>

                      <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1.5px solid #10b981', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 800 }}>KETINGGIAN TOTAL DARI MEJA</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#064e3b', fontFamily: 'monospace' }}>
                          {heightValue.toFixed(2)} mm
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '30px 20px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px dashed #ef4444',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🙈</div>
                      <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.9rem' }}>MODE UJI BACA MANDIRI AKTIF</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '6px 0 14px 0' }}>
                        Baca ketinggian langsung pada skala vernier batang tinggi penggores, lalu klik tombol untuk mengecek ketepatan Anda.
                      </p>
                      <button
                        onClick={() => setShowHeightReadout(true)}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Buka Jawaban
                      </button>
                    </div>
                  )}
                </div>

                <div className="dashboard-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                    💎 Ujung Penggores Karbida (Carbide Scriber):
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                    Dibuat dari paduan karbida tungsten yang sangat keras sehingga mampu menggores garis tata letak (layout line) pada baja karbon tanpa tumpul, atau dipasangi Dial Test Indicator untuk memeriksa kerataan.
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'theory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ToolAnatomySection toolKey="height" onOpenModal={setModalImage} />

              <div className="metrology-cards-grid-2">
                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Fungsi Utama Height Gauge di Bengkel Perkakas (Toolroom)
                  </h3>
                  <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <li><strong style={{ color: '#0f172a' }}>Mengukur Ketinggian Bertingkat:</strong> Memeriksa tinggi step kontur benda kerja dengan ketelitian 0.02 mm.</li>
                    <li><strong style={{ color: '#0f172a' }}>Melukis Garis Tata Letak (Marking Out):</strong> Menggores garis acuan pemesinan pada benda kerja mentah sebelum dibubut/difrais.</li>
                    <li><strong style={{ color: '#0f172a' }}>Mengukur Jarak Pusat Sumbu (Center Distance):</strong> Menentukan titik pusat lubang bor terhadap bidang datum dasar.</li>
                    <li><strong style={{ color: '#0f172a' }}>Inspeksi Kesejajaran (Parallelism):</strong> Mengganti scriber dengan dial indicator untuk menguji kemiringan permukaan.</li>
                  </ul>
                </div>

                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#b45309', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Peran Vital Meja Perata Granit (Surface Plate)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    Height gauge tidak dapat bekerja sendiri tanpa meja perata granit sebagai <strong style={{ color: '#0f172a' }}>Primary Datum Plane</strong>:
                  </p>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', marginTop: '10px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>Mengapa Memilih Granit Hitam?</div>
                    <ul style={{ fontSize: '0.8rem', color: '#334155', paddingLeft: '16px', marginTop: '6px' }}>
                      <li>Tidak berkarat jika terkena kelembapan udara.</li>
                      <li>Koefisien muai panas sangat rendah dibandingkan besi cor.</li>
                      <li>Jika tergores, tidak timbul tonjolan tajam (burr) yang merusak kerataan.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sop' && (
            <div className="dashboard-card" style={{ padding: '24px' }}>
              <h3 style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
                SOP Pengoperasian Vernier Height Gauge
              </h3>
              <div className="metrology-cards-grid-4">
                {[
                  { step: '01', title: 'Bersihkan Meja Perata', desc: 'Lap permukaan granit dan dasar alas height gauge dari partikel debu menggunakan alkohol atau cairan pembersih khusus.' },
                  { step: '02', title: 'Kalibrasi Titik Nol', desc: 'Turunkan scriber hingga menyentuh meja perata granit. Periksa bahwa pembacaan vernier tepat 0.00 mm.' },
                  { step: '03', title: 'Gunakan Fine Adjuster', desc: 'Gunakan sekrup penyetel halus (fine adjustment nut) saat mendekati permukaan benda kerja agar sentuhan scriber ringan dan tidak menekan paksa.' },
                  { step: '04', title: 'Teknik Menggores', desc: 'Saat melukis garis, miringkan scriber sedikit ke arah tarikan dan gores dengan satu gerakan stabil (jangan diulang bolak-balik).' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857', marginBottom: '8px' }}>{item.step}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DIAL INDIKATOR (DIAL TEST INDICATOR / JAM UKUR)                         */}
      {/* ========================================================================= */}
      {activeTool === 'dial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'simulator' && (
            <div className="metrology-lab-grid">
              
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Simulasi: Dial Indicator & Uji Keolengan Poros (Runout / TIR)
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('theory');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid #f59e0b',
                        color: '#b45309',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Buka diagram anatomi dan komponen dial indicator"
                    >
                      <span>📖</span>
                      <span>Gambar Anatomi</span>
                    </button>
                    <button
                      onClick={() => setShowDialReadout(!showDialReadout)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: showDialReadout ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: showDialReadout ? '1px solid #10b981' : '1px solid #ef4444',
                        color: showDialReadout ? '#10b981' : '#ef4444',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {showDialReadout ? '👁️ Nilai Tampil' : '🙈 Sembunyikan (Uji Mandiri)'}
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setIsTestingRunout(!isTestingRunout);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: isTestingRunout ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isTestingRunout ? '⏹️ Stop Putaran Poros' : '▶️ Putar Poros (Uji Runout TIR)'}
                    </button>
                  </div>
                </div>

                {/* MOVABLE DIAL INDICATOR SVG */}
                <div className="metrology-svg-container">
                  <svg viewBox="0 0 600 400" style={{ width: "100%", maxWidth: "600px", height: "auto", display: "block", userSelect: "none" }}>
                    <defs>
                      <radialGradient id="dialFaceGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="85%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#e2e8f0" />
                      </radialGradient>
                      <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#475569" />
                        <stop offset="50%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                    </defs>

                    {/* ROTATING ECCENTRIC SHAFT ON V-BLOCK (AT BOTTOM) */}
                    <g transform="translate(300, 340)">
                      {/* V-Block support */}
                      <polygon points="-80,50 80,50 50,0 0,35 -50,0" fill="#334155" stroke="#475569" strokeWidth="2" />
                      
                      {/* Rotating shaft cylinder with eccentricity */}
                      {/* Eccentric center offset based on shaftAngle */}
                      {(() => {
                        const eccOffset = isTestingRunout ? shaftEccentricity * 100 * Math.sin((shaftAngle * Math.PI) / 180) : 0;
                        return (
                          <g transform={`translate(0, ${-eccOffset}) rotate(${shaftAngle})`}>
                            <circle cx="0" cy="0" r="38" fill="url(#goldHighlight)" stroke="#b45309" strokeWidth="2" />
                            {/* Keyway slot to visualize rotation */}
                            <rect x="-6" y="-38" width="12" height="12" fill="#78350f" />
                            <circle cx="0" cy="0" r="4" fill="#000" />
                          </g>
                        );
                      })()}
                    </g>

                    {/* PLUNGER SPINDLE EXTENDING DOWNWARDS */}
                    {/* Plunger y contacts shaft surface at y = 302 + deflection * 20 */}
                    <g transform={`translate(300, ${-dialDeflection * 15})`}>
                      {/* Spindle Rod */}
                      <rect x="-4" y="220" width="8" height="90" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                      {/* Carbide Contact Ball (Ujung Sensor Ukur) */}
                      <circle cx="0" cy="310" r="6" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
                    </g>

                    {/* DIAL GAUGE HOUSING & FACE */}
                    <g transform="translate(300, 140)">
                      {/* Outer Bezel Ring with knurling */}
                      <circle cx="0" cy="0" r="115" fill="url(#bezelGrad)" stroke="#64748b" strokeWidth="3" />
                      {/* Bezel Clamp Screw on Top Right */}
                      <rect x="75" y="-105" width="14" height="20" rx="3" fill="#94a3b8" />

                      {/* White Dial Face */}
                      <circle cx="0" cy="0" r="102" fill="url(#dialFaceGrad)" stroke="#cbd5e1" strokeWidth="1.5" />

                      {/* Tolerance Limit Markers (Green/Red clips) */}
                      <polygon points="-4, -98 4, -98 0, -88" fill="#10b981" transform={`rotate(${dialToleranceMin * 360})`} />
                      <polygon points="-4, -98 4, -98 0, -88" fill="#ef4444" transform={`rotate(${dialToleranceMax * 360})`} />

                      {/* DIAL FACE DIVISIONS (100 divisions, each = 0.01 mm, 1 rev = 1 mm) */}
                      {Array.from({ length: 100 }).map((_, i) => {
                        const deg = i * 3.6;
                        const isTen = i % 10 === 0;
                        const isFive = i % 5 === 0 && !isTen;
                        const lineLen = isTen ? 12 : (isFive ? 8 : 5);
                        return (
                          <g key={'dial-tick-' + i} transform={`rotate(${deg})`}>
                            <line x1="0" y1="-100" x2="0" y2={-100 + lineLen} stroke="#1e293b" strokeWidth={isTen ? 1.5 : 0.8} />
                            {isTen && (
                              <text
                                x="0"
                                y="-82"
                                fontSize="9"
                                fontWeight="bold"
                                fill="#1e293b"
                                textAnchor="middle"
                                transform={`rotate(${-deg}, 0, -82)`}
                              >
                                {i}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* BRANDING & SPEC */}
                      <text x="0" y="-45" fontSize="10" fontWeight="900" fill="#0284c7" textAnchor="middle">
                        MITUTOYO
                      </text>
                      <text x="0" y="-32" fontSize="8" fontWeight="bold" fill="#64748b" textAnchor="middle">
                        0.01 mm - JEWELED
                      </text>

                      {/* REVOLUTION COUNTER SUB-DIAL (0 to 10 mm) */}
                      <g transform="translate(0, 35)">
                        <circle cx="0" cy="0" r="28" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                        {Array.from({ length: 10 }).map((_, si) => {
                          const sdeg = si * 36;
                          return (
                            <g key={'sub-' + si} transform={`rotate(${sdeg})`}>
                              <line x1="0" y1="-28" x2="0" y2="-22" stroke="#334155" strokeWidth="1" />
                              <text x="0" y="-15" fontSize="7" fontWeight="bold" fill="#334155" textAnchor="middle" transform={`rotate(${-sdeg}, 0, -15)`}>
                                {si}
                              </text>
                            </g>
                          );
                        })}
                        {/* Sub-dial Needle (counts whole millimeters) */}
                        <line
                          x1="0"
                          y1="5"
                          x2="0"
                          y2="-22"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          transform={`rotate(${(dialDeflection / 10) * 360})`}
                        />
                        <circle cx="0" cy="0" r="2.5" fill="#ef4444" />
                      </g>

                      {/* MAIN NEEDLE (POINTER) */}
                      {/* 1 mm deflection = 360 degrees */}
                      <g transform={`rotate(${((dialDeflection % 1) * 360) + dialBezelOffset})`}>
                        <polygon points="-2,15 2,15 0.5,-95 -0.5,-95" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.5" />
                        <circle cx="0" cy="0" r="5" fill="#0f172a" />
                        <circle cx="0" cy="0" r="2" fill="#ef4444" />
                      </g>
                    </g>
                  </svg>
                </div>

                {/* CONTROLS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Simulasi Defleksi Gerak Sensor Plunger (Rentang 0.00 s/d 5.00 mm):
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.01"
                    value={dialDeflection}
                    disabled={isTestingRunout}
                    onChange={(e) => setDialDeflection(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b', cursor: isTestingRunout ? 'not-allowed' : 'pointer' }}
                  />

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setDialBezelOffset(-((dialDeflection % 1) * 360));
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        background: 'rgba(56, 189, 248, 0.2)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Putar Bezel (Zero Set Jarum)
                    </button>
                    <button
                      onClick={() => setShaftEccentricity(0.02)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-light)',
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Preset Runout: 0.02 mm (Presisi)
                    </button>
                    <button
                      onClick={() => setShaftEccentricity(0.08)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-light)',
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Preset Runout: 0.08 mm (Cacat Oleng)
                    </button>
                  </div>
                </div>

              </div>

              {/* READOUT & RUNOUT CALCULATION */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="dashboard-card" style={{ padding: '20px', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '1px', marginBottom: '10px' }}>
                    ⏱️ PEMBACAAN JARUM INDIKATOR
                  </div>

                  {showDialReadout ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Jarum Kecil (Putaran Penuh / mm)</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>
                          {Math.floor(dialDeflection)} mm
                        </div>
                      </div>

                      <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Jarum Besar (0.01 mm / strip)</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fbbf24' }}>
                          +{((dialDeflection % 1)).toFixed(2)} mm
                        </div>
                      </div>

                      {/* RUNOUT / TIR EVALUATION */}
                      <div style={{
                        background: isTestingRunout ? '#f0fdf4' : '#f8fafc',
                        padding: '14px',
                        borderRadius: '8px',
                        border: isTestingRunout ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800 }}>TOTAL INDICATOR READING (TIR / RUNOUT)</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace' }}>
                          {(shaftEccentricity * 2).toFixed(3)} mm
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '4px', color: (shaftEccentricity * 2) <= 0.05 ? '#047857' : '#dc2626' }}>
                          {(shaftEccentricity * 2) <= 0.05 ? '✅ LOLOS TOLERANSI (≤ 0.05 mm)' : '❌ MELEBIHI TOLERANSI (POROS BENGKOK)'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '30px 20px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px dashed #ef4444',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🙈</div>
                      <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.9rem' }}>MODE UJI BACA MANDIRI AKTIF</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '6px 0 14px 0' }}>
                        Baca posisi jarum kecil (mm) dan jarum besar (0.01 mm) langsung pada dial face, lalu klik tombol untuk mengecek ketepatan Anda.
                      </p>
                      <button
                        onClick={() => setShowDialReadout(true)}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Buka Jawaban
                      </button>
                    </div>
                  )}
                </div>

                <div className="dashboard-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                    💡 Pre-load (Tekanan Awal):
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                    Sebelum memulai pengukuran, plunger harus ditekan masuk sebesar <strong style={{ color: '#0f172a' }}>1 - 2 mm</strong> (pre-load) agar jarum dapat mendeteksi lembah (penyimpangan negatif) maupun puncak (penyimpangan positif).
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'theory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ToolAnatomySection toolKey="dial" onOpenModal={setModalImage} />

              <div className="metrology-cards-grid-2">
                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#b45309', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Mekanisme Roda Gigi Presisi (Gear Train)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    Dial indicator tidak mengukur panjang absolut benda, melainkan <strong style={{ color: '#0f172a' }}>penyimpangan relatif (komparasi)</strong> terhadap bidang acuan:
                  </p>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', marginTop: '10px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>Konversi Gerak Spindle:</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                      Batang spindle memiliki gerigi rack mikro yang menggerakkan roda gigi pinion presisi. Gerakan linear 1 mm diperbesar menjadi 1 putaran 360° jarum penunjuk (rasio pembesaran ~300x).
                    </div>
                  </div>
                </div>

                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Aplikasi Uji Geometri di Industri
                  </h3>
                  <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <li><strong style={{ color: '#0f172a' }}>Keolengan Poros (Runout TIR):</strong> Menguji kelurusan poros bubut atau spindel mesin frais saat berputar.</li>
                    <li><strong style={{ color: '#0f172a' }}>Kesejajaran (Parallelism):</strong> Menguji apakah permukaan bidang sejajar dengan meja mesin.</li>
                    <li><strong style={{ color: '#0f172a' }}>Kerataan (Flatness):</strong> Menguji kelendutan blok silinder mesin motor/mobil.</li>
                    <li><strong style={{ color: '#0f172a' }}>Centering Benda Kerja:</strong> Menentukan titik tengah benda kerja bulat pada chuck mesin bubut 4 rahang independen.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sop' && (
            <div className="dashboard-card" style={{ padding: '24px' }}>
              <h3 style={{ color: '#b45309', fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
                SOP Pengukuran Dial Indicator dengan Magnetic Stand
              </h3>
              <div className="metrology-cards-grid-4">
                {[
                  { step: '01', title: 'Pasang Magnetic Stand', desc: 'Tempelkan alas magnet pada permukaan besi kaku, putar tuas ke posisi "ON". Kencangkan seluruh lengan sambungan tanpa kendur.' },
                  { step: '02', title: 'Sudut Plunger 90°', desc: 'Posisikan spindle tegak lurus sempurna terhadap permukaan benda. Kemiringan sudut akan menimbulkan cosinus error pada pembacaan.' },
                  { step: '03', title: 'Beri Tekanan Awal (Pre-load)', desc: 'Sentuhkan sensor hingga jarum berputar 1-2 putaran penuh, lalu putar bezel luar hingga jarum panjang menunjuk tepat angka 0.' },
                  { step: '04', title: 'Amati Simpangan TIR', desc: 'Putar poros perlahan dengan tangan, catat simpangan ke kanan (+) dan ke kiri (-). Nilai TIR adalah total bentang simpangan tersebut.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309', marginBottom: '8px' }}>{item.step}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FEELER GAUGE (KALIBER CELAH)                                           */}
      {/* ========================================================================= */}
      {activeTool === 'feeler' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'simulator' && (
            <div className="metrology-lab-grid">
              
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Simulasi: Pemeriksaan Celah Presisi dengan Feeler Gauge
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('theory');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(6, 182, 212, 0.12)',
                        border: '1px solid #06b6d4',
                        color: '#0891b2',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Buka diagram anatomi dan komponen feeler gauge"
                    >
                      <span>📖</span>
                      <span>Gambar Anatomi</span>
                    </button>
                    {[
                      { id: 'valve', label: 'Celah Katup Mesin (0.20 mm)', gap: 0.20 },
                      { id: 'sparkplug', label: 'Celah Busi (0.75 mm)', gap: 0.75 },
                      { id: 'piston', label: 'Celah Ring Piston (0.35 mm)', gap: 0.35 }
                    ].map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          sound.playClick();
                          setGapMode(preset.id);
                          setSimulatedGap(preset.gap);
                          setGapInspectionResult(null);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: gapMode === preset.id ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f8fafc',
                          border: gapMode === preset.id ? '1px solid #059669' : '1px solid #cbd5e1',
                          color: gapMode === preset.id ? '#ffffff' : '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FEELER GAUGE SVG VISUALIZATION */}
                <div className="metrology-svg-container">
                  <svg viewBox="0 0 760 280" style={{ width: "100%", maxWidth: "760px", height: "auto", display: "block", userSelect: "none" }}>
                    {/* MECHANICAL GAP SIMULATION (e.g. Rocker Arm & Valve Stem) */}
                    <g transform="translate(140, 140)">
                      {/* Top Rocker Arm Tip */}
                      <path d="M -70 -100 L 70 -100 L 70 -30 L 40 -10 L -40 -10 L -70 -30 Z" fill="#475569" stroke="#334155" strokeWidth="2" />
                      <text x="0" y="-50" fontSize="10" fontWeight="bold" fill="#f8fafc" textAnchor="middle">
                        ROCKER ARM
                      </text>

                      {/* Mechanical Gap Area (Height = simulatedGap * 100 px) */}
                      {/* Scale: 1 mm = 100 px -> 0.20 mm = 20 px, 0.35 mm = 35 px */}
                      <rect
                        x="-40"
                        y={-10}
                        width="80"
                        height={simulatedGap * 80 + 10}
                        fill="rgba(56, 189, 248, 0.15)"
                        stroke="#38bdf8"
                        strokeDasharray="3,3"
                      />
                      <text x="-48" y={simulatedGap * 40} fontSize="10" fontWeight="bold" fill="#38bdf8" textAnchor="end">
                        CELAH: {simulatedGap.toFixed(2)} mm
                      </text>

                      {/* Bottom Valve Stem */}
                      <rect x="-30" y={simulatedGap * 80 + 10} width="60" height="100" fill="#64748b" stroke="#334155" strokeWidth="2" />
                      <text x="0" y={simulatedGap * 80 + 60} fontSize="10" fontWeight="bold" fill="#f8fafc" textAnchor="middle">
                        VALVE STEM
                      </text>
                    </g>

                    {/* FEELER GAUGE BLADES FANNING OUT FROM PIVOT */}
                    <g transform="translate(560, 140)">
                      {/* Metal Sheath (Sarung Bilah) */}
                      <rect x="-30" y="-20" width="140" height="40" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                      <circle cx="-10" cy="0" r="10" fill="#64748b" stroke="#334155" strokeWidth="2" />
                      <text x="50" y="5" fontSize="10" fontWeight="bold" fill="#cbd5e1" textAnchor="middle">
                        FEELER GAUGE SET
                      </text>

                      {/* Stacked Selected Blades Extending to the Left into the Gap */}
                      {selectedBlades.map((b, bi) => {
                        const totalStack = selectedBlades.reduce((a, c) => a + c, 0);
                        const isInserted = gapInspectionResult !== null;
                        const bladeX = isInserted ? -360 : -220 - bi * 15;
                        return (
                          <g key={'b-' + bi} transform={`translate(${bladeX}, ${-bi * 4})`}>
                            <rect
                              x="0"
                              y="-6"
                              width="230"
                              height="12"
                              rx="3"
                              fill="#cbd5e1"
                              stroke="#64748b"
                              strokeWidth="1"
                            />
                            <text x="110" y="3" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                              {b.toFixed(2)} mm
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                </div>

                {/* BLADE SELECTOR PALETTE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Pilih Bilah Ukur untuk Dikombinasikan (Klik untuk Tambah/Hapus):
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#047857' }}>
                      Total Tebal Bilah: {(selectedBlades.reduce((a, b) => a + b, 0)).toFixed(2)} mm
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {availableBlades.map((blade) => {
                      const isSelected = selectedBlades.includes(blade);
                      return (
                        <button
                          key={blade}
                          onClick={() => {
                            sound.playClick();
                            if (isSelected) {
                              setSelectedBlades(selectedBlades.filter(b => b !== blade));
                            } else {
                              setSelectedBlades([...selectedBlades, blade]);
                            }
                            setGapInspectionResult(null);
                          }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            background: isSelected ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f8fafc',
                            border: isSelected ? '1px solid #059669' : '1px solid #cbd5e1',
                            color: isSelected ? '#ffffff' : '#0f172a',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          {blade.toFixed(2)} mm
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TEST INSERTION BUTTON */}
                <button
                  onClick={checkFeelerFit}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  🔍 Masukkan Bilah ke Celah (Uji Feeling Sentuhan)
                </button>

              </div>

              {/* TACTILE FEEDBACK & DIAGNOSTIC RESULT */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="dashboard-card" style={{ padding: '20px', border: '1px solid rgba(2, 132, 199, 0.4)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', letterSpacing: '1px', marginBottom: '10px' }}>
                    🪒 DIAGNOSTIK SENTUHAN (FEELING TACTILE)
                  </div>

                  {gapInspectionResult ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {gapInspectionResult === 'tight' && (
                        <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🛑</div>
                          <div style={{ color: '#b91c1c', fontWeight: 900, fontSize: '1rem' }}>TERLALU SEMPIT / MACET!</div>
                          <p style={{ fontSize: '0.78rem', color: '#7f1d1d', margin: '8px 0 0 0' }}>
                            Bilah tidak dapat masuk. Jangan dipaksa karena bilah baja tipis akan tertekuk permanen atau patah!
                          </p>
                        </div>
                      )}

                      {gapInspectionResult === 'snug' && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #10b981', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>✨</div>
                          <div style={{ color: '#047857', fontWeight: 900, fontSize: '1rem' }}>PAS & SNUG (SLIGHT DRAG)!</div>
                          <p style={{ fontSize: '0.78rem', color: '#14532d', margin: '8px 0 0 0' }}>
                            Tahanan geser halus dan mantap seperti menarik selembar kertas dari buku tebal. <strong>INI ADALAH UKURAN CELAH YANG TEPAT!</strong> (+15 XP)
                          </p>
                        </div>
                      )}

                      {gapInspectionResult === 'loose' && (
                        <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>⚠️</div>
                          <div style={{ color: '#b45309', fontWeight: 900, fontSize: '1rem' }}>TERLALU LONGGAR!</div>
                          <p style={{ fontSize: '0.78rem', color: '#78350f', margin: '8px 0 0 0' }}>
                            Bilah masuk tanpa hambatan sedikit pun dan bergoyang. Celah sesungguhnya lebih tebal dari bilah ini.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '24px 16px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', color: '#475569', fontSize: '0.8rem' }}>
                      Pilih kombinasi bilah lalu klik "Masukkan Bilah ke Celah" untuk menguji sensasi kelonggarannya.
                    </div>
                  )}
                </div>

                <div className="dashboard-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    📌 Golden Rule Feeler Gauge:
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                    Gunakan <strong>sesedikit mungkin bilah</strong> saat mengombinasikan ketebalan (maksimal 2-3 bilah) untuk mencegah penumpukan oli dan akumulasi toleransi error.
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'theory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ToolAnatomySection toolKey="feeler" onOpenModal={setModalImage} />

              <div className="metrology-cards-grid-2">
                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#0284c7', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Material &amp; Standar Mutu Feeler Gauge
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    Bilah feeler gauge dibuat dari baja pegas karbon tinggi (hardened and tempered spring steel):
                  </p>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7', marginTop: '10px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Standar DIN 2275:</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                      Bilah memiliki elastisitas tinggi dan batas lentur yang kuat sehingga dapat kembali lurus setelah melengkung saat dimasukkan ke celah sempit.
                    </div>
                  </div>
                </div>

                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Aplikasi Kritis pada Otomotif &amp; Mesin
                  </h3>
                  <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <li><strong>Celah Katup (Valve Clearance):</strong> Mencegah katup bocor saat panas atau floating saat rpm tinggi.</li>
                    <li><strong>Celah Busi (Spark Plug Gap):</strong> Memastikan loncatan bunga api koil pengapian optimal.</li>
                    <li><strong>Celah Ujung Ring Piston (Ring End Gap):</strong> Mencegah ring piston mengunci dinding silinder saat memuai panas.</li>
                    <li><strong>Kerataan Kepala Silinder:</strong> Dipadukan dengan penggaris perata (Precision Straight Edge) untuk mengecek kelendutan kepala silinder.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sop' && (
            <div className="dashboard-card" style={{ padding: '24px' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
                SOP Penggunaan Feeler Gauge
              </h3>
              <div className="metrology-cards-grid-4">
                {[
                  { step: '01', title: 'Bersihkan Bilah', desc: 'Seka bilah dengan kain bersih untuk membuang partikel pasir/bram yang dapat merusak akurasi atau menggores benda kerja.' },
                  { step: '02', title: 'Masukkan Sejajar', desc: 'Masukkan bilah secara lurus dan sejajar dengan celah. Jangan memasukkan bilah dengan posisi menyudut/miring.' },
                  { step: '03', title: 'Rasakan Tahanan Geser', desc: 'Tarik perlahan; geseran yang benar adalah "slight drag" (sedikit tertahan namun meluncur halus tanpa paksaan).' },
                  { step: '04', title: 'Beri Lapisan Oli', desc: 'Sebelum disimpan ke sarungnya, oleskan sedikit minyak pelumas anti-karat agar bilah tipis tidak berkarat dan lengket.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7', marginBottom: '8px' }}>{item.step}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. GAUGE BLOCK (BLOK UKUR PRESISI / SLIP GAUGE)                            */}
      {/* ========================================================================= */}
      {activeTool === 'block' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'simulator' && (
            <div className="metrology-lab-grid">
              
              <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* WIZARD 4 TAHAP WRINGING */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      Simulasi: Proses Pelengketan Blok Ukur (Wringing Process)
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setActiveTab('theory');
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid #10b981',
                          color: '#047857',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Buka diagram anatomi dan komponen gauge block"
                      >
                        <span>📖</span>
                        <span>Gambar Anatomi</span>
                      </button>
                      <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>
                        Tahap {wringStep + 1} dari 4
                      </span>
                    </div>
                  </div>

                  {/* STEP TABS */}
                  <div className="metrology-cards-grid-4">
                    {[
                      { step: 0, title: '1. Bersihkan', desc: 'Hapus debu & oli' },
                      { step: 1, title: '2. Kontak Silang', desc: 'Posisi 90° menyilang' },
                      { step: 2, title: '3. Tekan & Putar', desc: 'Slide & twist 90°' },
                      { step: 3, title: '4. Terwring!', desc: 'Menyatu sempurna' }
                    ].map(st => (
                      <button
                        key={st.step}
                        onClick={() => {
                          sound.playClick();
                          setWringStep(st.step);
                          if (st.step === 3) addXP(20);
                        }}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          background: wringStep === st.step ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f8fafc',
                          border: wringStep === st.step ? '1px solid #059669' : '1px solid #cbd5e1',
                          color: wringStep === st.step ? '#ffffff' : '#0f172a',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div>{st.title}</div>
                        <div style={{ fontSize: '0.68rem', color: wringStep === st.step ? '#e2e8f0' : '#475569', fontWeight: 500 }}>{st.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* WRINGING INTERACTIVE SVG DISPLAY */}
                  <div style={{
                    background: '#090e18',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '260px'
                  }}>
                    <svg viewBox="0 0 600 220" style={{ width: "100%", maxWidth: "600px", height: "auto", display: "block", userSelect: "none" }}>
                      <defs>
                        <linearGradient id="blockSteelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#e2e8f0" />
                          <stop offset="30%" stopColor="#f8fafc" />
                          <stop offset="70%" stopColor="#94a3b8" />
                          <stop offset="100%" stopColor="#64748b" />
                        </linearGradient>
                      </defs>

                      {/* BOTTOM BASE GAUGE BLOCK (e.g. 50 mm) */}
                      <g transform="translate(300, 150)">
                        <rect x="-100" y="-20" width="200" height="40" rx="4" fill="url(#blockSteelGrad)" stroke="#334155" strokeWidth="1.5" />
                        <text x="0" y="5" fontSize="12" fontWeight="900" fill="#0f172a" textAnchor="middle" letterSpacing="1">
                          50 mm - GRADE 0
                        </text>
                      </g>

                      {/* TOP BLOCK (TRANSFORMS ACCORDING TO WRING STEP) */}
                      {(() => {
                        if (wringStep === 0) {
                          // Clean: Separated high above
                          return (
                            <g transform="translate(300, 50)">
                              <rect x="-80" y="-15" width="160" height="30" rx="3" fill="url(#blockSteelGrad)" stroke="#334155" strokeWidth="1.5" />
                              <text x="0" y="4" fontSize="10" fontWeight="900" fill="#0f172a" textAnchor="middle">
                                1.42 mm (Dibersihkan)
                              </text>
                            </g>
                          );
                        } else if (wringStep === 1) {
                          // Cross contact: 90 degrees crossed over center
                          return (
                            <g transform="translate(300, 115)">
                              <rect x="-18" y="-70" width="36" height="140" rx="3" fill="url(#blockSteelGrad)" stroke="#f59e0b" strokeWidth="2" opacity="0.9" />
                              <text x="0" y="4" fontSize="10" fontWeight="900" fill="#92400e" textAnchor="middle">
                                1.42 mm (Silang 90°)
                              </text>
                            </g>
                          );
                        } else if (wringStep === 2) {
                          // Slide & Twist: 45 degrees rotating with pressure
                          return (
                            <g transform="translate(300, 115) rotate(45)">
                              <rect x="-80" y="-15" width="160" height="30" rx="3" fill="url(#blockSteelGrad)" stroke="#10b981" strokeWidth="2" opacity="0.9" />
                            </g>
                          );
                        } else {
                          // Wringed perfectly: Form a single solid unit!
                          return (
                            <g transform="translate(300, 95)">
                              <rect x="-80" y="-15" width="160" height="30" rx="3" fill="url(#blockSteelGrad)" stroke="#10b981" strokeWidth="2" />
                              <text x="0" y="4" fontSize="10" fontWeight="900" fill="#047857" textAnchor="middle">
                                1.42 mm (TERWRING KUAT!)
                              </text>
                              {/* Suction aura */}
                              <line x1="-80" y1="15" x2="80" y2="15" stroke="#10b981" strokeWidth="2" strokeDasharray="4,2" />
                            </g>
                          );
                        }
                      })()}
                    </svg>
                  </div>
                </div>

                {/* COMBINATOR BUILDER (TARGET NOMINAL DIMENSION) */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Tantangan Kombinasi Ukuran: Susun Target {targetBlockDimension.toFixed(3)} mm
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        Pilih balok dengan urutan eliminasi angka desimal paling belakang terlebih dahulu.
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setSelectedBlocks([]);
                      }}
                      style={{ padding: '6px 12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Reset Balok
                    </button>
                  </div>

                  {/* STANDARD SET BLOCK BUTTONS */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {standardBlocks.map((b) => {
                      const isSel = selectedBlocks.includes(b);
                      return (
                        <button
                          key={b}
                          onClick={() => toggleBlockSelection(b)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: isSel ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : '#f8fafc',
                            border: isSel ? '1px solid #b45309' : '1px solid #cbd5e1',
                            color: isSel ? '#ffffff' : '#0f172a',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          {b.toString()} mm
                        </button>
                      );
                    })}
                  </div>

                  {/* COMBINATOR PROGRESS BAR */}
                  <div style={{ background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Balok Terpilih: </span>
                      <strong style={{ fontSize: '1.2rem', color: '#ffffff', fontFamily: 'monospace' }}>
                        {currentBlockTotal.toFixed(3)} mm
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#cbd5e1', marginLeft: '12px' }}>
                        (Sisa: {targetBlockRemaining.toFixed(3)} mm)
                      </span>
                    </div>

                    {currentBlockTotal === targetBlockDimension ? (
                      <span style={{ background: '#10b981', color: '#064e3b', fontWeight: 900, padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                        🎉 TARGET TERCAPAI PRESISI!
                      </span>
                    ) : (
                      <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700 }}>
                        {selectedBlocks.length} Balok Digunakan
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* THEORY & RULES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="dashboard-card" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', letterSpacing: '1px', marginBottom: '10px' }}>
                    🧱 ATURAN KOMBINASI BLOK UKUR
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                    Untuk meminimalkan akumulasi error, kombinasikan maksimal <strong>4 hingga 5 balok</strong> dengan langkah:
                  </p>

                  <ol style={{ fontSize: '0.75rem', color: '#334155', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                    <li><strong>Langkah 1:</strong> Eliminasi desimal ke-3 (0.00x) $
ightarrow$ pilih balok 1.005 mm.</li>
                    <li><strong>Langkah 2:</strong> Eliminasi desimal ke-2 (0.0x) $
ightarrow$ pilih balok 1.42 mm.</li>
                    <li><strong>Langkah 3:</strong> Eliminasi desimal ke-1 (0.x) $
ightarrow$ pilih balok 7.0 mm.</li>
                    <li><strong>Langkah 4:</strong> Balok dasar (puluhan) $
ightarrow$ pilih balok 30.0 mm.</li>
                  </ol>
                </div>

                <div className="dashboard-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                    🌡️ Standar Temperatur Internasional:
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                    Sesuai ISO 1, semua ukuran nominal blok ukur dikalibrasi tepat pada suhu <strong>20°C (68°F)</strong>. Hindari memegang blok langsung dengan telapak tangan karena panas tubuh akan memuaikan ukuran hingga beberapa mikron.
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'theory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ToolAnatomySection toolKey="block" onOpenModal={setModalImage} />

              <div className="metrology-cards-grid-2">
                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Fisika di Balik Fenomena Wringing
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    Mengapa dua blok ukur baja bisa saling melekat kuat tanpa perekat ataupun magnet?
                  </p>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', marginTop: '10px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Gaya Van der Waals &amp; Tegangan Permukaan:</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                      Permukaan blok ukur dihaluskan dengan proses lapping hingga toleransi kerataan optik (0.05 mikron). Saat di-wring, jarak antar molekul baja menjadi begitu rapat sehingga gaya tarik molekuler Van der Waals aktif mengikat kedua balok, dibantu oleh lapisan film minyak ultra tipis.
                    </div>
                  </div>
                </div>

                <div className="dashboard-card" style={{ padding: '24px' }}>
                  <h3 style={{ color: '#b45309', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                    Tingkat Akurasi (Grade ISO 3650)
                  </h3>
                  <ul style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>Grade 00 (Reference Master):</strong> Standar acuan tertinggi di laboratorium metrologi nasional.</li>
                    <li><strong>Grade 0 (Calibration Standard):</strong> Untuk mengkalibrasi alat ukur presisi tinggi (micrometer, height gauge).</li>
                    <li><strong>Grade 1 (Toolroom):</strong> Untuk penyetelan mesin perkakas dan pemeriksaan mal potong.</li>
                    <li><strong>Grade 2 (Workshop):</strong> Untuk pengukuran benda kerja presisi langsung di lantai bengkel bubut/milling.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sop' && (
            <div className="dashboard-card" style={{ padding: '24px' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>
                SOP Penggunaan & Perawatan Gauge Block
              </h3>
              <div className="metrology-cards-grid-4">
                {[
                  { step: '01', title: 'Gunakan Sarung Tangan', desc: 'Jangan sentuh permukaan cermin langsung dengan jari telanjang karena keringat bersifat asam dan memicu korosi pitting mikron.' },
                  { step: '02', title: 'Bersihkan Pelarut Khusus', desc: 'Bersihkan lapisan minyak petroleum pelindung menggunakan pelarut cepat kering dan lap optik microfiber lembut.' },
                  { step: '03', title: 'Jangan Terpasang Lama', desc: 'Lepaskan balok ukur segera setelah pengukuran selesai (maksimal 2 jam). Membiarkannya terwring lama dapat memicu cold-welding permanen.' },
                  { step: '04', title: 'Lumasi & Simpan Kotak', desc: 'Beri lapisan tipis anti-korosi (acid-free vaseline) lalu simpan balok di kompartemen kayu aslinya secara teratur.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857', marginBottom: '8px' }}>{item.step}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. KUIS ASESMEN MEMBACA ALAT UKUR PRESISI                                  */}
      {/* ========================================================================= */}
      {activeTool === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!quizCompleted ? (
            <div className="dashboard-card" style={{ padding: '28px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              
              {/* QUIZ HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
                <div>
                  <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #10b981', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                    SOAL {currentQuizIndex + 1} DARI {quizQuestions.length}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px' }}>
                    Topik: {quizQuestions[currentQuizIndex].tool}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Skor Saat Ini</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706' }}>{quizScore} Pts</div>
                </div>
              </div>

              {/* QUESTION TEXT */}
              <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 700, marginBottom: '24px' }}>
                {quizQuestions[currentQuizIndex].question}
              </p>

              {/* OPTIONS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {quizQuestions[currentQuizIndex].options.map((option, optIdx) => {
                  let btnBg = '#f8fafc';
                  let btnBorder = '#cbd5e1';
                  let textColor = 'var(--text-main)';
                  let badgeBg = '#e2e8f0';
                  let badgeColor = '#0f172a';

                  if (isAnswerSubmitted) {
                    if (optIdx === quizQuestions[currentQuizIndex].correct) {
                      btnBg = '#ecfdf5';
                      btnBorder = '#10b981';
                      textColor = '#047857';
                      badgeBg = '#10b981';
                      badgeColor = '#ffffff';
                    } else if (optIdx === selectedAnswer) {
                      btnBg = '#fef2f2';
                      btnBorder = '#ef4444';
                      textColor = '#b91c1c';
                      badgeBg = '#ef4444';
                      badgeColor = '#ffffff';
                    }
                  } else if (selectedAnswer === optIdx) {
                    btnBg = '#f0f9ff';
                    btnBorder = '#0284c7';
                    textColor = '#0369a1';
                    badgeBg = '#0284c7';
                    badgeColor = '#ffffff';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswerSubmitted}
                      onClick={() => {
                        sound.playClick();
                        setSelectedAnswer(optIdx);
                      }}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '10px',
                        background: btnBg,
                        border: `1.5px solid ${btnBorder}`,
                        color: textColor,
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        textAlign: 'left',
                        cursor: isAnswerSubmitted ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: badgeBg,
                        color: badgeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 900
                      }}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* EXPLANATION BOX */}
              {isAnswerSubmitted && (
                <div style={{
                  background: selectedAnswer === quizQuestions[currentQuizIndex].correct ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${selectedAnswer === quizQuestions[currentQuizIndex].correct ? '#10b981' : '#ef4444'}`,
                  borderRadius: '10px',
                  padding: '16px 20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontWeight: 800, color: selectedAnswer === quizQuestions[currentQuizIndex].correct ? '#047857' : '#b91c1c', marginBottom: '4px' }}>
                    {selectedAnswer === quizQuestions[currentQuizIndex].correct ? '🎉 JAWABAN BENAR! (+50 XP)' : '❌ JAWABAN KURANG TEPAT'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    {quizQuestions[currentQuizIndex].explanation}
                  </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {!isAnswerSubmitted ? (
                  <button
                    disabled={selectedAnswer === null}
                    onClick={() => {
                      if (selectedAnswer === null) return;
                      setIsAnswerSubmitted(true);
                      if (selectedAnswer === quizQuestions[currentQuizIndex].correct) {
                        sound.playSuccess();
                        setQuizScore(prev => prev + 50);
                        addXP(50);
                      } else {
                        sound.playError();
                      }
                    }}
                    style={{
                      padding: '12px 28px',
                      borderRadius: '8px',
                      background: selectedAnswer !== null ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#e2e8f0',
                      color: selectedAnswer !== null ? '#ffffff' : '#94a3b8',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      border: 'none',
                      cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Kirim Jawaban
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (currentQuizIndex + 1 < quizQuestions.length) {
                        setCurrentQuizIndex(prev => prev + 1);
                        setSelectedAnswer(null);
                        setIsAnswerSubmitted(false);
                      } else {
                        setQuizCompleted(true);
                        addMissionCompleted();
                        sound.playSuccess();
                        const totalPossible = quizQuestions.length * 50;
                        const finalScore = totalPossible > 0 ? Math.round((quizScore / totalPossible) * 100) : 0;
                        const correctCount = Math.round(quizScore / 50);
                        recordQuizResult({
                          modul: 'Alat Ukur Presisi (Metrologi)',
                          judulKuis: 'Kuis Asesmen Membaca Alat Ukur',
                          skor: finalScore,
                          jawabanBenar: correctCount,
                          totalSoal: quizQuestions.length,
                          detailJawaban: `${correctCount} dari ${quizQuestions.length} soal instrumen ukur dijawab benar (Skor: ${quizScore} Pts).`
                        });
                      }
                    }}
                    style={{
                      padding: '12px 28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {currentQuizIndex + 1 < quizQuestions.length ? 'Soal Berikutnya ➡️' : 'Selesaikan Kuis 🏆'}
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="dashboard-card" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '4rem', marginBottom: '14px' }}>🏆</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '8px' }}>
                ASESMEN METROLOGI SELESAI!
              </h2>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '20px' }}>
                Selamat! Anda telah menyelesaikan seluruh rangkaian uji pemahaman pembacaan alat ukur presisi.
              </p>

              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #10b981',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 800 }}>TOTAL SKOR ANDA</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#064e3b', fontFamily: 'monospace' }}>
                  {quizScore} Poin
                </div>
                <div style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '4px', fontWeight: 600 }}>
                  Tingkat Keberhasilan: {Math.round((quizScore / (quizQuestions.length * 50)) * 100)}%
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentQuizIndex(0);
                  setSelectedAnswer(null);
                  setIsAnswerSubmitted(false);
                  setQuizScore(0);
                  setQuizCompleted(false);
                }}
                style={{
                  padding: '12px 28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Ulangi Asesmen 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL LIGHTBOX UNTUK PERBESAR GAMBAR ANATOMI & FOTO */}
      {modalImage && (
        <div 
          onClick={() => setModalImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '1100px',
              width: '100%',
              maxHeight: '92vh',
              background: '#0f172a',
              borderRadius: '16px',
              border: '1.5px solid #334155',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1e293b' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 800 }}>{modalImage.title}</h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{modalImage.caption}</span>
              </div>
              <button 
                onClick={() => setModalImage(null)}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.9rem',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                ✕ Tutup (Esc)
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', background: '#020617' }}>
              <img 
                src={getAssetUrl(modalImage.src)} 
                alt={modalImage.title}
                style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '8px' }} 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MeasuringToolsLab;

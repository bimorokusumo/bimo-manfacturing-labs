import React, { useMemo } from 'react';

// =============================================================================
// DATABASE DOKUMENTASI INDUSTRI RIIL & MIKROSKOP METALOGRAFI
// =============================================================================
const DOCUMENTARY_DATA = {
  hardening: {
    title: 'Dokumentasi Riil Industri: Quenching Oli Baja S45C / AISI 1045',
    cameraFeed: 'KAMERA 01: LINE QUENCH OTOMATIS BENGKEL PANAS',
    mainImage: '/assets/images/heat_treatment/quench_fire_glow.jpg',
    subImage: '/assets/images/heat_treatment/hardening_gear_quench.jpg',
    standard: 'ASTM A255 / JIS G4051 S45C',
    equipment: 'Tungku Muffle Kanthal A1 1200°C • Bak Quench Oli ISO VG 32 Pompa Sirkulasi 1.5 m/s • Tester Rockwell C (Kerucut Intan 150 kgf)',
    phenomenonTitle: '🔥 Fenomena Nyata di Bengkel: Semburan Api & Uap Minyak',
    phenomenonDesc: 'Saat baja membara 850°C dicelupkan ke bak oli, minyak di permukaan langsung menyala (fire flare) karena suhu baja jauh melampaui flash point oli (~210°C). Selimut uap (vapor blanket) pecah dalam 2.5 detik pertama, membekukan atom karbon di dalam kisi kristal besi membentuk Martensit 65 HRC.',
    caution: 'PERINGATAN BENGKEL: Baja baru quench tidak boleh dipukul palu atau dijatuhkan karena getas seperti kaca!',
    micrographTitle: 'Mikroskop 500x: Jarum Martensit Acicular (BCT)',
    micrographDesc: 'Pendinginan super cepat mencegah karbon berdifusi keluar. Kisi kristal FCC austenit terdistorsi paksa menjadi Body-Centered Tetragonal (BCT) yang tampak seperti jarum-jarum tajam saling silang bersudut 60°.',
    micrographColor: '#ef4444',
    grainType: 'Martensit Jarum BCT (Acicular Martensite)'
  },
  tempering: {
    title: 'Dokumentasi Riil Industri: Spektrum Warna Oksida Bilah Baja Pahat & Pisau',
    cameraFeed: 'KAMERA 02: OVEN SIRKULASI TEMPERING & BENCH HEATING',
    mainImage: '/assets/images/heat_treatment/tempering_blade_infographic.svg',
    subImage: '/assets/images/heat_treatment/tempering_colors_guide.svg',
    standard: 'DIN 17350 / ISO 4957 Tool Steels',
    equipment: 'Tungku Sirkulasi Udara Paksa (*Forced Convection Oven*) • Bak Mandi Garam Nitrat Mendidih (Salt Bath 160°C - 550°C) • Sensor Termokopel PID ±1°C',
    phenomenonTitle: '🌈 Fenomena Nyata di Bengkel: Interferensi Warna Oksida Alami',
    phenomenonDesc: 'Warna pelangi pada permukaan baja bukan cat kimia buatan, melainkan lapisan film tipis oksida besi yang membiaskan cahaya secara interferensi optis. Kuning Jerami (220°C, 45 nm) untuk pahat bubut presisi hingga Biru Terang (300°C, 70 nm) untuk pegas elastis.',
    caution: 'PANDUAN OPERATOR: Warna hanya akurat jika permukaan baja dipoles bersih mengkilap sebelum dipanaskan!',
    micrographTitle: 'Mikroskop 500x: Martensit Temper (Sementit Submikroskopis)',
    micrographDesc: 'Pemanasan temper memungkinkan atom karbon yang terjepit sedikit bergerak dan mengendap menjadi partikel-partikel karbida sementit bulat yang sangat halus. Menghilangkan retak mikro dan meningkatkan ketangguhan impak drastis (58 HRC).',
    micrographColor: '#f59e0b',
    grainType: 'Martensit Temper + Karbida Halus (Tempered Martensite)'
  },
  annealing: {
    title: 'Dokumentasi Riil Industri: Tungku Kereta Bawah (Car-Bottom) Pelunakan 24 Jam',
    cameraFeed: 'KAMERA 03: TUNGKU INDUSTRI CAR-BOTTOM 20 TON',
    mainImage: '/assets/images/heat_treatment/heat_treatment_furnace.jpg',
    subImage: '/assets/images/heat_treatment/annealing_cooling_infographic.svg',
    standard: 'ASTM A384 / JIS G0551 Full Anneal',
    equipment: 'Tungku Car-Bottom Gas Alam 20 Ton • Isolasi Keramik Fiber Refraktori Tebal 300 mm • Programmer PLC Penurunan Suhu 15°C/Jam',
    phenomenonTitle: '🧘 Fenomena Nyata di Bengkel: Pendinginan Super Lambat 24 Jam',
    phenomenonDesc: 'Blok baja tempa dan cor berbobot ratusan kilogram dimasukkan ke dalam tungku car-bottom. Setelah mencapai 850°C dan ditahan (soaking), burner dimatikan dan pintu diisolasi rapat. Penurunan suhu dikontrol sangat lambat (10-20°C per jam) selama 12 hingga 24 jam untuk menghasilkan Perlit Kasar yang sangat lunak (12 HRC / 160 HB) agar pisau frais dan pahat bubut CNC awet berhari-hari.',
    caution: 'FAKTA BIAYA: Biaya energi tungku anneal 24 jam sangat tinggi, namun menghemat puluhan juta rupiah dari keawetan mata pahat bubut karbida!',
    micrographTitle: 'Mikroskop 500x: Perlit Kasar Lamela Tebal + Ferit Bebas',
    micrographDesc: 'Karena pendinginan sangat lambat di dalam oven yang tertutup rapat, atom karbon memiliki waktu leluasa untuk berdifusi membentuk pelat-pelat sementit (Fe₃C) tebal berselang-seling dengan ferit lunak berjarak lebar (coarse lamellar spacing).',
    micrographColor: '#0284c7',
    grainType: 'Perlit Kasar Berselang Ferit (Coarse Pearlite)'
  },
  normalizing: {
    title: 'Dokumentasi Riil Industri: Rak Pendinginan Udara Bebas Rel Kereta Api & Crankshaft',
    cameraFeed: 'KAMERA 04: RAK TERBUKA PENDINGINAN UDARA NORMALIZING',
    mainImage: '/assets/images/heat_treatment/annealing_vs_normalizing_diagram.svg',
    subImage: '/assets/images/heat_treatment/hot_metal_forging_quench.jpg',
    standard: 'AREMA Chapter 4 (Rel KA) / ASTM A36',
    equipment: 'Tungku Pemanas 920°C Kamar Austenit • Rak Pendingin Kisi Baja Terbuka Sirkulasi Bebas • Pyrometer Inframerah Non-Kontak',
    phenomenonTitle: '💨 Fenomena Nyata di Bengkel: Rekristalisasi Butir di Udara Bebas',
    phenomenonDesc: 'Komponen tempa panas diangkat pada suhu 900°C dan dijajarkan pada rak baja terbuka. Aliran konveksi udara alami kamar mendinginkan baja lebih cepat dibanding annealing tungku tertutup, memicu nukleasi kristal yang rapat dan halus (ASTM grain size 7-8). Menghasilkan ketangguhan impak tinggi tanpa adanya getas ataupun tegangan sisa tempa.',
    caution: 'APLIKASI NYATA: Rel kereta api wajib di-normalize agar tidak patah retak lelah (fatigue failure) saat dilindas lokomotif ratusan ton.',
    micrographTitle: 'Mikroskop 500x: Butir Kristal Halus Seragam Rapat (ASTM 8)',
    micrographDesc: 'Laju pendinginan udara bebas menghasilkan laju nukleasi kristal yang tinggi. Butiran kristal ferit dan perlit tumbuh halus, homogen, dan seragam, menghasilkan kekuatan luluh (*yield strength*) dan ketangguhan impak superior.',
    micrographColor: '#10b981',
    grainType: 'Perlit Halus Seragam (Fine Equiaxed Pearlite)'
  },
  'case-hardening': {
    title: 'Dokumentasi Riil Industri: Karburasi Padat (Pack Carburizing) Roda Gigi Transmisi',
    cameraFeed: 'KAMERA 05: KOTAK RETORT KARBURASI SERBUK ARANG 920°C',
    mainImage: '/assets/images/heat_treatment/case_hardening_diagram.svg',
    subImage: '/assets/images/heat_treatment/pack_carburizing_box.svg',
    standard: 'SAE J423 / ISO 2639 Case Depth Standard',
    equipment: 'Kotak Retort Baja Paduan Tahan Panas Inconel 600 • Serbuk Arang Kayu Keras + 10% Barium Karbonat BaCO₃ • Bak Quench Air Bertekanan',
    phenomenonTitle: '🛡️ Fenomena Nyata di Bengkel: Difusi Karbon & Belahan Penampang',
    phenomenonDesc: 'Roda gigi baja karbon rendah (AISI 1020 / St 37) dimasukkan ke kotak baja tahan panas berisi arang kayu keras dan aktivator Barium Karbonat (BaCO₃), lalu disegel lempung tanah api (fireclay). Dipanaskan pada 920°C selama 6 jam. Karbon berdifusi masuk sedalam 1.0 mm ke permukaan. Setelah di-quench air, kulit menjadi Martensit 62 HRC anti-aus sedangkan inti tetap Ferit-Perlit 22 HRC ulet menyerap kejutan torsi mesin.',
    caution: 'UJI PENAMPANG: Benda uji dipotong dan dietsa asam nital 2% untuk memverifikasi kedalaman kulit keras (effective case depth = 1.0 mm).',
    micrographTitle: 'Mikroskop 500x: Gradasi Fasa Kulit Luar (62 HRC) ke Inti (22 HRC)',
    micrographDesc: 'Penampang melintang menunjukkan transisi konsentrasi karbon dari 0.9% C di permukaan luar (Martensit jarum padat) melandai ke 0.2% C di inti dalam (Ferit poligonal + Perlit lunak).',
    micrographColor: '#a855f7',
    grainType: 'Gradien Karburasi (Case Martensite ➔ Core Ferrite)'
  },
  blackening: {
    title: 'Dokumentasi Riil Industri: Jalur 7 Tangki Kimia Hot Black Oxide Baut Presisi',
    cameraFeed: 'KAMERA 06: LINI 7 TANGKI OTOMATIS HOT BLACK OXIDE',
    mainImage: '/assets/images/heat_treatment/black_oxide_screws_parts.jpg',
    subImage: '/assets/images/heat_treatment/blackening_tank_diagram.svg',
    standard: 'MIL-DTL-13924 Class 1 / DIN 50938',
    equipment: 'Jalur 7 Tangki Stainless Steel SUS-316L • Pemanas Celup Titanium Digital 15 kW • Bak Garam Kaustik Mendidih 142°C • Bak Minyak Pelindung ASTM D-1748',
    phenomenonTitle: '⚫ Fenomena Nyata di Bengkel: Konversi Kimia Hitam Pekat Tanpa Ubah Ukuran',
    phenomenonDesc: 'Proses kimia konversi panas pada suhu mendidih 140°C - 145°C menggunakan larutan garam kaustik nitrit/nitrat. Besi permukaan (Fe) bereaksi membentuk Magnetit (Fe₃O₄) setebal 1 - 2 mikron berwarna hitam pekat mengkilap. Tidak mengubah dimensi sedikitpun (toleransi 0.000 mm), lalu disegel cairan oli anti-karat pelindung (water displacing oil).',
    caution: 'KEUNGGULAN PRESISI: Baut dan mur presisi tidak akan seret atau macet karena ketebalan lapisan tidak menambah toleransi ulir!',
    micrographTitle: 'Mikroskop 500x: Lapisan Film Konversi Magnetit Fe₃O₄ (1.5 µm)',
    micrographDesc: 'Permukaan logam ditutupi kristal senyawa oksida besi hitam Fe₃O₄ yang terikat secara molekuler (bukan lapisan cat yang bisa mengelupas). Pori-pori mikro kristal menyerap molekul minyak oli pelindung anti-oksigen.',
    micrographColor: '#38bdf8',
    grainType: 'Kristal Konversi Magnetit Fe₃O₄ (1.5 µm)'
  }
};

export default function HeatTreatmentRealDocumentary({
  processId = 'hardening',
  viewMode = 'real-video',
  currentTime = 0,
  duration = 36,
  temp = 25,
  hrc = 20,
  phase = '',
  isPlaying = false
}) {
  const data = DOCUMENTARY_DATA[processId] || DOCUMENTARY_DATA.hardening;

  // ===========================================================================
  // MODE 1: VIDEO DOKUMENTASI NYATA INDUSTRI (REAL WORKSHOP FOOTAGE & PHOTOS)
  // ===========================================================================
  if (viewMode === 'real-video') {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#020617',
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Broadcast Camera Feed Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'rgba(15, 23, 42, 0.95)',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#ef4444',
              animation: isPlaying ? 'pulse 1s infinite' : 'none',
              boxShadow: '0 0 8px #ef4444'
            }} />
            <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 900, color: '#f8fafc', letterSpacing: '1px' }}>
              ● LIVE INDUSTRIAL FEED: {data.cameraFeed}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
            STANDAR: {data.standard}
          </div>
        </div>

        {/* Real Industrial Photo & Graphic Showcase Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* Hero Real Image Box */}
          <div style={{
            background: '#0f172a',
            borderRadius: '10px',
            border: '1px solid #334155',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <div style={{
              position: 'relative',
              height: '210px',
              background: '#000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              <img
                src={data.mainImage}
                alt={data.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#020617',
                  filter: 'brightness(1.05) contrast(1.1)'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.75)',
                color: '#facc15',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 800,
                border: '1px solid #ca8a04'
              }}>
                📸 FOTO INDUSTRI RIIL
              </div>
            </div>
            <div style={{ padding: '10px 12px', background: '#0b1120' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                {data.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Alat: {data.equipment}
              </div>
            </div>
          </div>

          {/* Secondary Inspection Box & Real Phenomenon */}
          <div style={{
            background: '#0f172a',
            borderRadius: '10px',
            border: '1px solid #334155',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f97316', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {data.phenomenonTitle}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                {data.phenomenonDesc}
              </p>
            </div>

            {/* Industrial Observation Checklist */}
            <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '10px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                🔍 CATATAN PARAMETER BENGKEL TEKNIK:
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>• Suhu Operasi Aktual: <strong style={{ color: '#facc15' }}>{temp}°C</strong></div>
                <div>• Kekerasan Permukaan: <strong style={{ color: '#38bdf8' }}>{hrc} HRC</strong></div>
                <div>• Fasa Logam Saat Ini: <strong style={{ color: '#a7f3d0' }}>{phase}</strong></div>
              </div>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '0.72rem',
              color: '#fca5a5',
              fontWeight: 700
            }}>
              {data.caution}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // MODE 2: MIKROSKOP METALOGRAFI RIIL (REAL MICROSTRUCTURE 500x)
  // ===========================================================================
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: '#020617',
      overflowY: 'auto',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Microscope Viewport Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>🔬</span>
          <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 900, color: '#f8fafc' }}>
            OPTICAL MICROSCOPE PERBESARAN 500x &bull; ETCH: NITAL 2% (HNO₃ + ALKOHOL)
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#10b981', fontFamily: 'monospace', fontWeight: 800 }}>
          SKALA: 50 µm &bull; RETIKEL AKTIF
        </div>
      </div>

      {/* Circular Microscope Ocular Lens & Explanation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', alignItems: 'center' }}>
        {/* Microscope Eyepiece Circle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'relative',
            width: '230px',
            height: '230px',
            borderRadius: '50%',
            background: '#0f172a',
            border: '8px solid #334155',
            boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.9)',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* SVG Microstructure simulation matching real SEM / Optical micrograph */}
            <svg width="100%" height="100%" viewBox="0 0 230 230">
              {/* Grain background */}
              <rect width="230" height="230" fill={processId === 'hardening' ? '#1e293b' : (processId === 'annealing' ? '#334155' : '#1e293b')} />

              {/* Hardening: Needles of Martensite */}
              {processId === 'hardening' && (
                <g stroke="#f87171" strokeWidth="2.5" opacity="0.85">
                  <line x1="30" y1="40" x2="110" y2="120" />
                  <line x1="110" y1="120" x2="190" y2="60" />
                  <line x1="60" y1="160" x2="140" y2="90" />
                  <line x1="140" y1="90" x2="180" y2="180" />
                  <line x1="20" y1="100" x2="90" y2="170" />
                  <line x1="90" y1="50" x2="160" y2="140" />
                  <line x1="70" y1="20" x2="130" y2="70" />
                  <line x1="120" y1="170" x2="200" y2="130" />
                  <line x1="40" y1="190" x2="110" y2="210" />
                </g>
              )}

              {/* Tempering: Tempered Martensite with precipitated carbide dots */}
              {processId === 'tempering' && (
                <g>
                  {/* Martensite ghost needles */}
                  <g stroke="#94a3b8" strokeWidth="1.5" opacity="0.4">
                    <line x1="30" y1="40" x2="110" y2="120" />
                    <line x1="110" y1="120" x2="190" y2="60" />
                    <line x1="60" y1="160" x2="140" y2="90" />
                    <line x1="140" y1="90" x2="180" y2="180" />
                  </g>
                  {/* Submicroscopic carbide dots */}
                  {Array.from({ length: 45 }).map((_, i) => (
                    <circle
                      key={i}
                      cx={(i * 37) % 210 + 10}
                      cy={(i * 47) % 210 + 10}
                      r="2.5"
                      fill="#facc15"
                      opacity="0.8"
                    />
                  ))}
                </g>
              )}

              {/* Annealing: Coarse Lamellar Pearlite stripes */}
              {processId === 'annealing' && (
                <g stroke="#94a3b8" strokeWidth="4" opacity="0.75">
                  {[-40, -20, 0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220].map((y, i) => (
                    <line key={i} x1="10" y1={y} x2="220" y2={y + 35} strokeDasharray={i % 2 === 0 ? '18,8' : '10,5'} />
                  ))}
                </g>
              )}

              {/* Normalizing: Fine Equiaxed Pearlite & Ferrite grains */}
              {processId === 'normalizing' && (
                <g stroke="#38bdf8" strokeWidth="1.8" fill="none" opacity="0.7">
                  {/* Fine grain boundaries polygon mesh */}
                  <polygon points="30,30 70,25 90,60 50,75" />
                  <polygon points="70,25 120,30 135,70 90,60" />
                  <polygon points="120,30 170,25 180,65 135,70" />
                  <polygon points="50,75 90,60 85,115 40,110" />
                  <polygon points="90,60 135,70 140,120 85,115" />
                  <polygon points="135,70 180,65 195,115 140,120" />
                  <polygon points="40,110 85,115 75,165 30,155" />
                  <polygon points="85,115 140,120 130,170 75,165" />
                  <polygon points="140,120 195,115 190,165 130,170" />
                  <polygon points="75,165 130,170 120,210 65,205" />
                </g>
              )}

              {/* Case Hardening: Case (Left) vs Core (Right) boundary */}
              {processId === 'case-hardening' && (
                <g>
                  {/* Hardened Case (Dense Martensite needles) */}
                  <rect x="0" y="0" width="115" height="230" fill="#1e1b4b" opacity="0.6" />
                  <g stroke="#c084fc" strokeWidth="2" opacity="0.8">
                    <line x1="15" y1="30" x2="65" y2="85" />
                    <line x1="65" y1="85" x2="105" y2="40" />
                    <line x1="20" y1="120" x2="80" y2="160" />
                    <line x1="40" y1="180" x2="100" y2="130" />
                  </g>
                  {/* Boundary Line at 1.0mm */}
                  <line x1="115" y1="0" x2="115" y2="230" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="6,4" />
                  {/* Tough Core (Ferrite + Pearlite) */}
                  <g stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.6">
                    <polygon points="125,40 165,30 180,80 135,75" />
                    <polygon points="135,75 180,80 170,140 130,130" />
                    <polygon points="130,130 170,140 185,190 140,195" />
                  </g>
                </g>
              )}

              {/* Blackening: 1.5 um Magnetite crystals layer */}
              {processId === 'blackening' && (
                <g>
                  <rect x="0" y="0" width="230" height="70" fill="#09090b" />
                  {/* Magnetite crystals */}
                  {Array.from({ length: 30 }).map((_, i) => (
                    <rect
                      key={i}
                      x={i * 8}
                      y={65 + ((i * 13) % 10)}
                      width="7"
                      height="8"
                      fill="#000000"
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                    />
                  ))}
                  {/* Base steel below */}
                  <rect x="0" y="80" width="230" height="150" fill="#334155" />
                  <text x="115" y="40" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                    LAPISAN Fe₃O₄ MAGNETIT (1.5 µm)
                  </text>
                  <text x="115" y="140" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
                    BAJA DASAR S45C (FERIT + PERLIT)
                  </text>
                </g>
              )}

              {/* Reticle Crosshairs & Center Rings */}
              <line x1="0" y1="115" x2="230" y2="115" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="115" y1="0" x2="115" y2="230" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="115" cy="115" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
              <circle cx="115" cy="115" r="85" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
            </svg>

            {/* Scale Bar Badge at bottom of eyepiece */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.85)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #38bdf8',
              fontSize: '0.65rem',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontWeight: 800,
              whiteSpace: 'nowrap'
            }}>
              |——— 50 µm ———|
            </div>
          </div>
        </div>

        {/* Metallurgical Microstructure Explanation Box */}
        <div style={{
          background: '#0f172a',
          borderRadius: '10px',
          border: '1px solid #334155',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              STRUKTUR FASA MIKROSKOP:
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: data.micrographColor, marginTop: '2px' }}>
              {data.micrographTitle}
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>
            {data.micrographDesc}
          </p>

          {/* Phase Telemetry Table */}
          <div style={{ background: 'rgba(2, 6, 23, 0.7)', borderRadius: '8px', padding: '10px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem' }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Bentuk Kristal:</span><br />
                <strong style={{ color: '#f8fafc' }}>{data.grainType}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Kekerasan Fase:</span><br />
                <strong style={{ color: '#38bdf8' }}>{hrc} HRC ({temp}°C)</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Kelarutan Karbon:</span><br />
                <strong style={{ color: '#a7f3d0' }}>0.02% s/d 0.8% C</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Metode Etsa:</span><br />
                <strong style={{ color: '#facc15' }}>Nital 2% (20 detik)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { sound } from '../utils/audio';
import Welding3D from './Welding3D';
import ErrorBoundary from './ErrorBoundary';
import WeldingTheoryGuide from './WeldingTheoryGuide';
import WeldingQuiz from './WeldingQuiz';
import LabDiagnosticBanner from './LabDiagnosticBanner';

const DEFECT_TYPES = [
  { 
    id: 'porosity', 
    name: 'Porosity (Keropos / Rongga Gas)', 
    realPhotoUrl: '/assets/images/defects/real_porosity.jpg',
    altPhotoUrl: '/assets/images/defects/porosity_alt.jpg',
    standardBadge: 'AWS D1.1 Table 6.1 (Pore < 2.5 mm)',
    severity: 'Sedang / Kritis jika bergerombol (Cluster)',
    cause: 'Alasan utama: Masuknya gas atmosfer (nitrogen, oksigen, atau hidrogen) ke dalam kawah cairan logam las sebelum membeku. Terjadi akibat permukaan plat berminyak, basah, berkarat, kawat elektroda lembab (belum di-oven pada suhu 300°C untuk kawat low-hydrogen), atau hembusan angin keras yang meniup selubung gas pelindung.', 
    solution: 'Bersihkan base metal dengan gerinda hingga mengkilap sebelum dilas, panaskan kawat las di oven elektroda (welding oven), dan pasang tirai penghalang angin (wind screen) di area kerja.',
    fieldInspection: 'Terlihat lubang jarum halus (pinholes) menyebar atau membentuk koloni gerombolan (cluster porosity) pada permukaan maupun di dalam penampang hasil lasan.',
    googleQuery: 'welding defect porosity macro photo'
  },
  { 
    id: 'undercut', 
    name: 'Undercut (Torehan / Parit Tepi Las)', 
    realPhotoUrl: '/assets/images/defects/real_undercut.jpg',
    altPhotoUrl: '/assets/images/defects/undercut_alt.jpg',
    standardBadge: 'ISO 5817 Level C/D (Kedalaman maks 0.5 - 1 mm)',
    severity: 'Kritis (Pemicu Takik Tegangan & Retak Lelah)',
    cause: 'Alasan utama: Panas masukan berlebih (overheating) mencairkan dinding tepi logam induk, namun logam pengisi dari kawat las tidak mengisi cerukan tersebut. Biasa disebabkan oleh arus las (Ampere) yang disetel terlalu tinggi, pergerakan tangan (travel speed) terlalu kencang, atau juru las tidak melakukan jeda (pause) sejenak di tepi ayunan kampuh.', 
    solution: 'Turunkan arus las sesuai tabel diameter kawat, perlambat laju ayunan elektroda, dan tahan gerakan (pause 0.5 - 1 detik) di dinding kiri dan kanan kampuh agar cairan logam las mengisi penuh cerukan sebelum berpindah.',
    fieldInspection: 'Terdapat cerukan atau parit tajam yang terkeruk pada base metal sepanjang kaki lasan (weld toe).',
    googleQuery: 'welding defect undercut macro photo toe'
  },
  { 
    id: 'spatter', 
    name: 'Spatter (Percikan Logam Beku)', 
    realPhotoUrl: '/assets/images/defects/real_spatter_smaw.jpg',
    altPhotoUrl: '/assets/images/defects/real_spatter_gmaw.jpg',
    standardBadge: 'AWS Visual Inspection & Surface Quality',
    severity: 'Ringan - Estetika Permukaan & Finishing Cat',
    cause: 'Alasan utama: Ketidakstabilan busur listrik las. Terjadi karena jarak ujung elektroda dengan benda kerja (arc length) terlalu panjang/jauh sehingga voltase melonjak dan busur meletup liar, ampere terlalu tinggi, atau elektroda mengandung kelembaban tinggi.', 
    solution: 'Dekatkan ujung elektroda ke benda kerja (pertahankan busur rapat 2 - 3 mm atau sama dengan diameter kawat inti), seimbangkan arus listrik, dan semprotkan cairan anti-spatter spray pada plat agar butiran mudah dibersihkan dengan sikat kawat.',
    fieldInspection: 'Butiran-butiran bulat logam cair yang membeku dan menempel kuat di permukaan plat di sekitar jalur pengelasan.',
    googleQuery: 'excessive spatter welding defect real macro photo'
  },
  { 
    id: 'slag', 
    name: 'Slag Inclusion (Terak Terperangkap)', 
    realPhotoUrl: '/assets/images/defects/real_slag.jpg',
    altPhotoUrl: '/assets/images/defects/slag_alt.jpg',
    standardBadge: 'Radiographic Testing (RT) / AWS D1.1',
    severity: 'Kritis jika Memanjang (Mengurangi Penampang Las)',
    cause: 'Alasan utama: Cairan logam las membeku mendahului terak pelindung sehingga terak non-logam tidak sempat mengapung ke atas dan malah terjebak di dalam daging las. Sangat sering terjadi jika terak dari lapisan sebelumnya (multi-pass) tidak dibersihkan total sebelum menumpuk pass berikutnya, atau sudut elektroda terlalu rebah sehingga terak mendahului busur las.', 
    solution: 'Wajib bersihkan terak secara 100% tuntas menggunakan palu terak (chipping hammer) dan sikat baja di setiap lapisan (interpass cleaning). Pertahankan sudut kemiringan elektroda yang benar yaitu 70 hingga 80 derajat terhadap garis lurus benda kerja atau sedikit miring (menarik) sekitar 10 hingga 15 derajat dari posisi tegak lurus agar gaya hembus busur menahan cairan terak tetap di belakang kawah las.',
    fieldInspection: 'Gumpalan partikel terak non-logam berwarna gelap/kehitaman terjebak di dalam deposit logam las atau di antara batas lapisan las.',
    googleQuery: 'slag inclusion welding defect macro photo'
  },
  { 
    id: 'crack', 
    name: 'Crack (Retak Las / Retak Memanjang & Kawah)', 
    realPhotoUrl: '/assets/images/defects/real_crack_longitudinal.jpg',
    altPhotoUrl: '/assets/images/defects/real_crack_crater.jpg',
    standardBadge: 'ZERO TOLERANCE - IMMEDIATE REJECT (AWS D1.1)',
    severity: 'SANGAT KRITIS / DILARANG (Struktur Berisiko Patah Getas)',
    cause: 'Alasan utama: Terjadinya konsentrasi tegangan sisa tarik (residual stress) yang melebihi kekuatan luluh logam saat pendinginan cepat, kandungan karbon tinggi pada baja tanpa pre-heating, atau menghentikan busur las mendadak di kawah akhir tanpa mengisi cekungan kawah (crater crack).', 
    solution: 'Lakukan pemanasan awal (preheating) pada baja tebal atau berkadar karbon tinggi, putar elektroda sejenak di ujung sambungan untuk mengisi penuh cekungan kawah (crater filling) sebelum mematikan busur, dan gunakan elektroda low-hydrogen (E7018 / LB-52).',
    fieldInspection: 'Garis retakan tajam terlihat memanjang di tengah manik las (centerline crack) atau retak menjalar berbentuk bintang di kawah akhir las.',
    googleQuery: 'weld crack longitudinal crater defect macro photo'
  },
  { 
    id: 'incomplete_penetration', 
    name: 'Incomplete Penetration (Penetrasi Dangkal / Kurang Tembus)', 
    realPhotoUrl: '/assets/images/defects/incomplete_penetration_alt.jpg',
    altPhotoUrl: '/assets/images/defects/lack_of_fusion_weldguru.jpg',
    standardBadge: 'Root Pass Standard (AWS D1.1 Root Inspection)',
    severity: 'Kritis (Akar Sambungan Bawah Tidak Menyatu)',
    cause: 'Alasan utama: Logam las tidak mampu menembus hingga ke dasar akar kampuh (root). Disebabkan oleh celah akar (root gap) yang disetel terlalu rapat/sempit, bibir akar (root face) terlalu tebal, arus pengelasan root pass terlalu rendah, atau kecepatan jalan elektroda terlalu kencang.', 
    solution: 'Beri celah akar (root gap) yang seragam (2 - 3 mm), sesuaikan tebal root face (1.5 - 2 mm), gunakan ampere yang cukup untuk penembusan akar, dan gunakan elektroda penetrasi dalam seperti E6010 / LB-52U.',
    fieldInspection: 'Bagian bawah/belakang akar sambungan (root) tidak tersambung utuh, menyisakan alur sempit tajam tanpa fusi logam cair.',
    googleQuery: 'incomplete penetration weld defect root macro photo'
  },
  { 
    id: 'burn_through', 
    name: 'Burn Through (Jebol / Tembus Las Berlebih)', 
    realPhotoUrl: '/assets/images/defects/real_burn_through1.jpg',
    altPhotoUrl: '/assets/images/defects/real_burn_through2.jpg',
    standardBadge: 'Visual Root Inspection (Blow-through Defect)',
    severity: 'Tinggi (Lubang Jebol Wajib Digerinda & Diisi Ulang)',
    cause: 'Alasan utama: Panas masukan (heat input) terlalu berlebihan sehingga dasar logam induk meleleh seluruhnya dan ambles jatuh ke bawah membentuk lubang menganga. Sering terjadi pada plat tipis karena ampere terlalu tinggi, root gap terlalu lebar, atau travel speed terlalu lambat.', 
    solution: 'Turunkan arus las terutama pada jalur akar (root pass), rapatkan root gap jika terlalu lebar, dan percepat laju jalan torch agar panas tidak terkonsentrasi di satu titik.',
    fieldInspection: 'Terbentuk lubang menganga tembus ke sisi belakang plat karena logam cair las ambles ke bawah.',
    googleQuery: 'burn through welding defect blow through photo'
  }
];

const DefectModal = ({ defect: initialDefect, allDefects = [], onClose, onSelectDefect }) => {
  const [selectedDefectState, setSelectedDefectState] = useState(initialDefect || DEFECT_TYPES[0]);
  const [activeTab, setActiveTab] = useState('photo'); // 'photo' | 'diagram'
  const [photoSubIndex, setPhotoSubIndex] = useState(0); // 0 = main, 1 = alt
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (initialDefect) {
      setSelectedDefectState(initialDefect);
      setPhotoSubIndex(0);
    }
  }, [initialDefect]);

  // Lock background scrolling and allow closing with Escape key
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const defInfo = DEFECT_TYPES.find(d => d.id === (selectedDefectState.type || selectedDefectState.id)) || DEFECT_TYPES[0];
  const currentDefect = { ...defInfo, ...selectedDefectState, id: defInfo.id, name: defInfo.name };

  const currentPhotoUrl = (photoSubIndex === 1 && currentDefect.altPhotoUrl)
    ? currentDefect.altPhotoUrl
    : (currentDefect.realPhotoUrl || defInfo.realPhotoUrl);

  const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(currentDefect.googleQuery || currentDefect.name)}`;

  const renderSvg = () => {
    switch (currentDefect.id) {
      case 'porosity':
        return (
          <svg viewBox="0 0 400 180" style={{ width: '100%', height: '200px', borderRadius: '8px', background: '#0f172a' }}>
            <rect x="20" y="100" width="360" height="60" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <path d="M 40 100 Q 200 40 360 100 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="120" cy="85" r="8" fill="#020617" stroke="#ef4444" strokeWidth="2" />
            <circle cx="180" cy="70" r="12" fill="#020617" stroke="#ef4444" strokeWidth="2" />
            <circle cx="220" cy="90" r="6" fill="#020617" stroke="#ef4444" strokeWidth="2" />
            <circle cx="270" cy="75" r="10" fill="#020617" stroke="#ef4444" strokeWidth="2" />
            <circle cx="150" cy="98" r="5" fill="#020617" stroke="#ef4444" strokeWidth="2" />
            <line x1="180" y1="35" x2="180" y2="55" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="180" y="28" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">Gas Voids / Porositas (Keropos)</text>
          </svg>
        );
      case 'undercut':
        return (
          <svg viewBox="0 0 400 180" style={{ width: '100%', height: '200px', borderRadius: '8px', background: '#0f172a' }}>
            <path d="M 20 100 C 50 100, 60 118, 75 100 L 325 100 C 340 118, 350 100, 380 100 L 380 160 L 20 160 Z" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <path d="M 75 100 Q 200 45 325 100 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 60 100 C 65 118, 70 118, 75 100" fill="none" stroke="#ef4444" strokeWidth="4" />
            <path d="M 325 100 C 330 118, 335 118, 340 100" fill="none" stroke="#ef4444" strokeWidth="4" />
            <line x1="50" y1="60" x2="65" y2="102" stroke="#ef4444" strokeWidth="1.5" />
            <text x="50" y="50" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">Cerukan Undercut</text>
            <line x1="350" y1="60" x2="335" y2="102" stroke="#ef4444" strokeWidth="1.5" />
            <text x="350" y="50" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">Cerukan Undercut</text>
          </svg>
        );
      case 'spatter':
        return (
          <svg viewBox="0 0 400 180" style={{ width: '100%', height: '200px', borderRadius: '8px', background: '#0f172a' }}>
            <rect x="20" y="100" width="360" height="60" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <path d="M 60 100 Q 200 45 340 100 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
            {[[40,88],[80,75],[110,65],[130,95],[270,92],[290,68],[330,78],[360,90],[95,108],[315,106]].map(([cx,cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r={3 + (i % 3)} fill="#f97316" stroke="#ef4444" strokeWidth="1.5" />
                <line x1={cx-4} y1={cy-4} x2={cx+4} y2={cy+4} stroke="#f59e0b" strokeWidth="1" />
              </g>
            ))}
            <line x1="100" y1="40" x2="110" y2="62" stroke="#f97316" strokeWidth="1.5" />
            <text x="100" y="30" fill="#f97316" fontSize="12" fontWeight="bold" textAnchor="middle">Percikan Logam (Spatter)</text>
          </svg>
        );
      case 'slag':
        return (
          <svg viewBox="0 0 400 180" style={{ width: '100%', height: '200px', borderRadius: '8px', background: '#0f172a' }}>
            <rect x="20" y="100" width="360" height="60" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <path d="M 80 100 Q 200 70 320 100 Z" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 60 100 Q 200 40 340 100 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" opacity="0.85" />
            <path d="M 140 85 Q 160 80 180 88 Q 165 92 140 85 Z" fill="#451a03" stroke="#ef4444" strokeWidth="2" />
            <path d="M 230 82 Q 255 78 270 85 Q 245 90 230 82 Z" fill="#451a03" stroke="#ef4444" strokeWidth="2" />
            <line x1="200" y1="35" x2="160" y2="83" stroke="#ef4444" strokeWidth="1.5" />
            <text x="200" y="25" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">Terak Terperangkap (Slag Inclusion)</text>
          </svg>
        );
      case 'crack':
        return (
          <svg viewBox="0 0 400 180" style={{ width: '100%', height: '200px', borderRadius: '8px', background: '#0f172a' }}>
            <rect x="20" y="100" width="360" height="60" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <path d="M 50 100 Q 200 45 350 100 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 200 55 L 195 70 L 205 85 L 196 102 L 204 118 L 197 135 L 202 148" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 195 70 L 184 66" fill="none" stroke="#ef4444" strokeWidth="2" />
            <path d="M 205 85 L 216 88" fill="none" stroke="#ef4444" strokeWidth="2" />
            <path d="M 196 102 L 186 106" fill="none" stroke="#ef4444" strokeWidth="2" />
            <line x1="120" y1="92" x2="185" y2="92" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="110" y="96" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="end">Retakan (Crack)</text>
            <text x="200" y="32" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">Centerline Crack (Retak Memanjang Pusat)</text>
          </svg>
        );
      case 'incomplete_penetration':
        return (
          <svg viewBox="0 0 400 180" style={{ width: '100%', height: '200px', borderRadius: '8px', background: '#0f172a' }}>
            <path d="M 20 80 L 170 80 L 185 130 L 185 160 L 20 160 Z" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <path d="M 380 80 L 230 80 L 215 130 L 215 160 L 380 160 Z" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <path d="M 170 80 Q 200 50 230 80 L 215 130 Q 200 125 185 130 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="185" y="130" width="30" height="30" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="3 3" />
            <line x1="200" y1="172" x2="200" y2="148" stroke="#ef4444" strokeWidth="1.5" />
            <text x="200" y="177" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">Akar Kampuh Tak Tembus (Root Gap Unfilled)</text>
            <text x="200" y="35" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">Incomplete Penetration (Kurang Penetrasi Akar)</text>
          </svg>
        );
      case 'burn_through':
        return (
          <svg viewBox="0 0 400 180" style={{ width: '100%', height: '200px', borderRadius: '8px', background: '#0f172a' }}>
            <path d="M 20 90 L 160 90 L 175 135 L 20 135 Z" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <path d="M 380 90 L 240 90 L 225 135 L 380 135 Z" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <path d="M 160 90 Q 200 65 240 90 L 220 120 Q 200 170 180 120 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
            <ellipse cx="200" cy="125" rx="26" ry="16" fill="#020617" stroke="#ef4444" strokeWidth="2.5" />
            <line x1="200" y1="172" x2="200" y2="148" stroke="#ef4444" strokeWidth="1.5" />
            <text x="200" y="177" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">Lubang Jebol (Melted Void / Blow-Through)</text>
            <text x="200" y="35" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">Burn Through (Jebol / Tembus Berlebih)</text>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleSelect = (d) => {
    setSelectedDefectState(d);
    setPhotoSubIndex(0);
    if (onSelectDefect) onSelectDefect(d);
  };

  const modalContent = (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.86)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '16px 16px 40px 16px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in" 
        style={{
          background: 'var(--bg-card, #0f172a)',
          borderRadius: '20px',
          border: '1px solid rgba(239, 68, 68, 0.55)',
          maxWidth: '740px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(239, 68, 68, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          marginTop: '12px',
          marginBottom: '32px'
        }}
      >
        {/* STICKY TOP HEADER - SELALU TERLIHAT DI BAGIAN PALING ATAS */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.35)',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 12px #ef4444' }} />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444', margin: 0, letterSpacing: '0.5px' }}>
                DETEKSI CACAT: {currentDefect.name.toUpperCase()}
              </h3>
              {currentDefect.pos && (
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                  Terdeteksi pada posisi jarak {Math.round(currentDefect.pos)}% sambungan las 3D
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            title="Tutup (Esc / Klik Luar)"
            style={{
              background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%',
              cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
          >
            ✕
          </button>
        </div>

        {/* MODAL BODY CONTAINER */}
        <div style={{ padding: '20px' }}>

          {/* 3D Detected Defect Dots Switcher */}
          {allDefects.length > 0 && (
            <div style={{ marginBottom: '14px', background: 'rgba(239, 68, 68, 0.12)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 800, marginBottom: '6px' }}>
                📍 TITIK CACAT PADA JALUR LAS 3D INI ({allDefects.length}):
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {allDefects.map((d, i) => {
                  const typeName = (DEFECT_TYPES.find(typeDef => typeDef.id === (d.id || d.type)) || {}).name || d.name || d.type || 'Unknown';
                  const isSelected = currentDefect.uid === d.uid || currentDefect.pos === d.pos;
                  return (
                    <button
                      key={d.uid || i}
                      onClick={() => handleSelect(d)}
                      style={{
                        background: isSelected ? '#ef4444' : 'rgba(0,0,0,0.45)',
                        border: isSelected ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                        color: '#ffffff', padding: '6px 12px', borderRadius: '8px',
                        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <span>🔴 Titik #{i + 1}:</span>
                      <span>{typeName.split(' ')[0]} ({Math.round(d.pos)}%)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Defect Types Selector (Ensiklopedia / Quick Switch) */}
          <div style={{ marginBottom: '14px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
              📚 ENSIKLOPEDIA 7 JENIS CACAT LAS LENGKAP:
            </div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {DEFECT_TYPES.map(dt => {
                const isSelected = currentDefect.id === dt.id;
                return (
                  <button
                    key={dt.id}
                    onClick={() => handleSelect(dt)}
                    style={{
                      background: isSelected ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: isSelected ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                      color: isSelected ? '#fca5a5' : 'var(--text-muted)',
                      padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem',
                      fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
                    }}
                  >
                    {dt.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Switcher: Photo vs Schematic Diagram */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveTab('photo')}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none',
                background: activeTab === 'photo' ? 'var(--game-tflm)' : 'transparent',
                color: activeTab === 'photo' ? '#000' : 'var(--text-muted)',
                fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              📸 Foto Makro Nyata (Real Workshop)
            </button>
            <button
              onClick={() => setActiveTab('diagram')}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none',
                background: activeTab === 'diagram' ? 'var(--game-tflm)' : 'transparent',
                color: activeTab === 'diagram' ? '#000' : 'var(--text-muted)',
                fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              📐 Diagram Skematik NDT (Irisan)
            </button>
          </div>

          {/* Sub-view switcher for Photo (if altPhotoUrl exists) */}
          {activeTab === 'photo' && currentDefect.altPhotoUrl && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button
                onClick={() => setPhotoSubIndex(0)}
                style={{
                  flex: 1, padding: '5px 8px', borderRadius: '6px',
                  border: photoSubIndex === 0 ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  background: photoSubIndex === 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0,0,0,0.2)',
                  color: photoSubIndex === 0 ? '#38bdf8' : 'var(--text-muted)',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                🔎 Foto 1: Tampilan Permukaan (Visual)
              </button>
              <button
                onClick={() => setPhotoSubIndex(1)}
                style={{
                  flex: 1, padding: '5px 8px', borderRadius: '6px',
                  border: photoSubIndex === 1 ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                  background: photoSubIndex === 1 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0,0,0,0.2)',
                  color: photoSubIndex === 1 ? '#38bdf8' : 'var(--text-muted)',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                🔬 Foto 2: Detail Makro / Irisan Penampang
              </button>
            </div>
          )}

          {/* Visual Display Container */}
          <div style={{
            position: 'relative', width: '100%', borderRadius: '12px',
            overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '18px',
            background: '#0a0f1d', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {activeTab === 'photo' ? (
              <div style={{ width: '100%', position: 'relative' }}>
                <img 
                  src={currentPhotoUrl} 
                  alt={currentDefect.name}
                  onClick={() => setIsZoomed(!isZoomed)}
                  title="Klik gambar untuk memperbesar"
                  style={{
                    width: '100%',
                    height: isZoomed ? '420px' : '260px',
                    objectFit: isZoomed ? 'contain' : 'cover',
                    background: '#000000',
                    display: 'block',
                    cursor: 'zoom-in',
                    transition: 'height 0.3s ease'
                  }}
                />

                {/* Verified Macro Badge */}
                <div style={{
                  position: 'absolute', top: '10px', left: '10px',
                  background: 'rgba(15, 23, 42, 0.88)', color: '#10b981',
                  padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem',
                  fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px',
                  border: '1px solid rgba(16, 185, 129, 0.4)', backdropFilter: 'blur(4px)'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                  FOTO MAKRO ASLI HASIL LAS BENGKEL
                </div>

                {/* Click to Zoom Hint */}
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(0,0,0,0.7)', color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px',
                    padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {isZoomed ? '🔍 Perkecil' : '🔍 Perbesar Foto'}
                </button>

                {/* Google Search Link Badge */}
                <a
                  href={googleImagesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: 'absolute', bottom: '10px', right: '10px',
                    background: 'rgba(0, 0, 0, 0.88)', color: '#60a5fa',
                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem',
                    fontWeight: 700, textDecoration: 'none', display: 'flex',
                    alignItems: 'center', gap: '6px', border: '1px solid rgba(96, 165, 250, 0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.6)', transition: 'transform 0.2s'
                  }}
                >
                  🌐 Cari Foto Real Lain di Google Images ↗
                </a>
              </div>
            ) : (
              <div style={{ width: '100%', padding: '10px' }}>
                {renderSvg()}
              </div>
            )}
          </div>

          {/* Meta Badges: Standard & Severity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <span style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                ⚠️ TINGKAT KEPARAHAN:
              </span>
              <span style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 700 }}>
                {currentDefect.severity || 'Sedang / Perlu Perbaikan'}
              </span>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <span style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                📋 STANDAR KEBERTERIMAAN (AWS / ISO):
              </span>
              <span style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: 700 }}>
                {currentDefect.standardBadge || 'AWS D1.1 Structural Welding Code'}
              </span>
            </div>
          </div>

          {/* Content Section: Inspection, Causes, Solutions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {currentDefect.fieldInspection && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px 14px', borderRadius: '10px', borderLeft: '4px solid #ef4444' }}>
                <strong style={{ color: '#fca5a5', fontSize: '0.85rem', display: 'block', marginBottom: '3px' }}>
                  🔍 CIRI-CIRI INSPEKSI VISUAL & NDT:
                </strong>
                <p style={{ color: 'var(--text-main)', fontSize: '0.88rem', margin: 0, lineHeight: '1.45' }}>
                  {currentDefect.fieldInspection}
                </p>
              </div>
            )}

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <strong style={{ color: '#f59e0b', fontSize: '0.85rem', display: 'block', marginBottom: '3px' }}>
                ⚡ ALASAN TERJADI (PENYEBAB UTAMA):
              </strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, lineHeight: '1.45' }}>
                {currentDefect.cause}
              </p>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '12px 14px', borderRadius: '10px', borderLeft: '4px solid var(--game-success)' }}>
              <strong style={{ color: 'var(--game-success)', fontSize: '0.85rem', display: 'block', marginBottom: '3px' }}>
                ✅ CARA PENCEGAHAN & SOLUSI BENGKEL:
              </strong>
              <p style={{ color: 'var(--text-main)', fontSize: '0.88rem', margin: 0, lineHeight: '1.45' }}>
                {currentDefect.solution}
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn-game btn-game-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800 }}
              onClick={onClose}
            >
              ◀️ KEMBALI KE SIMULATOR 3D (EVALUASI LAS)
            </button>
            <a
              href={googleImagesUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none', textAlign: 'center', padding: '9px',
                background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa',
                borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              🌐 BUKA HASIL CARI GOOGLE IMAGES (FOTO NYATA LAINNYA) ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

const WeldingSimulator = ({ onOpenDiagnostic }) => {
  const [labMode, setLabMode] = useState('materi'); // 'materi' | 'simulasi' | 'quiz'
  const [torchPos, setTorchPos] = useState(0);
  const [weldProgress, setWeldProgress] = useState(0);
  const [isWelding, setIsWelding] = useState(false);
  const [step, setStep] = useState(6); // Set to step 6 (Proses Pengelasan) to match the reference view
  
  const [weldType, setWeldType] = useState('groove'); // 'groove' | 'fillet'
  const [weldPosition, setWeldPosition] = useState('1G'); // 1G-6G or 1F-6F
  const [interactionMode, setInteractionMode] = useState('camera'); // 'weld' | 'camera'
  
  const [weldingProcess, setWeldingProcess] = useState('SMAW'); // 'SMAW' | 'MIG' | 'OAW'
  const [smawElectrode, setSmawElectrode] = useState('E7018'); // 'E6010', 'E6013', 'E7018'
  
  const [oxygenLevel, setOxygenLevel] = useState(50);
  const [acetyleneLevel, setAcetyleneLevel] = useState(50);
  
  let oawFlame = 'neutral';
  if (acetyleneLevel > oxygenLevel + 10) oawFlame = 'carburizing';
  else if (oxygenLevel > acetyleneLevel + 10) oawFlame = 'oxidizing';
  
  const [defects, setDefects] = useState([]);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [visitedDefectIds, setVisitedDefectIds] = useState(new Set());
  const [hideEvalOverlay, setHideEvalOverlay] = useState(false);

  const handleSelectDefect = (defect) => {
    if (defect?.uid) {
      setVisitedDefectIds(prev => new Set(prev).add(defect.uid));
    }
    setSelectedDefect(defect);
  };

  const handleTypeChange = (type) => {
    setWeldType(type);
    setWeldPosition(type === 'groove' ? '1G' : '1F');
    setTorchPos(0);
    setWeldProgress(0);
    setDefects([]);
    setVisitedDefectIds(new Set());
    setHideEvalOverlay(false);
  };

  const groovePositions = ['1G', '2G', '3G', '4G', '5G', '6G'];
  const filletPositions = ['1F', '2F', '3F', '4F', '5F', '6F'];
  const currentPositions = weldType === 'groove' ? groovePositions : filletPositions;
  
  const handleMouseDown = () => {
    if (interactionMode !== 'weld' || step === 7) return;
    sound.startWelding();
    setIsWelding(true);
    if (weldProgress === 0) {
      setDefects([]);
      setVisitedDefectIds(new Set());
    }
    setWeldProgress((prev) => Math.max(prev, torchPos));
  };

  const handleTorchUpdate = (pct) => {
    if (interactionMode !== 'weld' || step === 7) return;
    
    // Alat las (torch) selalu bergerak persis mengikuti kursor di 3D
    setTorchPos(pct);

    if (isWelding) {
      setWeldProgress((prev) => {
        const nextProgress = Math.max(prev, pct);
        
        if (nextProgress >= 95 && prev < 95) {
          sound.stopWelding();
          setIsWelding(false);
          setStep(7); // Go to evaluation
          sound.playSuccess();
          
          const numDefects = Math.floor(Math.random() * 3) + 1;
          const generatedDefects = [];
          for (let i = 0; i < numDefects; i++) {
            const randType = DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)];
            const randPos = 20 + Math.random() * 60;
            generatedDefects.push({
              uid: `defect-${i}-${Date.now()}`,
              pos: randPos,
              ...randType
            });
          }
          setDefects(generatedDefects);
          setVisitedDefectIds(new Set());
          setHideEvalOverlay(false);
        }
        return nextProgress;
      });
    }
  };

  const handleMouseUp = () => {
    if (isWelding) {
      sound.stopWelding();
      setIsWelding(false);
    }
  };

  const steps = [
    { num: 1, label: 'Pilih Material', active: step >= 1 },
    { num: 2, label: 'Jenis Pengelasan', active: step >= 2 },
    { num: 3, label: 'Posisi Pengelasan', active: step >= 3 },
    { num: 4, label: 'Setting Parameter', active: step >= 4 },
    { num: 5, label: 'Safety Check', active: step >= 5 },
    { num: 6, label: 'Proses Pengelasan', active: step >= 6 },
    { num: 7, label: 'Hasil & Evaluasi', active: step >= 7 }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      <LabDiagnosticBanner
        labTitle="Welding Lab (SMAW, GMAW, OAW & K3 Las)"
        desc="Diagnosa 10 soal kode elektroda (E6013/E7018), cacat las (undercut/porosity), dan keselamatan helm filter shade #10-12."
        onOpenDiagnostic={onOpenDiagnostic}
      />

      {/* TOP HEADER: LAB MODE SWITCHER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        borderRadius: '16px',
        flexWrap: 'wrap',
        gap: '12px',
        maxWidth: '100%',
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ea580c, #c2410c)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: '#fff', fontSize: '1.4rem',
            boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)'
          }}>
            🔥
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '0.5px' }}>
              WELDING LAB • PENGELASAN LOGAM
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Jenis Pengelasan, Alat & Bahan, Teknik Dasar Praktik, & Simulator 3D
            </p>
          </div>
        </div>

        {/* 3 Main Mode Switchers */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          <button
            onClick={() => { sound.playClick(); setLabMode('materi'); }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: labMode === 'materi' ? '#ea580c' : 'transparent',
              color: labMode === 'materi' ? '#ffffff' : 'var(--text-main)',
              boxShadow: labMode === 'materi' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>📚</span> Teori & Materi
          </button>

          <button
            onClick={() => { sound.playClick(); setLabMode('simulasi'); }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: labMode === 'simulasi' ? '#ea580c' : 'transparent',
              color: labMode === 'simulasi' ? '#ffffff' : 'var(--text-main)',
              boxShadow: labMode === 'simulasi' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>🔥</span> Simulator Praktik 3D
          </button>

          <button
            onClick={() => { sound.playClick(); setLabMode('quiz'); }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: labMode === 'quiz' ? '#10b981' : 'transparent',
              color: labMode === 'quiz' ? '#ffffff' : 'var(--text-main)',
              boxShadow: labMode === 'quiz' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>🎯</span> Kuis Asesmen (1000 XP)
          </button>
        </div>
      </div>

      {/* VIEW 1: MATERI & TEORI PENGELASAN */}
      {labMode === 'materi' && (
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
          <WeldingTheoryGuide />
        </div>
      )}

      {/* VIEW 2: KUIS ASESMEN */}
      {labMode === 'quiz' && (
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
          <WeldingQuiz />
        </div>
      )}

      {/* VIEW 3: SIMULATOR PRAKTIK 3D */}
      {labMode === 'simulasi' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      
      {/* KONTROL POSISI PENGELASAN & PROSES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1.5 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>TIPE SAMBUNGAN</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn-game ${weldType === 'groove' ? 'btn-game-primary' : 'btn-game-neutral'}`}
                style={{ flex: 1, padding: '8px' }}
                onClick={() => handleTypeChange('groove')}
              >
                GROOVE
              </button>
              <button 
                className={`btn-game ${weldType === 'fillet' ? 'btn-game-primary' : 'btn-game-neutral'}`}
                style={{ flex: 1, padding: '8px' }}
                onClick={() => handleTypeChange('fillet')}
              >
                FILLET
              </button>
            </div>
          </div>
          <div style={{ flex: 3 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>POSISI PENGELASAN</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {currentPositions.map(pos => (
                <button 
                  key={pos}
                  className={`btn-game ${weldPosition === pos ? 'btn-game-success' : 'btn-game-neutral'}`}
                  style={{ flex: 1, padding: '8px' }}
                  onClick={() => { setWeldPosition(pos); setTorchPos(0); setWeldProgress(0); }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1.5, borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MODE INTERAKSI</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn-game ${interactionMode === 'weld' ? 'btn-game-tflm' : 'btn-game-neutral'}`}
                style={{ flex: 1, padding: '8px' }}
                onClick={() => setInteractionMode('weld')}
              >
                🔥 LAS
              </button>
              <button 
                className={`btn-game ${interactionMode === 'camera' ? 'btn-game-tflm' : 'btn-game-neutral'}`}
                style={{ flex: 1, padding: '8px' }}
                onClick={() => setInteractionMode('camera')}
              >
                📷 KAMERA
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border-light)' }}></div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1.5 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>PROSES PENGELASAN</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={`btn-game ${weldingProcess === 'SMAW' ? 'btn-game-primary' : 'btn-game-neutral'}`} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => setWeldingProcess('SMAW')}>SMAW</button>
              <button className={`btn-game ${weldingProcess === 'MIG' ? 'btn-game-primary' : 'btn-game-neutral'}`} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => setWeldingProcess('MIG')}>MIG</button>
              <button className={`btn-game ${weldingProcess === 'OAW' ? 'btn-game-primary' : 'btn-game-neutral'}`} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => setWeldingProcess('OAW')}>OAW</button>
            </div>
          </div>
          
          <div style={{ flex: 3 }}>
            {weldingProcess === 'SMAW' && (
              <>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>JENIS ELEKTRODA</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className={`btn-game ${smawElectrode === 'E6013-RB' ? 'btn-game-success' : 'btn-game-neutral'}`} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => setSmawElectrode('E6013-RB')} title="RB (E6013): High Titania. Penetrasi dangkal, manik rapi, cocok plat tipis">RB-26 (E6013)</button>
                  <button className={`btn-game ${smawElectrode === 'E6013-RD' ? 'btn-game-success' : 'btn-game-neutral'}`} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => setSmawElectrode('E6013-RD')} title="RD (E6013): Rutil Titanium. Busur stabil, serbaguna untuk konstruksi ringan">RD-460 (E6013)</button>
                  <button className={`btn-game ${smawElectrode === 'E7016-LB' ? 'btn-game-success' : 'btn-game-neutral'}`} style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }} onClick={() => setSmawElectrode('E7016-LB')} title="LB (E7016/E7018): Low Hydrogen. Sangat kuat, untuk konstruksi berat dan root pass">LB-52 (E7016)</button>
                </div>
              </>
            )}
            {weldingProcess === 'OAW' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SETTING KATUP TORCH (OAW)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Oksigen (O₂)</span>
                      <span>{oxygenLevel}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={oxygenLevel} onChange={(e) => setOxygenLevel(Number(e.target.value))} style={{ width: '100%', accentColor: '#22c55e' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Asetilin (C₂H₂)</span>
                      <span>{acetyleneLevel}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={acetyleneLevel} onChange={(e) => setAcetyleneLevel(Number(e.target.value))} style={{ width: '100%', accentColor: '#ef4444' }} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', background: 'var(--bg-game)', padding: '6px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Hasil Nyala Api</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: oawFlame === 'neutral' ? '#3b82f6' : oawFlame === 'carburizing' ? '#d946ef' : '#f43f5e', textTransform: 'uppercase' }}>
                      {oawFlame === 'neutral' ? 'Netral' : oawFlame === 'carburizing' ? 'Karburasi' : 'Oksidasi'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {weldingProcess === 'MIG' && (
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0 8px' }}>
                MIG (GMAW) menggunakan elektroda kawat gulung kontinu dan gas pelindung.
              </div>
            )}
          </div>
          
          <div style={{ flex: 1.5, borderLeft: '1px solid var(--border-light)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <button 
              className="btn-game"
              style={{
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5', padding: '8px', fontSize: '0.8rem', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
              onClick={() => setSelectedDefect(DEFECT_TYPES[0])}
            >
              🖼️ ENSIKLOPEDIA GAMBAR CACAT
            </button>
          </div>
        </div>
      </div>

      {/* 3D WELDING CANVAS */}
      <div 
        style={{
          flex: 1,
          position: 'relative',
          minHeight: '400px',
          background: '#050a14',
          borderRadius: '16px',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          touchAction: 'none' // Prevent scrolling when sliding on mobile
        }}
      >
        {/* DEFECT OVERLAY LIST FOR QUICK ACCESS */}
        {defects.length > 0 && (
          <div style={{
            position: 'absolute', top: step === 7 ? '82px' : '16px', left: '16px', zIndex: 12,
            background: 'rgba(15, 23, 42, 0.94)', backdropFilter: 'blur(8px)',
            padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.5)',
            display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px',
            boxShadow: '0 10px 28px rgba(0,0,0,0.7)'
          }}>
            <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444' }}></span>
                FOTO CACAT TERDETEKSI ({defects.length}):
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Klik untuk detail</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {defects.map((d, idx) => {
                const dtInfo = DEFECT_TYPES.find(typeDef => typeDef.id === (d.id || d.type)) || d;
                const photo = d.realPhotoUrl || dtInfo.realPhotoUrl;
                return (
                  <button
                    key={d.uid || idx}
                    onClick={() => setSelectedDefect(d)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#ffffff', padding: '6px 8px', borderRadius: '10px',
                      fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)'}
                  >
                    <img 
                      src={photo} 
                      alt={d.name} 
                      style={{
                        width: '44px', height: '44px', borderRadius: '8px',
                        objectFit: 'cover', border: '1px solid #ef4444', flexShrink: 0,
                        background: '#000'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#fca5a5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        ⚠️ {d.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span>Titik {Math.round(d.pos)}%</span>
                        <span>•</span>
                        <span>Lihat Foto 📸</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Suspense fallback={<div className="flex-center" style={{ height: '100%', color: 'var(--game-tflm)' }}>LOADING 3D ENGINE...</div>}>
          <ErrorBoundary>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'auto' }}>
              <Welding3D 
                isWelding={isWelding} 
                torchPos={torchPos} 
                weldProgress={weldProgress} 
                weldType={weldType} 
                weldPosition={weldPosition} 
                defects={defects} 
                onDefectClick={handleSelectDefect} 
                interactionMode={interactionMode} 
                weldingProcess={weldingProcess} 
                smawElectrode={smawElectrode} 
                oawFlame={oawFlame} 
                onTorchUpdate={handleTorchUpdate}
                onTorchDown={handleMouseDown}
                onTorchUp={handleMouseUp}
              />
            </div>
          </ErrorBoundary>
        </Suspense>

        {/* STEP 7 EVALUATION TOP BANNER OVERLAY */}
        {step === 7 && !selectedDefect && (
          <div style={{
            position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 10,
            background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(10px)',
            padding: '12px 20px', borderRadius: '16px',
            border: defects.length === 0 ? '1px solid var(--game-success)' : '1px solid rgba(239, 68, 68, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: defects.length === 0 ? 'var(--game-success)' : '#ef4444',
                boxShadow: defects.length === 0 ? '0 0 10px var(--game-success)' : '0 0 10px #ef4444'
              }} className="animate-pulse" />
              <div>
                <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.95rem' }}>
                  {defects.length === 0 ? '🎉 PENGELASAN PERFECT! (Skor 95/100)' : `⚠️ TERDETEKSI ${defects.length} CACAT PADA ALUR LAS 3D`}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {defects.length === 0
                    ? 'Tidak ditemukan cacat las visual. Penetrasi dan manik las optimal.'
                    : 'Klik titik merah berkedip 🔴 di sepanjang hasil lasan 3D untuk melihat gambar & jenis cacatnya!'}
                </div>
              </div>
            </div>

            <button
              className="btn-game btn-game-tflm"
              style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 800 }}
              onClick={() => { setStep(6); setTorchPos(0); setWeldProgress(0); setDefects([]); }}
            >
              🔄 SIMULASI ULANG
            </button>
          </div>
        )}

        {/* DEFECT ANALYSIS MODAL */}
        {selectedDefect && (
          <ErrorBoundary>
            <DefectModal 
              defect={selectedDefect} 
              allDefects={defects}
              onClose={() => setSelectedDefect(null)} 
              onSelectDefect={handleSelectDefect}
            />
          </ErrorBoundary>
        )}
      </div>

      {/* BOTTOM STEPPER - ALUR SIMULASI */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>VIRTUAL WELDING LAB - ALUR SIMULASI</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          
          {/* Connecting Line */}
          <div style={{ position: 'absolute', top: '24px', left: '5%', right: '5%', height: '2px', background: 'var(--border-light)', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', top: '24px', left: '5%', width: `${((step - 1) / 6) * 90}%`, height: '2px', background: 'var(--game-tflm)', zIndex: 1, transition: 'width 0.3s' }}></div>

          {steps.map((s, i) => (
            <div key={s.num} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: s.active ? 'var(--bg-card-light)' : 'var(--bg-game)',
                border: s.active ? '2px solid var(--game-tflm)' : '1px solid var(--border-light)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                color: s.active ? 'var(--game-tflm)' : 'var(--text-muted)',
                fontWeight: 800, fontSize: '1.2rem',
                boxShadow: s.active ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none'
              }}>
                {s.num}
              </div>
              <div style={{ fontSize: '0.8rem', color: s.active ? 'var(--text-main)' : 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
                {s.label}
              </div>
            </div>
          ))}

        </div>
      </div>

        </div>
      )}

    </div>
  );
};

export default WeldingSimulator;

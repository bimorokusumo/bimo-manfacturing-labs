import React, { useState } from 'react';
import { sound } from '../utils/audio';
import OrthogonalMultiViewSimulator from './OrthogonalMultiViewSimulator';

const TechnicalDrawingGuide = () => {
  const [activeTab, setActiveTab] = useState('dimensi'); // Open directly on proyeksi for review
  const [projectionSystem, setProjectionSystem] = useState('amerika'); // 'eropa' or 'amerika'
  const [dimensionMethod, setDimensionMethod] = useState('aligned'); // 'aligned' or 'unidirectional'
  const [selectedPencil, setSelectedPencil] = useState('HB');
  const [letteringHeight, setLetteringHeight] = useState(7);
  const [userText, setUserText] = useState('GAMBAR TEKNIK MESIN ISO');
  const [selectedLineType, setSelectedLineType] = useState('A');
  const [selectedDimensionFeature, setSelectedDimensionFeature] = useState('chamfer');

  const tabs = [
    { id: 'alat', label: '1. Pengenalan Alat', icon: '🧰' },
    { id: 'garis', label: '2. Standarisasi Garis (ISO 128)', icon: '📏' },
    { id: 'huruf', label: '3. Huruf & Angka (ISO 3098)', icon: '✍️' },
    { id: 'proyeksi', label: '4. Jenis Proyeksi (Eropa/Amerika)', icon: '🧭' },
    { id: 'dimensi', label: '5. Aturan Dimensi (ISO 129)', icon: '📐' }
  ];

  // Pencils Database
  const PENCILS = [
    { grade: '4H-9H', type: 'Keras (Hard)', uses: 'Garis bantu, garis ukur tipis awal, lay-out sketsa sangat tipis', color: '#94a3b8' },
    { grade: '3H-2H', type: 'Keras Sedang', uses: 'Garis sumbu, garis potong awal, garis arsir halus', color: '#64748b' },
    { grade: 'H', type: 'Agak Keras', uses: 'Garis batas tipis, garis ukur penanda', color: '#475569' },
    { grade: 'F', type: 'Teguh (Firm)', uses: 'Etiket gambar, garis penunjuk notasi', color: '#334155' },
    { grade: 'HB', type: 'Sedang (Medium)', uses: 'Standar utama: huruf, angka, garis nyata utama', color: '#1e293b' },
    { grade: 'B', type: 'Agak Lunak', uses: 'Garis tebal nyata, kontur tebal benda kerja', color: '#0f172a' },
    { grade: '2B-9B', type: 'Lunak (Soft)', uses: 'Sketsa bebas artistik, rendering bayangan piktorial', color: '#000000' }
  ];

  // Line Types ISO 128 Database
  const LINE_TYPES = [
    {
      id: 'A',
      name: 'Garis Tebal Kontinu',
      thick: '0.5 - 0.7 mm',
      dash: 'Solid',
      color: '#0f172a',
      usage: 'Garis nyata (terlihat) dari benda, garis tepi kertas gambar, garis bingkai etiket.',
      example: 'Membatasi kontur luar benda kerja yang terlihat langsung oleh pengamat.'
    },
    {
      id: 'B',
      name: 'Garis Tipis Kontinu',
      thick: '0.25 - 0.35 mm',
      dash: 'Solid',
      color: '#64748b',
      usage: 'Garis ukur, garis bantu ukuran, garis penunjuk notasi, garis arsir potongan, garis sumbu pendek.',
      example: 'Garis ukur beserta anak panahnya, garis proyeksi dimensi dan arsiran penampang.'
    },
    {
      id: 'C',
      name: 'Garis Tipis Bebas (Freehand)',
      thick: '0.25 - 0.35 mm',
      dash: 'Bebas Gelombang',
      color: '#475569',
      usage: 'Garis batas pemotongan sebagian bila batasnya tidak berimpit dengan garis sumbu simetri.',
      example: 'Potongan lokal (sobekan) untuk memperlihatkan lubang baut di dalam poros.'
    },
    {
      id: 'D',
      name: 'Garis Tipis Zig-zag',
      thick: '0.25 - 0.35 mm',
      dash: 'Zig-zag',
      color: '#475569',
      usage: 'Garis batas pemotongan yang panjang pada benda yang diperpendek (digambar dengan mistar).',
      example: 'Batas pemendekan poros panjang atau pipa konstruksi pada kertas terbatas.'
    },
    {
      id: 'E',
      name: 'Garis Gores Tebal (Putus-putus)',
      thick: '0.5 - 0.7 mm',
      dash: 'Gores 3-5mm, Celah 1mm',
      color: '#0f172a',
      usage: 'Garis nyata terhalang (jarang dipakai, diutamakan tipe F).',
      example: 'Batas kontur penting yang tertutup bagian depan benda.'
    },
    {
      id: 'F',
      name: 'Garis Gores Tipis (Putus-putus)',
      thick: '0.25 - 0.35 mm',
      dash: 'Gores 3-5mm, Celah 1mm',
      color: '#64748b',
      usage: 'Garis benda terhalang / garis tidak terlihat (hidden outline) dan tepi tersembunyi.',
      example: 'Lubang bor tembus di dalam benda silinder yang tidak tampak dari luar.'
    },
    {
      id: 'G',
      name: 'Garis Gores Titik Tipis (Center Line)',
      thick: '0.25 - 0.35 mm',
      dash: 'Gores 10-15mm, Titik, Celah 1mm',
      color: '#2563eb',
      usage: 'Garis sumbu simetri, lingkaran jarak gigi pada roda gigi, lintasan gerak mekanis.',
      example: 'Sumbu pusat lingkaran, sumbu simetri benda silindris, garis lintasan pegas.'
    },
    {
      id: 'H',
      name: 'Garis Gores Titik dengan Ujung Tebal',
      thick: 'Tipis di tengah, Tebal (0.7mm) di ujung & belokan',
      dash: 'Kombinasi Gores Titik',
      color: '#dc2626',
      usage: 'Garis bidang pemotongan penampang (cutting plane line) dilengkapi tanda panah arah pandang.',
      example: 'Menunjukkan letak dan orientasi bidang potong penampang A-A atau B-B.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* MODULE NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: 'var(--bg-card)',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-game)',
        overflowX: 'auto'
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { sound.playClick(); setActiveTab(t.id); }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: activeTab === t.id ? '2px solid var(--game-tp)' : '1px solid var(--border-light)',
              background: activeTab === t.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              color: activeTab === t.id ? 'var(--game-tp)' : 'var(--text-main)',
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
      {/* TAB 1: PENGENALAN ALAT GAMBAR TEKNIK                                */}
      {/* =================================================================== */}
      {activeTab === 'alat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #1e3a8a, #0f172a)', color: '#ffffff' }}>
            <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
              MODUL 1 • DASAR PERALATAN GAMBAR TEKNIK
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 8px 0', color: '#fff' }}>
              Standarisasi Alat Gambar Teknik Mesin (ISO & SNI)
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '900px' }}>
              Gambar teknik adalah bahasa grafis universal antar insinyur dan operator manufaktur. Ketelitian, kerapian, dan keakuratan gambar sangat bergantung pada pemilihan alat gambar yang tepat sesuai standar industri manufaktur.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
            
            {/* Card 1: Kertas Gambar ISO 216 */}
            <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📄</div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Kertas Gambar Seri A (ISO 216)</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Perbandingan Rasio Panjang : Lebar = √2 : 1</p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <svg viewBox="0 0 320 180" width="100%" height="140">
                  <rect x="10" y="10" width="300" height="160" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                  <text x="80" y="95" fontSize="18" fontWeight="800" fill="#3b82f6">A1</text>
                  <line x1="160" y1="10" x2="160" y2="170" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="4 2" />
                  
                  <rect x="160" y="10" width="150" height="80" fill="#f1f5f9" stroke="#0f172a" strokeWidth="1.5" />
                  <text x="225" y="55" fontSize="16" fontWeight="800" fill="#64748b">A2</text>
                  
                  <rect x="160" y="90" width="75" height="80" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
                  <text x="188" y="135" fontSize="13" fontWeight="800" fill="#0f172a">A3</text>
                  
                  <rect x="235" y="90" width="75" height="80" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />
                  <text x="262" y="135" fontSize="12" fontWeight="800" fill="#0f172a">A4</text>
                </svg>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Prinsip Pembagian: Luas A0 = 1 m², dilipat menjadi dua menghasilkan A1, dan seterusnya.
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card-light)', borderBottom: '2px solid var(--border-light)' }}>
                      <th style={{ padding: '8px' }}>Format</th>
                      <th style={{ padding: '8px' }}>Ukuran (mm)</th>
                      <th style={{ padding: '8px' }}>Tepi Kiri</th>
                      <th style={{ padding: '8px' }}>Tepi Lain</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}><td style={{ padding: '8px', fontWeight: 700 }}>A0</td><td style={{ padding: '8px' }}>841 × 1189</td><td style={{ padding: '8px' }}>20 mm</td><td style={{ padding: '8px' }}>10 mm</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}><td style={{ padding: '8px', fontWeight: 700 }}>A1</td><td style={{ padding: '8px' }}>594 × 841</td><td style={{ padding: '8px' }}>20 mm</td><td style={{ padding: '8px' }}>10 mm</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}><td style={{ padding: '8px', fontWeight: 700 }}>A2</td><td style={{ padding: '8px' }}>420 × 594</td><td style={{ padding: '8px' }}>20 mm</td><td style={{ padding: '8px' }}>10 mm</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}><td style={{ padding: '8px', fontWeight: 700 }}>A3</td><td style={{ padding: '8px' }}>297 × 420</td><td style={{ padding: '8px' }}>20 mm</td><td style={{ padding: '8px' }}>10 mm</td></tr>
                    <tr><td style={{ padding: '8px', fontWeight: 700, color: 'var(--game-tp)' }}>A4</td><td style={{ padding: '8px', fontWeight: 700 }}>210 × 297</td><td style={{ padding: '8px' }}>20 mm</td><td style={{ padding: '8px', color: '#10b981', fontWeight: 700 }}>5 mm</td></tr>
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', background: 'rgba(59, 130, 246, 0.05)', padding: '10px', borderRadius: '6px' }}>
                💡 <strong>Aturan Tepi Kiri (20 mm):</strong> Wajib disisakan selebar 20 mm pada seluruh format kertas untuk kebutuhan penjilidan (*filing*) tanpa menutup area gambar kerja.
              </div>
            </div>

            {/* Card 2: Pensil Gambar & Tingkat Kekerasan */}
            <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>✏️</div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Derajat Kekerasan Pensil</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Standar H (Hard), F (Firm), B (Black)</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '6px 0' }}>
                {PENCILS.map(p => (
                  <button
                    key={p.grade}
                    onClick={() => setSelectedPencil(p.grade)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: selectedPencil === p.grade ? '2px solid var(--game-primary)' : '1px solid var(--border-light)',
                      background: selectedPencil === p.grade ? 'var(--game-primary)' : '#fff',
                      color: selectedPencil === p.grade ? '#000' : 'var(--text-main)',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {p.grade}
                  </button>
                ))}
              </div>

              {(() => {
                const cur = PENCILS.find(p => p.grade === selectedPencil) || PENCILS[4];
                return (
                  <div style={{ padding: '16px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: cur.color }}>Pensil Tipe: {cur.grade}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#e2e8f0', color: '#334155' }}>{cur.type}</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: cur.color, borderRadius: '3px' }}></div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      <strong>Aplikasi Utama dalam Gambar Mesin:</strong><br />
                      {cur.uses}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ padding: '8px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  🎯 <strong>Pensil Mekanik Standar:</strong> Di bengkel/studio industri lebih disukai pensil mekanik berdiameter mata <strong>0.35 mm</strong> (garis tipis) dan <strong>0.5 mm / 0.7 mm</strong> (garis tebal nyata) agar ketebalan garis selalu konstan tanpa perlu diraut.
                </div>
              </div>
            </div>

            {/* Card 3: Penggaris T & Sepasang Segitiga */}
            <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📐</div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Penggaris T & Sepasang Segitiga</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Kombinasi Sudut Istimewa 15°, 30°, 45°, 60°, 75°, 90°</p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
                <svg viewBox="0 0 280 140" width="100%" height="120">
                  <polygon points="20,120 120,120 20,20" fill="rgba(59, 130, 246, 0.2)" stroke="#2563eb" strokeWidth="2" />
                  <text x="25" y="115" fontSize="10" fontWeight="700" fill="#2563eb">90°</text>
                  <text x="95" y="115" fontSize="10" fontWeight="700" fill="#2563eb">45°</text>
                  <text x="25" y="40" fontSize="10" fontWeight="700" fill="#2563eb">45°</text>

                  <polygon points="140,120 260,120 140,50" fill="rgba(245, 158, 11, 0.2)" stroke="#d97706" strokeWidth="2" />
                  <text x="145" y="115" fontSize="10" fontWeight="700" fill="#d97706">90°</text>
                  <text x="235" y="115" fontSize="10" fontWeight="700" fill="#d97706">30°</text>
                  <text x="145" y="70" fontSize="10" fontWeight="700" fill="#d97706">60°</text>
                </svg>
              </div>

              <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: '20px', margin: 0 }}>
                <li><strong>Penggaris T:</strong> Digunakan untuk menarik garis mendatar (horizontal) sejajar sisi meja gambar.</li>
                <li><strong>Segitiga 45°:</strong> Sudut 45°, 45°, dan 90° untuk arsiran potongan penampang standar.</li>
                <li><strong>Segitiga 30°-60°:</strong> Sudut 30°, 60°, dan 90° untuk membuat sumbu proyeksi Isometri (30°).</li>
                <li><strong>Kombinasi Keduanya:</strong> Menghasilkan sudut kelipatan 15° (misal 75° untuk kemiringan huruf tipe A).</li>
              </ul>
            </div>

            {/* Card 4: Jangka Teknik & Mal Khusus */}
            <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🧲</div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Jangka, Mal, & Pelindung Penghapus</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Akurasi Lingkaran & Kurva Kompleks</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>⭕ Jangka Teknik (Compass)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Jangka besar untuk diameter &gt; 50 mm, jangka pegas (*spring bow*) untuk diameter kecil 5-50 mm yang membutuhkan kestabilan tinggi.
                  </div>
                </div>

                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>〰️ Mal Lengkung (French Curve) & Mal Bentuk</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Membantu membuat garis lengkung bebas non-lingkaran (parabola, hiperbola, cam/nok) serta mal lingkaran kecil dan kepala baut standar.
                  </div>
                </div>

                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>🛡️ Pelindung Penghapus (Erasing Shield)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Pelat baja tipis dengan berbagai celah bentuk untuk menghapus garis yang salah tanpa merusak garis gambar lain di dekatnya.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Title Block / Etiket Standar ISO Section */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📋</span> Standarisasi Etiket / Kepala Gambar (Title Block - ISO 7200)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Etiket diletakkan di <strong>pojok kanan bawah</strong> kertas gambar dengan lebar standar maksimum <strong>185 mm</strong>. Etiket berisi seluruh identitas legalitas dokumen rancang bangun teknik.
            </p>

            {/* SVG Visual of Official Title Block */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', overflowX: 'auto' }}>
              <svg viewBox="0 0 550 150" width="100%" height="auto" style={{ width: '100%', maxWidth: '550px', maxHeight: '160px' }}>
                <rect x="5" y="5" width="540" height="140" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                <line x1="5" y1="45" x2="545" y2="45" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="5" y1="95" x2="545" y2="95" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="5" y1="120" x2="350" y2="120" stroke="#0f172a" strokeWidth="1" />

                <line x1="220" y1="5" x2="220" y2="95" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="350" y1="5" x2="350" y2="145" stroke="#0f172a" strokeWidth="1.5" />

                <text x="15" y="25" fontSize="11" fontWeight="800" fill="#64748b">INSTANSI / SEKOLAH:</text>
                <text x="15" y="40" fontSize="13" fontWeight="900" fill="#0f172a">SMK NEGERI 2 DEPOK</text>
                
                <text x="15" y="65" fontSize="11" fontWeight="800" fill="#64748b">JUDUL GAMBAR KERJA:</text>
                <text x="15" y="85" fontSize="14" fontWeight="900" fill="#2563eb">POROS SPINDEL BERTINGKAT</text>

                <line x1="110" y1="95" x2="110" y2="145" stroke="#0f172a" strokeWidth="1" />
                <line x1="220" y1="95" x2="220" y2="145" stroke="#0f172a" strokeWidth="1" />

                <text x="15" y="110" fontSize="9" fontWeight="700" fill="#64748b">DIGAMBAR:</text>
                <text x="15" y="135" fontSize="10" fontWeight="800" fill="#0f172a">BIMO ROKUSUMO</text>

                <text x="120" y="110" fontSize="9" fontWeight="700" fill="#64748b">DIPERIKSA:</text>
                <text x="120" y="135" fontSize="10" fontWeight="800" fill="#0f172a">GURU PENGAMPU</text>

                <text x="230" y="110" fontSize="9" fontWeight="700" fill="#64748b">TANGGAL:</text>
                <text x="230" y="135" fontSize="10" fontWeight="800" fill="#0f172a">14-09-2026</text>

                <line x1="450" y1="5" x2="450" y2="95" stroke="#0f172a" strokeWidth="1.5" />
                
                <text x="360" y="25" fontSize="10" fontWeight="800" fill="#64748b">SKALA:</text>
                <text x="360" y="42" fontSize="14" fontWeight="900" fill="#0f172a">1 : 1</text>
                
                <text x="360" y="65" fontSize="10" fontWeight="800" fill="#64748b">SATUAN:</text>
                <text x="360" y="85" fontSize="13" fontWeight="900" fill="#0f172a">mm</text>

                {/* SIMBOL RESMI PROYEKSI AMERIKA (ISO 5456-2): LINGKARAN DI KIRI, TRAPESIUM DI KANAN (SISI KECIL MENGHADAP LINGKARAN) */}
                <text x="460" y="22" fontSize="10" fontWeight="800" fill="#64748b">PROYEKSI (AMERIKA):</text>
                {/* Garis sumbu simetri */}
                <line x1="455" y1="60" x2="540" y2="60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 2" />
                <line x1="475" y1="42" x2="475" y2="78" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 2" />
                {/* Dua lingkaran di KIRI */}
                <circle cx="475" cy="60" r="14" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                <circle cx="475" cy="60" r="7" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                {/* Trapesium di KANAN (Sisi kecil di kiri, sisi besar di kanan) */}
                <polygon points="500,53 500,67 528,74 528,46" fill="none" stroke="#2563eb" strokeWidth="1.5" />

                <text x="360" y="115" fontSize="10" fontWeight="800" fill="#64748b">NOMOR GAMBAR:</text>
                <text x="360" y="135" fontSize="12" fontWeight="900" fill="#dc2626">DWG-TP-001/A4</text>
              </svg>
            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: STANDARISASI GARIS GAMBAR (ISO 128)                         */}
      {/* =================================================================== */}
      {activeTab === 'garis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #065f46, #064e3b)', color: '#ffffff' }}>
            <span style={{ background: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
              MODUL 2 • STANDARISASI GARIS (ISO 128)
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 8px 0', color: '#fff' }}>
              Klasifikasi Jenis Garis, Ketebalan, & Tata Penerapan
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#a7f3d0', lineHeight: 1.6, maxWidth: '900px' }}>
              Setiap jenis garis dalam gambar teknik memiliki makna teknis khusus yang diatur secara ketat oleh ISO 128. Rasio ketebalan garis standar adalah <strong>2 : 1</strong> antara garis tebal (misal 0.7 mm) dan garis tipis (0.35 mm).
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            
            <div className="dashboard-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                PILIH TIPE GARIS ISO 128:
              </div>
              {LINE_TYPES.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLineType(l.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: selectedLineType === l.id ? '2px solid var(--game-success)' : '1px solid var(--border-light)',
                    background: selectedLineType === l.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      Tipe {l.id} : {l.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Tebal: {l.thick}
                    </div>
                  </div>
                  <span style={{ fontSize: '1rem', color: selectedLineType === l.id ? 'var(--game-success)' : '#cbd5e1' }}>▶</span>
                </button>
              ))}
            </div>

            {(() => {
              const line = LINE_TYPES.find(l => l.id === selectedLineType) || LINE_TYPES[0];
              return (
                <div className="dashboard-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
                    <div>
                      <span style={{ background: '#e2e8f0', color: '#334155', fontWeight: 800, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                        KODE ISO 128 - TIPE {line.id}
                      </span>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                        {line.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                        Standar Pola Garis: <strong>{line.dash}</strong> • Rentang Ketebalan Nominal: <strong>{line.thick}</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '24px 20px', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase' }}>
                      SIMULASI PENAMPANG GARIS PADA KERTAS GAMBAR (SKALA 1:1 RESOLUSI TINGGI):
                    </div>
                    <svg viewBox="0 0 500 50" width="100%" height="50">
                      {line.id === 'A' && (
                        <line x1="10" y1="25" x2="490" y2="25" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
                      )}
                      {line.id === 'B' && (
                        <line x1="10" y1="25" x2="490" y2="25" stroke="#64748b" strokeWidth="2" />
                      )}
                      {line.id === 'C' && (
                        <path d="M 10 25 Q 70 10 130 25 T 250 25 T 370 25 T 490 25" fill="none" stroke="#475569" strokeWidth="2" />
                      )}
                      {line.id === 'D' && (
                        <path d="M 10 25 L 120 25 L 130 15 L 140 35 L 150 25 L 300 25 L 310 15 L 320 35 L 330 25 L 490 25" fill="none" stroke="#475569" strokeWidth="2" />
                      )}
                      {line.id === 'E' && (
                        <line x1="10" y1="25" x2="490" y2="25" stroke="#0f172a" strokeWidth="5" strokeDasharray="14 6" />
                      )}
                      {line.id === 'F' && (
                        <line x1="10" y1="25" x2="490" y2="25" stroke="#64748b" strokeWidth="2" strokeDasharray="10 4" />
                      )}
                      {line.id === 'G' && (
                        <line x1="10" y1="25" x2="490" y2="25" stroke="#2563eb" strokeWidth="2" strokeDasharray="25 4 4 4" />
                      )}
                      {line.id === 'H' && (
                        <g>
                          <line x1="10" y1="25" x2="60" y2="25" stroke="#dc2626" strokeWidth="5" />
                          <line x1="60" y1="25" x2="440" y2="25" stroke="#dc2626" strokeWidth="2" strokeDasharray="25 4 4 4" />
                          <line x1="440" y1="25" x2="490" y2="25" stroke="#dc2626" strokeWidth="5" />
                          <polygon points="35,10 40,25 30,25" fill="#dc2626" />
                          <polygon points="465,10 470,25 460,25" fill="#dc2626" />
                          <text x="30" y="5" fontSize="10" fontWeight="900" fill="#dc2626">A</text>
                          <text x="460" y="5" fontSize="10" fontWeight="900" fill="#dc2626">A</text>
                        </g>
                      )}
                    </svg>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                      <strong style={{ color: '#1e3a8a', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Fungsi & Penerapan Utama:</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{line.usage}</span>
                    </div>

                    <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                      <strong style={{ color: '#065f46', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Contoh Kasus Gambar Nyata:</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{line.example}</span>
                    </div>
                  </div>

                  <div style={{ padding: '14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7', color: '#92400e', fontSize: '0.8rem', lineHeight: 1.6 }}>
                    ⚠️ <strong>Urutan Prioritas Garis Berimpit (Line Precedence):</strong><br />
                    Jika dua atau lebih garis bertumpuk di posisi yang sama, urutan yang wajib digambar adalah:<br />
                    <strong>1. Garis Nyata (Tipe A)</strong> &gt; <strong>2. Garis Terhalang (Tipe F)</strong> &gt; <strong>3. Garis Bidang Potong (Tipe H)</strong> &gt; <strong>4. Garis Sumbu (Tipe G)</strong> &gt; <strong>5. Garis Bantu Ukur (Tipe B)</strong>.
                  </div>
                </div>
              );
            })()}

          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: STANDARISASI HURUF & ANGKA (ISO 3098)                        */}
      {/* =================================================================== */}
      {activeTab === 'huruf' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #4338ca, #312e81)', color: '#ffffff' }}>
            <span style={{ background: '#6366f1', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
              MODUL 3 • STANDARISASI HURUF & ANGKA (ISO 3098)
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 8px 0', color: '#fff' }}>
              Proporsi Geometri Huruf Tipe A (Miring 75°) & Tipe B (Tegak 90°)
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#c7d2fe', lineHeight: 1.6, maxWidth: '900px' }}>
              Tulisan pada gambar teknik tidak boleh menggunakan font dekoratif. Huruf dan angka wajib jelas (*legible*), seragam (*uniform*), dan proporsional terhadap ukuran kertas gambar untuk mencegah salah baca dimensi di bengkel mesin.
            </p>
          </div>

          <div className="dashboard-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Interactive ISO 3098 Lettering Simulator
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Ubah tinggi nominal h dan ketik teks untuk melihat kisi-kisi proporsi huruf standar.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Tinggi h:</span>
                {[2.5, 3.5, 5, 7, 10, 14].map(h => (
                  <button
                    key={h}
                    onClick={() => setLetteringHeight(h)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: letteringHeight === h ? '2px solid #4f46e5' : '1px solid var(--border-light)',
                      background: letteringHeight === h ? '#4f46e5' : '#fff',
                      color: letteringHeight === h ? '#fff' : 'var(--text-main)',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {h} mm
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                COBA KETIK TEKS TEKNIS:
              </label>
              <input
                type="text"
                value={userText}
                onChange={(e) => setUserText(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: '#0f172a',
                  background: '#f8fafc'
                }}
              />
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4f46e5', marginBottom: '6px', textTransform: 'uppercase' }}>
                  1. HURUF TIPE B (TEGAK LURUS 90° - STANDARD NASIONAL & ISO UTAMA):
                </div>
                <div style={{
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: `${letteringHeight * 3.5}px`,
                  fontWeight: 'bold',
                  letterSpacing: `${letteringHeight * 0.6}px`,
                  color: '#0f172a',
                  borderBottom: '2px dashed #94a3b8',
                  borderTop: '1px solid #cbd5e1',
                  padding: '12px 10px',
                  background: '#ffffff',
                  borderRadius: '4px',
                  overflowX: 'auto'
                }}>
                  {userText || 'TEKNIK MESIN'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', marginBottom: '6px', textTransform: 'uppercase' }}>
                  2. HURUF TIPE A (KEMIRINGAN 75° KE KANAN):
                </div>
                <div style={{
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: `${letteringHeight * 3.5}px`,
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  transform: 'skewX(-15deg)',
                  transformOrigin: 'left bottom',
                  letterSpacing: `${letteringHeight * 0.6}px`,
                  color: '#0f172a',
                  borderBottom: '2px dashed #94a3b8',
                  borderTop: '1px solid #cbd5e1',
                  padding: '12px 10px',
                  background: '#ffffff',
                  borderRadius: '4px',
                  overflowX: 'auto'
                }}>
                  {userText || 'TEKNIK MESIN'}
                </div>
              </div>

            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card-light)', borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '10px' }}>Elemen Proporsi Huruf</th>
                    <th style={{ padding: '10px' }}>Simbol</th>
                    <th style={{ padding: '10px' }}>Tipe B (d = 0.1h)</th>
                    <th style={{ padding: '10px' }}>Nilai untuk h = {letteringHeight} mm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px' }}>Tinggi Huruf Besar (Kapital)</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>h</td>
                    <td style={{ padding: '8px' }}>(10/10) h = 1.0 h</td>
                    <td style={{ padding: '8px', fontWeight: 700, color: 'var(--game-tp)' }}>{letteringHeight.toFixed(1)} mm</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px' }}>Tinggi Huruf Kecil</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>c</td>
                    <td style={{ padding: '8px' }}>(7/10) h = 0.7 h</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{(letteringHeight * 0.7).toFixed(2)} mm</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px' }}>Jarak Antar Huruf (Spasi Karakter)</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>a</td>
                    <td style={{ padding: '8px' }}>(2/10) h = 0.2 h</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{(letteringHeight * 0.2).toFixed(2)} mm</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px' }}>Jarak Antar Baris (Line Spacing)</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>b</td>
                    <td style={{ padding: '8px' }}>(14/10) h = 1.4 h</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{(letteringHeight * 1.4).toFixed(2)} mm</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px' }}>Jarak Antar Kata</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>e</td>
                    <td style={{ padding: '8px' }}>(6/10) h = 0.6 h</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{(letteringHeight * 0.6).toFixed(2)} mm</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}>Tebal Garis Huruf (Mata Pena/Pensil)</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>d</td>
                    <td style={{ padding: '8px' }}>(1/10) h = 0.1 h</td>
                    <td style={{ padding: '8px', fontWeight: 700, color: '#10b981' }}>{(letteringHeight * 0.1).toFixed(2)} mm</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: STANDARISASI & JENIS PROYEKSI (ISO 5456-2)                   */}
      {/* =================================================================== */}
      {activeTab === 'proyeksi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#ffffff' }}>
            <span style={{ background: '#818cf8', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
              MODUL 4 • STANDARISASI PROYEKSI (ISO 5456-2)
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 8px 0', color: '#fff' }}>
              Proyeksi Ortogonal (Eropa vs Amerika) & Proyeksi Piktorial (3D)
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#c7d2fe', lineHeight: 1.6, maxWidth: '900px' }}>
              Simbol proyeksi kerucut terpancung wajib dicantumkan pada etiket gambar teknik sesuai ISO 5456-2. Memahami perbedaan geometris antara Proyeksi Sudut Pertama (Eropa) dan Proyeksi Sudut Ketiga (Amerika) adalah syarat mutlak juru gambar teknik mesin.
            </p>
          </div>

          {/* BAGIAN UTAMA: SIMBOL RESMI ISO 5456-2 COMPARISON CARD */}
          <div className="dashboard-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
              <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                STANDAR RESMI ISO 5456-2
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                Perbandingan Bentuk Simbol Resmi Kerucut Terpancung
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Kerucut terpancung diletakkan mendatar dengan diameter kecil di KIRI dan diameter besar di KANAN.
              </p>
            </div>

            {/* Side-by-Side Clean Grid Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>
              
              {/* Card Simbol Amerika (Third Angle) */}
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: projectionSystem === 'amerika' ? '3px solid #2563eb' : '1px solid #cbd5e1',
                padding: '24px',
                boxShadow: projectionSystem === 'amerika' ? '0 8px 25px rgba(37, 99, 235, 0.15)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase' }}>
                    🇺🇸 PROYEKSI AMERIKA (SUDUT KETIGA)
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '4px' }}>
                    ISO Third Angle
                  </span>
                </div>

                {/* SVG SIMBOL AMERIKA (BENAR SESUAI ISO 5456-2): LINGKARAN DI KIRI, TRAPESIUM DI KANAN */}
                <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', justifyContent: 'center' }}>
                  <svg viewBox="0 0 240 100" width="100%" height="100" style={{ maxWidth: '280px' }}>
                    {/* Garis Sumbu Simetri Horizontal */}
                    <line x1="10" y1="50" x2="230" y2="50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="14 4 4 4" />
                    
                    {/* 1. DUA LINGKARAN SEPUSAT DI KIRI */}
                    {/* Garis Sumbu Tegak Lingkaran */}
                    <line x1="60" y1="12" x2="60" y2="88" stroke="#94a3b8" strokeWidth="1" strokeDasharray="14 4 4 4" />
                    {/* Lingkaran Luar (Diameter Besar) */}
                    <circle cx="60" cy="50" r="30" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                    {/* Lingkaran Dalam (Diameter Kecil) */}
                    <circle cx="60" cy="50" r="16" fill="none" stroke="#2563eb" strokeWidth="2.5" />

                    {/* 2. TRAPESIUM DI KANAN (Sisi KECIL di kiri menghadap lingkaran, Sisi BESAR di kanan) */}
                    <polygon
                      points="130,34 130,66 195,80 195,20"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <strong>Ciri Khas Geometris:</strong><br />
                  • <strong>Dua Lingkaran di sebelah KIRI</strong>.<br />
                  • <strong>Trapesium di sebelah KANAN</strong> dengan sisi kecil (diameter $d$) menghadap lingkaran, sisi besar di ujung luar.<br />
                  • <em>Alasan Ilmiah:</em> Pengamat melihat dari kiri (sisi kecil kerucut). Karena Proyeksi Sudut ke-3 menempatkan pandangan di sisi yang sama dengan arah pandang, maka tampak samping lingkaran digambar di sebelah <strong>KIRI</strong>.
                </div>
              </div>

              {/* Card Simbol Eropa (First Angle) */}
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: projectionSystem === 'eropa' ? '3px solid #d97706' : '1px solid #cbd5e1',
                padding: '24px',
                boxShadow: projectionSystem === 'eropa' ? '0 8px 25px rgba(217, 119, 6, 0.15)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#d97706', textTransform: 'uppercase' }}>
                    🇪🇺 PROYEKSI EROPA (SUDUT PERTAMA)
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px' }}>
                    ISO First Angle
                  </span>
                </div>

                {/* SVG SIMBOL EROPA (BENAR SESUAI ISO 5456-2): TRAPESIUM DI KIRI, LINGKARAN DI KANAN */}
                <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', justifyContent: 'center' }}>
                  <svg viewBox="0 0 240 100" width="100%" height="100" style={{ maxWidth: '280px' }}>
                    {/* Garis Sumbu Simetri Horizontal */}
                    <line x1="10" y1="50" x2="230" y2="50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="14 4 4 4" />
                    
                    {/* 1. TRAPESIUM DI KIRI (Sisi KECIL di ujung kiri, Sisi BESAR di kanan) */}
                    <polygon
                      points="45,34 45,66 110,80 110,20"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2.5"
                    />

                    {/* 2. DUA LINGKARAN SEPUSAT DI KANAN */}
                    {/* Garis Sumbu Tegak Lingkaran */}
                    <line x1="180" y1="12" x2="180" y2="88" stroke="#94a3b8" strokeWidth="1" strokeDasharray="14 4 4 4" />
                    {/* Lingkaran Luar (Diameter Besar) */}
                    <circle cx="180" cy="50" r="30" fill="none" stroke="#d97706" strokeWidth="2.5" />
                    {/* Lingkaran Dalam (Diameter Kecil) */}
                    <circle cx="180" cy="50" r="16" fill="none" stroke="#d97706" strokeWidth="2.5" />
                  </svg>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <strong>Ciri Khas Geometris:</strong><br />
                  • <strong>Trapesium di sebelah KIRI</strong> (sisi kecil di ujung kiri, sisi besar di kanan).<br />
                  • <strong>Dua Lingkaran di sebelah KANAN</strong>.<br />
                  • <em>Alasan Ilmiah:</em> Pengamat melihat dari arah kiri (sisi kecil kerucut). Karena Proyeksi Sudut ke-1 memproyeksikan bayangan menembus benda ke bidang di belakangnya, maka hasil pandangan lingkaran jatuh di sebelah <strong>KANAN</strong> benda.
                </div>
              </div>

            </div>

            {/* Mnemonic Guide Box */}
            <div style={{ padding: '16px 20px', background: '#f1f5f9', borderRadius: '8px', borderLeft: '5px solid #2563eb', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                💡 RUMUS CEPAT MENGHAFAL SIMBOL PROYEKSI TEKNIK MESIN:
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                • <strong>AMERIKA (Ketiga)</strong>: Huruf A diawali lingkaran bulat → <strong>LINGKARAN DI DEPAN (KIRI)</strong>, lalu Trapesium di Kanan.<br />
                • <strong>EROPA (Pertama)</strong>: Huruf E memiliki garis balok lurus → <strong>TRAPESIUM DI DEPAN (KIRI)</strong>, lalu Lingkaran di Kanan.<br />
                • <em>Perhatikan Trapesium:</em> Sisi kecil selalu berada di sebelah KIRI pada kedua simbol standar ISO!
              </div>
            </div>
          </div>

          {/* BAGIAN KEDUA: TATA LETAK MULTI-PANDANGAN INTERAKTIF 3D */}
          <OrthogonalMultiViewSimulator />

          {/* BAGIAN KETIGA: PROYEKSI PIKTORIAL (3D) */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📦</span> Jenis-Jenis Proyeksi Piktorial (3 Dimensi)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px' }}>
              
              {/* Isometri */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>Isometri (Standar Utama)</h4>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>Skala 1:1:1</span>
                </div>
                <div style={{ height: '110px', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 160 100" width="100%" height="90">
                    <line x1="10" y1="85" x2="150" y2="85" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="80" y1="85" x2="80" y2="15" stroke="#dc2626" strokeWidth="2" />
                    <line x1="80" y1="85" x2="20" y2="50" stroke="#2563eb" strokeWidth="2" />
                    <line x1="80" y1="85" x2="140" y2="50" stroke="#10b981" strokeWidth="2" />
                    <text x="35" y="80" fontSize="10" fontWeight="800" fill="#2563eb">30°</text>
                    <text x="110" y="80" fontSize="10" fontWeight="800" fill="#10b981">30°</text>
                    <text x="83" y="25" fontSize="10" fontWeight="800" fill="#dc2626">Z</text>
                    <text x="15" y="55" fontSize="10" fontWeight="800" fill="#2563eb">X</text>
                    <text x="142" y="55" fontSize="10" fontWeight="800" fill="#10b981">Y</text>
                  </svg>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  • Sudut sumbu X & Y terhadap garis mendatar: <strong>30° dan 30°</strong>.<br />
                  • Sudut antar sumbu: <strong>120°</strong>.<br />
                  • Skala pemendekan: Sumbu X = 1, Y = 1, Z = 1 (Utuh).
                </div>
              </div>

              {/* Dimetri */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#d97706' }}>Dimetri</h4>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>Skala 1 : ½ : 1</span>
                </div>
                <div style={{ height: '110px', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 160 100" width="100%" height="90">
                    <line x1="10" y1="85" x2="150" y2="85" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="80" y1="85" x2="80" y2="15" stroke="#dc2626" strokeWidth="2" />
                    <line x1="80" y1="85" x2="15" y2="75" stroke="#2563eb" strokeWidth="2" />
                    <line x1="80" y1="85" x2="145" y2="35" stroke="#10b981" strokeWidth="2" />
                    <text x="35" y="82" fontSize="9" fontWeight="800" fill="#2563eb">7°</text>
                    <text x="110" y="70" fontSize="9" fontWeight="800" fill="#10b981">42°</text>
                  </svg>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  • Sudut sumbu X = <strong>7°</strong>, sumbu Y = <strong>42°</strong>.<br />
                  • Skala pemendekan: Sumbu X = 1, Sumbu Y = <strong>½ (direduksi separuh)</strong>, Z = 1.<br />
                  • Memberikan ilusi kedalaman yang lebih proporsional dari Isometri.
                </div>
              </div>

              {/* Miring (Oblique / Cavalier) */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#7c3aed' }}>Miring (Oblique)</h4>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#ede9fe', color: '#5b21b6', padding: '2px 6px', borderRadius: '4px' }}>Sudut 45°</span>
                </div>
                <div style={{ height: '110px', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 160 100" width="100%" height="90">
                    <line x1="10" y1="85" x2="150" y2="85" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="80" y1="85" x2="80" y2="15" stroke="#dc2626" strokeWidth="2" />
                    <line x1="80" y1="85" x2="15" y2="85" stroke="#2563eb" strokeWidth="2" />
                    <line x1="80" y1="85" x2="135" y2="35" stroke="#10b981" strokeWidth="2" />
                    <text x="35" y="80" fontSize="9" fontWeight="800" fill="#2563eb">0° (Datar)</text>
                    <text x="105" y="70" fontSize="9" fontWeight="800" fill="#10b981">45°</text>
                  </svg>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  • Sumbu X horizontal <strong>0°</strong> sejajar garis mendatar.<br />
                  • Sumbu Y miring <strong>45°</strong>.<br />
                  • <em>Cavalier:</em> skala Y = 1:1. <em>Cabinet:</em> skala Y = 1:2.
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: ATURAN PEMBERIAN UKURAN / DIMENSI (ISO 129)                  */}
      {/* =================================================================== */}
      {activeTab === 'dimensi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Card */}
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #0e7490, #155e75)', color: '#ffffff' }}>
            <span style={{ background: '#06b6d4', color: '#000', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
              MODUL 5 • ATURAN PEMBERIAN DIMENSI (ISO 129)
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 8px 0', color: '#fff' }}>
              Standar Penunjukan Ukuran Objek, Garis Bantu, & Simbol Khusus
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#cffafe', lineHeight: 1.6, maxWidth: '900px' }}>
              Pemberian ukuran (<em>dimensioning</em>) adalah bahasa instruksi presisi bagi juru mesin (<em>machinist</em>). Pilih salah satu fitur (Chamfer, Diameter, Radius, Sudut, Lubang, Ulir, atau Linear) untuk melihat kaidah penunjukan ukuran standar ISO 129 secara interaktif!
            </p>
          </div>

          {/* INTERACTIVE WORKPIECE ILLUSTRATION CARD */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header with Title & Method Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  🔍 Ilustrasi Interaktif Anatomi Dimensi Benda Kerja (ISO 129)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Klik tombol fitur di bawah ini atau klik langsung pada bagian gambar kerja untuk memfokuskan kaidah ukuran.
                </p>
              </div>

              {/* Dimension Text Orientation Method Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Sistem Angka:</span>
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.06)', padding: '4px', borderRadius: '8px' }}>
                  <button
                    onClick={() => { sound.playClick(); setDimensionMethod('aligned'); }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      background: dimensionMethod === 'aligned' ? '#0e7490' : 'transparent',
                      color: dimensionMethod === 'aligned' ? '#fff' : 'var(--text-main)',
                      transition: 'all 0.2s'
                    }}
                  >
                    Aligned (Searah)
                  </button>
                  <button
                    onClick={() => { sound.playClick(); setDimensionMethod('unidirectional'); }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      background: dimensionMethod === 'unidirectional' ? '#0e7490' : 'transparent',
                      color: dimensionMethod === 'unidirectional' ? '#fff' : 'var(--text-main)',
                      transition: 'all 0.2s'
                    }}
                  >
                    Unidirectional (Horizontal)
                  </button>
                </div>
              </div>
            </div>

            {/* FEATURE SELECTOR BUTTONS */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '100%' }}>
              {[
                { id: 'chamfer', label: 'Chamfer (C2 / 2×45°)', icon: '📐', color: '#f59e0b' },
                { id: 'diameter', label: 'Diameter (⌀24, ⌀32, ⌀50)', icon: '⌀', color: '#2563eb' },
                { id: 'radius', label: 'Radius Fillet (R8)', icon: 'R', color: '#059669' },
                { id: 'sudut', label: 'Ukuran Sudut (30°)', icon: '📐', color: '#7c3aed' },
                { id: 'lubang', label: 'Lubang & Kedalaman (↧)', icon: '↧', color: '#0891b2' },
                { id: 'ulir', label: 'Ulir Metrik (M24)', icon: '🔩', color: '#e11d48' },
                { id: 'linear', label: 'Linear & Jarak (≥10 & ≥7 mm)', icon: '📏', color: '#4338ca' },
                { id: 'all', label: 'Semua Dimensi', icon: '👁️', color: '#0f172a' }
              ].map(f => {
                const isSelected = selectedDimensionFeature === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => { sound.playClick(); setSelectedDimensionFeature(f.id); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${f.color}` : '1px solid var(--border-light)',
                      background: isSelected ? f.color : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      boxShadow: isSelected ? `0 4px 12px ${f.color}40` : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SVG WORKPIECE ILLUSTRATION CANVAS */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              {/* Feature Active Badge in Canvas */}
              <div style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#475569',
                marginBottom: '8px'
              }}>
                <span>STATUS SOROTAN:</span>
                <span style={{
                  color: selectedDimensionFeature === 'chamfer' ? '#d97706' :
                         selectedDimensionFeature === 'diameter' ? '#2563eb' :
                         selectedDimensionFeature === 'radius' ? '#059669' :
                         selectedDimensionFeature === 'sudut' ? '#7c3aed' :
                         selectedDimensionFeature === 'lubang' ? '#0891b2' :
                         selectedDimensionFeature === 'ulir' ? '#e11d48' :
                         selectedDimensionFeature === 'linear' ? '#4338ca' : '#0f172a',
                  fontWeight: 900
                }}>
                  {selectedDimensionFeature === 'chamfer' ? '📐 Chamfer (Kemiringan Tepi 2 × 45° / C2)' :
                   selectedDimensionFeature === 'diameter' ? '⌀ Diameter Poros Silinder (⌀24, ⌀32, ⌀50)' :
                   selectedDimensionFeature === 'radius' ? 'R Radius Kelengkungan Fillet (R8)' :
                   selectedDimensionFeature === 'sudut' ? '📐 Sudut Kemiringan Konis (30°)' :
                   selectedDimensionFeature === 'lubang' ? '↧ Lubang Bor Buntu & Kedalaman (⌀14 ↧ 25)' :
                   selectedDimensionFeature === 'ulir' ? '🔩 Ulir Metrik ISO (M24 × 1.5)' :
                   selectedDimensionFeature === 'linear' ? '📏 Ukuran Panjang Linear & Aturan Jarak Standar' :
                   '👁️ Seluruh Dimensi Terpadu Standar ISO 129'}
                </span>
              </div>

              <svg viewBox="0 0 840 400" style={{ width: '100%', maxWidth: '100%', height: 'auto', maxHeight: '340px', userSelect: 'none', display: 'block' }}>
                <defs>
                  {/* Marker Arrow 3:1 Standard ISO */}
                  <marker id="arrow-iso-std" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#0284c7" />
                  </marker>
                  <marker id="arrow-iso-amber" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#d97706" />
                  </marker>
                  <marker id="arrow-iso-blue" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#2563eb" />
                  </marker>
                  <marker id="arrow-iso-green" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#059669" />
                  </marker>
                  <marker id="arrow-iso-purple" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#7c3aed" />
                  </marker>
                  <marker id="arrow-iso-cyan" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#0891b2" />
                  </marker>
                  <marker id="arrow-iso-red" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#e11d48" />
                  </marker>
                  <marker id="arrow-iso-indigo" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#4338ca" />
                  </marker>

                  {/* Reverse Arrowheads for outward arrows */}
                  <marker id="arrow-rev-blue" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M 10 2 L 0 5 L 10 8 z" fill="#2563eb" />
                  </marker>
                  <marker id="arrow-rev-indigo" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M 10 2 L 0 5 L 10 8 z" fill="#4338ca" />
                  </marker>
                </defs>

                {/* ------------------------------------------------------------- */}
                {/* 1. AXIS / GARIS SUMBU SIMETRI (ISO 128 Tipe G - Dash Dot)     */}
                {/* ------------------------------------------------------------- */}
                <line
                  x1="60"
                  y1="180"
                  x2="780"
                  y2="180"
                  stroke="#3b82f6"
                  strokeWidth="1.2"
                  strokeDasharray="18 4 4 4"
                />

                {/* ------------------------------------------------------------- */}
                {/* 2. BODY KONTUR BENDA KERJA (POROS BERTINGKAT LOGAM)           */}
                {/* ------------------------------------------------------------- */}
                {/* Main Body Path: Chamfer -> Thread Body -> Fillet R8 -> Middle ⌀50 -> Conical 30° -> Right ⌀32 */}
                <path
                  d="
                    M 110 154
                    L 122 142
                    L 250 142
                    Q 262 142 262 115
                    L 430 115
                    L 480 138
                    L 660 138
                    L 660 162
                    L 656 166
                    L 656 194
                    L 660 198
                    L 660 222
                    L 480 222
                    L 430 245
                    L 262 245
                    Q 262 218 250 218
                    L 122 218
                    L 110 206
                    Z
                  "
                  fill="#f8fafc"
                  stroke="#0f172a"
                  strokeWidth="2.8"
                />

                {/* End Face Line at Left */}
                <line x1="110" y1="154" x2="110" y2="206" stroke="#0f172a" strokeWidth="2.8" />
                {/* Step transition line at x=262 */}
                <line x1="262" y1="115" x2="262" y2="135" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="262" y1="225" x2="262" y2="245" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                {/* Conical boundary line at x=430 */}
                <line x1="430" y1="115" x2="430" y2="245" stroke="#cbd5e1" strokeWidth="1.2" />

                {/* ------------------------------------------------------------- */}
                {/* 3. ULIR METRIK M24 (Garis Tipis Kontinu Tipe B di Akar Ulir) */}
                {/* ------------------------------------------------------------- */}
                <g
                  onClick={() => { sound.playClick(); setSelectedDimensionFeature('ulir'); }}
                  style={{ cursor: 'pointer' }}
                >
                  <line
                    x1="122"
                    y1="147"
                    x2="230"
                    y2="147"
                    stroke={selectedDimensionFeature === 'ulir' ? '#e11d48' : '#64748b'}
                    strokeWidth={selectedDimensionFeature === 'ulir' ? '2.5' : '1.2'}
                  />
                  <line
                    x1="122"
                    y1="213"
                    x2="230"
                    y2="213"
                    stroke={selectedDimensionFeature === 'ulir' ? '#e11d48' : '#64748b'}
                    strokeWidth={selectedDimensionFeature === 'ulir' ? '2.5' : '1.2'}
                  />
                  {/* Thread runout limit line */}
                  <line
                    x1="230"
                    y1="142"
                    x2="230"
                    y2="218"
                    stroke={selectedDimensionFeature === 'ulir' ? '#e11d48' : '#64748b'}
                    strokeWidth={selectedDimensionFeature === 'ulir' ? '2' : '1.2'}
                  />
                </g>

                {/* ------------------------------------------------------------- */}
                {/* 4. LUBANG BOR BUNTU (ISO 128 Tipe F - Dashed Hidden Lines)    */}
                {/* ------------------------------------------------------------- */}
                <g
                  onClick={() => { sound.playClick(); setSelectedDimensionFeature('lubang'); }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Upper Bore Wall */}
                  <line
                    x1="656"
                    y1="166"
                    x2="560"
                    y2="166"
                    stroke={selectedDimensionFeature === 'lubang' ? '#0891b2' : '#64748b'}
                    strokeWidth={selectedDimensionFeature === 'lubang' ? '2.5' : '1.5'}
                    strokeDasharray="6 3"
                  />
                  {/* Lower Bore Wall */}
                  <line
                    x1="656"
                    y1="194"
                    x2="560"
                    y2="194"
                    stroke={selectedDimensionFeature === 'lubang' ? '#0891b2' : '#64748b'}
                    strokeWidth={selectedDimensionFeature === 'lubang' ? '2.5' : '1.5'}
                    strokeDasharray="6 3"
                  />
                  {/* Drill Bottom Flat Depth Limit */}
                  <line
                    x1="560"
                    y1="166"
                    x2="560"
                    y2="194"
                    stroke={selectedDimensionFeature === 'lubang' ? '#0891b2' : '#64748b'}
                    strokeWidth={selectedDimensionFeature === 'lubang' ? '2.5' : '1.5'}
                    strokeDasharray="6 3"
                  />
                  {/* 118° Conical Drill Tip (Mata Bor Kerucut) */}
                  <line
                    x1="560"
                    y1="166"
                    x2="540"
                    y2="180"
                    stroke={selectedDimensionFeature === 'lubang' ? '#0891b2' : '#64748b'}
                    strokeWidth={selectedDimensionFeature === 'lubang' ? '2' : '1.2'}
                    strokeDasharray="4 2"
                  />
                  <line
                    x1="560"
                    y1="194"
                    x2="540"
                    y2="180"
                    stroke={selectedDimensionFeature === 'lubang' ? '#0891b2' : '#64748b'}
                    strokeWidth={selectedDimensionFeature === 'lubang' ? '2' : '1.2'}
                    strokeDasharray="4 2"
                  />
                </g>

                {/* ============================================================= */}
                {/* DIMENSION SET 1: CHAMFER (2 × 45° / C2)                       */}
                {/* ============================================================= */}
                <g
                  onClick={() => { sound.playClick(); setSelectedDimensionFeature('chamfer'); }}
                  style={{
                    cursor: 'pointer',
                    opacity: (selectedDimensionFeature === 'chamfer' || selectedDimensionFeature === 'all') ? 1 : 0.2,
                    transition: 'opacity 0.25s'
                  }}
                >
                  {/* Highlight Glow on Chamfer Surface */}
                  <line
                    x1="110"
                    y1="154"
                    x2="122"
                    y2="142"
                    stroke="#f59e0b"
                    strokeWidth={selectedDimensionFeature === 'chamfer' ? '5' : '2'}
                    strokeLinecap="round"
                  />
                  {/* Chamfer Leader Line */}
                  <line
                    x1="80"
                    y1="102"
                    x2="116"
                    y2="148"
                    stroke="#d97706"
                    strokeWidth="1.8"
                    markerEnd="url(#arrow-iso-amber)"
                  />
                  {/* Horizontal Shoulder (Garis Bendera) */}
                  <line x1="20" y1="102" x2="80" y2="102" stroke="#d97706" strokeWidth="1.8" />
                  {/* Text 2 x 45° */}
                  <text x="50" y="94" fontSize="13" fontWeight="900" fill="#d97706" textAnchor="middle">
                    2 × 45°
                  </text>
                  {selectedDimensionFeature === 'chamfer' && (
                    <g>
                      <rect x="20" y="58" width="84" height="20" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
                      <text x="62" y="72" fontSize="9.5" fontWeight="800" fill="#92400e" textAnchor="middle">
                        CHAMFER C2
                      </text>
                    </g>
                  )}
                </g>

                {/* ============================================================= */}
                {/* DIMENSION SET 2: DIAMETER (⌀24, ⌀50, ⌀32)                     */}
                {/* ============================================================= */}
                <g
                  onClick={() => { sound.playClick(); setSelectedDimensionFeature('diameter'); }}
                  style={{
                    cursor: 'pointer',
                    opacity: (selectedDimensionFeature === 'diameter' || selectedDimensionFeature === 'all') ? 1 : 0.2,
                    transition: 'opacity 0.25s'
                  }}
                >
                  {/* 1. Diameter ⌀24 (Left Shaft) */}
                  <line x1="122" y1="142" x2="80" y2="142" stroke="#64748b" strokeWidth="1" />
                  <line x1="122" y1="218" x2="80" y2="218" stroke="#64748b" strokeWidth="1" />
                  <line
                    x1="90"
                    y1="142"
                    x2="90"
                    y2="218"
                    stroke="#2563eb"
                    strokeWidth="1.6"
                    markerStart="url(#arrow-rev-blue)"
                    markerEnd="url(#arrow-iso-blue)"
                  />
                  <text
                    x={dimensionMethod === 'aligned' ? "82" : "80"}
                    y="180"
                    fontSize="13"
                    fontWeight="900"
                    fill="#2563eb"
                    textAnchor={dimensionMethod === 'aligned' ? "middle" : "end"}
                    transform={dimensionMethod === 'aligned' ? "rotate(-90 82 180)" : undefined}
                  >
                    ⌀ 24
                  </text>

                  {/* 2. Diameter ⌀50 (Middle Shoulder) */}
                  <line x1="430" y1="115" x2="430" y2="30" stroke="#64748b" strokeWidth="1" />
                  <line x1="268" y1="115" x2="268" y2="30" stroke="#64748b" strokeWidth="1" />
                  {/* Extension lines for ⌀50 vertically */}
                  <line x1="262" y1="245" x2="262" y2="270" stroke="#64748b" strokeWidth="1" />
                  {/* Dimension line ⌀50 at x=350 */}
                  <line x1="350" y1="115" x2="350" y2="245" stroke="#2563eb" strokeWidth="1.6" markerStart="url(#arrow-rev-blue)" markerEnd="url(#arrow-iso-blue)" />
                  <text
                    x={dimensionMethod === 'aligned' ? "342" : "340"}
                    y="180"
                    fontSize="13"
                    fontWeight="900"
                    fill="#2563eb"
                    textAnchor={dimensionMethod === 'aligned' ? "middle" : "end"}
                    transform={dimensionMethod === 'aligned' ? "rotate(-90 342 180)" : undefined}
                  >
                    ⌀ 50
                  </text>

                  {/* 3. Diameter ⌀32 (Right Shaft) */}
                  <line x1="660" y1="138" x2="700" y2="138" stroke="#64748b" strokeWidth="1" />
                  <line x1="660" y1="222" x2="700" y2="222" stroke="#64748b" strokeWidth="1" />
                  <line
                    x1="685"
                    y1="138"
                    x2="685"
                    y2="222"
                    stroke="#2563eb"
                    strokeWidth="1.6"
                    markerStart="url(#arrow-rev-blue)"
                    markerEnd="url(#arrow-iso-blue)"
                  />
                  <text
                    x={dimensionMethod === 'aligned' ? "695" : "695"}
                    y="180"
                    fontSize="13"
                    fontWeight="900"
                    fill="#2563eb"
                    textAnchor={dimensionMethod === 'aligned' ? "middle" : "start"}
                    transform={dimensionMethod === 'aligned' ? "rotate(90 695 180)" : undefined}
                  >
                    ⌀ 32
                  </text>
                </g>

                {/* ============================================================= */}
                {/* DIMENSION SET 3: RADIUS (R8)                                  */}
                {/* ============================================================= */}
                <g
                  onClick={() => { sound.playClick(); setSelectedDimensionFeature('radius'); }}
                  style={{
                    cursor: 'pointer',
                    opacity: (selectedDimensionFeature === 'radius' || selectedDimensionFeature === 'all') ? 1 : 0.2,
                    transition: 'opacity 0.25s'
                  }}
                >
                  {/* Fillet Center Cross (+) */}
                  <line x1="260" y1="142" x2="264" y2="142" stroke="#059669" strokeWidth="1.5" />
                  <line x1="262" y1="140" x2="262" y2="144" stroke="#059669" strokeWidth="1.5" />
                  {/* Leader line touching the arc */}
                  <line
                    x1="285"
                    y1="85"
                    x2="257"
                    y2="132"
                    stroke="#059669"
                    strokeWidth="1.8"
                    markerEnd="url(#arrow-iso-green)"
                  />
                  <line x1="285" y1="85" x2="330" y2="85" stroke="#059669" strokeWidth="1.8" />
                  <text x="307" y="78" fontSize="13" fontWeight="900" fill="#059669" textAnchor="middle">
                    R 8
                  </text>
                  {selectedDimensionFeature === 'radius' && (
                    <g>
                      <rect x="280" y="42" width="68" height="20" rx="4" fill="#d1fae5" stroke="#059669" strokeWidth="1" />
                      <text x="314" y="56" fontSize="9.5" fontWeight="800" fill="#065f46" textAnchor="middle">
                        FILLET R8
                      </text>
                    </g>
                  )}
                </g>

                {/* ============================================================= */}
                {/* DIMENSION SET 4: SUDUT / ANGULAR (30°)                        */}
                {/* ============================================================= */}
                <g
                  onClick={() => { sound.playClick(); setSelectedDimensionFeature('sudut'); }}
                  style={{
                    cursor: 'pointer',
                    opacity: (selectedDimensionFeature === 'sudut' || selectedDimensionFeature === 'all') ? 1 : 0.2,
                    transition: 'opacity 0.25s'
                  }}
                >
                  {/* Horizontal baseline extension line */}
                  <line x1="430" y1="115" x2="505" y2="115" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
                  {/* Arc Dimension Line for 30 degrees */}
                  <path
                    d="M 490 115 A 60 60 0 0 1 475 136"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="1.8"
                    markerStart="url(#arrow-iso-purple)"
                    markerEnd="url(#arrow-iso-purple)"
                  />
                  <text x="510" y="132" fontSize="13" fontWeight="900" fill="#7c3aed" textAnchor="start">
                    30°
                  </text>
                  {selectedDimensionFeature === 'sudut' && (
                    <g>
                      <rect x="500" y="90" width="70" height="20" rx="4" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1" />
                      <text x="535" y="104" fontSize="9.5" fontWeight="800" fill="#5b21b6" textAnchor="middle">
                        SUDUT 30°
                      </text>
                    </g>
                  )}
                </g>

                {/* ============================================================= */}
                {/* DIMENSION SET 5: LUBANG & KEDALAMAN (⌀14 ↧ 25)               */}
                {/* ============================================================= */}
                <g
                  onClick={() => { sound.playClick(); setSelectedDimensionFeature('lubang'); }}
                  style={{
                    cursor: 'pointer',
                    opacity: (selectedDimensionFeature === 'lubang' || selectedDimensionFeature === 'all') ? 1 : 0.2,
                    transition: 'opacity 0.25s'
                  }}
                >
                  {/* Leader line into the hole */}
                  <line
                    x1="600"
                    y1="166"
                    x2="660"
                    y2="88"
                    stroke="#0891b2"
                    strokeWidth="1.8"
                    markerStart="url(#arrow-iso-cyan)"
                  />
                  <line x1="660" y1="88" x2="795" y2="88" stroke="#0891b2" strokeWidth="1.8" />
                  <text x="725" y="80" fontSize="13" fontWeight="900" fill="#0891b2" textAnchor="middle">
                    ⌀ 14 ↧ 25
                  </text>
                  {selectedDimensionFeature === 'lubang' && (
                    <g>
                      <rect x="670" y="45" width="115" height="20" rx="4" fill="#cffafe" stroke="#0891b2" strokeWidth="1" />
                      <text x="727" y="59" fontSize="9" fontWeight="800" fill="#0e7490" textAnchor="middle">
                        LUBANG BUNTU (↧)
                      </text>
                    </g>
                  )}
                </g>

                {/* ============================================================= */}
                {/* DIMENSION SET 6: ULIR METRIK (M24 × 1.5)                     */}
                {/* ============================================================= */}
                <g
                  onClick={() => { sound.playClick(); setSelectedDimensionFeature('ulir'); }}
                  style={{
                    cursor: 'pointer',
                    opacity: (selectedDimensionFeature === 'ulir' || selectedDimensionFeature === 'all') ? 1 : 0.2,
                    transition: 'opacity 0.25s'
                  }}
                >
                  <line
                    x1="180"
                    y1="142"
                    x2="205"
                    y2="75"
                    stroke="#e11d48"
                    strokeWidth="1.8"
                    markerStart="url(#arrow-iso-red)"
                  />
                  <line x1="205" y1="75" x2="310" y2="75" stroke="#e11d48" strokeWidth="1.8" />
                  <text x="255" y="67" fontSize="13" fontWeight="900" fill="#e11d48" textAnchor="middle">
                    M24 × 1.5 - 6g
                  </text>
                  {selectedDimensionFeature === 'ulir' && (
                    <g>
                      <rect x="210" y="32" width="90" height="20" rx="4" fill="#ffe4e6" stroke="#e11d48" strokeWidth="1" />
                      <text x="255" y="46" fontSize="9" fontWeight="800" fill="#9f1239" textAnchor="middle">
                        ULIR METRIK ISO
                      </text>
                    </g>
                  )}
                </g>

                {/* ============================================================= */}
                {/* DIMENSION SET 7: UKURAN LINEAR & ATURAN JARAK (≥10 & ≥7 mm)  */}
                {/* ============================================================= */}
                <g
                  onClick={() => { sound.playClick(); setSelectedDimensionFeature('linear'); }}
                  style={{
                    cursor: 'pointer',
                    opacity: (selectedDimensionFeature === 'linear' || selectedDimensionFeature === 'all') ? 1 : 0.2,
                    transition: 'opacity 0.25s'
                  }}
                >
                  {/* Extension Lines downward */}
                  {/* At x=110 (Tip) */}
                  <line x1="110" y1="206" x2="110" y2="375" stroke="#64748b" strokeWidth="1.2" />
                  {/* At x=250 (Step 1) */}
                  <line x1="250" y1="218" x2="250" y2="320" stroke="#64748b" strokeWidth="1.2" />
                  {/* At x=430 (Step 2) */}
                  <line x1="430" y1="245" x2="430" y2="320" stroke="#64748b" strokeWidth="1.2" />
                  {/* At x=660 (Right End) */}
                  <line x1="660" y1="222" x2="660" y2="375" stroke="#64748b" strokeWidth="1.2" />

                  {/* ----------------- ROW 1: Jarak >= 10 mm (y = 295) ---------- */}
                  {/* Step 1 Length: 45 mm */}
                  <line
                    x1="110"
                    y1="295"
                    x2="250"
                    y2="295"
                    stroke="#4338ca"
                    strokeWidth="1.6"
                    markerStart="url(#arrow-rev-indigo)"
                    markerEnd="url(#arrow-iso-indigo)"
                  />
                  <text x="180" y="288" fontSize="13" fontWeight="900" fill="#4338ca" textAnchor="middle">
                    45
                  </text>

                  {/* Step 2 Length: 65 mm */}
                  <line
                    x1="250"
                    y1="295"
                    x2="430"
                    y2="295"
                    stroke="#4338ca"
                    strokeWidth="1.6"
                    markerStart="url(#arrow-rev-indigo)"
                    markerEnd="url(#arrow-iso-indigo)"
                  />
                  <text x="340" y="288" fontSize="13" fontWeight="900" fill="#4338ca" textAnchor="middle">
                    65
                  </text>

                  {/* Step 3 Length: 50 mm */}
                  <line
                    x1="430"
                    y1="295"
                    x2="660"
                    y2="295"
                    stroke="#4338ca"
                    strokeWidth="1.6"
                    markerStart="url(#arrow-rev-indigo)"
                    markerEnd="url(#arrow-iso-indigo)"
                  />
                  <text x="545" y="288" fontSize="13" fontWeight="900" fill="#4338ca" textAnchor="middle">
                    50
                  </text>

                  {/* ----------------- ROW 2: Jarak >= 7 mm (y = 355) ----------- */}
                  {/* Total Length: 160 mm */}
                  <line
                    x1="110"
                    y1="355"
                    x2="660"
                    y2="355"
                    stroke="#4338ca"
                    strokeWidth="1.8"
                    markerStart="url(#arrow-rev-indigo)"
                    markerEnd="url(#arrow-iso-indigo)"
                  />
                  <text x="385" y="348" fontSize="14" fontWeight="900" fill="#4338ca" textAnchor="middle">
                    160 (PANJANG TOTAL)
                  </text>

                  {/* Educational Distance Annotations */}
                  <g>
                    {/* Callout 1: Jarak >= 10 mm */}
                    <line x1="80" y1="245" x2="80" y2="295" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="75" y1="245" x2="85" y2="245" stroke="#dc2626" strokeWidth="1" />
                    <line x1="75" y1="295" x2="85" y2="295" stroke="#dc2626" strokeWidth="1" />
                    <text x="72" y="273" fontSize="10" fontWeight="900" fill="#dc2626" textAnchor="end">
                      ≥ 10 mm
                    </text>

                    {/* Callout 2: Jarak >= 7 mm */}
                    <line x1="80" y1="295" x2="80" y2="355" stroke="#dc2626" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="75" y1="355" x2="85" y2="355" stroke="#dc2626" strokeWidth="1" />
                    <text x="72" y="328" fontSize="10" fontWeight="900" fill="#dc2626" textAnchor="end">
                      ≥ 7 mm
                    </text>

                    {/* Callout 3: Kelebihan Garis Bantu 2-3 mm */}
                    <line x1="660" y1="355" x2="680" y2="370" stroke="#059669" strokeWidth="1" />
                    <text x="685" y="375" fontSize="10" fontWeight="800" fill="#059669">
                      Lebihan 2-3 mm
                    </text>
                  </g>
                </g>

              </svg>
            </div>

            {/* DYNAMIC DETAIL & KAIDAH PANEL */}
            {(() => {
              const details = {
                chamfer: {
                  title: 'Kaidah Penunjukan Chamfer (ISO 129-1)',
                  tag: 'STANDAR CHAMFER',
                  color: '#d97706',
                  bg: '#fef3c7',
                  items: [
                    { label: 'Format Resmi', val: '2 × 45° atau disingkat C2 (Hanya jika sudutnya 45°)' },
                    { label: 'Garis Penunjuk', val: 'Ditarik dengan sudut 30° – 60° menyentuh permukaan miring, diakhiri garis mendatar (shoulder)' },
                    { label: 'Sudut Selain 45°', val: 'Wajib dicantumkan terpisah atau ditulis penuh: 3 × 30° (tidak boleh memakai huruf C)' },
                    { label: 'Kesalahan Fatal', val: 'Dilarang menulis terbalik seperti "45° × 2". Ukuran panjang pemotongan harus selalu mendahului derajat sudutnya!' },
                    { label: 'Fungsi Manufaktur', val: 'Menghilangkan ketajaman burr setelah pembubutan, memudahkan perakitan poros ke bearing, dan mencegah luka pada tangan operator.' }
                  ]
                },
                diameter: {
                  title: 'Kaidah Penunjukan Diameter Silinder (ISO 129-1)',
                  tag: 'STANDAR DIAMETER',
                  color: '#2563eb',
                  bg: '#dbeafe',
                  items: [
                    { label: 'Simbol Wajib', val: 'Huruf Yunani phi "⌀" wajib dicantumkan tepat sebelum angka nominal (misal: ⌀24, ⌀50)' },
                    { label: 'Ruang Sempit', val: 'Jika ruang antar garis bantu sempit, kedua anak panah diletakkan dari luar mengarah ke dalam (inward arrows)' },
                    { label: 'Penempatan Angka', val: 'Diletakkan di tengah-tengah garis ukur atau ditarik keluar menggunakan garis penunjuk bila ruang sangat sempit' },
                    { label: 'Kesalahan Fatal', val: 'Lupa menulis simbol ⌀ pada pandangan samping poros yang berbentuk persegi panjang (menyebabkan benda dikira balok kubus)' },
                    { label: 'Fungsi Manufaktur', val: 'Patokan utama operator mesin bubut untuk setting pahat bubut luar (turning) dan dalam (boring) sesuai suaian toleransi.' }
                  ]
                },
                radius: {
                  title: 'Kaidah Penunjukan Radius & Fillet (ISO 129-1)',
                  tag: 'STANDAR RADIUS',
                  color: '#059669',
                  bg: '#d1fae5',
                  items: [
                    { label: 'Simbol Wajib', val: 'Selalu diawali huruf kapital "R" di depan nilai nominal (misal: R8, R5)' },
                    { label: 'Jumlah Anak Panah', val: 'HANYA 1 buah anak panah yang menyentuh busur kurva kelengkungan (dilarang menggunakan dua panah)' },
                    { label: 'Arah Garis Ukur', val: 'Garis ukur harus menuju atau ditarik segaris dari titik pusat radius busur kelengkungan' },
                    { label: 'Tanda Titik Pusat', val: 'Titik pusat busur ditandai dengan tanda silang kecil (+) jika posisinya penting untuk permesinan presisi' },
                    { label: 'Fungsi Manufaktur', val: 'Fillet radius mencegah konsentrasi tegangan (stress concentration) mendadak yang memicu patah lelah (fatigue) pada poros bertingkat.' }
                  ]
                },
                sudut: {
                  title: 'Kaidah Penunjukan Ukuran Sudut / Angular (ISO 129-1)',
                  tag: 'STANDAR SUDUT',
                  color: '#7c3aed',
                  bg: '#ede9fe',
                  items: [
                    { label: 'Bentuk Garis Ukur', val: 'Garis ukur berupa BUSUR LINGKARAN yang berpusat pada titik puncak pertemuan sudut' },
                    { label: 'Garis Bantu Sudut', val: 'Ditarik secara radial keluar dari kedua garis permukaan yang membentuk sudut' },
                    { label: 'Posisi Angka', val: 'Ditulis di atas garis busur atau mendatar horizontal sesuai sistem dimensi yang dianut' },
                    { label: 'Simbol Ketirusan', val: 'Untuk ketirusan panjang, dapat menggunakan rasio perbandingan seperti 1:10 atau simbol tirus ⊳' },
                    { label: 'Fungsi Manufaktur', val: 'Dikerjakan dengan memutar eretan atas (compound rest) mesin bubut sesuai sudut nominal (contoh 30°).' }
                  ]
                },
                lubang: {
                  title: 'Kaidah Penunjukan Lubang & Kedalaman (ISO 129-1)',
                  tag: 'STANDAR LUBANG BUNTU',
                  color: '#0891b2',
                  bg: '#cffafe',
                  items: [
                    { label: 'Simbol Kedalaman', val: 'Menggunakan simbol ISO panah ke bawah dengan garis atas "↧" diikuti nilai kedalaman efektif' },
                    { label: 'Format Garis Penunjuk', val: 'Ditulis kompak dalam satu garis penunjuk: "⌀14 ↧ 25" (Diameter 14 mm dengan kedalaman 25 mm)' },
                    { label: 'Batas Kedalaman Bor', val: 'Kedalaman dihitung hanya sampai dasar silinder rata, TIDAK termasuk ujung runcing mata bor 118°' },
                    { label: 'Garis Terhalang', val: 'Kontur lubang yang berada di dalam digambar dengan garis gores tipis (ISO Tipe F)' },
                    { label: 'Fungsi Manufaktur', val: 'Panduan operator mesin bor (drilling) untuk mengatur stopper kedalaman mata bor agar tidak tembus.' }
                  ]
                },
                ulir: {
                  title: 'Kaidah Penunjukan Ulir Metrik (ISO 965 / ISO 129)',
                  tag: 'STANDAR ULIR BAUT',
                  color: '#e11d48',
                  bg: '#ffe4e6',
                  items: [
                    { label: 'Notasi Standar', val: 'Huruf "M" diikuti diameter nominal luar dan kisar (pitch), misal: M24 × 1.5 - 6g' },
                    { label: 'Garis Puncak & Akar', val: 'Puncak ulir (crest) digambar garis tebal (Tipe A), sedangkan akar ulir (root) digambar garis tipis (Tipe B)' },
                    { label: 'Batas Ulir Efektif', val: 'Panjang ulir yang dapat dibaut dibatasi oleh garis tebal melintang tegak lurus sumbu' },
                    { label: 'Kisar Kasar vs Halus', val: 'Jika menggunakan kisar standar kasar (coarse), nilai kisar tidak perlu ditulis (cukup "M24")' },
                    { label: 'Fungsi Manufaktur', val: 'Dikerjakan dengan pahat ulir bubut 60° atau alat snay, menggunakan pengasutan otomatis leadscrew mesin bubut.' }
                  ]
                },
                linear: {
                  title: 'Kaidah Ukuran Linear & Aturan Jarak Standar (ISO 129)',
                  tag: 'STANDAR JARAK GARIS',
                  color: '#4338ca',
                  bg: '#e0e7ff',
                  items: [
                    { label: 'Jarak Baris Pertama', val: 'Minimal 10 mm dari kontur tepi terluar benda kerja (agar tidak menempel pada garis benda)' },
                    { label: 'Jarak Antar Baris Paralel', val: 'Minimal 7 mm antar garis ukur yang sejajar (mencegah penumpukan garis yang rapat)' },
                    { label: 'Kelebihan Garis Bantu', val: 'Dilebihkan sepanjang 2 hingga 3 mm melewati ujung kepala anak panah' },
                    { label: 'Proporsi Anak Panah', val: 'Perbandingan panjang : lebar adalah 3 : 1, dengan bentuk runcing tertutup dan dihitamkan penuh' },
                    { label: 'Hierarki Penempatan', val: 'Ukuran terkecil selalu diletakkan paling dekat ke benda kerja, ukuran total diletakkan paling luar agar tidak ada garis bantu yang berpotongan!' }
                  ]
                },
                all: {
                  title: 'Kaidah Dimensi Lengkap Gambar Kerja Mesin (ISO 129)',
                  tag: 'GAMBAR KERJA KOMPLET',
                  color: '#0f172a',
                  bg: '#f1f5f9',
                  items: [
                    { label: 'Prinsip Ketunggalan', val: 'Setiap ukuran hanya boleh dicantumkan TEPAT SATU KALI pada seluruh dokumen gambar kerja' },
                    { label: 'Keterbacaan Operator', val: 'Ukuran diletakkan pada pandangan yang paling jelas memperlihatkan bentuk fitur yang diukur' },
                    { label: 'Tidak Berpotongan', val: 'Garis ukur tidak boleh saling berpotongan dengan garis ukur lain maupun garis bantu ukur' },
                    { label: 'Satuan Standar', val: 'Semua dimensi mesin menggunakan milimeter (mm) secara default tanpa perlu mencantumkan tulisan "mm"' },
                    { label: 'Sinergi Dimensi', val: 'Memadukan Chamfer, Diameter, Radius, Ulir, Lubang, dan Ukuran Linear menjadi instruksi manufaktur bebas ambigu.' }
                  ]
                }
              };

              const cur = details[selectedDimensionFeature] || details['chamfer'];

              return (
                <div style={{
                  background: cur.bg,
                  borderRadius: '10px',
                  border: `2px solid ${cur.color}`,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, background: cur.color, color: '#fff', padding: '3px 8px', borderRadius: '4px' }}>
                      {cur.tag}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: cur.color }}>
                      {cur.title}
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '10px' }}>
                    {cur.items.map((it, idx) => (
                      <div key={idx} style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: cur.color, marginBottom: '4px' }}>
                          • {it.label}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5 }}>
                          {it.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 4 SISTEM PENUNJUKAN UKURAN INDUSTRI */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
                4 METODE SISTEM PENUNJUKAN UKURAN INDUSTRI MANUFAKTUR:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0284c7', marginBottom: '6px' }}>1. Ukuran Berantai (Chain)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Garis-garis ukur disusun bersambungan titik ke titik. Digunakan apabila akumulasi toleransi tidak mempengaruhi fungsi presisi benda kerja.
                  </div>
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#16a34a', marginBottom: '6px' }}>2. Ukuran Sejajar (Parallel)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Semua ukuran diukur bertingkat dari satu bidang acuan dasar (<em>datum line</em>). Menghindari penumpukan kesalahan toleransi (<em>tolerance buildup</em>).
                  </div>
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ea580c', marginBottom: '6px' }}>3. Ukuran Berimpit (Running)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Penyederhanaan ukuran sejajar dalam satu garis ukur yang dimulai dari titik patokan nol (0). Sangat menghemat ruang gambar sempit.
                  </div>
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#7c3aed', marginBottom: '6px' }}>4. Ukuran Koordinat (CNC)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Titik-titik lubang atau sudut didata dalam bentuk tabel koordinat (X, Y, Z). Standar mutlak untuk permesinan otomatis CNC (<em>Computer Numerical Control</em>).
                  </div>
                </div>
              </div>
            </div>

            {/* STANDAR SIMBOL KHUSUS DIMENSI TABEL */}
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
                STANDAR SIMBOL KHUSUS DIMENSI (ISO):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {[
                  { symbol: '⌀', name: 'Diameter', example: '⌀ 25', desc: 'Ukuran silinder penuh / lingkaran' },
                  { symbol: 'R', name: 'Radius', example: 'R 12', desc: 'Jari-jari busur kelengkungan' },
                  { symbol: '□', name: 'Bujur Sangkar', example: '□ 30', desc: 'Penampang segi empat sama sisi' },
                  { symbol: 'S⌀ / SR', name: 'Bola (Spherical)', example: 'S⌀ 40', desc: 'Permukaan bola pejal / berongga' },
                  { symbol: 'C', name: 'Chamfer', example: '2 × 45°', desc: 'Kemiringan sudut pemotongan tepi' },
                  { symbol: 'M', name: 'Ulir Metrik', example: 'M 10 × 1.5', desc: 'Ulir ISO diameter nominal & kisar' },
                  { symbol: 't', name: 'Ketebalan', example: 't = 3', desc: 'Tebal pelat atau lembaran logam' }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      sound.playClick();
                      if (s.name.includes('Chamfer')) setSelectedDimensionFeature('chamfer');
                      else if (s.name.includes('Diameter')) setSelectedDimensionFeature('diameter');
                      else if (s.name.includes('Radius')) setSelectedDimensionFeature('radius');
                      else if (s.name.includes('Ulir')) setSelectedDimensionFeature('ulir');
                    }}
                    style={{
                      padding: '12px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7' }}>{s.symbol}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px' }}>{s.example}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default TechnicalDrawingGuide;

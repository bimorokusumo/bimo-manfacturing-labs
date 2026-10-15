import React, { useState } from 'react';
import { sound } from '../utils/audio';

const TechnicalDrawingGuide = ({ onNavigateToOrtogonal }) => {
  const [activeTab, setActiveTab] = useState('garis'); // Default: 2. Standarisasi Garis (ISO 128)
  const [projectionSystem, setProjectionSystem] = useState('amerika'); // 'eropa' or 'amerika'
  const [dimensionMethod, setDimensionMethod] = useState('aligned'); // 'aligned' or 'unidirectional'
  const [selectedPencil, setSelectedPencil] = useState('HB');
  const [letteringHeight, setLetteringHeight] = useState(7);
  const [userText, setUserText] = useState('GAMBAR TEKNIK MESIN ISO');
  const [selectedLineType, setSelectedLineType] = useState('A');
  const [selectedDimensionFeature, setSelectedDimensionFeature] = useState('chamfer');
  
  // State untuk Card 4: Jangka, Mal, & Pelindung Penghapus
  const [selectedPrecisionTool, setSelectedPrecisionTool] = useState('jangka'); // 'jangka' | 'mal' | 'pelindung'
  const [selectedMalType, setSelectedMalType] = useState('kurva'); // 'kurva' | 'lingkaran' | 'baut'
  const [compassRadius, setCompassRadius] = useState(25); // mm
  const [erasingStep, setErasingStep] = useState('shield'); // 'problem' | 'shield' | 'result'

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

            {/* Card 4: Jangka Teknik, Mal Gambar, & Pelindung Penghapus */}
            <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🧲</div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Jangka, Mal, & Pelindung Penghapus</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Contoh Nyata, Diagram Anatomi & SOP Penggunaan Presisi</p>
                  </div>
                </div>

                {/* 3 Main Precision Tool Selector */}
                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  {[
                    { id: 'jangka', label: '⭕ Jangka Teknik', icon: '⭕' },
                    { id: 'mal', label: '〰️ Mal Khusus & Template', icon: '〰️' },
                    { id: 'pelindung', label: '🛡️ Pelindung Penghapus', icon: '🛡️' }
                  ].map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => { sound.playClick(); setSelectedPrecisionTool(tool.id); }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: selectedPrecisionTool === tool.id ? '2px solid #7c3aed' : '1px solid transparent',
                        background: selectedPrecisionTool === tool.id ? '#ffffff' : 'transparent',
                        color: selectedPrecisionTool === tool.id ? '#7c3aed' : 'var(--text-main)',
                        fontWeight: selectedPrecisionTool === tool.id ? 800 : 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: selectedPrecisionTool === tool.id ? '0 2px 6px rgba(124, 58, 237, 0.15)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ============================================================== */}
              {/* SUB-VIEW 1: JANGKA TEKNIK (COMPASS)                            */}
              {/* ============================================================== */}
              {selectedPrecisionTool === 'jangka' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Slider Pengaturan Radius Jangka Interaktif */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    background: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                      📐 Simulasi Bukaan Jangka: <strong style={{ color: '#2563eb', fontSize: '0.9rem' }}>Radius R = {compassRadius} mm</strong> (Diameter Ø = {compassRadius * 2} mm)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="range"
                        min="15"
                        max="40"
                        value={compassRadius}
                        onChange={(e) => setCompassRadius(Number(e.target.value))}
                        style={{ width: '130px', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[15, 25, 38].map(r => (
                          <button
                            key={r}
                            onClick={() => { sound.playClick(); setCompassRadius(r); }}
                            style={{
                              fontSize: '0.7rem',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: compassRadius === r ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                              background: compassRadius === r ? '#2563eb' : '#ffffff',
                              color: compassRadius === r ? '#ffffff' : '#334155',
                              cursor: 'pointer',
                              fontWeight: 800
                            }}
                          >
                            R{r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SVG DIAGRAM ANATOMI JANGKA PEGAS PRESISI */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <svg viewBox="0 0 380 200" width="100%" height="auto" style={{ maxHeight: '200px' }}>
                      <defs>
                        <linearGradient id="metalLegGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#64748b" />
                          <stop offset="50%" stopColor="#94a3b8" />
                          <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                        <linearGradient id="brassNutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#d97706" />
                          <stop offset="50%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                      </defs>

                      {/* Garis Sumbu Pusat Silang (ISO 128 Tipe G: Dash-Dot Tipis) */}
                      <line x1="20" y1="150" x2="340" y2="150" stroke="#3b82f6" strokeWidth="1" strokeDasharray="14 3 3 3" />
                      <line x1="120" y1="40" x2="120" y2="195" stroke="#3b82f6" strokeWidth="1" strokeDasharray="14 3 3 3" />
                      
                      {/* Titik Pusat Jarum O (120, 150) */}
                      <circle cx="120" cy="150" r="3" fill="#dc2626" />
                      <text x="126" y="165" fontSize="10" fontWeight="800" fill="#dc2626">Titik Pusat (O)</text>

                      {/* Busur Lingkaran yang Dihasilkan Jangka (Garis Nyata Tebal 0.7 mm Tipe A) */}
                      {(() => {
                        const rSvg = compassRadius * 2.8;
                        const leadX = 120 + rSvg;
                        const leadY = 150;
                        const topJointX = 120 + (rSvg / 2);
                        const topJointY = 32;

                        return (
                          <g>
                            {/* Lingkaran / Busur Hasil Goresan */}
                            <path
                              d={`M ${120} ${150 - rSvg} A ${rSvg} ${rSvg} 0 0 1 ${leadX} ${leadY} A ${rSvg} ${rSvg} 0 0 1 ${120} ${150 + rSvg}`}
                              fill="none"
                              stroke="#0f172a"
                              strokeWidth="2.5"
                            />
                            
                            {/* Garis Ukur Dimensi Radius R */}
                            <line x1="120" y1="150" x2={120 + rSvg * 0.707} y2={150 - rSvg * 0.707} stroke="#2563eb" strokeWidth="1.2" />
                            <circle cx={120 + rSvg * 0.707} cy={150 - rSvg * 0.707} r="2.5" fill="#2563eb" />
                            <rect x={120 + rSvg * 0.35 - 18} y={150 - rSvg * 0.35 - 16} width="38" height="15" rx="3" fill="#ffffff" stroke="#2563eb" strokeWidth="0.8" />
                            <text x={120 + rSvg * 0.35 + 1} y={150 - rSvg * 0.35 - 5} fontSize="10" fontWeight="900" fill="#2563eb" textAnchor="middle">
                              R{compassRadius}
                            </text>

                            {/* JANGKA PEGAS: Kepala Pegas Busur (Ring Spring) & Gagang Pemutar */}
                            <rect x={topJointX - 3} y="10" width="6" height="15" fill="#334155" rx="1.5" />
                            <line x1={topJointX - 4} y1="14" x2={topJointX + 4} y2="14" stroke="#94a3b8" strokeWidth="1" />
                            <line x1={topJointX - 4} y1="18" x2={topJointX + 4} y2="18" stroke="#94a3b8" strokeWidth="1" />
                            <circle cx={topJointX} cy="30" r="8" fill="none" stroke="#475569" strokeWidth="3" />

                            {/* Batang Berulir Penyetel Mikro (Spindle) & Mur Knurled */}
                            <line x1={topJointX - (rSvg * 0.38)} y1="78" x2={topJointX + (rSvg * 0.38)} y2="78" stroke="#cbd5e1" strokeWidth="2.5" />
                            <rect x={topJointX - 5} y="71" width="10" height="14" rx="2" fill="url(#brassNutGrad)" stroke="#78350f" strokeWidth="0.8" />
                            <line x1={topJointX - 2} y1="72" x2={topJointX - 2} y2="84" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
                            <line x1={topJointX + 2} y1="72" x2={topJointX + 2} y2="84" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />

                            {/* Kaki Kiri: Jarum Pusat Baja (Needle Leg) */}
                            <path
                              d={`M ${topJointX - 3} 33 L ${topJointX - (rSvg * 0.32)} 95 L 120 142`}
                              fill="none"
                              stroke="url(#metalLegGrad)"
                              strokeWidth="5"
                              strokeLinecap="round"
                            />
                            {/* Jarum Runcing Baja Berbahu (Stepped Needle) */}
                            <line x1="120" y1="142" x2="120" y2="150" stroke="#0f172a" strokeWidth="1.5" />
                            <rect x="117" y="140" width="6" height="3" fill="#334155" />

                            {/* Kaki Kanan: Pemegang Mata Pensil (Lead Leg) */}
                            <path
                              d={`M ${topJointX + 3} 33 L ${topJointX + (rSvg * 0.32)} 95 L ${leadX} 138`}
                              fill="none"
                              stroke="url(#metalLegGrad)"
                              strokeWidth="5"
                              strokeLinecap="round"
                            />
                            {/* Rumah Penjepit Grafit & Mata Pensil Berujung Pahat (Chisel Point) */}
                            <rect x={leadX - 3.5} y="132" width="7" height="9" fill="#1e293b" rx="1" />
                            <polygon points={`${leadX - 2},141 ${leadX + 2},141 ${leadX},150`} fill="#0f172a" />

                            {/* Anotasi Komponen Jangka */}
                            <text x={topJointX + 16} y="22" fontSize="9" fontWeight="800" fill="#475569">Gagang Pemutar</text>
                            <text x={topJointX + (rSvg * 0.4) + 6} y="81" fontSize="9" fontWeight="800" fill="#b45309">Mur Penyetel Mikro</text>
                            <text x={leadX + 8} y="144" fontSize="9" fontWeight="800" fill="#0f172a">Mata Pensil Baji (Chisel)</text>

                            {/* Panah Arah Putaran Clockwise */}
                            <path d={`M ${leadX - 10} 170 Q ${leadX + 15} 175 ${leadX + 25} 155`} fill="none" stroke="#16a34a" strokeWidth="2" strokeDasharray="3 2" />
                            <polygon points={`${leadX + 25},152 ${leadX + 28},160 ${leadX + 21},158`} fill="#16a34a" />
                            <text x={leadX + 30} y="170" fontSize="8.5" fontWeight="800" fill="#16a34a">Putar Searah Jarum Jam</text>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* 3 CONTOH JENIS JANGKA & REKOMENDASI PENGGUNAAN */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>1️⃣</span> Jangka Pegas (Spring Bow)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', lineHeight: 1.5 }}>
                        <strong>Kapasitas:</strong> Ø5 s.d. Ø50 mm.<br />
                        <strong>Ciri Khas:</strong> Poros tengah berulir dengan mur mikro knurled. Radius <em>terkunci permanen</em>, tidak bergeser saat diputar. Standar wajib gambar mesin presisi.
                      </div>
                    </div>

                    <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>2️⃣</span> Jangka Besar (Giant Beam)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', lineHeight: 1.5 }}>
                        <strong>Kapasitas:</strong> Ø50 s.d. Ø300 mm.<br />
                        <strong>Ciri Khas:</strong> Memiliki sendi lutut (<em>knee joints</em>) dan batang ekstensi agar jarum & pensil tetap tegak lurus (90°) pada kertas saat bukaan lebar.
                      </div>
                    </div>

                    <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>3️⃣</span> Jangka Pembagi (Dividers)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', lineHeight: 1.5 }}>
                        <strong>Kapasitas:</strong> Transfer skala ukuran.<br />
                        <strong>Ciri Khas:</strong> Ujung jarum baja ganda (tanpa pensil). Berfungsi membagi garis menjadi <em>n</em> bagian sama rata dan memindahkan ukuran dari mistar baja.
                      </div>
                    </div>
                  </div>

                  {/* SOP Industri Penggunaan Jangka */}
                  <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#1e293b', lineHeight: 1.6 }}>
                    🎯 <strong>SOP Menggambar Lingkaran Standar ISO:</strong><br />
                    1. <strong>Asah Mata Pensil:</strong> Buat bentuk baji pahat (<em>chisel edge</em> sudut 75°), bukan runcing kerucut, agar garis lingkaran memiliki ketebalan konstan (0.5 / 0.7 mm).<br />
                    2. <strong>Teknik Putaran:</strong> Tancapkan jarum pada titik potong garis sumbu, pegang tangkai atas dengan ibu jari & telunjuk, condongkan jangka 10°–15° ke arah putaran, dan putar searah jarum jam dalam 1 tarikan kontinyu.
                  </div>

                </div>
              )}

              {/* ============================================================== */}
              {/* SUB-VIEW 2: MAL KHUSUS (FRENCH CURVES & TEMPLATES)             */}
              {/* ============================================================== */}
              {selectedPrecisionTool === 'mal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Selector Tipe Mal */}
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {[
                      { id: 'kurva', label: '〰️ Mal Lengkung (French Curve)', desc: 'Kurva Nok & Impeller' },
                      { id: 'lingkaran', label: '⭕ Mal Lingkaran (Circle Template)', desc: 'Ø1 s.d. Ø30 mm' },
                      { id: 'baut', label: '🔩 Mal Baut, Mur & Simbol', desc: 'Kepala Baut ISO & Las' }
                    ].map(mal => (
                      <button
                        key={mal.id}
                        onClick={() => { sound.playClick(); setSelectedMalType(mal.id); }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: selectedMalType === mal.id ? '2px solid #ea580c' : '1px solid #cbd5e1',
                          background: selectedMalType === mal.id ? '#fff7ed' : '#ffffff',
                          color: selectedMalType === mal.id ? '#c2410c' : '#334155',
                          fontWeight: selectedMalType === mal.id ? 800 : 600,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s'
                        }}
                      >
                        {mal.label}
                      </button>
                    ))}
                  </div>

                  {/* 2A: MAL LENGKUNG (FRENCH CURVE) */}
                  {selectedMalType === 'kurva' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'center' }}>
                        <svg viewBox="0 0 380 180" width="100%" height="auto" style={{ maxHeight: '180px' }}>
                          <defs>
                            <linearGradient id="frenchCurveAcrylic" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="rgba(249, 115, 22, 0.25)" />
                              <stop offset="50%" stopColor="rgba(251, 146, 60, 0.18)" />
                              <stop offset="100%" stopColor="rgba(234, 88, 12, 0.3)" />
                            </linearGradient>
                          </defs>

                          {/* Grid Koordinat Referensi */}
                          <line x1="30" y1="150" x2="350" y2="150" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="30" y1="110" x2="350" y2="110" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1="30" y1="70" x2="350" y2="70" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />

                          {/* Profil Fisik Mal Lengkung Burmester (Acrylic Orange Plate) */}
                          <path
                            d="M 45,135 C 35,90 60,40 110,32 C 160,24 210,48 250,85 C 290,122 315,110 335,92 C 350,75 355,55 348,42 C 335,30 305,35 270,22 C 220,10 160,5 100,16 C 40,28 20,78 25,132 C 30,172 75,182 125,176 C 185,170 235,140 270,146 C 295,150 312,164 300,174 C 288,185 245,185 195,190 C 135,195 60,170 45,135 Z"
                            fill="url(#frenchCurveAcrylic)"
                            stroke="#ea580c"
                            strokeWidth="2"
                          />
                          {/* Lubang Pegangan Dalam Mal */}
                          <path
                            d="M 120,70 C 160,65 190,80 200,105 C 210,130 185,145 150,140 C 115,135 100,110 105,90 C 110,75 115,70 120,70 Z"
                            fill="#ffffff"
                            stroke="#ea580c"
                            strokeWidth="1.5"
                          />

                          {/* 5 Titik Koordinat Benda Kerja (Cam Profil / Sudu Impeller) */}
                          {[
                            { x: 50, y: 145, label: 'P1' },
                            { x: 110, y: 88, label: 'P2' },
                            { x: 195, y: 65, label: 'P3' },
                            { x: 275, y: 92, label: 'P4' },
                            { x: 340, y: 140, label: 'P5' }
                          ].map(pt => (
                            <g key={pt.label}>
                              <circle cx={pt.x} cy={pt.y} r="4" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
                              <text x={pt.x} y={pt.y - 8} fontSize="9.5" fontWeight="900" fill="#0f172a" textAnchor="middle">{pt.label}</text>
                            </g>
                          ))}

                          {/* Kurva Tangen Mulus (Smooth Spline Hasil Tarikan Pensil) */}
                          <path
                            d="M 50,145 C 80,110 145,65 195,65 C 245,65 295,100 340,140"
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="3"
                          />

                          <rect x="180" y="16" width="165" height="18" rx="4" fill="#ffffff" stroke="#16a34a" strokeWidth="1" />
                          <text x="262" y="29" fontSize="9" fontWeight="800" fill="#16a34a" textAnchor="middle">
                            ✓ Kurva Mulus Menembus P1 - P5
                          </text>
                        </svg>
                      </div>

                      <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#9a3412', lineHeight: 1.6 }}>
                        💡 <strong>Aturan Wajib "3 Titik Tangen Kontinyu":</strong><br />
                        Saat menggunakan mal lengkung, jangan pernah menghubungkan hanya dua titik. Tempelkan kurva mal hingga menyinggung minimal <strong>3 titik berturutan sekaligus (P1-P2-P3)</strong>, lalu tarik garis hanya dari <strong>P1 ke P2</strong>. Setelah itu geser mal hingga menyinggung <strong>P2-P3-P4</strong> dan tarik garis <strong>P2 ke P3</strong>. Ini mencegah timbulnya patahan sudut lancip pada kurva nok/cam.
                      </div>
                    </div>
                  )}

                  {/* 2B: MAL LINGKARAN (CIRCLE TEMPLATE) */}
                  {selectedMalType === 'lingkaran' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'center' }}>
                        <svg viewBox="0 0 380 160" width="100%" height="auto" style={{ maxHeight: '160px' }}>
                          {/* Pelat Mal Mika Hijau/Oranye Transparan */}
                          <rect x="20" y="15" width="340" height="130" rx="10" fill="rgba(16, 185, 129, 0.12)" stroke="#059669" strokeWidth="2" />
                          
                          {/* Judul Cetakan Standar ISO */}
                          <text x="35" y="32" fontSize="9" fontWeight="900" fill="#047857">CIRCLE TEMPLATE ISO 1302 • Ø1 - Ø25 mm</text>

                          {/* Deretan Lubang Lingkaran Presisi dengan Garis Sumbu Bidik 4 Arah */}
                          {[
                            { cx: 65, cy: 80, r: 8, dia: 'Ø6' },
                            { cx: 120, cy: 80, r: 12, dia: 'Ø10' },
                            { cx: 185, cy: 80, r: 16, dia: 'Ø14' },
                            { cx: 260, cy: 80, r: 21, dia: 'Ø20' },
                            { cx: 330, cy: 80, r: 10, dia: 'Ø8' }
                          ].map(h => (
                            <g key={h.dia}>
                              {/* 4 Garis Sumbu Bidik Silang (Crosshairs) */}
                              <line x1={h.cx - h.r - 5} y1={h.cy} x2={h.cx + h.r + 5} y2={h.cy} stroke="#059669" strokeWidth="0.8" />
                              <line x1={h.cx} y1={h.cy - h.r - 5} x2={h.cx} y2={h.cy + h.r + 5} stroke="#059669" strokeWidth="0.8" />
                              {/* Lubang Lingkaran */}
                              <circle cx={h.cx} cy={h.cy} r={h.r} fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />
                              {/* Label Diameter */}
                              <text x={h.cx} y={h.cy + h.r + 14} fontSize="9" fontWeight="900" fill="#047857" textAnchor="middle">{h.dia}</text>
                            </g>
                          ))}

                          <text x="190" y="135" fontSize="8.5" fontWeight="700" fill="#475569" textAnchor="middle">
                            Paskan 4 tanda garis bidik mal ke garis sumbu silang pada gambar kerja
                          </text>
                        </svg>
                      </div>

                      <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#065f46', lineHeight: 1.6 }}>
                        🎯 <strong>Fungsi Krusial dalam Gambar Manufaktur:</strong><br />
                        Jangka biasa tidak stabil dan mudah merobek kertas untuk lingkaran berdiameter <strong>&lt; 10 mm</strong>. Mal lingkaran adalah solusi standar bengkel untuk menggambar lubang baut (M3, M4, M5, M6, M8, M10), lubang pasak, radius fillet pojokan (R2, R3, R5), dan kepala paku keling dalam hitungan detik dengan konsistensi 100% presisi.
                      </div>
                    </div>
                  )}

                  {/* 2C: MAL BAUT, MUR & SIMBOL */}
                  {selectedMalType === 'baut' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'center' }}>
                        <svg viewBox="0 0 380 150" width="100%" height="auto" style={{ maxHeight: '150px' }}>
                          <rect x="20" y="15" width="340" height="120" rx="8" fill="rgba(59, 130, 246, 0.1)" stroke="#2563eb" strokeWidth="2" />
                          <text x="35" y="32" fontSize="9" fontWeight="900" fill="#1d4ed8">ISO BOLT & NUT TEMPLATE (DIN 931 / ISO 4014)</text>

                          {/* Profil Kepala Baut Segienam (Hexagon) M8, M10, M12 */}
                          {[
                            { cx: 70, cy: 75, r: 18, label: 'M8' },
                            { cx: 140, cy: 75, r: 23, label: 'M10' },
                            { cx: 220, cy: 75, r: 28, label: 'M12' }
                          ].map(hex => {
                            const pts = [];
                            for (let i = 0; i < 6; i++) {
                              const angle = (i * 60) * (Math.PI / 180);
                              pts.push(`${hex.cx + hex.r * Math.cos(angle)},${hex.cy + hex.r * Math.sin(angle)}`);
                            }
                            return (
                              <g key={hex.label}>
                                <polygon points={pts.join(' ')} fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                                <circle cx={hex.cx} cy={hex.cy} r={hex.r * 0.55} fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="3 2" />
                                <text x={hex.cx} y={hex.cy + 3} fontSize="9" fontWeight="900" fill="#2563eb" textAnchor="middle">{hex.label}</text>
                              </g>
                            );
                          })}

                          {/* Simbol Pengelasan Standar ISO 2553 */}
                          <g transform="translate(280, 50)">
                            <rect x="0" y="0" width="70" height="50" rx="4" fill="#ffffff" stroke="#cbd5e1" />
                            <text x="35" y="14" fontSize="8" fontWeight="800" fill="#64748b" textAnchor="middle">SIMBOL LAS</text>
                            {/* Simbol Las Fillet Segitiga */}
                            <polygon points="15,40 30,40 15,25" fill="#0f172a" />
                            {/* Simbol Las V-Butt */}
                            <line x1="45" y1="25" x2="55" y2="40" stroke="#0f172a" strokeWidth="2" />
                            <line x1="65" y1="25" x2="55" y2="40" stroke="#0f172a" strokeWidth="2" />
                          </g>
                        </svg>
                      </div>

                      <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.6 }}>
                        🔩 <strong>Efisiensi Studio Gambar Teknik:</strong><br />
                        Menggambar kepala baut segienam (heksagonal) secara manual memerlukan konstruksi busur derajat dan lingkaran bantu yang memakan waktu 3–5 menit per baut. Dengan mal baut ISO, operator dapat mencetak proyeksi pandangan atas baut segienam lengkap dengan lingkaran ulir hanya dalam 5 detik!
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ============================================================== */}
              {/* SUB-VIEW 3: PELINDUNG PENGHAPUS (ERASING SHIELD)              */}
              {/* ============================================================== */}
              {selectedPrecisionTool === 'pelindung' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Selector 3 Tahap Simulasi Interaktif */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                      Simulasi Cara Kerja Pelindung Penghapus:
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[
                        { id: 'problem', label: '1. Masalah: Garis Berlebih' },
                        { id: 'shield', label: '2. Pasang Pelat Pelindung' },
                        { id: 'result', label: '3. Hasil: Terhapus Bersih' }
                      ].map(st => (
                        <button
                          key={st.id}
                          onClick={() => { sound.playClick(); setErasingStep(st.id); }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '5px',
                            border: erasingStep === st.id ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                            background: erasingStep === st.id ? '#7c3aed' : '#ffffff',
                            color: erasingStep === st.id ? '#ffffff' : '#334155',
                            fontSize: '0.73rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG DIAGRAM PELAT BAJA & DEMO 3 TAHAPAN */}
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'center' }}>
                    <svg viewBox="0 0 380 170" width="100%" height="auto" style={{ maxHeight: '170px' }}>
                      <defs>
                        <linearGradient id="shieldStainlessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#e2e8f0" />
                          <stop offset="35%" stopColor="#f8fafc" />
                          <stop offset="70%" stopColor="#cbd5e1" />
                          <stop offset="100%" stopColor="#94a3b8" />
                        </linearGradient>
                      </defs>

                      {/* AREA KIRI: Visual Fisik Pelat Pelindung Penghapus Baja Stainless */}
                      <g transform="translate(15, 15)">
                        {/* Lembaran Baja Tipis 0.1 mm berujung Radius */}
                        <rect x="0" y="0" width="145" height="135" rx="10" fill="url(#shieldStainlessGrad)" stroke="#475569" strokeWidth="1.5" />
                        <text x="72" y="16" fontSize="7.5" fontWeight="900" fill="#334155" textAnchor="middle">STAINLESS STEEL 0.1 mm</text>

                        {/* Aneka Celah Presisi Beragam Bentuk pada Pelat Baja */}
                        {/* Celah Garis Panjang Sempit */}
                        <rect x="15" y="28" width="3" height="45" rx="1.5" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
                        {/* Celah Garis Melengkung */}
                        <path d="M 32 30 Q 42 50 32 72" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Celah Kotak / Persegi Kecil */}
                        <rect x="50" y="32" width="18" height="10" rx="1.5" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
                        <rect x="50" y="52" width="14" height="20" rx="1.5" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
                        {/* Deretan Lubang Titik Lingkaran */}
                        <circle cx="82" cy="35" r="2.5" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
                        <circle cx="82" cy="46" r="3.5" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
                        <circle cx="82" cy="60" r="5" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
                        {/* Celah Sudut Lancip 30° & Siku 90° */}
                        <polygon points="102,32 125,32 102,55" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
                        <polygon points="102,68 128,78 102,88" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />

                        {/* Celah Bawah Tambahan */}
                        <rect x="20" y="95" width="55" height="4" rx="2" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
                        <ellipse cx="108" cy="110" rx="18" ry="8" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />

                        <text x="72" y="128" fontSize="7" fontWeight="700" fill="#64748b" textAnchor="middle">Lubang Celah Presisi</text>
                      </g>

                      {/* PEMBATAS TENGAH */}
                      <line x1="175" y1="15" x2="175" y2="155" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 3" />

                      {/* AREA KANAN: Demonstrasi Skenario Gambar Berdasarkan Step */}
                      <g transform="translate(190, 15)">
                        <rect x="0" y="0" width="175" height="135" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
                        
                        {/* Garis Benda Kerja Utama (Tebal 0.7 mm Tipe A) - TIDAK BOLEH RUSAK! */}
                        <line x1="20" y1="25" x2="155" y2="25" stroke="#0f172a" strokeWidth="3" />
                        <line x1="20" y1="25" x2="20" y2="115" stroke="#0f172a" strokeWidth="3" />
                        <line x1="20" y1="115" x2="155" y2="115" stroke="#0f172a" strokeWidth="3" />
                        <text x="25" y="40" fontSize="8" fontWeight="800" fill="#0f172a">Garis Benda (0.7 mm)</text>

                        {/* STEP 1: MASALAH - Garis Bantu/Sumbu Melewati Batas */}
                        {erasingStep === 'problem' && (
                          <g>
                            {/* Garis yang benar di dalam */}
                            <line x1="60" y1="25" x2="60" y2="115" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="8 3" />
                            {/* Kelebihan Garis yang SALAH (Melewati Batas Luar) */}
                            <line x1="60" y1="25" x2="60" y2="0" stroke="#dc2626" strokeWidth="2" />
                            <line x1="60" y1="115" x2="60" y2="135" stroke="#dc2626" strokeWidth="2" />
                            
                            <rect x="75" y="55" width="90" height="35" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1" />
                            <text x="120" y="70" fontSize="8" fontWeight="900" fill="#dc2626" textAnchor="middle">❌ MASALAH:</text>
                            <text x="120" y="82" fontSize="7.5" fontWeight="700" fill="#991b1b" textAnchor="middle">Garis sumbu merah</text>
                            <text x="120" y="91" fontSize="7.5" fontWeight="700" fill="#991b1b" textAnchor="middle">kelebihan panjang</text>
                          </g>
                        )}

                        {/* STEP 2: PASANG PELAT PELINDUNG BAJA */}
                        {erasingStep === 'shield' && (
                          <g>
                            {/* Garis sumbu */}
                            <line x1="60" y1="25" x2="60" y2="115" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="8 3" />
                            
                            {/* Pelat Baja Pelindung Menutupi Garis Benda */}
                            <rect x="15" y="18" width="90" height="40" rx="4" fill="url(#shieldStainlessGrad)" stroke="#475569" strokeWidth="1" opacity="0.9" />
                            {/* Celah Sempit Pelat Tepat Mengekspos Garis Salah Saja */}
                            <rect x="58.5" y="0" width="3" height="23" fill="#ffffff" stroke="#dc2626" strokeWidth="1" />
                            <line x1="60" y1="0" x2="60" y2="23" stroke="#dc2626" strokeWidth="2" />

                            {/* Karet Penghapus Sedang Menggosok di Atas Celah */}
                            <g transform="translate(48, -5)">
                              <polygon points="5,0 30,0 25,18 0,18" fill="#ffffff" stroke="#2563eb" strokeWidth="1.2" />
                              <text x="14" y="12" fontSize="7" fontWeight="900" fill="#2563eb">ERASER</text>
                            </g>

                            <rect x="75" y="68" width="90" height="38" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                            <text x="120" y="82" fontSize="8" fontWeight="900" fill="#b45309" textAnchor="middle">🛡️ TERLINDUNGI:</text>
                            <text x="120" y="93" fontSize="7.5" fontWeight="700" fill="#92400e" textAnchor="middle">Hanya garis merah</text>
                            <text x="120" y="102" fontSize="7.5" fontWeight="700" fill="#92400e" textAnchor="middle">yang terbuka dicelah</text>
                          </g>
                        )}

                        {/* STEP 3: HASIL BERSIH SEMPURNA */}
                        {erasingStep === 'result' && (
                          <g>
                            {/* Garis sumbu yang pas sesuai ISO */}
                            <line x1="60" y1="20" x2="60" y2="120" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="8 3" />
                            <circle cx="60" cy="20" r="2" fill="#16a34a" />
                            <circle cx="60" cy="120" r="2" fill="#16a34a" />

                            <rect x="75" y="55" width="90" height="42" rx="4" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
                            <text x="120" y="70" fontSize="8.5" fontWeight="900" fill="#15803d" textAnchor="middle">✅ HASIL BERSIH:</text>
                            <text x="120" y="82" fontSize="7.5" fontWeight="700" fill="#166534" textAnchor="middle">Garis benda 100% utuh</text>
                            <text x="120" y="91" fontSize="7.5" fontWeight="700" fill="#166534" textAnchor="middle">Garis lebih terhapus</text>
                            <text x="120" y="100" fontSize="7" fontWeight="800" fill="#15803d" textAnchor="middle">Kertas tidak lecet!</text>
                          </g>
                        )}

                      </g>
                    </svg>
                  </div>

                  {/* SOP & Keunggulan Pelindung Penghapus */}
                  <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#5b21b6', lineHeight: 1.6 }}>
                    🛡️ <strong>Mengapa Pelindung Penghapus Wajib bagi Juru Gambar Mesin?</strong><br />
                    • <strong>Bahan:</strong> Pelat baja tahan karat (<em>stainless steel</em>) lentur tebal 0.1 mm yang tidak akan tergores atau sobek oleh gesekan penghapus.<br />
                    • <strong>Cara Pakai:</strong> Tekan pelindung dengan kuat memakai dua jari tangan kiri agar tidak geser. Arahkan gosokan penghapus karet <em>searah panjang celah</em>.<br />
                    • <strong>Tips Penting:</strong> Bersihkan remah/debu karet penghapus menggunakan <em>kuas pembersih gambar teknik</em> khusus. Jangan ditiup dengan mulut untuk menghindari cipratan air liur yang membuat kertas gambar lembap.
                  </div>

                </div>
              )}

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
      {/* =================================================================== */}
      {/* TAB 2: STANDARISASI GARIS (ISO 128) - INTERAKTIF & ILUSTRASI BENDA   */}
      {/* =================================================================== */}
      {activeTab === 'garis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Card */}
          <div className="dashboard-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #065f46, #064e3b)', color: '#ffffff' }}>
            <span style={{ background: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
              MODUL 2 • STANDARISASI GARIS (ISO 128)
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 8px 0', color: '#fff' }}>
              Klasifikasi Jenis Garis, Ketebalan, & Tata Penerapan Nyata
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#a7f3d0', lineHeight: 1.6, maxWidth: '900px' }}>
              Setiap jenis garis dalam gambar teknik memiliki makna teknis khusus yang diatur secara ketat oleh ISO 128. Rasio ketebalan garis standar adalah <strong>2 : 1</strong> antara garis tebal (misal 0.7 mm) dan garis tipis (0.35 mm). Pilih salah satu jenis garis di bawah ini untuk melihat contoh penerapannya langsung pada gambar kerja mekanik!
            </p>
          </div>

          {/* INTERACTIVE WORKPIECE ILLUSTRATION CARD */}
          <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header with Title & Instruction */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  🔍 Contoh Penerapan Nyata Jenis Garis pada Gambar Kerja Benda Mesin (ISO 128)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Klik tombol jenis garis di bawah ini atau klik langsung pada bagian gambar kerja untuk memfokuskan penerapan garis tersebut.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46' }}>📐 Standar Rasio:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px' }}>Tebal 2 : Tipis 1</span>
              </div>
            </div>

            {/* FEATURE SELECTOR BUTTONS */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '100%' }}>
              {[
                { id: 'A', label: 'Tipe A: Garis Benda (0.7 mm)', icon: '━', color: '#0f172a' },
                { id: 'B', label: 'Tipe B: Garis Ukur & Arsir (0.35 mm)', icon: '─', color: '#0284c7' },
                { id: 'C', label: 'Tipe C: Batas Sobekan (Bebas)', icon: '〰', color: '#10b981' },
                { id: 'D', label: 'Tipe D: Pemendekan Poros (Zig-zag)', icon: '⚡', color: '#d97706' },
                { id: 'F', label: 'Tipe E/F: Kontur Terhalang (Gores)', icon: '╌', color: '#ea580c' },
                { id: 'G', label: 'Tipe G: Sumbu Simetri (Gores Titik)', icon: '⸺·', color: '#2563eb' },
                { id: 'H', label: 'Tipe H: Bidang Potong A-A (Ujung Tebal)', icon: '✂️', color: '#dc2626' },
                { id: 'all', label: 'Semua Garis Terpadu', icon: '👁️', color: '#475569' }
              ].map(item => {
                const isSelected = selectedLineType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { sound.playClick(); setSelectedLineType(item.id); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${item.color}` : '1px solid var(--border-light)',
                      background: isSelected ? item.color : '#ffffff',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      boxShadow: isSelected ? `0 4px 12px ${item.color}40` : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SVG WORKPIECE ILLUSTRATION CANVAS */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '18px 16px',
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
                marginBottom: '10px'
              }}>
                <span>STATUS SOROTAN:</span>
                <span style={{
                  color: selectedLineType === 'A' ? '#0f172a' :
                         selectedLineType === 'B' ? '#0284c7' :
                         selectedLineType === 'C' ? '#10b981' :
                         selectedLineType === 'D' ? '#d97706' :
                         selectedLineType === 'F' || selectedLineType === 'E' ? '#ea580c' :
                         selectedLineType === 'G' ? '#2563eb' :
                         selectedLineType === 'H' ? '#dc2626' : '#0f172a',
                  fontWeight: 900
                }}>
                  {selectedLineType === 'A' ? '━ Tipe A: Garis Benda Nyata (Tebal Kontinu 0.7 mm)' :
                   selectedLineType === 'B' ? '─ Tipe B: Garis Ukur, Bantu, & Arsir Penampang 45° (Tipis Kontinu 0.35 mm)' :
                   selectedLineType === 'C' ? '〰 Tipe C: Garis Tipis Bebas (Batas Sobekan Lokal / Broken-out Section)' :
                   selectedLineType === 'D' ? '⚡ Tipe D: Garis Tipis Zig-zag (Batas Pemendekan Poros Panjang)' :
                   selectedLineType === 'F' || selectedLineType === 'E' ? '╌ Tipe E/F: Garis Gores Putus-putus (Lubang Tersembunyi)' :
                   selectedLineType === 'G' ? '⸺· Tipe G: Garis Sumbu Simetri & Pusat Lingkaran (Gores Titik Tipis)' :
                   selectedLineType === 'H' ? '✂️ Tipe H: Garis Bidang Pemotongan A-A (Gores Titik dengan Ujung Tebal)' :
                   '👁️ Seluruh 8 Jenis Garis ISO 128 Terpadu pada Gambar Kerja'}
                </span>
              </div>

              {/* TECHNICAL DRAWING SVG CANVAS */}
              {(() => {
                const isA = selectedLineType === 'A' || selectedLineType === 'all';
                const isB = selectedLineType === 'B' || selectedLineType === 'all';
                const isC = selectedLineType === 'C' || selectedLineType === 'all';
                const isD = selectedLineType === 'D' || selectedLineType === 'all';
                const isF = selectedLineType === 'F' || selectedLineType === 'E' || selectedLineType === 'all';
                const isG = selectedLineType === 'G' || selectedLineType === 'all';
                const isH = selectedLineType === 'H' || selectedLineType === 'all';

                return (
                  <svg viewBox="0 0 880 390" style={{ width: '100%', maxWidth: '100%', height: 'auto', maxHeight: '350px', userSelect: 'none', display: 'block' }}>
                    <defs>
                      <marker id="arrow-iso-blue" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                        <path d="M 0 2 L 10 5 L 0 8 z" fill="#0284c7" />
                      </marker>
                      <marker id="arrow-rev-blue" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                        <path d="M 10 2 L 0 5 L 10 8 z" fill="#0284c7" />
                      </marker>
                      <marker id="arrow-cut-red" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                        <path d="M 0 2 L 10 5 L 0 8 z" fill="#dc2626" />
                      </marker>
                    </defs>

                    {/* Sheet Grid / Paper background styling */}
                    <rect x="10" y="10" width="860" height="370" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" rx="8" />

                    {/* ----------------------------------------------------------- */}
                    {/* 1. TIPE G: GARIS SUMBU SIMETRI (Gores Titik Tipis)         */}
                    {/* ----------------------------------------------------------- */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('G'); }}
                      style={{ cursor: 'pointer' }}
                      opacity={isG ? 1 : 0.22}
                    >
                      {/* Main Horizontal Axis */}
                      <line
                        x1="50"
                        y1="200"
                        x2="810"
                        y2="200"
                        stroke={isG && selectedLineType === 'G' ? '#2563eb' : '#2563eb'}
                        strokeWidth={isG && selectedLineType === 'G' ? 2.8 : 1.4}
                        strokeDasharray="24 4 4 4"
                      />
                      {/* Vertical Hole Axis */}
                      <line
                        x1="280"
                        y1="120"
                        x2="280"
                        y2="280"
                        stroke={isG && selectedLineType === 'G' ? '#2563eb' : '#2563eb'}
                        strokeWidth={isG && selectedLineType === 'G' ? 2.8 : 1.4}
                        strokeDasharray="20 4 4 4"
                      />
                    </g>

                    {/* ----------------------------------------------------------- */}
                    {/* 2. TIPE F / E: GARIS GORES PUTUS-PUTUS (Benda Terhalang)   */}
                    {/* ----------------------------------------------------------- */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('F'); }}
                      style={{ cursor: 'pointer' }}
                      opacity={isF ? 1 : 0.2}
                    >
                      {/* Blind hole drilled into left collar: ⌀28, depth 110mm */}
                      <line
                        x1="110"
                        y1="186"
                        x2="220"
                        y2="186"
                        stroke="#ea580c"
                        strokeWidth={isF && (selectedLineType === 'F' || selectedLineType === 'E') ? 2.6 : 1.6}
                        strokeDasharray="8 3"
                      />
                      <line
                        x1="110"
                        y1="214"
                        x2="220"
                        y2="214"
                        stroke="#ea580c"
                        strokeWidth={isF && (selectedLineType === 'F' || selectedLineType === 'E') ? 2.6 : 1.6}
                        strokeDasharray="8 3"
                      />
                      {/* Drill tip cone 118 degrees */}
                      <line
                        x1="220"
                        y1="186"
                        x2="232"
                        y2="200"
                        stroke="#ea580c"
                        strokeWidth={isF && (selectedLineType === 'F' || selectedLineType === 'E') ? 2.6 : 1.6}
                        strokeDasharray="8 3"
                      />
                      <line
                        x1="220"
                        y1="214"
                        x2="232"
                        y2="200"
                        stroke="#ea580c"
                        strokeWidth={isF && (selectedLineType === 'F' || selectedLineType === 'E') ? 2.6 : 1.6}
                        strokeDasharray="8 3"
                      />
                      {/* Counterbore step at x=145 */}
                      <line
                        x1="145"
                        y1="178"
                        x2="145"
                        y2="186"
                        stroke="#ea580c"
                        strokeWidth={isF && (selectedLineType === 'F' || selectedLineType === 'E') ? 2.6 : 1.6}
                        strokeDasharray="8 3"
                      />
                      <line
                        x1="145"
                        y1="214"
                        x2="145"
                        y2="222"
                        stroke="#ea580c"
                        strokeWidth={isF && (selectedLineType === 'F' || selectedLineType === 'E') ? 2.6 : 1.6}
                        strokeDasharray="8 3"
                      />
                    </g>

                    {/* ----------------------------------------------------------- */}
                    {/* 3. TIPE B: ARSIRAN POTONGAN 45° (Garis Tipis Kontinu)      */}
                    {/* ----------------------------------------------------------- */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('B'); }}
                      style={{ cursor: 'pointer' }}
                      opacity={isB ? 1 : 0.2}
                    >
                      {/* Hatching 45° inside local section breakout */}
                      {[265, 275, 285, 295, 305, 315, 325, 335, 345].map((hx, hi) => (
                        <line
                          key={hi}
                          x1={hx}
                          y1="150"
                          x2={hx + 28}
                          y2="178"
                          stroke="#0284c7"
                          strokeWidth={isB && selectedLineType === 'B' ? 2.0 : 1.2}
                        />
                      ))}
                    </g>

                    {/* ----------------------------------------------------------- */}
                    {/* 4. TIPE C: GARIS TIPIS BEBAS (Batas Sobekan Lokal)         */}
                    {/* ----------------------------------------------------------- */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('C'); }}
                      style={{ cursor: 'pointer' }}
                      opacity={isC ? 1 : 0.2}
                    >
                      {/* Freehand local break boundary curve */}
                      <path
                        d="M 260 150 Q 275 168 290 164 T 325 180 T 355 150"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={isC && selectedLineType === 'C' ? 3.0 : 1.6}
                      />
                      {/* Pocket inside cutout */}
                      <rect
                        x="285"
                        y="158"
                        width="36"
                        height="14"
                        fill="#f8fafc"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        rx="2"
                      />
                    </g>

                    {/* ----------------------------------------------------------- */}
                    {/* 5. TIPE A: KONTUR BENDA NYATA (Garis Tebal Kontinu 0.7mm)   */}
                    {/* ----------------------------------------------------------- */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('A'); }}
                      style={{ cursor: 'pointer' }}
                      opacity={isA ? 1 : 0.25}
                    >
                      {/* Left Collar (⌀60) */}
                      <path
                        d="
                          M 110 176
                          L 116 170
                          L 170 170
                          L 170 150
                          L 360 150
                          L 360 165
                          L 500 165
                          L 500 178
                          L 620 178
                          M 650 178
                          L 744 178
                          L 750 184
                          L 750 216
                          L 744 222
                          L 650 222
                          M 620 222
                          L 500 222
                          L 500 235
                          L 360 235
                          L 360 250
                          L 170 250
                          L 170 230
                          L 116 230
                          L 110 224
                          Z
                        "
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth={isA && selectedLineType === 'A' ? 4.5 : 3.2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />

                      {/* Internal step boundaries */}
                      <line x1="170" y1="170" x2="170" y2="230" stroke="#0f172a" strokeWidth={isA && selectedLineType === 'A' ? 4.5 : 3.2} />
                      <line x1="360" y1="165" x2="360" y2="235" stroke="#0f172a" strokeWidth={isA && selectedLineType === 'A' ? 4.5 : 3.2} />
                      <line x1="500" y1="178" x2="500" y2="222" stroke="#0f172a" strokeWidth={isA && selectedLineType === 'A' ? 4.5 : 3.2} />
                    </g>

                    {/* ----------------------------------------------------------- */}
                    {/* 6. TIPE D: GARIS TIPIS ZIG-ZAG (Pemendekan Poros Panjang)  */}
                    {/* ----------------------------------------------------------- */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('D'); }}
                      style={{ cursor: 'pointer' }}
                      opacity={isD ? 1 : 0.2}
                    >
                      {/* Left Zig-zag break at x=620 */}
                      <path
                        d="M 620 174 L 620 193 L 613 197 L 627 203 L 620 207 L 620 226"
                        fill="none"
                        stroke="#d97706"
                        strokeWidth={isD && selectedLineType === 'D' ? 2.8 : 1.6}
                      />
                      {/* Right Zig-zag break at x=650 */}
                      <path
                        d="M 650 174 L 650 193 L 643 197 L 657 203 L 650 207 L 650 226"
                        fill="none"
                        stroke="#d97706"
                        strokeWidth={isD && selectedLineType === 'D' ? 2.8 : 1.6}
                      />
                    </g>

                    {/* ----------------------------------------------------------- */}
                    {/* 7. TIPE B: GARIS UKUR & GARIS BANTU (Tipis Kontinu 0.35mm) */}
                    {/* ----------------------------------------------------------- */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('B'); }}
                      style={{ cursor: 'pointer' }}
                      opacity={isB ? 1 : 0.2}
                    >
                      {/* Top Horizontal Dimension (190 mm) */}
                      <line x1="170" y1="145" x2="170" y2="85" stroke="#0284c7" strokeWidth="1.2" />
                      <line x1="360" y1="145" x2="360" y2="85" stroke="#0284c7" strokeWidth="1.2" />
                      <line
                        x1="170"
                        y1="95"
                        x2="360"
                        y2="95"
                        stroke="#0284c7"
                        strokeWidth={isB && selectedLineType === 'B' ? 2.4 : 1.4}
                        markerStart="url(#arrow-rev-blue)"
                        markerEnd="url(#arrow-iso-blue)"
                      />
                      <text x="265" y="89" fontSize="12" fontWeight="900" fill="#0284c7" textAnchor="middle">
                        190
                      </text>

                      {/* Left Vertical Dimension (⌀60 mm) */}
                      <line x1="105" y1="170" x2="65" y2="170" stroke="#0284c7" strokeWidth="1.2" />
                      <line x1="105" y1="230" x2="65" y2="230" stroke="#0284c7" strokeWidth="1.2" />
                      <line
                        x1="75"
                        y1="170"
                        x2="75"
                        y2="230"
                        stroke="#0284c7"
                        strokeWidth={isB && selectedLineType === 'B' ? 2.4 : 1.4}
                        markerStart="url(#arrow-rev-blue)"
                        markerEnd="url(#arrow-iso-blue)"
                      />
                      <text x="70" y="204" fontSize="11" fontWeight="900" fill="#0284c7" textAnchor="end">
                        ⌀60
                      </text>

                      {/* Leader Line for Chamfer C2 */}
                      <path
                        d="M 112 173 L 80 135 L 35 135"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth={isB && selectedLineType === 'B' ? 2.2 : 1.2}
                      />
                      <text x="35" y="130" fontSize="11" fontWeight="800" fill="#0284c7">
                        C2 (2×45°)
                      </text>
                    </g>

                    {/* ----------------------------------------------------------- */}
                    {/* 8. TIPE H: GARIS BIDANG POTONG (Ujung Tebal Panah A-A)      */}
                    {/* ----------------------------------------------------------- */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('H'); }}
                      style={{ cursor: 'pointer' }}
                      opacity={isH ? 1 : 0.2}
                    >
                      {/* Cutting plane line at x=440 */}
                      {/* Top Thick Bar */}
                      <line x1="440" y1="95" x2="440" y2="125" stroke="#dc2626" strokeWidth={isH && selectedLineType === 'H' ? 4.8 : 3.8} />
                      {/* Chain thin middle */}
                      <line x1="440" y1="125" x2="440" y2="275" stroke="#dc2626" strokeWidth={isH && selectedLineType === 'H' ? 2.0 : 1.2} strokeDasharray="18 4 4 4" />
                      {/* Bottom Thick Bar */}
                      <line x1="440" y1="275" x2="440" y2="305" stroke="#dc2626" strokeWidth={isH && selectedLineType === 'H' ? 4.8 : 3.8} />
                      
                      {/* Top Viewing Arrow A */}
                      <line x1="440" y1="105" x2="465" y2="105" stroke="#dc2626" strokeWidth="2.4" markerEnd="url(#arrow-cut-red)" />
                      <text x="472" y="110" fontSize="14" fontWeight="900" fill="#dc2626">A</text>

                      {/* Bottom Viewing Arrow A */}
                      <line x1="440" y1="295" x2="465" y2="295" stroke="#dc2626" strokeWidth="2.4" markerEnd="url(#arrow-cut-red)" />
                      <text x="472" y="300" fontSize="14" fontWeight="900" fill="#dc2626">A</text>
                    </g>

                    {/* ----------------------------------------------------------- */}
                    {/* CALLOUT BADGES POINTING TO LINES IN THE DRAWING             */}
                    {/* ----------------------------------------------------------- */}
                    {/* Tipe A Badge */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('A'); }}
                      style={{ cursor: 'pointer' }}
                      transform="translate(180, 275)"
                    >
                      <rect x="0" y="0" width="165" height="24" rx="5" fill={selectedLineType === 'A' ? '#0f172a' : '#ffffff'} stroke="#0f172a" strokeWidth="1.5" />
                      <text x="82" y="16" fontSize="10" fontWeight="900" fill={selectedLineType === 'A' ? '#ffffff' : '#0f172a'} textAnchor="middle">
                        [Tipe A: Garis Benda 0.7mm]
                      </text>
                    </g>

                    {/* Tipe B Badge */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('B'); }}
                      style={{ cursor: 'pointer' }}
                      transform="translate(200, 48)"
                    >
                      <rect x="0" y="0" width="170" height="24" rx="5" fill={selectedLineType === 'B' ? '#0284c7' : '#ffffff'} stroke="#0284c7" strokeWidth="1.5" />
                      <text x="85" y="16" fontSize="10" fontWeight="900" fill={selectedLineType === 'B' ? '#ffffff' : '#0284c7'} textAnchor="middle">
                        [Tipe B: Garis Ukur & Arsir]
                      </text>
                    </g>

                    {/* Tipe C Badge */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('C'); }}
                      style={{ cursor: 'pointer' }}
                      transform="translate(265, 122)"
                    >
                      <rect x="0" y="0" width="130" height="22" rx="4" fill={selectedLineType === 'C' ? '#10b981' : '#ffffff'} stroke="#10b981" strokeWidth="1.5" />
                      <text x="65" y="15" fontSize="9.5" fontWeight="900" fill={selectedLineType === 'C' ? '#ffffff' : '#10b981'} textAnchor="middle">
                        [Tipe C: Sobekan Bebas]
                      </text>
                    </g>

                    {/* Tipe D Badge */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('D'); }}
                      style={{ cursor: 'pointer' }}
                      transform="translate(565, 245)"
                    >
                      <rect x="0" y="0" width="150" height="24" rx="5" fill={selectedLineType === 'D' ? '#d97706' : '#ffffff'} stroke="#d97706" strokeWidth="1.5" />
                      <text x="75" y="16" fontSize="9.5" fontWeight="900" fill={selectedLineType === 'D' ? '#ffffff' : '#d97706'} textAnchor="middle">
                        [Tipe D: Pemendekan Poros]
                      </text>
                    </g>

                    {/* Tipe F Badge */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('F'); }}
                      style={{ cursor: 'pointer' }}
                      transform="translate(95, 245)"
                    >
                      <rect x="0" y="0" width="150" height="24" rx="5" fill={selectedLineType === 'F' || selectedLineType === 'E' ? '#ea580c' : '#ffffff'} stroke="#ea580c" strokeWidth="1.5" />
                      <text x="75" y="16" fontSize="9.5" fontWeight="900" fill={selectedLineType === 'F' || selectedLineType === 'E' ? '#ffffff' : '#ea580c'} textAnchor="middle">
                        [Tipe F: Lubang Terhalang]
                      </text>
                    </g>

                    {/* Tipe G Badge */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('G'); }}
                      style={{ cursor: 'pointer' }}
                      transform="translate(680, 160)"
                    >
                      <rect x="0" y="0" width="145" height="24" rx="5" fill={selectedLineType === 'G' ? '#2563eb' : '#ffffff'} stroke="#2563eb" strokeWidth="1.5" />
                      <text x="72" y="16" fontSize="9.5" fontWeight="900" fill={selectedLineType === 'G' ? '#ffffff' : '#2563eb'} textAnchor="middle">
                        [Tipe G: Sumbu Simetri]
                      </text>
                    </g>

                    {/* Tipe H Badge */}
                    <g
                      onClick={() => { sound.playClick(); setSelectedLineType('H'); }}
                      style={{ cursor: 'pointer' }}
                      transform="translate(420, 318)"
                    >
                      <rect x="0" y="0" width="150" height="24" rx="5" fill={selectedLineType === 'H' ? '#dc2626' : '#ffffff'} stroke="#dc2626" strokeWidth="1.5" />
                      <text x="75" y="16" fontSize="9.5" fontWeight="900" fill={selectedLineType === 'H' ? '#ffffff' : '#dc2626'} textAnchor="middle">
                        [Tipe H: Bidang Potong A-A]
                      </text>
                    </g>

                    {/* Physical stroke scale comparison at canvas bottom-left */}
                    <g transform="translate(35, 345)">
                      <rect x="0" y="0" width="310" height="32" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                      <text x="10" y="20" fontSize="9" fontWeight="800" fill="#475569">Skala Ketebalan ISO 128 (2:1):</text>
                      <line x1="165" y1="20" x2="215" y2="20" stroke="#0f172a" strokeWidth="3.5" />
                      <text x="190" y="12" fontSize="7.5" fontWeight="800" fill="#0f172a" textAnchor="middle">0.7 mm</text>
                      <line x1="240" y1="20" x2="290" y2="20" stroke="#64748b" strokeWidth="1.4" />
                      <text x="265" y="12" fontSize="7.5" fontWeight="800" fill="#64748b" textAnchor="middle">0.35 mm</text>
                    </g>
                  </svg>
                );
              })()}

            </div>

            {/* DYNAMIC DETAIL & KAIDAH PANEL */}
            {(() => {
              const LINE_DETAILS = {
                A: {
                  title: 'Kaidah Garis Tebal Kontinu - Tipe A (ISO 128)',
                  tag: 'STANDAR GARIS NYATA',
                  color: '#0f172a',
                  bg: '#f1f5f9',
                  thick: '0.5 – 0.7 mm (Tebal Penuh)',
                  pencil: 'Pensil B / 2B (0.7 mm) atau Rapido 0.70 mm',
                  items: [
                    { label: 'Definisi & Karakteristik', val: 'Garis kontinu tebal padat tanpa putus. Memiliki ketebalan nominal 0.5 – 0.7 mm (wajib konsisten 2× lipat dibanding garis tipis Tipe B).' },
                    { label: 'Penerapan pada Gambar Mesin', val: 'Garis kontur luar benda kerja yang terlihat langsung oleh mata, batas pertemuan permukaan nyata, garis tepi kertas gambar (border), dan garis bingkai etiket.' },
                    { label: 'Standar CAD / Software', val: 'Pada AutoCAD / Fusion 360: Diatur Lineweight 0.70 mm (Continuous). Tampil tegas dan paling dominan di lembar cetak (plotting).' },
                    { label: 'Kesalahan Fatal Siswa', val: 'Menggambar garis benda dengan ketebalan yang sama dengan garis ukur/arsir, atau garis tidak rata (putus-nyambung/berbulu).' },
                    { label: 'Fungsi Manufaktur', val: 'Batas acuan absolut bagi operator bubut/milling untuk memastikan geometri fisik komponen mesin yang harus dibentuk dari bongkahan logam mentah.' }
                  ]
                },
                B: {
                  title: 'Kaidah Garis Tipis Kontinu - Tipe B (ISO 128)',
                  tag: 'GARIS UKUR, BANTU, & ARSIR',
                  color: '#0284c7',
                  bg: '#e0f2fe',
                  thick: '0.25 – 0.35 mm (Tipis 1/2 Tipe A)',
                  pencil: 'Pensil 2H / 3H (0.35 mm) atau Rapido 0.35 mm',
                  items: [
                    { label: 'Definisi & Karakteristik', val: 'Garis kontinu tipis lurus sempurna tanpa putus. Ketebalan nominal 0.25 – 0.35 mm (tepat setengah dari garis Tipe A).' },
                    { label: 'Penerapan pada Gambar Mesin', val: 'Garis ukur (dimension lines), garis bantu ukur (extension lines), garis penunjuk notasi (leader lines), garis arsir penampang 45° (hatching), dan garis akar/dasar ulir baut.' },
                    { label: 'Aturan Celah (Gap)', val: 'Garis bantu ukur TIDAK BOLEH menempel rapat ke garis benda nyata Tipe A; wajib diberi jarak celah (gap) 1 – 2 mm agar tidak membingungkan operator.' },
                    { label: 'Kesalahan Fatal Siswa', val: 'Mengarsir potongan dengan garis tebal atau menggambar garis ukur yang saling memotong garis ukur lainnya.' },
                    { label: 'Fungsi Manufaktur', val: 'Menyampaikan nilai ukuran presisi, suaian toleransi, dan memperjelas area pemotongan logam tanpa mengaburkan batas kontur fisik benda.' }
                  ]
                },
                C: {
                  title: 'Kaidah Garis Tipis Bebas (Freehand) - Tipe C (ISO 128)',
                  tag: 'BATAS SOBEKAN LOKAL',
                  color: '#10b981',
                  bg: '#d1fae5',
                  thick: '0.25 – 0.35 mm (Tangan Bebas)',
                  pencil: 'Pensil 2H / H digambar santai tanpa mistar',
                  items: [
                    { label: 'Definisi & Karakteristik', val: 'Garis tipis bergelombang alami yang digambar dengan tangan bebas (freehand) tanpa bantuan penggaris. Tebal nominal 0.25 – 0.35 mm.' },
                    { label: 'Penerapan pada Gambar Mesin', val: 'Garis batas potongan sebagian (sobekan lokal / broken-out section) bila batas pemotongan tidak berimpit dengan garis sumbu simetri.' },
                    { label: 'Kaidah Penggambaran', val: 'Gelombang tidak boleh dibuat terlalu kaku atau beraturan seperti ombak; ditarik mengelilingi fitur internal yang ingin ditampakkan lalu diisi arsiran Tipe B.' },
                    { label: 'Kesalahan Fatal Siswa', val: 'Menggambar garis sobekan menggunakan penggaris lurus, atau menarik garis melintasi bagian luar benda.' },
                    { label: 'Fungsi Manufaktur', val: 'Memperlihatkan detail bagian dalam (seperti alur pasak, lubang buntu, atau bantalan) secara hemat gambar tanpa perlu membuat gambar pandangan potongan penuh.' }
                  ]
                },
                D: {
                  title: 'Kaidah Garis Tipis Zig-zag - Tipe D (ISO 128)',
                  tag: 'PEMENDEKAN POROS PANJANG',
                  color: '#d97706',
                  bg: '#fef3c7',
                  thick: '0.25 – 0.35 mm (Garis Mistar Zig-zag)',
                  pencil: 'Pensil 2H + mistar segitiga (mal sudut)',
                  items: [
                    { label: 'Definisi & Karakteristik', val: 'Garis lurus tipis yang diselingi tekukan zig-zag simetris tajam setinggi 5 – 7 mm, digambar menggunakan mistar penggaris. Tebal 0.25 – 0.35 mm.' },
                    { label: 'Penerapan pada Gambar Mesin', val: 'Garis batas pemotongan / pemendekan benda kerja yang panjang dan berpenampang konstan (misal: poros transmisi 2 meter, rel pemandu, pipa tubular).' },
                    { label: 'Aturan Angka Ukuran', val: 'Meskipun gambar fisik poros dipendekkan di kertas, angka ukuran dimensi yang tercantum WAJIB TETAP nilai panjang sebenarnya (contoh: tetap ditulis 1800 mm).' },
                    { label: 'Kesalahan Fatal Siswa', val: 'Ikut memotong angka ukuran atau menggambar zig-zag tidak simetris melebihi batas badan poros.' },
                    { label: 'Fungsi Manufaktur', val: 'Menghemat area kertas gambar sehingga poros panjang dapat digambar pada format A4/A3 standar dengan skala detail ujung-ujung yang tetap proporsional dan jelas.' }
                  ]
                },
                E: {
                  title: 'Kaidah Garis Gores Tebal - Tipe E (ISO 128)',
                  tag: 'PERLAKUAN PERMUKAAN KHUSUS',
                  color: '#c2410c',
                  bg: '#ffedd5',
                  thick: '0.5 – 0.7 mm (Strip Tebal)',
                  pencil: 'Pensil B / 2B (0.7 mm, garis gores)',
                  items: [
                    { label: 'Definisi & Karakteristik', val: 'Garis putus-putus tebal dengan panjang gores 3 – 5 mm dan celah 1 mm. Tebal nominal 0.5 – 0.7 mm.' },
                    { label: 'Penerapan pada Gambar Mesin', val: 'Penunjukan indikasi permukaan khusus yang menerima perlakuan panas (heat treatment seperti hardening/nitriding) atau pelapisan kimia (electroplating).' },
                    { label: 'Prioritas Standar', val: 'Dalam ISO 128 modern, untuk garis terhalang biasa diutamakan menggunakan Tipe F (tipis), sedangkan Tipe E dikhususkan untuk zona perlakuan khusus.' },
                    { label: 'Kesalahan Fatal Siswa', val: 'Tertukar dengan Tipe F sehingga operator bengkel mengira seluruh rongga dalam harus disepuh keras (hardening).' },
                    { label: 'Fungsi Manufaktur', val: 'Instruksi bagi teknisi heat treatment di bengkel perlakuan panas mengenai zona permukaan poros yang wajib dikeraskan.' }
                  ]
                },
                F: {
                  title: 'Kaidah Garis Gores Tipis - Tipe F (ISO 128)',
                  tag: 'KONTUR & TEPI TERHALANG',
                  color: '#ea580c',
                  bg: '#ffedd5',
                  thick: '0.25 – 0.35 mm (Strip Tipis)',
                  pencil: 'Pensil H / 2H (0.35 mm, gores seragam)',
                  items: [
                    { label: 'Definisi & Karakteristik', val: 'Garis putus-putus tipis (gores 3 – 5 mm, celah 1 mm). Tebal nominal 0.25 – 0.35 mm (setengah dari garis nyata Tipe A).' },
                    { label: 'Penerapan pada Gambar Mesin', val: 'Menunjukkan tepi, rusuk, lubang bor silinder, atau alur yang terhalang dari pandangan mata pengamat (hidden lines).' },
                    { label: 'Aturan Pertemuan Sudut', val: 'Garis gores WAJIB BERAWAL DAN BERAKHIR DENGAN STRIP GORES di titik pertemuan sudut (dilarang bertemu pada celah kosong!).' },
                    { label: 'Kesalahan Fatal Siswa', val: 'Panjang strip gores tidak beraturan (ada yang panjang 10 mm, ada yang 2 mm) atau menabrak garis nyata tanpa aturan.' },
                    { label: 'Fungsi Manufaktur', val: 'Memberi informasi keberadaan lubang bor tembus, rongga baut, atau alur di bagian dalam tanpa harus selalu memotong benda.' }
                  ]
                },
                G: {
                  title: 'Kaidah Garis Gores Titik Tipis - Tipe G (ISO 128)',
                  tag: 'SUMBU SIMETRI & CENTER LINE',
                  color: '#2563eb',
                  bg: '#dbeafe',
                  thick: '0.25 – 0.35 mm (Gores Titik Rantai)',
                  pencil: 'Pensil 2H (0.35 mm) berujung runcing',
                  items: [
                    { label: 'Definisi & Karakteristik', val: 'Garis rantai tipis berselang-seling: strip panjang 10 – 15 mm, celah 1 mm, titik/dot, celah 1 mm. Tebal nominal 0.25 – 0.35 mm.' },
                    { label: 'Penerapan pada Gambar Mesin', val: 'Garis sumbu simetri poros silinder, pusat lingkaran lubang bor, lingkaran pitch jarak bagi gigi (PCD), dan lintasan gerak mekanisme.' },
                    { label: 'Aturan Pusat Lingkaran (+)', val: 'Titik pusat lingkaran WAJIB DITANDAI DENGAN PERPOTONGAN DUA STRIP PANJANG (+), dilarang keras berpotongan pada titik atau celah kosong!' },
                    { label: 'Aturan Lewatan Sumbu', val: 'Garis sumbu wajib dilebihkan keluar dari tepi benda kerja sebesar 2 – 5 mm (tidak boleh berhenti tepat di garis benda).' },
                    { label: 'Fungsi Manufaktur', val: 'Menjadi titik referensi nol (datum/origin) bagi juru bubut saat membuat lubang senter (center drill) dan bagi programmer CNC saat menetapkan Work Coordinate System (WCS).' }
                  ]
                },
                H: {
                  title: 'Kaidah Garis Gores Titik Ujung Tebal - Tipe H (ISO 128)',
                  tag: 'BIDANG POTONG PENAMPANG A-A',
                  color: '#dc2626',
                  bg: '#fee2e2',
                  thick: 'Tipis (0.35 mm) di tengah, Tebal (0.7 mm) di ujung',
                  pencil: 'Rapido / Pensil B di ujung, 2H di tengah',
                  items: [
                    { label: 'Definisi & Karakteristik', val: 'Garis gores titik yang tipis (0.35 mm) di sepanjang jalurnya, tetapi DIPERTEBAL (0.7 mm) sepanjang 10-15 mm di kedua ujung dan setiap belokan arah.' },
                    { label: 'Penerapan pada Gambar Mesin', val: 'Garis lintasan bidang pemotongan penampang benda kerja (cutting plane line), dilengkapi anak panah arah pandang tegak lurus dan huruf kapital pengenal (A – A).' },
                    { label: 'Arah Anak Panah', val: 'Anak panah menunjuk ke arah bagian benda yang DIPERTAHANKAN dan DILIHAT oleh mata pengamat saat gambar potongan digambar.' },
                    { label: 'Kesalahan Fatal Siswa', val: 'Arah panah terbalik (mengarah keluar) atau lupa mempertebal kedua ujung garis sehingga dikira garis sumbu biasa.' },
                    { label: 'Fungsi Manufaktur', val: 'Panduan utama bagi operator untuk memahami struktur rongga internal yang rumit dengan melihat gambar proyeksi penampang A-A.' }
                  ]
                },
                all: {
                  title: 'Sintesis Penerapan Terpadu Seluruh Jenis Garis (ISO 128)',
                  tag: 'SISTEM GAMBAR TEKNIK TERPADU',
                  color: '#0f172a',
                  bg: '#f8fafc',
                  thick: 'Kombinasi Garis Tebal (0.7 mm) & Tipis (0.35 mm)',
                  pencil: 'Set Lengkap Pensil 2B, HB, H, 2H, 3H',
                  items: [
                    { label: 'Rasio Kontras 2 : 1', val: 'Kunci keindahan dan kejelasan gambar teknik adalah rasio tegas 2:1 antara garis tebal (Tipe A, E, ujung H) dan garis tipis (Tipe B, C, D, F, G, tengah H).' },
                    { label: 'Hirarki Visual Mata', val: 'Mata pembaca langsung mengenali wujud fisik benda lewat garis Tipe A, memahami dimensi lewat Tipe B, dan mengetahui sumbu lewat Tipe G.' },
                    { label: 'Urutan Garis Berimpit', val: '1. Garis Benda (Tipe A) > 2. Garis Terhalang (Tipe F) > 3. Garis Potong (Tipe H) > 4. Garis Sumbu (Tipe G) > 5. Garis Ukur/Bantu (Tipe B).' },
                    { label: 'Standar Internasional', val: 'Mengikuti standar ISO 128 menjamin gambar kerja yang dibuat di Indonesia dapat dibaca dan diproduksi tanpa salah paham di seluruh bengkel manufaktur dunia.' },
                    { label: 'Fungsi Manufaktur', val: 'Menjadi jembatan komunikasi presisi dan legal antara divisi perancangan teknik (engineering) dan lini produksi bengkel pemesinan.' }
                  ]
                }
              };

              const currentDetail = LINE_DETAILS[selectedLineType] || LINE_DETAILS.A;

              return (
                <div style={{
                  background: '#ffffff',
                  border: `1.5px solid ${currentDetail.color}30`,
                  borderRadius: '12px',
                  padding: '20px 24px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Panel Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                    <div>
                      <span style={{
                        background: currentDetail.bg,
                        color: currentDetail.color,
                        fontWeight: 900,
                        fontSize: '0.72rem',
                        padding: '3px 10px',
                        borderRadius: '4px',
                        letterSpacing: '0.5px'
                      }}>
                        {currentDetail.tag}
                      </span>
                      <h4 style={{ margin: '8px 0 2px 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {currentDetail.title}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Rekomendasi Alat: <strong>{currentDetail.pencil}</strong> • Standar Ketebalan: <strong>{currentDetail.thick}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Feature Rules Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    {currentDetail.items.map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f8fafc',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${currentDetail.color}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: currentDetail.color, textTransform: 'uppercase' }}>
                          {it.label}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                          {it.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* LINE PRECEDENCE ALERT BOX */}
                  <div style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7', color: '#92400e', fontSize: '0.8rem', lineHeight: 1.6 }}>
                    <strong>⚠️ Urutan Prioritas Garis Berimpit (Line Precedence ISO 128):</strong><br />
                    Jika dua atau lebih garis bertumpuk pada posisi yang sama, urutan yang wajib dimenangkan adalah:<br />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', fontWeight: 800, fontSize: '0.75rem' }}>
                      <span style={{ background: '#0f172a', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>1. Garis Nyata (Tipe A)</span>
                      <span>&gt;</span>
                      <span style={{ background: '#ea580c', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>2. Garis Terhalang (Tipe F)</span>
                      <span>&gt;</span>
                      <span style={{ background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>3. Garis Bidang Potong (Tipe H)</span>
                      <span>&gt;</span>
                      <span style={{ background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>4. Garis Sumbu (Tipe G)</span>
                      <span>&gt;</span>
                      <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>5. Garis Ukur / Bantu (Tipe B)</span>
                    </div>
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
              <div
                onClick={() => { sound.playClick(); setProjectionSystem('amerika'); }}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: projectionSystem === 'amerika' ? '3px solid #2563eb' : '1px solid #cbd5e1',
                  padding: '24px',
                  boxShadow: projectionSystem === 'amerika' ? '0 8px 25px rgba(37, 99, 235, 0.15)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
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
              <div
                onClick={() => { sound.playClick(); setProjectionSystem('eropa'); }}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: projectionSystem === 'eropa' ? '3px solid #d97706' : '1px solid #cbd5e1',
                  padding: '24px',
                  boxShadow: projectionSystem === 'eropa' ? '0 8px 25px rgba(217, 119, 6, 0.15)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
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

          {/* BANNER TRANSISI MENUJU SIMULATOR ORTOGONAL 3D DEDIKASI */}
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)',
            borderRadius: '16px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)'
          }}>
            <div style={{ maxWidth: '650px' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🧭</span> Praktikkan Langsung di Step 2: Simulator Ortogonal 3D!
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.95, lineHeight: 1.6 }}>
                Setelah memahami simbol proyeksi Eropa &amp; Amerika di atas, coba putar orbit 3D dan bandingkan 4 proyeksi ortogonal dari 8 model komponen standar permesinan.
              </div>
            </div>
            {onNavigateToOrtogonal && (
              <button
                onClick={onNavigateToOrtogonal}
                style={{
                  padding: '12px 22px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#ffffff',
                  color: '#1e3a8a',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s'
                }}
              >
                <span>🚀</span> Buka 2. Simulator Ortogonal ➔
              </button>
            )}
          </div>

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

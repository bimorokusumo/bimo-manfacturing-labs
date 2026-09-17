import React, { useState } from 'react';
import { sound } from '../utils/audio';

// Database Kecepatan Potong Standar (Cutting Speed Cs) untuk Mesin Bubut
const CS_DATABASE = [
  { material: 'Baja Lunak (St 37 / Mild Steel)', csHss: 25, csCarbide: 150, desc: 'Baja konstruksi umum, ulet dan mudah disayat' },
  { material: 'Baja Karbon Sedang (St 45 / S45C)', csHss: 20, csCarbide: 120, desc: 'Baja poros as dan roda gigi, butuh pendinginan cukup' },
  { material: 'Aluminium & Paduannya', csHss: 75, csCarbide: 300, desc: 'Logam lunak non-ferro, sayatan cepat dan halus' },
  { material: 'Besi Tuang / Cor (Cast Iron)', csHss: 18, csCarbide: 100, desc: 'Getas, tatal serbuk, umumnya dibubut kering tanpa coolant' },
  { material: 'Kuningan / Tembaga (Brass/Bronze)', csHss: 40, csCarbide: 200, desc: 'Logam lunak konduktif, tatal patah-patah pendek' }
];

const PreparationModal = ({ machineName, onComplete }) => {
  const [step, setStep] = useState(1);
  const [checks, setChecks] = useState({
    glasses: false,
    shoes: false,
    wearpack: false
  });

  // Sub-tab di Step 2 (SOP): 'sop', 'formulas', 'calculator'
  const [sopTab, setSopTab] = useState('formulas');

  // Interactive Calculator State
  const [calcMode, setCalcMode] = useState('rpm'); // 'rpm' | 'feed-time' | 'taper'
  
  // Calculator 1: RPM
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0);
  const [toolType, setToolType] = useState('hss'); // 'hss' | 'carbide'
  const [userDiameter, setUserDiameter] = useState(50); // mm
  const [manualCs, setManualCs] = useState(25); // m/min

  // Calculator 2: Feed & Time
  const [userLength, setUserLength] = useState(80); // mm
  const [userFeedRev, setUserFeedRev] = useState(0.15); // mm/putaran
  const [userCalcRpm, setUserCalcRpm] = useState(600); // RPM

  // Calculator 3: Taper
  const [userBigD, setUserBigD] = useState(50); // mm
  const [userSmallD, setUserSmallD] = useState(40); // mm
  const [userTaperL, setUserTaperL] = useState(40); // mm

  const allChecked = checks.glasses && checks.shoes && checks.wearpack;

  const handleCheck = (item) => {
    sound.playClick();
    setChecks(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleNext = () => {
    sound.playClick();
    if (step === 1 && allChecked) {
      setStep(2);
    } else if (step === 2) {
      sound.playSuccess();
      onComplete();
    }
  };

  // Calculations
  const activeCs = toolType === 'carbide' 
    ? CS_DATABASE[selectedMaterialIdx].csCarbide 
    : CS_DATABASE[selectedMaterialIdx].csHss;

  const calculatedRpm = Math.round((1000 * activeCs) / (Math.PI * Math.max(1, userDiameter)));
  const calculatedCuttingSpeed = ((Math.PI * Math.max(1, userDiameter) * userCalcRpm) / 1000).toFixed(1);
  
  const calculatedFeedRate = (userFeedRev * userCalcRpm).toFixed(1); // mm/menit
  const calculatedTimeMinutes = ((userLength + 2) / Math.max(1, (userFeedRev * userCalcRpm))).toFixed(2);
  const calculatedTimeSeconds = Math.round(Number(calculatedTimeMinutes) * 60);

  const taperDelta = Math.max(0, userBigD - userSmallD);
  const tanAlpha = taperDelta / (2 * Math.max(1, userTaperL));
  const alphaRad = Math.atan(tanAlpha);
  const alphaDegrees = (alphaRad * 180 / Math.PI).toFixed(2);

  const isLathe = machineName.toUpperCase().includes('BUBUT');

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(2, 6, 23, 0.95)', zIndex: 100,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(10px)', padding: '16px'
    }}>
      <div className="animate-fade-in" style={{
        maxWidth: '860px', width: '100%', maxHeight: '92vh', overflowY: 'auto',
        background: '#0f172a', borderRadius: '18px',
        border: '1px solid #38bdf8', padding: '28px',
        boxShadow: '0 0 40px rgba(2, 132, 199, 0.25)', display: 'flex', flexDirection: 'column',
        color: '#f8fafc', fontFamily: "'Segoe UI', Roboto, sans-serif"
      }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '6px' }}>
            TAHAP PERSIAPAN: {machineName}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0, fontFamily: "'Chakra Petch', sans-serif" }}>
            {step === 1 ? '🛡️ Keselamatan Kerja (K3) & APD Wajib' : '📐 Standard Operating Procedure (SOP) & Rumus Pemesinan'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            {step === 1 
              ? 'Pastikan seluruh APD terpasang sebelum memasuki area mesin bubut' 
              : 'Pahami SOP menghidupkan mesin, rumus putaran spindel, gerak makan, dan waktu pemesinan'}
          </p>
        </div>

        {/* STEP 1: APD CHECKLIST */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '4px', textAlign: 'center' }}>
              Klik kotak centang berikut untuk memverifikasi pemakaian Alat Pelindung Diri (APD):
            </p>

            {/* Checklist Items */}
            <div 
              onClick={() => handleCheck('glasses')}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                background: checks.glasses ? 'rgba(2, 132, 199, 0.15)' : '#1e293b',
                border: `2px solid ${checks.glasses ? '#38bdf8' : '#334155'}`,
                borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: `2px solid ${checks.glasses ? '#38bdf8' : '#64748b'}`,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                background: checks.glasses ? '#0284c7' : 'transparent',
                fontWeight: 900, color: '#ffffff'
              }}>
                {checks.glasses && '✓'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>👓 Kacamata Safety (Safety Glasses)</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Melindungi kornea mata dari loncatan tatal / beram besi panas yang melayang berkecepatan tinggi.</div>
              </div>
            </div>

            <div 
              onClick={() => handleCheck('shoes')}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                background: checks.shoes ? 'rgba(2, 132, 199, 0.15)' : '#1e293b',
                border: `2px solid ${checks.shoes ? '#38bdf8' : '#334155'}`,
                borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: `2px solid ${checks.shoes ? '#38bdf8' : '#64748b'}`,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                background: checks.shoes ? '#0284c7' : 'transparent',
                fontWeight: 900, color: '#ffffff'
              }}>
                {checks.shoes && '✓'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>🥾 Sepatu Safety (Safety Shoes Toecap Baja)</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Melindungi kaki dari benturan benda kerja silindris berat atau kunci chuck yang terjatuh dari meja mesin.</div>
              </div>
            </div>

            <div 
              onClick={() => handleCheck('wearpack')}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                background: checks.wearpack ? 'rgba(2, 132, 199, 0.15)' : '#1e293b',
                border: `2px solid ${checks.wearpack ? '#38bdf8' : '#334155'}`,
                borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: `2px solid ${checks.wearpack ? '#38bdf8' : '#64748b'}`,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                background: checks.wearpack ? '#0284c7' : 'transparent',
                fontWeight: 900, color: '#ffffff'
              }}>
                {checks.wearpack && '✓'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>👕 Pakaian Kerja Pas Badan (Wearpack)</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Wajib dikancing rapat di pergelangan tangan! DILARANG memakai dasi, lengan baju longgar, jam tangan, atau sarung tangan saat memegang spindel berputar!</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SOP & RUMUS BUBUT LENGKAP DENGAN KALKULATOR */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* SUB-TABS SELECTOR */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { sound.playClick(); setSopTab('formulas'); }}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: sopTab === 'formulas' ? '#0284c7' : '#1e293b',
                  color: sopTab === 'formulas' ? '#ffffff' : '#94a3b8',
                  fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
                }}
              >
                📐 Bank Rumus Pemesinan Bubut
              </button>

              <button
                onClick={() => { sound.playClick(); setSopTab('calculator'); }}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: sopTab === 'calculator' ? '#0284c7' : '#1e293b',
                  color: sopTab === 'calculator' ? '#ffffff' : '#94a3b8',
                  fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
                }}
              >
                🧮 Kalkulator Cepat Interaktif (Isi Sendiri)
              </button>

              <button
                onClick={() => { sound.playClick(); setSopTab('sop'); }}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: sopTab === 'sop' ? '#0284c7' : '#1e293b',
                  color: sopTab === 'sop' ? '#ffffff' : '#94a3b8',
                  fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
                }}
              >
                📋 SOP Operasi &amp; Menyalakan Mesin
              </button>
            </div>

            {/* SUB-TAB 1: BANK RUMUS PEMESINAN BUBUT */}
            {sopTab === 'formulas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #38bdf8' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                    1. Kecepatan Putar Spindel Mesin (n / RPM)
                  </div>
                  <div style={{ background: '#020617', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '1.2rem', color: '#facc15', textAlign: 'center', margin: '6px 0' }}>
                    n = (1000 × Cs) / (π × d)  [RPM]
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                    • <strong>Cs</strong> = Kecepatan potong bahan (m/menit)<br />
                    • <strong>d</strong> = Diameter benda kerja (mm)<br />
                    • <strong>π</strong> ≈ 3.1416 | Angka <strong>1000</strong> = Konversi meter ke milimeter
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {/* Rumus Kecepatan Pemakanan */}
                  <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399', marginBottom: '2px' }}>
                      2. Kecepatan Asutan / Pemakanan (F)
                    </div>
                    <div style={{ background: '#020617', padding: '6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.95rem', color: '#facc15', textAlign: 'center', margin: '4px 0' }}>
                      F = f × n  [mm/menit]
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      f = gerak makan per putaran (mm/put)<br />
                      n = putaran spindel (RPM)
                    </div>
                  </div>

                  {/* Rumus Waktu Pembubutan Rata */}
                  <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fbbf24', marginBottom: '2px' }}>
                      3. Waktu Pembubutan Memanjang (tm)
                    </div>
                    <div style={{ background: '#020617', padding: '6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.95rem', color: '#facc15', textAlign: 'center', margin: '4px 0' }}>
                      tm = L / (f × n)  [menit]
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      L = panjang penyayatan total (ℓ + ℓa awalan)<br />
                      F = f × n (kecepatan asutan)
                    </div>
                  </div>

                  {/* Rumus Waktu Pembubutan Muka (Facing) */}
                  <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #ec4899' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f472b6', marginBottom: '2px' }}>
                      4. Waktu Bubut Muka / Facing (tm)
                    </div>
                    <div style={{ background: '#020617', padding: '6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.95rem', color: '#facc15', textAlign: 'center', margin: '4px 0' }}>
                      tm = (d / 2) / (f × n)  [menit]
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Pahat menyayat sepanjang radius (setengah diameter) benda kerja.
                    </div>
                  </div>

                  {/* Rumus Kedalaman Pemakanan */}
                  <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#a78bfa', marginBottom: '2px' }}>
                      5. Kedalaman Sayat / Depth of Cut (a)
                    </div>
                    <div style={{ background: '#020617', padding: '6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.95rem', color: '#facc15', textAlign: 'center', margin: '4px 0' }}>
                      a = (d_awal - d_akhir) / 2  [mm]
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Dibagi dua karena pemakanan terjadi melingkar di sekeliling diameter.
                    </div>
                  </div>

                  {/* Rumus Sudut Tirus Eretan Atas */}
                  <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #06b6d4' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#22d3ee', marginBottom: '2px' }}>
                      6. Sudut Eretan Atas Bubut Tirus (α)
                    </div>
                    <div style={{ background: '#020617', padding: '6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.95rem', color: '#facc15', textAlign: 'center', margin: '4px 0' }}>
                      tan(α) = (D - d) / (2 × ℓ)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      D = Ø besar, d = Ø kecil, ℓ = panjang bidang tirus
                    </div>
                  </div>

                  {/* Penggeseran Kepala Lepas */}
                  <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #eab308' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fde047', marginBottom: '2px' }}>
                      7. Geser Kepala Lepas / Tailstock (x)
                    </div>
                    <div style={{ background: '#020617', padding: '6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.95rem', color: '#facc15', textAlign: 'center', margin: '4px 0' }}>
                      x = [(D - d) / (2 × ℓ)] × L_total  [mm]
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Untuk pembubutan tirus panjang di antara dua senter.
                    </div>
                  </div>
                </div>

                {/* Tabel Standar Cs */}
                <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>
                    📊 Tabel Referensi Standar Kecepatan Potong (Cs):
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.72rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                          <th style={{ padding: '4px 8px' }}>Jenis Material Benda</th>
                          <th style={{ padding: '4px 8px' }}>Pahat HSS (m/menit)</th>
                          <th style={{ padding: '4px 8px' }}>Pahat Karbida (m/menit)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CS_DATABASE.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '4px 8px', fontWeight: 700 }}>{item.material}</td>
                            <td style={{ padding: '4px 8px', color: '#38bdf8' }}>{item.csHss} m/min</td>
                            <td style={{ padding: '4px 8px', color: '#facc15' }}>{item.csCarbide} m/min</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: KALKULATOR INTERAKTIF CEPAT */}
            {sopTab === 'calculator' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'rpm', label: '1. Hitung RPM Spindel (n)' },
                    { id: 'feed-time', label: '2. Hitung Waktu Bubut (tm)' },
                    { id: 'taper', label: '3. Hitung Sudut Tirus (α)' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => { sound.playClick(); setCalcMode(mode.id); }}
                      style={{
                        padding: '6px 12px', borderRadius: '6px',
                        border: calcMode === mode.id ? '2px solid #38bdf8' : '1px solid #334155',
                        background: calcMode === mode.id ? '#0284c7' : '#1e293b',
                        color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* CALCULATOR 1: RPM */}
                {calcMode === 'rpm' && (
                  <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', border: '1px solid #38bdf8' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Pilih Material Benda Kerja:</label>
                        <select
                          value={selectedMaterialIdx}
                          onChange={(e) => setSelectedMaterialIdx(Number(e.target.value))}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.8rem' }}
                        >
                          {CS_DATABASE.map((m, idx) => (
                            <option key={idx} value={idx}>{m.material}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Pilih Jenis Pahat Bubut:</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <button
                            onClick={() => setToolType('hss')}
                            style={{
                              padding: '6px', borderRadius: '6px', border: toolType === 'hss' ? '2px solid #38bdf8' : '1px solid #334155',
                              background: toolType === 'hss' ? '#0369a1' : '#0f172a', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            HSS ({CS_DATABASE[selectedMaterialIdx].csHss} m/min)
                          </button>
                          <button
                            onClick={() => setToolType('carbide')}
                            style={{
                              padding: '6px', borderRadius: '6px', border: toolType === 'carbide' ? '2px solid #facc15' : '1px solid #334155',
                              background: toolType === 'carbide' ? '#a16207' : '#0f172a', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            Karbida ({CS_DATABASE[selectedMaterialIdx].csCarbide} m/min)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Diameter Benda Kerja (d in mm):</label>
                        <input
                          type="number"
                          value={userDiameter}
                          onChange={(e) => setUserDiameter(Math.max(1, Number(e.target.value)))}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem', fontWeight: 800 }}
                        />
                      </div>
                    </div>

                    {/* Output Card */}
                    <div style={{ background: '#020617', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                      <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>HASIL PUTARAN SPINDEL TEORITIS:</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#facc15', margin: '4px 0' }}>
                        {calculatedRpm} RPM
                      </div>
                      <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#cbd5e1' }}>
                        Langkah Hitung: n = (1000 × {activeCs}) / (3.1416 × {userDiameter}) = {calculatedRpm} RPM
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                        💡 <strong>Saran Bengkel:</strong> Pilih kecepatan tuas transmisi mesin bubut yang paling mendekati angka <strong>{calculatedRpm} RPM</strong> (misal 600 RPM atau 750 RPM).
                      </div>
                    </div>
                  </div>
                )}

                {/* CALCULATOR 2: FEED & TIME */}
                {calcMode === 'feed-time' && (
                  <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', border: '1px solid #10b981' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Panjang Pembubutan (L in mm):</label>
                        <input type="number" value={userLength} onChange={(e) => setUserLength(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem', fontWeight: 800 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Gerak Makan (f in mm/put):</label>
                        <input type="number" step="0.05" value={userFeedRev} onChange={(e) => setUserFeedRev(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem', fontWeight: 800 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Putaran Mesin Digunakan (n RPM):</label>
                        <input type="number" value={userCalcRpm} onChange={(e) => setUserCalcRpm(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem', fontWeight: 800 }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ background: '#020617', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                        <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 800 }}>KECEPATAN ASUTAN (F):</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>{calculatedFeedRate} mm/min</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>F = {userFeedRev} × {userCalcRpm}</div>
                      </div>

                      <div style={{ background: '#020617', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 800 }}>WAKTU PEMOTONGAN (tm):</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24' }}>{calculatedTimeMinutes} Menit ({calculatedTimeSeconds} detik)</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>tm = ({userLength} + 2) / ({calculatedFeedRate})</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CALCULATOR 3: TAPER */}
                {calcMode === 'taper' && (
                  <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', border: '1px solid #06b6d4' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Diameter Besar (D in mm):</label>
                        <input type="number" value={userBigD} onChange={(e) => setUserBigD(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem', fontWeight: 800 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Diameter Kecil (d in mm):</label>
                        <input type="number" value={userSmallD} onChange={(e) => setUserSmallD(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem', fontWeight: 800 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 700 }}>Panjang Tirus (ℓ in mm):</label>
                        <input type="number" value={userTaperL} onChange={(e) => setUserTaperL(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem', fontWeight: 800 }} />
                      </div>
                    </div>

                    <div style={{ background: '#020617', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #06b6d4' }}>
                      <div style={{ fontSize: '0.72rem', color: '#22d3ee', fontWeight: 800 }}>SUDUT PENGGESERAN ERETAN ATAS (α):</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#facc15', margin: '4px 0' }}>
                        α = {alphaDegrees}°
                      </div>
                      <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#cbd5e1' }}>
                        tan(α) = ({userBigD} - {userSmallD}) / (2 × {userTaperL}) = {tanAlpha.toFixed(4)} ➔ α = arctan({tanAlpha.toFixed(4)}) = {alphaDegrees}°
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                        💡 <strong>Langkah di Bengkel:</strong> Kendorkan 2 baut pengikat eretan atas (compound rest), putar skala derajat busur ke angka <strong>{alphaDegrees}°</strong>, lalu kencangkan kembali.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: SOP MENYALAKAN & OPERASI MESIN */}
            {sopTab === 'sop' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '16px', background: '#1e293b', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontWeight: 800, color: '#fbbf24', marginBottom: '8px', fontSize: '0.95rem' }}>
                    ⚡ 5 LANGKAH STANDAR OPERASIONAL MENYALAKAN MESIN BUBUT
                  </div>
                  <ol style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '1.6', paddingLeft: '20px', margin: 0 }}>
                    <li><strong>Lepas Kunci Cekam (Chuck Key):</strong> Pastikan kunci chuck TIDAK menancap di kepala tetap! Kunci chuck yang tertinggal bisa melesat membunuh saat spindel berputar.</li>
                    <li><strong>Posisikan Tuas Eretan Netral:</strong> Pastikan tuas otomatis (feed lever) dan tuas ulir dalam posisi bebas/netral.</li>
                    <li><strong>Atur Tuas Kecepatan RPM:</strong> Sesuaikan posisi handel transmisi sabuk/gir berdasarkan perhitungan rumus <em>n = (1000 × Cs)/(π × d)</em> saat spindel dalam keadaan DIAM.</li>
                    <li><strong>Nyalakan Saklar Utama (Main Breaker):</strong> Naikkan saklar power ke posisi ON dan bebaskan tombol Emergency Stop dengan memutarnya searah jarum jam.</li>
                    <li><strong>Nyalakan Spindel &amp; Alirkan Coolant:</strong> Tekan tuas saklar putaran ke bawah (putar kanan/searah jarum jam) dan arahkan pipa pendingin dromus tepat ke ujung mata pahat.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM ACTION BUTTON */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <button 
            style={{
              padding: '14px 32px', fontSize: '1rem', width: '100%',
              borderRadius: '10px', border: 'none', fontWeight: 900,
              cursor: (!allChecked && step === 1) ? 'not-allowed' : 'pointer',
              background: (allChecked || step === 2) 
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                : '#334155',
              color: '#ffffff',
              boxShadow: (allChecked || step === 2) ? '0 4px 14px rgba(2, 132, 199, 0.4)' : 'none',
              opacity: (!allChecked && step === 1) ? 0.5 : 1
            }}
            onClick={handleNext}
            disabled={!allChecked && step === 1}
          >
            {step === 1 ? 'LANJUT KE SOP & RUMUS BUBUT ▶' : '✅ SAYA SUDAH PAHAM RUMUS & SIAP MENGOPERASIKAN MESIN ▶'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PreparationModal;

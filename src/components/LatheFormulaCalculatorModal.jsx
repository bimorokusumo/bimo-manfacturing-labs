import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';

// Database Kecepatan Potong Standar (Cutting Speed Cs) untuk Mesin Bubut
export const CS_DATABASE = [
  { material: 'Baja Lunak (St 37 / Mild Steel)', csHss: 25, csCarbide: 150, desc: 'Baja konstruksi umum, ulet dan mudah disayat' },
  { material: 'Baja Karbon Sedang (St 45 / S45C)', csHss: 20, csCarbide: 120, desc: 'Baja poros as dan roda gigi, butuh pendinginan cukup' },
  { material: 'Aluminium & Paduannya', csHss: 75, csCarbide: 300, desc: 'Logam lunak non-ferro, sayatan cepat dan halus' },
  { material: 'Besi Tuang / Cor (Cast Iron)', csHss: 18, csCarbide: 100, desc: 'Getas, tatal serbuk, umumnya dibubut kering tanpa coolant' },
  { material: 'Kuningan / Tembaga (Brass/Bronze)', csHss: 40, csCarbide: 200, desc: 'Logam lunak konduktif, tatal patah-patah pendek' }
];

// Standar Kecepatan Spindel Mesin Bubut Konvensional (Gearbox Steps)
export const STANDARD_GEAR_RPMS = [45, 70, 110, 150, 220, 300, 450, 600, 750, 900, 1200, 1500, 2000];

const LatheFormulaCalculatorModal = ({
  isOpen,
  onClose,
  initialDiameter = 50,
  initialLength = 100,
  currentRpm = 600,
  onApplyRpm,
  materialName = ''
}) => {
  const [activeTab, setActiveTab] = useState('rpm'); // 'rpm' | 'feed-time' | 'taper' | 'doc' | 'bank'
  const [appliedNotice, setAppliedNotice] = useState(null);

  // Tab 1: RPM & Cutting Speed State
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0);
  const [toolType, setToolType] = useState('carbide'); // 'hss' | 'carbide'
  const [calcDiameter, setCalcDiameter] = useState(initialDiameter);
  const [customCs, setCustomCs] = useState(null); // if user overrides Cs

  // Tab 2: Feeding & Time State
  const [feedMode, setFeedMode] = useState('turning'); // 'turning' | 'facing'
  const [calcLength, setCalcLength] = useState(initialLength);
  const [calcFeedRev, setCalcFeedRev] = useState(0.15); // mm/putaran (f)
  const [calcSpindleRpm, setCalcSpindleRpm] = useState(currentRpm);
  const [safetyDist, setSafetyDist] = useState(2); // mm (la)

  // Tab 3: Taper Turning State
  const [bigD, setBigD] = useState(initialDiameter);
  const [smallD, setSmallD] = useState(Math.max(10, initialDiameter - 10));
  const [taperL, setTaperL] = useState(40);
  const [totalWorkLength, setTotalWorkLength] = useState(initialLength);

  // Tab 4: Depth of Cut State
  const [docRawD, setDocRawD] = useState(initialDiameter);
  const [docTargetD, setDocTargetD] = useState(Math.max(10, initialDiameter - 6));
  const [passesCount, setPassesCount] = useState(2);

  // Match initial material name if provided
  useEffect(() => {
    if (materialName) {
      const idx = CS_DATABASE.findIndex(m => 
        m.material.toLowerCase().includes(materialName.toLowerCase()) ||
        materialName.toLowerCase().includes(m.material.toLowerCase().split(' ')[0])
      );
      if (idx !== -1) setSelectedMaterialIdx(idx);
    }
  }, [materialName]);

  // Sync initialDiameter if it changes
  useEffect(() => {
    if (initialDiameter) {
      setCalcDiameter(initialDiameter);
      setBigD(initialDiameter);
      setDocRawD(initialDiameter);
      setDocTargetD(Math.max(5, initialDiameter - 6));
    }
  }, [initialDiameter]);

  useEffect(() => {
    if (initialLength) {
      setCalcLength(initialLength);
      setTotalWorkLength(initialLength);
    }
  }, [initialLength]);

  useEffect(() => {
    if (currentRpm) {
      setCalcSpindleRpm(currentRpm);
    }
  }, [currentRpm]);

  if (!isOpen) return null;

  // Active Cs value
  const presetCs = toolType === 'carbide'
    ? CS_DATABASE[selectedMaterialIdx].csCarbide
    : CS_DATABASE[selectedMaterialIdx].csHss;
  const effectiveCs = customCs !== null ? customCs : presetCs;

  // 1. RPM Calculations
  const validD = Math.max(0.1, Number(calcDiameter) || 1);
  const theoreticalRpmExact = (1000 * effectiveCs) / (Math.PI * validD);
  const theoreticalRpm = Math.round(theoreticalRpmExact);

  // Find nearest standard machine gearbox RPM
  const nearestStandardRpm = STANDARD_GEAR_RPMS.reduce((prev, curr) =>
    Math.abs(curr - theoreticalRpm) < Math.abs(prev - theoreticalRpm) ? curr : prev
  );

  // 2. Feed & Machining Time Calculations
  const validF = Math.max(0.01, Number(calcFeedRev) || 0.1);
  const validRpmForTime = Math.max(1, Number(calcSpindleRpm) || 100);
  const feedSpeedF = (validF * validRpmForTime).toFixed(1); // mm/menit
  
  // Total cut length L_total = L + safetyDist (facing uses D/2)
  const cutDistance = feedMode === 'facing' ? (validD / 2) + Number(safetyDist) : Number(calcLength) + Number(safetyDist);
  const machiningTimeMin = (cutDistance / (validF * validRpmForTime));
  const machiningTimeSecTotal = Math.round(machiningTimeMin * 60);
  const timeMinutesDisplay = Math.floor(machiningTimeSecTotal / 60);
  const timeSecondsDisplay = machiningTimeSecTotal % 60;

  // 3. Taper Calculations
  const validBigD = Number(bigD) || 0;
  const validSmallD = Number(smallD) || 0;
  const validTaperL = Math.max(0.1, Number(taperL) || 1);
  const validTotalL = Math.max(validTaperL, Number(totalWorkLength) || validTaperL);
  
  const dDiff = Math.max(0, validBigD - validSmallD);
  const tanAlpha = dDiff / (2 * validTaperL);
  const alphaRad = Math.atan(tanAlpha);
  const alphaDeg = (alphaRad * 180 / Math.PI);
  const alphaDegFixed = alphaDeg.toFixed(2);
  const alphaDegInt = Math.floor(alphaDeg);
  const alphaMinInt = Math.round((alphaDeg - alphaDegInt) * 60);

  // Tailstock offset: x = ((D - d) / (2 * l)) * L
  const tailstockOffset = (tanAlpha * validTotalL).toFixed(2);

  // 4. Depth of Cut Calculations
  const validRawD = Number(docRawD) || 0;
  const validTargetD = Number(docTargetD) || 0;
  const validPasses = Math.max(1, parseInt(passesCount) || 1);
  const totalDoc = Math.max(0, (validRawD - validTargetD) / 2);
  const docPerPass = (totalDoc / validPasses).toFixed(2);

  // Apply RPM Handler
  const handleApplySpindleRpm = (rpmValue) => {
    sound.playSuccess();
    if (onApplyRpm) {
      onApplyRpm(rpmValue);
    }
    setAppliedNotice(`Spindel diatur ke ${rpmValue} RPM!`);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div className="animate-fade-in" style={{
        background: '#0f172a',
        border: '1px solid #38bdf8',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '920px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.25)',
        color: '#f8fafc',
        overflow: 'hidden'
      }}>
        
        {/* MODAL HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: 'rgba(30, 41, 59, 0.8)',
          borderBottom: '1px solid #1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.6rem' }}>🧮</span>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '0.5px' }}>
                RUMUS & KALKULATOR TEKNIK PEMESINAN BUBUT
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Hitung Parameter Pemotongan Sesuai Standar ISO & Terapkan Langsung ke Mesin
              </div>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#cbd5e1',
              padding: '6px 12px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: 700,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
          >
            ✕ Tutup
          </button>
        </div>

        {/* NOTIFICATION TOAST */}
        {appliedNotice && (
          <div style={{
            background: '#10b981',
            color: '#022c22',
            padding: '10px 20px',
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
          }}>
            <span>⚡</span> {appliedNotice}
          </div>
        )}

        {/* TABS NAVIGATION */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '12px 24px',
          background: '#040914',
          borderBottom: '1px solid #1e293b',
          overflowX: 'auto'
        }}>
          {[
            { id: 'rpm', label: '1. RPM & Kecepatan Potong (n, Cs)', icon: '⚡' },
            { id: 'feed-time', label: '2. Pemakanan & Waktu (F, tm)', icon: '⏱️' },
            { id: 'taper', label: '3. Pembubutan Tirus (tan α, x)', icon: '📐' },
            { id: 'doc', label: '4. Kedalaman Sayat (a)', icon: '📏' },
            { id: 'bank', label: '📚 Bank Rumus Lengkap & Tabel Cs', icon: '📖' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { sound.playClick(); setActiveTab(tab.id); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                border: activeTab === tab.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB BODY */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>

          {/* TAB 1: RPM & CUTTING SPEED */}
          {activeTab === 'rpm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Formula banner */}
              <div style={{
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '1px' }}>
                    RUMUS KECEPATAN PUTARAN SPINDEL (n)
                  </div>
                  <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    n = (1000 × C_s) / (π × d)  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>[RPM atau putaran/menit]</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5, maxWidth: '380px' }}>
                  <strong>Keterangan:</strong><br />
                  • <strong>n</strong>: Putaran spindel (RPM)<br />
                  • <strong>C_s</strong> / <strong>V_c</strong>: Kecepatan potong bahan (m/menit)<br />
                  • <strong>d</strong>: Diameter benda kerja (mm)<br />
                  • <strong>1000</strong>: Konversi satuan dari meter ke milimeter
                </div>
              </div>

              {/* Grid: Inputs vs Calculation Result */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
                
                {/* Inputs Column */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                    INPUT NILAI PARAMETER
                  </div>

                  {/* Material Preset */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                      Pilih Material Benda Kerja:
                    </label>
                    <select
                      value={selectedMaterialIdx}
                      onChange={(e) => {
                        setSelectedMaterialIdx(Number(e.target.value));
                        setCustomCs(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#040914',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                    >
                      {CS_DATABASE.map((mat, idx) => (
                        <option key={idx} value={idx}>
                          {mat.material}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                      {CS_DATABASE[selectedMaterialIdx].desc}
                    </div>
                  </div>

                  {/* Tool Material (HSS vs Carbide) */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                      Jenis Pahat Bubut (Cutting Tool):
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => { sound.playClick(); setToolType('hss'); setCustomCs(null); }}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: toolType === 'hss' ? '1px solid #f59e0b' : '1px solid #334155',
                          background: toolType === 'hss' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.02)',
                          color: toolType === 'hss' ? '#fbbf24' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        HSS (High Speed Steel)<br />
                        <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>Cs: {CS_DATABASE[selectedMaterialIdx].csHss} m/min</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { sound.playClick(); setToolType('carbide'); setCustomCs(null); }}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: toolType === 'carbide' ? '1px solid #10b981' : '1px solid #334155',
                          background: toolType === 'carbide' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.02)',
                          color: toolType === 'carbide' ? '#34d399' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Karbida / Insert (Carbide)<br />
                        <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>Cs: {CS_DATABASE[selectedMaterialIdx].csCarbide} m/min</span>
                      </button>
                    </div>
                  </div>

                  {/* Diameter (d) & Custom Cs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Diameter Benda Kerja (d):
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          min="1"
                          max="300"
                          value={calcDiameter}
                          onChange={(e) => setCalcDiameter(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 36px 8px 10px',
                            background: '#040914',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#38bdf8',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Kecepatan Potong (Cs):
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={effectiveCs}
                          onChange={(e) => setCustomCs(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px 46px 8px 10px',
                            background: '#040914',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#10b981',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '8px', top: '9px', fontSize: '0.7rem', color: '#64748b' }}>m/min</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Diameter Presets */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Shortcut Diameter:</span>
                    {[20, 25, 30, 40, 50, 60].map(dVal => (
                      <button
                        key={dVal}
                        type="button"
                        onClick={() => setCalcDiameter(dVal)}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          background: calcDiameter === dVal ? '#0284c7' : '#1e293b',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Ø{dVal}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Calculation Output Column */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                      HASIL PERHITUNGAN MATEMATIS
                    </div>

                    {/* Step-by-step substitution */}
                    <div style={{
                      background: '#040914',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #1e293b',
                      marginTop: '10px',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      lineHeight: 1.6,
                      color: '#cbd5e1'
                    }}>
                      <div>n = (1000 × C_s) / (π × d)</div>
                      <div style={{ color: '#94a3b8' }}>
                        n = (1000 × <strong style={{ color: '#10b981' }}>{effectiveCs}</strong>) / (3.1416 × <strong style={{ color: '#38bdf8' }}>{validD}</strong>)
                      </div>
                      <div style={{ color: '#94a3b8' }}>
                        n = {1000 * effectiveCs} / {(Math.PI * validD).toFixed(2)}
                      </div>
                      <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.95rem', marginTop: '4px' }}>
                        = {theoreticalRpmExact.toFixed(2)} RPM (Teoritis)
                      </div>
                    </div>

                    {/* Prominent result cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                      <div style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid #0284c7',
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>RPM TEORITIS</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                          {theoreticalRpm}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>RPM Pembulatan</div>
                      </div>

                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid #10b981',
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>STANDAR GEARBOX MESIN</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
                          {nearestStandardRpm}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Tingkat Roda Gigi Terdekat</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '8px', lineHeight: 1.4 }}>
                      💡 <strong>Catatan Bengkel:</strong> Karena mesin bubut konvensional menggunakan tuas transmisi bertingkat (gearbox), operator memilih putaran standar terdekat yaitu <strong>{nearestStandardRpm} RPM</strong>.
                    </div>
                  </div>

                  {/* Action Buttons to apply to lathe */}
                  {onApplyRpm && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      <button
                        onClick={() => handleApplySpindleRpm(nearestStandardRpm)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <span>⚡</span>
                        <span>TERAPKAN GEARBOX ({nearestStandardRpm} RPM) KE MESIN</span>
                      </button>

                      <button
                        onClick={() => handleApplySpindleRpm(theoreticalRpm)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          background: 'rgba(2, 132, 199, 0.15)',
                          color: '#38bdf8',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Terapkan Nilai Eksak Teoritis ({theoreticalRpm} RPM)
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: FEEDING & MACHINING TIME */}
          {activeTab === 'feed-time' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Formula banner */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '16px',
                borderRadius: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', letterSpacing: '1px' }}>
                    1. KECEPATAN PEMAKANAN (F)
                  </div>
                  <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    F = f × n  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>[mm/menit]</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    f = feeding gerak per putaran (mm/putaran), n = RPM spindel
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '1px' }}>
                    2. WAKTU PEMESINAN BUBUT (tm)
                  </div>
                  <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    t_m = L_total / F = L_total / (f × n)  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>[menit]</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    Bubut Rata: L_total = L + la (jarak awalan pahat ~2mm)<br />
                    Bubut Muka: L_total = d/2 + la
                  </div>
                </div>
              </div>

              {/* Interactive Calculation Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
                
                {/* Inputs */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                    PILIHAN JENIS OPERASI & PARAMETER
                  </div>

                  {/* Operation Mode */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                      Pilih Operasi Pembubutan:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => { sound.playClick(); setFeedMode('turning'); }}
                        style={{
                          padding: '10px',
                          borderRadius: '6px',
                          border: feedMode === 'turning' ? '1px solid #38bdf8' : '1px solid #334155',
                          background: feedMode === 'turning' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.02)',
                          color: feedMode === 'turning' ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Bubut Memanjang (Turning)<br />
                        <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>L = Panjang Poros</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { sound.playClick(); setFeedMode('facing'); }}
                        style={{
                          padding: '10px',
                          borderRadius: '6px',
                          border: feedMode === 'facing' ? '1px solid #f59e0b' : '1px solid #334155',
                          background: feedMode === 'facing' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.02)',
                          color: feedMode === 'facing' ? '#f59e0b' : '#94a3b8',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Bubut Muka (Facing)<br />
                        <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>L = d/2 (Jari-jari Poros)</span>
                      </button>
                    </div>
                  </div>

                  {/* Input parameters */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Feeding per Putaran (f):
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0.02"
                          max="1.5"
                          value={calcFeedRev}
                          onChange={(e) => setCalcFeedRev(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 56px 8px 10px',
                            background: '#040914',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#38bdf8',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '8px', top: '9px', fontSize: '0.7rem', color: '#64748b' }}>mm/put</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        RPM Spindel (n):
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          min="10"
                          max="5000"
                          value={calcSpindleRpm}
                          onChange={(e) => setCalcSpindleRpm(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 40px 8px 10px',
                            background: '#040914',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#10b981',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '8px', top: '9px', fontSize: '0.75rem', color: '#64748b' }}>RPM</span>
                      </div>
                    </div>
                  </div>

                  {/* Length or Diameter depending on mode */}
                  {feedMode === 'turning' ? (
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Panjang Pemotongan Poros (L):
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={calcLength}
                          onChange={(e) => setCalcLength(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 36px 8px 10px',
                            background: '#040914',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#e2e8f0',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Diameter Poros yang di-Facing (d):
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={calcDiameter}
                          onChange={(e) => setCalcDiameter(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 36px 8px 10px',
                            background: '#040914',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#e2e8f0',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                        Panjang lintasan facing = d / 2 = {(validD / 2).toFixed(1)} mm
                      </div>
                    </div>
                  )}

                  {/* Safety Distance la */}
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Jarak Bebas Awalan Sayatan (la):
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={safetyDist}
                        onChange={(e) => setSafetyDist(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 36px 6px 10px',
                          background: '#040914',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          color: '#e2e8f0',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box'
                        }}
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
                    </div>
                  </div>

                </div>

                {/* Outputs */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                      HASIL PERHITUNGAN WAKTU
                    </div>

                    <div style={{
                      background: '#040914',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #1e293b',
                      marginTop: '10px',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      lineHeight: 1.6,
                      color: '#cbd5e1'
                    }}>
                      <div>F = f × n = {validF} × {validRpmForTime} = <strong style={{ color: '#38bdf8' }}>{feedSpeedF} mm/menit</strong></div>
                      <div>L_total = {cutDistance.toFixed(1)} mm</div>
                      <div style={{ color: '#94a3b8' }}>t_m = L_total / F = {cutDistance.toFixed(1)} / {feedSpeedF}</div>
                      <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.95rem', marginTop: '4px' }}>
                        = {machiningTimeMin.toFixed(2)} Menit
                      </div>
                    </div>

                    {/* Big Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                      <div style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid #0284c7',
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>KECEPATAN MAKAN (F)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                          {feedSpeedF}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>mm / menit</div>
                      </div>

                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid #10b981',
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>WAKTU PEMESINAN (tm)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
                          {timeMinutesDisplay > 0 ? `${timeMinutesDisplay}m ${timeSecondsDisplay}s` : `${timeSecondsDisplay} dtk`}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>({machiningTimeMin.toFixed(2)} menit)</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    lineHeight: 1.4
                  }}>
                    ⏱️ <strong>Tips Efisiensi:</strong> Jika waktu pemesinan terlalu lama, tingkatkan RPM (sesuai batas Cs material) atau tingkatkan feeding (f) pada tahap pembubutan kasar (roughing).
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: TAPER TURNING */}
          {activeTab === 'taper' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Formula banner */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '16px',
                borderRadius: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '1px' }}>
                    1. METODE ERETAN ATAS (COMPOUND SLIDE)
                  </div>
                  <div style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    tan α = (D - d) / (2 × ℓ)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    α = Sudut pergeseran eretan atas (derajat °). Digunakan untuk tirus pendek bersudut curam/sedang.
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '1px' }}>
                    2. METODE PERGESERAN KEPALA LEPAS (OFFSET TAILSTOCK)
                  </div>
                  <div style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    x = ((D - d) / (2 × ℓ)) × L
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    x = Nilai geser tailstock (mm), L = Panjang keseluruhan poros. Cocok untuk tirus panjang dengan sudut kecil (&lt; 8°).
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
                
                {/* Inputs */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                    INPUT DIMENSI BAGIAN TIRUS
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Diameter Besar (D):
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={bigD}
                          onChange={(e) => setBigD(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 36px 8px 10px',
                            background: '#040914',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#f59e0b',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Diameter Kecil (d):
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={smallD}
                          onChange={(e) => setSmallD(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 36px 8px 10px',
                            background: '#040914',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#38bdf8',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Panjang Bidang Tirus (ℓ):
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={taperL}
                          onChange={(e) => setTaperL(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 36px 8px 10px',
                            background: '#040914',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#10b981',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Panjang Total Benda (L):
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={totalWorkLength}
                          onChange={(e) => setTotalWorkLength(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 36px 8px 10px',
                            background: '#040914',
                            border: '1px solid #334155',
                            borderRadius: '6px',
                            color: '#cbd5e1',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                    ℹ️ <em>Selisih diameter (D - d) = {dDiff.toFixed(2)} mm. Nilai 2ℓ = {(2 * validTaperL).toFixed(2)} mm.</em>
                  </div>

                </div>

                {/* Outputs */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                      HASIL SETTING MESIN BUBUT
                    </div>

                    {/* Step-by-step substitution */}
                    <div style={{
                      background: '#040914',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #1e293b',
                      marginTop: '10px',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      lineHeight: 1.6,
                      color: '#cbd5e1'
                    }}>
                      <div>tan α = ({validBigD} - {validSmallD}) / (2 × {validTaperL})</div>
                      <div>tan α = {dDiff.toFixed(2)} / {(2 * validTaperL).toFixed(2)} = <strong style={{ color: '#f59e0b' }}>{tanAlpha.toFixed(4)}</strong></div>
                      <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.95rem', marginTop: '4px' }}>
                        α = arctan({tanAlpha.toFixed(4)}) = {alphaDegFixed}° ({alphaDegInt}° {alphaMinInt}')
                      </div>
                    </div>

                    {/* Result Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid #f59e0b',
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>PUTAR ERETAN ATAS</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>
                          {alphaDegFixed}°
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>{alphaDegInt}° {alphaMinInt} menit busur</div>
                      </div>

                      <div style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid #0284c7',
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>GESER KEPALA LEPAS (x)</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                          {tailstockOffset}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>mm ke arah operator</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    lineHeight: 1.4
                  }}>
                    📐 <strong>Instruksi Praktik:</strong> Kendorkan 2 baut pengikat eretan atas pada pelat skala derajat, lalu putar sejauh <strong>{alphaDegFixed}°</strong> dan kencangkan kembali secara merata sebelum menyayat secara manual.
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: DEPTH OF CUT (a) */}
          {activeTab === 'doc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Formula banner */}
              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c084fc', letterSpacing: '1px' }}>
                    RUMUS KEDALAMAN PEMAKANAN / TEBAL PENYAYATAN (a)
                  </div>
                  <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                    a = (D - d) / 2  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>[mm per sisi pemotongan]</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    Jika penyayatan dilakukan dalam <em>i</em> langkah: a_pass = (D - d) / (2 × i)
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5, maxWidth: '360px' }}>
                  <strong>Prinsip Nonius Eretan Melintang:</strong><br />
                  Sumbu spindel membubut kedua sisi secara simetris, sehingga pengurangan diameter adalah 2 kali tebal pemakanan (Δd = 2a).
                </div>
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px' }}>
                
                {/* Inputs */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                    INPUT PENGURANGAN DIAMETER
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Diameter Awal / Mentah (D):
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={docRawD}
                        onChange={(e) => setDocRawD(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 36px 8px 10px',
                          background: '#040914',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          color: '#e2e8f0',
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          boxSizing: 'border-box'
                        }}
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Diameter Akhir yang Diinginkan (d):
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={docTargetD}
                        onChange={(e) => setDocTargetD(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 36px 8px 10px',
                          background: '#040914',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          color: '#38bdf8',
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          boxSizing: 'border-box'
                        }}
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '9px', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Rencana Jumlah Langkah Penyayatan (i):
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {[1, 2, 3, 4].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPassesCount(p)}
                          style={{
                            padding: '8px',
                            borderRadius: '6px',
                            border: passesCount === p ? '1px solid #c084fc' : '1px solid #334155',
                            background: passesCount === p ? 'rgba(168, 85, 247, 0.25)' : '#040914',
                            color: passesCount === p ? '#c084fc' : '#94a3b8',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {p} Langkah
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Outputs */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c084fc', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                      HASIL SETTING KEDALAMAN (IN-FEED)
                    </div>

                    <div style={{
                      background: '#040914',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #1e293b',
                      marginTop: '10px',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      lineHeight: 1.6,
                      color: '#cbd5e1'
                    }}>
                      <div>Total Pengurangan Diameter = {validRawD} - {validTargetD} = <strong style={{ color: '#38bdf8' }}>{(validRawD - validTargetD).toFixed(2)} mm</strong></div>
                      <div>Total Tebal Pemakanan (a_tot) = {(validRawD - validTargetD).toFixed(2)} / 2 = <strong style={{ color: '#c084fc' }}>{totalDoc.toFixed(2)} mm</strong></div>
                      <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.95rem', marginTop: '4px' }}>
                        In-Feed per Langkah (a_pass) = {totalDoc.toFixed(2)} / {validPasses} = {docPerPass} mm
                      </div>
                    </div>

                    {/* Result Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                      <div style={{
                        background: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid #a855f7',
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>TEBAL TOTAL (a_tot)</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#c084fc', fontFamily: 'monospace' }}>
                          {totalDoc.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>mm tebal pahat masuk</div>
                      </div>

                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid #10b981',
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>IN-FEED PER SAYATAN</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
                          {docPerPass}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>mm per langkah penyayatan</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    lineHeight: 1.4
                  }}>
                    ⚠️ <strong>Standar Keselamatan:</strong> Jangan menyayat melebihi 2.0 mm per langkah pada mesin bubut latih untuk menghindari patahnya pahat atau benda kerja terlempar dari cekam!
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 5: BANK RUMUS & TABEL CS LENGKAP */}
          {activeTab === 'bank' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Formula Table List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  {
                    title: '1. Kecepatan Putaran Spindel (n)',
                    formula: 'n = (1000 × C_s) / (π × d)',
                    unit: 'RPM (putaran/menit)',
                    desc: 'Menghitung kecepatan putar spindel berdasarkan cutting speed material dan diameter benda kerja.'
                  },
                  {
                    title: '2. Kecepatan Potong Aktual (C_s / V_c)',
                    formula: 'C_s = (π × d × n) / 1000',
                    unit: 'm/menit',
                    desc: 'Kecepatan keliling benda kerja menyayat ujung mata pahat.'
                  },
                  {
                    title: '3. Kecepatan Pemakanan / Asutan (F)',
                    formula: 'F = f × n',
                    unit: 'mm/menit',
                    desc: 'Jarak pergeseran pahat secara longitudinal per satuan menit.'
                  },
                  {
                    title: '4. Waktu Pemesinan Bubut Rata (t_m)',
                    formula: 't_m = (L + l_a) / (f × n)',
                    unit: 'menit',
                    desc: 'Waktu yang diperlukan untuk menyelesaikan 1 lintasan penyayatan memanjang.'
                  },
                  {
                    title: '5. Waktu Pemesinan Bubut Muka (t_m Facing)',
                    formula: 't_m = (d/2 + l_a) / (f × n)',
                    unit: 'menit',
                    desc: 'Waktu penyayatan permukaan ujung (facing) dari diameter luar menuju titik tengah senter.'
                  },
                  {
                    title: '6. Kedalaman Pemakanan (a)',
                    formula: 'a = (D - d) / 2',
                    unit: 'mm per sisi potong',
                    desc: 'Tebal lapisan permukaan logam yang dipotong pahat masuk ke dalam benda kerja.'
                  },
                  {
                    title: '7. Sudut Pembubutan Tirus (tan α)',
                    formula: 'tan α = (D - d) / (2 × ℓ)',
                    unit: 'derajat (°)',
                    desc: 'Sudut kemiringan eretan atas (compound slide) untuk membentuk profil tirus.'
                  },
                  {
                    title: '8. Pergeseran Kepala Lepas Tirus (x)',
                    formula: 'x = ((D - d) / (2 × ℓ)) × L',
                    unit: 'mm',
                    desc: 'Jarak pergeseran senter putar tailstock melintang untuk tirus panjang dengan sudut kecil.'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '14px'
                  }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>{item.title}</div>
                    <div style={{
                      background: '#040914',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #1e293b',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: '#10b981',
                      margin: '8px 0'
                    }}>
                      {item.formula}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.4 }}>{item.desc}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>Satuan: <strong>{item.unit}</strong></div>
                  </div>
                ))}
              </div>

              {/* Cutting Speed Reference Table */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', marginBottom: '10px' }}>
                  📊 TABEL STANDAR KECEPATAN POTONG (CUTTING SPEED Cs) MESIN BUBUT
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', color: '#cbd5e1' }}>
                    <thead>
                      <tr style={{ background: '#040914', borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px' }}>Jenis Material Benda Kerja</th>
                        <th style={{ padding: '8px 12px', color: '#fbbf24' }}>Pahat HSS (m/menit)</th>
                        <th style={{ padding: '8px 12px', color: '#34d399' }}>Pahat Karbida / Insert (m/menit)</th>
                        <th style={{ padding: '8px 12px' }}>Karakteristik Tatal & Pelumasan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CS_DATABASE.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #1e293b', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#f8fafc' }}>{row.material}</td>
                          <td style={{ padding: '10px 12px', color: '#fbbf24', fontFamily: 'monospace', fontWeight: 800 }}>{row.csHss}</td>
                          <td style={{ padding: '10px 12px', color: '#34d399', fontFamily: 'monospace', fontWeight: 800 }}>{row.csCarbide}</td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          background: 'rgba(30, 41, 59, 0.8)',
          borderTop: '1px solid #1e293b'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Teknik Pemesinan Bubut SMK / Vokasi • Standar ISO 3685 & DIN 6580
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Tutup & Lanjutkan Praktik
          </button>
        </div>

      </div>
    </div>
  );
};

export default LatheFormulaCalculatorModal;

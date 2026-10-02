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

const LatheFormulaView = ({
  initialDiameter = 50,
  initialLength = 100,
  currentRpm = 600,
  materialName = '',
  onApplyRpm,
  onGoToCutting
}) => {
  const [activeTab, setActiveTab] = useState('rpm'); // 'rpm' | 'feed-time' | 'taper' | 'doc' | 'bank'
  const [appliedNotice, setAppliedNotice] = useState(null);

  // Tab 1: RPM & Cutting Speed State
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0);
  const [toolType, setToolType] = useState('carbide'); // 'hss' | 'carbide'
  const [calcDiameter, setCalcDiameter] = useState(initialDiameter);
  const [customCs, setCustomCs] = useState(null);

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

  // Calculations
  const presetCs = toolType === 'carbide'
    ? CS_DATABASE[selectedMaterialIdx].csCarbide
    : CS_DATABASE[selectedMaterialIdx].csHss;
  const effectiveCs = customCs !== null ? customCs : presetCs;

  // 1. RPM Calculations
  const validD = Math.max(0.1, Number(calcDiameter) || 1);
  const theoreticalRpmExact = (1000 * effectiveCs) / (Math.PI * validD);
  const theoreticalRpm = Math.round(theoreticalRpmExact);

  const nearestStandardRpm = STANDARD_GEAR_RPMS.reduce((prev, curr) =>
    Math.abs(curr - theoreticalRpm) < Math.abs(prev - theoreticalRpm) ? curr : prev
  );

  // 2. Feed & Machining Time Calculations
  const validF = Math.max(0.01, Number(calcFeedRev) || 0.1);
  const validRpmForTime = Math.max(1, Number(calcSpindleRpm) || 100);
  const feedSpeedF = (validF * validRpmForTime).toFixed(1); // mm/menit
  
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
  const tailstockOffset = (tanAlpha * validTotalL).toFixed(2);

  // 4. Depth of Cut Calculations
  const validRawD = Number(docRawD) || 0;
  const validTargetD = Number(docTargetD) || 0;
  const validPasses = Math.max(1, parseInt(passesCount) || 1);
  const totalDoc = Math.max(0, (validRawD - validTargetD) / 2);
  const docPerPass = (totalDoc / validPasses).toFixed(2);

  const handleApplySpindleRpm = (rpmValue) => {
    sound.playSuccess();
    if (onApplyRpm) onApplyRpm(rpmValue);
    setAppliedNotice(`Spindel mesin berhasil disinkronkan ke ${rpmValue} RPM!`);
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1100px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        border: '1px solid #38bdf8',
        borderRadius: '16px',
        padding: '24px 28px',
        boxShadow: '0 10px 30px rgba(2, 132, 199, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.35)'
          }}>
            📐
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#ffffff', letterSpacing: '0.5px' }}>
              RUMUS & KALKULATOR TEKNIK PEMESINAN BUBUT
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              Hitung parameter pemotongan bubut berstandar ISO (RPM Spindel, Kecepatan Pemakanan, Waktu Pemotongan, dan Sudut Tirus)
            </p>
          </div>
        </div>

        {onGoToCutting && (
          <button
            onClick={() => { sound.playClick(); onGoToCutting(); }}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <span>⚙️ Menuju Proses Pemotongan</span> →
          </button>
        )}
      </div>

      {appliedNotice && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          color: '#6ee7b7',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✅</span> {appliedNotice}
        </div>
      )}

      {/* SUB-TABS */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        background: '#0b1120',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid #1e293b'
      }}>
        {[
          { id: 'rpm', label: '1. Putaran Spindel (n / RPM)', icon: '🔄' },
          { id: 'feed-time', label: '2. Gerak Makan & Waktu (Tc)', icon: '⏱️' },
          { id: 'taper', label: '3. Pembubutan Tirus (Taper)', icon: '📐' },
          { id: 'doc', label: '4. Tebal Pemakanan (Depth of Cut)', icon: '📏' },
          { id: 'bank', label: '5. Bank Rumus Lengkap ISO', icon: '📚' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { sound.playClick(); setActiveTab(tab.id); }}
            style={{
              flex: '1 1 180px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: activeTab === tab.id ? '2px solid #38bdf8' : '1px solid transparent',
              background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: RPM */}
      {activeTab === 'rpm' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Input Panel */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚙️</span> Parameter Benda Kerja & Pahat
            </h3>

            {/* Material */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                Bahan Benda Kerja (Workpiece Material):
              </label>
              <select
                value={selectedMaterialIdx}
                onChange={(e) => {
                  setSelectedMaterialIdx(Number(e.target.value));
                  setCustomCs(null);
                }}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {CS_DATABASE.map((item, idx) => (
                  <option key={idx} value={idx}>{item.material}</option>
                ))}
              </select>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                💡 {CS_DATABASE[selectedMaterialIdx].desc}
              </div>
            </div>

            {/* Tool Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                Jenis Pahat Potong:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setToolType('hss'); setCustomCs(null); }}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: toolType === 'hss' ? '2px solid #38bdf8' : '1px solid #334155',
                    background: toolType === 'hss' ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                    color: toolType === 'hss' ? '#38bdf8' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Pahat HSS (Baja Cepat)
                </button>
                <button
                  type="button"
                  onClick={() => { setToolType('carbide'); setCustomCs(null); }}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: toolType === 'carbide' ? '2px solid #10b981' : '1px solid #334155',
                    background: toolType === 'carbide' ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                    color: toolType === 'carbide' ? '#10b981' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Pahat Karbida (Carbide Insert)
                </button>
              </div>
            </div>

            {/* Diameter */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>
                  Diameter Benda Kerja (d):
                </label>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 800 }}>Ø {calcDiameter} mm</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="1"
                value={calcDiameter}
                onChange={(e) => setCalcDiameter(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            {/* Cutting Speed Manual Override */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>
                  Kecepatan Potong (Cs / Vc):
                </label>
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800 }}>{effectiveCs} m/menit</span>
              </div>
              <input
                type="number"
                value={effectiveCs}
                onChange={(e) => setCustomCs(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎯</span> Hasil Perhitungan Spindel
              </h3>

              {/* Math formula card */}
              <div style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px dashed #0284c7', borderRadius: '10px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>RUMUS STANDAR ISO:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8', margin: '6px 0' }}>
                  n = (1000 × Cs) / (π × d)
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  n = (1000 × {effectiveCs}) / (3.1416 × {calcDiameter}) = <strong style={{ color: '#38bdf8' }}>{theoreticalRpmExact.toFixed(1)} RPM</strong>
                </div>
              </div>

              {/* Theoretical vs Gearbox */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>N TEORITIS HITUNGAN</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>{theoreticalRpm}</div>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>RPM</div>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '10px', border: '1px solid #10b981', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>GEARBOX REKOMENDASI</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{nearestStandardRpm}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>RPM (Standar Mesin)</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                💡 <strong>Prinsip Bengkel:</strong> Mesin bubut konvensional memiliki tingkatan gigi (gearbox) diskrit. Putaran spindel selalu disetel ke tingkat gigi terdekat yang aman di bawah atau tepat dengan perhitungan teoritis.
              </div>
            </div>

            {/* Apply Button */}
            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => handleApplySpindleRpm(nearestStandardRpm)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                <span>⚡ Terapkan {nearestStandardRpm} RPM ke Mesin Pemotong</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: FEED & TIME */}
      {activeTab === 'feed-time' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginBottom: '16px' }}>
              ⏱️ Parameter Pemakanan (Feeding)
            </h3>

            {/* Feed Mode */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                Jenis Operasi Pembubutan:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setFeedMode('turning')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: feedMode === 'turning' ? '2px solid #38bdf8' : '1px solid #334155',
                    background: feedMode === 'turning' ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                    color: feedMode === 'turning' ? '#38bdf8' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  Membubut Memanjang (Turning)
                </button>
                <button
                  type="button"
                  onClick={() => setFeedMode('facing')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: feedMode === 'facing' ? '2px solid #f59e0b' : '1px solid #334155',
                    background: feedMode === 'facing' ? 'rgba(245, 158, 11, 0.15)' : '#1e293b',
                    color: feedMode === 'facing' ? '#f59e0b' : '#94a3b8',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  Membubut Muka (Facing)
                </button>
              </div>
            </div>

            {/* Length */}
            {feedMode === 'turning' ? (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Panjang Pembubutan (L):</label>
                  <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 800 }}>{calcLength} mm</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={calcLength}
                  onChange={(e) => setCalcLength(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8' }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '16px', background: 'rgba(245, 158, 11, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                  Pada pembubutan muka (facing), panjang lintasan sayat adalah jari-jari benda kerja: <strong>D/2 = {validD / 2} mm</strong>
                </div>
              </div>
            )}

            {/* Feed per Rev (f) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Gerak Makan (f):</label>
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800 }}>{calcFeedRev} mm/putaran</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={calcFeedRev}
                onChange={(e) => setCalcFeedRev(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Spindle RPM Used */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Putaran Spindel Mesin (n):</label>
                <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 800 }}>{calcSpindleRpm} RPM</span>
              </div>
              <input
                type="number"
                value={calcSpindleRpm}
                onChange={(e) => setCalcSpindleRpm(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', marginBottom: '16px' }}>
                📊 Waktu Pemesinan (Tc)
              </h3>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed #f59e0b', borderRadius: '10px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>RUMUS WAKTU PEMESINAN (Tc):</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24', margin: '6px 0' }}>
                  Tc = (L + la) / F = (L + la) / (f × n)
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  Kecepatan Pemakanan F = {calcFeedRev} × {calcSpindleRpm} = <strong style={{ color: '#10b981' }}>{feedSpeedF} mm/menit</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>KECEPATAN MAKAN (F)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{feedSpeedF}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>mm / menit</div>
                </div>
                <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TOTAL WAKTU (Tc)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24' }}>
                    {timeMinutesDisplay > 0 ? `${timeMinutesDisplay}m ` : ''}{timeSecondsDisplay}s
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({machiningTimeMin.toFixed(2)} menit)</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
              💡 <strong>Catatan Praktik:</strong> Nilai <em>la</em> (2 mm) adalah jarak awalan pisau sebelum menyentuh benda kerja agar pemakanan berlangsung bertahap dan tidak mematahkan ujung insert.
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: TAPER */}
      {activeTab === 'taper' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginBottom: '16px' }}>
              📐 Parameter Benda Tirus (Taper)
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Besar (D):</label>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 800 }}>Ø {bigD} mm</span>
              </div>
              <input
                type="number"
                value={bigD}
                onChange={(e) => setBigD(Number(e.target.value))}
                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Kecil (d):</label>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 800 }}>Ø {smallD} mm</span>
              </div>
              <input
                type="number"
                value={smallD}
                onChange={(e) => setSmallD(Number(e.target.value))}
                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Panjang Bidang Tirus (l):</label>
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800 }}>{taperL} mm</span>
              </div>
              <input
                type="number"
                value={taperL}
                onChange={(e) => setTaperL(Number(e.target.value))}
                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '8px' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Panjang Total Poros (L total):</label>
                <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 800 }}>{totalWorkLength} mm</span>
              </div>
              <input
                type="number"
                value={totalWorkLength}
                onChange={(e) => setTotalWorkLength(Number(e.target.value))}
                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginBottom: '16px' }}>
              🛠️ Hasil Setel Mesin Bubut
            </h3>

            {/* Metode 1: Eretan Atas */}
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid #0284c7', borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>METODE 1: GESER ERETAN ATAS (TOP SLIDE)</div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '4px 0' }}>Rumus: <strong>tg α = (D - d) / (2 × l)</strong></div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '8px 0' }}>
                α = {alphaDegFixed}° <span style={{ fontSize: '1rem', color: '#94a3b8' }}>({alphaDegInt}° {alphaMinInt}')</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Putar skala eretan atas tepat sebesar {alphaDegFixed} derajat.</div>
            </div>

            {/* Metode 2: Geser Kepala Lepas */}
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid #d97706', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>METODE 2: GESER KEPALA LEPAS (OFFSET TAILSTOCK)</div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '4px 0' }}>Rumus: <strong>S = ((D - d) / (2 × l)) × L total</strong></div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '8px 0' }}>
                S = {tailstockOffset} mm
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Geser baut setel tailstock secara melintang sejauh {tailstockOffset} mm. Cocok untuk tirus panjang dengan sudut landai.</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: DEPTH OF CUT */}
      {activeTab === 'doc' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginBottom: '16px' }}>
              📏 Tebal Pemotongan (Depth of Cut - a)
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Diameter Awal (D0):</label>
              <input
                type="number"
                value={docRawD}
                onChange={(e) => setDocRawD(Number(e.target.value))}
                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Diameter Target (D1):</label>
              <input
                type="number"
                value={docTargetD}
                onChange={(e) => setDocTargetD(Number(e.target.value))}
                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '8px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px' }}>Rencana Frekuensi Sayatan (Passes):</label>
              <input
                type="number"
                min="1"
                max="10"
                value={passesCount}
                onChange={(e) => setPassesCount(e.target.value)}
                style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginBottom: '16px' }}>
              🎯 Pembagian Kedalaman Sayat
            </h3>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px dashed #10b981', borderRadius: '10px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>TOTAL PENGURANGAN RADIUS (a total):</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '6px 0' }}>
                a = (D0 - D1) / 2 = <strong style={{ color: '#10b981' }}>{totalDoc.toFixed(2)} mm</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Tiap Langkah Sayat: <strong>{docPerPass} mm / pass</strong> ({passesCount} kali pemakanan)
              </div>
            </div>

            <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              ⚠️ <strong>Rekomendasi Pemesinan:</strong><br />
              • Sayatan Kasar (Roughing): Kedalaman 1.0 s/d 2.5 mm per langkah.<br />
              • Sayatan Halus (Finishing): Sisakan 0.2 s/d 0.5 mm dengan putaran spindel lebih tinggi dan feeding lambat untuk permukaan mengkilap.
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: BANK RUMUS LENGKAP */}
      {activeTab === 'bank' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {[
            {
              title: '1. Kecepatan Putaran Spindel (RPM)',
              formula: 'n = (1000 × Cs) / (π × d)',
              units: 'n dalam [RPM], Cs dalam [m/menit], d dalam [mm]',
              desc: 'Semakin kecil diameter benda kerja atau semakin lunak bahan, semakin tinggi putaran spindel yang dibutuhkan.'
            },
            {
              title: '2. Kecepatan Potong (Cutting Speed)',
              formula: 'Cs = (π × d × n) / 1000',
              units: 'Cs dalam [m/menit]',
              desc: 'Jarak keliling benda kerja yang dilalui ujung mata pahat per satuan menit.'
            },
            {
              title: '3. Kecepatan Pemakanan (Feed Speed)',
              formula: 'F = f × n',
              units: 'F dalam [mm/menit], f dalam [mm/putaran]',
              desc: 'Kecepatan translasi eretan memanjang atau melintang sepanjang pemotongan.'
            },
            {
              title: '4. Waktu Pemesinan Bubut Rata (Tc)',
              formula: 'Tc = (L + la) / (f × n)',
              units: 'Tc dalam [menit], L panjang benda, la kebebasan pisau',
              desc: 'Durasi waktu yang dihabiskan untuk satu kali penyayatan penuh memanjang.'
            },
            {
              title: '5. Waktu Pemesinan Bubut Muka (Facing)',
              formula: 'Tc = (D/2 + la) / (f × n)',
              units: 'D/2 adalah jari-jari benda kerja yang disayat',
              desc: 'Durasi penyayatan melintang tegak lurus sumbu putar dari luar menuju titik pusat.'
            },
            {
              title: '6. Sudut Eretan Atas Tirus (tg α)',
              formula: 'tg α = (D - d) / (2 × l)',
              units: 'D dia besar, d dia kecil, l panjang tirus',
              desc: 'Sudut pergeseran eretan atas untuk membuat profil kerucut/tirus pendek.'
            }
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.95rem', marginBottom: '8px' }}>{item.title}</div>
              <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '8px', color: '#10b981', fontWeight: 900, fontSize: '1.05rem', fontFamily: 'monospace', marginBottom: '8px' }}>
                {item.formula}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>{item.units}</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default LatheFormulaView;

import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';

// Database Standar Kecepatan Potong (Cutting Speed Vc / Cs) untuk Mesin Bubut SMK
export const CS_DATABASE = [
  {
    material: 'Baja Lunak / Karbon Rendah (St 37 / Mild Steel)',
    csHss: 25,
    csCarbide: 150,
    feedRough: '0.20 - 0.40',
    feedFinish: '0.08 - 0.15',
    coolant: 'Soluble Oil (Emulsi Air Susu)',
    desc: 'Kandungan karbon < 0.25%. Bahan latihan utama siswa kelas 10, ulet dan mudah disayat.'
  },
  {
    material: 'Baja Karbon Sedang (St 45 / S45C / As Poros)',
    csHss: 20,
    csCarbide: 120,
    feedRough: '0.15 - 0.35',
    feedFinish: '0.06 - 0.12',
    coolant: 'Soluble Oil / Mineral Oil',
    desc: 'Kandungan karbon 0.35 - 0.50%. Bahan baku poros mesin, baut berkekuatan tinggi, dan as roda.'
  },
  {
    material: 'Baja Paduan & Perkakas (St 60 / Tool Steel)',
    csHss: 15,
    csCarbide: 90,
    feedRough: '0.12 - 0.25',
    feedFinish: '0.05 - 0.10',
    coolant: 'Heavy Duty Cutting Oil',
    desc: 'Keras dan tahan gesekan, membutuhkan gaya potong tinggi dan pahat karbida.'
  },
  {
    material: 'Besi Tuang / Cor Kelabu (Cast Iron / FC 25)',
    csHss: 18,
    csCarbide: 110,
    feedRough: '0.20 - 0.45',
    feedFinish: '0.10 - 0.20',
    coolant: 'Kering (Dry) / Tiupan Udara',
    desc: 'Getas, tatal berupa serbuk debu grafit. Dibubut kering tanpa air agar tatal tidak membatu.'
  },
  {
    material: 'Aluminium & Paduannya (Dural / Al 6061)',
    csHss: 80,
    csCarbide: 300,
    feedRough: '0.25 - 0.50',
    feedFinish: '0.08 - 0.18',
    coolant: 'Minyak Tanah (Kerosene) / Emulsi Ringan',
    desc: 'Logam non-ferro sangat lunak, kecepatan sayat sangat tinggi, hasil permukaan sangat mengkilap.'
  },
  {
    material: 'Kuningan & Tembaga (Brass / Copper)',
    csHss: 45,
    csCarbide: 200,
    feedRough: '0.20 - 0.40',
    feedFinish: '0.08 - 0.15',
    coolant: 'Kering atau Emulsi Ringan',
    desc: 'Daya hantar panas tinggi, tatal patah-patah pendek, sudut baji pahat relatif tegak.'
  },
  {
    material: 'Baja Tahan Karat (Stainless Steel / SUS 304)',
    csHss: 14,
    csCarbide: 85,
    feedRough: '0.12 - 0.25',
    feedFinish: '0.05 - 0.10',
    coolant: 'Sulphur-based EP Oil',
    desc: 'Cepat mengeras jika tergesek (work-hardening). Sayatan harus mantap dan tidak boleh berhenti di tempat.'
  }
];

// Standar Roda Gigi Spindel Mesin Bubut Konvensional (Standar Gearbox RPM)
export const STANDARD_GEAR_RPMS = [45, 70, 95, 110, 150, 180, 220, 300, 380, 450, 600, 750, 900, 1200, 1500, 2000];

const LatheFormulaView = ({
  initialDiameter = 50,
  initialLength = 100,
  currentRpm = 600,
  materialName = '',
  onApplyRpm,
  onGoToCutting
}) => {
  // Sub-Tab Navigation:
  // 'cutting-speed' | 'spindle' | 'time' | 'taper' | 'doc-mrr' | 'examples' | 'glossary'
  const [activeTab, setActiveTab] = useState('cutting-speed');
  const [appliedNotice, setAppliedNotice] = useState(null);

  // Tab 1: Dedicated Cutting Speed (Vc) Calculator State
  const [csCalcDiameter, setCsCalcDiameter] = useState(30); // mm
  const [csCalcRpm, setCsCalcRpm] = useState(500); // RPM

  // Tab 2: Spindle Speed (n) Calculator State
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0);
  const [toolType, setToolType] = useState('hss'); // default hss for kelas 10
  const [calcDiameter, setCalcDiameter] = useState(initialDiameter);
  const [customCs, setCustomCs] = useState(null);

  // Tab 3: Feeding & Time State
  const [opCategory, setOpCategory] = useState('turning'); // 'turning' | 'facing' | 'drilling'
  const [calcLength, setCalcLength] = useState(initialLength);
  const [calcFeedRev, setCalcFeedRev] = useState(0.10); // mm/putaran (f)
  const [calcSpindleRpm, setCalcSpindleRpm] = useState(currentRpm);
  const [safetyApproach, setSafetyApproach] = useState(2); // la (mm)

  // Tab 4: Taper Turning State (Simple & Advanced)
  const [bigD, setBigD] = useState(initialDiameter);
  const [smallD, setSmallD] = useState(Math.max(10, initialDiameter - 10));
  const [taperL, setTaperL] = useState(30);
  const [totalWorkLength, setTotalWorkLength] = useState(initialLength);

  // Tab 5: Depth of Cut State
  const [docRawD, setDocRawD] = useState(initialDiameter);
  const [docTargetD, setDocTargetD] = useState(Math.max(10, initialDiameter - 6));
  const [passesCount, setPassesCount] = useState(2);

  // Match initial material name
  useEffect(() => {
    if (materialName) {
      const idx = CS_DATABASE.findIndex(m =>
        m.material.toLowerCase().includes(materialName.toLowerCase()) ||
        materialName.toLowerCase().includes(m.material.toLowerCase().split(' ')[0])
      );
      if (idx !== -1) setSelectedMaterialIdx(idx);
    }
  }, [materialName]);

  // Sync initialDiameter
  useEffect(() => {
    if (initialDiameter) {
      setCalcDiameter(initialDiameter);
      setBigD(initialDiameter);
      setDocRawD(initialDiameter);
      setDocTargetD(Math.max(5, initialDiameter - 6));
    }
  }, [initialDiameter]);

  // ==========================================
  // MATHEMATICAL CALCULATIONS (EXACT & STEPPED)
  // ==========================================

  // 1. Standalone Cutting Speed Calculation: Vc = (π * d * n) / 1000
  const validCsD = Math.max(0.1, Number(csCalcDiameter) || 1);
  const validCsRpm = Math.max(1, Number(csCalcRpm) || 100);
  const calculatedCircumference = (Math.PI * validCsD).toFixed(2); // mm per putaran
  const calculatedTotalLinearMm = (Math.PI * validCsD * validCsRpm).toFixed(1); // mm per menit
  const calculatedCuttingSpeedExact = ((Math.PI * validCsD * validCsRpm) / 1000);
  const calculatedCuttingSpeedDisplay = calculatedCuttingSpeedExact.toFixed(2);

  // 2. Spindle RPM Calculation: n = (1000 * Vc) / (π * d)
  const presetCs = toolType === 'carbide'
    ? CS_DATABASE[selectedMaterialIdx].csCarbide
    : CS_DATABASE[selectedMaterialIdx].csHss;
  const effectiveCs = customCs !== null ? customCs : presetCs;
  const validD = Math.max(0.1, Number(calcDiameter) || 1);
  
  const theoreticalRpmExact = (1000 * effectiveCs) / (Math.PI * validD);
  const theoreticalRpm = Math.round(theoreticalRpmExact);
  const nearestStandardRpm = STANDARD_GEAR_RPMS.reduce((prev, curr) =>
    Math.abs(curr - theoreticalRpm) < Math.abs(prev - theoreticalRpm) ? curr : prev
  );

  // 3. Feeding & Time Calculation
  const validF = Math.max(0.01, Number(calcFeedRev) || 0.1);
  const validRpmForTime = Math.max(1, Number(calcSpindleRpm) || 100);
  const feedSpeedF = (validF * validRpmForTime).toFixed(1); // mm/menit
  
  let strokeDistance = Number(calcLength) + Number(safetyApproach);
  if (opCategory === 'facing') {
    strokeDistance = (validD / 2) + Number(safetyApproach);
  } else if (opCategory === 'drilling') {
    strokeDistance = Number(calcLength) + (0.3 * validD) + Number(safetyApproach);
  }

  const machiningTimeMin = (strokeDistance / (validF * validRpmForTime));
  const totalSeconds = Math.round(machiningTimeMin * 60);
  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;

  // 4. Taper Calculation: tg α = (D - d) / (2 * l)
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

  // 5. Depth of Cut
  const validRawD = Number(docRawD) || 0;
  const validTargetD = Number(docTargetD) || 0;
  const totalDoc = Math.max(0, (validRawD - validTargetD) / 2);
  const docPerPass = (totalDoc / Math.max(1, parseInt(passesCount) || 1)).toFixed(2);

  const handleApplySpindleRpm = (rpmVal) => {
    sound.playSuccess();
    if (onApplyRpm) onApplyRpm(rpmVal);
    setAppliedNotice(`Spindel mesin berhasil disinkronkan ke ${rpmVal} RPM!`);
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1180px', margin: '0 auto', color: '#f8fafc', paddingBottom: '30px' }}>
      
      {/* HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0b1528 0%, #172554 100%)',
        border: '1.5px solid #38bdf8',
        borderRadius: '18px',
        padding: '24px 28px',
        boxShadow: '0 12px 35px rgba(2, 132, 199, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '2rem',
            boxShadow: '0 6px 20px rgba(56, 189, 248, 0.4)'
          }}>
            📐
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: 0, color: '#ffffff', letterSpacing: '0.5px' }}>
                RUMUS TEKNIK PEMESINAN BUBUT DASAR (KELAS 10 SMK)
              </h2>
              <span style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                Kurikulum Merdeka / Fase E
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#93c5fd' }}>
              Panduan rumus kecepatan potong (Cutting Speed), putaran spindel (RPM), gerak makan, waktu pembubutan, dan contoh studi kasus dasar bengkel yang mudah dipahami siswa baru.
            </p>
          </div>
        </div>

        {onGoToCutting && (
          <button
            onClick={() => { sound.playClick(); onGoToCutting(); }}
            style={{
              padding: '12px 22px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
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
          border: '1.5px solid #10b981',
          color: '#6ee7b7',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '0.92rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✅</span> {appliedNotice}
        </div>
      )}

      {/* BILAH SUB-TAB DENGAN HIGHLIGHT KHUSUS CUTTING SPEED & STUDI KASUS */}
      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        background: '#090f1d',
        padding: '8px',
        borderRadius: '14px',
        border: '1px solid #1e293b'
      }}>
        {[
          { id: 'cutting-speed', label: '1. Kecepatan Potong (Cutting Speed / Vc)', icon: '⚡' },
          { id: 'spindle', label: '2. Putaran Mesin / Spindel (n / RPM)', icon: '🔄' },
          { id: 'time', label: '3. Gerak Makan & Waktu Sayat (F & Tc)', icon: '⏱️' },
          { id: 'taper', label: '4. Pembubutan Tirus Sederhana', icon: '📐' },
          { id: 'doc-mrr', label: '5. Kedalaman Potong Radial (a)', icon: '📏' },
          { id: 'examples', label: '6. Studi Kasus Dasar (Kelas 10 SMK)', icon: '📝' },
          { id: 'glossary', label: '7. Glosarium Simbol & Tabel Standar', icon: '📚' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { sound.playClick(); setActiveTab(tab.id); }}
            style={{
              flex: '1 1 150px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: activeTab === tab.id ? '2px solid #38bdf8' : '1px solid transparent',
              background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
              color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RUMUS KECEPATAN POTONG (CUTTING SPEED - Vc / Cs) */}
      {/* ========================================================================= */}
      {activeTab === 'cutting-speed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* DEFINISI & ASAL USUL RUMUS CUTTING SPEED */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '1.6rem' }}>⚡</span>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', margin: 0 }}>
                  RUMUS KECEPATAN POTONG (CUTTING SPEED - Vc atau Cs)
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Konsep paling fundamental dalam pemesinan bubut untuk menentukan kemampuan potong pahat terhadap bahan
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 12px 0' }}>
                  <strong>Apa itu Kecepatan Potong (Cutting Speed)?</strong><br />
                  Ibarat roda sepeda yang menggelinding di atas jalan aspal, <strong>Kecepatan Potong (Vc)</strong> adalah panjang lintasan keliling benda kerja yang disayat oleh ujung mata pahat dalam waktu <strong>satu menit</strong>.
                </p>

                <div style={{ background: 'rgba(2, 132, 199, 0.1)', borderLeft: '4px solid #38bdf8', padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>Asal-Usul Penurunan Rumus (Mudah Dipahami):</div>
                  <div style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
                    1. Satu putaran penuh silinder menempuh jarak keliling: <strong>π × d</strong> (dalam milimeter).<br />
                    2. Jika benda berputar sebanyak <strong>n putaran per menit (RPM)</strong>, jarak tempuh per menit menjadi: <strong>π × d × n</strong> (mm/menit).<br />
                    3. Karena standar internasional menyatakan kecepatan potong dalam <strong>meter/menit</strong>, maka hasil harus dibagi <strong>1000</strong> (karena 1 meter = 1000 mm).
                  </div>
                </div>

                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981', background: '#020617', padding: '12px 18px', borderRadius: '10px', border: '1px solid #10b981', textAlign: 'center', fontFamily: 'monospace' }}>
                  Vc = (π × d × n) / 1000 [meter/menit]
                </div>
              </div>

              {/* DIAGRAM VISUAL LINGKARAN KELILING & SAYATAN */}
              <div style={{ background: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center' }}>
                <svg viewBox="0 0 400 180" style={{ width: '100%', maxHeight: '180px' }}>
                  {/* Circle Cross Section */}
                  <circle cx="140" cy="90" r="60" fill="url(#metalGrad)" stroke="#38bdf8" strokeWidth="2" />
                  
                  {/* Center Dot */}
                  <circle cx="140" cy="90" r="4" fill="#ef4444" />
                  
                  {/* Diameter Line */}
                  <line x1="80" y1="90" x2="200" y2="90" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x="140" y="82" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">Ø d (mm)</text>

                  {/* Circumference Label */}
                  <path d="M 140 25 A 65 65 0 0 1 205 90" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="195" y="45" fill="#f59e0b" fontSize="10" fontWeight="bold">Keliling = π × d</text>

                  {/* Cutting Tool */}
                  <polygon points="200,90 235,75 235,105" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                  <rect x="235" y="80" width="70" height="20" fill="#334155" stroke="#475569" />
                  <text x="270" y="93" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">PAHAT</text>

                  {/* Tangential Vc Vector */}
                  <line x1="200" y1="90" x2="200" y2="25" stroke="#10b981" strokeWidth="3" markerEnd="url(#greenArrow)" />
                  <text x="210" y="40" fill="#10b981" fontSize="12" fontWeight="bold">Vc (m/menit)</text>
                </svg>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                  Panjang lintasan keliling yang digores mata pahat dalam 1 menit = Vc (meter/menit)
                </div>
              </div>
            </div>
          </div>

          {/* DUA KOLOM: KALKULATOR KHUSUS CUTTING SPEED VS TABEL REKOMENDASI KELAS 10 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            {/* KALKULATOR INTERAKTIF Vc */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🧮</span> Kalkulator Menghitung Cutting Speed (Vc)
              </h4>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', color: '#cbd5e1', fontWeight: 700 }}>
                    1. Diameter Benda Kerja (d):
                  </label>
                  <span style={{ fontSize: '1rem', color: '#38bdf8', fontWeight: 900 }}>Ø {csCalcDiameter} mm</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={csCalcDiameter}
                  onChange={(e) => setCsCalcDiameter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', color: '#cbd5e1', fontWeight: 700 }}>
                    2. Putaran Spindel Mesin (n):
                  </label>
                  <span style={{ fontSize: '1rem', color: '#f59e0b', fontWeight: 900 }}>{csCalcRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1500"
                  step="50"
                  value={csCalcRpm}
                  onChange={(e) => setCsCalcRpm(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
                />
              </div>

              {/* STEP BY STEP BREAKDOWN */}
              <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '0.86rem', lineHeight: 1.6 }}>
                <div style={{ color: '#94a3b8', fontSize: '0.76rem', textTransform: 'uppercase', marginBottom: '6px' }}>Langkah Perhitungan:</div>
                • Keliling 1 putaran = 3.1416 × {csCalcDiameter} = <strong style={{ color: '#38bdf8' }}>{calculatedCircumference} mm</strong><br />
                • Lintasan dalam 1 menit = {calculatedCircumference} × {csCalcRpm} = <strong>{calculatedTotalLinearMm} mm/min</strong><br />
                • Dibagi 1000 = {calculatedTotalLinearMm} / 1000 = <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>{calculatedCuttingSpeedDisplay} m/menit</strong>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1.5px solid #10b981', borderRadius: '12px', padding: '16px', textAlign: 'center', marginTop: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: '#6ee7b7', fontWeight: 800 }}>KECEPATAN POTONG YANG DIHASILKAN (Vc):</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>
                  {calculatedCuttingSpeedDisplay} <span style={{ fontSize: '1.1rem' }}>m/menit</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {calculatedCuttingSpeedExact < 35 
                    ? 'Cocok untuk Baja Lunak St 37 / Baja Sedang dengan Pahat HSS.' 
                    : calculatedCuttingSpeedExact <= 100 
                    ? 'Cocok untuk Aluminium dengan Pahat HSS, atau Baja dengan Pahat Karbida.' 
                    : 'Kecepatan tinggi, wajib menggunakan Pahat Karbida bersiraman coolant melimpah.'}
                </div>
              </div>
            </div>

            {/* TABEL STANDAR Vc KELAS 10 YANG MUDAH DIINGAT */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📚</span> Patokan Nilai Vc Sederhana untuk Kelas 10 SMK
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 14px 0' }}>
                Di bengkel sekolah, siswa kelas 10 umumnya menggunakan <strong>Pahat HSS</strong>. Ingat angka-angka patokan dasar berikut saat praktik:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { mat: 'Baja Lunak (St 37 / Mild Steel)', hss: '20 - 30 m/min', carbide: '120 - 150 m/min', note: 'Bahan paling sering dipakai job sheet' },
                  { mat: 'Baja Sedang (St 45 / S45C)', hss: '15 - 25 m/min', carbide: '100 - 130 m/min', note: 'Bahan poros & roda gigi' },
                  { mat: 'Aluminium / Duralumin', hss: '60 - 100 m/min', carbide: '250 - 350 m/min', note: 'Logam lunak, sayatan boleh cepat' },
                  { mat: 'Kuningan / Tembaga (Brass)', hss: '30 - 50 m/min', carbide: '150 - 220 m/min', note: 'Mudah dipotong, tatal rapuh' },
                  { mat: 'Besi Tuang Kelabu (Cast Iron)', hss: '15 - 20 m/min', carbide: '90 - 120 m/min', note: 'Wajib dibubut kering tanpa air' }
                ].map((row, idx) => (
                  <div key={idx} style={{ background: '#1e293b', padding: '12px 14px', borderRadius: '10px', borderLeft: '4px solid #38bdf8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>{row.mat}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800, background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                        HSS: {row.hss}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                      <span>💡 {row.note}</span>
                      <span style={{ color: '#10b981' }}>Karbida: {row.carbide}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PUTARAN MESIN / SPINDEL (n / RPM) */}
      {/* ========================================================================= */}
      {activeTab === 'spindle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 10px 0' }}>
              🔄 Rumus Kecepatan Putaran Spindel (n / RPM)
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Dari rumus kecepatan potong Vc = (π × d × n) / 1000, kita balik rumusnya untuk mencari nilai <strong>n (putaran spindel per menit / RPM)</strong> yang harus disetel pada tuas mesin bubut:
            </p>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#38bdf8', background: '#020617', padding: '12px 18px', borderRadius: '10px', border: '1px solid #0284c7', textAlign: 'center', fontFamily: 'monospace', margin: '14px 0' }}>
              n = (1000 × Vc) / (π × d) [RPM]
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            {/* INPUT PANEL */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 16px 0' }}>
                ⚙️ Tentukan Putaran Mesin untuk Pekerjaan Anda
              </h4>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                  Bahan Benda Kerja:
                </label>
                <select
                  value={selectedMaterialIdx}
                  onChange={(e) => {
                    setSelectedMaterialIdx(Number(e.target.value));
                    setCustomCs(null);
                  }}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', padding: '10px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700 }}
                >
                  {CS_DATABASE.map((item, idx) => (
                    <option key={idx} value={idx}>{item.material}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                  Pilihan Alat Potong / Pahat:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => { setToolType('hss'); setCustomCs(null); }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: toolType === 'hss' ? '2px solid #38bdf8' : '1px solid #334155',
                      background: toolType === 'hss' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                      color: toolType === 'hss' ? '#38bdf8' : '#94a3b8',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Pahat HSS (Standar Siswa)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setToolType('carbide'); setCustomCs(null); }}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: toolType === 'carbide' ? '2px solid #10b981' : '1px solid #334155',
                      background: toolType === 'carbide' ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                      color: toolType === 'carbide' ? '#10b981' : '#94a3b8',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Pahat Karbida (Insert)
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Benda Kerja (d):</label>
                  <span style={{ fontSize: '1rem', color: '#38bdf8', fontWeight: 900 }}>Ø {calcDiameter} mm</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={calcDiameter}
                  onChange={(e) => setCalcDiameter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
                  Kecepatan Potong Standar (Vc):
                </label>
                <input
                  type="number"
                  value={effectiveCs}
                  onChange={(e) => setCustomCs(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* HASIL LANGKAH HITUNG & GEARBOX */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981', margin: '0 0 16px 0' }}>
                  🎯 Langkah Perhitungan & Penyetelan Tuas Mesin
                </h4>

                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  • n = (1000 × {effectiveCs}) / (3.1416 × {calcDiameter})<br />
                  • n = {1000 * effectiveCs} / {(Math.PI * validD).toFixed(2)}<br />
                  • n = <strong style={{ color: '#38bdf8', fontSize: '1.15rem' }}>{theoreticalRpmExact.toFixed(2)} RPM</strong> (Hasil Hitungan Kertas)
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid #10b981', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#6ee7b7', fontWeight: 800, textTransform: 'uppercase' }}>PILIHAN TINGKAT GEARBOX MESIN NYATA:</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>
                    {nearestStandardRpm} RPM
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Setel tuas A-B-C / 1-2-3 pada kepala tetap (headstock) ke tingkat <strong>{nearestStandardRpm} RPM</strong> (tingkat kecepatan terdekat yang aman).
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <button
                  type="button"
                  onClick={() => handleApplySpindleRpm(nearestStandardRpm)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
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
                  <span>⚡ Terapkan {nearestStandardRpm} RPM ke Simulator Pemotongan</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GERAK MAKAN & WAKTU SAYAT (F & Tc) */}
      {/* ========================================================================= */}
      {activeTab === 'time' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 10px 0' }}>
              ⏱️ Kecepatan Pemakanan (F) dan Waktu Pembubutan (Tc)
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              • <strong>Kecepatan Pemakanan (F):</strong> Kecepatan gerak maju eretan memanjang secara otomatis dalam satuan <strong>mm/menit</strong>. Rumus: <strong>F = f × n</strong>.<br />
              • <strong>Waktu Pemesinan (Tc):</strong> Durasi menit yang dibutuhkan pahat untuk menyayat dari awal hingga selesai. Rumus: <strong>Tc = (L + la) / F</strong>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 16px 0' }}>
                ⚙️ Parameter Pengerjaan
              </h4>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Operasi Pemotongan:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setOpCategory('turning')}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: opCategory === 'turning' ? '2px solid #38bdf8' : '1px solid #334155',
                      background: opCategory === 'turning' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                      color: opCategory === 'turning' ? '#38bdf8' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Bubut Rata (Turning)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpCategory('facing')}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: opCategory === 'facing' ? '2px solid #f59e0b' : '1px solid #334155',
                      background: opCategory === 'facing' ? 'rgba(245, 158, 11, 0.2)' : '#1e293b',
                      color: opCategory === 'facing' ? '#f59e0b' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Bubut Muka (Facing)
                  </button>
                </div>
              </div>

              {opCategory === 'turning' ? (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Panjang Pembubutan (L):</label>
                    <span style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 800 }}>{calcLength} mm</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={calcLength}
                    onChange={(e) => setCalcLength(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '14px', background: '#1e293b', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#fde68a' }}>
                  💡 Pada pembubutan muka (facing), panjang langkah adalah jari-jari: <strong>d/2 = {validD / 2} mm</strong>.
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Gerak Makan (f):</label>
                  <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800 }}>{calcFeedRev} mm/putaran</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={calcFeedRev}
                  onChange={(e) => setCalcFeedRev(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Putaran Spindel (n):</label>
                <input
                  type="number"
                  value={calcSpindleRpm}
                  onChange={(e) => setCalcSpindleRpm(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', margin: '0 0 16px 0' }}>
                  📊 Hasil Kecepatan Makan & Waktu Sayat
                </h4>

                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  • F = f × n = {validF} × {validRpmForTime} = <strong style={{ color: '#10b981' }}>{feedSpeedF} mm/menit</strong><br />
                  • Lintasan Sayat = {strokeDistance.toFixed(1)} mm (termasuk awalan 2 mm)<br />
                  • Tc = {strokeDistance.toFixed(1)} / {feedSpeedF} = <strong style={{ color: '#38bdf8' }}>{machiningTimeMin.toFixed(2)} menit</strong>
                </div>

                <div style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1.5px solid #0284c7', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 800 }}>DURASI PENYAYATAN (Tc):</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>
                    {displayMinutes > 0 ? `${displayMinutes} menit ` : ''}{displaySeconds} detik
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Proses pemakanan satu langkah selesai dalam {totalSeconds} detik.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PEMBUBUTAN TIRUS SEDERHANA */}
      {/* ========================================================================= */}
      {activeTab === 'taper' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 10px 0' }}>
              📐 Rumus Pembubutan Tirus (Penggeseran Eretan Atas)
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Untuk siswa kelas 10, metode tirus yang paling dasar adalah dengan <strong>memutar eretan atas (top slide)</strong> sebesar sudut setengah tirus:
            </p>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', background: '#020617', padding: '12px 18px', borderRadius: '10px', border: '1px solid #0284c7', textAlign: 'center', fontFamily: 'monospace', margin: '14px 0' }}>
              tg α = (D - d) / (2 × l)
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 16px 0' }}>
                ⚙️ Ukuran Benda Tirus dari Gambar
              </h4>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Besar (D):</label>
                <input
                  type="number"
                  value={bigD}
                  onChange={(e) => setBigD(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Kecil (d):</label>
                <input
                  type="number"
                  value={smallD}
                  onChange={(e) => setSmallD(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Panjang Tirus (l):</label>
                <input
                  type="number"
                  value={taperL}
                  onChange={(e) => setTaperL(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981', margin: '0 0 16px 0' }}>
                  🎯 Hasil Perhitungan Derajat Eretan Atas
                </h4>

                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  • Selisih Diameter (D - d) = {validBigD} - {validSmallD} = {dDiff} mm<br />
                  • tg α = {dDiff} / (2 × {validTaperL}) = {dDiff} / {2 * validTaperL} = <strong style={{ color: '#38bdf8' }}>{tanAlpha.toFixed(4)}</strong><br />
                  • Sudut α = arctan({tanAlpha.toFixed(4)})
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1.5px solid #0284c7', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 800 }}>SUDUT ERETAN ATAS YANG HARUS DIPUTAR:</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: '4px 0' }}>
                    α = {alphaDegFixed}°
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6ee7b7' }}>
                    ({alphaDegInt}° {alphaMinInt}')
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '8px' }}>
                    Kendurkan baut eretan atas, putar piringan sebesar {alphaDegFixed}°, kencangkan baut kembali.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: KEDALAMAN POTONG RADIAL (a) */}
      {/* ========================================================================= */}
      {activeTab === 'doc-mrr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 10px 0' }}>
              📏 Tebal Sayatan / Kedalaman Potong Radial (Depth of Cut - a)
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Pada mesin bubut, benda kerja berbentuk silinder. Setiap pahat masuk sejauh <strong>1 mm (secara radial)</strong>, maka diameter benda kerja akan berkurang sebesar <strong>2 mm</strong>. Rumus: <strong>a = (D0 - D1) / 2</strong>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Awal Benda (D0):</label>
                <input
                  type="number"
                  value={docRawD}
                  onChange={(e) => setDocRawD(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Target Setelah Dibubut (D1):</label>
                <input
                  type="number"
                  value={docTargetD}
                  onChange={(e) => setDocTargetD(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Jumlah Langkah Sayat (Passes):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={passesCount}
                  onChange={(e) => setPassesCount(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid #10b981', borderRadius: '12px', padding: '18px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: '#6ee7b7', fontWeight: 800 }}>KEDALAMAN POTONG PER LANGKAH SAYAT:</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>
                  a = {docPerPass} mm
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Total pengurangan jari-jari {totalDoc.toFixed(2)} mm dibagi dalam {passesCount} kali sayatan.
                </div>
              </div>

              <div style={{ background: '#1e293b', padding: '12px 14px', borderRadius: '10px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                💡 <strong>Tips Aman Kelas 10:</strong> Jangan memakan terlalu dalam saat pertama kali membubut. Untuk sayatan kasar (*roughing*) cukup 1.0 mm per langkah, dan untuk sayatan halus (*finishing*) sisakan 0.2 mm agar permukaan halus dan tidak bergetar.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONTOH STUDI KASUS DASAR (KELAS 10 SMK) */}
      {/* ========================================================================= */}
      {activeTab === 'examples' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.6rem' }}>📝</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#38bdf8', margin: 0 }}>
                5 STUDI KASUS DASAR BENGKEL (KHUSUS KELAS 10 SMK FASE E)
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              Soal-soal studi kasus ini dirancang khusus dari pekerjaan nyata siswa baru di bengkel sekolah (menggunakan angka-angka bulat yang mudah dihitung) lengkap dengan langkah penyelesaian terperinci: <strong>Diketahui → Ditanya → Rumus → Hitungan → Cara Setel Mesin Nyata</strong>.
            </p>
          </div>

          {[
            {
              id: 1,
              title: 'STUDI KASUS 1: Menghitung Putaran Spindel (n / RPM) Latihan Pertama',
              story: 'Budi (siswa kelas 10) menerima benda kerja silinder Baja Lunak St 37 berdiameter Ø30 mm dari guru pembimbing. Budi akan membubut rata menggunakan pahat HSS. Di tabel dinding bengkel tertulis kecepatan potong Vc = 25 m/menit. Berapakah putaran mesin (n) yang harus disetel oleh Budi pada tuas mesin bubut?',
              given: '• Bahan = Baja Lunak St 37\n• Diameter benda (d) = 30 mm\n• Pahat = HSS (Vc = 25 m/menit)\n• Konstanta π ≈ 3.14',
              asked: 'Putaran spindel mesin n (dalam RPM)?',
              formula: 'n = (1000 × Vc) / (π × d)',
              steps: [
                '1. Kalikan 1000 dengan Vc: 1000 × 25 = 25.000',
                '2. Hitung keliling penampang benda: 3.14 × 30 = 94.2 mm',
                '3. Bagi hasil keduanya: n = 25.000 / 94.2 = 265.39 RPM'
              ],
              conclusion: 'Hasil hitungan adalah 265 RPM. Di tuas gearbox mesin bubut sekolah tersedia pilihan 150, 250, dan 450 RPM. Budi memilih tingkat terdekat yang aman yaitu 250 RPM.'
            },
            {
              id: 2,
              title: 'STUDI KASUS 2: Menghitung Kecepatan Potong (Cutting Speed / Vc)',
              story: 'Rian sedang membubut poros Aluminium berdiameter Ø20 mm. Mesin bubut di bengkel sedang berputar pada kecepatan n = 600 RPM. Rian ingin mengetahui berapa kecepatan potong (Vc) yang terjadi pada ujung mata pahat, dan apakah kecepatan tersebut aman untuk pahat HSS?',
              given: '• Diameter poros (d) = 20 mm\n• Putaran mesin (n) = 600 RPM\n• Pahat = HSS (Batas aman aluminium: 60 - 100 m/menit)\n• Konstanta π ≈ 3.14',
              asked: 'Kecepatan potong Vc (dalam meter/menit)?',
              formula: 'Vc = (π × d × n) / 1000',
              steps: [
                '1. Hitung keliling 1 putaran: 3.14 × 20 mm = 62.8 mm',
                '2. Kalikan dengan jumlah putaran per menit: 62.8 × 600 = 37.680 mm/menit',
                '3. Ubah ke meter dengan membagi 1000: Vc = 37.680 / 1000 = 37.68 m/menit'
              ],
              conclusion: 'Kecepatan potong yang dihasilkan adalah 37.68 m/menit. Angka ini sangat aman untuk pahat HSS (di bawah batas maksimal 100 m/menit), bahkan putaran mesin masih bisa dinaikkan ke tingkat berikutnya (misal 900 RPM) agar hasil bubut lebih halus.'
            },
            {
              id: 3,
              title: 'STUDI KASUS 3: Menghitung Kecepatan Gerak Makan Eretan Otomatis (F)',
              story: 'Doni ingin menyalakan tuas pemakanan otomatis (auto-feed) agar permukaan poros silindernya rata dan mengkilap. Spindel mesin berputar pada n = 500 RPM, dan handel transmisi feeding disetel pada nilai f = 0.1 mm/putaran. Berapa millimeter eretan akan bergerak maju dalam satu menit?',
              given: '• Putaran mesin (n) = 500 RPM\n• Gerak makan per putaran (f) = 0.1 mm/putaran',
              asked: 'Kecepatan pemakanan otomatis F (dalam mm/menit)?',
              formula: 'F = f × n',
              steps: [
                '1. Kalikan gerak makan f dengan putaran n: F = 0.1 × 500',
                '2. Hasil perhitungan: F = 50 mm/menit'
              ],
              conclusion: 'Eretan pembawa pahat akan bergerak maju menyayat sepanjang 50 mm setiap satu menit secara konstan.'
            },
            {
              id: 4,
              title: 'STUDI KASUS 4: Menghitung Waktu Pembubutan Rata (Tc)',
              story: 'Siti mendapat tugas membubut rata poros sepanjang L = 100 mm dengan kecepatan pemakanan otomatis F = 50 mm/menit. Sebelum menyayat, Siti memposisikan ujung pahat berjarak la = 2 mm di depan benda kerja sebagai jarak awalan aman. Berapa menit waktu yang dibutuhkan untuk menyelesaikan satu kali langkah penyayatan?',
              given: '• Panjang bidang sayat (L) = 100 mm\n• Jarak awalan pahat (la) = 2 mm\n• Kecepatan pemakanan (F) = 50 mm/menit',
              asked: 'Waktu pemesinan Tc (dalam menit dan detik)?',
              formula: 'Tc = (L + la) / F',
              steps: [
                '1. Hitung total jarak lintasan pahat: 100 + 2 = 102 mm',
                '2. Bagi dengan kecepatan makan: Tc = 102 / 50 = 2.04 menit',
                '3. Konversi 0.04 menit ke detik: 0.04 × 60 detik = 2.4 detik'
              ],
              conclusion: 'Waktu yang dibutuhkan Siti adalah 2 menit 2 detik untuk satu kali penyayatan penuh.'
            },
            {
              id: 5,
              title: 'STUDI KASUS 5: Menghitung Sudut Eretan Atas untuk Tirus Sederhana',
              story: 'Siswa diminta membuat ujung tirus sederhana pada benda kerja latihan. Diameter pangkal yang besar D = 30 mm, diameter ujung yang kecil d = 20 mm, dan panjang bidang tirus l = 25 mm. Berapa derajat skala eretan atas (top slide) harus diputar oleh siswa?',
              given: '• Diameter besar (D) = 30 mm\n• Diameter kecil (d) = 20 mm\n• Panjang tirus (l) = 25 mm',
              asked: 'Sudut pergeseran eretan atas α (dalam derajat)?',
              formula: 'tg α = (D - d) / (2 × l)',
              steps: [
                '1. Hitung selisih diameter: D - d = 30 - 20 = 10 mm',
                '2. Kalikan 2 dengan panjang tirus: 2 × 25 = 50 mm',
                '3. Bagi hasil selisih dengan 50: tg α = 10 / 50 = 0.2',
                '4. Cari nilai sudut tangen 0.2: α = arctan(0.2) = 11.31° (sekitar 11° 19\')'
              ],
              conclusion: 'Siswa mengendurkan dua baut eretan atas, memutar piringan skala eretan tepat sebesar 11.3° (sekitar 11 derajat), lalu mengencangkan baut kembali untuk membubut tirus.'
            }
          ].map((item) => (
            <div key={item.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 900, fontSize: '0.9rem' }}>
                  {item.id}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>
                  {item.title}
                </h4>
              </div>

              {/* CERITA KASUS */}
              <div style={{ background: '#1e293b', padding: '14px 16px', borderRadius: '10px', fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '14px' }}>
                <strong>📖 Situasi Kasus di Bengkel:</strong><br />
                {item.story}
              </div>

              {/* GRID DIKETAHUI, DITANYA, RUMUS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                  <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800 }}>📋 DIKETAHUI:</div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', whiteSpace: 'pre-line', marginTop: '4px', fontFamily: 'monospace' }}>
                    {item.given}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 800 }}>❓ DITANYAKAN:</div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
                    {item.asked}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800, marginTop: '8px' }}>💡 RUMUS DASAR:</div>
                  <div style={{ fontSize: '0.88rem', color: '#6ee7b7', fontWeight: 900, fontFamily: 'monospace', marginTop: '2px' }}>
                    {item.formula}
                  </div>
                </div>
              </div>

              {/* LANGKAH PERHITUNGAN */}
              <div style={{ background: '#020617', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                  ✏️ Langkah Perhitungan Matematis:
                </div>
                {item.steps.map((st, sIdx) => (
                  <div key={sIdx} style={{ fontSize: '0.84rem', color: '#f8fafc', fontFamily: 'monospace', padding: '3px 0' }}>
                    {st}
                  </div>
                ))}
              </div>

              {/* KESIMPULAN PENYETELAN MESIN NYATA */}
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid #10b981', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', color: '#6ee7b7', lineHeight: 1.5 }}>
                🎯 <strong>Kesimpulan & Penyetelan Mesin Nyata:</strong> {item.conclusion}
              </div>
            </div>
          ))}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: GLOSARIUM SIMBOL & TABEL STANDAR ISO */}
      {/* ========================================================================= */}
      {activeTab === 'glossary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 10px 0' }}>
              📚 Glosarium Lambang & Satuan Standar Pemesinan Bubut
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0 }}>
              Daftar lambang besaran internasional yang harus dipahami oleh siswa SMK Teknik Pemesinan.
            </p>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#1e293b', borderBottom: '2px solid #38bdf8', color: '#f8fafc' }}>
                  <th style={{ padding: '12px 16px' }}>Simbol</th>
                  <th style={{ padding: '12px 16px' }}>Nama Besaran</th>
                  <th style={{ padding: '12px 16px' }}>Satuan</th>
                  <th style={{ padding: '12px 16px' }}>Keterangan Sederhana (Kelas 10)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { sym: 'Vc (Cs)', name: 'Cutting Speed (Kecepatan Potong)', unit: 'meter/menit (m/min)', desc: 'Panjang sayatan yang dilalui ujung pahat dalam 1 menit.' },
                  { sym: 'n', name: 'Revolutions Per Minute (Putaran Mesin)', unit: 'putaran/menit (RPM)', desc: 'Berapa kali spindel berputar dalam waktu 1 menit.' },
                  { sym: 'd / D', name: 'Diameter Benda Kerja', unit: 'milimeter (mm)', desc: 'Ukuran garis tengah poros atau silinder benda kerja.' },
                  { sym: 'f', name: 'Feed Per Revolution (Gerak Makan)', unit: 'mm/putaran', desc: 'Berapa mm pahat bergeser maju setiap kali benda berputar 1 putaran.' },
                  { sym: 'F', name: 'Feed Speed (Kecepatan Pemakanan)', unit: 'mm/menit', desc: 'Kecepatan gerak maju eretan otomatis per menit: F = f × n.' },
                  { sym: 'a', name: 'Depth of Cut (Kedalaman Potong)', unit: 'milimeter (mm)', desc: 'Tebal sayatan radial pahat: a = (D0 - D1) / 2.' },
                  { sym: 'Tc', name: 'Machining Time (Waktu Sayat)', unit: 'menit atau detik', desc: 'Berapa lama waktu penyayatan aktif selama pemotongan berlangsung.' },
                  { sym: 'L', name: 'Panjang Pembubutan', unit: 'milimeter (mm)', desc: 'Panjang bagian poros yang harus disayat rata.' },
                  { sym: 'la', name: 'Jarak Awalan (Approach Distance)', unit: 'milimeter (mm)', desc: 'Jarak awalan sebelum pahat menyentuh benda kerja (2 - 4 mm).' },
                  { sym: 'α', name: 'Sudut Eretan Atas Tirus', unit: 'derajat (°)', desc: 'Sudut setengah tirus untuk memutar skala eretan atas.' }
                ].map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid #1e293b', background: rIdx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>{row.sym}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f8fafc' }}>{row.name}</td>
                    <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 600 }}>{row.unit}</td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};

export default LatheFormulaView;

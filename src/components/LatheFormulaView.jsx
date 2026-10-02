import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';

// Database Standar Kecepatan Potong (Cutting Speed Vc / Cs) untuk Mesin Bubut
export const CS_DATABASE = [
  {
    material: 'Baja Lunak / Karbon Rendah (St 37 / Mild Steel)',
    csHss: 25,
    csCarbide: 150,
    feedRough: '0.20 - 0.40',
    feedFinish: '0.08 - 0.15',
    coolant: 'Soluble Oil (Emulsi Putih)',
    desc: 'Kandungan karbon < 0.25%, ulet, mudah dibentuk, tatal bersambung.'
  },
  {
    material: 'Baja Karbon Sedang (St 45 / S45C / AISI 1045)',
    csHss: 20,
    csCarbide: 120,
    feedRough: '0.15 - 0.35',
    feedFinish: '0.06 - 0.12',
    coolant: 'Soluble Oil / Mineral Oil',
    desc: 'Kandungan karbon 0.35 - 0.50%, bahan umum untuk poros mesin, roda gigi, dan as.'
  },
  {
    material: 'Baja Karbon Tinggi & Paduan (St 60 / VCL / Tool Steel)',
    csHss: 15,
    csCarbide: 90,
    feedRough: '0.12 - 0.25',
    feedFinish: '0.05 - 0.10',
    coolant: 'Heavy Duty Cutting Oil',
    desc: 'Keras dan tahan aus, membutuhkan gaya potong tinggi dan pahat karbida berlapis TiAlN.'
  },
  {
    material: 'Besi Tuang / Besi Cor Kelabu (Cast Iron / FC 25)',
    csHss: 18,
    csCarbide: 110,
    feedRough: '0.20 - 0.45',
    feedFinish: '0.10 - 0.20',
    coolant: 'Kering (Dry) / Udara Bertekanan',
    desc: 'Getas, tatal berupa serbuk debu grafit. Tidak boleh disiram air agar tatal tidak membatu.'
  },
  {
    material: 'Aluminium & Paduannya (Al Alloy 6061 / Dural)',
    csHss: 80,
    csCarbide: 320,
    feedRough: '0.25 - 0.50',
    feedFinish: '0.08 - 0.18',
    coolant: 'Minyak Tanah (Kerosene) / Emulsi Ringan',
    desc: 'Logam non-ferro sangat lunak, kecepatan sayat sangat tinggi, rawan terbentuk Built-Up Edge.'
  },
  {
    material: 'Kuningan / Tembaga (Brass / Copper / Bronze)',
    csHss: 45,
    csCarbide: 220,
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
    coolant: 'Sulphur-based Extreme Pressure Oil',
    desc: 'Cepat mengeras saat terdeformasi (work-hardening). Sayatan harus mantap dan tidak boleh berhenti di tempat.'
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
  // Tab Navigasi:
  // 'spindle' (n & Vc), 'time' (F & Tc all ops), 'taper' (3 Metode Tirus), 'doc-mrr' (a & MRR), 'thread' (Ulir Metris), 'examples' (Contoh Soal Rinci), 'glossary' (Bank Rumus & Simbol)
  const [activeTab, setActiveTab] = useState('spindle');
  const [appliedNotice, setAppliedNotice] = useState(null);

  // 1. Spindle RPM State
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0);
  const [toolType, setToolType] = useState('carbide'); // 'hss' | 'carbide'
  const [calcDiameter, setCalcDiameter] = useState(initialDiameter);
  const [customCs, setCustomCs] = useState(null);

  // 2. Feeding & Time State (Turning, Facing, Grooving, Drilling, Threading)
  const [opCategory, setOpCategory] = useState('turning'); // 'turning' | 'facing' | 'drilling' | 'grooving' | 'threading'
  const [calcLength, setCalcLength] = useState(initialLength);
  const [calcFeedRev, setCalcFeedRev] = useState(0.15); // mm/putaran (f)
  const [calcSpindleRpm, setCalcSpindleRpm] = useState(currentRpm);
  const [safetyApproach, setSafetyApproach] = useState(2); // la (mm)
  const [safetyOverrun, setSafetyOverrun] = useState(1); // lu (mm)
  const [numPasses, setNumPasses] = useState(1); // i (frekuensi pemakanan)
  
  // Drilling specifics
  const [drillDiameter, setDrillDiameter] = useState(12);
  const [drillDepth, setDrillDepth] = useState(40);

  // Grooving specifics
  const [grooveDepth, setGrooveDepth] = useState(5);

  // Threading specifics
  const [threadPitch, setThreadPitch] = useState(2.0); // P (mm)
  const [threadLength, setThreadLength] = useState(40);
  const [threadPasses, setThreadPasses] = useState(6);

  // 3. Taper Turning State
  const [taperMode, setTaperMode] = useState('eretan'); // 'eretan' | 'tailstock' | 'konisitas'
  const [bigD, setBigD] = useState(initialDiameter);
  const [smallD, setSmallD] = useState(Math.max(10, initialDiameter - 12));
  const [taperL, setTaperL] = useState(45);
  const [totalWorkLength, setTotalWorkLength] = useState(initialLength);

  // 4. Depth of Cut & MRR State
  const [docRawD, setDocRawD] = useState(initialDiameter);
  const [docTargetD, setDocTargetD] = useState(Math.max(10, initialDiameter - 8));
  const [passesCount, setPassesCount] = useState(2);
  const [specificForceKc, setSpecificForceKc] = useState(2200); // N/mm² untuk baja

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
      setDocTargetD(Math.max(5, initialDiameter - 8));
    }
  }, [initialDiameter]);

  // ==========================================
  // MATHEMATICAL CALCULATIONS (EXACT & STEPPED)
  // ==========================================

  // 1. Spindle RPM
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

  // Cutting Speed Real jika memakai Gearbox terdekat
  const actualCsWithStandardRpm = ((Math.PI * validD * nearestStandardRpm) / 1000).toFixed(1);

  // 2. Feeding & Machining Time (Tc)
  const validF = Math.max(0.01, Number(calcFeedRev) || 0.1);
  const validRpmForTime = Math.max(1, Number(calcSpindleRpm) || 100);
  const feedSpeedF = (validF * validRpmForTime).toFixed(1); // mm/menit
  
  // Cut distance per operation
  let effectiveStrokeL = Number(calcLength) + Number(safetyApproach) + Number(safetyOverrun);
  let effectivePasses = Math.max(1, Number(numPasses) || 1);

  if (opCategory === 'facing') {
    effectiveStrokeL = (validD / 2) + Number(safetyApproach);
  } else if (opCategory === 'drilling') {
    const drillPointCone = 0.3 * Number(drillDiameter);
    effectiveStrokeL = Number(drillDepth) + drillPointCone + Number(safetyApproach);
  } else if (opCategory === 'grooving') {
    effectiveStrokeL = Number(grooveDepth) + Number(safetyApproach);
  } else if (opCategory === 'threading') {
    effectiveStrokeL = Number(threadLength) + Number(safetyApproach) + Number(safetyOverrun);
    effectivePasses = Math.max(1, Number(threadPasses) || 6);
  }

  // Waktu per sayatan & waktu total
  const timePerPassMin = (effectiveStrokeL / (validF * validRpmForTime));
  const timeTotalMin = opCategory === 'threading'
    ? (effectiveStrokeL / (Number(threadPitch) * validRpmForTime)) * effectivePasses
    : timePerPassMin * effectivePasses;

  const totalSeconds = Math.round(timeTotalMin * 60);
  const displayMinutes = Math.floor(totalSeconds / 60);
  const displaySeconds = totalSeconds % 60;

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
  const alphaMinInt = Math.floor((alphaDeg - alphaDegInt) * 60);
  const alphaSecInt = Math.round(((alphaDeg - alphaDegInt) * 60 - alphaMinInt) * 60);

  // Tailstock Offset
  const tailstockOffset = (tanAlpha * validTotalL).toFixed(2);

  // Konisitas (K)
  const conicityK = validTaperL > 0 ? (dDiff / validTaperL) : 0;
  const conicityRatio = conicityK > 0 ? Math.round(1 / conicityK) : 0;

  // 4. Depth of Cut (a), MRR & Power
  const validRawD = Number(docRawD) || 0;
  const validTargetD = Number(docTargetD) || 0;
  const totalDoc = Math.max(0, (validRawD - validTargetD) / 2);
  const docPerPass = (totalDoc / Math.max(1, parseInt(passesCount) || 1)).toFixed(2);

  // MRR = 1000 * Vc * f * a [mm³/menit]
  const mrrMm3Min = Math.round(1000 * effectiveCs * validF * Number(docPerPass));
  const mrrCm3Min = (mrrMm3Min / 1000).toFixed(1);

  // Estimasi Daya Potong Pc [kW] = (Fc * Vc) / (60000 * eta) dengan Fc = kc * a * f
  const cuttingForceFc = specificForceKc * Number(docPerPass) * validF; // Newton
  const powerPckW = ((cuttingForceFc * effectiveCs) / (60000 * 0.8)).toFixed(2); // efisiensi 80%

  // 5. Threading Metrics (Metris ISO)
  const curThreadPitch = Number(threadPitch) || 2.0;
  const threadDepthH1 = (0.6134 * curThreadPitch).toFixed(3); // kedalaman ulir luar
  const threadMinorD = (validBigD - (1.2268 * curThreadPitch)).toFixed(2);
  const threadPitchD = (validBigD - (0.6495 * curThreadPitch)).toFixed(2);
  const tapDrillD = (validBigD - curThreadPitch).toFixed(2);

  const handleApplySpindleRpm = (rpmVal) => {
    sound.playSuccess();
    if (onApplyRpm) onApplyRpm(rpmVal);
    setAppliedNotice(`Spindel mesin pemotong berhasil diatur ke ${rpmVal} RPM!`);
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1180px', margin: '0 auto', color: '#f8fafc', paddingBottom: '30px' }}>
      
      {/* HEADER BANNER UTAMA */}
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
                PANDUAN RUMUS & KALKULATOR PEMESINAN BUBUT
              </h2>
              <span style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                ISO 3685 & DIN 8589
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#93c5fd' }}>
              Kumpulan rumus matematis lengkap, penurunan variabel, diagram skematis teknik, contoh pengerjaan soal terperinci, dan kalkulator interaktif berstandar SMK Teknik Pemesinan.
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
            <span>⚙️ Lanjut ke Proses Pemotongan</span> →
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

      {/* BILAH SUB-TAB LENGKAP */}
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
          { id: 'spindle', label: '1. Putaran Spindel (n & Vc)', icon: '🔄' },
          { id: 'time', label: '2. Waktu Pemesinan (Tc Semua Operasi)', icon: '⏱️' },
          { id: 'taper', label: '3. Pembubutan Tirus (3 Metode)', icon: '📐' },
          { id: 'doc-mrr', label: '4. Tebal Sayat, MRR & Daya (a, Q, Pc)', icon: '⚡' },
          { id: 'thread', label: '5. Parameter Ulir Metris (M-Thread)', icon: '🔩' },
          { id: 'examples', label: '6. Contoh Soal & Langkah Rinci', icon: '📝' },
          { id: 'glossary', label: '7. Glosarium Simbol & Tabel ISO', icon: '📚' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { sound.playClick(); setActiveTab(tab.id); }}
            style={{
              flex: '1 1 150px',
              padding: '10px 12px',
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
      {/* TAB 1: PUTARAN SPINDEL (n & Vc) */}
      {/* ========================================================================= */}
      {activeTab === 'spindle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* PENJELASAN KONSEP & DIAGRAM TEKNIK */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔄</span> Prinsip Kecepatan Potong (Cutting Speed - Vc) dan Putaran Spindel (n)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center' }}>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>Kecepatan Potong (Vc atau Cs)</strong> adalah panjang keliling benda kerja yang disayat oleh ujung mata pahat dalam waktu satu menit (dinyatakan dalam satuan <strong>meter/menit</strong>).
                </p>
                <div style={{ background: 'rgba(2, 132, 199, 0.1)', borderLeft: '4px solid #38bdf8', padding: '10px 14px', borderRadius: '0 8px 8px 0', marginBottom: '10px' }}>
                  <strong>Mengapa ada angka 1000 pada rumus?</strong><br />
                  Kecepatan potong Vc bersatuan <em>meter</em>, sedangkan diameter benda kerja d diukur dalam <em>milimeter</em> (1 m = 1000 mm). Angka 1000 adalah faktor konversi agar satuannya konsisten!
                </div>
                <div style={{ color: '#93c5fd', fontSize: '0.84rem' }}>
                  • Jika diameter benda kerja semakin <strong>kecil</strong>, maka putaran mesin $n$ harus semakin <strong>tinggi</strong>.<br />
                  • Jika bahan benda kerja semakin <strong>keras</strong>, maka nilai $V_c$ semakin <strong>kecil</strong> sehingga $n$ diperlambat.
                </div>
              </div>

              {/* DIAGRAM SVG SKEMATIS PUTARAN SPINDEL */}
              <div style={{ background: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center' }}>
                <svg viewBox="0 0 420 180" style={{ width: '100%', maxHeight: '180px' }}>
                  {/* Spindle Chuck */}
                  <rect x="20" y="30" width="50" height="120" rx="4" fill="#334155" stroke="#64748b" strokeWidth="2" />
                  <rect x="25" y="45" width="40" height="25" fill="#475569" />
                  <rect x="25" y="110" width="40" height="25" fill="#475569" />
                  <text x="45" y="95" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">CHUCK</text>

                  {/* Workpiece Cylinder */}
                  <rect x="70" y="50" width="220" height="80" rx="2" fill="url(#metalGrad)" stroke="#38bdf8" strokeWidth="1.5" />
                  <defs>
                    <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="40%" stopColor="#94a3b8" />
                      <stop offset="70%" stopColor="#475569" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                  </defs>

                  {/* Center line (Sumbu Putar) */}
                  <line x1="10" y1="90" x2="310" y2="90" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="8 3 2 3" />
                  <text x="315" y="93" fill="#ef4444" fontSize="9" fontWeight="bold">Sumbu Putar</text>

                  {/* Rotation arrow */}
                  <path d="M 120 40 A 25 25 0 0 1 120 70" fill="none" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#arrow)" />
                  <text x="140" y="45" fill="#f59e0b" fontSize="11" fontWeight="bold">n (RPM)</text>

                  {/* Cutting Tool */}
                  <polygon points="210,130 225,155 245,155 240,130" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
                  <rect x="225" y="145" width="70" height="20" fill="#334155" stroke="#475569" />
                  <text x="260" y="158" fill="#ffffff" fontSize="9" fontWeight="bold">PAHAT</text>

                  {/* Dimension d */}
                  <line x1="295" y1="50" x2="295" y2="130" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="290" y1="50" x2="300" y2="50" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="290" y1="130" x2="300" y2="130" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="305" y="94" fill="#38bdf8" fontSize="12" fontWeight="bold">Ø d</text>

                  {/* Velocity Vector Vc */}
                  <line x1="210" y1="130" x2="170" y2="130" stroke="#10b981" strokeWidth="3" markerEnd="url(#greenArrow)" />
                  <text x="185" y="125" fill="#10b981" fontSize="11" fontWeight="bold">Vc (m/min)</text>
                </svg>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                  Diagram: Vektor kecepatan potong $V_c$ bersinggungan langsung dengan gerak putar $n$ pada diameter $d$
                </div>
              </div>
            </div>
          </div>

          {/* DUA KOLOM: INPUT PARAMETER VS PENJABARAN RUMUS LANGKAH DEMI LANGKAH */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            {/* KOLOM KIRI: INPUT PARAMETER */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 16px 0' }}>
                ⚙️ Masukkan Parameter Kerja Anda
              </h4>

              {/* Material Dropdown */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
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
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700
                  }}
                >
                  {CS_DATABASE.map((item, idx) => (
                    <option key={idx} value={idx}>{item.material}</option>
                  ))}
                </select>
                <div style={{ fontSize: '0.78rem', color: '#93c5fd', marginTop: '6px' }}>
                  ℹ️ {CS_DATABASE[selectedMaterialIdx].desc}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#10b981', marginTop: '3px' }}>
                  💧 Rekomendasi Coolant: <strong>{CS_DATABASE[selectedMaterialIdx].coolant}</strong>
                </div>
              </div>

              {/* Tool Type Selector */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                  Jenis Alat Potong / Pahat:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setToolType('hss'); setCustomCs(null); }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: toolType === 'hss' ? '2px solid #38bdf8' : '1px solid #334155',
                      background: toolType === 'hss' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                      color: toolType === 'hss' ? '#38bdf8' : '#94a3b8',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    HSS (Baja Cepat)<br />
                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Cs: {CS_DATABASE[selectedMaterialIdx].csHss} m/min</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setToolType('carbide'); setCustomCs(null); }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: toolType === 'carbide' ? '2px solid #10b981' : '1px solid #334155',
                      background: toolType === 'carbide' ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                      color: toolType === 'carbide' ? '#10b981' : '#94a3b8',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Karbida (Carbide Insert)<br />
                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Cs: {CS_DATABASE[selectedMaterialIdx].csCarbide} m/min</span>
                  </button>
                </div>
              </div>

              {/* Diameter Slider */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>
                    Diameter Benda Kerja (d):
                  </label>
                  <span style={{ fontSize: '1rem', color: '#38bdf8', fontWeight: 900 }}>Ø {calcDiameter} mm</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="120"
                  step="1"
                  value={calcDiameter}
                  onChange={(e) => setCalcDiameter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>

              {/* Cutting Speed Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>
                    Kecepatan Potong Efektif (Vc):
                  </label>
                  <span style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 800 }}>{effectiveCs} m/menit</span>
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
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>

            {/* KOLOM KANAN: PENJABARAN RUMUS MATEMATIS LANGKAH DEMI LANGKAH */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981', margin: '0 0 16px 0' }}>
                  🧮 Penjabaran Matematis Terbuka (Step-by-Step)
                </h4>

                {/* LANGKAH 1: RUMUS UMUM */}
                <div style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px dashed #0284c7', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 800 }}>LANGKAH 1: RUMUS DASAR SPINDEL</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#38bdf8', margin: '6px 0', fontFamily: 'monospace' }}>
                    n = (1000 × Vc) / (π × d)
                  </div>
                </div>

                {/* LANGKAH 2: SUBSTITUSI NILAI */}
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed #d97706', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#fde68a', textTransform: 'uppercase', fontWeight: 800 }}>LANGKAH 2: SUBSTITUSI ANGKA NYATA</div>
                  <div style={{ fontSize: '0.95rem', color: '#f8fafc', margin: '6px 0', lineHeight: 1.6, fontFamily: 'monospace' }}>
                    n = (1000 × {effectiveCs}) / (3.1416 × {calcDiameter})<br />
                    n = {1000 * effectiveCs} / {(Math.PI * validD).toFixed(2)}<br />
                    n = <strong style={{ color: '#38bdf8', fontSize: '1.1rem' }}>{theoreticalRpmExact.toFixed(2)} RPM</strong>
                  </div>
                </div>

                {/* LANGKAH 3: PEMILIHAN GEAR MESIN */}
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid #10b981', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 800 }}>LANGKAH 3: PENYESUAIAN GEARBOX BENGKEL</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>{nearestStandardRpm} RPM</div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Tingkat gigi mesin konvensional terdekat</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Vc Aktual Lapangan:</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>{actualCsWithStandardRpm} m/min</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOMBOL TERAPKAN */}
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
                    boxShadow: '0 6px 20px rgba(2, 132, 199, 0.4)',
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
      {/* TAB 2: WAKTU PEMESINAN (Tc SEMUA OPERASI) */}
      {/* ========================================================================= */}
      {activeTab === 'time' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* PEMILIHAN KATEGORI OPERASI */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '10px' }}>
              PILIH OPERASI PEMBUBUTAN:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              {[
                { id: 'turning', name: '1. Bubut Memanjang (Turning)', icon: '📏' },
                { id: 'facing', name: '2. Bubut Muka (Facing)', icon: '🪓' },
                { id: 'drilling', name: '3. Pengeboran Sumbu (Drilling)', icon: '🎯' },
                { id: 'grooving', name: '4. Bubut Alur (Grooving)', icon: '⛏️' },
                { id: 'threading', name: '5. Bubut Ulir (Threading)', icon: '🔩' }
              ].map(op => (
                <button
                  key={op.id}
                  onClick={() => { sound.playClick(); setOpCategory(op.id); }}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: opCategory === op.id ? '2px solid #38bdf8' : '1px solid #334155',
                    background: opCategory === op.id ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                    color: opCategory === op.id ? '#38bdf8' : '#94a3b8',
                    fontWeight: opCategory === op.id ? 800 : 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {op.icon} {op.name}
                </button>
              ))}
            </div>
          </div>

          {/* DUA KOLOM: INPUT OPERASI VS HASIL FORMULA DENGAN DIAGRAM */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            {/* INPUT PANEL SESUAI OPERASI */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 16px 0' }}>
                ⚙️ Parameter Operasi {opCategory.toUpperCase()}
              </h4>

              {/* Panjang Pemotongan (L) untuk Turning */}
              {opCategory === 'turning' && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Panjang Pembubutan (L):</label>
                    <span style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 800 }}>{calcLength} mm</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    value={calcLength}
                    onChange={(e) => setCalcLength(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8' }}
                  />
                </div>
              )}

              {/* Kedalaman Bor untuk Drilling */}
              {opCategory === 'drilling' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Bor (d):</label>
                    <input
                      type="number"
                      value={drillDiameter}
                      onChange={(e) => setDrillDiameter(Number(e.target.value))}
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Kedalaman Bor (l):</label>
                    <input
                      type="number"
                      value={drillDepth}
                      onChange={(e) => setDrillDepth(Number(e.target.value))}
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px' }}
                    />
                  </div>
                </div>
              )}

              {/* Kedalaman Alur untuk Grooving */}
              {opCategory === 'grooving' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Kedalaman Alur (h = (D - d)/2):</label>
                  <input
                    type="number"
                    value={grooveDepth}
                    onChange={(e) => setGrooveDepth(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                  />
                </div>
              )}

              {/* Ulir Kisar untuk Threading */}
              {opCategory === 'threading' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Kisar / Pitch (P):</label>
                    <input
                      type="number"
                      step="0.25"
                      value={threadPitch}
                      onChange={(e) => setThreadPitch(Number(e.target.value))}
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>Jumlah Sayat (i):</label>
                    <input
                      type="number"
                      min="2"
                      max="15"
                      value={threadPasses}
                      onChange={(e) => setThreadPasses(Number(e.target.value))}
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px' }}
                    />
                  </div>
                </div>
              )}

              {/* Gerak Makan (f) */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Gerak Makan (f):</label>
                  <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800 }}>{calcFeedRev} mm/putaran</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.02"
                  value={calcFeedRev}
                  onChange={(e) => setCalcFeedRev(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              {/* Spindle RPM */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Putaran Spindel Mesin (n):</label>
                <input
                  type="number"
                  value={calcSpindleRpm}
                  onChange={(e) => setCalcSpindleRpm(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              {/* Jarak Awalan & Bebas (la & lu) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Jarak Awalan (la):</label>
                  <input
                    type="number"
                    value={safetyApproach}
                    onChange={(e) => setSafetyApproach(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '6px', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Jarak Bebas (lu):</label>
                  <input
                    type="number"
                    value={safetyOverrun}
                    onChange={(e) => setSafetyOverrun(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '6px', borderRadius: '6px' }}
                  />
                </div>
              </div>
            </div>

            {/* HASIL RUMUS & LANGKAH PENGERJAAN */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', margin: '0 0 16px 0' }}>
                  ⏱️ Rumus & Perhitungan Waktu Pemesinan (Tc)
                </h4>

                {/* FORMULA SPESIFIK */}
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed #f59e0b', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#fde68a', fontWeight: 800 }}>RUMUS BAKU:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24', margin: '6px 0', fontFamily: 'monospace' }}>
                    {opCategory === 'turning' && 'Tc = (L + la + lu) / (f × n) × i'}
                    {opCategory === 'facing' && 'Tc = (d/2 + la) / (f × n)'}
                    {opCategory === 'drilling' && 'Tc = (l + 0.3d + la) / (f × n)'}
                    {opCategory === 'grooving' && 'Tc = (h + la) / (f × n)'}
                    {opCategory === 'threading' && 'Tc = (L + la + lu) / (P × n) × i'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {opCategory === 'turning' && 'L = panjang benda, la = jarak awalan (2-4 mm), lu = jarak bebas (0-2 mm), i = jumlah sayatan.'}
                    {opCategory === 'facing' && 'Pahat hanya menyayat dari diameter terluar sampai ke titik pusat (jari-jari = d/2).'}
                    {opCategory === 'drilling' && '0.3d adalah tinggi konus mata bor bersudut 118° agar lubang silinder terbentuk penuh.'}
                    {opCategory === 'grooving' && 'h adalah selisih jari-jari alur: h = (D - d) / 2.'}
                    {opCategory === 'threading' && 'Pada pembubutan ulir, gerak makan per putaran sama persis dengan kisar ulir (P).'}
                  </div>
                </div>

                {/* SUBSTITUSI NUMERIK */}
                <div style={{ background: '#1e293b', borderRadius: '10px', padding: '12px', fontSize: '0.85rem', color: '#f8fafc', fontFamily: 'monospace', marginBottom: '14px' }}>
                  • Kecepatan Makan F = f × n = {validF} × {validRpmForTime} = <strong style={{ color: '#10b981' }}>{feedSpeedF} mm/menit</strong><br />
                  • Panjang Lintasan Total = <strong style={{ color: '#38bdf8' }}>{effectiveStrokeL.toFixed(1)} mm</strong>
                </div>

                {/* HASIL DISPLAY WAKTU */}
                <div style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1.5px solid #0284c7', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 800 }}>TOTAL WAKTU PEMESINAN (Tc):</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>
                    {displayMinutes > 0 ? `${displayMinutes} menit ` : ''}{displaySeconds} detik
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    ({timeTotalMin.toFixed(2)} menit total waktu aktif pahat)
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PEMBUBUTAN TIRUS (3 METODE LENGKAP) */}
      {/* ========================================================================= */}
      {activeTab === 'taper' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* EXPLANATION & SVG SCHEMATIC */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 12px 0' }}>
              📐 Tiga Metode Pembubutan Tirus (Taper Turning)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center' }}>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>Tirus (Taper)</strong> adalah perubahan diameter secara proporsional dan teratur sepanjang sumbu poros. Terdapat 3 metode standar pengerjaan di mesin bubut konvensional:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
                  <div><strong>1. Menggeser Eretan Atas (Compound Slide):</strong> Cocok untuk tirus pendek dengan sudut tirus sembarang/besar. Digerakkan secara manual.</div>
                  <div><strong>2. Menggeser Kepala Lepas (Offset Tailstock):</strong> Cocok untuk tirus panjang dengan sudut landai (&lt; 8°). Dapat menggunakan pemakanan otomatis (*auto-feed*).</div>
                  <div><strong>3. Mistar Tirus (Taper Attachment):</strong> Memanfaatkan penuntun sudut di belakang bed mesin tanpa melepas kelurusan tailstock.</div>
                </div>
              </div>

              {/* DIAGRAM SVG TIRUS */}
              <div style={{ background: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <svg viewBox="0 0 420 180" style={{ width: '100%', maxHeight: '180px' }}>
                  {/* Center line */}
                  <line x1="20" y1="90" x2="400" y2="90" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="8 3 2 3" />
                  
                  {/* Tapered workpiece profile */}
                  <polygon points="50,30 250,55 350,55 350,125 250,125 50,150" fill="url(#metalGrad)" stroke="#38bdf8" strokeWidth="2" />
                  
                  {/* Extension lines for angle alpha */}
                  <line x1="50" y1="55" x2="250" y2="55" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                  
                  {/* Angle arc */}
                  <path d="M 120 55 A 70 70 0 0 1 115 39" fill="none" stroke="#f59e0b" strokeWidth="2" />
                  <text x="130" y="47" fill="#f59e0b" fontSize="12" fontWeight="bold">α</text>

                  {/* Dimension D */}
                  <line x1="40" y1="30" x2="40" y2="150" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="35" y1="30" x2="45" y2="30" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="35" y1="150" x2="45" y2="150" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="25" y="95" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="end">Ø D</text>

                  {/* Dimension d */}
                  <line x1="260" y1="55" x2="260" y2="125" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="255" y1="55" x2="265" y2="55" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="255" y1="125" x2="265" y2="125" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="270" y="95" fill="#38bdf8" fontSize="11" fontWeight="bold">Ø d</text>

                  {/* Dimension l (panjang tirus) */}
                  <line x1="50" y1="165" x2="250" y2="165" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="50" y1="160" x2="50" y2="170" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="250" y1="160" x2="250" y2="170" stroke="#10b981" strokeWidth="1.5" />
                  <text x="150" y="177" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">l (panjang tirus)</text>

                  {/* Dimension L (panjang total) */}
                  <line x1="50" y1="15" x2="350" y2="15" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="200" y="10" fill="#cbd5e1" fontSize="10" textAnchor="middle">L total poros</text>
                </svg>
              </div>
            </div>
          </div>

          {/* INPUT & HASIL METODE TIRUS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            {/* INPUT PANEL */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 16px 0' }}>
                ⚙️ Ukuran Benda Tirus dari Gambar Kerja
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

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Panjang Bidang Tirus (l):</label>
                <input
                  type="number"
                  value={taperL}
                  onChange={(e) => setTaperL(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Panjang Total Poros Benda (L total):</label>
                <input
                  type="number"
                  value={totalWorkLength}
                  onChange={(e) => setTotalWorkLength(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>
            </div>

            {/* HASIL 3 METODE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* METODE 1: ERETAN ATAS */}
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1.5px solid #0284c7', borderRadius: '14px', padding: '18px' }}>
                <div style={{ fontSize: '0.76rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                  METODE 1: PENGGESERAN ERETAN ATAS (COMPOUND SLIDE)
                </div>
                <div style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: '4px 0' }}>
                  Rumus: <strong>tg α = (D - d) / (2 × l)</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  tg α = ({validBigD} - {validSmallD}) / (2 × {validTaperL}) = {dDiff} / {2 * validTaperL} = <strong style={{ color: '#38bdf8' }}>{tanAlpha.toFixed(4)}</strong>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '6px 0' }}>
                  α = {alphaDegFixed}° <span style={{ fontSize: '1.1rem', color: '#93c5fd' }}>({alphaDegInt}° {alphaMinInt}' {alphaSecInt}")</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  🛠️ <strong>Penyetelan:</strong> Kendurkan dua baut pengikat eretan atas, putar piringan skala eretan sebesar <strong>{alphaDegFixed}°</strong>, lalu kencangkan kembali bautnya.
                </div>
              </div>

              {/* METODE 2: GESER KEPALA LEPAS */}
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1.5px solid #d97706', borderRadius: '14px', padding: '18px' }}>
                <div style={{ fontSize: '0.76rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>
                  METODE 2: PENGGESERAN KEPALA LEPAS (OFFSET TAILSTOCK)
                </div>
                <div style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: '4px 0' }}>
                  Rumus: <strong>S = ((D - d) / (2 × l)) × L total</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  S = {tanAlpha.toFixed(4)} × {validTotalL}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '6px 0' }}>
                  S = {tailstockOffset} mm
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  🛠️ <strong>Penyetelan:</strong> Geser baut penyetel horizontal di bagian belakang badan kepala lepas sejauh <strong>{tailstockOffset} mm</strong>. Pasang benda di antara dua senter dengan pembawa (*lathe dog*).
                </div>
              </div>

              {/* METODE 3: KONISITAS */}
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 800 }}>
                  KONISITAS (CONICITY K):
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                  K = (D - d) / l = 1 : {conicityRatio} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({(conicityK * 100).toFixed(1)}%)</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TEBAL SAYAT, MRR & ESTIMASI DAYA POTONG */}
      {/* ========================================================================= */}
      {activeTab === 'doc-mrr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 12px 0' }}>
              ⚡ Tebal Sayat (a), Laju Pelepasan Geram (MRR), dan Daya Mesin (Pc)
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              <strong>Depth of Cut (a)</strong> adalah tebal lapisan logam yang disayat pahat dalam satu lintasan. Dari parameter ini, kita dapat menghitung volume logam yang dibuang per menit (<strong>Material Removal Rate - MRR</strong>) dan konsumsi daya motor listrik mesin bubut agar motor tidak kelebihan beban (*overload*).
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            {/* INPUT PANEL */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 16px 0' }}>
                ⚙️ Parameter Reduksi Diameter
              </h4>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Awal (D0):</label>
                <input
                  type="number"
                  value={docRawD}
                  onChange={(e) => setDocRawD(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Akhir (D1):</label>
                <input
                  type="number"
                  value={docTargetD}
                  onChange={(e) => setDocTargetD(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Rencana Jumlah Frekuensi Sayatan (Passes):</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={passesCount}
                  onChange={(e) => setPassesCount(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Tekanan Potong Spesifik Bahan (kc):</label>
                <input
                  type="number"
                  value={specificForceKc}
                  onChange={(e) => setSpecificForceKc(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px' }}>
                  Standar: Baja St 37 ≈ 1800, Baja St 45 ≈ 2200, Cast Iron ≈ 1200 N/mm²
                </div>
              </div>
            </div>

            {/* HASIL DISPLAY MRR & POWER */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* TEBAL SAYAT (a) */}
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px dashed #38bdf8', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 800 }}>KEDALAMAN POTONG RADIAL (a):</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>
                  a = (D0 - D1) / 2 = {docPerPass} mm / sayatan
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Total selisih jari-jari: {totalDoc.toFixed(2)} mm dibagi dalam {passesCount} kali pemakanan.
                </div>
              </div>

              {/* LAJU PELEPASAN GERAM (MRR) */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px dashed #10b981', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '0.74rem', color: '#6ee7b7', fontWeight: 800 }}>LAJU PELEPASAN GERAM (MRR / Q):</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>
                  Q = {mrrCm3Min} cm³/menit
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                  Rumus: Q = Vc × f × a = {effectiveCs} × {validF} × {docPerPass} = {mrrMm3Min.toLocaleString()} mm³/menit
                </div>
              </div>

              {/* ESTIMASI DAYA POTONG */}
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px dashed #f59e0b', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '0.74rem', color: '#fde68a', fontWeight: 800 }}>ESTIMASI KEBUTUHAN DAYA MOTOR (Pc):</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', margin: '4px 0' }}>
                  Pc ≈ {powerPckW} kW <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>({(Number(powerPckW) * 1.341).toFixed(2)} HP)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Gaya potong utama tangensial Fc = {Math.round(cuttingForceFc)} Newton. Pastikan motor mesin bubut Anda memiliki kapasitas di atas angka ini.
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PARAMETER ULIR METRIS (M-THREAD) */}
      {/* ========================================================================= */}
      {activeTab === 'thread' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 12px 0' }}>
              🔩 Standar Geometri & Pembubutan Ulir Segitiga Metris (ISO Metric)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center' }}>
              <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 10px 0' }}>
                  Ulir Metris memiliki sudut puncak profil <strong>60°</strong> dan bentuk puncak/lembah yang di-radiuskan. Pembubutan ulir metris pada mesin bubut konvensional disinkronkan melalui <strong>poros transportir (lead screw)</strong>.
                </p>
                <div style={{ background: 'rgba(2, 132, 199, 0.1)', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #38bdf8', fontSize: '0.84rem' }}>
                  • <strong>Kisar (Pitch - P):</strong> Jarak antara dua puncak ulir yang berdekatan.<br />
                  • <strong>Kedalaman Sayat Ulir Luar:</strong> H1 = 0.6134 × P<br />
                  • <strong>Diameter Lubang Bor Tap:</strong> d_bor = D - P
                </div>
              </div>

              {/* DIAGRAM SVG ULIR 60 DERAJAT */}
              <div style={{ background: '#020617', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', textAlign: 'center' }}>
                <svg viewBox="0 0 420 160" style={{ width: '100%', maxHeight: '160px' }}>
                  {/* Thread teeth profile */}
                  <path d="M 30,120 L 70,40 L 110,120 L 150,40 L 190,120 L 230,40 L 270,120 L 310,40 L 350,120 L 390,40" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                  
                  {/* Major Diameter Line */}
                  <line x1="20" y1="40" x2="400" y2="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />
                  <text x="405" y="44" fill="#f59e0b" fontSize="10" fontWeight="bold">D (Major)</text>

                  {/* Minor Diameter Line */}
                  <line x1="20" y1="120" x2="400" y2="120" stroke="#10b981" strokeWidth="1" strokeDasharray="4 2" />
                  <text x="405" y="124" fill="#10b981" fontSize="10" fontWeight="bold">d1 (Minor)</text>

                  {/* 60 deg angle */}
                  <path d="M 135,70 A 20 20 0 0 1 165,70" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="150" y="65" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">60°</text>

                  {/* Pitch Dimension P */}
                  <line x1="70" y1="25" x2="150" y2="25" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="70" y1="20" x2="70" y2="30" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="150" y1="20" x2="150" y2="30" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="110" y="20" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">Pitch (P)</text>

                  {/* Height H1 */}
                  <line x1="240" y1="40" x2="240" y2="120" stroke="#a855f7" strokeWidth="1.5" />
                  <text x="245" y="85" fill="#a855f7" fontSize="10" fontWeight="bold">H1 = 0.6134 P</text>
                </svg>
              </div>
            </div>
          </div>

          {/* KALKULATOR ELEMEN ULIR */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 16px 0' }}>
                ⚙️ Hitung Dimensi Ulir Metris
              </h4>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Diameter Nominal Baut (D):</label>
                <input
                  type="number"
                  value={bigD}
                  onChange={(e) => setBigD(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Kisar Ulir (Pitch P dalam mm):</label>
                <input
                  type="number"
                  step="0.25"
                  value={threadPitch}
                  onChange={(e) => setThreadPitch(Number(e.target.value))}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px', borderRadius: '6px', marginTop: '4px' }}
                />
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                  Contoh standar: M10 × 1.5, M12 × 1.75, M16 × 2.0, M20 × 2.5
                </div>
              </div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981', margin: 0 }}>
                📋 Hasil Parameter Geometri Ulir M{bigD} × {threadPitch}
              </h4>

              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>Kedalaman Ulir Luar (H1):</span>
                <strong style={{ color: '#38bdf8' }}>{threadDepthH1} mm</strong>
              </div>

              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>Diameter Inti / Minor (d1):</span>
                <strong style={{ color: '#10b981' }}>Ø {threadMinorD} mm</strong>
              </div>

              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>Diameter Tusuk / Pitch (d2):</span>
                <strong style={{ color: '#f59e0b' }}>Ø {threadPitchD} mm</strong>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.84rem', color: '#6ee7b7' }}>Diameter Bor Tap Mur (D - P):</span>
                <strong style={{ color: '#ffffff', fontSize: '1.05rem' }}>Ø {tapDrillD} mm</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONTOH SOAL & LANGKAH PENGERJAAN DETAIL */}
      {/* ========================================================================= */}
      {activeTab === 'examples' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 10px 0' }}>
              📝 Contoh Soal Penerapan Bengkel & Langkah Penyelesaian Rinci
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0 }}>
              Pelajari contoh kasus nyata pembubutan di bawah ini untuk memahami secara mendalam alur penerapan rumus dari lembar kerja (*jobsheet*) ke mesin bubut nyata.
            </p>
          </div>

          {[
            {
              title: 'KASUS 1: Pembubutan Rata Poros Baja S45C (Mencari n, F, dan Tc)',
              problem: 'Sebuah poros pejal dari bahan Baja Karbon Sedang St 45 (S45C) berdiameter Ø40 mm akan dibubut rata menjadi Ø36 mm sepanjang 120 mm menggunakan pahat Karbida. Kecepatan potong Vc yang direkomendasikan adalah 120 m/menit dan gerak makan f = 0.15 mm/putaran. Hitunglah putaran spindel teoritis, pilih putaran gearbox mesin yang sesuai, lalu hitung kecepatan pemakanan F dan waktu pemesinan Tc bila jarak awalan la = 2 mm!',
              steps: [
                {
                  step: 'Langkah 1: Menuliskan Besaran yang Diketahui (Data Awal)',
                  content: '• Diameter benda (d) = 40 mm\n• Kecepatan potong (Vc) = 120 m/menit\n• Panjang pembubutan (L) = 120 mm\n• Gerak makan (f) = 0.15 mm/putaran\n• Jarak awalan (la) = 2 mm'
                },
                {
                  step: 'Langkah 2: Menghitung Putaran Spindel Teoritis (n)',
                  content: 'Gunakan rumus:\nn = (1000 × Vc) / (π × d)\nn = (1000 × 120) / (3.1416 × 40)\nn = 120.000 / 125.66 = 954.93 RPM'
                },
                {
                  step: 'Langkah 3: Menentukan Putaran Mesin Nyata (Gearbox Selection)',
                  content: 'Tingkatan putaran gearbox mesin yang tersedia: 600, 750, 900, 1200 RPM.\nPutaran 954.93 RPM disetel ke tingkat aman terdekat di bawahnya yaitu: n = 900 RPM.'
                },
                {
                  step: 'Langkah 4: Menghitung Kecepatan Pemakanan (F)',
                  content: 'F = f × n = 0.15 mm/put × 900 RPM = 135 mm/menit.'
                },
                {
                  step: 'Langkah 5: Menghitung Waktu Pemesinan (Tc)',
                  content: 'Tc = (L + la) / F\nTc = (120 + 2) / 135 = 122 / 135 = 0.903 menit\nDalam detik: 0.903 × 60 = 54.2 detik (sekitar 54 detik).'
                }
              ],
              conclusion: 'Setel tuas spindel mesin ke 900 RPM. Eretan otomatis akan bergerak 135 mm/menit dan proses sayatan selesai dalam waktu 54 detik.'
            },
            {
              title: 'KASUS 2: Pembubutan Tirus Poros Konis (Mencari Sudut Eretan Atas α dan Geser S)',
              problem: 'Sebuah poros tirus memiliki diameter terbesar D = 48 mm, diameter terkecil d = 36 mm, panjang bidang tirus l = 40 mm, dan panjang keseluruhan poros L total = 160 mm. Tentukan sudut pergeseran eretan atas (α) dan tentukan pula jarak pergeseran kepala lepas (S)!',
              steps: [
                {
                  step: 'Langkah 1: Menuliskan Besaran yang Diketahui',
                  content: '• D = 48 mm, d = 36 mm\n• Panjang tirus (l) = 40 mm\n• Panjang total poros (L total) = 160 mm'
                },
                {
                  step: 'Langkah 2: Menghitung Sudut Eretan Atas (α)',
                  content: 'tg α = (D - d) / (2 × l)\ntg α = (48 - 36) / (2 × 40) = 12 / 80 = 0.15\nα = arctan(0.15) = 8.53°\nKonversi desimal ke menit: 0.53° × 60 = 31.8\' ≈ 32\'\nMaka sudut eretan atas: α = 8° 32\'.'
                },
                {
                  step: 'Langkah 3: Menghitung Pergeseran Kepala Lepas (S)',
                  content: 'S = ((D - d) / (2 × l)) × L total\nS = tg α × L total\nS = 0.15 × 160 mm = 24 mm.'
                }
              ],
              conclusion: 'Jika menggunakan eretan atas, putar eretan 8° 32\'. Jika dibubut di antara dua senter, geser alas kepala lepas sebesar 24 mm.'
            },
            {
              title: 'KASUS 3: Pembubutan Muka (Facing) & Pengeboran Sumbu (Drilling)',
              problem: 'Batang silinder Ø50 mm akan diratakan mukanya (facing) dari diameter luar sampai ke pusat senter dengan n = 600 RPM dan f = 0.12 mm/putaran. Setelah itu dilakukan pengeboran lubang awal dengan mata bor Ø12 mm sedalam 35 mm dengan n = 800 RPM dan f = 0.10 mm/putaran. Berapa waktu pengerjaan masing-masing?',
              steps: [
                {
                  step: 'Langkah 1: Waktu Pembubutan Muka (Facing)',
                  content: 'Panjang lintasan facing adalah jari-jari: r = d/2 = 50/2 = 25 mm.\nTambahkan jarak awalan la = 2 mm.\nF_facing = f × n = 0.12 × 600 = 72 mm/menit.\nTc_facing = (25 + 2) / 72 = 27 / 72 = 0.375 menit (22.5 detik).'
                },
                {
                  step: 'Langkah 2: Waktu Pengeboran Sumbu (Drilling)',
                  content: 'Sudut mata bor 118° menyumbang ujung kerucut sebesar 0.3 × d_bor:\n0.3 × 12 mm = 3.6 mm.\nTotal kedalaman: l_total = 35 + 3.6 + 2 (awalan) = 40.6 mm.\nF_drill = 0.10 × 800 = 80 mm/menit.\nTc_drill = 40.6 / 80 = 0.5075 menit (30.4 detik).'
                }
              ],
              conclusion: 'Penyayatan muka membutuhkan waktu 23 detik, dan pengeboran sumbu membutuhkan waktu 30 detik.'
            }
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '22px' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', marginBottom: '10px' }}>
                {item.title}
              </div>
              <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '14px' }}>
                <strong>Pertanyaan Soal:</strong><br />
                {item.problem}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                {item.steps.map((st, sIdx) => (
                  <div key={sIdx} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>{st.step}</div>
                    <div style={{ fontSize: '0.84rem', color: '#f8fafc', whiteSpace: 'pre-line', marginTop: '4px', lineHeight: 1.5, fontFamily: 'monospace' }}>
                      {st.content}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '12px', borderRadius: '8px', fontSize: '0.84rem', color: '#6ee7b7' }}>
                💡 <strong>Kesimpulan Bengkel:</strong> {item.conclusion}
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
              📚 Glosarium Lambang, Besaran & Satuan Standar ISO Permesinan
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0 }}>
              Daftar referensi lambang internasional yang wajib dipahami oleh siswa SMK dan juru bubut teknik mesin.
            </p>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#1e293b', borderBottom: '2px solid #38bdf8', color: '#f8fafc' }}>
                  <th style={{ padding: '12px 16px' }}>Simbol</th>
                  <th style={{ padding: '12px 16px' }}>Nama Besaran</th>
                  <th style={{ padding: '12px 16px' }}>Satuan</th>
                  <th style={{ padding: '12px 16px' }}>Definisi & Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { sym: 'Vc (Cs)', name: 'Cutting Speed (Kecepatan Potong)', unit: 'meter/menit (m/min)', desc: 'Kecepatan keliling benda kerja yang dilalui ujung mata potong.' },
                  { sym: 'n', name: 'Revolutions Per Minute (Putaran Spindel)', unit: 'putaran/menit (RPM)', desc: 'Frekuensi putaran poros utama yang menjepit benda kerja.' },
                  { sym: 'd / D', name: 'Diameter Benda Kerja', unit: 'milimeter (mm)', desc: 'Ukuran garis tengah silinder benda kerja (luar atau dalam).' },
                  { sym: 'f', name: 'Feed Per Revolution (Gerak Makan)', unit: 'mm/putaran', desc: 'Pergeseran jarak maju pahat pada setiap satu putaran penuh spindel.' },
                  { sym: 'F (Vf)', name: 'Feed Speed (Kecepatan Pemakanan)', unit: 'mm/menit', desc: 'Perpindahan linier pahat per satuan menit (F = f × n).' },
                  { sym: 'a', name: 'Depth of Cut (Kedalaman Sayat)', unit: 'milimeter (mm)', desc: 'Tebal penyayatan radial pahat ke dalam benda: a = (D0 - D1)/2.' },
                  { sym: 'Tc (Tm)', name: 'Machining Time (Waktu Pemesinan)', unit: 'menit atau detik', desc: 'Durasi waktu penyayatan aktif selama pemotongan berlangsung.' },
                  { sym: 'L', name: 'Panjang Bidang Sayat', unit: 'milimeter (mm)', desc: 'Panjang bagian benda kerja yang harus disayat rata.' },
                  { sym: 'la', name: 'Jarak Awalan (Approach Distance)', unit: 'milimeter (mm)', desc: 'Jarak awal pahat sebelum menyentuh benda (standar 2 - 4 mm).' },
                  { sym: 'lu', name: 'Jarak Bebas (Overrun Distance)', unit: 'milimeter (mm)', desc: 'Kelebihan lintasan pahat setelah selesai menyayat (0 - 2 mm).' },
                  { sym: 'α', name: 'Sudut Kemiringan Tirus', unit: 'derajat (°)', desc: 'Sudut setengah tirus untuk penyetelan eretan atas: tg α = (D-d)/(2l).' },
                  { sym: 'S', name: 'Offset Kepala Lepas', unit: 'milimeter (mm)', desc: 'Jarak penggeseran badan tailstock melintang sumbu mesin.' },
                  { sym: 'Q (MRR)', name: 'Material Removal Rate', unit: 'cm³/menit atau mm³/menit', desc: 'Volume gram/tatal yang diproduksi per satuan waktu.' },
                  { sym: 'P', name: 'Kisar Ulir (Thread Pitch)', unit: 'milimeter (mm)', desc: 'Jarak puncak ke puncak ulir bertetangga pada ulir metris.' }
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

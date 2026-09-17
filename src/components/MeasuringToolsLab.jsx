import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import { useAccessibility } from '../context/AccessibilityContext';

const MeasuringToolsLab = ({ addXP = () => {}, addMissionCompleted = () => {} }) => {
  const [activeTool, setActiveTool] = useState('vernier'); // vernier, micrometer, height, dial, feeler, block, quiz
  const [activeTab, setActiveTab] = useState('simulator'); // simulator, theory, sop
  
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
  const [microValue, setMicroValue] = useState(7.82); // in mm (0 to 25)
  const [microWorkpiece, setMicroWorkpiece] = useState('bearing-ball');
  const [microReadingMode, setMicroReadingMode] = useState('standard'); // 'standard' or 'simple' // bearing-ball, sheet-metal, drill-bit, none
  const [showMicroReadout, setShowMicroReadout] = useState(true);
  const [isRatchetClicking, setIsRatchetClicking] = useState(false);

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

  // Audio Narator Aksesibilitas & Inklusi
  const { speakText, stopSpeech, isSpeaking, currentNarrativeTitle } = useAccessibility();

  const getMeasuringNarration = () => {
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
  const microWholeMm = Math.floor(microValue);
  const microFraction = parseFloat((microValue - microWholeMm).toFixed(2));
  const microHalfMm = (microReadingMode === 'standard' && microFraction >= 0.5) ? 0.5 : 0.0;
  const microThimbleValue = microReadingMode === 'standard' 
    ? parseFloat((microFraction - microHalfMm).toFixed(2)) 
    : microFraction;
  const microThimbleDivisions = Math.round(microThimbleValue * 100);
  const microMainScale = microReadingMode === 'standard' ? (microWholeMm + microHalfMm) : microWholeMm;
  const microNoniusScale = parseFloat((microThimbleDivisions * 0.01).toFixed(2));

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

      {/* INSTRUMENT NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: 'var(--bg-card)',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'vernier', name: 'Jangka Sorong', icon: '📏', res: '0.05 / 0.02 mm' },
          { id: 'micrometer', name: 'Mikrometer Sekrup', icon: '🔬', res: '0.01 mm' },
          { id: 'height', name: 'Vernier Height Gauge', icon: '📐', res: '0.02 mm' },
          { id: 'dial', name: 'Dial Indikator', icon: '⏱️', res: '0.01 mm / TIR' },
          { id: 'feeler', name: 'Feeler Gauge', icon: '🪒', res: 'Celah Presisi' },
          { id: 'block', name: 'Gauge Block', icon: '🧱', res: 'Master Kalibrasi' },
          { id: 'quiz', name: 'Kuis Asesmen Membaca', icon: '🏆', res: 'XP & Evaluasi' }
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => {
              sound.playClick();
              setActiveTool(tool.id);
            }}
            style={{
              flex: '1 0 auto',
              padding: '12px 16px',
              borderRadius: '8px',
              border: activeTool === tool.id ? '1.5px solid #10b981' : '1px solid transparent',
              background: activeTool === tool.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTool === tool.id ? '#047857' : '#334155',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontWeight: activeTool === tool.id ? 800 : 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
          >
            <div style={{ fontSize: '1.2rem' }}>{tool.icon}</div>
            <div>{tool.name}</div>
            <div style={{ fontSize: '0.68rem', color: activeTool === tool.id ? '#047857' : '#64748b', fontWeight: 600 }}>{tool.res}</div>
          </button>
        ))}
      </div>

      {/* SUB-TAB SELECTOR (SIMULATOR / TEORI / SOP) & AUDIO NARRATOR - ONLY FOR TOOLS 1 TO 6 */}
      {activeTool !== 'quiz' && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'simulator', label: '🧪 Simulasi Interaktif Bergerak' },
              { id: 'theory', label: '📖 Anatomi & Teori Metrologi' },
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
            <div className="metrology-cards-grid-2">
              <div className="dashboard-card" style={{ padding: '24px' }}>
                <h3 style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                  Anatomi & Komponen Jangka Sorong
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', color: '#334155' }}>
                    <strong style={{ color: '#0f172a' }}>1. Rahang Tetap (Fixed Jaw):</strong> Landasan datum referensi pengukuran yang menyatu dengan batang skala utama.
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', color: '#334155' }}>
                    <strong style={{ color: '#0f172a' }}>2. Rahang Geser (Movable Jaw):</strong> Bagian yang bergeser sepanjang batang utama membawa skala nonius untuk menjepit benda.
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', color: '#334155' }}>
                    <strong style={{ color: '#0f172a' }}>3. Baut Pengunci (Locking Screw):</strong> Mengunci posisi rahang geser agar skala tidak bergeser saat caliper dilepas dari benda kerja.
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', color: '#334155' }}>
                    <strong style={{ color: '#0f172a' }}>4. Skala Nonius (Vernier Scale):</strong> Skala tambahan ciptaan Pierre Vernier (1631) yang memperbesar resolusi pembacaan hingga 0.05 mm atau 0.02 mm.
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', color: '#334155' }}>
                    <strong style={{ color: '#0f172a' }}>5. Batang Kedalaman (Depth Probe):</strong> Bilah tipis di ujung belakang yang keluar proporsional dengan bukaan rahang luar.
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

                {/* MOVABLE MICROMETER SVG VIEWPORT */}
                <div style={{
                  background: '#090e18',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  padding: '24px 16px',
                  overflowX: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '340px'
                }}>
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
                    {/* Starts at 430, goes to 680 */}
                    <rect x="430" y="116" width="250" height="48" fill="url(#chromeSteel)" stroke="#475569" strokeWidth="1.5" />
                    
                    {/* Compute thimble X position: starts exactly at 0 mark (x = 445) when microValue = 0 */}
                    {(() => {
                      const thimbleX = 445 + microValue * 8.5;
                      return (
                        <g>
                          {/* SLEEVE DATUM LINE (GARIS TENGAH REFERENSI) - STOPS EXACTLY AT THIMBLE NOSE */}
                          <line x1="430" y1="140" x2={thimbleX} stroke="#0f172a" strokeWidth="2" />

                          {/* SLEEVE ENGRAVINGS (0 to 25 mm) - ONLY DRAW VISIBLE MARKS LEFT OF THIMBLE! */}
                          {Array.from({ length: 26 }).map((_, i) => {
                            const sx = 445 + i * 8.5;
                            // Do NOT draw if under or past thimble!
                            if (sx > thimbleX) return null;
                            const isFive = i % 5 === 0;
                            return (
                              <g key={'slv-' + i}>
                                {/* Garis Skala Atas (Milimeter Bulat 1 mm) */}
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
                                {/* Garis Skala Bawah (0.5 mm) - Hanya tampil jika mode standar dan belum tertutup thimble */}
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

                          {/* ROTATING THIMBLE (BIDAL PUTAR / SKALA NONIUS) */}
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

                            {/* SKALA NONIUS ENGRAVINGS (PADA BIDAL PUTAR) */}
                            {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((offset) => {
                              const maxDiv = microReadingMode === 'standard' ? 50 : 100;
                              let divNum = (microThimbleDivisions + offset + maxDiv) % maxDiv;
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
                                  {/* Coincident indicator marker */}
                                  {isCoincident && (
                                    <g>
                                      <polygon points="-8,140 -2,137 -2,143" fill="#ef4444" />
                                      <text x="-12" y="143" fontSize="8" fontWeight="900" fill="#ef4444" textAnchor="end">
                                        SEGARIS ◄
                                      </text>
                                    </g>
                                  )}
                                </g>
                              );
                            })}

                            {/* RATCHET STOP KNOB (PEMUTAR RATCHET) */}
                            <rect x="163" y="120" width="46" height="40" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
                            <circle cx="186" cy="140" r="8" fill={isRatchetClicking ? '#f59e0b' : '#334155'} />
                          </g>

                          {/* CALLOUT LABELS ABOVE SVG */}
                          {/* Callout 1: SKALA UTAMA */}
                          <g transform="translate(435, 45)">
                            <rect x="-10" y="-16" width="150" height="38" rx="6" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
                            <text x="65" y="0" fontSize="10" fontWeight="900" fill="#38bdf8" textAnchor="middle">
                              SKALA UTAMA (SLEEVE)
                            </text>
                            <text x="65" y="14" fontSize="8" fontWeight="600" fill="#cbd5e1" textAnchor="middle">
                              {microReadingMode === 'standard' ? 'Atas: 1 mm | Bawah: 0.5 mm' : 'Skala Milimeter Bulat (1 mm)'}
                            </text>
                            <line x1="65" y1="22" x2="65" y2="70" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
                            <circle cx="65" cy="70" r="3" fill="#38bdf8" />
                          </g>

                          {/* Callout 2: SKALA NONIUS */}
                          <g transform={`translate(${Math.max(620, thimbleX + 25)}, 45)`}>
                            <rect x="-10" y="-16" width="165" height="38" rx="6" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
                            <text x="72" y="0" fontSize="10" fontWeight="900" fill="#f59e0b" textAnchor="middle">
                              SKALA NONIUS (THIMBLE)
                            </text>
                            <text x="72" y="14" fontSize="8" fontWeight="600" fill="#fde68a" textAnchor="middle">
                              Bidal Putar (1 strip = 0.01 mm)
                            </text>
                            <line x1="15" y1="22" x2="15" y2="70" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
                            <circle cx="15" cy="70" r="3" fill="#f59e0b" />
                          </g>
                        </g>
                      );
                    })()}

                  </svg>
                </div>

                {/* CONTROLS (SLIDER & STEPPERS) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Atur Putaran Spindle & Thimble (Rentang 0.00 s/d 25.00 mm):
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="0.01"
                    value={microValue}
                    onChange={(e) => setMicroValue(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                  />

                  {/* QUICK STEPPERS */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[
                      { label: '-0.5 mm', delta: -0.5 },
                      { label: '-0.05 mm', delta: -0.05 },
                      { label: '-0.01 mm', delta: -0.01 },
                      { label: '+0.01 mm', delta: +0.01 },
                      { label: '+0.05 mm', delta: +0.05 },
                      { label: '+0.5 mm', delta: +0.5 },
                      { label: 'Set 7.82 mm', exact: 7.82 },
                      { label: 'Set 12.35 mm', exact: 12.35 },
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
                          } else {
                            setMicroValue(prev => Math.max(0, Math.min(25, parseFloat((prev + btn.delta).toFixed(2)))));
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
                      🔊 Putar Ratchet (Klik!)
                    </button>
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

                {/* PENJELASAN PRAKTIS SKALA */}
                <div className="dashboard-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b45309', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>💡</span> Cara Membaca Seperti Umumnya:
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.5 }}>
                    <p style={{ margin: '0 0 6px 0' }}>
                      <strong style={{ color: '#0f172a' }}>1. Skala Utama:</strong> Terletak pada tabung tetap (sleeve). Nilai yang dibaca adalah angka terakhir yang terlihat di sebelah kiri bidal putar.
                    </p>
                    <p style={{ margin: '0 0 6px 0' }}>
                      <strong style={{ color: '#0f172a' }}>2. Skala Nonius:</strong> Terletak pada bidal putar (thimble). Nilai yang dibaca adalah garis yang lurus dengan garis horizontal di tengah skala utama.
                    </p>
                    <p style={{ margin: 0, color: '#b45309', fontWeight: 600 }}>
                      <em>Jika bingung dengan garis 0.5 mm di bawah, Anda dapat mengklik tombol "Mode Sederhana" di atas!</em>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'theory' && (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Simulasi: Pemeriksaan Celah Presisi dengan Feeler Gauge
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
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
            <div className="metrology-cards-grid-2">
              <div className="dashboard-card" style={{ padding: '24px' }}>
                <h3 style={{ color: '#0284c7', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                  Material & Standar Mutu Feeler Gauge
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
                  Aplikasi Kritis pada Otomotif & Mesin
                </h3>
                <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li><strong>Celah Katup (Valve Clearance):</strong> Mencegah katup bocor saat panas atau floating saat rpm tinggi.</li>
                  <li><strong>Celah Busi (Spark Plug Gap):</strong> Memastikan loncatan bunga api koil pengapian optimal.</li>
                  <li><strong>Celah Ujung Ring Piston (Ring End Gap):</strong> Mencegah ring piston mengunci dinding silinder saat memuai panas.</li>
                  <li><strong>Kerataan Kepala Silinder:</strong> Dipadukan dengan penggaris perata (Precision Straight Edge) untuk mengecek kelendutan kepala silinder.</li>
                </ul>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Simulasi: Proses Pelengketan Blok Ukur (Wringing Process)
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>
                      Tahap {wringStep + 1} dari 4
                    </span>
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
            <div className="metrology-cards-grid-2">
              <div className="dashboard-card" style={{ padding: '24px' }}>
                <h3 style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
                  Fisika di Balik Fenomena Wringing
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                  Mengapa dua blok ukur baja bisa saling melekat kuat tanpa perekat ataupun magnet?
                </p>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', marginTop: '10px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Gaya Van der Waals & Tegangan Permukaan:</div>
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

    </div>
  );
};

export default MeasuringToolsLab;

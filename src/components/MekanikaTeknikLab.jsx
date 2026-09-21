import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { useAccessibility } from '../context/AccessibilityContext';
import { recordQuizResult } from '../services/sheetService';
import LabDiagnosticBanner from './LabDiagnosticBanner';

// =============================================================================
// DATABASE KUIS MEKANIKA TEKNIK
// =============================================================================
const MECHANICS_QUIZ = [
  {
    id: 1,
    pertanyaan: 'Seorang siswa ingin membuka baut roda yang macet menggunakan kunci pas. Jika ia memegang kunci sangat dekat dengan baut (jarak 10 cm), terasa sangat berat dan tidak mau berputar. Mengapa saat ia menggeser pegangan tangannya ke ujung kunci (jarak 30 cm) atau menambah pipa sambungan (jarak 60 cm), baut terasa sangat enteng diputar?',
    pilihan: [
      'Karena semakin jauh dari titik putar, massa baut berkurang menjadi lebih ringan',
      'Karena Torsi = Gaya × Jarak Lengan (τ = F × d). Dengan lengan momen yang lebih panjang, gaya otot yang dibutuhkan menjadi berlipat ganda lebih kecil untuk menghasilkan torsi putar yang sama',
      'Karena kunci pas akan memanas jika dipegang di ujungnya',
      'Karena gravitasi bumi hanya bekerja pada jarak dekat dengan baut'
    ],
    kunci: 1,
    penjelasan: 'Hukum Momen Gaya menyatakan τ = F × d. Untuk menghasilkan torsi pembuka baut yang konstan (misal 60 Nm), jika jarak lengan d diperbesar dari 0.1 m menjadi 0.6 m (6x lebih panjang), maka gaya otot yang harus dikerahkan berkurang menjadi 1/6-nya (dari 600 N menjadi hanya 100 N!).'
  },
  {
    id: 2,
    pertanyaan: 'Tang pemotong kawat (kombinasi) dan gunting plat seng memanfaatkan prinsip tuas kelas berapa, dan di manakah letak titik tumpunya?',
    pilihan: [
      'Tuas Kelas 1: Titik tumpu (pivot engsel) berada di tengah di antara beban (mata pisau) dan kuasa (gagang tangan)',
      'Tuas Kelas 2: Titik tumpu berada di ujung gagang tangan',
      'Tuas Kelas 3: Titik tumpu berada pada kawat yang dipotong',
      'Bukan tuas, melainkan bidang miring bergulung'
    ],
    kunci: 0,
    penjelasan: 'Tuas Kelas 1 memiliki titik tumpu (fulcrum) di tengah-tengah antara beban dan kuasa. Gagang yang panjang memberikan keuntungan mekanis berlipat ganda sehingga mata potong menghasilkan tekanan pemotongan yang sangat dahsyat.'
  },
  {
    id: 3,
    pertanyaan: 'Sebuah mesin diesel seberat 1.000 kg (berat W ≈ 10.000 N) hendak diangkat menggunakan Takal / Chain Block dengan sistem katrol majemuk yang memiliki 4 utas tali penahan (Keuntungan Mekanis KM = 4). Berapakah gaya tarik tangan yang harus dikeluarkan teknisi?',
    pilihan: [
      'Tetap 10.000 N karena berat mesin tidak berubah',
      '2.500 N (hanya setara mengangkat beban 250 kg)',
      '40.000 N karena gesekan 4 tali katrol',
      '0 N mesin akan melayang sendiri tanpa ditarik'
    ],
    kunci: 1,
    penjelasan: 'Pada sistem katrol majemuk, F = W / KM. Karena beban 10.000 N ditopang bersama oleh 4 utas tali (KM = 4), maka gaya tarik yang harus dikerahkan operator hanya 10.000 / 4 = 2.500 N (setara beban 250 kg saja!).'
  },
  {
    id: 4,
    pertanyaan: 'Mengapa baut silinder head motor/mobil harus dikencangkan menggunakan Kunci Torsi (Torque Wrench) sesuai batas torsi standar pabrik, dan dilarang dikencangkan melebihi batas batas elastis baja?',
    pilihan: [
      'Agar baut tidak menjadi berkarat terkena oli mesin',
      'Karena jika melewati batas luluh (yield point), baut akan mengalami deformasi plastis (mulur permanen), penampangnya mengecil (necking), dan akhirnya putus terbelah dua',
      'Karena kunci torsi akan rusak jika dipakai terlalu kuat',
      'Agar suara mesin motor terdengar lebih halus'
    ],
    kunci: 1,
    penjelasan: 'Pada kurva tegangan-regangan, pengencangan baut harus berada di Zona Elastis (Hukum Hooke). Jika ditarik melewati batas luluh, ulir baut akan mulur melar secara permanen dan kehilangan daya cengkeramnya, atau patah getas di dalam blok mesin.'
  },
  {
    id: 5,
    pertanyaan: 'Balok jembatan derek crane sepanjang 6 meter ditopang oleh tumpuan Sendi di titik A dan Rol di titik B. Jika derek mengangkat mesin 1.200 N tepat pada posisi 2 meter dari tumpuan A, berapakah gaya reaksi tumpuan di A (RA) dan di B (RB)?',
    pilihan: [
      'RA = 600 N dan RB = 600 N karena beban dibagi rata',
      'RA = 800 N dan RB = 400 N karena beban lebih dekat ke tumpuan A',
      'RA = 400 N dan RB = 800 N karena tumpuan rol lebih licin',
      'RA = 1.200 N dan RB = 1.200 N'
    ],
    kunci: 1,
    penjelasan: 'Menggunakan syarat kesetimbangan momen ΣMB = 0: RA × 6 - 1200 × (6 - 2) = 0 ➔ RA × 6 = 4800 ➔ RA = 800 N. Berdasarkan ΣFy = 0: RB = 1200 - 800 = 400 N. Tumpuan A yang lebih dekat menanggung beban 2x lebih besar dibanding B!'
  }
];

export default function MekanikaTeknikLab({ initialTab = 'torque', addXP = () => {}, addMissionCompleted = () => {}, onOpenDiagnostic }) {
  const { isVoiceActive } = useAccessibility();

  // Tab State: 'torque', 'lever', 'equilibrium', 'stress', 'pulley', 'friction', 'calculator', 'quiz'
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const playTabSound = () => sound.playClick();
  const switchTab = (tab) => {
    playTabSound();
    setActiveTab(tab);
  };

  // ===========================================================================
  // STATE TAB 1: MOMEN GAYA & TORSI (KUNCI PAS BAUT)
  // ===========================================================================
  const [handDistanceCm, setHandDistanceCm] = useState(15);
  const [requiredTorqueNm, setRequiredTorqueNm] = useState(60);
  const [isRotatingBolt, setIsRotatingBolt] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [boltTurnSuccess, setBoltTurnSuccess] = useState(null);

  const handDistanceMeter = handDistanceCm / 100;
  const effortForceNewton = Math.round(requiredTorqueNm / handDistanceMeter);
  const effortKgEquivalent = (effortForceNewton / 9.8).toFixed(1);

  let effortStatus = 'heavy';
  let effortColor = '#dc2626';
  let effortBadge = '🥵 SANGAT BERAT! Otot Tangan Gemetar';
  let effortAdvice = 'Pegangan terlalu dekat ke baut! Geser tangan lebih jauh atau sambung pipa agar enteng.';

  if (effortForceNewton <= 150) {
    effortStatus = 'light';
    effortColor = '#16a34a';
    effortBadge = '😎 SUPER ENTENG! Diputar Lancar 1 Tangan';
    effortAdvice = 'Lengan momen sangat panjang! Torsi tercapai dengan gaya otot minimal.';
  } else if (effortForceNewton <= 350) {
    effortStatus = 'medium';
    effortColor = '#ea580c';
    effortBadge = '😐 SEDANG - Butuh Tenaga Sedang';
    effortAdvice = 'Posisi pegangan standar ujung kunci. Baut bisa diputar dengan dua tangan.';
  }

  const handleTurnBolt = () => {
    sound.playClick();
    if (effortForceNewton > 500) {
      sound.playError ? sound.playError() : sound.playClick();
      setBoltTurnSuccess(false);
      return;
    }

    setIsRotatingBolt(true);
    sound.playSuccess();
    setRotationAngle(prev => prev + 60);
    setBoltTurnSuccess(true);
    addXP(100);
    addMissionCompleted();

    setTimeout(() => {
      setIsRotatingBolt(false);
    }, 600);
  };

  // ===========================================================================
  // STATE TAB 2: SISTEM TUAS (PENGUNGKIT)
  // ===========================================================================
  const [leverClass, setLeverClass] = useState('1');
  const [leverArmEffort, setLeverArmEffort] = useState(80);
  const [leverArmLoad, setLeverArmLoad] = useState(20);
  const loadWeightNewton = 600;

  const mechanicalAdvantage = Math.max(0.1, Number((leverArmEffort / leverArmLoad).toFixed(2)));
  const leverEffortRequired = Math.round(loadWeightNewton / mechanicalAdvantage);

  // ===========================================================================
  // STATE TAB 3: KESETIMBANGAN TUMPUAN BALOK (CRANE)
  // ===========================================================================
  const [craneLoadX, setCraneLoadX] = useState(2.0);
  const [craneLoadP, setCraneLoadP] = useState(1200);
  const beamLengthL = 6.0;

  const reactionA = Math.round((craneLoadP * (beamLengthL - craneLoadX)) / beamLengthL);
  const reactionB = Math.round(craneLoadP - reactionA);

  // ===========================================================================
  // STATE TAB 4: TEGANGAN & REGANGAN (UJI TARIK)
  // ===========================================================================
  const [tensileForceN, setTensileForceN] = useState(12000);
  const rodDiameterMm = 10;
  const rodAreaMm2 = Math.PI * Math.pow(rodDiameterMm / 2, 2);
  const stressMPa = Math.round(tensileForceN / rodAreaMm2);

  let stressStage = 'elastic';
  let stressColor = '#10b981';
  let stressStatusText = 'Zona Elastis (Aman - Kembali Normal)';

  if (stressMPa > 480) {
    stressStage = 'fracture';
    stressColor = '#dc2626';
    stressStatusText = '💥 PATAH TERBELAH! (Melewati Kekuatan Tarik Puncak UTS)';
  } else if (stressMPa > 380) {
    stressStage = 'necking';
    stressColor = '#ea580c';
    stressStatusText = '⚠️ Necking (Penyempitan Penampang Ekstrem)';
  } else if (stressMPa > 250) {
    stressStage = 'plastic';
    stressColor = '#f59e0b';
    stressStatusText = 'Deformasi Plastis (Baut Mulur Melar Permanen!)';
  }

  // ===========================================================================
  // STATE TAB 5: KATROL & CHAIN BLOCK
  // ===========================================================================
  const [machineWeightKg, setMachineWeightKg] = useState(1000);
  const [pulleyRopes, setPulleyRopes] = useState(4);

  const machineWeightN = machineWeightKg * 9.8;
  const pulleyPullForceN = Math.round(machineWeightN / pulleyRopes);
  const pulleyPullKgEquivalent = (pulleyPullForceN / 9.8).toFixed(1);

  // ===========================================================================
  // STATE TAB 6: GESEKAN & BIDANG MIRING
  // ===========================================================================
  const [inclineAngleDeg, setInclineAngleDeg] = useState(25);
  const [surfaceType, setSurfaceType] = useState('dry');

  let frictionCoeff = 0.35;
  if (surfaceType === 'rusty') frictionCoeff = 0.65;
  if (surfaceType === 'grease') frictionCoeff = 0.08;

  const angleRad = (inclineAngleDeg * Math.PI) / 180;
  const isSliding = Math.tan(angleRad) > frictionCoeff;

  // ===========================================================================
  // STATE FORMULA CALCULATORS (SISWA MENGISI SENDIRI & MUNCUL HASIL)
  // ===========================================================================
  // 1. Torsi Calculator State
  const [calcTorqueMode, setCalcTorqueMode] = useState('F'); // 'F' | 'tau' | 'd'
  const [userTorqueVal, setUserTorqueVal] = useState(60); // Nm
  const [userDistanceCm, setUserDistanceCm] = useState(30); // cm
  const [userForceVal, setUserForceVal] = useState(200); // N

  // 2. Tuas Calculator State
  const [calcLeverMode, setCalcLeverMode] = useState('F'); // 'F' | 'W' | 'Lk' | 'KM'
  const [userLeverW, setUserLeverW] = useState(500); // N
  const [userLeverLb, setUserLeverLb] = useState(20); // cm
  const [userLeverLk, setUserLeverLk] = useState(80); // cm
  const [userLeverF, setUserLeverF] = useState(125); // N

  // 3. Tumpuan Balok Calculator State
  const [userBeamL, setUserBeamL] = useState(6); // m
  const [userBeamP, setUserBeamP] = useState(1200); // N
  const [userBeamX, setUserBeamX] = useState(2); // m

  // 4. Tegangan Baut Calculator State
  const [calcStressMode, setCalcStressMode] = useState('sigma'); // 'sigma' | 'F_max' | 'd_min'
  const [userStressF, setUserStressF] = useState(15000); // N
  const [userStressD, setUserStressD] = useState(10); // mm
  const [userStressIzin, setUserStressIzin] = useState(250); // MPa

  // 5. Katrol Chain Block Calculator State
  const [calcPulleyMode, setCalcPulleyMode] = useState('F'); // 'F' | 'W' | 'n'
  const [userPulleyW, setUserPulleyW] = useState(1000); // kg
  const [userPulleyN, setUserPulleyN] = useState(4); // ropes
  const [userPulleyF, setUserPulleyF] = useState(250); // kg

  // 6. Gesekan Calculator State
  const [calcFrictionMode, setCalcFrictionMode] = useState('Fs'); // 'Fs' | 'alpha' | 'mu'
  const [userFrictionW, setUserFrictionW] = useState(500); // N
  const [userFrictionMu, setUserFrictionMu] = useState(0.35);
  const [userFrictionAlpha, setUserFrictionAlpha] = useState(25);
  const [userFrictionFs, setUserFrictionFs] = useState(175); // N

  // ===========================================================================
  // STATE TAB 8: KUIS
  // ===========================================================================
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState({});

  const handleSelectQuizOption = (quizId, optIndex) => {
    sound.playClick();
    setQuizAnswers(prev => ({ ...prev, [quizId]: optIndex }));
  };

  const submitQuiz = () => {
    sound.playClick();
    let score = 0;
    const feedback = {};

    MECHANICS_QUIZ.forEach((q) => {
      const userAns = quizAnswers[q.id];
      if (userAns === q.kunci) {
        score += 20;
        feedback[q.id] = 'correct';
      } else {
        feedback[q.id] = 'incorrect';
      }
    });

    setQuizScore(score);
    setQuizFeedback(feedback);

    const correctCount = Math.round(score / 20);
    recordQuizResult({
      modul: 'Mekanika Teknik Permesinan',
      judulKuis: 'Kuis Kasus Bengkel & Fisika Terapan',
      skor: score,
      jawabanBenar: correctCount,
      totalSoal: MECHANICS_QUIZ.length,
      detailJawaban: `${correctCount} dari ${MECHANICS_QUIZ.length} kasus fisika bengkel dijawab benar (Skor: ${score}/100).`
    });

    if (score >= 80) {
      sound.playSuccess();
      addXP(500);
      addMissionCompleted();
    } else {
      sound.playError ? sound.playError() : sound.playClick();
      addXP(score * 2);
    }
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR TORQUE
  // ===========================================================================
  const renderTorqueFormulaSolver = () => {
    let resultEquation = '';
    let resultValue = '';
    let resultMeaning = '';

    const dMeter = Math.max(0.01, userDistanceCm / 100);

    if (calcTorqueMode === 'F') {
      const fCalc = Math.round(userTorqueVal / dMeter);
      const kgCalc = (fCalc / 9.8).toFixed(1);
      resultEquation = `F = τ / d = ${userTorqueVal} Nm / ${dMeter.toFixed(2)} m`;
      resultValue = `${fCalc} Newton (~${kgCalc} kg)`;
      resultMeaning = fCalc > 400 
        ? '⚠️ SANGAT BERAT: Otot tangan Anda harus menahan beban 40+ kg! Geser tangan lebih jauh ke ujung kunci agar lebih ringan.'
        : (fCalc > 150 ? '🟡 SEDANG: Bisa diputar dengan tenaga dua tangan.' : '✅ SUPER RINGAN: Hanya butuh tenaga dorong santai 1 tangan!');
    } else if (calcTorqueMode === 'tau') {
      const tauCalc = (userForceVal * dMeter).toFixed(1);
      resultEquation = `τ = F × d = ${userForceVal} N × ${dMeter.toFixed(2)} m`;
      resultValue = `${tauCalc} Nm`;
      resultMeaning = `Torsi putar yang Anda hasilkan pada baut adalah ${tauCalc} Nm.`;
    } else if (calcTorqueMode === 'd') {
      const dCalcM = (userTorqueVal / Math.max(1, userForceVal)).toFixed(2);
      const dCalcCm = Math.round(dCalcM * 100);
      resultEquation = `d = τ / F = ${userTorqueVal} Nm / ${userForceVal} N`;
      resultValue = `${dCalcCm} cm (${dCalcM} meter)`;
      resultMeaning = `Agar siswa dengan tenaga ${userForceVal} N mampu membuka baut ${userTorqueVal} Nm, kunci harus memiliki panjang minimal ${dCalcCm} cm (gunakan pipa penyambung jika kunci kurang panjang).`;
    }

    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '2px solid #38bdf8',
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🧮</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0369a1' }}>
                Kalkulator Rumus Momen Gaya &amp; Torsi (Isi Nilai Sendiri)
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rumus Dasar: τ = F × d  ➔  Pilih variabel yang ingin Anda cari:</span>
            </div>
          </div>
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
            τ = F × d
          </span>
        </div>

        {/* Mode Selector Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { id: 'F', label: '1. Cari Gaya Otot (F = τ / d)', desc: 'Berapa tenaga tangan yang dibutuhkan?' },
            { id: 'tau', label: '2. Cari Torsi Baut (τ = F × d)', desc: 'Berapa momen putar yang dihasilkan?' },
            { id: 'd', label: '3. Cari Panjang Kunci Minimal (d = τ / F)', desc: 'Berapa panjang gagang/pipa agar enteng?' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => { sound.playClick(); setCalcTorqueMode(mode.id); }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: calcTorqueMode === mode.id ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: calcTorqueMode === mode.id ? '#e0f2fe' : '#f8fafc',
                color: calcTorqueMode === mode.id ? '#0369a1' : '#334155',
                fontSize: '0.78rem',
                fontWeight: calcTorqueMode === mode.id ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>{mode.label}</div>
            </button>
          ))}
        </div>

        {/* One-Click Real Presets */}
        <div style={{ marginBottom: '14px', background: '#f0f9ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            ⚡ CONTOH KASUS BENGKEL (Klik isi angka otomatis):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px' }}>
            {[
              { label: '🛵 Baut Motor M8 (30 Nm, 15 cm)', tau: 30, d: 15 },
              { label: '🚗 Baut Roda Mobil (100 Nm, 30 cm)', tau: 100, d: 30 },
              { label: '🚛 Baut Truk + Pipa (300 Nm, 60 cm)', tau: 300, d: 60 },
              { label: '🥵 Salah Dekat (60 Nm, 5 cm Macet!)', tau: 60, d: 5 }
            ].map(p => (
              <button
                key={p.label}
                onClick={() => {
                  sound.playClick();
                  setUserTorqueVal(p.tau);
                  setUserDistanceCm(p.d);
                  setCalcTorqueMode('F');
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: (userTorqueVal === p.tau && userDistanceCm === p.d) ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: (userTorqueVal === p.tau && userDistanceCm === p.d) ? '#e0f2fe' : '#ffffff',
                  color: '#0369a1',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Inputs Grid based on Mode */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {calcTorqueMode !== 'tau' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                Torsi Baut Yang Dibutuhkan (τ):
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={userTorqueVal}
                  onChange={(e) => setUserTorqueVal(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Nm
                </span>
              </div>
            </div>
          )}

          {calcTorqueMode !== 'd' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                Jarak Pegangan Tangan ke Baut (d):
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={userDistanceCm}
                  onChange={(e) => setUserDistanceCm(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.8rem', color: '#64748b' }}>
                  cm
                </span>
              </div>
            </div>
          )}

          {calcTorqueMode !== 'F' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                Gaya Dorong Otot Tangan (F):
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={userForceVal}
                  onChange={(e) => setUserForceVal(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Newton
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Calculation Output Card */}
        <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 800 }}>HASIL PERHITUNGAN OTOMATIS:</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0369a1', margin: '4px 0' }}>
            {resultValue}
          </div>
          <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#0f172a', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bae6fd', marginBottom: '6px' }}>
            Langkah Substitusi: {resultEquation}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
            💡 <strong>Arti di Bengkel:</strong> {resultMeaning}
          </div>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR LEVERS
  // ===========================================================================
  const renderLeverFormulaSolver = () => {
    let resultEquation = '';
    let resultValue = '';
    let resultMeaning = '';

    const kmCalc = Math.max(0.01, userLeverLk / Math.max(0.1, userLeverLb));

    if (calcLeverMode === 'F') {
      const fCalc = Math.round(userLeverW / kmCalc);
      resultEquation = `F = (W × Lb) / Lk = (${userLeverW} × ${userLeverLb}) / ${userLeverLk}`;
      resultValue = `${fCalc} Newton (~${(fCalc / 9.8).toFixed(1)} kg)`;
      resultMeaning = `Dengan lengan kuasa ${userLeverLk} cm dan lengan beban ${userLeverLb} cm (KM = ${kmCalc.toFixed(2)}x), beban ${userLeverW} N terasa ringan hanya ${fCalc} N!`;
    } else if (calcLeverMode === 'W') {
      const wCalc = Math.round(userLeverF * kmCalc);
      resultEquation = `W = (F × Lk) / Lb = (${userLeverF} × ${userLeverLk}) / ${userLeverLb}`;
      resultValue = `${wCalc} Newton (~${(wCalc / 9.8).toFixed(1)} kg)`;
      resultMeaning = `Tenaga otot Anda ${userLeverF} N mampu mengangkat beban raksasa hingga ${wCalc} N berkat tuas pengungkit!`;
    } else if (calcLeverMode === 'Lk') {
      const lkCalc = Math.round((userLeverW * userLeverLb) / Math.max(1, userLeverF));
      resultEquation = `Lk = (W × Lb) / F = (${userLeverW} × ${userLeverLb}) / ${userLeverF}`;
      resultValue = `${lkCalc} cm`;
      resultMeaning = `Gagang tuas harus memiliki panjang minimal ${lkCalc} cm agar tenaga Anda ${userLeverF} N mampu mengangkat beban ${userLeverW} N.`;
    } else {
      resultEquation = `KM = Lk / Lb = ${userLeverLk} cm / ${userLeverLb} cm`;
      resultValue = `${kmCalc.toFixed(2)}x Lipat`;
      resultMeaning = `Gaya kuasa Anda dilipatgandakan sebesar ${kmCalc.toFixed(2)} kali lipat oleh tuas ini!`;
    }

    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '2px solid #f59e0b',
        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.08)',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🕹️</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#b45309' }}>
                Kalkulator Rumus Sistem Tuas &amp; Pengungkit
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Hukum Kesetimbangan Tuas: W × Lb = F × Lk</span>
            </div>
          </div>
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
            W × Lb = F × Lk
          </span>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { id: 'F', label: '1. Cari Gaya Kuasa (F)' },
            { id: 'W', label: '2. Cari Beban Terangkat (W)' },
            { id: 'Lk', label: '3. Cari Lengan Kuasa (Lk)' },
            { id: 'KM', label: '4. Cari Keuntungan Mekanis (KM)' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { sound.playClick(); setCalcLeverMode(m.id); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: calcLeverMode === m.id ? '2px solid #d97706' : '1px solid #cbd5e1',
                background: calcLeverMode === m.id ? '#fef3c7' : '#f8fafc',
                color: calcLeverMode === m.id ? '#b45309' : '#334155',
                fontSize: '0.78rem',
                fontWeight: calcLeverMode === m.id ? 800 : 600,
                cursor: 'pointer'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* One-Click Presets for Levers */}
        <div style={{ marginBottom: '14px', background: '#fffbeb', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            ⚡ CONTOH TUAS BENGKEL (Klik isi otomatis):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px' }}>
            {[
              { label: '✂️ Tang Potong Kawat (KM 8x)', w: 800, lb: 2, lk: 16 },
              { label: '🛠️ Gunting Plat Seng (KM 6x)', w: 600, lb: 5, lk: 30 },
              { label: '🪵 Linggis Pengungkit (KM 12x)', w: 1200, lb: 10, lk: 120 },
              { label: '🗜️ Pinset Presisi (KM 0.5x)', w: 10, lb: 8, lk: 4 }
            ].map(p => (
              <button
                key={p.label}
                onClick={() => {
                  sound.playClick();
                  setUserLeverW(p.w);
                  setUserLeverLb(p.lb);
                  setUserLeverLk(p.lk);
                  setCalcLeverMode('F');
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: (userLeverW === p.w && userLeverLb === p.lb && userLeverLk === p.lk) ? '2px solid #b45309' : '1px solid #cbd5e1',
                  background: (userLeverW === p.w && userLeverLb === p.lb && userLeverLk === p.lk) ? '#fef3c7' : '#ffffff',
                  color: '#92400e',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '14px' }}>
          {calcLeverMode !== 'W' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1e293b', marginBottom: '2px' }}>Berat Beban (W):</label>
              <input type="number" value={userLeverW} onChange={(e) => setUserLeverW(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1e293b', marginBottom: '2px' }}>Lengan Beban (Lb in cm):</label>
            <input type="number" value={userLeverLb} onChange={(e) => setUserLeverLb(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
          </div>
          {calcLeverMode !== 'Lk' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1e293b', marginBottom: '2px' }}>Lengan Kuasa (Lk in cm):</label>
              <input type="number" value={userLeverLk} onChange={(e) => setUserLeverLk(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
            </div>
          )}
          {calcLeverMode !== 'F' && calcLeverMode !== 'KM' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#1e293b', marginBottom: '2px' }}>Gaya Kuasa Anda (F in N):</label>
              <input type="number" value={userLeverF} onChange={(e) => setUserLeverF(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
            </div>
          )}
        </div>

        {/* Output */}
        <div style={{ background: '#fffbeb', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 800 }}>HASIL PERHITUNGAN TUAS:</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#b45309', margin: '4px 0' }}>{resultValue}</div>
          <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#0f172a', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fed7aa', marginBottom: '6px' }}>
            Langkah Hitung: {resultEquation}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#334155' }}>💡 {resultMeaning}</div>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR BEAM EQUILIBRIUM
  // ===========================================================================
  const renderBeamFormulaSolver = () => {
    const L = Math.max(0.5, userBeamL);
    const x = Math.min(L, Math.max(0, userBeamX));
    const P = userBeamP;

    const rA = Math.round((P * (L - x)) / L);
    const rB = Math.round(P - rA);
    const mMax = Math.round(rA * x);

    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '2px solid #10b981',
        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚖️</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#065f46' }}>
                Kalkulator Reaksi Tumpuan Balok Derek (Sendi A &amp; Rol B)
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Syarat Statika: ΣMB = 0 dan ΣFy = 0</span>
            </div>
          </div>
          <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
            ΣFy = 0 | ΣM = 0
          </span>
        </div>

        {/* One-Click Presets for Beam Crane */}
        <div style={{ marginBottom: '14px', background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            ⚡ CONTOH POSISI BEBAN CRANE (Klik isi otomatis):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px' }}>
            {[
              { label: '🏗️ Mesin Dekat Tumpuan A (x = 1.5 m)', l: 6, p: 1200, x: 1.5 },
              { label: '⚖️ Beban Pas di Tengah (x = 3.0 m)', l: 6, p: 1200, x: 3.0 },
              { label: '🚜 Beban Dekat Rol B (x = 4.5 m)', l: 6, p: 1200, x: 4.5 }
            ].map(b => (
              <button
                key={b.label}
                onClick={() => {
                  sound.playClick();
                  setUserBeamL(b.l);
                  setUserBeamP(b.p);
                  setUserBeamX(b.x);
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: (userBeamL === b.l && userBeamP === b.p && userBeamX === b.x) ? '2px solid #166534' : '1px solid #cbd5e1',
                  background: (userBeamL === b.l && userBeamP === b.p && userBeamX === b.x) ? '#dcfce7' : '#ffffff',
                  color: '#166534',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Panjang Balok (L):</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="number" value={userBeamL} onChange={(e) => setUserBeamL(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
              <span style={{ background: '#f1f5f9', padding: '6px 8px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem' }}>meter</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Beban Crane (P):</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="number" value={userBeamP} onChange={(e) => setUserBeamP(Math.max(10, Number(e.target.value)))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
              <span style={{ background: '#f1f5f9', padding: '6px 8px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem' }}>Newton</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Jarak Beban dari Tumpuan A (x):</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="number" value={userBeamX} onChange={(e) => setUserBeamX(Number(e.target.value))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
              <span style={{ background: '#f1f5f9', padding: '6px 8px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem' }}>meter</span>
            </div>
          </div>
        </div>

        {/* Output */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
            <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800 }}>Reaksi Tumpuan Sendi A (RA):</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534' }}>{rA} Newton</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>~{(rA / 9.8).toFixed(1)} kg</div>
          </div>

          <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
            <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800 }}>Reaksi Tumpuan Rol B (RB):</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534' }}>{rB} Newton</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>~{(rB / 9.8).toFixed(1)} kg</div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', color: '#334155' }}>
          <strong>Langkah Perhitungan:</strong> ΣMB = 0 ➔ RA × {L} - {P} × ({L} - {x}) = 0 ➔ <strong>RA = {rA} N</strong>. Kemudian ΣFy = 0 ➔ RB = {P} - {rA} = <strong>{rB} N</strong>. Momen Lentur Maksimal di titik beban: <strong>Mmax = {mMax} Nm</strong>.
        </div>
      </div>
    );
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR TENSILE STRESS
  // ===========================================================================
  const renderStressFormulaSolver = () => {
    let resultEquation = '';
    let resultValue = '';
    let safetyVerdict = '';
    let verdictColor = '#10b981';

    const areaMm2 = (Math.PI * Math.pow(userStressD / 2, 2)).toFixed(2);

    if (calcStressMode === 'sigma') {
      const sCalc = Math.round(userStressF / areaMm2);
      resultEquation = `σ = F / A = ${userStressF} N / ${areaMm2} mm²`;
      resultValue = `${sCalc} MPa (N/mm²)`;
      if (sCalc <= 250) {
        safetyVerdict = '🟢 AMAN (Zona Elastis): Baut masih dalam batas aman dan tidak akan mulur melar permanen.';
        verdictColor = '#16a34a';
      } else if (sCalc <= 450) {
        safetyVerdict = '🟡 PERINGATAN (Zona Plastis): Baut melewati batas luluh! Baut mulur melar secara permanen.';
        verdictColor = '#d97706';
      } else {
        safetyVerdict = '🔴 BAHAYA PATAH (Fracture): Tegangan melampaui kekuatan tarik puncak (UTS)! Baut akan putus terbelah dua!';
        verdictColor = '#dc2626';
      }
    } else if (calcStressMode === 'F_max') {
      const fMax = Math.round(userStressIzin * areaMm2);
      resultEquation = `F_aman = σ_izin × A = ${userStressIzin} MPa × ${areaMm2} mm²`;
      resultValue = `${fMax} Newton (~${(fMax / 9.8).toFixed(0)} kg)`;
      safetyVerdict = `Baut berdiameter ${userStressD} mm mampu menahan tarikan maksimal hingga ${fMax} N sebelum mengalami kerusakan.`;
    } else {
      const dMin = (Math.sqrt((4 * userStressF) / (Math.PI * userStressIzin))).toFixed(2);
      resultEquation = `d_min = √[(4 × F) / (π × σ)] = √[(4 × ${userStressF}) / (3.14 × ${userStressIzin})]`;
      resultValue = `${dMin} mm`;
      safetyVerdict = `Untuk menahan beban tarikan ${userStressF} N dengan batas aman ${userStressIzin} MPa, baut harus memiliki diameter minimal ${dMin} mm (pilih baut standar M${Math.ceil(dMin)}).`;
    }

    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '2px solid #8b5cf6',
        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.08)',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>📏</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#6d28d9' }}>
                Kalkulator Tegangan Tarik Baut (Hukum Hooke)
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rumus: Tegangan σ = Gaya F / Luas Penampang A</span>
            </div>
          </div>
          <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
            σ = F / A
          </span>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { id: 'sigma', label: '1. Cari Tegangan (σ = F / A)' },
            { id: 'F_max', label: '2. Cari Beban Tarik Aman Maksimal (F)' },
            { id: 'd_min', label: '3. Cari Diameter Baut Minimal (d)' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { sound.playClick(); setCalcStressMode(m.id); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: calcStressMode === m.id ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                background: calcStressMode === m.id ? '#ede9fe' : '#f8fafc',
                color: calcStressMode === m.id ? '#6d28d9' : '#334155',
                fontSize: '0.78rem',
                fontWeight: calcStressMode === m.id ? 800 : 600,
                cursor: 'pointer'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* One-Click Presets for Bolt Strength */}
        <div style={{ marginBottom: '14px', background: '#f5f3ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            ⚡ CONTOH KASUS KEKUATAN BAUT (Klik isi otomatis):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px' }}>
            {[
              { label: '🟢 Baut M8 Tarikan 5 kN (Aman)', f: 5000, d: 8, izin: 250 },
              { label: '🟡 Baut M10 Tarikan 25 kN (Mulur)', f: 25000, d: 10, izin: 250 },
              { label: '🔴 Baut M6 Tarikan 20 kN (Patah!)', f: 20000, d: 6, izin: 250 }
            ].map(s => (
              <button
                key={s.label}
                onClick={() => {
                  sound.playClick();
                  setUserStressF(s.f);
                  setUserStressD(s.d);
                  setUserStressIzin(s.izin);
                  setCalcStressMode('sigma');
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: (userStressF === s.f && userStressD === s.d) ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                  background: (userStressF === s.f && userStressD === s.d) ? '#ede9fe' : '#ffffff',
                  color: '#6d28d9',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          {calcStressMode !== 'F_max' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Gaya Tarik (F in Newton):</label>
              <input type="number" value={userStressF} onChange={(e) => setUserStressF(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
            </div>
          )}
          {calcStressMode !== 'd_min' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Diameter Baut (d in mm):</label>
              <input type="number" value={userStressD} onChange={(e) => setUserStressD(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
            </div>
          )}
          {calcStressMode !== 'sigma' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Tegangan Izin Baja (σ in MPa):</label>
              <input type="number" value={userStressIzin} onChange={(e) => setUserStressIzin(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
            </div>
          )}
        </div>

        {/* Output */}
        <div style={{ background: '#f5f3ff', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: 800 }}>HASIL TEGANGAN:</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: verdictColor, margin: '4px 0' }}>{resultValue}</div>
          <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#0f172a', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd6fe', marginBottom: '6px' }}>
            Substitusi: {resultEquation}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#334155' }}>💡 {safetyVerdict}</div>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR PULLEYS & CHAIN BLOCK
  // ===========================================================================
  const renderPulleyFormulaSolver = () => {
    let resultEquation = '';
    let resultValue = '';
    let resultMeaning = '';

    if (calcPulleyMode === 'F') {
      const fKg = (userPulleyW / Math.max(1, userPulleyN)).toFixed(1);
      const fN = Math.round(Number(fKg) * 9.8);
      resultEquation = `F = W / n = ${userPulleyW} kg / ${userPulleyN} tali penahan`;
      resultValue = `${fKg} kg (${fN} Newton)`;
      resultMeaning = `Dengan takal katrol majemuk berkeuntungan mekanis n = ${userPulleyN}, beban raksasa ${userPulleyW} kg (seperti mesin/genset) dapat ditarik ringan setara mengangkat ${fKg} kg saja!`;
    } else if (calcPulleyMode === 'W') {
      const wKg = Math.round(userPulleyF * userPulleyN);
      const wN = Math.round(wKg * 9.8);
      resultEquation = `W = F × n = ${userPulleyF} kg × ${userPulleyN} tali penahan`;
      resultValue = `${wKg} kg (${wN} Newton)`;
      resultMeaning = `Tenaga tarik tangan Anda ${userPulleyF} kg dilipatgandakan oleh ${userPulleyN} utas tali sehingga sanggup mengangkat beban mesin hingga ${wKg} kg!`;
    } else {
      const nCalc = Math.ceil(userPulleyW / Math.max(1, userPulleyF));
      resultEquation = `n = W / F = ${userPulleyW} kg / ${userPulleyF} kg = ${(userPulleyW / Math.max(1, userPulleyF)).toFixed(1)}`;
      resultValue = `${nCalc} Utas Tali (KM = ${nCalc})`;
      resultMeaning = `Untuk mengangkat beban berat ${userPulleyW} kg dengan batas tenaga tarik tangan ${userPulleyF} kg, Anda wajib memilih Chain Block / Takal dengan minimal ${nCalc} utas tali penahan.`;
    }

    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '2px solid #059669',
        boxShadow: '0 4px 14px rgba(5, 150, 105, 0.08)',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🏗️</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#065f46' }}>
                Kalkulator Rumus Takal &amp; Katrol Majemuk (Chain Block)
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rumus Dasar: Kuasa F = Beban W / Jumlah Tali Penahan n</span>
            </div>
          </div>
          <span style={{ background: '#dcfce7', color: '#065f46', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
            F = W / n
          </span>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { id: 'F', label: '1. Cari Gaya Tarik Kuasa (F = W / n)', desc: 'Berapa kg tarikan tangan?' },
            { id: 'W', label: '2. Cari Beban Maksimal (W = F × n)', desc: 'Berapa ton mesin terangkat?' },
            { id: 'n', label: '3. Cari Jumlah Tali Diperlukan (n = W / F)', desc: 'Berapa KM takal yang dibutuhkan?' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { sound.playClick(); setCalcPulleyMode(m.id); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: calcPulleyMode === m.id ? '2px solid #059669' : '1px solid #cbd5e1',
                background: calcPulleyMode === m.id ? '#dcfce7' : '#f8fafc',
                color: calcPulleyMode === m.id ? '#065f46' : '#334155',
                fontSize: '0.78rem',
                fontWeight: calcPulleyMode === m.id ? 800 : 600,
                cursor: 'pointer'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* One-Click Presets for Pulleys */}
        <div style={{ marginBottom: '14px', background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            ⚡ CONTOH PENGANGKATAN BEBAN TAKAL (Klik isi otomatis):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px' }}>
            {[
              { label: '⚙️ Genset Bengkel 300 kg (2 Tali ➔ 150 kg)', w: 300, n: 2 },
              { label: '🏎️ Mesin Mobil 1.000 kg (4 Tali ➔ 250 kg)', w: 1000, n: 4 },
              { label: '🏭 Mesin Press 2.000 kg (8 Tali ➔ 250 kg)', w: 2000, n: 8 }
            ].map(p => (
              <button
                key={p.label}
                onClick={() => {
                  sound.playClick();
                  setUserPulleyW(p.w);
                  setUserPulleyN(p.n);
                  setCalcPulleyMode('F');
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: (userPulleyW === p.w && userPulleyN === p.n) ? '2px solid #059669' : '1px solid #cbd5e1',
                  background: (userPulleyW === p.w && userPulleyN === p.n) ? '#dcfce7' : '#ffffff',
                  color: '#065f46',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          {calcPulleyMode !== 'W' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                Berat Beban / Mesin (W):
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={userPulleyW}
                  onChange={(e) => setUserPulleyW(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '6px 8px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem' }}>
                  kg
                </span>
              </div>
            </div>
          )}

          {calcPulleyMode !== 'n' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                Jumlah Tali Penahan Katrol (n):
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={userPulleyN}
                  onChange={(e) => setUserPulleyN(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '6px 8px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem' }}>
                  tali
                </span>
              </div>
            </div>
          )}

          {calcPulleyMode !== 'F' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                Tenaga Tarik Tangan Siswa (F):
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={userPulleyF}
                  onChange={(e) => setUserPulleyF(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '6px 8px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem' }}>
                  kg
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 800 }}>HASIL PERHITUNGAN TAKAL KATROL:</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#065f46', margin: '4px 0' }}>{resultValue}</div>
          <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#0f172a', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', marginBottom: '6px' }}>
            Substitusi: {resultEquation}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#334155' }}>💡 <strong>Arti di Bengkel:</strong> {resultMeaning}</div>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR FRICTION & INCLINE
  // ===========================================================================
  const renderFrictionFormulaSolver = () => {
    let resultEquation = '';
    let resultValue = '';
    let resultMeaning = '';

    if (calcFrictionMode === 'Fs') {
      const fsCalc = Math.round(userFrictionMu * userFrictionW);
      resultEquation = `F_s = μ × W = ${userFrictionMu} × ${userFrictionW} N`;
      resultValue = `${fsCalc} Newton`;
      resultMeaning = `Gaya dorong horizontal minimal untuk mulai menggeser benda seberat ${userFrictionW} N adalah ${fsCalc} N. Bila gaya dorong siswa < ${fsCalc} N, benda tetap diam terkunci gesekan.`;
    } else if (calcFrictionMode === 'alpha') {
      const alphaRad = Math.atan(userFrictionMu);
      const alphaDeg = (alphaRad * 180 / Math.PI).toFixed(1);
      resultEquation = `tan(α_kritis) = μ = ${userFrictionMu} ➔ α_kritis = arctan(${userFrictionMu})`;
      resultValue = `${alphaDeg}° Sudut Kemiringan`;
      resultMeaning = `Pada sudut kemiringan ramp di bawah ${alphaDeg}°, benda tidak akan meluncur turun karena gesekan masih menahan. Begitu sudut melebihi ${alphaDeg}°, benda akan langsung meluncur bebas turun ke bawah!`;
    } else {
      const muCalc = (userFrictionFs / Math.max(1, userFrictionW)).toFixed(3);
      resultEquation = `μ = F_s / W = ${userFrictionFs} N / ${userFrictionW} N`;
      resultValue = `μ = ${muCalc}`;
      resultMeaning = `Koefisien gesek permukaan benda adalah ${muCalc}. ${Number(muCalc) > 0.5 ? 'Permukaan sangat kasar/kesat (cengkeraman mantap seperti pencekaman ragum mesin).' : (Number(muCalc) < 0.15 ? 'Permukaan sangat licin karena terlumasi oli pelumas mesin!' : 'Koefisien gesek logam kering standar.')}`;
    }

    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        border: '2px solid #0284c7',
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>📐</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0369a1' }}>
                Kalkulator Rumus Gesekan &amp; Bidang Miring (Hukum Coulomb)
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rumus Dasar: Gaya Gesek Fs = μ × Normal N  |  tan(α_kritis) = μ</span>
            </div>
          </div>
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
            Fs = μ × W
          </span>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            { id: 'Fs', label: '1. Cari Gaya Gesek Maksimal (Fs = μ × W)', desc: 'Berapa gaya tahan gesekan?' },
            { id: 'alpha', label: '2. Cari Sudut Kritis Merosot (tan α = μ)', desc: 'Berapa derajat benda mulai meluncur?' },
            { id: 'mu', label: '3. Cari Koefisien Gesek (μ = Fs / W)', desc: 'Berapa nilai μ permukaan?' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { sound.playClick(); setCalcFrictionMode(m.id); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: calcFrictionMode === m.id ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: calcFrictionMode === m.id ? '#e0f2fe' : '#f8fafc',
                color: calcFrictionMode === m.id ? '#0369a1' : '#334155',
                fontSize: '0.78rem',
                fontWeight: calcFrictionMode === m.id ? 800 : 600,
                cursor: 'pointer'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* One-Click Presets for Friction */}
        <div style={{ marginBottom: '14px', background: '#f0f9ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            ⚡ CONTOH GESEKAN &amp; RAMP BENGKEL (Klik isi otomatis):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px' }}>
            {[
              { label: '🧱 Besi Karat Kasar (μ = 0.65)', w: 500, mu: 0.65 },
              { label: '⚙️ Baja Bersih Kering (μ = 0.35)', w: 500, mu: 0.35 },
              { label: '🛢️ Terlumasi Gemuk Oli (μ = 0.08 Licin!)', w: 500, mu: 0.08 }
            ].map(f => (
              <button
                key={f.label}
                onClick={() => {
                  sound.playClick();
                  setUserFrictionW(f.w);
                  setUserFrictionMu(f.mu);
                  setCalcFrictionMode('Fs');
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: (userFrictionW === f.w && userFrictionMu === f.mu) ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  background: (userFrictionW === f.w && userFrictionMu === f.mu) ? '#e0f2fe' : '#ffffff',
                  color: '#0369a1',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
              Berat Benda / Beban (W):
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                value={userFrictionW}
                onChange={(e) => setUserFrictionW(Math.max(1, Number(e.target.value)))}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
              />
              <span style={{ background: '#f1f5f9', padding: '6px 8px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem' }}>
                Newton
              </span>
            </div>
          </div>

          {calcFrictionMode !== 'mu' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                Koefisien Gesek Statis (μ):
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  step="0.05"
                  value={userFrictionMu}
                  onChange={(e) => setUserFrictionMu(Math.max(0.01, Number(e.target.value)))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
              </div>
            </div>
          )}

          {calcFrictionMode === 'mu' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                Gaya Gesek Pengukur (Fs):
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  value={userFrictionFs}
                  onChange={(e) => setUserFrictionFs(Math.max(1, Number(e.target.value)))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '6px 8px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem' }}>
                  Newton
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 800 }}>HASIL PERHITUNGAN GESEKAN:</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0369a1', margin: '4px 0' }}>{resultValue}</div>
          <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#0f172a', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bae6fd', marginBottom: '6px' }}>
            Substitusi: {resultEquation}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#334155' }}>💡 <strong>Arti di Bengkel:</strong> {resultMeaning}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="mechanics-lab-container" style={{
      padding: '20px',
      maxWidth: '1380px',
      margin: '0 auto',
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      color: '#0f172a'
    }}>
      <LabDiagnosticBanner
        labTitle="Mekanika Teknik & Statika Struktur"
        desc="Diagnosa 10 soal konsep torsi momen gaya, hukum tuas, kesetimbangan statis, dan kurva tegangan-regangan material."
        onOpenDiagnostic={onOpenDiagnostic}
      />

      {/* =====================================================================
          HEADER HERO SECTION
      ===================================================================== */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0284c7 100%)',
        borderRadius: '16px',
        padding: '24px 30px',
        color: '#ffffff',
        marginBottom: '20px',
        boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#0f172a'
            }}>
              ⚙️ APPLIED MECHANICS &amp; STATICS
            </span>
            <span style={{ fontSize: '0.78rem', color: '#e0f2fe' }}>Fisika Terapan &amp; Mekanika Teknik Mesin SMK</span>
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 900,
            margin: '0 0 6px 0',
            fontFamily: "'Chakra Petch', 'Segoe UI', sans-serif",
            background: 'linear-gradient(135deg, #ffffff 0%, #bae6fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Studio Visual Mekanika Teknik
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#e0f2fe', margin: 0, lineHeight: 1.5 }}>
            Pelajari konsep momen gaya, sistem tuas pengungkit, kesetimbangan balok, tegangan tarik, dan takal katrol lewat <strong>contoh nyata bengkel, kalkulator rumus interaktif, dan simulator visual</strong>.
          </p>
        </div>

        {/* 3 Formula Quick Badges */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#facc15' }}>τ = F × d</div>
            <div style={{ fontSize: '0.68rem', color: '#e0f2fe' }}>Momen Gaya (Torsi)</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4ade80' }}>ΣM = 0</div>
            <div style={{ fontSize: '0.68rem', color: '#e0f2fe' }}>Kesetimbangan Statis</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8' }}>σ = F / A</div>
            <div style={{ fontSize: '0.68rem', color: '#e0f2fe' }}>Tegangan Tarik</div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PETA 6 STUDI KASUS MEKANIKA TEKNIK DI BENGKEL (KLIK LANGSUNG MENUJU KASUS)
      ===================================================================== */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '18px 20px',
        marginBottom: '20px',
        border: '1px solid #bae6fd',
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🧭</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0369a1' }}>
                Peta Studi Kasus: Pecahkan Masalah Fisika Mekanika di Bengkel
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Klik salah satu studi kasus di bawah ini untuk langsung membuka simulator &amp; kalkulator rumusnya:
              </span>
            </div>
          </div>
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>
            6 TOPIK BENGKEL
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {[
            {
              id: 'torque',
              icon: '🔧',
              title: '1. Kunci Pas & Baut Macet',
              problem: 'Kenapa pegang jauh terasa enteng?',
              formula: 'τ = F × d',
              color: '#0284c7',
              bg: '#f0f9ff'
            },
            {
              id: 'lever',
              icon: '🕹️',
              title: '2. Tang Potong & Gunting Plat',
              problem: 'Melipatgandakan gaya tekan tangan',
              formula: 'W × Lb = F × Lk',
              color: '#b45309',
              bg: '#fffbeb'
            },
            {
              id: 'equilibrium',
              icon: '⚖️',
              title: '3. Derek Crane & Balok',
              problem: 'Tiang dekat menanggung beban 2x lipat',
              formula: 'ΣM = 0 | ΣFy = 0',
              color: '#166534',
              bg: '#f0fdf4'
            },
            {
              id: 'stress',
              icon: '📏',
              title: '4. Baut Silinder Mesin Putus',
              problem: 'Jangan melewati batas elastis baja!',
              formula: 'σ = F / A',
              color: '#6d28d9',
              bg: '#f5f3ff'
            },
            {
              id: 'pulley',
              icon: '🏗️',
              title: '5. Takal Chain Block 1 Ton',
              problem: 'Angkat 1 ton hanya dengan tarikan 250 kg',
              formula: 'F = W / n',
              color: '#047857',
              bg: '#ecfdf5'
            },
            {
              id: 'friction',
              icon: '📐',
              title: '6. Ramp Muat & Bahaya Oli Licin',
              problem: 'Kapan mesin merosot di bidang miring?',
              formula: 'tan(α) > μ',
              color: '#0369a1',
              bg: '#f0f9ff'
            }
          ].map((c) => {
            const isSelected = activeTab === c.id;
            return (
              <button
                key={c.id}
                onClick={() => switchTab(c.id)}
                style={{
                  background: isSelected ? c.bg : '#ffffff',
                  border: isSelected ? `2px solid ${c.color}` : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? `0 4px 12px ${c.color}25` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    background: isSelected ? c.color : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {isSelected ? 'AKTIF' : c.formula}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 900, color: c.color, marginBottom: '2px' }}>
                  {c.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.35 }}>
                  {c.problem}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          NAVIGATION TABS
      ===================================================================== */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {[
          { id: 'torque', label: '🔧 Momen Gaya & Torsi', badge: 'Kunci Pas Baut' },
          { id: 'lever', label: '🕹️ Sistem Tuas', badge: '3 Kelas Pengungkit' },
          { id: 'equilibrium', label: '⚖️ Kesetimbangan', badge: 'Tumpuan Balok' },
          { id: 'stress', label: '📏 Tegangan & Regangan', badge: 'Uji Tarik' },
          { id: 'pulley', label: '🏗️ Katrol & Chain Block', badge: 'Takal Crane' },
          { id: 'friction', label: '📐 Gesekan & Kemiringan', badge: 'Bidang Miring' },
          { id: 'calculator', label: '🧮 Bank & Kalkulator Rumus', badge: 'Hitung Otomatis' },
          { id: 'quiz', label: '🏆 Kuis Kasus Bengkel', badge: '+500 XP' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              background: activeTab === tab.id ? '#ffffff' : '#f1f5f9',
              color: activeTab === tab.id ? '#0284c7' : '#475569',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderTop: activeTab === tab.id ? '3px solid #0284c7' : '3px solid transparent',
              borderLeft: activeTab === tab.id ? '1px solid #e2e8f0' : 'none',
              borderRight: activeTab === tab.id ? '1px solid #e2e8f0' : 'none',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
            <span style={{
              fontSize: '0.68rem',
              padding: '2px 5px',
              borderRadius: '4px',
              background: activeTab === tab.id ? '#e0f2fe' : '#e2e8f0',
              color: activeTab === tab.id ? '#0369a1' : '#64748b',
              fontWeight: 700
            }}>
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* =====================================================================
          TAB 1: MOMEN GAYA & TORSI (KUNCI PAS BAUT)
      ===================================================================== */}
      {activeTab === 'torque' && (
        <div>
          {/* Visual Hero SVG */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/mechanics/torque_wrench_infographic.svg" 
              alt="Infografis Momen Gaya Kunci Pas"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* Core Concept Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #dc2626' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#991b1b', marginBottom: '4px' }}>
                ❌ Pegangan Terlalu Dekat (d = 10 cm)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                Lengan momen sangat pendek! Siswa harus mengerahkan tenaga otot raksasa <strong>600 Newton (setara beban 61 kg)</strong>! Baut terasa macet dan tidak mau berputar.
              </div>
            </div>

            <div style={{ background: '#fffbeb', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#b45309', marginBottom: '4px' }}>
                🟡 Pegangan Ujung Kunci (d = 30 cm)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                Jarak lengan bertambah 3x lipat! Gaya otot yang dibutuhkan berkurang 3x menjadi <strong>200 Newton (~20 kg)</strong>. Baut mulai bisa diputar.
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#166534', marginBottom: '4px' }}>
                ✅ Pakai Pipa Sambung (d = 60 cm)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                Lengan momen menjadi 6x lipat! Siswa hanya perlu mendorong dengan gaya <strong>100 Newton (~10 kg)</strong>. Terasa super enteng seperti memutar kran air!
              </div>
            </div>
          </div>

          {/* Interactive Wrench Torque Simulator */}
          <div style={{
            background: '#ffffff',
            padding: '22px',
            borderRadius: '16px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                  🎮 Simulator Visual Kunci Pas &amp; Baut Macet
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Geser posisi tangan Anda di sepanjang gagang kunci dan buktikan sendiri perubahan gaya otot yang dibutuhkan!
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Sliders */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {/* One-Click Presets for Wrench */}
                <div style={{ marginBottom: '14px', background: '#eff6ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    ⚡ PILIH SKENARIO BENGKEL (Klik isi otomatis):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                    {[
                      { label: '🛵 Baut Motor M8 (30 Nm, 15 cm)', d: 15, tau: 30 },
                      { label: '🚗 Baut Roda Mobil (60 Nm, 30 cm)', d: 30, tau: 60 },
                      { label: '🚛 Baut Truk + Pipa (100 Nm, 60 cm)', d: 60, tau: 100 },
                      { label: '🥵 Salah Dekat (60 Nm, 5 cm Macet!)', d: 5, tau: 60 }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          sound.playClick();
                          setHandDistanceCm(preset.d);
                          setRequiredTorqueNm(preset.tau);
                          setBoltTurnSuccess(null);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: (handDistanceCm === preset.d && requiredTorqueNm === preset.tau) ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: (handDistanceCm === preset.d && requiredTorqueNm === preset.tau) ? '#dbeafe' : '#ffffff',
                          color: '#1e40af',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                      1. Posisi Pegangan Tangan (Lengan Momen d):
                    </label>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                      {handDistanceCm} cm ({handDistanceMeter.toFixed(2)} m)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    step="5"
                    value={handDistanceCm}
                    onChange={(e) => { sound.playClick(); setHandDistanceCm(Number(e.target.value)); setBoltTurnSuccess(null); }}
                    style={{ width: '100%', accentColor: '#0284c7' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    <span>5 cm (Sangat Dekat)</span>
                    <span>30 cm (Ujung Kunci)</span>
                    <span>70 cm (Pipa Panjang)</span>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                      2. Torsi Baut Yang Dibutuhkan (τ):
                    </label>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#ea580c', background: '#ffedd5', padding: '2px 8px', borderRadius: '4px' }}>
                      {requiredTorqueNm} Nm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    step="5"
                    value={requiredTorqueNm}
                    onChange={(e) => { sound.playClick(); setRequiredTorqueNm(Number(e.target.value)); setBoltTurnSuccess(null); }}
                    style={{ width: '100%', accentColor: '#ea580c' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    <span>30 Nm (Baut M8)</span>
                    <span>60 Nm (Baut Roda)</span>
                    <span>120 Nm (Baut Truk)</span>
                  </div>
                </div>

                <button
                  onClick={handleTurnBolt}
                  style={{
                    width: '100%',
                    background: effortStatus === 'heavy' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                  }}
                >
                  🔄 COBA PUTAR BAUT DENGAN TENAGA INI!
                </button>
              </div>

              {/* Visual Canvas */}
              <div>
                <div style={{
                  background: '#0f172a',
                  borderRadius: '12px',
                  padding: '20px',
                  color: '#ffffff',
                  position: 'relative',
                  border: '1px solid #334155',
                  marginBottom: '14px'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Simulasi Visual Lengan Kunci &amp; Posisi Tangan
                  </div>

                  <svg viewBox="0 0 360 120" width="100%" height="120">
                    {/* Nut Hexagon Rotating */}
                    <g transform={`translate(45, 60) rotate(${rotationAngle})`}>
                      <polygon points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11" fill="#475569" stroke="#cbd5e1" strokeWidth="2"/>
                      <circle cx="0" cy="0" r="10" fill="#0f172a"/>
                      <text x="0" y="3.5" textAnchor="middle" fill="#f8fafc" fontSize="7.5" fontWeight="bold">M16</text>
                    </g>
                    {/* Wrench body */}
                    <path d="M 45,60 L 75,50 L 250,50 L 250,70 L 75,70 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5"/>
                    <circle cx="250" cy="60" r="12" fill="#1e293b" stroke="#cbd5e1" strokeWidth="3"/>

                    {/* Pipe extension if > 35cm */}
                    {handDistanceCm > 35 && (
                      <rect x="230" y="46" width="120" height="28" rx="4" fill="#ea580c" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3,2"/>
                    )}

                    {(() => {
                      const handX = 55 + ((handDistanceCm - 5) / 65) * 280;
                      return (
                        <g transform={`translate(${handX}, 28)`}>
                          <line x1="0" y1="-10" x2="0" y2="20" stroke={effortColor} strokeWidth="3.5"/>
                          <polygon points="-5,14 0,22 5,14" fill={effortColor}/>
                          <circle cx="0" cy="-16" r="14" fill="#1e293b" stroke={effortColor} strokeWidth="2"/>
                          <text x="0" y="-12" fontSize="12" textAnchor="middle">✋</text>
                          <text x="0" y="-34" fontSize="8.5" fontWeight="900" fill={effortColor} textAnchor="middle">
                            {effortForceNewton} N
                          </text>
                        </g>
                      );
                    })()}
                  </svg>

                  <div style={{
                    background: `${effortColor}20`,
                    border: `1px solid ${effortColor}`,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 900, color: effortColor }}>
                        {effortBadge}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                        {effortAdvice}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: effortColor }}>
                        {effortForceNewton} N
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        ≈ {effortKgEquivalent} kg beban otot
                      </div>
                    </div>
                  </div>

                  {boltTurnSuccess === true && (
                    <div style={{ marginTop: '10px', background: '#dcfce7', color: '#166534', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                      🎉 KLIK! Baut berhasil diputar dengan lancar! Torsi {requiredTorqueNm} Nm tercapai dengan mudah. (+100 XP)
                    </div>
                  )}
                  {boltTurnSuccess === false && (
                    <div style={{ marginTop: '10px', background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                      ❌ TANGAN TIDAK KUAT! Gaya {effortForceNewton} N (&gt; 50 kg beban tangan) terlalu berat. Geser pegangan ke ujung kunci atau gunakan pipa sambungan!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Interactive Formula Solver for Torque */}
          {renderTorqueFormulaSolver()}
        </div>
      )}

      {/* =====================================================================
          TAB 2: SISTEM TUAS (PENGUNGKIT)
      ===================================================================== */}
      {activeTab === 'lever' && (
        <div>
          {/* Visual Hero SVG */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/mechanics/levers_three_classes.svg" 
              alt="3 Kelas Tuas Mekanika"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* Embedded Formula Solver */}
          {renderLeverFormulaSolver()}
        </div>
      )}

      {/* =====================================================================
          TAB 3: KESETIMBANGAN TUMPUAN BALOK (CRANE)
      ===================================================================== */}
      {activeTab === 'equilibrium' && (
        <div>
          {/* Visual Hero SVG */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/mechanics/equilibrium_beam.svg" 
              alt="Kesetimbangan Balok Crane"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* Embedded Formula Solver */}
          {renderBeamFormulaSolver()}
        </div>
      )}

      {/* =====================================================================
          TAB 4: TEGANGAN & REGANGAN (UJI TARIK)
      ===================================================================== */}
      {activeTab === 'stress' && (
        <div>
          {/* Visual Hero SVG */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/mechanics/stress_strain_curve.svg" 
              alt="Diagram Tegangan Regangan"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* Embedded Formula Solver */}
          {renderStressFormulaSolver()}
        </div>
      )}

      {/* =====================================================================
          TAB 5: KATROL & CHAIN BLOCK
      ===================================================================== */}
      {activeTab === 'pulley' && (
        <div>
          {/* Visual Hero SVG */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/mechanics/pulley_chain_block.svg" 
              alt="Katrol dan Chain Block"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* Interactive Pulley Simulator Card */}
          <div style={{
            background: '#ffffff',
            padding: '22px',
            borderRadius: '16px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              🎮 Kalkulator &amp; Simulator Mengangkat Mesin dengan Chain Block
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#64748b' }}>
              Pilih jumlah tali penahan katrol majemuk untuk membuktikan bagaimana beban 1 ton dapat ditarik ringan oleh tangan manusia (F = W / n):
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                    Konfigurasi Tali Katrol (KM):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {[
                      { n: 1, label: '1 Tali (KM 1)' },
                      { n: 2, label: '2 Tali (KM 2)' },
                      { n: 4, label: '4 Tali (KM 4)' },
                      { n: 8, label: '8 Tali (KM 8)' }
                    ].map(p => (
                      <button
                        key={p.n}
                        onClick={() => { sound.playClick(); setPulleyRopes(p.n); }}
                        style={{
                          padding: '8px 2px',
                          borderRadius: '6px',
                          border: pulleyRopes === p.n ? '2px solid #10b981' : '1px solid #cbd5e1',
                          background: pulleyRopes === p.n ? '#dcfce7' : '#ffffff',
                          color: pulleyRopes === p.n ? '#166534' : '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b' }}>Berat Mesin:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#dc2626' }}>{machineWeightKg} kg ({Math.round(machineWeightN)} N)</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="2000"
                    step="100"
                    value={machineWeightKg}
                    onChange={(e) => setMachineWeightKg(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#dc2626' }}
                  />
                </div>
              </div>

              {/* Readout */}
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 800 }}>Tenaga Tarik Rantai Yang Dibutuhkan:</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#166534', margin: '4px 0' }}>
                  {pulleyPullForceN} N
                </div>
                <div style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 700 }}>
                  Setara menarik beban {pulleyPullKgEquivalent} kg saja! ({pulleyRopes}x lebih ringan dari aslinya)
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Formula Solver for Pulley */}
          {renderPulleyFormulaSolver()}
        </div>
      )}

      {/* =====================================================================
          TAB 6: GESEKAN & BIDANG MIRING
      ===================================================================== */}
      {activeTab === 'friction' && (
        <div>
          {/* Visual Hero SVG */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/mechanics/friction_inclined_plane.svg" 
              alt="Mekanika Bidang Miring dan Hukum Gesekan"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          <div style={{
            background: '#ffffff',
            padding: '22px',
            borderRadius: '16px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              🎮 Simulator Bidang Miring &amp; Gesekan Statis/Kinetis
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#64748b' }}>
              Benda akan meluncur turun saat sudut bidang miring melebihi sudut gesek statis: tan(α) &gt; μ.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>Kondisi Permukaan Bidang Miring:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'rusty', name: 'Besi Karat', mu: 'μ = 0.65' },
                      { id: 'dry', name: 'Besi Bersih', mu: 'μ = 0.35' },
                      { id: 'grease', name: 'Oli Gemuk', mu: 'μ = 0.08' }
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => { sound.playClick(); setSurfaceType(s.id); }}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '6px',
                          border: surfaceType === s.id ? '2px solid #0284c7' : '1px solid #cbd5e1',
                          background: surfaceType === s.id ? '#e0f2fe' : '#ffffff',
                          color: surfaceType === s.id ? '#0369a1' : '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <div>{s.name}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{s.mu}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b' }}>Sudut Kemiringan (α):</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0284c7' }}>{inclineAngleDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="55"
                    step="1"
                    value={inclineAngleDeg}
                    onChange={(e) => setInclineAngleDeg(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0284c7' }}
                  />
                </div>
              </div>

              {/* Readout */}
              <div style={{ background: isSliding ? '#fef2f2' : '#f0fdf4', padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${isSliding ? '#dc2626' : '#16a34a'}` }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: isSliding ? '#dc2626' : '#16a34a' }}>
                  {isSliding ? '⛷️ BENDA MELUNCUR TURUN!' : '🛑 BENDA DIAM (GESEKAN STATIS MENAHAN)'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px', lineHeight: 1.5 }}>
                  tan({inclineAngleDeg}°) = {Math.tan(angleRad).toFixed(2)} vs Koefisien Gesek μ = {frictionCoeff}.<br />
                  {isSliding ? 'Komponen gaya berat sejajar bidang miring melampaui gaya gesek maksimal!' : 'Gaya gesek statis masih mampu menahan benda agar tidak merosot.'}
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Formula Solver for Friction */}
          {renderFrictionFormulaSolver()}
        </div>
      )}

      {/* =====================================================================
          TAB 7: BANK & KALKULATOR RUMUS PINTAR (ALL-IN-ONE FORMULA SOLVER)
      ===================================================================== */}
      {activeTab === 'calculator' && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '14px',
            padding: '20px 24px',
            color: '#ffffff',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🧮</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>
                  Bank Rumus &amp; Kalkulator Pintar Mekanika Teknik
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  Pilih nilai variabel apa yang ingin dicari, masukkan angka Anda sendiri, dan kalkulator akan menghitung serta membedah langkah matematisnya secara instan!
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderTorqueFormulaSolver()}
            {renderLeverFormulaSolver()}
            {renderBeamFormulaSolver()}
            {renderStressFormulaSolver()}
            {renderPulleyFormulaSolver()}
            {renderFrictionFormulaSolver()}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 8: KUIS STUDI KASUS (+500 XP)
      ===================================================================== */}
      {activeTab === 'quiz' && (
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                🏆 Kuis Studi Kasus Praktis Mekanika Teknik
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Pecahkan 5 problem mekanika terapan bengkel dan menangkan +500 XP
              </span>
            </div>
            {quizScore !== null && (
              <div style={{
                background: quizScore >= 80 ? '#dcfce7' : '#fee2e2',
                color: quizScore >= 80 ? '#166534' : '#991b1b',
                padding: '6px 14px',
                borderRadius: '999px',
                fontWeight: 900,
                fontSize: '0.88rem'
              }}>
                Skor: {quizScore} / 100 {quizScore >= 80 ? '🎉 LULUS (+500 XP)' : '⚠️ COBA LAGI'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            {MECHANICS_QUIZ.map((q, idx) => (
              <div key={q.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 900, fontSize: '0.78rem' }}>
                    #{idx + 1}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.45 }}>{q.pertanyaan}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '30px' }}>
                  {q.pilihan.map((pil, pIdx) => {
                    const isSelected = quizAnswers[q.id] === pIdx;
                    let optBg = isSelected ? '#bae6fd' : '#ffffff';
                    let optBorder = isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1';

                    if (quizFeedback[q.id]) {
                      if (pIdx === q.kunci) {
                        optBg = '#dcfce7';
                        optBorder = '2px solid #16a34a';
                      } else if (isSelected && pIdx !== q.kunci) {
                        optBg = '#fee2e2';
                        optBorder = '2px solid #dc2626';
                      }
                    }

                    return (
                      <button
                        key={pIdx}
                        onClick={() => handleSelectQuizOption(q.id, pIdx)}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: optBg,
                          border: optBorder,
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        <strong>{String.fromCharCode(65 + pIdx)}.</strong> {pil}
                      </button>
                    );
                  })}
                </div>

                {quizFeedback[q.id] && (
                  <div style={{
                    marginTop: '10px',
                    marginLeft: '30px',
                    padding: '10px',
                    borderRadius: '6px',
                    background: quizFeedback[q.id] === 'correct' ? '#f0fdf4' : '#fef2f2',
                    borderLeft: `3px solid ${quizFeedback[q.id] === 'correct' ? '#16a34a' : '#dc2626'}`,
                    fontSize: '0.75rem',
                    color: '#334155'
                  }}>
                    <strong>💡 Pembahasan:</strong> {q.penjelasan}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={submitQuiz}
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            📝 SUBMIT JAWABAN KUIS &amp; KLAIM 500 XP
          </button>
        </div>
      )}
    </div>
  );
}

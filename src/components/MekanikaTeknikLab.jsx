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
  // REUSABLE PEDAGOGICAL CALCULATION CARD (BEDAH LANGKAH PERHITUNGAN DETAIL)
  // ===========================================================================
  const renderPedagogicalCalculationCard = ({
    title = 'Bedah Langkah Perhitungan Fisika Mekanika',
    topicBadge = 'STANDAR MEKANIKA TEKNIK',
    themeColor = '#0284c7',
    lightBg = '#f0f9ff',
    borderColor = '#bae6fd',
    givenItems = [], // [{ label, symbol, value, unit, note }]
    formulaData = { main: '', title: '', description: '', terms: [] },
    steps = [], // [{ stepNum, title, math, note }]
    finalResult = { value: '', unit: '', subtitle: '', badgeText: '', badgeColor: '#16a34a', badgeBg: '#dcfce7' },
    workshopInsight = { title: '', content: '' }
  }) => {
    return (
      <div style={{
        marginTop: '16px',
        background: '#ffffff',
        borderRadius: '14px',
        border: `2px solid ${borderColor}`,
        boxShadow: `0 6px 18px ${themeColor}15`,
        overflow: 'hidden'
      }}>
        {/* Card Header */}
        <div style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)`,
          padding: '12px 18px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>📐</span>
            <span style={{ fontWeight: 900, fontSize: '0.92rem', letterSpacing: '0.3px' }}>
              {title}
            </span>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            background: 'rgba(255,255,255,0.2)',
            padding: '3px 8px',
            borderRadius: '999px',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.3)',
            textTransform: 'uppercase'
          }}>
            {topicBadge}
          </span>
        </div>

        <div style={{ padding: '16px 18px' }}>
          {/* SECTION 1: 📋 DIKETAHUI DARI DATA INPUT / SIMULASI */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 900,
              color: '#1e293b',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              <span>📋</span> 1. Data yang Diketahui (Input Variabel):
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '8px'
            }}>
              {givenItems.map((item, idx) => (
                <div key={idx} style={{
                  background: lightBg,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '2px' }}>
                    {item.label} {item.symbol ? `(${item.symbol})` : ''}:
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: themeColor }}>
                    {item.value} {item.unit && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>{item.unit}</span>}
                  </div>
                  {item.note && (
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px', fontStyle: 'italic' }}>
                      {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: 💡 RUMUS DASAR / BAKU FISIKA */}
          <div style={{
            marginBottom: '16px',
            background: '#f8fafc',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase' }}>
                💡 2. Rumus Baku Fisika / Mekanika Teknik:
              </div>
              {formulaData.title && (
                <span style={{ fontSize: '0.72rem', color: themeColor, fontWeight: 800, background: lightBg, padding: '2px 8px', borderRadius: '4px' }}>
                  {formulaData.title}
                </span>
              )}
            </div>

            <div style={{
              background: '#0f172a',
              color: '#38bdf8',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '1.15rem',
              fontWeight: 900,
              fontFamily: "'Fira Code', monospace",
              textAlign: 'center',
              letterSpacing: '0.5px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              marginBottom: '8px'
            }}>
              {formulaData.main}
            </div>

            {formulaData.description && (
              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.45, marginBottom: '6px' }}>
                {formulaData.description}
              </div>
            )}

            {formulaData.terms && formulaData.terms.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px 12px',
                fontSize: '0.7rem',
                color: '#64748b',
                background: '#ffffff',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                {formulaData.terms.map((term, tIdx) => (
                  <span key={tIdx}>• {term}</span>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: ✏️ LANGKAH SUBSTITUSI & HITUNGAN DETAIL */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 900,
              color: '#1e293b',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              ✏️ 3. Langkah Substitusi &amp; Penjabaran Perhitungan:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {steps.map((st, sIdx) => (
                <div key={sIdx} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  borderLeft: `4px solid ${themeColor}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{
                      background: themeColor,
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      Langkah {st.stepNum || (sIdx + 1)}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
                      {st.title}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    background: lightBg,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${borderColor}`,
                    overflowX: 'auto',
                    whiteSpace: 'nowrap'
                  }}>
                    {st.math}
                  </div>
                  {st.note && (
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                      💡 {st.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: 🎯 HASIL AKHIR PERHITUNGAN */}
          <div style={{
            background: lightBg,
            border: `2px solid ${themeColor}`,
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 900, color: themeColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🎯 4. HASIL AKHIR PERHITUNGAN:
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', marginTop: '2px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ color: themeColor }}>{finalResult.value}</span>
                {finalResult.unit && (
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#475569' }}>
                    {finalResult.unit}
                  </span>
                )}
              </div>
              {finalResult.subtitle && (
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', fontWeight: 600 }}>
                  {finalResult.subtitle}
                </div>
              )}
            </div>

            {finalResult.badgeText && (
              <div style={{
                background: finalResult.badgeBg || '#dcfce7',
                color: finalResult.badgeColor || '#166534',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 900,
                border: `1px solid ${finalResult.badgeColor}40`,
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}>
                {finalResult.badgeText}
              </div>
            )}
          </div>

          {/* SECTION 5: 🔍 ANALISIS PRAKTIK & ARTI DI BENGKEL MESIN */}
          {workshopInsight && workshopInsight.content && (
            <div style={{
              background: '#f8fafc',
              borderLeft: `4px solid ${themeColor}`,
              borderRadius: '8px',
              padding: '12px 14px',
              border: '1px solid #e2e8f0',
              borderLeftWidth: '4px'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🔍</span> 5. Analisis Praktik &amp; Arti di Bengkel Mesin:
              </div>
              <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.55 }}>
                {workshopInsight.content}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR TORQUE
  // ===========================================================================
  const renderTorqueFormulaSolver = () => {
    const dMeter = Math.max(0.01, userDistanceCm / 100);

    let givenItems = [];
    let formulaData = {};
    let steps = [];
    let finalResult = {};
    let workshopInsight = {};

    if (calcTorqueMode === 'F') {
      const fCalc = Math.round(userTorqueVal / dMeter);
      const kgCalc = (fCalc / 9.8).toFixed(1);

      givenItems = [
        { label: 'Torsi Baut yang Dibutuhkan', symbol: 'τ', value: userTorqueVal, unit: 'Nm', note: 'Momen putar standar pengencangan baut' },
        { label: 'Jarak Pegangan Tangan ke Baut', symbol: 'd', value: `${userDistanceCm} cm = ${dMeter.toFixed(2)} m`, unit: '', note: 'Panjang lengan momen gaya' },
        { label: 'Percepatan Gravitasi Bumi', symbol: 'g', value: '9.8', unit: 'm/s²', note: 'Untuk konversi gaya (N) ke massa (kg)' }
      ];

      formulaData = {
        main: 'F = τ / d',
        title: 'Hukum Momen Gaya (Gaya Kuasa Pemutar Baut)',
        description: 'Momen gaya (torsi) didefinisikan sebagai hasil kali gaya tegak lurus (F) dengan jarak lengan momen (d): τ = F × d. Untuk mencari gaya otot yang diperlukan tangan: F = τ / d.',
        terms: ['τ = Torsi baut (Newton-meter / Nm)', 'F = Gaya dorong tangan (Newton / N)', 'd = Jarak lengan momen (meter / m)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Konversi Satuan Panjang Lengan ke Meter (SI)',
          math: `d = ${userDistanceCm} cm ÷ 100 = ${dMeter.toFixed(2)} meter`,
          note: 'Wajib dalam meter agar konsisten dengan satuan Torsi (Nm)'
        },
        {
          stepNum: 2,
          title: 'Substitusi Nilai ke Persamaan Gaya Kuasa (F = τ / d)',
          math: `F = ${userTorqueVal} Nm ÷ ${dMeter.toFixed(2)} m`,
          note: 'Bagi nilai torsi pengencangan baut dengan jarak lengan momen'
        },
        {
          stepNum: 3,
          title: 'Hitung Hasil Gaya Dorong Otot Tangan',
          math: `F = ${fCalc} Newton`,
          note: 'Besar gaya dorong murni yang harus dikerahkan telapak tangan siswa'
        },
        {
          stepNum: 4,
          title: 'Konversi ke Beban Massa Ekuivalen (m = F / g)',
          math: `m = ${fCalc} N ÷ 9.8 m/s² ≈ ${kgCalc} kg beban otot tangan`,
          note: `Tenaga ini setara dengan Anda mengangkat beban seberat ${kgCalc} kg!`
        }
      ];

      finalResult = {
        value: `${fCalc} Newton`,
        unit: `(~${kgCalc} kg)`,
        subtitle: `Gaya dorong otot tangan yang dibutuhkan untuk memutar baut`,
        badgeText: fCalc > 400 ? '🥵 SANGAT BERAT (>40 kg)' : (fCalc > 150 ? '🟡 SEDANG (15-40 kg)' : '😎 SUPER ENTENG (<15 kg)'),
        badgeColor: fCalc > 400 ? '#dc2626' : (fCalc > 150 ? '#d97706' : '#16a34a'),
        badgeBg: fCalc > 400 ? '#fee2e2' : (fCalc > 150 ? '#fef3c7' : '#dcfce7')
      };

      workshopInsight = {
        content: fCalc > 400
          ? '⚠️ BAHAYA CEDERA OTOT & BAUT SLEK: Gaya 400+ N terlalu berat untuk satu tangan! Siswa berisiko terpeleset, kunci pas terlepas, atau baut aus (selek). Solusi bengkel: Segera geser pegangan ke ujung kunci terluar atau sambungkan pipa besi (cheater pipe) agar jarak d bertambah panjang dan gaya F turun drastis!'
          : (fCalc > 150
            ? '🟡 KONDISI SEDANG: Dapat diputar menggunakan dorongan dua tangan dengan tumpuan kuda-kuda yang kokoh. Pastikan rahang kunci pas duduk tegak lurus sempurna pada kepala baut sebelum menekan.'
            : '✅ KONDISI IDEAL & AMAN: Posisi pegangan sangat tepat! Lengan momen yang panjang membuat gaya yang dibutuhkan sangat kecil. Baut berputar lancar tanpa risiko kelelahan otot ataupun kerusakan ulir.')
      };
    } else if (calcTorqueMode === 'tau') {
      const tauCalc = (userForceVal * dMeter).toFixed(1);

      givenItems = [
        { label: 'Gaya Dorong Otot Tangan', symbol: 'F', value: userForceVal, unit: 'Newton', note: `Setara dorongan beban ${(userForceVal / 9.8).toFixed(1)} kg` },
        { label: 'Jarak Pegangan Tangan ke Baut', symbol: 'd', value: `${userDistanceCm} cm = ${dMeter.toFixed(2)} m`, unit: '', note: 'Panjang lengan momen gaya kunci pas' }
      ];

      formulaData = {
        main: 'τ = F × d',
        title: 'Momen Gaya Putar Baut (Torsi Terpasang)',
        description: 'Torsi yang tersalurkan ke ulir baut berbanding lurus dengan gaya dorong otot dan panjang gagang kunci.',
        terms: ['F = Gaya dorong tangan (N)', 'd = Jarak lengan momen (m)', 'τ = Torsi baut (Nm)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Konversi Jarak Pegangan ke Satuan Meter',
          math: `d = ${userDistanceCm} cm ÷ 100 = ${dMeter.toFixed(2)} meter`,
          note: 'Jarak diukur dari titik pusat kepala baut hingga titik genggaman tangan'
        },
        {
          stepNum: 2,
          title: 'Substitusi Nilai ke Persamaan Torsi (τ = F × d)',
          math: `τ = ${userForceVal} N × ${dMeter.toFixed(2)} m`,
          note: 'Kalikan gaya dorong dengan jarak tegak lurus'
        },
        {
          stepNum: 3,
          title: 'Hitung Hasil Torsi Pengencangan Baut',
          math: `τ = ${tauCalc} Newton-meter (Nm)`,
          note: 'Total momen putar rotasi yang diteruskan ke ulir baut'
        }
      ];

      finalResult = {
        value: `${tauCalc} Nm`,
        unit: 'Newton-meter',
        subtitle: `Torsi rotasi yang masuk dan mengencangkan baut`,
        badgeText: '🔧 HASIL TORSI TERPASANG',
        badgeColor: '#0284c7',
        badgeBg: '#e0f2fe'
      };

      workshopInsight = {
        content: `💡 KETENTUAN PENGENCANGAN MESIN: Torsi sebesar ${tauCalc} Nm ini harus dicocokkan dengan Buku Panduan Reparasi (Service Manual). Jika baut silinder head motor membutuhkan 60 Nm dan Anda hanya menghasilkan ${tauCalc} Nm, packing silinder akan bocor. Sebaliknya, bila torsi berlebih melampaui kekuatan luluh baut, batang baut akan mulur melar dan patah di dalam blok mesin!`
      };
    } else if (calcTorqueMode === 'd') {
      const dCalcM = (userTorqueVal / Math.max(1, userForceVal)).toFixed(2);
      const dCalcCm = Math.round(Number(dCalcM) * 100);

      givenItems = [
        { label: 'Torsi Baut yang Dibutuhkan', symbol: 'τ', value: userTorqueVal, unit: 'Nm', note: 'Spesifikasi torsi standar pabrik' },
        { label: 'Batas Gaya Nyaman Tangan Siswa', symbol: 'F', value: userForceVal, unit: 'Newton', note: `Setara beban ${(userForceVal / 9.8).toFixed(1)} kg tenaga dorong siswa` }
      ];

      formulaData = {
        main: 'd = τ / F',
        title: 'Panjang Kunci Pas / Sambungan Minimal',
        description: 'Berdasarkan hukum momen gaya τ = F × d, maka panjang gagang kunci minimal yang dibutuhkan agar siswa tidak keberatan adalah d = τ / F.',
        terms: ['τ = Torsi target baut (Nm)', 'F = Batas gaya dorong siswa (N)', 'd = Jarak lengan kunci minimal (m)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Substitusi Nilai ke Persamaan Jarak Lengan (d = τ / F)',
          math: `d = ${userTorqueVal} Nm ÷ ${userForceVal} N`,
          note: 'Bagi nilai torsi baut dengan kapasitas tenaga otot siswa'
        },
        {
          stepNum: 2,
          title: 'Hitung Panjang Lengan dalam Meter',
          math: `d = ${dCalcM} meter`,
          note: 'Panjang kunci dalam Standar Internasional'
        },
        {
          stepNum: 3,
          title: 'Konversi Satuan Meter ke Centimeter (cm)',
          math: `d = ${dCalcM} × 100 = ${dCalcCm} cm`,
          note: 'Panjang aktual alat yang harus dipilih di kotak perkakas'
        }
      ];

      finalResult = {
        value: `${dCalcCm} cm`,
        unit: `(${dCalcM} meter)`,
        subtitle: `Panjang gagang kunci minimal agar tenaga siswa tidak melebihi ${userForceVal} N`,
        badgeText: '📏 PANJANG ALAT MINIMAL',
        badgeColor: '#0284c7',
        badgeBg: '#e0f2fe'
      };

      workshopInsight = {
        content: `🛠️ REKOMENDASI PERKAKAS BENGKEL: Kunci pas cincin biasa umumnya memiliki panjang 15-25 cm. Jika hasil perhitungan menuntut ${dCalcCm} cm, siswa disarankan menggunakan Gagang Kunci Shock Panjang (Breaker Bar / Sliding T-Handle) atau pipa besi penyambung agar momen gaya tercapai tanpa memaksakan otot lengan.`
      };
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

        {/* Live Pedagogical Calculation Card */}
        {renderPedagogicalCalculationCard({
          title: 'Bedah Langkah Perhitungan: Torsi Kunci Pas Baut',
          topicBadge: 'HUKUM MOMEN GAYA (τ = F × d)',
          themeColor: '#0284c7',
          lightBg: '#f0f9ff',
          borderColor: '#bae6fd',
          givenItems,
          formulaData,
          steps,
          finalResult,
          workshopInsight
        })}
      </div>
    );
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR LEVERS
  // ===========================================================================
  const renderLeverFormulaSolver = () => {
    const kmCalc = Number((userLeverLk / Math.max(0.1, userLeverLb)).toFixed(2));
    const kgW = (userLeverW / 9.8).toFixed(1);
    const kgF = (userLeverF / 9.8).toFixed(1);

    let givenItems = [];
    let formulaData = {};
    let steps = [];
    let finalResult = {};
    let workshopInsight = {};

    if (calcLeverMode === 'F') {
      const fCalc = Math.round(userLeverW / kmCalc);
      const kgFCalc = (fCalc / 9.8).toFixed(1);

      givenItems = [
        { label: 'Berat Beban yang Diangkat', symbol: 'W', value: userLeverW, unit: 'Newton', note: `Massa beban kerja asli ≈ ${kgW} kg` },
        { label: 'Panjang Lengan Beban', symbol: 'Lb', value: userLeverLb, unit: 'cm', note: 'Jarak titik beban ke titik tumpu (fulcrum)' },
        { label: 'Panjang Lengan Kuasa', symbol: 'Lk', value: userLeverLk, unit: 'cm', note: 'Jarak pegangan tangan kuasa ke titik tumpu' },
        { label: 'Keuntungan Mekanis Tuas', symbol: 'KM', value: `${kmCalc}×`, unit: 'Lipat', note: 'Faktor pengali peringan gaya kuasa (Lk / Lb)' }
      ];

      formulaData = {
        main: 'W × Lb = F × Lk   ➔   F = (W × Lb) / Lk = W / KM',
        title: 'Prinsip Kesetimbangan Tuas & Pengungkit (Hukum Archimedes)',
        description: 'Tuas bekerja dengan menyeimbangkan momen beban dan momen kuasa. Semakin panjang lengan kuasa (Lk) dibanding lengan beban (Lb), gaya otot tangan yang dibutuhkan semakin kecil.',
        terms: ['W = Gaya berat beban (N)', 'Lb = Panjang lengan beban (cm)', 'F = Gaya kuasa tangan (N)', 'Lk = Panjang lengan kuasa (cm)', 'KM = Keuntungan Mekanis = Lk / Lb']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Hitung Keuntungan Mekanis (KM) Pengali Gaya Tuas',
          math: `KM = Lk / Lb = ${userLeverLk} cm ÷ ${userLeverLb} cm = ${kmCalc}× Lipat`,
          note: `Tuas ini meringankan beban Anda sebesar ${kmCalc} kali lipat!`
        },
        {
          stepNum: 2,
          title: 'Hitung Momen Beban (Torsi Pembebanan)',
          math: `M_beban = W × Lb = ${userLeverW} N × ${userLeverLb} cm = ${(userLeverW * userLeverLb).toLocaleString()} N·cm`,
          note: 'Momen putar yang diciptakan oleh berat benda kerja'
        },
        {
          stepNum: 3,
          title: 'Substitusi Nilai ke Rumus Gaya Kuasa (F = M_beban / Lk)',
          math: `F = ${(userLeverW * userLeverLb).toLocaleString()} N·cm ÷ ${userLeverLk} cm`,
          note: 'Bagi momen beban dengan panjang lengan kuasa tangan'
        },
        {
          stepNum: 4,
          title: 'Hitung Hasil Gaya Kuasa Bersih yang Dikeluarkan',
          math: `F = ${fCalc} Newton`,
          note: 'Gaya dorong/tekan tangan yang dibutuhkan untuk mengangkat beban'
        },
        {
          stepNum: 5,
          title: 'Bandingkan Beban Tangan dengan Beban Asli (m = F / g)',
          math: `m_kuasa = ${fCalc} N ÷ 9.8 m/s² ≈ ${kgFCalc} kg (Beban asli ${kgW} kg berkurang drastis ${kmCalc}× lipat!)`,
          note: `Hanya setara mengangkat beban seberat ${kgFCalc} kg!`
        }
      ];

      finalResult = {
        value: `${fCalc} Newton`,
        unit: `(~${kgFCalc} kg)`,
        subtitle: `Gaya kuasa yang harus dikerahkan tangan siswa (diringankan ${kmCalc}× lipat)`,
        badgeText: kmCalc >= 4 ? '🚀 KM SANGAT TINGGI (SUPER RINGAN)' : (kmCalc >= 1 ? '✅ KM SEDANG (CUKUP RINGAN)' : '⚠️ KM RENDAH (BERAT)'),
        badgeColor: '#b45309',
        badgeBg: '#fef3c7'
      };

      workshopInsight = {
        content: `🛠️ APLIKASI BENGKEL MESIN & FABRIKASI: Prinsip ini diterapkan pada Tang Potong Kawat Baja, Gunting Plat Seng (Tin Snips), dan Linggis Pengungkit Mesin. Dengan mendesain gagang pegangan (Lk = ${userLeverLk} cm) jauh lebih panjang daripada mata potong (Lb = ${userLeverLb} cm), siswa sanggup memotong plat tebal atau mengungkit mesin seberat ${kgW} kg hanya dengan menekan pegangan sekuat ${kgFCalc} kg saja!`
      };
    } else if (calcLeverMode === 'W') {
      const wCalc = Math.round(userLeverF * kmCalc);
      const kgWCalc = (wCalc / 9.8).toFixed(1);

      givenItems = [
        { label: 'Gaya Kuasa Dorong Tangan', symbol: 'F', value: userLeverF, unit: 'Newton', note: `Tenaga otot siswa setara ≈ ${kgF} kg` },
        { label: 'Panjang Lengan Kuasa', symbol: 'Lk', value: userLeverLk, unit: 'cm', note: 'Jarak tangan ke fulcrum' },
        { label: 'Panjang Lengan Beban', symbol: 'Lb', value: userLeverLb, unit: 'cm', note: 'Jarak beban ke fulcrum' },
        { label: 'Keuntungan Mekanis', symbol: 'KM', value: `${kmCalc}×`, unit: 'Lipat', note: 'Lk / Lb' }
      ];

      formulaData = {
        main: 'W = (F × Lk) / Lb = F × KM',
        title: 'Kapasitas Angkat Beban Maksimal Tuas',
        description: 'Beban yang sanggup diangkat berbanding lurus dengan gaya kuasa dan perbandingan lengan tuas (KM).',
        terms: ['F = Gaya dorong (N)', 'Lk = Lengan kuasa (cm)', 'Lb = Lengan beban (cm)', 'W = Berat beban terangkat (N)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Hitung Keuntungan Mekanis Tuas (KM)',
          math: `KM = Lk / Lb = ${userLeverLk} cm ÷ ${userLeverLb} cm = ${kmCalc}× Lipat`,
          note: 'Pengali gaya yang dihasilkan geometri tuas'
        },
        {
          stepNum: 2,
          title: 'Substitusi Nilai ke Persamaan Beban (W = F × KM)',
          math: `W = ${userLeverF} N × ${kmCalc} = (${userLeverF} N × ${userLeverLk} cm) ÷ ${userLeverLb} cm`,
          note: 'Kalikan tenaga tangan dengan faktor keuntungan mekanis'
        },
        {
          stepNum: 3,
          title: 'Hitung Hasil Beban Maksimal Terangkat',
          math: `W = ${wCalc} Newton`,
          note: 'Gaya angkat maksimal yang diteruskan ke benda kerja'
        },
        {
          stepNum: 4,
          title: 'Konversi ke Satuan Massa Benda Terangkat (g = 9.8 m/s²)',
          math: `m_beban = ${wCalc} N ÷ 9.8 m/s² ≈ ${kgWCalc} kg`,
          note: `Tenaga tangan Anda yang hanya ${kgF} kg sanggup mengangkat benda seberat ${kgWCalc} kg!`
        }
      ];

      finalResult = {
        value: `${wCalc} Newton`,
        unit: `(~${kgWCalc} kg)`,
        subtitle: `Beban maksimal yang sanggup diangkat tuas pengungkit`,
        badgeText: '🏋️ BEBAN MAKSIMAL TERANGKAT',
        badgeColor: '#b45309',
        badgeBg: '#fef3c7'
      };

      workshopInsight = {
        content: `🪵 PRAKTIK PEMINDAHAN MESIN: Dengan linggis pengungkit rasio ${kmCalc}x, seorang teknisi dapat mengangkat ujung mesin bubut/frais seberat ${kgWCalc} kg untuk menyelipkan dongkrak botol atau balok kayu penopang tanpa memerlukan alat berat derek!`
      };
    } else if (calcLeverMode === 'Lk') {
      const lkCalc = Math.round((userLeverW * userLeverLb) / Math.max(1, userLeverF));

      givenItems = [
        { label: 'Berat Beban yang Diangkat', symbol: 'W', value: userLeverW, unit: 'Newton', note: `Massa beban ≈ ${kgW} kg` },
        { label: 'Panjang Lengan Beban', symbol: 'Lb', value: userLeverLb, unit: 'cm', note: 'Jarak beban ke fulcrum' },
        { label: 'Batas Gaya Kuasa Tangan Nyaman', symbol: 'F', value: userLeverF, unit: 'Newton', note: `Tenaga tangan siswa ≈ ${kgF} kg` }
      ];

      formulaData = {
        main: 'Lk = (W × Lb) / F',
        title: 'Panjang Lengan Kuasa Minimal yang Dibutuhkan',
        description: 'Berdasarkan hukum kesetimbangan tuas W × Lb = F × Lk, panjang gagang kuasa minimal adalah Lk = (W × Lb) / F.',
        terms: ['W = Berat beban (N)', 'Lb = Lengan beban (cm)', 'F = Gaya kuasa (N)', 'Lk = Lengan kuasa minimal (cm)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Hitung Momen Beban (Torsi yang Harus Diimbangi)',
          math: `M_beban = W × Lb = ${userLeverW} N × ${userLeverLb} cm = ${(userLeverW * userLeverLb).toLocaleString()} N·cm`,
          note: 'Momen putar dari sisi beban'
        },
        {
          stepNum: 2,
          title: 'Substitusi Nilai ke Persamaan Lengan Kuasa (Lk = M_beban / F)',
          math: `Lk = ${(userLeverW * userLeverLb).toLocaleString()} N·cm ÷ ${userLeverF} N`,
          note: 'Bagi momen beban dengan batas kekuatan dorong tangan'
        },
        {
          stepNum: 3,
          title: 'Hitung Panjang Gagang Kuasa Minimal',
          math: `Lk = ${lkCalc} cm (${(lkCalc / 100).toFixed(2)} meter)`,
          note: 'Panjang tuas minimal agar tangan tidak kelelahan'
        }
      ];

      finalResult = {
        value: `${lkCalc} cm`,
        unit: `(${(lkCalc / 100).toFixed(2)} m)`,
        subtitle: `Panjang gagang kuasa minimal agar siswa kuat mengangkat beban`,
        badgeText: '📏 PANJANG GAGANG KUASA',
        badgeColor: '#b45309',
        badgeBg: '#fef3c7'
      };

      workshopInsight = {
        content: `✂️ DESAIN PERKAKAS POTONG: Pada gunting pemotong plat seng, mata pisau sengaja dibuat pendek (Lb = ${userLeverLb} cm), dan gagang didesain panjang (Lk = ${lkCalc} cm). Jika gagang terlalu pendek, tangan siswa akan kram dan plat baja tidak akan terpotong rapi.`
      };
    } else {
      givenItems = [
        { label: 'Panjang Lengan Kuasa', symbol: 'Lk', value: userLeverLk, unit: 'cm', note: 'Jarak tangan ke fulcrum' },
        { label: 'Panjang Lengan Beban', symbol: 'Lb', value: userLeverLb, unit: 'cm', note: 'Jarak beban ke fulcrum' }
      ];

      formulaData = {
        main: 'KM = Lk / Lb = W / F',
        title: 'Keuntungan Mekanis (Mechanical Advantage)',
        description: 'Keuntungan mekanis menunjukkan berapa kali lipat tuas mampu menggandakan gaya yang diberikan tangan pengguna.',
        terms: ['Lk = Lengan kuasa (cm)', 'Lb = Lengan beban (cm)', 'KM = Keuntungan Mekanis (rasio)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Substitusi Panjang Lengan ke Rumus KM',
          math: `KM = Lk / Lb = ${userLeverLk} cm ÷ ${userLeverLb} cm`,
          note: 'Bagi panjang lengan kuasa dengan panjang lengan beban'
        },
        {
          stepNum: 2,
          title: 'Hitung Rasio Keuntungan Mekanis',
          math: `KM = ${kmCalc}× Lipat`,
          note: 'Tenaga Anda dilipatgandakan sebesar angka ini'
        }
      ];

      finalResult = {
        value: `${kmCalc}× Lipat`,
        unit: 'Rasio Pengali Gaya',
        subtitle: `Gaya kuasa diperbesar sebesar ${kmCalc} kali lipat pada sisi beban`,
        badgeText: kmCalc >= 1 ? '✅ MENGUNTUNGKAN (GAYA BERKURANG)' : '⚠️ KM < 1 (KECEPATAN/JARAK)',
        badgeColor: '#b45309',
        badgeBg: '#fef3c7'
      };

      workshopInsight = {
        content: `🔍 KLASIFIKASI 3 KELAS TUAS: 
• Tuas Kelas 1 (Titik Tumpu di tengah): Tang kombinasi, linggis, gunting plat.
• Tuas Kelas 2 (Beban di tengah): Gerobak dorong roda satu, pemotong kertas plat. Selalu memiliki KM > 1!
• Tuas Kelas 3 (Kuasa di tengah): Pinset presisi, sumpit, sekop. KM < 1 tetapi memberikan jangkauan gerak presisi.`
      };
    }

    // Dynamic Fulcrum Ratio for SVG diagram
    const totL = Math.max(1, userLeverLb + userLeverLk);
    const fulcrumX = 60 + (userLeverLb / totL) * 260;

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
                Kalkulator Rumus &amp; Simulator Sistem Tuas (Pengungkit)
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
            { id: 'F', label: '1. Cari Gaya Kuasa (F = [W × Lb] / Lk)' },
            { id: 'W', label: '2. Cari Beban Terangkat (W = [F × Lk] / Lb)' },
            { id: 'Lk', label: '3. Cari Lengan Kuasa (Lk = [W × Lb] / F)' },
            { id: 'KM', label: '4. Cari Keuntungan Mekanis (KM = Lk / Lb)' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { sound.playClick(); setCalcLeverMode(m.id); }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
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
            ⚡ CONTOH KASUS TUAS BENGKEL (Klik isi otomatis):
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

        {/* Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {calcLeverMode !== 'W' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Berat Beban (W):</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="number" value={userLeverW} onChange={(e) => setUserLeverW(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>Newton</span>
              </div>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Lengan Beban (Lb):</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="number" value={userLeverLb} onChange={(e) => setUserLeverLb(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
              <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>cm</span>
            </div>
          </div>
          {calcLeverMode !== 'Lk' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Lengan Kuasa (Lk):</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="number" value={userLeverLk} onChange={(e) => setUserLeverLk(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>cm</span>
              </div>
            </div>
          )}
          {calcLeverMode !== 'F' && calcLeverMode !== 'KM' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Gaya Kuasa Anda (F):</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="number" value={userLeverF} onChange={(e) => setUserLeverF(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>Newton</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Interactive Lever Visual Diagram */}
        <div style={{
          background: '#0f172a',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #334155'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Simulasi Visual Diagram Kesetimbangan Tuas (Fulcrum, Beban W &amp; Kuasa F):
          </div>

          <svg viewBox="0 0 380 130" width="100%" height="130">
            {/* Ground Line */}
            <line x1="20" y1="90" x2="360" y2="90" stroke="#475569" strokeWidth="2" strokeDasharray="4,3" />

            {/* Fulcrum Triangle */}
            <polygon points={`${fulcrumX - 14},90 ${fulcrumX + 14},90 ${fulcrumX},65`} fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            <circle cx={fulcrumX} cy="65" r="4" fill="#0f172a" />
            <text x={fulcrumX} y="104" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">Tumpuan (Fulcrum)</text>

            {/* Lever Bar */}
            <line x1="45" y1="65" x2="335" y2="65" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />

            {/* Load Weight Box (Left) */}
            <rect x="35" y="32" width="30" height="28" rx="4" fill="#dc2626" stroke="#f87171" strokeWidth="1.5" />
            <text x="50" y="49" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">W</text>
            <text x="50" y="24" textAnchor="middle" fill="#f87171" fontSize="8.5" fontWeight="900">{userLeverW} N</text>

            {/* Downward Load Gravity Arrow */}
            <line x1="50" y1="60" x2="50" y2="78" stroke="#f87171" strokeWidth="2.5" />
            <polygon points="46,74 50,82 54,74" fill="#f87171" />

            {/* Hand / Effort (Right) */}
            <circle cx="330" cy="42" r="14" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
            <text x="330" y="46" textAnchor="middle" fontSize="12">✋</text>
            <text x="330" y="20" textAnchor="middle" fill="#34d399" fontSize="8.5" fontWeight="900">
              F = {calcLeverMode === 'F' ? Math.round(userLeverW / kmCalc) : userLeverF} N
            </text>

            {/* Downward Effort Press Arrow */}
            <line x1="330" y1="56" x2="330" y2="78" stroke="#10b981" strokeWidth="2.5" />
            <polygon points="326,74 330,82 334,74" fill="#10b981" />

            {/* Dimension Line Lb */}
            <line x1="50" y1="114" x2={fulcrumX} y2="114" stroke="#fca5a5" strokeWidth="1.5" />
            <text x={(50 + fulcrumX) / 2} y="124" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontWeight="bold">
              Lb = {userLeverLb} cm
            </text>

            {/* Dimension Line Lk */}
            <line x1={fulcrumX} y1="114" x2="330" y2="114" stroke="#6ee7b7" strokeWidth="1.5" />
            <text x={(fulcrumX + 330) / 2} y="124" textAnchor="middle" fill="#6ee7b7" fontSize="7.5" fontWeight="bold">
              Lk = {userLeverLk} cm
            </text>
          </svg>
        </div>

        {/* Live Pedagogical Calculation Card */}
        {renderPedagogicalCalculationCard({
          title: 'Bedah Langkah Perhitungan: Kesetimbangan Tuas Pengungkit',
          topicBadge: 'HUKUM TUAS ARCHIMEDES (W × Lb = F × Lk)',
          themeColor: '#d97706',
          lightBg: '#fffbeb',
          borderColor: '#fed7aa',
          givenItems,
          formulaData,
          steps,
          finalResult,
          workshopInsight
        })}
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
    const kgP = (P / 9.8).toFixed(1);
    const kgRA = (rA / 9.8).toFixed(1);
    const kgRB = (rB / 9.8).toFixed(1);

    const givenItems = [
      { label: 'Panjang Bentang Balok Derek', symbol: 'L', value: L, unit: 'meter', note: 'Jarak antara tumpuan Sendi A ke Rol B' },
      { label: 'Beban Crane Terpusat', symbol: 'P', value: P, unit: 'Newton', note: `Berat mesin derek ≈ ${kgP} kg` },
      { label: 'Jarak Beban dari Tumpuan A', symbol: 'x', value: x, unit: 'meter', note: 'Posisi gantungan hoist dari tiang tumpuan A' },
      { label: 'Jarak Beban ke Tumpuan B', symbol: 'L - x', value: (L - x).toFixed(2), unit: 'meter', note: 'Lengan momen terhadap tumpuan B' }
    ];

    const formulaData = {
      main: 'ΣMB = 0  ➔  RA = [P × (L - x)] / L   |   ΣFy = 0  ➔  RB = P - RA',
      title: 'Kesetimbangan Statika Struktur Balok Crane Sederhana',
      description: 'Struktur balok crane jembatan ditopang oleh tumpuan Sendi di A (menahan gaya vertikal & horizontal) dan tumpuan Rol di B (menahan gaya vertikal serta bebas memuai horizontal). Syarat kesetimbangan mutlak: ΣM = 0 dan ΣFy = 0.',
      terms: ['RA = Reaksi tumpuan Sendi A (N)', 'RB = Reaksi tumpuan Rol B (N)', 'P = Beban terpusat crane (N)', 'L = Bentang balok (m)', 'x = Jarak beban ke titik A (m)', 'Mmax = Momen lentur maksimum balok (Nm)']
    };

    const steps = [
      {
        stepNum: 1,
        title: 'Hitung Jarak Lengan Beban ke Titik Tumpuan Rol B',
        math: `dB = L - x = ${L} m - ${x} m = ${(L - x).toFixed(2)} meter`,
        note: 'Jarak horizontal dari garis kerja beban P ke titik tumpuan B'
      },
      {
        stepNum: 2,
        title: 'Terapkan Syarat Kesetimbangan Momen di Titik B (ΣMB = 0)',
        math: `+(RA × ${L} m) - [${P} N × ${(L - x).toFixed(2)} m] = 0 ➔ RA × ${L} = ${(P * (L - x)).toFixed(1)} N·m`,
        note: 'Gaya RA memutar searah jarum jam (+), beban P memutar berlawanan (-)'
      },
      {
        stepNum: 3,
        title: 'Hitung Besarnya Reaksi Tumpuan Sendi A (RA)',
        math: `RA = ${(P * (L - x)).toFixed(1)} N·m ÷ ${L} m = ${rA} Newton (~${kgRA} kg)`,
        note: 'Gaya vertikal ke atas yang ditahan oleh tiang fondasi A'
      },
      {
        stepNum: 4,
        title: 'Terapkan Syarat Kesetimbangan Gaya Vertikal (ΣFy = 0)',
        math: `RA + RB - P = 0 ➔ RB = P - RA = ${P} N - ${rA} N = ${rB} Newton (~${kgRB} kg)`,
        note: 'Gaya vertikal ke atas yang ditahan oleh tiang fondasi B'
      },
      {
        stepNum: 5,
        title: 'Uji Kebenaran Kesetimbangan Statis (Cross-Check)',
        math: `RA + RB = ${rA} N + ${rB} N = ${rA + rB} N (Sama persis dengan Beban P = ${P} N ➔ ✅ TERBUKTI SEIMBANG!)`,
        note: 'Jumlah gaya penahan ke atas tepat sama dengan gaya beban ke bawah'
      },
      {
        stepNum: 6,
        title: 'Hitung Momen Lentur Maksimum pada Balok (Bending Moment Mmax)',
        math: `Mmax = RA × x = ${rA} N × ${x} m = ${mMax} Newton-meter (N·m)`,
        note: 'Terjadi tepat di titik gantungan beban hoist crane'
      }
    ];

    const finalResult = {
      value: `RA = ${rA} N  |  RB = ${rB} N`,
      unit: `(Mmax = ${mMax} Nm)`,
      subtitle: `Tiang A memikul ~${kgRA} kg, Tiang B memikul ~${kgRB} kg`,
      badgeText: '⚖️ KESETIMBANGAN STATIS TERBUKTI',
      badgeColor: '#166534',
      badgeBg: '#dcfce7'
    };

    const workshopInsight = {
      content: `🏗️ ANALISIS REKAYASA CRANE BENGKEL: Perhatikan bahwa tumpuan ${x < L / 2 ? 'Sendi A' : (x > L / 2 ? 'Rol B' : 'Sendi A dan Rol B')} memikul porsi beban lebih besar (${Math.max(rA, rB)} N) karena posisi hoist derek lebih condong ke arahnya (${x} m dari tiang A). Nilai Momen Lentur Maksimal Mmax = ${mMax} Nm adalah angka kritis yang digunakan insinyur mesin untuk menentukan profil baja I-Beam / WF (Wide Flange) agar balok jembatan crane tidak melengkung (defleksi) ataupun patah saat mengangkat mesin berat!`
    };

    // Calculate load position in SVG
    const loadSvgX = 50 + (x / L) * 280;

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
              { label: '🏗️ Dekat Tiang A (x = 1.5 m)', l: 6, p: 1200, x: 1.5 },
              { label: '⚖️ Pas di Tengah (x = 3.0 m)', l: 6, p: 1200, x: 3.0 },
              { label: '🚜 Dekat Tiang B (x = 4.5 m)', l: 6, p: 1200, x: 4.5 }
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Panjang Balok (L):</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="number" value={userBeamL} onChange={(e) => setUserBeamL(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
              <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>meter</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Beban Crane (P):</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="number" value={userBeamP} onChange={(e) => setUserBeamP(Math.max(10, Number(e.target.value)))} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
              <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>Newton</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Jarak Beban dari Tumpuan A (x):</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type="number" step="0.5" value={userBeamX} onChange={(e) => setUserBeamX(Math.max(0, Math.min(userBeamL, Number(e.target.value))))} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
              <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>meter</span>
            </div>
          </div>
        </div>

        {/* Live Crane Beam Visual Diagram */}
        <div style={{
          background: '#0f172a',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #334155'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Simulasi Visual Reaksi Tumpuan Balok Derek (Sendi A, Rol B, Beban P):
          </div>

          <svg viewBox="0 0 380 130" width="100%" height="130">
            {/* Beam Body */}
            <rect x="50" y="55" width="280" height="12" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Support A (Pin / Sendi) */}
            <polygon points="40,88 60,88 50,67" fill="#10b981" stroke="#059669" strokeWidth="1.5" />
            <line x1="36" y1="88" x2="64" y2="88" stroke="#cbd5e1" strokeWidth="2" />
            <text x="50" y="100" textAnchor="middle" fill="#34d399" fontSize="7.5" fontWeight="bold">Sendi A</text>

            {/* Reaction RA Upward Arrow */}
            <line x1="50" y1="52" x2="50" y2="28" stroke="#34d399" strokeWidth="2.5" />
            <polygon points="46,32 50,24 54,32" fill="#34d399" />
            <text x="50" y="18" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="900">RA = {rA} N</text>

            {/* Support B (Roller / Rol) */}
            <polygon points="320,84 340,84 330,67" fill="#10b981" stroke="#059669" strokeWidth="1.5" />
            <circle cx="324" cy="87" r="3" fill="#cbd5e1" />
            <circle cx="336" cy="87" r="3" fill="#cbd5e1" />
            <line x1="316" y1="91" x2="344" y2="91" stroke="#cbd5e1" strokeWidth="2" />
            <text x="330" y="100" textAnchor="middle" fill="#34d399" fontSize="7.5" fontWeight="bold">Rol B</text>

            {/* Reaction RB Upward Arrow */}
            <line x1="330" y1="52" x2="330" y2="28" stroke="#34d399" strokeWidth="2.5" />
            <polygon points="326,32 330,24 334,32" fill="#34d399" />
            <text x="330" y="18" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="900">RB = {rB} N</text>

            {/* Load Hoist P at distance x */}
            <line x1={loadSvgX} y1="67" x2={loadSvgX} y2="90" stroke="#f87171" strokeWidth="2" />
            <rect x={loadSvgX - 14} y="90" width="28" height="20" rx="3" fill="#dc2626" stroke="#f87171" strokeWidth="1" />
            <text x={loadSvgX} y="103" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="900">{P} N</text>
            <text x={loadSvgX} y="82" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontWeight="bold">P (Beban)</text>

            {/* Dimension Lines */}
            <line x1="50" y1="120" x2={loadSvgX} y2="120" stroke="#94a3b8" strokeWidth="1" />
            <text x={(50 + loadSvgX) / 2} y="117" textAnchor="middle" fill="#cbd5e1" fontSize="7">x = {x} m</text>
            <line x1={loadSvgX} y1="120" x2="330" y2="120" stroke="#94a3b8" strokeWidth="1" />
            <text x={(loadSvgX + 330) / 2} y="117" textAnchor="middle" fill="#cbd5e1" fontSize="7">{(L - x).toFixed(2)} m</text>
          </svg>
        </div>

        {/* Live Pedagogical Calculation Card */}
        {renderPedagogicalCalculationCard({
          title: 'Bedah Langkah Perhitungan: Reaksi Tumpuan Balok Derek',
          topicBadge: 'KESETIMBANGAN STATIS (ΣM = 0 | ΣFy = 0)',
          themeColor: '#059669',
          lightBg: '#f0fdf4',
          borderColor: '#bbf7d0',
          givenItems,
          formulaData,
          steps,
          finalResult,
          workshopInsight
        })}
      </div>
    );
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR TENSILE STRESS
  // ===========================================================================
  const renderStressFormulaSolver = () => {
    const areaMm2 = Number((Math.PI * Math.pow(userStressD / 2, 2)).toFixed(2));

    let givenItems = [];
    let formulaData = {};
    let steps = [];
    let finalResult = {};
    let workshopInsight = {};

    // Stress state color evaluation
    let liveStressMPa = 0;
    if (calcStressMode === 'sigma') {
      liveStressMPa = Math.round(userStressF / areaMm2);
    } else if (calcStressMode === 'F_max') {
      liveStressMPa = userStressIzin;
    } else {
      liveStressMPa = userStressIzin;
    }

    let boltVisualColor = '#10b981';
    let boltVisualLabel = '🟢 Zona Elastis (Aman)';
    if (liveStressMPa > 450) {
      boltVisualColor = '#dc2626';
      boltVisualLabel = '🔴 Patah Terbelah (Fracture)';
    } else if (liveStressMPa > 250) {
      boltVisualColor = '#f59e0b';
      boltVisualLabel = '🟡 Zona Plastis (Mulur Permanen)';
    }

    if (calcStressMode === 'sigma') {
      const sCalc = Math.round(userStressF / areaMm2);
      const sf = Number((userStressIzin / Math.max(1, sCalc)).toFixed(2));
      const kgF = (userStressF / 9.8).toFixed(0);

      givenItems = [
        { label: 'Gaya Tarik Aksial', symbol: 'F', value: userStressF, unit: 'Newton', note: `Beban tarik setara ≈ ${kgF} kg` },
        { label: 'Diameter Batang Baut', symbol: 'd', value: userStressD, unit: 'mm', note: 'Diameter nominal silinder baut' },
        { label: 'Tegangan Izin Baja Baut', symbol: 'σ_izin', value: userStressIzin, unit: 'MPa', note: 'Batas elastis aman material (N/mm²)' }
      ];

      formulaData = {
        main: 'A = (π / 4) × d²   ➔   σ = F / A   ➔   SF = σ_izin / σ',
        title: 'Tegangan Tarik Aksial Baut (Tegangan Normal σ)',
        description: 'Tegangan tarik adalah intensitas gaya dalam yang timbul per satuan luas penampang material silinder baut untuk menahan tarikan: σ = F / A.',
        terms: ['F = Gaya tarik aksial (N)', 'd = Diameter baut (mm)', 'A = Luas penampang melintang (mm²)', 'σ = Tegangan tarik normal (MPa = N/mm²)', 'SF = Safety Factor (Faktor Keamanan)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Hitung Luas Penampang Melintang Baut Silinder (A)',
          math: `A = (π / 4) × d² = (3.1416 / 4) × (${userStressD} mm)² = 0.7854 × ${userStressD * userStressD} = ${areaMm2} mm²`,
          note: 'Penampang lingkaran baut yang aktif memikul gaya tarik'
        },
        {
          stepNum: 2,
          title: 'Substitusi Nilai ke Persamaan Tegangan Tarik (σ = F / A)',
          math: `σ = ${userStressF} N ÷ ${areaMm2} mm²`,
          note: 'Bagi beban tarik dengan luas penampang melintang baut'
        },
        {
          stepNum: 3,
          title: 'Hitung Besarnya Tegangan Tarik yang Bekerja',
          math: `σ = ${sCalc} MPa (N/mm²)`,
          note: 'Tegangan aktual yang dialami molekul baja baut'
        },
        {
          stepNum: 4,
          title: 'Evaluasi Angka Keamanan (Safety Factor SF = σ_izin / σ)',
          math: `SF = ${userStressIzin} MPa ÷ ${sCalc} MPa = ${sf}`,
          note: sf >= 1.0 ? 'SF ≥ 1.0 ➔ Baut berada di zona elastis aman!' : 'SF < 1.0 ➔ Tegangan melampaui batas aman baja!'
        }
      ];

      finalResult = {
        value: `${sCalc} MPa`,
        unit: '(N/mm²)',
        subtitle: `Tegangan kerja yang timbul pada penampang baut (SF = ${sf})`,
        badgeText: sCalc <= 250 ? '🟢 ZONA ELASTIS (AMAN)' : (sCalc <= 450 ? '🟡 ZONA PLASTIS (MULUR PERMANEN)' : '🔴 BAHAYA PATAH PUTUS (FRACTURE)'),
        badgeColor: sCalc <= 250 ? '#16a34a' : (sCalc <= 450 ? '#d97706' : '#dc2626'),
        badgeBg: sCalc <= 250 ? '#dcfce7' : (sCalc <= 450 ? '#fef3c7' : '#fee2e2')
      };

      workshopInsight = {
        content: sCalc <= 250
          ? '✅ KONDISI IDEAL & AMAN BENGKEL: Baut masih bekerja di Zona Elastis (Hukum Hooke). Saat baut dikencangkan, baut meregang mikro untuk mengunci kuat, dan bila mur dilepas baut akan kembali ke panjang semula tanpa cacat permanen.'
          : (sCalc <= 450
            ? '⚠️ PERINGATAN BENGKEL: Tegangan melewati batas luluh (Yield Strength)! Baut mengalami deformasi plastis (mulur permanen). Ulir baut akan melar, baut menjadi kendor sendiri saat mesin bergetar, dan tidak boleh digunakan kembali!'
            : '💥 BAHAYA PATAH CRITICAL: Tegangan melampaui Ultimate Tensile Strength (UTS)! Baut mengalami penyempitan diameter ekstrem (necking) dan patah terbelah dua. Jika ini baut silinder head motor, kompresi akan meledak keluar!')
      };
    } else if (calcStressMode === 'F_max') {
      const fMax = Math.round(userStressIzin * areaMm2);
      const kgFMax = (fMax / 9.8).toFixed(0);

      givenItems = [
        { label: 'Diameter Batang Baut', symbol: 'd', value: userStressD, unit: 'mm', note: 'Ukuran nominal baut' },
        { label: 'Luas Penampang Baut', symbol: 'A', value: areaMm2, unit: 'mm²', note: 'A = (π / 4) × d²' },
        { label: 'Tegangan Izin Baja', symbol: 'σ_izin', value: userStressIzin, unit: 'MPa', note: 'Batas elastis aman material' }
      ];

      formulaData = {
        main: 'A = (π / 4) × d²   ➔   F_max = σ_izin × A',
        title: 'Kapasitas Beban Tarik Aman Maksimal Baut',
        description: 'Gaya tarik maksimal yang diperbolehkan agar tegangan tidak melampaui tegangan izin bahan baut.',
        terms: ['A = Luas penampang (mm²)', 'σ_izin = Batas tegangan aman baja (MPa)', 'F_max = Beban tarik aman maksimal (N)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Hitung Luas Penampang Silinder Baut (A)',
          math: `A = (3.1416 / 4) × (${userStressD} mm)² = ${areaMm2} mm²`,
          note: 'Luas penampang melintang silinder'
        },
        {
          stepNum: 2,
          title: 'Substitusi ke Persamaan Gaya Tarik Maksimal (F_max = σ_izin × A)',
          math: `F_max = ${userStressIzin} MPa × ${areaMm2} mm²`,
          note: 'Kalikan batas tegangan izin dengan luas penampang'
        },
        {
          stepNum: 3,
          title: 'Hitung Hasil Gaya Tarik Maksimal',
          math: `F_max = ${fMax} Newton`,
          note: 'Batas gaya tarik aksial aman'
        },
        {
          stepNum: 4,
          title: 'Konversi ke Satuan Massa Beban Angkat (g = 9.8 m/s²)',
          math: `m_max = ${fMax} N ÷ 9.8 m/s² ≈ ${kgFMax} kg beban angkat`,
          note: `Baut M${userStressD} ini sanggup menahan gantungan beban hingga ${kgFMax} kg!`
        }
      ];

      finalResult = {
        value: `${fMax} Newton`,
        unit: `(~${kgFMax} kg)`,
        subtitle: `Beban tarik aman maksimal sebelum baut mengalami kerusakan ulir`,
        badgeText: '🛡️ BEBAN AMAN MAKSIMAL',
        badgeColor: '#7c3aed',
        badgeBg: '#ede9fe'
      };

      workshopInsight = {
        content: `🔩 APLIKASI BENGKEL: Mengetahui bahwa baut M${userStressD} berdaya tahan maksimal ${fMax} N (~${kgFMax} kg) sangat penting saat memasang Baut Pengait Mesin (Eyebolt) untuk mengangkat mesin dengan crane atau merakit sambungan flens pipa bertekanan tinggi.`
      };
    } else {
      const dMin = Number((Math.sqrt((4 * userStressF) / (Math.PI * userStressIzin))).toFixed(2));
      const kgF = (userStressF / 9.8).toFixed(0);

      givenItems = [
        { label: 'Gaya Tarik yang Harus Ditahan', symbol: 'F', value: userStressF, unit: 'Newton', note: `Beban tarik ≈ ${kgF} kg` },
        { label: 'Tegangan Izin Baja Baut', symbol: 'σ_izin', value: userStressIzin, unit: 'MPa', note: 'Batas tegangan aman material' }
      ];

      formulaData = {
        main: 'A_min = F / σ_izin   ➔   d_min = √[(4 × F) / (π × σ_izin)]',
        title: 'Diameter Baut Minimal yang Wajib Dipilih (Standard Sizing)',
        description: 'Untuk memastikan baut tidak melar permanen di bawah beban tarik F, luas penampang minimal dihitung dengan membagi gaya terhadap tegangan izin, kemudian mencari diameter minimumnya.',
        terms: ['F = Beban tarik (N)', 'σ_izin = Tegangan izin (MPa)', 'd_min = Diameter baut minimal (mm)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Hitung Luas Penampang Minimal yang Dibutuhkan (A_min = F / σ_izin)',
          math: `A_min = ${userStressF} N ÷ ${userStressIzin} MPa = ${(userStressF / userStressIzin).toFixed(2)} mm²`,
          note: 'Luas baja minimal agar tegangan tidak melampaui batas izin'
        },
        {
          stepNum: 2,
          title: 'Substitusi ke Rumus Diameter Lingkaran: d_min = √[(4 × A_min) / π]',
          math: `d_min = √[(4 × ${(userStressF / userStressIzin).toFixed(2)}) ÷ 3.1416] = √${((4 * userStressF) / (Math.PI * userStressIzin)).toFixed(2)}`,
          note: 'Mencari diameter dari luas lingkaran'
        },
        {
          stepNum: 3,
          title: 'Hitung Nilai Diameter Minimal',
          math: `d_min = ${dMin} mm`,
          note: 'Diameter terkecil yang diizinkan secara teoritis'
        },
        {
          stepNum: 4,
          title: 'Rekomendasi Pemilihan Baut Metrik Standar ISO',
          math: `Pilih Baut Ukuran Minimal: M${Math.ceil(dMin)} (Diameter ${Math.ceil(dMin)} mm)`,
          note: `Karena ukuran ${dMin} mm bukan standar dagang, bulatkan ke atas ke M${Math.ceil(dMin)}!`
        }
      ];

      finalResult = {
        value: `${dMin} mm`,
        unit: `(Pilih Standar M${Math.ceil(dMin)})`,
        subtitle: `Diameter baut minimal yang wajib dipakai untuk menahan beban ${userStressF} N`,
        badgeText: '📐 DIAMETER BAUT MINIMAL',
        badgeColor: '#7c3aed',
        badgeBg: '#ede9fe'
      };

      workshopInsight = {
        content: `📦 STANDAR TEKNIK MESIN: Di bengkel mesin, baut diproduksi mengikuti standar metrik ISO (M6, M8, M10, M12, M14, M16, dst.). Karena perhitungan menghasilkan ${dMin} mm, teknisi wajib memilih baut dengan diameter nominal sama atau lebih besar, yaitu Baut M${Math.ceil(dMin)}.`
      };
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
                Kalkulator Rumus &amp; Simulator Tegangan Baut (Hukum Hooke)
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
                padding: '8px 12px',
                borderRadius: '8px',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {calcStressMode !== 'F_max' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Gaya Tarik (F):</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="number" value={userStressF} onChange={(e) => setUserStressF(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>Newton</span>
              </div>
            </div>
          )}
          {calcStressMode !== 'd_min' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Diameter Baut (d):</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="number" value={userStressD} onChange={(e) => setUserStressD(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>mm</span>
              </div>
            </div>
          )}
          {calcStressMode !== 'sigma' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Tegangan Izin Baja (σ):</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input type="number" value={userStressIzin} onChange={(e) => setUserStressIzin(Math.max(1, Number(e.target.value)))} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }} />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>MPa</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Bolt Tensile Specimen Visual Diagram */}
        <div style={{
          background: '#0f172a',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Simulasi Visual Benda Uji Tarik Baut Silinder (Gaya F &amp; Luas Penampang A):
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: boltVisualColor, background: `${boltVisualColor}25`, padding: '2px 8px', borderRadius: '4px' }}>
              {boltVisualLabel}
            </span>
          </div>

          <svg viewBox="0 0 380 120" width="100%" height="120">
            {/* Left Chuck Clamp */}
            <rect x="25" y="32" width="30" height="56" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <line x1="15" y1="60" x2="3" y2="60" stroke="#f87171" strokeWidth="2.5" />
            <polygon points="7,56 0,60 7,64" fill="#f87171" />
            <text x="5" y="48" textAnchor="middle" fill="#f87171" fontSize="7.5" fontWeight="bold">F (Tarik)</text>

            {/* Right Chuck Clamp */}
            <rect x="325" y="32" width="30" height="56" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <line x1="365" y1="60" x2="377" y2="60" stroke="#f87171" strokeWidth="2.5" />
            <polygon points="373,56 380,60 373,64" fill="#f87171" />
            <text x="375" y="48" textAnchor="middle" fill="#f87171" fontSize="7.5" fontWeight="bold">F (Tarik)</text>

            {/* Bolt Cylinder Body */}
            {(() => {
              const cylHeight = Math.min(40, Math.max(12, userStressD * 2));
              const cylY = 60 - cylHeight / 2;
              return (
                <g>
                  {/* Outer Bolt Body */}
                  <rect x="55" y={cylY} width="270" height={cylHeight} rx="3" fill={boltVisualColor} opacity="0.85" stroke="#ffffff" strokeWidth="1" />

                  {/* Circular Cross-Section Cutout View */}
                  <circle cx="190" cy="60" r={cylHeight / 2} fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3,2" />
                  <text x="190" y="63" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold">A</text>
                  <text x="190" y={cylY - 4} textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
                    d = {userStressD} mm | A = {areaMm2} mm²
                  </text>
                </g>
              );
            })()}

            {/* Bolt Thread Texture Lines */}
            <line x1="75" y1="42" x2="75" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <line x1="90" y1="42" x2="90" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <line x1="105" y1="42" x2="105" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <line x1="275" y1="42" x2="275" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <line x1="290" y1="42" x2="290" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <line x1="305" y1="42" x2="305" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

            {/* Stress Readout Badge on SVG */}
            <text x="190" y="108" textAnchor="middle" fill={boltVisualColor} fontSize="9" fontWeight="900">
              Tegangan: {calcStressMode === 'sigma' ? Math.round(userStressF / areaMm2) : userStressIzin} MPa (Batas Izin: {userStressIzin} MPa)
            </text>
          </svg>
        </div>

        {/* Live Pedagogical Calculation Card */}
        {renderPedagogicalCalculationCard({
          title: 'Bedah Langkah Perhitungan: Tegangan Tarik Batang Baut',
          topicBadge: 'HUKUM HOOKE TEGANGAN NORMAL (σ = F / A)',
          themeColor: '#7c3aed',
          lightBg: '#f5f3ff',
          borderColor: '#ddd6fe',
          givenItems,
          formulaData,
          steps,
          finalResult,
          workshopInsight
        })}
      </div>
    );
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR PULLEYS & CHAIN BLOCK
  // ===========================================================================
  const renderPulleyFormulaSolver = () => {
    const totalWeightN = Math.round(userPulleyW * 9.8);
    const kgF = (userPulleyF).toFixed(1);

    let givenItems = [];
    let formulaData = {};
    let steps = [];
    let finalResult = {};
    let workshopInsight = {};

    if (calcPulleyMode === 'F') {
      const fKg = (userPulleyW / Math.max(1, userPulleyN)).toFixed(1);
      const fN = Math.round(Number(fKg) * 9.8);

      givenItems = [
        { label: 'Massa Mesin / Beban', symbol: 'm', value: userPulleyW, unit: 'kg', note: 'Massa total yang hendak diangkat takal' },
        { label: 'Gaya Berat Beban (Gravitasi)', symbol: 'W', value: totalWeightN, unit: 'Newton', note: 'W = m × 9.8 m/s²' },
        { label: 'Jumlah Utas Tali Penahan Aktif', symbol: 'n', value: userPulleyN, unit: 'utas tali', note: 'Tali yang menopang katrol bergerak' },
        { label: 'Keuntungan Mekanis Takal', symbol: 'KM', value: `${userPulleyN}×`, unit: 'Lipat', note: 'KM sama dengan jumlah tali penahan' }
      ];

      formulaData = {
        main: 'W = m × g   ➔   F = W / n = W / KM   ➔   s = n × h',
        title: 'Hukum Katrol Majemuk & Takal Rantai (Chain Block)',
        description: 'Pada takal katrol majemuk, setiap utas tali yang menopang katrol bebas berbagi beban secara merata. Gaya tarik tangan berkurang sebesar n kali lipat, namun panjang rantai yang harus ditarik bertambah n kali lipat (Hukum Kekekalan Usaha Mekanik).',
        terms: ['m = Massa beban (kg)', 'W = Gaya berat beban (N)', 'n = Jumlah tali penahan aktif', 'F = Gaya tarik kuasa tangan (N)', 's = Panjang rantai yang ditarik (m)', 'h = Ketinggian angkat beban (m)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Hitung Gaya Berat Total Beban Berdasarkan Gravitasi (g = 9.8 m/s²)',
          math: `W = m × g = ${userPulleyW} kg × 9.8 m/s² = ${totalWeightN} Newton`,
          note: 'Gaya gravitasi total yang menarik mesin lurus ke bawah'
        },
        {
          stepNum: 2,
          title: 'Tentukan Keuntungan Mekanis (KM) Takal Katrol Majemuk',
          math: `KM = Jumlah tali penahan aktif (n) = ${userPulleyN}× Lipat`,
          note: `Beban ditopang bersama secara paralel oleh ${userPulleyN} utas tali`
        },
        {
          stepNum: 3,
          title: 'Hitung Gaya Tarik Kuasa yang Wajib Dikerahkan Siswa (F)',
          math: `F = W / n = ${totalWeightN} N ÷ ${userPulleyN} tali = ${fN} Newton`,
          note: 'Gaya tarikan tangan murni pada rantai penarik'
        },
        {
          stepNum: 4,
          title: 'Konversi Beban Tarik ke Satuan Massa yang Dirasakan Otot Tangan',
          math: `m_tarik = m / n = ${userPulleyW} kg ÷ ${userPulleyN} = ${fKg} kg beban tarikan`,
          note: `Beban mesin raksasa ${userPulleyW} kg diringankan drastis hanya setara menarik ${fKg} kg!`
        },
        {
          stepNum: 5,
          title: 'Analisis Usaha Mekanik & Hukum Kekekalan Energi (Work-Energy)',
          math: `Untuk menaikkan mesin setinggi h = 1.0 m, operator menarik rantai s = ${userPulleyN} × 1.0 m = ${userPulleyN} meter. Usaha angkat = ${fN} N × ${userPulleyN} m = ${(fN * userPulleyN).toLocaleString()} Joule (Kekal!).`,
          note: 'Usaha total tetap sama, tetapi gaya otot diringankan berlipat ganda sehingga aman bagi operator!'
        }
      ];

      finalResult = {
        value: `${fKg} kg (${fN} N)`,
        unit: 'Gaya Tarik Kuasa',
        subtitle: `Beban mesin ${userPulleyW} kg diringankan ${userPulleyN}× lipat menjadi hanya ${fKg} kg`,
        badgeText: `🏗️ KEUNTUNGAN MEKANIS ${userPulleyN}×`,
        badgeColor: '#059669',
        badgeBg: '#dcfce7'
      };

      workshopInsight = {
        content: `⚙️ PRAKTIK DI BENGKEL OTOMOTIF & ALAT BERAT: Inilah alasan teknisi bengkel sanggup mengangkat mesin mobil seberat ${userPulleyW} kg sendirian menggunakan Chain Block manual. Dengan sistem ${userPulleyN} utas tali penahan, beban 1 ton terasa setara mengangkat ${fKg} kg. Bila takal dilengkapi sistem roda gigi reduksi (geared hoist), gaya tarik berkurang lagi hingga hanya 15-20 kg saja!`
      };
    } else if (calcPulleyMode === 'W') {
      const wKg = Math.round(userPulleyF * userPulleyN);
      const wN = Math.round(wKg * 9.8);

      givenItems = [
        { label: 'Kekuatan Tarik Tangan Siswa', symbol: 'F', value: userPulleyF, unit: 'kg', note: `Gaya tarik ≈ ${Math.round(userPulleyF * 9.8)} Newton` },
        { label: 'Jumlah Utas Tali Penahan Aktif', symbol: 'n', value: userPulleyN, unit: 'utas tali', note: 'Keuntungan mekanis takal' }
      ];

      formulaData = {
        main: 'W_kg = F_kg × n   |   W_Newton = F_N × n',
        title: 'Kapasitas Angkat Beban Mesin Maksimal',
        description: 'Beban yang sanggup diangkat berbanding lurus dengan gaya tarik tangan dan jumlah tali penahan katrol.',
        terms: ['F = Gaya tarik tangan (kg / N)', 'n = Jumlah tali penahan', 'W = Beban mesin maksimal yang terangkat (kg / N)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Hitung Beban Maksimal dalam Satuan Massa (kg)',
          math: `W_kg = F × n = ${userPulleyF} kg × ${userPulleyN} tali = ${wKg} kg`,
          note: 'Massa mesin maksimal yang sanggup diangkat'
        },
        {
          stepNum: 2,
          title: 'Konversi ke Satuan Gaya Berat Newton (g = 9.8 m/s²)',
          math: `W_N = ${wKg} kg × 9.8 m/s² = ${wN} Newton`,
          note: 'Total gaya berat gravitasi yang ditopang sistem takal'
        }
      ];

      finalResult = {
        value: `${wKg} kg (${wN} N)`,
        unit: 'Beban Maksimal',
        subtitle: `Kapasitas angkat maksimal sistem takal dengan tenaga tarik ${userPulleyF} kg`,
        badgeText: '🏭 KAPASITAS ANGKAT TAKAL',
        badgeColor: '#059669',
        badgeBg: '#dcfce7'
      };

      workshopInsight = {
        content: `🏗️ RATING CHAIN BLOCK: Takal di bengkel selalu memiliki label Safety Working Load (SWL). Pastikan berat mesin tidak melampaui kapasitas angkat ${wKg} kg agar rantai baja tidak putus dan pengait tidak meregang bengkok!`
      };
    } else {
      const nCalc = Math.ceil(userPulleyW / Math.max(1, userPulleyF));

      givenItems = [
        { label: 'Berat Beban Mesin', symbol: 'W', value: userPulleyW, unit: 'kg', note: 'Mesin yang hendak diangkat' },
        { label: 'Batas Tenaga Tarik Nyaman Siswa', symbol: 'F', value: userPulleyF, unit: 'kg', note: 'Kekuatan tarik operator' }
      ];

      formulaData = {
        main: 'n = W / F   (Bulatkan ke atas / Ceil)',
        title: 'Jumlah Utas Tali / KM Minimal yang Wajib Dipasang',
        description: 'Untuk memastikan operator mampu mengangkat beban W tanpa kelelahan otot, jumlah utas tali minimal adalah pembagian beban terhadap tenaga tarik tangan.',
        terms: ['W = Beban mesin (kg)', 'F = Batas kekuatan tarik (kg)', 'n = Jumlah tali penahan minimal']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Bagi Beban Mesin dengan Kapasitas Tarik Siswa',
          math: `n = ${userPulleyW} kg ÷ ${userPulleyF} kg = ${(userPulleyW / Math.max(1, userPulleyF)).toFixed(2)}`,
          note: 'Rasio teoritis jumlah utas tali yang dibutuhkan'
        },
        {
          stepNum: 2,
          title: 'Pembulatan ke Atas (Round Up / Ceil)',
          math: `n_minimal = ${nCalc} Utas Tali (KM = ${nCalc}× Lipat)`,
          note: 'Jumlah tali wajib berupa bilangan bulat utuh'
        }
      ];

      finalResult = {
        value: `${nCalc} Utas Tali`,
        unit: `(KM = ${nCalc}×)`,
        subtitle: `Jumlah tali penahan minimal agar tarikan tangan tidak melebihi ${userPulleyF} kg`,
        badgeText: '📐 KONFIGURASI TALI MINIMAL',
        badgeColor: '#059669',
        badgeBg: '#dcfce7'
      };

      workshopInsight = {
        content: `⛓️ PEMILIHAN RIGGING BENGKEL: Jika beban ${userPulleyW} kg harus diangkat dengan batas tenaga tarik ${userPulleyF} kg, rigger / teknisi wajib memilih blok katrol dengan minimal ${nCalc} utas tali atau chain block dengan rasio mekanis setara.`
      };
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
                Kalkulator Rumus &amp; Simulator Takal Katrol (Chain Block)
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
                padding: '8px 12px',
                borderRadius: '8px',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
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
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>
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
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>
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
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>
                  kg
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Pulley System Visual Diagram */}
        <div style={{
          background: '#0f172a',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Simulasi Visual Takal Katrol Majemuk ({userPulleyN} Utas Tali Penahan):
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', background: '#065f46', padding: '2px 8px', borderRadius: '4px' }}>
              Keuntungan Mekanis: {userPulleyN}×
            </span>
          </div>

          <svg viewBox="0 0 380 130" width="100%" height="130">
            {/* Top Ceiling Rig */}
            <rect x="100" y="8" width="180" height="8" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
            <line x1="120" y1="8" x2="110" y2="2" stroke="#64748b" strokeWidth="1.5" />
            <line x1="150" y1="8" x2="140" y2="2" stroke="#64748b" strokeWidth="1.5" />
            <line x1="180" y1="8" x2="170" y2="2" stroke="#64748b" strokeWidth="1.5" />
            <line x1="210" y1="8" x2="200" y2="2" stroke="#64748b" strokeWidth="1.5" />
            <line x1="240" y1="8" x2="230" y2="2" stroke="#64748b" strokeWidth="1.5" />
            <line x1="270" y1="8" x2="260" y2="2" stroke="#64748b" strokeWidth="1.5" />

            {/* Top Fixed Pulleys */}
            <circle cx="150" cy="28" r="14" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="210" cy="28" r="14" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />

            {/* Bottom Moving Pulleys */}
            <circle cx="160" cy="72" r="14" fill="#1e293b" stroke="#34d399" strokeWidth="2" />
            <circle cx="200" cy="72" r="14" fill="#1e293b" stroke="#34d399" strokeWidth="2" />

            {/* Parallel Ropes depending on userPulleyN */}
            <line x1="136" y1="28" x2="146" y2="72" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3,1" />
            <line x1="164" y1="28" x2="174" y2="72" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3,1" />
            <line x1="196" y1="28" x2="186" y2="72" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3,1" />
            <line x1="224" y1="28" x2="214" y2="72" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3,1" />

            {/* Free Pulling Rope to Hand (Right) */}
            <line x1="224" y1="28" x2="290" y2="82" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="290" cy="82" r="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <text x="290" y="86" textAnchor="middle" fontSize="11">✋</text>
            <text x="290" y="106" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
              F = {calcPulleyMode === 'F' ? (userPulleyW / Math.max(1, userPulleyN)).toFixed(1) : userPulleyF} kg
            </text>

            {/* Load Hook & Weight Box (Bottom) */}
            <rect x="155" y="86" width="50" height="6" rx="2" fill="#475569" />
            <line x1="180" y1="86" x2="180" y2="98" stroke="#f87171" strokeWidth="2.5" />
            <rect x="150" y="98" width="60" height="24" rx="4" fill="#dc2626" stroke="#f87171" strokeWidth="1.5" />
            <text x="180" y="114" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="900">
              W = {userPulleyW} kg
            </text>
            <text x="180" y="125" textAnchor="middle" fill="#fca5a5" fontSize="7" fontWeight="bold">
              ({totalWeightN} N)
            </text>

            {/* Tension Badge */}
            <text x="50" y="70" textAnchor="middle" fill="#94a3b8" fontSize="7.5">
              Tiap tali = {Math.round(totalWeightN / Math.max(1, userPulleyN))} N
            </text>
          </svg>
        </div>

        {/* Live Pedagogical Calculation Card */}
        {renderPedagogicalCalculationCard({
          title: 'Bedah Langkah Perhitungan: Takal Katrol Majemuk',
          topicBadge: 'HUKUM KATROL & CHAIN BLOCK (F = W / n)',
          themeColor: '#059669',
          lightBg: '#f0fdf4',
          borderColor: '#bbf7d0',
          givenItems,
          formulaData,
          steps,
          finalResult,
          workshopInsight
        })}
      </div>
    );
  };

  // ===========================================================================
  // HELPER COMPONENT: SMART FORMULA SOLVER FOR FRICTION & INCLINE
  // ===========================================================================
  const renderFrictionFormulaSolver = () => {
    let givenItems = [];
    let formulaData = {};
    let steps = [];
    let finalResult = {};
    let workshopInsight = {};

    if (calcFrictionMode === 'Fs') {
      const fsCalc = Math.round(userFrictionMu * userFrictionW);
      const kgFs = (fsCalc / 9.8).toFixed(1);
      const kgW = (userFrictionW / 9.8).toFixed(1);

      givenItems = [
        { label: 'Gaya Berat Benda Kerja', symbol: 'W', value: userFrictionW, unit: 'Newton', note: `Massa benda ≈ ${kgW} kg` },
        { label: 'Gaya Kontak Normal', symbol: 'N', value: userFrictionW, unit: 'Newton', note: 'Pada bidang datar mendatar: N = W' },
        { label: 'Koefisien Gesek Statis', symbol: 'μ_s', value: userFrictionMu, unit: '', note: 'Tingkat kekasaran permukaan kontak' }
      ];

      formulaData = {
        main: 'N = W   ➔   Fs = μ_s × N = μ_s × W',
        title: 'Hukum Gesekan Statis Coulomb (Bidang Datar)',
        description: 'Gaya gesek statis bekerja berlawanan arah dengan kecenderungan gerak benda. Benda hanya akan bergeser bila gaya dorong eksternal melampaui gaya gesek statis maksimum (Fs).',
        terms: ['W = Gaya berat benda (N)', 'N = Gaya normal tegak lurus lantai (N)', 'μ_s = Koefisien gesek statis', 'Fs = Gaya gesek statis penahan maksimal (N)']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Tentukan Gaya Kontak Normal (N) pada Bidang Datar Mendatar',
          math: `N = W = ${userFrictionW} Newton`,
          note: 'Gaya dorong balik dari lantai menahan berat benda'
        },
        {
          stepNum: 2,
          title: 'Substitusi Nilai ke Persamaan Gesekan Statis Maksimal (Fs = μ_s × N)',
          math: `Fs = ${userFrictionMu} × ${userFrictionW} N`,
          note: 'Kalikan koefisien gesek permukaan dengan gaya normal'
        },
        {
          stepNum: 3,
          title: 'Hitung Besarnya Gaya Gesek Penahan Maksimum',
          math: `Fs = ${fsCalc} Newton (~${kgFs} kg)`,
          note: 'Ambang batas gaya minimal untuk mulai menggeser benda'
        },
        {
          stepNum: 4,
          title: 'Kriteria Status Gerak Benda di Lantai Bengkel',
          math: `• Dorongan < ${fsCalc} N ➔ Benda DIAM (Gaya gesek mengimbangi dorongan). • Dorongan > ${fsCalc} N ➔ Benda MULAI MELUNCUR BERGERAK!`,
          note: `Bila dorongan siswa kurang dari ${fsCalc} N, benda tak akan bergerak sedikit pun!`
        }
      ];

      finalResult = {
        value: `${fsCalc} Newton`,
        unit: `(~${kgFs} kg)`,
        subtitle: `Gaya dorong minimal yang wajib dikerahkan untuk mulai menggeser benda`,
        badgeText: fsCalc > 300 ? '🔒 CENGKERAMAN SANGAT KUAT' : (fsCalc > 100 ? '🟡 GESEKAN SEDANG' : '⛸️ SANGAT LICIN'),
        badgeColor: '#0284c7',
        badgeBg: '#e0f2fe'
      };

      workshopInsight = {
        content: `🗜️ APLIKASI DI BENGKEL MESIN: Gaya gesek sangat krusial dalam pencekaman ragum mesin frais/milling dan cekam (chuck) mesin bubut. Benda kerja tidak boleh bergeser saat disayat pisau frais. Karena itu, permukaan rahang ragum dibuat bergerigi baja keras untuk meningkatkan nilai koefisien gesek μ_s. Sebaliknya, tumpahan oli pelumas di lantai bengkel menurunkan μ_s ke <0.1, membuat lantai licin dan berbahaya bagi siswa!`
      };
    } else if (calcFrictionMode === 'alpha') {
      const alphaRad = Math.atan(userFrictionMu);
      const alphaDeg = (alphaRad * 180 / Math.PI).toFixed(1);

      givenItems = [
        { label: 'Koefisien Gesek Statis', symbol: 'μ_s', value: userFrictionMu, unit: '', note: 'Karakteristik gesek material kontak' }
      ];

      formulaData = {
        main: 'tan(α_kritis) = μ_s   ➔   α_kritis = arctan(μ_s)',
        title: 'Sudut Kritis Kemiringan Ramp (Angle of Repose)',
        description: 'Pada bidang miring, gaya berat terurai menjadi W·sin(α) yang mendorong benda turun dan W·cos(α) yang menekan bidang. Benda mulai meluncur saat gaya pendorong tepat menyamai gaya gesek penahan: W·sin(α) = μ_s·W·cos(α) sehingga tan(α) = μ_s.',
        terms: ['α = Sudut kemiringan ramp (derajat / °)', 'μ_s = Koefisien gesek statis', 'α_kritis = Sudut batas gelincir bebas']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Persamaan Kesetimbangan Bidang Miring saat Tepat Akan Meluncur',
          math: `W × sin(α) = μ_s × W × cos(α) ➔ sin(α) / cos(α) = μ_s ➔ tan(α_kritis) = μ_s`,
          note: 'Massa benda saling meniadakan (sudut tidak bergantung pada berat benda!)'
        },
        {
          stepNum: 2,
          title: 'Substitusi Nilai Koefisien Gesek Permukaan (μ_s)',
          math: `tan(α_kritis) = ${userFrictionMu}`,
          note: 'Nilai tangen sudut kritis persis sama dengan koefisien gesek'
        },
        {
          stepNum: 3,
          title: 'Hitung Nilai Invers Tangen (Arctan)',
          math: `α_kritis = arctan(${userFrictionMu}) = ${alphaRad.toFixed(4)} radian`,
          note: 'Besar sudut dalam satuan radian'
        },
        {
          stepNum: 4,
          title: 'Konversi Satuan Radian ke Derajat (°)',
          math: `α_kritis = ${alphaRad.toFixed(4)} × (180° / 3.14159) = ${alphaDeg}°`,
          note: 'Besar sudut kemiringan kritis'
        },
        {
          stepNum: 5,
          title: 'Aturan Keselamatan Penurunan Beban Mesin',
          math: `• Kemiringan α < ${alphaDeg}° ➔ Benda AMAN DIAM (tidak meluncur). • Kemiringan α > ${alphaDeg}° ➔ Benda LANGSUNG MEROSOT TURUN BEBAS!`,
          note: `Batas kemiringan ramp maksimal sebelum meluncur adalah ${alphaDeg}°`
        }
      ];

      finalResult = {
        value: `${alphaDeg}°`,
        unit: 'Sudut Kritis Kemiringan',
        subtitle: `Batas kemiringan maksimal ramp sebelum benda tergelincir turun tanpa didorong`,
        badgeText: '📐 SUDUT GELINCIR KRITIS',
        badgeColor: '#0284c7',
        badgeBg: '#e0f2fe'
      };

      workshopInsight = {
        content: `🚚 LOADING MESIN KE BAK TRUK: Saat menurunkan mesin bubut atau genset lewat papan bidang miring (ramp) ke bak truk, pastikan sudut ramp tidak melebihi ${alphaDeg}°. Jika lebih curam dari ${alphaDeg}°, mesin akan langsung meluncur bebas tak terkendali dan membahayakan keselamatan teknisi di bawahnya!`
      };
    } else {
      const muCalc = (userFrictionFs / Math.max(1, userFrictionW)).toFixed(3);

      givenItems = [
        { label: 'Gaya Gesek Pengukur', symbol: 'Fs', value: userFrictionFs, unit: 'Newton', note: 'Gaya dorong saat benda tepat akan bergeser' },
        { label: 'Gaya Berat Benda', symbol: 'W', value: userFrictionW, unit: 'Newton', note: 'Gaya normal penahan lantai (N = W)' }
      ];

      formulaData = {
        main: 'μ = Fs / W = Fs / N',
        title: 'Pengukuran Koefisien Gesek Statis Eksperimental',
        description: 'Koefisien gesek diperoleh dengan membandingkan gaya dorong awal saat benda mulai bergeser terhadap gaya normal lantai.',
        terms: ['Fs = Gaya gesek statis awal gerak (N)', 'W = Berat benda (N)', 'μ = Koefisien gesek tanpa satuan']
      };

      steps = [
        {
          stepNum: 1,
          title: 'Substitusi Nilai ke Rumus Koefisien Gesek (μ = Fs / W)',
          math: `μ = ${userFrictionFs} N ÷ ${userFrictionW} N`,
          note: 'Bagi gaya penahan dengan berat benda'
        },
        {
          stepNum: 2,
          title: 'Hitung Nilai Koefisien Gesek Permukaan',
          math: `μ = ${muCalc}`,
          note: 'Angka tak bersatuan yang mencerminkan kekasaran mikroskopis'
        },
        {
          stepNum: 3,
          title: 'Klasifikasi Tekstur & Sifat Permukaan Material',
          math: `Status: ${Number(muCalc) > 0.5 ? 'Permukaan Kasar (Cengkeraman Kuat)' : (Number(muCalc) < 0.15 ? 'Permukaan Sangat Licin (Terlumasi Oli)' : 'Permukaan Logam Bersih Standar')}`,
          note: 'Karakteristik gesek material yang terukur'
        }
      ];

      finalResult = {
        value: `μ = ${muCalc}`,
        unit: 'Koefisien Gesek',
        subtitle: `Tingkat kekasaran kontak permukaan bidang kerja`,
        badgeText: Number(muCalc) > 0.5 ? '🔒 KASAR & MANTAP' : (Number(muCalc) < 0.15 ? '🛢️ LICIN TERLUMASI OLI' : '⚙️ STANDAR KERING'),
        badgeColor: '#0284c7',
        badgeBg: '#e0f2fe'
      };

      workshopInsight = {
        content: `🔍 TRIBOLOGI & PELUMASAN: Di bengkel pemesinan, gesekan tinggi dibutuhkan pada pencekaman ragum/chuck (μ > 0.5), namun gesekan rendah sangat krusial pada eretan meja mesin bubut/milling. Dengan pemberian oli pelumas (slideway oil), nilai μ diturunkan hingga < 0.1 agar eretan meluncur mulus tanpa aus!`
      };
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
                Kalkulator Rumus &amp; Simulator Gesekan (Hukum Coulomb)
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
                padding: '8px 12px',
                borderRadius: '8px',
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
            ⚡ CONTOH KONDISI PERMUKAAN BENGKEL (Klik isi otomatis):
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
              Berat Benda / Beban (W):
            </label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                value={userFrictionW}
                onChange={(e) => setUserFrictionW(Math.max(1, Number(e.target.value)))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
              />
              <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>
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
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
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
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px 0 0 6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 800 }}
                />
                <span style={{ background: '#f1f5f9', padding: '8px 10px', border: '1px solid #cbd5e1', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Newton
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Friction & Normal Force Visual Diagram */}
        <div style={{
          background: '#0f172a',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Simulasi Visual Gaya Kontak Normal (N), Berat (W) &amp; Gaya Gesek (Fs):
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', background: '#0369a1', padding: '2px 8px', borderRadius: '4px' }}>
              μ = {userFrictionMu}
            </span>
          </div>

          <svg viewBox="0 0 380 120" width="100%" height="120">
            {/* Ground / Floor with Texture */}
            <rect x="40" y="80" width="300" height="8" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
            <line x1="50" y1="88" x2="40" y2="96" stroke="#475569" strokeWidth="1.5" />
            <line x1="80" y1="88" x2="70" y2="96" stroke="#475569" strokeWidth="1.5" />
            <line x1="110" y1="88" x2="100" y2="96" stroke="#475569" strokeWidth="1.5" />
            <line x1="140" y1="88" x2="130" y2="96" stroke="#475569" strokeWidth="1.5" />
            <line x1="170" y1="88" x2="160" y2="96" stroke="#475569" strokeWidth="1.5" />
            <line x1="200" y1="88" x2="190" y2="96" stroke="#475569" strokeWidth="1.5" />
            <line x1="230" y1="88" x2="220" y2="96" stroke="#475569" strokeWidth="1.5" />
            <line x1="260" y1="88" x2="250" y2="96" stroke="#475569" strokeWidth="1.5" />
            <line x1="290" y1="88" x2="280" y2="96" stroke="#475569" strokeWidth="1.5" />
            <line x1="320" y1="88" x2="310" y2="96" stroke="#475569" strokeWidth="1.5" />

            {/* Block on Floor */}
            <rect x="150" y="44" width="80" height="36" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="190" y="66" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="900">
              W = {userFrictionW} N
            </text>

            {/* Normal Force N Upward Vector */}
            <line x1="190" y1="44" x2="190" y2="16" stroke="#34d399" strokeWidth="2.5" />
            <polygon points="186,20 190,12 194,20" fill="#34d399" />
            <text x="190" y="8" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">N = {userFrictionW} N</text>

            {/* Gravity Force W Downward Vector */}
            <line x1="190" y1="80" x2="190" y2="108" stroke="#f87171" strokeWidth="2" />
            <polygon points="186,104 190,112 194,104" fill="#f87171" />

            {/* Applied Push Force to the Right */}
            <line x1="230" y1="62" x2="270" y2="62" stroke="#facc15" strokeWidth="2.5" />
            <polygon points="266,58 274,62 266,66" fill="#facc15" />
            <text x="250" y="55" textAnchor="middle" fill="#facc15" fontSize="7.5" fontWeight="bold">F (Dorong)</text>

            {/* Friction Force Fs to the Left (at interface) */}
            <line x1="150" y1="78" x2="100" y2="78" stroke="#f87171" strokeWidth="2.5" />
            <polygon points="104,74 96,78 104,82" fill="#f87171" />
            <text x="110" y="70" textAnchor="middle" fill="#f87171" fontSize="8" fontWeight="900">
              Fs = {Math.round(userFrictionMu * userFrictionW)} N
            </text>
          </svg>
        </div>

        {/* Live Pedagogical Calculation Card */}
        {renderPedagogicalCalculationCard({
          title: 'Bedah Langkah Perhitungan: Gaya Gesek Statis Coulomb',
          topicBadge: 'HUKUM GESEKAN COULOMB (Fs = μ × W)',
          themeColor: '#0284c7',
          lightBg: '#f0f9ff',
          borderColor: '#bae6fd',
          givenItems,
          formulaData,
          steps,
          finalResult,
          workshopInsight
        })}
      </div>
    );
  };


  // ===========================================================================
  // REUSABLE CASE STUDY CARD RENDERER WITH TECHNICAL SVG ILLUSTRATION
  // ===========================================================================
  const renderCaseStudyCard = ({
    badge = '📚 STUDI KASUS NYATA BENGKEL MESIN SMK',
    caseNumber = '1',
    title,
    subtitle,
    svgIllustration,
    scenarioText,
    givenData = [],
    questions = [],
    solutions = [],
    workshopSafety,
    themeColor = '#0284c7'
  }) => {
    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: `${themeColor}15`,
                color: themeColor,
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 900,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                {badge}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>
                Kasus #{caseNumber}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Gambar Ilustrasi Teknik SVG */}
        <div style={{
          background: '#0b132b',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #1e293b',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📐 Gambar Ilustrasi Diagram Teknik Kasus:
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Skema Vektor Gaya, Dimensi Jarak &amp; Titik Kerja
            </span>
          </div>
          {svgIllustration}
        </div>

        {/* Skenario Masalah di Bengkel */}
        <div style={{
          background: '#f8fafc',
          borderLeft: `4px solid ${themeColor}`,
          padding: '14px 18px',
          borderRadius: '0 10px 10px 0',
          marginBottom: '18px'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', marginBottom: '4px' }}>
            📖 Skenario Masalah Nyata di Bengkel:
          </div>
          <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
            {scenarioText}
          </div>
        </div>

        {/* Grid: Data Diketahui & Pertanyaan */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {/* Data Diketahui */}
          <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0369a1', textTransform: 'uppercase', marginBottom: '8px' }}>
              📋 Data Masalah (Diketahui):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {givenData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '4px' }}>
                  <span style={{ color: '#475569' }}>{item.label}:</span>
                  <strong style={{ color: '#0f172a' }}>{item.val}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Pertanyaan Tantangan */}
          <div style={{ background: '#fffbeb', padding: '14px', borderRadius: '10px', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#b45309', textTransform: 'uppercase', marginBottom: '8px' }}>
              ❓ Pertanyaan / Tantangan Teknis:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {questions.map((q, idx) => (
                <div key={idx} style={{ fontSize: '0.76rem', color: '#78350f', lineHeight: 1.45 }}>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bedah Penyelesaian Lengkap Langkah demi Langkah */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 18px',
          marginBottom: '18px'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✏️</span> Bedah Penyelesaian Lengkap Langkah demi Langkah:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {solutions.map((sol, idx) => (
              <div key={idx} style={{
                background: '#f8fafc',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                borderLeft: `3px solid ${themeColor}`
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: themeColor, marginBottom: '4px' }}>
                  {sol.title}
                </div>
                {sol.formula && (
                  <div style={{ fontSize: '0.74rem', fontFamily: 'monospace', color: '#475569', marginBottom: '4px', background: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    {sol.formula}
                  </div>
                )}
                <div style={{ fontSize: '0.78rem', color: '#1e293b', lineHeight: 1.55 }}>
                  {sol.desc}
                </div>
                {sol.result && (
                  <div style={{ marginTop: '6px', fontSize: '0.82rem', fontWeight: 900, color: '#15803d' }}>
                    🎯 Hasil: {sol.result}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* K3 & Workshop Safety Insight */}
        {workshopSafety && (
          <div style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderLeft: '4px solid #e11d48',
            borderRadius: '0 10px 10px 0',
            padding: '12px 16px'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#be123c', marginBottom: '3px' }}>
              🛡️ ATURAN KERJA &amp; KESELAMATAN BENGKEL (K3):
            </div>
            <div style={{ fontSize: '0.76rem', color: '#881337', lineHeight: 1.5 }}>
              {workshopSafety}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 1. STUDI KASUS TORSI: BAUT RODA TRUK MACET
  const renderTorqueCaseStudy = () => {
    const svg = (
      <svg viewBox="0 0 760 250" width="100%" height="auto" style={{ display: 'block' }}>
        <rect width="760" height="250" rx="10" fill="#0b132b" stroke="#1e293b" />
        <path d="M 0,50 L 760,50 M 0,100 L 760,100 M 0,150 L 760,150 M 0,200 L 760,200" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
        
        {/* Wheel Hub */}
        <g transform="translate(130, 125)">
          <circle cx="0" cy="0" r="75" fill="#1e293b" stroke="#475569" strokeWidth="4" />
          <circle cx="0" cy="0" r="48" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
            const rad = (ang * Math.PI) / 180;
            return <circle key={i} cx={Math.cos(rad)*36} cy={Math.sin(rad)*36} r="4" fill="#94a3b8" />;
          })}
          <polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" fill="#cbd5e1" stroke="#f87171" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="4" fill="#ef4444" />
          <text x="0" y="-22" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">Baut Roda M20</text>
          <path d="M -30,-20 A 40 40 0 0 1 20,-35" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,2" />
          <polygon points="20,-38 27,-32 18,-30" fill="#38bdf8" />
          <text x="-5" y="-45" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">τ = 360 Nm</text>
        </g>

        {/* Wrench 1 (d1 = 30 cm) */}
        <g>
          <path d="M 130,120 L 290,120 L 290,130 L 130,130 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="290" cy="125" r="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
          <line x1="130" y1="165" x2="290" y2="165" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="130" y1="158" x2="130" y2="172" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="290" y1="158" x2="290" y2="172" stroke="#ef4444" strokeWidth="1.5" />
          <text x="210" y="180" fill="#ef4444" fontSize="9.5" fontWeight="bold" textAnchor="middle">d1 = 30 cm (0,3 m)</text>
          <line x1="290" y1="125" x2="290" y2="45" stroke="#ef4444" strokeWidth="3" />
          <polygon points="285,50 290,40 295,50" fill="#ef4444" />
          <text x="290" y="32" fill="#ef4444" fontSize="10.5" fontWeight="900" textAnchor="middle">F1 = 1.200 N</text>
          <text x="290" y="20" fill="#fca5a5" fontSize="8.5" textAnchor="middle">(~122 kg - GAGAL/BERAT!)</text>
        </g>

        {/* Extension Pipe (d2 = 1.2 m) */}
        <g>
          <rect x="270" y="116" width="370" height="18" rx="4" fill="#ea580c" stroke="#f97316" strokeWidth="1.5" />
          <text x="450" y="129" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">Pipa Perpanjangan Galvanis (Cheater Pipe)</text>
          <line x1="130" y1="210" x2="640" y2="210" stroke="#10b981" strokeWidth="1.5" />
          <line x1="130" y1="203" x2="130" y2="217" stroke="#10b981" strokeWidth="1.5" />
          <line x1="640" y1="203" x2="640" y2="217" stroke="#10b981" strokeWidth="1.5" />
          <text x="385" y="226" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">d2 = 120 cm (1,20 meter) ➔ 4x Lebih Panjang!</text>
          <line x1="640" y1="125" x2="640" y2="65" stroke="#10b981" strokeWidth="3" />
          <polygon points="635,70 640,60 645,70" fill="#10b981" />
          <text x="640" y="52" fill="#10b981" fontSize="11" fontWeight="900" textAnchor="middle">F2 = 300 N</text>
          <text x="640" y="38" fill="#86efac" fontSize="8.5" fontWeight="bold" textAnchor="middle">(~30 kg - ENTENG &amp; BERHASIL!)</text>
        </g>
      </svg>
    );

    return renderCaseStudyCard({
      caseNumber: '1',
      title: 'Membuka Baut Roda Truk Tronton Macet Berkarat (Torsi τ = F × d)',
      subtitle: 'Penerapan Hukum Momen Gaya untuk Meringankan Beban Otot Teknisi Menggunakan Pipa Sambung (Cheater Pipe)',
      svgIllustration: svg,
      scenarioText: 'Di bengkel sasis otomotif SMK, seorang siswa kesulitan membuka baut roda truk tronton (ulir M20) yang macet akibat karat dan torsi pengencangan pabrik sebesar 360 Nm. Siswa mencoba menggunakan kunci ring standar sepanjang 30 cm, namun baut tidak bergeming sedikitpun walau ditarik sekuat tenaga. Guru pembimbing menyarankan memasang pipa sambungan (cheater pipe) sepanjang 1,2 meter ke gagang kunci ring.',
      givenData: [
        { label: 'Torsi Pembuka Baut Macet (τ)', val: '360 Nm' },
        { label: 'Panjang Kunci Ring Standar (d1)', val: '30 cm = 0,30 meter' },
        { label: 'Panjang Kunci + Pipa Sambungan (d2)', val: '120 cm = 1,20 meter' },
        { label: 'Batas Kekuatan Tarik Tangan Siswa', val: '≈ 250 - 300 N (~25 - 30 kg)' }
      ],
      questions: [
        '1. Berapakah gaya otot tangan (F1) yang harus dikeluarkan siswa jika hanya memakai kunci ring standar 30 cm?',
        '2. Mengapa baut macet dan siswa tidak mampu memutarnya pada jarak d1?',
        '3. Berapakah gaya otot tangan (F2) yang dibutuhkan jika siswa menyambung pipa perpanjangan menjadi 1,2 meter?',
        '4. Berapa kali lipat penghematan tenaga yang diperoleh siswa?'
      ],
      solutions: [
        {
          title: 'Langkah 1: Menghitung Gaya F1 pada Kunci Standar (d1 = 0,30 m)',
          formula: 'F1 = τ / d1',
          desc: 'F1 = 360 Nm ÷ 0,30 m = 1.200 Newton. Konversi ke beban gravitasi setara: 1.200 N ÷ 9,8 m/s² ≈ 122,4 kg beban otot tangan! Manusia normal tidak mampu menarik beban 122 kg dengan satu tangan.',
          result: '1.200 Newton (~122,4 kg) ➔ Terlalu berat, baut macet total!'
        },
        {
          title: 'Langkah 2: Menghitung Gaya F2 setelah Menggunakan Pipa Sambung (d2 = 1,20 m)',
          formula: 'F2 = τ / d2',
          desc: 'F2 = 360 Nm ÷ 1,20 m = 300 Newton. Konversi ke beban gravitasi setara: 300 N ÷ 9,8 m/s² ≈ 30,6 kg beban otot tangan. Beban 30 kg dapat ditarik dengan mantap oleh satu siswa dewasa berposisi kuda-kuda kokoh!',
          result: '300 Newton (~30,6 kg) ➔ Enteng, baut langsung berputar lancar!'
        },
        {
          title: 'Langkah 3: Perbandingan Rasio Efisiensi Penggandaan Lengan',
          formula: 'Rasio = F1 / F2 = d2 / d1',
          desc: 'Rasio = 1.200 N ÷ 300 N = 4x lipat lebih ringan! Dengan memperpanjang lengan momen sebesar 4x (dari 0,3 m ke 1,2 m), tenaga otot yang dibutuhkan terpangkas sebesar 75%!',
          result: 'Hemat tenaga 4x lipat (hanya butuh 25% dari tenaga awal)'
        }
      ],
      workshopSafety: 'Saat menggunakan pipa sambungan pada kunci ring/pas, pastikan kunci dalam kondisi presisi (tidak aus/dol) dan pipa pas masuk mengunci gagang. Jangan pernah menghentak tarikan secara mendadak agar baut tidak patah atau kunci meleset melukai tangan.',
      themeColor: '#0284c7'
    });
  };

  // 2. STUDI KASUS TUAS: MENGUNGKIT KAKI MESIN BUBUT 600 KG
  const renderLeverCaseStudy = () => {
    const svg = (
      <svg viewBox="0 0 760 250" width="100%" height="auto" style={{ display: 'block' }}>
        <rect width="760" height="250" rx="10" fill="#0b132b" stroke="#1e293b" />
        <line x1="40" y1="195" x2="720" y2="195" stroke="#475569" strokeWidth="2.5" />
        {[80, 140, 200, 260, 320, 380, 440, 500, 560, 620, 680].map((x, i) => (
          <line key={i} x1={x} y1="195" x2={x-15} y2="210" stroke="#334155" strokeWidth="1.5" />
        ))}
        {/* Lathe Foot */}
        <g transform="translate(100, 195)">
          <rect x="-40" y="-80" width="80" height="80" rx="4" fill="#334155" stroke="#64748b" strokeWidth="2" />
          <text x="0" y="-45" fill="#f8fafc" fontSize="9.5" fontWeight="bold" textAnchor="middle">Kaki Mesin</text>
          <text x="0" y="-30" fill="#94a3b8" fontSize="8" textAnchor="middle">Bubut (300 kg)</text>
          <line x1="0" y1="-80" x2="0" y2="-10" stroke="#ef4444" strokeWidth="3" />
          <polygon points="-5,-15 0,-5 5,-15" fill="#ef4444" />
          <text x="0" y="-90" fill="#ef4444" fontSize="10.5" fontWeight="900" textAnchor="middle">W = 2.940 N</text>
        </g>
        {/* Fulcrum */}
        <g transform="translate(200, 195)">
          <polygon points="0,-45 -22,0 22,0" fill="#d97706" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="0" cy="-45" r="4" fill="#ffffff" />
          <text x="0" y="16" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">Tumpuan (Fulcrum)</text>
        </g>
        {/* Crowbar */}
        <g>
          <line x1="120" y1="190" x2="660" y2="90" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" />
          <line x1="120" y1="215" x2="200" y2="215" stroke="#f87171" strokeWidth="1.5" />
          <line x1="120" y1="208" x2="120" y2="222" stroke="#f87171" strokeWidth="1.5" />
          <line x1="200" y1="208" x2="200" y2="222" stroke="#f87171" strokeWidth="1.5" />
          <text x="160" y="232" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">Lb = 15 cm</text>
          <line x1="200" y1="215" x2="660" y2="215" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="200" y1="208" x2="200" y2="222" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="660" y1="208" x2="660" y2="222" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="430" y="232" fill="#38bdf8" fontSize="9.5" fontWeight="bold" textAnchor="middle">Lk = 135 cm (1,35 meter)</text>
          {/* Hand vector */}
          <g transform="translate(660, 90)">
            <circle cx="0" cy="-25" r="14" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
            <text x="0" y="-21" fontSize="11" textAnchor="middle">✋</text>
            <line x1="0" y1="-5" x2="0" y2="40" stroke="#10b981" strokeWidth="3" />
            <polygon points="-5,35 0,45 5,35" fill="#10b981" />
            <text x="0" y="60" fill="#10b981" fontSize="11" fontWeight="900" textAnchor="middle">F = 326,7 N</text>
            <text x="0" y="74" fill="#86efac" fontSize="8.5" textAnchor="middle">(≈ 33 kg dorongan tangan)</text>
          </g>
        </g>
        <g transform="translate(430, 40)">
          <rect x="-130" y="-18" width="260" height="36" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="0" y="4" fill="#38bdf8" fontSize="10.5" fontWeight="900" textAnchor="middle">
            KM = Lk / Lb = 135 / 15 = 9× Penggandaan Gaya!
          </text>
        </g>
      </svg>
    );

    return renderCaseStudyCard({
      caseNumber: '2',
      title: 'Mengungkit Kaki Mesin Bubut 600 kg dengan Linggis Baja (Tuas Kelas 1: W · Lb = F · Lk)',
      subtitle: 'Membuktikan Penggandaan Gaya Hingga 9x Lipat untuk Memasang Karet Peredam Getaran (Vibration Pad)',
      svgIllustration: svg,
      scenarioText: 'Di bengkel pemesinan SMK, teknisi dan siswa hendak menyetel kedataran (leveling) dan memasang bantalan karet peredam getaran di bawah salah satu kaki mesin bubut seberat 600 kg. Kaki yang diangkat menopang setengah massa total mesin yaitu 300 kg (W = 2.940 N). Karena forklift tidak muat masuk ke lorong mesin, teknisi menggunakan linggis baja panjang 1,5 meter (150 cm) dan ganjal balok kayu keras sebagai tumpuan pada jarak 15 cm dari kaki mesin.',
      givenData: [
        { label: 'Massa Beban Kaki Mesin (m)', val: '300 kg' },
        { label: 'Berat Beban Kaki Mesin (W = m · g)', val: '300 × 9,8 = 2.940 N' },
        { label: 'Panjang Total Linggis Baja (L)', val: '150 cm = 1,50 meter' },
        { label: 'Lengan Beban (Lb = jarak tumpu ke kaki)', val: '15 cm = 0,15 meter' }
      ],
      questions: [
        '1. Berapakah panjang lengan kuasa (Lk) yang tersedia untuk tangan teknisi?',
        '2. Berapakah Keuntungan Mekanis (KM) dari susunan tuas kelas 1 ini?',
        '3. Berapakah gaya tekan tangan (F) yang harus dikerahkan teknisi untuk mengangkat mesin? Apakah aman dilakukan satu orang?'
      ],
      solutions: [
        {
          title: 'Langkah 1: Menentukan Panjang Lengan Kuasa (Lk)',
          formula: 'Lk = L_total - Lb',
          desc: 'Lk = 150 cm - 15 cm = 135 cm (1,35 meter). Jarak tangan dari titik tumpu menjadi 9x lebih panjang dibandingkan jarak beban.',
          result: '135 cm (1,35 meter)'
        },
        {
          title: 'Langkah 2: Menghitung Keuntungan Mekanis (KM)',
          formula: 'KM = Lk / Lb',
          desc: 'KM = 135 cm ÷ 15 cm = 9,0x lipat. Sistem tuas ini melipatgandakan gaya tekan tangan sebesar 9 kali lipat ke ujung beban!',
          result: 'KM = 9,0×'
        },
        {
          title: 'Langkah 3: Menghitung Gaya Kuasa Tekan Tangan (F)',
          formula: 'F = W / KM = (W × Lb) / Lk',
          desc: 'F = 2.940 N ÷ 9,0 = 326,7 Newton. Konversi beban gravitasi setara: 326,7 N ÷ 9,8 m/s² ≈ 33,3 kg dorongan tangan. Teknisi cukup menekan ujung linggis dengan memanfaatkan sebagian berat badannya (~33 kg) untuk mengangkat mesin 300 kg!',
          result: '326,7 Newton (~33,3 kg dorongan tangan)'
        }
      ],
      workshopSafety: 'Selalu gunakan balok kayu tumpuan yang solid (bukan bata merah atau balok rapuh yang bisa retak hancur mendadak). Saat mesin terangkat, JANGAN PERNAH menyelipkan jari tangan di bawah kaki mesin sebelum balok pengaman (safety wedge) disisipkan!',
      themeColor: '#b45309'
    });
  };

  // 3. STUDI KASUS KESETIMBANGAN: BALOK CRANE BENGKEL
  const renderBeamCaseStudy = () => {
    const svg = (
      <svg viewBox="0 0 760 250" width="100%" height="auto" style={{ display: 'block' }}>
        <rect width="760" height="250" rx="10" fill="#0b132b" stroke="#1e293b" />
        <rect x="100" y="105" width="560" height="20" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="100" y1="115" x2="660" y2="115" stroke="#cbd5e1" strokeWidth="2" />
        
        {/* Support A */}
        <g transform="translate(100, 125)">
          <polygon points="0,0 -16,28 16,28" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#ffffff" />
          <line x1="-22" y1="28" x2="22" y2="28" stroke="#10b981" strokeWidth="2" />
          <text x="0" y="42" fill="#10b981" fontSize="9.5" fontWeight="bold" textAnchor="middle">Tumpuan Sendi A</text>
          <line x1="0" y1="75" x2="0" y2="5" stroke="#10b981" strokeWidth="3" />
          <polygon points="-5,10 0,0 5,10" fill="#10b981" />
          <text x="0" y="90" fill="#10b981" fontSize="11" fontWeight="900" textAnchor="middle">RA = 8.000 N</text>
          <text x="0" y="103" fill="#86efac" fontSize="8" textAnchor="middle">(2x lebih berat!)</text>
        </g>

        {/* Support B */}
        <g transform="translate(660, 125)">
          <polygon points="0,0 -16,22 16,22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#ffffff" />
          <circle cx="-8" cy="27" r="4" fill="#38bdf8" />
          <circle cx="8" cy="27" r="4" fill="#38bdf8" />
          <line x1="-20" y1="32" x2="20" y2="32" stroke="#38bdf8" strokeWidth="2" />
          <text x="0" y="46" fill="#38bdf8" fontSize="9.5" fontWeight="bold" textAnchor="middle">Tumpuan Rol B</text>
          <line x1="0" y1="75" x2="0" y2="5" stroke="#38bdf8" strokeWidth="3" />
          <polygon points="-5,10 0,0 5,10" fill="#38bdf8" />
          <text x="0" y="90" fill="#38bdf8" fontSize="11" fontWeight="900" textAnchor="middle">RB = 4.000 N</text>
          <text x="0" y="103" fill="#93c5fd" fontSize="8" textAnchor="middle">(Lebih ringan)</text>
        </g>

        {/* Hoist Load at x = 286 (a = 2m, b = 4m) */}
        <g transform="translate(286, 115)">
          <rect x="-18" y="-22" width="36" height="22" rx="4" fill="#d97706" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="0" y="-8" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">HOIST</text>
          <line x1="0" y1="0" x2="0" y2="25" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="-26" y="25" width="52" height="34" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="0" y="42" fill="#f8fafc" fontSize="8" fontWeight="bold" textAnchor="middle">Mesin Frais</text>
          <text x="0" y="53" fill="#94a3b8" fontSize="7" textAnchor="middle">1.200 kg</text>
          <line x1="0" y1="59" x2="0" y2="95" stroke="#ef4444" strokeWidth="3.5" />
          <polygon points="-5,90 0,100 5,90" fill="#ef4444" />
          <text x="0" y="114" fill="#ef4444" fontSize="11.5" fontWeight="900" textAnchor="middle">P = 12.000 N</text>
        </g>

        {/* Dimensions */}
        <line x1="100" y1="65" x2="286" y2="65" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="100" y1="58" x2="100" y2="72" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="286" y1="58" x2="286" y2="72" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="193" y="58" fill="#f59e0b" fontSize="9.5" fontWeight="bold" textAnchor="middle">a = 2,00 m</text>
        
        <line x1="286" y1="65" x2="660" y2="65" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="286" y1="58" x2="286" y2="72" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="660" y1="58" x2="660" y2="72" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="473" y="58" fill="#f59e0b" fontSize="9.5" fontWeight="bold" textAnchor="middle">b = 4,00 m</text>
        
        <line x1="100" y1="35" x2="660" y2="35" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="100" y1="28" x2="100" y2="42" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="660" y1="28" x2="660" y2="42" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="380" y="28" fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">Bentang Total Balok L = 6,00 m</text>
      </svg>
    );

    return renderCaseStudyCard({
      caseNumber: '3',
      title: 'Balok Gelagar Crane Bengkel Menopang Hoist Mesin Frais 1.200 kg (ΣM = 0 & ΣFy = 0)',
      subtitle: 'Menghitung Beban Reaksi Tumpuan Tiang A & B serta Momen Lentur Maksimum Balok I-Beam',
      svgIllustration: svg,
      scenarioText: 'Di bengkel permesinan SMK, derek jembatan (overhead crane) menggunakan balok baja profil IWF dengan bentang tumpuan L = 6 meter. Tiang kiri (titik A) menggunakan tumpuan Sendi (Engsel), sedangkan tiang kanan (titik B) menggunakan tumpuan Rol. Crane sedang mengangkat sebuah mesin frais vertikal berbobot 1.200 kg (P ≈ 12.000 N dengan g = 10 m/s²) pada posisi 2 meter dari tiang A.',
      givenData: [
        { label: 'Bentang Total Balok Crane (L)', val: '6,00 meter' },
        { label: 'Beban Mesin Frais (P)', val: '12.000 N (1.200 kg)' },
        { label: 'Jarak Beban ke Tumpuan A (a)', val: '2,00 meter' },
        { label: 'Jarak Beban ke Tumpuan B (b)', val: '6 - 2 = 4,00 meter' }
      ],
      questions: [
        '1. Berapakah gaya reaksi tumpuan di tiang A (RA) dan di tiang B (RB)?',
        '2. Mengapa beban di tiang A lebih besar daripada tiang B?',
        '3. Berapakah momen lentur maksimum (Mmax) yang dialami balok crane?'
      ],
      solutions: [
        {
          title: 'Langkah 1: Menghitung Reaksi RA menggunakan Kesetimbangan Momen di Titik B (ΣMB = 0)',
          formula: '(RA × L) - (P × b) = 0 ➔ RA = (P × b) / L',
          desc: 'RA × 6,0 m = 12.000 N × 4,0 m = 48.000 Nm. RA = 48.000 ÷ 6,0 = 8.000 Newton (~800 kg). Tumpuan A menanggung 2/3 dari total beban karena posisi mesin lebih dekat ke tiang A.',
          result: 'RA = 8.000 Newton (~800 kg)'
        },
        {
          title: 'Langkah 2: Menghitung Reaksi RB menggunakan Kesetimbangan Gaya Vertikal (ΣFy = 0)',
          formula: 'RA + RB - P = 0 ➔ RB = P - RA',
          desc: 'RB = 12.000 N - 8.000 N = 4.000 Newton (~400 kg). Cek kesetimbangan: RA + RB = 8.000 + 4.000 = 12.000 N (Seimbang sempurna 100%!).',
          result: 'RB = 4.000 Newton (~400 kg)'
        },
        {
          title: 'Langkah 3: Menghitung Momen Lentur Maksimum Balok (Mmax)',
          formula: 'Mmax = RA × a = (P × a × b) / L',
          desc: 'Momen maksimum balok terjadi tepat di bawah posisi gantungan hoist (x = 2 m): Mmax = 8.000 N × 2,0 m = 16.000 Nm (16 kNm). Nilai ini dipakai teknisi untuk menentukan ukuran profil baja balok IWF agar tidak melengkung berbahaya.',
          result: 'Mmax = 16.000 Nm (16 kNm)'
        }
      ],
      workshopSafety: 'Fondasi tiang A harus dirancang mampu menahan beban 2x lebih besar (8 kN) daripada tiang B (4 kN). Saat crane bergerak membawa beban berat, dilarang keras bagi siapa pun melintas di bawah beban gantung!',
      themeColor: '#166534'
    });
  };

  // 4. STUDI KASUS TEGANGAN: BAUT SILINDER HEAD
  const renderStressCaseStudy = () => {
    const svg = (
      <svg viewBox="0 0 760 250" width="100%" height="auto" style={{ display: 'block' }}>
        <rect width="760" height="250" rx="10" fill="#0b132b" stroke="#1e293b" />
        
        {/* Cylinder Cross Section */}
        <g transform="translate(180, 125)">
          <rect x="-100" y="-95" width="200" height="45" rx="4" fill="#334155" stroke="#64748b" strokeWidth="2" />
          <text x="-50" y="-70" fill="#94a3b8" fontSize="9" fontWeight="bold">Cylinder Head</text>
          <rect x="-100" y="-50" width="200" height="8" fill="#d97706" />
          <text x="65" y="-44" fill="#fbbf24" fontSize="7" fontWeight="bold">Gasket</text>
          <rect x="-100" y="-42" width="200" height="110" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <text x="-50" y="20" fill="#64748b" fontSize="9" fontWeight="bold">Engine Block</text>
          <circle cx="-40" cy="5" r="22" fill="#ef4444" opacity="0.35" />
          <text x="-40" y="9" fill="#fca5a5" fontSize="8" fontWeight="bold" textAnchor="middle">Piston Gas</text>
          
          <rect x="25" y="-110" width="24" height="15" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <rect x="30" y="-95" width="14" height="150" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="37" y1="-80" x2="37" y2="-10" stroke="#ef4444" strokeWidth="2.5" />
          <polygon points="33,-70 37,-80 41,-70" fill="#ef4444" />
          <line x1="37" y1="20" x2="37" y2="-50" stroke="#ef4444" strokeWidth="2.5" />
          <polygon points="33,-40 37,-50 41,-40" fill="#ef4444" />
          <text x="37" y="-116" fill="#f87171" fontSize="9" fontWeight="bold" textAnchor="middle">Baut M14</text>
        </g>

        {/* Circular Section Zoom at right */}
        <g transform="translate(500, 115)">
          <circle cx="0" cy="0" r="50" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
          {[-35, -20, -5, 10, 25, 40].map((ly, i) => (
            <line key={i} x1="-35" y1={ly} x2="35" y2={ly} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,2" opacity="0.6" />
          ))}
          <line x1="-50" y1="0" x2="50" y2="0" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="0" y="-8" fill="#f59e0b" fontSize="8.5" fontWeight="bold" textAnchor="middle">d = 12 mm</text>
          <text x="0" y="16" fill="#38bdf8" fontSize="10.5" fontWeight="bold" textAnchor="middle">A = 113,1 mm²</text>
          <text x="0" y="-60" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">Penampang Inti Baut</text>
        </g>

        {/* Formula & Result Callout */}
        <g transform="translate(500, 205)">
          <rect x="-140" y="-18" width="280" height="36" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
          <text x="0" y="-2" fill="#86efac" fontSize="9.5" fontWeight="bold" textAnchor="middle">
            σ = F / A = 24.000 N / 113,1 mm² = 212,2 MPa
          </text>
          <text x="0" y="12" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
            ✅ AMAN! (σ_kerja 212,2 MPa &lt; σ_izin 300 MPa | SF = 1,41)
          </text>
        </g>
      </svg>
    );

    return renderCaseStudyCard({
      caseNumber: '4',
      title: 'Uji Keamanan Baut Silinder Head Mesin Diesel M14 (σ = F / A)',
      subtitle: 'Menghitung Tegangan Tarik dan Faktor Keamanan Baut Baja Kelas 8.8 Menahan Ledakan Silinder 24 kN',
      svgIllustration: svg,
      scenarioText: 'Pada mesin diesel 4-tak, kepala silinder (cylinder head) diikat ke blok mesin oleh serangkaian baut baja mutu tinggi kelas 8.8 (Tegangan tarik izin σ_izin = 300 MPa atau 300 N/mm²). Saat terjadi kompresi dan ledakan pembakaran bahan bakar di ruang bakar, sebuah baut silinder menerima beban gaya tarik aksial puncak sebesar F = 24.000 Newton (24 kN). Baut yang digunakan bertipe ulir metrik M14 dengan diameter inti nominal efektif d = 12 mm.',
      givenData: [
        { label: 'Gaya Tarik Ledakan Pembakaran (F)', val: '24.000 N (24 kN)' },
        { label: 'Diameter Inti Efektif Baut (d)', val: '12,0 mm' },
        { label: 'Tegangan Tarik Izin Baja Kelas 8.8 (σ_izin)', val: '300 MPa = 300 N/mm²' }
      ],
      questions: [
        '1. Berapakah luas penampang inti baut (A)?',
        '2. Berapakah tegangan tarik kerja (σ) yang dialami baut saat mesin bekerja?',
        '3. Apakah baut tersebut aman dari risiko putus/mulur permanen (σ ≤ σ_izin)? Berapakah Faktor Keamanannya (Safety Factor)?'
      ],
      solutions: [
        {
          title: 'Langkah 1: Menghitung Luas Penampang Inti Baut (A)',
          formula: 'A = (π / 4) × d²',
          desc: 'A = (3,1416 ÷ 4) × (12 mm)² = 0,7854 × 144 mm² = 113,10 mm².',
          result: '113,10 mm²'
        },
        {
          title: 'Langkah 2: Menghitung Tegangan Tarik Kerja (σ)',
          formula: 'σ = F / A',
          desc: 'σ = 24.000 N ÷ 113,10 mm² = 212,20 N/mm² = 212,20 MPa.',
          result: '212,20 MPa (N/mm²)'
        },
        {
          title: 'Langkah 3: Evaluasi Keamanan & Menghitung Safety Factor (SF)',
          formula: 'SF = σ_izin / σ_kerja',
          desc: 'Karena σ_kerja (212,20 MPa) ≤ σ_izin (300 MPa), baut AMAN berada di zona elastis. SF = 300 ÷ 212,20 = 1,41 (Memenuhi standar keselamatan mesin otomotif SF > 1,25).',
          result: 'AMAN (Faktor Keamanan SF = 1,41)'
        }
      ],
      workshopSafety: 'Selalu kencangkan baut silinder head menggunakan Kunci Torsi (Torque Wrench) secara bertahap dan menyilang (cross-tightening). Jangan pernah mengencangkan secara berlebihan karena dapat memicu tegangan melampaui batas luluh baja!',
      themeColor: '#6d28d9'
    });
  };

  // 5. STUDI KASUS KATROL: CHAIN BLOCK 1 TON
  const renderPulleyCaseStudy = () => {
    const svg = (
      <svg viewBox="0 0 760 250" width="100%" height="auto" style={{ display: 'block' }}>
        <rect width="760" height="250" rx="10" fill="#0b132b" stroke="#1e293b" />
        <rect x="60" y="15" width="640" height="18" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
        <text x="380" y="28" fill="#94a3b8" fontSize="8.5" fontWeight="bold" textAnchor="middle">Balok Girder Gantry Crane Bengkel</text>
        
        {/* Fixed Pulley */}
        <g transform="translate(260, 45)">
          <rect x="-30" y="0" width="60" height="18" rx="3" fill="#475569" stroke="#94a3b8" />
          <circle cx="-12" cy="18" r="14" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="12" cy="18" r="14" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
          <text x="0" y="38" fill="#a7f3d0" fontSize="7.5" textAnchor="middle">Katrol Tetap (2 Sheaves)</text>
        </g>

        {/* Moving Pulley */}
        <g transform="translate(260, 130)">
          <circle cx="-12" cy="0" r="14" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="12" cy="0" r="14" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
          <rect x="-30" y="6" width="60" height="16" rx="3" fill="#475569" stroke="#94a3b8" />
          <path d="M 0,22 L 0,40 C 0,52 20,52 20,40 C 20,32 10,32 10,40" fill="none" stroke="#f59e0b" strokeWidth="3" />
          <text x="0" y="-12" fill="#a7f3d0" fontSize="7.5" textAnchor="middle">Katrol Bergerak</text>
        </g>

        {/* 4 Chains */}
        <g stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,2">
          <line x1="240" y1="63" x2="240" y2="130" />
          <line x1="254" y1="63" x2="254" y2="130" />
          <line x1="266" y1="63" x2="266" y2="130" />
          <line x1="280" y1="63" x2="280" y2="130" />
        </g>
        <text x="260" y="98" fill="#38bdf8" fontSize="9" fontWeight="900" textAnchor="middle">n = 4 Tali Penahan Beban</text>

        {/* Lathe Box */}
        <g transform="translate(260, 195)">
          <rect x="-70" y="-20" width="140" height="40" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
          <text x="0" y="-3" fill="#f8fafc" fontSize="9.5" fontWeight="bold" textAnchor="middle">Mesin Bubut (1.000 kg)</text>
          <text x="0" y="11" fill="#fca5a5" fontSize="8.5" fontWeight="bold" textAnchor="middle">Berat Beban W = 9.800 N</text>
        </g>

        {/* Hand Chain */}
        <g transform="translate(540, 95)">
          <circle cx="0" cy="-35" r="20" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="0" y="-32" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle">Roda Gigi</text>
          <text x="0" y="-21" fill="#94a3b8" fontSize="7" textAnchor="middle">Rasio 1:4</text>
          <line x1="-12" y1="-15" x2="-12" y2="65" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" />
          <line x1="12" y1="-15" x2="12" y2="65" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" />
          <g transform="translate(-12, 50)">
            <circle cx="0" cy="-14" r="10" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
            <text x="0" y="-10" fontSize="9" textAnchor="middle">✋</text>
            <line x1="0" y1="0" x2="0" y2="35" stroke="#10b981" strokeWidth="3" />
            <polygon points="-4,30 0,40 4,30" fill="#10b981" />
            <text x="0" y="55" fill="#10b981" fontSize="11" fontWeight="900" textAnchor="middle">F_tangan = 612,5 N</text>
            <text x="0" y="68" fill="#86efac" fontSize="8.5" textAnchor="middle">(≈ 62 kg tarikan tangan)</text>
          </g>
        </g>

        {/* Badge */}
        <g transform="translate(540, 185)">
          <rect x="-120" y="-16" width="240" height="32" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
          <text x="0" y="4" fill="#a7f3d0" fontSize="9" fontWeight="900" textAnchor="middle">
            KM Total = 4 Tali × 4 Gigi = 16× Lipat!
          </text>
        </g>
      </svg>
    );

    return renderCaseStudyCard({
      caseNumber: '5',
      title: 'Mengangkat Mesin Bubut 1.000 kg Menggunakan Takal Chain Block 4 Tali (F = W / n)',
      subtitle: 'Membuktikan Bagaimana Beban Seberat 1 Ton Mampu Diangkat Ringan Hanya dengan Tarikan Rantai Tangan 60 kg',
      svgIllustration: svg,
      scenarioText: 'Dua orang siswa dan teknisi bengkel SMK ditugaskan menaikkan unit mesin bubut baru seberat 1.000 kg (W ≈ 9.800 N) dari lantai bengkel ke atas meja pondasi beton setinggi 80 cm. Tidak ada forklift bertenaga mesin di lorong tersebut, sehingga mereka menggunakan alat angkat manual Takal Chain Block dengan konstruksi 4 utas tali/rantai penahan beban (n = 4) yang dilengkapi roda gigi reduksi transmisi 1:4.',
      givenData: [
        { label: 'Massa Mesin Bubut (m)', val: '1.000 kg' },
        { label: 'Berat Beban Total (W = m · g)', val: '1.000 × 9,8 = 9.800 N' },
        { label: 'Jumlah Tali/Rantai Penahan Beban (n)', val: '4 utas tali paralel (KM katrol = 4)' },
        { label: 'Rasio Reduksi Roda Gigi Manual Tambahan', val: '1 : 4' }
      ],
      questions: [
        '1. Berapakah Keuntungan Mekanis (KM) murni dari susunan 4 tali katrol majemuk tersebut?',
        '2. Berapakah tegangan gaya tarik rantai beban (F_katrol) yang ditahan oleh blok pengait?',
        '3. Berapakah gaya tarik rantai tangan (F_tangan) yang harus dikerahkan oleh siswa setelah melewati reduksi roda gigi?'
      ],
      solutions: [
        {
          title: 'Langkah 1: Menghitung Berat Total Mesin (W)',
          formula: 'W = m × g',
          desc: 'W = 1.000 kg × 9,8 m/s² = 9.800 Newton.',
          result: '9.800 Newton'
        },
        {
          title: 'Langkah 2: Menghitung Gaya Tarik pada Sistem Katrol Majemuk (F_katrol)',
          formula: 'F_katrol = W / n',
          desc: 'Karena beban 9.800 N ditanggung bersama oleh n = 4 tali vertikal paralel: F_katrol = 9.800 N ÷ 4 = 2.450 Newton (~250 kg). Keuntungan mekanis susunan katrol adalah KM = 4x lipat.',
          result: '2.450 Newton (~250 kg)'
        },
        {
          title: 'Langkah 3: Menghitung Gaya Tarik Tangan Siswa dengan Bantuan Reduksi Roda Gigi',
          formula: 'F_tangan = F_katrol / Rasio Gigi',
          desc: 'F_tangan = 2.450 N ÷ 4 = 612,5 Newton. Konversi beban gravitasi setara: 612,5 N ÷ 9,8 m/s² ≈ 62,5 kg tarikan tangan. Total penggandaan tenaga mencapai 16x lipat sehingga mesin 1 ton bisa diangkat bertahap dengan tangan kosong!',
          result: '612,5 Newton (~62,5 kg tarikan tangan)'
        }
      ],
      workshopSafety: 'Selalu periksa sertifikasi batas beban kerja (Working Load Limit / WLL) pada rantai takal sebelum digunakan. Pastikan pengait terpasang safety latch pengunci agar sling sabuk pengikat mesin tidak terlepas saat proses pengangkatan!',
      themeColor: '#047857'
    });
  };

  // 6. STUDI KASUS GESEKAN: RAMP MIRING GENSET & OLI LICIN
  const renderFrictionCaseStudy = () => {
    const svg = (
      <svg viewBox="0 0 760 250" width="100%" height="auto" style={{ display: 'block' }}>
        <rect width="760" height="250" rx="10" fill="#0b132b" stroke="#1e293b" />
        <g transform="translate(60, 95)">
          <rect x="0" y="0" width="70" height="110" fill="#334155" stroke="#64748b" strokeWidth="2" />
          <text x="35" y="55" fill="#cbd5e1" fontSize="8.5" fontWeight="bold" textAnchor="middle">Bak Mobil</text>
          <text x="35" y="70" fill="#94a3b8" fontSize="7.5" textAnchor="middle">Pikap</text>
        </g>
        <line x1="60" y1="205" x2="720" y2="205" stroke="#475569" strokeWidth="2" />
        
        {/* Ramp */}
        <g>
          <line x1="130" y1="95" x2="380" y2="205" stroke="#d97706" strokeWidth="10" strokeLinecap="round" />
          <path d="M 330,205 A 50 50 0 0 0 342,185" fill="none" stroke="#f59e0b" strokeWidth="2" />
          <text x="320" y="195" fill="#fbbf24" fontSize="9" fontWeight="bold">α = 25°</text>
        </g>

        {/* Crate on Ramp */}
        <g transform="translate(250, 145) rotate(23)">
          <rect x="-25" y="-35" width="50" height="35" rx="3" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
          <text x="0" y="-16" fill="#fca5a5" fontSize="7.5" fontWeight="bold" textAnchor="middle">Genset 300kg</text>
          <line x1="0" y1="-17" x2="0" y2="-65" stroke="#38bdf8" strokeWidth="2.5" />
          <polygon points="-4,-60 0,-70 4,-60" fill="#38bdf8" />
          <text x="0" y="-75" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">N = 2.664 N</text>
          <line x1="0" y1="-17" x2="55" y2="-17" stroke="#ef4444" strokeWidth="2.5" />
          <polygon points="50,-21 60,-17 50,-13" fill="#ef4444" />
          <text x="55" y="-5" fill="#ef4444" fontSize="8" fontWeight="bold">Wx = 1.242 N</text>
          <line x1="0" y1="-17" x2="-45" y2="-17" stroke="#10b981" strokeWidth="2.5" />
          <polygon points="-40,-21 -50,-17 -40,-13" fill="#10b981" />
          <text x="-50" y="-5" fill="#10b981" fontSize="8" fontWeight="bold">fs</text>
        </g>

        {/* Oil Drops */}
        <circle cx="210" cy="130" r="3" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="280" cy="162" r="3.5" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />

        {/* Side-by-Side Comparison Boards */}
        <g transform="translate(560, 75)">
          <rect x="-140" y="-40" width="280" height="75" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
          <text x="-125" y="-20" fill="#a7f3d0" fontSize="10" fontWeight="900">1. Papan Kayu Kering (μ = 0,55):</text>
          <text x="-125" y="-3" fill="#ffffff" fontSize="8.5">• Batas Gesek fs,max = 0,55 × 2.664 = 1.465 N</text>
          <text x="-125" y="13" fill="#ffffff" fontSize="8.5">• Wx (1.242 N) &lt; fs,max (1.465 N) | α_kritis = 28,8° &gt; 25°</text>
          <text x="-125" y="27" fill="#86efac" fontSize="9" fontWeight="900">➔ HASIL: MESIN DIAM AMAN (TIDAK MEROSOT)</text>
        </g>
        <g transform="translate(560, 175)">
          <rect x="-140" y="-40" width="280" height="75" rx="8" fill="#450a0a" stroke="#dc2626" strokeWidth="1.5" />
          <text x="-125" y="-20" fill="#fca5a5" fontSize="10" fontWeight="900">2. Papan Terkena Oli (μ = 0,15):</text>
          <text x="-125" y="-3" fill="#ffffff" fontSize="8.5">• Batas Gesek fs,max = 0,15 × 2.664 = 399 N</text>
          <text x="-125" y="13" fill="#ffffff" fontSize="8.5">• Wx (1.242 N) &gt;&gt; fs,max (399 N) | α_kritis = 8,5° &lt;&lt; 25°</text>
          <text x="-125" y="27" fill="#f87171" fontSize="9" fontWeight="900">➔ BAHAYA: MELUNCUR BEBAS (BISA MENIMPA ORANG!)</text>
        </g>
      </svg>
    );

    return renderCaseStudyCard({
      caseNumber: '6',
      title: 'Menurunkan Genset Bengkel 300 kg Melalui Ramp & Bahaya Ceceran Oli Licin (fs = μ · N)',
      subtitle: 'Menghitung Sudut Kritis Merosot dan Bahaya Fatal Bila Bidang Miring Terkena Ceceran Oli Mesin',
      svgIllustration: svg,
      scenarioText: 'Siswa bengkel mesin sedang menurunkan unit generator genset darurat berbobot 300 kg (W = 2.940 N) dari bak mobil pikap menggunakan papan bidang miring dengan sudut kemiringan α = 25°. Koefisien gesek statis pada permukaan papan kayu kering adalah μ_kering = 0,55. Namun, saat proses berlangsung, terjadi tumpahan oli mesin bekas di permukaan papan sehingga koefisien geseknya anjlok drastis menjadi μ_oli = 0,15.',
      givenData: [
        { label: 'Berat Genset (W)', val: '300 × 9,8 = 2.940 N' },
        { label: 'Sudut Kemiringan Ramp (α)', val: '25° (sin 25° = 0,4226 | cos 25° = 0,9063)' },
        { label: 'Koefisien Gesek Statis Papan Kering (μ_kering)', val: '0,55' },
        { label: 'Koefisien Gesek Statis Permukaan Beroli (μ_oli)', val: '0,15' }
      ],
      questions: [
        '1. Berapakah gaya luncur gravitasi (Wx) yang mendorong genset meluncur ke bawah ramp?',
        '2. Berapakah gaya gesek penahan maksimal pada kondisi kering (fs_kering)? Apakah genset meluncur atau diam?',
        '3. Berapakah gaya gesek penahan saat ramp terkena oli (fs_oli)? Apa bahaya yang terjadi?',
        '4. Berapakah sudut kritis merosot (α_kritis) untuk kedua kondisi tersebut?'
      ],
      solutions: [
        {
          title: 'Langkah 1: Menghitung Gaya Normal (N) dan Gaya Luncur Gravitasi (Wx)',
          formula: 'N = W × cos(α)  |  Wx = W × sin(α)',
          desc: 'N = 2.940 N × cos(25°) = 2.940 × 0,9063 = 2.664,5 Newton. Wx = 2.940 N × sin(25°) = 2.940 × 0,4226 = 1.242,4 Newton.',
          result: 'N = 2.664,5 N  |  Wx = 1.242,4 N'
        },
        {
          title: 'Langkah 2: Analisis Kondisi Papan Kayu Kering (μ = 0,55)',
          formula: 'fs,max = μ_kering × N',
          desc: 'fs,max = 0,55 × 2.664,5 N = 1.465,5 Newton. Sudut kritis: tan(α_kritis) = 0,55 ➔ α_kritis = arctan(0,55) = 28,8°. Karena sudut kemiringan ramp (25°) masih di bawah sudut kritis (28,8°), dan daya tahan gesek fs,max (1.465,5 N) > Wx (1.242,4 N), maka genset DIAM TERKUNCI AMAN.',
          result: 'DIAM AMAN (fs,max 1.465,5 N > Wx 1.242,4 N)'
        },
        {
          title: 'Langkah 3: Analisis Kondisi Papan Terkena Ceceran Oli Mesin (μ = 0,15)',
          formula: 'fs,max = μ_oli × N',
          desc: 'fs,max = 0,15 × 2.664,5 N = 399,7 Newton. Sudut kritis: α_kritis = arctan(0,15) = 8,5° (jauh lebih curam dari 8,5°!). Gaya gesek penahan (399,7 N) JAUH LEBIH KECIL dari gaya dorong gravitasi (1.242,4 N). Sisa gaya luncur tak tertahan: F_net = 1.242,4 - 399,7 = 842,7 N! Genset seberat 300 kg akan meluncur jatuh bebas tak terkendali!',
          result: 'BAHAYA FATAL! Meluncur deras dengan gaya dorong bebas 842,7 N'
        }
      ],
      workshopSafety: 'Bidang miring pemindah barang WAJIB bebas dari oli atau pelumas! Selalu gunakan pelat bordes bertekstur anti-selip (chequer plate) dan selalu pasang tali rem penahan atau takal kerek tambang di bagian atas saat menurunkan muatan berat.',
      themeColor: '#0369a1'
    });
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
            Pusat Rumus Mekanika Teknik &amp; Studi Kasus
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#e0f2fe', margin: 0, lineHeight: 1.5 }}>
            Koleksi lengkap rumus mekanika terapan SMK, kalkulator interaktif pintar (bedah langkah 5 tahap), dan <strong>studi kasus nyata bengkel dengan gambar ilustrasi teknik</strong>.
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
              title: '1. Rumus Torsi (τ = F × d)',
              problem: 'Kasus: Baut Roda Truk Macet Berkarat',
              formula: 'τ = F × d',
              color: '#0284c7',
              bg: '#f0f9ff'
            },
            {
              id: 'lever',
              icon: '🕹️',
              title: '2. Rumus Tuas (W·Lb = F·Lk)',
              problem: 'Kasus: Mengungkit Mesin Bubut 600 kg',
              formula: 'KM = Lk / Lb',
              color: '#b45309',
              bg: '#fffbeb'
            },
            {
              id: 'equilibrium',
              icon: '⚖️',
              title: '3. Rumus Kesetimbangan (ΣM = 0)',
              problem: 'Kasus: Balok Crane Hoist Frais 1,2 Ton',
              formula: 'ΣM = 0 | ΣFy = 0',
              color: '#166534',
              bg: '#f0fdf4'
            },
            {
              id: 'stress',
              icon: '📏',
              title: '4. Rumus Tegangan (σ = F / A)',
              problem: 'Kasus: Baut Silinder Head Diesel M14',
              formula: 'σ = F / A',
              color: '#6d28d9',
              bg: '#f5f3ff'
            },
            {
              id: 'pulley',
              icon: '🏗️',
              title: '5. Rumus Katrol (F = W / n)',
              problem: 'Kasus: Takal Chain Block Angkat 1 Ton',
              formula: 'F = W / n',
              color: '#047857',
              bg: '#ecfdf5'
            },
            {
              id: 'friction',
              icon: '📐',
              title: '6. Rumus Gesekan (fs = μ · N)',
              problem: 'Kasus: Ramp Genset & Bahaya Oli Licin',
              formula: 'fs = μ · N',
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
          { id: 'torque', label: '🔧 1. Rumus Torsi (τ = F × d)', badge: 'Kunci Pas Baut' },
          { id: 'lever', label: '🕹️ 2. Rumus Tuas (W·Lb = F·Lk)', badge: 'Pengungkit Mesin' },
          { id: 'equilibrium', label: '⚖️ 3. Rumus Kesetimbangan (ΣM = 0)', badge: 'Balok Crane' },
          { id: 'stress', label: '📏 4. Rumus Tegangan (σ = F/A)', badge: 'Baut Silinder' },
          { id: 'pulley', label: '🏗️ 5. Rumus Katrol (F = W/n)', badge: 'Chain Block 1 Ton' },
          { id: 'friction', label: '📐 6. Rumus Gesekan (fs = μ·N)', badge: 'Ramp Miring & Oli' },
          { id: 'calculator', label: '🧮 7. Bank Semua Rumus', badge: 'All-in-One' },
          { id: 'quiz', label: '🏆 8. Kuis Kasus Bengkel', badge: '+500 XP' }
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
          TAB 1: RUMUS MOMEN GAYA & TORSI (τ = F × d)
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

          {/* Interactive Formula Solver for Torque */}
          {renderTorqueFormulaSolver()}

          {/* Studi Kasus Nyata Bengkel Mesin dengan Gambar Ilustrasi Teknik */}
          {renderTorqueCaseStudy()}
        </div>
      )}

      {/* =====================================================================
          TAB 2: RUMUS SISTEM TUAS (PENGUNGKIT) (W · Lb = F · Lk)
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

          {/* Studi Kasus Nyata Bengkel Mesin dengan Gambar Ilustrasi Teknik */}
          {renderLeverCaseStudy()}
        </div>
      )}

      {/* =====================================================================
          TAB 3: RUMUS KESETIMBANGAN BALOK CRANE (ΣM = 0 & ΣFy = 0)
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

          {/* Studi Kasus Nyata Bengkel Mesin dengan Gambar Ilustrasi Teknik */}
          {renderBeamCaseStudy()}
        </div>
      )}

      {/* =====================================================================
          TAB 4: RUMUS TEGANGAN & REGANGAN BAUT (σ = F / A)
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

          {/* Studi Kasus Nyata Bengkel Mesin dengan Gambar Ilustrasi Teknik */}
          {renderStressCaseStudy()}
        </div>
      )}

      {/* =====================================================================
          TAB 5: RUMUS KATROL & TAKAL CHAIN BLOCK (F = W / n)
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

          {/* Embedded Formula Solver for Pulley */}
          {renderPulleyFormulaSolver()}

          {/* Studi Kasus Nyata Bengkel Mesin dengan Gambar Ilustrasi Teknik */}
          {renderPulleyCaseStudy()}
        </div>
      )}

      {/* =====================================================================
          TAB 6: RUMUS GESEKAN & BIDANG MIRING (fs = μ · N)
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

          {/* Embedded Formula Solver for Friction */}
          {renderFrictionFormulaSolver()}

          {/* Studi Kasus Nyata Bengkel Mesin dengan Gambar Ilustrasi Teknik */}
          {renderFrictionCaseStudy()}
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

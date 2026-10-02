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
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 900, color: effortColor }}>
                          {effortBadge}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                          {effortAdvice}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: effortColor }}>
                          {effortForceNewton} N
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          ≈ {effortKgEquivalent} kg beban otot
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Math Breakdown Box */}
                    <div style={{
                      background: '#0f172a',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      border: '1px solid #334155'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '4px' }}>
                        📐 Bedah Perhitungan Simulator (τ = F × d):
                      </div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#f8fafc', lineHeight: 1.5 }}>
                        1. Data: Jarak d = {handDistanceCm} cm ({handDistanceMeter.toFixed(2)} m) | Torsi τ = {requiredTorqueNm} Nm<br />
                        2. Rumus: F = τ / d<br />
                        3. Hitung: F = {requiredTorqueNm} Nm ÷ {handDistanceMeter.toFixed(2)} m = <strong style={{ color: effortColor }}>{effortForceNewton} Newton</strong> (~{effortKgEquivalent} kg beban otot tangan)
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

              {/* Readout with Stepped Calculation */}
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>Tenaga Tarik Rantai Yang Dibutuhkan:</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#166534', margin: '2px 0' }}>
                      {pulleyPullForceN} Newton <span style={{ fontSize: '1rem', color: '#15803d' }}>(~{pulleyPullKgEquivalent} kg)</span>
                    </div>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 900 }}>
                    KM = {pulleyRopes}×
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700, marginBottom: '10px' }}>
                  🎉 Beban mesin {machineWeightKg} kg diringankan {pulleyRopes}x lipat menjadi setara beban {pulleyPullKgEquivalent} kg!
                </div>

                {/* Step-by-step box */}
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.75rem', fontFamily: 'monospace', color: '#0f172a', lineHeight: 1.55 }}>
                  1. Berat total beban: W = {machineWeightKg} kg × 9.8 m/s² = {Math.round(machineWeightN)} N<br />
                  2. Rumus: F = W / n (dengan n = {pulleyRopes} utas tali penahan)<br />
                  3. Gaya tarik kuasa: F = {Math.round(machineWeightN)} N ÷ {pulleyRopes} = <strong>{pulleyPullForceN} Newton</strong> (~{pulleyPullKgEquivalent} kg)
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

              {/* Readout with Stepped Math Breakdown */}
              {(() => {
                const sampleW = 100; // Newton (massa ~10.2 kg)
                const normForce = (sampleW * Math.cos(angleRad)).toFixed(1);
                const parallelForce = (sampleW * Math.sin(angleRad)).toFixed(1);
                const maxFriction = (frictionCoeff * Number(normForce)).toFixed(1);
                const critAngle = ((Math.atan(frictionCoeff) * 180) / Math.PI).toFixed(1);
                const tanVal = Math.tan(angleRad).toFixed(2);

                return (
                  <div style={{ background: isSliding ? '#fef2f2' : '#f0fdf4', padding: '16px', borderRadius: '12px', border: `1px solid ${isSliding ? '#fca5a5' : '#bbf7d0'}`, borderLeft: `4px solid ${isSliding ? '#dc2626' : '#16a34a'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 900, color: isSliding ? '#dc2626' : '#16a34a' }}>
                        {isSliding ? '⛷️ BENDA MELUNCUR TURUN!' : '🛑 BENDA DIAM TERKUNCI (GESEKAN STATIS)'}
                      </div>
                      <span style={{
                        background: isSliding ? '#fee2e2' : '#dcfce7',
                        color: isSliding ? '#991b1b' : '#166534',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        α kritis = {critAngle}°
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: isSliding ? '#991b1b' : '#166534', fontWeight: 700, marginBottom: '10px' }}>
                      {isSliding
                        ? `Sudut ${inclineAngleDeg}° sudah melebihi batas kritis (${critAngle}°). tan(${inclineAngleDeg}°) = ${tanVal} > μ (${frictionCoeff}).`
                        : `Sudut ${inclineAngleDeg}° masih di bawah batas kritis (${critAngle}°). tan(${inclineAngleDeg}°) = ${tanVal} ≤ μ (${frictionCoeff}).`}
                    </div>

                    {/* Step-by-Step Math Breakdown Box */}
                    <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${isSliding ? '#fecaca' : '#bbf7d0'}`, fontSize: '0.74rem', fontFamily: 'monospace', color: '#0f172a', lineHeight: 1.55 }}>
                      <div style={{ fontWeight: 800, color: isSliding ? '#b91c1c' : '#15803d', marginBottom: '4px' }}>
                        📐 Analisis Gaya Uji (Beban Balok W = 100 N):
                      </div>
                      1. Gaya Normal: N = W × cos({inclineAngleDeg}°) = 100 × {Math.cos(angleRad).toFixed(3)} = {normForce} N<br />
                      2. Gaya Tarik Gravitasi: Wx = W × sin({inclineAngleDeg}°) = 100 × {Math.sin(angleRad).toFixed(3)} = {parallelForce} N<br />
                      3. Batas Cengkeram Statis: fs,max = μ × N = {frictionCoeff} × {normForce} N = <strong>{maxFriction} N</strong><br />
                      4. Kesimpulan: {isSliding ? `Wx (${parallelForce} N) > fs,max (${maxFriction} N) ➔ Gaya dorong gravitasi menang!` : `Wx (${parallelForce} N) ≤ fs,max (${maxFriction} N) ➔ Gesekan mampu menahan beban!`}
                    </div>
                  </div>
                );
              })()}
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

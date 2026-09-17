import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import { useAccessibility } from '../context/AccessibilityContext';
import HeatTreatmentYouTubeCard from './HeatTreatmentYouTubeCard';

// =============================================================================
// DATABASE SIMULATOR BLACKENING (7-STAGE HOT BLACK OXIDE)
// =============================================================================
const BLACKENING_TANKS = [
  {
    step: 1,
    id: 'degreasing',
    nama: 'Bak 1: Alkaline Degreaser',
    sub: 'Bersih Lemak & Oli',
    temp: '75°C - 80°C',
    durasi: 8,
    durasiReal: '5 - 10 Menit',
    kimia: 'NaOH + Surfaktan (pH 12 - 14)',
    fungsi: 'Melarutkan oli pemotongan dromus & gemuk agar reaksi blackening tidak belang.',
    warnaBenda: '#94a3b8',
    statusBenda: 'Baja Abu-Abu (Bebas Oli)',
    icon: '🧼'
  },
  {
    step: 2,
    id: 'rinse-1',
    nama: 'Bak 2: Cold Water Rinse 1',
    sub: 'Bilas Sabun Alkali',
    temp: '25°C (Kamar)',
    durasi: 4,
    durasiReal: '1 - 2 Menit',
    kimia: 'Air Bersih Mengalir Bebas Mineral',
    fungsi: 'Membasuh sisa sabun alkali agar tidak menetralkan asam pada bak pickling.',
    warnaBenda: '#cbd5e1',
    statusBenda: 'Bersih Mengkilap (Water Break Free)',
    icon: '💧'
  },
  {
    step: 3,
    id: 'pickling',
    nama: 'Bak 3: Acid Pickling / Deox',
    sub: 'Etsa Asam & Buang Karat',
    temp: '25°C (Kamar)',
    durasi: 6,
    durasiReal: '1 - 3 Menit',
    kimia: 'Asam Klorida (HCl 10% - 15%)',
    fungsi: 'Mengikis karat tipis dan membuka pori-pori kristal baja (micro-etching).',
    warnaBenda: '#e2e8f0',
    statusBenda: 'Baja Ter-Etsa Bersih',
    icon: '🧪'
  },
  {
    step: 4,
    id: 'rinse-2',
    nama: 'Bak 4: Cold Water Rinse 2',
    sub: 'Bilas Residu Asam',
    temp: '25°C (Kamar)',
    durasi: 4,
    durasiReal: '1 - 2 Menit',
    kimia: 'Air Bersih Mengalir Deras',
    fungsi: 'Membilas asam total agar tidak memicu ledakan uap saat masuk ke bak garam panas.',
    warnaBenda: '#cbd5e1',
    statusBenda: 'Baja Netral Siap Konversi',
    icon: '💧'
  },
  {
    step: 5,
    id: 'blackening-bath',
    nama: 'Bak 5: Hot Blackening Bath',
    sub: 'Konversi Fe₃O₄ Magnetit',
    temp: '140°C - 143°C (Didih)',
    durasi: 12,
    durasiReal: '15 - 30 Menit',
    kimia: 'NaOH + NaNO₂ + NaNO₃ Mendidih',
    fungsi: 'Inti Reaksi: Atom besi bereaksi menjadi magnetit Fe₃O₄ hitam pekat 0.000 mm!',
    warnaBenda: '#18181b',
    statusBenda: 'HITAM PEKAT DOFF (Fe₃O₄ 100%)',
    icon: '⚗️'
  },
  {
    step: 6,
    id: 'rinse-3',
    nama: 'Bak 6: Cold Water Rinse 3',
    sub: 'Bilas Sisa Garam Hitam',
    temp: '25°C - 45°C',
    durasi: 4,
    durasiReal: '2 - 3 Menit',
    kimia: 'Air Bersih Mengalir 2 Tahap',
    fungsi: 'Menghilangkan residu garam dari celah ulir agar tidak timbul bercak putih karat.',
    warnaBenda: '#09090b',
    statusBenda: 'Hitam Bersih Bebas Garam',
    icon: '💧'
  },
  {
    step: 7,
    id: 'oil-seal',
    nama: 'Bak 7: De-watering Oil Seal',
    sub: 'Segel Oli Anti-Karat',
    temp: '25°C - 35°C',
    durasi: 6,
    durasiReal: '1 - 2 Menit',
    kimia: 'Water-Displacing Rust Inhibitor Oil',
    fungsi: 'Oli menembus pori magnetit mengusir molekul air. Tahan karat ratusan jam!',
    warnaBenda: '#020617',
    statusBenda: 'HITAM MEWAH TAHAN KARAT TOTAL',
    icon: '🛡️'
  }
];

// =============================================================================
// DATABASE KUIS HEAT TREATMENT
// =============================================================================
const HEAT_TREATMENT_QUIZ = [
  {
    id: 1,
    pertanyaan: 'Seorang teknisi membubut pahat bubut HSS. Setelah dipanaskan ke 850°C dan di-quench di air dingin, ia langsung memasangnya ke mesin. Saat baru menyentuh benda kerja, pahat langsung pecah berkeping-keping. Mengapa hal ini terjadi?',
    pilihan: [
      'Pahat terlalu lunak karena suhu pemanasannya kurang tinggi',
      'Pahat berstruktur Martensit getas dan belum melalui proses TEMPERING untuk membuang tegangan sisa',
      'Baja HSS seharusnya dicelup ke air mendidih bukan air dingin',
      'Pahat kehilangan seluruh kandungan besi selama pemanasan'
    ],
    kunci: 1,
    penjelasan: 'Martensit hasil quenching memiliki kekerasan puncak namun getas seperti kaca! Proses TEMPERING wajib segera dilakukan untuk memberikan keuletan (toughness) agar pahat tidak pecah getas saat bekerja.'
  },
  {
    id: 2,
    pertanyaan: 'Mengapa industri senjata api, lensa mikroskop optik, dan baut ulir presisi tinggi memilih pelapisan Blackening dibanding cat semprot?',
    pilihan: [
      'Karena cat semprot jauh lebih mahal daripada garam blackening',
      'Karena Blackening tidak mengubah dimensi ukuran sama sekali (0.000 mm) dan tidak reflektif (anti-silau)',
      'Karena Blackening membuat baja dapat menghantarkan listrik bertegangan 10.000 Volt',
      'Karena cat semprot tidak dapat menempel pada permukaan logam baja'
    ],
    kunci: 1,
    penjelasan: 'Blackening adalah reaksi konversi kimia permukaan menjadi magnetit Fe₃O₄ setebal 1-2 mikron tanpa menambah ketebalan eksternal (0.000 mm). Ulir presisi tidak akan macet dan warna doff menyerap pantulan cahaya.'
  },
  {
    id: 3,
    pertanyaan: 'Poros roda gigi transmisi truk membutuhkan gigi yang sangat keras tahan aus (62 HRC), tetapi inti poros di dalamnya harus tetap ulet menyerap hentakan torsi mendadak. Proses perlakuan panas mana yang paling tepat?',
    pilihan: [
      'Full Annealing selama 24 jam di tungku tertutup',
      'Case Hardening (Carburizing) pada baja karbon rendah',
      'Normalizing di udara terbuka',
      'Quenching baja karbon tinggi tanpa tempering'
    ],
    kunci: 1,
    penjelasan: 'Case Hardening mendifusikan atom karbon ke permukaan luar baja sedalam 1-2 mm. Saat di-quench, hanya kulit luar yang mengeras menjadi 60-62 HRC, sementara inti dalamnya tetap berkadar karbon rendah yang ulet menahan beban impak.'
  },
  {
    id: 4,
    pertanyaan: 'Pada proses Hot Black Oxide, mengapa suhu bak garam kimia (Bak 5) wajib dipertahankan ketat di 140°C hingga 143°C?',
    pilihan: [
      'Jika di bawah 138°C terbentuk oksida merah besi (karat Fe₂O₃), bukan magnetit hitam (Fe₃O₄)',
      'Jika di atas 130°C baja akan meleleh menjadi cairan besi',
      'Suhu tersebut adalah titik beku larutan garam kaustik',
      'Suhu 140°C membuat air tidak bisa menguap dari dalam bak'
    ],
    kunci: 0,
    penjelasan: 'Jendela suhu didih 140°C–143°C sangat kritis. Di bawah 138°C air terlalu banyak dan terbentuk karat merah Fe₂O₃. Di atas 146°C larutan terlalu jenuh dan menimbulkan bercak kerak garam.'
  },
  {
    id: 5,
    pertanyaan: 'Mengapa pada Full Annealing, pendinginan wajib dilakukan SANGAT LAMBAT di dalam oven tertutup (10–20°C/jam) dan dilarang membuka pintu tungku sebelum di bawah 450°C?',
    pilihan: [
      'Agar benda kerja tidak terbakar oleh oksigen luar',
      'Untuk memberi waktu atom karbon berdifusi membentuk perlit kasar lunak sehingga baja 100% empuk disayat mesin bubut CNC',
      'Karena tungku akan meledak jika dibuka pada suhu 450°C',
      'Agar permukaan baja berubah menjadi hitam berkilau secara alami'
    ],
    kunci: 1,
    penjelasan: 'Pendinginan super lambat di dalam oven memberi waktu leluasa bagi atom besi dan karbon kembali ke kesetimbangan alami membentuk perlit kasar. Ini membuat baja sangat lunak (machinability 100%) dan membebaskan 100% tegangan sisa penempaan.'
  }
];

export default function HeatTreatmentLab({ initialTab = 'hardening', addXP = () => {}, addMissionCompleted = () => {} }) {
  const { isVoiceActive } = useAccessibility();

  // Tab State
  const [activeTab, setActiveTab] = useState(initialTab === 'video-sim' ? 'hardening' : initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'video-sim' ? 'hardening' : initialTab);
    }
  }, [initialTab]);

  // Blackening Simulator State
  const [selectedWorkpiece, setSelectedWorkpiece] = useState('baut-hex');
  const [currentTankIndex, setCurrentTankIndex] = useState(0);
  const [isDipping, setIsDipping] = useState(false);
  const [dipTimer, setDipTimer] = useState(0);
  const [autoDippingActive, setAutoDippingActive] = useState(false);
  const [finishedBlackening, setFinishedBlackening] = useState(false);
  const [qualityTestResult, setQualityTestResult] = useState(null);

  // Hardening Quench State
  const [hardSteelGrade, setHardSteelGrade] = useState('1045');
  const [hardFurnaceTemp, setHardFurnaceTemp] = useState(850);
  const [hardQuenchMedia, setHardQuenchMedia] = useState('oil');
  const [isHardeningRunning, setIsHardeningRunning] = useState(false);
  const [hardeningResult, setHardeningResult] = useState(null);

  // Tempering Slider State
  const [temperBladeTemp, setTemperBladeTemp] = useState(240);

  // All-In-One Simulator State
  const [simSteelGrade, setSimSteelGrade] = useState('1045');
  const [simFurnaceTemp, setSimFurnaceTemp] = useState(850);
  const [simQuenchMedia, setSimQuenchMedia] = useState('oil');
  const [simTemperTemp, setSimTemperTemp] = useState(250);
  const [simResult, setSimResult] = useState(null);
  const [isHeatTreatRunning, setIsHeatTreatRunning] = useState(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState({});

  const dipIntervalRef = useRef(null);

  const playTabSound = () => sound.playClick();
  const switchTab = (tab) => {
    playTabSound();
    setActiveTab(tab);
  };

  // Blackening Logic
  const startSingleTankDip = (tankIdx) => {
    if (isDipping) return;
    sound.playClick();
    setCurrentTankIndex(tankIdx);
    setIsDipping(true);
    setQualityTestResult(null);

    const currentTank = BLACKENING_TANKS[tankIdx];
    let elapsed = 0;
    setDipTimer(0);

    if (dipIntervalRef.current) clearInterval(dipIntervalRef.current);

    dipIntervalRef.current = setInterval(() => {
      elapsed += 1;
      setDipTimer(elapsed);

      if (elapsed >= currentTank.durasi) {
        clearInterval(dipIntervalRef.current);
        setIsDipping(false);
        sound.playSuccess();
        if (tankIdx === BLACKENING_TANKS.length - 1) {
          setFinishedBlackening(true);
          addXP(200);
          addMissionCompleted();
        }
      }
    }, 1000);
  };

  const runFullAutoLine = () => {
    if (isDipping || autoDippingActive) return;
    sound.playClick();
    setAutoDippingActive(true);
    setFinishedBlackening(false);
    setQualityTestResult(null);

    const processStep = (step) => {
      if (step >= BLACKENING_TANKS.length) {
        setAutoDippingActive(false);
        setIsDipping(false);
        setFinishedBlackening(true);
        sound.playSuccess();
        addXP(350);
        addMissionCompleted();
        return;
      }

      setCurrentTankIndex(step);
      setIsDipping(true);
      const tank = BLACKENING_TANKS[step];
      let t = 0;
      setDipTimer(0);

      const interval = setInterval(() => {
        t += 1;
        setDipTimer(t);
        if (t >= tank.durasi) {
          clearInterval(interval);
          sound.playClick();
          setTimeout(() => {
            processStep(step + 1);
          }, 800);
        }
      }, 700);
    };

    processStep(0);
  };

  const resetBlackening = () => {
    if (dipIntervalRef.current) clearInterval(dipIntervalRef.current);
    setIsDipping(false);
    setAutoDippingActive(false);
    setCurrentTankIndex(0);
    setDipTimer(0);
    setFinishedBlackening(false);
    setQualityTestResult(null);
    sound.playClick();
  };

  const runQualityTest = (testType) => {
    sound.playClick();
    setQualityTestResult(testType);
    addXP(50);
  };

  // Hardening Quench Logic
  const runHardeningQuench = () => {
    sound.playClick();
    setIsHardeningRunning(true);
    setHardeningResult(null);

    setTimeout(() => {
      setIsHardeningRunning(false);
      sound.playSuccess();

      let maxHRC = 30;
      let crackRisk = 5;
      let martensitePct = 10;
      let coolingRate = 50;

      if (hardSteelGrade === '1020') {
        maxHRC = 32;
        martensitePct = 25;
        crackRisk = 5;
      } else if (hardSteelGrade === '1045') {
        maxHRC = 58;
        martensitePct = 90;
        crackRisk = hardQuenchMedia === 'water' || hardQuenchMedia === 'brine' ? 65 : 15;
      } else if (hardSteelGrade === '1095') {
        maxHRC = 66;
        martensitePct = 98;
        crackRisk = hardQuenchMedia === 'brine' ? 92 : (hardQuenchMedia === 'water' ? 78 : 22);
      } else if (hardSteelGrade === '4140') {
        maxHRC = 60;
        martensitePct = 95;
        crackRisk = hardQuenchMedia === 'water' ? 70 : 12;
      } else if (hardSteelGrade === 'd2') {
        maxHRC = 64;
        martensitePct = 94;
        crackRisk = hardQuenchMedia !== 'air' ? 85 : 8;
      }

      if (hardQuenchMedia === 'brine') coolingRate = 220;
      else if (hardQuenchMedia === 'water') coolingRate = 140;
      else if (hardQuenchMedia === 'oil') coolingRate = 75;
      else if (hardQuenchMedia === 'air') coolingRate = 18;

      let achievedHRC = maxHRC;
      if (hardFurnaceTemp < 780) {
        achievedHRC = Math.round(maxHRC * 0.5);
        martensitePct = 15;
      }

      setHardeningResult({
        achievedHRC,
        martensitePct,
        coolingRate,
        crackRisk,
        distorted: crackRisk > 50,
        isSuccess: achievedHRC >= 55 && crackRisk < 60
      });

      addXP(150);
      addMissionCompleted();
    }, 1200);
  };

  // Tempering Color Calculation
  const getTemperBladeInfo = (temp) => {
    if (temp <= 210) {
      return { colorName: 'Perak Logam Alami (Belum Oksidasi)', hex: '#e2e8f0', hrc: 65, toughness: 35, tool: 'Kondisi As-Quenched: Sangat getas! Belum aman dipakai.' };
    } else if (temp <= 230) {
      return { colorName: 'Kuning Jerami Muda (Pale Straw 220°C)', hex: '#fef08a', hrc: 64, toughness: 45, tool: 'Pahat Bubut Presisi, Pisau Bedah, Razor Blade' };
    } else if (temp <= 250) {
      return { colorName: 'Cokelat Keemasan (Golden Straw 240°C)', hex: '#fde047', hrc: 61, toughness: 58, tool: 'Mata Bor (Drill Bits), Tap & Snei Ulir, Pisau Frais' };
    } else if (temp <= 270) {
      return { colorName: 'Cokelat Emas (Brown 260°C)', hex: '#f59e0b', hrc: 58, toughness: 72, tool: 'Gunting Plat Logam, Reamer, Pahat Kayu Keras' };
    } else if (temp <= 290) {
      return { colorName: 'Ungu / Cokelat Kemerahan (Purple 280°C)', hex: '#c084fc', hrc: 55, toughness: 88, tool: 'Pahat Dingin (Cold Chisel), Kapak Kayu, Pisau Hunting' };
    } else if (temp <= 310) {
      return { colorName: 'Biru Terang / Merak (Peacock Blue 300°C)', hex: '#38bdf8', hrc: 52, toughness: 105, tool: 'Mata Obeng Ketok, Daun Gergaji Besi, Linggis' };
    } else if (temp <= 340) {
      return { colorName: 'Biru Tua Gelap (Dark Blue 320°C)', hex: '#1e3a8a', hrc: 48, toughness: 125, tool: 'Pegas Daun & Per Spiral Otomotif, Bilah Pedang' };
    } else if (temp <= 480) {
      return { colorName: 'Abu-Abu Kebiruan (Blue-Grey 450°C)', hex: '#475569', hrc: 42, toughness: 145, tool: 'Baut Traksi Tinggi Gardan Truk, Spindel Mesin' };
    } else {
      return { colorName: 'Abu-Abu Oksida Tebal (Grey 550°C+)', hex: '#334155', hrc: 34, toughness: 170, tool: 'Poros As Roda Kendaraan Berat, Batang Torsi' };
    }
  };

  const bladeInfo = getTemperBladeInfo(temperBladeTemp);

  // All-in-One Simulator Logic
  const runHeatTreatSimulation = () => {
    sound.playClick();
    setIsHeatTreatRunning(true);
    setSimResult(null);

    setTimeout(() => {
      setIsHeatTreatRunning(false);
      sound.playSuccess();

      let baseHardness = 20;
      let maxAsQuenchedHRC = 30;
      let crackRisk = 5;
      let microPrimary = 'Ferit & Perlit';
      let toughnessJoule = 85;
      let recommendation = '';

      if (simSteelGrade === '1020') {
        maxAsQuenchedHRC = 35;
        toughnessJoule = 120;
        recommendation = 'Baja Karbon Rendah (0.20% C) TIDAK BISA dikeraskan penuh lewat quench biasa! Perlu proses Case Carburizing untuk membuat kulit keras.';
      } else if (simSteelGrade === '1045') {
        maxAsQuenchedHRC = 58;
        toughnessJoule = 65;
        recommendation = 'Baja Karbon Sedang S45C ideal untuk poros as, baut traksi, dan roda gigi setelah quench oli + temper 300°C.';
      } else if (simSteelGrade === '1095') {
        maxAsQuenchedHRC = 66;
        toughnessJoule = 35;
        recommendation = 'Baja Karbon Tinggi SK5 menghasilkan mata pisau cukur & pahat sangat tajam tahan aus tinggi. Wajib temper teliti!';
      } else if (simSteelGrade === '4140') {
        maxAsQuenchedHRC = 60;
        toughnessJoule = 80;
        recommendation = 'Baja Paduan Chrome-Moly berkekuatan tarik tinggi & ketahanan lelah superior untuk as roda balap & spindel mesin bubut.';
      } else if (simSteelGrade === 'd2') {
        maxAsQuenchedHRC = 64;
        toughnessJoule = 40;
        recommendation = 'Baja Perkakas Khusus High-Carbon High-Chrome untuk pisau potong guillotine shear & die stamping dingin.';
      }

      const reqTemp = simSteelGrade === 'd2' ? 1020 : (simSteelGrade === '1095' ? 790 : 850);
      let effectiveAustenite = false;

      if (simFurnaceTemp >= reqTemp - 30) {
        effectiveAustenite = true;
        microPrimary = 'Austenit Sempurna (FCC)';
      } else if (simFurnaceTemp >= 727) {
        effectiveAustenite = true;
        maxAsQuenchedHRC -= 10;
        microPrimary = 'Austenit Sebagian + Ferit Sisa';
      }

      let quenchCoolingFactor = 1.0;
      if (simQuenchMedia === 'brine') {
        quenchCoolingFactor = 1.05;
        crackRisk += (simSteelGrade === '1095' || simSteelGrade === 'd2') ? 75 : 35;
        if (crackRisk > 60) recommendation = 'PERINGATAN RETAK QUENCH! Quench air garam terlalu ganas untuk baja karbon tinggi/paduan!';
      } else if (simQuenchMedia === 'water') {
        quenchCoolingFactor = 0.95;
        crackRisk += (simSteelGrade === '1095') ? 50 : 20;
      } else if (simQuenchMedia === 'oil') {
        quenchCoolingFactor = 0.90;
        crackRisk = Math.max(5, crackRisk - 20);
      } else if (simQuenchMedia === 'air') {
        quenchCoolingFactor = simSteelGrade === 'd2' ? 0.88 : 0.35;
        crackRisk = 2;
        if (simSteelGrade !== 'd2') microPrimary = 'Perlit Halus (Hasil Normalizing Udara)';
      } else if (simQuenchMedia === 'furnace') {
        quenchCoolingFactor = 0.15;
        crackRisk = 0;
        microPrimary = 'Perlit Kasar Lunak (Full Annealing Sempurna)';
      }

      let asQuenchedHRC = effectiveAustenite ? Math.round(maxAsQuenchedHRC * quenchCoolingFactor) : Math.round(baseHardness);
      let finalHRC = asQuenchedHRC;
      let finalToughness = toughnessJoule;
      let temperColor = 'Tidak Mengalami Tempering';

      if (effectiveAustenite && simQuenchMedia !== 'furnace') {
        if (simTemperTemp <= 220) {
          finalHRC = Math.max(asQuenchedHRC - 2, 20);
          finalToughness = Math.round(toughnessJoule * 0.7);
          temperColor = 'Kuning Jerami (220°C)';
          microPrimary = 'Martensit Temper Sangat Keras (Pisau / Pahat)';
        } else if (simTemperTemp <= 260) {
          finalHRC = Math.max(asQuenchedHRC - 4, 20);
          finalToughness = Math.round(toughnessJoule * 0.85);
          temperColor = 'Cokelat Emas (260°C)';
          microPrimary = 'Martensit Temper Sedang (Mata Bor, Tap)';
        } else if (simTemperTemp <= 300) {
          finalHRC = Math.max(asQuenchedHRC - 7, 20);
          finalToughness = Math.round(toughnessJoule * 1.1);
          temperColor = 'Biru Terang (300°C)';
          microPrimary = 'Martensit Liat (Daun Gergaji, Obeng)';
        } else if (simTemperTemp <= 450) {
          finalHRC = Math.max(asQuenchedHRC - 12, 20);
          finalToughness = Math.round(toughnessJoule * 1.4);
          temperColor = 'Biru Gelap (400°C)';
          microPrimary = 'Troostite / Bainit Lentur (Pegas Spiral)';
        } else {
          finalHRC = Math.max(asQuenchedHRC - 18, 20);
          finalToughness = Math.round(toughnessJoule * 1.8);
          temperColor = 'Abu-Abu Oksida (550°C)';
          microPrimary = 'Sorbit / Perlit Spheroidized (Poros Gandar)';
        }
      }

      setSimResult({
        asQuenchedHRC,
        finalHRC,
        microPrimary,
        finalToughness,
        crackRisk: Math.min(95, Math.max(2, crackRisk)),
        temperColor,
        recommendation
      });

      addXP(100);
      addMissionCompleted();
    }, 1200);
  };

  const getGlowStyle = (temp) => {
    if (temp < 500) return { bg: '#64748b', glow: 'none', label: 'Baja Dingin / Abu-Abu' };
    if (temp < 600) return { bg: '#7f1d1d', glow: '0 0 10px #991b1b', label: 'Merah Redup (550°C)' };
    if (temp < 720) return { bg: '#991b1b', glow: '0 0 15px #dc2626', label: 'Merah Gelap / Darah (650°C)' };
    if (temp < 820) return { bg: '#b91c1c', glow: '0 0 20px #ef4444', label: 'Merah Ceri (780°C - Kritis A1)' };
    if (temp < 920) return { bg: '#dc2626', glow: '0 0 25px #f97316', label: 'Merah Terang Ceri (850°C)' };
    if (temp < 1020) return { bg: '#ea580c', glow: '0 0 30px #fb923c', label: 'Oranye Cerah (950°C)' };
    if (temp < 1150) return { bg: '#eab308', glow: '0 0 35px #fde047', label: 'Kuning Keemasan (1050°C)' };
    return { bg: '#fef08a', glow: '0 0 45px #ffffff', label: 'Putih Menyilaukan (1200°C Forging)' };
  };

  const glowInfo = getGlowStyle(simFurnaceTemp);

  // Quiz Submit
  const handleSelectQuizOption = (quizId, optIndex) => {
    sound.playClick();
    setQuizAnswers(prev => ({ ...prev, [quizId]: optIndex }));
  };

  const submitQuiz = () => {
    sound.playClick();
    let score = 0;
    const feedback = {};

    HEAT_TREATMENT_QUIZ.forEach((q) => {
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

    if (score >= 80) {
      sound.playSuccess();
      addXP(500);
      addMissionCompleted();
    } else {
      sound.playError ? sound.playError() : sound.playClick();
      addXP(score * 2);
    }
  };

  return (
    <div className="heat-treatment-lab-container" style={{
      padding: '20px',
      maxWidth: '1380px',
      margin: '0 auto',
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      color: '#0f172a'
    }}>
      {/* =====================================================================
          HEADER HERO SECTION (VISUAL INFOGRAPHIC BADGES)
      ===================================================================== */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #450a0a 100%)',
        borderRadius: '16px',
        padding: '24px 30px',
        color: '#ffffff',
        marginBottom: '20px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              🔥 METALLURGY VISUAL STUDIO
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>SMK Teknik Pemesinan &amp; TFLM</span>
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 900,
            margin: '0 0 6px 0',
            fontFamily: "'Chakra Petch', 'Segoe UI', sans-serif",
            background: 'linear-gradient(135deg, #ffffff 0%, #fed7aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Studio Visual Heat Treatment &amp; Blackening
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            Pelajari konsep dan langkah kerja perlakuan panas lewat <strong>ilustrasi visual, bagan warna, dan simulator interaktif</strong>.
          </p>
        </div>

        {/* 3 Quick Visual Badges */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8' }}>0.000 mm</div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>Presisi Blackening</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f87171' }}>65 HRC</div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>Kekerasan Martensit</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4ade80' }}>100%</div>
            <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>Machinability Anneal</div>
          </div>
        </div>

        {/* PROMINENT BANNER: BINGUNG? TONTON VIDEO ANIMASI */}
        <div style={{
          width: '100%',
          marginTop: '16px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(220, 38, 38, 0.25) 100%)',
          border: '1px solid rgba(249, 115, 22, 0.5)',
          borderRadius: '12px',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 20px rgba(249, 115, 22, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '2.2rem' }}>🎬</span>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fed7aa' }}>
                📺 Dilengkapi Video Referensi Praktikum Nyata (YouTube)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                Setiap materi (Hardening, Tempering, Annealing, Normalizing, Case Hardening, Blackening) dilengkapi video dokumentasi praktikum asli dan poin kunci observasi!
              </div>
            </div>
          </div>
          <button
            onClick={() => switchTab('hardening')}
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <span>▶ LIHAT MATERI &amp; VIDEO YOUTUBE</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          PETA PANDUAN CEPAT MEMILIH PROSES HEAT TREATMENT (KLIK LANGSUNG MENUJU MATERI)
      ===================================================================== */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '18px 20px',
        marginBottom: '20px',
        border: '1px solid #fed7aa',
        boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🗺️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#9a3412' }}>
                Panduan Kilat: Pilih Proses Heat Treatment Berdasarkan Masalah Bengkel
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Klik salah satu kartu di bawah ini untuk langsung membuka materi &amp; simulator proses tersebut:
              </span>
            </div>
          </div>
          <span style={{ background: '#ffedd5', color: '#c2410c', padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>
            7 MODUL PRAKTIKUM UTAMA
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {[
            {
              id: 'hardening',
              icon: '⚡',
              title: 'Hardening (Pemanasan)',
              need: 'Bikin Keras & Tajam',
              target: 'Pahat bubut, pisau frais, mata bor, pisau cukur (65 HRC)',
              color: '#dc2626',
              bg: '#fef2f2'
            },
            {
              id: 'quenching',
              icon: '💧',
              title: 'Quenching (Media Dingin)',
              need: 'Pendinginan Kilat Martensit',
              target: 'Air Garam (Brine), Air Bersih, Oli Khusus, Udara Tekan',
              color: '#0284c7',
              bg: '#f0f9ff'
            },
            {
              id: 'tempering',
              icon: '🌡️',
              title: 'Tempering (Warna Oksida)',
              need: 'Hilangkan Kerapuhan',
              target: 'Straw Yellow (62 HRC), Bronze (58 HRC), Spring Blue (50 HRC)',
              color: '#ea580c',
              bg: '#fff7ed'
            },
            {
              id: 'annealing',
              icon: '🧘',
              title: 'Full Annealing',
              need: 'Baja Keras Dilunakkan',
              target: 'Baja tempa/las yang mau dibubut empuk di mesin CNC (~12 HRC)',
              color: '#2563eb',
              bg: '#eff6ff'
            },
            {
              id: 'normalizing',
              icon: '🌱',
              title: 'Normalizing',
              need: 'Ratakan Butir Las/Tempa',
              target: 'Rel kereta, poros engkol mesin kapal, pipa tekanan tinggi',
              color: '#16a34a',
              bg: '#f0fdf4'
            },
            {
              id: 'case-hardening',
              icon: '🛡️',
              title: 'Case Hardening',
              need: 'Kulit 62 HRC, Inti Ulet',
              target: 'Roda gigi transmisi truk, pin piston mesin, poros nok cam',
              color: '#9333ea',
              bg: '#faf5ff'
            },
            {
              id: 'blackening',
              icon: '⚗️',
              title: 'Blackening (0.000 mm)',
              need: 'Tahan Karat & Anti-Silau',
              target: 'Ulir baut presisi, senjata api, pelat ragum, mikroskop',
              color: '#475569',
              bg: '#f8fafc'
            }
          ].map((card) => {
            const isSelected = activeTab === card.id;
            return (
              <button
                key={card.id}
                onClick={() => switchTab(card.id)}
                style={{
                  background: isSelected ? card.bg : '#ffffff',
                  border: isSelected ? `2px solid ${card.color}` : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? `0 4px 12px ${card.color}25` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{card.icon}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    background: isSelected ? card.color : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#475569',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {isSelected ? 'SEDANG DIBUKA' : 'KLIK BUKA'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: card.color, marginBottom: '2px' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>
                  🎯 {card.need}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.35 }}>
                  {card.target}
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
          { id: 'hardening', label: '⚡ Hardening', badge: 'Pemanasan' },
          { id: 'quenching', label: '💧 Quenching', badge: 'Media Dingin' },
          { id: 'tempering', label: '🌡️ Tempering', badge: 'Warna Oksida' },
          { id: 'annealing', label: '🧘 Annealing', badge: 'Pelunakan' },
          { id: 'normalizing', label: '🌱 Normalizing', badge: 'Butir Halus' },
          { id: 'case-hardening', label: '🛡️ Case Hardening', badge: 'Kulit Aus' },
          { id: 'blackening', label: '⚗️ Blackening', badge: '0.000 mm' },
          { id: 'simulator', label: '🧪 Simulator Tungku', badge: 'Eksperimen' },
          { id: 'quiz', label: '🏆 Kuis Visual', badge: '+500 XP' }
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
              color: activeTab === tab.id ? '#ea580c' : '#475569',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              borderTop: activeTab === tab.id ? '3px solid #ea580c' : '3px solid transparent',
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
              background: activeTab === tab.id ? '#ffedd5' : '#e2e8f0',
              color: activeTab === tab.id ? '#c2410c' : '#64748b',
              fontWeight: 700
            }}>
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* =====================================================================
          TAB 1: BLACKENING (HOT BLACK OXIDE)
      ===================================================================== */}
      {activeTab === 'blackening' && (
        <div>
          {/* YouTube Video Reference Card */}
          <HeatTreatmentYouTubeCard processId="blackening" />

          {/* Visual Hero Illustration: Before vs After */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/heat_treatment/blackening_before_after.svg" 
              alt="Perbandingan Sebelum vs Sesudah Blackening"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* 4 Concise Visual Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #1d4ed8' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📐 <strong>0.000 mm Presisi</strong></div>
              <div style={{ fontSize: '0.78rem', color: '#334155' }}>Hanya 1–2 mikron ke dalam logam. Ulir baut halus tidak akan macet!</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #15803d' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🕶️ <strong>Anti-Silau (Matte)</strong></div>
              <div style={{ fontSize: '0.78rem', color: '#334155' }}>Warna hitam pekat menyerap cahaya, standar senjata api &amp; mikroskop.</div>
            </div>
            <div style={{ background: '#fef3c7', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #b45309' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🧲 <strong>Kunci Oli Anti-Karat</strong></div>
              <div style={{ fontSize: '0.78rem', color: '#334155' }}>Pori magnetit Fe₃O₄ mengikat oli de-watering pencegah karat ratusan jam.</div>
            </div>
            <div style={{ background: '#fdf2f8', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #be185d' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🛡️ <strong>Bebas Kelupas</strong></div>
              <div style={{ fontSize: '0.78rem', color: '#334155' }}>Bukan lapisan cat, melainkan kristal besi teroksidasi yang menyatu.</div>
            </div>
          </div>

          {/* Monorail 7 Tank Diagram */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 800, color: '#334155' }}>
              📊 Bagan Visual Alur 7 Bak Celup Pabrik:
            </h4>
            <img 
              src="/assets/images/heat_treatment/blackening_tank_diagram.svg" 
              alt="Diagram 7 Bak Blackening"
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </div>

          {/* Concise 7 Step Visual Cards */}
          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              📋 7 Tahap Celup Blackening (Langkah Singkat &amp; Suhu Kerja):
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {BLACKENING_TANKS.map((tank) => (
                <div key={tank.id} style={{
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  borderTop: `3px solid ${tank.step === 5 ? '#dc2626' : (tank.step === 7 ? '#16a34a' : '#0284c7')}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1' }}>BAK #{tank.step}</span>
                    <span style={{ fontSize: '0.68rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{tank.temp}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{tank.icon} {tank.sub}</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>{tank.fungsi}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Dipping Workstation */}
          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  🎮 Simulator Meja Kerja Celup 7-Bak
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Pilih benda kerja lalu klik "JALANKAN ALUR OTOMATIS" untuk melihat proses konversi warna baja
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Spesimen:</span>
                <select
                  value={selectedWorkpiece}
                  onChange={(e) => { sound.playClick(); setSelectedWorkpiece(e.target.value); }}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600, background: '#f8fafc' }}
                >
                  <option value="baut-hex">🔩 Baut Soket Hex Presisi</option>
                  <option value="pisau-frais">⚙️ Pisau Frais HSS</option>
                  <option value="roda-gigi">🏎️ Roda Gigi Mesin</option>
                  <option value="pelat-ragum">📐 Pelat Ragum Presisi</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <button
                onClick={runFullAutoLine}
                disabled={isDipping || autoDippingActive}
                style={{
                  background: (isDipping || autoDippingActive) ? '#94a3b8' : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: (isDipping || autoDippingActive) ? 'not-allowed' : 'pointer'
                }}
              >
                {autoDippingActive ? `🔄 Memproses Bak ${currentTankIndex + 1}...` : '▶️ JALANKAN ALUR OTOMATIS (7 BAK)'}
              </button>

              <button
                onClick={resetBlackening}
                disabled={isDipping || autoDippingActive}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                🔄 Reset
              </button>
            </div>

            {/* Virtual Stage Visualizer */}
            <div style={{
              background: '#0f172a',
              borderRadius: '12px',
              padding: '20px',
              color: '#ffffff',
              position: 'relative',
              minHeight: '220px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              {/* Hoist line */}
              <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', height: '3px', background: '#475569' }}>
                <div style={{
                  position: 'absolute',
                  top: '-7px',
                  left: `${(currentTankIndex / 6) * 92 + 4}%`,
                  width: '24px',
                  height: '18px',
                  background: '#f97316',
                  borderRadius: '4px',
                  transition: 'left 0.6s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem'
                }}>
                  ⚙️
                </div>
              </div>

              {/* Workpiece Body */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '25px auto 10px auto' }}>
                <div style={{ width: '2px', height: isDipping ? '45px' : '15px', background: '#94a3b8', transition: 'height 0.4s' }} />
                <div style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  background: finishedBlackening ? '#020617' : BLACKENING_TANKS[currentTankIndex].warnaBenda,
                  border: isDipping ? '2px dashed #f97316' : '2px solid #ffffff',
                  boxShadow: finishedBlackening ? '0 0 15px rgba(255,255,255,0.2)' : 'none',
                  textAlign: 'center',
                  transition: 'background 0.8s ease'
                }}>
                  <div style={{ fontSize: '1.6rem' }}>
                    {selectedWorkpiece === 'baut-hex' && '🔩'}
                    {selectedWorkpiece === 'pisau-frais' && '⚙️'}
                    {selectedWorkpiece === 'roda-gigi' && '🏎️'}
                    {selectedWorkpiece === 'pelat-ragum' && '📐'}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, marginTop: '4px', color: (finishedBlackening || currentTankIndex >= 4) ? '#ffffff' : '#0f172a' }}>
                    {BLACKENING_TANKS[currentTankIndex].statusBenda}
                  </div>
                  {isDipping && (
                    <div style={{ fontSize: '0.7rem', color: '#f97316', fontWeight: 800, marginTop: '2px' }}>
                      ⏳ Bereaksi di {BLACKENING_TANKS[currentTankIndex].nama} ({dipTimer}s)
                    </div>
                  )}
                </div>
              </div>

              {/* 7 Tanks Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginTop: '10px' }}>
                {BLACKENING_TANKS.map((tank, idx) => {
                  const isCurrent = currentTankIndex === idx;
                  return (
                    <button
                      key={tank.id}
                      onClick={() => startSingleTankDip(idx)}
                      disabled={isDipping || autoDippingActive}
                      style={{
                        background: isCurrent ? (idx === 4 ? '#7f1d1d' : '#0369a1') : '#1e293b',
                        border: isCurrent ? '2px solid #38bdf8' : '1px solid #334155',
                        borderRadius: '6px',
                        padding: '8px 2px',
                        color: '#ffffff',
                        cursor: (isDipping || autoDippingActive) ? 'not-allowed' : 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: isCurrent ? '#facc15' : '#94a3b8' }}>BAK {tank.step}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700 }}>{tank.sub}</div>
                      <div style={{ fontSize: '0.6rem', color: idx === 4 ? '#f87171' : '#38bdf8' }}>{tank.temp}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality Test Result */}
            {finishedBlackening && (
              <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #86efac' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🏆</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#166534' }}>Uji Kualitas Akhir Standar Militer (MIL-DTL-13924):</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => runQualityTest('smear-pass')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #166534', background: '#ffffff', color: '#166534', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    🧻 Smear Test (Usap Tisu)
                  </button>
                  <button onClick={() => runQualityTest('water-break-pass')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #166534', background: '#ffffff', color: '#166534', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    💧 Water Break Free Test
                  </button>
                  <button onClick={() => runQualityTest('salt-pass')} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #166534', background: '#ffffff', color: '#166534', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    🧂 Salt Spray (120 Jam)
                  </button>
                </div>
                {qualityTestResult && (
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>
                    ✅ HASIL UJI LULUS TOTAL: Lapisan Fe₃O₄ kuat menempel pada logam dasar dan mengunci oli anti-karat! (+50 XP)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: HARDENING (PENGURUSAN CEPAT)
      ===================================================================== */}
      {activeTab === 'hardening' && (
        <div>
          {/* YouTube Video Reference Card */}
          <HeatTreatmentYouTubeCard processId="hardening" />

          {/* Visual Hero: 3-Step Flow Diagram */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/heat_treatment/hardening_process_flow.svg" 
              alt="Alur Visual Hardening"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* 3 Quick Visual Takeaway Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #dc2626' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#991b1b', marginBottom: '4px' }}>
                🔒 1. Syarat Karbon (&ge; 0.30% C)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                Baja karbon rendah (AISI 1020) <strong>tidak bisa dikeraskan langsung</strong> karena karbonnya kurang untuk membentuk martensit!
              </div>
            </div>

            <div style={{ background: '#fff7ed', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #ea580c' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#c2410c', marginBottom: '4px' }}>
                ⚡ 2. Transfer Kilat (&lt; 5 Detik)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                Dari tungku ke bak quench harus kurang dari 5 detik agar tidak mendingin dini menjadi perlit lunak.
              </div>
            </div>

            <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #1d4ed8' }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1e40af', marginBottom: '4px' }}>
                ⚠️ 3. Wajib Segera Tempering!
              </div>
              <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                Martensit murni getas seperti kaca dan menyimpan tegangan dalam raksasa. Jangan dibiarkan &gt; 2 jam tanpa temper!
              </div>
            </div>
          </div>

          {/* SOP 6 Langkah Hardening */}
          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              📋 SOP 6 Langkah Hardening di Bengkel:
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {[
                { step: '1', title: 'Pre-Heating', temp: '550°C - 650°C', desc: 'Pemanasan awal perlahan mencegah thermal shock retak.' },
                { step: '2', title: 'Austenitizing', temp: '820°C - 920°C', desc: 'Fasa FCC terbentuk sempurna, atom karbon larut.' },
                { step: '3', title: 'Soaking', temp: '1 Jam / 25 mm', desc: 'Menahan panas agar suhu merata hingga ke inti dalam.' },
                { step: '4', title: 'Transfer Kilat', temp: '< 5 Detik', desc: 'Pindahkan ke bak quench secepat kilat!' },
                { step: '5', title: 'Quench Vertikal', temp: 'Oli 50°C / Air', desc: 'Celup tegak lurus + goyangkan agar uap tidak terjebak.' },
                { step: '6', title: 'Tempering Segera', temp: '< 2 Jam', desc: 'Masukkan ke oven temper sebelum retak tunda.' }
              ].map((s) => (
                <div key={s.step} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #dc2626' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626' }}>TAHAP {s.step}</span>
                    <span style={{ fontSize: '0.68rem', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{s.temp}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{s.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Quench Simulator */}
          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
              🧪 Simulator Tangki Quench Interaktif
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#64748b' }}>
              Atur parameter baja dan media quench untuk melihat apakah baja berhasil keras atau justru meledak retak.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                {/* One-Click Presets */}
                <div style={{ marginBottom: '14px', background: '#fff1f2', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    ⚡ PILIH SKENARIO NYATA BENGKEL (Klik isi otomatis):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                    {[
                      { label: '🔩 Baut S45C (Quench Oli)', grade: '1045', temp: 850, media: 'oil' },
                      { label: '🔪 Pisau SK5 (Quench Air)', grade: '1095', temp: 800, media: 'water' },
                      { label: '🏎️ As Spindel 4140 (Oli)', grade: '4140', temp: 860, media: 'oil' },
                      { label: '💥 Quench Garam (Retak!)', grade: '1095', temp: 880, media: 'brine' }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          sound.playClick();
                          setHardSteelGrade(preset.grade);
                          setHardFurnaceTemp(preset.temp);
                          setHardQuenchMedia(preset.media);
                          setHardeningResult(null);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: (hardSteelGrade === preset.grade && hardFurnaceTemp === preset.temp && hardQuenchMedia === preset.media) ? '2px solid #e11d48' : '1px solid #cbd5e1',
                          background: (hardSteelGrade === preset.grade && hardFurnaceTemp === preset.temp && hardQuenchMedia === preset.media) ? '#ffe4e6' : '#ffffff',
                          color: '#881337',
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

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>1. Pilih Jenis Baja:</label>
                  <select value={hardSteelGrade} onChange={(e) => setHardSteelGrade(e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}>
                    <option value="1020">AISI 1020 - Karbon Rendah (0.20% C)</option>
                    <option value="1045">AISI 1045 - Karbon Sedang (0.45% C)</option>
                    <option value="1095">AISI 1095 - Karbon Tinggi (0.95% C)</option>
                    <option value="4140">AISI 4140 - Paduan Chrome-Moly</option>
                    <option value="d2">AISI D2 - Perkakas Dingin (Air Hardening)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>2. Suhu Tungku:</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#dc2626' }}>{hardFurnaceTemp}°C</span>
                  </div>
                  <input type="range" min="700" max="1050" step="10" value={hardFurnaceTemp} onChange={(e) => setHardFurnaceTemp(Number(e.target.value))} style={{ width: '100%', accentColor: '#dc2626' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>3. Media Pendingin (Quench):</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {[
                      { id: 'brine', label: 'Air Garam (Ganas)' },
                      { id: 'water', label: 'Air Biasa (Cepat)' },
                      { id: 'oil', label: 'Oli Quench (Standar)' },
                      { id: 'air', label: 'Udara (Khusus D2)' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setHardQuenchMedia(m.id)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: hardQuenchMedia === m.id ? '2px solid #dc2626' : '1px solid #cbd5e1',
                          background: hardQuenchMedia === m.id ? '#fee2e2' : '#ffffff',
                          color: hardQuenchMedia === m.id ? '#991b1b' : '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={runHardeningQuench}
                  disabled={isHardeningRunning}
                  style={{
                    width: '100%',
                    background: isHardeningRunning ? '#94a3b8' : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    cursor: isHardeningRunning ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isHardeningRunning ? '⏳ Sedang Dicelup ke Tangki Quench...' : '⚡ CELUPKAN SPESIMEN KE TANGKI QUENCH!'}
                </button>
              </div>

              {/* Result Card */}
              <div>
                {hardeningResult ? (
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Hasil Uji Metalurgi:</span>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: hardeningResult.isSuccess ? '#dcfce7' : '#fee2e2',
                        color: hardeningResult.isSuccess ? '#166534' : '#991b1b'
                      }}>
                        {hardeningResult.isSuccess ? '✅ SUKSES KERAS' : '⚠️ BAHAYA RETAK / GAGAL'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Kekerasan As-Quenched:</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626' }}>{hardeningResult.achievedHRC} HRC</div>
                      </div>
                      <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Fasa Martensit:</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7' }}>{hardeningResult.martensitePct}%</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: hardeningResult.crackRisk > 50 ? '#dc2626' : '#16a34a', marginBottom: '8px' }}>
                      <strong>Risiko Retak Termal:</strong> {hardeningResult.crackRisk}% {hardeningResult.crackRisk > 50 && '(BAHAYA PECAH!)'}
                    </div>
                    <div style={{ background: '#eff6ff', padding: '8px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#1e40af' }}>
                      💡 <strong>Langkah Selanjutnya:</strong> Segera lanjutkan ke tab <strong>Tempering</strong> untuk memulihkan keliatan logam!
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#0f172a', color: '#ffffff', padding: '30px 16px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🔥 ➔ 🧊</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Spesimen Membara Siap Dicelup</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Klik tombol merah untuk mencelupkan baja ke media quench</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB: QUENCHING (PENDINGINAN CEPAT & MEDIA PENDINGIN)
      ===================================================================== */}
      {activeTab === 'quenching' && (
        <div>
          {/* YouTube Video Reference Card */}
          <HeatTreatmentYouTubeCard processId="quenching" />

          {/* Visual Hero: 3 Tahap Pendinginan Quench */}
          <div style={{
            background: '#ffffff',
            padding: '18px 20px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 900, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💧</span> 3 Tahapan Fisika Perpindahan Panas Selama Quenching
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Ketika baja membara 850°C dimasukkan ke dalam cairan pendingin, pelepasan panas terjadi melalui 3 fase termodinamika berturut-turut:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#991b1b', marginBottom: '4px' }}>
                  1. Vapor Blanket Stage (Tahap Selimut Uap)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                  Lapisan uap tipis mengelilingi seluruh permukaan logam panas dan bertindak sebagai isolator panas. Laju pendinginan pada tahap ini relatif lambat. Agitasi cairan sangat penting untuk merusak selimut uap ini secepat mungkin.
                </div>
              </div>

              <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#1e40af', marginBottom: '4px' }}>
                  2. Nucleate Boiling Stage (Tahap Mendidih Cepat)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                  Selimut uap runtuh dan cairan langsung menyentuh logam panas. Terjadi pendidihan hebat dengan gelembung-gelembung uap aktif. Ini adalah tahap dengan <strong>laju pendinginan tercepat</strong> yang menentukan pembentukan Martensit.
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#065f46', marginBottom: '4px' }}>
                  3. Convection Stage (Tahap Konveksi Murni)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                  Suhu permukaan logam telah turun di bawah titik didih cairan quench. Panas dilepaskan melalui konveksi dan konduksi biasa. Laju pendinginan kembali melambat hingga mencapai suhu kamar.
                </div>
              </div>
            </div>
          </div>

          {/* 4 Media Quench Perbandingan Teknis */}
          <div style={{
            background: '#ffffff',
            padding: '18px 20px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>
              📊 Perbandingan 4 Media Quenching Utama di Industri Bengkel Mesin
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0284c7' }}>🧂 Air Garam (Brine 10%)</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0' }}>Laju Pendinginan: <strong>Paling Cepat (~200°C/detik)</strong></div>
                <div style={{ fontSize: '0.75rem', color: '#334155' }}>Kristal garam meledak mikro di permukaan logam, menghancurkan selimut uap seketika. Digunakan untuk baja karbon rendah/sedang. Risiko retak tinggi.</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#2563eb' }}>💧 Air Biasa (Water 20°C)</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0' }}>Laju Pendinginan: <strong>Sangat Cepat (~150°C/detik)</strong></div>
                <div style={{ fontSize: '0.75rem', color: '#334155' }}>Murah dan mudah didapat. Cocok untuk baja karbon sederhana (AISI 1045). Suhu air tidak boleh di atas 30°C agar tidak terbentuk kantung uap stasioner.</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#d97706' }}>🛢️ Oli Quench Khusus (50°C - 60°C)</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0' }}>Laju Pendinginan: <strong>Sedang (~60°C - 90°C/detik)</strong></div>
                <div style={{ fontSize: '0.75rem', color: '#334155' }}>Pilihan standar industri untuk baja perkakas dan paduan (AISI 4140). Mencegah distorsi puntir dan retak karena laju pendinginan di fasa kritis martensit lebih lembut.</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#059669' }}>💨 Udara Tekan / Tenang (Air)</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0' }}>Laju Pendinginan: <strong>Lambat (~5°C - 15°C/detik)</strong></div>
                <div style={{ fontSize: '0.75rem', color: '#334155' }}>Khusus untuk baja perkakas paduan tinggi (*Air Hardening Steels* seperti AISI D2, A2). Mampu mengeras cukup dengan tiupan udara tanpa risiko bengkok sama sekali.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: TEMPERING (PENORMALAN KERAPUHAN)
      ===================================================================== */}
      {activeTab === 'tempering' && (
        <div>
          {/* YouTube Video Reference Card */}
          <HeatTreatmentYouTubeCard processId="tempering" />

          {/* Visual Hero: Tempering Rainbow Blade Infographic */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/heat_treatment/tempering_blade_infographic.svg" 
              alt="Infografis Rambatan Warna Tempering"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* 4 Quick Visual Color Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: '#fef9c3', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ca8a04' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#713f12' }}>🌾 220°C: Kuning Jerami (64 HRC)</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Pahat Bubut, Pisau Bedah, Pisau Cukur</div>
            </div>
            <div style={{ background: '#fef08a', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#713f12' }}>✨ 240°C: Cokelat Emas (61 HRC)</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Mata Bor, Tap &amp; Snei, Pisau Frais</div>
            </div>
            <div style={{ background: '#f3e8ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #9333ea' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#581c87' }}>💜 280°C: Ungu (55 HRC)</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Pahat Dingin, Kapak Kayu, Pisau Dapur</div>
            </div>
            <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0369a1' }}>🌊 300°C: Biru Terang (50 HRC)</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Pegas, Obeng, Bilah Gergaji Besi</div>
            </div>
          </div>

          {/* Interactive Dynamic Blade Slider */}
          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
              🎮 Simulator Bilah Logam &amp; Warna Tempering
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#64748b' }}>
              Geser temperatur untuk melihat warna permukaan bilah logam berubah secara real-time:
            </p>

            {/* Quick Tool Presets */}
            <div style={{ marginBottom: '14px', background: '#fefce8', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fef08a' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                🎯 PILIH ALAT BENGKEL (Suhu Otomatis Menyesuaikan):
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                {[
                  { label: '🌾 Pahat Bubut (220°C)', temp: 220 },
                  { label: '✨ Mata Bor & Tap (240°C)', temp: 240 },
                  { label: '✂️ Gunting Plat (260°C)', temp: 260 },
                  { label: '🌊 Gergaji & Obeng (300°C)', temp: 300 },
                  { label: '🚗 Pegas Spiral (400°C)', temp: 400 }
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      sound.playClick();
                      setTemperBladeTemp(preset.temp);
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: temperBladeTemp === preset.temp ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                      background: temperBladeTemp === preset.temp ? '#fef08a' : '#ffffff',
                      color: '#713f12',
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

            {/* Slider */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Temperatur Tungku Temper:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ea580c', background: '#ffedd5', padding: '2px 10px', borderRadius: '6px' }}>
                  {temperBladeTemp}°C
                </span>
              </div>
              <input
                type="range"
                min="180"
                max="600"
                step="5"
                value={temperBladeTemp}
                onChange={(e) => { sound.playClick(); setTemperBladeTemp(Number(e.target.value)); }}
                style={{ width: '100%', accentColor: '#ea580c' }}
              />
            </div>

            {/* Dynamic Blade Graphic */}
            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#ffffff', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Refleksi Cahaya Oksida Bilah Baja
              </span>
              <div style={{ margin: '14px auto', maxWidth: '420px' }}>
                <svg viewBox="0 0 400 80" width="100%" height="80">
                  <rect x="10" y="25" width="70" height="30" rx="4" fill="#78350f" stroke="#451a03" stroke-width="2" />
                  <rect x="80" y="20" width="10" height="40" rx="2" fill="#cbd5e1" />
                  <path d="M 90,25 L 320,25 Q 380,32 390,55 L 90,55 Z" fill={bladeInfo.hex} stroke="#64748b" stroke-width="1.5" />
                  <line x1="90" y1="55" x2="390" y2="55" stroke="#ffffff" stroke-width="2" />
                </svg>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: bladeInfo.hex }}>{bladeInfo.colorName}</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>🎯 <strong>Paling Cocok Untuk:</strong> {bladeInfo.tool}</div>
            </div>

            {/* Readout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #dc2626' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Kekerasan Rockwell:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626' }}>{bladeInfo.hrc} HRC</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Keuletan (Toughness):</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a' }}>{bladeInfo.toughness} Joule</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: ANNEALING (PELUNAKAN PENUH)
      ===================================================================== */}
      {activeTab === 'annealing' && (
        <div>
          {/* YouTube Video Reference Card */}
          <HeatTreatmentYouTubeCard processId="annealing" />

          {/* Visual Hero: Annealing vs Normalizing Infographic */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/heat_treatment/annealing_cooling_infographic.svg" 
              alt="Infografis Annealing vs Normalizing"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* Microstructure Comparison SVG */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 800, color: '#334155' }}>
              🔬 Struktur Mikro Mikroskop: Perlit Kasar Annealing vs Perlit Halus Normalizing
            </h4>
            <img 
              src="/assets/images/heat_treatment/annealing_vs_normalizing_diagram.svg" 
              alt="Perbandingan Mikroskop Annealing vs Normalizing"
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </div>

          {/* Concise 3 Varian Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0369a1' }}>1. Full Annealing (Pelunakan Penuh)</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Pemanasan 850°C, pendinginan tungku 15°C/jam agar 100% empuk disayat mesin bubut CNC.</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#047857' }}>2. Spheroidizing (Baja Karbon Tinggi)</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Mengubah bilah karbida tajam menjadi bola-bola bulat sferoid agar tidak merusak mata pahat.</div>
            </div>
            <div style={{ background: '#fefce8', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ca8a04' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#854d0e' }}>3. Stress Relief (550°C - 650°C)</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Menghilangkan tegangan sisa pasca pengelasan bejana tekan tebal tanpa mengubah fasa dasar.</div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: NORMALIZING (PENYERAGAMAN BUTIR)
      ===================================================================== */}
      {activeTab === 'normalizing' && (
        <div>
          {/* YouTube Video Reference Card */}
          <HeatTreatmentYouTubeCard processId="normalizing" />

          {/* Visual Hero */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/heat_treatment/annealing_cooling_infographic.svg" 
              alt="Infografis Normalizing"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* Quick Comparison Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#065f46', marginBottom: '4px' }}>
                🌱 Normalizing (Pendinginan Udara)
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', color: '#334155', lineHeight: 1.5 }}>
                <li>Didinginkan di rak udara terbuka tenang</li>
                <li>Butir kristal halus &amp; rapat seragam (ASTM 8)</li>
                <li>Kekuatan tarik (tensile) lebih tinggi dari anneal</li>
                <li>Jauh lebih hemat waktu &amp; biaya tungku</li>
              </ul>
            </div>

            <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0369a1', marginBottom: '4px' }}>
                🧘 Annealing (Pendinginan Tungku)
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', color: '#334155', lineHeight: 1.5 }}>
                <li>Didinginkan di dalam tungku mati tertutup</li>
                <li>Butir perlit kasar lunak</li>
                <li>Kekerasan minimal (sangat empuk dibubut)</li>
                <li>Memakan waktu 12–24 jam di dalam oven</li>
              </ul>
            </div>
          </div>

          {/* Real World Applications */}
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              🚆 Aplikasi Nyata: Mengapa Rel Kereta Api &amp; Crankshaft Kapal Wajib di-Normalize?
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
              Proses tempa panas (*hot forging*) membuat butir kristal menjadi lonjong dan membesar tidak teratur. Normalizing memecah butir kasar tersebut menjadi butir halus seragam sehingga rel kereta api tidak retak lelah saat dilintasi lokomotif berbobot ratusan ton!
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: CASE HARDENING (PENGERASAN KULIT)
      ===================================================================== */}
      {activeTab === 'case-hardening' && (
        <div>
          {/* YouTube Video Reference Card */}
          <HeatTreatmentYouTubeCard processId="case-hardening" />

          {/* Visual Hero 1: Gear Tooth Anatomy SVG */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/heat_treatment/case_hardening_diagram.svg" 
              alt="Diagram Case Hardening Gigi Transmisi"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* Visual Hero 2: Pack Carburizing Box Cutaway */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <img 
              src="/assets/images/heat_treatment/pack_carburizing_box.svg" 
              alt="Ilustrasi Kotak Pack Carburizing"
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
            />
          </div>

          {/* 4 Methods Concise Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #7c3aed' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#6d28d9' }}>1. Pack Carburizing</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Serbuk arang kayu + BaCO₃ di kotak baja kedap udara pada 920°C.</div>
            </div>
            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #0284c7' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0369a1' }}>2. Gas Carburizing</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Gas metana / CO di tungku atmosfer terkontrol untuk produksi massal.</div>
            </div>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #059669' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#047857' }}>3. Gas Nitriding (520°C)</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Gas amonia suhu rendah. TANPA QUENCH = DISTORSI UKURAN 0.000%!</div>
            </div>
            <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #b45309' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#92400e' }}>4. Flame / Induction</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Pengerasan selektif dengan api atau kumparan elektromagnetik lokal.</div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 7: SIMULATOR TUNGKU ALL-IN-ONE
      ===================================================================== */}
      {activeTab === 'simulator' && (
        <div>
          <div style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              🧪 Simulator Eksperimen Termometalurgi Bebas
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#64748b' }}>
              Atur parameter jenis baja, temperatur pemanasan tungku, media quench, dan suhu tempering untuk menganalisis hasil HRC:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {/* Controls */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                {/* One-Click Presets */}
                <div style={{ marginBottom: '14px', background: '#fff7ed', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    ⚡ PILIH SKENARIO EKSPERIMEN OTOMATIS:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                    {[
                      { label: '⚙️ Poros S45C (Quench Oli + Temper 300°C)', grade: '1045', temp: 850, media: 'oil', temper: 300 },
                      { label: '🔪 Pisau SK5 (Quench Air + Temper 200°C)', grade: '1095', temp: 800, media: 'water', temper: 200 },
                      { label: '🧘 Full Annealing (Pelunakan di Oven)', grade: '1045', temp: 850, media: 'furnace', temper: 200 },
                      { label: '🌱 Normalizing (Pendinginan Udara)', grade: '1045', temp: 880, media: 'air', temper: 200 }
                    ].map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          sound.playClick();
                          setSimSteelGrade(preset.grade);
                          setSimFurnaceTemp(preset.temp);
                          setSimQuenchMedia(preset.media);
                          setSimTemperTemp(preset.temper);
                          setSimResult(null);
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#7c2d12',
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

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>1. Spesimen Baja:</label>
                  <select value={simSteelGrade} onChange={(e) => { sound.playClick(); setSimSteelGrade(e.target.value); }} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}>
                    <option value="1020">Baja Karbon Rendah - AISI 1020</option>
                    <option value="1045">Baja Karbon Sedang - AISI 1045 / S45C</option>
                    <option value="1095">Baja Karbon Tinggi - AISI 1095 / SK5</option>
                    <option value="4140">Baja Paduan Chrome-Moly - AISI 4140</option>
                    <option value="d2">Baja Perkakas Dingin - AISI D2</option>
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b' }}>2. Suhu Tungku:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#dc2626' }}>{simFurnaceTemp}°C</span>
                  </div>
                  <input type="range" min="20" max="1200" step="10" value={simFurnaceTemp} onChange={(e) => setSimFurnaceTemp(Number(e.target.value))} style={{ width: '100%', accentColor: '#dc2626' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>3. Media Pendingin:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    {[
                      { id: 'brine', name: 'Air Garam' },
                      { id: 'water', name: 'Air' },
                      { id: 'oil', name: 'Oli' },
                      { id: 'air', name: 'Udara' },
                      { id: 'furnace', name: 'Tungku' }
                    ].map((media) => (
                      <button
                        key={media.id}
                        onClick={() => { sound.playClick(); setSimQuenchMedia(media.id); }}
                        style={{
                          padding: '6px 2px',
                          borderRadius: '6px',
                          border: simQuenchMedia === media.id ? '2px solid #dc2626' : '1px solid #cbd5e1',
                          background: simQuenchMedia === media.id ? '#fee2e2' : '#ffffff',
                          color: simQuenchMedia === media.id ? '#991b1b' : '#334155',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {media.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b' }}>4. Suhu Tempering:</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ea580c' }}>{simTemperTemp}°C</span>
                  </div>
                  <input type="range" min="150" max="600" step="10" value={simTemperTemp} onChange={(e) => setSimTemperTemp(Number(e.target.value))} style={{ width: '100%', accentColor: '#ea580c' }} />
                </div>

                <button
                  onClick={runHeatTreatSimulation}
                  disabled={isHeatTreatRunning}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isHeatTreatRunning ? '#94a3b8' : 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    cursor: isHeatTreatRunning ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isHeatTreatRunning ? '🔥 Mereaksikan Logam...' : '⚡ JALANKAN PROSES'}
                </button>
              </div>

              {/* Visual Glow Display & Result */}
              <div>
                <div style={{ background: '#0f172a', borderRadius: '10px', padding: '16px', textAlign: 'center', color: '#ffffff', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Pijar Visual Baja Membara</span>
                  <div style={{ width: '80px', height: '80px', margin: '10px auto', borderRadius: '10px', background: glowInfo.bg, boxShadow: glowInfo.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    🔥
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>{glowInfo.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Fasa: {simFurnaceTemp >= 727 ? 'AUSTENIT (FCC)' : 'FERIT + PERLIT (BCC)'}</div>
                </div>

                {simResult && (
                  <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ background: '#fef2f2', padding: '8px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#991b1b', fontWeight: 700 }}>Pasca-Quench</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#dc2626' }}>{simResult.asQuenchedHRC} HRC</div>
                      </div>
                      <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>Pasca-Temper</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16a34a' }}>{simResult.finalHRC} HRC</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '4px' }}>🔬 <strong>Fasa:</strong> {simResult.microPrimary}</div>
                    <div style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '6px' }}>🛡️ <strong>Keuletan:</strong> {simResult.finalToughness} Joule</div>
                    <div style={{ background: '#eff6ff', padding: '6px 8px', borderRadius: '6px', fontSize: '0.72rem', color: '#1e40af' }}>
                      💡 {simResult.recommendation}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Temperature Colors Chart SVG */}
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 800, color: '#334155' }}>
              🎨 Skala Visual Warna Pijar Baja &amp; Suhu (°C):
            </h4>
            <img 
              src="/assets/images/heat_treatment/steel_color_temperature_chart.svg" 
              alt="Skala Warna Pijar Baja"
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 8: KUIS VISUAL (+500 XP)
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
                🏆 Kuis Studi Kasus Praktis Heat Treatment
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Selesaikan 5 problem nyata bengkel mesin dan dapatkan +500 XP
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
            {HEAT_TREATMENT_QUIZ.map((q, idx) => (
              <div key={q.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ background: '#ea580c', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 900, fontSize: '0.78rem' }}>
                    #{idx + 1}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.45 }}>{q.pertanyaan}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '30px' }}>
                  {q.pilihan.map((pil, pIdx) => {
                    const isSelected = quizAnswers[q.id] === pIdx;
                    let optBg = isSelected ? '#fed7aa' : '#ffffff';
                    let optBorder = isSelected ? '2px solid #ea580c' : '1px solid #cbd5e1';

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

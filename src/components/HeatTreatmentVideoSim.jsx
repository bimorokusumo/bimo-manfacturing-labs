import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import HeatTreatment3D_Engine from './HeatTreatment3D_Engine';
import HeatTreatmentRealDocumentary from './HeatTreatmentRealDocumentary';

// =============================================================================
// DATABASE 6 MODUL VIDEO SIMULASI ANIMASI HEAT TREATMENT (MASING-MASING SENDIRI)
// =============================================================================
const VIDEO_MODULES = [
  {
    id: 'hardening',
    title: '1. Hardening (Pengerasan Quench)',
    subtitle: 'Pemanasan 850°C & Pendinginan Kilat Membentuk Martensit Keras 65 HRC',
    icon: '⚡',
    duration: 44,
    color: '#dc2626',
    chapters: [
      { start: 0, end: 10, title: '1. Baja Mentah S45C (25°C, 20 HRC)', stage: 'raw' },
      { start: 10, end: 22, title: '2. Pemanasan Tungku 850°C (Austenit)', stage: 'heat' },
      { start: 22, end: 34, title: '3. Quenching Kejut Oli (850°C ➔ 50°C)', stage: 'quench' },
      { start: 34, end: 44, title: '4. Martensit Jarum (Keras 65 HRC, Getas!)', stage: 'martensite' }
    ]
  },
  {
    id: 'tempering',
    title: '2. Tempering (Penormalan & Pelepasan Getas)',
    subtitle: 'Pemanasan Ulang 150°C - 450°C Menghilangkan Kerapuhan & Spektrum Warna Oksida',
    icon: '🌡️',
    duration: 46,
    color: '#f59e0b',
    chapters: [
      { start: 0, end: 10, title: '1. Martensit Getas Pasca Quenching', stage: 'brittle' },
      { start: 10, end: 22, title: '2. Pemanasan 220°C: Warna Kuning Jerami', stage: 'straw' },
      { start: 22, end: 34, title: '3. Spektrum Warna: Cokelat s/d Biru Gelap', stage: 'spectrum' },
      { start: 34, end: 46, title: '4. Martensit Temper (Keras 58 HRC & Liat)', stage: 'result' }
    ]
  },
  {
    id: 'annealing',
    title: '3. Full Annealing (Pelunakan Total)',
    subtitle: 'Pendinginan Super Lambat 24 Jam di Tungku Tertutup untuk Kemudahan Mesin Bubut',
    icon: '🧘',
    duration: 42,
    color: '#0284c7',
    chapters: [
      { start: 0, end: 10, title: '1. Masalah Baja Keras Pasca Tempa / Las', stage: 'problem' },
      { start: 10, end: 20, title: '2. Pemanasan & Soaking 850°C di Tungku', stage: 'soaking' },
      { start: 20, end: 32, title: '3. Pendinginan Super Lambat (24 Jam di Tungku)', stage: 'furnace-cool' },
      { start: 32, end: 42, title: '4. Hasil: Perlit Kasar Super Empuk (12 HRC)', stage: 'soft' }
    ]
  },
  {
    id: 'normalizing',
    title: '4. Normalizing (Penyeragaman Butir Kristal)',
    subtitle: 'Pemanasan 900°C & Pendinginan Udara Terbuka Menghasilkan Butir Halus & Bebas Tegangan',
    icon: '🌱',
    duration: 40,
    color: '#16a34a',
    chapters: [
      { start: 0, end: 10, title: '1. Butir Kristal Kasar Hasil Tempa / Cor', stage: 'coarse' },
      { start: 10, end: 20, title: '2. Pemanasan Tinggi 900°C di Tungku', stage: 'heat900' },
      { start: 20, end: 30, title: '3. Dikeluarkan ke Udara Terbuka Kamar', stage: 'air-cool' },
      { start: 30, end: 40, title: '4. Hasil: Butir Halus Seragam & Kuat (28 HRC)', stage: 'fine-grain' }
    ]
  },
  {
    id: 'case-hardening',
    title: '5. Case Hardening (Karburisasi Kulit Luar)',
    subtitle: 'Difusi Karbon 1 mm: Kulit Keras 62 HRC, Inti Tetap Ulet 22 HRC Menahan Torsi',
    icon: '🛡️',
    duration: 42,
    color: '#ea580c',
    chapters: [
      { start: 0, end: 10, title: '1. Kebutuhan Khusus Roda Gigi Transmisi', stage: 'gear-need' },
      { start: 10, end: 20, title: '2. Pemanasan Kotak Serbuk Karbon 920°C', stage: 'carburize-box' },
      { start: 20, end: 30, title: '3. Difusi Atom Karbon ke Kulit Luar 1 mm', stage: 'diffusion' },
      { start: 30, end: 42, title: '4. Hasil: Kulit 62 HRC Tahan Aus, Inti 22 HRC Ulet', stage: 'gear-result' }
    ]
  },
  {
    id: 'blackening',
    title: '6. Blackening (Hot Black Oxide 7 Bak)',
    subtitle: 'Lapisan Magnetit Fe₃O₄ Anti-Karat Presisi 0.000 mm Tanpa Mengubah Ukuran',
    icon: '⚗️',
    duration: 56,
    color: '#475569',
    chapters: [
      { start: 0, end: 8, title: 'Bak 1: Alkaline Degreaser (Bersih Minyak)', stage: 'b1' },
      { start: 8, end: 16, title: 'Bak 2: Bilas Air Dingin 1', stage: 'b2' },
      { start: 16, end: 24, title: 'Bak 3: Acid Pickling HCl (Kikis Karat)', stage: 'b3' },
      { start: 24, end: 32, title: 'Bak 4: Bilas Air Dingin 2', stage: 'b4' },
      { start: 32, end: 42, title: 'Bak 5: Garam Hitam Mendidih 142°C (Fe₃O₄)', stage: 'b5' },
      { start: 42, end: 48, title: 'Bak 6: Bilas Air Dingin 3', stage: 'b6' },
      { start: 48, end: 56, title: 'Bak 7: De-watering Oil Seal Anti-Karat', stage: 'b7' }
    ]
  }
];

const HeatTreatmentVideoSim = ({ initialVideoId = 'hardening', onSelectQuiz, onCompleteMission }) => {
  const [activeVideoId, setActiveVideoId] = useState(initialVideoId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicePitch, setVoicePitch] = useState(0.82); // Nada bariton pria mantap
  const [viewMode, setViewMode] = useState('3d'); // '3d' | 'real-video' | 'micrograph' | '2d-diagram'

  const activeVideo = VIDEO_MODULES.find(v => v.id === activeVideoId) || VIDEO_MODULES[0];
  const timerRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const lastSpokenChapter = useRef(null);
  const prevTimeRef = useRef(0);

  // Sync if initialVideoId changes
  useEffect(() => {
    if (initialVideoId && initialVideoId !== activeVideoId) {
      switchVideo(initialVideoId);
    }
  }, [initialVideoId]);

  // Audio Sound Effect Synced with Stages (Quench Hiss & Metal Clank)
  useEffect(() => {
    const prev = prevTimeRef.current;
    prevTimeRef.current = currentTime;

    if (isPlaying) {
      if (activeVideoId === 'hardening' || activeVideoId === 'case-hardening') {
        const qTime = activeVideoId === 'hardening' ? 22 : 30;
        if (prev < qTime && currentTime >= qTime) {
          sound.playQuenchHiss();
        }
      }
      if (prev < 10 && currentTime >= 10) {
        sound.playMetalClank();
      }
    }
  }, [currentTime, activeVideoId, isPlaying]);

  // ===========================================================================
  // SCRIPT PENJELASAN LISAN SUARA LAKI-LAKI (INSTRUKTUR BENGKEL BAHASA INDONESIA)
  // ===========================================================================
  const getSpokenScript = (videoId, chapIdx) => {
    if (videoId === 'hardening') {
      switch (chapIdx) {
        case 0:
          return 'Tahap pertama, kondisi baja mentah sebelum perlakuan panas. Baja karbon seperti S 45 C berstruktur ferit dan perlit yang empuk, kekerasannya hanya sekitar 20 H R C. Baja ini mudah dibubut, namun jika dibuat menjadi mata pisau atau pahat, dia akan sangat cepat tumpul dan aus.';
        case 1:
          return 'Tahap kedua, pemanasan austenitisasi di dalam tungku. Pintu tungku dibuka, benda kerja dimasukkan dan dipanaskan hingga 850 derajat Celsius. Melewati batas kritis 727 derajat Celsius, seluruh atom karbon larut sempurna ke dalam kisi kristal besi membentuk fasa austenit. Benda kerja kini membara merah terang berpijar oranye.';
        case 2:
          return 'Tahap ketiga, pendinginan kejut atau quenching. Benda kerja membara langsung dicelupkan secara kilat ke dalam bak oli pendingin dalam waktu tiga detik! Atom-atom karbon terkunci paksa dan tidak sempat keluar, membentuk martensit jarum yang luar biasa keras, mencapai 65 H R C. Namun perhatian: baja sekarang sangat getas seperti kaca! Jika dipukul palu pada tahap ini, baja akan langsung pecah berantakan.';
        case 3:
        default:
          return 'Tahap keempat, terbentuk struktur martensit sejati dengan kekerasan puncak 65 H R C. Ingat baik-baik: jangan langsung memakai benda kerja ini sebelum melalui proses tempering, karena tegangan sisa di dalamnya sangat tinggi dan mudah retak.';
      }
    } else if (videoId === 'tempering') {
      switch (chapIdx) {
        case 0:
          return 'Tahap pertama, martensit getas pasca quenching. Baja sangat keras 65 H R C namun getas seperti kaca. Benda kerja wajib dipanaskan kembali pada suhu rendah untuk membuang kerapuhan dan menurunkan tegangan sisa.';
        case 1:
          return 'Tahap kedua, pemanasan ulang 220 derajat Celsius. Permukaan baja yang dipoles perlahan membentuk lapisan oksida tipis berwarna kuning jerami terang atau straw yellow. Kerapuhan mulai berkurang sementara ketajaman tetap terjaga pada 60 H R C, sangat cocok untuk pisau serut dan pahat bubut.';
        case 2:
          return 'Tahap ketiga, spektrum warna oksida tempa. Jika suhu dinaikkan ke 260 derajat Celsius warna berubah menjadi cokelat emas untuk mata bor. Di suhu 300 derajat Celsius berubah menjadi biru terang untuk bilah gergaji dan obeng. Dan di 400 derajat Celsius menjadi biru gelap untuk pegas spiral yang lentur.';
        case 3:
        default:
          return 'Tahap keempat, hasil akhir martensit temper. Di suhu 250 derajat Celsius, kita mendapatkan kekerasan ideal 58 H R C. Baja kini memiliki keuletan tinggi, tahan aus, tajam, dan tidak akan patah saat terkena hentakan benturan!';
      }
    } else if (videoId === 'annealing') {
      switch (chapIdx) {
        case 0:
          return 'Tahap pertama, masalah baja keras pasca penempaan atau pengelasan. Benda kerja memiliki kekerasan yang tidak merata dan tegangan sisa yang tinggi, sehingga sangat keras dan susah disayat oleh pisau bubut maupun mata frais.';
        case 1:
          return 'Tahap kedua, pemanasan austenit dan soaking time. Benda kerja dipanaskan di dalam tungku tertutup hingga suhu 850 derajat Celsius, lalu ditahan beberapa jam agar panas meresap sempurna hingga ke inti poros.';
        case 2:
          return 'Tahap ketiga, pendinginan super lambat di dalam tungku tertutup. Pemanas tungku dimatikan, namun pintu tungku DILARANG DIBUKA! Benda dibiarkan mendingin bersama tungku selama 24 jam dengan laju hanya 10 sampai 20 derajat Celsius per jam.';
        case 3:
        default:
          return 'Tahap keempat, hasil akhir full annealing. Atom besi dan karbon memiliki waktu leluasa untuk membentuk kristal perlit kasar. Kekerasan turun drastis ke 12 H R C. Baja kini 100% empuk, bebas tegangan, dan sangat mudah dibubut di mesin CNC.';
      }
    } else if (videoId === 'normalizing') {
      switch (chapIdx) {
        case 0:
          return 'Tahap pertama, butiran kristal kasar akibat proses penuangan cor atau tempaan panas. Struktur kristal tidak seragam dan memiliki tegangan dalam yang bisa memicu retak saat menerima beban dinamis.';
        case 1:
          return 'Tahap kedua, pemanasan normalizing pada 900 derajat Celsius. Suhu ini sekitar 50 derajat lebih tinggi dari suhu hardening, untuk memastikan butiran kristal lama larut total menjadi austenit yang homogen.';
        case 2:
          return 'Tahap ketiga, pendinginan di udara kamar terbuka. Pintu tungku dibuka, benda membara diangkat dan diletakkan di atas rak pendingin berlubang ditiup sirkulasi udara kamar. Laju pendinginan sedang, sekitar satu jam.';
        case 3:
        default:
          return 'Tahap keempat, hasil akhir normalizing. Terbentuk struktur kristal ferit dan perlit yang sangat halus dan seragam. Kekerasan sekitar 28 H R C. Baja menjadi kuat, tangguh, dan sangat tahan terhadap beban getaran seperti rel kereta api dan poros engkol kapal.';
      }
    } else if (videoId === 'case-hardening') {
      switch (chapIdx) {
        case 0:
          return 'Tahap pertama, kebutuhan khusus komponen mesin seperti roda gigi transmisi truk dan pin piston. Bagian permukaan gigi butuh sangat keras tahan gesek, sedangkan bagian poros dalamnya harus ulet meredam hentakan torsi mendadak.';
        case 1:
          return 'Tahap kedua, pemanasan dalam kotak karburisasi. Benda berbahan baja karbon rendah dimasukkan ke dalam kotak berisi serbuk arang karbon aktif, lalu dipanaskan di tungku pada suhu 920 derajat Celsius.';
        case 2:
          return 'Tahap ketiga, difusi atom karbon ke permukaan. Pada suhu 920 derajat, atom-atom karbon meresap masuk menembus kulit luar baja sedalam satu milimeter, menciptakan lapisan kulit berkadar karbon tinggi.';
        case 3:
        default:
          return 'Tahap keempat, pendinginan quench dan hasil penampang melintang. Setelah dicelupkan ke air, kulit luar berkadar karbon tinggi mengeras menjadi martensit 62 H R C, sedangkan inti dalamnya tetap berkadar karbon rendah 22 H R C yang lentur menyerap benturan torsi tanpa patah!';
      }
    } else {
      // blackening
      switch (chapIdx) {
        case 0:
          return 'Bak pertama, degreasing alkali panas 80 derajat Celsius. Membersihkan sisa minyak pemotongan dan oli dromus agar permukaan baja bersih sempurna dan reaksi kimia tidak belang.';
        case 1:
          return 'Bak kedua, pembilasan air dingin mengalir tahap pertama untuk membersihkan sisa sabun alkali.';
        case 2:
          return 'Bak ketiga, acid pickling dengan asam klorida 15 persen. Mengikis karat tipis dan membuka pori-pori mikro kristal baja.';
        case 3:
          return 'Bak keempat, pembilasan air dingin tahap kedua agar residu asam tidak terbawa ke bak garam panas.';
        case 4:
          return 'Bak kelima, inti konversi blackening. Bak garam mendidih pada suhu 142 derajat Celsius. Atom besi bereaksi menjadi magnetit Fe 3 O 4. Warna baut berubah menjadi hitam pekat doff yang elegan, tanpa menambah ketebalan ukuran sama sekali, nol koma nol nol nol milimeter!';
        case 5:
          return 'Bak keenam, pembilasan air dingin tahap ketiga untuk membersihkan sisa garam kaustik dari celah ulir baut.';
        case 6:
        default:
          return 'Bak ketujuh, pencelupan oli pelindung de-watering. Minyak meresap ke dalam pori magnetit mengusir air. Hasil akhirnya, baut berwarna hitam mewah dan tahan karat selama ratusan jam!';
      }
    }
  };

  // ===========================================================================
  // SPEECH SYNTHESIS ENGINE (MALE VOICE BARITONE)
  // ===========================================================================
  const speakMaleNarration = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.pitch = voicePitch; // 0.82 nada bariton pria mantap
    utterance.rate = 0.95; // Kecepatan artikulasi tenang
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => 
      (v.lang === 'id-ID' || v.lang.startsWith('id')) && 
      (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('pria') || v.name.toLowerCase().includes('ardi') || v.name.toLowerCase().includes('siri 1'))
    );
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id'));
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('david') || 
        v.name.toLowerCase().includes('george') || 
        v.name.toLowerCase().includes('daniel')
      );
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', e);
      }
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopMaleNarration = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Listen for voiceschanged
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const handleVoices = () => { window.speechSynthesis.getVoices(); };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoices);
      };
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMaleNarration();
    };
  }, []);

  // Determine current chapter
  const currentChapterIndex = activeVideo.chapters.findIndex(
    ch => currentTime >= ch.start && currentTime < ch.end
  );
  const safeChapterIndex = currentChapterIndex === -1 ? activeVideo.chapters.length - 1 : currentChapterIndex;
  const currentChapter = activeVideo.chapters[safeChapterIndex];

  // Trigger speech when chapter changes
  useEffect(() => {
    if (isPlaying && narrationEnabled) {
      const chapterKey = `${activeVideoId}-${safeChapterIndex}`;
      if (lastSpokenChapter.current !== chapterKey) {
        lastSpokenChapter.current = chapterKey;
        const script = getSpokenScript(activeVideoId, safeChapterIndex);
        speakMaleNarration(script);
      }
    } else if (!isPlaying) {
      stopMaleNarration();
    }
  }, [safeChapterIndex, isPlaying, narrationEnabled, activeVideoId]);

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.25 * playbackSpeed;
          if (next >= activeVideo.duration) {
            return activeVideo.duration;
          }
          return next;
        });
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, activeVideo.duration]);

  // Handle Video Completion
  useEffect(() => {
    if (currentTime >= activeVideo.duration && isPlaying) {
      setIsPlaying(false);
      sound.playSuccess();
      if (onCompleteMission) {
        setTimeout(() => onCompleteMission(), 100);
      }
    }
  }, [currentTime, activeVideo.duration, isPlaying, onCompleteMission]);

  // Handle Video Switch
  const switchVideo = (videoId) => {
    sound.playClick();
    stopMaleNarration();
    setActiveVideoId(videoId);
    setCurrentTime(0);
    setIsPlaying(true);
    lastSpokenChapter.current = null;
  };

  // Jump to specific Chapter
  const jumpToChapter = (chapIndex) => {
    sound.playClick();
    stopMaleNarration();
    const chap = activeVideo.chapters[chapIndex];
    if (chap) {
      setCurrentTime(chap.start);
      setIsPlaying(true);
      if (narrationEnabled) {
        lastSpokenChapter.current = `${activeVideoId}-${chapIndex}`;
        const script = getSpokenScript(activeVideoId, chapIndex);
        speakMaleNarration(script);
      }
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    sound.playClick();
    if (currentTime >= activeVideo.duration) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Reset video
  const resetVideo = () => {
    sound.playClick();
    setIsPlaying(false);
    setCurrentTime(0);
    stopMaleNarration();
    lastSpokenChapter.current = null;
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ===========================================================================
  // LIVE COMPUTATION FOR EACH OF THE 6 INDIVIDUAL VIDEO SIMULATIONS
  // ===========================================================================
  const getLiveScenarioData = () => {
    const t = currentTime;

    // 1. HARDENING
    if (activeVideoId === 'hardening') {
      if (t <= 10) {
        return {
          temp: 25,
          phase: 'Ferit + Perlit (Lunak)',
          hrc: 20,
          color: '#94a3b8',
          glow: 'none',
          steam: false,
          bubbles: false,
          inFurnace: false,
          inQuench: false,
          badge: 'Baja Mentah (25°C)',
          subtitles: '1. Kondisi awal: Baja karbon S45C berstruktur ferit-perlit yang lunak (~20 HRC). Mudah dibubut namun cepat tumpul jika dipakai memotong.',
          tips: 'Baja mentah memiliki keuletan tinggi namun belum tahan aus.'
        };
      } else if (t <= 22) {
        const prog = (t - 10) / 12;
        const temp = Math.round(25 + prog * 825);
        return {
          temp,
          phase: temp >= 727 ? 'Austenit (Karbon Larut Sempurna)' : 'Transisi Pemanasan',
          hrc: 20,
          color: `rgb(${Math.min(255, 150 + Math.round(prog * 105))}, ${Math.round(prog * 110)}, 30)`,
          glow: `0 0 ${Math.round(prog * 45)}px #f97316`,
          steam: false,
          bubbles: false,
          inFurnace: true,
          inQuench: false,
          badge: `Tungku Membara: ${temp}°C`,
          subtitles: '2. Pemanasan 850°C: Pintu tungku terbuka, baja dipanaskan melewati suhu kritis 727°C (garis A1). Seluruh atom karbon larut membentuk Austenit.',
          tips: 'Pemanasan harus merata sampai ke inti benda kerja (soaking time).'
        };
      } else if (t <= 34) {
        const qProg = (t - 22) / 12;
        const temp = qProg < 0.3 ? Math.round(850 - (qProg / 0.3) * 780) : 50;
        return {
          temp,
          phase: 'Martensit Jarum (65 HRC - SUPER KERAS & GETAS)',
          hrc: 65,
          color: qProg < 0.25 ? '#ef4444' : '#1e293b',
          glow: qProg < 0.25 ? '0 0 20px #ef4444' : 'none',
          steam: qProg < 0.6,
          bubbles: qProg < 0.7,
          inFurnace: false,
          inQuench: true,
          badge: `Quench Cepat Oli: ${temp}°C ➔ 65 HRC!`,
          subtitles: '3. Quenching Kejut: Baja membara dicemplungkan ke bak oli dalam 3 detik! Atom karbon terkunci paksa membentuk Martensit Jarum (65 HRC). PERINGATAN: Baja sangat getas seperti kaca!',
          tips: 'Peringatan keras: Jangan memukul baja setelah quench karena bisa langsung pecah berkeping-keping!'
        };
      } else {
        return {
          temp: 35,
          phase: 'Martensit Getas (Tegangan Sisa Tinggi)',
          hrc: 65,
          color: '#1e293b',
          glow: 'none',
          steam: false,
          bubbles: false,
          inFurnace: false,
          inQuench: false,
          badge: 'Martensit 65 HRC (Wajib Segera di-Temper)',
          subtitles: '4. Hasil Hardening: Martensit 65 HRC memiliki daya tahan aus puncak namun penuh tegangan sisa. Wajib segera di-temper sebelum digunakan!',
          tips: 'Peralihan dari quench ke oven temper harus dilakukan sesegera mungkin untuk mencegah retak spontan.'
        };
      }
    }

    // 2. TEMPERING
    if (activeVideoId === 'tempering') {
      if (t <= 10) {
        return {
          temp: 50,
          phase: 'Martensit Getas (Sebelum Temper)',
          hrc: 65,
          color: '#334155',
          glow: 'none',
          badge: 'Martensit Getas (65 HRC)',
          subtitles: '1. Martensit hasil quench sangat getas. Jika langsung dipakai memotong, pahat akan langsung pecah berkeping-keping. Proses tempering wajib dilakukan.',
          tips: 'Permukaan bilah baja dipoles mengkilap agar perubahan warna oksida terlihat jelas.'
        };
      } else if (t <= 22) {
        return {
          temp: 220,
          phase: 'Martensit Temper (Straw Yellow)',
          hrc: 62,
          color: '#fef08a', // Kuning jerami pucat
          glow: '0 0 15px rgba(254, 240, 138, 0.5)',
          badge: '220°C: Kuning Jerami (Straw)',
          subtitles: '2. Pemanasan 220°C (Kuning Jerami Terang): Kerapuhan mulai berkurang, kekerasan 62 HRC, sangat ideal untuk pisau serut kayu dan pahat bubut.',
          tips: 'Warna kuning jerami adalah standar emas untuk alat potong presisi.'
        };
      } else if (t <= 34) {
        const p = (t - 22) / 12;
        const temp = Math.round(260 + p * 140);
        const col = p < 0.5 ? '#d97706' : '#2563eb'; // Cokelat emas ➔ Biru
        return {
          temp,
          phase: p < 0.5 ? 'Martensit Temper (Cokelat Emas)' : 'Troostite / Bainit (Biru)',
          hrc: Math.round(60 - p * 8),
          color: col,
          glow: '0 0 20px rgba(37, 99, 235, 0.4)',
          badge: `${temp}°C: ${p < 0.5 ? 'Cokelat Emas (Mata Bor)' : 'Biru (Gergaji & Pegas)'}`,
          subtitles: '3. Spektrum Warna: 260°C cokelat emas (mata bor & tap), 300°C biru terang (bilah gergaji & obeng), 400°C biru gelap (pegas lentur).',
          tips: 'Makin tinggi suhu temper, baja makin ulet dan liat, tetapi kekerasan sedikit menurun.'
        };
      } else {
        return {
          temp: 250,
          phase: 'Martensit Temper Sempurna',
          hrc: 58,
          color: '#b45309',
          glow: '0 0 15px #f59e0b',
          badge: 'Martensit Temper (58 HRC - Keras & Liat)',
          subtitles: '4. Hasil Akhir: Martensit Temper 58 HRC memiliki perpaduan ketajaman pisau dan keuletan tinggi. Tahan aus dan tidak mudah patah saat terkena benturan!',
          tips: 'Pisau atau pahat kini siap pakai dan memiliki umur pakai maksimal.'
        };
      }
    }

    // 3. ANNEALING
    if (activeVideoId === 'annealing') {
      if (t <= 10) {
        return {
          temp: 25,
          phase: 'Baja Keras / Tegang Pasca Tempa',
          hrc: 45,
          color: '#64748b',
          badge: 'Baja Keras Tegang (Susah Dibubut)',
          subtitles: '1. Masalah: Benda kerja pasca penempaan atau pengelasan memiliki tegangan sisa tinggi dan sangat keras sehingga pisau mesin bubut cepat aus dan rontok.',
          tips: 'Baja harus dilunakkan total (full annealing) agar machinability mencapai 100%.'
        };
      } else if (t <= 20) {
        return {
          temp: 850,
          phase: 'Austenit Homogen di Tungku',
          hrc: 40,
          color: '#ea580c',
          glow: '0 0 30px #ea580c',
          badge: 'Tungku 850°C (Soaking Time)',
          subtitles: '2. Pemanasan 850°C di dalam tungku muffle tertutup dan ditahan (soaking) agar panas merata ke seluruh penampang poros.',
          tips: 'Waktu penahanan sekitar 1 jam per 25 mm ketebalan benda kerja.'
        };
      } else if (t <= 32) {
        const p = (t - 20) / 12;
        const temp = Math.round(850 - p * 450);
        return {
          temp,
          phase: 'Pendinginan Tungku Tertutup (10-20°C/Jam)',
          hrc: Math.round(40 - p * 25),
          color: '#475569',
          badge: `Dingin Super Lambat: ${temp}°C (Pintu Tertutup)`,
          subtitles: '3. Pendinginan Super Lambat: Pemanas tungku dimatikan, pintu DILARANG DIBUKA! Benda dibiarkan dingin bersama tungku selama 24 jam.',
          tips: 'Pendinginan lambat memberi waktu atom besi dan karbon kembali ke posisi seimbang membentuk perlit kasar.'
        };
      } else {
        return {
          temp: 30,
          phase: 'Perlit Kasar Lunak (100% Machinable)',
          hrc: 12,
          color: '#94a3b8',
          badge: 'Hasil: Super Lunak (12 HRC) - Siap Bubut',
          subtitles: '4. Hasil Full Annealing: Terbentuk Perlit Kasar yang sangat lunak (12 HRC). Bebas tegangan 100% dan sangat empuk disayat mesin bubut CNC!',
          tips: 'Baja kini dapat dibubut dengan kecepatan potong maksimal dan tatal yang teratur.'
        };
      }
    }

    // 4. NORMALIZING
    if (activeVideoId === 'normalizing') {
      if (t <= 10) {
        return {
          temp: 25,
          phase: 'Butiran Kristal Kasar Tidak Seragam',
          hrc: 22,
          color: '#64748b',
          badge: 'Butir Kasar Akibat Tempa/Cor',
          subtitles: '1. Kondisi Awal: Butiran kristal baja hasil tempa atau cor tidak seragam dan memiliki tegangan dalam yang bisa memicu retak saat menerima beban dinamis.',
          tips: 'Normalizing bertujuan menyeragamkan dan menghaluskan ukuran butir kristal.'
        };
      } else if (t <= 20) {
        return {
          temp: 900,
          phase: 'Austenitisasi Tinggi (900°C)',
          hrc: 22,
          color: '#f97316',
          glow: '0 0 35px #f97316',
          badge: 'Tungku 900°C (Diatas Garis A3)',
          subtitles: '2. Pemanasan 900°C: Suhu diatur sekitar 50°C di atas suhu hardening untuk memastikan butiran kristal lama larut total menjadi austenit seragam.',
          tips: 'Suhu yang lebih tinggi diperlukan agar rekristalisasi butir terjadi secara sempurna.'
        };
      } else if (t <= 30) {
        const p = (t - 20) / 10;
        const temp = Math.round(900 - p * 750);
        return {
          temp,
          phase: 'Pendinginan Udara Terbuka Kamar',
          hrc: Math.round(22 + p * 6),
          color: p < 0.4 ? '#ef4444' : '#475569',
          badge: `Angin Terbuka: ${temp}°C (Laju Sedang)`,
          subtitles: '3. Pendinginan Udara: Benda diangkat keluar dari tungku dan diletakkan di atas rak terbuka ditiup sirkulasi udara kamar (pendinginan laju sedang ~1 jam).',
          tips: 'Pendinginan udara lebih cepat dari annealing tetapi jauh lebih lambat dari quenching.'
        };
      } else {
        return {
          temp: 28,
          phase: 'Perlit Halus Seragam & Tangguh',
          hrc: 28,
          color: '#64748b',
          badge: 'Hasil: Butir Halus Tangguh (28 HRC)',
          subtitles: '4. Hasil Normalizing: Terbentuk struktur butiran kristal ferit dan perlit yang sangat halus dan seragam (28 HRC). Kuat dan tahan getaran dinamis!',
          tips: 'Sangat cocok untuk komponen struktural berat seperti rel kereta api dan poros engkol kapal.'
        };
      }
    }

    // 5. CASE HARDENING
    if (activeVideoId === 'case-hardening') {
      if (t <= 10) {
        return {
          temp: 25,
          phase: 'Baja Karbon Rendah (St 37 / AISI 1020)',
          hrc: 20,
          color: '#64748b',
          badge: 'Baja Karbon Rendah Ulet (20 HRC)',
          subtitles: '1. Masalah Roda Gigi: Gigi transmisi butuh permukaan keras tahan aus, namun inti poros harus tetap ulet untuk meredam hentakan torsi mesin.',
          tips: 'Baja karbon rendah tidak bisa dikeraskan langsung dengan quench biasa karena kadar karbonnya kurang (<0.3% C).'
        };
      } else if (t <= 20) {
        return {
          temp: 920,
          phase: 'Pemanasan Dalam Kotak Karbon 920°C',
          hrc: 20,
          color: '#ea580c',
          glow: '0 0 25px #ea580c',
          badge: 'Kotak Serbuk Karburisasi 920°C',
          subtitles: '2. Benda dimasukkan ke dalam kotak berisi serbuk arang karbon aktif, lalu dipanaskan di tungku 920°C selama beberapa jam.',
          tips: 'Karbon aktif melepaskan gas CO yang siap bereaksi dengan permukaan besi.'
        };
      } else if (t <= 30) {
        return {
          temp: 920,
          phase: 'Difusi Atom Karbon Menembus 1 mm',
          hrc: 25,
          color: '#f97316',
          glow: '0 0 30px #f97316',
          badge: 'Difusi Karbon Sedalam 1.0 mm (Case)',
          subtitles: '3. Difusi Karbon: Atom karbon meresap masuk menembus kulit luar baja sedalam 1 mm, menciptakan lapisan kulit berkadar karbon tinggi.',
          tips: 'Kedalaman penetrasi karbon (case depth) diatur oleh lamanya waktu pemanasan.'
        };
      } else {
        return {
          temp: 30,
          phase: 'Kulit Martensit 62 HRC + Inti Ulet 22 HRC',
          hrc: 62,
          color: '#f59e0b',
          badge: 'Hasil: Kulit Keras 62 HRC, Inti 22 HRC Ulet',
          subtitles: '4. Hasil Case Hardening: Setelah di-quench, kulit luar mengeras menjadi Martensit 62 HRC tahan gesek, sedangkan inti dalam tetap 22 HRC ulet menyerap getaran torsi!',
          tips: 'Kombinasi ideal untuk roda gigi transmisi, pin piston, dan poros cam mesin.'
        };
      }
    }

    // 6. BLACKENING
    const tankIdx = Math.min(6, Math.floor(t / 8));
    const tankTime = t % 8;
    const isDown = tankTime > 1.5 && tankTime < 6.5;
    const tanksInfo = [
      { name: 'Bak 1: Alkaline Degreaser (80°C)', color: '#94a3b8', sub: 'Oli pemotongan & gemuk dromus larut tuntas oleh sabun alkali panas' },
      { name: 'Bak 2: Bilas Air Dingin Mengalir 1', color: '#cbd5e1', sub: 'Membilas sabun alkali agar tidak menetralkan asam pickling' },
      { name: 'Bak 3: Acid Pickling HCl (Etsa Karat)', color: '#e2e8f0', sub: 'Asam klorida mengikis karat tipis & membuka pori kristal' },
      { name: 'Bak 4: Bilas Air Dingin Mengalir 2', color: '#cbd5e1', sub: 'Menetralkan asam sebelum masuk ke bak garam mendidih' },
      { name: 'Bak 5: Hot Blackening Salt 142°C (Fe₃O₄)', color: '#18181b', sub: 'Atom besi bereaksi menjadi magnetit Fe₃O₄ hitam pekat 0.000 mm!' },
      { name: 'Bak 6: Bilas Air Dingin Mengalir 3', color: '#09090b', sub: 'Membersihkan sisa garam kaustik dari celah ulir baut' },
      { name: 'Bak 7: De-watering Oil Seal Anti-Karat', color: '#020617', sub: 'Oli menyegel pori magnetit: hitam berkilau & tahan karat ratusan jam!' }
    ];
    return {
      tankIdx,
      tankData: tanksInfo[tankIdx],
      isDipped: isDown,
      badge: `Bak ${tankIdx + 1}/7: ${tanksInfo[tankIdx].name}`,
      subtitles: `${tanksInfo[tankIdx].name}: ${tanksInfo[tankIdx].sub}. Benda kerja presisi tetap 0.000 mm (tidak ada penambahan tebal seperti cat)!`,
      tips: 'Keunggulan utama: ulir baut presisi tidak macet dan warna doff menyerap pantulan cahaya.'
    };
  };

  const currentProps = getLiveScenarioData();

  return (
    <div style={{
      background: '#040914',
      border: '1px solid #1e293b',
      borderRadius: '16px',
      overflow: 'hidden',
      color: '#ffffff',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '24px'
    }}>
      
      {/* =====================================================================
          HEADER & 6 DEDICATED PROCESS TABS (SENDIRI-SENDIRI)
      ===================================================================== */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid #1e293b',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${activeVideo.color} 0%, #0f172a 100%)`,
              border: `1px solid ${activeVideo.color}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '1.4rem',
              boxShadow: `0 0 15px ${activeVideo.color}40`
            }}>
              {activeVideo.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.5px' }}>
                  {activeVideo.title.toUpperCase()}
                </span>
                <span style={{
                  background: activeVideo.color,
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.65rem',
                  fontWeight: 900
                }}>
                  VIDEO MANDIRI
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {activeVideo.subtitle}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Pilih video simulasi mandiri di bawah ini:
          </div>
        </div>

        {/* 6 Dedicated Video Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
          {VIDEO_MODULES.map(v => {
            const isSel = v.id === activeVideoId;
            return (
              <button
                key={v.id}
                onClick={() => switchVideo(v.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: isSel ? `2px solid ${v.color}` : '1px solid #334155',
                  background: isSel ? `${v.color}25` : 'rgba(255,255,255,0.03)',
                  color: isSel ? '#ffffff' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  boxShadow: isSel ? `0 0 14px ${v.color}35` : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{v.icon}</span>
                <div>
                  <div style={{ color: isSel ? v.color : '#cbd5e1', fontSize: '0.82rem', fontWeight: 900 }}>
                    {v.title.split('(')[0].replace(/^\d+\.\s*/, '')}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    {v.duration} dtk &bull; Suara Pria
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          VIEW MODE SELECTOR BAR (REALISTIC 3D / REAL VIDEO / MICROGRAPH)
      ===================================================================== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '10px 20px',
        background: 'rgba(2, 6, 23, 0.98)',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.5px' }}>
            PILIH TAMPILAN REALISTIS:
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            (Sinematik 3D bengkel dengan mouse 360°, video dokumentasi riil industri, atau mikroskop fasa 500x)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { sound.playClick(); setViewMode('3d'); }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: viewMode === '3d' ? '2px solid #38bdf8' : '1px solid #334155',
              background: viewMode === '3d' ? '#0369a1' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewMode === '3d' ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'
            }}
          >
            <span>🎮</span> 3D Bengkel Sinematik (WebGL)
          </button>

          <button
            onClick={() => { sound.playClick(); setViewMode('real-video'); }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: viewMode === 'real-video' ? '2px solid #ef4444' : '1px solid #334155',
              background: viewMode === 'real-video' ? '#991b1b' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewMode === 'real-video' ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none'
            }}
          >
            <span>📹</span> Video Nyata Industri
          </button>

          <button
            onClick={() => { sound.playClick(); setViewMode('micrograph'); }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: viewMode === 'micrograph' ? '2px solid #10b981' : '1px solid #334155',
              background: viewMode === 'micrograph' ? '#065f46' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewMode === 'micrograph' ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            <span>🔬</span> Mikroskop Riil (500x)
          </button>

          <button
            onClick={() => { sound.playClick(); setViewMode('2d-diagram'); }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: viewMode === '2d-diagram' ? '2px solid #a855f7' : '1px solid #334155',
              background: viewMode === '2d-diagram' ? '#6b21a8' : 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewMode === '2d-diagram' ? '0 0 12px rgba(168, 85, 247, 0.4)' : 'none'
            }}
          >
            <span>📊</span> Diagram Alir
          </button>
        </div>
      </div>

      {/* =====================================================================
          MAIN 16:9 SIMULATION VIDEO SCREEN (VISUAL STAGE)
      ===================================================================== */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '460px',
        background: '#020617',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8)'
      }}>
        
        {/* Atmosphere Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(30, 41, 59, 0.4) 0%, #020617 80%)',
          pointerEvents: 'none'
        }} />

        {/* TOP HUD OVERLAYS */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Chapter Badge */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '6px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isPlaying ? '#10b981' : '#f59e0b',
                boxShadow: isPlaying ? '0 0 8px #10b981' : 'none'
              }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                {currentChapter ? currentChapter.title : 'Tahap Simulasi'}
              </span>
            </div>

            {/* Speaking Male Voice Badge */}
            {isSpeaking && (
              <div style={{
                background: 'rgba(2, 132, 199, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #38bdf8',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 14px rgba(56, 189, 248, 0.5)'
              }}>
                <span style={{ fontSize: '0.9rem' }}>🎙️</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff' }}>
                  Suara Pria Sedang Berbicara...
                </span>
                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                  <span style={{ width: '2px', height: '10px', background: '#ffffff', borderRadius: '1px' }} />
                  <span style={{ width: '2px', height: '14px', background: '#ffffff', borderRadius: '1px' }} />
                  <span style={{ width: '2px', height: '8px', background: '#ffffff', borderRadius: '1px' }} />
                </div>
              </div>
            )}
          </div>

          {/* Right Status Badge */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '6px 16px',
            borderRadius: '8px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>STATUS PARAMETER</div>
            <div style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 900, color: activeVideo.color }}>
              {currentProps.temp ? `🌡️ ${currentProps.temp}°C` : '⚗️ REAKSI KIMIA'} &bull; <span style={{ color: '#38bdf8' }}>{currentProps.hrc ? `${currentProps.hrc} HRC` : '0.000 mm'}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600 }}>
              {currentProps.phase || currentProps.badge}
            </div>
          </div>
        </div>

        {/* ===================================================================
            VIEW MODES: 3D ENGINE / REAL DOCUMENTARY / 2D DIAGRAM
        =================================================================== */}

        {/* 1. 3D BENGKEL SINEMATIK (THREE.JS WEBGL) */}
        {viewMode === '3d' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
            <HeatTreatment3D_Engine
              processId={activeVideoId}
              currentTime={currentTime}
              duration={activeVideo.duration}
              temp={currentProps.temp}
              hrc={currentProps.hrc}
              phase={currentProps.phase}
              isPlaying={isPlaying}
            />
          </div>
        )}

        {/* 2. VIDEO DOKUMENTASI INDUSTRI RIIL & MIKROSKOP METALOGRAFI */}
        {(viewMode === 'real-video' || viewMode === 'micrograph') && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
            <HeatTreatmentRealDocumentary
              processId={activeVideoId}
              viewMode={viewMode}
              currentTime={currentTime}
              duration={activeVideo.duration}
              temp={currentProps.temp}
              hrc={currentProps.hrc}
              phase={currentProps.phase}
              isPlaying={isPlaying}
            />
          </div>
        )}

        {/* 3. DIAGRAM SKEMATIS 2D */}
        {viewMode === '2d-diagram' && (
          <>
            {/* 1. HARDENING VISUAL */}
            {activeVideoId === 'hardening' && (
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Furnace Left */}
            <div style={{
              position: 'absolute', left: '15%', bottom: '90px', width: '170px', height: '190px',
              background: '#1e293b', border: '4px solid #475569', borderRadius: '16px 16px 4px 4px',
              boxShadow: currentProps.inFurnace ? '0 0 50px rgba(249, 115, 22, 0.6)' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>TUNGKU OVEN 850°C</div>
              <div style={{
                width: '130px', height: '120px',
                background: currentProps.inFurnace ? 'radial-gradient(circle, #fef08a 0%, #ea580c 60%, #7c2d12 100%)' : '#0f172a',
                borderRadius: '8px', border: '2px solid #334155', display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}>
                {currentProps.inFurnace && <span style={{ fontSize: '2.4rem' }}>🔥</span>}
              </div>
            </div>

            {/* Quench Tank Right */}
            <div style={{
              position: 'absolute', right: '15%', bottom: '50px', width: '200px', height: '160px',
              background: '#0f172a', border: '3px solid #334155', borderRadius: '8px', overflow: 'hidden'
            }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.9)', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textAlign: 'center' }}>
                BAK QUENCH (OLI PENDINGIN)
              </div>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.3) 0%, rgba(3, 105, 161, 0.8) 100%)', position: 'relative' }}>
                {currentProps.bubbles && (
                  <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', fontSize: '1.4rem', animation: 'bounce 0.4s infinite' }}>
                    🫧🫧🫧
                  </div>
                )}
              </div>
            </div>

            {/* Workpiece with Tong */}
            <div style={{
              position: 'absolute',
              left: currentProps.inFurnace ? '22%' : (currentProps.inQuench ? '76%' : '50%'),
              bottom: currentProps.inQuench ? '75px' : '150px',
              transform: 'translateX(-50%)',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20
            }}>
              <div style={{ width: '6px', height: '90px', background: '#64748b', borderRadius: '3px' }} />
              <div style={{
                width: '32px', height: '110px', background: currentProps.color, borderRadius: '6px 6px 16px 2px',
                boxShadow: currentProps.glow, border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ffffff' }}>{currentProps.hrc}HRC</span>
                {currentProps.steam && <span style={{ position: 'absolute', top: '-30px', fontSize: '1.5rem' }}>💨</span>}
              </div>
              <div style={{ background: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, marginTop: '6px', whiteSpace: 'nowrap' }}>
                {currentProps.badge}
              </div>
            </div>
          </div>
        )}

        {/* 2. TEMPERING VISUAL */}
        {activeVideoId === 'tempering' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>
              OVEN TEMPERING SUHU RENDAH: PERUBAHAN WARNA OKSIDA PELANGI
            </div>
            {/* Polished Blade undergoing Temper Color Spectrum */}
            <div style={{
              width: '320px', height: '70px', background: currentProps.color,
              borderRadius: '8px 40px 10px 8px', border: '3px solid #ffffff',
              boxShadow: currentProps.glow, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 24px', transition: 'all 0.6s', position: 'relative'
            }}>
              <span style={{ fontSize: '1.4rem' }}>🔪</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{currentProps.hrc} HRC</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e293b' }}>{currentProps.phase}</div>
              </div>
            </div>

            {/* Temper Color Palette Guide */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { label: '220°C Kuning Jerami', c: '#fef08a' },
                { label: '260°C Cokelat Emas', c: '#d97706' },
                { label: '300°C Biru Terang', c: '#2563eb' },
                { label: '400°C Biru Gelap', c: '#1e3a8a' }
              ].map((pal, i) => (
                <div key={i} style={{ background: '#0f172a', padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: pal.c }} />
                  <span style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>{pal.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. ANNEALING VISUAL */}
        {activeVideoId === 'annealing' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Furnace with Closed Door & 24H Clock */}
            <div style={{
              width: '260px', height: '240px', background: '#1e293b', border: '5px solid #475569',
              borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: currentProps.glow, position: 'relative'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', marginBottom: '8px' }}>
                TUNGKU ANNEALING (TERKUNCI RAPAT)
              </div>
              <div style={{
                width: '180px', height: '120px', background: currentProps.temp > 500 ? 'radial-gradient(circle, #f97316 0%, #7c2d12 100%)' : '#0f172a',
                borderRadius: '8px', border: '2px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '6px'
              }}>
                <span style={{ fontSize: '2rem' }}>🔒</span>
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700 }}>
                  {currentTime > 20 ? '⏱️ Dingin Lambat 24 Jam...' : 'Pemanasan 850°C'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#4ade80', marginTop: '10px' }}>
                {currentProps.badge}
              </div>
            </div>
          </div>
        )}

        {/* 4. NORMALIZING VISUAL */}
        {activeVideoId === 'normalizing' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px' }}>
            {/* Furnace 900C */}
            <div style={{ width: '170px', height: '200px', background: '#1e293b', border: '4px solid #475569', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8' }}>TUNGKU 900°C</div>
              <div style={{ width: '120px', height: '120px', background: currentTime <= 20 ? 'radial-gradient(circle, #fb923c 0%, #9a3412 100%)' : '#0f172a', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {currentTime <= 20 && <span style={{ fontSize: '2rem' }}>🔥</span>}
              </div>
            </div>

            {/* Open Air Cooling Rack */}
            <div style={{ width: '220px', height: '200px', background: 'rgba(15, 23, 42, 0.7)', border: '2px dashed #16a34a', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>💨</span>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4ade80' }}>RAK UDARA TERBUKA KAMAR</div>
              <div style={{ width: '80px', height: '40px', background: currentProps.color, borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 900, fontSize: '0.75rem', color: '#fff' }}>
                {currentProps.hrc} HRC
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Sirkulasi Angin Laju Sedang (~1 Jam)</div>
            </div>
          </div>
        )}

        {/* 5. CASE HARDENING VISUAL */}
        {activeVideoId === 'case-hardening' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
            {/* Gear Cross-Section */}
            <div style={{
              width: '180px', height: '180px', borderRadius: '50%', background: '#0f172a',
              border: currentTime > 20 ? '8px solid #ea580c' : '8px solid #475569',
              boxShadow: currentTime > 20 ? '0 0 30px #ea580c' : 'none',
              display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', transition: 'all 0.5s'
            }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%', background: '#334155',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#cbd5e1'
              }}>
                <span style={{ fontSize: '1.8rem' }}>⚙️</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>INTI POROS</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#4ade80' }}>22 HRC (ULET)</span>
              </div>
              {currentTime > 20 && (
                <div style={{ position: 'absolute', top: '-14px', background: '#ea580c', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>
                  KULIT LUAR 1 mm: 62 HRC (TAHAN AUS)
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', textAlign: 'center', maxWidth: '480px' }}>
              Kotak Karburisasi Serbuk Karbon 920°C: Atom karbon meresap masuk 1 mm, menghasilkan kulit luar tahan aus dan inti tetap elastis menahan torsi.
            </div>
          </div>
        )}

        {/* 6. BLACKENING VISUAL */}
        {activeVideoId === 'blackening' && (
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px 40px' }}>
            {/* Hoist Rail Top */}
            <div style={{ position: 'absolute', top: '70px', left: '40px', right: '40px', height: '12px', background: '#334155', borderRadius: '6px' }}>
              <div style={{
                position: 'absolute', left: `${(currentProps.tankIdx / 6) * 94}%`, top: '-8px',
                width: '36px', height: '28px', background: '#f97316', borderRadius: '6px', boxShadow: '0 0 10px #f97316', transition: 'left 0.8s ease-in-out'
              }} />
            </div>

            {/* Hoist Cable & Basket */}
            <div style={{
              position: 'absolute', left: `calc(40px + ${(currentProps.tankIdx / 6) * 94}% - 14px)`, top: '82px',
              height: currentProps.isDipped ? '210px' : '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 20
            }}>
              <div style={{ width: '3px', flex: 1, background: '#cbd5e1' }} />
              <div style={{
                width: '46px', height: '42px', background: currentProps.tankData.color, border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'background 0.5s'
              }}>
                🔩
              </div>
            </div>

            {/* 7 Tanks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', width: '100%', height: '140px', zIndex: 10 }}>
              {[
                { label: 'Bak 1: Degrease', liquid: '#0284c7', icon: '🧼' },
                { label: 'Bak 2: Rinse 1', liquid: '#38bdf8', icon: '💧' },
                { label: 'Bak 3: Acid Pickling', liquid: '#10b981', icon: '🧪' },
                { label: 'Bak 4: Rinse 2', liquid: '#38bdf8', icon: '💧' },
                { label: 'Bak 5: Hot Salt 142°C', liquid: '#0f172a', icon: '⚗️', special: true },
                { label: 'Bak 6: Rinse 3', liquid: '#38bdf8', icon: '💧' },
                { label: 'Bak 7: Oil Seal', liquid: '#d97706', icon: '🛡️' }
              ].map((tank, idx) => {
                const isActive = currentProps.tankIdx === idx;
                return (
                  <div key={idx} style={{
                    background: '#1e293b', border: isActive ? '2px solid #38bdf8' : '1px solid #334155', borderRadius: '8px 8px 0 0',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: isActive ? '0 0 15px rgba(56, 189, 248, 0.4)' : 'none'
                  }}>
                    <div style={{ padding: '4px', fontSize: '0.62rem', fontWeight: 800, textAlign: 'center', background: isActive ? '#0284c7' : '#0f172a', color: '#fff', whiteSpace: 'nowrap' }}>
                      {tank.icon} {idx + 1}
                    </div>
                    <div style={{ flex: 1, background: tank.liquid, opacity: 0.8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {tank.special && isActive && <span style={{ fontSize: '1rem', animation: 'bounce 0.6s infinite' }}>🫧</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
          </>
        )}

      </div>

      {/* =====================================================================
          VIDEO TIMELINE SCRUBBER & CHAPTER PILLS
      ===================================================================== */}
      <div style={{ background: '#0f172a', padding: '10px 20px 6px 20px', borderTop: '1px solid #1e293b' }}>
        <input
          type="range"
          min="0"
          max={activeVideo.duration}
          step="0.1"
          value={currentTime}
          onChange={(e) => setCurrentTime(Number(e.target.value))}
          style={{ width: '100%', accentColor: activeVideo.color, cursor: 'pointer' }}
        />

        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', overflowX: 'auto' }}>
          {activeVideo.chapters.map((chap, idx) => {
            const isChapActive = currentTime >= chap.start && currentTime < chap.end;
            return (
              <button
                key={idx}
                onClick={() => jumpToChapter(idx)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: isChapActive ? `1px solid ${activeVideo.color}` : '1px solid #334155',
                  background: isChapActive ? `${activeVideo.color}30` : 'rgba(255,255,255,0.03)',
                  color: isChapActive ? '#ffffff' : '#94a3b8',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {chap.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          CONTROLS TOOLBAR (PLAY, TIME, SPEED, MALE VOICE TOGGLE)
      ===================================================================== */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderTop: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={togglePlay}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: isPlaying ? '#ef4444' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isPlaying ? '0 0 12px rgba(239, 68, 68, 0.4)' : '0 0 12px rgba(16, 185, 129, 0.4)'
            }}
          >
            <span>{isPlaying ? '⏸ JEDA VIDEO' : '▶ PUTAR VIDEO'}</span>
          </button>

          <button
            onClick={resetVideo}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: 'transparent',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⏮ Ulang
          </button>

          <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#94a3b8' }}>
            <strong style={{ color: '#f8fafc' }}>{formatTime(currentTime)}</strong> / {formatTime(activeVideo.duration)}
          </div>
        </div>

        {/* Speed & Male Voice Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Kecepatan:</span>
            {[0.75, 1, 1.5, 2].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                style={{
                  padding: '3px 7px',
                  borderRadius: '4px',
                  border: playbackSpeed === speed ? '1px solid #38bdf8' : '1px solid #334155',
                  background: playbackSpeed === speed ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: playbackSpeed === speed ? '#38bdf8' : '#64748b',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              sound.playClick();
              const nextState = !narrationEnabled;
              setNarrationEnabled(nextState);
              if (!nextState) {
                stopMaleNarration();
              } else if (isPlaying) {
                const script = getSpokenScript(activeVideoId, safeChapterIndex);
                speakMaleNarration(script);
              }
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: narrationEnabled ? '1px solid #10b981' : '1px solid #334155',
              background: narrationEnabled ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: narrationEnabled ? '#34d399' : '#64748b',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Aktifkan atau Matikan Narasi Suara Laki-Laki Otomatis"
          >
            <span>🎙️</span>
            <span>{narrationEnabled ? 'Suara Pria: AKTIF' : 'Suara Pria: MATI'}</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          DYNAMIC SUBTITLE & WORKSHOP INSIGHT BOX (WITH MALE VOICE NARRATION)
      ===================================================================== */}
      <div style={{
        background: '#040914',
        borderTop: '1px solid #1e293b',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>👨‍🏫</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                PENJELASAN INSTRUKTUR BENGKEL ({activeVideo.title.toUpperCase()}):
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Narasi suara pria bariton bahasa Indonesia otomatis menyala setiap adegan berganti
              </div>
            </div>
          </div>

          {/* Button Play/Stop Male Voice */}
          <button
            onClick={() => {
              sound.playClick();
              if (isSpeaking) {
                stopMaleNarration();
              } else {
                const script = getSpokenScript(activeVideoId, safeChapterIndex);
                speakMaleNarration(script);
              }
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: isSpeaking ? '1px solid #ef4444' : '1px solid #38bdf8',
              background: isSpeaking ? 'rgba(239, 68, 68, 0.25)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isSpeaking ? '0 0 14px rgba(239, 68, 68, 0.4)' : '0 0 12px rgba(56, 189, 248, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <span>{isSpeaking ? '⏹ HENTIKAN SUARA PRIA' : '🔊 DENGARKAN SUARA PRIA (LAKI-LAKI)'}</span>
          </button>
        </div>

        {/* Live Audio Equalizer Wave when speaking */}
        {isSpeaking && (
          <div style={{
            background: 'rgba(2, 132, 199, 0.15)',
            border: '1px solid #0284c7',
            borderRadius: '8px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#38bdf8'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎙️</span>
              <strong>Instruktur Pria Sedang Berbicara (Nada Bariton Mantap)...</strong>
            </div>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <span style={{ width: '3px', height: '14px', background: '#38bdf8', borderRadius: '2px', animation: 'pulse 0.4s infinite' }} />
              <span style={{ width: '3px', height: '8px', background: '#38bdf8', borderRadius: '2px', animation: 'pulse 0.6s infinite' }} />
              <span style={{ width: '3px', height: '18px', background: '#38bdf8', borderRadius: '2px', animation: 'pulse 0.3s infinite' }} />
              <span style={{ width: '3px', height: '12px', background: '#38bdf8', borderRadius: '2px', animation: 'pulse 0.5s infinite' }} />
              <span style={{ width: '3px', height: '16px', background: '#38bdf8', borderRadius: '2px', animation: 'pulse 0.4s infinite' }} />
            </div>
          </div>
        )}

        <div style={{
          fontSize: '0.88rem',
          lineHeight: 1.6,
          color: '#f8fafc',
          background: 'rgba(30, 41, 59, 0.5)',
          padding: '14px 18px',
          borderRadius: '8px',
          borderLeft: `4px solid ${activeVideo.color}`
        }}>
          {currentProps.subtitles}
        </div>

        {/* Action Button to try out Quiz */}
        {onSelectQuiz && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              onClick={() => { sound.playClick(); onSelectQuiz(); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Sudah paham? Uji kemampuan lewat Kuis Visual ➔</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default HeatTreatmentVideoSim;

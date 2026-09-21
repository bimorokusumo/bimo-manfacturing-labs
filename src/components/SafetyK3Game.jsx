import React, { useState, useMemo } from 'react';
import { sound } from '../utils/audio';
import Safety3DOperator from './Safety3DOperator';
import { recordQuizResult } from '../services/sheetService';
import K3LHEmergencyModule from './K3LHEmergencyModule';
import Budaya5REthicsModule from './Budaya5REthicsModule';
import BenchToolsModule from './BenchToolsModule';
import JSABenchProjectModule from './JSABenchProjectModule';

// =============================================================================
// DATABASE PEKERJAAN BENGKEL MESIN & MATRIKS BAHAYA K3
// =============================================================================
const JOBS = [
  {
    id: 'konvensional',
    name: 'Mesin Konvensional (Bubut & Frais)',
    icon: '⚙️',
    description: 'Pekerjaan pemesinan kontak langsung dengan benda kerja. Bahaya utama: Terbelit putaran spindel chuck (1200 RPM), serpihan tatal/gram panas 250°C, dan percikan pendingin.',
    mandatory: ['kacamata_safety', 'wearpack', 'shoes'],
    optional: ['earmuff', 'hairnet'],
    forbidden: ['gloves', 'gloves_kain', 'sandal', 'topeng_las', 'apron', 'sleeves', 'headphone', 'jam_tangan', 'cincin', 'dasi', 'topi_biasa', 'kacamata_hitam', 'kaos_longgar', 'smartphone'],
    forbiddenReasons: {
      gloves_kain: '🚨 BAHAYA MAUT (ENTANGLEMENT)! Serat benang rajut sangat mudah tersangkut permukaan kasar benda berputar, menarik telapak tangan langsung ke dalam putaran chuck 1200 RPM hingga jari/tangan terputus!',
      gloves: '🚨 SANGAT DILARANG! Sarung tangan kulit dapat tersangkut pada tatal spiral atau putaran spindel mesin bubut/frais dan menyeret tangan ke putaran mesin.',
      dasi: '☠️ BAHAYA KEMATIAN SEKETIKA! Ujung dasi atau kalung yang menjuntai akan langsung tergulung lead screw atau chuck bubut, mencekik leher operator dalam hitungan 0.2 detik!',
      kaos_longgar: '🚨 BAHAYA FATAL! Baju kedodoran atau lengan baju yang melambai sangat rentan terbelit poros mesin bubut yang sedang berputar kencang.',
      jam_tangan: '⚠️ Perhiasan logam dan jam tangan berisiko tersangkut celah ragum, gigi pencekam chuck, atau alur tatal berputar.',
      cincin: '⚠️ Risiko Degloving (kulit dan daging jari terkoyak lepas hingga tulang) jika cincin tersangkut pahat atau benda kerja berputar.',
      sandal: '🚨 Kaki telanjang akan langsung melepuh tersiram tatal gram membara 250°C dan hancur tertimpa chuck/kunci bubut yang jatuh!',
      headphone: '⚠️ Musik menutupi suara peringatan bahaya, alarm motor overload, atau bunyi derit getaran getaran obrolan (chatter) pahat.',
      smartphone: '⚠️ Distraksi nomor 1! Menatap layar ponsel saat mesin bubut aktif berisiko kehilangan anggota tubuh dalam sepersekian detik.',
      topeng_las: '⚠️ Kaca filter topeng las terlalu gelap untuk membaca mistar geser dan nonius mesin bubut. Gunakan Kacamata Safety bening.',
      kacamata_hitam: '⚠️ Lensa gelap mengaburkan visibilitas ketelitian bubut; lensa non-safety mudah pecah menusuk bola mata saat tertabrak tatal.',
      topi_biasa: '⚠️ Bahan kain poliester topi santai mudah terbakar oleh semburan gram panas dan menghalangi pandangan operator ke atas.',
      apron: '⚠️ Tali apron kulit yang menjuntai berisiko tersangkut poros transportir mesin bubut. Gunakan Wearpack pas badan.'
    }
  },
  {
    id: 'cnc',
    name: 'Mesin Non-Konvensional (CNC Turning / Milling)',
    icon: '💻',
    description: 'Pekerjaan otomatisasi pemesinan dalam kabin tertutup. Bahaya: Tabrakan pahat (crash), semprotan coolant bertekanan tinggi 20 bar, dan kejatuhan benda kerja saat setting.',
    mandatory: ['kacamata_safety', 'wearpack', 'shoes'],
    optional: ['earmuff'],
    forbidden: ['sandal', 'gloves_kain', 'topeng_las', 'headphone', 'jam_tangan', 'cincin', 'dasi', 'topi_biasa', 'kacamata_hitam', 'smartphone', 'kaos_longgar'],
    forbiddenReasons: {
      sandal: '🚨 Chuck hidrolik atau ragum CNC berbobot puluhan kilogram bisa terjatuh saat proses pemasangan part (setup) dan meremukkan kaki.',
      gloves_kain: '🚨 Kain rajut mudah tersangkut alat potong endmill tajam saat memasang / menyetel nol benda kerja (WCS G54).',
      headphone: '🚨 Sangat dilarang! Kamu tidak akan mendengar alarm sirine eror atau suara tumbukan pahat di dalam kabin mesin CNC.',
      smartphone: '🚨 Mengetik di ponsel saat tombol Cycle Start aktif dapat mengakibatkan salah input koordinat sumbu yang memicu tabrakan fatal.',
      dasi: '🚨 Menjuntai masuk ke ruang kerja mesin saat menunduk memeriksa permukaan benda kerja.',
      topeng_las: '⚠️ Menghalangi pandangan saat menekan layar sentuh / keypad panel kontroler CNC Fanuc/Siemens.',
      jam_tangan: '⚠️ Menggores kaca pintu akrilik pelindung CNC dan berisiko korsleting saat mengecek panel listrik PLC.',
      cincin: '⚠️ Berisiko tersangkut saat membersihkan bram dari celah ragum meja mesin CNC.'
    }
  },
  {
    id: 'fabrikasi',
    name: 'Fabrikasi Logam (Pengelasan & Pemotongan Api)',
    icon: '⚡',
    description: 'Pekerjaan menyambung dan memotong logam dengan busur listrik 3000°C. Bahaya utama: Radiasi sinar ultraviolet & inframerah, percikan bunga api 1000°C, dan uap asap beracun.',
    mandatory: ['topeng_las', 'gloves', 'shoes'],
    optional: ['respirator', 'safety_helmet'],
    forbidden: ['kacamata_safety', 'kacamata_hitam', 'gloves_kain', 'sandal', 'headphone', 'jam_tangan', 'cincin', 'dasi', 'topi_biasa', 'kaos_longgar', 'smartphone'],
    forbiddenReasons: {
      kacamata_safety: '🚨 BAHAYA KEBUTAAN PERMANEN (FLASH BURN)! Kacamata bening TIDAK MEMILIKI filter shade ultraviolet. Kornea mata bisa terbakar radiasi las! Wajib pakai Topeng Las (Helmet).',
      gloves_kain: '🚨 Kain katun rajut langsung terbakar dan meleleh menempel di kulit saat terkena percikan bunga api las 1000°C!',
      sandal: '🚨 Terak las cair panas (slag) akan langsung membakar daging punggung kaki hingga melepuh!',
      kacamata_hitam: '🚨 Kacamata fashion tidak memiliki sertifikasi filter UV shade 9-13 industri dan tidak menutupi wajah dari sengatan radiasi.',
      jam_tangan: '🚨 Logam arloji akan menyerap radiasi panas ekstrem hingga membakar kulit pergelangan tangan, serta risiko tersengat arus las 120 Ampere.',
      cincin: '🚨 Logam cincin menghantarkan arus listrik busur las seketika yang dapat menyebabkan luka bakar elektrik parah.',
      dasi: '🚨 Kain dasi menjuntai langsung tersulut api elektroda las.',
      headphone: '🚨 Plastik headphone meleleh terkena panas radiasi dan menghalangi suara ledakan tabung gas.',
      kaos_longgar: '🚨 Percikan bunga api las masuk ke dalam rongga baju longgar dan membakar kulit dada/perut.'
    }
  },
  {
    id: 'heat_treatment',
    name: 'Heat Treatment & Pengecoran Logam (Tungku 900°C)',
    icon: '🔥',
    description: 'Pekerjaan perlakuan panas pengerasan baja di dalam tungku pembakar 850°C - 950°C dan pencelupan cepat ke oli/air pendingin (quenching). Bahaya: Radiasi panas ekstrem, cipratan oli terbakar, dan ledakan uap quench.',
    mandatory: ['gloves', 'apron', 'shoes', 'kacamata_safety', 'wearpack'],
    optional: ['respirator', 'topeng_las'],
    forbidden: ['sandal', 'gloves_kain', 'headphone', 'dasi', 'cincin', 'jam_tangan', 'kaos_longgar', 'smartphone'],
    forbiddenReasons: {
      gloves_kain: '🚨 Sarung tangan kain rajut akan langsung menyala terbakar saat menjepit tang capit logam membara 900°C!',
      sandal: '🚨 Percikan oli quench panas atau tumpahan cairan garam nitrat langsung membakar kaki tanpa pelindung!',
      cincin: '🚨 Radiasi tungku 900°C memanaskan cincin emas/perak hingga membakar jaringan kulit jari.',
      dasi: '🚨 Ujung dasi menjuntai ke dalam pintu tungku atau bak quench yang bergolak mendidih.',
      kaos_longgar: '🚨 Baju longgar menangkap radiasi panas inframerah tungku secara berlebihan.',
      headphone: '🚨 Tidak mendengar desis ledakan uap (vapor blanket) saat quenching darurat.'
    }
  },
  {
    id: 'gerinda',
    name: 'Mesin Gerinda Duduk & Cutting Wheel (3800 RPM)',
    icon: '✨',
    description: 'Pekerjaan mengasah pahat bubut dan memotong baja dengan batu abrasif berkecepatan tinggi 3800 RPM. Bahaya: Serpihan batu gerinda pecah (proyektil), debu abrasif korundum, percikan bunga api, dan bising > 90 dB.',
    mandatory: ['kacamata_safety', 'earmuff', 'wearpack', 'shoes'],
    optional: ['respirator'],
    forbidden: ['gloves', 'gloves_kain', 'sandal', 'dasi', 'headphone', 'jam_tangan', 'cincin', 'topi_biasa', 'smartphone'],
    forbiddenReasons: {
      gloves: '🚨 SANGAT BERBAHAYA! Sarung tangan dilarang saat mengasah pahat di gerinda duduk karena jari bisa ditarik celah antara batu gerinda dan landasan kerja (tool rest)!',
      gloves_kain: '🚨 Benang sarung tangan rajut sangat mudah tersangkut putaran batu gerinda 3800 RPM dan menggiling jari tangan!',
      dasi: '🚨 Dasi terlempar ke putaran batu gerinda yang sedang berputar kencang.',
      sandal: '🚨 Batu gerinda yang pecah meletup dapat menghujam kaki bawah dengan kecepatan ratusan km/jam!',
      headphone: '🚨 Menghalangi pendengaran terhadap perubahan nada putaran batu gerinda yang menandakan batu retak atau terkikis miring.'
    }
  }
];

// =============================================================================
// DATABASE 22 ITEM INVENTARIS APD (STANDAR BENAR VS JEBAKAN SALAH)
// =============================================================================
const APD_ITEMS = [
  // --- STANDAR K3 BENAR (12 ITEM) ---
  {
    id: 'kacamata_safety',
    name: 'Kacamata Safety Bening',
    icon: '👓',
    type: 'correct',
    bodyPart: 'eyes',
    badge: 'STANDAR K3',
    spec: 'Polikarbonat ANSI Z87.1',
    desc: 'Melindungi mata dari lonjakan tatal/gram spiral tajam dan pecahan pahat. Wajib bening untuk akurasi optik.',
    image: '/assets/images/apd/kacamata_safety.jpg'
  },
  {
    id: 'wearpack',
    name: 'Wearpack Coverall Katun Drill',
    icon: '🦺',
    type: 'correct',
    bodyPart: 'body',
    badge: 'STANDAR K3',
    spec: 'Katun Drill Pas Badan',
    desc: 'Pakaian kerja berkancing rapi tanpa juntaian kain lepas. Dilengkapi pita reflektif untuk visibilitas tinggi.',
    image: '/assets/images/apd/wearpack.jpg'
  },
  {
    id: 'shoes',
    name: 'Sepatu Safety Steel-Toe',
    icon: '🥾',
    type: 'correct',
    bodyPart: 'feet',
    badge: 'STANDAR K3',
    spec: 'Ujung Baja 200J EN ISO 20345',
    desc: 'Ujung dilapisi pelat baja penahan beban jatuh 200 Joule. Sol tebal anti-tusukan gram tajam dan anti-licin oli.',
    image: '/assets/images/apd/shoes.jpg'
  },
  {
    id: 'topeng_las',
    name: 'Topeng Las Auto-Darkening',
    icon: '🪖',
    type: 'correct',
    bodyPart: 'head',
    badge: 'STANDAR K3',
    spec: 'Filter Shade 9-13 Dinamis',
    desc: 'Menutup 100% wajah dari percikan terak api 1000°C dan menyaring 100% radiasi sinar UV/Inframerah berbahaya.',
    image: '/assets/images/apd/topeng_las.jpg'
  },
  {
    id: 'gloves',
    name: 'Sarung Tangan Las Kulit Sapi',
    icon: '🧤',
    type: 'correct',
    bodyPart: 'hands',
    badge: 'STANDAR K3 (LAS/HEAT)',
    spec: 'Split Leather Tahan 900°C',
    desc: 'Khusus untuk pekerjaan Pengelasan & Tungku Heat Treatment. (CATATAN: Dilarang keras pada mesin bubut/frais!).',
    image: '/assets/images/apd/gloves.jpg'
  },
  {
    id: 'earmuff',
    name: 'Ear Muff Peredam Bising Industri',
    icon: '🎧',
    type: 'correct',
    bodyPart: 'head',
    badge: 'STANDAR K3',
    spec: 'NRR 28-32 dB ANSI S3.19',
    desc: 'Meredam kebisingan tinggi pada mesin gerinda dan pemotongan pelat tanpa mengganggu instruksi vokal rekan kerja.',
    image: '/assets/images/apd/headphone.jpg'
  },
  {
    id: 'respirator',
    name: 'Respirator Kimia & Debu N95',
    icon: '😷',
    type: 'correct',
    bodyPart: 'head',
    badge: 'STANDAR K3',
    spec: 'Twin Cartridge Filter Logam',
    desc: 'Menyaring asap beracun oksida seng pengelasan, uap oli quench, dan partikel debu batu gerinda korundum.',
    image: '/assets/images/apd/kacamata_safety.jpg'
  },
  {
    id: 'apron',
    name: 'Apron Dada Kulit Sapi',
    icon: '🎽',
    type: 'correct',
    bodyPart: 'body',
    badge: 'STANDAR K3 (PENGELASAN)',
    spec: 'Heavy Leather Flame Retardant',
    desc: 'Melindungi bagian dada, perut, dan pangkal paha dari pancaran panas radiasi las serta tetesan logam cair.',
    image: '/assets/images/apd/apron.jpg'
  },
  {
    id: 'sleeves',
    name: 'Pelindung Lengan Kulit (Sleeves)',
    icon: '💪',
    type: 'correct',
    bodyPart: 'hands',
    badge: 'STANDAR K3 (PENGELASAN)',
    spec: 'Karet Elastis Pas di Lengan',
    desc: 'Melindungi kulit lengan atas dan bawah dari percikan bunga api las vertikal / overhead welding.',
    image: '/assets/images/apd/sleeves.jpg'
  },
  {
    id: 'jeans',
    name: 'Celana Jeans Denim Tebal',
    icon: '👖',
    type: 'correct',
    bodyPart: 'feet',
    badge: 'STANDAR K3 ALTERNATIF',
    spec: 'Denim Katun 14 Oz Non-Sintetis',
    desc: 'Bahan katun tebal alami yang tidak mudah terbakar jika terkena percikan tatal atau bunga api.',
    image: '/assets/images/apd/jeans.jpg'
  },
  {
    id: 'safety_helmet',
    name: 'Helm Safety K3 Proyek (Hard Hat)',
    icon: '👷',
    type: 'correct',
    bodyPart: 'head',
    badge: 'STANDAR K3 BENGKEL BERAT',
    spec: 'HDPE Impact Resistance ANSI Z89.1',
    desc: 'Perlindungan kepala dari benturan pipa panjang atau material crane gantung overhead di bengkel fabrikasi.',
    image: '/assets/images/apd/topeng_las.jpg'
  },
  {
    id: 'hairnet',
    name: 'Hairnet / Pengikat Rambut Rapi',
    icon: '🪢',
    type: 'correct',
    bodyPart: 'head',
    badge: 'STANDAR K3 OPERATOR',
    spec: 'Jaring Elastis Antistatik',
    desc: 'Mengikat rambut operator agar tidak terurai melambai dan tersedot ke putaran as mesin bor/bubut.',
    image: '/assets/images/apd/topi_biasa.jpg'
  },

  // --- ITEM JEBAKAN / TERLARANG / BERBAHAYA (10 ITEM) ---
  {
    id: 'gloves_kain',
    name: 'Sarung Tangan Rajut Longgar',
    icon: '🧤',
    type: 'wrong',
    bodyPart: 'hands',
    badge: '☠️ JEBAKAN MAUT BUBUT',
    spec: 'Kain Katun Rajut Longgar',
    desc: 'BAHAYA TERLILIT CHUCK BUBUT! Serat benang tersangkut benda kerja berputar dan memuntir tangan seketika!',
    image: '/assets/images/apd/gloves.jpg'
  },
  {
    id: 'dasi',
    name: 'Dasi Panjang / Kalung Menjuntai',
    icon: '🧣',
    type: 'wrong',
    bodyPart: 'body',
    badge: '☠️ BAHAYA KEMATIAN INSTAN',
    spec: 'Kain Menjuntai Bebas',
    desc: 'BAHAYA TERTARIK AS BUBUT! Ujung dasi ditarik putaran spindel, mencekik leher operator dalam 0.2 detik!',
    image: '/assets/images/apd/apron.jpg'
  },
  {
    id: 'sandal',
    name: 'Sandal Jepit Karet',
    icon: '🩴',
    type: 'wrong',
    bodyPart: 'feet',
    badge: '🚨 BAHAYA FATAL KAKI',
    spec: 'Karet Spons Tipis Terbuka',
    desc: 'Kaki telanjang langsung hangus tersiram tatal gram panas 250°C dan remuk tertimpa benda berat jatuh.',
    image: '/assets/images/apd/sandal.jpg'
  },
  {
    id: 'jam_tangan',
    name: 'Jam Tangan Logam & Rantai',
    icon: '⌚',
    type: 'wrong',
    bodyPart: 'hands',
    badge: '⚠️ ENTANGLEMENT HAZARD',
    spec: 'Logam Rantai Baja Konduktif',
    desc: 'Sangat mudah tersangkut pada celah chuck berputar 1200 RPM dan memicu korsleting listrik saat pengelasan.',
    image: '/assets/images/apd/jam_tangan.jpg'
  },
  {
    id: 'cincin',
    name: 'Cincin Logam di Jari',
    icon: '💍',
    type: 'wrong',
    bodyPart: 'hands',
    badge: '⚠️ BAHAYA DEGLOVING',
    spec: 'Cincin Emas/Perak Logam',
    desc: 'Risiko kulit dan daging jari terkoyak putus jika tersangkut benda berputar, serta konduktor panas sengatan api.',
    image: '/assets/images/apd/jam_tangan.jpg'
  },
  {
    id: 'headphone',
    name: 'Headphone Musik Nirkabel',
    icon: '🎧',
    type: 'wrong',
    bodyPart: 'head',
    badge: '⚠️ PEKAK ALARM DARURAT',
    spec: 'Headphone Musik Audio Hiburan',
    desc: 'Menutup pendengaran dari alarm darurat mesin, bunyi chatter obrolan pahat, atau teriakan bahaya rekan kerja.',
    image: '/assets/images/apd/headphone.jpg'
  },
  {
    id: 'smartphone',
    name: 'Memegang HP Saat Bekerja',
    icon: '📱',
    type: 'wrong',
    bodyPart: 'hands',
    badge: '🚨 DISTRAKSI FATAL',
    spec: 'Layar Sentuh Ponsel Aktif',
    desc: 'Kehilangan konsentrasi sepersekian detik saat mengoperasikan mesin berputar mengakibatkan kecelakaan fatal.',
    image: '/assets/images/apd/jam_tangan.jpg'
  },
  {
    id: 'topi_biasa',
    name: 'Topi Santai Baseball Terbalik',
    icon: '🧢',
    type: 'wrong',
    bodyPart: 'head',
    badge: '⚠️ TIDAK STANDAR K3',
    spec: 'Kain Poliester Mudah Terbakar',
    desc: 'Kain tipis mudah terbakar oleh bunga api, tidak menahan benturan, dan lidah topi menghalangi pandangan ke atas.',
    image: '/assets/images/apd/topi_biasa.jpg'
  },
  {
    id: 'kacamata_hitam',
    name: 'Kacamata Hitam Fashion',
    icon: '🕶️',
    type: 'wrong',
    bodyPart: 'eyes',
    badge: '⚠️ GELAP & PECAH MENUSUK',
    spec: 'Lensa Kaca Fashion Biasa',
    desc: 'Pandangan gelap di bengkel; kaca non-safety mudah pecah menusuk bola mata jika tertabrak tatal gram kencang.',
    image: '/assets/images/apd/kacamata_hitam.jpg'
  },
  {
    id: 'kaos_longgar',
    name: 'Baju Kaos Kedodoran / Gombrang',
    icon: '👕',
    type: 'wrong',
    bodyPart: 'body',
    badge: '🚨 TERBELIT AS BUBUT',
    spec: 'Kain Jersey Longgar Menggantung',
    desc: 'Kain yang melambai-lambai sangat mudah tergulung poros spindel atau transportir mesin bubut yang berputar.',
    image: '/assets/images/apd/wearpack.jpg'
  }
];

// =============================================================================
// COMPONENT UTAMA SAFETY K3 LAB
// =============================================================================
export default function SafetyK3Game() {
  const [activeTab, setActiveTab] = useState('apd');
  const [selectedJob, setSelectedJob] = useState('konvensional');
  const [equippedItems, setEquippedItems] = useState(['wearpack', 'shoes', 'kacamata_safety']);
  const [apdResult, setApdResult] = useState(null);
  const [inventoryFilter, setInventoryFilter] = useState('all'); // all, correct, wrong, body parts
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'

  const currentJobObj = useMemo(() => {
    return JOBS.find(j => j.id === selectedJob) || JOBS[0];
  }, [selectedJob]);

  // Count currently equipped dangerous items for this job
  const equippedForbiddenItems = useMemo(() => {
    return currentJobObj.forbidden.filter(id => equippedItems.includes(id));
  }, [currentJobObj, equippedItems]);

  // Toggle item wear
  const toggleEquip = (id) => {
    sound.playClick();
    if (equippedItems.includes(id)) {
      setEquippedItems(equippedItems.filter(item => item !== id));
    } else {
      setEquippedItems([...equippedItems, id]);
    }
    if (apdResult) setApdResult(null);
  };

  // Clear all equipped
  const handleClearAll = () => {
    sound.playClick();
    setEquippedItems([]);
    setApdResult(null);
  };

  // Auto-equip standard APD for current job
  const handleAutoEquipStandard = () => {
    sound.playSuccess();
    setEquippedItems([...currentJobObj.mandatory]);
    setApdResult(null);
  };

  // Text-To-Speech Feedback
  const speakFeedback = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // VERIFIKASI K3 & PENILAIAN LENGKAP
  const verifyApd = () => {
    const forbiddenList = currentJobObj.forbidden.filter(id => equippedItems.includes(id));
    const missingMandatory = [];

    // Check custom rules per job
    if (selectedJob === 'fabrikasi') {
      if (!equippedItems.includes('topeng_las')) missingMandatory.push('Topeng Las Auto-Darkening');
      if (!equippedItems.includes('gloves')) missingMandatory.push('Sarung Tangan Kulit Sapi');
      if (!equippedItems.includes('shoes')) missingMandatory.push('Sepatu Safety Steel-Toe');

      const hasWearpack = equippedItems.includes('wearpack');
      const hasApronSet = equippedItems.includes('apron') && equippedItems.includes('sleeves') && equippedItems.includes('jeans');
      if (!hasWearpack && !hasApronSet) {
        missingMandatory.push('Pelindung Badan (Wearpack ATAU Apron + Pelindung Lengan + Jeans)');
      }
    } else if (selectedJob === 'heat_treatment') {
      if (!equippedItems.includes('gloves')) missingMandatory.push('Sarung Tangan Kulit Sapi Tahan Panas 900°C');
      if (!equippedItems.includes('apron')) missingMandatory.push('Apron Kulit Sapi Tahan Api');
      if (!equippedItems.includes('shoes')) missingMandatory.push('Sepatu Safety');
      if (!equippedItems.includes('kacamata_safety') && !equippedItems.includes('topeng_las')) {
        missingMandatory.push('Kacamata Safety Bening / Pelindung Wajah');
      }
      if (!equippedItems.includes('wearpack') && !equippedItems.includes('jeans')) {
        missingMandatory.push('Pakaian Kerja Wearpack / Jeans Tebal');
      }
    } else if (selectedJob === 'gerinda') {
      if (!equippedItems.includes('kacamata_safety')) missingMandatory.push('Kacamata Safety Bening ANSI Z87.1');
      if (!equippedItems.includes('earmuff')) missingMandatory.push('Ear Muff Peredam Bising');
      if (!equippedItems.includes('shoes')) missingMandatory.push('Sepatu Safety');
      if (!equippedItems.includes('wearpack')) missingMandatory.push('Wearpack Rapi Pas Badan');
    } else {
      // Konvensional / CNC
      if (!equippedItems.includes('kacamata_safety')) missingMandatory.push('Kacamata Safety Polikarbonat');
      if (!equippedItems.includes('wearpack')) missingMandatory.push('Wearpack Coverall');
      if (!equippedItems.includes('shoes')) missingMandatory.push('Sepatu Safety Steel-Toe');
    }

    // SCORING & VERDICT
    if (forbiddenList.length > 0) {
      sound.playError();
      const forbiddenDetails = forbiddenList.map(id => {
        const itemObj = APD_ITEMS.find(i => i.id === id);
        return {
          name: itemObj ? itemObj.name : id,
          reason: currentJobObj.forbiddenReasons[id] || 'Sangat berbahaya untuk pekerjaan ini!'
        };
      });

      const score = Math.max(0, 40 - (forbiddenList.length * 20));

      setApdResult({
        status: 'danger',
        score: score,
        title: '🚨 DITOLAK: PELANGGARAN K3 TINGKAT FATAL!',
        message: `Operator terdeteksi menggunakan ${forbiddenList.length} item terlarang yang membahayakan nyawa!`,
        forbiddenDetails,
        missingMandatory,
        verdict: 'Operator DILARANG KERAS menyalakan mesin. Wajib melepas semua item berbahaya sebelum kecelakaan kerja fatal terjadi.',
        oshaCode: 'UU No. 1 Thn 1970 Pasal 14 (Pelanggaran Prosedur K3 Industri)'
      });

      speakFeedback(`Peringatan Kritis K3! Kamu memakai ${forbiddenDetails[0].name}. ${forbiddenDetails[0].reason}`);
    } else if (missingMandatory.length > 0) {
      sound.playError();
      const score = Math.max(30, 85 - (missingMandatory.length * 15));

      setApdResult({
        status: 'warning',
        score: score,
        title: '⚠️ APD BELUM LENGKAP (BELUM MEMENUHI STANDAR)',
        message: `Peralatan wajib yang masih kurang: ${missingMandatory.join(', ')}`,
        missingMandatory,
        verdict: 'Lengkapi seluruh APD proteksi standar industri sebelum masuk ke area kerja mesin.',
        oshaCode: 'Standar Kelengkapan APD Minimum'
      });

      speakFeedback(`Kelengkapan APD belum memenuhi standar. Kamu masih membutuhkan ${missingMandatory[0]}.`);
    } else {
      sound.playSuccess();
      setApdResult({
        status: 'success',
        score: 100,
        title: '✅ APD SESUAI STANDAR INDUSTRI (100% LAYAK KERJA)',
        message: 'Luar Biasa! Seluruh anggota tubuh operator telah terproteksi sesuai matriks bahaya bengkel.',
        verdict: `Operator telah memenuhi syarat K3 untuk mengoperasikan ${currentJobObj.name}. Tidak ada potensi bahaya terbelit atau kecelakaan mekanis.`,
        oshaCode: 'Sertifikasi K3 Mandiri: Zero Accident Ready'
      });

      speakFeedback(`Luar biasa! Penampilan operator sudah seratus persen memenuhi standar keselamatan kerja industri. Aman untuk mulai bekerja.`);
    }

    const finalScore = forbiddenList.length > 0
      ? Math.max(0, 40 - (forbiddenList.length * 20))
      : (missingMandatory.length > 0 ? Math.max(30, 85 - (missingMandatory.length * 15)) : 100);

    recordQuizResult({
      modul: 'Safety Lab - K3 & APD',
      judulKuis: `Inspeksi APD: ${currentJobObj.name}`,
      skor: finalScore,
      jawabanBenar: finalScore === 100 ? 1 : 0,
      totalSoal: 1,
      detailJawaban: `Pemeriksaan APD ${currentJobObj.name}: ${finalScore === 100 ? 'Lulus 100%' : (forbiddenList.length > 0 ? 'Item Terlarang: ' + forbiddenList.join(', ') : 'Kurang: ' + missingMandatory.join(', '))}`
    });
  };

  // Filtered inventory list
  const filteredApdItems = useMemo(() => {
    return APD_ITEMS.filter(item => {
      // Query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.desc.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      // Category tab filter
      if (inventoryFilter === 'all') return true;
      if (inventoryFilter === 'correct') return item.type === 'correct';
      if (inventoryFilter === 'wrong') return item.type === 'wrong';
      if (['head', 'eyes', 'body', 'hands', 'feet'].includes(inventoryFilter)) {
        return item.bodyPart === inventoryFilter;
      }
      return true;
    });
  }, [inventoryFilter, searchQuery]);



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER & TOP TABS */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '20px 24px',
        borderRadius: '16px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>🦺</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, fontFamily: "'Chakra Petch', sans-serif", letterSpacing: '1px' }}>
                LABORATORIUM K3 &amp; SIMULATOR APD VIRTUAL 3D
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                Simulasi Standar Operasional Keselamatan Kerja Bengkel Pemesinan Sesuai UU No. 1 Tahun 1970
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.08)', padding: '6px', borderRadius: '12px' }}>
          {[
            { id: 'apd', label: '🧍 Simulator APD 3D Orbit', desc: 'Seleksi APD' },
            { id: 'k3lh_apar', label: '🛡️ K3LH, Bahaya & APAR', desc: 'Simulasi PASS' },
            { id: 'budaya_5r', label: '🧹 Budaya 5R & Etika DUDI', desc: 'Audit 5S & Kuis' },
            { id: 'perkakas', label: '🔨 Perkakas Tangan & Mesin', desc: 'Bor, Gerinda & Kikir' },
            { id: 'jsa_dudi', label: '📋 JSA & Benda Uji DUDI', desc: 'SOP & Rubrik QC' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { sound.playClick(); setActiveTab(tab.id); }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: activeTab === tab.id ? '#ea580c' : 'transparent',
                color: '#ffffff',
                border: activeTab === tab.id ? '1px solid #fdba74' : 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          TAB 1: SIMULATOR APD 3D
      ===================================================================== */}
      {activeTab === 'apd' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* STEP 1: PILIH AREA / JENIS PEKERJAAN */}
          <div className="dashboard-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                1. PILIH WORKSTATION / JENIS PEKERJAAN BENGKEL
              </h3>
              <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                Standar K3 Industri Manufaktur
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
              {JOBS.map(job => {
                const isSelected = selectedJob === job.id;
                return (
                  <button
                    key={job.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedJob(job.id);
                      setApdResult(null);
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: isSelected ? '#ffedd5' : '#ffffff',
                      color: isSelected ? '#c2410c' : '#1e293b',
                      border: isSelected ? '2px solid #ea580c' : '1px solid #cbd5e1',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? '0 4px 12px rgba(234, 88, 12, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{job.icon}</span>
                      <span>{job.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Workplace Hazard Description Banner */}
            <div style={{
              marginTop: '14px',
              padding: '12px 16px',
              background: '#fffbeb',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#92400e',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <strong>Identifikasi Bahaya Potensial ({currentJobObj.name}):</strong>
                <div style={{ color: '#78350f', marginTop: '2px' }}>{currentJobObj.description}</div>
              </div>
            </div>
          </div>

          {/* MAIN SIMULATOR WORKSPACE: 3D VIEWPORT (LEFT) + INVENTORY (RIGHT) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: '20px' }}>
            
            {/* COLUMN 1: 3D REALISTIC OPERATOR VIEWPORT */}
            <div className="dashboard-card" style={{
              padding: '18px',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                  OPERATOR VIRTUAL (3D REALISTIS)
                </h3>

                {/* View Mode Toggle */}
                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
                  <button
                    onClick={() => setViewMode('3d')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: viewMode === '3d' ? '#ea580c' : 'transparent',
                      color: viewMode === '3d' ? '#ffffff' : '#64748b',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    3D Orbit
                  </button>
                  <button
                    onClick={() => setViewMode('2d')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: viewMode === '2d' ? '#ea580c' : 'transparent',
                      color: viewMode === '2d' ? '#ffffff' : '#64748b',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Skema 2D
                  </button>
                </div>
              </div>

              {/* 3D WebGL Canvas or 2D SVG Mannequin */}
              <div style={{
                height: '460px',
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#0f172a',
                position: 'relative'
              }}>
                {viewMode === '3d' ? (
                  <Safety3DOperator equippedItems={equippedItems} showHazardLabels={true} />
                ) : (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
                    color: '#fff',
                    padding: '20px'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📐</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                      Bagan Skema Terpasang ({equippedItems.length} Item)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px', justifyContent: 'center', maxWidth: '300px' }}>
                      {equippedItems.map(id => {
                        const item = APD_ITEMS.find(i => i.id === id);
                        return (
                          <span key={id} style={{
                            fontSize: '0.72rem',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: item?.type === 'wrong' ? '#ef4444' : '#0284c7',
                            color: '#fff',
                            fontWeight: 700
                          }}>
                            {item?.icon} {item?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Live Hazard Alert Banner if forbidden items equipped */}
              {equippedForbiddenItems.length > 0 && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px 12px',
                  background: '#fef2f2',
                  border: '1px solid #f87171',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.74rem',
                  color: '#991b1b',
                  fontWeight: 700
                }}>
                  <span style={{ fontSize: '1.1rem' }}>🚨</span>
                  <div>
                    <strong>Peringatan Langsung:</strong> Terdeteksi {equippedForbiddenItems.length} item terlarang/berbahaya pada operator!
                  </div>
                </div>
              )}

              {/* Action Buttons: Verify, Reset, Auto-Equip */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                <button
                  onClick={verifyApd}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>✓</span> UJI KELAYAKAN K3 OPERATOR
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={handleAutoEquipStandard}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✨ Pasang Standar K3
                  </button>

                  <button
                    onClick={handleClearAll}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      color: '#64748b',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ↺ Lepas Semua APD
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 2: APD INVENTORY (KLIK UNTUK PAKAI / LEPAS) */}
            <div className="dashboard-card" style={{
              padding: '20px',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                    2. INVENTARIS APD (KLIK UNTUK PAKAI/LEPAS)
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    Tersedia 22 komponen APD: pilih peralatan standar K3 dan hindari item jebakan berbahaya!
                  </div>
                </div>

                {/* Quick Search */}
                <input
                  type="text"
                  placeholder="🔍 Cari APD..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.75rem',
                    width: '150px'
                  }}
                />
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
                {[
                  { id: 'all', label: 'Semua Item (22)' },
                  { id: 'correct', label: '✅ Standar K3 (12)' },
                  { id: 'wrong', label: '⚠️ Jebakan Bahaya (10)' },
                  { id: 'head', label: '🪖 Kepala' },
                  { id: 'eyes', label: '👓 Mata/Wajah' },
                  { id: 'body', label: '🦺 Badan' },
                  { id: 'hands', label: '🧤 Tangan' },
                  { id: 'feet', label: '🥾 Kaki' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setInventoryFilter(f.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: inventoryFilter === f.id ? '#0f172a' : '#f1f5f9',
                      color: inventoryFilter === f.id ? '#ffffff' : '#475569',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Inventory Grid of APD Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))',
                gap: '12px',
                maxHeight: '480px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {filteredApdItems.map(item => {
                  const isEquipped = equippedItems.includes(item.id);
                  const isWrong = item.type === 'wrong';

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleEquip(item.id)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '10px',
                        border: isEquipped
                          ? (isWrong ? '2px solid #ef4444' : '2px solid #10b981')
                          : '1px solid #e2e8f0',
                        background: isEquipped
                          ? (isWrong ? '#fef2f2' : '#f0fdf4')
                          : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        position: 'relative',
                        boxShadow: isEquipped
                          ? (isWrong ? '0 4px 12px rgba(239, 68, 68, 0.25)' : '0 4px 12px rgba(16, 185, 129, 0.25)')
                          : '0 2px 6px rgba(0,0,0,0.03)',
                        transform: isEquipped ? 'translateY(-2px)' : 'none'
                      }}
                    >
                      {/* Icon / Avatar Box */}
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '10px',
                        background: isWrong ? '#fee2e2' : '#e0f2fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        marginBottom: '8px',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        {item.icon}
                      </div>

                      {/* Badge Standar vs Bahaya */}
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginBottom: '4px',
                        background: isWrong ? '#fee2e2' : '#dcfce7',
                        color: isWrong ? '#b91c1c' : '#15803d'
                      }}>
                        {item.badge}
                      </span>

                      {/* Item Name */}
                      <div style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: isEquipped ? (isWrong ? '#b91c1c' : '#15803d') : '#1e293b',
                        lineHeight: 1.3,
                        marginBottom: '4px'
                      }}>
                        {item.name}
                      </div>

                      {/* Short Description */}
                      <div style={{
                        fontSize: '0.66rem',
                        color: '#64748b',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.desc}
                      </div>

                      {/* Active Status Ribbon */}
                      {isEquipped && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: isWrong ? '#ef4444' : '#10b981',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '0.65rem',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* FORENSIC INSPECTION RESULT BOX */}
              {apdResult && (
                <div style={{
                  marginTop: '18px',
                  padding: '18px 20px',
                  borderRadius: '12px',
                  background: apdResult.status === 'success'
                    ? '#ecfdf5'
                    : (apdResult.status === 'danger' ? '#fef2f2' : '#fffbeb'),
                  border: `2px solid ${
                    apdResult.status === 'success'
                      ? '#10b981'
                      : (apdResult.status === 'danger' ? '#ef4444' : '#f59e0b')
                  }`,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
                }}>
                  {/* Title & Score */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 900,
                      color: apdResult.status === 'success'
                        ? '#047857'
                        : (apdResult.status === 'danger' ? '#b91c1c' : '#b45309')
                    }}>
                      {apdResult.title}
                    </h4>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: apdResult.status === 'success' ? '#10b981' : (apdResult.status === 'danger' ? '#ef4444' : '#f59e0b'),
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '0.78rem'
                    }}>
                      Skor K3: {apdResult.score} / 100
                    </span>
                  </div>

                  <p style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', margin: '0 0 10px 0' }}>
                    {apdResult.message}
                  </p>

                  {/* Forbidden items breakdown if danger */}
                  {apdResult.forbiddenDetails && apdResult.forbiddenDetails.length > 0 && (
                    <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #fecaca' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#991b1b', marginBottom: '6px' }}>
                        💥 Mekanisme Bahaya &amp; Pelanggaran Terdeteksi:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.75rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                        {apdResult.forbiddenDetails.map((f, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>
                            <strong>{f.name}:</strong> {f.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing items breakdown */}
                  {apdResult.missingMandatory && apdResult.missingMandatory.length > 0 && (
                    <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #fed7aa' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#9a3412', marginBottom: '4px' }}>
                        📋 Peralatan Wajib yang Belum Terpasang:
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#7c2d12' }}>
                        {apdResult.missingMandatory.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Verdict */}
                  <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5, background: 'rgba(255,255,255,0.7)', padding: '10px 12px', borderRadius: '6px' }}>
                    💡 <strong>Keputusan Akhir Instruktur / Safety Officer:</strong> {apdResult.verdict}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: K3LH, HIRARKI BAHAYA & SIMULATOR APAR
      ===================================================================== */}
      {activeTab === 'k3lh_apar' && <K3LHEmergencyModule />}

      {/* =====================================================================
          TAB 3: BUDAYA KERJA 5R / 5S & ETIKA PROFESIONAL DUDI
      ===================================================================== */}
      {activeTab === 'budaya_5r' && <Budaya5REthicsModule />}

      {/* =====================================================================
          TAB 4: PERKAKAS TANGAN MANUAL & MESIN PORTABEL / RINGAN
      ===================================================================== */}
      {activeTab === 'perkakas' && <BenchToolsModule />}

      {/* =====================================================================
          TAB 5: JOB SAFETY ANALYSIS (JSA) & PROYEK BENDA UJI DUDI
      ===================================================================== */}
      {activeTab === 'jsa_dudi' && <JSABenchProjectModule />}

    </div>
  );
}

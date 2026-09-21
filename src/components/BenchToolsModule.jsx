import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { recordQuizResult } from '../services/sheetService';

export default function BenchToolsModule() {
  const [activeCategory, setActiveCategory] = useState('kikir_gergaji');

  // Kalkulator RPM Bor Meja
  const [drillMaterial, setDrillMaterial] = useState('baja_lunak');
  const [drillDiameter, setDrillDiameter] = useState(8);

  // Kalkulator Tap & Snei
  const [tapSize, setTapSize] = useState('M8');

  // Kuis Interaktif State
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Data Kecepatan Potong (Cutting Speed - Cs dalam m/menit) untuk Bor HSS
  const CUTTING_SPEEDS = {
    baja_lunak: { name: 'Baja Karbon Rendah (St37 / Mild Steel)', cs: 25, coolant: 'Soluble Oil (Coolant Emulsi)' },
    baja_keras: { name: 'Baja Karbon Menengah / Keras (St60 / AISI 4140)', cs: 15, coolant: 'Sulfurized Cutting Oil' },
    aluminium: { name: 'Aluminium Paduan (Dural / Al 6061)', cs: 60, coolant: 'Minyak Tanah / Kerosene / Alkohol atau Kering' },
    kuningan: { name: 'Kuningan / Tembaga (Brass / Bronze)', cs: 40, coolant: 'Kering atau Sedikit Soluble Oil' },
    besi_tuang: { name: 'Besi Tuang Kelabu (Cast Iron)', cs: 18, coolant: 'KERING (Dilarang pakai cairan pendingin agar tatal tidak mengeras)' }
  };

  const calculatedRpm = Math.round((1000 * CUTTING_SPEEDS[drillMaterial].cs) / (Math.PI * Number(drillDiameter)));

  // Data Standar Tap Metrik ISO
  const TAP_DATA = {
    M3: { pitch: 0.5, drillDia: 2.5, torque: 'Sangat Ringan (Rentan patah!)', steps: 'Gunakan Tap No. 1 dengan putaran sangat hati-hati' },
    M4: { pitch: 0.7, drillDia: 3.3, torque: 'Ringan', steps: 'Pastikan kesikuan 90° dengan siku presisi' },
    M5: { pitch: 0.8, drillDia: 4.2, torque: 'Sedang-Ringan', steps: 'Putar 1 putaran maju, 1/2 putaran mundur' },
    M6: { pitch: 1.0, drillDia: 5.0, torque: 'Sedang', steps: 'Gunakan pelumas cutting oil pelindung alur' },
    M8: { pitch: 1.25, drillDia: 6.75, standardDrill: '6.8 mm', torque: 'Sedang-Kuat', steps: 'Beri chamfer 45° pada mulut lubang bor' },
    M10: { pitch: 1.5, drillDia: 8.5, standardDrill: '8.5 mm', torque: 'Kuat', steps: 'Urutan wajib: Tap No. 1 (Tirus) -> Tap No. 2 (Antara) -> Tap No. 3 (Finishing)' },
    M12: { pitch: 1.75, drillDia: 10.25, standardDrill: '10.3 mm', torque: 'Sangat Kuat', steps: 'Gunakan stang tap panjang untuk torsi seimbang' },
    M16: { pitch: 2.0, drillDia: 14.0, standardDrill: '14.0 mm', torque: 'Ekstra Kuat', steps: 'Lumasi secara berkala pada setiap langkah mundur pemutus tatal' }
  };

  // Soal Evaluasi Perkakas
  const BENCH_QUIZ = [
    {
      q: 'Mengapa dilarang keras menggunakan kikir tanpa gagang pegangan (tang kikir telanjang) di bengkel?',
      options: [
        'A. Kikir menjadi lebih berat saat digerakkan',
        'B. Ujung ekor kikir yang runcing dapat menembus telapak tangan jika kikir macet atau menabrak benda kerja',
        'C. Menurunkan kecepatan langkah pengikiran',
        'D. Hasil pengikiran menjadi tidak mengkilap'
      ],
      correct: 1,
      expl: 'Ekor kikir (tang) sangat tajam dan runcing. Dorongan pengikiran dengan kikir telanjang dapat menyebabkan ekor kikir menusuk tembus ke urat dan otot telapak tangan!'
    },
    {
      q: 'Bagaimana arah pemasangan mata gergaji besi (hacksaw blade) yang benar sesuai SOP?',
      options: [
        'A. Gigi gergaji menghadap ke belakang (ke arah gagang pemegang)',
        'B. Gigi gergaji menghadap bebas bolak-balik',
        'C. Gigi gergaji menghadap ke depan menjauhi gagang (memotong saat langkah dorong)',
        'D. Posisi miring 45 derajat ke samping bilah'
      ],
      correct: 2,
      expl: 'Gigi gergaji besi dirancang memotong saat langkah maju (dorong). Menarik gergaji saat memotong akan menumpulkan gigi seketika dan merusak kerangka gergaji.'
    },
    {
      q: 'Apa bahaya fatal dari kepala pahat tangan yang membentuk "kepala jamur" (mushroom head)?',
      options: [
        'A. Pahat menjadi lebih tumpul pada mata potongnya',
        'B. Serpihan baja yang merekah dapat patah dan melesat sebagai proyektil tajam ke mata atau leher saat dipukul palu',
        'C. Suara ketukan palu menjadi terlalu nyaring',
        'D. Berat pahat berkurang sehingga tidak bertenaga'
      ],
      correct: 1,
      expl: 'Pukulan berulang menyebabkan logam kepala pahat memipih dan retak (mushrooming). Logam getas ini bisa terpental berkecepatan peluru saat dipukul palu. Wajib digerinda rata!'
    },
    {
      q: 'Berapa jarak aman maksimum antara landasan kerja (tool rest) dengan batu gerinda duduk?',
      options: [
        'A. 2 s/d 3 mm',
        'B. 10 s/d 15 mm',
        'C. Bebas asalkan benda kerja tidak jatuh',
        'D. Menempel rapat pada batu gerinda tanpa celah'
      ],
      correct: 0,
      expl: 'Celah landasan gerinda (tool rest) maksimal 2-3 mm. Jika lebih dari 3 mm, benda kerja tipis atau jari tangan dapat terselot dan terjepit ke putaran batu 3800 RPM!'
    },
    {
      q: 'Mengapa DILARANG KERAS menggunakan sarung tangan kain rajut saat mengoperasikan mesin bor meja?',
      options: [
        'A. Sarung tangan membuat tangan kepanasan',
        'B. Serat benang kain rajut mudah terbelit putaran mata bor dan menyeret jari serta tangan ke putaran poros',
        'C. Mengotori gagang tuas penekan bor',
        'D. Menghalangi semprotan pendingin'
      ],
      correct: 1,
      expl: 'Bahaya Entanglement (terbelit)! Mesin bor memiliki torsi putar yang sangat kuat. Benang sarung tangan yang tersangkut sedikit saja akan memilin tangan hingga tulang patah/amputasi.'
    },
    {
      q: 'Untuk membuat ulir dalam M10 x 1.5, berapakah diameter mata bor yang harus digunakan?',
      options: [
        'A. 10.0 mm',
        'B. 9.0 mm',
        'C. 8.5 mm',
        'D. 7.5 mm'
      ],
      correct: 2,
      expl: 'Rumus lubang tap metrik: D_bor = D_nominal - Pitch. Untuk M10 x 1.5 -> D_bor = 10 - 1.5 = 8.5 mm.'
    },
    {
      q: 'Apa fungsi utama penitik pusat (center punch) dengan sudut ujung 90° sebelum proses pengeboran?',
      options: [
        'A. Memperjelas garis batas ukuran gambar kerja',
        'B. Memberikan cekungan pemusatan agar ujung mata bor tidak melenceng (walking) saat mulai mengebor',
        'C. Memotong pelat tipis',
        'D. Mengetes kekerasan baja benda kerja'
      ],
      correct: 1,
      expl: 'Center punch 90° membuat cekungan kerucut yang cocok dengan sudut mata bor (118°), memastikan mata bor langsung memusat dan tidak bergeser dari koordinat layout.'
    },
    {
      q: 'Tindakan apa yang WAJIB dilakukan seketika setelah mengencangkan mata bor pada chuck bor meja?',
      options: [
        'A. Menyalakan saklar power mesin',
        'B. Meneteskan oli ke dalam chuck',
        'C. Mencabut dan mengembalikan kunci chuck (chuck key) dari kepala chuck',
        'D. Memutar chuck dengan tangan secepat mungkin'
      ],
      correct: 2,
      expl: 'Kunci chuck yang tertinggal di chuck bor akan terlempar dengan kecepatan mematikan saat saklar motor dinyalakan!'
    },
    {
      q: 'Mengapa pada saat pengetapan ulir manual harus dilakukan gerakan 1 putaran maju lalu 1/2 putaran mundur?',
      options: [
        'A. Supaya tangan operator tidak cepat lelah',
        'B. Untuk mematahkan tatal/gram spiral agar tidak menyumbat alur tap yang dapat mematahkan tap di dalam lubang',
        'C. Agar ulir yang terbentuk lebih longgar',
        'D. Mempercepat waktu pengerjaan ulir'
      ],
      correct: 1,
      expl: 'Gerakan mundur berfungsi sebagai pemutus tatal (chip breaking). Tatal yang tidak terputus akan mengunci alur tap dan menyebabkan tap patah di dalam benda kerja.'
    },
    {
      q: 'Mengapa benda kerja pada mesin bor meja WAJIB dicekam menggunakan ragum mesin dan DILARANG dipegang tangan kosong?',
      options: [
        'A. Agar tangan tidak kotor terkena oli',
        'B. Jika mata bor macet/menembus benda kerja, benda kerja akan berputar liar seperti baling-baling pisau yang menyabet tangan operator',
        'C. Supaya lubang bor terlihat lebih mengkilap',
        'D. Hanya anjuran yang tidak wajib dipatuhi'
      ],
      correct: 1,
      expl: 'Saat mata bor menembus dasar benda kerja, gesekan melonjak drastis. Tangan manusia tidak mampu menahan torsi motor listrik; benda kerja akan berputar liar menyabet jari tangan!'
    }
  ];

  const handleSelectAnswer = (index) => {
    if (isAnswered) return;
    sound.playClick();
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === BENCH_QUIZ[quizIndex].correct) {
      sound.playSuccess();
      setQuizScore(prev => prev + 10);
    } else {
      sound.playError();
    }
  };

  const handleNextQuiz = () => {
    sound.playClick();
    if (quizIndex < BENCH_QUIZ.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      const finalScore = quizScore + (selectedAnswer === BENCH_QUIZ[quizIndex].correct ? 0 : 0); // already updated
      recordQuizResult({
        modul: 'Safety Lab - Perkakas Tangan & Mesin Portabel',
        judulKuis: 'Uji Kompetensi SOP & K3 Perkakas Tangan & Bor/Gerinda',
        skor: finalScore,
        jawabanBenar: Math.round(finalScore / 10),
        totalSoal: BENCH_QUIZ.length,
        detailJawaban: `Menyelesaikan 10 Soal Evaluasi SOP Penggunaan Perkakas Manual & Mesin Ringan. Skor Akhir: ${finalScore}/100.`
      });
    }
  };

  const handleResetQuiz = () => {
    sound.playClick();
    setQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Modul */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #334155',
        color: '#ffffff',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            fontSize: '2.5rem',
            background: 'rgba(234, 88, 12, 0.15)',
            border: '2px solid #ea580c',
            width: '68px',
            height: '68px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            🔨
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: '#ea580c',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                letterSpacing: '0.5px'
              }}>
                STANDAR INDUSTRI PRESISI
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>SOP &amp; Mitigasi Bahaya Mekanik</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
              Kecakapan Dasar Perkakas Tangan Manual &amp; Mesin Portabel
            </h2>
            <p style={{ margin: '6px 0 0 0', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Pedoman teknis pengoperasian kikir presisi, gergaji besi, pahat tangan, tap &amp; snei, penitik, mesin bor meja, gerinda duduk, gerinda tangan, dan ragum mesin berstandar DUDI.
            </p>
          </div>
        </div>

        {/* Sub-kategori Navigasi */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'kikir_gergaji', label: '🪚 Kikir & Gergaji Besi', icon: '🪚' },
            { id: 'pahat_penandaan', label: '📐 Pahat, Penitik & Penggores', icon: '📐' },
            { id: 'tap_snei', label: '🔩 Tap & Snei (Ulir Presisi)', icon: '🔩' },
            { id: 'mesin_bor', label: '⚙️ Mesin Bor Meja', icon: '⚙️' },
            { id: 'gerinda_ragum', label: '✨ Gerinda Duduk & Ragum', icon: '✨' },
            { id: 'evaluasi_kuis', label: '📝 Uji Kompetensi Perkakas', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { sound.playClick(); setActiveCategory(tab.id); }}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: activeCategory === tab.id ? '#ea580c' : 'rgba(255,255,255,0.06)',
                color: activeCategory === tab.id ? '#ffffff' : '#94a3b8',
                border: activeCategory === tab.id ? '1px solid #fdba74' : '1px solid #334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          TAB 1: KIKIR & GERGAJI BESI
      ===================================================================== */}
      {activeCategory === 'kikir_gergaji' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card Kikir */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.6rem' }}>🗜️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  1. Kikir Presisi (Hand Files) &amp; Teknik Pengikiran
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Perkakas penyayat bram manual untuk perataan dan pembentukan dimensi</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #3b82f6' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a' }}>
                  A. Tingkat Kekasaran Guratan Kikir
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
                  <li><strong>Kikir Bastard (Kasar):</strong> Gigi renggang (10-14 gigi/cm), pemakanan material tebal diawal pengerjaan (&gt; 0.5 mm).</li>
                  <li><strong>Kikir Second Cut (Sedang):</strong> Gigi sedang (16-24 gigi/cm), mendekati batas toleransi ukuran (0.1 - 0.2 mm).</li>
                  <li><strong>Kikir Smooth / Dead Smooth (Halus):</strong> Gigi sangat rapat (30-40 gigi/cm), proses finishing, menghapus guratan kasar untuk mencapai kekasaran permukaan N6-N7.</li>
                </ul>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#065f46' }}>
                  B. Macam Bentuk Penampang Kikir
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
                  <li><strong>Kikir Plat (Flat):</strong> Meratakan bidang datar dan sudut 90° (siku).</li>
                  <li><strong>Kikir Segitiga (Triangular):</strong> Menyayat alur V sudut 60°, sudut lancip, dan gigi gergaji.</li>
                  <li><strong>Kikir Bulat (Round / Rat-tail):</strong> Membesarkan lubang bundar dan radius dalam.</li>
                  <li><strong>Kikir Setengah Bulat (Half Round):</strong> Memiliki sisi datar dan cembung untuk bidang cekung.</li>
                  <li><strong>Kikir Persegi (Square):</strong> Menghaluskan lubang pasak, alur spi, dan slot segi empat.</li>
                </ul>
              </div>
            </div>

            {/* SOP Posisi Tubuh & K3 */}
            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '18px', borderRadius: '12px', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span> SOP Ergonomi Kuda-Kuda &amp; Distribusi Gaya Dorong
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', fontSize: '0.85rem', color: '#78350f', lineHeight: 1.6 }}>
                <div>
                  <strong>Posisi Kaki:</strong> Kaki kiri maju membentuk sudut 30° ke arah ragum, kaki kanan di belakang sudut 75°. Jarak antar kaki selebar bahu agar stabil.
                </div>
                <div>
                  <strong>Dua Macam Ayunan:</strong>
                  <br />• <em>Cross Filing (Silang):</em> Menyilang 45° untuk memeriksa kerataan bidang.
                  <br />• <em>Draw Filing (Menarik):</em> Kikir dipegang melintang ditarik lurus untuk menghaluskan permukaan akhir.
                </div>
                <div>
                  <strong>K3 Tang Kikir:</strong> Wajib selalu memasang gagang kayu/plastik ber-cincin ferrule. DILARANG memukul kikir dengan palu karena baja kikir sangat getas (mudah meledak berkeping-keping).
                </div>
              </div>
            </div>

            {/* File Card Tip */}
            <div style={{ background: '#f1f5f9', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>🧹</span>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
                <strong>Perawatan File Card (Sikat Kikir):</strong> Bersihkan tatal tatal yang menyangkut di sela gigi (*pinning*) searah alur guratan kikir. Jika pinning dibiarkan, tatal akan membuat goresan parah (*scratch*) pada benda kerja presisi.
              </p>
            </div>
          </div>

          {/* Card Gergaji Besi */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.6rem' }}>🪚</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  2. Gergaji Besi Manual (Hacksaw) Sesuai SOP
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Pemotongan benda pejal dan profil dengan efisiensi mata potong</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, color: '#ea580c', marginBottom: '6px', fontSize: '0.9rem' }}>
                  📌 Arah Gigi &amp; Langkah Dorong
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  Mata gergaji <strong>WAJIB menghadap ke depan</strong> (menjauhi pemegang). Pemotongan hanya terjadi saat langkah <strong>MAJU</strong> (beri tekanan sedang). Pada langkah mundur, hilangkan tekanan agar gigi tidak tergerus tumpul.
                </p>
              </div>

              <div style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, color: '#0284c7', marginBottom: '6px', fontSize: '0.9rem' }}>
                  ⚙️ Standar TPI (Teeth Per Inch)
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  • <strong>14 - 18 TPI:</strong> Baja pejal lunak, tembaga, kuningan tebal.<br />
                  • <strong>24 TPI:</strong> Baja karbon sedang, pipa tebal, plat sedang.<br />
                  • <strong>32 TPI:</strong> Plat tipis &amp; pipa tipis (Aturan Emas: Minimal 3 gigi selalu kontak dengan logam).
                </p>
              </div>

              <div style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, color: '#16a34a', marginBottom: '6px', fontSize: '0.9rem' }}>
                  ⚡ Irama &amp; Kecepatan Langkah
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  Kecepatan ayunan ideal adalah <strong>40 hingga 50 langkah per menit</strong> dengan panjang langkah penuh (*full stroke*). Menggesek terlalu cepat (&gt; 60 langkah/menit) menimbulkan panas gesek tinggi yang melunakkan bilah baja gergaji.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: PAHAT, PENITIK & PENGGORES
      ===================================================================== */}
      {activeCategory === 'pahat_penandaan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📐</span> Perkakas Penandaan Presisi (Layout Tools) &amp; Pahat Dingin
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {/* Penggores */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>✒️</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Penggores (Scriber)</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                  Batang baja perkakas dengan ujung karbida tajam untuk melukis garis batas pada benda kerja yang telah dilumuri cairan layout (tinta tata letak / lak biru).
                </p>
                <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', color: '#0369a1' }}>
                  <strong>SOP:</strong> Pegang seperti pensil dengan kemiringan 15° - 20° condong mengikuti arah tarikan dan menempel rapat pada bilah penggaris baja. Tarik satu kali tarikan tegas agar garis tidak berbayang ganda.
                </div>
              </div>

              {/* Penitik Garis vs Penitik Pusat */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🎯</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Penitik Rintik (30-60°) vs Penitik Pusat (90°)</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                  Dua jenis penitik dengan kegunaan yang sangat berbeda secara geometris:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                  <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '6px', color: '#065f46' }}>
                    • <strong>Penitik Rintik (Prick Punch 30° - 60°):</strong> Menitik garis batas penandaan agar garis tidak hilang saat terhapus oli/pendingin.
                  </div>
                  <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '6px', color: '#92400e' }}>
                    • <strong>Penitik Pusat (Center Punch 90°):</strong> Membuat lesung pembimbing mata bor agar tidak bergeser (*drifting*) saat awal kontak.
                  </div>
                </div>
              </div>

              {/* Pahat Tangan & Bahaya Kepala Jamur */}
              <div style={{ gridColumn: '1 / -1', border: '1px solid #fecaca', borderRadius: '12px', padding: '18px', background: '#fef2f2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.3rem' }}>🚨</span>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#991b1b' }}>
                    Pahat Tangan (Cold Chisel) &amp; Bahaya Maut "Mushroom Head"
                  </h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.86rem', color: '#7f1d1d', lineHeight: 1.6 }}>
                  <div>
                    <strong>Sudut Pengasahan Pahat:</strong>
                    <br />• 60°: Baja lunak (St37 / Mild Steel).
                    <br />• 70°: Besi tuang / baja keras (tahan benturan kuat).
                    <br />• 45° - 50°: Aluminium &amp; tembaga lunak.
                  </div>
                  <div>
                    <strong>Mitigasi Bahaya Mushroom Head:</strong>
                    <br />Kepala pahat yang memipih dan retak seperti jamur harus <strong>SEGERA DIGERINDA CHAMFER</strong>. Serpihan logam retak ini dapat terpental secepat peluru saat dipukul palu dan menusuk leher atau bola mata operator!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: TAP & SNEI (ULIR MANUAL)
      ===================================================================== */}
      {activeCategory === 'tap_snei' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔩</span> Operasi Pengetapan (Tap) &amp; Penyneaian (Snei) Berstandar ISO
            </h3>

            {/* Teori Tap 1-2-3 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.9rem', marginBottom: '6px' }}>
                  1️⃣ Tap No. 1 (Taper Tap / Konis)
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                  Memiliki ketirusan panjang (8 - 10 ulir tirus). Berfungsi sebagai pembuat alur awal pemandu ulir agar posisi tap tegak lurus sempurna.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.9rem', marginBottom: '6px' }}>
                  2️⃣ Tap No. 2 (Plug Tap / Antara)
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                  Ketirusan sedang (3 - 5 ulir tirus). Berfungsi membentuk profil ulir secara lebih dalam dan presisi setelah jalur dibentuk Tap No. 1.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#d97706', fontSize: '0.9rem', marginBottom: '6px' }}>
                  3️⃣ Tap No. 3 (Bottoming Tap / Rata)
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                  Ketirusan sangat pendek (1 - 1.5 ulir). Digunakan untuk menyelesaikan ulir hingga mencapai dasar lubang buntu (*blind hole*).
                </p>
              </div>
            </div>

            {/* Interactive Tap Calculator */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>🧮</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#14532d' }}>
                    Kalkulator Diameter Mata Bor Lubang Tap (Formula: D_bor = D_nominal - Pitch)
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#15803d' }}>Pilih ukuran baut standar metrik untuk melihat rekomendasi bor dan SOP pengerjaan</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {Object.keys(TAP_DATA).map(size => (
                  <button
                    key={size}
                    onClick={() => { sound.playClick(); setTapSize(size); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: tapSize === size ? '#16a34a' : '#ffffff',
                      color: tapSize === size ? '#ffffff' : '#15803d',
                      border: '1px solid #86efac',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.88rem'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #dcfce7', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>UKURAN ULIR:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{tapSize} x {TAP_DATA[tapSize].pitch} mm</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>DIAMETER BOR TEORITIS:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>Ø {TAP_DATA[tapSize].drillDia} mm</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>REKOMENDASI MATA BOR:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>Ø {TAP_DATA[tapSize].standardDrill || TAP_DATA[tapSize].drillDia + ' mm'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TINGKAT TORSI PENGETAPAN:</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#d97706' }}>{TAP_DATA[tapSize].torque}</div>
                </div>
              </div>

              <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#166534', background: '#dcfce7', padding: '10px', borderRadius: '8px' }}>
                💡 <strong>Kaidah Putaran:</strong> Putar gagang tap 1 putaran maju searah jarum jam, lalu putar balik 1/2 putaran berlawanan jarum jam untuk <strong>memutus tatal spiral</strong>. Wajib lumasi dengan pelumas potong (*cutting oil*)!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: MESIN BOR MEJA
      ===================================================================== */}
      {activeCategory === 'mesin_bor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚙️</span> Mesin Bor Meja (Bench Drill Press) &amp; Mitigasi Bahaya Putaran
            </h3>

            {/* Aturan Emas K3 Bor Meja */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.92rem', marginBottom: '6px' }}>
                  🚨 LARANGAN MEMEGANG DENGAN TANGAN
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                  Benda kerja <strong>WAJIB dicekam di ragum mesin (vise)</strong> dan diikat baut ke meja bor. Jika dipegang tangan kosong, saat mata bor menembus pelat, benda kerja akan tersangkut dan berputar kencang memotong jari tangan!
                </p>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.92rem', marginBottom: '6px' }}>
                  🔑 KUNCI CHUCK HARUS SEGERA DICABUT
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                  Setelah mengganti mata bor, <strong>kunci chuck WAJIB langsung dicabut</strong>. Kunci chuck yang tertinggal akan terlontar keluar seperti peluru berkecepatan tinggi saat saklar dinyalakan.
                </p>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.92rem', marginBottom: '6px' }}>
                  🧤 DILARANG MEMAKAI SARUNG TANGAN
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                  Sarung tangan kain rajut dilarang keras! Serabut kain mudah ditarik alur heliks mata bor berputar dan langsung mematahkan tulang tangan sebelum mesin sempat dimatikan.
                </p>
              </div>
            </div>

            {/* Interactive RPM Calculator */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e40af' }}>
                    Kalkulator Putaran Spindel Bor (Rumus: n = 1000 × Cs / (π × d))
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#2563eb' }}>Hitung kecepatan putar optimal spindle untuk mencegah mata bor gosong atau tumpul mendadak</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '6px' }}>
                    Jenis Material Benda Kerja:
                  </label>
                  <select
                    value={drillMaterial}
                    onChange={(e) => { sound.playClick(); setDrillMaterial(e.target.value); }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #93c5fd', fontSize: '0.88rem', background: '#ffffff' }}
                  >
                    {Object.entries(CUTTING_SPEEDS).map(([key, data]) => (
                      <option key={key} value={key}>{data.name} (Cs: {data.cs} m/min)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '6px' }}>
                    Diameter Mata Bor: <strong style={{ color: '#ea580c' }}>Ø {drillDiameter} mm</strong>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="25"
                    step="0.5"
                    value={drillDiameter}
                    onChange={(e) => setDrillDiameter(e.target.value)}
                    style={{ width: '100%', accentColor: '#ea580c' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                    <span>Ø 3 mm (Putaran Tinggi)</span>
                    <span>Ø 14 mm</span>
                    <span>Ø 25 mm (Putaran Rendah)</span>
                  </div>
                </div>
              </div>

              {/* Output Result */}
              <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>REKOMENDASI PUTARAN (n):</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ea580c' }}>{calculatedRpm} RPM</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>KECEPATAN POTONG (Cs):</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e40af' }}>{CUTTING_SPEEDS[drillMaterial].cs} m/menit</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>REKOMENDASI PENDINGIN:</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>{CUTTING_SPEEDS[drillMaterial].coolant}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: GERINDA DUDUK, GERINDA TANGAN & RAGUM
      ===================================================================== */}
      {activeCategory === 'gerinda_ragum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Gerinda Duduk */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✨</span> Mesin Gerinda Duduk (Bench Grinder) &amp; Pedoman K3 Kritis
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div style={{ border: '2px solid #fdba74', background: '#fffaf5', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, color: '#c2410c', fontSize: '0.95rem', marginBottom: '6px' }}>
                  📏 Jarak Tool Rest Maksimal 2 - 3 mm
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#431407', lineHeight: 1.6 }}>
                  Jarak antara landasan kerja (*tool rest*) dan permukaan batu gerinda <strong>TIDAK BOLEH lebih dari 2 s/d 3 mm</strong>. Jika celah longgar, benda kerja kecil dapat tertarik ke dalam celah dan memecahkan batu gerinda berkeping-keping!
                </p>
              </div>

              <div style={{ border: '2px solid #fdba74', background: '#fffaf5', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, color: '#c2410c', fontSize: '0.95rem', marginBottom: '6px' }}>
                  🔔 Uji Dering (Ring Test) Sebelum Pasang
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#431407', lineHeight: 1.6 }}>
                  Ketuk ringan batu gerinda dengan gagang obeng kayu/plastik. Batu yang mulus akan menghasilkan <strong>suara denting nyaring (seperti lonceng)</strong>. Jika bersuara tumpul atau redup, batu retak internal dan DILARANG DIPASANG!
                </p>
              </div>

              <div style={{ border: '2px solid #fdba74', background: '#fffaf5', padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 800, color: '#c2410c', fontSize: '0.95rem', marginBottom: '6px' }}>
                  🚫 Larangan Mengasah Sisi Samping Batu
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#431407', lineHeight: 1.6 }}>
                  Hanya asah pada <strong>muka lingkar luar (perimeter)</strong>. Mengasah pada bidang samping tipis batu gerinda lurus dapat menyebabkan retakan tegak lurus yang memecahkan batu saat berputar 3800 RPM.
                </p>
              </div>
            </div>

            {/* Spark Deflector */}
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', color: '#334155' }}>
              🛡️ <strong>Spark Deflector (Pelindung Percikan Bunga Api):</strong> Jarak pelat penyerap percikan atas maksimal <strong>1.5 mm</strong> dari batu gerinda. Kaca pelindung mata (*eye shield*) transparan wajib selalu bersih.
            </div>
          </div>

          {/* Gerinda Tangan & Ragum Mesin */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Angle Grinder */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚡</span> Gerinda Tangan (Angle Grinder)
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                <li><strong>Wheel Guard:</strong> Pelindung penutup wajib terpasang dan menghadap ke arah tubuh operator.</li>
                <li><strong>Rating RPM Batu:</strong> RPM maksimum yang tertera di batu gerinda wajib <strong>lebih besar atau sama dengan</strong> RPM mesin (RPM batu ≥ RPM mesin).</li>
                <li><strong>Pegang Dua Tangan:</strong> Selalu gunakan kedua tangan untuk menahan gaya sentakan (*kickback*) mendadak.</li>
                <li><strong>Arah Percikan:</strong> Arahkan percikan menjauhi kabel listrik dan rekan kerja lain.</li>
              </ul>
            </div>

            {/* Ragum Mesin & Soft Jaws */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🗜️</span> Ragum Mesin &amp; Penggunaan Soft Jaws
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                <li><strong>Soft Jaws (Rahang Lunak):</strong> Gunakan pelat aluminium, tembaga, atau timbal saat menjepit benda kerja yang permukaannya sudah di-finishing agar tidak berbekas guratan rahang baja keras.</li>
                <li><strong>Pencekaman Seimbang:</strong> Benda kerja dicekam serendah mungkin ke permukaan ragum untuk meredam getaran (*chatter*).</li>
                <li><strong>Larangan Palu:</strong> Dilarang memukul tuas handle ragum dengan palu untuk mengencangkan! Gunakan kekuatan tangan saja.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: UJI KOMPETENSI PERKAKAS (KUIS INTERAKTIF)
      ===================================================================== */}
      {activeCategory === 'evaluasi_kuis' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          {!quizCompleted ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1'
                }}>
                  SOAL #{quizIndex + 1} / {BENCH_QUIZ.length}
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ea580c' }}>
                  SKOR SEMENTARA: {quizScore} / 100 XP
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px', lineHeight: 1.5 }}>
                {BENCH_QUIZ[quizIndex].q}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {BENCH_QUIZ[quizIndex].options.map((opt, idx) => {
                  let btnBg = '#f8fafc';
                  let btnBorder = '#cbd5e1';
                  let btnColor = '#1e293b';

                  if (isAnswered) {
                    if (idx === BENCH_QUIZ[quizIndex].correct) {
                      btnBg = '#dcfce7';
                      btnBorder = '#22c55e';
                      btnColor = '#15803d';
                    } else if (idx === selectedAnswer) {
                      btnBg = '#fee2e2';
                      btnBorder = '#ef4444';
                      btnColor = '#b91c1c';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      disabled={isAnswered}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '10px',
                        background: btnBg,
                        border: `2px solid ${btnBorder}`,
                        color: btnColor,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        textAlign: 'left',
                        cursor: isAnswered ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div style={{
                  background: selectedAnswer === BENCH_QUIZ[quizIndex].correct ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${selectedAnswer === BENCH_QUIZ[quizIndex].correct ? '#86efac' : '#fca5a5'}`,
                  padding: '16px',
                  borderRadius: '10px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    fontWeight: 800,
                    color: selectedAnswer === BENCH_QUIZ[quizIndex].correct ? '#16a34a' : '#dc2626',
                    fontSize: '0.95rem',
                    marginBottom: '4px'
                  }}>
                    {selectedAnswer === BENCH_QUIZ[quizIndex].correct ? '✅ JAWABAN BENAR (+10 XP)' : '❌ JAWABAN KURANG TEPAT'}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: 1.5 }}>
                    {BENCH_QUIZ[quizIndex].expl}
                  </p>
                </div>
              )}

              {isAnswered && (
                <button
                  onClick={handleNextQuiz}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {quizIndex < BENCH_QUIZ.length - 1 ? 'Soal Berikutnya ➔' : 'Selesaikan & Kirim Nilai ke Spreadsheet ➔'}
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🏆</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                Uji Kompetensi Perkakas Selesai!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
                Nilai Anda telah otomatis tersinkronisasi ke Gradebook Guru dan Google Spreadsheet.
              </p>
              <div style={{
                display: 'inline-block',
                background: '#ecfdf5',
                border: '2px solid #10b981',
                padding: '16px 36px',
                borderRadius: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 800 }}>SKOR AKHIR ANDA:</div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#047857' }}>{quizScore} <span style={{ fontSize: '1rem' }}>/ 100</span></div>
              </div>
              <div>
                <button
                  onClick={handleResetQuiz}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Ulangi Kuis Perkakas
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

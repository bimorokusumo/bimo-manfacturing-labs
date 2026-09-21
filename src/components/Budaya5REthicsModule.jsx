import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { recordQuizResult } from '../services/sheetService';

const AUDIT_CRITERIA = [
  {
    id: 'c1',
    pillar: 'RINGKAS (Seiri)',
    title: 'Pemisahan Benda & Material',
    description: 'Meja mesin dan lantai bebas dari benda kerja reject, material sisa, atau perkakas yang tidak digunakan saat ini.',
    maxScore: 10
  },
  {
    id: 'c2',
    pillar: 'RINGKAS (Seiri)',
    title: 'Penerapan Red Tag (Label Karantina)',
    description: 'Peralatan ukur rusak (misal jangka sorong bengkok) telah diberi label merah dan ditarik dari meja kerja ke ruang toolroom.',
    maxScore: 10
  },
  {
    id: 'c3',
    pillar: 'RAPI (Seiton)',
    title: 'Papan Bayangan (Shadow Board) & Tempat Perkakas',
    description: 'Kunci chuck, pahat bubut, kikir, dan palu tertata presisi pada siluet bayangannya di panel alat (*Aturan 30 Detik*).',
    maxScore: 10
  },
  {
    id: 'c4',
    pillar: 'RAPI (Seiton)',
    title: 'Garis Demarkasi Lantai & Lorong Kerja',
    description: 'Jalur pejalan kaki (garis hijau/putih) dan batas area bahaya mesin (kuning/hitam) bebas dari rintangan barang sekecil apa pun.',
    maxScore: 10
  },
  {
    id: 'c5',
    pillar: 'RESIK (Seiso)',
    title: 'Kebersihan Bed Mesin & Bak Penampung Tatal',
    description: 'Eretan dan alur luncur (*ways*) mesin bersih dari tatal gram tajam; tidak ada tumpahan oli pelumas di lantai.',
    maxScore: 10
  },
  {
    id: 'c6',
    pillar: 'RESIK (Seiso)',
    title: 'Pembersihan Sebagai Sarana Inspeksi',
    description: 'Siswa memeriksa kebocoran oli, baut pengikat ragum yang longgar, atau keausan belt motor saat membersihkan mesin.',
    maxScore: 10
  },
  {
    id: 'c7',
    pillar: 'RAWAT (Seiketsu)',
    title: 'Standarisasi Visual & Label Pelabelan Mesin',
    description: 'Instruksi kerja SOP, tabel putaran RPM, dan label tuas pemindah kecepatan mesin terbaca jelas tanpa coretan.',
    maxScore: 10
  },
  {
    id: 'c8',
    pillar: 'RAWAT (Seiketsu)',
    title: 'Log Checklist Pemeliharaan Harian',
    description: 'Formulir checklist pelumasan harian (oli slideway) terisi dan ditandatangani oleh operator praktikan.',
    maxScore: 10
  },
  {
    id: 'c9',
    pillar: 'RAJIN (Shitsuke)',
    title: 'Kepatuhan Pemakaian APD Tanpa Pengawasan',
    description: 'Seluruh praktikan mengenakan kacamata safety, wearpack rapi, dan sepatu safety sejak awal masuk bengkel.',
    maxScore: 10
  },
  {
    id: 'c10',
    pillar: 'RAJIN (Shitsuke)',
    title: 'Disiplin Waktu & Briefing (Toolbox Meeting)',
    description: 'Praktikan mengikuti briefing 5 menit sebelum praktik, merapikan bengkel 10 menit sebelum jam usai, dan tertib antrean.',
    maxScore: 10
  }
];

export default function Budaya5REthicsModule() {
  const [activeTab, setActiveTab] = useState('prinsip_5r');
  
  // State Audit 5R
  const [auditScores, setAuditScores] = useState({
    c1: 10, c2: 8, c3: 10, c4: 9, c5: 8,
    c6: 9, c7: 10, c8: 9, c9: 10, c10: 10
  });
  const [auditSubmitted, setAuditSubmitted] = useState(false);

  const totalAuditScore = Object.values(auditScores).reduce((a, b) => a + b, 0);
  const auditPercentage = Math.round((totalAuditScore / 100) * 100);

  // State Kuis Refleksi 5R
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [show5RReflection, setShow5RReflection] = useState(false);
  const [score5R, setScore5R] = useState(0);

  const questions5R = [
    {
      question: 'Memisahkan peralatan yang masih dipakai dan menyingkirkan barang bekas/rusak di meja mesin bubut adalah prinsip...',
      options: ['RINGKAS (Seiri)', 'RAPI (Seiton)', 'RESIK (Seiso)', 'RAJIN (Shitsuke)'],
      answer: 'RINGKAS (Seiri)',
      reflectionWrong: 'REFLEKSI KESALAHAN: Memisahkan barang yang perlu dan tidak perlu adalah kunci utama RINGKAS (Seiri).',
      reflectionCorrect: 'REFLEKSI BENAR: Tepat! RINGKAS (Seiri) bertujuan menyingkirkan barang yang tidak diperlukan dari area kerja.'
    },
    {
      question: 'Menata pahat bubut dan Kunci Chuck pada papan panel berbintik (toolboard) sesuai posisinya merupakan contoh...',
      options: ['RAPI (Seiton)', 'RINGKAS (Seiri)', 'RAWAT (Seiketsu)', 'RESIK (Seiso)'],
      answer: 'RAPI (Seiton)',
      reflectionWrong: 'REFLEKSI KESALAHAN: Meletakkan perkakas pada tempatnya agar mudah ditemukan adalah RAPI (Seiton).',
      reflectionCorrect: 'REFLEKSI BENAR: Mantap! RAPI (Seiton) menghilangkan waktu terbuang untuk mencari-cari perkakas.'
    },
    {
      question: 'Membersihkan tatal gram sisa pembubutan dari bed mesin dan menyapu lantai kerja setiap akhir jam praktik adalah prinsip...',
      options: ['RESIK (Seiso)', 'RAPI (Seiton)', 'RINGKAS (Seiri)', 'RAJIN (Shitsuke)'],
      answer: 'RESIK (Seiso)',
      reflectionWrong: 'REFLEKSI KESALAHAN: Menjaga kebersihan mesin dan lantai dari tatal tajam adalah prinsip RESIK (Seiso).',
      reflectionCorrect: 'REFLEKSI BENAR: Sempurna! RESIK (Seiso) mencegah mesin macet dan lantai licin akibat tumpahan coolant.'
    },
    {
      question: 'Mempertahankan standar kebersihan dan kerapian dengan membuat checklist harian perawatan berkala adalah...',
      options: ['RAWAT (Seiketsu)', 'RESIK (Seiso)', 'RAPI (Seiton)', 'RINGKAS (Seiri)'],
      answer: 'RAWAT (Seiketsu)',
      reflectionWrong: 'REFLEKSI KESALAHAN: Menstandarkan dan memelihara 3R sebelumnya adalah RAWAT (Seiketsu).',
      reflectionCorrect: 'REFLEKSI BENAR: Tepat! RAWAT (Seiketsu) memastikan 3R sebelumnya menjadi kebiasaan tetap.'
    },
    {
      question: 'Membiasakan diri selalu mematuhi SOP K3 dan memakai APD lengkap tanpa harus diawasi guru atau instruktur adalah...',
      options: ['RAJIN (Shitsuke)', 'RAWAT (Seiketsu)', 'RESIK (Seiso)', 'RINGKAS (Seiri)'],
      answer: 'RAJIN (Shitsuke)',
      reflectionWrong: 'REFLEKSI KESALAHAN: Kedisiplinan diri menjalankan K3 secara konsisten adalah RAJIN (Shitsuke).',
      reflectionCorrect: 'REFLEKSI BENAR: Luar biasa! RAJIN (Shitsuke) adalah pembentukan karakter disiplin industri sejati.'
    }
  ];

  const handle5RAnswer = (opt) => {
    sound.playClick();
    setSelectedOpt(opt);
    setShow5RReflection(true);
    const isCorrect = opt === questions5R[quizIndex].answer;
    const newScore = isCorrect ? score5R + 20 : score5R;
    if (isCorrect) {
      setScore5R(newScore);
      sound.playSuccess();
    } else {
      sound.playError();
    }

    if (quizIndex === questions5R.length - 1) {
      recordQuizResult({
        modul: 'Safety Lab - Budaya Kerja 5R',
        judulKuis: 'Kuis Refleksi Pemahaman Budaya Industri 5R',
        skor: newScore,
        jawabanBenar: Math.round(newScore / 20),
        totalSoal: questions5R.length,
        detailJawaban: `Kuis Refleksi 5R: Skor ${newScore}/100.`
      });
    }
  };

  const handleScoreChange = (id, val) => {
    sound.playClick();
    setAuditScores(prev => ({ ...prev, [id]: Number(val) }));
    if (auditSubmitted) setAuditSubmitted(false);
  };

  const submitAudit = () => {
    sound.playSuccess();
    setAuditSubmitted(true);

    recordQuizResult({
      modul: 'Safety Lab - Budaya Kerja 5R',
      judulKuis: 'Audit Kepatuhan 5R Bengkel Mesin Berstandar DUDI',
      skor: auditPercentage,
      jawabanBenar: totalAuditScore,
      totalSoal: 100,
      detailJawaban: `Hasil Audit 5R: Skor ${totalAuditScore}/100 (${auditPercentage}%). Predikat: ${auditPercentage >= 90 ? 'Ekselen / Astra Toyota Standard' : (auditPercentage >= 75 ? 'Baik / Sesuai Standar' : 'Perlu Perbaikan')}`
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SUB-NAV */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#f8fafc', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        {[
          { id: 'prinsip_5r', label: '📌 Prinsip Budaya Industri 5R / 5S', icon: '🧹' },
          { id: 'audit_5r', label: '📋 Form Audit 5R Bengkel Mesin (DUDI)', icon: '📊' },
          { id: 'etika_kerja', label: '⭐ Etika Kerja Profesional Teknisi', icon: '🤝' },
          { id: 'kuis_refleksi', label: '❓ Kuis Refleksi 5R', icon: '❓' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { sound.playClick(); setActiveTab(tab.id); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? '#ea580c' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#334155',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* =====================================================================
          TAB 1: PRINSIP 5R LENGKAP
      ===================================================================== */}
      {activeTab === 'prinsip_5r' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dashboard-card" style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.8rem', background: '#ffedd5', padding: '8px', borderRadius: '10px' }}>🇯🇵</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  Penerapan Budaya Kerja Industri 5R (5S Toyota Production System)
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Filosofi dasar efisiensi, eliminasi pemborosan (*Muda*), dan standarisasi bengkel manufaktur kelas dunia
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. RINGKAS */}
              <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#b91c1c' }}>1. RINGKAS (Seiri - 整理)</h4>
                  <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>Pilah &amp; Buang</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Memisahkan secara tegas antara barang yang <strong>diperlukan</strong> dan barang yang <strong>tidak diperlukan</strong>. Singkirkan benda kerja rusak, serpihan logam sisa, dan perkakas afkir dari workstation pemesinan.
                </p>
                <div style={{ marginTop: '10px', padding: '8px', borderRadius: '6px', background: '#fff', border: '1px dashed #ef4444', fontSize: '0.75rem', color: '#7f1d1d' }}>
                  💡 <strong>Metode Red Tag (Label Merah):</strong> Tempelkan kertas merah bertuliskan tanggal pada benda yang ragu-ragu. Jika dalam 30 hari tidak disentuh, segera pindahkan ke gudang rongsok (*scrap yard*).
                </div>
              </div>

              {/* 2. RAPI */}
              <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#b45309' }}>2. RAPI (Seiton - 整頓)</h4>
                  <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>Tata &amp; Label</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Menata barang-barang yang diperlukan agar mudah diambil, mudah digunakan, dan mudah dikembalikan ke tempat semula (*A place for everything and everything in its place*).
                </p>
                <div style={{ marginTop: '10px', padding: '8px', borderRadius: '6px', background: '#fff', border: '1px dashed #f59e0b', fontSize: '0.75rem', color: '#78350f' }}>
                  💡 <strong>Aturan 30 Detik &amp; Shadow Board:</strong> Setiap kikir, mistar baja, atau kunci pas harus dapat ditemukan dan dikembalikan dalam waktu kurang dari 30 detik berkat papan bayangan siluet alat.
                </div>
              </div>

              {/* 3. RESIK */}
              <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#047857' }}>3. RESIK (Seiso - 清掃)</h4>
                  <span style={{ fontSize: '0.7rem', background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>Bersih &amp; Periksa</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Membersihkan lingkungan kerja, mesin, perkakas, dan lantai dari debu, tatal gram tajam, dan ceceran pelumas. <strong>Membersihkan adalah bentuk awal inspeksi mesin!</strong>
                </p>
                <div style={{ marginTop: '10px', padding: '8px', borderRadius: '6px', background: '#fff', border: '1px dashed #10b981', fontSize: '0.75rem', color: '#064e3b' }}>
                  💡 <strong>Makna Seiso:</strong> Saat menyapu eretan mesin bubut, mata teknisi mengamati apakah ada baut longgar, getaran tidak wajar, atau keausan parah pada permukaan eretan.
                </div>
              </div>

              {/* 4. RAWAT */}
              <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', borderLeft: '4px solid #0284c7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#0369a1' }}>4. RAWAT (Seiketsu - 清潔)</h4>
                  <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#075985', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>Standarisasi</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Mempertahankan dan menstandarkan kondisi Ringkas, Rapi, dan Resik yang telah dicapai melalui pembagian tugas harian, checklist kontrol visual, dan rambu warna lantai.
                </p>
                <div style={{ marginTop: '10px', padding: '8px', borderRadius: '6px', background: '#fff', border: '1px dashed #0284c7', fontSize: '0.75rem', color: '#0c4a6e' }}>
                  💡 <strong>Visual Management:</strong> Menggunakan garis batas demarkasi lantai (Kuning = area bahaya mesin, Hijau = jalur aman pejalan kaki, Merah = zona tabung APAR/panel).
                </div>
              </div>

              {/* 5. RAJIN */}
              <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#6d28d9' }}>5. RAJIN (Shitsuke - 躾)</h4>
                  <span style={{ fontSize: '0.7rem', background: '#ede9fe', color: '#5b21b6', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>Disiplin Diri</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Membangun kesadaran dan kebiasaan (*habit*) untuk mematuhi seluruh aturan kerja bengkel secara mandiri tanpa harus selalu disuruh atau diawasi instruktur.
                </p>
                <div style={{ marginTop: '10px', padding: '8px', borderRadius: '6px', background: '#fff', border: '1px dashed #8b5cf6', fontSize: '0.75rem', color: '#4c1d95' }}>
                  💡 <strong>Karakter Vokasi:</strong> Budaya memakai APD, menjaga ketertiban, hadir tepat waktu sebelum bel berbunyi, dan saling mengingatkan keselamatan kerja rekan satu tim.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: FORMULIR AUDIT 5R BENGKEL MESIN (DUDI)
      ===================================================================== */}
      {activeTab === 'audit_5r' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dashboard-card" style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  Lembar Evaluasi &amp; Audit Budaya Kerja 5R Bengkel Pemesinan
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Instrumen asesmen mandiri kesiapan fasilitas dan kedisiplinan kerja bangku sesuai standar industri manufaktur
                </p>
              </div>

              {/* Live Score Badge */}
              <div style={{
                background: auditPercentage >= 90 ? '#dcfce7' : (auditPercentage >= 75 ? '#fef3c7' : '#fee2e2'),
                border: `2px solid ${auditPercentage >= 90 ? '#16a34a' : (auditPercentage >= 75 ? '#f59e0b' : '#dc2626')}`,
                padding: '8px 18px',
                borderRadius: '12px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>SKOR AUDIT 5R:</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: auditPercentage >= 90 ? '#15803d' : (auditPercentage >= 75 ? '#b45309' : '#b91c1c') }}>
                  {totalAuditScore} / 100 ({auditPercentage}%)
                </div>
              </div>
            </div>

            {/* TABEL 10 POIN AUDIT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {AUDIT_CRITERIA.map((crit, idx) => {
                const currentVal = auditScores[crit.id] || 0;
                return (
                  <div key={crit.id} style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}>
                    <div style={{ maxWidth: '650px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
                          {crit.pillar}
                        </span>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{idx + 1}. {crit.title}</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
                        {crit.description}
                      </div>
                    </div>

                    {/* Skala Penilaian 0-10 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={currentVal}
                        onChange={(e) => handleScoreChange(crit.id, e.target.value)}
                        style={{ width: '110px', cursor: 'pointer' }}
                      />
                      <span style={{
                        minWidth: '42px',
                        textAlign: 'center',
                        fontWeight: 900,
                        fontSize: '0.95rem',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: currentVal >= 9 ? '#dcfce7' : (currentVal >= 7 ? '#fef3c7' : '#fee2e2'),
                        color: currentVal >= 9 ? '#15803d' : (currentVal >= 7 ? '#b45309' : '#b91c1c')
                      }}>
                        {currentVal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HASIL & PREDIKAT */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  Predikat Kesiapan Budaya DUDI:
                </div>
                <div style={{ fontSize: '0.82rem', color: auditPercentage >= 90 ? '#15803d' : (auditPercentage >= 75 ? '#b45309' : '#b91c1c'), fontWeight: 700, marginTop: '2px' }}>
                  {auditPercentage >= 90
                    ? '⭐ KELAS DUNIA (Memenuhi Standar Kerapian Astra Daihatsu & Toyota Tsusho)'
                    : (auditPercentage >= 75 ? '✓ MEMADAI (Standar Bengkel Vokasi SMK Terakreditasi A)' : '⚠️ RAWAN (Banyak potensi kecelakaan kerja & waktu terbuang)')}
                </div>
              </div>

              <button
                onClick={submitAudit}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>💾 Simpan &amp; Catat Audit ke Spreadsheet Guru</span>
                <span>📤</span>
              </button>
            </div>

            {auditSubmitted && (
              <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', fontWeight: 700, fontSize: '0.85rem' }}>
                ✅ Skor Audit 5R Bengkel ({auditPercentage}%) Berhasil Disimpan &amp; Direkam ke Rekap Nilai Guru!
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: ETIKA KERJA PROFESIONAL TEKNISI MESIN
      ===================================================================== */}
      {activeTab === 'etika_kerja' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dashboard-card" style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              Etika Kerja Profesional &amp; Sikap Kerja Teknisi Mesin DUDI
            </h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '0.82rem', color: '#64748b' }}>
              Nilai integritas, moralitas teknis, dan tanggung jawab seorang juru mesin (*machinist*) dalam ekosistem industri modern
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '18px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#166534' }}>
                  📏 1. Integritas Pengukuran Toleransi
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#14532d', lineHeight: 1.6, margin: 0 }}>
                  <strong>Dilarang keras memalsukan hasil ukur (*data falsification*)!</strong> Jika diameter poros hasil bubut lebih kecil dari batas bawah toleransi gambar kerja (undersize), teknisi yang beretika akan mengakuinya secara jujur kepada Quality Control (QC). Kejujuran ini mencegah perakitan part cacat yang bisa menyebabkan kegagalan mesin fatal di tangan konsumen.
                </p>
              </div>

              <div style={{ padding: '18px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#1e40af' }}>
                  🧰 2. Menghargai &amp; Menjaga Peralatan Bersama
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.6, margin: 0 }}>
                  Perkakas presisi seperti mikrometer sekrup dan jangka sorong dial tidak boleh diletakkan bertumpuk dengan palu atau kikir baja. Teknisi wajib mengelap alat ukur dari oli pendingin sebelum disimpan di kotaknya, serta menyisakan celah 0.5 mm pada rahang mikrometer agar tidak memuai.
                </p>
              </div>

              <div style={{ padding: '18px', borderRadius: '12px', background: '#fefce8', border: '1px solid #fef08a' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#854d0e' }}>
                  🤝 3. Budaya Saling Menjaga (*Brother's Keeper*)
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#713f12', lineHeight: 1.6, margin: 0 }}>
                  Di bengkel industri, keselamatan Anda adalah keselamatan tim. Jika melihat rekan praktikan menyalakan mesin bubut tanpa memakai kacamata safety atau lupa mencabut kunci chuck, <strong>wajib segera ditegur dengan santun dan tegas demi menyelamatkan nyawanya</strong>.
                </p>
              </div>

              <div style={{ padding: '18px', borderRadius: '12px', background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#6b21a8' }}>
                  ⏱️ 4. Efisiensi Waktu &amp; Bebas Distraksi
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#581c87', lineHeight: 1.6, margin: 0 }}>
                  Zona kerja bengkel adalah area berisiko tinggi. Penggunaan telepon genggam (smartphone) untuk urusan pribadi saat mesin berputar adalah pelanggaran etika berat. Fokus penuh pada mata pahat dan suara putaran mesin adalah ciri teknisi profesional.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KUIS REFLEKSI 5R */}
      {activeTab === 'kuis_refleksi' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <span style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem' }}>
              SOAL 5R #{quizIndex + 1} / {questions5R.length}
            </span>
            <span style={{ fontWeight: 800, color: '#ea580c', fontSize: '1rem' }}>
              [ SKOR: {score5R} / 100 XP ]
            </span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.5, color: '#0f172a' }}>
            {questions5R[quizIndex].question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {questions5R[quizIndex].options.map((opt, idx) => (
              <button
                key={idx}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#1e293b',
                  cursor: show5RReflection ? 'default' : 'pointer'
                }}
                onClick={() => handle5RAnswer(opt)}
                disabled={show5RReflection}
              >
                {opt}
              </button>
            ))}
          </div>

          {show5RReflection && (
            <div style={{
              padding: '16px 20px',
              borderRadius: '10px',
              background: selectedOpt === questions5R[quizIndex].answer ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${selectedOpt === questions5R[quizIndex].answer ? '#86efac' : '#fca5a5'}`
            }}>
              <h4 style={{
                fontWeight: 800,
                fontSize: '1.05rem',
                marginBottom: '8px',
                color: selectedOpt === questions5R[quizIndex].answer ? '#065f46' : '#991b1b'
              }}>
                {selectedOpt === questions5R[quizIndex].answer ? '✅ JAWABAN BENAR (+20 XP)' : '❌ REFLEKSI KESALAHAN'}
              </h4>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155', lineHeight: 1.6, margin: 0 }}>
                {selectedOpt === questions5R[quizIndex].answer ? questions5R[quizIndex].reflectionCorrect : questions5R[quizIndex].reflectionWrong}
              </p>

              {quizIndex < questions5R.length - 1 ? (
                <button
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px',
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    sound.playClick();
                    setShow5RReflection(false);
                    setQuizIndex(quizIndex + 1);
                  }}
                >
                  Lanjut Soal Berikutnya →
                </button>
              ) : (
                <div style={{ marginTop: '16px', padding: '12px', background: '#ecfdf5', borderRadius: '8px', color: '#065f46', fontWeight: 800, textAlign: 'center' }}>
                  🎉 Selamat! Kamu telah menyelesaikan kuis Budaya Kerja 5R dengan total skor {score5R} XP! (Tersinkron ke Spreadsheet)
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

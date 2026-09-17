import React, { useState } from 'react';
import { sound } from '../utils/audio';

const QUESTIONS = [
  {
    id: 1,
    topic: 'Standarisasi Garis (ISO 128)',
    question: 'Garis yang digunakan untuk menunjukkan garis sumbu simetri benda silinder dan lingkaran pusat menurut standar ISO 128 adalah...',
    options: [
      'Garis tipis kontinu (Tipe B)',
      'Garis gores titik tipis (Tipe G)',
      'Garis gores tipis / putus-putus (Tipe F)',
      'Garis tebal kontinu (Tipe A)'
    ],
    answer: 'Garis gores titik tipis (Tipe G)',
    explanation: 'Garis sumbu simetri, lingkaran jarak gigi roda gigi, dan lintasan benda mekanis wajib menggunakan Garis Gores Titik Tipis (Tipe G) dengan rasio goresan panjang 10-15 mm dan titik dipisahkan celah 1 mm.'
  },
  {
    id: 2,
    topic: 'Proyeksi Ortogonal',
    question: 'Pada sistem Proyeksi Amerika (Sudut Ketiga / Third-Angle Projection), letak Pandangan Atas (Top View) diposisikan di...',
    options: [
      'Bawah Pandangan Depan',
      'Atas Pandangan Depan',
      'Kanan Pandangan Depan',
      'Kiri Pandangan Depan'
    ],
    answer: 'Atas Pandangan Depan',
    explanation: 'Pada Proyeksi Amerika (kuadran III), bidang proyeksi berada di antara pengamat dan benda (seperti kotak kaca). Pandangan Atas diletakkan di ATAS pandangan depan, dan Pandangan Kanan di KANAN pandangan depan.'
  },
  {
    id: 3,
    topic: 'Standarisasi Kertas (ISO 216)',
    question: 'Berapa lebar batas garis tepi (margin) sisi KIRI yang wajib disisakan pada seluruh ukuran kertas gambar standar (A0 hingga A4)?',
    options: [
      '5 mm',
      '10 mm',
      '15 mm',
      '20 mm'
    ],
    answer: '20 mm',
    explanation: 'Sisi kiri kertas gambar wajib disisakan selebar 20 mm pada semua ukuran format (A0-A4) untuk kebutuhan penjilidan (filing/binding) agar tidak ada garis gambar teknis yang tertutup lubang binder.'
  },
  {
    id: 4,
    topic: 'Aturan Penunjukan Ukuran (ISO 129)',
    question: 'Berapakah jarak minimal penempatan garis ukur pertama dari kontur tepi benda kerja sesuai standar ISO 129?',
    options: [
      'Minimal 5 mm',
      'Minimal 7 mm',
      'Minimal 10 mm',
      'Minimal 15 mm'
    ],
    answer: 'Minimal 10 mm',
    explanation: 'Sesuai aturan ISO 129, jarak garis ukur pertama dari tepi benda minimal 10 mm. Sedangkan jarak antar garis ukur paralel berikutnya minimal 7 mm.'
  },
  {
    id: 5,
    topic: 'Standarisasi Huruf & Angka (ISO 3098)',
    question: 'Jika tinggi nominal huruf kapital (h) yang digunakan pada gambar adalah 10 mm, berapakah ketebalan garis huruf (d) standar untuk Tipe B?',
    options: [
      '0.5 mm',
      '0.7 mm',
      '1.0 mm',
      '1.4 mm'
    ],
    answer: '1.0 mm',
    explanation: 'Untuk huruf Tipe B standar (tegak 90°), tebal garis huruf dirumuskan sebagai d = (1/10) × h = 0.1 × 10 mm = 1.0 mm.'
  },
  {
    id: 6,
    topic: 'Simbol Proyeksi (ISO 5456-2)',
    question: 'Berdasarkan standar ISO 5456-2, ciri khas bentuk geometris simbol resmi Proyeksi Amerika (Sudut Ketiga) pada etiket gambar adalah...',
    options: [
      'Dua lingkaran sepusat di KIRI, trapesium di KANAN (sisi kecil menghadap lingkaran)',
      'Trapesium di KIRI, dua lingkaran sepusat di KANAN',
      'Dua segitiga sama kaki saling berhadapan pada garis sumbu',
      'Dua lingkaran sepusat di KANAN dengan tanda panah ke kiri'
    ],
    answer: 'Dua lingkaran sepusat di KIRI, trapesium di KANAN (sisi kecil menghadap lingkaran)',
    explanation: 'Standar ISO 5456-2 menetapkan bahwa simbol Proyeksi Amerika (Third-Angle) memiliki dua lingkaran sepusat di sebelah KIRI dan trapesium kerucut terpancung di sebelah KANAN dengan diameter kecil menghadap lingkaran. Sedangkan Proyeksi Eropa (First-Angle) meletakkan trapesium di kiri dan dua lingkaran di kanan.'
  },
  {
    id: 7,
    topic: 'Simbol Khusus Dimensi',
    question: 'Simbol yang digunakan untuk menunjukkan ukuran diameter poros silinder lingkaran penuh pada gambar kerja adalah...',
    options: [
      'R',
      '⌀',
      '□',
      'SR'
    ],
    answer: '⌀',
    explanation: 'Simbol ⌀ (diameter) dicantumkan di depan angka nominal (contoh: ⌀25). Simbol R digunakan untuk radius (jari-jari), dan □ untuk penampang bujur sangkar.'
  },
  {
    id: 8,
    topic: 'Prioritas Garis Berimpit',
    question: 'Jika pada suatu gambar terjadi garis nyata/tampak (Tipe A) berimpit dengan garis sumbu (Tipe G) di posisi yang sama, garis manakah yang wajib digambar?',
    options: [
      'Garis nyata/tampak (Tipe A)',
      'Garis sumbu (Tipe G)',
      'Keduanya digambar berdampingan',
      'Garis gores tipis terhalang (Tipe F)'
    ],
    answer: 'Garis nyata/tampak (Tipe A)',
    explanation: 'Berdasarkan urutan prioritas garis ISO (Line Precedence), garis nyata/tampak memiliki prioritas tertinggi di atas garis terhalang, garis bidang potong, dan garis sumbu.'
  },
  {
    id: 9,
    topic: 'Pengenalan Alat Gambar',
    question: 'Tingkat kekerasan pensil gambar yang paling tepat digunakan untuk menarik garis bantu ukuran tipis awal tanpa meninggalkan bekas cekungan kertas adalah...',
    options: [
      '2B',
      'HB',
      '3H atau 4H',
      '6B'
    ],
    answer: '3H atau 4H',
    explanation: 'Pensil berkode H (Hard/Keras) seperti 3H atau 4H menghasilkan goresan abu-abu tipis dan tajam yang tidak mudah luntur, sangat ideal untuk garis bantu awal dan lay-out.'
  },
  {
    id: 10,
    topic: 'Metode Penulisan Dimensi',
    question: 'Metode pemberian ukuran di mana angka ukuran selalu ditulis horizontal sejajar garis mendatar sehingga hanya dapat dibaca dari bawah saja disebut...',
    options: [
      'Metode Aligned (Searah)',
      'Metode Unidirectional',
      'Metode Koordinat',
      'Metode Proyeksi Eropa'
    ],
    answer: 'Metode Unidirectional',
    explanation: 'Metode Unidirectional (Searah Pembacaan) menempatkan seluruh teks angka dimensi secara horizontal, sehingga juru gambar dan operator dapat membaca seluruh ukuran hanya dari arah bawah gambar kerja.'
  }
];

const TechnicalDrawingQuiz = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = QUESTIONS[currentIndex];

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === currentQ.answer) {
      sound.playSuccess();
      setScore(prev => prev + 100);
    } else {
      sound.playError();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      if (onComplete) onComplete(score);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (quizFinished) {
    const isPass = score >= 700;
    return (
      <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{isPass ? '🏆' : '📚'}</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: isPass ? '#10b981' : '#f59e0b', marginBottom: '8px' }}>
          {isPass ? 'LUAR BIASA! ASESMEN LULUS' : 'EVALUASI PERLU DITINGKATKAN'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
          {isPass 
            ? 'Kamu telah menguasai kaidah Standarisasi Garis, Huruf, Proyeksi Ortogonal/Piktorial, dan Aturan Dimensi ISO.' 
            : 'Pelajari kembali modul Standarisasi Garis ISO 128, Proyeksi Eropa/Amerika, dan Aturan Dimensi ISO 129.'}
        </p>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>SKOR ASESMEN:</div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--game-tp)', margin: '6px 0' }}>
            {score} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/ 1000 XP</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isPass ? '#10b981' : '#dc2626' }}>
            Tingkat Akurasi: {(score / 10).toFixed(0)}% ({score / 100} Benar dari {QUESTIONS.length} Soal)
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="btn-game btn-game-primary"
          style={{ padding: '12px 32px', fontSize: '1rem' }}
        >
          🔄 Ulangi Kuis Asesmen
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Quiz Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
        <div>
          <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
            SOAL #{currentIndex + 1} DARI {QUESTIONS.length}
          </span>
          <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Topik: {currentQ.topic}
          </span>
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--game-tp)' }}>
          Score: {score} XP
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%`, background: 'var(--game-tp)', transition: 'width 0.3s ease' }}></div>
      </div>

      {/* Question Text */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '24px' }}>
        {currentQ.question}
      </h3>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {currentQ.options.map((opt, idx) => {
          let btnBg = 'var(--bg-card)';
          let btnBorder = '1px solid var(--border-light)';
          let btnColor = 'var(--text-main)';

          if (isAnswered) {
            if (opt === currentQ.answer) {
              btnBg = 'rgba(16, 185, 129, 0.12)';
              btnBorder = '2px solid #10b981';
              btnColor = '#065f46';
            } else if (opt === selectedOption) {
              btnBg = 'rgba(239, 68, 68, 0.12)';
              btnBorder = '2px solid #ef4444';
              btnColor = '#991b1b';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              disabled={isAnswered}
              style={{
                padding: '14px 18px',
                borderRadius: '8px',
                background: btnBg,
                border: btnBorder,
                color: btnColor,
                fontWeight: 700,
                fontSize: '0.9rem',
                textAlign: 'left',
                cursor: isAnswered ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s'
              }}
            >
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
              {isAnswered && opt === currentQ.answer && (
                <span style={{ color: '#10b981', fontWeight: 900 }}>✓ Benar</span>
              )}
              {isAnswered && opt === selectedOption && opt !== currentQ.answer && (
                <span style={{ color: '#ef4444', fontWeight: 900 }}>✕ Salah</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {isAnswered && (
        <div style={{
          padding: '18px',
          borderRadius: '8px',
          background: selectedOption === currentQ.answer ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          borderLeft: `4px solid ${selectedOption === currentQ.answer ? '#10b981' : '#f59e0b'}`,
          marginBottom: '24px'
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: selectedOption === currentQ.answer ? '#065f46' : '#92400e', marginBottom: '4px' }}>
            💡 Pembahasan Ilmiah:
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
            {currentQ.explanation}
          </div>
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="btn-game btn-game-tp"
          style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
        >
          {currentIndex < QUESTIONS.length - 1 ? 'Soal Berikutnya →' : 'Lihat Hasil Akhir Asesmen 🏆'}
        </button>
      )}

    </div>
  );
};

export default TechnicalDrawingQuiz;

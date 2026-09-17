import React, { useState } from 'react';
import { sound } from '../utils/audio';

const QUESTIONS = [
  {
    id: 1,
    topic: 'Pengenalan Dasar CNC',
    question: 'Kepanjangan resmi dari singkatan CNC dalam teknologi permesinan manufaktur adalah...',
    options: [
      'Computer Numerical Control',
      'Central Network Computing',
      'Computerized Node Calculation',
      'Center Number Calibration'
    ],
    answer: 'Computer Numerical Control',
    explanation: 'CNC merupakan kepanjangan dari Computer Numerical Control, yaitu sistem otomasi mesin perkakas di mana gerakan sumbu dan fungsi mesin dikendalikan oleh instruksi kode angka dan huruf berbasis komputer.'
  },
  {
    id: 2,
    topic: 'Sistem Sumbu Koordinat',
    question: 'Berdasarkan Kaidah Tangan Kanan (ISO 841), sumbu Z pada mesin frais CNC (VMC) selalu sejajar dengan...',
    options: [
      'Sumbu putar poros spindel utama',
      'Arah panjang meja kerja mesin',
      'Arah lintasan sliding door kabin',
      'Kabel ground pembumian'
    ],
    answer: 'Sumbu putar poros spindel utama',
    explanation: 'Sumbu Z selalu berhimpit atau sejajar dengan poros putar spindel utama (spindle axis). Gerakan +Z selalu menjauhi benda kerja (arah aman melayang), sedangkan -Z bergerak masuk menyayat material.'
  },
  {
    id: 3,
    topic: 'Sistem Koordinat Titik Nol',
    question: 'Sistem koordinat di mana setiap titik tujuan SELALU diukur dari satu titik acuan nol tetap (0,0,0) disebut koordinat...',
    options: [
      'Absolut (G90)',
      'Inkremental (G91)',
      'Polar (G16)',
      'Relatif Bebas'
    ],
    answer: 'Absolut (G90)',
    explanation: 'Sistem Absolut (G90) mengukur seluruh koordinat titik X, Y, dan Z dari satu titik nol benda kerja tetap (Workpiece Zero / G54). Sedangkan G91 (Inkremental) mengukur jarak pergeseran dari titik terakhir pisau berada.'
  },
  {
    id: 4,
    topic: 'Komponen Mesin CNC',
    question: 'Komponen mekanis yang berfungsi menukar alat potong di spindel secara otomatis dalam hitungan detik tanpa bantuan tangan operator adalah...',
    options: [
      'Automatic Tool Changer (ATC)',
      'Manual Pulse Generator (MPG)',
      'Tailstock Hidrolik',
      'Linear Guide Way'
    ],
    answer: 'Automatic Tool Changer (ATC)',
    explanation: 'Automatic Tool Changer (ATC) adalah magasin otomatis (tipe payung carousel atau lengan ganda) yang menukar holder pisau di spindel secara otomatis saat menerima instruksi M06.'
  },
  {
    id: 5,
    topic: 'Pemrograman G-Code',
    question: 'Perintah G-Code yang digunakan untuk menggerakkan mata pisau secara lurus menyayat material dengan kecepatan pemakanan teratur (Feedrate) adalah...',
    options: [
      'G01 (Linear Interpolation)',
      'G00 (Rapid Traverse)',
      'G02 (Circular CW)',
      'G28 (Zero Return)'
    ],
    answer: 'G01 (Linear Interpolation)',
    explanation: 'G01 adalah perintah interpolasi pemakanan lurus terkoordinasi dengan kecepatan yang diatur oleh nilai F (Feedrate, mm/menit). Sedangkan G00 adalah gerak cepat tanpa memakan material.'
  },
  {
    id: 6,
    topic: 'Pemrograman G-Code',
    question: 'Perintah G02 dan G03 pada pemrograman CNC Milling digunakan untuk menghasilkan pergerakan...',
    options: [
      'Interpolasi melingkar / radius (Circular Interpolation)',
      'Gerak cepat tanpa menyayat melayang',
      'Pengeboran lubang dalam bertahap',
      'Pembatalan kompensasi pisau'
    ],
    answer: 'Interpolasi melingkar / radius (Circular Interpolation)',
    explanation: 'G02 menghasilkan pemakanan melingkar searah jarum jam (Clockwise / CW), sedangkan G03 menghasilkan pemakanan melingkar berlawanan arah jarum jam (Counter-Clockwise / CCW).'
  },
  {
    id: 7,
    topic: 'Pemrograman M-Code',
    question: 'Kode fungsi bantu M03 S2000 pada baris program CNC memiliki arti...',
    options: [
      'Putar spindel searah jarum jam (CW) dengan kecepatan 2.000 RPM',
      'Matikan putaran spindel pada detik ke-2000',
      'Nyalakan pompa cairan pendingin dengan debit 2000 liter/menit',
      'Ganti pisau potong ke nomor 2000'
    ],
    answer: 'Putar spindel searah jarum jam (CW) dengan kecepatan 2.000 RPM',
    explanation: 'M03 adalah perintah untuk menyalakan putaran spindel searah jarum jam (Clockwise), dan S2000 menentukan kecepatan putaran sebesar 2.000 RPM (Revolutions Per Minute).'
  },
  {
    id: 8,
    topic: 'Pemrograman M-Code',
    question: 'Pasangan kode M yang berfungsi untuk menyalakan dan mematikan semprotan cairan pendingin (coolant) adalah...',
    options: [
      'M08 (Coolant ON) dan M09 (Coolant OFF)',
      'M03 (Coolant ON) dan M05 (Coolant OFF)',
      'M06 (Coolant ON) dan M30 (Coolant OFF)',
      'M01 (Coolant ON) dan M02 (Coolant OFF)'
    ],
    answer: 'M08 (Coolant ON) dan M09 (Coolant OFF)',
    explanation: 'M08 menghidupkan pompa cairan pendingin (flood coolant) untuk membuang panas gesekan dan membilas tatal, sedangkan M09 mematikan semprotan pendingin.'
  },
  {
    id: 9,
    topic: 'Komponen Mesin & K3 CNC',
    question: 'Tombol berbentuk jamur berwarna merah mencolok pada panel kontrol CNC yang wajib ditekan saat terjadi kondisi darurat atau bahaya tabrakan adalah...',
    options: [
      'Emergency Stop (E-Stop)',
      'Cycle Start Button',
      'Feed Hold Button',
      'Single Block Switch'
    ],
    answer: 'Emergency Stop (E-Stop)',
    explanation: 'Tombol Emergency Stop (E-Stop) adalah saklar pemutus daya darurat yang langsung menghentikan putaran motor servo dan spindel secara seketika untuk mencegah kerusakan mesin dan cedera operator.'
  },
  {
    id: 10,
    topic: 'Akhir Program CNC',
    question: 'Kode standar di baris paling akhir program CNC yang mematikan spindel, mematikan coolant, dan me-rewind memori kembali ke baris nomor program awal adalah...',
    options: [
      'M30',
      'M05',
      'G00',
      'G28'
    ],
    answer: 'M30',
    explanation: 'M30 (Program End and Rewind) menandakan siklus program telah tuntas secara lengkap, mematikan fungsi bantu mesin, dan mengembalikan kursor pembacaan memori kontroler ke awal program (O1001).'
  }
];

const CNCQuiz = ({ addXP }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  const q = QUESTIONS[currentIdx];

  const handleSelectOption = (opt) => {
    if (showExplanation) return;
    sound.playClick();
    setSelectedAnswer(opt);
    setShowExplanation(true);

    const isCorrect = opt === q.answer;
    if (isCorrect) {
      sound.playSuccess();
      setScore(prev => prev + 1);
    } else {
      sound.playError();
    }

    setUserAnswers(prev => ({
      ...prev,
      [q.id]: {
        selected: opt,
        correct: q.answer,
        isCorrect
      }
    }));
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      if (addXP) {
        addXP(1000);
      }
      sound.playSuccess();
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);
    setUserAnswers({});
  };

  if (isFinished) {
    const percentage = Math.round((score / QUESTIONS.length) * 100);
    const isPassed = percentage >= 70;

    return (
      <div className="dashboard-card" style={{ padding: '32px', textAlign: 'center', maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: '3.5rem' }}>{isPassed ? '🏆' : '📚'}</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
          {isPassed ? 'Selamat! Anda Menguasai Materi CNC!' : 'Terus Semangat Belajar CNC!'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          {isPassed 
            ? 'Anda telah memahami prinsip dasar mesin CNC, anatomi komponen mekatronika, dan aturan pemrograman G-Code & M-Code standar industri.' 
            : 'Nilai Anda belum mencapai KKM (70%). Silakan pelajari kembali modul materi dan ulangi kuis asesmen ini.'}
        </p>

        {/* SCORE BADGE */}
        <div style={{
          background: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `2px solid ${isPassed ? '#10b981' : '#ef4444'}`,
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>SKOR AKHIR</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: isPassed ? '#10b981' : '#ef4444' }}>
              {percentage}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{score} dari {QUESTIONS.length} Soal Benar</div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '24px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>REWARD KOMPETENSI</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>
              +1000 XP
            </div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>⭐ CNC Specialist Badge</div>
          </div>
        </div>

        <button
          onClick={handleRestart}
          style={{
            padding: '14px 28px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
            alignSelf: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔄</span> Ulangi Kuis Asesmen
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* HEADER & PROGRESS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
        <div>
          <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
            KUIS ASESMEN KOMPETENSI CNC (1000 XP)
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '6px 0 0 0' }}>
            Topik: {q.topic}
          </h3>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Soal {currentIdx + 1} dari {QUESTIONS.length}
          </div>
          <div style={{ width: '120px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%`, height: '100%', background: '#0284c7', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* QUESTION TEXT */}
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.6 }}>
        {currentIdx + 1}. {q.question}
      </div>

      {/* OPTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {q.options.map((opt, idx) => {
          const isChosen = selectedAnswer === opt;
          const isCorrect = opt === q.answer;

          let btnBg = 'var(--bg-card)';
          let btnBorder = '1px solid var(--border-light)';
          let btnColor = 'var(--text-main)';

          if (showExplanation) {
            if (isCorrect) {
              btnBg = '#dcfce7';
              btnBorder = '2px solid #10b981';
              btnColor = '#065f46';
            } else if (isChosen && !isCorrect) {
              btnBg = '#fee2e2';
              btnBorder = '2px solid #ef4444';
              btnColor = '#991b1b';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              disabled={showExplanation}
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                border: btnBorder,
                background: btnBg,
                color: btnColor,
                fontSize: '0.92rem',
                fontWeight: isChosen || (showExplanation && isCorrect) ? 800 : 500,
                textAlign: 'left',
                cursor: showExplanation ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isChosen ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <span>{opt}</span>
              {showExplanation && isCorrect && <span style={{ color: '#10b981', fontWeight: 900 }}>✓ Benar</span>}
              {showExplanation && isChosen && !isCorrect && <span style={{ color: '#ef4444', fontWeight: 900 }}>✕ Salah</span>}
            </button>
          );
        })}
      </div>

      {/* EXPLANATION BOX */}
      {showExplanation && (
        <div style={{
          background: selectedAnswer === q.answer ? '#f0fdf4' : '#fffbeb',
          borderLeft: `4px solid ${selectedAnswer === q.answer ? '#10b981' : '#f59e0b'}`,
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: selectedAnswer === q.answer ? '#065f46' : '#92400e' }}>
            {selectedAnswer === q.answer ? '✅ Jawaban Anda Tepat!' : '💡 Pembahasan Konsep:'}
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
            {q.explanation}
          </p>
        </div>
      )}

      {/* FOOTER BUTTON */}
      {showExplanation && (
        <button
          onClick={handleNext}
          style={{
            alignSelf: 'flex-end',
            padding: '12px 24px',
            borderRadius: '8px',
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}
        >
          <span>{currentIdx < QUESTIONS.length - 1 ? 'Soal Berikutnya ➡️' : 'Lihat Hasil Akhir 🏆'}</span>
        </button>
      )}

    </div>
  );
};

export default CNCQuiz;

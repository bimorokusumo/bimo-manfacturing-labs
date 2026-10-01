import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { recordQuizResult } from '../services/sheetService';

const QUESTIONS = [
  {
    id: 1,
    topic: 'Jenis-Jenis Pengelasan',
    question: 'Proses pengelasan yang menggunakan elektroda batangan terbungkus fluks di mana fluks tersebut menghasilkan gas pelindung dan terak secara mandiri disebut...',
    options: [
      'SMAW (Shielded Metal Arc Welding)',
      'GTAW (Gas Tungsten Arc Welding)',
      'GMAW (Gas Metal Arc Welding)',
      'OAW (Oxy-Acetylene Welding)'
    ],
    answer: 'SMAW (Shielded Metal Arc Welding)',
    explanation: 'SMAW (sering disebut las stik) menggunakan kawat inti yang dibungkus fluks padat. Saat terbakar, fluks membentuk selubung gas CO2 dan terak (slag) untuk melindungi kawah las cair dari kontaminasi udara luar.'
  },
  {
    id: 2,
    topic: 'Kode Elektroda AWS',
    question: 'Pada kode spesifikasi kawat las AWS E7018, angka "70" menunjukkan bahwa deposit logam las memiliki...',
    options: [
      'Kekuatan tarik minimum 70.000 psi (± 490 MPa)',
      'Kandungan karbon sebesar 70%',
      'Suhu pengelasan maksimal 700°C',
      'Ketebalan plat minimal 70 mm'
    ],
    answer: 'Kekuatan tarik minimum 70.000 psi (± 490 MPa)',
    explanation: 'Dua angka pertama setelah huruf E (yaitu 70) menunjukkan kekuatan tarik minimum (minimum tensile strength) dikalikan 1.000 psi, yaitu 70.000 psi atau setara ± 490 MPa.'
  },
  {
    id: 3,
    topic: 'Teknik Dasar Pengelasan',
    question: 'Berapakah jarak panjang busur nyala (arc length) yang ideal selama proses pengelasan SMAW?',
    options: [
      'Sama dengan diameter inti kawat las (± 2 – 3 mm)',
      'Minimal 10 mm dari permukaan plat',
      'Menempel langsung dan ditekan ke plat dasar',
      'Setengah dari panjang batang elektroda'
    ],
    answer: 'Sama dengan diameter inti kawat las (± 2 – 3 mm)',
    explanation: 'Panjang busur ideal kira-kira sama dengan diameter kawat inti elektroda (sekitar 2 hingga 3 mm). Jika terlalu jauh, voltase melonjak dan udara masuk memicu cacat porositas.'
  },
  {
    id: 4,
    topic: 'K3 & APD Pengelasan',
    question: 'Mengapa juru las wajib menggunakan helm las dengan kaca filter (shade 9 - 13) saat mengelas?',
    options: [
      'Melindungi kornea mata dari bahaya radiasi sinar Ultraviolet (UV) dan Inframerah (IR)',
      'Agar wajah tidak terkena terpaan angin sepoi-sepoi',
      'Hanya sebagai aksesoris seragam bengkel industri',
      'Mencegah debu ruangan masuk ke telinga'
    ],
    answer: 'Melindungi kornea mata dari bahaya radiasi sinar Ultraviolet (UV) dan Inframerah (IR)',
    explanation: 'Busur listrik menghasilkan radiasi sinar Ultraviolet (UV) dan Inframerah (IR) intensitas tinggi yang dapat membakar kornea mata dan memicu penyakit "arc eye" (mata las pedih seperti berpasir).'
  },
  {
    id: 5,
    topic: 'Teknik Dasar Pengelasan',
    question: 'Sudut arah gerak (travel angle) elektroda yang dianjurkan saat mengelas posisi bawah tangan (flat) adalah...',
    options: [
      '70° hingga 80° condong ke arah pengelasan',
      '30° rebah menempel pada plat',
      '90° tegak lurus sempurna sepanjang pengelasan',
      '120° condong ke arah yang berlawanan'
    ],
    answer: '70° hingga 80° condong ke arah pengelasan',
    explanation: 'Sudut kemiringan elektroda yang benar umumnya adalah 70 hingga 80 derajat terhadap garis lurus benda kerja atau sedikit miring (menarik) sekitar 10 hingga 15 derajat dari posisi tegak lurus (90°). Sudut ini sangat penting agar gaya sembur busur las menekan cairan terak (slag) agar tetap berada di belakang busur las dan tidak mendahului kawah las cair.'
  },
  {
    id: 6,
    topic: 'Posisi Pengelasan',
    question: 'Posisi pengelasan sambungan pipa di mana sumbu pipa dimiringkan pada sudut tetap 45° dan tidak boleh diputar disebut posisi...',
    options: [
      '6G',
      '1G',
      '5G',
      '2G'
    ],
    answer: '6G',
    explanation: 'Posisi 6G adalah posisi uji kualifikasi tertinggi seorang welder pada pipa tetap miring 45°, karena menguji kemampuan juru las pada posisi flat, vertikal, horizontal, dan overhead secara bersambung.'
  },
  {
    id: 7,
    topic: 'Alat & Bahan Pengelasan',
    question: 'Kawat las jenis E7018 tergolong elektroda Low-Hydrogen. Perlakuan wajib apa yang harus dilakukan sebelum elektroda ini digunakan?',
    options: [
      'Di-oven (dikeringkan) pada suhu 250°C – 350°C untuk menghilangkan kelembaban',
      'Direndam di dalam air dingin selama 10 menit',
      'Dilapisi minyak oli agar tidak berkarat',
      'Dibersihkan dengan amplas besi hingga fluksnya terkelupas'
    ],
    answer: 'Di-oven (dikeringkan) pada suhu 250°C – 350°C untuk menghilangkan kelembaban',
    explanation: 'Elektroda Low-Hydrogen E7018 sangat sensitif terhadap uap air udara. Wajib di-oven pada suhu 250°C-350°C sebelum digunakan agar tidak terjadi penyerapan hidrogen yang dapat memicu retak dingin (cold cracking) pada konstruksi baja.'
  },
  {
    id: 8,
    topic: 'Teknik Las OAW (Karbit)',
    question: 'Jenis nyala api las OAW di mana perbandingan volume gas Asetilen dan gas Oksigen seimbang (1 : 1) disebut...',
    options: [
      'Api Netral (Neutral Flame)',
      'Api Karburasi (Carburizing Flame)',
      'Api Oksidasi (Oxidizing Flame)',
      'Api Reduksi'
    ],
    answer: 'Api Netral (Neutral Flame)',
    explanation: 'Api netral dihasilkan dari perbandingan asetilen dan oksigen 1:1, bersuhu ± 3.200°C dengan inti api bulat tumpul tanpa selubung kerucut antara. Ini adalah nyala standar untuk mengelas baja lunak.'
  },
  {
    id: 9,
    topic: 'Cacat Las & Solusi',
    question: 'Jika pengaturan arus listrik (Ampere) disetel terlalu tinggi dan ayunan elektroda terlalu cepat pada tepi kampuh, cacat las apakah yang paling sering terjadi?',
    options: [
      'Undercut (parit terkeruk di kaki las)',
      'Lack of Fusion (kurang peleburan)',
      'Penetrasi dangkal',
      'Timbunan las terlalu tinggi membumbung'
    ],
    answer: 'Undercut (parit terkeruk di kaki las)',
    explanation: 'Arus terlalu tinggi melelehkan dinding logam induk secara berlebihan, namun logam pengisi tidak sempat mengisi cerukan tersebut, menghasilkan parit tajam (undercut) di sepanjang kaki las.'
  },
  {
    id: 10,
    topic: 'Jenis-Jenis Pengelasan',
    question: 'Proses pengelasan yang menggunakan elektroda wolfram tak meleleh dengan gas pelindung Argon murni untuk menghasilkan sambungan las berkualitas tinggi dan tanpa terak adalah...',
    options: [
      'GTAW / TIG (Tungsten Inert Gas)',
      'SMAW (Stick Welding)',
      'OAW (Las Karbit)',
      'FCAW (Flux Cored)'
    ],
    answer: 'GTAW / TIG (Tungsten Inert Gas)',
    explanation: 'GTAW (TIG) menggunakan elektroda wolfram (tungsten) yang tidak ikut meleleh, dengan pelindung gas Argon murni 99.99%. Menghasilkan sambungan paling bersih, bebas spatter, dan bebas terak.'
  },
  {
    id: 11,
    topic: 'Gas Pelindung GMAW (MIG vs MAG)',
    question: 'Apakah perbedaan mendasar antara proses pengelasan MIG (Metal Inert Gas) dan MAG (Metal Active Gas)?',
    options: [
      'MIG menggunakan gas mulia inert murni (Argon/Helium), sedangkan MAG menggunakan gas aktif reaktif (CO₂ murni atau campuran Ar + CO₂)',
      'MIG menggunakan kawat gulungan, sedangkan MAG menggunakan elektroda batangan bersalut fluks',
      'MIG hanya bisa menggunakan arus bolak-balik AC, sedangkan MAG wajib arus searah DC',
      'MIG menghasilkan lapisan terak tebal, sedangkan MAG tidak menghasilkan terak sama sekali'
    ],
    answer: 'MIG menggunakan gas mulia inert murni (Argon/Helium), sedangkan MAG menggunakan gas aktif reaktif (CO₂ murni atau campuran Ar + CO₂)',
    explanation: 'MIG (Metal Inert Gas) memakai gas mulia murni (Argon/Helium) yang stabil dan sama sekali tidak bereaksi kimia dengan cairan las. Sedangkan MAG (Metal Active Gas) memakai gas aktif reaktif seperti gas CO₂ murni atau campuran Ar + CO₂/O₂ yang mengalami reaksi disosiasi termal dan mempengaruhi metalurgi kawah las.'
  },
  {
    id: 12,
    topic: 'Metalurgi Las Baja Karbon (MAG)',
    question: 'Mengapa pengelasan baja karbon lunak (Mild Steel) sangat dianjurkan menggunakan proses MAG (CO₂ / Ar+CO₂) dan BUKAN Argon murni?',
    options: [
      'Disosiasi gas CO₂ memberikan penetrasi mangkuk dalam, menurunkan tegangan permukaan cairan las, dan kawat ER70S-6 memiliki deoksidator (Mn & Si)',
      'Argon murni akan membakar habis kandungan besi di dalam baja karbon',
      'Gas CO₂ membuat busur listrik mengeluarkan aroma harum sehingga juru las tidak pusing',
      'Mesin las MAG memerlukan voltase yang jauh lebih rendah daripada mesin las MIG'
    ],
    answer: 'Disosiasi gas CO₂ memberikan penetrasi mangkuk dalam, menurunkan tegangan permukaan cairan las, dan kawat ER70S-6 memiliki deoksidator (Mn & Si)',
    explanation: 'Gas CO₂ pada suhu busur terurai menghasilkan energi panas rekombinasi tinggi yang membentuk penetrasi mangkuk dalam dan menurunkan tegangan permukaan sehingga cairan baja mengalir rata (good wetting). Oksigen bebas diikat oleh deoksidator Mangan (Mn) dan Silikon (Si) kawat ER70S-6 menjadi mikroslag mengapung, mencegah porositas. Sebaliknya Argon murni membuat cairan baja menggumpal sempit dan fusi tepinya buruk.'
  },
  {
    id: 13,
    topic: 'Metalurgi Logam Non-Ferro (Aluminium)',
    question: 'Mengapa pengelasan logam Aluminium wajib menggunakan gas pelindung mulia murni (MIG Argon murni) dan dilarang keras menggunakan gas aktif MAG (CO₂)?',
    options: [
      'Aluminium sangat reaktif terhadap oksigen; gas CO₂ membentuk kerak refraktori Al₂O₃ (titik lebur 2.072°C) yang memicu porositas dan sambungan patah getas',
      'Gas CO₂ akan mengubah warna aluminium menjadi merah berkarat',
      'Gas Argon membuat berat jenis aluminium menjadi lebih padat seperti baja',
      'Nozel stang las akan langsung tersumbat oleh kawat aluminium bila dialiri gas CO₂'
    ],
    answer: 'Aluminium sangat reaktif terhadap oksigen; gas CO₂ membentuk kerak refraktori Al₂O₃ (titik lebur 2.072°C) yang memicu porositas dan sambungan patah getas',
    explanation: 'Aluminium sangat reaktif terhadap oksigen. Gas aktif CO₂ akan membakar aluminium menjadi lapisan keras alumina oksida (Al₂O₃) yang memiliki titik leleh 2.072°C (jauh melampaui aluminium yang hanya 660°C). Lapisan ini tidak meleleh, menjebak gas, menimbulkan cacat porositas masif, dan merusak sambungan menjadi getas.'
  },
  {
    id: 14,
    topic: 'Parameter Las TIG Aluminium (AC)',
    question: 'Mengapa pengelasan material Aluminium dengan las TIG (GTAW) harus menggunakan sumber arus bolak-balik (AC) dan bukan arus searah (DC)?',
    options: [
      'Siklus positif AC menghasilkan aksi pembersihan katodik (Cathodic Cleaning) memecah lapisan oksida Al₂O₃, sedangkan siklus negatif memberi penetrasi lebur',
      'Jarum tungsten akan langsung mencair rontok bila dialiri arus searah DCEN',
      'Arus bolak-balik menghasilkan suara frekuensi tinggi yang membuat filler rod meleleh otomatis',
      'Listrik PLN hanya menyediakan arus bolak-balik AC'
    ],
    answer: 'Siklus positif AC menghasilkan aksi pembersihan katodik (Cathodic Cleaning) memecah lapisan oksida Al₂O₃, sedangkan siklus negatif memberi penetrasi lebur',
    explanation: 'Pada arus AC, siklus elektroda positif (EP) membombardir permukaan dengan ion Argon bermassa berat untuk memecah lapisan keras oksida Al₂O₃ (Cathodic Cleaning Action). Sementara siklus elektroda negatif (EN) menembakkan elektron ke plat aluminium untuk memberikan panas penetrasi lebur yang dalam.'
  },
  {
    id: 15,
    topic: 'K3 & Keselamatan Las OAW (Karbit)',
    question: 'Berapakah batas tekanan kerja maksimal gas Asetilen pada regulator torch las karbit (OAW) yang tidak boleh dilanggar demi mencegah ledakan spontan?',
    options: [
      'Maksimal 15 psi (± 1,0 bar / 100 kPa)',
      'Maksimal 150 psi (± 10 bar)',
      'Maksimal 2.000 psi (setara dengan tekanan tabung oksigen)',
      'Bebas dinaikkan berapapun selama api las belum padam'
    ],
    answer: 'Maksimal 15 psi (± 1,0 bar / 100 kPa)',
    explanation: 'Gas asetilen bebas (C₂H₂) memiliki sifat kimiawi tidak stabil di atas tekanan 15 psi (1,03 bar / 100 kPa). Di atas batas ini, molekul asetilen dapat mengalami disosiasi eksotermik spontan (terurai sendiri menghasilkan panas dahsyat) bahkan tanpa oksigen, yang memicu ledakan berdaya hancur tinggi di regulator dan selang.'
  }
];

const WeldingQuiz = ({ onComplete }) => {
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

      const correctCount = Math.round(score / 100);
      const score100 = Math.round((correctCount / QUESTIONS.length) * 100);
      recordQuizResult({
        modul: 'Welding Lab',
        judulKuis: 'Kuis Evaluasi Teori Pengelasan',
        skor: score100,
        jawabanBenar: correctCount,
        totalSoal: QUESTIONS.length,
        detailJawaban: `${correctCount} dari ${QUESTIONS.length} soal las dijawab benar (Skor: ${score100}/100)`
      });
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
    const maxScore = QUESTIONS.length * 100;
    const passThreshold = Math.round(maxScore * 0.7);
    const isPass = score >= passThreshold;
    const accuracyPercent = Math.round((score / maxScore) * 100);
    const correctAnswers = Math.round(score / 100);

    return (
      <div className="dashboard-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{isPass ? '🏆' : '📚'}</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: isPass ? '#10b981' : '#f59e0b', marginBottom: '8px' }}>
          {isPass ? 'LUAR BIASA! ASESMEN PENGELASAN LULUS' : 'EVALUASI PERLU DITINGKATKAN'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
          {isPass 
            ? 'Kamu telah menguasai kaidah Proses Pengelasan (SMAW, MIG, MAG, TIG, OAW), Metalurgi Gas Pelindung, Kode Elektroda AWS, K3 APD, dan Pencegahan Cacat Las.' 
            : 'Pelajari kembali materi Perbedaan MIG/MAG, Alasan Gas Aktif pada Mild Steel, Arus AC TIG Aluminium, dan Batas Tekanan OAW.'}
        </p>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>SKOR AKHIR ASESMEN:</div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ea580c', margin: '6px 0' }}>
            {score} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/ {maxScore} XP</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isPass ? '#10b981' : '#dc2626' }}>
            Tingkat Akurasi: {accuracyPercent}% ({correctAnswers} Benar dari {QUESTIONS.length} Soal • Ambang Kelulusan: 70%)
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="btn-game btn-game-primary"
          style={{ padding: '12px 32px', fontSize: '1rem' }}
        >
          🔄 Ulangi Asesmen Kuis
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-card" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Quiz Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
            EVALUASI TEORI PENGELASAN • SOAL {currentIndex + 1} DARI {QUESTIONS.length}
          </span>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Topik: {currentQ.topic}
          </h4>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>SKOR SEMENTARA:</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ea580c' }}>{score} XP</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%`, 
            background: 'linear-gradient(90deg, #ea580c, #f59e0b)', 
            transition: 'width 0.3s' 
          }} 
        />
      </div>

      {/* Question Text */}
      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.6, marginBottom: '24px' }}>
        {currentQ.question}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {currentQ.options.map((opt, idx) => {
          let btnBg = '#ffffff';
          let borderCol = 'var(--border-light)';
          let textCol = 'var(--text-main)';

          if (isAnswered) {
            if (opt === currentQ.answer) {
              btnBg = 'rgba(16, 185, 129, 0.15)';
              borderCol = '#10b981';
              textCol = '#065f46';
            } else if (opt === selectedOption) {
              btnBg = 'rgba(239, 68, 68, 0.15)';
              borderCol = '#ef4444';
              textCol = '#991b1b';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              style={{
                padding: '14px 18px',
                borderRadius: '8px',
                border: `2px solid ${borderCol}`,
                background: btnBg,
                color: textCol,
                fontWeight: 600,
                fontSize: '0.95rem',
                textAlign: 'left',
                cursor: isAnswered ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s'
              }}
            >
              <span style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: isAnswered && opt === currentQ.answer ? '#10b981' : isAnswered && opt === selectedOption ? '#ef4444' : '#f1f5f9',
                color: isAnswered && (opt === currentQ.answer || opt === selectedOption) ? '#fff' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
              {isAnswered && opt === currentQ.answer && <span>✅</span>}
              {isAnswered && opt === selectedOption && opt !== currentQ.answer && <span>❌</span>}
            </button>
          );
        })}
      </div>

      {/* Answer Explanation */}
      {isAnswered && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          background: selectedOption === currentQ.answer ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderLeft: `4px solid ${selectedOption === currentQ.answer ? '#10b981' : '#ef4444'}`,
          marginBottom: '24px'
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: selectedOption === currentQ.answer ? '#065f46' : '#991b1b', marginBottom: '4px' }}>
            {selectedOption === currentQ.answer ? '🎉 JAWABAN TEPAT!' : '⚠️ JAWABAN KURANG TEPAT'}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
            {currentQ.explanation}
          </p>
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleNext}
            className="btn-game btn-game-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {currentIndex < QUESTIONS.length - 1 ? 'Soal Berikutnya ➔' : 'Lihat Hasil Akhir 🏆'}
          </button>
        </div>
      )}

    </div>
  );
};

export default WeldingQuiz;

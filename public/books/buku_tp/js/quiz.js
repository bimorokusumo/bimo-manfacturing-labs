/**
 * QUIZ SYSTEM & CERTIFICATE GENERATOR FOR TEKNIK PEMESINAN (TP)
 * Formative evaluations for Chapters 1-6 + Final Certificate Generator
 */

const QUIZ_DATA = {
  // Bab 1: Kecakapan Kerja & K3LH
  bab1: [
    {
      q: 'Dalam pengoperasian mesin perkakas dengan spindel berputar tinggi (seperti mesin bubut dan mesin bor bangku), aturan K3LH yang MUTLAK wajib dipatuhi adalah...',
      options: [
        'Wajib mengenakan sarung tangan kain tebal agar tangan tidak tergores',
        'Dilarang keras mengenakan sarung tangan karena serat kain berisiko tinggi terlilit ke spindel/benda berputar',
        'Boleh mengoperasikan mesin sambil memakai dasi atau baju longgar',
        'Kunci cekam (chuck key) boleh dibiarkan menancap pada cekam'
      ],
      correct: 1,
      explanation: 'Larangan memakai sarung tangan pada mesin berputar adalah aturan baku internasional untuk mencegah tangan operator terlilit dan tertarik ke dalam mesin.'
    },
    {
      q: 'Prinsip "Seiri" (Ringkas) dalam budaya industri 5R di bengkel pemesinan diterapkan melalui tindakan...',
      options: [
        'Membuang semua perkakas yang masih dipakai',
        'Mengecat lantai bengkel setiap hari',
        'Memilah dan menyingkirkan tatal/beram logam sisa pemotongan serta alat rusak dari meja kerja',
        'Menyimpan kunci chuck di laci terkunci'
      ],
      correct: 2,
      explanation: 'Seiri (Ringkas) berfokus pada pemilahan: singkirkan benda yang tidak diperlukan (seperti beram dan alat afkir) agar area kerja aman dan teratur.'
    }
  ],

  // Bab 2: Pengetahuan Bahan Teknik
  bab2: [
    {
      q: 'Baja karbon konstruksi umum yang memiliki kadar karbon rendah (< 0,25% C), memiliki sifat mampu las sangat baik, dan ulet dikenal dengan kode standar...',
      options: [
        'Baja Karbon Tinggi (Tool Steel)',
        'St 37 (Mild Steel / Baja Karbon Rendah)',
        'Besi Tuang Putih',
        'Baja HSS M2'
      ],
      correct: 1,
      explanation: 'Baja St 37 (kuat tarik ~370 MPa) adalah baja karbon rendah paling populer dalam pekerjaan fabrikasi dan pemesinan dasar karena mudah dibentuk dan dilas.'
    },
    {
      q: 'Sifat mekanik material teknik yang menunjukkan ketahanan permukaan bahan terhadap penetrasi atau goresan benda runcing yang lebih keras disebut...',
      options: [
        'Elastisitas (Elasticity)',
        'Keuletan (Ductility)',
        'Kekerasan (Hardness)',
        'Ketangguhan (Toughness)'
      ],
      correct: 2,
      explanation: 'Kekerasan (Hardness) diukur dengan metode pengujian Brinell, Rockwell (HRC), atau Vickers untuk menentukan ketahanan aus permukaan logam.'
    }
  ],

  // Bab 3: Teknik Dasar Proses Produksi
  bab3: [
    {
      q: 'Pada jangka sorong metrik dengan ketelitian 0,05 mm, jika skala utama terbaca 24 mm dan garis nonius ke-7 tepat lurus dengan garis skala utama, maka nilai ukur total adalah...',
      options: [
        '24,07 mm',
        '24,70 mm',
        '24,35 mm',
        '24,14 mm'
      ],
      correct: 2,
      explanation: 'Hasil ukur = 24 mm + (7 × 0,05 mm) = 24 mm + 0,35 mm = 24,35 mm.'
    },
    {
      q: 'Rumus baku untuk menghitung kecepatan putaran spindel mesin bubut (n dalam RPM) berdasarkan diameter benda kerja (d mm) dan kecepatan potong (Cs m/menit) adalah...',
      options: [
        'n = (Cs × d) / 1000',
        'n = (1000 × Cs) / (π × d)',
        'n = (π × d × Cs) / 1000',
        'n = 1000 / (Cs × π × d)'
      ],
      correct: 1,
      explanation: 'Formula putaran spindel n = (1000 × Cs) / (π × d) mengonversi satuan kecepatan potong meter/menit ke keliling lingkaran benda kerja dalam milimeter.'
    }
  ],

  // Bab 4: Gambar Teknik Mesin
  bab4: [
    {
      q: 'Pada proyeksi ortogonal standar Kuadran I (Proyeksi Sudut Pertama / Proyeksi Eropa), letak bidang pandangan atas suatu benda diletakkan di...',
      options: [
        'Sebelah atas pandangan depan',
        'Sebelah bawah pandangan depan',
        'Sebelah kanan pandangan depan',
        'Sebelah kiri pandangan depan'
      ],
      correct: 1,
      explanation: 'Proyeksi Eropa membalik letak pandangan: pandangan atas diletakkan di BAWAH pandangan depan, dan pandangan kiri di KANAN pandangan depan.'
    },
    {
      q: 'Pada penunjukan toleransi suaian ISO "Ø 30 H7/g6", huruf kapital "H" menunjukkan bahwa...',
      options: [
        'Sistem yang digunakan adalah basis lubang dengan penyimpangan bawah nol',
        'Sistem yang digunakan adalah basis poros longgar',
        'Poros memiliki kekasaran permukaan kasar',
        'Benda kerja dibuat dari bahan HSS'
      ],
      correct: 0,
      explanation: 'Huruf besar (H) melambangkan toleransi lubang (Hole). Huruf H memiliki batas penyimpangan bawah persis 0 (garis nol), menandakan Sistem Basis Lubang.'
    }
  ],

  // Bab 5: Dasar Sistem Mekanik
  bab5: [
    {
      q: 'Berdasarkan kode standar bantalan gelinding ISO "6205-2RS", angka "05" pada dua digit terakhir menunjukkan ukuran...',
      options: [
        'Lebar bantalan 5 mm',
        'Diameter luar bantalan 50 mm',
        'Diameter dalam lubang poros Ø 25 mm (05 × 5)',
        'Beban maksimum 500 kg'
      ],
      correct: 2,
      explanation: 'Untuk kode bantalan 04 ke atas, diameter dalam poros = dua digit terakhir dikalikan 5 mm. Maka 05 × 5 = Ø 25 mm.'
    },
    {
      q: 'Jenis transmisi roda gigi yang digunakan untuk memindahkan daya antara dua poros yang saling tegak lurus 90° dengan rasio reduksi sangat tinggi dan memiliki sifat tidak dapat diputar balik (self-locking) adalah...',
      options: [
        'Roda Gigi Lurus (Spur Gear)',
        'Roda Gigi Miring (Helical Gear)',
        'Roda Gigi Cacing (Worm Gear & Pinion)',
        'Roda Gigi Payung (Bevel Gear)'
      ],
      correct: 2,
      explanation: 'Worm gear (roda gigi cacing) mentransmisikan daya bersilangan tegak lurus dengan reduksi besar (misal 40:1) dan mencegah beban memutar balik spindel penggerak.'
    }
  ],

  // Bab 6: Wawasan Bidang Teknik Mesin
  bab6: [
    {
      q: 'Strategi pemeliharaan mesin manufaktur modern berbasis sensor IoT dan algoritma kecerdasan buatan (AI) yang mampu memprediksi waktu kerusakan komponen sebelum terjadi kegagalan dinamakan...',
      options: [
        'Breakdown Maintenance (Perawatan Darurat)',
        'Predictive Maintenance (Perawatan Prediktif Berbantuan AI)',
        'Corrective Maintenance',
        'Reactive Maintenance'
      ],
      correct: 1,
      explanation: 'Predictive Maintenance menganalisis data getaran, suhu, dan arus listrik secara real-time untuk menjadwalkan pergantian suku cadang tepat sebelum rusak.'
    },
    {
      q: 'Penerapan konsep wawasan hijau (Green Manufacturing) pada proses pemesinan mesin bubut dan frais untuk menghemat fluida pendingin dan menjaga kesehatan operator dilakukan dengan metode...',
      options: [
        'Pemesinan kering total tanpa pelindung',
        'Minimum Quantity Lubrication (MQL) / Kabut Mikro',
        'Mengalirkan oli bekas oli mobil',
        'Menyiram air sabun tanpa filter'
      ],
      correct: 1,
      explanation: 'Teknologi MQL (Minimum Quantity Lubrication) menyemprotkan kabut mikro pelumas nabati dalam jumlah minimal (mililiter/jam) untuk melumasi pahat tanpa mencemari bengkel.'
    }
  ]
};

class QuizController {
  constructor() {
    this.userAnswers = {};
    this.initFormativeQuizzes();
    this.initCertificateModal();
  }

  initFormativeQuizzes() {
    ['bab1', 'bab2', 'bab3', 'bab4', 'bab5', 'bab6'].forEach(chap => {
      const container = document.getElementById(`quiz-${chap}`);
      if (!container) return;

      const questions = QUIZ_DATA[chap];
      if (!questions) return;
      let html = '';

      questions.forEach((item, qIdx) => {
        html += `
          <div class="question-block" data-chap="${chap}" data-q="${qIdx}">
            <div class="question-text">${qIdx + 1}. ${item.q}</div>
            <div class="options-list">
              ${item.options.map((opt, oIdx) => `
                <div class="quiz-option" data-opt="${oIdx}">
                  <span style="font-weight: 700; width: 22px;">${String.fromCharCode(65 + oIdx)}.</span>
                  <span>${opt}</span>
                </div>
              `).join('')}
            </div>
            <div class="quiz-feedback" id="feedback-${chap}-${qIdx}"></div>
          </div>
        `;
      });

      html += `<button class="btn-submit-quiz" data-chap="${chap}">Periksa Jawaban ${chap.toUpperCase()}</button>`;
      container.innerHTML = html;

      // Click option logic
      container.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const qBlock = opt.closest('.question-block');
          const qIdx = qBlock.dataset.q;
          const oIdx = parseInt(opt.dataset.opt, 10);

          qBlock.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');

          if (!this.userAnswers[chap]) this.userAnswers[chap] = {};
          this.userAnswers[chap][qIdx] = oIdx;

          if (window.appAudio) window.appAudio.playClickSound();
        });
      });

      // Submit logic
      const submitBtn = container.querySelector('.btn-submit-quiz');
      submitBtn.addEventListener('click', () => {
        this.evaluateQuiz(chap);
      });
    });
  }

  evaluateQuiz(chap) {
    const questions = QUIZ_DATA[chap];
    const answers = this.userAnswers[chap] || {};
    let correctCount = 0;

    questions.forEach((item, qIdx) => {
      const selected = answers[qIdx];
      const feedbackEl = document.getElementById(`feedback-${chap}-${qIdx}`);
      const qBlock = document.querySelector(`.question-block[data-chap="${chap}"][data-q="${qIdx}"]`);
      if (!qBlock) return;
      const options = qBlock.querySelectorAll('.quiz-option');

      options.forEach(o => {
        o.classList.remove('correct', 'wrong');
        const oIdx = parseInt(o.dataset.opt, 10);
        if (oIdx === item.correct) {
          o.classList.add('correct');
        } else if (oIdx === selected && selected !== item.correct) {
          o.classList.add('wrong');
        }
      });

      if (feedbackEl) {
        feedbackEl.className = 'quiz-feedback show';
        if (selected === item.correct) {
          correctCount++;
          feedbackEl.classList.add('success');
          feedbackEl.innerHTML = `<strong>Benar!</strong> ${item.explanation}`;
        } else {
          feedbackEl.classList.add('error');
          feedbackEl.innerHTML = `<strong>Kurang tepat.</strong> ${item.explanation}`;
        }
      }
    });

    if (correctCount === questions.length) {
      if (window.appAudio) window.appAudio.playSuccessSound();
    }
  }

  initCertificateModal() {
    const generateBtn = document.getElementById('btnGenerateCert');
    const nameInput = document.getElementById('inputStudentName');
    const certDisplayName = document.getElementById('certStudentNameDisplay');
    const certDateDisplay = document.getElementById('certDateDisplay');
    const printBtn = document.getElementById('btnPrintCert');

    if (generateBtn && nameInput && certDisplayName) {
      generateBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
          alert('Silakan masukkan nama lengkap Anda terlebih dahulu!');
          return;
        }

        certDisplayName.textContent = name.toUpperCase();
        if (certDateDisplay) {
          const now = new Date();
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          certDateDisplay.textContent = now.toLocaleDateString('id-ID', options);
        }

        if (window.appAudio) window.appAudio.playSuccessSound();
        alert(`Selamat ${name}! Sertifikat kelulusan modul Teknik Pemesinan (TP) Anda telah berhasil diterbitkan.`);
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.quizController = new QuizController();
});

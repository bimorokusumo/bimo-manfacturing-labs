/**
 * QUIZ SYSTEM & CERTIFICATE GENERATOR
 * Formative evaluations for Chapters 1-5 + Final Exam + Printable Certificate
 */

const QUIZ_DATA = {
  // Bab 1: Kecakapan Kerja
  bab1: [
    {
      q: 'Mengapa pembacaan gambar teknik (drawing literacy) dan pemahaman simbol toleransi sangat penting bagi seorang teknisi fabrikasi logam?',
      options: [
        'Agar benda kerja dapat langsung dipotong tanpa perlu pengukuran ulang',
        'Untuk memastikan benda kerja diproduksi sesuai spesifikasi ukuran, geometri, dan fungsi rakitan industri',
        'Sebagai formalitas administratif pengawas bengkel saja',
        'Agar juru las tidak perlu mematuhi Standard Operating Procedure (SOP)'
      ],
      correct: 1,
      explanation: 'Gambar teknik adalah bahasa universal industri rekayasa. Memahami dimensi, simbol las, dan toleransi menjamin ketepatan ukuran (fit-up) dan fungsi rakitan.'
    },
    {
      q: 'Dalam Standard Operating Procedure (SOP) fabrikasi, tindakan pertama yang wajib dilakukan sebelum menyalakan mesin bertenaga adalah...',
      options: [
        'Langsung memotong benda kerja untuk menghemat waktu',
        'Memeriksa kelengkapan APD, kondisi isolasi kabel, serta kesiapan area kerja',
        'Meminta rekan kerja memegang pelat yang akan dipotong',
        'Mengubah setting putaran mesin melebihi batas RPM'
      ],
      correct: 1,
      explanation: 'Pemeriksaan pra-operasional (pre-operational check) meliputi APD dan inspeksi keselamatan wajib dilakukan untuk mencegah kecelakaan fatal.'
    }
  ],

  // Bab 2: K3LH & Budaya Kerja
  bab2: [
    {
      q: 'Pada proses pengelasan SMAW, radiasi sinar ultraviolet (UV) dan inframerah (IR) dapat menyebabkan penyakit mata akut yang disebut...',
      options: [
        'Miopi (rabun jauh)',
        'Arc Eye (fotokeratitis akut)',
        'Presbiopi',
        'Astigmatisma'
      ],
      correct: 1,
      explanation: 'Arc Eye adalah peradangan kornea mata akibat paparan radiasi UV busur las tanpa helm pelindung berspesifikasi filter DIN shade 9-13.'
    },
    {
      q: 'Prinsip "Seiton" (Rapi) dalam budaya industri 5R di bengkel las diterapkan melalui...',
      options: [
        'Membuang semua perkakas yang berkarat ke tempat sampah',
        'Menyapu lantai dari debu gerinda seminggu sekali',
        'Menempatkan perkakas pada shadow board dengan label jelas sesuai tempatnya',
        'Bekerja tanpa memedulikan susunan kabel las di lantai'
      ],
      correct: 2,
      explanation: 'Seiton menekankan keteraturan: "Ada tempat untuk setiap benda, dan setiap benda selalu berada di tempatnya" untuk efisiensi dan keselamatan.'
    }
  ],

  // Bab 3: Perkakas Bengkel
  bab3: [
    {
      q: 'Pada jangka sorong dengan ketelitian 0,05 mm, jika garis ke-7 pada skala nonius lurus dengan garis skala utama, maka nilai pecahan desimalnya adalah...',
      options: [
        '0,07 mm',
        '0,70 mm',
        '0,35 mm',
        '0,14 mm'
      ],
      correct: 2,
      explanation: 'Nilai nonius = 7 × 0,05 mm = 0,35 mm.'
    },
    {
      q: 'Untuk mencegah terjadinya sambaran api balik (flashback) pada pemotongan oksi-asetilin (OFC), komponen keselamatan yang wajib terpasang adalah...',
      options: [
        'Regulator ganda',
        'Flashback Arrestor',
        'Klem slang hidrolik',
        'Manometer cadangan'
      ],
      correct: 1,
      explanation: 'Flashback Arrestor berfungsi memadamkan lidah api balik dan menghentikan aliran gas seketika saat tekanan balik berbahaya terjadi.'
    }
  ],

  // Bab 4: Pengelasan SMAW Dasar
  bab4: [
    {
      q: 'Berdasarkan sistem kode elektroda AWS A5.1 E7018, angka "70" menunjukkan bahwa...',
      options: [
        'Elektroda hanya boleh digunakan pada arus 70 Ampere',
        'Kekuatan tarik minimum logam las adalah 70.000 psi (pon per inci persegi)',
        'Diameter inti kawat las adalah 7,0 mm',
        'Elektroda mengandung 70% serbuk besi'
      ],
      correct: 1,
      explanation: 'Dua digit pertama (70) menunjukkan kekuatan tarik minimum (minimum tensile strength) logam las dalam satuan ksi (70 ksi = 70.000 psi = ±490 MPa).'
    },
    {
      q: 'Cacat pengelasan berupa lubang-lubang gas kecil di dalam atau di permukaan logam las akibat hilangnya gas pelindung fluks disebut...',
      options: [
        'Undercut',
        'Porosity',
        'Slag Inclusion',
        'Burn Through'
      ],
      correct: 1,
      explanation: 'Porositas (Porosity) disebabkan oleh terperangkapnya gas saat pembekuan logam las, sering kali akibat busur terlalu panjang atau elektroda lembab.'
    }
  ],

  // Bab 5: Wawasan Dunia Kerja
  bab5: [
    {
      q: 'Teknologi pengelasan otomatis di mana busur las berputar mengelilingi sambungan pipa statis secara melingkar 360 derajat disebut...',
      options: [
        'Submerged Arc Welding',
        'Orbital Welding',
        'Thermite Welding',
        'Friction Stir Welding'
      ],
      correct: 1,
      explanation: 'Orbital Welding adalah sistem pengelasan terotomatisasi di mana kepala las bergerak melingkar (mengorbit) di sekeliling pipa stasioner.'
    },
    {
      q: 'Sertifikasi kompetensi juru las nasional yang diterbitkan di Indonesia berstandar SKKNI disahkan oleh badan resmi negara bernama...',
      options: [
        'BNSP (Badan Nasional Sertifikasi Profesi)',
        'Bappenas',
        'Kemendag',
        'BKPM'
      ],
      correct: 0,
      explanation: 'BNSP adalah lembaga independen negara yang berwenang menjamin mutu dan mengesahkan sertifikasi kompetensi kerja di Indonesia.'
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
    ['bab1', 'bab2', 'bab3', 'bab4', 'bab5'].forEach(chap => {
      const container = document.getElementById(`quiz-${chap}`);
      if (!container) return;

      const questions = QUIZ_DATA[chap];
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
        opt.addEventListener('click', (e) => {
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
        alert(`Selamat ${name}! Sertifikat digital kelulusan modul TFLM Anda telah berhasil diterbitkan.`);
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

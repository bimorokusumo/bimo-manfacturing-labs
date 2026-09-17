/**
 * INTERACTIVE SIMULATORS & WORKSHOP TOOLS
 * 1. Arc Lab (SMAW Virtual Welding Simulator)
 * 2. Vernier Caliper (Jangka Sorong 0.05mm) Simulator & Quiz
 * 3. APD Welder Inspector
 * 4. 5R Workshop Audit Board
 * 5. AWS Electrode Decoder
 */

// ==========================================
// 1. ARC LAB: SMAW WELDING SIMULATOR
// ==========================================
class ArcLabSimulator {
  constructor() {
    this.canvas = document.getElementById('arcLabCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.inputAmpere = document.getElementById('sliderAmpere');
    this.valAmpere = document.getElementById('valAmpere');
    this.selectSpeed = document.getElementById('selectSpeed');
    this.selectArc = document.getElementById('selectArc');
    this.feedbackCard = document.getElementById('labFeedback');

    this.sparks = [];
    this.animationId = null;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    if (this.inputAmpere) {
      this.inputAmpere.addEventListener('input', (e) => {
        if (this.valAmpere) this.valAmpere.textContent = `${e.target.value} A`;
        this.updateSimulation();
      });
    }

    if (this.selectSpeed) {
      this.selectSpeed.addEventListener('change', () => this.updateSimulation());
    }

    if (this.selectArc) {
      this.selectArc.addEventListener('change', () => this.updateSimulation());
    }

    this.startSparkLoop();
    this.updateSimulation();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width || 480;
    this.canvas.height = 180;
  }

  updateSimulation() {
    const ampere = parseInt(this.inputAmpere ? this.inputAmpere.value : 100, 10);
    const speed = this.selectSpeed ? this.selectSpeed.value : 'normal';
    const arc = this.selectArc ? this.selectArc.value : 'normal';

    let status = 'ideal';
    let title = 'Parameter Pengelasan Ideal!';
    let message = 'Penetrasi sambungan matang (2/3 tebal pelat), rigi las seragam tanpa undercut, dan terak mudah dibersihkan.';

    // Diagnostics logic
    if (ampere > 135) {
      status = 'danger';
      title = 'Cacat Undercut & Spatter Berlebih (Ampere Terlalu Tinggi)';
      message = 'Arus terlalu besar mencairkan pelat dasar berlebih sehingga timbul lekukan undercut tajam dan percikan bunga api kasar.';
    } else if (ampere < 75) {
      status = 'warning';
      title = 'Lack of Fusion / Cold Lap (Ampere Terlalu Rendah)';
      message = 'Arus kurang panas menyebabkan logam pengisi menumpuk di atas pelat tanpa peleburan (peleburan dangkal & rawan patah).';
    } else if (arc === 'long') {
      status = 'warning';
      title = 'Porosity & Busur Tidak Stabil (Busur Terlalu Panjang)';
      message = 'Jarak elektroda terlalu jauh merusak payung gas pelindung fluks. Udara masuk menimbulkan cacat pori-pori (porosity).';
    } else if (speed === 'fast') {
      status = 'warning';
      title = 'Jalur Las Terlalu Sempit & Kurang Penetrasi';
      message = 'Kecepatan jalan terlalu tinggi membuat kawah las cepat membeku sebelum sempat menembus dasar sambungan.';
    } else if (speed === 'slow') {
      status = 'warning';
      title = 'Rigi Las Terlalu Cembung & Melebar (Peleburan Berlebih)';
      message = 'Kecepatan jalan terlalu lambat membuat logam las menumpuk terlalu tebal dan menimbulkan panas berlebih pada pelat.';
    }

    if (this.feedbackCard) {
      this.feedbackCard.className = `lab-feedback-card ${status}`;
      this.feedbackCard.innerHTML = `
        <div style="font-size: 1.3rem;">${status === 'ideal' ? '✅' : (status === 'danger' ? '⚠️' : 'ℹ️')}</div>
        <div>
          <strong>${title}</strong>
          <p style="margin: 2px 0 0 0; font-size: 0.76rem;">${message}</p>
        </div>
      `;
    }

    this.drawScene(ampere, speed, arc, status);
  }

  drawScene(ampere, speed, arc, status) {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Base Metal Plates (Cross Section)
    const plateY = 95;
    const plateHeight = 45;
    const plateWidth = w * 0.82;
    const plateX = (w - plateWidth) / 2;

    // Base metal steel gradient
    const steelGrad = ctx.createLinearGradient(plateX, plateY, plateX, plateY + plateHeight);
    steelGrad.addColorStop(0, '#64748b');
    steelGrad.addColorStop(0.5, '#475569');
    steelGrad.addColorStop(1, '#334155');

    ctx.fillStyle = steelGrad;
    ctx.fillRect(plateX, plateY, plateWidth, plateHeight);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plateX, plateY, plateWidth, plateHeight);

    // 2. Weld Bead Geometry Calculation
    let beadW = 48; // normal width
    let beadH = 14; // height above plate
    let penetration = 18; // depth into plate

    if (ampere > 135) {
      beadW = 62;
      beadH = 10;
      penetration = 28;
    } else if (ampere < 75) {
      beadW = 34;
      beadH = 22;
      penetration = 8;
    }

    if (speed === 'fast') beadW *= 0.75;
    if (speed === 'slow') beadW *= 1.35;

    const centerX = w / 2;

    // 3. Draw Heat Affected Zone (HAZ)
    ctx.fillStyle = 'rgba(234, 88, 12, 0.28)';
    ctx.beginPath();
    ctx.ellipse(centerX, plateY + 6, (beadW / 2) + 12, penetration + 8, 0, 0, Math.PI);
    ctx.fill();

    // 4. Draw Penetration into Base Metal
    const weldGrad = ctx.createLinearGradient(centerX - beadW/2, plateY, centerX + beadW/2, plateY + penetration);
    weldGrad.addColorStop(0, '#94a3b8');
    weldGrad.addColorStop(0.5, '#cbd5e1');
    weldGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = weldGrad;
    ctx.beginPath();
    // Top crown of bead
    ctx.ellipse(centerX, plateY, beadW / 2, beadH, 0, Math.PI, 0);
    // Bottom root penetration
    ctx.ellipse(centerX, plateY, beadW / 2, penetration, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // Undercut notches if ampere high
    if (ampere > 135) {
      ctx.fillStyle = '#1e293b';
      // Left notch
      ctx.beginPath();
      ctx.arc(centerX - (beadW / 2), plateY + 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Right notch
      ctx.beginPath();
      ctx.arc(centerX + (beadW / 2), plateY + 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Draw Electrode & Arc Glow
    const elecX = centerX;
    const arcGap = arc === 'long' ? 24 : (arc === 'short' ? 8 : 15);
    const elecY = plateY - beadH - arcGap;

    // Arc Flash Flame
    const glowGrad = ctx.createRadialGradient(elecX, plateY - beadH, 2, elecX, plateY - beadH, arcGap + 25);
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    glowGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.7)');
    glowGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.3)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(elecX, plateY - beadH, arcGap + 25, 0, Math.PI * 2);
    ctx.fill();

    // Electrode Rod (Core + Flux coating)
    const rodW = 7;
    const rodH = 45;
    // Flux coating
    ctx.fillStyle = '#78716c';
    ctx.fillRect(elecX - rodW/2 - 2, elecY - rodH, rodW + 4, rodH);
    // Metallic Core Wire
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(elecX - rodW/2, elecY - rodH, rodW, rodH);

    // Labels on Canvas
    ctx.font = '10px var(--font-mono)';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Pelat Dasar (Baja Karbon)', plateX + 10, plateY + 30);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Rigi Las (${status.toUpperCase()})`, centerX - 40, plateY - beadH - arcGap - 10);
  }

  startSparkLoop() {
    const loop = () => {
      // Create random sparks
      if (this.canvas && Math.random() < 0.4) {
        const centerX = this.canvas.width / 2;
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
          this.sparks.push({
            x: centerX + (Math.random() * 20 - 10),
            y: 80,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 5 - 1,
            life: 1.0,
            color: Math.random() > 0.5 ? '#f59e0b' : '#38bdf8'
          });
        }
      }

      // Update sparks
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.25; // gravity
        s.life -= 0.04;
        if (s.life <= 0) {
          this.sparks.splice(i, 1);
        }
      }

      // Redraw simulation with sparks
      const ampere = parseInt(this.inputAmpere ? this.inputAmpere.value : 100, 10);
      const speed = this.selectSpeed ? this.selectSpeed.value : 'normal';
      const arc = this.selectArc ? this.selectArc.value : 'normal';
      this.drawScene(ampere, speed, arc, 'ideal');

      if (this.ctx) {
        this.sparks.forEach(s => {
          this.ctx.fillStyle = s.color;
          this.ctx.globalAlpha = s.life;
          this.ctx.beginPath();
          this.ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
          this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
      }

      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }
}

// ==========================================
// 2. VERNIER CALIPER (JANGKA SORONG 0.05mm)
// ==========================================
class VernierCaliperSimulator {
  constructor() {
    this.canvas = document.getElementById('caliperCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.slider = document.getElementById('sliderCaliper');
    this.valTotal = document.getElementById('caliperTotal');
    this.valMain = document.getElementById('caliperMain');
    this.valVernier = document.getElementById('caliperVernier');

    this.quizBtn = document.getElementById('btnCaliperQuiz');
    this.quizInput = document.getElementById('inputCaliperAnswer');
    this.quizFeedback = document.getElementById('caliperQuizFeedback');
    this.targetValue = null;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    if (this.slider) {
      this.slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.renderCaliper(val);
      });
    }

    if (this.quizBtn) {
      this.quizBtn.addEventListener('click', () => this.checkQuizAnswer());
    }

    this.renderCaliper(16.45);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width || 480;
    this.canvas.height = 160;
    const curVal = this.slider ? parseFloat(this.slider.value) : 16.45;
    this.renderCaliper(curVal);
  }

  renderCaliper(measureMm) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const pxPerMm = 4.2; // 1 mm = 4.2 pixels
    const originX = 50;

    // 1. Draw Fixed Main Beam (Skala Utama)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(10, 20, w - 20, 50);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 20, w - 20, 50);

    // Draw Main Scale ticks (0 to 80 mm)
    ctx.fillStyle = '#1e293b';
    ctx.font = '10px var(--font-mono)';
    ctx.textAlign = 'center';

    for (let mm = 0; mm <= 80; mm++) {
      const x = originX + mm * pxPerMm;
      if (x > w - 20) break;

      let tickLen = 6;
      if (mm % 10 === 0) {
        tickLen = 16;
        ctx.fillText(`${mm / 10}`, x, 32);
      } else if (mm % 5 === 0) {
        tickLen = 11;
      }

      ctx.beginPath();
      ctx.moveTo(x, 70);
      ctx.lineTo(x, 70 - tickLen);
      ctx.stroke();
    }

    // 2. Draw Sliding Vernier Scale (Skala Nonius 0.05 mm = 20 divisions for 19 mm)
    const vernierX = originX + measureMm * pxPerMm;
    const vernierWidth = 20 * (19 / 20) * pxPerMm + 24;

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(vernierX - 12, 70, vernierWidth, 60);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vernierX - 12, 70, vernierWidth, 60);

    // Vernier ticks (0, 1, 2, 3 ... 10 = 20 sub-ticks)
    ctx.fillStyle = '#0f172a';
    ctx.font = '9px var(--font-mono)';

    const vTickStep = (19 / 20) * pxPerMm;
    for (let v = 0; v <= 20; v++) {
      const vx = vernierX + v * vTickStep;
      let tickLen = 6;

      if (v % 2 === 0) {
        tickLen = 14;
        ctx.fillText(`${v / 2}`, vx, 104);
      } else {
        tickLen = 9;
      }

      ctx.beginPath();
      ctx.moveTo(vx, 70);
      ctx.lineTo(vx, 70 + tickLen);
      ctx.stroke();
    }

    // Vernier zero index marker
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(vernierX, 68);
    ctx.lineTo(vernierX - 4, 60);
    ctx.lineTo(vernierX + 4, 60);
    ctx.closePath();
    ctx.fill();

    // 3. Update Text Readouts
    const mainMm = Math.floor(measureMm);
    const fraction = measureMm - mainMm;
    const vernierDiv = Math.round(fraction / 0.05);
    const vernierMm = (vernierDiv * 0.05).toFixed(2);
    const calculatedTotal = (mainMm + parseFloat(vernierMm)).toFixed(2);

    if (this.valTotal) this.valTotal.textContent = `${calculatedTotal} mm`;
    if (this.valMain) this.valMain.textContent = `${mainMm}.00 mm`;
    if (this.valVernier) this.valVernier.textContent = `${vernierDiv} × 0.05 = ${vernierMm} mm`;
  }

  checkQuizAnswer() {
    if (!this.quizInput || !this.quizFeedback) return;
    const answer = parseFloat(this.quizInput.value);
    const curVal = this.slider ? parseFloat(this.slider.value) : 0;

    if (isNaN(answer)) {
      this.quizFeedback.className = 'quiz-feedback show error';
      this.quizFeedback.textContent = 'Masukkan angka hasil pengukuran yang valid!';
      return;
    }

    if (Math.abs(answer - curVal) <= 0.05) {
      this.quizFeedback.className = 'quiz-feedback show success';
      this.quizFeedback.textContent = `Hebat! Jawaban Anda tepat (${curVal.toFixed(2)} mm). Pembacaan skala nonius sangat akurat!`;
      if (window.appAudio) window.appAudio.playSuccessSound();
    } else {
      this.quizFeedback.className = 'quiz-feedback show error';
      this.quizFeedback.textContent = `Kurang tepat. Ukuran terbaca adalah ${curVal.toFixed(2)} mm. Periksa kembali garis skala utama sebelum angka nol dan garis skala nonius yang lurus.`;
    }
  }
}

// ==========================================
// 3. APD WELDER INSPECTOR
// ==========================================
const APD_DATA = {
  helmet: {
    title: 'Topeng / Helm Las Otomatis (Auto-Darkening Helmet)',
    desc: 'Melindungi mata, wajah, dan leher dari radiasi sinar ultraviolet (UV) dan inframerah (IR), serta percikan terak panas. Menggunakan filter optik otomatis beralih dari keadaan terang (shade 3/4) ke gelap (shade 9-13) dalam hitungan seperseribu detik begitu busur menyala.',
    hazard: 'Mencegah penyakit radiasi "Arc Eye" (fotokeratitis akut), katarak permanen, dan luka bakar percikan pada wajah.',
    standard: 'EN 175 / ANSI Z87.1 (Filter Din Shade 9-13)'
  },
  gloves: {
    title: 'Sarung Tangan Las Kulit (Welding Leather Gloves)',
    desc: 'Terbuat dari kulit split sapi atau kambing yang fleksibel dan tahan panas tinggi. Memiliki manset panjang (gauntlet cuff) untuk melindungi pergelangan dan lengan bawah dari bahaya radiasi panas dan percikan api.',
    hazard: 'Mencegah sengatan listrik arus bolak-balik/searah saat memegang tang elektroda serta luka bakar kontak panas.',
    standard: 'EN 388 & EN 12477 Tipe A/B'
  },
  apron: {
    title: 'Apron & Pakaian Pelindung Kulit (Leather Apron)',
    desc: 'Celemek atau jaket terbuat dari kulit sapi tebal tahan api. Didesain tanpa lipatan kantong terbuka agar percikan bunga api panas las tidak terperangkap dan memicu kebakaran pakaian kerja.',
    hazard: 'Mencegah pakaian terbakar dan luka bakar tembus akibat percikan terak cair.',
    standard: 'ISO 11611 Kelas 1/2'
  },
  shoes: {
    title: 'Sepatu Pengaman Baja (Safety Shoes Toe-Cap)',
    desc: 'Sepatu bot kerja tahan panas dengan pelindung pelat baja di ujung jari kaki (menahan benturan hingga 200 Joule) dan sol tahan tusukan paku/benda tajam serta isolator listrik statis.',
    hazard: 'Mencegah cedera remuk tertimpa pelat baja berat, tusukan sisa potongan logam, dan bahaya ground listrik bengkel.',
    standard: 'SNI 7079 / ISO 20345 (SB/S1P/S3)'
  },
  mask: {
    title: 'Masker Respirator Partikulat Las (Welding Fume Respirator)',
    desc: 'Masker berfilter partikulat khusus tipe N95 atau P2/FFP2 yang menyaring asap hasil penguapan fluks dan logam berat (oksida besi, mangan, seng, nikel, dan kromium heksavalen).',
    hazard: 'Mencegah penyakit demam uap logam (Metal Fume Fever), silikosis, dan kerusakan paru-paru jangka panjang.',
    standard: 'NIOSH N95 / EN 149 FFP2'
  },
  earplug: {
    title: 'Penyumbat Telinga (Ear Plug / Ear Muff)',
    desc: 'Alat peredam bising saat melakukan pekerjaan persiapan seperti pemotongan pelat dengan gerinda, pemukulan palu terak, dan mesin potong guillotine yang melebihi ambang batas 85 dB.',
    hazard: 'Mencegah gangguan pendengaran permanen (Noise Induced Hearing Loss / NIHL).',
    standard: 'OSHA 1910.95 / NRR 25-33 dB'
  }
};

function initAPDInspector() {
  const buttons = document.querySelectorAll('.apd-item-btn');
  const displayTitle = document.getElementById('apdDetailTitle');
  const displayDesc = document.getElementById('apdDetailDesc');
  const displayHazard = document.getElementById('apdDetailHazard');
  const displayStandard = document.getElementById('apdDetailStandard');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const apdKey = btn.dataset.apd;
      const data = APD_DATA[apdKey];
      if (data && displayTitle) {
        displayTitle.textContent = data.title;
        displayDesc.textContent = data.desc;
        displayHazard.textContent = `Bahaya Dicegah: ${data.hazard}`;
        if (displayStandard) displayStandard.textContent = `Standar: ${data.standard}`;
      }
      if (window.appAudio) window.appAudio.playClickSound();
    });
  });
}

// ==========================================
// 4. 5R WORKSHOP AUDIT
// ==========================================
const R5_DATA = {
  seiri: {
    title: 'Ringkas (Seiri) - Pemilahan Nyata di Bengkel',
    desc: 'Memilah benda yang benar-benar diperlukan dari benda yang sudah tidak terpakai. Contoh: Singkirkan potongan pelat bekas (scrap), sisa puntung elektroda las di bawah 50mm, dan perkakas rusak ke dalam kotak penampungan khusus atau label merah (Red Tag).',
    action: 'Lakukan pemilahan setiap selesai sesi praktik agar area kerja bebas dari benda tak berguna yang memicu bahaya tersandung.'
  },
  seiton: {
    title: 'Rapi (Seiton) - Penataan Teratur & Sistematis',
    desc: 'Menata letak perkakas tangan (palu terak, kikir, sikat baja, penjepit) pada papan bayangan (shadow board) dan memberi label jelas pada rak tabung gas, elektroda, dan material kerja.',
    action: 'Prinsip: "Ada tempat untuk setiap benda, dan setiap benda selalu berada di tempatnya". Menghemat 80% waktu pencarian alat!'
  },
  seiso: {
    title: 'Resik (Seiso) - Pembersihan Sekaligus Pemeriksaan',
    desc: 'Membersihkan bilik las (welding booth), membersihkan meja kerja dari debu gerinda dan percikan terak, serta memeriksa kabel las dari kebocoran isolasi karet.',
    action: 'Membersihkan bukan sekadar menyapu, tetapi juga memeriksa kondisi mesin agar kerusakan dini dapat terdeteksi.'
  },
  seiketsu: {
    title: 'Rawat (Seiketsu) - Pemeliharaan Standar Konsisten',
    desc: 'Membuat Standar Operasional Prosedur (SOP) visual, jadwal piket harian, dan rambu keselamatan yang seragam di seluruh sudut bengkel manufaktur.',
    action: 'Menjaga 3R sebelumnya (Ringkas, Rapi, Resik) menjadi sebuah standar baku kerja tanpa kompromi.'
  },
  shitsuke: {
    title: 'Rajin (Shitsuke) - Pembiasaan & Disiplin Karakter',
    desc: 'Membangun disiplin diri setiap siswa untuk selalu memakai APD lengkap, mematuhi SOP tanpa harus diawasi guru, dan melakukan briefing 5 menit sebelum praktik.',
    action: 'Puncak dari budaya kerja industri: etika kerja profesional yang menjadi kebiasaan refleks seumur hidup.'
  }
};

function init5RBoard() {
  const cards = document.querySelectorAll('.r5-badge-card');
  const expBox = document.getElementById('r5ExplanationBox');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const rKey = card.dataset.r;
      const info = R5_DATA[rKey];
      if (info && expBox) {
        expBox.innerHTML = `
          <h5 style="color: var(--accent-blue); margin-bottom: 6px; font-size: 0.95rem;">${info.title}</h5>
          <p style="margin-bottom: 8px;">${info.desc}</p>
          <div style="background: rgba(2, 132, 199, 0.08); border-left: 3px solid var(--accent-cyan); padding: 6px 10px; font-size: 0.76rem; border-radius: 0 4px 4px 0;">
            <strong>Aksi Nyata Siswa:</strong> ${info.action}
          </div>
        `;
      }
      if (window.appAudio) window.appAudio.playClickSound();
    });
  });
}

// ==========================================
// 5. AWS ELECTRODE DECODER
// ==========================================
const ELECTRODE_PRESETS = {
  E6013: {
    code: ['E', '60', '1', '3'],
    name: 'AWS A5.1 E6013 (Tipe Rutile / RB-26)',
    tensile: '60.000 psi (420 MPa) Kuat Tarik Minimum',
    pos: '1 = Semua Posisi (All Position: Flat, Horizontal, Vertical Up/Down, Overhead)',
    coating: '3 = Salutan Kalium Titania (Rutil). Busur halus, penetrasi sedang, terak mudah lepas, cocok untuk pelat tipis dan baja karbon struktural.',
    current: 'AC, DCEN (DC-), atau DCEP (DC+)'
  },
  E7016: {
    code: ['E', '70', '1', '6'],
    name: 'AWS A5.1 E7016 (Tipe Rendah Hidrogen / LB-52)',
    tensile: '70.000 psi (490 MPa) Kuat Tarik Minimum',
    pos: '1 = Semua Posisi Pengelasan',
    coating: '6 = Salutan Kalium Rendah Hidrogen (Low Hydrogen Potassium). Logam las sangat tangguh, tahan retak dingin pada konstruksi bejana tekan & jembatan.',
    current: 'AC atau DCEP (DC+)'
  },
  E7018: {
    code: ['E', '70', '1', '8'],
    name: 'AWS A5.1 E7018 (Tipe Serbuk Besi Rendah Hidrogen)',
    tensile: '70.000 psi (490 MPa) Kuat Tarik Minimum',
    pos: '1 = Semua Posisi Pengelasan',
    coating: '8 = Salutan Kalium Serbuk Besi Rendah Hidrogen (Iron Powder Low Hydrogen). Efisiensi deposisi tinggi, sambungan berkualitas tinggi untuk pipa dan baja tebal.',
    current: 'AC atau DCEP (DC+)'
  },
  E6010: {
    code: ['E', '60', '1', '0'],
    name: 'AWS A5.1 E6010 (Tipe Selulosa / Root Pass)',
    tensile: '60.000 psi (420 MPa) Kuat Tarik Minimum',
    pos: '1 = Semua Posisi Pengelasan',
    coating: '0 = Salutan Natrium Selulosa (High Cellulose Sodium). Busur menyembur kuat, penetrasi sangat dalam (deep penetration), spesialis las penembusan akar (root pass) pipa migas.',
    current: 'Khusus DCEP (DC+)'
  }
};

function initElectrodeDecoder() {
  const pills = document.querySelectorAll('.electrode-select-pill');
  const codeBox = document.getElementById('awsCodeDisplay');
  const descBox = document.getElementById('awsDescDisplay');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const key = pill.dataset.code;
      const d = ELECTRODE_PRESETS[key];
      if (!d) return;

      if (codeBox) {
        codeBox.innerHTML = `
          <div class="aws-pill active"><span class="aws-char">${d.code[0]}</span><span class="aws-meaning-tag">Elektroda</span></div>
          <div class="aws-pill active"><span class="aws-char">${d.code[1]}</span><span class="aws-meaning-tag">${d.tensile.split(' ')[0]} psi</span></div>
          <div class="aws-pill active"><span class="aws-char">${d.code[2]}</span><span class="aws-meaning-tag">Semua Posisi</span></div>
          <div class="aws-pill active"><span class="aws-char">${d.code[3]}</span><span class="aws-meaning-tag">Jenis Fluks</span></div>
        `;
      }

      if (descBox) {
        descBox.innerHTML = `
          <h5 style="color: var(--accent-cyan); font-size: 0.95rem; margin-bottom: 6px;">${d.name}</h5>
          <p><strong>Kekuatan Tarik:</strong> ${d.tensile}</p>
          <p><strong>Posisi Pengelasan:</strong> ${d.pos}</p>
          <p><strong>Karakteristik Salutan (Fluks):</strong> ${d.coating}</p>
          <p><strong>Polaritas Listrik:</strong> ${d.current}</p>
        `;
      }

      if (window.appAudio) window.appAudio.playClickSound();
    });
  });
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.arcLab = new ArcLabSimulator();
  window.caliperSim = new VernierCaliperSimulator();
  initAPDInspector();
  init5RBoard();
  initElectrodeDecoder();
});

/**
 * INTERACTIVE SIMULATORS & WORKSHOP TOOLS FOR TEKNIK PEMESINAN (TP)
 * 1. Vernier Caliper (Jangka Sorong 0.05mm) Simulator & Quiz
 * 2. Lathe Spindle RPM & Cutting Parameter Calculator
 * 3. Orthogonal Projection Viewer (Eropa vs Amerika)
 * 4. ISO Bearing Code Decoder (6205-2RS, etc.)
 * 5. APD Pemesinan Inspector (Safety Around Rotating Spindles)
 * 6. 5R Machine Shop Audit Board
 */

// ==========================================
// 1. VERNIER CALIPER (JANGKA SORONG 0.05mm)
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

    this.renderCaliper(24.35);
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width || 480;
    this.canvas.height = 160;
    const curVal = this.slider ? parseFloat(this.slider.value) : 24.35;
    this.renderCaliper(curVal);
  }

  renderCaliper(measureMm) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const pxPerMm = 4.2;
    const originX = 50;

    // 1. Main Beam
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(10, 20, w - 20, 50);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 20, w - 20, 50);

    ctx.fillStyle = '#1e293b';
    ctx.font = '10px var(--font-mono, monospace)';
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

    // 2. Sliding Vernier
    const vernierX = originX + measureMm * pxPerMm;
    const vernierWidth = 20 * (19 / 20) * pxPerMm + 24;

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(vernierX - 12, 70, vernierWidth, 60);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vernierX - 12, 70, vernierWidth, 60);

    ctx.fillStyle = '#0f172a';
    ctx.font = '9px var(--font-mono, monospace)';

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

    // Zero Marker
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(vernierX, 72);
    ctx.lineTo(vernierX - 4, 80);
    ctx.lineTo(vernierX + 4, 80);
    ctx.closePath();
    ctx.fill();

    // Update Readouts
    const mainVal = Math.floor(measureMm);
    const noniusVal = Math.round((measureMm - mainVal) * 100) / 100;
    const noniusDiv = Math.round(noniusVal / 0.05);

    if (this.valTotal) this.valTotal.textContent = `${measureMm.toFixed(2)} mm`;
    if (this.valMain) this.valMain.textContent = `${mainVal.toFixed(2)} mm`;
    if (this.valVernier) this.valVernier.textContent = `${noniusVal.toFixed(2)} mm (Strip ke-${noniusDiv})`;
  }

  checkQuizAnswer() {
    if (!this.quizInput || !this.quizFeedback) return;
    const ans = parseFloat(this.quizInput.value);
    const target = 28.65;

    if (isNaN(ans)) {
      this.quizFeedback.textContent = 'Ketikkan angka desimal!';
      this.quizFeedback.style.color = '#ef4444';
      return;
    }

    if (Math.abs(ans - target) < 0.02) {
      this.quizFeedback.textContent = '✅ Luar biasa! Jawaban Anda sangat tepat (28,65 mm)!';
      this.quizFeedback.style.color = '#10b981';
      if (window.appAudio) window.appAudio.playSuccessSound();
    } else {
      this.quizFeedback.textContent = `❌ Belum tepat. Target adalah ${target} mm. Terus latih kepekaan mata!`;
      this.quizFeedback.style.color = '#ef4444';
    }
  }
}

// ==========================================
// 2. LATHE CUTTING SPEED & SPINDLE RPM CALCULATOR
// ==========================================
class LatheParameterCalculator {
  constructor() {
    this.selectMaterial = document.getElementById('selectLatheMat');
    this.sliderDiameter = document.getElementById('sliderLatheDiam');
    this.valDiameter = document.getElementById('valLatheDiam');
    this.valCs = document.getElementById('valLatheCs');
    this.displayRpm = document.getElementById('displayLatheRpm');
    this.displayStandardRpm = document.getElementById('displayLatheStdRpm');
    this.latheAnimCanvas = document.getElementById('latheCanvas');

    this.csValues = {
      st37: { name: 'Baja Karbon Rendah (St 37 / Mild Steel)', hss: 25, carb: 100 },
      s45c: { name: 'Baja Karbon Sedang (S45C / Medium Carbon)', hss: 20, carb: 80 },
      fc250: { name: 'Besi Tuang Kelabu (Cast Iron FC 250)', hss: 18, carb: 75 },
      al6061: { name: 'Paduan Aluminium (Al 6061)', hss: 60, carb: 250 },
      brass: { name: 'Kuningan / Tembaga (Brass / Copper)', hss: 35, carb: 140 }
    };

    this.standardLatheSteps = [60, 90, 130, 190, 280, 410, 600, 880, 1250, 1800, 2500];

    this.init();
  }

  init() {
    if (this.selectMaterial) {
      this.selectMaterial.addEventListener('change', () => this.calculate());
    }
    if (this.sliderDiameter) {
      this.sliderDiameter.addEventListener('input', (e) => {
        if (this.valDiameter) this.valDiameter.textContent = `${e.target.value} mm`;
        this.calculate();
      });
    }
    this.calculate();
  }

  calculate() {
    const matKey = this.selectMaterial ? this.selectMaterial.value : 'st37';
    const matInfo = this.csValues[matKey] || this.csValues.st37;
    const toolType = document.querySelector('input[name="latheToolType"]:checked')?.value || 'hss';
    const cs = toolType === 'carbide' ? matInfo.carb : matInfo.hss;
    const d = parseFloat(this.sliderDiameter ? this.sliderDiameter.value : 30);

    if (this.valCs) this.valCs.textContent = `${cs} m/menit`;

    // Formula: n = (1000 * Cs) / (pi * d)
    const exactRpm = (1000 * cs) / (Math.PI * d);

    // Closest standard spindle speed step on lathe gearbox
    let closestStd = this.standardLatheSteps[0];
    let minDiff = Math.abs(closestStd - exactRpm);
    for (let step of this.standardLatheSteps) {
      const diff = Math.abs(step - exactRpm);
      if (diff < minDiff) {
        minDiff = diff;
        closestStd = step;
      }
    }

    if (this.displayRpm) this.displayRpm.textContent = `${Math.round(exactRpm)} RPM`;
    if (this.displayStandardRpm) this.displayStandardRpm.textContent = `${closestStd} RPM (Pilih Tuas Gearbox)`;

    this.drawLatheVisual(exactRpm, d, matKey);
  }

  drawLatheVisual(rpm, d, matKey) {
    if (!this.latheAnimCanvas) return;
    const ctx = this.latheAnimCanvas.getContext('2d');
    const w = this.latheAnimCanvas.width;
    const h = this.latheAnimCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw Chuck & Workpiece
    const chuckW = 50;
    const chuckH = 90;
    ctx.fillStyle = '#475569';
    ctx.fillRect(20, h/2 - chuckH/2, chuckW, chuckH);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(20, h/2 - chuckH/2, chuckW, chuckH);

    // Workpiece
    const workW = 160;
    const workH = Math.min(60, Math.max(20, d * 0.9));
    ctx.fillStyle = matKey === 'al6061' ? '#cbd5e1' : (matKey === 'brass' ? '#fbbf24' : '#94a3b8');
    ctx.fillRect(70, h/2 - workH/2, workW, workH);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(70, h/2 - workH/2, workW, workH);

    // Tool Bit
    const toolX = 170;
    const toolY = h/2 + workH/2;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(toolX, toolY);
    ctx.lineTo(toolX + 30, toolY + 30);
    ctx.lineTo(toolX - 10, toolY + 30);
    ctx.closePath();
    ctx.fill();

    // Spindle text
    ctx.font = '11px var(--font-mono, monospace)';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Putaran: ${Math.round(rpm)} RPM`, 80, 25);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Benda: Ø${d} mm`, 80, h - 15);
  }
}

// ==========================================
// 3. PROJECTION VIEWER (EROPA VS AMERIKA)
// ==========================================
class ProjectionViewer {
  constructor() {
    this.btnEropa = document.getElementById('btnProjEropa');
    this.btnAmerika = document.getElementById('btnProjAmerika');
    this.symbolDisplay = document.getElementById('projSymbolDisplay');
    this.descDisplay = document.getElementById('projDescDisplay');
    this.layoutDisplay = document.getElementById('projLayoutDisplay');

    this.init();
  }

  init() {
    if (this.btnEropa) {
      this.btnEropa.addEventListener('click', () => this.switchMode('eropa'));
    }
    if (this.btnAmerika) {
      this.btnAmerika.addEventListener('click', () => this.switchMode('amerika'));
    }
  }

  switchMode(mode) {
    if (mode === 'eropa') {
      if (this.btnEropa) this.btnEropa.classList.add('active');
      if (this.btnAmerika) this.btnAmerika.classList.remove('active');

      if (this.descDisplay) {
        this.descDisplay.innerHTML = `
          <h5 style="color: var(--accent-cyan); margin-bottom: 6px;">Proyeksi Sudut Pertama (Proyeksi Eropa / First Angle Projection)</h5>
          <p>Benda diletakkan di <strong>Kuadran I</strong> di antara pengamat dan bidang proyeksi. Bayangan diproyeksikan <em>menembus</em> benda ke bidang belakangnya.</p>
          <p><strong>Karakteristik Tata Letak (Terbalik):</strong> Pandangan Kiri diletakkan di sebelah KANAN pandangan depan; Pandangan Atas diletakkan di BAWAH pandangan depan.</p>
        `;
      }
      if (this.layoutDisplay) {
        this.layoutDisplay.innerHTML = `
          <div style="display:grid; grid-template-columns: 80px 80px 80px; gap:6px; justify-content:center; text-align:center; font-size:0.75rem; font-weight:700;">
            <div></div><div style="background:#1e3a5f; color:#fff; padding:8px; border-radius:4px;">Bawah</div><div></div>
            <div style="background:#1e3a5f; color:#fff; padding:8px; border-radius:4px;">Kanan</div>
            <div style="background:#0284c7; color:#fff; padding:8px; border-radius:4px;">DEPAN</div>
            <div style="background:#1e3a5f; color:#fff; padding:8px; border-radius:4px;">Kiri</div>
            <div></div><div style="background:#1e3a5f; color:#fff; padding:8px; border-radius:4px;">Atas</div><div></div>
          </div>
        `;
      }
    } else {
      if (this.btnAmerika) this.btnAmerika.classList.add('active');
      if (this.btnEropa) this.btnEropa.classList.remove('active');

      if (this.descDisplay) {
        this.descDisplay.innerHTML = `
          <h5 style="color: var(--accent-amber); margin-bottom: 6px;">Proyeksi Sudut Ketiga (Proyeksi Amerika / Third Angle Projection)</h5>
          <p>Benda diletakkan di <strong>Kuadran III</strong> di belakang bidang proyeksi tembus pandang. Pengamat melihat langsung permukaan benda pada kaca bidang di depannya.</p>
          <p><strong>Karakteristik Tata Letak (Wajar/Alami):</strong> Pandangan Kanan terletak di KANAN; Pandangan Kiri di KIRI; Pandangan Atas di ATAS pandangan depan.</p>
        `;
      }
      if (this.layoutDisplay) {
        this.layoutDisplay.innerHTML = `
          <div style="display:grid; grid-template-columns: 80px 80px 80px; gap:6px; justify-content:center; text-align:center; font-size:0.75rem; font-weight:700;">
            <div></div><div style="background:#1e3a5f; color:#fff; padding:8px; border-radius:4px;">Atas</div><div></div>
            <div style="background:#1e3a5f; color:#fff; padding:8px; border-radius:4px;">Kiri</div>
            <div style="background:#0284c7; color:#fff; padding:8px; border-radius:4px;">DEPAN</div>
            <div style="background:#1e3a5f; color:#fff; padding:8px; border-radius:4px;">Kanan</div>
            <div></div><div style="background:#1e3a5f; color:#fff; padding:8px; border-radius:4px;">Bawah</div><div></div>
          </div>
        `;
      }
    }

    if (window.appAudio) window.appAudio.playClickSound();
  }
}

// ==========================================
// 4. ISO BEARING CODE DECODER
// ==========================================
const BEARING_PRESETS = {
  '6205': {
    code: ['6', '2', '05', '2RS'],
    type: 'Bantalan Bola Alur Dalam Baris Tunggal (Deep Groove Ball Bearing)',
    series: '2 = Seri Beban Ringan (Light Duty Series)',
    bore: '05 × 5 = Ø 25 mm Diameter Lubang Poros Dalam',
    seal: '2RS = Dua Karet Sintetis Penutup (Rubber Seal) Tahan Debu & Cipratan Air'
  },
  '6308': {
    code: ['6', '3', '08', 'ZZ'],
    type: 'Bantalan Bola Alur Dalam (Deep Groove Ball Bearing)',
    series: '3 = Seri Beban Sedang-Berat (Medium Heavy Duty)',
    bore: '08 × 5 = Ø 40 mm Diameter Lubang Poros Dalam',
    seal: 'ZZ = Dua Pelat Baja Pelindung (Metal Shield) Tahan Suhu Tinggi'
  },
  '30206': {
    code: ['3', '02', '06', 'Open'],
    type: 'Bantalan Rol Tirus (Tapered Roller Bearing)',
    series: '02 = Mampu Menahan Beban Kombinasi Radial & Aksial Satu Arah Sangat Kuat',
    bore: '06 × 5 = Ø 30 mm Diameter Poros Spindel',
    seal: 'Open = Terbuka untuk Pelumasan Gemuk / Oli Sirkulasi Berkala'
  }
};

function initBearingDecoder() {
  const pills = document.querySelectorAll('.bearing-select-pill');
  const codeBox = document.getElementById('bearingCodeDisplay');
  const descBox = document.getElementById('bearingDescDisplay');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const key = pill.dataset.bearing;
      const d = BEARING_PRESETS[key];
      if (!d) return;

      if (codeBox) {
        codeBox.innerHTML = `
          <div class="aws-pill active"><span class="aws-char">${d.code[0]}</span><span class="aws-meaning-tag">Tipe</span></div>
          <div class="aws-pill active"><span class="aws-char">${d.code[1]}</span><span class="aws-meaning-tag">Seri Beban</span></div>
          <div class="aws-pill active"><span class="aws-char">${d.code[2]}</span><span class="aws-meaning-tag">Bore × 5</span></div>
          <div class="aws-pill active"><span class="aws-char">${d.code[3]}</span><span class="aws-meaning-tag">Seal</span></div>
        `;
      }

      if (descBox) {
        descBox.innerHTML = `
          <h5 style="color: var(--accent-cyan); font-size: 0.95rem; margin-bottom: 6px;">Standar ISO Bearing: ${key}</h5>
          <p><strong>Tipe Bantalan:</strong> ${d.type}</p>
          <p><strong>Seri Beban:</strong> ${d.series}</p>
          <p><strong>Diameter Dalam Poros:</strong> ${d.bore}</p>
          <p><strong>Tutup / Perapat:</strong> ${d.seal}</p>
        `;
      }

      if (window.appAudio) window.appAudio.playClickSound();
    });
  });
}

// ==========================================
// 5. APD PEMESINAN INSPECTOR
// ==========================================
const APD_TP_DATA = {
  glasses: {
    title: 'Kacamata Pengaman (Safety Glasses / Goggles)',
    desc: 'Melindungi mata dari serpihan tatal/beram logam panas yang terlempar dengan kecepatan tinggi saat membubut, memfrais, dan mengebor.',
    hazard: 'Mencegah kebutaan permanen akibat tusukan beram pijar tajam.',
    standard: 'ANSI Z87.1 / EN 166'
  },
  shoes: {
    title: 'Sepatu Keselamatan Ujung Baja (Safety Shoes 200J)',
    desc: 'Sepatu kerja bersol tebal anti-slip minyak pendingin (coolant) dan pelat baja di ujung jari kaki yang menahan benturan hingga 200 Joule.',
    hazard: 'Mencegah jari kaki hancur tertimpa ragum, chuck bubut, atau balok logam berat.',
    standard: 'SNI 7079 / ISO 20345'
  },
  earplug: {
    title: 'Penyumbat Telinga (Ear Plug / Ear Muff)',
    desc: 'Peredam kebisingan saat mengoperasikan mesin bubut serentak atau gerinda potong di atas ambang 85 dB.',
    hazard: 'Mencegah penurunan fungsi pendengaran permanen (NIHL).',
    standard: 'OSHA 1910.95 / NRR 25-30 dB'
  },
  shield: {
    title: 'Kaca Perisai Tatal Mesin (Chuck & Chip Guard)',
    desc: 'Tudung polikarbonat transparan yang menutupi cekam bubut dan area pemakanan pahat untuk menghentikan lontaran beram dan cipratan coolant.',
    hazard: 'Mencegah tatal spiral tajam mengenai muka operator.',
    standard: 'ISO 23125 Standard Mesin Bubut'
  },
  nogloves: {
    title: '⚠️ ATURAN MUTLAK: LARANGAN MEMAKAI SARUNG TANGAN',
    desc: 'DILARANG KERAS memakai sarung tangan rajut/kain saat mengoperasikan mesin dengan spindel berputar (Mesin Bubut, Bor Duduk, Mesin Frais). Serat kain dapat tersangkut dan menggulung tangan operator ke dalam mesin dalam hitungan milidetik!',
    hazard: 'Mencegah cedera amputasi fatal atau tangan terlilit ke spindel berputar 1000+ RPM!',
    standard: 'Standar Keselamatan Mesin Perkakas Global'
  }
};

function initAPDTPInspector() {
  const buttons = document.querySelectorAll('.apd-tp-btn');
  const displayTitle = document.getElementById('apdTPTitle');
  const displayDesc = document.getElementById('apdTPDesc');
  const displayHazard = document.getElementById('apdTPHazard');
  const displayStandard = document.getElementById('apdTPStandard');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.dataset.apdtp;
      const data = APD_TP_DATA[key];
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
// 6. 5R WORKSHOP AUDIT
// ==========================================
const R5_TP_DATA = {
  seiri: {
    title: 'Ringkas (Seiri) - Pemilahan Nyata Bengkel Mesin',
    desc: 'Pilah tatal logam (scrap/beram) bekas pemakanan ke dalam bak penampung chip. Singkirkan pahat yang patah atau aus ke kotak perbaikan.',
    action: 'Bebaskan meja mesin bubut dari benda-benda yang tidak dipakai saat proses pemesinan berlangsung.'
  },
  seiton: {
    title: 'Rapi (Seiton) - Penataan Kunci Chuck & Pahat',
    desc: 'Tempatkan kunci chuck bubut pada gantungan bersensor pegas; susun mata bor dan pahat bubut pada rak berslot ukuran teratur.',
    action: 'JANGAN PERNAH meninggalkan kunci chuck tertancap pada cekam mesin bubut!'
  },
  seiso: {
    title: 'Resik (Seiso) - Pembersihan Bed Mesin & Coolant',
    desc: 'Bersihkan alur eretan dan meja mesin bubut (lathe bed ways) menggunakan kuas (bukan ditiup kompresor udara agar beram tidak masuk ke celah slide).',
    action: 'Lap dan beri lapisan oli pelumas tipis pada meja mesin setiap selesai jam praktik.'
  },
  seiketsu: {
    title: 'Rawat (Seiketsu) - Standarisasi Pemeliharaan',
    desc: 'Terapkan visual SOP pelumasan berkala, indikator level oli gearbox, dan lembar checklist harian mesin perkakas.',
    action: 'Memastikan standar Ringkas, Rapi, dan Resik dijaga konsisten oleh setiap kelompok siswa.'
  },
  shitsuke: {
    title: 'Rajin (Shitsuke) - Pembiasaan & Disiplin Karakter',
    desc: 'Membangun etos disiplin diri: memakai kacamata safety tanpa diingatkan, mengembalikan alat ke rak tepat waktu, dan saling mengingatkan keselamatan.',
    action: 'Menjadikan budaya K3 dan 5R sebagai refleks alami teknisi manufaktur kelas dunia.'
  }
};

function init5RTPBoard() {
  const cards = document.querySelectorAll('.r5-tp-card');
  const expBox = document.getElementById('r5TPExplanationBox');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const rKey = card.dataset.r;
      const info = R5_TP_DATA[rKey];
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

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.caliperSim = new VernierCaliperSimulator();
  window.latheCalc = new LatheParameterCalculator();
  window.projViewer = new ProjectionViewer();
  initBearingDecoder();
  initAPDTPInspector();
  init5RTPBoard();
});

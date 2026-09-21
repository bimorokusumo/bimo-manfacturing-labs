import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { recordQuizResult } from '../services/sheetService';

export default function K3LHEmergencyModule() {
  const [activeSubSection, setActiveSubSection] = useState('hukum_k3');
  
  // Simulator APAR State
  const [passStep, setPassStep] = useState(0); // 0: Idle, 1: Pull, 2: Aim, 3: Squeeze, 4: Sweep (Success)
  const [selectedFireScenario, setSelectedFireScenario] = useState('oli_bengkel');
  const [aparFeedback, setAparFeedback] = useState('');

  // Skenario Kebakaran Bengkel
  const FIRE_SCENARIOS = {
    oli_bengkel: {
      title: 'Tumpahan Oli Pelumas Terbakar di Bawah Mesin Bubut',
      class: 'Kelas B (Cairan Mudah Terbakar)',
      danger: 'Dilarang keras menyiram dengan air! Air akan membuat minyak memercik dan memperluas kobaran api secara eksplosif.',
      idealApar: 'Dry Chemical Powder ABC atau Foam (Busa)',
      hazardLevel: 'Tinggi'
    },
    panel_listrik: {
      title: 'Korsleting Panel Distribusi Listrik 380V Mesin CNC',
      class: 'Kelas C (Instalasi Listrik Bertegangan)',
      danger: 'Media pemadam berbasis air atau busa menghantarkan arus listrik mematikan ke tubuh operator!',
      idealApar: 'Gas Karbon Dioksida (CO2) atau Dry Chemical Powder',
      hazardLevel: 'Kritis'
    },
    majun_tatal: {
      title: 'Tumpukan Kain Majun Terkena Percikan Bunga Api Gerinda',
      class: 'Kelas A (Benda Padat Mudah Terbakar)',
      danger: 'Api cepat merambat ke rak penyimpanan perkakas jika tidak segera dilokalisasi.',
      idealApar: 'Air, Dry Chemical Powder, atau Busa Foam',
      hazardLevel: 'Sedang'
    }
  };

  const handlePassAction = (stepIndex) => {
    sound.playClick();
    if (stepIndex === passStep + 1) {
      setPassStep(stepIndex);
      if (stepIndex === 1) {
        setAparFeedback('✅ Pin Pengaman Berhasil Ditarik (PULL)! Segel pengunci telah terbuka.');
      } else if (stepIndex === 2) {
        setAparFeedback('✅ Nozzle Diarahkan ke Pangkal Api (AIM)! Posisi sudut 30-45° dengan jarak aman 2.5 meter.');
      } else if (stepIndex === 3) {
        setAparFeedback('✅ Tuas Ditekan Penuh (SQUEEZE)! Serbuk pemadam bertekanan tinggi mulai menyembur.');
      } else if (stepIndex === 4) {
        sound.playSuccess();
        setAparFeedback('🏆 API BERHASIL DIPADAMKAN (SWEEP)! Gerakan menyapu dari kiri ke kanan menutupi seluruh sumber oksigen.');
        
        recordQuizResult({
          modul: 'Safety Lab - K3 & APD',
          judulKuis: `Simulasi APAR PASS: ${FIRE_SCENARIOS[selectedFireScenario].title}`,
          skor: 100,
          jawabanBenar: 4,
          totalSoal: 4,
          detailJawaban: `Eksekusi PASS sempurna: Pull -> Aim -> Squeeze -> Sweep pada skenario ${FIRE_SCENARIOS[selectedFireScenario].class}`
        });
      }
    } else {
      sound.playError();
      setAparFeedback('⚠️ Urutan Prosedur Keliru! Ingat metode standar industri: P-A-S-S (Pull ➔ Aim ➔ Squeeze ➔ Sweep).');
    }
  };

  const resetPassSim = () => {
    sound.playClick();
    setPassStep(0);
    setAparFeedback('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SUB-NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#f8fafc', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        {[
          { id: 'hukum_k3', label: '📜 Regulasi & Kebijakan K3LH', icon: '⚖️' },
          { id: 'bahaya_mesin', label: '⚠️ Identifikasi Bahaya & Hirarki', icon: '⚙️' },
          { id: 'apar_sim', label: '🧯 Tanggap Darurat & Simulator APAR', icon: '🔥' },
          { id: 'limbah_b3', label: '☣️ Pengelolaan Limbah B3 Bengkel', icon: '♻️' },
          { id: 'p3k_evakuasi', label: '🩹 P3K & Jalur Evakuasi', icon: '🚪' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { sound.playClick(); setActiveSubSection(tab.id); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubSection === tab.id ? '#0284c7' : 'transparent',
              color: activeSubSection === tab.id ? '#ffffff' : '#334155',
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
          SECTION 1: REGULASI & KEBIJAKAN K3LH
      ===================================================================== */}
      {activeSubSection === 'hukum_k3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dashboard-card" style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.8rem', background: '#e0f2fe', padding: '8px', borderRadius: '10px' }}>⚖️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                  Penerapan Keselamatan dan Kesehatan Kerja serta Lingkungan Hidup (K3LH)
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Landasan yuridis, filosofi keselamatan industri, dan kewajiban hukum praktikan di bengkel pemesinan
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #0284c7' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0369a1' }}>
                  1. Undang-Undang No. 1 Tahun 1970
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Merupakan tonggak hukum keselamatan kerja nasional di Indonesia. Mengatur bahwa setiap tenaga kerja dan siswa praktikan berhak mendapat perlindungan keselamatan dalam melakukan pekerjaan, sumber-sumber produksi dipelihara secara aman dan efisien, serta lingkungan kerja dijaga agar bebas dari kecelakaan dan penyakit akibat kerja.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#047857' }}>
                  2. PP No. 50 Tahun 2012 (SMK3)
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Mewajibkan Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3) yang terintegrasi. Mencakup penetapan kebijakan K3, perencanaan K3, pelaksanaan rencana K3, pemantauan dan evaluasi kinerja K3, serta peninjauan dan peningkatan kinerja SMK3 secara berkesinambungan (Kaizen/Continuous Improvement).
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#b45309' }}>
                  3. Filosofi K3 Modern: Heinrich 1:29:300
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Teori Piramida Keselamatan Heinrich membuktikan bahwa di balik <strong>1 kecelakaan fatal (meninggal/cacat permanen)</strong>, didahului oleh <strong>29 kecelakaan ringan (luka sayat/memar)</strong>, dan berakar dari <strong>300 tindakan/kondisi tidak aman (Near Miss / Nyaris Celaka)</strong>. Kunci keselamatan adalah membasmi perilaku tidak aman sejak dini!
                </p>
              </div>
            </div>

            {/* HAK DAN KEWAJIBAN PRAKTIKAN */}
            <div style={{ marginTop: '20px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#065f46', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️</span>
                <span>Hak dan Kewajiban Siswa/Teknisi di Bengkel Mesin Sesuai Pasal 12 UU No. 1/1970:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#047857', lineHeight: 1.7 }}>
                <li><strong>Wajib</strong> memakai Alat Pelindung Diri (APD) yang diwajibkan secara benar sebelum menyentuh mesin.</li>
                <li><strong>Wajib</strong> mematuhi seluruh rambu keselamatan kerja, SOP mesin, dan petunjuk instruktur.</li>
                <li><strong>Berhak</strong> menolak mengoperasikan mesin jika pengaman mesin (*machine guarding*) rusak atau situasi dinilai mengancam nyawa.</li>
                <li><strong>Wajib</strong> melaporkan segera kepada guru/toolman jika menemukan kebocoran listrik, ceceran oli, atau kerusakan perkakas.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 2: IDENTIFIKASI BAHAYA & HIRARKI PENGENDALIAN
      ===================================================================== */}
      {activeSubSection === 'bahaya_mesin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dashboard-card" style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              Identifikasi Bahaya Bengkel Mesin &amp; Hirarki Pengendalian Risiko
            </h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '0.82rem', color: '#64748b' }}>
              Klasifikasi 4 jenis potensi bahaya utama di area pemesinan perkakas dan 5 tahapan pengendalian sesuai standar ISO 45001
            </p>

            {/* TABEL BAHAYA */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: '#fff1f2', border: '1px solid #fecdd3' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>⚙️ Bahaya Mekanik</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#881337', lineHeight: 1.6 }}>
                  <li><strong>Entanglement (Terbelit):</strong> Spindel chuck bubut 1200 RPM, lead screw, sabuk puli frais.</li>
                  <li><strong>Crushing (Terjepit):</strong> Gerakan ragum hidrolik, meja mesin frais, roda gigi transportir.</li>
                  <li><strong>Cutting (Tersayat):</strong> Tatal spiral tajam, mata pisau endmill, gerigi gergaji mesin.</li>
                  <li><strong>Impact (Terhantam):</strong> Benda kerja lepas dari chuck, kunci bubut tertinggal yang terlempar.</li>
                </ul>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: '#fefce8', border: '1px solid #fef08a' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>⚡ Bahaya Listrik</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#713f12', lineHeight: 1.6 }}>
                  <li>Kabel daya mesin terkelupas akibat gesekan atau terinjak trofi beban.</li>
                  <li>Grounding/arde mesin tidak terpasang sehingga bodi mesin bertegangan.</li>
                  <li>Korsleting pada saklar motor listrik akibat rembesan cairan coolant.</li>
                  <li>Tersengat listrik arus AC 380 Volt pada panel distribusi daya utama.</li>
                </ul>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>🧪 Bahaya Kimia &amp; Debu</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#14532d', lineHeight: 1.6 }}>
                  <li><strong>Coolant Mist:</strong> Kabut minyak dromus yang terhirup menyebabkan iritasi paru-paru.</li>
                  <li><strong>Dermatitis Kontak:</strong> Iritasi dan alergi kulit akibat terpapar oli bekas tanpa sarung tangan khusus.</li>
                  <li><strong>Debu Abrasif:</strong> Debu korundum dari batu gerinda yang mengendap di saluran pernapasan.</li>
                  <li>Uap asam atau basa dari proses degreasing dan pencelupan black oxide.</li>
                </ul>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '6px' }}>🔊 Bahaya Fisik &amp; Ergonomi</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#4c1d95', lineHeight: 1.6 }}>
                  <li>Kebisingan mesin di atas Nilai Ambang Batas (NAB) 85 dB selama 8 jam kerja.</li>
                  <li>Getaran lengan tangan (*Hand-Arm Vibration*) saat menggerinda tangan durasi lama.</li>
                  <li>Pencahayaan redup (*Illuminance &lt; 300 Lux*) yang memicu kelelahan mata saat membaca mistar ukur.</li>
                  <li>Posisi postur janggal (membungkuk terus menerus di atas ragum kerja bangku).</li>
                </ul>
              </div>
            </div>

            {/* HIRARKI PENGENDALIAN BAHAYA */}
            <div style={{ marginTop: '22px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                5 Tingkatan Hirarki Pengendalian Risiko K3 (Hierarchy of Controls)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { level: '1. Eliminasi (Paling Efektif)', color: '#15803d', bg: '#dcfce7', desc: 'Menghilangkan bahaya secara total, misalnya mendesain ulang proses agar tidak perlu menggunakan bahan kimia korosif.' },
                  { level: '2. Substitusi', color: '#0369a1', bg: '#e0f2fe', desc: 'Mengganti alat/bahan berbahaya dengan yang lebih aman, contohnya mengganti cairan pelarut beracun dengan pembersih berbahan dasar air (water-based).' },
                  { level: '3. Rekayasa Teknik (Engineering Controls)', color: '#d97706', bg: '#fef3c7', desc: 'Memasang pembatas fisik antara operator dan bahaya, seperti kaca penutup spindel bubut (*chuck guard* dengan interlock switch), penutup batu gerinda, dan exhaust blower penyedot debu.' },
                  { level: '4. Pengendalian Administratif', color: '#ea580c', bg: '#ffedd5', desc: 'Penyusunan Standard Operating Procedure (SOP), pemasangan safety signs/rambu K3, pelatihan sertifikasi operator, dan pembatasan jam paparan bising.' },
                  { level: '5. Alat Pelindung Diri / APD (Tingkat Terakhir)', color: '#b91c1c', bg: '#fee2e2', desc: 'Benteng pertahanan terakhir jika risiko residual masih ada. Melindungi fisik operator langsung (Kacamata safety, wearpack, sepatu safety steel-toe, ear muff).' }
                ].map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', background: h.bg, border: `1px solid ${h.color}33` }}>
                    <span style={{ fontWeight: 900, color: h.color, fontSize: '0.85rem', minWidth: '240px' }}>{h.level}</span>
                    <span style={{ fontSize: '0.8rem', color: '#1e293b' }}>{h.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 3: TANGGAP DARURAT & SIMULATOR APAR (METODE PASS)
      ===================================================================== */}
      {activeSubSection === 'apar_sim' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dashboard-card" style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🧯</span> Simulator Interaktif Penanganan Kebakaran APAR (Metode P-A-S-S)
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Pelatihan langkah operasional pemadaman api menggunakan Alat Pemadam Api Ringan sesuai SOP NFPA 10
                </p>
              </div>
              <button
                onClick={resetPassSim}
                style={{ padding: '6px 14px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🔄 Reset Simulasi
              </button>
            </div>

            {/* PILIH SKENARIO KEBAKARAN BENGKEL */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                PILIH SKENARIO KEJADIAN DI BENGKEL MESIN:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {Object.keys(FIRE_SCENARIOS).map(key => {
                  const sc = FIRE_SCENARIOS[key];
                  const isSel = selectedFireScenario === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { sound.playClick(); setSelectedFireScenario(key); setPassStep(0); setAparFeedback(''); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSel ? '2px solid #dc2626' : '1px solid #cbd5e1',
                        background: isSel ? '#fef2f2' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.82rem', color: isSel ? '#b91c1c' : '#1e293b' }}>{sc.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>{sc.class}</div>
                    </button>
                  );
                })}
              </div>

              {/* Detail Skenario Terpilih */}
              <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: '#fff', border: '1px solid #fecdd3', fontSize: '0.78rem', color: '#991b1b', lineHeight: 1.5 }}>
                <div><strong>⚠️ Bahaya Khusus:</strong> {FIRE_SCENARIOS[selectedFireScenario].danger}</div>
                <div style={{ marginTop: '3px', color: '#166534' }}><strong>🧯 Media APAR yang Wajib Digunakan:</strong> {FIRE_SCENARIOS[selectedFireScenario].idealApar}</div>
              </div>
            </div>

            {/* VISUALISASI STATUS TABUNG APAR */}
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              padding: '24px',
              borderRadius: '16px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: '180px',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
            }}>
              {/* STATUS API */}
              <div style={{ fontSize: passStep === 4 ? '2.5rem' : '4rem', marginBottom: '8px', transition: 'all 0.3s' }}>
                {passStep === 4 ? '💨 🧯 ✅' : '🔥 🔥 💨'}
              </div>
              
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: passStep === 4 ? '#4ade80' : '#f87171' }}>
                {passStep === 4 ? 'API PADAM TOTAL - AREA BENGKEL AMAN' : `KOBARAN API: ${FIRE_SCENARIOS[selectedFireScenario].title}`}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
                Kemajuan Prosedur PASS: <strong>{passStep} dari 4 Tahap</strong> Selesai
              </div>

              {/* PROGRESS BAR */}
              <div style={{ width: '80%', maxWidth: '400px', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
                <div style={{ width: `${(passStep / 4) * 100}%`, height: '100%', background: passStep === 4 ? '#22c55e' : '#f59e0b', transition: 'width 0.3s' }} />
              </div>
            </div>

            {/* FEEDBACK BANNER */}
            {aparFeedback && (
              <div style={{
                marginTop: '14px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: aparFeedback.includes('⚠️') ? '#fef2f2' : (aparFeedback.includes('🏆') ? '#f0fdf4' : '#eff6ff'),
                color: aparFeedback.includes('⚠️') ? '#991b1b' : (aparFeedback.includes('🏆') ? '#166534' : '#1e40af'),
                border: `1px solid ${aparFeedback.includes('⚠️') ? '#fca5a5' : (aparFeedback.includes('🏆') ? '#86efac' : '#bfdbfe')}`,
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {aparFeedback}
              </div>
            )}

            {/* TOMBOL TINDAKAN 4 LANGKAH PASS */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>
                EKSEKUSI TAHAPAN P.A.S.S. SECARA BERURUTAN:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <button
                  onClick={() => handlePassAction(1)}
                  disabled={passStep >= 1}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: passStep >= 1 ? '2px solid #22c55e' : '2px solid #0284c7',
                    background: passStep >= 1 ? '#f0fdf4' : '#f8fafc',
                    color: passStep >= 1 ? '#15803d' : '#0369a1',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: passStep >= 1 ? 'default' : 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>1. P - PULL (Tarik)</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                    Tarik pin pengaman dan putuskan segel plastik pada pangkal tuas APAR.
                  </div>
                  {passStep >= 1 && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>✓ Selesai</span>}
                </button>

                <button
                  onClick={() => handlePassAction(2)}
                  disabled={passStep < 1 || passStep >= 2}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: passStep >= 2 ? '2px solid #22c55e' : (passStep === 1 ? '2px solid #0284c7' : '1px solid #cbd5e1'),
                    background: passStep >= 2 ? '#f0fdf4' : '#f8fafc',
                    color: passStep >= 2 ? '#15803d' : '#0369a1',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: (passStep === 1) ? 'pointer' : 'default',
                    opacity: passStep < 1 ? 0.5 : 1,
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>2. A - AIM (Arahkan)</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                    Arahkan corong nozzle ke PANGKAL API (bukan ke ujung lidah api) dengan jarak 2-3 meter.
                  </div>
                  {passStep >= 2 && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>✓ Selesai</span>}
                </button>

                <button
                  onClick={() => handlePassAction(3)}
                  disabled={passStep < 2 || passStep >= 3}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: passStep >= 3 ? '2px solid #22c55e' : (passStep === 2 ? '2px solid #0284c7' : '1px solid #cbd5e1'),
                    background: passStep >= 3 ? '#f0fdf4' : '#f8fafc',
                    color: passStep >= 3 ? '#15803d' : '#0369a1',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: (passStep === 2) ? 'pointer' : 'default',
                    opacity: passStep < 2 ? 0.5 : 1,
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>3. S - SQUEEZE (Tekan)</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                    Tekan tuas pegangan secara kuat dan mantap untuk membuka katup semprot tabung.
                  </div>
                  {passStep >= 3 && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>✓ Selesai</span>}
                </button>

                <button
                  onClick={() => handlePassAction(4)}
                  disabled={passStep < 3 || passStep >= 4}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: passStep >= 4 ? '2px solid #22c55e' : (passStep === 3 ? '2px solid #0284c7' : '1px solid #cbd5e1'),
                    background: passStep >= 4 ? '#f0fdf4' : '#f8fafc',
                    color: passStep >= 4 ? '#15803d' : '#0369a1',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: (passStep === 3) ? 'pointer' : 'default',
                    opacity: passStep < 3 ? 0.5 : 1,
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>4. S - SWEEP (Sapukan)</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                    Gerakkan ujung selang menyapu secara merata dari sisi ke sisi hingga api padam menyeluruh.
                  </div>
                  {passStep >= 4 && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>✓ Sukses</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 4: PENGELOLAAN LIMBAH B3 BENGKEL MESIN
      ===================================================================== */}
      {activeSubSection === 'limbah_b3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dashboard-card" style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              Pengelolaan Limbah Bahan Berbahaya dan Beracun (B3) Bengkel Mesin
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748b' }}>
              SOP penanganan dan pemilahan limbah operasional bengkel manufaktur sesuai regulasi lingkungan hidup PP No. 101/2014
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>💧 1. Coolant / Cairan Dromus Bekas</div>
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, marginBottom: '6px' }}>Kategori: Limbah Cair B3 Beracun</div>
                <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Coolant yang telah terdegradasi mengandung bakteri anaerob dan ion logam berat (besi, kromium). <strong>DILARANG KERAS membuang ke selokan umum/saluran air tanah!</strong> Wajib ditampung dalam drum bersegel berlabel B3 dan diserahkan kepada pihak pengolah limbah berizin.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🛢️ 2. Minyak Pelumas &amp; Oli Hidrolik Bekas</div>
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, marginBottom: '6px' }}>Kategori: Limbah Mudah Terbakar (Flammable)</div>
                <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Oli kurasan dari gearbox spindel atau pelumasan meja mesin harus ditampung dalam bak penampung sekunder (*bunding*) untuk mencegah rembesan jika drum bocor. Dilengkapi simbol B3 Cairan Mudah Menyala.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🧹 3. Majun (Kain Lap) Terkontaminasi Oli</div>
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, marginBottom: '6px' }}>Kategori: Limbah Padat B3 Rentan Menyala Spontan</div>
                <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Kain lap yang menyerap oli dapat memicu reaksi oksidasi eksotermik (menyala sendiri). Wajib dibuang ke dalam tempat sampah logam tertutup berpedal kaki (*oily waste can*), tidak boleh dicampur dengan sampah domestik.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🔩 4. Serpihan Bram / Tatal Logam Bersih</div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginBottom: '6px' }}>Kategori: Limbah Anorganik Daur Ulang (Recyclable)</div>
                <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Tatal baja, kuningan, dan aluminium dipisahkan ke dalam bak drum berbeda (*scrap bins*). Logam gram ini memiliki nilai ekonomis tinggi untuk dilebur kembali (*circular economy*).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 5: P3K & JALUR EVAKUASI
      ===================================================================== */}
      {activeSubSection === 'p3k_evakuasi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dashboard-card" style={{ padding: '24px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              Pertolongan Pertama Pada Kecelakaan (P3K) &amp; Prosedur Evakuasi Bengkel
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748b' }}>
              Protokol tanggap darurat medis cedera umum bengkel mesin dan denah jalur evakuasi
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#1e40af' }}>
                  🩸 1. Luka Sayat Tatal / Benda Tajam
                </h4>
                <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.6 }}>
                  <li>Hentikan pendarahan dengan menekan luka menggunakan kasa steril (Direct Pressure).</li>
                  <li>Bersihkan area sekitar luka dengan air mengalir atau cairan antiseptik NaCl 0.9%.</li>
                  <li>Beri antiseptik (povidone iodine) dan tutup dengan perban steril.</li>
                  <li>Jika luka dalam atau terpapar karat, segera rujuk ke klinik untuk suntik anti-tetanus.</li>
                </ol>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecdd3' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#991b1b' }}>
                  👁️ 2. Serpihan Logam Masuk ke Mata
                </h4>
                <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.6 }}>
                  <li><strong>DILARANG MENGOCOK/MENGUCEK MATA!</strong> Gesekan dapat merobek lapisan kornea mata.</li>
                  <li>Bawa segera korban ke stasiun pencuci mata darurat (*Emergency Eye Wash Station*).</li>
                  <li>Bilas mata dengan air mengalir selama minimal 15 menit sambil mengedip-ngedipkan mata.</li>
                  <li>Tutup mata dengan kain kasa bersih tanpa tekanan, segera bawa ke dokter spesialis mata.</li>
                </ol>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', fontWeight: 800, color: '#065f46' }}>
                  🚪 3. Protokol Evakuasi &amp; Assembly Point
                </h4>
                <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#047857', lineHeight: 1.6 }}>
                  <li>Segera tekan tombol <strong>Emergency Stop</strong> mesin dan matikan sumber listrik.</li>
                  <li>Jangan panik, tinggalkan barang pribadi yang berat.</li>
                  <li>Ikuti tanda panah hijau jalur evakuasi menuju pintu darurat (*Emergency Exit*).</li>
                  <li>Berkumpul di Titik Kumpul (*Assembly Point*) di lapangan terbuka yang aman dari runtuhan.</li>
                  <li>Ketua regu/instruktur melakukan absensi (*head count*) untuk memastikan tidak ada siswa tertinggal.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { recordQuizResult } from '../services/sheetService';

export default function JSABenchProjectModule() {
  const [activeTab, setActiveTab] = useState('jsa_builder');

  // State JSA Builder
  const [selectedJsaJob, setSelectedJsaJob] = useState('bor_meja');
  const [userJsaSelections, setUserJsaSelections] = useState({});
  const [jsaSubmitted, setJsaSubmitted] = useState(false);
  const [jsaScore, setJsaScore] = useState(0);

  // State QC Inspection
  const [qcMeasures, setQcMeasures] = useState({
    dimensiPanjang: 50.02,
    kesikuan: 0.02,
    ulirThread: 'pass',
    kerataan: 'pass',
    k3Compliance: 'pass'
  });
  const [qcResult, setQcResult] = useState(null);

  // Database JSA Skenario
  const JSA_SCENARIOS = {
    bor_meja: {
      title: 'Pengeboran Benda Kerja Pelat Baja 12 mm pada Mesin Bor Meja',
      steps: [
        {
          id: 'step1',
          stepName: '1. Pemasangan & Pengencangan Mata Bor pada Chuck',
          hazards: [
            { id: 'h1a', text: 'Kunci chuck tertinggal di kepala chuck bor', correctControl: 'c1a' },
            { id: 'h1b', text: 'Mata bor patah saat berputar karena longgar', correctControl: 'c1b' }
          ],
          controls: [
            { id: 'c1a', text: 'Wajib langsung mencabut dan mengembalikan kunci chuck ke dudukan pengaman seketika setelah mengencangkan bor.' },
            { id: 'c1b', text: 'Kencangkan ketiga lubang kunci chuck secara merata agar mata bor simetris sentris.' },
            { id: 'c1_wrong', text: 'Menyalakan mesin dengan kecepatan tinggi untuk menguji kelonggaran.' }
          ]
        },
        {
          id: 'step2',
          stepName: '2. Pencekaman Benda Kerja pada Meja Mesin',
          hazards: [
            { id: 'h2a', text: 'Benda kerja terlempar dan berputar liar saat mata bor menembus pelat', correctControl: 'c2a' }
          ],
          controls: [
            { id: 'c2a', text: 'Cekam kuat benda kerja di ragum mesin (vise) dan kunci ragum dengan baut T ke alur meja mesin. Dilarang memegang tangan!' },
            { id: 'c2_wrong', text: 'Tahan benda kerja dengan sarung tangan kain tebal agar tangan tidak sakit.' }
          ]
        },
        {
          id: 'step3',
          stepName: '3. Proses Pengeboran & Pendinginan',
          hazards: [
            { id: 'h3a', text: 'Tangan terbelit putaran mata bor dan tatal spiral tajam melukai kulit', correctControl: 'c3a' },
            { id: 'h3b', text: 'Serpihan tatal gram panas memercik mengenai mata', correctControl: 'c3b' }
          ],
          controls: [
            { id: 'c3a', text: 'Dilarang menggunakan sarung tangan apa pun; potong tatal dengan menaik-turunkan tuas bor (peck drilling), gunakan kuas untuk bersihkan tatal.' },
            { id: 'c3b', text: 'Wajib mengenakan kacamata pelindung (safety glasses) dan pasang eye shield akrilik mesin.' },
            { id: 'c3_wrong', text: 'Tiup serpihan tatal dengan mulut secara dekat saat mesin berputar.' }
          ]
        }
      ]
    },
    gerinda_duduk: {
      title: 'Pengasahan Pahat Bubut HSS pada Mesin Gerinda Duduk 3800 RPM',
      steps: [
        {
          id: 'step1',
          stepName: '1. Pemeriksaan Pra-Operasional Batu Gerinda',
          hazards: [
            { id: 'h1a', text: 'Batu gerinda retak meledak saat mesin mulai berputar', correctControl: 'c1a' },
            { id: 'h1b', text: 'Jari terselot ke celah antara batu dan landasan kerja', correctControl: 'c1b' }
          ],
          controls: [
            { id: 'c1a', text: 'Lakukan uji dengung (ring test) dan inspeksi visual; berdiri di sisi samping saat pertama kali menyalakan mesin.' },
            { id: 'c1b', text: 'Stel celah landasan (tool rest) maksimal 2 s/d 3 mm dari permukaan batu gerinda.' },
            { id: 'c1_wrong', text: 'Longgarkan jarak tool rest hingga 15 mm agar leluasa menggerakkan pahat.' }
          ]
        },
        {
          id: 'step2',
          stepName: '2. Proses Pengasahan Pahat HSS',
          hazards: [
            { id: 'h2a', text: 'Mata terkena percikan bunga api dan partikel abrasif batu', correctControl: 'c2a' },
            { id: 'h2b', text: 'Tangan terbakar akibat pahat HSS yang menjadi sangat panas', correctControl: 'c2b' }
          ],
          controls: [
            { id: 'c2a', text: 'Gunakan kacamata safety + face shield transparan; pastikan spark deflector berjarak 1.5 mm.' },
            { id: 'c2b', text: 'Celupkan ujung pahat secara berkala ke dalam wadah air pendingin; pegang benda kerja dengan mantap tanpa sarung tangan.' },
            { id: 'c2_wrong', text: 'Gunakan sarung tangan katun rajut tebal agar tangan tidak kepanasan.' }
          ]
        }
      ]
    }
  };

  // Handler memilih kontrol JSA
  const handleSelectControl = (hazardId, controlId) => {
    sound.playClick();
    setUserJsaSelections(prev => ({
      ...prev,
      [hazardId]: controlId
    }));
  };

  // Verifikasi JSA
  const handleVerifyJSA = () => {
    sound.playClick();
    let totalCorrect = 0;
    let totalHazards = 0;

    const currentScenario = JSA_SCENARIOS[selectedJsaJob];
    currentScenario.steps.forEach(step => {
      step.hazards.forEach(h => {
        totalHazards++;
        if (userJsaSelections[h.id] === h.correctControl) {
          totalCorrect++;
        }
      });
    });

    const score = Math.round((totalCorrect / totalHazards) * 100);
    setJsaScore(score);
    setJsaSubmitted(true);

    if (score >= 80) {
      sound.playSuccess();
    } else {
      sound.playError();
    }

    recordQuizResult({
      modul: 'Safety Lab - JSA & Benda Uji DUDI',
      judulKuis: `Penyusunan Job Safety Analysis (JSA): ${currentScenario.title}`,
      skor: score,
      jawabanBenar: totalCorrect,
      totalSoal: totalHazards,
      detailJawaban: `Verifikasi pengendalian bahaya JSA. Skor Kepatuhan: ${score}%. Tindakan aman teridentifikasi: ${totalCorrect}/${totalHazards}.`
    });
  };

  // Handler Evaluasi Benda Uji DUDI
  const handleEvaluateQC = () => {
    sound.playClick();
    let score = 100;
    const errors = [];

    // Evaluasi Dimensi (50.00 +/- 0.05 mm)
    const dimDiff = Math.abs(Number(qcMeasures.dimensiPanjang) - 50.00);
    if (dimDiff > 0.05) {
      score -= 30;
      errors.push(`Dimensi panjang ${qcMeasures.dimensiPanjang} mm di luar toleransi DUDI (50.00 ± 0.05 mm). Penyimpangan: ${(dimDiff * 1000).toFixed(0)} µm.`);
    }

    // Evaluasi Kesikuan (<= 0.03 mm)
    if (Number(qcMeasures.kesikuan) > 0.03) {
      score -= 25;
      errors.push(`Penyimpangan kesikuan ${qcMeasures.kesikuan} mm melebihi ambang batas toleransi presisi (maks 0.03 mm).`);
    }

    // Evaluasi Ulir
    if (qcMeasures.ulirThread !== 'pass') {
      score -= 20;
      errors.push('Ulir M8 cacat / macet saat diuji kaliber ulir Go/No-Go.');
    }

    // Evaluasi Kerataan
    if (qcMeasures.kerataan !== 'pass') {
      score -= 15;
      errors.push('Permukaan bergelombang atau terdapat goresan dalam (tidak mencapai standar kekasaran N7).');
    }

    // Evaluasi K3
    if (qcMeasures.k3Compliance !== 'pass') {
      score -= 10;
      errors.push('Ditemukan pelanggaran K3 selama proses kerja bangku (tidak pakai kacamata / meninggalkan kikir tanpa gagang).');
    }

    let status = 'DITERIMA (GRADE A - DUDI AUTOMOTIVE)';
    let badgeColor = '#10b981';
    if (score < 75 && score >= 60) {
      status = 'REWORK (PERBAIKI PENGISIAN & KIKIR ULANG)';
      badgeColor = '#f59e0b';
    } else if (score < 60) {
      status = 'REJECT (AFKIR - MATERIAL DIBUANG)';
      badgeColor = '#ef4444';
    }

    setQcResult({
      score: Math.max(score, 0),
      status,
      badgeColor,
      errors
    });

    if (score >= 75) {
      sound.playSuccess();
    } else {
      sound.playError();
    }

    recordQuizResult({
      modul: 'Safety Lab - JSA & Benda Uji DUDI',
      judulKuis: 'Audit Mutu Benda Uji Kerja Bangku Presisi (QC DUDI)',
      skor: Math.max(score, 0),
      jawabanBenar: score >= 75 ? 1 : 0,
      totalSoal: 1,
      detailJawaban: `Hasil QC Benda Kerja 50x50x12 mm: Status ${status}. Skor Mutu: ${score}/100. Catatan: ${errors.length > 0 ? errors.join('; ') : 'Memenuhi seluruh standar toleransi presisi industri'}`
    });
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
            📋
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
                INTEGRASI SISTEM MANUFAKTUR
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Standar Mutu DUDI &amp; K3 Zero Accident</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc' }}>
              Job Safety Analysis (JSA) &amp; Proyek Benda Uji DUDI
            </h2>
            <p style={{ margin: '6px 0 0 0', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Penyusunan analisis keselamatan kerja bertahap (JSA) bengkel mesin, Operation Sheet SOP pembuatan benda kerja presisi, dan simulasi Quality Control (QC) berstandar industri otomotif/manufaktur.
            </p>
          </div>
        </div>

        {/* Sub-Navigasi */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => { sound.playClick(); setActiveTab('jsa_builder'); }}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: activeTab === 'jsa_builder' ? '#ea580c' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'jsa_builder' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'jsa_builder' ? '1px solid #fdba74' : '1px solid #334155',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🛡️</span> Interactive JSA Builder
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('operation_sheet'); }}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: activeTab === 'operation_sheet' ? '#ea580c' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'operation_sheet' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'operation_sheet' ? '1px solid #fdba74' : '1px solid #334155',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📜</span> Operation Sheet Benda Uji
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('qc_inspection'); }}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: activeTab === 'qc_inspection' ? '#ea580c' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'qc_inspection' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'qc_inspection' ? '1px solid #fdba74' : '1px solid #334155',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔍</span> Simulasi QC &amp; Rubrik DUDI
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: INTERACTIVE JSA BUILDER
      ===================================================================== */}
      {activeTab === 'jsa_builder' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Formulir Analisis Keselamatan Kerja (Job Safety Analysis)
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Pilih tindakan pengendalian bahaya (Control Measure) yang paling tepat untuk setiap potensi risiko langkah kerja
              </span>
            </div>

            {/* Pilihan Skenario */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { sound.playClick(); setSelectedJsaJob('bor_meja'); setJsaSubmitted(false); setUserJsaSelections({}); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: selectedJsaJob === 'bor_meja' ? '#0f172a' : '#f1f5f9',
                  color: selectedJsaJob === 'bor_meja' ? '#ffffff' : '#475569',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                ⚙️ JSA Mesin Bor Meja
              </button>
              <button
                onClick={() => { sound.playClick(); setSelectedJsaJob('gerinda_duduk'); setJsaSubmitted(false); setUserJsaSelections({}); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: selectedJsaJob === 'gerinda_duduk' ? '#0f172a' : '#f1f5f9',
                  color: selectedJsaJob === 'gerinda_duduk' ? '#ffffff' : '#475569',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                ✨ JSA Mesin Gerinda Duduk
              </button>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', borderLeft: '4px solid #ea580c', marginBottom: '20px', fontSize: '0.88rem', color: '#334155' }}>
            <strong>Pekerjaan yang Dianalisis:</strong> {JSA_SCENARIOS[selectedJsaJob].title}
          </div>

          {/* List Langkah Kerja & Bahaya */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {JSA_SCENARIOS[selectedJsaJob].steps.map(step => (
              <div key={step.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', background: '#ffffff' }}>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1e293b', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px dashed #cbd5e1' }}>
                  {step.stepName}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {step.hazards.map(hazard => (
                    <div key={hazard.id} style={{ background: '#fffaf5', border: '1px solid #ffedd5', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c2410c', fontWeight: 700, fontSize: '0.88rem', marginBottom: '10px' }}>
                        <span>⚠️</span> Potensi Bahaya: {hazard.text}
                      </div>

                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        Pilih Tindakan Pengendalian yang Tepat:
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {step.controls.map(ctrl => {
                          const isSelected = userJsaSelections[hazard.id] === ctrl.id;
                          let ctrlBg = isSelected ? '#fed7aa' : '#ffffff';
                          let ctrlBorder = isSelected ? '#ea580c' : '#cbd5e1';

                          if (jsaSubmitted) {
                            if (ctrl.id === hazard.correctControl) {
                              ctrlBg = '#dcfce7';
                              ctrlBorder = '#22c55e';
                            } else if (isSelected && ctrl.id !== hazard.correctControl) {
                              ctrlBg = '#fee2e2';
                              ctrlBorder = '#ef4444';
                            }
                          }

                          return (
                            <div
                              key={ctrl.id}
                              onClick={() => !jsaSubmitted && handleSelectControl(hazard.id, ctrl.id)}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                background: ctrlBg,
                                border: `1px solid ${ctrlBorder}`,
                                cursor: jsaSubmitted ? 'default' : 'pointer',
                                fontSize: '0.84rem',
                                color: '#1e293b',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              <span style={{ fontSize: '1rem' }}>{isSelected ? '🔘' : '⚪'}</span>
                              <span>{ctrl.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tombol Verifikasi JSA */}
          <div style={{ marginTop: '24px' }}>
            {!jsaSubmitted ? (
              <button
                onClick={handleVerifyJSA}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  background: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                }}
              >
                ✅ Verifikasi &amp; Simpan Dokumen JSA ke Sistem
              </button>
            ) : (
              <div style={{
                background: jsaScore >= 80 ? '#ecfdf5' : '#fef2f2',
                border: `2px solid ${jsaScore >= 80 ? '#10b981' : '#ef4444'}`,
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: jsaScore >= 80 ? '#065f46' : '#991b1b', marginBottom: '6px' }}>
                  {jsaScore >= 80 ? '🏆 JSA DISETUJUI SAFETY OFFICER (LOLOS STANDAR)' : '⚠️ JSA DITOLAK - RISIKO TINGGI BELUM TERKENDALI'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '14px' }}>
                  Skor Kepatuhan Pengendalian JSA Anda: <strong>{jsaScore} / 100 XP</strong> (Tersinkron ke Spreadsheet).
                </div>
                <button
                  onClick={() => { sound.playClick(); setJsaSubmitted(false); }}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Edit Ulang JSA
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: OPERATION SHEET BENDA UJI (SOP 8 LANGKAH)
      ===================================================================== */}
      {activeTab === 'operation_sheet' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.8rem' }}>📐</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Operation Sheet: Proyek Balok Penitik Presisi &amp; Lubang Ulir M8
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Spesifikasi Bahan: Mild Steel (St37) Ukuran Jadi 50.00 x 50.00 x 12.00 mm (Toleransi ISO ± 0.05 mm)
              </span>
            </div>
          </div>

          {/* Gambar/Diagram Ilustrasi Teknis */}
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '140px',
                height: '140px',
                background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                border: '3px solid #475569',
                borderRadius: '8px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#0f172a',
                  border: '2px dashed #38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 800
                }}>
                  M8
                </div>
                <div style={{ position: 'absolute', top: '4px', left: '8px', fontSize: '0.65rem', color: '#334155', fontWeight: 800 }}>Bidang A (Dasar)</div>
                <div style={{ position: 'absolute', bottom: '4px', right: '8px', fontSize: '0.65rem', color: '#64748b' }}>50 x 50 mm</div>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Tampak Atas Benda Kerja Uji</span>
            </div>

            <div style={{ maxWidth: '400px', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>🎯 Target Capaian Kompetensi DUDI:</div>
              • <strong>Kerataan Bidang:</strong> Tidak ada celah cahaya saat diuji dengan bilah perata (*straight edge*).<br />
              • <strong>Kesikuan 6 Sisi:</strong> Celah penyiku presisi &lt; 0.02 mm.<br />
              • <strong>Kualitas Ulir:</strong> Ulir M8 x 1.25 tembus sempurna dan tegak lurus 90° terhadap permukaan.<br />
              • <strong>Kekasaran Permukaan:</strong> N7 (Ra 1.6 µm) bebas bekas goresan tatal kasar.
            </div>
          </div>

          {/* 8 Langkah Kerja Bertahap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                step: '1',
                title: 'Pemotongan Bahan Mentah (Rough Cutting)',
                tool: 'Gergaji Besi Manual (24 TPI)',
                sop: 'Potong bahan baku St37 batangan menjadi ukuran 54 x 54 x 14 mm (beri tunjangan pengikiran 2 mm di setiap sisi). Gunakan coolant/oli potong.',
                k3: 'Cekam kuat di ragum kerja bangku sedekat mungkin ke rahang ragum agar bilah gergaji tidak terjepit.'
              },
              {
                step: '2',
                title: 'Pengikiran Bidang 1 (Bidang Referensi Utama / Datum A)',
                tool: 'Kikir Plat Bastard -> Second Cut -> Smooth, Pisau Perata',
                sop: 'Kikir permukaan terluas hingga rata sempurna. Lakukan pengikiran silang (cross filing) lalu haluskan dengan draw filing. Periksa celah cahaya.',
                k3: 'Gunakan kikir dengan gagang utuh; bersihkan tatal dengan file card kuningan.'
              },
              {
                step: '3',
                title: 'Pengikiran Bidang 2 Siku 90° terhadap Bidang 1',
                tool: 'Penyiku Presisi (Try Square 90°), Kikir Plat Second Cut',
                sop: 'Kikir sisi samping sampai tegak lurus sempurna terhadap bidang 1. Periksa kesikuan di 3 titik (ujung kiri, tengah, ujung kanan).',
                k3: 'Hati-hati tatal tajam menusuk jari; gunakan kuas pembersih.'
              },
              {
                step: '4',
                title: 'Pengikiran Bidang 3 & 4 (Mencapai Ukuran 50.00 ± 0.05 mm)',
                tool: 'Vernier Caliper (0.02 mm), Kikir Smooth',
                sop: 'Kikir sisi berseberangan secara paralel dan siku sampai dimensi tepat 50.00 mm. Jangan sampai melebihi batas batas bawah (49.95 mm).',
                k3: 'Pasang pelindung rahang ragum (soft jaws) agar bidang yang sudah halus tidak tergores.'
              },
              {
                step: '5',
                title: 'Pelapisan Layout Dye & Pelukisan Sumbu',
                tool: 'Cairan Layout Biru, Height Gauge, Meja Perata Granit',
                sop: 'Oleskan tinta tata letak tipis merata. Goreskan garis sumbu tengah x=25 mm dan y=25 mm menggunakan ujung karbida height gauge.',
                k3: 'Pastikan meja granit bersih dari pasir gerinda agar dasar height gauge tidak aus tergores.'
              },
              {
                step: '6',
                title: 'Penitikan Garis & Penitik Pusat (Punching)',
                tool: 'Palu Konde 250 gram, Penitik Rintik 60°, Center Punch 90°',
                sop: 'Beri titik rintik halus pada garis sumbu, lalu ketuk satu kali penitik pusat 90° tepat pada persimpangan pusat lubang (x=25, y=25).',
                k3: 'Periksa kepala pahat/penitik; jangan gunakan penitik yang berkepala jamur.'
              },
              {
                step: '7',
                title: 'Pengeboran Bertingkat & Pengetapan Ulir M8',
                tool: 'Mesin Bor Meja, Bor Ø4 mm & Ø6.8 mm, Set Tap M8x1.25',
                sop: 'Bor awal Ø4 mm (1500 RPM) -> Bor Ø6.8 mm (1100 RPM) -> Chamfer 45°. Tap ulir M8 dengan urutan Tap No.1 -> No.2 -> No.3 (1 putar maju, 1/2 putar mundur).',
                k3: 'Wajib ragum mesin dibaut ke meja bor! DILARANG pakai sarung tangan. Pakai kacamata safety.'
              },
              {
                step: '8',
                title: 'Finishing Deburring & Inspeksi Akhir (QC)',
                tool: 'Kikir Segitiga Halus, Amplas Besi Grit 400, Caliper / Micrometer',
                sop: 'Hilangkan seluruh burr/sisa tatal tajam di semua rusuk balok (chamfer ringan 0.5 mm x 45°). Bersihkan dan beri lapisan oli tipis pencegah karat.',
                k3: 'Jangan menyeka bram tajam dengan telapak tangan kosong.'
              }
            ].map(item => (
              <div key={item.step} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#ea580c', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                    LANGKAH #{item.step}
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{item.title}</div>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 700, marginBottom: '6px' }}>
                  🛠️ Alat: {item.tool}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, marginBottom: '6px' }}>
                  <strong>SOP:</strong> {item.sop}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#b91c1c', background: '#fef2f2', padding: '6px 10px', borderRadius: '6px' }}>
                  ⚠️ <strong>K3:</strong> {item.k3}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: SIMULASI QC & RUBRIK MUTU DUDI
      ===================================================================== */}
      {activeTab === 'qc_inspection' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.8rem' }}>🔍</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Simulasi Quality Control (QC Inspection) Benda Kerja Bangku
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Masukkan parameter hasil pengukuran alat ukur presisi untuk menentukan predikat penerimaan industri
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Input Dimensi Panjang */}
            <div style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '10px', background: '#f8fafc' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '6px' }}>
                1. Ukuran Dimensi Panjang (Target: 50.00 ± 0.05 mm):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  step="0.01"
                  value={qcMeasures.dimensiPanjang}
                  onChange={(e) => setQcMeasures({ ...qcMeasures, dimensiPanjang: e.target.value })}
                  style={{ width: '120px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', fontWeight: 800, fontSize: '1rem' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>mm (Jangka Sorong 0.02)</span>
              </div>
            </div>

            {/* Input Kesikuan */}
            <div style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '10px', background: '#f8fafc' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '6px' }}>
                2. Celah Kesikuan Sudut 90° (Maksimal 0.03 mm):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  step="0.01"
                  value={qcMeasures.kesikuan}
                  onChange={(e) => setQcMeasures({ ...qcMeasures, kesikuan: e.target.value })}
                  style={{ width: '120px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', fontWeight: 800, fontSize: '1rem' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>mm (Feeler Gauge)</span>
              </div>
            </div>

            {/* Kelayakan Ulir */}
            <div style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '10px', background: '#f8fafc' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '6px' }}>
                3. Uji Kaliber Ulir M8 (Thread Plug Gauge):
              </label>
              <select
                value={qcMeasures.ulirThread}
                onChange={(e) => setQcMeasures({ ...qcMeasures, ulirThread: e.target.value })}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #94a3b8', fontWeight: 700, fontSize: '0.88rem' }}
              >
                <option value="pass">✅ Go Masuk Halus &amp; No-Go Menahan (Standar ISO)</option>
                <option value="tight">❌ Ulir Seret / Macet (Tap Kurang Dalam)</option>
                <option value="loose">❌ Ulir Goyang / Oblak (Mata Bor Terlalu Besar)</option>
              </select>
            </div>

            {/* Kerataan Permukaan */}
            <div style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '10px', background: '#f8fafc' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '6px' }}>
                4. Visual Kerataan &amp; Kekasaran Permukaan:
              </label>
              <select
                value={qcMeasures.kerataan}
                onChange={(e) => setQcMeasures({ ...qcMeasures, kerataan: e.target.value })}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #94a3b8', fontWeight: 700, fontSize: '0.88rem' }}
              >
                <option value="pass">✅ Rata Tanpa Celah Cahaya &amp; Halus N7</option>
                <option value="scratched">❌ Terdapat Bekas Goresan Dalam (Pinning Kikir)</option>
                <option value="cembung">❌ Permukaan Cembung / Tidak Rata</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleEvaluateQC}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            📊 Evaluasi Hasil QC &amp; Terbitkan Sertifikat Mutu Benda Uji
          </button>

          {/* QC Inspection Output */}
          {qcResult && (
            <div style={{
              background: '#f8fafc',
              border: `2px solid ${qcResult.badgeColor}`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-block',
                background: qcResult.badgeColor,
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.95rem',
                padding: '6px 20px',
                borderRadius: '20px',
                marginBottom: '10px',
                letterSpacing: '0.5px'
              }}>
                {qcResult.status}
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                {qcResult.score} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ 100 POIN MUTU</span>
              </div>

              {qcResult.errors.length > 0 ? (
                <div style={{ marginTop: '14px', textAlign: 'left', background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.85rem', marginBottom: '6px' }}>
                    Temuan Penyimpangan Quality Control:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                    {qcResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ marginTop: '10px', color: '#065f46', fontSize: '0.88rem', fontWeight: 700 }}>
                  🎉 Sempurna! Benda kerja uji Anda lolos seluruh kriteria presisi, kesikuan, dan kerataan berstandar Astra International / Toyota Manufacturing!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

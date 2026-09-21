import React, { useState, useEffect } from 'react';
import { DIAGNOSTIC_CATEGORIES, DIAGNOSTIC_QUESTIONS } from '../data/diagnosticQuestions';
import { sound } from '../utils/audio';
import { useStudent } from '../context/StudentContext';
import { recordQuizResult } from '../services/sheetService';

const DiagnosticTestView = ({ initialCategory = 'machine', onNavigateToLab = null }) => {
  const { student, isLoggedIn, openLoginModal } = useStudent();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'machine');

  useEffect(() => {
    if (initialCategory && DIAGNOSTIC_CATEGORIES[initialCategory]) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Identitas siswa
  const [studentInfo, setStudentInfo] = useState({
    name: student?.name || '',
    classRoom: student?.className || '',
    studentId: student?.studentNumber || '',
    school: student?.school || 'SMKN 2 Depok'
  });

  useEffect(() => {
    if (student?.name) {
      setStudentInfo({
        name: student.name,
        classRoom: student.className || '',
        studentId: student.studentNumber || '',
        school: student.school || 'SMKN 2 Depok'
      });
    }
  }, [student]);

  // State penyimpanan jawaban per kategori (masing-masing tepat 10 soal)
  const [answersState, setAnswersState] = useState({
    machine: { answers: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    'cutting-tools': { answers: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    'heat-treatment': { answers: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    mechanics: { answers: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    welding: { answers: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    measuring: { answers: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    design: { answers: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    safety: { answers: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    'virtual-bengkel': { answers: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' }
  });

  const [copiedToast, setCopiedToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategoryData = DIAGNOSTIC_CATEGORIES[selectedCategory];
  const currentQuestions = DIAGNOSTIC_QUESTIONS[selectedCategory] || [];
  const currentResult = answersState[selectedCategory] || { answers: {}, isSubmitted: false };

  // Hitung jumlah terjawab
  const answeredCount = Object.keys(currentResult.answers || {}).length;
  const progressPercent = Math.round((answeredCount / currentQuestions.length) * 100);

  const handleCategorySelect = (catKey) => {
    sound.playClick();
    setSelectedCategory(catKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (currentResult.isSubmitted) return;
    sound.playClick();
    setAnswersState(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        answers: {
          ...prev[selectedCategory].answers,
          [questionId]: optionIndex
        }
      }
    }));
  };

  const handleSubmit = async () => {
    if (!studentInfo.name.trim()) {
      alert('Mohon lengkapi Nama Siswa terlebih dahulu agar data hasil diagnostik tersimpan di rekap nilai guru!');
      const el = document.getElementById('diagnostic-student-name');
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (answeredCount < currentQuestions.length) {
      const confirmIncomplete = window.confirm(
        `Anda baru menjawab ${answeredCount} dari ${currentQuestions.length} soal. Yakin ingin mengumpulkan tes sekarang?`
      );
      if (!confirmIncomplete) return;
    }

    setIsSubmitting(true);

    // Hitung skor
    let correct = 0;
    const domainScores = {};

    currentQuestions.forEach(q => {
      const isCorrect = currentResult.answers[q.id] === q.correct;
      if (isCorrect) correct++;

      const domain = q.domain || 'Umum';
      if (!domainScores[domain]) {
        domainScores[domain] = { total: 0, correct: 0 };
      }
      domainScores[domain].total += 1;
      if (isCorrect) {
        domainScores[domain].correct += 1;
      }
    });

    const calculatedScore = Math.round((correct / currentQuestions.length) * 100);
    const now = new Date();
    const timeStr = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    // Tentukan kategori kesiapan
    let levelLabel = 'Perlu Bimbingan';
    if (calculatedScore >= 80) levelLabel = 'Mahir (Siap Praktik Mandiri)';
    else if (calculatedScore >= 60) levelLabel = 'Cakap (Standar)';

    setAnswersState(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        isSubmitted: true,
        score: calculatedScore,
        correctCount: correct,
        submitTime: timeStr,
        domainScores
      }
    }));

    // Simpan ke Gradebook & Google Sheets
    try {
      await recordQuizResult({
        student: {
          name: studentInfo.name,
          studentNumber: studentInfo.studentId || '-',
          className: studentInfo.classRoom || 'X TPM',
          school: studentInfo.school || 'SMKN 2 Depok'
        },
        modul: currentCategoryData.shortTitle || 'Safety Lab',
        judulKuis: `Tes Diagnostik: ${currentCategoryData.title}`,
        skor: calculatedScore,
        jawabanBenar: correct,
        totalSoal: currentQuestions.length,
        detailJawaban: `Kategori: ${levelLabel}. Benar: ${correct}/${currentQuestions.length} Soal. Diagnostik ${currentCategoryData.title}`
      });
    } catch (e) {
      console.warn('Gagal sync diagnostik:', e);
    }

    setIsSubmitting(false);
    sound.playSuccess();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (window.confirm(`Apakah Anda yakin ingin mengulang ${currentCategoryData.title}? Jawaban akan direset.`)) {
      sound.playClick();
      setAnswersState(prev => ({
        ...prev,
        [selectedCategory]: {
          answers: {},
          isSubmitted: false,
          score: 0,
          correctCount: 0,
          submitTime: ''
        }
      }));
    }
  };

  const scrollToQuestion = (id) => {
    const el = document.getElementById(`diag-q-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCopySummary = () => {
    if (!currentResult.isSubmitted) return;
    const text = `📋 HASIL TES DIAGNOSTIK AWAL SISWA
Kategori: ${currentCategoryData.title}
Nama: ${studentInfo.name || '-'}
Kelas: ${studentInfo.classRoom || '-'} | No. Absen: ${studentInfo.studentId || '-'}
Sekolah: ${studentInfo.school || '-'}
Waktu Ujian: ${currentResult.submitTime}
Skor Akhir: ${currentResult.score}/100 (${currentResult.correctCount} dari ${currentQuestions.length} Soal Benar)
Status Kesiapan: ${currentResult.score >= 80 ? '🟢 MAHIR (Siap Praktik Mandiri)' : currentResult.score >= 60 ? '🟡 CAKAP (Perlu Penguatan Konsep)' : '🔴 PERLU BIMBINGAN KHUSUS (Remedial K3 & Teori)'}
Platform: BIMO Manufacturing Labs - SMKN 2 Depok`;

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    sound.playClick();
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="diagnostic-view-container"
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#1e293b'
      }}
    >
      {/* HEADER BANNER */}
      <div 
        className="diagnostic-header-banner"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '28px 24px',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#f59e0b',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.72rem',
              padding: '3px 10px',
              borderRadius: '20px',
              letterSpacing: '0.5px'
            }}>
              📋 ASESMEN DIAGNOSTIK KOGNITIF AWAL
            </span>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontSize: '0.72rem',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              🎯 Tepat 10 Soal Pilihan Ganda
            </span>
            <span style={{
              background: 'rgba(59, 130, 246, 0.25)',
              color: '#93c5fd',
              fontSize: '0.72rem',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              ⚙️ Terkoneksi Google Spreadsheet & Gradebook
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ maxWidth: '750px' }}>
              <h1 style={{
                margin: '0 0 10px 0',
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                lineHeight: 1.2
              }}>
                Tes Diagnostik Kemampuan: {currentCategoryData?.title || 'Teknik Pemesinan'}
              </h1>

              <p style={{
                margin: 0,
                color: '#cbd5e1',
                fontSize: '0.92rem',
                lineHeight: 1.5
              }}>
                Asesmen diagnostik <strong>10 soal pilihan ganda</strong> untuk mengukur kesiapan kognitif, pemahaman konsep dasar,
                dan SOP keselamatan siswa sebelum memulai praktikum di <strong>{currentCategoryData?.shortTitle || 'Lab'}</strong>.
              </p>
            </div>

            {onNavigateToLab && (
              <button
                onClick={() => onNavigateToLab(selectedCategory)}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>🔬 Buka Simulasi {currentCategoryData?.shortTitle || 'Lab'}</span>
                <span>➔</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FORM IDENTITAS SISWA */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '18px 20px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>👤</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Identitas Peserta Didik</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Data ini digunakan guru untuk rekapitulasi nilai diagnostik di buku nilai & spreadsheet</div>
            </div>
          </div>

          {!isLoggedIn && (
            <button
              onClick={openLoginModal}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              🔑 Login Akun Siswa
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Nama Lengkap Siswa *
            </label>
            <input
              id="diagnostic-student-name"
              type="text"
              placeholder="Contoh: Muhammad Rizky Pratama"
              value={studentInfo.name}
              onChange={(e) => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Kelas / Jurusan
            </label>
            <input
              type="text"
              placeholder="Contoh: X TPM 1"
              value={studentInfo.classRoom}
              onChange={(e) => setStudentInfo(prev => ({ ...prev, classRoom: e.target.value }))}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Nomor Absen / NIS
            </label>
            <input
              type="text"
              placeholder="Contoh: 18"
              value={studentInfo.studentId}
              onChange={(e) => setStudentInfo(prev => ({ ...prev, studentId: e.target.value }))}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Nama Sekolah
            </label>
            <input
              type="text"
              placeholder="SMKN 2 Depok"
              value={studentInfo.school}
              onChange={(e) => setStudentInfo(prev => ({ ...prev, school: e.target.value }))}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* CATEGORY TABS SELECTOR (10 SOAL PER KATEGORI) */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Pilih Paket Asesmen Diagnostik (Masing-masing 10 Soal Pilihan Ganda):
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px'
        }}>
          {Object.values(DIAGNOSTIC_CATEGORIES).map(cat => {
            const isSelected = selectedCategory === cat.id;
            const catRes = answersState[cat.id];
            const hasSubmitted = catRes?.isSubmitted;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                style={{
                  background: isSelected ? '#ffffff' : '#f8fafc',
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: hasSubmitted ? (catRes.score >= 75 ? '#dcfce7' : '#fee2e2') : (isSelected ? '#dbeafe' : '#f1f5f9'),
                    color: hasSubmitted ? (catRes.score >= 75 ? '#166534' : '#991b1b') : (isSelected ? '#1e40af' : '#64748b')
                  }}>
                    {hasSubmitted ? `Skor: ${catRes.score}` : '10 Soal'}
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isSelected ? '#1e3a8a' : '#1e293b', marginBottom: '2px' }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
                  {cat.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* HASIL DIAGNOSTIK (JIKA SUDAH DISUBMIT) */}
      {currentResult.isSubmitted && (
        <div style={{
          background: '#ffffff',
          border: '2px solid #3b82f6',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.12)'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.4rem' }}>{currentCategoryData.icon}</span>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  Hasil Diagnostik: {currentCategoryData.title}
                </h2>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Diselesaikan pada: {currentResult.submitTime} • {studentInfo.name || 'Siswa'} ({studentInfo.classRoom || 'X TPM'})
              </div>
            </div>

            {/* SKOR BADGE */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: currentResult.score >= 80 ? '#f0fdf4' : (currentResult.score >= 60 ? '#fffbeb' : '#fef2f2'),
              padding: '12px 20px',
              borderRadius: '14px',
              border: `1px solid ${currentResult.score >= 80 ? '#bbf7d0' : (currentResult.score >= 60 ? '#fef08a' : '#fecaca')}`
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Skor Diagnostik
                </div>
                <div style={{
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  color: currentResult.score >= 80 ? '#15803d' : (currentResult.score >= 60 ? '#b45309' : '#b91c1c'),
                  lineHeight: 1
                }}>
                  {currentResult.score}
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>/100</span>
                </div>
              </div>

              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '14px' }}>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: currentResult.score >= 80 ? '#15803d' : (currentResult.score >= 60 ? '#b45309' : '#b91c1c')
                }}>
                  {currentResult.score >= 80 ? '🟢 KATEGORI MAHIR' : (currentResult.score >= 60 ? '🟡 KATEGORI CAKAP' : '🔴 PERLU BIMBINGAN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                  {currentResult.correctCount} dari {currentQuestions.length} Soal Benar
                </div>
              </div>
            </div>
          </div>

          {/* TINDAK LANJUT GURU & STRATEGI DIFERENSIASI */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 18px',
            marginBottom: '20px'
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💡</span> Rekomendasi Guru & Rencana Diferensiasi Pembelajaran:
            </div>
            <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5 }}>
              {currentResult.score >= 80 ? (
                <div>
                  <strong>Kelompok Mahir (Pengayaan):</strong> Siswa telah menguasai konsep dasar dengan sangat baik. 
                  Siswa siap untuk langsung praktik pengoperasian mesin mandiri, diberikan penugasan proyek manufaktur tingkat lanjut, 
                  atau diberdayakan menjadi <em>tutor sebaya</em> bagi rekan sekelasnya.
                </div>
              ) : currentResult.score >= 60 ? (
                <div>
                  <strong>Kelompok Cakap (Pembelajaran Reguler):</strong> Siswa memiliki pemahaman umum yang cukup, namun masih 
                  memerlukan penguatan singkat pada perhitungan rumus teknis atau pembacaan alat ukur teliti. 
                  Dapat diberikan lembar kerja panduan (job sheet terstruktur) sebelum mulai mengeksekusi benda kerja.
                </div>
              ) : (
                <div>
                  <strong>Kelompok Perlu Bimbingan Khusus (Intervensi Awal):</strong> Siswa belum menguasai konsep prasyarat atau 
                  SOP keselamatan kerja dasar. Guru disarankan memberikan <em>remedial teaching</em> intensif, bimbingan langsung satu per satu, 
                  serta wajib diverifikasi pemahamannya sebelum diizinkan mengoperasikan mesin bubut/gerinda berputar.
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS HASIL */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleCopySummary}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📋 {copiedToast ? 'Tersalin ke Clipboard!' : 'Salin Ringkasan Nilai'}
            </button>

            <button
              onClick={handlePrint}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🖨️ Cetak / Simpan PDF
            </button>

            {onNavigateToLab && (
              <button
                onClick={() => onNavigateToLab(selectedCategory)}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                🚀 Lanjut Praktik ke {currentCategoryData?.shortTitle || 'Lab'} ➔
              </button>
            )}

            <button
              onClick={handleReset}
              style={{
                background: 'transparent',
                color: '#ef4444',
                border: '1px solid #fca5a5',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: 'auto'
              }}
            >
              🔄 Ulangi Tes Ini
            </button>
          </div>
        </div>
      )}

      {/* QUICK NAVIGATOR CHIPS (1-10) & PROGRESS */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginRight: '4px' }}>
            Navigasi Soal:
          </span>
          {currentQuestions.map((q, idx) => {
            const isAnswered = currentResult.answers[q.id] !== undefined;
            const isCorrect = currentResult.isSubmitted && currentResult.answers[q.id] === q.correct;
            const isWrong = currentResult.isSubmitted && currentResult.answers[q.id] !== q.correct;

            let bgColor = '#f8fafc';
            let borderColor = '#cbd5e1';
            let textColor = '#475569';

            if (currentResult.isSubmitted) {
              if (isCorrect) {
                bgColor = '#dcfce7';
                borderColor = '#86efac';
                textColor = '#15803d';
              } else {
                bgColor = '#fee2e2';
                borderColor = '#fca5a5';
                textColor = '#b91c1c';
              }
            } else if (isAnswered) {
              bgColor = '#dbeafe';
              borderColor = '#93c5fd';
              textColor = '#1d4ed8';
            }

            return (
              <button
                key={q.id}
                onClick={() => scrollToQuestion(q.id)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: `1.5px solid ${borderColor}`,
                  background: bgColor,
                  color: textColor,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s'
                }}
                title={`Soal ${idx + 1}: ${q.domain}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* PROGRESS INFO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>
              {answeredCount} dari {currentQuestions.length} Soal Terjawab
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {progressPercent}% Selesai
            </div>
          </div>
          <div style={{
            width: '90px',
            height: '8px',
            background: '#e2e8f0',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: progressPercent === 100 ? '#10b981' : '#3b82f6',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* DAFTAR 10 SOAL PILGAN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
        {currentQuestions.map((q, idx) => {
          const selectedOption = currentResult.answers[q.id];
          const isAnswered = selectedOption !== undefined;
          const isSubmitted = currentResult.isSubmitted;
          const isQuestionCorrect = isSubmitted && selectedOption === q.correct;

          return (
            <div
              key={q.id}
              id={`diag-q-${q.id}`}
              className="diagnostic-question-card"
              style={{
                background: '#ffffff',
                border: isSubmitted
                  ? (isQuestionCorrect ? '2px solid #86efac' : '2px solid #fca5a5')
                  : (isAnswered ? '1.5px solid #93c5fd' : '1px solid #e2e8f0'),
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'border-color 0.2s'
              }}
            >
              {/* QUESTION HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    padding: '3px 9px',
                    borderRadius: '6px'
                  }}>
                    Soal {idx + 1} / 10
                  </span>
                  <span style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {q.domain}
                  </span>
                </div>

                {isSubmitted && (
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: isQuestionCorrect ? '#166534' : '#991b1b',
                    background: isQuestionCorrect ? '#dcfce7' : '#fee2e2',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {isQuestionCorrect ? '✓ Benar' : '✕ Belum Tepat'}
                  </span>
                )}
              </div>

              {/* QUESTION STEM */}
              <div style={{
                fontSize: '0.96rem',
                fontWeight: 700,
                color: '#1e293b',
                lineHeight: 1.5,
                marginBottom: '16px'
              }}>
                {q.question}
              </div>

              {/* OPTIONS (A, B, C, D) */}
              <div className="diagnostic-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selectedOption === optIdx;
                  const isThisCorrectAnswer = isSubmitted && q.correct === optIdx;
                  const isThisWrongChoice = isSubmitted && isThisSelected && !isThisCorrectAnswer;

                  let optBg = '#f8fafc';
                  let optBorder = '1px solid #cbd5e1';
                  let optColor = '#334155';

                  if (isSubmitted) {
                    if (isThisCorrectAnswer) {
                      optBg = '#f0fdf4';
                      optBorder = '2px solid #22c55e';
                      optColor = '#15803d';
                    } else if (isThisWrongChoice) {
                      optBg = '#fef2f2';
                      optBorder = '2px solid #ef4444';
                      optColor = '#b91c1c';
                    }
                  } else if (isThisSelected) {
                    optBg = '#eff6ff';
                    optBorder = '2px solid #3b82f6';
                    optColor = '#1e40af';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      style={{
                        background: optBg,
                        border: optBorder,
                        color: optColor,
                        borderRadius: '10px',
                        padding: '12px 14px',
                        textAlign: 'left',
                        cursor: isSubmitted ? 'default' : 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: isThisSelected || isThisCorrectAnswer ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>{opt}</span>
                      {isSubmitted && isThisCorrectAnswer && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>
                          ✓ Kunci Jawaban
                        </span>
                      )}
                      {isSubmitted && isThisWrongChoice && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626' }}>
                          ✕ Jawaban Anda
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* EXPLANATION AFTER SUBMIT */}
              {isSubmitted && q.explanation && (
                <div style={{
                  marginTop: '14px',
                  background: '#f8fafc',
                  borderLeft: '4px solid #3b82f6',
                  borderRadius: '0 8px 8px 0',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  color: '#334155',
                  lineHeight: 1.45
                }}>
                  <strong style={{ color: '#1e40af' }}>💡 Konsep & Pembahasan Teknis:</strong>{' '}
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SUBMIT BUTTON BAR */}
      {!currentResult.isSubmitted && (
        <div style={{
          position: 'sticky',
          bottom: '20px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 10
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
              Siap Menganalisis Kesiapan Belajar?
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {answeredCount === currentQuestions.length
                ? 'Semua 10 soal pilihan ganda telah dijawab dengan lengkap!'
                : `Masih ada ${currentQuestions.length - answeredCount} soal yang belum dijawab.`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleReset}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>

            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? 'Menganalisis...' : 'Kumpulkan & Dapatkan Hasil Diagnostik ➔'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticTestView;

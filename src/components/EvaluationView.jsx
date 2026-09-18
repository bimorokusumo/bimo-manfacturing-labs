import React, { useState, useEffect } from 'react';
import { evaluationData } from '../data/questionBankEvaluation';
import { sound } from '../utils/audio';
import { useStudent } from '../context/StudentContext';
import { recordQuizResult } from '../services/sheetService';

const EvaluationView = () => {
  const { student, openLoginModal } = useStudent();
  const [activeLevel, setActiveLevel] = useState('c1'); // 'c1' | 'c2' | 'c3' | 'hots'
  
  // Data identitas siswa untuk memudahkan guru mendata
  const [studentInfo, setStudentInfo] = useState({
    name: student?.name || '',
    classRoom: student?.className || '',
    studentId: student?.studentNumber || ''
  });

  useEffect(() => {
    if (student?.name) {
      setStudentInfo({
        name: student.name,
        classRoom: student.className || '',
        studentId: student.studentNumber || ''
      });
    }
  }, [student]);

  const [copiedToast, setCopiedToast] = useState(false);

  // State tersimpan per level agar perpindahan tab tidak menghapus jawaban
  const [answersByLevel, setAnswersByLevel] = useState({
    c1: { mcq: {}, essay: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    c2: { mcq: {}, essay: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    c3: { mcq: {}, essay: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' },
    hots: { mcq: {}, essay: {}, isSubmitted: false, score: 0, correctCount: 0, submitTime: '' }
  });

  const [showEssayRubric, setShowEssayRubric] = useState({});

  const currentLevelData = evaluationData[activeLevel];
  const currentAnswers = answersByLevel[activeLevel];

  const handleLevelChange = (levelKey) => {
    sound.playClick();
    setActiveLevel(levelKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMcqSelect = (questionId, option) => {
    if (!currentAnswers.isSubmitted) {
      sound.playClick();
      setAnswersByLevel(prev => ({
        ...prev,
        [activeLevel]: {
          ...prev[activeLevel],
          mcq: {
            ...prev[activeLevel].mcq,
            [questionId]: option
          }
        }
      }));
    }
  };

  const handleEssayChange = (questionId, text) => {
    if (!currentAnswers.isSubmitted) {
      setAnswersByLevel(prev => ({
        ...prev,
        [activeLevel]: {
          ...prev[activeLevel],
          essay: {
            ...prev[activeLevel].essay,
            [questionId]: text
          }
        }
      }));
    }
  };

  const handleSubmit = () => {
    if (!studentInfo.name.trim()) {
      alert('Mohon isi Nama Lengkap Siswa terlebih dahulu pada bagian identitas di atas agar nilai Anda dapat didata oleh guru.');
      const nameInput = document.getElementById('student-name-input');
      if (nameInput) {
        nameInput.focus();
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const mcqList = currentLevelData.multipleChoice;
    let correctCount = 0;
    
    mcqList.forEach(q => {
      if (currentAnswers.mcq[q.id] === q.answer) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / mcqList.length) * 100);
    const now = new Date();
    const timeStr = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) + ' pukul ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    setAnswersByLevel(prev => ({
      ...prev,
      [activeLevel]: {
        ...prev[activeLevel],
        isSubmitted: true,
        score: calculatedScore,
        correctCount: correctCount,
        submitTime: timeStr
      }
    }));

    // Rekam nilai ke Google Spreadsheet & Local Storage
    recordQuizResult({
      student: {
        name: studentInfo.name,
        studentNumber: studentInfo.studentId,
        className: studentInfo.classRoom,
        school: student?.school || ''
      },
      modul: 'Evaluasi Komprehensif',
      judulKuis: `Evaluasi ${currentLevelData.title}`,
      skor: calculatedScore,
      jawabanBenar: correctCount,
      totalSoal: mcqList.length,
      detailJawaban: `Pilihan Ganda: ${correctCount}/${mcqList.length} Benar. Esai dijawab: ${Object.keys(currentAnswers.essay || {}).length} soal.`
    });

    sound.playSuccess();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (window.confirm(`Apakah Anda yakin ingin mengulangi ujian ${currentLevelData.shortTitle}? Seluruh jawaban pada level ini akan direset.`)) {
      sound.playClick();
      setAnswersByLevel(prev => ({
        ...prev,
        [activeLevel]: {
          mcq: {},
          essay: {},
          isSubmitted: false,
          score: 0,
          correctCount: 0,
          submitTime: ''
        }
      }));
      setShowEssayRubric(prev => ({
        ...prev,
        [`${activeLevel}`]: false
      }));
    }
  };

  const toggleRubric = (questionId) => {
    sound.playClick();
    setShowEssayRubric(prev => ({
      ...prev,
      [`${activeLevel}_${questionId}`]: !prev[`${activeLevel}_${questionId}`]
    }));
  };

  // Salin ringkasan nilai siswa ke clipboard guru
  const handleCopyTeacherReport = () => {
    sound.playClick();
    const essayCount = Object.keys(currentAnswers.essay).filter(k => currentAnswers.essay[k]?.trim().length > 0).length;
    const reportText = 
`[REKAP NILAI EVALUASI SISWA]
Nama Siswa   : ${studentInfo.name || '-'}
Kelas/Rombel : ${studentInfo.classRoom || '-'}
No. Absen/NIS: ${studentInfo.studentId || '-'}
Tingkat Ujian: ${currentLevelData.levelTitle}
Nilai PG     : ${currentAnswers.score} / 100 (${currentAnswers.correctCount} benar dari 25 soal)
Essay Terisi : ${essayCount} / 5 soal
Waktu Selesai: ${currentAnswers.submitTime}
Status       : ${currentAnswers.score >= 75 ? 'TUNTAS / LULUS' : 'REMEDIAL / BELUM TUNTAS'}`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3500);
    });
  };

  // Hitung jumlah yang sudah terjawab
  const mcqAnsweredCount = Object.keys(currentAnswers.mcq).length;
  const essayAnsweredCount = Object.keys(currentAnswers.essay).filter(k => currentAnswers.essay[k]?.trim().length > 0).length;

  return (
    <div style={{ paddingBottom: '90px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ==================================================== */}
      {/* 1. HEADER UTAMA EVALUASI */}
      {/* ==================================================== */}
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #090e17 0%, #0f172a 50%, #1e293b 100%)',
        padding: '32px 36px',
        color: '#f8fafc',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.35)',
        marginBottom: '24px'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(2, 132, 199, 0.2)',
              color: '#38bdf8',
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '1px',
              border: '1px solid #0284c7'
            }}>
              PORTAL EVALUASI PEMBELAJARAN
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              border: '1px solid #059669'
            }}>
              FASE E SMK TEKNIK MESIN &amp; MANUFAKTUR
            </span>
            <span style={{
              background: 'rgba(236, 72, 153, 0.2)',
              color: '#f472b6',
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              border: '1px solid #db2777'
            }}>
              25 PILIHAN GANDA + 5 ESSAY
            </span>
          </div>

          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 10px 0',
            letterSpacing: '-0.5px',
            lineHeight: 1.2
          }}>
            Evaluasi Bertahap: C1, C2, C3 &amp; HOTS Fase E
          </h1>

          <p style={{
            color: '#94a3b8',
            fontSize: '1rem',
            maxWidth: '850px',
            lineHeight: 1.55,
            margin: 0
          }}>
            Kerjakan <strong>Bagian A (25 Soal Pilihan Ganda)</strong> dan lanjutkan langsung ke <strong>Bagian B (5 Soal Essay)</strong> dalam satu lembar ujian di bawah ini. Setelah selesai, klik tombol <strong>Kirim Jawaban</strong> di akhir halaman untuk menampilkan nilai dan memudahkan pendataan guru.
          </p>
        </div>

        {/* Pola grid latar belakang */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.5,
          pointerEvents: 'none'
        }} />
      </div>

      {/* ==================================================== */}
      {/* 2. FORM IDENTITAS SISWA (MEMUDAHKAN PENDATAAN GURU) */}
      {/* ==================================================== */}
      <div style={{
        background: '#0f172a',
        borderRadius: '16px',
        padding: '22px 24px',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        marginBottom: '24px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Data Identitas Siswa (Wajib Diisi untuk Pendataan Nilai)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
              Nama Lengkap Siswa *
            </label>
            <input
              id="student-name-input"
              type="text"
              value={studentInfo.name}
              onChange={(e) => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Masukkan nama lengkap Anda..."
              disabled={currentAnswers.isSubmitted}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                border: '1.5px solid rgba(255,255,255,0.12)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
              Kelas / Konsentrasi Keahlian *
            </label>
            <input
              type="text"
              value={studentInfo.classRoom}
              onChange={(e) => setStudentInfo(prev => ({ ...prev, classRoom: e.target.value }))}
              placeholder="Contoh: X TPM 1 / Teknik Pemesinan"
              disabled={currentAnswers.isSubmitted}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                border: '1.5px solid rgba(255,255,255,0.12)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
              No. Absen / NISN
            </label>
            <input
              type="text"
              value={studentInfo.studentId}
              onChange={(e) => setStudentInfo(prev => ({ ...prev, studentId: e.target.value }))}
              placeholder="Contoh: 18 / 0072615291"
              disabled={currentAnswers.isSubmitted}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                border: '1.5px solid rgba(255,255,255,0.12)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. TAB NAVIGASI TINGKAT KESULITAN (C1, C2, C3, HOTS) */}
      {/* ==================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {[
          {
            key: 'c1',
            badge: 'LEVEL C1',
            title: 'Mengingat (Dasar)',
            desc: '25 Pilgan + 5 Essay (Fakta & APD)',
            color: '#0284c7',
            border: '#38bdf8'
          },
          {
            key: 'c2',
            badge: 'LEVEL C2',
            title: 'Memahami (Menengah)',
            desc: '25 Pilgan + 5 Essay (Prinsip & Konsep)',
            color: '#059669',
            border: '#34d399'
          },
          {
            key: 'c3',
            badge: 'LEVEL C3',
            title: 'Menerapkan (Lanjut)',
            desc: '25 Pilgan + 5 Essay (Rumus & Prosedur)',
            color: '#d97706',
            border: '#fbbf24'
          },
          {
            key: 'hots',
            badge: 'HOTS FASE E',
            title: 'Analisis & Kasus (Expert)',
            desc: '25 Pilgan + 5 Essay (Problem Solving)',
            color: '#be185d',
            border: '#f472b6'
          }
        ].map(lvl => {
          const isActive = activeLevel === lvl.key;
          const status = answersByLevel[lvl.key];
          return (
            <button
              key={lvl.key}
              onClick={() => handleLevelChange(lvl.key)}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${lvl.color} 0%, #0f172a 100%)`
                  : '#0f172a',
                border: `2px solid ${isActive ? lvl.border : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '16px',
                padding: '18px 20px',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#ffffff',
                boxShadow: isActive ? `0 8px 24px rgba(0,0,0,0.4)` : 'none',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#ffffff' : '#94a3b8'
                }}>
                  {lvl.badge}
                </span>
                {status.isSubmitted && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: status.score >= 75 ? '#10b981' : '#f59e0b',
                    color: '#ffffff'
                  }}>
                    Nilai: {status.score}/100
                  </span>
                )}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px', color: '#ffffff' }}>
                {lvl.title}
              </div>
              <div style={{ fontSize: '12px', color: isActive ? '#e2e8f0' : '#64748b' }}>
                {lvl.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* 4. KARTU HASIL UJIAN SISWA & REKAP DATA GURU */}
      {/* ==================================================== */}
      {currentAnswers.isSubmitted && (
        <div style={{
          background: 'linear-gradient(135deg, #091e3a 0%, #0f172a 60%, #1e293b 100%)',
          border: `2px solid ${currentAnswers.score >= 75 ? '#10b981' : '#f59e0b'}`,
          borderRadius: '18px',
          padding: '28px 32px',
          marginBottom: '28px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
          position: 'relative'
        }}>
          {/* Header Kartu Nilai */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '18px', marginBottom: '20px' }}>
            <div>
              <span style={{
                backgroundColor: currentAnswers.score >= 75 ? '#059669' : '#d97706',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {currentAnswers.score >= 75 ? 'STATUS: TUNTAS (LULUS KOMPETENSI)' : 'STATUS: PERLU PENGAYAAN / REMEDIAL'}
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: '10px 0 4px 0' }}>
                Kartu Hasil Evaluasi: {currentLevelData.levelTitle}
              </h2>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                Tercatat pada: <strong>{currentAnswers.submitTime}</strong>
              </div>
            </div>

            {/* Nilai Angka Besar */}
            <div style={{
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '12px 24px',
              borderRadius: '14px',
              border: `2px solid ${currentAnswers.score >= 75 ? '#10b981' : '#f59e0b'}`
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                NILAI PILIHAN GANDA
              </div>
              <div style={{
                fontSize: '44px',
                fontWeight: 900,
                color: currentAnswers.score >= 75 ? '#34d399' : '#fbbf24',
                fontFamily: 'monospace',
                lineHeight: 1.1
              }}>
                {currentAnswers.score}
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                Skala 0 - 100
              </div>
            </div>
          </div>

          {/* Rincian Rekap Data Siswa untuk Guru */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Nama Siswa:</div>
              <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 800 }}>{studentInfo.name || '(Belum diisi)'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Kelas/Rombel:</div>
              <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 800 }}>{studentInfo.classRoom || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>No. Absen / NIS:</div>
              <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: 800 }}>{studentInfo.studentId || '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Rincian Pilgan:</div>
              <div style={{ fontSize: '14px', color: '#38bdf8', fontWeight: 800 }}>
                {currentAnswers.correctCount} Benar / {25 - currentAnswers.correctCount} Salah
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Status Jawaban Essay:</div>
              <div style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 800 }}>
                {essayAnsweredCount} dari 5 Soal Diuraikan
              </div>
            </div>
          </div>

          {/* Tombol Aksi Guru: Salin & Print */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleCopyTeacherReport}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '11px 22px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(2,132,199,0.3)'
              }}
            >
              <span>📋</span>
              <span>Salin Rekap Nilai Siswa (Untuk Catatan/Excel Guru)</span>
            </button>

            <button
              onClick={() => window.print()}
              style={{
                background: '#1e293b',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '11px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🖨️</span>
              <span>Cetak Bukti Nilai</span>
            </button>

            <button
              onClick={handleReset}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid #ef4444',
                padding: '11px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🔄 Ulangi Ujian Level Ini
            </button>
          </div>

          {/* Toast Notifikasi Berhasil Disalin */}
          {copiedToast && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10b981',
              borderRadius: '8px',
              color: '#34d399',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>✅</span>
              <span>Rekap data nilai siswa berhasil disalin ke clipboard! Siap di-paste ke Excel, WhatsApp, atau dokumen nilai guru.</span>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. BAGIAN A: PILIHAN GANDA (25 SOAL) */}
      {/* ==================================================== */}
      <div style={{
        background: '#0a101d',
        borderRadius: '18px',
        padding: '28px',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '32px'
      }}>
        {/* Header Bagian A */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1.5px solid rgba(255,255,255,0.08)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 900
              }}>
                BAGIAN A
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Soal Pilihan Ganda (25 Nomor)
              </h2>
            </div>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Pilihlah salah satu jawaban yang paling tepat. Tiap soal bernilai 4 poin (Total 100 poin).
            </p>
          </div>

          <div style={{
            fontSize: '13px',
            fontWeight: 800,
            color: mcqAnsweredCount === 25 ? '#34d399' : '#38bdf8',
            backgroundColor: '#0f172a',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            Status: {mcqAnsweredCount} / 25 Terjawab
          </div>
        </div>

        {/* Quick Jump Navigator Palet Nomor */}
        <div style={{
          background: '#0f172a',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.5px' }}>
            NAVIGASI NOMOR SOAL PILIHAN GANDA (KLIK UNTUK MENUJU SOAL):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {currentLevelData.multipleChoice.map(q => {
              const isAnswered = currentAnswers.mcq[q.id] !== undefined;
              const isCorrect = currentAnswers.isSubmitted && currentAnswers.mcq[q.id] === q.answer;
              const isWrong = currentAnswers.isSubmitted && isAnswered && !isCorrect;

              let bg = '#1e293b';
              let color = '#94a3b8';
              let border = 'transparent';

              if (currentAnswers.isSubmitted) {
                if (isCorrect) { bg = '#059669'; color = '#ffffff'; }
                else if (isWrong) { bg = '#dc2626'; color = '#ffffff'; }
                else { bg = '#334155'; color = '#cbd5e1'; }
              } else if (isAnswered) {
                bg = '#0284c7';
                color = '#ffffff';
                border = '#38bdf8';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    const el = document.getElementById(`mcq-card-${q.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: bg,
                    color: color,
                    border: `1px solid ${border}`,
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {q.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daftar Soal Pilihan Ganda 1 - 25 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {currentLevelData.multipleChoice.map((q) => {
            const selectedOption = currentAnswers.mcq[q.id];
            const isCorrect = selectedOption === q.answer;

            return (
              <div
                id={`mcq-card-${q.id}`}
                key={q.id}
                style={{
                  background: '#0f172a',
                  borderRadius: '14px',
                  padding: '22px 24px',
                  border: currentAnswers.isSubmitted
                    ? (isCorrect ? '1.5px solid #10b981' : '1.5px solid #ef4444')
                    : (selectedOption ? '1.5px solid #0284c7' : '1px solid rgba(255,255,255,0.08)'),
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <span style={{
                    backgroundColor: '#1e293b',
                    color: '#38bdf8',
                    fontWeight: 900,
                    fontSize: '12.5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    whiteSpace: 'nowrap'
                  }}>
                    #{q.id}
                  </span>
                  <h3 style={{
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: '#f8fafc',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    {q.question}
                  </h3>
                </div>

                {/* Pilihan Opsi A, B, C, D */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '9px' }}>
                  {q.options.map((opt, idx) => {
                    const optLabel = String.fromCharCode(65 + idx); // A, B, C, D
                    const isSelected = selectedOption === opt;
                    const isAnswerKey = q.answer === opt;

                    let optBg = '#1e293b';
                    let optBorder = 'rgba(255,255,255,0.06)';
                    let optColor = '#e2e8f0';

                    if (currentAnswers.isSubmitted) {
                      if (isAnswerKey) {
                        optBg = 'rgba(16, 185, 129, 0.25)';
                        optBorder = '#10b981';
                        optColor = '#34d399';
                      } else if (isSelected && !isAnswerKey) {
                        optBg = 'rgba(239, 68, 68, 0.25)';
                        optBorder = '#ef4444';
                        optColor = '#fca5a5';
                      }
                    } else if (isSelected) {
                      optBg = 'rgba(2, 132, 199, 0.25)';
                      optBorder = '#0284c7';
                      optColor = '#38bdf8';
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => handleMcqSelect(q.id, opt)}
                        style={{
                          padding: '11px 16px',
                          borderRadius: '10px',
                          background: optBg,
                          border: `1.5px solid ${optBorder}`,
                          color: optColor,
                          cursor: currentAnswers.isSubmitted ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? (currentAnswers.isSubmitted ? (isAnswerKey ? '#10b981' : '#ef4444') : '#0284c7') : 'rgba(255,255,255,0.1)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {optLabel}
                        </span>
                        <span style={{ fontSize: '13px', lineHeight: 1.4 }}>
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Kunci Jawaban & Pembahasan (Muncul setelah submit) */}
                {currentAnswers.isSubmitted && (
                  <div style={{
                    marginTop: '16px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: isCorrect ? '#34d399' : '#fca5a5',
                      marginBottom: '4px'
                    }}>
                      {isCorrect ? '✅ Jawaban Anda Benar!' : `❌ Jawaban Anda Salah. Kunci: ${q.answer}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                      <strong>Pembahasan:</strong> {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 6. BAGIAN B: SOAL ESSAY / URAIAN ANALITIS (5 SOAL) */}
      {/* ==================================================== */}
      <div style={{
        background: '#0a101d',
        borderRadius: '18px',
        padding: '28px',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: '32px'
      }}>
        {/* Header Bagian B */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1.5px solid rgba(255,255,255,0.08)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 900
              }}>
                BAGIAN B
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Soal Essay / Uraian Analitis (5 Nomor)
              </h2>
            </div>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Jawablah pertanyaan secara jelas, runtut, dan sertakan rumus/langkah kerja teknis pada kolom yang disediakan.
            </p>
          </div>

          <div style={{
            fontSize: '13px',
            fontWeight: 800,
            color: essayAnsweredCount === 5 ? '#34d399' : '#f59e0b',
            backgroundColor: '#0f172a',
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            Status: {essayAnsweredCount} / 5 Terisi
          </div>
        </div>

        {/* Daftar 5 Soal Essay */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {currentLevelData.essays.map((essay) => {
            const rubricKey = `${activeLevel}_${essay.id}`;
            const isRubricOpen = showEssayRubric[rubricKey];
            const studentText = currentAnswers.essay[essay.id] || '';

            return (
              <div
                key={essay.id}
                style={{
                  background: '#0f172a',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                  <span style={{
                    backgroundColor: '#1e293b',
                    color: '#f59e0b',
                    fontWeight: 900,
                    fontSize: '12.5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    whiteSpace: 'nowrap'
                  }}>
                    Essay #{essay.id}
                  </span>
                  <h3 style={{
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: '#f8fafc',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    {essay.question}
                  </h3>
                </div>

                {/* Kolom Jawaban Siswa */}
                <textarea
                  rows={5}
                  value={studentText}
                  onChange={(e) => handleEssayChange(essay.id, e.target.value)}
                  placeholder="Tuliskan uraian analisis, perhitungan rumus, atau prosedur kerja Anda secara lengkap di sini..."
                  disabled={currentAnswers.isSubmitted}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#1e293b',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Tombol Buka Kunci Jawaban / Rubrik */}
                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => toggleRubric(essay.id)}
                    style={{
                      background: isRubricOpen ? '#334155' : 'rgba(56, 189, 248, 0.15)',
                      border: `1px solid ${isRubricOpen ? '#64748b' : '#38bdf8'}`,
                      color: isRubricOpen ? '#cbd5e1' : '#38bdf8',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{isRubricOpen ? 'Tutup Rubrik Penilaian' : '🔍 Lihat Kunci Jawaban & Rubrik Penilaian'}</span>
                  </button>
                </div>

                {/* Tampilan Rubrik Jawaban Ideal */}
                {isRubricOpen && (
                  <div style={{
                    marginTop: '14px',
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'rgba(2, 132, 199, 0.1)',
                    border: '1px solid rgba(2, 132, 199, 0.3)'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#38bdf8', marginBottom: '8px' }}>
                      📋 KRITERIA POIN JAWABAN IDEAL (RUBRIK GURU &amp; EVALUASI MANDIRI):
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.55 }}>
                      {essay.expectedPoints.map((pt, pIdx) => (
                        <li key={pIdx} style={{ marginBottom: '6px' }}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 7. TOMBOL AKSI KIRIM SEMUA JAWABAN (SUBMIT EXAM) */}
      {/* ==================================================== */}
      <div style={{
        padding: '24px 28px',
        background: '#0f172a',
        borderRadius: '18px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.35)'
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
            Konfirmasi Penyelesaian {currentLevelData.shortTitle}:
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
            Pastikan seluruh soal telah dijawab: {mcqAnsweredCount}/25 Pilihan Ganda &amp; {essayAnsweredCount}/5 Essay terisi.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {!currentAnswers.isSubmitted ? (
            <button
              onClick={handleSubmit}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
                color: '#ffffff',
                padding: '14px 34px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 900,
                fontSize: '14px',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(2, 132, 199, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🚀</span>
              <span>Kirim &amp; Munculkan Nilai Siswa</span>
            </button>
          ) : (
            <button
              onClick={handleReset}
              style={{
                background: '#334155',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🔄 Reset &amp; Coba Ujian Ulang
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default EvaluationView;

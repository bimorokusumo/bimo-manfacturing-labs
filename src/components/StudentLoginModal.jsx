import React, { useState, useEffect } from 'react';
import { useStudent, isTeacherUser } from '../context/StudentContext';
import { sound } from '../utils/audio';

const CLASS_OPTIONS = [
  'X TPM 1',
  'X TPM 2',
  'X TPM 3',
  'XI TPM 1',
  'XI TPM 2',
  'XI TPM 3',
  'XII TPM 1',
  'XII TPM 2',
  'D3 Teknik Mesin',
  'D4 Teknik Manufaktur',
  'Lainnya (Tulis Manual)'
];

const StudentLoginModal = () => {
  const { student, isLoggedIn, isModalOpen, closeLoginModal, login } = useStudent();

  const [formData, setFormData] = useState({
    name: '',
    studentNumber: '',
    className: 'X TPM 1',
    customClass: '',
    school: ''
  });

  const isEnteringTeacher = isTeacherUser({
    name: formData.name,
    studentNumber: formData.studentNumber,
    className: formData.className === 'Lainnya (Tulis Manual)' ? formData.customClass : formData.className,
    school: formData.school
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Sync form data whenever modal opens or student changes
  useEffect(() => {
    if (isModalOpen) {
      const isPreset = CLASS_OPTIONS.includes(student?.className);
      setFormData({
        name: student?.name || '',
        studentNumber: student?.studentNumber || '',
        className: isPreset ? (student?.className || 'X TPM 1') : 'Lainnya (Tulis Manual)',
        customClass: isPreset ? '' : (student?.className || ''),
        school: student?.school || ''
      });
      setErrorMsg('');
    }
  }, [isModalOpen, student]);

  if (!isModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.playClick();

    const cleanName = formData.name.trim();
    const cleanNumber = formData.studentNumber.trim();
    const resolvedClass = formData.className === 'Lainnya (Tulis Manual)'
      ? (formData.customClass.trim() || 'Umum')
      : formData.className;

    if (!cleanName) {
      setErrorMsg('Nama lengkap siswa wajib diisi.');
      return;
    }

    if (cleanName.length < 3) {
      setErrorMsg('Nama lengkap minimal 3 karakter.');
      return;
    }

    if (!cleanNumber) {
      setErrorMsg('Nomor absen siswa wajib diisi.');
      return;
    }

    const num = parseInt(cleanNumber, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      setErrorMsg('Nomor absen harus berupa angka antara 1 sampai 99.');
      return;
    }

    sound.playSuccess();
    login({
      name: cleanName,
      studentNumber: cleanNumber,
      className: resolvedClass,
      school: formData.school.trim()
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="dashboard-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '28px 28px 22px 28px',
            color: '#ffffff',
            position: 'relative'
          }}
        >
          {isLoggedIn && (
            <button
              onClick={() => {
                sound.playClick();
                closeLoginModal();
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#cbd5e1',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 700
              }}
              title="Tutup"
            >
              ✕
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2rem' }}>🎓</span>
            <div>
              <div
                style={{
                  fontFamily: "'Chakra Petch', sans-serif",
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  color: '#f59e0b'
                }}
              >
                IDENTITAS SISWA PRAKTIKAN
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Bimo Virtual Manufacturing Labs
              </div>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5, marginTop: '6px' }}>
            Silakan masukkan nama lengkap dan nomor absen Anda. Hasil evaluasi & kuis akan terintegrasi langsung ke <strong>Spreadsheet Rekap Guru</strong>.
          </p>
        </div>

        {/* MODAL BODY / FORM */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #f87171',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* INPUT NAMA LENGKAP */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Nama Lengkap Siswa <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Muhammad Budi Pratama"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                transition: 'border-color 0.2s',
                background: '#f8fafc'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
          </div>

          {/* ROW: NOMOR ABSEN & KELAS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '14px' }}>
            {/* INPUT NOMOR ABSEN */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Nomor Absen <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max="99"
                required
                placeholder="1 - 50"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none',
                  background: '#f8fafc'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>

            {/* PILIHAN KELAS */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Kelas / Rombel <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  background: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                {CLASS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CUSTOM CLASS INPUT IF "Lainnya" SELECTED */}
          {formData.className === 'Lainnya (Tulis Manual)' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Ketik Nama Kelas / Jurusan Anda:
              </label>
              <input
                type="text"
                placeholder="Contoh: XII Teknik Pemesinan B"
                value={formData.customClass}
                onChange={(e) => setFormData({ ...formData, customClass: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  background: '#f8fafc'
                }}
              />
            </div>
          )}

          {/* INPUT ASAL SEKOLAH */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Nama Sekolah / Instansi <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>(Wajib untuk Guru SMKN 2 Depok)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: SMKN 2 Depok"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: isEnteringTeacher ? '2px solid #f59e0b' : '1.5px solid #cbd5e1',
                fontSize: '0.92rem',
                color: '#0f172a',
                outline: 'none',
                background: isEnteringTeacher ? '#fffbeb' : '#f8fafc'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
              onBlur={(e) => (e.target.style.borderColor = isEnteringTeacher ? '#f59e0b' : '#cbd5e1')}
            />
          </div>

          {/* INFO BADGE */}
          {isEnteringTeacher ? (
            <div
              style={{
                background: '#fef3c7',
                border: '1.5px solid #f59e0b',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700
              }}
            >
              <span>⭐</span>
              <span>Akses Khusus Guru Terdeteksi: Panel Monitoring Nilai akan otomatis diaktifkan untuk Anda.</span>
            </div>
          ) : (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.78rem',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>📊</span>
              <span>Nilai otomatis terekam ke Spreadsheet Guru secara real-time setiap kali Anda menyelesaikan kuis.</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            style={{
              marginTop: '6px',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>Masuk Laboratorium & Mulai Praktik</span>
            <span>🚀</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLoginModal;

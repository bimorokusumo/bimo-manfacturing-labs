import React, { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext();

const STORAGE_KEY = 'bimo_student_session';

/**
 * Validasi Hak Akses Guru:
 * Khusus login dengan format:
 * - Nama Lengkap: bimoro kusumo
 * - No. Absen: 1
 * - Kelas: X TPM 1
 * - Nama Sekolah: SMKN 2 Depok
 */
export const isTeacherUser = (user) => {
  if (!user) return false;
  const name = (user.name || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const studentNum = (user.studentNumber || '').toString().trim();
  const className = (user.className || '').toUpperCase().replace(/[\s-_]/g, '').trim();
  const school = (user.school || '').toUpperCase().replace(/[\s\.]/g, '').trim();

  const isNameMatch = name === 'bimoro kusumo';
  const isNumberMatch = studentNum === '1' || studentNum === '01';
  const isClassMatch = className === 'XTPM1';
  const isSchoolMatch = school === 'SMKN2DEPOK' || school === 'SMKNEGERI2DEPOK';

  return isNameMatch && isNumberMatch && isClassMatch && isSchoolMatch;
};

export const StudentProvider = ({ children }) => {
  const [student, setStudent] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.studentNumber) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Gagal memuat sesi siswa:', e);
    }
    return {
      name: '',
      studentNumber: '',
      className: 'X TPM 1',
      school: ''
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  const isLoggedIn = Boolean(student?.name?.trim() && student?.studentNumber?.trim());
  const isTeacher = isTeacherUser(student);

  // Listen for quiz submission events to show non-intrusive toast
  useEffect(() => {
    const handleQuizSubmitted = (e) => {
      const { record, sheetResult } = e.detail || {};
      if (!record) return;

      const isSynced = sheetResult?.success || record.synced;
      setToastNotification({
        title: `Hasil ${record.judulKuis} Tercatat!`,
        message: `Nilai: ${record.skor}/100 (${record.status}) • ${isSynced ? '✅ Terkirim ke Spreadsheet Guru' : '💾 Tersimpan di perangkat (Akan disinkronkan)'}`,
        type: record.status === 'LULUS' ? 'success' : 'warning'
      });

      setTimeout(() => {
        setToastNotification(null);
      }, 5500);
    };

    window.addEventListener('bimo:quiz_submitted', handleQuizSubmitted);
    return () => window.removeEventListener('bimo:quiz_submitted', handleQuizSubmitted);
  }, []);

  const login = (data) => {
    const cleanData = {
      name: (data.name || '').trim(),
      studentNumber: (data.studentNumber || '').trim(),
      className: (data.className || 'X TPM 1').trim(),
      school: (data.school || '').trim()
    };

    setStudent(cleanData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
    } catch (e) {
      console.error('Gagal menyimpan sesi siswa:', e);
    }

    setIsModalOpen(false);

    // Execute pending callback if any
    if (pendingCallback && typeof pendingCallback === 'function') {
      const cb = pendingCallback;
      setPendingCallback(null);
      setTimeout(() => cb(), 100);
    }
  };

  const logout = () => {
    setStudent({
      name: '',
      studentNumber: '',
      className: 'X TPM 1',
      school: ''
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const openLoginModal = (action = null) => {
    if (action && typeof action === 'function') {
      setPendingCallback(() => action);
    }
    setIsModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsModalOpen(false);
    setPendingCallback(null);
  };

  const requireLogin = (action) => {
    if (isLoggedIn) {
      action();
    } else {
      openLoginModal(action);
    }
  };

  return (
    <StudentContext.Provider
      value={{
        student,
        isLoggedIn,
        isTeacher,
        isModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
        requireLogin
      }}
    >
      {children}

      {/* GLOBAL TOAST NOTIFICATION FOR QUIZ RECORDING */}
      {toastNotification && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            background: toastNotification.type === 'success' ? '#0f172a' : '#1e1b4b',
            color: '#ffffff',
            border: `2px solid ${toastNotification.type === 'success' ? '#10b981' : '#f59e0b'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '420px',
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div style={{ fontSize: '2rem' }}>
            {toastNotification.type === 'success' ? '🏆' : '📝'}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: toastNotification.type === 'success' ? '#34d399' : '#fbbf24' }}>
              {toastNotification.title}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.4 }}>
              {toastNotification.message}
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.1rem',
              marginLeft: 'auto'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

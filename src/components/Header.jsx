import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useStudent } from '../context/StudentContext';
import { getInitialsAvatar } from '../utils/assets';
import {
  Accessibility,
  Volume2,
  VolumeX,
  BarChart3,
  ExternalLink,
  GraduationCap,
  User,
  Home,
  LogOut,
  LogIn
} from 'lucide-react';

const Header = ({ toggleSidebar, onOpenGradebook, onLogout, onGoToLanding }) => {
  const { setIsModalOpen, isSpeaking, speakText, stopSpeech } = useAccessibility();
  const { student, isLoggedIn, openLoginModal, logout, isTeacher } = useStudent();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="app-header" style={{
      height: '80px',
      padding: '0 30px',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg-game)',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div className="app-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexShrink: 1 }}>
        <button
          onClick={toggleSidebar}
          className="app-header-hamburger-btn"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', flexShrink: 0 }}
          title="Buka / Tutup Menu Navigasi"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <div className="app-header-title-wrapper" style={{ minWidth: 0 }}>
          <h2
            className="app-header-title"
            title={isTeacher ? `Pak ${student.name}` : (isLoggedIn ? student.name : 'Siswa Praktikan')}
            style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Halo, {isTeacher ? `Pak ${student.name}` : (isLoggedIn ? student.name : 'Siswa Praktikan')}!
          </h2>
          <p className="app-header-subtitle" style={{ color: isTeacher ? '#d97706' : 'var(--text-muted)', fontSize: '0.82rem', margin: 0, marginTop: '3px', fontWeight: isTeacher ? 700 : 400 }}>
            {isTeacher ? `Pengajar • ${student.school || 'SMKN 2 Depok'} (Panel Guru Aktif)` : (isLoggedIn ? `No. Absen: ${student.studentNumber} • ${student.className}` : 'Silakan Login untuk mencatat progres & nilai ke Spreadsheet Guru')}
          </p>
        </div>
      </div>

      <div className="app-header-right" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Extra tools (Inklusi & Narator) - disembunyikan di mode HP Landscape & Portrait sempit */}
        <div className="app-header-extra-tools" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Button Aksesibilitas & Inklusi */}
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: '#2563eb',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              fontWeight: 800,
              transition: 'all 0.2s ease'
            }}
            title="Pengaturan Aksesibilitas & Mode Inklusi"
          >
            <Accessibility size={15} />
            <span className="app-header-class-text">Inklusi</span>
          </button>

          {/* Button Quick Audio Narator Toggle */}
          <button
            onClick={isSpeaking ? stopSpeech : () => speakText('Selamat datang di Virtual Manufacturing Lab. Silakan pilih menu di samping atau klik tombol narator pada modul yang sedang Anda pelajari untuk mendengarkan penjelasan materi.', 'Panduan Navigasi Lab')}
            style={{
              background: isSpeaking ? '#fff7ed' : 'rgba(0, 0, 0, 0.05)',
              border: isSpeaking ? '1px solid #f59e0b' : '1px solid var(--border-light)',
              color: isSpeaking ? '#ea580c' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              fontWeight: 800,
              transition: 'all 0.2s ease'
            }}
            title={isSpeaking ? "Hentikan Narator Suara" : "Dengarkan Panduan Suara"}
          >
            {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span className="app-header-class-text">{isSpeaking ? 'Berhenti' : 'Narator'}</span>
          </button>
        </div>

        {/* Fullscreen Button for Mobile Landscape & Portrait */}
        <button
          className="app-header-fullscreen-btn"
          onClick={toggleFullscreen}
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#d97706',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            fontWeight: 800,
            transition: 'all 0.15s'
          }}
          title="Mode Layar Penuh (Fullscreen)"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span className="app-header-fullscreen-text">Layar Penuh</span>
        </button>

        {/* TOMBOL REKAP SPREADSHEET DI HEADER - HANYA UNTUK GURU */}
        {isTeacher && (
          <div className="app-header-teacher-rekap" style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)', flexShrink: 0 }}>
            {onOpenGradebook && (
              <button
                className="app-header-spreadsheet-btn"
                onClick={onOpenGradebook}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
                title="Buka Lembar Rekap Nilai Siswa di Aplikasi Labs"
              >
                <BarChart3 size={15} />
                <span className="app-header-spreadsheet-text">Rekap Lab</span>
              </button>
            )}

            {/* LINK LANGSUNG KE GOOGLE SPREADSHEET SMKN 2 DEPOK */}
            <a
              className="app-header-sheets-link"
              href="https://docs.google.com/spreadsheets/d/1-YH8PCzHIUv1B8I1dCj_XmcQ2c-jyAavPQfWGHYCUT4/edit?hl=id&gid=1804603706#gid=1804603706"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#047857',
                borderLeft: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '6px 11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.76rem',
                fontWeight: 800
              }}
              title="Buka Langsung Google Spreadsheet SMKN 2 Depok di Tab Baru"
            >
              <ExternalLink size={13} />
              <span className="app-header-class-text app-header-sheets-text">Sheets</span>
            </a>
          </div>
        )}

        {/* IDENTITAS SISWA / LOGIN & LOGOUT ACTIONS */}
        {isLoggedIn ? (
          <div className="app-header-user-section" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              className="app-header-user-profile"
              onClick={() => openLoginModal()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '10px',
                transition: 'background 0.2s',
                border: '1px solid transparent'
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              title={isTeacher ? "Akun Guru Terverifikasi (Klik untuk Ganti/Edit)" : "Klik untuk Edit Identitas / Ganti Siswa"}
            >
              <div className="app-header-user-details" style={{ textAlign: 'right' }}>
                <div className="app-header-user-text" style={{ fontWeight: 800, fontSize: '0.85rem', color: isTeacher ? '#d97706' : 'var(--text-main)', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isTeacher && <GraduationCap size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle', color: '#f59e0b' }} />}
                  {student.name}
                </div>
                <div className="app-header-class-text" style={{ fontSize: '0.72rem', color: isTeacher ? '#d97706' : '#0284c7', fontWeight: 700 }}>
                  {isTeacher ? 'Pengajar' : `Absen: ${student.studentNumber}`}
                </div>
              </div>
              <div className="app-header-avatar" style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#334155', overflow: 'hidden', border: isTeacher ? '2.5px solid #f59e0b' : '2px solid #0284c7', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)', flexShrink: 0 }}>
                <img src={getInitialsAvatar(student?.name, isTeacher)} alt="Avatar" style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>
            </div>

            {/* TOMBOL BERANDA / LANDING PAGE */}
            <button
              className="app-header-beranda-btn"
              onClick={() => {
                if (typeof onGoToLanding === 'function') onGoToLanding();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              title="Ke Halaman Utama (Landing Page)"
            >
              <Home size={14} />
              <span className="app-header-class-text">Beranda</span>
            </button>

            {/* TOMBOL LOGOUT */}
            <button
              className="app-header-logout-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Apakah Anda yakin ingin keluar (Logout)? Sesi akun Anda akan ditutup.")) {
                  logout();
                  if (typeof onLogout === 'function') {
                    onLogout();
                  }
                }
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#ef4444',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              title="Keluar / Logout dari sesi ini"
            >
              <LogOut size={14} />
              <span className="app-header-class-text">Logout</span>
            </button>
          </div>
        ) : (
          /* TOMBOL LOGIN JIKA BELUM LOGIN */
          <button
            className="app-header-login-btn"
            onClick={() => openLoginModal()}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              transition: 'all 0.2s'
            }}
            title="Masuk / Login Siswa"
          >
            <LogIn size={15} />
            <span>Masuk / Login</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;

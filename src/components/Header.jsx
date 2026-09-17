import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const Header = ({ toggleSidebar }) => {
  const { setIsModalOpen, isSpeaking, speakText, stopSpeech } = useAccessibility();

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <div>
          <h2 className="app-header-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Halo, Siswa! <span role="img" aria-label="wave">👋</span>
          </h2>
          <p className="app-header-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, marginTop: '4px' }}>
            Selamat datang di Virtual Manufacturing Lab
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          <span style={{ fontSize: '1rem' }}>♿</span>
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
          <span>{isSpeaking ? '🔊' : '🔈'}</span>
          <span className="app-header-class-text">{isSpeaking ? 'Berhenti' : 'Narator'}</span>
        </button>

        {/* Fullscreen Button for Mobile Landscape */}
        <button
          onClick={toggleFullscreen}
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            fontWeight: 700
          }}
          title="Layar Penuh (Landscape)"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span className="app-header-class-text">Fullscreen</span>
        </button>

        <button style={{ position: 'relative', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--game-danger)', borderRadius: '50%', border: '2px solid var(--bg-game)' }}></span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="app-header-user-text" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>Siswa</div>
            <div className="app-header-class-text" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Kelas X TPM</div>
          </div>
          <div className="app-header-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#334155', overflow: 'hidden' }}>
            <img src="https://ui-avatars.com/api/?name=Siswa&background=f59e0b&color=fff&bold=true" alt="Avatar" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

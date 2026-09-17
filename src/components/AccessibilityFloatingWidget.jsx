import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const AccessibilityFloatingWidget = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    isSpeaking,
    isPaused,
    currentNarrativeTitle,
    pauseSpeech,
    resumeSpeech,
    stopSpeech
  } = useAccessibility();

  return (
    <div
      className="a11y-floating-widget"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9980,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {/* TOMBOL MODAL INKLUSI UTAMA */}
      <button
        onClick={() => setIsModalOpen(!isModalOpen)}
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          padding: '10px 16px',
          borderRadius: '30px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 800,
          fontSize: '0.8rem',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
        title="Buka Pengaturan Aksesibilitas & Inklusi"
      >
        <span style={{ fontSize: '1.1rem' }}>♿</span>
        <span className="a11y-widget-label">Aksesibilitas & Inklusi</span>
      </button>

      {/* ACTIVE AUDIO NARRATION PILL (Tampil otomatis saat narator berbicara) */}
      {isSpeaking && (
        <div
          className="animate-fade-in"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #f59e0b',
            borderRadius: '30px',
            padding: '6px 12px 6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fff',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)'
          }}
        >
          {/* Animated sound bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '14px' }}>
            <span className="sound-wave-bar bar-1" />
            <span className="sound-wave-bar bar-2" />
            <span className="sound-wave-bar bar-3" />
          </div>

          <span style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            maxWidth: '160px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#fde68a'
          }}>
            {currentNarrativeTitle || 'Membacakan...'}
          </span>

          <button
            onClick={isPaused ? resumeSpeech : pauseSpeech}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '20px',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title={isPaused ? 'Lanjut' : 'Jeda'}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>

          <button
            onClick={stopSpeech}
            style={{
              background: 'rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.6)',
              color: '#fca5a5',
              padding: '4px 8px',
              borderRadius: '20px',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Hentikan Narasi"
          >
            ⏹️ Stop
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessibilityFloatingWidget;

import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const LiveCaptionsOverlay = () => {
  const {
    isSpeaking,
    isPaused,
    currentNarrativeTitle,
    currentNarrativeText,
    showCaptions,
    setShowCaptions,
    pauseSpeech,
    resumeSpeech,
    stopSpeech
  } = useAccessibility();

  if (!isSpeaking || !showCaptions || !currentNarrativeText) {
    return null;
  }

  return (
    <aside 
      aria-label="Teks Narasi Berjalan (Live Captions)"
      className="a11y-live-captions animate-fade-in"
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '780px',
        width: 'calc(100% - 32px)',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(245, 158, 11, 0.6)',
        borderRadius: '16px',
        padding: '14px 18px',
        color: '#ffffff',
        zIndex: 9990,
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* Header bar captions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--game-primary, #f59e0b)',
            color: '#000',
            fontSize: '12px',
            fontWeight: 900
          }}>
            🔊
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fcd34d', letterSpacing: '0.3px' }}>
            {currentNarrativeTitle || 'Audio Narator Inklusi'}
          </span>
          <span style={{
            fontSize: '0.68rem',
            padding: '2px 6px',
            borderRadius: '4px',
            background: isPaused ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)',
            color: isPaused ? '#fca5a5' : '#6ee7b7',
            fontWeight: 700
          }}>
            {isPaused ? 'Dijeda' : 'Sedang Membacakan'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Pause / Resume */}
          <button
            onClick={isPaused ? resumeSpeech : pauseSpeech}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={isPaused ? "Lanjutkan Audio" : "Jeda Audio"}
          >
            {isPaused ? '▶️ Lanjut' : '⏸️ Jeda'}
          </button>

          {/* Stop Button */}
          <button
            onClick={stopSpeech}
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Hentikan Audio"
          >
            ⏹️ Berhenti
          </button>

          {/* Tutup Subtitle */}
          <button
            onClick={() => setShowCaptions(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              padding: '2px 6px',
              cursor: 'pointer',
              marginLeft: '4px'
            }}
            title="Sembunyikan Teks Subtitle"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Spoken Text Body */}
      <div style={{
        fontSize: '0.92rem',
        lineHeight: 1.6,
        color: '#f8fafc',
        maxHeight: '85px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {currentNarrativeText}
      </div>
    </aside>
  );
};

export default LiveCaptionsOverlay;

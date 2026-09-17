import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const AccessibilityModal = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    fontSize,
    setFontSize,
    isDyslexicFont,
    setIsDyslexicFont,
    isHighContrast,
    setIsHighContrast,
    isReducedMotion,
    setIsReducedMotion,
    showCaptions,
    setShowCaptions,
    speechRate,
    setSpeechRate,
    speakText,
    isSpeaking,
    stopSpeech
  } = useAccessibility();

  if (!isModalOpen) return null;

  const handleTestAudio = () => {
    speakText(
      'Halo! Ini adalah contoh suara narator audio inklusi Virtual Manufacturing Lab. Fitur ini dirancang untuk mendampingi seluruh siswa, termasuk siswa dengan disleksia, hambatan penglihatan, dan gaya belajar auditori agar dapat belajar pemesinan secara setara.',
      'Uji Coba Suara Narator Inklusi'
    );
  };

  return (
    <div 
      className="a11y-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
      onClick={() => setIsModalOpen(false)}
    >
      <div 
        className="a11y-modal-container animate-scale-up"
        style={{
          background: isHighContrast ? '#000000' : '#ffffff',
          color: isHighContrast ? '#ffffff' : '#0f172a',
          border: isHighContrast ? '2px solid #ffffff' : '1px solid #cbd5e1',
          borderRadius: '20px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          padding: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isHighContrast ? '1px solid #444' : '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              color: '#fff'
            }}>
              ♿
            </span>
            <div>
              <h2 id="a11y-modal-title" style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, letterSpacing: '-0.01em' }}>
                Pengaturan Aksesibilitas & Inklusi
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: isHighContrast ? '#94a3b8' : '#64748b' }}>
                Dukungan Penuh Siswa Berkebutuhan Khusus & Gaya Belajar Beragam
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(false)}
            aria-label="Tutup Pengaturan Aksesibilitas"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              color: isHighContrast ? '#fff' : '#64748b',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
          >
            ✕
          </button>
        </div>

        {/* SECTION 1: AUDIO NARRATOR SETTINGS */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔊</span> Narator Audio (Text-to-Speech)
            </label>
            <button
              onClick={isSpeaking ? stopSpeech : handleTestAudio}
              style={{
                background: isSpeaking ? '#ef4444' : '#f59e0b',
                color: '#fff',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isSpeaking ? '⏹️ Hentikan Tes' : '▶️ Uji Coba Suara'}
            </button>
          </div>

          {/* Kecepatan Suara */}
          <div style={{
            background: isHighContrast ? '#111' : '#f8fafc',
            border: isHighContrast ? '1px solid #333' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: isHighContrast ? '#cbd5e1' : '#475569', fontWeight: 600 }}>
                Kecepatan Bacaan Suara:
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b' }}>
                {speechRate}x ({speechRate < 1 ? 'Lebih Santai' : speechRate === 1 ? 'Normal' : 'Lebih Cepat'})
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { rate: 0.8, label: '0.8x (Santai / Low Vision)' },
                { rate: 1.0, label: '1.0x (Normal)' },
                { rate: 1.25, label: '1.25x (Cepat)' }
              ].map(item => (
                <button
                  key={item.rate}
                  onClick={() => setSpeechRate(item.rate)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: speechRate === item.rate ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                    background: speechRate === item.rate ? '#fff7ed' : '#ffffff',
                    color: speechRate === item.rate ? '#c2410c' : '#334155'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: UKURAN TEKS (FONT SIZE) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span>🔤</span> Ukuran Teks (Zoom Tipografi)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'normal', label: 'Standar (100%)', icon: 'A' },
              { id: 'large', label: 'Besar (115%)', icon: 'A+' },
              { id: 'xlarge', label: 'Sangat Besar (130%)', icon: 'A++' }
            ].map(sz => (
              <button
                key={sz.id}
                onClick={() => setFontSize(sz.id)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: fontSize === sz.id ? '2px solid #3b82f6' : isHighContrast ? '1px solid #444' : '1px solid #cbd5e1',
                  background: fontSize === sz.id ? (isHighContrast ? '#1e3a8a' : '#eff6ff') : (isHighContrast ? '#111' : '#ffffff'),
                  color: fontSize === sz.id ? (isHighContrast ? '#fff' : '#1d4ed8') : (isHighContrast ? '#fff' : '#334155'),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{sz.icon}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{sz.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3: TOGGLES FOR SPECIAL NEEDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          
          {/* Dyslexic Friendly Font */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '12px',
            background: isHighContrast ? '#111' : '#f8fafc',
            border: isHighContrast ? '1px solid #333' : '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                📖 Huruf Ramah Disleksia (Lexend)
              </div>
              <div style={{ fontSize: '0.75rem', color: isHighContrast ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                Tipografi khusus yang mencegah huruf tertukar (b/d/p/q) & spasi kata lebih renggang.
              </div>
            </div>
            <button
              onClick={() => setIsDyslexicFont(!isDyslexicFont)}
              style={{
                width: '48px',
                height: '26px',
                borderRadius: '13px',
                background: isDyslexicFont ? '#10b981' : '#cbd5e1',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              aria-label="Toggle Font Ramah Disleksia"
            >
              <div style={{
                position: 'absolute',
                top: '3px',
                left: isDyslexicFont ? '25px' : '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#ffffff',
                transition: 'left 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          {/* High Contrast Mode */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '12px',
            background: isHighContrast ? '#111' : '#f8fafc',
            border: isHighContrast ? '1px solid #333' : '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                👁️ Mode Kontras Tinggi (Low Vision)
              </div>
              <div style={{ fontSize: '0.75rem', color: isHighContrast ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                Meningkatkan rasio kontras warna teks dan elemen agar mudah terbaca bagi penglihatan terbatas.
              </div>
            </div>
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              style={{
                width: '48px',
                height: '26px',
                borderRadius: '13px',
                background: isHighContrast ? '#10b981' : '#cbd5e1',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              aria-label="Toggle Kontras Tinggi"
            >
              <div style={{
                position: 'absolute',
                top: '3px',
                left: isHighContrast ? '25px' : '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#ffffff',
                transition: 'left 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          {/* Reduced Motion */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '12px',
            background: isHighContrast ? '#111' : '#f8fafc',
            border: isHighContrast ? '1px solid #333' : '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🛑 Kurangi Gerakan (Reduced Motion)
              </div>
              <div style={{ fontSize: '0.75rem', color: isHighContrast ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                Mematikan rotasi otomatis objek 3D & animasi berkedip untuk siswa ADHD / sensitif vestibular.
              </div>
            </div>
            <button
              onClick={() => setIsReducedMotion(!isReducedMotion)}
              style={{
                width: '48px',
                height: '26px',
                borderRadius: '13px',
                background: isReducedMotion ? '#10b981' : '#cbd5e1',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              aria-label="Toggle Kurangi Gerakan"
            >
              <div style={{
                position: 'absolute',
                top: '3px',
                left: isReducedMotion ? '25px' : '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#ffffff',
                transition: 'left 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          {/* Live Captions Subtitle Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '12px',
            background: isHighContrast ? '#111' : '#f8fafc',
            border: isHighContrast ? '1px solid #333' : '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                💬 Subtitle Teks Berjalan (Tunarungu)
              </div>
              <div style={{ fontSize: '0.75rem', color: isHighContrast ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                Menampilkan kotak teks melayang saat narator berbicara untuk siswa tunarungu atau lingkungan bising.
              </div>
            </div>
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              style={{
                width: '48px',
                height: '26px',
                borderRadius: '13px',
                background: showCaptions ? '#10b981' : '#cbd5e1',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              aria-label="Toggle Subtitle Teks Berjalan"
            >
              <div style={{
                position: 'absolute',
                top: '3px',
                left: showCaptions ? '25px' : '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#ffffff',
                transition: 'left 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        </div>

        {/* Footer Tombol Selesai */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={() => setIsModalOpen(false)}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            Terapkan & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityModal;

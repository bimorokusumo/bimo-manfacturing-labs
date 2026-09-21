import React, { useState, useEffect } from 'react';

const MobileRotatePrompt = () => {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('dismiss_rotate_prompt') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window === 'undefined') return;
      const isMobileWidth = window.innerWidth <= 820;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobileWidth && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortraitMobile || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('dismiss_rotate_prompt', 'true');
    } catch {}
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        zIndex: 99998,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: '14px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        border: '1.5px solid rgba(245, 158, 11, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div
          style={{
            fontSize: '1.6rem',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          🔄
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.3px' }}>
            MODE HP LANDSCAPE DISIAPKAN
          </div>
          <div style={{ fontSize: '0.74rem', color: '#e2e8f0', marginTop: '2px', lineHeight: 1.3 }}>
            Putar HP Anda ke posisi <strong>Mendatar (Landscape)</strong> untuk pengalaman simulator yang luas &amp; UI simpel!
          </div>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        style={{
          background: '#f59e0b',
          color: '#000000',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '8px',
          fontWeight: 800,
          fontSize: '0.75rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}
      >
        Oke, Paham
      </button>
    </div>
  );
};

export default MobileRotatePrompt;

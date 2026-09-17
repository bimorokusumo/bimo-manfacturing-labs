import React from 'react';
import { LogoIcon } from './Graphics';

const Navbar = ({ activeMajor, activeModuleTitle, onGoHome, onSelectMajor }) => {
  return (
    <header style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
    }}>
      <div className="container flex-between" style={{ height: '64px' }}>
        
        {/* BRAND IDENTITY & BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            onClick={onGoHome}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px',
              backgroundColor: 'rgba(0, 225, 255, 0.1)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              border: '1px solid var(--game-tp)',
              boxShadow: '0 0 10px rgba(0, 225, 255, 0.2)'
            }}>
              <LogoIcon size={24} color="var(--game-tp)" />
            </div>
            <div>
              <div className="cyber-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '1px', lineHeight: 1.2, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                VirtualLab <span style={{ color: 'var(--game-tp)', textShadow: '0 0 10px var(--game-tp)' }}>Manufaktur</span>
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--game-primary)', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>
                OS_VER: KURIKULUM MERDEKA // FASE E
              </div>
            </div>
          </div>

          {/* BREADCRUMB PATH */}
          {activeMajor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-light)', paddingLeft: '16px', fontSize: '0.875rem' }}>
              <span 
                onClick={onGoHome}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500 }}
              >
                Jalur Utama
              </span>
              <span style={{ color: 'var(--text-subtle)' }}>/</span>
              <span 
                className="cyber-font"
                style={{
                  fontWeight: 700,
                  color: activeMajor === 'TP' ? 'var(--game-tp)' : 'var(--game-tflm)',
                  textShadow: activeMajor === 'TP' ? '0 0 5px var(--game-tp)' : '0 0 5px var(--game-tflm)'
                }}
              >
                {activeMajor === 'TP' ? 'Teknik Pemesinan' : 'Fabrikasi Logam (TFLM)'}
              </span>
              {activeModuleTitle && (
                <>
                  <span style={{ color: 'var(--text-subtle)' }}>/</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{activeModuleTitle}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT ACTION CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeMajor && (
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button 
                onClick={() => onSelectMajor('TP')}
                className="cyber-font"
                style={{
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: activeMajor === 'TP' ? 'var(--game-tp)' : 'transparent',
                  color: activeMajor === 'TP' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                TP
              </button>
              <button 
                onClick={() => onSelectMajor('TFLM')}
                className="cyber-font"
                style={{
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: activeMajor === 'TFLM' ? 'var(--game-tflm)' : 'transparent',
                  color: activeMajor === 'TFLM' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                TFLM
              </button>
            </div>
          )}

          <button className="btn-game btn-game-neutral" style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: '6px' }} onClick={onGoHome}>
            Beranda Lab
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;

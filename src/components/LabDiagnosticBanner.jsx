import React from 'react';
import { sound } from '../utils/audio';

const LabDiagnosticBanner = ({ 
  labTitle = 'Laboratorium', 
  desc = 'Ukur pemahaman awal konsep dasar, rumus teknis, dan SOP keselamatan sebelum memulai kegiatan praktikum.',
  onOpenDiagnostic 
}) => {
  if (!onOpenDiagnostic) return null;

  return (
    <div 
      className="lab-diagnostic-banner"
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        color: '#ffffff',
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.18)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <div 
          className="lab-diagnostic-icon"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            flexShrink: 0
          }}
        >
          📋
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#f59e0b',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.65rem',
              padding: '2px 7px',
              borderRadius: '6px',
              letterSpacing: '0.4px'
            }}>
              DIAGNOSTIK AWAL
            </span>
            <span className="lab-diagnostic-subtitle" style={{ fontSize: '0.72rem', color: '#bfdbfe', fontWeight: 600 }}>
              Tepat 10 Soal Pilihan Ganda (A-D)
            </span>
          </div>
          <div className="lab-diagnostic-title" style={{ fontWeight: 800, fontSize: '0.96rem', lineHeight: 1.3 }}>
            Tes Diagnostik Awal: {labTitle}
          </div>
          <div className="lab-diagnostic-desc" style={{ fontSize: '0.76rem', color: '#dbeafe', marginTop: '2px', lineHeight: 1.3 }}>
            {desc}
          </div>
        </div>
      </div>

      <button
        className="lab-diagnostic-btn"
        onClick={() => {
          sound.playClick();
          onOpenDiagnostic();
        }}
        style={{
          background: '#ffffff',
          color: '#1d4ed8',
          border: 'none',
          padding: '9px 18px',
          borderRadius: '8px',
          fontWeight: 800,
          fontSize: '0.82rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.15s'
        }}
      >
        <span>Mulai Tes (10 Soal)</span>
        <span>➔</span>
      </button>
    </div>
  );
};

export default LabDiagnosticBanner;

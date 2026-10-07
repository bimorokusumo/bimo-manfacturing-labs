import React from 'react';
import { sound } from '../utils/audio';

const LabDiagnosticBanner = ({ 
  labTitle = 'Laboratorium', 
  onOpenDiagnostic 
}) => {
  if (!onOpenDiagnostic) return null;

  return (
    <div 
      className="lab-diagnostic-banner"
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        borderRadius: '10px',
        padding: '10px 18px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <span style={{
          background: '#f59e0b',
          color: '#000000',
          fontWeight: 800,
          fontSize: '0.65rem',
          padding: '2px 7px',
          borderRadius: '5px',
          letterSpacing: '0.4px',
          whiteSpace: 'nowrap'
        }}>
          📋 DIAGNOSTIK
        </span>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Tes Diagnostik: {labTitle}
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
          padding: '6px 14px',
          borderRadius: '7px',
          fontWeight: 800,
          fontSize: '0.78rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
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

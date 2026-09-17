import React, { useState } from 'react';
import TechnicalDrawingGuide from './TechnicalDrawingGuide';
import TechnicalDrawingQuiz from './TechnicalDrawingQuiz';
import OrthogonalMultiViewSimulator from './OrthogonalMultiViewSimulator';
import CADStudioSimulator from './CADStudioSimulator';
import { sound } from '../utils/audio';

const DesignLab = () => {
  const [labTab, setLabTab] = useState('cad'); // Default to CAD studio for direct access

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%', boxSizing: 'border-box' }}>
      
      {/* HEADER UTAMA DESIGN LAB */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
        flexWrap: 'wrap',
        gap: '12px',
        zIndex: 20,
        borderRadius: '14px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #1e40af)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: '#fff', fontSize: '1.3rem',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.35)'
          }}>
            📐
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              LAB DESAIN & GAMBAR TEKNIK MESIN
              <span style={{ fontSize: '0.65rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                ISO CERTIFIED
              </span>
            </h2>
            <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0 }}>
              Simulator CAD Parametrik 2D/3D • Proyeksi Ortogonal • Standarisasi ISO 128 / 129 / 5456
            </p>
          </div>
        </div>

        {/* 4 Main Mode Switchers */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
          <button
            onClick={() => { sound.playClick(); setLabTab('cad'); }}
            style={{
              padding: '7px 16px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: labTab === 'cad' ? '#0284c7' : 'transparent',
              color: labTab === 'cad' ? '#ffffff' : '#334155',
              boxShadow: labTab === 'cad' ? '0 2px 8px rgba(2, 132, 199, 0.3)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <span>🛠️</span> CAD Studio (Fitur 3D)
          </button>

          <button
            onClick={() => { sound.playClick(); setLabTab('ortogonal'); }}
            style={{
              padding: '7px 16px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: labTab === 'ortogonal' ? '#6366f1' : 'transparent',
              color: labTab === 'ortogonal' ? '#ffffff' : '#334155',
              boxShadow: labTab === 'ortogonal' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <span>🧭</span> Simulator Ortogonal (3D)
          </button>

          <button
            onClick={() => { sound.playClick(); setLabTab('materi'); }}
            style={{
              padding: '7px 16px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: labTab === 'materi' ? '#2563eb' : 'transparent',
              color: labTab === 'materi' ? '#ffffff' : '#334155',
              boxShadow: labTab === 'materi' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <span>📚</span> Modul & Standarisasi ISO
          </button>

          <button
            onClick={() => { sound.playClick(); setLabTab('quiz'); }}
            style={{
              padding: '7px 16px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: labTab === 'quiz' ? '#10b981' : 'transparent',
              color: labTab === 'quiz' ? '#ffffff' : '#334155',
              boxShadow: labTab === 'quiz' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <span>🎯</span> Kuis Asesmen (1000 XP)
          </button>
        </div>
      </div>

      {/* VIEW: 1. CAD FEATURE STUDIO (EXTRUDE, REVOLVE, SWEEP, LOFT & MODIFIERS) */}
      {labTab === 'cad' && (
        <div className="animate-fade-in" style={{ padding: '0', flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
          <CADStudioSimulator />
        </div>
      )}

      {/* VIEW: 2. SIMULATOR PANDANGAN ORTOGONAL 3D */}
      {labTab === 'ortogonal' && (
        <div className="animate-fade-in" style={{ padding: '0', flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
          <OrthogonalMultiViewSimulator />
        </div>
      )}

      {/* VIEW: 3. MATERI & STANDARISASI GAMBAR */}
      {labTab === 'materi' && (
        <div className="animate-fade-in" style={{ padding: '0', flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
          <TechnicalDrawingGuide />
        </div>
      )}

      {/* VIEW: 4. KUIS & ASESMEN */}
      {labTab === 'quiz' && (
        <div className="animate-fade-in" style={{ padding: '0', flex: 1, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
          <TechnicalDrawingQuiz />
        </div>
      )}

    </div>
  );
};

export default DesignLab;

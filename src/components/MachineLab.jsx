import React, { useState } from 'react';
import LatheModule from './LatheModule';
import MillingModule from './MillingModule';
import CNCModule from './CNCModule';
import CNCLatheModule from './CNCLatheModule';
import MachinePreTest from './MachinePreTest';
import CNCTheoryGuide from './CNCTheoryGuide';
import CNCQuiz from './CNCQuiz';
import LabDiagnosticBanner from './LabDiagnosticBanner';
import { sound } from '../utils/audio';

const MachineLab = ({ addXP, onOpenDiagnostic }) => {
  const [selectedMachine, setSelectedMachine] = useState(null); // 'lathe', 'milling', 'cnc'
  const [pendingMachine, setPendingMachine] = useState(null);
  const [cncMode, setCncMode] = useState('materi'); // 'materi', 'simulasi', 'quiz'

  // If a machine is selected, render it
  if (selectedMachine === 'lathe') {
    return (
      <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <button 
          onClick={() => { sound.playClick(); setSelectedMachine(null); }}
          style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Kembali ke Garasi Mesin
        </button>
        <div style={{ flex: 1 }}>
          <LatheModule addXP={addXP} />
        </div>
      </div>
    );
  }

  if (selectedMachine === 'milling') {
    return (
      <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <button 
          onClick={() => { sound.playClick(); setSelectedMachine(null); }}
          style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Kembali ke Garasi Mesin
        </button>
        <div style={{ flex: 1 }}>
          <MillingModule addXP={addXP} />
        </div>
      </div>
    );
  }

  if (selectedMachine === 'cnc-lathe') {
    return (
      <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <button 
            onClick={() => { sound.playClick(); setSelectedMachine('cnc'); }}
            style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ← Kembali ke Pilihan CNC
          </button>
          <button 
            onClick={() => { sound.playClick(); setSelectedMachine('cnc'); setCncMode('materi'); }}
            style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1px solid #0284c7', color: '#0284c7', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📖 Buka Materi & Kamus G-Code
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <CNCLatheModule addXP={addXP} />
        </div>
      </div>
    );
  }

  if (selectedMachine === 'cnc-milling') {
    return (
      <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <button 
            onClick={() => { sound.playClick(); setSelectedMachine('cnc'); }}
            style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ← Kembali ke Pilihan CNC
          </button>
          <button 
            onClick={() => { sound.playClick(); setSelectedMachine('cnc'); setCncMode('materi'); }}
            style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1px solid #0284c7', color: '#0284c7', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📖 Buka Materi & Kamus G-Code
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <CNCModule addXP={addXP} />
        </div>
      </div>
    );
  }

  if (selectedMachine === 'cnc') {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
        
        {/* TOP BAR: BACK BUTTON & MODE SELECTOR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--bg-card)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid var(--border-light)'
        }}>
          <button 
            onClick={() => { sound.playClick(); setSelectedMachine(null); }}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border-light)', 
              color: 'var(--text-main)', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            ← Kembali ke Garasi Mesin
          </button>

          {/* CNC Sub-Tabs: Materi, Simulasi, Kuis */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { sound.playClick(); setCncMode('materi'); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: cncMode === 'materi' ? '2px solid #0284c7' : '1px solid var(--border-light)',
                background: cncMode === 'materi' ? '#0284c7' : 'transparent',
                color: cncMode === 'materi' ? '#ffffff' : 'var(--text-main)',
                fontWeight: cncMode === 'materi' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <span>📖</span> 1. Materi & Teori CNC
            </button>

            <button
              onClick={() => { sound.playClick(); setCncMode('simulasi'); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: cncMode === 'simulasi' ? '2px solid #10b981' : '1px solid var(--border-light)',
                background: cncMode === 'simulasi' ? '#10b981' : 'transparent',
                color: cncMode === 'simulasi' ? '#ffffff' : 'var(--text-main)',
                fontWeight: cncMode === 'simulasi' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <span>⚙️</span> 2. Simulator Praktik CNC
            </button>

            <button
              onClick={() => { sound.playClick(); setCncMode('quiz'); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: cncMode === 'quiz' ? '2px solid #f59e0b' : '1px solid var(--border-light)',
                background: cncMode === 'quiz' ? '#f59e0b' : 'transparent',
                color: cncMode === 'quiz' ? '#ffffff' : 'var(--text-main)',
                fontWeight: cncMode === 'quiz' ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <span>🎯</span> 3. Kuis Asesmen (1000 XP)
            </button>
          </div>
        </div>

        {/* VIEW 1: MATERI & TEORI CNC */}
        {cncMode === 'materi' && (
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
            <CNCTheoryGuide />
          </div>
        )}

        {/* VIEW 2: SIMULATOR PRAKTIK CNC (PILIHAN MESIN CNC MILLING & LATHE) */}
        {cncMode === 'simulasi' && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                PILIH SPESIFIKASI MESIN CNC
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>
                Pilih mesin bubut CNC 2-Axis atau mesin frais CNC 3-Axis untuk melakukan simulasi pemotongan G-Code 3D
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '850px', margin: '0 auto' }}>
              <div 
                onClick={() => { sound.playClick(); setPendingMachine('cnc-lathe'); }}
                className="game-card game-card-hover" 
                style={{ cursor: 'pointer', border: '1px solid rgba(59, 130, 246, 0.3)' }}
              >
                <div style={{ height: '180px', background: 'var(--bg-card-light)', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  <img src="/assets/images/lathe.png" alt="CNC Lathe" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ color: '#60a5fa', fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>CNC Lathe (Bubut)</h3>
                  <button className="btn-game" style={{ width: '100%', background: '#3b82f6', color: '#ffffff', border: 'none' }}>SIMULASI BUBUT CNC</button>
                </div>
              </div>

              <div 
                onClick={() => { sound.playClick(); setPendingMachine('cnc-milling'); }}
                className="game-card game-card-hover" 
                style={{ cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <div style={{ height: '180px', background: 'var(--bg-card-light)', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  <img src="/assets/images/cnc.png" alt="CNC Milling" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ color: 'var(--game-success)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase' }}>CNC Milling (Frais)</h3>
                  <button className="btn-game btn-game-success" style={{ width: '100%' }}>SIMULASI FRAIS CNC</button>
                </div>
              </div>
            </div>

            {pendingMachine && (
              <MachinePreTest 
                machineType={pendingMachine} 
                onPass={(score) => {
                  sound.playClick();
                  if (addXP && score > 0) addXP(score);
                  setSelectedMachine(pendingMachine);
                  setPendingMachine(null);
                }}
                onCancel={() => {
                  sound.playClick();
                  setPendingMachine(null);
                }}
              />
            )}
          </div>
        )}

        {/* VIEW 3: KUIS ASESMEN KOMPETENSI CNC */}
        {cncMode === 'quiz' && (
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
            <CNCQuiz addXP={addXP} />
          </div>
        )}

      </div>
    );
  }

  // Otherwise, show the Garage Menu
  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <LabDiagnosticBanner
        labTitle="Machine Lab (Bubut, Frais & CNC)"
        desc="Diagnosa 10 soal pemahaman parameter sayat RPM, pencekaman chuck/ragum, dan keselamatan mesin sebelum praktik."
        onOpenDiagnostic={onOpenDiagnostic}
      />
      
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
          GARASI MACHINE LAB
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Pilih mesin untuk memulai simulasi 3D dan asesmen kompetensi
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* LATHE */}
        <div 
          onClick={() => { sound.playClick(); setSelectedMachine('lathe'); }}
          className="game-card game-card-hover" 
          style={{ cursor: 'pointer', border: '1px solid rgba(59, 130, 246, 0.3)' }}
        >
          <div style={{ height: '170px', background: 'var(--bg-card-light)', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <img src="/assets/images/lathe.png" alt="Mesin Bubut" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--game-tp)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase' }}>Mesin Bubut (Lathe)</h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>📐 Rumus RPM</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>📝 Test Bubut</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>⚙️ Simulator 3D</span>
            </div>
            <button className="btn-game btn-game-tp" style={{ width: '100%' }}>MASUK MESIN BUBUT</button>
          </div>
        </div>

        {/* MILLING */}
        <div 
          onClick={() => { sound.playClick(); setSelectedMachine('milling'); }}
          className="game-card game-card-hover" 
          style={{ cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.3)' }}
        >
          <div style={{ height: '170px', background: 'var(--bg-card-light)', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <img src="/assets/images/milling.png" alt="Mesin Frais" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', filter: 'brightness(1.1) contrast(1.1)' }} />
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--game-tflm)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase' }}>Mesin Frais (Milling)</h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>🪵 Test Frais</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>⚙️ Simulator 3D</span>
            </div>
            <button className="btn-game btn-game-tflm" style={{ width: '100%' }}>OPERASIKAN MESIN</button>
          </div>
        </div>

        {/* CNC */}
        <div 
          onClick={() => { sound.playClick(); setSelectedMachine('cnc'); setCncMode('materi'); }}
          className="game-card game-card-hover" 
          style={{ cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.3)' }}
        >
          <div style={{ height: '170px', background: 'var(--bg-card-light)', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <img src="/assets/images/cnc.png" alt="Mesin CNC" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
          </div>
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--game-success)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase' }}>Mesin CNC</h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>📖 G-Code</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>⚙️ Simulator 3D</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>🎯 Kuis CNC</span>
            </div>
            <button className="btn-game btn-game-success" style={{ width: '100%' }}>PELAJARI & OPERASIKAN</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MachineLab;

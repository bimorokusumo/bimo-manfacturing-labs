import React, { useState, Suspense, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import Lathe3D from './Lathe3D';
import PreparationModal from './PreparationModal';
import LatheFormulaCalculatorModal from './LatheFormulaCalculatorModal';

const CNCLatheModule = ({ addXP }) => {
  const [isPrepared, setIsPrepared] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState('4');
  
  const [isMachining, setIsMachining] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // G-Code State
  const defaultGcode = "G21 G90 G54\nM03 S1200\nG00 X0.6 Z0\nG01 X0.4 Z0 F0.2\nG01 X0.4 Z-2.0 F0.2\nG00 X0.6 Z-2.0\nG00 X0.6 Z0\nM05\nM30";
  const [gcodeText, setGcodeText] = useState(defaultGcode);
  const [currentLine, setCurrentLine] = useState(-1);
  const targetPosRef = useRef(null);
  
  // Profile points for Lathe (30 segments) - use Refs to prevent React re-rendering R3F/SVG 60fps
  const initialProfile = Array(30).fill(0.5);
  const profileRef = useRef([...initialProfile]);
  const [profileForRender, setProfileForRender] = useState([...initialProfile]);
  
  // Tool Position Refs
  const toolPosRef = useRef({ x: 0.6, z: 0 });
  const [toolPosForRender, setToolPosForRender] = useState({ x: 0.6, z: 0 });

  // Handle Tool Move and Cutting Logic
  const applyToolMove = (newX, newZ) => {
    toolPosRef.current = { x: newX, z: newZ };
    
    // Calculate cutting
    const toolTipX = 0.8 + newZ; // Wait, original code: toolTipX = 0.8 + newZ
    const progress = (0.5 - toolTipX) / 3.0;
    const index = Math.floor(progress * 30);
    
    if (index >= 0 && index < 30) {
      const cutRadius = Math.max(0.05, newX);
      if (cutRadius < profileRef.current[index]) {
        profileRef.current[index] = cutRadius;
        if (index > 0 && cutRadius < profileRef.current[index - 1]) profileRef.current[index - 1] = cutRadius;
        if (index < 29 && cutRadius < profileRef.current[index + 1]) profileRef.current[index + 1] = cutRadius;
      }
    }
  };

  const handleStart = () => {
    sound.playClick();
    setIsMachining(true);
    setShowResult(false);
    setCurrentLine(0);
    targetPosRef.current = null;
    
    // Start syncing ref to state occasionally so UI updates, but maybe we just sync it fully at the end?
    // Lathe3D is an SVG. SVGs can actually handle state updates fine! But let's just pass the state to it.
    // Since Lathe3D uses props, we'll sync it every 3 frames.
  };

  // G-Code Execution Engine
  useEffect(() => {
    let animFrame;
    let frameCount = 0;
    
    if (isMachining && currentLine >= 0) {
      const lines = gcodeText.split('\n');
      
      if (currentLine >= lines.length) {
        setIsMachining(false);
        setShowResult(true);
        setScore(100); 
        if (addXP) addXP(250);
        sound.playSuccess();
        setCurrentLine(-1);
        setProfileForRender([...profileRef.current]);
        setToolPosForRender({...toolPosRef.current});
        return;
      }
      
      const line = lines[currentLine].trim().toUpperCase();
      if (!line || line.startsWith('(') || line.startsWith('O') || line.includes('M03') || line.includes('M05') || line.includes('M30') || line.includes('G21') || line.includes('G90') || line.includes('G54')) {
        setTimeout(() => setCurrentLine(prev => prev + 1), 200);
        return;
      }
      
      if (!targetPosRef.current) {
        let xMatch = line.match(/X([-\d.]+)/);
        let zMatch = line.match(/Z([-\d.]+)/);
        
        targetPosRef.current = {
          x: xMatch ? parseFloat(xMatch[1]) : toolPosRef.current.x,
          z: zMatch ? parseFloat(zMatch[1]) : toolPosRef.current.z,
          isRapid: line.includes('G00')
        };
      }
      
      const move = () => {
        const target = targetPosRef.current;
        if (!target) return;
        
        const current = toolPosRef.current;
        const dx = target.x - current.x;
        const dz = target.z - current.z;
        const dist = Math.sqrt(dx*dx + dz*dz);
        
        if (dist < 0.01) {
          applyToolMove(target.x, target.z);
          targetPosRef.current = null;
          setCurrentLine(curr => curr + 1);
        } else {
          const speed = target.isRapid ? 0.05 : 0.01;
          const stepX = (dx / dist) * speed;
          const stepZ = (dz / dist) * speed;
          applyToolMove(current.x + stepX, current.z + stepZ);
          
          frameCount++;
          if (frameCount % 3 === 0) {
            setProfileForRender([...profileRef.current]);
            setToolPosForRender({...toolPosRef.current});
          }
          
          animFrame = requestAnimationFrame(move);
        }
      };
      
      animFrame = requestAnimationFrame(move);
    }
    
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isMachining, currentLine, gcodeText, addXP]);

  const handleReset = () => {
    sound.playClick();
    setIsMachining(false);
    setShowResult(false);
    profileRef.current = [...initialProfile];
    toolPosRef.current = { x: 0.6, z: 0 };
    setProfileForRender([...initialProfile]);
    setToolPosForRender({ x: 0.6, z: 0 });
    setScore(0);
    setCurrentLine(-1);
    targetPosRef.current = null;
  };

  const sidebarMenus = [
    { id: '1', title: '1. SETUP', desc: 'Work Offset G54' },
    { id: '2', title: '2. TOOLING', desc: 'T1 - Insert Rata Kanan' },
    { id: '3', title: '3. COOLANT', desc: 'M08 (Flood)' },
    { id: '4', title: '4. PROGRAM', desc: 'O1002' },
    { id: '5', title: '5. PROSES', desc: '' },
    { id: '6', title: '6. HASIL', desc: '' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {!isPrepared && <PreparationModal machineName="MESIN CNC BUBUT" onComplete={() => setIsPrepared(true)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
          VIRTUAL CNC LATHE SIMULATION
        </h2>
        <button
          onClick={() => { sound.playClick(); setShowCalculator(true); }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: '1px solid #38bdf8',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🧮</span>
          <span>RUMUS & KALKULATOR BUBUT (S & F)</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: '600px' }}>
        
        {/* LEFT SIDEBAR: MENU */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sidebarMenus.map(menu => (
            <button
              key={menu.id}
              onClick={() => { sound.playClick(); setActiveTab(menu.id); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)',
                background: activeTab === menu.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)',
                color: activeTab === menu.id ? '#60a5fa' : 'var(--text-main)',
                borderLeft: activeTab === menu.id ? '4px solid #60a5fa' : '1px solid var(--border-light)',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: menu.desc ? '4px' : '0' }}>{menu.title}</div>
              {menu.desc && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{menu.desc}</div>}
            </button>
          ))}
        </div>

        {/* MIDDLE: 3D CANVAS & PARAMETERS */}
        <div style={{ flex: 1, position: 'relative', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* 3D CANVAS PORTION */}
          <div style={{ flex: '0 0 350px', width: '100%', background: '#000', position: 'relative', transition: 'all 0.3s' }}>
            <Suspense fallback={<div className="flex-center" style={{ height: '100%', color: '#60a5fa' }}>LOADING ENGINE...</div>}>
              <Lathe3D isRunning={isMachining} activeComponent={null} toolPosition={toolPosForRender} profile={profileForRender} machineMode="rata" rpm={1200} />
            </Suspense>
          </div>

          {/* G-CODE EDITOR PANEL */}
          <div className="animate-fade-in" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '20px', flex: 1, marginBottom: '20px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>G-Code Editor (CNC Bubut)</label>
                </div>
                <textarea 
                  value={gcodeText}
                  onChange={(e) => setGcodeText(e.target.value)}
                  disabled={isMachining}
                  className="cyber-font"
                  spellCheck="false"
                  style={{
                    flex: 1, width: '100%', background: 'var(--bg-game)', color: '#60a5fa', 
                    border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px',
                    fontSize: '0.9rem', lineHeight: '1.5', resize: 'none'
                  }}
                />
              </div>

              <div style={{ width: '200px', background: 'var(--bg-game)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px', overflowY: 'hidden' }}>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>LIVE EXECUTION</div>
                 <div className="cyber-font" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {gcodeText.split('\n').map((line, idx) => (
                      <div key={idx} style={{ 
                        fontSize: '0.8rem', 
                        color: idx === currentLine && isMachining ? '#000' : 'var(--text-subtle)',
                        background: idx === currentLine && isMachining ? '#60a5fa' : 'transparent',
                        padding: '2px 4px', borderRadius: '2px'
                      }}>
                        {line}
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
              <button className="btn-game" style={{ flex: 1, padding: '16px', fontSize: '1.2rem', background: '#3b82f6', color: 'var(--text-main)', border: 'none' }} onClick={handleStart} disabled={isMachining}>
                {isMachining ? 'RUNNING G-CODE...' : '▶ CYCLE START'}
              </button>
              <button className="btn-game btn-game-neutral" style={{ padding: '16px 32px' }} onClick={handleReset} disabled={isMachining}>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: HASIL SIMULASI */}
        <div style={{ width: '280px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center', letterSpacing: '1px' }}>HASIL SIMULASI</h3>
          
          <div style={{ height: '140px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            {showResult ? (
              <img src="https://images.unsplash.com/photo-1620803454743-305f884bf60c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Benda Kerja CNC" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>Menunggu Proses...</div>
            )}
          </div>

          {showResult && (
            <div className="animate-fade-in">
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '8px', borderRadius: '4px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #60a5fa' }}>
                ✓ G-CODE SUKSES
              </div>

              <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600, marginBottom: '4px' }}>Program Selesai!</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Simulasi bubut CNC berhasil menyelesaikan alur pemotongan.</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="flex-between">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status Spindle</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>M05 (Stop)</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>XP DIDAPATKAN</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>+250 XP</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FORMULA & CALCULATOR MODAL */}
      <LatheFormulaCalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        initialDiameter={50}
        initialLength={100}
        currentRpm={1200}
        materialName="Baja Lunak (St 37 / Mild Steel)"
        onApplyRpm={(newRpm) => {
          setGcodeText(prev => prev.replace(/S\d+/, `S${newRpm}`));
        }}
      />
    </div>
  );
};

export default CNCLatheModule;

import React, { useState, Suspense, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import CNC3D from './CNC3D';
import PreparationModal from './PreparationModal';

const CNCModule = ({ addXP }) => {
  const [isPrepared, setIsPrepared] = useState(false);
  const [activeTab, setActiveTab] = useState('4');
  const [workpieceSize, setWorkpieceSize] = useState({ x: 50, y: 50, z: 20 });
  const [toolDiameter, setToolDiameter] = useState(10);
  
  const [gcodeText, setGcodeText] = useState("O1001 (CNC Milling Part)\nG21 G90 G54\nM03 S2500\nG00 X-20 Y-20 Z10\nG01 Z-5 F150\nG01 X20 Y-20 F300\nG01 X20 Y20\nG01 X-20 Y20\nG01 X-20 Y-20\nG00 Z10\nM05\nM30");
  const [isMachining, setIsMachining] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [score, setScore] = useState(0);

  // CNC State via Refs for high-frequency updates (prevents R3F Canvas choking)
  const heightmapRef = useRef(new Float32Array(30 * 30).fill(0));
  
  const threeJsWidth = (workpieceSize.x / 50) * 1.5;
  const threeJsDepth = (workpieceSize.y / 50) * 1.5;
  const toolRadiusThreeJS = (toolDiameter / 2) * (1.5 / 50);

  // Starting position in World Coordinates
  const toolPosRef = useRef({ x: 0, y: 0.6, z: 0 });
  const targetPosRef = useRef(null);

  const applyToolMove = (newX, newY, newZ) => {
    toolPosRef.current.x = newX;
    toolPosRef.current.y = newY;
    toolPosRef.current.z = newZ;
    
    // Cutting Logic (if Y is below 0.3)
    if (newY < 0.3) {
      const localDepth = newY - 0.3; // Negative value
      
      const next = heightmapRef.current;
      for (let i = 0; i < 30; i++) { // x index
        for (let j = 0; j < 30; j++) { // z index
          const gridX = -(threeJsWidth / 2) + (i / 29) * threeJsWidth;
          const gridZ = -(threeJsDepth / 2) + (j / 29) * threeJsDepth; 
          
          const dist = Math.sqrt((newX - gridX)**2 + (newZ - gridZ)**2);
          if (dist < toolRadiusThreeJS) {
            const idx = j * 30 + i;
            if (localDepth < next[idx]) {
              next[idx] = localDepth;
            }
          }
        }
      }
    }
  };

  const handleStart = () => {
    sound.playClick();
    setIsMachining(true);
    setShowResult(false);
    setCurrentLine(0);
    targetPosRef.current = null;
  };

  const handleReset = () => {
    sound.playClick();
    setIsMachining(false);
    setShowResult(false);
    setCurrentLine(-1);
    heightmapRef.current.fill(0);
    toolPosRef.current = { x: 0, y: 0.6, z: 0 };
    targetPosRef.current = null;
    setScore(0);
  };

  useEffect(() => {
    let animFrame;
    if (isMachining && currentLine >= 0) {
      const lines = gcodeText.split('\n');
      
      if (currentLine >= lines.length) {
        setIsMachining(false);
        setShowResult(true);
        setScore(100);
        if (addXP) addXP(250);
        sound.playSuccess();
        setCurrentLine(-1);
        return;
      }
      
      const line = lines[currentLine].trim().toUpperCase();
      if (!line || line.startsWith('(') || line.startsWith('O') || line.includes('M03') || line.includes('M05') || line.includes('M30') || line.includes('G21') || line.includes('G90') || line.includes('G54')) {
        setTimeout(() => setCurrentLine(prev => prev + 1), 200);
        return;
      }
      
      if (!targetPosRef.current) {
        let xMatch = line.match(/X([-\d.]+)/);
        let yMatch = line.match(/Y([-\d.]+)/);
        let zMatch = line.match(/Z([-\d.]+)/);
        
        const currentWorld = toolPosRef.current;
        const currentCncX = (currentWorld.x / threeJsWidth) * workpieceSize.x;
        const currentCncY = (-currentWorld.z / threeJsDepth) * workpieceSize.y;
        const currentCncZ = (currentWorld.y - 0.3) / 0.03;

        const targetCncX = xMatch ? parseFloat(xMatch[1]) : currentCncX;
        const targetCncY = yMatch ? parseFloat(yMatch[1]) : currentCncY;
        const targetCncZ = zMatch ? parseFloat(zMatch[1]) : currentCncZ;
        
        targetPosRef.current = {
          x: (targetCncX / workpieceSize.x) * threeJsWidth,
          y: 0.3 + (targetCncZ * 0.03),
          z: -(targetCncY / workpieceSize.y) * threeJsDepth,
          isRapid: line.includes('G00')
        };
      }
      
      const move = () => {
        const target = targetPosRef.current;
        if (!target) return;
        
        const current = toolPosRef.current;
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const dz = target.z - current.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        const speed = target.isRapid ? 0.05 : 0.01;
        
        if (dist <= speed) {
          applyToolMove(target.x, target.y, target.z);
          targetPosRef.current = null;
          setCurrentLine(curr => curr + 1);
        } else {
          const stepX = (dx / dist) * speed;
          const stepY = (dy / dist) * speed;
          const stepZ = (dz / dist) * speed;
          applyToolMove(current.x + stepX, current.y + stepY, current.z + stepZ);
          animFrame = requestAnimationFrame(move);
        }
      };
      
      animFrame = requestAnimationFrame(move);
    }
    
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isMachining, currentLine, gcodeText, addXP, workpieceSize, threeJsWidth, threeJsDepth, toolRadiusThreeJS]);

  const sidebarMenus = [
    { id: '1', title: '1. SETUP', desc: `Dimensi: ${workpieceSize.x}x${workpieceSize.y}x${workpieceSize.z}` },
    { id: '2', title: '2. TOOLING', desc: `T1 - Endmill Ø${toolDiameter}` },
    { id: '3', title: '3. COOLANT', desc: 'M08 (Flood)' },
    { id: '4', title: '4. PROGRAM', desc: 'O1001' },
    { id: '5', title: '5. PROSES', desc: '' },
    { id: '6', title: '6. HASIL', desc: '' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {!isPrepared && <PreparationModal machineName="MESIN CNC" onComplete={() => setIsPrepared(true)} />}
      
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>VIRTUAL CNC SIMULATION</h2>

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
                background: activeTab === menu.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
                color: activeTab === menu.id ? 'var(--game-success)' : 'var(--text-main)',
                borderLeft: activeTab === menu.id ? '4px solid var(--game-success)' : '1px solid var(--border-light)',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: menu.desc ? '4px' : '0' }}>{menu.title}</div>
              {menu.desc && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{menu.desc}</div>}
            </button>
          ))}
        </div>

        {/* MIDDLE: 3D CANVAS & PARAMETERS */}
        <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* 3D CANVAS PORTION */}
          <div style={{ height: '350px', background: '#000', position: 'relative' }}>
            <Suspense fallback={<div className="flex-center" style={{ height: '100%', color: 'var(--game-success)' }}>LOADING 3D ENGINE...</div>}>
              <CNC3D isRunning={isMachining} toolPosRef={toolPosRef} heightmapRef={heightmapRef} workpieceSize={workpieceSize} toolDiameter={toolDiameter} />
            </Suspense>
          </div>

          {/* PARAMETER CONTROLS - GCODE EDITOR */}
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', gap: '20px', flex: 1, marginBottom: '20px' }}>
              {activeTab === '1' && (
                <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', color: 'var(--text-main)', background: 'var(--bg-game)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ marginBottom: '16px', color: 'var(--game-success)' }}>WORKPIECE SETUP</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Panjang X (mm)</label>
                      <input type="number" value={workpieceSize.x} onChange={e => setWorkpieceSize({...workpieceSize, x: Number(e.target.value)})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} disabled={isMachining} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Lebar Y (mm)</label>
                      <input type="number" value={workpieceSize.y} onChange={e => setWorkpieceSize({...workpieceSize, y: Number(e.target.value)})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} disabled={isMachining} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Tebal Z (mm)</label>
                      <input type="number" value={workpieceSize.z} onChange={e => setWorkpieceSize({...workpieceSize, z: Number(e.target.value)})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} disabled={isMachining} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === '2' && (
                <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', color: 'var(--text-main)', background: 'var(--bg-game)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ marginBottom: '16px', color: 'var(--game-success)' }}>TOOLING SETUP</h4>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Diameter Endmill (mm)</label>
                    <input type="number" value={toolDiameter} onChange={e => setToolDiameter(Number(e.target.value))} style={{ width: '50%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} disabled={isMachining} />
                  </div>
                </div>
              )}

              {activeTab !== '1' && activeTab !== '2' && (
                <>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>G-Code Editor (CNC Milling)</label>
                    </div>
                    <textarea 
                      value={gcodeText}
                      onChange={(e) => setGcodeText(e.target.value)}
                      disabled={isMachining}
                      className="cyber-font"
                      spellCheck="false"
                      style={{
                        flex: 1, width: '100%', background: 'var(--bg-game)', color: 'var(--game-success)', 
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
                            background: idx === currentLine && isMachining ? 'var(--game-success)' : 'transparent',
                            padding: '2px 4px', borderRadius: '2px'
                          }}>
                            {line}
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
              <button className="btn-game btn-game-success" style={{ flex: 1, padding: '16px', fontSize: '1.2rem' }} onClick={handleStart} disabled={isMachining}>
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
              <img src="https://images.unsplash.com/photo-1558296720-e792dbf9e984?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="CNC Part" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>Menunggu Proses...</div>
            )}
          </div>

          {showResult && (
            <div className="animate-fade-in">
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--game-success)', padding: '8px', borderRadius: '4px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', marginBottom: '16px', border: '1px solid var(--game-success)' }}>
                ✓ G-CODE SUKSES
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--game-success)', fontWeight: 600, marginBottom: '4px' }}>Program Selesai!</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Simulasi potong material berhasil.</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="flex-between">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status Spindle</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>M05 (Stop)</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>XP DIDAPATKAN</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--game-success)' }}>+250 XP</div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CNCModule;

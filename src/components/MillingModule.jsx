import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sound } from '../utils/audio';
import Milling3D from './Milling3D';
import PreparationModal from './PreparationModal';
import { millingJobsheets } from '../data/millingJobsheets';

const MillingModule = ({ addXP }) => {
  const [isPrepared, setIsPrepared] = useState(false);
  const [activeJobsheetIndex, setActiveJobsheetIndex] = useState(0);
  const activeJobsheet = millingJobsheets[activeJobsheetIndex] || millingJobsheets[0];

  // Workpiece & Tool Dimensions
  const [workpieceSize, setWorkpieceSize] = useState(activeJobsheet.dimensions || { w: 100, l: 50, t: 30 });
  const [toolDiameter, setToolDiameter] = useState(activeJobsheet.toolDiameter || 10);

  // Machine Parameters
  const [rpm, setRpm] = useState(activeJobsheet.targetRpmRange ? activeJobsheet.targetRpmRange[0] : 1500);
  const [feedRate, setFeedRate] = useState(150);
  const [stepSize, setStepSize] = useState(0.5); // Default 0.50mm for solid tangible cuts
  const [rapidMode, setRapidMode] = useState(false);
  const [coolant, setCoolant] = useState(false);

  // Machine Running State - Default Spindle ON for instant readiness
  const [isSpindleRunning, setIsSpindleRunning] = useState(true);
  const isSpindleRef = useRef(true);
  const [isCutting, setIsCutting] = useState(false);

  // Table & Spindle Position in Millimeters (mm)
  // Table: X moves left/right (-60mm to +60mm), Y moves back/forward (-30mm to +30mm)
  // Spindle: Z = 0 is touch-off on workpiece surface.
  // Default position: X = -35mm, Y = 0mm (ready at left edge), Z = -1.0mm (ready to cut 1.0mm deep)
  const [tablePosition, setTablePosition] = useState({ x: -35, y: 0 });
  const [spindlePosition, setSpindlePosition] = useState({ z: -1.0 });
  const tablePosRef = useRef({ x: -35, y: 0 });
  const spindlePosRef = useRef({ z: -1.0 });

  // Evaluation & Results
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [inspectionData, setInspectionData] = useState(null);

  // Heightmap State for Milling (60x30 segments = 61x31 vertices = 1891 vertices for high quality smooth cut)
  // heightmap stores depth in mm directly (0 = uncut raw surface, -1.0 = cut 1mm deep, etc.)
  const gridX = 60;
  const gridY = 30;
  const numVertices = (gridX + 1) * (gridY + 1);
  const initialHeightmap = useMemo(() => Array(numVertices).fill(0), [numVertices]);
  const [heightmap, setHeightmap] = useState(initialHeightmap);
  const heightmapRef = useRef(new Array(numVertices).fill(0));

  // Audio Engine Hook
  useEffect(() => {
    if (isSpindleRunning) {
      sound.startMotorSound(rpm);
    } else {
      sound.stopMotorSound();
      sound.stopCuttingSound();
      setIsCutting(false);
    }

    return () => {
      sound.stopMotorSound();
      sound.stopCuttingSound();
    };
  }, [isSpindleRunning, rpm]);

  // Sync state on Jobsheet change
  useEffect(() => {
    if (activeJobsheet) {
      setWorkpieceSize(activeJobsheet.dimensions);
      setToolDiameter(activeJobsheet.toolDiameter);
      if (activeJobsheet.targetRpmRange) {
        setRpm(activeJobsheet.targetRpmRange[0]);
      }
      handleReset();
    }
  }, [activeJobsheetIndex]);

  // Real-time Precision Synchronous Cutting Logic
  // Z <= 0 means endmill touches or penetrates workpiece top surface
  const updateCutting = (newTable, newSpindle) => {
    const cutDepthMm = newSpindle.z; // negative = depth of cut in mm
    const spindleActive = isSpindleRef.current;

    if (cutDepthMm < -0.01 && spindleActive) {
      const toolRadiusMm = toolDiameter / 2;
      let vertexCut = false;
      const currentMap = heightmapRef.current;
      const newMap = [...currentMap];
      const w = workpieceSize.w; // mm
      const l = workpieceSize.l; // mm

      for (let iy = 0; iy <= gridY; iy++) {
        // vy relative to center of workpiece (-l/2 to +l/2)
        const vy = (iy / gridY) * l - l / 2;

        for (let ix = 0; ix <= gridX; ix++) {
          const i = iy * (gridX + 1) + ix;
          // vx relative to center of workpiece (-w/2 to +w/2)
          const vx = (ix / gridX) * w - w / 2;

          // World coordinates of vertex relative to stationary cutter at (0, 0)
          const worldX = vx + newTable.x;
          const worldY = vy + newTable.y;

          // Physical distance from endmill center
          const dist = Math.hypot(worldX, worldY);

          // Cut occurs strictly inside physical endmill cutter radius
          if (dist <= toolRadiusMm) {
            if (cutDepthMm < newMap[i]) {
              newMap[i] = cutDepthMm;
              vertexCut = true;
            }
          }
        }
      }

      if (vertexCut) {
        heightmapRef.current = newMap;
        setHeightmap(newMap);
        setIsCutting(true);
        sound.startCuttingSound();
      } else {
        setIsCutting(false);
        sound.stopCuttingSound();
      }
    } else {
      setIsCutting(false);
      sound.stopCuttingSound();
    }
  };

  // Jog Table in X/Y (in Millimeters)
  const handleTableJog = (axis, dir) => {
    sound.playClick();
    const multiplier = rapidMode ? 3 : 1;
    const delta = (stepSize || 0.5) * multiplier * dir;

    const newPos = {
      ...tablePosRef.current,
      [axis]: Number((tablePosRef.current[axis] + delta).toFixed(2))
    };

    // Table limit bounds (mm)
    newPos.x = Math.max(-60, Math.min(60, newPos.x));
    newPos.y = Math.max(-30, Math.min(30, newPos.y));

    tablePosRef.current = newPos;
    setTablePosition(newPos);
    updateCutting(newPos, spindlePosRef.current);
  };

  // Jog Spindle Quill in Z (in Millimeters)
  // dir > 0: Spindle descends (quill down into work, Z decreases)
  // dir < 0: Spindle ascends (quill up clear of work, Z increases)
  const handleSpindleJog = dir => {
    sound.playClick();
    const multiplier = rapidMode ? 2.5 : 1;
    const delta = (stepSize || 0.5) * multiplier * -dir;

    const rawZ = spindlePosRef.current.z + delta;
    // Bounds: from -10mm (max cut depth) to +25mm (safe travel height)
    const newZ = Number(Math.max(-10.0, Math.min(25.0, rawZ)).toFixed(2));

    spindlePosRef.current = { z: newZ };
    setSpindlePosition({ z: newZ });
    updateCutting(tablePosRef.current, { z: newZ });
  };

  // Quick Preset Depth Setter
  const setSpindleDepthPreset = targetZ => {
    sound.playClick();
    spindlePosRef.current = { z: targetZ };
    setSpindlePosition({ z: targetZ });
    updateCutting(tablePosRef.current, { z: targetZ });
  };

  // Continuous Press & Hold Support
  const holdIntervalRef = useRef(null);
  const startHoldTableJog = (axis, dir) => {
    handleTableJog(axis, dir);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      handleTableJog(axis, dir);
    }, 45);
  };

  const startHoldSpindleJog = (dir) => {
    handleSpindleJog(dir);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      handleSpindleJog(dir);
    }, 45);
  };

  const stopHoldJog = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  // Keyboard Shortcuts for Milling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleTableJog('x', -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleTableJog('x', 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleTableJog('y', 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleTableJog('y', -1);
      } else if (e.key === 'PageDown' || (e.shiftKey && e.key === 'ArrowDown') || e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSpindleJog(1); // Z- turun sayat
      } else if (e.key === 'PageUp' || (e.shiftKey && e.key === 'ArrowUp') || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleSpindleJog(-1); // Z+ naik
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleSpindle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rapidMode, stepSize, workpieceSize, toolDiameter, isSpindleRunning]);

  // Spindle Toggle
  const toggleSpindle = () => {
    sound.playClick();
    const next = !isSpindleRunning;
    setIsSpindleRunning(next);
    isSpindleRef.current = next;
    if (!next) {
      setIsCutting(false);
      sound.stopCuttingSound();
    } else {
      updateCutting(tablePosRef.current, spindlePosRef.current);
    }
  };

  // Reset
  const handleReset = () => {
    sound.playClick();
    setIsSpindleRunning(true);
    isSpindleRef.current = true;
    setIsCutting(false);
    setShowResult(false);
    setTablePosition({ x: -35, y: 0 });
    setSpindlePosition({ z: -1.0 });
    tablePosRef.current = { x: -35, y: 0 };
    spindlePosRef.current = { z: -1.0 };
    const clean = new Array(numVertices).fill(0);
    heightmapRef.current = clean;
    setHeightmap(clean);
    setScore(0);
    setInspectionData(null);
  };

  // Evaluate Machining
  const handleEvaluate = () => {
    sound.playClick();

    // Check RPM accuracy
    const isRpmCorrect =
      rpm >= activeJobsheet.targetRpmRange[0] && rpm <= activeJobsheet.targetRpmRange[1];

    // Check cut depth directly in mm
    let maxCutDepth = 0;
    let cutVertices = 0;
    for (let i = 0; i < numVertices; i++) {
      if (heightmapRef.current[i] < -0.001) {
        cutVertices++;
        const depthMm = Math.abs(heightmapRef.current[i]); // stored directly in mm
        if (depthMm > maxCutDepth) maxCutDepth = depthMm;
      }
    }

    const depthDiff = Math.abs(maxCutDepth - activeJobsheet.targetDepth);
    let calculatedScore = 0;

    if (isRpmCorrect && cutVertices >= 12) {
      if (depthDiff <= 0.3) {
        calculatedScore = 100;
      } else if (depthDiff <= 0.6) {
        calculatedScore = 85;
      } else {
        calculatedScore = 70;
      }
      sound.playSuccess();
      if (addXP) addXP(activeJobsheet.xpReward);
    } else if (isRpmCorrect && cutVertices > 0) {
      calculatedScore = 65;
    } else if (cutVertices > 0) {
      calculatedScore = 45;
    } else {
      calculatedScore = 15;
    }

    setInspectionData({
      targetDepth: activeJobsheet.targetDepth.toFixed(2),
      actualDepth: maxCutDepth.toFixed(2),
      rpmUsed: rpm,
      targetRpm: `${activeJobsheet.targetRpmRange[0]} - ${activeJobsheet.targetRpmRange[1]} RPM`,
      cutAreaPercent: Math.round((cutVertices / numVertices) * 100)
    });

    setScore(calculatedScore);
    setShowResult(true);
  };

  // DRO display in exact millimeters
  const droX = tablePosition.x.toFixed(2);
  const droY = tablePosition.y.toFixed(2);
  const droZ = spindlePosition.z.toFixed(2);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      {!isPrepared && <PreparationModal machineName="MESIN FRAIS" onComplete={() => setIsPrepared(true)} />}

      {/* HEADER BAR & JOBSHEET SELECTOR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--bg-card)',
          padding: '14px 20px',
          borderRadius: '12px',
          border: '1px solid var(--border-light)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '1.2rem'
            }}
          >
            🔩
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              SIMULATOR MESIN FRAIS UNIVERSAL / VERTIKAL
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Tugas Aktif: <strong style={{ color: '#f59e0b' }}>{activeJobsheet.title}</strong> ({activeJobsheet.material})
            </div>
          </div>
        </div>

        {/* JOBSHEET TABS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {millingJobsheets.map((sheet, idx) => (
            <button
              key={sheet.id}
              onClick={() => setActiveJobsheetIndex(idx)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeJobsheetIndex === idx ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                color: activeJobsheetIndex === idx ? '#000000' : 'var(--text-muted)',
                border: activeJobsheetIndex === idx ? '1px solid #f59e0b' : '1px solid var(--border-light)',
                transition: 'all 0.2s'
              }}
            >
              {idx + 1}. {sheet.title.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN 3D SIMULATOR VIEWPORT - 100% UNOBSTRUCTED */}
      <div
        style={{
          width: '100%',
          height: '480px',
          background: '#eef2f6',
          borderRadius: '16px',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.06)'
        }}
      >
        <Milling3D
          isRunning={isSpindleRunning}
          tablePosition={tablePosition}
          spindlePosition={spindlePosition}
          heightmap={heightmap}
          workpieceSize={workpieceSize}
          toolDiameter={toolDiameter}
          rpm={rpm}
          isCutting={isCutting}
          coolant={coolant}
          gridX={gridX}
          gridY={gridY}
        />
      </div>

      {/* KEYBOARD SHORTCUT HELPER BANNER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>⌨️ KONTROL TOMBOL KEYBOARD:</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>◀</kbd> Meja Kiri (X-)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>▶</kbd> Meja Kanan (X+)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>▼</kbd> Meja Maju (Y-)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>▲</kbd> Meja Mundur (Y+)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>S / PgDn</kbd> Spindel Turun Sayat (Z-)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>W / PgUp</kbd> Spindel Naik (Z+)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>Spasi</kbd> Nyala/Mati Spindel</span>
        </div>
        <div style={{ color: '#10b981', fontWeight: 600 }}>
          ⚡ Responsif Instan & Tanpa Delay
        </div>
      </div>

      {/* OPERATOR PENDANT STATION (DOCKED CLEANLY BELOW VIEWPORT) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1.2fr 1fr',
          gap: '16px',
          background: 'var(--bg-card)',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid var(--border-light)'
        }}
      >
        {/* PANEL 1: SPINDLE & HEAD */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>
            1. SPINDEL & ENDMILL
          </div>

          {/* Spindle Start / Stop Button */}
          <button
            onClick={toggleSpindle}
            style={{
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: '#ffffff',
              background: isSpindleRunning
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: isSpindleRunning
                ? '0 0 16px rgba(239, 68, 68, 0.4)'
                : '0 0 16px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {isSpindleRunning ? '⏹ STOP SPINDEL' : '▶ START SPINDEL (M03)'}
          </button>

          {/* Endmill Diameter Selector */}
          <div>
            <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>DIAMETER PISAU ENDMILL</span>
              <strong style={{ color: '#f59e0b' }}>Ø {toolDiameter} mm</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
              {[6, 10, 12, 16, 20].map(dia => (
                <button
                  key={dia}
                  onClick={() => { sound.playClick(); setToolDiameter(dia); }}
                  style={{
                    padding: '6px 2px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: toolDiameter === dia ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.04)',
                    color: toolDiameter === dia ? '#f59e0b' : 'var(--text-muted)',
                    border: toolDiameter === dia ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  Ø{dia}
                </button>
              ))}
            </div>
          </div>

          {/* RPM Preset Buttons */}
          <div>
            <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>KECEPATAN SPINDEL</span>
              <strong style={{ color: '#38bdf8' }}>{rpm} RPM</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {[600, 1000, 1400, 1800, 2400, 2800].map(val => (
                <button
                  key={val}
                  onClick={() => { sound.playClick(); setRpm(val); }}
                  style={{
                    padding: '6px 2px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: rpm === val ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.04)',
                    color: rpm === val ? '#38bdf8' : 'var(--text-muted)',
                    border: rpm === val ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Coolant Toggle */}
          <button
            onClick={() => { sound.playClick(); setCoolant(!coolant); }}
            style={{
              padding: '8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: coolant ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255,255,255,0.04)',
              color: coolant ? '#38bdf8' : 'var(--text-muted)',
              border: coolant ? '1px solid #0284c7' : '1px solid rgba(255,255,255,0.06)'
            }}
          >
            💦 PENDINGIN (COOLANT): {coolant ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* PANEL 2: DIGITAL READOUT (DRO 3-AXIS) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>
            2. DIGITAL READOUT (DRO 3-SUMBU)
          </div>

          {/* DRO X */}
          <div
            style={{
              background: '#040914',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>SUMBU X (MEJA LINTANG)</div>
              <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 800, color: '#10b981' }}>
                {droX} <span style={{ fontSize: '0.7rem' }}>mm</span>
              </div>
            </div>
            <button
              onClick={() => { sound.playClick(); tablePosRef.current.x = 0; setTablePosition({ ...tablePosRef.current }); }}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.65rem', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
            >
              ZERO X
            </button>
          </div>

          {/* DRO Y */}
          <div
            style={{
              background: '#040914',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>SUMBU Y (MEJA MAJU/MUNDUR)</div>
              <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 800, color: '#38bdf8' }}>
                {droY} <span style={{ fontSize: '0.7rem' }}>mm</span>
              </div>
            </div>
            <button
              onClick={() => { sound.playClick(); tablePosRef.current.y = 0; setTablePosition({ ...tablePosRef.current }); }}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.65rem', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
            >
              ZERO Y
            </button>
          </div>

          {/* DRO Z */}
          <div
            style={{
              background: '#040914',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>SUMBU Z (SPINDEL / SAYAT)</div>
              <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 800, color: spindlePosition.z <= 0 ? '#f59e0b' : '#10b981' }}>
                {droZ} <span style={{ fontSize: '0.7rem' }}>mm</span>
                <span style={{ fontSize: '0.65rem', marginLeft: '6px', fontWeight: 600, color: spindlePosition.z < 0 ? '#f59e0b' : spindlePosition.z === 0 ? '#38bdf8' : '#10b981' }}>
                  {spindlePosition.z < 0 ? `(SAYAT ${Math.abs(spindlePosition.z).toFixed(2)})` : spindlePosition.z === 0 ? '(SENTUH NOL)' : '(UDARA)'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSpindleDepthPreset(0)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f59e0b', fontSize: '0.65rem', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}
            >
              ZERO Z
            </button>
          </div>

          {/* QUICK DEPTH PRESETS (1-CLICK INSTANT FEED) */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
              PRESET CEPAT KEDALAMAN (Z):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              <button
                onClick={() => setSpindleDepthPreset(0.0)}
                style={{ padding: '4px 2px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: spindlePosition.z === 0 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.04)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)' }}
              >
                ⚡ Z=0
              </button>
              <button
                onClick={() => setSpindleDepthPreset(-1.0)}
                style={{ padding: '4px 2px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: spindlePosition.z === -1.0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.04)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}
              >
                🔻 -1.0mm
              </button>
              <button
                onClick={() => setSpindleDepthPreset(-2.0)}
                style={{ padding: '4px 2px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: spindlePosition.z === -2.0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.04)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}
              >
                🔻 -2.0mm
              </button>
              <button
                onClick={() => setSpindleDepthPreset(5.0)}
                style={{ padding: '4px 2px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: spindlePosition.z === 5.0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.04)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)' }}
              >
                🔺 +5.0mm
              </button>
            </div>
          </div>

          {/* STEP RESOLUTION SELECTOR */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
              STEP RESOLUSI:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              {[
                { label: '0.10', val: 0.10 },
                { label: '0.50', val: 0.50 },
                { label: '1.00', val: 1.00 },
                { label: '2.00', val: 2.00 }
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { sound.playClick(); setStepSize(item.val); }}
                  style={{
                    padding: '4px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: stepSize === item.val ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: stepSize === item.val ? '#10b981' : 'var(--text-muted)',
                    border: stepSize === item.val ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  {item.label}mm
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 3: DIRECTION JOGGING PADS (MEJA X/Y & SPINDEL Z) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>
              3. ARAH JOGGING MEJA & SPINDEL
            </span>
            <button
              onClick={() => { sound.playClick(); setRapidMode(!rapidMode); }}
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontWeight: 800,
                cursor: 'pointer',
                background: rapidMode ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                color: rapidMode ? '#000000' : 'var(--text-muted)',
                border: rapidMode ? 'none' : '1px solid rgba(255,255,255,0.1)'
              }}
            >
              ⚡ RAPID 3X: {rapidMode ? 'ON' : 'OFF'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', alignItems: 'center' }}>
            {/* Table X & Y D-pad */}
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '4px', fontWeight: 700 }}>
                MEJA (X, Y)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 44px)', gap: '4px', justifyContent: 'center' }}>
                <div />
                <button
                  onMouseDown={() => startHoldTableJog('y', 1)}
                  onMouseUp={stopHoldJog}
                  onMouseLeave={stopHoldJog}
                  onTouchStart={() => startHoldTableJog('y', 1)}
                  onTouchEnd={stopHoldJog}
                  style={{ height: '36px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem', userSelect: 'none' }}
                >
                  ▲ Y+
                </button>
                <div />

                <button
                  onMouseDown={() => startHoldTableJog('x', -1)}
                  onMouseUp={stopHoldJog}
                  onMouseLeave={stopHoldJog}
                  onTouchStart={() => startHoldTableJog('x', -1)}
                  onTouchEnd={stopHoldJog}
                  style={{ height: '36px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem', userSelect: 'none' }}
                >
                  ◀ X-
                </button>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  MEJA
                </div>
                <button
                  onMouseDown={() => startHoldTableJog('x', 1)}
                  onMouseUp={stopHoldJog}
                  onMouseLeave={stopHoldJog}
                  onTouchStart={() => startHoldTableJog('x', 1)}
                  onTouchEnd={stopHoldJog}
                  style={{ height: '36px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem', userSelect: 'none' }}
                >
                  X+ ▶
                </button>

                <div />
                <button
                  onMouseDown={() => startHoldTableJog('y', -1)}
                  onMouseUp={stopHoldJog}
                  onMouseLeave={stopHoldJog}
                  onTouchStart={() => startHoldTableJog('y', -1)}
                  onTouchEnd={stopHoldJog}
                  style={{ height: '36px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', color: '#38bdf8', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem', userSelect: 'none' }}
                >
                  ▼ Y-
                </button>
                <div />
              </div>
            </div>

            {/* Spindle Z Feed (Naik / Turun) */}
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '4px', fontWeight: 700 }}>
                SPINDEL (Z)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onMouseDown={() => startHoldSpindleJog(-1)}
                  onMouseUp={stopHoldJog}
                  onMouseLeave={stopHoldJog}
                  onTouchStart={() => startHoldSpindleJog(-1)}
                  onTouchEnd={stopHoldJog}
                  style={{
                    padding: '8px 6px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid #0284c7',
                    color: '#38bdf8',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    userSelect: 'none'
                  }}
                >
                  ▲ Z+ (NAIK)
                </button>

                <button
                  onMouseDown={() => startHoldSpindleJog(1)}
                  onMouseUp={stopHoldJog}
                  onMouseLeave={stopHoldJog}
                  onTouchStart={() => startHoldSpindleJog(1)}
                  onTouchEnd={stopHoldJog}
                  style={{
                    padding: '8px 6px',
                    background: 'rgba(245, 158, 11, 0.25)',
                    border: '1px solid #f59e0b',
                    color: '#f59e0b',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    userSelect: 'none',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.25)'
                  }}
                >
                  ▼ Z- (TURUN SAYAT)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 4: JOBSHEET & EVALUASI */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px' }}>
              4. TARGET JOBSHEET
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Target: <strong style={{ color: '#f59e0b' }}>Kedalaman {activeJobsheet.targetDepth} mm</strong>
              <br />
              RPM: <strong style={{ color: '#10b981' }}>{activeJobsheet.targetRpmRange[0]} - {activeJobsheet.targetRpmRange[1]}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleEvaluate}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}
            >
              🔍 UKUR & EVALUASI
            </button>

            <button
              onClick={handleReset}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              🔄 RESET BALOK KERJA
            </button>
          </div>
        </div>
      </div>

      {/* INSPECTION RESULTS MODAL / CARD */}
      {showResult && inspectionData && (
        <div
          className="animate-fade-in"
          style={{
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '16px',
            border: `2px solid ${score >= 80 ? '#10b981' : '#ef4444'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div className="flex-between">
            <div>
              <span
                style={{
                  background: score >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: score >= 80 ? '#10b981' : '#ef4444',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}
              >
                {score >= 80 ? '✓ JOBSHEET SELESAI DENGAN BAIK' : '⚠ PERLU PENYESUAIAN TEKNIK FRAIS'}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
                Laporan Hasil Inspeksi Metrologi Kedalaman & Kerataan Frais
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKOR AKHIR</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: score >= 80 ? '#10b981' : '#ef4444' }}>
                {score} / 100
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TARGET KEDALAMAN</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{inspectionData.targetDepth} mm</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>KEDALAMAN AKTUAL</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>{inspectionData.actualDepth} mm</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RPM YANG DIGUNAKAN</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{inspectionData.rpmUsed} RPM</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>XP DIPEROLEH</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>
                +{score >= 80 ? activeJobsheet.xpReward : Math.round(activeJobsheet.xpReward * 0.4)} XP
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={() => setShowResult(false)}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                background: '#f59e0b',
                border: 'none',
                color: '#000',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Lanjutkan Praktik
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MillingModule;

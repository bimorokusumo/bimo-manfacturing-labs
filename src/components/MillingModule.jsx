import { X, Settings, FileText, Wrench, Box, Crosshair, Zap, Droplets, Award, RotateCcw, Search, AlertTriangle, CheckCircle, Monitor, Smartphone, Keyboard, ShieldAlert, ArrowDown, ArrowUp } from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sound } from '../utils/audio';
import Milling3D from './Milling3D';
import PreparationModal from './PreparationModal';
import MillingTestView from './MillingTestView';
import MachineCuttingToolsLab from './MachineCuttingToolsLab';
import { millingJobsheets } from '../data/millingJobsheets';

const MillingModule = ({ addXP }) => {
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'test' | 'tools'
  const [isPrepared, setIsPrepared] = useState(true);
  const [showJobsheetModal, setShowJobsheetModal] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(() => typeof window !== 'undefined' && (window.innerWidth <= 850 || window.innerHeight <= 600));
  const [isPortrait, setIsPortrait] = useState(() => typeof window !== 'undefined' && window.innerHeight > window.innerWidth);
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'
  const [activeJobsheetIndex, setActiveJobsheetIndex] = useState(0);
  const activeJobsheet = millingJobsheets[activeJobsheetIndex] || millingJobsheets[0];
  const [showJobGuide, setShowJobGuide] = useState(true);

  useEffect(() => {
    const handleResizeAndOrientation = () => {
      if (typeof window === 'undefined') return;
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      if (window.innerWidth <= 850 || window.innerHeight <= 600) {
        setIsMobileMode(true);
      }
    };
    handleResizeAndOrientation();
    window.addEventListener('resize', handleResizeAndOrientation);
    window.addEventListener('orientationchange', handleResizeAndOrientation);
    return () => {
      window.removeEventListener('resize', handleResizeAndOrientation);
      window.removeEventListener('orientationchange', handleResizeAndOrientation);
    };
  }, []);

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
    if (activeTab === 'test' || activeTab === 'tools') {
      sound.stopMotorSound();
      sound.stopCuttingSound();
      setIsCutting(false);
      return;
    }

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
  }, [isSpindleRunning, rpm, activeTab]);

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
      if (activeTab !== 'simulator') return;
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
  }, [rapidMode, stepSize, workpieceSize, toolDiameter, isSpindleRunning, activeTab]);

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

    // Target Region Depth Analysis
    const targetRegion = activeJobsheet.targetRegion;
    let targetVerticesCount = 0;
    let targetCutVerticesCount = 0;
    let targetMaxDepth = 0;

    const w = workpieceSize.w;
    const l = workpieceSize.l;

    for (let iy = 0; iy <= gridY; iy++) {
      const vy = (iy / gridY) * l - l / 2;
      for (let ix = 0; ix <= gridX; ix++) {
        const i = iy * (gridX + 1) + ix;
        const vx = (ix / gridX) * w - w / 2;

        let inTarget = false;
        if (!targetRegion || targetRegion.shape === 'facing') {
          inTarget = true;
        } else if (targetRegion.xMin !== undefined && targetRegion.xMax !== undefined) {
          inTarget = (vx >= targetRegion.xMin - 2 && vx <= targetRegion.xMax + 2 && vy >= targetRegion.yMin - 2 && vy <= targetRegion.yMax + 2);
        }

        if (inTarget) {
          targetVerticesCount++;
          const depthMm = Math.abs(heightmapRef.current[i]);
          if (depthMm > 0.05) {
            targetCutVerticesCount++;
            if (depthMm > targetMaxDepth) targetMaxDepth = depthMm;
          }
        }
      }
    }

    const actualDepth = targetCutVerticesCount > 0 ? targetMaxDepth : maxCutDepth;
    const depthDiff = Math.abs(actualDepth - activeJobsheet.targetDepth);
    let calculatedScore = 0;

    if (isRpmCorrect && targetCutVerticesCount >= 6) {
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
      actualDepth: actualDepth.toFixed(2),
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
      {/* NAVIGATION TABS: SIMULATOR & TEST TEORI FRAIS */}
      <div style={{
        display: 'flex',
        gap: '10px',
        background: 'var(--bg-card)',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid var(--border-light)'
      }}>
        <button
          onClick={() => { sound.playClick(); setActiveTab('simulator'); }}
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: '8px',
            border: activeTab === 'simulator' ? '2px solid #f59e0b' : '1px solid transparent',
            background: activeTab === 'simulator' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'simulator' ? '#f59e0b' : 'var(--text-muted)',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.95rem'
          }}
        >
          <Box size={14} className="inline mr-1.5 text-amber-400" /> 1. Simulator Praktik Frais 3D
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('test'); }}
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: '8px',
            border: activeTab === 'test' ? '2px solid #10b981' : '1px solid transparent',
            background: activeTab === 'test' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: activeTab === 'test' ? '#10b981' : 'var(--text-muted)',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.95rem'
          }}
        >
          <FileText size={14} className="inline mr-1.5 text-amber-400" /> 2. Soal Test Teori Frais (25 Soal & Esai)
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('tools'); }}
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: '8px',
            border: activeTab === 'tools' ? '2px solid #0284c7' : '1px solid transparent',
            background: activeTab === 'tools' ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
            color: activeTab === 'tools' ? '#0284c7' : 'var(--text-muted)',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.95rem'
          }}
        >
          <Wrench size={14} className="inline mr-1.5 text-amber-400" /> 3. Katalog Pisau Frais (8 Jenis Real)
        </button>
      </div>

      {activeTab === 'test' ? (
        <MillingTestView addXP={addXP} onStartPractical={() => setActiveTab('simulator')} />
      ) : activeTab === 'tools' ? (
        <div style={{ marginTop: '12px' }}>
          <MachineCuttingToolsLab
            initialTab="milling"
            addXP={addXP}
            onNavigateToMilling={() => setActiveTab('simulator')}
          />
        </div>
      ) : (
        <>
          {!isPrepared && <PreparationModal machineName="MESIN FRAIS" onComplete={() => setIsPrepared(true)} />}

          {/* SIMULATOR VIEWPORT BRANCH: MOBILE GAME COCKPIT VS DESKTOP MULTI-PANEL */}
          {isMobileMode ? (
            /* ==============================================================
               MOBILE GAME COCKPIT: 1 SINGLE SCREEN LIKE A GAME (NO SCROLL)
               ============================================================== */
            <div
              className={`mobile-game-cockpit ${isPortrait ? 'is-portrait' : 'is-landscape'}`}
              style={{
                height: isPortrait ? 'calc(100dvh - 65px)' : 'calc(100dvh - 52px)',
                maxHeight: isPortrait ? 'calc(100dvh - 65px)' : 'calc(100dvh - 52px)',
                display: 'flex',
                flexDirection: isPortrait ? 'column' : 'block',
                position: 'relative',
                overflow: 'hidden',
                background: '#070d19'
              }}
            >
              {isPortrait ? (
                /* -----------------------------------------------------------
                   LAYOUT 1: HP MODE TEGAK (PORTRAIT) FRAIS
                   - Top HUD 2-Baris Ramping (DRO X,Y,Z + RPM + 5 Job Selector)
                   - Middle Viewport Canvas Lega & Jernih
                   - Bottom Gamepad Deck Nyaman di Jangkauan Dua Jempol
                   ----------------------------------------------------------- */
                <>
                  {/* 1. TOP COMPACT GLASS HUD */}
                  <div style={{
                    flexShrink: 0,
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '6px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    zIndex: 30
                  }}>
                    {/* BARIS 1: DRO (X, Y, Z) + SPINDLE RPM + DESKTOP BUTTON */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {/* DRO X */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1px', background: 'rgba(4, 9, 20, 0.85)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800 }}>X:</span>
                          <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 900, color: '#10b981' }}>{droX}</span>
                          <button
                            onClick={() => { sound.playClick(); tablePosRef.current.x = 0; setTablePosition({ ...tablePosRef.current }); }}
                            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#94a3b8', fontSize: '0.50rem', padding: '1px 3px', borderRadius: '2px', cursor: 'pointer' }}
                            title="Zero X"
                          >
                            0
                          </button>
                        </div>

                        {/* DRO Y */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1px', background: 'rgba(4, 9, 20, 0.85)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800 }}>Y:</span>
                          <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}>{droY}</span>
                          <button
                            onClick={() => { sound.playClick(); tablePosRef.current.y = 0; setTablePosition({ ...tablePosRef.current }); }}
                            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#94a3b8', fontSize: '0.50rem', padding: '1px 3px', borderRadius: '2px', cursor: 'pointer' }}
                            title="Zero Y"
                          >
                            0
                          </button>
                        </div>

                        {/* DRO Z */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1px', background: 'rgba(4, 9, 20, 0.85)', padding: '2px 4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800 }}>Z:</span>
                          <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 900, color: spindlePosition.z <= 0 ? '#f59e0b' : '#10b981' }}>{droZ}</span>
                          <button
                            onClick={() => setSpindleDepthPreset(0)}
                            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#f59e0b', fontSize: '0.50rem', padding: '1px 3px', borderRadius: '2px', cursor: 'pointer', fontWeight: 800 }}
                            title="Zero Z"
                          >
                            0
                          </button>
                        </div>
                      </div>

                      {/* SPINDLE STATUS & DESKTOP SWITCH */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '3px',
                          background: isSpindleRunning ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                          border: `1px solid ${isSpindleRunning ? '#10b981' : '#ef4444'}`,
                          padding: '2px 6px', borderRadius: '14px', fontSize: '0.65rem', fontWeight: 800,
                          color: isSpindleRunning ? '#10b981' : '#fca5a5'
                        }}>
                          <span className={`font-mono text-[9px] px-1 py-0.5 rounded font-bold ${isSpindleRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{isSpindleRunning ? 'RUN' : 'STOP'}</span>
                          <span>{rpm} RPM</span>
                          {isCutting && <span className="font-mono text-[9px] font-bold text-amber-400 animate-pulse">[CUT]</span>}
                        </div>

                        <button
                          onClick={() => { sound.playClick(); setIsMobileMode(false); }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff',
                            padding: '2px 5px', borderRadius: '5px', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer'
                          }}
                          title="Beralih ke Tampilan Desktop Penuh"
                        >
                          <Monitor size={14} className="text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* BARIS 2: 2D/3D + GARIS JOB + QUICK 5 JOBS SELECTOR + PISAU */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => { sound.playClick(); setViewMode(v => v === '3d' ? '2d' : '3d'); }}
                          style={{
                            background: viewMode === '2d' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255, 255, 255, 0.12)',
                            border: viewMode === '2d' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.25)',
                            color: '#ffffff',
                            padding: '2px 6px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer',
                            boxShadow: viewMode === '2d' ? '0 0 8px rgba(56, 189, 248, 0.4)' : 'none'
                          }}
                          title="Beralih antara Mode 3D dan Mode 2D Presisi"
                        >
                          {viewMode === '3d' ? '2D CAD' : '3D CAM'}
                        </button>

                        <button
                          onClick={() => { sound.playClick(); setShowJobGuide(v => !v); }}
                          style={{
                            background: showJobGuide ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.12)',
                            border: showJobGuide ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.25)',
                            color: showJobGuide ? '#34d399' : '#cbd5e1',
                            padding: '2px 5px', borderRadius: '5px', fontSize: '0.64rem', fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '2px'
                          }}
                          title="Tampilkan / Sembunyikan Garis Target Blueprint Job"
                        >
                          <Crosshair size={13} className="inline mr-1 text-amber-400" />
                          <span>JOB</span>
                        </button>
                      </div>

                      {/* QUICK 5 JOBS SELECTOR KODE ANGKA (PORTRAIT FRAIS) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.35)', padding: '2px 4px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#94a3b8' }}>JOB:</span>
                        {millingJobsheets.map((sheet, idx) => (
                          <button
                            key={sheet.id}
                            onClick={() => { sound.playClick(); setActiveJobsheetIndex(idx); }}
                            style={{
                              minWidth: '22px', height: '20px', padding: '0 2px', borderRadius: '3px',
                              fontSize: '0.66rem', fontWeight: 900, cursor: 'pointer',
                              background: activeJobsheetIndex === idx ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
                              color: activeJobsheetIndex === idx ? '#000000' : '#94a3b8',
                              border: activeJobsheetIndex === idx ? '1px solid #fbbf24' : 'none',
                              boxShadow: activeJobsheetIndex === idx ? '0 0 6px rgba(245, 158, 11, 0.4)' : 'none'
                            }}
                            title={`Tugas ${idx + 1}: ${sheet.title}`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => { sound.playClick(); setActiveTab('tools'); }}
                        style={{
                          background: 'rgba(2, 132, 199, 0.25)', border: '1px solid #0284c7', color: '#38bdf8',
                          padding: '2px 6px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer'
                        }}
                        title="Katalog 8 Pisau Frais Real"
                      >
                        <Wrench size={13} className="inline text-amber-400" />
                      </button>
                    </div>
                  </div>

                  {/* 2. MIDDLE VIEWPORT CANVAS (LEGA, TIDAK TERTUTUP TOMBOL) */}
                  <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden', background: '#0b1120' }}>
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
                      viewMode={viewMode}
                      onToggleViewMode={setViewMode}
                      hideInternalToggle={true}
                      activeJobsheet={activeJobsheet}
                      showJobGuide={showJobGuide}
                      onToggleJobGuide={() => setShowJobGuide(v => !v)}
                    />

                    {/* AUTO-HINT BADGE (PORTRAIT) */}
                    <div style={{
                      position: 'absolute', bottom: '6px', right: '8px', zIndex: 10,
                      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px',
                      padding: '3px 8px', fontSize: '0.58rem', fontWeight: 700, color: '#94a3b8',
                      display: 'flex', alignItems: 'center', gap: '4px', pointerEvents: 'none'
                    }}>
                      <Smartphone size={13} className="inline mr-1 text-amber-400" />
                      <span>Miringkan HP untuk Layar Penuh</span>
                    </div>
                  </div>

                  {/* 3. BOTTOM ERGONOMIC CONTROL DECK (PORTRAIT FRAIS) */}
                  <div style={{
                    flexShrink: 0,
                    background: 'rgba(11, 17, 32, 0.94)',
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '6px 8px',
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 120px',
                    gap: '6px',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    boxShadow: '0 -4px 16px rgba(0,0,0,0.5)'
                  }}>
                    {/* LEFT THUMB: XY TABLE D-PAD */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', gridTemplateRows: 'repeat(3, 36px)', gap: '4px', justifySelf: 'center', userSelect: 'none' }}>
                      <div />
                      <button
                        className="game-dpad-btn"
                        onMouseDown={() => startHoldTableJog('y', 1)}
                        onMouseUp={stopHoldJog}
                        onMouseLeave={stopHoldJog}
                        onTouchStart={() => startHoldTableJog('y', 1)}
                        onTouchEnd={stopHoldJog}
                        style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        title="Meja Mundur (Y+)"
                      >
                        ▲<span style={{ fontSize: '0.48rem', lineHeight: 1 }}>Y+</span>
                      </button>
                      <div />

                      <button
                        className="game-dpad-btn"
                        onMouseDown={() => startHoldTableJog('x', -1)}
                        onMouseUp={stopHoldJog}
                        onMouseLeave={stopHoldJog}
                        onTouchStart={() => startHoldTableJog('x', -1)}
                        onTouchEnd={stopHoldJog}
                        style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        title="Meja Kiri (X-)"
                      >
                        ◀<span style={{ fontSize: '0.48rem', lineHeight: 1 }}>X-</span>
                      </button>

                      <div style={{ background: 'rgba(15, 23, 42, 0.75)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                        MEJA
                      </div>

                      <button
                        className="game-dpad-btn"
                        onMouseDown={() => startHoldTableJog('x', 1)}
                        onMouseUp={stopHoldJog}
                        onMouseLeave={stopHoldJog}
                        onTouchStart={() => startHoldTableJog('x', 1)}
                        onTouchEnd={stopHoldJog}
                        style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        title="Meja Kanan (X+)"
                      >
                        ▶<span style={{ fontSize: '0.48rem', lineHeight: 1 }}>X+</span>
                      </button>

                      <div />
                      <button
                        className="game-dpad-btn"
                        onMouseDown={() => startHoldTableJog('y', -1)}
                        onMouseUp={stopHoldJog}
                        onMouseLeave={stopHoldJog}
                        onTouchStart={() => startHoldTableJog('y', -1)}
                        onTouchEnd={stopHoldJog}
                        style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        title="Meja Maju (Y-)"
                      >
                        ▼<span style={{ fontSize: '0.48rem', lineHeight: 1 }}>Y-</span>
                      </button>
                      <div />
                    </div>

                    {/* CENTER COLUMN: STEP & QUICK DEPTH PRESETS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 4px', height: '100%', justifyContent: 'center' }}>
                      {/* Step Selector */}
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[0.10, 0.50, 1.00, 2.00].map((v) => (
                          <button
                            key={v}
                            onClick={() => { sound.playClick(); setStepSize(v); }}
                            style={{
                              flex: 1, padding: '4px 0', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer',
                              background: stepSize === v ? '#f59e0b' : 'rgba(15, 23, 42, 0.75)',
                              color: stepSize === v ? '#000' : '#cbd5e1',
                              border: stepSize === v ? 'none' : '1px solid rgba(255,255,255,0.15)',
                              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>

                      {/* Quick Depth Presets */}
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[
                          { l: 'Z=0', v: 0.0, c: '#38bdf8' },
                          { l: '-1mm', v: -1.0, c: '#f59e0b' },
                          { l: '-2mm', v: -2.0, c: '#f59e0b' },
                          { l: '+5mm', v: 5.0, c: '#10b981' }
                        ].map(dp => (
                          <button
                            key={dp.l}
                            onClick={() => setSpindleDepthPreset(dp.v)}
                            style={{
                              flex: 1, padding: '3px 0', borderRadius: '4px', fontSize: '0.58rem', fontWeight: 800, cursor: 'pointer',
                              background: spindlePosition.z === dp.v ? 'rgba(245, 158, 11, 0.4)' : 'rgba(15, 23, 42, 0.75)',
                              color: dp.c, border: `1px solid ${spindlePosition.z === dp.v ? dp.c : 'rgba(255,255,255,0.12)'}`,
                              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                            }}
                          >
                            {dp.l}
                          </button>
                        ))}
                      </div>

                      {/* Rapid & Coolant */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => { sound.playClick(); setRapidMode(!rapidMode); }}
                          style={{
                            flex: 1, padding: '4px 2px', borderRadius: '5px', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer',
                            background: rapidMode ? '#f59e0b' : 'rgba(15, 23, 42, 0.75)',
                            color: rapidMode ? '#000' : '#cbd5e1',
                            border: rapidMode ? 'none' : '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                          }}
                        >
                          <Zap size={12} className="inline mr-1" /> RAPID
                        </button>
                        <button
                          onClick={() => { sound.playClick(); setCoolant(!coolant); }}
                          style={{
                            flex: 1, padding: '4px 2px', borderRadius: '5px', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer',
                            background: coolant ? 'rgba(14, 165, 233, 0.35)' : 'rgba(15, 23, 42, 0.75)',
                            color: coolant ? '#38bdf8' : '#cbd5e1',
                            border: coolant ? '1px solid #0284c7' : '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                          }}
                        >
                          <Droplets size={12} className="inline mr-1 text-cyan-400" /> {coolant ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      {/* Evaluate & Reset Buttons */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={handleEvaluate}
                          style={{
                            flex: 1.3, padding: '4px 2px', borderRadius: '5px', fontSize: '0.64rem', fontWeight: 900, cursor: 'pointer',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', border: 'none',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                          }}
                        >
                          <Award size={12} className="inline mr-1 text-amber-400" /> CEK
                        </button>
                        <button
                          onClick={handleReset}
                          style={{
                            flex: 0.8, padding: '4px 2px', borderRadius: '5px', fontSize: '0.64rem', fontWeight: 700, cursor: 'pointer',
                            background: 'rgba(15, 23, 42, 0.75)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                          }}
                        >
                          <RotateCcw size={12} className="inline mr-1" /> RESET
                        </button>
                      </div>
                    </div>

                    {/* RIGHT THUMB: SPINDLE Z FEED & SPINDLE POWER */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', height: '100%', justifyContent: 'center' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
                        <button
                          className="game-dpad-btn"
                          onMouseDown={() => startHoldSpindleJog(-1)}
                          onMouseUp={stopHoldJog}
                          onMouseLeave={stopHoldJog}
                          onTouchStart={() => startHoldSpindleJog(-1)}
                          onTouchEnd={stopHoldJog}
                          style={{ height: '34px', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.64rem', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                          title="Spindel Naik (Z+)"
                        >
                          ▲<span style={{ fontSize: '0.48rem', lineHeight: 1 }}>Z+ NAIK</span>
                        </button>
                        <button
                          className="game-dpad-btn"
                          onMouseDown={() => startHoldSpindleJog(1)}
                          onMouseUp={stopHoldJog}
                          onMouseLeave={stopHoldJog}
                          onTouchStart={() => startHoldSpindleJog(1)}
                          onTouchEnd={stopHoldJog}
                          style={{ height: '34px', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #f59e0b', color: '#f59e0b', fontSize: '0.64rem', boxShadow: '0 0 8px rgba(245, 158, 11, 0.25)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                          title="Spindel Turun Sayat (Z-)"
                        >
                          ▼<span style={{ fontSize: '0.48rem', lineHeight: 1 }}>Z- SAYAT</span>
                        </button>
                      </div>

                      <button
                        className="game-action-btn"
                        onClick={toggleSpindle}
                        style={{
                          height: '42px', width: '100%',
                          background: isSpindleRunning
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff', border: 'none',
                          boxShadow: isSpindleRunning ? '0 0 16px rgba(239, 68, 68, 0.5)' : '0 0 16px rgba(16, 185, 129, 0.5)',
                          fontSize: '0.72rem'
                        }}
                      >
                        <span className="font-mono text-xs font-bold">{isSpindleRunning ? 'STOP' : 'START'}</span>
                        <span>{isSpindleRunning ? 'STOP' : 'START'}</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.75)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                        <button
                          onClick={() => { sound.playClick(); setRpm(prev => Math.max(300, prev - 150)); }}
                          style={{ width: '24px', height: '22px', background: 'transparent', border: 'none', color: '#f59e0b', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          -
                        </button>
                        <div style={{ flex: 1, textAlign: 'center', fontSize: '0.62rem', fontWeight: 800, color: '#f59e0b' }}>
                          {rpm}
                        </div>
                        <button
                          onClick={() => { sound.playClick(); setRpm(prev => Math.min(3000, prev + 150)); }}
                          style={{ width: '24px', height: '22px', background: 'transparent', border: 'none', color: '#f59e0b', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* -----------------------------------------------------------
                   LAYOUT 2: HP MODE MIRING / LANDSCAPE (FULLSCREEN GAME COCKPIT)
                   - 100% Fullscreen Viewport di belakang
                   - Floating Top Glass HUD
                   - Bottom Floating Virtual Gamepad Dua Jempol
                   ----------------------------------------------------------- */
                <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden', background: '#0b1120' }}>
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
                    viewMode={viewMode}
                    onToggleViewMode={setViewMode}
                    hideInternalToggle={true}
                    activeJobsheet={activeJobsheet}
                    showJobGuide={showJobGuide}
                    onToggleJobGuide={() => setShowJobGuide(v => !v)}
                  />

                  {/* FLOATING TOP GLASS HUD (LANDSCAPE) */}
                  <div style={{
                    position: 'absolute', top: '6px', left: '8px', right: '8px', zIndex: 30,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(10px)',
                    padding: '4px 8px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
                  }}>
                    {/* DRO READOUTS (X, Y, Z) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(4, 9, 20, 0.85)', padding: '2px 5px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 800 }}>X:</span>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 900, color: '#10b981' }}>{droX}</span>
                        <button
                          onClick={() => { sound.playClick(); tablePosRef.current.x = 0; setTablePosition({ ...tablePosRef.current }); }}
                          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#94a3b8', fontSize: '0.5rem', padding: '1px 3px', borderRadius: '2px', cursor: 'pointer' }}
                          title="Zero X"
                        >
                          0
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(4, 9, 20, 0.85)', padding: '2px 5px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 800 }}>Y:</span>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}>{droY}</span>
                        <button
                          onClick={() => { sound.playClick(); tablePosRef.current.y = 0; setTablePosition({ ...tablePosRef.current }); }}
                          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#94a3b8', fontSize: '0.5rem', padding: '1px 3px', borderRadius: '2px', cursor: 'pointer' }}
                          title="Zero Y"
                        >
                          0
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(4, 9, 20, 0.85)', padding: '2px 5px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 800 }}>Z:</span>
                        <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 900, color: spindlePosition.z <= 0 ? '#f59e0b' : '#10b981' }}>{droZ}</span>
                        <button
                          onClick={() => setSpindleDepthPreset(0)}
                          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#f59e0b', fontSize: '0.5rem', padding: '1px 3px', borderRadius: '2px', cursor: 'pointer', fontWeight: 800 }}
                          title="Zero Z"
                        >
                          0
                        </button>
                      </div>
                    </div>

                    {/* SPINDLE STATUS & RPM */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: isSpindleRunning ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                      border: `1px solid ${isSpindleRunning ? '#10b981' : '#ef4444'}`,
                      padding: '2px 7px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 800,
                      color: isSpindleRunning ? '#10b981' : '#fca5a5'
                    }}>
                      <span className={`font-mono text-[9px] px-1 py-0.5 rounded font-bold ${isSpindleRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{isSpindleRunning ? 'RUN' : 'STOP'}</span>
                      <span>{rpm} RPM</span>
                      {isCutting && <span className="font-mono text-[9px] font-bold text-amber-400 animate-pulse">[CUT]</span>}
                    </div>

                    {/* 2D/3D + GARIS JOB + QUICK 5 JOBS SELECTOR + PISAU (LANDSCAPE) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => { sound.playClick(); setViewMode(v => v === '3d' ? '2d' : '3d'); }}
                        style={{
                          background: viewMode === '2d' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255, 255, 255, 0.12)',
                          border: viewMode === '2d' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.25)',
                          color: '#ffffff',
                          padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 900, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '3px',
                          boxShadow: viewMode === '2d' ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none'
                        }}
                        title="Beralih antara Mode 3D dan Mode 2D Presisi"
                      >
                        <span>{viewMode === '3d' ? '2D CAD' : '3D CAM'}</span>
                      </button>

                      <button
                        onClick={() => { sound.playClick(); setShowJobGuide(v => !v); }}
                        style={{
                          background: showJobGuide ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.12)',
                          border: showJobGuide ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.25)',
                          color: showJobGuide ? '#34d399' : '#cbd5e1',
                          padding: '3px 6px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 800, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '2px'
                        }}
                        title="Tampilkan / Sembunyikan Garis Target Blueprint Job"
                      >
                        <Crosshair size={13} className="inline mr-1 text-amber-400" />
                        <span>JOB</span>
                      </button>

                      {/* 5 JOBS SELECTOR KODE ANGKA (LANDSCAPE FRAIS) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.60rem', fontWeight: 800, color: '#94a3b8' }}>JOB:</span>
                        {millingJobsheets.map((sheet, idx) => (
                          <button
                            key={sheet.id}
                            onClick={() => { sound.playClick(); setActiveJobsheetIndex(idx); }}
                            style={{
                              minWidth: '22px', height: '20px', padding: '0 2px', borderRadius: '3px',
                              fontSize: '0.66rem', fontWeight: 900, cursor: 'pointer',
                              background: activeJobsheetIndex === idx ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
                              color: activeJobsheetIndex === idx ? '#000000' : '#94a3b8',
                              border: activeJobsheetIndex === idx ? '1px solid #fbbf24' : 'none',
                              boxShadow: activeJobsheetIndex === idx ? '0 0 6px rgba(245, 158, 11, 0.4)' : 'none'
                            }}
                            title={`Tugas ${idx + 1}: ${sheet.title}`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => { sound.playClick(); setActiveTab('tools'); }}
                        style={{
                          background: 'rgba(2, 132, 199, 0.25)', border: '1px solid #0284c7', color: '#38bdf8',
                          padding: '3px 6px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 800, cursor: 'pointer'
                        }}
                        title="Katalog 8 Pisau Frais Real"
                      >
                        <Wrench size={13} className="inline text-amber-400" />
                      </button>

                      <button
                        onClick={() => { sound.playClick(); setIsMobileMode(false); }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff',
                          padding: '3px 6px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 700, cursor: 'pointer'
                        }}
                        title="Beralih ke Tampilan Desktop Penuh"
                      >
                        <Monitor size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* BOTTOM FLOATING VIRTUAL GAMEPAD (LANDSCAPE FRAIS) */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, pointerEvents: 'none',
                    height: '200px',
                    background: 'linear-gradient(to top, rgba(2, 6, 23, 0.70) 0%, rgba(2, 6, 23, 0.15) 70%, transparent 100%)',
                    padding: '6px 8px', display: 'grid', gridTemplateColumns: '120px 1fr 125px', gap: '6px',
                    alignItems: 'center', boxSizing: 'border-box'
                  }}>
                    {/* LEFT THUMB: XY TABLE D-PAD */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', gridTemplateRows: 'repeat(3, 36px)', gap: '4px', justifySelf: 'center', userSelect: 'none', pointerEvents: 'auto' }}>
                      <div />
                      <button
                        className="game-dpad-btn"
                        onMouseDown={() => startHoldTableJog('y', 1)}
                        onMouseUp={stopHoldJog}
                        onMouseLeave={stopHoldJog}
                        onTouchStart={() => startHoldTableJog('y', 1)}
                        onTouchEnd={stopHoldJog}
                        style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        title="Meja Mundur (Y+)"
                      >
                        ▲<span style={{ fontSize: '0.48rem', lineHeight: 1 }}>Y+</span>
                      </button>
                      <div />

                      <button
                        className="game-dpad-btn"
                        onMouseDown={() => startHoldTableJog('x', -1)}
                        onMouseUp={stopHoldJog}
                        onMouseLeave={stopHoldJog}
                        onTouchStart={() => startHoldTableJog('x', -1)}
                        onTouchEnd={stopHoldJog}
                        style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        title="Meja Kiri (X-)"
                      >
                        ◀<span style={{ fontSize: '0.48rem', lineHeight: 1 }}>X-</span>
                      </button>

                      <div style={{ background: 'rgba(15, 23, 42, 0.75)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                        MEJA
                      </div>

                      <button
                        className="game-dpad-btn"
                        onMouseDown={() => startHoldTableJog('x', 1)}
                        onMouseUp={stopHoldJog}
                        onMouseLeave={stopHoldJog}
                        onTouchStart={() => startHoldTableJog('x', 1)}
                        onTouchEnd={stopHoldJog}
                        style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        title="Meja Kanan (X+)"
                      >
                        ▶<span style={{ fontSize: '0.48rem', lineHeight: 1 }}>X+</span>
                      </button>

                      <div />
                      <button
                        className="game-dpad-btn"
                        onMouseDown={() => startHoldTableJog('y', -1)}
                        onMouseUp={stopHoldJog}
                        onMouseLeave={stopHoldJog}
                        onTouchStart={() => startHoldTableJog('y', -1)}
                        onTouchEnd={stopHoldJog}
                        style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        title="Meja Maju (Y-)"
                      >
                        ▼<span style={{ fontSize: '0.48rem', lineHeight: 1 }}>Y-</span>
                      </button>
                      <div />
                    </div>

                    {/* CENTER COLUMN: STEP & QUICK DEPTH PRESETS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 4px', height: '100%', justifyContent: 'center', pointerEvents: 'auto' }}>
                      {/* Step Selector */}
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[0.10, 0.50, 1.00, 2.00].map((v) => (
                          <button
                            key={v}
                            onClick={() => { sound.playClick(); setStepSize(v); }}
                            style={{
                              flex: 1, padding: '5px 0', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer',
                              background: stepSize === v ? '#f59e0b' : 'rgba(15, 23, 42, 0.75)',
                              color: stepSize === v ? '#000' : '#cbd5e1',
                              border: stepSize === v ? 'none' : '1px solid rgba(255,255,255,0.15)',
                              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>

                      {/* Quick Depth Presets */}
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[
                          { l: 'Z=0', v: 0.0, c: '#38bdf8' },
                          { l: '-1mm', v: -1.0, c: '#f59e0b' },
                          { l: '-2mm', v: -2.0, c: '#f59e0b' },
                          { l: '+5mm', v: 5.0, c: '#10b981' }
                        ].map(dp => (
                          <button
                            key={dp.l}
                            onClick={() => setSpindleDepthPreset(dp.v)}
                            style={{
                              flex: 1, padding: '4px 0', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer',
                              background: spindlePosition.z === dp.v ? 'rgba(245, 158, 11, 0.4)' : 'rgba(15, 23, 42, 0.75)',
                              color: dp.c, border: `1px solid ${spindlePosition.z === dp.v ? dp.c : 'rgba(255,255,255,0.12)'}`,
                              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                            }}
                          >
                            {dp.l}
                          </button>
                        ))}
                      </div>

                      {/* Rapid & Coolant */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => { sound.playClick(); setRapidMode(!rapidMode); }}
                          style={{
                            flex: 1, padding: '5px 2px', borderRadius: '5px', fontSize: '0.64rem', fontWeight: 800, cursor: 'pointer',
                            background: rapidMode ? '#f59e0b' : 'rgba(15, 23, 42, 0.75)',
                            color: rapidMode ? '#000' : '#cbd5e1',
                            border: rapidMode ? 'none' : '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                          }}
                        >
                          <Zap size={12} className="inline mr-1" /> RAPID 3X
                        </button>
                        <button
                          onClick={() => { sound.playClick(); setCoolant(!coolant); }}
                          style={{
                            flex: 1, padding: '5px 2px', borderRadius: '5px', fontSize: '0.64rem', fontWeight: 800, cursor: 'pointer',
                            background: coolant ? 'rgba(14, 165, 233, 0.35)' : 'rgba(15, 23, 42, 0.75)',
                            color: coolant ? '#38bdf8' : '#cbd5e1',
                            border: coolant ? '1px solid #0284c7' : '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                          }}
                        >
                          <Droplets size={12} className="inline mr-1 text-cyan-400" /> {coolant ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      {/* Evaluate & Reset Buttons */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={handleEvaluate}
                          style={{
                            flex: 1.3, padding: '5px 2px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', border: 'none',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                          }}
                        >
                          <Award size={12} className="inline mr-1 text-amber-400" /> CEK HASIL
                        </button>
                        <button
                          onClick={handleReset}
                          style={{
                            flex: 0.8, padding: '5px 2px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                            background: 'rgba(15, 23, 42, 0.75)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                          }}
                        >
                          <RotateCcw size={12} className="inline mr-1" /> RESET
                        </button>
                      </div>
                    </div>

                    {/* RIGHT THUMB: SPINDLE Z FEED & SPINDLE POWER */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', height: '100%', justifyContent: 'center', pointerEvents: 'auto' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <button
                          className="game-dpad-btn"
                          onMouseDown={() => startHoldSpindleJog(-1)}
                          onMouseUp={stopHoldJog}
                          onMouseLeave={stopHoldJog}
                          onTouchStart={() => startHoldSpindleJog(-1)}
                          onTouchEnd={stopHoldJog}
                          style={{ height: '38px', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                          title="Spindel Naik (Z+)"
                        >
                          ▲<span style={{ fontSize: '0.5rem', lineHeight: 1 }}>Z+ NAIK</span>
                        </button>
                        <button
                          className="game-dpad-btn"
                          onMouseDown={() => startHoldSpindleJog(1)}
                          onMouseUp={stopHoldJog}
                          onMouseLeave={stopHoldJog}
                          onTouchStart={() => startHoldSpindleJog(1)}
                          onTouchEnd={stopHoldJog}
                          style={{ height: '38px', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #f59e0b', color: '#f59e0b', fontSize: '0.68rem', boxShadow: '0 0 8px rgba(245, 158, 11, 0.25)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                          title="Spindel Turun Sayat (Z-)"
                        >
                          ▼<span style={{ fontSize: '0.5rem', lineHeight: 1 }}>Z- SAYAT</span>
                        </button>
                      </div>

                      <button
                        className="game-action-btn"
                        onClick={toggleSpindle}
                        style={{
                          height: '48px', width: '100%',
                          background: isSpindleRunning
                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff', border: 'none',
                          boxShadow: isSpindleRunning ? '0 0 16px rgba(239, 68, 68, 0.5)' : '0 0 16px rgba(16, 185, 129, 0.5)',
                          fontSize: '0.74rem'
                        }}
                      >
                        <span className="font-mono text-xs font-bold">{isSpindleRunning ? 'STOP' : 'START'}</span>
                        <span>{isSpindleRunning ? 'STOP' : 'START SPINDEL'}</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.75)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                        <button
                          onClick={() => { sound.playClick(); setRpm(prev => Math.max(300, prev - 150)); }}
                          style={{ width: '28px', height: '26px', background: 'transparent', border: 'none', color: '#f59e0b', fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                          -
                        </button>
                        <div style={{ flex: 1, textAlign: 'center', fontSize: '0.66rem', fontWeight: 800, color: '#f59e0b' }}>
                          {rpm} RPM
                        </div>
                        <button
                          onClick={() => { sound.playClick(); setRpm(prev => Math.min(3000, prev + 150)); }}
                          style={{ width: '28px', height: '26px', background: 'transparent', border: 'none', color: '#f59e0b', fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ==============================================================
               DESKTOP MULTI-PANEL VIEWPORT & PENDANT STATION
               ============================================================== */
            <>
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
                    <Wrench className="w-5 h-5 text-white" />
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

                {/* ACTION CONTROLS & COMPACT JOB SELECTOR */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                  {/* BARIS ATAS: MODE CONTROLS */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* 2D / 3D VIEW TOGGLE (DESKTOP) */}
                    <button
                      onClick={() => { sound.playClick(); setViewMode(v => v === '3d' ? '2d' : '3d'); }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: viewMode === '2d' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255,255,255,0.06)',
                        color: viewMode === '2d' ? '#ffffff' : 'var(--text-main)',
                        border: viewMode === '2d' ? '1px solid #38bdf8' : '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: viewMode === '2d' ? '0 0 12px rgba(56, 189, 248, 0.35)' : 'none'
                      }}
                      title="Beralih antara Mode 3D Studio dan Mode 2D Presisi (Top-Down)"
                    >
                      <span>{viewMode === '3d' ? 'MODE 2D PRESISI' : 'MODE 3D STUDIO'}</span>
                    </button>

                    {/* GARIS TARGET JOB (BLUEPRINT) TOGGLE (DESKTOP) */}
                    <button
                      onClick={() => { sound.playClick(); setShowJobGuide(v => !v); }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: showJobGuide ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255,255,255,0.06)',
                        color: showJobGuide ? '#34d399' : 'var(--text-main)',
                        border: showJobGuide ? '1px solid #10b981' : '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                        boxShadow: showJobGuide ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'
                      }}
                      title="Tampilkan / Sembunyikan Garis Target Blueprint Jobsheet Frais"
                    >
                      <Crosshair size={13} className="inline mr-1 text-amber-400" />
                      <span>GARIS JOB: {showJobGuide ? 'ON' : 'OFF'}</span>
                    </button>

                    <button
                      onClick={() => { sound.playClick(); setIsMobileMode(true); }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        border: '1px solid #34d399',
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Beralih ke Mode Game 1 Layar Penuh (Cocok untuk Layar HP)"
                    >
                      <Box size={13} className="inline mr-1 text-amber-400" />
                      <span>MODE GAME HP</span>
                    </button>

                    <button
                      onClick={() => { sound.playClick(); setActiveTab('tools'); }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#ffffff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                      }}
                    >
                      <Wrench size={13} className="inline mr-1 text-amber-400" /> Pisau Frais
                    </button>

                    <button
                      onClick={() => { sound.playClick(); setIsPrepared(false); }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid #10b981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Buka panduan K3 & SOP"
                    >
                      <ShieldAlert size={13} className="inline mr-1 text-emerald-400" /> SOP & K3
                    </button>
                  </div>

                  {/* BARIS BAWAH: PILIHAN 5 JOB DENGAN KODE ANGKA RINGKAS */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      PILIH JOB:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', background: 'rgba(0, 0, 0, 0.2)', padding: '3px 5px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      {millingJobsheets.map((sheet, idx) => (
                        <button
                          key={sheet.id}
                          onClick={() => { sound.playClick(); setActiveJobsheetIndex(idx); }}
                          style={{
                            minWidth: '34px',
                            height: '28px',
                            padding: '0 8px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: activeJobsheetIndex === idx ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255,255,255,0.05)',
                            color: activeJobsheetIndex === idx ? '#000000' : 'var(--text-muted)',
                            border: activeJobsheetIndex === idx ? '1px solid #fbbf24' : '1px solid transparent',
                            boxShadow: activeJobsheetIndex === idx ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px',
                            transition: 'all 0.15s'
                          }}
                          title={`Job ${idx + 1}: ${sheet.title}`}
                        >
                          <span>{idx + 1}</span>
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f59e0b', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Job {activeJobsheetIndex + 1}: {activeJobsheet.title.split('(')[0].trim()}
                    </span>
                  </div>
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
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          activeJobsheet={activeJobsheet}
          showJobGuide={showJobGuide}
          onToggleJobGuide={() => setShowJobGuide(v => !v)}
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
          <span style={{ color: '#f59e0b', fontWeight: 700 }}><Keyboard size={14} className="inline mr-1.5" /> KONTROL TOMBOL KEYBOARD:</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>◀</kbd> Meja Kiri (X-)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>▶</kbd> Meja Kanan (X+)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>▼</kbd> Meja Maju (Y-)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>▲</kbd> Meja Mundur (Y+)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>S / PgDn</kbd> Spindel Turun Sayat (Z-)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>W / PgUp</kbd> Spindel Naik (Z+)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>Spasi</kbd> Nyala/Mati Spindel</span>
        </div>
        <div style={{ color: '#10b981', fontWeight: 600 }}>
          <Zap size={13} className="inline mr-1 text-amber-400" /> Responsif Instan & Tanpa Delay
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
            {isSpindleRunning ? 'STOP SPINDEL' : 'START SPINDEL (M03)'}
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
            <Droplets size={14} className="inline mr-1.5 text-cyan-400" /> PENDINGIN (COOLANT): {coolant ? 'ON' : 'OFF'}
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
                <Zap size={13} className="inline mr-1 text-amber-400" /> Z=0
              </button>
              <button
                onClick={() => setSpindleDepthPreset(-1.0)}
                style={{ padding: '4px 2px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: spindlePosition.z === -1.0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.04)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}
              >
                <ArrowDown size={13} className="inline mr-1 text-rose-400" /> -1.0mm
              </button>
              <button
                onClick={() => setSpindleDepthPreset(-2.0)}
                style={{ padding: '4px 2px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: spindlePosition.z === -2.0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.04)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}
              >
                <ArrowDown size={13} className="inline mr-1 text-rose-400" /> -2.0mm
              </button>
              <button
                onClick={() => setSpindleDepthPreset(5.0)}
                style={{ padding: '4px 2px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: spindlePosition.z === 5.0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.04)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)' }}
              >
                <ArrowUp size={13} className="inline mr-1 text-emerald-400" /> +5.0mm
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
              <Zap size={12} className="inline mr-1" /> RAPID 3X: {rapidMode ? 'ON' : 'OFF'}
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
              <Search size={14} className="inline mr-1.5" /> UKUR & EVALUASI
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
              <RotateCcw size={14} className="inline mr-1.5" /> RESET BALOK KERJA
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
                {score >= 80 ? '[LULUS] JOBSHEET SELESAI DENGAN BAIK' : '[EVALUASI] PERLU PENYESUAIAN TEKNIK FRAIS'}
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
    </>
  )}

  {/* MOBILE EVALUATION RESULT MODAL (IF IN MOBILE GAME MODE) */}
  {isMobileMode && showResult && inspectionData && (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: `2px solid ${score >= 80 ? '#10b981' : '#ef4444'}`,
        borderRadius: '16px', padding: '20px', maxWidth: '420px', width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', gap: '14px'
      }}>
        <div className="flex-between">
          <span style={{
            background: score >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: score >= 80 ? '#10b981' : '#ef4444',
            padding: '3px 10px', borderRadius: '20px', fontWeight: 800, fontSize: '0.78rem'
          }}>
            {score >= 80 ? '[LULUS] TUGAS FRAIS SUKSES' : '[EVALUASI] PERLU PERBAIKAN'}
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: score >= 80 ? '#10b981' : '#ef4444' }}>
            {score}/100
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TARGET KEDALAMAN</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{inspectionData.targetDepth} mm</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>KEDALAMAN AKTUAL</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>{inspectionData.actualDepth} mm</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>RPM DIGUNAKAN</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>{inspectionData.rpmUsed} RPM</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>XP DIPEROLEH</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>
              +{score >= 80 ? activeJobsheet.xpReward : Math.round(activeJobsheet.xpReward * 0.4)} XP
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowResult(false)}
          style={{
            width: '100%', padding: '10px', borderRadius: '8px',
            background: '#f59e0b', color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer'
          }}
        >
          Lanjutkan Praktik
        </button>
      </div>
    </div>
  )}

  {/* MILLING JOBSHEET SELECTION MODAL (MOBILE GAME MODE) */}
  {showJobsheetModal && (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
        borderRadius: '16px', padding: '20px', maxWidth: '480px', width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} className="text-amber-400" />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
              PILIH TUGAS / JOBSHEET FRAIS
            </span>
          </div>
          <button
            onClick={() => setShowJobsheetModal(false)}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '1.1rem', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {millingJobsheets.map((sheet, idx) => (
            <div
              key={sheet.id}
              onClick={() => {
                sound.playClick();
                setActiveJobsheetIndex(idx);
                setShowJobsheetModal(false);
              }}
              style={{
                padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                background: activeJobsheetIndex === idx ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255,255,255,0.03)',
                border: activeJobsheetIndex === idx ? '2px solid #f59e0b' : '1px solid var(--border-light)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: activeJobsheetIndex === idx ? '#fbbf24' : 'var(--text-main)' }}>
                  {idx + 1}. {sheet.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Material: {sheet.material} • Target Kedalaman: {sheet.targetDepth}mm
                </div>
              </div>
              {activeJobsheetIndex === idx && (
                <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.8rem' }}>AKTIF [OK]</span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowJobsheetModal(false)}
          style={{
            width: '100%', marginTop: '16px', padding: '10px', borderRadius: '8px',
            background: '#f59e0b', color: '#000', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
          }}
        >
          Tutup & Lanjutkan Praktik
        </button>
      </div>
    </div>
  )}
</>
)}
    </div>
  );
};

export default MillingModule;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../utils/audio';
import Lathe3D from './Lathe3D';
import LatheFormulaCalculatorModal from './LatheFormulaCalculatorModal';
import LatheFormulaView from './LatheFormulaView';
import LatheTestView from './LatheTestView';
import LatheVideoDemonstration from './LatheVideoDemonstration';
import { latheJobsheets } from '../data/latheJobsheets';
import { PROFILE_RESOLUTION } from '../utils/latheToolpath';

const LatheModule = ({ addXP }) => {
  const [activeLatheTab, setActiveLatheTab] = useState('pemotongan'); // 'rumus', 'test', 'pemotongan'
  const [cuttingSubMode, setCuttingSubMode] = useState('simulator'); // 'video', 'simulator'
  const [showCalculator, setShowCalculator] = useState(false);
  const [showJobsheetModal, setShowJobsheetModal] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(() => typeof window !== 'undefined' && (window.innerWidth <= 850 || window.innerHeight <= 600));
  const [isPortrait, setIsPortrait] = useState(() => typeof window !== 'undefined' && window.innerHeight > window.innerWidth);
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'
  const [showJobGuide, setShowJobGuide] = useState(true);
  const [activeJobsheetIndex, setActiveJobsheetIndex] = useState(0);
  const activeJobsheet = latheJobsheets[activeJobsheetIndex] || latheJobsheets[0];

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

  const rawDiameter = activeJobsheet.diameter || 50; // mm
  const rawLength = activeJobsheet.length || 100; // mm

  // Machine Parameters
  const [machineMode, setMachineMode] = useState(activeJobsheet.targetMode || 'rata');
  const [rpm, setRpm] = useState(activeJobsheet.targetRpmRange ? activeJobsheet.targetRpmRange[0] : 600);
  const [feedRate, setFeedRate] = useState(0.20);
  const [stepSize, setStepSize] = useState(0.10); // in mm: 0.02, 0.05, 0.10, 0.50, 1.00
  const [rapidMode, setRapidMode] = useState(false);
  const [coolant, setCoolant] = useState(false);

  // Machine Running State
  const [isSpindleRunning, setIsSpindleRunning] = useState(false);
  const isSpindleRef = useRef(false);
  const [isCutting, setIsCutting] = useState(false);
  const [autoFeed, setAutoFeed] = useState(false);

  // Evaluation & Results
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [inspectionData, setInspectionData] = useState(null);

  // Workpiece profile in exact mm (PROFILE_RESOLUTION discrete segments along rawLength)
  // Index 0 is Z = 0 (right edge / tailstock), Index PROFILE_RESOLUTION - 1 is Z = -rawLength (left edge / chuck)
  const initialProfile = Array(PROFILE_RESOLUTION).fill(rawDiameter);
  const [profile, setProfile] = useState(initialProfile);
  const profileRef = useRef([...initialProfile]);
  const lastZRef = useRef(2.0);

  // Tool Position in exact mm:
  // z: longitudinal travel (0 = right end, -100 = near chuck, +2 = clear to the right)
  // d: cross-slide infeed diameter (50.0 = touching raw surface, 48.0 = 1mm depth of cut, 52.0 = backed off)
  const [toolPosition, setToolPosition] = useState({ z: 2.0, d: rawDiameter + 1.0 });
  const toolPosRef = useRef({ z: 2.0, d: rawDiameter + 1.0 });

  // Keep isSpindleRef in sync
  useEffect(() => {
    isSpindleRef.current = isSpindleRunning;
    if (isSpindleRunning) {
      sound.startMotorSound(rpm);
      // Re-check cutting when spindle starts
      applyInstantCut(toolPosRef.current.z, toolPosRef.current.d, true);
    } else {
      sound.stopMotorSound();
      sound.stopCuttingSound();
      setIsCutting(false);
      setAutoFeed(false);
    }

    return () => {
      sound.stopMotorSound();
      sound.stopCuttingSound();
    };
  }, [isSpindleRunning, rpm]);

  // Sync state with Jobsheet changes
  useEffect(() => {
    setMachineMode(activeJobsheet.targetMode);
    if (activeJobsheet.targetRpmRange) {
      setRpm(activeJobsheet.targetRpmRange[0]);
    }
    handleReset();
  }, [activeJobsheetIndex]);

  // INSTANT CUTTING LOGIC - ULTRA-SMOOTH PROFILE & EXACT 90-DEGREE STEPS
  const applyInstantCut = useCallback((currZ, currD, spindleActive = isSpindleRef.current) => {
    // Check if tool tip is along the workpiece length: Z between 0.2mm and -rawLength
    if (currZ <= 0.2 && currZ >= -rawLength) {
      const prevZ = lastZRef.current;
      lastZRef.current = currZ;

      // Direct ratio: currZ = 0 -> index 0, currZ = -rawLength -> index PROFILE_RESOLUTION - 1
      const ratio = Math.max(0, Math.min(1, -currZ / rawLength));
      const targetIdx = Math.round(ratio * (PROFILE_RESOLUTION - 1));

      const prevRatio = Math.max(0, Math.min(1, -prevZ / rawLength));
      const prevIdx = Math.round(prevRatio * (PROFILE_RESOLUTION - 1));

      const currentSegmentDiameter = profileRef.current[targetIdx];

      // If tool diameter is at or cutting into the current profile slice
      if (currD <= currentSegmentDiameter + 0.05) {
        if (spindleActive) {
          // INSTANT CUTTING TRIGGERED
          setIsCutting(true);
          sound.startCuttingSound();

          const updated = [...profileRef.current];

          if (machineMode === 'alur') {
            // Grooving / Parting Mode: tool blade width 3mm
            const halfSpan = Math.max(1, Math.round((1.5 / rawLength) * (PROFILE_RESOLUTION - 1)));
            const minI = Math.max(0, targetIdx - halfSpan);
            const maxI = Math.min(PROFILE_RESOLUTION - 1, targetIdx + halfSpan);
            for (let i = minI; i <= maxI; i++) {
              updated[i] = Math.min(updated[i], currD);
            }
          } else {
            // Turning (Rata) Mode:
            // 1. Cut the swept interval between previous position and current position
            const fromIdx = Math.min(prevIdx, targetIdx);
            const toIdx = Math.max(prevIdx, targetIdx);
            for (let i = fromIdx; i <= toIdx; i++) {
              updated[i] = Math.min(updated[i], currD);
            }

            // 2. In right-hand turning, when feeding left towards the chuck (currZ <= prevZ):
            // All swept material from the face (index 0) up to the current tool tip (targetIdx)
            // is turned down cleanly to currD without leaving any jagged staircases!
            if (currZ <= prevZ) {
              for (let i = 0; i <= targetIdx; i++) {
                if (updated[i] > currD) {
                  updated[i] = currD;
                }
              }
            }
          }

          profileRef.current = updated;
          setProfile(updated);
          return true;
        }
      }
    } else {
      lastZRef.current = currZ;
    }

    // Outside or retracted
    setIsCutting(false);
    sound.stopCuttingSound();
    return false;
  }, [rawLength, machineMode]);

  // Jog handler
  const handleJog = useCallback((axis, dir) => {
    sound.playClick();
    const multiplier = rapidMode ? 3.5 : 1.0;
    const delta = (stepSize || 0.1) * multiplier * dir;

    let newZ = toolPosRef.current.z;
    let newD = toolPosRef.current.d;

    if (axis === 'z') {
      // dir -1: Maju Sayat Kiri (Z- towards chuck)
      // dir +1: Mundur Kanan (Z+ towards tailstock)
      newZ = Math.max(-98.0, Math.min(10.0, newZ + delta));
    } else if (axis === 'x') {
      // dir -1: Masuk Sayat / Makan Diameter (X-)
      // dir +1: Mundur Keluar / Naikkan Diameter (X+)
      newD = Math.max(12.0, Math.min(rawDiameter + 15.0, newD + delta));
    }

    toolPosRef.current = { z: newZ, d: newD };
    setToolPosition({ z: newZ, d: newD });
    applyInstantCut(newZ, newD);
  }, [rapidMode, stepSize, rawDiameter, applyInstantCut]);

  // Continuous Press & Hold Support
  const holdIntervalRef = useRef(null);
  const startHoldJog = (axis, dir) => {
    handleJog(axis, dir);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      handleJog(axis, dir);
    }, 45); // 22 movements per second for smooth glide
  };

  const stopHoldJog = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  // Keyboard Shortcuts (Arrow Keys & Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleJog('z', -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleJog('z', 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleJog('x', -1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleJog('x', 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsSpindleRunning(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJog]);

  // Auto Feed Effect (Z- Feed towards chuck)
  useEffect(() => {
    let timer;
    if (autoFeed && isSpindleRunning) {
      timer = setInterval(() => {
        const step = (feedRate / 20) * (rapidMode ? 2.5 : 1.0);
        const newZ = toolPosRef.current.z - step;

        if (newZ <= -96.0) {
          // Reached end of stock near chuck safety limit
          setAutoFeed(false);
          sound.playTone(400, 'square', 0.2, 0.1);
        } else {
          toolPosRef.current.z = newZ;
          setToolPosition({ ...toolPosRef.current });
          applyInstantCut(newZ, toolPosRef.current.d);
        }
      }, 50);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [autoFeed, isSpindleRunning, feedRate, rapidMode, applyInstantCut]);

  // Spindle Toggle
  const toggleSpindle = () => {
    sound.playClick();
    setIsSpindleRunning(prev => !prev);
  };

  // Reset
  const handleReset = () => {
    sound.playClick();
    setIsSpindleRunning(false);
    setIsCutting(false);
    setAutoFeed(false);
    setShowResult(false);
    stopHoldJog();

    const resetProfile = Array(PROFILE_RESOLUTION).fill(activeJobsheet.diameter || 50);
    profileRef.current = [...resetProfile];
    setProfile(resetProfile);
    lastZRef.current = 2.0;

    const resetPos = { z: 2.0, d: (activeJobsheet.diameter || 50) + 1.0 };
    toolPosRef.current = resetPos;
    setToolPosition(resetPos);

    setScore(0);
    setInspectionData(null);
  };

  // Evaluate Machining
  const handleEvaluate = () => {
    sound.playClick();

    // Check RPM accuracy
    const isRpmCorrect =
      rpm >= activeJobsheet.targetRpmRange[0] && rpm <= activeJobsheet.targetRpmRange[1];

    // Check Mode accuracy
    const isModeCorrect = machineMode === activeJobsheet.targetMode;

    // Check Material cut depth based on activeJobsheet.targetSteps
    let minDiameter = rawDiameter;
    let cutSegmentsCount = 0;
    for (let i = 0; i < profile.length; i++) {
      if (profile[i] < minDiameter) {
        minDiameter = profile[i];
      }
      if (profile[i] < rawDiameter - 0.2) {
        cutSegmentsCount++;
      }
    }

    // Step-by-step target accuracy check
    let allStepsMet = true;
    let partialStepsMet = true;
    let targetSummary = '';

    if (activeJobsheet.targetSteps && activeJobsheet.targetSteps.length > 0) {
      const activeSteps = activeJobsheet.targetSteps.filter(s => !s.label.includes('Cekam') && !s.label.includes('Pencekaman'));
      targetSummary = activeSteps.map(s => s.label).join(' • ');

      for (const st of activeSteps) {
        const i1 = Math.min(profile.length - 1, Math.max(0, Math.round((-st.zStart / rawLength) * (profile.length - 1))));
        const i2 = Math.min(profile.length - 1, Math.max(0, Math.round((-st.zEnd / rawLength) * (profile.length - 1))));
        const sMin = Math.min(i1, i2);
        const sMax = Math.max(i1, i2);
        const slice = profile.slice(sMin, sMax + 1);
        const targetD = st.isTaper ? st.endDia : st.diameter;
        const actualMinD = slice.length > 0 ? Math.min(...slice) : rawDiameter;
        if (Math.abs(actualMinD - targetD) > 1.2) {
          allStepsMet = false;
        }
        if (Math.abs(actualMinD - targetD) > 2.8) {
          partialStepsMet = false;
        }
      }
    } else {
      const targetDiameter = rawDiameter - 4.0;
      allStepsMet = Math.abs(minDiameter - targetDiameter) <= 1.0;
      partialStepsMet = Math.abs(minDiameter - targetDiameter) <= 2.5;
    }

    const minRequiredCutSegments = Math.max(4, Math.round(profile.length * 0.12));
    let calculatedScore = 0;
    if (isModeCorrect && isRpmCorrect && cutSegmentsCount >= minRequiredCutSegments) {
      if (allStepsMet) {
        calculatedScore = 100;
      } else if (partialStepsMet) {
        calculatedScore = 85;
      } else {
        calculatedScore = 70;
      }
      sound.playSuccess();
      if (addXP) addXP(activeJobsheet.xpReward);
    } else if (isModeCorrect && isRpmCorrect) {
      calculatedScore = 65;
    } else if (isModeCorrect) {
      calculatedScore = 40;
    } else {
      calculatedScore = 20;
    }

    setInspectionData({
      rawDiameter: rawDiameter.toFixed(2),
      finalDiameter: minDiameter.toFixed(2),
      targetDiameter: targetSummary || `${(rawDiameter - 4).toFixed(2)} mm`,
      rpmUsed: rpm,
      targetRpm: `${activeJobsheet.targetRpmRange[0]} - ${activeJobsheet.targetRpmRange[1]} RPM`,
      cutSegments: cutSegmentsCount
    });

    setScore(calculatedScore);
    setShowResult(true);
  };

  // Live DRO Display Values
  const droDiameter = toolPosition.d.toFixed(2);
  const droZTravel = toolPosition.z.toFixed(2);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* 3 PILIHAN UTAMA: RUMUS PEMESINAN, SOAL TEST, PROSES PEMOTONGAN */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-card)',
        padding: '12px 18px',
        borderRadius: '14px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.3rem',
            color: '#ffffff'
          }}>
            ⚙️
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
              MODUL MESIN BUBUT (LATHE MACHINE)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Pilih menu pembelajaran pemesinan di bawah ini:
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { sound.playClick(); setActiveLatheTab('rumus'); }}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: activeLatheTab === 'rumus' ? '2px solid #38bdf8' : '1px solid var(--border-light)',
              background: activeLatheTab === 'rumus' ? '#0284c7' : 'transparent',
              color: activeLatheTab === 'rumus' ? '#ffffff' : 'var(--text-main)',
              fontWeight: activeLatheTab === 'rumus' ? 800 : 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: activeLatheTab === 'rumus' ? '0 4px 15px rgba(2, 132, 199, 0.35)' : 'none'
            }}
          >
            <span>📐</span> 1. Rumus Pemesinan
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveLatheTab('test'); }}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: activeLatheTab === 'test' ? '2px solid #f59e0b' : '1px solid var(--border-light)',
              background: activeLatheTab === 'test' ? '#f59e0b' : 'transparent',
              color: activeLatheTab === 'test' ? '#ffffff' : 'var(--text-main)',
              fontWeight: activeLatheTab === 'test' ? 800 : 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: activeLatheTab === 'test' ? '0 4px 15px rgba(245, 158, 11, 0.35)' : 'none'
            }}
          >
            <span>📝</span> 2. Soal Test
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveLatheTab('pemotongan'); }}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: activeLatheTab === 'pemotongan' ? '2px solid #10b981' : '1px solid var(--border-light)',
              background: activeLatheTab === 'pemotongan' ? '#10b981' : 'transparent',
              color: activeLatheTab === 'pemotongan' ? '#ffffff' : 'var(--text-main)',
              fontWeight: activeLatheTab === 'pemotongan' ? 800 : 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: activeLatheTab === 'pemotongan' ? '0 4px 15px rgba(16, 185, 129, 0.35)' : 'none'
            }}
          >
            <span>⚙️</span> 3. Proses Pemotongan
          </button>
        </div>
      </div>

      {/* 1. RUMUS PEMESINAN */}
      {activeLatheTab === 'rumus' && (
        <LatheFormulaView
          initialDiameter={rawDiameter}
          initialLength={rawLength}
          currentRpm={rpm}
          materialName={activeJobsheet.material}
          onApplyRpm={(newRpm) => {
            setRpm(newRpm);
          }}
          onGoToCutting={() => setActiveLatheTab('pemotongan')}
        />
      )}

      {/* 2. SOAL TEST */}
      {activeLatheTab === 'test' && (
        <LatheTestView
          addXP={addXP}
          onStartPractical={() => setActiveLatheTab('pemotongan')}
        />
      )}

      {/* 3. PROSES PEMOTONGAN */}
      {activeLatheTab === 'pemotongan' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* SUB-TABS: VIDEO DEMONSTRASI VS SIMULATOR 3D */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'var(--bg-card)',
            padding: '10px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>⚙️</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                TAMPILAN PROSES PEMOTONGAN:
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { sound.playClick(); setCuttingSubMode('video'); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: cuttingSubMode === 'video' ? '2px solid #38bdf8' : '1px solid var(--border-light)',
                  background: cuttingSubMode === 'video' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: cuttingSubMode === 'video' ? '#38bdf8' : 'var(--text-muted)',
                  fontWeight: cuttingSubMode === 'video' ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🎬</span> Video Demonstrasi Pemotongan
              </button>

              <button
                onClick={() => { sound.playClick(); setCuttingSubMode('simulator'); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: cuttingSubMode === 'simulator' ? '2px solid #10b981' : '1px solid var(--border-light)',
                  background: cuttingSubMode === 'simulator' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: cuttingSubMode === 'simulator' ? '#10b981' : 'var(--text-muted)',
                  fontWeight: cuttingSubMode === 'simulator' ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🎮</span> Simulator Praktik 3D Interaktif
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: VIDEO DEMONSTRASI (LANDSCAPE PENUH) */}
          {cuttingSubMode === 'video' && (
            <LatheVideoDemonstration onSwitchToSimulator={() => setCuttingSubMode('simulator')} />
          )}

          {/* SUB-VIEW 2: SIMULATOR 3D PRAKTIK */}
          {cuttingSubMode === 'simulator' && (
            <>
              {isMobileMode ? (
                /* ==============================================================
                   MOBILE GAME COCKPIT: AUTO-ADAPTIVE (PORTRAIT & LANDSCAPE)
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
                       LAYOUT 1: HP MODE TEGAK (PORTRAIT)
                       - Top HUD 2-Baris Ramping (DRO + RPM + 5 Job Selector)
                       - Middle Viewport Canvas Lega & Jernih (Bebas dari sentuhan)
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
                        {/* BARIS 1: DRO READOUTS + SPINDLE RPM + DESKTOP BUTTON */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {/* DRO X */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(4, 9, 20, 0.85)', padding: '2px 5px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 800 }}>X:</span>
                              <span style={{ fontSize: '0.80rem', fontFamily: 'monospace', fontWeight: 900, color: '#10b981' }}>Ø{droDiameter}</span>
                              <button
                                onClick={() => {
                                  sound.playClick();
                                  toolPosRef.current.d = rawDiameter;
                                  setToolPosition({ ...toolPosRef.current });
                                  applyInstantCut(toolPosRef.current.z, rawDiameter);
                                }}
                                style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#94a3b8', fontSize: '0.52rem', padding: '1px 3px', borderRadius: '2px', cursor: 'pointer', fontWeight: 800 }}
                                title="Sentuh Diameter Awal"
                              >
                                0
                              </button>
                            </div>

                            {/* DRO Z */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(4, 9, 20, 0.85)', padding: '2px 5px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 800 }}>Z:</span>
                              <span style={{ fontSize: '0.80rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}>{droZTravel}</span>
                              <button
                                onClick={() => {
                                  sound.playClick();
                                  toolPosRef.current.z = 0;
                                  setToolPosition({ ...toolPosRef.current });
                                  applyInstantCut(0, toolPosRef.current.d);
                                }}
                                style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#94a3b8', fontSize: '0.52rem', padding: '1px 3px', borderRadius: '2px', cursor: 'pointer', fontWeight: 800 }}
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
                              <span>{isSpindleRunning ? '🟢' : '🔴'}</span>
                              <span>{rpm} RPM</span>
                              {isCutting && <span style={{ color: '#f59e0b', fontSize: '0.62rem' }}>⚡</span>}
                            </div>

                            <button
                              onClick={() => { sound.playClick(); setIsMobileMode(false); }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff',
                                padding: '2px 5px', borderRadius: '5px', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer'
                              }}
                              title="Beralih ke Tampilan Desktop Penuh"
                            >
                              🖥️
                            </button>
                          </div>
                        </div>

                        {/* BARIS 2: 2D/3D + GARIS JOB + QUICK 5 JOBS SELECTOR + KALKULATOR */}
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
                              title="Beralih antara Mode 3D dan Mode 2D Teknik"
                            >
                              {viewMode === '3d' ? '📐 2D' : '🎮 3D'}
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
                              title="Tampilkan / Sembunyikan Garis Target Job"
                            >
                              <span>🎯</span>
                              <span>JOB</span>
                            </button>
                          </div>

                          {/* QUICK 5 JOBS SELECTOR KODE ANGKA (PORTRAIT) */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.35)', padding: '2px 4px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#94a3b8' }}>JOB:</span>
                            {latheJobsheets.map((sheet, idx) => (
                              <button
                                key={sheet.id}
                                onClick={() => { sound.playClick(); setActiveJobsheetIndex(idx); }}
                                style={{
                                  minWidth: '22px', height: '20px', padding: '0 2px', borderRadius: '3px',
                                  fontSize: '0.66rem', fontWeight: 900, cursor: 'pointer',
                                  background: activeJobsheetIndex === idx ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
                                  color: activeJobsheetIndex === idx ? '#ffffff' : '#94a3b8',
                                  border: activeJobsheetIndex === idx ? '1px solid #38bdf8' : 'none',
                                  boxShadow: activeJobsheetIndex === idx ? '0 0 6px rgba(56, 189, 248, 0.4)' : 'none'
                                }}
                                title={`Tugas ${idx + 1}: ${sheet.title}`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => { sound.playClick(); setShowCalculator(true); }}
                            style={{
                              background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', color: '#10b981',
                              padding: '2px 6px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer'
                            }}
                            title="Buka Kalkulator Rumus"
                          >
                            🧮
                          </button>
                        </div>
                      </div>

                      {/* 2. MIDDLE VIEWPORT CANVAS (LEGA, TIDAK TERTUTUP TOMBOL) */}
                      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden', background: '#0b1120' }}>
                        <Lathe3D
                          isRunning={isSpindleRunning}
                          toolPosition={toolPosition}
                          profile={profile}
                          machineMode={machineMode}
                          toolType={machineMode === 'alur' ? 'alur' : 'rata'}
                          rawDiameter={rawDiameter}
                          rawLength={rawLength}
                          rpm={rpm}
                          isCutting={isCutting}
                          coolant={coolant}
                          showTailstock={true}
                          viewMode={viewMode}
                          onToggleViewMode={setViewMode}
                          activeJobsheet={activeJobsheet}
                          showJobGuide={showJobGuide}
                          onToggleJobGuide={() => setShowJobGuide(v => !v)}
                          hideInternalToggle={true}
                        />

                        {/* AUTO-HINT BADGE (PORTRAIT) */}
                        <div style={{
                          position: 'absolute', bottom: '6px', right: '8px', zIndex: 10,
                          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
                          border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px',
                          padding: '3px 8px', fontSize: '0.58rem', fontWeight: 700, color: '#94a3b8',
                          display: 'flex', alignItems: 'center', gap: '4px', pointerEvents: 'none'
                        }}>
                          <span>📲</span>
                          <span>Miringkan HP untuk Layar Penuh</span>
                        </div>
                      </div>

                      {/* 3. BOTTOM ERGONOMIC CONTROL DECK (PORTRAIT) */}
                      <div style={{
                        flexShrink: 0,
                        background: 'rgba(11, 17, 32, 0.94)',
                        backdropFilter: 'blur(10px)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '6px 8px',
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr 115px',
                        gap: '6px',
                        alignItems: 'center',
                        boxSizing: 'border-box',
                        boxShadow: '0 -4px 16px rgba(0,0,0,0.5)'
                      }}>
                        {/* LEFT THUMB: CROSS D-PAD */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', gridTemplateRows: 'repeat(3, 36px)', gap: '4px', justifySelf: 'center', userSelect: 'none' }}>
                          <div />
                          {/* ▲ X+ (Mundur Luar) */}
                          <button
                            className="game-dpad-btn"
                            onMouseDown={() => startHoldJog('x', 1)}
                            onMouseUp={stopHoldJog}
                            onMouseLeave={stopHoldJog}
                            onTouchStart={() => startHoldJog('x', 1)}
                            onTouchEnd={stopHoldJog}
                            style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                            title="X+ (Mundur Luar)"
                          >
                            ▲<span style={{ fontSize: '0.5rem', lineHeight: 1 }}>X+</span>
                          </button>
                          <div />

                          {/* ◀ Z- (Sayat Kiri ke Chuck) */}
                          <button
                            className="game-dpad-btn"
                            onMouseDown={() => startHoldJog('z', -1)}
                            onMouseUp={stopHoldJog}
                            onMouseLeave={stopHoldJog}
                            onTouchStart={() => startHoldJog('z', -1)}
                            onTouchEnd={stopHoldJog}
                            style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                            title="Z- (Sayat Kiri)"
                          >
                            ◀<span style={{ fontSize: '0.5rem', lineHeight: 1 }}>Z-</span>
                          </button>

                          {/* CENTER: AUTO FEED */}
                          <button
                            className="game-dpad-btn"
                            onClick={() => {
                              if (!isSpindleRunning) {
                                sound.playError();
                                alert('Nyalakan spindel dulu!');
                                return;
                              }
                              sound.playClick();
                              setAutoFeed(!autoFeed);
                            }}
                            style={{
                              background: autoFeed ? '#10b981' : 'rgba(15, 23, 42, 0.75)',
                              border: autoFeed ? 'none' : '1px solid rgba(255,255,255,0.2)',
                              color: autoFeed ? '#000' : '#cbd5e1', fontSize: '0.58rem',
                              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
                            }}
                          >
                            AUTO
                          </button>

                          {/* ▶ Z+ (Mundur Kanan) */}
                          <button
                            className="game-dpad-btn"
                            onMouseDown={() => startHoldJog('z', 1)}
                            onMouseUp={stopHoldJog}
                            onMouseLeave={stopHoldJog}
                            onTouchStart={() => startHoldJog('z', 1)}
                            onTouchEnd={stopHoldJog}
                            style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                            title="Z+ (Mundur Kanan)"
                          >
                            ▶<span style={{ fontSize: '0.5rem', lineHeight: 1 }}>Z+</span>
                          </button>

                          <div />
                          {/* ▼ X- (Makan Masuk Diameter) */}
                          <button
                            className="game-dpad-btn"
                            onMouseDown={() => startHoldJog('x', -1)}
                            onMouseUp={stopHoldJog}
                            onMouseLeave={stopHoldJog}
                            onTouchStart={() => startHoldJog('x', -1)}
                            onTouchEnd={stopHoldJog}
                            style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #f59e0b', color: '#f59e0b', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                            title="X- (Makan Potong Ø)"
                          >
                            ▼<span style={{ fontSize: '0.5rem', lineHeight: 1 }}>X-</span>
                          </button>
                          <div />
                        </div>

                        {/* CENTER COLUMN: STEP & MODIFIERS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 4px', height: '100%', justifyContent: 'center' }}>
                          {/* Step Selector */}
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {[0.02, 0.05, 0.10, 0.50].map((v) => (
                              <button
                                key={v}
                                onClick={() => { sound.playClick(); setStepSize(v); }}
                                style={{
                                  flex: 1, padding: '5px 0', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer',
                                  background: stepSize === v ? '#10b981' : 'rgba(15, 23, 42, 0.75)',
                                  color: stepSize === v ? '#000' : '#cbd5e1',
                                  border: stepSize === v ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                                }}
                              >
                                {v}
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
                              ⚡ RAPID
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
                              💦 {coolant ? 'ON' : 'OFF'}
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
                              🏆 CEK
                            </button>
                            <button
                              onClick={handleReset}
                              style={{
                                flex: 0.8, padding: '5px 2px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                                background: 'rgba(15, 23, 42, 0.75)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                              }}
                            >
                              🔄 RESET
                            </button>
                          </div>
                        </div>

                        {/* RIGHT THUMB: POWER SPINDLE & RPM */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', height: '100%', justifyContent: 'center' }}>
                          <button
                            className="game-action-btn"
                            onClick={toggleSpindle}
                            style={{
                              height: '58px', width: '100%',
                              background: isSpindleRunning
                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff', border: 'none',
                              boxShadow: isSpindleRunning ? '0 0 16px rgba(239, 68, 68, 0.5)' : '0 0 16px rgba(16, 185, 129, 0.5)',
                              fontSize: '0.78rem'
                            }}
                          >
                            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{isSpindleRunning ? '⏹' : '▶'}</span>
                            <span>{isSpindleRunning ? 'STOP' : 'START'}</span>
                          </button>

                          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.75)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                            <button
                              onClick={() => { sound.playClick(); setRpm(prev => Math.max(150, prev - 150)); }}
                              style={{ width: '28px', height: '24px', background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              -
                            </button>
                            <div style={{ flex: 1, textAlign: 'center', fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8' }}>
                              {rpm}
                            </div>
                            <button
                              onClick={() => { sound.playClick(); setRpm(prev => Math.min(1500, prev + 150)); }}
                              style={{ width: '28px', height: '24px', background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 900, cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* -----------------------------------------------------------
                       LAYOUT 2: HP MODE MIRING / LANDSCAPE (GAME COCKPIT FULLSCREEN)
                       - 100% Fullscreen Viewport di belakang
                       - Floating Top Glass HUD
                       - Bottom Floating Virtual Gamepad Dua Jempol
                       ----------------------------------------------------------- */
                    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden', background: '#0b1120' }}>
                      <Lathe3D
                        isRunning={isSpindleRunning}
                        toolPosition={toolPosition}
                        profile={profile}
                        machineMode={machineMode}
                        toolType={machineMode === 'alur' ? 'alur' : 'rata'}
                        rawDiameter={rawDiameter}
                        rawLength={rawLength}
                        rpm={rpm}
                        isCutting={isCutting}
                        coolant={coolant}
                        showTailstock={true}
                        viewMode={viewMode}
                        onToggleViewMode={setViewMode}
                        activeJobsheet={activeJobsheet}
                        showJobGuide={showJobGuide}
                        onToggleJobGuide={() => setShowJobGuide(v => !v)}
                        hideInternalToggle={true}
                      />

                      {/* FLOATING TOP GLASS HUD (LANDSCAPE) */}
                      <div style={{
                        position: 'absolute', top: '6px', left: '8px', right: '8px', zIndex: 30,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(10px)',
                        padding: '4px 8px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
                      }}>
                        {/* DRO READOUTS */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(4, 9, 20, 0.85)', padding: '2px 5px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 800 }}>X:</span>
                            <span style={{ fontSize: '0.80rem', fontFamily: 'monospace', fontWeight: 900, color: '#10b981' }}>Ø{droDiameter}</span>
                            <button
                              onClick={() => {
                                sound.playClick();
                                toolPosRef.current.d = rawDiameter;
                                setToolPosition({ ...toolPosRef.current });
                                applyInstantCut(toolPosRef.current.z, rawDiameter);
                              }}
                              style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#94a3b8', fontSize: '0.55rem', padding: '1px 4px', borderRadius: '3px', cursor: 'pointer', fontWeight: 800 }}
                              title="Sentuh Diameter Awal"
                            >
                              0
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(4, 9, 20, 0.85)', padding: '2px 5px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 800 }}>Z:</span>
                            <span style={{ fontSize: '0.80rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}>{droZTravel}</span>
                            <button
                              onClick={() => {
                                sound.playClick();
                                toolPosRef.current.z = 0;
                                setToolPosition({ ...toolPosRef.current });
                                applyInstantCut(0, toolPosRef.current.d);
                              }}
                              style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#94a3b8', fontSize: '0.55rem', padding: '1px 4px', borderRadius: '3px', cursor: 'pointer', fontWeight: 800 }}
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
                          <span>{isSpindleRunning ? '🟢' : '🔴'}</span>
                          <span>{rpm} RPM</span>
                          {isCutting && <span style={{ color: '#f59e0b', fontSize: '0.65rem' }}>⚡</span>}
                        </div>

                        {/* QUICK MENU BUTTONS & 5 JOBS SELECTOR (LANDSCAPE) */}
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
                            title="Beralih antara Mode 3D dan Mode 2D Teknik"
                          >
                            <span>{viewMode === '3d' ? '📐 2D' : '🎮 3D'}</span>
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
                            title="Tampilkan / Sembunyikan Garis Target Job"
                          >
                            <span>🎯</span>
                            <span>JOB</span>
                          </button>

                          {/* 5 JOBS SELECTOR KODE ANGKA (LANDSCAPE) */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontSize: '0.60rem', fontWeight: 800, color: '#94a3b8' }}>JOB:</span>
                            {latheJobsheets.map((sheet, idx) => (
                              <button
                                key={sheet.id}
                                onClick={() => { sound.playClick(); setActiveJobsheetIndex(idx); }}
                                style={{
                                  minWidth: '22px', height: '20px', padding: '0 2px', borderRadius: '3px',
                                  fontSize: '0.66rem', fontWeight: 900, cursor: 'pointer',
                                  background: activeJobsheetIndex === idx ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
                                  color: activeJobsheetIndex === idx ? '#ffffff' : '#94a3b8',
                                  border: activeJobsheetIndex === idx ? '1px solid #38bdf8' : 'none',
                                  boxShadow: activeJobsheetIndex === idx ? '0 0 6px rgba(56, 189, 248, 0.4)' : 'none'
                                }}
                                title={`Tugas ${idx + 1}: ${sheet.title}`}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() => { sound.playClick(); setShowCalculator(true); }}
                            style={{
                              background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', color: '#10b981',
                              padding: '3px 6px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 800, cursor: 'pointer'
                            }}
                            title="Buka Kalkulator Rumus"
                          >
                            🧮
                          </button>

                          <button
                            onClick={() => { sound.playClick(); setIsMobileMode(false); }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff',
                              padding: '3px 6px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 700, cursor: 'pointer'
                            }}
                            title="Beralih ke Tampilan Desktop Penuh"
                          >
                            🖥️
                          </button>
                        </div>
                      </div>

                      {/* BOTTOM FLOATING VIRTUAL GAMEPAD (LANDSCAPE) */}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, pointerEvents: 'none',
                        height: '190px',
                        background: 'linear-gradient(to top, rgba(2, 6, 23, 0.70) 0%, rgba(2, 6, 23, 0.15) 70%, transparent 100%)',
                        padding: '6px 8px', display: 'grid', gridTemplateColumns: '120px 1fr 120px', gap: '6px',
                        alignItems: 'center', boxSizing: 'border-box'
                      }}>
                        {/* LEFT THUMB: CROSS D-PAD */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', gridTemplateRows: 'repeat(3, 36px)', gap: '4px', justifySelf: 'center', userSelect: 'none', pointerEvents: 'auto' }}>
                          <div />
                          <button
                            className="game-dpad-btn"
                            onMouseDown={() => startHoldJog('x', 1)}
                            onMouseUp={stopHoldJog}
                            onMouseLeave={stopHoldJog}
                            onTouchStart={() => startHoldJog('x', 1)}
                            onTouchEnd={stopHoldJog}
                            style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                            title="X+ (Mundur Luar)"
                          >
                            ▲<span style={{ fontSize: '0.5rem', lineHeight: 1 }}>X+</span>
                          </button>
                          <div />

                          <button
                            className="game-dpad-btn"
                            onMouseDown={() => startHoldJog('z', -1)}
                            onMouseUp={stopHoldJog}
                            onMouseLeave={stopHoldJog}
                            onTouchStart={() => startHoldJog('z', -1)}
                            onTouchEnd={stopHoldJog}
                            style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                            title="Z- (Sayat Kiri)"
                          >
                            ◀<span style={{ fontSize: '0.5rem', lineHeight: 1 }}>Z-</span>
                          </button>

                          <button
                            className="game-dpad-btn"
                            onClick={() => {
                              if (!isSpindleRunning) {
                                sound.playError();
                                alert('Nyalakan spindel dulu!');
                                return;
                              }
                              sound.playClick();
                              setAutoFeed(!autoFeed);
                            }}
                            style={{
                              background: autoFeed ? '#10b981' : 'rgba(15, 23, 42, 0.75)',
                              border: autoFeed ? 'none' : '1px solid rgba(255,255,255,0.2)',
                              color: autoFeed ? '#000' : '#cbd5e1', fontSize: '0.58rem',
                              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
                            }}
                          >
                            AUTO
                          </button>

                          <button
                            className="game-dpad-btn"
                            onMouseDown={() => startHoldJog('z', 1)}
                            onMouseUp={stopHoldJog}
                            onMouseLeave={stopHoldJog}
                            onTouchStart={() => startHoldJog('z', 1)}
                            onTouchEnd={stopHoldJog}
                            style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #0284c7', color: '#38bdf8', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                            title="Z+ (Mundur Kanan)"
                          >
                            ▶<span style={{ fontSize: '0.5rem', lineHeight: 1 }}>Z+</span>
                          </button>

                          <div />
                          <button
                            className="game-dpad-btn"
                            onMouseDown={() => startHoldJog('x', -1)}
                            onMouseUp={stopHoldJog}
                            onMouseLeave={stopHoldJog}
                            onTouchStart={() => startHoldJog('x', -1)}
                            onTouchEnd={stopHoldJog}
                            style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid #f59e0b', color: '#f59e0b', fontSize: '0.68rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                            title="X- (Makan Potong Ø)"
                          >
                            ▼<span style={{ fontSize: '0.5rem', lineHeight: 1 }}>X-</span>
                          </button>
                          <div />
                        </div>

                        {/* CENTER COLUMN: STEP & MODIFIERS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 4px', height: '100%', justifyContent: 'center', pointerEvents: 'auto' }}>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {[0.02, 0.05, 0.10, 0.50].map((v) => (
                              <button
                                key={v}
                                onClick={() => { sound.playClick(); setStepSize(v); }}
                                style={{
                                  flex: 1, padding: '5px 0', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800, cursor: 'pointer',
                                  background: stepSize === v ? '#10b981' : 'rgba(15, 23, 42, 0.75)',
                                  color: stepSize === v ? '#000' : '#cbd5e1',
                                  border: stepSize === v ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                                }}
                              >
                                {v}
                              </button>
                            ))}
                          </div>

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
                              ⚡ RAPID
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
                              💦 {coolant ? 'ON' : 'OFF'}
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={handleEvaluate}
                              style={{
                                flex: 1.3, padding: '5px 2px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer',
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', border: 'none',
                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                              }}
                            >
                              🏆 CEK HASIL
                            </button>
                            <button
                              onClick={handleReset}
                              style={{
                                flex: 0.8, padding: '5px 2px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                                background: 'rgba(15, 23, 42, 0.75)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
                              }}
                            >
                              🔄 RESET
                            </button>
                          </div>
                        </div>

                        {/* RIGHT THUMB: POWER SPINDLE & RPM */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', height: '100%', justifyContent: 'center', pointerEvents: 'auto' }}>
                          <button
                            className="game-action-btn"
                            onClick={toggleSpindle}
                            style={{
                              height: '62px', width: '100%',
                              background: isSpindleRunning
                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff', border: 'none',
                              boxShadow: isSpindleRunning ? '0 0 16px rgba(239, 68, 68, 0.5)' : '0 0 16px rgba(16, 185, 129, 0.5)',
                              fontSize: '0.78rem'
                            }}
                          >
                            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{isSpindleRunning ? '⏹' : '▶'}</span>
                            <span>{isSpindleRunning ? 'STOP' : 'START'}</span>
                          </button>

                          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.75)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                            <button
                              onClick={() => { sound.playClick(); setRpm(prev => Math.max(150, prev - 150)); }}
                              style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                              -
                            </button>
                            <div style={{ flex: 1, textAlign: 'center', fontSize: '0.68rem', fontWeight: 800, color: '#38bdf8' }}>
                              {rpm}
                            </div>
                            <button
                              onClick={() => { sound.playClick(); setRpm(prev => Math.min(1500, prev + 150)); }}
                              style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem' }}
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
                          background: 'rgba(2, 132, 199, 0.15)',
                          border: '1px solid #0284c7',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontSize: '1.2rem'
                        }}
                      >
                        ⚙️
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          SIMULATOR MESIN BUBUT KONVENSIONAL
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Tugas Aktif: <strong style={{ color: '#0284c7' }}>{activeJobsheet.title}</strong> ({activeJobsheet.material})
                        </div>
                      </div>
                    </div>

                    {/* ACTION CONTROLS & COMPACT JOB SELECTOR */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                      {/* BARIS ATAS: MODE CONTROLS */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* 2D / 3D VIEW TOGGLE BUTTON (DESKTOP) */}
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
                          title="Beralih antara Mode 3D Studio dan Mode 2D Teknik"
                        >
                          <span>{viewMode === '3d' ? '📐 MODE 2D TEKNIK' : '🎮 MODE 3D STUDIO'}</span>
                        </button>

                        {/* GARIS TARGET JOB (BLUEPRINT) TOGGLE BUTTON */}
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
                          title="Tampilkan / Sembunyikan Garis Target Blueprint Jobsheet Bubut"
                        >
                          <span>🎯</span>
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
                          <span>🎮</span>
                          <span>MODE GAME HP</span>
                        </button>

                        <button
                          onClick={() => { sound.playClick(); setShowCalculator(true); }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            color: '#ffffff',
                            border: '1px solid #38bdf8',
                            boxShadow: '0 0 12px rgba(56, 189, 248, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                          }}
                          title="Buka Bank Rumus & Kalkulator Interaktif Bubut"
                        >
                          <span>🧮</span>
                          <span>RUMUS & KALKULATOR</span>
                        </button>
                      </div>

                      {/* BARIS BAWAH: PILIHAN 5 JOB DENGAN KODE ANGKA RINGKAS */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                          PILIH JOB:
                        </span>
                        <div style={{ display: 'flex', gap: '6px', background: 'rgba(0, 0, 0, 0.2)', padding: '3px 5px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                          {latheJobsheets.map((sheet, idx) => (
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
                                background: activeJobsheetIndex === idx ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(255,255,255,0.05)',
                                color: activeJobsheetIndex === idx ? '#ffffff' : 'var(--text-muted)',
                                border: activeJobsheetIndex === idx ? '1px solid #38bdf8' : '1px solid transparent',
                                boxShadow: activeJobsheetIndex === idx ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
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
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#38bdf8', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Job {activeJobsheetIndex + 1}: {activeJobsheet.title.split('(')[0].trim()}
                        </span>
                      </div>
                    </div>
                  </div>

      {/* MAIN 3D SIMULATOR VIEWPORT - FULLY UNOBSTRUCTED & RESPONSIVE */}
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
        <Lathe3D
          isRunning={isSpindleRunning}
          toolPosition={toolPosition}
          profile={profile}
          machineMode={machineMode}
          toolType={machineMode === 'alur' ? 'alur' : 'rata'}
          rawDiameter={rawDiameter}
          rawLength={rawLength}
          rpm={rpm}
          isCutting={isCutting}
          coolant={coolant}
          showTailstock={true}
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
          background: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>⌨️ KONTROL TOMBOL KEYBOARD:</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>◀</kbd> Z- (Sayat Kiri)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>▶</kbd> Z+ (Mundur Kanan)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>▼</kbd> X- (Makan Ø)</span>
          <span><kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>▲</kbd> X+ (Mundur Luar)</span>
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
        {/* PANEL 1: SPINDLE & POWER */}
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
            1. DAYA & SPINDEL
          </div>

          {/* Spindle Start / Stop Big Button */}
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

          {/* RPM Preset Buttons */}
          <div>
            <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>KECEPATAN SPINDEL</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ color: '#38bdf8' }}>{rpm} RPM</strong>
                <button
                  onClick={() => { sound.playClick(); setShowCalculator(true); }}
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid #38bdf8',
                    color: '#38bdf8',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="Hitung RPM Sesuai Rumus Bubut"
                >
                  <span>🧮</span> Rumus
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {[150, 300, 450, 600, 900, 1200].map(val => (
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
              border: coolant ? '1px solid #0284c7' : '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            💦 PENDINGIN (COOLANT): {coolant ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* PANEL 2: DIGITAL READOUT (DRO) */}
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
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>
            2. DIGITAL READOUT (DRO)
          </div>

          {/* DRO X (DIAMETER) */}
          <div
            style={{
              background: '#040914',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>SUMBU X (DIAMETER AKTUAL)</div>
              <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 800, color: '#10b981' }}>
                Ø {droDiameter} <span style={{ fontSize: '0.7rem' }}>mm</span>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                toolPosRef.current.d = rawDiameter;
                setToolPosition({ ...toolPosRef.current });
                applyInstantCut(toolPosRef.current.z, rawDiameter);
              }}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              SENTUH Ø
            </button>
          </div>

          {/* DRO Z (LENGTH) */}
          <div
            style={{
              background: '#040914',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>SUMBU Z (POSISI MEMANJANG)</div>
              <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 800, color: '#38bdf8' }}>
                {droZTravel} <span style={{ fontSize: '0.7rem' }}>mm</span>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                toolPosRef.current.z = 0;
                setToolPosition({ ...toolPosRef.current });
                applyInstantCut(0, toolPosRef.current.d);
              }}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ZERO Z
            </button>
          </div>

          {/* STEP RESOLUTION SELECTOR */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
              STEP NONIUS PER KLIK:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              {[
                { label: '0.02', val: 0.02 },
                { label: '0.05', val: 0.05 },
                { label: '0.10', val: 0.10 },
                { label: '0.50', val: 0.50 }
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

        {/* PANEL 3: JOGGING DIRECTION CONTROL (D-PAD WITH HOLD & CLICK) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div className="flex-between" style={{ width: '100%', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>
              3. ARAH JOGGING PAHAT
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
              ⚡ RAPID: {rapidMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* D-Pad Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 85px)', gap: '8px', margin: 'auto' }}>
            <div />
            {/* X+ (Mundur Luar) */}
            <button
              onMouseDown={() => startHoldJog('x', 1)}
              onMouseUp={stopHoldJog}
              onMouseLeave={stopHoldJog}
              onTouchStart={() => startHoldJog('x', 1)}
              onTouchEnd={stopHoldJog}
              style={{
                height: '42px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid #0284c7',
                color: '#38bdf8',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.05s',
                userSelect: 'none'
              }}
            >
              <span>▲ X+</span>
              <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>Mundur Luar</span>
            </button>
            <div />

            {/* Z- (Sayat Kiri ke Chuck) */}
            <button
              onMouseDown={() => startHoldJog('z', -1)}
              onMouseUp={stopHoldJog}
              onMouseLeave={stopHoldJog}
              onTouchStart={() => startHoldJog('z', -1)}
              onTouchEnd={stopHoldJog}
              style={{
                height: '42px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#10b981',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.05s',
                userSelect: 'none'
              }}
            >
              <span>◀ Z-</span>
              <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>Sayat Kiri</span>
            </button>

            {/* Center Status / Auto Feed button */}
            <button
              onClick={() => {
                if (!isSpindleRunning) {
                  sound.playError();
                  alert('Nyalakan spindel terlebih dahulu sebelum mengaktifkan gerak makan otomatis!');
                  return;
                }
                sound.playClick();
                setAutoFeed(!autoFeed);
              }}
              style={{
                height: '42px',
                background: autoFeed ? '#10b981' : 'rgba(255,255,255,0.06)',
                border: autoFeed ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: autoFeed ? '#000' : 'var(--text-main)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.65rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                userSelect: 'none'
              }}
            >
              <span>AUTO</span>
              <span style={{ fontSize: '0.55rem' }}>{autoFeed ? 'ON' : 'OFF'}</span>
            </button>

            {/* Z+ (Mundur Kanan ke Tailstock) */}
            <button
              onMouseDown={() => startHoldJog('z', 1)}
              onMouseUp={stopHoldJog}
              onMouseLeave={stopHoldJog}
              onTouchStart={() => startHoldJog('z', 1)}
              onTouchEnd={stopHoldJog}
              style={{
                height: '42px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid #0284c7',
                color: '#38bdf8',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.05s',
                userSelect: 'none'
              }}
            >
              <span>Z+ ▶</span>
              <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>Mundur Kanan</span>
            </button>

            <div />
            {/* X- (Masuk Kedalaman / Potong) */}
            <button
              onMouseDown={() => startHoldJog('x', -1)}
              onMouseUp={stopHoldJog}
              onMouseLeave={stopHoldJog}
              onTouchStart={() => startHoldJog('x', -1)}
              onTouchEnd={stopHoldJog}
              style={{
                height: '42px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid #f59e0b',
                color: '#f59e0b',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.05s',
                userSelect: 'none'
              }}
            >
              <span>▼ X-</span>
              <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>Makan Ø</span>
            </button>
            <div />
          </div>
        </div>

        {/* PANEL 4: EVALUASI & RESET */}
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
              4. HASIL & JOBSHEET
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Target: <strong style={{ color: '#f59e0b' }}>{activeJobsheet.desc}</strong>
              <br />
              RPM Sesuai: <strong style={{ color: '#10b981' }}>{activeJobsheet.targetRpmRange[0]} - {activeJobsheet.targetRpmRange[1]}</strong>
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
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
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
              🔄 RESET BENDA KERJA
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
                {score >= 80 ? '✓ JOBSHEET SELESAI DENGAN BAIK' : '⚠ PERLU PERBAIKAN TEKNIK BUBUT'}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
                Laporan Hasil Inspeksi Metrologi Pahat & Benda Kerja
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
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DIAMETER AWAL</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Ø {inspectionData.rawDiameter} mm</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DIAMETER MINIMAL TERKECIL</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>Ø {inspectionData.finalDiameter} mm</div>
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
                background: '#0284c7',
                border: 'none',
                color: '#fff',
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
            {score >= 80 ? '✓ TUGAS BUBUT SUKSES' : '⚠ PERLU PERBAIKAN'}
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: score >= 80 ? '#10b981' : '#ef4444' }}>
            {score}/100
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ø AWAL</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Ø {inspectionData.rawDiameter} mm</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Ø MINIMAL TERKECIL</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>Ø {inspectionData.finalDiameter} mm</div>
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
            background: '#0284c7', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer'
          }}
        >
          Lanjutkan Praktik
        </button>
      </div>
    </div>
  )}

  {/* JOBSHEET SELECTION MODAL (MOBILE GAME MODE) */}
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
            <span style={{ fontSize: '1.3rem' }}>📋</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
              PILIH TUGAS / JOBSHEET BUBUT
            </span>
          </div>
          <button
            onClick={() => setShowJobsheetModal(false)}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '1.1rem', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {latheJobsheets.map((sheet, idx) => (
            <div
              key={sheet.id}
              onClick={() => {
                sound.playClick();
                setActiveJobsheetIndex(idx);
                setShowJobsheetModal(false);
              }}
              style={{
                padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                background: activeJobsheetIndex === idx ? 'rgba(2, 132, 199, 0.18)' : 'rgba(255,255,255,0.03)',
                border: activeJobsheetIndex === idx ? '2px solid #0284c7' : '1px solid var(--border-light)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: activeJobsheetIndex === idx ? '#38bdf8' : 'var(--text-main)' }}>
                  {idx + 1}. {sheet.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Material: {sheet.material} • Ø Awal: {sheet.diameter}mm • Target: {sheet.desc}
                </div>
              </div>
              {activeJobsheetIndex === idx && (
                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.8rem' }}>AKTIF ✓</span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowJobsheetModal(false)}
          style={{
            width: '100%', marginTop: '16px', padding: '10px', borderRadius: '8px',
            background: '#0284c7', color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer'
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
)}

      {/* FORMULA & CALCULATOR MODAL */}
      <LatheFormulaCalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        initialDiameter={rawDiameter}
        initialLength={rawLength}
        currentRpm={rpm}
        materialName={activeJobsheet.material}
        onApplyRpm={(newRpm) => {
          setRpm(newRpm);
        }}
      />
    </div>
  );
};

export default LatheModule;

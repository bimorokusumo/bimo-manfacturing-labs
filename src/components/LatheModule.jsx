import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../utils/audio';
import Lathe3D from './Lathe3D';
import PreparationModal from './PreparationModal';
import LatheFormulaCalculatorModal from './LatheFormulaCalculatorModal';
import { latheJobsheets } from '../data/latheJobsheets';

const LatheModule = ({ addXP }) => {
  const [isPrepared, setIsPrepared] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeJobsheetIndex, setActiveJobsheetIndex] = useState(0);
  const activeJobsheet = latheJobsheets[activeJobsheetIndex] || latheJobsheets[0];

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

  // Workpiece profile in exact mm (30 discrete segments along 100mm length)
  // Index 0 is Z = 0 (right edge / tailstock), Index 29 is Z = -100 (left edge / chuck)
  const initialProfile = Array(30).fill(rawDiameter);
  const [profile, setProfile] = useState(initialProfile);
  const profileRef = useRef([...initialProfile]);

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

  // INSTANT CUTTING LOGIC - ZERO DELAY & EXACT ALIGNMENT
  const applyInstantCut = useCallback((currZ, currD, spindleActive = isSpindleRef.current) => {
    // Check if tool tip is along the workpiece length: Z between 0.2mm and -100mm
    if (currZ <= 0.2 && currZ >= -100.0) {
      // Direct ratio: currZ = 0 -> index 0, currZ = -100 -> index 29
      const ratio = Math.max(0, Math.min(1, -currZ / 100.0));
      const targetIdx = Math.round(ratio * 29);

      const currentSegmentDiameter = profileRef.current[targetIdx];

      // If tool diameter is at or cutting into the current profile slice
      if (currD <= currentSegmentDiameter + 0.05) {
        if (spindleActive) {
          // INSTANT CUTTING TRIGGERED
          setIsCutting(true);
          sound.startCuttingSound();

          const updated = [...profileRef.current];
          // Primary cut slice
          updated[targetIdx] = Math.min(updated[targetIdx], currD);

          // Tool nose radius effect (r_epsilon = 0.8mm) smooths adjacent slices
          const noseRadiusMm = 0.8;
          if (targetIdx > 0) {
            updated[targetIdx - 1] = Math.min(updated[targetIdx - 1], currD + noseRadiusMm);
          }
          if (targetIdx < 29) {
            updated[targetIdx + 1] = Math.min(updated[targetIdx + 1], currD + noseRadiusMm);
          }

          profileRef.current = updated;
          setProfile(updated);
          return true;
        }
      }
    }

    // Outside or retracted
    setIsCutting(false);
    sound.stopCuttingSound();
    return false;
  }, []);

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

    const resetProfile = Array(30).fill(activeJobsheet.diameter || 50);
    profileRef.current = [...resetProfile];
    setProfile(resetProfile);

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

    // Check Material cut depth
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

    const targetDiameter = rawDiameter - 4.0; // 2mm depth of cut = 4mm diameter reduction
    const diameterDiff = Math.abs(minDiameter - targetDiameter);

    let calculatedScore = 0;
    if (isModeCorrect && isRpmCorrect && cutSegmentsCount > 6) {
      if (diameterDiff <= 1.0) {
        calculatedScore = 100;
      } else {
        calculatedScore = 85;
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
      targetDiameter: targetDiameter.toFixed(2),
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
      {!isPrepared && <PreparationModal machineName="MESIN BUBUT" onComplete={() => setIsPrepared(true)} />}

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

        {/* JOBSHEET TABS & FORMULA CALCULATOR BUTTON */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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
            <span>RUMUS & KALKULATOR BUBUT</span>
          </button>

          {latheJobsheets.map((sheet, idx) => (
            <button
              key={sheet.id}
              onClick={() => setActiveJobsheetIndex(idx)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeJobsheetIndex === idx ? '#0284c7' : 'rgba(255,255,255,0.05)',
                color: activeJobsheetIndex === idx ? '#ffffff' : 'var(--text-muted)',
                border: activeJobsheetIndex === idx ? '1px solid #0284c7' : '1px solid var(--border-light)',
                transition: 'all 0.2s'
              }}
            >
              {idx + 1}. {sheet.title.split('(')[0]}
            </button>
          ))}
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
          rpm={rpm}
          isCutting={isCutting}
          coolant={coolant}
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

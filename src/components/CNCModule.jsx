import React, { useState, Suspense, useEffect, useRef, useMemo } from 'react';
import {
  Shield, Play, Pause, RotateCcw, Wrench, RefreshCw,
  Zap, FileText, CheckCircle2, AlertTriangle, Layers, Droplets
} from 'lucide-react';
import { sound } from '../utils/audio';
import CNC3D from './CNC3D';
import PreparationModal from './PreparationModal';
import '../styles/teknalar_cnc.css';

// =========================================================================
// DATA 6-STATION ATC TOOL MAGAZINE CNC FRAIS (FANUC SERIES 0i-MD)
// =========================================================================
const DEFAULT_ATC_POCKETS = [
  {
    pocket: 1,
    id: 'T01',
    code: 'T0101',
    name: 'Face Mill Ø63mm (5-Insert)',
    enName: 'Indexable Face Mill Cutter Ø63',
    diameter: 63,
    type: 'Pisau Frais Muka',
    holder: 'BT40-FMB22-60',
    hOffset: 120.50,
    dOffset: 31.50,
    wearH: 0.0,
    wearD: 0.0,
    flutes: 5,
    rpm: 1200,
    feed: 400,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: '#d97706',
    desc: 'Perataan permukaan atas benda kerja (facing) secara merata dan presisi.',
    gcode: `(PROGRAM FRAIS MUKA FACING - T01 Ø63)
G21 G17 G40 G80 G90 G54
T01 M06 (PISAU FRAIS MUKA Ø63MM)
G43 H01 Z25.0
M03 S1200 M08
G00 X-35.0 Y-35.0 Z5.0
G01 Z-1.0 F250
G01 X35.0 Y-35.0 F400
G01 X35.0 Y35.0
G01 X-35.0 Y35.0
G01 X-35.0 Y-35.0
G00 Z25.0
M09 M05
M30`
  },
  {
    pocket: 2,
    id: 'T02',
    code: 'T0202',
    name: 'Rough End Mill Ø16mm',
    enName: 'Solid Carbide 4F Roughing End Mill Ø16',
    diameter: 16,
    type: 'Frais Jari Kasar',
    holder: 'BT40-ER32-70',
    hOffset: 145.20,
    dOffset: 8.00,
    wearH: 0.0,
    wearD: 0.0,
    flutes: 4,
    rpm: 2000,
    feed: 350,
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: '#0284c7',
    desc: 'Pemakanan kantong kasar (roughing pocket) dan kontur luar dengan laju pembuangan tatal tinggi.',
    gcode: `(PROGRAM END MILL KASAR Ø16 - T02)
G21 G17 G40 G80 G90 G54
T02 M06 (END MILL KASAR Ø16MM 4F)
G43 H02 Z20.0
M03 S2000 M08
G00 X-20.0 Y-20.0 Z5.0
G01 Z-4.0 F180
G01 X20.0 Y-20.0 F350
G01 X20.0 Y20.0
G01 X-20.0 Y20.0
G01 X-20.0 Y-20.0
G00 Z15.0
M09 M05
M30`
  },
  {
    pocket: 3,
    id: 'T03',
    code: 'T0303',
    name: 'Finish End Mill Ø10mm',
    enName: 'Carbide Finishing End Mill Ø10',
    diameter: 10,
    type: 'Frais Jari Finishing',
    holder: 'BT40-ER32-70',
    hOffset: 152.80,
    dOffset: 5.00,
    wearH: 0.0,
    wearD: 0.0,
    flutes: 4,
    rpm: 2500,
    feed: 300,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: '#059669',
    desc: 'Penyelesaian dinding dan dasar kantong dengan toleransi presisi dan kehalusan tinggi.',
    gcode: `(PROGRAM END MILL FINISHING Ø10 - T03)
G21 G17 G40 G80 G90 G54
T03 M06 (END MILL FINISHING Ø10MM)
G43 H03 Z15.0
M03 S2500 M08
G00 X-20.0 Y-20.0 Z5.0
G01 Z-5.0 F150
G01 X20.0 Y-20.0 F300
G01 X20.0 Y20.0
G01 X-20.0 Y20.0
G01 X-20.0 Y-20.0
G00 Z10.0
M09 M05
M30`
  },
  {
    pocket: 4,
    id: 'T04',
    code: 'T0404',
    name: 'Chamfer Mill 45° Ø12mm',
    enName: '45-Degree Chamfer Cutter Ø12',
    diameter: 12,
    type: 'Pisau Bevel/Chamfer',
    holder: 'BT40-ER25-60',
    hOffset: 138.40,
    dOffset: 6.00,
    wearH: 0.0,
    wearD: 0.0,
    flutes: 2,
    rpm: 2800,
    feed: 320,
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.12)',
    border: '#9333ea',
    desc: 'Pembuatan sudut miring 45 derajat pada tepi benda kerja untuk menghilangkan ketajaman burr.',
    gcode: `(PROGRAM CHAMFER MILL 45 DEG - T04)
G21 G17 G40 G80 G90 G54
T04 M06 (PISAU CHAMFER 45 DERAJAT)
G43 H04 Z15.0
M03 S2800 M08
G00 X-22.0 Y-22.0 Z5.0
G01 Z-1.5 F200
G01 X22.0 Y-22.0 F320
G01 X22.0 Y22.0
G01 X-22.0 Y22.0
G01 X-22.0 Y-22.0
G00 Z15.0
M09 M05
M30`
  },
  {
    pocket: 5,
    id: 'T05',
    code: 'T0505',
    name: 'Twist Drill Ø8.5mm',
    enName: 'HSS-Co Twist Drill Bit Ø8.5',
    diameter: 8.5,
    type: 'Mata Bor Spiral',
    holder: 'BT40-ER20-70',
    hOffset: 165.10,
    dOffset: 4.25,
    wearH: 0.0,
    wearD: 0.0,
    flutes: 2,
    rpm: 1800,
    feed: 90,
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: '#ea580c',
    desc: 'Pengeboran lubang tembus atau buta sebelum pembuatan ulir M10 dengan siklus peck G83.',
    gcode: `(PROGRAM BOR SPIRAL Ø8.5 SIKLUS G83 - T05)
G21 G17 G40 G80 G90 G54
T05 M06 (MATA BOR Ø8.5MM)
G43 H05 Z20.0
M03 S1800 M08
G00 X0.0 Y0.0 Z10.0
G83 X0.0 Y0.0 Z-18.0 Q3.0 R3.0 F90 (SIKLUS PECK DRILL G83)
G80
G00 Z30.0
M09 M05
M30`
  },
  {
    pocket: 6,
    id: 'T06',
    code: 'T0606',
    name: 'Machine Tap M10x1.5',
    enName: 'Spiral Flute Machine Tap M10',
    diameter: 10,
    type: 'Tap Ulir Mesin (M10)',
    holder: 'BT40-TER16 Tapping Chuck',
    hOffset: 158.00,
    dOffset: 5.00,
    wearH: 0.0,
    wearD: 0.0,
    flutes: 3,
    rpm: 400,
    feed: 600,
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    border: '#db2777',
    desc: 'Pembuatan ulir dalam metris standar M10x1.5 dengan sinkronisasi rigid tapping siklus G84.',
    gcode: `(PROGRAM RIGID TAPPING G84 M10 - T06)
G21 G17 G40 G80 G90 G54
T06 M06 (TAP M10x1.5)
G43 H06 Z25.0
M29 S400 (SINKRONISASI RIGID TAPPING)
G84 X0.0 Y0.0 Z-15.0 R5.0 F600 (FEED = RPM x PITCH = 400 x 1.5)
G80
G00 Z40.0
M09 M05
M30`
  }
];

const CNCModule = ({ addXP }) => {
  const [isPrepared, setIsPrepared] = useState(true);
  const [activeTab, setActiveTab] = useState('4'); // 1: Setup, 2: Tooling/ATC, 3: Coolant, 4: Program, 5: Proses, 6: Hasil
  const [workpieceSize, setWorkpieceSize] = useState({ x: 50, y: 50, z: 20 });
  const [toolDiameter, setToolDiameter] = useState(10);

  // ==========================================
  // ATC TOOL MAGAZINE STATE (6 POCKETS)
  // ==========================================
  const [activeAtcPocket, setActiveAtcPocket] = useState(3); // Default Pocket 3: Finish End Mill Ø10mm
  const [atcPockets, setAtcPockets] = useState(DEFAULT_ATC_POCKETS);

  // ==========================================
  // FANUC SERIES 0i-MD CONTROLLER STATE
  // ==========================================
  const [fanucMode, setFanucMode] = useState('AUTO'); // 'AUTO', 'EDIT', 'JOG', 'MDI'
  const [crtScreen, setCrtScreen] = useState('POS'); // 'POS', 'PROG', 'OFFSET', 'ALARM'
  const [eStop, setEStop] = useState(false);
  const [jogStep, setJogStep] = useState(0.1);
  const [isPaused, setIsPaused] = useState(false);

  // Spindle & Feed
  const [spindleRpm, setSpindleRpm] = useState(2500);
  const [feedRate, setFeedRate] = useState(300);
  const [coolant, setCoolant] = useState(true);

  // G-Code Program & Live execution
  const [gcodeText, setGcodeText] = useState(DEFAULT_ATC_POCKETS[2].gcode);
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

  // Live CNC coordinates for Fanuc CRT DRO Readout
  const [cncCoords, setCncCoords] = useState({ x: 0.0, y: 0.0, z: 10.0 });

  const activeToolData = useMemo(() => {
    return DEFAULT_ATC_POCKETS.find(t => t.pocket === activeAtcPocket) || DEFAULT_ATC_POCKETS[2];
  }, [activeAtcPocket]);

  const applyToolMove = (newX, newY, newZ) => {
    toolPosRef.current.x = newX;
    toolPosRef.current.y = newY;
    toolPosRef.current.z = newZ;

    // Calculate real CNC coordinates in mm
    const calcCncX = (newX / threeJsWidth) * workpieceSize.x;
    const calcCncY = (-newZ / threeJsDepth) * workpieceSize.y;
    const calcCncZ = (newY - 0.3) / 0.03;
    setCncCoords({ x: calcCncX, y: calcCncY, z: calcCncZ });
    
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

  // Tool Selection & ATC Handlers
  const handleSelectAtcPocket = (pocketNum) => {
    sound.playClick();
    const tool = DEFAULT_ATC_POCKETS.find(t => t.pocket === pocketNum);
    if (tool) {
      setActiveAtcPocket(pocketNum);
      setToolDiameter(tool.diameter);
      setSpindleRpm(tool.rpm);
      setFeedRate(tool.feed);
      setGcodeText(tool.gcode);
    }
  };

  const handleAtcIndex = (direction) => {
    sound.playClick();
    const nextPocket = ((activeAtcPocket - 1 + direction + 6) % 6) + 1;
    handleSelectAtcPocket(nextPocket);
  };

  // Manual JOG Movement Handler (FANUC 0i-MD JOG Mode)
  const handleManualJog = (axis, direction) => {
    if (isMachining) return;
    sound.playClick();
    const delta = direction * jogStep;
    const current = toolPosRef.current;

    let targetX = current.x;
    let targetY = current.y;
    let targetZ = current.z;

    if (axis === 'X') {
      const worldStep = (delta / workpieceSize.x) * threeJsWidth;
      targetX = Math.max(-threeJsWidth, Math.min(threeJsWidth, current.x + worldStep));
    } else if (axis === 'Y') {
      const worldStep = -(delta / workpieceSize.y) * threeJsDepth;
      targetZ = Math.max(-threeJsDepth, Math.min(threeJsDepth, current.z + worldStep));
    } else if (axis === 'Z') {
      const worldStep = delta * 0.03;
      targetY = Math.max(0.0, Math.min(1.2, current.y + worldStep));
    }

    applyToolMove(targetX, targetY, targetZ);
  };

  // Emergency Stop Switch Handler
  const handleToggleEStop = () => {
    sound.playAlarm?.() || sound.playClick();
    setEStop(prev => {
      const next = !prev;
      if (next) {
        setIsMachining(false);
        setIsPaused(false);
        setFanucMode('JOG');
      }
      return next;
    });
  };

  // Cycle Start Pushbutton Handler
  const handleCycleStart = () => {
    if (eStop) {
      sound.playAlarm?.() || sound.playClick();
      return;
    }
    sound.playClick();
    if (isPaused) {
      setIsPaused(false);
      return;
    }
    setIsMachining(true);
    setShowResult(false);
    setCurrentLine(0);
    targetPosRef.current = null;
  };

  // Feed Hold Pushbutton Handler
  const handleFeedHold = () => {
    sound.playClick();
    if (isMachining) {
      setIsPaused(prev => !prev);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setIsMachining(false);
    setIsPaused(false);
    setShowResult(false);
    setCurrentLine(-1);
    heightmapRef.current.fill(0);
    toolPosRef.current = { x: 0, y: 0.6, z: 0 };
    setCncCoords({ x: 0.0, y: 0.0, z: 10.0 });
    targetPosRef.current = null;
    setScore(0);
  };

  useEffect(() => {
    let animFrame;

    if (eStop || isPaused) return;

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

      // Deteksi Tool Change ATC (T01 s/d T06)
      if (line.includes('T01')) { setActiveAtcPocket(1); setToolDiameter(63); }
      else if (line.includes('T02')) { setActiveAtcPocket(2); setToolDiameter(16); }
      else if (line.includes('T03')) { setActiveAtcPocket(3); setToolDiameter(10); }
      else if (line.includes('T04')) { setActiveAtcPocket(4); setToolDiameter(12); }
      else if (line.includes('T05')) { setActiveAtcPocket(5); setToolDiameter(8.5); }
      else if (line.includes('T06')) { setActiveAtcPocket(6); setToolDiameter(10); }

      if (!line || line.startsWith('(') || line.startsWith('O') || line.includes('M03') || line.includes('M05') || line.includes('M30') || line.includes('G21') || line.includes('G90') || line.includes('G54')) {
        setTimeout(() => setCurrentLine(prev => prev + 1), 160);
        return;
      }
      
      if (!targetPosRef.current) {
        let xMatch = line.match(/X([-\d.]+)/);
        let yMatch = line.match(/Y([-\d.]+)/);
        let zMatch = line.match(/Z([-\d.]+)/);
        let sMatch = line.match(/S(\d+)/);
        let fMatch = line.match(/F([-\d.]+)/);
        if (sMatch) setSpindleRpm(parseInt(sMatch[1]));
        if (fMatch) setFeedRate(parseFloat(fMatch[1]));
        
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
        
        const speed = target.isRapid ? 0.05 : 0.012;
        
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
  }, [isMachining, currentLine, gcodeText, addXP, workpieceSize, threeJsWidth, threeJsDepth, toolRadiusThreeJS, eStop, isPaused]);

  const sidebarMenus = [
    { id: '1', title: '1. SETUP', desc: `${workpieceSize.x}x${workpieceSize.y}x${workpieceSize.z} mm` },
    { id: '2', title: '2. ATC MAGAZINE', desc: `T0${activeAtcPocket}: Ø${toolDiameter}mm` },
    { id: '3', title: '3. SPINDEL & COOLANT', desc: `${spindleRpm} RPM • M08` },
    { id: '4', title: '4. PROGRAM G-CODE', desc: activeToolData.id },
    { id: '5', title: '5. PROSES SIMULASI', desc: isMachining ? (isPaused ? 'FEED HOLD' : 'RUNNING...') : 'Siap Mulai' },
    { id: '6', title: '6. HASIL PEMESINAN', desc: showResult ? 'Score 100%' : 'Menunggu' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {!isPrepared && <PreparationModal machineName="MESIN CNC FRAIS" onComplete={() => setIsPrepared(true)} />}
      
      {/* HEADER UTAMA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            SIMULATOR MESIN FRAIS CNC (3-AXIS MILLING)
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Simulator Pemesinan Frais CNC 3-Sumbu dengan Kontroler Fanuc Series 0i-MD dan Magazine Tool ATC 6-Station.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { sound.playClick(); setIsPrepared(false); }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
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
            <Shield size={14} className="inline mr-1 text-emerald-400" /> SOP &amp; K3
          </button>
        </div>
      </div>

      {/* WORKSPACE AREA (SIDEBAR + MIDDLE CANVAS + RIGHT FANUC 0i-MD CONTROLLER) */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: '600px' }}>
        
        {/* LEFT SIDEBAR: MENU */}
        <div style={{ width: '210px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sidebarMenus.map(menu => (
            <button
              key={menu.id}
              onClick={() => { sound.playClick(); setActiveTab(menu.id); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-light)',
                background: activeTab === menu.id ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                color: activeTab === menu.id ? '#10b981' : 'var(--text-main)',
                borderLeft: activeTab === menu.id ? '4px solid #10b981' : '1px solid var(--border-light)',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: menu.desc ? '3px' : '0' }}>{menu.title}</div>
              {menu.desc && <div style={{ fontSize: '0.72rem', color: activeTab === menu.id ? '#6ee7b7' : 'var(--text-muted)' }}>{menu.desc}</div>}
            </button>
          ))}

          {/* QUICK TOOL BADGE */}
          <div style={{ marginTop: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>TOOL IN SPINDLE:</div>
            <div style={{ fontWeight: 900, color: activeToolData.color, fontSize: '0.82rem' }}>
              {activeToolData.id} - {activeToolData.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Diameter: Ø{toolDiameter}mm &bull; H0{activeAtcPocket}
            </div>
          </div>
        </div>

        {/* MIDDLE: 3D CANVAS & PARAMETERS */}
        <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* 3D CANVAS PORTION */}
          <div style={{ height: '350px', background: '#000', position: 'relative' }}>
            <Suspense fallback={<div className="flex-center" style={{ height: '100%', color: 'var(--game-success)' }}>MEMUAT ENGINE 3D CNC FRAIS...</div>}>
              <CNC3D isRunning={isMachining} toolPosRef={toolPosRef} heightmapRef={heightmapRef} workpieceSize={workpieceSize} toolDiameter={toolDiameter} />
            </Suspense>
          </div>

          {/* ACTIVE TAB CONTENT CONTROLLER */}
          <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
            
            {/* TAB 1: WORKPIECE SETUP */}
            {activeTab === '1' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={16} className="inline mr-1 text-emerald-400" />
                    <span>Dimensi Benda Kerja (Workpiece Setup)</span>
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                    Work Coordinate: G54 (Pojok Kiri Bawah Meja)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-game)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Panjang Sumbu X (mm)</label>
                    <input
                      type="number"
                      min="30"
                      max="100"
                      value={workpieceSize.x}
                      onChange={e => setWorkpieceSize({...workpieceSize, x: Number(e.target.value)})}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: '#38bdf8', fontSize: '1.1rem', fontWeight: 900 }}
                      disabled={isMachining}
                    />
                  </div>

                  <div style={{ background: 'var(--bg-game)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Lebar Sumbu Y (mm)</label>
                    <input
                      type="number"
                      min="30"
                      max="100"
                      value={workpieceSize.y}
                      onChange={e => setWorkpieceSize({...workpieceSize, y: Number(e.target.value)})}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: '#10b981', fontSize: '1.1rem', fontWeight: 900 }}
                      disabled={isMachining}
                    />
                  </div>

                  <div style={{ background: 'var(--bg-game)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tebal Sumbu Z (mm)</label>
                    <input
                      type="number"
                      min="10"
                      max="50"
                      value={workpieceSize.z}
                      onChange={e => setWorkpieceSize({...workpieceSize, z: Number(e.target.value)})}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: '#fbbf24', fontSize: '1.1rem', fontWeight: 900 }}
                      disabled={isMachining}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 6-STATION ATC TOOL MAGAZINE & TOOL OFFSET TABLE */}
            {activeTab === '2' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* ATC HEADER & INDEX CONTROLS */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Wrench size={16} className="inline mr-1 text-emerald-400" />
                      <span>AUTOMATIC TOOL CHANGER (ATC) 6-STATION CAROUSEL</span>
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Piringan Magazine Pemegang Tool Otomatis Standar BT40 Fanuc Series 0i-MD.
                    </div>
                  </div>

                  {/* ATC INDEXING BUTTONS */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleAtcIndex(-1)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid #10b981',
                        color: '#10b981',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                      title="Putar ATC Berlawanan Jarum Jam"
                    >
                      [ATC CCW (T-)]
                    </button>

                    <div style={{
                      background: 'rgba(244, 194, 27, 0.15)',
                      border: '1.5px solid #f4c21b',
                      color: '#f4c21b',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      fontSize: '0.85rem'
                    }}>
                      SPINDEL: {activeToolData.id} (Ø{toolDiameter}mm)
                    </div>

                    <button
                      onClick={() => handleAtcIndex(1)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid #10b981',
                        color: '#10b981',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                      title="Putar ATC Searah Jarum Jam"
                    >
                      [ATC CW (T+)]
                    </button>
                  </div>
                </div>

                {/* 6-STATION ATC CAROUSEL PODS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
                  {DEFAULT_ATC_POCKETS.map(pocket => {
                    const isMounted = activeAtcPocket === pocket.pocket;
                    return (
                      <div
                        key={pocket.pocket}
                        onClick={() => handleSelectAtcPocket(pocket.pocket)}
                        style={{
                          background: isMounted ? pocket.bg : 'var(--bg-game)',
                          border: isMounted ? `2px solid ${pocket.border}` : '1px solid var(--border-light)',
                          borderRadius: '10px',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.18s ease',
                          boxShadow: isMounted ? `0 0 16px ${pocket.bg}` : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              background: isMounted ? pocket.border : 'rgba(255,255,255,0.08)',
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              POCKET {pocket.pocket}
                            </span>
                            <span style={{ fontWeight: 800, color: pocket.color, fontSize: '0.85rem' }}>
                              {pocket.id}
                            </span>
                          </div>

                          {isMounted ? (
                            <span style={{
                              background: '#10b981',
                              color: '#000000',
                              fontWeight: 900,
                              fontSize: '0.65rem',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              [IN SPINDLE]
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-subtle)', fontSize: '0.68rem', fontWeight: 700 }}>
                              ATC CAROUSEL
                            </span>
                          )}
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                            {pocket.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Holder: {pocket.holder}
                          </div>
                        </div>

                        <div style={{
                          background: 'rgba(0,0,0,0.25)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          fontSize: '0.7rem',
                          border: '1px solid rgba(255,255,255,0.05)',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span><strong>Ø D:</strong> {pocket.diameter}mm</span>
                          <span><strong>H-Offset:</strong> {pocket.hOffset.toFixed(2)}</span>
                          <span><strong>Flutes:</strong> {pocket.flutes}F</span>
                        </div>

                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {pocket.desc}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAtcPocket(pocket.pocket);
                            setActiveTab('4');
                          }}
                          style={{
                            marginTop: 'auto',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: isMounted ? pocket.border : 'rgba(255,255,255,0.08)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {isMounted ? '[TERPASANG] Lihat Editor Program' : 'Pasang Tool ke Spindel (M06)'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* FANUC SERIES 0i-MD TOOL OFFSET TABLE */}
                <div style={{
                  background: 'var(--bg-game)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  padding: '14px',
                  marginTop: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      TABEL TOOL OFFSET LENGTH (H) &amp; GEOMETRY (D) - FANUC SERIES 0i-MD
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                      DATUM SISTEM KOORDINAT: G54
                    </span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>
                          <th style={{ padding: '6px 8px' }}>POCKET</th>
                          <th style={{ padding: '6px 8px' }}>TOOL ID</th>
                          <th style={{ padding: '6px 8px' }}>NAMA TOOL</th>
                          <th style={{ padding: '6px 8px' }}>DIAMETER (mm)</th>
                          <th style={{ padding: '6px 8px' }}>LENGTH H (mm)</th>
                          <th style={{ padding: '6px 8px' }}>RADIUS D (mm)</th>
                          <th style={{ padding: '6px 8px' }}>WEAR H</th>
                          <th style={{ padding: '6px 8px' }}>WEAR D</th>
                          <th style={{ padding: '6px 8px' }}>HOLDER</th>
                          <th style={{ padding: '6px 8px' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEFAULT_ATC_POCKETS.map(pocket => {
                          const isCur = activeAtcPocket === pocket.pocket;
                          return (
                            <tr
                              key={pocket.pocket}
                              style={{
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                background: isCur ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                                color: isCur ? '#10b981' : 'var(--text-main)'
                              }}
                            >
                              <td style={{ padding: '6px 8px', fontWeight: 900 }}>{pocket.pocket}</td>
                              <td style={{ padding: '6px 8px', fontWeight: 800 }}>{pocket.id}</td>
                              <td style={{ padding: '6px 8px', color: isCur ? '#ffffff' : 'var(--text-muted)' }}>{pocket.name}</td>
                              <td style={{ padding: '6px 8px', color: '#38bdf8' }}>Ø{pocket.diameter}</td>
                              <td style={{ padding: '6px 8px', color: '#10b981' }}>{pocket.hOffset.toFixed(2)}</td>
                              <td style={{ padding: '6px 8px', color: '#10b981' }}>{pocket.dOffset.toFixed(2)}</td>
                              <td style={{ padding: '6px 8px', color: '#fbbf24' }}>0.000</td>
                              <td style={{ padding: '6px 8px', color: '#fbbf24' }}>0.000</td>
                              <td style={{ padding: '6px 8px' }}>{pocket.holder}</td>
                              <td style={{ padding: '6px 8px' }}>
                                <span style={{
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  fontSize: '0.65rem',
                                  fontWeight: 900,
                                  background: isCur ? '#10b981' : 'rgba(255,255,255,0.06)',
                                  color: isCur ? '#000000' : '#ffffff'
                                }}>
                                  {isCur ? 'SPINDLE' : 'STANDBY'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SPINDEL & COOLANT */}
            {activeTab === '3' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Droplets size={16} className="inline mr-1 text-sky-400" />
                    <span>Spindle Speed &amp; Coolant Control</span>
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-game)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>Putaran Spindel (RPM):</label>
                    <input
                      type="range"
                      min="500"
                      max="6000"
                      step="100"
                      value={spindleRpm}
                      onChange={e => {
                        const newRpm = Number(e.target.value);
                        setSpindleRpm(newRpm);
                        setGcodeText(prev => prev.replace(/S\d+/, `S${newRpm}`));
                      }}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                    <div style={{ marginTop: '8px', fontSize: '1.2rem', fontWeight: 900, color: '#fbbf24', textAlign: 'center' }}>
                      {spindleRpm} RPM
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-game)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>Cairan Pendingin (Flood Coolant):</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>M08 (Coolant ON) / M09 (Coolant OFF)</div>
                    </div>
                    <button
                      onClick={() => { sound.playClick(); setCoolant(!coolant); }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: coolant ? '1.5px solid #10b981' : '1px solid #ef4444',
                        background: coolant ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: coolant ? '#10b981' : '#ef4444',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        marginTop: '12px'
                      }}
                    >
                      {coolant ? 'COOLANT AKTIF (M08)' : 'COOLANT MATI (M09)'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: G-CODE EDITOR (DEFAULT) */}
            {activeTab === '4' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      G-Code Editor CNC Frais &bull; Tool Aktif: <strong style={{ color: activeToolData.color }}>{activeToolData.name} ({activeToolData.id})</strong>
                    </label>
                  </div>

                  {/* QUICK TEMPLATE SELECTORS */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {DEFAULT_ATC_POCKETS.map(pocket => (
                      <button
                        key={pocket.pocket}
                        onClick={() => handleSelectAtcPocket(pocket.pocket)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: activeAtcPocket === pocket.pocket ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
                          color: activeAtcPocket === pocket.pocket ? '#10b981' : 'var(--text-muted)',
                          border: activeAtcPocket === pocket.pocket ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {pocket.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: '140px' }}>
                  <textarea 
                    value={gcodeText}
                    onChange={(e) => setGcodeText(e.target.value)}
                    disabled={isMachining}
                    className="cyber-font"
                    spellCheck="false"
                    style={{
                      flex: 1, width: '100%', background: 'var(--bg-game)', color: 'var(--game-success)', 
                      border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px',
                      fontSize: '0.85rem', lineHeight: '1.5', resize: 'none'
                    }}
                  />

                  {/* LIVE TRACER BAR */}
                  <div style={{ width: '190px', background: 'var(--bg-game)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px', overflowY: 'auto', maxHeight: '160px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 800 }}>BARIS PROGRAM:</div>
                    <div className="cyber-font" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {gcodeText.split('\n').map((line, idx) => (
                        <div key={idx} style={{ 
                          fontSize: '0.75rem', 
                          color: idx === currentLine && isMachining ? '#000' : 'var(--text-subtle)',
                          background: idx === currentLine && isMachining ? 'var(--game-success)' : 'transparent',
                          padding: '2px 4px', borderRadius: '2px'
                        }}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PROSES DRO READOUT */}
            {activeTab === '5' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={14} className="inline mr-1 text-amber-400" />
                    <span>Digital Read Out (DRO) 3-Sumbu &bull; Status Pemesinan</span>
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div style={{ background: '#070f1e', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>X (LONGITUDINAL)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                      {cncCoords.x.toFixed(2)} mm
                    </div>
                  </div>

                  <div style={{ background: '#070f1e', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>Y (CROSS SLIDE)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
                      {cncCoords.y.toFixed(2)} mm
                    </div>
                  </div>

                  <div style={{ background: '#070f1e', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>Z (VERTICAL HEAD)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace' }}>
                      {cncCoords.z.toFixed(2)} mm
                    </div>
                  </div>

                  <div style={{ background: '#070f1e', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>SPINDLE RPM</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ec4899', fontFamily: 'monospace' }}>
                      {isMachining ? spindleRpm : 0} RPM
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: HASIL & EVALUASI */}
            {activeTab === '6' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={14} className="inline mr-1 text-emerald-400" />
                    <span>Hasil Pemesinan CNC Frais &amp; Verifikasi Dimensi</span>
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-game)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ukuran Benda Kerja:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{workpieceSize.x} x {workpieceSize.y} x {workpieceSize.z} mm</div>
                  </div>

                  <div style={{ background: 'var(--bg-game)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tool Terpasang:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: activeToolData.color }}>{activeToolData.name} (Pocket {activeAtcPocket})</div>
                  </div>

                  <div style={{ background: 'var(--bg-game)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status Spindel:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>{isMachining ? 'M03 Berputar' : 'M05 Berhenti'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS (ALWAYS VISIBLE AT BOTTOM) */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
              <button 
                className="btn-game" 
                style={{
                  flex: 1,
                  padding: '14px',
                  fontSize: '1.05rem',
                  background: isMachining ? '#d97706' : '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(5, 150, 105, 0.4)'
                }}
                onClick={handleCycleStart}
                disabled={isMachining}
              >
                <Play size={13} className="inline mr-1" />
                <span>{isMachining ? 'RUNNING G-CODE EXECUTION...' : 'CYCLE START (JALANKAN SIMULASI CNC FRAIS)'}</span>
              </button>

              <button 
                className="btn-game btn-game-neutral" 
                style={{
                  padding: '14px 24px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }} 
                onClick={handleReset} 
                disabled={isMachining}
              >
                Reset Benda
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: FANUC SERIES 0i-MD OPERATOR CONTROLLER */}
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="teknalar-control" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            {/* 1. GOLDEN NAMEPLATE */}
            <div className="teknalar-nameplate">
              <div>
                <strong>FANUC Series 0i-MD</strong>
              </div>
              <span>3-AXIS CNC MILL</span>
            </div>

            {/* 2. CRT PHOSPHOR SCREEN & BEZEL */}
            <div className="teknalar-bezel" style={{ minHeight: '340px' }}>
              <div className="teknalar-lcd">
                {/* CRT HEADER */}
                <div className="teknalar-lcdHead">
                  <span>[{fanucMode}] [MEM] [G54]</span>
                  <span style={{ color: eStop ? '#ef4444' : (isPaused ? '#f59e0b' : '#34d399') }}>
                    {eStop ? '[ALM 1001 EMG]' : (isPaused ? '[FEED HOLD]' : (isMachining ? '[RUNNING]' : '[READY]'))}
                  </span>
                </div>

                {/* CRT BODY */}
                <div className="teknalar-lcdBody">
                  {crtScreen === 'POS' && (
                    <>
                      {/* DRO ACTUAL POSITION (3-AXIS) */}
                      <div className="teknalar-box">
                        <div className="teknalar-boxTitle">ACTUAL POSITION (G54 WORKPIECE)</div>
                        <div className="teknalar-bigAxis">
                          <span>X</span>
                          <strong>{cncCoords.x >= 0 ? '+' : ''}{cncCoords.x.toFixed(3)} <small>mm</small></strong>
                        </div>
                        <div className="teknalar-bigAxis">
                          <span>Y</span>
                          <strong>{cncCoords.y >= 0 ? '+' : ''}{cncCoords.y.toFixed(3)} <small>mm</small></strong>
                        </div>
                        <div className="teknalar-bigAxis">
                          <span>Z</span>
                          <strong>{cncCoords.z >= 0 ? '+' : ''}{cncCoords.z.toFixed(3)} <small>mm</small></strong>
                        </div>
                      </div>

                      {/* SPINDLE & FEED STATUS */}
                      <div className="teknalar-box">
                        <div className="teknalar-boxTitle">SPINDLE &amp; FEED RATE STATUS</div>
                        <div className="teknalar-status">
                          <p>
                            <b>S:</b> {isMachining ? spindleRpm : 0} RPM (M03) &bull; 
                            <b>F:</b> {feedRate} mm/min
                          </p>
                          <p>
                            <b>T:</b> {activeToolData.id} (POCKET {activeAtcPocket}) &bull; 
                            <b>COOL:</b> {coolant ? 'M08 ON' : 'M09 OFF'}
                          </p>
                          <p style={{ fontSize: '10px', color: '#94a3b8' }}>
                            <b>MODAL:</b> G01 G17 G21 G40 G54 G90
                          </p>
                        </div>
                      </div>

                      {/* MINI PROGRAM BLOCK TRACER */}
                      <div className="teknalar-box" style={{ flex: 1, minHeight: '60px' }}>
                        <div className="teknalar-boxTitle">ACTIVE PROGRAM BLOCK TRACER</div>
                        <div className="teknalar-prog" style={{ maxHeight: '80px' }}>
                          {gcodeText.split('\n').slice(Math.max(0, currentLine - 1), currentLine + 3).map((line, lIdx) => (
                            <div key={lIdx} className={line === gcodeText.split('\n')[currentLine] && isMachining ? 'teknalar-cur' : ''}>
                              {line || '(BLANK)'}
                            </div>
                          ))}
                          {!isMachining && (
                            <div style={{ color: '#64748b', padding: '4px 8px' }}>
                              [STANDBY] Tekan CYCLE START untuk mengeksekusi
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {crtScreen === 'PROG' && (
                    <div className="teknalar-box" style={{ flex: 1 }}>
                      <div className="teknalar-boxTitle">PROGRAM ISO (O1001)</div>
                      <div className="teknalar-prog" style={{ maxHeight: '240px' }}>
                        {gcodeText.split('\n').map((line, idx) => (
                          <div key={idx} className={idx === currentLine && isMachining ? 'teknalar-cur' : ''}>
                            {String(idx + 1).padStart(3, '0')}: {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {crtScreen === 'OFFSET' && (
                    <div className="teknalar-box" style={{ flex: 1 }}>
                      <div className="teknalar-boxTitle">ATC TOOL OFFSET (POCKET {activeAtcPocket})</div>
                      <div className="teknalar-status" style={{ fontSize: '11px' }}>
                        <p><b>TOOL:</b> {activeToolData.id} - {activeToolData.name}</p>
                        <p><b>DIAMETER D:</b> {activeToolData.diameter} mm</p>
                        <p><b>LENGTH H (G43):</b> +{activeToolData.hOffset.toFixed(2)} mm</p>
                        <p><b>RADIUS OFFSET D:</b> +{activeToolData.dOffset.toFixed(2)} mm</p>
                        <p><b>HOLDER TYPE:</b> {activeToolData.holder}</p>
                        <p><b>FLUTES:</b> {activeToolData.flutes} Flute Cutter</p>
                      </div>
                    </div>
                  )}

                  {crtScreen === 'ALARM' && (
                    <div className="teknalar-box" style={{ flex: 1 }}>
                      <div className="teknalar-boxTitle">ALARM MESSAGE SCREEN</div>
                      {eStop ? (
                        <div style={{ color: '#ef4444', padding: '12px', fontWeight: 800 }}>
                          ALARM 1001: EMERGENCY STOP AKTIF!
                          <div style={{ color: '#fca5a5', fontSize: '10px', marginTop: '6px' }}>
                            Lepaskan tombol E-STOP merah untuk melanjutkan pemesinan.
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#10b981', padding: '12px' }}>
                          000 NO ALARM PRESENT
                          <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '6px' }}>
                            Semua interlocking 3-Axis &amp; spindel normal.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* CRT SOFTKEYS (BOTTOM OF SCREEN) */}
                <div className="teknalar-softkeys">
                  {['POS', 'PROG', 'OFFSET', 'ALARM'].map(sk => (
                    <button
                      key={sk}
                      className={crtScreen === sk ? 'active' : ''}
                      onClick={() => { sound.playClick(); setCrtScreen(sk); }}
                    >
                      [{sk}]
                    </button>
                  ))}
                </div>
              </div>

              {/* BEZEL SIDE BUTTONS */}
              <div className="teknalar-sideKeys">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
            </div>

            {/* 3. TACTILE OPERATOR CONSOLE SWITCHBOARD */}
            <div className="teknalar-panel" style={{ padding: '8px', gap: '8px' }}>
              {/* ROW 1: MODE SELECTOR & ATC CHANGE */}
              <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['AUTO', 'EDIT', 'JOG', 'MDI'].map(m => (
                    <button
                      key={m}
                      onClick={() => { sound.playClick(); setFanucMode(m); }}
                      className={`teknalar-key ${fanucMode === m ? 'active' : ''}`}
                      style={{ minWidth: '42px', minHeight: '30px', fontSize: '10px' }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* ATC TOOL CHANGE BUTTON */}
                <button
                  onClick={() => handleAtcIndex(1)}
                  className="teknalar-key teknalar-teal2"
                  style={{ minWidth: '60px', minHeight: '30px', fontSize: '10px', fontWeight: 900 }}
                  title="Putar ATC ke Tool berikutnya"
                >
                  <RefreshCw size={11} className="inline mr-1" /> ATC T+
                </button>
              </div>

              {/* ROW 2: 3-AXIS MANUAL JOG KEYS */}
              <div style={{
                background: '#15191d',
                borderRadius: '6px',
                padding: '6px',
                width: '100%',
                border: '1px solid #28313a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800 }}>STEP JOG</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[0.01, 0.1, 1.0].map(s => (
                      <button
                        key={s}
                        onClick={() => { sound.playClick(); setJogStep(s); }}
                        style={{
                          padding: '2px 5px',
                          borderRadius: '3px',
                          fontSize: '9px',
                          fontWeight: 800,
                          background: jogStep === s ? '#10b981' : '#222830',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px' }}>
                  <button onClick={() => handleManualJog('X', 1)} className="teknalar-key" style={{ minWidth: '28px', minHeight: '26px', fontSize: '9.5px', padding: '2px' }}>+X</button>
                  <button onClick={() => handleManualJog('X', -1)} className="teknalar-key" style={{ minWidth: '28px', minHeight: '26px', fontSize: '9.5px', padding: '2px' }}>-X</button>
                  <button onClick={() => handleManualJog('Y', 1)} className="teknalar-key" style={{ minWidth: '28px', minHeight: '26px', fontSize: '9.5px', padding: '2px' }}>+Y</button>
                  <button onClick={() => handleManualJog('Y', -1)} className="teknalar-key" style={{ minWidth: '28px', minHeight: '26px', fontSize: '9.5px', padding: '2px' }}>-Y</button>
                  <button onClick={() => handleManualJog('Z', 1)} className="teknalar-key" style={{ minWidth: '28px', minHeight: '26px', fontSize: '9.5px', padding: '2px' }}>+Z</button>
                  <button onClick={() => handleManualJog('Z', -1)} className="teknalar-key" style={{ minWidth: '28px', minHeight: '26px', fontSize: '9.5px', padding: '2px' }}>-Z</button>
                </div>
              </div>

              {/* ROW 3: HARDWARE PRIMARY PUSHBUTTONS & ESTOP */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px', paddingTop: '4px' }}>
                <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                  {/* CYCLE START */}
                  <button
                    onClick={handleCycleStart}
                    disabled={eStop}
                    className="teknalar-key teknalar-green2 teknalar-big"
                    style={{ flex: 1, minHeight: '44px', fontWeight: 900, fontSize: '10.5px' }}
                  >
                    <Play size={12} className="inline mr-0.5" /> START
                  </button>

                  {/* FEED HOLD */}
                  <button
                    onClick={handleFeedHold}
                    disabled={!isMachining || eStop}
                    className="teknalar-key teknalar-yellow2 teknalar-big"
                    style={{ flex: 1, minHeight: '44px', fontWeight: 900, fontSize: '10.5px' }}
                  >
                    <Pause size={12} className="inline mr-0.5" /> HOLD
                  </button>

                  {/* RESET */}
                  <button
                    onClick={handleReset}
                    className="teknalar-key teknalar-red2 teknalar-big"
                    style={{ flex: 1, minHeight: '44px', fontWeight: 900, fontSize: '10.5px' }}
                  >
                    <RotateCcw size={12} className="inline mr-0.5" /> RESET
                  </button>
                </div>

                {/* EMERGENCY STOP MUSHROOM */}
                <button
                  onClick={handleToggleEStop}
                  className={`teknalar-estop ${eStop ? 'teknalar-estopDown' : ''}`}
                  title="EMERGENCY STOP (Tekan untuk berhenti darurat)"
                  style={{ width: '54px', height: '54px', fontSize: '9px', flexShrink: 0 }}
                >
                  E-STOP
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CNCModule;

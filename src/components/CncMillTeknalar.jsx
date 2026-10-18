import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sound } from '../utils/audio';
import '../styles/teknalar_cnc.css';
import CncMill3DScene from './CncMill3DScene';
import {
  Play, Pause, RotateCcw, Activity, Shield, Settings,
  CheckCircle2, AlertTriangle, Eye, ArrowLeft, ArrowRight,
  Maximize2, Minimize2, Wrench, RefreshCw, Scissors, Compass,
  Layers, Disc, Box, Crosshair, ChevronRight, Gauge
} from 'lucide-react';

// =============================================================================
// PRESET PROGRAM G-CODE RESMI TEKNALAR (CNC FRAIS / MILLING)
// =============================================================================
const MILL_PRESETS = [
  {
    id: "slot",
    title: "01 · Alur pertama",
    goal: "Pahat end mill turun ke Z−2, menyayat alur lurus selebar diameter pahat dari X12 ke X65, lalu naik kembali sebelum gerak cepat G00.",
    program: `G21 G17 G90 G94 G54
T1 M6
G43 H1
S1800 M3
M8
G0 X12 Y20 Z5
G1 Z-2 F80
G1 X65 F240
G0 Z10
M9
M5
M30`
  },
  {
    id: "arc",
    title: "02 · Kontur & busur",
    goal: "Ikuti pusat pahat: G03 berputar berlawanan jarum jam dilihat dari +Z dengan radius sudut R10. Parameter I/J relatif terhadap awal busur.",
    program: `G21 G17 G90 G94 G54
T1 M6
G43 H1
S2200 M3
M8
G0 X15 Y15 Z5
G1 Z-3 F80
G1 X55 F260
G3 X65 Y25 I0 J10
G1 Y45
G1 X15
G1 Y15
G0 Z15
M9
M5
M30`
  },
  {
    id: "increment",
    title: "03 · Absolut / inkremental",
    goal: "Bandingkan G90 (posisi absolut terhadap titik nol) dengan G91 (perpindahan relatif terhadap posisi saat ini).",
    program: `G21 G17 G90 G94 G54
T1 M6
G43 H1
S1800 M3
M8
G0 X15 Y15 Z10
G1 Z-2 F100
G91
G1 X20 F300
G1 Y20
G1 X-20
G1 Y-20
G90
G0 Z15
M9
M5
M30`
  },
  {
    id: "repair",
    title: "04 · Perbaiki gerak cepat",
    goal: "Pencegahan tabrakan: jangan gerakkan G00 mendatar saat pahat masih berada di dalam kedalaman bahan. Selalu angkat Z terlebih dahulu.",
    program: `G21 G17 G90 G94 G54
T1 M6
G43 H1
S1800 M3
M8
G0 X12 Y20 Z5
G1 Z-2 F80
G1 X65 F240
G0 Z10
G0 Y40
G1 Z-2 F80
G1 X12 F240
G0 Z15
M9
M5
M30`
  },
  {
    id: "face",
    title: "05 · Facing dengan face mill",
    goal: "Face mill Ø50 meratakan permukaan atas 0,5 mm. Turunkan Z di luar bahan (X−30), lalu masuk menyayat dari samping.",
    program: `G21 G17 G90 G94 G54
T3 M6
G43 H3
S1200 M3
M8
G0 X-30 Y35 Z5
G1 Z-0.5 F150
G1 X130 F350
G0 Z15
M9
M5
M30`
  },
  {
    id: "pocket",
    title: "06 · Kantong persegi (pocket)",
    goal: "Pembersihan rongga persegi bertingkat 40x40 mm dengan kedalaman bertahap Z−2 dan Z−4 mm.",
    program: `G21 G17 G90 G94 G54
T1 M6
G43 H1
S2000 M3
M8
G0 X20 Y20 Z5
G1 Z-2 F100
G1 X60 F250
G1 Y50
G1 X20
G1 Y20
G0 Z10
M9
M5
M30`
  },
  {
    id: "drill",
    title: "07 · Siklus bor G81",
    goal: "Siklus pengeboran sederhana G81 pada 4 titik koordinat lubang baut dengan kedalaman Z−12 mm.",
    program: `G21 G17 G90 G94 G54
T5 M6
G43 H5
S1400 M3
M8
G0 X20 Y20 Z5
G81 X20 Y20 Z-12 R2 F90
X80 Y20
X80 Y50
X20 Y50
G80
G0 Z20
M9
M5
M30`
  },
  {
    id: "peck",
    title: "08 · Siklus peck drill G83",
    goal: "Pengeboran lubang dalam bertahap G83 (peck drilling) dengan penarikan pahat berkala untuk memecah dan membuang geram.",
    program: `G21 G17 G90 G94 G54
T5 M6
G43 H5
S1200 M3
M8
G0 X50 Y35 Z5
G83 X50 Y35 Z-20 Q3 R2 F80
G80
G0 Z20
M9
M5
M30`
  },
  {
    id: "tap",
    title: "09 · Pengetapan ulir G84",
    goal: "Siklus pembuatan ulir dalam M10x1.5 dengan tap mesin sinkron. Feed = RPM x Pitch = 400 x 1.5 = 600 mm/min.",
    program: `G21 G17 G90 G94 G54
T6 M6
G43 H6
S400 M3
M8
G0 X50 Y35 Z5
G84 X50 Y35 Z-15 R3 F600
G80
G0 Z20
M9
M5
M30`
  },
  {
    id: "comp",
    title: "10 · Kompensasi cutter G41",
    goal: "Kompensasi radius pisau frais G41 kiri lintasan kontur agar ukuran benda kerja presisi sesuai gambar kerja.",
    program: `G21 G17 G90 G94 G54
T1 M6
G43 H1
S2200 M3
M8
G0 X0 Y0 Z5
G1 Z-3 F100
G41 D1 X15 Y15 F250
G1 X75
G1 Y55
G1 X15
G1 Y15
G40 X0 Y0
G0 Z20
M9
M5
M30`
  }
];

// =============================================================================
// DAFTAR ALAT POTONG ATC MAGASIN (CNC FRAIS VMC)
// =============================================================================
const DEFAULT_MILL_TOOLS = [
  {
    tool: 1,
    offset: 1,
    code: "T01",
    name: "End Mill 4-Flute Ø10",
    type: "endmill",
    diameter: 10,
    flutes: 4,
    lengthH: 120.0,
    wearH: 0.0,
    coating: "TiAlN Violet",
    color: "#38bdf8"
  },
  {
    tool: 2,
    offset: 2,
    code: "T02",
    name: "End Mill 2-Flute Ø6",
    type: "endmill",
    diameter: 6,
    flutes: 2,
    lengthH: 110.0,
    wearH: 0.0,
    coating: "TiN Emas",
    color: "#34d399"
  },
  {
    tool: 3,
    offset: 3,
    code: "T03",
    name: "Face Mill Indexable Ø50",
    type: "facemill",
    diameter: 50,
    flutes: 4,
    lengthH: 95.0,
    wearH: 0.0,
    coating: "Karbida Sisipan",
    color: "#fbbf24"
  },
  {
    tool: 4,
    offset: 4,
    code: "T04",
    name: "Ball Nose End Mill R3 Ø6",
    type: "ballnose",
    diameter: 6,
    flutes: 2,
    lengthH: 115.0,
    wearH: 0.0,
    coating: "AlTiN Super",
    color: "#c084fc"
  },
  {
    tool: 5,
    offset: 5,
    code: "T05",
    name: "HSS Twist Drill Ø8.5",
    type: "drill",
    diameter: 8.5,
    point: 118,
    lengthH: 130.0,
    wearH: 0.0,
    coating: "HSS-Co Black",
    color: "#fcd34d"
  },
  {
    tool: 6,
    offset: 6,
    code: "T06",
    name: "Machine Tap M10x1.5",
    type: "tap",
    diameter: 10,
    pitch: 1.5,
    lengthH: 125.0,
    wearH: 0.0,
    coating: "TiN Kuning",
    color: "#f43f5e"
  }
];

// =============================================================================
// KOMPONEN UTAMA SIMULATOR CNC FRAIS (VMC) TEKNALAR
// =============================================================================
const CncMillTeknalar = ({ addXP }) => {
  // Preset & Editor Program
  const [selectedPresetId, setSelectedPresetId] = useState("slot");
  const [programText, setProgramText] = useState(MILL_PRESETS[0].program);

  // Setup Benda Kerja Balok (Stock Block)
  const [stock, setStock] = useState({
    x: 100,
    y: 70,
    z: 30,
    gripZ: 10
  });
  const [showStockDrawer, setShowStockDrawer] = useState(false);
  const [stockDraft, setStockDraft] = useState({ ...stock });

  // ATC Magazine & Tools
  const [tools, setTools] = useState(DEFAULT_MILL_TOOLS);
  const [activeToolStation, setActiveToolStation] = useState(1);
  const [showAtcDrawer, setShowAtcDrawer] = useState(false);
  const [selectedToolForEdit, setSelectedToolForEdit] = useState(1);

  // Display Softkeys & Modes
  const [modeSelect, setModeSelect] = useState("AUTO");
  const [lcdTab, setLcdTab] = useState("POS");
  const [viewMode, setViewMode] = useState("2d"); // "2d" (Top XY) or "3d" (VMC Scene)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Machine Hardware & Status
  const [powerOn, setPowerOn] = useState(true);
  const [eStop, setEStop] = useState(false);
  const [spindleState, setSpindleState] = useState(0); // 0=stop, 1=CW (M3), 2=CCW (M4)
  const [spindleRpm, setSpindleRpm] = useState(1800);
  const [coolant, setCoolant] = useState(false);
  const [doorClosed, setDoorClosed] = useState(true);

  // Overrides & Execution Switches
  const [rapidOverride, setRapidOverride] = useState(100);
  const [feedOverride, setFeedOverride] = useState(100);
  const [spindleOverride, setSpindleOverride] = useState(100);
  const [singleBlock, setSingleBlock] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [jogStep, setJogStep] = useState(0.1);

  // Running State & Frames
  const [isRunning, setIsRunning] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  const [simFrames, setSimFrames] = useState([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [alarmMessage, setAlarmMessage] = useState("");

  // Coordinates
  const [position, setPosition] = useState({ x: 0, y: 0, z: 25 });
  const [machinePos, setMachinePos] = useState({ x: 150, y: 120, z: 280 });
  const [feedRate, setFeedRate] = useState(240);

  const activeToolObj = useMemo(() => {
    return tools.find(t => t.tool === activeToolStation) || tools[0];
  }, [tools, activeToolStation]);

  const activePreset = useMemo(() => {
    return MILL_PRESETS.find(p => p.id === selectedPresetId) || MILL_PRESETS[0];
  }, [selectedPresetId]);

  // Handle Preset Select
  const handleSelectPreset = (id) => {
    sound.playClick();
    setSelectedPresetId(id);
    const p = MILL_PRESETS.find(item => item.id === id);
    if (p) {
      setProgramText(p.program);
      setIsRunning(false);
      setCurrentFrameIdx(0);
      setActiveLine(0);
    }
  };

  // ===========================================================================
  // INTERPRETER G-CODE & SIMULATION ENGINE VMC MILLING
  // ===========================================================================
  const compileProgram = (text, stk, curTools) => {
    const rawLines = text.split(/\r?\n/);
    const frames = [];

    let curX = 0.0;
    let curY = 0.0;
    let curZ = 25.0;
    let activeToolNum = 1;
    let activeMotion = 0; // 0=G00, 1=G01, 2=G02, 3=G03, 81=G81, 83=G83, 84=G84
    let curRpm = 1800;
    let curFeed = 240;
    let curSpindle = 0;
    let curCoolant = false;
    let isIncremental = false;
    let errorAlarm = "";

    for (let lineIdx = 0; lineIdx < rawLines.length; lineIdx++) {
      let line = rawLines[lineIdx].replace(/\([^)]*\)/g, '').trim().toUpperCase();
      if (!line || line.startsWith('%') || line.startsWith('O')) continue;

      const words = {};
      const matches = line.match(/([A-Z])([+-]?\d*\.?\d+)/g) || [];
      for (const m of matches) {
        words[m[0]] = parseFloat(m.slice(1));
      }

      // Modes
      if (line.includes('G90')) isIncremental = false;
      if (line.includes('G91')) isIncremental = true;

      if (line.includes('G00') || (line.includes('G0') && !line.includes('G01') && !line.includes('G02') && !line.includes('G03'))) activeMotion = 0;
      else if (line.includes('G01') || line.includes('G1')) activeMotion = 1;
      else if (line.includes('G02') || line.includes('G2')) activeMotion = 2;
      else if (line.includes('G03') || line.includes('G3')) activeMotion = 3;
      else if (line.includes('G81')) activeMotion = 81;
      else if (line.includes('G83')) activeMotion = 83;
      else if (line.includes('G84')) activeMotion = 84;
      else if (line.includes('G80')) activeMotion = 0;

      // Tool Change
      if (line.includes('T')) {
        const tMatch = line.match(/T(\d+)/);
        if (tMatch) activeToolNum = parseInt(tMatch[1], 10);
      }

      // Spindle & Feed
      if (words.S !== undefined) curRpm = words.S;
      if (words.F !== undefined) curFeed = words.F;
      if (line.includes('M3') || line.includes('M03')) curSpindle = 1;
      if (line.includes('M4') || line.includes('M04')) curSpindle = 2;
      if (line.includes('M5') || line.includes('M05')) curSpindle = 0;
      if (line.includes('M8') || line.includes('M08')) curCoolant = true;
      if (line.includes('M9') || line.includes('M09')) curCoolant = false;

      // Targets
      let targetX = curX;
      let targetY = curY;
      let targetZ = curZ;

      if (isIncremental) {
        if (words.X !== undefined) targetX = curX + words.X;
        if (words.Y !== undefined) targetY = curY + words.Y;
        if (words.Z !== undefined) targetZ = curZ + words.Z;
      } else {
        if (words.X !== undefined) targetX = words.X;
        if (words.Y !== undefined) targetY = words.Y;
        if (words.Z !== undefined) targetZ = words.Z;
      }

      // Table Limit Alarm Check
      if (targetX < -40 || targetX > stk.x + 40 || targetY < -40 || targetY > stk.y + 40) {
        errorAlarm = `[LIMIT MEJA] Pahat berada di luar batas aman pencekaman ragum X/Y!`;
      }

      const hasMove = words.X !== undefined || words.Y !== undefined || words.Z !== undefined;

      if (hasMove) {
        const dX = targetX - curX;
        const dY = targetY - curY;
        const dZ = targetZ - curZ;
        const dist = Math.hypot(dX, dY, dZ);
        const steps = Math.max(1, Math.ceil(dist / 2.0));

        const isCutting = (activeMotion !== 0) && (targetZ <= 0 || curZ <= 0);

        for (let s = 1; s <= steps; s++) {
          const interpX = curX + (dX * s) / steps;
          const interpY = curY + (dY * s) / steps;
          const interpZ = curZ + (dZ * s) / steps;

          frames.push({
            line: lineIdx,
            x: interpX,
            y: interpY,
            z: interpZ,
            motion: activeMotion,
            isRapid: activeMotion === 0,
            isCutting,
            tool: activeToolNum,
            rpm: curRpm,
            feed: curFeed,
            spindle: curSpindle,
            coolant: curCoolant
          });
        }

        curX = targetX;
        curY = targetY;
        curZ = targetZ;
      }
    }

    return { frames, alarm: errorAlarm };
  };

  useEffect(() => {
    const res = compileProgram(programText, stock, tools);
    setSimFrames(res.frames);
    if (res.alarm) setAlarmMessage(res.alarm);
  }, [programText, stock, tools]);

  // Live Animation Loop
  useEffect(() => {
    let timer = null;
    if (isRunning && simFrames.length > 0) {
      const intervalMs = Math.max(16, 75 - rapidOverride * 0.45);
      timer = setInterval(() => {
        setCurrentFrameIdx(prev => {
          const next = prev + 1;
          if (next >= simFrames.length) {
            setIsRunning(false);
            sound.playSuccess();
            if (addXP) addXP(300);
            return prev;
          }
          const f = simFrames[next];
          setPosition({ x: Number(f.x.toFixed(3)), y: Number(f.y.toFixed(3)), z: Number(f.z.toFixed(3)) });
          setMachinePos({ x: Number((f.x + 150).toFixed(2)), y: Number((f.y + 120).toFixed(2)), z: Number((f.z + 280).toFixed(2)) });
          setActiveLine(f.line);
          setActiveToolStation(f.tool);
          setSpindleState(f.spindle);
          setSpindleRpm(f.rpm);
          setCoolant(f.coolant);
          setFeedRate(f.feed);

          if (singleBlock && next < simFrames.length - 1 && f.line !== simFrames[next + 1]?.line) {
            setIsRunning(false);
          }

          return next;
        });
      }, intervalMs);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, simFrames, rapidOverride, singleBlock, addXP]);

  // Actions
  const handleCycleStart = () => {
    sound.playClick();
    if (eStop) {
      setAlarmMessage("[ALARM] Emergency Stop aktif! Lepas tombol darurat terlebih dahulu.");
      return;
    }
    setAlarmMessage("");
    setIsRunning(true);
  };

  const handleFeedHold = () => {
    sound.playClick();
    setIsRunning(false);
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    setCurrentFrameIdx(0);
    setActiveLine(0);
    setPosition({ x: 0, y: 0, z: 25 });
    setSpindleState(0);
    setCoolant(false);
    setAlarmMessage("");
  };

  const handleJog = (axis, dir) => {
    sound.playClick();
    if (isRunning) return;
    const delta = jogStep * dir;
    if (axis === 'X') {
      setPosition(p => ({ ...p, x: Number((p.x + delta).toFixed(3)) }));
    } else if (axis === 'Y') {
      setPosition(p => ({ ...p, y: Number((p.y + delta).toFixed(3)) }));
    } else {
      setPosition(p => ({ ...p, z: Number((p.z + delta).toFixed(3)) }));
    }
  };

  // Stock Actions
  const applyStockChanges = () => {
    sound.playClick();
    setStock({ ...stockDraft });
    setShowStockDrawer(false);
    setAlarmMessage("[SUKSES] Ukuran balok bahan benda kerja diperbarui.");
  };

  // 2D SVG Blueprint Top View (XY)
  const svgW = 600;
  const svgH = 340;
  const originSvgX = 140;
  const originSvgY = 240;
  const scale = 3.2;

  const toSvgX = (x) => originSvgX + x * scale;
  const toSvgY = (y) => originSvgY - y * scale;

  return (
    <div className={`teknalar-cnc-root ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* 1. TOP BAR */}
      <div className="teknalar-topbar">
        <div className="teknalar-brand">
          <strong>TEKNALAR</strong>
          <span>CNC MILLING SIMULATOR · FANUC Series 0i-MD</span>
        </div>

        <div className="teknalar-topControls">
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="teknalar-presetSelect"
          >
            {MILL_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Drawer: ATC Tool Magazine */}
          <button
            onClick={() => { sound.playClick(); setShowAtcDrawer(!showAtcDrawer); setShowStockDrawer(false); }}
            className="teknalar-topBtn"
            style={{
              background: showAtcDrawer ? 'rgba(56, 189, 248, 0.25)' : '#1e293b',
              color: '#38bdf8',
              borderColor: '#0284c7',
              fontWeight: 700
            }}
          >
            <Disc size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            [ATC MAGAZINE] ({activeToolObj.code})
          </button>

          {/* Drawer: Bahan Balok */}
          <button
            onClick={() => { sound.playClick(); setShowStockDrawer(!showStockDrawer); setShowAtcDrawer(false); }}
            className="teknalar-topBtn"
            style={{
              background: showStockDrawer ? 'rgba(16, 185, 129, 0.25)' : '#1e293b',
              color: '#34d399',
              borderColor: '#059669',
              fontWeight: 700
            }}
          >
            <Box size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            [BAHAN] {stock.x}×{stock.y}×{stock.z}mm
          </button>

          {/* View Toggle */}
          <button
            onClick={() => { sound.playClick(); setViewMode(v => v === '2d' ? '3d' : '2d'); }}
            className="teknalar-topBtn"
            style={{
              background: viewMode === '3d' ? '#059669' : '#1e293b',
              color: '#ffffff',
              borderColor: '#10b981'
            }}
          >
            <Eye size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            {viewMode === '2d' ? 'Mode 2D Denah XY' : 'Mode 3D VMC Mesin'}
          </button>

          <button
            onClick={() => { sound.playClick(); setIsFullscreen(!isFullscreen); }}
            className="teknalar-topBtn"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* DRAWER 1: ATC TOOL MAGAZINE */}
      {showAtcDrawer && (
        <div className="teknalar-stockPanel" style={{ background: '#09151e', borderBottom: '2px solid #0284c7' }}>
          <div className="teknalar-stockHead">
            <strong style={{ color: '#38bdf8' }}>ATC TOOL MAGAZINE & OFFSET PANJANG Z (6 POCKETS):</strong>
            <span>Pilih stasiun alat potong atau atur kompensasi panjang alat H dan wear</span>
            <button
              onClick={() => setShowAtcDrawer(false)}
              className="teknalar-lcdBtn"
              style={{ marginLeft: 'auto' }}
            >
              [TUTUP]
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '10px 0' }}>
            {tools.map((t) => (
              <button
                key={t.tool}
                onClick={() => {
                  sound.playClick();
                  setActiveToolStation(t.tool);
                  setSelectedToolForEdit(t.tool);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: t.tool === activeToolStation ? '2px solid #38bdf8' : '1px solid #334155',
                  background: t.tool === activeToolStation ? 'rgba(56, 189, 248, 0.25)' : '#1e293b',
                  color: t.tool === activeToolStation ? '#38bdf8' : '#94a3b8',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
                <span>{t.code} - {t.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '10px' }}>
            <table className="teknalar-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>NAMA ALAT</th>
                  <th>DIAMETER</th>
                  <th>PANJANG H</th>
                  <th>WEAR H</th>
                  <th>FLUTE</th>
                  <th>COATING</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t) => (
                  <tr
                    key={t.tool}
                    className={t.tool === activeToolStation ? 'act' : ''}
                    onClick={() => { setSelectedToolForEdit(t.tool); setActiveToolStation(t.tool); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{t.code}</td>
                    <td style={{ color: t.color, fontWeight: 700 }}>{t.name}</td>
                    <td>Ø{t.diameter} mm</td>
                    <td>{t.lengthH.toFixed(3)} mm</td>
                    <td>{t.wearH.toFixed(3)} mm</td>
                    <td>{t.flutes || '-'}</td>
                    <td>{t.coating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                sound.playSuccess();
                setTools(prev => prev.map(t => t.tool === activeToolStation ? { ...t, lengthH: Number((position.z).toFixed(3)) } : t));
                setAlarmMessage(`[MEASURE Z] Panjang alat ${activeToolObj.code} disimpan di H${activeToolObj.offset}.`);
              }}
              className="teknalar-lcdBtn"
            >
              [MEASURE Z] Touch-Off Muka Atas Z0
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setTools(DEFAULT_MILL_TOOLS);
                setAlarmMessage("[SUKSES] Tabel perkakas ATC dikembalikan ke default.");
              }}
              className="teknalar-lcdBtn"
              style={{ marginLeft: 'auto' }}
            >
              [RESET DEFAULT ATC]
            </button>
          </div>
        </div>
      )}

      {/* DRAWER 2: BAHAN BALOK */}
      {showStockDrawer && (
        <div className="teknalar-stockPanel">
          <div className="teknalar-stockHead">
            <strong style={{ color: '#34d399' }}>KONFIGURASI BAHAN BALOK (RAW BLOCK):</strong>
            <span>Atur panjang X, lebar Y, tebal Z, dan kedalaman jepit ragum</span>
            <button
              onClick={() => setShowStockDrawer(false)}
              className="teknalar-lcdBtn"
              style={{ marginLeft: 'auto' }}
            >
              [TUTUP]
            </button>
          </div>

          <div className="teknalar-stockFields">
            <label>
              Panjang X (mm):
              <input
                type="number"
                min="40"
                max="200"
                value={stockDraft.x}
                onChange={(e) => setStockDraft({ ...stockDraft, x: Number(e.target.value) })}
              />
            </label>
            <label>
              Lebar Y (mm):
              <input
                type="number"
                min="30"
                max="140"
                value={stockDraft.y}
                onChange={(e) => setStockDraft({ ...stockDraft, y: Number(e.target.value) })}
              />
            </label>
            <label>
              Tebal Z (mm):
              <input
                type="number"
                min="10"
                max="60"
                value={stockDraft.z}
                onChange={(e) => setStockDraft({ ...stockDraft, z: Number(e.target.value) })}
              />
            </label>
            <label>
              Jepit Ragum Z (mm):
              <input
                type="number"
                min="5"
                max="25"
                value={stockDraft.gripZ}
                onChange={(e) => setStockDraft({ ...stockDraft, gripZ: Number(e.target.value) })}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 10 }}>
            <button onClick={applyStockChanges} className="teknalar-lcdBtn" style={{ background: '#10b981', color: '#000', fontWeight: 800 }}>
              [PASANG BAHAN BALOK BARU]
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN UPPER STAGE */}
      <div className="teknalar-upper">
        {/* LEFT: MACHINE VIEWPORT */}
        <div className="teknalar-machine">
          <div className="teknalar-window">
            {viewMode === '2d' ? (
              /* 2D DENAH XY BLUEPRINT */
              <svg viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label="Denah XY Lintasan Frais CNC">
                <defs>
                  <pattern id="millGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#141f26" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="20" stroke="#141f26" strokeWidth="0.5" />
                  </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#millGrid)" />

                {/* Vise Outline */}
                <rect
                  x={toSvgX(-15)}
                  y={toSvgY(stock.y + 15)}
                  width={(stock.x + 30) * scale}
                  height={(stock.y + 30) * scale}
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="2"
                  rx="6"
                />

                {/* Raw Workpiece Block Outline */}
                <rect
                  x={toSvgX(0)}
                  y={toSvgY(stock.y)}
                  width={stock.x * scale}
                  height={stock.y * scale}
                  fill="#334155"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />

                {/* Origin Datum Symbol (X0 Y0 at bottom-left corner) */}
                <g transform={`translate(${toSvgX(0)}, ${toSvgY(0)})`}>
                  <circle cx="0" cy="0" r="6" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#10b981" strokeWidth="1" />
                  <line x1="0" y1="-10" x2="0" y2="10" stroke="#10b981" strokeWidth="1" />
                  <text x="8" y="12" fill="#10b981" fontSize="9" fontWeight="bold">G54 (X0,Y0)</text>
                </g>

                {/* Toolpath Motion Trails */}
                {simFrames.length > 0 && (
                  <g>
                    {simFrames.map((f, i) => {
                      if (i === 0) return null;
                      const prevF = simFrames[i - 1];
                      const isRapid = f.isRapid;
                      return (
                        <line
                          key={i}
                          x1={toSvgX(prevF.x)}
                          y1={toSvgY(prevF.y)}
                          x2={toSvgX(f.x)}
                          y2={toSvgY(f.y)}
                          stroke={isRapid ? '#38bdf8' : '#f59e0b'}
                          strokeWidth={isRapid ? 1 : 2}
                          strokeDasharray={isRapid ? '3 3' : 'none'}
                          opacity={i <= currentFrameIdx ? 1 : 0.35}
                        />
                      );
                    })}
                  </g>
                )}

                {/* Active Cutter Circle & Diameter Footprint */}
                <g transform={`translate(${toSvgX(position.x)}, ${toSvgY(position.y)})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r={(activeToolObj.diameter / 2) * scale}
                    fill={position.z <= 0 ? 'rgba(56, 189, 248, 0.4)' : 'none'}
                    stroke={activeToolObj.color || '#38bdf8'}
                    strokeWidth="2"
                  />
                  <circle cx="0" cy="0" r="2.5" fill="#ef4444" />
                  <text x="10" y="-8" fill="#e2e8f0" fontSize="9" fontWeight="bold">
                    {activeToolObj.code} (Z={position.z.toFixed(2)})
                  </text>
                </g>
              </svg>
            ) : (
              /* 3D VMC SCENE */
              <CncMill3DScene
                stock={{ x: stock.x, y: stock.y, z: stock.z }}
                toolPos={position}
                activeTool={activeToolObj}
                rpm={spindleState > 0 ? spindleRpm : 0}
                coolant={coolant}
                isCutting={isRunning && position.z <= 0}
                doorOpen={!doorClosed}
              />
            )}
          </div>

          {/* DIGITAL READOUT STRIP */}
          <div className="teknalar-readStrip read8">
            <div>
              <span>X (MEJA)</span>
              <strong>{position.x.toFixed(3)}<small>mm</small></strong>
            </div>
            <div>
              <span>Y (PELANA)</span>
              <strong>{position.y.toFixed(3)}<small>mm</small></strong>
            </div>
            <div>
              <span>Z (SPINDEL)</span>
              <strong style={{ color: position.z <= 0 ? '#38bdf8' : '#fff' }}>
                {position.z.toFixed(3)}<small>mm</small>
              </strong>
            </div>
            <div>
              <span>SPINDLE RPM</span>
              <strong style={{ color: spindleState > 0 ? '#4ade80' : '#fff' }}>{spindleRpm}</strong>
            </div>
            <div>
              <span>FEED RATE</span>
              <strong>{feedRate.toFixed(1)}<small>mm/m</small></strong>
            </div>
            <div>
              <span>ALAT POTONG</span>
              <strong style={{ color: activeToolObj.color }}>{activeToolObj.code}</strong>
            </div>
            <div>
              <span>COOLANT</span>
              <strong style={{ color: coolant ? '#38bdf8' : '#94a3b8' }}>{coolant ? 'M08' : 'M09'}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT: FANUC CRT DISPLAY */}
        <div className="teknalar-panel">
          <div className="teknalar-panelHeader">
            <span className="teknalar-panelTitle">FANUC Series 0i-MD</span>
            <div className="teknalar-headerIndicators">
              <span className={`teknalar-led ${powerOn ? 'on' : ''}`}>PWR</span>
              <span className={`teknalar-led ${isRunning ? 'run' : ''}`}>RUN</span>
              <span className={`teknalar-led ${alarmMessage ? 'alarm' : ''}`}>ALM</span>
            </div>
          </div>

          {/* CRT SCREEN */}
          <div className="teknalar-crt">
            <div className="teknalar-crtInner">
              <div className="teknalar-crtTop">
                <span className="teknalar-crtMode">[{modeSelect}]</span>
                <span className="teknalar-crtProg">O1001 (PRESET-{selectedPresetId.toUpperCase()})</span>
                <span className="teknalar-crtState">
                  {eStop ? 'EMG STOP' : isRunning ? 'EXECUTING' : 'READY'}
                </span>
              </div>

              {/* POS */}
              {lcdTab === 'POS' && (
                <div className="teknalar-lcdBody">
                  <div className="teknalar-posBlock">
                    <div className="teknalar-posRow">
                      <span className="teknalar-posAxis">X (MEJA)</span>
                      <span className="teknalar-posVal">{position.x.toFixed(3)}</span>
                      <span className="teknalar-posUnit">mm</span>
                    </div>
                    <div className="teknalar-posRow">
                      <span className="teknalar-posAxis">Y (SADDLE)</span>
                      <span className="teknalar-posVal">{position.y.toFixed(3)}</span>
                      <span className="teknalar-posUnit">mm</span>
                    </div>
                    <div className="teknalar-posRow">
                      <span className="teknalar-posAxis">Z (HEAD)</span>
                      <span className="teknalar-posVal">{position.z.toFixed(3)}</span>
                      <span className="teknalar-posUnit">mm</span>
                    </div>
                  </div>

                  <div className="teknalar-posSub">
                    <div>
                      <span>MACHINE X:</span>
                      <strong>{machinePos.x.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span>MACHINE Y:</span>
                      <strong>{machinePos.y.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span>MACHINE Z:</span>
                      <strong>{machinePos.z.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="teknalar-gCodeModalList">
                    <span>G17 (XY)</span>
                    <span>G21 (MM)</span>
                    <span>G40 (COMP OFF)</span>
                    <span>G54 (WORK 1)</span>
                    <span>G90 (ABS)</span>
                    <span>G94 (F/MIN)</span>
                  </div>
                </div>
              )}

              {/* PROG */}
              {lcdTab === 'PROG' && (
                <div className="teknalar-lcdBody">
                  <div className="teknalar-codeViewer">
                    {programText.split('\n').map((line, idx) => (
                      <div
                        key={idx}
                        className={`teknalar-codeLine ${activeLine === idx && isRunning ? 'active' : ''}`}
                      >
                        <span className="teknalar-lineNumber">{String(idx + 1).padStart(3, '0')}</span>
                        <span className="teknalar-lineText">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OFFSET */}
              {lcdTab === 'OFFSET' && (
                <div className="teknalar-lcdBody" style={{ overflowY: 'auto' }}>
                  <table className="teknalar-table">
                    <thead>
                      <tr>
                        <th>NO</th>
                        <th>PAHAT</th>
                        <th>DIAMETER</th>
                        <th>PANJANG H</th>
                        <th>WEAR H</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tools.map((t) => (
                        <tr key={t.tool} className={t.tool === activeToolStation ? 'act' : ''}>
                          <td>{t.code}</td>
                          <td>{t.name}</td>
                          <td>Ø{t.diameter}</td>
                          <td>{t.lengthH.toFixed(3)}</td>
                          <td>{t.wearH.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* DIAG */}
              {lcdTab === 'DIAG' && (
                <div className="teknalar-lcdBody">
                  <div className="teknalar-box" style={{ padding: 10 }}>
                    <p className="teknalar-boxTitle">STATUS VMC 3-AXIS</p>
                    <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6, color: '#94a3b8' }}>
                      <div>Spindle Power: <strong>{isRunning ? '55% (4.2 kW)' : '0% (IDLE)'}</strong></div>
                      <div>Axis Servo Load: <strong>X: 18% · Y: 22% · Z: 35%</strong></div>
                      <div>ATC Magazine Pockets: <strong>6 Ready</strong></div>
                      <div>Air Pressure: <strong>0.6 MPa (NORMAL)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {alarmMessage && (
                <div className="teknalar-crtAlarm">
                  <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} />
                  {alarmMessage}
                </div>
              )}

              {/* Softkeys */}
              <div className="teknalar-softkeys">
                {['POS', 'PROG', 'OFFSET', 'DIAG'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { sound.playClick(); setLcdTab(tab); }}
                    className={`teknalar-softBtn ${lcdTab === tab ? 'active' : ''}`}
                  >
                    [{tab}]
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HARDWARE MEMBRANE KEYPAD */}
          <div className="teknalar-hardware">
            <div className="teknalar-modeRow">
              {['AUTO', 'EDIT', 'MDI', 'JOG', 'REF'].map((m) => (
                <button
                  key={m}
                  onClick={() => { sound.playClick(); setModeSelect(m); }}
                  className={`teknalar-btnMode ${modeSelect === m ? 'active' : ''}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="teknalar-execRow">
              <button onClick={handleCycleStart} className="teknalar-btnCycleStart">
                <Play size={16} /> CYCLE START
              </button>
              <button onClick={handleFeedHold} className="teknalar-btnFeedHold">
                <Pause size={16} /> FEED HOLD
              </button>
              <button onClick={handleReset} className="teknalar-btnReset">
                <RotateCcw size={16} /> RESET
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setEStop(!eStop);
                  if (!eStop) setIsRunning(false);
                }}
                className={`teknalar-btnEStop ${eStop ? 'active' : ''}`}
              >
                E-STOP
              </button>
            </div>

            <div className="teknalar-toggleGrid">
              <button
                onClick={() => { sound.playClick(); setSingleBlock(!singleBlock); }}
                className={`teknalar-btnToggle ${singleBlock ? 'on' : ''}`}
              >
                SINGLE BLOCK: {singleBlock ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => { sound.playClick(); setCoolant(!coolant); }}
                className={`teknalar-btnToggle ${coolant ? 'on' : ''}`}
              >
                COOLANT: {coolant ? 'M08' : 'M09'}
              </button>
              <button
                onClick={() => { sound.playClick(); setDryRun(!dryRun); }}
                className={`teknalar-btnToggle ${dryRun ? 'on' : ''}`}
              >
                DRY RUN: {dryRun ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* JOG 3-Axis Pad */}
            <div className="teknalar-jogSection">
              <span className="teknalar-jogTitle">MANUAL JOG 3-SUMBU ({jogStep} mm)</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                <button onClick={() => handleJog('X', -1)} className="teknalar-jogBtn">[-X KIRI]</button>
                <button onClick={() => handleJog('Y', 1)} className="teknalar-jogBtn">[+Y MAJU]</button>
                <button onClick={() => handleJog('X', 1)} className="teknalar-jogBtn">[+X KANAN]</button>
                <button onClick={() => handleJog('Z', 1)} className="teknalar-jogBtn">[+Z NAIK]</button>
                <button onClick={() => handleJog('Y', -1)} className="teknalar-jogBtn">[-Y MUNDUR]</button>
                <button onClick={() => handleJog('Z', -1)} className="teknalar-jogBtn">[-Z TURUN]</button>
              </div>

              <div className="teknalar-stepRow">
                {[0.001, 0.01, 0.1, 1.0].map((step) => (
                  <button
                    key={step}
                    onClick={() => { sound.playClick(); setJogStep(step); }}
                    className={`teknalar-stepBtn ${jogStep === step ? 'active' : ''}`}
                  >
                    x{step}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CncMillTeknalar;

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sound } from '../utils/audio';
import '../styles/teknalar_cnc.css';
import {
  Play, Pause, RotateCcw, Activity, Shield, Settings,
  CheckCircle2, AlertTriangle, Eye, ArrowLeft, ArrowRight,
  Maximize2, Minimize2, Wrench, RefreshCw, Scissors, Compass
} from 'lucide-react';

// =============================================================================
// PRESET PROGRAM G-CODE RESMI TEKNALAR (CNC FRAIS / MILLING)
// =============================================================================
const MILL_PRESETS = [
  {
    id: "slot",
    title: "01 · Alur pertama",
    goal: "Pahat end mill turun ke Z−2, menyayat alur lurus selebar diameter pahat dari X12 ke X65, lalu naik kembali sebelum gerak cepat G00.",
    program: `(Alur pertama - titik nol sudut kiri depan atas)
G21 G17 G90 G94 G54
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
    program: `(Alur kontur dengan sudut R10)
G21 G17 G90 G94 G54
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
    program: `(Gerak bertahap relatif G91)
G21 G17 G90 G94 G54
T1 M6
G43 H1
G0 X15 Y15 Z10
G91
G1 X20 F500
G1 Y20
G1 X-20
G90
G0 X15 Y15
M30`
  },
  {
    id: "repair",
    title: "04 · Perbaiki gerak cepat",
    goal: "Pencegahan tabrakan: jangan gerakkan G00 mendatar saat pahat masih berada di dalam kedalaman bahan. Selalu angkat Z terlebih dahulu.",
    program: `(Perbaikan jalur cepat aman)
G21 G17 G90 G94 G54
T1 M6
G43 H1
S1800 M3
G0 X12 Y20 Z5
G1 Z-2 F80
G1 X65 F240
G0 Z10
G0 Y40
G0 Z10
M5
M30`
  },
  {
    id: "face",
    title: "05 · Facing dengan face mill",
    goal: "Face mill Ø50 meratakan permukaan atas 0,5 mm. Turunkan Z di luar bahan (X−30), lalu masuk menyayat dari samping.",
    program: `(Facing 0.5 mm dengan T2 Face Mill)
G21 G17 G90 G94 G54
G28 G91 Z0
G90
T2 M6
G43 H2
S1200 M3
M8
G0 X-30 Y15 Z5
G1 Z-0.5 F300
G1 X110 F400
G0 Y45
G1 X-30
G0 Z10
M9
M5
M30`
  },
  {
    id: "pocket",
    title: "06 · Kantong persegi",
    goal: "End mill Ø10 membuat kantong persegi 30×20 sedalam 3 mm: plunge di tengah, lalu lintasan zig-zag dengan step-over 7 mm.",
    program: `(Kantong 30x20x3 dengan T3 End Mill Ø10)
G21 G17 G90 G94 G54
G28 G91 Z0
G90
T3 M6
G43 H3
S2400 M3
M8
G0 X30 Y25 Z5
G1 Z-3 F80
G1 X30 Y25 F300
G1 X50
G1 Y32
G1 X30
G1 Y38
G1 X50
G1 Y25
G0 Z10
M9
M5
M30`
  },
  {
    id: "drill",
    title: "07 · Center drill & G81",
    goal: "T4 membuat titik senter 4 lubang dengan siklus G81, lalu T5 mengebor tembus Ø8,5 sedalam 12 mm dengan pembatalan siklus G80.",
    program: `(Pola 4 lubang center drill & bor)
G21 G17 G90 G94 G54
G28 G91 Z0
G90
T4 M6
G43 H4
S1500 M3
M8
G0 X20 Y15 Z20
G99 G81 X20 Y15 Z-2.5 R2 F100
X60
Y45
X20
G80
G0 Z20
M5
G28 G91 Z0
G90
T5 M6
G43 H5
S900 M3
G0 X20 Y15 Z20
G98 G81 X20 Y15 Z-12 R2 F120
X60
Y45
X20
G80
M9
M5
M30`
  },
  {
    id: "peck",
    title: "08 · Peck drilling G83",
    goal: "Pengeboran lubang dalam 14 mm dengan G83: mata bor masuk per 3 mm (Q3), mundur ke R untuk membuang tatal geram, lalu masuk kembali.",
    program: `(Peck drilling G83 dalam 14 mm)
G21 G17 G90 G94 G54
G28 G91 Z0
G90
T5 M6
G43 H5
S900 M3
M8
G0 X40 Y30 Z20
G98 G83 X40 Y30 Z-14 R2 Q3 F100
G73 X25 Y30 Z-10 R2 Q3
G80
M9
M5
M30`
  },
  {
    id: "tap",
    title: "09 · Tapping G84",
    goal: "Pembuatan ulir dalam M10×1,5 dengan siklus tap kaku G84. Kecepatan makan F wajib sinkron: F = kisar × RPM = 1,5 × 300 = 450 mm/menit.",
    program: `(Pengetapan ulir M10x1.5 dengan G84)
G21 G17 G90 G94 G54
G28 G91 Z0
G90
T5 M6
G43 H5
S900 M3
M8
G0 X40 Y30 Z20
G98 G81 X40 Y30 Z-14 R2 F120
G80
M5
G28 G91 Z0
G90
T6 M6
G43 H6
S300 M3
G0 X40 Y30 Z20
G98 G84 X40 Y30 Z-10 R5 F450
G80
M9
M5
M30`
  },
  {
    id: "comp",
    title: "10 · Kompensasi radius G41",
    goal: "Kompensasi radius pisau G41 D3: pusat end mill Ø10 digeser sejauh 5 mm ke luar profil gambar kerja agar dimensi part tepat 50×30.",
    program: `(Kontur luar 50x30 dengan G41)
G21 G17 G90 G94 G54
G28 G91 Z0
G90
T3 M6
G43 H3
S2000 M3
M8
G0 X0 Y0 Z5
G1 Z-3 F120
G41 D3 G1 X15 Y15 F300
G1 X65
G1 Y45
G1 X15
G1 Y15
G40 G1 X0 Y0
G0 Z20
M9
M5
M30`
  }
];

// =============================================================================
// DATABASE TOOL ATC MAGAZINE (STANDAR INDUSTRI TEKNALAR)
// =============================================================================
const INITIAL_MILL_TOOLS = [
  { tool: 1, code: "T01", name: "End mill Ø6", type: "flat", diameter: 6, length: 40, flute: 18, color: "#e7b85d" },
  { tool: 2, code: "T02", name: "Face mill Ø50", type: "face", diameter: 50, length: 45, flute: 6, color: "#9db7e8" },
  { tool: 3, code: "T03", name: "End mill Ø10", type: "flat", diameter: 10, length: 45, flute: 25, color: "#8fd3c8" },
  { tool: 4, code: "T04", name: "Center drill 90° Ø6", type: "center", diameter: 6, length: 35, flute: 6, point: 90, color: "#c9ced3" },
  { tool: 5, code: "T05", name: "Twist drill Ø8.5", type: "drill", diameter: 8.5, length: 60, flute: 40, point: 118, color: "#d9b76a" },
  { tool: 6, code: "T06", name: "Tap M10×1.5", type: "tap", diameter: 10, length: 55, flute: 20, pitch: 1.5, color: "#d6a4e8" }
];

export default function CncMillTeknalar({ onBack, addXP }) {
  // Workpiece Configuration
  const [stock, setStock] = useState({
    width: 80,
    depth: 60,
    thickness: 30,
    origin: "corner" // "corner" (X0 Y0 at bottom-left) or "center"
  });

  const [showStockConfig, setShowStockConfig] = useState(false);
  const [stockDraft, setStockDraft] = useState({ ...stock });

  // Tools in ATC
  const [tools, setTools] = useState(INITIAL_MILL_TOOLS);
  const [activeToolStation, setActiveToolStation] = useState(1);

  // Active Program & Mode
  const [selectedPresetId, setSelectedPresetId] = useState("slot");
  const [programText, setProgramText] = useState(MILL_PRESETS[0].program);
  const [machineMode, setMachineMode] = useState("AUTO"); // AUTO, EDIT, MDI, JOG, HANDLE, ZERO RETURN
  const [lcdTab, setLcdTab] = useState("POS"); // POS, PROG, OFFSET, LOAD, DIAG

  // Machine Position (XYZ)
  const [position, setPosition] = useState({ x: 0, y: 0, z: 25 });
  const [machinePos, setMachinePos] = useState({ x: 100, y: 150, z: 250 });
  const [rpm, setRpm] = useState(0);
  const [targetRpm, setTargetRpm] = useState(1800);
  const [feedRate, setFeedRate] = useState(240);
  const [spindleState, setSpindleState] = useState(0); // 0=stop, 1=CW, 2=CCW
  const [coolant, setCoolant] = useState(false);
  const [spindleLoad, setSpindleLoad] = useState(0); // 0 - 120%
  const [eStop, setEStop] = useState(false);

  // Overrides & Modals
  const [rapidOverride, setRapidOverride] = useState(100);
  const [feedOverride, setFeedOverride] = useState(100);
  const [spindleOverride, setSpindleOverride] = useState(100);
  const [singleBlock, setSingleBlock] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [jogStep, setJogStep] = useState(0.1);

  // View States
  const [viewMode, setViewMode] = useState("top"); // "top" (XY Plane), "front" (XZ Plane), "3d"
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Execution & Simulation Engine State
  const [isRunning, setIsRunning] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  const [simFrames, setSimFrames] = useState([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [stats, setStats] = useState({ rapidMm: 0, feedMm: 0, cutMm: 0, timeSec: 0, minZ: 0 });
  const [alarmMessage, setAlarmMessage] = useState("");

  const activePreset = useMemo(() => {
    return MILL_PRESETS.find(p => p.id === selectedPresetId) || MILL_PRESETS[0];
  }, [selectedPresetId]);

  // Load Preset
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

  // Compile / Parse CNC Milling G-Code
  const parseMillGCode = (text, stockConfig, currentTools) => {
    const lines = text.split(/\r?\n/);
    const frames = [];
    let curX = 0;
    let curY = 0;
    let curZ = 25;
    let curTool = 1;
    let curSpindle = 0;
    let curRpm = 1800;
    let curFeed = 240;
    let curCoolant = false;
    let isAbsolute = true;

    let rapidDist = 0;
    let feedDist = 0;
    let cutDist = 0;
    let totalTime = 0;
    let lowestZ = 0;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      let raw = lines[lineIdx].replace(/\([^)]*\)/g, '').trim().toUpperCase();
      if (!raw || raw.startsWith('%') || raw.startsWith('O')) continue;

      const words = {};
      const matches = raw.match(/[A-Z][+-]?\d*\.?\d+/g) || [];
      for (const m of matches) {
        words[m[0]] = parseFloat(m.slice(1));
      }

      // Tool change
      if (raw.includes('T')) {
        const tMatch = raw.match(/T(\d+)/);
        if (tMatch) curTool = parseInt(tMatch[1], 10);
      }

      // Spindle & Feed
      if (words.S !== undefined) curRpm = words.S;
      if (words.F !== undefined) curFeed = words.F;
      if (raw.includes('M3') || raw.includes('M03')) curSpindle = 1;
      if (raw.includes('M5') || raw.includes('M05')) curSpindle = 0;
      if (raw.includes('M8') || raw.includes('M08')) curCoolant = true;
      if (raw.includes('M9') || raw.includes('M09')) curCoolant = false;

      // Coordinate Motion target
      let targetX = curX;
      let targetY = curY;
      let targetZ = curZ;

      if (words.X !== undefined) targetX = words.X;
      if (words.Y !== undefined) targetY = words.Y;
      if (words.Z !== undefined) targetZ = words.Z;

      const isRapid = raw.includes('G0') || raw.includes('G00');
      const isFeed = raw.includes('G1') || raw.includes('G01') || raw.includes('G2') || raw.includes('G3') || raw.includes('G81') || raw.includes('G83') || raw.includes('G84');

      if (isRapid || isFeed) {
        const dX = targetX - curX;
        const dY = targetY - curY;
        const dZ = targetZ - curZ;
        const dist = Math.hypot(dX, dY, dZ);

        // Check if cutting into top of block (Z < 0)
        const isCutting = targetZ < 0 || curZ < 0;

        if (isRapid) {
          rapidDist += dist;
          totalTime += dist / 100; // Rapid ~100mm/s
        } else {
          feedDist += dist;
          if (isCutting) cutDist += dist;
          totalTime += dist / Math.max(1, curFeed / 60);
          if (targetZ < lowestZ) lowestZ = targetZ;
        }

        const steps = Math.max(1, Math.min(25, Math.ceil(dist / 2)));
        for (let s = 1; s <= steps; s++) {
          const interpX = curX + (dX * s) / steps;
          const interpY = curY + (dY * s) / steps;
          const interpZ = curZ + (dZ * s) / steps;

          frames.push({
            line: lineIdx,
            x: interpX,
            y: interpY,
            z: interpZ,
            isRapid,
            isCutting,
            tool: curTool,
            spindle: curSpindle,
            rpm: curRpm,
            feed: curFeed,
            coolant: curCoolant,
            load: isCutting ? Math.min(85, Math.round(30 + Math.abs(interpZ) * 15)) : 12
          });
        }

        curX = targetX;
        curY = targetY;
        curZ = targetZ;
      }
    }

    return {
      frames,
      stats: {
        rapidMm: Math.round(rapidDist),
        feedMm: Math.round(feedDist),
        cutMm: Math.round(cutDist),
        timeSec: Math.round(totalTime),
        minZ: Math.round(lowestZ * 10) / 10
      }
    };
  };

  // Compile on program or stock change
  useEffect(() => {
    const res = parseMillGCode(programText, stock, tools);
    setSimFrames(res.frames);
    setStats(res.stats);
  }, [programText, stock, tools]);

  // Playback Loop
  useEffect(() => {
    let animId = null;
    if (isRunning && simFrames.length > 0) {
      const intervalMs = Math.max(16, 75 - rapidOverride * 0.4);
      const timer = setInterval(() => {
        setCurrentFrameIdx((prev) => {
          if (prev >= simFrames.length - 1) {
            setIsRunning(false);
            sound.playSuccess();
            if (addXP) addXP(150);
            return prev;
          }
          const next = prev + 1;
          const f = simFrames[next];
          setPosition({ x: Number(f.x.toFixed(2)), y: Number(f.y.toFixed(2)), z: Number(f.z.toFixed(2)) });
          setMachinePos({ x: Number((f.x + 120).toFixed(2)), y: Number((f.y + 80).toFixed(2)), z: Number((f.z + 180).toFixed(2)) });
          setActiveLine(f.line);
          setActiveToolStation(f.tool);
          setSpindleLoad(f.load);
          return next;
        });
      }, intervalMs);

      return () => clearInterval(timer);
    }
  }, [isRunning, simFrames, rapidOverride, addXP]);

  // Operator Actions
  const handleCycleStart = () => {
    if (eStop) {
      setAlarmMessage("[ALARM] Emergency Stop aktif! Lepaskan E-Stop terlebih dahulu.");
      return;
    }
    sound.playClick();
    setAlarmMessage("");
    setIsRunning(true);
    setSpindleState(1);
    setRpm(targetRpm);
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
    setMachinePos({ x: 100, y: 150, z: 250 });
    setSpindleState(0);
    setRpm(0);
    setSpindleLoad(0);
    setAlarmMessage("");
  };

  const handleJog = (axis, dir) => {
    sound.playClick();
    if (isRunning) return;
    const delta = jogStep * dir;
    if (axis === 'X') setPosition(p => ({ ...p, x: Number((p.x + delta).toFixed(3)) }));
    if (axis === 'Y') setPosition(p => ({ ...p, y: Number((p.y + delta).toFixed(3)) }));
    if (axis === 'Z') setPosition(p => ({ ...p, z: Number((p.z + delta).toFixed(3)) }));
  };

  const applyStockChanges = () => {
    sound.playClick();
    setStock({ ...stockDraft });
    setShowStockConfig(false);
  };

  const activeToolObj = tools.find(t => t.tool === activeToolStation) || tools[0];

  // SVG Scalers for Milling Top View (XY) and Front View (XZ)
  const svgW = 620;
  const svgH = 260;
  const scale = 2.4;
  const originX = 140;
  const originY = 210;

  const toTopSvgX = (x) => originX + x * scale;
  const toTopSvgY = (y) => originY - y * scale;

  return (
    <div className={`teknalar-cnc-root ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* 1. TOP BAR */}
      <div className="teknalar-topbar">
        <div className="teknalar-brand">
          <strong>TEKNALAR CNC MILLING</strong>
          <span>3-AXIS (XYZ) · FANUC Series 0i-MF</span>
        </div>

        <div className="teknalar-topActions">
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="teknalar-topBtn"
            style={{ fontWeight: 700, color: '#facc15', background: '#1c1917' }}
          >
            {MILL_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <button
            onClick={() => setShowStockConfig(!showStockConfig)}
            className="teknalar-topBtn"
            style={{ color: '#38bdf8', borderColor: '#0284c7' }}
          >
            <Settings size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            Bahan {stock.width}×{stock.depth}×{stock.thickness}mm
          </button>

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setViewMode("top")}
              className={`teknalar-topBtn ${viewMode === 'top' ? 'on' : ''}`}
              style={{ background: viewMode === 'top' ? '#0369a1' : '#1e293b', color: '#fff' }}
            >
              Top (XY)
            </button>
            <button
              onClick={() => setViewMode("front")}
              className={`teknalar-topBtn ${viewMode === 'front' ? 'on' : ''}`}
              style={{ background: viewMode === 'front' ? '#0369a1' : '#1e293b', color: '#fff' }}
            >
              Front (XZ)
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`teknalar-topBtn ${viewMode === '3d' ? 'on' : ''}`}
              style={{ background: viewMode === '3d' ? '#0369a1' : '#1e293b', color: '#fff' }}
            >
              3D Real
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="teknalar-topBtn"
            title="Toggle Layar Penuh"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Stock Customization Drawer */}
      {showStockConfig && (
        <div className="teknalar-stockPanel">
          <div className="teknalar-stockHead">
            <strong>KONFIGURASI BENDA KERJA (MILLING STOCK BLOCK):</strong>
            <span>Atur dimensi balok kerja (Lebar X, Panjang Y, Tebal Z)</span>
            <button onClick={() => setShowStockConfig(false)} className="teknalar-lcdBtn" style={{ marginLeft: 'auto' }}>
              Tutup
            </button>
          </div>
          <div className="teknalar-stockFields">
            <label>
              Lebar X (mm):
              <input
                type="number"
                min="40"
                max="120"
                value={stockDraft.width}
                onChange={(e) => setStockDraft({ ...stockDraft, width: Number(e.target.value) })}
              />
            </label>
            <label>
              Panjang Y (mm):
              <input
                type="number"
                min="40"
                max="120"
                value={stockDraft.depth}
                onChange={(e) => setStockDraft({ ...stockDraft, depth: Number(e.target.value) })}
              />
            </label>
            <label>
              Tebal Z (mm):
              <input
                type="number"
                min="10"
                max="50"
                value={stockDraft.thickness}
                onChange={(e) => setStockDraft({ ...stockDraft, thickness: Number(e.target.value) })}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={applyStockChanges} className="teknalar-lcdBtn" style={{ background: '#f59e0b', color: '#000', fontWeight: 800 }}>
              Terapkan Balok Benda Kerja Baru
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN UPPER STAGE (CANVAS + FANUC CONTROLLER) */}
      <div className="teknalar-upper">
        {/* LEFT: MILLING VISUALIZER WINDOW */}
        <div className="teknalar-machine">
          <div className="teknalar-window">
            {viewMode === 'top' && (
              /* TOP VIEW (XY PLANE) */
              <svg viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label="Visual Top View CNC Milling">
                <defs>
                  <pattern id="millGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#15202b" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="20" stroke="#15202b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#millGrid)" />

                {/* Vise Bed Outline */}
                <rect
                  x={toTopSvgX(-10)}
                  y={toTopSvgY(stock.depth + 15)}
                  width={(stock.width + 20) * scale}
                  height={(stock.depth + 30) * scale}
                  fill="#1b242e"
                  stroke="#334155"
                  strokeWidth="2"
                  rx="6"
                />
                {/* Vise Jaws */}
                <rect
                  x={toTopSvgX(-5)}
                  y={toTopSvgY(stock.depth + 12)}
                  width={(stock.width + 10) * scale}
                  height="12"
                  fill="#475569"
                  stroke="#94a3b8"
                />
                <rect
                  x={toTopSvgX(-5)}
                  y={toTopSvgY(-2)}
                  width={(stock.width + 10) * scale}
                  height="12"
                  fill="#475569"
                  stroke="#94a3b8"
                />
                <text x={toTopSvgX(stock.width / 2)} y={toTopSvgY(stock.depth + 16)} fill="#94a3b8" fontSize="10" textAnchor="middle">
                  Rahang Ragum Mesin Presisi
                </text>

                {/* Raw Workpiece Block (XY) */}
                <rect
                  x={toTopSvgX(0)}
                  y={toTopSvgY(stock.depth)}
                  width={stock.width * scale}
                  height={stock.depth * scale}
                  fill="#0284c7"
                  fillOpacity="0.25"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <text x={toTopSvgX(stock.width / 2)} y={toTopSvgY(stock.depth / 2)} fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.6">
                  {stock.width} × {stock.depth} mm
                </text>

                {/* Work Datum G54 Origin marker */}
                <circle cx={toTopSvgX(0)} cy={toTopSvgY(0)} r="4" fill="#10b981" />
                <line x1={toTopSvgX(0) - 15} x2={toTopSvgX(0) + 25} y1={toTopSvgY(0)} y2={toTopSvgY(0)} stroke="#10b981" strokeWidth="1.5" />
                <line x1={toTopSvgX(0)} x2={toTopSvgX(0)} y1={toTopSvgY(0) + 15} y2={toTopSvgY(0) - 25} stroke="#10b981" strokeWidth="1.5" />
                <text x={toTopSvgX(0) + 6} y={toTopSvgY(0) - 6} fill="#10b981" fontSize="10" fontWeight="bold">X0 Y0 (G54)</text>

                {/* Tool Circle & Cursor (XY) */}
                <circle
                  cx={toTopSvgX(position.x)}
                  cy={toTopSvgY(position.y)}
                  r={(activeToolObj.diameter / 2) * scale}
                  fill={position.z < 0 ? "#10b981" : "#e2e8f0"}
                  fillOpacity={position.z < 0 ? "0.45" : "0.2"}
                  stroke={activeToolObj.color}
                  strokeWidth="2"
                />
                {/* Center dot */}
                <circle cx={toTopSvgX(position.x)} cy={toTopSvgY(position.y)} r="2" fill="#ef4444" />
                <text x={toTopSvgX(position.x) + 8} y={toTopSvgY(position.y) - 8} fill={activeToolObj.color} fontSize="10" fontWeight="bold">
                  {activeToolObj.code} ({activeToolObj.name})
                </text>
              </svg>
            )}

            {viewMode === 'front' && (
              /* FRONT VIEW (XZ PLANE) */
              <svg viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label="Visual Front View CNC Milling">
                <rect width="100%" height="100%" fill="#0a0f14" />
                {/* Table Line */}
                <line x1="20" x2={svgW - 20} y1="210" y2="210" stroke="#475569" strokeWidth="3" />
                <text x="30" y="225" fill="#64748b" fontSize="10">Meja Mesin (T-Slot Table)</text>

                {/* Workpiece Front (XZ) */}
                <rect
                  x={toTopSvgX(0)}
                  y={210 - stock.thickness * 2.5}
                  width={stock.width * scale}
                  height={stock.thickness * 2.5}
                  fill="#0369a1"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Z0 Top Face line */}
                <line x1={toTopSvgX(0) - 20} x2={toTopSvgX(stock.width) + 20} y1={210 - stock.thickness * 2.5} y2={210 - stock.thickness * 2.5} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />
                <text x={toTopSvgX(stock.width) + 26} y={210 - stock.thickness * 2.5 + 4} fill="#10b981" fontSize="10" fontWeight="bold">Z0 (Muka Atas)</text>

                {/* Vertical Milling Tool Cutter (XZ) */}
                <g transform={`translate(${toTopSvgX(position.x)}, ${210 - stock.thickness * 2.5 - position.z * 2.5})`}>
                  {/* Spindle Collet */}
                  <polygon points="-16,-45 16,-45 10,-20 -10,-20" fill="#64748b" stroke="#cbd5e1" />
                  {/* Tool Shank & Flutes */}
                  <rect
                    x={-(activeToolObj.diameter / 2) * scale}
                    y="-20"
                    width={activeToolObj.diameter * scale}
                    height="20"
                    fill={activeToolObj.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <line x1="0" y1="0" x2="0" y2="-20" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 2" />
                </g>
              </svg>
            )}

            {viewMode === '3d' && (
              /* 3D REALISTIC MILLING ENVIRONMENT */
              <div style={{ width: '100%', height: '100%', minHeight: 320, background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #090d12 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', width: '360px', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Spindle head & rotating tool */}
                  <div style={{
                    width: '45px',
                    height: '50px',
                    background: 'linear-gradient(180deg, #475569 0%, #1e293b 100%)',
                    border: '2px solid #cbd5e1',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: `${Math.min(24, activeToolObj.diameter * 2)}px`,
                      height: '24px',
                      background: activeToolObj.color,
                      border: '1px solid #fff',
                      marginTop: 'auto',
                      borderRadius: '0 0 2px 2px',
                      boxShadow: spindleState > 0 ? '0 0 12px rgba(250, 204, 21, 0.6)' : 'none'
                    }} />
                  </div>

                  {/* Workpiece block in vise */}
                  <div style={{
                    width: '240px',
                    height: '65px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #0c4a6e 100%)',
                    borderRadius: '6px',
                    border: '2px solid #38bdf8',
                    marginTop: '25px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 12
                  }}>
                    BALOK BENDA KERJA (G54)
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: 12, fontSize: 11, color: '#94a3b8', display: 'flex', gap: 16 }}>
                  <span>Spindle: {spindleState > 0 ? `${rpm} RPM (BERPUTAR)` : 'BERHENTI'}</span>
                  <span>Beban Spindle: {spindleLoad}%</span>
                  <span>Alat: {activeToolObj.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* DIGITAL READOUT STRIP */}
          <div className="teknalar-readStrip read8">
            <div>
              <span>X (ABSOLUT)</span>
              <strong>{position.x.toFixed(3)}<small>mm</small></strong>
            </div>
            <div>
              <span>Y (ABSOLUT)</span>
              <strong>{position.y.toFixed(3)}<small>mm</small></strong>
            </div>
            <div>
              <span>Z (ABSOLUT)</span>
              <strong style={{ color: position.z < 0 ? '#4ade80' : '#fff' }}>{position.z.toFixed(3)}<small>mm</small></strong>
            </div>
            <div>
              <span>SPINDLE RPM</span>
              <strong style={{ color: spindleState > 0 ? '#4ade80' : '#fff' }}>{rpm}</strong>
            </div>
            <div>
              <span>FEED F</span>
              <strong>{feedRate}</strong>
            </div>
            <div>
              <span>PAHAT AKTIF</span>
              <strong style={{ color: activeToolObj.color }}>{activeToolObj.code}</strong>
            </div>
            <div>
              <span>BEBAN SPINDLE</span>
              <strong style={{ color: spindleLoad > 80 ? '#f87171' : '#38bdf8' }}>{spindleLoad}%</strong>
            </div>
            <div>
              <span>STATUS</span>
              <strong style={{ color: isRunning ? '#4ade80' : '#f59e0b' }}>
                {isRunning ? 'RUN' : 'IDLE'}
              </strong>
            </div>
          </div>
        </div>

        {/* RIGHT: INDUSTRIAL FANUC OPERATOR CONTROLLER */}
        <div className="teknalar-control">
          <div className="teknalar-nameplate">
            FANUC Series 0i-MF
            <span>3-AXIS MILLING SYSTEM</span>
          </div>

          <div className="teknalar-bezel">
            {/* CRT LCD DISPLAY */}
            <div className="teknalar-lcd">
              <div className="teknalar-lcdHead">
                <span>MODE: {machineMode}</span>
                <span>O1001 (MILL PROGRAM)</span>
                <span>{singleBlock ? 'S-BLK' : 'CONT'}</span>
              </div>

              {/* TAB 1: POS (POSITION SCREEN) */}
              {lcdTab === 'POS' && (
                <div className="teknalar-lcdBody split">
                  <div className="teknalar-box">
                    <p className="teknalar-boxTitle">ACTUAL POSITION (ABSOLUTE)</p>
                    <div className="teknalar-bigAxis">
                      <span>X</span> {position.x.toFixed(3)}
                    </div>
                    <div className="teknalar-bigAxis">
                      <span>Y</span> {position.y.toFixed(3)}
                    </div>
                    <div className="teknalar-bigAxis">
                      <span>Z</span> {position.z.toFixed(3)}
                    </div>
                    <div style={{ padding: '6px 10px', fontSize: 11, color: '#94a3b8' }}>
                      <div>MODAL: G17 G21 G90 G94 G54 G43</div>
                      <div>ACTIVE H: H0{activeToolStation} · ACTIVE D: D0{activeToolStation}</div>
                    </div>
                  </div>

                  <div className="teknalar-box">
                    <p className="teknalar-boxTitle">ACTIVE PROGRAM BLOCK</p>
                    <div className="teknalar-prog">
                      {programText.split('\n').map((line, idx) => (
                        <div key={idx} className={idx === activeLine ? 'cur' : ''}>
                          N{(idx + 1) * 10} {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROG (G-CODE EDITOR) */}
              {lcdTab === 'PROG' && (
                <div className="teknalar-lcdBody" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#0e2a1a', fontSize: 11 }}>
                    <span>EDIT MODE G-CODE</span>
                    <button
                      onClick={() => handleReset()}
                      style={{ background: '#1e3a2b', color: '#6ee7b7', border: '1px solid #34d399', borderRadius: 3, padding: '2px 6px' }}
                    >
                      Kompilasi Ulang
                    </button>
                  </div>
                  <textarea
                    value={programText}
                    onChange={(e) => setProgramText(e.target.value)}
                    className="teknalar-editor"
                    spellCheck="false"
                  />
                </div>
              )}

              {/* TAB 3: OFFSET (TOOL LENGTH H & RADIUS D TABLE) */}
              {lcdTab === 'OFFSET' && (
                <div className="teknalar-lcdBody" style={{ overflowY: 'auto' }}>
                  <table className="teknalar-table">
                    <thead>
                      <tr>
                        <th>NO</th>
                        <th>NAMA ALAT</th>
                        <th>PANJANG H</th>
                        <th>DIAMETER D</th>
                        <th>FLUTE</th>
                        <th>WARNA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tools.map((t) => (
                        <tr key={t.tool} className={t.tool === activeToolStation ? 'act' : ''}>
                          <td>{t.code}</td>
                          <td>{t.name}</td>
                          <td>{t.length.toFixed(2)} mm</td>
                          <td>Ø{t.diameter.toFixed(1)} mm</td>
                          <td>{t.flute} mm</td>
                          <td><span style={{ display: 'inline-block', width: 10, height: 10, background: t.color, borderRadius: 2 }} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: LOAD / SPINDLE METER */}
              {lcdTab === 'LOAD' && (
                <div className="teknalar-lcdBody">
                  <div className="teknalar-box" style={{ padding: 12 }}>
                    <p className="teknalar-boxTitle">INDIKATOR BEBAN SPINDLE & PEMOTONGAN</p>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span>Spindle Motor Load:</span>
                        <strong style={{ color: spindleLoad > 80 ? '#f87171' : '#34d399' }}>{spindleLoad}%</strong>
                      </div>
                      <div style={{ width: '100%', height: 16, background: '#1e293b', borderRadius: 4, overflow: 'hidden', border: '1px solid #334155' }}>
                        <div style={{
                          width: `${spindleLoad}%`,
                          height: '100%',
                          background: spindleLoad > 80 ? '#ef4444' : spindleLoad > 50 ? '#f59e0b' : '#10b981',
                          transition: 'width 0.2s'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DIAG / ALARM */}
              {lcdTab === 'DIAG' && (
                <div className="teknalar-lcdBody">
                  <div className="teknalar-box" style={{ padding: 10 }}>
                    <p className="teknalar-boxTitle">DIAGNOSIS MESIN & ALARM STATUS</p>
                    <div style={{ color: alarmMessage ? '#f87171' : '#34d399', fontSize: 12, marginTop: 8 }}>
                      {alarmMessage || '[NORMAL] Mesin siap operasi. Spindle dan sumbu XYZ dalam toleransi presisi.'}
                    </div>
                  </div>
                </div>
              )}

              {/* SOFTKEYS (SCREEN BOTTOM BUTTONS) */}
              <div className="teknalar-softkeys">
                {['POS', 'PROG', 'OFFSET', 'LOAD', 'DIAG'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => { sound.playClick(); setLcdTab(tab); }}
                    className={lcdTab === tab ? 'on' : ''}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Side Bezel Strips */}
            <div className="teknalar-sideKeys">
              {[...Array(8)].map((_, i) => <span key={i} />)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM CNC OPERATOR CONTROL PANEL */}
      <div className="teknalar-panel">
        {/* MODE SELECTOR */}
        <div className="teknalar-group">
          <h4>MODE OPERASI</h4>
          <div className="teknalar-row">
            {['AUTO', 'EDIT', 'MDI', 'JOG', 'ZERO RETURN'].map(m => (
              <button
                key={m}
                onClick={() => { sound.playClick(); setMachineMode(m); }}
                className={`teknalar-key ${machineMode === m ? 'keyOn' : ''}`}
              >
                {m === 'AUTO' ? 'MEM' : m === 'ZERO RETURN' ? 'REF' : m}
              </button>
            ))}
          </div>
        </div>

        {/* CYCLE CONTROL (CYCLE START & FEED HOLD) */}
        <div className="teknalar-group">
          <h4>SIKLUS PROGRAM</h4>
          <div className="teknalar-row">
            <button
              onClick={handleCycleStart}
              disabled={isRunning}
              className="teknalar-key green2"
              style={{ minWidth: 64, minHeight: 46, fontWeight: 900 }}
            >
              <Play size={16} />
              START
            </button>
            <button
              onClick={handleFeedHold}
              disabled={!isRunning}
              className="teknalar-key yellow2"
              style={{ minWidth: 64, minHeight: 46, fontWeight: 900 }}
            >
              <Pause size={16} />
              HOLD
            </button>
            <button
              onClick={handleReset}
              className="teknalar-key"
              style={{ minWidth: 64, minHeight: 46 }}
            >
              <RotateCcw size={16} />
              RESET
            </button>
          </div>
        </div>

        {/* OPTION SWITCHES */}
        <div className="teknalar-group">
          <h4>OPSI EKSEKUSI</h4>
          <div className="teknalar-row">
            <button
              onClick={() => { sound.playClick(); setSingleBlock(!singleBlock); }}
              className={`teknalar-key ${singleBlock ? 'keyOn' : ''}`}
            >
              S-BLOCK
            </button>
            <button
              onClick={() => { sound.playClick(); setDryRun(!dryRun); }}
              className={`teknalar-key ${dryRun ? 'keyOn' : ''}`}
            >
              DRY RUN
            </button>
          </div>
        </div>

        {/* JOG 3-AXIS CONTROLS */}
        <div className="teknalar-group">
          <h4>JOG AXIS (MANUAL 3-AXIS)</h4>
          <div className="teknalar-row">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 44px)', gap: 4 }}>
              <button onClick={() => handleJog('X', -1)} className="teknalar-key">-X</button>
              <button onClick={() => handleJog('Y', 1)} className="teknalar-key">+Y</button>
              <button onClick={() => handleJog('X', 1)} className="teknalar-key">+X</button>
              <button onClick={() => handleJog('Z', 1)} className="teknalar-key">+Z</button>
              <button onClick={() => handleJog('Y', -1)} className="teknalar-key">-Y</button>
              <button onClick={() => handleJog('Z', -1)} className="teknalar-key">-Z</button>
            </div>
            <div className="teknalar-stack">
              {[0.001, 0.01, 0.1, 1.0].map(s => (
                <button
                  key={s}
                  onClick={() => { sound.playClick(); setJogStep(s); }}
                  className={`teknalar-key ${jogStep === s ? 'keyOn' : ''}`}
                  style={{ minWidth: 38, minHeight: 18, fontSize: 8 }}
                >
                  x{s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SPINDLE & COOLANT */}
        <div className="teknalar-group">
          <h4>SPINDLE & PENDINGIN</h4>
          <div className="teknalar-row">
            <button
              onClick={() => { sound.playClick(); setSpindleState(1); setRpm(targetRpm); }}
              className={`teknalar-key ${spindleState === 1 ? 'keyOn teal2' : ''}`}
            >
              CW (M03)
            </button>
            <button
              onClick={() => { sound.playClick(); setSpindleState(0); setRpm(0); }}
              className={`teknalar-key ${spindleState === 0 ? 'red2' : ''}`}
            >
              STOP (M05)
            </button>
            <button
              onClick={() => { sound.playClick(); setCoolant(!coolant); }}
              className={`teknalar-key ${coolant ? 'keyOn teal2' : ''}`}
            >
              COOLANT
            </button>
          </div>
        </div>

        {/* OVERRIDES */}
        <div className="teknalar-group">
          <h4>OVERRIDE KECEPATAN</h4>
          <div className="teknalar-ovr">
            <div className="teknalar-ovrItem">
              <span>RAPID</span>
              <div className="teknalar-ovrVal">{rapidOverride}%</div>
              <div className="teknalar-ovrBtns">
                {[25, 50, 100].map(r => (
                  <button
                    key={r}
                    onClick={() => { sound.playClick(); setRapidOverride(r); }}
                    style={{ background: rapidOverride === r ? '#f59e0b' : '#334155' }}
                  >
                    {r === 100 ? '100' : r}
                  </button>
                ))}
              </div>
            </div>

            <div className="teknalar-ovrItem">
              <span>FEED</span>
              <div className="teknalar-ovrVal">{feedOverride}%</div>
              <div className="teknalar-ovrBtns">
                <button onClick={() => setFeedOverride(o => Math.max(0, o - 10))}>-</button>
                <button onClick={() => setFeedOverride(100)}>100</button>
                <button onClick={() => setFeedOverride(o => Math.min(150, o + 10))}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* SAFETY & E-STOP */}
        <div className="teknalar-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => {
              sound.playClick();
              setEStop(!eStop);
              if (!eStop) {
                setIsRunning(false);
                setSpindleState(0);
                setRpm(0);
                setAlarmMessage("[EMERGENCY STOP] Mesin Frais dihentikan darurat!");
              } else {
                setAlarmMessage("");
              }
            }}
            className={`teknalar-estop ${eStop ? 'estopDown' : ''}`}
            title="Emergency Stop"
          >
            E-STOP
          </button>
        </div>
      </div>

      {/* 4. WORKSHOP CASE NOTES & GOAL (TEKNALAR STYLE) */}
      <div className="teknalar-notes">
        <div className="teknalar-notesGrid">
          <div className="teknalar-card">
            <h3>TARGET & SASARAN PRAKTIK:</h3>
            <p className="teknalar-goal">
              {activePreset.goal}
            </p>
          </div>

          <div className="teknalar-card">
            <h3>INFORMASI PAHAT & BENDA KERJA:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: '#334155' }}>
              <div>Bahan: <strong>Aluminium 6061 ({stock.width} × {stock.depth} × {stock.thickness} mm)</strong></div>
              <div>Pencekaman: <strong>Precision Machine Vise (Ragum)</strong></div>
              <div>Pahat Aktif: <strong>{activeToolObj.name} ({activeToolObj.code})</strong></div>
              <div>Panjang Sayat: <strong>{stats.cutMm} mm (Feed {stats.feedMm} mm)</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

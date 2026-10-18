import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sound } from '../utils/audio';
import '../styles/teknalar_cnc.css';
import {
  Play, Pause, RotateCcw, Activity, Shield, Settings,
  CheckCircle2, AlertTriangle, Eye, ArrowLeft, ArrowRight,
  Maximize2, Minimize2, Wrench, RefreshCw, Scissors, Compass
} from 'lucide-react';

// =============================================================================
// PRESET PROGRAM G-CODE RESMI TEKNALAR (CNC BUBUT / LATHE)
// =============================================================================
const LATHE_PRESETS = [
  {
    id: "turn",
    title: "01 · Bubut lurus",
    goal: "Turunkan Ø50 menjadi Ø46 sepanjang 35 mm dalam dua lintasan. Perhatikan penarikan X sebelum kembali ke Z positif.",
    program: `G21 G18 G40 G54 G99
T0101
G97 S900 M3
M8
G0 X52 Z2
G1 X48 F0.2
G1 Z-35
G0 X54
G0 Z2
G1 X46
G1 Z-35
G0 X66
G0 Z10
M9
M5
M30`
  },
  {
    id: "face",
    title: "02 · Facing",
    goal: "Ratakan muka 1 mm; muka hasil bergeser ke Z−1 terhadap nol awal. Pahat melewati sumbu sampai X−1,6 (2 × radius ujung R0,8) untuk membersihkan tonjolan pusat.",
    program: `G21 G18 G40 G54 G99
T0101
G97 S900 M3
M8
G0 X54 Z2
G0 Z-1
G1 X-1.6 F0.12
G0 Z2
G0 X66
G0 Z10
M9
M5
M30`
  },
  {
    id: "step",
    title: "03 · Diameter bertingkat",
    goal: "Buat Ø48 sepanjang 40 mm, lalu Ø46 sepanjang 20 mm. Amati bentuk poros bertingkat terbentuk.",
    program: `G21 G18 G40 G54 G99
T0101
G97 S900 M3
M8
G0 X52 Z2
G1 X48 F0.2
G1 Z-40
G0 X54
G0 Z2
G1 X46
G1 Z-20
G0 X66
G0 Z10
M9
M5
M30`
  },
  {
    id: "taper",
    title: "04 · Bentuk tirus",
    goal: "Gerak X dan Z sinkron bersamaan membentuk bidang tirus. Diameter bertambah dari Ø46 di muka menuju Ø50 pada Z−25.",
    program: `G21 G18 G40 G54 G99
T0101
G97 S900 M3
M8
G0 X52 Z2
G1 X46 F0.15
G1 Z0
G1 X50 Z-25
G0 X66
G0 Z10
M9
M5
M30`
  },
  {
    id: "coordinates",
    title: "05 · Koordinat & jog",
    goal: "X/Z menentukan posisi absolut. U/W menentukan perpindahan relatif inkremental. U−10 menggerakkan pahat 5 mm secara radial.",
    program: `G21 G18 G54 G98
G0 X66 Z10
G1 U-10 F300
G1 W-5
G0 X66 Z10
M30`
  },
  {
    id: "repair",
    title: "06 · Perbaiki G00",
    goal: "G00 cepat pada kedalaman sayat dapat menabrak bahu bahan. Hindari bahaya tabrakan pahat dengan selalu menarik X terlebih dahulu.",
    program: `G21 G18 G40 G54 G99
T0101
G97 S900 M3
M8
G0 X52 Z2
G1 X48 F0.2
G1 Z-20
G0 X54
G0 Z2
G1 X46
G1 Z-35
G0 X66 Z10
M9
M5
M30`
  },
  {
    id: "thread",
    title: "07 · Ulir luar G32",
    goal: "Bubut diameter mayor Ø46 dengan T0101, lalu buat ulir metrik M46×1,5 dari Z0 sampai Z−30 memakai T0505 dalam pass bertahap.",
    program: `G21 G18 G40 G54 G99
T0101
G50 S2000
G96 S180 M3
M8
G0 X52 Z2
G0 X46
G1 Z-32 F0.15
G0 X52
G0 Z10
M5
T0505
G97 S600 M3
G0 X50 Z5
G0 X45.5
G32 Z-30 F1.5
G0 X50
G0 Z5
G0 X44.8
G32 Z-30 F1.5
G0 X50
G0 Z5
G0 X44.16
G32 Z-30 F1.5
G0 X50
G0 Z10
M9
M5
M30`
  },
  {
    id: "css",
    title: "08 · CSS G96 & clamp G50",
    goal: "Kecepatan potong konstan (G96): RPM spindle otomatis naik saat diameter mengecil, dan dibatasi aman oleh clamp G50 S1800.",
    program: `G21 G18 G40 G54 G99
T0202
G50 S1800
G96 S140 M3
M8
G0 X52 Z2
G1 X48 F0.2
G1 Z-30
G0 X54
G0 Z10
M9
M5
M30`
  },
  {
    id: "cycle-g76",
    title: "09 · Siklus ulir G76",
    goal: "Jalankan siklus dua-blok G76: roughing otomatis bertahap, pass penyelesaian akhir, dan penarikan otomatis ke titik awal.",
    program: `G21 G18 G40 G54 G99
T0505
G50 S1200
G97 S600 M3
M8
G0 X52 Z2
G76 P020060 Q50 R0.05
G76 X48.8 Z-30 P600 Q250 F1.5
G0 X54 Z10
M9
M5
M30`
  },
  {
    id: "cycle-g90",
    title: "10 · Siklus G90",
    goal: "G90 menggabungkan 4 gerakan dalam 1 blok: masuk X, sayat Z, keluar X, dan mundur Z. Blok berikutnya cukup diisi nilai X.",
    program: `G21 G18 G40 G54 G99
T0101
G97 S900 M3
M8
G0 X52 Z2
G90 X48 Z-30 F0.2
X46
X44
G0 X66 Z10
M9
M5
M30`
  },
  {
    id: "cycle-g71",
    title: "11 · Roughing G71 & finishing G70",
    goal: "G71 membuang material berlapis mengikuti kontur profil N10–N20. Lalu G70 menggunakan pahat finishing T0202 menyusuri kontur halus.",
    program: `G21 G18 G40 G54 G99
T0101
G97 S900 M3
M8
G0 X52 Z2
G71 U1.5 R0.5
G71 P10 Q20 U0.4 W0.1 F0.25
N10 G0 X30
G1 Z0
G1 X40 Z-15
G1 Z-30
N20 G1 X52
G0 X66 Z10
M5
T0202
G97 S1200 M3
G0 X52 Z2
G70 P10 Q20
G0 X66 Z10
M9
M5
M30`
  },
  {
    id: "cycle-g92",
    title: "12 · Siklus ulir G92",
    goal: "Siklus ulir G92 sederhana: mengulang lintasan ulir sinkron dengan pitch F. Setiap baris baru cukup memasukkan diameter X lebih dalam.",
    program: `G21 G18 G40 G54 G99
T0505
G97 S600 M3
M8
G0 X50 Z4
G92 X45.5 Z-25 F1.5
X45.0
X44.6
X44.3
X44.16
G0 X66 Z10
M9
M5
M30`
  }
];

// =============================================================================
// DATABASE TOOL TURRET (STANDAR INDUSTRI TEKNALAR)
// =============================================================================
const INITIAL_TOOLS = [
  { tool: 1, offset: 1, code: "T0101", name: "OD turning / facing", type: "od", insert: "diamond", noseRadius: 0.8, geometryX: 0, geometryZ: 0, wearX: 0, wearZ: 0, color: "#e7b85d", insertAngle: 80, approach: 95 },
  { tool: 2, offset: 2, code: "T0202", name: "Finishing 35°", type: "finish", insert: "diamond", noseRadius: 0.4, geometryX: -0.12, geometryZ: 0.08, wearX: 0, wearZ: 0, color: "#8fd3c8", insertAngle: 35, approach: 93 },
  { tool: 3, offset: 3, code: "T0303", name: "Grooving 3 mm", type: "groove", insert: "blade", noseRadius: 0.15, width: 3, geometryX: 0, geometryZ: 0.12, wearX: 0, wearZ: 0, color: "#f6a36b" },
  { tool: 4, offset: 4, code: "T0404", name: "Boring bar Ø8", type: "boring", insert: "bar", noseRadius: 0.4, geometryX: 0, geometryZ: 0, wearX: 0, wearZ: 0, color: "#9db7e8", bar: 8, reach: 60 },
  { tool: 5, offset: 5, code: "T0505", name: "Threading 60°", type: "thread", insert: "triangle", noseRadius: 0.1, geometryX: 0, geometryZ: 0, wearX: 0, wearZ: 0, color: "#d6a4e8" },
  { tool: 6, offset: 6, code: "T0606", name: "Center drill 90° Ø10", type: "drill", insert: "drill", noseRadius: 0, geometryX: 0, geometryZ: 0, wearX: 0, wearZ: 0, color: "#c9ced3", point: 90 },
  { tool: 7, offset: 7, code: "T0707", name: "Twist drill Ø12", type: "drill", insert: "drill", noseRadius: 0, geometryX: 0, geometryZ: 0, wearX: 0, wearZ: 0, color: "#d9b76a", point: 118 },
  { tool: 8, offset: 8, code: "T0808", name: "Twist drill Ø20", type: "drill", insert: "drill", noseRadius: 0, geometryX: 0, geometryZ: 0, wearX: 0, wearZ: 0, color: "#d9b76a", point: 118 },
  { tool: 9, offset: 9, code: "T0909", name: "Ulir dalam 60° Ø10", type: "threadIn", insert: "bar", noseRadius: 0.1, geometryX: 0, geometryZ: 0, wearX: 0, wearZ: 0, color: "#d6a4e8", bar: 10, reach: 45 }
];

export default function CncLatheTeknalar({ onBack, addXP }) {
  // Workpiece Configuration
  const [stock, setStock] = useState({
    diameter: 50,
    length: 90,
    grip: 25,
    zeroZ: 0,
    correctionX: 0
  });

  const [showStockConfig, setShowStockConfig] = useState(false);
  const [stockDraft, setStockDraft] = useState({ ...stock });

  // Tool Turret Table
  const [tools, setTools] = useState(INITIAL_TOOLS);
  const [activeToolStation, setActiveToolStation] = useState(1);

  // Active Program & Mode
  const [selectedPresetId, setSelectedPresetId] = useState("turn");
  const [programText, setProgramText] = useState(LATHE_PRESETS[0].program);
  const [machineMode, setMachineMode] = useState("AUTO"); // AUTO, EDIT, MDI, JOG, HANDLE, ZERO RETURN
  const [lcdTab, setLcdTab] = useState("POS"); // POS, PROG, OFFSET, UKUR, DIAG

  // Machine States
  const [position, setPosition] = useState({ x: 66, z: 10 });
  const [machinePos, setMachinePos] = useState({ x: 150, z: 250 });
  const [rpm, setRpm] = useState(0);
  const [targetRpm, setTargetRpm] = useState(900);
  const [feedRate, setFeedRate] = useState(0.2);
  const [spindleState, setSpindleState] = useState(0); // 0=stop, 1=CW, 2=CCW
  const [coolant, setCoolant] = useState(false);
  const [doorClosed, setDoorClosed] = useState(true);
  const [chuckClamped, setChuckClamped] = useState(true);
  const [eStop, setEStop] = useState(false);

  // Overrides & Modals
  const [rapidOverride, setRapidOverride] = useState(100);
  const [feedOverride, setFeedOverride] = useState(100);
  const [spindleOverride, setSpindleOverride] = useState(100);
  const [singleBlock, setSingleBlock] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [jogStep, setJogStep] = useState(0.1);

  // View States
  const [viewMode, setViewMode] = useState("2d"); // "2d" (Blueprint SVG) or "3d" (Realistic)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Execution & Simulation Engine State
  const [isRunning, setIsRunning] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  const [simFrames, setSimFrames] = useState([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [stats, setStats] = useState({ rapidMm: 0, feedMm: 0, cutMm: 0, timeSec: 0, minDia: 50 });
  const [profileCut, setProfileCut] = useState([]);
  const [alarmMessage, setAlarmMessage] = useState("");

  // Measurement Cursor (UKUR)
  const [measureZ, setMeasureZ] = useState(-15);
  const [measureInputDia, setMeasureInputDia] = useState("50.00");

  const activePreset = useMemo(() => {
    return LATHE_PRESETS.find(p => p.id === selectedPresetId) || LATHE_PRESETS[0];
  }, [selectedPresetId]);

  // Load Preset
  const handleSelectPreset = (id) => {
    sound.playClick();
    setSelectedPresetId(id);
    const p = LATHE_PRESETS.find(item => item.id === id);
    if (p) {
      setProgramText(p.program);
      setIsRunning(false);
      setCurrentFrameIdx(0);
      setActiveLine(0);
    }
  };

  // Compile / Parse G-Code into Simulation Frames
  const parseGCode = (text, stockConfig, currentTools) => {
    const lines = text.split(/\r?\n/);
    const frames = [];
    let curX = 66;
    let curZ = 10;
    let curTool = 1;
    let curSpindle = 0;
    let curRpm = 900;
    let curFeed = 0.2;
    let curCoolant = false;
    let isMetric = true;
    let isAbsolute = true;
    let isFeedPerRev = true;
    let isCSS = false;
    let g50Limit = 2500;

    let rapidDist = 0;
    let feedDist = 0;
    let cutDist = 0;
    let totalTime = 0;
    let minD = stockConfig.diameter;

    // Initial stock profile radius points along Z from 0 down to -(length - grip)
    const zSteps = Math.ceil(stockConfig.length);
    let workProfile = new Float32Array(zSteps).fill(stockConfig.diameter / 2);

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      let raw = lines[lineIdx].replace(/\([^)]*\)/g, '').trim().toUpperCase();
      if (!raw || raw.startsWith('%') || raw.startsWith('O')) continue;

      // Extract words
      const words = {};
      const matches = raw.match(/[A-Z][+-]?\d*\.?\d+/g) || [];
      for (const m of matches) {
        words[m[0]] = parseFloat(m.slice(1));
      }

      // Check tool change
      if (raw.includes('T')) {
        const tMatch = raw.match(/T(\d{2})(\d{2})/);
        if (tMatch) {
          curTool = parseInt(tMatch[1], 10);
        }
      }

      // Spindle & Feed
      if (words.S !== undefined) {
        if (raw.includes('G50')) {
          g50Limit = words.S;
        } else {
          curRpm = words.S;
        }
      }
      if (words.F !== undefined) curFeed = words.F;
      if (raw.includes('M3') || raw.includes('M03')) curSpindle = 1;
      if (raw.includes('M4') || raw.includes('M04')) curSpindle = 2;
      if (raw.includes('M5') || raw.includes('M05')) curSpindle = 0;
      if (raw.includes('M8') || raw.includes('M08')) curCoolant = true;
      if (raw.includes('M9') || raw.includes('M09')) curCoolant = false;

      // Coordinate Motion target
      let targetX = curX;
      let targetZ = curZ;

      if (words.X !== undefined) targetX = words.X;
      if (words.Z !== undefined) targetZ = words.Z;
      if (words.U !== undefined) targetX = curX + words.U;
      if (words.W !== undefined) targetZ = curZ + words.W;

      const isRapid = raw.includes('G0') || raw.includes('G00');
      const isFeed = raw.includes('G1') || raw.includes('G01') || raw.includes('G32') || raw.includes('G90') || raw.includes('G76');

      if (isRapid || isFeed) {
        const dX = targetX - curX;
        const dZ = targetZ - curZ;
        const dist = Math.hypot(dX / 2, dZ);

        // Check if tool tip is cutting into material (Z <= 0 and X/2 < stockRadius)
        const isCutting = (targetZ <= 0 || curZ <= 0) && (targetX < stockConfig.diameter || curX < stockConfig.diameter);

        if (isRapid) {
          rapidDist += dist;
          totalTime += dist / 80; // Rapid ~80mm/s
        } else {
          feedDist += dist;
          if (isCutting) cutDist += dist;
          const actualRpm = curRpm > 0 ? curRpm : 800;
          const speedMmS = isFeedPerRev ? (curFeed * actualRpm) / 60 : curFeed / 60;
          totalTime += dist / Math.max(0.5, speedMmS);
        }

        // Subdivide move into fine animation samples
        const steps = Math.max(1, Math.min(25, Math.ceil(dist / 1.5)));
        for (let s = 1; s <= steps; s++) {
          const interpX = curX + (dX * s) / steps;
          const interpZ = curZ + (dZ * s) / steps;

          // Update workpiece profile if cutting
          if (interpZ <= 0 && interpZ >= -(stockConfig.length - stockConfig.grip)) {
            const zIdx = Math.min(zSteps - 1, Math.max(0, Math.floor(-interpZ)));
            const radiusAtZ = interpX / 2;
            if (radiusAtZ < workProfile[zIdx]) {
              workProfile[zIdx] = Math.max(0, radiusAtZ);
              if (radiusAtZ * 2 < minD) minD = radiusAtZ * 2;
            }
          }

          frames.push({
            line: lineIdx,
            x: interpX,
            z: interpZ,
            isRapid,
            isCutting,
            tool: curTool,
            spindle: curSpindle,
            rpm: curRpm,
            feed: curFeed,
            coolant: curCoolant,
            profileSnapshot: Array.from(workProfile)
          });
        }

        curX = targetX;
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
        minDia: Math.round(minD * 10) / 10
      }
    };
  };

  // Compile on programText change or stock change
  useEffect(() => {
    const res = parseGCode(programText, stock, tools);
    setSimFrames(res.frames);
    setStats(res.stats);
    if (res.frames.length > 0) {
      setProfileCut(res.frames[0].profileSnapshot);
    }
  }, [programText, stock, tools]);

  // Playback Animation Loop
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
          setPosition({ x: Number(f.x.toFixed(2)), z: Number(f.z.toFixed(2)) });
          setMachinePos({ x: Number((f.x + 100).toFixed(2)), z: Number((f.z + 240).toFixed(2)) });
          setActiveLine(f.line);
          setProfileCut(f.profileSnapshot);
          setActiveToolStation(f.tool);
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
    if (!doorClosed) {
      setAlarmMessage("[PERINGATAN] Pintu pelindung terbuka! Tutup pintu demi keselamatan.");
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
    setPosition({ x: 66, z: 10 });
    setMachinePos({ x: 150, z: 250 });
    setSpindleState(0);
    setRpm(0);
    setAlarmMessage("");
    if (simFrames.length > 0) {
      setProfileCut(simFrames[0].profileSnapshot);
    }
  };

  const handleJog = (axis, dir) => {
    sound.playClick();
    if (isRunning) return;
    const delta = jogStep * dir;
    if (axis === 'X') {
      setPosition(p => ({ ...p, x: Number((p.x + delta * 2).toFixed(3)) }));
      setMachinePos(m => ({ ...m, x: Number((m.x + delta * 2).toFixed(3)) }));
    } else if (axis === 'Z') {
      setPosition(p => ({ ...p, z: Number((p.z + delta).toFixed(3)) }));
      setMachinePos(m => ({ ...m, z: Number((m.z + delta).toFixed(3)) }));
    }
  };

  const applyStockChanges = () => {
    sound.playClick();
    setStock({ ...stockDraft });
    setShowStockConfig(false);
  };

  // SVG Dimension Scale Calculations for 2D View
  const maxZ = stock.length;
  const maxRadius = stock.diameter / 2;
  const svgW = 620;
  const svgH = 260;
  const scale = Math.min((svgW - 80) / (maxZ + 25), (svgH - 60) / (maxRadius + 15));

  const originSvgX = 480;
  const originSvgY = 150;

  const toSvgX = (z) => originSvgX + z * scale;
  const toSvgY = (radius) => originSvgY - radius * scale;

  // Workpiece Polygon Points
  const workpiecePoints = useMemo(() => {
    const pts = [];
    const gripZ = -(stock.length - stock.grip);

    // Top profile along Z
    pts.push(`${toSvgX(gripZ)},${toSvgY(0)}`);
    pts.push(`${toSvgX(gripZ)},${toSvgY(maxRadius)}`);

    if (profileCut && profileCut.length > 0) {
      for (let i = 0; i < Math.min(profileCut.length, stock.length - stock.grip); i++) {
        const curZ = -i;
        const curR = profileCut[i] !== undefined ? profileCut[i] : maxRadius;
        pts.push(`${toSvgX(curZ)},${toSvgY(curR)}`);
      }
    } else {
      pts.push(`${toSvgX(0)},${toSvgY(maxRadius)}`);
    }

    pts.push(`${toSvgX(0)},${toSvgY(0)}`);
    return pts.join(' ');
  }, [stock, profileCut, scale, maxRadius]);

  const activeToolObj = tools.find(t => t.tool === activeToolStation) || tools[0];

  return (
    <div className={`teknalar-cnc-root ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* 1. TOP BAR */}
      <div className="teknalar-topbar">
        <div className="teknalar-brand">
          <strong>TEKNALAR CNC LATHE</strong>
          <span>2-AXIS (XZ) · FANUC Oi-TF</span>
        </div>

        <div className="teknalar-topActions">
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="teknalar-topBtn"
            style={{ fontWeight: 700, color: '#facc15', background: '#1c1917' }}
          >
            {LATHE_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <button
            onClick={() => setShowStockConfig(!showStockConfig)}
            className="teknalar-topBtn"
            style={{ color: '#38bdf8', borderColor: '#0284c7' }}
          >
            <Settings size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            Bahan Ø{stock.diameter}×{stock.length}mm
          </button>

          <button
            onClick={() => setViewMode(v => v === '2d' ? '3d' : '2d')}
            className="teknalar-topBtn"
            style={{ background: viewMode === '3d' ? '#0369a1' : '#1e293b', color: '#fff' }}
          >
            <Eye size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            {viewMode === '2d' ? 'Mode 2D Lintasan SVG' : 'Mode 3D Realistis'}
          </button>

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
            <strong>KONFIGURASI BENDA KERJA (RAW STOCK):</strong>
            <span>Atur diameter, panjang total, dan kedalaman jepit cekam chuck</span>
            <button
              onClick={() => setShowStockConfig(false)}
              className="teknalar-lcdBtn"
              style={{ marginLeft: 'auto' }}
            >
              Tutup
            </button>
          </div>
          <div className="teknalar-stockFields">
            <label>
              Diameter Bahan (mm):
              <input
                type="number"
                min="20"
                max="80"
                value={stockDraft.diameter}
                onChange={(e) => setStockDraft({ ...stockDraft, diameter: Number(e.target.value) })}
              />
            </label>
            <label>
              Panjang Total (mm):
              <input
                type="number"
                min="40"
                max="160"
                value={stockDraft.length}
                onChange={(e) => setStockDraft({ ...stockDraft, length: Number(e.target.value) })}
              />
            </label>
            <label>
              Panjang Dijepit Chuck (mm):
              <input
                type="number"
                min="15"
                max="60"
                value={stockDraft.grip}
                onChange={(e) => setStockDraft({ ...stockDraft, grip: Number(e.target.value) })}
              />
            </label>
            <label>
              Work Offset G54 Z (mm):
              <input
                type="number"
                step="0.1"
                value={stockDraft.zeroZ}
                onChange={(e) => setStockDraft({ ...stockDraft, zeroZ: Number(e.target.value) })}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={applyStockChanges} className="teknalar-lcdBtn" style={{ background: '#f59e0b', color: '#000', fontWeight: 800 }}>
              Terapkan Benda Kerja Baru
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN UPPER STAGE (MACHINE CANVAS + FANUC CNC PANEL) */}
      <div className="teknalar-upper">
        {/* LEFT: MACHINE VISUALIZER WINDOW */}
        <div className="teknalar-machine">
          <div className="teknalar-window">
            {viewMode === '2d' ? (
              /* 2D HIGH-PRECISION BLUEPRINT SVG CANVAS */
              <svg viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label="Visual Lintasan Pahat Bubut CNC">
                {/* Background Grid */}
                <defs>
                  <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#141f26" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="20" stroke="#141f26" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridPattern)" />

                {/* Spindle Centerline Axis */}
                <line x1="20" x2={svgW - 20} y1={originSvgY} y2={originSvgY} stroke="#38bdf8" strokeWidth="1" strokeDasharray="8 4 2 4" opacity="0.6" />
                <text x={svgW - 30} y={originSvgY - 4} fill="#64748b" fontSize="10" textAnchor="end">Sumbu Putar X0</text>

                {/* 3-Jaw Chuck Block */}
                <rect
                  x={toSvgX(-(stock.length - stock.grip) - 60)}
                  y={toSvgY(maxRadius + 28)}
                  width="60"
                  height={(maxRadius + 28) * 2 * scale}
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="2"
                  rx="3"
                />
                {/* Top & Bottom Chuck Jaws */}
                <rect
                  x={toSvgX(-(stock.length - stock.grip) - 10)}
                  y={toSvgY(maxRadius + 14)}
                  width="20"
                  height="26"
                  fill="#334155"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
                <rect
                  x={toSvgX(-(stock.length - stock.grip) - 10)}
                  y={originSvgY + (maxRadius - 12) * scale}
                  width="20"
                  height="26"
                  fill="#334155"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
                <text x={toSvgX(-(stock.length - stock.grip)) - 14} y={24} fill="#f43f5e" fontSize="10" fontWeight="bold">Rahang Chuck</text>

                {/* Workpiece Body (Symmetrical Bottom & Top) */}
                <polygon points={workpiecePoints} fill="#38bdf8" fillOpacity="0.22" stroke="#38bdf8" strokeWidth="1.5" />
                {/* Mirror for lower half cylinder */}
                <g transform={`translate(0, ${originSvgY * 2}) scale(1, -1)`}>
                  <polygon points={workpiecePoints} fill="#38bdf8" fillOpacity="0.12" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
                </g>

                {/* G54 Z0 Face Datum Line */}
                <line x1={toSvgX(0)} x2={toSvgX(0)} y1="20" y2={svgH - 20} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x={toSvgX(0) + 4} y="32" fill="#10b981" fontSize="11" fontWeight="bold">Z0 (G54 Face)</text>

                {/* Tool Turret Head & Active Cutting Tip */}
                <g transform={`translate(${toSvgX(position.z)}, ${toSvgY(position.x / 2)})`}>
                  {/* Tool Holder Shank */}
                  <rect x="0" y="-12" width="55" height="24" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" rx="2" />
                  {/* Carbide Cutting Insert */}
                  <polygon
                    points="0,0 12,-10 24,-10 12,0"
                    fill={activeToolObj.color || "#f59e0b"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* Tool Tip Marker Dot */}
                  <circle cx="0" cy="0" r="3" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="14" y="16" fill="#e2e8f0" fontSize="9" fontWeight="bold">{activeToolObj.code}</text>
                </g>

                {/* Spindle Rotation Indicator */}
                {spindleState > 0 && (
                  <g transform={`translate(${toSvgX(0) + 20}, ${originSvgY})`}>
                    <path d="M 0,-18 A 18 18 0 0 1 18,0" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="3 2" />
                    <polygon points="18,-3 22,2 16,3" fill="#facc15" />
                    <text x="24" y="4" fill="#facc15" fontSize="9" fontWeight="bold">{rpm} RPM</text>
                  </g>
                )}
              </svg>
            ) : (
              /* 3D REALISTIC CANVASCAP (PERSPECTIVE WORKBENCH) */
              <div style={{ width: '100%', height: '100%', minHeight: 320, background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #090d12 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', width: '380px', height: '160px', display: 'flex', alignItems: 'center' }}>
                  {/* Chuck 3D cylinder */}
                  <div style={{ width: '70px', height: '140px', background: 'linear-gradient(90deg, #334155 0%, #64748b 50%, #1e293b 100%)', borderRadius: '8px 0 0 8px', border: '2px solid #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '10px', height: '110px', background: '#0f172a', borderRadius: '4px' }} />
                  </div>

                  {/* Stock Bar 3D cylinder */}
                  <div style={{
                    width: `${Math.min(220, stock.length * 1.8)}px`,
                    height: `${stock.diameter * 1.8}px`,
                    background: 'linear-gradient(180deg, #94a3b8 0%, #e2e8f0 30%, #475569 80%, #1e293b 100%)',
                    borderRadius: '0 6px 6px 0',
                    boxShadow: spindleState > 0 ? '0 0 16px rgba(56, 189, 248, 0.4)' : 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Turned stepped profile simulation */}
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '15%',
                      bottom: '15%',
                      width: '60%',
                      background: 'linear-gradient(180deg, #38bdf8 0%, #bae6fd 40%, #0284c7 90%)',
                      borderLeft: '2px solid #fff'
                    }} />
                  </div>

                  {/* 3D Tool Holder */}
                  <div style={{
                    position: 'absolute',
                    right: `${Math.max(20, 180 - position.z * 1.5)}px`,
                    top: `${Math.max(10, 60 - position.x * 0.8)}px`,
                    width: '60px',
                    height: '35px',
                    background: '#334155',
                    border: '2px solid #cbd5e1',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                    transition: isRunning ? 'none' : 'all 0.1s linear'
                  }}>
                    <div style={{ width: '12px', height: '12px', background: activeToolObj.color, transform: 'rotate(45deg)', margin: '-4px 0 0 -4px' }} />
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: 12, fontSize: 11, color: '#94a3b8', display: 'flex', gap: 16 }}>
                  <span>Spindle: {spindleState > 0 ? `${rpm} RPM (BERPUTAR)` : 'BERHENTI'}</span>
                  <span>Coolant: {coolant ? 'AKTIF (M08)' : 'MATI'}</span>
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
              <span>Z (ABSOLUT)</span>
              <strong>{position.z.toFixed(3)}<small>mm</small></strong>
            </div>
            <div>
              <span>SPINDLE RPM</span>
              <strong style={{ color: spindleState > 0 ? '#4ade80' : '#fff' }}>{rpm}</strong>
            </div>
            <div>
              <span>FEED F</span>
              <strong>{feedRate.toFixed(3)}</strong>
            </div>
            <div>
              <span>PAHAT AKTIF</span>
              <strong style={{ color: activeToolObj.color }}>{activeToolObj.code}</strong>
            </div>
            <div>
              <span>MODAL</span>
              <strong style={{ fontSize: 12, color: '#38bdf8' }}>G18 G54 G99</strong>
            </div>
            <div>
              <span>WAKTU SIKLUS</span>
              <strong>{stats.timeSec}s</strong>
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
            FANUC Series 0i-TF
            <span>CNC OPERATING SYSTEM</span>
          </div>

          <div className="teknalar-bezel">
            {/* CRT LCD DISPLAY */}
            <div className="teknalar-lcd">
              <div className="teknalar-lcdHead">
                <span>MODE: {machineMode}</span>
                <span>O0001 (LATHE PROGRAM)</span>
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
                      <span>Z</span> {position.z.toFixed(3)}
                    </div>
                    <div style={{ padding: '6px 10px', fontSize: 11, color: '#94a3b8' }}>
                      <div>DIST TO GO: X 0.000  Z 0.000</div>
                      <div>MACHINE: X {machinePos.x.toFixed(3)}  Z {machinePos.z.toFixed(3)}</div>
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

              {/* TAB 3: OFFSET (TOOL GEOMETRY & WEAR TABLE) */}
              {lcdTab === 'OFFSET' && (
                <div className="teknalar-lcdBody" style={{ overflowY: 'auto' }}>
                  <table className="teknalar-table">
                    <thead>
                      <tr>
                        <th>NO</th>
                        <th>NAMA ALAT</th>
                        <th>GEOM X</th>
                        <th>GEOM Z</th>
                        <th>WEAR X</th>
                        <th>WEAR Z</th>
                        <th>RADIUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tools.map((t) => (
                        <tr key={t.tool} className={t.tool === activeToolStation ? 'act' : ''}>
                          <td>{t.code}</td>
                          <td>{t.name}</td>
                          <td>{t.geometryX.toFixed(3)}</td>
                          <td>{t.geometryZ.toFixed(3)}</td>
                          <td>{t.wearX.toFixed(3)}</td>
                          <td>{t.wearZ.toFixed(3)}</td>
                          <td>R{t.noseRadius.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: UKUR (MEASUREMENT & TOUCH-OFF CALIPER) */}
              {lcdTab === 'UKUR' && (
                <div className="teknalar-lcdBody">
                  <div className="teknalar-box" style={{ padding: 10 }}>
                    <p className="teknalar-boxTitle">PENGUKURAN DIAMETER POROS & WEAR COMPENSATION</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>Posisi Z Ukur:</span>
                        <input
                          type="number"
                          value={measureZ}
                          onChange={(e) => setMeasureZ(Number(e.target.value))}
                          style={{ width: '100%', background: '#0a1610', border: '1px solid #2e6a45', color: '#fff', padding: 4 }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>Hasil Ukur Mikrometer Ø (mm):</span>
                        <input
                          type="number"
                          step="0.01"
                          value={measureInputDia}
                          onChange={(e) => setMeasureInputDia(e.target.value)}
                          style={{ width: '100%', background: '#0a1610', border: '1px solid #2e6a45', color: '#fff', padding: 4 }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        sound.playSuccess();
                        const diff = Number(measureInputDia) - 46.0;
                        setTools(prev => prev.map(t => t.tool === activeToolStation ? { ...t, wearX: Number(diff.toFixed(3)) } : t));
                        setAlarmMessage(`[SUKSES] Wear X terkompensasi: ${diff.toFixed(3)} mm`);
                      }}
                      className="teknalar-lcdBtn"
                      style={{ marginTop: 10, width: '100%', background: '#059669', color: '#fff', fontWeight: 800 }}
                    >
                      Hitung & Terapkan Koreksi Wear X Otomatis
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: DIAG / ALARM */}
              {lcdTab === 'DIAG' && (
                <div className="teknalar-lcdBody">
                  <div className="teknalar-box" style={{ padding: 10 }}>
                    <p className="teknalar-boxTitle">DIAGNOSIS MESIN & ALARM STATUS</p>
                    <div style={{ color: alarmMessage ? '#f87171' : '#34d399', fontSize: 12, marginTop: 8 }}>
                      {alarmMessage || '[NORMAL] Tidak ada alarm. Semua sumbu dalam kondisi siap operasi (READY).'}
                    </div>
                  </div>
                </div>
              )}

              {/* SOFTKEYS (SCREEN BOTTOM BUTTONS) */}
              <div className="teknalar-softkeys">
                {['POS', 'PROG', 'OFFSET', 'UKUR', 'DIAG'].map(tab => (
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

        {/* JOG AXIS CONTROLS */}
        <div className="teknalar-group">
          <h4>JOG AXIS (MANUAL)</h4>
          <div className="teknalar-row">
            <div className="teknalar-jog">
              <button onClick={() => handleJog('X', 1)} className="teknalar-key">+X</button>
              <button onClick={() => handleJog('Z', 1)} className="teknalar-key">+Z</button>
              <button onClick={() => handleJog('X', -1)} className="teknalar-key">-X</button>
              <button onClick={() => handleJog('Z', -1)} className="teknalar-key">-Z</button>
            </div>
            <div className="teknalar-stack">
              {[0.001, 0.01, 0.1, 1.0].map(s => (
                <button
                  key={s}
                  onClick={() => { sound.playClick(); setJogStep(s); }}
                  className={`teknalar-key ${jogStep === s ? 'keyOn' : ''}`}
                  style={{ minWidth: 42, minHeight: 20, fontSize: 9 }}
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
                setAlarmMessage("[EMERGENCY STOP] Mesin dihentikan darurat!");
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
              <div>Bahan: <strong>Baja St 37 (Ø{stock.diameter} × {stock.length} mm)</strong></div>
              <div>Pencekaman: <strong>3-Jaw Chuck ({stock.grip} mm dijepit)</strong></div>
              <div>Pahat Aktif: <strong>{activeToolObj.name} ({activeToolObj.code})</strong></div>
              <div>Panjang Sayat: <strong>{stats.cutMm} mm (Feed {stats.feedMm} mm)</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

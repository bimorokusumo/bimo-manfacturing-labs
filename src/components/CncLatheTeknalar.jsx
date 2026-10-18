import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sound } from '../utils/audio';
import '../styles/teknalar_cnc.css';
import CncLathe3DScene from './CncLathe3DScene';
import {
  Play, Pause, RotateCcw, Activity, Shield, Settings,
  CheckCircle2, AlertTriangle, Eye, ArrowLeft, ArrowRight,
  Maximize2, Minimize2, Wrench, RefreshCw, Scissors, Compass,
  Layers, Disc, Box, Crosshair, ChevronRight, Gauge
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
    title: "06 · Perbaikan program",
    goal: "Perbaiki urutan gerak agar pahat tidak memotong saat kembali ke Z positif (hindari tabrakan lintasan kembali).",
    program: `G21 G18 G40 G54 G99
T0101
G97 S900 M3
M8
G0 X52 Z2
G1 X46 F0.2
G1 Z-30
G0 X54
G0 Z2
G0 X66 Z10
M9
M5
M30`
  },
  {
    id: "thread",
    title: "07 · Ulir luar G32",
    goal: "Pembuatan ulir luar metris M48x2 dengan perintah G32 dalam beberapa kedalaman penyayatan (passes).",
    program: `G21 G18 G40 G54 G99
T0505
G97 S600 M3
M8
G0 X52 Z4
G0 X47.4
G32 Z-25 F2.0
G0 X54
G0 Z4
G0 X46.8
G32 Z-25 F2.0
G0 X54
G0 Z4
G0 X46.2
G32 Z-25 F2.0
G0 X54
G0 Z4
G0 X45.55
G32 Z-25 F2.0
G0 X66
G0 Z10
M9
M5
M30`
  },
  {
    id: "css",
    title: "08 · CSS / G96",
    goal: "Kecepatan potong konstan (Constant Surface Speed). RPM naik otomatis saat mendekati pusat X0 untuk menjaga kualitas permukaan.",
    program: `G21 G18 G40 G54 G99
T0101
G50 S2200
G96 S140 M3
M8
G0 X54 Z2
G0 Z0
G1 X-1.6 F0.12
G0 Z2
G0 X66 Z10
G97 S900
M9
M5
M30`
  },
  {
    id: "cycle-g76",
    title: "09 · Siklus ulir G76",
    goal: "Siklus ulir otomatis majemuk G76 dengan pemakanan berkurang (flank infeed) untuk mencegah keausan insert pahat.",
    program: `G21 G18 G40 G54 G99
T0505
G97 S650 M3
M8
G0 X52 Z5
G76 P010060 Q100 R0.05
G76 X45.55 Z-25 P1226 Q250 F2.0
G0 X66 Z10
M9
M5
M30`
  },
  {
    id: "cycle-g90",
    title: "10 · Siklus bubut G90",
    goal: "Siklus pembubutan luar bertingkat G90 berulang dalam kotak gerak otomatis.",
    program: `G21 G18 G40 G54 G99
T0101
G97 S900 M3
M8
G0 X54 Z2
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
    title: "11 · Siklus pengasaran G71",
    goal: "Siklus pembubutan kontur kasar G71 yang memotong material tebal secara otomatis lapis demi lapis sesuai profil N10-N20.",
    program: `G21 G18 G40 G54 G99
T0101
G97 S900 M3
M8
G0 X54 Z2
G71 U2.0 R1.0
G71 P10 Q20 U0.5 W0.1 F0.25
N10 G0 X30
G1 Z-15 F0.15
X40 Z-25
Z-40
X50
N20 G1 Z-45
G0 X66 Z10
M9
M5
M30`
  },
  {
    id: "cycle-g92",
    title: "12 · Siklus ulir G92",
    goal: "Siklus pembuatan ulir sederhana kotak G92 dalam 4 tahapan kedalaman pemakanan.",
    program: `G21 G18 G40 G54 G99
T0505
G97 S600 M3
M8
G0 X54 Z4
G92 X47.4 Z-24 F2.0
X46.8
X46.2
X45.55
G0 X66 Z10
M9
M5
M30`
  }
];

// =============================================================================
// DAFTAR ALAT POTONG TURRET 8 STASIUN (STANDAR INDUSTRI & ISO)
// =============================================================================
const DEFAULT_TURRET_TOOLS = [
  {
    tool: 1,
    offset: 1,
    code: "T0101",
    name: "OD Roughing / Facing (80°)",
    type: "od",
    insert: "CNMG 120408",
    noseRadius: 0.8,
    insertAngle: 80,
    approach: 95,
    maxDepth: 4.0,
    geometryX: 0.0,
    geometryZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    color: "#e7b85d"
  },
  {
    tool: 2,
    offset: 2,
    code: "T0202",
    name: "Finishing Tajam 35°",
    type: "finish",
    insert: "VNMG 160404",
    noseRadius: 0.4,
    insertAngle: 35,
    approach: 93,
    maxDepth: 1.5,
    geometryX: -0.12,
    geometryZ: 0.08,
    wearX: 0.0,
    wearZ: 0.0,
    color: "#8fd3c8"
  },
  {
    tool: 3,
    offset: 3,
    code: "T0303",
    name: "Alur Luar (Grooving 3mm)",
    type: "groove",
    insert: "CoroCut 3.0mm",
    noseRadius: 0.15,
    width: 3.0,
    reach: 26,
    geometryX: 0.0,
    geometryZ: 0.12,
    wearX: 0.0,
    wearZ: 0.0,
    color: "#f6a36b"
  },
  {
    tool: 4,
    offset: 4,
    code: "T0404",
    name: "Boring Bar Lubang Ø8",
    type: "boring",
    insert: "CCMT 060204",
    noseRadius: 0.4,
    bar: 8,
    reach: 55,
    insertAngle: 55,
    approach: 93,
    geometryX: 0.0,
    geometryZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    color: "#9db7e8"
  },
  {
    tool: 5,
    offset: 5,
    code: "T0505",
    name: "Ulir Luar 60° (Threading)",
    type: "thread",
    insert: "ISO 16ER AG60",
    noseRadius: 0.1,
    insertAngle: 60,
    geometryX: 0.0,
    geometryZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    color: "#d6a4e8"
  },
  {
    tool: 6,
    offset: 6,
    code: "T0606",
    name: "Center Drill 90° Ø10",
    type: "drill",
    insert: "HSS Center Drill",
    noseRadius: 0.0,
    width: 10,
    point: 90,
    geometryX: 0.0,
    geometryZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    color: "#c9ced3"
  },
  {
    tool: 7,
    offset: 7,
    code: "T0707",
    name: "Twist Drill Spiral Ø12",
    type: "drill",
    insert: "HSS Twist Drill",
    noseRadius: 0.0,
    width: 12,
    point: 118,
    geometryX: 0.0,
    geometryZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    color: "#fcd34d"
  },
  {
    tool: 8,
    offset: 8,
    code: "T0808",
    name: "Ulir Dalam 60° (Internal)",
    type: "threadIn",
    insert: "ISO 11IR A60",
    noseRadius: 0.1,
    bar: 10,
    reach: 45,
    insertAngle: 60,
    geometryX: 0.0,
    geometryZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    color: "#a78bfa"
  }
];

// =============================================================================
// MODE SELECTION ANGLES & OVERRIDE KNOB COMPONENT
// =============================================================================
const MODES = [
  { mode: 'AUTO', label: 'MEM', angle: -95 },
  { mode: 'EDIT', label: 'EDIT', angle: -45 },
  { mode: 'MDI', label: 'MDI', angle: 0 },
  { mode: 'JOG', label: 'JOG', angle: 45 },
  { mode: 'REF', label: 'ZERO RETURN', angle: 130 },
  { mode: 'HANDLE', label: 'HANDLE', angle: -135 }
];

const OverrideKnob = ({ label, value, steps, onChange, disabled }) => {
  const o = Math.max(0, steps.indexOf(value));
  const deg = -135 + (270 * o) / Math.max(1, steps.length - 1);
  const stepBy = (dir) => {
    const nextIdx = Math.min(steps.length - 1, Math.max(0, o + dir));
    onChange(steps[nextIdx]);
  };

  return (
    <div className="teknalar-ovrItem">
      <span>{label}</span>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        className="teknalar-ovrKnob"
        style={{ '--a': `${deg}deg` }}
        onClick={(e) => {
          if (disabled) return;
          const rect = e.currentTarget.getBoundingClientRect();
          stepBy(e.clientX < rect.left + rect.width / 2 ? -1 : 1);
        }}
      />
      <span className="teknalar-ovrVal">{value}%</span>
      <div className="teknalar-ovrBtns">
        <button type="button" disabled={disabled} onClick={() => stepBy(-1)}>
          −
        </button>
        <button type="button" disabled={disabled} onClick={() => stepBy(1)}>
          +
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// KOMPONEN UTAMA SIMULATOR CNC BUBUT TEKNALAR
// =============================================================================
const CncLatheTeknalar = ({ addXP }) => {
  // Preset & Editor Program
  const [selectedPresetId, setSelectedPresetId] = useState("turn");
  const [programText, setProgramText] = useState(LATHE_PRESETS[0].program);

  // Setup Benda Kerja (Raw Stock)
  const [stock, setStock] = useState({
    diameter: 50,
    length: 90,
    grip: 25,
    zeroZ: 0.0
  });
  const [showStockDrawer, setShowStockDrawer] = useState(false);
  const [stockDraft, setStockDraft] = useState({ ...stock });

  // Tool Turret & Library
  const [tools, setTools] = useState(DEFAULT_TURRET_TOOLS);
  const [activeToolStation, setActiveToolStation] = useState(1);
  const [showTurretDrawer, setShowTurretDrawer] = useState(false);
  const [selectedToolForEdit, setSelectedToolForEdit] = useState(1);

  // Display Softkeys & Modes
  const [modeSelect, setModeSelect] = useState("AUTO"); // AUTO, EDIT, MDI, JOG, HANDLE, REF
  const [lcdTab, setLcdTab] = useState("POS"); // POS, PROG, OFFSET, GRAPHIC, MDI, BAHAN, UKUR, DIAG
  const [viewMode, setViewMode] = useState("2d"); // "2d" (Blueprint SVG) or "3d" (Slant-bed Canvas)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Machine Hardware & Status
  const [powerOn, setPowerOn] = useState(true);
  const [eStop, setEStop] = useState(false);
  const [spindleState, setSpindleState] = useState(0); // 0=stop, 1=CW (M3), 2=CCW (M4)
  const [spindleRpm, setSpindleRpm] = useState(900);
  const [coolant, setCoolant] = useState(false);
  const [doorClosed, setDoorClosed] = useState(true);
  const [chuckClamped, setChuckClamped] = useState(true);

  // Overrides & Execution Switches
  const [rapidOverride, setRapidOverride] = useState(100);
  const [feedOverride, setFeedOverride] = useState(100);
  const [spindleOverride, setSpindleOverride] = useState(100);
  const [singleBlock, setSingleBlock] = useState(false);
  const [optionalStop, setOptionalStop] = useState(true);
  const [blockDelete, setBlockDelete] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [jogStep, setJogStep] = useState(0.1);

  // Running State & Profile Data
  const [isRunning, setIsRunning] = useState(false);
  const [activeLine, setActiveLine] = useState(0);
  const [simFrames, setSimFrames] = useState([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [profileCut, setProfileCut] = useState([]);
  const [threads, setThreads] = useState([]);
  const [alarmMessage, setAlarmMessage] = useState("");
  const [mdiInput, setMdiInput] = useState("G0 U2");

  // Coordinates
  const [position, setPosition] = useState({ x: 66, z: 10 });
  const [machinePos, setMachinePos] = useState({ x: 200, z: 250 });
  const [relPos, setRelPos] = useState({ u: 0, w: 0 });
  const [feedRate, setFeedRate] = useState(0.2);

  // UKUR & Pengukuran
  const [measureZ, setMeasureZ] = useState(-15);
  const [measureDiaInput, setMeasureDiaInput] = useState("46.00");

  const activeToolObj = useMemo(() => {
    return tools.find(t => t.tool === activeToolStation) || tools[0];
  }, [tools, activeToolStation]);

  const activePreset = useMemo(() => {
    return LATHE_PRESETS.find(p => p.id === selectedPresetId) || LATHE_PRESETS[0];
  }, [selectedPresetId]);

  // Handle Preset Select
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

  // ===========================================================================
  // INTERPRETER G-CODE & SIMULATION ENGINE LENGKAP DENGAN MODAL G0/G1
  // ===========================================================================
  const compileProgram = (text, stk, curTools) => {
    const rawLines = text.split(/\r?\n/);
    const frames = [];
    const exposedLen = stk.length - stk.grip;
    const zResolution = 0.25; // mm per segment along Z
    const zSteps = Math.ceil(exposedLen / zResolution);
    const rawRadius = stk.diameter / 2;

    // Workpiece radius array along Z from 0 down to -exposedLen
    let workProfile = new Float32Array(zSteps).fill(rawRadius);
    let threadList = [];

    let curX = 66.0;
    let curZ = 10.0;
    let activeToolNum = 1;
    let activeMotion = 0; // 0=G00, 1=G01, 2=G02, 3=G03, 32=G32, 90=G90, 92=G92, 76=G76
    let curRpm = 900;
    let curFeed = 0.2;
    let curSpindle = 0;
    let curCoolant = false;
    let errorAlarm = "";

    for (let lineIdx = 0; lineIdx < rawLines.length; lineIdx++) {
      let line = rawLines[lineIdx].replace(/\([^)]*\)/g, '').trim().toUpperCase();
      if (!line || line.startsWith('%') || line.startsWith('O')) continue;

      // Parse Words
      const words = {};
      const matches = line.match(/([A-Z])([+-]?\d*\.?\d+)/g) || [];
      for (const m of matches) {
        const letter = m[0];
        const val = parseFloat(m.slice(1));
        words[letter] = val;
      }

      // Check Motion Mode
      if (line.includes('G00') || (line.includes('G0') && !line.includes('G01') && !line.includes('G02') && !line.includes('G03'))) activeMotion = 0;
      else if (line.includes('G01') || line.includes('G1')) activeMotion = 1;
      else if (line.includes('G02') || line.includes('G2')) activeMotion = 2;
      else if (line.includes('G03') || line.includes('G3')) activeMotion = 3;
      else if (line.includes('G32')) activeMotion = 32;
      else if (line.includes('G92')) activeMotion = 92;
      else if (line.includes('G76')) activeMotion = 76;
      else if (line.includes('G90')) activeMotion = 90;

      // Tool change
      if (line.includes('T')) {
        const tMatch = line.match(/T(\d{2})(\d{2})/);
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

      // Coordinate Motion target (Modal memory for X and Z!)
      let targetX = curX;
      let targetZ = curZ;

      if (words.X !== undefined) targetX = words.X;
      if (words.Z !== undefined) targetZ = words.Z;
      if (words.U !== undefined) targetX = curX + words.U;
      if (words.W !== undefined) targetZ = curZ + words.W;

      // Chuck Collision Alarm Check!
      const chuckZLimit = -exposedLen;
      if (targetZ < chuckZLimit) {
        errorAlarm = `[ALARM TABRAKAN CHUCK] Pahat melampaui batas cekam ragum Z${chuckZLimit.toFixed(1)} mm!`;
      }

      const hasMove = words.X !== undefined || words.Z !== undefined || words.U !== undefined || words.W !== undefined;

      if (hasMove) {
        const dX = targetX - curX;
        const dZ = targetZ - curZ;
        const dist = Math.hypot(dX / 2, dZ);
        const steps = Math.max(1, Math.ceil(dist / 1.5));

        // Is tool currently cutting into stock?
        const isCutting = (activeMotion === 1 || activeMotion === 32 || activeMotion === 92 || activeMotion === 76) &&
          (targetZ <= 0 || curZ <= 0) &&
          (targetX < stk.diameter || curX < stk.diameter);

        // Record Thread segment ONLY on actual thread commands
        if ((activeMotion === 32 || activeMotion === 92 || activeMotion === 76) && targetZ < 0) {
          threadList.push({
            startZ: Math.min(curZ, targetZ),
            endZ: Math.max(curZ, targetZ),
            dia: targetX,
            pitch: words.F || 2.0
          });
        }

        // Interpolate along line segment
        for (let s = 1; s <= steps; s++) {
          const interpX = curX + (dX * s) / steps;
          const interpZ = curZ + (dZ * s) / steps;

          // Material Removal Math: update workProfile array
          if (isCutting && interpZ <= 0 && interpZ >= -exposedLen) {
            const zIdx = Math.min(zSteps - 1, Math.max(0, Math.floor(-interpZ / zResolution)));
            const currentCutRadius = interpX / 2;
            if (currentCutRadius < workProfile[zIdx]) {
              workProfile[zIdx] = Math.max(0, currentCutRadius);
            }
          }

          frames.push({
            line: lineIdx,
            x: interpX,
            z: interpZ,
            motion: activeMotion,
            isRapid: activeMotion === 0,
            isCutting,
            tool: activeToolNum,
            rpm: curRpm,
            feed: curFeed,
            spindle: curSpindle,
            coolant: curCoolant,
            profileSnapshot: Array.from(workProfile),
            threadSnapshot: [...threadList]
          });
        }

        curX = targetX;
        curZ = targetZ;
      }
    }

    return {
      frames,
      alarm: errorAlarm,
      finalProfile: Array.from(workProfile),
      finalThreads: [...threadList]
    };
  };

  // Compile on program, stock, or tool change
  useEffect(() => {
    const res = compileProgram(programText, stock, tools);
    setSimFrames(res.frames);
    if (res.frames.length > 0) {
      setProfileCut(res.frames[0].profileSnapshot);
      setThreads(res.frames[0].threadSnapshot);
    }
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
          setPosition({ x: Number(f.x.toFixed(3)), z: Number(f.z.toFixed(3)) });
          setMachinePos({ x: Number((f.x + 150).toFixed(2)), z: Number((f.z + 240).toFixed(2)) });
          setActiveLine(f.line);
          setProfileCut(f.profileSnapshot);
          setThreads(f.threadSnapshot);
          setActiveToolStation(f.tool);
          setSpindleState(f.spindle);
          setSpindleRpm(f.rpm);
          setCoolant(f.coolant);
          setFeedRate(f.feed);

          // Single block pause
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

  // Cycle Start
  const handleCycleStart = () => {
    sound.playClick();
    if (eStop) {
      setAlarmMessage("[ALARM] Emergency Stop aktif! Lepas tombol darurat terlebih dahulu.");
      return;
    }
    if (!chuckClamped) {
      setAlarmMessage("[ALARM] Cekam Chuck belum menjepit benda kerja!");
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
    setPosition({ x: 66, z: 10 });
    setSpindleState(0);
    setCoolant(false);
    setAlarmMessage("");
    if (simFrames.length > 0) {
      setProfileCut(simFrames[0].profileSnapshot);
      setThreads([]);
    }
  };

  const handleJog = (axis, dir) => {
    sound.playClick();
    if (isRunning) return;
    const delta = jogStep * dir;
    if (axis === 'X') {
      setPosition(p => ({ ...p, x: Number((p.x + delta * 2).toFixed(3)) }));
      setMachinePos(m => ({ ...m, x: Number((m.x + delta * 2).toFixed(2)) }));
    } else {
      setPosition(p => ({ ...p, z: Number((p.z + delta).toFixed(3)) }));
      setMachinePos(m => ({ ...m, z: Number((m.z + delta).toFixed(2)) }));
    }
  };

  const handleTurretIndex = (dir) => {
    sound.playClick();
    if (isRunning) return;
    setActiveToolStation((prev) => {
      let next = prev + dir;
      if (next > 8) next = 1;
      if (next < 1) next = 8;
      return next;
    });
  };

  // Stock Actions
  const applyStockChanges = () => {
    sound.playClick();
    setStock({ ...stockDraft });
    setShowStockDrawer(false);
    setAlarmMessage("[SUKSES] Ukuran bahan benda kerja berhasil diperbarui.");
  };

  const handleFlipWorkpiece = () => {
    sound.playClick();
    if (profileCut.length > 0) {
      const reversed = [...profileCut].reverse();
      setProfileCut(reversed);
      setAlarmMessage("[SUKSES] Benda kerja berhasil dibalik dan dicekam ulang.");
    }
  };

  // 2D SVG Blueprint Path Calculations
  const svgW = 600;
  const svgH = 340;
  const originSvgX = 460;
  const originSvgY = 170;
  const scale = 3.6;

  const toSvgX = (z) => originSvgX + z * scale;
  const toSvgY = (r) => originSvgY - r * scale;

  const maxRadius = stock.diameter / 2;
  const exposedLen = stock.length - stock.grip;

  // Workpiece Top and Bottom Outline Path
  const workpiecePolygonPoints = useMemo(() => {
    const pts = [];
    const gripZ = -exposedLen;

    // Top Profile along Z from grip to face (Z=0)
    pts.push(`${toSvgX(gripZ)},${toSvgY(0)}`);
    pts.push(`${toSvgX(gripZ)},${toSvgY(maxRadius)}`);

    if (profileCut && profileCut.length > 0) {
      const zResolution = exposedLen / profileCut.length;
      for (let i = 0; i < profileCut.length; i++) {
        const curZ = gripZ + i * zResolution;
        const curR = profileCut[profileCut.length - 1 - i] !== undefined ? profileCut[profileCut.length - 1 - i] : maxRadius;
        pts.push(`${toSvgX(curZ)},${toSvgY(curR)}`);
      }
    } else {
      pts.push(`${toSvgX(0)},${toSvgY(maxRadius)}`);
    }

    // Right face
    pts.push(`${toSvgX(0)},${toSvgY(0)}`);

    // Bottom Profile along Z (Mirrored)
    if (profileCut && profileCut.length > 0) {
      const zResolution = exposedLen / profileCut.length;
      for (let i = profileCut.length - 1; i >= 0; i--) {
        const curZ = gripZ + i * zResolution;
        const curR = profileCut[profileCut.length - 1 - i] !== undefined ? profileCut[profileCut.length - 1 - i] : maxRadius;
        pts.push(`${toSvgX(curZ)},${toSvgY(-curR)}`);
      }
    } else {
      pts.push(`${toSvgX(0)},${toSvgY(-maxRadius)}`);
    }

    pts.push(`${toSvgX(gripZ)},${toSvgY(-maxRadius)}`);
    pts.push(`${toSvgX(gripZ)},${toSvgY(0)}`);

    return pts.join(' ');
  }, [stock, profileCut, exposedLen, maxRadius]);

  return (
    <div className={`teknalar-cnc-root ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* =====================================================================
          1. TOP NAVIGATION & WORKSHOP STATUS BAR
      ===================================================================== */}
      <div className="teknalar-topbar">
        <div className="teknalar-brand">
          <strong>TEKNALAR</strong>
          <span>CNC LATHE SIMULATOR · FANUC Series 0i-TD</span>
        </div>

        <div className="teknalar-topControls">
          {/* Preset Selector */}
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="teknalar-presetSelect"
          >
            {LATHE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Drawer 1: Tool Magazine & Turret */}
          <button
            onClick={() => { sound.playClick(); setShowTurretDrawer(!showTurretDrawer); setShowStockDrawer(false); }}
            className="teknalar-topBtn"
            style={{
              background: showTurretDrawer ? 'rgba(56, 189, 248, 0.25)' : '#1e293b',
              color: '#38bdf8',
              borderColor: '#0284c7',
              fontWeight: 700
            }}
          >
            <Disc size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            [TURRET MAGAZINE] ({activeToolObj.code})
          </button>

          {/* Drawer 2: Bahan Benda Kerja */}
          <button
            onClick={() => { sound.playClick(); setShowStockDrawer(!showStockDrawer); setShowTurretDrawer(false); }}
            className="teknalar-topBtn"
            style={{
              background: showStockDrawer ? 'rgba(245, 158, 11, 0.25)' : '#1e293b',
              color: '#fbbf24',
              borderColor: '#d97706',
              fontWeight: 700
            }}
          >
            <Box size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            [BAHAN] Ø{stock.diameter} × {exposedLen}mm
          </button>

          {/* View Toggle: 2D Blueprint vs 3D Realistic Slant-bed */}
          <button
            onClick={() => { sound.playClick(); setViewMode(v => v === '2d' ? '3d' : '2d'); }}
            className="teknalar-topBtn"
            style={{
              background: viewMode === '3d' ? '#0369a1' : '#1e293b',
              color: '#ffffff',
              borderColor: '#38bdf8'
            }}
          >
            <Eye size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            {viewMode === '2d' ? 'Mode 2D Samping XZ' : 'Mode 3D Slant-Bed'}
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => { sound.playClick(); setIsFullscreen(!isFullscreen); }}
            className="teknalar-topBtn"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* =====================================================================
          DRAWER 1: TOOL TURRET & OFFSET LIBRARY (8 STATIONS)
      ===================================================================== */}
      {showTurretDrawer && (
        <div className="teknalar-stockPanel" style={{ background: '#09151e', borderBottom: '2px solid #0284c7' }}>
          <div className="teknalar-stockHead">
            <strong style={{ color: '#38bdf8' }}>TURRET MAGAZINE & OFFSET PAHAT CNC (8 STASIUN):</strong>
            <span>Pilih stasiun turret untuk memutar pahat aktif atau mengubah tabel geometri & wear offset</span>
            <button
              onClick={() => setShowTurretDrawer(false)}
              className="teknalar-lcdBtn"
              style={{ marginLeft: 'auto' }}
            >
              [TUTUP]
            </button>
          </div>

          {/* Visual Turret Disc Station Selectors */}
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

          {/* Geometry & Wear Offset Table */}
          <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '10px' }}>
            <table className="teknalar-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>PAHAT</th>
                  <th>GEO X</th>
                  <th>GEO Z</th>
                  <th>WEAR X</th>
                  <th>WEAR Z</th>
                  <th>R / DIAMETER</th>
                  <th>INSERT / TIPE</th>
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
                    <td>{t.geometryX.toFixed(3)}</td>
                    <td>{t.geometryZ.toFixed(3)}</td>
                    <td>{t.wearX.toFixed(3)}</td>
                    <td>{t.wearZ.toFixed(3)}</td>
                    <td>{t.noseRadius ? `R${t.noseRadius.toFixed(2)}` : `Ø${t.width || '-'}`}</td>
                    <td>{t.insert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Tool Touch-off (MEASURE) */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                sound.playSuccess();
                setTools(prev => prev.map(t => t.tool === activeToolStation ? { ...t, geometryX: Number((position.x - stock.diameter).toFixed(3)) } : t));
                setAlarmMessage(`[MEASURE X] Geometri X untuk ${activeToolObj.code} disimpan.`);
              }}
              className="teknalar-lcdBtn"
            >
              [MEASURE X] Sentuh Diameter Luar
            </button>
            <button
              onClick={() => {
                sound.playSuccess();
                setTools(prev => prev.map(t => t.tool === activeToolStation ? { ...t, geometryZ: Number((position.z - 0).toFixed(3)) } : t));
                setAlarmMessage(`[MEASURE Z] Geometri Z untuk ${activeToolObj.code} diset di muka Z0.`);
              }}
              className="teknalar-lcdBtn"
            >
              [MEASURE Z] Sentuh Muka Benda Z0
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setTools(DEFAULT_TURRET_TOOLS);
                setAlarmMessage("[SUKSES] Semua geometri & wear offset dikembalikan ke nilai default pabrik.");
              }}
              className="teknalar-lcdBtn"
              style={{ marginLeft: 'auto' }}
            >
              [RESET NILAI BAWAAN]
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          DRAWER 2: BAHAN BENDA KERJA (STOCK CONFIGURATION)
      ===================================================================== */}
      {showStockDrawer && (
        <div className="teknalar-stockPanel">
          <div className="teknalar-stockHead">
            <strong style={{ color: '#fbbf24' }}>KONFIGURASI BAHAN BENDA KERJA (RAW BILLET):</strong>
            <span>Atur diameter, panjang total, dan kedalaman jepit cekam chuck</span>
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
              Panjang Dicekam Chuck (mm):
              <input
                type="number"
                min="15"
                max="60"
                value={stockDraft.grip}
                onChange={(e) => setStockDraft({ ...stockDraft, grip: Number(e.target.value) })}
              />
            </label>
            <label>
              Work Shift G54 Z (mm):
              <input
                type="number"
                step="0.1"
                value={stockDraft.zeroZ}
                onChange={(e) => setStockDraft({ ...stockDraft, zeroZ: Number(e.target.value) })}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 10 }}>
            <button onClick={applyStockChanges} className="teknalar-lcdBtn" style={{ background: '#f59e0b', color: '#000', fontWeight: 800 }}>
              [PASANG BAHAN BARU]
            </button>
            <button onClick={handleFlipWorkpiece} className="teknalar-lcdBtn">
              [⇄ BALIK BENDA & CEKAM]
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. MAIN STAGE (MACHINE VISUALIZER & FANUC OPERATOR PANEL)
      ===================================================================== */}
      <div className="teknalar-upper">
        {/* LEFT: MACHINE VISUALIZER VIEWPORT */}
        <div className="teknalar-machine">
          <div className="teknalar-window">
            {viewMode === '2d' ? (
              /* 2D HIGH-PRECISION BLUEPRINT SVG CANVAS */
              <svg viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label="Visual Lintasan Pahat Bubut CNC">
                <defs>
                  <pattern id="latheGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#141f26" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="20" stroke="#141f26" strokeWidth="0.5" />
                  </pattern>
                  <linearGradient id="turnedSteelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748b" />
                    <stop offset="25%" stopColor="#94a3b8" />
                    <stop offset="50%" stopColor="#f1f5f9" />
                    <stop offset="75%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                </defs>

                <rect width="100%" height="100%" fill="url(#latheGrid)" />

                {/* Spindle Centerline Axis */}
                <line
                  x1="10"
                  y1={originSvgY}
                  x2={svgW - 10}
                  y2={originSvgY}
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="8 4 2 4"
                />

                {/* Chuck Jaws (Left Side) */}
                <g>
                  {/* Chuck Body */}
                  <rect
                    x={toSvgX(-exposedLen) - 80}
                    y={originSvgY - 110}
                    width="80"
                    height="220"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="2"
                  />
                  {/* Top Jaw */}
                  <rect
                    x={toSvgX(-exposedLen) - 35}
                    y={originSvgY - maxRadius * scale - 30}
                    width="35"
                    height="32"
                    fill="#94a3b8"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  {/* Bottom Jaw */}
                  <rect
                    x={toSvgX(-exposedLen) - 35}
                    y={originSvgY + maxRadius * scale - 2}
                    width="35"
                    height="32"
                    fill="#94a3b8"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  {/* Chuck Boundary Limit Line */}
                  <line
                    x1={toSvgX(-exposedLen)}
                    y1="20"
                    x2={toSvgX(-exposedLen)}
                    y2={svgH - 20}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={toSvgX(-exposedLen) - 5}
                    y="30"
                    fill="#ef4444"
                    fontSize="9"
                    textAnchor="end"
                    fontWeight="bold"
                  >
                    BATAS CEKAM CHUCK
                  </text>
                </g>

                {/* Workpiece Body (Real dynamic profile cutout) */}
                <polygon
                  points={workpiecePolygonPoints}
                  fill="url(#turnedSteelGrad)"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />

                {/* Thread Ridges Overlay (Only drawn when G32/G76/G92 are executed!) */}
                {threads.map((th, tidx) => {
                  const startX = toSvgX(th.startZ);
                  const endX = toSvgX(th.endZ);
                  const radY = toSvgY(th.dia / 2);
                  const pitchPx = (th.pitch || 2.0) * scale;
                  const lines = [];
                  for (let px = startX; px <= endX; px += pitchPx) {
                    lines.push(
                      <line
                        key={`th-${tidx}-${px}`}
                        x1={px}
                        y1={radY}
                        x2={px + pitchPx * 0.5}
                        y2={radY + 6}
                        stroke="#c084fc"
                        strokeWidth="1.5"
                      />
                    );
                  }
                  return <g key={`thread-group-${tidx}`}>{lines}</g>;
                })}

                {/* Z0 Datum Zero Line */}
                <line
                  x1={toSvgX(0)}
                  y1={originSvgY - 80}
                  x2={toSvgX(0)}
                  y2={originSvgY + 80}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
                <text x={toSvgX(0) + 4} y={originSvgY - 65} fill="#10b981" fontSize="9" fontWeight="bold">
                  Z0 (G54)
                </text>

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
                          x1={toSvgX(prevF.z)}
                          y1={toSvgY(prevF.x / 2)}
                          x2={toSvgX(f.z)}
                          y2={toSvgY(f.x / 2)}
                          stroke={isRapid ? '#38bdf8' : '#f59e0b'}
                          strokeWidth={isRapid ? 1 : 1.8}
                          strokeDasharray={isRapid ? '3 3' : 'none'}
                          opacity={i <= currentFrameIdx ? 1 : 0.35}
                        />
                      );
                    })}
                  </g>
                )}

                {/* Current Active Tool Head & Insert */}
                <g transform={`translate(${toSvgX(position.z)}, ${toSvgY(position.x / 2)})`}>
                  {/* Tool Holder Shank */}
                  <rect x="0" y="-12" width="60" height="24" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" rx="2" />
                  {/* Carbide Cutting Insert */}
                  <polygon
                    points="0,0 14,-12 28,-12 14,0"
                    fill={activeToolObj.color || "#e7b85d"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* Tool Tip Red Dot */}
                  <circle cx="0" cy="0" r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="14" y="16" fill="#e2e8f0" fontSize="9" fontWeight="bold">{activeToolObj.code}</text>
                </g>

                {/* Spindle Rotation Indicator */}
                {spindleState > 0 && (
                  <g transform={`translate(${toSvgX(0) + 25}, ${originSvgY})`}>
                    <path d="M 0,-18 A 18 18 0 0 1 18,0" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="3 2" />
                    <polygon points="18,-3 22,2 16,3" fill="#facc15" />
                    <text x="24" y="4" fill="#facc15" fontSize="9" fontWeight="bold">{spindleRpm} RPM</text>
                  </g>
                )}
              </svg>
            ) : (
              /* 3D REALISTIC SLANT-BED CANVASCAP */
              <CncLathe3DScene
                stock={stock}
                profileCut={profileCut}
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
              <span>X (DIAMETER)</span>
              <strong>{position.x.toFixed(3)}<small>mm</small></strong>
            </div>
            <div>
              <span>Z (PANJANG)</span>
              <strong>{position.z.toFixed(3)}<small>mm</small></strong>
            </div>
            <div>
              <span>SPINDLE RPM</span>
              <strong style={{ color: spindleState > 0 ? '#4ade80' : '#fff' }}>{spindleRpm}</strong>
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
              <span>MOTION</span>
              <strong>{simFrames[currentFrameIdx]?.isRapid ? 'G00 RAPID' : isRunning ? 'G01 FEED' : 'IDLE'}</strong>
            </div>
            <div>
              <span>COOLANT</span>
              <strong style={{ color: coolant ? '#38bdf8' : '#94a3b8' }}>{coolant ? 'M08' : 'M09'}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT: FANUC CRT DISPLAY CHASSIS */}
        <div className="teknalar-control">
          <div className="teknalar-nameplate">
            <strong>FANUC Series 0i-TD</strong>
            <span>[{modeSelect}]</span>
          </div>

          <div className="teknalar-bezel">
            <div className={`teknalar-lcd ${!powerOn ? 'teknalar-lcdOff' : ''}`}>
              {!powerOn ? (
                <div className="teknalar-blank">— POWER OFF —</div>
              ) : (
                <>
                  {/* Top CRT Status Header */}
                  <div className="teknalar-lcdHead">
                    <span>O0001 (PRESET-{selectedPresetId.toUpperCase()})</span>
                    <span>{eStop ? 'EMG STOP' : isRunning ? 'MEM · STRT' : 'READY'}</span>
                  </div>

                  {/* TAB 1: POS (ACTUAL POSITION READOUT & PROGRAM SPLIT) */}
                  {lcdTab === 'POS' && (
                    <div className="teknalar-lcdBody teknalar-split">
                      {/* Left Column: Coordinates & Machine Status */}
                      <div style={{ display: 'grid', gap: 6, alignContent: 'start' }}>
                        <div className="teknalar-box">
                          <p className="teknalar-boxTitle">ACTUAL POSITION (ABS)</p>
                          <div className="teknalar-bigAxis">
                            <span>X</span>
                            {position.x.toFixed(3).padStart(9, ' ')}
                          </div>
                          <div className="teknalar-bigAxis">
                            <span>Z</span>
                            {position.z.toFixed(3).padStart(9, ' ')}
                          </div>
                        </div>

                        <div className="teknalar-box">
                          <p className="teknalar-boxTitle">MACHINE STATUS</p>
                          <div className="teknalar-status">
                            <p><b>S</b> {spindleRpm.toFixed(0)} rpm</p>
                            <p><b>F</b> {feedRate.toFixed(3)} mm/rev</p>
                            <p><b>T</b> {activeToolObj.code}</p>
                            <p><b>LOAD</b> {isRunning ? '42% (estimasi)' : '0% (IDLE)'}</p>
                            <p style={{ color: spindleState === 3 || spindleState === 4 ? '#4ade80' : '#94a3b8' }}>
                              {spindleState === 3 ? 'M03 (Spindle CW)' : spindleState === 4 ? 'M04 (Spindle CCW)' : 'M05 (Spindle Stop)'}
                            </p>
                            <p style={{ color: coolant ? '#38bdf8' : '#94a3b8' }}>
                              {coolant ? 'M08 (Coolant ON)' : 'M09 (Coolant OFF)'}
                            </p>
                          </div>
                        </div>

                        <div className="teknalar-box">
                          <p className="teknalar-boxTitle">MODAL G-CODES</p>
                          <div className="teknalar-status" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                            <span style={{ background: 'rgba(56,189,248,0.12)', padding: '2px 5px', borderRadius: 3, border: '1px solid rgba(56,189,248,0.25)', fontSize: 10, color: '#7dd3fc' }}>G18</span>
                            <span style={{ background: 'rgba(56,189,248,0.12)', padding: '2px 5px', borderRadius: 3, border: '1px solid rgba(56,189,248,0.25)', fontSize: 10, color: '#7dd3fc' }}>G21</span>
                            <span style={{ background: 'rgba(56,189,248,0.12)', padding: '2px 5px', borderRadius: 3, border: '1px solid rgba(56,189,248,0.25)', fontSize: 10, color: '#7dd3fc' }}>G40</span>
                            <span style={{ background: 'rgba(56,189,248,0.12)', padding: '2px 5px', borderRadius: 3, border: '1px solid rgba(56,189,248,0.25)', fontSize: 10, color: '#7dd3fc' }}>G54</span>
                            <span style={{ background: 'rgba(56,189,248,0.12)', padding: '2px 5px', borderRadius: 3, border: '1px solid rgba(56,189,248,0.25)', fontSize: 10, color: '#7dd3fc' }}>G99</span>
                            <span style={{ background: 'rgba(56,189,248,0.12)', padding: '2px 5px', borderRadius: 3, border: '1px solid rgba(56,189,248,0.25)', fontSize: 10, color: '#7dd3fc' }}>G97</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Program Code View */}
                      <div className="teknalar-box" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <p className="teknalar-boxTitle">PROGRAM (O0001)</p>
                        <div className="teknalar-prog" style={{ flex: 1, minHeight: 0, maxHeight: 320 }}>
                          {programText.split('\n').map((line, idx) => (
                            <div
                              key={idx}
                              className={activeLine === idx && isRunning ? 'teknalar-cur' : ''}
                            >
                              {String(idx + 1).padStart(3, '0')} {line}
                            </div>
                          ))}
                          <div>%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PROG (G-CODE PROGRAM VIEWER & KEYPAD EDITOR) */}
                  {lcdTab === 'PROG' && (
                    <div className="teknalar-lcdBody">
                      {modeSelect === 'EDIT' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <textarea
                            className="teknalar-editor"
                            aria-label="Editor Program G-Code Lathe"
                            value={programText}
                            spellCheck={false}
                            onChange={(e) => setProgramText(e.target.value)}
                          />
                          <div className="teknalar-keys" aria-label="Keypad Program">
                            {"OXZUWGMIKRFPQTSN0123456789-.".split("").map((k) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  setProgramText((prev) => prev + k);
                                }}
                              >
                                {k}
                              </button>
                            ))}
                            <button
                              type="button"
                              className="teknalar-wide"
                              onClick={() => {
                                sound.playClick();
                                setProgramText((prev) => prev + '\n');
                              }}
                            >
                              EOB
                            </button>
                            <button
                              type="button"
                              className="teknalar-wide"
                              onClick={() => {
                                sound.playClick();
                                setProgramText((prev) => prev.slice(0, -1));
                              }}
                            >
                              CAN
                            </button>
                          </div>
                          <div>
                            <button
                              type="button"
                              className="teknalar-lcdBtn"
                              onClick={() => {
                                sound.playClick();
                                setAlarmMessage('[PROGRAM VALID] Sintaks G-code siap dieksekusi.');
                              }}
                            >
                              [PERIKSA PROGRAM]
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="teknalar-box">
                          <p className="teknalar-boxTitle">PROGRAM (O0001) · MODE MEM/AUTO</p>
                          <div className="teknalar-prog" style={{ maxHeight: 340 }}>
                            {programText.split('\n').map((line, idx) => (
                              <div
                                key={idx}
                                className={activeLine === idx && isRunning ? 'teknalar-cur' : ''}
                              >
                                {String(idx + 1).padStart(3, '0')} {line}
                              </div>
                            ))}
                            <div>%</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: OFFSET (GEOMETRY & WEAR TABLE) */}
                  {lcdTab === 'OFFSET' && (
                    <div className="teknalar-lcdBody">
                      <div className="teknalar-box">
                        <p className="teknalar-boxTitle">TOOL GEOMETRY & WEAR OFFSET</p>
                        <div style={{ overflowX: 'auto', padding: 4 }}>
                          <table className="teknalar-table">
                            <thead>
                              <tr>
                                <th>NO</th>
                                <th>PAHAT</th>
                                <th>GEO X</th>
                                <th>GEO Z</th>
                                <th>WEAR X</th>
                                <th>WEAR Z</th>
                                <th>R / Ø</th>
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
                                  <td>{t.noseRadius ? `R${t.noseRadius.toFixed(2)}` : `Ø${t.width}`}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: UKUR (INSPECTION & TOLERANCE) */}
                  {lcdTab === 'UKUR' && (
                    <div className="teknalar-lcdBody">
                      <div className="teknalar-box" style={{ padding: 10 }}>
                        <p className="teknalar-boxTitle">PENGUKURAN DIAMETER POROS & WEAR COMPENSATION</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                          <div>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Posisi Z Ukur:</span>
                            <input
                              type="number"
                              value={measureZ}
                              onChange={(e) => setMeasureZ(Number(e.target.value))}
                              style={{ width: '100%', background: '#0a1610', border: '1px solid #2e6a45', color: '#fff', padding: '6px 8px', borderRadius: 4, font: '700 13px Consolas, monospace' }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Target Diameter Ø (mm):</span>
                            <input
                              type="number"
                              step="0.01"
                              value={measureDiaInput}
                              onChange={(e) => setMeasureDiaInput(e.target.value)}
                              style={{ width: '100%', background: '#0a1610', border: '1px solid #2e6a45', color: '#fff', padding: '6px 8px', borderRadius: 4, font: '700 13px Consolas, monospace' }}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playSuccess();
                            const diff = Number(measureDiaInput) - 46.0;
                            setTools(prev => prev.map(t => t.tool === activeToolStation ? { ...t, wearX: Number(diff.toFixed(3)) } : t));
                            setAlarmMessage(`[SUKSES] Wear X terkompensasi: ${diff.toFixed(3)} mm`);
                          }}
                          className="teknalar-lcdBtn"
                          style={{ marginTop: 12, width: '100%' }}
                        >
                          [TERAPKAN WEAR COMPENSATION]
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: DIAG (DIAGNOSTICS) */}
                  {lcdTab === 'DIAG' && (
                    <div className="teknalar-lcdBody">
                      <div className="teknalar-box" style={{ padding: 10 }}>
                        <p className="teknalar-boxTitle">DIAGNOSTIK & STATUS SISTEM CNC</p>
                        <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8, color: '#94a3b8', marginTop: 8 }}>
                          <div>Spindle Load: <strong style={{ color: '#fff' }}>{isRunning ? '42% (3.1 kW)' : '0% (IDLE)'}</strong></div>
                          <div>Motor Temperature: <strong style={{ color: '#4ade80' }}>38.4 °C (NORMAL)</strong></div>
                          <div>Door Interlock: <strong style={{ color: doorClosed ? '#4ade80' : '#ef4444' }}>{doorClosed ? 'TERKUNCI AMAN' : 'TERBUKA'}</strong></div>
                          <div>Chuck Hydraulic Pressure: <strong style={{ color: '#4ade80' }}>3.2 MPa (NORMAL)</strong></div>
                          <div>CNC System Cycle: <strong style={{ color: '#38bdf8' }}>FANUC 0i-TD EMBEDDED RT-KERNEL</strong></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alarm Banner */}
                  {alarmMessage && (
                    <div className="teknalar-crtAlarm">
                      <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} />
                      {alarmMessage}
                    </div>
                  )}

                  {/* Softkeys Strip */}
                  <div className="teknalar-softkeys">
                    {[
                      ['POS', 'POS'],
                      ['PROG', 'PROG'],
                      ['OFFSET', 'OFS/SET'],
                      ['UKUR', 'UKUR'],
                      ['DIAG', 'DIAG'],
                    ].map(([tabKey, tabLabel]) => (
                      <button
                        key={tabKey}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setLcdTab(tabKey);
                        }}
                        className={lcdTab === tabKey ? 'active' : ''}
                      >
                        [{tabLabel}]
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Side Blank Membrane Keys */}
            <div className="teknalar-sideKeys" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER OPERATOR CONSOLE SWITCHBOARD */}
      <div className="teknalar-panel" aria-label="Panel operator mesin">
        {/* Stack 1: E-STOP + POWER */}
        <div className="teknalar-stack">
          <div className="teknalar-group">
            <h4>EMERGENCY STOP</h4>
            <button
              type="button"
              className={`teknalar-estop ${eStop ? 'teknalar-estopDown' : ''}`}
              aria-pressed={eStop}
              aria-label={eStop ? 'Lepaskan emergency stop' : 'Tekan emergency stop'}
              onClick={() => {
                sound.playClick();
                setEStop(!eStop);
                if (!eStop) setIsRunning(false);
              }}
            >
              E-STOP
            </button>
          </div>
          <div className="teknalar-group">
            <h4>POWER</h4>
            <div className="teknalar-row">
              <button
                type="button"
                className={`teknalar-key teknalar-green2 ${powerOn ? 'teknalar-lampOn' : ''}`}
                aria-pressed={powerOn}
                onClick={() => { sound.playClick(); setPowerOn(true); }}
              >
                ON
              </button>
              <button
                type="button"
                className="teknalar-key teknalar-red2"
                onClick={() => { sound.playClick(); setPowerOn(false); setIsRunning(false); }}
              >
                OFF
              </button>
            </div>
          </div>
        </div>

        {/* Group 2: MODE SELECT Rotary Dial */}
        <div className="teknalar-group">
          <h4>MODE SELECT</h4>
          <div className="teknalar-dial">
            {MODES.map((m) => {
              const rad = (m.angle * Math.PI) / 180;
              return (
                <button
                  key={m.mode}
                  type="button"
                  className={`teknalar-lbl ${modeSelect === m.mode ? 'teknalar-on' : ''}`}
                  style={{
                    left: `${50 + 40 * Math.sin(rad)}%`,
                    top: `${55 - 47 * Math.cos(rad)}%`,
                  }}
                  disabled={!powerOn || isRunning}
                  aria-pressed={modeSelect === m.mode}
                  onClick={() => {
                    sound.playClick();
                    setModeSelect(m.mode);
                  }}
                >
                  {m.label}
                </button>
              );
            })}
            <div
              className="teknalar-knob"
              style={{
                transform: `rotate(${MODES.find((m) => m.mode === modeSelect)?.angle || 0}deg)`,
              }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Group 3: CYCLE OPERATION */}
        <div className="teknalar-group">
          <h4>CYCLE OPERATION</h4>
          <div className="teknalar-cycleRow">
            <button
              type="button"
              className={`teknalar-key teknalar-big teknalar-green2 ${isRunning ? 'teknalar-lampOn' : ''}`}
              disabled={!powerOn || eStop}
              aria-label="Cycle start"
              onClick={handleCycleStart}
            >
              START
            </button>
            <span>CYCLE START</span>

            <button
              type="button"
              className="teknalar-key teknalar-big teknalar-yellow2"
              disabled={!powerOn || !isRunning}
              aria-label="Feed hold"
              onClick={handleFeedHold}
            >
              HOLD
            </button>
            <span>FEED HOLD</span>

            <button
              type="button"
              className="teknalar-key teknalar-big teknalar-red2"
              disabled={!powerOn}
              aria-label="Reset"
              onClick={handleReset}
            >
              RESET
            </button>
            <span>RESET</span>
          </div>
        </div>

        {/* Stack 4: AXIS JOG & INCREMENT */}
        <div className="teknalar-stack">
          <div className="teknalar-group">
            <h4>AXIS JOG</h4>
            <div className="teknalar-jog">
              <button
                type="button"
                className="teknalar-key teknalar-big"
                disabled={!powerOn || eStop}
                onClick={() => handleJog('X', 1)}
              >
                +X
              </button>
              <button
                type="button"
                className="teknalar-key teknalar-big"
                disabled={!powerOn || eStop}
                onClick={() => handleJog('Z', 1)}
              >
                +Z
              </button>
              <button
                type="button"
                className="teknalar-key teknalar-big"
                disabled={!powerOn || eStop}
                onClick={() => handleJog('X', -1)}
              >
                −X
              </button>
              <button
                type="button"
                className="teknalar-key teknalar-big"
                disabled={!powerOn || eStop}
                onClick={() => handleJog('Z', -1)}
              >
                −Z
              </button>
            </div>
          </div>

          <div className="teknalar-group">
            <h4>JOG INCREMENT</h4>
            <div className="teknalar-row">
              {[0.001, 0.01, 0.1, 1].map((step, idx) => (
                <button
                  key={step}
                  type="button"
                  className={`teknalar-key ${jogStep === step ? 'teknalar-keyOn' : ''}`}
                  disabled={!powerOn}
                  onClick={() => {
                    sound.playClick();
                    setJogStep(step);
                  }}
                  title={`${step} mm per step`}
                >
                  ×{Math.pow(10, idx)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stack 5: SPINDLE & COOLANT */}
        <div className="teknalar-stack">
          <div className="teknalar-group">
            <h4>SPINDLE</h4>
            <div className="teknalar-row">
              <button
                type="button"
                className={`teknalar-key teknalar-green2 ${spindleState === 3 ? 'teknalar-lampOn' : ''}`}
                disabled={!powerOn || eStop}
                onClick={() => {
                  sound.playClick();
                  setSpindleState(3);
                  setSpindleRpm(900);
                }}
              >
                FWD
              </button>
              <button
                type="button"
                className="teknalar-key teknalar-red2"
                disabled={!powerOn}
                onClick={() => {
                  sound.playClick();
                  setSpindleState(0);
                  setSpindleRpm(0);
                }}
              >
                STOP
              </button>
              <button
                type="button"
                className={`teknalar-key teknalar-green2 ${spindleState === 4 ? 'teknalar-lampOn' : ''}`}
                disabled={!powerOn || eStop}
                onClick={() => {
                  sound.playClick();
                  setSpindleState(4);
                  setSpindleRpm(900);
                }}
              >
                REV
              </button>
            </div>
          </div>

          <div className="teknalar-group">
            <h4>COOLANT</h4>
            <div className="teknalar-row">
              <button
                type="button"
                className={`teknalar-key ${coolant ? 'teknalar-teal2 teknalar-lampOn' : ''}`}
                disabled={!powerOn}
                onClick={() => { sound.playClick(); setCoolant(true); }}
              >
                ON
              </button>
              <button
                type="button"
                className={`teknalar-key ${!coolant ? 'teknalar-keyOn' : ''}`}
                disabled={!powerOn}
                onClick={() => { sound.playClick(); setCoolant(false); }}
              >
                OFF
              </button>
            </div>
          </div>
        </div>

        {/* Stack 6: CHUCK, PINTU & TURRET */}
        <div className="teknalar-stack">
          <div className="teknalar-group">
            <h4>CHUCK & PINTU</h4>
            <div className="teknalar-row">
              <button
                type="button"
                className={`teknalar-key ${chuckClamped ? 'teknalar-keyOn' : ''}`}
                disabled={!powerOn || isRunning}
                onClick={() => { sound.playClick(); setChuckClamped(true); }}
              >
                CLAMP
              </button>
              <button
                type="button"
                className={`teknalar-key ${!chuckClamped ? 'teknalar-keyOn' : ''}`}
                disabled={!powerOn || isRunning}
                onClick={() => { sound.playClick(); setChuckClamped(false); }}
              >
                UNCLAMP
              </button>
              <button
                type="button"
                className={`teknalar-key ${doorClosed ? 'teknalar-keyOn' : ''}`}
                disabled={!powerOn}
                onClick={() => { sound.playClick(); setDoorClosed(true); }}
                title="Tutup pintu pelindung"
              >
                TUTUP
              </button>
              <button
                type="button"
                className={`teknalar-key ${!doorClosed ? 'teknalar-keyOn' : ''}`}
                disabled={!powerOn}
                onClick={() => { sound.playClick(); setDoorClosed(false); }}
                title="Buka pintu pelindung"
              >
                BUKA
              </button>
            </div>
          </div>

          <div className="teknalar-group">
            <h4>TURRET INDEX</h4>
            <div className="teknalar-row">
              <button
                type="button"
                className="teknalar-key teknalar-big"
                disabled={!powerOn || isRunning}
                onClick={() => handleTurretIndex(1)}
              >
                INDEX +
              </button>
              <button
                type="button"
                className="teknalar-key teknalar-big"
                disabled={!powerOn || isRunning}
                onClick={() => handleTurretIndex(-1)}
              >
                INDEX −
              </button>
            </div>
          </div>
        </div>

        {/* Stack 7: OVERRIDE & OPTION */}
        <div className="teknalar-stack">
          <div className="teknalar-group">
            <h4>OVERRIDE</h4>
            <div className="teknalar-ovr">
              <OverrideKnob
                label="FEED OVERRIDE"
                value={feedOverride}
                steps={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]}
                onChange={setFeedOverride}
                disabled={!powerOn}
              />
              <OverrideKnob
                label="RAPID OVERRIDE"
                value={rapidOverride}
                steps={[5, 25, 50, 100]}
                onChange={setRapidOverride}
                disabled={!powerOn}
              />
              <OverrideKnob
                label="SPINDLE OVERRIDE"
                value={spindleOverride}
                steps={[50, 60, 70, 80, 90, 100, 110, 120]}
                onChange={setSpindleOverride}
                disabled={!powerOn}
              />
            </div>
          </div>

          <div className="teknalar-group">
            <h4>OPTION</h4>
            <div className="teknalar-row">
              <button
                type="button"
                className={`teknalar-key ${singleBlock ? 'teknalar-keyOn' : ''}`}
                disabled={!powerOn}
                onClick={() => { sound.playClick(); setSingleBlock(!singleBlock); }}
              >
                SINGLE BLOCK
              </button>
              <button
                type="button"
                className={`teknalar-key ${optionalStop ? 'teknalar-keyOn' : ''}`}
                disabled={!powerOn}
                onClick={() => { sound.playClick(); setOptionalStop(!optionalStop); }}
              >
                OPTIONAL STOP
              </button>
              <button
                type="button"
                className={`teknalar-key ${dryRun ? 'teknalar-keyOn' : ''}`}
                disabled={!powerOn}
                onClick={() => { sound.playClick(); setDryRun(!dryRun); }}
              >
                DRY RUN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CncLatheTeknalar;

import {
  Shield, Calculator, Edit3, Eye, EyeOff, Compass,
  Zap, Circle, Wrench, Settings, Droplets, FileText,
  Award, Loader2, Play, Pause, RotateCcw, Square, Lightbulb,
  AlertTriangle, CheckCircle2, ChevronRight, RefreshCw,
  ChevronDown, ChevronUp
} from 'lucide-react';
import React, { useState, Suspense, useEffect, useRef, useMemo } from 'react';
import { sound } from '../utils/audio';
import { getAssetUrl } from '../utils/assets';
import Lathe3D from './Lathe3D';
import PreparationModal from './PreparationModal';
import LatheFormulaCalculatorModal from './LatheFormulaCalculatorModal';
import { PROFILE_RESOLUTION } from '../utils/latheToolpath';
import '../styles/teknalar_cnc.css';

// =========================================================================
// HELPER VISUALISASI BENTUK GEOMETRI PAHAT CNC (SVG SCHEMATIC BADGE)
// =========================================================================
const ToolShapeSvg = ({ type, color = '#f59e0b', size = 32 }) => {
  switch (type) {
    case 'rhombic-80':
      // Sisipan Karbida Belah Ketupat 80° (WNMG / CNMG)
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="20,4 35,20 20,36 5,20" fill={color} stroke="#000" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="4.5" fill="#1e293b" stroke="#000" strokeWidth="1" />
        </svg>
      );
    case 'triangle-60':
      // Sisipan Segitiga Sama Sisi 60° (TNMG)
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="20,6 36,32 4,32" fill={color} stroke="#000" strokeWidth="1.5" />
          <circle cx="20" cy="23" r="4.5" fill="#1e293b" stroke="#000" strokeWidth="1" />
        </svg>
      );
    case 'facing-93':
      // Pahat Sayat Muka 93° (PCLNR Facing)
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="10" width="18" height="20" fill="#475569" rx="2" />
          <polygon points="6,20 18,8 24,14 12,26" fill={color} stroke="#000" strokeWidth="1.5" />
          <circle cx="15" cy="17" r="3" fill="#1e293b" />
          <path d="M4 28 L4 12 L14 12" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
        </svg>
      );
    case 'groove-blade':
      // Bilah Pahat Alur Potong 3mm
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="16" width="32" height="12" fill="#334155" rx="1" />
          <rect x="2" y="15" width="8" height="14" fill={color} stroke="#000" strokeWidth="1.2" rx="1" />
          <line x1="2" y1="12" x2="10" y2="12" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="6" y="9" fontSize="6" fill="#38bdf8" textAnchor="middle" fontWeight="bold">3mm</text>
        </svg>
      );
    case 'thread-60':
      // Gigi Sisipan Ulir Luar 60° (16ER Laydown)
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="20,6 36,32 4,32" fill="#334155" stroke="#000" strokeWidth="1.2" />
          <polygon points="20,6 27,18 13,18" fill={color} stroke="#000" strokeWidth="1.2" />
          <circle cx="20" cy="24" r="3.5" fill="#1e293b" />
          <path d="M12 18 L20 6 L28 18" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
          <text x="20" y="38" fontSize="6.5" fill="#fbbf24" textAnchor="middle" fontWeight="bold">60 DEG</text>
        </svg>
      );
    case 'rhombic-left':
      // Sisipan Belah Ketupat Kiri (WNMG-L)
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="12" width="18" height="18" fill="#475569" rx="2" />
          <polygon points="22,6 34,18 22,30 10,18" fill={color} stroke="#000" strokeWidth="1.5" />
          <circle cx="22" cy="18" r="4" fill="#1e293b" />
        </svg>
      );
    case 'center-drill':
      // Bor Senter Konis 60° DIN 333-A
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="14" width="16" height="12" fill="#64748b" />
          <polygon points="20,14 30,17 30,23 20,26" fill={color} stroke="#000" strokeWidth="1" />
          <rect x="30" y="18" width="6" height="4" fill="#cbd5e1" stroke="#000" strokeWidth="1" />
          <polygon points="36,18 39,20 36,22" fill="#cbd5e1" />
        </svg>
      );
    case 'u-drill':
      // U-Drill Sisipan Karbida Ganda Ø20mm
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="10" width="22" height="20" fill="#475569" rx="2" />
          <path d="M16 10 C18 16 18 24 16 30" stroke="#0f172a" strokeWidth="2" fill="none" />
          <rect x="22" y="11" width="8" height="8" fill={color} stroke="#000" strokeWidth="1" rx="1" />
          <rect x="26" y="21" width="8" height="8" fill={color} stroke="#000" strokeWidth="1" rx="1" />
          <circle cx="12" cy="15" r="1.5" fill="#38bdf8" />
          <circle cx="12" cy="25" r="1.5" fill="#38bdf8" />
        </svg>
      );
    default:
      return null;
  }
};

// =========================================================================
// DATA 8-STASIUN TURRET TOOL MAGAZINE CNC BUBUT (FANUC SERIES 0i-TD)
// =========================================================================
const DEFAULT_TURRET_STATIONS = [
  {
    station: 1,
    id: 'rata',
    code: 'T0101',
    name: 'Pahat Rata Kanan (Roughing)',
    enName: 'Right-Hand Turning / Roughing Tool',
    icon: '[T01]',
    image: getAssetUrl('/assets/images/machine_cutting_tools/pahat_rata_kanan.jpg'),
    insert: 'WNMG 080408 (Rhombic 80° Gold Carbide)',
    leadAngle: '95° (ISO PCLNR 2020K12)',
    shapeType: 'rhombic-80',
    shapeName: 'Belah Ketupat 80° (WNMG)',
    cuttingMotion: 'Penyayatan Memanjang (Z+ -> Z-)',
    orientation: 'Depan (Menghadap Operator)',
    geoX: 0.0,
    geoZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    radiusR: 0.8,
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: '#0284c7',
    desc: 'Untuk pembubutan diameter luar memanjang kasar dan bertingkat dari Z0 ke Z-.'
  },
  {
    station: 2,
    id: 'finishing',
    code: 'T0202',
    name: 'Pahat Finishing Kanan',
    enName: 'Precision Finishing Tool',
    icon: '[T02]',
    image: getAssetUrl('/assets/images/machine_cutting_tools/pahat_finishing_tnmg.jpg'),
    insert: 'TNMG 160404 (Triangular 60° TiAlN)',
    leadAngle: '93° (ISO MTJNR 2020K16)',
    shapeType: 'triangle-60',
    shapeName: 'Segitiga 60° (TNMG)',
    cuttingMotion: 'Penyayatan Halus Presisi',
    orientation: 'Depan (Menghadap Operator)',
    geoX: 0.0,
    geoZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    radiusR: 0.4,
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: '#0891b2',
    desc: 'Penyayatan halus presisi tinggi dengan radius ujung R0.4 untuk kualitas permukaan halus.'
  },
  {
    station: 3,
    id: 'facing',
    code: 'T0303',
    name: 'Pahat Facing (Muka)',
    enName: 'Transversal Facing Tool',
    icon: '[T03]',
    image: getAssetUrl('/assets/images/machine_cutting_tools/pahat_muka.jpg'),
    insert: 'PCLNL 93° / WNMG 080408',
    leadAngle: '93° Facing Angle',
    shapeType: 'facing-93',
    shapeName: 'Sudut Muka 93° (PCLNL)',
    cuttingMotion: 'Penyayatan Melintang Muka (X+ -> X0)',
    orientation: 'Depan (Menghadap Operator)',
    geoX: 0.0,
    geoZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    radiusR: 0.8,
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: '#059669',
    desc: 'Meratakan permukaan ujung muka benda kerja pada bidang Z0 dari diameter luar ke X0.'
  },
  {
    station: 4,
    id: 'alur',
    code: 'T0404',
    name: 'Pahat Alur Potong (Grooving)',
    enName: 'Grooving / Parting Off Tool',
    icon: '[T04]',
    image: getAssetUrl('/assets/images/machine_cutting_tools/pahat_alur.jpg'),
    insert: 'CoroCut Blade 3.0 mm (Slender Flat-Edge)',
    leadAngle: '90° Tegak Lurus Poros',
    shapeType: 'groove-blade',
    shapeName: 'Bilah Alur 3.0mm (Parting)',
    cuttingMotion: 'Penyayatan Radial Tembus (X+ -> X-)',
    orientation: 'Depan (Menghadap Operator)',
    geoX: 0.0,
    geoZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    radiusR: 0.2,
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: '#d97706',
    desc: 'Bilah ramping khusus alur celah, snap ring, dan potong bahan (parting-off).'
  },
  {
    station: 5,
    id: 'ulir',
    code: 'T0505',
    name: 'Pahat Ulir Luar 60° (Threading)',
    enName: 'External Threading Tool 60°',
    icon: '[T05]',
    image: getAssetUrl('/assets/images/machine_cutting_tools/pahat_ulir_holder.jpg'),
    insert: 'SER 2020K16 / 16ER AG60 (Laydown Carbide)',
    leadAngle: '60° Profil Gigi Ulir Metris',
    shapeType: 'thread-60',
    shapeName: 'Gigi Segitiga Ulir 60° (16ER)',
    cuttingMotion: 'Siklus Ulir Bertingkat (G92/G76)',
    orientation: 'Depan (Menghadap Operator)',
    geoX: 0.0,
    geoZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    radiusR: 0.1,
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.12)',
    border: '#9333ea',
    desc: 'Pembuatan ulir luar metris standar dengan siklus pemakanan bertahap G92/G76.'
  },
  {
    station: 6,
    id: 'ratakiri',
    code: 'T0606',
    name: 'Pahat Rata Kiri',
    enName: 'Left-Hand Turning Tool',
    icon: '[T06]',
    image: getAssetUrl('/assets/images/machine_cutting_tools/pahat_rata_kiri.jpg'),
    insert: 'WNMG 080408L (Left Hand Rhombic)',
    leadAngle: '95° (ISO PCLNL 2020K12)',
    shapeType: 'rhombic-left',
    shapeName: 'Belah Ketupat Kiri 80°',
    cuttingMotion: 'Penyayatan Balik Kiri (Z- -> Z+)',
    orientation: 'Depan (Menghadap Operator)',
    geoX: 0.0,
    geoZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    radiusR: 0.8,
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.12)',
    border: '#e11d48',
    desc: 'Penyayatan arah kiri untuk pembubutan kontur balik atau pencekaman berlawanan.'
  },
  {
    station: 7,
    id: 'centerdrill',
    code: 'T0707',
    name: 'Pahat Bor Pusat (Center Drill)',
    enName: 'HSS Center Drill Tool',
    icon: '[T07]',
    image: getAssetUrl('/assets/images/machine_cutting_tools/bor_senter.jpg'),
    insert: 'HSS DIN 333-A Ø3.15x60°',
    leadAngle: '60° Countersink Point',
    shapeType: 'center-drill',
    shapeName: 'Mata Bor Konis 60° (DIN 333-A)',
    cuttingMotion: 'Penetrasi Aksial Muka Pusat (Z-)',
    orientation: 'Depan (Menghadap Operator)',
    geoX: 0.0,
    geoZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    radiusR: 0.0,
    color: '#a3e635',
    bg: 'rgba(163, 230, 53, 0.12)',
    border: '#65a30d',
    desc: 'Pembuatan lubang senter awal pada muka benda kerja sebelum pengeboran poros.'
  },
  {
    station: 8,
    id: 'udrill',
    code: 'T0808',
    name: 'Pahat Bor U-Drill Ø20',
    enName: 'Indexable U-Drill Ø20mm',
    icon: '[T08]',
    image: getAssetUrl('/assets/images/machine_cutting_tools/u_drill_cnc.jpg'),
    insert: 'WCMX 040208 Indexable Carbide Ø20',
    leadAngle: '180° Flat Bottom / Twin Insert',
    shapeType: 'u-drill',
    shapeName: 'Bor Karbida Sisipan Kembar Ø20mm',
    cuttingMotion: 'Pengeboran Lubang Tembus Inti (Z-)',
    orientation: 'Depan (Menghadap Operator)',
    geoX: 0.0,
    geoZ: 0.0,
    wearX: 0.0,
    wearZ: 0.0,
    radiusR: 0.0,
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: '#ea580c',
    desc: 'Pengeboran lubang dalam inti poros secara langsung dengan sisipan karbida indeksabel.'
  }
];

const TOOLS_CONFIG = DEFAULT_TURRET_STATIONS.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});

// =========================================================================
// PRESET BENDA KERJA
// =========================================================================
const WORKPIECE_PRESETS = [
  { id: 'p50x100', name: 'Billet Standar', dia: 50, len: 100, mat: 'Baja St 37 (Mild Steel)' },
  { id: 'p40x80', name: 'Billet Ringkas', dia: 40, len: 80, mat: 'Aluminium 6061' },
  { id: 'p60x120', name: 'Billet Sedang', dia: 60, len: 120, mat: 'Baja Karbon St 42' },
  { id: 'p30x100', name: 'Poros Ramping', dia: 30, len: 100, mat: 'Kuningan C360' }
];

// =========================================================================
// GENERATOR TEMPLATE G-CODE DINAMIS SESUAI UKURAN & PAHAT
// =========================================================================
const getGcodeTemplate = (tool = 'rata', dia = 50, len = 100) => {
  if (tool === 'finishing') {
    const dFinish = (dia - 4).toFixed(1);
    const zFinish = -(len * 0.45).toFixed(1);
    return `(PROGRAM BUBUT FINISHING - T0202)
G21 G18 G40 G54 G99
T0202 M06 (PAHAT FINISHING TNMG 60 DEG)
M03 S1500 M08
G00 X${(dia + 2).toFixed(1)} Z2.0
G01 X${dFinish} Z2.0 F0.10
G01 X${dFinish} Z${zFinish} F0.10
G00 X${(dia + 4).toFixed(1)} Z2.0
G00 X${(dia + 10).toFixed(1)} Z10.0
M09 M05
M30`;
  }

  if (tool === 'facing') {
    return `(PROGRAM BUBUT FACING MUKA - T0303)
G21 G18 G40 G54 G99
T0303 M06 (PAHAT FACING PCLNL)
M03 S1400 M08
G00 X${(dia + 4).toFixed(1)} Z2.0
G00 X${(dia + 4).toFixed(1)} Z0.5
G01 X-1.6 Z0.5 F0.12 (SAYAT MUKA KASAR)
G00 Z2.0
G00 X${(dia + 4).toFixed(1)} Z0.0
G01 X-1.6 Z0.0 F0.08 (FINISHING MUKA Z0)
G00 Z3.0
G00 X${(dia + 10).toFixed(1)} Z10.0
M09 M05
M30`;
  }

  if (tool === 'alur') {
    const z1 = -(len * 0.25).toFixed(1);
    const z2 = -(len * 0.50).toFixed(1);
    const d1 = (dia - 12).toFixed(1);
    const d2 = (dia - 16).toFixed(1);
    return `(PROGRAM BUBUT ALUR 3MM - T0404)
G21 G18 G40 G54 G99
T0404 M06 (PAHAT ALUR 3MM COROCUT)
M03 S800 M08
G00 X${(dia + 2).toFixed(1)} Z${z1}
G01 X${d1} Z${z1} F0.08 (SAYAT ALUR 1)
G04 P500 (DWELL 0.5 DETIK)
G00 X${(dia + 2).toFixed(1)} Z${z1}
G00 X${(dia + 2).toFixed(1)} Z${z2}
G01 X${d2} Z${z2} F0.08 (SAYAT ALUR 2)
G04 P500
G00 X${(dia + 2).toFixed(1)} Z${z2}
G00 X${(dia + 10).toFixed(1)} Z10.0
M09 M05
M30`;
  }

  if (tool === 'ulir') {
    const threadZ = -(len * 0.45).toFixed(1);
    const pitch = 2.0;
    const coreDia = (dia - 2.4).toFixed(1);
    return `(PROGRAM BUBUT ULIR METRIS M${dia}x${pitch} - T0505)
G21 G18 G40 G54 G99
T0505 M06 (PAHAT ULIR 60 DEG 16ER)
M03 S600 M08
G00 X${(dia + 4).toFixed(1)} Z4.0
G92 X${(dia - 0.5).toFixed(1)} Z${threadZ} F${pitch} (PASS 1)
G92 X${(dia - 1.0).toFixed(1)} Z${threadZ} F${pitch} (PASS 2)
G92 X${(dia - 1.5).toFixed(1)} Z${threadZ} F${pitch} (PASS 3)
G92 X${coreDia} Z${threadZ} F${pitch} (PASS 4 INTI)
G00 X${(dia + 10).toFixed(1)} Z10.0
M09 M05
M30`;
  }

  if (tool === 'ratakiri') {
    const d1 = (dia - 8).toFixed(1);
    const z1 = -(len * 0.5).toFixed(1);
    return `(PROGRAM BUBUT RATA KIRI - T0606)
G21 G18 G40 G54 G99
T0606 M06 (PAHAT RATA KIRI)
M03 S1100 M08
G00 X${(dia + 2).toFixed(1)} Z${z1}
G01 X${d1} Z${z1} F0.18
G01 X${d1} Z0.0 F0.18 (SAYAT ARAH MUKA KIRI)
G00 X${(dia + 10).toFixed(1)} Z10.0
M09 M05
M30`;
  }

  if (tool === 'centerdrill') {
    return `(PROGRAM BOR PUSAT - T0707)
G21 G18 G40 G54 G99
T0707 M06 (CENTER DRILL DIN 333-A)
M03 S1600 M08
G00 X0.0 Z5.0
G01 Z-4.0 F0.06 (BOR SENTER 60 DEG)
G04 P300
G00 Z10.0
G00 X40.0
M09 M05
M30`;
  }

  if (tool === 'udrill') {
    return `(PROGRAM U-DRILL Ø20 - T0808)
G21 G18 G40 G54 G99
T0808 M06 (U-DRILL Ø20 INDEXABLE)
M03 S1200 M08
G00 X0.0 Z5.0
G01 Z-25.0 F0.12 (BOR LUBANG Ø20)
G04 P200
G00 Z10.0
G00 X45.0
M09 M05
M30`;
  }

  // Default: T0101 Pahat Rata Kanan (Roughing)
  const dStep1 = (dia - 6).toFixed(1);
  const zStep1 = -(len * 0.6).toFixed(1);
  const dStep2 = (dia - 12).toFixed(1);
  const zStep2 = -(len * 0.35).toFixed(1);
  return `(PROGRAM BUBUT RATA KANAN - T0101)
G21 G18 G40 G54 G99
T0101 M06 (PAHAT RATA KANAN WNMG)
M03 S1200 M08
G00 X${(dia + 2).toFixed(1)} Z2.0
G01 X${dStep1} Z2.0 F0.2
G01 X${dStep1} Z${zStep1} F0.2
G00 X${(dia + 1).toFixed(1)} Z${zStep1}
G00 Z2.0
G01 X${dStep2} Z2.0 F0.2
G01 X${dStep2} Z${zStep2} F0.2
G00 X${(dia - 10).toFixed(1)} Z${zStep2}
G00 Z2.0
G00 X${(dia + 10).toFixed(1)} Z10.0
M09 M05
M30`;
};

const CNCLatheModule = ({ addXP }) => {
  const [isPrepared, setIsPrepared] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState('3'); // '1': Benda Kerja, '2': Spindel & Coolant, '3': Program G-Code, '4': Proses Simulasi, '5': Hasil & Evaluasi
  
  // ==========================================
  // 1. BENDA KERJA STATE (UKURAN & MATERIAL)
  // ==========================================
  const [workpieceDiameter, setWorkpieceDiameter] = useState(50); // mm (20 - 80)
  const [workpieceLength, setWorkpieceLength] = useState(100); // mm (50 - 150)
  const [workpieceMaterial, setWorkpieceMaterial] = useState('Baja St 37 (Mild Steel)');
  const [showWorkpieceModal, setShowWorkpieceModal] = useState(false);

  // ==========================================
  // 2. 8-STATION TURRET TOOL MAGAZINE STATE
  // ==========================================
  const [activeTurretStation, setActiveTurretStation] = useState(1);
  const [turretStations, setTurretStations] = useState(DEFAULT_TURRET_STATIONS);
  const [toolType, setToolType] = useState('rata'); // 'rata', 'finishing', 'facing', 'alur', 'ulir', 'ratakiri', 'centerdrill', 'udrill'
  const toolOrientation = 'front'; // Posisi Tool Post Depan Menghadap ke Operator

  // Dropdown list states (hanya terlihat 1, diklik muncul list)
  const [isToolDropdownOpen, setIsToolDropdownOpen] = useState(false);
  const toolDropdownRef = useRef(null);
  const [isProgDropdownOpen, setIsProgDropdownOpen] = useState(false);
  const progDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolDropdownRef.current && !toolDropdownRef.current.contains(event.target)) {
        setIsToolDropdownOpen(false);
      }
      if (progDropdownRef.current && !progDropdownRef.current.contains(event.target)) {
        setIsProgDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ==========================================
  // 3. FANUC SERIES 0i-TD CONTROLLER STATE
  // ==========================================
  const [fanucMode, setFanucMode] = useState('AUTO'); // 'AUTO', 'EDIT', 'JOG', 'MDI'
  const [crtScreen, setCrtScreen] = useState('POS'); // 'POS', 'PROG', 'OFFSET', 'ALARM'
  const [eStop, setEStop] = useState(false);
  const [jogStep, setJogStep] = useState(0.1);
  const [isPaused, setIsPaused] = useState(false);

  // ==========================================
  // 4. PARAMETER MESIN
  // ==========================================
  const [spindleRpm, setSpindleRpm] = useState(1200);
  const [feedRate, setFeedRate] = useState(0.20);
  const [coolant, setCoolant] = useState(true);

  // ==========================================
  // 5. PROGRAM G-CODE & EKSEKUSI
  // ==========================================
  const [gcodeText, setGcodeText] = useState(() => getGcodeTemplate('rata', 50, 100));
  const [currentLine, setCurrentLine] = useState(-1);
  const [isMachining, setIsMachining] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Profile points for Lathe (100 segments in exact mm diameter for crisp 90-degree steps)
  const initialProfile = Array(PROFILE_RESOLUTION).fill(workpieceDiameter);
  const profileRef = useRef([...initialProfile]);
  const [profileForRender, setProfileForRender] = useState([...initialProfile]);
  
  // Toolpath trajectory visibility state
  const [showToolpath, setShowToolpath] = useState(true);

  // Tool Position Refs (z in mm, d in mm diameter)
  const toolPosRef = useRef({ z: 2.0, d: workpieceDiameter + 2.0, x: workpieceDiameter + 2.0 });
  const [toolPosForRender, setToolPosForRender] = useState({ z: 2.0, d: workpieceDiameter + 2.0, x: workpieceDiameter + 2.0 });
  const targetPosRef = useRef(null);

  // Update Workpiece Dimensions Handler
  const handleUpdateWorkpiece = (newDia, newLen, newMat = workpieceMaterial) => {
    sound.playClick();
    const clampedDia = Math.max(20, Math.min(80, Number(newDia)));
    const clampedLen = Math.max(50, Math.min(150, Number(newLen)));
    
    setWorkpieceDiameter(clampedDia);
    setWorkpieceLength(clampedLen);
    if (newMat) setWorkpieceMaterial(newMat);

    // Reset profile & tool position to new stock dimensions
    const newProfile = Array(PROFILE_RESOLUTION).fill(clampedDia);
    profileRef.current = [...newProfile];
    setProfileForRender([...newProfile]);

    const newToolPos = { z: 2.0, d: clampedDia + 2.0, x: clampedDia + 2.0 };
    toolPosRef.current = newToolPos;
    setToolPosForRender(newToolPos);

    // Offer to auto-update G-code to fit new dimensions
    setGcodeText(getGcodeTemplate(toolType, clampedDia, clampedLen));
    setShowWorkpieceModal(false);
  };

  // Turret Tool Selection & Indexing Handlers
  const handleSelectTurretStation = (stationNum) => {
    sound.playClick();
    const station = DEFAULT_TURRET_STATIONS.find(t => t.station === stationNum);
    if (station) {
      setActiveTurretStation(stationNum);
      setToolType(station.id);
      setGcodeText(getGcodeTemplate(station.id, workpieceDiameter, workpieceLength));
    }
  };

  const handleTurretIndex = (direction) => {
    sound.playClick();
    const nextStation = ((activeTurretStation - 1 + direction + 8) % 8) + 1;
    handleSelectTurretStation(nextStation);
  };

  const handleSelectTool = (newToolId) => {
    sound.playClick();
    const station = DEFAULT_TURRET_STATIONS.find(t => t.id === newToolId);
    if (station) {
      setActiveTurretStation(station.station);
    }
    setToolType(newToolId);
    setGcodeText(getGcodeTemplate(newToolId, workpieceDiameter, workpieceLength));
  };

  // Manual JOG Movement Handler (FANUC Mode JOG)
  const handleManualJog = (axis, direction) => {
    if (isMachining) return;
    sound.playClick();
    const delta = direction * jogStep;
    if (axis === 'X') {
      const nextD = Math.max(0, Math.min(120, toolPosRef.current.d + delta));
      toolPosRef.current = { ...toolPosRef.current, d: nextD, x: nextD };
      setToolPosForRender({ ...toolPosRef.current, d: nextD, x: nextD });
    } else if (axis === 'Z') {
      const nextZ = Math.max(-workpieceLength - 20, Math.min(40, toolPosRef.current.z + delta));
      toolPosRef.current = { ...toolPosRef.current, z: nextZ };
      setToolPosForRender({ ...toolPosRef.current, z: nextZ });
    }
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

  // Cutting Calculation Engine (Penyayatan Presisi Sudut 90 Derajat Tanpa Tirus)
  const applyToolMove = (newD, newZ) => {
    toolPosRef.current = { z: newZ, d: newD, x: newD };
    
    // Check cutting contact inside workpiece boundary
    if (newZ <= 0.5 && newZ >= -workpieceLength - 5) {
      const clampedZ = Math.max(-workpieceLength, Math.min(0, newZ));
      const progress = Math.abs(clampedZ) / workpieceLength;
      const index = Math.min(PROFILE_RESOLUTION - 1, Math.max(0, Math.floor(progress * (PROFILE_RESOLUTION - 1))));
      const cutDiameter = Math.max(0, newD);

      if (toolType === 'alur') {
        // Pahat alur lebar 3mm: menyayat slot celah dengan dinding tegak 90 derajat
        const halfSpan = Math.max(1, Math.round((1.5 / workpieceLength) * (PROFILE_RESOLUTION - 1)));
        const startIdx = Math.max(0, index - halfSpan);
        const endIdx = Math.min(PROFILE_RESOLUTION - 1, index + halfSpan);
        for (let idx = startIdx; idx <= endIdx; idx++) {
          if (cutDiameter < profileRef.current[idx]) {
            profileRef.current[idx] = cutDiameter;
          }
        }
      } else if (toolType === 'ulir') {
        // Pahat ulir menyayat ulir metris dari Z0 sampai posisi pahat index
        for (let idx = 0; idx <= index; idx++) {
          if (cutDiameter < profileRef.current[idx]) {
            profileRef.current[idx] = cutDiameter;
          }
        }
      } else if (toolType === 'facing') {
        // Pahat facing memotong muka Z0
        if (Math.abs(newZ) <= 1.5) {
          const faceIndices = Math.max(1, Math.round((2.0 / workpieceLength) * (PROFILE_RESOLUTION - 1)));
          for (let idx = 0; idx <= faceIndices; idx++) {
            if (cutDiameter < profileRef.current[idx]) {
              profileRef.current[idx] = cutDiameter;
            }
          }
        }
      } else {
        // Pahat rata memanjang:
        // Menyayat material dari Z0 (muka index 0) hingga posisi ujung pahat (index).
        // Bidang silinder yang dilalui disayat rata sempurna, dan ujung penyayatan di index
        // membentuk sudut siku tegak lurus 90 DERAJAT tanpa merembet (tirus) ke index berikutnya!
        for (let idx = 0; idx <= index; idx++) {
          if (cutDiameter < profileRef.current[idx]) {
            profileRef.current[idx] = cutDiameter;
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
    const freshProfile = Array(PROFILE_RESOLUTION).fill(workpieceDiameter);
    profileRef.current = [...freshProfile];
    setProfileForRender([...freshProfile]);
    
    const initialPos = { z: 2.0, d: workpieceDiameter + 2.0, x: workpieceDiameter + 2.0 };
    toolPosRef.current = initialPos;
    setToolPosForRender(initialPos);
    setScore(0);
    setCurrentLine(-1);
    targetPosRef.current = null;
  };

  // G-Code Execution Engine
  useEffect(() => {
    let animFrame;
    let frameCount = 0;

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
        setProfileForRender([...profileRef.current]);
        setToolPosForRender({...toolPosRef.current});
        return;
      }
      
      const line = lines[currentLine].trim().toUpperCase();
      
      // Deteksi Tool Change di dalam G-Code (T0101 s/d T0808)
      if (line.includes('T0101') || line.includes('T01')) { setToolType('rata'); setActiveTurretStation(1); }
      else if (line.includes('T0202') || line.includes('T02')) { setToolType('finishing'); setActiveTurretStation(2); }
      else if (line.includes('T0303') || line.includes('T03')) { setToolType('facing'); setActiveTurretStation(3); }
      else if (line.includes('T0404') || line.includes('T04')) { setToolType('alur'); setActiveTurretStation(4); }
      else if (line.includes('T0505') || line.includes('T05') || line.includes('G92') || line.includes('G76')) { setToolType('ulir'); setActiveTurretStation(5); }
      else if (line.includes('T0606') || line.includes('T06')) { setToolType('ratakiri'); setActiveTurretStation(6); }
      else if (line.includes('T0707') || line.includes('T07')) { setToolType('centerdrill'); setActiveTurretStation(7); }
      else if (line.includes('T0808') || line.includes('T08')) { setToolType('udrill'); setActiveTurretStation(8); }

      if (!line || line.startsWith('(') || line.startsWith('O') || line.includes('M03') || line.includes('M05') || line.includes('M30') || line.includes('G21') || line.includes('G90') || line.includes('G54') || line.includes('G28')) {
        setTimeout(() => setCurrentLine(prev => prev + 1), 160);
        return;
      }
      
      if (!targetPosRef.current) {
        let xMatch = line.match(/X([-\d.]+)/);
        let zMatch = line.match(/Z([-\d.]+)/);
        let sMatch = line.match(/S(\d+)/);
        let fMatch = line.match(/F([-\d.]+)/);
        if (sMatch) setSpindleRpm(parseInt(sMatch[1]));
        if (fMatch) setFeedRate(parseFloat(fMatch[1]));
        
        let targetD = toolPosRef.current.d;
        let targetZ = toolPosRef.current.z;

        if (xMatch) {
          const rawX = parseFloat(xMatch[1]);
          // Mendukung mm asli (> 2.0) atau legacy normalized (<= 2.0)
          targetD = rawX <= 2.0 ? rawX * workpieceDiameter : rawX;
        }

        if (zMatch) {
          const rawZ = parseFloat(zMatch[1]);
          // Mendukung mm asli (misal -50 mm) atau legacy normalized (misal -2.0)
          targetZ = (rawZ < 0 && Math.abs(rawZ) <= 3.0) ? (rawZ / 2.0) * workpieceLength : rawZ;
        }
        
        targetPosRef.current = {
          d: targetD,
          z: targetZ,
          isRapid: line.includes('G00')
        };
      }
      
      const move = () => {
        const target = targetPosRef.current;
        if (!target) return;
        
        const current = toolPosRef.current;
        const dd = target.d - current.d;
        const dz = target.z - current.z;
        const dist = Math.sqrt(dd * dd + dz * dz);
        
        if (dist < 0.25) {
          applyToolMove(target.d, target.z);
          targetPosRef.current = null;
          setCurrentLine(curr => curr + 1);
        } else {
          const speed = target.isRapid ? 1.4 : 0.28;
          const stepD = (dd / dist) * Math.min(speed, Math.abs(dd));
          const stepZ = (dz / dist) * Math.min(speed, Math.abs(dz));
          applyToolMove(current.d + stepD, current.z + stepZ);
          
          frameCount++;
          if (frameCount % 2 === 0) {
            setProfileForRender([...profileRef.current]);
            setToolPosForRender({...toolPosRef.current});
          }
          
          animFrame = requestAnimationFrame(move);
        }
      };
      
      animFrame = requestAnimationFrame(move);
    }
    
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isMachining, currentLine, gcodeText, addXP, workpieceDiameter, workpieceLength, toolType]);

  const activeToolData = TOOLS_CONFIG[toolType] || TOOLS_CONFIG.rata;

  const sidebarMenus = [
    { id: '1', title: '1. BENDA KERJA', desc: `Ø${workpieceDiameter} x ${workpieceLength} mm` },
    { id: '2', title: '2. SPINDEL & COOLANT', desc: `S${spindleRpm} / ${coolant ? 'M08' : 'M09'}` },
    { id: '3', title: '3. PROGRAM G-CODE', desc: activeToolData.code },
    { id: '4', title: '4. PROSES SIMULASI', desc: isMachining ? (isPaused ? 'FEED HOLD' : 'RUNNING...') : 'Siap Mulai' },
    { id: '5', title: '5. HASIL & EVALUASI', desc: showResult ? 'Score 100%' : 'Menunggu' }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {!isPrepared && <PreparationModal machineName="MESIN CNC BUBUT" onComplete={() => setIsPrepared(true)} />}
      
      {/* HEADER UTAMA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            SIMULATOR MESIN BUBUT CNC (TURNING)
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Pemrograman G-Code ISO, pilihan benda kerja kustom, dan turret pahat vertikal standar industri.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            <Shield size={14} className="inline mr-1 text-emerald-400" /> SOP & K3
          </button>
          <button
            onClick={() => { sound.playClick(); setShowCalculator(true); }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calculator size={14} className="inline mr-1 text-sky-200" />
            <span>KALKULATOR SPEED (S &amp; F)</span>
          </button>
        </div>
      </div>

      {/* QUICK STATUS & SELECTION TOOLBAR DI ATAS SIMULATOR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'var(--bg-card)',
        padding: '10px 16px',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        marginBottom: '16px'
      }}>
        {/* PILIHAN BENDA KERJA CEPAT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>[BENDA KERJA]:</span>
          <button
            onClick={() => { sound.playClick(); setActiveTab('1'); }}
            style={{
              background: 'rgba(2, 132, 199, 0.12)',
              border: '1px solid #0284c7',
              color: '#0284c7',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Klik untuk mengubah ukuran diameter & panjang benda kerja"
          >
            <span>Ø {workpieceDiameter} mm &times; {workpieceLength} mm</span>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>({workpieceMaterial.split(' ')[0]})</span>
            <Edit3 size={11} className="inline" />
          </button>
        </div>

        {/* PILIHAN PAHAT CNC: HANYA TERLIHAT 1, DIKLIK BARU MUNCUL LIST */}
        <div ref={toolDropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>[PAHAT CNC]:</span>
          
          <button
            onClick={() => { sound.playClick(); setIsToolDropdownOpen(prev => !prev); }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${activeToolData.border}`,
              background: activeToolData.bg,
              color: activeToolData.color,
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s',
              boxShadow: isToolDropdownOpen ? `0 0 12px ${activeToolData.bg}` : 'none'
            }}
            title="Klik untuk memilih jenis pahat CNC lainnya"
          >
            <img
              src={getAssetUrl(activeToolData.image)}
              alt={activeToolData.name}
              style={{
                width: '28px',
                height: '20px',
                objectFit: 'cover',
                borderRadius: '4px',
                border: `1px solid ${activeToolData.border}`
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span style={{
              background: activeToolData.border,
              color: '#ffffff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 900
            }}>
              ST-{activeTurretStation}
            </span>
            <span>{activeToolData.name}</span>
            <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({activeToolData.code})</span>
            {isToolDropdownOpen ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />}
          </button>

          {/* LIST DROPDOWN SAAT DIKLIK */}
          {isToolDropdownOpen && (
            <div
              className="animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                zIndex: 100,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
                minWidth: '340px',
                maxWidth: '440px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              <div style={{
                padding: '8px 10px',
                borderBottom: '1px solid var(--border-light)',
                fontSize: '0.72rem',
                fontWeight: 900,
                color: 'var(--text-muted)',
                letterSpacing: '0.5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>DAFTAR 8 BENTUK PAHAT CNC TURRET</span>
                <span style={{ fontSize: '0.68rem', color: '#10b981' }}>KLIK UNTUK MEMILIH</span>
              </div>

              {DEFAULT_TURRET_STATIONS.map(st => {
                const isSelected = toolType === st.id;
                return (
                  <button
                    key={st.station}
                    onClick={() => {
                      handleSelectTool(st.id);
                      setIsToolDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: isSelected ? `1.5px solid ${st.border}` : '1px solid transparent',
                      background: isSelected ? st.bg : 'transparent',
                      color: isSelected ? st.color : 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '42px',
                        height: '28px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: '#090d16',
                        border: isSelected ? `1.5px solid ${st.border}` : '1px solid rgba(255,255,255,0.12)'
                      }}>
                        <img
                          src={getAssetUrl(st.image)}
                          alt={st.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <span style={{
                        background: isSelected ? st.border : 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 900
                      }}>
                        ST-{st.station}
                      </span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{st.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>{st.code} &bull; {st.shapeName}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <span style={{
                        background: '#10b981',
                        color: '#000000',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        [AKTIF]
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* TOGGLE ALUR GERAKAN PAHAT (TOOLPATH) */}
        <button
          onClick={() => { sound.playClick(); setShowToolpath(prev => !prev); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: showToolpath ? 'rgba(6, 182, 212, 0.16)' : 'rgba(255, 255, 255, 0.05)',
            border: `1.5px solid ${showToolpath ? '#06b6d4' : 'var(--border-light)'}`,
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: showToolpath ? '#06b6d4' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: showToolpath ? '0 0 10px rgba(6, 182, 212, 0.25)' : 'none'
          }}
          title="Tampilkan / Sembunyikan Garis Alur Gerakan Pahat (G00 Rapid & G01 Sayat)"
        >
          {showToolpath ? <Eye size={13} className="inline" /> : <EyeOff size={13} className="inline" />}
          <span>JALUR PAHAT: {showToolpath ? 'AKTIF (ON)' : 'NONAKTIF'}</span>
        </button>

        {/* BADGE ORIENTASI VERTIKAL */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10b981',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#047857'
        }}>
          <Compass size={14} className="inline mr-1 text-sky-400" />
          <span>PAHAT: VERTIKAL (CNC TURRET)</span>
        </div>
      </div>

      {/* WORKSPACE AREA (SIDEBAR + MIDDLE CANVAS + RIGHT MONITOR) */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: '600px' }}>
        
        {/* LEFT SIDEBAR: MENU TABS */}
        <div style={{ width: '210px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sidebarMenus.map(menu => (
            <button
              key={menu.id}
              onClick={() => { sound.playClick(); setActiveTab(menu.id); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-light)',
                background: activeTab === menu.id ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)',
                color: activeTab === menu.id ? '#60a5fa' : 'var(--text-main)',
                borderLeft: activeTab === menu.id ? '4px solid #60a5fa' : '1px solid var(--border-light)',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: menu.desc ? '3px' : '0' }}>{menu.title}</div>
              {menu.desc && <div style={{ fontSize: '0.72rem', color: activeTab === menu.id ? '#93c5fd' : 'var(--text-muted)' }}>{menu.desc}</div>}
            </button>
          ))}

          {/* QUICK PRESET BENDA KERJA DI SIDEBAR */}
          <div style={{ marginTop: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}><Zap size={12} className="inline mr-1 text-amber-400" /> PRESET CEPAT:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {WORKPIECE_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleUpdateWorkpiece(p.dia, p.len, p.mat)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: workpieceDiameter === p.dia && workpieceLength === p.len ? '1px solid #0284c7' : '1px solid rgba(255,255,255,0.06)',
                    background: workpieceDiameter === p.dia && workpieceLength === p.len ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
                    color: workpieceDiameter === p.dia && workpieceLength === p.len ? '#0284c7' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {p.name} (Ø{p.dia}&times;{p.len})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE: 3D/2D CANVAS & ACTIVE TAB CONTROLS */}
        <div style={{ flex: 1, position: 'relative', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* 3D / 2D CANVAS PORTION */}
          <div style={{ flex: '0 0 350px', width: '100%', background: '#000', position: 'relative', transition: 'all 0.3s' }}>
            <Suspense fallback={<div className="flex-center" style={{ height: '100%', color: '#60a5fa' }}>MEMUAT ENGINE BUBUT CNC...</div>}>
              <Lathe3D
                isRunning={isMachining}
                activeComponent={null}
                toolPosition={toolPosForRender}
                profile={profileForRender}
                rawDiameter={workpieceDiameter}
                rawLength={workpieceLength}
                toolType={toolType}
                toolOrientation={toolOrientation}
                activeTurretStation={activeTurretStation}
                machineMode="rata"
                rpm={spindleRpm}
                isCutting={isMachining && currentLine >= 0}
                coolant={coolant}
                showTailstock={false}
                gcodeText={gcodeText}
                currentLine={currentLine}
                showToolpath={showToolpath}
                onToggleToolpath={() => setShowToolpath(v => !v)}
              />
            </Suspense>
          </div>

          {/* ACTIVE TAB CONTENT CONTROLLER */}
          <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
            
            {/* TAB 1: KUSTOMISASI UKURAN BENDA KERJA */}
            {activeTab === '1' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Circle size={14} className="inline mr-1 text-sky-400" />
                    <span>Pengaturan Dimensi &amp; Material Benda Kerja (Workpiece)</span>
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Work Offset Datum: G54 (X0 Z0 Muka)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {/* SLIDER DIAMETER */}
                  <div style={{ background: 'var(--bg-game)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>Diameter Benda Kerja (Ø D):</label>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8' }}>{workpieceDiameter} mm</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      step="2"
                      value={workpieceDiameter}
                      onChange={(e) => handleUpdateWorkpiece(e.target.value, workpieceLength)}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>Min: 20 mm</span>
                      <span>Standar: 50 mm</span>
                      <span>Maks: 80 mm</span>
                    </div>
                  </div>

                  {/* SLIDER PANJANG */}
                  <div style={{ background: 'var(--bg-game)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>Panjang Benda Kerja (L):</label>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8' }}>{workpieceLength} mm</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      step="5"
                      value={workpieceLength}
                      onChange={(e) => handleUpdateWorkpiece(workpieceDiameter, e.target.value)}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>Min: 50 mm</span>
                      <span>Standar: 100 mm</span>
                      <span>Maks: 150 mm</span>
                    </div>
                  </div>
                </div>

                {/* PILIHAN MATERIAL */}
                <div style={{ background: 'var(--bg-game)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>PILIHAN MATERIAL BILLET:</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['Baja St 37 (Mild Steel)', 'Aluminium 6061-T6', 'Kuningan C360 (Brass)'].map(mat => (
                      <button
                        key={mat}
                        onClick={() => { sound.playClick(); setWorkpieceMaterial(mat); }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: workpieceMaterial === mat ? '1.5px solid #0284c7' : '1px solid var(--border-light)',
                          background: workpieceMaterial === mat ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-card)',
                          color: workpieceMaterial === mat ? '#0284c7' : 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: workpieceMaterial === mat ? 800 : 600,
                          cursor: 'pointer'
                        }}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SPINDEL & COOLANT */}
            {activeTab === '2' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={16} className="inline mr-1.5 text-sky-400" />
                    <span>Pengaturan Spindel Mesin &amp; Coolant Pendingin</span>
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {/* SPINDLE RPM */}
                  <div style={{ background: 'var(--bg-game)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>Putaran Spindel (RPM):</label>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8' }}>{spindleRpm} RPM</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="2500"
                      step="50"
                      value={spindleRpm}
                      onChange={(e) => {
                        const newR = Number(e.target.value);
                        setSpindleRpm(newR);
                        setGcodeText(prev => prev.replace(/S\d+/, `S${newR}`));
                      }}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      {[800, 1000, 1200, 1500, 2000].map(r => (
                        <button
                          key={r}
                          onClick={() => {
                            setSpindleRpm(r);
                            setGcodeText(prev => prev.replace(/S\d+/, `S${r}`));
                          }}
                          style={{
                            flex: 1, padding: '4px', borderRadius: '4px',
                            background: spindleRpm === r ? '#0284c7' : 'rgba(255,255,255,0.06)',
                            color: '#ffffff', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* COOLANT TOGGLE */}
                  <div style={{ background: 'var(--bg-game)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>Cairan Pendingin (Coolant):</div>
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

            {/* TAB 3: G-CODE EDITOR (DEFAULT) */}
            {activeTab === '3' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      G-Code Editor CNC Bubut &bull; Pahat Aktif: <strong style={{ color: activeToolData.color }}>{activeToolData.name} ({activeToolData.code})</strong>
                    </label>
                  </div>

                  {/* DROPDOWN TEMPLATE G-CODE: HANYA TERLIHAT 1, DIKLIK BARU MUNCUL LIST */}
                  <div ref={progDropdownRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => { sound.playClick(); setIsProgDropdownOpen(prev => !prev); }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Klik untuk memilih template G-code program lainnya"
                    >
                      <FileText size={13} className="inline text-sky-400" />
                      <span>Program: {activeToolData.name} ({activeToolData.code})</span>
                      {isProgDropdownOpen ? <ChevronUp size={13} className="inline ml-1" /> : <ChevronDown size={13} className="inline ml-1" />}
                    </button>

                    {isProgDropdownOpen && (
                      <div
                        className="animate-fade-in"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          right: 0,
                          zIndex: 100,
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '8px',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
                          minWidth: '280px',
                          padding: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          maxHeight: '320px',
                          overflowY: 'auto'
                        }}
                      >
                        <div style={{ padding: '6px 8px', fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>
                          PILIH PROGRAM TEMPLATE PAHAT:
                        </div>
                        {DEFAULT_TURRET_STATIONS.map(st => {
                          const isSel = toolType === st.id;
                          return (
                            <button
                              key={st.station}
                              onClick={() => {
                                handleSelectTool(st.id);
                                setIsProgDropdownOpen(false);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                background: isSel ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                                color: isSel ? '#38bdf8' : 'var(--text-main)',
                                fontSize: '0.72rem',
                                fontWeight: isSel ? 800 : 600,
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '22px',
                                  borderRadius: '3px',
                                  overflow: 'hidden',
                                  background: '#090d16',
                                  flexShrink: 0,
                                  border: '1px solid rgba(255, 255, 255, 0.15)'
                                }}>
                                  <img src={getAssetUrl(st.image)} alt={st.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                                <span>{st.code}: {st.name}</span>
                              </div>
                              {isSel && <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800 }}>[TERMUAT]</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
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
                      flex: 1, width: '100%', background: 'var(--bg-game)', color: '#60a5fa', 
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
                          background: idx === currentLine && isMachining ? '#60a5fa' : 'transparent',
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

            {/* TAB 4: PROSES SIMULASI & DRO READOUT */}
            {activeTab === '4' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={14} className="inline mr-1 text-amber-400" />
                    <span>Monitoring DRO (Digital Read Out) &amp; Kontrol Siklus Pemotongan</span>
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div style={{ background: '#070f1e', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>X (DIAMETER)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
                      {toolPosForRender.d.toFixed(2)} mm
                    </div>
                  </div>

                  <div style={{ background: '#070f1e', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>Z (POSISI PANJANG)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
                      {toolPosForRender.z.toFixed(2)} mm
                    </div>
                  </div>

                  <div style={{ background: '#070f1e', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>SPINDEL SPEED (S)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace' }}>
                      {spindleRpm} RPM
                    </div>
                  </div>

                  <div style={{ background: '#070f1e', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800 }}>FEEDRATE (F)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ec4899', fontFamily: 'monospace' }}>
                      {feedRate} mm/put
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: HASIL & EVALUASI */}
            {activeTab === '5' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={14} className="inline mr-1 text-amber-400" />
                    <span>Hasil Pemotongan CNC &amp; Toleransi Geometris</span>
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-game)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Benda Kerja Awal:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Ø {workpieceDiameter} mm &times; {workpieceLength} mm</div>
                  </div>

                  <div style={{ background: 'var(--bg-game)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pahat yang Digunakan:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: activeToolData.color }}>{activeToolData.name} ({activeToolData.code})</div>
                  </div>

                  <div style={{ background: 'var(--bg-game)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Orientasi Pahat:</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>Vertikal (CNC Turret Head)</div>
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
                  background: isMachining ? '#d97706' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)'
                }}
                onClick={handleStart}
                disabled={isMachining}
              >
                {isMachining ? <Loader2 size={13} className="inline animate-spin" /> : <Play size={13} className="inline" />}
                <span>{isMachining ? 'RUNNING G-CODE EXECUTION...' : 'CYCLE START (JALANKAN SIMULASI CNC)'}</span>
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

        {/* RIGHT SIDEBAR: FANUC SERIES 0i-TD OPERATOR CONTROLLER */}
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="teknalar-control" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            {/* 1. GOLDEN NAMEPLATE */}
            <div className="teknalar-nameplate">
              <div>
                <strong>FANUC Series 0i-TD</strong>
              </div>
              <span>CNC TURNING</span>
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
                      {/* DRO ACTUAL POSITION */}
                      <div className="teknalar-box">
                        <div className="teknalar-boxTitle">ACTUAL POSITION (G54 WORKPIECE)</div>
                        <div className="teknalar-bigAxis">
                          <span>X (DIA)</span>
                          <strong>{toolPosForRender.d.toFixed(3)} <small>mm</small></strong>
                        </div>
                        <div className="teknalar-bigAxis">
                          <span>Z (POS)</span>
                          <strong>{toolPosForRender.z.toFixed(3)} <small>mm</small></strong>
                        </div>
                      </div>

                      {/* SPINDLE & FEED STATUS */}
                      <div className="teknalar-box">
                        <div className="teknalar-boxTitle">SPINDLE &amp; FEED RATE STATUS</div>
                        <div className="teknalar-status">
                          <p>
                            <b>S:</b> {isMachining ? spindleRpm : 0} RPM (M03) &bull; 
                            <b>F:</b> {feedRate.toFixed(2)} mm/rev
                          </p>
                          <p>
                            <b>T:</b> ST-{activeTurretStation} ({activeToolData.code}) &bull; 
                            <b>COOL:</b> {coolant ? 'M08 ON' : 'M09 OFF'}
                          </p>
                          <p style={{ fontSize: '10px', color: '#94a3b8' }}>
                            <b>MODAL:</b> G01 G18 G21 G40 G54 G99
                          </p>
                        </div>
                      </div>

                      {/* MINI PROGRAM BLOCK TRACER */}
                      <div className="teknalar-box" style={{ flex: 1, minHeight: '70px' }}>
                        <div className="teknalar-boxTitle">ACTIVE PROGRAM BLOCK TRACER</div>
                        <div className="teknalar-prog" style={{ maxHeight: '90px' }}>
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
                      <div className="teknalar-boxTitle">TOOL GEOMETRY OFFSET (ST-{activeTurretStation})</div>
                      <div className="teknalar-status" style={{ fontSize: '11px' }}>
                        <p><b>TOOL:</b> {activeToolData.code} - {activeToolData.name}</p>
                        <p><b>GEO X:</b> +{activeToolData.geoX.toFixed(3)} mm</p>
                        <p><b>GEO Z:</b> +{activeToolData.geoZ.toFixed(3)} mm</p>
                        <p><b>RADIUS R:</b> {activeToolData.radiusR.toFixed(2)} mm</p>
                        <p><b>WEAR X:</b> {activeToolData.wearX.toFixed(3)} mm</p>
                        <p><b>WEAR Z:</b> {activeToolData.wearZ.toFixed(3)} mm</p>
                      </div>
                    </div>
                  )}

                  {crtScreen === 'ALARM' && (
                    <div className="teknalar-box" style={{ flex: 1 }}>
                      <div className="teknalar-boxTitle">ALARM MESSAGE SCREEN</div>
                      {eStop ? (
                        <div style={{ color: '#ef4444', padding: '12px', fontWeight: 800 }}>
                          ALARM 1001: EMERGENCY STOP TERTOMBO!
                          <div style={{ color: '#fca5a5', fontSize: '10px', marginTop: '6px' }}>
                            Lepaskan tombol E-STOP merah untuk melanjutkan operasi CNC.
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#10b981', padding: '12px' }}>
                          000 NO ALARM PRESENT
                          <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '6px' }}>
                            Semua interlocking dan limit switch mesin berstatus normal.
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
              {/* ROW 1: MODE SELECTOR & TURRET INDEX */}
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

                {/* TURRET INDEX BUTTON */}
                <button
                  onClick={() => handleTurretIndex(1)}
                  className="teknalar-key teknalar-teal2"
                  style={{ minWidth: '60px', minHeight: '30px', fontSize: '10px', fontWeight: 900 }}
                  title="Putar Turret ke stasiun berikutnya"
                >
                  <RefreshCw size={11} className="inline mr-1" /> TURRET T+
                </button>
              </div>

              {/* ROW 2: MANUAL JOG KEYS */}
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
                          background: jogStep === s ? '#0284c7' : '#222830',
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

                <div style={{ display: 'flex', gap: '3px' }}>
                  <button onClick={() => handleManualJog('X', 1)} className="teknalar-key" style={{ minWidth: '34px', minHeight: '28px', fontSize: '10px' }}>+X</button>
                  <button onClick={() => handleManualJog('X', -1)} className="teknalar-key" style={{ minWidth: '34px', minHeight: '28px', fontSize: '10px' }}>-X</button>
                  <button onClick={() => handleManualJog('Z', 1)} className="teknalar-key" style={{ minWidth: '34px', minHeight: '28px', fontSize: '10px' }}>+Z</button>
                  <button onClick={() => handleManualJog('Z', -1)} className="teknalar-key" style={{ minWidth: '34px', minHeight: '28px', fontSize: '10px' }}>-Z</button>
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

      {/* FORMULA & CALCULATOR MODAL */}
      <LatheFormulaCalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        initialDiameter={workpieceDiameter}
        initialLength={workpieceLength}
        currentRpm={spindleRpm}
        materialName={workpieceMaterial}
        onApplyRpm={(newRpm) => {
          setSpindleRpm(newRpm);
          setGcodeText(prev => prev.replace(/S\d+/, `S${newRpm}`));
        }}
      />
    </div>
  );
};

export default CNCLatheModule;

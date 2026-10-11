import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Center } from '@react-three/drei';
import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { sound } from '../utils/audio';
import { useAccessibility } from '../context/AccessibilityContext';

// =============================================================================
// 1. DATA KATALOG SKETSA 2D (2D SKETCH PROFILES - ISO 128)
// =============================================================================
export const SKETCH_PROFILES = [
  {
    id: 'rect',
    name: 'Persegi Balok (Rectangle)',
    desc: 'Profil 2D empat persegi berukuran 40 x 40 mm. Dasar balok kotak, pelat baja, dan komponen prismatik mesin.',
    icon: '🟦',
    dimensions: '40 x 40 mm',
    shortcut: 'REC'
  },
  {
    id: 'l_shape',
    name: 'Profil Bertingkat L (L-Profile)',
    desc: 'Profil penampang berundak/bertingkat dua level (40 x 40 mm dengan takik 20 mm). Dasar braket siku dan puli flensa.',
    icon: '🪜',
    dimensions: '40 x 40 mm (Undak 20)',
    shortcut: 'L'
  },
  {
    id: 'circle',
    name: 'Lingkaran (Circle / Disc)',
    desc: 'Profil bundar berdiameter 40 mm. Dasar komponen silindris poros transmisi, pipa, puli, dan roda gigi.',
    icon: '⭕',
    dimensions: 'Diameter 40 mm',
    shortcut: 'C'
  },
  {
    id: 'hexagon',
    name: 'Heksagon / Segi Enam (Hexagon)',
    desc: 'Profil 6 sisi beraturan beradius 22 mm. Standar ISO kepala baut (hex bolt), mur penahan, dan batang heksagonal.',
    icon: '⬡',
    dimensions: 'Radius 22 mm (6 Sisi)',
    shortcut: 'POL'
  },
  {
    id: 'trapezoid',
    name: 'Trapesium / Baji (Trapezoid)',
    desc: 'Profil trapesium dengan lebar dasar 44 mm dan puncak 24 mm. Dasar baji peluncur, rel ekor burung, dan alur V-belt.',
    icon: '📐',
    dimensions: 'Alas 44, Puncak 24 mm',
    shortcut: 'TRAP'
  },
  {
    id: 'star',
    name: 'Bintang / Roda Beralur (Star / Spline)',
    desc: 'Profil beralur bintang 5 lekukan beradius luar 24 mm dan dalam 14 mm. Dasar poros spline dan roda sirip pendingin.',
    icon: '⭐',
    dimensions: 'R_luar 24, R_dalam 14 mm',
    shortcut: 'SPL'
  }
];

// =============================================================================
// 2. DATA FITUR PEMODELAN UTAMA (3D MODELING OPERATIONS)
// =============================================================================
export const CREATE_OPERATIONS = {
  extrude: {
    id: 'extrude',
    name: 'EXTRUDE (Ekstrusi Linier Z)',
    icon: '⬆️',
    shortcut: 'EXT',
    color: '#0284c7',
    bgActive: '#0c2340',
    borderActive: '#38bdf8',
    summary: 'Menarik profil sketsa 2D secara linier tegak lurus membentuk benda padat berketebalan seragam.',
    definition: 'Operasi dasar CAD paling vital. Profil 2D ditarik tegak lurus bidang sketsa sepanjang vektor sumbu Z (+).',
    useCase: 'Membuat balok mesin, pelat baja berlubang, braket siku, poros heksagonal, dan komponen prismatik.',
    paramName: 'Kedalaman / Tinggi Ekstrusi',
    paramUnit: 'mm',
    paramMin: 15,
    paramMax: 80,
    defaultParam: 45,
    animationHelp: 'Sketsa 2D di dasar ditarik perlahan ke atas seiring bertambahnya ketinggian Z.'
  },
  revolve: {
    id: 'revolve',
    name: 'REVOLVE (Putar Sumbu 360°)',
    icon: '🔄',
    shortcut: 'REV',
    color: '#ea580c',
    bgActive: '#381a07',
    borderActive: '#fb923c',
    summary: 'Memutar penampang sketsa 2D mengelilingi sumbu poros pusat untuk menghasilkan benda silindris/aksisimetris.',
    definition: 'Memutar penampang 2D mengitari garis sumbu (Centerline Axis) sebesar sudut putar (0° hingga 360°).',
    useCase: 'Membuat poros transmisi bertingkat, puli V-belt, flensa pipa, cincin O-ring, roda gila (flywheel), dan bodi tabung.',
    paramName: 'Sudut Putaran (Revolve Angle)',
    paramUnit: '°',
    paramMin: 60,
    paramMax: 360,
    defaultParam: 360,
    animationHelp: 'Penampang 2D berputar menyapu ruang 360° mengelilingi garis sumbu putar merah.'
  },
  sweep: {
    id: 'sweep',
    name: 'SWEEP (Sapuan Sepanjang Lintasan)',
    icon: '〰️',
    shortcut: 'SWEEP',
    color: '#a855f7',
    bgActive: '#260f38',
    borderActive: '#c084fc',
    summary: 'Menggerakkan profil penampang 2D meluncur menyusuri kurva lintasan 3D (Guide Path) berbelok/berliku.',
    definition: 'Penampang profil 2D digerakkan menyapu sepanjang jalur kurva pemandu tanpa memutar orientasinya.',
    useCase: 'Membuat pipa leher angsa, saluran knalpot, pegas spiral (spring), pegangan pintu, dan jalur kabel hidrolik.',
    paramName: 'Panjang Sapuan Lintasan',
    paramUnit: '%',
    paramMin: 20,
    paramMax: 100,
    defaultParam: 100,
    animationHelp: 'Profil 2D meluncur menyusuri kurva lintasan 3D, meninggalkan padatan pipa di sepanjang jalurnya.'
  },
  loft: {
    id: 'loft',
    name: 'LOFT (Transisi 2 Penampang)',
    icon: '🌪️',
    shortcut: 'LOFT',
    color: '#06b6d4',
    bgActive: '#082530',
    borderActive: '#22d3ee',
    summary: 'Menghubungkan dua atau lebih penampang berbeda bentuk/ukuran secara bertahap dengan kurva peralihan mulus.',
    definition: 'Menciptakan bentuk transisi organik antara profil bawah dan profil atas yang terletak pada bidang kerja terpisah.',
    useCase: 'Membuat nosel turbin roket, corong transisi pipa bulat ke kotak, ducting pendingin AC, dan bodi aerodinamis.',
    paramName: 'Tinggi Jarak Transisi',
    paramUnit: 'mm',
    paramMin: 25,
    paramMax: 70,
    defaultParam: 46,
    animationHelp: 'Kulit transisi yang menghubungkan profil bawah dan profil atas tumbuh dari bawah ke atas.'
  }
};

// =============================================================================
// 3. DATA TEMPLATE KOMPONEN MESIN NYATA (1-KLIK CONTOH INDUSTRI)
// =============================================================================
export const MACHINE_TEMPLATES = [
  {
    id: 'shaft',
    name: 'Poros Bubut Bertingkat (Shaft)',
    shortName: 'Poros Bubut',
    icon: '🪵',
    category: 'Mesin Bubut',
    sketch: 'circle',
    operation: 'revolve',
    param: 360,
    hasChamfer: true,
    chamferSize: 3,
    hasHole: true,
    holeRadius: 5,
    hasFillet: false,
    hasShell: false,
    hasDraft: false,
    desc: 'Poros transmisi daya silindris dengan chamfer perakitan dan lubang senter bubut ISO.',
    commandLog: 'LOAD_PRESET: POROS BUBUT (Revolve 360° + Chamfer C3 + Lubang Senter Ø10 mm)'
  },
  {
    id: 'flange',
    name: 'Flensa Pipa 4 Lubang PCD (Pipe Flange)',
    shortName: 'Flensa Pipa',
    icon: '🔘',
    category: 'Fabrikasi Pipa',
    sketch: 'circle',
    operation: 'extrude',
    param: 32,
    hasFillet: true,
    filletRadius: 4,
    hasHole: true,
    holeRadius: 9,
    hasChamfer: false,
    hasShell: false,
    hasDraft: false,
    desc: 'Flensa sambungan pipa bertekanan dengan lubang poros dan fillet penguat transisi.',
    commandLog: 'LOAD_PRESET: FLENSA PIPA (Extrude 32mm + Fillet R4 + Lubang Poros Ø18 mm)'
  },
  {
    id: 'milling_block',
    name: 'Balok Dudukan Pasak Frais (Milling Block)',
    shortName: 'Balok Frais',
    icon: '🧱',
    category: 'Mesin Frais',
    sketch: 'rect',
    operation: 'extrude',
    param: 45,
    hasChamfer: true,
    chamferSize: 4,
    hasShell: true,
    shellThickness: 3,
    hasFillet: false,
    hasHole: false,
    hasDraft: false,
    desc: 'Benda kerja prismatik balok mesin frais dengan chamfer deburring dan rongga kantong ringan.',
    commandLog: 'LOAD_PRESET: BALOK FRAIS (Extrude 45mm + Chamfer C4 + Shell Rongga t3 mm)'
  },
  {
    id: 'hex_nut',
    name: 'Mur Heksagonal ISO M12 (Hex Nut)',
    shortName: 'Mur Heksagon',
    icon: '🔩',
    category: 'Standar ISO',
    sketch: 'hexagon',
    operation: 'extrude',
    param: 26,
    hasChamfer: true,
    chamferSize: 2,
    hasHole: true,
    holeRadius: 8,
    hasFillet: false,
    hasShell: false,
    hasDraft: false,
    desc: 'Mur pengikat heksagonal standar ISO dengan lubang ulir silindris dan chamfer tepi sudut.',
    commandLog: 'LOAD_PRESET: MUR HEKSAGONAL M12 (Extrude 26mm + Hexagon R22 + Hole Ø16 mm)'
  },
  {
    id: 'bracket',
    name: 'Braket Siku Mesin L (L-Bracket)',
    shortName: 'Braket Siku',
    icon: '🪜',
    category: 'Konstruksi Mesin',
    sketch: 'l_shape',
    operation: 'extrude',
    param: 40,
    hasFillet: true,
    filletRadius: 5,
    hasHole: true,
    holeRadius: 6,
    hasChamfer: false,
    hasShell: false,
    hasDraft: false,
    desc: 'Braket siku penahan rangka mesin dengan fillet radius untuk menghilangkan konsentrasi tegangan.',
    commandLog: 'LOAD_PRESET: BRAKET SIKU L (Extrude 40mm + Fillet R5 + Lubang Baut Ø12 mm)'
  },
  {
    id: 'reducer',
    name: 'Nosel Reducer Pipa Transisi (Loft Reducer)',
    shortName: 'Nosel Reducer',
    icon: '🌪️',
    category: 'Sistem Fluida',
    sketch: 'circle',
    topSketch: 'rect',
    operation: 'loft',
    param: 48,
    hasShell: true,
    shellThickness: 3,
    hasFillet: false,
    hasChamfer: false,
    hasHole: false,
    hasDraft: false,
    desc: 'Peralihan aerodinamis penampang lingkaran ke persegi untuk nosel turbin atau ducting fluida.',
    commandLog: 'LOAD_PRESET: NOSEL REDUCER LOFT (Loft Lingkaran ke Kotak + Shell Dinding t3 mm)'
  }
];

// Material Preset Definitions with Physical Density
const MATERIALS_CONFIG = {
  steel: { name: 'Baja ST37 (Polished Steel)', color: '#94a3b8', metalness: 0.8, roughness: 0.25, density: 7.85 },
  brass: { name: 'Kuningan Cor (Cast Brass)', color: '#f59e0b', metalness: 0.82, roughness: 0.22, density: 8.50 },
  aluminium: { name: 'Aluminium 6061 (Anodized)', color: '#cbd5e1', metalness: 0.55, roughness: 0.32, density: 2.70 },
  copper: { name: 'Tembaga Murni (Pure Copper)', color: '#ea580c', metalness: 0.85, roughness: 0.26, density: 8.96 },
  chrome: { name: 'Krom Kilap Tinggi (Chrome)', color: '#ffffff', metalness: 0.98, roughness: 0.05, density: 7.19 }
};

// =============================================================================
// 4. JENDELA VISUALISASI SKETSA 2D (AUTOCAD DRAFTING CANVAS)
// =============================================================================
const Sketch2DViewer = ({
  sketchId,
  topSketchId,
  operation,
  animProgress = 1.0,
  hasFillet,
  filletRadius,
  hasChamfer,
  chamferSize,
  hasShell,
  shellThickness,
  hasHole,
  holeRadius,
  theme = 'dark'
}) => {
  const cx = 140;
  const cy = 130;
  const isDark = theme === 'dark';

  const strokeColor = isDark ? '#38bdf8' : '#0284c7';
  const fillColor = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)';
  const dimColor = isDark ? '#facc15' : '#0f172a';
  const centerLineColor = '#ef4444';

  const renderProfileSVG = () => {
    switch (sketchId) {
      case 'rect': {
        const s = 40;
        const left = cx - s;
        const top = cy - s;
        const w = s * 2;
        const h = s * 2;

        if (hasChamfer) {
          const c = chamferSize * 2.2;
          const points = [
            `${left + c},${top}`,
            `${left + w - c},${top}`,
            `${left + w},${top + c}`,
            `${left + w},${top + h - c}`,
            `${left + w - c},${top + h}`,
            `${left + c},${top + h}`,
            `${left},${top + h - c}`,
            `${left},${top + c}`
          ].join(' ');
          return (
            <g>
              <polygon points={points} fill={fillColor} stroke={strokeColor} strokeWidth="2.8" />
              <text x={left + w - c} y={top - 6} fontSize="10" fontWeight="800" fill="#fb923c">Chamfer C{chamferSize} x 45°</text>
            </g>
          );
        }

        return (
          <g>
            <rect
              x={left}
              y={top}
              width={w}
              height={h}
              rx={hasFillet ? filletRadius * 2.5 : 0}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.8"
            />
            {hasFillet && (
              <text x={left + w + 4} y={top + 10} fontSize="10" fontWeight="800" fill="#60a5fa">Fillet R{filletRadius}</text>
            )}
            {/* Dimensi Lebar & Tinggi */}
            <line x1={left} y1={top + h + 18} x2={left + w} y2={top + h + 18} stroke={dimColor} strokeWidth="1.2" markerStart="url(#cadArrow)" markerEnd="url(#cadArrow)" />
            <text x={cx} y={top + h + 32} fontSize="11" fontWeight="800" textAnchor="middle" fill={dimColor}>40 mm</text>
            <line x1={left + w + 18} y1={top} x2={left + w + 18} y2={top + h} stroke={dimColor} strokeWidth="1.2" />
            <text x={left + w + 32} y={cy + 4} fontSize="11" fontWeight="800" textAnchor="middle" fill={dimColor}>40</text>
          </g>
        );
      }

      case 'l_shape': {
        const points = [
          `${cx - 40},${cy + 40}`,
          `${cx + 40},${cy + 40}`,
          `${cx + 40},${cy}`,
          `${cx},${cy}`,
          `${cx},${cy - 40}`,
          `${cx - 40},${cy - 40}`
        ].join(' ');

        return (
          <g>
            <polygon points={points} fill={fillColor} stroke={strokeColor} strokeWidth="2.8" />
            <text x={cx - 15} y={cy - 12} fontSize="10" fontWeight="800" fill={strokeColor}>Undak 20</text>
            <line x1={cx - 40} y1={cy + 55} x2={cx + 40} y2={cy + 55} stroke={dimColor} strokeWidth="1.2" />
            <text x={cx} y={cy + 68} fontSize="11" fontWeight="800" textAnchor="middle" fill={dimColor}>40 mm</text>
          </g>
        );
      }

      case 'hexagon': {
        const r = 44;
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
        }
        return (
          <g>
            <polygon points={pts.join(' ')} fill={fillColor} stroke={strokeColor} strokeWidth="2.8" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
            <text x={cx} y={cy + r + 18} fontSize="11" fontWeight="800" textAnchor="middle" fill={dimColor}>Radius R 22 mm (6 Sisi)</text>
          </g>
        );
      }

      case 'trapezoid': {
        const b = 44;
        const t = 24;
        const h = 36;
        const pts = [
          `${cx - b},${cy + h}`,
          `${cx + b},${cy + h}`,
          `${cx + t},${cy - h}`,
          `${cx - t},${cy - h}`
        ].join(' ');
        return (
          <g>
            <polygon points={pts} fill={fillColor} stroke={strokeColor} strokeWidth="2.8" />
            <text x={cx} y={cy - h - 8} fontSize="11" fontWeight="800" textAnchor="middle" fill={dimColor}>Puncak: 24 mm</text>
            <text x={cx} y={cy + h + 18} fontSize="11" fontWeight="800" textAnchor="middle" fill={dimColor}>Alas: 44 mm</text>
          </g>
        );
      }

      case 'star': {
        const rOut = 46;
        const rIn = 26;
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? rOut : rIn;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
        }
        return (
          <g>
            <polygon points={pts.join(' ')} fill={fillColor} stroke={strokeColor} strokeWidth="2.8" />
            <text x={cx} y={cy + rOut + 18} fontSize="11" fontWeight="800" textAnchor="middle" fill={dimColor}>Spline / Bintang 5 Lekukan</text>
          </g>
        );
      }

      case 'circle':
      default: {
        const r = 40;
        return (
          <g>
            <circle cx={cx} cy={cy} r={r} fill={fillColor} stroke={strokeColor} strokeWidth="2.8" />
            <line x1={cx - r - 15} y1={cy} x2={cx + r + 15} y2={cy} stroke={centerLineColor} strokeWidth="1.2" strokeDasharray="10 3 2 3" />
            <line x1={cx} y1={cy - r - 15} x2={cx} y2={cy + r + 15} stroke={centerLineColor} strokeWidth="1.2" strokeDasharray="10 3 2 3" />
            <line x1={cx - r * 0.7} y1={cy - r * 0.7} x2={cx + r * 0.7} y2={cy + r * 0.7} stroke={dimColor} strokeWidth="1.5" />
            <text x={cx + 15} y={cy - 12} fontSize="11" fontWeight="800" fill={dimColor}>Ø 40 mm</text>
          </g>
        );
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: isDark ? '#11141d' : '#ffffff', display: 'flex', flexDirection: 'column' }}>
      
      {/* SVG Canvas Sheet with AutoCAD Millimeter Grid */}
      <div style={{ flex: 1, width: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 280 260" width="100%" height="100%" style={{ maxHeight: '360px' }}>
          <defs>
            <pattern id="cadSmallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke={isDark ? '#1a2233' : '#f1f5f9'} strokeWidth="0.8" />
            </pattern>
            <pattern id="cadGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="url(#cadSmallGrid)" />
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke={isDark ? '#26344d' : '#e2e8f0'} strokeWidth="1.2" />
            </pattern>
            <marker id="cadArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={dimColor} />
            </marker>
          </defs>

          {/* Background Grid */}
          <rect width="280" height="260" fill="url(#cadGrid)" />

          {/* Sumbu Koordinat Bidang Sketsa (Sketch Plane XY) */}
          <line x1="20" y1={cy} x2="260" y2={cy} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1.5" />
          <line x1={cx} y1="15" x2={cx} y2="245" stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1.5" />

          {/* Sumbu X Merah (+X) */}
          <line x1={cx} y1={cy} x2="265" y2={cy} stroke="#ef4444" strokeWidth="2" />
          <polygon points="265,130 257,126 257,134" fill="#ef4444" />
          <text x="268" y="134" fontSize="10" fontWeight="900" fill="#ef4444">+X</text>

          {/* Sumbu Y Hijau (+Y) */}
          <line x1={cx} y1={cy} x2={cx} y2="15" stroke="#10b981" strokeWidth="2" />
          <polygon points="140,15 136,23 144,23" fill="#10b981" />
          <text x="146" y="20" fontSize="10" fontWeight="900" fill="#10b981">+Y</text>

          {/* Titik Pusat Origin (0,0) */}
          <circle cx={cx} cy={cy} r="4" fill="#38bdf8" />
          <text x={cx + 6} y={cy + 14} fontSize="9" fontWeight="800" fill={isDark ? '#94a3b8' : '#64748b'}>(0,0)</text>

          {/* KONTUR PROFIL 2D UTAMA */}
          {renderProfileSVG()}

          {/* OVERLAY HOLE PADA SKETSA 2D */}
          {hasHole && (
            <g>
              <circle cx={cx} cy={cy} r={holeRadius * 1.8} fill={isDark ? '#11141d' : '#ffffff'} stroke="#ef4444" strokeWidth="2" />
              <line x1={cx - holeRadius * 2.2} y1={cy} x2={cx + holeRadius * 2.2} y2={cy} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />
              <line x1={cx} y1={cy - holeRadius * 2.2} x2={cx} y2={cy + holeRadius * 2.2} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />
              <text x={cx} y={cy + 4} fontSize="9" fontWeight="900" textAnchor="middle" fill="#ef4444">Ø{holeRadius * 2}</text>
            </g>
          )}

          {/* OVERLAY SHELL PADA SKETSA 2D */}
          {hasShell && (
            <g>
              <rect x={cx - 28} y={cy - 28} width="56" height="56" fill="none" stroke="#c084fc" strokeWidth="1.8" strokeDasharray="5 3" />
              <text x={cx} y={cy - 34} fontSize="9" fontWeight="800" textAnchor="middle" fill="#c084fc">Rongga Shell (t={shellThickness} mm)</text>
            </g>
          )}

          {/* INDIKATOR OPERASI 3D PADA SKETSA */}
          {operation === 'revolve' && (
            <g>
              <line x1={cx - 48} y1="20" x2={cx - 48} y2="240" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="12 3 3 3" />
              <text x={cx - 48} y="15" fontSize="9" fontWeight="900" textAnchor="middle" fill="#ef4444">SUMBU PUTAR (AXIS)</text>
              <path d="M 115 65 A 25 25 0 0 1 165 65" fill="none" stroke="#fb923c" strokeWidth="2.5" />
              <polygon points="165,65 159,59 159,69" fill="#fb923c" />
              <text x="140" y="55" fontSize="10" fontWeight="900" textAnchor="middle" fill="#fb923c">⟳ Putar 360°</text>
            </g>
          )}

          {operation === 'extrude' && (
            <g>
              <circle cx="230" cy="45" r="14" fill={isDark ? '#1e293b' : '#dbeafe'} stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="230" cy="45" r="4" fill="#38bdf8" />
              <text x="230" y="72" fontSize="9" fontWeight="800" textAnchor="middle" fill={isDark ? '#7dd3fc' : '#1e40af'}>Tarik Sumbu +Z</text>
            </g>
          )}

          {operation === 'sweep' && (
            <g>
              <path d="M 90 140 Q 140 60 200 100 T 250 190" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeDasharray="6 4" />
              <text x="180" y="75" fontSize="10" fontWeight="900" fill="#c084fc">Lintasan Path 〰️</text>
            </g>
          )}

          {operation === 'loft' && (
            <g>
              <rect x={cx - 24} y="25" width="48" height="30" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeDasharray="4 2" />
              <text x={cx} y="44" fontSize="9" fontWeight="900" textAnchor="middle" fill="#22d3ee">Profil Atas ({topSketchId || 'rect'})</text>
              <text x={cx} y="225" fontSize="9" fontWeight="900" textAnchor="middle" fill="#38bdf8">Profil Bawah ({sketchId})</text>
              <line x1={cx - 24} y1="55" x2={cx - 40} y2="90" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1={cx + 24} y1="55" x2={cx + 40} y2="90" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="3 3" />
            </g>
          )}
        </svg>
      </div>

      {/* Footer Info Sketsa 2D */}
      <div style={{
        padding: '8px 14px',
        background: isDark ? '#0b0e14' : '#f8fafc',
        borderTop: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.74rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>Status Sketsa:</span>
          <span style={{ color: '#22c55e', fontWeight: 700 }}>Closed Loop (Siap 3D)</span>
        </div>
        <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
          Transformasi: <strong>{Math.round(animProgress * 100)}%</strong>
        </span>
      </div>

    </div>
  );
};

// =============================================================================
// 5. GENERATOR GEOMETRI TIGA DIMENSI PARAMETRIK & ANIMATIF (THREE.JS)
// =============================================================================
const createParametricCADGeometry = ({
  sketchId,
  topSketchId = 'rect',
  operation,
  opParam,
  animProgress = 1.0,
  hasFillet,
  filletRadius,
  hasChamfer,
  chamferSize,
  hasShell,
  shellThickness,
  hasDraft,
  draftAngle,
  hasHole,
  holeRadius
}) => {
  const get2DShape = (scale = 1) => {
    const shape = new THREE.Shape();
    switch (sketchId) {
      case 'rect': {
        const s = 20 * scale;
        shape.moveTo(-s, -s);
        shape.lineTo(s, -s);
        shape.lineTo(s, s);
        shape.lineTo(-s, s);
        shape.closePath();
        break;
      }
      case 'l_shape': {
        const s = 20 * scale;
        shape.moveTo(-s, -s);
        shape.lineTo(s, -s);
        shape.lineTo(s, 0);
        shape.lineTo(0, 0);
        shape.lineTo(0, s);
        shape.lineTo(-s, s);
        shape.closePath();
        break;
      }
      case 'hexagon': {
        const r = 22 * scale;
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const x = r * Math.cos(a);
          const y = r * Math.sin(a);
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        shape.closePath();
        break;
      }
      case 'trapezoid': {
        const b = 22 * scale;
        const t = 12 * scale;
        const h = 18 * scale;
        shape.moveTo(-b, -h);
        shape.lineTo(b, -h);
        shape.lineTo(t, h);
        shape.lineTo(-t, h);
        shape.closePath();
        break;
      }
      case 'star': {
        const rOut = 24 * scale;
        const rIn = 14 * scale;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? rOut : rIn;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          const x = r * Math.cos(a);
          const y = r * Math.sin(a);
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        shape.closePath();
        break;
      }
      case 'circle':
      default: {
        const r = 20 * scale;
        shape.absarc(0, 0, r, 0, Math.PI * 2, false);
        break;
      }
    }

    // Add Central Hole if activated
    if (hasHole && holeRadius > 0) {
      const hole = new THREE.Path();
      hole.absarc(0, 0, Math.min(holeRadius, 14), 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }

    return shape;
  };

  // --- A. OPERASI EXTRUDE ---
  if (operation === 'extrude') {
    const depth = Math.max(2, opParam * Math.max(0.02, animProgress));
    const shape = get2DShape(1.0);

    const bevelEn = hasFillet || hasChamfer;
    const bSize = hasFillet ? Math.min(filletRadius, 6) : hasChamfer ? Math.min(chamferSize, 5) : 0;
    const bSegments = hasFillet ? 5 : hasChamfer ? 1 : 0;

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: bevelEn,
      bevelSegments: bSegments,
      steps: 1,
      bevelSize: bSize,
      bevelThickness: bSize
    };

    let geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();

    if (hasDraft && draftAngle > 0) {
      const pos = geom.attributes.position;
      const tanA = Math.tan((draftAngle * Math.PI) / 180);
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const factor = 1 - (y / depth) * tanA * 0.8;
        pos.setX(i, pos.getX(i) * Math.max(0.4, factor));
        pos.setZ(i, pos.getZ(i) * Math.max(0.4, factor));
      }
      geom.computeVertexNormals();
    }

    return geom;
  }

  // --- B. OPERASI REVOLVE ---
  if (operation === 'revolve') {
    const sweepAngle = ((opParam * Math.PI) / 180) * Math.max(0.05, animProgress);
    const segments = Math.max(6, Math.floor(48 * Math.max(0.1, animProgress)));

    let rInner = 8;
    let rOuter = 24;
    let h = 36;

    if (sketchId === 'l_shape') {
      const pts = [
        new THREE.Vector2(rInner, -h / 2),
        new THREE.Vector2(rOuter, -h / 2),
        new THREE.Vector2(rOuter, 0),
        new THREE.Vector2(rInner + 8, 0),
        new THREE.Vector2(rInner + 8, h / 2),
        new THREE.Vector2(rInner, h / 2)
      ];
      const geom = new THREE.LatheGeometry(pts, segments, 0, sweepAngle);
      geom.center();
      return geom;
    }

    if (sketchId === 'hexagon') {
      rOuter = 22;
    } else if (sketchId === 'trapezoid') {
      const pts = [
        new THREE.Vector2(rInner, -h / 2),
        new THREE.Vector2(26, -h / 2),
        new THREE.Vector2(16, h / 2),
        new THREE.Vector2(rInner, h / 2)
      ];
      const geom = new THREE.LatheGeometry(pts, segments, 0, sweepAngle);
      geom.center();
      return geom;
    }

    const pts = [
      new THREE.Vector2(hasHole ? Math.min(holeRadius + 2, 12) : rInner, -h / 2),
      new THREE.Vector2(rOuter, -h / 2),
      new THREE.Vector2(rOuter, h / 2),
      new THREE.Vector2(hasHole ? Math.min(holeRadius + 2, 12) : rInner, h / 2)
    ];

    const geom = new THREE.LatheGeometry(pts, segments, 0, sweepAngle);
    geom.center();
    return geom;
  }

  // --- C. OPERASI SWEEP ---
  if (operation === 'sweep') {
    const tMax = Math.max(0.08, animProgress);
    const curvePoints = [];
    const fullSteps = 30;
    const activeSteps = Math.max(3, Math.floor(fullSteps * tMax));

    for (let i = 0; i <= activeSteps; i++) {
      const t = (i / fullSteps) * Math.PI;
      const x = 32 * Math.sin(t);
      const y = -28 + (i / fullSteps) * 56;
      const z = 18 * Math.cos(t * 1.5);
      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    const path = new THREE.CatmullRomCurve3(curvePoints);
    const shapeRadius = sketchId === 'circle' ? 7 : sketchId === 'hexagon' ? 8 : 6;
    const tubularSegments = Math.max(8, activeSteps * 3);
    const radialSegments = sketchId === 'hexagon' ? 6 : sketchId === 'rect' ? 4 : 16;

    const geom = new THREE.TubeGeometry(path, tubularSegments, shapeRadius, radialSegments, false);
    geom.center();
    return geom;
  }

  // --- D. OPERASI LOFT ---
  if (operation === 'loft') {
    const H = Math.max(10, opParam);
    const radialSegments = 36;
    const heightSegments = 24;
    const activeHeightSegments = Math.max(2, Math.floor(heightSegments * Math.max(0.04, animProgress)));

    const getRadius = (shape, angle) => {
      const normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      switch (shape) {
        case 'rect': {
          const s = 19;
          return s / Math.max(0.35, Math.max(Math.abs(Math.cos(normalized)), Math.abs(Math.sin(normalized))));
        }
        case 'hexagon': {
          const r = 21;
          const sector = Math.PI / 3;
          const localAngle = (normalized % sector) - sector / 2;
          return r * (Math.cos(sector / 2) / Math.cos(localAngle));
        }
        case 'trapezoid': {
          const yNorm = Math.sin(normalized);
          return 18 + (yNorm > 0 ? -4 : 6);
        }
        case 'star': {
          return 18 + 5 * Math.cos(5 * normalized);
        }
        case 'l_shape': {
          return 19 + (Math.cos(normalized) > 0 && Math.sin(normalized) > 0 ? -6 : 0);
        }
        case 'circle':
        default:
          return 20;
      }
    };

    const vertices = [];
    const indices = [];

    const bottomShape = sketchId;
    const topShape = topSketchId || (sketchId === 'circle' ? 'rect' : 'circle');

    for (let j = 0; j <= activeHeightSegments; j++) {
      const t = j / heightSegments;
      const y = -H / 2 + t * H;

      for (let i = 0; i <= radialSegments; i++) {
        const angle = (i / radialSegments) * Math.PI * 2;
        const rBot = getRadius(bottomShape, angle);
        const rTop = getRadius(topShape, angle);
        const r = (1 - t) * rBot + t * rTop;

        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle);
        vertices.push(x, y, z);
      }
    }

    for (let j = 0; j < activeHeightSegments; j++) {
      for (let i = 0; i < radialSegments; i++) {
        const a = j * (radialSegments + 1) + i;
        const b = (j + 1) * (radialSegments + 1) + i;
        const c = (j + 1) * (radialSegments + 1) + (i + 1);
        const d = j * (radialSegments + 1) + (i + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }

  return new THREE.BoxGeometry(40, 40, 40);
};

// =============================================================================
// 6. KOMPONEN MESH 3D & X-RAY SECTION
// =============================================================================
const CADSolidMesh = ({ geometry, materialMode, isCrossSection }) => {
  const edgesGeom = useMemo(() => {
    if (!geometry) return null;
    return new THREE.EdgesGeometry(geometry, 20);
  }, [geometry]);

  const matProps = MATERIALS_CONFIG[materialMode] || MATERIALS_CONFIG.steel;

  if (!geometry) return null;

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={matProps.color}
          metalness={matProps.metalness}
          roughness={matProps.roughness}
          side={THREE.DoubleSide}
          transparent={isCrossSection}
          opacity={isCrossSection ? 0.72 : 1.0}
        />
      </mesh>
      {edgesGeom && (
        <lineSegments geometry={edgesGeom}>
          <lineBasicMaterial color={isCrossSection ? '#38bdf8' : '#0f172a'} linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
};

// Visual Helper Overlays (Axis, Extrusion Arrow)
const CADVisualHelpers = ({ operation, animProgress }) => {
  if (operation === 'revolve') {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 75, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    );
  }

  if (operation === 'extrude') {
    return (
      <group position={[0, 24 * animProgress, 0]}>
        <mesh position={[0, 6, 0]}>
          <coneGeometry args={[2.5, 6, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 8, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>
    );
  }

  return null;
};

// Camera Controller for ViewCube Animation
const CameraRig = ({ targetCamPos, controlsRef }) => {
  useFrame((state) => {
    if (targetCamPos && controlsRef.current) {
      state.camera.position.lerp(targetCamPos, 0.08);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  });
  return null;
};

// =============================================================================
// 7. KOMPONEN LAYOUT KERTAS A4 & ETIKET RESMI (PAPER SPACE ISO 5456 / 128)
// =============================================================================
const LayoutA4Paper = ({
  sketchData,
  opData,
  opParam,
  hasFillet,
  filletRadius,
  hasChamfer,
  chamferSize,
  hasHole,
  holeRadius,
  hasShell,
  shellThickness,
  materialMode,
  metrics,
  onBackToModel
}) => {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '20px 10px',
      background: '#1e293b',
      borderRadius: '16px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Paper Space Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '920px',
        background: '#0f172a',
        padding: '10px 16px',
        borderRadius: '10px',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>📄</span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#f8fafc' }}>
              LAYOUT GAMBAR KERJA A4 (ISO 5456 / ISO 128)
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Skala 1:1 • Proyeksi Sudut Pertama (Eropa) • Satuan: Milimeter (mm)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onBackToModel}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #475569',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🔙 Kembali ke Model Space (AutoCAD 3D)
          </button>
          <button
            onClick={() => { sound.playClick(); window.print(); }}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🖨️</span> Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* Lembar Kertas Gambar A4 (297 x 210 mm Landscape) */}
      <div style={{
        width: '100%',
        maxWidth: '920px',
        background: '#ffffff',
        color: '#0f172a',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        padding: '24px',
        boxSizing: 'border-box',
        borderRadius: '4px',
        fontFamily: "'Courier New', Courier, monospace",
        position: 'relative'
      }}>
        {/* Garis Tepi Standar ISO (Kiri 20mm, Lainnya 10mm) */}
        <div style={{
          border: '2.5px solid #0f172a',
          padding: '16px',
          minHeight: '520px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Header Gambar Kerja */}
          <div style={{ borderBottom: '1.5px solid #0f172a', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '1px' }}>
                SMK NEGERI 2 DEPOK • JURUSAN TEKNIK PEMESINAN
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                JOB SHEET GAMBAR MANUFAKTUR &amp; PERANCANGAN CAD/CAM
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>SIMBOL PROYEKSI:</span>
              {/* Simbol Proyeksi Eropa ISO */}
              <svg width="45" height="22" viewBox="0 0 50 25">
                <circle cx="12" cy="12.5" r="5" fill="none" stroke="#0f172a" strokeWidth="1.2" />
                <circle cx="12" cy="12.5" r="9" fill="none" stroke="#0f172a" strokeWidth="1.2" />
                <polygon points="28,6 44,2 44,23 28,19" fill="none" stroke="#0f172a" strokeWidth="1.2" />
                <line x1="2" y1="12.5" x2="48" y2="12.5" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="6 2 1 2" />
              </svg>
            </div>
          </div>

          {/* Area Gambar (Drawing Viewports) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', padding: '20px 0', flex: 1 }}>
            {/* Viewport 1: Tampak 2D Proyeksi Depan */}
            <div style={{ border: '1px dashed #cbd5e1', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '8px', color: '#0284c7' }}>
                TAMPAK DEPAN (FRONT VIEW) • SKALA 1:1
              </div>
              <div style={{ width: '220px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sketch2DViewer
                  sketchId={sketchData.id}
                  operation={opData.id}
                  animProgress={1.0}
                  hasFillet={hasFillet}
                  filletRadius={filletRadius}
                  hasChamfer={hasChamfer}
                  chamferSize={chamferSize}
                  hasShell={hasShell}
                  shellThickness={shellThickness}
                  hasHole={hasHole}
                  holeRadius={holeRadius}
                  theme="light"
                />
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
                Semua ukuran dalam milimeter (mm). Toleransi umum ISO 2768-m.
              </div>
            </div>

            {/* Viewport 2: Parameter & Proyeksi Isometri */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ border: '1px dashed #cbd5e1', padding: '10px', flex: 1, background: '#f8fafc' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
                  TABEL DATA PARAMETER TEKNIS:
                </div>
                <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.5 }}>
                  <div>• Operasi CAD: <strong>{opData.name.split('(')[0]}</strong></div>
                  <div>• Sketsa Dasar: <strong>{sketchData.name.split('(')[0]}</strong></div>
                  <div>• Ukuran Utama: <strong>{opParam} {opData.paramUnit}</strong></div>
                  <div>• Fillet / Radius: <strong>{hasFillet ? `R = ${filletRadius} mm` : 'None'}</strong></div>
                  <div>• Chamfer Perakitan: <strong>{hasChamfer ? `C = ${chamferSize} mm x 45°` : 'None'}</strong></div>
                  <div>• Lubang Senter/Baut: <strong>{hasHole ? `Ø = ${holeRadius * 2} mm (Tembus)` : 'None'}</strong></div>
                  <div>• Rongga Shell: <strong>{hasShell ? `Tebal t = ${shellThickness} mm` : 'Padat (Solid)'}</strong></div>
                  <div>• Bahan (Material): <strong>{MATERIALS_CONFIG[materialMode]?.name || 'Baja ST37'}</strong></div>
                  <div>• Volume Estimasi: <strong>{metrics.volume} cm³</strong></div>
                  <div>• Berat (Massa): <strong>{metrics.mass} gram</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* ETIKET KEPALA GAMBAR RESMI (TITLE BLOCK STANDAR ISO) */}
          <div style={{ border: '2px solid #0f172a', marginTop: '12px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontSize: '0.72rem' }}>
            {/* Kolom Judul & Instansi */}
            <div style={{ borderRight: '1.5px solid #0f172a', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ color: '#64748b', fontSize: '0.62rem' }}>JUDUL GAMBAR KERJA:</div>
              <div style={{ fontWeight: 900, fontSize: '0.88rem', color: '#0f172a' }}>
                {sketchData.name.split('(')[0].toUpperCase()} - {opData.name.split('(')[0]}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7' }}>
                SMK NEGERI 2 DEPOK (KAMPUS DUDI)
              </div>
            </div>

            {/* Kolom Skala & Tanggal */}
            <div style={{ borderRight: '1.5px solid #0f172a', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div>SKALA: <strong>1 : 1</strong></div>
              <div>SATUAN: <strong>mm</strong></div>
              <div>TANGGAL: <strong>{currentDate}</strong></div>
              <div>UKURAN: <strong>A4 (297x210)</strong></div>
            </div>

            {/* Kolom Drafter & Pemeriksa */}
            <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div>DIGAMBAR: <strong>X-TP.A (SISWA)</strong></div>
              <div>DIPERIKSA: <strong>GURU PENGAMPU</strong></div>
              <div>NO. GAMBAR: <strong>CAD-TP-01</strong></div>
              <div>STATUS: <strong style={{ color: '#16a34a' }}>DISETUJUI ✅</strong></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// =============================================================================
// 8. KOMPONEN UTAMA AUTOCAD MECHANICAL WORKBENCH
// =============================================================================
const CADStudioSimulator = () => {
  // State 1: Sketsa 2D Awal
  const [selectedSketch, setSelectedSketch] = useState('rect');
  const [selectedTopSketch, setSelectedTopSketch] = useState('circle');

  // State 2: Operasi 3D
  const [selectedOperation, setSelectedOperation] = useState('extrude');
  const [opParam, setOpParam] = useState(45);

  // Animasi Transformasi 3D (0.0 to 1.0)
  const [animProgress, setAnimProgress] = useState(1.0);
  const [isPlayingAnim, setIsPlayingAnim] = useState(false);
  const [isAutoLoop, setIsAutoLoop] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1.0);

  // State 3: Modifiers (Fillet, Chamfer, Shell, Draft, Hole)
  const [hasFillet, setHasFillet] = useState(false);
  const [filletRadius, setFilletRadius] = useState(4);

  const [hasChamfer, setHasChamfer] = useState(false);
  const [chamferSize, setChamferSize] = useState(4);

  const [hasShell, setHasShell] = useState(false);
  const [shellThickness, setShellThickness] = useState(3);

  const [hasDraft, setHasDraft] = useState(false);
  const [draftAngle, setDraftAngle] = useState(7);

  const [hasHole, setHasHole] = useState(false);
  const [holeRadius, setHoleRadius] = useState(8);

  // Cross section / X-Ray mode
  const [isCrossSection, setIsCrossSection] = useState(false);

  // Display Mode ('split', '2d_only', '3d_only', 'layout')
  const [displayMode, setDisplayMode] = useState('split');

  // Ribbon Navigation Tab ('draw', 'solid', 'modify', 'templates', 'materials', 'layout')
  const [ribbonTab, setRibbonTab] = useState('draw');

  // AutoCAD Command Prompt Line
  const [commandLine, setCommandLine] = useState('Fusion 360 CAD: Siap mendesain model 3D parametrik standar teknik mesin.');
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(true);

  // Camera & Visual
  const [materialMode, setMaterialMode] = useState('steel');
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeViewAngle, setActiveViewAngle] = useState('iso');
  const [cadTheme, setCadTheme] = useState('light'); // Default: Light sheet (Fusion 360 style)

  const controlsRef = useRef(null);

  // ---------------------------------------------------------------------------
  // ANIMATION LOOP ENGINE (Smooth RequestAnimationFrame)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isPlayingAnim) return;

    let animId;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setAnimProgress((prev) => {
        const step = dt * 0.45 * animSpeed;
        const next = prev + step;
        if (next >= 1.0) {
          if (isAutoLoop) {
            return 0.0;
          } else {
            setIsPlayingAnim(false);
            return 1.0;
          }
        }
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingAnim, isAutoLoop, animSpeed]);

  // Handler Ganti Sketsa
  const handleSelectSketch = (sketchId) => {
    sound.playClick();
    setSelectedSketch(sketchId);
    setAnimProgress(0.0);
    setIsPlayingAnim(true);
    const sk = SKETCH_PROFILES.find(s => s.id === sketchId);
    setCommandLine(`Command: SKETCH_SELECT -> Profil [${sk?.name?.split('(')[0]}] aktif. Dimensi: ${sk?.dimensions}`);
  };

  // Handler Ganti Operasi
  const handleSelectOperation = (opId) => {
    sound.playClick();
    setSelectedOperation(opId);
    setOpParam(CREATE_OPERATIONS[opId].defaultParam);
    setAnimProgress(0.0);
    setIsPlayingAnim(true);
    const op = CREATE_OPERATIONS[opId];
    setCommandLine(`Command: ${op.shortcut} -> Operasi [${op.name.split('(')[0]}] aktif. Parameter awal: ${op.defaultParam} ${op.paramUnit}`);
  };

  // Handler Load Template Mesin
  const handleLoadTemplate = (tpl) => {
    sound.playClick();
    setSelectedSketch(tpl.sketch);
    if (tpl.topSketch) setSelectedTopSketch(tpl.topSketch);
    setSelectedOperation(tpl.operation);
    setOpParam(tpl.param);
    setHasChamfer(!!tpl.hasChamfer);
    if (tpl.chamferSize) setChamferSize(tpl.chamferSize);
    setHasFillet(!!tpl.hasFillet);
    if (tpl.filletRadius) setFilletRadius(tpl.filletRadius);
    setHasHole(!!tpl.hasHole);
    if (tpl.holeRadius) setHoleRadius(tpl.holeRadius);
    setHasShell(!!tpl.hasShell);
    if (tpl.shellThickness) setShellThickness(tpl.shellThickness);
    setHasDraft(!!tpl.hasDraft);

    setAnimProgress(0.0);
    setIsPlayingAnim(true);
    setCommandLine(`Command: ${tpl.commandLog}`);
  };

  const handleReplayAnim = () => {
    sound.playClick();
    setAnimProgress(0.0);
    setIsPlayingAnim(true);
    setCommandLine('Command: REPLAY_ANIM -> Memutar ulang simulasi transformasi 2D ke 3D.');
  };

  const handleTogglePlayPause = () => {
    sound.playClick();
    if (animProgress >= 1.0 && !isPlayingAnim) {
      setAnimProgress(0.0);
      setIsPlayingAnim(true);
    } else {
      setIsPlayingAnim(!isPlayingAnim);
    }
  };

  // Modifiers Toggles
  const handleToggleFillet = () => {
    sound.playClick();
    const nextVal = !hasFillet;
    setHasFillet(nextVal);
    if (nextVal) setHasChamfer(false);
    setCommandLine(nextVal ? `Command: FILLET -> Radius R=${filletRadius} mm (Mencegah konsentrasi tegangan).` : 'Command: FILLET_OFF -> Fillet dinonaktifkan.');
  };

  const handleToggleChamfer = () => {
    sound.playClick();
    const nextVal = !hasChamfer;
    setHasChamfer(nextVal);
    if (nextVal) setHasFillet(false);
    setCommandLine(nextVal ? `Command: CHAMFER -> Ukuran C=${chamferSize} mm x 45° (Mempermudah perakitan).` : 'Command: CHAMFER_OFF -> Chamfer dinonaktifkan.');
  };

  // Integrasi Audio Narator Inklusi
  const { speakText, stopSpeech, isSpeaking, currentNarrativeTitle } = useAccessibility();
  const activeOpData = CREATE_OPERATIONS[selectedOperation] || CREATE_OPERATIONS.extrude;
  const activeSketchData = SKETCH_PROFILES.find((s) => s.id === selectedSketch) || SKETCH_PROFILES[0];
  const isSpeakingCAD = isSpeaking && currentNarrativeTitle === `CAD: ${activeOpData.name}`;

  const handleToggleCADAudio = () => {
    const title = `CAD: ${activeOpData.name}`;
    if (isSpeaking && currentNarrativeTitle === title) {
      stopSpeech();
    } else {
      const filletDesc = hasFillet ? `Fitur Fillet lengkung aktif dengan radius ${filletRadius} milimeter.` : hasChamfer ? `Fitur Chamfer sudut miring aktif ${chamferSize} milimeter.` : 'Tanpa fillet maupun chamfer.';
      const holeDesc = hasHole ? `Fitur lubang silindris Hole aktif berdiameter ${holeRadius * 2} milimeter.` : '';
      const shellDesc = hasShell ? `Fitur rongga dinding tipis Shell aktif dengan ketebalan ${shellThickness} milimeter.` : '';
      const text = `Selamat datang di AutoCAD Mechanical Studio. Sketsa 2D aktif adalah ${activeSketchData.name}. Operasi pembentukan 3D aktif adalah ${activeOpData.name}. ${activeOpData.definition} Modifikasi: ${filletDesc} ${holeDesc} ${shellDesc} Anda dapat melihat hasil di kanvas atau membuka Layout Kertas A4 untuk melihat etiket gambar kerja standar SMK.`;
      speakText(text, title);
    }
  };

  // CAD Geometry Computation
  const cadGeometry = useMemo(() => {
    return createParametricCADGeometry({
      sketchId: selectedSketch,
      topSketchId: selectedTopSketch,
      operation: selectedOperation,
      opParam,
      animProgress,
      hasFillet,
      filletRadius,
      hasChamfer,
      chamferSize,
      hasShell,
      shellThickness,
      hasDraft,
      draftAngle,
      hasHole,
      holeRadius
    });
  }, [
    selectedSketch,
    selectedTopSketch,
    selectedOperation,
    opParam,
    animProgress,
    hasFillet,
    filletRadius,
    hasChamfer,
    chamferSize,
    hasShell,
    shellThickness,
    hasDraft,
    draftAngle,
    hasHole,
    holeRadius
  ]);

  // Metrologi Fisik (Volume, Luas, Massa)
  const inspectionMetrics = useMemo(() => {
    if (!cadGeometry) return { volume: '0.0', area: '0.0', mass: '0.0' };
    if (!cadGeometry.boundingBox) cadGeometry.computeBoundingBox();
    const bb = cadGeometry.boundingBox;
    const dx = Math.abs(bb.max.x - bb.min.x);
    const dy = Math.abs(bb.max.y - bb.min.y);
    const dz = Math.abs(bb.max.z - bb.min.z);
    const vol = (dx * dy * dz * 0.7) / 1000;
    const area = (2 * (dx * dy + dy * dz + dz * dx)) / 100;
    const density = MATERIALS_CONFIG[materialMode]?.density || 7.85;
    const mass = vol * density;
    return {
      volume: vol.toFixed(1),
      area: area.toFixed(1),
      mass: mass.toFixed(1)
    };
  }, [cadGeometry, materialMode]);

  // Export File STL untuk 3D Printing
  const handleExportSTL = () => {
    try {
      if (!cadGeometry) return;
      const exporter = new STLExporter();
      const mesh = new THREE.Mesh(cadGeometry, new THREE.MeshStandardMaterial());
      const result = exporter.parse(mesh, { binary: true });
      const blob = new Blob([result], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `CAD_Part_${selectedSketch}_${selectedOperation}.stl`;
      link.click();
      URL.revokeObjectURL(link.href);
      sound.playSuccess();
      setCommandLine(`Command: EXPORT_STL -> Berhasil mengunduh CAD_Part_${selectedSketch}_${selectedOperation}.stl untuk 3D Printing!`);
    } catch (err) {
      console.error('Gagal export STL:', err);
    }
  };

  const targetCamPos = useMemo(() => {
    const dist = 85;
    switch (activeViewAngle) {
      case 'depan': return new THREE.Vector3(0, 0, dist);
      case 'kanan': return new THREE.Vector3(dist, 0, 0);
      case 'atas': return new THREE.Vector3(0, dist, 0);
      case 'iso':
      default: return new THREE.Vector3(60, 50, 60);
    }
  }, [activeViewAngle]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      background: '#f5f7fa',
      color: '#1e293b',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      boxSizing: 'border-box'
    }}>

      
      {/* =====================================================================
          1. FUSION 360 APPLICATION TOP BAR (White)
          ===================================================================== */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Title & Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #ff6914 0%, #e55a0f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.2rem',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(255, 105, 20, 0.35)'
          }}>
            F
          </div>
          <div>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, letterSpacing: '0.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Fusion 360 — CAD Studio Mesin
              <span style={{ fontSize: '0.62rem', background: '#0284c7', color: '#ffffff', padding: '1px 7px', borderRadius: '4px', fontWeight: 800 }}>
                ISO 128 / 5456
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Pemodelan Parametrik 2D/3D • Sketsa ➡️ Padatan 3D • Cetak Etiket A4
            </div>
          </div>
        </div>

        {/* Right Tools: Audio Narrator, Guide Toggle, Viewport Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Tombol Audio Narator Inklusi */}
          <button
            onClick={handleToggleCADAudio}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: isSpeakingCAD ? '1px solid #0284c7' : '1px solid #cbd5e1',
              background: isSpeakingCAD ? '#0284c7' : '#f1f5f9',
              color: isSpeakingCAD ? '#ffffff' : '#334155',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Dengarkan penjelasan suara materi dan alat CAD ini (Inklusi)"
          >
            <span>{isSpeakingCAD ? '⏹️' : '🔊'}</span>
            <span>{isSpeakingCAD ? 'Hentikan Audio' : 'Penjelasan Suara'}</span>
          </button>

          {/* Toggle Panduan Siswa */}
          <button
            onClick={() => setShowWorkflowGuide(!showWorkflowGuide)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: showWorkflowGuide ? '#dbeafe' : '#f1f5f9',
              color: showWorkflowGuide ? '#1d4ed8' : '#475569',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {showWorkflowGuide ? '📖 Panduan: ON' : '📖 Panduan: OFF'}
          </button>

          {/* Viewport Workspace Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => { sound.playClick(); setDisplayMode('split'); }}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: displayMode === 'split' ? '#0284c7' : 'transparent',
                color: displayMode === 'split' ? '#fff' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
              title="Tampilkan sketsa 2D dan model 3D berdampingan"
            >
              🖥️ 2D & 3D
            </button>
            <button
              onClick={() => { sound.playClick(); setDisplayMode('2d_only'); }}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: displayMode === '2d_only' ? '#0284c7' : 'transparent',
                color: displayMode === '2d_only' ? '#fff' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              📐 2D
            </button>
            <button
              onClick={() => { sound.playClick(); setDisplayMode('3d_only'); }}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: displayMode === '3d_only' ? '#0284c7' : 'transparent',
                color: displayMode === '3d_only' ? '#fff' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🧊 3D
            </button>
            <button
              onClick={() => { sound.playClick(); setDisplayMode('layout'); }}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: displayMode === 'layout' ? '#10b981' : 'transparent',
                color: displayMode === 'layout' ? '#fff' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
              title="Lihat dalam format kertas A4 lengkap dengan Etiket Gambar Resmi SMK"
            >
              📄 Layout A4
            </button>
          </div>
        </div>
      </div>


      {/* =====================================================================
          2. COLLAPSIBLE STUDENT WORKFLOW GUIDE (ALUR CEPAT 4 LANGKAH)
          ===================================================================== */}
      {showWorkflowGuide && (
        <div style={{
          background: 'linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%)',
          borderBottom: '1px solid #bfdbfe',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem' }}>💡</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8' }}>
              ALUR KERJA CAD SISWA:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1, justifyContent: 'center' }}>
            <div style={{ background: ribbonTab === 'draw' ? '#0284c7' : 'rgba(37,99,235,0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: ribbonTab === 'draw' ? '#fff' : '#1d4ed8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>1️⃣</span> <span>Pilih Profil 2D</span>
            </div>
            <span style={{ color: '#94a3b8' }}>➔</span>
            <div style={{ background: ribbonTab === 'solid' ? '#0284c7' : 'rgba(37,99,235,0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: ribbonTab === 'solid' ? '#fff' : '#1d4ed8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>2️⃣</span> <span>Bentuk Padatan 3D</span>
            </div>
            <span style={{ color: '#94a3b8' }}>➔</span>
            <div style={{ background: ribbonTab === 'modify' ? '#0284c7' : 'rgba(37,99,235,0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: ribbonTab === 'modify' ? '#fff' : '#1d4ed8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>3️⃣</span> <span>Beri Fillet / Lubang</span>
            </div>
            <span style={{ color: '#94a3b8' }}>➔</span>
            <div style={{ background: ribbonTab === 'layout' ? '#10b981' : 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: ribbonTab === 'layout' ? '#fff' : '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>4️⃣</span> <span>Cetak Kertas Etiket A4</span>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>
            Atau klik tab <strong>"TEMPLATE MESIN"</strong> untuk memuat benda jadi 1-klik!
          </div>
        </div>
      )}


      {/* =====================================================================
          3. FUSION 360 TOOLBAR TABS (Light Theme)
          ===================================================================== */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        {/* Tab Headers */}
        <div style={{ display: 'flex', background: '#f8fafc', padding: '0 12px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
          {[
            { id: 'draw', label: '✏️ SKETCH (Profil 2D)' },
            { id: 'solid', label: '🧊 CREATE (Benda 3D)' },
            { id: 'modify', label: '🛠️ MODIFY (Fillet/Lubang)' },
            { id: 'templates', label: '📦 TEMPLATE (1-Klik)' },
            { id: 'materials', label: '🎨 MATERIAL & FISIK' },
            { id: 'layout', label: '📄 LAYOUT A4' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setRibbonTab(tab.id);
                if (tab.id === 'layout') setDisplayMode('layout');
                else if (displayMode === 'layout') setDisplayMode('split');
              }}
              style={{
                padding: '9px 16px',
                background: ribbonTab === tab.id ? '#ffffff' : 'transparent',
                color: ribbonTab === tab.id ? '#0284c7' : '#64748b',
                border: 'none',
                borderBottom: ribbonTab === tab.id ? '2.5px solid #ff6914' : '2.5px solid transparent',
                fontSize: '0.78rem',
                fontWeight: ribbonTab === tab.id ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ribbon Content Panel for Active Tab */}
        <div style={{ padding: '12px 18px', minHeight: '80px', display: 'flex', alignItems: 'center', background: '#ffffff' }}>
          
          {/* TAB 1: SKETCH (SKETSA 2D) */}
          {ribbonTab === 'draw' && (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', minWidth: '100px' }}>
                PROFIL SKETSA:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                {SKETCH_PROFILES.map((sk) => {
                  const isSel = selectedSketch === sk.id;
                  return (
                    <button
                      key={sk.id}
                      onClick={() => handleSelectSketch(sk.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: isSel ? '2px solid #ff6914' : '1px solid #e2e8f0',
                        background: isSel ? '#fff7ed' : '#f8fafc',
                        color: isSel ? '#c2410c' : '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.15s',
                        boxShadow: isSel ? '0 2px 8px rgba(255,105,20,0.2)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{sk.icon}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>{sk.name.split('(')[0]}</div>
                        <div style={{ fontSize: '0.65rem', color: isSel ? '#ea580c' : '#94a3b8' }}>{sk.dimensions}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedOperation === 'loft' && (
                <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 800 }}>Profil Atas Loft:</span>
                  {SKETCH_PROFILES.slice(0, 3).map((sk) => (
                    <button
                      key={`top-${sk.id}`}
                      onClick={() => { sound.playClick(); setSelectedTopSketch(sk.id); }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: selectedTopSketch === sk.id ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                        background: selectedTopSketch === sk.id ? '#0284c7' : '#f8fafc',
                        color: selectedTopSketch === sk.id ? '#fff' : '#334155',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {sk.icon} {sk.name.split('(')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE 3D (OPERASI PADAT) */}
          {ribbonTab === 'solid' && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
              {/* 4 Operasi — large icon buttons, Fusion 360 style */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.values(CREATE_OPERATIONS).map((op) => {
                  const isSel = selectedOperation === op.id;
                  return (
                    <button
                      key={op.id}
                      onClick={() => handleSelectOperation(op.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: isSel ? `2px solid ${op.color}` : '1px solid #e2e8f0',
                        background: isSel ? op.color : '#f8fafc',
                        color: isSel ? '#ffffff' : '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: isSel ? `0 2px 8px ${op.color}55` : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>{op.icon}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 900 }}>{op.name.split('(')[0].trim()}</div>
                        <div style={{ fontSize: '0.63rem', color: isSel ? 'rgba(255,255,255,0.8)' : '#94a3b8' }}>
                          [{op.shortcut}]
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Slider Parameter */}
              <div style={{
                background: '#f1f5f9',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155' }}>
                  {activeOpData.paramName}:
                </span>
                <input
                  type="range"
                  min={activeOpData.paramMin}
                  max={activeOpData.paramMax}
                  value={opParam}
                  onChange={(e) => setOpParam(Number(e.target.value))}
                  style={{ width: '100px', cursor: 'pointer', accentColor: activeOpData.color }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: activeOpData.color, minWidth: '45px' }}>
                  {opParam} {activeOpData.paramUnit}
                </span>
              </div>

              {/* Kontrol Animasi Transformasi */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <button
                  onClick={handleTogglePlayPause}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isPlayingAnim ? '#ef4444' : '#16a34a',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {isPlayingAnim ? '⏸️ Jeda' : '▶️ Animasi'}
                </button>
                <button
                  onClick={handleReplayAnim}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                  title="Mulai Ulang Animasi Dari Sketsa 2D"
                >
                  🔄 Ulang
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={animProgress}
                  onChange={(e) => {
                    setIsPlayingAnim(false);
                    setAnimProgress(parseFloat(e.target.value));
                  }}
                  style={{ width: '80px', accentColor: activeOpData.color, cursor: 'pointer' }}
                  title="Geser progres transformasi 2D ke 3D"
                />
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: activeOpData.color }}>
                  {Math.round(animProgress * 100)}%
                </span>
              </div>
            </div>
          )}


          {/* TAB 3: MODIFY (FITUR BENGKEL) */}
          {ribbonTab === 'modify' && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
              {/* FILLET */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: hasFillet ? '#eff6ff' : '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: hasFillet ? '1.5px solid #0284c7' : '1px solid #e2e8f0' }}>
                <button
                  onClick={handleToggleFillet}
                  style={{
                    border: 'none',
                    background: hasFillet ? '#0284c7' : '#e2e8f0',
                    color: hasFillet ? '#fff' : '#475569',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {hasFillet ? '✅ FILLET R' : '🔘 FILLET'}
                </button>
                {hasFillet && (
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={filletRadius}
                    onChange={(e) => setFilletRadius(Number(e.target.value))}
                    style={{ width: '55px', accentColor: '#0284c7', cursor: 'pointer' }}
                  />
                )}
                {hasFillet && <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 800 }}>R={filletRadius}</span>}
              </div>

              {/* CHAMFER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: hasChamfer ? '#fff7ed' : '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: hasChamfer ? '1.5px solid #ea580c' : '1px solid #e2e8f0' }}>
                <button
                  onClick={handleToggleChamfer}
                  style={{
                    border: 'none',
                    background: hasChamfer ? '#ea580c' : '#e2e8f0',
                    color: hasChamfer ? '#fff' : '#475569',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {hasChamfer ? '✅ CHAMFER C' : '🔘 CHAMFER'}
                </button>
                {hasChamfer && (
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={chamferSize}
                    onChange={(e) => setChamferSize(Number(e.target.value))}
                    style={{ width: '55px', accentColor: '#ea580c', cursor: 'pointer' }}
                  />
                )}
                {hasChamfer && <span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 800 }}>C={chamferSize}</span>}
              </div>

              {/* HOLE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: hasHole ? '#fef2f2' : '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: hasHole ? '1.5px solid #ef4444' : '1px solid #e2e8f0' }}>
                <button
                  onClick={() => { sound.playClick(); setHasHole(!hasHole); }}
                  style={{
                    border: 'none',
                    background: hasHole ? '#ef4444' : '#e2e8f0',
                    color: hasHole ? '#fff' : '#475569',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {hasHole ? '✅ HOLE Ø' : '🔘 HOLE'}
                </button>
                {hasHole && (
                  <input
                    type="range"
                    min="4"
                    max="14"
                    value={holeRadius}
                    onChange={(e) => setHoleRadius(Number(e.target.value))}
                    style={{ width: '55px', accentColor: '#ef4444', cursor: 'pointer' }}
                  />
                )}
                {hasHole && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>Ø={holeRadius * 2}</span>}
              </div>

              {/* SHELL */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: hasShell ? '#faf5ff' : '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: hasShell ? '1.5px solid #a855f7' : '1px solid #e2e8f0' }}>
                <button
                  onClick={() => { sound.playClick(); setHasShell(!hasShell); }}
                  style={{
                    border: 'none',
                    background: hasShell ? '#a855f7' : '#e2e8f0',
                    color: hasShell ? '#fff' : '#475569',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {hasShell ? '✅ SHELL (RONGGA)' : '🔘 SHELL'}
                </button>
                {hasShell && (
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={shellThickness}
                    onChange={(e) => setShellThickness(Number(e.target.value))}
                    style={{ width: '50px', accentColor: '#a855f7', cursor: 'pointer' }}
                  />
                )}
                {hasShell && <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 800 }}>t={shellThickness}</span>}
              </div>

              {/* DRAFT */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: hasDraft ? '#f0fdf4' : '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: hasDraft ? '1.5px solid #10b981' : '1px solid #e2e8f0' }}>
                <button
                  onClick={() => { sound.playClick(); setHasDraft(!hasDraft); }}
                  style={{
                    border: 'none',
                    background: hasDraft ? '#10b981' : '#e2e8f0',
                    color: hasDraft ? '#fff' : '#475569',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {hasDraft ? '✅ DRAFT (TIRUS)' : '🔘 DRAFT'}
                </button>
                {hasDraft && (
                  <input
                    type="range"
                    min="2"
                    max="15"
                    value={draftAngle}
                    onChange={(e) => setDraftAngle(Number(e.target.value))}
                    style={{ width: '50px', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                )}
                {hasDraft && <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>{draftAngle}°</span>}
              </div>

              {/* X-Ray Section View */}
              <button
                onClick={() => setIsCrossSection(!isCrossSection)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: isCrossSection ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                  background: isCrossSection ? '#eff6ff' : '#f8fafc',
                  color: isCrossSection ? '#0284c7' : '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                title="Melihat rongga dalam dan lubang tembus"
              >
                {isCrossSection ? '🔍 X-Ray ON' : '👁️ X-Ray (Potongan)'}
              </button>
            </div>
          )}

          {/* TAB 4: TEMPLATE KOMPONEN MESIN (1-KLIK) */}
          {ribbonTab === 'templates' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', minWidth: '100px' }}>
                PILIH BENDA MESIN:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                {MACHINE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleLoadTemplate(tpl)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#ff6914'; e.currentTarget.style.background = '#fff7ed'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{tpl.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div>{tpl.shortName}</div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{tpl.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MATERIAL & METROLOGI */}
          {ribbonTab === 'materials' && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
              {/* Material Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>Bahan:</span>
                {Object.entries(MATERIALS_CONFIG).map(([key, mat]) => (
                  <button
                    key={key}
                    onClick={() => { sound.playClick(); setMaterialMode(key); }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: materialMode === key ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                      background: materialMode === key ? '#0284c7' : '#f8fafc',
                      color: materialMode === key ? '#ffffff' : '#334155',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {mat.name.split('(')[0]}
                  </button>
                ))}
              </div>

              {/* Physical Readout */}
              <div style={{ display: 'flex', gap: '12px', background: '#f1f5f9', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.72rem', color: '#334155' }}>
                <div>Vol: <strong style={{ color: '#0284c7' }}>{inspectionMetrics.volume} cm³</strong></div>
                <div>Luas: <strong style={{ color: '#334155' }}>{inspectionMetrics.area} cm²</strong></div>
                <div>Berat: <strong style={{ color: '#ea580c' }}>{inspectionMetrics.mass} gram</strong></div>
              </div>

              {/* Export STL Button */}
              <button
                onClick={handleExportSTL}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid #0284c7',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>📥</span> Export File STL (3D Print)
              </button>
            </div>
          )}

          {/* TAB 6: LAYOUT A4 (KERTAS GAMBAR) */}
          {ribbonTab === 'layout' && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Mode Gambar Kerja Kertas A4 Standar ISO 5456/128 lengkap dengan Garis Tepi &amp; Etiket Kepala Gambar SMK Negeri 2 Depok.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { sound.playClick(); setDisplayMode('layout'); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  📄 Tampilkan Kertas A4 Penuh
                </button>
                <button
                  onClick={() => { sound.playClick(); window.print(); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#334155',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  🖨️ Cetak / Unduh PDF
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* =====================================================================
          4. FUSION 360 VIEWPORT (MODEL SPACE / PAPER SPACE)
          ===================================================================== */}
      {displayMode === 'layout' ? (
        /* PAPER SPACE VIEW (A4 DRAWING SHEET) */
        <LayoutA4Paper
          sketchData={activeSketchData}
          opData={activeOpData}
          opParam={opParam}
          hasFillet={hasFillet}
          filletRadius={filletRadius}
          hasChamfer={hasChamfer}
          chamferSize={chamferSize}
          hasHole={hasHole}
          holeRadius={holeRadius}
          hasShell={hasShell}
          shellThickness={shellThickness}
          materialMode={materialMode}
          metrics={inspectionMetrics}
          onBackToModel={() => setDisplayMode('split')}
        />
      ) : (
        /* MODEL SPACE VIEW (SPLIT OR FULL VIEWPORT) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: displayMode === 'split' ? 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' : '1fr',
          gap: '1px',
          background: '#e2e8f0',
          minHeight: '420px'
        }}>
          
          {/* PANEL KIRI: JENDELA SKETSA 2D FUSION 360 */}
          {(displayMode === 'split' || displayMode === '2d_only') && (
            <div style={{
              background: '#ffffff',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Header Canvas 2D */}
              <div style={{
                padding: '8px 14px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.74rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#0284c7', fontWeight: 900 }}>[TOP] [2D SKETCH]</span>
                  <span style={{ color: '#475569' }}>• Bidang XY: {activeSketchData.name.split('(')[0]}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    onClick={() => setCadTheme(cadTheme === 'dark' ? 'light' : 'dark')}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    title="Ganti tema kanvas (Light Sheet / Dark Grid)"
                  >
                    {cadTheme === 'dark' ? '🌙 Dark Grid' : '☀️ Light Sheet'}
                  </button>
                  <span style={{ color: '#64748b', fontSize: '0.68rem' }}>ISO 128 / 129</span>
                </div>
              </div>

              {/* 2D Canvas Viewport */}
              <div style={{ flex: 1, minHeight: '360px', width: '100%', position: 'relative' }}>
                <Sketch2DViewer
                  sketchId={selectedSketch}
                  topSketchId={selectedTopSketch}
                  operation={selectedOperation}
                  animProgress={animProgress}
                  hasFillet={hasFillet}
                  filletRadius={filletRadius}
                  hasChamfer={hasChamfer}
                  chamferSize={chamferSize}
                  hasShell={hasShell}
                  shellThickness={shellThickness}
                  hasHole={hasHole}
                  holeRadius={holeRadius}
                  theme={cadTheme}
                />
              </div>
            </div>
          )}

          {/* PANEL KANAN: JENDELA 3D FUSION 360 WEBGL */}
          {(displayMode === 'split' || displayMode === '3d_only') && (
            <div style={{
              background: '#f8fafc',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Header Canvas 3D */}
              <div style={{
                padding: '8px 14px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.74rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#ff6914', fontWeight: 900 }}>[3D ORBIT VIEW]</span>
                  <span style={{ color: '#475569' }}>• {activeOpData.name.split('(')[0]}</span>
                  <span style={{ color: isCrossSection ? '#0284c7' : '#64748b', fontSize: '0.68rem' }}>
                    {isCrossSection ? '(Mode X-Ray Aktif)' : '(Shaded Edges)'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    style={{
                      background: autoRotate ? '#ff6914' : '#ffffff',
                      border: autoRotate ? '1px solid #ff6914' : '1px solid #cbd5e1',
                      color: autoRotate ? '#ffffff' : '#334155',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {autoRotate ? '⏸ Stop Rotasi' : '🔄 Putar 360°'}
                  </button>
                </div>
              </div>

              {/* Three.js Canvas Viewport */}
              <div style={{ flex: 1, minHeight: '360px', width: '100%', position: 'relative' }}>
                <Suspense fallback={
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#ff6914', fontWeight: 800 }}>
                    MEMUAT ENGINE 3D...
                  </div>
                }>
                  <Canvas
                    shadows
                    camera={{ position: [60, 50, 60], fov: 42 }}
                    gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
                    style={{ background: '#f8fafc' }}
                  >
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[60, 80, 50]} intensity={1.8} castShadow />
                    <directionalLight position={[-60, 40, -50]} intensity={0.9} />

                    <CameraRig targetCamPos={targetCamPos} controlsRef={controlsRef} />

                    <Center>
                      <CADSolidMesh
                        geometry={cadGeometry}
                        materialMode={materialMode}
                        isCrossSection={isCrossSection}
                      />
                      <CADVisualHelpers
                        operation={selectedOperation}
                        animProgress={animProgress}
                      />
                    </Center>

                    <Grid
                      position={[0, -26, 0]}
                      args={[140, 140]}
                      cellSize={10}
                      cellThickness={1}
                      cellColor="#e2e8f0"
                      sectionSize={30}
                      sectionThickness={1.5}
                      sectionColor="#cbd5e1"
                      fadeDistance={120}
                    />

                    <OrbitControls
                      ref={controlsRef}
                      enablePan={true}
                      enableZoom={true}
                      enableRotate={true}
                      autoRotate={autoRotate}
                      autoRotateSpeed={1.5}
                    />
                  </Canvas>
                </Suspense>

                {/* Fusion 360 ViewCube Floating Presets */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  display: 'flex',
                  gap: '4px',
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  zIndex: 10
                }}>
                  {[
                    { id: 'depan', label: 'Depan' },
                    { id: 'atas', label: 'Atas' },
                    { id: 'kanan', label: 'Kanan' },
                    { id: 'iso', label: 'Isometri' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { sound.playClick(); setActiveViewAngle(v.id); }}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: activeViewAngle === v.id ? '#ff6914' : 'transparent',
                        color: activeViewAngle === v.id ? '#ffffff' : '#64748b',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                {/* Tips Navigasi */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '12px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #e2e8f0',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  color: '#64748b',
                  pointerEvents: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}>
                  💡 Klik &amp; geser mouse untuk memutar orbit 3D • Scroll untuk zoom
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =====================================================================
          5. FUSION 360 PROMPT & QUICK ACTION BAR
          ===================================================================== */}
      <div style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {/* Command Line Prompt */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          flex: 1,
          minWidth: '280px'
        }}>
          <span style={{ color: '#ff6914', fontWeight: 900 }}>Fusion 360 &gt;</span>
          <span style={{ color: '#0284c7', fontWeight: 700 }}>{commandLine}</span>
        </div>

        {/* Quick Shortcut Command Chips */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { label: 'REC', action: () => handleSelectSketch('rect') },
            { label: 'CIRC', action: () => handleSelectSketch('circle') },
            { label: 'HEX', action: () => handleSelectSketch('hexagon') },
            { label: 'EXT', action: () => handleSelectOperation('extrude') },
            { label: 'REV', action: () => handleSelectOperation('revolve') },
            { label: 'SWEEP', action: () => handleSelectOperation('sweep') },
            { label: 'FILLET', action: handleToggleFillet },
            { label: 'CHAMFER', action: handleToggleChamfer },
            { label: 'HOLE', action: () => { sound.playClick(); setHasHole(!hasHole); } },
            { label: 'XRAY', action: () => setIsCrossSection(!isCrossSection) },
            { label: 'LAYOUT', action: () => setDisplayMode('layout') }
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={chip.action}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '2px 7px',
                borderRadius: '4px',
                fontSize: '0.64rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#ff6914'; e.currentTarget.style.borderColor = '#ff6914'; e.currentTarget.style.background = '#fff7ed'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
            >
              [{chip.label}]
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          6. FUSION 360 STATUS BAR AT THE BOTTOM (COORDINATES & DRAFTING)
          ===================================================================== */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '6px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.7rem',
        color: '#64748b'
      }}>
        {/* Live Coordinate readout */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>X: <strong style={{ color: '#ef4444' }}>40.00 mm</strong></span>
          <span>Y: <strong style={{ color: '#16a34a' }}>40.00 mm</strong></span>
          <span>Z: <strong style={{ color: '#0284c7' }}>{opParam}.00 mm</strong></span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span>SKALA: <strong style={{ color: '#0f172a' }}>1 : 1 (ISO 5455)</strong></span>
        </div>

        {/* Drafting Status Toggles */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: '#ff6914', fontWeight: 800 }}>MODEL</span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>GRID: ON</span>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>ORTHO: ON</span>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>SNAP: ON</span>
        </div>
      </div>

    </div>
  );
};

export default CADStudioSimulator;

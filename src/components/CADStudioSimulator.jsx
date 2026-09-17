import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Center } from '@react-three/drei';
import * as THREE from 'three';
import { sound } from '../utils/audio';
import { useAccessibility } from '../context/AccessibilityContext';

// =============================================================================
// 1. DATA KATALOG SKETSA 2D (2D SKETCH PROFILES)
// =============================================================================
export const SKETCH_PROFILES = [
  {
    id: 'rect',
    name: 'Persegi Balok (Rectangle)',
    desc: 'Profil 2D empat persegi berukuran 40 x 40 mm. Dasar balok kotak, pelat baja, dan komponen prismatik mesin.',
    icon: '🟦',
    dimensions: '40 x 40 mm'
  },
  {
    id: 'l_shape',
    name: 'Profil Bertingkat L (L-Profile)',
    desc: 'Profil penampang berundak/bertingkat dua level (40 x 40 mm dengan takik 20 mm). Dasar braket siku dan puli flensa.',
    icon: '🪜',
    dimensions: '40 x 40 mm (Undak 20)'
  },
  {
    id: 'circle',
    name: 'Lingkaran (Circle / Disc)',
    desc: 'Profil bundar berdiameter 40 mm. Dasar komponen silindris poros transmisi, pipa, puli, dan roda gigi.',
    icon: '⭕',
    dimensions: 'Diameter 40 mm'
  },
  {
    id: 'hexagon',
    name: 'Heksagon / Segi Enam (Hexagon)',
    desc: 'Profil 6 sisi beraturan beradius 22 mm. Standar ISO kepala baut (hex bolt), mur penahan, dan batang heksagonal.',
    icon: '⬡',
    dimensions: 'Radius 22 mm (6 Sisi)'
  },
  {
    id: 'trapezoid',
    name: 'Trapesium / Baji (Trapezoid)',
    desc: 'Profil trapesium dengan lebar dasar 44 mm dan puncak 24 mm. Dasar baji peluncur, rel ekor burung, dan alur V-belt.',
    icon: '📐',
    dimensions: 'Alas 44, Puncak 24 mm'
  },
  {
    id: 'star',
    name: 'Bintang / Roda Beralur (Star / Spline)',
    desc: 'Profil beralur bintang 5 lekukan beradius luar 24 mm dan dalam 14 mm. Dasar poros spline dan roda sirip pendingin.',
    icon: '⭐',
    dimensions: 'R_luar 24, R_dalam 14 mm'
  }
];

// =============================================================================
// 2. DATA FITUR PEMODELAN UTAMA (CREATE FEATURES)
// =============================================================================
export const CREATE_OPERATIONS = {
  extrude: {
    id: 'extrude',
    name: 'EXTRUDE (Ekstrusi Linier)',
    icon: '⬆️',
    color: '#2563eb',
    bgActive: '#eff6ff',
    borderActive: '#2563eb',
    summary: 'Menarik profil sketsa 2D secara linier tegak lurus membentuk benda padat berketebalan seragam.',
    definition: 'Operasi dasar CAD paling vital. Profil 2D ditarik tegak lurus bidang sketsa sepanjang vektor sumbu Z (+).',
    useCase: 'Membuat balok mesin, pelat baja berlubang, braket siku, poros heksagonal, dan komponen prismatik.',
    paramName: 'Kedalaman / Tinggi Ekstrusi',
    paramUnit: 'mm',
    paramMin: 15,
    paramMax: 80,
    defaultParam: 45,
    animationHelp: 'Animasi menunjukkan sketsa 2D di dasar ditarik perlahan ke atas seiring bertambahnya ketinggian Z.'
  },
  revolve: {
    id: 'revolve',
    name: 'REVOLVE (Putar / Revolusi Sumbu)',
    icon: '🔄',
    color: '#ea580c',
    bgActive: '#fff7ed',
    borderActive: '#ea580c',
    summary: 'Memutar penampang sketsa 2D mengelilingi sumbu poros pusat untuk menghasilkan benda silindris/aksisimetris.',
    definition: 'Memutar penampang 2D mengitari garis sumbu (Centerline Axis) sebesar sudut putar (0° hingga 360°).',
    useCase: 'Membuat poros transmisi bertingkat, puli V-belt, flensa pipa, cincin O-ring, roda gila (flywheel), dan bodi tabung.',
    paramName: 'Sudut Putaran (Revolve Angle)',
    paramUnit: '°',
    paramMin: 60,
    paramMax: 360,
    defaultParam: 360,
    animationHelp: 'Animasi menunjukkan penampang 2D berputar menyapu ruang 360° mengelilingi garis sumbu putar merah.'
  },
  sweep: {
    id: 'sweep',
    name: 'SWEEP (Sapuan Sepanjang Lintasan)',
    icon: '〰️',
    color: '#9333ea',
    bgActive: '#faf5ff',
    borderActive: '#9333ea',
    summary: 'Menggerakkan profil penampang 2D meluncur menyusuri kurva lintasan 3D (Guide Path) berbelok/berliku.',
    definition: 'Penampang profil 2D digerakkan menyapu sepanjang jalur kurva pemandu tanpa memutar orientasinya.',
    useCase: 'Membuat pipa leher angsa, saluran knalpot, pegas spiral (spring), pegangan pintu, dan jalur kabel hidrolik.',
    paramName: 'Panjang Sapuan Lintasan',
    paramUnit: '%',
    paramMin: 20,
    paramMax: 100,
    defaultParam: 100,
    animationHelp: 'Animasi menunjukkan profil 2D meluncur menyusuri kurva lintasan 3D, meninggalkan padatan pipa di sepanjang jalurnya.'
  },
  loft: {
    id: 'loft',
    name: 'LOFT (Transisi Dua Penampang Berbeda)',
    icon: '🌪️',
    color: '#0891b2',
    bgActive: '#ecfeff',
    borderActive: '#0891b2',
    summary: 'Menghubungkan dua atau lebih penampang berbeda bentuk/ukuran secara bertahap dengan kurva peralihan mulus.',
    definition: 'Menciptakan bentuk transisi organik antara profil bawah dan profil atas yang terletak pada bidang kerja terpisah.',
    useCase: 'Membuat nosel turbin roket, corong transisi pipa bulat ke kotak, ducting pendingin AC, dan bodi aerodinamis.',
    paramName: 'Tinggi Jarak Transisi',
    paramUnit: 'mm',
    paramMin: 25,
    paramMax: 70,
    defaultParam: 46,
    animationHelp: 'Animasi menunjukkan kulit transisi yang menghubungkan profil bawah dan profil atas tumbuh dari bawah ke atas.'
  }
};

// =============================================================================
// 3. JENDELA VISUALISASI SKETSA 2D (AUTOCAD DRAFTING CANVAS)
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
  holeRadius
}) => {
  const cx = 140;
  const cy = 130;

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
              <polygon points={points} fill="rgba(37, 99, 235, 0.12)" stroke="#2563eb" strokeWidth="2.8" />
              <text x={left + w - c} y={top - 6} fontSize="10" fontWeight="800" fill="#b45309">Chamfer C{chamferSize} x 45°</text>
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
              fill="rgba(37, 99, 235, 0.12)"
              stroke="#2563eb"
              strokeWidth="2.8"
            />
            {hasFillet && (
              <text x={left + w + 4} y={top + 10} fontSize="10" fontWeight="800" fill="#1d4ed8">Fillet R{filletRadius}</text>
            )}
            {/* Dimensi Lebar & Tinggi */}
            <line x1={left} y1={top + h + 18} x2={left + w} y2={top + h + 18} stroke="#0f172a" strokeWidth="1.2" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
            <text x={cx} y={top + h + 32} fontSize="11" fontWeight="800" textAnchor="middle" fill="#0f172a">40 mm</text>
            <line x1={left + w + 18} y1={top} x2={left + w + 18} y2={top + h} stroke="#0f172a" strokeWidth="1.2" />
            <text x={left + w + 32} y={cy + 4} fontSize="11" fontWeight="800" textAnchor="middle" fill="#0f172a">40</text>
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
            <polygon points={points} fill="rgba(37, 99, 235, 0.12)" stroke="#2563eb" strokeWidth="2.8" />
            <text x={cx - 15} y={cy - 12} fontSize="10" fontWeight="800" fill="#2563eb">Undak 20</text>
            <line x1={cx - 40} y1={cy + 55} x2={cx + 40} y2={cy + 55} stroke="#0f172a" strokeWidth="1.2" />
            <text x={cx} y={cy + 68} fontSize="11" fontWeight="800" textAnchor="middle" fill="#0f172a">40 mm</text>
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
            <polygon points={pts.join(' ')} fill="rgba(37, 99, 235, 0.12)" stroke="#2563eb" strokeWidth="2.8" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
            <text x={cx} y={cy + r + 18} fontSize="11" fontWeight="800" textAnchor="middle" fill="#0f172a">Radius R 22 mm (6 Sisi)</text>
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
            <polygon points={pts} fill="rgba(37, 99, 235, 0.12)" stroke="#2563eb" strokeWidth="2.8" />
            <text x={cx} y={cy - h - 8} fontSize="11" fontWeight="800" textAnchor="middle" fill="#0f172a">Puncak: 24 mm</text>
            <text x={cx} y={cy + h + 18} fontSize="11" fontWeight="800" textAnchor="middle" fill="#0f172a">Alas: 44 mm</text>
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
            <polygon points={pts.join(' ')} fill="rgba(37, 99, 235, 0.12)" stroke="#2563eb" strokeWidth="2.8" />
            <text x={cx} y={cy + rOut + 18} fontSize="11" fontWeight="800" textAnchor="middle" fill="#0f172a">Spline / Bintang 5 Lekukan</text>
          </g>
        );
      }

      case 'circle':
      default: {
        const r = 40;
        return (
          <g>
            <circle cx={cx} cy={cy} r={r} fill="rgba(37, 99, 235, 0.12)" stroke="#2563eb" strokeWidth="2.8" />
            <line x1={cx - r - 15} y1={cy} x2={cx + r + 15} y2={cy} stroke="#dc2626" strokeWidth="1.2" strokeDasharray="10 3 2 3" />
            <line x1={cx} y1={cy - r - 15} x2={cx} y2={cy + r + 15} stroke="#dc2626" strokeWidth="1.2" strokeDasharray="10 3 2 3" />
            <line x1={cx - r * 0.7} y1={cy - r * 0.7} x2={cx + r * 0.7} y2={cy + r * 0.7} stroke="#0f172a" strokeWidth="1.5" />
            <text x={cx + 15} y={cy - 12} fontSize="11" fontWeight="800" fill="#0f172a">Ø 40 mm</text>
          </g>
        );
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      
      {/* SVG Canvas Sheet with Millimeter Grid */}
      <div style={{ flex: 1, width: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 280 260" width="100%" height="100%" style={{ maxHeight: '360px' }}>
          <defs>
            <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f1f5f9" strokeWidth="0.8" />
            </pattern>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="url(#smallGrid)" />
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="1.2" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0f172a" />
            </marker>
          </defs>

          {/* Background Grid */}
          <rect width="280" height="260" fill="url(#grid)" />

          {/* Sumbu Koordinat Bidang Sketsa (Sketch Plane XY) */}
          <line x1="20" y1={cy} x2="260" y2={cy} stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1={cx} y1="15" x2={cx} y2="245" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Sumbu X Merah */}
          <line x1={cx} y1={cy} x2="265" y2={cy} stroke="#ef4444" strokeWidth="2" />
          <polygon points="265,130 257,126 257,134" fill="#ef4444" />
          <text x="268" y="134" fontSize="10" fontWeight="900" fill="#ef4444">+X</text>

          {/* Sumbu Y Hijau */}
          <line x1={cx} y1={cy} x2={cx} y2="15" stroke="#10b981" strokeWidth="2" />
          <polygon points="140,15 136,23 144,23" fill="#10b981" />
          <text x="146" y="20" fontSize="10" fontWeight="900" fill="#10b981">+Y</text>

          {/* Titik Pusat Origin (0,0) */}
          <circle cx={cx} cy={cy} r="4" fill="#2563eb" />
          <text x={cx + 6} y={cy + 14} fontSize="9" fontWeight="800" fill="#64748b">(0,0)</text>

          {/* KONTUR PROFIL 2D UTAMA */}
          {renderProfileSVG()}

          {/* OVERLAY HOLE PADA SKETSA 2D */}
          {hasHole && (
            <g>
              <circle cx={cx} cy={cy} r={holeRadius * 1.8} fill="#ffffff" stroke="#dc2626" strokeWidth="2" />
              <line x1={cx - holeRadius * 2.2} y1={cy} x2={cx + holeRadius * 2.2} y2={cy} stroke="#dc2626" strokeWidth="1" strokeDasharray="4 2" />
              <line x1={cx} y1={cy - holeRadius * 2.2} x2={cx} y2={cy + holeRadius * 2.2} stroke="#dc2626" strokeWidth="1" strokeDasharray="4 2" />
              <text x={cx} y={cy + 4} fontSize="9" fontWeight="900" textAnchor="middle" fill="#dc2626">Ø{holeRadius * 2}</text>
            </g>
          )}

          {/* OVERLAY SHELL PADA SKETSA 2D */}
          {hasShell && (
            <g>
              <rect x={cx - 28} y={cy - 28} width="56" height="56" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeDasharray="5 3" />
              <text x={cx} y={cy - 34} fontSize="9" fontWeight="800" textAnchor="middle" fill="#7c3aed">Rongga Shell (t={shellThickness} mm)</text>
            </g>
          )}

          {/* INDIKATOR OPERASI 3D PADA SKETSA */}
          {operation === 'revolve' && (
            <g>
              {/* Sumbu Putar Y */}
              <line x1={cx - 48} y1="20" x2={cx - 48} y2="240" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="12 3 3 3" />
              <text x={cx - 48} y="15" fontSize="9" fontWeight="900" textAnchor="middle" fill="#dc2626">SUMBU PUTAR (AXIS)</text>
              <path d="M 115 65 A 25 25 0 0 1 165 65" fill="none" stroke="#ea580c" strokeWidth="2.5" />
              <polygon points="165,65 159,59 159,69" fill="#ea580c" />
              <text x="140" y="55" fontSize="10" fontWeight="900" textAnchor="middle" fill="#ea580c">⟳ Putar 360°</text>
            </g>
          )}

          {operation === 'extrude' && (
            <g>
              <circle cx="230" cy="45" r="14" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" />
              <circle cx="230" cy="45" r="4" fill="#2563eb" />
              <text x="230" y="72" fontSize="9" fontWeight="800" textAnchor="middle" fill="#1e40af">Tarik Sumbu +Z</text>
            </g>
          )}

          {operation === 'sweep' && (
            <g>
              <path d="M 90 140 Q 140 60 200 100 T 250 190" fill="none" stroke="#9333ea" strokeWidth="2.5" strokeDasharray="6 4" />
              <text x="180" y="75" fontSize="10" fontWeight="900" fill="#9333ea">Lintasan Path 〰️</text>
            </g>
          )}

          {operation === 'loft' && (
            <g>
              <rect x={cx - 24} y="25" width="48" height="30" fill="none" stroke="#0891b2" strokeWidth="1.8" strokeDasharray="4 2" />
              <text x={cx} y="44" fontSize="9" fontWeight="900" textAnchor="middle" fill="#0891b2">Profil Atas ({topSketchId || 'rect'})</text>
              <text x={cx} y="225" fontSize="9" fontWeight="900" textAnchor="middle" fill="#2563eb">Profil Bawah ({sketchId})</text>
              <line x1={cx - 24} y1="55" x2={cx - 40} y2="90" stroke="#0891b2" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1={cx + 24} y1="55" x2={cx + 40} y2="90" stroke="#0891b2" strokeWidth="1.2" strokeDasharray="3 3" />
            </g>
          )}
        </svg>
      </div>

      {/* Footer Info Sketsa 2D */}
      <div style={{
        padding: '10px 14px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.74rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontWeight: 800, color: '#0f172a' }}>Status Sketsa:</span>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>Closed Loop (Siap 3D)</span>
        </div>
        <span style={{ color: '#64748b' }}>
          Transformasi: <strong>{Math.round(animProgress * 100)}%</strong>
        </span>
      </div>

    </div>
  );
};

// =============================================================================
// 4. GENERATOR GEOMETRI TIGA DIMENSI PARAMETRIK & ANIMATIF
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
        const points = 5;
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? rOut : rIn;
          const a = (i * Math.PI) / points;
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
    return shape;
  };

  // ---------------------------------------------------------------------------
  // 1. EXTRUDE (Tumbuh linier ke atas sesuai animProgress)
  // ---------------------------------------------------------------------------
  if (operation === 'extrude') {
    const maxDepth = opParam || 45;
    const depth = Math.max(1.0, maxDepth * Math.max(0.01, animProgress));
    const shape = get2DShape(1);

    if (hasHole && !hasShell) {
      const hole = new THREE.Path();
      hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }

    if (hasShell) {
      const innerScale = Math.max(0.2, 1 - (shellThickness * 2) / 40);
      const innerHole = get2DShape(innerScale);
      shape.holes.push(innerHole);
    }

    let bevelEnabled = false;
    let bevelSize = 0;
    let bevelThickness = 0;
    let bevelSegments = 1;

    if (animProgress > 0.5) {
      if (hasFillet) {
        bevelEnabled = true;
        bevelSize = Math.min(depth * 0.25, filletRadius);
        bevelThickness = Math.min(depth * 0.25, filletRadius);
        bevelSegments = 6;
      } else if (hasChamfer) {
        bevelEnabled = true;
        bevelSize = Math.min(depth * 0.25, chamferSize);
        bevelThickness = Math.min(depth * 0.25, chamferSize);
        bevelSegments = 1;
      }
    }

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled,
      bevelSize,
      bevelThickness,
      bevelSegments,
      steps: 1
    });
    geom.center();

    if (hasDraft) {
      const pos = geom.attributes.position;
      const taperFactor = Math.tan((draftAngle * Math.PI) / 180) * (depth / 35);
      for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        const factor = 1 - ((z + depth / 2) / depth) * taperFactor * 0.45;
        pos.setX(i, pos.getX(i) * factor);
        pos.setY(i, pos.getY(i) * factor);
      }
      pos.needsUpdate = true;
      geom.computeVertexNormals();
    }

    return geom;
  }

  // ---------------------------------------------------------------------------
  // 2. REVOLVE (Memutar mengelilingi sumbu Z sesuai animProgress)
  // ---------------------------------------------------------------------------
  if (operation === 'revolve') {
    const maxAngle = opParam || 360;
    const angleDeg = Math.max(8, maxAngle * Math.max(0.02, animProgress));
    const phiLength = (angleDeg / 360) * Math.PI * 2;
    const points = [];
    const h = 34;

    switch (sketchId) {
      case 'l_shape': {
        const rIn = hasHole ? Math.max(4, holeRadius) : 8;
        const rFlange = 28;
        const rStep = 18;
        const yBot = -h / 2;
        const yMid = -2;
        const yTop = h / 2;
        points.push(new THREE.Vector2(rIn, yBot));
        points.push(new THREE.Vector2(rFlange, yBot));
        points.push(new THREE.Vector2(rFlange, yMid));
        points.push(new THREE.Vector2(rStep, yMid));
        points.push(new THREE.Vector2(rStep, yTop));
        points.push(new THREE.Vector2(rIn, yTop));
        points.push(new THREE.Vector2(rIn, yBot));
        break;
      }
      case 'circle': {
        const rCenter = 20;
        const rCircle = hasShell ? 8 : (hasHole ? 9 : 10);
        const numPts = 24;
        for (let i = 0; i <= numPts; i++) {
          const a = (i / numPts) * Math.PI * 2;
          points.push(new THREE.Vector2(rCenter + rCircle * Math.cos(a), rCircle * Math.sin(a)));
        }
        break;
      }
      case 'trapezoid': {
        const rIn = hasHole ? Math.max(4, holeRadius) : 8;
        points.push(new THREE.Vector2(rIn, -h / 2));
        points.push(new THREE.Vector2(26, -h / 2));
        points.push(new THREE.Vector2(16, h / 2));
        points.push(new THREE.Vector2(rIn, h / 2));
        points.push(new THREE.Vector2(rIn, -h / 2));
        break;
      }
      case 'hexagon': {
        const rIn = hasHole ? Math.max(4, holeRadius) : 8;
        points.push(new THREE.Vector2(rIn, -h / 2));
        points.push(new THREE.Vector2(24, -h / 2));
        points.push(new THREE.Vector2(28, -h / 4));
        points.push(new THREE.Vector2(28, h / 4));
        points.push(new THREE.Vector2(24, h / 2));
        points.push(new THREE.Vector2(rIn, h / 2));
        points.push(new THREE.Vector2(rIn, -h / 2));
        break;
      }
      case 'star': {
        const rIn = hasHole ? Math.max(4, holeRadius) : 8;
        points.push(new THREE.Vector2(rIn, -h / 2));
        points.push(new THREE.Vector2(28, -h / 2));
        points.push(new THREE.Vector2(22, -h / 4));
        points.push(new THREE.Vector2(28, 0));
        points.push(new THREE.Vector2(22, h / 4));
        points.push(new THREE.Vector2(28, h / 2));
        points.push(new THREE.Vector2(rIn, h / 2));
        points.push(new THREE.Vector2(rIn, -h / 2));
        break;
      }
      case 'rect':
      default: {
        const rIn = hasHole ? Math.max(4, holeRadius) : (hasShell ? 18 : 8);
        const rOut = 26;
        points.push(new THREE.Vector2(rIn, -h / 2));
        points.push(new THREE.Vector2(rOut, -h / 2));
        points.push(new THREE.Vector2(rOut, h / 2));
        points.push(new THREE.Vector2(rIn, h / 2));
        points.push(new THREE.Vector2(rIn, -h / 2));
        break;
      }
    }

    const segments = Math.max(12, Math.floor((angleDeg / 360) * 48));
    const geom = new THREE.LatheGeometry(points, segments, 0, phiLength);
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }

  // ---------------------------------------------------------------------------
  // 3. SWEEP (Tumbuh menyusuri kurva lintasan 3D sesuai animProgress)
  // ---------------------------------------------------------------------------
  if (operation === 'sweep') {
    const fullCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-28, -16, 0),
      new THREE.Vector3(-14, -8, 12),
      new THREE.Vector3(0, 10, 16),
      new THREE.Vector3(16, 20, 8),
      new THREE.Vector3(28, 22, -6)
    ]);

    const totalSteps = 48;
    const currentSteps = Math.max(3, Math.floor(totalSteps * Math.max(0.04, animProgress)));
    const subPoints = [];
    for (let i = 0; i <= currentSteps; i++) {
      const u = i / totalSteps;
      subPoints.push(fullCurve.getPoint(u));
    }
    const subCurve = new THREE.CatmullRomCurve3(subPoints);

    let radius = 10;
    if (sketchId === 'rect') radius = 11;
    else if (sketchId === 'l_shape') radius = 12;
    else if (sketchId === 'star') radius = 13;

    const radialSegments = sketchId === 'rect' ? 4 : (sketchId === 'hexagon' ? 6 : 24);

    const geom = new THREE.TubeGeometry(subCurve, currentSteps, radius, radialSegments, false);
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }

  // ---------------------------------------------------------------------------
  // 4. LOFT (Transisi organik antara Profil Bawah dan Profil Atas)
  // ---------------------------------------------------------------------------
  if (operation === 'loft') {
    const H = opParam || 46;
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
// 5. KOMPONEN MESH 3D & X-RAY SECTION
// =============================================================================
const CADSolidMesh = ({ geometry, materialMode, isCrossSection }) => {
  const edgesGeom = useMemo(() => {
    if (!geometry) return null;
    return new THREE.EdgesGeometry(geometry, 20);
  }, [geometry]);

  const matProps = useMemo(() => {
    switch (materialMode) {
      case 'brass':
        return { color: '#f59e0b', metalness: 0.8, roughness: 0.25 };
      case 'aluminium':
        return { color: '#cbd5e1', metalness: 0.5, roughness: 0.3 };
      case 'blueprint':
        return { color: '#2563eb', metalness: 0.1, roughness: 0.7 };
      case 'steel':
      default:
        return { color: '#94a3b8', metalness: 0.7, roughness: 0.25 };
    }
  }, [materialMode]);

  if (!geometry) return null;

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          {...matProps}
          side={THREE.DoubleSide}
          transparent={isCrossSection}
          opacity={isCrossSection ? 0.78 : 1.0}
          wireframe={false}
        />
      </mesh>
      {edgesGeom && (
        <lineSegments geometry={edgesGeom}>
          <lineBasicMaterial color={isCrossSection ? '#0284c7' : '#0f172a'} linewidth={2.5} />
        </lineSegments>
      )}
    </group>
  );
};

// =============================================================================
// 6. 3D VISUAL HELPER OVERLAYS (Sumbu, Vektor Tarik, Lintasan Curve)
// =============================================================================
const CADVisualHelpers = ({ operation, animProgress }) => {
  if (operation === 'revolve') {
    // Sumbu Putar Merah Tegak
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
    // Vektor panah arah ekstrusi Z
    return (
      <group position={[0, 24 * animProgress, 0]}>
        <mesh position={[0, 6, 0]}>
          <coneGeometry args={[2.5, 6, 16]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 8, 12]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
      </group>
    );
  }

  return null;
};

// =============================================================================
// 7. ANIMATOR KAMERA ORBIT
// =============================================================================
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
// 8. KOMPONEN UTAMA CAD STUDIO SIMULATOR
// =============================================================================
const CADStudioSimulator = () => {
  // Langkah 1: Sketsa 2D Awal
  const [selectedSketch, setSelectedSketch] = useState('rect');
  const [selectedTopSketch, setSelectedTopSketch] = useState('circle'); // Khusus Loft

  // Langkah 2: Operasi 3D
  const [selectedOperation, setSelectedOperation] = useState('extrude');
  const [opParam, setOpParam] = useState(45);

  // Animasi Transformasi 3D (0.0 to 1.0)
  const [animProgress, setAnimProgress] = useState(1.0);
  const [isPlayingAnim, setIsPlayingAnim] = useState(false);
  const [isAutoLoop, setIsAutoLoop] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1.0);

  // Langkah 3: Modifiers (Fillet, Chamfer, Shell, Draft, Hole)
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

  // Layout View Mode
  const [displayMode, setDisplayMode] = useState('split');

  // Camera & Visual
  const [materialMode, setMaterialMode] = useState('steel');
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeViewAngle, setActiveViewAngle] = useState('iso');

  const controlsRef = useRef(null);

  // ---------------------------------------------------------------------------
  // ANIMATION LOOP ENGINE (Smooth 60 FPS RequestAnimationFrame)
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

  // Handler Ganti Operasi (Langsung memicu animasi transformasi)
  const handleSelectOperation = (opId) => {
    sound.playClick();
    setSelectedOperation(opId);
    setOpParam(CREATE_OPERATIONS[opId].defaultParam);
    // Reset dan mulai animasi otomatis dari 0% ke 100%
    setAnimProgress(0.0);
    setIsPlayingAnim(true);
  };

  const handleReplayAnim = () => {
    sound.playClick();
    setAnimProgress(0.0);
    setIsPlayingAnim(true);
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
  };

  const handleToggleChamfer = () => {
    sound.playClick();
    const nextVal = !hasChamfer;
    setHasChamfer(nextVal);
    if (nextVal) setHasFillet(false);
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
      const filletDesc = hasFillet ? 'Fitur Fillet lengkung aktif dengan radius 4 milimeter.' : hasChamfer ? 'Fitur Chamfer sudut miring aktif 3 milimeter.' : 'Tanpa fillet maupun chamfer.';
      const holeDesc = hasHole ? 'Fitur lubang silindris Hole aktif menembus sumbu pusat benda.' : '';
      const shellDesc = hasShell ? 'Fitur rongga dinding tipis Shell aktif dengan ketebalan 3 milimeter.' : '';
      const text = `Anda sedang berada di CAD Feature Lab. Pada Langkah 1, sketsa 2D mula-mula yang dipilih adalah ${activeSketchData.name}. Pada Langkah 2, operasi pembentukan yang aktif adalah ${activeOpData.name}. ${activeOpData.definition} ${activeOpData.animationHelp} Pada Langkah 3, fitur modifikasi: ${filletDesc} ${holeDesc} ${shellDesc} Anda dapat memutar animasi transformasi dan memutar benda 3D secara bebas.`;
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

  const targetCamPos = useMemo(() => {
    const dist = 85;
    switch (activeViewAngle) {
      case 'depan':
        return new THREE.Vector3(0, 0, dist);
      case 'kanan':
        return new THREE.Vector3(dist, 0, 0);
      case 'atas':
        return new THREE.Vector3(0, dist, 0);
      case 'iso':
      default:
        return new THREE.Vector3(60, 50, 60);
    }
  }, [activeViewAngle]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', fontFamily: 'inherit', background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
      
      {/* =====================================================================
          HEADER SECTION & CONTROLS
          ===================================================================== */}
      <div style={{
        background: '#ffffff',
        padding: '18px 22px',
        borderRadius: '16px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2.2rem' }}>🛠️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              CAD Feature Lab: Visualisasi Sketsa 2D ➡️ Transformasi Benda 3D
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Pelajari mekanisme pembentukan <strong>Extrude, Revolve, Sweep, Loft</strong> serta modifikasi <strong>Fillet, Chamfer, Shell, Draft, Hole</strong> disertai animasi proses 3D real-time.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Tombol Audio Narator CAD Studio */}
          <button
            onClick={handleToggleCADAudio}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: isSpeakingCAD ? '1.5px solid #2563eb' : '1.5px solid #bfdbfe',
              background: isSpeakingCAD ? '#2563eb' : '#eff6ff',
              color: isSpeakingCAD ? '#ffffff' : '#1d4ed8',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isSpeakingCAD ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
            title="Dengarkan penjelasan suara materi dan fitur CAD ini (Inklusi)"
          >
            <span style={{ fontSize: '0.95rem' }}>{isSpeakingCAD ? '⏹️' : '🔊'}</span>
            <span>{isSpeakingCAD ? 'Hentikan Audio' : 'Dengarkan Penjelasan CAD'}</span>
          </button>

          {/* Display Mode Switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => { sound.playClick(); setDisplayMode('split'); }}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: displayMode === 'split' ? '#2563eb' : 'transparent',
                color: displayMode === 'split' ? '#fff' : '#334155',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🖥️</span> Berdampingan (2D & 3D)
            </button>
            <button
              onClick={() => { sound.playClick(); setDisplayMode('2d_only'); }}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: displayMode === '2d_only' ? '#2563eb' : 'transparent',
                color: displayMode === '2d_only' ? '#fff' : '#334155',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              📐 Sketsa 2D Saja
            </button>
            <button
              onClick={() => { sound.playClick(); setDisplayMode('3d_only'); }}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: displayMode === '3d_only' ? '#2563eb' : 'transparent',
                color: displayMode === '3d_only' ? '#fff' : '#334155',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              🧊 Benda 3D Saja
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          LANGKAH 1: PILIHAN SKETSA 2D AWAL
          ===================================================================== */}
      <div style={{
        background: '#ffffff',
        padding: '16px 20px',
        borderRadius: '14px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#2563eb', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
            Langkah 1: Tentukan Sketsa 2D Awal (2D Closed Profile):
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>
            {activeSketchData.desc}
          </span>
        </div>

        {/* 6 Pilihan Profil 2D */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '10px' }}>
          {SKETCH_PROFILES.map((sk) => {
            const isSelected = selectedSketch === sk.id;
            return (
              <button
                key={sk.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedSketch(sk.id);
                  // Memicu ulang animasi jika sedang melihat operasi
                  setAnimProgress(0.0);
                  setIsPlayingAnim(true);
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '2.5px solid #2563eb' : '1px solid #cbd5e1',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s',
                  boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>{sk.icon}</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {sk.name.split('(')[0]}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: isSelected ? '#3b82f6' : '#94a3b8' }}>
                    {sk.dimensions}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* JIKA OPERASI LOFT AKTIF: Tampilkan Pemilihan Profil Target (Atas) */}
        {selectedOperation === 'loft' && (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0891b2', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🌪️</span> Pilih Profil Target Atas untuk Operasi Loft:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SKETCH_PROFILES.map((sk) => {
                const isSelected = selectedTopSketch === sk.id;
                return (
                  <button
                    key={`top-${sk.id}`}
                    onClick={() => {
                      sound.playClick();
                      setSelectedTopSketch(sk.id);
                      setAnimProgress(0.0);
                      setIsPlayingAnim(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #0891b2' : '1px solid #cbd5e1',
                      background: isSelected ? '#ecfeff' : '#ffffff',
                      color: isSelected ? '#0e7490' : '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{sk.icon}</span>
                    <span>{sk.name.split('(')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          LANGKAH 2: PILIHAN OPERASI 3D (DENGAN ANIMASI TRANSFORMASI)
          ===================================================================== */}
      <div style={{
        background: '#ffffff',
        padding: '18px 20px',
        borderRadius: '16px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#16a34a', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
              Langkah 2: Pilih Operasi 3D (Klik salah satu untuk memutar animasi transformasi):
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Lihat bagaimana sketsa 2D mula-mula ditarik linier (Extrude), diputar mengitari sumbu (Revolve), meluncur di jalur kurva (Sweep), atau bertransisi (Loft).
            </p>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px' }}>
            ⚡ Animasi Interaktif Aktif
          </span>
        </div>

        {/* 4 Kartu Operasi 3D */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }}>
          {Object.values(CREATE_OPERATIONS).map((op) => {
            const isSelected = selectedOperation === op.id;
            return (
              <button
                key={op.id}
                onClick={() => handleSelectOperation(op.id)}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: isSelected ? `2.5px solid ${op.borderActive}` : '1px solid #cbd5e1',
                  background: isSelected ? op.bgActive : '#ffffff',
                  color: isSelected ? op.color : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 6px 18px rgba(0,0,0,0.08)` : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>{op.name.split('(')[0]}</span>
                  <span style={{ fontSize: '1.4rem' }}>{op.icon}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: isSelected ? '#1e293b' : '#64748b', lineHeight: 1.45 }}>
                  {op.summary}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    background: isSelected ? op.color : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 800
                  }}>
                    {isSelected ? '▶️ SEDANG ANIMASI 3D' : 'KLIK UNTUK ANIMASI'}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: op.color }}>
                    {op.defaultParam} {op.paramUnit}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* BILAH KONTROL ANIMASI TRANSFORMASI 3D (INTERACTIVE ANIMATION CONTROLLER) */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Header Bar Kontrol Animasi */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🎬</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                Kontrol Animasi Transformasi 2D ➡️ 3D:
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                color: activeOpData.color,
                background: activeOpData.bgActive,
                border: `1px solid ${activeOpData.borderActive}`,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {activeOpData.name.split('(')[0]} ({Math.round(animProgress * 100)}%)
              </span>
            </div>

            {/* Tombol Play/Pause, Replay, Auto-Loop */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleTogglePlayPause}
                style={{
                  background: isPlayingAnim ? '#ef4444' : '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{isPlayingAnim ? '⏸️ Jeda' : '▶️ Putar Animasi'}</span>
              </button>

              <button
                onClick={handleReplayAnim}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Mulai Ulang Animasi Dari Sketsa 2D"
              >
                <span>🔄 Ulangi</span>
              </button>

              <button
                onClick={() => setIsAutoLoop(!isAutoLoop)}
                style={{
                  background: isAutoLoop ? '#8b5cf6' : '#ffffff',
                  border: isAutoLoop ? '1px solid #7c3aed' : '1px solid #cbd5e1',
                  color: isAutoLoop ? '#ffffff' : '#475569',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Loop berulang terus-menerus bolak-balik"
              >
                🔁 Auto-Loop: {isAutoLoop ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Slider Progress Animasi (Siswa dapat menggeser manual dari 0% ke 100%) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, minWidth: '85px' }}>
              0% (Sketsa 2D)
            </span>
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
              style={{
                flex: 1,
                accentColor: activeOpData.color,
                cursor: 'pointer',
                height: '6px'
              }}
            />
            <span style={{ fontSize: '0.72rem', color: activeOpData.color, fontWeight: 900, minWidth: '95px', textAlign: 'right' }}>
              100% (Benda 3D Jadi)
            </span>
          </div>

          {/* Teks Penjelasan Animasi Real-Time */}
          <div style={{
            fontSize: '0.75rem',
            color: '#334155',
            background: '#ffffff',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.9rem' }}>💡</span>
            <span>
              {animProgress < 0.15 ? (
                <><strong>Tahap 1 (Sketsa 2D):</strong> Bentuk profil datar tertutup terletak di atas bidang gambar teknis.</>
              ) : animProgress < 0.9 ? (
                <><strong>Tahap 2 (Transformasi Berlangsung):</strong> {activeOpData.animationHelp}</>
              ) : (
                <><strong>Tahap 3 (Benda Padat 3D):</strong> Operasi selesai sempurna membentuk volume padatan 3D.</>
              )}
            </span>
          </div>
        </div>

        {/* Parameter Geometri Slider */}
        <div style={{
          padding: '10px 16px',
          background: '#f1f5f9',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
            ⚙️ Ukuran {activeOpData.paramName}:
          </span>
          <input
            type="range"
            min={activeOpData.paramMin}
            max={activeOpData.paramMax}
            value={opParam}
            onChange={(e) => setOpParam(Number(e.target.value))}
            style={{ flex: 1, minWidth: '160px', cursor: 'pointer', accentColor: activeOpData.color }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 900, color: activeOpData.color, minWidth: '70px', textAlign: 'right' }}>
            {opParam} {activeOpData.paramUnit}
          </span>
        </div>
      </div>

      {/* =====================================================================
          DUAL VIEWPORT WORKSPACE: 2D SKETCH (LEFT) & 3D SOLID (RIGHT)
          ===================================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: displayMode === 'split' ? 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' : '1fr',
        gap: '20px'
      }}>
        
        {/* PANEL KIRI: JENDELA SKETSA 2D */}
        {(displayMode === 'split' || displayMode === '2d_only') && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #cbd5e1',
            position: 'relative'
          }}>
            <div style={{
              padding: '12px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>📐</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  Jendela Sketsa 2D: {activeSketchData.name.split('(')[0]}
                </span>
                <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  BIDANG XY (SKETCH PLANE)
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                ISO 128 / 129
              </span>
            </div>

            <div style={{ height: '380px', width: '100%', position: 'relative' }}>
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
              />
            </div>
          </div>
        )}

        {/* PANEL KANAN: JENDELA 3D SOLID DENGAN ANIMASI INTERAKTIF */}
        {(displayMode === 'split' || displayMode === '3d_only') && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #cbd5e1',
            position: 'relative'
          }}>
            {/* Top Bar 3D */}
            <div style={{
              padding: '12px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>🧊</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  Viewport 3D: {activeOpData.name.split('(')[0]}
                </span>
                <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  WEBGL OPENGL
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Tombol Cross-Section / X-Ray */}
                <button
                  onClick={() => setIsCrossSection(!isCrossSection)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: isCrossSection ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                    background: isCrossSection ? '#eff6ff' : '#ffffff',
                    color: isCrossSection ? '#1d4ed8' : '#334155',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Lihat rongga dalam Shell dan lubang Hole (Potongan X-Ray)"
                >
                  <span>{isCrossSection ? '🔍 X-Ray ON' : '👁️ X-Ray'}</span>
                </button>

                {/* Material Switcher */}
                <div style={{ display: 'flex', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                  {[
                    { id: 'steel', label: 'Baja' },
                    { id: 'brass', label: 'Kuningan' },
                    { id: 'aluminium', label: 'Alum' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMaterialMode(m.id)}
                      style={{
                        padding: '4px 8px',
                        border: 'none',
                        background: materialMode === m.id ? '#1e293b' : 'transparent',
                        color: materialMode === m.id ? '#fff' : '#64748b',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3D WebGL Canvas */}
            <div style={{ height: '380px', width: '100%', position: 'relative' }}>
              <Suspense fallback={
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontWeight: 700, background: '#ffffff' }}>
                  MEMUAT ENGINE 3D...
                </div>
              }>
                <Canvas
                  shadows
                  camera={{ position: [60, 50, 60], fov: 42 }}
                  gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
                  style={{ background: '#ffffff' }}
                >
                  <ambientLight intensity={1.3} />
                  <directionalLight position={[60, 80, 50]} intensity={1.8} castShadow />
                  <directionalLight position={[-60, 40, -50]} intensity={0.8} />

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
                    fadeDistance={110}
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

              {/* View Angle Switchers & Auto Rotate */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{
                  pointerEvents: 'auto',
                  display: 'flex',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <button
                    onClick={() => { sound.playClick(); setActiveViewAngle('depan'); }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      background: activeViewAngle === 'depan' ? '#2563eb' : '#f1f5f9',
                      color: activeViewAngle === 'depan' ? '#fff' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    Depan
                  </button>
                  <button
                    onClick={() => { sound.playClick(); setActiveViewAngle('atas'); }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      background: activeViewAngle === 'atas' ? '#2563eb' : '#f1f5f9',
                      color: activeViewAngle === 'atas' ? '#fff' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    Atas
                  </button>
                  <button
                    onClick={() => { sound.playClick(); setActiveViewAngle('kanan'); }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      border: activeViewAngle === 'kanan' ? 'none' : '1px solid #86efac',
                      background: activeViewAngle === 'kanan' ? '#16a34a' : '#f0fdf4',
                      color: activeViewAngle === 'kanan' ? '#fff' : '#166534',
                      fontWeight: 900,
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    👉 Kanan
                  </button>
                  <button
                    onClick={() => { sound.playClick(); setActiveViewAngle('iso'); }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      background: activeViewAngle === 'iso' ? '#7c3aed' : '#f1f5f9',
                      color: activeViewAngle === 'iso' ? '#fff' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    Isometri
                  </button>
                </div>

                <div style={{ pointerEvents: 'auto' }}>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: autoRotate ? '#16a34a' : 'rgba(255, 255, 255, 0.94)',
                      color: autoRotate ? '#fff' : '#334155',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    {autoRotate ? '⏸ Stop' : '🔄 Putar 360°'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Notice */}
            <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
              💡 <em>Tips:</em> Klik & seret mouse untuk memutar 360°, scroll untuk zoom in/out benda 3D.
            </div>
          </div>
        )}

      </div>

      {/* =====================================================================
          LANGKAH 3: FITUR MODIFIKASI 3D (MODIFY / PLACED FEATURES)
          ===================================================================== */}
      <div style={{
        background: '#ffffff',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#d97706', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
              Langkah 3: Uji Fitur Modifikasi 3D (Fillet, Chamfer, Shell, Draft, Hole):
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Klik tombol di bawah ini untuk melihat benda 3D di atas langsung berubah berfillet, berchamfer, bershell, berdraft, atau berlubang:
            </p>
          </div>

          <button
            onClick={() => setIsCrossSection(!isCrossSection)}
            style={{
              background: isCrossSection ? '#eff6ff' : '#f8fafc',
              border: isCrossSection ? '2px solid #2563eb' : '1px solid #cbd5e1',
              color: isCrossSection ? '#1d4ed8' : '#334155',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{isCrossSection ? '🔍 Potongan X-Ray Aktif' : '🔍 Lihat Rongga Dalam (X-Ray)'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '12px' }}>
          
          {/* 1. FILLET */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            border: hasFillet ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: hasFillet ? '#eff6ff' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleToggleFillet}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: hasFillet ? '#2563eb' : '#cbd5e1',
                  color: hasFillet ? '#fff' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {hasFillet ? '✅ FILLET AKTIF' : '🔘 AKTIFKAN FILLET'}
              </button>
              {hasFillet && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8' }}>Radius R = {filletRadius} mm</span>}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
              <strong>Fillet:</strong> Membulatkan tepi sudut tajam untuk <strong>mencegah konsentrasi tegangan (*stress concentration*)</strong> agar benda tidak mudah patah dan aman disentuh tangan.
            </div>
            {hasFillet && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Radius:</span>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={filletRadius}
                  onChange={(e) => setFilletRadius(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer' }}
                />
              </div>
            )}
          </div>

          {/* 2. CHAMFER */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            border: hasChamfer ? '2px solid #d97706' : '1px solid #e2e8f0',
            background: hasChamfer ? '#fffbeb' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleToggleChamfer}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: hasChamfer ? '#d97706' : '#cbd5e1',
                  color: hasChamfer ? '#fff' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {hasChamfer ? '✅ CHAMFER AKTIF' : '🔘 AKTIFKAN CHAMFER'}
              </button>
              {hasChamfer && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309' }}>Ukuran C = {chamferSize} mm</span>}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
              <strong>Chamfer:</strong> Memotong sudut miring rata 45° untuk <strong>mempermudah proses perakitan baut/poros (*lead-in chamfer*)</strong> dan membersihkan bram tajam (*deburring*).
            </div>
            {hasChamfer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Ukuran:</span>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={chamferSize}
                  onChange={(e) => setChamferSize(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#d97706', cursor: 'pointer' }}
                />
              </div>
            )}
          </div>

          {/* 3. SHELL */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            border: hasShell ? '2px solid #7c3aed' : '1px solid #e2e8f0',
            background: hasShell ? '#faf5ff' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => { sound.playClick(); setHasShell(!hasShell); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: hasShell ? '#7c3aed' : '#cbd5e1',
                  color: hasShell ? '#fff' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {hasShell ? '✅ SHELL AKTIF' : '🔘 AKTIFKAN SHELL'}
              </button>
              {hasShell && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6d28d9' }}>Tebal Dinding t = {shellThickness} mm</span>}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
              <strong>Shell:</strong> Mengikis dan mengosongkan bagian dalam padatan benda menjadi <strong>berdinding tipis berongga (*hollow*)</strong> berketebalan seragam (seperti wadah plastik, casing).
            </div>
            {hasShell && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Tebal t:</span>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={shellThickness}
                  onChange={(e) => setShellThickness(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#7c3aed', cursor: 'pointer' }}
                />
              </div>
            )}
          </div>

          {/* 4. DRAFT */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            border: hasDraft ? '2px solid #059669' : '1px solid #e2e8f0',
            background: hasDraft ? '#ecfdf5' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => { sound.playClick(); setHasDraft(!hasDraft); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: hasDraft ? '#059669' : '#cbd5e1',
                  color: hasDraft ? '#fff' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {hasDraft ? '✅ DRAFT AKTIF' : '🔘 AKTIFKAN DRAFT'}
              </button>
              {hasDraft && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857' }}>Sudut α = {draftAngle}°</span>}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
              <strong>Draft:</strong> Memberikan sudut kemiringan tirus pada dinding vertikal agar benda hasil <strong>cetakan cor logam (*casting*) atau cetakan plastik injeksi mudah dilepas (*mold release*)</strong>.
            </div>
            {hasDraft && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Sudut α:</span>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={draftAngle}
                  onChange={(e) => setDraftAngle(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#059669', cursor: 'pointer' }}
                />
              </div>
            )}
          </div>

          {/* 5. HOLE */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            border: hasHole ? '2px solid #dc2626' : '1px solid #e2e8f0',
            background: hasHole ? '#fef2f2' : '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => { sound.playClick(); setHasHole(!hasHole); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: hasHole ? '#dc2626' : '#cbd5e1',
                  color: hasHole ? '#fff' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {hasHole ? '✅ HOLE AKTIF' : '🔘 AKTIFKAN HOLE'}
              </button>
              {hasHole && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c' }}>Diameter Ø = {holeRadius * 2} mm</span>}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
              <strong>Hole:</strong> Membuat lubang silindris tembus atau berulir pada sumbu pusat untuk <strong>dudukan poros transmisi, pasak, atau lubang baut pengikat</strong>.
            </div>
            {hasHole && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Diameter:</span>
                <input
                  type="range"
                  min="4"
                  max="14"
                  value={holeRadius}
                  onChange={(e) => setHoleRadius(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#dc2626', cursor: 'pointer' }}
                />
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default CADStudioSimulator;

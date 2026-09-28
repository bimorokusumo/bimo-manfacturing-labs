import React, { useState, Suspense, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import Lathe3D from './Lathe3D';
import PreparationModal from './PreparationModal';
import LatheFormulaCalculatorModal from './LatheFormulaCalculatorModal';

// =========================================================================
// DATA KONFIGURASI TOOLING PAHAT CNC (STANDAR INDUSTRI & ISO)
// =========================================================================
const TOOLS_CONFIG = {
  rata: {
    id: 'rata',
    code: 'T0101',
    name: 'Pahat Rata Kanan',
    enName: 'Right-Hand Turning / Roughing Tool',
    icon: '🔪',
    insert: 'WNMG 080408 / CNMG 120408 (Rhombic 80° Gold Carbide)',
    leadAngle: '95° (ISO PCLNR 2020K12)',
    orientation: 'Vertikal (CNC Turret)',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: '#0284c7',
    desc: 'Untuk pembubutan diameter luar memanjang (longitudinal turning), pemakanan bertingkat kasar dan halus dari Z0 ke Z-.'
  },
  alur: {
    id: 'alur',
    code: 'T0202',
    name: 'Pahat Alur (Grooving)',
    enName: 'Grooving / Parting Off Tool',
    icon: '🪚',
    insert: 'CoroCut / Iscar Blade 3.0 mm (Slender Flat-Edge TiAlN)',
    leadAngle: '90° Tegak Lurus Poros (Plunging Blade)',
    orientation: 'Vertikal (CNC Turret)',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: '#d97706',
    desc: 'Bilah ramping khusus alur celah (groove), snap ring, alur oli, dan pemotongan benda kerja (parting off) secara melintang ke X.'
  },
  ulir: {
    id: 'ulir',
    code: 'T0404',
    name: 'Pahat Ulir Luar (Threading)',
    enName: 'External Threading Tool (60° ISO Metric)',
    icon: '🔩',
    insert: 'ISO 16ER AG60 (Equilateral 60° Laydown Carbide TiAlN)',
    leadAngle: '60° Profil Gigi Ulir Metris (ISO 16ER)',
    orientation: 'Vertikal (CNC Turret)',
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.12)',
    border: '#9333ea',
    desc: 'Insert segitiga sama sisi 60° khusus pembuatan ulir luar (external thread) metris standar dengan siklus G92/G76 pada permukaan poros.'
  },
  facing: {
    id: 'facing',
    code: 'T0303',
    name: 'Pahat Facing (Muka)',
    enName: 'Transversal Facing Tool',
    icon: '🪓',
    insert: 'PCLNL 93° / TNMG 160408 (Triangular Sharp Wedge)',
    leadAngle: '93° / 75° Facing Angle',
    orientation: 'Vertikal (CNC Turret)',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: '#059669',
    desc: 'Khusus meratakan dan membersihkan permukaan ujung muka benda kerja pada bidang Z0 dari diameter luar ke titik pusat X0.'
  }
};

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
  if (tool === 'alur') {
    const z1 = -(len * 0.25).toFixed(1);
    const z2 = -(len * 0.50).toFixed(1);
    const d1 = (dia - 12).toFixed(1);
    const d2 = (dia - 16).toFixed(1);
    return `(PROGRAM BUBUT ALUR 3MM - T0202)
G21 G90 G54
T0202 M06 (PAHAT ALUR 3MM VERTIKAL)
M03 S800
G00 X${(dia + 2).toFixed(1)} Z${z1}
G01 X${d1} Z${z1} F0.08 (SAYAT ALUR 1)
G04 P500 (DWELL 0.5 DETIK)
G00 X${(dia + 2).toFixed(1)} Z${z1}
G00 X${(dia + 2).toFixed(1)} Z${z2}
G01 X${d2} Z${z2} F0.08 (SAYAT ALUR 2)
G04 P500
G00 X${(dia + 2).toFixed(1)} Z${z2}
G00 X${(dia + 10).toFixed(1)} Z10.0
M05
M30`;
  }

  if (tool === 'ulir') {
    const threadZ = -(len * 0.50).toFixed(1);
    const pitch = 2.0;
    const coreDia = (dia - 2.4).toFixed(1);
    return `(PROGRAM BUBUT ULIR METRIS M${dia}x${pitch} - T0404)
G21 G90 G54
T0404 M06 (PAHAT ULIR LUAR 60 DERAJAT 16ER)
M03 S600 (RPM RENDAH UNTUK SIKLUS ULIR)
G00 X${(dia + 4).toFixed(1)} Z4.0
(SIKLUS PEMBUATAN ULIR DENGAN G92)
G92 X${(dia - 0.5).toFixed(1)} Z${threadZ} F${pitch} (PASS 1 KEDALAMAN 0.25MM)
G92 X${(dia - 1.0).toFixed(1)} Z${threadZ} F${pitch} (PASS 2 KEDALAMAN 0.50MM)
G92 X${(dia - 1.5).toFixed(1)} Z${threadZ} F${pitch} (PASS 3 KEDALAMAN 0.75MM)
G92 X${(dia - 2.0).toFixed(1)} Z${threadZ} F${pitch} (PASS 4 KEDALAMAN 1.00MM)
G92 X${coreDia} Z${threadZ} F${pitch} (PASS 5 FINISHING DIAMETER INTI)
G00 X${(dia + 10).toFixed(1)} Z10.0
M05
M30`;
  }

  if (tool === 'facing') {
    return `(PROGRAM BUBUT FACING MUKA - T0303)
G21 G90 G54
T0303 M06 (PAHAT FACING VERTIKAL)
M03 S1400
G00 X${(dia + 4).toFixed(1)} Z2.0
G00 X${(dia + 4).toFixed(1)} Z0.5
G01 X-1.0 Z0.5 F0.15 (SAYAT MUKA KASAR)
G00 Z2.0
G00 X${(dia + 4).toFixed(1)} Z2.0
G00 X${(dia + 4).toFixed(1)} Z0.0
G01 X-1.0 Z0.0 F0.10 (FINISHING MUKA Z0)
G00 Z3.0
G00 X${(dia + 10).toFixed(1)} Z10.0
M05
M30`;
  }

  // Default: Pahat Rata Kanan
  const dStep1 = (dia - 6).toFixed(1);
  const zStep1 = -(len * 0.6).toFixed(1);
  const dStep2 = (dia - 12).toFixed(1);
  const zStep2 = -(len * 0.35).toFixed(1);
  return `(PROGRAM BUBUT RATA KANAN - T0101)
G21 G90 G54
T0101 M06 (PAHAT RATA KANAN VERTIKAL)
M03 S1200
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
M05
M30`;
};

const CNCLatheModule = ({ addXP }) => {
  const [isPrepared, setIsPrepared] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState('4'); // '1': Benda Kerja, '2': Tooling, '3': Spindel, '4': Program, '5': Proses, '6': Hasil
  
  // ==========================================
  // 1. BENDA KERJA STATE (UKURAN & MATERIAL)
  // ==========================================
  const [workpieceDiameter, setWorkpieceDiameter] = useState(50); // mm (20 - 80)
  const [workpieceLength, setWorkpieceLength] = useState(100); // mm (50 - 150)
  const [workpieceMaterial, setWorkpieceMaterial] = useState('Baja St 37 (Mild Steel)');
  const [showWorkpieceModal, setShowWorkpieceModal] = useState(false);

  // ==========================================
  // 2. TOOLING STATE (PAHAT CNC & ORIENTASI)
  // ==========================================
  const [toolType, setToolType] = useState('rata'); // 'rata', 'alur', 'facing'
  const toolOrientation = 'vertical'; // Posisi Vertikal sesuai permintaan user!

  // ==========================================
  // 3. PARAMETER MESIN
  // ==========================================
  const [spindleRpm, setSpindleRpm] = useState(1200);
  const [feedRate, setFeedRate] = useState(0.20);
  const [coolant, setCoolant] = useState(true);

  // ==========================================
  // 4. PROGRAM G-CODE & EKSEKUSI
  // ==========================================
  const [gcodeText, setGcodeText] = useState(() => getGcodeTemplate('rata', 50, 100));
  const [currentLine, setCurrentLine] = useState(-1);
  const [isMachining, setIsMachining] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Profile points for Lathe (30 segments in exact mm diameter)
  const initialProfile = Array(30).fill(workpieceDiameter);
  const profileRef = useRef([...initialProfile]);
  const [profileForRender, setProfileForRender] = useState([...initialProfile]);
  
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
    const newProfile = Array(30).fill(clampedDia);
    profileRef.current = [...newProfile];
    setProfileForRender([...newProfile]);

    const newToolPos = { z: 2.0, d: clampedDia + 2.0, x: clampedDia + 2.0 };
    toolPosRef.current = newToolPos;
    setToolPosForRender(newToolPos);

    // Offer to auto-update G-code to fit new dimensions
    setGcodeText(getGcodeTemplate(toolType, clampedDia, clampedLen));
    setShowWorkpieceModal(false);
  };

  // Change Tool Handler
  const handleSelectTool = (newToolId) => {
    sound.playClick();
    setToolType(newToolId);
    setGcodeText(getGcodeTemplate(newToolId, workpieceDiameter, workpieceLength));
  };

  // Cutting Calculation Engine
  const applyToolMove = (newD, newZ) => {
    toolPosRef.current = { z: newZ, d: newD, x: newD };
    
    // Check cutting contact inside workpiece boundary
    if (newZ <= 1.0 && newZ >= -workpieceLength - 5) {
      const clampedZ = Math.max(-workpieceLength, Math.min(0, newZ));
      const progress = Math.abs(clampedZ) / workpieceLength;
      const index = Math.min(29, Math.max(0, Math.floor(progress * 29)));
      const cutDiameter = Math.max(0, newD);

      if (toolType === 'alur') {
        // Pahat alur lebar 3mm mencakup ~2-3 segmen
        const span = Math.max(1, Math.round((3.0 / workpieceLength) * 29));
        for (let s = -span; s <= span; s++) {
          const idx = index + s;
          if (idx >= 0 && idx < 30) {
            if (cutDiameter < profileRef.current[idx]) {
              profileRef.current[idx] = cutDiameter;
            }
          }
        }
      } else if (toolType === 'ulir') {
        // Pahat ulir menyayat ulir metris 60 derajat
        if (cutDiameter < profileRef.current[index]) {
          profileRef.current[index] = cutDiameter;
        }
      } else if (toolType === 'facing') {
        // Pahat facing memotong muka Z0
        if (Math.abs(newZ) <= 1.5) {
          if (cutDiameter < profileRef.current[0]) profileRef.current[0] = cutDiameter;
          if (cutDiameter < profileRef.current[1]) profileRef.current[1] = cutDiameter;
        }
      } else {
        // Pahat rata memanjang
        if (cutDiameter < profileRef.current[index]) {
          profileRef.current[index] = cutDiameter;
          if (index > 0 && cutDiameter < profileRef.current[index - 1]) profileRef.current[index - 1] = cutDiameter;
          if (index < 29 && cutDiameter < profileRef.current[index + 1]) profileRef.current[index + 1] = cutDiameter;
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
    const freshProfile = Array(30).fill(workpieceDiameter);
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
      
      // Deteksi Tool Change di dalam G-Code (T0101, T0202, T0303, T0404)
      if (line.includes('T0101') || line.includes('T01')) setToolType('rata');
      else if (line.includes('T0202') || line.includes('T02')) setToolType('alur');
      else if (line.includes('T0404') || line.includes('T04') || line.includes('G92') || line.includes('G76')) setToolType('ulir');
      else if (line.includes('T0303') || line.includes('T03')) setToolType('facing');

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
    { id: '2', title: '2. TOOLING / PAHAT', desc: `${activeToolData.name} (Vertikal)` },
    { id: '3', title: '3. SPINDEL & COOLANT', desc: `S${spindleRpm} / ${coolant ? 'M08' : 'M09'}` },
    { id: '4', title: '4. PROGRAM G-CODE', desc: 'Editor Program ISO' },
    { id: '5', title: '5. PROSES SIMULASI', desc: isMachining ? 'RUNNING...' : 'Siap Mulai' },
    { id: '6', title: '6. HASIL & EVALUASI', desc: showResult ? 'Score 100%' : 'Menunggu' }
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
            <span>🧮</span>
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
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>🔘 BENDA KERJA:</span>
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
            <span style={{ fontSize: '0.75rem' }}>✎</span>
          </button>
        </div>

        {/* PILIHAN PAHAT CEPAT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>🔪 PAHAT CNC:</span>
          {Object.values(TOOLS_CONFIG).map(t => (
            <button
              key={t.id}
              onClick={() => handleSelectTool(t.id)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: toolType === t.id ? `1.5px solid ${t.border}` : '1px solid var(--border-light)',
                background: toolType === t.id ? t.bg : 'transparent',
                color: toolType === t.id ? t.color : 'var(--text-main)',
                fontSize: '0.75rem',
                fontWeight: toolType === t.id ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s'
              }}
            >
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>

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
          <span>📐</span>
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
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>⚡ PRESET CEPAT:</div>
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
                machineMode="rata"
                rpm={spindleRpm}
                isCutting={isMachining && currentLine >= 0}
                coolant={coolant}
                showTailstock={false}
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
                    <span>🔘</span>
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

            {/* TAB 2: TOOLING & PAHAT CNC */}
            {activeTab === '2' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔪</span>
                    <span>Pilihan Pahat Turret CNC Bubut (Posisi Vertikal)</span>
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Turret Indexing Station: 8-Tool Turret</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {Object.values(TOOLS_CONFIG).map(tool => {
                    const isSelected = toolType === tool.id;
                    return (
                      <div
                        key={tool.id}
                        onClick={() => handleSelectTool(tool.id)}
                        style={{
                          background: isSelected ? tool.bg : 'var(--bg-game)',
                          border: isSelected ? `2px solid ${tool.border}` : '1px solid var(--border-light)',
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? `0 4px 16px ${tool.bg}` : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.4rem' }}>{tool.icon}</span>
                            <div>
                              <div style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '0.95rem' }}>{tool.name}</div>
                              <div style={{ fontSize: '0.72rem', color: tool.color, fontWeight: 800 }}>{tool.code} &bull; {tool.orientation}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <span style={{ background: tool.border, color: '#ffffff', fontSize: '0.65rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px' }}>
                              AKTIF
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {tool.desc}
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '6px', fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div><strong style={{ color: 'var(--text-main)' }}>Insert:</strong> {tool.insert}</div>
                          <div><strong style={{ color: 'var(--text-main)' }}>Sudut:</strong> {tool.leadAngle}</div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTool(tool.id);
                            setActiveTab('4');
                          }}
                          style={{
                            marginTop: 'auto',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: isSelected ? tool.border : 'rgba(255,255,255,0.08)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {isSelected ? '✓ Program G-Code Termuat (Lihat Editor)' : 'Pilih & Muat Program'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: SPINDEL & COOLANT */}
            {activeTab === '3' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚙️</span>
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
                      {coolant ? '💧 COOLANT AKTIF (M08)' : '⏹ COOLANT MATI (M09)'}
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
                      G-Code Editor CNC Bubut &bull; Pahat Aktif: <strong style={{ color: activeToolData.color }}>{activeToolData.name} ({activeToolData.code})</strong>
                    </label>
                  </div>

                  {/* QUICK TEMPLATE LOADERS */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleSelectTool('rata')}
                      style={{ padding: '4px 8px', borderRadius: '4px', background: toolType === 'rata' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      📄 Prog. Rata
                    </button>
                    <button
                      onClick={() => handleSelectTool('alur')}
                      style={{ padding: '4px 8px', borderRadius: '4px', background: toolType === 'alur' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.06)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      📄 Prog. Alur
                    </button>
                    <button
                      onClick={() => handleSelectTool('ulir')}
                      style={{ padding: '4px 8px', borderRadius: '4px', background: toolType === 'ulir' ? 'rgba(192, 132, 252, 0.2)' : 'rgba(255,255,255,0.06)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.3)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      📄 Prog. Ulir
                    </button>
                    <button
                      onClick={() => handleSelectTool('facing')}
                      style={{ padding: '4px 8px', borderRadius: '4px', background: toolType === 'facing' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.06)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      📄 Prog. Facing
                    </button>
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

            {/* TAB 5: PROSES SIMULASI & DRO READOUT */}
            {activeTab === '5' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚡</span>
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

            {/* TAB 6: HASIL & EVALUASI */}
            {activeTab === '6' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏆</span>
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
                <span>{isMachining ? '⏳' : '▶'}</span>
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

        {/* RIGHT SIDEBAR: HASIL & MONITOR */}
        <div style={{ width: '270px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '18px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '14px', textAlign: 'center', letterSpacing: '0.5px' }}>
            STATUS MONITOR CNC
          </h3>
          
          {/* Workpiece & Tool Info Box */}
          <div style={{ background: 'var(--bg-game)', borderRadius: '10px', padding: '12px', border: '1px solid var(--border-light)', marginBottom: '14px', fontSize: '0.78rem' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Benda Kerja:</div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              Ø {workpieceDiameter} mm &times; {workpieceLength} mm
            </div>

            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Pahat Terpasang:</div>
            <div style={{ fontWeight: 800, color: activeToolData.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{activeToolData.icon}</span>
              <span>{activeToolData.name}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>
              Orientasi: Vertikal (Upper Turret)
            </div>
          </div>

          <div style={{ height: '120px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '1px dashed var(--border-light)' }}>
            {showResult ? (
              <img src="https://images.unsplash.com/photo-1620803454743-305f884bf60c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Benda Kerja CNC" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', textAlign: 'center', padding: '10px' }}>
                {isMachining ? '⚡ Sedang Proses Pemotongan...' : 'Menunggu Cycle Start...'}
              </div>
            )}
          </div>

          {showResult ? (
            <div className="animate-fade-in">
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '8px', borderRadius: '6px', textAlign: 'center', fontWeight: 800, fontSize: '0.82rem', marginBottom: '12px', border: '1px solid #60a5fa' }}>
                ✓ SIKLUS SELESAI
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Program bubut CNC berhasil dieksekusi dengan pahat {activeToolData.name}.
              </div>

              <div style={{ textAlign: 'center', background: 'rgba(59, 130, 246, 0.08)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>REWARD XP</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#60a5fa' }}>+250 XP</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              💡 <em>Tips:</em> Pilih tab <strong>1. BENDA KERJA</strong> untuk mengubah ukuran billet, atau klik tombol <strong>Pahat</strong> untuk mengganti tipe pahat ke Rata Kanan, Alur 3mm, atau Facing Muka.
            </div>
          )}
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

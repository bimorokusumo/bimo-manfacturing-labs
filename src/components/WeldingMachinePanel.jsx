import React, { useState } from 'react';
import { sound } from '../utils/audio';

// =========================================================================
// DATABASE WPS (WELDING PROCEDURE SPECIFICATION) BERDASARKAN KETEBALAN PLAT
// Standar Industri AWS D1.1 & ISO 9606
// =========================================================================
export const WELDING_WPS_DATABASE = {
  SMAW: {
    '2mm': {
      thicknessMm: 2,
      plateName: 'Plat Tipis (Sheet Metal 2.0 mm)',
      grooveType: 'Square Butt Joint (I-Groove)',
      rootGap: 1.0,
      recommendedElectrode: 'E6013-RB',
      recommendedDiameter: 2.0,
      currentRange: [45, 65], // optimal 55A
      optimalCurrent: 55,
      optimalArcForce: 30,
      optimalHotStart: 40,
      polarity: 'DCEN',
      notes: 'Gunakan kawat diameter kecil Ø2.0mm arus rendah (55A) polaritas DCEN agar panas tidak terkonsentrasi di plat untuk mencegah jebol (burn-through).'
    },
    '4mm': {
      thicknessMm: 4,
      plateName: 'Plat Sedang-Ringan (4.0 mm)',
      grooveType: 'Square Butt / Bevel 30°',
      rootGap: 1.5,
      recommendedElectrode: 'E6013-RD',
      recommendedDiameter: 2.6,
      currentRange: [75, 95], // optimal 85A
      optimalCurrent: 85,
      optimalArcForce: 45,
      optimalHotStart: 50,
      polarity: 'DCEP',
      notes: 'Gunakan elektroda Ø2.6mm dengan arus ~85A DCEP. Penetrasi stabil dan manik halus.'
    },
    '6mm': {
      thicknessMm: 6,
      plateName: 'Plat Standar Konstruksi (6.0 mm)',
      grooveType: 'Single V-Groove (Bevel 60°)',
      rootGap: 2.0,
      recommendedElectrode: 'E7016-LB',
      recommendedDiameter: 3.2,
      currentRange: [100, 130], // optimal 115A
      optimalCurrent: 115,
      optimalArcForce: 60,
      optimalHotStart: 60,
      polarity: 'DCEP',
      notes: 'Standar uji sertifikasi welder 1G/3G. Elektroda LB-52 Ø3.2mm arus 115A dengan Arc Force 60% untuk penetrasi akar kokoh.'
    },
    '8mm': {
      thicknessMm: 8,
      plateName: 'Plat Tebal Medium (8.0 mm)',
      grooveType: 'Single V-Groove (Bevel 60°)',
      rootGap: 2.5,
      recommendedElectrode: 'E7016-LB',
      recommendedDiameter: 3.2,
      currentRange: [120, 145], // optimal 135A
      optimalCurrent: 135,
      optimalArcForce: 65,
      optimalHotStart: 65,
      polarity: 'DCEP',
      notes: 'Wajib multi-pass (Root pass + Filler + Capping). Arus 135A menghasilkan fusi dinding kampuh yang sempurna.'
    },
    '10mm': {
      thicknessMm: 10,
      plateName: 'Plat Tebal Struktural (10.0 mm)',
      grooveType: 'Single V-Groove dengan Root Face 2mm',
      rootGap: 2.5,
      recommendedElectrode: 'E7018',
      recommendedDiameter: 4.0,
      currentRange: [140, 175], // optimal 155A
      optimalCurrent: 155,
      optimalArcForce: 75,
      optimalHotStart: 70,
      polarity: 'DCEP',
      notes: 'Gunakan kawat low-hydrogen E7018 Ø4.0mm arus 155A. Arc Force tinggi mencegah busur mati saat mengayun di kampuh dalam.'
    },
    '12mm': {
      thicknessMm: 12,
      plateName: 'Plat Ekstra Tebal / Plat Kapal (12.0 mm)',
      grooveType: 'Double V-Groove / Single V 60°',
      rootGap: 3.0,
      recommendedElectrode: 'E7018',
      recommendedDiameter: 4.0,
      currentRange: [160, 200], // optimal 180A
      optimalCurrent: 180,
      optimalArcForce: 85,
      optimalHotStart: 75,
      polarity: 'DCEP',
      notes: 'Multi-layer welding konstruksi berat. Arus 180A menghasilkan penetrasi tinggi dan fusi bebas lack of fusion.'
    }
  },
  MIG: {
    '2mm': {
      thicknessMm: 2,
      plateName: 'Plat Tipis (Sheet Metal 2.0 mm)',
      wireDiameter: 0.8,
      voltageRange: [16.0, 18.0],
      optimalVoltage: 17.0,
      wfsRange: [3.5, 5.0], // m/min
      optimalWfs: 4.2,
      gasFlowRange: [10, 14], // L/min
      optimalGasFlow: 12,
      optimalInductance: 3,
      recommendedGas: 'Ar + 20% CO2',
      notes: 'Mode Short Arc (tegangan 17V, kawat Ø0.8mm) meminimalkan heat input agar tidak terjadi burn through pada plat tipis.'
    },
    '4mm': {
      thicknessMm: 4,
      plateName: 'Plat Sedang-Ringan (4.0 mm)',
      wireDiameter: 0.8,
      voltageRange: [18.5, 20.5],
      optimalVoltage: 19.5,
      wfsRange: [5.0, 7.5],
      optimalWfs: 6.2,
      gasFlowRange: [12, 16],
      optimalGasFlow: 14,
      optimalInductance: 4,
      recommendedGas: 'Ar + 20% CO2',
      notes: 'Tegangan 19.5V dengan wire speed 6.2 m/menit menghasilkan kawah las tenang dan bebas spatter.'
    },
    '6mm': {
      thicknessMm: 6,
      plateName: 'Plat Standar Konstruksi (6.0 mm)',
      wireDiameter: 1.0,
      voltageRange: [21.0, 23.5],
      optimalVoltage: 22.0,
      wfsRange: [6.5, 9.0],
      optimalWfs: 7.8,
      gasFlowRange: [14, 18],
      optimalGasFlow: 15,
      optimalInductance: 5,
      recommendedGas: 'Ar + 20% CO2',
      notes: 'Kawat Ø1.0mm tegangan 22V WFS 7.8 m/menit. Standar industri fabrikasi umum dengan penetrasi merata.'
    },
    '8mm': {
      thicknessMm: 8,
      plateName: 'Plat Tebal Medium (8.0 mm)',
      wireDiameter: 1.0,
      voltageRange: [23.5, 26.0],
      optimalVoltage: 24.5,
      wfsRange: [8.5, 11.5],
      optimalWfs: 9.8,
      gasFlowRange: [15, 20],
      optimalGasFlow: 16,
      optimalInductance: 6,
      recommendedGas: 'Ar + 20% CO2',
      notes: 'Transisi ke Spray Arc transfer. Tegangan 24.5V menghasilkan pencairan kawat cepat dan fusi kuat.'
    },
    '10mm': {
      thicknessMm: 10,
      plateName: 'Plat Tebal Struktural (10.0 mm)',
      wireDiameter: 1.2,
      voltageRange: [26.0, 28.5],
      optimalVoltage: 27.0,
      wfsRange: [9.0, 13.0],
      optimalWfs: 11.0,
      gasFlowRange: [16, 22],
      optimalGasFlow: 18,
      optimalInductance: 7,
      recommendedGas: 'Ar + 20% CO2',
      notes: 'Kawat Ø1.2mm tegangan 27V. Cocok untuk pengelasan bejana tekan dan gelagar baja struktural.'
    },
    '12mm': {
      thicknessMm: 12,
      plateName: 'Plat Ekstra Tebal / Plat Kapal (12.0 mm)',
      wireDiameter: 1.2,
      voltageRange: [28.0, 31.0],
      optimalVoltage: 29.5,
      wfsRange: [11.0, 15.0],
      optimalWfs: 13.0,
      gasFlowRange: [18, 24],
      optimalGasFlow: 20,
      optimalInductance: 8,
      recommendedGas: 'Ar + 20% CO2',
      notes: 'Mode High-Deposition Spray Transfer (29.5V, WFS 13 m/min). Penetrasi dalam dan efisiensi pengelasan tinggi.'
    }
  },
  OAW: {
    '2mm': {
      thicknessMm: 2,
      plateName: 'Plat Tipis (Sheet Metal 2.0 mm)',
      nozzleSize: '#1 (Ø 0.8 mm)',
      oxygenPressure: 1.5, // bar
      acetylenePressure: 0.3, // bar
      fillerDiameter: 1.6,
      optimalFlame: 'neutral',
      notes: 'Nozzle tip #1 dengan tekanan Oksigen 1.5 bar & Asetilin 0.3 bar. Kawat las tambah RG45 Ø1.6mm.'
    },
    '4mm': {
      thicknessMm: 4,
      plateName: 'Plat Sedang-Ringan (4.0 mm)',
      nozzleSize: '#2 (Ø 1.2 mm)',
      oxygenPressure: 2.0,
      acetylenePressure: 0.4,
      fillerDiameter: 2.4,
      optimalFlame: 'neutral',
      notes: 'Nozzle tip #2 dengan nyala netral (inti putih bulat). Kawat pengisi Ø2.4mm diayun membentuk kolam las.'
    },
    '6mm': {
      thicknessMm: 6,
      plateName: 'Plat Standar Konstruksi (6.0 mm)',
      nozzleSize: '#3 (Ø 1.6 mm)',
      oxygenPressure: 2.5,
      acetylenePressure: 0.5,
      fillerDiameter: 3.2,
      optimalFlame: 'neutral',
      notes: 'Nozzle tip #3 tekanan O2 2.5 bar, C2H2 0.5 bar. Butuh pemanasan awal (preheating) pada awal sambungan.'
    },
    '8mm': {
      thicknessMm: 8,
      plateName: 'Plat Tebal Medium (8.0 mm)',
      nozzleSize: '#4 (Ø 2.0 mm)',
      oxygenPressure: 3.0,
      acetylenePressure: 0.6,
      fillerDiameter: 4.0,
      optimalFlame: 'neutral',
      notes: 'Batas tebal praktis untuk las asetilin. Nozzle #4 panas tinggi dengan bevel kampuh V 60-70°.'
    },
    '10mm': {
      thicknessMm: 10,
      plateName: 'Plat Tebal Struktural (10.0 mm)',
      nozzleSize: '#5 (Ø 2.4 mm)',
      oxygenPressure: 3.5,
      acetylenePressure: 0.7,
      fillerDiameter: 5.0,
      optimalFlame: 'neutral',
      notes: 'Pemanasan lambat dan zona terpengaruh panas (HAZ) sangat lebar. Di industri umumnya dialihkan ke SMAW/MIG.'
    },
    '12mm': {
      thicknessMm: 12,
      plateName: 'Plat Ekstra Tebal (12.0 mm)',
      nozzleSize: '#5 (Ø 2.4 mm)',
      oxygenPressure: 3.8,
      acetylenePressure: 0.8,
      fillerDiameter: 5.0,
      optimalFlame: 'neutral',
      notes: 'Tebal maksimal OAW. Disarankan kampuh ganda dan multi-layer torch weaving.'
    }
  }
};

// =========================================================================
// REUSABLE HARDWARE SUB-COMPONENTS (PHYSICAL MACHINE AESTHETICS)
// =========================================================================

// 1. Molded Corner Protective Rubber Bumpers (Corner Armor with Hex Screws)
const MachineCornerBumper = ({ position = 'top-left' }) => {
  const isTop = position.includes('top');
  const isLeft = position.includes('left');

  return (
    <div style={{
      position: 'absolute',
      [isTop ? 'top' : 'bottom']: '-4px',
      [isLeft ? 'left' : 'right']: '-4px',
      width: '26px',
      height: '26px',
      background: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
      border: '2px solid #52525b',
      borderRadius: isTop && isLeft ? '8px 2px 2px 2px' :
                    isTop && !isLeft ? '2px 8px 2px 2px' :
                    !isTop && isLeft ? '2px 2px 2px 8px' : '2px 2px 8px 2px',
      boxShadow: '0 3px 6px rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      pointerEvents: 'none'
    }}>
      {/* Hex Allen Bolt Head */}
      <div style={{
        width: '10px',
        height: '10px',
        background: '#71717a',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)'
      }}>
        <div style={{ width: '4px', height: '4px', background: '#18181b', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
      </div>
    </div>
  );
};

// 2. Heavy-Duty Industrial Top Arched Carrying Handle
const TopMachineHandle = ({ color = '#d4d4d8', width = '220px' }) => (
  <div style={{
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '-8px',
    position: 'relative',
    zIndex: 4,
    pointerEvents: 'none'
  }}>
    <div style={{
      width: width,
      height: '16px',
      background: 'linear-gradient(180deg, #52525b 0%, #27272a 60%, #18181b 100%)',
      borderRadius: '8px 8px 0 0',
      border: '2px solid #71717a',
      borderBottom: 'none',
      boxShadow: '0 -4px 10px rgba(0,0,0,0.6), inset 0 2px 2px rgba(255,255,255,0.4)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Molded Center Rubber Grip */}
      <div style={{
        width: '60%',
        height: '10px',
        background: 'repeating-linear-gradient(90deg, #18181b, #18181b 3px, #27272a 3px, #27272a 6px)',
        borderRadius: '4px',
        border: '1px solid #3f3f46'
      }} />
      {/* Left Mounting Bracket */}
      <div style={{ position: 'absolute', left: '-6px', top: '2px', width: '12px', height: '14px', background: '#3f3f46', borderRadius: '3px', border: '1px solid #71717a' }} />
      {/* Right Mounting Bracket */}
      <div style={{ position: 'absolute', right: '-6px', top: '2px', width: '12px', height: '14px', background: '#3f3f46', borderRadius: '3px', border: '1px solid #71717a' }} />
    </div>
  </div>
);

// 3. Stamped Cooling Ventilation Louvers
const VentilationGrille = ({ count = 6, orientation = 'horizontal', width = '100%' }) => (
  <div style={{ width: width, display: 'flex', flexDirection: orientation === 'horizontal' ? 'column' : 'row', gap: '3px', padding: '4px 0', opacity: 0.85 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          height: orientation === 'horizontal' ? '3px' : '24px',
          width: orientation === 'horizontal' ? '100%' : '3px',
          background: 'linear-gradient(180deg, #09090b 0%, #18181b 100%)',
          borderRadius: '2px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.08)'
        }}
      />
    ))}
  </div>
);

// 4. Realistic 3D Tactile Rotary Knob with Rotation and Circular Scale
const PhysicalRotaryKnob = ({
  value,
  min,
  max,
  label,
  unit,
  onChange,
  color = '#ea580c',
  size = 68,
  marks = [],
  step = 1
}) => {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -135 + pct * 270; // -135deg to +135deg

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, margin: '10px 0' }}>
        {/* Dial Scale Tick Ring */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
          {marks.map((m, idx) => {
            const markPct = idx / (marks.length - 1);
            const markAngle = (-135 + markPct * 270) * (Math.PI / 180);
            const rOuter = size / 2 + 10;
            const rInner = size / 2 + 3;
            const cx = size / 2;
            const cy = size / 2;
            const x1 = cx + Math.cos(markAngle) * rInner;
            const y1 = cy + Math.sin(markAngle) * rInner;
            const x2 = cx + Math.cos(markAngle) * rOuter;
            const y2 = cy + Math.sin(markAngle) * rOuter;
            const tx = cx + Math.cos(markAngle) * (rOuter + 8);
            const ty = cy + Math.sin(markAngle) * (rOuter + 8);
            return (
              <g key={idx}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#71717a" strokeWidth="1.5" />
                <text x={tx} y={ty + 3} fill="#a1a1aa" fontSize="8" fontWeight="800" textAnchor="middle">{m}</text>
              </g>
            );
          })}
        </svg>

        {/* 3D Knurled Rotary Knob Body */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #3f3f46 0%, #18181b 70%, #09090b 100%)',
            boxShadow: '0 6px 14px rgba(0,0,0,0.8), inset 0 2px 3px rgba(255,255,255,0.3), inset 0 -3px 5px rgba(0,0,0,0.7)',
            border: '2px solid #52525b',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${angle}deg)`,
            transition: 'transform 0.05s linear'
          }}
        >
          {/* Outer Ridged Knurl Texture */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'repeating-conic-gradient(from 0deg, #27272a 0deg 6deg, #09090b 6deg 12deg)',
            opacity: 0.65
          }} />

          {/* Brushed Metal Center Cap */}
          <div style={{
            width: '68%',
            height: '68%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #71717a 0%, #27272a 80%)',
            border: '1.5px solid #3f3f46',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.6)',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Pointer Notch Line */}
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '3px',
              height: '38%',
              background: color,
              borderRadius: '2px',
              boxShadow: `0 0 6px ${color}`
            }} />
          </div>
        </div>
      </div>

      {/* Label and Digital Readout */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: color, fontFamily: 'monospace' }}>
          {value} <span style={{ fontSize: '0.72rem', color: '#71717a' }}>{unit}</span>
        </div>
      </div>

      {/* Slider for smooth control */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange && onChange(Number(e.target.value))}
        style={{ width: `${size + 24}px`, accentColor: color, cursor: 'pointer', height: '4px', marginTop: '4px' }}
      />
    </div>
  );
};

// 5. Heavy-Duty Dinse Cam-Lock Welding Terminal
const DinseCamLockTerminal = ({ label, polaritySign, isTorch, cableColor = '#ef4444' }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1.5px solid #27272a',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 6px rgba(0,0,0,0.5)'
  }}>
    <div style={{
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      background: polaritySign === '+' ? 'radial-gradient(circle, #b91c1c 40%, #18181b 90%)' : 'radial-gradient(circle, #27272a 40%, #09090b 90%)',
      border: polaritySign === '+' ? '2px solid #ef4444' : '2px solid #52525b',
      boxShadow: '0 4px 10px rgba(0,0,0,0.8)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {/* Cam Lock Inner Brass Ring */}
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fde047 30%, #b45309 90%)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Cam-Lock Slot Keyway */}
        <div style={{ width: '4px', height: '11px', background: '#451a03', borderRadius: '1px' }} />
      </div>

      {/* Floating Polarity Badge */}
      <span style={{
        position: 'absolute',
        top: '-6px',
        right: '-4px',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: polaritySign === '+' ? '#ef4444' : '#38bdf8',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
      }}>
        {polaritySign}
      </span>
    </div>

    <div>
      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: polaritySign === '+' ? '#fca5a5' : '#7dd3fc', letterSpacing: '0.5px' }}>
        SUDUT DINSE {polaritySign === '+' ? 'POSITIF (+)' : 'NEGATIF (-)'}
      </div>
      <div style={{ fontSize: '0.67rem', color: '#a1a1aa' }}>
        {isTorch ? '⚡ Terhubung ke STANG ELEKTRODA' : '🗜️ Terhubung ke KLEM MASSA (GROUND)'}
      </div>
    </div>
  </div>
);

// 6. Realistic Euro-Connector Receptacle (Central Adapter for MIG/MAG)
const EuroConnectorVisual = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1.5px solid #27272a',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 6px rgba(0,0,0,0.5)'
  }}>
    <div style={{
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, #78350f 15%, #b45309 60%, #18181b 95%)',
      border: '2px solid #d97706',
      boxShadow: '0 4px 10px rgba(0,0,0,0.8), inset 0 2px 4px rgba(251,191,36,0.6)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {/* Thread notches */}
      <div style={{
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        background: '#09090b',
        border: '1.5px dashed #f59e0b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Central wire liner orifice */}
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
      </div>
    </div>
    <div>
      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '0.5px' }}>
        SOKET SENTRAL EURO-CONNECTOR
      </div>
      <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>
        Koneksi Terpadu Kawat Las, Gas Pelindung & Trigger Torch MIG
      </div>
    </div>
  </div>
);

// 7. Borosilicate Glass Rotameter Gas Flowmeter Tube with Floating Steel Ball
const RotameterGasFlowmeter = ({ flow = 15, onChange, min = 5, max = 25 }) => {
  const ballPct = Math.max(0, Math.min(1, (flow - min) / (max - min)));
  const ballBottomPx = 10 + ballPct * 75; // 10px to 85px

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'linear-gradient(145deg, #09090b 0%, #18181b 100%)',
      padding: '12px 14px',
      borderRadius: '12px',
      border: '1.5px solid #27272a',
      boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
    }}>
      {/* Acrylic Glass Flowmeter Column */}
      <div style={{
        position: 'relative',
        width: '34px',
        height: '110px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(56,189,248,0.06) 50%, rgba(255,255,255,0.22) 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.45)',
        borderRadius: '6px',
        boxShadow: 'inset 0 0 10px rgba(56, 189, 248, 0.25), 0 3px 8px rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {/* Scale tick lines */}
        {[25, 20, 15, 10, 5].map((val, i) => (
          <div key={val} style={{
            position: 'absolute',
            top: `${10 + i * 20}%`,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 3px',
            pointerEvents: 'none'
          }}>
            <div style={{ width: '5px', height: '1px', background: '#38bdf8' }} />
            <span style={{ fontSize: '7px', color: '#94a3b8', fontWeight: 800 }}>{val}</span>
            <div style={{ width: '5px', height: '1px', background: '#38bdf8' }} />
          </div>
        ))}

        {/* Floating Stainless Steel Ball */}
        <div style={{
          position: 'absolute',
          bottom: `${ballBottomPx}px`,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 40%, #475569 90%)',
          boxShadow: '0 0 8px rgba(56, 189, 248, 0.8), 0 2px 4px rgba(0,0,0,0.8)',
          transition: 'bottom 0.15s ease-out'
        }} />

        {/* Glass reflection streak */}
        <div style={{
          position: 'absolute', top: 0, left: '3px', width: '3px', height: '100%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, transparent 100%)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Info & Slider Control */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
          ROTAMETER FLOWMETER (DEBIT GAS)
        </div>
        <div style={{ fontSize: '1.35rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}>
          {flow} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>L/min</span>
        </div>
        <div style={{ fontSize: '0.68rem', color: flow < 10 ? '#ef4444' : flow > 22 ? '#f59e0b' : '#10b981', fontWeight: 700, marginTop: '2px' }}>
          {flow < 10 ? '⚠️ Terlalu rendah (Bisa Porosity)' : flow > 22 ? '⚠️ Turbulen (>22 L/min)' : '✅ Optimal Ar+CO2 Flow'}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={flow}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#38bdf8', marginTop: '6px', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};

// 8. Authentic Analog Manometer Pressure Gauge with Brass Bezel and Needle
const AnalogManometerGauge = ({
  pressure = 0,
  maxPressure = 16,
  unit = 'bar',
  title = 'TEKANAN KERJA',
  color = '#0284c7',
  dangerAbove = null,
  size = 116
}) => {
  const clamped = Math.max(0, Math.min(maxPressure, pressure));
  const pct = clamped / maxPressure;
  const needleDeg = -135 + pct * 270; // -135deg to +135deg

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      <div style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f8fafc 55%, #e2e8f0 85%, #cbd5e1 100%)',
        border: '5px solid #b45309', // Forged brass outer bezel
        boxShadow: '0 8px 20px rgba(0,0,0,0.8), inset 0 2px 5px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Gauge Face Marks & Danger Arc */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#cbd5e1" strokeWidth="3" />
          
          {/* Danger Zone Arc if specified */}
          {dangerAbove && (
            <path
              d="M 50 12 A 38 38 0 0 1 85 62"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray="4 2"
            />
          )}

          {/* Scale Numbers & Ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const a = (-135 + p * 270) * (Math.PI / 180);
            const val = (p * maxPressure).toFixed(maxPressure > 5 ? 0 : 1);
            const x1 = 50 + Math.cos(a) * 33;
            const y1 = 50 + Math.sin(a) * 33;
            const x2 = 50 + Math.cos(a) * 39;
            const y2 = 50 + Math.sin(a) * 39;
            const tx = 50 + Math.cos(a) * 25;
            const ty = 50 + Math.sin(a) * 25;
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e293b" strokeWidth="1.5" />
                <text x={tx} y={ty + 2.5} fill="#0f172a" fontSize="6.5" fontWeight="900" textAnchor="middle">{val}</text>
              </g>
            );
          })}

          <text x="50" y="65" fill="#64748b" fontSize="5" fontWeight="800" textAnchor="middle">EN ISO 5171</text>
          <text x="50" y="73" fill={color} fontSize="7.5" fontWeight="900" textAnchor="middle">{unit.toUpperCase()}</text>
        </svg>

        {/* Gauge Rotating Needle */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          transform: `rotate(${needleDeg}deg)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Pointer needle blade */}
          <div style={{
            position: 'absolute',
            top: '14%',
            width: '2px',
            height: '36%',
            background: '#dc2626',
            borderRadius: '1px',
            boxShadow: '0 0 3px rgba(0,0,0,0.6)'
          }} />
          {/* Counterweight */}
          <div style={{
            position: 'absolute',
            bottom: '35%',
            width: '5px',
            height: '15%',
            background: '#0f172a',
            borderRadius: '2px'
          }} />
        </div>

        {/* Brass Center Cap */}
        <div style={{
          position: 'relative',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fde047 0%, #b45309 100%)',
          border: '1px solid #78350f',
          boxShadow: '0 1px 4px rgba(0,0,0,0.6)',
          zIndex: 5
        }} />

        {/* Glass reflection glare */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.06) 70%, transparent 100%)',
          borderRadius: '60px 60px 0 0',
          pointerEvents: 'none'
        }} />
      </div>

      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <div style={{ fontSize: '0.68rem', color: '#a1a1aa', fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: color, fontFamily: 'monospace' }}>
          {pressure.toFixed(maxPressure <= 2 ? 2 : 1)} <span style={{ fontSize: '0.72rem' }}>{unit}</span>
        </div>
      </div>
    </div>
  );
};

// 9. Illuminated Rocker Power Switch
const IlluminatedRockerSwitch = ({ isOn = true, onToggle, label = 'POWER' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', userSelect: 'none' }}>
    <div
      onClick={onToggle}
      style={{
        width: '32px',
        height: '46px',
        background: '#09090b',
        border: '2px solid #3f3f46',
        borderRadius: '5px',
        padding: '2px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), 0 2px 5px rgba(0,0,0,0.5)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{
        flex: 1,
        background: isOn ? 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)' : '#27272a',
        borderRadius: '3px 3px 1px 1px',
        boxShadow: isOn ? '0 0 10px rgba(239, 68, 68, 0.8), inset 0 1px 2px rgba(255,255,255,0.5)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        fontWeight: 900,
        color: '#ffffff'
      }}>
        I
      </div>
      <div style={{
        flex: 1,
        background: !isOn ? 'linear-gradient(180deg, #71717a 0%, #3f3f46 100%)' : '#18181b',
        borderRadius: '1px 1px 3px 3px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        fontWeight: 900,
        color: !isOn ? '#ffffff' : '#52525b'
      }}>
        O
      </div>
    </div>
    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#a1a1aa' }}>{label}</span>
  </div>
);


// =========================================================================
// 1. REALISTIC PANEL MESIN LAS SMAW / MMA INVERTER (PRO-ARC 250i)
// =========================================================================
export const SMAWMachinePanel = ({
  plateThickness = '6mm',
  onSelectThickness,
  amperage = 115,
  onChangeAmperage,
  arcForce = 60,
  onChangeArcForce,
  hotStart = 60,
  onChangeHotStart,
  electrode = 'E7016-LB',
  onChangeElectrode,
  electrodeDiameter = 3.2,
  onChangeElectrodeDiameter,
  polarity = 'DCEP',
  onChangePolarity,
  vrd = true,
  onToggleVrd,
  onApplyWpsPreset
}) => {
  const [powerOn, setPowerOn] = useState(true);
  const wps = WELDING_WPS_DATABASE.SMAW[plateThickness] || WELDING_WPS_DATABASE.SMAW['6mm'];
  
  // Real-time parameter assessment
  let statusBadge = { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: '✅ PARAMETER OPTIMAL (SESUAI WPS)' };
  if (amperage > wps.currentRange[1]) {
    statusBadge = { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '⚠️ ARUS TERLALU TINGGI! Risiko Undercut & Burn Through' };
  } else if (amperage < wps.currentRange[0]) {
    statusBadge = { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '⚠️ ARUS TERLALU RENDAH! Risiko Penetrasi Dangkal (Lack of Penetration)' };
  }

  const estimatedVoltage = (20 + 0.04 * amperage).toFixed(1);

  return (
    <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto', position: 'relative' }}>
      {/* Heavy Industrial Arched Carrying Handle */}
      <TopMachineHandle width="240px" />

      {/* Main Machine Casing / Front Fascia */}
      <div style={{
        background: 'linear-gradient(165deg, #27272a 0%, #18181b 30%, #09090b 100%)',
        borderRadius: '16px',
        border: '3px solid #ea580c', // Industrial Safety Orange Bezel
        boxShadow: '0 16px 40px rgba(0,0,0,0.8), inset 0 2px 3px rgba(255,255,255,0.15)',
        color: '#f4f4f5',
        padding: '22px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 4 Corner Protective Rubber Armor Bumpers */}
        <MachineCornerBumper position="top-left" />
        <MachineCornerBumper position="top-right" />
        <MachineCornerBumper position="bottom-left" />
        <MachineCornerBumper position="bottom-right" />

        {/* MACHINE HEADER & NAMEPLATE */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #ea580c',
          paddingBottom: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(234, 88, 12, 0.7)'
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '1px', color: '#f97316' }}>
                VMLAB INVERTEC 250-PRO
              </div>
              <div style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 700 }}>
                DIGITAL IGBT INVERTER MMA / SMAW POWER SOURCE • EN 60974-1 • IP23S
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => { sound.playClick(); onApplyWpsPreset && onApplyWpsPreset(); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #ea580c',
                background: 'rgba(234, 88, 12, 0.2)',
                color: '#f97316',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>✨</span>
              <span>AUTO-SET WPS</span>
            </button>

            {/* Illuminated Power Rocker */}
            <IlluminatedRockerSwitch isOn={powerOn} onToggle={() => { sound.playClick(); setPowerOn(!powerOn); }} />
          </div>
        </div>

        {/* THICKNESS QUICK SELECTOR BAR */}
        <div style={{ marginBottom: '18px', background: '#09090b', padding: '10px 14px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📏</span> BENDA KERJA (TEBAL PLAT):
            </span>
            <span style={{ fontSize: '0.74rem', color: '#f97316', fontWeight: 800 }}>
              {wps.plateName}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {['2mm', '4mm', '6mm', '8mm', '10mm', '12mm'].map(thick => {
              const isSel = plateThickness === thick;
              return (
                <button
                  key={thick}
                  onClick={() => { sound.playClick(); onSelectThickness && onSelectThickness(thick); }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: isSel ? '2px solid #ea580c' : '1px solid #3f3f46',
                    background: isSel ? '#ea580c' : '#18181b',
                    color: isSel ? '#ffffff' : '#a1a1aa',
                    fontWeight: 900,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {thick} {thick === '6mm' ? '★' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTROL PANEL DASHBOARD (RECESSED FACEPLATE) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '16px',
          background: '#121215',
          padding: '16px',
          borderRadius: '14px',
          border: '1.5px solid #27272a'
        }}>
          {/* LEFT: RECESSED ACRYLIC LED DIGITAL MONITOR & ROTARY DIALS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* SMOKED ACRYLIC METER WINDOW */}
            <div style={{
              background: '#050507',
              border: '2px solid #3f3f46',
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.9), 0 2px 4px rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Scanline overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px)',
                pointerEvents: 'none'
              }} />

              {/* Status Annunciator LEDs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: powerOn ? '#22c55e' : '#3f3f46', boxShadow: powerOn ? '0 0 8px #22c55e' : 'none' }} />
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8' }}>PWR</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: vrd ? '#22c55e' : '#3f3f46', boxShadow: vrd ? '0 0 8px #22c55e' : 'none' }} />
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94a3b8' }}>VRD</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: amperage > 180 ? '#ef4444' : '#3f3f46', boxShadow: amperage > 180 ? '0 0 8px #ef4444' : 'none' }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: amperage > 180 ? '#ef4444' : '#94a3b8' }}>TEMP/FAULT</span>
                </div>
              </div>

              {/* 7-Segment LED Displays */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#a1a1aa', fontWeight: 700 }}>AMPERAGE (CURRENT)</div>
                  <div style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 900, color: powerOn ? '#f97316' : '#27272a', textShadow: powerOn ? '0 0 14px rgba(249, 115, 22, 0.7)' : 'none', letterSpacing: '2px' }}>
                    {powerOn ? String(amperage).padStart(3, ' ') : '---'}
                    <span style={{ fontSize: '1.1rem', marginLeft: '4px', color: '#71717a' }}>A</span>
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid #27272a', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '0.65rem', color: '#a1a1aa', fontWeight: 700 }}>VOLTAGE ESTIMATE</div>
                  <div style={{ fontSize: '1.8rem', fontFamily: 'monospace', fontWeight: 900, color: powerOn ? '#38bdf8' : '#27272a', textShadow: powerOn ? '0 0 10px rgba(56, 189, 248, 0.6)' : 'none' }}>
                    {powerOn ? estimatedVoltage : '--.-'}
                    <span style={{ fontSize: '0.9rem', marginLeft: '3px', color: '#64748b' }}>V</span>
                  </div>
                </div>
              </div>
            </div>

            {/* THREE ROTARY POTENTIOMETER DIALS */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', background: '#09090b', padding: '14px 10px', borderRadius: '12px', border: '1px solid #27272a' }}>
              {/* MAIN CURRENT KNOB (BIGGER) */}
              <PhysicalRotaryKnob
                value={amperage}
                min={30}
                max={250}
                label="ARUS PENGELASAN"
                unit="A"
                onChange={onChangeAmperage}
                color="#f97316"
                size={74}
                marks={['30', '80', '140', '190', '250']}
                step={1}
              />

              {/* ARC FORCE KNOB */}
              <PhysicalRotaryKnob
                value={arcForce}
                min={0}
                max={100}
                label="ARC FORCE"
                unit="%"
                onChange={onChangeArcForce}
                color="#eab308"
                size={54}
                marks={['0', '50', '100']}
                step={5}
              />

              {/* HOT START KNOB */}
              <PhysicalRotaryKnob
                value={hotStart}
                min={0}
                max={100}
                label="HOT START"
                unit="%"
                onChange={onChangeHotStart}
                color="#10b981"
                size={54}
                marks={['0', '50', '100']}
                step={5}
              />
            </div>
          </div>

          {/* RIGHT: ELECTRODES, POLARITY & DINSE CAM-LOCK TERMINALS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* ELECTRODE SELECTION BUTTONS */}
            <div style={{ background: '#09090b', padding: '12px 14px', borderRadius: '12px', border: '1px solid #27272a' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a1a1aa', marginBottom: '8px' }}>
                🏷️ JENIS & SPESIFIKASI ELEKTRODA (SMAW):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                {[
                  { id: 'E6013-RB', name: 'RB-26 (E6013)', desc: 'Titania / Plat Tipis' },
                  { id: 'E6013-RD', name: 'RD-460 (E6013)', desc: 'Rutil / Stabil' },
                  { id: 'E7016-LB', name: 'LB-52 (E7016)', desc: 'Low Hydrogen' },
                  { id: 'E7018', name: 'E7018', desc: 'Heavy Structural' }
                ].map(el => (
                  <button
                    key={el.id}
                    onClick={() => { sound.playClick(); onChangeElectrode && onChangeElectrode(el.id); }}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '8px',
                      border: electrode === el.id ? '2px solid #f97316' : '1px solid #3f3f46',
                      background: electrode === el.id ? 'rgba(234, 88, 12, 0.25)' : '#18181b',
                      color: electrode === el.id ? '#ffffff' : '#a1a1aa',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>{el.name}</div>
                    <div style={{ fontSize: '0.62rem', color: electrode === el.id ? '#fdba74' : '#71717a' }}>{el.desc}</div>
                  </button>
                ))}
              </div>

              {/* DIAMETER SELECTOR */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 700 }}>DIAMETER KAWAT:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[2.0, 2.6, 3.2, 4.0].map(dia => (
                    <button
                      key={dia}
                      onClick={() => { sound.playClick(); onChangeElectrodeDiameter && onChangeElectrodeDiameter(dia); }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: electrodeDiameter === dia ? '1.5px solid #f97316' : '1px solid #3f3f46',
                        background: electrodeDiameter === dia ? '#ea580c' : '#18181b',
                        color: electrodeDiameter === dia ? '#ffffff' : '#a1a1aa',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Ø{dia}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DINSE HIGH CURRENT TERMINALS WITH POLARITY SWAP */}
            <div style={{ background: '#09090b', padding: '12px 14px', borderRadius: '12px', border: '1px solid #27272a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a1a1aa' }}>
                  🔌 KONEKTOR CAM-LOCK TERMINAL DINSE:
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => { sound.playClick(); onChangePolarity && onChangePolarity('DCEP'); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: polarity === 'DCEP' ? '1.5px solid #22c55e' : '1px solid #3f3f46',
                      background: polarity === 'DCEP' ? 'rgba(34, 197, 94, 0.2)' : '#18181b',
                      color: polarity === 'DCEP' ? '#22c55e' : '#a1a1aa',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    DCEP (DC+)
                  </button>
                  <button
                    onClick={() => { sound.playClick(); onChangePolarity && onChangePolarity('DCEN'); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: polarity === 'DCEN' ? '1.5px solid #38bdf8' : '1px solid #3f3f46',
                      background: polarity === 'DCEN' ? 'rgba(56, 189, 248, 0.2)' : '#18181b',
                      color: polarity === 'DCEN' ? '#38bdf8' : '#a1a1aa',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    DCEN (DC-)
                  </button>
                </div>
              </div>

              {/* Connected Terminals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <DinseCamLockTerminal
                  polaritySign="+"
                  isTorch={polarity === 'DCEP'}
                  cableColor="#ef4444"
                />
                <DinseCamLockTerminal
                  polaritySign="-"
                  isTorch={polarity === 'DCEN'}
                  cableColor="#38bdf8"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LOUVERS & STATUS BANNER */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ width: '120px' }}>
            <VentilationGrille count={4} />
          </div>

          <div style={{
            flex: 1,
            background: statusBadge.bg,
            border: `1.5px solid ${statusBadge.color}`,
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            <div style={{ color: statusBadge.color, fontWeight: 800, fontSize: '0.78rem' }}>
              {statusBadge.text}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#d4d4d8' }}>
              {wps.notes}
            </div>
          </div>

          <div style={{ width: '120px' }}>
            <VentilationGrille count={4} />
          </div>
        </div>
      </div>
    </div>
  );
};


// =========================================================================
// 2. REALISTIC PANEL MESIN LAS MIG / MAG (SYN-MIG 350 PRO)
// =========================================================================
export const MIGMachinePanel = ({
  plateThickness = '6mm',
  onSelectThickness,
  voltage = 22.0,
  onChangeVoltage,
  wireFeedSpeed = 7.8,
  onChangeWfs,
  wireDiameter = 1.0,
  onChangeWireDiameter,
  shieldingGas = 'Ar + 20% CO2',
  onChangeShieldingGas,
  gasFlow = 15,
  onChangeGasFlow,
  inductance = 5,
  onChangeInductance,
  triggerMode = '2T',
  onChangeTriggerMode,
  onApplyWpsPreset
}) => {
  const [powerOn, setPowerOn] = useState(true);
  const wps = WELDING_WPS_DATABASE.MIG[plateThickness] || WELDING_WPS_DATABASE.MIG['6mm'];
  const diaFactor = wireDiameter === 0.8 ? 16 : wireDiameter === 1.0 ? 21 : 28;
  const estimatedAmps = Math.round(wireFeedSpeed * diaFactor);

  let statusBadge = { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: '✅ PARAMETER MIG OPTIMAL (STABLE SHORT/SPRAY ARC)' };
  if (gasFlow < 10) {
    statusBadge = { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '⚠️ GAS FLOW TERLALU RENDAH (<10 L/min)! Resiko Porosity Parah' };
  } else if (gasFlow > 22) {
    statusBadge = { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '⚠️ GAS FLOW TURBULEN (>22 L/min)! Menarik udara luar masuk kawah' };
  } else if (voltage > wps.voltageRange[1]) {
    statusBadge = { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '⚠️ TEGANGAN TERLALU TINGGI! Busur melebar & rawan undercut' };
  } else if (voltage < wps.voltageRange[0]) {
    statusBadge = { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '⚠️ TEGANGAN TERLALU RENDAH! Kawat menabrak plat (stubbing & lack of fusion)' };
  }

  return (
    <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto', position: 'relative' }}>
      {/* Heavy Lifting Brackets on Top */}
      <TopMachineHandle color="#38bdf8" width="280px" />

      {/* Main Industrial MIG Cabinet Fascia */}
      <div style={{
        background: 'linear-gradient(165deg, #0f172a 0%, #1e1b4b 40%, #09090b 100%)',
        borderRadius: '16px',
        border: '3px solid #0284c7', // Industrial Miller Blue Bezel
        boxShadow: '0 16px 40px rgba(0,0,0,0.85), inset 0 2px 3px rgba(255,255,255,0.15)',
        color: '#f4f4f5',
        padding: '22px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Protective Rubber Corner Bumpers */}
        <MachineCornerBumper position="top-left" />
        <MachineCornerBumper position="top-right" />
        <MachineCornerBumper position="bottom-left" />
        <MachineCornerBumper position="bottom-right" />

        {/* HEADER & NAMEPLATE */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #0284c7',
          paddingBottom: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(2, 132, 199, 0.7)'
            }}>
              🌀
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '1px', color: '#38bdf8' }}>
                VMLAB SYN-MIG 350 PRO
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                SYNERGIC GMAW / FCAW COMPACT POWER SOURCE • 4-ROLL DRIVE FEETER
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => { sound.playClick(); onApplyWpsPreset && onApplyWpsPreset(); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #38bdf8',
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>✨</span>
              <span>AUTO-SET SYNERGIC (WPS)</span>
            </button>

            {/* 2T / 4T Trigger Mode Rocker */}
            <div style={{ display: 'flex', background: '#020617', padding: '3px', borderRadius: '6px', border: '1px solid #334155' }}>
              {['2T', '4T'].map(m => (
                <button
                  key={m}
                  onClick={() => { sound.playClick(); onChangeTriggerMode && onChangeTriggerMode(m); }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: triggerMode === m ? '#0284c7' : 'transparent',
                    color: triggerMode === m ? '#ffffff' : '#94a3b8',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            <IlluminatedRockerSwitch isOn={powerOn} onToggle={() => { sound.playClick(); setPowerOn(!powerOn); }} />
          </div>
        </div>

        {/* THICKNESS QUICK SELECTOR */}
        <div style={{ marginBottom: '18px', background: '#020617', padding: '10px 14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📏</span> TEBAL PLAT BENDA KERJA:
            </span>
            <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800 }}>
              {wps.plateName}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {['2mm', '4mm', '6mm', '8mm', '10mm', '12mm'].map(thick => {
              const isSel = plateThickness === thick;
              return (
                <button
                  key={thick}
                  onClick={() => { sound.playClick(); onSelectThickness && onSelectThickness(thick); }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: isSel ? '2px solid #38bdf8' : '1px solid #1e293b',
                    background: isSel ? '#0284c7' : '#0f172a',
                    color: isSel ? '#ffffff' : '#94a3b8',
                    fontWeight: 900,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {thick} {thick === '6mm' ? '★' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* RECESSED CONTROL FACEPLATE */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '16px',
          background: '#090d16',
          padding: '16px',
          borderRadius: '14px',
          border: '1.5px solid #1e293b'
        }}>
          {/* LEFT: DUAL DIGITAL LED METERS & DIAL KNOBS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* DUAL DISPLAY ACRYLIC WINDOW */}
            <div style={{
              background: '#020617',
              border: '2px solid #1e293b',
              borderRadius: '10px',
              padding: '12px 16px',
              boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.95)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Scanline overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 2px, transparent 2px, transparent 4px)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* VOLTAGE DISPLAY (CYAN/GREEN) */}
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>TEGANGAN LAS (VOLTS)</div>
                  <div style={{ fontSize: '2.4rem', fontFamily: 'monospace', fontWeight: 900, color: powerOn ? '#38bdf8' : '#1e293b', textShadow: powerOn ? '0 0 12px rgba(56, 189, 248, 0.7)' : 'none' }}>
                    {powerOn ? voltage.toFixed(1) : '--.-'}
                    <span style={{ fontSize: '1rem', marginLeft: '3px', color: '#64748b' }}>V</span>
                  </div>
                </div>

                {/* WIRE FEED SPEED DISPLAY (GREEN) */}
                <div style={{ borderLeft: '1px solid #1e293b', paddingLeft: '14px' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>WIRE SPEED / ARUS</div>
                  <div style={{ fontSize: '2.4rem', fontFamily: 'monospace', fontWeight: 900, color: powerOn ? '#4ade80' : '#1e293b', textShadow: powerOn ? '0 0 12px rgba(74, 222, 128, 0.7)' : 'none' }}>
                    {powerOn ? wireFeedSpeed.toFixed(1) : '--.-'}
                    <span style={{ fontSize: '0.8rem', marginLeft: '3px', color: '#64748b' }}>m/m</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 700 }}>
                    ~{estimatedAmps} Ampere
                  </div>
                </div>
              </div>
            </div>

            {/* THREE ROTARY POTENTIOMETERS */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', background: '#020617', padding: '14px 10px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <PhysicalRotaryKnob
                value={voltage}
                min={14}
                max={32}
                label="VOLTAGE (V)"
                unit="V"
                onChange={onChangeVoltage}
                color="#38bdf8"
                size={70}
                marks={['14', '18', '23', '28', '32']}
                step={0.1}
              />

              <PhysicalRotaryKnob
                value={wireFeedSpeed}
                min={2.0}
                max={16.0}
                label="WIRE SPEED"
                unit="m/m"
                onChange={onChangeWfs}
                color="#4ade80"
                size={70}
                marks={['2', '6', '10', '16']}
                step={0.1}
              />

              <PhysicalRotaryKnob
                value={inductance}
                min={1}
                max={10}
                label="INDUCTANCE"
                unit="lvl"
                onChange={onChangeInductance}
                color="#f59e0b"
                size={54}
                marks={['Soft', 'Mid', 'Crisp']}
                step={1}
              />
            </div>
          </div>

          {/* RIGHT: GAS FLOWMETER, WIRE & CENTRAL EURO-CONNECTOR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* ROTAMETER GAS FLOWMETER */}
            <RotameterGasFlowmeter
              flow={gasFlow}
              onChange={onChangeGasFlow}
              min={5}
              max={25}
            />

            {/* WIRE DIAMETER & GAS TYPE */}
            <div style={{ background: '#020617', padding: '12px 14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px', marginBottom: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, marginBottom: '4px' }}>
                    DIAMETER KAWAT (ER70S-6):
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0.8, 1.0, 1.2].map(dia => (
                      <button
                        key={dia}
                        onClick={() => { sound.playClick(); onChangeWireDiameter && onChangeWireDiameter(dia); }}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          borderRadius: '6px',
                          border: wireDiameter === dia ? '1.5px solid #38bdf8' : '1px solid #334155',
                          background: wireDiameter === dia ? '#0284c7' : '#0f172a',
                          color: wireDiameter === dia ? '#ffffff' : '#94a3b8',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        Ø{dia}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, marginBottom: '4px' }}>
                    GAS PELINDUNG:
                  </label>
                  <select
                    value={shieldingGas}
                    onChange={(e) => onChangeShieldingGas && onChangeShieldingGas(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      color: '#ffffff',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 700
                    }}
                  >
                    <option value="Ar + 20% CO2">Ar + 20% CO2 (Mix Standar)</option>
                    <option value="100% CO2">100% CO2 (Penetrasi)</option>
                    <option value="Pure Argon">Pure Argon 100%</option>
                  </select>
                </div>
              </div>

              {/* Push Buttons: Inch Wire & Gas Purge */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { sound.playClick(); sound.playSuccess(); }}
                  style={{
                    flex: 1, padding: '6px', borderRadius: '6px',
                    border: '1px solid #475569', background: '#1e293b', color: '#e2e8f0',
                    fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                  title="Feed wire through torch without arc"
                >
                  <span>🔘</span> INCH WIRE
                </button>
                <button
                  onClick={() => { sound.playClick(); sound.playSuccess(); }}
                  style={{
                    flex: 1, padding: '6px', borderRadius: '6px',
                    border: '1px solid #475569', background: '#1e293b', color: '#e2e8f0',
                    fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                  title="Check shielding gas flow through nozzle"
                >
                  <span>💨</span> GAS PURGE
                </button>
              </div>
            </div>

            {/* EURO-CONNECTOR TORCH RECEPTACLE */}
            <EuroConnectorVisual />
          </div>
        </div>

        {/* BOTTOM STATUS & COOLING LOUVERS */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ width: '120px' }}>
            <VentilationGrille count={4} />
          </div>

          <div style={{
            flex: 1,
            background: statusBadge.bg,
            border: `1.5px solid ${statusBadge.color}`,
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            <div style={{ color: statusBadge.color, fontWeight: 800, fontSize: '0.78rem' }}>
              {statusBadge.text}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#d4d4d8' }}>
              {wps.notes}
            </div>
          </div>

          <div style={{ width: '120px' }}>
            <VentilationGrille count={4} />
          </div>
        </div>
      </div>
    </div>
  );
};


// =========================================================================
// 3. REALISTIC PANEL STASIUN LAS OAW (OKSIGEN-ASETILIN)
// =========================================================================
export const OAWMachinePanel = ({
  plateThickness = '4mm',
  onSelectThickness,
  oxygenPressure = 2.0,
  onChangeOxygenPressure,
  acetylenePressure = 0.4,
  onChangeAcetylenePressure,
  oxygenValve = 50,
  onChangeOxygenValve,
  acetyleneValve = 50,
  onChangeAcetyleneValve,
  nozzleSize = '#2',
  onChangeNozzleSize,
  fillerDiameter = 2.4,
  onChangeFillerDiameter,
  onApplyWpsPreset
}) => {
  const wps = WELDING_WPS_DATABASE.OAW[plateThickness] || WELDING_WPS_DATABASE.OAW['4mm'];

  // Flame type evaluation
  let flameType = 'neutral';
  let flameColor = '#38bdf8';
  let flameTitle = 'NYALA NETRAL (NEUTRAL FLAME)';
  let flameDesc = 'Pembakaran seimbang sempurna (O2 : C2H2 = 1.1 : 1). Suhu ~3.150°C. Cocok untuk semua pengelasan baja karbon.';

  if (acetyleneValve > oxygenValve + 10) {
    flameType = 'carburizing';
    flameColor = '#d946ef';
    flameTitle = 'NYALA KARBURASI (CARBURIZING FLAME)';
    flameDesc = 'Kelebihan gas asetilin. Terdapat 3 zona nyala (inti, lidah karburasi ungu, selubung). Menambah karbon pada logam las sehingga getas.';
  } else if (oxygenValve > acetyleneValve + 10) {
    flameType = 'oxidizing';
    flameColor = '#f43f5e';
    flameTitle = 'NYALA OKSIDASI (OXIDIZING FLAME)';
    flameDesc = 'Kelebihan gas oksigen. Inti kerucut runcing bersuara desis keras. Mengoksidasi logam cair hingga berbuih, berpori, dan rapuh.';
  }

  return (
    <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto', position: 'relative' }}>
      {/* Wall / Trolley Cylinder Bracket Top */}
      <TopMachineHandle color="#ef4444" width="260px" />

      {/* Main OAW Dual Station Console */}
      <div style={{
        background: 'linear-gradient(165deg, #1c1917 0%, #292524 35%, #0c0a09 100%)',
        borderRadius: '16px',
        border: '3px solid #dc2626', // Industrial Red / Brass Border
        boxShadow: '0 16px 40px rgba(0,0,0,0.85), inset 0 2px 3px rgba(255,255,255,0.15)',
        color: '#f4f4f5',
        padding: '22px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <MachineCornerBumper position="top-left" />
        <MachineCornerBumper position="top-right" />
        <MachineCornerBumper position="bottom-left" />
        <MachineCornerBumper position="bottom-right" />

        {/* HEADER & NAMEPLATE */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #dc2626',
          paddingBottom: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 50%, #dc2626 50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 900,
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(220, 38, 38, 0.7)'
            }}>
              🔥
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '1px', color: '#f87171' }}>
                VMLAB OXY-ACETYLENE STATION
              </div>
              <div style={{ fontSize: '0.7rem', color: '#a8a29e', fontWeight: 700 }}>
                DUAL-STAGE CYLINDER REGULATORS, SAFETY FLASHBACK ARRESTORS & INJECTOR TORCH
              </div>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onApplyWpsPreset && onApplyWpsPreset(); }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #ef4444',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>✨</span>
            <span>SETEL NYALA NETRAL (WPS)</span>
          </button>
        </div>

        {/* THICKNESS QUICK SELECTOR */}
        <div style={{ marginBottom: '18px', background: '#0c0a09', padding: '10px 14px', borderRadius: '12px', border: '1px solid #292524' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#e7e5e4', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📏</span> TEBAL PLAT BENDA KERJA:
            </span>
            <span style={{ fontSize: '0.74rem', color: '#f87171', fontWeight: 800 }}>
              {wps.plateName}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {['2mm', '4mm', '6mm', '8mm', '10mm', '12mm'].map(thick => {
              const isSel = plateThickness === thick;
              return (
                <button
                  key={thick}
                  onClick={() => { sound.playClick(); onSelectThickness && onSelectThickness(thick); }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: isSel ? '2px solid #ef4444' : '1px solid #292524',
                    background: isSel ? '#dc2626' : '#1c1917',
                    color: isSel ? '#ffffff' : '#a8a29e',
                    fontWeight: 900,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {thick} {thick === '4mm' ? '★' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* RECESSED STATION CONTROL MANIFOLD */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '16px',
          background: '#141211',
          padding: '16px',
          borderRadius: '14px',
          border: '1.5px solid #292524'
        }}>
          {/* LEFT: SOLID BRASS REGULATORS WITH ANALOG MANOMETERS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* OXYGEN REGULATOR (BLUE) */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(2, 132, 199, 0.12) 0%, #0c0a09 100%)',
                padding: '14px 10px',
                borderRadius: '12px',
                border: '2px solid #0284c7',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 900, marginBottom: '6px', textAlign: 'center' }}>
                  TABUNG O₂ (OKSIGEN)
                </div>
                
                <AnalogManometerGauge
                  pressure={oxygenPressure}
                  maxPressure={6.0}
                  unit="bar"
                  title="TEKANAN TORCH"
                  color="#0284c7"
                  size={106}
                />

                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={oxygenPressure}
                  onChange={(e) => onChangeOxygenPressure && onChangeOxygenPressure(Number(e.target.value))}
                  style={{ width: '85%', accentColor: '#0284c7', cursor: 'pointer', marginTop: '10px' }}
                />
                <span style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '4px' }}>WPS: {wps.oxygenPressure} bar</span>
              </div>

              {/* ACETYLENE REGULATOR (RED) */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(220, 38, 38, 0.12) 0%, #0c0a09 100%)',
                padding: '14px 10px',
                borderRadius: '12px',
                border: '2px solid #dc2626',
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '0.74rem', color: '#f87171', fontWeight: 900, marginBottom: '6px', textAlign: 'center' }}>
                  TABUNG C₂H₂ (ASETILIN)
                </div>

                <AnalogManometerGauge
                  pressure={acetylenePressure}
                  maxPressure={1.5}
                  unit="bar"
                  title="TEKANAN TORCH"
                  color="#ef4444"
                  dangerAbove={1.0}
                  size={106}
                />

                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.05"
                  value={acetylenePressure}
                  onChange={(e) => onChangeAcetylenePressure && onChangeAcetylenePressure(Number(e.target.value))}
                  style={{ width: '85%', accentColor: '#ef4444', cursor: 'pointer', marginTop: '10px' }}
                />
                <span style={{ fontSize: '0.64rem', color: '#ef4444', fontWeight: 800, marginTop: '4px' }}>⚠️ Max Safe: 1.0 bar</span>
              </div>
            </div>

            {/* NOZZLE TIP & FILLER ROD */}
            <div style={{ background: '#0c0a09', padding: '12px 14px', borderRadius: '12px', border: '1px solid #292524' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#a8a29e', fontWeight: 800, marginBottom: '4px' }}>
                    UKURAN NOZZLE TIP (COPPER):
                  </label>
                  <select
                    value={nozzleSize}
                    onChange={(e) => onChangeNozzleSize && onChangeNozzleSize(e.target.value)}
                    style={{ width: '100%', background: '#1c1917', color: '#ffffff', border: '1px solid #44403c', borderRadius: '6px', padding: '6px', fontSize: '0.74rem' }}
                  >
                    <option value="#1">Tip #1 (Ø0.8mm - Plat 1-2mm)</option>
                    <option value="#2">Tip #2 (Ø1.2mm - Plat 2-4mm)</option>
                    <option value="#3">Tip #3 (Ø1.6mm - Plat 4-6mm)</option>
                    <option value="#4">Tip #4 (Ø2.0mm - Plat 6-8mm)</option>
                    <option value="#5">Tip #5 (Ø2.4mm - Plat 8-12mm)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#a8a29e', fontWeight: 800, marginBottom: '4px' }}>
                    KAWAT TAMBAH (FILLER RG):
                  </label>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[1.6, 2.4, 3.2, 4.0].map(fd => (
                      <button
                        key={fd}
                        onClick={() => { sound.playClick(); onChangeFillerDiameter && onChangeFillerDiameter(fd); }}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          borderRadius: '6px',
                          border: fillerDiameter === fd ? '1.5px solid #ef4444' : '1px solid #44403c',
                          background: fillerDiameter === fd ? '#dc2626' : '#1c1917',
                          color: fillerDiameter === fd ? '#ffffff' : '#a8a29e',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        Ø{fd}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TORCH BLENDER HANDWHEELS & LIVE FLAME PREVIEW */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* TORCH NEEDLE VALVES */}
            <div style={{ background: '#0c0a09', padding: '14px', borderRadius: '12px', border: '1px solid #292524' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a8a29e', marginBottom: '12px', textTransform: 'uppercase' }}>
                🪛 KATUP JARUM TORCH BLENDER LAS:
              </div>

              {/* ROTARY DIALS FOR O2 & C2H2 VALVES */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '14px' }}>
                <PhysicalRotaryKnob
                  value={oxygenValve}
                  min={0}
                  max={100}
                  label="KATUP OKSIGEN (O₂)"
                  unit="%"
                  onChange={onChangeOxygenValve}
                  color="#0284c7"
                  size={64}
                  marks={['0', '50', '100']}
                  step={1}
                />

                {/* Brass Blowpipe Graphic in between */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '60px', background: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)', borderRadius: '4px', border: '1px solid #f59e0b' }} />
                  <span style={{ fontSize: '0.62rem', color: '#d97706', fontWeight: 800, marginTop: '4px' }}>INJECTOR</span>
                </div>

                <PhysicalRotaryKnob
                  value={acetyleneValve}
                  min={0}
                  max={100}
                  label="KATUP ASETILIN (C₂H₂)"
                  unit="%"
                  onChange={onChangeAcetyleneValve}
                  color="#ef4444"
                  size={64}
                  marks={['0', '50', '100']}
                  step={1}
                />
              </div>
            </div>

            {/* REAL-TIME ACTIVE FLAME JET PREVIEW */}
            <div style={{
              background: '#050404',
              borderRadius: '12px',
              border: `2px solid ${flameColor}`,
              padding: '16px',
              boxShadow: `0 0 20px ${flameColor}33`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: flameColor, letterSpacing: '0.5px', marginBottom: '8px' }}>
                {flameTitle}
              </div>

              {/* Dynamic SVG Flame Art */}
              <div style={{ width: '100%', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="280" height="70" viewBox="0 0 280 70">
                  {/* Copper Torch Swaged Tip */}
                  <rect x="10" y="27" width="40" height="16" rx="2" fill="#b45309" stroke="#d97706" strokeWidth="1" />
                  <polygon points="50,29 64,32 64,38 50,41" fill="#d97706" />
                  <line x1="10" y1="35" x2="64" y2="35" stroke="#78350f" strokeWidth="2" />

                  {/* Outer Envelope Flame */}
                  <path
                    d={flameType === 'carburizing' ? 'M 64 35 Q 120 10 260 35 Q 120 60 64 35' : flameType === 'oxidizing' ? 'M 64 35 Q 110 16 200 35 Q 110 54 64 35' : 'M 64 35 Q 120 12 240 35 Q 120 58 64 35'}
                    fill={flameType === 'carburizing' ? 'rgba(219, 39, 119, 0.45)' : flameType === 'oxidizing' ? 'rgba(225, 29, 72, 0.5)' : 'rgba(59, 130, 246, 0.45)'}
                    filter="drop-shadow(0 0 8px rgba(255,255,255,0.4))"
                  />

                  {/* Intermediate Acetylene Feather (Only in Carburizing Flame) */}
                  {flameType === 'carburizing' && (
                    <path
                      d="M 64 35 Q 100 20 180 35 Q 100 50 64 35"
                      fill="rgba(147, 51, 234, 0.7)"
                    />
                  )}

                  {/* Inner Primary Cone (Inti Nyala) */}
                  <path
                    d={flameType === 'carburizing' ? 'M 64 35 Q 85 28 100 35 Q 85 42 64 35' : flameType === 'oxidizing' ? 'M 64 35 L 85 35' : 'M 64 35 Q 85 26 110 35 Q 85 44 64 35'}
                    fill="#ffffff"
                    stroke={flameType === 'oxidizing' ? '#9333ea' : '#fde047'}
                    strokeWidth={flameType === 'oxidizing' ? 3 : 1}
                    filter="drop-shadow(0 0 6px #ffffff)"
                  />
                </svg>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#d6d3d1', textAlign: 'center', marginTop: '6px' }}>
                {flameDesc}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM STATUS & COOLING LOUVERS */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ width: '120px' }}>
            <VentilationGrille count={4} />
          </div>

          <div style={{
            flex: 1,
            background: flameType === 'neutral' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1.5px solid ${flameType === 'neutral' ? '#10b981' : '#ef4444'}`,
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            <div style={{ color: flameType === 'neutral' ? '#10b981' : '#fca5a5', fontWeight: 800, fontSize: '0.78rem' }}>
              {flameType === 'neutral' ? '✅ NYALA NETRAL OPTIMAL (SIAP MENGELAS)' : '⚠️ NYALA API TIDAK SEIMBANG! Sesuaikan katup torch'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#d4d4d8' }}>
              {wps.notes}
            </div>
          </div>

          <div style={{ width: '120px' }}>
            <VentilationGrille count={4} />
          </div>
        </div>
      </div>
    </div>
  );
};

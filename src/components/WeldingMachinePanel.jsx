import React, { useState } from 'react';
import { sound } from '../utils/audio';

// =========================================================================
// DATABASE WPS (WELDING PROCEDURE SPECIFICATION) BERDASARKAN KETEBALAN PLAT
// Standar Industri AWS D1.1, ASME Section IX & ISO 9606
// =========================================================================
export const WELDING_WPS_DATABASE = {
  SMAW: {
    '2mm': {
      thicknessMm: 2,
      plateName: 'Plat Tipis (2.0 mm)',
      grooveType: 'Square Butt Joint (I-Groove)',
      rootGap: 1.0,
      recommendedElectrode: 'E6013-RB',
      recommendedDiameter: 2.0,
      currentRange: [45, 65],
      optimalCurrent: 55,
      optimalArcForce: 30,
      optimalHotStart: 40,
      polarity: 'DCEN',
      notes: 'Kawat Ø2.0mm arus rendah (55A) polaritas DCEN agar panas tidak terkonsentrasi di plat untuk mencegah jebol (burn-through).'
    },
    '4mm': {
      thicknessMm: 4,
      plateName: 'Plat Sedang (4.0 mm)',
      grooveType: 'Square Butt / Bevel 30°',
      rootGap: 1.5,
      recommendedElectrode: 'E6013-RD',
      recommendedDiameter: 2.6,
      currentRange: [75, 95],
      optimalCurrent: 85,
      optimalArcForce: 45,
      optimalHotStart: 50,
      polarity: 'DCEP',
      notes: 'Elektroda Ø2.6mm dengan arus ~85A DCEP. Penetrasi stabil dan manik halus.'
    },
    '6mm': {
      thicknessMm: 6,
      plateName: 'Plat Standar (6.0 mm)',
      grooveType: 'Single V-Groove (Bevel 60°)',
      rootGap: 2.0,
      recommendedElectrode: 'E7016-LB',
      recommendedDiameter: 3.2,
      currentRange: [100, 130],
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
      currentRange: [120, 145],
      optimalCurrent: 135,
      optimalArcForce: 65,
      optimalHotStart: 65,
      polarity: 'DCEP',
      notes: 'Wajib multi-pass (Root pass + Filler + Capping). Arus 135A menghasilkan fusi dinding kampuh yang sempurna.'
    },
    '10mm': {
      thicknessMm: 10,
      plateName: 'Plat Struktural (10.0 mm)',
      grooveType: 'Single V-Groove Root Face 2mm',
      rootGap: 2.5,
      recommendedElectrode: 'E7018',
      recommendedDiameter: 4.0,
      currentRange: [140, 175],
      optimalCurrent: 155,
      optimalArcForce: 75,
      optimalHotStart: 70,
      polarity: 'DCEP',
      notes: 'Kawat low-hydrogen E7018 Ø4.0mm arus 155A. Arc Force tinggi mencegah busur mati saat mengayun di kampuh dalam.'
    },
    '12mm': {
      thicknessMm: 12,
      plateName: 'Plat Ekstra Tebal (12.0 mm)',
      grooveType: 'Double V-Groove / Single V 60°',
      rootGap: 3.0,
      recommendedElectrode: 'E7018',
      recommendedDiameter: 4.0,
      currentRange: [160, 200],
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
      plateName: 'Plat Tipis (2.0 mm)',
      wireDiameter: 0.8,
      voltageRange: [16.0, 18.0],
      optimalVoltage: 17.0,
      wfsRange: [3.5, 5.0],
      optimalWfs: 4.2,
      gasFlowRange: [10, 14],
      optimalGasFlow: 12,
      optimalInductance: 3,
      recommendedGas: 'Ar + 20% CO2',
      notes: 'Mode Short Arc (tegangan 17V, kawat Ø0.8mm) meminimalkan heat input agar tidak terjadi burn through pada plat tipis.'
    },
    '4mm': {
      thicknessMm: 4,
      plateName: 'Plat Sedang (4.0 mm)',
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
      plateName: 'Plat Standar (6.0 mm)',
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
      plateName: 'Plat Struktural (10.0 mm)',
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
      plateName: 'Plat Ekstra Tebal (12.0 mm)',
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
  TIG: {
    '2mm': {
      thicknessMm: 2,
      plateName: 'Plat Tipis (2.0 mm)',
      tungstenType: 'EWTh-2 (Merah)',
      tungstenDiameter: 1.6,
      cupSize: '#5',
      currentRange: [45, 65],
      optimalCurrent: 55,
      gasFlow: 7,
      postFlow: 5.0,
      pulseFreq: 2.0,
      currentType: 'DCEN',
      fillerRod: 'ER70S-6 Ø1.6mm',
      notes: 'Tungsten runcing Ø1.6mm DCEN arus 55A. Post-flow 5 detik melindungi ujung tungsten dari oksidasi saat pendinginan.'
    },
    '4mm': {
      thicknessMm: 4,
      plateName: 'Plat Sedang (4.0 mm)',
      tungstenType: 'EWLa-1.5 (Emas)',
      tungstenDiameter: 2.4,
      cupSize: '#6',
      currentRange: [80, 110],
      optimalCurrent: 95,
      gasFlow: 9,
      postFlow: 6.5,
      pulseFreq: 1.5,
      currentType: 'DCEN',
      fillerRod: 'ER70S-6 Ø2.4mm',
      notes: 'Tungsten Ø2.4mm dengan arus 95A dan cup #6. Gas Argon murni 9 L/min menjamin kolam las cemerlang bebas kotoran.'
    },
    '6mm': {
      thicknessMm: 6,
      plateName: 'Plat Standar (6.0 mm)',
      tungstenType: 'EWLa-1.5 (Emas)',
      tungstenDiameter: 2.4,
      cupSize: '#7',
      currentRange: [120, 150],
      optimalCurrent: 135,
      gasFlow: 11,
      postFlow: 8.0,
      pulseFreq: 1.0,
      currentType: 'DCEN',
      fillerRod: 'ER70S-6 Ø2.4mm',
      notes: 'Standar uji sertifikasi TIG 6G pipa/plat. Arus 135A menghasilkan penetrasi akar sempurna (keyhole root pass).'
    },
    '8mm': {
      thicknessMm: 8,
      plateName: 'Plat Tebal Medium (8.0 mm)',
      tungstenType: 'EWTh-2 (Merah)',
      tungstenDiameter: 3.2,
      cupSize: '#8',
      currentRange: [145, 175],
      optimalCurrent: 160,
      gasFlow: 12,
      postFlow: 9.0,
      pulseFreq: 1.0,
      currentType: 'DCEN',
      fillerRod: 'ER70S-6 Ø3.2mm',
      notes: 'Tungsten Ø3.2mm arus 160A dengan teknik walking the cup. Multi-pass diperlukan untuk mengisi kampuh.'
    },
    '10mm': {
      thicknessMm: 10,
      plateName: 'Plat Struktural (10.0 mm)',
      tungstenType: 'EWTh-2 (Merah)',
      tungstenDiameter: 3.2,
      cupSize: '#8',
      currentRange: [170, 205],
      optimalCurrent: 185,
      gasFlow: 14,
      postFlow: 10.0,
      pulseFreq: 0.5,
      currentType: 'DCEN',
      fillerRod: 'ER70S-6 Ø3.2mm',
      notes: 'Khusus root pass presisi bejana tekan & pipa gas. Arus 185A dengan post-flow 10 detik agar kawah tidak retak.'
    },
    '12mm': {
      thicknessMm: 12,
      plateName: 'Plat Ekstra Tebal (12.0 mm)',
      tungstenType: 'EWTh-2 (Merah)',
      tungstenDiameter: 3.2,
      cupSize: '#8',
      currentRange: [190, 230],
      optimalCurrent: 210,
      gasFlow: 15,
      postFlow: 12.0,
      pulseFreq: 0.5,
      currentType: 'DCEN',
      fillerRod: 'ER70S-6 Ø3.2mm',
      notes: 'Aplikasi pipa boiler industri. Arus 210A dengan gas lens #8 untuk perlindungan laminar maksimal.'
    }
  },
  OAW: {
    '2mm': {
      thicknessMm: 2,
      plateName: 'Plat Tipis (2.0 mm)',
      nozzleSize: '#1',
      oxygenPressure: 1.5,
      acetylenePressure: 0.3,
      fillerDiameter: 1.6,
      optimalFlame: 'neutral',
      notes: 'Nozzle tip #1 dengan tekanan Oksigen 1.5 bar & Asetilin 0.3 bar. Kawat las tambah RG45 Ø1.6mm.'
    },
    '4mm': {
      thicknessMm: 4,
      plateName: 'Plat Sedang (4.0 mm)',
      nozzleSize: '#2',
      oxygenPressure: 2.0,
      acetylenePressure: 0.4,
      fillerDiameter: 2.4,
      optimalFlame: 'neutral',
      notes: 'Nozzle tip #2 dengan nyala netral (inti putih bulat). Kawat pengisi Ø2.4mm diayun membentuk kolam las.'
    },
    '6mm': {
      thicknessMm: 6,
      plateName: 'Plat Standar (6.0 mm)',
      nozzleSize: '#3',
      oxygenPressure: 2.5,
      acetylenePressure: 0.5,
      fillerDiameter: 3.2,
      optimalFlame: 'neutral',
      notes: 'Nozzle tip #3 tekanan O2 2.5 bar, C2H2 0.5 bar. Butuh pemanasan awal (preheating) pada awal sambungan.'
    },
    '8mm': {
      thicknessMm: 8,
      plateName: 'Plat Tebal Medium (8.0 mm)',
      nozzleSize: '#4',
      oxygenPressure: 3.0,
      acetylenePressure: 0.6,
      fillerDiameter: 4.0,
      optimalFlame: 'neutral',
      notes: 'Batas tebal praktis untuk las asetilin. Nozzle #4 panas tinggi dengan bevel kampuh V 60-70°.'
    },
    '10mm': {
      thicknessMm: 10,
      plateName: 'Plat Struktural (10.0 mm)',
      nozzleSize: '#5',
      oxygenPressure: 3.5,
      acetylenePressure: 0.7,
      fillerDiameter: 5.0,
      optimalFlame: 'neutral',
      notes: 'Pemanasan lambat dan zona terpengaruh panas (HAZ) sangat lebar. Di industri umumnya dialihkan ke SMAW/MIG/TIG.'
    },
    '12mm': {
      thicknessMm: 12,
      plateName: 'Plat Ekstra Tebal (12.0 mm)',
      nozzleSize: '#5',
      oxygenPressure: 3.8,
      acetylenePressure: 0.8,
      fillerDiameter: 5.0,
      optimalFlame: 'neutral',
      notes: 'Tebal maksimal OAW. Disarankan kampuh ganda dan multi-layer torch weaving.'
    }
  }
};

// =========================================================================
// REUSABLE COMPACT INDUSTRIAL HARDWARE COMPONENTS
// =========================================================================

// Molded Corner Protective Rubber Bumpers
const MachineCornerBumper = ({ position = 'top-left' }) => {
  const isTop = position.includes('top');
  const isLeft = position.includes('left');

  return (
    <div style={{
      position: 'absolute',
      [isTop ? 'top' : 'bottom']: '-3px',
      [isLeft ? 'left' : 'right']: '-3px',
      width: '18px',
      height: '18px',
      background: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
      border: '1.5px solid #52525b',
      borderRadius: isTop && isLeft ? '6px 2px 2px 2px' :
                    isTop && !isLeft ? '2px 6px 2px 2px' :
                    !isTop && isLeft ? '2px 2px 2px 6px' : '2px 2px 6px 2px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      pointerEvents: 'none'
    }}>
      <div style={{
        width: '6px',
        height: '6px',
        background: '#71717a',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ width: '3px', height: '3px', background: '#18181b', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
      </div>
    </div>
  );
};

// Compact Top Handle
const TopMachineHandle = ({ color = '#d4d4d8', width = '150px' }) => (
  <div style={{
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '-6px',
    position: 'relative',
    zIndex: 4,
    pointerEvents: 'none'
  }}>
    <div style={{
      width: width,
      height: '12px',
      background: 'linear-gradient(180deg, #52525b 0%, #27272a 60%, #18181b 100%)',
      borderRadius: '6px 6px 0 0',
      border: '1.5px solid #71717a',
      borderBottom: 'none',
      boxShadow: '0 -2px 6px rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '55%',
        height: '7px',
        background: 'repeating-linear-gradient(90deg, #18181b, #18181b 2px, #27272a 2px, #27272a 4px)',
        borderRadius: '3px',
        border: '1px solid #3f3f46'
      }} />
    </div>
  </div>
);

// Stamped Ventilation Louvers
const VentilationGrille = ({ count = 4, orientation = 'horizontal', width = '100%' }) => (
  <div style={{ width: width, display: 'flex', flexDirection: orientation === 'horizontal' ? 'column' : 'row', gap: '2px', opacity: 0.8 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          height: orientation === 'horizontal' ? '2.5px' : '16px',
          width: orientation === 'horizontal' ? '100%' : '2.5px',
          background: 'linear-gradient(180deg, #09090b 0%, #18181b 100%)',
          borderRadius: '1.5px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.9)'
        }}
      />
    ))}
  </div>
);

// Compact 3D Tactile Rotary Knob with Smooth Slider
const CompactRotaryKnob = ({
  value,
  min,
  max,
  label,
  unit,
  onChange,
  color = '#ea580c',
  size = 52,
  marks = [],
  step = 1
}) => {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -135 + pct * 270;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, margin: '6px 0' }}>
        {/* Dial Scale Tick Ring */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
          {marks.map((m, idx) => {
            const markPct = idx / (marks.length - 1);
            const markAngle = (-135 + markPct * 270) * (Math.PI / 180);
            const rOuter = size / 2 + 7;
            const rInner = size / 2 + 2;
            const cx = size / 2;
            const cy = size / 2;
            const x1 = cx + Math.cos(markAngle) * rInner;
            const y1 = cy + Math.sin(markAngle) * rInner;
            const x2 = cx + Math.cos(markAngle) * rOuter;
            const y2 = cy + Math.sin(markAngle) * rOuter;
            const tx = cx + Math.cos(markAngle) * (rOuter + 6);
            const ty = cy + Math.sin(markAngle) * (rOuter + 6);
            return (
              <g key={idx}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#71717a" strokeWidth="1.2" />
                <text x={tx} y={ty + 2.5} fill="#a1a1aa" fontSize="7" fontWeight="800" textAnchor="middle">{m}</text>
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
            boxShadow: '0 4px 10px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.3)',
            border: '1.5px solid #52525b',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${angle}deg)`,
            transition: 'transform 0.05s linear'
          }}
        >
          {/* Center Metal Cap */}
          <div style={{
            width: '66%',
            height: '66%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #71717a 0%, #27272a 80%)',
            border: '1px solid #3f3f46',
            position: 'relative'
          }}>
            {/* Pointer Notch Line */}
            <div style={{
              position: 'absolute',
              top: '3px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '2.5px',
              height: '38%',
              background: color,
              borderRadius: '2px',
              boxShadow: `0 0 5px ${color}`
            }} />
          </div>
        </div>
      </div>

      {/* Label and Value */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.92rem', fontWeight: 900, color: color, fontFamily: 'monospace' }}>
          {value} <span style={{ fontSize: '0.65rem', color: '#71717a' }}>{unit}</span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange && onChange(Number(e.target.value))}
        style={{ width: `${size + 16}px`, accentColor: color, cursor: 'pointer', height: '3px', marginTop: '2px' }}
      />
    </div>
  );
};

// Compact Dinse Terminal
const CompactDinseTerminal = ({ polaritySign, label, isTorch }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#09090b',
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #27272a'
  }}>
    <div style={{
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: polaritySign === '+' ? 'radial-gradient(circle, #b91c1c 40%, #18181b 90%)' : 'radial-gradient(circle, #27272a 40%, #09090b 90%)',
      border: polaritySign === '+' ? '1.5px solid #ef4444' : '1.5px solid #52525b',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '3px', height: '7px', background: '#451a03' }} />
      </div>
      <span style={{
        position: 'absolute', top: '-4px', right: '-4px', width: '13px', height: '13px',
        borderRadius: '50%', background: polaritySign === '+' ? '#ef4444' : '#38bdf8',
        color: '#ffffff', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {polaritySign}
      </span>
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: polaritySign === '+' ? '#fca5a5' : '#7dd3fc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.6rem', color: '#71717a' }}>
        {isTorch ? '👉 Stang Las / Torch' : '⚡ Klem Massa (Ground)'}
      </div>
    </div>
  </div>
);

// Compact Rotameter Gas Flowmeter
const CompactRotameter = ({ flow = 15, onChange, min = 5, max = 25 }) => {
  const ballPct = Math.max(0, Math.min(1, (flow - min) / (max - min)));
  const ballBottomPx = 6 + ballPct * 56;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: '#09090b',
      padding: '8px 10px',
      borderRadius: '10px',
      border: '1px solid #27272a'
    }}>
      <div style={{
        position: 'relative',
        width: '24px',
        height: '75px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(56,189,248,0.06) 50%, rgba(255,255,255,0.2) 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {[25, 20, 15, 10, 5].map((val, i) => (
          <div key={val} style={{ position: 'absolute', top: `${8 + i * 21}%`, width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
            <div style={{ width: '4px', height: '1px', background: '#38bdf8' }} />
            <span style={{ fontSize: '5.5px', color: '#94a3b8', fontWeight: 800 }}>{val}</span>
            <div style={{ width: '4px', height: '1px', background: '#38bdf8' }} />
          </div>
        ))}

        <div style={{
          position: 'absolute',
          bottom: `${ballBottomPx}px`,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 40%, #475569 90%)',
          boxShadow: '0 0 6px rgba(56, 189, 248, 0.8)',
          transition: 'bottom 0.15s ease-out'
        }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 800 }}>FLOWMETER (GAS)</div>
        <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}>
          {flow} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>L/min</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={flow}
          onChange={(e) => onChange && onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer', height: '3px' }}
        />
      </div>
    </div>
  );
};

// Compact Analog Manometer
const CompactAnalogManometer = ({ pressure = 0, maxPressure = 6.0, unit = 'bar', title = 'TEKANAN', color = '#0284c7', dangerAbove = null, size = 80 }) => {
  const clamped = Math.max(0, Math.min(maxPressure, pressure));
  const pct = clamped / maxPressure;
  const needleDeg = -135 + pct * 270;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f8fafc 55%, #cbd5e1 100%)',
        border: '3px solid #b45309',
        boxShadow: '0 4px 10px rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#cbd5e1" strokeWidth="3" />
          {dangerAbove && (
            <path d="M 50 12 A 38 38 0 0 1 85 62" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="3 2" />
          )}
          {[0, 0.5, 1].map((p, i) => {
            const a = (-135 + p * 270) * (Math.PI / 180);
            const val = (p * maxPressure).toFixed(maxPressure > 3 ? 0 : 1);
            const tx = 50 + Math.cos(a) * 26;
            const ty = 50 + Math.sin(a) * 26;
            return (
              <text key={i} x={tx} y={ty + 2.5} fill="#0f172a" fontSize="8" fontWeight="900" textAnchor="middle">{val}</text>
            );
          })}
          <text x="50" y="70" fill={color} fontSize="8" fontWeight="900" textAnchor="middle">{unit.toUpperCase()}</text>
        </svg>

        {/* Needle */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', top: 0, left: 0,
          transform: `rotate(${needleDeg}deg)`, transition: 'transform 0.15s ease-out',
          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
        }}>
          <div style={{ position: 'absolute', top: '15%', width: '1.8px', height: '35%', background: '#dc2626' }} />
        </div>

        <div style={{ position: 'relative', width: '9px', height: '9px', borderRadius: '50%', background: '#b45309', zIndex: 5 }} />
      </div>

      <div style={{ textAlign: 'center', marginTop: '3px' }}>
        <div style={{ fontSize: '0.62rem', color: '#a1a1aa', fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 900, color: color, fontFamily: 'monospace' }}>
          {pressure.toFixed(maxPressure <= 2 ? 2 : 1)} {unit}
        </div>
      </div>
    </div>
  );
};


// =========================================================================
// 1. COMPACT SMAW MACHINE PANEL (PRO-ARC 250i)
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
  
  let statusBadge = { color: '#10b981', text: '✅ OPTIMAL' };
  if (amperage > wps.currentRange[1]) statusBadge = { color: '#ef4444', text: '⚠️ OVERCURRENT' };
  else if (amperage < wps.currentRange[0]) statusBadge = { color: '#f59e0b', text: '⚠️ UNDERCURRENT' };

  const estimatedVoltage = (20 + 0.04 * amperage).toFixed(1);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <TopMachineHandle width="160px" />
      <div style={{
        background: 'linear-gradient(165deg, #27272a 0%, #18181b 35%, #09090b 100%)',
        borderRadius: '14px',
        border: '2.5px solid #ea580c',
        boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
        color: '#f4f4f5',
        padding: '14px 12px',
        position: 'relative'
      }}>
        <MachineCornerBumper position="top-left" />
        <MachineCornerBumper position="top-right" />
        <MachineCornerBumper position="bottom-left" />
        <MachineCornerBumper position="bottom-right" />

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #ea580c', paddingBottom: '8px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f97316', letterSpacing: '0.5px' }}>
              ⚡ PRO-ARC 250i (SMAW)
            </div>
            <div style={{ fontSize: '0.62rem', color: '#a1a1aa' }}>DIGITAL IGBT MMA INVERTER</div>
          </div>
          <button
            onClick={() => { sound.playClick(); onApplyWpsPreset && onApplyWpsPreset(); }}
            style={{
              padding: '4px 8px', borderRadius: '6px', border: '1px solid #ea580c',
              background: 'rgba(234, 88, 12, 0.2)', color: '#f97316', fontSize: '0.66rem', fontWeight: 800, cursor: 'pointer'
            }}
          >
            AUTO WPS
          </button>
        </div>

        {/* THICKNESS SELECTOR */}
        <div style={{ marginBottom: '10px', background: '#09090b', padding: '6px 8px', borderRadius: '8px', border: '1px solid #27272a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', fontWeight: 800, color: '#a1a1aa', marginBottom: '4px' }}>
            <span>TEBAL PLAT:</span>
            <span style={{ color: '#f97316' }}>{wps.plateName}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
            {['2mm', '4mm', '6mm', '8mm', '10mm', '12mm'].map(th => (
              <button
                key={th}
                onClick={() => { sound.playClick(); onSelectThickness && onSelectThickness(th); }}
                style={{
                  padding: '5px 2px', borderRadius: '5px',
                  border: plateThickness === th ? '1.5px solid #ea580c' : '1px solid #3f3f46',
                  background: plateThickness === th ? '#ea580c' : '#18181b',
                  color: plateThickness === th ? '#ffffff' : '#a1a1aa',
                  fontWeight: 900, fontSize: '0.72rem', cursor: 'pointer'
                }}
              >
                {th}
              </button>
            ))}
          </div>
        </div>

        {/* LED DIGITAL READOUT */}
        <div style={{
          background: '#050507', border: '1.5px solid #3f3f46', borderRadius: '8px',
          padding: '8px 12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#a1a1aa', fontWeight: 700 }}>ARUS (CURRENT)</div>
            <div style={{ fontSize: '1.9rem', fontFamily: 'monospace', fontWeight: 900, color: '#f97316', textShadow: '0 0 10px rgba(249, 115, 22, 0.7)' }}>
              {amperage} <span style={{ fontSize: '0.9rem', color: '#71717a' }}>A</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', borderLeft: '1px solid #27272a', paddingLeft: '10px' }}>
            <div style={{ fontSize: '0.6rem', color: '#a1a1aa', fontWeight: 700 }}>TEGANGAN BUSUR</div>
            <div style={{ fontSize: '1.3rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}>
              {estimatedVoltage} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>V</span>
            </div>
          </div>
        </div>

        {/* ROTARY KNOBS */}
        <div style={{ display: 'flex', justifyContent: 'space-around', background: '#09090b', padding: '8px 4px', borderRadius: '10px', border: '1px solid #27272a', marginBottom: '10px' }}>
          <CompactRotaryKnob
            value={amperage}
            min={30}
            max={250}
            label="ARUS"
            unit="A"
            onChange={onChangeAmperage}
            color="#f97316"
            size={52}
            marks={['30', '140', '250']}
            step={1}
          />
          <CompactRotaryKnob
            value={arcForce}
            min={0}
            max={100}
            label="ARC FORCE"
            unit="%"
            onChange={onChangeArcForce}
            color="#eab308"
            size={44}
            marks={['0', '100']}
            step={5}
          />
          <CompactRotaryKnob
            value={hotStart}
            min={0}
            max={100}
            label="HOT START"
            unit="%"
            onChange={onChangeHotStart}
            color="#10b981"
            size={44}
            marks={['0', '100']}
            step={5}
          />
        </div>

        {/* ELECTRODE & POLARITY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {['E6013-RB', 'E6013-RD', 'E7016-LB', 'E7018'].map(el => (
              <button
                key={el}
                onClick={() => { sound.playClick(); onChangeElectrode && onChangeElectrode(el); }}
                style={{
                  padding: '5px 2px', borderRadius: '5px',
                  border: electrode === el ? '1.5px solid #f97316' : '1px solid #3f3f46',
                  background: electrode === el ? 'rgba(234, 88, 12, 0.25)' : '#09090b',
                  color: electrode === el ? '#ffffff' : '#a1a1aa',
                  fontSize: '0.64rem', fontWeight: 800, cursor: 'pointer', textAlign: 'center'
                }}
              >
                {el.replace('E', '')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1 }}>
              <CompactDinseTerminal polaritySign="+" label={polarity === 'DCEP' ? 'STANG LAS' : 'MASSA'} isTorch={polarity === 'DCEP'} />
            </div>
            <div style={{ flex: 1 }}>
              <CompactDinseTerminal polaritySign="-" label={polarity === 'DCEN' ? 'STANG LAS' : 'MASSA'} isTorch={polarity === 'DCEN'} />
            </div>
          </div>
        </div>

        {/* STATUS FOOTER */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem' }}>
          <span style={{ color: statusBadge.color, fontWeight: 800 }}>{statusBadge.text}</span>
          <span style={{ color: '#a1a1aa' }}>WPS: {wps.currentRange[0]}-{wps.currentRange[1]}A</span>
        </div>
      </div>
    </div>
  );
};


// =========================================================================
// 2. COMPACT MIG/MAG MACHINE PANEL (SYN-MIG 350 PRO)
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
  const wps = WELDING_WPS_DATABASE.MIG[plateThickness] || WELDING_WPS_DATABASE.MIG['6mm'];
  const diaFactor = wireDiameter === 0.8 ? 16 : wireDiameter === 1.0 ? 21 : 28;
  const estimatedAmps = Math.round(wireFeedSpeed * diaFactor);

  let statusBadge = { color: '#10b981', text: '✅ OPTIMAL' };
  if (gasFlow < 10) statusBadge = { color: '#ef4444', text: '⚠️ GAS RENDAH' };
  else if (voltage > wps.voltageRange[1]) statusBadge = { color: '#ef4444', text: '⚠️ VOLT TINGGI' };
  else if (voltage < wps.voltageRange[0]) statusBadge = { color: '#f59e0b', text: '⚠️ VOLT RENDAH' };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <TopMachineHandle color="#0284c7" width="160px" />
      <div style={{
        background: 'linear-gradient(165deg, #0f172a 0%, #1e1b4b 35%, #09090b 100%)',
        borderRadius: '14px',
        border: '2.5px solid #0284c7',
        boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
        color: '#f4f4f5',
        padding: '14px 12px',
        position: 'relative'
      }}>
        <MachineCornerBumper position="top-left" />
        <MachineCornerBumper position="top-right" />
        <MachineCornerBumper position="bottom-left" />
        <MachineCornerBumper position="bottom-right" />

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #0284c7', paddingBottom: '8px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.5px' }}>
              🌀 SYN-MIG 350 (MIG/MAG)
            </div>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>SYNERGIC GMAW / FCAW</div>
          </div>
          <button
            onClick={() => { sound.playClick(); onApplyWpsPreset && onApplyWpsPreset(); }}
            style={{
              padding: '4px 8px', borderRadius: '6px', border: '1px solid #38bdf8',
              background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.66rem', fontWeight: 800, cursor: 'pointer'
            }}
          >
            AUTO WPS
          </button>
        </div>

        {/* THICKNESS */}
        <div style={{ marginBottom: '10px', background: '#020617', padding: '6px 8px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
            <span>TEBAL PLAT:</span>
            <span style={{ color: '#38bdf8' }}>{wps.plateName}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
            {['2mm', '4mm', '6mm', '8mm', '10mm', '12mm'].map(th => (
              <button
                key={th}
                onClick={() => { sound.playClick(); onSelectThickness && onSelectThickness(th); }}
                style={{
                  padding: '5px 2px', borderRadius: '5px',
                  border: plateThickness === th ? '1.5px solid #38bdf8' : '1px solid #1e293b',
                  background: plateThickness === th ? '#0284c7' : '#0f172a',
                  color: plateThickness === th ? '#ffffff' : '#94a3b8',
                  fontWeight: 900, fontSize: '0.72rem', cursor: 'pointer'
                }}
              >
                {th}
              </button>
            ))}
          </div>
        </div>

        {/* DUAL LED METERS */}
        <div style={{
          background: '#020617', border: '1.5px solid #1e293b', borderRadius: '8px',
          padding: '8px 12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>VOLTAGE</div>
            <div style={{ fontSize: '1.8rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8', textShadow: '0 0 10px rgba(56, 189, 248, 0.7)' }}>
              {voltage.toFixed(1)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>V</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', borderLeft: '1px solid #1e293b', paddingLeft: '10px' }}>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>WIRE SPEED / ARUS</div>
            <div style={{ fontSize: '1.8rem', fontFamily: 'monospace', fontWeight: 900, color: '#4ade80', textShadow: '0 0 10px rgba(74, 222, 128, 0.7)' }}>
              {wireFeedSpeed.toFixed(1)} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>m/m</span>
            </div>
            <div style={{ fontSize: '0.66rem', color: '#cbd5e1' }}>~{estimatedAmps} A</div>
          </div>
        </div>

        {/* ROTARY KNOBS */}
        <div style={{ display: 'flex', justifyContent: 'space-around', background: '#020617', padding: '8px 4px', borderRadius: '10px', border: '1px solid #1e293b', marginBottom: '10px' }}>
          <CompactRotaryKnob
            value={voltage}
            min={14}
            max={32}
            label="VOLT (V)"
            unit="V"
            onChange={onChangeVoltage}
            color="#38bdf8"
            size={52}
            marks={['14', '23', '32']}
            step={0.1}
          />
          <CompactRotaryKnob
            value={wireFeedSpeed}
            min={2.0}
            max={16.0}
            label="WFS"
            unit="m/m"
            onChange={onChangeWfs}
            color="#4ade80"
            size={52}
            marks={['2', '9', '16']}
            step={0.1}
          />
          <CompactRotaryKnob
            value={inductance}
            min={1}
            max={10}
            label="INDUCT"
            unit="lvl"
            onChange={onChangeInductance}
            color="#f59e0b"
            size={44}
            marks={['1', '10']}
            step={1}
          />
        </div>

        {/* GAS FLOWMETER & WIRE SELECTOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          <CompactRotameter flow={gasFlow} onChange={onChangeGasFlow} min={5} max={25} />

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
              {[0.8, 1.0, 1.2].map(dia => (
                <button
                  key={dia}
                  onClick={() => { sound.playClick(); onChangeWireDiameter && onChangeWireDiameter(dia); }}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: '5px',
                    border: wireDiameter === dia ? '1.5px solid #38bdf8' : '1px solid #1e293b',
                    background: wireDiameter === dia ? '#0284c7' : '#020617',
                    color: wireDiameter === dia ? '#ffffff' : '#94a3b8',
                    fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  Ø{dia}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '3px' }}>
              {['2T', '4T'].map(m => (
                <button
                  key={m}
                  onClick={() => { sound.playClick(); onChangeTriggerMode && onChangeTriggerMode(m); }}
                  style={{
                    padding: '5px 8px', borderRadius: '5px',
                    border: '1px solid #334155',
                    background: triggerMode === m ? '#0284c7' : '#020617',
                    color: triggerMode === m ? '#ffffff' : '#94a3b8',
                    fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STATUS FOOTER */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem' }}>
          <span style={{ color: statusBadge.color, fontWeight: 800 }}>{statusBadge.text}</span>
          <span style={{ color: '#94a3b8' }}>WPS: {wps.voltageRange[0]}-{wps.voltageRange[1]}V</span>
        </div>
      </div>
    </div>
  );
};


// =========================================================================
// 3. COMPACT TIG MACHINE PANEL (PRO-TIG 250 AC/DC)
// =========================================================================
export const TIGMachinePanel = ({
  plateThickness = '6mm',
  onSelectThickness,
  current = 135,
  onChangeCurrent,
  postFlow = 8.0,
  onChangePostFlow,
  pulseFreq = 1.0,
  onChangePulseFreq,
  currentType = 'DCEN',
  onChangeCurrentType,
  tungstenType = 'EWLa-1.5',
  onChangeTungstenType,
  tungstenDiameter = 2.4,
  onChangeTungstenDiameter,
  cupSize = '#7',
  onChangeCupSize,
  gasFlow = 11,
  onChangeGasFlow,
  hfIgnition = true,
  onToggleHf,
  onApplyWpsPreset
}) => {
  const wps = WELDING_WPS_DATABASE.TIG[plateThickness] || WELDING_WPS_DATABASE.TIG['6mm'];

  let statusBadge = { color: '#10b981', text: '✅ OPTIMAL' };
  if (current > wps.currentRange[1]) statusBadge = { color: '#ef4444', text: '⚠️ OVERCURRENT' };
  else if (current < wps.currentRange[0]) statusBadge = { color: '#f59e0b', text: '⚠️ UNDERCURRENT' };
  else if (postFlow < 4.0) statusBadge = { color: '#ef4444', text: '⚠️ POST-FLOW RENDAH' };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <TopMachineHandle color="#818cf8" width="160px" />
      <div style={{
        background: 'linear-gradient(165deg, #1e1b4b 0%, #172554 35%, #030712 100%)',
        borderRadius: '14px',
        border: '2.5px solid #818cf8',
        boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
        color: '#f4f4f5',
        padding: '14px 12px',
        position: 'relative'
      }}>
        <MachineCornerBumper position="top-left" />
        <MachineCornerBumper position="top-right" />
        <MachineCornerBumper position="bottom-left" />
        <MachineCornerBumper position="bottom-right" />

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #818cf8', paddingBottom: '8px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#a5b4fc', letterSpacing: '0.5px' }}>
              🎯 PRO-TIG 250 (GTAW)
            </div>
            <div style={{ fontSize: '0.62rem', color: '#c7d2fe' }}>AC/DC PULSE HF INVERTER</div>
          </div>
          <button
            onClick={() => { sound.playClick(); onApplyWpsPreset && onApplyWpsPreset(); }}
            style={{
              padding: '4px 8px', borderRadius: '6px', border: '1px solid #818cf8',
              background: 'rgba(129, 140, 248, 0.2)', color: '#c7d2fe', fontSize: '0.66rem', fontWeight: 800, cursor: 'pointer'
            }}
          >
            AUTO WPS
          </button>
        </div>

        {/* THICKNESS */}
        <div style={{ marginBottom: '10px', background: '#030712', padding: '6px 8px', borderRadius: '8px', border: '1px solid #1e1b4b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
            <span>TEBAL PLAT:</span>
            <span style={{ color: '#818cf8' }}>{wps.plateName}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
            {['2mm', '4mm', '6mm', '8mm', '10mm', '12mm'].map(th => (
              <button
                key={th}
                onClick={() => { sound.playClick(); onSelectThickness && onSelectThickness(th); }}
                style={{
                  padding: '5px 2px', borderRadius: '5px',
                  border: plateThickness === th ? '1.5px solid #818cf8' : '1px solid #1e1b4b',
                  background: plateThickness === th ? '#4f46e5' : '#0f172a',
                  color: plateThickness === th ? '#ffffff' : '#94a3b8',
                  fontWeight: 900, fontSize: '0.72rem', cursor: 'pointer'
                }}
              >
                {th}
              </button>
            ))}
          </div>
        </div>

        {/* DUAL LED READOUT */}
        <div style={{
          background: '#030712', border: '1.5px solid #312e81', borderRadius: '8px',
          padding: '8px 12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>CURRENT (TIG)</div>
            <div style={{ fontSize: '1.8rem', fontFamily: 'monospace', fontWeight: 900, color: '#818cf8', textShadow: '0 0 10px rgba(129, 140, 248, 0.7)' }}>
              {current} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>A</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', borderLeft: '1px solid #312e81', paddingLeft: '10px' }}>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>POST-FLOW TIMER</div>
            <div style={{ fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}>
              {postFlow.toFixed(1)} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>s</span>
            </div>
          </div>
        </div>

        {/* ROTARY KNOBS */}
        <div style={{ display: 'flex', justifyContent: 'space-around', background: '#030712', padding: '8px 4px', borderRadius: '10px', border: '1px solid #312e81', marginBottom: '10px' }}>
          <CompactRotaryKnob
            value={current}
            min={30}
            max={230}
            label="ARUS"
            unit="A"
            onChange={onChangeCurrent}
            color="#818cf8"
            size={52}
            marks={['30', '130', '230']}
            step={1}
          />
          <CompactRotaryKnob
            value={postFlow}
            min={2.0}
            max={15.0}
            label="POST-FLOW"
            unit="s"
            onChange={onChangePostFlow}
            color="#38bdf8"
            size={52}
            marks={['2', '8', '15']}
            step={0.5}
          />
          <CompactRotaryKnob
            value={pulseFreq}
            min={0}
            max={10}
            label="PULSE"
            unit="Hz"
            onChange={onChangePulseFreq}
            color="#a855f7"
            size={44}
            marks={['Off', '5', '10']}
            step={0.5}
          />
        </div>

        {/* TUNGSTEN & GAS LENS CUP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          {/* AC/DC TOGGLE & HF START */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => { sound.playClick(); onChangeCurrentType && onChangeCurrentType(currentType === 'DCEN' ? 'AC' : 'DCEN'); }}
              style={{
                flex: 1, padding: '6px 4px', borderRadius: '6px',
                border: currentType === 'DCEN' ? '1.5px solid #38bdf8' : '1.5px solid #a855f7',
                background: currentType === 'DCEN' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                color: '#ffffff', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer'
              }}
            >
              MODE: {currentType} ({currentType === 'DCEN' ? 'Baja/Stainless' : 'Aluminium'})
            </button>
            <button
              onClick={() => { sound.playClick(); onToggleHf && onToggleHf(); }}
              style={{
                padding: '6px 10px', borderRadius: '6px',
                border: hfIgnition ? '1.5px solid #22c55e' : '1px solid #4b5563',
                background: hfIgnition ? 'rgba(34, 197, 94, 0.2)' : '#030712',
                color: hfIgnition ? '#22c55e' : '#9ca3af', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer'
              }}
            >
              HF: {hfIgnition ? 'ON' : 'LIFT'}
            </button>
          </div>

          {/* TUNGSTEN DIA & CUP SIZE */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '2px', fontWeight: 700 }}>TUNGSTEN Ø:</div>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[1.6, 2.4, 3.2].map(dia => (
                  <button
                    key={dia}
                    onClick={() => { sound.playClick(); onChangeTungstenDiameter && onChangeTungstenDiameter(dia); }}
                    style={{
                      flex: 1, padding: '4px 0', borderRadius: '4px',
                      border: tungstenDiameter === dia ? '1.5px solid #818cf8' : '1px solid #1e1b4b',
                      background: tungstenDiameter === dia ? '#4f46e5' : '#030712',
                      color: tungstenDiameter === dia ? '#ffffff' : '#94a3b8',
                      fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    Ø{dia}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '2px', fontWeight: 700 }}>CUP KERAMIK:</div>
              <div style={{ display: 'flex', gap: '3px' }}>
                {['#5', '#6', '#7', '#8'].map(cup => (
                  <button
                    key={cup}
                    onClick={() => { sound.playClick(); onChangeCupSize && onChangeCupSize(cup); }}
                    style={{
                      flex: 1, padding: '4px 0', borderRadius: '4px',
                      border: cupSize === cup ? '1.5px solid #f472b6' : '1px solid #1e1b4b',
                      background: cupSize === cup ? '#db2777' : '#030712',
                      color: cupSize === cup ? '#ffffff' : '#94a3b8',
                      fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    {cup}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STATUS FOOTER */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem' }}>
          <span style={{ color: statusBadge.color, fontWeight: 800 }}>{statusBadge.text}</span>
          <span style={{ color: '#94a3b8' }}>WPS: {wps.currentRange[0]}-{wps.currentRange[1]}A</span>
        </div>
      </div>
    </div>
  );
};


// =========================================================================
// 4. COMPACT OAW STATION PANEL
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

  let flameType = 'neutral';
  let flameColor = '#38bdf8';
  let flameTitle = 'NETRAL';

  if (acetyleneValve > oxygenValve + 10) {
    flameType = 'carburizing';
    flameColor = '#d946ef';
    flameTitle = 'KARBURASI';
  } else if (oxygenValve > acetyleneValve + 10) {
    flameType = 'oxidizing';
    flameColor = '#f43f5e';
    flameTitle = 'OKSIDASI';
  }

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <TopMachineHandle color="#ef4444" width="160px" />
      <div style={{
        background: 'linear-gradient(165deg, #1c1917 0%, #292524 35%, #0c0a09 100%)',
        borderRadius: '14px',
        border: '2.5px solid #dc2626',
        boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
        color: '#f4f4f5',
        padding: '14px 12px',
        position: 'relative'
      }}>
        <MachineCornerBumper position="top-left" />
        <MachineCornerBumper position="top-right" />
        <MachineCornerBumper position="bottom-left" />
        <MachineCornerBumper position="bottom-right" />

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #dc2626', paddingBottom: '8px', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f87171', letterSpacing: '0.5px' }}>
              🔥 STASIUN OAW
            </div>
            <div style={{ fontSize: '0.62rem', color: '#a8a29e' }}>OKSIGEN - ASETILIN</div>
          </div>
          <button
            onClick={() => { sound.playClick(); onApplyWpsPreset && onApplyWpsPreset(); }}
            style={{
              padding: '4px 8px', borderRadius: '6px', border: '1px solid #ef4444',
              background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', fontSize: '0.66rem', fontWeight: 800, cursor: 'pointer'
            }}
          >
            AUTO WPS
          </button>
        </div>

        {/* THICKNESS */}
        <div style={{ marginBottom: '10px', background: '#0c0a09', padding: '6px 8px', borderRadius: '8px', border: '1px solid #292524' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', fontWeight: 800, color: '#a8a29e', marginBottom: '4px' }}>
            <span>TEBAL PLAT:</span>
            <span style={{ color: '#f87171' }}>{wps.plateName}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
            {['2mm', '4mm', '6mm', '8mm', '10mm', '12mm'].map(th => (
              <button
                key={th}
                onClick={() => { sound.playClick(); onSelectThickness && onSelectThickness(th); }}
                style={{
                  padding: '5px 2px', borderRadius: '5px',
                  border: plateThickness === th ? '1.5px solid #ef4444' : '1px solid #292524',
                  background: plateThickness === th ? '#dc2626' : '#1c1917',
                  color: plateThickness === th ? '#ffffff' : '#a8a29e',
                  fontWeight: 900, fontSize: '0.72rem', cursor: 'pointer'
                }}
              >
                {th}
              </button>
            ))}
          </div>
        </div>

        {/* ANALOG DUAL MANOMETERS */}
        <div style={{ display: 'flex', justifyContent: 'space-around', background: '#0c0a09', padding: '8px 4px', borderRadius: '10px', border: '1px solid #292524', marginBottom: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CompactAnalogManometer pressure={oxygenPressure} maxPressure={5.0} unit="bar" title="O₂ OKSIGEN" color="#0284c7" size={72} />
            <input
              type="range" min="0.5" max="5.0" step="0.1" value={oxygenPressure}
              onChange={(e) => onChangeOxygenPressure && onChangeOxygenPressure(Number(e.target.value))}
              style={{ width: '65px', accentColor: '#0284c7', cursor: 'pointer', height: '3px', marginTop: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CompactAnalogManometer pressure={acetylenePressure} maxPressure={1.5} unit="bar" title="C₂H₂ ASETILIN" color="#ef4444" dangerAbove={1.0} size={72} />
            <input
              type="range" min="0.1" max="1.2" step="0.05" value={acetylenePressure}
              onChange={(e) => onChangeAcetylenePressure && onChangeAcetylenePressure(Number(e.target.value))}
              style={{ width: '65px', accentColor: '#ef4444', cursor: 'pointer', height: '3px', marginTop: '4px' }}
            />
          </div>
        </div>

        {/* TORCH VALVES & FLAME PREVIEW */}
        <div style={{ background: '#0c0a09', padding: '8px', borderRadius: '10px', border: '1px solid #292524', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '8px' }}>
            <CompactRotaryKnob
              value={oxygenValve} min={0} max={100} label="KATUP O₂" unit="%"
              onChange={onChangeOxygenValve} color="#0284c7" size={44} marks={['0', '100']} step={1}
            />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', color: '#a8a29e', fontWeight: 800 }}>NYALA:</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: flameColor }}>{flameTitle}</div>
            </div>
            <CompactRotaryKnob
              value={acetyleneValve} min={0} max={100} label="KATUP C₂H₂" unit="%"
              onChange={onChangeAcetyleneValve} color="#ef4444" size={44} marks={['0', '100']} step={1}
            />
          </div>

          {/* Flame SVG graphic */}
          <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050404', borderRadius: '6px' }}>
            <svg width="220" height="36" viewBox="0 0 220 36">
              <rect x="5" y="13" width="28" height="10" rx="1" fill="#b45309" stroke="#d97706" />
              <polygon points="33,14 42,16 42,20 33,22" fill="#d97706" />
              <path
                d={flameType === 'carburizing' ? 'M 42 18 Q 90 5 190 18 Q 90 31 42 18' : flameType === 'oxidizing' ? 'M 42 18 Q 80 8 140 18 Q 80 28 42 18' : 'M 42 18 Q 85 6 170 18 Q 85 30 42 18'}
                fill={flameType === 'carburizing' ? 'rgba(219, 39, 119, 0.5)' : flameType === 'oxidizing' ? 'rgba(225, 29, 72, 0.55)' : 'rgba(59, 130, 246, 0.5)'}
              />
              {flameType === 'carburizing' && (
                <path d="M 42 18 Q 75 10 120 18 Q 75 26 42 18" fill="rgba(147, 51, 234, 0.7)" />
              )}
              <path
                d={flameType === 'carburizing' ? 'M 42 18 Q 55 14 68 18 Q 55 22 42 18' : flameType === 'oxidizing' ? 'M 42 18 L 56 18' : 'M 42 18 Q 55 13 72 18 Q 55 23 42 18'}
                fill="#ffffff"
                stroke={flameType === 'oxidizing' ? '#9333ea' : '#fde047'}
                strokeWidth={flameType === 'oxidizing' ? 2 : 1}
              />
            </svg>
          </div>
        </div>

        {/* STATUS FOOTER */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 8px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem' }}>
          <span style={{ color: flameType === 'neutral' ? '#10b981' : '#fca5a5', fontWeight: 800 }}>
            {flameType === 'neutral' ? '✅ NYALA NETRAL' : '⚠️ API TIDAK SEIMBANG'}
          </span>
          <span style={{ color: '#a8a29e' }}>WPS Tip: {wps.nozzleSize}</span>
        </div>
      </div>
    </div>
  );
};

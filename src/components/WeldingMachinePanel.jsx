import React from 'react';
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
// 1. PANEL MESIN LAS SMAW / MMA INVERTER
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
  const wps = WELDING_WPS_DATABASE.SMAW[plateThickness] || WELDING_WPS_DATABASE.SMAW['6mm'];
  
  // Real-time parameter assessment
  let statusBadge = { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: '✅ PARAMETER OPTIMAL (SESUAI WPS)' };
  if (amperage > wps.currentRange[1]) {
    statusBadge = { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '⚠️ ARUS TERLALU TINGGI! Risiko Undercut & Burn Through' };
  } else if (amperage < wps.currentRange[0]) {
    statusBadge = { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '⚠️ ARUS TERLALU RENDAH! Risiko Penetrasi Dangkal (Lack of Penetration)' };
  }

  // Calculate estimated voltage based on welding current (V = 20 + 0.04 * I)
  const estimatedVoltage = (20 + 0.04 * amperage).toFixed(1);

  return (
    <div style={{
      background: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
      borderRadius: '16px',
      border: '2px solid #ea580c',
      boxShadow: '0 12px 36px rgba(234, 88, 12, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
      color: '#f4f4f5',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* MACHINE BRAND & MODEL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', boxShadow: '0 0 16px rgba(234, 88, 12, 0.6)' }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '1px', color: '#ea580c' }}>
              VMLAB PRO-ARC 250i
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a1a1aa' }}>
              INDUSTRIAL INVERTER MMA / SMAW POWER SOURCE (IGBT DUAL MODULE)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => { sound.playClick(); onApplyWpsPreset && onApplyWpsPreset(); }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #ea580c',
              background: 'rgba(234, 88, 12, 0.15)',
              color: '#ea580c',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            title="Muat parameter standar WPS sesuai ketebalan plat yang dipilih"
          >
            <span>✨</span>
            <span>PRESET WPS OTOMATIS</span>
          </button>

          <div style={{
            background: vrd ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${vrd ? '#10b981' : '#ef4444'}`,
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: 800,
            color: vrd ? '#10b981' : '#ef4444',
            cursor: 'pointer'
          }}
          onClick={() => { sound.playClick(); onToggleVrd && onToggleVrd(); }}
          title="Voltage Reduction Device (Keamanan Sengatan Listrik)"
          >
            VRD: {vrd ? 'ACTIVE (14V)' : 'OFF (70V)'}
          </div>
        </div>
      </div>

      {/* PLATE THICKNESS SELECTOR TABS */}
      <div style={{ marginBottom: '18px', background: '#27272a', padding: '10px 14px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📏</span> PILIH KETEBALAN PLAT BENDA KERJA:
          </span>
          <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700 }}>
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
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'center'
                }}
              >
                {thick}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: '6px' }}>
          💡 Rekomendasi Kampuh: <strong style={{ color: '#ffffff' }}>{wps.grooveType}</strong> (Celah Akar: {wps.rootGap} mm)
        </div>
      </div>

      {/* MACHINE CONTROLS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* LEFT COLUMN: DIGITAL LED DISPLAYS & CURRENT REGULATOR */}
        <div style={{ background: '#18181b', padding: '16px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a1a1aa', marginBottom: '10px' }}>
            📊 MONITOR DIGITAL REAL-TIME
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {/* AMPERAGE DISPLAY */}
            <div style={{ background: '#09090b', padding: '12px', borderRadius: '8px', border: '1.5px solid #3f3f46', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 700 }}>ARUS LAS (AMPERE)</div>
              <div style={{ fontSize: '2.2rem', fontFamily: 'monospace', fontWeight: 900, color: '#ef4444', textShadow: '0 0 12px rgba(239, 68, 68, 0.6)' }}>
                {amperage}
                <span style={{ fontSize: '1rem', marginLeft: '2px', color: '#a1a1aa' }}>A</span>
              </div>
            </div>

            {/* VOLTAGE DISPLAY */}
            <div style={{ background: '#09090b', padding: '12px', borderRadius: '8px', border: '1.5px solid #3f3f46', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 700 }}>VOLTASE BUSUR</div>
              <div style={{ fontSize: '2.2rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8', textShadow: '0 0 12px rgba(56, 189, 248, 0.6)' }}>
                {estimatedVoltage}
                <span style={{ fontSize: '1rem', marginLeft: '2px', color: '#a1a1aa' }}>V</span>
              </div>
            </div>
          </div>

          {/* MAIN CURRENT SLIDER */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
              <span style={{ color: '#ffffff' }}>🎛️ SETEL ARUS (CURRENT):</span>
              <span style={{ color: '#ea580c' }}>{amperage} A (WPS: {wps.currentRange[0]}-{wps.currentRange[1]}A)</span>
            </div>
            <input
              type="range"
              min="30"
              max="220"
              step="1"
              value={amperage}
              onChange={(e) => onChangeAmperage && onChangeAmperage(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#ea580c', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#71717a', marginTop: '3px' }}>
              <span>Min: 30A</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>Ideal: {wps.optimalCurrent}A</span>
              <span>Max: 220A</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ARC FORCE, HOT START & POLARITY */}
        <div style={{ background: '#18181b', padding: '16px', borderRadius: '12px', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* ARC FORCE & HOT START DIALS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* ARC FORCE */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '4px' }}>
                <span style={{ color: '#ffffff' }}>ARC FORCE:</span>
                <span style={{ color: '#f59e0b' }}>{arcForce}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={arcForce}
                onChange={(e) => onChangeArcForce && onChangeArcForce(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '0.68rem', color: '#71717a', marginTop: '2px' }}>
                Cegah kawat lengket saat jarak busur rapat
              </div>
            </div>

            {/* HOT START */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '4px' }}>
                <span style={{ color: '#ffffff' }}>HOT START:</span>
                <span style={{ color: '#f59e0b' }}>{hotStart}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={hotStart}
                onChange={(e) => onChangeHotStart && onChangeHotStart(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '0.68rem', color: '#71717a', marginTop: '2px' }}>
                Lonjakan arus awal saat penyalaan busur
              </div>
            </div>
          </div>

          {/* ELECTRODE SELECTION & DIAMETER */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: 800, marginBottom: '4px' }}>
                KODE ELEKTRODA:
              </label>
              <select
                value={electrode}
                onChange={(e) => onChangeElectrode && onChangeElectrode(e.target.value)}
                style={{
                  width: '100%',
                  background: '#09090b',
                  color: '#ffffff',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                <option value="E6013-RB">RB-26 (E6013 High Titania)</option>
                <option value="E6013-RD">RD-460 (E6013 Rutile)</option>
                <option value="E7016-LB">LB-52 (E7016 Low Hydrogen)</option>
                <option value="E7018">E7018 Iron Powder Low Hydrogen</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#a1a1aa', fontWeight: 800, marginBottom: '4px' }}>
                DIAMETER:
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[2.0, 2.6, 3.2, 4.0].map(dia => (
                  <button
                    key={dia}
                    onClick={() => { sound.playClick(); onChangeElectrodeDiameter && onChangeElectrodeDiameter(dia); }}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: '6px',
                      border: electrodeDiameter === dia ? '1.5px solid #ea580c' : '1px solid #3f3f46',
                      background: electrodeDiameter === dia ? 'rgba(234, 88, 12, 0.25)' : '#09090b',
                      color: electrodeDiameter === dia ? '#ea580c' : '#a1a1aa',
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

          {/* POLARITY TOGGLE (DCEP VS DCEN) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#09090b', padding: '8px 12px', borderRadius: '8px', border: '1px solid #27272a' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e4e4e7' }}>
              🔌 POLARITAS TERMINAL:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => { sound.playClick(); onChangePolarity && onChangePolarity('DCEP'); }}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: polarity === 'DCEP' ? '1.5px solid #10b981' : '1px solid #3f3f46',
                  background: polarity === 'DCEP' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: polarity === 'DCEP' ? '#10b981' : '#a1a1aa',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                title="Direct Current Electrode Positive (Reverse) - Penetrasi dalam"
              >
                DCEP (DC+)
              </button>
              <button
                onClick={() => { sound.playClick(); onChangePolarity && onChangePolarity('DCEN'); }}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: polarity === 'DCEN' ? '1.5px solid #38bdf8' : '1px solid #3f3f46',
                  background: polarity === 'DCEN' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: polarity === 'DCEN' ? '#38bdf8' : '#a1a1aa',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
                title="Direct Current Electrode Negative (Straight) - Pelelehan cepat plat tipis"
              >
                DCEN (DC-)
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* STATUS BANNER */}
      <div style={{ marginTop: '14px', background: statusBadge.bg, border: `1px solid ${statusBadge.color}`, borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ color: statusBadge.color, fontWeight: 800, fontSize: '0.8rem' }}>
          {statusBadge.text}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#d4d4d8' }}>
          {wps.notes}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. PANEL MESIN LAS MIG / MAG (GMAW)
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

  // Current calculation estimation in MIG (Amperage depends primarily on WFS & wire diameter)
  // Approx Amps = WFS * (Diameter factor: 0.8mm->16, 1.0mm->22, 1.2mm->30)
  const diaFactor = wireDiameter === 0.8 ? 16 : wireDiameter === 1.0 ? 21 : 28;
  const estimatedAmps = Math.round(wireFeedSpeed * diaFactor);

  let statusBadge = { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: '✅ PARAMETER MIG OPTIMAL (STABLE ARC)' };
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
    <div style={{
      background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
      borderRadius: '16px',
      border: '2px solid #38bdf8',
      boxShadow: '0 12px 36px rgba(56, 189, 248, 0.22), inset 0 1px 0 rgba(255,255,255,0.1)',
      color: '#f4f4f5',
      padding: '20px',
      position: 'relative'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', boxShadow: '0 0 16px rgba(56, 189, 248, 0.5)' }}>
            🌀
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '1px', color: '#38bdf8' }}>
              VMLAB SYN-MIG 350 PRO
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              SYNERGIC GMAW / FCAW POWER SOURCE WITH 4-ROLL WIRE FEEDER & GAS FLOW CONTROL
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => { sound.playClick(); onApplyWpsPreset && onApplyWpsPreset(); }}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #38bdf8',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>✨</span>
            <span>PRESET SYNERGIC (WPS)</span>
          </button>

          <div style={{ display: 'flex', background: '#0f172a', padding: '3px', borderRadius: '6px', border: '1px solid #334155' }}>
            {['2T', '4T'].map(m => (
              <button
                key={m}
                onClick={() => { sound.playClick(); onChangeTriggerMode && onChangeTriggerMode(m); }}
                style={{
                  padding: '3px 8px',
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
        </div>
      </div>

      {/* THICKNESS TABS */}
      <div style={{ marginBottom: '18px', background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📏</span> PILIH KETEBALAN PLAT BENDA KERJA:
          </span>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
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
                  border: isSel ? '2px solid #38bdf8' : '1px solid #334155',
                  background: isSel ? '#0284c7' : '#0f172a',
                  color: isSel ? '#ffffff' : '#94a3b8',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {thick}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTROLS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* LEFT: VOLTAGE & WIRE SPEED METERS */}
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '10px' }}>
            📊 DUAL LED DIGITAL READOUTS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {/* VOLTAGE DISPLAY */}
            <div style={{ background: '#020617', padding: '12px', borderRadius: '8px', border: '1.5px solid #1e293b', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>TEGANGAN (VOLTAGE)</div>
              <div style={{ fontSize: '2.2rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8', textShadow: '0 0 12px rgba(56, 189, 248, 0.6)' }}>
                {voltage.toFixed(1)}
                <span style={{ fontSize: '1rem', marginLeft: '2px', color: '#64748b' }}>V</span>
              </div>
            </div>

            {/* WIRE SPEED DISPLAY */}
            <div style={{ background: '#020617', padding: '12px', borderRadius: '8px', border: '1.5px solid #1e293b', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>KECEPATAN KAWAT (WFS)</div>
              <div style={{ fontSize: '2.2rem', fontFamily: 'monospace', fontWeight: 900, color: '#4ade80', textShadow: '0 0 12px rgba(74, 222, 128, 0.6)' }}>
                {wireFeedSpeed.toFixed(1)}
                <span style={{ fontSize: '0.85rem', marginLeft: '2px', color: '#64748b' }}>m/m</span>
              </div>
            </div>
          </div>

          {/* VOLTAGE SLIDER */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '4px' }}>
              <span style={{ color: '#ffffff' }}>⚡ SETEL VOLTASE (V):</span>
              <span style={{ color: '#38bdf8' }}>{voltage.toFixed(1)} V (WPS: {wps.voltageRange[0]}-{wps.voltageRange[1]}V)</span>
            </div>
            <input
              type="range"
              min="14"
              max="32"
              step="0.1"
              value={voltage}
              onChange={(e) => onChangeVoltage && onChangeVoltage(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
          </div>

          {/* WFS SLIDER */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '4px' }}>
              <span style={{ color: '#ffffff' }}>🌀 WIRE FEED SPEED (WFS):</span>
              <span style={{ color: '#4ade80' }}>{wireFeedSpeed.toFixed(1)} m/min (~{estimatedAmps} A)</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="16.0"
              step="0.1"
              value={wireFeedSpeed}
              onChange={(e) => onChangeWfs && onChangeWfs(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#4ade80', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* RIGHT: WIRE DIAMETER, GAS & INDUCTANCE */}
        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* WIRE DIAMETER & GAS TYPE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, marginBottom: '4px' }}>
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
                      background: wireDiameter === dia ? '#0284c7' : '#020617',
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
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, marginBottom: '4px' }}>
                GAS PELINDUNG (SHIELDING):
              </label>
              <select
                value={shieldingGas}
                onChange={(e) => onChangeShieldingGas && onChangeShieldingGas(e.target.value)}
                style={{
                  width: '100%',
                  background: '#020617',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <option value="Ar + 20% CO2">Ar 80% + CO2 20% (Mix Mulus)</option>
                <option value="100% CO2">100% CO2 (Ekonomis - Penetrasi)</option>
                <option value="Pure Argon">Pure Argon 100% (Stainless/Alu)</option>
              </select>
            </div>
          </div>

          {/* GAS FLOW REGULATOR WITH FLOATING BALL METER */}
          <div style={{ background: '#020617', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8' }}>
                💨 ALIRAN GAS (FLOWMETER):
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: gasFlow >= 10 && gasFlow <= 20 ? '#10b981' : '#ef4444' }}>
                {gasFlow} L/menit
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="28"
              step="1"
              value={gasFlow}
              onChange={(e) => onChangeGasFlow && onChangeGasFlow(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
              <span>4 L/m (Kurang)</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>Optimal: 12-16 L/m</span>
              <span>28 L/m (Turbulen)</span>
            </div>
          </div>

          {/* ELECTRONIC INDUCTANCE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '4px' }}>
              <span style={{ color: '#ffffff' }}>🎚️ INDUKTANSI ELEKTRONIK (SPATTER CONTROL):</span>
              <span style={{ color: '#f59e0b' }}>{inductance > 0 ? `+${inductance}` : inductance} (Soft Arc)</span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={inductance}
              onChange={(e) => onChangeInductance && onChangeInductance(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
              <span>-10 (Hard Arc / Tajam)</span>
              <span>0 (Netral)</span>
              <span>+10 (Soft Arc / Halus)</span>
            </div>
          </div>
        </div>

      </div>

      {/* STATUS BADGE */}
      <div style={{ marginTop: '14px', background: statusBadge.bg, border: `1px solid ${statusBadge.color}`, borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ color: statusBadge.color, fontWeight: 800, fontSize: '0.8rem' }}>
          {statusBadge.text}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          {wps.notes}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. PANEL STASIUN LAS OAW (OKSIGEN-ASETILIN)
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
  let flameColor = '#3b82f6';
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
    <div style={{
      background: 'linear-gradient(145deg, #1c1917 0%, #0c0a09 100%)',
      borderRadius: '16px',
      border: '2px solid #ef4444',
      boxShadow: '0 12px 36px rgba(239, 68, 68, 0.22), inset 0 1px 0 rgba(255,255,255,0.1)',
      color: '#f4f4f5',
      padding: '20px',
      position: 'relative'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #292524', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7 50%, #dc2626 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', boxShadow: '0 0 16px rgba(239, 68, 68, 0.5)' }}>
            🔥
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '1px', color: '#f87171' }}>
              VMLAB OXY-ACETYLENE STATION
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a8a29e' }}>
              DUAL-GAS PRESSURE REGULATORS, SAFETY FLASHBACK ARRESTORS & MIXING TORCH
            </div>
          </div>
        </div>

        <button
          onClick={() => { sound.playClick(); onApplyWpsPreset && onApplyWpsPreset(); }}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid #ef4444',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#fca5a5',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>✨</span>
          <span>SETEL NYALA NETRAL OTOMATIS</span>
        </button>
      </div>

      {/* THICKNESS SELECTOR */}
      <div style={{ marginBottom: '18px', background: '#292524', padding: '10px 14px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#e7e5e4', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📏</span> KETEBALAN PLAT OAW:
          </span>
          <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>
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
                  border: isSel ? '2px solid #ef4444' : '1px solid #44403c',
                  background: isSel ? '#dc2626' : '#1c1917',
                  color: isSel ? '#ffffff' : '#a8a29e',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {thick}
              </button>
            );
          })}
        </div>
      </div>

      {/* REGULATOR MANOMETERS & TORCH VALVES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* LEFT: DUAL REGULATORS WITH ANALOG MANOMETERS */}
        <div style={{ background: '#1c1917', padding: '16px', borderRadius: '12px', border: '1px solid #292524' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a8a29e', marginBottom: '10px' }}>
            ⏱️ MANOMETER REGULATOR TABUNG
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            {/* OXYGEN REGULATOR */}
            <div style={{ background: 'rgba(2, 132, 199, 0.1)', padding: '12px', borderRadius: '10px', border: '1.5px solid #0284c7', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>TABUNG O₂ (OKSIGEN)</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Tekanan Kerja Torch</div>
              <div style={{ fontSize: '1.8rem', fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>
                {oxygenPressure.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>bar</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={oxygenPressure}
                onChange={(e) => onChangeOxygenPressure && onChangeOxygenPressure(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>WPS: {wps.oxygenPressure} bar</div>
            </div>

            {/* ACETYLENE REGULATOR */}
            <div style={{ background: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '10px', border: '1.5px solid #dc2626', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 800 }}>TABUNG C₂H₂ (ASETILIN)</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Tekanan Kerja Torch</div>
              <div style={{ fontSize: '1.8rem', fontFamily: 'monospace', fontWeight: 900, color: '#ef4444', margin: '4px 0' }}>
                {acetylenePressure.toFixed(2)} <span style={{ fontSize: '0.8rem' }}>bar</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.05"
                value={acetylenePressure}
                onChange={(e) => onChangeAcetylenePressure && onChangeAcetylenePressure(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700 }}>Max Safe: 1.0 bar (15 psi)</div>
            </div>
          </div>

          {/* NOZZLE & FILLER ROD */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#a8a29e', fontWeight: 800, marginBottom: '3px' }}>
                UKURAN NOZZLE TIP:
              </label>
              <select
                value={nozzleSize}
                onChange={(e) => onChangeNozzleSize && onChangeNozzleSize(e.target.value)}
                style={{ width: '100%', background: '#0c0a09', color: '#ffffff', border: '1px solid #44403c', borderRadius: '6px', padding: '6px', fontSize: '0.75rem' }}
              >
                <option value="#1">Tip #1 (Ø0.8mm - Plat 1-2mm)</option>
                <option value="#2">Tip #2 (Ø1.2mm - Plat 2-4mm)</option>
                <option value="#3">Tip #3 (Ø1.6mm - Plat 4-6mm)</option>
                <option value="#4">Tip #4 (Ø2.0mm - Plat 6-8mm)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#a8a29e', fontWeight: 800, marginBottom: '3px' }}>
                KAWAT TAMBAH (RG):
              </label>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[1.6, 2.4, 3.2].map(fd => (
                  <button
                    key={fd}
                    onClick={() => { sound.playClick(); onChangeFillerDiameter && onChangeFillerDiameter(fd); }}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: '6px',
                      border: fillerDiameter === fd ? '1.5px solid #ef4444' : '1px solid #44403c',
                      background: fillerDiameter === fd ? '#dc2626' : '#0c0a09',
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

        {/* RIGHT: TORCH BLENDER VALVES & FLAME PREVIEW */}
        <div style={{ background: '#1c1917', padding: '16px', borderRadius: '12px', border: '1px solid #292524', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a8a29e' }}>
            🪓 KATUP JARUM TORCH & PREVIEW NYALA API
          </div>

          {/* OXYGEN VALVE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '4px' }}>
              <span style={{ color: '#38bdf8' }}>🔵 KATUP O₂ (OKSIGEN):</span>
              <span style={{ color: '#38bdf8' }}>{oxygenValve}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={oxygenValve}
              onChange={(e) => onChangeOxygenValve && onChangeOxygenValve(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
            />
          </div>

          {/* ACETYLENE VALVE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '4px' }}>
              <span style={{ color: '#f87171' }}>🔴 KATUP C₂H₂ (ASETILIN):</span>
              <span style={{ color: '#f87171' }}>{acetyleneValve}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={acetyleneValve}
              onChange={(e) => onChangeAcetyleneValve && onChangeAcetyleneValve(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#dc2626', cursor: 'pointer' }}
            />
          </div>

          {/* FLAME TYPE VISUAL PREVIEW BOX */}
          <div style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, #0c0a09 100%)',
            padding: '12px',
            borderRadius: '10px',
            border: `1.5px solid ${flameColor}`,
            textAlign: 'center',
            boxShadow: `0 0 20px ${flameColor}33`
          }}>
            <div style={{ fontSize: '0.72rem', color: '#a8a29e', fontWeight: 700 }}>STATUS NYALA API AKTIF</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: flameColor, letterSpacing: '0.5px', marginTop: '2px' }}>
              {flameTitle}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#d6d3d1', marginTop: '4px', lineHeight: '1.4' }}>
              {flameDesc}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

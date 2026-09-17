import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

// =============================================================================
// 1. VOLUMETRIC STEAM & SMOKE PARTICLE SYSTEM (QUENCH & HOT TANKS)
// =============================================================================
const SteamSmokeParticles = ({ active, position = [1.8, 0.9, 0.5], count = 75, color = '#f1f5f9' }) => {
  const pointsRef = useRef();

  const [positions, velocities, lifetimes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = position[0] + (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = position[1] + Math.random() * 0.1;
      pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.4;

      vel[i * 3] = (Math.random() - 0.5) * 0.25;
      vel[i * 3 + 1] = 0.8 + Math.random() * 1.4; // upward speed
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.25;

      life[i] = Math.random();
    }
    return [pos, vel, life];
  }, [position, count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      if (active) {
        lifetimes[i] += delta * 0.9;
        if (lifetimes[i] > 1.0) {
          lifetimes[i] = 0;
          posArr[i * 3] = position[0] + (Math.random() - 0.5) * 0.35;
          posArr[i * 3 + 1] = position[1];
          posArr[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.35;
        } else {
          posArr[i * 3] += velocities[i * 3] * delta;
          posArr[i * 3 + 1] += velocities[i * 3 + 1] * delta;
          posArr[i * 3 + 2] += velocities[i * 3 + 2] * delta;
        }
      } else {
        posArr[i * 3 + 1] = -100;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={color}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// =============================================================================
// 2. CONVECTION AIR PARTICLES (NORMALIZING)
// =============================================================================
const ConvectionAirParticles = ({ active, position = [0, 0.5, 0], count = 40 }) => {
  const pointsRef = useRef();

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = position[0] + (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 1] = position[1] + Math.random() * 1.5;
      pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.8;

      vel[i * 3] = (Math.random() - 0.5) * 0.1;
      vel[i * 3 + 1] = 0.4 + Math.random() * 0.6;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    return [pos, vel];
  }, [position, count]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !active) return;
    const posArr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      if (posArr[i * 3 + 1] > position[1] + 2.0) {
        posArr[i * 3] = position[0] + (Math.random() - 0.5) * 1.0;
        posArr[i * 3 + 1] = position[1];
        posArr[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.6;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#38bdf8"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// =============================================================================
// 3. INDUSTRIAL MUFFLE FURNACE 3D MODEL
// =============================================================================
const IndustrialFurnace3D = ({ position = [-1.8, 0.9, -0.4], isOpen = true, isHeating = true, temp = 850 }) => {
  const doorRef = useRef();

  // Emissive color and glow intensity based on temperature
  const glowIntensity = useMemo(() => {
    if (temp < 500) return 0;
    return Math.min(8.0, ((temp - 500) / 450) * 8.0);
  }, [temp]);

  const glowColor = useMemo(() => {
    if (temp < 600) return '#450a0a';
    if (temp < 750) return '#b91c1c';
    if (temp < 850) return '#ea580c';
    return '#facc15';
  }, [temp]);

  return (
    <group position={position}>
      {/* Outer Furnace Steel Shell */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 1.4, 1.6]} />
        <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.7} />
      </mesh>

      {/* Furnace Top Exhaust Vent */}
      <mesh position={[0, 0.8, -0.2]}>
        <cylinderGeometry args={[0.12, 0.15, 0.3, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Control Panel Plate on Side */}
      <mesh position={[0.71, 0, 0]}>
        <boxGeometry args={[0.04, 0.9, 0.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>
      {/* Digital LED Display */}
      <mesh position={[0.73, 0.25, 0.1]}>
        <planeGeometry args={[0.02, 0.2]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* Temperature Digital Text HUD */}
      <Html position={[0.76, 0.25, 0.1]} transform rotation={[0, Math.PI / 2, 0]} distanceFactor={3}>
        <div style={{
          background: '#000',
          color: '#ef4444',
          fontFamily: 'monospace',
          fontSize: '11px',
          fontWeight: 900,
          padding: '2px 6px',
          borderRadius: '3px',
          border: '1px solid #7f1d1d',
          boxShadow: '0 0 8px #ef4444'
        }}>
          {temp}°C
        </div>
      </Html>

      {/* Furnace Chamber Cavity (Firebrick interior) */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[0.9, 0.9, 1.2]} />
        <meshStandardMaterial
          color={isHeating ? glowColor : '#eab308'}
          emissive={isHeating ? glowColor : '#000000'}
          emissiveIntensity={isHeating ? glowIntensity * 0.4 : 0}
          roughness={0.9}
        />
      </mesh>

      {/* Internal Glowing Heating Coils (Left & Right) */}
      {[-0.42, 0.42].map((x, i) => (
        <group key={i} position={[x, 0, 0.15]}>
          {[ -0.3, -0.15, 0, 0.15, 0.3 ].map((y, j) => (
            <mesh key={j} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 1.0, 8]} />
              <meshStandardMaterial
                color={isHeating ? '#fef08a' : '#78716c'}
                emissive={isHeating ? glowColor : '#000000'}
                emissiveIntensity={isHeating ? glowIntensity : 0}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Internal Furnace Light Source (Casts realistic warm glow onto floor & operator) */}
      {isHeating && (
        <pointLight
          position={[0, 0, 0.3]}
          distance={4.5}
          intensity={glowIntensity * 1.5}
          color={glowColor}
        />
      )}

      {/* Heavy Insulated Door with Hinge */}
      <group position={[-0.65, 0, 0.8]} ref={doorRef} rotation={[0, isOpen ? -Math.PI / 1.6 : 0, 0]}>
        <mesh position={[0.65, 0, 0]}>
          <boxGeometry args={[1.3, 1.3, 0.18]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Door Handle */}
        <mesh position={[1.15, 0, 0.15]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
        {/* Inner Door Firebrick Pad */}
        <mesh position={[0.65, 0, -0.06]}>
          <boxGeometry args={[0.88, 0.88, 0.08]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.9} />
        </mesh>
      </group>

      {/* Heavy Steel Stand Legs */}
      {[ [-0.6, -1.0, -0.6], [0.6, -1.0, -0.6], [-0.6, -1.0, 0.6], [0.6, -1.0, 0.6] ].map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// =============================================================================
// 4. INDUSTRIAL QUENCH TANK 3D MODEL (OIL / WATER)
// =============================================================================
const QuenchTank3D = ({ position = [1.8, 0.5, 0.4], media = 'oil', isBubbling = false }) => {
  const fluidColor = media === 'oil' ? '#1c1917' : '#0284c7';
  const fluidSurfaceColor = media === 'oil' ? '#44403c' : '#38bdf8';

  return (
    <group position={position}>
      {/* Outer Steel Tank Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.3, 1.0, 1.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Top Rim Flange */}
      <mesh position={[0, 0.51, 0]}>
        <boxGeometry args={[1.38, 0.04, 1.28]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Warning Hazard Stripes Plate */}
      <mesh position={[0, 0.2, 0.61]}>
        <planeGeometry args={[1.1, 0.25]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      <Html position={[0, 0.2, 0.62]} transform distanceFactor={3.5}>
        <div style={{
          background: '#000',
          color: '#facc15',
          fontFamily: 'sans-serif',
          fontSize: '9px',
          fontWeight: 900,
          padding: '2px 8px',
          border: '1px solid #facc15',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {media === 'oil' ? '⚠️ BAK OLI QUENCH 60°C' : '⚠️ BAK AIR QUENCH'}
        </div>
      </Html>

      {/* Fluid Liquid Volume Surface */}
      <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.15, 1.05]} />
        <meshStandardMaterial
          color={fluidSurfaceColor}
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Liquid Interior */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.15, 0.88, 1.05]} />
        <meshStandardMaterial color={fluidColor} roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Quench Vapor Fire Flash Light (Active when hot metal enters oil) */}
      {isBubbling && media === 'oil' && (
        <pointLight position={[0, 0.6, 0]} intensity={6.0} color="#f97316" distance={3.5} />
      )}
    </group>
  );
};

// =============================================================================
// 5. ARTICULATED BLACKSMITH TONGS (CAPIT BAJA TEMPA)
// =============================================================================
const BlacksmithTongs3D = ({ workpiecePos = [0, 1.0, 0] }) => {
  return (
    <group position={[workpiecePos[0], workpiecePos[1] + 0.45, workpiecePos[2]]}>
      {/* Tong Jaws gripping workpiece */}
      <mesh position={[-0.08, -0.4, 0]}>
        <boxGeometry args={[0.04, 0.2, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0.08, -0.4, 0]}>
        <boxGeometry args={[0.04, 0.2, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Tong Pivot Rivet */}
      <mesh position={[0, -0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.12, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>

      {/* Long Tong Handles extending upward */}
      <mesh position={[-0.07, 0.35, 0]} rotation={[0, 0, -0.06]}>
        <cylinderGeometry args={[0.02, 0.025, 1.1, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0.07, 0.35, 0]} rotation={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.02, 0.025, 1.1, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );
};

// =============================================================================
// 6. REALISTIC DYNAMIC STEEL WORKPIECE 3D
// =============================================================================
const RealisticWorkpiece3D = ({ processId, temp = 25, hrc = 20, stage = 'cold', position = [0, 1.0, 0] }) => {
  const meshRef = useRef();

  // Calculate emissive thermal glow based on temperature
  const emissiveColor = useMemo(() => {
    if (temp < 550) return '#000000';
    if (temp < 700) return '#7f1d1d'; // Dull dark cherry
    if (temp < 800) return '#dc2626'; // Cherry red
    if (temp < 880) return '#ea580c'; // Radiant orange
    return '#fef08a'; // Bright yellow-white hot
  }, [temp]);

  const emissiveIntensity = useMemo(() => {
    if (temp < 550) return 0;
    return Math.min(6.0, ((temp - 550) / 400) * 6.0);
  }, [temp]);

  // Tempering surface thin-film oxide color
  const baseColor = useMemo(() => {
    if (processId === 'tempering') {
      if (temp <= 150) return '#94a3b8';
      if (temp <= 220) return '#ca8a04'; // Straw Yellow
      if (temp <= 260) return '#b45309'; // Golden Brown
      if (temp <= 280) return '#7e22ce'; // Purple
      return '#0284c7'; // Spring Blue
    }
    if (processId === 'blackening') {
      if (stage === 'black') return '#09090b'; // Jet black Fe3O4
      return '#64748b'; // Raw steel
    }
    if (temp > 600) return '#ea580c';
    if (hrc >= 60) return '#1e293b'; // Martensite dark gray
    return '#64748b'; // Raw annealed steel
  }, [processId, temp, stage, hrc]);

  return (
    <group position={position}>
      {/* 3D Workpiece: Heavy Mechanical Transmission Gear or Chisel */}
      {processId === 'tempering' ? (
        // Chisel / Plane Blade shape for Tempering
        <mesh ref={meshRef} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.22, 0.7, 0.05]} />
          <meshStandardMaterial
            color={baseColor}
            metalness={0.85}
            roughness={0.2}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
      ) : (
        // Machined Stepped Cylinder / Spur Gear shape
        <group ref={meshRef}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.45, 24]} />
            <meshStandardMaterial
              color={baseColor}
              metalness={processId === 'blackening' && stage === 'black' ? 0.3 : 0.85}
              roughness={processId === 'blackening' && stage === 'black' ? 0.5 : 0.25}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
          {/* Outer Gear Teeth Ribs */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh key={idx} position={[Math.cos(rad) * 0.22, 0, Math.sin(rad) * 0.22]} rotation={[0, -rad, 0]}>
                <boxGeometry args={[0.05, 0.45, 0.04]} />
                <meshStandardMaterial
                  color={baseColor}
                  metalness={0.85}
                  roughness={0.25}
                  emissive={emissiveColor}
                  emissiveIntensity={emissiveIntensity}
                />
              </mesh>
            );
          })}
          {/* Inner Bore */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.46, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* Floating 3D HUD Tag over the workpiece */}
      <Html position={[0, 0.45, 0]} center distanceFactor={4}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.92)',
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: temp > 600 ? '#f97316' : '#38bdf8' }}>
            {temp}°C &bull; {hrc} HRC
          </div>
          <div style={{ fontSize: '8px', color: '#cbd5e1', fontWeight: 700 }}>
            {processId === 'hardening' && (temp > 750 ? 'Austenit Membara' : (hrc >= 60 ? 'Martensit Getas' : 'Baja Mentah'))}
            {processId === 'tempering' && `Warna: ${baseColor}`}
            {processId === 'annealing' && 'Pendinginan Tungku'}
            {processId === 'normalizing' && 'Pendinginan Udara Bebas'}
            {processId === 'case-hardening' && 'Difusi Karbon 1.0 mm'}
            {processId === 'blackening' && (stage === 'black' ? 'Lapisan Fe₃O₄ Hitam Pekat' : 'Pembersihan 7 Bak')}
          </div>
        </div>
      </Html>
    </group>
  );
};

// =============================================================================
// 7. NORMALIZING AIR COOLING RACK 3D
// =============================================================================
const AirCoolingRack3D = ({ position = [0.8, 0.45, 0.2] }) => {
  return (
    <group position={position}>
      {/* Heavy Steel Mesh Rack Table */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.4, 0.08, 1.0]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Table Legs */}
      {[ [-0.6, -0.4, -0.4], [0.6, -0.4, -0.4], [-0.6, -0.4, 0.4], [0.6, -0.4, 0.4] ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      ))}
      <Html position={[0, -0.2, 0.52]} transform distanceFactor={3.5}>
        <div style={{
          background: '#065f46',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          fontSize: '9px',
          fontWeight: 900,
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid #10b981',
          textTransform: 'uppercase'
        }}>
          💨 RAK PENDINGINAN UDARA BEBAS (KAMAR)
        </div>
      </Html>
    </group>
  );
};

// =============================================================================
// 8. CASE HARDENING CARBURIZING RETORT BOX 3D
// =============================================================================
const CarburizingBox3D = ({ position = [0, 0.6, 0], temp = 920 }) => {
  return (
    <group position={position}>
      {/* Sealed Cast Alloy Box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.1, 0.6, 0.8]} />
        <meshStandardMaterial
          color={temp > 700 ? '#ea580c' : '#334155'}
          emissive={temp > 700 ? '#ea580c' : '#000000'}
          emissiveIntensity={temp > 700 ? 1.5 : 0}
          roughness={0.7}
          metalness={0.5}
        />
      </mesh>
      {/* Fireclay Sealed Rim */}
      <mesh position={[0, 0.31, 0]}>
        <boxGeometry args={[1.15, 0.06, 0.85]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.9} />
      </mesh>
      <Html position={[0, 0.4, 0]} transform distanceFactor={3}>
        <div style={{
          background: '#000',
          color: '#f97316',
          fontSize: '9px',
          fontWeight: 900,
          padding: '2px 6px',
          border: '1px solid #ea580c',
          borderRadius: '3px'
        }}>
          📦 KOTAK ARANG AKTIF (920°C)
        </div>
      </Html>
    </group>
  );
};

// =============================================================================
// 9. HOT BLACK OXIDE 7-TANK CAROUSEL 3D
// =============================================================================
const Blackening7Tanks3D = ({ activeTank = 4 }) => {
  const tankNames = [
    '1. Degreaser',
    '2. Bilas 1',
    '3. Asam Etsa',
    '4. Bilas 2',
    '5. Garam 142°C',
    '6. Bilas 3',
    '7. Oli Pelindung'
  ];

  return (
    <group position={[-2.4, 0.4, 0]}>
      {tankNames.map((name, i) => {
        const xPos = i * 0.8;
        const isCurrent = i === activeTank;
        return (
          <group key={i} position={[xPos, 0, 0]}>
            {/* Stainless Tank */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.7, 0.7, 0.9]} />
              <meshStandardMaterial
                color={isCurrent ? '#38bdf8' : '#64748b'}
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
            {/* Fluid */}
            <mesh position={[0, 0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.62, 0.82]} />
              <meshStandardMaterial
                color={i === 4 ? '#09090b' : (i === 6 ? '#ca8a04' : '#0284c7')}
                roughness={0.1}
                metalness={0.4}
              />
            </mesh>
            <Html position={[0, -0.4, 0.5]} transform distanceFactor={3.5}>
              <div style={{
                background: isCurrent ? '#0284c7' : '#1e293b',
                color: '#fff',
                fontSize: '8px',
                fontWeight: 800,
                padding: '2px 4px',
                borderRadius: '3px',
                whiteSpace: 'nowrap'
              }}>
                {name}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// =============================================================================
// MAIN COMPONENT: HEAT TREATMENT 3D REALISTIC ENGINE
// =============================================================================
export default function HeatTreatment3D_Engine({
  processId = 'hardening',
  currentTime = 0,
  duration = 36,
  temp = 25,
  hrc = 20,
  phase = '',
  isPlaying = false
}) {
  // Compute dynamic physical positions based on time & process
  const animState = useMemo(() => {
    const t = currentTime;

    if (processId === 'hardening') {
      // 0-10s: cold prep, 10-22s: in furnace 850°C, 22-34s: in quench oil tank, 34+: out hardened
      if (t <= 10) {
        return {
          workpiecePos: [0, 0.85, 0.5],
          inFurnace: false,
          inQuench: false,
          furnaceOpen: true,
          bubbles: false,
          stage: 'cold'
        };
      } else if (t <= 22) {
        return {
          workpiecePos: [-1.8, 0.9, -0.3], // inside furnace cavity
          inFurnace: true,
          inQuench: false,
          furnaceOpen: false,
          bubbles: false,
          stage: 'heating'
        };
      } else if (t <= 34) {
        return {
          workpiecePos: [1.8, 0.45, 0.4], // submerged in oil
          inFurnace: false,
          inQuench: true,
          furnaceOpen: true,
          bubbles: true,
          stage: 'quench'
        };
      } else {
        return {
          workpiecePos: [1.8, 1.2, 0.4], // lifted above oil
          inFurnace: false,
          inQuench: false,
          furnaceOpen: true,
          bubbles: false,
          stage: 'hardened'
        };
      }
    }

    if (processId === 'tempering') {
      return {
        workpiecePos: [0, 0.9, 0],
        inFurnace: false,
        inQuench: false,
        furnaceOpen: false,
        bubbles: false,
        stage: 'tempering'
      };
    }

    if (processId === 'normalizing') {
      if (t <= 20) {
        return {
          workpiecePos: [-1.8, 0.9, -0.3],
          inFurnace: true,
          inQuench: false,
          furnaceOpen: false,
          bubbles: false,
          stage: 'heating'
        };
      } else {
        return {
          workpiecePos: [0.8, 0.65, 0.2], // on air cooling rack
          inFurnace: false,
          inQuench: false,
          furnaceOpen: true,
          bubbles: false,
          stage: 'cooling'
        };
      }
    }

    if (processId === 'annealing') {
      return {
        workpiecePos: [-1.8, 0.9, -0.3],
        inFurnace: true,
        inQuench: false,
        furnaceOpen: t <= 5 || t >= 32,
        bubbles: false,
        stage: t >= 32 ? 'annealed' : 'cooling'
      };
    }

    if (processId === 'case-hardening') {
      if (t <= 30) {
        return {
          workpiecePos: [0, 0.6, 0],
          inFurnace: false,
          inQuench: false,
          furnaceOpen: false,
          bubbles: false,
          stage: 'carburizing'
        };
      } else {
        return {
          workpiecePos: [1.8, 0.45, 0.4],
          inFurnace: false,
          inQuench: true,
          furnaceOpen: false,
          bubbles: true,
          stage: 'quench'
        };
      }
    }

    // Blackening
    const activeTankIdx = Math.min(6, Math.floor((t / duration) * 7));
    const targetX = -2.4 + activeTankIdx * 0.8;
    return {
      workpiecePos: [targetX, 0.45, 0],
      inFurnace: false,
      inQuench: false,
      furnaceOpen: false,
      bubbles: activeTankIdx === 4,
      stage: activeTankIdx >= 4 ? 'black' : 'clean',
      activeTank: activeTankIdx
    };
  }, [processId, currentTime, duration]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#020617' }}>
      <Canvas
        camera={{ position: [3.8, 2.8, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Ambient Workshop Lighting */}
        <ambientLight intensity={0.65} color="#94a3b8" />
        <directionalLight position={[6, 12, 6]} intensity={1.4} castShadow color="#ffffff" />
        <directionalLight position={[-6, 8, -4]} intensity={0.5} color="#38bdf8" />

        {/* Workshop Floor with Industrial Grid Markings */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
        </mesh>
        <gridHelper args={[16, 32, '#334155', '#1e293b']} position={[0, 0.001, 0]} />

        {/* Safety Yellow Hazard Boundary Line */}
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.28, 48]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>

        {/* 3D SCENARIO ASSETS BASED ON PROCESS */}
        {processId === 'hardening' && (
          <>
            <IndustrialFurnace3D
              position={[-1.8, 0.9, -0.4]}
              isOpen={animState.furnaceOpen}
              isHeating={temp > 100}
              temp={temp}
            />
            <QuenchTank3D
              position={[1.8, 0.5, 0.4]}
              media="oil"
              isBubbling={animState.bubbles}
            />
            <SteamSmokeParticles
              active={animState.bubbles}
              position={[1.8, 0.9, 0.4]}
              count={90}
              color="#e2e8f0"
            />
          </>
        )}

        {processId === 'tempering' && (
          <>
            {/* Precision Bench Oven Table */}
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[1.6, 0.8, 1.2]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>
            <pointLight position={[0, 1.2, 0]} intensity={temp > 200 ? 3.0 : 0} color="#f59e0b" distance={3} />
          </>
        )}

        {processId === 'normalizing' && (
          <>
            <IndustrialFurnace3D
              position={[-1.8, 0.9, -0.4]}
              isOpen={animState.furnaceOpen}
              isHeating={temp > 100}
              temp={temp}
            />
            <AirCoolingRack3D position={[0.8, 0.45, 0.2]} />
            <ConvectionAirParticles active={animState.stage === 'cooling'} position={[0.8, 0.7, 0.2]} count={45} />
          </>
        )}

        {processId === 'annealing' && (
          <IndustrialFurnace3D
            position={[-1.8, 0.9, -0.4]}
            isOpen={animState.furnaceOpen}
            isHeating={temp > 100}
            temp={temp}
          />
        )}

        {processId === 'case-hardening' && (
          <>
            <CarburizingBox3D position={[0, 0.6, 0]} temp={temp} />
            <QuenchTank3D position={[1.8, 0.5, 0.4]} media="water" isBubbling={animState.bubbles} />
            <SteamSmokeParticles active={animState.bubbles} position={[1.8, 0.9, 0.4]} count={60} color="#38bdf8" />
          </>
        )}

        {processId === 'blackening' && (
          <>
            <Blackening7Tanks3D activeTank={animState.activeTank} />
            <SteamSmokeParticles
              active={animState.bubbles}
              position={[-2.4 + 4 * 0.8, 0.8, 0]}
              count={70}
              color="#cbd5e1"
            />
          </>
        )}

        {/* WORKPIECE & ARTICULATED TONGS */}
        <RealisticWorkpiece3D
          processId={processId}
          temp={temp}
          hrc={hrc}
          stage={animState.stage}
          position={animState.workpiecePos}
        />

        {/* Articulated Tongs holding workpiece (except during bench tempering) */}
        {processId !== 'tempering' && (
          <BlacksmithTongs3D workpiecePos={animState.workpiecePos} />
        )}

        {/* Contact Shadow for realism */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.65}
          scale={10}
          blur={1.8}
          far={4}
          resolution={512}
          color="#000000"
        />

        {/* 360° Interactive Orbit Camera */}
        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={9.0}
          maxPolarAngle={Math.PI / 2 + 0.05}
        />
      </Canvas>

      {/* 3D Camera Interaction Hint */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '16px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.7rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        pointerEvents: 'none'
      }}>
        <span>🖱️ Putar 360° dengan Drag Mouse &bull; Scroll untuk Zoom Benda Kerja</span>
      </div>
    </div>
  );
}

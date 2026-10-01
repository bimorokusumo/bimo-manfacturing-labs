import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';

const Sparks = ({ isWelding, position, rotation = [0, 0, 0], weldingProcess }) => {
  const group = useRef();
  
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.1;
      group.current.children.forEach((child, i) => {
        // Skip the light
        if (child.type === 'PointLight') return;
        child.position.y += Math.random() * 0.1;
        child.position.x += (Math.random() - 0.5) * 0.1;
        child.position.z += (Math.random() - 0.5) * 0.1;
        if (child.position.y > 1) {
          child.position.set(0, 0, 0);
        }
      });
    }
  });

  if (!isWelding || weldingProcess === 'OAW') return null;

  const sparkColor = weldingProcess === 'MIG' ? '#ffffff' : '#ffcc00';
  const lightColor = weldingProcess === 'MIG' ? '#aaddff' : '#ffaa00';
  const intensity = weldingProcess === 'MIG' ? 8 : 5;

  return (
    <group ref={group} position={position} rotation={rotation}>
      {Array.from({ length: weldingProcess === 'MIG' ? 30 : 20 }).map((_, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial color={sparkColor} />
        </mesh>
      ))}
      <pointLight distance={3} intensity={intensity} color={lightColor} />
    </group>
  );
};

const OAWFlame = ({ position, rotation, flameType }) => {
  let innerColor, middleColor, outerColor;
  let outerScale, middleScale, innerScale;

  switch (flameType) {
    case 'carburizing':
      innerColor = '#e0e7ff'; // Light/white core
      middleColor = '#7c3aed'; // Purple feather
      outerColor = '#db2777'; // Pinkish-red envelope
      innerScale = [0.02, 0.08, 0.02];
      middleScale = [0.04, 0.2, 0.04];
      outerScale = [0.08, 0.4, 0.08];
      break;
    case 'oxidizing':
      innerColor = '#4c1d95'; // Dark purple core
      middleColor = null;
      outerColor = '#e11d48'; // Strong pink/red envelope
      innerScale = [0.015, 0.05, 0.015];
      middleScale = null;
      outerScale = [0.06, 0.2, 0.06];
      break;
    case 'neutral':
    default:
      innerColor = '#6d28d9'; // Purple core
      middleColor = null;
      outerColor = '#f43f5e'; // Pink-orange envelope
      innerScale = [0.02, 0.1, 0.02];
      middleScale = null;
      outerScale = [0.07, 0.3, 0.07];
      break;
  }

  return (
    <group position={position} rotation={rotation}>
      {/* Point light to illuminate the weld pool */}
      <pointLight distance={2} intensity={2} color={outerColor} />
      
      {/* Flame pointing downwards from the torch tip */}
      <group position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
        {/* Outer Envelope */}
        <mesh position={[0, outerScale[1]/2, 0]}>
          <coneGeometry args={[outerScale[0], outerScale[1], 32]} />
          <meshBasicMaterial color={outerColor} transparent opacity={0.5} />
        </mesh>
        
        {/* Middle Feather (only for Carburizing) */}
        {middleScale && (
          <mesh position={[0, middleScale[1]/2, 0]}>
            <coneGeometry args={[middleScale[0], middleScale[1], 32]} />
            <meshBasicMaterial color={middleColor} transparent opacity={0.8} />
          </mesh>
        )}
        
        {/* Inner Cone */}
        <mesh position={[0, innerScale[1]/2, 0]}>
          <coneGeometry args={[innerScale[0], innerScale[1], 32]} />
          <meshBasicMaterial color={innerColor} />
        </mesh>
      </group>
    </group>
  );
};

const Torch = ({ position, rotation = [0, 0, -Math.PI / 6], weldingProcess, smawElectrode, torchPos }) => {
  if (weldingProcess === 'MIG') {
    return (
      <group position={position} rotation={rotation}>
        {/* MIG Gun handle */}
        <mesh position={[-0.1, 0.4, 0]} rotation={[0, 0, -Math.PI/6]}>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* MIG Gun Neck */}
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI/12]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        {/* MIG Nozzle */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
          <meshStandardMaterial color="#b45309" metalness={0.6} />
        </mesh>
        {/* Wire sticking out slightly */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.05, 8]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
        </mesh>
      </group>
    );
  }

  if (weldingProcess === 'OAW') {
    return (
      <group position={position} rotation={rotation}>
        {/* OAW Torch Handle */}
        <mesh position={[-0.1, 0.6, 0]} rotation={[0, 0, -Math.PI/8]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 16]} />
          <meshStandardMaterial color="#b45309" metalness={0.7} />
        </mesh>
        {/* OAW Valves (Red and Green) */}
        <mesh position={[-0.05, 0.4, 0.05]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[-0.05, 0.5, 0.05]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        {/* OAW Tip */}
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI/8]}>
          <cylinderGeometry args={[0.015, 0.025, 0.4, 16]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.01, 0.015, 0.1, 16]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
        </mesh>
      </group>
    );
  }

  // Default: SMAW (Electrode Holder and Stick)
  // Electrode length decreases as torchPos increases (from 1 to 0.2)
  const stickLength = Math.max(0.2, 1 - (torchPos / 100) * 0.8);
  
  // Color the stick based on electrode type for visual flair
  let fluxColor = "#64748b"; // Default grey
  if (smawElectrode === 'E6013-RD') fluxColor = "#8c6b5d"; // Brownish (RD-460)
  else if (smawElectrode === 'E6013-RB') fluxColor = "#94a3b8"; // Light grey (RB-26)
  else if (smawElectrode === 'E7016-LB') fluxColor = "#475569"; // Dark grey (LB-52)

  return (
    <group position={position} rotation={rotation}>
      {/* Electrode Holder (Stang Las) */}
      <mesh position={[-0.1, stickLength + 0.1, 0]} rotation={[0, 0, -Math.PI/4]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Holder Jaws */}
      <mesh position={[0, stickLength + 0.05, 0]}>
        <boxGeometry args={[0.1, 0.15, 0.05]} />
        <meshStandardMaterial color="#b45309" metalness={0.8} />
      </mesh>
      
      {/* Electrode Stick (Consumable) */}
      <group position={[0, stickLength / 2, 0]}>
        {/* Core Wire */}
        <mesh>
          <cylinderGeometry args={[0.01, 0.01, stickLength, 8]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.9} />
        </mesh>
        {/* Flux Coating */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.02, 0.02, stickLength - 0.04, 8]} />
          <meshStandardMaterial color={fluxColor} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

const WeldBead = ({ weldProgress, weldType, isPipe }) => {
  const coins = useMemo(() => {
    const arr = [];
    // Pre-calculate all 100 "coins" so we don't recreate meshes on every frame (prevents flickering)
    for (let i = 1; i <= 100; i++) {
      let pos, rot = [0, 0, 0];
      if (isPipe) {
        const angle = (i / 100) * Math.PI * 2;
        pos = [0, Math.cos(angle) * 1.02, Math.sin(angle) * 1.02];
        rot = [angle, 0, 0];
      } else {
        const mappedX = -3 + (i / 100) * 6;
        if (weldType === 'fillet') {
          pos = [mappedX, 0.05, 0.05];
          rot = [Math.PI / 4, 0, 0];
        } else {
          pos = [mappedX, 0, 0];
        }
      }
      arr.push({ pos, rot, id: i });
    }
    return arr;
  }, [weldType, isPipe]);

  return (
    <group>
      {coins.map(coin => (
        <mesh 
          key={coin.id} 
          position={coin.pos} 
          rotation={coin.rot} 
          scale={[weldType === 'fillet' ? 0.8 : 1.2, 1, 1]}
          visible={coin.id <= weldProgress}
        >
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#d4d4d8" emissive={coin.id > weldProgress - 5 ? "#b45309" : "#000000"} emissiveIntensity={0.5} roughness={0.8} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const MetalPlate = ({ weldProgress, weldType, isPipe, defects = [], onDefectClick, plateThickness = '6mm' }) => {
  const thickVal = parseInt(plateThickness) || 6;
  // Normalized visual thickness: 2mm -> 0.08, 6mm -> 0.22, 12mm -> 0.44
  const plateH = Math.max(0.08, (thickVal / 6) * 0.22);
  const plateY = -plateH / 2;

  return (
    <group>
      {/* BASE PLATES WITH DYNAMIC THICKNESS */}
      {isPipe ? (
        <>
          <mesh position={[-1.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
            <cylinderGeometry args={[1, 1, 3, 32]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[1.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
            <cylinderGeometry args={[1, 1, 3, 32]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
          </mesh>
        </>
      ) : weldType === 'fillet' ? (
        <>
          <mesh position={[0, plateY, 0]} receiveShadow>
            <boxGeometry args={[6, plateH, 2]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.9, -plateH / 2]} receiveShadow>
            <boxGeometry args={[6, 2, plateH]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, plateY, 1.05]} receiveShadow>
            <boxGeometry args={[6, plateH, 2]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, plateY, -1.05]} receiveShadow>
            <boxGeometry args={[6, plateH, 2]} />
            <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
          </mesh>
        </>
      )}

      {/* REALISTIC WELD BEAD */}
      <WeldBead weldProgress={weldProgress} weldType={weldType} isPipe={isPipe} />

      {/* DEFECT MARKERS - Titik Berkedip Pada Hasil Lasan */}
      {defects.map((defect, idx) => {
        let dPos;
        if (isPipe) {
          const angle = (defect.pos / 100) * Math.PI * 2;
          dPos = [0, Math.cos(angle) * 1.05, Math.sin(angle) * 1.05];
        } else {
          const mappedX = -3 + (defect.pos / 100) * 6;
          dPos = [mappedX, weldType === 'fillet' ? 0.12 : 0.08, weldType === 'fillet' ? 0.12 : 0];
        }

        return (
          <group key={defect.uid} position={dPos}>
            <Html center distanceFactor={8}>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onDefectClick(defect);
                }}
                title="Klik titik berkedip ini untuk melihat jenis & foto cacat las"
                style={{
                  cursor: 'pointer', pointerEvents: 'auto', position: 'relative', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px'
                }}
              >
                {/* Flashing Outer Ripple Ring */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.6)', border: '2px solid #ef4444',
                  animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                }} />

                {/* Inner Blinking Glow Core */}
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#ef4444', border: '2px solid #ffffff',
                  boxShadow: '0 0 15px #ef4444, 0 0 30px #ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ffffff', fontSize: '9px', fontWeight: 'bold', zIndex: 2
                }}>
                  !
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

const InteractionPlane = ({ onUpdate, onDown, onUp, isPipe, interactionMode }) => {
  const handleMove = (e) => {
    if (interactionMode !== 'weld') return;
    const localPoint = e.eventObject.worldToLocal(e.point.clone());
    let pct = 0;
    if (isPipe) {
       let angle = Math.atan2(localPoint.z, localPoint.y);
       if (angle < 0) angle += Math.PI * 2;
       pct = (angle / (Math.PI * 2)) * 100;
    } else {
       pct = ((localPoint.x + 3) / 6) * 100;
    }
    pct = Math.max(0, Math.min(100, pct));
    onUpdate(pct);
  };

  return (
    <mesh 
      visible={false} 
      position={isPipe ? [0, 0, 0] : [0, 0.2, 0]}
      rotation={isPipe ? [0, 0, Math.PI/2] : [-Math.PI/2, 0, 0]}
      onPointerMove={handleMove}
      onPointerDown={(e) => { e.stopPropagation(); onDown(); }}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      {isPipe ? <cylinderGeometry args={[1.5, 1.5, 6, 16]} /> : <planeGeometry args={[20, 10]} />}
    </mesh>
  );
};

// =========================================================================
// 3D WELDING MACHINE MODELS & WORKSHOP APPARATUS
// =========================================================================

// Ground Clamp (Klem Massa) clamped onto plate
const GroundClamp = ({ position = [-2.8, 0, 1.8], isPipe = false }) => {
  if (isPipe) return null;
  return (
    <group position={position}>
      {/* Heavy-duty brass/copper clamp jaw */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.22, 0.08, 0.24]} />
        <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Clamp Lever Handle */}
      <mesh position={[-0.14, 0.12, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.28, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Heavy copper lug connector & strain relief */}
      <mesh position={[-0.08, 0.02, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.07, 12]} />
        <meshStandardMaterial color="#b45309" metalness={0.9} />
      </mesh>
    </group>
  );
};

// 1. SMAW / MMA Inverter 3D Model
const SMAWMachine3D = ({ amperage = 115, polarity = 'DCEP', position = [-3.8, 0.4, -2.0] }) => {
  return (
    <group position={position}>
      {/* Workshop Mobile Cart Shelf */}
      <mesh position={[0, -0.65, 0]} receiveShadow>
        <boxGeometry args={[1.5, 0.08, 1.3]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Cart Wheels */}
      {[-0.6, 0.6].map((wx, i) =>
        [-0.5, 0.5].map((wz, j) => (
          <mesh key={`${i}-${j}`} position={[wx, -0.82, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.07, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))
      )}

      {/* Main Industrial Orange Inverter Chassis */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.85, 0.75]} />
        <meshStandardMaterial color="#ea580c" metalness={0.35} roughness={0.35} />
      </mesh>

      {/* Top Heavy-Duty Carrying Handle */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.65, 0.08, 0.12]} />
        <meshStandardMaterial color="#18181b" roughness={0.6} />
      </mesh>

      {/* Front Faceplate (Black inset) */}
      <mesh position={[0.61, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.70, 0.78]} />
        <meshStandardMaterial color="#09090b" roughness={0.5} />
      </mesh>

      {/* Digital LED Display (Glowing Red Amps readout) */}
      <mesh position={[0.62, 0.20, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.32, 0.15]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Heavy Rotary Dial Knob */}
      <mesh position={[0.63, -0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 20]} />
        <meshStandardMaterial color="#ea580c" metalness={0.8} />
      </mesh>

      {/* Positive Dinse Socket (Red +) */}
      <mesh position={[0.62, -0.24, 0.16]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Negative Dinse Socket (Black -) */}
      <mesh position={[0.62, -0.24, -0.16]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
        <meshStandardMaterial color="#18181b" />
      </mesh>

      {/* Ground Cable Running Across Table towards Workpiece */}
      <mesh position={[1.1, -0.35, 0.7]} rotation={[0.3, 0.4, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 2.5, 12]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} />
      </mesh>

      {/* Floating 3D Machine Label */}
      <Html position={[0, 0.75, 0]} center distanceFactor={9}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.90)',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid #ea580c',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}>
          ⚡ INVERTER SMAW ({amperage}A • {polarity})
        </div>
      </Html>
    </group>
  );
};

// 2. MIG / MAG (GMAW) 3D Model with Wire Feeder & Gas Cylinder
const MIGMachine3D = ({ voltage = 22, wireFeedSpeed = 7.8, gasFlow = 15, position = [-3.8, 0.4, -2.0] }) => {
  return (
    <group position={position}>
      {/* Heavy Mobile Trolley Base */}
      <mesh position={[0, -0.65, 0]} receiveShadow>
        <boxGeometry args={[1.7, 0.08, 1.3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Trolley Wheels */}
      {[-0.7, 0.7].map((wx, i) =>
        [-0.5, 0.5].map((wz, j) => (
          <mesh key={`${i}-${j}`} position={[wx, -0.82, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))
      )}

      {/* Main MIG Power Source Base (Blue) */}
      <mesh position={[-0.1, -0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.7, 0.75]} />
        <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Top Wire Feeder Unit */}
      <mesh position={[-0.1, 0.40, 0]} castShadow>
        <boxGeometry args={[0.95, 0.42, 0.70]} />
        <meshStandardMaterial color="#0369a1" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Wire Spool Inspection Window (Clear Acrylic) */}
      <mesh position={[-0.1, 0.40, 0.36]}>
        <planeGeometry args={[0.55, 0.30]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.4} roughness={0.1} transmission={0.9} />
      </mesh>

      {/* Copper Wire Spool inside window */}
      <mesh position={[-0.1, 0.40, 0.14]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.15, 24]} />
        <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Gas Cylinder (CO2 / Argon Bottle) mounted at back of trolley */}
      <group position={[-0.65, 0.30, -0.15]}>
        {/* Dark Grey Tank Body */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.20, 0.20, 1.6, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.07, 0.16, 0.14, 20]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* Brass Valve */}
        <mesh position={[0, 0.98, 0]}>
          <boxGeometry args={[0.09, 0.12, 0.09]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} />
        </mesh>
        {/* Flowmeter Tube with Ball */}
        <mesh position={[0.10, 1.08, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.20, 12]} />
          <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.6} transmission={0.8} />
        </mesh>
      </group>

      {/* Euro Connector Socket on front */}
      <mesh position={[0.46, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.05, 20]} />
        <meshStandardMaterial color="#18181b" metalness={0.8} />
      </mesh>

      {/* Ground Cable to Plate */}
      <mesh position={[1.1, -0.35, 0.7]} rotation={[0.3, 0.4, -0.2]}>
        <cylinderGeometry args={[0.022, 0.022, 2.5, 12]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} />
      </mesh>

      {/* Machine Label HUD */}
      <Html position={[0, 0.82, 0]} center distanceFactor={9}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.90)',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid #38bdf8',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}>
          🌀 MIG/MAG ({voltage}V • {wireFeedSpeed} m/m • {gasFlow} L/m)
        </div>
      </Html>
    </group>
  );
};

// 3. OAW Dual Cylinder Cart Model
const OAWMachine3D = ({ oawFlame = 'neutral', oxygenPressure = 2.0, acetylenePressure = 0.4, position = [-3.8, 0.4, -2.0] }) => {
  return (
    <group position={position}>
      {/* 2-Wheel Cylinder Hand Trolley */}
      <mesh position={[0, -0.65, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.07, 0.85]} />
        <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Large Trolley Wheels */}
      {[-0.6, 0.6].map((wx, i) => (
        <mesh key={i} position={[wx, -0.65, -0.42]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.20, 0.20, 0.07, 20]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      ))}

      {/* 1. OXYGEN CYLINDER (Tall Royal Blue Tank - O2) */}
      <group position={[-0.30, 0.32, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.19, 0.19, 1.8, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.06, 0.16, 0.14, 20]} />
          <meshStandardMaterial color="#0369a1" metalness={0.8} />
        </mesh>
        {/* Dual Dial Manometer (Blue Ring) */}
        <mesh position={[0.09, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 20]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* 2. ACETYLENE CYLINDER (Shorter Maroon/Red Tank - C2H2) */}
      <group position={[0.30, 0.08, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.22, 1.4, 24]} />
          <meshStandardMaterial color="#991b1b" metalness={0.65} roughness={0.3} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.07, 0.18, 0.14, 20]} />
          <meshStandardMaterial color="#7f1d1d" metalness={0.8} />
        </mesh>
        {/* Dual Dial Manometer (Red Ring) */}
        <mesh position={[-0.09, 0.98, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 20]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* Twin Rubber Hoses (Blue for Oxygen, Red for Acetylene) */}
      <mesh position={[1.0, -0.35, 0.55]} rotation={[0.3, 0.4, -0.2]}>
        <cylinderGeometry args={[0.015, 0.015, 2.4, 12]} />
        <meshStandardMaterial color="#0284c7" roughness={0.8} />
      </mesh>
      <mesh position={[1.0, -0.35, 0.60]} rotation={[0.3, 0.4, -0.2]}>
        <cylinderGeometry args={[0.015, 0.015, 2.4, 12]} />
        <meshStandardMaterial color="#dc2626" roughness={0.8} />
      </mesh>

      {/* Machine Label HUD */}
      <Html position={[0, 1.4, 0]} center distanceFactor={9}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.90)',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid #ef4444',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}>
          🔥 STASIUN OAW (O₂: {oxygenPressure} bar • C₂H₂: {acetylenePressure} bar • {oawFlame.toUpperCase()})
        </div>
      </Html>
    </group>
  );
};

const Welding3D = ({ 
  isWelding, torchPos, weldProgress, weldType = 'groove', weldPosition = '1G', 
  defects = [], onDefectClick, interactionMode = 'camera', 
  weldingProcess = 'SMAW', smawElectrode = 'E7018', oawFlame = 'neutral',
  plateThickness = '6mm',
  amperage = 115,
  voltage = 22,
  wireFeedSpeed = 7.8,
  gasFlow = 15,
  oxygenPressure = 2.0,
  acetylenePressure = 0.4,
  polarity = 'DCEP',
  onTorchUpdate, onTorchDown, onTorchUp
}) => {
  // Determine overall rotation based on position
  let groupRotation = [0, 0, 0];
  let isPipe = false;
  
  if (weldPosition.includes('5G') || weldPosition.includes('6G')) {
    isPipe = true;
    if (weldPosition === '6G') groupRotation = [0, 0, Math.PI / 4];
  } else {
    switch (weldPosition) {
      case '2G':
      case '2F':
        groupRotation = [Math.PI / 2, 0, 0]; // Horizontal
        break;
      case '3G':
      case '3F':
        groupRotation = [0, 0, Math.PI / 2]; // Vertical
        break;
      case '4G':
      case '4F':
        groupRotation = [Math.PI, 0, 0]; // Overhead
        break;
      default:
        groupRotation = [0, 0, 0]; // 1G/1F Flat
    }
  }

  // Calculate Torch Position
  let tPos = [0, 0, 0];
  let tRot = [0, 0, -Math.PI / 6];

  if (isPipe) {
    const angle = (torchPos / 100) * Math.PI * 2;
    tPos = [0, Math.cos(angle) * 1.1, Math.sin(angle) * 1.1];
    tRot = [angle, 0, 0]; // Torch points to center of pipe
  } else {
    const mappedX = -3 + (torchPos / 100) * 6;
    if (weldType === 'fillet') {
      tPos = [mappedX, 0.2, 0.2];
      tRot = [Math.PI / 4, 0, -Math.PI / 6];
    } else {
      tPos = [mappedX, 0.2, 0];
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', cursor: 'crosshair' }}>
      <Canvas shadows camera={{ position: [0, 4, 6], fov: 45 }}>
        <color attach="background" args={['#e2e8f0']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={1.0} />
        <pointLight position={[0, 5, 5]} intensity={0.8} />

        {/* WORKSHOP WELDING MACHINE APPARATUS */}
        {weldingProcess === 'SMAW' && (
          <SMAWMachine3D amperage={amperage} polarity={polarity} position={[-3.8, 0.35, -2.0]} />
        )}
        {weldingProcess === 'MIG' && (
          <MIGMachine3D voltage={voltage} wireFeedSpeed={wireFeedSpeed} gasFlow={gasFlow} position={[-3.8, 0.35, -2.0]} />
        )}
        {weldingProcess === 'OAW' && (
          <OAWMachine3D oawFlame={oawFlame} oxygenPressure={oxygenPressure} acetylenePressure={acetylenePressure} position={[-3.8, 0.35, -2.0]} />
        )}

        {/* WORKPIECE GROUND CLAMP (KLEM MASSA) */}
        {weldingProcess !== 'OAW' && !isPipe && (
          <GroundClamp position={[-2.8, 0, 1.8]} isPipe={isPipe} />
        )}

        <group rotation={groupRotation}>
          {interactionMode === 'weld' && (
            <InteractionPlane 
              isPipe={isPipe} 
              interactionMode={interactionMode} 
              onUpdate={onTorchUpdate} 
              onDown={onTorchDown} 
              onUp={onTorchUp} 
            />
          )}
          <MetalPlate
            weldProgress={weldProgress !== undefined ? weldProgress : torchPos}
            weldType={weldType}
            isPipe={isPipe}
            defects={defects}
            onDefectClick={onDefectClick}
            plateThickness={plateThickness}
          />
          
          <Torch position={tPos} rotation={tRot} weldingProcess={weldingProcess} smawElectrode={smawElectrode} torchPos={torchPos} />
          <Sparks isWelding={isWelding} position={tPos} weldingProcess={weldingProcess} />
          {weldingProcess === 'OAW' && <OAWFlame position={tPos} rotation={tRot} flameType={oawFlame} />}
        </group>

        <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={20} blur={2.5} far={4} />
        <OrbitControls enableZoom={true} enablePan={false} enabled={interactionMode === 'camera' || defects.length > 0} />
      </Canvas>
      
      {/* HUD OVERLAY */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', pointerEvents: 'none' }}>
        <div className="cyber-font" style={{ color: (isWelding || weldingProcess === 'OAW') ? '#ffaa00' : 'var(--text-main)', fontSize: '1rem', textShadow: (isWelding || weldingProcess === 'OAW') ? '0 0 10px #ffaa00' : 'none' }}>
          {(isWelding || weldingProcess === 'OAW') ? 'ARC/FLAME ACTIVE - READY TO WELD' : 'ARC OFF - READY TO WELD'}
        </div>
        <div style={{ color: 'var(--text-main)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 'bold' }}>
          TIPE: {weldType.toUpperCase()} | POSISI: {weldPosition} | PROSES: {weldingProcess} | PLAT: {plateThickness}
        </div>
      </div>
    </div>
  );
};

export default Welding3D;

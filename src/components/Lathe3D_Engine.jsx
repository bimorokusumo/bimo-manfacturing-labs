import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Swarf / Metal Chips Particle System - sprays from exact contact point
const CuttingChips = ({ isCutting, position }) => {
  const pointsRef = useRef();
  const count = 35;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1];
      pos[i * 3 + 2] = position[2];

      vel[i * 3] = (Math.random() - 0.5) * 0.4;
      vel[i * 3 + 1] = 0.8 + Math.random() * 1.0; // upward
      vel[i * 3 + 2] = 0.4 + Math.random() * 0.8; // outward
    }
    return [pos, vel];
  }, [position]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      if (isCutting) {
        posArr[i * 3] += velocities[i * 3] * delta * 3.5;
        posArr[i * 3 + 1] += velocities[i * 3 + 1] * delta * 3.5;
        posArr[i * 3 + 2] += velocities[i * 3 + 2] * delta * 3.5;
        velocities[i * 3 + 1] -= 9.8 * delta * 0.4; // gravity

        // reset if too far from tool tip
        if (posArr[i * 3 + 1] < position[1] - 0.25) {
          posArr[i * 3] = position[0] + (Math.random() - 0.5) * 0.04;
          posArr[i * 3 + 1] = position[1];
          posArr[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.04;
          velocities[i * 3 + 1] = 0.8 + Math.random() * 0.9;
        }
      } else {
        posArr[i * 3 + 1] = -100;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#fbbf24"
        transparent
        opacity={isCutting ? 0.95 : 0}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Workpiece rendered with dynamic revolved profile
// 100mm length = 2.4 world units (X: -1.2 to +1.2)
// 50mm diameter = 0.60 world diameter (0.30 radius) -> scale = 0.006 per mm
const RevolvedWorkpiece = ({ profile, isRunning, rpm = 800 }) => {
  const meshRef = useRef();

  // Create Lathe Geometry from mm profile
  const geometry = useMemo(() => {
    const pts = [];
    const segments = profile ? profile.length : 30;

    // Base cap at chuck face (world X = -1.2, local y = -1.2)
    pts.push(new THREE.Vector2(0, -1.205));

    // Order points strictly from local y = -1.2 (chuck) to +1.2 (tailstock)
    // profile[29] is near chuck, profile[0] is at tailstock end
    for (let i = segments - 1; i >= 0; i--) {
      const y = -1.2 + ((segments - 1 - i) / (segments - 1)) * 2.4;
      const diaMm = profile && profile[i] !== undefined ? profile[i] : 50;
      const radius = Math.max(0.04, (diaMm / 2) * (0.30 / 25)); // diaMm * 0.006
      pts.push(new THREE.Vector2(radius, y));
    }

    // Tip cap at tailstock (world X = +1.2, local y = +1.2)
    pts.push(new THREE.Vector2(0, 1.205));

    return new THREE.LatheGeometry(pts, 32);
  }, [profile]);

  useFrame((_, delta) => {
    if (isRunning && meshRef.current) {
      const spinSpeed = Math.min(35, (rpm / 60) * Math.PI * 2);
      meshRef.current.rotation.y += delta * spinSpeed;
    }
  });

  return (
    <group position={[0, 1.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.88}
          roughness={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// 3-Jaw Chuck with Rotating Jaws
const ChuckSpindle = ({ isRunning, rpm = 800 }) => {
  const chuckRef = useRef();

  useFrame((_, delta) => {
    if (isRunning && chuckRef.current) {
      const spinSpeed = Math.min(35, (rpm / 60) * Math.PI * 2);
      chuckRef.current.rotation.x += delta * spinSpeed;
    }
  });

  return (
    <group position={[-1.45, 1.2, 0]}>
      {/* Chuck Assembly rotating around X axis */}
      <group ref={chuckRef} rotation={[0, 0, -Math.PI / 2]}>
        {/* Main Chuck Body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.45, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Chuck Face Plate */}
        <mesh position={[0, 0.23, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.02, 32]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* 3 Hardened Steel Jaws */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
          <group key={idx} rotation={[0, angle, 0]}>
            <mesh position={[0.26, 0.28, 0]} castShadow>
              <boxGeometry args={[0.22, 0.14, 0.12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.22, 0.36, 0]} castShadow>
              <boxGeometry args={[0.12, 0.06, 0.1]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

// Carriage & Tool Post with EXACT Tip Alignment
// toolPosition: { z: mm (0 to -100), d: mm (diameter, 50 = raw surface) }
const ToolAssembly = ({ toolPosition, isCutting, coolant }) => {
  const toolZ = toolPosition && toolPosition.z !== undefined ? toolPosition.z : 0;
  const toolD = toolPosition && toolPosition.d !== undefined ? toolPosition.d : 50;

  // Exact World Tip Position:
  // Z=0 mm -> X = +1.2 (tailstock edge)
  // Z=-100 mm -> X = -1.2 (chuck face)
  const tipX = 1.2 + (toolZ / 100) * 2.4;

  // Centerline is at Y = 1.2
  const tipY = 1.2;

  // Workpiece front surface at diameter D is at radius = D * 0.006
  const tipZ = (toolD / 2) * (0.30 / 25); // exactly toolD * 0.006

  const cuttingContactPos = [tipX, tipY, tipZ];

  return (
    <group>
      {/* SADDLE (Eretan Alas) on the Bedways - slides along X with tipX */}
      <mesh position={[tipX, 0.65, 0.38]} castShadow>
        <boxGeometry args={[0.65, 0.32, 1.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* CROSS SLIDE (Eretan Melintang) - slides in Z with tipZ */}
      <mesh position={[tipX, 0.88, tipZ + 0.32]} castShadow>
        <boxGeometry args={[0.42, 0.16, 0.55]} />
        <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Handwheel for Cross Slide */}
      <group position={[tipX, 0.88, tipZ + 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.11, 0.11, 0.03, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* TOOL POST (Rumah Pahat) on Cross Slide */}
      <mesh position={[tipX, 1.05, tipZ + 0.22]} castShadow>
        <boxGeometry args={[0.22, 0.18, 0.22]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Tool Post Clamp Lever */}
      <mesh position={[tipX, 1.18, tipZ + 0.22]}>
        <cylinderGeometry args={[0.015, 0.015, 0.12, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>

      {/* TOOL SHANK & CARBIDE INSERT */}
      {/* Black Oxide Steel Tool Shank */}
      <mesh position={[tipX + 0.035, 1.18, tipZ + 0.11]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.2]} />
        <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* GOLD CARBIDE INSERT - Tip is positioned EXACTLY at [tipX, tipY, tipZ] */}
      {/* Diamond shape rotated 45 deg around Y. Front sharp corner reaches [tipX, tipY, tipZ] */}
      <group position={[tipX, tipY, tipZ]}>
        <mesh position={[0, 0, 0.0424]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[0.06, 0.03, 0.06]} />
          <meshStandardMaterial
            color={isCutting ? "#f59e0b" : "#eab308"}
            metalness={0.92}
            roughness={0.15}
            emissive={isCutting ? "#b45309" : "#000000"}
            emissiveIntensity={isCutting ? 0.7 : 0}
          />
        </mesh>

        {/* Small glowing spot at the very cutting edge when cutting */}
        {isCutting && (
          <mesh position={[0, 0, 0.005]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        )}
      </group>

      {/* Chips Particle Stream flying directly from the cutting contact point */}
      <CuttingChips isCutting={isCutting} position={cuttingContactPos} />

      {/* Coolant Hose and Jet pointed right at the tool tip */}
      {coolant && (
        <group position={[tipX - 0.12, 1.5, tipZ + 0.18]}>
          <mesh>
            <cylinderGeometry args={[0.018, 0.018, 0.35, 12]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          {/* Coolant stream aimed at tip */}
          <mesh position={[0.06, -0.22, -0.1]} rotation={[0.4, 0, -0.3]}>
            <cylinderGeometry args={[0.012, 0.004, 0.35, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Tailstock (Kepala Lepas)
const Tailstock = () => {
  return (
    <group position={[1.65, 1.2, 0]}>
      {/* Base & Body */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <boxGeometry args={[0.65, 0.65, 0.65]} />
        <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Quill / Barrel */}
      <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.55, 24]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Live Center (Center Putar Conical Tip) */}
      <mesh position={[-0.58, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.12, 0.2, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Handwheel */}
      <mesh position={[0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
};

// Lathe Bed & Headstock Structure
const LatheStructure = () => {
  return (
    <group>
      {/* HEADSTOCK (Kepala Tetap) */}
      <mesh position={[-2.15, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.4, 0.95]} />
        <meshStandardMaterial color="#0284c7" metalness={0.65} roughness={0.4} />
      </mesh>
      {/* Headstock Front Control Plate */}
      <mesh position={[-2.15, 1.4, 0.49]}>
        <planeGeometry args={[0.85, 0.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* LATHE BED (Alas Mesin) */}
      <mesh position={[0, 0.35, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.45, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.5} />
      </mesh>

      {/* Prismatic V-Ways (Rel Alas Presisi) */}
      <mesh position={[0, 0.6, 0.25]} receiveShadow>
        <boxGeometry args={[4.0, 0.08, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.6, -0.25]} receiveShadow>
        <boxGeometry args={[4.0, 0.08, 0.12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Lead Screw (Poros Transportir) & Feed Rod */}
      <mesh position={[0, 0.4, 0.44]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 4.0, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.3, 0.44]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 4.0, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* CHIP TRAY (Bak Penampung Tatal) */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.12, 1.3]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* LEGS / PEDESTAL */}
      <mesh position={[-1.7, -0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.95, 0.9]} />
        <meshStandardMaterial color="#0369a1" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[1.7, -0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.95, 0.9]} />
        <meshStandardMaterial color="#0369a1" metalness={0.6} roughness={0.4} />
      </mesh>

    </group>
  );
};

const Lathe3D_Engine = ({
  isRunning = false,
  toolPosition = { z: 0, d: 50 },
  profile = null,
  rpm = 800,
  isCutting = false,
  coolant = false
}) => {
  const controlsRef = useRef();

  return (
    <Canvas
      shadows
      camera={{ position: [0.3, 2.2, 3.2], fov: 42 }}
      style={{ width: '100%', height: '100%', outline: 'none' }}
    >
      {/* 100% Clean, Bright, Seamless Studio Background */}
      <color attach="background" args={['#f8fafc']} />

      {/* Bright Studio Lighting */}
      <ambientLight intensity={1.4} />
      <directionalLight
        position={[5, 9, 6]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, 7, -3]} intensity={1.0} color="#e0f2fe" />
      <pointLight position={[0, 3, 2]} intensity={1.2} color="#ffffff" />

      {/* Lathe Scene Components */}
      <group position={[0, -0.2, 0]}>
        <LatheStructure />
        <ChuckSpindle isRunning={isRunning} rpm={rpm} />
        <RevolvedWorkpiece profile={profile} isRunning={isRunning} rpm={rpm} />
        <ToolAssembly toolPosition={toolPosition} isCutting={isCutting} coolant={coolant} />
        <Tailstock />
      </group>

      <ContactShadows
        position={[0, -0.92, 0]}
        opacity={0.6}
        scale={8}
        blur={2}
        far={4}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0.9, 0]}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={1.2}
        maxDistance={7}
      />
    </Canvas>
  );
};

export default Lathe3D_Engine;

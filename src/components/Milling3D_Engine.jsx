import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Swarf / Metal Chips flying from Endmill
const MillingChips = ({ isCutting, position }) => {
  const pointsRef = useRef();
  const count = 40;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1];
      pos[i * 3 + 2] = position[2];

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.5;
      vel[i * 3] = Math.cos(angle) * speed;
      vel[i * 3 + 1] = 0.6 + Math.random() * 1.0;
      vel[i * 3 + 2] = Math.sin(angle) * speed;
    }
    return [pos, vel];
  }, [position]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      if (isCutting) {
        posArr[i * 3] += velocities[i * 3] * delta * 3;
        posArr[i * 3 + 1] += velocities[i * 3 + 1] * delta * 3;
        posArr[i * 3 + 2] += velocities[i * 3 + 2] * delta * 3;
        velocities[i * 3 + 1] -= 9.8 * delta * 0.45;

        if (posArr[i * 3 + 1] < position[1] - 0.25) {
          posArr[i * 3] = position[0] + (Math.random() - 0.5) * 0.05;
          posArr[i * 3 + 1] = position[1];
          posArr[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.05;
          velocities[i * 3 + 1] = 0.8 + Math.random() * 1.0;
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
        size={0.038}
        color="#f59e0b"
        transparent
        opacity={isCutting ? 0.95 : 0}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Workpiece: Deformable top surface with 4 side walls and bottom base
// With Vertex Colors for high-contrast, crisp milled channel visibility
const WorkpieceBlock = ({ heightmap, workpieceSize, gridX = 60, gridY = 30 }) => {
  const worldScale = 0.03;
  const w = (workpieceSize.w || 100) * worldScale; // e.g. 100mm = 3.0 units
  const l = (workpieceSize.l || 50) * worldScale;  // e.g. 50mm = 1.5 units
  const t = (workpieceSize.t || 30) * worldScale;  // e.g. 30mm = 0.9 units

  // Visual depth scale factor: 1mm depth = 0.05 units in 3D for clear visibility
  const visualDepthScale = 0.05;

  // Create a persistent, stable PlaneGeometry with a color BufferAttribute
  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(w, l, gridX, gridY);
    const count = geom.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = 0.78;     // R (raw metallic silver)
      colors[i * 3 + 1] = 0.82; // G
      colors[i * 3 + 2] = 0.86; // B
    }
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [w, l, gridX, gridY]);

  // Dynamically update vertex heights and vertex colors whenever heightmap changes
  useEffect(() => {
    if (geometry && heightmap && heightmap.length > 0) {
      const posArr = geometry.attributes.position.array;
      const colArr = geometry.attributes.color.array;

      for (let i = 0; i < heightmap.length; i++) {
        // heightmap stores depth in mm (e.g. -1.0mm, -2.0mm)
        const depthMm = heightmap[i] || 0;

        // Plane geometry is rotated -90 deg around X, so local Z is vertical height (Y in world)
        posArr[i * 3 + 2] = depthMm * visualDepthScale;

        // Milled channel vertex coloring: High contrast, vivid CNC machining finish
        if (depthMm < -0.001) {
          const cutRatio = Math.min(1, Math.abs(depthMm) / 3.0);
          // Crisp, gleaming blue-silver milled channel:
          colArr[i * 3] = 0.05 + cutRatio * 0.15;     // R: dark metallic blue
          colArr[i * 3 + 1] = 0.52 + cutRatio * 0.25; // G: vibrant cyan highlight
          colArr[i * 3 + 2] = 0.88 + cutRatio * 0.10; // B: bright machined sheen
        } else {
          // Uncut raw stock metal
          colArr[i * 3] = 0.78;
          colArr[i * 3 + 1] = 0.82;
          colArr[i * 3 + 2] = 0.86;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  }, [heightmap, geometry, visualDepthScale]);

  const wallThickness = 0.02;

  return (
    <group position={[0, 0.45, 0]}>
      {/* Top Cut Surface - With dynamic vertex colors and depth deformation */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          metalness={0.65}
          roughness={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4 Side Walls and Base to create a realistic solid hollow box underneath */}
      {/* Front Wall (+Z) */}
      <mesh position={[0, -t / 2 - 0.005, l / 2 - wallThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, t, wallThickness]} />
        <meshStandardMaterial color="#64748b" metalness={0.65} roughness={0.35} />
      </mesh>
      {/* Back Wall (-Z) */}
      <mesh position={[0, -t / 2 - 0.005, -l / 2 + wallThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, t, wallThickness]} />
        <meshStandardMaterial color="#64748b" metalness={0.65} roughness={0.35} />
      </mesh>
      {/* Left Wall (-X) */}
      <mesh position={[-w / 2 + wallThickness / 2, -t / 2 - 0.005, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, t, l]} />
        <meshStandardMaterial color="#64748b" metalness={0.65} roughness={0.35} />
      </mesh>
      {/* Right Wall (+X) */}
      <mesh position={[w / 2 - wallThickness / 2, -t / 2 - 0.005, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, t, l]} />
        <meshStandardMaterial color="#64748b" metalness={0.65} roughness={0.35} />
      </mesh>
      {/* Bottom Base Floor */}
      <mesh position={[0, -t - 0.005, 0]} receiveShadow>
        <boxGeometry args={[w, 0.02, l]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Low-profile Clamping Fixture Base Plate beneath the block */}
      <mesh position={[0, -t - 0.035, 0]} receiveShadow>
        <boxGeometry args={[w + 0.35, 0.05, l + 0.35]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );
};

// Sleek Milling Machine Table (Meja Frais T-Slot) moving in X and Y (converted from mm)
const MillingTableAssembly = ({ tablePosition, heightmap, workpieceSize, gridX, gridY }) => {
  const worldScale = 0.03;
  const tableX_3D = (tablePosition.x || 0) * worldScale;
  const tableY_3D = (tablePosition.y || 0) * worldScale;

  return (
    <group position={[tableX_3D, 0, tableY_3D]}>
      {/* Heavy Precision T-Slot Table Bed */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.16, 2.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* T-Slots Grooves (Alur T) */}
      {[-0.6, -0.2, 0.2, 0.6].map((zPos, idx) => (
        <mesh key={idx} position={[0, 0.185, zPos]}>
          <boxGeometry args={[4.6, 0.02, 0.06]} />
          <meshStandardMaterial color="#0b0f19" roughness={0.9} />
        </mesh>
      ))}

      {/* Clamped Workpiece sitting directly on top */}
      <WorkpieceBlock
        heightmap={heightmap}
        workpieceSize={workpieceSize}
        gridX={gridX}
        gridY={gridY}
      />
    </group>
  );
};

// Vertical Spindle & Endmill
// Spindle tip is exactly at Y = 0.45 when spindlePosition.z = 0 (touch-off)
const VerticalSpindleHead = ({ spindlePosition, isRunning, toolDiameter, isCutting, coolant }) => {
  const cutterRef = useRef();
  const worldScale = 0.03;
  const visualDepthScale = 0.05;
  const toolRadius = (toolDiameter / 2) * worldScale;

  useFrame((_, delta) => {
    if (isRunning && cutterRef.current) {
      cutterRef.current.rotation.y += delta * 45;
    }
  });

  // When spindlePosition.z = 0 (in mm), bottom tip of endmill touches workpiece surface at Y = 0.45
  // spindlePosition.z > 0 elevates tool above workpiece
  // spindlePosition.z < 0 penetrates tool into workpiece
  const toolTipY = 0.45 + (spindlePosition.z || 0) * visualDepthScale;

  const endmillLength = 0.48; // ~16mm length of cut in 3D scale

  return (
    <group position={[0, toolTipY, 0]}>
      {/* Rotating 4-Flute Tungsten Carbide Endmill */}
      {/* Positioned at [0, endmillLength / 2, 0] so bottom tip is EXACTLY at y = 0 */}
      <group ref={cutterRef} position={[0, endmillLength / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[toolRadius, toolRadius, endmillLength, 24]} />
          <meshStandardMaterial
            color={isCutting ? "#f59e0b" : "#e2e8f0"}
            metalness={0.95}
            roughness={0.15}
            emissive={isCutting ? "#b45309" : "#000000"}
            emissiveIntensity={isCutting ? 0.7 : 0}
          />
        </mesh>

        {/* 4 Spiral Flute Cutting Edges */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
          <mesh key={i} rotation={[0, ang, 0]} position={[toolRadius * 0.72, 0, 0]}>
            <boxGeometry args={[0.014, endmillLength - 0.02, 0.014]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        ))}
      </group>

      {/* Collet Chuck (ER32 / BT40 Toolholder) directly above endmill */}
      <mesh position={[0, endmillLength + 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.09, 0.12, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, endmillLength + 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.11, 0.2, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Spindle Nose */}
      <mesh position={[0, endmillLength + 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.2, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Spindle Quill / Heavy Machine Housing */}
      <mesh position={[0, endmillLength + 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 1.5, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Cutting Chips Emitter - Emitters right at tool contact point y = 0.01 */}
      <MillingChips isCutting={isCutting} position={[0, 0.01, 0]} />

      {/* Coolant Flexible Hose & Stream */}
      {coolant && (
        <group position={[0.28, endmillLength + 0.35, 0.15]}>
          <mesh rotation={[0.4, 0, -0.5]}>
            <cylinderGeometry args={[0.016, 0.006, 0.55, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} />
          </mesh>
        </group>
      )}
    </group>
  );
};

const Milling3D_Engine = ({
  isRunning = false,
  tablePosition = { x: 0, y: 0 },
  spindlePosition = { z: 5 },
  heightmap = [],
  workpieceSize = { w: 100, l: 50, t: 30 },
  toolDiameter = 10,
  isCutting = false,
  coolant = false,
  gridX = 60,
  gridY = 30
}) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2.4, 3.2], fov: 42 }}
      style={{ width: '100%', height: '100%', outline: 'none' }}
    >
      {/* 100% Clean, Bright, Seamless Studio Background - Zero Gray Blocks */}
      <color attach="background" args={['#f8fafc']} />

      {/* Bright Studio Lighting */}
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[4, 9, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 7, -3]} intensity={1.1} color="#e0f2fe" />
      <pointLight position={[0, 3, 1]} intensity={1.2} />

      {/* Milling Components - 100% Unobstructed */}
      <group position={[0, -0.1, 0]}>
        <MillingTableAssembly
          tablePosition={tablePosition}
          heightmap={heightmap}
          workpieceSize={workpieceSize}
          gridX={gridX}
          gridY={gridY}
        />
        <VerticalSpindleHead
          spindlePosition={spindlePosition}
          isRunning={isRunning}
          toolDiameter={toolDiameter}
          isCutting={isCutting}
          coolant={coolant}
        />
      </group>

      <OrbitControls
        makeDefault
        target={[0, 0.45, 0]}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={1.0}
        maxDistance={6.0}
      />
    </Canvas>
  );
};

export default Milling3D_Engine;

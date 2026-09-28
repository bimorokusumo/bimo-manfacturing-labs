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
// Workpiece rendered with dynamic revolved profile
// 100mm length = 2.4 world units (X: -1.2 to +1.2)
// 50mm diameter = 0.60 world diameter (0.30 radius) -> scale = 0.006 per mm
const RevolvedWorkpiece = ({ profile, isRunning, rpm = 800, rawDiameter = 50, rawLength = 100 }) => {
  const meshRef = useRef();

  // Create Lathe Geometry from mm profile
  const geometry = useMemo(() => {
    const pts = [];
    const segments = profile ? profile.length : 30;
    const halfLen = (rawLength / 100) * 1.2;

    // Base cap at chuck face (world X = -halfLen, local y = -halfLen)
    pts.push(new THREE.Vector2(0, -halfLen - 0.005));

    // Order points strictly from local y = -halfLen (chuck) to +halfLen (tailstock)
    for (let i = segments - 1; i >= 0; i--) {
      const y = -halfLen + ((segments - 1 - i) / (segments - 1)) * (halfLen * 2);
      const diaMm = profile && profile[i] !== undefined ? profile[i] : rawDiameter;
      const radius = Math.max(0.03, (diaMm / 2) * (0.30 / 25)); // diaMm * 0.006
      pts.push(new THREE.Vector2(radius, y));
    }

    // Tip cap at tailstock (world X = +halfLen, local y = +halfLen)
    pts.push(new THREE.Vector2(0, halfLen + 0.005));

    return new THREE.LatheGeometry(pts, 32);
  }, [profile, rawDiameter, rawLength]);

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
const ChuckSpindle = ({ isRunning, rpm = 800, rawLength = 100 }) => {
  const chuckRef = useRef();
  const chuckX = -((rawLength / 100) * 1.2 + 0.25);

  useFrame((_, delta) => {
    if (isRunning && chuckRef.current) {
      const spinSpeed = Math.min(35, (rpm / 60) * Math.PI * 2);
      chuckRef.current.rotation.x += delta * spinSpeed;
    }
  });

  return (
    <group position={[chuckX, 1.2, 0]}>
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
// toolPosition: { z: mm (0 to -rawLength), d: mm (diameter) }
const ToolAssembly = ({
  toolPosition,
  isCutting,
  coolant,
  rawDiameter = 50,
  rawLength = 100,
  toolType = 'rata', // 'rata', 'alur', 'facing'
  toolOrientation = 'vertical' // 'vertical' (posisi vertikal sesuai request)
}) => {
  const toolZ = toolPosition && toolPosition.z !== undefined ? toolPosition.z : 0;
  const toolD = toolPosition && toolPosition.d !== undefined ? (toolPosition.d ?? toolPosition.x) : rawDiameter;

  // Exact World Tip Position:
  // Z=0 mm -> front face (tailstock edge of workpiece)
  // Z=-rawLength mm -> chuck face
  const halfLen = (rawLength / 100) * 1.2;
  const tipX = halfLen + (toolZ / rawLength) * (halfLen * 2);

  // Centerline is at Y = 1.2
  const tipY = 1.2;

  // Workpiece front surface at diameter D is at radius = D * 0.006
  const tipZ = (toolD / 2) * (0.30 / 25);

  const cuttingContactPos = [tipX, tipY, tipZ];
  const isVertical = toolOrientation === 'vertical';

  // 1. Rhombic 80° turning insert (Pahat Rata Kanan, T0101):
  // Nose at [0, 0, 0] points strictly LEFT (-X) and into cut (-Z).
  // ALL other vertices are at +X and +Z with negative Y for clearance.
  const rhombicInsertGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Top face (Rake face at Y = 0)
      0, 0, 0,    0.010, 0, 0.055,    0.065, 0, 0.065,
      0, 0, 0,    0.065, 0, 0.065,    0.055, 0, 0.010,

      // Bottom face (relieved at Y = -0.024)
      0.003, -0.024, 0.003,   0.062, -0.024, 0.062,   0.012, -0.024, 0.052,
      0.003, -0.024, 0.003,   0.052, -0.024, 0.012,   0.062, -0.024, 0.062,

      // Leading cutting edge (faces LEFT / -X towards chuck & cut shoulder)
      0, 0, 0,    0.003, -0.024, 0.003,   0.012, -0.024, 0.052,
      0, 0, 0,    0.012, -0.024, 0.052,   0.010, 0, 0.055,

      // Trailing clearance edge (faces -Z towards turned cylinder)
      0, 0, 0,    0.055, 0, 0.010,        0.052, -0.024, 0.012,
      0, 0, 0,    0.052, -0.024, 0.012,   0.003, -0.024, 0.003,

      // Back outer flank
      0.010, 0, 0.055,    0.012, -0.024, 0.052,   0.062, -0.024, 0.062,
      0.010, 0, 0.055,    0.062, -0.024, 0.062,   0.065, 0, 0.065,

      // Back rear flank
      0.055, 0, 0.010,    0.065, 0, 0.065,        0.062, -0.024, 0.062,
      0.055, 0, 0.010,    0.062, -0.024, 0.062,   0.052, -0.024, 0.012,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 2. Grooving blade insert 3mm (Pahat Alur, T0202):
  // Slender flat-front rectangular blade: width 3mm (0.018 in X) at Z=0.
  // Deep neck reach extending back to Z = 0.058 with side relief.
  const groovingInsertGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Top face (flat horizontal blade top at Y = 0)
      -0.009, 0, 0,       0.009, 0, 0,        0.007, 0, 0.058,
      -0.009, 0, 0,       0.007, 0, 0.058,   -0.007, 0, 0.058,
      // Bottom face (at Y = -0.032, narrower for clearance)
      -0.008, -0.032, 0.002,   0.006, -0.032, 0.056,   0.008, -0.032, 0.002,
      -0.008, -0.032, 0.002,  -0.006, -0.032, 0.056,   0.006, -0.032, 0.056,
      // Front cutting face (contacts groove at Z = 0, flat 3mm width)
      -0.009, 0, 0,      -0.008, -0.032, 0.002,   0.008, -0.032, 0.002,
      -0.009, 0, 0,       0.008, -0.032, 0.002,   0.009, 0, 0,
      // Left side flank (relief angle)
      -0.009, 0, 0,      -0.007, 0, 0.058,       -0.006, -0.032, 0.056,
      -0.009, 0, 0,      -0.006, -0.032, 0.056,  -0.008, -0.032, 0.002,
      // Right side flank (relief angle)
      0.009, 0, 0,        0.008, -0.032, 0.002,   0.006, -0.032, 0.056,
      0.009, 0, 0,        0.006, -0.032, 0.056,   0.007, 0, 0.058,
      // Back face (held in clamp)
      -0.007, 0, 0.058,   0.007, 0, 0.058,        0.006, -0.032, 0.056,
      -0.007, 0, 0.058,   0.006, -0.032, 0.056,  -0.006, -0.032, 0.056,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 3. Threading 60° Laydown Insert (Pahat Ulir Luar 60°, T0404 / ISO 16ER):
  // Equilateral 60° triangle with sharp 60° V-crest apex at [0, 0, 0] plunging radially along -Z.
  // Left flank at -30°, right flank at +30°.
  const threadingInsertGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Top face (Y = 0)
      0, 0, 0,        0.024, 0, 0.042,     -0.024, 0, 0.042,
      // Bottom face (relieved at Y = -0.022)
      0, -0.022, 0.003,   -0.021, -0.022, 0.040,   0.021, -0.022, 0.040,
      // Left 60° thread cutting flank
      0, 0, 0,        -0.024, 0, 0.042,    -0.021, -0.022, 0.040,
      0, 0, 0,        -0.021, -0.022, 0.040, 0, -0.022, 0.003,
      // Right 60° thread cutting flank
      0, 0, 0,        0, -0.022, 0.003,     0.021, -0.022, 0.040,
      0, 0, 0,        0.021, -0.022, 0.040, 0.024, 0, 0.042,
      // Back face
      -0.024, 0, 0.042, 0.024, 0, 0.042,   0.021, -0.022, 0.040,
      -0.024, 0, 0.042, 0.021, -0.022, 0.040, -0.021, -0.022, 0.040,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 4. Facing insert (Pahat Facing, T0303):
  // Triangular insert, sharp nose at [0,0,0] points directly LEFT (-X) into end face.
  const facingInsertGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Top face
      0, 0, 0,    0.005, 0, 0.055,    0.050, 0, 0.012,
      // Bottom face
      0.003, -0.024, 0.003,   0.047, -0.024, 0.014,   0.008, -0.024, 0.052,
      // Face cutting edge (contacts end face along Z, faces -X)
      0, 0, 0,    0.003, -0.024, 0.003,   0.008, -0.024, 0.052,
      0, 0, 0,    0.008, -0.024, 0.052,   0.005, 0, 0.055,
      // Trailing clearance edge
      0, 0, 0,    0.050, 0, 0.012,        0.047, -0.024, 0.014,
      0, 0, 0,    0.047, -0.024, 0.014,   0.003, -0.024, 0.003,
      // Back edge
      0.005, 0, 0.055,   0.008, -0.024, 0.052,   0.047, -0.024, 0.014,
      0.005, 0, 0.055,   0.047, -0.024, 0.014,   0.050, 0, 0.012,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* SADDLE / CNC SLIDE BASE on the Bedways - slides along X with tipX */}
      <mesh position={[tipX + 0.12, 0.65, 0.45]} castShadow>
        <boxGeometry args={[0.65, 0.32, 1.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* CROSS SLIDE (Eretan Melintang CNC) - slides in Z with tipZ */}
      <mesh position={[tipX + 0.10, 0.88, tipZ + 0.38]} castShadow>
        <boxGeometry args={[0.42, 0.16, 0.55]} />
        <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.35} />
      </mesh>

      {isVertical ? (
        /* ========================================================================= */
        /* VERTICAL CNC TURRET & TOOL HOLDER (POSISI VERTIKAL SESUAI PERMINTAAN)    */
        /* ========================================================================= */
        <group>
          {/* Vertical Turret Column / Support Bracket */}
          <mesh position={[tipX + 0.065, 1.38, tipZ + 0.18]} castShadow>
            <boxGeometry args={[0.26, 0.48, 0.24]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* CNC Indexing Turret Disc (Vertical Axis) */}
          <group position={[tipX + 0.065, 1.62, tipZ + 0.18]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.18, 0.18, 0.20, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Turret Station Badge Indicator */}
            <mesh position={[0, 0.11, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
              <meshStandardMaterial
                color={
                  toolType === 'rata' ? '#38bdf8' :
                  toolType === 'alur' ? '#fbbf24' :
                  toolType === 'ulir' ? '#c084fc' : '#34d399'
                }
              />
            </mesh>
          </group>

          {/* VERTICAL TOOL SHANK (Batang Pahat Menjulur Vertikal di Belakang Pahat) */}
          {/* Positioned safely at +X and +Z so ONLY the insert tip touches the workpiece! */}
          <mesh position={[tipX + 0.048, tipY + 0.14, tipZ + 0.055]} castShadow>
            <boxGeometry args={[0.045, 0.28, 0.045]} />
            <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Steel shim / insert seat underneath insert */}
          <mesh position={[tipX + 0.038, tipY - 0.030, tipZ + 0.038]}>
            <boxGeometry args={[0.048, 0.012, 0.048]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* Tool Clamping Wedge Screws */}
          <mesh position={[tipX + 0.048, tipY + 0.20, tipZ + 0.082]}>
            <cylinderGeometry args={[0.010, 0.010, 0.018, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
          </mesh>

          {/* INSERT SELECTION AT CUTTING TIP (tipX, tipY, tipZ) - HADAP KIRI */}
          <group position={[tipX, tipY, tipZ]}>
            {toolType === 'rata' && (
              /* 1. PAHAT RATA KANAN (Rhombic 80 deg Insert - Hadap KIRI, HANYA Ujung Lancip Menyentuh) */
              <group>
                <mesh geometry={rhombicInsertGeo} castShadow>
                  <meshStandardMaterial
                    color={isCutting ? "#f59e0b" : "#eab308"}
                    metalness={0.95}
                    roughness={0.15}
                    emissive={isCutting ? "#b45309" : "#000000"}
                    emissiveIntensity={isCutting ? 0.8 : 0}
                  />
                </mesh>
                {/* Torx Clamping Screw in Center of Insert */}
                <mesh position={[0.032, 0.001, 0.032]}>
                  <cylinderGeometry args={[0.008, 0.008, 0.004, 12]} />
                  <meshStandardMaterial color="#713f12" metalness={0.9} />
                </mesh>
              </group>
            )}

            {toolType === 'alur' && (
              /* 2. PAHAT ALUR (Slender 3mm Grooving / Parting Blade) */
              <group>
                <mesh geometry={groovingInsertGeo} castShadow>
                  <meshStandardMaterial
                    color={isCutting ? "#f59e0b" : "#d97706"}
                    metalness={0.95}
                    roughness={0.15}
                    emissive={isCutting ? "#b45309" : "#000000"}
                    emissiveIntensity={isCutting ? 0.8 : 0}
                  />
                </mesh>
                {/* Blade Holder Clamp Head */}
                <mesh position={[0, 0.015, 0.048]}>
                  <boxGeometry args={[0.024, 0.020, 0.025]} />
                  <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.028, 0.048]}>
                  <cylinderGeometry args={[0.006, 0.006, 0.008, 10]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
                </mesh>
              </group>
            )}

            {toolType === 'ulir' && (
              /* 3. PAHAT ULIR (Equilateral 60° Triangular Laydown Insert 16ER) */
              <group>
                <mesh geometry={threadingInsertGeo} castShadow>
                  <meshStandardMaterial
                    color={isCutting ? "#f59e0b" : "#a855f7"}
                    metalness={0.95}
                    roughness={0.15}
                    emissive={isCutting ? "#7e22ce" : "#000000"}
                    emissiveIntensity={isCutting ? 0.85 : 0}
                  />
                </mesh>
                {/* Anvil Shim underneath */}
                <mesh position={[0, -0.028, 0.028]}>
                  <boxGeometry args={[0.046, 0.008, 0.038]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.8} />
                </mesh>
                {/* Central Torx Screw */}
                <mesh position={[0, 0.001, 0.026]}>
                  <cylinderGeometry args={[0.007, 0.007, 0.004, 12]} />
                  <meshStandardMaterial color="#581c87" metalness={0.9} />
                </mesh>
              </group>
            )}

            {toolType === 'facing' && (
              /* 4. PAHAT FACING (Sharp Wedge Triangular Facing Insert - Hadap KIRI ke Muka) */
              <group>
                <mesh geometry={facingInsertGeo} castShadow>
                  <meshStandardMaterial
                    color={isCutting ? "#f59e0b" : "#10b981"}
                    metalness={0.95}
                    roughness={0.15}
                    emissive={isCutting ? "#047857" : "#000000"}
                    emissiveIntensity={isCutting ? 0.8 : 0}
                  />
                </mesh>
                {/* Torx Screw */}
                <mesh position={[0.022, 0.001, 0.022]}>
                  <cylinderGeometry args={[0.007, 0.007, 0.004, 12]} />
                  <meshStandardMaterial color="#064e3b" metalness={0.9} />
                </mesh>
              </group>
            )}

            {/* Glowing Spark Point when cutting - EXACTLY at sharp tip [0,0,0] */}
            {isCutting && (
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.010, 8, 8]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
            )}
          </group>
        </group>
      ) : (
        /* HORIZONTAL FALLBACK (jika mode manual) */
        <group>
          <mesh position={[tipX + 0.05, 1.05, tipZ + 0.22]} castShadow>
            <boxGeometry args={[0.22, 0.18, 0.22]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[tipX + 0.045, 1.18, tipZ + 0.06]} castShadow>
            <boxGeometry args={[0.05, 0.05, 0.12]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.2} />
          </mesh>
          <group position={[tipX, tipY, tipZ]}>
            <mesh geometry={rhombicInsertGeo} castShadow>
              <meshStandardMaterial
                color={isCutting ? "#f59e0b" : "#eab308"}
                metalness={0.92}
                roughness={0.15}
              />
            </mesh>
          </group>
        </group>
      )}

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
const Tailstock = ({ rawLength = 100 }) => {
  const tailstockX = (rawLength / 100) * 1.2 + 0.45;
  return (
    <group position={[tailstockX, 1.2, 0]}>
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
  rawDiameter = 50,
  rawLength = 100,
  toolType = 'rata',
  toolOrientation = 'vertical',
  rpm = 800,
  isCutting = false,
  coolant = false,
  showTailstock = false
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
        <ChuckSpindle isRunning={isRunning} rpm={rpm} rawLength={rawLength} />
        <RevolvedWorkpiece profile={profile} isRunning={isRunning} rpm={rpm} rawDiameter={rawDiameter} rawLength={rawLength} />
        <ToolAssembly
          toolPosition={toolPosition}
          isCutting={isCutting}
          coolant={coolant}
          rawDiameter={rawDiameter}
          rawLength={rawLength}
          toolType={toolType}
          toolOrientation={toolOrientation}
        />
        {showTailstock && <Tailstock rawLength={rawLength} />}
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

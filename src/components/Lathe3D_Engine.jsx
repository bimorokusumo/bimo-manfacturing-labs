import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { generateSteppedProfileSegments, parseGcodeToolpath } from '../utils/latheToolpath';

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

// Workpiece rendered with dynamic stepped revolved profile (SUDUT 90 DERAJAT BERSIH, BEBAS TIRUS)
// 100mm length = 2.4 world units (X: -1.2 to +1.2)
// 50mm diameter = 0.60 world diameter (0.30 radius) -> scale = 0.006 per mm
const RevolvedWorkpiece = ({ profile, isRunning, rpm = 800, rawDiameter = 50, rawLength = 100 }) => {
  const meshRef = useRef();

  // Create Lathe Geometry with strictly perpendicular 90-degree step faces
  const geometry = useMemo(() => {
    const pts = [];
    const segmentsCount = profile ? profile.length : 100;
    const halfLen = (rawLength / 100) * 1.2;
    const radScale = 0.30 / 25; // 0.006 per mm

    const stepSegments = generateSteppedProfileSegments(profile, rawDiameter);

    // Base center cap at chuck face (local y = -halfLen)
    pts.push(new THREE.Vector2(0, -halfLen - 0.005));

    // Traverse segments from chuck (y = -halfLen) to front face (y = +halfLen)
    // Index 0 in profile is front face, Index N-1 is chuck face.
    // So we iterate through stepSegments in reverse (from chuck segment to face segment)
    for (let s = stepSegments.length - 1; s >= 0; s--) {
      const seg = stepSegments[s];
      const yChuck = -halfLen + ((segmentsCount - 1 - seg.endIndex) / (segmentsCount - 1)) * (halfLen * 2);
      const yFace = -halfLen + ((segmentsCount - 1 - seg.startIndex) / (segmentsCount - 1)) * (halfLen * 2);
      const radius = Math.max(0.02, (seg.diameter / 2) * radScale);

      // Chuck-side point
      pts.push(new THREE.Vector2(radius, yChuck));
      // Face-side point
      pts.push(new THREE.Vector2(radius, yFace));

      // When the next segment closer to the front face has a different radius,
      // it will push (nextRadius, yFace) at the EXACT SAME yFace!
      // Revolving this Delta y = 0 radial segment creates an EXACT 90-DEGREE PLANAR DISC SHOULDER!
    }

    // Tip center cap at front face (local y = +halfLen)
    pts.push(new THREE.Vector2(0, halfLen + 0.005));

    return new THREE.LatheGeometry(pts, 48);
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
  toolType = 'rata', // 'rata', 'finishing', 'facing', 'alur', 'ulir', 'ratakiri', 'centerdrill', 'udrill'
  toolOrientation = 'front', // 'front' (posisi di depan menghadap operator)
  activeTurretStation = 1
}) => {
  const stationNum = activeTurretStation || (
    toolType === 'rata' ? 1 :
    toolType === 'finishing' ? 2 :
    toolType === 'facing' ? 3 :
    toolType === 'alur' ? 4 :
    toolType === 'ulir' ? 5 :
    toolType === 'ratakiri' ? 6 :
    toolType === 'centerdrill' ? 7 :
    toolType === 'udrill' ? 8 : 1
  );
  const effectiveToolType = (
    stationNum === 1 ? 'rata' :
    stationNum === 2 ? 'finishing' :
    stationNum === 3 ? 'facing' :
    stationNum === 4 ? 'alur' :
    stationNum === 5 ? 'ulir' :
    stationNum === 6 ? 'ratakiri' :
    stationNum === 7 ? 'centerdrill' :
    stationNum === 8 ? 'udrill' : (toolType || 'rata')
  );
  const turretAngle = - (stationNum - 1) * (Math.PI / 4);
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

  // 1. Rhombic 80 deg turning insert (Pahat Rata Kanan, T0101 / WNMG 080408):
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

  // 2. Finishing Triangular 60 deg Insert (Pahat Finishing Kanan, T0202 / TNMG 160404):
  // Equilateral triangle 60 deg nose for fine precision finishing turning
  const finishingInsertGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Top face (Y = 0)
      0, 0, 0,        0.008, 0, 0.052,     0.052, 0, 0.024,
      // Bottom face (relieved at Y = -0.024)
      0.002, -0.024, 0.002,   0.050, -0.024, 0.024,   0.010, -0.024, 0.050,
      // Leading cutting edge (faces -X)
      0, 0, 0,        0.002, -0.024, 0.002,   0.010, -0.024, 0.050,
      0, 0, 0,        0.010, -0.024, 0.050,   0.008, 0, 0.052,
      // Trailing edge
      0, 0, 0,        0.052, 0, 0.024,        0.050, -0.024, 0.024,
      0, 0, 0,        0.050, -0.024, 0.024,   0.002, -0.024, 0.002,
      // Rear flank
      0.008, 0, 0.052, 0.010, -0.024, 0.050,   0.050, -0.024, 0.024,
      0.008, 0, 0.052, 0.050, -0.024, 0.024,   0.052, 0, 0.024,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 3. Grooving blade insert 3mm (Pahat Alur, T0404):
  // Slender flat-front rectangular blade: width 3mm (0.018 in X) at Z=0.
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

  // 4. Threading 60 deg Laydown Insert (Pahat Ulir Luar 60 deg, T0505 / ISO 16ER):
  // Equilateral 60 deg triangle with sharp 60 deg V-crest apex at [0, 0, 0] plunging radially along -Z.
  const threadingInsertGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Top face (Y = 0)
      0, 0, 0,        0.024, 0, 0.042,     -0.024, 0, 0.042,
      // Bottom face (relieved at Y = -0.022)
      0, -0.022, 0.003,   -0.021, -0.022, 0.040,   0.021, -0.022, 0.040,
      // Left 60 deg thread cutting flank
      0, 0, 0,        -0.024, 0, 0.042,    -0.021, -0.022, 0.040,
      0, 0, 0,        -0.021, -0.022, 0.040, 0, -0.022, 0.003,
      // Right 60 deg thread cutting flank
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

  // 5. Facing insert (Pahat Facing 93 deg, T0303):
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

  // 6. Left-hand Rhombic 80 deg Insert (Pahat Rata Kiri, T0606 / WNMG-L):
  // Nose at [0,0,0], cutting edge facing +X towards tailstock
  const ratakiriInsertGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Top face
      0, 0, 0,   -0.010, 0, 0.055,   -0.065, 0, 0.065,
      0, 0, 0,   -0.065, 0, 0.065,   -0.055, 0, 0.010,
      // Bottom face
      -0.003, -0.024, 0.003,  -0.062, -0.024, 0.062,  -0.012, -0.024, 0.052,
      -0.003, -0.024, 0.003,  -0.052, -0.024, 0.012,  -0.062, -0.024, 0.062,
      // Cutting edge (faces +X towards tailstock)
      0, 0, 0,   -0.010, 0, 0.055,   -0.012, -0.024, 0.052,
      0, 0, 0,   -0.012, -0.024, 0.052, -0.003, -0.024, 0.003,
      // Trailing edge
      0, 0, 0,   -0.003, -0.024, 0.003, -0.052, -0.024, 0.012,
      0, 0, 0,   -0.052, -0.024, 0.012, -0.055, 0, 0.010,
      // Rear flanks
      -0.010, 0, 0.055,  -0.065, 0, 0.065,  -0.062, -0.024, 0.062,
      -0.010, 0, 0.055,  -0.062, -0.024, 0.062, -0.012, -0.024, 0.052,
      -0.055, 0, 0.010,  -0.052, -0.024, 0.012, -0.062, -0.024, 0.062,
      -0.055, 0, 0.010,  -0.062, -0.024, 0.062, -0.065, 0, 0.065,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Shared Insert Component Rendered at Exact Cutting Tip [tipX, tipY, tipZ]
  const renderInsertAtTip = () => (
    <group position={[tipX, tipY, tipZ]}>
      {/* 1. PAHAT RATA KANAN (WNMG 80 deg Gold TiN Carbide) */}
      {(effectiveToolType === 'rata' || !effectiveToolType) && (
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
          <mesh position={[0.032, 0.001, 0.032]}>
            <cylinderGeometry args={[0.008, 0.008, 0.004, 12]} />
            <meshStandardMaterial color="#713f12" metalness={0.9} />
          </mesh>
        </group>
      )}

      {/* 2. PAHAT FINISHING KANAN (TNMG 60 deg Precision Triangular) */}
      {effectiveToolType === 'finishing' && (
        <group>
          <mesh geometry={finishingInsertGeo} castShadow>
            <meshStandardMaterial
              color={isCutting ? "#38bdf8" : "#06b6d4"}
              metalness={0.95}
              roughness={0.15}
              emissive={isCutting ? "#0284c7" : "#000000"}
              emissiveIntensity={isCutting ? 0.8 : 0}
            />
          </mesh>
          <mesh position={[0.022, 0.001, 0.024]}>
            <cylinderGeometry args={[0.007, 0.007, 0.004, 12]} />
            <meshStandardMaterial color="#164e63" metalness={0.9} />
          </mesh>
        </group>
      )}

      {/* 3. PAHAT FACING (93 deg Facing Wedge) */}
      {effectiveToolType === 'facing' && (
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
          <mesh position={[0.022, 0.001, 0.022]}>
            <cylinderGeometry args={[0.007, 0.007, 0.004, 12]} />
            <meshStandardMaterial color="#064e3b" metalness={0.9} />
          </mesh>
        </group>
      )}

      {/* 4. PAHAT ALUR (CoroCut 3mm Parting Blade) */}
      {effectiveToolType === 'alur' && (
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

      {/* 5. PAHAT ULIR (16ER 60 deg Laydown Threading Insert) */}
      {effectiveToolType === 'ulir' && (
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
          <mesh position={[0, -0.028, 0.028]}>
            <boxGeometry args={[0.046, 0.008, 0.038]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.001, 0.026]}>
            <cylinderGeometry args={[0.007, 0.007, 0.004, 12]} />
            <meshStandardMaterial color="#581c87" metalness={0.9} />
          </mesh>
        </group>
      )}

      {/* 6. PAHAT RATA KIRI (Left-Hand Rhombic 80 deg) */}
      {effectiveToolType === 'ratakiri' && (
        <group>
          <mesh geometry={ratakiriInsertGeo} castShadow>
            <meshStandardMaterial
              color={isCutting ? "#f59e0b" : "#818cf8"}
              metalness={0.95}
              roughness={0.15}
              emissive={isCutting ? "#4338ca" : "#000000"}
              emissiveIntensity={isCutting ? 0.8 : 0}
            />
          </mesh>
          <mesh position={[-0.032, 0.001, 0.032]}>
            <cylinderGeometry args={[0.008, 0.008, 0.004, 12]} />
            <meshStandardMaterial color="#312e81" metalness={0.9} />
          </mesh>
        </group>
      )}

      {/* 7. PAHAT BOR PUSAT / CENTER DRILL (DIN 333-A 60 deg Conical Tip) */}
      {effectiveToolType === 'centerdrill' && (
        <group position={[0, 0, 0.02]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.04, 0, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.08, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 2]} position={[0, 0, 0]} castShadow>
            <coneGeometry args={[0.016, 0.028, 16]} />
            <meshStandardMaterial
              color={isCutting ? "#f59e0b" : "#38bdf8"}
              metalness={0.95}
              roughness={0.15}
            />
          </mesh>
        </group>
      )}

      {/* 8. PAHAT BOR U-DRILL (Twin Carbide Insert Drill Body) */}
      {effectiveToolType === 'udrill' && (
        <group position={[0, 0, 0.02]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.05, 0, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.10, 20]} />
            <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[-0.01, 0.010, 0]} castShadow>
            <boxGeometry args={[0.014, 0.014, 0.014]} />
            <meshStandardMaterial color={isCutting ? "#f59e0b" : "#38bdf8"} metalness={0.95} />
          </mesh>
          <mesh position={[-0.01, -0.010, 0]} castShadow>
            <boxGeometry args={[0.014, 0.014, 0.014]} />
            <meshStandardMaterial color={isCutting ? "#f59e0b" : "#38bdf8"} metalness={0.95} />
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
  );

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
        /* OPTIONAL VERTICAL CNC TURRET (JIKA DIPILIH SECARA EKSPLISIT)             */
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

          {/* Vertical Tool Shank */}
          <mesh position={[tipX + 0.048, tipY + 0.14, tipZ + 0.055]} castShadow>
            <boxGeometry args={[0.045, 0.28, 0.045]} />
            <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Steel shim / insert seat underneath insert */}
          <mesh position={[tipX + 0.038, tipY - 0.030, tipZ + 0.038]}>
            <boxGeometry args={[0.048, 0.012, 0.048]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* Clamping Wedge Screws */}
          <mesh position={[tipX + 0.048, tipY + 0.20, tipZ + 0.082]}>
            <cylinderGeometry args={[0.010, 0.010, 0.018, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
          </mesh>

          {renderInsertAtTip()}
        </group>
      ) : (
        /* ========================================================================= */
        /* 8-STATION CNC ROTARY TURRET TOOL MAGAZINE INSIDE THE 3D LATHE SIMULATOR  */
        /* ========================================================================= */
        <group>
          {/* 1. FRONT CROSS-SLIDE APRON & HANDWHEEL (Menghadap Operator +Z) */}
          <mesh position={[tipX + 0.10, 0.88, tipZ + 0.66]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.014, 24]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[tipX + 0.10, 0.88, tipZ + 0.68]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.065, 0.010, 12, 32]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[tipX + 0.10, 0.88, tipZ + 0.68]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.020, 0.020, 0.024, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[tipX + 0.10, 0.88, tipZ + 0.68]}>
            <boxGeometry args={[0.12, 0.008, 0.008]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
          </mesh>
          <mesh position={[tipX + 0.10, 0.88, tipZ + 0.68]} rotation={[0, 0, Math.PI / 3]}>
            <boxGeometry args={[0.12, 0.008, 0.008]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
          </mesh>
          <mesh position={[tipX + 0.10, 0.88, tipZ + 0.68]} rotation={[0, 0, -Math.PI / 3]}>
            <boxGeometry args={[0.12, 0.008, 0.008]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
          </mesh>
          <mesh position={[tipX + 0.10 + 0.05, 0.88 + 0.02, tipZ + 0.71]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.010, 0.040, 12]} />
            <meshStandardMaterial color="#18181b" metalness={0.5} roughness={0.4} />
          </mesh>

          {/* 2. TURRET SADDLE PEDESTAL & SERVO DRIVE HOUSING */}
          <mesh position={[tipX + 0.08, 0.98, tipZ + 0.28]} castShadow>
            <cylinderGeometry args={[0.16, 0.18, 0.04, 28]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Main Turret Cast Housing Body */}
          <mesh position={[tipX + 0.08, 1.12, tipZ + 0.38]} castShadow>
            <boxGeometry args={[0.32, 0.28, 0.26]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Servo Indexing Motor at Rear */}
          <mesh position={[tipX + 0.08, 1.25, tipZ + 0.48]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.14, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[tipX + 0.08, 1.25, tipZ + 0.56]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} />
          </mesh>

          {/* Turret Nameplate Badge facing Operator */}
          <mesh position={[tipX + 0.08, 1.12, tipZ + 0.515]}>
            <boxGeometry args={[0.22, 0.055, 0.005]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Active Tool Station Indexing Pointer / Marker */}
          <mesh position={[tipX + 0.08, 1.20, tipZ + 0.06]}>
            <boxGeometry args={[0.015, 0.02, 0.03]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.6} />
          </mesh>

          {/* 3. ROTATING 8-STATION TURRET MAGAZINE DISC (Berputar live sesuai stasiun aktif) */}
          <group position={[tipX + 0.08, 1.20, tipZ + 0.28]} rotation={[turretAngle, 0, 0]}>
            {/* Turret Main Rotary Steel Disc Hub */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.12, 32]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* 8-Faceted Outer Indexing Turret Disc Rim */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.10, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Center Locking Spindle Cap */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.075, 0.075, 0.14, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.15} />
            </mesh>
            <mesh position={[-0.075, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 0.02, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
            </mesh>

            {/* 8 TOOL STATIONS MOUNTED RADIALLY AROUND THE TURRET DISC */}
            {[
              { id: 1, type: 'rata', name: 'Roughing WNMG 80°', color: '#eab308' },
              { id: 2, type: 'finishing', name: 'Finishing TNMG 60°', color: '#06b6d4' },
              { id: 3, type: 'facing', name: 'Facing 93°', color: '#10b981' },
              { id: 4, type: 'alur', name: 'Parting 3mm Blade', color: '#d97706' },
              { id: 5, type: 'ulir', name: 'Threading 16ER 60°', color: '#a855f7' },
              { id: 6, type: 'ratakiri', name: 'Left-Hand Turning', color: '#818cf8' },
              { id: 7, type: 'centerdrill', name: 'Center Drill DIN 333', color: '#38bdf8' },
              { id: 8, type: 'udrill', name: 'Indexable U-Drill Ø20', color: '#38bdf8' },
            ].map((st, idx) => {
              const theta = idx * (Math.PI / 4);
              const sy = 0.22 * Math.sin(theta);
              const sz = -0.22 * Math.cos(theta);
              const isCurActive = stationNum === st.id;

              return (
                <group key={st.id} position={[0, sy, sz]} rotation={[theta, 0, 0]}>
                  {/* Heavy Toolholder Pocket Clamp Block */}
                  <mesh position={[-0.035, 0, 0]} castShadow>
                    <boxGeometry args={[0.048, 0.044, 0.07]} />
                    <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.2} />
                  </mesh>
                  {/* Clamping Wedge Screws */}
                  <mesh position={[-0.035, 0.025, 0.015]}>
                    <cylinderGeometry args={[0.006, 0.006, 0.012, 8]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
                  </mesh>
                  <mesh position={[-0.035, 0.025, -0.015]}>
                    <cylinderGeometry args={[0.006, 0.006, 0.012, 8]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
                  </mesh>

                  {/* Station Number Badge on Disc Side */}
                  <mesh position={[-0.065, 0, 0.02]}>
                    <cylinderGeometry args={[0.016, 0.016, 0.005, 12]} rotation={[0, 0, Math.PI / 2]} />
                    <meshStandardMaterial
                      color={isCurActive ? st.color : '#475569'}
                      emissive={isCurActive ? st.color : '#000000'}
                      emissiveIntensity={isCurActive ? 0.6 : 0}
                    />
                  </mesh>

                  {/* Toolholder Shank Extending Radially Outward */}
                  <mesh position={[-0.035, 0, -0.045]} castShadow>
                    <boxGeometry args={[0.042, 0.042, 0.06]} />
                    <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.2} />
                  </mesh>

                  {/* Tool Cutting Tip / Insert mounted at outer edge */}
                  {st.id === 1 && (
                    <group position={[-0.08, 0, -0.06]}>
                      <mesh geometry={rhombicInsertGeo}>
                        <meshStandardMaterial color="#eab308" metalness={0.95} />
                      </mesh>
                    </group>
                  )}
                  {st.id === 2 && (
                    <group position={[-0.08, 0, -0.06]}>
                      <mesh geometry={finishingInsertGeo}>
                        <meshStandardMaterial color="#06b6d4" metalness={0.95} />
                      </mesh>
                    </group>
                  )}
                  {st.id === 3 && (
                    <group position={[-0.08, 0, -0.06]}>
                      <mesh geometry={facingInsertGeo}>
                        <meshStandardMaterial color="#10b981" metalness={0.95} />
                      </mesh>
                    </group>
                  )}
                  {st.id === 4 && (
                    <group position={[-0.08, 0, -0.06]}>
                      <mesh geometry={groovingInsertGeo}>
                        <meshStandardMaterial color="#d97706" metalness={0.95} />
                      </mesh>
                    </group>
                  )}
                  {st.id === 5 && (
                    <group position={[-0.08, 0, -0.06]}>
                      <mesh geometry={threadingInsertGeo}>
                        <meshStandardMaterial color="#a855f7" metalness={0.95} />
                      </mesh>
                    </group>
                  )}
                  {st.id === 6 && (
                    <group position={[-0.08, 0, -0.06]}>
                      <mesh geometry={ratakiriInsertGeo}>
                        <meshStandardMaterial color="#818cf8" metalness={0.95} />
                      </mesh>
                    </group>
                  )}
                  {st.id === 7 && (
                    <group position={[-0.08, 0, -0.06]}>
                      <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.014, 0.014, 0.06, 12]} />
                        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
                      </mesh>
                      <mesh rotation={[0, 0, -Math.PI / 2]} position={[0, 0, -0.035]}>
                        <coneGeometry args={[0.014, 0.024, 12]} />
                        <meshStandardMaterial color="#38bdf8" metalness={0.95} />
                      </mesh>
                    </group>
                  )}
                  {st.id === 8 && (
                    <group position={[-0.08, 0, -0.06]}>
                      <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.020, 0.020, 0.08, 16]} />
                        <meshStandardMaterial color="#475569" metalness={0.85} />
                      </mesh>
                    </group>
                  )}
                </group>
              );
            })}
          </group>

          {/* 4. ACTIVE CUTTING TOOL ENGAGEMENT AT WORKPIECE [tipX, tipY, tipZ] */}
          {renderInsertAtTip()}
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

// 3D Toolpath Overlay Component (G00 Rapid Yellow Lines & G01/G92 Cutting Cyan Lines)
const Toolpath3D = ({ gcodeText, rawDiameter = 50, rawLength = 100, currentLine = -1, isRunning = false }) => {
  const segments = useMemo(() => {
    return parseGcodeToolpath(gcodeText, rawDiameter, rawLength);
  }, [gcodeText, rawDiameter, rawLength]);

  const halfLen = (rawLength / 100) * 1.2;
  const radScale = 0.30 / 25;

  const { rapidLines, cutLines, activeLine } = useMemo(() => {
    const rapids = [];
    const cuts = [];
    let active = null;

    segments.forEach(seg => {
      const x1 = halfLen + (seg.from.z / rawLength) * (halfLen * 2);
      const y1 = 1.2;
      const z1 = (seg.from.x / 2) * radScale + 0.006;

      const x2 = halfLen + (seg.to.z / rawLength) * (halfLen * 2);
      const y2 = 1.2;
      const z2 = (seg.to.x / 2) * radScale + 0.006;

      const pts = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];

      if (isRunning && currentLine === seg.lineIndex) {
        active = pts;
      } else if (seg.type === 'cut') {
        cuts.push(pts);
      } else {
        rapids.push(pts);
      }
    });

    return { rapidLines: rapids, cutLines: cuts, activeLine: active };
  }, [segments, rawLength, currentLine, isRunning, halfLen, radScale]);

  if (!segments || segments.length === 0) return null;

  return (
    <group>
      {rapidLines.map((pts, i) => (
        <line key={`r3d-${i}`} geometry={new THREE.BufferGeometry().setFromPoints(pts)}>
          <lineBasicMaterial color="#facc15" linewidth={2} transparent opacity={0.8} />
        </line>
      ))}

      {cutLines.map((pts, i) => (
        <line key={`c3d-${i}`} geometry={new THREE.BufferGeometry().setFromPoints(pts)}>
          <lineBasicMaterial color="#06b6d4" linewidth={3} />
        </line>
      ))}

      {activeLine && (
        <line geometry={new THREE.BufferGeometry().setFromPoints(activeLine)}>
          <lineBasicMaterial color="#22c55e" linewidth={4} />
        </line>
      )}
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
  toolOrientation = 'front',
  activeTurretStation = 1,
  rpm = 800,
  isCutting = false,
  coolant = false,
  showTailstock = false,
  gcodeText = '',
  currentLine = -1,
  showToolpath = true
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
        {showToolpath && (
          <Toolpath3D
            gcodeText={gcodeText}
            rawDiameter={rawDiameter}
            rawLength={rawLength}
            currentLine={currentLine}
            isRunning={isRunning}
          />
        )}
        <ToolAssembly
          toolPosition={toolPosition}
          isCutting={isCutting}
          coolant={coolant}
          rawDiameter={rawDiameter}
          rawLength={rawLength}
          toolType={toolType}
          toolOrientation={toolOrientation}
          activeTurretStation={activeTurretStation}
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

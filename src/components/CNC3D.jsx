import { Box, RotateCcw } from 'lucide-react';
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const Workpiece3D = ({ heightmapRef, workpieceSize }) => {
  const meshRef = useRef();
  
  const threeJsWidth = (workpieceSize.x / 50) * 1.5;
  const threeJsDepth = (workpieceSize.y / 50) * 1.5;
  const threeJsHeight = (workpieceSize.z / 20) * 0.4;

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(threeJsWidth, threeJsDepth, 29, 29); 
  }, [threeJsWidth, threeJsDepth]);

  useFrame(() => {
    if (meshRef.current && heightmapRef && heightmapRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array;
      for (let i = 0; i < heightmapRef.current.length; i++) {
        positions[i * 3 + 2] = heightmapRef.current[i];
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <group position={[0, 0.3, 0]}>
      {/* Dynamic Top Surface */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Solid Base (Fake thickness) */}
      <mesh position={[0, -threeJsHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[threeJsWidth, threeJsHeight, threeJsDepth]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );
};

const CNCMachine = ({ isRunning, toolPosRef, heightmapRef, workpieceSize, toolDiameter, activePocket = 1 }) => {
  const spindleRef = useRef();
  const enclosureRef = useRef();
  
  const toolRadiusThreeJS = (toolDiameter / 2) * (1.5 / 50);
  const atcAngle = - (activePocket - 1) * (Math.PI / 3);
  
  useFrame((state, delta) => {
    if (spindleRef.current && toolPosRef && toolPosRef.current) {
      spindleRef.current.position.x = toolPosRef.current.x;
      spindleRef.current.position.z = toolPosRef.current.z;
      
      // Endmill tip offset is -0.9 relative to the spindle group
      spindleRef.current.position.y = toolPosRef.current.y + 0.9;
      
      if (isRunning) {
        // Tool spinning rapidly
        spindleRef.current.rotation.y += delta * 50; 
      }
    }
  });

  return (
    <group>
      {/* CNC Base / Bed */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[5, 1, 4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* VMC Main Machine Column behind table */}
      <mesh position={[0, 1.8, -1.6]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 3.6, 1.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Dual Linear Guideway Rails on Column */}
      <mesh position={[-0.45, 1.8, -0.98]}>
        <boxGeometry args={[0.06, 3.2, 0.04]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
      </mesh>
      <mesh position={[0.45, 1.8, -0.98]}>
        <boxGeometry args={[0.06, 3.2, 0.04]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
      </mesh>
      
      {/* T-Slot Table */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.5} />
      </mesh>
      
      {/* Dynamic Workpiece */}
      <Workpiece3D heightmapRef={heightmapRef} workpieceSize={workpieceSize} />

      {/* ========================================================================= */}
      {/* SIDE-MOUNTED ATC CAROUSEL TOOL MAGAZINE (MAGAZINE TOOL ATC CNC FRAIS)    */}
      {/* ========================================================================= */}
      <group position={[-1.75, 1.8, -0.4]}>
        {/* Support Bracket Arm extending from machine column */}
        <mesh position={[0.55, 0.1, 0]}>
          <boxGeometry args={[0.8, 0.16, 0.32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Indexing Servo Motor on top of Carousel */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.16, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.41, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} />
        </mesh>

        {/* Magazine Housing Hood / Shroud */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.58, 0.60, 0.10, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* ROTARY TOOL MAGAZINE CAROUSEL DISC (Berputar live sesuai activePocket) */}
        <group rotation={[0, atcAngle, 0]}>
          {/* Main Revolving Disc Plate */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.06, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Disc Rim Ring */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.54, 0.015, 8, 32]} />
            <meshStandardMaterial color="#0284c7" metalness={0.9} />
          </mesh>
          {/* Center Hub */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.10, 20]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>

          {/* 6 TOOL POCKETS RADIALLY AROUND CAROUSEL DISC */}
          {[
            { id: 1, name: 'Face Mill Ø63', type: 'facemill', color: '#f59e0b' },
            { id: 2, name: 'Rough Mill Ø16', type: 'rough', color: '#ea580c' },
            { id: 3, name: 'Finish Mill Ø10', type: 'endmill', color: '#facc15' },
            { id: 4, name: 'Ball Mill Ø8', type: 'ballnose', color: '#38bdf8' },
            { id: 5, name: 'Spot Drill Ø10', type: 'spotdrill', color: '#a855f7' },
            { id: 6, name: 'Twist Drill Ø6.8', type: 'drill', color: '#cbd5e1' },
          ].map((p, idx) => {
            const phi = idx * (Math.PI / 3);
            const px = 0.44 * Math.cos(phi);
            const pz = 0.44 * Math.sin(phi);
            const isCur = activePocket === p.id;

            return (
              <group key={p.id} position={[px, -0.04, pz]}>
                {/* Spring Gripper Fork Claws */}
                <mesh position={[0, 0.02, 0]}>
                  <boxGeometry args={[0.08, 0.02, 0.08]} />
                  <meshStandardMaterial color="#64748b" metalness={0.85} />
                </mesh>

                {/* Pocket Station Number Badge */}
                <mesh position={[0.07 * Math.cos(phi), 0.03, 0.07 * Math.sin(phi)]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.005, 12]} />
                  <meshStandardMaterial
                    color={isCur ? '#10b981' : '#0284c7'}
                    emissive={isCur ? '#10b981' : '#000000'}
                    emissiveIntensity={isCur ? 0.6 : 0}
                  />
                </mesh>

                {/* BT40 Toolholder Assembly in Pocket */}
                {/* Retention Knob Pull Stud */}
                <mesh position={[0, 0.06, 0]}>
                  <cylinderGeometry args={[0.012, 0.012, 0.025, 10]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
                </mesh>
                {/* BT40 7:24 Steep Taper Shank */}
                <mesh position={[0, 0.01, 0]}>
                  <cylinderGeometry args={[0.05, 0.035, 0.08, 16]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
                </mesh>
                {/* V-Groove Flange Collar */}
                <mesh position={[0, -0.04, 0]}>
                  <cylinderGeometry args={[0.065, 0.065, 0.025, 20]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.85} />
                </mesh>
                {/* Collet Chuck Nut */}
                <mesh position={[0, -0.07, 0]}>
                  <cylinderGeometry args={[0.038, 0.038, 0.04, 16]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.9} />
                </mesh>

                {/* Specific Cutting Tool in Pocket */}
                {p.id === 1 && (
                  /* Pocket 1: Face Mill Cutter Ø63 with 5 gold inserts */
                  <group position={[0, -0.11, 0]}>
                    <mesh>
                      <cylinderGeometry args={[0.075, 0.075, 0.03, 20]} />
                      <meshStandardMaterial color="#334155" metalness={0.9} />
                    </mesh>
                    <mesh position={[0.065, 0, 0]}>
                      <boxGeometry args={[0.014, 0.014, 0.014]} />
                      <meshStandardMaterial color="#f59e0b" metalness={0.95} />
                    </mesh>
                    <mesh position={[-0.065, 0, 0]}>
                      <boxGeometry args={[0.014, 0.014, 0.014]} />
                      <meshStandardMaterial color="#f59e0b" metalness={0.95} />
                    </mesh>
                  </group>
                )}
                {p.id === 2 && (
                  /* Pocket 2: Rough End Mill Ø16 */
                  <mesh position={[0, -0.14, 0]}>
                    <cylinderGeometry args={[0.020, 0.020, 0.10, 16]} />
                    <meshStandardMaterial color="#ea580c" metalness={0.95} />
                  </mesh>
                )}
                {p.id === 3 && (
                  /* Pocket 3: Finish End Mill Ø10 */
                  <mesh position={[0, -0.14, 0]}>
                    <cylinderGeometry args={[0.014, 0.014, 0.10, 16]} />
                    <meshStandardMaterial color="#facc15" metalness={0.95} />
                  </mesh>
                )}
                {p.id === 4 && (
                  /* Pocket 4: Ball Nose End Mill Ø8 */
                  <group position={[0, -0.14, 0]}>
                    <mesh>
                      <cylinderGeometry args={[0.012, 0.012, 0.08, 16]} />
                      <meshStandardMaterial color="#38bdf8" metalness={0.95} />
                    </mesh>
                    <mesh position={[0, -0.04, 0]}>
                      <sphereGeometry args={[0.012, 12, 12]} />
                      <meshStandardMaterial color="#38bdf8" metalness={0.95} />
                    </mesh>
                  </group>
                )}
                {p.id === 5 && (
                  /* Pocket 5: Spot Drill Ø10 */
                  <group position={[0, -0.14, 0]}>
                    <mesh>
                      <cylinderGeometry args={[0.014, 0.014, 0.07, 16]} />
                      <meshStandardMaterial color="#a855f7" metalness={0.95} />
                    </mesh>
                    <mesh position={[0, -0.045, 0]} rotation={[0, 0, Math.PI]}>
                      <coneGeometry args={[0.014, 0.025, 12]} />
                      <meshStandardMaterial color="#a855f7" metalness={0.95} />
                    </mesh>
                  </group>
                )}
                {p.id === 6 && (
                  /* Pocket 6: Twist Drill Bit Ø6.8 */
                  <group position={[0, -0.15, 0]}>
                    <mesh>
                      <cylinderGeometry args={[0.011, 0.011, 0.11, 16]} />
                      <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
                    </mesh>
                    <mesh position={[0, -0.06, 0]} rotation={[0, 0, Math.PI]}>
                      <coneGeometry args={[0.011, 0.016, 12]} />
                      <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>

        {/* ATC Twin-Arm Tool Changer Mechanism */}
        <group position={[0.85, -0.40, 0.3]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.28, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.85} />
          </mesh>
          <mesh position={[0, -0.10, 0]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[0.65, 0.04, 0.09]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
          {/* Gripper claws on arm ends */}
          <mesh position={[0.30, -0.10, 0.12]}>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} />
          </mesh>
          <mesh position={[-0.30, -0.10, -0.12]}>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} />
          </mesh>
        </group>
      </group>

      {/* Spindle Assembly */}
      <group ref={spindleRef} position={[0, 1.5, 0]}>
        {/* Z-Axis Spindle Head Body */}
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[0.7, 2, 0.7]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Spindle Front Blue Shield */}
        <mesh position={[0, 0.6, 0.36]}>
          <boxGeometry args={[0.5, 0.8, 0.02]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} />
        </mesh>
        
        {/* BT40 Spindle Tool Holder */}
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.16, 0.42, 32]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Collet Chuck Ring */}
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 20]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        
        {/* Dynamic Active Tool Mounted in Spindle */}
        {activePocket === 1 ? (
          /* Face Mill Ø63mm in Spindle */
          <group position={[0, -0.58, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.08, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            {[0, 72, 144, 216, 288].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <mesh key={i} position={[0.22 * Math.cos(rad), -0.02, 0.22 * Math.sin(rad)]}>
                  <boxGeometry args={[0.035, 0.035, 0.035]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.95} />
                </mesh>
              );
            })}
          </group>
        ) : activePocket === 4 ? (
          /* Ball Nose End Mill in Spindle */
          <group position={[0, -0.62, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.36, 16]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.95} />
            </mesh>
            <mesh position={[0, -0.18, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.95} />
            </mesh>
          </group>
        ) : activePocket === 5 ? (
          /* Spot Drill in Spindle */
          <group position={[0, -0.62, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.30, 16]} />
              <meshStandardMaterial color="#a855f7" metalness={0.95} />
            </mesh>
            <mesh position={[0, -0.20, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.06, 0.10, 16]} />
              <meshStandardMaterial color="#a855f7" metalness={0.95} />
            </mesh>
          </group>
        ) : (
          /* Standard Endmill in Spindle */
          <mesh position={[0, -0.62, 0]} castShadow>
            <cylinderGeometry args={[toolRadiusThreeJS, toolRadiusThreeJS, 0.50, 16]} />
            <meshStandardMaterial
              color={activePocket === 2 ? '#ea580c' : activePocket === 6 ? '#cbd5e1' : '#facc15'}
              metalness={0.95}
              roughness={0.2}
            />
          </mesh>
        )}

        {/* Flexible Blue Coolant Hose pointed at tool */}
        <mesh position={[0.22, -0.32, 0.22]} rotation={[0.4, 0, -0.4]}>
          <cylinderGeometry args={[0.02, 0.02, 0.28, 10]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} />
        </mesh>
      </group>

      {/* Enclosure Glass */}
      <mesh ref={enclosureRef} position={[0, 1.5, 2]} transparent opacity={0.2}>
        <boxGeometry args={[5.2, 3, 0.05]} />
        <meshPhysicalMaterial 
          color="#0ea5e9" 
          transmission={0.9} 
          opacity={0.3} 
          transparent 
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
        />
      </mesh>
      
      {/* Enclosure Frame */}
      <mesh position={[0, 3, 2]}>
        <boxGeometry args={[5.2, 0.2, 0.1]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
};

const CoolantParticles = ({ isRunning }) => {
  const particlesRef = useRef();
  
  const particleCount = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2; 
      pos[i * 3 + 1] = Math.random() * 2; 
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2; 
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!isRunning || !particlesRef.current) {
      particlesRef.current.visible = false;
      return;
    }
    particlesRef.current.visible = true;
    
    const positions = particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] -= 0.1; 
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 1.5; 
        positions[i * 3] = (Math.random() - 0.5) * 1.5; 
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5; 
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#0284c7" transparent opacity={0.7} />
    </points>
  );
};

import { CanvasErrorBoundary } from './ErrorBoundary';

const CNC3D = ({ 
  isRunning = false, 
  toolPosRef, 
  heightmapRef, 
  workpieceSize = { x: 50, y: 50, z: 20 }, 
  toolDiameter = 10,
  activePocket = 1,
  coolant = false
}) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', cursor: 'grab' }}>
      <CanvasErrorBoundary
        title="Simulator Mesin CNC Memerlukan Alokasi WebGL"
        fallback={(reset) => (
          <div style={{
            width: '100%',
            height: '100%',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            color: '#0f172a',
            padding: '24px',
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.4)'
          }}>
            <div className="flex justify-center" style={{ marginBottom: '12px' }}><Box size={48} className="text-sky-500" /></div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', marginBottom: '8px' }}>
              Simulator 3D Mesin CNC
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '420px', lineHeight: 1.6, marginBottom: '20px' }}>
              Grafis 3D WebGL membutuhkan alokasi memori grafis. Eksekusi kode G-Code dan editor program tetap berfungsi normal di panel samping.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} className="inline mr-1" /> Aktifkan Tampilan 3D CNC
            </button>
          </div>
        )}
      >
        <Canvas shadows camera={{ position: [0, 2, 6], fov: 50 }}>
          <color attach="background" args={['#f8fafc']} />
          
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={1.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <spotLight position={[0, 5, 0]} intensity={2.5} angle={0.6} penumbra={1} color="#38bdf8" />
          <pointLight position={[-5, 5, -5]} intensity={0.6} />

          <CNCMachine 
            isRunning={isRunning} 
            toolPosRef={toolPosRef} 
            heightmapRef={heightmapRef} 
            workpieceSize={workpieceSize} 
            toolDiameter={toolDiameter}
            activePocket={activePocket}
          />
          <CoolantParticles isRunning={coolant || isRunning} />

          <ContactShadows position={[0, -1.01, 0]} opacity={0.5} scale={16} blur={2} far={4} />
          <OrbitControls enableZoom={true} enablePan={false} autoRotate={!isRunning} autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </CanvasErrorBoundary>
      
      {/* HUD OVERLAY */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        pointerEvents: 'none',
        textAlign: 'right',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(148, 163, 184, 0.35)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}>
        <div className="cyber-font" style={{ color: isRunning ? '#059669' : '#334155', fontSize: '0.8rem', fontWeight: 800 }}>
          {isRunning ? 'RUNNING PROGRAM' : 'SYSTEM READY'}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 700 }}>COOLANT: {isRunning ? 'ON' : 'OFF'}</div>
      </div>
      
      {/* DIGITAL GRID OVERLAY */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.18) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
    </div>
  );
};

export default CNC3D;

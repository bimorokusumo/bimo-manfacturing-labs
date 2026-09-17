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

const CNCMachine = ({ isRunning, toolPosRef, heightmapRef, workpieceSize, toolDiameter }) => {
  const spindleRef = useRef();
  const enclosureRef = useRef();
  
  const toolRadiusThreeJS = (toolDiameter / 2) * (1.5 / 50);
  
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
      
      {/* T-Slot Table */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.5} />
      </mesh>
      
      {/* Dynamic Workpiece */}
      <Workpiece3D heightmapRef={heightmapRef} workpieceSize={workpieceSize} />

      {/* Spindle Assembly */}
      <group ref={spindleRef} position={[0, 1.5, 0]}>
        {/* Z-Axis Column */}
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[0.6, 2, 0.6]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        
        {/* Tool Holder */}
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.5, 32]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
        
        {/* Endmill */}
        <mesh position={[0, -0.6, 0]} castShadow>
          <cylinderGeometry args={[toolRadiusThreeJS, toolRadiusThreeJS, 0.6, 16]} />
          <meshStandardMaterial color="#fcd34d" metalness={0.9} />
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
      <pointsMaterial size={0.05} color="#e0f2fe" transparent opacity={0.6} />
    </points>
  );
};

const CNC3D = ({ isRunning = false, toolPosRef, heightmapRef, workpieceSize = { x: 50, y: 50, z: 20 }, toolDiameter = 10 }) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', cursor: 'grab' }}>
      <Canvas shadows camera={{ position: [0, 2, 6], fov: 50 }}>
        <color attach="background" args={['#020617']} />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <spotLight position={[0, 5, 0]} intensity={2} angle={0.5} penumbra={1} color="#38bdf8" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        <CNCMachine isRunning={isRunning} toolPosRef={toolPosRef} heightmapRef={heightmapRef} workpieceSize={workpieceSize} toolDiameter={toolDiameter} />
        <CoolantParticles isRunning={isRunning} />

        <ContactShadows position={[0, -0.5, 0]} opacity={0.8} scale={20} blur={2} far={4} />
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={!isRunning} autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2} />
      </Canvas>
      
      {/* HUD OVERLAY */}
      <div style={{ position: 'absolute', bottom: '16px', right: '16px', pointerEvents: 'none', textAlign: 'right' }}>
        <div className="cyber-font" style={{ color: isRunning ? '#10b981' : '#64748b', fontSize: '0.8rem', textShadow: isRunning ? '0 0 5px #10b981' : 'none' }}>
          {isRunning ? 'RUNNING PROGRAM' : 'SYSTEM READY'}
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>COOLANT: {isRunning ? 'ON' : 'OFF'}</div>
      </div>
      
      {/* DIGITAL GRID OVERLAY */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
    </div>
  );
};

export default CNC3D;

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

// =============================================================================
// 3D REALISTIC OPERATOR MANNEQUIN COMPONENT
// =============================================================================
function OperatorModel({ equippedItems, cameraPreset, showHazardLabels }) {
  const groupRef = useRef();
  const chestRef = useRef();

  // Gentle idle breathing animation
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (chestRef.current) {
      chestRef.current.scale.x = 1 + Math.sin(t * 2) * 0.012;
      chestRef.current.scale.z = 1 + Math.sin(t * 2) * 0.015;
    }
  });

  // Helpers to detect equipped items
  const has = (id) => equippedItems.includes(id);

  // Material definitions with realistic physical properties
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e0ac69',
    roughness: 0.55,
    metalness: 0.05
  }), []);

  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1310',
    roughness: 0.85,
    metalness: 0.1
  }), []);

  const eyesMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.2,
    metalness: 0.3
  }), []);

  const wearpackMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ea580c', // High-vis industrial safety orange
    roughness: 0.65,
    metalness: 0.1
  }), []);

  const wearpackAccentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f172a', // Navy contrasting panels
    roughness: 0.6,
    metalness: 0.15
  }), []);

  const reflectiveTapeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.25,
    metalness: 0.8,
    emissive: '#e2e8f0',
    emissiveIntensity: 0.2
  }), []);

  const jeansMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e3a8a',
    roughness: 0.8,
    metalness: 0.05
  }), []);

  const innerShirtMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.7,
    metalness: 0.05
  }), []);

  const apronMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#78350f', // Cowhide leather
    roughness: 0.75,
    metalness: 0.15
  }), []);

  const leatherSleevesMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#92400e',
    roughness: 0.7,
    metalness: 0.1
  }), []);

  const leatherGlovesMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#b45309',
    roughness: 0.75,
    metalness: 0.1
  }), []);

  const safetyGlassesMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.65,
    roughness: 0.1,
    metalness: 0.6
  }), []);

  const weldingHelmetMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#090d16',
    roughness: 0.35,
    metalness: 0.4
  }), []);

  const weldingVisorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#059669',
    emissive: '#10b981',
    emissiveIntensity: 0.7,
    roughness: 0.2,
    metalness: 0.8
  }), []);

  const hardHatMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#facc15', // High-vis yellow hardhat
    roughness: 0.3,
    metalness: 0.3
  }), []);

  const earmuffMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#dc2626', // Safety red earmuffs
    roughness: 0.4,
    metalness: 0.2
  }), []);

  const respiratorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#475569',
    roughness: 0.5,
    metalness: 0.3
  }), []);

  const bootsLeatherMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1c1917',
    roughness: 0.6,
    metalness: 0.2
  }), []);

  const bootsSoleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d97706', // Gum sole / yellow tread
    roughness: 0.8,
    metalness: 0.1
  }), []);

  const steelToeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.3,
    metalness: 0.8
  }), []);

  // DISTRACTOR / DANGEROUS MATERIALS
  const sandalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0284c7',
    roughness: 0.9,
    metalness: 0.0
  }), []);

  const knitGlovesMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f1f5f9',
    roughness: 0.9,
    metalness: 0.0
  }), []);

  const necktieMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#dc2626',
    roughness: 0.7,
    metalness: 0.1
  }), []);

  const chromeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.15,
    metalness: 0.95
  }), []);

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f59e0b',
    roughness: 0.2,
    metalness: 0.9
  }), []);

  const sunglassesMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#020617',
    roughness: 0.1,
    metalness: 0.9
  }), []);

  const baggyShirtMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#64748b',
    roughness: 0.85,
    metalness: 0.05
  }), []);

  const isWearingWearpack = has('wearpack');
  const isWearingJeans = has('jeans') && !isWearingWearpack;
  const isWearingGlovesKulit = has('gloves');
  const isWearingGlovesKain = has('gloves_kain');
  const isWearingShoes = has('shoes');
  const isWearingSandal = has('sandal') && !isWearingShoes;
  const isWearingWeldingHelmet = has('topeng_las');

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ===================================================================
          1. HEAD & FACIAL FEATURES (y ~ 1.63)
      =================================================================== */}
      <group position={[0, 1.63, 0]}>
        {/* Head Base */}
        <mesh castShadow receiveShadow material={skinMat}>
          <sphereGeometry args={[0.125, 24, 24]} />
        </mesh>

        {/* Jaw & Chin */}
        <mesh position={[0, -0.05, 0.04]} material={skinMat}>
          <boxGeometry args={[0.11, 0.09, 0.12]} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, -0.14, -0.01]} material={skinMat}>
          <cylinderGeometry args={[0.065, 0.08, 0.12, 16]} />
        </mesh>

        {/* Facial details (visible if no welding helmet) */}
        {!isWearingWeldingHelmet && (
          <group>
            {/* Eyes */}
            <mesh position={[-0.04, 0.02, 0.11]} material={eyesMat}>
              <sphereGeometry args={[0.016, 12, 12]} />
            </mesh>
            <mesh position={[0.04, 0.02, 0.11]} material={eyesMat}>
              <sphereGeometry args={[0.016, 12, 12]} />
            </mesh>
            {/* Eyebrows */}
            <mesh position={[-0.04, 0.045, 0.115]} material={hairMat}>
              <boxGeometry args={[0.035, 0.007, 0.01]} />
            </mesh>
            <mesh position={[0.04, 0.045, 0.115]} material={hairMat}>
              <boxGeometry args={[0.035, 0.007, 0.01]} />
            </mesh>
            {/* Nose */}
            <mesh position={[0, -0.01, 0.13]} material={skinMat}>
              <coneGeometry args={[0.018, 0.04, 4]} rotation={[-Math.PI / 4, 0, 0]} />
            </mesh>
            {/* Mouth */}
            <mesh position={[0, -0.05, 0.105]} material={new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.6 })}>
              <boxGeometry args={[0.04, 0.008, 0.01]} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.125, 0, 0]} material={skinMat}>
              <boxGeometry args={[0.02, 0.045, 0.03]} />
            </mesh>
            <mesh position={[0.125, 0, 0]} material={skinMat}>
              <boxGeometry args={[0.02, 0.045, 0.03]} />
            </mesh>
          </group>
        )}

        {/* Hair (Clean short crop) */}
        {!has('safety_helmet') && !has('topi_biasa') && !isWearingWeldingHelmet && !has('hairnet') && (
          <group>
            <mesh position={[0, 0.055, -0.015]} material={hairMat}>
              <sphereGeometry args={[0.13, 20, 20]} />
            </mesh>
            <mesh position={[0, 0.09, 0.03]} material={hairMat}>
              <boxGeometry args={[0.14, 0.05, 0.12]} />
            </mesh>
          </group>
        )}

        {/* HAIRNET */}
        {has('hairnet') && !isWearingWeldingHelmet && (
          <mesh position={[0, 0.05, -0.01]}>
            <sphereGeometry args={[0.133, 24, 24]} />
            <meshStandardMaterial color="#0f172a" wireframe opacity={0.65} transparent />
          </mesh>
        )}

        {/* BASEBALL CAP TERBALIK (Item Jebakan) */}
        {has('topi_biasa') && !isWearingWeldingHelmet && !has('safety_helmet') && (
          <group position={[0, 0.07, 0]}>
            <mesh material={new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6 })}>
              <sphereGeometry args={[0.132, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            {/* Backward brim sticking out at back */}
            <mesh position={[0, -0.01, -0.16]} rotation={[-0.2, 0, 0]} material={new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.6 })}>
              <boxGeometry args={[0.14, 0.01, 0.1]} />
            </mesh>
            {showHazardLabels && (
              <Html position={[0, 0.18, 0]} center>
                <div style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', border: '1px solid #fff' }}>
                  ⚠️ TOPI FASHION (BAHAYA API)
                </div>
              </Html>
            )}
          </group>
        )}

        {/* HELM SAFETY K3 (Hard Hat) */}
        {has('safety_helmet') && !isWearingWeldingHelmet && (
          <group position={[0, 0.07, 0]}>
            {/* Dome */}
            <mesh material={hardHatMat} castShadow>
              <sphereGeometry args={[0.145, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            {/* Crown ridge */}
            <mesh position={[0, 0.06, 0]} material={hardHatMat}>
              <boxGeometry args={[0.04, 0.04, 0.22]} />
            </mesh>
            {/* Brim */}
            <mesh position={[0, 0, 0.04]} rotation={[0.08, 0, 0]} material={hardHatMat}>
              <cylinderGeometry args={[0.175, 0.175, 0.015, 24]} />
            </mesh>
            {/* Chin strap */}
            <mesh position={[0, -0.12, 0.04]}>
              <torusGeometry args={[0.09, 0.005, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          </group>
        )}

        {/* KACAMATA SAFETY POLIKARBONAT BENING (Benar) */}
        {has('kacamata_safety') && !isWearingWeldingHelmet && !has('kacamata_hitam') && (
          <group position={[0, 0.02, 0.09]}>
            {/* Curved wrap-around lenses */}
            <mesh material={safetyGlassesMat}>
              <boxGeometry args={[0.13, 0.04, 0.06]} />
            </mesh>
            {/* Frame top bar */}
            <mesh position={[0, 0.022, 0]} material={new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.3 })}>
              <boxGeometry args={[0.135, 0.008, 0.05]} />
            </mesh>
            {/* Side shield temples */}
            <mesh position={[-0.065, 0.01, -0.04]} rotation={[0, 0.1, 0]} material={safetyGlassesMat}>
              <boxGeometry args={[0.008, 0.035, 0.09]} />
            </mesh>
            <mesh position={[0.065, 0.01, -0.04]} rotation={[0, -0.1, 0]} material={safetyGlassesMat}>
              <boxGeometry args={[0.008, 0.035, 0.09]} />
            </mesh>
          </group>
        )}

        {/* KACAMATA HITAM FASHION (Item Jebakan) */}
        {has('kacamata_hitam') && !isWearingWeldingHelmet && (
          <group position={[0, 0.02, 0.1]}>
            <mesh position={[-0.035, 0, 0]} material={sunglassesMat}>
              <boxGeometry args={[0.042, 0.032, 0.015]} />
            </mesh>
            <mesh position={[0.035, 0, 0]} material={sunglassesMat}>
              <boxGeometry args={[0.042, 0.032, 0.015]} />
            </mesh>
            {/* Bridge */}
            <mesh position={[0, 0.01, 0]} material={goldMat}>
              <boxGeometry args={[0.03, 0.005, 0.008]} />
            </mesh>
            {showHazardLabels && (
              <Html position={[0, 0.12, 0.08]} center>
                <div style={{ background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', border: '1px solid #fff' }}>
                  ⚠️ GELAP & MUDAH PECAH
                </div>
              </Html>
            )}
          </group>
        )}

        {/* TOPENG LAS OTOMATIS (Auto-Darkening Helmet) */}
        {isWearingWeldingHelmet && (
          <group position={[0, 0.01, 0.02]}>
            {/* Outer Protective Shell */}
            <mesh material={weldingHelmetMat} castShadow>
              <boxGeometry args={[0.22, 0.28, 0.24]} />
            </mesh>
            {/* Auto-Darkening LCD Filter Screen */}
            <mesh position={[0, 0.01, 0.125]} material={weldingVisorMat}>
              <boxGeometry args={[0.12, 0.065, 0.01]} />
            </mesh>
            {/* Solar Cell Sensor Strip */}
            <mesh position={[0, 0.06, 0.123]} material={new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.1, metalness: 0.9 })}>
              <boxGeometry args={[0.09, 0.016, 0.008]} />
            </mesh>
            {/* Adjustment pivot dials */}
            <mesh position={[-0.115, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={new THREE.MeshStandardMaterial({ color: '#64748b' })}>
              <cylinderGeometry args={[0.022, 0.022, 0.015, 16]} />
            </mesh>
            <mesh position={[0.115, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={new THREE.MeshStandardMaterial({ color: '#64748b' })}>
              <cylinderGeometry args={[0.022, 0.022, 0.015, 16]} />
            </mesh>
          </group>
        )}

        {/* EAR MUFF INDUSTRI */}
        {has('earmuff') && !isWearingWeldingHelmet && (
          <group position={[0, 0, 0]}>
            {/* Headband arch */}
            <mesh position={[0, 0.12, 0]}>
              <torusGeometry args={[0.135, 0.01, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Left Cup */}
            <mesh position={[-0.14, 0, 0]} material={earmuffMat}>
              <cylinderGeometry args={[0.038, 0.038, 0.035, 16]} rotation={[0, 0, Math.PI / 2]} />
            </mesh>
            {/* Right Cup */}
            <mesh position={[0.14, 0, 0]} material={earmuffMat}>
              <cylinderGeometry args={[0.038, 0.038, 0.035, 16]} rotation={[0, 0, Math.PI / 2]} />
            </mesh>
          </group>
        )}

        {/* HEADPHONE MUSIK (Item Jebakan) */}
        {has('headphone') && !isWearingWeldingHelmet && (
          <group position={[0, 0, 0]}>
            {/* Stylish Headband */}
            <mesh position={[0, 0.115, 0]}>
              <torusGeometry args={[0.13, 0.014, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#ef4444" roughness={0.4} />
            </mesh>
            {/* Over-ear cups */}
            <mesh position={[-0.135, 0, 0]} material={new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.3 })}>
              <boxGeometry args={[0.03, 0.08, 0.06]} />
            </mesh>
            <mesh position={[0.135, 0, 0]} material={new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.3 })}>
              <boxGeometry args={[0.03, 0.08, 0.06]} />
            </mesh>
            {showHazardLabels && (
              <Html position={[0, 0.22, 0]} center>
                <div style={{ background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', border: '1px solid #fff' }}>
                  🚨 MUSIK = PEKAK ALARM
                </div>
              </Html>
            )}
          </group>
        )}

        {/* RESPIRATOR DUST / CHEMICAL MASK */}
        {has('respirator') && !isWearingWeldingHelmet && (
          <group position={[0, -0.04, 0.1]}>
            {/* Half-mask nose cup */}
            <mesh material={respiratorMat}>
              <boxGeometry args={[0.09, 0.07, 0.05]} />
            </mesh>
            {/* Twin Pink Particulate Filter Canisters */}
            <mesh position={[-0.065, -0.01, 0.01]} rotation={[0, -0.3, 0]} material={new THREE.MeshStandardMaterial({ color: '#ec4899', roughness: 0.4 })}>
              <cylinderGeometry args={[0.026, 0.026, 0.025, 16]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>
            <mesh position={[0.065, -0.01, 0.01]} rotation={[0, 0.3, 0]} material={new THREE.MeshStandardMaterial({ color: '#ec4899', roughness: 0.4 })}>
              <cylinderGeometry args={[0.026, 0.026, 0.025, 16]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>
            {/* Harness straps */}
            <mesh position={[0, 0.02, -0.04]}>
              <torusGeometry args={[0.1, 0.004, 6, 16, Math.PI]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
          </group>
        )}
      </group>

      {/* ===================================================================
          2. TORSO / CHEST / UPPER BODY (y ~ 1.25)
      =================================================================== */}
      <group ref={chestRef} position={[0, 1.25, 0]}>
        {/* Base Torso / Inner Shirt */}
        <mesh castShadow receiveShadow material={isWearingWearpack ? wearpackMat : (has('kaos_longgar') ? baggyShirtMat : innerShirtMat)}>
          <boxGeometry args={[0.38, 0.45, 0.22]} />
        </mesh>

        {/* Shoulders */}
        <mesh position={[-0.2, 0.18, 0]} material={isWearingWearpack ? wearpackMat : innerShirtMat}>
          <sphereGeometry args={[0.08, 16, 16]} />
        </mesh>
        <mesh position={[0.2, 0.18, 0]} material={isWearingWearpack ? wearpackMat : innerShirtMat}>
          <sphereGeometry args={[0.08, 16, 16]} />
        </mesh>

        {/* WEARPACK CHEST REFLECTIVE STRIPES & POCKETS */}
        {isWearingWearpack && (
          <group>
            {/* Front zipper flap */}
            <mesh position={[0, 0, 0.115]} material={wearpackAccentMat}>
              <boxGeometry args={[0.03, 0.44, 0.01]} />
            </mesh>
            {/* Chest Reflective Stripe */}
            <mesh position={[0, 0.1, 0.114]} material={reflectiveTapeMat}>
              <boxGeometry args={[0.385, 0.04, 0.005]} />
            </mesh>
            <mesh position={[0, 0.1, -0.114]} material={reflectiveTapeMat}>
              <boxGeometry args={[0.385, 0.04, 0.005]} />
            </mesh>
            {/* Chest Pockets with pen slot */}
            <mesh position={[-0.1, 0.02, 0.116]} material={wearpackAccentMat}>
              <boxGeometry args={[0.09, 0.08, 0.01]} />
            </mesh>
            <mesh position={[0.1, 0.02, 0.116]} material={wearpackAccentMat}>
              <boxGeometry args={[0.09, 0.08, 0.01]} />
            </mesh>
            {/* Collar */}
            <mesh position={[0, 0.23, 0]} material={wearpackAccentMat}>
              <cylinderGeometry args={[0.1, 0.12, 0.05, 16]} />
            </mesh>
          </group>
        )}

        {/* BAJU KAOS LONGGAR / KEDODORAN (Item Jebakan) */}
        {has('kaos_longgar') && !isWearingWearpack && (
          <group>
            <mesh position={[0, -0.05, 0]} material={baggyShirtMat}>
              <boxGeometry args={[0.44, 0.52, 0.28]} />
            </mesh>
            {showHazardLabels && (
              <Html position={[0, -0.05, 0.16]} center>
                <div style={{ background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', border: '1px solid #fff' }}>
                  🚨 KAOS KEDODORAN TERBELIT AS
                </div>
              </Html>
            )}
          </group>
        )}

        {/* DASI PANJANG MENJUNTAI (Item Jebakan Kritis Fatal) */}
        {has('dasi') && (
          <group position={[0, 0.18, 0.12]}>
            {/* Neck loop */}
            <mesh material={necktieMat}>
              <cylinderGeometry args={[0.08, 0.085, 0.02, 16]} />
            </mesh>
            {/* Knot */}
            <mesh position={[0, -0.03, 0.02]} material={necktieMat}>
              <boxGeometry args={[0.04, 0.04, 0.02]} />
            </mesh>
            {/* Dangling Tie Blade */}
            <mesh position={[0, -0.22, 0.015]} material={necktieMat}>
              <boxGeometry args={[0.055, 0.35, 0.008]} />
            </mesh>
            {/* Tie Point */}
            <mesh position={[0, -0.41, 0.015]} rotation={[0, 0, Math.PI / 4]} material={necktieMat}>
              <boxGeometry args={[0.038, 0.038, 0.008]} />
            </mesh>
            {showHazardLabels && (
              <Html position={[0, -0.22, 0.08]} center>
                <div style={{ background: '#b91c1c', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap', border: '2px solid #fef08a', boxShadow: '0 0 10px rgba(220,38,38,0.8)' }}>
                  ☠️ DASI FATAL: TERTARIK CHUCK BUBUT!
                </div>
              </Html>
            )}
          </group>
        )}

        {/* APRON KULIT SAPI (Tahan Api) */}
        {has('apron') && (
          <group position={[0, -0.05, 0.118]}>
            {/* Apron bib & body */}
            <mesh material={apronMat} castShadow>
              <boxGeometry args={[0.34, 0.65, 0.015]} />
            </mesh>
            {/* Leather neck strap */}
            <mesh position={[0, 0.35, -0.05]} rotation={[0.4, 0, 0]} material={apronMat}>
              <torusGeometry args={[0.1, 0.008, 6, 16]} />
            </mesh>
            {/* Waist strap */}
            <mesh position={[0, -0.08, -0.12]} material={new THREE.MeshStandardMaterial({ color: '#451a03' })}>
              <boxGeometry args={[0.4, 0.025, 0.25]} />
            </mesh>
            {/* Front tool pocket */}
            <mesh position={[0, -0.05, 0.012]} material={new THREE.MeshStandardMaterial({ color: '#592c08' })}>
              <boxGeometry args={[0.18, 0.12, 0.01]} />
            </mesh>
          </group>
        )}
      </group>

      {/* ===================================================================
          3. ARMS & HANDS
      =================================================================== */}
      {/* LEFT ARM */}
      <group position={[-0.23, 1.4, 0]}>
        {/* Upper Arm */}
        <mesh position={[0, -0.14, 0]} material={isWearingWearpack ? wearpackMat : (has('sleeves') ? leatherSleevesMat : skinMat)}>
          <cylinderGeometry args={[0.055, 0.05, 0.26, 16]} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0, -0.28, 0]} material={isWearingWearpack ? wearpackMat : (has('sleeves') ? leatherSleevesMat : skinMat)}>
          <sphereGeometry args={[0.05, 12, 12]} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.42, 0.02]} rotation={[0.1, 0, 0]} material={isWearingWearpack ? wearpackMat : (has('sleeves') ? leatherSleevesMat : skinMat)}>
          <cylinderGeometry args={[0.048, 0.042, 0.24, 16]} />
        </mesh>
        {/* Reflective tape on arm if wearpack */}
        {isWearingWearpack && (
          <mesh position={[0, -0.38, 0.02]} rotation={[0.1, 0, 0]} material={reflectiveTapeMat}>
            <cylinderGeometry args={[0.051, 0.051, 0.03, 16]} />
          </mesh>
        )}

        {/* JAM TANGAN LOGAM (Item Jebakan) */}
        {has('jam_tangan') && !isWearingGlovesKulit && (
          <group position={[0, -0.52, 0.03]}>
            <mesh material={chromeMat}>
              <cylinderGeometry args={[0.048, 0.048, 0.025, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.04]} material={goldMat}>
              <cylinderGeometry args={[0.018, 0.018, 0.01, 16]} rotation={[Math.PI / 2, 0, 0]} />
            </mesh>
            {showHazardLabels && (
              <Html position={[-0.1, 0, 0]} center>
                <div style={{ background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 900, padding: '2px 5px', borderRadius: '4px', whiteSpace: 'nowrap', border: '1px solid #fff' }}>
                  ⚠️ JAM LOGAM TERJEPIT
                </div>
              </Html>
            )}
          </group>
        )}

        {/* LEFT HAND */}
        <group position={[0, -0.58, 0.04]}>
          {/* Hand Palm / Glove */}
          <mesh material={isWearingGlovesKulit ? leatherGlovesMat : (isWearingGlovesKain ? knitGlovesMat : skinMat)}>
            <boxGeometry args={[0.05, 0.09, 0.03]} />
          </mesh>
          {/* Thumb */}
          <mesh position={[0.035, 0.01, 0.01]} rotation={[0, 0, -0.4]} material={isWearingGlovesKulit ? leatherGlovesMat : (isWearingGlovesKain ? knitGlovesMat : skinMat)}>
            <cylinderGeometry args={[0.014, 0.012, 0.05, 8]} />
          </mesh>

          {/* SARUNG TANGAN KAIN RAJUT (Item Jebakan Kritis Mesin Putar) */}
          {isWearingGlovesKain && showHazardLabels && (
            <Html position={[-0.12, 0, 0]} center>
              <div style={{ background: '#b91c1c', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '3px 6px', borderRadius: '4px', whiteSpace: 'nowrap', border: '1px solid #fff' }}>
                🚨 TERLILIT CHUCK BUBUT!
              </div>
            </Html>
          )}
        </group>
      </group>

      {/* RIGHT ARM */}
      <group position={[0.23, 1.4, 0]}>
        {/* Upper Arm */}
        <mesh position={[0, -0.14, 0]} material={isWearingWearpack ? wearpackMat : (has('sleeves') ? leatherSleevesMat : skinMat)}>
          <cylinderGeometry args={[0.055, 0.05, 0.26, 16]} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0, -0.28, 0]} material={isWearingWearpack ? wearpackMat : (has('sleeves') ? leatherSleevesMat : skinMat)}>
          <sphereGeometry args={[0.05, 12, 12]} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.42, 0.02]} rotation={[0.1, 0, 0]} material={isWearingWearpack ? wearpackMat : (has('sleeves') ? leatherSleevesMat : skinMat)}>
          <cylinderGeometry args={[0.048, 0.042, 0.24, 16]} />
        </mesh>
        {/* Reflective tape on arm if wearpack */}
        {isWearingWearpack && (
          <mesh position={[0, -0.38, 0.02]} rotation={[0.1, 0, 0]} material={reflectiveTapeMat}>
            <cylinderGeometry args={[0.051, 0.051, 0.03, 16]} />
          </mesh>
        )}

        {/* RIGHT HAND */}
        <group position={[0, -0.58, 0.04]}>
          <mesh material={isWearingGlovesKulit ? leatherGlovesMat : (isWearingGlovesKain ? knitGlovesMat : skinMat)}>
            <boxGeometry args={[0.05, 0.09, 0.03]} />
          </mesh>
          <mesh position={[-0.035, 0.01, 0.01]} rotation={[0, 0, 0.4]} material={isWearingGlovesKulit ? leatherGlovesMat : (isWearingGlovesKain ? knitGlovesMat : skinMat)}>
            <cylinderGeometry args={[0.014, 0.012, 0.05, 8]} />
          </mesh>

          {/* CINCIN LOGAM (Item Jebakan) */}
          {has('cincin') && !isWearingGlovesKulit && (
            <group position={[0, -0.02, 0.01]}>
              <mesh material={goldMat}>
                <torusGeometry args={[0.016, 0.005, 8, 16]} />
              </mesh>
              {showHazardLabels && (
                <Html position={[0.1, 0, 0]} center>
                  <div style={{ background: '#ef4444', color: '#fff', fontSize: '8.5px', fontWeight: 900, padding: '2px 5px', borderRadius: '4px', whiteSpace: 'nowrap', border: '1px solid #fff' }}>
                    ⚠️ CINCIN TERKULITI (DEGLOVING)
                  </div>
                </Html>
              )}
            </group>
          )}

          {/* SMARTPHONE DI TANGAN (Item Jebakan) */}
          {has('smartphone') && (
            <group position={[0, -0.02, 0.06]} rotation={[-0.4, 0, 0]}>
              <mesh material={new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8, roughness: 0.2 })}>
                <boxGeometry args={[0.05, 0.1, 0.008]} />
              </mesh>
              <mesh position={[0, 0, 0.005]} material={new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.6 })}>
                <boxGeometry args={[0.044, 0.088, 0.001]} />
              </mesh>
              {showHazardLabels && (
                <Html position={[0.1, 0.05, 0]} center>
                  <div style={{ background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 900, padding: '2px 5px', borderRadius: '4px', whiteSpace: 'nowrap', border: '1px solid #fff' }}>
                    🚨 DISTRAKSI SMARTPHONE
                  </div>
                </Html>
              )}
            </group>
          )}
        </group>
      </group>

      {/* ===================================================================
          4. LEGS & LOWER BODY (Hips ~ 1.0, Legs down to 0.1)
      =================================================================== */}
      {/* Pelvis / Waist */}
      <group position={[0, 0.98, 0]}>
        <mesh material={isWearingWearpack ? wearpackMat : (isWearingJeans ? jeansMat : skinMat)}>
          <boxGeometry args={[0.36, 0.18, 0.21]} />
        </mesh>
        {isWearingJeans && (
          <mesh position={[0, 0.07, 0]} material={new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.5 })}>
            <boxGeometry args={[0.365, 0.035, 0.215]} />
          </mesh>
        )}
      </group>

      {/* LEFT LEG */}
      <group position={[-0.11, 0.88, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.18, 0]} material={isWearingWearpack ? wearpackMat : (isWearingJeans ? jeansMat : skinMat)}>
          <cylinderGeometry args={[0.075, 0.065, 0.36, 16]} />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -0.38, 0]} material={isWearingWearpack ? wearpackMat : (isWearingJeans ? jeansMat : skinMat)}>
          <sphereGeometry args={[0.065, 12, 12]} />
        </mesh>
        {/* Calf / Shin */}
        <mesh position={[0, -0.58, 0]} material={isWearingWearpack ? wearpackMat : (isWearingJeans ? jeansMat : skinMat)}>
          <cylinderGeometry args={[0.065, 0.055, 0.38, 16]} />
        </mesh>
        {/* Reflective strip on lower wearpack leg */}
        {isWearingWearpack && (
          <mesh position={[0, -0.66, 0]} material={reflectiveTapeMat}>
            <cylinderGeometry args={[0.066, 0.066, 0.04, 16]} />
          </mesh>
        )}

        {/* LEFT FOOTWEAR */}
        <group position={[0, -0.8, 0.05]}>
          {/* SEPATU SAFETY (Toe Baja) */}
          {isWearingShoes && (
            <group>
              {/* Boot upper */}
              <mesh position={[0, 0.04, -0.02]} material={bootsLeatherMat} castShadow>
                <boxGeometry args={[0.1, 0.14, 0.16]} />
              </mesh>
              {/* Boot foot extending forward */}
              <mesh position={[0, -0.01, 0.04]} material={bootsLeatherMat} castShadow>
                <boxGeometry args={[0.105, 0.08, 0.16]} />
              </mesh>
              {/* Steel Toe reinforcement cap */}
              <mesh position={[0, -0.005, 0.095]} material={steelToeMat}>
                <boxGeometry args={[0.108, 0.075, 0.05]} />
              </mesh>
              {/* High traction lugged sole */}
              <mesh position={[0, -0.06, 0.02]} material={bootsSoleMat}>
                <boxGeometry args={[0.115, 0.03, 0.25]} />
              </mesh>
            </group>
          )}

          {/* SANDAL JEPIT (Item Jebakan) */}
          {isWearingSandal && (
            <group>
              {/* Bare foot skin */}
              <mesh position={[0, 0.02, 0.02]} material={skinMat}>
                <boxGeometry args={[0.085, 0.06, 0.18]} />
              </mesh>
              {/* Thin rubber sole */}
              <mesh position={[0, -0.025, 0.02]} material={sandalMat}>
                <boxGeometry args={[0.095, 0.015, 0.2]} />
              </mesh>
              {/* Sandal strap */}
              <mesh position={[0, 0.01, 0.05]} material={new THREE.MeshStandardMaterial({ color: '#f59e0b' })}>
                <torusGeometry args={[0.035, 0.006, 6, 12, Math.PI]} />
              </mesh>
              {showHazardLabels && (
                <Html position={[-0.12, 0, 0]} center>
                  <div style={{ background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 900, padding: '2px 5px', borderRadius: '4px', whiteSpace: 'nowrap', border: '1px solid #fff' }}>
                    🚨 SANDAL: TERTUSUK TATAL GRAM
                  </div>
                </Html>
              )}
            </group>
          )}

          {/* Barefoot if neither */}
          {!isWearingShoes && !isWearingSandal && (
            <mesh position={[0, -0.01, 0.02]} material={skinMat}>
              <boxGeometry args={[0.085, 0.055, 0.18]} />
            </mesh>
          )}
        </group>
      </group>

      {/* RIGHT LEG */}
      <group position={[0.11, 0.88, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.18, 0]} material={isWearingWearpack ? wearpackMat : (isWearingJeans ? jeansMat : skinMat)}>
          <cylinderGeometry args={[0.075, 0.065, 0.36, 16]} />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -0.38, 0]} material={isWearingWearpack ? wearpackMat : (isWearingJeans ? jeansMat : skinMat)}>
          <sphereGeometry args={[0.065, 12, 12]} />
        </mesh>
        {/* Calf / Shin */}
        <mesh position={[0, -0.58, 0]} material={isWearingWearpack ? wearpackMat : (isWearingJeans ? jeansMat : skinMat)}>
          <cylinderGeometry args={[0.065, 0.055, 0.38, 16]} />
        </mesh>
        {/* Reflective strip on lower wearpack leg */}
        {isWearingWearpack && (
          <mesh position={[0, -0.66, 0]} material={reflectiveTapeMat}>
            <cylinderGeometry args={[0.066, 0.066, 0.04, 16]} />
          </mesh>
        )}

        {/* RIGHT FOOTWEAR */}
        <group position={[0, -0.8, 0.05]}>
          {isWearingShoes && (
            <group>
              <mesh position={[0, 0.04, -0.02]} material={bootsLeatherMat} castShadow>
                <boxGeometry args={[0.1, 0.14, 0.16]} />
              </mesh>
              <mesh position={[0, -0.01, 0.04]} material={bootsLeatherMat} castShadow>
                <boxGeometry args={[0.105, 0.08, 0.16]} />
              </mesh>
              <mesh position={[0, -0.005, 0.095]} material={steelToeMat}>
                <boxGeometry args={[0.108, 0.075, 0.05]} />
              </mesh>
              <mesh position={[0, -0.06, 0.02]} material={bootsSoleMat}>
                <boxGeometry args={[0.115, 0.03, 0.25]} />
              </mesh>
            </group>
          )}

          {isWearingSandal && (
            <group>
              <mesh position={[0, 0.02, 0.02]} material={skinMat}>
                <boxGeometry args={[0.085, 0.06, 0.18]} />
              </mesh>
              <mesh position={[0, -0.025, 0.02]} material={sandalMat}>
                <boxGeometry args={[0.095, 0.015, 0.2]} />
              </mesh>
              <mesh position={[0, 0.01, 0.05]} material={new THREE.MeshStandardMaterial({ color: '#f59e0b' })}>
                <torusGeometry args={[0.035, 0.006, 6, 12, Math.PI]} />
              </mesh>
            </group>
          )}

          {!isWearingShoes && !isWearingSandal && (
            <mesh position={[0, -0.01, 0.02]} material={skinMat}>
              <boxGeometry args={[0.085, 0.055, 0.18]} />
            </mesh>
          )}
        </group>
      </group>

      {/* ===================================================================
          5. INDUSTRIAL PEDESTAL & HAZARD ZONE MARKINGS
      =================================================================== */}
      <group position={[0, 0, 0]}>
        {/* Inspection Platform */}
        <mesh position={[0, -0.01, 0]} receiveShadow>
          <cylinderGeometry args={[0.9, 0.95, 0.04, 32]} />
          <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Yellow-Black Safety Hazard Border Ring */}
        <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.78, 0.88, 32]} />
          <meshStandardMaterial color="#eab308" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.82, 0.84, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================================
// MAIN 3D CANVAS WRAPPER WITH ORBIT CONTROLS & CAMERA PRESETS
// =============================================================================
export default function Safety3DOperator({ equippedItems = [], showHazardLabels = true }) {
  const controlsRef = useRef();
  const [autoRotate, setAutoRotate] = useState(false);
  const [activePreset, setActivePreset] = useState('full');

  // Camera preset controller
  const handlePreset = (preset) => {
    setActivePreset(preset);
    if (!controlsRef.current) return;

    if (preset === 'front') {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 1.1, 0);
      controlsRef.current.object.position.set(0, 1.3, 3.2);
    } else if (preset === 'back') {
      controlsRef.current.target.set(0, 1.1, 0);
      controlsRef.current.object.position.set(0, 1.3, -3.2);
    } else if (preset === 'head') {
      controlsRef.current.target.set(0, 1.6, 0);
      controlsRef.current.object.position.set(0, 1.62, 1.4);
    } else if (preset === 'hands') {
      controlsRef.current.target.set(0, 1.0, 0);
      controlsRef.current.object.position.set(0, 1.05, 1.6);
    } else if (preset === 'feet') {
      controlsRef.current.target.set(0, 0.25, 0);
      controlsRef.current.object.position.set(0, 0.45, 1.5);
    } else {
      // Full view
      controlsRef.current.target.set(0, 0.95, 0);
      controlsRef.current.object.position.set(0, 1.25, 3.2);
    }
    controlsRef.current.update();
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* 3D Viewport Controls Floating Toolbar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        padding: '8px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        flexWrap: 'wrap',
        gap: '6px'
      }}>
        {/* Title / Orbit tip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1rem' }}>🔄</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>
            ORBIT 3D (KLIK & GESER PUTAR 360°)
          </span>
        </div>

        {/* Preset Camera Quick Jump */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { id: 'full', label: '🧍 Badan Penuh' },
            { id: 'head', label: '🪖 Kepala & Wajah' },
            { id: 'hands', label: '🧤 Tangan & APD' },
            { id: 'feet', label: '🥾 Sepatu & Kaki' },
            { id: 'back', label: '🔄 Tampak Belakang' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => handlePreset(btn.id)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: activePreset === btn.id ? '#ea580c' : 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {btn.label}
            </button>
          ))}

          {/* Toggle Auto-Rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: autoRotate ? '#10b981' : 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {autoRotate ? '⏸️ Stop Putar' : '▶️ Auto Putar'}
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div style={{ flex: 1, width: '100%', minHeight: '440px', background: 'radial-gradient(circle at center, #334155 0%, #0f172a 100%)', borderRadius: '12px', overflow: 'hidden' }}>
        <Canvas
          camera={{ position: [0, 1.25, 3.2], fov: 42 }}
          shadows
          style={{ width: '100%', height: '100%' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.85} />
          <directionalLight
            position={[4, 6, 4]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.5}
            shadow-camera-far={15}
            shadow-camera-left={-2}
            shadow-camera-right={2}
            shadow-camera-top={3}
            shadow-camera-bottom={-1}
          />
          <directionalLight position={[-4, 4, -4]} intensity={0.6} color="#93c5fd" />
          <pointLight position={[0, 2, 2]} intensity={0.5} color="#fed7aa" />

          {/* 3D Human Operator Model */}
          <OperatorModel
            equippedItems={equippedItems}
            cameraPreset={activePreset}
            showHazardLabels={showHazardLabels}
          />

          {/* Contact Shadows on Floor */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.6}
            scale={3}
            blur={2.4}
            far={2}
          />

          {/* Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableZoom={true}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1.8}
            minDistance={1.1}
            maxDistance={5.0}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2 + 0.05}
            target={[0, 0.95, 0]}
          />
        </Canvas>
      </div>

      {/* Orbit Tip Footer */}
      <div style={{
        marginTop: '8px',
        fontSize: '0.72rem',
        color: '#64748b',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 4px'
      }}>
        <span>💡 Geser kursor/layar untuk memutar sudut pandang 360°. Scroll untuk zoom in/out.</span>
        <span>Item terpasang: <strong>{equippedItems.length} APD</strong></span>
      </div>
    </div>
  );
}

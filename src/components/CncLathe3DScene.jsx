import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 3D Slant-Bed CNC Lathe Scene (Standar Industri Teknalar)
 * Features:
 * - Real slant-bed cast body, headstock, linear guideways, and chip tray
 * - 3-Jaw self-centering chuck rotating live with spindle RPM
 * - Dynamic turned workpiece constructed from real profileCut radius data (THREE.LatheGeometry)
 * - 8-Station indexed tool turret carrying real tool holders and carbide inserts
 * - Live tool movement along X (diameter) and Z (longitudinal) axes
 * - Flood coolant spray particles when M08 is active
 * - Interactive mouse orbit, pan, and scroll zoom
 */
const CncLathe3DScene = ({
  stock = { diameter: 50, length: 90, grip: 25 },
  profileCut = [],
  toolPos = { x: 52, z: 2 },
  activeTool = { tool: 1, code: 'T0101', name: 'OD Turning', color: '#e7b85d' },
  rpm = 0,
  coolant = false,
  isCutting = false,
  doorOpen = false
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // References for live updates inside animation loop
  const sceneStateRef = useRef({
    stock,
    profileCut,
    toolPos,
    activeTool,
    rpm,
    coolant,
    isCutting,
    doorOpen
  });

  useEffect(() => {
    sceneStateRef.current = {
      stock,
      profileCut,
      toolPos,
      activeTool,
      rpm,
      coolant,
      isCutting,
      doorOpen
    };
  }, [stock, profileCut, toolPos, activeTool, rpm, coolant, isCutting, doorOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 400;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1017);

    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 3000);
    camera.position.set(220, 260, 340);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(250, 400, 300);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7dd3fc, 0.5);
    dirLight2.position.set(-200, 150, -100);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xfff0c2, 0.8, 400);
    pointLight.position.set(0, 100, 50);
    scene.add(pointLight);

    // 4. Slant-Bed Cast Frame & Enclosure
    const slantAngle = Math.PI * 0.22; // 40-degree slant bed
    const bedGroup = new THREE.Group();
    scene.add(bedGroup);

    // Base Casting
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x182028, roughness: 0.7, metalness: 0.3 });
    const baseGeo = new THREE.BoxGeometry(480, 50, 260);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -60, 0);
    baseMesh.receiveShadow = true;
    bedGroup.add(baseMesh);

    // Slant Bed Guide Rails
    const slantRailsGroup = new THREE.Group();
    slantRailsGroup.rotation.x = -slantAngle;
    slantRailsGroup.position.set(0, 0, 0);
    bedGroup.add(slantRailsGroup);

    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 });
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(440, 10, 16), railMat);
    rail1.position.set(0, 40, -40);
    slantRailsGroup.add(rail1);
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(440, 10, 16), railMat);
    rail2.position.set(0, 40, 50);
    slantRailsGroup.add(rail2);

    // Headstock Box (Left side)
    const headstockMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 });
    const headstock = new THREE.Mesh(new THREE.BoxGeometry(130, 170, 180), headstockMat);
    headstock.position.set(-175, 25, 0);
    headstock.castShadow = true;
    bedGroup.add(headstock);

    // Headstock Accent Badge ("TEKNALAR SL-20")
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.5 });
    const badge = new THREE.Mesh(new THREE.BoxGeometry(90, 20, 4), badgeMat);
    badge.position.set(-175, 80, 92);
    bedGroup.add(badge);

    // 5. Spindle & 3-Jaw Chuck (Rotating Group)
    const spindleGroup = new THREE.Group();
    spindleGroup.position.set(-110, 25, 0);
    bedGroup.add(spindleGroup);

    // Chuck Body (Cylinder)
    const chuckMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.8 });
    const chuckGeo = new THREE.CylinderGeometry(52, 52, 45, 36);
    chuckGeo.rotateZ(Math.PI / 2);
    const chuckMesh = new THREE.Mesh(chuckGeo, chuckMat);
    chuckMesh.position.set(-22.5, 0, 0);
    chuckMesh.castShadow = true;
    spindleGroup.add(chuckMesh);

    // 3 Hardened Chuck Jaws
    const jawMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.25, metalness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(28, 16, 20), jawMat);
      const jawRadius = (stock.diameter / 2) + 10;
      jaw.position.set(-10, Math.cos(angle) * jawRadius, Math.sin(angle) * jawRadius);
      jaw.rotation.x = -angle;
      jaw.castShadow = true;
      spindleGroup.add(jaw);
    }

    // Workpiece Container inside SpindleGroup (so it rotates live with the chuck!)
    const workpieceGroup = new THREE.Group();
    spindleGroup.add(workpieceGroup);

    // Workpiece Mesh Reference
    let workpieceMesh = null;
    const workpieceMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.3,
      metalness: 0.82
    });

    const updateWorkpieceGeometry = (prof, stk) => {
      if (workpieceMesh) {
        workpieceGroup.remove(workpieceMesh);
        if (workpieceMesh.geometry) workpieceMesh.geometry.dispose();
      }

      const rawLen = stk.length || 90;
      const gripLen = stk.grip || 25;
      const exposedLen = rawLen - gripLen;
      const rawRadius = (stk.diameter || 50) / 2;

      // Build 2D contour points along Z for LatheGeometry
      // Z runs along X-axis in standard Three.js lathe coordinates
      const points = [];

      // Left face (inside chuck)
      points.push(new THREE.Vector2(0, 0));
      points.push(new THREE.Vector2(rawRadius, 0));
      points.push(new THREE.Vector2(rawRadius, gripLen));

      // Exposed part (with cuts)
      if (prof && prof.length > 0) {
        const stepZ = exposedLen / prof.length;
        for (let idx = prof.length - 1; idx >= 0; idx--) {
          const zPos = gripLen + (prof.length - 1 - idx) * stepZ;
          const rPos = prof[idx] !== undefined ? prof[idx] : rawRadius;
          points.push(new THREE.Vector2(Math.max(1, rPos), zPos));
        }
      } else {
        points.push(new THREE.Vector2(rawRadius, rawLen));
      }

      // Right tip center
      points.push(new THREE.Vector2(0, rawLen));

      const latheGeo = new THREE.LatheGeometry(points, 48);
      // LatheGeometry revolves around Y axis by default; rotate it along X axis to match spindle
      latheGeo.rotateZ(-Math.PI / 2);
      latheGeo.translate(-gripLen, 0, 0);

      workpieceMesh = new THREE.Mesh(latheGeo, workpieceMat);
      workpieceMesh.castShadow = true;
      workpieceMesh.receiveShadow = true;
      workpieceGroup.add(workpieceMesh);
    };

    updateWorkpieceGeometry(profileCut, stock);

    // 6. CNC Turret Assembly (Mounted on slant bed carriage)
    const carriageGroup = new THREE.Group();
    slantRailsGroup.add(carriageGroup);

    // Saddle / Cross-slide Block
    const saddleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
    const saddleMesh = new THREE.Mesh(new THREE.BoxGeometry(110, 36, 120), saddleMat);
    saddleMesh.position.set(0, 52, 0);
    saddleMesh.castShadow = true;
    carriageGroup.add(saddleMesh);

    // Turret Drum (8-Station Polygonal Cylinder)
    const turretDrumGroup = new THREE.Group();
    turretDrumGroup.position.set(0, 85, 0);
    carriageGroup.add(turretDrumGroup);

    const turretMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.7 });
    const drumGeo = new THREE.CylinderGeometry(55, 55, 34, 16);
    drumGeo.rotateZ(Math.PI / 2);
    const drumMesh = new THREE.Mesh(drumGeo, turretMat);
    drumMesh.castShadow = true;
    turretDrumGroup.add(drumMesh);

    // 8 Tool Stations around the Drum
    const toolHolders = [];
    const stationColors = ['#e7b85d', '#8fd3c8', '#f6a36b', '#9db7e8', '#d6a4e8', '#c9ced3', '#fcd34d', '#a78bfa'];
    for (let st = 0; st < 8; st++) {
      const angle = (st * Math.PI * 2) / 8;
      const holderGroup = new THREE.Group();
      holderGroup.rotation.x = angle;

      // Tool Shank
      const shank = new THREE.Mesh(
        new THREE.BoxGeometry(22, 14, 38),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.8 })
      );
      shank.position.set(0, 0, 68);
      shank.castShadow = true;
      holderGroup.add(shank);

      // Carbide Insert at tip
      const insertGeo = new THREE.BoxGeometry(10, 6, 10);
      const insertMat = new THREE.MeshStandardMaterial({
        color: stationColors[st] || 0xe7b85d,
        roughness: 0.2,
        metalness: 0.85
      });
      const insert = new THREE.Mesh(insertGeo, insertMat);
      insert.position.set(-6, 0, 88);
      insert.rotation.y = Math.PI * 0.25;
      holderGroup.add(insert);

      turretDrumGroup.add(holderGroup);
      toolHolders.push(holderGroup);
    }

    // 7. Coolant Particles System
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;
      particleVelocities.push({
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2.5 - 1.5,
        vz: (Math.random() - 0.5) * 1.5,
        life: Math.random() * 20
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 3,
      transparent: true,
      opacity: 0.75
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    particleSystem.visible = false;
    scene.add(particleSystem);

    // 8. Mouse Orbit & Pan Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let cameraRotation = { theta: 0.85, phi: 0.75, radius: 460 };
    let cameraTarget = new THREE.Vector3(0, 25, 0);

    const updateCameraPos = () => {
      camera.position.x = cameraTarget.x + cameraRotation.radius * Math.sin(cameraRotation.phi) * Math.sin(cameraRotation.theta);
      camera.position.y = cameraTarget.y + cameraRotation.radius * Math.cos(cameraRotation.phi);
      camera.position.z = cameraTarget.z + cameraRotation.radius * Math.sin(cameraRotation.phi) * Math.cos(cameraRotation.theta);
      camera.lookAt(cameraTarget);
    };
    updateCameraPos();

    const handleMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      if (e.buttons === 1) {
        // Orbit
        cameraRotation.theta -= dx * 0.007;
        cameraRotation.phi = Math.max(0.15, Math.min(Math.PI * 0.48, cameraRotation.phi - dy * 0.007));
      } else if (e.buttons === 2 || e.shiftKey) {
        // Pan
        cameraTarget.x -= dx * 0.25;
        cameraTarget.y += dy * 0.25;
      }
      updateCameraPos();
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      cameraRotation.radius = Math.max(120, Math.min(950, cameraRotation.radius + e.deltaY * 0.5));
      updateCameraPos();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newW = container.clientWidth || 600;
      const newH = container.clientHeight || 400;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    // 10. Main Animation Loop
    let animId;
    let lastTime = performance.now();
    let prevProfileRef = profileCut;

    const render = () => {
      animId = requestAnimationFrame(render);
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const state = sceneStateRef.current;

      // Rotate Spindle & Chuck
      if (state.rpm > 0) {
        const radPerSec = (state.rpm * 2 * Math.PI) / 60;
        spindleGroup.rotation.x += radPerSec * dt;
      }

      // Check if profile changed and rebuild Lathe mesh
      if (state.profileCut !== prevProfileRef) {
        prevProfileRef = state.profileCut;
        updateWorkpieceGeometry(state.profileCut, state.stock);
      }

      // Move Turret Saddle according to Tool Position (X & Z)
      // Tool Z=0 is right face of stock, Z moves negative towards chuck
      // Tool X is diameter (mm)
      const targetZ = -(state.toolPos.z || 0) * 1.5;
      const targetX = ((state.toolPos.x || 50) - (state.stock.diameter || 50)) * 0.8;
      carriageGroup.position.x = THREE.MathUtils.lerp(carriageGroup.position.x, targetZ, 0.2);
      carriageGroup.position.z = THREE.MathUtils.lerp(carriageGroup.position.z, targetX, 0.2);

      // Index Turret Drum to Active Tool Station
      const targetTurretAngle = -((state.activeTool.tool - 1) * Math.PI * 2) / 8;
      turretDrumGroup.rotation.x = THREE.MathUtils.lerp(turretDrumGroup.rotation.x, targetTurretAngle, 0.15);

      // Coolant Spray Animation
      if (state.coolant && state.rpm > 0) {
        particleSystem.visible = true;
        const positions = particleGeo.attributes.position.array;
        const toolTipZ = -(state.toolPos.z || 0);
        const toolTipY = 25;
        const toolTipX = 0;

        for (let i = 0; i < particleCount; i++) {
          const v = particleVelocities[i];
          positions[i * 3] += v.vx;
          positions[i * 3 + 1] += v.vy;
          positions[i * 3 + 2] += v.vz;
          v.life -= dt * 30;

          if (v.life <= 0 || positions[i * 3 + 1] < -20) {
            positions[i * 3] = toolTipZ + (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = toolTipY + 20;
            positions[i * 3 + 2] = toolTipX + (Math.random() - 0.5) * 4;
            v.life = 15 + Math.random() * 15;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      } else {
        particleSystem.visible = false;
      }

      renderer.render(scene, camera);
    };

    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        minHeight: '340px',
        background: '#0a1017',
        overflow: 'hidden'
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* 3D View Controls Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          display: 'flex',
          gap: 6,
          zIndex: 10
        }}
      >
        <span
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid #334155',
            color: '#38bdf8',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: '4px',
            backdropFilter: 'blur(4px)'
          }}
        >
          [3D CNC SLANT-BED] · Drag: Putar · Shift/Right-drag: Geser · Scroll: Zoom
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          display: 'flex',
          gap: 8,
          zIndex: 10,
          fontSize: '11px',
          color: '#94a3b8',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid #1e293b'
        }}
      >
        <span>Spindle: <strong style={{ color: rpm > 0 ? '#4ade80' : '#fff' }}>{rpm} RPM</strong></span>
        <span>Coolant: <strong style={{ color: coolant ? '#38bdf8' : '#94a3b8' }}>{coolant ? 'M08 ON' : 'M09 OFF'}</strong></span>
        <span>Pahat: <strong style={{ color: activeTool.color }}>{activeTool.code}</strong></span>
      </div>
    </div>
  );
};

export default CncLathe3DScene;

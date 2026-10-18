import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 3D Vertical Machining Center (VMC) Scene (Standar Industri Teknalar)
 * Features:
 * - VMC cast column, base, saddle, and machine table with T-slots
 * - Precision machine vise clamping rectangular stock block
 * - Moving spindle head along Z axis with rotating BT40 toolholder & cutting tool
 * - Table moving along X & Y axes according to toolpath coordinates
 * - Side ATC magazine carousel with 6-station tool pockets
 * - Coolant flood nozzle with animated particle stream
 * - Interactive mouse orbit, pan, and scroll zoom
 */
const CncMill3DScene = ({
  stock = { x: 100, y: 70, z: 30 },
  toolPos = { x: 0, y: 0, z: 25 },
  activeTool = { tool: 1, code: 'T01', name: 'End Mill Ø10', diameter: 10, color: '#38bdf8' },
  rpm = 0,
  coolant = false,
  isCutting = false,
  doorOpen = false
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const sceneStateRef = useRef({
    stock,
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
      toolPos,
      activeTool,
      rpm,
      coolant,
      isCutting,
      doorOpen
    };
  }, [stock, toolPos, activeTool, rpm, coolant, isCutting, doorOpen]);

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
    camera.position.set(220, 260, 320);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(200, 350, 250);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7dd3fc, 0.5);
    dirLight2.position.set(-200, 150, -100);
    scene.add(dirLight2);

    // 4. VMC Machine Frame Structure
    const machineGroup = new THREE.Group();
    scene.add(machineGroup);

    // Heavy Machine Bed / Base
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x182028, roughness: 0.7, metalness: 0.3 });
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(400, 50, 340), baseMat);
    baseMesh.position.set(0, -50, 0);
    baseMesh.receiveShadow = true;
    machineGroup.add(baseMesh);

    // Rear Column (Z-Axis tower)
    const columnMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.4 });
    const columnMesh = new THREE.Mesh(new THREE.BoxGeometry(180, 320, 160), columnMat);
    columnMesh.position.set(0, 135, -90);
    columnMesh.castShadow = true;
    machineGroup.add(columnMesh);

    // Column Brand Badge ("TEKNALAR VMC-650")
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, metalness: 0.5 });
    const badge = new THREE.Mesh(new THREE.BoxGeometry(110, 22, 4), badgeMat);
    badge.position.set(0, 250, -8);
    machineGroup.add(badge);

    // Column Linear Rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.9 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(12, 280, 10), railMat);
    railL.position.set(-50, 135, -8);
    machineGroup.add(railL);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(12, 280, 10), railMat);
    railR.position.set(50, 135, -8);
    machineGroup.add(railR);

    // 5. Work Table & Vise Assembly (Moves on X & Y)
    const saddleGroup = new THREE.Group();
    saddleGroup.position.set(0, -20, 30);
    machineGroup.add(saddleGroup);

    // Saddle (Y-Axis)
    const saddleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.6 });
    const saddleMesh = new THREE.Mesh(new THREE.BoxGeometry(260, 20, 180), saddleMat);
    saddleMesh.position.set(0, 0, 0);
    saddleGroup.add(saddleMesh);

    // Table (X-Axis, with T-Slots)
    const tableGroup = new THREE.Group();
    saddleGroup.add(tableGroup);

    const tableMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.75 });
    const tableMesh = new THREE.Mesh(new THREE.BoxGeometry(280, 22, 140), tableMat);
    tableMesh.position.set(0, 20, 0);
    tableMesh.castShadow = true;
    tableMesh.receiveShadow = true;
    tableGroup.add(tableMesh);

    // Precision Milling Vise
    const viseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
    const viseBase = new THREE.Mesh(new THREE.BoxGeometry(130, 20, 90), viseMat);
    viseBase.position.set(0, 40, 0);
    viseBase.castShadow = true;
    tableGroup.add(viseBase);

    // Fixed Jaw & Moving Jaw
    const jawMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.2, metalness: 0.9 });
    const fixedJaw = new THREE.Mesh(new THREE.BoxGeometry(120, 24, 14), jawMat);
    fixedJaw.position.set(0, 52, -32);
    fixedJaw.castShadow = true;
    tableGroup.add(fixedJaw);

    const movingJaw = new THREE.Mesh(new THREE.BoxGeometry(120, 24, 14), jawMat);
    movingJaw.position.set(0, 52, 32);
    movingJaw.castShadow = true;
    tableGroup.add(movingJaw);

    // Workpiece Block
    const stockGeo = new THREE.BoxGeometry(stock.x || 100, stock.z || 30, stock.y || 70);
    const stockMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.3,
      metalness: 0.82
    });
    const stockMesh = new THREE.Mesh(stockGeo, stockMat);
    stockMesh.position.set(0, 50, 0);
    stockMesh.castShadow = true;
    stockMesh.receiveShadow = true;
    tableGroup.add(stockMesh);

    // 6. Spindle Head Assembly (Moves in Z)
    const spindleHeadGroup = new THREE.Group();
    spindleHeadGroup.position.set(0, 180, 30);
    machineGroup.add(spindleHeadGroup);

    // Spindle Casting Housing
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
    const housing = new THREE.Mesh(new THREE.BoxGeometry(110, 130, 110), housingMat);
    housing.position.set(0, 0, 0);
    housing.castShadow = true;
    spindleHeadGroup.add(housing);

    // Rotating Spindle Shaft & Toolholder
    const spindleRotGroup = new THREE.Group();
    spindleRotGroup.position.set(0, -65, 0);
    spindleHeadGroup.add(spindleRotGroup);

    // Spindle Nose
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.9 });
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(28, 32, 20, 32), noseMat);
    nose.position.set(0, 0, 0);
    spindleRotGroup.add(nose);

    // BT40 Toolholder (Taper + Flange + Collet Chuck)
    const holderMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.85 });
    const holderFlange = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 12, 32), holderMat);
    holderFlange.position.set(0, -14, 0);
    spindleRotGroup.add(holderFlange);

    const colletNut = new THREE.Mesh(new THREE.CylinderGeometry(15, 18, 22, 32), holderMat);
    colletNut.position.set(0, -30, 0);
    spindleRotGroup.add(colletNut);

    // Active Cutting Tool (Cylindrical End Mill with Flutes)
    const toolMat = new THREE.MeshStandardMaterial({
      color: activeTool.color || 0x38bdf8,
      roughness: 0.2,
      metalness: 0.9
    });
    const toolMesh = new THREE.Mesh(
      new THREE.CylinderGeometry((activeTool.diameter || 10) / 2, (activeTool.diameter || 10) / 2, 35, 24),
      toolMat
    );
    toolMesh.position.set(0, -52, 0);
    toolMesh.castShadow = true;
    spindleRotGroup.add(toolMesh);

    // 7. Side ATC Tool Magazine Carousel
    const atcGroup = new THREE.Group();
    atcGroup.position.set(-130, 160, -20);
    machineGroup.add(atcGroup);

    const atcMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.6 });
    const atcDrum = new THREE.Mesh(new THREE.CylinderGeometry(40, 40, 16, 24), atcMat);
    atcDrum.position.set(0, 0, 0);
    atcGroup.add(atcDrum);

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const pocket = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 24, 16), holderMat);
      pocket.position.set(Math.cos(angle) * 32, -10, Math.sin(angle) * 32);
      atcGroup.add(pocket);
    }

    // 8. Coolant System
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;
      particleVelocities.push({
        vx: (Math.random() - 0.5) * 1.2,
        vy: -Math.random() * 3 - 2,
        vz: (Math.random() - 0.5) * 1.2,
        life: Math.random() * 15
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

    // 9. Mouse Orbit & Pan Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let cameraRotation = { theta: 0.85, phi: 0.8, radius: 460 };
    let cameraTarget = new THREE.Vector3(0, 60, 20);

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
        cameraRotation.theta -= dx * 0.007;
        cameraRotation.phi = Math.max(0.15, Math.min(Math.PI * 0.48, cameraRotation.phi - dy * 0.007));
      } else if (e.buttons === 2 || e.shiftKey) {
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

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newW = container.clientWidth || 600;
      const newH = container.clientHeight || 400;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    // 11. Main Animation Loop
    let animId;
    let lastTime = performance.now();

    const render = () => {
      animId = requestAnimationFrame(render);
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const state = sceneStateRef.current;

      // Rotate Spindle
      if (state.rpm > 0) {
        const radPerSec = (state.rpm * 2 * Math.PI) / 60;
        spindleRotGroup.rotation.y += radPerSec * dt;
      }

      // Move Table (X & Y axis coordinates)
      const targetTableX = -(state.toolPos.x || 0);
      const targetTableY = (state.toolPos.y || 0);
      tableGroup.position.x = THREE.MathUtils.lerp(tableGroup.position.x, targetTableX, 0.2);
      saddleGroup.position.z = THREE.MathUtils.lerp(saddleGroup.position.z, targetTableY + 30, 0.2);

      // Move Spindle Head along Z axis
      const targetSpindleZ = 160 + (state.toolPos.z || 20);
      spindleHeadGroup.position.y = THREE.MathUtils.lerp(spindleHeadGroup.position.y, targetSpindleZ, 0.2);

      // Coolant Spray Animation
      if (state.coolant && state.rpm > 0) {
        particleSystem.visible = true;
        const positions = particleGeo.attributes.position.array;
        const toolTipX = 0;
        const toolTipY = spindleHeadGroup.position.y - 120;
        const toolTipZ = 30;

        for (let i = 0; i < particleCount; i++) {
          const v = particleVelocities[i];
          positions[i * 3] += v.vx;
          positions[i * 3 + 1] += v.vy;
          positions[i * 3 + 2] += v.vz;
          v.life -= dt * 25;

          if (v.life <= 0 || positions[i * 3 + 1] < 40) {
            positions[i * 3] = toolTipX + (Math.random() - 0.5) * 6;
            positions[i * 3 + 1] = toolTipY;
            positions[i * 3 + 2] = toolTipZ + (Math.random() - 0.5) * 6;
            v.life = 12 + Math.random() * 12;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
      } else {
        particleSystem.visible = false;
      }

      renderer.render(scene, camera);
    };

    render();

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

      {/* View Header */}
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
            color: '#10b981',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: '4px',
            backdropFilter: 'blur(4px)'
          }}
        >
          [3D CNC VMC FRAIS] · Drag: Putar · Shift/Right-drag: Geser · Scroll: Zoom
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

export default CncMill3DScene;

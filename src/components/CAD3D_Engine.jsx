import React, { useMemo, useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

// Material Preset Definitions with Physical Properties
const MATERIALS = {
  steel: {
    name: 'Baja ST37 (Polished Steel)',
    color: '#cbd5e1',
    metalness: 0.85,
    roughness: 0.25,
    clearcoat: 0.2,
    density: 7.85 // g/cm^3
  },
  aluminium: {
    name: 'Aluminium 6061 (Satin)',
    color: '#e2e8f0',
    metalness: 0.65,
    roughness: 0.35,
    clearcoat: 0.1,
    density: 2.70
  },
  brass: {
    name: 'Kuningan (Cast Brass)',
    color: '#fbbf24',
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 0.3,
    density: 8.50
  },
  copper: {
    name: 'Tembaga Murni (Copper)',
    color: '#ea580c',
    metalness: 0.85,
    roughness: 0.25,
    clearcoat: 0.2,
    density: 8.96
  },
  chrome: {
    name: 'Krom Kilap Tinggi (Chrome)',
    color: '#ffffff',
    metalness: 0.98,
    roughness: 0.04,
    clearcoat: 0.8,
    density: 7.19
  },
  black_anodized: {
    name: 'Hitam Doff (Anodized Black)',
    color: '#1e293b',
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 0.05,
    density: 2.70
  }
};

// Generates an ISO Hex Nut Geometry with centered threaded hole
const createHexNutGeometry = (radius = 35, height = 25, holeRadius = 16) => {
  const shape = new THREE.Shape();
  const sides = 6;
  for (let i = 0; i < sides; i++) {
    const ang = (i * 2 * Math.PI) / sides;
    const x = radius * Math.cos(ang);
    const y = radius * Math.sin(ang);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  // Concentric hole in center
  const hole = new THREE.Path();
  hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 2,
    bevelThickness: 2
  });
  geom.center();
  geom.rotateX(Math.PI / 2);
  geom.translate(0, height / 2, 0);
  return geom;
};

// Solid Mesh with Fusion 360 Feature Edges
const CADModelBody = ({ geometry, materialProps, visualStyle }) => {
  const edgesGeom = useMemo(() => {
    if (!geometry) return null;
    return new THREE.EdgesGeometry(geometry, 24); // Sharp 24-deg edge threshold
  }, [geometry]);

  const showMesh = visualStyle !== 'wireframe';
  const showEdges = visualStyle === 'shaded_edges' || visualStyle === 'wireframe';
  const isXRay = visualStyle === 'xray';

  return (
    <group>
      {showMesh && (
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={materialProps.color}
            metalness={materialProps.metalness}
            roughness={materialProps.roughness}
            transparent={isXRay}
            opacity={isXRay ? 0.45 : 1.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {showEdges && edgesGeom && (
        <lineSegments geometry={edgesGeom}>
          <lineBasicMaterial color={visualStyle === 'wireframe' ? '#38bdf8' : '#0f172a'} linewidth={1.5} />
        </lineSegments>
      )}
    </group>
  );
};

// Camera Controller for ViewCube Animation
const CameraRig = ({ cameraTargetPos, controlsRef }) => {
  useFrame((state) => {
    if (cameraTargetPos && controlsRef.current) {
      state.camera.position.lerp(cameraTargetPos, 0.08);
      controlsRef.current.update();
    }
  });
  return null;
};

const CAD3D_Engine = ({
  shapes = [],
  solidTool = 'extrude',
  extrudeDepth = 30,
  revolveSegments = 36,
  revolveAngle = 360,
  bevelEnabled = false,
  bevelSize = 2,
  bevelThickness = 2,
  pipeRadius = 8,
  primitiveSize = { x: 60, y: 50, z: 60 },
  scaleFactor = 1,
  activeMaterial = 'steel',
  visualStyle = 'shaded_edges',
  exportTrigger = 0,
  onLoadTemplate,
  onEditSketch
}) => {
  const controlsRef = useRef(null);
  const [cameraTargetPos, setCameraTargetPos] = useState(null);

  const matProps = MATERIALS[activeMaterial] || MATERIALS.steel;

  const extrudeSettings = useMemo(() => ({
    depth: extrudeDepth,
    bevelEnabled: bevelEnabled,
    bevelSegments: Math.max(1, bevelThickness),
    steps: 2,
    bevelSize: bevelSize,
    bevelThickness: bevelSize
  }), [extrudeDepth, bevelEnabled, bevelSize, bevelThickness]);

  // Construct 3D Meshes from 2D sketches or 3D Solid primitives
  const meshData = useMemo(() => {
    const data = [];
    const isPrimitive = ['box', 'cylinder', 'sphere', 'hex_nut', 'torus', 'cone'].includes(solidTool);

    if (isPrimitive) {
      let geometry;
      if (solidTool === 'box') {
        geometry = new THREE.BoxGeometry(primitiveSize.x, primitiveSize.y, primitiveSize.z || primitiveSize.x);
        geometry.translate(0, primitiveSize.y / 2, 0);
      } else if (solidTool === 'cylinder') {
        geometry = new THREE.CylinderGeometry(primitiveSize.x / 2, primitiveSize.x / 2, primitiveSize.y, 36);
        geometry.translate(0, primitiveSize.y / 2, 0);
      } else if (solidTool === 'sphere') {
        geometry = new THREE.SphereGeometry(primitiveSize.x / 2, 36, 24);
        geometry.translate(0, primitiveSize.x / 2, 0);
      } else if (solidTool === 'hex_nut') {
        geometry = createHexNutGeometry(primitiveSize.x / 2, primitiveSize.y, (primitiveSize.x / 2) * 0.45);
      } else if (solidTool === 'torus') {
        geometry = new THREE.TorusGeometry(primitiveSize.x / 2, 10, 24, 48);
        geometry.rotateX(Math.PI / 2);
        geometry.translate(0, 10, 0);
      } else if (solidTool === 'cone') {
        geometry = new THREE.ConeGeometry(primitiveSize.x / 2, primitiveSize.y, 36);
        geometry.translate(0, primitiveSize.y / 2, 0);
      }

      if (geometry) {
        geometry.computeVertexNormals();
        data.push({ geometry, type: 'solid' });
      }
      return data;
    }

    // Helper to check if circle is inside rect
    const isCircleInRect = (c, r) => {
      const cx = (c.cx - 400) * 0.5;
      const cy = -(c.cy - 300) * 0.5;
      const rx = (r.x - 400) * 0.5;
      const ry = -(r.y - 300) * 0.5;
      const rw = r.width * 0.5;
      const rh = r.height * 0.5;
      return cx > rx && cx < rx + rw && cy < ry && cy > ry - rh;
    };

    // Helper to check if circle is inside another larger circle
    const isCircleInCircle = (cInner, cOuter) => {
      if (cInner.id === cOuter.id || (cInner.r || 0) >= (cOuter.r || 0)) return false;
      const dx = (cInner.cx - cOuter.cx) * 0.5;
      const dy = -(cInner.cy - cOuter.cy) * 0.5;
      return Math.hypot(dx, dy) + ((cInner.r || 0) * 0.5) <= ((cOuter.r || 0) * 0.5);
    };

    // Helper to check if circle is inside polygon
    const isCircleInPolygon = (c, poly) => {
      const cx = (c.cx - 400) * 0.5;
      const cy = -(c.cy - 300) * 0.5;
      const polyX = (poly.cx - 400) * 0.5;
      const polyY = -(poly.cy - 300) * 0.5;
      return Math.hypot(cx - polyX, cy - polyY) + ((c.r || 0) * 0.5) <= ((poly.r || 0) * 0.5);
    };

    // Determine which circles act as holes
    const allCircles = shapes.filter(s => s.type === 'circle');
    const isHoleCircle = (c) => {
      // Is it inside any rect?
      const inRect = shapes.some(s => s.type === 'rect' && isCircleInRect(c, s));
      if (inRect) return true;
      // Is it inside any larger circle?
      const inCirc = allCircles.some(other => isCircleInCircle(c, other));
      if (inCirc) return true;
      // Is it inside any polygon?
      const inPoly = shapes.some(s => s.type === 'polygon' && isCircleInPolygon(c, s));
      if (inPoly) return true;
      return false;
    };

    const isExtruding = solidTool === 'extrude' || solidTool === 'fillet';
    const isRevolving = solidTool === 'revolve';
    const isPiping = solidTool === 'pipe';

    // Process non-line/non-arc 2D sketches (rect, circle, polygon, spline)
    const lineShapes = shapes.filter(s => s.type === 'line');
    const arcShapes = shapes.filter(s => s.type === 'arc');
    const standardShapes = shapes.filter(s => ['rect', 'circle', 'polygon', 'spline'].includes(s.type));

    standardShapes.forEach(shape => {
      try {
        const x = (shape.x !== undefined ? shape.x - 400 : 0) * 0.5;
        const y = (shape.y !== undefined ? -(shape.y - 300) : 0) * 0.5;

        let s = new THREE.Shape();
        let pts2d = [];
        let points3d = [];

        if (shape.type === 'rect') {
          const w = shape.width * 0.5;
          const h = shape.height * 0.5;
          s.moveTo(x, y);
          s.lineTo(x + w, y);
          s.lineTo(x + w, y - h);
          s.lineTo(x, y - h);
          s.closePath();
          pts2d = s.getPoints();

          // Hole Injection in Extrude
          if (isExtruding) {
            allCircles.forEach(hole => {
              if (isCircleInRect(hole, shape)) {
                const hx = (hole.cx - 400) * 0.5;
                const hy = -(hole.cy - 300) * 0.5;
                const hr = hole.r * 0.5;
                const holePath = new THREE.Path();
                holePath.absarc(hx, hy, hr, 0, Math.PI * 2, true);
                s.holes.push(holePath);
              }
            });
          }
        } else if (shape.type === 'circle') {
          // If circle is inside another shape, it acts as a hole; skip standalone extrude
          if (isExtruding && isHoleCircle(shape)) {
            return;
          }

          const scx = (shape.cx - 400) * 0.5;
          const scy = -(shape.cy - 300) * 0.5;
          const scr = shape.r * 0.5;
          s.absarc(scx, scy, scr, 0, Math.PI * 2, false);
          pts2d = s.getPoints(36);

          // If this is an outer circle, inject any concentric inner circles as holes
          if (isExtruding) {
            allCircles.forEach(hole => {
              if (isCircleInCircle(hole, shape)) {
                const hx = (hole.cx - 400) * 0.5;
                const hy = -(hole.cy - 300) * 0.5;
                const hr = hole.r * 0.5;
                const holePath = new THREE.Path();
                holePath.absarc(hx, hy, hr, 0, Math.PI * 2, true);
                s.holes.push(holePath);
              }
            });
          }
        } else if (shape.type === 'polygon' && shape.points) {
          const pts = shape.points.map(p => new THREE.Vector2((p.x - 400) * 0.5, -(p.y - 300) * 0.5));
          if (pts.length > 2) {
            s.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].y);
            s.closePath();
            pts2d = pts;

            // Inject holes inside polygon (e.g. Hex Nut central bore)
            if (isExtruding) {
              allCircles.forEach(hole => {
                if (isCircleInPolygon(hole, shape)) {
                  const hx = (hole.cx - 400) * 0.5;
                  const hy = -(hole.cy - 300) * 0.5;
                  const hr = hole.r * 0.5;
                  const holePath = new THREE.Path();
                  holePath.absarc(hx, hy, hr, 0, Math.PI * 2, true);
                  s.holes.push(holePath);
                }
              });
            }
          }
        } else if (shape.type === 'spline' && shape.points) {
          const pts = shape.points.map(p => new THREE.Vector3((p.x - 400) * 0.5, -(p.y - 300) * 0.5, 0));
          if (pts.length > 1) {
            points3d = pts;
            s.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) s.lineTo(pts[i].x, pts[i].y);
            s.closePath();
            pts2d = s.getPoints();
          }
        }

        if (isExtruding) {
          const geometry = new THREE.ExtrudeGeometry(s, extrudeSettings);
          geometry.computeVertexNormals();
          data.push({ geometry, type: 'solid' });
        } else if (isRevolving && pts2d.length > 0) {
          const latPts = pts2d.map(p => new THREE.Vector2(Math.abs(p.x), p.y));
          const angleRad = (revolveAngle * Math.PI) / 180;
          const geometry = new THREE.LatheGeometry(latPts, revolveSegments, 0, angleRad);
          geometry.computeVertexNormals();
          data.push({ geometry, type: 'solid' });
        } else if (isPiping && points3d.length > 1) {
          const curve = new THREE.CatmullRomCurve3(points3d);
          const geometry = new THREE.TubeGeometry(curve, 64, pipeRadius, 16, false);
          geometry.computeVertexNormals();
          data.push({ geometry, type: 'solid' });
        }
      } catch (err) {
        console.warn('CAD3D process standard shape error:', err);
      }
    });

    // Process Lines & Arcs into 3D Solid Geometry
    if (lineShapes.length > 0 || arcShapes.length > 0) {
      try {
        const segs = lineShapes.map(l => ({
          p1: { x: (l.x1 - 400) * 0.5, y: -(l.y1 - 300) * 0.5 },
          p2: { x: (l.x2 - 400) * 0.5, y: -(l.y2 - 300) * 0.5 },
          used: false
        }));

        const snapDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
        const tolerance = 7; // 7mm tolerance for loop detection

        // 1. Detect closed loops of connected lines -> Extrude into Solid Body!
        for (let i = 0; i < segs.length; i++) {
          if (segs[i].used) continue;

          const loop = [segs[i].p1, segs[i].p2];
          segs[i].used = true;
          let curr = segs[i].p2;
          let isClosed = false;

          while (true) {
            let found = false;
            for (let j = 0; j < segs.length; j++) {
              if (segs[j].used) continue;
              if (snapDist(curr, segs[j].p1) <= tolerance) {
                loop.push(segs[j].p2);
                curr = segs[j].p2;
                segs[j].used = true;
                found = true;
                break;
              } else if (snapDist(curr, segs[j].p2) <= tolerance) {
                loop.push(segs[j].p1);
                curr = segs[j].p1;
                segs[j].used = true;
                found = true;
                break;
              }
            }
            if (!found) break;
            if (snapDist(curr, loop[0]) <= tolerance && loop.length > 3) {
              isClosed = true;
              break;
            }
          }

          if (isClosed && loop.length > 3) {
            const loopShape = new THREE.Shape();
            loopShape.moveTo(loop[0].x, loop[0].y);
            for (let k = 1; k < loop.length - 1; k++) {
              loopShape.lineTo(loop[k].x, loop[k].y);
            }
            loopShape.closePath();

            if (isExtruding) {
              const geom = new THREE.ExtrudeGeometry(loopShape, extrudeSettings);
              geom.computeVertexNormals();
              data.push({ geometry: geom, type: 'solid' });
            } else if (isRevolving) {
              const latPts = loop.map(p => new THREE.Vector2(Math.abs(p.x), p.y));
              const geom = new THREE.LatheGeometry(latPts, revolveSegments, 0, (revolveAngle * Math.PI) / 180);
              geom.computeVertexNormals();
              data.push({ geometry: geom, type: 'solid' });
            }
          }
        }

        // 2. Extrude unclosed lines as solid 3D plates/walls (thickness: 4mm)
        segs.forEach(seg => {
          if (!seg.used) {
            const dx = seg.p2.x - seg.p1.x;
            const dy = seg.p2.y - seg.p1.y;
            const len = Math.hypot(dx, dy);
            if (len > 0.5) {
              const nx = (-dy / len) * 2; // 2mm offset each side = 4mm thick wall
              const ny = (dx / len) * 2;
              const wallShape = new THREE.Shape();
              wallShape.moveTo(seg.p1.x + nx, seg.p1.y + ny);
              wallShape.lineTo(seg.p2.x + nx, seg.p2.y + ny);
              wallShape.lineTo(seg.p2.x - nx, seg.p2.y - ny);
              wallShape.lineTo(seg.p1.x - nx, seg.p1.y - ny);
              wallShape.closePath();

              if (isExtruding) {
                const geom = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
                geom.computeVertexNormals();
                data.push({ geometry: geom, type: 'solid' });
              } else if (isPiping) {
                const p1_3d = new THREE.Vector3(seg.p1.x, seg.p1.y, 0);
                const p2_3d = new THREE.Vector3(seg.p2.x, seg.p2.y, 0);
                const lineCurve = new THREE.LineCurve3(p1_3d, p2_3d);
                const geom = new THREE.TubeGeometry(lineCurve, 24, pipeRadius, 16, false);
                geom.computeVertexNormals();
                data.push({ geometry: geom, type: 'solid' });
              }
            }
          }
        });

        // 3. Extrude Arc shapes as solid curved walls
        arcShapes.forEach(arc => {
          const p1 = { x: (arc.x1 - 400) * 0.5, y: -(arc.y1 - 300) * 0.5 };
          const p2 = { x: (arc.x2 - 400) * 0.5, y: -(arc.y2 - 300) * 0.5 };
          const mx = arc.mx !== undefined ? (arc.mx - 400) * 0.5 : (p1.x + p2.x) / 2;
          const my = arc.my !== undefined ? -(arc.my - 300) * 0.5 : (p1.y + p2.y) / 2 + 15;
          const curve = new THREE.QuadraticBezierCurve(
            new THREE.Vector2(p1.x, p1.y),
            new THREE.Vector2(2 * mx - 0.5 * p1.x - 0.5 * p2.x, 2 * my - 0.5 * p1.y - 0.5 * p2.y),
            new THREE.Vector2(p2.x, p2.y)
          );
          const pts = curve.getPoints(24);
          if (pts.length > 2) {
            const arcShape = new THREE.Shape();
            arcShape.moveTo(pts[0].x, pts[0].y + 2);
            for (let i = 1; i < pts.length; i++) arcShape.lineTo(pts[i].x, pts[i].y + 2);
            for (let i = pts.length - 1; i >= 0; i--) arcShape.lineTo(pts[i].x, pts[i].y - 2);
            arcShape.closePath();

            const geom = new THREE.ExtrudeGeometry(arcShape, extrudeSettings);
            geom.computeVertexNormals();
            data.push({ geometry: geom, type: 'solid' });
          }
        });
      } catch (err) {
        console.warn('CAD3D process lines/arcs error:', err);
      }
    }


    return data;
  }, [shapes, solidTool, extrudeSettings, revolveSegments, revolveAngle, pipeRadius, primitiveSize]);

  // Compute Physical Metrology Metrics (Volume, Area, Mass)
  const inspectionMetrics = useMemo(() => {
    let totalVol = 0;
    let totalArea = 0;

    meshData.forEach(item => {
      if (item.type === 'solid' && item.geometry) {
        const geom = item.geometry;
        if (!geom.boundingBox) geom.computeBoundingBox();
        const bb = geom.boundingBox;
        const dx = Math.abs(bb.max.x - bb.min.x);
        const dy = Math.abs(bb.max.y - bb.min.y);
        const dz = Math.abs(bb.max.z - bb.min.z);
        // Approximation for volume & surface area
        const vol = dx * dy * dz * 0.7; // average form factor
        const area = 2 * (dx * dy + dy * dz + dz * dx);
        totalVol += vol;
        totalArea += area;
      }
    });

    const volCm3 = totalVol / 1000;
    const areaCm2 = totalArea / 100;
    const massGrams = volCm3 * matProps.density;

    return {
      volume: volCm3.toFixed(1),
      area: areaCm2.toFixed(1),
      mass: massGrams.toFixed(1)
    };
  }, [meshData, matProps]);

  // Export current 3D Solids to standard binary STL file for 3D Printing & CAM
  const handleExportSTL = () => {
    try {
      const exportScene = new THREE.Scene();
      let count = 0;
      meshData.forEach((item) => {
        if (item.type === 'solid' && item.geometry) {
          const mesh = new THREE.Mesh(item.geometry, new THREE.MeshStandardMaterial());
          mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
          exportScene.add(mesh);
          count++;
        }
      });
      if (count === 0) {
        alert('Belum ada objek solid 3D. Buat sketsa profil atau pilih Solid Primitive terlebih dahulu!');
        return;
      }
      const exporter = new STLExporter();
      const result = exporter.parse(exportScene, { binary: true });
      const blob = new Blob([result], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `CAD_Solid_${activeMaterial}_${Date.now()}.stl`;
      link.click();
    } catch (err) {
      console.error('Failed to export STL:', err);
      alert('Gagal mengekspor file STL: ' + err.message);
    }
  };

  // Expose export trigger if requested by parent
  useEffect(() => {
    if (exportTrigger && typeof exportTrigger === 'number') {
      handleExportSTL();
    }
  }, [exportTrigger]);

  // ViewCube Camera presets
  const handleViewPreset = (viewName) => {
    const dist = 280;
    if (viewName === 'TOP') setCameraTargetPos(new THREE.Vector3(0, dist * 1.5, 0));
    else if (viewName === 'FRONT') setCameraTargetPos(new THREE.Vector3(0, 0, dist * 1.5));
    else if (viewName === 'RIGHT') setCameraTargetPos(new THREE.Vector3(dist * 1.5, 0, 0));
    else if (viewName === 'LEFT') setCameraTargetPos(new THREE.Vector3(-dist * 1.5, 0, 0));
    else if (viewName === 'ISO') setCameraTargetPos(new THREE.Vector3(dist, dist, dist));
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#090d16' }}>
      
      {/* AUTODESK FUSION 360 VIEWCUBE (TOP RIGHT) */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 30,
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '10px',
          padding: '8px',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px', marginBottom: '2px' }}>
          VIEWCUBE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gap: '3px' }}>
          <div />
          <button
            onClick={() => handleViewPreset('TOP')}
            style={{ height: '26px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer' }}
          >
            TOP
          </button>
          <div />

          <button
            onClick={() => handleViewPreset('LEFT')}
            style={{ height: '26px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer' }}
          >
            L
          </button>
          <button
            onClick={() => handleViewPreset('FRONT')}
            style={{ height: '26px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer' }}
          >
            FRT
          </button>
          <button
            onClick={() => handleViewPreset('RIGHT')}
            style={{ height: '26px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer' }}
          >
            R
          </button>

          <div />
          <button
            onClick={() => handleViewPreset('ISO')}
            style={{ height: '26px', background: 'rgba(245, 158, 11, 0.25)', border: '1px solid #f59e0b', color: '#f59e0b', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer' }}
          >
            ISO
          </button>
          <div />
        </div>
      </div>

      {/* METROLOGY & PHYSICAL INSPECTOR HUD (TOP LEFT) */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 30,
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '10px',
          padding: '12px 16px',
          backdropFilter: 'blur(8px)',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
        }}
      >
        <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
          <span>📊</span> METROLOGI & FISIK (ISO)
        </div>
        <div>Material: <strong style={{ color: matProps.color }}>{matProps.name}</strong></div>
        <div>Volume: <strong style={{ color: '#ffffff' }}>{inspectionMetrics.volume} cm³</strong></div>
        <div>Luas Permukaan: <strong style={{ color: '#ffffff' }}>{inspectionMetrics.area} cm²</strong></div>
        <div>Estimasi Massa: <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>{inspectionMetrics.mass} gram</strong></div>
        
        <button
          onClick={handleExportSTL}
          style={{
            marginTop: '6px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            border: '1px solid #38bdf8',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)',
            transition: 'all 0.15s'
          }}
          onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
          onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
        >
          <span>📥</span> Export File STL (3D Print)
        </button>
      </div>


      {/* HELPFUL OVERLAY WHEN NO 2D SHAPES ARE DRAWN YET */}
      {meshData.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 35,
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '14px',
          padding: '24px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
          maxWidth: '460px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '2.4rem' }}>📐 ➔ 🧊</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.3px' }}>
            Sketsa 2D Belum Dibuat
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            Anda dapat menggambar garis / profil terlebih dahulu di <strong>Mode Sketsa 2D</strong>, lalu klik <strong>"UBAH KE 3D"</strong>. Atau klik salah satu contoh desain cepat di bawah ini untuk melihat model 3D langsung:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', marginTop: '6px' }}>
            <button
              onClick={() => onLoadTemplate && onLoadTemplate('shaft')}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              🪵 Poros Bubut 3D
            </button>
            <button
              onClick={() => onLoadTemplate && onLoadTemplate('flange')}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #0284c7', background: 'rgba(2, 132, 199, 0.2)', color: '#7dd3fc', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              🔘 Flensa PCD 3D
            </button>
            <button
              onClick={() => onLoadTemplate && onLoadTemplate('milling')}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              🧱 Balok Frais 3D
            </button>
            <button
              onClick={() => onLoadTemplate && onLoadTemplate('hex_nut')}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              🔩 Mur ISO 3D
            </button>
          </div>
          <button
            onClick={onEditSketch}
            style={{
              marginTop: '4px',
              padding: '8px 18px',
              borderRadius: '6px',
              border: '1px solid #64748b',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>✏️</span> Buka Editor Sketsa 2D Sekarang
          </button>
        </div>
      )}



      {/* 3D CANVAS VIEWPORT */}
      <Canvas shadows camera={{ position: [180, 160, 260], fov: 42 }}>
        <color attach="background" args={['#090d16']} />

        <ambientLight intensity={1.2} />
        <directionalLight position={[150, 400, 250]} intensity={2.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <directionalLight position={[-150, 200, -150]} intensity={1.0} color="#e0f2fe" />
        <pointLight position={[0, 150, 0]} intensity={1.0} />

        <Environment preset="city" />

        {/* Scaled Model Assembly */}
        <group scale={[scaleFactor, scaleFactor, scaleFactor]}>
          {meshData.map((item, idx) => (
            item.type === 'solid' ? (
              <CADModelBody
                key={idx}
                geometry={item.geometry}
                materialProps={matProps}
                visualStyle={visualStyle}
              />
            ) : (
              <line key={idx} geometry={item.geometry}>
                <lineBasicMaterial color="#38bdf8" linewidth={2} />
              </line>
            )
          ))}
        </group>

        {/* CAD Technical Grid and Shadows */}
        <Grid
          infiniteGrid
          fadeDistance={1200}
          sectionSize={50}
          cellSize={10}
          sectionColor="#38bdf8"
          cellColor="#1e293b"
          position={[0, -0.05, 0]}
        />
        <axesHelper args={[100]} />
        <ContactShadows position={[0, -0.1, 0]} opacity={0.65} scale={500} blur={1.5} far={15} />

        <CameraRig cameraTargetPos={cameraTargetPos} controlsRef={controlsRef} />
        <OrbitControls ref={controlsRef} makeDefault minDistance={30} maxDistance={1500} />
      </Canvas>
    </div>
  );
};

export default CAD3D_Engine;

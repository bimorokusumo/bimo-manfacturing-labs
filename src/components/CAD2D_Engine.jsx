import React, { useState, useRef, useEffect, useMemo } from 'react';

const CAD2D_Engine = ({
  shapes = [],
  setShapes,
  currentTool = 'select',
  setCurrentTool,
  snapGrid = true,
  setSnapGrid,
  showDimensions = true,
  setShowDimensions,
  showProfile = true,
  setShowProfile,
  orthoMode = false,
  setOrthoMode,
  osnapEnabled = true,
  setOsnapEnabled,
  theme = 'dark', // 'dark' (AutoCAD) or 'light' (Fusion 360)
  polygonSides = 6
}) => {
  const svgRef = useRef(null);
  const [draftShape, setDraftShape] = useState(null);
  const [activeSnap, setActiveSnap] = useState(null); // { x, y, type: 'endpoint'|'midpoint'|'center'|'grid' }
  const [trackingLines, setTrackingLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [cursorCoord, setCursorCoord] = useState({ x: 0, y: 0 });
  const [arcStep, setArcStep] = useState(0); // 0: none, 1: start set, 2: mid set
  const [arcPoints, setArcPoints] = useState([]);

  const gridSize = 20; // 20px = 10mm (1px = 0.5mm, 100mm = 200px)
  const ORIGIN_X = 400;
  const ORIGIN_Y = 300;

  // Convert client coordinates to World (Origin at center, +X right, +Y up)
  const toWorld = (svgX, svgY) => ({
    x: Math.round((svgX - ORIGIN_X) * 0.5),
    y: Math.round((ORIGIN_Y - svgY) * 0.5)
  });

  // Calculate Snapping & OSNAP
  const getMousePos = (e) => {
    if (!svgRef.current) return { pt: { x: 0, y: 0 }, snap: null, tracking: [] };
    const rect = svgRef.current.getBoundingClientRect();
    let rawX = e.clientX - rect.left;
    let rawY = e.clientY - rect.top;

    let x = rawX;
    let y = rawY;

    // Apply ORTHO lock if drawing a line or dimension
    if (orthoMode && isDrawing && startPoint && (currentTool === 'line' || currentTool === 'dimension')) {
      const dx = Math.abs(x - startPoint.x);
      const dy = Math.abs(y - startPoint.y);
      if (dx > dy) {
        y = startPoint.y; // lock horizontal
      } else {
        x = startPoint.x; // lock vertical
      }
    }

    let closestDist = 18;
    let snappedPt = { x, y };
    let foundSnap = null;
    const newTracking = [];

    // 1. Gather OSNAP target points from existing shapes
    if (osnapEnabled) {
      const snapTargets = [];

      shapes.forEach(s => {
        if (s.type === 'line' || s.type === 'dimension') {
          snapTargets.push({ x: s.x1, y: s.y1, type: 'endpoint' });
          snapTargets.push({ x: s.x2, y: s.y2, type: 'endpoint' });
          snapTargets.push({ x: (s.x1 + s.x2) / 2, y: (s.y1 + s.y2) / 2, type: 'midpoint' });
        } else if (s.type === 'rect') {
          const x2 = s.x + s.width;
          const y2 = s.y + s.height;
          snapTargets.push({ x: s.x, y: s.y, type: 'endpoint' });
          snapTargets.push({ x: x2, y: s.y, type: 'endpoint' });
          snapTargets.push({ x: x2, y: y2, type: 'endpoint' });
          snapTargets.push({ x: s.x, y: y2, type: 'endpoint' });
          snapTargets.push({ x: (s.x + x2) / 2, y: (s.y + y2) / 2, type: 'center' });
        } else if (s.type === 'circle') {
          snapTargets.push({ x: s.cx, y: s.cy, type: 'center' });
          snapTargets.push({ x: s.cx + s.r, y: s.cy, type: 'quadrant' });
          snapTargets.push({ x: s.cx - s.r, y: s.cy, type: 'quadrant' });
          snapTargets.push({ x: s.cx, y: s.cy - s.r, type: 'quadrant' });
          snapTargets.push({ x: s.cx, y: s.cy + s.r, type: 'quadrant' });
        } else if (s.type === 'arc') {
          snapTargets.push({ x: s.x1, y: s.y1, type: 'endpoint' });
          snapTargets.push({ x: s.x2, y: s.y2, type: 'endpoint' });
          snapTargets.push({ x: s.mx, y: s.my, type: 'midpoint' });
        } else if (s.type === 'polygon' && s.points) {
          s.points.forEach(p => snapTargets.push({ x: p.x, y: p.y, type: 'endpoint' }));
        }
      });

      // Always include Origin (0,0) as a snap target
      snapTargets.push({ x: ORIGIN_X, y: ORIGIN_Y, type: 'origin' });

      snapTargets.forEach(tgt => {
        const d = Math.hypot(tgt.x - x, tgt.y - y);
        if (d < closestDist) {
          closestDist = d;
          snappedPt = { x: tgt.x, y: tgt.y };
          foundSnap = tgt;
        }
      });
    }

    // 2. Fallback to Grid Snap
    if (!foundSnap && snapGrid) {
      const gx = Math.round(x / gridSize) * gridSize;
      const gy = Math.round(y / gridSize) * gridSize;
      if (Math.hypot(gx - x, gy - y) < 14) {
        snappedPt = { x: gx, y: gy };
        foundSnap = { x: gx, y: gy, type: 'grid' };
      }
    }

    // 3. Dynamic Polar Alignment Tracking Lines
    if (foundSnap) {
      newTracking.push({ type: 'v', x: foundSnap.x });
      newTracking.push({ type: 'h', y: foundSnap.y });
    }

    return { pt: snappedPt, snap: foundSnap, tracking: newTracking };
  };

  const handlePointerDown = (e) => {
    if (['select', 'delete', 'mirror', 'pattern_rect', 'pattern_polar', 'trim', 'fillet', 'offset'].includes(currentTool)) return;

    const { pt } = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(pt);

    if (currentTool === 'line' || currentTool === 'dimension') {
      setDraftShape({ type: currentTool, x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
    } else if (currentTool === 'rect') {
      setDraftShape({ type: 'rect', x: pt.x, y: pt.y, width: 0, height: 0, startX: pt.x, startY: pt.y });
    } else if (currentTool === 'circle') {
      setDraftShape({ type: 'circle', cx: pt.x, cy: pt.y, r: 0 });
    } else if (currentTool === 'arc') {
      if (arcStep === 0) {
        setArcPoints([pt]);
        setArcStep(1);
        setDraftShape({ type: 'arc_preview', x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
      } else if (arcStep === 1) {
        const p1 = arcPoints[0];
        const newShape = {
          type: 'arc',
          x1: p1.x,
          y1: p1.y,
          mx: (p1.x + pt.x) / 2,
          my: Math.min(p1.y, pt.y) - 30,
          x2: pt.x,
          y2: pt.y,
          id: Date.now().toString()
        };
        setShapes(prev => [...prev, newShape]);
        setArcStep(0);
        setArcPoints([]);
        setIsDrawing(false);
        setDraftShape(null);
      }
    } else if (currentTool === 'polygon') {
      setDraftShape({ type: 'polygon', cx: pt.x, cy: pt.y, r: 0, sides: polygonSides || 6 });
    } else if (currentTool === 'spline') {
      setDraftShape({ type: 'spline', points: [pt] });
    }
  };

  const handlePointerMove = (e) => {
    const { pt, snap, tracking } = getMousePos(e);
    setActiveSnap(snap);
    setTrackingLines(tracking);
    setCursorCoord(toWorld(pt.x, pt.y));

    if (!isDrawing || !startPoint || !draftShape) return;

    if (currentTool === 'line' || currentTool === 'dimension') {
      setDraftShape(prev => ({ ...prev, x2: pt.x, y2: pt.y }));
    } else if (currentTool === 'rect') {
      setDraftShape(prev => {
        const width = Math.abs(pt.x - startPoint.x);
        const height = Math.abs(pt.y - startPoint.y);
        const x = Math.min(pt.x, startPoint.x);
        const y = Math.min(pt.y, startPoint.y);
        return { ...prev, x, y, width, height };
      });
    } else if (currentTool === 'circle') {
      setDraftShape(prev => ({ ...prev, r: Math.hypot(pt.x - prev.cx, pt.y - prev.cy) }));
    } else if (currentTool === 'polygon') {
      setDraftShape(prev => {
        const r = Math.hypot(pt.x - prev.cx, pt.y - prev.cy);
        const sides = prev.sides || 6;
        const pts = [];
        for (let i = 0; i < sides; i++) {
          const ang = (i * 2 * Math.PI) / sides - Math.PI / 2;
          pts.push({ x: prev.cx + r * Math.cos(ang), y: prev.cy + r * Math.sin(ang) });
        }
        return { ...prev, r, points: pts };
      });
    } else if (currentTool === 'spline') {
      const lastPt = draftShape.points[draftShape.points.length - 1];
      if (Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y) > 10) {
        setDraftShape(prev => ({ ...prev, points: [...prev.points, pt] }));
      }
    }
  };

  const handlePointerUp = () => {
    if (isDrawing && draftShape && currentTool !== 'arc') {
      let isValid = true;
      if ((draftShape.type === 'line' || draftShape.type === 'dimension') && draftShape.x1 === draftShape.x2 && draftShape.y1 === draftShape.y2) isValid = false;
      if (draftShape.type === 'rect' && (draftShape.width === 0 || draftShape.height === 0)) isValid = false;
      if (draftShape.type === 'circle' && draftShape.r < 3) isValid = false;
      if (draftShape.type === 'polygon' && draftShape.r < 3) isValid = false;
      if (draftShape.type === 'spline' && draftShape.points.length < 3) isValid = false;

      if (isValid) {
        setShapes(prev => [...prev, { ...draftShape, id: Date.now().toString() }]);
      }
      setIsDrawing(false);
      setDraftShape(null);
      setStartPoint(null);
      setTrackingLines([]);
    }
  };

  // Modify Actions (AutoCAD Command Implementations)
  const handleShapeClick = (shapeId, e) => {
    e.stopPropagation();
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;

    if (currentTool === 'delete') {
      setShapes(prev => prev.filter(s => s.id !== shapeId));
    } else if (currentTool === 'offset') {
      // Offset shape by 15px (7.5mm)
      const offsetDist = 15;
      let newShape = { ...shape, id: Date.now().toString() };
      if (shape.type === 'rect') {
        newShape.x -= offsetDist;
        newShape.y -= offsetDist;
        newShape.width += offsetDist * 2;
        newShape.height += offsetDist * 2;
      } else if (shape.type === 'circle') {
        newShape.r += offsetDist;
      } else if (shape.type === 'line') {
        newShape.y1 -= offsetDist;
        newShape.y2 -= offsetDist;
      }
      setShapes(prev => [...prev, newShape]);
      setCurrentTool('select');
    } else if (currentTool === 'mirror') {
      // Mirror across vertical Y-axis passing through ORIGIN_X
      let newShape = { ...shape, id: Date.now().toString() };
      if (shape.type === 'rect') {
        const distFromOrigin = shape.x - ORIGIN_X;
        newShape.x = ORIGIN_X - distFromOrigin - shape.width;
      } else if (shape.type === 'circle') {
        const distFromOrigin = shape.cx - ORIGIN_X;
        newShape.cx = ORIGIN_X - distFromOrigin;
      } else if (shape.type === 'line') {
        newShape.x1 = ORIGIN_X - (shape.x1 - ORIGIN_X);
        newShape.x2 = ORIGIN_X - (shape.x2 - ORIGIN_X);
      }
      setShapes(prev => [...prev, newShape]);
      setCurrentTool('select');
    } else if (currentTool === 'pattern_rect') {
      // Rectangular Array (3 columns x 2 rows)
      const copies = [];
      for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 2; row++) {
          if (col === 0 && row === 0) continue;
          const shiftX = col * 50;
          const shiftY = row * 40;
          let ns = { ...shape, id: `${Date.now()}_${col}_${row}` };
          if (shape.type === 'rect') { ns.x += shiftX; ns.y += shiftY; }
          else if (shape.type === 'circle') { ns.cx += shiftX; ns.cy += shiftY; }
          else if (shape.type === 'line') { ns.x1 += shiftX; ns.x2 += shiftX; ns.y1 += shiftY; ns.y2 += shiftY; }
          copies.push(ns);
        }
      }
      setShapes(prev => [...prev, ...copies]);
      setCurrentTool('select');
    } else if (currentTool === 'pattern_polar') {
      // Circular Polar Array (6 items around origin)
      const copies = [];
      const totalCount = 6;
      for (let i = 1; i < totalCount; i++) {
        const ang = (i * 2 * Math.PI) / totalCount;
        let ns = { ...shape, id: `${Date.now()}_pol_${i}` };
        if (shape.type === 'circle') {
          const dx = shape.cx - ORIGIN_X;
          const dy = shape.cy - ORIGIN_Y;
          ns.cx = ORIGIN_X + dx * Math.cos(ang) - dy * Math.sin(ang);
          ns.cy = ORIGIN_Y + dx * Math.sin(ang) + dy * Math.cos(ang);
          copies.push(ns);
        }
      }
      setShapes(prev => [...prev, ...copies]);
      setCurrentTool('select');
    } else if (currentTool === 'trim') {
      if (shape.type === 'line') {
        setShapes(prev => prev.map(s => {
          if (s.id === shapeId) {
            const dx = (s.x2 - s.x1) * 0.15;
            const dy = (s.y2 - s.y1) * 0.15;
            return { ...s, x1: s.x1 + dx, y1: s.y1 + dy, x2: s.x2 - dx, y2: s.y2 - dy };
          }
          return s;
        }));
      }
    }
  };

  // Render Spline Path
  const generateSplinePath = (points) => {
    if (!points || points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  // Render Polygon Points to SVG Polygon String
  const generatePolygonPoints = (pts) => {
    if (!pts) return '';
    return pts.map(p => `${p.x},${p.y}`).join(' ');
  };

  // Theme Colors
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const gridColorMajor = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const gridColorMinor = isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9';
  const sketchStroke = isDark ? '#38bdf8' : '#0284c7';
  const sketchFill = showProfile ? (isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)') : 'none';
  const draftStroke = isDark ? '#f59e0b' : '#d97706';

  // Real-time Dimension tooltip computation
  const liveInfo = useMemo(() => {
    if (!isDrawing || !draftShape) return null;
    if (draftShape.type === 'line' || draftShape.type === 'dimension') {
      const lenMm = Math.round(Math.hypot(draftShape.x2 - draftShape.x1, draftShape.y2 - draftShape.y1) * 0.5);
      const angleDeg = Math.round((Math.atan2(-(draftShape.y2 - draftShape.y1), draftShape.x2 - draftShape.x1) * 180) / Math.PI);
      return `L: ${lenMm} mm | ∠: ${angleDeg}°`;
    }
    if (draftShape.type === 'rect') {
      const wMm = Math.round(draftShape.width * 0.5);
      const hMm = Math.round(draftShape.height * 0.5);
      return `${wMm} × ${hMm} mm`;
    }
    if (draftShape.type === 'circle') {
      const rMm = Math.round(draftShape.r * 0.5);
      return `R: ${rMm} mm | Ø: ${rMm * 2} mm`;
    }
    if (draftShape.type === 'polygon') {
      const rMm = Math.round(draftShape.r * 0.5);
      return `Segi-${draftShape.sides || 6} | R: ${rMm} mm`;
    }
    return null;
  }, [isDrawing, draftShape]);

  return (
    <div style={{ width: '100%', height: '100%', background: bgColor, position: 'relative', overflow: 'hidden', userSelect: 'none' }}>
      
      {/* TECHNICAL GRID (AutoCAD / Fusion 360 Style) */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <defs>
          <pattern id="cadGridMinor" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke={gridColorMinor} strokeWidth="0.8" />
          </pattern>
          <pattern id="cadGridMajor" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
            <rect width={gridSize * 5} height={gridSize * 5} fill="url(#cadGridMinor)" />
            <path d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`} fill="none" stroke={gridColorMajor} strokeWidth="1.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cadGridMajor)" />

        {/* CARTESIAN ORIGIN AXES (Red X, Green Y) */}
        <line x1={ORIGIN_X} y1="0" x2={ORIGIN_X} y2="1000" stroke="#10b981" strokeWidth="1.8" strokeDasharray="6 3" />
        <line x1="0" y1={ORIGIN_Y} x2="1600" y2={ORIGIN_Y} stroke="#ef4444" strokeWidth="1.8" strokeDasharray="6 3" />
        
        {/* Origin Circle & Label */}
        <circle cx={ORIGIN_X} cy={ORIGIN_Y} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
        <text x={ORIGIN_X + 8} y={ORIGIN_Y - 8} fill={isDark ? '#94a3b8' : '#475569'} fontSize="11" fontWeight="bold">
          (0, 0) ORIGIN
        </text>
      </svg>

      {/* MAIN INTERACTIVE SVG DRAWING CANVAS */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          cursor: ['delete', 'mirror', 'pattern_rect', 'pattern_polar', 'trim', 'fillet', 'offset'].includes(currentTool)
            ? 'crosshair'
            : currentTool === 'select'
            ? 'default'
            : 'crosshair',
          position: 'relative',
          zIndex: 10
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* DYNAMIC POLAR / ORTHO ALIGNMENT TRACKING LINES */}
        {trackingLines.map((line, i) => (
          <line
            key={i}
            x1={line.type === 'v' ? line.x : 0}
            y1={line.type === 'h' ? line.y : 0}
            x2={line.type === 'v' ? line.x : '100%'}
            y2={line.type === 'h' ? line.y : '100%'}
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.6"
          />
        ))}

        {/* SAVED CAD SHAPES */}
        {shapes.map(shape => (
          <g
            key={shape.id}
            onPointerDown={(e) => handleShapeClick(shape.id, e)}
            style={{
              cursor: ['delete', 'mirror', 'pattern_rect', 'pattern_polar', 'trim', 'fillet', 'offset'].includes(currentTool)
                ? 'pointer'
                : 'default'
            }}
          >
            {shape.type === 'line' && (
              <line
                x1={shape.x1}
                y1={shape.y1}
                x2={shape.x2}
                y2={shape.y2}
                stroke={sketchStroke}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {shape.type === 'rect' && (
              <rect
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                stroke={sketchStroke}
                strokeWidth="2.5"
                fill={sketchFill}
              />
            )}

            {shape.type === 'circle' && (
              <circle
                cx={shape.cx}
                cy={shape.cy}
                r={shape.r}
                stroke={sketchStroke}
                strokeWidth="2.5"
                fill={sketchFill}
              />
            )}

            {shape.type === 'polygon' && (
              <polygon
                points={generatePolygonPoints(shape.points)}
                stroke={sketchStroke}
                strokeWidth="2.5"
                fill={sketchFill}
                strokeLinejoin="round"
              />
            )}

            {shape.type === 'arc' && (
              <path
                d={`M ${shape.x1} ${shape.y1} Q ${shape.mx} ${shape.my} ${shape.x2} ${shape.y2}`}
                stroke={sketchStroke}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            )}

            {shape.type === 'spline' && (
              <path
                d={generateSplinePath(shape.points)}
                stroke={sketchStroke}
                strokeWidth="2.5"
                fill={sketchFill}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {shape.type === 'dimension' && showDimensions && (
              <g>
                <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke="#f59e0b" strokeWidth="1.5" />
                {/* Arrowheads */}
                <polygon
                  points={`${shape.x1},${shape.y1} ${shape.x1 + 6},${shape.y1 + 3} ${shape.x1 + 6},${shape.y1 - 3}`}
                  fill="#f59e0b"
                  transform={`rotate(${(Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1) * 180) / Math.PI}, ${shape.x1}, ${shape.y1})`}
                />
                <polygon
                  points={`${shape.x2},${shape.y2} ${shape.x2 - 6},${shape.y2 + 3} ${shape.x2 - 6},${shape.y2 - 3}`}
                  fill="#f59e0b"
                  transform={`rotate(${(Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1) * 180) / Math.PI}, ${shape.x2}, ${shape.y2})`}
                />
                {/* ISO Dimension Label Badge */}
                <rect
                  x={(shape.x1 + shape.x2) / 2 - 24}
                  y={(shape.y1 + shape.y2) / 2 - 10}
                  width="48"
                  height="20"
                  fill={isDark ? '#0f172a' : '#ffffff'}
                  stroke="#f59e0b"
                  strokeWidth="1"
                  rx="3"
                />
                <text
                  x={(shape.x1 + shape.x2) / 2}
                  y={(shape.y1 + shape.y2) / 2 + 1}
                  fill={isDark ? '#f8fafc' : '#0f172a'}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {Math.round(Math.hypot(shape.x2 - shape.x1, shape.y2 - shape.y1) * 0.5)} mm
                </text>
              </g>
            )}
          </g>
        ))}

        {/* REAL-TIME DRAFT SHAPE PREVIEW WHILE DRAWING */}
        {draftShape && (
          <g style={{ opacity: 0.9, pointerEvents: 'none' }}>
            {draftShape.type === 'line' && (
              <line
                x1={draftShape.x1}
                y1={draftShape.y1}
                x2={draftShape.x2}
                y2={draftShape.y2}
                stroke={draftStroke}
                strokeWidth="2"
                strokeDasharray="5 3"
              />
            )}
            {draftShape.type === 'rect' && (
              <rect
                x={draftShape.x}
                y={draftShape.y}
                width={draftShape.width}
                height={draftShape.height}
                stroke={draftStroke}
                strokeWidth="2"
                fill="none"
                strokeDasharray="5 3"
              />
            )}
            {draftShape.type === 'circle' && (
              <circle
                cx={draftShape.cx}
                cy={draftShape.cy}
                r={draftShape.r}
                stroke={draftStroke}
                strokeWidth="2"
                fill="none"
                strokeDasharray="5 3"
              />
            )}
            {draftShape.type === 'polygon' && (
              <polygon
                points={generatePolygonPoints(draftShape.points)}
                stroke={draftStroke}
                strokeWidth="2"
                fill="none"
                strokeDasharray="5 3"
              />
            )}
            {draftShape.type === 'spline' && (
              <path
                d={generateSplinePath(draftShape.points)}
                stroke={draftStroke}
                strokeWidth="2"
                fill="none"
                strokeDasharray="5 3"
              />
            )}
            {draftShape.type === 'dimension' && (
              <line
                x1={draftShape.x1}
                y1={draftShape.y1}
                x2={draftShape.x2}
                y2={draftShape.y2}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            )}
          </g>
        )}

        {/* OSNAP VISUAL MARKERS (AutoCAD Style Green Endpoint / Yellow Midpoint) */}
        {activeSnap && (
          <g transform={`translate(${activeSnap.x}, ${activeSnap.y})`} style={{ pointerEvents: 'none' }}>
            {activeSnap.type === 'endpoint' && (
              <rect x="-5" y="-5" width="10" height="10" fill="none" stroke="#22c55e" strokeWidth="2" />
            )}
            {activeSnap.type === 'midpoint' && (
              <polygon points="0,-6 6,5 -6,5" fill="none" stroke="#38bdf8" strokeWidth="2" />
            )}
            {activeSnap.type === 'center' && (
              <circle cx="0" cy="0" r="6" fill="none" stroke="#f59e0b" strokeWidth="2" />
            )}
            {activeSnap.type === 'quadrant' && (
              <polygon points="0,-5 5,0 0,5 -5,0" fill="none" stroke="#ec4899" strokeWidth="2" />
            )}
            {activeSnap.type === 'grid' && (
              <circle cx="0" cy="0" r="3" fill="#38bdf8" />
            )}
            {activeSnap.type === 'origin' && (
              <circle cx="0" cy="0" r="5" fill="none" stroke="#ef4444" strokeWidth="2" />
            )}
          </g>
        )}
      </svg>

      {/* FLOATING HUD DYNAMIC INPUT TOOLTIP (Length & Angle) */}
      {liveInfo && (
        <div
          style={{
            position: 'absolute',
            left: `${Math.min(window.innerWidth - 180, (draftShape?.x2 || draftShape?.x || 0) + 15)}px`,
            top: `${Math.min(window.innerHeight - 80, (draftShape?.y2 || draftShape?.y || 0) + 15)}px`,
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid #38bdf8',
            color: '#38bdf8',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            fontWeight: 800,
            pointerEvents: 'none',
            zIndex: 50,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(6px)'
          }}
        >
          {liveInfo}
        </div>
      )}

      {/* AUTOCAD-STYLE STATUS BAR (BOTTOM) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '32px',
          background: isDark ? '#090d16' : '#e2e8f0',
          borderTop: isDark ? '1px solid #1e293b' : '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          zIndex: 40,
          fontSize: '0.75rem',
          color: isDark ? '#94a3b8' : '#475569'
        }}
      >
        {/* Live Coordinate Display */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontFamily: 'monospace', fontWeight: 700 }}>
          <span>
            X: <strong style={{ color: '#ef4444' }}>{cursorCoord.x} mm</strong>
          </span>
          <span>
            Y: <strong style={{ color: '#10b981' }}>{cursorCoord.y} mm</strong>
          </span>
          <span style={{ color: isDark ? '#475569' : '#94a3b8' }}>|</span>
          <span>ALAT: <strong style={{ color: '#38bdf8' }}>{currentTool.toUpperCase()}</strong></span>
        </div>

        {/* Drafting Assist Toggles (AutoCAD F-Keys) */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => setOrthoMode && setOrthoMode(!orthoMode)}
            title="Kunci arah ortogonal 90 derajat (F8)"
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontWeight: 800,
              background: orthoMode ? '#2563eb' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              color: orthoMode ? '#ffffff' : 'inherit',
              transition: 'all 0.15s'
            }}
          >
            ORTHO [F8]: {orthoMode ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setOsnapEnabled && setOsnapEnabled(!osnapEnabled)}
            title="Snap otomatis ke Endpoint, Midpoint, Center (F3)"
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontWeight: 800,
              background: osnapEnabled ? '#10b981' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              color: osnapEnabled ? '#ffffff' : 'inherit',
              transition: 'all 0.15s'
            }}
          >
            OSNAP [F3]: {osnapEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setSnapGrid && setSnapGrid(!snapGrid)}
            title="Kunci kursor ke grid milimeter (F9)"
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontWeight: 800,
              background: snapGrid ? '#8b5cf6' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              color: snapGrid ? '#ffffff' : 'inherit',
              transition: 'all 0.15s'
            }}
          >
            GRID SNAP [F9]: {snapGrid ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CAD2D_Engine;

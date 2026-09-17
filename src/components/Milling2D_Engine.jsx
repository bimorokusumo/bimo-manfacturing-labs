import React, { useMemo } from 'react';

const Milling2D = ({
  isRunning = false,
  tablePosition = { x: 0, y: 0 },
  spindlePosition = { z: 5 },
  heightmap = [],
  workpieceSize = { w: 100, l: 50 },
  toolDiameter = 10,
  rpm = 0,
  gridX = 60,
  gridY = 30
}) => {
  // SVG Canvas Settings
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 400;
  const CENTER_X = 400;
  const CENTER_Y = 200;

  // Scale: 3.2 pixels per millimeter
  const PIXELS_PER_MM = 3.2;
  const wPx = (workpieceSize.w || 100) * PIXELS_PER_MM; // e.g. 100mm = 320px
  const lPx = (workpieceSize.l || 50) * PIXELS_PER_MM; // e.g. 50mm = 160px

  const rectWidth = wPx / gridX;
  const rectHeight = lPx / gridY;

  // Workpiece position in SVG (tablePosition in mm)
  // When table moves X+, workpiece moves right (+X)
  // When table moves Y+, workpiece moves forward (+Y)
  const svgWorkpieceX = CENTER_X + ((tablePosition.x || 0) - workpieceSize.w / 2) * PIXELS_PER_MM;
  const svgWorkpieceY = CENTER_Y + ((tablePosition.y || 0) - workpieceSize.l / 2) * PIXELS_PER_MM;

  // Render heightmap as a smooth grid of cut cells
  const rects = useMemo(() => {
    if (!heightmap || heightmap.length === 0) return null;
    const elements = [];

    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const vertexIndex = iy * (gridX + 1) + ix;
        const depth = heightmap[vertexIndex] || 0; // Negative means cut depth in 3D scale

        // Base raw material color: #94a3b8
        // Cut groove color: gradient from dark metallic #334155 down to bright milling sheen #0284c7
        let color = '#94a3b8';
        if (depth < -0.001) {
          const depthMm = Math.min(5, Math.abs(depth)); // stored directly in mm
          const intensity = Math.min(1, depthMm / 3.0);
          // Darker and more saturated blue-gray as cut gets deeper
          const r = Math.round(148 - intensity * 120);
          const g = Math.round(163 - intensity * 110);
          const b = Math.round(184 - intensity * 90);
          color = `rgb(${r},${g},${b})`;
        }

        elements.push(
          <rect
            key={`${ix}-${iy}`}
            x={svgWorkpieceX + ix * rectWidth}
            y={svgWorkpieceY + iy * rectHeight}
            width={rectWidth + 0.4}
            height={rectHeight + 0.4}
            fill={color}
            stroke="none"
          />
        );
      }
    }
    return elements;
  }, [heightmap, svgWorkpieceX, svgWorkpieceY, rectWidth, rectHeight, gridX, gridY]);

  // Spindle/Tool (Endmill) is fixed at Center (CENTER_X, CENTER_Y)
  const toolRadius = ((toolDiameter || 10) / 2) * PIXELS_PER_MM;

  const isContacting = spindlePosition.z <= 0.05;
  const isPenetrating = spindlePosition.z < -0.01;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#f8fafc' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* LIGHT TECHNICAL GRAPH GRID */}
        <defs>
          <pattern id="millingGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#millingGrid)" />

        {/* MACHINE TABLE T-SLOTS GUIDES */}
        <g stroke="#cbd5e1" strokeWidth="3">
          <line x1="0" y1="60" x2="800" y2="60" />
          <line x1="0" y1="130" x2="800" y2="130" />
          <line x1="0" y1="200" x2="800" y2="200" stroke="#94a3b8" strokeDasharray="6 6" />
          <line x1="0" y1="270" x2="800" y2="270" />
          <line x1="0" y1="340" x2="800" y2="340" />
        </g>

        {/* WORKPIECE (Base outline + Cut Cells) */}
        <g style={{ transition: isRunning ? 'none' : 'all 0.05s linear' }}>
          {/* Workpiece Outer Border / Shadow */}
          <rect
            x={svgWorkpieceX - 3}
            y={svgWorkpieceY - 3}
            width={wPx + 6}
            height={lPx + 6}
            fill="#334155"
            rx="3"
          />

          {/* Rendered Deformed Cut Surface Cells */}
          {rects}

          {/* Workpiece Clean Border */}
          <rect
            x={svgWorkpieceX}
            y={svgWorkpieceY}
            width={wPx}
            height={lPx}
            fill="none"
            stroke="rgba(15, 23, 42, 0.4)"
            strokeWidth="1.5"
          />
        </g>

        {/* ENDMILL (Spindle) - Fixed at Center (400, 200) */}
        <g transform={`translate(${CENTER_X}, ${CENTER_Y})`}>
          {/* Outer Toolholder Ring */}
          <circle cx="0" cy="0" r={toolRadius + 18} fill="none" stroke="#0284c7" strokeWidth="1.5" opacity="0.5" />
          <circle cx="0" cy="0" r={toolRadius + 6} fill="rgba(15, 23, 42, 0.85)" stroke="#0f172a" strokeWidth="2.5" />

          {/* Endmill Cutter Flutes */}
          <g style={{ transformOrigin: '0 0', animation: isRunning ? 'spin 0.15s linear infinite' : 'none' }}>
            <circle
              cx="0"
              cy="0"
              r={toolRadius}
              fill={isPenetrating && isRunning ? "#f59e0b" : "#38bdf8"}
              opacity={0.85}
            />
            <line x1={-toolRadius} y1="0" x2={toolRadius} y2="0" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="0" y1={-toolRadius} x2="0" y2={toolRadius} stroke="#ffffff" strokeWidth="2.5" />
          </g>

          <circle cx="0" cy="0" r="3" fill="#ffffff" />

          {/* Tool Label */}
          <text x={toolRadius + 10} y="4" fill="#0f172a" fontSize="12" fontWeight="bold">
            ENDMILL Ø{toolDiameter}mm
          </text>
        </g>

        {/* CROSSHAIRS */}
        <line x1={CENTER_X - 80} y1={CENTER_Y} x2={CENTER_X + 80} y2={CENTER_Y} stroke="#0284c7" strokeWidth="1.2" strokeDasharray="4 4" />
        <line x1={CENTER_X} y1={CENTER_Y - 80} x2={CENTER_X} y2={CENTER_Y + 80} stroke="#0284c7" strokeWidth="1.2" strokeDasharray="4 4" />
      </svg>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* HUD OVERLAY */}
      <div style={{ position: 'absolute', bottom: '16px', left: '16px', pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ color: isRunning ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: 800 }}>
          {isRunning ? `SPINDLE: ${rpm} RPM [BERPUTAR]` : `SPINDLE: STOPPED`}
        </div>
        <div style={{ color: '#0f172a', fontSize: '0.8rem', marginTop: '4px', fontWeight: 700 }}>
          MEJA: X[{tablePosition.x.toFixed(2)} mm] Y[{tablePosition.y.toFixed(2)} mm] | SPINDEL: Z[{spindlePosition.z.toFixed(2)} mm]
        </div>
        <div style={{ color: isPenetrating ? '#f59e0b' : isContacting ? '#10b981' : '#64748b', fontSize: '0.75rem', marginTop: '2px', fontWeight: 700 }}>
          {isPenetrating
            ? `⚡ KONDISI: MENYAYAT MATERIAL (${Math.abs(spindlePosition.z).toFixed(2)} mm)`
            : isContacting
            ? '✓ KONDISI: MENYENTUH TITIK NOL (Z=0.00 mm)'
            : '▲ KONDISI: DI UDARA / AMAN'}
        </div>
      </div>
    </div>
  );
};

export default Milling2D;

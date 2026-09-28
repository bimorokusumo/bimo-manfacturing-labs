import React, { useState, useMemo, Suspense } from 'react';
import Lathe3D_Engine from './Lathe3D_Engine';

const Lathe2D = ({
  isRunning = false,
  toolPosition = { z: 0, d: 50 },
  profile = null,
  rawDiameter = 50,
  rawLength = 100,
  toolType = 'rata', // 'rata', 'alur', 'facing'
  toolOrientation = 'vertical', // 'vertical' (sesuai permintaan user)
  machineMode = 'rata',
  rpm = 1200,
  isCutting = false
}) => {
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 400;
  const CENTER_Y = 200;

  const toolZ = toolPosition && toolPosition.z !== undefined ? toolPosition.z : 0;
  const toolD = toolPosition && toolPosition.d !== undefined ? (toolPosition.d ?? toolPosition.x) : rawDiameter;

  const workpieceWidthPx = (rawLength / 100) * 400;
  const chuckFaceX = 600 - workpieceWidthPx;
  const chuckBodyX = Math.max(20, chuckFaceX - 130);

  // Convert profile array to SVG polygon points
  const workpiecePoints = useMemo(() => {
    if (!profile || profile.length !== 30) return '';

    const topPoints = [];
    const bottomPoints = [];

    // index 0 is right/tailstock (X=600), index 29 is left/chuck (X=chuckFaceX)
    for (let i = 0; i < profile.length; i++) {
      const x = 600 - (i / 29) * workpieceWidthPx;
      const diaMm = profile[i] !== undefined ? profile[i] : rawDiameter;
      const radiusPx = (diaMm / 2) * (175 / 50); // 25mm => 87.5px

      topPoints.push(`${x},${CENTER_Y - radiusPx}`);
      bottomPoints.push(`${x},${CENTER_Y + radiusPx}`);
    }

    bottomPoints.reverse();
    return [...topPoints, ...bottomPoints].join(' ');
  }, [profile, rawDiameter, rawLength, workpieceWidthPx]);

  // Exact Tool Tip Position in 2D
  const toolTipX = 600 + (toolZ / rawLength) * workpieceWidthPx;
  const toolTipY = 200 + (toolD / 2) * (175 / 50);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#f8fafc' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* LIGHT TECHNICAL GRAPH GRID */}
        <defs>
          <pattern id="latheGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#latheGrid)" />

        {/* BEDWAYS & RACK */}
        <rect x="50" y="340" width="700" height="35" fill="#475569" stroke="#334155" strokeWidth="2" />
        <line x1="50" y1="355" x2="750" y2="355" stroke="#94a3b8" strokeWidth="4" strokeDasharray="8 4" />

        {/* CHUCK (Kepala Tetap - Dinamis Mengikuti Panjang Benda Kerja) */}
        <rect x={chuckBodyX} y="80" width={chuckFaceX - chuckBodyX} height="240" fill="#0284c7" stroke="#0369a1" strokeWidth="3" rx="8" />
        <rect x={chuckFaceX - 12} y="105" width="16" height="40" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
        <rect x={chuckFaceX - 12} y="255" width="16" height="40" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />

        {/* WORKPIECE */}
        {workpiecePoints && (
          <polygon
            points={workpiecePoints}
            fill="#94a3b8"
            stroke="#334155"
            strokeWidth="2"
            style={{ transition: isRunning ? 'none' : 'all 0.05s linear' }}
          />
        )}

        {/* TAILSTOCK (Kepala Lepas) */}
        <rect x="620" y="110" width="120" height="180" fill="#1e293b" stroke="#0284c7" strokeWidth="2" rx="6" />
        <rect x="580" y="180" width="45" height="40" fill="#cbd5e1" />
        <polygon points="580,180 550,200 580,220" fill="#e2e8f0" />

        {/* CUTTING TOOL - POSISI VERTIKAL SESUAI PERMINTAAN USER */}
        <g transform={`translate(${toolTipX}, ${toolTipY})`} style={{ transition: isRunning ? 'none' : 'all 0.05s linear' }}>
          {toolOrientation === 'vertical' ? (
            /* VERTICAL TOOL HOLDER & TURRET CLAMP */
            <g>
              {/* Vertical Tool Shank (Menjulur ke Bawah Vertikal) */}
              <rect x="-11" y="8" width="22" height="95" rx="3" fill="#18181b" stroke="#38bdf8" strokeWidth="1.5" />
              
              {/* Tool Clamping Block */}
              <rect x="-16" y="55" width="32" height="50" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
              <circle cx="-6" cy="70" r="3" fill="#cbd5e1" />
              <circle cx="6" cy="70" r="3" fill="#cbd5e1" />
              <circle cx="0" cy="90" r="3" fill="#cbd5e1" />

              {/* Vertical Orientation Indicator */}
              <rect x="-24" y="112" width="48" height="16" rx="4" fill="rgba(15,23,42,0.9)" stroke="#38bdf8" strokeWidth="0.8" />
              <text x="0" y="124" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">VERTIKAL</text>

              {/* CUTTING INSERT AT TIP (0, 0) SESUAI TOOL TYPE */}
              {toolType === 'rata' && (
                /* 1. Pahat Rata Kanan (Rhombic 80° Insert) */
                <g>
                  <polygon
                    points="0,0 16,8 14,24 -4,18"
                    fill={isCutting ? "#f59e0b" : "#eab308"}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  <circle cx="6" cy="12" r="2.5" fill="#713f12" />
                  <text x="18" y="24" fill="#38bdf8" fontSize="9" fontWeight="800">T01 RATA</text>
                </g>
              )}

              {toolType === 'alur' && (
                /* 2. Pahat Alur (Flat Grooving Blade Insert 3mm) */
                <g>
                  <rect
                    x="-5"
                    y="0"
                    width="10"
                    height="20"
                    fill={isCutting ? "#f59e0b" : "#fbbf24"}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    rx="1"
                  />
                  <line x1="-5" y1="0" x2="5" y2="0" stroke="#f59e0b" strokeWidth="2.5" />
                  <circle cx="0" cy="10" r="2.5" fill="#713f12" />
                  <text x="14" y="24" fill="#f59e0b" fontSize="9" fontWeight="800">T02 ALUR 3mm</text>
                </g>
              )}

              {toolType === 'facing' && (
                /* 3. Pahat Facing (Wedge Facing Insert Angled to Face) */
                <g>
                  <polygon
                    points="0,0 20,4 12,22 -3,17"
                    fill={isCutting ? "#f59e0b" : "#eab308"}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  <circle cx="8" cy="10" r="2.5" fill="#713f12" />
                  <text x="18" y="24" fill="#10b981" fontSize="9" fontWeight="800">T03 FACING</text>
                </g>
              )}
            </g>
          ) : (
            /* Horizontal fallback */
            <g>
              <rect x="12" y="8" width="80" height="24" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
              <polygon
                points="0,0 24,10 24,28 8,28"
                fill={isCutting ? "#f59e0b" : "#eab308"}
                stroke="#fff"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Sparks when cutting */}
          {isCutting && (
            <g>
              <circle cx="-4" cy="-4" r="4" fill="#fbbf24" opacity="0.9" />
              <circle cx="-10" cy="-2" r="2.5" fill="#f97316" opacity="0.8" />
              <circle cx="-6" cy="-10" r="2" fill="#ef4444" opacity="0.7" />
              <circle cx="2" cy="-6" r="3" fill="#fbbf24" opacity="0.8" />
            </g>
          )}
        </g>

        {/* CENTERLINE */}
        <line x1={chuckFaceX} y1="200" x2="620" y2="200" stroke="rgba(56, 189, 248, 0.4)" strokeDasharray="12 6" strokeWidth="1" />

        {/* DIMENSION SCALES */}
        <g stroke="rgba(255,255,255,0.2)" strokeWidth="1">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={200 + i * 50} y1="365" x2={200 + i * 50} y2="375" />
          ))}
        </g>
      </svg>
    </div>
  );
};

const Lathe3D = ({
  isRunning = false,
  toolPosition = { z: 0, d: 50 },
  profile = null,
  rawDiameter = 50,
  rawLength = 100,
  toolType = 'rata',
  toolOrientation = 'vertical',
  machineMode = 'rata',
  rpm = 1200,
  isCutting = false,
  coolant = false
}) => {
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {viewMode === '3d' ? (
        <Suspense
          fallback={
            <div className="flex-center" style={{ height: '100%', background: '#eef2f6', color: '#0284c7', fontWeight: 'bold' }}>
              MEMUAT 3D LATHE SIMULATOR ENGINE...
            </div>
          }
        >
          <Lathe3D_Engine
            isRunning={isRunning}
            toolPosition={toolPosition}
            profile={profile}
            rawDiameter={rawDiameter}
            rawLength={rawLength}
            toolType={toolType}
            toolOrientation={toolOrientation}
            rpm={rpm}
            isCutting={isCutting}
            coolant={coolant}
          />
        </Suspense>
      ) : (
        <Lathe2D
          isRunning={isRunning}
          toolPosition={toolPosition}
          profile={profile}
          rawDiameter={rawDiameter}
          rawLength={rawLength}
          toolType={toolType}
          toolOrientation={toolOrientation}
          machineMode={machineMode}
          rpm={rpm}
          isCutting={isCutting}
        />
      )}

      {/* VIEW TOGGLE BUTTON */}
      <div style={{ position: 'absolute', top: '14px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
        <button
          onClick={() => setViewMode(v => (v === '3d' ? '2d' : '3d'))}
          style={{
            padding: '6px 14px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          {viewMode === '3d' ? '📐 TAMPILAN 2D TEKNIK' : '🎮 TAMPILAN 3D STUDIO'}
        </button>
      </div>

      {/* MINIMAL STATUS HUD (Top Right, non-blocking) */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          right: '16px',
          display: 'flex',
          gap: '10px',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: `1px solid ${isRunning ? '#10b981' : '#ef4444'}`,
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: isRunning ? '#10b981' : '#ef4444',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRunning ? '#10b981' : '#ef4444' }} />
          {isRunning ? `SPINDEL RUNNING (${rpm} RPM)` : 'SPINDEL STOP'}
        </div>

        {isCutting && (
          <div
            className="animate-pulse"
            style={{
              background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid #f59e0b',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#f59e0b',
              backdropFilter: 'blur(8px)'
            }}
          >
            ⚡ PENYAYATAN AKTIF
          </div>
        )}
      </div>
    </div>
  );
};

export default Lathe3D;

import React, { useState, useMemo, Suspense } from 'react';
import Lathe3D_Engine from './Lathe3D_Engine';

const Lathe2D = ({
  isRunning = false,
  toolPosition = { z: 0, d: 50 },
  profile = null,
  machineMode = 'rata',
  rpm = 1200,
  isCutting = false
}) => {
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 400;
  const CENTER_Y = 200;

  const toolZ = toolPosition && toolPosition.z !== undefined ? toolPosition.z : 0;
  const toolD = toolPosition && toolPosition.d !== undefined ? toolPosition.d : 50;

  // Convert profile array to SVG polygon points
  const workpiecePoints = useMemo(() => {
    if (!profile || profile.length !== 30) return '';

    const topPoints = [];
    const bottomPoints = [];

    // index 0 is right/tailstock (X=600), index 29 is left/chuck (X=200)
    for (let i = 0; i < profile.length; i++) {
      const x = 600 - (i / 29) * 400;
      const diaMm = profile[i] !== undefined ? profile[i] : 50;
      const radiusPx = (diaMm / 2) * 3.5; // 25mm => 87.5px

      topPoints.push(`${x},${CENTER_Y - radiusPx}`);
      bottomPoints.push(`${x},${CENTER_Y + radiusPx}`);
    }

    bottomPoints.reverse();
    return [...topPoints, ...bottomPoints].join(' ');
  }, [profile]);

  // Exact Tool Tip Position in 2D
  const toolTipX = 600 + (toolZ / 100) * 400;
  const toolTipY = 200 + (toolD / 2) * 3.5;

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

        {/* CHUCK (Kepala Tetap) */}
        <rect x="50" y="80" width="150" height="240" fill="#0284c7" stroke="#0369a1" strokeWidth="3" rx="8" />
        <rect x="180" y="105" width="22" height="40" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
        <rect x="180" y="255" width="22" height="40" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />

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

        {/* CUTTING TOOL - Tip is placed exactly at (toolTipX, toolTipY) */}
        <g transform={`translate(${toolTipX}, ${toolTipY})`} style={{ transition: isRunning ? 'none' : 'all 0.05s linear' }}>
          {/* Tool Shank extending to the right and bottom */}
          <rect x="12" y="8" width="80" height="24" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
          {/* Gold Carbide Insert with sharp tip at (0,0) */}
          <polygon
            points="0,0 24,10 24,28 8,28"
            fill={isCutting ? "#f59e0b" : "#eab308"}
            stroke="#fff"
            strokeWidth="1.5"
          />
          {/* Sparks when cutting */}
          {isCutting && (
            <g>
              <circle cx="-4" cy="-4" r="4" fill="#fbbf24" opacity="0.9" />
              <circle cx="-10" cy="-2" r="2.5" fill="#f97316" opacity="0.8" />
              <circle cx="-6" cy="-10" r="2" fill="#ef4444" opacity="0.7" />
            </g>
          )}
        </g>

        {/* CENTERLINE */}
        <line x1="180" y1="200" x2="620" y2="200" stroke="rgba(56, 189, 248, 0.4)" strokeDasharray="12 6" strokeWidth="1" />

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

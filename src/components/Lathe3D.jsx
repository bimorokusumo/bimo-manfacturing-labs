import React, { useState, useMemo, Suspense } from 'react';
import Lathe3D_Engine from './Lathe3D_Engine';
import {
  generateSteppedProfilePoints2D,
  parseGcodeToolpath,
  extractToolpathWaypoints
} from '../utils/latheToolpath';

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
  isCutting = false,
  showTailstock = false,
  gcodeText = '',
  currentLine = -1,
  showToolpath = true
}) => {
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 400;
  const CENTER_Y = 200;

  const toolZ = toolPosition && toolPosition.z !== undefined ? toolPosition.z : 0;
  const toolD = toolPosition && toolPosition.d !== undefined ? (toolPosition.d ?? toolPosition.x) : rawDiameter;

  const workpieceWidthPx = (rawLength / 100) * 400;
  const chuckFaceX = 600 - workpieceWidthPx;
  const chuckBodyX = Math.max(20, chuckFaceX - 130);

  // Convert profile array to stepped SVG polygon points (EXACT 90-DEGREE STEPS, NO TAPER)
  const workpiecePoints = useMemo(() => {
    return generateSteppedProfilePoints2D(profile, rawDiameter, rawLength, workpieceWidthPx, CENTER_Y);
  }, [profile, rawDiameter, rawLength, workpieceWidthPx]);

  // Parse G-Code toolpath trajectory (G00 Rapid & G01/G92 Cutting)
  const toolpathSegments = useMemo(() => {
    return parseGcodeToolpath(gcodeText, rawDiameter, rawLength);
  }, [gcodeText, rawDiameter, rawLength]);

  // Extract unique waypoints for coordinate markers
  const waypoints = useMemo(() => {
    return extractToolpathWaypoints(toolpathSegments);
  }, [toolpathSegments]);

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
        {/* LIGHT TECHNICAL GRAPH GRID & TOOLPATH MARKERS */}
        <defs>
          <pattern id="latheGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
          </pattern>
          {/* Arrow markers for Rapid (G00) - Yellow */}
          <marker id="arrowRapid" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#facc15" />
          </marker>
          {/* Arrow markers for Cut (G01) - Cyan */}
          <marker id="arrowCut" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06b6d4" />
          </marker>
          {/* Active Highlight Arrow - Bright Green */}
          <marker id="arrowActive" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#latheGrid)" />

        {/* BEDWAYS & RACK */}
        <rect x="50" y="340" width="700" height="35" fill="#475569" stroke="#334155" strokeWidth="2" />
        <line x1="50" y1="355" x2="750" y2="355" stroke="#94a3b8" strokeWidth="4" strokeDasharray="8 4" />

        {/* CHUCK (Kepala Tetap - Dinamis Mengikuti Panjang Benda Kerja) */}
        <rect x={chuckBodyX} y="80" width={chuckFaceX - chuckBodyX} height="240" fill="#0284c7" stroke="#0369a1" strokeWidth="3" rx="8" />
        <rect x={chuckFaceX - 12} y="105" width="16" height="40" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
        <rect x={chuckFaceX - 12} y="255" width="16" height="40" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />

        {/* WORKPIECE (SUDUT 90 DERAJAT BERSIH TANPA TIRUS) */}
        {workpiecePoints && (
          <polygon
            points={workpiecePoints}
            fill="#94a3b8"
            stroke="#334155"
            strokeWidth="2"
            style={{ transition: isRunning ? 'none' : 'all 0.05s linear' }}
          />
        )}

        {/* ========================================================================= */}
        {/* PREVIEW ALUR GERAKAN PAHAT (TOOLPATH TRAJECTORY DARI PROGRAM G-CODE)      */}
        {/* ========================================================================= */}
        {showToolpath && toolpathSegments.length > 0 && (
          <g className="toolpath-layer">
            {/* 1. Trajectory lines (G00 Rapid & G01/G92 Cut) */}
            {toolpathSegments.map((seg, idx) => {
              const x1 = 600 + (seg.from.z / rawLength) * workpieceWidthPx;
              const y1 = CENTER_Y + (seg.from.x / 2) * (175 / 50);
              const x2 = 600 + (seg.to.z / rawLength) * workpieceWidthPx;
              const y2 = CENTER_Y + (seg.to.x / 2) * (175 / 50);

              const isCurrentActive = isRunning && currentLine === seg.lineIndex;
              const isCut = seg.type === 'cut';

              return (
                <g key={`tp-${idx}`}>
                  {/* Subtle contrast halo */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isCurrentActive ? '#22c55e' : (isCut ? 'rgba(6, 182, 212, 0.4)' : 'rgba(250, 204, 21, 0.35)')}
                    strokeWidth={isCurrentActive ? 6 : (isCut ? 4 : 3)}
                    strokeLinecap="round"
                  />
                  {/* Foreground line with direction arrows */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isCurrentActive ? '#ffffff' : (isCut ? '#06b6d4' : '#eab308')}
                    strokeWidth={isCurrentActive ? 3.5 : (isCut ? 2.5 : 1.8)}
                    strokeDasharray={isCut ? 'none' : '6 4'}
                    strokeLinecap="round"
                    markerEnd={isCurrentActive ? 'url(#arrowActive)' : (isCut ? 'url(#arrowCut)' : 'url(#arrowRapid)')}
                  />
                </g>
              );
            })}

            {/* 2. Waypoints (Titik-titik Koordinat Balik/Tujuan Pahat) */}
            {waypoints.map((wp, wIdx) => {
              const wx = 600 + (wp.z / rawLength) * workpieceWidthPx;
              const wy = CENTER_Y + (wp.x / 2) * (175 / 50);
              const isKeyPoint = (wIdx === 0 || wIdx === waypoints.length - 1 || wp.x < rawDiameter);
              return (
                <g key={`wp-${wIdx}`}>
                  <circle cx={wx} cy={wy} r={3} fill="#0f172a" stroke="#38bdf8" strokeWidth={1.5} />
                  <circle cx={wx} cy={wy} r={1.2} fill="#ffffff" />
                  {isKeyPoint && (
                    <g transform={`translate(${wx + 6}, ${wy + 13})`}>
                      <rect x="-3" y="-9" width="56" height="13" rx="3" fill="rgba(15, 23, 42, 0.90)" stroke="#0284c7" strokeWidth="0.8" />
                      <text x="2" y="1" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">
                        X{wp.x.toFixed(0)} Z{wp.z.toFixed(0)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* TAILSTOCK (Kepala Lepas - Disembunyikan pada Mode CNC Sesuai Permintaan) */}
        {showTailstock && (
          <g>
            <rect x="620" y="110" width="120" height="180" fill="#1e293b" stroke="#0284c7" strokeWidth="2" rx="6" />
            <rect x="580" y="180" width="45" height="40" fill="#cbd5e1" />
            <polygon points="580,180 550,200 580,220" fill="#e2e8f0" />
          </g>
        )}

        {/* CUTTING TOOL - VERTIKAL, HADAP KIRI, HANYA UJUNG LANCIP MENGENAI BENDA KERJA */}
        <g transform={`translate(${toolTipX}, ${toolTipY})`} style={{ transition: isRunning ? 'none' : 'all 0.05s linear' }}>
          {toolOrientation === 'vertical' ? (
            /* VERTICAL TOOL HOLDER & TURRET CLAMP (HADAP KIRI) */
            <g>
              {/* CUTTING INSERT AT TIP (0, 0) - HANYA UJUNG LANCIP INI YANG MENYENTUH BENDA KERJA */}
              {toolType === 'rata' && (
                /* 1. Pahat Rata Kanan - Hadap KIRI (ke arah cekam/spindel Z-) */
                <g>
                  {/* Vertical Tool Shank set back to the right (x: 8 to 28) and below (y: 24 to 120) */}
                  <rect x="8" y="24" width="20" height="95" rx="3" fill="#18181b" stroke="#38bdf8" strokeWidth="1.5" />
                  
                  {/* Tool Clamping Block */}
                  <rect x="4" y="55" width="28" height="50" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
                  <circle cx="14" cy="70" r="3" fill="#cbd5e1" />
                  <circle cx="22" cy="70" r="3" fill="#cbd5e1" />
                  <circle cx="18" cy="90" r="3" fill="#cbd5e1" />

                  {/* Vertical Orientation Indicator */}
                  <rect x="-6" y="112" width="48" height="16" rx="4" fill="rgba(15,23,42,0.9)" stroke="#38bdf8" strokeWidth="0.8" />
                  <text x="18" y="124" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">VERTIKAL</text>

                  {/* Gold Carbide Rhombic 80 deg Insert - Pointing LEFT at (0, 0) */}
                  {/* Apex nose is EXACTLY at (0,0). Trailing edge slopes to (18, 6) giving wide clearance.
                      Leading edge slopes to (3, 18) clear of the uncut shoulder. Only (0,0) touches! */}
                  <polygon
                    points="0,0 3,18 21,24 18,6"
                    fill={isCutting ? "#f59e0b" : "#eab308"}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  {/* Chipbreaker groove */}
                  <polygon
                    points="2,3 4,15 17,20 15,8"
                    fill="rgba(0,0,0,0.22)"
                  />
                  <circle cx="10" cy="12" r="2.5" fill="#713f12" stroke="#451a03" strokeWidth="0.8" />

                  {/* Nose radius shiny sharp tip highlight */}
                  <circle cx="0" cy="0" r="1.5" fill="#ffffff" />

                  {/* Direction arrow & label: HADAP KIRI */}
                  <text x="28" y="18" fill="#38bdf8" fontSize="9" fontWeight="800">T01 ◄ HADAP KIRI</text>
                </g>
              )}

              {toolType === 'alur' && (
                /* 2. Pahat Alur (Slender 3mm Grooving / Parting Blade) */
                <g>
                  {/* Heavy-duty vertical toolholder with CoroCut blade clamp */}
                  <rect x="-8" y="28" width="22" height="92" rx="3" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
                  
                  {/* Blade clamping jaw */}
                  <polygon points="-10,26 8,26 6,36 -8,36" fill="#334155" stroke="#64748b" strokeWidth="1" />
                  <circle cx="-1" cy="46" r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
                  <circle cx="-1" cy="70" r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />

                  {/* Slender Grooving Blade: flat 3mm edge at (0,0) to (6,0) with deep neck */}
                  <polygon
                    points="0,0 6,0 5.2,30 0.8,30"
                    fill={isCutting ? "#f59e0b" : "#d97706"}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  {/* Flat cutting edge highlight */}
                  <line x1="0" y1="0" x2="6" y2="0" stroke="#ffffff" strokeWidth="2.5" />
                  {/* Chip curling concave notch */}
                  <path d="M 0.8,2 Q 3,4.5 5.2,2 L 4.8,8 Q 3,10 1.2,8 Z" fill="rgba(0,0,0,0.3)" />
                  <circle cx="3" cy="18" r="1.8" fill="#78350f" />

                  {/* Label & Indicator */}
                  <text x="14" y="16" fill="#fbbf24" fontSize="9" fontWeight="800">T02 ALUR 3mm (BILAH)</text>
                </g>
              )}

              {toolType === 'ulir' && (
                /* 3. Pahat Ulir Luar 60° (Equilateral 60° Triangular Laydown Insert 16ER) */
                <g>
                  {/* Vertical SER Toolholder Shank */}
                  <rect x="-10" y="24" width="22" height="96" rx="3" fill="#18181b" stroke="#a855f7" strokeWidth="1.5" />
                  <circle cx="1" cy="55" r="3" fill="#cbd5e1" />
                  <circle cx="1" cy="80" r="3" fill="#cbd5e1" />

                  {/* Anvil shim seat */}
                  <polygon points="-12,20 12,20 10,25 -10,25" fill="#334155" />

                  {/* 60° Equilateral Triangle 16ER Threading Insert */}
                  {/* Apex is at (0,0), flanks at -30 deg and +30 deg creating exact 60 deg V-thread tooth */}
                  <polygon
                    points="0,0 -12,21 12,21"
                    fill={isCutting ? "#f59e0b" : "#a855f7"}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  {/* Chipbreaker triangular groove */}
                  <polygon
                    points="0,3 -8,19 8,19"
                    fill="rgba(0,0,0,0.28)"
                  />
                  {/* Central Torx Countersunk Screw */}
                  <circle cx="0" cy="14" r="2.8" fill="#581c87" stroke="#e9d5ff" strokeWidth="0.8" />
                  {/* Sharp 60° V-crest highlight */}
                  <circle cx="0" cy="0" r="1.5" fill="#ffffff" />

                  {/* Label */}
                  <text x="18" y="16" fill="#c084fc" fontSize="9" fontWeight="800">T04 ◄ ULIR 60° (16ER)</text>
                </g>
              )}

              {toolType === 'facing' && (
                /* 4. Pahat Facing (Wedge Facing Insert Angled to Face) */
                <g>
                  <rect x="8" y="26" width="20" height="95" rx="3" fill="#18181b" stroke="#34d399" strokeWidth="1.5" />
                  <rect x="4" y="55" width="28" height="50" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
                  <circle cx="18" cy="70" r="3" fill="#cbd5e1" />

                  {/* Sharp triangular facing insert pointing left towards face */}
                  <polygon
                    points="0,0 2,22 18,26 16,8"
                    fill={isCutting ? "#f59e0b" : "#10b981"}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  <circle cx="9" cy="14" r="2.2" fill="#064e3b" />
                  <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                  <text x="26" y="18" fill="#34d399" fontSize="9" fontWeight="800">T03 ◄ FACING</text>
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

        {/* PETUNJUK LEGENDA ALUR GERAKAN PAHAT (TOOLPATH) */}
        {showToolpath && (
          <g transform="translate(16, 20)">
            <rect x="0" y="0" width="224" height="74" rx="8" fill="rgba(15, 23, 42, 0.90)" stroke="#38bdf8" strokeWidth="1" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
            <text x="12" y="18" fill="#f8fafc" fontSize="10" fontWeight="900" letterSpacing="0.5">
              📐 ALUR GERAKAN PAHAT (TOOLPATH)
            </text>
            {/* Rapid line G00 */}
            <line x1="14" y1="34" x2="42" y2="34" stroke="#eab308" strokeWidth="2" strokeDasharray="5 3" />
            <circle cx="28" cy="34" r="2.2" fill="#facc15" />
            <text x="48" y="37" fill="#fde047" fontSize="9" fontWeight="700">
              G00 : Gerak Cepat (Rapid Approach)
            </text>
            {/* Cut line G01/G92 */}
            <line x1="14" y1="52" x2="42" y2="52" stroke="#06b6d4" strokeWidth="3" />
            <circle cx="28" cy="52" r="2.2" fill="#06b6d4" />
            <text x="48" y="55" fill="#38bdf8" fontSize="9" fontWeight="700">
              G01/G92 : Gerak Sayat (Cutting Pass)
            </text>
            {/* Active status */}
            <circle cx="20" cy="65" r="3" fill={isRunning ? "#22c55e" : "#94a3b8"} />
            <text x="30" y="68" fill={isRunning ? "#4ade80" : "#94a3b8"} fontSize="8.5" fontWeight="600">
              {isRunning ? 'Pahat sedang aktif menyayat program' : 'Preview alur siap dieksekusi'}
            </text>
          </g>
        )}
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
  coolant = false,
  showTailstock = false,
  gcodeText = '',
  currentLine = -1,
  showToolpath = true,
  onToggleToolpath = null
}) => {
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'
  const [localShowToolpath, setLocalShowToolpath] = useState(true);
  const effectiveShowToolpath = onToggleToolpath ? showToolpath : localShowToolpath;
  const toggleToolpathHandler = onToggleToolpath || (() => setLocalShowToolpath(v => !v));

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
            showTailstock={showTailstock}
            gcodeText={gcodeText}
            currentLine={currentLine}
            showToolpath={effectiveShowToolpath}
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
          showTailstock={showTailstock}
          gcodeText={gcodeText}
          currentLine={currentLine}
          showToolpath={effectiveShowToolpath}
        />
      )}

      {/* VIEW & TOOLPATH TOGGLE BUTTONS */}
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

        {/* ALUR PAHAT (TOOLPATH) TOGGLE BUTTON */}
        <button
          onClick={toggleToolpathHandler}
          style={{
            padding: '6px 12px',
            background: effectiveShowToolpath ? 'rgba(6, 182, 212, 0.22)' : 'rgba(15, 23, 42, 0.85)',
            border: `1px solid ${effectiveShowToolpath ? '#06b6d4' : 'rgba(148, 163, 184, 0.4)'}`,
            color: effectiveShowToolpath ? '#22d3ee' : '#94a3b8',
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
          title="Tampilkan / Sembunyikan Garis Alur Gerakan Pahat (G00 Rapid & G01 Sayat)"
        >
          <span>{effectiveShowToolpath ? '👁️' : '🙈'}</span>
          <span>ALUR PAHAT: {effectiveShowToolpath ? 'ON' : 'OFF'}</span>
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

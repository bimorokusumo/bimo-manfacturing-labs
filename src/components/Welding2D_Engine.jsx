import React, { useMemo } from 'react';

const Welding2D_Engine = ({
  isWelding = false,
  weldingProcess = 'SMAW',
  weldType = 'groove', // 'groove' | 'fillet'
  weldPosition = '1G',
  plateThickness = '6mm',
  torchPos = 0,
  weldProgress = 0,
  amperage = 115,
  voltage = 22.0,
  gasFlow = 15,
  oawFlame = 'neutral',
  defects = [],
  onDefectClick = null
}) => {
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 440;
  const CENTER_X = 400;
  const CENTER_Y = 240;

  // Numerical plate thickness (mm)
  const thickNum = parseFloat(plateThickness) || 6;
  const scale = 14; // pixels per mm for clear macro cross-section
  const plateHeightPx = Math.max(30, thickNum * scale);

  // Cross-section geometry parameters
  const rootGap = 2.5; // mm (Standard AWS D1.1)
  const rootGapPx = rootGap * scale;
  const bevelAngleDeg = 30; // 30 degrees per plate = 60 degrees included
  const bevelWidthPx = plateHeightPx * Math.tan((bevelAngleDeg * Math.PI) / 180);

  // Welding progress ratio (0.0 to 1.0)
  const progressRatio = Math.max(0, Math.min(1, (weldProgress || torchPos || 0) / 100));

  // Determine defect presence for highlighting in cross-section
  const hasUndercut = defects.some(d => d.id === 'undercut' || d.type === 'undercut');
  const hasPorosity = defects.some(d => d.id === 'porosity' || d.type === 'porosity');
  const hasSlag = defects.some(d => d.id === 'slag' || d.type === 'slag');
  const hasIncompletePen = defects.some(d => d.id === 'incomplete_penetration' || d.type === 'incomplete_penetration');
  const hasCrack = defects.some(d => d.id === 'crack' || d.type === 'crack');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#090e1a' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {/* Engineering Blueprint Grid */}
          <pattern id="weld2dGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
          </pattern>

          {/* Linear Hatch Pattern for Base Metal (Logam Induk) */}
          <pattern id="metalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#334155" strokeWidth="1.2" />
          </pattern>

          {/* Molten Glow Gradient */}
          <radialGradient id="arcGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor={weldingProcess === 'TIG' ? '#818cf8' : '#f59e0b'} stopOpacity="0.9" />
            <stop offset="60%" stopColor={weldingProcess === 'TIG' ? '#4f46e5' : '#ea580c'} stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Gas Shield Cone Gradient */}
          <linearGradient id="gasShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.02)" />
          </linearGradient>

          {/* Heat-Affected Zone (HAZ) Gradient */}
          <linearGradient id="hazGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="hazGradRight" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Blueprint background grid */}
        <rect width="100%" height="100%" fill="url(#weld2dGrid)" />

        {/* TITLE & AWS / ISO COMPLIANCE HEADER */}
        <g transform="translate(24, 28)">
          <text x="0" y="0" fill="#38bdf8" fontSize="13" fontWeight="900" letterSpacing="0.08em">
            DIAGRAM SKEMATIS 2D: PENAMPANG MAKRO SAMBUNGAN LAS (MACRO CROSS-SECTION)
          </text>
          <text x="0" y="18" fill="#94a3b8" fontSize="10" fontWeight="600">
            Standar Spesifikasi: AWS D1.1 / ISO 5817 • Sambungan {weldType === 'groove' ? 'V-Groove Butt Joint' : 'Fillet T-Joint'} • Posisi {weldPosition} • Plat {plateThickness}
          </text>
        </g>

        {/* =========================================================================
            JOINT CROSS-SECTION: GROOVE (V-BUTT) OR FILLET (T-JOINT)
            ========================================================================= */}
        {weldType === 'groove' ? (
          <g id="grooveJoint">
            {/* LEFT BASE METAL PLATE */}
            {/* Top edge: y = CENTER_Y - plateHeightPx, Bottom edge: y = CENTER_Y */}
            <polygon
              points={`
                60,${CENTER_Y - plateHeightPx}
                ${CENTER_X - rootGapPx / 2 - bevelWidthPx},${CENTER_Y - plateHeightPx}
                ${CENTER_X - rootGapPx / 2},${CENTER_Y - 4}
                ${CENTER_X - rootGapPx / 2},${CENTER_Y}
                60,${CENTER_Y}
              `}
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            {/* Hatching for Left Plate */}
            <polygon
              points={`
                60,${CENTER_Y - plateHeightPx}
                ${CENTER_X - rootGapPx / 2 - bevelWidthPx},${CENTER_Y - plateHeightPx}
                ${CENTER_X - rootGapPx / 2},${CENTER_Y - 4}
                ${CENTER_X - rootGapPx / 2},${CENTER_Y}
                60,${CENTER_Y}
              `}
              fill="url(#metalHatch)"
            />

            {/* RIGHT BASE METAL PLATE */}
            <polygon
              points={`
                ${CENTER_X + rootGapPx / 2 + bevelWidthPx},${CENTER_Y - plateHeightPx}
                740,${CENTER_Y - plateHeightPx}
                740,${CENTER_Y}
                ${CENTER_X + rootGapPx / 2},${CENTER_Y}
                ${CENTER_X + rootGapPx / 2},${CENTER_Y - 4}
              `}
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <polygon
              points={`
                ${CENTER_X + rootGapPx / 2 + bevelWidthPx},${CENTER_Y - plateHeightPx}
                740,${CENTER_Y - plateHeightPx}
                740,${CENTER_Y}
                ${CENTER_X + rootGapPx / 2},${CENTER_Y}
                ${CENTER_X + rootGapPx / 2},${CENTER_Y - 4}
              `}
              fill="url(#metalHatch)"
            />

            {/* HEAT-AFFECTED ZONE (HAZ) BAND ALONG BEVEL EDGES */}
            <path
              d={`
                M ${CENTER_X - rootGapPx / 2 - bevelWidthPx - 10} ${CENTER_Y - plateHeightPx}
                L ${CENTER_X - rootGapPx / 2 - bevelWidthPx} ${CENTER_Y - plateHeightPx}
                L ${CENTER_X - rootGapPx / 2} ${CENTER_Y - 4}
                L ${CENTER_X - rootGapPx / 2} ${CENTER_Y}
                L ${CENTER_X - rootGapPx / 2 - 10} ${CENTER_Y}
                Z
              `}
              fill="rgba(245, 158, 11, 0.12)"
              stroke="#f59e0b"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
            <path
              d={`
                M ${CENTER_X + rootGapPx / 2 + bevelWidthPx} ${CENTER_Y - plateHeightPx}
                L ${CENTER_X + rootGapPx / 2 + bevelWidthPx + 10} ${CENTER_Y - plateHeightPx}
                L ${CENTER_X + rootGapPx / 2 + 10} ${CENTER_Y}
                L ${CENTER_X + rootGapPx / 2} ${CENTER_Y}
                L ${CENTER_X + rootGapPx / 2} ${CENTER_Y - 4}
                Z
              `}
              fill="rgba(245, 158, 11, 0.12)"
              stroke="#f59e0b"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />

            {/* DEPOSITED WELD BEAD FILL (Grows with progressRatio) */}
            {progressRatio > 0.05 && (
              <g id="weldDeposit">
                {/* 1. Root Pass (Penetrasi Akar Las) */}
                <path
                  d={`
                    M ${CENTER_X - rootGapPx / 2} ${CENTER_Y - 4}
                    Q ${CENTER_X} ${CENTER_Y + (hasIncompletePen ? -2 : 6)} ${CENTER_X + rootGapPx / 2} ${CENTER_Y - 4}
                    L ${CENTER_X + rootGapPx / 2 + bevelWidthPx * 0.35 * Math.min(1, progressRatio * 2)} ${CENTER_Y - plateHeightPx * 0.35 * Math.min(1, progressRatio * 2)}
                    Q ${CENTER_X} ${CENTER_Y - plateHeightPx * 0.28 * Math.min(1, progressRatio * 2)} ${CENTER_X - rootGapPx / 2 - bevelWidthPx * 0.35 * Math.min(1, progressRatio * 2)} ${CENTER_Y - plateHeightPx * 0.35 * Math.min(1, progressRatio * 2)}
                    Z
                  `}
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  opacity={Math.min(1, progressRatio * 2.5)}
                />

                {/* 2. Capping / Filler Pass (Lapisan Penutup) */}
                {progressRatio > 0.4 && (
                  <path
                    d={`
                      M ${CENTER_X - rootGapPx / 2 - bevelWidthPx * progressRatio - (hasUndercut ? -4 : 4)} ${CENTER_Y - plateHeightPx * progressRatio}
                      Q ${CENTER_X} ${CENTER_Y - plateHeightPx * progressRatio - 12 * progressRatio} ${CENTER_X + rootGapPx / 2 + bevelWidthPx * progressRatio + 4} ${CENTER_Y - plateHeightPx * progressRatio}
                      L ${CENTER_X + rootGapPx / 2 + bevelWidthPx * 0.35} ${CENTER_Y - plateHeightPx * 0.35}
                      Q ${CENTER_X} ${CENTER_Y - plateHeightPx * 0.28} ${CENTER_X - rootGapPx / 2 - bevelWidthPx * 0.35} ${CENTER_Y - plateHeightPx * 0.35}
                      Z
                    `}
                    fill="linear-gradient(180deg, #38bdf8, #0369a1)"
                    fillOpacity="0.85"
                    stroke="#7dd3fc"
                    strokeWidth="1.5"
                  />
                )}

                {/* Weld Bead Ripple Lines (Tekstur Manik Las) */}
                {Array.from({ length: Math.floor(progressRatio * 6) }).map((_, idx) => (
                  <path
                    key={idx}
                    d={`
                      M ${CENTER_X - rootGapPx / 2 - bevelWidthPx * (0.2 + idx * 0.13)} ${CENTER_Y - plateHeightPx * (0.15 + idx * 0.13)}
                      Q ${CENTER_X} ${CENTER_Y - plateHeightPx * (0.15 + idx * 0.13) - 6} ${CENTER_X + rootGapPx / 2 + bevelWidthPx * (0.2 + idx * 0.13)} ${CENTER_Y - plateHeightPx * (0.15 + idx * 0.13)}
                    `}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                ))}
              </g>
            )}

            {/* TECHNICAL DIMENSIONS & ANNOTATIONS */}
            {/* Root Gap Dimension */}
            <g transform={`translate(${CENTER_X}, ${CENTER_Y + 24})`}>
              <line x1={-rootGapPx / 2} y1="0" x2={rootGapPx / 2} y2="0" stroke="#38bdf8" strokeWidth="1.2" />
              <line x1={-rootGapPx / 2} y1="-6" x2={-rootGapPx / 2} y2="6" stroke="#38bdf8" strokeWidth="1.2" />
              <line x1={rootGapPx / 2} y1="-6" x2={rootGapPx / 2} y2="6" stroke="#38bdf8" strokeWidth="1.2" />
              <text x="0" y="16" fill="#38bdf8" fontSize="9" fontWeight="800" textAnchor="middle">
                Root Gap: {rootGap} mm
              </text>
            </g>

            {/* Bevel Angle Arc & Label */}
            <g transform={`translate(${CENTER_X - rootGapPx / 2 - bevelWidthPx / 2}, ${CENTER_Y - plateHeightPx - 14})`}>
              <text x="0" y="0" fill="#f59e0b" fontSize="9" fontWeight="800" textAnchor="middle">
                Sudut Bevel: 30° (Total 60°)
              </text>
            </g>

            {/* Plate Thickness Dimension on Left Edge */}
            <g transform={`translate(42, ${CENTER_Y - plateHeightPx / 2})`}>
              <line x1="0" y1={-plateHeightPx / 2} x2="0" y2={plateHeightPx / 2} stroke="#94a3b8" strokeWidth="1" />
              <line x1="-5" y1={-plateHeightPx / 2} x2="5" y2={-plateHeightPx / 2} stroke="#94a3b8" strokeWidth="1" />
              <line x1="-5" y1={plateHeightPx / 2} x2="5" y2={plateHeightPx / 2} stroke="#94a3b8" strokeWidth="1" />
              <text x="-8" y="3" fill="#cbd5e1" fontSize="9" fontWeight="800" textAnchor="end">
                t = {plateThickness}
              </text>
            </g>
          </g>
        ) : (
          /* FILLET (T-JOINT) CROSS-SECTION */
          <g id="filletJoint">
            {/* HORIZONTAL BOTTOM PLATE */}
            <rect
              x="120"
              y={CENTER_Y}
              width="560"
              height={plateHeightPx}
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <rect
              x="120"
              y={CENTER_Y}
              width="560"
              height={plateHeightPx}
              fill="url(#metalHatch)"
            />

            {/* VERTICAL STANDING WEB PLATE */}
            <rect
              x={CENTER_X - plateHeightPx / 2}
              y={CENTER_Y - 140}
              width={plateHeightPx}
              height="140"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <rect
              x={CENTER_X - plateHeightPx / 2}
              y={CENTER_Y - 140}
              width={plateHeightPx}
              height="140"
              fill="url(#metalHatch)"
            />

            {/* FILLET WELD BEAD DEPOSIT (RIGHT SIDE CORNER) */}
            {progressRatio > 0.05 && (
              <g id="filletBead">
                {/* Fillet Triangle & Convex Face */}
                <path
                  d={`
                    M ${CENTER_X + plateHeightPx / 2} ${CENTER_Y}
                    L ${CENTER_X + plateHeightPx / 2 + 40 * progressRatio} ${CENTER_Y}
                    Q ${CENTER_X + plateHeightPx / 2 + 25 * progressRatio} ${CENTER_Y - 25 * progressRatio} ${CENTER_X + plateHeightPx / 2} ${CENTER_Y - 40 * progressRatio}
                    Z
                  `}
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />

                {/* Throat Thickness Line 'a' */}
                <line
                  x1={CENTER_X + plateHeightPx / 2}
                  y1={CENTER_Y}
                  x2={CENTER_X + plateHeightPx / 2 + 18 * progressRatio}
                  y2={CENTER_Y - 18 * progressRatio}
                  stroke="#facc15"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                <text
                  x={CENTER_X + plateHeightPx / 2 + 24}
                  y={CENTER_Y - 22}
                  fill="#facc15"
                  fontSize="9"
                  fontWeight="800"
                >
                  a (Throat): {(thickNum * 0.7).toFixed(1)} mm
                </text>
              </g>
            )}

            {/* Dimension Labels */}
            <text x={CENTER_X - plateHeightPx / 2 - 12} y={CENTER_Y - 70} fill="#94a3b8" fontSize="9" fontWeight="800" textAnchor="end">
              Pelat Tegak (Web)
            </text>
            <text x={CENTER_X} y={CENTER_Y + plateHeightPx + 16} fill="#94a3b8" fontSize="9" fontWeight="800" textAnchor="middle">
              Pelat Alas (Flange) • t = {plateThickness}
            </text>
          </g>
        )}

        {/* =========================================================================
            TORCH / ELECTRODE / ARC SCHEMATIC IN 2D
            ========================================================================= */}
        {/* Arc position moves with torchPos along X */}
        {(() => {
          const arcTargetX = CENTER_X + (weldType === 'fillet' ? plateHeightPx / 2 + 15 : 0);
          const arcTargetY = CENTER_Y - (weldType === 'fillet' ? 15 : (plateHeightPx * progressRatio + 2));

          return (
            <g id="torchSchematic" transform={`translate(${arcTargetX}, ${arcTargetY})`}>
              {/* ARC PLASMA COLUMN & SPARKS (WHEN WELDING) */}
              {isWelding && (
                <g id="liveArc">
                  {/* Outer Glow */}
                  <circle cx="0" cy="0" r="32" fill="url(#arcGlow)" />
                  {/* Intense Core Arc */}
                  <ellipse cx="0" cy="0" rx="8" ry="12" fill="#ffffff" />
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="14"
                    ry="18"
                    fill={weldingProcess === 'TIG' ? 'rgba(129, 140, 248, 0.7)' : 'rgba(245, 158, 11, 0.7)'}
                  />

                  {/* Random Particle Sparks */}
                  {[-18, -12, -6, 6, 14, 20].map((offset, i) => (
                    <circle
                      key={i}
                      cx={offset + (i % 2 === 0 ? 4 : -4)}
                      cy={-14 - (i * 4) % 18}
                      r={1.2 + (i % 2) * 0.8}
                      fill={i % 2 === 0 ? '#facc15' : '#ffffff'}
                    />
                  ))}
                </g>
              )}

              {/* TORCH / ELECTRODE GEOMETRY DEPENDING ON PROCESS */}
              {/* Rotate torch to travel angle (75 degrees = -15 deg from vertical) */}
              <g transform="rotate(-15 0 0)">
                {/* 1. SMAW / MMA: Stick Electrode */}
                {weldingProcess === 'SMAW' && (
                  <g id="smawStick">
                    {/* Core Wire (Kawat Inti) */}
                    <line x1="0" y1="-8" x2="0" y2="-120" stroke="#94a3b8" strokeWidth="3.2" />
                    {/* Flux Coating (Salutan Fluks Abu-abu) */}
                    <line x1="0" y1="-14" x2="0" y2="-120" stroke="#64748b" strokeWidth="6.0" />
                    {/* Molten Crater Droplet */}
                    <circle cx="0" cy="-6" r="3" fill="#f59e0b" />
                    {/* Electrode Holder Clamping Head */}
                    <rect x="-8" y="-140" width="16" height="25" fill="#ea580c" rx="4" />
                    <text x="12" y="-50" fill="#94a3b8" fontSize="8" fontWeight="700">
                      Elektroda SMAW (Ø3.2mm)
                    </text>
                  </g>
                )}

                {/* 2. MIG / MAG: Shielded Gas Nozzle & Wire */}
                {weldingProcess === 'MIG' && (
                  <g id="migTorch">
                    {/* Gas Shield Cone */}
                    <polygon points="-22,-45 22,-45 14,-8 -14,-8" fill="url(#gasShieldGrad)" />
                    {/* Copper Gas Nozzle (Nozel Tembaga) */}
                    <polygon points="-16,-90 16,-90 12,-45 -12,-45" fill="#d97706" stroke="#b45309" strokeWidth="1" />
                    {/* Copper Contact Tip */}
                    <rect x="-4" y="-45" width="8" height="25" fill="#f59e0b" rx="1.5" />
                    {/* Solid Wire Electrode (Kawat Las Rol) */}
                    <line x1="0" y1="-20" x2="0" y2="-4" stroke="#e2e8f0" strokeWidth="1.2" />
                    <text x="18" y="-60" fill="#38bdf8" fontSize="8" fontWeight="700">
                      Nozel MIG / MAG (Gas Ar+CO2)
                    </text>
                  </g>
                )}

                {/* 3. TIG / GTAW: Tungsten & Alumina Cup */}
                {weldingProcess === 'TIG' && (
                  <g id="tigTorch">
                    {/* Gas Cone */}
                    <polygon points="-18,-45 18,-45 10,-8 -10,-8" fill="url(#gasShieldGrad)" />
                    {/* Pink/Ceramic Alumina Gas Cup */}
                    <polygon points="-14,-85 14,-85 10,-45 -10,-45" fill="#f43f5e" stroke="#e11d48" strokeWidth="1" />
                    {/* Pointed Tungsten Electrode (Jarum Tungsten Emas/Merah) */}
                    <polygon points="-1.5,-45 1.5,-45 0,-4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
                    <text x="16" y="-55" fill="#818cf8" fontSize="8" fontWeight="700">
                      Torch TIG (Elektroda Tungsten Ø2.4mm)
                    </text>
                  </g>
                )}

                {/* 4. OAW: Blowpipe Torch & Flame Cone */}
                {weldingProcess === 'OAW' && (
                  <g id="oawTorch">
                    {/* Brass Nozzle Tip */}
                    <polygon points="-8,-80 8,-80 5,-20 -5,-20" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                    {/* Inner Flame Core (Inti Api Kerucut) */}
                    <polygon points="-3,-20 3,-20 0,-4" fill="#a855f7" />
                    {/* Outer Envelope Flame */}
                    <polygon points="-8,-20 8,-20 0,6" fill="rgba(244, 63, 94, 0.4)" />
                    <text x="14" y="-45" fill="#facc15" fontSize="8" fontWeight="700">
                      Nozel Brander OAW ({oawFlame.toUpperCase()})
                    </text>
                  </g>
                )}
              </g>

              {/* Travel Direction Arrow */}
              <g transform="translate(45, -5)">
                <line x1="0" y1="0" x2="35" y2="0" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowCut)" />
                <text x="0" y="-6" fill="#10b981" fontSize="8" fontWeight="800">
                  Arah Jalan (Travel)
                </text>
              </g>
            </g>
          );
        })()}

        {/* =========================================================================
            DEFECT ANNOTATIONS ON CROSS-SECTION (IF DEFECTS OCCUR)
            ========================================================================= */}
        {hasUndercut && (
          <g transform={`translate(${CENTER_X - rootGapPx / 2 - bevelWidthPx - 6}, ${CENTER_Y - plateHeightPx})`}>
            <circle cx="0" cy="0" r="5" fill="#ef4444" />
            <line x1="0" y1="-4" x2="-25" y2="-20" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="-95" y="-34" width="70" height="18" fill="rgba(239, 68, 68, 0.85)" rx="4" />
            <text x="-60" y="-22" fill="#fff" fontSize="8" fontWeight="900" textAnchor="middle">
              [CACAT] Undercut
            </text>
          </g>
        )}

        {hasIncompletePen && (
          <g transform={`translate(${CENTER_X}, ${CENTER_Y + 4})`}>
            <circle cx="0" cy="0" r="5" fill="#ef4444" />
            <line x1="0" y1="4" x2="25" y2="24" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="25" y="16" width="120" height="18" fill="rgba(239, 68, 68, 0.85)" rx="4" />
            <text x="85" y="28" fill="#fff" fontSize="8" fontWeight="900" textAnchor="middle">
              [CACAT] Kurang Penetrasi Akar
            </text>
          </g>
        )}

        {hasPorosity && (
          <g transform={`translate(${CENTER_X + 8}, ${CENTER_Y - plateHeightPx * 0.4})`}>
            <circle cx="0" cy="0" r="3" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
            <circle cx="6" cy="-3" r="2" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
            <circle cx="-4" cy="4" r="2.5" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="10" y1="-5" x2="35" y2="-22" stroke="#ef4444" strokeWidth="1.5" />
            <rect x="35" y="-34" width="85" height="18" fill="rgba(239, 68, 68, 0.85)" rx="4" />
            <text x="77" y="-22" fill="#fff" fontSize="8" fontWeight="900" textAnchor="middle">
              [CACAT] Cacat Porosity
            </text>
          </g>
        )}

        {/* =========================================================================
            TECHNICAL LEGEND / HUD BOX AT BOTTOM
            ========================================================================= */}
        <g transform="translate(24, 380)">
          <rect
            x="0"
            y="0"
            width={SVG_WIDTH - 48}
            height="46"
            fill="rgba(15, 23, 42, 0.8)"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
            rx="8"
          />

          <g transform="translate(14, 20)">
            {/* Color swatches */}
            <rect x="0" y="-8" width="12" height="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
            <text x="18" y="2" fill="#94a3b8" fontSize="9" fontWeight="700">
              Logam Induk (Base Metal)
            </text>

            <rect x="155" y="-8" width="12" height="12" fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" strokeWidth="1" />
            <text x="173" y="2" fill="#94a3b8" fontSize="9" fontWeight="700">
              HAZ (Daerah Terpengaruh Panas)
            </text>

            <rect x="355" y="-8" width="12" height="12" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <text x="373" y="2" fill="#94a3b8" fontSize="9" fontWeight="700">
              Logam Las (Weld Deposit)
            </text>

            <text x="560" y="2" fill="#38bdf8" fontSize="9" fontWeight="800">
              Parameter WPS: {weldingProcess === 'MIG' ? `${voltage}V / ${gasFlow}L` : weldingProcess === 'OAW' ? `Api ${oawFlame}` : `${amperage}A`}
            </text>

            <text x="560" y="16" fill="#10b981" fontSize="9" fontWeight="800">
              Progres Las: {Math.round(progressRatio * 100)}%
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Welding2D_Engine;

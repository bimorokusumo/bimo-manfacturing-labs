import React, { useState, Suspense } from 'react';
import Milling2D_Engine from './Milling2D_Engine';
import Milling3D_Engine from './Milling3D_Engine';

const Milling3D = ({
  isRunning = false,
  tablePosition = { x: 0, y: 0 },
  spindlePosition = { z: 5 },
  heightmap = [],
  workpieceSize = { w: 100, l: 50, t: 30 },
  toolDiameter = 10,
  rpm = 1500,
  isCutting = false,
  coolant = false,
  gridX = 60,
  gridY = 30
}) => {
  const [viewMode, setViewMode] = useState('3d'); // default '3d'

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {viewMode === '3d' ? (
        <Suspense
          fallback={
            <div className="flex-center" style={{ height: '100%', background: '#eef2f6', color: '#0284c7', fontWeight: 'bold' }}>
              MEMUAT 3D MILLING ENGINE...
            </div>
          }
        >
          <Milling3D_Engine
            isRunning={isRunning}
            tablePosition={tablePosition}
            spindlePosition={spindlePosition}
            heightmap={heightmap}
            workpieceSize={workpieceSize}
            toolDiameter={toolDiameter}
            isCutting={isCutting}
            coolant={coolant}
            gridX={gridX}
            gridY={gridY}
          />
        </Suspense>
      ) : (
        <Milling2D_Engine
          isRunning={isRunning}
          tablePosition={tablePosition}
          spindlePosition={spindlePosition}
          heightmap={heightmap}
          workpieceSize={workpieceSize}
          toolDiameter={toolDiameter}
          rpm={rpm}
          gridX={gridX}
          gridY={gridY}
        />
      )}

      {/* VIEW TOGGLE BUTTON (TOP LEFT) */}
      <div style={{ position: 'absolute', top: '14px', left: '16px', zIndex: 10 }}>
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
          {viewMode === '3d' ? '📐 TAMPILAN 2D PRESISI (TOP-DOWN)' : '🎮 TAMPILAN 3D STUDIO'}
        </button>
      </div>

      {/* STATUS BADGES (TOP RIGHT) */}
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

export default Milling3D;

import React from 'react';

const InteractiveHotspot = ({ x, y, title, description, id, activeId, onClick }) => {
  const isActive = activeId === id;
  
  return (
    <div 
      style={{
        position: 'absolute',
        top: `${y}%`,
        left: `${x}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isActive ? 10 : 1
      }}
    >
      <button 
        onClick={() => onClick(id)}
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
          border: `2px solid ${isActive ? '#fff' : 'rgba(255,255,255,0.5)'}`,
          boxShadow: isActive ? '0 0 15px var(--accent-glow)' : 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          animation: isActive ? 'none' : 'pulse 2s infinite'
        }}
      >
        <span style={{ 
          width: '10px', height: '10px', 
          backgroundcolor: 'var(--text-main)', borderRadius: '50%' 
        }}></span>
      </button>

      {isActive && (
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '250px',
            padding: '15px',
            textAlign: 'left',
            animation: 'fadeIn 0.3s ease forwards'
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent-primary)' }}>{title}</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(67, 97, 238, 0); }
          100% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default InteractiveHotspot;

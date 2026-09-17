import React from 'react';
import { ArrowRightIcon } from './Graphics';

const LabCard = ({ title, description, iconGraphic: IconComponent, badge, onClick }) => {
  return (
    <div 
      className="game-card game-card-hover" 
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '24px',
        cursor: 'pointer'
      }}
    >
      <div>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div style={{
            width: '52px', 
            height: '52px', 
            borderRadius: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {IconComponent ? <IconComponent size={32} /> : null}
          </div>
          {badge && <span className={`chip ${badge.color}`}>{badge.text}</span>}
        </div>
        
        <h3 className="cyber-font" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)', letterSpacing: '1px' }}>
          {title}
        </h3>
        
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', lineHeight: 1.55 }}>
          {description}
        </p>
      </div>
      
      <div className="cyber-font" style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'var(--game-tp)',
        fontWeight: '700',
        fontSize: '0.875rem'
      }}>
        <span>START MISSION</span>
        <ArrowRightIcon size={16} color="var(--game-tp)" />
      </div>
    </div>
  );
};

export default LabCard;

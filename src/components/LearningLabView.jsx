import React from 'react';

const LearningLabView = ({ onSelectLab }) => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* PILIH LAB SECTION */}
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>PILIH LAB</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
          
          <div onClick={() => onSelectLab('dashboard')} className="game-card" style={{ cursor: 'pointer', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '3rem' }}>📖</div>
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>Learning<br/>Lab</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Materi Pembelajaran</p>
            </div>
          </div>

          <div onClick={() => onSelectLab('machine')} className="game-card" style={{ cursor: 'pointer', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src="/assets/images/lathe.png" alt="Machine Lab" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>Machine<br/>Lab</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Simulasi Mesin</p>
            </div>
          </div>

          <div onClick={() => onSelectLab('welding')} className="game-card" style={{ cursor: 'pointer', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src="/assets/images/labs/welding_lab.jpg" alt="Welding Lab" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>Welding<br/>Lab</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Simulasi Pengelasan</p>
            </div>
          </div>

          <div onClick={() => onSelectLab('design')} className="game-card" style={{ cursor: 'pointer', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src="/assets/images/labs/design_lab.jpg" alt="Design Lab" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>Design<br/>Lab</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Gambar Teknik & CAD</p>
            </div>
          </div>

          <div onClick={() => onSelectLab('safety')} className="game-card" style={{ cursor: 'pointer', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src="/assets/images/labs/safety_lab.jpg" alt="Safety Lab" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>Safety<br/>Lab</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>K3 & Budaya Kerja</p>
            </div>
          </div>



        </div>
      </div>



      {/* BOTTOM ROW: VIRTUAL WELDING LAB - ALUR SIMULASI */}
      <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>VIRTUAL WELDING LAB - ALUR SIMULASI</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          
          {/* Connecting line */}
          <div style={{ position: 'absolute', top: '40px', left: '40px', right: '40px', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>

          {[
            { num: 1, title: 'Pilih Material', icon: '🧊' },
            { num: 2, title: 'Jenis Pengelasan', icon: '🔥' },
            { num: 3, title: 'Posisi Pengelasan', icon: '📐' },
            { num: 4, title: 'Setting Parameter', icon: '🎛️' },
            { num: 5, title: 'Safety Check', icon: '🦺' },
            { num: 6, title: 'Proses Pengelasan', icon: '⚡' },
            { num: 7, title: 'Hasil & Evaluasi', icon: '🛡️' }
          ].map((step, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700 }}>{step.num}</div>
              <div style={{ width: '80px', height: '80px', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                {step.icon}
              </div>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', textAlign: 'center', maxWidth: '80px', lineHeight: 1.2 }}>{step.title}</div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default LearningLabView;

import React from 'react';
import { useStudent } from '../context/StudentContext';

const Sidebar = ({ activeMenu, setActiveMenu, onLogout, isOpen, closeSidebar }) => {
  const { student, isLoggedIn, openLoginModal, logout, isTeacher } = useStudent();

  const menus = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'modules', label: 'Perpustakaan & Modul Ajar', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'machine', label: 'Machine Lab', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'cutting-tools', label: 'Alat Pemotong', icon: 'M12 4v2m0 12v2m8-8h-2M6 12H4m12.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z' },
    { id: 'heat-treatment', label: 'Heat Treatment', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
    { id: 'mechanics', label: 'Mekanika Teknik', icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' },
    { id: 'welding', label: 'Welding Lab', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'measuring', label: 'Alat Ukur Presisi', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h2m-2 4h4m-4 4h2m-2 4h4' },
    { id: 'design', label: 'Design Lab', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
    { id: 'safety', label: 'Safety Lab', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'virtual-bengkel', label: 'Virtual Bengkel 3D', icon: 'M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5' },
    { id: 'evaluasi', label: 'Evaluasi', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ...(isTeacher ? [{ id: 'gradebook', label: 'Monitoring Nilai Guru', badge: 'Guru', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }] : []),
  ];

  const handleMenuClick = (id) => {
    setActiveMenu(id);
    if (closeSidebar && (window.innerHeight < 600 || window.innerWidth < 1024)) {
      closeSidebar();
    }
  };

  const heatTreatmentSubmenus = [
    { id: 'heat-treatment-hardening', label: 'Hardening (Pengerasan)', icon: '⚡' },
    { id: 'heat-treatment-quenching', label: 'Quenching (Media Dingin)', icon: '💧' },
    { id: 'heat-treatment-tempering', label: 'Tempering (Penormalan)', icon: '🌡️' },
    { id: 'heat-treatment-annealing', label: 'Annealing (Pelunakan)', icon: '🧘' },
    { id: 'heat-treatment-normalizing', label: 'Normalizing (Penyeragaman)', icon: '🌱' },
    { id: 'heat-treatment-case-hardening', label: 'Case Hardening (Kulit)', icon: '🛡️' },
    { id: 'heat-treatment-blackening', label: 'Blackening (Black Oxide)', icon: '⚗️' },
  ];

  const mechanicsSubmenus = [
    { id: 'mechanics-torque', label: 'Momen Gaya & Torsi', icon: '🔧' },
    { id: 'mechanics-lever', label: 'Sistem Tuas (Pengungkit)', icon: '🕹️' },
    { id: 'mechanics-equilibrium', label: 'Kesetimbangan Tumpuan', icon: '⚖️' },
    { id: 'mechanics-stress', label: 'Tegangan & Regangan', icon: '📏' },
    { id: 'mechanics-pulley', label: 'Katrol & Chain Block', icon: '🏗️' },
    { id: 'mechanics-friction', label: 'Gesekan & Bidang Miring', icon: '📐' },
    { id: 'mechanics-calculator', label: 'Kalkulator Rumus Pintar', icon: '🧮' },
  ];

  const isHeatTreatmentActive = activeMenu === 'heat-treatment' || activeMenu.startsWith('heat-treatment-');
  const isMechanicsActive = activeMenu === 'mechanics' || activeMenu.startsWith('mechanics-');

  return (
    <div className="sidebar-container" style={{
      width: '260px',
      height: '100vh',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s ease-in-out'
    }}>
      {/* BRAND TEXT */}
      <div className="sidebar-brand" style={{ padding: '22px 20px', borderBottom: '1px solid var(--border-light)' }}>
        <div className="sidebar-brand-title" style={{
          fontWeight: 900,
          fontSize: '1.45rem',
          color: '#0f172a',
          letterSpacing: '2px',
          fontFamily: "'Chakra Petch', sans-serif",
          lineHeight: 1.1
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 900
          }}>BIMO</span>
        </div>
        <div style={{
          fontSize: '0.66rem',
          color: '#334155',
          fontWeight: 800,
          letterSpacing: '0.6px',
          marginTop: '4px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}>
          Virtual Manufacturing Lab
        </div>
      </div>

      {/* MENUS */}
      <div className="sidebar-menu-list" style={{ padding: '20px 12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menus.map(menu => {
          const isCurrentActive = activeMenu === menu.id ||
            (menu.id === 'heat-treatment' && isHeatTreatmentActive) ||
            (menu.id === 'mechanics' && isMechanicsActive);

          return (
            <React.Fragment key={menu.id}>
              <button
                className="sidebar-menu-btn"
                onClick={() => handleMenuClick(menu.id === 'heat-treatment' ? 'heat-treatment' : (menu.id === 'mechanics' ? 'mechanics' : menu.id))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  background: isCurrentActive ? (menu.id === 'mechanics' ? 'rgba(2, 132, 199, 0.12)' : 'rgba(245, 158, 11, 0.12)') : 'transparent',
                  color: isCurrentActive ? (menu.id === 'mechanics' ? '#0284c7' : '#b45309') : '#334155',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isCurrentActive ? 700 : 600,
                  fontSize: '0.88rem',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  borderLeft: isCurrentActive ? (menu.id === 'mechanics' ? '3px solid #0284c7' : '3px solid #f59e0b') : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menu.icon}></path>
                  </svg>
                  {menu.label}
                </div>
                {menu.id === 'heat-treatment' && (
                  <span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 800 }}>
                    {isHeatTreatmentActive ? '▼' : '▶'}
                  </span>
                )}
                {menu.id === 'mechanics' && (
                  <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 800 }}>
                    {isMechanicsActive ? '▼' : '▶'}
                  </span>
                )}
              </button>

              {/* Heat Treatment Submenus */}
              {menu.id === 'heat-treatment' && isHeatTreatmentActive && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  paddingLeft: '28px',
                  marginTop: '2px',
                  marginBottom: '6px',
                  borderLeft: '2px dashed rgba(245, 158, 11, 0.3)',
                  marginLeft: '20px'
                }}>
                  {heatTreatmentSubmenus.map(sub => {
                    const isSubActive = activeMenu === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleMenuClick(sub.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          background: isSubActive ? '#ffedd5' : 'transparent',
                          color: isSubActive ? '#c2410c' : '#475569',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: isSubActive ? 800 : 500,
                          fontSize: '0.78rem',
                          textAlign: 'left',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span style={{ fontSize: '0.85rem' }}>{sub.icon}</span>
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Mechanics Submenus */}
              {menu.id === 'mechanics' && isMechanicsActive && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  paddingLeft: '28px',
                  marginTop: '2px',
                  marginBottom: '6px',
                  borderLeft: '2px dashed rgba(2, 132, 199, 0.35)',
                  marginLeft: '20px'
                }}>
                  {mechanicsSubmenus.map(sub => {
                    const isSubActive = activeMenu === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleMenuClick(sub.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          background: isSubActive ? '#e0f2fe' : 'transparent',
                          color: isSubActive ? '#0369a1' : '#475569',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: isSubActive ? 800 : 500,
                          fontSize: '0.78rem',
                          textAlign: 'left',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span style={{ fontSize: '0.85rem' }}>{sub.icon}</span>
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer" style={{ padding: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {isLoggedIn ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ background: isTeacher ? '#fffbeb' : '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: isTeacher ? '1px solid #fde68a' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ overflow: 'hidden', flex: 1, marginRight: '6px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isTeacher ? '#92400e' : '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {isTeacher ? '⭐ ' : '👤 '}{student.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: isTeacher ? '#b45309' : '#64748b', fontWeight: isTeacher ? 700 : 500 }}>
                  {isTeacher ? 'Pengajar (Akses Monitoring)' : `Absen ${student.studentNumber} • ${student.className}`}
                </div>
              </div>
              <button
                onClick={() => openLoginModal()}
                style={{
                  background: isTeacher ? 'rgba(245, 158, 11, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                  border: 'none',
                  color: isTeacher ? '#b45309' : '#0284c7',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                title="Ganti Identitas Pengguna"
              >
                Ganti
              </button>
            </div>

            <button
              onClick={() => {
                if (window.confirm("Apakah Anda yakin ingin keluar (Logout)? Sesi Anda akan ditutup.")) {
                  logout();
                  if (typeof onLogout === 'function') onLogout();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
                transition: 'all 0.15s'
              }}
              title="Logout dari akun ini"
            >
              <span>🚪</span>
              <span>Keluar (Logout)</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => openLoginModal()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
            }}
          >
            <span>🔑</span>
            <span>Masuk / Login Siswa</span>
          </button>
        )}

        <button 
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            background: 'transparent',
            color: 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.82rem'
          }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

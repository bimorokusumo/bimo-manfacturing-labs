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
    ...(isTeacher ? [{ id: 'gradebook', label: 'Lihat Rekap Spreadsheet', badge: 'Spreadsheet', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }] : []),
  ];

  const handleMenuClick = (id) => {
    setActiveMenu(id);
    if (closeSidebar && (window.innerHeight < 600 || window.innerWidth < 1024)) {
      closeSidebar();
    }
  };

  // Sub-menu interaktif untuk masing-masing lab di sidebar, termasuk Tes Diagnostik (10 Soal Pilgan)
  const LAB_SUBMENUS = {
    machine: [
      { id: 'machine', label: 'Praktik Mesin Bubut & CNC', icon: '⚙️' },
      { id: 'machine-diagnostic', label: 'Tes Diagnostik Machine Lab', icon: '📋', isDiag: true }
    ],
    'cutting-tools': [
      { id: 'cutting-tools', label: 'Galeri & Kalkulator RPM', icon: '🔪' },
      { id: 'cutting-tools-diagnostic', label: 'Tes Diagnostik Alat Potong', icon: '📋', isDiag: true }
    ],
    'heat-treatment': [
      { id: 'heat-treatment-hardening', label: 'Hardening (Pengerasan)', icon: '⚡' },
      { id: 'heat-treatment-quenching', label: 'Quenching (Media Dingin)', icon: '💧' },
      { id: 'heat-treatment-tempering', label: 'Tempering (Penormalan)', icon: '🌡️' },
      { id: 'heat-treatment-annealing', label: 'Annealing (Pelunakan)', icon: '🧘' },
      { id: 'heat-treatment-normalizing', label: 'Normalizing (Penyeragaman)', icon: '🌱' },
      { id: 'heat-treatment-case-hardening', label: 'Case Hardening (Kulit)', icon: '🛡️' },
      { id: 'heat-treatment-blackening', label: 'Blackening (Black Oxide)', icon: '⚗️' },
      { id: 'heat-treatment-diagnostic', label: 'Tes Diagnostik Heat Treatment', icon: '📋', isDiag: true }
    ],
    mechanics: [
      { id: 'mechanics-torque', label: 'Momen Gaya & Torsi', icon: '🔧' },
      { id: 'mechanics-lever', label: 'Sistem Tuas (Pengungkit)', icon: '🕹️' },
      { id: 'mechanics-equilibrium', label: 'Kesetimbangan Tumpuan', icon: '⚖️' },
      { id: 'mechanics-stress', label: 'Tegangan & Regangan', icon: '📏' },
      { id: 'mechanics-pulley', label: 'Katrol & Chain Block', icon: '🏗️' },
      { id: 'mechanics-friction', label: 'Gesekan & Bidang Miring', icon: '📐' },
      { id: 'mechanics-calculator', label: 'Kalkulator Rumus Pintar', icon: '🧮' },
      { id: 'mechanics-diagnostic', label: 'Tes Diagnostik Mekanika', icon: '📋', isDiag: true }
    ],
    welding: [
      { id: 'welding', label: 'Simulator Las SMAW', icon: '⚡' },
      { id: 'welding-diagnostic', label: 'Tes Diagnostik Welding Lab', icon: '📋', isDiag: true }
    ],
    measuring: [
      { id: 'measuring', label: 'Simulator Kaliper & Mikrometer', icon: '📏' },
      { id: 'measuring-diagnostic', label: 'Tes Diagnostik Alat Ukur', icon: '📋', isDiag: true }
    ],
    design: [
      { id: 'design', label: 'Studio CAD & Gambar Teknik', icon: '📐' },
      { id: 'design-diagnostic', label: 'Tes Diagnostik Design Lab', icon: '📋', isDiag: true }
    ],
    safety: [
      { id: 'safety', label: 'Game & Simulasi K3LH / 5R', icon: '🛡️' },
      { id: 'safety-diagnostic', label: 'Tes Diagnostik Safety K3', icon: '📋', isDiag: true }
    ],
    'virtual-bengkel': [
      { id: 'virtual-bengkel', label: 'Eksplorasi Workshop 3D', icon: '🏭' },
      { id: 'virtual-bengkel-diagnostic', label: 'Tes Diagnostik Bengkel 3D', icon: '📋', isDiag: true }
    ]
  };

  const isLabActive = (menuId) => {
    if (activeMenu === menuId) return true;
    if (activeMenu === `${menuId}-diagnostic`) return true;
    if (menuId === 'heat-treatment' && activeMenu.startsWith('heat-treatment-')) return true;
    if (menuId === 'mechanics' && activeMenu.startsWith('mechanics-')) return true;
    return false;
  };

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
      {/* BRAND TEXT & MOBILE CLOSE BUTTON */}
      <div className="sidebar-brand" style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
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
            marginTop: '3px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}>
            Virtual Manufacturing Lab
          </div>
        </div>

        <button
          onClick={closeSidebar}
          className="sidebar-close-btn"
          style={{
            background: 'rgba(0,0,0,0.06)',
            border: 'none',
            borderRadius: '8px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            color: '#475569',
            cursor: 'pointer'
          }}
          title="Tutup Menu"
        >
          ✕
        </button>
      </div>

      {/* MENUS */}
      {/* MENUS */}
      <div className="sidebar-menu-list" style={{ padding: '20px 12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menus.map(menu => {
          const hasSubmenus = !!LAB_SUBMENUS[menu.id];
          const isCurrentActive = isLabActive(menu.id) || activeMenu === menu.id;

          // Theme accent colors for labs
          const isMechanics = menu.id === 'mechanics';
          const isHeatTreatment = menu.id === 'heat-treatment';
          const activeBg = isMechanics ? 'rgba(2, 132, 199, 0.12)' : (isHeatTreatment ? 'rgba(245, 158, 11, 0.12)' : 'rgba(37, 99, 235, 0.1)');
          const activeColor = isMechanics ? '#0284c7' : (isHeatTreatment ? '#b45309' : '#1d4ed8');
          const activeBorder = isMechanics ? '3px solid #0284c7' : (isHeatTreatment ? '3px solid #f59e0b' : '3px solid #2563eb');

          return (
            <React.Fragment key={menu.id}>
              <button
                className="sidebar-menu-btn"
                onClick={() => handleMenuClick(menu.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  background: isCurrentActive ? activeBg : 'transparent',
                  color: isCurrentActive ? activeColor : '#334155',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isCurrentActive ? 700 : 600,
                  fontSize: '0.88rem',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  borderLeft: isCurrentActive ? activeBorder : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menu.icon}></path>
                  </svg>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{menu.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {menu.badge && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      background: menu.id === 'gradebook' ? '#059669' : '#64748b',
                      color: '#ffffff'
                    }}>
                      {menu.badge}
                    </span>
                  )}
                  {hasSubmenus && (
                    <span style={{
                      fontSize: '0.68rem',
                      color: isCurrentActive ? activeColor : '#94a3b8',
                      fontWeight: 800
                    }}>
                      {isCurrentActive ? '▼' : '▶'}
                    </span>
                  )}
                </div>
              </button>

              {/* Submenus for this Lab (including its 10-soal diagnostic test) */}
              {hasSubmenus && isCurrentActive && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  paddingLeft: '24px',
                  marginTop: '2px',
                  marginBottom: '8px',
                  borderLeft: `2px dashed ${isMechanics ? 'rgba(2, 132, 199, 0.35)' : (isHeatTreatment ? 'rgba(245, 158, 11, 0.35)' : 'rgba(37, 99, 235, 0.3)')}`,
                  marginLeft: '20px'
                }}>
                  {LAB_SUBMENUS[menu.id].map(sub => {
                    const isSubActive = activeMenu === sub.id;

                    if (sub.isDiag) {
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleMenuClick(sub.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            background: isSubActive ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.06)',
                            color: isSubActive ? '#1d4ed8' : '#2563eb',
                            border: isSubActive ? '1px solid #93c5fd' : '1px dashed rgba(37, 99, 235, 0.25)',
                            cursor: 'pointer',
                            fontWeight: isSubActive ? 800 : 700,
                            fontSize: '0.78rem',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                            marginTop: '2px'
                          }}
                          title={`Asesmen Diagnostik Awal untuk ${menu.label} (10 Soal Pilgan)`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                            <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{sub.icon}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.label}</span>
                          </div>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '10px',
                            background: isSubActive ? '#2563eb' : '#dbeafe',
                            color: isSubActive ? '#ffffff' : '#1e40af',
                            flexShrink: 0
                          }}>
                            10 Soal
                          </span>
                        </button>
                      );
                    }

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
                          background: isSubActive ? (isMechanics ? '#e0f2fe' : (isHeatTreatment ? '#ffedd5' : '#f1f5f9')) : 'transparent',
                          color: isSubActive ? (isMechanics ? '#0369a1' : (isHeatTreatment ? '#c2410c' : '#0f172a')) : '#475569',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: isSubActive ? 800 : 500,
                          fontSize: '0.78rem',
                          textAlign: 'left',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span style={{ fontSize: '0.85rem' }}>{sub.icon}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.label}</span>
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

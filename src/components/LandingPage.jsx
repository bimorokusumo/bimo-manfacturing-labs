import React from 'react';
import { useStudent } from '../context/StudentContext';

const LandingPage = ({ onStart, onOpenGradebook, onOpenLogin }) => {
  const { student, isLoggedIn, openLoginModal, logout, isTeacher } = useStudent();

  const handleLoginClick = () => {
    if (typeof onOpenLogin === 'function') {
      onOpenLogin();
    } else if (typeof openLoginModal === 'function') {
      openLoginModal();
    }
  };
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a', // deep slate dark background
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      {/* INJECTED CSS FOR ANIMATIONS & EFFECTS */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
            50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.8); }
            100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
          }
          .landing-nav-link {
            position: relative;
            color: #cbd5e1;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
            transition: color 0.3s ease;
          }
          .landing-nav-link:hover {
            color: #f59e0b;
          }
          .landing-nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -6px;
            left: 0;
            background-color: #f59e0b;
            transition: width 0.3s ease;
          }
          .landing-nav-link:hover::after {
            width: 100%;
          }
          .feature-card {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 12px;
            border-radius: 12px;
            transition: all 0.3s ease;
            cursor: default;
          }
          .feature-card:hover {
            background: rgba(255,255,255,0.05);
            transform: translateY(-5px);
          }
        `}
      </style>

      {/* HEADER NAV */}
      <header 
        className="landing-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 60px',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 20,
          boxSizing: 'border-box'
        }}
      >
        {/* BRAND TEXT */}
        <div style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{ 
            fontWeight: 900, 
            fontSize: '1.5rem', 
            letterSpacing: '2px', 
            fontFamily: "'Chakra Petch', sans-serif",
            lineHeight: 1.1
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900
            }}>BIMO</span>
          </div>
          <div style={{ 
            fontSize: '0.72rem', 
            color: '#cbd5e1', 
            letterSpacing: '0.8px', 
            textTransform: 'uppercase', 
            fontWeight: 700, 
            marginTop: '3px' 
          }}>
            Virtual Manufacturing Lab
          </div>
        </div>

        {/* NAV LINKS */}
        <nav className="landing-nav" style={{ display: 'flex', gap: '40px' }}>
          <a href="#" className="landing-nav-link" style={{ color: '#f59e0b' }}>Beranda</a>
          <a href="#" className="landing-nav-link" onClick={(e) => { e.preventDefault(); alert("Fitur: Modul Interaktif, Simulasi 3D, Safety Lab."); }}>Fitur</a>
          <a href="#" className="landing-nav-link" onClick={(e) => { e.preventDefault(); onStart(); }}>Perpustakaan & Modul</a>
          <a href="#" className="landing-nav-link" onClick={(e) => e.preventDefault()}>Tentang</a>
        </nav>

        {/* LOGIN BUTTONS */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={handleLoginClick}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(2, 132, 199, 0.2)',
                  border: '1px solid #0284c7',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Klik untuk Edit Identitas / Ganti Siswa"
              >
                <span>👤 {student.name} (Absen: {student.studentNumber})</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Apakah Anda yakin ingin keluar (Logout)?")) {
                    logout();
                  }
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s'
                }}
                title="Keluar / Logout Akun"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              style={{ 
                padding: '10px 22px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                border: 'none', 
                color: '#fff', 
                fontWeight: 800, 
                fontSize: '0.88rem', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🔑</span>
              <span>Masuk / Login</span>
            </button>
          )}

          {isTeacher ? (
            <button
              onClick={onOpenGradebook}
              style={{ 
                padding: '10px 22px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, #10b981, #059669)', 
                border: 'none', 
                color: '#fff', 
                fontWeight: 800, 
                fontSize: '0.88rem', 
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                transition: 'transform 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
              title="Buka Lembar Rekap Spreadsheet Nilai Siswa"
            >
              <span>📊</span>
              <span>Rekap Lab</span>
            </button>
          ) : (
            <button
              onClick={onOpenGradebook}
              style={{ 
                padding: '9px 18px', 
                borderRadius: '8px', 
                background: 'rgba(16, 185, 129, 0.12)', 
                border: '1.5px solid #10b981', 
                color: '#10b981', 
                fontWeight: 800, 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Akses Lembar Rekap Spreadsheet Guru"
            >
              <span>📊</span>
              <span>Rekap Lab</span>
            </button>
          )}

          {/* LINK LANGSUNG KE GOOGLE SPREADSHEET ONLINE */}
          <a
            href="https://docs.google.com/spreadsheets/d/1-YH8PCzHIUv1B8I1dCj_XmcQ2c-jyAavPQfWGHYCUT4/edit?hl=id&gid=1804603706#gid=1804603706"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
            title="Buka Langsung Google Spreadsheet Nilai Siswa (SMKN 2 Depok) di Tab Baru"
          >
            <span>↗️</span>
            <span>Buka Google Sheets</span>
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <div 
        className="landing-hero"
        style={{
          position: 'relative',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '0 80px',
          boxSizing: 'border-box'
        }}
      >
        {/* HERO BACKGROUND IMAGE */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '65%',
          height: '100%',
          backgroundColor: '#0f172a',
          backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(245, 158, 11, 0.12) 0%, transparent 60%), url("https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=720&q=65")', // Optimized lightweight industrial image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          filter: 'contrast(1.08) brightness(0.9)'
        }}>
          {/* Dark Fade Gradient Overlay to blend with background color */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(90deg, #0f172a 0%, rgba(15,23,42,0.85) 30%, rgba(15,23,42,0) 100%)'
          }}></div>
        </div>

        {/* HERO CONTENT */}
        <div style={{ position: 'relative', zIndex: 15, maxWidth: '700px', marginTop: '20px', pointerEvents: 'auto' }}>
          
          {/* Badge */}
          <div style={{ 
            display: 'inline-block', 
            padding: '8px 16px', 
            background: 'rgba(245, 158, 11, 0.15)', 
            border: '1px solid rgba(245, 158, 11, 0.3)', 
            borderRadius: '20px', 
            color: '#fcd34d', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            letterSpacing: '1.5px',
            marginBottom: '24px',
            backdropFilter: 'blur(5px)'
          }}>
            🌟 PLATFORM EDUKASI INDUSTRI 4.0
          </div>

          <h1 style={{ 
            fontFamily: "'Chakra Petch', sans-serif", 
            fontSize: '4.8rem', 
            fontWeight: 900, 
            lineHeight: 1.05, 
            color: '#fff', 
            marginBottom: '24px', 
            textTransform: 'uppercase',
            textShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            BIMO<br/>
            <span style={{ 
              background: 'linear-gradient(90deg, #f59e0b, #38bdf8)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              fontSize: '3.6rem'
            }}>VIRTUAL</span><br/>
            <span style={{ fontSize: '3.6rem' }}>MANUFACTURING LAB</span>
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: 1.7, marginBottom: '45px', maxWidth: '540px', fontWeight: 400 }}>
            Tingkatkan kompetensi permesinan melalui simulasi 3D interaktif, modul cerdas bersuara, dan simulasi Keselamatan Kerja yang sangat realistis.
          </p>

          <div style={{ display: 'flex', gap: '24px' }}>
            <button 
              onClick={onStart}
              style={{
                padding: '18px 40px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Chakra Petch', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                animation: 'pulseGlow 2s infinite',
                transition: 'transform 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            >
              MULAI SEKARANG
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button style={{
              padding: '18px 40px',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Chakra Petch', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseOut={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              LIHAT CARA KERJA
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING FEATURE BAR */}
      <div style={{
        position: 'absolute',
        bottom: '50px',
        left: '80px',
        right: '80px',
        background: 'rgba(30, 41, 59, 0.65)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        borderRadius: '24px',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        zIndex: 10,
        animation: 'float 6s ease-in-out infinite'
      }}>
        
        {/* Feature 1 */}
        <div className="feature-card">
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '14px', 
            background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05rem', marginBottom: '6px' }}>Belajar Interaktif</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.85rem', maxWidth: '200px', lineHeight: 1.4 }}>Modul ajar dilengkapi fitur Text-to-Speech otomatis</div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="feature-card">
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '14px', 
            background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05rem', marginBottom: '6px' }}>Simulasi Realistis</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.85rem', maxWidth: '200px', lineHeight: 1.4 }}>Pengalaman 3D permesinan layaknya di bengkel nyata</div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature-card">
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '14px', 
            background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05rem', marginBottom: '6px' }}>Safety Lab (K3)</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.85rem', maxWidth: '200px', lineHeight: 1.4 }}>Simulasi pemilihan APD pintar berbasis jenis pekerjaan</div>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="feature-card">
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '14px', 
            background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.05rem', marginBottom: '6px' }}>Tantangan Gamifikasi</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.85rem', maxWidth: '200px', lineHeight: 1.4 }}>Raih XP, naik level, dan dapatkan badge prestasi bergengsi</div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LandingPage;

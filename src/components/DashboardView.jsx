import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const LABS_CONFIG = [
  {
    id: 'virtual-bengkel',
    title: 'Virtual Bengkel 3D',
    category: '3D INTERAKTIF',
    desc: 'Eksplorasi virtual interaktif mesin bubut, milling, gerinda, dan tata letak workshop standar industri manufaktur.',
    image: '/assets/images/labs/virtual_bengkel.jpg',
    badgeBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    badgeColor: '#ffffff',
    accentColor: '#d97706',
    chips: ['Eksplorasi 360°', 'Mesin 3D Realistis']
  },
  {
    id: 'machine',
    title: 'Machine Lab',
    category: 'PEMESINAN CNC',
    desc: 'Simulasi pengoperasian mesin bubut konvensional, penentuan parameter sayat (RPM & feed), dan pengenalan CNC.',
    image: '/assets/images/lathe.png',
    badgeBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    badgeColor: '#ffffff',
    accentColor: '#2563eb',
    chips: ['Bubut & Frais', 'Parameter Sayat']
  },
  {
    id: 'cutting-tools',
    title: 'Alat Pemotong',
    category: 'FABRIKASI',
    desc: 'Ensiklopedia foto asli 9 alat pemotong, kalkulator putaran spindel bor, anatomi komponen, dan SOP K3.',
    image: '/assets/images/labs/cutting_tools_lab.jpg',
    badgeBg: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    badgeColor: '#ffffff',
    accentColor: '#ea580c',
    chips: ['Foto Asli 9 Alat', 'Kalkulator RPM Bor']
  },
  {
    id: 'heat-treatment',
    title: 'Heat Treatment Lab',
    category: 'TERMAL & FINISHING',
    desc: 'Simulasi interaktif 7-bak blackening (black oxide 0.000 mm toleransi), siklus hardening, tempering, annealing, normalizing, dan uji percikan baja.',
    image: '/assets/images/heat_treatment/quench_fire_glow.jpg',
    badgeBg: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
    badgeColor: '#ffffff',
    accentColor: '#ea580c',
    chips: ['Simulasi 7-Bak Blackening', 'Hardening & Tempering']
  },
  {
    id: 'mechanics',
    title: 'Mekanika Teknik Studio',
    category: 'STATIKA & FISIKA TERAPAN',
    desc: 'Simulasi interaktif Momen Gaya & Torsi kunci pas baut, Sistem Tuas 3 Kelas, Kesetimbangan Tumpuan Balok, Tegangan-Regangan Uji Tarik, dan Katrol Chain Block.',
    image: '/assets/images/mechanics/torque_wrench_infographic.svg',
    badgeBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    badgeColor: '#ffffff',
    accentColor: '#0284c7',
    chips: ['Momen Gaya Kunci Baut', 'Tuas, Tumpuan & Katrol']
  },
  {
    id: 'welding',
    title: 'Welding Lab',
    category: 'SIMULASI SMAW',
    desc: 'Praktik simulator pengelasan busur listrik SMAW, pengaturan arus ampere, sudut elektroda, dan inspeksi cacat las.',
    image: '/assets/images/labs/welding_lab.jpg',
    badgeBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    badgeColor: '#ffffff',
    accentColor: '#dc2626',
    chips: ['Busur Las Realistis', 'Inspeksi Cacat']
  },
  {
    id: 'measuring',
    title: 'Alat Ukur Presisi',
    category: 'METROLOGI',
    desc: 'Pelatihan membaca jangka sorong skala 0.05 & 0.02 mm, dial caliper, mikrometer sekrup 0.01 mm, dan height gauge.',
    image: '/assets/images/labs/measuring_lab.jpg',
    badgeBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    badgeColor: '#ffffff',
    accentColor: '#059669',
    chips: ['Ketelitian 0.01 mm', 'Latihan Interaktif']
  },
  {
    id: 'design',
    title: 'Design & CAD Lab',
    category: 'CAD & GAMTEK',
    desc: 'CAD Studio 2D/3D (Extrude, Revolve, Sweep, Fillet) serta simulator proyeksi ortogonal Amerika & Eropa.',
    image: '/assets/images/labs/design_lab.jpg',
    badgeBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    badgeColor: '#ffffff',
    accentColor: '#7c3aed',
    chips: ['CAD 3D Studio', 'Proyeksi Multi-View']
  },
  {
    id: 'safety',
    title: 'Safety Lab (K3)',
    category: 'K3 & BUDAYA KERJA',
    desc: 'Uji kompetensi pemilihan APD bengkel pemesinan, identifikasi potensi bahaya kerja, dan budaya 5S industri.',
    image: '/assets/images/labs/safety_lab.jpg',
    badgeBg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    badgeColor: '#ffffff',
    accentColor: '#0891b2',
    chips: ['Simulasi APD', 'Standar 5S & K3']
  },
  {
    id: 'modules',
    title: 'Perpustakaan & Modul',
    category: '3D FLIPBOOK',
    desc: 'Buku teks digital dan modul ajar TFLM & Teknik Pemesinan SMK dengan navigasi lembar halaman interaktif 3D.',
    image: '/assets/images/labs/library_modul.jpg',
    badgeBg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    badgeColor: '#ffffff',
    accentColor: '#d97706',
    chips: ['Kurikulum SMK', 'Buku 3D Interaktif']
  }
];

const DashboardView = ({ 
  onSelectLab, 
  globalXP = 0, 
  levelInfo = { level: 1, title: 'Apprentice', nextLevelXP: 500, xpInCurrentLevel: 0, xpNeededForNextLevel: 500 }, 
  completedMissions = 0, 
  totalMissions = 18 
}) => {
  const missionPct = Math.round((completedMissions / Math.max(1, totalMissions)) * 100);
  const xpPct = Math.min(100, Math.round((levelInfo.xpInCurrentLevel / (levelInfo.xpNeededForNextLevel || 500)) * 100));

  const { speakText, stopSpeech, isSpeaking, currentNarrativeTitle } = useAccessibility();

  const isSpeakingAllLabs = isSpeaking && currentNarrativeTitle === 'Ringkasan Laboratorium';

  const handleSpeakAllLabs = () => {
    const title = 'Ringkasan Laboratorium';
    if (isSpeaking && currentNarrativeTitle === title) {
      stopSpeech();
    } else {
      speakText(
        'Selamat datang di Virtual Manufacturing Lab. Anda memiliki 8 modul laboratorium pembelajaran: Satu, Virtual Bengkel 3D untuk eksplorasi mesin bubut dan frais interaktif. Dua, Lab Pemesinan Mesin Bubut dan Frais. Tiga, Lab Pengelasan Listrik. Empat, Lab Alat Ukur Presisi Metrologi. Lima, Ensiklopedia Alat Pemotong Pemesinan dengan foto asli industri. Enam, Desain dan CAD Lab 2D dan 3D. Tujuh, Safety Lab K3. Delapan, Perpustakaan Modul 3D. Silakan klik laboratorium yang ingin Anda pelajari.',
        title
      );
    }
  };

  const handleSpeakLab = (e, lab) => {
    e.stopPropagation();
    const title = `Lab: ${lab.title}`;
    if (isSpeaking && currentNarrativeTitle === title) {
      stopSpeech();
    } else {
      const text = `Laboratorium ${lab.title}. Kategori materi: ${lab.category}. ${lab.desc}. Fitur materi yang dapat Anda pelajari meliputi: ${lab.chips.join(', ')}. Klik kartu ini untuk mulai belajar di laboratorium.`;
      speakText(text, title);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', maxWidth: '100%' }}>
      
      {/* STATS ROW */}
      <div className="dashboard-stats-grid">
        
        {/* Level Card */}
        <div className="dashboard-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            LEVEL KOMPETENSI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stat-value" style={{ color: 'var(--game-primary)', fontSize: '2.4rem', fontWeight: 900, lineHeight: 1 }}>
              {levelInfo.level.toString().padStart(2, '0')}
            </div>
            <div>
              <div style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.2 }}>
                {levelInfo.title}
              </div>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.74rem', marginTop: '3px' }}>
                Tingkat {levelInfo.level} dari 10
              </div>
            </div>
          </div>
          <div style={{ height: '5px', width: '100%', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '2px' }}>
            <div style={{ height: '100%', width: `${(levelInfo.level / 10) * 100}%`, background: 'var(--game-primary)', borderRadius: '3px' }} />
          </div>
        </div>

        {/* XP Card */}
        <div className="dashboard-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            TOTAL PENGALAMAN (XP)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>💰</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="stat-value" style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {globalXP.toLocaleString('id-ID')}
                <span style={{ fontSize: '0.95rem', color: 'var(--text-subtle)', fontWeight: 700, marginLeft: '6px' }}>
                  / {levelInfo.nextLevelXP.toLocaleString('id-ID')}
                </span>
              </div>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.74rem', marginTop: '3px' }}>
                +{levelInfo.xpInCurrentLevel} XP di level ini ({xpPct}%)
              </div>
            </div>
          </div>
          <div style={{ height: '5px', width: '100%', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '2px' }}>
            <div style={{ height: '100%', width: `${xpPct}%`, background: '#3b82f6', borderRadius: '3px' }} />
          </div>
        </div>

        {/* Badge Card */}
        <div className="dashboard-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            LENCANA PRESTASI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>⭐</div>
            <div>
              <div className="stat-value" style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 900, lineHeight: 1 }}>
                12 <span style={{ fontSize: '0.95rem', color: 'var(--text-subtle)', fontWeight: 700 }}>Badge</span>
              </div>
              <div style={{ color: '#10b981', fontSize: '0.74rem', fontWeight: 700, marginTop: '3px' }}>
                ✓ Terverifikasi Bengkel
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>Safety</span>
            <span style={{ fontSize: '0.68rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>Bubut</span>
            <span style={{ fontSize: '0.68rem', background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>Las</span>
          </div>
        </div>

        {/* Misi Card */}
        <div className="dashboard-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="stat-label" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            MISI PRAKTIK SELESAI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>🎯</div>
            <div>
              <div className="stat-value" style={{ color: 'var(--text-main)', fontSize: '1.75rem', fontWeight: 900, lineHeight: 1 }}>
                {completedMissions} <span style={{ fontSize: '1.1rem', color: 'var(--text-subtle)', fontWeight: 700 }}>/ {totalMissions}</span>
              </div>
              <div style={{ color: missionPct > 0 ? '#10b981' : 'var(--text-subtle)', fontSize: '0.74rem', fontWeight: 700, marginTop: '3px' }}>
                {missionPct}% Target Misi
              </div>
            </div>
          </div>
          <div style={{ height: '5px', width: '100%', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '2px' }}>
            <div style={{ height: '100%', width: `${missionPct}%`, background: '#10b981', borderRadius: '3px' }} />
          </div>
        </div>

      </div>

      {/* PILIH LAB SECTION (CARDS DIBESARKAN AGAR TIDAK ADA RUANG KOSONG) */}
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '0.5px' }}>
              PILIH LABORATORIUM PEMBELAJARAN
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              8 Modul Simulasi Interaktif & Bengkel Virtual SMK Teknik Mesin & Fabrikasi Logam
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleSpeakAllLabs}
              style={{
                background: isSpeakingAllLabs ? '#fff7ed' : '#ffffff',
                border: isSpeakingAllLabs ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                color: isSpeakingAllLabs ? '#c2410c' : '#475569',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isSpeakingAllLabs ? '0 2px 8px rgba(245, 158, 11, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
              title="Dengarkan Pengenalan Suara Seluruh Laboratorium"
            >
              <span>{isSpeakingAllLabs ? '⏹️' : '🔊'}</span>
              <span>{isSpeakingAllLabs ? 'Hentikan Suara' : 'Dengarkan Ringkasan Lab'}</span>
            </button>

            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              8 Laboratorium Tersedia
            </span>
          </div>
        </div>

        {/* 4 Kolom Penuh di Desktop, 2 Kolom di Tablet, 4 Kolom Teratur di HP Landscape */}
        <div className="dashboard-labs-grid">
          {LABS_CONFIG.map((lab) => {
            const isSpeakingThisLab = isSpeaking && currentNarrativeTitle === `Lab: ${lab.title}`;
            return (
              <div 
                key={lab.id}
                onClick={() => onSelectLab(lab.id)}
                className="dashboard-lab-card"
                style={{
                  border: isSpeakingThisLab ? '2px solid #f59e0b' : undefined,
                  boxShadow: isSpeakingThisLab ? '0 8px 24px rgba(245, 158, 11, 0.25)' : undefined
                }}
              >
                {/* Gambar Cover Lab */}
                <div className="dashboard-lab-card-img">
                  <img 
                    src={lab.image} 
                    alt={lab.title} 
                  />
                  <div className="dashboard-lab-card-overlay" />
                  <span 
                    className="dashboard-lab-card-badge"
                    style={{ 
                      background: lab.badgeBg, 
                      color: lab.badgeColor 
                    }}
                  >
                    {lab.category}
                  </span>

                  {/* Tombol Dengarkan Suara Lab Ini */}
                  <button
                    onClick={(e) => handleSpeakLab(e, lab)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 4,
                      background: isSpeakingThisLab ? '#ea580c' : 'rgba(15, 23, 42, 0.78)',
                      backdropFilter: 'blur(6px)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      color: '#ffffff',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Dengarkan penjelasan suara materi ${lab.title}`}
                  >
                    <span style={{ fontSize: '13px' }}>{isSpeakingThisLab ? '⏹️' : '🔊'}</span>
                  </button>
                </div>

              {/* Badan Kartu */}
              <div className="dashboard-lab-card-body">
                <div>
                  <h4>
                    {lab.title}
                  </h4>
                  <p>
                    {lab.desc}
                  </p>
                </div>

                {/* Fitur Chips */}
                <div className="dashboard-lab-card-tags">
                  {lab.chips.map((chip, cIdx) => (
                    <span key={cIdx}>
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Tombol Footer */}
                <div className="dashboard-lab-card-footer">
                  <span style={{ color: lab.accentColor }}>
                    Buka Laboratorium
                  </span>
                  <span className="dashboard-lab-card-arrow" style={{ color: lab.accentColor }}>
                    →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* MIDDLE ROW (Profil Siswa, Badges/Aktivitas, Leaderboard Kelas) */}
      <div className="dashboard-middle-grid">
        
        {/* PROFIL SISWA */}
        <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
            PROFIL SISWA
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f59e0b', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}>
              <img src="https://ui-avatars.com/api/?name=Siswa&background=f59e0b&color=fff&bold=true" alt="Avatar" style={{ width: '100%', height: '100%' }} />
            </div>
            <div>
              <div style={{ color: 'var(--text-main)', fontWeight: 900, fontSize: '1.15rem' }}>Siswa</div>
              <div style={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 700 }}>Kelas X TPM • SMK Negeri</div>
              <span style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, display: 'inline-block', marginTop: '4px' }}>
                ● Sedang Aktif Belajar
              </span>
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
              TINGKAT PENGUASAAN
            </div>
            <div style={{ color: 'var(--game-primary)', fontSize: '2.2rem', fontWeight: 900, lineHeight: 1, marginBottom: '4px' }}>
              {levelInfo.level.toString().padStart(2, '0')}
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 800, marginBottom: '14px' }}>
              {levelInfo.title}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 800 }}>
                XP: {globalXP.toLocaleString('id-ID')} <span style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>/ {levelInfo.nextLevelXP.toLocaleString('id-ID')}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 800 }}>{xpPct}%</span>
            </div>
            <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg, #f59e0b, #ea580c)', borderRadius: '4px' }} />
            </div>

            <button style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1.5px solid #cbd5e1', color: '#0f172a', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.82rem' }}>
              Lihat Rapor Kompetensi
            </button>
          </div>
        </div>

        {/* CENTER COLUMN: ACTIVITIES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* AKTIVITAS TERAKHIR */}
          <div className="dashboard-card" style={{ padding: '24px', flex: 1 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '18px', margin: 0 }}>
              AKTIVITAS TERAKHIR
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 900 }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-main)', fontSize: '0.86rem', fontWeight: 800 }}>Simulasi Pengenalan Alat Pemotong</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Kuis evaluasi 10 soal modul KD 3.4</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#ea580c', fontWeight: 900, fontSize: '0.86rem' }}>+1.000 XP</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Baru saja</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 900 }}>
                    📐
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-main)', fontSize: '0.86rem', fontWeight: 800 }}>Proyeksi Ortogonal Multi-View</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Perbandingan Kuadran I (Eropa) & III (Amerika)</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--game-primary)', fontWeight: 900, fontSize: '0.86rem' }}>+200 XP</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>1 jam lalu</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 900 }}>
                    🛡️
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-main)', fontSize: '0.86rem', fontWeight: 800 }}>Misi Inspeksi Keselamatan K3</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Kelulusan pemilihan APD bengkel bubut</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--game-primary)', fontWeight: 900, fontSize: '0.86rem' }}>+150 XP</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>3 jam lalu</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LEADERBOARD KELAS */}
        <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
              LEADERBOARD KELAS
            </h3>
            <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              X TPM 1
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {[
              { rank: 1, name: 'Siswa (Anda)', xp: (2450 + globalXP).toLocaleString('id-ID'), active: true, badge: '🥇' },
              { rank: 2, name: 'Budi Santoso', xp: '2.210', badge: '🥈' },
              { rank: 3, name: 'Siti Aisyah', xp: '2.050', badge: '🥉' },
              { rank: 4, name: 'Raka Maulana', xp: '1.980', badge: '4' },
              { rank: 5, name: 'Dika Pratama', xp: '1.750', badge: '5' }
            ].map((u, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  background: u.active ? '#fff7ed' : '#ffffff', 
                  padding: '10px 12px', 
                  borderRadius: '10px', 
                  border: u.active ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                  boxShadow: u.active ? '0 2px 8px rgba(234, 88, 12, 0.12)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '24px', 
                    textAlign: 'center', 
                    fontWeight: 900, 
                    fontSize: u.rank <= 3 ? '1.1rem' : '0.85rem',
                    color: u.rank === 1 ? '#d97706' : u.rank === 2 ? '#64748b' : u.rank === 3 ? '#b45309' : '#94a3b8'
                  }}>
                    {u.badge}
                  </div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name.split(' ')[0])}&background=${u.active ? 'ea580c' : '64748b'}&color=fff&bold=true`} alt={u.name} style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div style={{ color: u.active ? '#ea580c' : 'var(--text-main)', fontSize: '0.86rem', fontWeight: u.active ? 800 : 700 }}>
                    {u.name}
                  </div>
                </div>
                <div style={{ color: u.active ? '#c2410c' : 'var(--text-subtle)', fontSize: '0.82rem', fontWeight: 800 }}>
                  {u.xp} XP
                </div>
              </div>
            ))}
          </div>

          <button style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', border: 'none', color: '#ffffff', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', marginTop: '16px', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)' }}>
            Lihat Peringkat Sekolah Lengkap
          </button>
        </div>

      </div>

      {/* PROGRESS PEMBELAJARAN */}
      <div className="dashboard-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
              PROGRESS KOMPETENSI KURIKULUM
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
              Capaian Pembelajaran Elemen Gambar Teknik, Pemesinan, Fabrikasi, dan Keselamatan K3
            </p>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 800, background: '#f0fdf4', padding: '3px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
            Rata-rata Kelas: 57.5%
          </span>
        </div>
        
        <div className="dashboard-progress-grid">
          {[
            { title: 'K3 & Budaya Kerja Industri', pct: 85, color: '#10b981', note: 'SOP & APD Bengkel' },
            { title: 'Pemesinan Bubut & Frais', pct: 65, color: '#3b82f6', note: 'Cutting Speed & Tooling' },
            { title: 'Fabrikasi & Alat Pemotong', pct: 60, color: '#ea580c', note: 'Shearing & Tap Drilling' },
            { title: 'Gambar Teknik & CAD 3D', pct: 50, color: '#8b5cf6', note: 'Proyeksi & Pemodelan' }
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-main)', fontSize: '0.86rem', fontWeight: 800 }}>{item.title}</span>
                <span style={{ color: item.color, fontSize: '1.2rem', fontWeight: 900 }}>{item.pct}%</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '10px' }}>{item.note}</div>
              <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardView;

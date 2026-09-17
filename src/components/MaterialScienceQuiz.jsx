import React, { useState } from 'react';

const MaterialScienceQuiz = () => {
  const [selectedMaterial, setSelectedMaterial] = useState('baja');

  const materials = {
    baja: {
      name: 'Baja Karbon (Carbon Steel)',
      category: 'Logam Ferus',
      image: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      hardness: 'Tinggi (Hardness ~ 180 HB)',
      weldability: 'Sangat Baik (SMAW, MIG, TIG)',
      density: '7.85 g/cm³',
      applications: 'Poros penggerak mesin bubut, pelat struktur gedung, rangka kendaraan.',
      testResult: 'Baja memiliki kekuatan tarik tinggi & keuletan baik, namun mudah berkarat jika tidak dilapisi cat/oli.'
    },
    almunium: {
      name: 'Aluminium Alloy (Al-Mg-Si)',
      category: 'Logam Non-Ferus',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      hardness: 'Sedang (Hardness ~ 95 HB)',
      weldability: 'Khusus (GTAW / TIG AC)',
      density: '2.70 g/cm³',
      applications: 'Komponen pesawat terbang, blok mesin, rangka sepeda presisi.',
      testResult: 'Sangat Ringan (1/3 berat baja), tahan korosi alami karena lapisan Al₂O₃ pasif.'
    },
    kuningan: {
      name: 'Kuningan (Brass Cu-Zn)',
      category: 'Paduan Non-Ferus',
      image: 'https://images.unsplash.com/photo-1589792923962-537704632910?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      hardness: 'Sedang (Hardness ~ 120 HB)',
      weldability: 'Brazing / Patri Perak',
      density: '8.40 g/cm³',
      applications: 'Kran air presisi, bushing (bantalan luncur), komponen listrik.',
      testResult: 'Gesekan sangat rendah, warna keemasan estetis, dan tahan terhadap karat air laut.'
    },
    stainless: {
      name: 'Baja Tahan Karat (Stainless Steel 304)',
      category: 'Paduan Ferus (Fe-Cr-Ni)',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      hardness: 'Sangat Tinggi (Hardness ~ 210 HB)',
      weldability: 'Sangat Baik (TIG / MIG Stainless)',
      density: '8.00 g/cm³',
      applications: 'Tangki industri makanan/pharmaceutical, pipa kimia, alat bedah medis.',
      testResult: 'Tahan korosi ekstrem karena adanya kandungan Kromium minimal 18% & Nikel 8%.'
    }
  };

  const current = materials[selectedMaterial];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER BANNER */}
      <div style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#050a14',
        padding: '30px',
        color: 'var(--text-main)',
        border: '1px solid rgba(0,225,255,0.2)',
        boxShadow: '0 0 30px rgba(0, 225, 255, 0.1)'
      }}>
        <img 
          src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Material Metal" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, filter: 'grayscale(50%) contrast(150%)' }}
        />
        {/* GRID OVERLAY */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'linear-gradient(rgba(0, 225, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 225, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px', opacity: 0.5, pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span className="game-badge badge-purple" style={{ marginBottom: '10px' }}>
            LABORATORIUM MATERIAL SCIENCE
          </span>
          <h2 className="cyber-font" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            Pengujian Sifat & Karakteristik Bahan Manufaktur
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
            Pilih sampel logam untuk mengamati struktur fisik, massa jenis, dan kemampuan proses las/bubut:
          </p>
        </div>
      </div>

      {/* MATERIAL SELECTOR CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {Object.keys(materials).map(key => {
          const m = materials[key];
          const isSel = selectedMaterial === key;
          return (
            <div
              key={key}
              onClick={() => setSelectedMaterial(key)}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: isSel ? '1px solid var(--game-tp)' : '1px solid var(--border-light)',
                background: isSel ? 'rgba(0, 225, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSel ? '0 0 15px rgba(0,225,255,0.2)' : 'none'
              }}
            >
              <div style={{ height: '100px', overflow: 'hidden' }}>
                <img src={m.image} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSel ? 1 : 0.6 }} />
              </div>
              <div style={{ padding: '12px' }}>
                <div className="cyber-font" style={{ fontWeight: 700, fontSize: '0.9rem', color: isSel ? 'var(--game-tp)' : 'var(--text-main)' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                  {m.category}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED LAB TEST VIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* PROPERTIES */}
        <div className="game-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className="game-badge badge-blue">{current.category}</span>
            <span className="cyber-font" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--game-tp)', textShadow: '0 0 5px var(--game-tp)' }}>BSN/ISO VERIFIED</span>
          </div>

          <h3 className="cyber-font" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-main)' }}>
            {current.name}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Massa Jenis:</span>
              <span style={{ fontWeight: 700, color: 'var(--game-tp)', fontSize: '0.85rem' }}>{current.density}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tingkat Kekerasan:</span>
              <span style={{ fontWeight: 700, color: 'var(--game-tp)', fontSize: '0.85rem' }}>{current.hardness}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Kemampuan Pengelasan:</span>
              <span style={{ fontWeight: 700, color: 'var(--game-tp)', fontSize: '0.85rem' }}>{current.weldability}</span>
            </div>
          </div>

          <div>
            <div className="cyber-font" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-subtle)', marginBottom: '6px' }}>APLIKASI BENGKEL MANUFAKTUR:</div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.5 }}>
              {current.applications}
            </p>
          </div>
        </div>

        {/* METALLURGICAL TEST RESULTS */}
        <div className="game-card flex-center" style={{ flexDirection: 'column', textAlign: 'center', padding: '24px' }}>
          <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--game-tp)' }}>
            <img src={current.image} alt="Uji Sampel" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
          </div>

          <h4 className="cyber-font" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>METALLURGICAL LAB RESULTS</h4>
          
          <div style={{ background: 'rgba(0, 255, 102, 0.05)', borderLeft: '4px solid var(--game-success)', padding: '14px', borderRadius: '8px', color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem', lineHeight: 1.6, textAlign: 'left', width: '100%' }}>
            &gt; {current.testResult}
          </div>
        </div>

      </div>

    </div>
  );
};

export default MaterialScienceQuiz;

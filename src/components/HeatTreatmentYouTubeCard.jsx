import React, { useState, useEffect } from 'react';

// =============================================================================
// DATABASE VIDEO REFERENSI YOUTUBE RESMI PERLAKUAN PANAS (HEAT TREATMENT)
// Link YouTube sesuai referensi yang diberikan:
// 1. Hardening: https://youtu.be/D_zc1-SzBV4
// 2. Quenching: https://youtu.be/xihraKAokCs
// 3. Annealing: https://youtu.be/ucFnIilIMOs
// 4. Normalizing: https://youtu.be/Pf1MGZvxirE
// 5. Case Hardening: https://youtu.be/D_zc1-SzBV4
// 6. Blackening: https://youtu.be/0F3_qlpjqGM
// =============================================================================
export const YOUTUBE_REFS = {
  hardening: {
    title: 'Video Referensi Praktikum: Hardening (Pengerasan Baja)',
    subtitle: 'Pemanasan 900°C di Tungku & Proses Pengerasan (Ref: https://youtu.be/D_zc1-SzBV4)',
    videoId: 'D_zc1-SzBV4',
    altVideoId: 'xihraKAokCs', // Quenching by fork-lift furnace
    videoLabel: 'Video 1: Hardening & Pemanasan (D_zc1-SzBV4)',
    altLabel: 'Video 2: Quenching Industri (xihraKAokCs)',
    duration: 'Praktik Bengkel Nyata',
    channel: 'Workshop Heat Treatment & Metallurgy Reference',
    color: '#dc2626',
    keyPoints: [
      'Pemanasan benda kerja hingga mencapai suhu kritis austenit (~900°C) di dalam tungku / perapian tempa.',
      'Perubahan kisi kristal melarutkan atom karbon membentuk larutan padat Austenit yang siap dikunci.',
      'Pencelupan kilat (quench) ke media pendingin untuk membentuk fasa Martensit yang sangat keras (60-65 HRC).',
      'Pengujian kekerasan permukaan pasca pendinginan untuk membuktikan keberhasilan pengerasan.'
    ]
  },
  quenching: {
    title: 'Video Referensi Praktikum: Quenching Industri (Pendinginan Cepat)',
    subtitle: 'Heat Treatment (Quenching) by Fork-Lift Furnace (Ref: https://youtu.be/xihraKAokCs)',
    videoId: 'xihraKAokCs',
    altVideoId: 'D_zc1-SzBV4',
    videoLabel: 'Video 1: Quenching Industri (xihraKAokCs)',
    altLabel: 'Video 2: Hardening (D_zc1-SzBV4)',
    duration: 'Fasilitas Industri Nyata',
    channel: 'Industrial Fork-lift Heat Treatment Facility',
    color: '#0284c7',
    keyPoints: [
      'Pengangkatan benda kerja membara dari tungku menggunakan mekanisme fork-lift industri berbobot besar.',
      'Pencelupan kilat dan teratur ke dalam bak quench raksasa berisi ratusan liter oli pendingin.',
      'Sirkulasi dan agitasi fluida pendingin untuk memecah selimut uap (vapor blanket) agar pendinginan merata.',
      'Pencegahan distorsi geometri dan retak termal pada komponen mesin berbobot besar.'
    ]
  },
  tempering: {
    title: 'Video Referensi Praktikum: Tempering & Spektrum Warna Oksida',
    subtitle: 'Pemanasan Ulang Suhu Rendah (220°C - 300°C) untuk Melepas Kerapuhan & Tegangan Sisa',
    videoId: 'p03z1jH5G_g', // Walter Sorrells Knife Tempering Colors
    altVideoId: 'D_zc1-SzBV4',
    videoLabel: 'Video 1: Tempering Warna Oksida (p03z1jH5G_g)',
    altLabel: 'Video 2: Hardening Dasar (D_zc1-SzBV4)',
    duration: '12 Menit',
    channel: 'Walter Sorrells Bladesmith & Metallurgy Lab',
    color: '#d97706',
    keyPoints: [
      'Permukaan baja yang dipoles mengkilap memunculkan lapisan tipis oksida berwarna pelangi alami.',
      'Kuning Jerami (Straw Yellow 220°C / 62 HRC): Ideal untuk pahat bubut, pisau cukur, dan pisau bedah.',
      'Cokelat Emas (Bronze/Brown 260°C / 58 HRC): Sangat tangguh untuk mata bor, pisau frais, dan tap-snei.',
      'Biru Pegas (Spring Blue 300°C / 50 HRC): Fleksibel & ulet untuk pegas suspensi dan bilah gergaji.'
    ]
  },
  annealing: {
    title: 'Video Referensi Praktikum: Annealing (Pelunakan Total di Tungku)',
    subtitle: 'Proses Pemanasan & Pendinginan Lambat untuk Kemudahan Machining (Ref: https://youtu.be/ucFnIilIMOs)',
    videoId: 'ucFnIilIMOs',
    altVideoId: 'Pf1MGZvxirE',
    videoLabel: 'Video 1: Annealing (ucFnIilIMOs)',
    altLabel: 'Video 2: Normalizing (Pf1MGZvxirE)',
    duration: 'Praktikum Laboratorium',
    channel: 'Heat Treatment Metallurgy Reference',
    color: '#2563eb',
    keyPoints: [
      'Pemanasan baja melampaui suhu kritis austenitisasi 850°C dan penahanan suhu (soaking time).',
      'Pendinginan super lambat di dalam tungku mati yang terisolasi rapat selama belasan hingga 24 jam.',
      'Struktur kristal bertransformasi menjadi Perlit Kasar berselang Ferit yang sangat empuk (~12 HRC / 160 HB).',
      'Menghilangkan 100% tegangan sisa tempa/las agar baja sangat mudah disayat mesin bubut CNC dan pisau awet.'
    ]
  },
  normalizing: {
    title: 'Video Referensi Praktikum: Normalizing (Penyeragaman Butir Kristal)',
    subtitle: 'What Is Normalizing? | Metal Supermarkets (Ref: https://youtu.be/Pf1MGZvxirE)',
    videoId: 'Pf1MGZvxirE',
    altVideoId: 'ucFnIilIMOs',
    videoLabel: 'Video 1: Normalizing (Pf1MGZvxirE)',
    altLabel: 'Video 2: Annealing (ucFnIilIMOs)',
    duration: 'Penjelasan Standar Industri',
    channel: 'Metal Supermarkets Official',
    color: '#059669',
    keyPoints: [
      'Pemanasan sekitar 50°C di atas garis kritis A3 (900°C) untuk melarutkan butir kristal kasar bekas tempa.',
      'Pengeluaran benda kerja dari tungku menuju rak terbuka ditiup oleh sirkulasi udara kamar bebas.',
      'Laju pendinginan udara menghasilkan rekristalisasi butir halus dan seragam (ASTM 8) yang tangguh.',
      'Sangat penting untuk komponen bertegangan dinamis seperti rel kereta api, roda gigi, dan poros engkol kapal.'
    ]
  },
  'case-hardening': {
    title: 'Video Referensi Praktikum: Case Hardening & Carburizing (Pengerasan Kulit)',
    subtitle: 'How to Do Case Hardening: Explained Simply! (Ref: https://youtu.be/D_zc1-SzBV4)',
    videoId: 'D_zc1-SzBV4',
    altVideoId: 'xihraKAokCs',
    videoLabel: 'Video 1: Case Hardening (D_zc1-SzBV4)',
    altLabel: 'Video 2: Quenching Industri (xihraKAokCs)',
    duration: 'Eksperimen Praktis Bengkel',
    channel: 'Workshop Metallurgy Guide',
    color: '#7e22ce',
    keyPoints: [
      'Pembersihan permukaan baja karbon rendah (AISI 1020 / St 37) agar penetrasi karbon merata sempurna.',
      'Pemanasan benda kerja hingga 900°C di dalam tungku pemanas / perapian tempa.',
      'Pengepakan dalam serbuk kaya karbon (arang aktif) agar atom karbon berdifusi masuk sedalam 1.0 mm.',
      'Pencelupan kilat (quench) ke air/oli: kulit luar mengeras jadi Martensit 62 HRC, sementara inti tetap ulet 22 HRC.'
    ]
  },
  blackening: {
    title: 'Video Referensi Praktikum: Blackening Steel (Penghitaman Baut & Logam)',
    subtitle: 'Blackening Steel With Motor Oil - Dean\'s How-To (Ref: https://youtu.be/0F3_qlpjqGM)',
    videoId: '0F3_qlpjqGM',
    altVideoId: 'xihraKAokCs',
    videoLabel: 'Video 1: Blackening (0F3_qlpjqGM)',
    altLabel: 'Video 2: Quenching Industri (xihraKAokCs)',
    duration: 'Tutorial Bengkel Nyata',
    channel: 'Dean\'s How-To & Practical Workshop',
    color: '#0f172a',
    keyPoints: [
      'Pembersihan dan penghilangan lapisan oli/karat pada permukaan baut atau komponen baja.',
      'Pemanasan terkontrol benda kerja hingga suhu pembentukan lapisan oksida hitam Fe₃O₄.',
      'Pencelupan ke dalam minyak pelindung untuk membentuk lapisan hitam pekat mengkilap yang tahan karat.',
      'Toleransi dimensi presisi: Tidak menambah ketebalan ukuran (0.000 mm) sehingga ulir baut tetap presisi dan lancar.'
    ]
  }
};

export default function HeatTreatmentYouTubeCard({ processId = 'hardening' }) {
  const item = YOUTUBE_REFS[processId] || YOUTUBE_REFS.hardening;
  const [activeId, setActiveId] = useState(item.videoId);

  useEffect(() => {
    setActiveId(item.videoId);
  }, [item.videoId, processId]);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '14px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      marginBottom: '22px'
    }}>
      {/* Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '14px 20px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: item.color,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.2rem',
            boxShadow: `0 0 12px ${item.color}60`
          }}>
            📺
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f8fafc' }}>
                {item.title}
              </span>
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '999px',
                letterSpacing: '0.5px'
              }}>
                YOUTUBE REF
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              {item.subtitle}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600 }}>
            {item.channel} &bull; {item.duration}
          </span>
          <a
            href={`https://www.youtube.com/watch?v=${activeId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
            }}
          >
            <span>▶</span> Buka di YouTube
          </a>
        </div>
      </div>

      {/* Main Video Embed & Key Points Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        padding: '16px 20px',
        background: '#f8fafc'
      }}>
        {/* Responsive 16:9 YouTube iframe */}
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%', // 16:9 aspect ratio
          height: 0,
          overflow: 'hidden',
          borderRadius: '10px',
          background: '#000000',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          border: '1px solid #cbd5e1'
        }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${activeId}?rel=0`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '10px'
            }}
          />
        </div>

        {/* Practical Observation Checklist for Students */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '14px 16px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '8px',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0f172a' }}>
                🔍 Poin Kunci yang Wajib Diamati Siswa:
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>
                Praktikum Bengkel Nyata
              </span>
            </div>

            <ul style={{
              margin: 0,
              paddingLeft: '18px',
              fontSize: '0.78rem',
              color: '#334155',
              lineHeight: 1.6,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {item.keyPoints.map((point, idx) => (
                <li key={idx}>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Video switcher buttons (Video 1 vs Video 2) */}
          {item.altVideoId && (
            <div style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
              fontSize: '0.72rem'
            }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Pilihan Video:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setActiveId(item.videoId)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: activeId === item.videoId ? `2px solid ${item.color}` : '1px solid #cbd5e1',
                    background: activeId === item.videoId ? `${item.color}15` : '#ffffff',
                    color: activeId === item.videoId ? item.color : '#475569',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {item.videoLabel || 'Video 1'}
                </button>
                <button
                  onClick={() => setActiveId(item.altVideoId)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: activeId === item.altVideoId ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: activeId === item.altVideoId ? '#e0f2fe' : '#ffffff',
                    color: activeId === item.altVideoId ? '#0369a1' : '#475569',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {item.altLabel || 'Video 2'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

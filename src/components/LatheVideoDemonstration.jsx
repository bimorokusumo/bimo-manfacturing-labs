import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../utils/audio';
import { getAssetUrl } from '../utils/assets';

// 13 Tahapan Operasi Pemotongan Mesin Bubut (Berdasarkan Video Chip Atlas Ø60 Steel Bar)
const LATHE_OPERATIONS = [
  {
    step: '01',
    name: 'Facing (Membubut Muka)',
    subtitle: 'Bidang Rata Referensi Sumbu Z0',
    icon: '🪓',
    timeSec: 0,
    desc: 'Penyayatan tegak lurus sumbu putar dari tepi luar ke pusat benda untuk menghasilkan permukaan rata presisi sebagai datum referensi panjang.',
    tool: 'Pahat Rata Kanan / Facing Tool',
    tip: 'Pastikan ujung mata pahat tepat setinggi senter spindel agar tidak meninggalkan tonjolan puting di tengah.'
  },
  {
    step: '02',
    name: 'Turning (Membubut Rata Bertingkat)',
    subtitle: 'Ø60 → Ø52 → Ø42 mm',
    icon: '📏',
    timeSec: 4,
    desc: 'Penyayatan memanjang sejajar sumbu spindel untuk mengurangi diameter luar benda secara bertingkat dengan kedalaman sayat aman.',
    tool: 'Pahat Bubut Luar ISO 6 / CNMG',
    tip: 'Gunakan cairan pendingin (coolant) untuk menjaga ketajaman pahat dan membuang serpihan tatal gram.'
  },
  {
    step: '03',
    name: 'Taper Turning (Membubut Tirus)',
    subtitle: 'Kemiringan Sudut 14° (Half-Angle)',
    icon: '📐',
    timeSec: 8,
    desc: 'Pembubutan bidang kerucut dengan memiringkan eretan atas (compound slide) sebesar sudut tirus tg α = (D - d) / (2l).',
    tool: 'Pahat Bubut Rata / Top Slide Feed',
    tip: 'Kunci eretan memanjang (carriage lock) dan lakukan pemakanan manual hanya memutar handel eretan atas.'
  },
  {
    step: '04',
    name: 'Contouring (Membubut Profil Alur)',
    subtitle: 'Profil Cekung Radius Ø46 Cove',
    icon: '〰️',
    timeSec: 12,
    desc: 'Pembentukan profil kontur melengkung menggunakan pahat radius (form tool / round insert) untuk estetika dan pengurang konsentrasi tegangan.',
    tool: 'Pahat Profil Radius R3',
    tip: 'Gunakan putaran spindel lebih rendah untuk meminimalkan getaran (chatter) pada bidang kontak pahat yang lebar.'
  },
  {
    step: '05',
    name: 'Chamfering (Membuat Chamfer)',
    subtitle: 'Penyudutan Sisi 2 × 45°',
    icon: '✂️',
    timeSec: 16,
    desc: 'Menghilangkan sudut tajam pada ujung silinder untuk keselamatan operator serta mempermudah pemasangan bantalan atau komponen pasangannya.',
    tool: 'Pahat Chamfer 45°',
    tip: 'Kedalaman chamfer 2 mm diukur dari muka silinder ke pangkal kemiringan.'
  },
  {
    step: '06',
    name: 'Grooving (Membubut Alur)',
    subtitle: 'Alur Pembebas Ulir ke Ø39 mm',
    icon: '⛏️',
    timeSec: 20,
    desc: 'Pembuatan celah sempit tegak lurus sumbu sebagai pembebas ujung pahat ulir (thread relief) agar pahat tidak menabrak undakan bahu.',
    tool: 'Pahat Alur Lebar 3 mm',
    tip: 'Lakukan pemakanan tegak lurus (plunge cut) secara bertahap dan tarik pahat keluar secara berkala untuk membersihkan tatal.'
  },
  {
    step: '07',
    name: 'Threading (Membubut Ulir Luar)',
    subtitle: 'Ulir Metris M42 × 2 mm',
    icon: '🔩',
    timeSec: 24,
    desc: 'Pemotongan alur heliks berulir sudut profil 60° dengan menyinkronkan putaran spindel terhadap poros transportir (lead screw).',
    tool: 'Pahat Ulir Metris Sudut 60°',
    tip: 'Perhatikan tabel gearbox transportir untuk kisar pitch 2.0 mm dan gunakan skala pembagi ulir saat mengembalikan eretan.'
  },
  {
    step: '08',
    name: 'Knurling (Mengkartel)',
    subtitle: 'Pola Diamond Pitch 1.2 mm',
    icon: '🧇',
    timeSec: 28,
    desc: 'Proses penekanan rol baja beralur keras ke permukaan silinder untuk membentuk pola belah ketupat kasar sebagai pegangan tangan anti-slip.',
    tool: 'Alat Kartel Roda Ganda (Knurling Tool)',
    tip: 'Gunakan RPM rendah (100 - 150 RPM) dan lumuri banyak oli pelumas saat rol menekan benda kerja.'
  },
  {
    step: '09',
    name: 'Drilling (Mengebor Sumbu Pusat)',
    subtitle: 'Mata Bor Ø8.5 mm (Sudut 118°)',
    icon: '🎯',
    timeSec: 32,
    desc: 'Pembuatan lubang awal tepat pada sumbu pusat silinder berputar menggunakan mata bor spiral yang dicekam pada kepala lepas (tailstock).',
    tool: 'Center Drill lalu Twist Drill Ø8.5',
    tip: 'Selalu awali dengan bor senter (center drill) agar mata bor spiral tidak melenceng dari titik sumbu putar.'
  },
  {
    step: '10',
    name: 'Boring (Membubut Dalam / Korter)',
    subtitle: 'Perluas Lubang Ø8.5 → Ø19.8 mm',
    icon: '🕳️',
    timeSec: 36,
    desc: 'Memperbesar diameter lubang bor dan meluruskan ketegaklurusan dinding silinder dalam menggunakan batang pahat korter (boring bar).',
    tool: 'Pahat Bubut Dalam (Boring Bar)',
    tip: 'Gunakan boring bar dengan juluran sependek mungkin untuk mencegah lendutan dan gelombang permukaan lubang.'
  },
  {
    step: '11',
    name: 'Reaming (Meluaskan Presisi)',
    subtitle: 'Finishing Presisi Ø20 H7 (Ra 0.8 µm)',
    icon: '✨',
    timeSec: 40,
    desc: 'Penyayatan halus lubang dalam toleransi sangat teliti (H7) dan kehalusan permukaan tinggi menggunakan alat reamer mesin.',
    tool: 'Machine Reamer Ø20 H7 Fluted',
    tip: 'RPM reaming adalah 1/3 dari RPM pengeboran, dan beri pelumasan melimpah. DILARANG memutar balik spindel saat reamer berada di dalam lubang!'
  },
  {
    step: '12',
    name: 'Tapping (Mengetap Ulir Dalam)',
    subtitle: 'Ulir Dalam Metris M10 × 1.5 mm',
    icon: '🪛',
    timeSec: 44,
    desc: 'Pembuatan ulir dalam metris standar menggunakan tap mesin yang dituntun titik senter kepala lepas agar sejajar sempurna.',
    tool: 'Tap Mesin Spiral Point M10 × 1.5',
    tip: 'Putar balik handel setiap setengah putaran sayat untuk memutuskan tatal gram di dalam lubang buntu.'
  },
  {
    step: '13',
    name: 'Parting (Memotong Benda Jadi)',
    subtitle: 'Pisau Potong Lebar 3 mm',
    icon: '🔪',
    timeSec: 48,
    desc: 'Pemisahan benda kerja yang telah selesai dikerjakan dari batang bahan sisa menggunakan bilah pisau potong (parting-off blade).',
    tool: 'Pisau Potong (Parting Tool 3 mm)',
    tip: 'Ketinggian pisau potong harus benar-benar presisi setinggi titik senter. Kurangi kecepatan saat mendekati inti putus agar benda tidak terbanting.'
  }
];

const LatheVideoDemonstration = ({ onSwitchToSimulator }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Video view mode: 'fill' (Landscape Penuh Widescreen Cover), 'rotate' (Rotasi 90°), 'fit' (Fit Original)
  const [viewMode, setViewMode] = useState('fill');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(LATHE_OPERATIONS[0]);

  const videoUrl = getAssetUrl('/videos/lathe-cutting.mp4');

  // Video Events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration || 52);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    sound.playClick();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const changeSpeed = (rate) => {
    sound.playClick();
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    sound.playClick();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleFullscreen = () => {
    sound.playClick();
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const jumpToOperation = (op) => {
    sound.playClick();
    setSelectedOperation(op);
    if (videoRef.current) {
      videoRef.current.currentTime = op.timeSec;
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  // Format mm:ss
  const formatTime = (timeInSec) => {
    const m = Math.floor(timeInSec / 60);
    const s = Math.floor(timeInSec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1100px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* TOP BAR / TITLE */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        border: '1px solid #38bdf8',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 10px 30px rgba(56, 189, 248, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.6rem',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)'
          }}>
            🎬
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                VIDEO PROSES PEMOTONGAN BUBUT (13 OPERASI INTI)
              </h2>
              <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                1080p HD
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
              Demonstrasi pembubutan batang baja Ø60 mm menjadi produk jadi melalui 13 proses pemesinan berstandar industri
            </p>
          </div>
        </div>

        {onSwitchToSimulator && (
          <button
            onClick={() => { sound.playClick(); onSwitchToSimulator(); }}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <span>🎮 Buka Simulator Praktik 3D</span> →
          </button>
        )}
      </div>

      {/* VIDEO PLAYER CONTAINER (LANDSCAPE FULL) */}
      <div
        ref={containerRef}
        style={{
          background: '#020617',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Top Control Bar on Player: Mode Selection */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          background: 'rgba(15, 23, 42, 0.9)',
          borderBottom: '1px solid #1e293b',
          flexWrap: 'wrap',
          gap: '10px',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Mode Tampilan:</span>
            
            {/* Mode 1: Fill (Landscape Penuh Widescreen) */}
            <button
              onClick={() => { sound.playClick(); setViewMode('fill'); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: viewMode === 'fill' ? '2px solid #38bdf8' : '1px solid #334155',
                background: viewMode === 'fill' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                color: viewMode === 'fill' ? '#38bdf8' : '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Memperbesar dan memusatkan video pemotongan bubut agar mengisi layar landscape secara penuh tanpa bilah hitam samping"
            >
              <span>📺</span> Landscape Penuh (Widescreen)
            </button>

            {/* Mode 2: Rotate 90° (Landscape Rotasi) */}
            <button
              onClick={() => { sound.playClick(); setViewMode('rotate'); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: viewMode === 'rotate' ? '2px solid #10b981' : '1px solid #334155',
                background: viewMode === 'rotate' ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                color: viewMode === 'rotate' ? '#10b981' : '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Memutar video 90° mendatar agar sejajar dengan orientasi horizontal spindel mesin bubut"
            >
              <span>🔄</span> Rotasi Horizontal 90°
            </button>

            {/* Mode 3: Fit (Rasio Asli 9:16) */}
            <button
              onClick={() => { sound.playClick(); setViewMode('fit'); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: viewMode === 'fit' ? '2px solid #f59e0b' : '1px solid #334155',
                background: viewMode === 'fit' ? 'rgba(245, 158, 11, 0.2)' : '#1e293b',
                color: viewMode === 'fit' ? '#f59e0b' : '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Menampilkan bingkai asli video secara utuh"
            >
              <span>🔍</span> Rasio Asli (Fit)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800 }}>
              {selectedOperation ? `${selectedOperation.step} ${selectedOperation.name}` : ''}
            </span>
            <button
              onClick={handleFullscreen}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
              title="Layar Penuh (Fullscreen)"
            >
              ⛶ Fullscreen
            </button>
          </div>
        </div>

        {/* Video Canvas Box */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: viewMode === 'rotate' ? '540px' : '480px',
          background: '#020617',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          
          {/* Ambient blurred backdrop for 'fit' or 'rotate' */}
          {viewMode !== 'fill' && (
            <video
              src={videoUrl}
              muted
              playsInline
              style={{
                position: 'absolute',
                width: '120%',
                height: '120%',
                objectFit: 'cover',
                filter: 'blur(30px) brightness(0.25)',
                pointerEvents: 'none',
                opacity: 0.7
              }}
            />
          )}

          {/* Main Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            controls={false}
            onClick={togglePlay}
            style={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              ...(viewMode === 'fill' ? {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 42%' // focus directly on lathe chuck & workpiece area
              } : viewMode === 'rotate' ? {
                width: '480px',
                height: '960px',
                transform: 'rotate(-90deg) scale(1.1)',
                objectFit: 'contain'
              } : {
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              })
            }}
          />

          {/* Play/Pause Center Indicator when Paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(2, 132, 199, 0.85)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#ffffff',
                fontSize: '2.4rem',
                cursor: 'pointer',
                boxShadow: '0 0 35px rgba(56, 189, 248, 0.6)',
                border: '2px solid #38bdf8',
                transition: 'transform 0.2s',
                paddingLeft: '6px'
              }}
            >
              ▶
            </div>
          )}

          {/* Watermark badge on video */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            color: '#94a3b8',
            pointerEvents: 'none'
          }}>
            Video Source: @chip.atlas (The Machining Encyclopedia)
          </div>
        </div>

        {/* Video Bottom Control Bar */}
        <div style={{
          padding: '12px 18px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Progress Seek Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace', minWidth: '42px' }}>
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 52}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              style={{
                flex: 1,
                accentColor: '#38bdf8',
                cursor: 'pointer',
                height: '6px'
              }}
            />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace', minWidth: '42px' }}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls: Play/Pause, Speed, Mute */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={togglePlay}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: isPlaying ? '#0284c7' : '#1e293b',
                  border: '1px solid #38bdf8',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isPlaying ? '⏸ Jeda (Pause)' : '▶ Putar (Play)'}
              </button>

              <button
                onClick={toggleMute}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Kecepatan:</span>
              {[0.75, 1, 1.25, 1.5].map(rate => (
                <button
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: playbackRate === rate ? '#38bdf8' : '#1e293b',
                    color: playbackRate === rate ? '#0f172a' : '#cbd5e1',
                    border: '1px solid #334155',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 13 CORE OPERATIONS CARDS (INTERACTIVE TIMELINE) */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', margin: 0 }}>
              📋 13 Tahapan Operasi Pemotongan Mesin Bubut (Chip Atlas)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Klik tahapan berikut untuk melihat penjelasan teknik, geometri pahat, dan langsung lompat ke videonya
            </p>
          </div>
        </div>

        {/* Selected Operation Detail Card */}
        {selectedOperation && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12), rgba(15, 23, 42, 0.9))',
            border: '1.5px solid #38bdf8',
            borderRadius: '12px',
            padding: '18px 22px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{selectedOperation.icon}</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    TAHAP {selectedOperation.step}
                  </div>
                  <h4 style={{ margin: '2px 0 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                    {selectedOperation.name}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                    {selectedOperation.subtitle}
                  </div>
                </div>
              </div>

              <button
                onClick={() => jumpToOperation(selectedOperation)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ▶ Tonton Bagian Ini ({formatTime(selectedOperation.timeSec)})
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, margin: '8px 0 14px 0' }}>
              {selectedOperation.desc}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Alat Potong / Pahat:</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8' }}>{selectedOperation.tool}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Tips & Keselamatan Operasi:</span>
                <div style={{ fontSize: '0.85rem', color: '#fed7aa' }}>💡 {selectedOperation.tip}</div>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal / Grid Cards of 13 Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '10px'
        }}>
          {LATHE_OPERATIONS.map((op) => {
            const isCurrent = selectedOperation?.step === op.step;
            return (
              <div
                key={op.step}
                onClick={() => jumpToOperation(op)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: isCurrent ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                  border: isCurrent ? '1.5px solid #38bdf8' : '1px solid #334155',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isCurrent ? '#38bdf8' : '#94a3b8' }}>
                    {op.step}
                  </span>
                  <span style={{ fontSize: '1.2rem' }}>{op.icon}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffffff', lineHeight: 1.3 }}>
                  {op.name.split(' ')[0]} {op.name.split(' ')[1] || ''}
                </div>
                <div style={{ fontSize: '0.72rem', color: isCurrent ? '#6ee7b7' : '#94a3b8' }}>
                  {op.subtitle}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default LatheVideoDemonstration;

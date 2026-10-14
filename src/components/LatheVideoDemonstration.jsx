import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../utils/audio';
import { getAssetUrl } from '../utils/assets';

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
                VIDEO PROSES PEMOTONGAN MESIN BUBUT
              </h2>
              <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                1080p HD
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
              Demonstrasi pemesinan dan pembubutan batang baja presisi berstandar industri
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
    </div>
  );
};

export default LatheVideoDemonstration;

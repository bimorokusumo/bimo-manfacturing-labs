import React from 'react';
import { Cog, RotateCw, Layers, Home } from 'lucide-react';

export class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("CanvasErrorBoundary caught 3D/WebGL error:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function' ? this.props.fallback(this.reset) : this.props.fallback;
      }
      return (
        <div style={{
          width: '100%',
          height: '100%',
          minHeight: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#f8fafc',
          padding: '24px',
          textAlign: 'center',
          borderRadius: '12px',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)'
        }}>
          <div style={{ marginBottom: '14px', color: '#f59e0b' }}>
            <Cog size={44} className="animate-spin-slow" />
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>
            {this.props.title || 'Akselerasi Grafis 3D Membutuhkan Muat Ulang'}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '440px', lineHeight: 1.6, marginBottom: '20px' }}>
            Alokasi memori WebGL browser Anda sempat terhenti atau dibatasi oleh sistem GPU. Klik tombol di bawah untuk mengaktifkan kembali tampilan 3D.
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.reset}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RotateCw size={15} />
              <span>Muat Ulang Tampilan 3D</span>
            </button>
            {this.props.onFallbackMode && (
              <button
                onClick={this.props.onFallbackMode}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={15} />
                <span>Beralih ke Mode 2D</span>
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const isInline = this.props.inline;
      return (
        <div style={{
          minHeight: isInline ? '50vh' : '100vh',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <Cog size={48} color="#f87171" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginBottom: '12px' }}>
              Terjadi Kendala Memuat Halaman
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Aplikasi mengalami kendala teknis saat memuat antarmuka. Silakan coba muat ulang halaman atau bersihkan memori browser.
            </p>
            {this.state.error && (
              <div style={{
                textAlign: 'left',
                background: '#020617',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.78rem',
                color: '#f87171',
                fontFamily: 'monospace',
                maxHeight: '120px',
                overflowY: 'auto',
                marginBottom: '24px',
                wordBreak: 'break-word'
              }}>
                {this.state.error.toString()}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  try {
                    sessionStorage.removeItem('bimo_active_menu');
                    if (typeof window !== 'undefined') window.location.hash = '';
                  } catch (e) {}
                  window.location.reload();
                }}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RotateCw size={16} />
                <span>Muat Ulang Halaman</span>
              </button>
              <button
                onClick={() => {
                  try {
                    sessionStorage.removeItem('bimo_active_menu');
                    if (typeof window !== 'undefined') window.location.hash = '#dashboard';
                  } catch (e) {}
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Home size={16} />
                <span>Kembali ke Dashboard</span>
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                    if (typeof window !== 'undefined') window.location.hash = '';
                  } catch (e) {}
                  window.location.reload();
                }}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Bersihkan Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


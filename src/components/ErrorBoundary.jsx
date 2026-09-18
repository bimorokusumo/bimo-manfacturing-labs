import React from 'react';

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
      return (
        <div style={{
          minHeight: '100vh',
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
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚙️</div>
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
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                🔄 Muat Ulang Halaman
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
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

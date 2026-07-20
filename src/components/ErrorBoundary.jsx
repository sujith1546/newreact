import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Check if it's a chunk load error (usually means offline or stale cache)
      const isChunkError = this.state.error?.message?.match(/Failed to fetch dynamically imported module/i);
      
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <AlertTriangle size={48} color="var(--primary-blue)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {isChunkError ? "Connection Lost" : "Oops, something went wrong"}
          </h2>
          <p style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
            {isChunkError 
              ? "We couldn't load this section. Please check your internet connection and try again."
              : "An unexpected error occurred while loading this page."}
          </p>
          <button 
            onClick={this.handleReload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          >
            <RefreshCw size={16} />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

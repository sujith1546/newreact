import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px', textAlign: 'center', gap: 16,
        }}>
          <div style={{ padding: 16, background: 'color-mix(in srgb, #ef4444 10%, transparent)', borderRadius: 16, color: '#ef4444' }}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
              {this.props.title || 'Something went wrong'}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', maxWidth: 320 }}>
              {this.props.description || 'This section failed to load. Click below to try again.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: 10, border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              cursor: 'pointer', fontSize: 14, fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={15} /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

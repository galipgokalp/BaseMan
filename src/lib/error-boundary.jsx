/**
 * React Error Boundary Component for BaseMan Mini-App
 * Phase 6: Mini-App Stability, Error Handling & Fallback Systems
 * 
 * Catches React component errors and shows fallback UI
 */

import React from 'react';
import { createLogger } from '../utils/logger.js';

const log = createLogger('ErrorBoundary');

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    log.error('React Error Boundary caught error:', {
      error: error?.message || String(error),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      errorInfo
    });

    // Log to backend if available
    try {
      fetch('/api/app-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'react:error-boundary',
          meta: {
            error: error?.message || String(error),
            stack: error?.stack,
            componentStack: errorInfo?.componentStack
          }
        }),
        keepalive: true
      }).catch(() => {});
    } catch (_) {}
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#fff',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
            Something went wrong. Please close and reopen the mini-app.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '10px', textAlign: 'left', fontSize: '12px', opacity: 0.7 }}>
              <summary style={{ cursor: 'pointer' }}>Error Details (Dev Only)</summary>
              <pre style={{ marginTop: '10px', overflow: 'auto' }}>
                {this.state.error.toString()}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}


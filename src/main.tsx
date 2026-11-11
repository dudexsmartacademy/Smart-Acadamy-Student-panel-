import { Component, StrictMode } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'

// ── Error Boundary ──────────────────────────────────────────────────────────
interface EBState { hasError: boolean; message: string }

class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): EBState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[DudeX ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', padding: 32, textAlign: 'center',
          background: '#faf7f4', color: '#444', gap: 16, fontFamily: 'inherit',
        }}>
          <div style={{ fontSize: 36 }}>⚠️</div>
          <h2 style={{ margin: 0, color: '#333' }}>Something went wrong</h2>
          <p style={{ maxWidth: 480, color: '#666', fontSize: 14, margin: 0 }}>
            {this.state.message || 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#b58a5a', color: '#fff', cursor: 'pointer', fontSize: 14,
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
// ────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

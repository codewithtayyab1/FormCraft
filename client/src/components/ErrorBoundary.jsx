import { Component } from 'react'
import { Zap, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-6"
             style={{ background: 'var(--color-accent)' }}>
          <Zap size={16} color="white" strokeWidth={2.5} />
        </div>

        <div className="text-center max-w-sm">
          <h1 className="text-[20px] font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Something went wrong
          </h1>
          <p className="text-[14px] mb-6" style={{ color: 'var(--color-text-muted)' }}>
            An unexpected error occurred. Refresh the page to try again — your work is saved.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-input text-[14px] font-medium text-white"
            style={{ background: 'var(--color-accent)' }}
          >
            <RefreshCw size={14} />
            Refresh page
          </button>

          {import.meta.env.DEV && (
            <pre className="mt-6 text-left text-[11px] p-3 rounded-card overflow-auto max-h-48"
                 style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
              {this.state.error?.message}
            </pre>
          )}
        </div>
      </div>
    )
  }
}

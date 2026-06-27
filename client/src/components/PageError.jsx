import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function PageError({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'var(--color-bg)' }}>
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
             style={{ background: 'var(--color-danger-soft)' }}>
          <AlertTriangle size={22} style={{ color: 'var(--color-danger)' }} />
        </div>
        <h2 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          {message}
        </h2>
        <p className="text-[13px] mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Check your connection and try again.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-input text-[13px] font-medium transition-all duration-150"
            style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
          >
            <RefreshCw size={13} />
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

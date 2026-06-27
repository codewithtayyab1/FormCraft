import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Zap, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
         style={{ background: 'var(--color-bg)' }}>
      <Helmet>
        <title>Page not found — FormCraft</title>
      </Helmet>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
             style={{ background: 'var(--color-accent)' }}>
          <Zap size={16} color="white" strokeWidth={2.5} />
        </div>
        <span className="text-[17px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          FormCraft
        </span>
      </Link>

      <div className="text-center max-w-sm">
        <p className="text-[96px] font-semibold leading-none mb-4 tracking-tight select-none"
           style={{ color: 'var(--color-border-strong)' }}>
          404
        </p>
        <h1 className="text-[22px] font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Page not found
        </h1>
        <p className="text-[14px] leading-relaxed mb-8" style={{ color: 'var(--color-text-muted)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-input text-[14px] font-medium transition-all duration-150"
            style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-strong)'}
          >
            <ArrowLeft size={15} />
            Go back
          </button>
          <Link
            to={user ? '/dashboard' : '/'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-input text-[14px] font-medium text-white transition-all duration-150"
            style={{ background: 'var(--color-accent)', boxShadow: '0 0 20px rgba(139,92,246,0.30)' }}
          >
            {user ? 'My forms' : 'Home'}
          </Link>
        </div>
      </div>
    </div>
  )
}

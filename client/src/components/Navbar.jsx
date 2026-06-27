import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'
import Container from './Container'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '0.5px solid var(--color-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container className="h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent)' }}
          >
            <Zap size={14} color="white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            FormCraft
          </span>
        </Link>

        {/* Desktop centre links */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-[13px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium px-3 py-2 rounded-input transition-all duration-150"
                style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.borderColor = 'var(--color-danger)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border-strong)' }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium px-3 py-2 rounded-input transition-colors duration-150"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium text-white px-4 py-2 rounded-input transition-all duration-150"
                style={{ background: 'var(--color-accent)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.30)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-hover)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(139, 92, 246, 0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.30)' }}
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-input transition-colors duration-150"
          style={{ color: 'var(--color-text-secondary)' }}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '0.5px solid var(--color-border)' }}
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              ))}
              <div className="pt-2 border-t flex flex-col gap-3" style={{ borderColor: 'var(--color-border)' }}>
                {user ? (
                  <>
                    <p className="text-[13px] font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>
                      {user.name}
                    </p>
                    <button
                      onClick={() => { handleLogout(); setOpen(false) }}
                      className="text-sm font-medium py-2.5 rounded-input text-center"
                      style={{ color: 'var(--color-danger)', border: '0.5px solid var(--color-danger)', background: 'var(--color-danger-soft)' }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)}
                      className="text-sm font-medium text-center py-2.5 rounded-input"
                      style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}>
                      Log in
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)}
                      className="text-sm font-medium text-white text-center py-2.5 rounded-input"
                      style={{ background: 'var(--color-accent)' }}>
                      Get started free
                    </Link>
                  </>
                )}
                <div className="flex justify-center pt-1">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

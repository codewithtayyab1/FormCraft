import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import Container from '../Container'

const LINKS = [
  { label: 'Features', href: '#features', external: true },
  { label: 'How it works', href: '#how-it-works', external: true },
  { label: 'Log in', href: '/login' },
  { label: 'Sign up', href: '/signup' },
]

export default function Footer() {
  return (
    <footer
      className="py-10"
      style={{ borderTop: '0.5px solid var(--color-border)' }}
    >
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-6">

        {/* Logo + copyright */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent)' }}
          >
            <Zap size={12} color="white" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            FormCraft
          </span>
          <span className="text-[13px] ml-1" style={{ color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-6 flex-wrap justify-center">
          {LINKS.map(({ label, href, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                className="text-[13px] transition-colors duration-150"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                to={href}
                className="text-[13px] transition-colors duration-150"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {label}
              </Link>
            )
          )}
        </nav>
      </Container>
    </footer>
  )
}

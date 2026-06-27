import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div
          className="w-6 h-6 rounded-full animate-spin"
          style={{ border: '2px solid var(--color-border-strong)', borderTopColor: 'var(--color-accent)' }}
        />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

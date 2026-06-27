import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
}

const COLORS = {
  success: 'var(--color-neon)',
  error:   'var(--color-danger)',
  info:    'var(--color-accent)',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success', duration = 3200) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = id => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — bottom-right, above everything */}
      <div
        className="fixed bottom-5 right-5 z-[200] flex flex-col-reverse gap-2 pointer-events-none"
        style={{ maxWidth: '360px', width: 'calc(100vw - 40px)' }}
      >
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = ICONS[t.type] ?? CheckCircle
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 16, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, scale: 0.97 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-card"
                style={{
                  background:  'var(--color-surface)',
                  border:      '0.5px solid var(--color-border)',
                  boxShadow:   '0 8px 28px rgba(0,0,0,0.18)',
                }}
              >
                <Icon size={15} strokeWidth={2} style={{ color: COLORS[t.type], flexShrink: 0 }} />
                <p className="flex-1 text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {t.message}
                </p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 transition-colors duration-150"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

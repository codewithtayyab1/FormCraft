import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const OPTIONS = [
  { value: 'dark',   icon: Moon,    label: 'Dark'   },
  { value: 'light',  icon: Sun,     label: 'Light'  },
  { value: 'system', icon: Monitor, label: 'System' },
]

export default function ThemeToggle() {
  const { mode, setMode } = useTheme()

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex items-center gap-0.5 p-1 rounded-pill"
      style={{
        background: 'var(--color-surface)',
        border: '0.5px solid var(--color-border-strong)',
      }}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = mode === value
        return (
          <button
            key={value}
            onClick={() => setMode(value)}
            aria-pressed={active}
            title={label}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-pill',
              'text-[13px] font-medium leading-none',
              'transition-all duration-150 cursor-pointer border-0 outline-none',
              active
                ? 'text-white'
                : 'bg-transparent text-text-muted hover:text-text-secondary hover:bg-surface-hover',
            ].join(' ')}
            style={active ? { background: 'var(--color-accent)' } : {}}
          >
            <Icon size={13} strokeWidth={2} />
            {label}
          </button>
        )
      })}
    </div>
  )
}

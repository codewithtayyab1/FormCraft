import { motion } from 'framer-motion'
import { GripVertical, Link2, BarChart2, Globe } from 'lucide-react'
import Container from '../Container'

const FEATURES = [
  {
    icon: GripVertical,
    title: 'Drag-and-drop builder',
    desc: 'Add, reorder, and configure fields visually. What you see is exactly what respondents get.',
  },
  {
    icon: Link2,
    title: 'Instant shareable links',
    desc: 'Publish in one click. Share anywhere — no account needed to respond.',
  },
  {
    icon: BarChart2,
    title: 'Live response analytics',
    desc: 'Watch responses arrive in real time. Charts and summaries update automatically.',
  },
  {
    icon: Globe,
    title: 'Works everywhere',
    desc: 'Fully responsive forms that look great on any screen, in any browser.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2
            className="text-[32px] font-semibold tracking-tight mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Everything you need to collect data
          </h2>
          <p className="text-[15px] max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Powerful enough for researchers, simple enough for everyone else.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="p-6 rounded-card cursor-default"
              style={{
                background: 'var(--color-surface)',
                border: '0.5px solid var(--color-border)',
                transition: 'background 150ms ease, border-color 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-surface-hover)'
                e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--color-surface)'
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div
                className="w-10 h-10 rounded-input flex items-center justify-center mb-5"
                style={{ background: 'var(--color-accent-soft)' }}
              >
                <Icon size={18} style={{ color: 'var(--color-accent)' }} strokeWidth={1.75} />
              </div>
              <h3
                className="text-[15px] font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}

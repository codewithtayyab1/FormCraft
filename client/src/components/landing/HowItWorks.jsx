import { motion } from 'framer-motion'
import { Pencil, Share2, TrendingUp } from 'lucide-react'
import Container from '../Container'

const STEPS = [
  {
    icon: Pencil,
    title: 'Create your form',
    desc: 'Drag in fields, write your questions, and style it to match your brand — in minutes.',
  },
  {
    icon: Share2,
    title: 'Share with anyone',
    desc: 'Copy your link, embed it on your site, or send it by email. No account needed to respond.',
  },
  {
    icon: TrendingUp,
    title: 'Collect responses',
    desc: 'Your dashboard fills up in real time. Export to CSV whenever you\'re ready.',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24"
      style={{ background: 'var(--color-surface)' }}
    >
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
            Up and running in three steps
          </h2>
          <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
            No learning curve. No setup fee. Just your form, live in minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector (desktop only) */}
          <div
            className="hidden md:block absolute h-px top-8 pointer-events-none"
            style={{
              left: 'calc(16.66% + 32px)',
              right: 'calc(16.66% + 32px)',
              background: `linear-gradient(to right, var(--color-accent), var(--color-border-strong), var(--color-accent))`,
              opacity: 0.4,
            }}
          />

          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon circle with step number */}
              <div className="relative mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'var(--color-accent-soft)',
                    border: '0.5px solid var(--color-accent)',
                  }}
                >
                  <Icon size={22} style={{ color: 'var(--color-accent)' }} strokeWidth={1.75} />
                </div>
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center text-white"
                  style={{ background: 'var(--color-accent)' }}
                >
                  {i + 1}
                </span>
              </div>

              <h3
                className="text-[17px] font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {title}
              </h3>
              <p
                className="text-[13px] leading-relaxed max-w-[220px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import Container from '../Container'

const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24">
      {/* Ambient glow — right side */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 65% at 75% 40%, rgba(139, 92, 246, 0.13) 0%, transparent 70%)',
        }}
      />

      <Container className="grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* ── Copy ─────────────────────────────────────────── */}
        <div>
          <motion.div
            {...enter(0)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill text-[12px] font-medium mb-6"
            style={{
              background: 'var(--color-accent-soft)',
              color: 'var(--color-accent)',
              border: '0.5px solid var(--color-accent)',
            }}
          >
            <Zap size={11} strokeWidth={2.5} />
            Now in public beta
          </motion.div>

          <motion.h1
            {...enter(0.08)}
            className="text-[46px] sm:text-[52px] font-semibold leading-[1.12] tracking-tight mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Build forms people
            <br />
            <span style={{ color: 'var(--color-accent)' }}>actually finish</span>
          </motion.h1>

          <motion.p
            {...enter(0.16)}
            className="text-[17px] leading-relaxed mb-8 max-w-md"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Create beautiful forms and surveys in minutes. Share a link, collect responses,
            watch the insights roll in — no code required.
          </motion.p>

          <motion.div {...enter(0.22)} className="flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-input text-[14px] font-medium text-white transition-all duration-150"
              style={{
                background: 'var(--color-accent)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.30)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-accent-hover)'
                e.currentTarget.style.boxShadow = '0 0 32px rgba(139, 92, 246, 0.50)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--color-accent)'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.30)'
              }}
            >
              Get started free <ArrowRight size={15} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-input text-[14px] font-medium transition-all duration-150"
              style={{
                color: 'var(--color-text-secondary)',
                border: '0.5px solid var(--color-border-strong)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-accent)'
                e.currentTarget.style.color = 'var(--color-text-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            {...enter(0.30)}
            className="mt-5 text-[12px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Free forever on the starter plan · No credit card required
          </motion.p>
        </div>

        {/* ── Form mockup ──────────────────────────────────── */}
        <motion.div {...enter(0.28)} className="relative hidden md:block">
          <FormMockup />
        </motion.div>
      </Container>
    </section>
  )
}

function FakeField({ label, value, focused }) {
  return (
    <div>
      <div className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </div>
      <div
        className="h-10 px-3 flex items-center rounded-input text-[13px]"
        style={{
          background: 'var(--color-bg)',
          border: `0.5px solid ${focused ? 'var(--color-accent)' : 'var(--color-border)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(139, 92, 246, 0.12)' : 'none',
          color: 'var(--color-text-primary)',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function FormMockup() {
  const ratings = ['😕', '😐', '🙂', '😊', '🤩']

  return (
    <div className="relative">
      {/* Glow halo */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: '-20px',
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.18) 0%, transparent 65%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Card */}
      <div
        className="relative rounded-card p-6 ml-auto"
        style={{
          background: 'var(--color-surface)',
          border: '0.5px solid var(--color-border-strong)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.18)',
          maxWidth: '360px',
        }}
      >
        {/* Card header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[13px] font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
              User feedback form
            </p>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              3 questions · 2 min
            </p>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {[1, 0, 0].map((active, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: active ? 'var(--color-accent)' : 'var(--color-border-strong)' }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <FakeField label="Full name" value="Sarah Johnson" focused />
          <FakeField label="Email address" value="sarah@example.com" />

          <div>
            <div className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              How satisfied are you?
            </div>
            <div className="flex gap-2">
              {ratings.map((emoji, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-input text-base flex items-center justify-center"
                  style={{
                    background: i === 4 ? 'var(--color-accent-soft)' : 'var(--color-bg)',
                    border: `0.5px solid ${i === 4 ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          className="w-full mt-5 py-2.5 rounded-input text-[13px] font-medium text-white"
          style={{ background: 'var(--color-accent)' }}
        >
          Submit response →
        </button>
      </div>

      {/* Floating stat badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-4 -left-6 rounded-card px-4 py-3"
        style={{
          background: 'var(--color-surface)',
          border: '0.5px solid var(--color-border-strong)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <p className="text-[11px] font-medium mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
          New responses
        </p>
        <p className="text-[22px] font-semibold leading-none" style={{ color: 'var(--color-neon)' }}>
          +142
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          in the last 24 hours
        </p>
      </motion.div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Container from '../Container'

export default function CtaBand() {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 70% at 50% 50%, rgba(139, 92, 246, 0.11) 0%, transparent 70%)',
        }}
      />

      <Container>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        <h2
          className="text-[38px] font-semibold tracking-tight mb-4 leading-[1.15]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Ready to build your first form?
        </h2>
        <p className="text-[16px] mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Join thousands of teams using FormCraft to collect data that actually matters.
        </p>

        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-input text-[15px] font-medium text-white transition-all duration-150"
          style={{
            background: 'var(--color-accent)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.30)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--color-accent-hover)'
            e.currentTarget.style.boxShadow = '0 0 36px rgba(139, 92, 246, 0.55)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--color-accent)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.30)'
          }}
        >
          Get started free <ArrowRight size={16} />
        </Link>

        <p className="mt-4 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
          No credit card required · Free forever on the starter plan
        </p>
      </motion.div>
      </Container>
    </section>
  )
}

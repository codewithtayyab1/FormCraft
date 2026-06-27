import { useState } from 'react'
import { X, Plus, ArrowRight } from 'lucide-react'
import { TEMPLATES, CATEGORIES } from '../data/templates'

export default function TemplatePickerModal({ onBlank, onTemplate, onClose }) {
  const [cat, setCat] = useState('All')

  const visible = cat === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === cat)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl flex flex-col rounded-card overflow-hidden"
        style={{
          background:  'var(--color-surface)',
          border:      '0.5px solid var(--color-border)',
          maxHeight:   '90vh',
          boxShadow:   '0 32px 80px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '0.5px solid var(--color-border)' }}
        >
          <h2 className="text-[17px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Create a new form
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-input transition-colors duration-150"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Blank form option */}
          <button
            onClick={onBlank}
            className="w-full flex items-center gap-4 p-4 rounded-card text-left transition-all duration-150"
            style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)' }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-accent)'
              e.currentTarget.style.background  = 'var(--color-accent-soft)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.background  = 'var(--color-bg)'
            }}
          >
            <div
              className="w-10 h-10 rounded-input flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-accent-soft)' }}
            >
              <Plus size={20} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                Start from blank
              </p>
              <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                Build your form from scratch with full control over every field
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          </button>

          {/* Template section */}
          <div>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <p className="text-[13px] font-medium shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                Or start from a template
              </p>
              {/* Category pills */}
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className="px-2.5 py-1 rounded-pill text-[11px] font-medium transition-all duration-150"
                    style={{
                      background: cat === c ? 'var(--color-accent)' : 'transparent',
                      color:      cat === c ? 'white' : 'var(--color-text-muted)',
                      border:     `0.5px solid ${cat === c ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {visible.map(tmpl => (
                <button
                  key={tmpl.slug}
                  onClick={() => onTemplate(tmpl)}
                  className="text-left p-4 rounded-card transition-all duration-150 flex flex-col"
                  style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                    e.currentTarget.style.background  = 'var(--color-surface-hover)'
                    e.currentTarget.style.transform   = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.background  = 'var(--color-bg)'
                    e.currentTarget.style.transform   = 'translateY(0)'
                  }}
                >
                  <div className="text-[28px] mb-3 leading-none">{tmpl.emoji}</div>
                  <p className="text-[13px] font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    {tmpl.title}
                  </p>
                  <p className="text-[11px] leading-relaxed mb-3 flex-1" style={{ color: 'var(--color-text-muted)' }}>
                    {tmpl.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-pill"
                      style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
                    >
                      {tmpl.category}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      {tmpl.fields.length} fields
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

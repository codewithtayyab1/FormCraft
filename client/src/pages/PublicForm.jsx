import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Zap, Star, ChevronDown, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../lib/api'

/* ── Condition evaluator (mirrors server logic) ─────────────────────────── */
function evalCondition(condition, values) {
  if (!condition?.fieldId) return true
  const src = values?.[condition.fieldId]
  switch (condition.operator) {
    case 'equals':     return String(src ?? '') === String(condition.value ?? '')
    case 'not_equals': return String(src ?? '') !== String(condition.value ?? '')
    case 'is_one_of':  return Array.isArray(condition.value) && condition.value.includes(src)
    default:           return true
  }
}

export default function PublicForm() {
  const { shareId } = useParams()
  const [form,       setForm]       = useState(null)
  const [status,     setStatus]     = useState('loading') // loading | ready | error | submitted
  const [submitErr,  setSubmitErr]  = useState('')

  useEffect(() => {
    api.get(`/public/forms/${shareId}`)
      .then(({ data }) => { setForm(data); setStatus('ready') })
      .catch(() => setStatus('error'))
  }, [shareId])

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (status === 'loading') return (
    <Screen>
      <div className="w-6 h-6 rounded-full animate-spin mx-auto"
           style={{ border: '2px solid var(--color-border-strong)', borderTopColor: 'var(--color-accent)' }} />
    </Screen>
  )

  /* ── Not found / unpublished ──────────────────────────────────────────── */
  if (status === 'error') return (
    <Screen>
      <div className="w-full max-w-md mx-auto text-center px-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
             style={{ background: 'var(--color-danger-soft)' }}>
          <AlertTriangle size={26} style={{ color: 'var(--color-danger)' }} />
        </div>
        <h1 className="text-[22px] font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Form not available
        </h1>
        <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
          This form doesn't exist or isn't accepting responses right now.
        </p>
      </div>
    </Screen>
  )

  /* ── Success ──────────────────────────────────────────────────────────── */
  if (status === 'submitted') return (
    <Screen>
      <div className="w-full max-w-md mx-auto text-center px-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
             style={{ background: 'var(--color-accent-soft)' }}>
          <CheckCircle size={32} style={{ color: 'var(--color-accent)' }} strokeWidth={1.75} />
        </div>
        <h1 className="text-[24px] font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Response recorded
        </h1>
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
          Thanks for filling this out. Your response has been saved.
        </p>
      </div>
    </Screen>
  )

  /* ── Form ─────────────────────────────────────────────────────────────── */
  return (
    <Screen>
      <Helmet>
        <title>{form.title ? `${form.title} — FormCraft` : 'FormCraft'}</title>
        <meta name="description" content={form.description || 'Fill out this form created with FormCraft.'} />
        <meta property="og:title"       content={form.title || 'FormCraft form'} />
        <meta property="og:description" content={form.description || 'Fill out this form created with FormCraft.'} />
        <meta property="og:type"        content="website" />
        <meta name="twitter:card"       content="summary" />
        <meta name="twitter:title"      content={form.title || 'FormCraft form'} />
      </Helmet>
      <div className="w-full max-w-xl mx-auto px-4 py-10">
        {/* Branding */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--color-accent)' }}>
            <Zap size={14} color="white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            FormCraft
          </span>
        </Link>

        {/* Header card */}
        <div className="rounded-card px-7 py-6 mb-4"
             style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
          <h1 className="text-[22px] font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {form.title || 'Untitled form'}
          </h1>
          {form.description && (
            <p className="text-[14px] leading-relaxed mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {form.description}
            </p>
          )}
        </div>

        {/* Error banner */}
        {submitErr && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-input text-[13px]"
               style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', border: '0.5px solid var(--color-danger)' }}>
            <AlertCircle size={14} />
            {submitErr}
          </div>
        )}

        <FormBody
          form={form}
          onSuccess={() => setStatus('submitted')}
          onError={msg => setSubmitErr(msg)}
        />
      </div>
    </Screen>
  )
}

/* ── Form body with react-hook-form ────────────────────────────────────── */

function FormBody({ form, onSuccess, onError }) {
  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm({
    shouldUnregister: true, // removes hidden field values/validation automatically
  })

  const values = watch() // live-watch all values for condition evaluation

  const isVisible = field => evalCondition(field.condition, values)

  const onSubmit = async (data) => {
    onError('')
    try {
      // Only submit answers for fields that were visible when submitted
      const answers = (form.fields ?? [])
        .filter(field => evalCondition(field.condition, data))
        .map(field => ({ fieldId: field.id, value: data[field.id] ?? null }))
      await api.post(`/public/forms/${form.shareId}/submit`, { answers })
      onSuccess()
    } catch (err) {
      onError(err.response?.data?.error || 'Submission failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      {(form.fields ?? []).map(field => (
        <AnimatePresence key={field.id} mode="wait">
          {isVisible(field) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="rounded-card px-6 py-5"
                   style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
                <label className="block text-[14px] font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {field.label || 'Untitled question'}
                  {field.required && <span className="ml-1" style={{ color: 'var(--color-accent)' }}>*</span>}
                </label>

                <FormField field={field} register={register} control={control} />

                {errors[field.id] && (
                  <p className="mt-2 text-[12px]" style={{ color: 'var(--color-danger)' }}>
                    {errors[field.id].message}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-input text-[14px] font-medium text-white transition-all duration-150"
        style={{
          background:  'var(--color-accent)',
          boxShadow:   '0 0 20px rgba(139, 92, 246, 0.30)',
          opacity:     isSubmitting ? 0.7 : 1,
          cursor:      isSubmitting ? 'not-allowed' : 'pointer',
        }}>
        {isSubmitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}

/* ── Per-field renderer ─────────────────────────────────────────────────── */

function FormField({ field, register, control }) {
  const rules = {
    required: field.required ? `${field.label || 'This field'} is required` : false,
    ...(field.type === 'email' && {
      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
    }),
    ...(field.type === 'number' && {
      valueAsNumber: true,
    }),
  }

  switch (field.type) {
    case 'short_text':
    case 'email':
      return (
        <input
          className="fc-input"
          type={field.type === 'email' ? 'email' : 'text'}
          placeholder={field.placeholder || ''}
          {...register(field.id, rules)}
        />
      )

    case 'number':
      return (
        <input
          className="fc-input"
          type="number"
          placeholder={field.placeholder || ''}
          {...register(field.id, rules)}
        />
      )

    case 'long_text':
      return (
        <textarea
          className="fc-input"
          style={{ height: 'auto', minHeight: '96px', padding: '10px 12px', resize: 'vertical' }}
          placeholder={field.placeholder || ''}
          {...register(field.id, rules)}
        />
      )

    case 'multiple_choice':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue=""
          rules={{ required: field.required ? `${field.label || 'This field'} is required` : false }}
          render={({ field: f }) => (
            <div className="space-y-2">
              {(field.options ?? []).map((opt, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center transition-all duration-150"
                    style={{
                      border: `1.5px solid ${f.value === opt ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
                      background: f.value === opt ? 'var(--color-accent)' : 'transparent',
                    }}
                    onClick={() => f.onChange(opt)}>
                    {f.value === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{opt}</span>
                </label>
              ))}
            </div>
          )}
        />
      )

    case 'checkbox':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={[]}
          rules={{
            validate: v => !field.required || (Array.isArray(v) && v.length > 0)
              || `${field.label || 'This field'} is required`,
          }}
          render={({ field: f }) => (
            <div className="space-y-2">
              {(field.options ?? []).map((opt, i) => {
                const checked = Array.isArray(f.value) && f.value.includes(opt)
                const toggle = () => {
                  const next = checked ? f.value.filter(v => v !== opt) : [...(f.value ?? []), opt]
                  f.onChange(next)
                }
                return (
                  <label key={i} className="flex items-center gap-3 cursor-pointer">
                    <div
                      className="w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all duration-150"
                      style={{
                        border: `1.5px solid ${checked ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
                        background: checked ? 'var(--color-accent)' : 'transparent',
                      }}
                      onClick={toggle}>
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{opt}</span>
                  </label>
                )
              })}
            </div>
          )}
        />
      )

    case 'dropdown':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue=""
          rules={{ required: field.required ? `${field.label || 'This field'} is required` : false }}
          render={({ field: f }) => (
            <div className="relative">
              <select
                {...f}
                className="fc-input appearance-none pr-10 cursor-pointer"
                style={{ color: f.value ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                <option value="">Select an option…</option>
                {(field.options ?? []).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                           style={{ color: 'var(--color-text-muted)' }} />
            </div>
          )}
        />
      )

    case 'rating': {
      const maxR      = field.max || 5
      const isNumbers = field.iconStyle === 'numbers'
      const starSize  = maxR > 7 ? 22 : 30
      return (
        <Controller name={field.id} control={control} defaultValue={0}
          rules={{ validate: v => !field.required || v > 0 || `${field.label || 'This field'} is required` }}
          render={({ field: f }) => (
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: maxR }, (_, i) => i + 1).map(n => (
                <button key={n} type="button" onClick={() => f.onChange(n)}
                  className="transition-all duration-150"
                  style={{ color: n <= (f.value || 0) ? 'var(--color-accent)' : 'var(--color-border-strong)' }}>
                  {isNumbers ? (
                    <div className="w-10 h-10 rounded-input flex items-center justify-center text-[14px] font-semibold transition-all duration-150"
                         style={{
                           background: n <= (f.value || 0) ? 'var(--color-accent)' : 'var(--color-bg)',
                           color:      n <= (f.value || 0) ? 'white' : 'var(--color-text-secondary)',
                           border:     `0.5px solid ${n <= (f.value || 0) ? 'var(--color-accent)' : 'var(--color-border)'}`,
                         }}>
                      {n}
                    </div>
                  ) : (
                    <Star size={starSize} strokeWidth={1.5}
                      fill={n <= (f.value || 0) ? 'currentColor' : 'none'} />
                  )}
                </button>
              ))}
            </div>
          )}
        />
      )
    }

    case 'linear_scale': {
      const minL  = field.min ?? 1
      const maxL  = field.max ?? 10
      const valsL = Array.from({ length: maxL - minL + 1 }, (_, i) => i + minL)
      return (
        <Controller name={field.id} control={control} defaultValue={null}
          rules={{ validate: v => !field.required || v !== null || `${field.label || 'This field'} is required` }}
          render={({ field: f }) => (
            <div>
              <div className="flex gap-1.5 flex-wrap">
                {valsL.map(n => (
                  <button key={n} type="button" onClick={() => f.onChange(n)}
                    className="w-10 h-10 rounded-input flex items-center justify-center text-[14px] font-medium transition-all duration-150"
                    style={{
                      background: f.value === n ? 'var(--color-accent)' : 'var(--color-bg)',
                      color:      f.value === n ? 'white' : 'var(--color-text-secondary)',
                      border:     `0.5px solid ${f.value === n ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    }}>
                    {n}
                  </button>
                ))}
              </div>
              {(field.labelLeft || field.labelRight) && (
                <div className="flex justify-between mt-2">
                  <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{field.labelLeft}</span>
                  <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{field.labelRight}</span>
                </div>
              )}
            </div>
          )}
        />
      )
    }

    case 'nps':
      return (
        <Controller name={field.id} control={control} defaultValue={null}
          rules={{ validate: v => !field.required || v !== null || `${field.label || 'This field'} is required` }}
          render={({ field: f }) => (
            <div>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 11 }, (_, i) => i).map(n => {
                  const isPromoter  = n >= 9
                  const isDetractor = n <= 6
                  const sel = f.value === n
                  return (
                    <button key={n} type="button" onClick={() => f.onChange(n)}
                      className="min-w-[38px] h-10 px-1 rounded-input flex items-center justify-center text-[14px] font-medium transition-all duration-150"
                      style={{
                        background: sel ? (isPromoter ? 'var(--color-neon)' : isDetractor ? 'var(--color-danger)' : 'var(--color-accent)') : 'var(--color-bg)',
                        color:      sel ? 'white' : 'var(--color-text-secondary)',
                        border:     `0.5px solid ${sel ? 'transparent' : 'var(--color-border)'}`,
                      }}>
                      {n}
                    </button>
                  )
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[12px]" style={{ color: 'var(--color-danger)' }}>Not at all likely</span>
                <span className="text-[12px]" style={{ color: 'var(--color-neon)' }}>Extremely likely</span>
              </div>
            </div>
          )}
        />
      )

    default:
      return null
  }
}

/* ── Shared screen wrapper ──────────────────────────────────────────────── */

function Screen({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ background: 'var(--color-bg)' }}>
      {children}
    </div>
  )
}

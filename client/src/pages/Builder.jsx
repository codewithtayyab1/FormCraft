import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Save, ArrowLeft, Plus, Trash2, GripVertical,
  Type, AlignLeft, CircleDot, CheckSquare, ChevronDown,
  Mail, Hash, Star, X, Eye, EyeOff, Globe, Copy, Check,
  SlidersHorizontal, TrendingUp, GitBranch,
} from 'lucide-react'
import api from '../lib/api'
import { useToast } from '../context/ToastContext'

/* ── Constants ──────────────────────────────────────────────────────────── */

const FIELD_TYPES = [
  { type: 'short_text',      label: 'Short text',      icon: Type },
  { type: 'long_text',       label: 'Long text',       icon: AlignLeft },
  { type: 'multiple_choice', label: 'Multiple choice', icon: CircleDot },
  { type: 'checkbox',        label: 'Checkboxes',      icon: CheckSquare },
  { type: 'dropdown',        label: 'Dropdown',        icon: ChevronDown },
  { type: 'email',           label: 'Email',           icon: Mail },
  { type: 'number',          label: 'Number',          icon: Hash },
  { type: 'rating',          label: 'Rating',          icon: Star },
  { type: 'linear_scale',   label: 'Linear scale',    icon: SlidersHorizontal },
  { type: 'nps',            label: 'NPS',             icon: TrendingUp },
]

const HAS_OPTIONS     = ['multiple_choice', 'checkbox', 'dropdown']
const HAS_PLACEHOLDER = ['short_text', 'long_text', 'email', 'number']
const genId           = () => Math.random().toString(36).slice(2, 10)

/* ── Main builder page ──────────────────────────────────────────────────── */

export default function Builder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [form,     setForm]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [dirty,    setDirty]    = useState(false)
  const [savedMsg, setSavedMsg] = useState('') // 'saved' | 'error' | ''
  const [preview,  setPreview]  = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [copied,   setCopied]   = useState(false)

  const appOrigin = import.meta.env.VITE_APP_URL || window.location.origin
  const shareUrl  = form ? `${appOrigin}/f/${form.shareId}` : ''

  const togglePublish = async () => {
    try {
      const { data } = await api.put(`/forms/${id}`, { isPublished: !form.isPublished })
      setForm(f => ({ ...f, isPublished: data.isPublished }))
      toast(data.isPublished ? 'Form published — share the link!' : 'Form unpublished')
    } catch {
      toast('Could not update publish status', 'error')
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    api.get(`/forms/${id}`)
      .then(({ data }) => setForm(data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  /* patch: partial update to form state, marks dirty */
  const patch = changes => {
    setForm(f => ({ ...f, ...changes }))
    setDirty(true)
    setSavedMsg('')
  }

  /* field helpers */
  const addField = type => {
    const typeDefaults = {
      rating:       { max: 5, iconStyle: 'stars' },
      linear_scale: { min: 1, max: 10, labelLeft: '', labelRight: '' },
      nps:          { min: 0, max: 10, labelLeft: 'Not at all likely', labelRight: 'Extremely likely' },
    }
    const field = {
      id: genId(), type, label: '', placeholder: '', required: false,
      options: HAS_OPTIONS.includes(type) ? ['Option 1', 'Option 2'] : [],
      ...(typeDefaults[type] ?? {}),
    }
    patch({ fields: [...(form.fields ?? []), field] })
  }
  const updateField = (fid, changes) =>
    patch({ fields: form.fields.map(f => f.id === fid ? { ...f, ...changes } : f) })
  const removeField = fid =>
    patch({ fields: form.fields.filter(f => f.id !== fid) })

  /* drag handlers */
  const onDragStart = ({ active }) => setActiveId(active.id)
  const onDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const fields    = form.fields ?? []
    const reordered = arrayMove(
      fields,
      fields.findIndex(f => f.id === active.id),
      fields.findIndex(f => f.id === over.id),
    )
    // Auto-clear conditions that now reference a field at the same or later position
    const cleaned = reordered.map((f, i) => {
      if (!f.condition?.fieldId) return f
      const srcIdx = reordered.findIndex(s => s.id === f.condition.fieldId)
      return srcIdx >= i ? { ...f, condition: null } : f
    })
    patch({ fields: cleaned })
  }
  const onDragCancel = () => setActiveId(null)

  /* save */
  const save = async () => {
    setSaving(true); setSavedMsg('')
    try {
      const { data } = await api.put(`/forms/${id}`, {
        title: form.title, description: form.description, fields: form.fields,
      })
      setForm(data); setDirty(false); setSavedMsg('saved')
      toast('Form saved')
      setTimeout(() => setSavedMsg(''), 2500)
    } catch {
      setSavedMsg('error')
      toast('Failed to save — check your connection', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="w-6 h-6 rounded-full animate-spin"
           style={{ border: '2px solid var(--color-border-strong)', borderTopColor: 'var(--color-accent)' }} />
    </div>
  )

  const activeField = activeId ? (form.fields ?? []).find(f => f.id === activeId) : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50"
        style={{ background: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Left: back + title + unsaved badge */}
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/dashboard"
              className="shrink-0 p-1.5 rounded-input transition-colors duration-150"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
              <ArrowLeft size={18} />
            </Link>
            <span className="text-[13px] font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {form.title || 'Untitled form'}
            </span>
            {dirty && (
              <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-pill"
                    style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                Unsaved
              </span>
            )}
          </div>

          {/* Right: preview toggle + save feedback + save button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPreview(p => !p)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input text-[13px] font-medium transition-all duration-150"
              style={{
                color:      preview ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                background: preview ? 'var(--color-accent-soft)' : 'transparent',
                border:     `0.5px solid ${preview ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
              }}>
              {preview ? <EyeOff size={13} /> : <Eye size={13} />}
              {preview ? 'Edit' : 'Preview'}
            </button>

            {savedMsg === 'saved' && (
              <span className="text-[12px] font-medium" style={{ color: 'var(--color-neon)' }}>✓ Saved</span>
            )}
            {savedMsg === 'error' && (
              <span className="text-[12px] font-medium" style={{ color: 'var(--color-danger)' }}>Save failed</span>
            )}

            <button onClick={save} disabled={saving || !dirty}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input text-[13px] font-medium text-white transition-all duration-150"
              style={{
                background: 'var(--color-accent)',
                boxShadow:  dirty ? '0 0 16px rgba(139,92,246,0.30)' : 'none',
                opacity:    saving || !dirty ? 0.55 : 1,
                cursor:     saving || !dirty ? 'not-allowed' : 'pointer',
              }}>
              <Save size={13} />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {preview ? (
          <FormPreview form={form} />
        ) : (
          <>
            {/* Title + description */}
            <div className="mb-8">
              <input
                className="w-full bg-transparent text-[26px] font-semibold outline-none pb-2 mb-3 transition-colors duration-150"
                style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' }}
                placeholder="Form title"
                value={form.title ?? ''}
                onChange={e => patch({ title: e.target.value })}
                onFocus={e => (e.target.style.borderBottomColor = 'var(--color-accent)')}
                onBlur={e  => (e.target.style.borderBottomColor = 'var(--color-border)')}
              />
              <textarea
                className="w-full bg-transparent text-[14px] outline-none resize-none"
                style={{ color: 'var(--color-text-secondary)' }}
                placeholder="Add a description (optional)"
                rows={2}
                value={form.description ?? ''}
                onChange={e => patch({ description: e.target.value })}
              />
            </div>

            {/* ── Publish bar ─────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-card mb-6 flex-wrap"
                 style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
              {form.isPublished ? (
                <>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-neon)' }} />
                    <span className="text-[12px] font-medium" style={{ color: 'var(--color-neon)' }}>Published</span>
                  </div>
                  <code className="flex-1 min-w-0 text-[12px] px-2.5 py-1 rounded-input truncate"
                        style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '0.5px solid var(--color-border)' }}>
                    {shareUrl}
                  </code>
                  <button onClick={copyLink}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input text-[12px] font-medium transition-all duration-150"
                    style={{
                      color:   copied ? 'var(--color-neon)' : 'var(--color-accent)',
                      border:  `0.5px solid ${copied ? 'var(--color-neon)' : 'var(--color-accent)'}`,
                    }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                  <button onClick={togglePublish}
                    className="shrink-0 text-[12px] transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                    Unpublish
                  </button>
                </>
              ) : (
                <>
                  <Globe size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="flex-1 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    Not published — only you can see this form
                  </span>
                  <button onClick={togglePublish}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input text-[12px] font-medium transition-all duration-150 text-white"
                    style={{ background: 'var(--color-neon)' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <Globe size={12} />
                    Publish form
                  </button>
                </>
              )}
            </div>

            {/* ── Sortable fields ──────────────────────────────────── */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragCancel={onDragCancel}
            >
              <SortableContext
                items={(form.fields ?? []).map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 mb-5">
                  {(form.fields ?? []).length === 0 && (
                    <div className="py-12 text-center rounded-card"
                         style={{ border: '1px dashed var(--color-border-strong)' }}>
                      <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
                        Add your first field below
                      </p>
                    </div>
                  )}
                  {(form.fields ?? []).map((field, idx) => (
                    <SortableFieldCard
                      key={field.id}
                      field={field}
                      fieldIndex={idx}
                      allFields={form.fields}
                      onUpdate={changes => updateField(field.id, changes)}
                      onRemove={() => removeField(field.id)}
                    />
                  ))}
                </div>
              </SortableContext>

              {/* Floating card shown while dragging */}
              <DragOverlay
                dropAnimation={{ duration: 160, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}
              >
                {activeField && (
                  <div style={{ opacity: 0.92, boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }}>
                    <FieldCard field={activeField} isOverlay />
                  </div>
                )}
              </DragOverlay>
            </DndContext>

            <AddFieldPanel onAdd={addField} />
          </>
        )}
      </main>
    </div>
  )
}

/* ── Sortable wrapper ───────────────────────────────────────────────────── */

function SortableFieldCard({ field, fieldIndex, allFields, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:  CSS.Transform.toString(transform),
        transition,
        opacity:    isDragging ? 0.35 : 1,
        zIndex:     isDragging ? 0 : undefined,
      }}
    >
      <FieldCard
        field={field}
        fieldIndex={fieldIndex}
        allFields={allFields}
        dragHandleProps={{ attributes, listeners }}
        onUpdate={onUpdate}
        onRemove={onRemove}
      />
    </div>
  )
}

/* ── Field card ─────────────────────────────────────────────────────────── */

function FieldCard({ field, fieldIndex, allFields, dragHandleProps, isOverlay, onUpdate, onRemove }) {
  const [showLogic, setShowLogic] = useState(false)
  const meta = FIELD_TYPES.find(t => t.type === field.type)
  const Icon = meta?.icon ?? Type

  return (
    <div
      className="rounded-card"
      style={{
        background:  'var(--color-surface)',
        border:      `0.5px solid ${isOverlay ? 'var(--color-accent)' : 'var(--color-border)'}`,
        boxShadow:   isOverlay ? '0 0 0 1px var(--color-accent)' : undefined,
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">

        {/* Drag handle */}
        {!isOverlay && dragHandleProps && (
          <button
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
            tabIndex={-1}
            className="shrink-0 p-1 rounded cursor-grab active:cursor-grabbing transition-colors duration-150"
            style={{ color: 'var(--color-border-strong)', touchAction: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-border-strong)')}>
            <GripVertical size={16} strokeWidth={1.75} />
          </button>
        )}

        {/* Type badge */}
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[11px] font-medium"
              style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
          <Icon size={10} strokeWidth={2} />
          {meta?.label}
        </span>

        {/* Label input */}
        <input
          className="flex-1 bg-transparent text-[14px] font-medium outline-none pb-0.5 transition-colors duration-150 min-w-0"
          style={{ color: 'var(--color-text-primary)', borderBottom: '0.5px solid var(--color-border)' }}
          placeholder="Question / label"
          value={field.label}
          disabled={isOverlay}
          onChange={e => onUpdate?.({ label: e.target.value })}
          onFocus={e => (e.target.style.borderBottomColor = 'var(--color-accent)')}
          onBlur={e  => (e.target.style.borderBottomColor = 'var(--color-border)')}
        />

        {/* Required toggle + delete */}
        {!isOverlay && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onUpdate({ required: !field.required })}
              className="flex items-center gap-1.5 transition-all duration-150"
              title={field.required ? 'Required' : 'Optional'}>
              <div className="w-7 h-3.5 rounded-full relative transition-colors duration-150"
                   style={{ background: field.required ? 'var(--color-accent)' : 'var(--color-border-strong)' }}>
                <div className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-150"
                     style={{ left: field.required ? '14px' : '2px' }} />
              </div>
              <span className="text-[11px] hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>Req</span>
            </button>

            <button onClick={() => onRemove()}
              className="p-1.5 rounded-input transition-all duration-150"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--color-danger-soft)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}>
              <Trash2 size={14} />
            </button>

            {/* Logic toggle button — coloured when a condition is active */}
            <button
              onClick={() => setShowLogic(s => !s)}
              className="p-1.5 rounded-input transition-all duration-150"
              title={field.condition?.fieldId ? 'Edit condition' : 'Add condition'}
              style={{
                color:      field.condition?.fieldId ? 'var(--color-accent)' : 'var(--color-text-muted)',
                background: showLogic || field.condition?.fieldId ? 'var(--color-accent-soft)' : 'transparent',
              }}>
              <GitBranch size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Field-specific controls */}
      {!isOverlay && (
        <div className="px-4 pb-4 ml-8">
          {/* Placeholder text */}
          {HAS_PLACEHOLDER.includes(field.type) && (
            <input
              className="w-full bg-transparent text-[13px] outline-none"
              style={{ color: 'var(--color-text-muted)' }}
              placeholder="Placeholder hint (optional)"
              value={field.placeholder ?? ''}
              onChange={e => onUpdate({ placeholder: e.target.value })}
            />
          )}

          {/* Options */}
          {HAS_OPTIONS.includes(field.type) && (
            <div className="space-y-1.5">
              {(field.options ?? []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0"
                       style={{ border: '1.5px solid var(--color-border-strong)' }} />
                  <input
                    className="flex-1 bg-transparent text-[13px] outline-none pb-0.5 transition-colors duration-150"
                    style={{ color: 'var(--color-text-primary)', borderBottom: '0.5px solid var(--color-border)' }}
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => {
                      const opts = [...field.options]; opts[i] = e.target.value
                      onUpdate({ options: opts })
                    }}
                    onFocus={e => (e.target.style.borderBottomColor = 'var(--color-accent)')}
                    onBlur={e  => (e.target.style.borderBottomColor = 'var(--color-border)')}
                  />
                  {field.options.length > 1 && (
                    <button
                      onClick={() => onUpdate({ options: field.options.filter((_, j) => j !== i) })}
                      className="transition-colors duration-150"
                      style={{ color: 'var(--color-text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => onUpdate({ options: [...(field.options ?? []), ''] })}
                className="text-[12px] font-medium mt-0.5 transition-colors duration-150"
                style={{ color: 'var(--color-accent)' }}>
                + Add option
              </button>
            </div>
          )}

          {/* Rating config */}
          {field.type === 'rating' && (
            <div className="flex flex-wrap gap-5 pt-1">
              <div>
                <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Max</p>
                <div className="flex gap-1">
                  {[3, 5, 7, 10].map(n => (
                    <button key={n} type="button" onClick={() => onUpdate({ max: n })}
                      className="w-8 h-7 rounded-input text-[12px] font-medium transition-all duration-150"
                      style={{
                        background: (field.max ?? 5) === n ? 'var(--color-accent)' : 'var(--color-bg)',
                        color:      (field.max ?? 5) === n ? 'white' : 'var(--color-text-secondary)',
                        border:     `0.5px solid ${(field.max ?? 5) === n ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Style</p>
                <div className="flex gap-1">
                  {[['stars', '★ Stars'], ['numbers', '1 2 3']].map(([val, lbl]) => (
                    <button key={val} type="button" onClick={() => onUpdate({ iconStyle: val })}
                      className="px-2.5 h-7 rounded-input text-[12px] font-medium transition-all duration-150"
                      style={{
                        background: (field.iconStyle ?? 'stars') === val ? 'var(--color-accent)' : 'var(--color-bg)',
                        color:      (field.iconStyle ?? 'stars') === val ? 'white' : 'var(--color-text-secondary)',
                        border:     `0.5px solid ${(field.iconStyle ?? 'stars') === val ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Linear scale config */}
          {field.type === 'linear_scale' && (
            <div className="space-y-2.5 pt-1">
              <div className="flex flex-wrap gap-5">
                <div>
                  <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Min</p>
                  <div className="flex gap-1">
                    {[0, 1].map(n => (
                      <button key={n} type="button" onClick={() => onUpdate({ min: n })}
                        className="w-8 h-7 rounded-input text-[12px] font-medium transition-all duration-150"
                        style={{
                          background: (field.min ?? 1) === n ? 'var(--color-accent)' : 'var(--color-bg)',
                          color:      (field.min ?? 1) === n ? 'white' : 'var(--color-text-secondary)',
                          border:     `0.5px solid ${(field.min ?? 1) === n ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Max</p>
                  <div className="flex gap-1 flex-wrap">
                    {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button key={n} type="button" onClick={() => onUpdate({ max: n })}
                        className="w-7 h-7 rounded-input text-[12px] font-medium transition-all duration-150"
                        style={{
                          background: (field.max ?? 10) === n ? 'var(--color-accent)' : 'var(--color-bg)',
                          color:      (field.max ?? 10) === n ? 'white' : 'var(--color-text-secondary)',
                          border:     `0.5px solid ${(field.max ?? 10) === n ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input className="flex-1 bg-transparent text-[12px] outline-none"
                  style={{ color: 'var(--color-text-muted)' }}
                  placeholder="Left label (e.g. Disagree)"
                  value={field.labelLeft ?? ''}
                  onChange={e => onUpdate({ labelLeft: e.target.value })} />
                <input className="flex-1 bg-transparent text-[12px] outline-none text-right"
                  style={{ color: 'var(--color-text-muted)' }}
                  placeholder="Right label (e.g. Agree)"
                  value={field.labelRight ?? ''}
                  onChange={e => onUpdate({ labelRight: e.target.value })} />
              </div>
            </div>
          )}

          {/* NPS preview */}
          {field.type === 'nps' && (
            <div className="pt-1">
              <p className="text-[11px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Fixed 0–10 scale · Detractors 0–6 · Passives 7–8 · Promoters 9–10
              </p>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={i}
                    className="w-7 h-7 rounded-input flex items-center justify-center text-[11px] font-medium"
                    style={{
                      background: i <= 6 ? 'var(--color-danger-soft)' : i <= 8 ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                      color:      i <= 6 ? 'var(--color-danger)' : i <= 8 ? 'var(--color-text-muted)' : 'var(--color-neon)',
                      border:     '0.5px solid var(--color-border)',
                    }}>
                    {i}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logic editor panel */}
      {!isOverlay && showLogic && (
        <div className="px-4 pb-5 ml-8 pt-3" style={{ borderTop: '0.5px solid var(--color-border)' }}>
          <LogicEditor
            field={field}
            fieldIndex={fieldIndex}
            allFields={allFields}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  )
}

/* ── Logic editor ────────────────────────────────────────────────────────── */

const LOGIC_SOURCES = ['multiple_choice','dropdown','short_text','email','long_text','rating','number','linear_scale','nps']

function LogicEditor({ field, fieldIndex, allFields, onUpdate }) {
  const eligible = (allFields ?? []).slice(0, fieldIndex).filter(f => LOGIC_SOURCES.includes(f.type))
  const cond     = field.condition

  if (eligible.length === 0) {
    return (
      <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
        Add at least one earlier field first to use conditional logic.
      </p>
    )
  }

  if (!cond?.fieldId) {
    return (
      <button
        type="button"
        onClick={() => {
          const src = eligible[0]
          const isChoice = ['multiple_choice','dropdown'].includes(src.type)
          onUpdate({ condition: { fieldId: src.id, operator: 'equals', value: isChoice ? (src.options?.[0] ?? '') : '' } })
        }}
        className="text-[12px] font-medium transition-colors duration-150"
        style={{ color: 'var(--color-accent)' }}>
        + Add show condition
      </button>
    )
  }

  const src       = eligible.find(f => f.id === cond.fieldId) ?? eligible[0]
  const isChoice  = ['multiple_choice','dropdown'].includes(src?.type)
  const set       = patch => onUpdate({ condition: { ...cond, ...patch } })

  const selectStyle = {
    background: 'var(--color-bg)', color: 'var(--color-text-primary)',
    border: '0.5px solid var(--color-border)', borderRadius: '8px',
    padding: '4px 8px', fontSize: '12px', height: '30px', outline: 'none',
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
        Show this field only when
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {/* Source field */}
        <select value={cond.fieldId} style={selectStyle}
          onChange={e => {
            const s = eligible.find(f => f.id === e.target.value)
            const ic = ['multiple_choice','dropdown'].includes(s?.type)
            onUpdate({ condition: { fieldId: e.target.value, operator: 'equals', value: ic ? (s?.options?.[0] ?? '') : '' } })
          }}>
          {eligible.map(f => <option key={f.id} value={f.id}>{f.label || `(${f.type})`}</option>)}
        </select>

        {/* Operator */}
        <select value={cond.operator ?? 'equals'} style={selectStyle}
          onChange={e => set({ operator: e.target.value, value: isChoice ? (src?.options?.[0] ?? '') : '' })}>
          <option value="equals">equals</option>
          <option value="not_equals">does not equal</option>
          {isChoice && <option value="is_one_of">is one of</option>}
        </select>

        {/* Value */}
        {isChoice ? (
          cond.operator === 'is_one_of' ? (
            <div className="flex flex-wrap gap-1">
              {(src?.options ?? []).map(opt => {
                const vals = Array.isArray(cond.value) ? cond.value : []
                const on   = vals.includes(opt)
                return (
                  <button key={opt} type="button"
                    onClick={() => set({ value: on ? vals.filter(v => v !== opt) : [...vals, opt] })}
                    className="px-2 py-0.5 rounded-pill text-[11px] font-medium transition-all duration-150"
                    style={{
                      background: on ? 'var(--color-accent)' : 'var(--color-bg)',
                      color:      on ? 'white' : 'var(--color-text-secondary)',
                      border:     `0.5px solid ${on ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    }}>
                    {opt}
                  </button>
                )
              })}
            </div>
          ) : (
            <select value={typeof cond.value === 'string' ? cond.value : ''} style={selectStyle}
              onChange={e => set({ value: e.target.value })}>
              <option value="">Pick a value…</option>
              {(src?.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )
        ) : (
          <input
            value={typeof cond.value === 'string' ? cond.value : String(cond.value ?? '')}
            onChange={e => set({ value: e.target.value })}
            placeholder="value"
            style={{ ...selectStyle, width: '110px' }}
          />
        )}
      </div>

      <button type="button" onClick={() => onUpdate({ condition: null })}
        className="text-[11px] transition-colors duration-150"
        style={{ color: 'var(--color-danger)' }}>
        Remove condition
      </button>
    </div>
  )
}

/* ── Add field panel ────────────────────────────────────────────────────── */

function AddFieldPanel({ onAdd }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full py-3 rounded-card text-[13px] font-medium flex items-center justify-center gap-2 transition-all duration-150"
        style={{
          border:     `1px dashed ${open ? 'var(--color-accent)' : 'var(--color-border-strong)'}`,
          color:      open ? 'var(--color-accent)' : 'var(--color-text-muted)',
          background: open ? 'var(--color-accent-soft)' : 'transparent',
        }}>
        <Plus size={14} />
        Add field
      </button>

      {open && (
        <div className="mt-2 rounded-card p-4"
             style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
          <p className="text-[11px] font-medium uppercase tracking-widest mb-3"
             style={{ color: 'var(--color-text-muted)' }}>
            Field type
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => { onAdd(type); setOpen(false) }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-input text-[13px] font-medium text-left transition-all duration-150"
                style={{ color: 'var(--color-text-secondary)', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-soft)'; e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}>
                <Icon size={14} strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Form preview ───────────────────────────────────────────────────────── */

function FormPreview({ form }) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="rounded-card px-8 py-7 mb-4"
           style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
        <h1 className="text-[22px] font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {form.title || 'Untitled form'}
        </h1>
        {form.description && (
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {form.description}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {(form.fields ?? []).map(field => (
          <div key={field.id} className="rounded-card px-6 py-5"
               style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
            <label className="block text-[14px] font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
              {field.label || <span style={{ color: 'var(--color-text-muted)' }}>Untitled question</span>}
              {field.required && <span className="ml-1" style={{ color: 'var(--color-accent)' }}>*</span>}
            </label>
            <PreviewField field={field} />
          </div>
        ))}
      </div>

      {(form.fields ?? []).length > 0 && (
        <button
          className="w-full mt-4 py-3 rounded-input text-[14px] font-medium text-white"
          style={{ background: 'var(--color-accent)', boxShadow: '0 0 20px rgba(139,92,246,0.30)' }}>
          Submit
        </button>
      )}

      {(form.fields ?? []).length === 0 && (
        <div className="py-12 text-center rounded-card"
             style={{ border: '1px dashed var(--color-border-strong)' }}>
          <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
            No fields yet — switch to Edit to add some
          </p>
        </div>
      )}
    </div>
  )
}

function PreviewField({ field }) {
  const base = {
    display: 'block', width: '100%', height: '44px', padding: '0 12px',
    background: 'var(--color-bg)', border: '0.5px solid var(--color-border)',
    borderRadius: '10px', color: 'var(--color-text-muted)', fontSize: '14px', outline: 'none',
  }

  switch (field.type) {
    case 'short_text':
    case 'email':
    case 'number':
      return (
        <div style={base} className="flex items-center">
          <span style={{ color: 'var(--color-text-muted)' }}>{field.placeholder || 'Your answer'}</span>
        </div>
      )
    case 'long_text':
      return (
        <div style={{ ...base, height: '88px', padding: '10px 12px', alignItems: 'flex-start', display: 'flex' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>{field.placeholder || 'Your answer'}</span>
        </div>
      )
    case 'multiple_choice':
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((opt, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer">
              <div className="w-4 h-4 rounded-full shrink-0"
                   style={{ border: '1.5px solid var(--color-border-strong)' }} />
              <span className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{opt || `Option ${i + 1}`}</span>
            </label>
          ))}
        </div>
      )
    case 'checkbox':
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((opt, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer">
              <div className="w-4 h-4 rounded shrink-0"
                   style={{ border: '1.5px solid var(--color-border-strong)' }} />
              <span className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>{opt || `Option ${i + 1}`}</span>
            </label>
          ))}
        </div>
      )
    case 'dropdown':
      return (
        <div className="flex items-center justify-between px-3 rounded-input h-11"
             style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            {field.options?.[0] || 'Select an option'}
          </span>
          <ChevronDown size={15} style={{ color: 'var(--color-text-muted)' }} />
        </div>
      )
    case 'rating':
      return (
        <div className="flex gap-1.5">
          {[1,2,3,4,5].map(n => (
            <Star key={n} size={26} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)' }} />
          ))}
        </div>
      )
    default:
      return null
  }
}

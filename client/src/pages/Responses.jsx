import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, Zap, BarChart2, List, Trash2, Star, Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import api from '../lib/api'
import { downloadCSV, downloadXLSX } from '../lib/exportResponses'

/* ── Theme-aware colours for recharts ───────────────────────────────────── */

function useChartColors() {
  const { resolved } = useTheme()
  return useMemo(() => {
    const g = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim()
    return {
      accent:    g('--color-accent'),
      neon:      g('--color-neon'),
      surface:   g('--color-surface'),
      bg:        g('--color-bg'),
      border:    g('--color-border'),
      textMuted: g('--color-text-muted'),
      textPri:   g('--color-text-primary'),
    }
  }, [resolved])
}

function ChartTooltip({ active, payload, label, c }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: c.surface, border: `0.5px solid ${c.border}`,
      borderRadius: '10px', padding: '8px 12px', fontSize: '13px',
    }}>
      {label && <p style={{ color: c.textMuted, fontSize: '11px', marginBottom: 2 }}>{label}</p>}
      <p style={{ color: c.textPri, fontWeight: 500 }}>
        {payload[0].value} {payload[0].value === 1 ? 'response' : 'responses'}
      </p>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const CHOICE_TYPES = ['multiple_choice', 'dropdown', 'checkbox']

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatCell(value, type) {
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.join(', ') || '—'
  if (type === 'rating') return `${value} / 5`
  return String(value)
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export default function Responses() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form,      setForm]      = useState(null)
  const [responses, setResponses] = useState([])
  const [summary,   setSummary]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [view,      setView]      = useState('summary')
  const [deleteId,  setDeleteId]  = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/forms/${id}`),
      api.get(`/forms/${id}/responses`),
      api.get(`/forms/${id}/responses/summary`),
    ])
      .then(([fRes, rRes, sRes]) => {
        setForm(fRes.data)
        setResponses(rRes.data)
        setSummary(sRes.data)
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleDelete = async (rid) => {
    await api.delete(`/forms/${id}/responses/${rid}`)
    setResponses(prev => prev.filter(r => r._id !== rid))
    setSummary(prev => prev ? { ...prev, total: prev.total - 1 } : prev)
    setDeleteId(null)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="w-6 h-6 rounded-full animate-spin"
           style={{ border: '2px solid var(--color-border-strong)', borderTopColor: 'var(--color-accent)' }} />
    </div>
  )

  const noResponses = responses.length === 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50"
        style={{ background: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/dashboard"
              className="shrink-0 p-1.5 rounded-input transition-colors duration-150"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                {form.title || 'Untitled form'}
              </span>
              <span className="shrink-0 text-[13px] font-semibold px-2.5 py-0.5 rounded-pill"
                    style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                {summary?.total ?? 0}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ExportMenu form={form} responses={responses} />
            <Link to={`/builder/${id}`}
              className="text-[13px] font-medium transition-colors duration-150"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
              Edit form
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stat + view toggle */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest mb-1"
               style={{ color: 'var(--color-text-muted)' }}>Total responses</p>
            <p className="text-[42px] font-semibold leading-none"
               style={{ color: 'var(--color-neon)' }}>
              {summary?.total ?? 0}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex items-center rounded-pill p-1 gap-1"
               style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
            {[
              { key: 'summary', label: 'Summary', icon: BarChart2 },
              { key: 'table',   label: 'Responses', icon: List },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setView(key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[13px] font-medium transition-all duration-150"
                style={{
                  background: view === key ? 'var(--color-accent)' : 'transparent',
                  color:      view === key ? 'white' : 'var(--color-text-muted)',
                }}>
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {noResponses && (
          <div className="py-20 text-center rounded-card"
               style={{ border: '1px dashed var(--color-border-strong)' }}>
            <p className="text-[16px] font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              No responses yet
            </p>
            <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
              Share your form to start collecting responses.
            </p>
          </div>
        )}

        {!noResponses && view === 'summary' && (
          <SummaryView form={form} summary={summary} />
        )}

        {!noResponses && view === 'table' && (
          <TableView
            form={form}
            responses={responses}
            onDelete={setDeleteId}
          />
        )}
      </main>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
             style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-card p-6"
               style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
            <h2 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Delete response?
            </h2>
            <p className="text-[13px] mb-6" style={{ color: 'var(--color-text-muted)' }}>
              This response will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-input text-[13px] font-medium"
                style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-input text-[13px] font-medium"
                style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', border: '0.5px solid var(--color-danger)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Summary view ─────────────────────────────────────────────────────────── */

function SummaryView({ form, summary }) {
  const c = useChartColors()

  const timeData = (summary.byDay ?? []).map(d => ({
    date:  d.date.slice(5), // MM-DD
    count: d.count,
  }))

  return (
    <div className="space-y-6">
      {/* Time series */}
      <ChartCard title="Responses over time (last 30 days)">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={timeData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={c.accent} stopOpacity={0.25} />
                <stop offset="95%" stopColor={c.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: c.textMuted }} axisLine={false} tickLine={false}
                   interval={Math.floor(timeData.length / 6)} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: c.textMuted }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={props => <ChartTooltip {...props} c={c} />} />
            <Area type="monotone" dataKey="count" stroke={c.accent} fill="url(#aGrad)"
                  strokeWidth={2} dot={false} activeDot={{ r: 4, fill: c.accent, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Field charts */}
      {form.fields
        .filter(f => CHOICE_TYPES.includes(f.type) || ['rating','linear_scale','nps'].includes(f.type))
        .map(field => {
          const fs = summary.fieldSummaries?.[field.id]
          if (!fs) return null

          if (['rating', 'linear_scale', 'nps'].includes(fs.type)) {
            const minV     = fs.min ?? 1
            const maxV     = fs.max ?? 5
            const distData = Array.from({ length: maxV - minV + 1 }, (_, i) => i + minV)
              .map(n => ({
                label: fs.type === 'rating' ? `${n}★` : String(n),
                count: fs.distribution[n] ?? 0,
              }))

            return (
              <ChartCard key={field.id} title={fs.label || fs.type}>
                {/* NPS score band */}
                {fs.type === 'nps' && fs.npsScore !== undefined && (
                  <div className="flex items-center gap-6 mb-5 p-4 rounded-card"
                       style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)' }}>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5"
                         style={{ color: 'var(--color-text-muted)' }}>NPS score</p>
                      <p className="text-[40px] font-semibold leading-none"
                         style={{ color: fs.npsScore >= 0 ? 'var(--color-neon)' : 'var(--color-danger)' }}>
                        {fs.npsScore > 0 ? '+' : ''}{fs.npsScore}
                      </p>
                    </div>
                    <div className="flex gap-4 text-center">
                      {[
                        { label: 'Promoters', val: fs.promoters, color: 'var(--color-neon)' },
                        { label: 'Passives',  val: fs.passives,  color: 'var(--color-text-muted)' },
                        { label: 'Detractors',val: fs.detractors,color: 'var(--color-danger)' },
                      ].map(({ label, val, color }) => (
                        <div key={label}>
                          <p className="text-[22px] font-semibold leading-none mb-0.5" style={{ color }}>{val}</p>
                          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Average + stars (rating only) */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5"
                       style={{ color: 'var(--color-text-muted)' }}>Average</p>
                    <p className="text-[36px] font-semibold leading-none"
                       style={{ color: 'var(--color-neon)' }}>
                      {fs.avg ?? '—'}
                    </p>
                  </div>
                  {fs.type === 'rating' && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: maxV }, (_, i) => i + 1).map(n => (
                        <Star key={n} size={16} strokeWidth={1.5}
                          style={{ color: n <= Math.round(fs.avg) ? 'var(--color-accent)' : 'var(--color-border-strong)' }}
                          fill={n <= Math.round(fs.avg) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  )}
                  <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    from {fs.count} response{fs.count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Distribution chart */}
                <ResponsiveContainer width="100%" height={Math.max(110, distData.length * 22)}>
                  <BarChart data={distData} margin={{ top: 0, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: c.textMuted }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: c.textMuted }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip content={props => <ChartTooltip {...props} c={c} />} />
                    <Bar dataKey="count" fill={c.neon} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )
          }

          // Choice (multiple_choice, dropdown, checkbox)
          const chartData = Object.entries(fs.options)
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count)

          return (
            <ChartCard key={field.id} title={field.label || 'Choice'}>
              <ResponsiveContainer width="100%" height={Math.max(chartData.length * 44, 80)}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.border} horizontal={false} />
                  <XAxis type="number" allowDecimals={false}
                    tick={{ fontSize: 11, fill: c.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" width={140}
                    tick={{ fontSize: 12, fill: c.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip content={props => <ChartTooltip {...props} c={c} />} />
                  <Bar dataKey="count" fill={c.accent} radius={[0, 4, 4, 0]} maxBarSize={28} label={{ position: 'right', fontSize: 12, fill: c.textMuted }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )
        })}
    </div>
  )
}

/* ── Export menu ──────────────────────────────────────────────────────────── */

function ExportMenu({ form, responses }) {
  const [open, setOpen] = useState(false)
  const disabled = responses.length === 0

  const run = (fn) => {
    setOpen(false)
    fn(form, responses)
  }

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input text-[13px] font-medium transition-all duration-150"
        title={disabled ? 'No responses to export yet' : 'Export responses'}
        style={{
          color:   'var(--color-text-secondary)',
          border:  '0.5px solid var(--color-border-strong)',
          opacity: disabled ? 0.45 : 1,
          cursor:  disabled ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
      >
        <Download size={13} />
        Export
        <ChevronDown
          size={12}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}
        />
      </button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-1.5 z-20 rounded-card overflow-hidden"
            style={{
              background:  'var(--color-surface)',
              border:      '0.5px solid var(--color-border)',
              boxShadow:   '0 8px 24px rgba(0,0,0,0.15)',
              minWidth:    '170px',
            }}
          >
            {[
              { label: 'Download CSV',   icon: FileText,        fn: downloadCSV },
              { label: 'Download Excel', icon: FileSpreadsheet, fn: downloadXLSX },
            ].map(({ label, icon: Icon, fn }, i) => (
              <div key={label}>
                {i > 0 && <div style={{ height: '0.5px', background: 'var(--color-border)' }} />}
                <button
                  onClick={() => run(fn)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-left transition-colors duration-150"
                  style={{ color: 'var(--color-text-primary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={14} style={{ color: 'var(--color-text-muted)' }} />
                  {label}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-card p-6"
         style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
      <p className="text-[13px] font-medium mb-5" style={{ color: 'var(--color-text-secondary)' }}>{title}</p>
      {children}
    </div>
  )
}

/* ── Table view ───────────────────────────────────────────────────────────── */

function TableView({ form, responses, onDelete }) {
  const visibleFields = form.fields ?? []

  return (
    <div className="rounded-card overflow-hidden"
         style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px] border-collapse">
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--color-border)' }}>
              <th className="text-left px-4 py-3 font-medium whitespace-nowrap"
                  style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg)' }}>
                Submitted
              </th>
              {visibleFields.map(f => (
                <th key={f.id}
                  className="text-left px-4 py-3 font-medium max-w-[200px]"
                  style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg)' }}>
                  <span className="block truncate">{f.label || '—'}</span>
                </th>
              ))}
              <th style={{ background: 'var(--color-bg)', width: '40px' }} />
            </tr>
          </thead>
          <tbody>
            {responses.map((response, ri) => (
              <tr key={response._id}
                style={{ borderTop: ri === 0 ? 'none' : `0.5px solid var(--color-border)` }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td className="px-4 py-3 whitespace-nowrap"
                    style={{ color: 'var(--color-text-muted)' }}>
                  {formatDate(response.createdAt)}
                </td>
                {visibleFields.map(field => {
                  const ans = response.answers?.find(a => a.fieldId === field.id)
                  return (
                    <td key={field.id} className="px-4 py-3 max-w-[200px]"
                        style={{ color: 'var(--color-text-primary)' }}>
                      <span className="block truncate" title={formatCell(ans?.value, field.type)}>
                        {formatCell(ans?.value, field.type)}
                      </span>
                    </td>
                  )
                })}
                <td className="px-2 py-3">
                  <button onClick={() => onDelete(response._id)}
                    className="p-1.5 rounded-input transition-all duration-150"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--color-danger-soft)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

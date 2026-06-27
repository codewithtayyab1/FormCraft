import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Zap, Plus, Pencil, Trash2, LogOut, FileText, BarChart2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import TemplatePickerModal from '../components/TemplatePickerModal'
import PageError from '../components/PageError'
import { useToast } from '../context/ToastContext'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [creating,     setCreating]     = useState(false)
  const [deleteId,     setDeleteId]     = useState(null)
  const [showPicker,   setShowPicker]   = useState(false)

  const loadForms = () => {
    setLoading(true); setLoadError(false)
    api.get('/forms')
      .then(({ data }) => setForms(data))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadForms() }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const { data } = await api.post('/forms')
      navigate(`/builder/${data._id}`)
    } catch {
      setCreating(false)
    }
  }

  const handleCreateFromTemplate = async (template) => {
    setShowPicker(false)
    setCreating(true)
    try {
      const genId = () => Math.random().toString(36).slice(2, 10)
      const fields = template.fields.map(f => ({ ...f, id: genId() }))
      const { data } = await api.post('/forms', {
        title:       template.title,
        description: template.description,
        fields,
      })
      navigate(`/builder/${data._id}`)
    } catch {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/forms/${id}`)
      setForms(prev => prev.filter(f => f._id !== id))
      toast('Form deleted')
    } catch {
      toast('Could not delete form', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  const handleLogout = () => { logout(); navigate('/'); toast('Logged out', 'info') }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Helmet>
        <title>My forms — FormCraft</title>
        <meta name="description" content="Manage your FormCraft forms, view responses, and create new surveys." />
      </Helmet>
      {/* Header */}
      <header className="sticky top-0 z-50"
        style={{ background: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
              <Zap size={14} color="white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>FormCraft</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[13px] hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>{user?.name}</span>
            <button onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input text-[13px] font-medium transition-all duration-150"
              style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.borderColor = 'var(--color-danger)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border-strong)' }}>
              <LogOut size={13} /> Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[26px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>My forms</h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {forms.length} form{forms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowPicker(true)} disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-input text-[14px] font-medium text-white transition-all duration-150"
            style={{ background: 'var(--color-accent)', boxShadow: '0 0 20px rgba(139,92,246,0.30)', opacity: creating ? 0.7 : 1 }}
            onMouseEnter={e => { if (!creating) { e.currentTarget.style.background = 'var(--color-accent-hover)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(139,92,246,0.45)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.30)' }}>
            <Plus size={16} />
            {creating ? 'Creating…' : 'New form'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 rounded-full animate-spin"
                 style={{ border: '2px solid var(--color-border-strong)', borderTopColor: 'var(--color-accent)' }} />
          </div>
        )}

        {/* Load error */}
        {!loading && loadError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[15px] font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Couldn't load your forms
            </p>
            <p className="text-[13px] mb-5" style={{ color: 'var(--color-text-muted)' }}>Check your connection and try again.</p>
            <button onClick={loadForms}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-input text-[13px] font-medium transition-all duration-150"
              style={{ color: 'var(--color-accent)', border: '0.5px solid var(--color-accent)' }}>
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !loadError && forms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-card flex items-center justify-center mb-4"
                 style={{ background: 'var(--color-accent-soft)' }}>
              <FileText size={24} style={{ color: 'var(--color-accent)' }} strokeWidth={1.5} />
            </div>
            <h2 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Build your first form
            </h2>
            <p className="text-[14px] mb-6 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
              Create a form in minutes and start collecting responses right away.
            </p>
            <button onClick={() => setShowPicker(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-input text-[14px] font-medium text-white"
              style={{ background: 'var(--color-accent)' }}>
              <Plus size={15} /> Create my first form
            </button>
          </div>
        )}

        {/* Form grid */}
        {!loading && !loadError && forms.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map(form => (
              <div key={form._id}
                className="rounded-card p-5 flex flex-col gap-3 transition-all duration-150"
                style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.background = 'var(--color-surface-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-surface)' }}>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold truncate mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                      {form.title || 'Untitled form'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                        {form.fieldCount} field{form.fieldCount !== 1 ? 's' : ''}
                      </p>
                      {form.responseCount > 0 && (
                        <>
                          <span style={{ color: 'var(--color-border-strong)' }}>·</span>
                          <p className="text-[12px] font-medium" style={{ color: 'var(--color-neon)' }}>
                            {form.responseCount} response{form.responseCount !== 1 ? 's' : ''}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {form.isPublished && (
                    <span className="shrink-0 px-2 py-0.5 rounded-pill text-[11px] font-medium"
                          style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                      Live
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-auto pt-1">
                  <button onClick={() => navigate(`/builder/${form._id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-input text-[13px] font-medium transition-all duration-150"
                    style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => navigate(`/forms/${form._id}/responses`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-input text-[13px] font-medium transition-all duration-150"
                    style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-neon)'; e.currentTarget.style.color = 'var(--color-neon)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}>
                    <BarChart2 size={13} /> Results
                  </button>
                  <button onClick={() => setDeleteId(form._id)}
                    className="p-2 rounded-input transition-all duration-150"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--color-danger-soft)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
             style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-card p-6"
               style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
            <h2 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Delete form?
            </h2>
            <p className="text-[13px] mb-6" style={{ color: 'var(--color-text-muted)' }}>
              This can't be undone. All responses will also be deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-input text-[13px] font-medium transition-all duration-150"
                style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-input text-[13px] font-medium transition-all duration-150"
                style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', border: '0.5px solid var(--color-danger)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template picker modal */}
      {showPicker && (
        <TemplatePickerModal
          onClose={() => setShowPicker(false)}
          onBlank={() => { setShowPicker(false); handleCreate() }}
          onTemplate={handleCreateFromTemplate}
        />
      )}
    </div>
  )
}

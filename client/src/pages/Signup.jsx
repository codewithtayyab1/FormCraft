import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet-async'
import { Zap, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async ({ name, email, password }) => {
    setServerError('')
    try {
      await signup(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong. Try again.')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--color-bg)' }}
    >
      <Helmet>
        <title>Create account — FormCraft</title>
        <meta name="description" content="Sign up for FormCraft free. Build beautiful forms and surveys in minutes." />
      </Helmet>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
          <Zap size={16} color="white" strokeWidth={2.5} />
        </div>
        <span className="text-[17px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>FormCraft</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm rounded-card p-8"
           style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
        <h1 className="text-[22px] font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Create your account
        </h1>
        <p className="text-[13px] mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Free forever on the starter plan
        </p>

        {serverError && (
          <div className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-input text-[13px]"
               style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', border: '0.5px solid var(--color-danger)' }}>
            <AlertCircle size={14} strokeWidth={2} />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Full name" error={errors.name?.message}>
            <input
              className="fc-input"
              type="text"
              placeholder="Sarah Johnson"
              {...register('name', { required: 'Name is required' })}
            />
          </Field>

          <Field label="Email address" error={errors.email?.message}>
            <input
              className="fc-input"
              type="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <input
              className="fc-input"
              type="password"
              placeholder="At least 6 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-input text-[14px] font-medium text-white transition-all duration-150"
            style={{
              background: 'var(--color-accent)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.30)',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="mt-5 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" className="font-medium" style={{ color: 'var(--color-accent)' }}>
          Log in
        </Link>
      </p>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[12px]" style={{ color: 'var(--color-danger)' }}>{error}</p>}
    </div>
  )
}

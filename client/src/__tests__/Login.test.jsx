import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Login from '../pages/Login'

/* ── module mocks ──────────────────────────────────────────────────────── */

const mockLogin    = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  }
})

vi.mock('react-helmet-async', () => ({
  Helmet: () => null,
}))

/* ── tests ─────────────────────────────────────────────────────────────── */

describe('Login page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders email field, password field, and submit button', () => {
    render(<Login />)
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('shows validation error when submitted with no email', async () => {
    render(<Login />)
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email format', async () => {
    render(<Login />)
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
  })

  it('calls login() and navigates to /dashboard on valid submit', async () => {
    mockLogin.mockResolvedValueOnce({})
    render(<Login />)
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com')
    await userEvent.type(screen.getByPlaceholderText('Your password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('alice@test.com', 'password123')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows a server error message when login() rejects', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { error: 'Invalid email or password' } },
    })
    render(<Login />)
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com')
    await userEvent.type(screen.getByPlaceholderText('Your password'), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

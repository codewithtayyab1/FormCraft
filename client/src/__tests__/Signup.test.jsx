import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Signup from '../pages/Signup'

/* ── module mocks ──────────────────────────────────────────────────────── */

const mockSignup   = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ signup: mockSignup }),
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

describe('Signup page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders name, email, password fields and a submit button', () => {
    render(<Signup />)
    expect(screen.getByPlaceholderText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/at least 6/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows required validation errors on empty submit', async () => {
    render(<Signup />)
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
  })

  it('shows an error when password is too short', async () => {
    render(<Signup />)
    await userEvent.type(screen.getByPlaceholderText('Sarah Johnson'), 'Alice')
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com')
    await userEvent.type(screen.getByPlaceholderText(/at least 6/i), '123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText(/min 6/i)).toBeInTheDocument()
  })

  it('calls signup() with correct args and navigates to /dashboard', async () => {
    mockSignup.mockResolvedValueOnce({})
    render(<Signup />)
    await userEvent.type(screen.getByPlaceholderText('Sarah Johnson'), 'Alice')
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com')
    await userEvent.type(screen.getByPlaceholderText(/at least 6/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('Alice', 'alice@test.com', 'password123')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows a server error message when signup() rejects with duplicate email', async () => {
    mockSignup.mockRejectedValueOnce({
      response: { data: { error: 'An account with that email already exists' } },
    })
    render(<Signup />)
    await userEvent.type(screen.getByPlaceholderText('Sarah Johnson'), 'Alice')
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@test.com')
    await userEvent.type(screen.getByPlaceholderText(/at least 6/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText(/already exists/i)).toBeInTheDocument()
  })
})

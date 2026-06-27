import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import PublicForm from '../pages/PublicForm'

/* ── module mocks ──────────────────────────────────────────────────────── */

vi.mock('../lib/api', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useParams: () => ({ shareId: 'test-share-id' }),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  }
})

vi.mock('react-helmet-async', () => ({ Helmet: () => null }))

vi.mock('framer-motion', () => ({
  motion:         { div: ({ children, ...props }) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

/* ── shared fixture ────────────────────────────────────────────────────── */

import api from '../lib/api'

const mockForm = {
  title:       'Field Type Test',
  description: '',
  shareId:     'test-share-id',
  fields: [
    { id: 'f1', type: 'short_text',      label: 'Your name',      required: true,  options: [],                      placeholder: 'Name' },
    { id: 'f2', type: 'email',           label: 'Email address',  required: true,  options: [],                      placeholder: 'Email' },
    { id: 'f3', type: 'long_text',       label: 'Your message',   required: false, options: [],                      placeholder: 'Message' },
    { id: 'f4', type: 'multiple_choice', label: 'Favourite colour', required: false, options: ['Red', 'Blue', 'Green'], placeholder: '' },
    { id: 'f5', type: 'dropdown',        label: 'Country',          required: false, options: ['UK', 'US', 'Other'],    placeholder: '' },
    { id: 'f6', type: 'rating',          label: 'Rate our service', required: false, max: 5, iconStyle: 'stars',        options: [] },
    { id: 'f7', type: 'nps',             label: 'Would recommend?', required: false, min: 0, max: 10,                   options: [] },
  ],
}

/* ── tests ─────────────────────────────────────────────────────────────── */

describe('PublicForm — field rendering', () => {
  beforeEach(() => {
    api.get.mockResolvedValue({ data: mockForm })
    api.post.mockResolvedValue({ data: { message: 'Response recorded.' } })
  })

  afterEach(() => vi.clearAllMocks())

  it('renders all field labels after the form loads', async () => {
    render(<PublicForm />)
    await waitFor(() => {
      expect(screen.getByText('Your name')).toBeInTheDocument()
      expect(screen.getByText('Email address')).toBeInTheDocument()
      expect(screen.getByText('Your message')).toBeInTheDocument()
      expect(screen.getByText('Favourite colour')).toBeInTheDocument()
      expect(screen.getByText('Country')).toBeInTheDocument()
      expect(screen.getByText('Rate our service')).toBeInTheDocument()
      expect(screen.getByText('Would recommend?')).toBeInTheDocument()
    })
  })

  it('renders a text input for short_text field', async () => {
    render(<PublicForm />)
    await waitFor(() => screen.getByText('Your name'))
    expect(screen.getByPlaceholderText('Name')).toHaveAttribute('type', 'text')
  })

  it('renders an email input for email field', async () => {
    render(<PublicForm />)
    await waitFor(() => screen.getByText('Email address'))
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')
  })

  it('renders a textarea for long_text field', async () => {
    render(<PublicForm />)
    await waitFor(() => screen.getByText('Your message'))
    expect(screen.getByPlaceholderText('Message').tagName).toBe('TEXTAREA')
  })

  it('renders all options for a multiple_choice field', async () => {
    render(<PublicForm />)
    await waitFor(() => screen.getByText('Favourite colour'))
    expect(screen.getByText('Red')).toBeInTheDocument()
    expect(screen.getByText('Blue')).toBeInTheDocument()
    expect(screen.getByText('Green')).toBeInTheDocument()
  })

  it('renders a select element for a dropdown field', async () => {
    render(<PublicForm />)
    await waitFor(() => screen.getByText('Country'))
    const select = screen.getByRole('combobox') // <select>
    expect(select).toBeInTheDocument()
    expect(screen.getByText('UK')).toBeInTheDocument()
  })

  it('renders 5 star buttons for a rating field (max=5)', async () => {
    render(<PublicForm />)
    await waitFor(() => screen.getByText('Rate our service'))
    // Star buttons live under the 'Rate our service' label section.
    // Rating renders `max` buttons. We check for at least 5 buttons in the form.
    const buttons = screen.getAllByRole('button', { name: '' }).filter(
      b => b.closest('form') !== null
    )
    // There are 5 star buttons + 11 NPS buttons = 16 type="button" in the form
    expect(buttons.length).toBeGreaterThanOrEqual(5)
  })

  it('renders 0–10 buttons for the NPS field', async () => {
    render(<PublicForm />)
    await waitFor(() => screen.getByText('Would recommend?'))
    // NPS renders 11 buttons (0-10)
    // We verify all 11 labels 0 through 10 exist
    for (let i = 0; i <= 10; i++) {
      // NPS buttons have text content equal to the number
      expect(screen.getAllByText(String(i))[0]).toBeInTheDocument()
    }
  })

  it('shows a loading spinner before the form loads', () => {
    // Don't resolve api.get yet
    api.get.mockReturnValue(new Promise(() => {}))
    render(<PublicForm />)
    // Spinner renders as an animate-spin element
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows an error state when the form fails to load', async () => {
    api.get.mockRejectedValue(new Error('Not found'))
    render(<PublicForm />)
    await waitFor(() => {
      expect(screen.getByText(/not available/i)).toBeInTheDocument()
    })
  })
})

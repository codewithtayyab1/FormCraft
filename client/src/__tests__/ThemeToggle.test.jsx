import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ThemeToggle from '../components/ThemeToggle'

/* ── module mock ───────────────────────────────────────────────────────── */

const mockSetMode = vi.fn()
let   mockMode    = 'dark'

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ mode: mockMode, setMode: mockSetMode }),
}))

/* ── tests ─────────────────────────────────────────────────────────────── */

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMode = 'dark'
  })

  it('renders a button for each of the three theme options', () => {
    render(<ThemeToggle />)
    expect(screen.getByTitle('Dark')).toBeInTheDocument()
    expect(screen.getByTitle('Light')).toBeInTheDocument()
    expect(screen.getByTitle('System')).toBeInTheDocument()
  })

  it('calls setMode("light") when the Light button is clicked', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByTitle('Light'))
    expect(mockSetMode).toHaveBeenCalledTimes(1)
    expect(mockSetMode).toHaveBeenCalledWith('light')
  })

  it('calls setMode("system") when the System button is clicked', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByTitle('System'))
    expect(mockSetMode).toHaveBeenCalledWith('system')
  })

  it('calls setMode("dark") when the Dark button is clicked', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByTitle('Dark'))
    expect(mockSetMode).toHaveBeenCalledWith('dark')
  })

  it('marks the active mode button as pressed', () => {
    mockMode = 'light'
    render(<ThemeToggle />)
    const lightBtn = screen.getByTitle('Light')
    expect(lightBtn).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTitle('Dark')).toHaveAttribute('aria-pressed', 'false')
  })
})

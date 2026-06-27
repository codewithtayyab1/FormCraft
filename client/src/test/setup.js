import '@testing-library/jest-dom'
import { vi } from 'vitest'

// window.matchMedia — not implemented in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches:              false,
    media:                query,
    onchange:             null,
    addEventListener:     vi.fn(),
    removeEventListener:  vi.fn(),
    dispatchEvent:        vi.fn(),
  })),
})

// Clipboard API — not in jsdom
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
})

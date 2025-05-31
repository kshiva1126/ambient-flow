import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Howler.js
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
    fade: vi.fn(),
    unload: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    state: vi.fn().mockReturnValue('loaded'),
    playing: vi.fn().mockReturnValue(false),
  })),
  Howler: {
    autoUnlock: true,
    html5PoolSize: 10,
    volume: vi.fn(),
    stop: vi.fn(),
  },
}))

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}

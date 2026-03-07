import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useVisibilityResume } from './useVisibilityResume'

vi.mock('../services/AudioManager', () => ({
  resumeAllPlaying: vi.fn(),
}))

describe('useVisibilityResume', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should add visibilitychange event listener on mount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')

    renderHook(() => useVisibilityResume())

    expect(addSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    )
  })

  it('should remove visibilitychange event listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = renderHook(() => useVisibilityResume())
    unmount()

    expect(removeSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    )
  })

  it('should call resumeAllPlaying when page becomes visible', async () => {
    const audioManager = await import('../services/AudioManager')

    renderHook(() => useVisibilityResume())

    // visibilityState を 'visible' にモック
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
    })

    document.dispatchEvent(new Event('visibilitychange'))

    expect(audioManager.resumeAllPlaying).toHaveBeenCalled()
  })

  it('should not call resumeAllPlaying when page becomes hidden', async () => {
    const audioManager = await import('../services/AudioManager')
    vi.mocked(audioManager.resumeAllPlaying).mockClear()

    renderHook(() => useVisibilityResume())

    // visibilityState を 'hidden' にモック
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
    })

    document.dispatchEvent(new Event('visibilitychange'))

    expect(audioManager.resumeAllPlaying).not.toHaveBeenCalled()
  })
})

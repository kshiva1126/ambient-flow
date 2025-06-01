import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioManager } from './useAudioManager'
import * as audioManager from '../services/AudioManager'
import type { SoundSource } from '../types/sound'

// Mock the AudioManager module
vi.mock('../services/AudioManager', () => ({
  load: vi.fn(),
  play: vi.fn(),
  stop: vi.fn(),
  setVolume: vi.fn(),
  fadeIn: vi.fn(),
  fadeOut: vi.fn(),
  stopAll: vi.fn(),
  isPlaying: vi.fn(),
  getVolume: vi.fn(),
  unload: vi.fn(),
  unloadUnused: vi.fn(),
  smartUnloadUnused: vi.fn(),
  getPlayingSounds: vi.fn().mockReturnValue([]),
  loadOnDemand: vi.fn().mockResolvedValue(true),
  preloadHighPriorityAudio: vi.fn().mockResolvedValue(undefined),
  getCacheStats: vi.fn().mockReturnValue({
    totalSize: 0,
    cachedFiles: 0,
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
  }),
  isOffline: vi.fn().mockReturnValue(false),
  getCachedSounds: vi.fn().mockResolvedValue([]),
  getMemoryUsage: vi.fn().mockReturnValue({
    audioInstances: 0,
    estimatedMemory: '0MB',
    cachedFiles: 0,
  }),
}))

const mockSoundSource: SoundSource = {
  id: 'test-sound',
  name: 'Test Sound',
  category: 'nature',
  description: 'Test sound description',
  icon: 'TestIcon',
  fileName: 'test.mp3',
  defaultVolume: 50,
  color: '#3B82F6',
}

describe('useAudioManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(audioManager.getPlayingSounds).mockReturnValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should return empty playing sounds initially', () => {
      const { result } = renderHook(() => useAudioManager())
      expect(result.current.playingSounds).toEqual([])
      expect(result.current.isOffline).toBe(false)
      expect(result.current.memoryUsage).toEqual({
        audioInstances: 0,
        estimatedMemory: '0MB',
        cachedFiles: 0,
      })
      expect(result.current.cacheStats).toEqual({
        totalSize: 0,
        cachedFiles: 0,
        hitRate: 0,
        totalRequests: 0,
        cacheHits: 0,
      })
    })

    it('should call preloadHighPriorityAudio on mount', () => {
      renderHook(() => useAudioManager())
      expect(audioManager.preloadHighPriorityAudio).toHaveBeenCalled()
    })
  })

  describe('play', () => {
    it('should call loadOnDemand and then play the sound', async () => {
      vi.mocked(audioManager.getPlayingSounds).mockReturnValue(['test-sound'])

      const { result } = renderHook(() => useAudioManager())

      await act(async () => {
        await result.current.play('test-sound')
      })

      expect(audioManager.loadOnDemand).toHaveBeenCalledWith('test-sound')
      expect(audioManager.play).toHaveBeenCalledWith('test-sound')
    })

    it('should not play if loadOnDemand fails', async () => {
      vi.mocked(audioManager.loadOnDemand).mockResolvedValueOnce(false)

      const { result } = renderHook(() => useAudioManager())

      await act(async () => {
        await result.current.play('test-sound')
      })

      expect(audioManager.loadOnDemand).toHaveBeenCalledWith('test-sound')
      expect(audioManager.play).not.toHaveBeenCalled()
    })

    it('should call audioManager.play and update playing sounds', async () => {
      vi.mocked(audioManager.getPlayingSounds).mockReturnValue(['test-sound'])
      const { result } = renderHook(() => useAudioManager())

      await act(async () => {
        await result.current.play('test-sound')
      })

      expect(audioManager.loadOnDemand).toHaveBeenCalledWith('test-sound')
      expect(audioManager.play).toHaveBeenCalledWith('test-sound')
      expect(result.current.playingSounds).toEqual(['test-sound'])
    })
  })

  describe('stop', () => {
    it('should call audioManager.stop and update playing sounds', async () => {
      // 初期状態は空
      vi.mocked(audioManager.getPlayingSounds).mockReturnValue([])

      const { result } = renderHook(() => useAudioManager())

      // play時に['test-sound']を返す
      vi.mocked(audioManager.getPlayingSounds).mockReturnValue(['test-sound'])

      await act(async () => {
        await result.current.play('test-sound')
      })

      expect(result.current.playingSounds).toEqual(['test-sound'])

      // stop時に[]を返す
      vi.mocked(audioManager.getPlayingSounds).mockReturnValue([])

      act(() => {
        result.current.stop('test-sound')
      })

      expect(audioManager.stop).toHaveBeenCalledWith('test-sound')
      expect(result.current.playingSounds).toEqual([])
    })
  })

  describe('setVolume', () => {
    it('should call audioManager.setVolume', () => {
      const { result } = renderHook(() => useAudioManager())

      act(() => {
        result.current.setVolume('test-sound', 75)
      })

      expect(audioManager.setVolume).toHaveBeenCalledWith('test-sound', 75)
    })
  })

  describe('fadeIn', () => {
    it('should call audioManager.fadeIn with default duration', () => {
      // 初期状態は空
      vi.mocked(audioManager.getPlayingSounds).mockReturnValue([])

      const { result } = renderHook(() => useAudioManager())

      // fadeIn後に['test-sound']を返す
      vi.mocked(audioManager.getPlayingSounds).mockReturnValue(['test-sound'])

      act(() => {
        result.current.fadeIn('test-sound')
      })

      expect(audioManager.fadeIn).toHaveBeenCalledWith('test-sound', undefined)
      expect(result.current.playingSounds).toEqual(['test-sound'])
    })

    it('should call audioManager.fadeIn with custom duration', () => {
      const { result } = renderHook(() => useAudioManager())

      act(() => {
        result.current.fadeIn('test-sound', 2000)
      })

      expect(audioManager.fadeIn).toHaveBeenCalledWith('test-sound', 2000)
    })
  })

  describe('fadeOut', () => {
    it('should call audioManager.fadeOut and update playing sounds after duration', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => useAudioManager())

      act(() => {
        result.current.fadeOut('test-sound', 1000)
      })

      expect(audioManager.fadeOut).toHaveBeenCalledWith('test-sound', 1000)

      // Mock the return value after timeout
      vi.mocked(audioManager.getPlayingSounds).mockReturnValue([])

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.playingSounds).toEqual([])

      vi.useRealTimers()
    })

    it('should use default duration for fadeOut', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() => useAudioManager())

      act(() => {
        result.current.fadeOut('test-sound')
      })

      expect(audioManager.fadeOut).toHaveBeenCalledWith('test-sound', undefined)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      vi.useRealTimers()
    })
  })

  describe('stopAll', () => {
    it('should call audioManager.stopAll and clear playing sounds', () => {
      const { result } = renderHook(() => useAudioManager())

      act(() => {
        result.current.stopAll()
      })

      expect(audioManager.stopAll).toHaveBeenCalled()

      // Verify that getPlayingSounds was called to update state
      expect(audioManager.getPlayingSounds).toHaveBeenCalled()
    })
  })

  describe('isPlaying', () => {
    it('should call audioManager.isPlaying', () => {
      vi.mocked(audioManager.isPlaying).mockReturnValue(true)
      const { result } = renderHook(() => useAudioManager())

      const isPlaying = result.current.isPlaying('test-sound')

      expect(audioManager.isPlaying).toHaveBeenCalledWith('test-sound')
      expect(isPlaying).toBe(true)
    })
  })

  describe('getVolume', () => {
    it('should call audioManager.getVolume', () => {
      vi.mocked(audioManager.getVolume).mockReturnValue(75)
      const { result } = renderHook(() => useAudioManager())

      const volume = result.current.getVolume('test-sound')

      expect(audioManager.getVolume).toHaveBeenCalledWith('test-sound')
      expect(volume).toBe(75)
    })
  })

  describe('loadSound', () => {
    it('should call audioManager.load', () => {
      const { result } = renderHook(() => useAudioManager())

      act(() => {
        result.current.loadSound(mockSoundSource)
      })

      expect(audioManager.load).toHaveBeenCalledWith(mockSoundSource)
    })
  })

  describe('unloadSound', () => {
    it('should call audioManager.unload and update playing sounds', () => {
      vi.mocked(audioManager.getPlayingSounds).mockReturnValue([])
      const { result } = renderHook(() => useAudioManager())

      act(() => {
        result.current.unloadSound('test-sound')
      })

      expect(audioManager.unload).toHaveBeenCalledWith('test-sound')
      expect(result.current.playingSounds).toEqual([])
    })
  })

  describe('cleanup', () => {
    it('should call smartUnloadUnused on unmount', () => {
      const { unmount } = renderHook(() => useAudioManager())

      unmount()

      expect(audioManager.smartUnloadUnused).toHaveBeenCalled()
    })
  })

  describe('memoization', () => {
    it('should memoize functions properly', () => {
      const { result, rerender } = renderHook(() => useAudioManager())

      const play1 = result.current.play
      const stop1 = result.current.stop
      const setVolume1 = result.current.setVolume
      const fadeIn1 = result.current.fadeIn
      const fadeOut1 = result.current.fadeOut
      const stopAll1 = result.current.stopAll
      const isPlaying1 = result.current.isPlaying
      const getVolume1 = result.current.getVolume
      const loadSound1 = result.current.loadSound
      const unloadSound1 = result.current.unloadSound

      rerender()

      expect(result.current.play).toBe(play1)
      expect(result.current.stop).toBe(stop1)
      expect(result.current.setVolume).toBe(setVolume1)
      expect(result.current.fadeIn).toBe(fadeIn1)
      expect(result.current.fadeOut).toBe(fadeOut1)
      expect(result.current.stopAll).toBe(stopAll1)
      expect(result.current.isPlaying).toBe(isPlaying1)
      expect(result.current.getVolume).toBe(getVolume1)
      expect(result.current.loadSound).toBe(loadSound1)
      expect(result.current.unloadSound).toBe(unloadSound1)
    })
  })
})

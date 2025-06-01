import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { audioCacheManager } from './AudioCacheManager'

// Cache API のモック
const mockCache = {
  match: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  keys: vi.fn(),
}

const mockCaches = {
  open: vi.fn(() => Promise.resolve(mockCache)),
  delete: vi.fn(() => Promise.resolve(true)),
}

// fetch API のモック
const mockFetch = vi.fn()

// グローバルオブジェクトのモック
Object.defineProperty(globalThis, 'caches', {
  value: mockCaches,
  writable: true,
})

Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
})

Object.defineProperty(globalThis, 'navigator', {
  value: {
    onLine: true,
  },
  writable: true,
})

describe('AudioCacheManager', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // デフォルトのモック動作を設定
    mockCache.match.mockResolvedValue(null)
    mockCache.put.mockResolvedValue(undefined)
    mockCache.delete.mockResolvedValue(true)
    mockCache.keys.mockResolvedValue([])
    mockCaches.open.mockResolvedValue(mockCache)
    mockFetch.mockResolvedValue(
      new Response('mock audio data', {
        status: 200,
        headers: { 'content-length': '1000' },
      })
    )

    // キャッシュマネージャーの状態をリセット
    await audioCacheManager.clearCache()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('cacheAudioFile', () => {
    it('should cache audio file successfully', async () => {
      const result = await audioCacheManager.cacheAudioFile(
        'rain',
        '/src/assets/sounds/rain.mp3'
      )

      expect(result).toBe(true)
      expect(mockCaches.open).toHaveBeenCalledWith('ambient-flow-audio-cache')
      expect(mockCache.match).toHaveBeenCalledWith(
        '/src/assets/sounds/rain.mp3'
      )
      expect(mockFetch).toHaveBeenCalledWith('/src/assets/sounds/rain.mp3')
      expect(mockCache.put).toHaveBeenCalled()
    })

    it('should return true if file is already cached', async () => {
      mockCache.match.mockResolvedValueOnce(new Response('cached data'))

      const result = await audioCacheManager.cacheAudioFile(
        'rain',
        '/src/assets/sounds/rain.mp3'
      )

      expect(result).toBe(true)
      expect(mockFetch).not.toHaveBeenCalled()
      expect(mockCache.put).not.toHaveBeenCalled()
    })

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await audioCacheManager.cacheAudioFile(
        'rain',
        '/src/assets/sounds/rain.mp3'
      )

      expect(result).toBe(false)
    })

    it('should not cache if strategy not found', async () => {
      const result = await audioCacheManager.cacheAudioFile(
        'unknown-sound',
        '/src/assets/sounds/unknown.mp3'
      )

      expect(result).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('getCachedAudioFile', () => {
    it('should return cached response if available', async () => {
      const mockResponse = new Response('cached audio data')
      mockCache.match.mockResolvedValueOnce(mockResponse)

      const result = await audioCacheManager.getCachedAudioFile(
        'rain',
        '/src/assets/sounds/rain.mp3'
      )

      expect(result).toBe(mockResponse)
      expect(mockCache.match).toHaveBeenCalledWith(
        '/src/assets/sounds/rain.mp3'
      )
    })

    it('should return null if not cached', async () => {
      mockCache.match.mockResolvedValueOnce(null)

      const result = await audioCacheManager.getCachedAudioFile(
        'rain',
        '/src/assets/sounds/rain.mp3'
      )

      expect(result).toBe(null)
    })

    it('should handle cache errors gracefully', async () => {
      mockCache.match.mockRejectedValueOnce(new Error('Cache error'))

      const result = await audioCacheManager.getCachedAudioFile(
        'rain',
        '/src/assets/sounds/rain.mp3'
      )

      expect(result).toBe(null)
    })
  })

  describe('preloadHighPriorityAudio', () => {
    it('should preload high priority audio files', async () => {
      await audioCacheManager.preloadHighPriorityAudio()

      // 高優先度の音源（rain, waves, white-noise, fireplace）がキャッシュされることを確認
      expect(mockFetch).toHaveBeenCalledTimes(4)
      expect(mockFetch).toHaveBeenCalledWith('/src/assets/sounds/rain.mp3')
      expect(mockFetch).toHaveBeenCalledWith('/src/assets/sounds/waves.mp3')
      expect(mockFetch).toHaveBeenCalledWith(
        '/src/assets/sounds/white-noise.mp3'
      )
      expect(mockFetch).toHaveBeenCalledWith('/src/assets/sounds/fireplace.mp3')
    })

    it('should handle preload failures gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      // エラーが発生しても例外がスローされないことを確認
      await expect(
        audioCacheManager.preloadHighPriorityAudio()
      ).resolves.not.toThrow()
    })
  })

  describe('getPriority', () => {
    it('should return correct priority for known sounds', () => {
      expect(audioCacheManager.getPriority('rain')).toBe('high')
      expect(audioCacheManager.getPriority('stream')).toBe('medium')
      expect(audioCacheManager.getPriority('thunder')).toBe('low')
    })

    it('should return low priority for unknown sounds', () => {
      expect(audioCacheManager.getPriority('unknown-sound')).toBe('low')
    })
  })

  describe('isOffline', () => {
    it('should return false when online', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      })
      expect(audioCacheManager.isOffline()).toBe(false)
    })

    it('should return true when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      })
      expect(audioCacheManager.isOffline()).toBe(true)
    })
  })

  describe('getCacheStats', () => {
    it('should return initial cache stats', () => {
      const stats = audioCacheManager.getCacheStats()

      expect(stats).toEqual({
        totalSize: 0,
        cachedFiles: 0,
        hitRate: 0,
        totalRequests: 0,
        cacheHits: 0,
      })
    })
  })

  describe('clearCache', () => {
    it('should clear cache successfully', async () => {
      await audioCacheManager.clearCache()

      expect(mockCaches.delete).toHaveBeenCalledWith('ambient-flow-audio-cache')
    })

    it('should handle cache clear errors gracefully', async () => {
      mockCaches.delete.mockRejectedValueOnce(new Error('Delete failed'))

      // エラーが発生しても例外がスローされないことを確認
      await expect(audioCacheManager.clearCache()).resolves.not.toThrow()
    })
  })

  describe('getCachedFilesList', () => {
    it('should return list of cached files', async () => {
      const mockKeys = [
        { url: '/src/assets/sounds/rain.mp3' },
        { url: '/src/assets/sounds/waves.mp3' },
      ]
      mockCache.keys.mockResolvedValueOnce(mockKeys)

      const result = await audioCacheManager.getCachedFilesList()

      expect(result).toEqual([
        '/src/assets/sounds/rain.mp3',
        '/src/assets/sounds/waves.mp3',
      ])
    })

    it('should handle errors and return empty array', async () => {
      mockCache.keys.mockRejectedValueOnce(new Error('Keys error'))

      const result = await audioCacheManager.getCachedFilesList()

      expect(result).toEqual([])
    })
  })
})

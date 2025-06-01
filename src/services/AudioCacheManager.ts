import { SOUND_SOURCES } from '../data/sounds'

export interface AudioCacheStrategy {
  priority: 'high' | 'medium' | 'low'
  preload: boolean
  size: number
  lastUsed: number
}

export interface CacheStats {
  totalSize: number
  cachedFiles: number
  hitRate: number
  totalRequests: number
  cacheHits: number
}

// 音声キャッシュ設定 - 使用頻度と重要性に基づく優先度付け
const AUDIO_CACHE_CONFIG: Record<
  string,
  Omit<AudioCacheStrategy, 'size' | 'lastUsed'>
> = {
  // 高優先度：最も人気の高い環境音
  rain: { priority: 'high', preload: true },
  waves: { priority: 'high', preload: true },
  'white-noise': { priority: 'high', preload: true },
  fireplace: { priority: 'high', preload: true },

  // 中優先度：一般的な環境音
  stream: { priority: 'medium', preload: true },
  birds: { priority: 'medium', preload: true },
  cafe: { priority: 'medium', preload: true },
  'pink-noise': { priority: 'medium', preload: true },
  'brown-noise': { priority: 'medium', preload: false },

  // 低優先度：特殊な用途の音源
  thunder: { priority: 'low', preload: false },
  wind: { priority: 'low', preload: false },
  'summer-night': { priority: 'low', preload: false },
  city: { priority: 'low', preload: false },
  train: { priority: 'low', preload: false },
  boat: { priority: 'low', preload: false },
}

class AudioCacheManager {
  private cacheStrategies = new Map<string, AudioCacheStrategy>()
  private cacheStats: CacheStats = {
    totalSize: 0,
    cachedFiles: 0,
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
  }
  private readonly MAX_CACHE_SIZE = 30 * 1024 * 1024 // 30MB
  private readonly CACHE_NAME = 'ambient-flow-audio-cache'

  constructor() {
    this.initializeCacheStrategies()
  }

  /**
   * キャッシュ戦略を初期化
   */
  private initializeCacheStrategies(): void {
    SOUND_SOURCES.forEach((source) => {
      const config = AUDIO_CACHE_CONFIG[source.id] || {
        priority: 'low',
        preload: false,
      }

      this.cacheStrategies.set(source.id, {
        ...config,
        size: 0, // 実際のサイズは後で測定
        lastUsed: Date.now(),
      })
    })
  }

  /**
   * Cache APIを使用して音声ファイルをキャッシュ
   */
  async cacheAudioFile(soundId: string, audioUrl: string): Promise<boolean> {
    try {
      const cache = await caches.open(this.CACHE_NAME)
      const strategy = this.cacheStrategies.get(soundId)

      if (!strategy) {
        console.warn(`No cache strategy found for sound: ${soundId}`)
        return false
      }

      // 既にキャッシュされているかチェック
      const cachedResponse = await cache.match(audioUrl)
      if (cachedResponse) {
        this.updateCacheStats(soundId, true)
        return true
      }

      // 新しいファイルをキャッシュ
      const response = await fetch(audioUrl)
      if (response.ok) {
        // キャッシュサイズ制限チェック
        const contentLength = parseInt(
          response.headers.get('content-length') || '0'
        )

        if (this.canCache(contentLength)) {
          await cache.put(audioUrl, response.clone())

          // キャッシュ戦略を更新
          strategy.size = contentLength
          strategy.lastUsed = Date.now()

          this.updateCacheSize()
          this.updateCacheStats(soundId, false)

          console.log(`Cached audio file: ${soundId} (${contentLength} bytes)`)
          return true
        } else {
          console.warn(`Cannot cache ${soundId}: would exceed cache size limit`)
          return false
        }
      }
    } catch (error) {
      console.error(`Failed to cache audio file ${soundId}:`, error)
    }

    return false
  }

  /**
   * キャッシュされた音声ファイルを取得
   */
  async getCachedAudioFile(
    soundId: string,
    audioUrl: string
  ): Promise<Response | null> {
    try {
      const cache = await caches.open(this.CACHE_NAME)
      const cachedResponse = await cache.match(audioUrl)

      if (cachedResponse) {
        // 使用記録を更新
        const strategy = this.cacheStrategies.get(soundId)
        if (strategy) {
          strategy.lastUsed = Date.now()
        }

        this.updateCacheStats(soundId, true)
        return cachedResponse
      }
    } catch (error) {
      console.error(`Failed to get cached audio file ${soundId}:`, error)
    }

    this.updateCacheStats(soundId, false)
    return null
  }

  /**
   * 高優先度の音声ファイルをプリロード
   */
  async preloadHighPriorityAudio(): Promise<void> {
    const highPriorityFiles = Array.from(this.cacheStrategies.entries())
      .filter(
        ([, strategy]) => strategy.preload && strategy.priority === 'high'
      )
      .map(([soundId]) => soundId)

    console.log('Preloading high priority audio files:', highPriorityFiles)

    const preloadPromises = highPriorityFiles.map(async (soundId) => {
      const source = SOUND_SOURCES.find((s) => s.id === soundId)
      if (source) {
        const audioUrl = `/src/assets/sounds/${source.fileName}`
        await this.cacheAudioFile(soundId, audioUrl)
      }
    })

    await Promise.allSettled(preloadPromises)
  }

  /**
   * 使用頻度の低いファイルをキャッシュから削除
   */
  async cleanupCache(): Promise<void> {
    const cache = await caches.open(this.CACHE_NAME)
    const now = Date.now()
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000

    // 1週間使用されていない低優先度ファイルを削除
    const filesToRemove = Array.from(this.cacheStrategies.entries())
      .filter(([, strategy]) => {
        return strategy.priority === 'low' && now - strategy.lastUsed > ONE_WEEK
      })
      .map(([soundId]) => soundId)

    for (const soundId of filesToRemove) {
      const source = SOUND_SOURCES.find((s) => s.id === soundId)
      if (source) {
        const audioUrl = `/src/assets/sounds/${source.fileName}`
        await cache.delete(audioUrl)

        const strategy = this.cacheStrategies.get(soundId)
        if (strategy) {
          strategy.size = 0
        }

        console.log(`Removed unused audio file from cache: ${soundId}`)
      }
    }

    this.updateCacheSize()
  }

  /**
   * キャッシュ可能かどうかをチェック
   */
  private canCache(fileSize: number): boolean {
    const currentSize = this.calculateCurrentCacheSize()
    return currentSize + fileSize <= this.MAX_CACHE_SIZE
  }

  /**
   * 現在のキャッシュサイズを計算
   */
  private calculateCurrentCacheSize(): number {
    return Array.from(this.cacheStrategies.values()).reduce(
      (total, strategy) => total + strategy.size,
      0
    )
  }

  /**
   * キャッシュサイズ情報を更新
   */
  private updateCacheSize(): void {
    this.cacheStats.totalSize = this.calculateCurrentCacheSize()
    this.cacheStats.cachedFiles = Array.from(
      this.cacheStrategies.values()
    ).filter((strategy) => strategy.size > 0).length
  }

  /**
   * キャッシュ統計を更新
   */
  private updateCacheStats(_soundId: string, isHit: boolean): void {
    this.cacheStats.totalRequests++

    if (isHit) {
      this.cacheStats.cacheHits++
    }

    this.cacheStats.hitRate =
      this.cacheStats.totalRequests > 0
        ? (this.cacheStats.cacheHits / this.cacheStats.totalRequests) * 100
        : 0
  }

  /**
   * 音声ファイルの優先度を取得
   */
  getPriority(soundId: string): 'high' | 'medium' | 'low' {
    return this.cacheStrategies.get(soundId)?.priority || 'low'
  }

  /**
   * キャッシュ統計を取得
   */
  getCacheStats(): CacheStats {
    return { ...this.cacheStats }
  }

  /**
   * キャッシュをクリア
   */
  async clearCache(): Promise<void> {
    try {
      await caches.delete(this.CACHE_NAME)
      this.cacheStrategies.forEach((strategy) => {
        strategy.size = 0
        strategy.lastUsed = Date.now()
      })
      this.cacheStats = {
        totalSize: 0,
        cachedFiles: 0,
        hitRate: 0,
        totalRequests: 0,
        cacheHits: 0,
      }
      console.log('Audio cache cleared')
    } catch (error) {
      console.error('Failed to clear audio cache:', error)
    }
  }

  /**
   * オフライン状態を検知
   */
  isOffline(): boolean {
    return !navigator.onLine
  }

  /**
   * キャッシュされた音声ファイルの一覧を取得
   */
  async getCachedFilesList(): Promise<string[]> {
    try {
      const cache = await caches.open(this.CACHE_NAME)
      const keys = await cache.keys()
      return keys.map((request) => request.url)
    } catch (error) {
      console.error('Failed to get cached files list:', error)
      return []
    }
  }
}

// シングルトンインスタンス
export const audioCacheManager = new AudioCacheManager()

/**
 * Service Worker registration and communication utilities
 */

export interface ServiceWorkerMessage {
  type: string
  data?: unknown
}

export interface CacheStats {
  audioCacheSize: number
  staticCacheSize: number
  totalCacheEntries: number
  cacheNames: string[]
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private isRegistered = false

  /**
   * Service Workerを登録
   */
  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker is not supported in this browser')
      return false
    }

    try {
      console.log('Registering Service Worker...')
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      this.registration.addEventListener('updatefound', () => {
        console.log('New Service Worker version available')
        const newWorker = this.registration?.installing

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('New Service Worker installed. Refreshing...')
              // 新しいバージョンが利用可能な場合の処理
              this.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        }
      })

      // Service Workerの状態変化を監視
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed. Reloading...')
        window.location.reload()
      })

      this.isRegistered = true
      console.log('Service Worker registered successfully')
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  /**
   * Service Workerにメッセージを送信
   */
  async postMessage(message: ServiceWorkerMessage): Promise<unknown> {
    if (!this.registration?.active) {
      throw new Error('Service Worker is not active')
    }

    return new Promise((resolve, reject) => {
      const channel = new MessageChannel()

      channel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data)
        } else {
          reject(new Error(event.data.error || 'Service Worker message failed'))
        }
      }

      this.registration!.active!.postMessage(message, [channel.port2])
    })
  }

  /**
   * 音声ファイルをキャッシュに追加
   */
  async cacheAudioFile(url: string): Promise<boolean> {
    try {
      await this.postMessage({
        type: 'CACHE_AUDIO_FILE',
        data: { url },
      })
      return true
    } catch (error) {
      console.error(`Failed to cache audio file ${url}:`, error)
      return false
    }
  }

  /**
   * キャッシュ統計を取得
   */
  async getCacheStats(): Promise<CacheStats | null> {
    try {
      const result = (await this.postMessage({ type: 'GET_CACHE_STATS' })) as {
        stats: CacheStats
      }
      return result.stats
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return null
    }
  }

  /**
   * キャッシュをクリア
   */
  async clearCache(
    cacheType: 'all' | 'audio' | 'static' = 'all'
  ): Promise<boolean> {
    try {
      await this.postMessage({
        type: 'CLEAR_CACHE',
        data: { cacheType },
      })
      return true
    } catch (error) {
      console.error(`Failed to clear cache (${cacheType}):`, error)
      return false
    }
  }

  /**
   * Service Workerの状態をチェック
   */
  isActive(): boolean {
    return this.isRegistered && this.registration?.active !== null
  }

  /**
   * オフライン状態を検知
   */
  isOffline(): boolean {
    return !navigator.onLine
  }

  /**
   * ネットワーク状態の変化を監視
   */
  onNetworkStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  /**
   * Service Worker更新をチェック
   */
  async checkForUpdates(): Promise<void> {
    if (this.registration) {
      await this.registration.update()
    }
  }

  /**
   * Service Workerの登録を解除（開発時のみ使用）
   */
  async unregister(): Promise<boolean> {
    if (this.registration) {
      const result = await this.registration.unregister()
      this.isRegistered = false
      this.registration = null
      console.log('Service Worker unregistered')
      return result
    }
    return false
  }
}

// シングルトンインスタンス
export const serviceWorkerManager = new ServiceWorkerManager()

/**
 * ブラウザ音声制限への対応
 */
export class AudioContextManager {
  private audioContext: AudioContext | null = null
  private isUnlocked = false

  /**
   * ユーザーインタラクション時に音声コンテキストを有効化
   */
  async unlockAudioContext(): Promise<boolean> {
    if (this.isUnlocked) {
      return true
    }

    try {
      // AudioContextを作成（まだ作成されていない場合）
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)()
      }

      // AudioContextが suspended 状態の場合は resume
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // 無音の音を再生してコンテキストを有効化
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      gainNode.gain.value = 0 // 無音
      oscillator.frequency.value = 440
      oscillator.start()
      oscillator.stop(this.audioContext.currentTime + 0.01)

      this.isUnlocked = true
      console.log('Audio context unlocked successfully')
      return true
    } catch (error) {
      console.error('Failed to unlock audio context:', error)
      return false
    }
  }

  /**
   * 音声コンテキストの状態を取得
   */
  getAudioContextState(): AudioContextState | null {
    return this.audioContext?.state || null
  }

  /**
   * 音声コンテキストが有効かどうか
   */
  isAudioUnlocked(): boolean {
    return this.isUnlocked && this.audioContext?.state === 'running'
  }

  /**
   * 音声コンテキストを閉じる
   */
  async closeAudioContext(): Promise<void> {
    if (this.audioContext) {
      await this.audioContext.close()
      this.audioContext = null
      this.isUnlocked = false
    }
  }
}

export const audioContextManager = new AudioContextManager()

/**
 * ユーザーガイダンス用のヘルパー関数
 */
export const showAudioInteractionPrompt = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // モーダルやトーストでユーザーに説明
    const userConfirmed = confirm(
      'このアプリケーションで音声を再生するには、最初にクリックまたはタップが必要です。\n' +
        '続行しますか？'
    )

    if (userConfirmed) {
      audioContextManager.unlockAudioContext().then(resolve)
    } else {
      resolve(false)
    }
  })
}

/**
 * PWA初期化
 */
export const initializePWA = async (): Promise<void> => {
  console.log('Initializing PWA...')

  // Service Workerを登録
  const swRegistered = await serviceWorkerManager.register()

  if (swRegistered) {
    console.log('PWA initialized successfully')
  } else {
    console.warn('PWA initialization incomplete - Service Worker not available')
  }

  // 初回ユーザーインタラクションで音声コンテキストを準備
  const handleFirstInteraction = async () => {
    await audioContextManager.unlockAudioContext()
    document.removeEventListener('click', handleFirstInteraction)
    document.removeEventListener('touchstart', handleFirstInteraction)
  }

  document.addEventListener('click', handleFirstInteraction)
  document.addEventListener('touchstart', handleFirstInteraction)
}

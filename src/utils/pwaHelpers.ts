/**
 * PWA関連のヘルパー関数とユーティリティ
 */

/**
 * PWAがインストールされているかチェック
 */
export const isPWAInstalled = (): boolean => {
  // スタンドアロンモードで実行されているかチェック
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  // iOS Safari のホーム画面追加チェック
  const isIOSStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
    true

  return isStandalone || isIOSStandalone
}

/**
 * デバイスタイプを判定
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    )

  if (isMobile) {
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)
    return isTablet ? 'tablet' : 'mobile'
  }

  return 'desktop'
}

/**
 * オフライン状態の監視
 */
export class NetworkStatusMonitor {
  private listeners: ((isOnline: boolean) => void)[] = []
  private isOnline = navigator.onLine

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  private handleOnline = () => {
    this.isOnline = true
    this.notifyListeners()
  }

  private handleOffline = () => {
    this.isOnline = false
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.isOnline))
  }

  /**
   * ネットワーク状態変化のリスナーを追加
   */
  addListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener)

    // 現在の状態を即座に通知
    listener(this.isOnline)

    // リスナー削除関数を返す
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 現在のオンライン状態を取得
   */
  getStatus(): boolean {
    return this.isOnline
  }

  /**
   * リソースクリーンアップ
   */
  destroy() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    this.listeners = []
  }
}

/**
 * PWAのパフォーマンス監視
 */
export class PWAPerformanceMonitor {
  private metrics: Map<string, number> = new Map()

  /**
   * パフォーマンスメトリクスを記録
   */
  recordMetric(name: string, value: number) {
    this.metrics.set(name, value)
    console.log(`PWA Metric [${name}]: ${value}ms`)
  }

  /**
   * 処理時間を測定
   */
  measureTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now()

    return fn().finally(() => {
      const endTime = performance.now()
      this.recordMetric(name, endTime - startTime)
    })
  }

  /**
   * 同期処理の時間測定
   */
  measureTimeSync<T>(name: string, fn: () => T): T {
    const startTime = performance.now()
    const result = fn()
    const endTime = performance.now()

    this.recordMetric(name, endTime - startTime)
    return result
  }

  /**
   * すべてのメトリクスを取得
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  /**
   * 特定のメトリクスを取得
   */
  getMetric(name: string): number | undefined {
    return this.metrics.get(name)
  }

  /**
   * メトリクスをクリア
   */
  clearMetrics() {
    this.metrics.clear()
  }
}

/**
 * PWAライフサイクル管理
 */
export class PWALifecycleManager {
  private isVisible = !document.hidden
  private visibilityListeners: ((isVisible: boolean) => void)[] = []

  constructor() {
    this.setupVisibilityListeners()
  }

  private setupVisibilityListeners() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  private handleVisibilityChange = () => {
    this.isVisible = !document.hidden
    this.notifyVisibilityListeners()
  }

  private notifyVisibilityListeners() {
    this.visibilityListeners.forEach((listener) => listener(this.isVisible))
  }

  /**
   * アプリの可視性変化リスナーを追加
   */
  addVisibilityListener(listener: (isVisible: boolean) => void): () => void {
    this.visibilityListeners.push(listener)

    // 現在の状態を即座に通知
    listener(this.isVisible)

    return () => {
      const index = this.visibilityListeners.indexOf(listener)
      if (index > -1) {
        this.visibilityListeners.splice(index, 1)
      }
    }
  }

  /**
   * アプリが現在表示されているかチェック
   */
  isAppVisible(): boolean {
    return this.isVisible
  }

  /**
   * アプリがバックグラウンドにある時間を測定
   */
  measureBackgroundTime(): () => number {
    let backgroundStartTime: number | null = null

    const removeListener = this.addVisibilityListener((isVisible) => {
      if (!isVisible && backgroundStartTime === null) {
        backgroundStartTime = Date.now()
      } else if (isVisible && backgroundStartTime !== null) {
        backgroundStartTime = null
      }
    })

    return () => {
      removeListener()
      if (backgroundStartTime !== null) {
        return Date.now() - backgroundStartTime
      }
      return 0
    }
  }

  /**
   * リソースクリーンアップ
   */
  destroy() {
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    )
    this.visibilityListeners = []
  }
}

/**
 * ストレージ容量チェック
 */
export const checkStorageQuota = async (): Promise<{
  quota: number
  usage: number
  available: number
  percentage: number
}> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      const quota = estimate.quota || 0
      const usage = estimate.usage || 0
      const available = quota - usage
      const percentage = quota > 0 ? (usage / quota) * 100 : 0

      return {
        quota,
        usage,
        available,
        percentage,
      }
    } catch (error) {
      console.error('Failed to estimate storage:', error)
    }
  }

  // フォールバック: 推定値を返す
  return {
    quota: 0,
    usage: 0,
    available: 0,
    percentage: 0,
  }
}

/**
 * ユーザーエージェント情報を取得
 */
export const getUserAgentInfo = (): {
  browser: string
  version: string
  os: string
  isMobile: boolean
  isPWA: boolean
} => {
  const userAgent = navigator.userAgent

  // ブラウザ判定
  let browser = 'Unknown'
  let version = 'Unknown'

  if (userAgent.includes('Chrome/')) {
    browser = 'Chrome'
    version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Firefox/')) {
    browser = 'Firefox'
    version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    browser = 'Safari'
    version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Edge/')) {
    browser = 'Edge'
    version = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown'
  }

  // OS判定
  let os = 'Unknown'
  if (userAgent.includes('Windows')) {
    os = 'Windows'
  } else if (userAgent.includes('Mac OS')) {
    os = 'macOS'
  } else if (userAgent.includes('Linux')) {
    os = 'Linux'
  } else if (userAgent.includes('Android')) {
    os = 'Android'
  } else if (
    userAgent.includes('iOS') ||
    userAgent.includes('iPhone') ||
    userAgent.includes('iPad')
  ) {
    os = 'iOS'
  }

  // モバイル判定
  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  return {
    browser,
    version,
    os,
    isMobile,
    isPWA: isPWAInstalled(),
  }
}

// シングルトンインスタンス
export const networkMonitor = new NetworkStatusMonitor()
export const performanceMonitor = new PWAPerformanceMonitor()
export const lifecycleManager = new PWALifecycleManager()

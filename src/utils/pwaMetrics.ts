/**
 * PWA Standard Metrics Monitoring System
 * PWAの標準メトリクスを収集・監視するシステム
 */

export interface PWAMetrics {
  // インストール関連
  installRate: number
  installPromptAcceptanceRate: number
  installPromptDismissalRate: number

  // エンゲージメント
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  sessionDuration: number
  returnUserRate: number

  // パフォーマンス
  averageLoadTime: number
  offlineUsageRate: number
  cacheHitRate: number

  // 機能使用
  featureUsageRate: Record<string, number>
  presetCreationRate: number

  // デバイス・プラットフォーム
  deviceDistribution: Record<string, number>
  browserDistribution: Record<string, number>

  // エラー・問題
  errorRate: number
  crashRate: number
}

interface MetricEvent {
  type: string
  value: number
  timestamp: number
  metadata?: Record<string, unknown>
}

interface SessionData {
  sessionId: string
  startTime: number
  endTime?: number
  events: MetricEvent[]
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop'
    browser: string
    os: string
    isPWA: boolean
  }
}

class PWAMetricsCollector {
  private sessionData: SessionData
  private metricsBuffer: MetricEvent[] = []
  private isEnabled: boolean = true

  constructor() {
    this.sessionData = this.createNewSession()
    this.setupEventListeners()
    this.loadStoredMetrics()
  }

  /**
   * 新しいセッションを作成
   */
  private createNewSession(): SessionData {
    return {
      sessionId: crypto.randomUUID(),
      startTime: Date.now(),
      events: [],
      deviceInfo: this.getDeviceInfo(),
    }
  }

  /**
   * デバイス情報を取得
   */
  private getDeviceInfo() {
    const userAgent = navigator.userAgent
    const isDesktop =
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
    const isTablet = /iPad|Android.*Tablet/i.test(userAgent)
    const isMobile = !isDesktop && !isTablet

    const deviceType: 'mobile' | 'tablet' | 'desktop' = isMobile
      ? 'mobile'
      : isTablet
        ? 'tablet'
        : 'desktop'

    let browser = 'unknown'
    if (/Chrome/.test(userAgent)) browser = 'chrome'
    else if (/Firefox/.test(userAgent)) browser = 'firefox'
    else if (/Safari/.test(userAgent)) browser = 'safari'
    else if (/Edge/.test(userAgent)) browser = 'edge'

    let os = 'unknown'
    if (/Windows/.test(userAgent)) os = 'windows'
    else if (/Mac/.test(userAgent)) os = 'macos'
    else if (/Linux/.test(userAgent)) os = 'linux'
    else if (/Android/.test(userAgent)) os = 'android'
    else if (/iOS|iPhone|iPad/.test(userAgent)) os = 'ios'

    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true

    return { type: deviceType, browser, os, isPWA }
  }

  /**
   * イベントリスナーのセットアップ
   */
  private setupEventListeners() {
    // ページの可視性変更
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.recordEvent('session_hidden', 1)
      } else {
        this.recordEvent('session_visible', 1)
      }
    })

    // ページアンロード時
    window.addEventListener('beforeunload', () => {
      this.endSession()
    })

    // PWAインストール関連
    window.addEventListener('beforeinstallprompt', () => {
      this.recordEvent('install_prompt_shown', 1)
    })

    window.addEventListener('appinstalled', () => {
      this.recordEvent('app_installed', 1)
    })

    // エラー監視
    window.addEventListener('error', (event) => {
      this.recordEvent('javascript_error', 1, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.recordEvent('unhandled_promise_rejection', 1, {
        reason: event.reason?.toString(),
      })
    })

    // オンライン/オフライン状態
    window.addEventListener('online', () => {
      this.recordEvent('network_online', 1)
    })

    window.addEventListener('offline', () => {
      this.recordEvent('network_offline', 1)
    })
  }

  /**
   * 保存されたメトリクスを読み込み
   */
  private loadStoredMetrics() {
    try {
      const stored = localStorage.getItem('pwa-metrics-buffer')
      if (stored) {
        this.metricsBuffer = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load stored metrics:', error)
    }
  }

  /**
   * メトリクスをローカルストレージに保存
   */
  private saveMetricsToStorage() {
    try {
      localStorage.setItem(
        'pwa-metrics-buffer',
        JSON.stringify(this.metricsBuffer)
      )
    } catch (error) {
      console.error('Failed to save metrics to storage:', error)
    }
  }

  /**
   * イベントを記録
   */
  recordEvent(type: string, value: number, metadata?: Record<string, unknown>) {
    if (!this.isEnabled) return

    const event: MetricEvent = {
      type,
      value,
      timestamp: Date.now(),
      metadata,
    }

    this.sessionData.events.push(event)
    this.metricsBuffer.push(event)

    // バッファサイズ制限
    if (this.metricsBuffer.length > 1000) {
      this.metricsBuffer = this.metricsBuffer.slice(-500) // 最新500件のみ保持
    }

    this.saveMetricsToStorage()
  }

  /**
   * 機能使用を記録
   */
  recordFeatureUsage(featureName: string, metadata?: Record<string, unknown>) {
    this.recordEvent(`feature_usage_${featureName}`, 1, metadata)
  }

  /**
   * パフォーマンスメトリクスを記録
   */
  recordPerformanceMetric(
    metricName: string,
    value: number,
    metadata?: Record<string, unknown>
  ) {
    this.recordEvent(`performance_${metricName}`, value, metadata)
  }

  /**
   * エラーを記録
   */
  recordError(
    errorType: string,
    errorMessage: string,
    metadata?: Record<string, unknown>
  ) {
    this.recordEvent(`error_${errorType}`, 1, {
      message: errorMessage,
      ...metadata,
    })
  }

  /**
   * セッション終了
   */
  endSession() {
    this.sessionData.endTime = Date.now()
    const sessionDuration =
      this.sessionData.endTime - this.sessionData.startTime

    this.recordEvent('session_end', sessionDuration, {
      sessionId: this.sessionData.sessionId,
      duration: sessionDuration,
    })

    this.saveSessionData()
    this.sendMetricsIfNeeded()
  }

  /**
   * セッションデータを保存
   */
  private saveSessionData() {
    try {
      const sessions = JSON.parse(localStorage.getItem('pwa-sessions') || '[]')
      sessions.push(this.sessionData)

      // 最新30セッションのみ保持
      if (sessions.length > 30) {
        sessions.splice(0, sessions.length - 30)
      }

      localStorage.setItem('pwa-sessions', JSON.stringify(sessions))
    } catch (error) {
      console.error('Failed to save session data:', error)
    }
  }

  /**
   * 必要に応じてメトリクスを送信
   */
  private sendMetricsIfNeeded() {
    // 実際の分析サービスに送信する処理
    // 現在はコンソールログのみ
    if (this.metricsBuffer.length >= 100) {
      console.log('PWA Metrics:', this.calculateMetrics())
      // 送信後にバッファをクリア
      this.metricsBuffer = []
      this.saveMetricsToStorage()
    }
  }

  /**
   * 現在のメトリクスを計算
   */
  calculateMetrics(): PWAMetrics {
    const sessions = this.getStoredSessions()
    const events = this.metricsBuffer

    return {
      installRate: this.calculateInstallRate(events),
      installPromptAcceptanceRate:
        this.calculateInstallPromptAcceptanceRate(events),
      installPromptDismissalRate:
        this.calculateInstallPromptDismissalRate(events),

      dailyActiveUsers: this.calculateActiveUsers(sessions, 1),
      weeklyActiveUsers: this.calculateActiveUsers(sessions, 7),
      monthlyActiveUsers: this.calculateActiveUsers(sessions, 30),
      sessionDuration: this.calculateAverageSessionDuration(sessions),
      returnUserRate: this.calculateReturnUserRate(sessions),

      averageLoadTime: this.calculateAverageLoadTime(events),
      offlineUsageRate: this.calculateOfflineUsageRate(events),
      cacheHitRate: this.calculateCacheHitRate(),

      featureUsageRate: this.calculateFeatureUsageRate(events),
      presetCreationRate: this.calculatePresetCreationRate(events),

      deviceDistribution: this.calculateDeviceDistribution(sessions),
      browserDistribution: this.calculateBrowserDistribution(sessions),

      errorRate: this.calculateErrorRate(events),
      crashRate: this.calculateCrashRate(events),
    }
  }

  /**
   * 保存されたセッションを取得
   */
  private getStoredSessions(): SessionData[] {
    try {
      return JSON.parse(localStorage.getItem('pwa-sessions') || '[]')
    } catch (error) {
      console.error('Failed to get stored sessions:', error)
      return []
    }
  }

  // 各種メトリクス計算メソッド
  private calculateInstallRate(events: MetricEvent[]): number {
    const installPrompts = events.filter(
      (e) => e.type === 'install_prompt_shown'
    ).length
    const installs = events.filter((e) => e.type === 'app_installed').length
    return installPrompts > 0 ? (installs / installPrompts) * 100 : 0
  }

  private calculateInstallPromptAcceptanceRate(events: MetricEvent[]): number {
    // 実装を簡略化 - 実際にはより詳細な追跡が必要
    return this.calculateInstallRate(events)
  }

  private calculateInstallPromptDismissalRate(events: MetricEvent[]): number {
    const installPrompts = events.filter(
      (e) => e.type === 'install_prompt_shown'
    ).length
    const installs = events.filter((e) => e.type === 'app_installed').length
    const dismissals = installPrompts - installs
    return installPrompts > 0 ? (dismissals / installPrompts) * 100 : 0
  }

  private calculateActiveUsers(sessions: SessionData[], days: number): number {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return sessions.filter((s) => s.startTime >= cutoff).length
  }

  private calculateAverageSessionDuration(sessions: SessionData[]): number {
    const durations = sessions
      .filter((s) => s.endTime)
      .map((s) => s.endTime! - s.startTime)

    return durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0
  }

  private calculateReturnUserRate(sessions: SessionData[]): number {
    // 簡略化実装 - 実際にはユーザーIDによる追跡が必要
    const recentSessions = sessions.filter(
      (s) => Date.now() - s.startTime < 30 * 24 * 60 * 60 * 1000
    )
    return recentSessions.length > 1 ? 50 : 0 // プレースホルダー値
  }

  private calculateAverageLoadTime(events: MetricEvent[]): number {
    const loadTimes = events
      .filter((e) => e.type === 'performance_load_time')
      .map((e) => e.value)

    return loadTimes.length > 0
      ? loadTimes.reduce((sum, t) => sum + t, 0) / loadTimes.length
      : 0
  }

  private calculateOfflineUsageRate(events: MetricEvent[]): number {
    const offlineEvents = events.filter(
      (e) => e.type === 'network_offline'
    ).length
    const totalEvents = events.length
    return totalEvents > 0 ? (offlineEvents / totalEvents) * 100 : 0
  }

  private calculateCacheHitRate(): number {
    // Service Workerからのキャッシュ統計が必要
    return 0 // プレースホルダー
  }

  private calculateFeatureUsageRate(
    events: MetricEvent[]
  ): Record<string, number> {
    const featureEvents = events.filter((e) =>
      e.type.startsWith('feature_usage_')
    )
    const usage: Record<string, number> = {}

    featureEvents.forEach((e) => {
      const feature = e.type.replace('feature_usage_', '')
      usage[feature] = (usage[feature] || 0) + 1
    })

    return usage
  }

  private calculatePresetCreationRate(events: MetricEvent[]): number {
    const presetCreations = events.filter(
      (e) => e.type === 'feature_usage_preset_save'
    ).length
    const sessions = this.getStoredSessions().length
    return sessions > 0 ? (presetCreations / sessions) * 100 : 0
  }

  private calculateDeviceDistribution(
    sessions: SessionData[]
  ): Record<string, number> {
    const distribution: Record<string, number> = {}
    sessions.forEach((s) => {
      const device = s.deviceInfo.type
      distribution[device] = (distribution[device] || 0) + 1
    })
    return distribution
  }

  private calculateBrowserDistribution(
    sessions: SessionData[]
  ): Record<string, number> {
    const distribution: Record<string, number> = {}
    sessions.forEach((s) => {
      const browser = s.deviceInfo.browser
      distribution[browser] = (distribution[browser] || 0) + 1
    })
    return distribution
  }

  private calculateErrorRate(events: MetricEvent[]): number {
    const errorEvents = events.filter((e) => e.type.startsWith('error_')).length
    const totalEvents = events.length
    return totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0
  }

  private calculateCrashRate(events: MetricEvent[]): number {
    // 実装を簡略化
    const crashes = events.filter(
      (e) => e.type === 'error_javascript_error'
    ).length
    const sessions = this.getStoredSessions().length
    return sessions > 0 ? (crashes / sessions) * 100 : 0
  }

  /**
   * メトリクス収集を有効/無効化
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  /**
   * 現在のメトリクスレポートを取得
   */
  getMetricsReport(): PWAMetrics {
    return this.calculateMetrics()
  }

  /**
   * メトリクスデータをクリア
   */
  clearMetrics() {
    this.metricsBuffer = []
    localStorage.removeItem('pwa-metrics-buffer')
    localStorage.removeItem('pwa-sessions')
  }
}

// シングルトンインスタンス
export const pwaMetrics = new PWAMetricsCollector()

// 使用例のヘルパー関数
export const trackFeatureUsage = (
  feature: string,
  metadata?: Record<string, unknown>
) => {
  pwaMetrics.recordFeatureUsage(feature, metadata)
}

export const trackPerformance = (
  metric: string,
  value: number,
  metadata?: Record<string, unknown>
) => {
  pwaMetrics.recordPerformanceMetric(metric, value, metadata)
}

export const trackError = (
  type: string,
  message: string,
  metadata?: Record<string, unknown>
) => {
  pwaMetrics.recordError(type, message, metadata)
}

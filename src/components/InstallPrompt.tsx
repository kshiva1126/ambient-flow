import React, { useState, useEffect, useCallback } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPromptProps {
  className?: string
}

/**
 * PWAインストール促進コンポーネント（改善版）
 * - ユーザーエンゲージメントメトリクスを考慮
 * - スマートな表示タイミング制御
 * - デバイス別の最適化
 */
export const InstallPrompt: React.FC<InstallPromptProps> = ({
  className = '',
}) => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isIOSChrome, setIsIOSChrome] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<{
    isDesktop: boolean
    isTablet: boolean
    isMobile: boolean
  }>({
    isDesktop: false,
    isTablet: false,
    isMobile: false,
  })
  const [installMetrics, setInstallMetrics] = useState<{
    promptShownCount: number
    lastPromptTime: number | null
    sessionCount: number
    engagementScore: number
  }>({
    promptShownCount: 0,
    lastPromptTime: null,
    sessionCount: 0,
    engagementScore: 0,
  })

  // エンゲージメントスコアの計算
  const calculateEngagementScore = useCallback(
    (metrics: typeof installMetrics): number => {
      let score = 0

      // セッション数に基づくスコア
      if (metrics.sessionCount >= 3) score += 30
      else if (metrics.sessionCount >= 2) score += 20
      else score += 10

      // 使用時間に基づくスコア（将来的な実装）
      const totalUsageTime = parseInt(
        localStorage.getItem('pwa-total-usage-time') || '0'
      )
      if (totalUsageTime > 10 * 60 * 1000)
        score += 30 // 10分以上
      else if (totalUsageTime > 5 * 60 * 1000)
        score += 20 // 5分以上
      else if (totalUsageTime > 1 * 60 * 1000) score += 10 // 1分以上

      // 機能使用に基づくスコア
      const hasUsedPresets = localStorage.getItem('presets') !== null
      if (hasUsedPresets) score += 20

      // 再訪問に基づくスコア
      const lastVisit = localStorage.getItem('pwa-last-session')
      if (lastVisit) {
        const daysSinceLastVisit =
          (Date.now() - parseInt(lastVisit)) / (24 * 60 * 60 * 1000)
        if (daysSinceLastVisit < 7) score += 20
        else if (daysSinceLastVisit < 30) score += 10
      }

      return Math.min(100, score)
    },
    []
  )

  // メトリクスの更新
  const updateMetrics = useCallback(
    (metrics: typeof installMetrics) => {
      try {
        // エンゲージメントスコアの計算
        metrics.engagementScore = calculateEngagementScore(metrics)

        localStorage.setItem('pwa-install-metrics', JSON.stringify(metrics))
        setInstallMetrics(metrics)
      } catch (error) {
        console.error('Failed to save install metrics:', error)
      }
    },
    [calculateEngagementScore]
  )

  // スマートなプロンプト表示タイミングの決定
  const determinePromptTiming = useCallback(
    (metrics: typeof installMetrics): boolean => {
      const hasDeclined =
        localStorage.getItem('pwa-install-declined') === 'true'
      const lastDeclineTime = localStorage.getItem('pwa-install-decline-time')
      const declineCount = parseInt(
        localStorage.getItem('pwa-install-decline-count') || '0'
      )
      const now = Date.now()

      // 拒否された場合の処理
      if (hasDeclined && lastDeclineTime) {
        // 拒否回数に応じて待機時間を増やす
        const waitDays = Math.min(30, Math.pow(2, declineCount)) // 2, 4, 8, 16, 30日
        const waitTime = waitDays * 24 * 60 * 60 * 1000
        if (now - parseInt(lastDeclineTime) < waitTime) {
          return false
        }
      }

      // エンゲージメントスコアに基づく判定
      if (metrics.engagementScore < 30 && metrics.promptShownCount === 0) {
        return false // 初回はある程度使ってもらってから
      }

      // 表示回数に基づく判定
      if (metrics.promptShownCount > 0 && metrics.lastPromptTime) {
        const daysSinceLastPrompt =
          (now - metrics.lastPromptTime) / (24 * 60 * 60 * 1000)
        const requiredDays = Math.min(30, metrics.promptShownCount * 7) // 7, 14, 21, 30日
        return daysSinceLastPrompt >= requiredDays
      }

      return true
    },
    []
  )

  useEffect(() => {
    // デバイス情報の検出
    const detectDevice = () => {
      const userAgent = navigator.userAgent
      const isDesktop =
        !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        )
      const isTablet = /iPad|Android.*Tablet/i.test(userAgent)
      const isMobile = !isDesktop && !isTablet
      const isIOS = /iPhone|iPad|iPod/.test(userAgent)
      const isIOSChrome = isIOS && /CriOS/.test(userAgent)

      setDeviceInfo({ isDesktop, isTablet, isMobile })
      setIsIOS(isIOS)
      setIsIOSChrome(isIOSChrome)
    }

    // PWAが既にインストールされているかチェック
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches
      const isIOSStandalone =
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true

      // インストール済みフラグもチェック
      const hasInstalledFlag = localStorage.getItem('pwa-installed') === 'true'

      setIsInstalled(isStandalone || isIOSStandalone || hasInstalledFlag)
    }

    // エンゲージメントメトリクスの読み込み
    const loadMetrics = () => {
      try {
        const stored = localStorage.getItem('pwa-install-metrics')
        if (stored) {
          const metrics = JSON.parse(stored)
          setInstallMetrics(metrics)
          return metrics
        }
      } catch (error) {
        console.error('Failed to load install metrics:', error)
      }

      const defaultMetrics = {
        promptShownCount: 0,
        lastPromptTime: null,
        sessionCount: 1,
        engagementScore: 0,
      }
      updateMetrics(defaultMetrics)
      return defaultMetrics
    }

    // セッションカウントの更新
    const updateSessionCount = () => {
      const lastSessionTime = localStorage.getItem('pwa-last-session')
      const now = Date.now()

      // 30分以上経過していたら新しいセッション
      if (
        !lastSessionTime ||
        now - parseInt(lastSessionTime) > 30 * 60 * 1000
      ) {
        const metrics = loadMetrics()
        metrics.sessionCount++
        updateMetrics(metrics)
      }

      localStorage.setItem('pwa-last-session', now.toString())
    }

    detectDevice()
    checkIfInstalled()
    loadMetrics()
    updateSessionCount()

    // beforeinstallprompt イベントをキャッチ
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // エンゲージメントスコアを計算してプロンプト表示を決定
      const metrics = loadMetrics()
      const shouldShow = determinePromptTiming(metrics)

      if (shouldShow && !isInstalled) {
        // デバイスに応じた遅延時間
        const delay = deviceInfo.isMobile ? 3000 : 5000
        setTimeout(() => {
          setShowPrompt(true)
          updateMetrics({
            ...metrics,
            promptShownCount: metrics.promptShownCount + 1,
            lastPromptTime: Date.now(),
          })
        }, delay)
      }
    }

    // アプリがインストールされた時のイベント
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)

      // インストール成功を記録
      localStorage.setItem('pwa-installed', 'true')
      localStorage.setItem('pwa-install-date', Date.now().toString())
      localStorage.removeItem('pwa-install-declined')
      localStorage.removeItem('pwa-install-decline-time')
      localStorage.removeItem('pwa-install-decline-count')

      // 分析用のイベント送信（将来的な実装）
      if (window.gtag) {
        window.gtag('event', 'pwa_installed', {
          engagement_score: installMetrics.engagementScore,
          prompt_shown_count: installMetrics.promptShownCount,
        })
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled, deviceInfo, updateMetrics, determinePromptTiming])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS Safariの場合の処理
      if (isIOS && !isIOSChrome) {
        setShowIOSInstructions(true)
      }
      return
    }

    setIsLoading(true)

    try {
      // インストールプロンプトを表示
      await deferredPrompt.prompt()

      // ユーザーの選択を待つ
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setShowPrompt(false)

        // 分析用のイベント送信
        if (window.gtag) {
          window.gtag('event', 'pwa_install_accepted', {
            device_type: deviceInfo.isMobile
              ? 'mobile'
              : deviceInfo.isTablet
                ? 'tablet'
                : 'desktop',
          })
        }
      } else {
        console.log('User dismissed the install prompt')
        handleDismiss()
      }
    } catch (error) {
      console.error('Error showing install prompt:', error)
    } finally {
      setIsLoading(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)

    // 拒否を記録
    const currentDeclineCount = parseInt(
      localStorage.getItem('pwa-install-decline-count') || '0'
    )
    localStorage.setItem('pwa-install-declined', 'true')
    localStorage.setItem('pwa-install-decline-time', Date.now().toString())
    localStorage.setItem(
      'pwa-install-decline-count',
      (currentDeclineCount + 1).toString()
    )

    // 分析用のイベント送信
    if (window.gtag) {
      window.gtag('event', 'pwa_install_dismissed', {
        decline_count: currentDeclineCount + 1,
      })
    }
  }

  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  // iOS Safari用の手動インストール案内
  const IOSInstallInstructions = () => (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50"
      onClick={() => setShowIOSInstructions(false)}
    >
      <div
        className="bg-white rounded-t-2xl p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-lg mb-4">ホーム画面に追加</h3>
        <ol className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
              1
            </span>
            <span className="text-sm">
              下部の共有ボタン{' '}
              <span className="inline-block w-4 h-4 align-middle">□↑</span>{' '}
              をタップ
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
              2
            </span>
            <span className="text-sm">「ホーム画面に追加」を選択</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
              3
            </span>
            <span className="text-sm">右上の「追加」をタップ</span>
          </li>
        </ol>
        <button
          onClick={() => setShowIOSInstructions(false)}
          className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium"
        >
          わかりました
        </button>
      </div>
    </div>
  )

  // インストール済みまたはプロンプト表示しない場合は何も表示しない
  if (isInstalled || (!showPrompt && !showIOSInstructions)) {
    return null
  }

  // iOS Safariの手動インストール案内
  if (showIOSInstructions) {
    return <IOSInstallInstructions />
  }

  // 通常のインストールプロンプト
  if (!showPrompt || (!deferredPrompt && !isIOS)) {
    return null
  }

  return (
    <div className={`${className}`}>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="text-blue-100" size={20} />
              <h3 className="font-semibold text-sm">
                {deviceInfo.isMobile
                  ? 'アプリをインストール'
                  : 'デスクトップアプリとして利用'}
              </h3>
            </div>

            <p className="text-blue-100 text-xs mb-3 leading-relaxed">
              {deviceInfo.isMobile
                ? 'ホーム画面に追加して、アプリのように使えます'
                : 'ブラウザなしで独立したアプリとして利用できます'}
            </p>

            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2 text-blue-100 text-xs">
                <Monitor size={12} />
                <span>オフラインでも使用可能</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-xs">
                <Download size={12} />
                <span>
                  {deviceInfo.isMobile ? 'ホーム画面' : 'タスクバー'}
                  からすぐアクセス
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                disabled={isLoading}
                className="bg-white text-blue-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    インストール中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download size={14} />
                    {isIOS ? 'インストール方法' : 'インストール'}
                  </span>
                )}
              </button>

              <button
                onClick={handleDismiss}
                className="text-blue-100 hover:text-white p-1 rounded transition-colors"
                aria-label="プロンプトを閉じる"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * インストール成功後の案内コンポーネント
 */
export const InstallSuccessGuide: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches
      const isIOSStandalone =
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true

      const installed = isStandalone || isIOSStandalone
      setIsInstalled(installed)

      // インストール後初回のみガイドを表示
      if (installed && !localStorage.getItem('install-guide-shown')) {
        setShowGuide(true)
        localStorage.setItem('install-guide-shown', 'true')
      }
    }

    checkIfInstalled()

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowGuide(true)
      localStorage.setItem('install-guide-shown', 'true')
    }

    window.addEventListener('appinstalled', handleAppInstalled)
    return () => window.removeEventListener('appinstalled', handleAppInstalled)
  }, [])

  const handleCloseGuide = () => {
    setShowGuide(false)
  }

  if (!isInstalled || !showGuide) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="text-green-600" size={32} />
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            インストール完了！
          </h2>

          <p className="text-gray-600 text-sm mb-4">
            AmbientFlowがデバイスにインストールされました。ホーム画面からいつでもアクセスできます。
          </p>

          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-blue-800 text-xs">
              💡 オフラインでも音源の再生やプリセット管理ができます
            </p>
          </div>

          <button
            onClick={handleCloseGuide}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            始める
          </button>
        </div>
      </div>
    </div>
  )
}

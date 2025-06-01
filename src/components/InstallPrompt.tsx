import React, { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPromptProps {
  className?: string
}

/**
 * PWAインストール促進コンポーネント
 */
export const InstallPrompt: React.FC<InstallPromptProps> = ({
  className = '',
}) => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // PWAが既にインストールされているかチェック
    const checkIfInstalled = () => {
      // スタンドアロンモードで実行されているかチェック
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches
      // iOS Safari のホーム画面追加チェック
      const isIOSStandalone =
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true

      setIsInstalled(isStandalone || isIOSStandalone)
    }

    checkIfInstalled()

    // beforeinstallprompt イベントをキャッチ
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // インストールされていない場合のみプロンプトを表示
      if (!isInstalled) {
        setShowPrompt(true)
      }
    }

    // アプリがインストールされた時のイベント
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
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
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
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
      } else {
        console.log('User dismissed the install prompt')
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
    // 1時間後に再度表示
    setTimeout(
      () => {
        if (deferredPrompt && !isInstalled) {
          setShowPrompt(true)
        }
      },
      60 * 60 * 1000
    )
  }

  // インストール済みまたはプロンプト表示しない場合は何も表示しない
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className={`${className}`}>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="text-blue-100" size={20} />
              <h3 className="font-semibold text-sm">アプリをインストール</h3>
            </div>

            <p className="text-blue-100 text-xs mb-3 leading-relaxed">
              AmbientFlowをデバイスにインストールして、より快適にご利用いただけます
            </p>

            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2 text-blue-100 text-xs">
                <Monitor size={12} />
                <span>オフラインでも使用可能</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-xs">
                <Download size={12} />
                <span>ホーム画面からすぐアクセス</span>
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
                    インストール
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

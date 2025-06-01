import React, { useState, useEffect } from 'react'
import { RefreshCw, X, AlertCircle } from 'lucide-react'

interface UpdateNotificationProps {
  className?: string
}

/**
 * アプリ更新通知コンポーネント
 */
export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  className = '',
}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Service Worker の登録と更新検知
    const detectServiceWorkerUpdate = async () => {
      if (!('serviceWorker' in navigator)) {
        return
      }

      try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) {
          setRegistration(reg)

          // 新しいService Workerがインストール待ちの場合
          if (reg.waiting) {
            setUpdateAvailable(true)
          }

          // 新しいService Workerの検知
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setUpdateAvailable(true)
                }
              })
            }
          })

          // 手動で更新をチェック
          reg.update()
        }
      } catch (error) {
        console.error('Service Worker registration check failed:', error)
      }
    }

    detectServiceWorkerUpdate()

    // 定期的に更新をチェック（10分間隔）
    const updateCheckInterval = setInterval(
      () => {
        detectServiceWorkerUpdate()
      },
      10 * 60 * 1000
    )

    return () => {
      clearInterval(updateCheckInterval)
    }
  }, [])

  const handleUpdate = async () => {
    if (!registration || !registration.waiting) {
      return
    }

    setIsUpdating(true)

    try {
      // 新しいService Workerに制御を移す
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })

      // コントローラーが変更されるまで待つ
      const waitForControllerChange = new Promise<void>((resolve) => {
        const handleControllerChange = () => {
          navigator.serviceWorker.removeEventListener(
            'controllerchange',
            handleControllerChange
          )
          resolve()
        }
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          handleControllerChange
        )
      })

      await waitForControllerChange

      // ページをリロード
      window.location.reload()
    } catch (error) {
      console.error('Failed to update app:', error)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setUpdateAvailable(false)
    // 1時間後に再度通知
    setTimeout(
      () => {
        if (registration?.waiting) {
          setUpdateAvailable(true)
        }
      },
      60 * 60 * 1000
    )
  }

  if (!updateAvailable) {
    return null
  }

  return (
    <div className={`${className}`}>
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-green-100" size={20} />
              <h3 className="font-semibold text-sm">アップデート利用可能</h3>
            </div>

            <p className="text-green-100 text-xs mb-3 leading-relaxed">
              新しいバージョンのAmbientFlowが利用可能です。更新して最新機能をお楽しみください。
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="bg-white text-green-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    更新中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw size={14} />
                    今すぐ更新
                  </span>
                )}
              </button>

              <button
                onClick={handleDismiss}
                disabled={isUpdating}
                className="text-green-100 hover:text-white p-1 rounded transition-colors disabled:opacity-50"
                aria-label="通知を閉じる"
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

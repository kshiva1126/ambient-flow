import React, { useState, useEffect } from 'react'
import { WifiOff, Wifi, AlertCircle } from 'lucide-react'

interface OfflineIndicatorProps {
  className?: string
}

/**
 * オフライン状態表示コンポーネント
 */
export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)

      // 3秒後に再接続メッセージを非表示
      setTimeout(() => {
        setShowReconnected(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // オンライン状態で再接続メッセージも表示していない場合は何も表示しない
  if (isOnline && !showReconnected) {
    return null
  }

  return (
    <div className={`${className}`}>
      {!isOnline && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-600 rounded-lg border border-red-500/20">
          <WifiOff size={16} />
          <span className="text-sm font-medium">オフライン</span>
          <AlertCircle size={14} className="ml-1" />
        </div>
      )}

      {showReconnected && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20 animate-fade-in">
          <Wifi size={16} />
          <span className="text-sm font-medium">オンラインに復帰しました</span>
        </div>
      )}
    </div>
  )
}

/**
 * オフライン時の機能説明コンポーネント
 */
export const OfflineFeatureGuide: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-amber-600 mt-0.5" size={20} />
        <div>
          <h3 className="text-amber-800 font-semibold text-sm mb-1">
            オフラインモード
          </h3>
          <p className="text-amber-700 text-sm mb-2">
            現在インターネット接続がありませんが、以下の機能をご利用いただけます：
          </p>
          <ul className="text-amber-700 text-sm space-y-1">
            <li>• キャッシュされた音源の再生</li>
            <li>• 音量調整とミキシング</li>
            <li>• 保存されたプリセットの読み込み</li>
            <li>• 新しいプリセットの作成（ローカル保存）</li>
          </ul>
          <p className="text-amber-700 text-xs mt-2">
            ※ オンライン復帰時に自動的に同期されます
          </p>
        </div>
      </div>
    </div>
  )
}

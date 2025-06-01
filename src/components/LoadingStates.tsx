import React from 'react'
import { Loader2, Volume2, Music } from 'lucide-react'

interface LoadingProgressProps {
  progress: number
  label?: string
  className?: string
}

/**
 * 音声ファイルロード進捗表示コンポーネント
 */
export const AudioLoadProgress: React.FC<LoadingProgressProps> = ({
  progress,
  label = 'Loading...',
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-4 bg-gray-50 rounded-lg ${className}`}
    >
      <div className="flex-shrink-0">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-gray-200 rounded-full">
            <div
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
              style={{
                animation: progress >= 100 ? 'none' : undefined,
                borderColor: progress >= 100 ? '#10B981' : '#3B82F6',
              }}
            />
          </div>
          {progress >= 100 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Volume2 size={16} className="text-green-600" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900 truncate">
            {label}
          </span>
          <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * 音源カードのスケルトンローディング
 */
export const SoundCardSkeleton: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-lg p-4 space-y-3">
        {/* アイコンとタイトル部分 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-lg" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-3 bg-gray-300 rounded w-1/2" />
          </div>
        </div>

        {/* 音量スライダー部分 */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="flex justify-between">
            <div className="h-2 bg-gray-300 rounded w-8" />
            <div className="h-2 bg-gray-300 rounded w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * プリセットリストのスケルトンローディング
 */
export const PresetListSkeleton: React.FC<{
  count?: number
  className?: string
}> = ({ count = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-300 rounded w-1/3" />
              <div className="h-3 bg-gray-300 rounded w-16" />
            </div>
            <div className="h-3 bg-gray-300 rounded w-2/3" />
            <div className="flex gap-2 mt-3">
              <div className="h-6 bg-gray-300 rounded w-12" />
              <div className="h-6 bg-gray-300 rounded w-12" />
              <div className="h-6 bg-gray-300 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * アプリ全体のロードスクリーン
 */
export const AppLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">AmbientFlow</h2>
          <p className="text-sm text-gray-600">音源を準備しています...</p>
        </div>

        <div className="w-48 bg-gray-200 rounded-full h-1">
          <div className="bg-blue-500 h-1 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  )
}

/**
 * プリロード状態の可視化コンポーネント
 */
export const PreloadStatus: React.FC<{
  totalFiles: number
  loadedFiles: number
  currentFile?: string
  className?: string
}> = ({ totalFiles, loadedFiles, currentFile, className = '' }) => {
  const progress = totalFiles > 0 ? (loadedFiles / totalFiles) * 100 : 0

  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Loader2 className="text-blue-600 animate-spin" size={20} />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            音源をプリロード中...
          </h3>
          {currentFile && (
            <p className="text-xs text-blue-700">読み込み中: {currentFile}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-blue-700">
          <span>
            {loadedFiles} / {totalFiles} ファイル
          </span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="w-full bg-blue-100 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {progress >= 100 && (
        <div className="mt-3 flex items-center gap-2 text-green-700 text-sm">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          プリロード完了！
        </div>
      )}
    </div>
  )
}

/**
 * エラー状態表示コンポーネント
 */
export const ErrorState: React.FC<{
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}> = ({
  title = 'エラーが発生しました',
  message = '音源の読み込みに失敗しました。もう一度お試しください。',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`text-center p-8 ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Volume2 className="text-red-600" size={32} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 max-w-sm mx-auto">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          再試行
        </button>
      )}
    </div>
  )
}

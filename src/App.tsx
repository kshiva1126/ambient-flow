import { useEffect, useState, lazy, Suspense } from 'react'
import './App.css'
import { useAudioStore } from './stores/audioStore'
import { SOUND_SOURCES } from './data/sounds'
import { SoundCard } from './components/SoundCard'
import { PlayingCounter } from './components/PlayingCounter'
import { AppLoadingScreen, PreloadStatus } from './components/LoadingStates'
import { performanceMonitor } from './utils/pwaHelpers'

// Lazy load non-critical components
const OfflineIndicator = lazy(() =>
  import('./components/OfflineIndicator').then((m) => ({
    default: m.OfflineIndicator,
  }))
)
const OfflineFeatureGuide = lazy(() =>
  import('./components/OfflineIndicator').then((m) => ({
    default: m.OfflineFeatureGuide,
  }))
)
const InstallPrompt = lazy(() =>
  import('./components/InstallPrompt').then((m) => ({
    default: m.InstallPrompt,
  }))
)
const InstallSuccessGuide = lazy(() =>
  import('./components/InstallPrompt').then((m) => ({
    default: m.InstallSuccessGuide,
  }))
)
const UpdateNotification = lazy(() =>
  import('./components/UpdateNotification').then((m) => ({
    default: m.UpdateNotification,
  }))
)

function App() {
  const {
    play,
    stop,
    setVolume,
    isPlaying,
    getVolume,
    loadSound,
    getPlayingCount,
    loadPresets,
    presets,
  } = useAudioStore()

  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [loadedSoundsCount, setLoadedSoundsCount] = useState(0)
  const [currentLoadingSound, setCurrentLoadingSound] = useState<string | null>(
    null
  )

  // アプリ初期化とプリセット読み込み
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // パフォーマンス測定開始
        const startTime = performance.now()

        // プリセットを読み込み（非ブロッキング）
        loadPresets().catch(console.error)

        // 高優先度の音源を最初に読み込む
        const highPrioritySounds = ['rain', 'waves', 'fireplace', 'white-noise']
        const prioritizedSources = [
          ...SOUND_SOURCES.filter((s) => highPrioritySounds.includes(s.id)),
          ...SOUND_SOURCES.filter((s) => !highPrioritySounds.includes(s.id)),
        ]

        // 音源を順次読み込み
        for (let i = 0; i < prioritizedSources.length; i++) {
          const source = prioritizedSources[i]
          if (source) {
            setCurrentLoadingSound(source.name)

            await performanceMonitor.measureTime(
              `load-sound-${source.id}`,
              () => loadSound(source)
            )

            setLoadedSoundsCount(i + 1)
          }
        }

        // 初期化完了
        const totalTime = performance.now() - startTime
        performanceMonitor.recordMetric('app-initialization', totalTime)

        setCurrentLoadingSound(null)
        setIsInitialLoading(false)
      } catch (error) {
        console.error('App initialization failed:', error)
        setIsInitialLoading(false)
      }
    }

    initializeApp()
  }, [loadSound, loadPresets])

  // 初期ローディング中はローディングスクリーンを表示
  if (isInitialLoading) {
    return (
      <>
        <AppLoadingScreen />
        <div className="fixed bottom-4 left-4 right-4">
          <PreloadStatus
            totalFiles={SOUND_SOURCES.length}
            loadedFiles={loadedSoundsCount}
            currentFile={currentLoadingSound || undefined}
          />
        </div>
      </>
    )
  }

  const handleToggleSound = (soundId: string) => {
    if (isPlaying(soundId)) {
      stop(soundId)
    } else {
      play(soundId)
    }
  }

  const handleVolumeChange = (soundId: string, volume: number) => {
    setVolume(soundId, volume)
  }

  return (
    <div className="min-h-screen text-white">
      {/* PWA通知エリア */}
      <Suspense fallback={null}>
        <div className="fixed top-4 left-4 right-4 z-50 space-y-3">
          <UpdateNotification />
          <OfflineIndicator />
          <InstallPrompt />
        </div>
      </Suspense>

      {/* ヘッダー部分 */}
      <header className="relative mb-12 pt-8">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-[fadeIn_0.8s_ease-out]">
          AmbientFlow
        </h1>
        <p className="text-center text-gray-400 text-lg animate-[fadeIn_1s_ease-out]">
          環境音で作る、あなただけの音空間
        </p>
      </header>

      {/* オフライン機能ガイド */}
      <Suspense fallback={null}>
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <OfflineFeatureGuide />
        </div>
      </Suspense>

      <PlayingCounter count={getPlayingCount()} />

      {/* サウンドカードグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
        {SOUND_SOURCES.map((source, index) => (
          <div
            key={source.id}
            className="animate-[fadeIn_0.5s_ease-out]"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <SoundCard
              source={source}
              isPlaying={isPlaying(source.id)}
              volume={getVolume(source.id)}
              onToggle={handleToggleSound}
              onVolumeChange={handleVolumeChange}
            />
          </div>
        ))}
      </div>

      {/* プリセット表示エリア（今後実装予定） */}
      {presets.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-300">
            保存されたプリセット ({presets.length})
          </h2>
          {/* プリセットコンポーネントをここに追加予定 */}
        </div>
      )}

      {/* フッター */}
      <footer className="text-center mt-12 pb-8">
        <p className="text-gray-500 text-sm animate-[fadeIn_1.2s_ease-out]">
          クリックで再生/停止 • スライダーで音量調整
        </p>
        <p className="text-gray-600 text-xs mt-2">
          PWA対応 • オフライン再生 • データ永続化
        </p>
      </footer>

      {/* PWAインストール成功ガイド */}
      <Suspense fallback={null}>
        <InstallSuccessGuide />
      </Suspense>
    </div>
  )
}

export default App

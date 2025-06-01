import { useEffect } from 'react'
import './App.css'
import { useAudioStore } from './stores/audioStore'
import { SOUND_SOURCES } from './data/sounds'
import { SoundCard } from './components/SoundCard'
import { PlayingCounter } from './components/PlayingCounter'

function App() {
  const {
    play,
    stop,
    setVolume,
    isPlaying,
    getVolume,
    loadSound,
    getPlayingCount,
  } = useAudioStore()

  // 音源を事前に読み込む
  useEffect(() => {
    SOUND_SOURCES.forEach((source) => {
      loadSound(source)
    })
  }, [loadSound])

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
      {/* ヘッダー部分 */}
      <header className="relative mb-12 pt-8">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-[fadeIn_0.8s_ease-out]">
          AmbientFlow
        </h1>
        <p className="text-center text-gray-400 text-lg animate-[fadeIn_1s_ease-out]">
          環境音で作る、あなただけの音空間
        </p>
      </header>

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

      {/* フッター */}
      <footer className="text-center mt-12 pb-8">
        <p className="text-gray-500 text-sm animate-[fadeIn_1.2s_ease-out]">
          クリックで再生/停止 • スライダーで音量調整
        </p>
      </footer>
    </div>
  )
}

export default App

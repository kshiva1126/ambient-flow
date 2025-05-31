import { useEffect } from 'react'
import './App.css'
import { useAudioManager } from './hooks/useAudioManager'
import { SOUND_SOURCES } from './data/sounds'
import { SoundCard } from './components/SoundCard'
import { PlayingCounter } from './components/PlayingCounter'

function App() {
  const {
    playingSounds,
    play,
    stop,
    setVolume,
    isPlaying,
    getVolume,
    loadSound,
  } = useAudioManager()

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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">AmbientFlow</h1>

      <PlayingCounter count={playingSounds.length} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {SOUND_SOURCES.map((source) => (
          <SoundCard
            key={source.id}
            source={source}
            isPlaying={isPlaying(source.id)}
            volume={getVolume(source.id)}
            onToggle={handleToggleSound}
            onVolumeChange={handleVolumeChange}
          />
        ))}
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        Click on a sound to play/stop • Adjust volume with the slider
      </div>
    </div>
  )
}

export default App

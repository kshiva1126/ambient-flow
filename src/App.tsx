import { useEffect } from 'react'
import './App.css'
import { useAudioManager } from './hooks/useAudioManager'
import { SOUND_SOURCES } from './data/sounds'
import { SoundIcon } from './components/SoundIcon'

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

      <div className="text-center mb-6">
        <p className="text-gray-400">再生中: {playingSounds.length} 個の音源</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {SOUND_SOURCES.map((source) => {
          const playing = isPlaying(source.id)
          const volume = getVolume(source.id)

          return (
            <div
              key={source.id}
              className={`
                p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
                ${
                  playing
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }
              `}
              onClick={() => handleToggleSound(source.id)}
            >
              <div className="text-center mb-3">
                <div
                  className={`
                    flex justify-center mb-2 transition-all duration-300
                    ${playing ? 'scale-110' : 'scale-100'}
                  `}
                >
                  <SoundIcon
                    iconName={source.icon}
                    className="w-8 h-8"
                    style={{ color: playing ? source.color : '#9CA3AF' }}
                  />
                </div>
                <h3 className="font-semibold">{source.name}</h3>
                <p className="text-xs text-gray-400">{source.description}</p>
              </div>

              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) =>
                    handleVolumeChange(source.id, Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: playing
                      ? `linear-gradient(to right, ${source.color} 0%, ${source.color} ${volume}%, #374151 ${volume}%, #374151 100%)`
                      : undefined,
                  }}
                />
                <div className="text-center text-xs text-gray-400 mt-1">
                  {volume}%
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        Click on a sound to play/stop • Adjust volume with the slider
      </div>
    </div>
  )
}

export default App

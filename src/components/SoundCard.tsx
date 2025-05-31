import type { SoundSource } from '../types/sound'
import { SoundIcon } from './SoundIcon'
import { VolumeSlider } from './VolumeSlider'

interface SoundCardProps {
  source: SoundSource
  isPlaying: boolean
  volume: number
  onToggle: (soundId: string) => void
  onVolumeChange: (soundId: string, volume: number) => void
}

export const SoundCard = ({
  source,
  isPlaying,
  volume,
  onToggle,
  onVolumeChange,
}: SoundCardProps) => {
  return (
    <div
      data-testid={`sound-${source.id}`}
      className={`
        p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
        ${
          isPlaying
            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
        }
      `}
      onClick={() => onToggle(source.id)}
    >
      <div className="text-center mb-3">
        <div
          className={`
            flex justify-center mb-2 transition-all duration-300
            ${isPlaying ? 'scale-110' : 'scale-100'}
          `}
        >
          <SoundIcon
            iconName={source.icon}
            className="w-8 h-8"
            style={{ color: isPlaying ? source.color : '#9CA3AF' }}
          />
        </div>
        <h3 className="font-semibold">{source.name}</h3>
        <p className="text-xs text-gray-400">{source.description}</p>
      </div>

      <VolumeSlider
        soundId={source.id}
        volume={volume}
        color={source.color}
        isPlaying={isPlaying}
        onChange={onVolumeChange}
      />
    </div>
  )
}

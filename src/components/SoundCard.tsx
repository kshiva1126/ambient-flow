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
        group relative p-6 rounded-2xl cursor-pointer
        transition-all duration-500 ease-out transform
        ${
          isPlaying
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 scale-[1.02] animate-[glow_2s_ease-in-out_infinite]'
            : 'bg-white/5 hover:bg-white/10 hover:scale-[1.05]'
        }
        backdrop-blur-md border border-white/10
        hover:border-white/20
        shadow-xl hover:shadow-2xl
      `}
      onClick={() => onToggle(source.id)}
      style={{
        boxShadow: isPlaying
          ? `0 0 30px ${source.color}40, 0 0 60px ${source.color}20`
          : undefined,
      }}
    >
      {/* 再生中インジケーター */}
      {isPlaying && (
        <div className="absolute -top-1 -right-1 w-4 h-4">
          <div className="absolute w-full h-full bg-blue-400 rounded-full animate-ping" />
          <div className="relative w-full h-full bg-blue-400 rounded-full" />
        </div>
      )}

      {/* アイコンと情報 */}
      <div className="text-center mb-4">
        <div
          className={`
            flex justify-center mb-3 transition-all duration-300
            ${isPlaying ? 'scale-110 animate-[pulse_2s_ease-in-out_infinite]' : 'scale-100 group-hover:scale-110'}
          `}
        >
          <SoundIcon
            iconName={source.icon}
            className="w-12 h-12 transition-colors duration-300"
            style={{
              color: isPlaying ? source.color : '#9CA3AF',
              filter: isPlaying
                ? `drop-shadow(0 0 8px ${source.color}80)`
                : 'none',
            }}
          />
        </div>
        <h3 className="font-bold text-lg mb-1 text-white/90">{source.name}</h3>
        <p className="text-xs text-gray-400 opacity-80">{source.description}</p>
      </div>

      {/* ボリュームスライダー */}
      <VolumeSlider
        soundId={source.id}
        volume={volume}
        color={source.color}
        isPlaying={isPlaying}
        onChange={onVolumeChange}
      />

      {/* ホバーエフェクト用のオーバーレイ */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${source.color}10 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}

interface VolumeSliderProps {
  soundId: string
  volume: number
  color: string
  isPlaying: boolean
  onChange: (soundId: string, volume: number) => void
}

export const VolumeSlider = ({
  soundId,
  volume,
  color,
  isPlaying,
  onChange,
}: VolumeSliderProps) => {
  return (
    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        {/* カスタムスライダー */}
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          data-testid={`volume-${soundId}`}
          onChange={(e) => onChange(soundId, Number(e.target.value))}
          className="w-full h-2 bg-gray-700/50 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, ${
              isPlaying ? color : '#6B7280'
            } 0%, ${
              isPlaying ? color : '#6B7280'
            } ${volume}%, #374151 ${volume}%, #374151 100%)`,
          }}
        />

        {/* ホバー時のツールチップ */}
        <div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ left: `${volume}%` }}
        >
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
            {volume}%
          </div>
        </div>
      </div>

      {/* 音量表示 */}
      <div
        className="text-center text-xs text-gray-400 mt-2 font-medium"
        data-testid={`volume-display-${soundId}`}
      >
        {volume}%
      </div>
    </div>
  )
}

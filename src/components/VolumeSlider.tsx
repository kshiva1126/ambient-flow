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
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        data-testid={`volume-${soundId}`}
        onChange={(e) => onChange(soundId, Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        style={{
          background: isPlaying
            ? `linear-gradient(to right, ${color} 0%, ${color} ${volume}%, #374151 ${volume}%, #374151 100%)`
            : undefined,
        }}
      />
      <div
        className="text-center text-xs text-gray-400 mt-1"
        data-testid={`volume-display-${soundId}`}
      >
        {volume}%
      </div>
    </div>
  )
}

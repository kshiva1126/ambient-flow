interface PlayingCounterProps {
  count: number
}

export const PlayingCounter = ({ count }: PlayingCounterProps) => {
  return (
    <div className="text-center mb-8" data-testid="playing-counter">
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
        <div
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            count > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
          }`}
        />
        <span className="text-gray-300 font-medium" data-testid="playing-count">
          {count !== 0 ? `${count} 個の音源を再生中` : '音源を選択してください'}
        </span>
      </div>
    </div>
  )
}

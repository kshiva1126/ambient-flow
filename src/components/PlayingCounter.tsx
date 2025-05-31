interface PlayingCounterProps {
  count: number
}

export const PlayingCounter = ({ count }: PlayingCounterProps) => {
  return (
    <div className="text-center mb-6">
      <p className="text-gray-400" data-testid="playing-count">
        再生中: {count} 個の音源
      </p>
    </div>
  )
}

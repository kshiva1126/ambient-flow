import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlayingCounter } from './PlayingCounter'

describe('PlayingCounter', () => {
  it('should display count of 0 playing sounds', () => {
    render(<PlayingCounter count={0} />)

    expect(screen.getByText('音源を選択してください')).toBeInTheDocument()
    expect(screen.getByTestId('playing-count')).toBeInTheDocument()
  })

  it('should display count of 1 playing sound', () => {
    render(<PlayingCounter count={1} />)

    expect(screen.getByText('1 個の音源を再生中')).toBeInTheDocument()
  })

  it('should display count of multiple playing sounds', () => {
    render(<PlayingCounter count={5} />)

    expect(screen.getByText('5 個の音源を再生中')).toBeInTheDocument()
  })

  it('should display large count correctly', () => {
    render(<PlayingCounter count={15} />)

    expect(screen.getByText('15 個の音源を再生中')).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    render(<PlayingCounter count={3} />)

    const container = screen.getByTestId('playing-counter')
    expect(container).toHaveClass('text-center', 'mb-8')

    const textElement = screen.getByTestId('playing-count')
    expect(textElement).toHaveClass('text-gray-300', 'font-medium')
  })

  it('should handle edge case of negative count', () => {
    render(<PlayingCounter count={-1} />)

    // 負数の場合でも再生中メッセージを表示
    expect(screen.getByText('-1 個の音源を再生中')).toBeInTheDocument()
  })

  it('should update when count prop changes', () => {
    const { rerender } = render(<PlayingCounter count={2} />)

    expect(screen.getByText('2 個の音源を再生中')).toBeInTheDocument()

    rerender(<PlayingCounter count={7} />)

    expect(screen.getByText('7 個の音源を再生中')).toBeInTheDocument()
    expect(screen.queryByText('2 個の音源を再生中')).not.toBeInTheDocument()
  })

  it('should show correct indicator for 0 count', () => {
    render(<PlayingCounter count={0} />)

    const indicator = screen
      .getByTestId('playing-counter')
      .querySelector('.w-3.h-3')
    expect(indicator).toHaveClass('bg-gray-600')
    expect(indicator).not.toHaveClass('animate-pulse')
  })

  it('should show correct indicator for positive count', () => {
    render(<PlayingCounter count={3} />)

    const indicator = screen
      .getByTestId('playing-counter')
      .querySelector('.w-3.h-3')
    expect(indicator).toHaveClass('bg-green-400', 'animate-pulse')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlayingCounter } from './PlayingCounter'

describe('PlayingCounter', () => {
  it('should display count of 0 playing sounds', () => {
    render(<PlayingCounter count={0} />)

    expect(screen.getByText('再生中: 0 個の音源')).toBeInTheDocument()
    expect(screen.getByTestId('playing-count')).toBeInTheDocument()
  })

  it('should display count of 1 playing sound', () => {
    render(<PlayingCounter count={1} />)

    expect(screen.getByText('再生中: 1 個の音源')).toBeInTheDocument()
  })

  it('should display count of multiple playing sounds', () => {
    render(<PlayingCounter count={5} />)

    expect(screen.getByText('再生中: 5 個の音源')).toBeInTheDocument()
  })

  it('should display large count correctly', () => {
    render(<PlayingCounter count={15} />)

    expect(screen.getByText('再生中: 15 個の音源')).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    render(<PlayingCounter count={3} />)

    const container = screen.getByText('再生中: 3 個の音源').closest('div')
    expect(container).toHaveClass('text-center', 'mb-6')

    const textElement = screen.getByTestId('playing-count')
    expect(textElement).toHaveClass('text-gray-400')
  })

  it('should handle edge case of negative count', () => {
    render(<PlayingCounter count={-1} />)

    expect(screen.getByText('再生中: -1 個の音源')).toBeInTheDocument()
  })

  it('should update when count prop changes', () => {
    const { rerender } = render(<PlayingCounter count={2} />)

    expect(screen.getByText('再生中: 2 個の音源')).toBeInTheDocument()

    rerender(<PlayingCounter count={7} />)

    expect(screen.getByText('再生中: 7 個の音源')).toBeInTheDocument()
    expect(screen.queryByText('再生中: 2 個の音源')).not.toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VolumeSlider } from './VolumeSlider'

describe('VolumeSlider', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render volume slider with correct value', () => {
    render(
      <VolumeSlider
        soundId="test-sound"
        volume={75}
        color="#3B82F6"
        isPlaying={false}
        onChange={mockOnChange}
      />
    )

    const slider = screen.getByTestId('volume-test-sound')
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveValue('75')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '100')
  })

  it('should display volume percentage', () => {
    render(
      <VolumeSlider
        soundId="test-sound"
        volume={50}
        color="#3B82F6"
        isPlaying={false}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByTestId('volume-display-test-sound')).toHaveTextContent(
      '50%'
    )
    expect(screen.getByTestId('volume-display-test-sound')).toBeInTheDocument()
  })

  it('should call onChange when slider value changes', () => {
    render(
      <VolumeSlider
        soundId="test-sound"
        volume={50}
        color="#3B82F6"
        isPlaying={false}
        onChange={mockOnChange}
      />
    )

    const slider = screen.getByTestId('volume-test-sound')
    fireEvent.change(slider, { target: { value: '80' } })

    expect(mockOnChange).toHaveBeenCalledWith('test-sound', 80)
    expect(mockOnChange).toHaveBeenCalledTimes(1)
  })

  it('should apply gradient background when playing', () => {
    render(
      <VolumeSlider
        soundId="test-sound"
        volume={60}
        color="#3B82F6"
        isPlaying={true}
        onChange={mockOnChange}
      />
    )

    const slider = screen.getByTestId('volume-test-sound')
    const expectedGradient =
      'linear-gradient(to right, #3B82F6 0%, #3B82F6 60%, #374151 60%, #374151 100%)'
    expect(slider).toHaveStyle({ background: expectedGradient })
  })

  it('should not apply gradient background when not playing', () => {
    render(
      <VolumeSlider
        soundId="test-sound"
        volume={60}
        color="#3B82F6"
        isPlaying={false}
        onChange={mockOnChange}
      />
    )

    const slider = screen.getByTestId('volume-test-sound')
    // isPlaying=falseの場合、styleのbackgroundは設定されない（undefinedになる）
    expect(slider.style.background).toBe('')
  })

  it('should prevent click propagation on container', () => {
    const mockParentClick = vi.fn()

    render(
      <div onClick={mockParentClick}>
        <VolumeSlider
          soundId="test-sound"
          volume={50}
          color="#3B82F6"
          isPlaying={false}
          onChange={mockOnChange}
        />
      </div>
    )

    const container = screen.getByTestId('volume-test-sound').parentElement
    fireEvent.click(container!)

    expect(mockParentClick).not.toHaveBeenCalled()
  })

  it('should handle edge volume values', () => {
    const { rerender } = render(
      <VolumeSlider
        soundId="test-sound"
        volume={0}
        color="#3B82F6"
        isPlaying={true}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByTestId('volume-test-sound')).toHaveValue('0')

    rerender(
      <VolumeSlider
        soundId="test-sound"
        volume={100}
        color="#3B82F6"
        isPlaying={true}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByTestId('volume-test-sound')).toHaveValue('100')
  })

  it('should use correct color in gradient', () => {
    const testColor = '#FF5733'
    render(
      <VolumeSlider
        soundId="test-sound"
        volume={40}
        color={testColor}
        isPlaying={true}
        onChange={mockOnChange}
      />
    )

    const slider = screen.getByTestId('volume-test-sound')
    const expectedGradient =
      'linear-gradient(to right, #FF5733 0%, #FF5733 40%, #374151 40%, #374151 100%)'
    expect(slider).toHaveStyle({ background: expectedGradient })
  })
})

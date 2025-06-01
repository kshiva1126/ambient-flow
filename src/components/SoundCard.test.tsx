import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SoundCard } from './SoundCard'
import type { SoundSource } from '../types/sound'

const mockSource: SoundSource = {
  id: 'test-sound',
  name: 'テスト音源',
  category: 'nature',
  description: 'テスト用の音源です',
  icon: 'CloudRain',
  fileName: 'test.mp3',
  defaultVolume: 50,
  color: '#3B82F6',
}

describe('SoundCard', () => {
  const mockOnToggle = vi.fn()
  const mockOnVolumeChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render sound card with source information', () => {
    render(
      <SoundCard
        source={mockSource}
        isPlaying={false}
        volume={50}
        onToggle={mockOnToggle}
        onVolumeChange={mockOnVolumeChange}
      />
    )

    expect(screen.getByText('テスト音源')).toBeInTheDocument()
    expect(screen.getByText('テスト用の音源です')).toBeInTheDocument()
    expect(screen.getByTestId('sound-test-sound')).toBeInTheDocument()
  })

  it('should apply playing styles when isPlaying is true', () => {
    render(
      <SoundCard
        source={mockSource}
        isPlaying={true}
        volume={50}
        onToggle={mockOnToggle}
        onVolumeChange={mockOnVolumeChange}
      />
    )

    const cardElement = screen.getByTestId('sound-test-sound')
    expect(cardElement).toHaveClass(
      'bg-gradient-to-br',
      'from-blue-500/20',
      'to-purple-500/20'
    )
    expect(cardElement).toHaveClass(
      'scale-[1.02]',
      'animate-[glow_2s_ease-in-out_infinite]'
    )
  })

  it('should apply default styles when isPlaying is false', () => {
    render(
      <SoundCard
        source={mockSource}
        isPlaying={false}
        volume={50}
        onToggle={mockOnToggle}
        onVolumeChange={mockOnVolumeChange}
      />
    )

    const cardElement = screen.getByTestId('sound-test-sound')
    expect(cardElement).toHaveClass('bg-white/5')
    expect(cardElement).toHaveClass('hover:bg-white/10', 'hover:scale-[1.05]')
  })

  it('should call onToggle when card is clicked', () => {
    render(
      <SoundCard
        source={mockSource}
        isPlaying={false}
        volume={50}
        onToggle={mockOnToggle}
        onVolumeChange={mockOnVolumeChange}
      />
    )

    const cardElement = screen.getByTestId('sound-test-sound')
    fireEvent.click(cardElement)

    expect(mockOnToggle).toHaveBeenCalledWith('test-sound')
    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('should render VolumeSlider with correct props', () => {
    render(
      <SoundCard
        source={mockSource}
        isPlaying={true}
        volume={75}
        onToggle={mockOnToggle}
        onVolumeChange={mockOnVolumeChange}
      />
    )

    const volumeSlider = screen.getByTestId('volume-test-sound')
    expect(volumeSlider).toBeInTheDocument()
    expect(volumeSlider).toHaveValue('75')
  })

  it('should pass volume change to onVolumeChange', () => {
    render(
      <SoundCard
        source={mockSource}
        isPlaying={false}
        volume={50}
        onToggle={mockOnToggle}
        onVolumeChange={mockOnVolumeChange}
      />
    )

    const volumeSlider = screen.getByTestId('volume-test-sound')
    fireEvent.change(volumeSlider, { target: { value: '80' } })

    expect(mockOnVolumeChange).toHaveBeenCalledWith('test-sound', 80)
  })

  it('should display correct volume percentage', () => {
    render(
      <SoundCard
        source={mockSource}
        isPlaying={false}
        volume={65}
        onToggle={mockOnToggle}
        onVolumeChange={mockOnVolumeChange}
      />
    )

    expect(screen.getByTestId('volume-display-test-sound')).toHaveTextContent(
      '65%'
    )
  })

  it('should render SoundIcon with correct props', () => {
    render(
      <SoundCard
        source={mockSource}
        isPlaying={true}
        volume={50}
        onToggle={mockOnToggle}
        onVolumeChange={mockOnVolumeChange}
      />
    )

    // SoundIconコンポーネントが存在することを確認（アイコンがレンダリングされることを確認）
    const cardElement = screen.getByTestId('sound-test-sound')
    const iconElement = cardElement.querySelector('svg')
    expect(iconElement).toBeInTheDocument()
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import * as audioManagerHook from './hooks/useAudioManager'

// CSSインポートをモック
vi.mock('./App.css', () => ({}))

// useAudioManagerフックをモック
vi.mock('./hooks/useAudioManager')
const mockUseAudioManager = vi.mocked(audioManagerHook.useAudioManager)

const mockAudioManager = {
  playingSounds: [],
  play: vi.fn(),
  stop: vi.fn(),
  setVolume: vi.fn(),
  fadeIn: vi.fn(),
  fadeOut: vi.fn(),
  stopAll: vi.fn(),
  isPlaying: vi.fn().mockReturnValue(false),
  getVolume: vi.fn().mockReturnValue(50),
  loadSound: vi.fn(),
  unloadSound: vi.fn(),
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAudioManager.mockReturnValue(mockAudioManager)
  })

  it('should render app title', () => {
    render(<App />)

    expect(screen.getByText('AmbientFlow')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'AmbientFlow'
    )
  })

  it('should render playing counter with initial count', () => {
    render(<App />)

    expect(screen.getByTestId('playing-count')).toBeInTheDocument()
    expect(screen.getByText('再生中: 0 個の音源')).toBeInTheDocument()
  })

  it('should render all 15 sound sources', () => {
    render(<App />)

    const soundCards = screen.getAllByTestId(/^sound-/)
    expect(soundCards).toHaveLength(15)
  })

  it('should render help text', () => {
    render(<App />)

    expect(
      screen.getByText(
        'Click on a sound to play/stop • Adjust volume with the slider'
      )
    ).toBeInTheDocument()
  })

  it('should load all sound sources on mount', () => {
    render(<App />)

    expect(mockAudioManager.loadSound).toHaveBeenCalledTimes(15)
  })

  it('should handle sound toggle correctly', () => {
    mockAudioManager.isPlaying.mockImplementation(
      (soundId) => soundId === 'rain'
    )

    render(<App />)

    const rainCard = screen.getByTestId('sound-rain')
    fireEvent.click(rainCard)

    expect(mockAudioManager.stop).toHaveBeenCalledWith('rain')
  })

  it('should handle sound toggle for non-playing sound', () => {
    mockAudioManager.isPlaying.mockReturnValue(false)

    render(<App />)

    const rainCard = screen.getByTestId('sound-rain')
    fireEvent.click(rainCard)

    expect(mockAudioManager.play).toHaveBeenCalledWith('rain')
  })

  it('should handle volume change', () => {
    render(<App />)

    const volumeSlider = screen.getByTestId('volume-rain')
    fireEvent.change(volumeSlider, { target: { value: '75' } })

    expect(mockAudioManager.setVolume).toHaveBeenCalledWith('rain', 75)
  })

  it('should update playing counter when sounds are playing', () => {
    mockUseAudioManager.mockReturnValue({
      ...mockAudioManager,
      playingSounds: ['rain', 'waves', 'fireplace'],
    })

    render(<App />)

    expect(screen.getByText('再生中: 3 個の音源')).toBeInTheDocument()
  })

  it('should pass correct props to SoundCard components', () => {
    mockAudioManager.isPlaying.mockImplementation(
      (soundId) => soundId === 'rain'
    )
    mockAudioManager.getVolume.mockImplementation((soundId) =>
      soundId === 'rain' ? 75 : 50
    )

    render(<App />)

    // Rain card should show as playing
    const rainCard = screen.getByTestId('sound-rain')
    expect(rainCard).toHaveClass('border-blue-500')

    // Volume slider should have correct value
    const rainVolumeSlider = screen.getByTestId('volume-rain')
    expect(rainVolumeSlider).toHaveValue('75')
  })

  it('should apply correct layout classes', () => {
    render(<App />)

    const mainContainer = screen.getByText('AmbientFlow').closest('div')
    expect(mainContainer).toHaveClass(
      'min-h-screen',
      'bg-gray-900',
      'text-white',
      'p-8'
    )

    const gridContainer = screen.getAllByTestId(/^sound-/)[0]?.parentElement
    expect(gridContainer).toHaveClass(
      'grid',
      'grid-cols-2',
      'md:grid-cols-3',
      'lg:grid-cols-4',
      'gap-4',
      'max-w-6xl',
      'mx-auto'
    )
  })
})

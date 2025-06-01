import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

// CSSインポートをモック
vi.mock('./App.css', () => ({}))

// useAudioStoreフックをモック
const mockPlay = vi.fn()
const mockStop = vi.fn()
const mockSetVolume = vi.fn()
const mockLoadSound = vi.fn()
const mockIsPlaying = vi.fn().mockReturnValue(false)
const mockGetVolume = vi.fn().mockReturnValue(75)
const mockGetPlayingCount = vi.fn().mockReturnValue(0)

vi.mock('./stores/audioStore', () => ({
  useAudioStore: vi.fn(() => ({
    play: mockPlay,
    stop: mockStop,
    setVolume: mockSetVolume,
    loadSound: mockLoadSound,
    isPlaying: mockIsPlaying,
    getVolume: mockGetVolume,
    getPlayingCount: mockGetPlayingCount,
  })),
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsPlaying.mockReturnValue(false)
    mockGetVolume.mockReturnValue(75)
    mockGetPlayingCount.mockReturnValue(0)
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
    expect(screen.getByText('音源を選択してください')).toBeInTheDocument()
  })

  it('should render all 15 sound sources', () => {
    render(<App />)

    const soundCards = screen.getAllByTestId(/^sound-/)
    expect(soundCards).toHaveLength(15)
  })

  it('should render help text', () => {
    render(<App />)

    expect(
      screen.getByText('クリックで再生/停止 • スライダーで音量調整')
    ).toBeInTheDocument()
  })

  it('should load all sound sources on mount', () => {
    render(<App />)

    expect(mockLoadSound).toHaveBeenCalledTimes(15)
  })

  it('should handle sound toggle correctly', () => {
    mockIsPlaying.mockImplementation((soundId) => soundId === 'rain')

    render(<App />)

    const rainCard = screen.getByTestId('sound-rain')
    fireEvent.click(rainCard)

    expect(mockStop).toHaveBeenCalledWith('rain')
  })

  it('should handle sound toggle for non-playing sound', () => {
    mockIsPlaying.mockReturnValue(false)

    render(<App />)

    const rainCard = screen.getByTestId('sound-rain')
    fireEvent.click(rainCard)

    expect(mockPlay).toHaveBeenCalledWith('rain')
  })

  it.skip('should handle volume change', async () => {
    render(<App />)

    const volumeSlider = screen.getByTestId('volume-rain')
    expect(volumeSlider).toBeInTheDocument()

    fireEvent.change(volumeSlider, { target: { value: '75' } })

    await waitFor(() => {
      expect(mockSetVolume).toHaveBeenCalledWith('rain', 75)
    })
  })

  it('should update playing counter when sounds are playing', () => {
    mockGetPlayingCount.mockReturnValue(3)

    render(<App />)

    expect(screen.getByText('3 個の音源を再生中')).toBeInTheDocument()
  })

  it('should pass correct props to SoundCard components', () => {
    mockIsPlaying.mockImplementation((soundId) => soundId === 'rain')
    mockGetVolume.mockImplementation((soundId) =>
      soundId === 'rain' ? 75 : 50
    )

    render(<App />)

    // Rain card should show as playing
    const rainCard = screen.getByTestId('sound-rain')
    expect(rainCard).toHaveClass(
      'bg-gradient-to-br',
      'from-blue-500/20',
      'to-purple-500/20'
    )

    // Volume slider should have correct value
    const rainVolumeSlider = screen.getByTestId('volume-rain')
    expect(rainVolumeSlider).toHaveValue('75')
  })

  it('should apply correct layout classes', () => {
    render(<App />)

    const mainContainer = screen.getByText('AmbientFlow').closest('div')
    expect(mainContainer).toHaveClass('min-h-screen', 'text-white')

    const gridContainer =
      screen.getAllByTestId(/^sound-/)[0]?.parentElement?.parentElement
    expect(gridContainer).toHaveClass(
      'grid',
      'grid-cols-1',
      'sm:grid-cols-2',
      'md:grid-cols-3',
      'lg:grid-cols-4',
      'gap-6',
      'max-w-6xl',
      'mx-auto',
      'px-4'
    )
  })
})

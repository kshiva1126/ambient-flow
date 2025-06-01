import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAudioStore } from './audioStore'
import type { SoundSource } from '../types/sound'

// Mock AudioManager
vi.mock('../services/AudioManager', () => ({
  load: vi.fn(),
  unload: vi.fn(),
  play: vi.fn(),
  stop: vi.fn(),
  stopAll: vi.fn(),
  setVolume: vi.fn(),
  fadeIn: vi.fn(),
  fadeOut: vi.fn(),
}))

const mockSoundSource: SoundSource = {
  id: 'test-sound',
  name: 'Test Sound',
  category: 'nature',
  description: 'Test sound description',
  icon: 'TestIcon',
  fileName: 'test.mp3',
  defaultVolume: 50,
  color: '#3B82F6',
}

describe('AudioStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset store state after each test
    useAudioStore.setState({ sounds: {}, playingSounds: [] })
  })

  describe('loadSound', () => {
    beforeEach(() => {
      useAudioStore.setState({ sounds: {}, playingSounds: [] })
    })

    it('should load a sound source', () => {
      const { loadSound, getSoundState } = useAudioStore.getState()

      loadSound(mockSoundSource)

      const soundState = getSoundState('test-sound')
      expect(soundState).toBeDefined()
      expect(soundState?.id).toBe('test-sound')
      expect(soundState?.source).toEqual(mockSoundSource)
      expect(soundState?.isPlaying).toBe(false)
      expect(soundState?.volume).toBe(50)
      expect(soundState?.isLoaded).toBe(true)
    })

    it('should not reload an already loaded sound', () => {
      const { loadSound } = useAudioStore.getState()

      loadSound(mockSoundSource)
      loadSound(mockSoundSource) // Try loading again

      const { sounds } = useAudioStore.getState()
      expect(Object.keys(sounds)).toHaveLength(1)
    })
  })

  describe('play', () => {
    beforeEach(() => {
      useAudioStore.setState({ sounds: {}, playingSounds: [] })
      const { loadSound } = useAudioStore.getState()
      loadSound(mockSoundSource)
    })

    it('should play a loaded sound', () => {
      const { play, isPlaying } = useAudioStore.getState()

      play('test-sound')

      const { playingSounds: newPlayingSounds } = useAudioStore.getState()
      expect(isPlaying('test-sound')).toBe(true)
      expect(newPlayingSounds).toContain('test-sound')
    })

    it('should not play an unloaded sound', () => {
      const { play, isPlaying } = useAudioStore.getState()

      play('non-existent')

      expect(isPlaying('non-existent')).toBe(false)
    })

    it('should not play an already playing sound', () => {
      const { play } = useAudioStore.getState()

      play('test-sound')
      const { playingSounds: firstState } = useAudioStore.getState()

      play('test-sound') // Try playing again
      const { playingSounds: secondState } = useAudioStore.getState()

      expect(firstState.length).toBe(1)
      expect(secondState.length).toBe(1)
    })
  })

  describe('stop', () => {
    beforeEach(() => {
      useAudioStore.setState({ sounds: {}, playingSounds: [] })
      const { loadSound, play } = useAudioStore.getState()
      loadSound(mockSoundSource)
      play('test-sound')
    })

    it('should stop a playing sound', () => {
      const { stop, isPlaying } = useAudioStore.getState()

      stop('test-sound')

      const { playingSounds: newPlayingSounds } = useAudioStore.getState()
      expect(isPlaying('test-sound')).toBe(false)
      expect(newPlayingSounds).not.toContain('test-sound')
    })

    it('should not affect non-playing sound', () => {
      const { stop, isPlaying } = useAudioStore.getState()

      stop('test-sound')
      stop('test-sound') // Try stopping again

      expect(isPlaying('test-sound')).toBe(false)
    })
  })

  describe('stopAll', () => {
    beforeEach(() => {
      useAudioStore.setState({ sounds: {}, playingSounds: [] })
      const { loadSound, play } = useAudioStore.getState()

      const source1 = { ...mockSoundSource, id: 'sound1' }
      const source2 = { ...mockSoundSource, id: 'sound2' }

      loadSound(source1)
      loadSound(source2)
      play('sound1')
      play('sound2')
    })

    it('should stop all playing sounds', () => {
      const { stopAll, isPlaying } = useAudioStore.getState()

      stopAll()

      const { playingSounds: newPlayingSounds } = useAudioStore.getState()
      expect(isPlaying('sound1')).toBe(false)
      expect(isPlaying('sound2')).toBe(false)
      expect(newPlayingSounds).toEqual([])
    })
  })

  describe('setVolume', () => {
    beforeEach(() => {
      const { loadSound } = useAudioStore.getState()
      loadSound(mockSoundSource)
    })

    it('should set volume for a loaded sound', () => {
      const { setVolume, getVolume } = useAudioStore.getState()

      setVolume('test-sound', 75)

      expect(getVolume('test-sound')).toBe(75)
    })

    it('should clamp volume to 0-100 range', () => {
      const { setVolume, getVolume } = useAudioStore.getState()

      setVolume('test-sound', -10)
      expect(getVolume('test-sound')).toBe(0)

      setVolume('test-sound', 150)
      expect(getVolume('test-sound')).toBe(100)
    })

    it('should not set volume for unloaded sound', () => {
      const { setVolume, getVolume } = useAudioStore.getState()

      setVolume('non-existent', 75)

      expect(getVolume('non-existent')).toBe(0)
    })
  })

  describe('fadeIn', () => {
    beforeEach(() => {
      useAudioStore.setState({ sounds: {}, playingSounds: [] })
      const { loadSound } = useAudioStore.getState()
      loadSound(mockSoundSource)
    })

    it('should start playing and fade in', () => {
      const { fadeIn, isPlaying } = useAudioStore.getState()

      fadeIn('test-sound', 100)

      const { playingSounds: newPlayingSounds } = useAudioStore.getState()
      expect(isPlaying('test-sound')).toBe(true)
      expect(newPlayingSounds).toContain('test-sound')
    })

    it('should not fade in unloaded sound', () => {
      const { fadeIn, isPlaying } = useAudioStore.getState()

      fadeIn('non-existent', 100)

      expect(isPlaying('non-existent')).toBe(false)
    })
  })

  describe('fadeOut', () => {
    beforeEach(() => {
      const { loadSound, play } = useAudioStore.getState()
      loadSound(mockSoundSource)
      play('test-sound')
    })

    it('should fade out a playing sound', async () => {
      const { fadeOut, isPlaying } = useAudioStore.getState()

      fadeOut('test-sound', 50) // Short duration for testing

      // Should still be playing immediately after fadeOut call
      expect(isPlaying('test-sound')).toBe(true)

      // Wait for fade out to complete
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(isPlaying('test-sound')).toBe(false)
    })

    it('should not fade out non-playing sound', () => {
      const { stop, fadeOut, isPlaying } = useAudioStore.getState()

      stop('test-sound')
      fadeOut('test-sound', 50)

      expect(isPlaying('test-sound')).toBe(false)
    })
  })

  describe('unloadSound', () => {
    beforeEach(() => {
      const { loadSound } = useAudioStore.getState()
      loadSound(mockSoundSource)
    })

    it('should unload a sound', () => {
      const { unloadSound, getSoundState } = useAudioStore.getState()

      unloadSound('test-sound')

      expect(getSoundState('test-sound')).toBeUndefined()
    })

    it('should remove sound from playing sounds when unloading', () => {
      const { play, unloadSound, playingSounds } = useAudioStore.getState()

      play('test-sound')
      unloadSound('test-sound')

      expect(playingSounds).not.toContain('test-sound')
    })
  })

  describe('selectors', () => {
    beforeEach(() => {
      const { loadSound } = useAudioStore.getState()
      loadSound(mockSoundSource)
    })

    it('should return correct playing state', () => {
      const { play, isPlaying } = useAudioStore.getState()

      expect(isPlaying('test-sound')).toBe(false)

      play('test-sound')
      expect(isPlaying('test-sound')).toBe(true)
    })

    it('should return correct volume', () => {
      const { setVolume, getVolume } = useAudioStore.getState()

      expect(getVolume('test-sound')).toBe(50) // Default volume

      setVolume('test-sound', 80)
      expect(getVolume('test-sound')).toBe(80)
    })

    it('should return correct playing count', () => {
      const { play, getPlayingCount } = useAudioStore.getState()
      const source2 = { ...mockSoundSource, id: 'sound2' }
      const { loadSound } = useAudioStore.getState()

      loadSound(source2)

      expect(getPlayingCount()).toBe(0)

      play('test-sound')
      expect(getPlayingCount()).toBe(1)

      play('sound2')
      expect(getPlayingCount()).toBe(2)
    })

    it('should return sound state', () => {
      const { getSoundState } = useAudioStore.getState()

      const soundState = getSoundState('test-sound')
      expect(soundState).toBeDefined()
      expect(soundState?.id).toBe('test-sound')

      expect(getSoundState('non-existent')).toBeUndefined()
    })
  })
})

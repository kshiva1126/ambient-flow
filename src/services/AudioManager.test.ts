import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Howl } from 'howler'
import { AudioManager } from './AudioManager'
import type { SoundSource } from '../types/sound'

// Mock data
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

// Type for accessing private members
interface AudioManagerPrivate extends AudioManager {
  audioInstances: Map<string, unknown>
}

describe('AudioManager', () => {
  let audioManager: AudioManager
  let audioManagerPrivate: AudioManagerPrivate

  beforeEach(() => {
    vi.clearAllMocks()
    // Get fresh instance
    audioManager = AudioManager.getInstance()
    audioManagerPrivate = audioManager as AudioManagerPrivate
    // Clear any existing instances
    audioManagerPrivate.audioInstances.clear()
  })

  afterEach(() => {
    // Clean up
    audioManagerPrivate.audioInstances.clear()
  })

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = AudioManager.getInstance()
      const instance2 = AudioManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('load', () => {
    it('should load a sound source', () => {
      audioManager.load(mockSoundSource)

      expect(Howl).toHaveBeenCalledWith({
        src: ['/src/assets/sounds/test.mp3'],
        html5: true,
        loop: true,
        volume: 0.5,
        preload: true,
        onloaderror: expect.any(Function),
        onplayerror: expect.any(Function),
      })
    })

    it('should not load the same sound twice', () => {
      audioManager.load(mockSoundSource)
      audioManager.load(mockSoundSource)

      expect(Howl).toHaveBeenCalledTimes(1)
    })
  })

  describe('play', () => {
    it('should play a loaded sound', () => {
      audioManager.load(mockSoundSource)
      const mockPlay = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { howl: { play: typeof mockPlay }; isPlaying: boolean }
      >
      instances.get('test-sound')!.howl.play = mockPlay

      audioManager.play('test-sound')

      expect(mockPlay).toHaveBeenCalled()
      expect(instances.get('test-sound')!.isPlaying).toBe(true)
    })

    it('should not play an already playing sound', () => {
      audioManager.load(mockSoundSource)
      const mockPlay = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { howl: { play: typeof mockPlay }; isPlaying: boolean }
      >
      instances.get('test-sound')!.howl.play = mockPlay
      instances.get('test-sound')!.isPlaying = true

      audioManager.play('test-sound')

      expect(mockPlay).not.toHaveBeenCalled()
    })

    it('should warn when trying to play unloaded sound', () => {
      const consoleWarn = vi.spyOn(console, 'warn')
      audioManager.play('non-existent')

      expect(consoleWarn).toHaveBeenCalledWith('Sound non-existent not loaded')
    })
  })

  describe('stop', () => {
    it('should stop a playing sound', () => {
      audioManager.load(mockSoundSource)
      const mockStop = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { howl: { stop: typeof mockStop }; isPlaying: boolean }
      >
      instances.get('test-sound')!.howl.stop = mockStop
      instances.get('test-sound')!.isPlaying = true

      audioManager.stop('test-sound')

      expect(mockStop).toHaveBeenCalled()
      expect(instances.get('test-sound')!.isPlaying).toBe(false)
    })

    it('should not stop an already stopped sound', () => {
      audioManager.load(mockSoundSource)
      const mockStop = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { howl: { stop: typeof mockStop }; isPlaying: boolean }
      >
      instances.get('test-sound')!.howl.stop = mockStop
      instances.get('test-sound')!.isPlaying = false

      audioManager.stop('test-sound')

      expect(mockStop).not.toHaveBeenCalled()
    })

    it('should handle non-existent sound gracefully', () => {
      expect(() => audioManager.stop('non-existent')).not.toThrow()
    })
  })

  describe('setVolume', () => {
    it('should set volume within valid range', () => {
      audioManager.load(mockSoundSource)
      const mockVolume = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { howl: { volume: typeof mockVolume }; volume: number }
      >
      instances.get('test-sound')!.howl.volume = mockVolume

      audioManager.setVolume('test-sound', 75)

      expect(mockVolume).toHaveBeenCalledWith(0.75)
      expect(instances.get('test-sound')!.volume).toBe(75)
    })

    it('should clamp volume to 0-100 range', () => {
      audioManager.load(mockSoundSource)
      const mockVolume = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { howl: { volume: typeof mockVolume } }
      >
      instances.get('test-sound')!.howl.volume = mockVolume

      audioManager.setVolume('test-sound', 150)
      expect(mockVolume).toHaveBeenCalledWith(1)

      audioManager.setVolume('test-sound', -50)
      expect(mockVolume).toHaveBeenCalledWith(0)
    })

    it('should handle non-existent sound gracefully', () => {
      expect(() => audioManager.setVolume('non-existent', 50)).not.toThrow()
    })
  })

  describe('fadeIn', () => {
    it('should fade in a sound', () => {
      vi.useFakeTimers()
      audioManager.load(mockSoundSource)
      const mockFade = vi.fn()
      const mockPlay = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        {
          howl: { fade: typeof mockFade; play: typeof mockPlay }
          isPlaying: boolean
        }
      >
      instances.get('test-sound')!.howl.fade = mockFade
      instances.get('test-sound')!.howl.play = mockPlay

      audioManager.fadeIn('test-sound', 1000)

      expect(mockFade).toHaveBeenCalledWith(0, 0.5, 1000)
      expect(mockPlay).toHaveBeenCalled()
      expect(instances.get('test-sound')!.isPlaying).toBe(true)

      vi.useRealTimers()
    })

    it('should use default duration', () => {
      audioManager.load(mockSoundSource)
      const mockFade = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { howl: { fade: typeof mockFade } }
      >
      instances.get('test-sound')!.howl.fade = mockFade

      audioManager.fadeIn('test-sound')

      expect(mockFade).toHaveBeenCalledWith(0, 0.5, 1000)
    })
  })

  describe('fadeOut', () => {
    it('should fade out a sound', () => {
      vi.useFakeTimers()
      audioManager.load(mockSoundSource)
      const mockFade = vi.fn()
      const mockStop = vi.fn()
      const mockVolume = vi.fn().mockReturnValue(0)
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        {
          howl: {
            fade: typeof mockFade
            stop: typeof mockStop
            volume: typeof mockVolume
          }
          volume: number
          isPlaying: boolean
        }
      >
      instances.get('test-sound')!.howl.fade = mockFade
      instances.get('test-sound')!.howl.stop = mockStop
      instances.get('test-sound')!.howl.volume = mockVolume
      instances.get('test-sound')!.volume = 50

      audioManager.fadeOut('test-sound', 1000)

      expect(mockFade).toHaveBeenCalledWith(0.5, 0, 1000)

      vi.advanceTimersByTime(1000)

      expect(mockStop).toHaveBeenCalled()
      expect(instances.get('test-sound')!.isPlaying).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('stopAll', () => {
    it('should stop all playing sounds', () => {
      const sound1 = { ...mockSoundSource, id: 'sound1' }
      const sound2 = { ...mockSoundSource, id: 'sound2' }

      audioManager.load(sound1)
      audioManager.load(sound2)

      const mockStop1 = vi.fn()
      const mockStop2 = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        {
          howl: { stop: typeof mockStop1 }
          isPlaying: boolean
        }
      >
      instances.get('sound1')!.howl.stop = mockStop1
      instances.get('sound1')!.isPlaying = true
      instances.get('sound2')!.howl.stop = mockStop2
      instances.get('sound2')!.isPlaying = true

      audioManager.stopAll()

      expect(mockStop1).toHaveBeenCalled()
      expect(mockStop2).toHaveBeenCalled()
      expect(instances.get('sound1')!.isPlaying).toBe(false)
      expect(instances.get('sound2')!.isPlaying).toBe(false)
    })
  })

  describe('unloadUnused', () => {
    it('should unload unused sounds', () => {
      const sound1 = { ...mockSoundSource, id: 'sound1' }
      const sound2 = { ...mockSoundSource, id: 'sound2' }

      audioManager.load(sound1)
      audioManager.load(sound2)

      const mockUnload1 = vi.fn()
      const mockUnload2 = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        {
          howl: { unload: typeof mockUnload1 }
          isPlaying: boolean
        }
      >
      instances.get('sound1')!.howl.unload = mockUnload1
      instances.get('sound1')!.isPlaying = false
      instances.get('sound2')!.howl.unload = mockUnload2
      instances.get('sound2')!.isPlaying = true

      audioManager.unloadUnused()

      expect(mockUnload1).toHaveBeenCalled()
      expect(mockUnload2).not.toHaveBeenCalled()
      expect(instances.has('sound1')).toBe(false)
      expect(instances.has('sound2')).toBe(true)
    })
  })

  describe('unload', () => {
    it('should unload a specific sound', () => {
      audioManager.load(mockSoundSource)
      const mockUnload = vi.fn()
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { howl: { unload: typeof mockUnload } }
      >
      instances.get('test-sound')!.howl.unload = mockUnload

      audioManager.unload('test-sound')

      expect(mockUnload).toHaveBeenCalled()
      expect(instances.has('test-sound')).toBe(false)
    })

    it('should handle non-existent sound gracefully', () => {
      expect(() => audioManager.unload('non-existent')).not.toThrow()
    })
  })

  describe('getPlayingSounds', () => {
    it('should return list of playing sound IDs', () => {
      const sound1 = { ...mockSoundSource, id: 'sound1' }
      const sound2 = { ...mockSoundSource, id: 'sound2' }
      const sound3 = { ...mockSoundSource, id: 'sound3' }

      audioManager.load(sound1)
      audioManager.load(sound2)
      audioManager.load(sound3)

      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { isPlaying: boolean }
      >
      instances.get('sound1')!.isPlaying = true
      instances.get('sound2')!.isPlaying = false
      instances.get('sound3')!.isPlaying = true

      const playingSounds = audioManager.getPlayingSounds()

      expect(playingSounds).toEqual(['sound1', 'sound3'])
    })
  })

  describe('isPlaying', () => {
    it('should return true for playing sound', () => {
      audioManager.load(mockSoundSource)
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { isPlaying: boolean }
      >
      instances.get('test-sound')!.isPlaying = true

      expect(audioManager.isPlaying('test-sound')).toBe(true)
    })

    it('should return false for non-playing sound', () => {
      audioManager.load(mockSoundSource)
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { isPlaying: boolean }
      >
      instances.get('test-sound')!.isPlaying = false

      expect(audioManager.isPlaying('test-sound')).toBe(false)
    })

    it('should return false for non-existent sound', () => {
      expect(audioManager.isPlaying('non-existent')).toBe(false)
    })
  })

  describe('getVolume', () => {
    it('should return volume for existing sound', () => {
      audioManager.load(mockSoundSource)
      const instances = audioManagerPrivate.audioInstances as Map<
        string,
        { volume: number }
      >
      instances.get('test-sound')!.volume = 75

      expect(audioManager.getVolume('test-sound')).toBe(75)
    })

    it('should return 0 for non-existent sound', () => {
      expect(audioManager.getVolume('non-existent')).toBe(0)
    })
  })
})

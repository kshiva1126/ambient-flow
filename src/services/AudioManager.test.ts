import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import * as audioManager from './AudioManager'
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

describe('AudioManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear all audio instances before each test
    audioManager.clearAll()
  })

  afterEach(() => {
    // Clean up after each test
    audioManager.clearAll()
  })

  describe('load', () => {
    it('should load a sound source', () => {
      audioManager.load(mockSoundSource)
      // Verify the sound is loaded by checking it can be played
      expect(() => audioManager.play(mockSoundSource.id)).not.toThrow()
    })

    it('should not load the same sound twice', () => {
      audioManager.load(mockSoundSource)
      audioManager.load(mockSoundSource)
      // Should not throw an error when loading the same sound twice
      expect(() => audioManager.play(mockSoundSource.id)).not.toThrow()
    })

    it('should handle load errors gracefully', () => {
      const invalidSource: SoundSource = {
        ...mockSoundSource,
        fileName: 'nonexistent.mp3',
      }
      expect(() => audioManager.load(invalidSource)).not.toThrow()
    })
  })

  describe('play', () => {
    beforeEach(() => {
      audioManager.load(mockSoundSource)
    })

    it('should play a loaded sound', () => {
      audioManager.play(mockSoundSource.id)
      expect(audioManager.isPlaying(mockSoundSource.id)).toBe(true)
    })

    it('should not throw when playing unloaded sound', () => {
      expect(() => audioManager.play('non-existent')).not.toThrow()
    })

    it('should not play the same sound twice', () => {
      audioManager.play(mockSoundSource.id)
      audioManager.play(mockSoundSource.id)
      expect(audioManager.isPlaying(mockSoundSource.id)).toBe(true)
    })
  })

  describe('stop', () => {
    beforeEach(() => {
      audioManager.load(mockSoundSource)
      audioManager.play(mockSoundSource.id)
    })

    it('should stop a playing sound', () => {
      audioManager.stop(mockSoundSource.id)
      expect(audioManager.isPlaying(mockSoundSource.id)).toBe(false)
    })

    it('should not throw when stopping unloaded sound', () => {
      expect(() => audioManager.stop('non-existent')).not.toThrow()
    })

    it('should not throw when stopping already stopped sound', () => {
      audioManager.stop(mockSoundSource.id)
      expect(() => audioManager.stop(mockSoundSource.id)).not.toThrow()
    })
  })

  describe('setVolume', () => {
    beforeEach(() => {
      audioManager.load(mockSoundSource)
    })

    it('should set volume for a loaded sound', () => {
      audioManager.setVolume(mockSoundSource.id, 75)
      expect(audioManager.getVolume(mockSoundSource.id)).toBe(75)
    })

    it('should clamp volume to 0-100 range', () => {
      audioManager.setVolume(mockSoundSource.id, -10)
      expect(audioManager.getVolume(mockSoundSource.id)).toBe(0)

      audioManager.setVolume(mockSoundSource.id, 150)
      expect(audioManager.getVolume(mockSoundSource.id)).toBe(100)
    })

    it('should not throw when setting volume for unloaded sound', () => {
      expect(() => audioManager.setVolume('non-existent', 50)).not.toThrow()
    })
  })

  describe('fadeIn', () => {
    beforeEach(() => {
      audioManager.load(mockSoundSource)
    })

    it('should start playing and fade in', () => {
      audioManager.fadeIn(mockSoundSource.id, 100)
      expect(audioManager.isPlaying(mockSoundSource.id)).toBe(true)
    })

    it('should not throw when fading in unloaded sound', () => {
      expect(() => audioManager.fadeIn('non-existent', 100)).not.toThrow()
    })
  })

  describe('fadeOut', () => {
    beforeEach(() => {
      audioManager.load(mockSoundSource)
      audioManager.play(mockSoundSource.id)
    })

    it('should fade out a playing sound', () => {
      audioManager.fadeOut(mockSoundSource.id, 100)
      // Sound should still be playing immediately after fadeOut call
      expect(audioManager.isPlaying(mockSoundSource.id)).toBe(true)
    })

    it('should not throw when fading out unloaded sound', () => {
      expect(() => audioManager.fadeOut('non-existent', 100)).not.toThrow()
    })
  })

  describe('stopAll', () => {
    beforeEach(() => {
      const source1 = { ...mockSoundSource, id: 'sound1' }
      const source2 = { ...mockSoundSource, id: 'sound2' }
      audioManager.load(source1)
      audioManager.load(source2)
      audioManager.play('sound1')
      audioManager.play('sound2')
    })

    it('should stop all playing sounds', () => {
      expect(audioManager.isPlaying('sound1')).toBe(true)
      expect(audioManager.isPlaying('sound2')).toBe(true)

      audioManager.stopAll()

      expect(audioManager.isPlaying('sound1')).toBe(false)
      expect(audioManager.isPlaying('sound2')).toBe(false)
    })
  })

  describe('getPlayingSounds', () => {
    beforeEach(() => {
      const source1 = { ...mockSoundSource, id: 'sound1' }
      const source2 = { ...mockSoundSource, id: 'sound2' }
      audioManager.load(source1)
      audioManager.load(source2)
    })

    it('should return empty array when no sounds playing', () => {
      expect(audioManager.getPlayingSounds()).toEqual([])
    })

    it('should return array of playing sound IDs', () => {
      audioManager.play('sound1')
      audioManager.play('sound2')

      const playing = audioManager.getPlayingSounds()
      expect(playing).toContain('sound1')
      expect(playing).toContain('sound2')
      expect(playing).toHaveLength(2)
    })

    it('should update when sounds are stopped', () => {
      audioManager.play('sound1')
      audioManager.play('sound2')
      audioManager.stop('sound1')

      const playing = audioManager.getPlayingSounds()
      expect(playing).toContain('sound2')
      expect(playing).not.toContain('sound1')
      expect(playing).toHaveLength(1)
    })
  })

  describe('isPlaying', () => {
    beforeEach(() => {
      audioManager.load(mockSoundSource)
    })

    it('should return false for unloaded sound', () => {
      expect(audioManager.isPlaying('non-existent')).toBe(false)
    })

    it('should return false for loaded but not playing sound', () => {
      expect(audioManager.isPlaying(mockSoundSource.id)).toBe(false)
    })

    it('should return true for playing sound', () => {
      audioManager.play(mockSoundSource.id)
      expect(audioManager.isPlaying(mockSoundSource.id)).toBe(true)
    })
  })

  describe('getVolume', () => {
    beforeEach(() => {
      audioManager.load(mockSoundSource)
    })

    it('should return 0 for unloaded sound', () => {
      expect(audioManager.getVolume('non-existent')).toBe(0)
    })

    it('should return default volume for loaded sound', () => {
      expect(audioManager.getVolume(mockSoundSource.id)).toBe(
        mockSoundSource.defaultVolume
      )
    })

    it('should return updated volume after setVolume', () => {
      audioManager.setVolume(mockSoundSource.id, 75)
      expect(audioManager.getVolume(mockSoundSource.id)).toBe(75)
    })
  })

  describe('unload', () => {
    beforeEach(() => {
      audioManager.load(mockSoundSource)
    })

    it('should unload a sound', () => {
      audioManager.unload(mockSoundSource.id)
      expect(audioManager.getVolume(mockSoundSource.id)).toBe(0)
    })

    it('should not throw when unloading non-existent sound', () => {
      expect(() => audioManager.unload('non-existent')).not.toThrow()
    })
  })

  describe('unloadUnused', () => {
    beforeEach(() => {
      const source1 = { ...mockSoundSource, id: 'sound1' }
      const source2 = { ...mockSoundSource, id: 'sound2' }
      audioManager.load(source1)
      audioManager.load(source2)
      audioManager.play('sound1') // Only sound1 is playing
    })

    it('should unload unused sounds but keep playing sounds', () => {
      audioManager.unloadUnused()

      // sound1 should still be available (playing)
      expect(audioManager.isPlaying('sound1')).toBe(true)

      // sound2 should be unloaded (not playing)
      expect(audioManager.getVolume('sound2')).toBe(0)
    })
  })

  describe('clearAll', () => {
    beforeEach(() => {
      const source1 = { ...mockSoundSource, id: 'sound1' }
      const source2 = { ...mockSoundSource, id: 'sound2' }
      audioManager.load(source1)
      audioManager.load(source2)
      audioManager.play('sound1')
    })

    it('should clear all sounds', () => {
      audioManager.clearAll()

      expect(audioManager.isPlaying('sound1')).toBe(false)
      expect(audioManager.getVolume('sound1')).toBe(0)
      expect(audioManager.getVolume('sound2')).toBe(0)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { SOUND_SOURCES, getSoundById, getSoundsByCategory } from './sounds'
import type { SoundCategory } from '../types/sound'

describe('sounds data', () => {
  describe('SOUND_SOURCES', () => {
    it('should contain exactly 15 sound sources', () => {
      expect(SOUND_SOURCES).toHaveLength(15)
    })

    it('should have all required properties for each sound source', () => {
      SOUND_SOURCES.forEach((source) => {
        expect(source).toHaveProperty('id')
        expect(source).toHaveProperty('name')
        expect(source).toHaveProperty('category')
        expect(source).toHaveProperty('description')
        expect(source).toHaveProperty('icon')
        expect(source).toHaveProperty('fileName')
        expect(source).toHaveProperty('defaultVolume')
        expect(source).toHaveProperty('color')

        expect(typeof source.id).toBe('string')
        expect(typeof source.name).toBe('string')
        expect(typeof source.category).toBe('string')
        expect(typeof source.description).toBe('string')
        expect(typeof source.icon).toBe('string')
        expect(typeof source.fileName).toBe('string')
        expect(typeof source.defaultVolume).toBe('number')
        expect(typeof source.color).toBe('string')
      })
    })

    it('should have unique IDs for all sound sources', () => {
      const ids = SOUND_SOURCES.map((source) => source.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have valid volume ranges', () => {
      SOUND_SOURCES.forEach((source) => {
        expect(source.defaultVolume).toBeGreaterThanOrEqual(0)
        expect(source.defaultVolume).toBeLessThanOrEqual(100)
      })
    })

    it('should have valid color hex codes', () => {
      SOUND_SOURCES.forEach((source) => {
        expect(source.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })
  })

  describe('getSoundById', () => {
    it('should return correct sound for valid ID', () => {
      const rain = getSoundById('rain')
      expect(rain).toBeDefined()
      expect(rain?.id).toBe('rain')
      expect(rain?.name).toBe('雨')
    })

    it('should return undefined for invalid ID', () => {
      const result = getSoundById('nonexistent')
      expect(result).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      const result = getSoundById('')
      expect(result).toBeUndefined()
    })

    it('should handle case-sensitive IDs', () => {
      const result = getSoundById('RAIN')
      expect(result).toBeUndefined()
    })
  })

  describe('getSoundsByCategory', () => {
    it('should return nature sounds correctly', () => {
      const natureSounds = getSoundsByCategory('nature')
      expect(natureSounds).toHaveLength(7)

      const expectedNatureIds = [
        'rain',
        'waves',
        'stream',
        'birds',
        'thunder',
        'wind',
        'summer-night',
      ]
      const actualIds = natureSounds.map((sound) => sound.id)
      expectedNatureIds.forEach((id) => {
        expect(actualIds).toContain(id)
      })
    })

    it('should return indoor sounds correctly', () => {
      const indoorSounds = getSoundsByCategory('indoor')
      expect(indoorSounds).toHaveLength(1)
      expect(indoorSounds[0].id).toBe('fireplace')
    })

    it('should return urban sounds correctly', () => {
      const urbanSounds = getSoundsByCategory('urban')
      expect(urbanSounds).toHaveLength(4)

      const expectedUrbanIds = ['cafe', 'city', 'train', 'boat']
      const actualIds = urbanSounds.map((sound) => sound.id)
      expectedUrbanIds.forEach((id) => {
        expect(actualIds).toContain(id)
      })
    })

    it('should return white noise sounds correctly', () => {
      const whiteNoiseSounds = getSoundsByCategory('white-noise')
      expect(whiteNoiseSounds).toHaveLength(3)

      const expectedWhiteNoiseIds = ['white-noise', 'pink-noise', 'brown-noise']
      const actualIds = whiteNoiseSounds.map((sound) => sound.id)
      expectedWhiteNoiseIds.forEach((id) => {
        expect(actualIds).toContain(id)
      })
    })

    it('should return empty array for invalid category', () => {
      const result = getSoundsByCategory('invalid' as SoundCategory)
      expect(result).toEqual([])
    })

    it('should return empty array for empty category', () => {
      const result = getSoundsByCategory('' as SoundCategory)
      expect(result).toEqual([])
    })

    it('should return sounds with correct category property', () => {
      const categories: SoundCategory[] = [
        'nature',
        'indoor',
        'urban',
        'white-noise',
      ]

      categories.forEach((category) => {
        const sounds = getSoundsByCategory(category)
        sounds.forEach((sound) => {
          expect(sound.category).toBe(category)
        })
      })
    })

    it('should cover all sound sources across all categories', () => {
      const categories: SoundCategory[] = [
        'nature',
        'indoor',
        'urban',
        'white-noise',
      ]
      const allCategorySounds = categories.flatMap((category) =>
        getSoundsByCategory(category)
      )

      expect(allCategorySounds).toHaveLength(SOUND_SOURCES.length)

      // All original sounds should be included
      SOUND_SOURCES.forEach((originalSound) => {
        const found = allCategorySounds.find(
          (sound) => sound.id === originalSound.id
        )
        expect(found).toBeDefined()
      })
    })
  })
})

import { describe, it, expect } from 'vitest'
import type { SoundSource, SoundCategory } from './sound'

describe('sound types', () => {
  describe('SoundCategory', () => {
    it('should accept valid category values', () => {
      const validCategories: SoundCategory[] = [
        'nature',
        'indoor',
        'urban',
        'white-noise',
      ]

      validCategories.forEach((category) => {
        expect(typeof category).toBe('string')
      })
    })
  })

  describe('Icon names', () => {
    it('should accept valid icon names as strings', () => {
      const validIcons = [
        'CloudRain',
        'Waves',
        'Bird',
        'Zap',
        'Wind',
        'Moon',
        'Flame',
        'Coffee',
        'Building',
        'Train',
        'Anchor',
        'Radio',
        'Volume2',
        'Headphones',
      ]

      validIcons.forEach((icon) => {
        expect(typeof icon).toBe('string')
      })
    })
  })

  describe('SoundSource', () => {
    it('should accept valid SoundSource object', () => {
      const validSoundSource: SoundSource = {
        id: 'test-sound',
        name: 'テスト音源',
        category: 'nature',
        description: 'テスト用の説明',
        icon: 'CloudRain',
        fileName: 'test.mp3',
        defaultVolume: 50,
        color: '#3B82F6',
      }

      expect(validSoundSource.id).toBe('test-sound')
      expect(validSoundSource.name).toBe('テスト音源')
      expect(validSoundSource.category).toBe('nature')
      expect(validSoundSource.description).toBe('テスト用の説明')
      expect(validSoundSource.icon).toBe('CloudRain')
      expect(validSoundSource.fileName).toBe('test.mp3')
      expect(validSoundSource.defaultVolume).toBe(50)
      expect(validSoundSource.color).toBe('#3B82F6')
    })

    it('should have all required properties', () => {
      const soundSource: SoundSource = {
        id: 'required-test',
        name: '必須プロパティテスト',
        category: 'urban',
        description: '全プロパティが必須であることを確認',
        icon: 'Building',
        fileName: 'required.mp3',
        defaultVolume: 75,
        color: '#FF5733',
      }

      // 全プロパティが存在することを確認
      expect(soundSource).toHaveProperty('id')
      expect(soundSource).toHaveProperty('name')
      expect(soundSource).toHaveProperty('category')
      expect(soundSource).toHaveProperty('description')
      expect(soundSource).toHaveProperty('icon')
      expect(soundSource).toHaveProperty('fileName')
      expect(soundSource).toHaveProperty('defaultVolume')
      expect(soundSource).toHaveProperty('color')
    })

    it('should enforce correct property types', () => {
      const soundSource: SoundSource = {
        id: 'type-test',
        name: '型テスト',
        category: 'white-noise',
        description: '型の正確性をテスト',
        icon: 'Volume2',
        fileName: 'type-test.mp3',
        defaultVolume: 30,
        color: '#9CA3AF',
      }

      expect(typeof soundSource.id).toBe('string')
      expect(typeof soundSource.name).toBe('string')
      expect(typeof soundSource.category).toBe('string')
      expect(typeof soundSource.description).toBe('string')
      expect(typeof soundSource.icon).toBe('string')
      expect(typeof soundSource.fileName).toBe('string')
      expect(typeof soundSource.defaultVolume).toBe('number')
      expect(typeof soundSource.color).toBe('string')
    })
  })
})

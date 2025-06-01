import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { LocalStoragePresetStorage, createPresetStorage } from './PresetStorage'
import type { Preset } from '../types/sound'

// LocalStorage のモック
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// IndexedDB のモック
Object.defineProperty(globalThis, 'indexedDB', {
  value: undefined,
  writable: true,
})

const createMockPreset = (id: string, name: string): Preset => ({
  id,
  name,
  description: `Test preset: ${name}`,
  sounds: [
    { soundId: 'rain', volume: 50 },
    { soundId: 'waves', volume: 30 },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

describe('LocalStoragePresetStorage', () => {
  let storage: LocalStoragePresetStorage

  beforeEach(() => {
    storage = new LocalStoragePresetStorage()
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('savePreset', () => {
    it('should save a preset to localStorage', async () => {
      const preset = createMockPreset('test-1', 'Test Preset')

      await storage.savePreset(preset)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ambient-flow-presets',
        JSON.stringify([preset])
      )
    })

    it('should update existing preset', async () => {
      const preset1 = createMockPreset('test-1', 'Test Preset 1')
      const preset2 = createMockPreset('test-1', 'Updated Preset')

      await storage.savePreset(preset1)
      await storage.savePreset(preset2)

      const savedData = mockLocalStorage.setItem.mock.calls[1]?.[1]
      const savedPresets = savedData ? JSON.parse(savedData) : []

      expect(savedPresets).toHaveLength(1)
      expect(savedPresets[0]?.name).toBe('Updated Preset')
    })

    it('should add new preset to existing ones', async () => {
      const preset1 = createMockPreset('test-1', 'Test Preset 1')
      const preset2 = createMockPreset('test-2', 'Test Preset 2')

      await storage.savePreset(preset1)
      await storage.savePreset(preset2)

      const savedData = mockLocalStorage.setItem.mock.calls[1]?.[1]
      const savedPresets = savedData ? JSON.parse(savedData) : []

      expect(savedPresets).toHaveLength(2)
      expect(savedPresets.map((p: Preset) => p.name)).toContain('Test Preset 1')
      expect(savedPresets.map((p: Preset) => p.name)).toContain('Test Preset 2')
    })
  })

  describe('loadPresets', () => {
    it('should return empty array when no presets exist', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const presets = await storage.loadPresets()

      expect(presets).toEqual([])
    })

    it('should load presets from localStorage', async () => {
      const preset1 = createMockPreset('test-1', 'Test Preset 1')
      const preset2 = createMockPreset('test-2', 'Test Preset 2')

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify([preset1, preset2])
      )

      const presets = await storage.loadPresets()

      expect(presets).toHaveLength(2)
      expect(presets[0]?.name).toBe('Test Preset 1')
      expect(presets[1]?.name).toBe('Test Preset 2')
    })

    it('should sort presets by creation date (newest first)', async () => {
      const oldPreset = {
        ...createMockPreset('test-1', 'Old'),
        createdAt: 1000,
      }
      const newPreset = {
        ...createMockPreset('test-2', 'New'),
        createdAt: 2000,
      }

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify([oldPreset, newPreset])
      )

      const presets = await storage.loadPresets()

      expect(presets[0]?.name).toBe('New')
      expect(presets[1]?.name).toBe('Old')
    })

    it('should handle corrupted data gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const presets = await storage.loadPresets()

      expect(presets).toEqual([])
    })
  })

  describe('getPreset', () => {
    it('should return specific preset by id', async () => {
      const preset1 = createMockPreset('test-1', 'Test Preset 1')
      const preset2 = createMockPreset('test-2', 'Test Preset 2')

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify([preset1, preset2])
      )

      const result = await storage.getPreset('test-2')

      expect(result).not.toBeNull()
      expect(result?.name).toBe('Test Preset 2')
    })

    it('should return null for non-existent preset', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]))

      const result = await storage.getPreset('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('deletePreset', () => {
    it('should remove preset from localStorage', async () => {
      const preset1 = createMockPreset('test-1', 'Test Preset 1')
      const preset2 = createMockPreset('test-2', 'Test Preset 2')

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify([preset1, preset2])
      )

      await storage.deletePreset('test-1')

      const savedData = mockLocalStorage.setItem.mock.calls[0]?.[1]
      const remainingPresets = savedData ? JSON.parse(savedData) : []

      expect(remainingPresets).toHaveLength(1)
      expect(remainingPresets[0]?.id).toBe('test-2')
    })

    it('should handle deletion of non-existent preset', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]))

      await expect(storage.deletePreset('non-existent')).resolves.not.toThrow()
    })
  })

  describe('clearAll', () => {
    it('should remove all presets from localStorage', async () => {
      await storage.clearAll()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'ambient-flow-presets'
      )
    })
  })
})

describe('createPresetStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return LocalStoragePresetStorage when IndexedDB is not available', () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: undefined,
      writable: true,
    })

    const storage = createPresetStorage()

    expect(storage).toBeInstanceOf(LocalStoragePresetStorage)
  })

  it('should return IndexedDBPresetStorage when IndexedDB is available', () => {
    const mockIndexedDB = {
      open: vi.fn(),
    }

    Object.defineProperty(globalThis, 'indexedDB', {
      value: mockIndexedDB,
      writable: true,
    })

    const storage = createPresetStorage()

    // IndexedDBPresetStorageのインスタンスであることを確認
    expect(storage).not.toBeInstanceOf(LocalStoragePresetStorage)
  })
})

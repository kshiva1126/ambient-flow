import type { SoundSource, Preset } from './sound'

/**
 * 音源の再生状態を表すインターフェース
 */
export interface SoundState {
  id: string
  source: SoundSource
  isPlaying: boolean
  volume: number
  isLoaded: boolean
}

/**
 * AudioStoreの状態インターフェース
 */
export interface AudioStoreState {
  // 状態
  sounds: Record<string, SoundState>
  playingSounds: string[]
  presets: Preset[]
  currentPresetId: string | null
  isLoadingPresets: boolean

  // アクション
  loadSound: (source: SoundSource) => Promise<void>
  unloadSound: (soundId: string) => void
  play: (soundId: string) => void
  stop: (soundId: string) => void
  stopAll: () => void
  setVolume: (soundId: string, volume: number) => void
  fadeIn: (soundId: string, duration?: number) => void
  fadeOut: (soundId: string, duration?: number) => void

  // プリセット関連
  loadPresets: () => Promise<void>
  savePreset: (name: string, description?: string) => Promise<void>
  loadPreset: (presetId: string) => Promise<void>
  deletePreset: (presetId: string) => Promise<void>
  updatePreset: (
    presetId: string,
    name: string,
    description?: string
  ) => Promise<void>
  getCurrentPreset: () => Preset | null

  // セレクター（computed values）
  isPlaying: (soundId: string) => boolean
  getVolume: (soundId: string) => number
  getSoundState: (soundId: string) => SoundState | undefined
  getPlayingCount: () => number
}

/**
 * プリセット管理のためのインターフェース（将来の拡張用）
 */
export interface PresetState {
  id: string
  name: string
  sounds: Record<string, { isPlaying: boolean; volume: number }>
  createdAt: string
}

export interface PresetStoreState {
  presets: Record<string, PresetState>
  currentPreset: string | null

  savePreset: (
    name: string,
    soundStates: Record<string, { isPlaying: boolean; volume: number }>
  ) => string
  loadPreset: (presetId: string) => void
  deletePreset: (presetId: string) => void
  renamePreset: (presetId: string, newName: string) => void
}

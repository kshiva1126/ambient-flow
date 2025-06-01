import type { SoundSource } from './sound'

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

  // アクション
  loadSound: (source: SoundSource) => void
  unloadSound: (soundId: string) => void
  play: (soundId: string) => void
  stop: (soundId: string) => void
  stopAll: () => void
  setVolume: (soundId: string, volume: number) => void
  fadeIn: (soundId: string, duration?: number) => void
  fadeOut: (soundId: string, duration?: number) => void

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

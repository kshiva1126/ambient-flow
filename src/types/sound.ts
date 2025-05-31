/**
 * 環境音ソースの定義
 */

/**
 * 音源のカテゴリー
 */
export type SoundCategory = 'nature' | 'urban' | 'indoor' | 'white-noise'

/**
 * 環境音ソースのインターフェース
 */
export interface SoundSource {
  id: string
  name: string
  category: SoundCategory
  description: string
  icon: string // Lucide Reactのアイコン名
  fileName: string
  defaultVolume: number // 0-100
  color: string // アクティブ時のグローカラー
}

/**
 * 音源の再生状態
 */
export interface SoundState {
  soundId: string
  isPlaying: boolean
  volume: number // 0-100
  isMuted: boolean
}

/**
 * プリセットの定義
 */
export interface Preset {
  id: string
  name: string
  description?: string
  sounds: {
    soundId: string
    volume: number
  }[]
  createdAt: number
  updatedAt: number
}

import { Howl, Howler } from 'howler'
import type { SoundSource } from '../types/sound'

interface AudioInstance {
  howl: Howl
  source: SoundSource
  volume: number
  isPlaying: boolean
}

// モジュールスコープでの状態管理
const audioInstances = new Map<string, AudioInstance>()
const basePath = '/src/assets/sounds/'

// 初期化
Howler.autoUnlock = true
Howler.html5PoolSize = 10

/**
 * 音源を読み込む
 */
export const load = (source: SoundSource): void => {
  if (audioInstances.has(source.id)) {
    return
  }

  const howl = new Howl({
    src: [`${basePath}${source.fileName}`],
    html5: true,
    loop: true,
    volume: source.defaultVolume / 100,
    preload: true,
    onloaderror: (_id, error) => {
      console.error(`Failed to load ${source.fileName}:`, error)
    },
    onplayerror: (_id, error) => {
      console.error(`Failed to play ${source.fileName}:`, error)
    },
  })

  audioInstances.set(source.id, {
    howl,
    source,
    volume: source.defaultVolume,
    isPlaying: false,
  })
}

/**
 * 音源を再生する
 */
export const play = (soundId: string): void => {
  const instance = audioInstances.get(soundId)
  if (!instance) {
    console.warn(`Sound ${soundId} not loaded`)
    return
  }

  if (!instance.isPlaying) {
    instance.howl.play()
    instance.isPlaying = true
  }
}

/**
 * 音源を停止する
 */
export const stop = (soundId: string): void => {
  const instance = audioInstances.get(soundId)
  if (!instance) {
    return
  }

  if (instance.isPlaying) {
    instance.howl.stop()
    instance.isPlaying = false
  }
}

/**
 * 音量を設定する
 */
export const setVolume = (soundId: string, volume: number): void => {
  const instance = audioInstances.get(soundId)
  if (!instance) {
    return
  }

  const clampedVolume = Math.max(0, Math.min(100, volume))
  const normalizedVolume = clampedVolume / 100
  instance.howl.volume(normalizedVolume)
  instance.volume = clampedVolume
}

/**
 * フェードイン
 */
export const fadeIn = (soundId: string, duration: number = 1000): void => {
  const instance = audioInstances.get(soundId)
  if (!instance) {
    return
  }

  instance.howl.fade(0, instance.volume / 100, duration)
  if (!instance.isPlaying) {
    instance.howl.play()
    instance.isPlaying = true
  }
}

/**
 * フェードアウト
 */
export const fadeOut = (soundId: string, duration: number = 1000): void => {
  const instance = audioInstances.get(soundId)
  if (!instance) {
    return
  }

  instance.howl.fade(instance.volume / 100, 0, duration)
  setTimeout(() => {
    if (instance.howl.volume() === 0) {
      instance.howl.stop()
      instance.isPlaying = false
      instance.howl.volume(instance.volume / 100) // 音量を元に戻す
    }
  }, duration)
}

/**
 * すべての音源を停止する
 */
export const stopAll = (): void => {
  audioInstances.forEach((instance) => {
    if (instance.isPlaying) {
      instance.howl.stop()
      instance.isPlaying = false
    }
  })
}

/**
 * 未使用の音源をアンロードする
 */
export const unloadUnused = (): void => {
  audioInstances.forEach((instance, id) => {
    if (!instance.isPlaying) {
      instance.howl.unload()
      audioInstances.delete(id)
    }
  })
}

/**
 * 特定の音源をアンロードする
 */
export const unload = (soundId: string): void => {
  const instance = audioInstances.get(soundId)
  if (instance) {
    instance.howl.unload()
    audioInstances.delete(soundId)
  }
}

/**
 * 再生中の音源IDリストを取得
 */
export const getPlayingSounds = (): string[] => {
  return Array.from(audioInstances.entries())
    .filter(([, instance]) => instance.isPlaying)
    .map(([id]) => id)
}

/**
 * 音源の再生状態を取得
 */
export const isPlaying = (soundId: string): boolean => {
  const instance = audioInstances.get(soundId)
  return instance?.isPlaying ?? false
}

/**
 * 音源の音量を取得
 */
export const getVolume = (soundId: string): number => {
  const instance = audioInstances.get(soundId)
  return instance?.volume ?? 0
}

/**
 * テスト用：すべての音源をクリアする
 */
export const clearAll = (): void => {
  audioInstances.forEach((instance) => {
    instance.howl.unload()
  })
  audioInstances.clear()
}

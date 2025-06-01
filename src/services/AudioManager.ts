import { Howl, Howler } from 'howler'
import type { SoundSource } from '../types/sound'
import { getSoundById } from '../data/sounds'
import { audioCacheManager } from './AudioCacheManager'

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
 * 音源を読み込む（キャッシュ対応）
 */
export const load = async (source: SoundSource): Promise<void> => {
  if (audioInstances.has(source.id)) {
    return
  }

  const audioUrl = `${basePath}${source.fileName}`

  // キャッシュからの読み込みを試行
  const cachedResponse = await audioCacheManager.getCachedAudioFile(
    source.id,
    audioUrl
  )
  let audioSrc = audioUrl

  if (cachedResponse) {
    // キャッシュされたファイルをBlob URLとして使用
    const blob = await cachedResponse.blob()
    audioSrc = URL.createObjectURL(blob)
    console.log(`Using cached audio for ${source.id}`)
  } else {
    // キャッシュにない場合は通常のURLを使用し、バックグラウンドでキャッシュ
    audioCacheManager.cacheAudioFile(source.id, audioUrl).catch((error) => {
      console.warn(`Failed to cache audio file ${source.id}:`, error)
    })
  }

  const howl = new Howl({
    src: [audioSrc],
    html5: true,
    loop: true,
    volume: source.defaultVolume / 100,
    preload: true,
    onloaderror: (_id, error) => {
      console.error(`Failed to load ${source.fileName}:`, error)
      // キャッシュされたBlob URLの場合、元のURLで再試行
      if (audioSrc !== audioUrl) {
        console.log(`Retrying with original URL for ${source.id}`)
        const retryHowl = new Howl({
          src: [audioUrl],
          html5: true,
          loop: true,
          volume: source.defaultVolume / 100,
          preload: true,
        })
        audioInstances.set(source.id, {
          howl: retryHowl,
          source,
          volume: source.defaultVolume,
          isPlaying: false,
        })
      }
    },
    onplayerror: (_id, error) => {
      console.error(`Failed to play ${source.fileName}:`, error)
    },
    onload: () => {
      console.log(`Successfully loaded ${source.fileName}`)
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
  if (instance) {
    return instance.volume
  }

  // 音源がロードされていない場合はデフォルト値を返す
  const soundSource = getSoundById(soundId)
  return soundSource?.defaultVolume ?? 0
}

/**
 * 高優先度音源のプリロード
 */
export const preloadHighPriorityAudio = async (): Promise<void> => {
  console.log('Starting high priority audio preload...')
  await audioCacheManager.preloadHighPriorityAudio()
}

/**
 * オンデマンドで音源を読み込み（必要時のみ）
 */
export const loadOnDemand = async (soundId: string): Promise<boolean> => {
  const source = getSoundById(soundId)
  if (!source) {
    console.warn(`Sound source not found: ${soundId}`)
    return false
  }

  try {
    await load(source)
    return true
  } catch (error) {
    console.error(`Failed to load sound on demand: ${soundId}`, error)
    return false
  }
}

/**
 * キャッシュ統計を取得
 */
export const getCacheStats = () => {
  return audioCacheManager.getCacheStats()
}

/**
 * オフライン状態をチェック
 */
export const isOffline = (): boolean => {
  return audioCacheManager.isOffline()
}

/**
 * キャッシュされた音源の一覧を取得
 */
export const getCachedSounds = async (): Promise<string[]> => {
  return await audioCacheManager.getCachedFilesList()
}

/**
 * 未使用音源の自動アンロード（改良版）
 */
export const smartUnloadUnused = (): void => {
  const playingIds = getPlayingSounds()

  audioInstances.forEach((instance, id) => {
    if (!playingIds.includes(id)) {
      const priority = audioCacheManager.getPriority(id)

      // 低優先度の音源のみアンロード（高・中優先度は保持）
      if (priority === 'low') {
        instance.howl.unload()
        audioInstances.delete(id)
        console.log(`Unloaded low priority unused audio: ${id}`)
      }
    }
  })
}

/**
 * メモリ使用量を監視
 */
export const getMemoryUsage = (): {
  audioInstances: number
  estimatedMemory: string
  cachedFiles: number
} => {
  const stats = audioCacheManager.getCacheStats()
  const estimatedMemoryMB = (stats.totalSize / (1024 * 1024)).toFixed(2)

  return {
    audioInstances: audioInstances.size,
    estimatedMemory: `${estimatedMemoryMB}MB`,
    cachedFiles: stats.cachedFiles,
  }
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

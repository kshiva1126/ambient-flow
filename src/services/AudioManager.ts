import { Howl, Howler } from 'howler'
import type { SoundSource } from '../types/sound'

interface AudioInstance {
  howl: Howl
  source: SoundSource
  volume: number
  isPlaying: boolean
}

export class AudioManager {
  private static instance: AudioManager
  private audioInstances: Map<string, AudioInstance> = new Map()
  private basePath = '/src/assets/sounds/'

  private constructor() {
    // シングルトン
    Howler.autoUnlock = true
    Howler.html5PoolSize = 10
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  /**
   * 音源を読み込む
   */
  public load(source: SoundSource): void {
    if (this.audioInstances.has(source.id)) {
      return
    }

    const howl = new Howl({
      src: [`${this.basePath}${source.fileName}`],
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

    this.audioInstances.set(source.id, {
      howl,
      source,
      volume: source.defaultVolume,
      isPlaying: false,
    })
  }

  /**
   * 音源を再生する
   */
  public play(soundId: string): void {
    const instance = this.audioInstances.get(soundId)
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
  public stop(soundId: string): void {
    const instance = this.audioInstances.get(soundId)
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
  public setVolume(soundId: string, volume: number): void {
    const instance = this.audioInstances.get(soundId)
    if (!instance) {
      return
    }

    const normalizedVolume = Math.max(0, Math.min(100, volume)) / 100
    instance.howl.volume(normalizedVolume)
    instance.volume = volume
  }

  /**
   * フェードイン
   */
  public fadeIn(soundId: string, duration: number = 1000): void {
    const instance = this.audioInstances.get(soundId)
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
  public fadeOut(soundId: string, duration: number = 1000): void {
    const instance = this.audioInstances.get(soundId)
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
  public stopAll(): void {
    this.audioInstances.forEach((instance) => {
      if (instance.isPlaying) {
        instance.howl.stop()
        instance.isPlaying = false
      }
    })
  }

  /**
   * 未使用の音源をアンロードする
   */
  public unloadUnused(): void {
    this.audioInstances.forEach((instance, id) => {
      if (!instance.isPlaying) {
        instance.howl.unload()
        this.audioInstances.delete(id)
      }
    })
  }

  /**
   * 特定の音源をアンロードする
   */
  public unload(soundId: string): void {
    const instance = this.audioInstances.get(soundId)
    if (instance) {
      instance.howl.unload()
      this.audioInstances.delete(soundId)
    }
  }

  /**
   * 再生中の音源IDリストを取得
   */
  public getPlayingSounds(): string[] {
    return Array.from(this.audioInstances.entries())
      .filter(([, instance]) => instance.isPlaying)
      .map(([id]) => id)
  }

  /**
   * 音源の再生状態を取得
   */
  public isPlaying(soundId: string): boolean {
    const instance = this.audioInstances.get(soundId)
    return instance?.isPlaying ?? false
  }

  /**
   * 音源の音量を取得
   */
  public getVolume(soundId: string): number {
    const instance = this.audioInstances.get(soundId)
    return instance?.volume ?? 0
  }
}

export const audioManager = AudioManager.getInstance()

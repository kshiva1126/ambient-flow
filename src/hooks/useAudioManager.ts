import { useCallback, useEffect, useState } from 'react'
import * as audioManager from '../services/AudioManager'
import type { SoundSource } from '../types/sound'

interface UseAudioManagerReturn {
  playingSounds: string[]
  play: (soundId: string) => Promise<void>
  stop: (soundId: string) => void
  setVolume: (soundId: string, volume: number) => void
  fadeIn: (soundId: string, duration?: number) => void
  fadeOut: (soundId: string, duration?: number) => void
  stopAll: () => void
  isPlaying: (soundId: string) => boolean
  getVolume: (soundId: string) => number
  loadSound: (source: SoundSource) => Promise<void>
  unloadSound: (soundId: string) => void
  isOffline: boolean
  memoryUsage: {
    audioInstances: number
    estimatedMemory: string
    cachedFiles: number
  }
  cacheStats: {
    totalSize: number
    cachedFiles: number
    hitRate: number
    totalRequests: number
    cacheHits: number
  }
}

export const useAudioManager = (): UseAudioManagerReturn => {
  const [playingSounds, setPlayingSounds] = useState<string[]>([])
  const [volumeUpdateCount, setVolumeUpdateCount] = useState(0)
  const [isOffline, setIsOffline] = useState(false)
  const [memoryUsage, setMemoryUsage] = useState({
    audioInstances: 0,
    estimatedMemory: '0MB',
    cachedFiles: 0,
  })
  const [cacheStats, setCacheStats] = useState({
    totalSize: 0,
    cachedFiles: 0,
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
  })

  // 再生中の音源リストを更新
  const updatePlayingSounds = useCallback(() => {
    setPlayingSounds(audioManager.getPlayingSounds())
  }, [])

  // 音量更新をトリガー
  const updateVolume = useCallback(() => {
    setVolumeUpdateCount((prev) => prev + 1)
  }, [])

  // 統計情報を更新
  const updateStats = useCallback(() => {
    setIsOffline(audioManager.isOffline())
    setMemoryUsage(audioManager.getMemoryUsage())
    setCacheStats(audioManager.getCacheStats())
  }, [])

  const play = useCallback(
    async (soundId: string) => {
      // オンデマンドローディングを試行
      const loaded = await audioManager.loadOnDemand(soundId)
      if (loaded) {
        audioManager.play(soundId)
        updatePlayingSounds()
        updateStats()
      }
    },
    [updatePlayingSounds, updateStats]
  )

  const stop = useCallback(
    (soundId: string) => {
      audioManager.stop(soundId)
      updatePlayingSounds()
    },
    [updatePlayingSounds]
  )

  const setVolume = useCallback(
    (soundId: string, volume: number) => {
      audioManager.setVolume(soundId, volume)
      // 音量変更時に再レンダリングをトリガー
      updateVolume()
    },
    [updateVolume]
  )

  const fadeIn = useCallback(
    (soundId: string, duration?: number) => {
      audioManager.fadeIn(soundId, duration)
      updatePlayingSounds()
    },
    [updatePlayingSounds]
  )

  const fadeOut = useCallback(
    (soundId: string, duration?: number) => {
      audioManager.fadeOut(soundId, duration)
      setTimeout(() => {
        updatePlayingSounds()
      }, duration || 1000)
    },
    [updatePlayingSounds]
  )

  const stopAll = useCallback(() => {
    audioManager.stopAll()
    updatePlayingSounds()
  }, [updatePlayingSounds])

  const isPlaying = useCallback((soundId: string) => {
    return audioManager.isPlaying(soundId)
  }, [])

  const getVolume = useCallback(
    (soundId: string) => {
      return audioManager.getVolume(soundId)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [volumeUpdateCount]
  )

  const loadSound = useCallback(
    async (source: SoundSource) => {
      await audioManager.load(source)
      // ロード時に音量状態も更新
      updateVolume()
      updateStats()
    },
    [updateVolume, updateStats]
  )

  const unloadSound = useCallback(
    (soundId: string) => {
      audioManager.unload(soundId)
      updatePlayingSounds()
    },
    [updatePlayingSounds]
  )

  // 初期化時に高優先度音源をプリロード
  useEffect(() => {
    audioManager.preloadHighPriorityAudio()
    updateStats()
  }, [updateStats])

  // オンライン/オフライン状態の監視
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      updateStats()
    }

    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
    }
  }, [updateStats])

  // コンポーネントのアンマウント時にメモリクリーンアップ
  useEffect(() => {
    return () => {
      audioManager.smartUnloadUnused()
    }
  }, [])

  return {
    playingSounds,
    play,
    stop,
    setVolume,
    fadeIn,
    fadeOut,
    stopAll,
    isPlaying,
    getVolume,
    loadSound,
    unloadSound,
    isOffline,
    memoryUsage,
    cacheStats,
  }
}

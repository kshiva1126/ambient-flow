import { useCallback, useEffect, useState } from 'react'
import { audioManager } from '../services/AudioManager'
import type { SoundSource } from '../types/sound'

interface UseAudioManagerReturn {
  playingSounds: string[]
  play: (soundId: string) => void
  stop: (soundId: string) => void
  setVolume: (soundId: string, volume: number) => void
  fadeIn: (soundId: string, duration?: number) => void
  fadeOut: (soundId: string, duration?: number) => void
  stopAll: () => void
  isPlaying: (soundId: string) => boolean
  getVolume: (soundId: string) => number
  loadSound: (source: SoundSource) => void
  unloadSound: (soundId: string) => void
}

export const useAudioManager = (): UseAudioManagerReturn => {
  const [playingSounds, setPlayingSounds] = useState<string[]>([])

  // 再生中の音源リストを更新
  const updatePlayingSounds = useCallback(() => {
    setPlayingSounds(audioManager.getPlayingSounds())
  }, [])

  const play = useCallback(
    (soundId: string) => {
      audioManager.play(soundId)
      updatePlayingSounds()
    },
    [updatePlayingSounds]
  )

  const stop = useCallback(
    (soundId: string) => {
      audioManager.stop(soundId)
      updatePlayingSounds()
    },
    [updatePlayingSounds]
  )

  const setVolume = useCallback((soundId: string, volume: number) => {
    audioManager.setVolume(soundId, volume)
  }, [])

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

  const getVolume = useCallback((soundId: string) => {
    return audioManager.getVolume(soundId)
  }, [])

  const loadSound = useCallback((source: SoundSource) => {
    audioManager.load(source)
  }, [])

  const unloadSound = useCallback(
    (soundId: string) => {
      audioManager.unload(soundId)
      updatePlayingSounds()
    },
    [updatePlayingSounds]
  )

  // コンポーネントのアンマウント時にメモリクリーンアップ
  useEffect(() => {
    return () => {
      audioManager.unloadUnused()
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
  }
}

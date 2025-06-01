import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import * as audioManager from '../services/AudioManager'
import type { AudioStoreState } from '../types/store'
import type { SoundSource } from '../types/sound'

/**
 * AudioStore - Zustandを使用した音声状態管理
 *
 * AudioManagerサービス層と連携しながら、
 * アプリケーション全体の音声状態を一元管理
 */
export const useAudioStore = create<AudioStoreState>()(
  devtools(
    (set, get) => ({
      // 初期状態
      sounds: {},
      playingSounds: [],

      // 音源を読み込む
      loadSound: (source: SoundSource) => {
        const { sounds } = get()

        // 既に読み込み済みの場合はスキップ
        if (sounds[source.id]?.isLoaded) {
          return
        }

        // AudioManagerで音源を読み込み
        audioManager.load(source)

        // Zustandストアの状態を更新
        set(
          (state) => ({
            sounds: {
              ...state.sounds,
              [source.id]: {
                id: source.id,
                source,
                isPlaying: false,
                volume: source.defaultVolume,
                isLoaded: true,
              },
            },
          }),
          false,
          'loadSound'
        )
      },

      // 音源をアンロード
      unloadSound: (soundId: string) => {
        audioManager.unload(soundId)

        set(
          (state) => {
            const newSounds = { ...state.sounds }
            delete newSounds[soundId]

            return {
              sounds: newSounds,
              playingSounds: state.playingSounds.filter((id) => id !== soundId),
            }
          },
          false,
          'unloadSound'
        )
      },

      // 音源を再生
      play: (soundId: string) => {
        const { sounds } = get()
        const sound = sounds[soundId]

        if (!sound?.isLoaded || sound.isPlaying) {
          return
        }

        audioManager.play(soundId)

        set(
          (state) => {
            const currentSound = state.sounds[soundId]
            if (!currentSound) return state

            return {
              ...state,
              sounds: {
                ...state.sounds,
                [soundId]: {
                  ...currentSound,
                  isPlaying: true,
                },
              },
              playingSounds: [...state.playingSounds, soundId],
            }
          },
          false,
          'play'
        )
      },

      // 音源を停止
      stop: (soundId: string) => {
        const { sounds } = get()
        const sound = sounds[soundId]

        if (!sound?.isPlaying) {
          return
        }

        audioManager.stop(soundId)

        set(
          (state) => {
            const currentSound = state.sounds[soundId]
            if (!currentSound) return state

            return {
              ...state,
              sounds: {
                ...state.sounds,
                [soundId]: {
                  ...currentSound,
                  isPlaying: false,
                },
              },
              playingSounds: state.playingSounds.filter((id) => id !== soundId),
            }
          },
          false,
          'stop'
        )
      },

      // 全ての音源を停止
      stopAll: () => {
        audioManager.stopAll()

        set(
          (state) => {
            const newSounds = { ...state.sounds }
            Object.keys(newSounds).forEach((soundId) => {
              const currentSound = newSounds[soundId]
              if (currentSound) {
                newSounds[soundId] = {
                  ...currentSound,
                  isPlaying: false,
                }
              }
            })

            return {
              ...state,
              sounds: newSounds,
              playingSounds: [],
            }
          },
          false,
          'stopAll'
        )
      },

      // 音量を設定
      setVolume: (soundId: string, volume: number) => {
        const { sounds } = get()
        const sound = sounds[soundId]

        if (!sound?.isLoaded) {
          return
        }

        const clampedVolume = Math.max(0, Math.min(100, volume))
        audioManager.setVolume(soundId, clampedVolume)

        set(
          (state) => {
            const currentSound = state.sounds[soundId]
            if (!currentSound) return state

            return {
              ...state,
              sounds: {
                ...state.sounds,
                [soundId]: {
                  ...currentSound,
                  volume: clampedVolume,
                },
              },
            }
          },
          false,
          'setVolume'
        )
      },

      // フェードイン
      fadeIn: (soundId: string, duration = 1000) => {
        const { sounds } = get()
        const sound = sounds[soundId]

        if (!sound?.isLoaded) {
          return
        }

        audioManager.fadeIn(soundId, duration)

        // フェードイン開始時に再生状態を更新
        set(
          (state) => {
            const currentSound = state.sounds[soundId]
            if (!currentSound) return state

            return {
              ...state,
              sounds: {
                ...state.sounds,
                [soundId]: {
                  ...currentSound,
                  isPlaying: true,
                },
              },
              playingSounds: state.playingSounds.includes(soundId)
                ? state.playingSounds
                : [...state.playingSounds, soundId],
            }
          },
          false,
          'fadeIn'
        )
      },

      // フェードアウト
      fadeOut: (soundId: string, duration = 1000) => {
        const { sounds } = get()
        const sound = sounds[soundId]

        if (!sound?.isPlaying) {
          return
        }

        audioManager.fadeOut(soundId, duration)

        // フェードアウト完了後に状態を更新
        setTimeout(() => {
          set(
            (state) => {
              const currentSound = state.sounds[soundId]
              if (!currentSound) return state

              return {
                ...state,
                sounds: {
                  ...state.sounds,
                  [soundId]: {
                    ...currentSound,
                    isPlaying: false,
                  },
                },
                playingSounds: state.playingSounds.filter(
                  (id) => id !== soundId
                ),
              }
            },
            false,
            'fadeOut-complete'
          )
        }, duration)
      },

      // セレクター関数
      isPlaying: (soundId: string) => {
        const { sounds } = get()
        return sounds[soundId]?.isPlaying ?? false
      },

      getVolume: (soundId: string) => {
        const { sounds } = get()
        return sounds[soundId]?.volume ?? 0
      },

      getSoundState: (soundId: string) => {
        const { sounds } = get()
        return sounds[soundId]
      },

      getPlayingCount: () => {
        const { playingSounds } = get()
        return playingSounds.length
      },
    }),
    {
      name: 'audio-store', // Redux DevTools用の名前
    }
  )
)

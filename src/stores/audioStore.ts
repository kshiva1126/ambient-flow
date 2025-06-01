import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import * as audioManager from '../services/AudioManager'
import { presetStorage } from '../services/PresetStorage'
import { backgroundSync } from '../services/BackgroundSync'
import { trackFeatureUsage, trackPerformance } from '../utils/pwaMetrics'
import type { AudioStoreState } from '../types/store'
import type { SoundSource, Preset } from '../types/sound'

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
      presets: [],
      currentPresetId: null,
      isLoadingPresets: false,

      // 音源を読み込む
      loadSound: async (source: SoundSource) => {
        const { sounds } = get()

        // 既に読み込み済みの場合はスキップ
        if (sounds[source.id]?.isLoaded) {
          return
        }

        try {
          const loadStartTime = performance.now()

          // AudioManagerで音源を読み込み
          await audioManager.load(source)

          const loadTime = performance.now() - loadStartTime
          trackPerformance('sound_load_time', loadTime, { soundId: source.id })

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
        } catch (error) {
          console.error(`Failed to load sound ${source.id}:`, error)
        }
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

        // 機能使用を記録
        trackFeatureUsage('sound_play', { soundId })

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

      // プリセット機能
      loadPresets: async () => {
        set({ isLoadingPresets: true }, false, 'loadPresets-start')

        try {
          const presets = await presetStorage.loadPresets()
          set(
            { presets, isLoadingPresets: false },
            false,
            'loadPresets-success'
          )
        } catch (error) {
          console.error('Failed to load presets:', error)
          set({ isLoadingPresets: false }, false, 'loadPresets-error')
        }
      },

      savePreset: async (name: string, description?: string) => {
        const { sounds } = get()

        // 現在の音源状態からプリセットデータを作成
        const soundsData = Object.values(sounds)
          .filter(
            (sound) =>
              sound.isPlaying || sound.volume !== sound.source.defaultVolume
          )
          .map((sound) => ({
            soundId: sound.id,
            volume: sound.volume,
          }))

        if (soundsData.length === 0) {
          throw new Error('No sounds are playing or have custom volumes')
        }

        const preset: Preset = {
          id: crypto.randomUUID(),
          name,
          description,
          sounds: soundsData,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        try {
          await presetStorage.savePreset(preset)

          // オフライン時のためにBackground Syncに追加
          if (!navigator.onLine) {
            await backgroundSync.addSyncTask('save-preset', preset)
          }

          // 機能使用を記録
          trackFeatureUsage('preset_save', {
            presetId: preset.id,
            soundCount: preset.sounds.length,
            isOffline: !navigator.onLine,
          })

          // ストア状態を更新
          set(
            (state) => ({
              presets: [preset, ...state.presets],
              currentPresetId: preset.id,
            }),
            false,
            'savePreset'
          )
        } catch (error) {
          console.error('Failed to save preset:', error)
          throw error
        }
      },

      loadPreset: async (presetId: string) => {
        const { presets } = get()
        const preset = presets.find((p) => p.id === presetId)

        if (!preset) {
          throw new Error(`Preset not found: ${presetId}`)
        }

        try {
          const loadStartTime = performance.now()

          // すべての音源を停止
          audioManager.stopAll()

          // プリセットの音源を適用
          for (const soundData of preset.sounds) {
            const soundSource = get().sounds[soundData.soundId]?.source
            if (soundSource) {
              // 音源が読み込まれていない場合は読み込む
              if (!get().sounds[soundData.soundId]?.isLoaded) {
                await audioManager.load(soundSource)
              }

              // 音量を設定
              audioManager.setVolume(soundData.soundId, soundData.volume)

              // 音源を再生
              audioManager.play(soundData.soundId)
            }
          }

          const loadTime = performance.now() - loadStartTime

          // 機能使用を記録
          trackFeatureUsage('preset_load', {
            presetId,
            soundCount: preset.sounds.length,
          })
          trackPerformance('preset_load_time', loadTime, { presetId })

          // ストア状態を更新
          set(
            (state) => {
              const newSounds = { ...state.sounds }
              const newPlayingSounds: string[] = []

              // すべての音源を停止状態に
              Object.keys(newSounds).forEach((soundId) => {
                if (newSounds[soundId]) {
                  newSounds[soundId] = {
                    ...newSounds[soundId],
                    isPlaying: false,
                    volume: newSounds[soundId].source.defaultVolume,
                  }
                }
              })

              // プリセットの音源を適用
              preset.sounds.forEach((soundData) => {
                const existingSound = newSounds[soundData.soundId]
                if (existingSound) {
                  newSounds[soundData.soundId] = {
                    ...existingSound,
                    isPlaying: true,
                    volume: soundData.volume,
                  }
                  newPlayingSounds.push(soundData.soundId)
                }
              })

              return {
                ...state,
                sounds: newSounds,
                playingSounds: newPlayingSounds,
                currentPresetId: presetId,
              }
            },
            false,
            'loadPreset'
          )
        } catch (error) {
          console.error('Failed to load preset:', error)
          throw error
        }
      },

      deletePreset: async (presetId: string) => {
        try {
          await presetStorage.deletePreset(presetId)

          // オフライン時のためにBackground Syncに追加
          if (!navigator.onLine) {
            await backgroundSync.addSyncTask('delete-preset', presetId)
          }

          set(
            (state) => ({
              presets: state.presets.filter((p) => p.id !== presetId),
              currentPresetId:
                state.currentPresetId === presetId
                  ? null
                  : state.currentPresetId,
            }),
            false,
            'deletePreset'
          )
        } catch (error) {
          console.error('Failed to delete preset:', error)
          throw error
        }
      },

      updatePreset: async (
        presetId: string,
        name: string,
        description?: string
      ) => {
        const { presets } = get()
        const existingPreset = presets.find((p) => p.id === presetId)

        if (!existingPreset) {
          throw new Error(`Preset not found: ${presetId}`)
        }

        const updatedPreset: Preset = {
          ...existingPreset,
          name,
          description,
          updatedAt: Date.now(),
        }

        try {
          await presetStorage.savePreset(updatedPreset)

          // オフライン時のためにBackground Syncに追加
          if (!navigator.onLine) {
            await backgroundSync.addSyncTask('update-preset', {
              id: presetId,
              preset: updatedPreset,
            })
          }

          set(
            (state) => ({
              presets: state.presets.map((p) =>
                p.id === presetId ? updatedPreset : p
              ),
            }),
            false,
            'updatePreset'
          )
        } catch (error) {
          console.error('Failed to update preset:', error)
          throw error
        }
      },

      getCurrentPreset: () => {
        const { presets, currentPresetId } = get()
        return currentPresetId
          ? presets.find((p) => p.id === currentPresetId) || null
          : null
      },
    }),
    {
      name: 'audio-store', // Redux DevTools用の名前
    }
  )
)

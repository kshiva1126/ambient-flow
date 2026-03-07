import { useEffect } from 'react'
import * as audioManager from '../services/AudioManager'

/**
 * ページがフォアグラウンドに復帰した際に、停止した音源を自動再開するhook
 *
 * モバイルブラウザやPWAではバックグラウンド時にOSが音声リソースを解放することがあり、
 * フォアグラウンド復帰時に再生が止まったままになる問題を防ぐ。
 */
export const useVisibilityResume = (): void => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        audioManager.resumeAllPlaying()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}

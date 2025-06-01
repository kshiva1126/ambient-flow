import { useState, useEffect } from 'react'

/**
 * アプリ更新状態管理フック
 */
export const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    const setupUpdateDetection = async () => {
      if (!('serviceWorker' in navigator)) {
        return
      }

      try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) {
          setRegistration(reg)

          if (reg.waiting) {
            setUpdateAvailable(true)
          }

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setUpdateAvailable(true)
                }
              })
            }
          })
        }
      } catch (error) {
        console.error('Update detection setup failed:', error)
      }
    }

    setupUpdateDetection()
  }, [])

  const triggerUpdate = async () => {
    if (!registration?.waiting) {
      return false
    }

    setIsUpdating(true)

    try {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })

      await new Promise<void>((resolve) => {
        const handleControllerChange = () => {
          navigator.serviceWorker.removeEventListener(
            'controllerchange',
            handleControllerChange
          )
          resolve()
        }
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          handleControllerChange
        )
      })

      window.location.reload()
      return true
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
      return false
    }
  }

  const checkForUpdate = async () => {
    if (registration) {
      try {
        await registration.update()
      } catch (error) {
        console.error('Manual update check failed:', error)
      }
    }
  }

  return {
    updateAvailable,
    isUpdating,
    triggerUpdate,
    checkForUpdate,
    dismissUpdate: () => setUpdateAvailable(false),
  }
}

// Service Worker for AmbientFlow PWA - Audio Caching & Offline Support

const CACHE_NAME = 'ambient-flow-audio-cache'
const STATIC_CACHE_NAME = 'ambient-flow-static-v1'
const AUDIO_FILES_CACHE_NAME = 'ambient-flow-audio-files-v1'

// 静的リソース（高速キャッシュ）
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
]

// 高優先度音声ファイル（プリキャッシュ対象）
const HIGH_PRIORITY_AUDIO = [
  '/src/assets/sounds/rain.mp3',
  '/src/assets/sounds/waves.mp3',
  '/src/assets/sounds/white-noise.mp3',
  '/src/assets/sounds/fireplace.mp3',
]

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')

  event.waitUntil(
    Promise.all([
      // 静的リソースをキャッシュ
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),

      // 高優先度音声ファイルをプリキャッシュ
      caches.open(AUDIO_FILES_CACHE_NAME).then((cache) => {
        console.log('Pre-caching high priority audio files')
        return cache.addAll(HIGH_PRIORITY_AUDIO).catch((error) => {
          console.warn('Some audio files failed to pre-cache:', error)
          // 個別にキャッシュを試行
          return Promise.allSettled(
            HIGH_PRIORITY_AUDIO.map((url) => cache.add(url))
          )
        })
      }),
    ]).then(() => {
      console.log('Service Worker installation completed')
      // 新しいService Workerを即座にアクティブ化
      return self.skipWaiting()
    })
  )
})

// アクティベート時の処理（古いキャッシュをクリーンアップ）
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')

  event.waitUntil(
    Promise.all([
      // 古いキャッシュを削除
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== AUDIO_FILES_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),

      // 新しいService Workerがすべてのクライアントを制御
      self.clients.claim(),
    ]).then(() => {
      console.log('Service Worker activation completed')
    })
  )
})

// フェッチイベントの処理（ネットワークリクエストの横取り）
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // 音声ファイルの場合の特別な処理
  if (
    url.pathname.includes('/src/assets/sounds/') &&
    url.pathname.endsWith('.mp3')
  ) {
    event.respondWith(handleAudioRequest(event.request))
    return
  }

  // 静的リソースの処理
  if (
    STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(handleStaticRequest(event.request))
    return
  }

  // その他のリクエストはネットワークファーストで処理
  event.respondWith(handleNetworkFirst(event.request))
})

/**
 * 音声ファイルリクエストの処理（Cache First戦略）
 */
async function handleAudioRequest(request) {
  try {
    // まずキャッシュから確認
    const audioCache = await caches.open(AUDIO_FILES_CACHE_NAME)
    const cachedResponse = await audioCache.match(request)

    if (cachedResponse) {
      console.log('Serving audio from cache:', request.url)
      return cachedResponse
    }

    // キャッシュにない場合はネットワークから取得
    console.log('Fetching audio from network:', request.url)
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // 成功したレスポンスをキャッシュに保存
      const responseClone = networkResponse.clone()
      await audioCache.put(request, responseClone)
      console.log('Cached new audio file:', request.url)
    }

    return networkResponse
  } catch (error) {
    console.error('Audio request failed:', error)

    // オフライン時のフォールバック
    if (!navigator.onLine) {
      // 音声ファイルの代替として無音ファイルを返すか、
      // エラーページを返すことができます
      return new Response('Audio unavailable offline', {
        status: 503,
        statusText: 'Service Unavailable',
      })
    }

    throw error
  }
}

/**
 * 静的リソースリクエストの処理（Cache First戦略）
 */
async function handleStaticRequest(request) {
  try {
    const staticCache = await caches.open(STATIC_CACHE_NAME)
    const cachedResponse = await staticCache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone()
      await staticCache.put(request, responseClone)
    }

    return networkResponse
  } catch (error) {
    console.error('Static request failed:', error)
    throw error
  }
}

/**
 * その他のリクエストの処理（Network First戦略）
 */
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    // ネットワークエラーの場合はキャッシュから返す
    const cache = await caches.open(STATIC_CACHE_NAME)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    throw error
  }
}

// メッセージイベントの処理（クライアントとの通信）
self.addEventListener('message', (event) => {
  const { type, data } = event.data

  switch (type) {
    case 'CACHE_AUDIO_FILE':
      handleCacheAudioFileMessage(event, data)
      break

    case 'GET_CACHE_STATS':
      handleGetCacheStatsMessage(event)
      break

    case 'CLEAR_CACHE':
      handleClearCacheMessage(event, data)
      break

    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    default:
      console.warn('Unknown message type:', type)
  }
})

/**
 * 音声ファイルキャッシュのメッセージ処理
 */
async function handleCacheAudioFileMessage(event, data) {
  try {
    const { url } = data
    const cache = await caches.open(AUDIO_FILES_CACHE_NAME)

    const response = await fetch(url)
    if (response.ok) {
      await cache.put(url, response)
      event.ports[0].postMessage({ success: true, url })
    } else {
      event.ports[0].postMessage({
        success: false,
        url,
        error: 'Network error',
      })
    }
  } catch (error) {
    event.ports[0].postMessage({
      success: false,
      url: data.url,
      error: error.message,
    })
  }
}

/**
 * キャッシュ統計取得のメッセージ処理
 */
async function handleGetCacheStatsMessage(event) {
  try {
    const audioCache = await caches.open(AUDIO_FILES_CACHE_NAME)
    const staticCache = await caches.open(STATIC_CACHE_NAME)

    const audioKeys = await audioCache.keys()
    const staticKeys = await staticCache.keys()

    const stats = {
      audioCacheSize: audioKeys.length,
      staticCacheSize: staticKeys.length,
      totalCacheEntries: audioKeys.length + staticKeys.length,
      cacheNames: [AUDIO_FILES_CACHE_NAME, STATIC_CACHE_NAME, CACHE_NAME],
    }

    event.ports[0].postMessage({ success: true, stats })
  } catch (error) {
    event.ports[0].postMessage({ success: false, error: error.message })
  }
}

/**
 * キャッシュクリアのメッセージ処理
 */
async function handleClearCacheMessage(event, data) {
  try {
    const { cacheType = 'all' } = data

    if (cacheType === 'all' || cacheType === 'audio') {
      await caches.delete(AUDIO_FILES_CACHE_NAME)
    }

    if (cacheType === 'all' || cacheType === 'static') {
      await caches.delete(STATIC_CACHE_NAME)
    }

    event.ports[0].postMessage({ success: true, clearedType: cacheType })
  } catch (error) {
    event.ports[0].postMessage({ success: false, error: error.message })
  }
}

// パフォーマンス向上のためのプリキャッシュスケジューリング
self.addEventListener('idle', () => {
  // アイドル時に追加の音声ファイルをキャッシュ
  const mediumPriorityAudio = [
    '/src/assets/sounds/stream.mp3',
    '/src/assets/sounds/birds.mp3',
    '/src/assets/sounds/cafe.mp3',
    '/src/assets/sounds/pink-noise.mp3',
  ]

  caches.open(AUDIO_FILES_CACHE_NAME).then((cache) => {
    mediumPriorityAudio.forEach((url) => {
      cache.match(url).then((cached) => {
        if (!cached) {
          cache.add(url).catch((error) => {
            console.log('Background caching failed for:', url, error)
          })
        }
      })
    })
  })
})

console.log('Service Worker script loaded')

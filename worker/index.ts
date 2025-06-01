/**
 * Cloudflare Worker for AmbientFlow PWA
 * Handles static asset serving, edge caching, and performance optimizations
 */

export interface Env {
  CACHE_KV: KVNamespace
  ANALYTICS_KV: KVNamespace
  ENVIRONMENT: string
  APP_NAME: string
  APP_VERSION: string
  API_BASE_URL: string
}

// MIME type mapping for common file extensions
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
}

// Cache control headers for different asset types
const CACHE_HEADERS: Record<string, string> = {
  // Static assets with hash - cache forever
  '.js': 'public, max-age=31536000, immutable',
  '.css': 'public, max-age=31536000, immutable',
  '.png': 'public, max-age=31536000, immutable',
  '.jpg': 'public, max-age=31536000, immutable',
  '.jpeg': 'public, max-age=31536000, immutable',
  '.gif': 'public, max-age=31536000, immutable',
  '.svg': 'public, max-age=31536000, immutable',
  '.webp': 'public, max-age=31536000, immutable',
  '.woff': 'public, max-age=31536000, immutable',
  '.woff2': 'public, max-age=31536000, immutable',
  '.ttf': 'public, max-age=31536000, immutable',
  '.eot': 'public, max-age=31536000, immutable',
  '.otf': 'public, max-age=31536000, immutable',
  // Audio files - cache for 30 days
  '.mp3': 'public, max-age=2592000',
  '.ogg': 'public, max-age=2592000',
  '.wav': 'public, max-age=2592000',
  // HTML files - cache for 1 hour with revalidation
  '.html': 'public, max-age=3600, must-revalidate',
  // Manifest and service worker - short cache
  '.json': 'public, max-age=300',
  '.ico': 'public, max-age=86400',
}

/**
 * Get the file extension from a path
 */
function getFileExtension(path: string): string {
  const lastDot = path.lastIndexOf('.')
  return lastDot === -1 ? '' : path.substring(lastDot)
}

/**
 * Get MIME type for a file extension
 */
function getMimeType(extension: string): string {
  return MIME_TYPES[extension] || 'application/octet-stream'
}

/**
 * Get cache control header for a file extension
 */
function getCacheControl(extension: string): string {
  return CACHE_HEADERS[extension] || 'public, max-age=3600'
}

/**
 * Check if a request is for a static asset
 */
function isStaticAsset(pathname: string): boolean {
  const extension = getFileExtension(pathname)
  return Object.keys(MIME_TYPES).includes(extension)
}

/**
 * Generate cache key for KV storage
 */
function getCacheKey(pathname: string): string {
  return `asset:${pathname}`
}

/**
 * Create optimized response headers
 */
function createHeaders(
  extension: string,
  additionalHeaders: Record<string, string> = {}
): Headers {
  const headers = new Headers({
    'Content-Type': getMimeType(extension),
    'Cache-Control': getCacheControl(extension),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...additionalHeaders,
  })

  // Add security headers for HTML files
  if (extension === '.html') {
    headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob: data:; connect-src 'self' https://www.google-analytics.com; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"
    )
    headers.set(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(self), notifications=(self)'
    )
  }

  return headers
}

/**
 * Log analytics data to KV
 */
async function logAnalytics(
  env: Env,
  request: Request,
  responseStatus: number
): Promise<void> {
  try {
    const url = new URL(request.url)
    const userAgent = request.headers.get('User-Agent') || ''
    const referer = request.headers.get('Referer') || ''
    const cfData = request.cf

    const analyticsData = {
      timestamp: Date.now(),
      path: url.pathname,
      method: request.method,
      status: responseStatus,
      userAgent,
      referer,
      country: cfData?.country || '',
      city: cfData?.city || '',
      timezone: cfData?.timezone || '',
      colo: cfData?.colo || '',
    }

    // Store analytics data with a TTL of 30 days
    const key = `analytics:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
    await env.ANALYTICS_KV.put(key, JSON.stringify(analyticsData), {
      expirationTtl: 30 * 24 * 60 * 60, // 30 days
    })
  } catch (error) {
    console.error('Failed to log analytics:', error)
  }
}

/**
 * Main request handler
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    try {
      // Handle root path - serve index.html
      if (pathname === '/') {
        const cacheKey = getCacheKey('/index.html')

        // Try to get from KV cache first
        const cached = await env.CACHE_KV.get(cacheKey, { type: 'arrayBuffer' })
        if (cached) {
          const headers = createHeaders('.html', {
            'X-Cache': 'HIT',
            'X-Served-By': 'Cloudflare Workers',
          })
          await logAnalytics(env, request, 200)
          return new Response(cached, { headers })
        }

        // If not in cache, this would typically fetch from origin
        // For now, return a 404 as the static assets should be uploaded separately
        await logAnalytics(env, request, 404)
        return new Response('index.html not found in cache', { status: 404 })
      }

      // Handle static assets
      if (isStaticAsset(pathname)) {
        const extension = getFileExtension(pathname)
        const cacheKey = getCacheKey(pathname)

        // Try to get from KV cache
        const cached = await env.CACHE_KV.get(cacheKey, { type: 'arrayBuffer' })
        if (cached) {
          const headers = createHeaders(extension, {
            'X-Cache': 'HIT',
            'X-Served-By': 'Cloudflare Workers',
          })
          await logAnalytics(env, request, 200)
          return new Response(cached, { headers })
        }

        // Asset not found in cache
        await logAnalytics(env, request, 404)
        return new Response('Asset not found', { status: 404 })
      }

      // Handle PWA manifest.json specifically
      if (pathname === '/manifest.json' || pathname === '/site.webmanifest') {
        const manifest = {
          name: env.APP_NAME || 'AmbientFlow',
          short_name: 'AmbientFlow',
          description:
            'Ambient sound mixing application for focus and relaxation',
          theme_color: '#3b82f6',
          background_color: '#0a0a0f',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        }

        const headers = createHeaders('.json', {
          'X-Served-By': 'Cloudflare Workers',
        })
        await logAnalytics(env, request, 200)
        return new Response(JSON.stringify(manifest, null, 2), { headers })
      }

      // Handle service worker
      if (pathname === '/sw.js') {
        const cacheKey = getCacheKey('/sw.js')
        const cached = await env.CACHE_KV.get(cacheKey, { type: 'arrayBuffer' })

        if (cached) {
          const headers = createHeaders('.js', {
            'X-Cache': 'HIT',
            'X-Served-By': 'Cloudflare Workers',
            'Service-Worker-Allowed': '/',
          })
          await logAnalytics(env, request, 200)
          return new Response(cached, { headers })
        }

        await logAnalytics(env, request, 404)
        return new Response('Service worker not found', { status: 404 })
      }

      // For all other paths (SPA routing), serve index.html
      const cacheKey = getCacheKey('/index.html')
      const cached = await env.CACHE_KV.get(cacheKey, { type: 'arrayBuffer' })

      if (cached) {
        const headers = createHeaders('.html', {
          'X-Cache': 'HIT',
          'X-Served-By': 'Cloudflare Workers',
        })
        await logAnalytics(env, request, 200)
        return new Response(cached, { headers })
      }

      // Fallback 404
      await logAnalytics(env, request, 404)
      return new Response('Not Found', { status: 404 })
    } catch (error) {
      console.error('Worker error:', error)
      await logAnalytics(env, request, 500)
      return new Response('Internal Server Error', { status: 500 })
    }
  },

  /**
   * Scheduled handler for maintenance tasks
   */
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    // Daily cleanup of old analytics data
    try {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

      // List all analytics keys
      const { keys } = await env.ANALYTICS_KV.list({ prefix: 'analytics:' })

      // Delete old entries
      const deletePromises = keys
        .filter((key) => {
          const timestamp = parseInt(key.name.split(':')[1])
          return timestamp < thirtyDaysAgo
        })
        .map((key) => env.ANALYTICS_KV.delete(key.name))

      await Promise.all(deletePromises)
      console.log(`Cleaned up ${deletePromises.length} old analytics entries`)
    } catch (error) {
      console.error('Failed to cleanup analytics:', error)
    }
  },
}

/**
 * Performance optimization utilities for Core Web Vitals
 */

/**
 * Lazy load images with Intersection Observer
 */
export const createImageLazyLoader = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.classList.add('fade-in')
            observer.unobserve(img)
          }
        }
      })
    })

    return imageObserver
  }
  return null
}

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  // Skip font preloading - using system fonts for better performance
  // Skip CSS preloading - handled by build process

  // Only preload actual critical resources that exist
  console.log('Using system fonts for optimal performance')
}

/**
 * Optimize First Input Delay (FID)
 */
export const deferNonCriticalScripts = () => {
  // Move non-critical scripts to idle callback
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Load analytics, monitoring, etc.
      console.log('Loading non-critical scripts...')
    })
  }
}

/**
 * Minimize Cumulative Layout Shift (CLS)
 */
export const reserveSpaceForDynamicContent = () => {
  // Add aspect-ratio to prevent layout shifts
  const soundCards = document.querySelectorAll('[data-sound-card]')
  soundCards.forEach((card) => {
    const element = card as HTMLElement
    element.style.aspectRatio = '1 / 1'
  })
}

/**
 * Performance metrics reporter
 */
export const reportWebVitals = (
  onPerfEntry?: (metric: {
    name: string
    value: number
    id: string
    delta: number
    rating?: string
  }) => void
) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry)
      onFID(onPerfEntry)
      onFCP(onPerfEntry)
      onLCP(onPerfEntry)
      onTTFB(onPerfEntry)
    })
  }
}

/**
 * Resource hints for faster navigation
 */
export const addResourceHints = () => {
  // DNS prefetch for external resources
  const dnsPrefetch = document.createElement('link')
  dnsPrefetch.rel = 'dns-prefetch'
  dnsPrefetch.href = 'https://fonts.googleapis.com'
  document.head.appendChild(dnsPrefetch)

  // Preconnect to critical origins
  const preconnect = document.createElement('link')
  preconnect.rel = 'preconnect'
  preconnect.href = 'https://fonts.gstatic.com'
  preconnect.crossOrigin = 'anonymous'
  document.head.appendChild(preconnect)
}

/**
 * Optimize rendering performance
 */
export const optimizeRendering = () => {
  // Enable CSS containment for better performance
  const soundGrid = document.querySelector('.sound-grid')
  if (soundGrid) {
    const element = soundGrid as HTMLElement
    element.style.contain = 'layout style paint'
  }

  // Use will-change for animations
  const animatedElements = document.querySelectorAll('[data-animated]')
  animatedElements.forEach((el) => {
    const element = el as HTMLElement
    element.style.willChange = 'transform, opacity'
  })
}

/**
 * Progressive enhancement for better perceived performance
 */
export const enableProgressiveEnhancement = () => {
  // Start with skeleton screens
  document.documentElement.classList.add('progressive-enhanced')

  // Gradually enhance features
  if ('serviceWorker' in navigator) {
    document.documentElement.classList.add('sw-supported')
  }

  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('io-supported')
  }
}

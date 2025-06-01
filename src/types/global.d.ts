// Global type definitions

interface Window {
  gtag?: (
    command: string,
    eventName: string,
    parameters?: Record<string, any>
  ) => void
}

// Service Worker types
interface ServiceWorkerRegistration {
  sync?: {
    register: (tag: string) => Promise<void>
  }
}

// Web Vitals types
interface Metric {
  name: string
  value: number
  id: string
  delta: number
  rating?: 'good' | 'needs-improvement' | 'poor' | string
}

declare module 'web-vitals' {
  export function onCLS(callback: (metric: Metric) => void): void
  export function onFID(callback: (metric: Metric) => void): void
  export function onFCP(callback: (metric: Metric) => void): void
  export function onLCP(callback: (metric: Metric) => void): void
  export function onTTFB(callback: (metric: Metric) => void): void
}

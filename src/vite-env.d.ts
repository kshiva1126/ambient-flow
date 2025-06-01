/// <reference types="vite/client" />

// Global type definitions
interface Window {
  gtag?: (
    command: string,
    eventName: string,
    parameters?: Record<string, unknown>
  ) => void
}

// Service Worker types
interface ServiceWorkerRegistration {
  sync?: {
    register: (tag: string) => Promise<void>
  }
}

declare const self: ServiceWorkerGlobalScope

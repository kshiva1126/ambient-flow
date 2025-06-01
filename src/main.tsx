import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializePWA } from './utils/serviceWorker'
import {
  reportWebVitals,
  preloadCriticalResources,
  addResourceHints,
} from './utils/performance'
import { pwaMetrics, trackPerformance } from './utils/pwaMetrics'

// PWAメトリクス収集開始
console.log('PWA Metrics collection started')

// Performance optimizations
preloadCriticalResources()
addResourceHints()

// Report Web Vitals
reportWebVitals((metric) => {
  console.log('Web Vitals:', metric)

  // PWAメトリクスに記録
  trackPerformance(`web_vital_${metric.name.toLowerCase()}`, metric.value, {
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating || 'unknown',
  })

  // Send to analytics endpoint
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    })
  }
})

// PWA初期化
const initStartTime = performance.now()
initializePWA()
  .then(() => {
    const initTime = performance.now() - initStartTime
    trackPerformance('pwa_initialization_time', initTime)
    console.log(`PWA initialized in ${initTime.toFixed(2)}ms`)
  })
  .catch((error) => {
    console.error('PWA initialization failed:', error)
    pwaMetrics.recordError('pwa_init_failed', error.message)
  })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

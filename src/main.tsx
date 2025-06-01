import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializePWA } from './utils/serviceWorker'

// PWA初期化
initializePWA().catch((error) => {
  console.error('PWA initialization failed:', error)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

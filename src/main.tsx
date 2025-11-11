import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, setupInstallPrompt } from './utils/pwa'

// Register service worker for PWA
if (import.meta.env.PROD) {
  registerServiceWorker().catch((error) => {
    console.error('Failed to register service worker:', error)
  })
} else {
  // In development, you might want to skip service worker
  // or use it for testing
  console.log('[PWA] Service worker disabled in development mode')
}

// Setup install prompt listener
setupInstallPrompt()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


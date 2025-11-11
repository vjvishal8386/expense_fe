// PWA Utility Functions

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * Register service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[PWA] Service Worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New service worker available. Refresh to update.');
              // You can show a toast notification here
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Unregister service worker (for development)
 */
export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('[PWA] Service Worker unregistered');
    } catch (error) {
      console.error('[PWA] Service Worker unregistration failed:', error);
    }
  }
};

/**
 * Listen for beforeinstallprompt event
 */
export const setupInstallPrompt = (): void => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('[PWA] Install prompt available');
    
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });
};

/**
 * Show install prompt
 */
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.log('[PWA] No install prompt available');
    return false;
  }

  try {
    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log('[PWA] User response:', outcome);
    
    // Clear the deferred prompt
    deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Error showing install prompt:', error);
    return false;
  }
};

/**
 * Check if app is installed
 */
export const isAppInstalled = (): boolean => {
  // Check if running in standalone mode (installed)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check for iOS standalone mode
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
};

/**
 * Check if install prompt is available
 */
export const isInstallPromptAvailable = (): boolean => {
  return deferredPrompt !== null;
};

/**
 * Check if service worker is supported
 */
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

/**
 * Check if PWA is installable
 */
export const isPWAInstallable = (): boolean => {
  return isServiceWorkerSupported() && !isAppInstalled();
};


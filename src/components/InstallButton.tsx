import { useState, useEffect } from 'react';
import { isPWAInstallable, isInstallPromptAvailable, showInstallPrompt, isAppInstalled } from '../utils/pwa';

const InstallButton = () => {
  const [showButton, setShowButton] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if PWA is installable
    const checkInstallability = () => {
      const installable = isPWAInstallable();
      const installed = isAppInstalled();
      setShowButton(installable && !installed);
    };

    // Initial check
    checkInstallability();

    // Listen for install prompt availability
    const handleInstallAvailable = () => {
      setShowButton(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    
    // Re-check periodically (in case prompt becomes available)
    const interval = setInterval(checkInstallability, 1000);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      clearInterval(interval);
    };
  }, []);

  const handleInstall = async () => {
    if (!isInstallPromptAvailable()) {
      console.log('[PWA] Install prompt not available');
      return;
    }

    setInstalling(true);
    try {
      const accepted = await showInstallPrompt();
      if (accepted) {
        setShowButton(false);
        // Optionally show success message
        console.log('[PWA] App installation accepted');
      }
    } catch (error) {
      console.error('[PWA] Installation error:', error);
    } finally {
      setInstalling(false);
    }
  };

  if (!showButton) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Install Spend Book app"
    >
      {installing ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Installing...</span>
        </>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Install App</span>
        </>
      )}
    </button>
  );
};

export default InstallButton;


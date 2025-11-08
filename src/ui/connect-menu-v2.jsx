import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider, useAccount, useConnect, useSendTransaction, useSendCalls } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { parseEther } from 'viem';
import { config as wagmiConfig, makeWagmiConfig, getConfig } from './wagmi-config.js';

// Config will be initialized lazily when needed (especially important for mobile apps)
let config = wagmiConfig || null;

// Use centralized platform detection utility (100% compliance with Unified Wallet Integration Model)
function isMiniAppEnvironment() {
  try {
    // Priority 1: Use centralized platform detection utility
    if (typeof window !== 'undefined' && typeof window.isMiniAppHost === 'function') {
      return window.isMiniAppHost();
    }
    
    // Priority 2: Emergency fallback (should never reach here in normal operation)
    // This fallback is kept for safety but should not be needed
    // Utility loads early in index.html as type="module" script
    if (typeof window !== 'undefined') {
      // Minimal fallback - try most common indicators
      return Boolean(
        (window.fc && window.fc.miniapp) ||
        (window.farcaster && window.farcaster.miniapp) ||
        window.MiniKit ||
        window.ReactNativeWebView
      );
    }
    return false;
  } catch (_) {
    return false;
  }
}

function ConnectMenuInner() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { sendTransaction } = useSendTransaction();
  const { sendCalls } = useSendCalls();
  const isMiniApp = isMiniAppEnvironment();

  // In mini app environments, DO NOT show any UI
  // Wallet functionality is handled via Wallet panel in bottom navigation
  // This connect menu should be completely hidden in mini apps
  if (isMiniApp) {
    return null;
  }

  // Web environment only - show connect UI
  if (isConnected) {
    return (
      React.createElement(React.Fragment, null,
        React.createElement('div', { style: { fontFamily: 'Inter, system-ui, sans-serif', padding: '8px 12px', background: '#0f172a', color: '#a5b4fc', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginBottom: 8 } },
          "You're connected!",
          React.createElement('div', { style: { fontSize: 12, opacity: 0.9, marginTop: 4 } }, `Address: ${address}`)
        ),
        React.createElement('div', { style: { display: 'flex', gap: 8 } },
          React.createElement('button', {
            type: 'button',
            onClick: () => {
              try { sendTransaction({ to: address, value: parseEther('0.000001') }); } catch (_) {}
            },
            style: baseBtnStyle()
          }, 'Send 0.000001 ETH'),
          React.createElement('button', {
            type: 'button',
            onClick: () => {
              try {
                const a1 = address;
                const a2 = address;
                sendCalls({
                  calls: [
                    { to: a1, value: parseEther('0.000001') },
                    { to: a2, value: parseEther('0.000002') }
                  ]
                });
              } catch (_) {}
            },
            style: baseBtnStyle()
          }, 'Send Batch (2x)')
        )
      )
    );
  }

  return (
    React.createElement('button', {
      type: 'button',
      onClick: () => connect({ connector: connectors?.[0] }),
      disabled: isPending,
      style: {
        fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500,
        padding: '10px 14px', borderRadius: 10, border: '1px solid #334155',
        background: '#111827', color: '#e2e8f0', cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }
    }, isPending ? 'Connecting…' : 'Connect')
  );
}

function App() {
  const isMiniApp = isMiniAppEnvironment();
  
  // In mini app environments, DO NOT render anything
  // Wallet functionality is handled via Wallet panel in bottom navigation
  if (isMiniApp) {
    return null;
  }
  
  const qc = new QueryClient();
  const [currentConfig, setCurrentConfig] = useState(config);
  const [isLoading, setIsLoading] = useState(!config);
  
  // Initialize config asynchronously (especially important for mobile apps)
  useEffect(() => {
    if (currentConfig) {
      return; // Config already available
    }
    
    setIsLoading(true);
    
    // Try to get config with SDK readiness check
    getConfig().then((initializedConfig) => {
      if (initializedConfig) {
        setCurrentConfig(initializedConfig);
        config = initializedConfig; // Update module-level config
        console.log('[ConnectMenu] Config initialized successfully');
      } else {
        console.warn('[ConnectMenu] Config initialization returned null');
      }
      setIsLoading(false);
    }).catch((error) => {
      console.error('[ConnectMenu] Failed to initialize config:', error);
      setIsLoading(false);
    });
  }, []);
  
  // If loading, show nothing (don't show error immediately)
  if (isLoading && isMiniApp) {
    return null; // Wait silently in mini apps
  }
  
  // If config is not available after initialization
  if (!currentConfig) {
    // In mini app environments, don't show error - wallet works via SDK
    // Just return empty/nothing instead of showing error
    if (isMiniApp) {
      console.warn('[ConnectMenu] Config unavailable in mini app, hiding menu');
      return null;
    }
    
    // Web environment - show error message
    return React.createElement('div', {
      style: {
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '8px 12px',
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#fca5a5',
        borderRadius: 8,
        fontSize: '12px',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }
    }, 'Wallet config unavailable');
  }
  
  return (
    React.createElement(WagmiProvider, { config: currentConfig },
      React.createElement(QueryClientProvider, { client: qc },
        React.createElement(ConnectMenuInner, null)
      )
    )
  );
}

function ensureMountEl() {
  // In mini app environments, DO NOT create container
  // Connect menu should not be visible in mini apps
  const isMiniApp = isMiniAppEnvironment();
  if (isMiniApp) {
    // Remove container if it exists
    const existing = document.getElementById('connect-root');
    if (existing) {
      existing.remove();
    }
    return null;
  }
  
  let el = document.getElementById('connect-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'connect-root';
    el.style.position = 'fixed';
    // Safe area insets support for mobile devices (notch, navigation bars)
    el.style.bottom = 'calc(12px + env(safe-area-inset-bottom, 0px))';
    el.style.right = 'calc(12px + env(safe-area-inset-right, 0px))';
    el.style.zIndex = '2147483647';
    document.body.appendChild(el);
  }
  return el;
}

function baseBtnStyle() {
  return {
    fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600,
    padding: '10px 14px', 
    minHeight: '44px', // Minimum touch target size (Base App guideline)
    minWidth: '44px',
    borderRadius: 10, border: '1px solid #334155',
    background: '#0b1220', color: '#e2e8f0', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'manipulation' // Prevent double-tap zoom on mobile
  };
}

// Wait for both DOM and SDK ready in mini app environments
let mountAttempted = false;
let mountComplete = false;

function mountConnectMenu() {
  // In mini app environments, DO NOT mount connect menu
  // Wallet functionality is handled via Wallet panel in bottom navigation
  const isMiniApp = isMiniAppEnvironment();
  if (isMiniApp) {
    console.log('[ConnectMenu] Mini app detected, skipping mount');
    // Remove container if it exists
    const existing = document.getElementById('connect-root');
    if (existing) {
      existing.remove();
    }
    mountComplete = true; // Mark as complete to prevent retries
    return;
  }
  
  if (mountAttempted) {
    console.log('[ConnectMenu] Mount already attempted, skipping...');
    return;
  }
  mountAttempted = true;
  
  try {
    const container = ensureMountEl();
    if (!container) {
      console.warn('[ConnectMenu] Container not created');
      mountAttempted = false; // Retry
      return;
    }
    
    const root = createRoot(container);
    const appElement = React.createElement(App);
    root.render(appElement);
    mountComplete = true;
    
    console.log('[ConnectMenu] Mounted successfully');
    
    // Listen for wallet open events from bottom nav
    window.addEventListener('baseman-open-wallet', () => {
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  } catch (err) {
    console.error('[ConnectMenu] mount failed', err);
    mountAttempted = false; // Allow retry
  }
}

function initConnectMenu() {
  // In mini app environments, DO NOT initialize connect menu
  const isMiniApp = isMiniAppEnvironment();
  if (isMiniApp) {
    console.log('[ConnectMenu] Mini app detected, skipping initialization');
    // Remove container if it exists
    const existing = document.getElementById('connect-root');
    if (existing) {
      existing.remove();
    }
    mountComplete = true; // Mark as complete to prevent retries
    return;
  }
  
  if (mountComplete) {
    console.log('[ConnectMenu] Already mounted');
    return;
  }
  
  // Wait for React to be available
  if (typeof React === 'undefined' || typeof createRoot === 'undefined') {
    console.log('[ConnectMenu] React not available yet, waiting...');
    setTimeout(initConnectMenu, 200);
    return;
  }
  
  mountConnectMenu();
}

// Early check: if mini app, don't initialize at all
// This prevents any connect menu UI from appearing in mobile apps
(function checkAndSkipIfMiniApp() {
  // Use multiple detection methods for reliability
  const isMiniAppEarly = isMiniAppEnvironment() || 
    (typeof window !== 'undefined' && (
      (window.fc && window.fc.miniapp) ||
      (window.farcaster && window.farcaster.miniapp) ||
      window.MiniAppSDK ||
      window.MiniKit ||
      window.ReactNativeWebView ||
      (window.navigator && window.navigator.userAgent && (
        window.navigator.userAgent.includes('Farcaster') ||
        window.navigator.userAgent.includes('Warpcast') ||
        window.navigator.userAgent.includes('BaseApp')
      ))
    ));
    
  if (isMiniAppEarly) {
    console.log('[ConnectMenu] Mini app detected early, skipping all initialization');
    
    // Add CSS to hide connect menu immediately
    if (typeof document !== 'undefined') {
      const style = document.getElementById('hide-connect-menu-miniapp');
      if (style) {
        style.textContent = `
          #connect-root,
          [id*="connect"],
          [class*="connect"][class*="root"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            position: absolute !important;
            left: -9999px !important;
          }
        `;
      }
      
      // Remove container if it exists
      const existing = document.getElementById('connect-root');
      if (existing) {
        existing.remove();
      }
      
      // Also remove any error messages that might have been rendered
      const errorDivs = document.querySelectorAll('[id*="connect"], [class*="connect"]');
      errorDivs.forEach(el => {
        if (el.textContent && (el.textContent.includes('Wallet config unavailable') || 
            el.textContent.includes("You're connected!"))) {
          el.remove();
        }
      });
      
      // Periodic cleanup in case something gets rendered later
      let cleanupCount = 0;
      const cleanupInterval = setInterval(() => {
        const connectRoot = document.getElementById('connect-root');
        if (connectRoot) {
          connectRoot.remove();
        }
        cleanupCount++;
        if (cleanupCount > 20) { // Stop after 10 seconds (20 * 500ms)
          clearInterval(cleanupInterval);
        }
      }, 500);
    }
    
    mountComplete = true; // Mark as complete to prevent any initialization
    return; // Exit early, don't proceed with initialization
  }
  
  // Web environment - proceed with initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait for React to load
      setTimeout(() => {
        if (window.__basemanSDKReadyFired) {
          setTimeout(initConnectMenu, 500);
        } else {
          window.addEventListener('baseman-sdk-ready', () => {
            setTimeout(initConnectMenu, 500);
          }, { once: true });
          // Fallback: mount after delay even if SDK ready event doesn't fire
          setTimeout(initConnectMenu, 2000);
        }
      }, 500);
    }, { once: true });
  } else {
    // DOM already ready
    setTimeout(() => {
      if (window.__basemanSDKReadyFired) {
        setTimeout(initConnectMenu, 500);
      } else {
        window.addEventListener('baseman-sdk-ready', () => {
          setTimeout(initConnectMenu, 500);
        }, { once: true });
        // Fallback for web mode - wait longer for React
        setTimeout(initConnectMenu, 2000);
      }
    }, 500);
  }
})();

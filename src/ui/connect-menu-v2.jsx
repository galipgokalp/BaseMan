import React from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider, useAccount, useConnect, useSendTransaction, useSendCalls } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { parseEther } from 'viem';
import { config } from './wagmi-config.js';

function isMiniAppEnvironment() {
  try {
    return Boolean(
      (typeof window !== 'undefined') && (
        (window.fc && window.fc.miniapp) ||
        (window.farcaster && window.farcaster.miniapp) ||
        window.MiniAppSDK || window.MiniApp?.sdk ||
        window.MiniKit || window.ReactNativeWebView ||
        (window.navigator && window.navigator.userAgent && (
          window.navigator.userAgent.includes('Farcaster') ||
          window.navigator.userAgent.includes('Warpcast') ||
          window.navigator.userAgent.includes('BaseApp')
        ))
      )
    );
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

  // In mini app environments, show wallet status but don't show connect button
  // Wallet auto-connects, so we just show the connected state
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

  // In mini app environments, wallet auto-connects, so show a minimal status
  if (isMiniApp) {
    return React.createElement('div', {
      style: {
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.6)',
        color: '#a5b4fc',
        borderRadius: 8,
        fontSize: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }
    }, 'Wallet: Auto-connecting...');
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
  const qc = new QueryClient();
  return (
    React.createElement(WagmiProvider, { config },
      React.createElement(QueryClientProvider, { client: qc },
        React.createElement(ConnectMenuInner, null)
      )
    )
  );
}

function ensureMountEl() {
  let el = document.getElementById('connect-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'connect-root';
    el.style.position = 'fixed';
    el.style.bottom = '12px';
    el.style.right = '12px';
    el.style.zIndex = '2147483647';
    document.body.appendChild(el);
  }
  return el;
}

function baseBtnStyle() {
  return {
    fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600,
    padding: '10px 14px', borderRadius: 10, border: '1px solid #334155',
    background: '#0b1220', color: '#e2e8f0', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  };
}

// Wait for both DOM and SDK ready in mini app environments
function mountConnectMenu() {
  try {
    const container = ensureMountEl();
    const root = createRoot(container);
    root.render(React.createElement(App));
  } catch (err) {
    console.error('[ConnectMenu] mount failed', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // In mini app environments, wait for SDK ready
    if (window.__basemanSDKReadyFired) {
      setTimeout(mountConnectMenu, 100);
    } else {
      window.addEventListener('baseman-sdk-ready', () => {
        setTimeout(mountConnectMenu, 100);
      }, { once: true });
      // Fallback: mount after delay even if SDK ready event doesn't fire
      setTimeout(mountConnectMenu, 1000);
    }
  }, { once: true });
} else {
  // DOM already ready
  if (window.__basemanSDKReadyFired) {
    setTimeout(mountConnectMenu, 100);
  } else {
    window.addEventListener('baseman-sdk-ready', () => {
      setTimeout(mountConnectMenu, 100);
    }, { once: true });
    // Fallback for web mode
    setTimeout(mountConnectMenu, 300);
  }
}

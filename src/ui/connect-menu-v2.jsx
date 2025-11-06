import React from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider, useAccount, useConnect, useSendTransaction, useSendCalls } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { parseEther } from 'viem';
import { config } from './wagmi-config.js';

function ConnectMenuInner() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { sendTransaction } = useSendTransaction();
  const { sendCalls } = useSendCalls();

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

document.addEventListener('DOMContentLoaded', () => {
  try {
    const container = ensureMountEl();
    const root = createRoot(container);
    root.render(React.createElement(App));
  } catch (err) {
    console.error('[ConnectMenu] mount failed', err);
  }
});

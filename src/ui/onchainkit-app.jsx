/* Minimal React island to render OnchainKit wallet UI */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WalletDropdown, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, EthBalance } from '@coinbase/onchainkit/identity';

function getChainFromConfig() {
  const cfg = window.BaseManOnchainConfig || {};
  const cid = Number(cfg.chainId || 84532);
  return cid === 8453 ? 'base' : 'base-sepolia';
}

function getProjectId() {
  // Optionally set this in your environment as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  return (
    window.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    (window.__ENV && window.__ENV.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) ||
    ''
  );
}

function OnchainWalletUI() {
  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 10000 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <ConnectWallet />
        <WalletDropdown />
      </div>
      <div style={{ marginTop: 8, background: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Avatar />
          <Name />
          <EthBalance />
        </div>
      </div>
    </div>
  );
}

function App() {
  const chain = getChainFromConfig();
  const projectId = getProjectId();
  return (
    <OnchainKitProvider chain={chain} projectId={projectId}>
      <OnchainWalletUI />
    </OnchainKitProvider>
  );
}

function mount() {
  const el = document.getElementById('onchainkit-root');
  if (!el) return;
  const root = createRoot(el);
  root.render(<App />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}


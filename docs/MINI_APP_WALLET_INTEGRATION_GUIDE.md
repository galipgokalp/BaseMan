# Farcaster ve Base App Mobil Uygulamalarında Mini App Cüzdan Entegrasyonu Rehberi

## Genel Bakış

Farcaster ve Base App mobil uygulamalarında mini app'ler, kullanıcının cüzdanına **EIP-1193 Ethereum Provider API** üzerinden erişir. Bu rehber, her iki platform için doğru entegrasyon yöntemlerini açıklar.

---

## 1. Temel Kavramlar

### EIP-1193 Ethereum Provider API

Mini app'ler, standart [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) Ethereum Provider API'sini kullanarak cüzdanla etkileşime girer. Bu API:

- ✅ **Standardized**: Tüm Ethereum cüzdanları tarafından desteklenir
- ✅ **Async/Await**: Promise tabanlı async API
- ✅ **Event-driven**: `accountsChanged`, `chainChanged` gibi event'ler
- ✅ **Provider Interface**: `request()` metodu ile RPC çağrıları

### SDK Provider Erişimi

Her iki platform da SDK üzerinden provider sağlar:

**Farcaster:**
```javascript
const provider = await sdk.wallet.getEthereumProvider();
```

**Base App:**
```javascript
const sdk = createBaseAccountSDK({...});
const provider = sdk.getProvider;
```

---

## 2. Farcaster Mini App Cüzdan Entegrasyonu

### 2.1. SDK ile Provider Erişimi

**Kurulum:**
```bash
npm install @farcaster/miniapp-sdk
```

**Kullanım:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk';

// SDK'nın hazır olmasını bekle
await sdk.actions.ready();

// Provider'ı al
const provider = await sdk.wallet.getEthereumProvider();
```

**Dokümantasyon:**
- [Farcaster Wallet Guide](https://miniapps.farcaster.xyz/docs/guides/wallets)
- SDK API: `sdk.wallet.getEthereumProvider`

### 2.2. Wagmi ile Entegrasyon (Önerilen)

**Kurulum:**
```bash
npm install wagmi @farcaster/miniapp-wagmi-connector viem @tanstack/react-query
```

**Wagmi Config:**
```typescript
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    farcasterMiniApp()  // ⚠️ Fonksiyon olarak çağrılmalı!
  ]
});
```

**⚠️ Önemli Not:**
Docs'ta gösterilen örnekler hatalı! `farcasterMiniApp` bir fonksiyon olduğu için `()` ile çağrılmalı:

```typescript
// ❌ YANLIŞ (docs'ta böyle gösterilmiş)
connectors: [miniAppConnector]

// ✅ DOĞRU
connectors: [farcasterMiniApp()]
```

**React Hook Kullanımı:**
```tsx
import { useAccount, useConnect, useSendTransaction } from 'wagmi';

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { sendTransaction } = useSendTransaction();

  // Otomatik bağlanma kontrolü
  if (!isConnected && connectors.length > 0) {
    connect({ connector: connectors[0] });
  }

  if (isConnected) {
    return <div>Connected: {address}</div>;
  }

  return <button onClick={() => connect({ connector: connectors[0] })}>Connect</button>;
}
```

### 2.3. Batch Transactions (EIP-5792)

Farcaster Wallet, EIP-5792 `wallet_sendCalls` metodunu destekler:

```tsx
import { useSendCalls } from 'wagmi';
import { parseEther } from 'viem';

function BatchTransfer() {
  const { sendCalls } = useSendCalls();

  return (
    <button
      onClick={() =>
        sendCalls({
          calls: [
            { to: '0x...', value: parseEther('0.01') },
            { to: '0x...', value: parseEther('0.02') }
          ]
        })
      }
    >
      Send Batch
    </button>
  );
}
```

**Kullanım Senaryoları:**
- Token approval + swap işlemleri
- Multiple NFT mints
- Complex DeFi interactions

**Limitasyonlar:**
- Transactions sequential çalışır (atomic değil)
- Paymaster desteği yok
- Tüm Farcaster desteklenen EVM chain'lerde mevcut

### 2.4. Özellikler

✅ **Otomatik Bağlantı**: Kullanıcı zaten bağlıysa `isConnected` otomatik `true`
✅ **Wallet Selection Dialog Yok**: Farcaster client otomatik bağlanır
✅ **Transaction Preview**: Kullanıcıya işlem önizlemesi gösterilir
✅ **Security Scanning**: Blockaid ile transaction scanning

---

## 3. Base App Mini App Cüzdan Entegrasyonu

### 3.1. Base Account SDK

**Kurulum:**
```bash
npm install @base-org/account
```

**SDK Oluşturma:**
```typescript
import { createBaseAccountSDK, base } from '@base-org/account';

const sdk = createBaseAccountSDK({
  appName: 'My App Name',
  appLogoUrl: 'https://example.com/logo.png',
  appChainIds: [base.constants.CHAIN_IDS.base], // [8453]
});

// Provider'ı al
const provider = sdk.getProvider;
```

**Dokümantasyon:**
- [Base Account SDK](https://docs.base.org/base-account/reference/core/create-base-account-sdk)
- API: `sdk.getProvider`

### 3.2. Wagmi ile Entegrasyon

#### Option 1: Base Account Connector

```typescript
import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { baseAccount } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: 'Base App',
    })
  ],
  transports: {
    [base.id]: http()
  }
});
```

#### Option 2: Mobile Wallet Protocol Connector

```bash
npm install @mobile-wallet-protocol/wagmi-connectors
```

```typescript
import { createConnectorFromWallet, Wallets } from "@mobile-wallet-protocol/wagmi-connectors";

const metadata = {
  name: "My App Name",
  customScheme: "myapp://",
  chainIds: [8453],
  logoUrl: "https://example.com/logo.png"
};

export const config = createConfig({
  chains: [base],
  connectors: [
    createConnectorFromWallet({
      metadata,
      wallet: Wallets.CoinbaseSmartWallet,
    })
  ],
  transports: {
    [base.id]: http()
  }
});
```

### 3.3. EIP-1193 Provider Kullanımı

Base App SDK'sı direkt EIP-1193 provider döndürür:

```typescript
const provider = sdk.getProvider;

// Account'ları iste
const accounts = await provider.request({ 
  method: 'eth_requestAccounts' 
});

// Transaction gönder
const txHash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: accounts[0],
    to: '0x...',
    value: '0x0'
  }]
});
```

---

## 4. Ortak Entegrasyon Stratejisi

### 4.1. Platform Tespiti

```javascript
function isFarcasterMiniApp() {
  return Boolean(
    (window.fc && window.fc.miniapp) ||
    (window.farcaster && window.farcaster.miniapp) ||
    window.MiniAppSDK
  );
}

function isBaseApp() {
  return Boolean(
    window.ReactNativeWebView ||
    (window.navigator?.userAgent?.includes('BaseApp'))
  );
}

function isMiniAppEnvironment() {
  return isFarcasterMiniApp() || isBaseApp();
}
```

### 4.2. window.ethereum Shim (Önerilen)

Birçok web3 kütüphanesi `window.ethereum` bekler. Mini app ortamlarında SDK provider'ını `window.ethereum` olarak expose etmek için:

**`miniapp-ethereum-shim.js`:**
```javascript
(function() {
  const MAX_TRIES = 300; // ~30s
  const DELAY = 100;
  let tries = 0;

  function getMiniAppProvider() {
    try {
      // Farcaster SDK
      const farcasterSDK = 
        (window.fc && window.fc.miniapp) ||
        (window.farcaster && window.farcaster.miniapp) ||
        window.MiniAppSDK;
      
      if (farcasterSDK?.wallet?.getEthereumProvider) {
        return farcasterSDK.wallet.getEthereumProvider();
      }

      // Base App SDK (eğer varsa)
      // Base App genellikle ReactNativeWebView kullanır
      // ve kendi provider'ını zaten expose eder
      
      return null;
    } catch (_) {
      return null;
    }
  }

  async function ensureEthereum() {
    if (window.ethereum) return; // Mevcut provider'ı override etme

    const provider = await getMiniAppProvider();
    if (provider) {
      const resolved = typeof provider.then === 'function' 
        ? await provider 
        : provider;
      if (resolved && !window.ethereum) {
        window.ethereum = resolved;
      }
      return;
    }

    tries += 1;
    if (tries < MAX_TRIES) {
      setTimeout(ensureEthereum, DELAY);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureEthereum, { once: true });
  } else {
    ensureEthereum();
  }
})();
```

**HTML'de Yükle:**
```html
<script src="miniapp-ethereum-shim.js"></script>
```

### 4.3. Wagmi Config (Hibrit Yaklaşım)

Her iki platformu destekleyen tek bir config:

```typescript
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { injected, metaMask, safe } from 'wagmi/connectors';

function isFarcasterMiniApp() {
  return Boolean(
    (window.fc && window.fc.miniapp) ||
    (window.farcaster && window.farcaster.miniapp)
  );
}

function isBaseApp() {
  return Boolean(window.ReactNativeWebView);
}

export function makeWagmiConfig() {
  const chains = [baseSepolia, base];
  
  const transports = {
    [base.id]: http(),
    [baseSepolia.id]: http()
  };

  const connectors = [];

  if (isFarcasterMiniApp()) {
    // Farcaster için özel connector
    try {
      connectors.push(farcasterMiniApp());
    } catch (e) {
      console.warn('Farcaster connector failed, using injected()', e);
      connectors.push(injected());
    }
  } else if (isBaseApp()) {
    // Base App için injected() yeterli
    // miniapp-ethereum-shim.js zaten window.ethereum'ı expose eder
    connectors.push(injected());
  } else {
    // Web ortamı
    connectors.push(injected(), metaMask(), safe());
  }

  return createConfig({
    chains,
    transports,
    connectors
  });
}
```

---

## 5. Best Practices

### 5.1. SDK Hazır Olmasını Bekleme

```javascript
// Farcaster
await sdk.actions.ready();

// Base App
// SDK genellikle anında hazır, ama kontrol edin
if (!sdk || !sdk.getProvider) {
  throw new Error('Base Account SDK not available');
}
```

### 5.2. Provider Availability Kontrolü

```javascript
async function waitForProvider(maxWait = 30000) {
  const start = Date.now();
  
  while (Date.now() - start < maxWait) {
    if (window.ethereum || await getProvider()) {
      return window.ethereum || await getProvider();
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error('Provider not available');
}
```

### 5.3. Error Handling

```javascript
try {
  const accounts = await provider.request({ 
    method: 'eth_requestAccounts' 
  });
} catch (error) {
  if (error.code === 4001) {
    // User rejected
    console.log('User rejected connection');
  } else if (error.code === -32002) {
    // Request already pending
    console.log('Request already pending');
  } else {
    console.error('Connection error:', error);
  }
}
```

### 5.4. Chain Switching

```javascript
async function switchChain(chainId) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }]
    });
  } catch (error) {
    if (error.code === 4902) {
      // Chain not added, add it
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [chainConfig]
      });
    }
  }
}
```

### 5.5. Transaction Preview

Her iki platform da transaction preview gösterir:
- ✅ Transaction details
- ✅ Security scanning (Blockaid)
- ✅ Gas estimation
- ✅ User confirmation

---

## 6. Önemli Farklar

| Özellik | Farcaster | Base App |
|---------|-----------|----------|
| **SDK Paketi** | `@farcaster/miniapp-sdk` | `@base-org/account` |
| **Wagmi Connector** | `@farcaster/miniapp-wagmi-connector` | `baseAccount` (wagmi/connectors) veya `@mobile-wallet-protocol/wagmi-connectors` |
| **Provider API** | `sdk.wallet.getEthereumProvider()` | `sdk.getProvider` |
| **Ready Check** | `await sdk.actions.ready()` | Genellikle anında hazır |
| **Batch Transactions** | ✅ EIP-5792 destekli | ✅ Destekli |
| **Window.ethereum** | Shim gerekli | Genellikle otomatik |

---

## 7. Troubleshooting

### Problem: Provider bulunamıyor

**Çözüm:**
1. SDK'nın yüklendiğinden emin olun
2. `ready()` çağrısını bekleyin (Farcaster)
3. `miniapp-ethereum-shim.js` kullanın
4. Retry mekanizması ekleyin

### Problem: Wagmi config null

**Çözüm:**
1. Chain import'larını kontrol edin
2. Fallback chain definitions kullanın
3. Error handling ekleyin
4. `injected()` connector fallback ekleyin

### Problem: Connection başarısız

**Çözüm:**
1. Platform tespitini kontrol edin
2. Connector'ın doğru şekilde çağrıldığından emin olun
3. Console loglarını inceleyin
4. User rejection durumunu handle edin

---

## 8. Kaynaklar

### Dokümantasyon
- [Farcaster Mini Apps - Wallets](https://miniapps.farcaster.xyz/docs/guides/wallets)
- [Base Account SDK](https://docs.base.org/base-account)
- [Wagmi Documentation](https://wagmi.sh)
- [EIP-1193 Specification](https://eips.ethereum.org/EIPS/eip-1193)
- [EIP-5792 Specification](https://eips.ethereum.org/EIPS/eip-5792)

### Paketler
- `@farcaster/miniapp-sdk` - Farcaster Mini App SDK
- `@farcaster/miniapp-wagmi-connector` - Farcaster Wagmi Connector
- `@base-org/account` - Base Account SDK
- `@mobile-wallet-protocol/wagmi-connectors` - Base App Wagmi Connector
- `wagmi` - React Hooks for Ethereum
- `viem` - TypeScript Ethereum Library

---

## 9. Özet

✅ **Her iki platform da EIP-1193 provider sağlar**
✅ **Wagmi kullanımı önerilir (type-safe, hooks)**
✅ **Platform-specific connector'lar kullanın**
✅ **window.ethereum shim ekleyin (compatibility için)**
✅ **Error handling ve retry mekanizmaları ekleyin**
✅ **SDK ready state'ini kontrol edin**
✅ **Batch transactions desteklenir (EIP-5792)**

Bu rehber, Farcaster ve Base App mobil uygulamalarında mini app cüzdan entegrasyonu için gerekli tüm bilgileri içerir. Platform-specific detaylara dikkat edin ve best practice'leri takip edin.


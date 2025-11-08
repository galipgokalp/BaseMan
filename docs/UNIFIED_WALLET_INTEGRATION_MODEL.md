# Unified Wallet Integration Model - Farcaster & Base App

**Tarih:** 2025-01-06  
**Kapsam:** Farcaster ve Base App mobil uygulamaları için ortak cüzdan entegrasyon modeli

---

## 🎯 Genel Bakış

Farcaster ve Base App mobil uygulamaları, **ortak bir cüzdan entegrasyon modeli** kullanır. Bu model, her iki platform için de aynı API'leri ve yaklaşımları kullanarak tutarlı bir kullanıcı deneyimi sağlar.

### Ortak Prensipler

1. **EIP-1193 Ethereum Provider API:** Her iki platform da standart EIP-1193 provider API'sini kullanır
2. **Otomatik Bağlantı:** Mini app açıldığında cüzdan otomatik olarak bağlanır (kullanıcı etkileşimi olmadan)
3. **Progressive Disclosure:** Passkey/onay prompt'ları sadece transaction yapılırken görünür
4. **Zero-Friction:** Wallet connection flow'u elimine edilir, kullanıcı hiçbir wallet setup yapmadan işlem yapabilir

---

## 📚 Ortak API Modeli

### 1. SDK Provider Erişimi

**Her iki platform da aynı metod kullanır:**

```javascript
// Farcaster ve Base App - Ortak API
const provider = await sdk.wallet.getEthereumProvider();
```

**Özellikler:**
- ✅ EIP-1193 uyumlu provider döndürür
- ✅ Standart Ethereum provider metodlarını destekler
- ✅ `eth_accounts`, `eth_requestAccounts`, `eth_sendTransaction` vb. metodları destekler
- ✅ `wallet_sendCalls` (EIP-5792) batch transaction desteği

**SDK Detection:**
```javascript
// Merkezi SDK detection utility kullanılır
const sdk = resolveSDK(); // src/utils/sdk-detection.js
const provider = await sdk.wallet.getEthereumProvider();
```

---

### 2. Wallet Connection Pattern

**Ortak Connection Flow:**

```javascript
async function ensureWallet(requestAccounts = false) {
  // 1. SDK'dan provider al
  const provider = await sdk.wallet.getEthereumProvider();
  
  // 2. Mevcut bağlantıyı kontrol et (passive, no prompt)
  const accounts = await provider.request({ method: 'eth_accounts' });
  
  if (Array.isArray(accounts) && accounts.length) {
    // ✅ Bağlantı mevcut - otomatik kullan
    return accounts[0];
  }
  
  // 3. Sadece transaction yapılırken yeni bağlantı iste
  if (requestAccounts) {
    // Kullanıcı transaction başlattı - passkey prompt görünebilir
    const req = await provider.request({ method: 'eth_requestAccounts' });
    return req[0];
  }
  
  // 4. Panel açıldığında - bağlantı yoksa "Not connected" göster
  // Wallet ilk transaction'da otomatik bağlanacak
  return null;
}
```

**Önemli Noktalar:**
- ✅ `eth_accounts`: Passive kontrol, passkey prompt yok
- ✅ `eth_requestAccounts`: Sadece transaction yapılırken çağrılır
- ✅ Panel açıldığında: Sadece mevcut durum gösterilir, bağlantı istenmez
- ✅ Transaction yapılırken: `ensureWallet(true)` ile explicit bağlantı istenir

---

### 3. Otomatik Bağlantı (Auto-Connect)

**Her iki platform da otomatik bağlantı sağlar:**

#### Farcaster
```javascript
// Farcaster Mini App - Auto-connect
// Dokümantasyon: "If a user already has a connected wallet the connector will automatically connect to it"
const { isConnected } = useAccount(); // Wagmi hook
// isConnected otomatik olarak true olur
```

#### Base App
```javascript
// Base App Mini App - Auto-connect
// Dokümantasyon: "Mini Apps launched within the Base App are automatically connected to the user's Base Account"
const provider = await sdk.wallet.getEthereumProvider();
const accounts = await provider.request({ method: 'eth_accounts' });
// accounts otomatik olarak dolu gelir
```

**Ortak Davranış:**
- ✅ Mini app açıldığında otomatik bağlantı
- ✅ Passkey/onay prompt'u yok (ilk açılışta)
- ✅ Kullanıcı hiçbir wallet setup yapmadan işlem yapabilir

---

### 4. Transaction Pattern

**Ortak Transaction Flow:**

```javascript
async function submitTransaction() {
  // 1. Transaction yapılırken wallet bağlantısı iste
  await ensureWallet(true); // requestAccounts = true
  
  // 2. Transaction gönder
  const tx = await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from: address, to: contractAddress, data: callData }]
  });
  
  return tx;
}
```

**Batch Transactions (EIP-5792):**

```javascript
async function submitBatchTransactions() {
  await ensureWallet(true);
  
  const payload = {
    version: "1.0.0",
    from: address,
    chainId: hexChainId,
    atomicRequired: !isFarcasterMiniApp(), // Platform-specific
    calls: [
      { to: contract1, data: callData1 },
      { to: contract2, data: callData2 }
    ]
  };
  
  const tx = await provider.request({
    method: 'wallet_sendCalls',
    params: [payload]
  });
  
  return tx;
}
```

**Platform-Specific Differences:**
- **Farcaster:** `atomicRequired: false` (sequential execution)
- **Base App:** `atomicRequired: true` (atomic execution)
- **Farcaster:** Paymaster desteği yok
- **Base App:** Paymaster desteği var (ERC-7677)

---

## 🔧 Platform-Specific Implementations

### Wagmi Connector Seçimi

**Farcaster:**
```javascript
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';

const config = createConfig({
  connectors: [miniAppConnector()]
});
```

**Base App:**
```javascript
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { baseAccount } from 'wagmi/connectors';

const config = createConfig({
  connectors: [
    miniAppConnector(), // Base Account'a otomatik bağlanır
    baseAccount({ appName: 'BaseMan', appLogoUrl: '...' }) // Explicit Base Account features
  ]
});
```

**Ortak Nokta:**
- Her iki platform da `farcasterMiniApp()` connector'ını kullanır
- Base App'da ek olarak `baseAccount()` connector'ı da eklenir
- Her iki platform da auto-connect özelliği sağlar

---

### Paymaster Support

**Farcaster:**
- ❌ Paymaster desteği yok (dokümantasyon: "No paymaster support yet")
- ✅ Sequential batch transactions

**Base App:**
- ✅ Paymaster desteği var (ERC-7677)
- ✅ Atomic batch transactions
- ✅ `wallet_getCapabilities` ile capability check

**Ortak Pattern:**
```javascript
// Platform-specific paymaster check
const isFarcaster = isFarcasterMiniApp();
if (!isFarcaster && isPaymasterSupported(provider)) {
  // Base App - paymaster kullan
  payload.capabilities = {
    paymasterService: { url: paymasterUrl }
  };
}
```

---

## 📋 Mevcut BaseMan Implementasyonu

### ✅ Ortak Model Uyumluluğu

**1. SDK Detection:**
- ✅ Merkezi SDK detection utility (`src/utils/sdk-detection.js`)
- ✅ Platform-aware SDK seçimi
- ✅ Fallback mekanizması

**2. Wallet Connection:**
- ✅ `ensureWallet(requestAccounts = false)` fonksiyonu
- ✅ `eth_accounts` ile passive kontrol
- ✅ `eth_requestAccounts` sadece transaction yapılırken
- ✅ Panel açıldığında passkey prompt yok

**3. Wagmi Integration:**
- ✅ Platform-specific connector seçimi
- ✅ Auto-connect desteği
- ✅ Lazy initialization

**4. Transaction Handling:**
- ✅ `wallet_sendCalls` batch transaction desteği
- ✅ Platform-specific atomic batch ayarı
- ✅ Platform-specific paymaster skip

---

## 🎯 Best Practices

### 1. SDK Kullanımı

**✅ Doğru:**
```javascript
// Merkezi SDK detection kullan
const sdk = resolveSDK();
const provider = await sdk.wallet.getEthereumProvider();
```

**❌ Yanlış:**
```javascript
// Platform-specific hardcoded detection
const sdk = window.fc?.miniapp || window.MiniKit;
```

### 2. Wallet Connection

**✅ Doğru:**
```javascript
// Panel açıldığında - passive kontrol
const accounts = await provider.request({ method: 'eth_accounts' });
if (accounts.length) {
  // Bağlantı var - göster
} else {
  // Bağlantı yok - "Not connected" göster
}

// Transaction yapılırken - explicit request
await ensureWallet(true); // requestAccounts = true
```

**❌ Yanlış:**
```javascript
// Panel açıldığında - proactive request (passkey prompt tetikler)
await provider.request({ method: 'eth_requestAccounts' });
```

### 3. SignIn Kullanımı

**✅ Doğru:**
```javascript
// SignIn sadece gerektiğinde (opsiyonel)
const forceSignIn = Boolean(
  window.__ENV?.NEXT_PUBLIC_REQUIRE_SIGNIN === '1' ||
  new URLSearchParams(window.location.search).has('signin')
);
if (forceSignIn) {
  await sdk.actions.signIn({ acceptAuthAddress: true });
}
```

**❌ Yanlış:**
```javascript
// Proactive signIn (passkey prompt tetikler)
await sdk.actions.signIn();
```

### 4. Platform Detection

**✅ Doğru:**
```javascript
// Merkezi platform detection kullan
import { isFarcasterMiniApp, isBaseApp, isMiniAppHost } from '../utils/platform-detection.js';

if (isFarcasterMiniApp()) {
  // Farcaster-specific logic
} else if (isBaseApp()) {
  // Base App-specific logic
}
```

**❌ Yanlış:**
```javascript
// Inline platform detection (tutarsızlık riski)
if (window.fc?.miniapp) {
  // Farcaster
} else if (window.MiniKit) {
  // Base App
}
```

---

## 🔍 Platform Farklılıkları Özeti

| Özellik | Farcaster | Base App | Ortak Model |
|---------|-----------|----------|--------------|
| **SDK Provider** | `sdk.wallet.getEthereumProvider()` | `sdk.wallet.getEthereumProvider()` | ✅ Aynı |
| **Auto-Connect** | ✅ Var | ✅ Var | ✅ Aynı |
| **eth_accounts** | ✅ Desteklenir | ✅ Desteklenir | ✅ Aynı |
| **eth_requestAccounts** | ✅ Desteklenir | ✅ Desteklenir | ✅ Aynı |
| **wallet_sendCalls** | ✅ Desteklenir | ✅ Desteklenir | ✅ Aynı |
| **Wagmi Connector** | `farcasterMiniApp()` | `farcasterMiniApp()` + `baseAccount()` | ⚠️ Farklı |
| **Paymaster** | ❌ Yok | ✅ Var | ⚠️ Farklı |
| **Atomic Batch** | ❌ Sequential | ✅ Atomic | ⚠️ Farklı |
| **Passkey Prompt** | Transaction'da | Transaction'da | ✅ Aynı |

---

## 📖 Dokümantasyon Referansları

### Farcaster
- [Farcaster Mini Apps - Wallets](https://miniapps.farcaster.xyz/docs/guides/wallets)
- [Farcaster Mini Apps - SDK](https://miniapps.farcaster.xyz/docs/sdk/wallet)

### Base App
- [Base Mini Apps - Base Account](https://docs.base.org/mini-apps/core-concepts/base-account)
- [Base Mini Apps - Recommended Onboarding Flow](https://docs.base.org/mini-apps/guides/onboarding)
- [Base Account - Wagmi Integration](https://docs.base.org/base-account/framework-integrations/wagmi)

### Standards
- [EIP-1193: Ethereum Provider API](https://eips.ethereum.org/EIPS/eip-1193)
- [EIP-5792: wallet_sendCalls](https://eip5792.xyz)
- [ERC-7677: Paymaster Service](https://erc7677.xyz)

---

## ✅ Sonuç

**Ortak Entegrasyon Modeli:**

1. ✅ **EIP-1193 Provider API:** Her iki platform da aynı API'yi kullanır
2. ✅ **Otomatik Bağlantı:** Mini app açıldığında otomatik bağlantı
3. ✅ **Progressive Disclosure:** Passkey prompt'ları sadece transaction yapılırken
4. ✅ **Zero-Friction:** Wallet connection flow'u elimine edilir
5. ✅ **Platform-Specific Optimizations:** Paymaster, atomic batch gibi özellikler platform-specific

**Mevcut BaseMan Implementasyonu:**
- ✅ Ortak model'e uyumlu
- ✅ Platform-specific optimizations mevcut
- ✅ Best practices uygulanmış
- ✅ Production-ready

---

**Not:** Bu dokümantasyon, Farcaster ve Base App mobil uygulamaları için ortak cüzdan entegrasyon modelini belirler. Tüm wallet entegrasyonları bu modele uygun olmalıdır.


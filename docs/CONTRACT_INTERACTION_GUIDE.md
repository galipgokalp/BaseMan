# Contract Interaction Guide - Mini App Entegrasyonu

**Tarih:** 2025-01-06  
**Kaynaklar:** 
- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/)
- [Base Mini Apps Docs](https://docs.base.org/)
- [Coinbase Developer Platform Docs](https://docs.cdp.coinbase.com/)

---

## 📋 Özet

Bu dokümantasyon, BaseMan mini app'inin kontrat etkileşim mekanizmasının Farcaster ve Base App dokümanlarına göre nasıl entegre edildiğini açıklar.

---

## 🎯 Kontrat Etkileşim Mekanizması

### 1. Ethereum Provider Alımı

**Farcaster ve Base App'te:**
```javascript
// SDK'dan Ethereum provider al
const sdk = window.resolveSDK(); // Unified SDK detection
const provider = sdk.wallet.getEthereumProvider();

// Provider window.ethereum olarak expose edilir
// (miniapp-ethereum-shim.js tarafından)
```

**Kod:**
- `src/utils/sdk-detection.js` - Unified SDK detection
- `src/miniapp-ethereum-shim.js` - Provider exposure
- `src/onchain-client.js` - Provider usage

### 2. Wallet Bağlantısı

**Otomatik Bağlantı:**
- Farcaster: Otomatik bağlanır, `eth_accounts` kullanılır
- Base App: Otomatik bağlanır, `eth_accounts` kullanılır
- Transaction başlatıldığında `eth_requestAccounts` çağrılır (passkey prompt)

**Kod:**
```javascript
// ensureWallet() fonksiyonu
// - Mini-app: eth_accounts kullan (otomatik bağlantı)
// - Transaction: eth_requestAccounts çağır (kullanıcı onayı)
await ensureWallet(true); // requestAccounts = true for transactions
```

### 3. Contract Call Data Encoding

**Ethers.js ile:**
```javascript
const CONTRACT_ABI = [
  "function submitScore(address player,uint256 score,uint256 deadline,uint256 nonce,bytes signature)",
  "function completeQuest(address player,uint256 questId,uint256 deadline,uint256 nonce,bytes signature)",
];

const contractInterface = new ethers.Interface(CONTRACT_ABI);
const callData = contractInterface.encodeFunctionData("submitScore", [
  address,
  score,
  deadline,
  nonce,
  signature
]);
```

### 4. Transaction Gönderimi (wallet_sendCalls)

**EIP-5792 Standardı:**
```javascript
const result = await provider.request({
  method: 'wallet_sendCalls',
  params: [{
    version: "1.0", // Compatibility version
    from: userAddress,
    chainId: "0x14a34", // Base Sepolia (hex)
    atomicRequired: atomicRequired, // Farcaster: false, Base App: true
    calls: [{
      to: contractAddress,
      data: callData,
      value: "0x0"
    }],
    capabilities: {
      // Paymaster (optional, disabled in sponsorless mode)
      paymasterService: {
        url: paymasterUrl,
        optional: false
      }
    }
  }]
});
```

**Platform Farkları:**

| Platform | Atomic Batch | Version | Paymaster |
|----------|--------------|---------|-----------|
| **Farcaster** | ❌ Sequential | "1.0" | ❌ Not supported |
| **Base App** | ✅ Atomic | "1.0" | ✅ Supported |

### 5. Transaction Status Kontrolü

**wallet_getCallsStatus:**
```javascript
const status = await provider.request({
  method: 'wallet_getCallsStatus',
  params: [callsId]
});

// Status: 'pending' | 'confirmed' | 'rejected'
```

---

## 🔧 Implementation Details

### sendCalls() Fonksiyonu

**Location:** `src/onchain-client.js`

**Functionality:**
1. Validates chainId, address, provider, callData
2. Determines atomicRequired based on platform
3. Builds EIP-5792 compliant payload
4. Sends transaction via wallet_sendCalls
5. Handles errors with detailed logging

**Code:**
```javascript
async function sendCalls(callData, paymasterUrl) {
  // Validate inputs
  const hexChainId = ethers.toBeHex(config.chainId);
  if (!hexChainId) throw new Error('Invalid chainId');
  
  // Platform detection
  const isFarcaster = window.isFarcasterMiniApp();
  const atomicRequired = !isFarcaster; // Farcaster: false, Base App: true
  
  // Build payload
  const payload = {
    version: "1.0",
    from: state.address,
    chainId: hexChainId,
    atomicRequired: atomicRequired,
    calls: [{
      to: config.registryAddress,
      data: callData,
      value: "0x0"
    }]
  };
  
  // Add paymaster if provided
  if (paymasterUrl) {
    payload.capabilities = {
      paymasterService: {
        url: paymasterUrl,
        optional: false
      }
    };
  }
  
  // Send transaction
  const result = await state.provider.request({
    method: 'wallet_sendCalls',
    params: [payload]
  });
  
  return result;
}
```

### getCapabilities() Fonksiyonu

**Location:** `src/onchain-client.js`

**Functionality:**
1. Gets wallet capabilities using wallet_getCapabilities
2. Tries without address first (current account)
3. Falls back to address-specific capabilities
4. Returns capabilities object or null

**Code:**
```javascript
async function getCapabilities(provider, address) {
  // Try without address (current account)
  try {
    const caps = await provider.request({ 
      method: 'wallet_getCapabilities' 
    });
    if (caps) return caps;
  } catch (error) {
    debug(`getCapabilities error: ${error.message}`);
  }
  
  // Try with address if provided
  if (address) {
    try {
      const caps = await provider.request({ 
        method: 'wallet_getCapabilities', 
        params: [address] 
      });
      if (caps) return caps;
    } catch (error) {
      debug(`getCapabilities error (with address): ${error.message}`);
    }
  }
  
  return null;
}
```

### isPaymasterSupported() Fonksiyonu

**Location:** `src/onchain-client.js`

**Functionality:**
1. Checks if paymaster is supported for a given chain
2. Supports multiple capability formats (flat, nested, chain-specific)
3. Returns boolean indicating support

**Code:**
```javascript
function isPaymasterSupported(caps, chainId) {
  // Check global capabilities
  const byFlat = caps?.paymasterService?.supported === true;
  
  // Check nested capabilities
  const byCaps = caps?.capabilities?.paymasterService?.supported === true;
  
  // Check chain-specific capabilities
  const hex = ethers.toBeHex(chainId);
  const byChainId = caps?.[String(chainId)]?.paymasterService?.supported === true;
  
  return byFlat || byCaps || byChainId;
}
```

---

## 📊 Transaction Flow

### 1. Score Submission Flow

```
User → Game Over → submitScore() → 
  → ensureWallet(true) → 
  → requestScoreSignature() → 
  → encodeFunctionData() → 
  → sendCalls(callData, null) → 
  → wallet_sendCalls() → 
  → User Approval → 
  → Transaction On-Chain → 
  → Score Saved → 
  → Leaderboard Updated
```

### 2. Error Handling Flow

```
Transaction Error → 
  → Error Logged → 
  → Debug Logs Updated → 
  → User Notification (future) → 
  → Retry Mechanism (future)
```

---

## 🧪 Test Etme

### 1. Provider Alımı

```javascript
// Browser console'da test et
const sdk = window.resolveSDK();
const provider = sdk.wallet.getEthereumProvider();
console.log('Provider:', provider);
```

### 2. Capabilities Kontrolü

```javascript
// Capabilities al
const caps = await provider.request({
  method: 'wallet_getCapabilities'
});
console.log('Capabilities:', caps);
```

### 3. Transaction Gönderimi

```javascript
// Test transaction
const result = await provider.request({
  method: 'wallet_sendCalls',
  params: [{
    version: "1.0",
    from: address,
    chainId: "0x14a34",
    atomicRequired: false,
    calls: [{
      to: "0x...",
      data: "0x...",
      value: "0x0"
    }]
  }]
});
console.log('Transaction result:', result);
```

### 4. Status Kontrolü

```javascript
// Transaction status kontrol et
const status = await provider.request({
  method: 'wallet_getCallsStatus',
  params: [callsId]
});
console.log('Transaction status:', status);
```

---

## 🔍 Debugging

### Debug Logs

Settings panel'de Debug Logs'u aç:
1. Settings > Debug Logs > View Logs
2. Aşağıdaki event'leri kontrol et:
   - `wallet_sendCalls:start` - Transaction başladı
   - `wallet_sendCalls:success` - Transaction başarılı
   - `wallet_sendCalls:error` - Transaction hatası
   - `getCapabilities` - Capabilities alındı

### Console Logs

Browser console'da:
```javascript
// Debug loglarını gör
console.log('[BaseMan] wallet_sendCalls: ...');
console.error('[BaseMan] Transaction failed:', error);
```

### Transaction Status

```javascript
// Transaction status'u kontrol et
const status = await provider.request({
  method: 'wallet_getCallsStatus',
  params: [transactionId]
});
console.log('Transaction status:', status);
```

---

## 📚 Referanslar

### Farcaster Mini Apps

- **Wallet Integration:** https://miniapps.farcaster.xyz/docs/guides/wallets
- **Ethereum Wallet:** https://miniapps.farcaster.xyz/docs/sdk/actions/ethereum-wallet
- **SDK Reference:** https://miniapps.farcaster.xyz/docs/sdk/reference

### Base Mini Apps

- **Wallet Integration:** https://docs.base.org/base-app/mini-apps/wallet
- **wallet_sendCalls:** https://docs.base.org/base-account/reference/core/provider-rpc-methods/wallet_sendCalls
- **Capabilities:** https://docs.base.org/base-account/reference/core/provider-rpc-methods/wallet_getCapabilities

### Coinbase Developer Platform

- **Paymaster:** https://docs.cdp.coinbase.com/paymaster/introduction/welcome
- **Smart Wallets:** https://docs.cdp.coinbase.com/wallets/server-wallet/v2/introduction

### EIP Standards

- **EIP-5792:** https://eips.ethereum.org/EIPS/eip-5792 (wallet_sendCalls)
- **EIP-1193:** https://eips.ethereum.org/EIPS/eip-1193 (Ethereum Provider API)

---

## ✅ Compliance Checklist

### Farcaster Compliance

- [x] Ethereum provider alımı (`sdk.wallet.getEthereumProvider()`)
- [x] `wallet_sendCalls` kullanımı (EIP-5792)
- [x] Sequential execution (`atomicRequired: false`)
- [x] Version formatı ("1.0")
- [x] Paymaster desteği yok (Farcaster'da desteklenmiyor)

### Base App Compliance

- [x] Ethereum provider alımı (`sdk.wallet.getEthereumProvider()`)
- [x] `wallet_sendCalls` kullanımı (EIP-5792)
- [x] Atomic batch (`atomicRequired: true`)
- [x] Version formatı ("1.0")
- [x] Paymaster desteği (Base App'te destekleniyor, şu anda devre dışı)

### EIP-5792 Compliance

- [x] `wallet_sendCalls` method
- [x] `wallet_getCapabilities` method
- [x] `wallet_getCallsStatus` method
- [x] Payload formatı doğru
- [x] Error handling doğru

---

## 📝 Notlar

- **Version:** "1.0" kullanılıyor (maksimum uyumluluk için)
- **Atomic Batch:** Farcaster'da false, Base App'te true
- **Paymaster:** Sponsorless mode'da devre dışı
- **Error Handling:** Detaylı loglama ve hata mesajları
- **Capabilities:** Dinamik olarak kontrol ediliyor

---

**Son Güncelleme:** 2025-01-06  
**Durum:** Farcaster ve Base App dokümanlarına göre entegre edildi


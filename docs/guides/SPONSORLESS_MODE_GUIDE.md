# Sponsorless Mode Guide - Gas Fee Ödeme Sistemi

**Tarih:** 2025-01-06  
**Durum:** Aktif - Paymaster devre dışı, kullanıcılar gas fee ödüyor

---

## 📋 Özet

BaseMan mini app'i şu anda **sponsorless mode** (sponsorsuz mod) ile çalışıyor. Bu modda:

- ✅ **Paymaster devre dışı**: Kullanıcılar gas fee ödüyor
- ✅ **Base Mainnet**: Kullanıcılar ETH ile gas fee ödüyor
- ✅ **Base Sepolia**: Kullanıcılar Test ETH ile gas fee ödüyor
- ✅ **Farcaster & Base App**: Her iki platformda da çalışıyor
- 🔄 **Paymaster Entegrasyonu**: Gelecekte eklenecek

---

## 🎯 Çalışma Mekanizması

### 1. Oyun Akışı

```
1. Kullanıcı mini app'a girer (Farcaster/Base App)
2. Cüzdan mevcutsa otomatik görünür; aksi halde işlem sırasında onay istenir
3. Kullanıcı oyun oynar
4. Game Over olur
5. submitScore() otomatik olarak çağrılır
6. Transaction gönderilir (wallet_sendCalls, paymaster olmadan)
7. Kullanıcı gas fee ödemesi için onay verir
8. Transaction on-chain'e yazılır
9. Skor kontrata kaydedilir
10. Leaderboard'da görünür
```

### 2. Transaction Gönderimi

**Mini-App Ortamları (Farcaster/Base App):**
- `wallet_sendCalls` kullanılır (EIP-5792)
- Paymaster olmadan gönderilir (`paymasterUrl: null`)
- Kullanıcı gas fee öder

**Platform Farkları:**
- **Farcaster**: Sequential execution (atomic değil), `version: "1.0"`
- **Base App**: Atomic batch destekliyor, `version: "2.0.0"`

### 3. Gas Fee Ödemesi

**Base Mainnet (Chain ID: 8453):**
- Kullanıcılar ETH ile gas fee ödüyor
- Gas fee miktarı: ~0.001-0.01 ETH (network congestion'a göre değişir)

**Base Sepolia (Chain ID: 84532):**
- Kullanıcılar Test ETH ile gas fee ödüyor
- Test ETH ücretsiz (faucet'ten alınabilir)

---

## 🔧 Teknik Detaylar

### submitScore() Fonksiyonu

```javascript
// Sponsorless mode - paymaster devre dışı
debug('submitScore: Submitting transaction WITHOUT paymaster (sponsorless mode - user pays gas fee)');

// Mini-app ortamlarında wallet_sendCalls kullan
if (isMiniAppEnv()) {
  const result = await sendCalls(callData, null); // null = no paymaster
  // Kullanıcı gas fee ödemesi için onay verir
  // Transaction on-chain'e yazılır
}
```

### sendCalls() Fonksiyonu

```javascript
async function sendCalls(callData, paymasterUrl) {
  // paymasterUrl = null (sponsorless mode)
  const isFarcasterMiniApp = Boolean(window.isFarcasterMiniAppSync?.());
  const payload = {
    // Farcaster: "1.0", Base App: "2.0.0"
    version: isFarcasterMiniApp ? "1.0" : "2.0.0",
    from: state.address,
    chainId: hexChainId,
    atomicRequired: !isFarcasterMiniApp,
    calls: [{ 
      to: config.registryAddress, 
      data: callData, 
      value: "0x0" 
    }]
  };
  // capabilities yok (paymaster olmadan)
  
  return await state.provider.request({ 
    method: 'wallet_sendCalls', 
    params: [payload] 
  });
}
```

### Paymaster Discovery Devre Dışı

```javascript
// PAYMASTER DISABLED: Sponsorless mode - users pay gas fee
// Paymaster discovery is disabled until paymaster integration is ready
// try { await discoverPaymasterUrl(provider, config.chainId); } catch (_) {}
debug('Paymaster discovery disabled - sponsorless mode (users pay gas fee)');
```

---

## 📊 Transaction Akışı

### 1. Score Submission

```
User → Game Over → submitScore() → 
  → Signature Request (/api/score-sign) → 
  → Call Data Encoding → 
  → wallet_sendCalls (no paymaster) → 
  → User Approval (gas fee) → 
  → Transaction On-Chain → 
  → Score Saved → 
  → Leaderboard Updated
```

### 2. Error Handling

- **Wallet not connected**: `ensureWallet(true)` çağrılır, kullanıcıdan onay istenir
- **Insufficient gas**: Kullanıcıya gas fee yetersiz hatası gösterilir
- **Transaction failed**: Hata loglanır, kullanıcıya bilgi verilir
- **Network error**: Retry mekanizması yok (kullanıcı tekrar denemeli)

---

## 🧪 Test Etme

### Base Sepolia (Testnet)

1. **Test ETH Al**:
   - Base Sepolia faucet'ten Test ETH al
   - https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

2. **Oyun Oyna**:
   - Mini app'a gir
   - Oyun oyna
   - Game Over ol
   - Gas fee onayı ver (Test ETH ile)

3. **Sonucu Kontrol Et**:
   - Settings > Debug Logs > View Logs
   - `score:submitted:sponsorless` event'ini kontrol et
   - Leaderboard'da skorunu gör

### Base Mainnet

1. **ETH Al**:
   - Cüzdanında Base Mainnet'te ETH olmalı
   - Gas fee için yeterli ETH: ~0.01 ETH

2. **Oyun Oyna**:
   - Mini app'a gir
   - Oyun oyna
   - Game Over ol
   - Gas fee onayı ver (ETH ile)

3. **Sonucu Kontrol Et**:
   - Settings > Debug Logs > View Logs
   - `score:submitted:sponsorless` event'ini kontrol et
   - Leaderboard'da skorunu gör
   - BaseScan'de transaction'ı gör: https://basescan.org/tx/{txHash}

---

## 🐛 Debugging

### Debug Logs

Settings panel'de Debug Logs'u aç:
1. Settings > Debug Logs > View Logs
2. Aşağıdaki event'leri kontrol et:
   - `submitScore:called` - Fonksiyon çağrıldı
   - `score:submission:sponsorless` - Sponsorless mode başladı
   - `wallet_sendCalls:start` - Transaction gönderildi
   - `score:submitted:sponsorless` - Transaction başarılı
   - `score:submission:error` - Hata oluştu

### Console Logs

Browser console'da:
```javascript
// Debug loglarını gör
console.log('[BaseMan] submitScore: Function called');
console.log('[BaseMan] Score submission transaction started: {id}');
console.error('[BaseMan] Score submission failed:', error);
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

## 📈 Gelecek: Paymaster Entegrasyonu

Paymaster entegrasyonu eklendiğinde:

1. **Paymaster Discovery**: Otomatik olarak paymaster URL'i keşfedilecek
2. **Gasless Transactions**: Kullanıcılar gas fee ödemeyecek
3. **Fallback Mechanism**: Paymaster başarısız olursa sponsorless mode'a geçilecek

### Paymaster Entegrasyonu Planı

1. **CDP Portal Setup**:
   - Paymaster'ı etkinleştir
   - Contract'ı allowlist'e ekle
   - Paymaster Service URL'ini al

2. **Environment Variables**:
   - `PAYMASTER_SERVICE_URL` ayarla
   - `CDP_API_KEY_ID` ve `CDP_API_KEY_SECRET` ayarla

3. **Code Changes**:
   - `submitScoreWithPaymaster()` fonksiyonunu etkinleştir
   - Paymaster discovery'i etkinleştir
   - Fallback mekanizmasını test et

---

## ✅ Kontrol Listesi

### Sponsorless Mode Çalışıyor mu?

- [ ] `submitScore()` çağrılıyor mu?
- [ ] `wallet_sendCalls` gönderiliyor mu?
- [ ] Paymaster olmadan gönderiliyor mu? (`paymasterUrl: null`)
- [ ] Kullanıcı gas fee onayı veriyor mu?
- [ ] Transaction on-chain'e yazılıyor mu?
- [ ] Skor kontrata kaydediliyor mu?
- [ ] Leaderboard'da görünüyor mu?

### Debug Logs

- [ ] `score:submission:sponsorless` event'i görünüyor mu?
- [ ] `wallet_sendCalls:start` event'i görünüyor mu?
- [ ] `score:submitted:sponsorless` event'i görünüyor mu?
- [ ] Hata event'leri var mı? (`score:submission:error`)

### Transaction Status

- [ ] Transaction ID alındı mı?
- [ ] Transaction status kontrol edildi mi?
- [ ] Transaction başarılı mı? (`status: 'CONFIRMED'`)

---

## 🔗 İlgili Dokümanlar

- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/)
- [Base Mini Apps Docs](https://docs.base.org/)
- [Coinbase Developer Platform Docs](https://docs.cdp.coinbase.com/)
- [Score Submission Flow](./SCORE_SUBMISSION_FLOW.md)
- [Score Submission Debug Guide](./SCORE_SUBMISSION_DEBUG_GUIDE.md)
- [Paymaster System Analysis](./PAYMASTER_SYSTEM_ANALYSIS.md)

---

## 📝 Notlar

- **Sponsorless mode**: Şu anda aktif, kullanıcılar gas fee ödüyor
- **Paymaster entegrasyonu**: Gelecekte eklenecek
- **Gas fee miktarı**: Network congestion'a göre değişir
- **Test ETH**: Base Sepolia faucet'ten alınabilir
- **Transaction fees**: Base Mainnet'te çok düşük (~$0.01-0.10)

---

**Son Güncelleme:** 2025-01-06  
**Durum:** Sponsorless mode aktif, paymaster devre dışı

# Score Submission Debug Guide - Skor Neden Kontratta Görünmüyor?

**Tarih:** 2025-01-06  
**Sorun:** Oyun oynadığımda skorum kontratta görünmüyor

---

## 🔍 Sorun Tespiti

Skorun kontratta görünmemesinin birkaç nedeni olabilir. Bu rehber, sorunu tespit etmek ve çözmek için adım adım kontrol listesi sunar.

---

## 📋 Kontrol Listesi

### 1. Wallet Bağlantısı Kontrolü

**Kontrol:**
- [ ] Wallet panelinde "Connected" durumu görünüyor mu?
- [ ] Wallet adresi görünüyor mu?
- [ ] Network bilgisi doğru mu? (Base Sepolia veya Base Mainnet)

**Nasıl Kontrol Edilir:**
1. Mini app'i aç
2. Bottom Navigation Bar'dan Wallet ikonuna tıkla
3. "Connection Status: Connected" görünüyor mu?
4. Wallet adresi görünüyor mu? (örn: 0x1234...5678)

**Sorun Varsa:**
- ❌ Wallet bağlı değilse score submission çalışmaz
- ✅ Wallet'ı bağlamak için bir transaction yap (score submission otomatik olarak wallet'ı bağlar)

---

### 2. Score Submission Tetikleniyor mu?

**Kontrol:**
- [ ] Game Over olduğunda `submitScore()` çağrılıyor mu?
- [ ] Console'da "submitScore" log'ları var mı?

**Nasıl Kontrol Edilir:**
1. Browser console'u aç (F12 veya Developer Tools)
2. Oyun oyna ve Game Over ol
3. Console'da şu log'ları ara:
   - `[BaseMan] submitScore called`
   - `[BaseMan] submitScore error: ...`
   - `[BaseMan] score-sign succeeded: ...`
   - `[BaseMan] Paymaster-backed submission started (id: ...)`

**Sorun Varsa:**
- ❌ Console'da "submitScore" log'u yoksa → `submitScore()` çağrılmıyor
- ❌ Console'da "submitScore error" varsa → Hata mesajını kontrol et

---

### 3. Backend Signature Kontrolü

**Kontrol:**
- [ ] Backend'den signature alınıyor mu?
- [ ] Backend hatası var mı?

**Nasıl Kontrol Edilir:**
1. Browser console'u aç
2. Network tab'ını aç (F12 → Network)
3. Oyun oyna ve Game Over ol
4. `/api/score-signature` request'ini kontrol et
5. Response'u kontrol et:
   - Status: 200 OK → Başarılı
   - Status: 400/401/500 → Hata var

**Sorun Varsa:**
- ❌ Status: 401 → Mini App auth token eksik/geçersiz
- ❌ Status: 400 → Invalid payload (score, durationMs, chain)
- ❌ Status: 429 → Rate limit exceeded
- ❌ Status: 500 → Backend hatası

**Console Log'ları:**
- `score-sign succeeded: ...` → Başarılı
- `score-sign failed: ...` → Başarısız (hata mesajını kontrol et)

---

### 4. Transaction Gönderimi Kontrolü

**Kontrol:**
- [ ] Transaction gönderiliyor mu?
- [ ] Transaction hash alınıyor mu?
- [ ] Transaction onaylanıyor mu?

**Nasıl Kontrol Edilir:**
1. Browser console'u aç
2. Oyun oyna ve Game Over ol
3. Console'da şu log'ları ara:
   - `wallet_sendCalls request sent. id=...`
   - `Paymaster-backed submission started (id: ...)`
   - `submitScore tx: 0x...`

**Sorun Varsa:**
- ❌ Transaction gönderilmiyor → Wallet bağlantısı veya provider problemi
- ❌ Transaction hash yok → Transaction başarısız
- ❌ Transaction onaylanmıyor → Kullanıcı passkey'i onaylamamış olabilir

---

### 5. Passkey Prompt Kontrolü

**Kontrol:**
- [ ] Passkey prompt'u görünüyor mu?
- [ ] Kullanıcı passkey'i onaylıyor mu?

**Nasıl Kontrol Edilir:**
1. Oyun oyna ve Game Over ol
2. Passkey prompt'u görünüyor mu?
3. Passkey'i onayla
4. Transaction onaylanıyor mu?

**Sorun Varsa:**
- ❌ Passkey prompt'u görünmüyor → Wallet bağlantısı problemi
- ❌ Passkey'i onaylamıyorsa → Transaction onaylanmaz, score yazılmaz
- ❌ Passkey'i onayladıktan sonra hata → Transaction başarısız

---

### 6. Kontrat State Kontrolü

**Kontrol:**
- [ ] Score kontratta yazılıyor mu?
- [ ] Profile panelinde score görünüyor mu?
- [ ] Leaderboard'da score görünüyor mu?

**Nasıl Kontrol Edilir:**
1. Profile panelini aç
2. "Total Score" değerini kontrol et
3. Leaderboard panelini aç
4. Kendi skorunu kontrol et
5. Blockchain explorer'da kontrol et:
   - Base Sepolia: https://sepolia.basescan.org
   - Base Mainnet: https://basescan.org

**Sorun Varsa:**
- ❌ Profile panelinde score yok → Score kontratta yazılmamış
- ❌ Leaderboard'da score yok → Score kontratta yazılmamış
- ❌ Blockchain explorer'da transaction yok → Transaction gönderilmemiş

---

## 🐛 Yaygın Sorunlar ve Çözümleri

### Sorun 1: Wallet Bağlı Değil

**Belirtiler:**
- Wallet panelinde "Not connected" görünüyor
- Console'da "Wallet connection required" hatası

**Çözüm:**
1. Wallet panelini aç
2. Wallet'ın bağlı olduğundan emin ol
3. Bir transaction yap (score submission otomatik olarak wallet'ı bağlar)

---

### Sorun 2: Backend Signature Hatası

**Belirtiler:**
- Console'da "score-sign failed: ..." hatası
- Network tab'ında `/api/score-signature` request'i başarısız

**Olası Nedenler:**
1. **Mini App Auth Token Eksik:**
   - Mini app auth token yüklenmemiş
   - Token geçersiz veya süresi dolmuş

2. **Rate Limit:**
   - Çok fazla request gönderilmiş
   - Rate limit'e takılmış

3. **Invalid Payload:**
   - Score çok düşük (minimum threshold)
   - Score çok yüksek (maximum threshold)
   - Duration çok kısa (minimum duration)

**Çözüm:**
1. Console'da hata mesajını kontrol et
2. Backend log'larını kontrol et
3. Rate limit'i bekle (birkaç dakika)
4. Score ve duration değerlerini kontrol et

---

### Sorun 3: Transaction Başarısız

**Belirtiler:**
- Console'da "submitScore error: ..." hatası
- Transaction hash yok
- Passkey prompt'u görünmüyor

**Olası Nedenler:**
1. **Wallet Bağlantısı:**
   - Wallet bağlı değil
   - Provider mevcut değil

2. **Transaction Revert:**
   - Kontrat paused
   - Signature geçersiz
   - Deadline expired

3. **Network Hatası:**
   - Network bağlantısı yok
   - RPC endpoint çalışmıyor

**Çözüm:**
1. Console'da hata mesajını kontrol et
2. Wallet bağlantısını kontrol et
3. Network bağlantısını kontrol et
4. Kontrat durumunu kontrol et (paused değil mi?)

---

### Sorun 4: Passkey Onaylanmıyor

**Belirtiler:**
- Passkey prompt'u görünüyor
- Kullanıcı passkey'i onaylamıyor veya iptal ediyor

**Çözüm:**
1. Passkey prompt'unu onayla
2. Transaction onaylandıktan sonra score yazılır
3. Passkey'i iptal edersen score yazılmaz

---

### Sorun 5: Kontrat Paused

**Belirtiler:**
- Transaction revert oluyor
- Console'da "PausedError" hatası

**Çözüm:**
1. Kontrat durumunu kontrol et
2. Kontrat paused ise score yazılamaz
3. Kontrat admin'i ile iletişime geç

---

## 🔧 Debug Adımları

### Adım 1: Console Log'larını Kontrol Et

**Komut:**
```javascript
// Browser console'da çalıştır
console.log('[BaseMan] Debug Info:', {
  walletReady: window.BaseManOnchain?.isWalletReady?.(),
  walletAddress: window.BaseManOnchain?.getWalletAddress?.(),
  chainId: window.BaseManOnchainConfig?.chainId,
  registryAddress: window.BaseManOnchainConfig?.registryAddress
});
```

**Beklenen Çıktı:**
```javascript
{
  walletReady: true,
  walletAddress: "0x1234...5678",
  chainId: 84532,
  registryAddress: "0x..."
}
```

---

### Adım 2: Score Submission'ı Manuel Test Et

**Komut:**
```javascript
// Browser console'da çalıştır
if (window.BaseManOnchain && window.BaseManOnchain.submitScore) {
  window.BaseManOnchain.submitScore().then(() => {
    console.log('Score submission completed');
  }).catch((error) => {
    console.error('Score submission failed:', error);
  });
} else {
  console.error('submitScore function not available');
}
```

**Beklenen Çıktı:**
- Başarılı: `Score submission completed`
- Başarısız: `Score submission failed: ...` (hata mesajını kontrol et)

---

### Adım 3: Backend Signature'ı Manuel Test Et

**Komut:**
```javascript
// Browser console'da çalıştır
const address = window.BaseManOnchain?.getWalletAddress?.();
const score = window.getScore?.() || 1000;
const chainKey = window.BaseManOnchainConfig?.chainId === 8453 ? 'base' : 'base-sepolia';

fetch('/api/score-signature', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    playerAddress: address,
    score: score.toString(),
    durationMs: 60000,
    level: 1,
    chain: chainKey
  })
})
.then(res => res.json())
.then(data => {
  console.log('Backend signature response:', data);
})
.catch(error => {
  console.error('Backend signature error:', error);
});
```

**Beklenen Çıktı:**
- Başarılı: `{ signature: "0x...", deadline: 1234567890, ... }`
- Başarısız: `{ error: "..." }` (hata mesajını kontrol et)

---

### Adım 4: Kontrat State'ini Kontrol Et

**Komut:**
```javascript
// Browser console'da çalıştır
const address = window.BaseManOnchain?.getWalletAddress?.();
const registryAddress = window.BaseManOnchainConfig?.registryAddress;

if (address && registryAddress && window.sdk && window.ethers) {
  window.sdk.wallet.getEthereumProvider().then(provider => {
    const browser = new window.ethers.BrowserProvider(provider);
    const contract = new window.ethers.Contract(registryAddress, [
      'function getScore(address player) view returns (tuple(uint256 highScore,uint256 totalScore,uint256 lastUpdatedAt))'
    ], browser);
    
    contract.getScore(address).then(result => {
      console.log('Contract score:', {
        highScore: result.highScore.toString(),
        totalScore: result.totalScore.toString(),
        lastUpdatedAt: new Date(Number(result.lastUpdatedAt) * 1000).toISOString()
      });
    }).catch(error => {
      console.error('Contract read error:', error);
    });
  });
}
```

**Beklenen Çıktı:**
- Başarılı: `{ highScore: "1000", totalScore: "5000", lastUpdatedAt: "2025-01-06T..." }`
- Başarısız: `Contract read error: ...` (hata mesajını kontrol et)

---

## 📊 Debug Checklist

### Score Submission Öncesi
- [ ] Wallet bağlı mı? (`walletReady: true`)
- [ ] Wallet adresi var mı? (`walletAddress: "0x..."`)
- [ ] Network doğru mu? (`chainId: 84532` veya `8453`)
- [ ] Registry address var mı? (`registryAddress: "0x..."`)

### Score Submission Sırasında
- [ ] `submitScore()` çağrılıyor mu? (Console log)
- [ ] Backend signature alınıyor mu? (Network tab)
- [ ] Transaction gönderiliyor mu? (Console log)
- [ ] Passkey prompt'u görünüyor mu?
- [ ] Transaction onaylanıyor mu? (Console log)

### Score Submission Sonrasında
- [ ] Transaction hash alınıyor mu? (Console log)
- [ ] Transaction on-chain'e yazılıyor mu? (Blockchain explorer)
- [ ] Score kontratta yazılıyor mu? (Profile panel)
- [ ] Leaderboard'da score görünüyor mu?

---

## 🚨 Acil Durumlar

### Durum 1: Hiçbir Log Yok

**Sorun:**
- Console'da hiçbir log yok
- `submitScore()` çağrılmıyor

**Çözüm:**
1. `overState.init` patch'lenmiş mi kontrol et
2. `patchStateHooks()` fonksiyonu çalışıyor mu kontrol et
3. Oyun state'leri yüklenmiş mi kontrol et

---

### Durum 2: Backend Hatası

**Sorun:**
- Backend'den signature alınamıyor
- Backend hata döndürüyor

**Çözüm:**
1. Backend log'larını kontrol et
2. Backend environment variables'ı kontrol et
3. Backend servisinin çalıştığından emin ol

---

### Durum 3: Transaction Hiç Gönderilmiyor

**Sorun:**
- Transaction gönderilmiyor
- Transaction hash yok

**Çözüm:**
1. Wallet bağlantısını kontrol et
2. Provider'ı kontrol et
3. Network bağlantısını kontrol et

---

## 📝 Log Toplama

### Console Log'ları

**Ne Toplanmalı:**
- Tüm `[BaseMan]` log'ları
- Tüm `submitScore` log'ları
- Tüm `score-sign` log'ları
- Tüm hata mesajları

**Nasıl Toplanır:**
1. Browser console'u aç
2. Log'ları kopyala
3. Hata mesajlarını not et

---

### Network Log'ları

**Ne Toplanmalı:**
- `/api/score-signature` request'leri
- Response'lar (status, body)
- Hata mesajları

**Nasıl Toplanır:**
1. Browser console'u aç
2. Network tab'ını aç
3. Request'leri filtrele (`score-signature`)
4. Request/Response'ları kopyala

---

## 🔗 İlgili Dokümanlar

- [Score Submission Flow](./SCORE_SUBMISSION_FLOW.md)
- [User Experience Flow](./USER_EXPERIENCE_FLOW.md)
- [Wallet Connection Status Analysis](./WALLET_CONNECTION_STATUS_ANALYSIS.md)
- [Debug Guide](./DEBUG_GUIDE.md)

---

## ✅ Sonuç

Skorun kontratta görünmemesinin birkaç nedeni olabilir. Bu rehber, sorunu tespit etmek ve çözmek için adım adım kontrol listesi sunar.

**En Yaygın Nedenler:**
1. Wallet bağlı değil
2. Backend signature hatası
3. Transaction başarısız
4. Passkey onaylanmıyor
5. Kontrat paused

**Çözüm:**
1. Console log'larını kontrol et
2. Network log'larını kontrol et
3. Wallet bağlantısını kontrol et
4. Backend log'larını kontrol et
5. Blockchain explorer'da transaction'ı kontrol et

---

**Not:** Bu rehber, skorun kontratta görünmemesinin nedenlerini tespit etmek ve çözmek için kapsamlı bir kontrol listesi sunar. Sorun devam ederse, log'ları toplayıp destek ekibiyle paylaşın.


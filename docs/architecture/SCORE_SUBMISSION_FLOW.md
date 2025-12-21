# Score Submission Flow - Kontrata Yazılış Süreci

**Tarih:** 2025-01-06  
**Soru:** Oyun oynayıp Game Over olan birisinin skoru kontrata yazılıyor mu?

---

## ✅ Kısa Cevap

**Evet, Game Over olduğunda skor otomatik olarak kontrata yazılır.**

Ancak bu işlem **asenkron** olarak çalışır ve bazı durumlarda başarısız olabilir.

---

## 🔄 Score Submission Süreci

### 1. Game Over Tetikleme

**Ne Zaman Tetiklenir:**
- ✅ **Game Over:** Tüm canlar bittiğinde (`overState.init`)
- ✅ **Level Tamamlandı:** Level tamamlandığında (`finishState.init`)

**Kod Akışı:**
```javascript
// src/onchain-client.js - patchStateHooks()
patchInit(window.overState, "_patchedForOnchain", submitScore, "overState.init");
patchInit(window.finishState, "_patchedForOnchainFinish", submitScore, "finishState.init");
```

**Açıklama:**
- `overState.init` çağrıldığında `submitScore()` otomatik olarak çağrılır
- `finishState.init` çağrıldığında `submitScore()` otomatik olarak çağrılır
- Bu patch'leme işlemi `patchStateHooks()` fonksiyonu tarafından yapılır

---

### 2. Score Submission Fonksiyonu

**Fonksiyon:** `submitScore()`

**Adımlar:**
1. ✅ Score kontrolü (score > 0)
2. ✅ Wallet bağlantısı (`ensureWallet(true)`)
3. ✅ Backend'den signature istenir (`/api/score-signature`)
4. ✅ Transaction oluşturulur
5. ✅ Transaction gönderilir (paymaster veya normal)
6. ✅ Transaction onaylanır
7. ✅ Score kontrata yazılır

**Kod:**
```javascript
async function submitScore() {
  if (state.submitting) return; // Zaten submitting ise skip
  if (typeof window.getScore !== "function") return;
  
  const score = BigInt(window.getScore());
  if (score <= 0n) return; // Score 0 ise skip
  
  try {
    state.submitting = true;
    
    // 1. Wallet bağlantısı
    await ensureWallet(true);
    if (!state.address) {
      throw new Error("Wallet connection required");
    }
    
    // 2. Backend'den signature istenir
    const { signature, deadline, score: signedScore, nonce } = await requestScoreSignature(
      score,
      durationMs
    );
    
    // 3. Transaction oluşturulur
    const callData = contractInterface.encodeFunctionData("submitScore", [
      state.address,
      scoreValue,
      deadlineValue,
      nonceValue,
      signature
    ]);
    
    // 4. Transaction gönderilir (paymaster veya normal)
    const paymasterResult = await submitScoreWithPaymaster(callData);
    
    // 5. Başarılı olursa score kontrata yazılır
    if (paymasterResult) {
      // Transaction başarılı
      return;
    }
  } catch (error) {
    debug(`submitScore error: ${error?.message || error}`);
  } finally {
    state.submitting = false;
    state.runStartedAt = null;
  }
}
```

---

### 3. Kontrat Fonksiyonu

**Kontrat:** `BaseManRegistry.sol`

**Fonksiyon:** `submitScore()`

**Ne Yapar:**
1. ✅ Signature doğrulanır
2. ✅ Replay attack kontrolü yapılır
3. ✅ Score `totalScore`'a eklenir
4. ✅ Eğer yeni high score ise `highScore` güncellenir
5. ✅ Event'ler emit edilir

**Kod:**
```solidity
function submitScore(
    address player,
    uint256 score,
    uint256 deadline,
    uint256 nonce,
    bytes calldata signature
) external whenNotPaused {
    // 1. Signature doğrulanır
    if (block.timestamp > deadline) revert ExpiredSignature();
    if (player != msg.sender) revert InvalidSignature();
    
    bytes32 digest = _hashTypedDataV4(
        keccak256(abi.encode(SCORE_TYPEHASH, player, score, deadline, nonce))
    );
    if (usedRequests[digest]) revert Replay();
    if (!_verifyAuthorizer(digest, signature)) revert InvalidSignature();
    usedRequests[digest] = true;
    
    // 2. Score kontrata yazılır
    Score storage current = _scores[player];
    current.totalScore += score; // Total score'a eklenir
    current.lastUpdatedAt = block.timestamp;
    emit ScoreAdded(player, score, current.totalScore, block.timestamp);
    
    // 3. High score güncellenir (eğer yeni high score ise)
    if (score > current.highScore) {
        current.highScore = score;
        emit ScoreSubmitted(player, score, block.timestamp);
    }
}
```

---

## ⚠️ Başarısız Olabilecek Durumlar

### 1. Wallet Bağlantısı Yok

**Durum:**
- Wallet bağlı değilse
- `ensureWallet(true)` başarısız olursa
- Kullanıcı passkey'i onaylamazsa

**Sonuç:**
- ❌ Score kontrata yazılmaz
- ⚠️ Hata loglanır (`debug()` ile)
- ⚠️ Kullanıcıya görsel hata mesajı gösterilmez

### 2. Backend Signature Hatası

**Durum:**
- Backend'den signature alınamazsa
- Backend rate limit'e takılırsa
- Backend hata dönerse

**Sonuç:**
- ❌ Score kontrata yazılmaz
- ⚠️ Hata loglanır
- ⚠️ Kullanıcıya görsel hata mesajı gösterilmez

### 3. Transaction Başarısız

**Durum:**
- Transaction onaylanmazsa
- Transaction revert olursa
- Network hatası olursa

**Sonuç:**
- ❌ Score kontrata yazılmaz
- ⚠️ Hata loglanır
- ⚠️ Kullanıcıya görsel hata mesajı gösterilmez

### 4. Kontrat Paused

**Durum:**
- Kontrat paused durumunda ise

**Sonuç:**
- ❌ Score kontrata yazılmaz
- ⚠️ Transaction revert olur
- ⚠️ Hata loglanır

---

## ✅ Başarılı Durumlar

### 1. Normal Akış

**Durum:**
- Wallet bağlı
- Backend signature döner
- Transaction başarılı
- Kontrat paused değil

**Sonuç:**
- ✅ Score kontrata yazılır
- ✅ `totalScore` güncellenir
- ✅ Eğer yeni high score ise `highScore` güncellenir
- ✅ Event'ler emit edilir

### 2. Paymaster ile (Base App)

**Durum:**
- Base App'de oynuyor
- Paymaster destekleniyor
- Transaction başarılı

**Sonuç:**
- ✅ Score kontrata yazılır (gasless)
- ✅ Kullanıcı gas ödemez
- ✅ Transaction hızlı onaylanır

### 3. Normal Transaction (Farcaster)

**Durum:**
- Farcaster'da oynuyor
- Paymaster yok
- Transaction başarılı

**Sonuç:**
- ✅ Score kontrata yazılır
- ⚠️ Kullanıcı gas öder
- ✅ Transaction onaylanır

---

## 📊 Score Submission Durumu

### Başarılı Submission

**Kontrat State:**
- ✅ `_scores[player].totalScore` artar
- ✅ `_scores[player].lastUpdatedAt` güncellenir
- ✅ Eğer yeni high score ise `_scores[player].highScore` güncellenir

**Event'ler:**
- ✅ `ScoreAdded(player, score, totalScore, timestamp)` emit edilir
- ✅ Eğer yeni high score ise `ScoreSubmitted(player, score, timestamp)` emit edilir

**Blockchain:**
- ✅ Transaction on-chain'e yazılır
- ✅ Transaction hash alınır
- ✅ Transaction confirm edilir

### Başarısız Submission

**Kontrat State:**
- ❌ Score kontrata yazılmaz
- ❌ `totalScore` güncellenmez
- ❌ `highScore` güncellenmez

**Event'ler:**
- ❌ Event emit edilmez

**Blockchain:**
- ❌ Transaction on-chain'e yazılmaz
- ❌ Transaction hash alınamaz

**Kullanıcı:**
- ⚠️ Hata mesajı gösterilmez (sadece console'da loglanır)
- ⚠️ Score kaybolur (bir daha gönderilmez)

---

## 🔍 Kontrol Yöntemleri

### 1. Console Log Kontrolü

**Kod:**
```javascript
// Browser console'da kontrol et
console.log('[BaseMan] submitScore called');
console.log('[BaseMan] submitScore error:', error);
```

**Ne Aranmalı:**
- ✅ `submitScore tx: 0x...` → Transaction başarılı
- ❌ `submitScore error: ...` → Transaction başarısız

### 2. Blockchain Explorer Kontrolü

**Base Sepolia:**
- https://sepolia.basescan.org
- Transaction hash'i kontrol et
- Kontrat state'ini kontrol et

**Base Mainnet:**
- https://basescan.org
- Transaction hash'i kontrol et
- Kontrat state'ini kontrol et

### 3. Kontrat State Kontrolü

**Kontrat Fonksiyonları:**
- `getScore(address player)` → Player'ın total score'unu döndürür
- `getHighScore(address player)` → Player'ın high score'unu döndürür
- `getLastUpdatedAt(address player)` → Son güncelleme zamanını döndürür

---

## 📋 Özet

### Score Submission

**Otomatik mi?**
- ✅ Evet, Game Over olduğunda otomatik olarak tetiklenir

**Başarılı mı?**
- ✅ Çoğu durumda başarılı (wallet bağlı, backend çalışıyor, transaction onaylanıyor)

**Başarısız olabilir mi?**
- ⚠️ Evet, bazı durumlarda başarısız olabilir:
  - Wallet bağlantısı yok
  - Backend hatası
  - Transaction başarısız
  - Kontrat paused

**Kullanıcı Bilgilendirilir mi?**
- ❌ Hayır, başarısız durumlarda kullanıcıya görsel hata mesajı gösterilmez
- ⚠️ Sadece console'da loglanır

### İyileştirme Önerileri

1. **Hata Mesajları:**
   - Kullanıcıya görsel hata mesajı göster
   - Başarısız submission'ları retry et
   - Hata durumlarını logla

2. **Success Feedback:**
   - Başarılı submission'da kullanıcıya bilgi ver
   - Transaction hash'ini göster
   - Leaderboard'u otomatik refresh et

3. **Retry Mekanizması:**
   - Başarısız submission'ları otomatik retry et
   - Exponential backoff kullan
   - Max retry sayısı belirle

---

## 🔗 İlgili Dokümanlar

- [User Experience Flow](./USER_EXPERIENCE_FLOW.md)
- [Wallet Connection Status Analysis](./WALLET_CONNECTION_STATUS_ANALYSIS.md)
- [Base App Wallet Connection Guide](./BASE_APP_WALLET_CONNECTION_GUIDE.md)

---

**Not:** Bu dokümantasyon, Game Over olduğunda score submission'ın nasıl çalıştığını ve kontrata yazılıp yazılmadığını açıklar. Score submission otomatik olarak tetiklenir ancak bazı durumlarda başarısız olabilir.


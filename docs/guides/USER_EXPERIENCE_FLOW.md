# BaseMan Mini App - Kullanıcı Deneyimi Akışı

**Tarih:** 2025-01-06  
**Kapsam:** Cüzdan bağlı kullanıcının oyun oynarken yaşadığı deneyim

---

## 🎮 Genel Bakış

BaseMan, Farcaster ve Base App mobil uygulamalarında çalışan bir Pac-Man mini app'idir. Kullanıcılar cüzdanlarını bağlayarak oyun oynayabilir ve skorlarını on-chain'e kaydedebilirler.

---

## 📱 1. Mini App Açılışı

### 1.1. İlk Açılış (Farcaster/Base App)

**Kullanıcı Deneyimi:**
1. ✅ Kullanıcı Farcaster veya Base App'den mini app'ı açar
2. ✅ Mini app otomatik olarak yüklenir
3. ✅ **Wallet otomatik olarak bağlanır** (passkey/onay prompt'u yok)
4. ✅ Ana menü görüntülenir

**Teknik Detaylar:**
- Mini app açıldığında `sdk.wallet.getEthereumProvider()` çağrılır
- `eth_accounts` ile mevcut bağlantı kontrol edilir (passive, no prompt)
- Wallet otomatik olarak bağlanır (kullanıcı etkileşimi olmadan)
- Arka planda wallet hazırlığı yapılır

**Kullanıcı Görür:**
- Ana menü ekranı
- Oyun seçenekleri (Pac-Man, Ms. Pac-Man, Cookie, Otto)
- Bottom Navigation Bar (Home, Leaderboard, Profile, Wallet, Settings)

**Kullanıcı Görmez:**
- ❌ Wallet connection prompt'u
- ❌ Passkey prompt'u
- ❌ Connect button
- ❌ Wallet setup ekranı

---

## 🎯 2. Oyun Başlatma

### 2.1. Oyun Seçimi

**Kullanıcı Deneyimi:**
1. ✅ Kullanıcı ana menüden oyun seçer (Pac-Man, Ms. Pac-Man, Cookie, Otto)
2. ✅ Oyun modu seçilir (Normal veya Turbo)
3. ✅ Oyun başlar

**Teknik Detaylar:**
- Oyun seçildiğinde `newGameState.init()` çağrılır
- `handleRunStart()` fonksiyonu tetiklenir
- Wallet bağlantısı kontrol edilir (panel açılmadığı için passkey yok)
- Oyun durumu sıfırlanır (score, level, lives)

**Kullanıcı Görür:**
- Oyun seçim menüsü
- Oyun başlangıç ekranı ("PLAYER ONE")
- Ready ekranı (4 saniye bekler)

**Kullanıcı Görmez:**
- ❌ Wallet connection prompt'u
- ❌ Passkey prompt'u
- ❌ Transaction prompt'u

---

## 🎮 3. Oyun Oynama

### 3.1. Normal Oyun Akışı

**Kullanıcı Deneyimi:**
1. ✅ Kullanıcı Pac-Man'i kontrol eder (yön tuşları/swipe)
2. ✅ Puan toplar (dots, fruits, ghosts)
3. ✅ Level tamamlar
4. ✅ Yeni level'a geçer
5. ✅ Oyun devam eder

**Teknik Detaylar:**
- Oyun state'i `playState` olur
- Score lokal olarak tutulur (`scores` array)
- High score lokal olarak güncellenir
- Wallet bağlantısı kontrol edilmez (oyun sırasında)

**Kullanıcı Görür:**
- Oyun ekranı
- Anlık score
- High score
- Level bilgisi
- Lives (can sayısı)
- Fruit, dots, ghosts

**Kullanıcı Görmez:**
- ❌ Wallet connection prompt'u
- ❌ Transaction prompt'u
- ❌ On-chain işlemler

---

## 🏁 4. Oyun Bitişi ve Score Submission

### 4.1. Oyun Bitirme

**Kullanıcı Deneyimi:**
1. ✅ Kullanıcı oyunu bitirir (tüm canlar bittiğinde)
2. ✅ Game Over ekranı görüntülenir
3. ✅ Final score gösterilir
4. ✅ Score submission başlar (otomatik)

**Teknik Detaylar:**
- Oyun bitişinde `overState.init()` çağrılır
- `submitScore()` fonksiyonu tetiklenir
- Wallet bağlantısı kontrol edilir (`ensureWallet(true)`)
- İlk transaction'da passkey prompt'u görünebilir

### 4.2. Score Submission Süreci

**Kullanıcı Deneyimi:**

#### İlk Transaction (Passkey Prompt)
1. ✅ Kullanıcı oyunu bitirir
2. ⚠️ **Passkey prompt'u görünür** (ilk transaction için)
3. ✅ Kullanıcı passkey'i onaylar
4. ✅ Transaction gönderilir
5. ✅ Score on-chain'e kaydedilir
6. ✅ Başarı mesajı gösterilir

#### Sonraki Transaction'lar (Passkey Olabilir)
1. ✅ Kullanıcı oyunu bitirir
2. ⚠️ **Passkey prompt'u görünebilir** (her transaction için - Base Account güvenlik)
3. ✅ Kullanıcı passkey'i onaylar
4. ✅ Transaction gönderilir
5. ✅ Score on-chain'e kaydedilir

**Teknik Detaylar:**
- `submitScore()` fonksiyonu çağrılır
- `ensureWallet(true)` ile wallet bağlantısı istenir
- `eth_requestAccounts` çağrılır (kullanıcı transaction başlattığı için)
- Backend'den signature istenir (`/api/score-signature`)
- Transaction oluşturulur (`wallet_sendCalls` veya `eth_sendTransaction`)
- Paymaster kullanılır (Base App'de gasless transaction)
- Transaction onaylanır ve on-chain'e kaydedilir

**Platform Farklılıkları:**
- **Base App:** Paymaster desteklenir (gasless transaction)
- **Farcaster:** Paymaster desteklenmez (normal transaction)
- **Base App:** Atomic batch transactions
- **Farcaster:** Sequential batch transactions

**Kullanıcı Görür:**
- Game Over ekranı
- Final score
- Passkey prompt'u (ilk transaction için)
- Transaction onay ekranı (platform tarafından)
- Başarı mesajı (transaction başarılı olduğunda)

**Kullanıcı Görmez:**
- ❌ Transaction detayları (platform tarafından handle edilir)
- ❌ Gas fee (Base App'de paymaster kullanılıyor)
- ❌ Blockchain işlemleri

---

## 💰 5. Wallet Panel

### 5.1. Wallet Panel Açılışı

**Kullanıcı Deneyimi:**
1. ✅ Kullanıcı Bottom Navigation Bar'dan Wallet ikonuna tıklar
2. ✅ Wallet panel açılır
3. ✅ Wallet bilgileri gösterilir

**Teknik Detaylar:**
- Wallet panel açıldığında `wallet-panel.js` → `refresh()` çağrılır
- `isWalletReady()` kontrol edilir
- `getWalletAddress()` ile adres alınır
- Balance'lar alınır (ETH, USDC)
- Network bilgisi gösterilir

**Kullanıcı Görür:**
- Connection Status: "Connected" veya "Not connected"
- Wallet Address: Kısaltılmış adres (örn: 0x1234...5678)
- Network: Base Sepolia veya Base Mainnet
- ETH Balance: ETH bakiyesi
- USDC Balance: USDC bakiyesi

**Kullanıcı Görmez:**
- ❌ Passkey prompt'u (panel açıldığında)
- ❌ Wallet connection prompt'u
- ❌ Transaction prompt'u

---

## 📊 6. Leaderboard Panel

### 6.1. Leaderboard Panel Açılışı

**Kullanıcı Deneyimi:**
1. ✅ Kullanıcı Bottom Navigation Bar'dan Leaderboard ikonuna tıklar
2. ✅ Leaderboard panel açılır
3. ✅ Top skorlar gösterilir

**Teknik Detaylar:**
- Leaderboard panel açıldığında `leaderboard-panel.js` → `refresh()` çağrılır
- On-chain'den top skorlar alınır
- Kullanıcının kendi skoru gösterilir
- Sıralama gösterilir

**Kullanıcı Görür:**
- Top skorlar listesi
- Kullanıcının kendi skoru
- Sıralama
- Wallet adresleri (kısaltılmış)

**Kullanıcı Görmez:**
- ❌ Passkey prompt'u
- ❌ Wallet connection prompt'u
- ❌ Transaction prompt'u

---

## 👤 7. Profile Panel

### 7.1. Profile Panel Açılışı

**Kullanıcı Deneyimi:**
1. ✅ Kullanıcı Bottom Navigation Bar'dan Profile ikonuna tıklar
2. ✅ Profile panel açılır
3. ✅ Profil bilgileri gösterilir

**Teknik Detaylar:**
- Profile panel açıldığında `profile-panel.js` → `refresh()` çağrılır
- Farcaster user info alınır (eğer Farcaster'da ise)
- Wallet adresi gösterilir
- Network bilgisi gösterilir
- Chain switching butonları gösterilir

**Kullanıcı Görür:**
- Farcaster username (eğer Farcaster'da ise)
- Farcaster avatar (eğer Farcaster'da ise)
- Wallet Address: Kısaltılmış adres
- Network: Base Sepolia veya Base Mainnet
- Chain switching butonları

**Kullanıcı Görmez:**
- ❌ Passkey prompt'u (panel açıldığında)
- ❌ Wallet connection prompt'u
- ❌ Transaction prompt'u

---

## ⚙️ 8. Settings Panel

### 8.1. Settings Panel Açılışı

**Kullanıcı Deneyimi:**
1. ✅ Kullanıcı Bottom Navigation Bar'dan Settings ikonuna tıklar
2. ✅ Settings panel açılır
3. ✅ Ayarlar gösterilir

**Teknik Detaylar:**
- Settings panel açıldığında `settings-panel.js` → `refresh()` çağrılır
- Oyun ayarları gösterilir
- Ses ayarları gösterilir

**Kullanıcı Görür:**
- Oyun ayarları
- Ses ayarları
- Diğer ayarlar

**Kullanıcı Görmez:**
- ❌ Passkey prompt'u
- ❌ Wallet connection prompt'u
- ❌ Transaction prompt'u

---

## 🔄 9. Tekrar Oyun Oynama

### 9.1. İkinci Oyun

**Kullanıcı Deneyimi:**
1. ✅ Kullanıcı tekrar oyun seçer
2. ✅ Oyun başlar
3. ✅ Oyun oynar
4. ✅ Oyunu bitirir
5. ✅ Score submission başlar

**Teknik Detaylar:**
- İlk transaction'dan sonra wallet zaten bağlı
- `ensureWallet(true)` çağrılır
- Wallet bağlantısı kontrol edilir
- Transaction gönderilir

**Kullanıcı Görür:**
- Oyun ekranı
- Game Over ekranı
- Passkey prompt'u (her transaction için - Base Account güvenlik)
- Transaction onay ekranı

**Kullanıcı Görmez:**
- ❌ Wallet connection prompt'u (zaten bağlı)

---

## 📋 10. Özet: Kullanıcı Deneyimi Akışı

### 10.1. İlk Kullanım

1. **Mini App Açılışı**
   - ✅ Otomatik wallet bağlantısı (passkey yok)
   - ✅ Ana menü görüntülenir

2. **Oyun Başlatma**
   - ✅ Oyun seçilir
   - ✅ Oyun başlar (passkey yok)

3. **Oyun Oynama**
   - ✅ Normal oyun akışı
   - ✅ Score toplama
   - ✅ Level tamamlama

4. **Oyun Bitişi**
   - ✅ Game Over ekranı
   - ⚠️ **İlk Passkey Prompt'u** (transaction için)
   - ✅ Score on-chain'e kaydedilir

5. **Paneller**
   - ✅ Wallet panel (passkey yok)
   - ✅ Leaderboard panel (passkey yok)
   - ✅ Profile panel (passkey yok)
   - ✅ Settings panel (passkey yok)

### 10.2. Sonraki Kullanımlar

1. **Mini App Açılışı**
   - ✅ Otomatik wallet bağlantısı (passkey yok)
   - ✅ Ana menü görüntülenir

2. **Oyun Oynama**
   - ✅ Normal oyun akışı
   - ✅ Score toplama

3. **Oyun Bitişi**
   - ✅ Game Over ekranı
   - ⚠️ **Passkey Prompt'u** (her transaction için)
   - ✅ Score on-chain'e kaydedilir

4. **Paneller**
   - ✅ Tüm paneller (passkey yok)

---

## 🎯 11. Önemli Noktalar

### 11.1. Passkey Prompt'ları

**Ne Zaman Görünür:**
- ✅ **İlk transaction'da** (score submission)
- ✅ **Her transaction'da** (Base Account güvenlik)

**Ne Zaman Görünmez:**
- ❌ Mini app açıldığında
- ❌ Panel açıldığında (Wallet, Leaderboard, Profile, Settings)
- ❌ Oyun oynarken
- ❌ Oyun başlatırken

### 11.2. Wallet Connection

**Otomatik Bağlantı:**
- ✅ Mini app açıldığında otomatik bağlanır
- ✅ Passkey/onay prompt'u yok
- ✅ Kullanıcı etkileşimi gerekmez

**Transaction Sırasında:**
- ⚠️ İlk transaction'da passkey prompt'u görünebilir
- ⚠️ Her transaction'da passkey prompt'u görünebilir (Base Account güvenlik)

### 11.3. User Experience

**Zero-Friction:**
- ✅ Mini app açıldığında wallet otomatik bağlanır
- ✅ Oyun oynarken wallet connection gerekmez
- ✅ Paneller açıldığında passkey prompt'u yok

**Progressive Disclosure:**
- ✅ Passkey prompt'u sadece transaction yapılırken görünür
- ✅ Kullanıcı transaction başlattığında passkey istenir
- ✅ Kullanıcı bilgilendirilir (transaction için passkey gerekli)

---

## 📊 12. Platform Farklılıkları

### 12.1. Base App

**Özellikler:**
- ✅ Paymaster desteği (gasless transaction)
- ✅ Atomic batch transactions
- ✅ Base Account otomatik bağlantı
- ⚠️ Her transaction'da passkey prompt'u (güvenlik)

**Kullanıcı Deneyimi:**
- ✅ Gasless transaction (kullanıcı gas ödemez)
- ✅ Hızlı transaction onayı
- ⚠️ Her transaction'da passkey prompt'u

### 12.2. Farcaster

**Özellikler:**
- ❌ Paymaster desteği yok (normal transaction)
- ✅ Sequential batch transactions
- ✅ Farcaster Wallet otomatik bağlantı
- ⚠️ Her transaction'da passkey prompt'u (güvenlik)

**Kullanıcı Deneyimi:**
- ⚠️ Gas fee ödenir (kullanıcı gas öder)
- ✅ Hızlı transaction onayı
- ⚠️ Her transaction'da passkey prompt'u

---

## ✅ 13. Sonuç

### Kullanıcı Deneyimi Özeti

**İlk Kullanım:**
1. Mini app açılır → Wallet otomatik bağlanır (passkey yok)
2. Oyun seçilir → Oyun başlar (passkey yok)
3. Oyun oynanır → Score toplanır (passkey yok)
4. Oyun bitirilir → **İlk passkey prompt'u** (transaction için)
5. Score on-chain'e kaydedilir → Başarı

**Sonraki Kullanımlar:**
1. Mini app açılır → Wallet otomatik bağlanır (passkey yok)
2. Oyun oynanır → Score toplanır (passkey yok)
3. Oyun bitirilir → **Passkey prompt'u** (her transaction için)
4. Score on-chain'e kaydedilir → Başarı

**Paneller:**
- Tüm paneller açıldığında passkey prompt'u yok
- Wallet bilgileri gösterilir
- Leaderboard gösterilir
- Profile gösterilir

### Önemli Noktalar

1. ✅ **Zero-Friction:** Mini app açıldığında wallet otomatik bağlanır
2. ✅ **Progressive Disclosure:** Passkey prompt'u sadece transaction yapılırken görünür
3. ✅ **User-Friendly:** Kullanıcı oyun oynarken wallet connection gerekmez
4. ⚠️ **Security:** Her transaction'da passkey prompt'u (Base Account güvenlik)

---

## 🔗 İlgili Dokümanlar

- [Unified Wallet Integration Model](../reports/UNIFIED_WALLET_INTEGRATION_MODEL.md)
- [Base App Wallet Connection Guide](./BASE_APP_WALLET_CONNECTION_GUIDE.md)
- [Passkey Prompt Fix](./PASSKEY_PROMPT_FIX.md)
- [Wallet Connection Status Analysis](./WALLET_CONNECTION_STATUS_ANALYSIS.md)

---

**Not:** Bu dokümantasyon, cüzdan bağlı kullanıcının BaseMan mini app'ında oyun oynarken yaşadığı deneyimi detaylandırır. Tüm kullanıcı etkileşimleri ve teknik detaylar bu dokümanda açıklanmıştır.


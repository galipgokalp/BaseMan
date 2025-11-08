# Passkey Prompt Fix - Base App Mini App

**Tarih:** 2025-01-06  
**Sorun:** Base App mobil uygulamasında mini app açıldığında passkey istiyor.

---

## 🔍 Sorun Analizi

### Neden Passkey İstiyordu?

1. **Profile Panel Açıldığında `signIn()` Çağrılıyordu:**
   - `profile-panel.js` → `setVisible()` fonksiyonu
   - `bottom-nav.js` → `openProfile()` fonksiyonu
   - Her iki yerde de `window.sdk.actions.signIn()` çağrılıyordu
   - `signIn()` Base App'da passkey prompt'u tetikliyor

2. **Profile Panel Açıldığında `ensureWallet()` Çağrılıyordu:**
   - `profile-panel.js` → `refresh()` fonksiyonu
   - `ensureWallet()` içinde `eth_requestAccounts` çağrılıyordu
   - `eth_requestAccounts` Base App'da passkey prompt'u tetikliyor

3. **`ensureWallet()` Her Zaman `eth_requestAccounts` Çağırıyordu:**
   - Mini app ortamında `eth_accounts` başarısız olursa
   - `eth_requestAccounts` çağrılıyordu
   - Bu, panel açılırken bile passkey prompt'u tetikliyordu

---

## ✅ Çözüm

### 1. Profile Panel'de `signIn()` ve `ensureWallet()` Çağrılarını Kaldırdık

**Değişiklikler:**
- `src/profile-panel.js` → `setVisible()` fonksiyonu: `signIn()` ve `ensureWallet()` çağrıları kaldırıldı
- `src/bottom-nav.js` → `openProfile()` fonksiyonu: `signIn()` ve `ensureWallet()` çağrıları kaldırıldı
- `src/profile-panel.js` → `refresh()` fonksiyonu: `ensureWallet()` çağrısı kaldırıldı

**Sonuç:**
- Profile panel açıldığında passkey prompt'u tetiklenmiyor
- Sadece mevcut wallet durumu gösteriliyor (eğer bağlıysa)

### 2. `ensureWallet()` Fonksiyonuna `requestAccounts` Parametresi Ekledik

**Değişiklikler:**
- `src/onchain-client.js` → `ensureWallet(requestAccounts = false)` fonksiyonu
- Mini app ortamında:
  - `requestAccounts = false` (varsayılan): Sadece `eth_accounts` kullan, `eth_requestAccounts` çağırma
  - `requestAccounts = true`: Transaction yapılırken `eth_requestAccounts` çağır (passkey prompt'u tetiklenebilir)

**Sonuç:**
- Panel açılırken: `requestAccounts = false` → Passkey prompt'u yok
- Transaction yapılırken: `requestAccounts = true` → Passkey prompt'u var (kullanıcı transaction başlattı)

### 3. Transaction Yapılırken `ensureWallet(true)` Çağrısını Ekledik

**Değişiklikler:**
- `src/onchain-client.js` → `submitScore()` fonksiyonu: `ensureWallet(true)` çağrısı eklendi
- `src/onchain-client.js` → `completeQuest()` fonksiyonu: `ensureWallet(true)` çağrısı eklendi

**Sonuç:**
- Transaction yapılırken wallet bağlantısı gerektiğinde `eth_requestAccounts` çağrılıyor
- Passkey prompt'u sadece kullanıcı transaction başlattığında görünüyor

---

## 📚 Base App Dokümantasyonuna Uyum

### Base App Dokümantasyonu:
> "Mini Apps launched within the Base App are automatically connected to the user's Base Account, eliminating wallet connection flows and enabling instant onchain interactions."

### Bizim Çözümümüz:
1. ✅ Mini app açıldığında otomatik bağlantı bekleniyor (`eth_accounts` ile kontrol ediliyor)
2. ✅ Passkey prompt'u sadece transaction yapılırken görünüyor (kullanıcı action başlattığında)
3. ✅ Panel açılırken passkey prompt'u yok (kullanıcı sadece bilgi görüntülüyor)

---

## 🧪 Test Edilmesi Gerekenler

1. **Base App Mini App Açılışında:**
   - ✅ Passkey prompt'u görünmemeli
   - ✅ Wallet paneli açılabilmeli
   - ✅ Profile paneli açılabilmeli
   - ✅ Wallet durumu gösterilmeli (eğer bağlıysa)

2. **Transaction Yapılırken:**
   - ✅ İlk transaction'da passkey prompt'u görünmeli
   - ✅ Transaction başarıyla tamamlanmalı
   - ✅ Sonraki transaction'larda passkey prompt'u görünmemeli (cache'lenmiş)

3. **Wallet Durumu:**
   - ✅ Wallet bağlı değilse: "Not connected" gösterilmeli
   - ✅ Wallet bağlıysa: Adres ve bakiyeler gösterilmeli
   - ✅ Transaction yapılırken wallet bağlantısı otomatik olarak sağlanmalı

---

## 📝 Kod Değişiklikleri Özeti

### `src/onchain-client.js`
- `ensureWallet()` → `ensureWallet(requestAccounts = false)` parametresi eklendi
- Mini app ortamında `eth_requestAccounts` çağrısı sadece `requestAccounts = true` iken yapılıyor
- `submitScore()` ve `completeQuest()` fonksiyonlarında `ensureWallet(true)` çağrısı eklendi

### `src/profile-panel.js`
- `setVisible()` fonksiyonunda `signIn()` ve `ensureWallet()` çağrıları kaldırıldı
- `refresh()` fonksiyonunda `ensureWallet()` çağrısı kaldırıldı
- Sadece mevcut wallet durumu gösteriliyor

### `src/bottom-nav.js`
- `openProfile()` fonksiyonunda `signIn()` ve `ensureWallet()` çağrıları kaldırıldı
- Sadece panel açılıyor ve refresh ediliyor

---

## 🎯 Sonuç

✅ **Base App mini app açıldığında passkey prompt'u görünmüyor**
✅ **Passkey prompt'u sadece transaction yapılırken görünüyor (kullanıcı action başlattığında)**
✅ **Base App dokümantasyonuna uygun davranış**
✅ **Kullanıcı deneyimi iyileştirildi (gereksiz prompt'lar kaldırıldı)**


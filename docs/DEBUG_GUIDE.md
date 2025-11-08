# Debug Rehberi
**Tarih:** 2025-01-06  
**Kapsam:** Console log erişimi ve Bottom Navigation Bar debug

---

## 📋 İçindekiler

1. [Console Logs](#1-console-logs)
2. [UI Debug](#2-ui-debug)

---

## 1. Console Logs

### 1.1. Console Log'larına Nasıl Erişilir?

#### Yöntem 1: DevTools Console (Manuel)

1. **Tarayıcıda F12 tuşuna basın** (veya Ctrl+Shift+I)
2. **Console sekmesine** gidin
3. **Tüm log'ları** görürsünüz
4. **Kopyalamak için**: Log'ların üzerine sağ tıklayın → "Copy" veya "Copy message"

#### Yöntem 2: Console Logger API (Otomatik)

Console logger script'i tüm log'ları otomatik olarak yakalar. Console'da şu komutları kullanabilirsiniz:

##### Tüm Log'ları Görüntüle:
```javascript
window.ConsoleLogger.getLogs()
```

##### Sadece Hataları Görüntüle:
```javascript
window.ConsoleLogger.getErrors()
```

##### Sadece Uyarıları Görüntüle:
```javascript
window.ConsoleLogger.getWarnings()
```

##### Log'ları Tablo Olarak Görüntüle:
```javascript
window.ConsoleLogger.print()
```

##### Hataları Detaylı Görüntüle:
```javascript
window.ConsoleLogger.printErrors()
```

##### Log'ları JSON Olarak Export Et:
```javascript
window.ConsoleLogger.export()
```
Bu komut bir JSON dosyası indirecek.

##### Log Buffer'ı Temizle:
```javascript
window.ConsoleLogger.clear()
```

---

### 1.2. Kullanım Örnekleri

#### Örnek 1: Tüm Hataları Görmek
```javascript
// Console'da çalıştırın:
const errors = window.ConsoleLogger.getErrors();
console.table(errors);
```

#### Örnek 2: Son 10 Hatayı Görmek
```javascript
const errors = window.ConsoleLogger.getErrors();
console.table(errors.slice(-10));
```

#### Örnek 3: Belirli Bir Hatayı Aramak
```javascript
const errors = window.ConsoleLogger.getErrors();
const productionError = errors.find(e => e.message.includes('production'));
console.log(productionError);
```

#### Örnek 4: Log'ları JSON Olarak İndirmek
```javascript
window.ConsoleLogger.export();
// Bir JSON dosyası indirilecek
```

---

### 1.3. API Endpoint

Log'lar ayrıca `/api/app-log` endpoint'ine de gönderiliyor. Bu endpoint'ten log'ları almak için:

#### GET Request:
```bash
curl https://base-man.vercel.app/api/app-log
```

Veya tarayıcıda:
```
https://base-man.vercel.app/api/app-log
```

---

### 1.4. Log Formatı

Her log entry şu formatta:

```json
{
  "type": "error" | "warn" | "log" | "info" | "debug",
  "timestamp": "2025-01-06T12:00:00.000Z",
  "message": "Error message",
  "args": ["arg1", "arg2"],
  "stack": "Error stack trace (if error)",
  "filename": "filename.js (if error)",
  "lineno": 123,
  "colno": 456
}
```

---

### 1.5. Hızlı Debug Komutları

Console'da şu komutları kullanabilirsiniz:

```javascript
// Tüm log'ları göster
ConsoleLogger.getLogs()

// Sadece hatalar
ConsoleLogger.getErrors()

// Hataları detaylı göster
ConsoleLogger.printErrors()

// JSON export
ConsoleLogger.export()
```

---

### 1.6. Mobil Test İçin

Mobilde console'a erişim zor olduğu için, log'lar otomatik olarak `/api/app-log` endpoint'ine gönderiliyor. Desktop'tan bu endpoint'e erişerek mobil test log'larını görebilirsiniz.

---

## 2. UI Debug

### 2.1. Bottom Navigation Bar Debug

#### Test Ortamı

##### Hangi Link ile Test Etmeli?

**Canlı URL (Önerilen):**
```
https://base-man.vercel.app
```

**Test Adımları:**
1. Vercel deploy'un tamamlanmasını bekleyin (GitHub'da push sonrası ~2-3 dakika)
2. Yukarıdaki linki tarayıcıda açın
3. DevTools'u açın (aşağıdaki adımlara bakın)

---

#### Hangi Tarayıcıda Test Etmeli?

##### Desktop (İlk Test - Önerilen):
- **Chrome** veya **Edge** (DevTools en iyi çalışır)
- **Firefox** (de çalışır ama Chrome daha iyi)

##### Mobil (Asıl Test):
- **Farcaster App** (iOS/Android)
- **Base App** (iOS/Android)
- Mobilde console'a erişim zor olabilir, bu yüzden önce desktop'ta test edin

---

#### DevTools Nasıl Açılır?

##### Chrome/Edge (Windows/Linux):
1. Klavye: `F12` tuşuna basın
   - VEYA
2. Klavye: `Ctrl + Shift + I` (I harfi)
   - VEYA
3. Mouse: Sayfada sağ tıklayın → **"İncele"** veya **"Inspect"** seçin

##### Chrome/Edge (Mac):
1. Klavye: `Cmd + Option + I`
   - VEYA
2. Mouse: Sayfada sağ tıklayın → **"Inspect"** seçin

##### DevTools Penceresi:
```
┌─────────────────────────────────────────┐
│ Elements | Console | Sources | Network...│ ← Sekmeler
├─────────────────────────────────────────┤
│                                         │
│  (Buraya Console sekmesine tıklayın)   │
│                                         │
└─────────────────────────────────────────┘
```

---

### 2.2. Test Adımları (Sırasıyla)

#### Adım 1: Sayfayı Aç ve DevTools'u Aç
1. Linki tarayıcıda açın: `https://base-man.vercel.app`
2. `F12` tuşuna basın (veya `Ctrl+Shift+I`)
3. **Console** sekmesine tıklayın

#### Adım 2: Sayfayı Yenile
1. `F5` tuşuna basın (veya `Ctrl+R`)
2. Console'da şu log'ları görmelisiniz:
   ```
   [bottom-nav] Script loaded, starting initialization...
   [bottom-nav] initWhenReady called, document.readyState: ...
   [bottom-nav] Initializing...
   [bottom-nav] Navigation element found: <nav id="bottom-nav">
   [bottom-nav] Found nav items: 4
   [bottom-nav] Initialization complete
   ```

#### Adım 3: Butonlara Tıkla ve Log'ları İzle
1. Sayfanın alt kısmında bottom navigation bar'ı göreceksiniz:
   ```
   [🏆 PAC] [👤 Pro] [🔗 Wal] [⚙️ Set]
   ```
2. **PAC butonuna** tıklayın
3. Console'da şunları görmelisiniz:
   ```
   [bottom-nav] Clicked on nav item: leaderboard
   [bottom-nav] handleNavClick called: leaderboard
   [bottom-nav] Opening leaderboard...
   [bottom-nav] openLeaderboard called
   [bottom-nav] Leaderboard panel found: <section id="leaderboard-panel">
   ```
4. **Profile butonuna** tıklayın
5. Console'da şunları görmelisiniz:
   ```
   [bottom-nav] Clicked on nav item: profile
   [bottom-nav] Opening profile...
   [bottom-nav] openProfile called
   [bottom-nav] Profile button found: <button id="baseman-profile-btn">
   ```
6. **Wallet butonuna** tıklayın
7. Console'da şunları görmelisiniz:
   ```
   [bottom-nav] Clicked on nav item: wallet
   [bottom-nav] Opening wallet...
   [bottom-nav] openWallet called
   ```

---

### 2.3. Ne Arıyoruz?

#### ✅ Başarılı Durum (Her Şey Çalışıyorsa):
- Tüm log'lar görünür
- Paneller açılır
- Hata mesajı yok

#### ❌ Sorunlu Durum (Bir Şey Çalışmıyorsa):

##### Senaryo 1: Script Yüklenmemiş
**Console'da görürseniz:**
```
(Hiç log yok veya sadece başka script'lerin log'ları)
```
**Çözüm:** Script yüklenmemiş, sayfayı hard refresh yapın (`Ctrl+F5`)

##### Senaryo 2: Navigation Element Bulunamadı
**Console'da görürseniz:**
```
[bottom-nav] Navigation element not found!
```
**Çözüm:** HTML'de bottom-nav elementi yok veya yüklenmemiş

##### Senaryo 3: Click Event Tetiklenmiyor
**Console'da görürseniz:**
```
[bottom-nav] Initialization complete
(Buradan sonra hiç log yok - butonlara tıklayınca)
```
**Çözüm:** Click event listener'lar eklenmemiş, z-index sorunu olabilir

##### Senaryo 4: Element Bulunamıyor
**Console'da görürseniz:**
```
[bottom-nav] openLeaderboard called
[bottom-nav] Leaderboard panel not found!
```
**Çözüm:** Panel elementi henüz yüklenmemiş veya farklı ID'ye sahip

---

### 2.4. Görsel Örnek

#### Console'da Göreceğiniz Log'lar (Başarılı):
```
[bottom-nav] Script loaded, starting initialization...
[bottom-nav] initWhenReady called, document.readyState: complete
[bottom-nav] DOM already ready
[bottom-nav] Fallback: initializing in 2000ms
[bottom-nav] Fallback timeout fired, initializing now
[bottom-nav] Initializing...
[bottom-nav] Navigation element found: <nav id="bottom-nav" class="bottom-nav">
[bottom-nav] Found nav items: 4
[bottom-nav] Item 0: navType="leaderboard" <button class="nav-item">
[bottom-nav] Event listener added to item: leaderboard
[bottom-nav] Item 1: navType="profile" <button class="nav-item">
[bottom-nav] Event listener added to item: profile
[bottom-nav] Item 2: navType="wallet" <button class="nav-item">
[bottom-nav] Event listener added to item: wallet
[bottom-nav] Item 3: navType="settings" <button class="nav-item">
[bottom-nav] Event listener added to item: settings
[bottom-nav] Initialization complete
```

#### Butona Tıkladığınızda (Örnek: PAC):
```
[bottom-nav] Clicked on nav item: leaderboard MouseEvent {isTrusted: true, ...}
[bottom-nav] handleNavClick called: leaderboard <button class="nav-item">
[bottom-nav] Opening leaderboard...
[bottom-nav] openLeaderboard called
[bottom-nav] Leaderboard panel found: <section id="leaderboard-panel">
[bottom-nav] Using window.BaseManLeaderboard.show()
[bottom-nav] Refreshing leaderboard
[bottom-nav] Leaderboard opened successfully
```

---

### 2.5. Hata Mesajları ve Çözümleri

#### Hata 1: "Navigation element not found!"
**Neden:** Bottom nav HTML'i yüklenmemiş
**Çözüm:** 
- Sayfayı hard refresh yapın (`Ctrl+F5`)
- HTML dosyasında bottom-nav elementinin olduğunu kontrol edin

#### Hata 2: "No nav items found!"
**Neden:** Butonlar yüklenmemiş
**Çözüm:**
- Sayfayı yenileyin
- HTML'de nav-item class'larını kontrol edin

#### Hata 3: "Leaderboard panel not found!"
**Neden:** Leaderboard panel henüz yüklenmemiş
**Çözüm:**
- Biraz bekleyin (2 saniye)
- Sayfayı yenileyin

#### Hata 4: "Profile panel could not be opened"
**Neden:** Profile button veya panel bulunamadı
**Çözüm:**
- Profile panel script'inin yüklendiğini kontrol edin
- Console'da profile-panel.js log'larını arayın

---

### 2.6. Mobil Test (İleride)

Mobilde console'a erişim zor olduğu için:
1. Önce desktop'ta test edin
2. Desktop'ta çalışıyorsa mobilde de çalışması gerekir
3. Mobilde sorun varsa, desktop'taki log'ları paylaşın

---

### 2.7. Test Sonuçlarını Paylaşma

Test sonrası şunları paylaşın:
1. **Hangi log'ları gördünüz?** (console'dan kopyalayın)
2. **Hangi butonlara tıkladınız?**
3. **Paneller açıldı mı?** (Evet/Hayır)
4. **Hata mesajı var mı?** (Varsa kopyalayın)

Bu bilgilerle sorunu tam olarak tespit edebiliriz!

---

## 📝 Özet

✅ **Console Logger API ile otomatik log yakalama**  
✅ **DevTools Console ile manuel log görüntüleme**  
✅ **API endpoint ile log'ları uzaktan erişim**  
✅ **Bottom Navigation Bar debug adımları**  
✅ **Yaygın hata mesajları ve çözümleri**

Bu rehber, debug işlemleri için gerekli tüm bilgileri içerir. Sorun yaşadığınızda önce console log'larını kontrol edin ve bu rehberdeki adımları takip edin.


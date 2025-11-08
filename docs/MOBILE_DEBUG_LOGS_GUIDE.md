# Mobile Debug Logs Guide - Mobil Uygulamada Log Görüntüleme

**Tarih:** 2025-01-06  
**Sorun:** Farcaster/Base App mobil uygulama ortamlarında mini app'te bir oyun bitirdikten sonra logları görebilir miyiz?

---

## ✅ Kısa Cevap

**Evet, mobil uygulamada log'ları görebilirsiniz.** Birkaç yöntem var:

1. **Settings Panel'de Debug Logs** (Önerilen) - Mini app içinde log'ları görüntüleyin
2. **Debug Overlay** - URL'e `?debug` ekleyerek overlay'i aktif edin
3. **API Endpoint** - `/api/app-log` endpoint'inden log'ları alın
4. **Console Logger API** - `window.ConsoleLogger` API'sini kullanın

---

## 📱 Yöntem 1: Settings Panel'de Debug Logs (Önerilen)

### Nasıl Kullanılır:

1. Mini app'i açın (Farcaster veya Base App)
2. Bottom Navigation Bar'dan **Settings** (⚙️) ikonuna tıklayın
3. Settings panel'de **Debug Logs** section'ını bulun
4. **"View Logs"** butonuna tıklayın
5. Log'lar görüntülenir

### Özellikler:

- ✅ Score submission log'ları
- ✅ Error log'ları
- ✅ Warning log'ları
- ✅ API log'ları
- ✅ Console log'ları
- ✅ Clear logs butonu
- ✅ Export logs butonu
- ✅ Real-time log görüntüleme

### Log Türleri:

- **Score Submission**: `submitScore: Starting submission - score=...`
- **Transaction**: `submitScore: Transaction submitted via wallet_sendCalls (id: ...)`
- **Errors**: `submitScore ERROR: ...`
- **Backend**: `score-sign succeeded: ...`
- **Wallet**: `submitScore: Wallet connected - address=...`

---

## 🔍 Yöntem 2: Debug Overlay

### Nasıl Aktif Edilir:

1. Mini app URL'ine `?debug` parametresi ekleyin
   - Örnek: `https://your-miniapp.vercel.app/?debug`
2. Debug overlay ekranın altında görünür
3. Tüm debug log'ları gerçek zamanlı olarak görüntülenir

### Özellikler:

- ✅ Real-time log görüntüleme
- ✅ Ekranın altında sabit overlay
- ✅ Otomatik scroll
- ✅ Tüm debug mesajları

### Not:

- Debug overlay sadece `?debug` parametresi ile aktif olur
- Production'da overlay'i kapatmak için `NEXT_PUBLIC_DEBUG_OVERLAY=0` ayarlayın
- Development'ta overlay'i açmak için `NEXT_PUBLIC_DEBUG_OVERLAY=1` ayarlayın

---

## 🌐 Yöntem 3: API Endpoint

### Nasıl Kullanılır:

1. Mini app'in URL'ini alın (örnek: `https://your-miniapp.vercel.app`)
2. API endpoint'ine GET request gönderin:
   ```
   GET /api/app-log
   ```
3. Response'da log'ları alın:
   ```json
   {
     "logs": [
       {
         "ts": "2025-01-06T12:00:00.000Z",
         "event": "score:submitted",
         "message": "Score submitted successfully",
         "meta": {
           "identifier": "0x1234...",
           "score": "1000",
           "address": "0x5678..."
         }
       }
     ]
   }
   ```

### Özellikler:

- ✅ Server-side log storage
- ✅ Ring buffer (son 200 log)
- ✅ JSON format
- ✅ Remote access

### Kullanım Senaryoları:

- **Development**: Local server'da log'ları görüntüleme
- **Production**: Remote server'da log'ları görüntüleme
- **Debugging**: Specific log'ları filtreleme
- **Monitoring**: Log'ları external service'e forward etme

---

## 💻 Yöntem 4: Console Logger API

### Nasıl Kullanılır:

1. Mini app'i açın
2. JavaScript console'a erişin (WebView içinde)
3. Console'da şu komutları çalıştırın:

```javascript
// Tüm log'ları görüntüle
window.ConsoleLogger.getLogs()

// Sadece error'ları görüntüle
window.ConsoleLogger.getErrors()

// Sadece warning'leri görüntüle
window.ConsoleLogger.getWarnings()

// Log'ları console'da yazdır
window.ConsoleLogger.print()

// Error'ları console'da yazdır
window.ConsoleLogger.printErrors()

// Log'ları temizle
window.ConsoleLogger.clear()

// Log'ları export et (JSON dosyası olarak indir)
window.ConsoleLogger.export()
```

### Özellikler:

- ✅ Client-side log buffer
- ✅ 500 log kapasitesi
- ✅ Error tracking
- ✅ Warning tracking
- ✅ Export functionality

### Not:

- Console Logger API'si mobil uygulamada JavaScript console'a erişim gerektirir
- WebView içinde console'a erişim platform'a göre değişir
- Farcaster/Base App mobil uygulamalarında console'a erişim sınırlı olabilir

---

## 🎮 Oyun Bitirdikten Sonra Log Görüntüleme

### Adım Adım:

1. **Oyun Oyna**: Mini app'te oyun oynayın
2. **Game Over**: Game Over olun (score submission otomatik tetiklenir)
3. **Settings Aç**: Bottom Navigation Bar'dan Settings (⚙️) ikonuna tıklayın
4. **Debug Logs**: Settings panel'de "Debug Logs" section'ını bulun
5. **View Logs**: "View Logs" butonuna tıklayın
6. **Log'ları İncele**: Score submission log'larını görüntüleyin

### Beklenen Log'lar:

```
[12:00:00] submitScore: Starting submission - score=1000, duration=60000ms
[12:00:01] submitScore: Ensuring wallet connection...
[12:00:01] submitScore: Wallet connected - address=0x1234...
[12:00:01] submitScore: Requesting signature from backend...
[12:00:02] submitScore: Signature received - deadline=1234567890, nonce=1234567890
[12:00:02] submitScore: Call data encoded (V2) - score=1000, nonce=1234567890
[12:00:02] submitScore: Submitting transaction with paymaster...
[12:00:03] submitScore: Transaction submitted via wallet_sendCalls (id: 0x5678...)
[12:00:03] submitScore: Transaction submitted successfully via paymaster
[12:00:03] submitScore: Finished (submitting flag cleared)
```

### Hata Durumları:

```
[12:00:00] submitScore: Starting submission - score=1000, duration=60000ms
[12:00:01] submitScore: Ensuring wallet connection...
[12:00:01] submitScore ERROR: Wallet connection required
[12:00:01] submitScore: Finished (submitting flag cleared)
```

---

## 🔧 Troubleshooting

### Sorun 1: Settings Panel'de Debug Logs Görünmüyor

**Çözüm:**
1. Settings panel'i açın
2. Scroll down yapın
3. "Debug Logs" section'ını bulun
4. "View Logs" butonuna tıklayın

### Sorun 2: Log'lar Boş Görünüyor

**Çözüm:**
1. Oyun oynayın ve Game Over olun
2. Settings panel'i açın
3. "Refresh Logs" butonuna tıklayın
4. Log'ları tekrar görüntüleyin

### Sorun 3: API Endpoint Çalışmıyor

**Çözüm:**
1. Server'ın çalıştığından emin olun
2. API endpoint'ine GET request gönderin
3. Response'u kontrol edin
4. Log'ları görüntüleyin

### Sorun 4: Console Logger API Çalışmıyor

**Çözüm:**
1. JavaScript console'a erişin
2. `window.ConsoleLogger` var mı kontrol edin
3. API metodlarını çalıştırın
4. Log'ları görüntüleyin

---

## 📊 Log Format

### Score Submission Log'ları:

```json
{
  "ts": "2025-01-06T12:00:00.000Z",
  "event": "score:submitted",
  "message": "Score submitted successfully",
  "meta": {
    "identifier": "0x1234...",
    "score": "1000",
    "address": "0x5678...",
    "chainId": "84532"
  }
}
```

### Error Log'ları:

```json
{
  "ts": "2025-01-06T12:00:00.000Z",
  "event": "score:submission:error",
  "message": "Score submission failed",
  "meta": {
    "error": "Wallet connection required",
    "score": "1000",
    "address": "unknown",
    "stack": "..."
  }
}
```

### Backend Log'ları:

```json
{
  "ts": "2025-01-06T12:00:00.000Z",
  "event": "score-sign:ok",
  "message": "Score signature received",
  "meta": {
    "score": "1000",
    "durationMs": "60000"
  }
}
```

---

## 🚀 Best Practices

### Development:

1. **Debug Overlay Kullan**: `?debug` parametresi ile overlay'i aktif edin
2. **Settings Panel Kullan**: Debug Logs section'ını kullanın
3. **Console Logger API Kullan**: JavaScript console'da log'ları görüntüleyin

### Production:

1. **API Endpoint Kullan**: Remote server'da log'ları görüntüleyin
2. **Log Forwarding**: External service'e log'ları forward edin
3. **Monitoring**: Log'ları monitor edin

### Debugging:

1. **Score Submission**: Score submission log'larını takip edin
2. **Transaction Status**: Transaction status log'larını takip edin
3. **Error Tracking**: Error log'larını takip edin

---

## 🔗 İlgili Dokümanlar

- [Score Submission Flow](./SCORE_SUBMISSION_FLOW.md)
- [Score Submission Debug Guide](./SCORE_SUBMISSION_DEBUG_GUIDE.md)
- [User Experience Flow](./USER_EXPERIENCE_FLOW.md)
- [Debug Guide](./DEBUG_GUIDE.md)

---

## ✅ Sonuç

Mobil uygulamada log'ları görüntülemek için birkaç yöntem var:

1. **Settings Panel'de Debug Logs** (Önerilen) - Mini app içinde log'ları görüntüleyin
2. **Debug Overlay** - URL'e `?debug` ekleyerek overlay'i aktif edin
3. **API Endpoint** - `/api/app-log` endpoint'inden log'ları alın
4. **Console Logger API** - `window.ConsoleLogger` API'sini kullanın

**En kolay yöntem**: Settings panel'de Debug Logs section'ını kullanmak. Bu yöntem mobil uygulamada çalışır ve log'ları görüntülemenizi sağlar.

---

**Not:** Bu rehber, mobil uygulamada log'ları görüntülemek için kapsamlı bir rehber sunar. Sorun devam ederse, log'ları toplayıp destek ekibiyle paylaşın.


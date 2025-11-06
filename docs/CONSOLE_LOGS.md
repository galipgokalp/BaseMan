# Console Logs Erişim Rehberi

## 🔍 Console Log'larına Nasıl Erişilir?

### Yöntem 1: DevTools Console (Manuel)

1. **Tarayıcıda F12 tuşuna basın** (veya Ctrl+Shift+I)
2. **Console sekmesine** gidin
3. **Tüm log'ları** görürsünüz
4. **Kopyalamak için**: Log'ların üzerine sağ tıklayın → "Copy" veya "Copy message"

### Yöntem 2: Console Logger API (Otomatik)

Console logger script'i tüm log'ları otomatik olarak yakalar. Console'da şu komutları kullanabilirsiniz:

#### Tüm Log'ları Görüntüle:
```javascript
window.ConsoleLogger.getLogs()
```

#### Sadece Hataları Görüntüle:
```javascript
window.ConsoleLogger.getErrors()
```

#### Sadece Uyarıları Görüntüle:
```javascript
window.ConsoleLogger.getWarnings()
```

#### Log'ları Tablo Olarak Görüntüle:
```javascript
window.ConsoleLogger.print()
```

#### Hataları Detaylı Görüntüle:
```javascript
window.ConsoleLogger.printErrors()
```

#### Log'ları JSON Olarak Export Et:
```javascript
window.ConsoleLogger.export()
```
Bu komut bir JSON dosyası indirecek.

#### Log Buffer'ı Temizle:
```javascript
window.ConsoleLogger.clear()
```

---

## 📋 Kullanım Örnekleri

### Örnek 1: Tüm Hataları Görmek
```javascript
// Console'da çalıştırın:
const errors = window.ConsoleLogger.getErrors();
console.table(errors);
```

### Örnek 2: Son 10 Hatayı Görmek
```javascript
const errors = window.ConsoleLogger.getErrors();
console.table(errors.slice(-10));
```

### Örnek 3: Belirli Bir Hatayı Aramak
```javascript
const errors = window.ConsoleLogger.getErrors();
const productionError = errors.find(e => e.message.includes('production'));
console.log(productionError);
```

### Örnek 4: Log'ları JSON Olarak İndirmek
```javascript
window.ConsoleLogger.export();
// Bir JSON dosyası indirilecek
```

---

## 🔧 API Endpoint

Log'lar ayrıca `/api/app-log` endpoint'ine de gönderiliyor. Bu endpoint'ten log'ları almak için:

### GET Request:
```bash
curl https://base-man.vercel.app/api/app-log
```

Veya tarayıcıda:
```
https://base-man.vercel.app/api/app-log
```

---

## 📊 Log Formatı

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

## 🎯 Hızlı Debug Komutları

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

## 📱 Mobil Test İçin

Mobilde console'a erişim zor olduğu için, log'lar otomatik olarak `/api/app-log` endpoint'ine gönderiliyor. Desktop'tan bu endpoint'e erişerek mobil test log'larını görebilirsiniz.


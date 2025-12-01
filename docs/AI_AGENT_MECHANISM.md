# AI Agent Çalışma Mekanizması

## 📍 Nerede Çalışıyor?

**AI Agent backend'de çalışıyor** (Vercel serverless function):
- **Dosya**: `api/ai-agent-webhook.js`
- **Konum**: Vercel serverless function (cloud)
- **Mini uygulama içinde değil**: Sadece backend'de

## 🔄 Çalışma Akışı

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Kullanıcı Mini App'i Kullanıyor                          │
│    (index.html + src/*.js dosyaları)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Hata Oluşuyor                                             │
│    - JavaScript error                                        │
│    - Unhandled promise rejection                             │
│    - console.error() çağrısı                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. console-logger.js Yakalıyor                               │
│    (src/console-logger.js)                                   │
│    - Tüm console.log/error/warn'ları yakalar                 │
│    - Unhandled error'ları yakalar                            │
│    - Stack trace'i toplar                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ POST /api/app-log
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. app-log.js İşliyor                                        │
│    (api/app-log.js)                                          │
│    - Log'u kaydeder                                           │
│    - Rollbar'a gönderir (error tracking)                    │
│    - AI Agent'a yönlendirir (sadece error/warn)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ POST /api/ai-agent-webhook
                       │ (sadece error ve warn için)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. AI Agent Analiz Ediyor                                    │
│    (api/ai-agent-webhook.js)                                 │
│    - Groq API ile hata analizi yapar                         │
│    - Root cause bulur                                        │
│    - Severity belirler                                       │
│    - Çözüm önerisi üretir                                    │
│    - Slack'e bildirim gönderir (opsiyonel)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Sonuç                                                     │
│    - Analiz sonucu döner (JSON)                              │
│    - Rollbar'da görünür                                       │
│    - Slack'te bildirim (opsiyonel)                           │
│    - Kod otomatik düzeltilmez (sadece rapor)                 │
└─────────────────────────────────────────────────────────────┘
```

## ❓ Ne Yapıyor?

### ✅ YAPTIĞI ŞEYLER:

1. **Hata Analizi**
   - Hataları otomatik analiz eder
   - Root cause bulur
   - Severity (önem seviyesi) belirler
   - Impact (etki) değerlendirir

2. **Çözüm Önerisi**
   - Spesifik kod düzeltmeleri önerir
   - Dosya ve satır numarası belirtir
   - Açıklama yapar

3. **Raporlama**
   - Rollbar'da görünür
   - Slack'e bildirim gönderir (opsiyonel)
   - JSON response döner

### ❌ YAPMADIĞI ŞEYLER:

1. **Otomatik Düzeltme YAPMAZ**
   - Kod otomatik düzeltilmez
   - Sadece öneri verir
   - Manuel müdahale gerekir

2. **Kullanıcıya Müdahale ETMEZ**
   - Kullanıcı deneyimini etkilemez
   - Arka planda çalışır
   - Görünmez

3. **Hataları Engellemez**
   - Hatalar oluşmaya devam eder
   - Sadece analiz eder ve raporlar

## 🔍 Nasıl İzlenir?

### 1. Rollbar Dashboard
```
https://rollbar.com → Projeniz → Items
```
- Tüm hatalar burada görünür
- AI analizi custom data'da olabilir

### 2. Debug Endpoint
```bash
curl https://base-man.vercel.app/api/ai-agent-webhook
```
- Configuration kontrolü
- Provider durumu
- API key durumu

### 3. Vercel Logs
```bash
vercel logs
```
- Server-side loglar
- AI Agent çalışma logları

### 4. Test Endpoint
```bash
curl -X POST https://base-man.vercel.app/api/ai-agent-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "error",
    "message": "Test error",
    "ts": "2024-01-01T00:00:00.000Z",
    "meta": {"filename": "test.js"}
  }'
```

## 📊 Örnek Çalışma Senaryosu

### Senaryo: Kullanıcı oyunu açıyor, hata oluşuyor

1. **Kullanıcı**: Oyunu açıyor
2. **Hata**: `TypeError: Cannot read properties of undefined`
3. **console-logger.js**: Hatayı yakalar
4. **app-log.js**: Log'u işler, AI Agent'a gönderir
5. **AI Agent**: 
   - Groq API ile analiz eder
   - Root cause: "undefined object'e erişim"
   - Severity: "High"
   - Solution: "Null check ekle"
6. **Rollbar**: Hata + AI analizi görünür
7. **Geliştirici**: Rollbar'da analizi görür, kodu düzeltir

## ⚙️ Yapılandırma

### Environment Variables

```bash
# AI Agent aktif mi?
AI_AGENT_ENABLED=true

# Hangi provider? (groq, openrouter, openai, rule-based)
AI_PROVIDER=groq

# Groq API key
GROQ_API_KEY=your_key_here

# Minimum severity (error, warn, log)
AI_AGENT_MIN_SEVERITY=error

# Slack webhook (opsiyonel)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Hangi Hatalar Analiz Edilir?

- `error` event'leri (her zaman)
- `warn` event'leri (AI_AGENT_MIN_SEVERITY=warn ise)
- `log` event'leri (AI_AGENT_MIN_SEVERITY=log ise)

## 🎯 Özet

| Özellik | Açıklama |
|---------|----------|
| **Nerede?** | Backend (Vercel serverless function) |
| **Ne zaman?** | Hata oluştuğunda otomatik |
| **Ne yapar?** | Analiz eder, rapor verir |
| **Müdahale eder mi?** | Hayır, sadece rapor verir |
| **Nasıl izlenir?** | Rollbar, Vercel logs, debug endpoint |
| **Otomatik düzeltir mi?** | Hayır, sadece öneri verir |

## 💡 Sonuç

AI Agent bir **"hata analiz ve raporlama sistemi"**dir. Otomatik düzeltme yapmaz, sadece:
- Hataları analiz eder
- Çözüm önerileri sunar
- Raporlar (Rollbar, Slack)

Geliştirici bu raporları görüp manuel olarak kodu düzeltir.




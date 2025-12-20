# AI Agent Entegrasyonu

AI Agent, BaseMan mini uygulamasındaki hataları otomatik olarak analiz eden ve çözüm önerileri sunan bir sistemdir.

## Özellikler

- ✅ **AI-Powered Hata Analizi**: OpenAI API kullanarak hataları analiz eder
- ✅ **Otomatik Çözüm Önerileri**: Hatalar için spesifik kod düzeltme önerileri
- ✅ **Severity Tespiti**: Hataları Critical, High, Medium, Low olarak kategorize eder
- ✅ **Slack Bildirimleri**: Kritik hatalar için Slack bildirimi gönderir
- ✅ **Email Bildirimleri**: Email bildirimi desteği (opsiyonel)
- ✅ **Cache Mekanizması**: Aynı hatayı tekrar analiz etmez (5 dakika cache)

## Kurulum

⚠️ **ÖNEMLİ:** Bu entegrasyon hem yerel hem de Vercel production ortamı için environment variables gerektirir. Production'da çalışması için **mutlaka Vercel'e de eklemeniz gerekiyor!**

### 1. Environment Variables

#### Yerel Geliştirme (`.env.local`)

`.env.local` dosyanıza aşağıdaki değişkenleri ekleyin:

```bash
# AI Agent Ayarları
AI_AGENT_ENABLED=true
AI_AGENT_WEBHOOK_URL=https://base-man.vercel.app/api/ai-agent-webhook
AI_AGENT_MODEL=gpt-4o-mini
AI_AGENT_MIN_SEVERITY=error

# OpenAI API (Gerekli)
OPENAI_API_KEY=sk-...

# Slack Bildirimleri (Opsiyonel)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email Bildirimleri (Opsiyonel - henüz implement edilmedi)
EMAIL_API_KEY=your-email-api-key
EMAIL_TO=your-email@example.com
```

#### Vercel Production (Gerekli!)

**Production'da çalışması için Vercel'e de eklemeniz gerekiyor:**

1. [Vercel Dashboard](https://vercel.com/dashboard) → Projenizi seçin
2. **Settings** → **Environment Variables** sekmesine gidin
3. Aşağıdaki environment variables'ları ekleyin:

| Key | Value | Environment |
|-----|-------|-------------|
| `AI_AGENT_ENABLED` | `true` | Production, Preview, Development |
| `AI_AGENT_WEBHOOK_URL` | `https://base-man.vercel.app/api/ai-agent-webhook` | Production, Preview, Development |
| `AI_AGENT_MODEL` | `gpt-4o-mini` | Production, Preview, Development (opsiyonel) |
| `AI_AGENT_MIN_SEVERITY` | `error` | Production, Preview, Development (opsiyonel) |
| `OPENAI_API_KEY` | `sk-...` | Production, Preview, Development (⚠️ **Gizli**) |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | Production (opsiyonel) |

**Veya Vercel CLI ile:**

```bash
vercel env add AI_AGENT_ENABLED
# Value: true
# Environment: Production, Preview, Development

vercel env add AI_AGENT_WEBHOOK_URL
# Value: https://base-man.vercel.app/api/ai-agent-webhook
# Environment: Production, Preview, Development

vercel env add OPENAI_API_KEY
# Value: sk-... (OpenAI API key'iniz)
# Environment: Production, Preview, Development

vercel env add SLACK_WEBHOOK_URL
# Value: https://hooks.slack.com/...
# Environment: Production (opsiyonel)
```

⚠️ **Önemli:** Environment variables eklendikten sonra **yeni bir deploy yapmanız gerekiyor** çünkü Vercel environment variables'ları deploy zamanında enjekte eder.

```bash
vercel --prod
```

veya Vercel Dashboard'dan "Redeploy" butonuna tıklayın.

### 2. OpenAI API Key Alma

1. [OpenAI Platform](https://platform.openai.com/) hesabı oluşturun
2. API Keys bölümünden yeni bir key oluşturun
3. Key'i `.env.local` dosyasına ekleyin

### 3. Slack Webhook (Opsiyonel)

1. [Slack Apps](https://api.slack.com/apps) sayfasına gidin
2. Yeni bir app oluşturun veya mevcut app'i seçin
3. "Incoming Webhooks" özelliğini aktifleştirin
4. Webhook URL'ini kopyalayın ve `.env.local` dosyasına ekleyin

## Kullanım

AI Agent otomatik olarak çalışır. `api/app-log.js` endpoint'i hata log'larını aldığında, AI Agent'a forward eder.

### Manuel Test

```bash
curl -X POST https://base-man.vercel.app/api/ai-agent-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "error",
    "message": "Cannot read properties of undefined (reading result)",
    "ts": "2024-01-01T00:00:00.000Z",
    "meta": {
      "filename": "src/miniapp-auth.js",
      "lineno": 45,
      "colno": 12,
      "stack": "TypeError: Cannot read properties of undefined..."
    }
  }'
```

## AI Agent Analiz Formatı

AI Agent şu formatta analiz döner:

```json
{
  "rootCause": "result.result'a erişirken null check eksik",
  "severity": "High",
  "impact": "Kullanıcılar authentication token alamıyor",
  "solution": {
    "file": "src/miniapp-auth.js",
    "line": 45,
    "fix": "result?.result?.token kullan",
    "explanation": "Optional chaining ile null check yap"
  },
  "prevention": "Tüm nested property erişimlerinde optional chaining kullan"
}
```

## Yapılandırma Seçenekleri

### AI_AGENT_ENABLED
- `true`: AI Agent aktif
- `false`: AI Agent devre dışı (varsayılan)

### AI_AGENT_MODEL
- `gpt-4o-mini`: Hızlı ve ucuz (varsayılan)
- `gpt-4o`: Daha detaylı analiz
- `gpt-3.5-turbo`: Daha ucuz ama daha az detaylı

### AI_AGENT_MIN_SEVERITY
- `error`: Sadece error'ları analiz et (varsayılan)
- `warn`: Error ve warning'leri analiz et
- `log`: Tüm log'ları analiz et (maliyetli!)

## Maliyet

- **gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **gpt-4o**: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens

Her hata analizi yaklaşık 500-1000 token kullanır. Cache mekanizması sayesinde aynı hata 5 dakika içinde tekrar analiz edilmez.

## Sorun Giderme

### AI Agent çalışmıyor
1. `AI_AGENT_ENABLED=true` olduğundan emin olun
2. `OPENAI_API_KEY` doğru mu kontrol edin
3. `AI_AGENT_WEBHOOK_URL` doğru mu kontrol edin

### Slack bildirimleri gelmiyor
1. `SLACK_WEBHOOK_URL` doğru mu kontrol edin
2. Slack app'inizde "Incoming Webhooks" aktif mi kontrol edin

### Analiz sonuçları yanlış
1. `AI_AGENT_MODEL`'i `gpt-4o`'ya yükseltin
2. Daha detaylı log'lar gönderin

## İleri Seviye

### Custom AI Prompt
`api/ai-agent-webhook.js` dosyasındaki `analyzeError` fonksiyonunu düzenleyerek AI prompt'unu özelleştirebilirsiniz.

### Rate Limiting
AI Agent cache mekanizması sayesinde aynı hatayı 5 dakika içinde tekrar analiz etmez. Daha agresif rate limiting için cache TTL'ini artırabilirsiniz.

### Batch Processing
Birden fazla hatayı tek seferde analiz etmek için batch processing ekleyebilirsiniz.

## Güvenlik

- ✅ API key'ler `.env.local` dosyasında saklanır (git'e commit edilmez)
- ✅ AI Agent sadece error ve warning log'larını analiz eder
- ✅ Cache mekanizması sayesinde gereksiz API çağrıları yapılmaz
- ⚠️ OpenAI API key'inizi asla public repository'ye commit etmeyin

## Destek

Sorularınız için:
- GitHub Issues: [BaseMan Repository](https://github.com/your-repo)
- Email: your-email@example.com


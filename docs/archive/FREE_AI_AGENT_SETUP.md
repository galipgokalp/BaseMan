# Ücretsiz AI Agent Kurulumu

AI Agent artık **tamamen ücretsiz** çalışabilir! İki seçeneğiniz var:

## 🎯 Seçenek 1: Rule-Based Analysis (Tamamen Ücretsiz, API Gerektirmez)

Rule-based analiz, pattern matching kullanarak hataları analiz eder. Hiçbir API key'e ihtiyaç duymaz.

### Kurulum

`.env.local` dosyanıza ekleyin:

```bash
AI_AGENT_ENABLED=true
AI_PROVIDER=rule-based
AI_AGENT_MODEL=rule-based
AI_AGENT_MIN_SEVERITY=error
```

**Avantajlar:**
- ✅ Tamamen ücretsiz
- ✅ API key gerektirmez
- ✅ Hızlı (anında analiz)
- ✅ Yaygın hata tiplerini tanır

**Desteklenen Hata Tipleri:**
- TypeError (undefined/null erişimi)
- Network/Fetch hataları
- Promise rejection hataları
- JSON parsing hataları
- Authentication hataları

---

## 🚀 Seçenek 2: Groq API (Ücretsiz Tier)

Groq, ücretsiz tier sunar ve çok hızlıdır.

### 1. Groq API Key Alın

1. https://console.groq.com adresine gidin
2. Hesap oluşturun (ücretsiz)
3. API Keys bölümünden yeni key oluşturun

### 2. Environment Variables

`.env.local` dosyanıza ekleyin:

```bash
AI_AGENT_ENABLED=true
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
AI_AGENT_MODEL=llama-3.3-70b-versatile
AI_AGENT_MIN_SEVERITY=error
```

**Avantajlar:**
- ✅ Ücretsiz tier (günlük limit var ama yeterli)
- ✅ Çok hızlı (LLM'ler arasında en hızlı)
- ✅ OpenAI API'ye benzer yapı
- ✅ AI-powered analiz

---

## 🌐 Seçenek 3: OpenRouter (Ücretsiz Modeller)

OpenRouter, ücretsiz modellere erişim sağlar.

### 1. OpenRouter API Key Alın

1. https://openrouter.ai adresine gidin
2. Hesap oluşturun
3. API Keys bölümünden key oluşturun

### 2. Environment Variables

`.env.local` dosyanıza ekleyin:

```bash
AI_AGENT_ENABLED=true
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
AI_AGENT_MODEL=meta-llama/llama-3.3-70b-instruct:free
AI_AGENT_MIN_SEVERITY=error
```

**Ücretsiz Modeller:**
- `meta-llama/llama-3.3-70b-instruct:free`
- `google/gemma-2-9b-it:free`
- `mistralai/mistral-7b-instruct:free`

---

## 📊 Provider Öncelik Sırası

AI Agent şu sırayla provider'ları dener:

1. **Seçilen Provider** (AI_PROVIDER değişkeni)
2. **Diğer Provider'lar** (fallback)
3. **Rule-Based** (her zaman son çare, ücretsiz)

Örnek: `AI_PROVIDER=groq` ise:
1. Groq API dener
2. Başarısız olursa OpenRouter dener
3. O da başarısız olursa OpenAI dener
4. Hepsi başarısız olursa Rule-Based kullanır

---

## 🧪 Test

### Configuration Kontrolü

```bash
curl https://base-man.vercel.app/api/ai-agent-webhook
```

### Hata Analizi Testi

```bash
curl -X POST https://base-man.vercel.app/api/ai-agent-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "error",
    "message": "TypeError: Cannot read properties of undefined",
    "ts": "2024-01-01T00:00:00.000Z",
    "meta": {
      "filename": "src/test.js",
      "lineno": 45,
      "stack": "TypeError: ..."
    }
  }'
```

---

## 🔧 Vercel Deployment

Environment variables'ları Vercel'e ekleyin:

```bash
vercel env add AI_AGENT_ENABLED
vercel env add AI_PROVIDER
vercel env add GROQ_API_KEY  # Eğer Groq kullanıyorsanız
vercel env add OPENROUTER_API_KEY  # Eğer OpenRouter kullanıyorsanız
vercel env add AI_AGENT_MODEL
vercel env add AI_AGENT_MIN_SEVERITY
```

---

## 💡 Öneriler

1. **Başlangıç için:** `AI_PROVIDER=rule-based` kullanın (tamamen ücretsiz)
2. **Daha iyi analiz için:** Groq API key alın (ücretsiz tier)
3. **En iyi analiz için:** OpenRouter ücretsiz modelleri kullanın

---

## 📝 Notlar

- Rule-based analiz her zaman çalışır (fallback)
- Groq ve OpenRouter ücretsiz tier'ları günlük limit içerir
- Tüm provider'lar başarısız olursa otomatik olarak rule-based'e geçer
- Cache mekanizması sayesinde aynı hatalar tekrar analiz edilmez (5 dakika)


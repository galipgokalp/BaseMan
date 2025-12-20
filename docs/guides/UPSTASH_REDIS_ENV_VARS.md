# Upstash Redis Environment Variables

## Mevcut Durum

Şu anda Vercel'de `REDIS_URL` environment variable'ı set edilmiş ve Redis çalışıyor.

## İki Format Seçeneği

### 1. Standart Upstash Format (Önerilen)

```
UPSTASH_REDIS_REST_URL=https://[your-endpoint].upstash.io
UPSTASH_REDIS_REST_TOKEN=[your-token]
```

### 2. Vercel Integration Format (Mevcut)

```
REDIS_URL=redis://[your-endpoint]:[port]
```

## Upstash Dashboard'dan Bilgileri Bulma

1. **Upstash Dashboard'a gidin:**
   - https://console.upstash.com/

2. **Redis Database'inizi seçin:**
   - Sol menüden "Redis" seçin
   - Database'inizi bulun (`store_6OUgrmAQ7wd7ohlI` veya benzeri)

3. **REST API bilgilerini görüntüleyin:**
   - Database sayfasında "REST API" sekmesine gidin
   - "UPSTASH_REDIS_REST_URL" değerini kopyalayın
   - "UPSTASH_REDIS_REST_TOKEN" değerini kopyalayın

4. **Vercel'e ekleyin:**
   - Vercel Dashboard → BaseMan → Settings → Environment Variables
   - Her iki değişkeni ekleyin
   - Environment: Production, Preview, Development (hepsini seçin)

## Redis.fromEnv() Nasıl Çalışıyor?

`@upstash/redis` paketinin `Redis.fromEnv()` fonksiyonu şu sırayla environment variable'ları kontrol eder:

1. `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` (standart format)
2. `REDIS_URL` (bazı entegrasyonlar için)

**Sonuç:** Her iki format da çalışır, ama standart format önerilir.

## Mevcut Durum Test Sonucu

Test endpoint sonucu:
```json
{
  "success": true,
  "redisAvailable": true,
  "environmentVariables": {
    "UPSTASH_REDIS_REST_URL": "Not set",
    "UPSTASH_REDIS_REST_TOKEN": "Not set",
    "REDIS_URL": "Set"
  },
  "redisTest": {
    "operation": "get",
    "success": true
  }
}
```

**Sonuç:** Redis çalışıyor! `REDIS_URL` yeterli, ama standart formatı eklemek daha iyi.

## Sonuç

- ✅ Redis çalışıyor (`REDIS_URL` ile)
- ⚠️ Standart formatı eklemek önerilir (`UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN`)
- ✅ Her iki format da çalışır
- ✅ Profil mapping'leri Redis'e kaydediliyor


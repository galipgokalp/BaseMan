# Kalıcı Profil Storage Planı

## Mevcut Durum

### Şu Anki Sistem
- **Storage**: In-memory `Map` (Vercel Serverless Functions)
- **Problem**: Her serverless function instance'ı kendi memory'sine sahip
- **Sonuç**: Profil mapping'leri kalıcı değil, instance yeniden başlatıldığında kaybolur

### Nasıl Çalışıyor
1. Kullanıcı skor gönderdiğinde → Profil mapping backend'e POST edilir
2. Kullanıcı leaderboard açtığında → Profil mapping header ile gönderilir
3. Backend `ADDRESS_TO_PROFILE_MAP` Map'ine ekler
4. **Problem**: Bu Map sadece o instance için geçerli, diğer instance'larda yok

---

## Çözüm Seçenekleri

### 1. Upstash Redis ⭐ (Önerilen)

**Avantajlar:**
- ✅ **Ücretsiz tier**: 10,000 komut/gün, 256MB storage
- ✅ **Vercel entegrasyonu**: Marketplace'ten 1-click kurulum
- ✅ **Hızlı**: < 10ms latency
- ✅ **Kalıcı**: Veriler silinmez (TTL yoksa)
- ✅ **Otomatik ölçeklenebilir**: Trafik arttıkça otomatik ölçeklenir

**Dezavantajlar:**
- ⚠️ **Rate limit**: Ücretsiz tier'da günlük 10K komut limiti
- ⚠️ **Storage limit**: 256MB (binlerce profil için yeterli)

**Maliyet:**
- Ücretsiz tier: 10K komut/gün + 256MB storage
- Pro tier: $0.20/100K komut (ihtiyaç olduğunda)

**Kurulum Süresi**: ~15 dakika

---

### 2. Vercel KV

**Avantajlar:**
- ✅ **Vercel native**: Vercel'in kendi servisi
- ✅ **Kolay entegrasyon**: Vercel dashboard'dan yönetim
- ✅ **Hızlı**: Düşük latency

**Dezavantajlar:**
- ❌ **Fiyatlandırma belirsiz**: Public pricing yok (fiyat teklifi gerekli)
- ❌ **Beta aşamasında**: Henüz genel kullanıma açık değil olabilir

**Maliyet:** Bilinmiyor (Vercel ile iletişime geçmek gerekir)

**Kurulum Süresi**: ~30 dakika (fiyat teklifi dahil)

---

### 3. PostgreSQL / MongoDB (Database)

**Avantajlar:**
- ✅ **Güçlü**: Karmaşık sorgular yapılabilir
- ✅ **İlişkisel veri**: Başka veriler de saklanabilir
- ✅ **Kalıcı**: Veriler kaybolmaz

**Dezavantajlar:**
- ❌ **Aşırı karmaşık**: Basit key-value için gereksiz
- ❌ **Yavaş**: Network latency (Redis'ten daha yavaş)
- ❌ **Maliyetli**: Ücretsiz tier'lar sınırlı
- ❌ **Kurulum karmaşık**: Database setup ve connection pooling

**Maliyet:**
- Supabase (PostgreSQL): Ücretsiz tier mevcut ama sınırlı
- MongoDB Atlas: Ücretsiz tier mevcut ama sınırlı

**Kurulum Süresi**: ~1-2 saat

---

## Önerilen Çözüm: Upstash Redis

### Neden Upstash Redis?

1. **Ücretsiz ve Yeterli**: 10K komut/gün profil storage için fazlasıyla yeterli
   - Profil kaydetme: ~2 komut (SET + EXPIRE)
   - Profil okuma: ~1 komut (GET)
   - Günlük 5,000 kullanıcı için yeterli (her kullanıcı 2 kez leaderboard açsa bile)

2. **Hızlı Kurulum**: Vercel Marketplace'ten 1-click kurulum

3. **Basit API**: Key-value storage, profil verisi için ideal

4. **Kalıcı**: Veriler 7 gün (TTL) veya süresiz saklanabilir

---

## Implementasyon Planı

### Adım 1: Upstash Redis Kurulumu

1. **Vercel Dashboard'a git**
   - https://vercel.com/dashboard
   - Projenizi seçin: "BaseMan"

2. **Marketplace'ten Upstash Redis ekle**
   - Settings → Integrations → Browse Marketplace
   - "Upstash Redis" bulun
   - "Add Integration" → "Create Database"
   - Database adı: `baseman-profile-storage`
   - Region: Vercel ile aynı region (veya yakın)

3. **Environment Variables otomatik eklenir**
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Adım 2: Package.json'a Dependency Ekle

```bash
npm install @upstash/redis
```

### Adım 3: Redis Helper Fonksiyonları Oluştur

`api/_lib/redis-profiles.js` dosyası oluştur:

```javascript
import { Redis } from '@upstash/redis';

// Redis client (environment variables'dan otomatik alır)
const redis = Redis.fromEnv();

// Key prefix
const PROFILE_KEY_PREFIX = 'profile:';
const PROFILE_TTL = 7 * 24 * 60 * 60; // 7 gün (saniye cinsinden)

/**
 * Profil mapping'i Redis'e kaydet
 */
export async function saveProfileMapping(address, mapping) {
  if (!address || !mapping || !mapping.fid) {
    return false;
  }
  
  const key = `${PROFILE_KEY_PREFIX}${address.toLowerCase()}`;
  const value = {
    fid: String(mapping.fid),
    username: mapping.username || null,
    displayName: mapping.displayName || null,
    avatarUrl: mapping.avatarUrl || null,
    updatedAt: Date.now()
  };
  
  try {
    await redis.set(key, JSON.stringify(value), { ex: PROFILE_TTL });
    console.log(`[redis-profiles] Saved profile mapping for ${address.toLowerCase()}`);
    return true;
  } catch (error) {
    console.error(`[redis-profiles] Failed to save profile mapping:`, error);
    return false;
  }
}

/**
 * Redis'ten profil mapping'i oku
 */
export async function getProfileMapping(address) {
  if (!address || typeof address !== 'string') {
    return null;
  }
  
  const key = `${PROFILE_KEY_PREFIX}${address.toLowerCase()}`;
  
  try {
    const data = await redis.get(key);
    if (!data) {
      return null;
    }
    
    const mapping = typeof data === 'string' ? JSON.parse(data) : data;
    
    // TTL kontrolü (Redis otomatik yapar ama double-check)
    if (mapping.updatedAt && (Date.now() - mapping.updatedAt) > (PROFILE_TTL * 1000)) {
      await redis.del(key); // Expired, sil
      return null;
    }
    
    return mapping;
  } catch (error) {
    console.error(`[redis-profiles] Failed to get profile mapping:`, error);
    return null;
  }
}

/**
 * Birden fazla adres için profil mapping'leri toplu oku
 */
export async function getProfileMappings(addresses) {
  if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return new Map();
  }
  
  const keys = addresses
    .filter(addr => addr && typeof addr === 'string')
    .map(addr => `${PROFILE_KEY_PREFIX}${addr.toLowerCase()}`);
  
  if (keys.length === 0) {
    return new Map();
  }
  
  try {
    const values = await redis.mget(...keys);
    const results = new Map();
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const address = addresses[i];
      const data = values[i];
      
      if (data) {
        const mapping = typeof data === 'string' ? JSON.parse(data) : data;
        
        // TTL kontrolü
        if (mapping.updatedAt && (Date.now() - mapping.updatedAt) <= (PROFILE_TTL * 1000)) {
          results.set(address.toLowerCase(), mapping);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`[redis-profiles] Failed to get profile mappings:`, error);
    return new Map();
  }
}
```

### Adım 4: Leaderboard.js'i Güncelle

`api/leaderboard.js` dosyasını Redis kullanacak şekilde güncelle:

```javascript
import { saveProfileMapping as saveToRedis, getProfileMapping as getFromRedis, getProfileMappings } from './_lib/redis-profiles.js';

// Mevcut in-memory Map'i fallback olarak tut (Redis yoksa kullan)
const ADDRESS_TO_PROFILE_MAP = new Map();

export function getProfileMapping(address) {
  // Önce Redis'ten dene
  // (async fonksiyon olduğu için direkt çağrılamaz, bu yüzden farcaster-profiles.js'den çağrılacak)
  // ...
}

export async function getAllFidMappings(addresses) {
  // Önce Redis'ten toplu oku
  const redisMappings = await getProfileMappings(addresses);
  const result = new Map();
  
  // Redis'ten gelenleri ekle
  for (const [address, mapping] of redisMappings) {
    if (mapping && mapping.fid) {
      result.set(address, mapping.fid);
    }
  }
  
  // In-memory Map'i fallback olarak kullan (header'dan gelenler için)
  for (const address of addresses) {
    if (!address || typeof address !== 'string') continue;
    const key = address.toLowerCase();
    if (!result.has(key)) {
      const mapping = ADDRESS_TO_PROFILE_MAP.get(key);
      if (mapping && mapping.fid) {
        result.set(key, mapping.fid);
      }
    }
  }
  
  return result;
}

// POST handler'da Redis'e kaydet
if (req.method === "POST" && req.query.action === "profile-mapping") {
  // ... mevcut kod ...
  
  // Redis'e kaydet (async, hata olsa bile devam et)
  saveToRedis(address, {
    fid: String(fid),
    username: username || null,
    displayName: displayName || null,
    avatarUrl: avatarUrl || null
  }).catch(err => {
    console.warn('[leaderboard] Failed to save to Redis (non-critical):', err);
  });
  
  // ... mevcut kod ...
}
```

### Adım 5: Farcaster Profiles.js'i Güncelle

`api/_lib/farcaster-profiles.js` dosyasında Redis'ten okuma ekle:

```javascript
import { getProfileMapping as getFromRedis } from './redis-profiles.js';

export async function fetchProfilesForAddresses(addresses = []) {
  // ... mevcut kod ...
  
  // Step 2: Check Redis first (persistent storage)
  const addressesNeedingFetch = normalizedAddresses.filter(
    addr => !results.has(addr.toLowerCase())
  );
  
  // Redis'ten toplu oku
  if (addressesNeedingFetch.length > 0) {
    const redisMappings = await getProfileMappings(addressesNeedingFetch);
    
    for (const [address, mapping] of redisMappings) {
      if (mapping && (mapping.username || mapping.displayName || mapping.avatarUrl)) {
        const key = address.toLowerCase();
        const profile = {
          fid: mapping.fid,
          username: mapping.username,
          displayName: mapping.displayName,
          avatarUrl: mapping.avatarUrl,
          profileUrl: mapping.username
            ? `https://warpcast.com/${mapping.username}`
            : mapping.fid
            ? `https://warpcast.com/~/users/${mapping.fid}`
            : null,
          address: normalizeAddress(address),
          provider: 'redis-persistent'
        };
        results.set(key, profile);
        PROFILE_CACHE.set(key, profile);
        console.log(`[farcaster-profiles] ✅ Using Redis mapping for ${key}:`, profile.username || profile.displayName || 'unnamed');
      }
    }
  }
  
  // ... mevcut kod (header/SDK context kontrolü) ...
}
```

---

## Maliyet Analizi

### Upstash Redis Ücretsiz Tier

**Limitler:**
- 10,000 komut/gün
- 256MB storage
- Global replication

**Günlük Kullanım Senaryosu:**

1. **Profil kaydetme** (skor gönderildiğinde):
   - SET komutu: 1
   - EXPIRE komutu: 1 (SET içinde yapılabilir)
   - **Toplam**: ~1 komut/kullanıcı

2. **Profil okuma** (leaderboard açıldığında):
   - MGET komutu: 1 (tüm adresler için toplu okuma)
   - 10 kullanıcı için: 1 komut
   - **Toplam**: ~1 komut/leaderboard request

3. **Günlük Kullanım Tahmini:**
   - 100 kullanıcı skor gönderir: 100 komut
   - 500 kullanıcı leaderboard açar (her biri 10 profil görür): 500 komut
   - **Toplam**: ~600 komut/gün
   - **Limit**: 10,000 komut/gün
   - **Kullanım**: %6

**Sonuç**: Ücretsiz tier yeterli! ✅

### Storage Tahmini

Her profil mapping ~200 byte:
- Address: 42 byte
- FID: 10 byte
- Username: ~30 byte
- Display name: ~50 byte
- Avatar URL: ~100 byte
- Metadata: ~50 byte

**256MB = 256,000,000 byte**
**1,280,000 profil saklanabilir** (256MB / 200 byte)

**Sonuç**: Storage yeterli! ✅

---

## Test Planı

### 1. Redis Bağlantı Testi
- [ ] Redis client bağlantısı çalışıyor mu?
- [ ] Environment variables doğru mu?

### 2. Profil Kaydetme Testi
- [ ] Skor gönderildiğinde Redis'e kaydediliyor mu?
- [ ] TTL doğru ayarlanmış mı?

### 3. Profil Okuma Testi
- [ ] Leaderboard açıldığında Redis'ten okunuyor mu?
- [ ] Fallback (in-memory) çalışıyor mu?

### 4. Kalıcılık Testi
- [ ] Profil verisi 7 gün sonra hala var mı?
- [ ] Expired veriler otomatik siliniyor mu?

### 5. Performans Testi
- [ ] Redis latency kabul edilebilir mi? (< 50ms)
- [ ] Toplu okuma (MGET) hızlı mı?

---

## Sonraki Adımlar

1. ✅ Upstash Redis kurulumu
2. ✅ Package.json'a dependency ekleme
3. ✅ Redis helper fonksiyonları oluşturma
4. ✅ Leaderboard.js'i güncelleme
5. ✅ Farcaster-profiles.js'i güncelleme
6. ✅ Test etme
7. ✅ Production'a deploy

**Toplam Süre**: ~2-3 saat (test dahil)

---

## Alternatif: Mevcut Sistemle Devam (Şimdilik)

Eğer Redis kurulumu şu an için karmaşık geliyorsa, mevcut sistemle devam edebiliriz:

**Avantajlar:**
- ✅ Hiçbir dependency yok
- ✅ Ücretsiz
- ✅ Basit

**Dezavantajlar:**
- ❌ Kalıcı değil (instance yeniden başlatıldığında kaybolur)
- ❌ Diğer kullanıcıların profil verileri görünmez (sadece o an aktif olanlar)

**Öneri**: Redis kurulumu yapmak 2-3 saat alır ve kalıcı çözüm sağlar. Şimdilik mevcut sistemle test edebilir, daha sonra Redis'e geçebiliriz.


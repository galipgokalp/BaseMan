# Leaderboard Profil Resmi ve Kullanıcı Adı Görünürlük Sorunu - Analiz ve Çözümler

## Mevcut Durum

Leaderboard panelinde kullanıcı profil resmi ve kullanıcı adı görünmüyor. Bu doküman, sorunun nedenlerini ve çözüm önerilerini içerir.

## Mimari Genel Bakış

### 1. Veri Akışı

```
Leaderboard API (/api/leaderboard)
  ↓
enrichWithProfiles() → fetchProfilesForAddresses()
  ↓
Neynar API (v2/farcaster/user/by/verified_address)
  ↓
normalizeUser() → { username, displayName, avatarUrl, profileUrl }
  ↓
Frontend (leaderboard-panel.js)
  ↓
createListItem() → DOM rendering
```

### 2. API Tarafı

**Dosya:** `api/leaderboard.js`

- `enrichWithProfiles()` fonksiyonu profil verilerini zenginleştirir
- `fetchProfilesForAddresses()` Neynar API'den profil verilerini çeker
- Profil verileri `profile` objesi olarak döndürülür:
  ```javascript
  {
    rank: 1,
    player: "0x...",
    totalScore: 1000,
    profile: {
      username: "username",
      displayName: "Display Name",
      avatarUrl: "https://...",
      profileUrl: "https://warpcast.com/username"
    }
  }
  ```

**Dosya:** `api/_lib/farcaster-profiles.js`

- `fetchNeynarProfile()` Neynar API v2 endpoint'ini kullanır
- `normalizeUser()` API yanıtını normalize eder
- Avatar URL'i şu alanlardan alınır:
  - `user.pfp?.url`
  - `user.profile?.pfp_url`
  - `user.profile?.pfp?.url`
  - `user.profile?.avatar_url`

### 3. Frontend Tarafı

**Dosya:** `src/leaderboard-panel.js`

- `createListItem()` fonksiyonu DOM elementlerini oluşturur
- Profil verileri şu şekilde kullanılır:
  ```javascript
  entry?.profile?.avatarUrl  // Avatar resmi
  entry?.profile?.displayName || entry?.profile?.username  // Kullanıcı adı
  ```

## Tespit Edilen Sorunlar ve Çözümler

### Sorun 1: Ortam Değişkenleri Eksik veya Yanlış Yapılandırılmış

**Olası Nedenler:**
- `NEYNAR_API_KEY` eksik veya geçersiz
- `FARCASTER_PROFILE_PROVIDER` yanlış ayarlanmış
- `LEADERBOARD_DISABLE_PROFILE_ENRICHMENT` aktif

**Çözüm:**

1. **Neynar API Anahtarı Alın:**
   - https://dev.neynar.com/ adresinden ücretsiz API anahtarı alın
   - Vercel Environment Variables'a ekleyin: `NEYNAR_API_KEY`

2. **Ortam Değişkenlerini Kontrol Edin:**
   ```bash
   # .env veya Vercel Environment Variables
   NEYNAR_API_KEY=your_api_key_here
   FARCASTER_PROFILE_PROVIDER=neynar  # veya boş bırakın (default: neynar)
   LEADERBOARD_DISABLE_PROFILE_ENRICHMENT=  # Boş olmalı veya "0", "false"
   ```

3. **Test:**
   ```bash
   curl "https://api.neynar.com/v2/farcaster/user/by/verified_address?address=0x..." \
     -H "api_key: YOUR_API_KEY"
   ```

### Sorun 2: Neynar API Yanıt Formatı Değişmiş Olabilir

**Olası Neden:**
- Neynar API v2 yanıt formatı değişmiş olabilir
- `normalizeUser()` fonksiyonu tüm olası formatları kapsamıyor olabilir

**Çözüm:**

1. **API Yanıtını Loglayın:**
   ```javascript
   // api/_lib/farcaster-profiles.js içinde
   const payload = await response.json();
   console.log('[farcaster-profiles] Neynar API response:', JSON.stringify(payload, null, 2));
   ```

2. **normalizeUser() Fonksiyonunu Güncelleyin:**
   - API yanıtındaki tüm olası alanları kontrol edin
   - Yeni formatları ekleyin

3. **Fallback Mekanizması Ekleyin:**
   - Avatar URL bulunamazsa Effigy.im kullanın
   - Username bulunamazsa adres kısaltması kullanın

### Sorun 3: CSS Görünürlük Sorunları

**Çözüm (Zaten Uygulandı):**

1. ✅ Avatar boyutu: 32px → 40px
2. ✅ Username font-size: 0.56rem → 0.95rem
3. ✅ `leaderboard-text` için `display: flex`, `flex-direction: column`, `flex: 1`
4. ✅ `leaderboard-identity` için `flex: 1` ve `overflow: hidden`

### Sorun 4: Profil Verileri API'den Gelmiyor

**Olası Nedenler:**
- Neynar API rate limit
- Adres doğrulama hatası
- Cache sorunu

**Çözüm:**

1. **Hata Loglarını Kontrol Edin:**
   ```javascript
   // api/_lib/farcaster-profiles.js içinde
   catch (error) {
     console.error("[farcaster-profiles] resolve error", error);
     // Daha detaylı log ekleyin
   }
   ```

2. **Cache'i Temizleyin:**
   - `PROFILE_CACHE` Map'ini temizleyin
   - Veya cache TTL ekleyin

3. **Rate Limiting Ekleyin:**
   - Neynar API rate limit'lerini kontrol edin
   - Batch request'ler için delay ekleyin

## Önerilen Geliştirmeler

### 1. Debug Modu Ekleme

```javascript
// api/leaderboard.js içinde
const DEBUG_PROFILES = process.env.LEADERBOARD_DEBUG_PROFILES === "true";

if (DEBUG_PROFILES) {
  console.log('[leaderboard] Profile enrichment:', {
    itemsCount: items.length,
    addresses: addresses,
    profileMapSize: profileMap.size
  });
}
```

### 2. Fallback Avatar Sistemi İyileştirme

```javascript
// src/leaderboard-panel.js içinde
const fallbackAvatar = (address) => {
  if (!address) return "";
  // Effigy.im kullan (zaten var)
  return `https://effigy.im/a/${address}.png`;
};

// Avatar yüklenemezse fallback göster
img.onerror = function() {
  this.style.display = 'none';
  avatar.textContent = "👾";
  // Veya Effigy.im fallback'i kullan
  const fallbackImg = document.createElement('img');
  fallbackImg.src = fallbackAvatar(entry.player);
  fallbackImg.onerror = () => {
    avatar.textContent = "👾";
  };
  avatar.appendChild(fallbackImg);
};
```

### 3. Profil Verisi Doğrulama

```javascript
// src/leaderboard-panel.js içinde
const hasProfile = entry?.profile && (
  entry.profile.avatarUrl || 
  entry.profile.username || 
  entry.profile.displayName
);

if (!hasProfile) {
  console.warn('[leaderboard] Missing profile data for:', entry.player);
}
```

### 4. API Response Validation

```javascript
// api/_lib/farcaster-profiles.js içinde
function normalizeUser(user, address) {
  if (!user) return null;
  
  // Daha fazla alan kontrolü
  const avatarUrl =
    user.pfp?.url ??
    user.pfp_url ??
    user.profile?.pfp?.url ??
    user.profile?.pfp_url ??
    user.profile?.avatar_url ??
    user.avatar_url ??
    null;
  
  // URL validation
  if (avatarUrl && !avatarUrl.startsWith('http')) {
    console.warn('[farcaster-profiles] Invalid avatar URL:', avatarUrl);
    return null;
  }
  
  // ... rest of the function
}
```

## Test Senaryoları

### 1. Ortam Değişkenleri Testi

```bash
# Yerel test
curl http://localhost:5173/api/leaderboard?limit=5

# Production test
curl https://your-app.vercel.app/api/leaderboard?limit=5
```

### 2. Profil Zenginleştirme Testi

```bash
# Neynar API direkt test
curl "https://api.neynar.com/v2/farcaster/user/by/verified_address?address=0x..." \
  -H "api_key: YOUR_API_KEY" \
  -H "x-api-key: YOUR_API_KEY"
```

### 3. Frontend Testi

1. Tarayıcı konsolunu açın
2. Leaderboard panelini açın
3. Network tab'ında `/api/leaderboard` request'ini kontrol edin
4. Response'da `profile` objelerinin olup olmadığını kontrol edin
5. Console'da hata var mı kontrol edin

## Checklist

- [ ] `NEYNAR_API_KEY` Vercel'de ayarlı mı?
- [ ] `FARCASTER_PROFILE_PROVIDER` doğru ayarlanmış mı?
- [ ] `LEADERBOARD_DISABLE_PROFILE_ENRICHMENT` kapalı mı?
- [ ] Neynar API anahtarı geçerli mi?
- [ ] API yanıtında profil verileri var mı?
- [ ] CSS stilleri doğru uygulanmış mı?
- [ ] Fallback mekanizmaları çalışıyor mu?
- [ ] Console'da hata var mı?

## Sonraki Adımlar

1. **Hemen Yapılacaklar:**
   - Vercel Environment Variables'ı kontrol edin
   - Neynar API anahtarı ekleyin
   - Test edin

2. **Kısa Vadede:**
   - Debug logları ekleyin
   - API yanıt formatını doğrulayın
   - Fallback mekanizmalarını iyileştirin

3. **Uzun Vadede:**
   - Profil cache mekanizması ekleyin
   - Rate limiting iyileştirin
   - Error handling'i güçlendirin

## Referanslar

- Neynar API Docs: https://docs.neynar.com/
- Farcaster Mini Apps Docs: https://miniapps.farcaster.xyz/
- Base Mini Apps Docs: https://docs.base.org/mini-apps/


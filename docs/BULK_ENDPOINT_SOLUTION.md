# Bulk Endpoint Çözümü - Ücretsiz Alternatif

## ✅ Bulgu

**`/v2/farcaster/user/bulk` endpoint'i ücretsiz ve çalışıyor!**

Test sonucu:
```json
{
  "users": [
    {
      "fid": 3,
      "username": "dwr",
      "display_name": "Dan Romero",
      "pfp_url": "https://...",
      "verified_addresses": {
        "eth_addresses": [
          "0x187c7b0393ebe86378128f2653d0930e33218899",
          "0x6ce09ed5526de4afe4a981ad86d17b2f5c92fea5"
        ]
      }
    }
  ]
}
```

## 🔍 Sorun

Bulk endpoint FID ile çalışıyor, ama leaderboard'da sadece Ethereum adresi var.

### İhtiyaç:
- Ethereum adresi → FID mapping'i
- Sonra FID → Profil (bulk endpoint ile)

## 💡 Çözüm Yaklaşımları

### Yaklaşım 1: Reverse Lookup (Verified Addresses)

Bulk endpoint'in yanıtında `verified_addresses` var. Eğer tüm kullanıcıları bulk ile çekersek ve reverse mapping oluşturursak:

**Sorun:** Tüm kullanıcıları çekmek mümkün değil (FID'leri bilmiyoruz)

### Yaklaşım 2: Mini App Context Cache

1. Mini app açıldığında SDK context'ten kullanıcı bilgilerini al
2. Ethereum adresi → FID mapping'i backend'de sakla (database/cache)
3. Leaderboard'da FID mapping'i kullanarak bulk endpoint'i çağır

**Avantajlar:**
- Ücretsiz endpoint kullanılır
- Kademeli olarak mapping oluşturulur
- Mini app kullanan kullanıcılar için profil bilgisi gelir

**Dezavantajlar:**
- İlk başta mapping boş olur
- Mini app açmayan kullanıcılar için profil bilgisi gelmez

### Yaklaşım 3: Hybrid (Önerilen)

**Adım 1:** Mini app açıldığında
```javascript
// Frontend: src/profile-panel.js veya benzer
const context = await sdk.context;
// context.user.fid
// context.user.username
// context.user.displayName
// context.user.pfpUrl

// Backend'e mapping gönder
await fetch('/api/profile-mapping', {
  method: 'POST',
  body: JSON.stringify({
    address: userAddress,
    fid: context.user.fid,
    username: context.user.username,
    displayName: context.user.displayName,
    avatarUrl: context.user.pfpUrl
  })
});
```

**Adım 2:** Backend'de mapping sakla
```javascript
// api/profile-mapping.js
// PostgreSQL veya basit cache (Map/Redis)
// address → { fid, username, displayName, avatarUrl }
```

**Adım 3:** Leaderboard'da bulk endpoint kullan
```javascript
// api/_lib/farcaster-profiles.js
async function fetchProfilesForAddresses(addresses) {
  // 1. Address → FID mapping'den FID'leri al
  const fids = addresses.map(addr => getFidFromMapping(addr)).filter(Boolean);
  
  // 2. Bulk endpoint ile profil bilgilerini çek
  const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids.join(',')}`, {
    headers: {
      'api_key': NEYNAR_API_KEY,
      'x-api-key': NEYNAR_API_KEY,
      'accept': 'application/json'
    }
  });
  
  // 3. FID → Address reverse mapping oluştur
  // 4. Address → Profile mapping döndür
}
```

## 🔧 Uygulama Adımları

### 1. Profile Mapping Endpoint Oluştur

```javascript
// api/profile-mapping.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { address, fid, username, displayName, avatarUrl } = req.body;
    
    // Mapping'i sakla (PostgreSQL, Redis, veya basit Map)
    await saveProfileMapping(address, { fid, username, displayName, avatarUrl });
    
    return res.status(200).json({ success: true });
  }
  
  // GET için FID mapping'i döndür
  if (req.method === 'GET') {
    const { address } = req.query;
    const mapping = await getProfileMapping(address);
    return res.status(200).json(mapping);
  }
}
```

### 2. Farcaster Profiles Kütüphanesini Güncelle

```javascript
// api/_lib/farcaster-profiles.js

// Yeni fonksiyon: Bulk endpoint ile profil çekme
async function fetchProfilesByFids(fids) {
  if (!fids.length) return new Map();
  
  const url = `${NEYNAR_API_BASE_URL}/v2/farcaster/user/bulk?fids=${fids.join(',')}`;
  const response = await fetch(url, {
    headers: {
      'api_key': NEYNAR_API_KEY,
      'x-api-key': NEYNAR_API_KEY,
      'accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    if (response.status === 404) return new Map();
    throw new Error(`Neynar bulk API responded with ${response.status}`);
  }
  
  const payload = await response.json();
  const users = payload?.users || [];
  
  // FID → Profile mapping oluştur
  const fidMap = new Map();
  users.forEach(user => {
    if (user.fid) {
      fidMap.set(String(user.fid), normalizeUser(user, null));
    }
  });
  
  return fidMap;
}

// Mevcut fonksiyonu güncelle
async function fetchProfilesForAddresses(addresses) {
  // 1. Address → FID mapping'den FID'leri al
  const addressToFid = await getFidMappingsForAddresses(addresses);
  
  // 2. FID'leri topla
  const fids = Array.from(new Set(
    Array.from(addressToFid.values()).filter(Boolean)
  ));
  
  // 3. Bulk endpoint ile profil bilgilerini çek
  const fidToProfile = await fetchProfilesByFids(fids);
  
  // 4. Address → Profile mapping oluştur
  const result = new Map();
  addresses.forEach(address => {
    const fid = addressToFid.get(address.toLowerCase());
    if (fid && fidToProfile.has(String(fid))) {
      result.set(address.toLowerCase(), fidToProfile.get(String(fid)));
    } else {
      result.set(address.toLowerCase(), null);
    }
  });
  
  return result;
}
```

## 📊 Avantajlar

1. ✅ **Ücretsiz**: Bulk endpoint ücretsiz görünüyor
2. ✅ **Ölçeklenebilir**: Birden fazla kullanıcıyı tek seferde çekebilir
3. ✅ **Kademeli**: Mapping oluştukça daha fazla profil bilgisi gelir
4. ✅ **Fallback**: Mapping yoksa mevcut fallback çalışır

## ⚠️ Dikkat Edilmesi Gerekenler

1. **FID Mapping Storage**: Mapping'i nerede saklayacağız?
   - PostgreSQL (kalıcı)
   - Redis (hızlı)
   - In-memory Map (basit ama geçici)

2. **Mini App Context**: SDK context'ten bilgi almak için mini app içinde olmak gerekiyor

3. **İlk Kullanım**: İlk başta mapping boş olacak, kademeli olarak dolacak

## 🎯 Sonuç

Bulk endpoint ücretsiz ve çalışıyor! Hybrid yaklaşım ile:
- Mini app kullanan kullanıcılar için profil bilgisi gelecek
- Kademeli olarak mapping oluşacak
- Ücretsiz endpoint kullanılacak

---

**Son Güncelleme**: 2024-01-XX


# Ücretsiz ve Risksiz Çözüm Planı

## 🎯 Amaç
Leaderboard'da profil resmi ve kullanıcı adı göstermek - **ücretsiz ve risksiz** şekilde.

## ✅ Çözüm: SDK Context + Bulk Endpoint

### Yaklaşım
1. **Mini app açıldığında**: SDK context'ten kullanıcı bilgilerini al
2. **Backend'e gönder**: Address + FID + Username + DisplayName + AvatarUrl
3. **Backend'de sakla**: Basit in-memory Map (key: address, value: profile)
4. **Leaderboard'da kullan**: 
   - Önce mapping'e bak
   - Varsa direkt kullan
   - Yoksa bulk endpoint kullan (FID varsa)
   - Hiçbiri yoksa fallback

### Avantajlar
- ✅ **Ücretsiz**: Bulk endpoint ücretsiz
- ✅ **Risksiz**: Mevcut koda minimal ekleme
- ✅ **Kademeli**: Mapping oluştukça çalışır
- ✅ **Basit**: In-memory Map (database gerekmez)
- ✅ **Fallback**: Mapping yoksa mevcut fallback çalışır

## 🔧 Uygulama Adımları

### 1. Frontend: SDK Context + Wallet Address

Mini app açıldığında kullanıcı bilgilerini backend'e gönder:

```javascript
// src/profile-panel.js veya yeni bir dosya
async function sendProfileMapping() {
  try {
    // SDK context'ten kullanıcı bilgilerini al
    if (window.sdk && window.sdk.context) {
      const context = await window.sdk.context;
      const user = context.user;
      
      // Wallet address'i al (onchain-client.js'den)
      const walletAddress = await getWalletAddress(); // Mevcut wallet detection'dan
      
      if (walletAddress && user && user.fid) {
        // Backend'e gönder
        await fetch('/api/profile-mapping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: walletAddress.toLowerCase(),
            fid: user.fid,
            username: user.username || null,
            displayName: user.displayName || null,
            avatarUrl: user.pfpUrl || null
          })
        });
      }
    }
  } catch (error) {
    console.error('[profile-mapping] Failed to send:', error);
    // Sessizce fail - leaderboard çalışmaya devam eder
  }
}
```

### 2. Backend: Profile Mapping Endpoint

Basit bir endpoint oluştur:

```javascript
// api/profile-mapping.js
const ADDRESS_TO_PROFILE_MAP = new Map();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { address, fid, username, displayName, avatarUrl } = req.body;
    
    if (!address || !fid) {
      return res.status(400).json({ error: 'Address and FID required' });
    }
    
    const key = address.toLowerCase();
    ADDRESS_TO_PROFILE_MAP.set(key, {
      fid: String(fid),
      username: username || null,
      displayName: displayName || null,
      avatarUrl: avatarUrl || null,
      updatedAt: Date.now()
    });
    
    return res.status(200).json({ success: true });
  }
  
  // GET için mapping döndür
  if (req.method === 'GET') {
    const { address } = req.query;
    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }
    
    const key = address.toLowerCase();
    const profile = ADDRESS_TO_PROFILE_MAP.get(key);
    
    return res.status(200).json(profile || null);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
```

### 3. Farcaster Profiles: Bulk Endpoint Kullan

Mevcut `api/_lib/farcaster-profiles.js` dosyasını güncelle:

```javascript
// Yeni fonksiyon: Bulk endpoint ile profil çekme
async function fetchProfilesByFids(fids) {
  if (!fids.length || !NEYNAR_API_KEY) return new Map();
  
  try {
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
      console.warn('[farcaster-profiles] Bulk API error:', response.status);
      return new Map();
    }
    
    const payload = await response.json();
    const users = payload?.users || [];
    
    // FID → Profile mapping oluştur
    const fidMap = new Map();
    users.forEach(user => {
      if (user.fid) {
        const fidStr = String(user.fid);
        // verified_addresses'den address bul
        const addresses = user.verified_addresses?.eth_addresses || [];
        if (addresses.length > 0) {
          addresses.forEach(addr => {
            const normalizedAddr = normalizeAddress(addr);
            if (normalizedAddr) {
              fidMap.set(fidStr, normalizeUser(user, normalizedAddr));
            }
          });
        } else {
          fidMap.set(fidStr, normalizeUser(user, null));
        }
      }
    });
    
    return fidMap;
  } catch (error) {
    console.error('[farcaster-profiles] Bulk fetch error:', error);
    return new Map();
  }
}

// fetchProfilesForAddresses'i güncelle
export async function fetchProfilesForAddresses(addresses = []) {
  // 1. SDK context mapping'den FID'leri al
  const addressToFid = new Map();
  addresses.forEach(addr => {
    const normalized = normalizeAddress(addr);
    if (normalized) {
      // profile-mapping endpoint'inden FID al
      // Bu kısım için basit bir helper fonksiyon gerekir
      const mapping = getProfileMapping(normalized); // In-memory Map'ten
      if (mapping?.fid) {
        addressToFid.set(normalized.toLowerCase(), mapping.fid);
      }
    }
  });
  
  // 2. FID'leri topla
  const fids = Array.from(new Set(Array.from(addressToFid.values()).filter(Boolean)));
  
  // 3. Bulk endpoint ile profil bilgilerini çek
  const fidToProfile = await fetchProfilesByFids(fids);
  
  // 4. Address → Profile mapping oluştur
  const result = new Map();
  addresses.forEach(address => {
    const normalized = normalizeAddress(address);
    if (!normalized) {
      result.set(address.toLowerCase(), null);
      return;
    }
    
    const key = normalized.toLowerCase();
    const fid = addressToFid.get(key);
    
    if (fid && fidToProfile.has(fid)) {
      result.set(key, fidToProfile.get(fid));
    } else {
      // Mevcut mapping'den direkt profil bilgisi varsa kullan
      const directMapping = getProfileMapping(normalized);
      if (directMapping && (directMapping.username || directMapping.displayName)) {
        result.set(key, {
          fid: directMapping.fid,
          username: directMapping.username,
          displayName: directMapping.displayName,
          avatarUrl: directMapping.avatarUrl,
          profileUrl: directMapping.username 
            ? `https://warpcast.com/${directMapping.username}`
            : null,
          address: normalized,
          provider: 'sdk-context'
        });
      } else {
        result.set(key, null);
      }
    }
  });
  
  return result;
}
```

## 📊 Risk Analizi

### Risk Seviyesi: **Çok Düşük** ✅

1. **Mevcut kod korunur**: Fallback mekanizması çalışmaya devam eder
2. **Basit eklemeler**: Sadece yeni fonksiyonlar, mevcut kod değişmez
3. **Sessiz fail**: Hata durumunda sessizce fallback'e geçer
4. **In-memory**: Database gerekmez, restart olursa yeniden toplanır

### Potansiyel Sorunlar ve Çözümleri

1. **In-memory Map kaybolur**: Restart olursa mapping sıfırlanır
   - **Çözüm**: Sorun değil, kademeli olarak yeniden toplanır

2. **Wallet address yok**: SDK context var ama wallet bağlı değil
   - **Çözüm**: Sadece wallet bağlı olduğunda gönder

3. **Bulk endpoint limit**: Çok fazla istek yaparsa limit aşılabilir
   - **Çözüm**: Cache kullan, aynı FID için tekrar istek yapma

## 🎯 Sonuç

Bu çözüm:
- ✅ **Ücretsiz**: Bulk endpoint ücretsiz
- ✅ **Risksiz**: Mevcut koda minimal etki
- ✅ **Çalışır**: Kademeli olarak profil bilgileri gelir
- ✅ **Basit**: Database gerekmez

---

**Son Güncelleme**: 2024-01-XX


# Merge Duplicate Profiles Plan

## Problem
Aynı kullanıcı (aynı FID) farklı cüzdan adresleri ile oyun oynayıp skor gönderebiliyor. Bu durumda leaderboard'da aynı kullanıcı birden fazla kez görünüyor.

### Senaryo
- **Base App Smart Wallet**: `0xAAA...` → FID: 399673 → Score: 1000
- **Farcaster EOA Wallet**: `0xBBB...` → FID: 399673 → Score: 800

**Şu anki durum:**
```
Leaderboard:
1. digitech.base.eth (0xAAA...) - 1000 puan
2. digitech.base.eth (0xBBB...) - 800 puan
```

**Hedef durum:**
```
Leaderboard:
1. digitech.base.eth (0xAAA...) - 1000 puan
   (Merged addresses: [0xBBB...])
```

## Çözüm Yaklaşımı

### Merge Kriteri
**Sadece FID (Farcaster ID) kullanılmalı:**
- ✅ FID benzersiz ve değişmez (güvenli)
- ❌ Username ile merge yapılmamalı (farklı kullanıcılar aynı username'e sahip olabilir)

### Merge Mantığı
1. Aynı FID'ye sahip entry'leri tespit et
2. En yüksek skorlu entry'yi koru
3. Diğer entry'lerin cüzdan adreslerini `mergedAddresses` array'ine ekle
4. Merge edilen entry'leri leaderboard'dan kaldır
5. Skorlara göre yeniden sırala ve rank'leri güncelle

### Özel Durumlar

#### Senaryo 1: Aynı FID, Farklı Username'ler
```
Entry 1: 0xAAA... - FID: 399673 - Username: "alice.base.eth" - Score: 1000
Entry 2: 0xBBB... - FID: 399673 - Username: "bob" - Score: 800
```
**Sonuç:** Entry 1 gösterilir (en yüksek skorlu), Entry 2'nin adresi `mergedAddresses`'e eklenir.

#### Senaryo 2: Farklı FID'ler
```
Entry 1: 0xAAA... - FID: 123 - Score: 1000
Entry 2: 0xBBB... - FID: 456 - Score: 800
```
**Sonuç:** Merge edilmez (farklı kullanıcılar).

#### Senaryo 3: FID Yok
```
Entry 1: 0xAAA... - FID: null - Score: 1000
Entry 2: 0xBBB... - FID: null - Score: 800
```
**Sonuç:** Merge edilmez (FID olmadan merge kriteri yok).

## Implementasyon Detayları

### Dosya: `api/leaderboard.js`

#### Fonksiyon: `mergeDuplicateProfiles(items)`
- **Konum:** `enrichWithProfiles()` fonksiyonundan sonra çağrılacak
- **Input:** Enriched leaderboard items (array)
- **Output:** Merged leaderboard items (array)
- **Özellikler:**
  - Sadece FID ile merge yapar
  - En yüksek skorlu entry'yi korur
  - Diğer adresleri `mergedAddresses` array'ine ekler
  - Merge sonrası skorlara göre yeniden sıralar

#### Merge Sonrası Entry Yapısı
```javascript
{
  rank: 1,
  player: "0xAAA...",  // Ana cüzdan adresi (en yüksek skorlu)
  totalScore: 1000,
  profile: {
    fid: "399673",
    username: "digitech.base.eth",
    displayName: "...",
    avatarUrl: "..."
  },
  mergedAddresses: ["0xBBB..."]  // Merge edilen diğer cüzdan adresleri
}
```

## Güvenlik Analizi

### ✅ Güvenli Yönler
1. **Sadece görüntüleme katmanında çalışır:**
   - Blockchain verilerini değiştirmez
   - Skor gönderme işlemini etkilemez
   - API response'unda sadece merge işlemi yapar

2. **FID kullanımı güvenli:**
   - FID benzersiz ve değişmez
   - Farcaster/Base App ekosisteminde resmi kimlik

3. **Backward compatible:**
   - Mevcut API yapısını korur
   - Sadece yeni field ekler (`mergedAddresses`)

### ⚠️ Dikkat Edilmesi Gerekenler
1. **Username fallback kullanılmamalı:**
   - Farklı kullanıcılar aynı username'e sahip olabilir
   - Case-sensitivity sorunları olabilir

2. **FID olmayan entry'ler:**
   - Profil bilgisi olmayan entry'ler merge edilmez (normal)

3. **UI'da `mergedAddresses` gösterimi:**
   - Şu an UI'da gösterilmiyor
   - İleride gösterilmek istenirse ek geliştirme gerekir

## Test Senaryoları

### Test 1: Aynı FID, İki Farklı Cüzdan
- **Input:** 2 entry, aynı FID, farklı skorlar
- **Beklenen:** En yüksek skorlu entry gösterilir, diğer `mergedAddresses`'e eklenir

### Test 2: Aynı FID, Üç Farklı Cüzdan
- **Input:** 3 entry, aynı FID, farklı skorlar
- **Beklenen:** En yüksek skorlu entry gösterilir, diğer 2 `mergedAddresses`'e eklenir

### Test 3: Farklı FID'ler
- **Input:** 2 entry, farklı FID'ler
- **Beklenen:** Merge edilmez, her ikisi de gösterilir

### Test 4: FID Yok
- **Input:** 2 entry, FID null
- **Beklenen:** Merge edilmez, her ikisi de gösterilir

## Kod Değişiklikleri

### Eklenmesi Gereken Fonksiyon
```javascript
function mergeDuplicateProfiles(items) {
  // Implementation details...
  // 1. Group items by FID
  // 2. For each FID group, keep highest score entry
  // 3. Add other addresses to mergedAddresses
  // 4. Re-sort and re-rank
}
```

### Değiştirilmesi Gereken Yer
```javascript
// enrichWithProfiles fonksiyonunda:
const enriched = items.map(...);
// ✅ Buraya eklenecek:
const merged = mergeDuplicateProfiles(enriched);
const ranked = merged.map((item, index) => ({
  ...item,
  rank: index + 1
}));
return { enriched: ranked, debugInfo };
```

## Sonraki Adımlar

1. ✅ Plan dokümantasyonu oluşturuldu
2. ⏳ Implementasyon yapılacak (ileride)
3. ⏳ Test senaryoları çalıştırılacak
4. ⏳ UI'da `mergedAddresses` gösterimi (opsiyonel)

## Referanslar

- **FID (Farcaster ID):** Farcaster ekosisteminde benzersiz kullanıcı kimliği
- **Base App Docs:** https://docs.base.org/mini-apps
- **Farcaster Mini Apps:** https://miniapps.farcaster.xyz/
- **Mevcut Implementasyon:** `api/leaderboard.js` (merge fonksiyonu kaldırıldı, eski haline döndü)

## Notlar

- Merge işlemi sadece görüntüleme katmanında yapılır
- Blockchain verileri hiç değişmez
- Skor gönderme işlemi etkilenmez
- Her cüzdan adresi blockchain'de ayrı entry olarak kalır




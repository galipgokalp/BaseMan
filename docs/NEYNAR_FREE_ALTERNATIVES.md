# Neynar API Ücretsiz Alternatif Endpoint'ler

## 📋 Sorun
`/v2/farcaster/user/by/verified_address` endpoint'i ücretli plan gerektiriyor (402 PaymentRequired).

## 🔍 Araştırma Sonuçları

### 1. Neynar API Ücretsiz Tier Endpoint'leri

Neynar'ın ücretsiz planında mevcut endpoint'ler araştırılmalı. Muhtemel alternatifler:

#### Seçenek 1: Bulk Users Lookup (FID ile)
```
GET /v2/farcaster/user/bulk?fids=1,2,3
```
**Avantajlar:**
- FID ile arama yapılabilir
- Bulk işlem (birden fazla kullanıcı tek seferde)
- Ücretsiz plan dahil olabilir

**Dezavantajlar:**
- Ethereum adresinden FID bilgisine ihtiyaç var
- İki aşamalı işlem gerekebilir

#### Seçenek 2: User by Username
```
GET /v2/farcaster/user/by_username?username=username
```
**Avantajlar:**
- Username ile direkt arama
- Ücretsiz plan dahil olabilir

**Dezavantajlar:**
- Ethereum adresinden username bilgisine ihtiyaç var
- Leaderboard'da adres var, username yok

### 2. Ethereum Adresinden FID Bulma

Ethereum adresinden FID'ye geçiş yapılabilirse, sonra FID ile profil bilgisi çekilebilir.

#### Seçenek A: Blockchain'den FID Bulma
- Farcaster protokolünden direkt FID bilgisi alınabilir
- Ancak bu karmaşık bir işlem

#### Seçenek B: Farcaster Hubs API
- Farcaster'ın açık hub'larından veri çekilebilir
- Ücretsiz ama teknik olarak daha karmaşık

### 3. Farcaster Mini Apps SDK Context

Mini app içinde açıldığında, SDK context'inden kullanıcı bilgilerine erişim var:

```javascript
// Frontend'de (mini app içinde)
const context = await sdk.context;
// context.user.fid
// context.user.username
// context.user.displayName
// context.user.pfpUrl
```

**Avantajlar:**
- Ücretsiz
- Direkt kullanıcı bilgisi
- Mini app içinde çalışır

**Dezavantajlar:**
- Sadece mini app içinde çalışır
- Backend leaderboard için kullanılamaz
- Kullanıcının kendi profili için geçerli

### 4. Alternatif Çözüm: FID Mapping Cache

**Yaklaşım:**
1. Mini app açıldığında SDK context'ten kullanıcı bilgilerini al
2. Ethereum adresi → FID mapping'i backend'de sakla
3. Leaderboard'da FID mapping'i kullanarak profil bilgilerini çek

**Avantajlar:**
- Ücretsiz endpoint kullanılabilir
- Kademeli olarak mapping oluşturulur

**Dezavantajlar:**
- İlk başta mapping boş olur
- Mini app açmayan kullanıcılar için profil bilgisi gelmez

## 🎯 Önerilen Çözüm

### Seçenek 1: Neynar'ın FID Bazlı Endpoint'ini Kullan

Eğer Ethereum adresinden FID'yi bulabilirsek:
```javascript
// 1. Adım: Adres → FID (blokchain'den veya cache'den)
// 2. Adım: FID → Profil (Neynar API)
GET /v2/farcaster/user/bulk?fids=1,2,3
```

### Seçenek 2: Hybrid Approach

1. **Mini App Context**: Kullanıcı mini app açtığında SDK'dan bilgileri al ve mapping oluştur
2. **Backend Cache**: Ethereum adresi → FID/Username mapping'i sakla
3. **Neynar Bulk API**: FID ile profil bilgilerini çek (ücretsiz olabilir)

### Seçenek 3: Mevcut Durumu Koru (Fallback)

- Profil verisi olmayan kullanıcılar için fallback (emoji + adres) gösteriliyor
- Bu normal davranış
- Kullanıcı deneyimi kabul edilebilir seviyede

## 📚 Neynar API Dokümantasyonu

### Kontrol Edilmesi Gerekenler:

1. **Pricing Sayfası**: https://neynar.com/#pricing
   - Hangi endpoint'ler ücretsiz?
   - `/v2/farcaster/user/bulk` ücretsiz mi?

2. **API Reference**: https://docs.neynar.com/reference
   - Bulk users endpoint'i
   - User by username endpoint'i
   - FID lookup endpoint'leri

3. **Alternative Endpoints**:
   - `/v2/farcaster/user/bulk`
   - `/v2/farcaster/user/by_username`
   - `/v2/farcaster/user?fid=123`

## 🔧 Uygulama Adımları

### Test Edilecek Endpoint'ler:

1. **Bulk Users by FID**:
```bash
curl "https://api.neynar.com/v2/farcaster/user/bulk?fids=3" \
  -H "api_key: CB03EA24-94BA-45F3-A64C-9C17A0DF4E13" \
  -H "x-api-key: CB03EA24-94BA-45F3-A64C-9C17A0DF4E13"
```

2. **User by Username**:
```bash
curl "https://api.neynar.com/v2/farcaster/user/by_username?username=dwr.eth" \
  -H "api_key: CB03EA24-94BA-45F3-A64C-9C17A0DF4E13" \
  -H "x-api-key: CB03EA24-94BA-45F3-A64C-9C17A0DF4E13"
```

## ⚠️ Notlar

- Tüm endpoint'lerin ücretsiz olup olmadığı test edilmelidir
- Neynar pricing sayfası kontrol edilmelidir
- FID mapping yaklaşımı karmaşık olabilir
- Mevcut fallback çözümü de kabul edilebilir bir seçenek

---

**Son Güncelleme**: 2024-01-XX


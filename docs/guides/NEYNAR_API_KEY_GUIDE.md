# Neynar API Anahtarı Alma Rehberi

## 🎯 Amaç
Leaderboard'da kullanıcı profil resmi ve kullanıcı adı göstermek için Neynar API anahtarı gereklidir.

## 📝 Adım Adım Rehber

### 1. Neynar Hesabı Oluşturma

**Resmi Dokümantasyon**: [Getting Started with Neynar](https://docs.neynar.com/docs/getting-started-with-neynar#get-neynar-api-key)

1. **Web sitesine gidin**: https://neynar.com
2. **"Create an account"** veya **"Sign up"** butonuna tıklayın
   - Ücretsiz hesap oluşturabilirsiniz
   - Email ile kayıt olabilirsiniz
3. **Hesabınızı doğrulayın** (email doğrulama gerekebilir)

### 2. API Anahtarı Oluşturma

1. **Giriş yaptıktan sonra Dashboard'a gidin**
2. **"API Keys"** veya **"Settings"** bölümünü bulun
   - Genellikle sol menüde veya üst menüde bulunur
3. **"Create API Key"** veya **"New API Key"** butonuna tıklayın
4. **API anahtarınızı kopyalayın** (bir daha gösterilmeyebilir!)
   - ⚠️ **ÖNEMLİ**: API anahtarını güvenli bir yerde saklayın
   - API anahtarı bir kez gösterilir, sonra tekrar gösterilmez

### 3. API Anahtarını Projeye Ekleme

#### Yerel Geliştirme (.env)

```bash
# .env dosyasına ekleyin
NEYNAR_API_KEY=your_api_key_here
```

#### Vercel (Production)

1. **Vercel Dashboard** → Projeniz → **Settings** → **Environment Variables**
2. **Add New** butonuna tıklayın
3. Formu doldurun:
   - **Name**: `NEYNAR_API_KEY`
   - **Value**: API anahtarınız
   - **Environment**: Production, Preview, Development (hepsini seçin)
4. **Save** butonuna tıklayın
5. **Redeploy** yapın (değişikliklerin aktif olması için)

### 4. API Anahtarını Test Etme

#### Terminal'den Test

```bash
# Bir Ethereum adresi ile test edin
curl "https://api.neynar.com/v2/farcaster/user/by/verified_address?address=0x..." \
  -H "api_key: YOUR_API_KEY" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "x-neynar-experimental: true"
```

#### Başarılı Yanıt Örneği

```json
{
  "result": {
    "user": {
      "fid": 12345,
      "username": "username",
      "display_name": "Display Name",
      "pfp": {
        "url": "https://..."
      }
    }
  }
}
```

### 5. Ortam Değişkenlerini Kontrol Etme

#### Gerekli Ortam Değişkenleri

```bash
# Zorunlu
NEYNAR_API_KEY=your_api_key_here

# Opsiyonel (default: neynar)
FARCASTER_PROFILE_PROVIDER=neynar

# Opsiyonel (profil enrichment'i kapatmak için)
LEADERBOARD_DISABLE_PROFILE_ENRICHMENT=  # Boş olmalı
```

#### Kontrol Komutları

```bash
# Yerel test
echo $NEYNAR_API_KEY

# Vercel'de kontrol
vercel env ls
```

## 🔍 Sorun Giderme

### API Anahtarı Çalışmıyor

1. **API anahtarını kontrol edin**: Doğru kopyalandığından emin olun
2. **Rate limit**: Ücretsiz plan limitlerini kontrol edin
3. **API endpoint**: Doğru endpoint kullanıldığından emin olun

### Profil Verileri Gelmiyor

1. **Ortam değişkeni kontrolü**: `NEYNAR_API_KEY` set edilmiş mi?
2. **API yanıtı kontrolü**: Console loglarını kontrol edin
3. **Cache temizleme**: Profil cache'i temizleyin

### 401/402 Hataları

- **401 Unauthorized**: API anahtarı geçersiz veya eksik
- **402 Payment Required**: Ücretsiz plan limiti aşılmış olabilir

## 📚 Referanslar

- **Resmi Dokümantasyon**: [Getting Started with Neynar](https://docs.neynar.com/docs/getting-started-with-neynar#get-neynar-api-key)
- **Neynar Ana Sayfa**: https://neynar.com
- **Neynar Developer Portal**: https://dev.neynar.com/
- **Neynar API Docs**: https://docs.neynar.com/
- **API Endpoint**: `/v2/farcaster/user/by/verified_address`
- **Developer Slack**: https://neynar.com/slack (Sorular için)

## ✅ Checklist

- [ ] Neynar Developer Portal'a kayıt oldum
- [ ] API anahtarı oluşturdum
- [ ] API anahtarını `.env` dosyasına ekledim
- [ ] API anahtarını Vercel Environment Variables'a ekledim
- [ ] API anahtarını test ettim
- [ ] Leaderboard'da profil resmi ve kullanıcı adı görünüyor

---

**Son Güncelleme**: 2024-01-XX


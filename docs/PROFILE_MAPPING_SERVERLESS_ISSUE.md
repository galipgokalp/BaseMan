# Profile Mapping Serverless Issue

## ❌ Sorun: Vercel Serverless Functions ve In-Memory Map

**Problem:**
- Vercel Serverless Functions'da her request **yeni bir instance** oluşturur
- In-memory `Map` her request'te **sıfırlanır**
- Profile mapping kaydediliyor ama bir sonraki request'te **kayboluyor**

**Örnek:**
1. Request 1: Profile mapping POST → Map'e kaydediliyor ✅
2. Request 2: Leaderboard GET → **Yeni instance**, Map boş ❌

## 🔍 Mevcut Durum

### Mapping Nasıl Çalışıyor:
1. Mini app açıldığında → SDK context → POST `/api/leaderboard?action=profile-mapping`
2. Mapping `ADDRESS_TO_PROFILE_MAP` Map'ine kaydediliyor
3. Leaderboard yüklenirken → GET `/api/leaderboard`
4. `getAllFidMappings()` çağrılıyor → **Ama Map boş!** (Yeni instance)

## 💡 Çözüm Seçenekleri

### Seçenek 1: External Storage (Önerilen - Gelecek)
- **Redis**: Hızlı, cache-friendly
- **PostgreSQL**: Kalıcı storage
- **Vercel KV**: Vercel'in managed Redis servisi

**Avantajlar:**
- ✅ Kalıcı storage
- ✅ Tüm instance'lar paylaşır
- ✅ Production-ready

**Dezavantajlar:**
- ❌ Ek maliyet
- ❌ Setup gerekiyor

### Seçenek 2: Client-Side Storage + API (Geçici Çözüm)
- Frontend'de localStorage/IndexedDB'de mapping sakla
- Her leaderboard request'inde mapping'i header'da gönder
- Backend header'dan alıp kullan

**Avantajlar:**
- ✅ Hızlı implement
- ✅ Ücretsiz

**Dezavantajlar:**
- ❌ Her request'te mapping gönderilmeli
- ❌ Sadece o kullanıcının mapping'i

### Seçenek 3: SDK Context Direkt Kullanım (Şimdilik - En Basit)
- Mapping yoksa bulk endpoint'i atla
- Direkt SDK context mapping'i kullan (zaten `fetchProfilesForAddresses` içinde var)
- Sadece kullanıcının kendi profilini göster

**Avantajlar:**
- ✅ Hemen çalışır
- ✅ Kod değişikliği minimal

**Dezavantajlar:**
- ❌ Sadece kendi profili gösterilir
- ❌ Diğer kullanıcılar için profil yok

### Seçenek 4: Hybrid Approach (Önerilen - Şimdilik)
- SDK context mapping'i direkt kullan (mapping yoksa)
- Bulk endpoint'i dene (FID varsa)
- Gelecekte Redis/PostgreSQL ekle

**Avantajlar:**
- ✅ Şimdilik çalışır
- ✅ Gelecekte genişletilebilir
- ✅ Risksiz

## 🎯 Önerilen Aksiyon: Seçenek 4 (Hybrid)

**Şimdilik:**
1. SDK context mapping'i direkt kullan (mapping var ama Map boş)
2. Bulk endpoint'i dene (FID varsa)
3. Fallback: Eski endpoint veya null

**Gelecekte:**
1. Vercel KV veya Redis ekle
2. Mapping'i persistent storage'a taşı
3. Tüm instance'lar paylaşır

---

**Son Güncelleme**: 2024-01-XX


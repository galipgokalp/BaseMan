# API Endpoints Analizi - Vercel Function Limit

## 📊 Mevcut Durum
- **Limit**: 12 Serverless Function (Vercel Hobby)
- **Mevcut**: 13 Function (limit aşıldı)
- **Gereksiz**: 2-3 function potansiyel olarak kaldırılabilir

## 🔍 API Endpoints Kullanım Analizi

### ✅ Gerekli Endpoints (Production)

1. **`/api/env.js`** ✅ GEREKLİ
   - Kullanım: `index.html` içinde yükleniyor
   - Amaç: Public environment variables'ı client'a inject ediyor
   - Durum: Kritik, kaldırılamaz

2. **`/api/score-sign`** ✅ GEREKLİ
   - Kullanım: `onchain-client.js` - Skor imzalama
   - Amaç: Blockchain'e skor göndermek için imza oluşturma
   - Durum: Kritik, kaldırılamaz

3. **`/api/quest-sign`** ✅ GEREKLİ
   - Kullanım: Quest imzalama
   - Amaç: Quest görevleri için imza
   - Durum: Gerekli

4. **`/api/paymaster-proxy`** ✅ GEREKLİ
   - Kullanım: `onchain-client.js` - Paymaster proxy
   - Amaç: Gas ücretlerini sponsor ediyor
   - Durum: Kritik, kaldırılamaz

5. **`/api/miniapp-auth`** ✅ GEREKLİ
   - Kullanım: Mini app authentication
   - Amaç: Mini app kullanıcı doğrulama
   - Durum: Gerekli

6. **`/api/leaderboard`** ✅ GEREKLİ
   - Kullanım: `leaderboard-panel.js` - Leaderboard gösterimi
   - Amaç: Skor sıralaması ve profil enrichment
   - Durum: Kritik, kaldırılamaz

7. **`/api/address-history`** ✅ GEREKLİ
   - Kullanım: `profile-panel.js` - Kullanıcı geçmişi
   - Amaç: Kullanıcının blockchain etkileşimlerini gösterme
   - Durum: Gerekli

8. **`/api/token-balances`** ✅ GEREKLİ
   - Kullanım: `profile-panel.js` - Token bakiyeleri
   - Amaç: ETH/USDC bakiye gösterimi
   - Durum: Gerekli

9. **`/api/app-log`** ⚠️ DEĞERLENDİRME GEREKLİ
   - Kullanım: Çok fazla yerde (debugging için)
   - Amaç: Development/Production log takibi
   - Durum: Production'da gerekli mi? Development için kullanılıyor gibi görünüyor
   - **Öneri**: Production'da devre dışı bırakılabilir mi?

10. **`/api/miniapp-webhook`** ✅ GEREKLİ
    - Kullanım: `manifest.base.json` - webhookUrl olarak ayarlanmış
    - Amaç: Mini app webhook'ları alıyor
    - Durum: Manifest'te tanımlı, gerekli

### ❌ Potansiyel Gereksiz Endpoints

11. **`/api/debug-env`** ❌ GEREKSIZ (Production)
    - Kullanım: Sadece `debug.html` dosyasında
    - Amaç: Development ortamı için debug bilgisi
    - Durum: **Production'da gerekli değil, kaldırılabilir**

12. **`/api/_test-verify`** ❌ GEREKSIZ (Production)
    - Kullanım: Test endpoint'i
    - Amaç: Development'da token verification testi
    - Durum: **"DEV-ONLY" yazıyor, kaldırılabilir**

13. **`/api/webhook`** ❌ GEREKSIZ (Production)
    - Kullanım: Kod içinde kullanılmıyor
    - Amaç: Basit bir "ok: true" döndürüyor
    - Durum: **Gerçek işlevi yok, `miniapp-webhook` var zaten, kaldırılabilir**

## 🎯 Önerilen Aksiyon

### Seçenek 1: En Az Riskli (Önerilen)
**2 endpoint kaldır:**
1. `/api/debug-env` - Sadece debug.html için
2. `/api/_test-verify` - Test için, DEV-ONLY

**Sonuç**: 13 → 11 function ✅ (Limit altında)

### Seçenek 2: Daha Agresif
**3 endpoint kaldır:**
1. `/api/debug-env` 
2. `/api/_test-verify`
3. `/api/webhook` - Gerçek işlevi yok

**Sonuç**: 13 → 10 function ✅✅ (Limit'in altında)

### Seçenek 3: En Agresif (Riskli)
**4 endpoint kaldır:**
1. `/api/debug-env`
2. `/api/_test-verify`
3. `/api/webhook`
4. `/api/app-log` - Production'da devre dışı bırakılabilir

**Sonuç**: 13 → 9 function ✅✅✅ (Çok güvenli limit altı)

**UYARI**: `app-log` çok fazla yerde kullanılıyor, production'da sorun çıkarabilir.

## 📝 Notlar

- Vercel Hobby planında `_lib` klasöründeki dosyalar function sayılmaz
- `_test-verify.js` ve `debug-env.js` sadece development için
- `webhook.js` gerçek işlevi yok, `miniapp-webhook.js` zaten var
- Production'da debug/test endpoint'leri gereksiz

---

**Öneri**: Seçenek 1 veya 2 uygulanabilir. Seçenek 3 riskli.


# Base App Wallet Connection Guide

**Tarih:** 2025-01-06  
**Soru:** Base App'da mini app açıldığında passkey veya herhangi bir onay olmadan direk cüzdan bağlantısı olması gerekliliği ile ilgili bilgi var mı? Base App'da cüzdan bağlantısı nasıl olmalı?

---

## 📚 Base App Dokümantasyonundan Önemli Bilgiler

### 1. Onboarding ve Wallet Rehberi ✅

**Kaynak:** [Optimize Onboarding](https://docs.base.org/mini-apps/growth/optimize-onboarding)

> "Prefer the built-in Base Account; only offer connect/switch for alternate wallets, never gating"
> "Do not show a connect button on first load"
> "For onchain actions, use the Base Account automatically. Eliminate explicit wallet connect flows"
> "Base App provides an in-app Base Account. This should be the default wallet used by your app to streamline interactions."

**Anlamı:**
- ✅ Base Account varsayılan cüzdan olmalı
- ✅ İlk yüklemede connect button gösterilmemeli
- ✅ Onchain aksiyonlarda Base Account otomatik kullanılmalı
- ✅ Alternatif cüzdanlar opsiyonel ve non-blocking olmalı

### 2. Passkey Prompt Davranışı ⚠️

**Not:** Resmi doküman passkey prompt ayrıntısını belirtmiyor. BaseMan uygulamasında `eth_requestAccounts` sadece işlem başlatıldığında çağrılır; ilk işlemde passkey prompt görülmesi normaldir.

---

## 🎯 Base App Wallet Connection Best Practices

### ✅ Yapılması Gerekenler

1. **Otomatik Kullanım:**
   - İlk yüklemede connect flow gösterme
   - `eth_accounts` ile mevcut bağlantıyı kontrol et
   - Bağlantı varsa kullan; yoksa onchain aksiyonunda bağlantı iste

2. **Connect Button Gösterme:**
   - İlk yüklemede connect button gösterme
   - Wallet connection flow'u ekleme
   - Base Account otomatik kullanılmalı

3. **Progressive Disclosure:**
   - Kullanıcı bir işlem yapmak istediğinde wallet hazır olmalı
   - Prompt davranışı host'a bağlı olabilir
   - Kullanıcıya neden wallet gerektiğini açıkla

4. **Alternate Wallets (Opsiyonel):**
   - Eğer başka wallet'lar destekleniyorsa, bunlar opsiyonel ve non-blocking olmalı
   - Base Account varsayılan olmalı
   - Connect/switch butonları gating yapmamalı

### ❌ Yapılmaması Gerekenler

1. **Proactive SignIn:**
   - Mini app açıldığında `signIn()` çağırma
   - Passkey prompt'larını tetikleme
   - Kullanıcıdan onay isteme

2. **Connect Button:**
   - İlk yüklemede connect button gösterme
   - Wallet connection flow'u ekleme
   - Explicit wallet connect prompts

3. **Gating:**
   - Wallet connection'ı app kullanımı için gating yapma
   - Kullanıcıyı wallet connection'a zorlama
   - Read-only mode'u engelleme

---

## 🔍 Mevcut BaseMan Implementasyonu

### ✅ Doğru Yapılanlar

1. **Otomatik Bağlantı (Arka Plan):**
   ```javascript
   // src/onchain-client.js - satır 1284-1308
   if (isMiniAppEnv()) {
     (async () => {
       try {
         const provider = await sdk.wallet.getEthereumProvider();
         if (provider) {
           const accounts = await provider.request({ method: 'eth_accounts' });
           if (Array.isArray(accounts) && accounts.length > 0) {
             await ensureWallet(); // ✅ Otomatik bağlantı
           }
         }
       } catch (_) {
         // Wallet will be connected on first use
       }
     })();
   }
   ```

2. **Proactive SignIn Yok:**
   ```javascript
   // src/onchain-client.js - satır 417-426
   // Do NOT call signIn proactively. Some hosts will prompt passkey on signIn.
   // We rely on provider injection and request accounts.
   const forceSignIn = Boolean(...);
   if (forceSignIn && sdk.actions && typeof sdk.actions.signIn === 'function') {
     await sdk.actions.signIn({ acceptAuthAddress: true });
   }
   ```
   - ✅ Varsayılan olarak `signIn()` çağrılmıyor
   - ✅ Sadece `NEXT_PUBLIC_REQUIRE_SIGNIN=1` veya `?signin` query param ile çağrılıyor

3. **Connect Menu Suppression:**
   - ✅ Connect menu mini app ortamlarında gizleniyor
   - ✅ Connect button gösterilmiyor

### ⚠️ İyileştirilebilir Alanlar

1. **Wallet Connection Timing:**
   - Şu an: Arka planda `eth_accounts` ile kontrol ediliyor
   - Öneri: Mini app açıldığında daha agresif bağlantı denemesi yapılabilir

2. **Error Handling:**
   - `eth_accounts` başarısız olursa wallet hazır olmayabilir
   - İlk transaction'da `eth_requestAccounts` çağrılabilir (kullanıcı onayı gerekebilir)

---

## 📋 Base App Dokümantasyon Özeti

**Optimize Onboarding dokümanina göre:**
- Base Account, varsayılan cüzdandır
- İlk yüklemede connect button gösterilmez
- Onchain aksiyonlarda Base Account otomatik kullanılmalı; explicit connect flow'ları kaldırılmalı
- Alternatif cüzdanlar opsiyonel ve non-blocking olmalı

**Not:** Passkey prompt davranışı resmi dokümanda detaylandırılmıyor; uygulama davranışı host ve işlem akışına bağlıdır.

---

## ✅ Sonuç

### Base App Dokümantasyonuna Göre:

1. **✅ Varsayılan cüzdan:** Base Account kullanılır
2. **✅ Connect Button Yok:** İlk yüklemede connect button gösterilmez
3. **✅ Niyet odaklı akış:** Onchain aksiyonlarda Base Account otomatik kullanılır
4. **✅ Alternatif cüzdanlar:** Opsiyonel ve non-blocking

### Mevcut BaseMan Implementasyonu:

- ✅ **Otomatik bağlantı:** Arka planda `eth_accounts` ile kontrol ediliyor
- ✅ **Proactive signIn yok:** Passkey prompt'ları önleniyor
- ✅ **Connect menu gizli:** Mini app ortamlarında connect UI gösterilmiyor
- ✅ **Base Account varsayılan:** Base App'da Base Account otomatik kullanılıyor

**Sonuç:** ✅ Mevcut implementasyon Base App dokümantasyonuna uyumlu!

---

## 🔗 Referanslar

- [Optimize Onboarding](https://docs.base.org/mini-apps/growth/optimize-onboarding)
- [MiniKit Provider](https://docs.base.org/onchainkit/latest/components/minikit/provider-and-initialization)
- [Base App Compatibility](https://docs.base.org/mini-apps/troubleshooting/base-app-compatibility)

# Base App Wallet Connection Guide

**Tarih:** 2025-01-06  
**Soru:** Base App'da mini app açıldığında passkey veya herhangi bir onay olmadan direk cüzdan bağlantısı olması gerekliliği ile ilgili bilgi var mı? Base App'da cüzdan bağlantısı nasıl olmalı?

---

## 📚 Base App Dokümantasyonundan Önemli Bilgiler

### 1. Otomatik Wallet Bağlantısı ✅

**Kaynak:** [Base Mini Apps - Base Account](https://docs.base.org/mini-apps/core-concepts/base-account)

> **"Mini Apps launched within the Base App are automatically connected to the user's Base Account, eliminating wallet connection flows and enabling instant onchain interactions."**

**Anlamı:**
- ✅ Mini app açıldığında **otomatik olarak** Base Account'a bağlanır
- ✅ Wallet connection flow'u **elimine edilir** (gerekli değil)
- ✅ **Anında onchain etkileşimler** mümkün olur
- ✅ **Zero-friction approach** - kullanıcı hiçbir wallet setup yapmadan işlem yapabilir

### 2. Connect Button Gösterilmemeli ❌

**Kaynak:** [Base Mini Apps - Recommended Onboarding Flow](https://docs.base.org/mini-apps/guides/onboarding)

> **"Do not show a connect button on first load"**

**Anlamı:**
- ❌ İlk yüklemede connect button gösterilmemeli
- ❌ Wallet connection flow'u olmamalı
- ✅ Base Account otomatik kullanılmalı

### 3. Onchain Actions için Otomatik Base Account Kullanımı ✅

**Kaynak:** [Base Mini Apps - Recommended Onboarding Flow](https://docs.base.org/mini-apps/guides/onboarding)

> **"For onchain actions, use the Base Account automatically. Eliminate explicit wallet connect flows"**

**Anlamı:**
- ✅ Onchain işlemler için Base Account **otomatik olarak** kullanılmalı
- ✅ Explicit wallet connect flow'ları **elimine edilmeli**
- ✅ Kullanıcıdan wallet connection onayı istenmemeli

### 4. Base Account Varsayılan Wallet Olmalı ✅

**Kaynak:** [Base Mini Apps - Recommended Onboarding Flow](https://docs.base.org/mini-apps/guides/onboarding)

> **"Base App provides an in-app Base Account. This should be the default wallet used by your app to streamline interactions."**

**Anlamı:**
- ✅ Base Account **varsayılan wallet** olmalı
- ✅ İşlemleri **streamline** etmek için kullanılmalı
- ✅ Kullanıcı deneyimini iyileştirmek için otomatik bağlanmalı

### 5. Passkey Prompt Sadece Transaction'lar İçin ⚠️

**Kaynak:** [Base Account - Technical Details](https://docs.base.org/base-account/improve-ux/sub-accounts)

> **"Base Account's self-custodial design requires a user passkey prompt for each wallet interaction, such as transactions or message signing."**

**Anlamı:**
- ⚠️ Passkey prompt **sadece transaction'lar ve message signing** için gereklidir
- ✅ **Wallet connection** için passkey prompt gerekmez
- ✅ Mini app açıldığında otomatik bağlantı olur (passkey olmadan)
- ⚠️ İlk transaction'da passkey prompt görünebilir (bu normal)

---

## 🎯 Base App Wallet Connection Best Practices

### ✅ Yapılması Gerekenler

1. **Otomatik Bağlantı:**
   - Mini app açıldığında Base Account'a otomatik bağlan
   - `eth_accounts` ile mevcut bağlantıyı kontrol et
   - Bağlantı varsa otomatik kullan

2. **Connect Button Gösterme:**
   - İlk yüklemede connect button gösterme
   - Wallet connection flow'u ekleme
   - Base Account otomatik kullanılmalı

3. **Progressive Disclosure:**
   - Kullanıcı bir işlem yapmak istediğinde wallet hazır olmalı
   - İlk transaction'da passkey prompt görünebilir (bu normal)
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

### Wallet Connection Flow

**Base App Dokümantasyonuna Göre:**

1. **Mini App Açıldığında:**
   - ✅ Base Account otomatik olarak bağlanır
   - ✅ Passkey/onay gerekmez
   - ✅ `eth_accounts` ile mevcut bağlantı kontrol edilir
   - ✅ Bağlantı varsa otomatik kullanılır

2. **İlk Transaction'da:**
   - ⚠️ Passkey prompt görünebilir (Base Account self-custodial design)
   - ✅ Bu normal ve beklenen davranış
   - ✅ Kullanıcı transaction'ı onaylar

3. **Sonraki Transaction'lar:**
   - ✅ Base Account zaten bağlı
   - ⚠️ Her transaction için passkey prompt görünebilir (güvenlik için)
   - ✅ Sub Accounts kullanılırsa spend permissions ile prompt azaltılabilir

### Connect Button ve Wallet Flow

**Base App Dokümantasyonuna Göre:**

- ❌ **Connect button gösterilmemeli** (ilk yüklemede)
- ❌ **Wallet connection flow'u olmamalı** (explicit)
- ✅ **Base Account otomatik kullanılmalı**
- ✅ **Alternate wallets opsiyonel** (non-blocking)

---

## ✅ Sonuç

### Base App Dokümantasyonuna Göre:

1. **✅ Otomatik Bağlantı:** Mini app açıldığında Base Account otomatik bağlanmalı (passkey/onay olmadan)

2. **✅ Connect Button Yok:** İlk yüklemede connect button gösterilmemeli

3. **✅ Zero-Friction:** Wallet connection flow'u elimine edilmeli

4. **⚠️ Transaction Passkey:** İlk transaction'da passkey prompt görünebilir (bu normal)

5. **✅ Progressive Disclosure:** Wallet sadece gerektiğinde kullanılmalı (onchain action için)

### Mevcut BaseMan Implementasyonu:

- ✅ **Otomatik bağlantı:** Arka planda `eth_accounts` ile kontrol ediliyor
- ✅ **Proactive signIn yok:** Passkey prompt'ları önleniyor
- ✅ **Connect menu gizli:** Mini app ortamlarında connect UI gösterilmiyor
- ✅ **Base Account varsayılan:** Base App'da Base Account otomatik kullanılıyor

**Sonuç:** ✅ Mevcut implementasyon Base App dokümantasyonuna uyumlu!

---

## 🔗 Referanslar

- [Base Mini Apps - Base Account](https://docs.base.org/mini-apps/core-concepts/base-account)
- [Base Mini Apps - Recommended Onboarding Flow](https://docs.base.org/mini-apps/guides/onboarding)
- [Base Account - Sub Accounts](https://docs.base.org/base-account/improve-ux/sub-accounts)


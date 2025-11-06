# Farcaster ve Base App Mini App'lerinde Zincir Seçimi Analizi

## Özet

**Farcaster ve Base App mobil uygulamalarında mini app içinde zincir seçimi/değişimi:**

- ✅ **Kullanıcı zincir değiştirebilir** (teknik olarak mümkün)
- ⚠️ **Platform tarafından kısıtlanabilir** (desteklenen zincirler manifest'te belirtilir)
- ⚠️ **Mini app provider'ları `wallet_switchEthereumChain` metodunu sınırlı destekleyebilir**

## Detaylı Analiz

### 1. Manifest Kontrolü (`requiredChains`)

Mini app'iniz `/.well-known/farcaster.json` manifest dosyasında `requiredChains` alanı ile hangi zincirleri desteklediğini belirtir:

```json
{
  "miniapp": {
    "requiredChains": ["eip155:8453", "eip155:84532"]
  }
}
```

**Anlamı:**
- Platform (Farcaster/Base App) bu zincirleri desteklemeli
- Mini app bu zincirlerden birinde çalışabilir
- Platform, mini app'i yalnızca desteklenen zincirlerden birinde render eder

### 2. Platform Kontrolü

**Farcaster/Base App Platform Davranışı:**
- Platform, mini app'in `requiredChains` listesini kontrol eder
- Platform, kullanıcının cüzdanının hangi zincirleri desteklediğini kontrol eder
- Platform, mini app'i uyumlu bir zincirde başlatır
- Platform, varsayılan zinciri seçebilir (genellikle Base Sepolia test için, Base Mainnet production için)

### 3. Kullanıcı Zincir Değiştirme

**Teknik Olarak Mümkün:**
Mini app'iniz içinde `wallet_switchEthereumChain` EIP-3326 metodunu kullanarak zincir değiştirme yapabilirsiniz:

```javascript
// BaseMan/src/onchain-client.js - ensureChain()
await provider.request({
  method: "wallet_switchEthereumChain",
  params: [{ chainId: "0x14a34" }] // Base Sepolia
});
```

**Ancak:**
- ⚠️ Mini app provider'ları bu metodu tam olarak desteklemeyebilir
- ⚠️ Platform, kullanıcının zincir değiştirme isteğini onaylayabilir veya reddedebilir
- ⚠️ Platform, güvenlik nedeniyle zincir değişimini kısıtlayabilir

### 4. BaseMan'deki Implementasyon

**Mevcut Kod:**
```javascript
// src/profile-panel.js - handleSwitch()
async function handleSwitch(chainId) {
  await window.BaseManOnchain.setNetwork({ 
    chainId: Number(chainId), 
    registryAddress: nextRegistry 
  });
}

// src/onchain-client.js - ensureChain()
async function ensureChain(provider, chainId) {
  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: hexChainId }]
  });
}
```

**Not:**
- Kod, `wallet_switchEthereumChain` metodunu kullanıyor
- Ancak mini app provider'larında bu metod sınırlı çalışabilir
- Kodda fallback mekanizması var (`wallet_addEthereumChain`)

### 5. Resmi Dokümantasyon Referansları

**Base Mini Apps Docs:**
- `requiredChains` manifest'te belirtilir
- Platform, desteklenen zincirleri kontrol eder
- Wagmi `useSwitchChain` hook'u kullanılabilir (web mode için)

**Farcaster Mini Apps Docs:**
- `requiredChains` optional manifest property
- Platform, zincir desteğini kontrol eder
- Mini app, runtime'da desteklenen zincirleri detect edebilir

### 6. Sonuç ve Öneriler

**Mevcut Durum:**
1. ✅ **Manifest'te `requiredChains` var:** Base Mainnet (8453) ve Base Sepolia (84532)
2. ✅ **Kodda zincir değiştirme mekanizması var:** Profile panel'de "Switch to Base Sepolia/Mainnet" butonları
3. ⚠️ **Platform kontrolü:** Farcaster/Base App platformu zincir değişimini kontrol edebilir

**Öneriler:**
1. **Test edin:** Farcaster ve Base App mobil uygulamalarında zincir değiştirme butonlarını test edin
2. **Fallback mekanizması:** Platform zincir değişimini desteklemiyorsa, kullanıcıya bilgi verin
3. **Platform kontrolü:** Platform'un hangi zincirde başlattığını algılayın ve ona göre UI gösterin
4. **Hata yönetimi:** `wallet_switchEthereumChain` hatalarını yakalayın ve kullanıcıya bilgi verin

**En İyi Uygulama:**
- Mini app'iniz hem Base Mainnet hem de Base Sepolia'da çalışabilir olmalı
- Platform'un seçtiği zinciri kabul edin
- Kullanıcıya zincir değiştirme seçeneği sunun AMA platform kısıtlarsa sessizce handle edin
- Current chain'i UI'da gösterin

## Kaynaklar

- [Farcaster Mini Apps Docs - requiredChains](https://miniapps.farcaster.xyz/docs/guides/publishing#requiredchains)
- [Base Mini Apps Docs - Chain Switching](https://docs.base.org/)
- [EIP-3326: wallet_switchEthereumChain](https://eips.ethereum.org/EIPS/eip-3326)


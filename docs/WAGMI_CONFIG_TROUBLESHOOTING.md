# Wagmi Config Sorun Giderme Rehberi

## "Cüzdan yapılandırması kullanılamıyor" Hatası

### Sorun

Oyun ekranında "Wallet config unavailable" (Cüzdan yapılandırması kullanılamıyor) hatası görünüyor. Bu hata, wagmi config'in başlatılamadığında ortaya çıkar.

### Nedenleri

1. **Bundling Sorunları**: Esbuild bundling sırasında `wagmi/chains` import'ları başarısız olabilir
2. **Chain Objeleri Undefined**: `base` ve `baseSepolia` chain objeleri undefined olabilir
3. **createConfig Hatası**: `createConfig` çağrısı beklenmeyen bir hata ile başarısız olabilir
4. **Connector Hatası**: Mini app connector veya web connector'ları başlatılamayabilir

### Çözümler

#### 1. Fallback Chain Tanımları

Kod, bundling sorunlarını önlemek için fallback chain tanımları içerir:

```javascript
// src/ui/wagmi-config.js
function getFallbackBaseChain() {
  return {
    id: 8453,
    name: 'Base',
    network: 'base',
    // ... diğer özellikler
  };
}
```

#### 2. Çok Katmanlı Hata Yönetimi

Config oluşturma süreci şu adımları izler:

1. **Import Denemesi**: Önce `wagmi/chains`'den chain'leri import etmeye çalışır
2. **Fallback Kullanımı**: Import başarısız olursa manuel chain tanımlarını kullanır
3. **Connector Fallback**: Mini app connector başarısız olursa `injected()` connector'ını dener
4. **Minimal Config**: Tüm başarısız olursa, en minimal config ile dener (boş connectors)

#### 3. Detaylı Hata Loglama

Tüm hata durumları console'a loglanır:

```javascript
console.error('[wagmi-config] Failed to create config:', error);
console.error('[wagmi-config] Error details:', {
  message: error?.message,
  stack: error?.stack,
  name: error?.name
});
```

### Debug Adımları

1. **Console Loglarını Kontrol Edin**:
   - Browser console'da `[wagmi-config]` ile başlayan logları arayın
   - Hangi adımda hata oluştuğunu belirleyin

2. **Config Durumunu Kontrol Edin**:
   ```javascript
   // Browser console'da:
   window.ConsoleLogger.getErrors().filter(e => e.message.includes('wagmi-config'))
   ```

3. **Chain Objelerini Kontrol Edin**:
   ```javascript
   // Browser console'da:
   import { base, baseSepolia } from 'wagmi/chains';
   console.log('base:', base);
   console.log('baseSepolia:', baseSepolia);
   ```

4. **Config'i Manuel Test Edin**:
   ```javascript
   // Browser console'da:
   import { makeWagmiConfig } from './src/ui/wagmi-config.js';
   try {
     const config = makeWagmiConfig();
     console.log('Config:', config);
   } catch (e) {
     console.error('Error:', e);
   }
   ```

### Yaygın Sorunlar ve Çözümleri

#### Sorun 1: Chain Objeleri Undefined

**Belirtiler**:
- Console'da: `[wagmi-config] Chain imports unavailable, using fallback definitions`
- Config null döner

**Çözüm**:
- Fallback chain'ler otomatik kullanılır
- Eğer hala sorun varsa, fallback chain tanımlarını kontrol edin

#### Sorun 2: createConfig Başarısız

**Belirtiler**:
- Console'da: `[wagmi-config] createConfig failed`
- Error stack trace görünür

**Çözüm**:
- Error mesajını kontrol edin
- Minimal config fallback'i otomatik denenir
- Hala başarısız olursa, wagmi versiyonunu kontrol edin

#### Sorun 3: Connector Başarısız

**Belirtiler**:
- Console'da: `[wagmi-config] Error creating mini app connector`
- Mini app ortamında connector çalışmıyor

**Çözüm**:
- `@farcaster/miniapp-wagmi-connector` versiyonunu kontrol edin
- Fallback olarak `injected()` connector kullanılır

### Güncelleme

Son güncellemeler (2025-01-06):

1. ✅ Fallback chain tanımları eklendi
2. ✅ Çok katmanlı hata yönetimi eklendi
3. ✅ Detaylı hata loglama eklendi
4. ✅ Minimal config fallback eklendi
5. ✅ Connector fallback mekanizması eklendi

### İlgili Dosyalar

- `src/ui/wagmi-config.js` - Ana config dosyası
- `src/ui/connect-menu-v2.jsx` - Connect menu UI
- `vendor/connect-menu.js` - Bundled connect menu

### Daha Fazla Yardım

Sorun devam ederse:

1. Console loglarını toplayın
2. Wagmi ve viem versiyonlarını kontrol edin
3. Node modules'ı yeniden yükleyin: `npm install`
4. Vendor dosyasını yeniden build edin: `npm run ui:build`


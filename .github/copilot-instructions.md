```markdown
# Copilot / AI Agent Instructions for BaseMan

Bu dosya, GitHub Copilot benzeri AI kodlama ajanlarının bu repo üzerinde hızlıca verimli çalışabilmesi için odaklanmış ve eyleme dönük yönergeler sağlar.

**Kısa Mimari Özet**
- **Oyun motoru**: Saf JS, kaynaklar `src/` içindedir; `npm run game:build` ile `pacman.js` üretilir. Önemli dosyalar: `src/game.js`, `src/states.js`, `src/Actor.js`, `src/Map.js`, `src/renderers.js`.
- **Web3 & Smart Contracts**: `contracts/BaseManRegistry.sol` (EIP-712, nonce replay koruması). Backend `api/` uç noktaları EIP-712 imzalama ve paymaster proxy içerir.
- **Mini App / SDK**: Farcaster/Base Mini App entegrasyonu `src/utils/sdk-detection.js`, `src/onchain-bootstrap.js` ve `src/ui/connect-menu-v2.jsx` içinde toplanır.

**Hızlı Komutlar (sık kullanılan)**
- `npm run dev` : Yerel geliştirme sunucusu (port 5173).
- `npm run game:build` : `src/*.js` → `pacman.js` üretir.
- `npm run manifest:generate` : `config/manifest.base.json` → `.well-known/farcaster.json`.
- `npm run onchain:config` : Ortam değişkenlerinden `src/onchain-config.js` oluşturur.
- `npm run contracts:compile` / `npm run contracts:test` / `npm run contracts:deploy:sepolia` : Hardhat sözleşme işleri.
- `npm run docs:verify` / `npm run docs:format` : Doküman kontrolleri.

**Projeye Özgü Konvansiyonlar & Kalıp Kodlar**
- Oyun mantığı _vanilla JS_ içinde kalır; React sadece UI (connect menu vb.) için kullanılır.
- Oyun kodu tarayıcı global `window`'da isimler açar; modüller arası iletişim `window` üzerinden ve IIFE desenleriyle yapılır.
- EIP-712 sürüm v2 kullanılır; payload'larda `nonce` ve `deadline` vardır. Backend imzalama kodu `api/score-sign.js` ve `api/_lib/registry.js`'de bulunur.
- Paymaster policy: `PAYMASTER_ALLOWED_TARGETS` ve `PAYMASTER_ALLOWED_SELECTORS` ile hedef/selector allowlist uygulanır (`api/paymaster-proxy.js`).

**Önemli Dosyalar — Hızlı Referans**
- Uygulama kaynakları: `src/`
- Oyun girişleri: `index.html`, `debug.html`, `pacman.js`
- API fonksiyonları: `api/score-sign.js`, `api/leaderboard.js`, `api/paymaster-proxy.js` ve `api/_lib/` altındaki yardımcı modüller
- Sözleşmeler: `contracts/BaseManRegistry.sol`
- Dokümantasyon: `docs/` (özellikle `DEVELOPMENT_GUIDE.md`, `SCORE_SUBMISSION_FLOW.md`)

**Çalıştırma / Debug Önerileri (pratik)**
- SDK bulunamıyorsa: `src/utils/sdk-detection.js` loglarını kontrol et; miniapp için `src/mock-miniapp-provider.js` kullanılabilir.
- Geçersiz imza: Önce authorizer adresinin sözleşmeye (`setAuthorizer`) ayarlı olduğundan emin ol; backend’de kullanılan `BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY` ile eşleşmelidir.
- Leaderboard boşsa: CDP SQL gecikmesi olabilir — RPC fallback (`address-history.js`) loglarını kontrol et.

**Test & CI Notları**
- Hardhat testleri: `test/` içindeki `BaseManRegistry.test.js` çalıştırılmalı. `npm run contracts:test` kullan.
- E2E araçları: `scripts/` içindeki `smoke-sepolia.mjs`, `e2e-sponsor.mjs`, `e2e-bundler.mjs` hazır test/otomasyon betikleridir.

**Güvenlik & Operasyonel Kurallar (zorunlu)**
- Önemli: Private key'leri repoya koymayın. Prod için dedicated signer kullanın (deployer anahtarı değil).
- `onchain:config` ile üretilen `src/onchain-config.js` otomatik oluşturuluyor — bunun elle düzenlenmemesi tercih edilir.
- Paymaster allowlist zorlanıyorsa testlerde uygun `PAYMASTER_*` ortam değişkenlerini setleyin.

**Nasıl Yardım İsteyin / PR Açarken Bilgilendirme**
- PR açıklamasında hangi ortamda (local/dev/sepolia/mainnet), hangi komutlarla yeniden ürettiğinizi (ör. `npm run game:build`, `npm run manifest:generate`) belirtin.
- Eğer değişiklik smart contract, manifest veya onchain config ile ilgiliyse, ilgili `npm run onchain:config`/`manifest:generate` çıktılarını ve kullanılan `.env` anahtarlarını (isimleri, değerleri değil) paylaşın.

---
Bu yönergeyi güncellememi istediğin net bölümler var mı? Özellikle hangi iş akışlarını (ör: paymaster debugging, manifest güncelleme, e2e testleri) daha detaylandırmamı istersin?
```
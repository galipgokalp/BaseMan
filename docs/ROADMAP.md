<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [BaseMan Geliştirme Yol Haritası](#baseman-geli%C5%9Ftirme-yol-haritas%C4%B1)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<!-- cspell:disable -->

# BaseMan Geliştirme Yol Haritası

Bu yol haritası, BaseMan mini uygulamasını Base ve Farcaster ekosistemlerinde doğru şekilde çalışır hale getirmek için izlenecek adımları listeler. Her adım, hem yerel dokümantasyondaki ilgili bölümü hem de resmi kaynağın web adresini referans gösterir. İlerledikçe maddeleri işaretleyin ve notlar ekleyin.

- [ ] 0. Başlangıç: Proje Amaçları ve Kapsam
  - Yerel kaynak: `BaseMan/docs/README.md`- Resmi web: https://docs.base.org/mini-apps/ ve https://docs.farcaster.xyz/
  - Not: Hedefler — Paymaster sponsorlu oyun, toplam skor kontrata yazılsın, PAC-BOARD liderlik tablosu toplam skora göre sıralasın, profil sekmesi çalışsın.

- [ ] 1. Ortam ve Değişkenler (.env)
  - Yerel kaynak:`BaseMan/docs/env.example`(örnek),`BaseMan/docs/CDP_Coinbase_Developer_Docs_MiniApp_Paymaster.md`("Step: Create an .env file" ve ilgili kısımlar)
  - Resmi web: https://docs.cdp.coinbase.com/ ve https://docs.base.org/builderkits/onchainkit/getting-started
  - Yapılacaklar: RPC, Paymaster/Bundler, Registry adresi, EIP712 versiyonu (2), WalletConnect Project ID, OnchainKit client key — hepsi`.env`içinde tanımlı olmalı.

- [ ] 2. Kontrat: BaseManRegistry (Deploy + Verify)
  - Yerel kaynak:`BaseMan/contracts/BaseManRegistry.sol`, `BaseMan/scripts/deploy-baseman-registry.cjs`, `BaseMan/test/BaseManRegistry.test.js`- Resmi web: https://sepolia.basescan.org/ ve https://docs.base.org/tools/builderkits/contracts
  - Yapılacaklar: Base Sepolia deploy (tamam), Etherscan/Sourcify verify (tamam).`.env`ve manifest allowedAddresses güncel.

- [ ] 3. Kontrat Operasyonları: Authorizer, Pause/Unpause, Seed/Migration
  - Yerel kaynak:`BaseMan/contracts/BaseManRegistry.sol`(setAuthorizer, pause/unpause, seedTotals),`BaseMan/scripts/set-authorizer.cjs`- Resmi web: https://docs.base.org/mini-apps/paymasters ve https://docs.openzeppelin.com/contracts/
  - Yapılacaklar: Authorizer backend imzalayıcıya ayarlı (tamam), gerekirse seedTotals ile göç verilerini yükleyin, pause akışını test edin.

- [ ] 4. Paymaster ve Bundler Entegrasyonu
  - Yerel kaynak:`BaseMan/api/paymaster-proxy.js`, `BaseMan/docs/CDP_Coinbase_Developer_Docs_MiniApp_Paymaster.md`(Paymaster quickstart ve proxy önerileri)
  - Resmi web: https://docs.cdp.coinbase.com/paymaster ve https://docs.base.org/mini-apps/paymasters
  - Yapılacaklar:`PAYMASTER_SERVICE_URL`, allowlist ve allowed selectors doğrulaması; sponsorlu submitScore/completeQuest işleyişi.

- [ ] 5. Farcaster Mini App Gereksinimleri (Manifest + Webhook)
  - Yerel kaynak: `BaseMan/config/manifest.base.json`, `BaseMan/scripts/generate-manifest.mjs`, `BaseMan/api/miniapp-webhook.js`, `BaseMan/.well-known/farcaster.json`(çıktı)
  - Resmi web: https://miniapps.farcaster.xyz/ ve https://docs.farcaster.xyz/
  - Yapılacaklar: Manifest alanları (CSP, requiredChains, allowedAddresses) ve webhook URL’leri; Farcaster mobilde test.

- [ ] 6. OnchainKit ve Cüzdan UX’i
  - Yerel kaynak:`BaseMan/src/ui/onchainkit-app.jsx`, `BaseMan/src/load-onchainkit.js`, `index.html`- Resmi web: https://docs.base.org/builderkits/onchainkit/getting-started
  - Yapılacaklar: OnchainKit provider konfigürasyonu (chain, projectId), UI bileşenleri ve mini-app konteynerinde yükleme stratejisi.

- [ ] 7. Skor İmzalama Servisi (Score Sign API)
  - Yerel kaynak:`BaseMan/api/score-sign.js`, `BaseMan/api/_lib/registry.js`, `BaseMan/api/_lib/miniapp-auth-verify.js`- Resmi web: https://docs.base.org/mini-apps/authentication ve https://docs.farcaster.xyz/
  - Yapılacaklar: EIP-712 v2 imza üretimi (nonce+deadline), Quick Auth zorunluluğu opsiyonu, hız limiti ve skor sınırı.

- [ ] 8. Görev İmzalama Servisi (Quest Sign API)
  - Yerel kaynak:`BaseMan/api/quest-sign.js`- Resmi web: https://docs.base.org/mini-apps/authentication
  - Yapılacaklar: EIP-712 v2 imza üretimi, izinli quest ID seti (ALLOWED_QUEST_IDS), Quick Auth entegrasyonu.

- [ ] 9. Leaderboard (Toplam Skor) ve Profil Paneli
  - Yerel kaynak:`BaseMan/api/leaderboard.js`, `BaseMan/src/profile-panel.js`- Resmi web: https://docs.cdp.coinbase.com/platform-data/sql-api ve https://docs.base.org/mini-apps/data
  - Yapılacaklar: CDP SQL API sorguları, RPC fallback, profil zenginleştirme (Farcaster avatar), totalScore’a göre sıralama.

- [ ] 10. Adres Geçmişi ve Olay Akışı
  - Yerel kaynak:`BaseMan/api/address-history.js`- Resmi web: https://docs.cdp.coinbase.com/platform-data/address-history-api
  - Yapılacaklar: API/Log tabanlı zaman çizelgesi; blok zaman damgalarıyla zenginleştirme; pagination/limitler.

- [ ] 11. Mini App Kimlik Doğrulama (Quick Auth)
  - Yerel kaynak:`BaseMan/api/_lib/miniapp-auth-verify.js`, `.env`Quick Auth değişkenleri
  - Resmi web: https://miniapps.farcaster.xyz/docs/sdk/quick-auth
  - Yapılacaklar: JWKS/Local doğrulama, domain ayarı, opsiyonel harici doğrulayıcı endpointi.

- [ ] 12. Güvenlik, Limitler ve Gözlemlenebilirlik
  - Yerel kaynak:`BaseMan/api/leaderboard.js`(rate limit),`BaseMan/api/score-sign.js`(rate limit ve max score),`BaseMan/scripts/self-check.mjs`- Resmi web: https://docs.base.org/mini-apps/security ve https://docs.cdp.coinbase.com/
  - Yapılacaklar: Rate limiting, input validation, RPC/SQL timeouts; üretim öncesi self-check ve healthcheck.

- [ ] 13. Üretime Hazırlık (Allowlist, CSP, Manifest)
  - Yerel kaynak:`BaseMan/config/manifest.base.json`, `BaseMan/scripts/generate-manifest.mjs`, `.well-known/farcaster.json`- Resmi web: https://docs.base.org/mini-apps/publishing ve https://miniapps.farcaster.xyz/
  - Yapılacaklar: AllowedAddresses (kontrat adresi), CSP kaynakları, requiredChains, Base Builder kuralları.

- [ ] 14. E2E Doğrulama ve Smoke Testler
  - Yerel kaynak:`BaseMan/scripts/smoke-sepolia.mjs`, `BaseMan/scripts/healthcheck.mjs`, `BaseMan/scripts/self-check.mjs`- Resmi web: https://docs.base.org/mini-apps/troubleshooting/testing
  - Yapılacaklar: Sponsorlu tx akışı, profil ve leaderboard eşzamanlı güncelleme, webhook’lar ve manifest doğrulaması.

- [ ] 15. Sürümleme ve Değişiklik Yönetimi
  - Yerel kaynak:`BaseMan/docs/README.md`(değişiklik akışı notları),`BaseMan/docs/glossary.md`- Resmi web: https://docs.base.org/ ve https://docs.farcaster.xyz/
  - Yapılacaklar: Çevresel değişikliklerin kayıt altına alınması, dokümantasyon bağları ve yol haritası ilerleme durumunun güncellenmesi.

---

İlerleme Kaydı (özet)

- Kontrat deploy/verify: Sepolia’da tamamlandı —`0x3c52dEd86f9E56663cA680D773B64f8f62380cBc`- Authorizer: Backend imzalayıcıya ayarlandı —`0x21bC5c5…`
- .env uyarlaması: Doküman uyumluluğu ve alias’lar eklendi

Not: Her başlık altındaki yapılacaklar tamamlandıkça bu dosyada kutuları işaretleyin ve gerekirse kısa not ekleyin (tarih, sorumlu, kanıt bağlantısı gibi).

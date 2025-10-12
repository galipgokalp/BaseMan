## BaseMan On-Chain Integration Roadmap

Bu doküman, Base zinciri üzerinde skor ve görev kayıt altyapısını kurmak için izleyeceğimiz teknik planı özetler. Adımlar; akıllı kontrat, backend imzalama servisi ve Farcaster Mini App istemci entegrasyonlarının birlikte çalışmasını hedefler.

### 1. Mimari Özeti

- **Akıllı kontrat (Base L2)**  
  - `HighScoreRegistry`: Her oyuncu adresinin sadece doğrulanmış en yüksek skorunu saklar.  
  - `QuestRegistry`: Önceden tanımlanmış görevlerin tamamlandığını işaretler.  
  - `ScoreVerifier`: Kontrat, bir backend servisi tarafından EIP-712 ile imzalanmış skor/görev verilerini doğruladıktan sonra kayıt alır. Backend’in public key’i kontratta saklanır.
- **Backend imzalama servisi (Vercel API route)**  
  - `/api/score-sign` endpoint’i oyun motorundan gelen skor verisini alır, basit anti-cheat kontrolleri yapar ve uygun görülen skor için imzalı payload döner.  
  - `/api/quest-sign` endpoint’i görev tamamlama kurallarını kontrol eder ve on-chain çağrısı için imza üretir.  
  - Servis private key’i Vercel environment’da saklanır; kontrat bu anahtarın public key’ini bekler.
- **Mini App istemci (Pac-Man front-end)**  
  - Oyun başlamadan `sdk.actions.signIn()` çağrısıyla Farcaster hesabı & cüzdan adresi alınır.  
  - Oyun bitiminde skor backend’e gönderilir, dönen imza `ethers.js` aracılığıyla kontrata yazılır.  
  - Görevler tetiklendiğinde benzer akış izlenir.  
  - Paymaster entegrasyonu için `@coinbase/cluster-sdk` (veya Base paymaster örneği) üzerinden işlemler sponsorlanır.

### 2. Akıllı Kontrat Detayları

- Kullanacağımız framework: **Hardhat**  
- Dizin yapısı: `contracts/HighScoreRegistry.sol`, `contracts/QuestRegistry.sol` (veya tek kontratta birleşik).  
- Temel fonksiyonlar:  
  - `submitScore(address player, uint256 score, uint256 deadline, bytes calldata signature)`  
  - `completeQuest(address player, uint256 questId, uint256 deadline, bytes calldata signature)`  
  - Yönetim fonksiyonları: backend signer anahtarını güncelleme, quest tanımlama vb.  
- Testler: Hardhat + Mocha ile kontrat davranışı ve imza doğrulamasının çalıştığını doğrulayan testler.
- Deploy: `scripts/deploy.ts` ile Base Sepolia → Base Mainnet akışı. Kullanıcı kendi private key’iyle deploy edecek.

### 3. Backend İmzalama Servisi

- `api/score-sign.js` ve `api/quest-sign.js` Vercel serverless fonksiyonları.  
- Kullanıcıdan gelen veriler: `score`, `level`, `duration`, `playerAddress`; quest için `questId`, `metadata`.  
- Anti-cheat kontrolleri: minimum oyun süresi, skor-ghost ratio, seed doğrulama gibi temel kontroller (gereksinimlere göre genişletilebilir).  
- İmza: Kontratla aynı EIP-712 domain/typed data yapısını kullanır.  
- Ortam değişkenleri:  
  - `SCORE_SIGNER_PRIVATE_KEY`  
  - `QUEST_SIGNER_PRIVATE_KEY` (veya aynı anahtar)  
  - Kontrat adresleri (`NEXT_PUBLIC_SCORE_CONTRACT`, `NEXT_PUBLIC_QUEST_CONTRACT`)

### 4. İstemci Entegrasyonu

- `sdk.actions.signIn()` ile kullanıcı oturum açtırılır; dönen `fid` ve `signer` bilgisi UI’de saklanır.  
- `wallet.getEthereumProvider()` ile EIP-1193 provider alınır, `ethers` instance’ı yaratılır.  
- Skor akışı:  
  1. Oyun motoru skor hesaplar.  
  2. `/api/score-sign`’e skor + meta veriler gönderilir.  
  3. Dönen imza ile `submitScore` fonksiyonu çağrılır.  
- Görev akışı: benzer şekilde `/api/quest-sign` → `completeQuest`.
- UX: İşlem sürecinde loading durumu, başarı/başarısızlık geri bildirimi, skor tablosu görüntüleme (`read` çağrıları).

### 5. Gasless İşlemler

- Coinbase Paymaster panelinden alınan API anahtarları backend’de güvenle saklanır.  
- İstemci tarafında `ethers` yerine Paymaster SDK’sı ile sponsorlu işlem gönderilir veya backend işlemi relaye eder.  
- Çevresel değişkenler: `PAYMASTER_URL`, `PAYMASTER_API_KEY`, `BUNDLER_URL` vb.

### 6. Aşamalar

1. **Kontrat taslaklarının hazırlanması** ve Hardhat altyapısının eklenmesi.  
2. **Backend imzalama fonksiyonlarının** oluşturulması ve EIP-712 yapılarının paylaşılması.  
3. **İstemci entegrasyonu**: cüzdan bağlama, API çağrıları, kontrat etkileşimi.  
4. **Test & Dokümantasyon**: Kontrat testleri, uçtan uca demo senaryosu, kurulum rehberi.  
5. **Paymaster yapılandırması** için yönergeler.

Bu planı takip ederek BaseMan’i zincire bağlayıp hilesiz skor panosu ve görev sistemi kurabiliriz. Bir sonraki adım kontrat taslaklarını projeye eklemek olacak.


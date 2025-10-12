## Backend & Front-End Entegrasyon Planı

Bu doküman, BaseManRegistry kontratıyla güvenli şekilde etkileşim kuracak olan backend servisleri ve istemci güncellemeleri için ayrıntıları içerir.

### 1. EIP-712 Tip Tanımları

Kontrat içinde kullanılan imzalar aşağıdaki typed data şemalarını takip eder:

```ts
const domain = {
  name: "BaseManRegistry",
  version: "1",
  chainId,
  verifyingContract: BASEMAN_REGISTRY_ADDRESS
};

const Score = [
  { name: "player", type: "address" },
  { name: "score", type: "uint256" },
  { name: "deadline", type: "uint256" }
];

const Quest = [
  { name: "player", type: "address" },
  { name: "questId", type: "uint256" },
  { name: "deadline", type: "uint256" }
];
```

Backend servisleri bu typed data yapılarını kullanarak imza üretmeli; kontrat diğer formatları reddeder.

### 2. Serverless API Tasarımı

Vercel deploy’u için `api` dizininde aşağıdaki endpoint’ler oluşturulacak:

- `api/score-sign.js`
  - **Body**: `{ playerAddress, score, durationMs, level, signatureSeed }`
  - **Kontroller**: minimum oyun süresi (`durationMs > 30_000`), skor seviyesi ilişkilendirmesi, seed tekrar kullanımı vb.
  - **Response**: `{ signature, deadline, contractAddress }`
  - **HTTP 400**: kuralları geçmeyen skorlar.
- `api/quest-sign.js`
  - **Body**: `{ playerAddress, questId, metadata }`
  - **Kontroller**: quest kurallarına özel validasyon (ör. “ilk defa 10k skor” gibi).
  - **Response**: `{ signature, deadline }`

Her iki fonksiyon da `SCORE_SIGNER_PRIVATE_KEY` ortam değişkeniyle saklanan özel anahtar ile imza üretir. Bu anahtarın public karşılığı kontrat deploy edilirken `initialAuthorizer` olarak kullanılacaktır.

> **Env referansı:** `NEXT_PUBLIC_REGISTRY_ADDRESS`, `REGISTRY_CHAIN_ID`, `SCORE_SIGNER_PRIVATE_KEY`, `QUEST_SIGNER_PRIVATE_KEY` (opsiyonel, yoksa `SCORE_SIGNER_PRIVATE_KEY` kullanılır), `ALLOWED_QUEST_IDS`, `SCORE_SIGNATURE_TTL_SECONDS`, `SCORE_MIN_DURATION_MS`, `SCORE_MAX_VALUE`, `QUEST_SIGNATURE_TTL_SECONDS`.

### 3. İstemci (Front-End) Akışı

1. **Oturum Açma**  
   - Oyun giriş ekranında `sdk.actions.signIn()` çağrılır.  
   - Başarılı sonuçta `fid`, `username` ve `wallet` bilgileri tutulur.
2. **Cüzdan Sağlayıcısı**  
   - `sdk.wallet.getEthereumProvider()` ile provider alınır, `ethers` üzerinden `BaseManRegistry` instance’ı yaratılır.
3. **Skor Gönderimi**  
   - Oyun bittiğinde skor verisi `fetch("/api/score-sign", { method: "POST", body: ... })` ile backend’e gönderilir.
   - Dönen `signature` + `deadline` ile `submitScore` fonksiyonu çağrılır. Paymaster entegrasyonu gerekiyorsa `sponsoredCall` kullanılacak.
4. **Görev Tamamlama**  
   - Görev tetiklendiğinde `fetch("/api/quest-sign", ...)` → `completeQuest`.
5. **Skor Tablosu**  
   - Read-only çağrılar için backend’e gerek yok; provider `.callStatic` ile `getScore`, `isQuestCompleted` fonksiyonları okunur.

### 4. Paymaster Entegrasyonu

- Kullanıcıların gas ödememesi için `PAYMASTER_URL` ve `PAYMASTER_API_KEY` değerleri backend’de saklanır.
- İstek akışı: İstemci, backend’e “sponsorla” isteği gönderir; backend paymaster SDK’sı ile işlemi imzalayıp raw tx döndürür; istemci `provider.sendTransaction` ile yayınlar.
- Alternatif olarak, Coinbase “cluster SDK” istemci tarafında kullanılabilir; bu durumda paymaster kimlik bilgileri istemciye açılmamalıdır.

### 5. Güvenlik Notları

- İmzalar kısa süreli `deadline` (örn. 5 dk) ile üretilmeli.
- Replay saldırılarını engellemek için backend skor imza üretiminde seed/nonce kullanılmalı; kontrata ileride `usedNonce` haritası eklemek gerekebilir.
- Backend log’ları kişisel veri tutmamalı; yalnızca skor metrikleri ve hata kayıtları saklanmalı.

Bu plan backend/istemci geliştirmeleri için referans olacak. Sonraki adım: API endpoint’lerinin kodlanması ve oyun döngüsüne entegrasyon.

# AgentKit Script Çekirdeği

Bu klasör, BaseMan projesindeki ajan otomasyonlarını barındırmak için ayrıldı.

## Başlangıç Planı
- `npm install @coinbase/agentkit` çalıştırıldıktan sonra burada özel aksiyon sağlayıcıları içeren Node.js scriptleri oluşturulacak.
- `config/agentkit.env.example` dosyasını `.env.agentkit` adıyla kopyalayıp gerekli CDP/LLM anahtarlarını tanımlayın; scriptler `dotenv` ile bu dosyayı yüklemeyi bekler.
- İlk hazır aksiyon: `actions/baseman-score.mjs` — BaseManRegistry’den yüksek skor okuması yapar.
- CLI PoC: `npm run agentkit:verify` komutu `run-verify-score.mjs` scriptini çalıştırarak kullanıcıdan adres/skor alır ve ajan aksiyonunu tetikler.
- Quest doğrulama PoC: `actions/baseman-quest.mjs` ve `npm run agentkit:verify-quest` komutuyla belirli bir görevin tamamlanma durumunu okuyabilirsiniz.

- Not: Ek aksiyon ve otomasyon scriptleri bu klasöre eklenmeye devam edecek; mevcut PoC dosyalarını referans alın.

## Mini App Manifest Kontrol Listesi

Bu doküman, Farcaster Mini Apps rehberi (https://miniapps.farcaster.xyz/) ve Base Data Driven Growth teknik kılavuzu (https://docs.base.org/mini-apps/technical-guides/data-driven-growth) doğrultusunda manifest dosyasını yönetmek için izlediğimiz akışı özetler.

### Gereksinimler

- **Farcaster domain doğrulaması:** `accountAssociation.header`, `accountAssociation.payload` ve `accountAssociation.signature` değerleri Farcaster CLI veya Base Builder arayüzü üzerinden alınmalıdır. Değerlerden biri eksikse manifest geçersiz sayılır.
- **Base Builder nesnesi:** `baseBuilder.allowedAddresses` listesi Base.dev hesabınızla ilişkili cüzdan adreslerini içermelidir. Analitiklerin açılması için en az bir adres zorunludur ve liste mini app manifestinin üst seviyesinde tanımlanmalıdır.
- **Mini app metadata:** `name`, `description`, `splashImageUrl`, `miniapp.homeUrl` ve `miniapp.iconUrl` alanları Farcaster Mini App mağazasında görünür içerikleri belirler. Bu alanların HTTPS içeriklere işaret ettiğinden emin olun.
- **Icon gereksinimi:** Farcaster Base rehberleri `miniapp.iconUrl` için 512x512 boyutlu, arka planı şeffaf PNG dosyası öneriyor. Uygulamada `icon.png` kök dizinde barındırılıyor ve `iconUrl` alanı bu dosyaya yönlendiriyor.
- **Versiyonlama:** `miniapp.version` değeri dağıtımlar arasında güncellenerek istemcilerin cache temizliği yapması sağlanabilir.

### Güncelleme Adımları

1. `config/manifest.base.json` dosyasını düzenleyin.
2. Gerekirse `BASE_BUILDER_ALLOWED_ADDRESSES` ortam değişkeniyle farklı adres listesi sağlayın.
3. `npm run manifest:generate` komutunu çalıştırarak `.well-known/farcaster.json` dosyasını yeniden üretin.
4. Değişiklikleri deploy etmeden önce Farcaster miniapp doğrulaması ve Base.dev import işlemini yenileyin.

Bu akış, Base.dev analitik panosunda verilen data-driven growth metriklerinin (aktif kullanıcı, açılma sayısı, oturum süresi vb.) doğru şekilde toplanmasını sağlar.

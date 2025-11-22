# Docs Klasörü Organizasyon Planı

## Mevcut Durum
- **Toplam dosya sayısı:** ~40+ MD dosyası
- **Büyük dosyalar:** Base_MiniApps_Docs.md (25K satır), Farcaster_MiniApps_Docs.md (13K satır)
- **Organizasyon:** Düz yapı, kategorilendirme yok

## Önerilen Klasör Yapısı

```
docs/
├── README.md (Ana index)
├── guides/ (Rehberler ve how-to'lar)
│   ├── development/
│   ├── debugging/
│   ├── integration/
│   └── user-experience/
├── plans/ (Gelecek geliştirmeler için planlar)
├── analysis/ (Teknik analizler ve raporlar)
├── external/ (Harici dokümanlar - Base, Farcaster, CDP)
├── reports/ (Durum raporları ve compliance)
└── common/ (Ortak dokümanlar - glossary, troubleshooting)
```

## Dosya Kategorileri

### guides/development/
- DEVELOPMENT_GUIDE.md
- BASE_APP_WALLET_CONNECTION_GUIDE.md
- CONTRACT_INTERACTION_GUIDE.md
- SPONSORLESS_MODE_GUIDE.md
- SCORE_SUBMISSION_FLOW.md

### guides/debugging/
- DEBUG_GUIDE.md
- MOBILE_DEBUG_LOGS_GUIDE.md
- SCORE_SUBMISSION_DEBUG_GUIDE.md

### guides/integration/
- WALLET_INTEGRATION_COMPLIANCE.md
- UNIFIED_WALLET_INTEGRATION_MODEL.md

### guides/user-experience/
- USER_EXPERIENCE_FLOW.md
- UI_DESIGN_GUIDE.md

### plans/
- MERGE_DUPLICATE_PROFILES_PLAN.md
- PERSISTENT_PROFILE_STORAGE_PLAN.md
- FREE_SOLUTION_PLAN.md
- 100_PERCENT_COMPLIANCE_PLAN.md

### analysis/
- INTEGRATION_ANALYSIS.md
- MINI_APP_SAFETY_ANALYSIS.md
- PAYMASTER_SYSTEM_ANALYSIS.md
- INNERHTML_SAFETY_ANALYSIS.md
- PHASE2_SAFETY_ANALYSIS.md
- API_ENDPOINTS_ANALYSIS.md
- WALLET_CONNECTION_STATUS_ANALYSIS.md

### external/
- Base_MiniApps_Docs.md
- Farcaster_MiniApps_Docs.md
- CDP_Coinbase_Developer_Docs_MiniApp_Paymaster.md

### reports/
- CODE_REVIEW_REPORT.md
- LEADERBOARD_PROFILE_TEST_REPORT.md
- LEADERBOARD_PROFILE_FIX.md
- 100_PERCENT_COMPLIANCE_ACHIEVED.md
- API_KEY_UPDATE_STATUS.md
- PROFILE_MAPPING_SERVERLESS_ISSUE.md
- PASSKEY_PROMPT_FIX.md

### solutions/ (Alternatif: Çözümler ve implementation'lar)
- BULK_ENDPOINT_SOLUTION.md
- FREE_SOLUTION_IMPLEMENTATION.md
- NEYNAR_FREE_ALTERNATIVES.md
- NEYNAR_API_KEY_GUIDE.md
- UPSTASH_REDIS_ENV_VARS.md

### common/ (Mevcut)
- glossary.md
- common/telemetry.md
- common/troubleshooting.md

## README.md İçeriği

Ana index dosyası oluşturulmalı:
- Klasör yapısı açıklaması
- Hızlı linkler
- En önemli dokümanlar
- Nasıl kullanılır rehberi

## Aksiyon Adımları

1. ✅ Klasör yapısını oluştur
2. ⏳ Dosyaları kategorilere göre taşı
3. ⏳ README.md'yi güncelle
4. ⏳ Tüm link'leri kontrol et ve güncelle
5. ⏳ Gereksiz/duplicate dosyaları temizle

## Notlar

- Büyük external dokümanlar (`Base_MiniApps_Docs.md`, `Farcaster_MiniApps_Docs.md`) ayrı klasörde tutulmalı
- Plan dokümanları ayrı klasörde organize edilmeli
- Rehberler kullanım amacına göre alt klasörlere ayrılmalı




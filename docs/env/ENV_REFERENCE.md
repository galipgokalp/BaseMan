# Environment Variables Reference

This documentation describes all environment variables used in the BaseMan project.

## Table of Contents

- [AI Agent Configuration](#ai-agent-configuration)
- [Base Network Configuration](#base-network-configuration)
- [CDP Configuration](#cdp-coinbase-developer-platform-configuration)
- [Ethereum Network Configuration](#ethereum-network-configuration)
- [Farcaster Configuration](#farcaster-configuration)
- [Inngest Configuration](#inngest-configuration)
- [Key-Value Store Configuration](#key-value-store-kvredis-configuration)
- [Leaderboard Configuration](#leaderboard-configuration)
- [MiniApp Authentication Configuration](#miniapp-authentication-configuration)
- [Next.js Public Variables](#nextjs-public-environment-variables)
- [Neynar API Configuration](#neynar-api-configuration)
- [OpenAI Configuration](#openai-configuration)
- [Paymaster Configuration](#paymaster-configuration)
- [Profile Store Configuration](#profile-store-configuration)
- [Quest Configuration](#quest-configuration)
- [Registry Configuration](#registry-configuration)
- [Redis Configuration](#redis-configuration)
- [Rollbar Configuration](#rollbar-error-tracking-configuration)
- [RPC URL Configuration](#rpc-url-configuration)
- [Score Configuration](#score-configuration)
- [Telegram Configuration](#telegram-configuration)
- [Upstash Redis Configuration](#upstash-redis-configuration)
- [Other Configuration](#other-configuration)

---

## AI Agent Configuration

### `AI_AGENT_ENABLED`
- **Type:** `string` (boolean)
- **Required:** Optional
- **Default:** `"true"`
- **Description:** Enables/disables the AI Agent feature. Used for AI-powered error analysis and solution suggestions.

### `AI_AGENT_MIN_SEVERITY`
- **Type:** `string`
- **Required:** Optional
- **Default:** `"error"`
- **Description:** Minimum error severity level that AI Agent will analyze. Values: `critical`, `high`, `medium`, `low`, `error`.

### `AI_AGENT_MODEL`
- **Type:** `string`
- **Required:** Optional
- **Default:** `"gpt-4o-mini"`
- **Description:** OpenAI model to use for AI Agent. Examples: `gpt-4o-mini`, `gpt-4`, `gpt-3.5-turbo`.

### `AI_AGENT_WEBHOOK_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** `"https://base-man.vercel.app/api/ai-agent-webhook"`
- **Description:** AI Agent webhook endpoint URL. Address where error analysis results will be sent.

### `AI_PROVIDER`
- **Type:** `string`
- **Required:** Optional
- **Default:** `"groq"`
- **Description:** AI provider. Values: `groq`, `openai`.

---

## Base Network Configuration

### `BASESCAN_API_KEY`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** BaseScan (Base blockchain explorer) API key. Used to query blockchain data.

### `BASE_BUILDER_ALLOWED_ADDRESSES`
- **Type:** `string` (comma-separated)
- **Required:** Optional
- **Default:** None
- **Description:** Allowed Ethereum addresses for Base Builder. Comma-separated list of addresses.

### `BASE_MAINNET_REGISTRY_ADDRESS`
- **Type:** `string` (address)
- **Required:** Required
- **Default:** `"0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2"`
- **Description:** Registry contract address on Base Mainnet. Used for score and quest registrations.

### `BASE_MAINNET_RPC_URL`
- **Type:** `string` (URL)
- **Required:** Required
- **Default:** None
- **Description:** Base Mainnet RPC endpoint URL. Used for blockchain communication.

### `BASE_RPC_URL`
- **Type:** `string` (URL)
- **Required:** Required
- **Default:** None
- **Description:** General RPC URL for Base network. Used for main network connection.

### `BASE_SEPOLIA_QUEST_SIGNER_PRIVATE_KEY`
- **Type:** `string` (private key)
- **Required:** Optional
- **Default:** None
- **Description:** Private key used for quest signing on Base Sepolia testnet. **SECURITY:** Never commit to production!

### `BASE_SEPOLIA_REGISTRY_ADDRESS`
- **Type:** `string` (address)
- **Required:** Optional (for testnet)
- **Default:** `"0x3c52dEd86f9E56663cA680D773B64f8f62380cBc"`
- **Description:** Registry contract address on Base Sepolia testnet.

### `BASE_SEPOLIA_REGISTRY_CHAIN_ID`
- **Type:** `string` (number)
- **Required:** Optional
- **Default:** `"84532"`
- **Description:** Base Sepolia testnet chain ID.

### `BASE_SEPOLIA_RPC_URL`
- **Type:** `string` (URL)
- **Required:** Optional (for testnet)
- **Default:** None
- **Description:** Base Sepolia testnet RPC endpoint URL.

### `BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY`
- **Type:** `string` (private key)
- **Required:** Optional
- **Default:** None
- **Description:** Private key used for score signing on Base Sepolia testnet. **SECURITY:** Never commit to production!

### `BASE_URL`
- **Type:** `string` (URL)
- **Required:** Required
- **Default:** `"https://base-man.vercel.app"`
- **Description:** BaseMan application production URL. Used for webhook and callback URLs.

---

## CDP (Coinbase Developer Platform) Configuration

### `CDP_API_KEY`
- **Type:** `string`
- **Required:** Optional (legacy)
- **Default:** None
- **Description:** Legacy variable not used by the current code path. Prefer `CDP_API_KEY_ID` + `CDP_API_KEY_SECRET` for paymaster/bundler authentication.

### `CDP_API_KEY_ID`
- **Type:** `string` (UUID)
- **Required:** Required
- **Default:** None
- **Description:** CDP API key ID (client key). Used in CDP RPC URLs and as the `x-api-key` header for bundler/paymaster endpoints.

### `CDP_API_KEY_SECRET`
- **Type:** `string`
- **Required:** Required
- **Default:** None
- **Description:** CDP API key secret. Used server-side (paymaster proxy auth). **SECURITY:** Never commit or expose to the client.

### `CDP_BUNDLER_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** `"https://api.developer.coinbase.com/rpc/v1/base/<CDP_API_KEY_ID>"`
- **Description:** CDP bundler service endpoint URL. Use `/base` for mainnet or `/base-sepolia` for testnet.

### `CDP_DEFAULT_NETWORK`
- **Type:** `string`
- **Required:** Optional
- **Default:** `"base"`
- **Description:** Default network for CDP. Values: `base`, `base-sepolia`.

### `CDP_PAYMASTER_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** `"https://api.developer.coinbase.com/rpc/v1/base/<CDP_API_KEY_ID>"`
- **Description:** CDP paymaster service endpoint URL. Use `/base` for mainnet or `/base-sepolia` for testnet.

### `CDP_SQL_API_KEY`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** CDP SQL API key. Used to query blockchain data.

---

## Ethereum Network Configuration

### `ETHEREUM_RPC_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** Ethereum Mainnet RPC endpoint URL. Used for Ethereum blockchain communication.

---

## Farcaster Configuration

### `FARCASTER_PROFILE_PROVIDER`
- **Type:** `string`
- **Required:** Optional
- **Default:** `"neynar"`
- **Description:** Provider used to fetch Farcaster profile data. Values: `neynar`, `warpcast`.

---

## Inngest Configuration

### `INNGEST_EVENT_KEY`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Inngest event key. Used for background jobs and event processing.

### `INNGEST_SIGNING_KEY`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Inngest signing key. Used to verify webhook signatures.

---

## Key-Value Store (KV/Redis) Configuration

### `KV_REST_API_READ_ONLY_TOKEN`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Read-only API token for KV store. Used only for read operations.

### `KV_REST_API_TOKEN`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** REST API token for KV store. Used for read and write operations.

### `KV_REST_API_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** KV store REST API endpoint URL'i.

### `KV_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** KV store connection URL. Used for connection via Redis protocol.

---

## Leaderboard Configuration

### `LEADERBOARD_DISABLE_PROFILE_ENRICHMENT`
- **Type:** `string` (boolean)
- **Required:** Optional
- **Default:** `""` (empty = enabled)
- **Description:** Disables profile enrichment (Farcaster profile information) on leaderboard. If `"true"`, profile information is not displayed.

### `LEADERBOARD_FALLBACK_CHUNK_SIZE`
- **Type:** `string` (number)
- **Required:** Optional
- **Default:** `"100"`
- **Description:** Chunk size for fallback mechanism in leaderboard queries. Determines how many events will be processed at once when RPC fallback is used.

### `LEADERBOARD_FALLBACK_WINDOW_BLOCKS`
- **Type:** `string` (number)
- **Required:** Optional
- **Default:** `"10000"`
- **Description:** Block window size for leaderboard fallback mechanism. Determines how many blocks to go back when RPC fallback is used.

### `LEADERBOARD_RPC_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** Custom RPC URL for leaderboard. Used as fallback when CDP SQL API fails.

---

## MiniApp Authentication Configuration

### `MINIAPP_AUTH_DOMAIN`
- **Type:** `string`
- **Required:** Required
- **Default:** `"base-man.vercel.app"`
- **Description:** Domain for MiniApp authentication. Used to verify request signatures.

### `MINIAPP_AUTH_MODE`
- **Type:** `string`
- **Required:** Optional
- **Default:** `"verify"`
- **Description:** MiniApp authentication mode. Values: `verify`, `skip`.

### `MINIAPP_AUTH_ORIGIN`
- **Type:** `string` (URL)
- **Required:** Required
- **Default:** `"https://base-man.vercel.app"`
- **Description:** Origin URL for MiniApp authentication. Used for CORS and security checks.

### `MINIAPP_AUTH_VERIFY_HEADERS`
- **Type:** `string` (comma-separated)
- **Required:** Optional
- **Default:** `"x-miniapp-signature,x-miniapp-timestamp"`
- **Description:** Headers to verify for MiniApp authentication. Comma-separated header names.

### `MINIAPP_AUTH_VERIFY_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** `"https://base-man.vercel.app/api/miniapp-auth"`
- **Description:** MiniApp authentication verification endpoint URL'i.

---

## Next.js Public Environment Variables

These variables start with the `NEXT_PUBLIC_` prefix and can be used on the client-side. **WARNING:** These variables are visible in the browser and should not contain sensitive information!

### `NEXT_PUBLIC_BASE_MAINNET_REGISTRY_ADDRESS`
- **Type:** `string` (address)
- **Required:** Required
- **Default:** `"0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2"`
- **Description:** Base Mainnet registry contract address (client-side).

### `NEXT_PUBLIC_BASE_MAINNET_RPC_URL`
- **Type:** `string` (URL)
- **Required:** Required
- **Default:** None
- **Description:** Base Mainnet RPC URL (client-side).

### `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** Base Sepolia testnet RPC URL (client-side).

### `NEXT_PUBLIC_BUNDLER_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** Bundler service URL (client-side). If unset, `NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT` can provide a fallback.

### `NEXT_PUBLIC_CDP_API`
- **Type:** `string`
- **Required:** Optional
- **Default:** `""`
- **Description:** CDP API endpoint (client-side). Usually left empty.

### `NEXT_PUBLIC_MINIAPP_ID`
- **Type:** `string` (UUID)
- **Required:** Required
- **Default:** None
- **Description:** BaseMan MiniApp ID. ID defined in Farcaster and Base MiniApp platforms.

### `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
- **Type:** `string`
- **Required:** Required
- **Default:** None
- **Description:** OnchainKit API key. Used for wallet connection and blockchain transactions.

### `NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME`
- **Type:** `string`
- **Required:** Required
- **Default:** `"BaseMan"`
- **Description:** OnchainKit project name.

### `NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** Combined endpoint URL for paymaster and bundler (used as a fallback when specific URLs are not set).

### `NEXT_PUBLIC_PAYMASTER_URL`
- **Type:** `string` (URL)
- **Required:** Required (for gasless flow)
- **Default:** `"/api/paymaster-proxy"`
- **Description:** Paymaster service URL (client-side). Use `/api/paymaster-proxy` in production to avoid exposing CDP endpoints.

### `NEXT_PUBLIC_ALLOW_DIRECT_PAYMASTER_URL`
- **Type:** `string` (boolean)
- **Required:** Optional
- **Default:** `"false"`
- **Description:** If `"true"`, allows direct CDP paymaster URLs on the client in production. Keep `false` to force `/api/paymaster-proxy`.

### `NEXT_PUBLIC_REGISTRY_ADDRESS`
- **Type:** `string` (address)
- **Required:** Required
- **Default:** `"0x2fd9492E5f0F9559152bB5d4d23843072bCF17E2"`
- **Description:** Registry contract address (client-side).

### `NEXT_PUBLIC_REGISTRY_CHAIN_ID`
- **Type:** `string` (number)
- **Required:** Required
- **Default:** `"8453"`
- **Description:** Chain ID where the registry contract is located (client-side).

### `NEXT_PUBLIC_REGISTRY_EIP712_VERSION`
- **Type:** `string` (number)
- **Required:** Required
- **Default:** `"2"`
- **Description:** EIP-712 signature version (client-side).

### `NEXT_PUBLIC_ROLLBAR_BASE_MAN_CLIENT_TOKEN_1764367657`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Rollbar client-side error tracking token. Vercel Marketplace format.

### `NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Rollbar client-side error tracking token. Standart format.

### `NEXT_PUBLIC_URL`
- **Type:** `string` (URL)
- **Required:** Required
- **Default:** `"https://base-man.vercel.app"`
- **Description:** BaseMan application public URL (client-side).

### `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** WalletConnect Project ID. Used for wallet connection.

### `NEXT_PUBLIC_WC_PROJECT_ID`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** WalletConnect Project ID (alternative name).

---

## Neynar API Configuration

### `NEYNAR_API_KEY`
- **Type:** `string`
- **Required:** Required (for profile enrichment)
- **Default:** None
- **Description:** Neynar API key. Used to fetch Farcaster user profile information. See [Neynar API Key Guide](../NEYNAR_API_KEY_GUIDE.md).

---

## OpenAI Configuration

### `OPENAI_API_KEY`
- **Type:** `string`
- **Required:** Optional (for AI Agent)
- **Default:** None
- **Description:** OpenAI API key. Used for AI Agent feature. See [AI Agent Setup](../AI_AGENT_SETUP.md).

---

## Paymaster Configuration

Paymaster support is available in Base App; Farcaster mini-app wallets do not support paymaster and fall back to sponsorless transactions.

### `PAYMASTER_ALLOWED_SELECTORS`
- **Type:** `string` (comma-separated hex)
- **Required:** Required
- **Default:** `"0x42a252f6,0xa12020e8"`
- **Description:** Function selectors that will be sponsored by paymaster. Comma-separated hex values.

### `PAYMASTER_ALLOWED_TARGETS`
- **Type:** `string` (comma-separated addresses)
- **Required:** Required
- **Default:** Registry contract addresses
- **Description:** Contract addresses that will be sponsored by paymaster. Comma-separated list of addresses.

### `PAYMASTER_ENFORCE_ALLOWLIST`
- **Type:** `string` (boolean)
- **Required:** Optional
- **Default:** `"true"`
- **Description:** Enables/disables paymaster allowlist requirement.

### `PAYMASTER_MAX_CALLS`
- **Type:** `string` (number)
- **Required:** Optional
- **Default:** `"1"`
- **Description:** Maximum number of function calls that will be sponsored by paymaster.

### `PAYMASTER_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** Legacy alias of `PAYMASTER_SERVICE_URL`. If set, the proxy will use it as the upstream paymaster endpoint.

### `PAYMASTER_SERVICE_URL`
- **Type:** `string` (URL)
- **Required:** Required (for paymaster proxy)
- **Default:** None
- **Description:** Paymaster service endpoint URL (CDP Paymaster). Use `/base` for mainnet or `/base-sepolia` for testnet.

---

## Profile Store Configuration

### `PROFILE_STORE_TOKEN`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Authentication token for profile store. Used to store user profile data.

### `PROFILE_STORE_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** Profile store endpoint URL'i.

---

## Quest Configuration

### `ALLOWED_QUEST_IDS`
- **Type:** `string` (comma-separated)
- **Required:** Optional
- **Default:** `""`
- **Description:** Allowed quest IDs. Comma-separated list of IDs. If empty, all quests are accepted.

### `QUEST_REQUIRE_MINIAPP_AUTH`
- **Type:** `string` (boolean)
- **Required:** Optional
- **Default:** `""`
- **Description:** MiniApp authentication requirement for quest signing. If `"true"`, authentication is required.

### `QUEST_SIGNER_PRIVATE_KEY`
- **Type:** `string` (private key)
- **Required:** Optional
- **Default:** None
- **Description:** Private key used for quest signing. **SECURITY:** Never commit to production!

---

## Registry Configuration

### `REGISTRY_CHAIN_ID`
- **Type:** `string` (number)
- **Required:** Required
- **Default:** `"8453"` (Base Mainnet)
- **Description:** Chain ID where the registry contract is located.

### `REGISTRY_DEFAULT_TARGET`
- **Type:** `string`
- **Required:** Required
- **Default:** `"base"`
- **Description:** Default target network for registry. Values: `base`, `base-sepolia`.

### `REGISTRY_EIP712_VERSION`
- **Type:** `string` (number)
- **Required:** Required
- **Default:** `"2"`
- **Description:** EIP-712 signature version. Must be compatible with the registry contract.

---

## Redis Configuration

### `REDIS_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** Redis connection URL. Vercel integration format: `redis://[endpoint]:[port]`. See [Upstash Redis Env Vars](../UPSTASH_REDIS_ENV_VARS.md).

---

## Rollbar Error Tracking Configuration

### `ROLLBAR_BASE_MAN_SERVER_TOKEN_1764367657`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Rollbar server-side error tracking token. Vercel Marketplace format.

### `ROLLBAR_SERVER_TOKEN`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Rollbar server-side error tracking token. Standart format.

---

## RPC URL Configuration

### `RPC_URL_BASE`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** `"https://mainnet.base.org"`
- **Description:** General RPC URL for Base Mainnet.

### `RPC_URL_BASE_SEPOLIA`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** `"https://sepolia.base.org"`
- **Description:** General RPC URL for Base Sepolia testnet.

---

## Score Configuration

### `SCORE_REQUIRE_MINIAPP_AUTH`
- **Type:** `string` (boolean)
- **Required:** Optional
- **Default:** `""`
- **Description:** MiniApp authentication requirement for score signing. If `"true"`, authentication is required.

### `SCORE_SIGNER_PRIVATE_KEY`
- **Type:** `string` (private key)
- **Required:** Optional
- **Default:** None
- **Description:** Private key used for score signing. **SECURITY:** Never commit to production!

---

## Telegram Configuration

### `TELEGRAM_BOT_TOKEN`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Telegram bot token. Used for Telegram notifications.

### `TELEGRAM_CHAT_ID`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Telegram chat ID. Chat ID where notifications will be sent.

---

## Upstash Redis Configuration

### `UPSTASH_REDIS_REST_TOKEN`
- **Type:** `string`
- **Required:** Optional
- **Default:** None
- **Description:** Upstash Redis REST API token. Standard Upstash format. See [Upstash Redis Env Vars](../UPSTASH_REDIS_ENV_VARS.md).

### `UPSTASH_REDIS_REST_URL`
- **Type:** `string` (URL)
- **Required:** Optional
- **Default:** None
- **Description:** Upstash Redis REST API endpoint URL. Standard Upstash format.

---

## Other Configuration

### `ALLOWED_QUEST_IDS`
- **Type:** `string` (comma-separated)
- **Required:** Optional
- **Default:** `""`
- **Description:** Allowed quest IDs. Comma-separated list of IDs.

### `DEPLOYER_PRIVATE_KEY`
- **Type:** `string` (private key)
- **Required:** Optional
- **Default:** None
- **Description:** Private key used for contract deployment. **SECURITY:** Never commit to production! Should only be used for test accounts.

### `GROQ_API_KEY`
- **Type:** `string`
- **Required:** Optional (for AI Agent)
- **Default:** None
- **Description:** Groq API key. Alternative AI provider for AI Agent. See [AI Agent Setup](../AI_AGENT_SETUP.md).

### `MANIFEST_REQUIRED_CHAINS`
- **Type:** `string` (comma-separated)
- **Required:** Optional
- **Default:** `"8453,84532"`
- **Description:** Required chain IDs in MiniApp manifest. Comma-separated list of chain IDs.

### `PRIVATE_KEY`
- **Type:** `string` (private key)
- **Required:** Optional
- **Default:** None
- **Description:** General-purpose private key. **SECURITY:** Never commit to production! Should only be used for test accounts.

### `REQUIRE_MINIAPP_AUTH`
- **Type:** `string` (boolean)
- **Required:** Optional
- **Default:** `""`
- **Description:** General MiniApp authentication requirement. If `"true"`, all API endpoints require authentication.

---

## Security Notes

⚠️ **IMPORTANT SECURITY WARNINGS:**

1. **Private Keys:** Variables like `PRIVATE_KEY`, `DEPLOYER_PRIVATE_KEY`, `*_SIGNER_PRIVATE_KEY` should **NEVER** be committed to public repositories!

2. **API Keys:** Secret API keys like `CDP_API_KEY_SECRET`, `NEYNAR_API_KEY`, `OPENAI_API_KEY` should be kept in `.env` file and protected with `.gitignore`.

3. **Client-Side Variables:** Variables with `NEXT_PUBLIC_*` prefix are visible in the browser. They should not contain sensitive information!

4. **Vercel Environment Variables:** All secret variables in production should be set from Vercel Dashboard.

---

## Usage

### Local Development

1. Copy `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in all required variables.

3. You can create `.env.local` file for local overrides.

### Production (Vercel)

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all required variables
3. Select environments (Production, Preview, Development)
4. Deploy

---

## Related Documentation

- [AI Agent Setup](../AI_AGENT_SETUP.md)
- [Neynar API Key Guide](../NEYNAR_API_KEY_GUIDE.md)
- [Upstash Redis Env Vars](../UPSTASH_REDIS_ENV_VARS.md)
- [Base MiniApps Docs](../vendor/Base_MiniApps_Docs.md)
- [Farcaster MiniApps Docs](../vendor/Farcaster_MiniApps_Docs.md)

---

**Last Updated:** 2025-12-18
**Total Variables:** 89

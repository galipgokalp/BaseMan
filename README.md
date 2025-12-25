# BaseMan

BaseMan is a Pac-Man style arcade game with on-chain scoring on Base and MiniApp integration.

## Onboarding Router

- README.md is the human-facing constitution and project overview.
- AGENTS.md is the AI-agent constitution: [AGENTS.md](./AGENTS.md)
- Dev setup: [docs/guides/DEVELOPMENT_GUIDE.md](./docs/guides/DEVELOPMENT_GUIDE.md)
- Debug: [docs/guides/DEBUG_GUIDE.md](./docs/guides/DEBUG_GUIDE.md)
- Env reference: [docs/env/ENV_REFERENCE.md](./docs/env/ENV_REFERENCE.md)
- Docs index: [docs/README.md](./docs/README.md)

## Quickstart (Local Development)

1. Install dependencies:

```bash
npm install
```

2. Copy environment template and adjust as needed:

```bash
cp .env.example .env
```

3. Build the game bundle:

```bash
npm run game:build
```

4. Start the dev server:

```bash
npm run dev
```

## Common Commands

```bash
npm run dev
npm run game:build
npm run manifest:generate
npm run onchain:config
npm run self:check
npm run healthcheck
npm run contracts:test
npm run docs:verify
npm run lint
npm run test:all
```

## Environment

See `.env.example` for required variables and [docs/env/ENV_REFERENCE.md](./docs/env/ENV_REFERENCE.md) for details.

Notes:
- Paymaster gas sponsorship is supported in Base App; Farcaster mini-app wallets do not support paymaster and fall back to sponsorless submissions.
- For gasless flow, keep `NEXT_PUBLIC_PAYMASTER_URL=/api/paymaster-proxy` and `NEXT_PUBLIC_ALLOW_DIRECT_PAYMASTER_URL=false`, and configure `PAYMASTER_SERVICE_URL` + CDP keys server-side.
- MiniApp wallet connectors are platform-specific: Farcaster uses `@farcaster/miniapp-wagmi-connector`, Base App prefers `baseAccount` with Farcaster connector fallback, and web uses injected/WalletConnect.

## License

See [LICENSE](./LICENSE).

# BaseMan

BaseMan is a Pac-Man style arcade game with on-chain scoring on Base and MiniApp integration.

## Onboarding Router

- AGENTS.md is the sole source of truth for architecture and rules: [AGENTS.md](./AGENTS.md)
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

## License

See [LICENSE](./LICENSE).

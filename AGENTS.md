# AGENTS.md — AI Agent Master Specification for BaseMan

This file is the **single source of truth** for any AI agent entering the BaseMan repository. It provides complete architectural understanding, safety constraints, and operational guidelines. Read this document fully before making any modifications.

---

## 1. Project Overview (For AI Agents)

**BaseMan** is a historically accurate Pac-Man arcade game remake with blockchain integration. It combines:

- **Classic JavaScript Game Engine**: Vanilla JS implementation of Pac-Man arcade game (~13,900 lines bundled)
- **Web3 Scoring System**: EIP-712 signed score submissions to Base blockchain smart contracts
- **Account Abstraction (EIP-4337)**: Gasless transactions via Coinbase Paymaster
- **Farcaster Mini App Integration**: Embedded wallet support within Farcaster mobile app
- **Leaderboard System**: On-chain score aggregation with Farcaster profile enrichment

### High-Level Component Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BASEMAN ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │  Game Engine │    │   Frontend   │    │    Backend API       │  │
│  │  (pacman.js) │◄──►│   (UI/React) │◄──►│  (Vercel Functions)  │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│         │                   │                      │                │
│         │                   │                      │                │
│         ▼                   ▼                      ▼                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   On-Chain Client (src/onchain-client.js)     │  │
│  │                   window.BaseManOnchain                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Smart Contract (BaseManRegistry.sol)             │  │
│  │              EIP-712 V2 Score & Quest Registry                │  │
│  │              Base Mainnet (8453) / Base Sepolia (84532)       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Vanilla JS, React 19, Wagmi 2, Viem |
| Backend | Node.js 20, Vercel Serverless Functions |
| Blockchain | ethers.js v6, Hardhat, Solidity 0.8.x |
| Data | Coinbase Data Platform (CDP) SQL, Redis (Upstash) |
| Auth | Farcaster Mini App JWT, Neynar API |

---

## 2. Repository Structure (AI-Focused Guide)

### Directory Overview

```
/home/galip/BaseMan/
├── contracts/          # Solidity smart contracts (CRITICAL - DO NOT MODIFY)
├── api/                # Vercel serverless API functions
├── src/                # Client-side game and UI code
├── scripts/            # Build, deploy, and testing scripts
├── test/               # Hardhat test suite
├── config/             # Configuration templates
├── docs/               # Documentation
├── vendor/             # Third-party dependencies
├── styles/             # CSS stylesheets
├── fonts/, sounds/, sprites/, icon/, shots/  # Game assets
└── [root files]        # package.json, vercel.json, etc.
```

### 2.1 contracts/ — Smart Contracts

**Contents**: Solidity source files for on-chain logic

**Key File**:
- `BaseManRegistry.sol` — The **single source of truth** for on-chain score/quest logic

**AI Guidance**:
- **NEVER modify** without explicit instruction
- Contains EIP-712 domain, typed data schemas, replay protection
- Any change requires contract redeployment and migration
- Read `test/BaseManRegistry.test.js` to understand expected behavior

### 2.2 api/ — Backend API Routes

**Contents**: Vercel serverless functions handling signatures, leaderboard, and paymaster

**Key Files**:
| File | Purpose | Modification Risk |
|------|---------|-------------------|
| `score-sign.js` | EIP-712 score signature generation | HIGH - crypto logic |
| `quest-sign.js` | EIP-712 quest signature generation | HIGH - crypto logic |
| `leaderboard.js` | Fetch top scores with profile enrichment | MEDIUM |
| `paymaster-proxy.js` | Proxy to Coinbase Paymaster with policy | HIGH - security |
| `app-log.js` | Client log aggregation + Telegram alerts | LOW |
| `_lib/registry.js` | EIP-712 domain and signer management | HIGH - crypto |
| `_lib/farcaster-profiles.js` | Neynar API integration | LOW |
| `_lib/miniapp-auth-verify.js` | JWT verification | MEDIUM |

**AI Guidance**:
- Signature endpoints (`score-sign.js`, `quest-sign.js`) contain cryptographic logic — verify understanding before modifying
- `paymaster-proxy.js` enforces strict allowlists — changes may break gasless flow
- `_lib/registry.js` defines EIP-712 domain — must match contract exactly

### 2.3 src/ — Client-Side Code

**Contents**: Game engine, UI panels, on-chain integration, utilities

**Structure**:
```
src/
├── game/               # Game engine modules (score-manager, game-mode)
├── onchain/            # Web3 integration layer
│   ├── index.js        # Central export point
│   ├── provider.js     # Chain metadata
│   ├── sdk-context.js  # SDK detection (Farcaster/Base App)
│   ├── score-service.js    # Score submission logic
│   └── profile-service.js  # Profile mapping
├── leaderboard/        # Leaderboard UI
├── ui/                 # React components (connect-menu)
├── utils/              # Utilities (logger, sdk-detection, etc.)
├── bootstrap/          # App initialization
├── onchain-client.js   # Main on-chain client (window.BaseManOnchain)
├── onchain-bootstrap.js # SDK polling and initialization
├── [game modules]      # Actor.js, Ghost.js, Player.js, Map.js, etc.
└── [UI panels]         # wallet-panel.js, settings-panel.js, etc.
```

**AI Guidance**:
- `onchain-client.js` is the bridge between game and blockchain — changes affect score submission flow
- `src/onchain/` contains modular Web3 logic — prefer editing here over monolithic files
- Game engine files (`Actor.js`, `Ghost.js`, etc.) should only be modified for bug fixes
- UI panels are safe to modify for visual changes

### 2.4 scripts/ — Build and Deployment

**Contents**: npm scripts for building, deploying, and testing

**Key Scripts**:
| Script | Purpose | Safety |
|--------|---------|--------|
| `build-pacman.mjs` | Concatenate game JS files | SAFE |
| `deploy-baseman-registry.cjs` | Deploy contract | HIGH - deploys to chain |
| `set-authorizer.cjs` | Set contract authorizer | HIGH - security critical |
| `generate-onchain-config.mjs` | Generate config from env | SAFE |
| `smoke-sepolia.mjs` | End-to-end test | SAFE |
| `healthcheck.mjs` | Verify endpoints | SAFE |

**AI Guidance**:
- Never modify deploy scripts in ways that change network or registry behavior
- Run `npm run self:check` after configuration changes

### 2.5 test/ — Test Suite

**Contents**: Hardhat contract tests and configuration tests

**Key Files**:
- `BaseManRegistry.test.js` — Contract unit tests (signature validation, replay protection)
- `config-sanity.test.js` — Configuration integrity tests

**AI Guidance**:
- Study tests to understand contract invariants
- Add tests for new functionality before implementing
- Never remove existing test coverage

---

## 3. Game Engine Architecture

### Overview

The game engine is a faithful Pac-Man arcade implementation using vanilla JavaScript and HTML5 Canvas.

**Build Output**: `pacman.js` (~13,900 lines)
**Build Command**: `npm run game:build`

### Module Structure

| Module | Responsibility |
|--------|---------------|
| `game.js` | Main game loop coordinator |
| `states.js` | State machine (menu, play, dead, over, cutscenes) |
| `Actor.js` | Base class for moving entities |
| `Player.js` | Pac-Man movement, collision, death logic |
| `Ghost.js` | Ghost AI and behavior patterns |
| `Map.js` | Tile-based level grid |
| `maps.js` | Original arcade level data |
| `mapgen.js` | Procedural maze generation (Cookie-Man mode) |
| `renderers.js` | Canvas 2D rendering pipeline |
| `sprites.js` | Sprite animation engine |
| `vcr.js` | Rewind/replay system (Braid-inspired) |
| `ghostCommander.js` | Ghost AI coordination |
| `hud.js` | Heads-up display |
| `input.js` | Keyboard/touch input |
| `sound.js` | Audio system |

### Game Modes

- **Pac-Man**: Classic arcade behavior
- **Ms. Pac-Man**: Slightly different ghost AI
- **Crazy Otto**: Faster gameplay
- **Cookie-Man**: Procedurally generated mazes

### AI Must NOT Break

- **Game loop timing**: Frame rate and update intervals
- **Input latency**: Response to player controls
- **Ghost AI patterns**: Arcade-accurate behavior
- **State machine transitions**: Menu → Play → Dead → Over
- **Score tracking**: Accurate point accumulation

### Safe Modifications

- Visual enhancements (colors, sprites)
- Sound replacements
- UI overlay improvements
- Debug visualizers
- Non-gameplay statistics

---

## 4. On-Chain Architecture

### EIP-712 Signing Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Client    │     │   Backend   │     │    Paymaster    │     │   Contract   │
│  (Browser)  │     │   (API)     │     │   (Coinbase)    │     │  (On-Chain)  │
└──────┬──────┘     └──────┬──────┘     └────────┬────────┘     └──────┬───────┘
       │                   │                     │                     │
       │  1. POST /api/score-sign               │                     │
       │  {playerAddress, score, durationMs}    │                     │
       │──────────────────►│                     │                     │
       │                   │                     │                     │
       │                   │ 2. Generate EIP-712 signature            │
       │                   │    - Build typed data                    │
       │                   │    - Sign with backend key               │
       │                   │                     │                     │
       │  3. Return {signature, deadline, nonce}│                     │
       │◄──────────────────│                     │                     │
       │                   │                     │                     │
       │  4. Build UserOperation                │                     │
       │     callData = submitScore(...)        │                     │
       │                   │                     │                     │
       │  5. POST /api/paymaster-proxy          │                     │
       │     {userOp with callData}             │                     │
       │──────────────────────────────────────►│                     │
       │                   │                     │                     │
       │                   │                     │ 6. Validate policy │
       │                   │                     │    - Check target   │
       │                   │                     │    - Check selector │
       │                   │                     │    - Check chainId  │
       │                   │                     │                     │
       │  7. Return sponsored userOp            │                     │
       │◄──────────────────────────────────────│                     │
       │                   │                     │                     │
       │  8. Submit via Bundler                 │                     │
       │─────────────────────────────────────────────────────────────►│
       │                   │                     │                     │
       │                   │                     │    9. Verify sig    │
       │                   │                     │    10. Check nonce  │
       │                   │                     │    11. Update score │
       │                   │                     │    12. Emit events  │
       │                   │                     │                     │
       │  13. Transaction receipt               │                     │
       │◄─────────────────────────────────────────────────────────────│
```

### EIP-712 Typed Data Structure

**Domain Separator**:
```solidity
EIP712Domain {
  name: "BaseManRegistry",
  version: "2",              // CRITICAL: Must match contract
  chainId: 84532,            // Base Sepolia (or 8453 for mainnet)
  verifyingContract: "0x..." // Registry contract address
}
```

**Score Type (V2)**:
```solidity
Score {
  address player,
  uint256 score,
  uint256 deadline,
  uint256 nonce           // V2 addition for replay protection
}
```

**Quest Type (V2)**:
```solidity
Quest {
  address player,
  uint256 questId,
  uint256 deadline,
  uint256 nonce
}
```

### Replay Protection

The contract uses a mapping to track used request digests:
```solidity
mapping(bytes32 => bool) public usedRequests;
```

Each submission:
1. Computes `digest = keccak256(abi.encode(TYPEHASH, player, score, deadline, nonce))`
2. Checks `!usedRequests[digest]`
3. Marks `usedRequests[digest] = true`

### Critical Invariants

**AI MUST NEVER MODIFY:**

| Component | Reason |
|-----------|--------|
| EIP-712 domain parameters | Breaks signature verification |
| Typed data schema | Invalidates all signatures |
| On-chain registry ABI | Breaks contract interaction |
| Nonce/deadline checks | Enables replay attacks |
| Replay protection logic | Security vulnerability |
| Chain ID validation | Cross-chain attacks |

---

## 5. Backend API Overview

### Endpoint Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/score-sign` | POST | Sign score submission | Optional (Mini App) |
| `/api/quest-sign` | POST | Sign quest completion | Optional (Mini App) |
| `/api/leaderboard` | GET | Fetch top scores | None |
| `/api/paymaster-proxy` | POST | Proxy to Coinbase Paymaster | API Key |
| `/api/app-log` | POST/GET | Log aggregation | None |
| `/api/address-history` | GET | Transaction history | None |
| `/api/miniapp-webhook` | POST | Farcaster webhooks | Webhook secret |
| `/api/miniapp-auth` | POST | Mini App JWT verification | None |

### Score Signing (`/api/score-sign`)

**Request**:
```json
{
  "playerAddress": "0x...",
  "score": 12345,
  "durationMs": 45000,
  "fid": "123",
  "username": "alice",
  "chain": "base-sepolia"
}
```

**Response**:
```json
{
  "signature": "0x...",
  "deadline": 1702345800,
  "nonce": "1702345200000",
  "contractAddress": "0x...",
  "chainId": 84532
}
```

**Validation**:
- Score: 0 ≤ score ≤ 100,000,000
- Duration: ≥ 3,000ms
- Address: Valid Ethereum checksum
- Rate limit: 3 requests per 15 seconds per player+IP

### Leaderboard (`/api/leaderboard`)

**Request**: `GET /api/leaderboard?limit=20&chain=8453`

**Data Sources** (priority order):
1. CDP SQL API — Primary (queries Base event logs)
2. RPC Fallback — If SQL unavailable (fetches events directly)
3. Cache — 15-second TTL to reduce queries

**Profile Enrichment**:
1. Header mapping (`X-Profile-Mapping`)
2. Redis cache
3. Neynar bulk API (Farcaster profiles)

### Paymaster Proxy (`/api/paymaster-proxy`)

**Purpose**: Validate and forward UserOperations to Coinbase Paymaster

**Policy Enforcement**:
- Target allowlist: Only registry contract
- Selector allowlist: Only `submitScore`, `completeQuest`
- Value check: Must be zero (no ETH transfers)
- Chain ID: Must match registry chain
- Max calls: 1 per transaction

**Security**: This endpoint is the last line of defense against misuse of sponsored transactions.

---

## 6. Configuration & Environment

### Critical Environment Variables

```bash
# ═══════════════════════════════════════════════════════════════
# SECURITY CRITICAL - Never commit, never log, never expose
# ═══════════════════════════════════════════════════════════════
BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY="0x..."
DEPLOYER_PRIVATE_KEY="0x..."

# ═══════════════════════════════════════════════════════════════
# Chain & Registry Configuration
# ═══════════════════════════════════════════════════════════════
REGISTRY_DEFAULT_TARGET=base-sepolia
REGISTRY_CHAIN_ID=84532
NEXT_PUBLIC_REGISTRY_ADDRESS="0x..."
BASE_SEPOLIA_REGISTRY_ADDRESS="0x..."

# ═══════════════════════════════════════════════════════════════
# RPC Endpoints
# ═══════════════════════════════════════════════════════════════
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
BASE_MAINNET_RPC_URL="https://mainnet.base.org"

# ═══════════════════════════════════════════════════════════════
# Paymaster / Bundler
# ═══════════════════════════════════════════════════════════════
PAYMASTER_SERVICE_URL="https://..."
PAYMASTER_ENFORCE_ALLOWLIST=true
PAYMASTER_ALLOWED_TARGETS="0x..."
PAYMASTER_ALLOWED_SELECTORS="0x42a252f6,0xa12020e8"

# ═══════════════════════════════════════════════════════════════
# External Services
# ═══════════════════════════════════════════════════════════════
CDP_SQL_API_KEY=""
NEYNAR_API_KEY=""
REDIS_URL=""

# ═══════════════════════════════════════════════════════════════
# Monitoring
# ═══════════════════════════════════════════════════════════════
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
ROLLBAR_ACCESS_TOKEN=""
```

### Configuration Generation

```bash
# Generate on-chain config from environment
npm run onchain:config
# Output: src/onchain-config.js

# Validate configuration
npm run self:check
npm run healthcheck
```

### AI Guidance

- **Never modify** environment variable names without updating all references
- **Never log** private keys or sensitive tokens
- **Always validate** configuration after changes with `npm run self:check`
- Registry address and chain ID must match deployed contract

---

## 7. Logging, Monitoring, and Error Handling

### Structured Logger (`src/utils/logger.js`)

```javascript
import { createLogger } from './utils/logger.js';
const log = createLogger('ModuleName');

log.debug('Debug message');
log.info('Info message');
log.warn('Warning message');
log.error('Error message', errorObject);
```

**Log Levels**: `DEBUG` < `INFO` < `WARN` < `ERROR` < `SILENT`

**Environment Control**: `BASEMAN_LOG_LEVEL=warn`

### Global Error Handler (`src/lib/global-error-handler.js`)

Catches unhandled errors and promise rejections:
- Formats errors consistently
- Sends to `/api/app-log`
- Triggers Telegram alerts for errors/warnings

### Telegram Alerts (`api/app-log.js`)

Errors and warnings are sent to Telegram:
```
🔴 ERROR [PRODUCTION]
Error message here

🕐 11.12.2025 21:08:32
👤 0x1234...5678

Stack trace...
```

### AI Guidance

- Use structured logging with namespace prefixes
- Never log sensitive data (private keys, tokens, full addresses)
- Errors should be actionable — include context
- Use `log.warnOnce()` to prevent log spam

---

## 8. Testing Strategy

### Contract Tests (`test/BaseManRegistry.test.js`)

**Coverage**:
- Valid signature storage
- Total score accumulation
- Nonce-based replay protection
- Signature deadline validation
- Quest completion flow
- Owner-only access control
- Pause/unpause guards
- Batch seeding operation

**Run Tests**:
```bash
npm run contracts:test
```

### Integration Tests

```bash
npm run smoke:sepolia      # Full flow test
npm run e2e:sponsor        # Paymaster test
npm run e2e:bundler        # Bundler test
npm run policy:check       # Policy verification
```

### Configuration Tests (`test/config-sanity.test.js`)

Validates environment and configuration integrity.

### AI Test Guidelines

When writing new tests:
1. Focus on invariants (what must always be true)
2. Test edge cases (zero values, max values, empty arrays)
3. Test error conditions (invalid signatures, expired deadlines)
4. Never remove existing test coverage
5. Run full test suite before committing

---

## 9. Rules for AI Agents (Critical Section)

### AI MUST NEVER

| Action | Reason |
|--------|--------|
| Change EIP-712 domain parameters | Breaks all signature verification |
| Modify typed data schema | Invalidates existing signatures |
| Alter smart contract logic | Requires redeployment, migration |
| Remove replay protection | Critical security vulnerability |
| Modify chain IDs or contract addresses | Breaks on-chain interaction |
| Change environment variable semantics | Breaks configuration |
| Expose private keys in logs/errors | Security breach |
| Modify deploy scripts to change networks | Could deploy to wrong chain |
| Remove rate limiting | Enables abuse |
| Bypass paymaster allowlist | Enables unauthorized sponsored txs |

### AI MAY SAFELY

| Action | Conditions |
|--------|------------|
| Improve UI components | No game loop changes |
| Add utility functions | No crypto logic |
| Refactor game modules | Preserve timing, input latency |
| Add error handling | Don't swallow critical errors |
| Add logging | Don't log sensitive data |
| Improve documentation | Accuracy required |
| Add safe tests | Don't remove existing coverage |
| Improve DX scripts | Don't change deploy behavior |
| Add configuration constants | Document in .env.example |
| Fix typos and formatting | Preserve logic |

### AI SHOULD ALWAYS

1. **Read AGENTS.md completely** before any modification
2. **Run self-check scripts** before and after changes
3. **Verify contract ABI compatibility** when touching on-chain code
4. **Test on Sepolia first** before mainnet changes
5. **Preserve backward compatibility** for APIs
6. **Consider Mini App constraints** (no browser APIs, limited storage)
7. **Ask for clarification** before security-sensitive changes

---

## 10. AI Quickstart Checklist

Before modifying any code, complete this checklist:

- [ ] **1. Read AGENTS.md completely** (this file)
- [ ] **2. Inspect `contracts/BaseManRegistry.sol`** — Understand on-chain logic
- [ ] **3. Inspect `test/BaseManRegistry.test.js`** — Understand expected behavior
- [ ] **4. Inspect `src/onchain-client.js`** — Understand client integration
- [ ] **5. Inspect `api/score-sign.js`** — Understand signature generation
- [ ] **6. Inspect `api/_lib/registry.js`** — Understand EIP-712 domain
- [ ] **7. Review `.env.example`** — Understand configuration
- [ ] **8. Run `npm run self:check`** — Verify environment
- [ ] **9. Run `npm run contracts:test`** — Verify contract tests pass
- [ ] **10. Identify modification scope** — Which layer? (game/UI/API/contract)

### Decision Tree for Modifications

```
Is the change in contracts/?
├── YES → STOP. Requires explicit instruction and migration plan.
└── NO → Continue

Does it affect EIP-712 signatures?
├── YES → STOP. Verify domain, types, and replay protection.
└── NO → Continue

Does it affect paymaster proxy?
├── YES → Verify allowlist policy is preserved.
└── NO → Continue

Does it affect game loop timing?
├── YES → Test extensively for frame rate and input latency.
└── NO → Continue

Is it a safe modification?
├── YES → Proceed with testing.
└── NO → Ask for clarification.
```

---

## 11. Key File Quick Reference

| File | Lines | Purpose | Risk |
|------|-------|---------|------|
| `contracts/BaseManRegistry.sol` | 198 | On-chain registry | CRITICAL |
| `api/score-sign.js` | 230 | Signature generation | HIGH |
| `api/paymaster-proxy.js` | 472 | Paymaster validation | HIGH |
| `api/_lib/registry.js` | 227 | EIP-712 domain config | HIGH |
| `api/leaderboard.js` | 1,283 | Leaderboard + profiles | MEDIUM |
| `src/onchain-client.js` | 380+ | Client integration | HIGH |
| `src/onchain/score-service.js` | ~300 | Score submission | HIGH |
| `test/BaseManRegistry.test.js` | 150+ | Contract tests | MEDIUM |
| `pacman.js` | 13,933 | Game engine bundle | LOW |
| `package.json` | 116 | Dependencies/scripts | LOW |

---

## 12. Emergency Procedures

### If Signatures Are Failing

1. Verify `authorizer` address on contract matches signer address
2. Check EIP-712 domain version (must be "2")
3. Verify chain ID matches deployment
4. Check deadline is in the future
5. Verify nonce hasn't been used

### If Paymaster Rejects

1. Check `PAYMASTER_ALLOWED_TARGETS` includes registry
2. Verify function selector is allowlisted
3. Check chain ID in UserOp matches registry
4. Verify `value` is zero
5. Check `callData` encodes valid function call

### If Leaderboard Is Empty

1. Check CDP SQL API key is valid
2. Verify RPC fallback is working
3. Check contract has emitted `ScoreAdded` events
4. Wait for CDP ingestion (5-10 minute delay)

### Contract Emergency

The contract has a `pause()` function for emergencies:
```solidity
// Owner-only
pause()   // Stops all submissions
unpause() // Resumes operations
```

---

## 13. Contact and Resources

- **CLAUDE.md**: Project development guide (human-focused)
- **docs/DEVELOPMENT_GUIDE.md**: Full setup workflow
- **docs/SCORE_SUBMISSION_FLOW.md**: Technical flow diagram
- **docs/CONTRACT_INTERACTION_GUIDE.md**: Contract details
- **docs/DEBUG_GUIDE.md**: Troubleshooting

---

*This document was generated for AI agents operating on the BaseMan codebase. For human developers, refer to CLAUDE.md and docs/DEVELOPMENT_GUIDE.md.*

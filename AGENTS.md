# AGENTS.md — AI Agent Master Specification for BaseMan

This file is the **single source of truth** for any AI agent entering the BaseMan repository. It provides complete architectural understanding, safety constraints, and operational guidelines. Read this document fully before making any modifications.

> **Note**: This document is synchronized with README.md. For human developers, refer to README.md and docs/DEVELOPMENT_GUIDE.md.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Repository Structure](#3-repository-structure)
4. [Game Engine Architecture](#4-game-engine-architecture)
5. [On-Chain Architecture](#5-on-chain-architecture)
6. [Backend API Reference](#6-backend-api-reference)
7. [Leaderboard System](#7-leaderboard-system)
8. [MiniApp Integration](#8-miniapp-integration)
9. [Configuration & Environment](#9-configuration--environment)
10. [Logging & Monitoring](#10-logging--monitoring)
11. [Testing Strategy](#11-testing-strategy)
12. [Rules for AI Agents (Critical)](#12-rules-for-ai-agents-critical)
13. [AI Quickstart Checklist](#13-ai-quickstart-checklist)
14. [Key File Quick Reference](#14-key-file-quick-reference)
15. [Emergency Procedures](#15-emergency-procedures)

---

## 1. Project Overview

**BaseMan** is a historically accurate Pac-Man arcade game remake with blockchain integration. It combines:

- **Classic JavaScript Game Engine**: Vanilla JS implementation of Pac-Man arcade game (~13,900 lines bundled)
- **Web3 Scoring System**: EIP-712 signed score submissions to Base blockchain smart contracts
- **Account Abstraction (EIP-4337)**: Gasless transactions via Coinbase Paymaster
- **Farcaster Mini App Integration**: Embedded wallet support within Farcaster mobile app
- **Base App Integration**: Native Base ecosystem MiniApp support
- **Leaderboard System**: On-chain score aggregation with Farcaster profile enrichment

### High-Level Architecture

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

### Data Flow Diagram

```
┌─────────────────┐
│  Mobile App     │
│  (Farcaster/    │
│   Base App)     │
└────────┬────────┘
         │
         │ SDK Context
         ▼
┌─────────────────┐
│  Frontend       │
│  (index.html)   │
│  - Game Engine  │
│  - UI Panels    │
└────────┬────────┘
         │
         │ HTTP/JSON
         ▼
┌─────────────────┐      ┌──────────────────┐
│  API Layer      │◄────►│  External APIs   │
│  (Vercel)       │      │  - Neynar API    │
│  - score-sign   │      │  - CDP SQL API   │
│  - leaderboard  │      │  - Redis Cache   │
│  - paymaster    │      └──────────────────┘
└────────┬────────┘
         │
         │ EIP-712 v2
         │ Signature
         ▼
┌─────────────────┐
│  Smart Contract │
│  BaseManRegistry│
│  (Base Chain)   │
└────────┬────────┘
         │
         │ Events
         ▼
┌─────────────────┐
│  CDP SQL API    │
│  (Indexing)     │
└─────────────────┘
```

---

## 2. Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Vanilla JS, React 19, Wagmi 2, Viem |
| Backend | Node.js 20, Vercel Serverless Functions |
| Blockchain | ethers.js v6, Hardhat, Solidity 0.8.x |
| Data | Coinbase Data Platform (CDP) SQL, Redis (Upstash) |
| Auth | Farcaster Mini App JWT, Neynar API |
| Caching | In-Memory (10s TTL), Redis (persistent), Vercel CDN |

---

## 3. Repository Structure

```
/home/galip/BaseMan/
├── contracts/          # Solidity smart contracts (CRITICAL - DO NOT MODIFY)
├── api/                # Vercel serverless API functions
│   └── _lib/           # Shared backend utilities
├── src/                # Client-side game and UI code
│   ├── game/           # Game engine modules
│   ├── onchain/        # Web3 integration layer
│   ├── leaderboard/    # Leaderboard UI modules
│   ├── ui/             # React components
│   ├── utils/          # Utilities (logger, sdk-detection)
│   ├── lib/            # Shared client utilities
│   └── bootstrap/      # App initialization
├── scripts/            # Build, deploy, and testing scripts
├── test/               # Hardhat test suite
├── config/             # Configuration templates
├── docs/               # Documentation
├── vendor/             # Third-party dependencies
├── styles/             # CSS stylesheets
├── fonts/, sounds/, sprites/, icon/, shots/  # Game assets
└── [root files]        # package.json, vercel.json, etc.
```

### 3.1 contracts/ — Smart Contracts

**Key File**: `BaseManRegistry.sol` — The **single source of truth** for on-chain score/quest logic

**AI Guidance**:

- ⛔ **NEVER modify** without explicit instruction
- Contains EIP-712 domain, typed data schemas, replay protection
- Any change requires contract redeployment and migration
- Read `test/BaseManRegistry.test.js` to understand expected behavior

### 3.2 api/ — Backend API Routes

| File | Purpose | Risk Level |
|------|---------|------------|
| `score-sign.js` | EIP-712 score signature generation | 🔴 HIGH |
| `quest-sign.js` | EIP-712 quest signature generation | 🔴 HIGH |
| `leaderboard.js` | Fetch top scores with profile enrichment | 🟡 MEDIUM |
| `paymaster-proxy.js` | Proxy to Coinbase Paymaster with policy | 🔴 HIGH |
| `app-log.js` | Client log aggregation + Telegram alerts | 🟢 LOW |
| `miniapp-auth.js` | Mini App JWT verification | 🟡 MEDIUM |
| `miniapp-webhook.js` | Farcaster webhook handler | 🟡 MEDIUM |
| `address-history.js` | Transaction history | 🟢 LOW |
| `token-balances.js` | ERC-20 token balance queries | 🟢 LOW |
| `_lib/registry.js` | EIP-712 domain and signer management | 🔴 HIGH |
| `_lib/farcaster-profiles.js` | Neynar API integration | 🟢 LOW |
| `_lib/redis-profiles.js` | Redis profile caching | 🟢 LOW |
| `_lib/miniapp-auth-verify.js` | JWT verification | 🟡 MEDIUM |
| `_lib/cdp.js` | CDP SDK integration | 🟡 MEDIUM |

### 3.3 src/ — Client-Side Code

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
│   ├── api.js          # API client
│   ├── dom.js          # DOM rendering
│   ├── search.js       # Search functionality
│   ├── state.js        # State management
│   └── service.js      # Service modules
├── ui/                 # React components (connect-menu-v2.jsx)
├── utils/              # Utilities (logger, sdk-detection, etc.)
├── lib/                # Safe fetch, contract reading, error handling
├── bootstrap/          # App initialization
├── onchain-client.js   # Main on-chain client (window.BaseManOnchain)
├── onchain-bootstrap.js # SDK polling and initialization
├── onchain-config.js   # On-chain configuration
└── [game modules]      # Actor.js, Ghost.js, Player.js, Map.js, etc.
```

### 3.4 scripts/ — Build and Deployment

| Script | Purpose | Safety |
|--------|---------|--------|
| `build-pacman.mjs` | Concatenate game JS files | 🟢 SAFE |
| `deploy-baseman-registry.cjs` | Deploy contract | 🔴 HIGH |
| `set-authorizer.cjs` | Set contract authorizer | 🔴 HIGH |
| `generate-onchain-config.mjs` | Generate config from env | 🟢 SAFE |
| `smoke-sepolia.mjs` | End-to-end test | 🟢 SAFE |
| `healthcheck.mjs` | Verify endpoints | 🟢 SAFE |

---

## 4. Game Engine Architecture

### Overview

The game engine is a faithful Pac-Man arcade implementation using vanilla JavaScript and HTML5 Canvas.

- **Build Output**: `pacman.js` (~13,900 lines)
- **Build Command**: `npm run game:build`

### Game Modes

- **Pac-Man**: Classic arcade behavior
- **Ms. Pac-Man**: Slightly different ghost AI
- **Crazy Otto**: Faster gameplay
- **Cookie-Man**: Procedurally generated mazes

### Full Module Reference

#### Core Game Logic

| Module | Responsibility |
|--------|---------------|
| `game.js` | Core game loop, state machine, main orchestration |
| `executive.js` | Game flow, level progression, system coordination |
| `main.js` | Application entry point, high score loading, initial state |
| `states.js` | State definitions (home, playing, game over, etc.) |

#### Game Entities

| Module | Responsibility |
|--------|---------------|
| `Actor.js` | Base class for all game entities |
| `Player.js` | Pac-Man movement, input, player-specific logic |
| `Ghost.js` | Ghost AI and behavior patterns (scatter, chase, frightened, eaten) |
| `actors.js` | Actor factory and management system |

#### Artificial Intelligence

| Module | Responsibility |
|--------|---------------|
| `ghostCommander.js` | Ghost AI controller, behavior mode coordination |
| `ghostReleaser.js` | Ghost release timing from center area |
| `targets.js` | Target tile calculation for ghost AI |
| `elroyTimer.js` | Elroy mode (aggressive ghost behavior in later levels) |

#### Rendering & Graphics

| Module | Responsibility |
|--------|---------------|
| `renderers.js` | Canvas drawing operations |
| `sprites.js` | Sprite management and animation |
| `atlas.js` | Texture atlas for efficient rendering |
| `hud.js` | Heads-up display (score, lives, level) |
| `cutscenes.js` | Inter-level animations |

#### Game World & Maps

| Module | Responsibility |
|--------|---------------|
| `Map.js` | Tile-based map, collision detection, navigation |
| `maps.js` | Predefined level data (Pac-Man, Ms. Pac-Man) |
| `mapgen.js` | Procedural maze generation (Cookie-Man mode) |

#### Game Mechanics

| Module | Responsibility |
|--------|---------------|
| `energizer.js` | Power pellet effects, ghost vulnerability |
| `fruit.js` | Fruit spawning and collection |
| `direction.js` | Direction constants and movement calculations |
| `vcr.js` | Rewind/replay system (Braid-inspired) |

#### Input & Controls

| Module | Responsibility |
|--------|---------------|
| `input.js` | Keyboard, touch, and swipe input processing |

#### State Management

| Module | Responsibility |
|--------|---------------|
| `inGameMenu.js` | Pause menu, settings during gameplay |
| `Menu.js` | Main menu, mode selection, high score display |

#### Utilities

| Module | Responsibility |
|--------|---------------|
| `random.js` | Seeded random number generator |
| `colors.js` | Color palette management |
| `inherit.js` | JavaScript inheritance utilities |
| `Button.js` | Button UI component |

#### Special Features

| Module | Responsibility |
|--------|---------------|
| `galagaStars.js` | Starfield background effect |
| `sound.js` | Sound effects and music |

#### UI Panels (Non-Game)

| Module | Responsibility |
|--------|---------------|
| `leaderboard-panel.js` | Leaderboard UI with search and ranking |
| `profile-panel.js` | User profile, on-chain stats, Farcaster info |
| `wallet-panel.js` | Wallet connection status |
| `settings-panel.js` | Game settings and configuration |
| `bottom-nav.js` | Mobile bottom navigation bar |

#### Blockchain Integration

| Module | Responsibility |
|--------|---------------|
| `onchain-client.js` | Main client for wallet, score submission, blockchain |
| `onchain-bootstrap.js` | System initialization, SDK detection |
| `onchain-config.js` | Configuration loader |
| `onchain/provider.js` | Chain metadata |
| `onchain/score-service.js` | Score submission logic |
| `onchain/profile-service.js` | Profile mapping |
| `onchain/sdk-context.js` | SDK context utilities |

#### MiniApp Integration

| Module | Responsibility |
|--------|---------------|
| `miniapp-auth.js` | Farcaster Quick Auth handler |
| `miniapp-ethereum-shim.js` | Ethereum provider shim |
| `mock-miniapp-provider.js` | Mock provider for testing |

#### Debug & Development

| Module | Responsibility |
|--------|---------------|
| `debug-autosubmit.js` | Auto-submit test scores |
| `console-logger.js` | Console logging with levels |

### AI Must NOT Break

- ⛔ **Game loop timing**: Frame rate and update intervals
- ⛔ **Input latency**: Response to player controls
- ⛔ **Ghost AI patterns**: Arcade-accurate behavior
- ⛔ **State machine transitions**: Menu → Play → Dead → Over
- ⛔ **Score tracking**: Accurate point accumulation

### Safe Modifications

- ✅ Visual enhancements (colors, sprites)
- ✅ Sound replacements
- ✅ UI overlay improvements
- ✅ Debug visualizers
- ✅ Non-gameplay statistics

---

## 5. On-Chain Architecture

### Smart Contract Overview

**Contract**: `BaseManRegistry.sol`

**Addresses**:

- **Base Mainnet (8453)**: `0x3c52dEd86f9E56663cA680D773B64f8f62380cBc`
- **Base Sepolia (84532)**: `0x3c52dEd86f9E56663cA680D773B64f8f62380cBc`

### Score Model

```solidity
struct Score {
    uint256 highScore;      // Best single-run score (personal best)
    uint256 totalScore;     // Cumulative score (sum of all runs)
    uint256 lastUpdatedAt;  // Unix timestamp of last update
}

mapping(address => Score) private _scores;
mapping(bytes32 => bool) public usedRequests;  // Replay protection
address public authorizer;  // Backend signer address
bool public paused;  // Emergency pause mechanism
```

### Contract Events

```solidity
event ScoreSubmitted(address indexed player, uint256 score);  // High score broken
event ScoreAdded(address indexed player, uint256 score);      // Every submission
event QuestCompleted(address indexed player, uint256 questId); // Quest completed
```

### Contract Functions

**Public Functions**:

| Function | Purpose |
|----------|---------|
| `submitScore(player, score, deadline, nonce, signature)` | Submit a score |
| `completeQuest(player, questId, deadline, nonce, signature)` | Complete a quest |
| `getScore(address player)` | Query player's score data |
| `getHighScore(address player)` | Get player's best single-run score |
| `getTotalScore(address player)` | Get player's cumulative score |
| `isQuestCompleted(player, questId)` | Check quest completion status |

**Owner Functions**:

| Function | Purpose |
|----------|---------|
| `setAuthorizer(address)` | Update backend signer |
| `setQuest(questId, active, metadataURI)` | Configure quests |
| `pause() / unpause()` | Emergency controls |
| `seedTotals(players, totals, highs, timestamps)` | Bulk migration |

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
bytes32 public constant SCORE_TYPEHASH =
    keccak256("Score(address player,uint256 score,uint256 deadline,uint256 nonce)");
```

**Quest Type (V2)**:

```solidity
bytes32 public constant QUEST_TYPEHASH =
    keccak256("Quest(address player,uint256 questId,uint256 deadline,uint256 nonce)");
```

### Replay Protection

```solidity
bytes32 digest = _hashTypedDataV4(
    keccak256(abi.encode(SCORE_TYPEHASH, player, score, deadline, nonce))
);
if (usedRequests[digest]) revert Replay();
usedRequests[digest] = true;
```

### Critical Invariants

| Component | Reason | Risk |
|-----------|--------|------|
| EIP-712 domain parameters | Breaks signature verification | 🔴 CRITICAL |
| Typed data schema | Invalidates all signatures | 🔴 CRITICAL |
| On-chain registry ABI | Breaks contract interaction | 🔴 CRITICAL |
| Nonce/deadline checks | Enables replay attacks | 🔴 CRITICAL |
| Replay protection logic | Security vulnerability | 🔴 CRITICAL |
| Chain ID validation | Cross-chain attacks | 🔴 CRITICAL |

---

## 6. Backend API Reference

### Endpoint Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/score-sign` | POST | Sign score submission | Optional |
| `/api/quest-sign` | POST | Sign quest completion | Optional |
| `/api/leaderboard` | GET | Fetch top scores | None |
| `/api/paymaster-proxy` | POST | Proxy to Coinbase Paymaster | API Key |
| `/api/app-log` | POST/GET | Log aggregation | None |
| `/api/address-history` | GET | Transaction history | None |
| `/api/token-balances` | GET | ERC-20 token balances | None |
| `/api/miniapp-webhook` | POST | Farcaster webhooks | Secret |
| `/api/miniapp-auth` | GET/POST | Mini App JWT verification | None |

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

**Validation Rules**:

- Score: `0 ≤ score ≤ 100,000,000`
- Duration: `≥ 3,000ms`
- Address: Valid Ethereum checksum
- Rate limit: 3 requests per 15 seconds per player+IP

### Score Submission Errors

| Error | Cause |
|-------|-------|
| `InvalidSignature` | Signature verification failed |
| `ExpiredSignature` | Deadline has passed |
| `Replay` | Request already processed |
| `PausedError` | Contract is paused |

**Frontend Error Recovery**:

- Automatic retry with exponential backoff
- User-friendly error messages
- Fallback to manual retry option

### Paymaster Proxy (`/api/paymaster-proxy`)

**Policy Enforcement**:

- Target allowlist: Only registry contract
- Selector allowlist: Only `submitScore`, `completeQuest`
- Value check: Must be zero (no ETH transfers)
- Chain ID: Must match registry chain
- Max calls: 1 per transaction

**Security**: This endpoint is the last line of defense against misuse of sponsored transactions.

---

## 7. Leaderboard System

### Architecture

**Data Sources (priority order)**:

1. **CDP SQL API** — Primary source, indexes contract events
2. **RPC Fallback** — Reads events from recent blocks if SQL unavailable
3. **Redis Cache** — Profile data caching for fast lookups

### Leaderboard Endpoint

**Request**: `GET /api/leaderboard?limit=20&chain=8453&debug=1`

**Query Parameters**:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `limit` | Number of entries (max 100) | 10 |
| `chain` | Chain ID | 8453 |
| `debug` | Enable debug mode | false |

**Response**:

```json
{
  "source": "cdp-sql-api",
  "chainId": 8453,
  "limit": 10,
  "count": 10,
  "items": [
    {
      "rank": 1,
      "player": "0x...",
      "totalScore": 1234567,
      "highScore": 50000,
      "lastUpdate": 1704067200,
      "lastUpdatedAt": "2024-01-01T00:00:00.000Z",
      "profile": {
        "fid": "12345",
        "username": "player1",
        "displayName": "Player One",
        "avatarUrl": "https://...",
        "profileUrl": "https://warpcast.com/player1",
        "platform": "farcaster"
      }
    }
  ],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Profile Enrichment

**Priority Order**:

1. **Header Mapping** — Profile data sent in `X-Profile-Mapping` header
2. **Redis Cache** — Persistent profile storage
3. **Neynar API** — Direct API lookup (if `NEYNAR_API_KEY` configured)
4. **FID Mapping** — Bulk FID lookups for efficiency

**Profile Data Structure**:

```typescript
interface Profile {
  fid: string;              // Farcaster ID
  username: string | null;  // Farcaster username
  displayName: string | null; // Display name
  avatarUrl: string | null;  // Profile picture URL
  profileUrl: string | null; // Warpcast profile URL
  platform: 'farcaster' | 'base-app' | null;
  provider: string;         // Data source identifier
}
```

### RPC Fallback

When CDP SQL API is unavailable:

1. Check last N blocks (configurable)
2. Read `ScoreAdded` and `ScoreSubmitted` events
3. Aggregate scores by player address
4. Return leaderboard with RPC-sourced data

**Configuration**:

| Variable | Description | Default |
|----------|-------------|---------|
| `LEADERBOARD_FALLBACK_WINDOW_BLOCKS` | Blocks to scan | 50000 |
| `LEADERBOARD_FALLBACK_CHUNK_SIZE` | Events per chunk | 400 |

### Caching Strategy

| Cache Type | TTL | Purpose |
|------------|-----|---------|
| In-Memory | 10 seconds | Leaderboard data |
| Request Deduplication | Per-request | Share in-flight requests |
| Redis | Persistent | Profile data |
| Vercel CDN | Varies | Static assets |

### Search Functionality

Client-side search on loaded leaderboard data:

```javascript
function searchLeaderboard(searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  return allEntries.filter(entry => {
    const username = entry?.profile?.username?.toLowerCase() || '';
    const displayName = entry?.profile?.displayName?.toLowerCase() || '';
    const address = entry?.player?.toLowerCase() || '';
    return username.includes(term) ||
           displayName.includes(term) ||
           address.includes(term);
  });
}
```

---

## 8. MiniApp Integration

### Supported Platforms

- **Farcaster Mobile App**: Full SDK integration
- **Base App**: Native MiniApp support

### MiniApp Capabilities

- Automatic wallet connection (no user prompts)
- Seamless Quick Auth integration
- Native UI (bottom navigation, panels, modals)
- Webhook support via `/api/miniapp-webhook`
- Manifest-driven configuration

### Quick Auth (Farcaster)

```javascript
import { authenticate } from '@farcaster/quick-auth';

const { token } = await authenticate({
  domain: 'base-man.vercel.app',
  siweUri: 'https://base-man.vercel.app',
  statement: 'Sign in to BaseMan'
});

// Verify token via backend
const response = await fetch('/api/miniapp-auth', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Base App Wallet Integration

```javascript
// Step 1: Detect Base App environment
function isBaseAppEnvironment() {
  if (typeof window === 'undefined') return false;

  // Use centralized SDK detection utility
  if (typeof window.resolveSDK === 'function') {
    const sdk = window.resolveSDK();
    if (sdk) {
      return typeof window.isBaseApp === 'function' && window.isBaseApp();
    }
  }

  // Fallback detection
  return typeof window.MiniKit !== 'undefined' ||
         typeof window.BaseAppSDK !== 'undefined';
}

// Step 2: Initialize wallet
async function initializeBaseAppWallet() {
  if (!isBaseAppEnvironment()) return null;

  // Resolve SDK
  let sdk = window.resolveSDK?.() || window.MiniKit?.sdk || window.sdk;
  if (!sdk) throw new Error('Base App SDK not available');

  // Get provider and accounts
  const provider = await sdk.wallet.getEthereumProvider();
  const accounts = await provider.request({ method: 'eth_accounts' });

  return { sdk, provider, accounts, address: accounts[0] };
}
```

### Manifest Configuration

Location: `config/manifest.base.json` → `.well-known/farcaster.json`

**Generate**: `npm run manifest:generate`

**Contents**:

- Account association (Farcaster domain verification)
- Base Builder analytics addresses
- Content Security Policy
- Required chains: Base Mainnet (8453), Base Sepolia (84532)
- Required capabilities: `actions.ready`, `wallet.getEthereumProvider`

---

## 9. Configuration & Environment

### Critical Environment Variables

```bash
# ═══════════════════════════════════════════════════════════════
# 🔴 SECURITY CRITICAL - Never commit, never log, never expose
# ═══════════════════════════════════════════════════════════════
BASE_SEPOLIA_SCORE_SIGNER_PRIVATE_KEY="0x..."
DEPLOYER_PRIVATE_KEY="0x..."
SCORE_SIGNER_PRIVATE_KEY="0x..."

# ═══════════════════════════════════════════════════════════════
# Chain & Registry Configuration
# ═══════════════════════════════════════════════════════════════
REGISTRY_DEFAULT_TARGET=base-sepolia
REGISTRY_CHAIN_ID=84532
BASE_SEPOLIA_REGISTRY_CHAIN_ID=84532
NEXT_PUBLIC_REGISTRY_ADDRESS="0x..."
BASE_SEPOLIA_REGISTRY_ADDRESS="0x..."
BASE_MAINNET_REGISTRY="0x..."
BASE_SEPOLIA_REGISTRY="0x..."

# ═══════════════════════════════════════════════════════════════
# RPC Endpoints
# ═══════════════════════════════════════════════════════════════
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
BASE_MAINNET_RPC_URL="https://mainnet.base.org"

# ═══════════════════════════════════════════════════════════════
# Paymaster / Bundler
# ═══════════════════════════════════════════════════════════════
PAYMASTER_SERVICE_URL="https://..."
CDP_PAYMASTER_URL="https://paymaster.cdp.coinbase.com/v1/..."
PAYMASTER_ENFORCE_ALLOWLIST=true
PAYMASTER_ALLOWED_TARGETS="0x..."
PAYMASTER_ALLOWED_SELECTORS="0x42a252f6,0xa12020e8"
NEXT_PUBLIC_BUNDLER_URL="https://..."

# ═══════════════════════════════════════════════════════════════
# CDP (Coinbase Data Platform)
# ═══════════════════════════════════════════════════════════════
CDP_API_KEY_ID="your-key-id"
CDP_API_KEY_SECRET="your-key-secret"
CDP_SQL_API_KEY=""
CDP_SQL_API_BASE_URL="https://api.cdp.coinbase.com"
NEXT_PUBLIC_CDP_API_BASE_URL="https://api.cdp.coinbase.com"

# ═══════════════════════════════════════════════════════════════
# Redis (Upstash)
# ═══════════════════════════════════════════════════════════════
UPSTASH_REDIS_REST_URL="https://...redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
REDIS_URL=""

# ═══════════════════════════════════════════════════════════════
# MiniApp Configuration
# ═══════════════════════════════════════════════════════════════
MINIAPP_APP_ID="your-farcaster-app-id"
MINIAPP_WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_BASE_URL="https://base-man.vercel.app"
NEXT_PUBLIC_BASEMAN_ENV="production"

# ═══════════════════════════════════════════════════════════════
# Profile Enrichment
# ═══════════════════════════════════════════════════════════════
NEYNAR_API_KEY="your-neynar-api-key"
FARCASTER_PROFILE_PROVIDER="neynar"
LEADERBOARD_DISABLE_PROFILE_ENRICHMENT=false

# ═══════════════════════════════════════════════════════════════
# Leaderboard Configuration
# ═══════════════════════════════════════════════════════════════
LEADERBOARD_RPC_URL=""
LEADERBOARD_FALLBACK_WINDOW_BLOCKS=50000
LEADERBOARD_FALLBACK_CHUNK_SIZE=400

# ═══════════════════════════════════════════════════════════════
# Monitoring
# ═══════════════════════════════════════════════════════════════
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
ROLLBAR_ACCESS_TOKEN=""
BASEMAN_LOG_LEVEL="info"
```

### Configuration Commands

```bash
# Generate on-chain config from environment
npm run onchain:config
# Output: src/onchain-config.js

# Validate configuration
npm run self:check
npm run healthcheck
```

### Vercel Deployment Caching

| Path | Cache Duration |
|------|---------------|
| `/.well-known/*` | 5 minutes |
| `/src/*` | No cache |
| `/vendor/*` | 1 year (immutable) |
| `/pacman.js` | No cache |
| `/index.html` | No cache |

---

## 10. Logging & Monitoring

### Structured Logger

```javascript
import { createLogger } from './utils/logger.js';
const log = createLogger('ModuleName');

log.debug('Debug message');
log.info('Info message');
log.warn('Warning message');
log.error('Error message', errorObject);
log.warnOnce('One-time warning');  // Prevents log spam
```

**Log Levels**: `DEBUG` < `INFO` < `WARN` < `ERROR` < `SILENT`

**Control**: `BASEMAN_LOG_LEVEL=warn`

### Global Error Handler

`src/lib/global-error-handler.js`:

- Catches unhandled errors and promise rejections
- Formats errors consistently
- Sends to `/api/app-log`
- Triggers Telegram alerts

### Telegram Alerts

Errors and warnings sent to Telegram:

```
🔴 ERROR [PRODUCTION]
Error message here

🕐 11.12.2025 21:08:32
👤 0x1234...5678

Stack trace...
```

### AI Logging Guidelines

- ✅ Use structured logging with namespace prefixes
- ✅ Errors should be actionable — include context
- ✅ Use `log.warnOnce()` to prevent log spam
- ⛔ Never log sensitive data (private keys, tokens, full addresses)

---

## 11. Testing Strategy

### Contract Tests

**File**: `test/BaseManRegistry.test.js`

**Coverage**:

- Valid signature storage
- Total score accumulation
- Nonce-based replay protection
- Signature deadline validation
- Quest completion flow
- Owner-only access control
- Pause/unpause guards
- Batch seeding operation

**Run**: `npm run contracts:test`

### Integration Tests

```bash
npm run smoke:sepolia      # Full flow test on Sepolia
npm run e2e:sponsor        # Paymaster sponsorship test
npm run e2e:bundler        # Bundler integration test
npm run policy:check       # Policy verification
```

### Configuration Tests

**File**: `test/config-sanity.test.js`

Validates environment and configuration integrity.

### All Tests

```bash
npm run test:all           # Complete test suite
npm run test:phase5        # Phase 5 tests
npm run test:phase6        # Phase 6 tests
npm run self:check         # Self-check validation
npm run healthcheck        # Health check
```

### AI Test Guidelines

1. Focus on invariants (what must always be true)
2. Test edge cases (zero values, max values, empty arrays)
3. Test error conditions (invalid signatures, expired deadlines)
4. ⛔ Never remove existing test coverage
5. Run full test suite before committing

---

## 12. Rules for AI Agents (Critical)

### ⛔ AI MUST NEVER

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

### ✅ AI MAY SAFELY

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

### ✅ AI SHOULD ALWAYS

1. **Read AGENTS.md completely** before any modification
2. **Run self-check scripts** before and after changes
3. **Verify contract ABI compatibility** when touching on-chain code
4. **Test on Sepolia first** before mainnet changes
5. **Preserve backward compatibility** for APIs
6. **Consider Mini App constraints** (no browser APIs, limited storage)
7. **Ask for clarification** before security-sensitive changes

---

## 13. AI Quickstart Checklist

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

## 14. Key File Quick Reference

| File | Lines | Purpose | Risk |
|------|-------|---------|------|
| `contracts/BaseManRegistry.sol` | ~200 | On-chain registry | 🔴 CRITICAL |
| `api/score-sign.js` | ~230 | Signature generation | 🔴 HIGH |
| `api/paymaster-proxy.js` | ~470 | Paymaster validation | 🔴 HIGH |
| `api/_lib/registry.js` | ~230 | EIP-712 domain config | 🔴 HIGH |
| `api/leaderboard.js` | ~1,300 | Leaderboard + profiles | 🟡 MEDIUM |
| `src/onchain-client.js` | ~400 | Client integration | 🔴 HIGH |
| `src/onchain/score-service.js` | ~300 | Score submission | 🔴 HIGH |
| `test/BaseManRegistry.test.js` | ~150 | Contract tests | 🟡 MEDIUM |
| `pacman.js` | ~14,000 | Game engine bundle | 🟢 LOW |
| `package.json` | ~120 | Dependencies/scripts | 🟢 LOW |

---

## 15. Emergency Procedures

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
5. Check Redis connection for profile caching

### Contract Emergency

```solidity
// Owner-only emergency functions
pause()   // Stops all submissions
unpause() // Resumes operations
```

### Debug Commands

```bash
# Verify environment
npm run self:check
npm run healthcheck

# Test endpoints
curl -sS http://localhost:5173/.well-known/farcaster.json
curl -sS http://localhost:5173/api/leaderboard?limit=5&debug=1

# Test score signing
curl -X POST http://localhost:5173/api/score-sign \
  -H "Content-Type: application/json" \
  -d '{"playerAddress":"0x...","score":1000}'
```

---

## Resources

- **CLAUDE.md**: Project development guide (human-focused)
- **README.md**: Full project documentation
- **docs/DEVELOPMENT_GUIDE.md**: Setup workflow
- **docs/SCORE_SUBMISSION_FLOW.md**: Technical flow diagram
- **docs/CONTRACT_INTERACTION_GUIDE.md**: Contract details
- **docs/DEBUG_GUIDE.md**: Troubleshooting

---

*This document is the master specification for AI agents operating on the BaseMan codebase. Last synchronized with README.md on December 2024.*
